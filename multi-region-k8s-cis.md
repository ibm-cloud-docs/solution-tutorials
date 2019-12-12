---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2019-08-12"
lasttested: "2019-06-03"
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

# Resilient and secure multi-region Kubernetes clusters with {{site.data.keyword.cis_full_notm}}
{: #multi-region-k8s-cis}

Users are less likely to experience downtime when an application is designed with resiliency in mind. When implementing a solution with {{site.data.keyword.containershort_notm}}, you benefit from built-in capabilities, like load balancing and isolation, increased resiliency against potential failures with hosts, networks, or apps. By creating multiple clusters and if an outage occurs with one cluster, users can still access an app that is also deployed in another cluster. With multiple clusters in different locations, users can also access the closest cluster and reduce network latency. For additional resiliency, you have the option to also select the multi-zone clusters, meaning your nodes are deployed across multiple zones within a location.

This tutorial highlights how {{site.data.keyword.cis_short}}, a uniform platform to configure and manage the Domain Name System (DNS), Global Load Balancing (GLB), Web Application Firewall (WAF), and protection against Distributed Denial of Service (DDoS) for internet applications, can be integrated with Kubernetes clusters to support this scenario and to deliver a secure and resilient solution across multiple locations.

## Objectives
{: #objectives}

* Deploy an application on multiple Kubernetes clusters in different locations.
* Distribute traffic across multiple clusters with a Global Load Balancer.
* Route users to the closest cluster.
* Protect your application from security threats.
* Increase application performance with caching.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services)
* [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
* [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">
  ![Architecture](images/solution32-multi-region-k8s-cis/Architecture.png)
</p>

1. The developer builds Docker images for the application.
2. The images are pushed to {{site.data.keyword.registryshort_notm}} in Dallas and London.
3. The application is deployed to Kubernetes clusters in both locations.
4. End-users access the application.
5. {{site.data.keyword.cis_full_notm}} is configured to intercept requests to the application and to distribute the load across the clusters. In addition, DDoS Protection and Web Application Firewall are enabled to protect the application from common threats. Optionally assets like images, CSS files are cached.

## Before you begin
{: #prereqs}

* {{site.data.keyword.cis_full_notm}} requires you to own a custom domain so you can configure the DNS for this domain to point to {{site.data.keyword.cis_full_notm}} name servers.
* [Install Git](https://git-scm.com/).
* [Install {{site.data.keyword.Bluemix_notm}} CLI](/docs/cli?topic=cloud-cli-install-ibmcloud-cli).
* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, ibmcloud cli and required plug-ins.
* [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://{DomainName}/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_setup_cli_namespace).
* [Understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/).

## Deploy an application to one location

This tutorial deploys a Kubernetes application to clusters in multiple locations. You will start with one location, Dallas, and then repeat these steps for London.

### Create a Kubernetes cluster
A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial.


When creating the Kubernetes cluster below:
1. Set **Cluster name** to **my-us-cluster**.
1. Locate in **North America** and **Dallas**

Create the Kubernetes cluster:
- For Kubernetes on VPC infrastructure, you are required to create a VPC and subnet(s) prior to creating the Kubernetes cluster. You may follow the instructions provided under the [Creating a standard VPC Gen 1 compute cluster in the console](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_vpc_ui). 
- For Kubernetes on Classic infrastructure follow the [Creating a standard classic cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_standard) instructions. 
{: #create_cluster}


While the cluster is getting ready, you are going to prepare the application.

### Create a namespace in {{site.data.keyword.registryshort_notm}}
{: #create_namespace}

1. Target the {{site.data.keyword.Bluemix_notm}} CLI to Dallas.
   ```bash
   ibmcloud target -r us-south
   ```
   {: pre}
2. Create a namespace for the application.
   ```bash
   MYNAMESPACE=<your_namespace>
   ibmcloud cr namespace-add $MYNAMESPACE
   ```
   {: pre}

You can also reuse an existing namespace if you have one in the location. You can list existing namespaces with `ibmcloud cr namespaces`.
{: tip}

### Build the application
{: #build_application}

This step builds the application into a Docker image. You can skip this step if you are configuring the second cluster. It is a simple HelloWorld app.

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

### Build and push a Docker image to the location-specific registry
{: #push_image}

1. Ensure your local Docker engine can push to registry in Dallas.
   ```bash
   ibmcloud cr login
   ```
   {: pre}

2. Build and push the image.
   ```bash
   ibmcloud cr build -t us.icr.io/$MYNAMESPACE/multi-region-hello-world:1 .
   ```
   {: pre}

  The above command builds the Docker image, tags it and pushes it to the registry. You could achieve the same thing using traditional Docker CLI commands: (a) `docker build --tag us.icr.io/$MYNAMESPACE/multi-region-hello-world:1 .` (b) `docker push us.icr.io/$MYNAMESPACE/multi-region-hello-world:1`.
  {: tip}

### Deploy the application to the Kubernetes cluster
{: #deploy_application}

The cluster should be ready. You can check its status in the [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/clusters) console.

1. Gain access to your cluster as described on the Access tab of your cluster.

   ```bash
   kubectl create deploy hello-world-deployment --image=us.icr.io/$MYNAMESPACE/multi-region-hello-world:1
   ```
   {: pre}
   Example output: `deployment "hello-world-deployment" created`.
1. Make the application accessible within the cluster

   ```bash
   kubectl expose deployment/hello-world-deployment --type=ClusterIP --port=80 --name=hello-world-service --target-port=8080
   ```
   {: pre}
   It returns message like `service "hello-world-service" exposed`.

  ```bash
  kubectl get services
  ```
  {: pre}

1. Run the application in the cluster with two replicas:
   ```bash
   kubectl scale deployment hello-world-deployment --replicas=2
   ```
   {: pre}

1. You can check the status of the deployment with the following command:
   ```bash
   kubectl get pods
   ```
   {: pre}

### Get the domain name and IP address assigned to the cluster
{: #CSALB_IP_subdomain}

When a Kubernetes cluster is created, it gets assigned an Ingress subdomain (eg. *my-us-cluster.us-south.containers.appdomain.cloud*) and a public Application Load Balancer IP address.

1. Retrieve the Ingress subdomain of the cluster:
   ```bash
   MYCLUSTER=my-us-cluster
   ibmcloud ks cluster-get $MYCLUSTER
   ```
   {: pre}
   Look for the `Ingress Subdomain` value.
1. Make note of this information for a later step.

This tutorial uses the Ingress Subdomain to configure the Global Load Balancer. You could also replace the Ingress Subdomain with the public Application Load Balancer, ALB of the cluster.  The command `ibmcloud ks alb ls --cluster $MYCLUSTER` will display the public and private ALBs and the ALB IP (classic) or Load Balancer Hostname (VPC) identify the ALB.
{: tip}

## And then to another location

Repeat the following steps for the London location:
* In [Create a Kubernetes cluster](#create_cluster) replace:
  * the cluster name **my-us-cluster** with **my-uk-cluster**;
  * the Geography name **North America** with **Europe**;
  * the Metro name **Dallas** with **London**;
  * and the cluster name **my-us-cluster** with **my-uk-cluster**.
* In the [Create a namespace in {{site.data.keyword.registryshort_notm}}](#create_namepsace) replace:
  * the target region **us-south** with **eu-gb**.
* In the [Build and push a Docker image to the location-specific registry](#push_image) replace:
  * the registry **us.icr.io** with **uk.icr.io**.
* [Get the domain name and IP address assigned to the cluster](#CSALB_IP_subdomain)


## Configure multi-location load-balancing

Your application is now running in two clusters but it is missing one component for the users to access either clusters transparently from a single entry point.

In this section, you will configure {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) to distribute the load between the two clusters. {{site.data.keyword.cis_short_notm}} is a one stop-shop service providing _Global Load Balancer (GLB)_, _Caching_, _Web Application Firewall (WAF)_ and _Page rule_ to secure your applications while ensuring the reliability and performance for your Cloud applications.

To configure a global load balancer, you will need:
* to point a custom domain to {{site.data.keyword.cis_short_notm}} name servers,
* to retrieve the IP addresses or subdomain names of the Kubernetes clusters,
* to configure health checks to validate the availability of your application,
* and to define origin pools pointing to the clusters.

### Register a custom domain with {{site.data.keyword.cis_full_notm}}
{: #create_cis_instance}

The first step is to create an instance of {{site.data.keyword.cis_short_notm}} and to point your custom domain to {{site.data.keyword.cis_short_notm}} name servers.

1. If you do not own a domain, you can buy one from a registrar.
2. Navigate to [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
3. Set the service name, and click **Create** to create an instance of the service.
4. When the service instance is provisioned, click on **Let's get Started**.
5. Enter your domain name and click **Connect and continue**.
6. Setup your DNS records is an optional step and can be skipped for this tutorial. click on **Next Step**
6. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
7. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

   When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <your_domain_name> ns` command to verify that the new name servers have taken effect.
   {:tip}

### Configure Health Check for the Global Load Balancer

A health check helps gain insight into the availability of pools so that traffic can be routed to the healthy ones. These checks periodically send HTTP/HTTPS requests and monitor the responses.

1. In the {{site.data.keyword.cis_full_notm}} dashboard, navigate to **Reliability** > **Global Load Balancers**, and at the bottom of the page, click **Create health check**.
1. Set **Path** to **/**
1. Set **Monitor Type** to **HTTP**.
1. In the **Configure request headers (optional)** add Header name: `Host` and Value: `<glb_name>.<your_domain_name>`
1. Click **Provision 1 Resource**.

   When building your own applications, you could define a dedicated health endpoint such as */heathz* where you would report the application state.
   {:tip}

### Define Origin Pools

A pool is a group of origin servers that traffic is intelligently routed to when attached to a GLB. With clusters in the United Kingdom and United States, you can define location-based pools and configure {{site.data.keyword.cis_short_notm}} to redirect users to the closest clusters based on the geographical location of the user requests.

#### One pool for the cluster in London
1. Click **Create Pool**.
2. Set **Name** to **UK**
3. Set **Health check** to the one created in the previous section
4. Set **Health Check Region** to **Western Europe**
5. Set **Origin Name** to **uk-cluster**
6. Set **Origin Address** to the Ingress subdomain of the cluster in London, e.g. *my_uk_cluster.eu-gb.containers.appdomain.cloud*
7. Click **Provision 1 Resource**.

#### One pool for the cluster in Dallas
1. Click **Create Pool**.
2. Set **Name** to **US**
3. Set **Health check** to the one created in the previous section
4. Set **Health Check Region** to **Western North America**
5. Set **Origin Name** to **us-cluster**
6. Set **Origin Address** to the Ingress subdomain of the cluster in Dallas, e.g. *my_us_cluster.us-south.containers.appdomain.cloud*
7. Click **Provision 1 Resource**.

#### And one pool with both clusters
1. Click **Create Pool**.
1. Set **Name** to **All**
1. Set **Health check** to the one created in the previous section
1. Set **Health Check Region** to **Eastern North America**
1. Add two origins:
   1. one with **Origin Name** set to **us-cluster** and the **Origin Address** set to the Ingress subdomain of the cluster in Dallas
   2. one with **Origin Name** set to **uk-cluster** and the **Origin Address** set to the Ingress subdomain of the cluster in London
2. Click **Provision 1 Resource**.

### Create the Global Load Balancer

With the origin pools defined, you can complete the configuration of the load balancer.

1. Click **Create Load Balancer**.
1. Enter a name under **Balancer hostname** for the Global Load Balancer. This name will also be part of your universal application URL (`http://<glb_name>.<your_domain_name>`), regardless of the location.
1. Under **Default origin pools**, click **Add pool** and add the pool named **All**.
1. Expand the section of **Configure geo routes(optional)**:
   1. Click **Add route**, select **Western Europe** and click **Add**.
   1. Click **Add pool** to select the **UK** pool.
   1. Configure additional routes as shown in the following table.


| Region               | Origin Pool |
| :---------------:    | :---------: |
|Western Europe        |     UK      |
|Eastern Europe        |     UK      |
|Northeast Asia        |     UK      |
|Southeast Asia        |     UK      |
|Western North America |     US      |
|Eastern North America |     US      |

With this configuration, users in Europe and in Asia will be redirected to the cluster in London, users in US to the Dallas cluster. When a request does not match any of the defined route, it will be redirected to the **Default origin pools**.

1. Click **Provision 1 Resource**.

### Create Ingress Resource for Kubernetes clusters per location

The Global Load Balancer is now ready to serve requests. All health checks should be passing successfully. But there is one last configuration step required on the Kubernetes clusters to correctly reply to requests coming from the Global Load Balancer: you need to define an Ingress resource to handle requests from the GLB domain.

1. Create an Ingress resource file named **glb-ingress.yaml**
   ```yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: glb-ingress
   spec:
    rules:
      - host: <glb_name>.<your_domain_name>
        http:
          paths:
          - path: /
            backend:
              serviceName: hello-world-service
              servicePort: 80
   ```
    {: pre}
    Replace `<glb_name>.<your_domain_name>` with the URL you defined in the previous section.
1. Deploy this resource in both London and Dallas clusters, after setting the KUBECONFIG variable for the respective location clusters:
   ```bash
   kubectl create -f glb-ingress.yaml
   ```
   {: pre}
   It outputs the message `ingress.extension "glb-ingress" created`.

At this stage, you have successfully configured a Global Load Balancer with Kubernetes clusters across multiple locations. You can access the GLB URL `http://<glb_name>.<your_domain_name>` to view your application. Based on your location, you are redirected to the closest cluster - or a cluster from the default pool if {{site.data.keyword.cis_short_notm}} was not able to map your IP address to a specific location.

## Secure the application
{: #secure_via_CIS}

### Turn the Web Application Firewall On

The Web Application Firewall(WAF) protects your web application against ISO Layer 7 attacks. Usually, it is combined with grouped rule-sets, these rule-sets aim to protect against vulnerabilities in the application by filtering out malicious traffic.

1. In the {{site.data.keyword.cis_full_notm}} dashboard, navigate to **Security**, then on the **Web Application Firewall**.
1. Ensure the WAF is **On**.
1. Click **OWASP Rule Set**. From this page, you can review the **OWASP Core Rule Set** and individually enable or disable rules. When a rule is enabled, if an incomimg request triggers the rule, the global threat score will be increased. The **Sensitivity** setting will decide whether an **Action** is triggered for the request.
   1. Leave default OWASP rule sets as it is.
   1. Set **Sensitivity** to `Low`.
   1. Set **Action** to `Simulate` to log all the events.
1. Click **CIS Rule Set**. This page shows additional rules based on common technology stacks for hosting websites.

For a secured connection with HTTPS, you can either obtain a certificate from [Let's Encrypt](https://letsencrypt.org/) as described in the following [{{site.data.keyword.cloud}} blog](https://www.ibm.com/cloud/blog/secure-apps-on-ibm-cloud-with-wildcard-certificates) or through [{{site.data.keyword.cloudcerts_long}}](https://{DomainName}/docs/services/certificate-manager?topic=certificate-manager-ordering-certificates).
{: tip}

### Increase performance and protect from Denial of Service attacks
{: #proxy_setting}

A distributed denial of service ([DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack)) attack is a malicious attempt to disrupt normal traffic of a server, service, or network by overwhelming the target or its surrounding infrastructure with a flood of internet traffic. {{site.data.keyword.cis_short_notm}} is equipped to protect your domain from DDoS.

1. In the {{site.data.keyword.cis_short_notm}} dashboard, select **Reliability** > **Global Load Balancer**.
1. Locate the GLB you created in the **Load Balancers** table.
1. Enable the Security and Performance features in the **Proxy** column:

   ![CIS Proxy Toggle ON](images/solution32-multi-region-k8s-cis/cis-proxy.png)

**Your GLB is now protected**. An immediate benefit is that the origin IP addresses of your clusters will be hidden from the clients. If {{site.data.keyword.cis_short_notm}} detects a threat for an upcoming request, the user may see a screen like this one before being redirected to your application:

   ![verifying - DDoS protection](images/solution32-multi-region-k8s-cis/cis-DDoS.png)

In addition, you can now control what content gets cached by {{site.data.keyword.cis_short_notm}} and how long it stays cached. Go to **Performance** > **Caching** to define the global caching level and the browser expiration. You can customize the global security and caching rules with **Page Rules**. Page Rules enable fine-grained configuration using specific domain paths. As example with Page Rules, you could decide to cache all contents under **/assets** for **3 days**:

   ![page rules](images/solution32-multi-region-k8s-cis/cis-pagerules.png)

## Remove resources
{:removeresources}

### Remove Kubernetes Cluster resources
1. Remove the Ingress.
1. Remove the service.
1. Remove the deployment.
1. Delete the clusters if you created them specifically for this tutorial.

### Remove {{site.data.keyword.cis_short_notm}} resources
1. Remove the GLB.
1. Remove the origin pools.
1. Remove the health checks.

## Related content
{:related}

* [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/docs/infrastructure/cis?topic=cis-getting-started-with-ibm-cloud-internet-services-cis-#getting-started-with-ibm-cloud-internet-services-cis-)
* [Manage your IBM {{site.data.keyword.cis_short_notm}} for optimal security](https://{DomainName}/docs/infrastructure/cis?topic=cis-manage-your-ibm-cis-for-optimal-security#best-practice-2-configure-your-security-level-selectively)
* [{{site.data.keyword.containershort_notm}}](https://{DomainName}/docs/containers?topic=containers-container_index#container_index)
* [{{site.data.keyword.registrylong_notm}} Basic](https://{DomainName}/docs/services/Registry?topic=registry-registry_overview#registry_planning)
* [Deploying single instance apps to Kubernetes clusters](https://{DomainName}/docs/containers?topic=containers-cs_apps_tutorial#cs_apps_tutorial_lesson1)
* [Best practice to secure traffic and internet application via {{site.data.keyword.cis_short_notm}}](https://{DomainName}/docs/infrastructure/cis?topic=cis-manage-your-ibm-cis-for-optimal-security#manage-your-ibm-cis-for-optimal-security)
* [Improving App Availability with Multizone Clusters](https://www.ibm.com/cloud/blog/announcements/improving-app-availability-multizone-clusters)
