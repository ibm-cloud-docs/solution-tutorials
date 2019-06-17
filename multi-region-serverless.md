---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2019-06-17"
lasttested: "2019-06-13"
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

# Deploy serverless apps across multiple regions
{: #multi-region-serverless}

This tutorial shows how to configure {{site.data.keyword.cis_full_notm}} and {{site.data.keyword.openwhisk_short}} to deploy serverless apps across multiple regions.

Serverless computing platforms give developers a rapid way to build APIs without servers. {{site.data.keyword.openwhisk}} supports automatic generation of REST API for actions, turning actions into HTTP endpoints, and the ability to enable secure API authentication. This capability is helpful not only for exposing APIs to external consumers but also for building microservices applications.

{{site.data.keyword.openwhisk_short}} is available in multiple {{site.data.keyword.cloud_notm}} locations. To increase resiliency and reduce network latency, applications can deploy their back-end in multiple locations. Then, with {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}), developers can expose a single entry point in charge of distributing traffic to the closest healthy back-end.

## Objectives
{: #objectives}

* Deploy {{site.data.keyword.openwhisk_short}} actions.
* Expose actions via {{site.data.keyword.APIM}} with a custom domain.
* Distribute traffic across multiple locations with {{site.data.keyword.cis_full_notm}}.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.openwhisk_short}}](https://{DomainName}/openwhisk/)
* [{{site.data.keyword.cloudcerts_short}}](https://{DomainName}/catalog/services/cloudcerts)
* [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-svcs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

The tutorial considers a public web application with a back-end implemented with {{site.data.keyword.openwhisk_short}}. To reduce network latency and prevent outage, the application is deployed in multiple locations. Two locations are configured in the tutorial.

<p style="text-align: center;">

  ![Architecture](images/solution44-multi-region-serverless/Architecture.png)
</p>

1. Users access the application. The request goes through {{site.data.keyword.cis_full_notm}}.
2. {{site.data.keyword.cis_full_notm}} redirect the users to the closest healthy API back-end.
3. {{site.data.keyword.cloudcerts_short}} provides the SSL certificate to the API. The traffic is encrypted end-to-end.
4. The API is implemented with {{site.data.keyword.openwhisk_short}}.

## Before you begin
{: #prereqs}

1. {{site.data.keyword.cis_full_notm}} requires you to own a custom domain so you can configure the DNS for this domain to point to {{site.data.keyword.cis_full_notm}} name servers. If you do not own a domain, you can buy one from a registrar.
1. Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview).

## Configure a custom domain

The first step is to create an instance of {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) and to point your custom domain {{site.data.keyword.cis_short_notm}} name servers.

1. Navigate to the [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
1. Set the service name, and click **Create** to create an instance of the service. You can use any pricing plans for this tutorial.
1. When the service instance is provisioned, click on **Let's get Started**.
1. Enter your domain name and click **Connect and continue**.
1. Setup your DNS records is an optional step and can be skipped for this tutorial. click on **Next Step**
1. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
1. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

   When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <your_domain_name> ns` command to verify that the new name servers have taken effect.
   {:tip}

### Request a certificate using {{site.data.keyword.cloudcerts_short}} and a custom sample code

1. Create a [{{site.data.keyword.cloudcerts_short}}](https://{DomainName}/catalog/services/cloudcerts) instance in a supported location.
1. Use the [code sample](https://github.com/ibm-cloud-security/certificate-manager-domain-validation-cloud-function-sample) and included instructions to request and import a certificate using {{site.data.keyword.openwhisk_short}} for a domain maintained by {{site.data.keyword.cis_full_notm}}. The code sample can be deployed using similar steps as provided below. 

## Deploy actions in multiple locations

In this section, you will create actions, expose them as an API, and map the custom domain to the API with a SSL certificate stored in {{site.data.keyword.cloudcerts_short}}.

<p style="text-align: center;">

  ![API Architecture](images/solution44-multi-region-serverless/api-architecture.png)
</p>

The action **doWork** implements one of your API operations. The action **healthz** is going to be used later on the check if your API is healthy. It could as simple as returning *OK* or it could do a more complex check like pinging the databases or other critical services required by your API.

The three following sections will need to be repeated for every location where you want to host the application back-end. For this tutorial, you can pick *Dallas (us-south)* and *London (eu-gb)* as targets.

### Define actions

1. Go to [{{site.data.keyword.openwhisk_short}} / Actions](https://{DomainName}/openwhisk/actions).
1. Switch to the target location and select an organization and space where to deploy the actions.
1. Create an action
   1. Set **Name** to **doWork**.
   1. Set **Enclosing Package** to **default**.
   1. Set **Runtime** to the most recent version of **Node.js**.
   1. **Create**.
1. Change the action code to:
   ```js
   function main(params) {
     msg = "Hello, " + params.name + " from " + params.place;
     return { greeting:  msg, host: params.__ow_headers.host };
   }
   ```
   {: codeblock}
1. **Save**
1. Create another action to be used as health check for our API:
   1. Set **Name** to **healthz**.
   1. Set **Enclosing Package** to **default**.
   1. Set **Runtime** to most recent **Node.js**.
   1. **Create**.
1. Change the action code to:
   ```js
   function main(params) {
     return { ok: true };
   }
   ```
   {: codeblock}
1. **Save**

### Expose the actions with a managed API

The next step involves creating a managed API to expose your actions.

1. Go to [{{site.data.keyword.openwhisk_short}} / API](https://{DomainName}/openwhisk/apimanagement).
1. Create a new managed {{site.data.keyword.openwhisk_short}} API:
   1. Set **API name** to **App API**.
   1. Set **Base path** to **/api**.
1. Create an operation:
   1. Set **Path** to **/do**.
   1. Set **Verb** to **GET**.
   1. Set **Package** to **default**.
   1. Set **Action** to **doWork**.
   1. **Create**
1. Create another operation:
   1. Set **Path** to **/healthz**.
   1. Set **Verb** to **GET**.
   1. Set **Package** to **default**.
   1. Set **Action** to **healthz**.
   1. **Create**
1. **Save** the API

### Configure the custom domain for the managed API

Creating a managed API gives you a default endpoint like `https://service.us.apiconnect.ibmcloud.com/gws/apigateway/api/1234abcd/app`. In this section, you will configure this endpoint to be able to handle requests coming from your custom subdomain, the domain which will later be configured in {{site.data.keyword.cis_full_notm}}.

1. Go to [APIs / Custom domains](https://{DomainName}/apis/domains).
1. In the **Region** selector, select the target location.
1. Locate the custom domain linked to the organization and space where you created the actions and the managed API. Click **Change Settings** in the action menu.
1. Make note of the **Default domain / alias** value.
1. Check **Assign custom domain**
   1. Set **Domain name** to the domain you will use with the {{site.data.keyword.cis_short_notm}} Global Load Balancer such as *api.mydomain.com*.
   1. Select the {{site.data.keyword.cloudcerts_short}} instance holding the certificate.
   1. Select the certificate for the domain.
1. Go to the dashboard of your instance of **{{site.data.keyword.cis_full_notm}}**, under **Reliability / DNS**, create a new **DNS TXT record**:
   1. Set **Name** to your custom subdomain, such as **api**.
   1. Set **Content** to the **Default domain / alias**
   1. Save the record
1. Save the custom domain settings. {{site.data.keyword.cis_full_notm}} will check for the existence of the DNS TXT record.

   If the TXT record is not found, you may need to wait for it to propagate and retry saving the settings. The DNS TXT record can be removed once the settings have been applied.
   {: tip}

Repeat the previous sections to configure more locations.

## Distribute traffic between locations

**At this stage, you have setup actions in multiple locations** but there is no single entry point to reach them. In this section, you will configure a global load balancer (GLB) to distribute traffic between the locations.

<p style="text-align: center;">

  ![Architecture of the global load balancer](images/solution44-multi-region-serverless/glb-architecture.png)
</p>

### Create a health check

{{site.data.keyword.cis_full_notm}} will be regularly calling this endpoint to check the health of the back-end.

1. Go to the dashboard of your {{site.data.keyword.cis_full_notm}} instance.
1. Under **Reliability / Global Load Balancers**, create a health check:
   1. Set **Monitor type** to **HTTPS**.
   1. Set **Path** to **/api/healthz**.
   1. Click on **Create**.

### Create origin pools

By creating one pool per location, you can later configure geo routes in your global load balancer to redirect users to the closest location. Another option would be to create a single pool with all locations and have the load balancer cycle through the origins in the pool.

For every location:
1. Create an origin pool.
1. Set **Name** to **app-&lt;location&gt;** such as _app-Dallas_.
1. Select the Health check created before.
1. Set **Health Check Region** to a region close to the location where {{site.data.keyword.openwhisk_short}} are deployed.
1. Set **Origin Name** to **app-&lt;location&gt;**.
1. Set **Origin Address** to the default domain / alias for the managed API (such as _5d3ffd1eb6.us-south.apiconnect.appdomain.cloud_).
1. Click on **Create**.

### Create a global load balancer

1. Create a load balancer.
1. Set **Balancer hostname** to **api.mydomain.com**.
1. Add the regional origin pools.
1. Click on **Create**.

After a short while, go to `https://api.mydomain.com/api/do?name=John&place=Earth`. This should reply with the function running in the first healthy pool.

### Test fail over

To test the fail over, a pool health check must fail so that the GLB would redirect to the next healthy pool. To simulate a failure, you can modify the health check function to make it fail.

1. Go to [{{site.data.keyword.openwhisk_short}} / Actions](https://{DomainName}/openwhisk/actions).
1. Select the first location configured in the GLB.
1. Edit the `healthz` function and change its implementation to `throw new Error()`.
1. Save.
1. Wait for the health check to run for this origin pool.
1. Get `https://api.mydomain.com/api/do?name=John&place=Earth` again, it should now redirect to the other healthy origin.
1. Revert the code changes to get back to a healthy origin.

## Remove resources
{: #removeresources}

### Remove {{site.data.keyword.cis_short_notm}} resources

1. Remove the GLB.
1. Remove the origin pools.
1. Remove the health checks.
1. Remove the {{site.data.keyword.cis_short_notm}} instance (optional)

### Remove {{site.data.keyword.cloudcerts_short}} resources
1. Remove the certificate from the {{site.data.keyword.cloudcerts_short}} instance
1. Remove the {{site.data.keyword.cloudcerts_short}} instance (optional)

### Remove actions

1. Remove [APIs](https://{DomainName}/openwhisk/apimanagement)
1. Remove [actions](https://{DomainName}/openwhisk/actions)

## Related content
{: #related}

* [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/docs/infrastructure/cis?topic=cis-getting-started-with-ibm-cloud-internet-services-cis-#getting-started-with-ibm-cloud-internet-services-cis-)
* [Resilient and secure multi-region Kubernetes clusters with {{site.data.keyword.cis_full_notm}}](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-k8s-cis#multi-region-k8s-cis)
