---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-10-24"
lasttested: "2019-10-24"

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
{:important: .important}
{:note: .note}

# Accelerate a dynamic website using Dynamic Content Acceleration
{: #dynamic-content-cdn}

Web applications are composed of static content like text, images, cascading style sheets, and JavaScript files. This tutorial [Accelerate delivery of static files using a CDN](/docs/tutorials?topic=solution-tutorials-static-files-cdn) shows how to host and serve static assets (images, videos, and documents) of a website from {{site.data.keyword.cos_full_notm}} with [{{site.data.keyword.cdn_full}} (CDN)](https://{DomainName}/catalog/infrastructure/cdn-powered-by-akamai).

Applications also contain personalized and dynamically changing contents that can’t be cached at CDN. A common example of non-cacheable dynamic content is adding an item to a cart in an e-commerce website that might be generated from JavaScript on the base page. Before Dynamic Content Acceleration is available, a CDN will pass every request for a non-cacheable object through to the owner’s origin server, and pass the result back to the user.

To stop these dynamic contents from being a performance bottleneck, you can utilize the new Dynamic Content Acceleration (DCA) capability of [{{site.data.keyword.cdn_full}} (CDN)](https://{DomainName}/catalog/infrastructure/cdn-powered-by-akamai) to optimize the performance of dynamic contents:
* the DCA capability of CDN will choose the optimal routes for requests
* proactively pre-fetch contents from origin servers so that users can access these contents rapidly from the edge
* extend the duration of TCP connections for multiple requests
* automatically compress images for lower latency.

## Objectives
{: #objectives}

* Deploy a starter dynamic web application to a {{site.data.keyword.containershort_notm}} cluster.
* Make static content globally available with {{site.data.keyword.cdn_full}}.
* Enable the Dynamic Content Acceleration (DCA) capability for performance optimization of non-static content.

## Services used
{: #services}

This tutorial uses the following products:

* [{{site.data.keyword.cdn_full}}](https://{DomainName}/catalog/infrastructure/cdn-powered-by-akamai)
* [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster)
* [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
* [IBM Domain Name Service](https://{DomainName}/classic/network/dns/forwardzones)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

![Architecture](images/solution52-cdn-dca/solution_52_architecture.png)
</p>

1. The developer creates a simple dynamic application and produces a Docker container image.
2. The image is pushed to a namespace in {{site.data.keyword.registryshort_notm}}.
3. The application is deployed to {{site.data.keyword.containershort_notm}}.
4. User accesses the application.
5. The application is accelerated through the Dynamic Content Acceleration capability of {{site.data.keyword.cdn_full}}.
5. {{site.data.keyword.cdn_full}} interacts with the application to fetch dynamic contents.

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
   * `dev` plugin,
* a Docker engine,
* `kubectl` to interact with Kubernetes clusters,
* `git` to clone source code repository.

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/tutorials?topic=solution-tutorials-getting-started) guide.

In addition:
- create a Kubernetes cluster with {{site.data.keyword.containershort_notm}}.
   - For Kubernetes on VPC infrastructure, you are required to create a VPC and subnet(s) prior to creating the Kubernetes cluster. You may follow the instructions provided under the [Creating a standard VPC Gen 1 compute cluster in the console](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_vpc_ui).
   - For Kubernetes on Classic infrastructure follow the [Creating a standard classic cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_standard) instructions.
- and obtain a domain for your web application. If you don't own a custom domain, you can register one from [IBM Domain Name Service](https://{DomainName}/classic/services/domains).

## Deploy a dynamic web application to be accelerated

Let's consider a simple dynamic web application for collaboration for a team geographically distributed. With this application, team members can create and manage team's to-do items together.

This [sample application](https://github.com/IBM-Cloud/cdn-with-cda-todolist) is based on [Beego](https://beego.me/docs/intro/), a RESTful HTTP framework for the rapid development of Go applications including APIs, web apps and backend services.

### Build the application

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
1. Identify the {{site.data.keyword.registryshort_notm}} to use with `ibmcloud cr info`, such as us.icr.io or uk.icr.io.  Notice how **myname-** is used to create a unique namespace name within the registry.  Feel free to use an exising namespace.
1. Create a namespace to store the container image.
   ```bash
   MYCONTAINERREGISTRY=us.icr.io
   MYNAMESPACE=myname-cdn-with-cda
   ibmcloud cr namespace-add $MYNAMESPACE
   ```
	 {: pre}
1. Build a Docker image using the [Dockerfile](https://github.com/IBM-Cloud/cdn-with-cda-todolist/blob/master/Dockerfile) in {{site.data.keyword.registryshort_notm}} and use **cdn-with-cda-todolist** as the image name:
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

1. Run the command below to target the cluster where to deploy the application. This will set the KUBECONFIG environment variable.
   ```bash
   $(ibmcloud ks cluster config --export mycluster)
	 ```
	 {: pre}
1. Retrieve the cluster ingress subdomain and secret name:
   ```bash
   ibmcloud ks cluster get mycluster
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

Before you create a {{site.data.keyword.cdn_full}} instance, you should have registered a domain name for your application.

1. Go to the cloud catalog, and select [{{site.data.keyword.cdn_full}}](https://{DomainName}/catalog/infrastructure/cdn-powered-by-akamai) from the Network section. Click **Create**.
   1. Set **Hostname** to the custom domain of your application, for example, `todo.exampledomain.net`.
   1. Set **Custom CNAME** prefix to a unique value, for example, `todo-sample`.
	 1. Leave **Host header** and **Path** empty.
	 1. Click the **Server** tab and specify the application ingress subdomain as **Origin server address**, for example  `cdn-with-cda-todolist.<ingress-subdomain>`.
	 1. Check HTTP port.
	 1. Check HTTPS port and select **Wildcard** SSL certificate.

      With the **Wildcard** certificate, you will access your app through the IBM provided CNAME.
			{: note}
1. Accept the **Master Service Agreement** and click **Create**.
1. In the DNS service provider for your custom domain, create a new CNAME record mapping the CDN domain to the Custom CNAME. If using [IBM Domain Name Service](https://{DomainName}/classic/network/dns/forwardzones), take the following steps:
   1. Click the name of your domain.
	 1. Under **Add a new record**, select **CNAME** as resource type, and map the host `todo.exampledomain.net` to the CNAME `todo-sample.cdn.appdomain.cloud.`
	 1. Click **Add Record**.
      ![](images/solution52-cdn-dca/dns_record.png)

After you have successfully created the CDN mapping:
   * To view your CDN instance, select the CDN instance [in the list](https://{DomainName}/classic/network/cdn). The **Details** panel shows both the **Hostname** and the **CNAME** for your CDN.
   * You application is now accessible through the CNAME only: `https://<CNAME>`.  Note that the application is not available via todo.exampledomain.net - this will take a little additional configuration and associated delay.

## Enable Dynamic Content Acceleration (DCA)

At that stage, the static content of the application is cached by the CDN but not the dynamic content.

The Dynamic Content Acceleration (DCA) feature will query a test object in about 10KB size on your origin server to determine the optimal routes for real requests. For this purpose, the application has been customized from the [Beego sample](https://github.com/beego/samples) to include [a test object](https://github.com/IBM-Cloud/cdn-with-cda-todolist/blob/master/views/detection-test-object.html) made available at [`/test-dca`](https://github.com/IBM-Cloud/cdn-with-cda-todolist/blob/master/main.go#L11).

To activate DCA:
1. Select the **Settings** tab in the CDN configuration.
2. Under the **Optimized for** section, select **Dynamic Content Acceleration** from the drop-down list.
3. Under the **Detection path** section, specify the path `/test-dca` as the detection path, and click **Test** to verify the path is set correctly. This detection path will be used periodically by {{site.data.keyword.cdn_full}} to determine the fastest path to the origin.
4. Make sure **Prefetching** and **Image compression** are both set to **On**.
   ![](images/solution52-cdn-dca/detection_path.png)
5. Click **Save**. You have successfully accelerated your application deployed in {{site.data.keyword.containershort_notm}} cluster with **Dynamic Content Acceleration**.

## Verify DCA performance

You can use common website performance tools such as [Web Page Test](https://www.webpagetest.org/) to compare the website response time before and after DCA is turned on.

After enabling DCA for a period, you can view the both static and dynamic traffic bandwidth by clicking on the **View CDN report** on the [CDN Overview](https://{DomainName}/classic/network/cdn) page.

## Conclusion

With DCA turned on and the detection path specified, CDN edge servers periodically fetch the test object from the origin to look for any path between the internal network of CDN edge servers that have lower latency and/or packet loss rate than the default route on the Internet. When a real request comes in, {{site.data.keyword.cdn_full}} consults the most recent data to send that request over the best path to the origin.

With **Prefetching** enabled, DCA also finds which content is required by the application and preemptively fetches content from origin and stores it close to the user by analyzing user behavior data and web sessions. The **Image compression** option serves compressed images to reduces the amount of content required to load a page, especially when end users have slow network speed. DCA also employs TCP-layer optimizations that accelerate connection set-up and reduce round trips.

## Remove resources

* Delete the application from the [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster).
* Delete the image from the [{{site.data.keyword.registryshort_notm}}](https://{DomainName}/kubernetes/catalog/registry).
* Delete the [{{site.data.keyword.cdn_full}} service](https://{DomainName}/classic/network/cdn).
* Delete the CNAME record and the zone from [IBM Domain Name Service](https://{DomainName}/classic/network/dns/forwardzones) if you were using the service.

## Related content

* [Getting Started with CDN](https://{DomainName}/docs/infrastructure/CDN?topic=CDN-getting-started#getting-started)
* [IBM Cloud Kubernetes Service](https://{DomainName}/docs/containers?topic=containers-container_index#container_index)
* [IBM Cloud Container Registry](https://{DomainName}/docs/services/Registry?topic=registry-getting-started#getting-started)
