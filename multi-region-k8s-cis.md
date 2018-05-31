---
copyright:
  years: 2018
lastupdated: "2018-05-29"

---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Secure and resilient multi-region Kubernetes clusters with Cloud Internet Services
This tutorial highlights how Cloud Internet Services can be integrated with Kubernetes clusters to deliver a secure and resilient solution across multiple regions.  

* IBM Cloud Internet Services(CIS) is a uniform platform to configure and manage the Domain Name System (DNS), Global Load Balancing (GLB), Web Application Firewall (WAF), and protection against Distributed Denial of Service (DDoS) for internet applications.  

* IBM Cloud Kubernetes Service(IKS) delivers powerful tools by combining Docker and Kubernetes technologies, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

## Objectives
{: #objectives}

* Use CIS as global load-balancer with multiple cluster deployment
  * use GLB to load balance between clusters
  * use GLB Geo targets to send users to the closest cluster

* Use CIS in front of a kubernetes cluster to implement 
  * content caching with CDN
  * and security with DDoS, WAF

## Services used
{: #services}


This tutorial uses the following runtimes and services:
* IBM Cloud [Internet services](https://console.bluemix.net/catalog/services/internet-services)
* [{{site.data.keyword.registrylong_notm}}](https://console.bluemix.net/containers-kubernetes/launchRegistryView)
* [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)

This tutorial would incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/other/cis-iks.Architecture.png)
</p>

First of all, create IKS clusters across multiple regions and instance of CIS, then -

1. The developer builds the application produces a Docker container image and pushes the image to IBM Container Registry

2. Deployed image from IBM Container Registry to corresponding clusters in {{site.data.keyword.containershort_notm}} 

3. Run application, scale up and expose service for access

4. Create CIS GLB and IKS Ingress so the requests can be distributed to application hosted among different multi-region clusters

5. Enable DDoS protection and caching service

## Before you begin
{: #prereqs}

* [Install Git](https://git-scm.com/)
* [Install {{site.data.keyword.Bluemix_notm}} CLI](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)
* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins
* [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://console.bluemix.net/docs/services/Registry/registry_setup_cli_namespace.html)
* [Understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

## Create Kubernetes clusters
{: #create_clusters}

### Create Kubernetes cluster in one region, e.g.`United Kingdom`
1. Create **Containers in Kubernetes Clusters** from the [{{site.data.keyword.Bluemix}} catalog](https://console.bluemix.net/containers-kubernetes/catalog/cluster/create) and choose the **Standard** cluster.

   ![Kubernetes Cluster Creation on IBM Cloud](images/other/IKS.Cluster.Creation.GUI.png)
2. Select region `United Kingdom`. For convenience, use the name `my-<region>-cluster` to be consistent with this tutorial, specify \<region> to match with region selected, e.g. *uk*
3. The smallest **Machine type** with 2 **CPUs** and 4 **GB RAM** is sufficient for this tutorial. Select 2 **Worker node** and leave all other options set to defaults. Click **Create Cluster**.
4. Check the status of your **Cluster** and **Worker Node** and wait for them to be **ready**.

### Create Kubernetes cluster in other regions, e.g.`US South`
* Repeat steps above for the other region you'd like to have cluster by selecting different **region**, e.g. `US South`, specify cluster name `my-<region>-cluster`, \<region> could be *us*

**NOTE:** Do not proceed until your workers are ready.

## Create Instance of IBM Cloud Internet Services and register the custom domain 
{: #domain_cis}

Cloud Internet Servcies(CIS) is one stop-shop service providing GLB, Caching, WAF/Page rule to secure your applications when ensurig the reliability and performace for your Cloud applicatios. 1st step to create instance per domain and then register the domain.

1. Buy a domain from a registrar such as [http://godaddy.com](http://godaddy.com).
2. Navigate to the [Internet Services](https://console.bluemix.net/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog. 
2. Enter a service name, and click **Create** to create an instance of the service.
3. When the service instance is provisioned, set your domain name and click **Add domain**.
4. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
5. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.
  
    When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <your_domain_name> ns` command to verify that the IBM Cloud name servers have taken effect.
    {:tip}

## Target IBM Cloud CLI for your cluster and login IBM Cloud Registry correspondingnly
{: #prep_steps}

IBM Cloud CLI is working environment for Kuberetes cluster, different context of CLI for different Kuberetes cluster. Ensure to work with the resources within cluster context for specific Kubernetes cluster, such as deployment, services, pod, etc..

**Notes:** Don't switch IBM Cloud CLI context until needed resources configured for your specific Kubernetes cluster. Since there are different clusters across multiple regions, repeat this step for clusters one by one which contain the applications being as the target for distributed requests from load balancer. 

### Login IBM Cloud CLI and Set context for kubenetes cluster in your CLI
1. Get the command to set the environment variable and download the Kubernetes configuration files.
    ```bash
    bx cs cluster-config <cluster_name_or_ID>
    ```
    {: pre}
2. Copy and paste the output to set the KUBECONFIG environment variable.
    ```bash
    export KUBECONFIG=/Users/<user_name>/.bluemix/plugins/container-service/clusters/<cluster_name>/kube-config-<location>-<cluster_name>.yml
    ```
    {: pre}
3. Check cluster region and specify it via `bx cs region-set` when needed
### Login IBM Container Registry and Create Namespace
1. Login to IBM Container Registry CLI 
    ```bash
    bx cr login
    ```
    {: pre}
2. Check Container Registry Region and ensure it is the same as the one of cluster in previous step via IBM Cloud CLI. If not matching, specify Container Registry region via `bx cr region-set`. Take note for the **region** which will be used for following steps.
3. Container Registry is the repository containing the Docker images for containerized applications in Kubernetes cluster, create custom namespace per your requirement. 
    ```bash
    bx cr namespace-add <your_namespace>
    ```
    {: pre}
    Please be aware that following steps need to run agaist the same namespace. Take note of **namespace** via `br cr namespaces` 

## Build and Deploy application to Kubernetes Cluster
{: #run_app_in_kubernete_cluster}

### Build application producing Docker image and deploy it to Kubernete cluster
Refer step 1/2 and step6/7/8 of tutorial [Deploying single instance apps to Kubernetes clusters](https://console.bluemix.net/docs/containers/cs_tutorials_apps.html#cs_apps_tutorial_lesson1) to push Docker image into IBM Cloud Registry.  
1. Clone the source code for the [Hello world app](https://github.com/IBM/container-service-getting-started-wt) to your user home directory. The repository contains different versions of a similar app in folders that each start with Lab.
    ```bash
    git clone https://github.com/IBM/container-service-getting-started-wt.git
   ```
   {: pre} 
2. Navigate to the `Lab 1` directory.
    ```bash
    cd 'container-service-getting-started-wt/Lab 1'
    ```
    {: pre}
3. Start Docker.
    * If you are using Docker Community Edition, no action is needed.
    * If you are using Linux, follow the [Docker documentation](https://docs.docker.com/config/daemon/) to find instructions about how to start Docker depending on the Linux distribution that you use.
    * If you are using Docker Toolbox on Windows or OSX, you can use the Docker Quickstart Terminal, which starts Docker for you. Use the Docker Quickstart Terminal for the next few steps to run the Docker commands and then switch back to the CLI where you set the KUBECONFIG session variable.
4. Build a Docker image that includes the app files of the `Lab 1` directory. If you need to make a change to the app in the future, repeat these steps to create another version of the image. 
    ```bash
    docker build --tag registry.<region>.bluemix.net/<namespace>/hello-world:1 .
    ```
    {: pre}
    Ensure the period `.` at the end of the command.{:tip} 
5. Push docker image built above to Container Registry. It will be referred by containerized application in pods. Be sure login CR before push via `bx cr login`.
    ```bash
    docker push registry.<region>.bluemix.net/<namespace>/hello-world:1
    ```
    {:pre}
6. Deployments are used to manage pods, which include containerized instances of an application. The following command deploys the app in single pod. For the purposes of this tutorial, the deployment is named hello-world-deployment, but you can give it any name that you want. If you used the Docker Quickstart terminal to run Docker commands, be sure that you switch back to the CLI that you used to set the KUBECONFIG session variable.
    ```bash
    kubectl run hello-world-deployment --image=registry.<region>.bluemix.net/<namespace>/hello-world:1
    ```
    {: pre}
      Example output: `deployment "hello-world-deployment" created`

### Scale up and expose service for access
1. A `replica` is how Kubernetes accomplishes scaling out a deployment. A replica is a copy of a pod that already contains a running service. By having multiple replicas of a pod, you can ensure your deployment has the available resources to handle increasing load on your application.
    ```bash
    kubectl scale deployment/hello-world-deployment --replicas=3
    ```
     {: pre}
2. Make the app accessible by exposing the deployment as a NodePort service. 
    ```bash
    kubectl expose deployment/hello-world-deployment --type=NodePort --port=80 --name=hello-world-service --target-port=8080
    ```
    {: pre}

## Create Kubenetes Cluster Ingress Resource and CIS GLB
{: #LB_setting}

For now, your applications have been running within the kubernetes clusters across different regions. To expose its public access of cluster and route access to corresponding application, Ingress resource will be created and configured. Either with Kubernetes cluster's ALB public IP or its Ingress Sub-domain, Global Load Balancer (GLB) in IBM Cloud Internet Services will be created to manage the traffic across multiple regions. The GLB utilizes an origin pool which allows for the traffic to be distributed to multiple origins. This way, it provides high availability and ensures the reliability of the applications cross multiple regions.

### Take notes of Kubernetes Cluster ALB IP, Ingress Sub-domain 
1. When Kubernetes cluster gets created, its Application Load Balancer(ALB) public IP, Sub-domain are generated automatically. Take notes of IP and sub-domain for each clusters. Kubernetes cluster name can be got via `bx cs clusters`
    ```bash
    bx cs albs -cluster <cluster-name>
    bx cs cluster-get <cluster-name>
    ```

### Create Global Load Balancer of Cloud Internet Services
{: #add_glb}

#### Before creating a GLB, create a health check for the GLB.

1. In the Cloud Internet Services application, navigate to **Reliability** > **Global Load Balancer**, and at the bottom of the page, click **Create health check**.
2. Enter the path that you want to monitor, for example, `/`, and select a type (HTTP or HTTPS). Typically you can create a dedicated health endpoint. Click **Provision 1 Instance**.

#### After that, create an origin pool with needed origins.

1. Click **Create Pool**.
2. Enter a name for the pool, select the health check that you've just created, and a region that is close to the region of your kubernetes cluster.
3. Enter a name for the first origin, put either ALB IP address of Kubernetes cluster or sub-domain for the application in certain region, e.g. <cluster-name>-id.<region>.containers.appdomain.cloud
4. Similarly, add other origins with corresponding ALB public IP address or sub-domain of Kubernetes cluster of different regions.
5. Click **Provision 1 Instance**.

#### Create a Global Load Balancer (GLB). 

1. Click **Create Load Balancer**. 
2. Enter a name for the Global Load Balancer. This name will also be part of your universal application URL (`http://<glb_name>.<your_domain_name>`), regardless of the region. 
3. Click **Add pool** and select the origin pool that you have just created. 
4. Expand section of **Configure geo routes(optional)**, click **Add route**, select a region and click **Add**, then click **Add pool** to add origin pool for this Region. Region refers to where requests submmited and origin pool includes the application to serve the requests.{:tip}
5. Click **Provision 1 Instance**.


### Create Ingress Resource for Kubernets clusters per region
* _in working_ 


## Remove resources
{:removeresources}

* _In working - Steps to take to remove the resources created in this tutorial_

## Related content
{:related}_
* IBM Cloud [Internet Services](https://console.bluemix.net/docs/infrastructure/cis/getting-started.html#getting-started-with-ibm-cloud-internet-services-cis-)
* [IBM Cloud Kubernetes Service](https://console.bluemix.net/docs/containers/cs_planning.html#cs_planning)
* [IBM Cloud Container Registry Basic](https://console.bluemix.net/docs/services/Registry/registry_overview.html#registry_planning)
