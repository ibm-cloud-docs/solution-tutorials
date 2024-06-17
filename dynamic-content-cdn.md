---
subcollection: solution-tutorials
copyright:
  years: 2024
lastupdated: "2024-01-02"
lasttested: "2023-09-08"
content-type: tutorial
services: CDN, containers, Registry, dns
account-plan: paid
completion-time: 2h
use-case: ApplicationPerformance
---
{{site.data.keyword.attribute-definition-list}}


# Accelerate a dynamic website using Dynamic Content Acceleration
{: #dynamic-content-cdn}
{: toc-content-type="tutorial"}
{: toc-services="CDN, containers, Registry, dns"}
{: toc-completion-time="2h"}

This tutorial may incur costs. Use the [Cost Estimator](/estimator) to generate a cost estimate based on your projected usage.
{: tip}


Web applications are composed of static content like text, images, cascading style sheets, and JavaScript files. The tutorial [Accelerate delivery of static files using a CDN](/docs/solution-tutorials?topic=solution-tutorials-static-files-cdn) shows how to host and serve static assets (images, videos, and documents) of a website from {{site.data.keyword.cos_full_notm}} with [{{site.data.keyword.cdn_full}} (CDN)](/catalog/infrastructure/cdn-powered-by-akamai).
{: shortdesc}

Applications also contain personalized and dynamically changing contents that can’t be cached at CDN. A common example of non-cacheable dynamic content is adding an item to a cart in an e-commerce website that might be generated from JavaScript on the base page. Before Dynamic Content Acceleration is available, a CDN will pass every request for a non-cacheable object through to the owner’s origin server, and pass the result back to the user.

To stop these dynamic contents from being a performance bottleneck, you can utilize the new Dynamic Content Acceleration (DCA) capability of [{{site.data.keyword.cdn_full}} (CDN)](/catalog/infrastructure/cdn-powered-by-akamai) to optimize the performance of dynamic contents:
* the DCA capability of CDN will choose the optimal routes for requests
* proactively pre-fetch contents from origin servers so that users can access these contents rapidly from the edge
* extend the duration of TCP connections for multiple requests
* automatically compress images for lower latency.

## Objectives
{: #dynamic-content-cdn-objectives}

* Deploy a sample dynamic web application to a {{site.data.keyword.containershort_notm}} cluster.
* Make static content globally available with {{site.data.keyword.cdn_full}}.
* Enable the Dynamic Content Acceleration (DCA) capability for performance optimization of non-static content.

![Architecture](images/solution52-cdn-dca/solution_52_architecture.svg){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}


1. The developer creates a simple dynamic application and produces a Docker container image.
2. The image is pushed to a namespace in {{site.data.keyword.registryshort_notm}}.
3. The application is deployed to {{site.data.keyword.containershort_notm}}.
4. User accesses the application.
5. The application is accelerated through the Dynamic Content Acceleration capability of {{site.data.keyword.cdn_full}}.
6. {{site.data.keyword.cdn_full}} interacts with the application to fetch dynamic contents.

## Before you begin
{: #dynamic-content-cdn-prereqs}

You can run the tutorial in the [{{site.data.keyword.cloud-shell_short}}](/shell){: external} from the {{site.data.keyword.cloud_notm}} console. If you want to run it on your machine, it requires the following:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
   * `dev` plugin,
* a Docker engine,
* `kubectl` to interact with Kubernetes clusters,
* `git` to clone source code repository.


You will find instructions to download and install these tools for your operating environment in the [Getting started with solution tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

In addition: A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial.

Open the [Kubernetes clusters](/kubernetes/clusters){: external} and click **Create cluster**. See the documentation referenced below for more details based on the cluster type.  Summary:
- Click **Standard tier cluster**
- For Kubernetes on VPC infrastructure see reference documentation [Creating VPC clusters](/docs/containers?topic=containers-cluster-create-vpc-gen2&interface=ui).
   - Click **Create VPC**:
      - Enter a **name** for the VPC.
      - Chose the same resource group as the cluster.
      - Click **Create**.
   - Attach a Public Gateway to each of the subnets that you create:
      - Navigate to the [Virtual private clouds](/vpc-ext/network/vpcs){: external}.
      - Click the previously created VPC used for the cluster.
      - Scroll down to subnets section and click a subnet.
      - In the **Public Gateway** section, click **Detached** to change the state to **Attached**.
      - Click the browser **back** button to return to the VPC details page.
      - Repeat the previous three steps to attach a public gateway to each subnet.
- For Kubernetes on Classic infrastructure see reference documentation [Creating classic cluster](/docs/containers?topic=containers-cluster-create-classic&interface=ui).
- Choose a resource group.
- Uncheck all zones except one.
- Scale down to 1 **Worker nodes per zone**.
- Choose the smallest **Worker Pool flavor**.
- Enter a **Cluster name**.
- Click **Create**.

## Deploy a dynamic web application to be accelerated
{: #dynamic-content-cdn-2}
{: step}

Let's consider a simple dynamic web application for collaboration for a team geographically distributed. With this application, team members can create and manage team's to-do items together.

This [sample application](https://github.com/IBM-Cloud/cdn-with-cda-todolist){: external} is based on [Beego](https://github.com/beego/beego){: external}, a RESTful HTTP framework for the rapid development of Go applications including APIs, web apps and backend services.

### Build the application
{: #dynamic-content-cdn-3}

Open a terminal in the [{{site.data.keyword.cloud-shell_short}}](/shell){: external}, then follow these steps:

1. Clone the application
   ```bash
   git clone https://github.com/IBM-Cloud/cdn-with-cda-todolist.git
   ```
   {: pre}

1. Change to the application directory
   ```bash
   cd cdn-with-cda-todolist
   ```
   {: pre}

1. Being logged in to the CLI environment, identify the cluster.  `ibmcloud ks cluster ls` will return cluster names.
   ```bash
   ibmcloud ks cluster ls
   ```
   {: pre}

   Set the variable accordingly:
   ```bash
   MYCLUSTER=<cluster_name>
   ```
   {: pre}

1. Identify the {{site.data.keyword.registryshort_notm}} and set a namespace. `ibmcloud cr info` will return the name of the container registry.

   ```bash
   ibmcloud cr info
   ```
   {: pre}

   Set the variable accordingly:
   ```bash
   MYCONTAINERREGISTRY=<us.icr.io_like_value_returned_from_ibmcloud_cr_info>
   ```
   {: pre}

   Set the variable to a name you want to use as a new namespace or an existing namespace:
   ```bash
   MYNAMESPACE=<my_container_registry_namespace>
   ```
   {: pre}

1. Create a namespace to store the container image. Feel free to skip this step and use an existing namespace.
   ```bash
   ibmcloud cr namespace-add $MYNAMESPACE
   ```
   {: pre}

1. Build a Docker image using the [Dockerfile](https://github.com/IBM-Cloud/cdn-with-cda-todolist/blob/master/Dockerfile){: external} in {{site.data.keyword.registryshort_notm}} and use **cdn-with-cda-todolist** as the image name:
   ```bash
   docker build -t $MYCONTAINERREGISTRY/$MYNAMESPACE/cdn-with-cda-todolist:latest .
   ```
   {: pre}

1. Log in {{site.data.keyword.registryshort_notm}}:
   ```bash
   ibmcloud cr login
   ```
   {: pre}

1. Push the image to {{site.data.keyword.registryshort_notm}}:
   ```bash
   docker push $MYCONTAINERREGISTRY/$MYNAMESPACE/cdn-with-cda-todolist:latest
   ```
   {: pre}

### Run the application in the cluster
{: #dynamic-content-cdn-4}

1. Run the command below to target the cluster where to deploy the application.
   ```bash
   ibmcloud ks cluster config --cluster $MYCLUSTER
   ```
   {: pre}

1. Retrieve the cluster ingress subdomain and secret name:
   ```bash
   ibmcloud ks cluster get --cluster $MYCLUSTER
   ```
   {: pre}

1. Copy `deployment.sample.yaml` to `deployment.yaml`:
   ```bash
   cp deployment.sample.yaml deployment.yaml
   ```
   {: pre}

1. Edit `deployment.yaml` and replace the placeholders `<image>`, `<ingress-subdomain>` and `<ingress-secret>` with values matching your environment.
1. Deploy the application to the cluster:
   ```bash
   kubectl apply -f deployment.yaml
   ```
   {: pre}
   
1. Access the application at `https://cdn-with-cda-todolist.<ingress-subdomain>`

## Create a CDN instance
{: #dynamic-content-cdn-0}
{: step}

Before you create a {{site.data.keyword.cdn_full}} instance, you should have registered a domain name for your application.

1. Go to the cloud catalog, and select [{{site.data.keyword.cdn_full}}](/catalog/infrastructure/cdn-powered-by-akamai){: external} from the Network section. Click **Create**.
   * Set **Hostname** to a custom domain, for this tutorial it is not required to be a domain you own as we will not be using it, you can set it to `todo.example.com`.
   * Leave the **Custom CNAME** prefix empty, it will default to a generated unique name, this is the entry we will use to test the CDN.
   * Leave **Host header** and **Path** empty.
   * Click the **Server** tab and specify the application ingress subdomain as **Origin server address**, for example `cdn-with-cda-todolist.<ingress-subdomain>`.
   * Uncheck HTTP port.
   * Check HTTPS port and select **Wildcard** SSL certificate.

      With the [**Wildcard** certificate](/docs/CDN?topic=CDN-about-https#wildcard-certificate-support), you will access your app through the Custom CNAME. The Wildcard certificate is the simplest way to deliver web content to your users securely. The Custom CNAME is added to the wildcard certificate maintained on the CDN Edge server and becomes the only way for users to use HTTPS for your CDN (for example, `https://cdnakaivlnqidbg4.cdn.appdomain.cloud`). 
      {: note}

1. Accept the **Terms and Conditions** and click **Create**.

After you have successfully created the CDN mapping:
* **CNAME configuration required** may display in the Status column, you can ignore it and check the status again by selecting **Get status** from the overflow menu. It should change to *Running* after a few minutes.
* To view your CDN instance, select the CDN instance [in the list](/cdn){: external}. The **Details** panel shows both the **Hostname** and the **CNAME** for your CDN.
* Your application is now accessible through the CNAME only: `https://<CNAME>`. You may need to wait a few minutes for all configuration to complete and for the CNAME to work.

## Enable Dynamic Content Acceleration (DCA)
{: #dynamic-content-cdn-6}
{: step}

At that stage, the static content of the application is cached by the CDN but not the dynamic content.

The Dynamic Content Acceleration (DCA) feature will query a test object in about 10KB size on your origin server to determine the optimal routes for real requests. For this purpose, the application has been customized to include [a test object](https://github.com/IBM-Cloud/cdn-with-cda-todolist/blob/master/views/detection-test-object.html){: external} made available at [`/test-dca`](https://github.com/IBM-Cloud/cdn-with-cda-todolist/blob/master/main.go#L11){: external}.

To activate DCA:
1. Select the **Settings** tab in the CDN configuration.
2. Under the **Optimization settings** section, click **Edit** and select **Dynamic Content Acceleration** from the *Optimized for* drop-down list.
3. Under the **Detection path** section, specify the path `/test-dca` as the detection path, and click **Test** to verify the path is set correctly. This detection path will be used periodically by {{site.data.keyword.cdn_full}} to determine the fastest path to the origin.
4. Make sure **Prefetching** and **Image compression** are both set to **On**.

   ![Configure DCA](images/solution52-cdn-dca/detection_path.png){: caption="Configure DCA" caption-side="bottom"}
5. Click **Save**. You have successfully accelerated your application deployed in {{site.data.keyword.containershort_notm}} cluster with **Dynamic Content Acceleration**.

## Verify DCA performance
{: #dynamic-content-cdn-5}
{: step}

You can use common website performance tools such as [Web Page Test](https://www.webpagetest.org/){: external} to compare the website response time before and after DCA is turned on. Use the path `/test-dca` along with the original URL and the CDN-based URL from above.

After enabling DCA for a period, you can view the both static and dynamic traffic bandwidth by clicking on the **View CDN report** on the [CDN Overview](/cdn){: external} page.

## Conclusion
{: #dynamic-content-cdn-conclusion}
{: step}

With DCA turned on and the detection path specified, CDN edge servers periodically fetch the test object from the origin to look for any path between the internal network of CDN edge servers that have lower latency and/or packet loss rate than the default route on the Internet. When a real request comes in, {{site.data.keyword.cdn_full}} consults the most recent data to send that request over the best path to the origin.

With **Prefetching** enabled, DCA also finds which content is required by the application and preemptively fetches content from origin and stores it close to the user by analyzing user behavior data and web sessions. The **Image compression** option serves compressed images to reduces the amount of content required to load a page, especially when end users have slow network speed. DCA also employs TCP-layer optimizations that accelerate connection set up and reduce round trips.

## Remove resources
{: #dynamic-content-cdn-7}
{: step}

* Delete the [{{site.data.keyword.cdn_full}} service](/cdn){: external}.
* Delete the application from the [{{site.data.keyword.containershort_notm}}](/kubernetes/clusters){: external}.
* Delete the container image from the [{{site.data.keyword.registryshort_notm}}](/registry/images){: external}.

## Related content
{: #dynamic-content-cdn-10}

* [Getting started with Content Delivery Network (CDN)](/docs/CDN?topic=CDN-getting-started#getting-started)
* [{{site.data.keyword.containerfull_notm}}](/docs/containers)
* [{{site.data.keyword.registryfull_notm}}](/docs/Registry?topic=Registry-getting-started#getting-started)
