---
copyright:
  years: 2018
lastupdated: "2018-06-05"

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

Generally, Kubernetes cluster ensures containerized appliation HA with multiple workers grouped within cluster. When certain worker does not work, the other workers within the same cluster will serve the internet requests which is apprarent to users. Furthermore, to provide HA at zone level, workers can be put in multiple zones within the same region but eventually you would want more regions. This is not only for resiliency but also serving the requests closer to the users. 

This tutorial highlights how Cloud Internet Services can be integrated with Kubernetes clusters to deliver a secure and resilient solution across multiple regions.  

* IBM Cloud Internet Services(CIS) is a uniform platform to configure and manage the Domain Name System (DNS), Global Load Balancing (GLB), Web Application Firewall (WAF), and protection against Distributed Denial of Service (DDoS) for internet applications.  

* {{site.data.keyword.containershort}}(IKS) delivers powerful tools by combining Docker and Kubernetes technologies, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

## Objectives
{: #objectives}

* Use CIS as global load-balancer with multiple cluster deployment
  * use GLB to load balance between clusters
  * use GLB Geo targets to send users to the closest cluster

* Use CIS in front of a kubernetes cluster for application to implement
  * content caching with CDN
  * and security with DDoS, WAF and Page Rule

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* IBM Cloud [Internet services](https://console.bluemix.net/catalog/services/internet-services)
* [{{site.data.keyword.registrylong_notm}}](https://console.bluemix.net/containers-kubernetes/launchRegistryView)
* [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution32-multi-region-k8s-cis/Architecture.png)
</p>

1. The developer builds Docker images for the application.
2. The images are pushed to {{site.data.keyword.registryshort_notm}} in the US and UK regions.
3. The application is deployed to Kubernetes clusters in both regions.
4. End-users access the application. 
5. Cloud Internet Services is configured to intercept requests to the application and to spread the load across the clusters. In addition, DDoS Protection and Web Application Firewall are enabled to protect the application from common threats. Optionally assets like images, CSS files are cached.

## Before you begin
{: #prereqs}

* [Install Git](https://git-scm.com/)
* [Install {{site.data.keyword.Bluemix_notm}} CLI](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)
* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, ibmcloud cli and required plug-ins
* [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://console.bluemix.net/docs/services/Registry/registry_setup_cli_namespace.html)
* [Understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/)


## Create Kubernetes clusters in multiple regions
{: #create_clusters}

This tutorial simulates a Kubernetes application deployed to clusters in multiple regions. In this section, you will create two clusters, one in the United Kingdom region and one in the US South region. 

To create a first cluster in the UK region:
1. Select **{{site.data.keyword.containershort_notm}}** from the [{{site.data.keyword.Bluemix}} catalog](https://console.bluemix.net/containers-kubernetes/catalog/cluster/create)
1. Set **Region** to **United Kingdom**
1. Select **Standard** cluster
1. Select one or more zones as **Location**
1. Set **Machine type** to the smallest available - **2 CPUs** and **4GB RAM** is sufficient for this tutorial
1. Use **2** worker nodes
1. Set **Cluster name** to **my-uk-cluster**. Use the naming pattern *`my-<region>-cluster`* to be consistent with this tutorial

Repeat the steps above to create a cluster in the US South region. Name the cluster **my-us-cluster**.

While the clusters are getting ready, you are going to prepare the application.

## Build and push the application Docker images

In this section, you will build and push Docker images to the {{site.data.keyword.registryshort_notm}} in the United Kingdom and US South regions.

### Create a namespace in {{site.data.keyword.registryshort_notm}}

1. Target the {{site.data.keyword.Bluemix_notm}} CLI to the United Kingdom region
   ```bash
   ibmcloud target -r eu-gb
   ```
   {: pre}
1. Create a namespace for the application
   ```bash
   ibmcloud cr namespace-add <your_namespace>
   ```
   {: pre}

Repeat the steps with the US South (us-south) region as target.

If you already have namespaces in both regions, you can also reuse them. You can list existing namespaces with `ibmcloud cr namespaces`.
{: tip}

### Build the application

This step builds the application into a Docker image. It is a simple HelloWorld app.

1. Clone the source code for the [Hello world app](https://github.com/IBM/container-service-getting-started-wt){:new_windows} to your user home directory. The repository contains different versions of a similar app in folders that each start with Lab.
   ```bash
   git clone https://github.com/IBM/container-service-getting-started-wt.git
   ```
   {: pre}
1. Navigate to the `Lab 1` directory.
   ```bash
   cd 'container-service-getting-started-wt/Lab 1'
   ```
   {: pre}
1. Build a Docker image that includes the app files of the `Lab 1` directory.
   ```bash
   docker build --tag multi-region-hello-world:1 .
   ```
   {: pre}

Prepare the image to be pushed to the regional registry:
1. for United Kingdom:
   ```bash
   docker tag multi-region-hello-world:1 registry.eu-gb.bluemix.net/<your_United-Kingdom_namespace>/hello-world:1
   ```
   {: pre}
1. for US South:
   ```bash
   docker tag multi-region-hello-world:1 registry.ng.bluemix.net/<your_US-South_namespace>/hello-world:1
   ```
   {: pre}

### Push the images to the regional registries

1. Log in the {{site.data.keyword.registryshort_notm}} in the United Kingdom region
   ```bash
   ibmcloud target -r eu-gb
   ```
   {: pre}
1. Ensure your local Docker engine can push to the United Kingdom registry
   ```bash
   ibmcloud cr login
   ```
   {: pre}
1. Push the image
   ```bash
   docker push registry.eu-gb.bluemix.net/<your_United-Kingdom_namespace>/hello-world:1
   ```
   {: pre}
1. Log in the {{site.data.keyword.registryshort_notm}} in the US South region
   ```bash
   ibmcloud target -r us-south
   ```
   {: pre}
1. Ensure your local Docker engine can push to the US South registry
   ```bash
   ibmcloud cr login
   ```
   {: pre}
1. Push the image
   ```bash
   docker push registry.ng.bluemix.net/<your_US-South_namespace>/hello-world:1
   ```
   {: pre}

## Deploy the application to the Kubernetes clusters

At that stage, the two clusters should be ready. You can check their status in the [{{site.data.keyword.containershort_notm}}
](https://console.bluemix.net/containers-kubernetes/clusters) console.

1. Target the United Kingdom region:
   ```bash
   ibmcloud target -r eu-gb
   ```
   {: pre}
1. Retrieve the configuration of the cluster:
   ```bash
   ibmcloud cs cluster-config <uk-cluster-name>
   ```
   {: pre}
1. Copy and paste the output to set the KUBECONFIG environment variable
1. Run the application in the cluster with two replicas:
   ```bash
   kubectl run hello-world-deployment --image=registry.eu-gb.bluemix.net/<your_United-Kingdom_namespace>/hello-world:1 --replicas=2
   ```
   {: pre}
   Example output: `deployment "hello-world-deployment" created`
1. Make the application accessible by exposing the deployment as a NodePort service.
   ```bash
   kubectl expose deployment/hello-world-deployment --type=NodePort --port=80 --name=hello-world-service --target-port=8080
   ```
   {: pre}
   It returns message like `service "hello-world-service" exposed`.

Repeat the steps to deploy the application in the US South region (*us-south* and *registry.ng.bluemix.net*).

## Configure multi-region load-balancing

### Create Instance of IBM Cloud Internet Services and register the custom domain
{: #create_cis_instance}

Cloud Internet Services(CIS) is one stop-shop service providing GLB, Caching, WAF/Page rule to secure your applications when ensurig the reliability and performace for your Cloud applicatios. 1st step to create instance per domain and then register the domain.

1. Buy a domain from a registrar such as [http://godaddy.com](http://godaddy.com).
2. Navigate to the [Internet Services](https://console.bluemix.net/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
2. Enter a service name, and click **Create** to create an instance of the service.
3. When the service instance is provisioned, set your domain name and click **Add domain**.
4. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
5. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

    When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <your_domain_name> ns` command to verify that the IBM Cloud name servers have taken effect.
    {:tip}

### Configure CIS GLB for clusters and create Kubenetes Cluster Ingress Resource per region
{: #LB_setting}

For now, your applications have been running within the kubernetes clusters across different regions. To expose its public access of cluster and route access to corresponding application, Ingress resource will be created and configured. Either with Kubernetes cluster's ALB public IP or its Ingress Sub-domain, Global Load Balancer (GLB) in IBM Cloud Internet Services will be created to manage the traffic across multiple regions. The GLB utilizes an origin pool which allows for the traffic to be distributed to multiple origins. This way, it provides high availability and ensures the reliability of the applications cross multiple regions.

### Take notes of Kubernetes Cluster ALB IP, Ingress Sub-domain
{: #CSALB_IP_subdomain}
1. When Kubernetes cluster gets created, its Application Load Balancer(ALB) public IP, Sub-domain are generated automatically. Take notes of IP and sub-domain for each clusters. Kubernetes cluster name can be got via `ibmcloud cs clusters`
    ```bash
    ibmcloud cs albs -cluster <cluster-name>
    ibmcloud cs cluster-get <cluster-name>
    ```

### Create health check for the GLB.
1. In the Cloud Internet Services application, navigate to **Reliability** > **Global Load Balancer**, and at the bottom of the page, click **Create health check**.
2. Enter "/" as the path to monitor and select a type (HTTP or HTTPS). Typically you can create a dedicated health endpoint. Click **Provision 1 Instance**.

    The path can be specified per your application and requirement.{:tip}

### Define origin pools with needed origin.
1. Click **Create Pool**.
2. Set **name** to _`iks_uk_pool`_ for the pool, select the health check that you've just created, and a region that is close to the region of your kubernetes cluster.
3. Set **Origin Name** to _`iks_uk_pool`_.
4. Set **Origin Address** to `my_uk_cluster.eu-gb.containers.appdomain.cloud` which is UK cluster sub-domain or its ALB IP address.
5. Click **Provision 1 Instance**.
After the 1st pool _`iks_uk_pool`_ created, repeat above five steps by set right pool name, **Original Name** and **Original Address** so to create other two pools, naming _`iks_us_pool`_, _`iks_all_origins`_ accordingly.
    The origins in the same pool get the forwarded requests in Round-robin way.{:tip}

### With origin pools defined to complete GLB creation and configuration
1. Click **Create Load Balancer**.
2. Enter a name under **Balancer hostname** for the Global Load Balancer. This name will also be part of your universal application URL (`http://<glb_name>.<your_domain_name>`), regardless of the region.
3. Click **Add pool** under **Default origin pools** and select the origin pool that you have just created _`iks_all_origins`_.
4. Expand section of **Configure geo routes(optional)**, click **Add route**, select a region and click **Add**, then click **Add pool** to add origin pool for this Region. Region refers to where requests submmited and origin pool includes the application to serve the requests. For this tutorial,
    * add route for region *Northeast Asia* and regionn *Southeast Asia* with origin pointing to UK cluster _`iks_uk_pool`_. The requests submmited from Asia will be routed to the nearest applications running in region United Kingdom.
    * add route for region *Eastern North America* and regionn *Western North America* with origin pointing to US cluster _`iks_us_pool`_. The requests submmited from North America will be routed to the nearest applications running in region US South.
    * if request submitted not matching any definend region in route, it will be distributed to origins defined in **Default origin pools**.
5. Click **Provision 1 Instance**.

For now, GLB is configured to distribute the requests to corresponding clusters across multiple regions via origin pools. According to geo routes, requests will be routed to the closest region, e.g. for requests submmited in Asia, those will be routed to the closest `United Kingdom` region.

### Create Ingress Resource for Kubernetes clusters per region
* Create Ingress yaml file
    1. input Ingress Resource **name**
    2. specify **host** with GLB url created above
    3. enter app path of the request
        *  **serviceName** - containerized app name, get it via `kubectl get services`
        *  **servicePort** - the port to access your specified path of app, get it via `kubectl get services`
    ```bash
   apiVersion: extensions/v1beta1
   kind: Ingress
    metadata:
      name: ing-uk-hui
    spec:
      rules:
        - host: glb-helloworld.mycistest4.com
          http:
            paths:
            - path: /
              backend:
                serviceName: <application-service-name>
                servicePort: 80
    ```
* Create Ingress resource for cluster. Ensure IBM Cloud CLI context for your cluster{:tip}
    ```bash
    kubectl create -f <Ingress_resource_filename>.yaml
    ```
    It returns message like `ingress.extention "ingress_name" created`
* List Ingress resource created, newly created ingress would be shown
    ```bash
    kubectl get ingress
    ```
Repeat above steps to create Ingress for other region cluster, e.g. cluster in region `US South`

**`CHECKPOINT 3`** - **Congratulations!** For now, CIS GLB is configured before Kubernetes cluster across multiple-regions (for this example, *`United Kindom`* and *`US South`*). So the requests would be routed to cluster according to location of request and GLB pool setting(geo route and default pools) and then to application per rule defined in Kubernetes cluster ingress resource.

## Secure the application
{: #secure_via_CIS}
Besides GLB to ensure across-region reliability for Kubernetes cluster, CIS also provides needed performance for internet applications via caching option. Along the way, secure internet access to application via Web Application Firewall(WAF) and page rule setting, protect the application from DDoS attack.

### Enable proxy mode providing DDoS protection and caching
{: #proxy_setting}
A distributed denial of service ([DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack)) attack is a malicious attempt to disrupt normal traffic of a server, service, or network by overwhelming the target or its surrounding infrastructure with a flood of internet traffic.

Toggle ON proxy besides CIS GLB, it enables DDoS protection and caching for GLB so to applications defined in Kubernetes cluster. Use `dig _<glb_name>.<domain_name>`, original IP address is hid. All of your clients connect to CIS proxies.
   ![CIS Proxy Toggle ON](images/solution32-multi-region-k8s-cis/cis.proxy.png)

Bascially, for caching, the edge services are enabled with proxy mode. The content(static web content) will be caching at edge closest to visitor which apprarent to user. While for specific caching setting to certain URL, e.g. edge cache TTL, it can be set via **Page Rule** in following section. In the meanwhile, some general caching setting can be configured -
1. In Cloud Internet Services, navigate to **Performance** > **Caching**
2. **Purge Cache**, to get the latest update of application, choose **Single single files** for certain URL or **Purge All**
3. **Serve Stale Content**, toggle ON so it provides cached content to user when origin not available.
4. **Caching Level**, select `No query string`, cached content returns for the requests without query string.  
5. **Browser Expiration**, select `1 day`, the cached content would be stored in user's broswer within 1 day ensuring the access performance while keeping relative up-to date content. It can be specified per requirement.

**`CHECKPOINT 4`** - DDoS protection and cachinng are enabled for application runnning in cluster. After proxy is enabled and when access submmited via GLB URL plus application path, similar page like below shown which tell all access to your application would be under DDoS protection.    ![verifying - DDoS protection](images/solution32-multi-region-k8s-cis/cis-DDoS.png)

### Define WAF in CIS to secure the internet access
The web application firewall(WAF) protects web application against ISO Layer 7 attacks. Usually, it is combined with grouped rule-sets, these rule-sets aim to protect against vulnerabilities in the application by filtering out malicious traffic.
1. In the Cloud Internet Services application, navigate to **Security**, on the Security **Manage** page > **Web Application Firewall** section
2. Click **View OWASP Rule Set**, in page **OWASP Core rule set**, OWASP rules have been listed in the table. Each rule set can be disabled or enabled per your application. When enabled, if incomimg request triggers the rule, the threat score will be increased and finally reflects to **Sensitivity**, then trigger **Action** defined. For this tutorial -
    * Leave default OWASP rule sets as it is
    * Set **Sensitivity** to `Low`
    * Set **Action** to `Simulate` to log all the events
    * Click **Back to Security**
3. Click **View CIS Rule Set** besides **View OWASP Rule Set**, **CIS Rule Set** page shows with the rules built with technology hosting website. Per type of web application, enable rule sets and specify the **Mode** when needed. For this tutorial, ensure **IBM Specials** is enabled
    * Toggle ON(Enable) for **IBM Specials**
    * Expand it, scroll down to the last several rows with `SQLi` included in the description(e.g. starting from ID `100008`), notice all are blocked as **Default Mode** which protect application from SQL injection request.

### Configure Page Rules in CIS for certain URL to ensure performance, security and reliability
Page rule is defined and functions to specific application URL referencing with domain. Like mentioned above, CIS is one-stop shop providing reliable, permant, secure ensurance for internet application and website. It provides page rules from all these three dimentions as well. For this tutorial -
1. In the Cloud Internet Services application, navigate to **Performance** > **Page Rules**
2. Click **Create rule**, the button right above the rules table
3. Section `Page Rule`, specify **URL match** to URL `/`
4. Section `Rule Behavior`, select **Web Application Firewall** under **Security**, toggle ON for **Set as**
5. Click **Add Setting**, select **TLS** under **Performance**, choose **Client-to-edge**, this provides the encrypted access via TLS between requester and GLB(or proxy) server.
6. Click **Add Setting**, select **Cache Level** under **Performance**, choose **Cache everything**
7. Click **Add Setting**, select **Edge Cache TTL** under **Performance**, select **1 day** which content will be cached at edge server for 1 day the fetch content to sync with content on origins.

[Best practice to secure traffic and internet application via CIS](https://console.bluemix.net/docs/infrastructure/cis/managing-for-security.html#manage-your-ibm-cis-for-optimal-security)

## Remove resources
{:removeresources}

Remove Kubernetes Cluster resources
* remove ingress
* remove pods
* remove service
* remove worknodes
* remove clusters

Remove CIS resources
* remove GLB
* remove origin pool
* remove health check

## Related content
{:related}

* IBM Cloud [Internet Services](https://console.bluemix.net/docs/infrastructure/cis/getting-started.html#getting-started-with-ibm-cloud-internet-services-cis-)
* [Manage your IBM CIS for optimal security](https://console.bluemix.net/docs/infrastructure/cis/managing-for-security.html#best-practice-2-configure-your-security-level-selectively)
* [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/docs/containers/cs_planning.html#cs_planning)
* [{{site.data.keyword.registrylong_notm}} Basic](https://console.bluemix.net/docs/services/Registry/registry_overview.html#registry_planning)
* [Deploying single instance apps to Kubernetes clusters](https://console.bluemix.net/docs/containers/cs_tutorials_apps.html#cs_apps_tutorial_lesson1)