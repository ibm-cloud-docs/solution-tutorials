---
copyright:
  years: 2018
lastupdated: "2018-11-11"

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

# Distribute serverless apps across multiple locations

This tutorial...
{:shortdesc}

## Objectives
{: #objectives}

* Deploy {{site.data.keyword.openwhisk_short}} actions.
* Expose actions via {{site.data.keyword.APIM}} with a custom domain.
* Distribute traffic across multiple locations with Cloud Internet Services.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
* [{{site.data.keyword.cloudcerts_short}}](https://console.bluemix.net/catalog/services/cloudcerts)
* IBM Cloud [Internet Services](https://console.bluemix.net/catalog/services/internet-svcs)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

The tutorial considers a public web application with a back-end implemented with {{site.data.keyword.openwhisk_short}}. To reduce network latency and prevent outage, the application is deployed in multiple locations. Two locations are configured in the tutorial.

<p style="text-align: center;">

  ![Architecture](images/solution44-multi-region-serverless/Architecture.png)
</p>

1. Users access the application. The request goes through Internet Services.
2. Internet Services redirect the users to the closest healthy API back-end.
3. {{site.data.keyword.cloudcerts_short}} provides the API with its SSL certificate. The traffic is encrypted end-to-end.
4. The API is implemented with {{site.data.keyword.openwhisk_short}}.

## Before you begin
{: #prereqs}

1. Cloud Internet Services requires you to own a custom domain so you can configure the DNS for this domain to point to Cloud Internet Services name servers.
1. Install all the necessary command line (CLI) tools by [following these steps](https://console.bluemix.net/docs/cli/index.html#overview).

## Configure a custom domain

The first step is to create an instance of IBM Cloud Internet Services (CIS) and to point your custom domain to CIS name servers.

1. If you do not own a domain, you can buy one from a registrar such as [godaddy.com](http://godaddy.com).
1. Navigate to the [Internet Services](https://console.bluemix.net/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
1. Set the service name, and click **Create** to create an instance of the service.
1. When the service instance is provisioned, set your domain name and click **Add domain**.
1. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
1. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

   When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <your_domain_name> ns` command to verify that the new name servers have taken effect.
   {:tip}

Exposing {{site.data.keyword.openwhisk_short}} actions through a custom domain will require a secure HTTPS connection. You should obtain a SSL certificate for the domain and subdomain you plan to use with the serverless back-end. Assuming a domain like *mydomain.com*, the actions could be hosted at *api.mydomain.com*. The certificate will need to be issued for *api.mydomain.com*.

You can get free SSL certificates from [Let's Encrypt](https://letsencrypt.org/). During the process you may need to configure a DNS record of type TXT in the DNS interface of Cloud Internet Services to prove you are the owner of the domain.
{:tip}

Once you have obtained the SSL certificate and private key for your domain make sure to convert them to the [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format.

1. To convert a Certificate to PEM format:
   ```
   openssl x509 -in domain-crt.txt -out domain-crt.pem -outform PEM
   ```
1. To convert a Private Key to PEM format:
   ```
   openssl rsa -in domain-key.txt -out domain-key.pem -outform PEM
   ```

## Deploy actions in multiple locations

In this section, you will create actions, expose them as an API, and map the custom domain to the API with a SSL certificate stored in {{site.data.keyword.cloudcerts_short}}.

![alt](images/solution44-multi-region-serverless/api-architecture.png)

The action **doWork** implements one of your API operations. The action **healthz** is going to be used later on the check if your API is healthy. It could be a no-op simply returning *OK* or it could do a more complex check like pinging the databases or other critical services required by your API.

The following steps will need to be repeated for every location where you want to host the application back-end. For this tutorial, you can pick *Dallas (us-south)* and *London (eu-gb)* as targets.

### Import certificate to a central repository

1. Given a location, create a [{{site.data.keyword.cloudcerts_short}}](https://console.bluemix.net/catalog/services/cloudcerts) instance.
1. In the service dashboard, use **Import Certificate**:
   * Set **Name** to the custom subdomain and domain, such as *api.mydomain.com*.
   * Browse for the **Certificate file** in PEM format.
   * Browse for the **Private key file** in PEM format.
   * **Import**.

### Define actions

1. Go to [{{site.data.keyword.openwhisk_short}} / Actions](https://console.bluemix.net/openwhisk/actions).
1. Switch to the given location and select an organization and space where to deploy the actions.
1. Create an action
   1. Set **Name** to **doWork**.
   1. Set **Enclosing Package** to **default**.
   1. Set **Runtime** to most recent **Node.js**.
   1. **Create**.
1. Change the action code to:
   ```js
   function main(args) {
     msg = "Hello, " + params.name + " from " + params.place;
     return { greeting:  msg, host: params.__ow_headers.host };
   }
   ```
   {: pre}
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
   {: pre}

### Expose the actions with a managed API


1. Go to [{{site.data.keyword.openwhisk_short}} / API](https://console.bluemix.net/openwhisk/apimanagement).
1. Create a new API:
   1. Set **Name** to **hello**.
   1. Set **Base path** to **/hello**.
   1. Add operation **/world** pointing to **hello** action.
   1. Add operation **/healthz** pointing to **healthz** action.
   1. Save

![Managed API](./api-gateway.png)

### Configure the custom domain for the managed API

1. Go to [APIs / Custom domains](https://console.bluemix.net/apis/domains).
1. Locate the custom domain linked to the org and space where you created the actions and the managed API.
1. Click **Change Settings** in the action menu
1. Check **Apply custom domain**
1. Set **Domain name** to the domain you will use with the CIS GLB, *hello-functions.mydomain.com*
1. Select the {{site.data.keyword.cloudcerts_short}} in the location where the actions are deployed
1. Select the certificate for the domain
1. In CIS / Reliability / DNS, create a new DNS TXT record mapping your domain to the API default domain / alias
1. Save the custom domain settings. The dialog will check for the TXT record.

![Custom Domains](./custom-domains.png)

![Custom Domain Cert](./custom-domain-cert.png)

## Create a global load balancer in CIS

1. Create a health check
   1. Set **Monitor type** to **HTTPS**
   1. Set **Path** to **/hello/healthz**
   1. Provision the resource
1. Create an origin pool per location
   1. Set **Name** to **hello-\<location>**
   1. Select the Health check create before
   1. Set **Health Check Region** to a region close to the location where {{site.data.keyword.openwhisk_short}} are deployed
   1. Set **Origin Name** to **hello-\<location>**
   1. Set **Origin Address** to the default domain / alias for the managed API (such as _5d3b1eb6.us-south.apiconnect.appdomain.cloud_)
   1. Provision the resource
1. Create a global load balancer
   1. Set **Hostname** to **hello-functions.mydomain.com**
   1. Add the regional origin pools 
   1. Provision the resources
1. After a short while, go to `https://hello-functions.mydomain.com/hello/world`. This should reply with the function running in the first healthy pool.

![Global Load Balancer](./glb.png)

![Pools](./pools.png)

![Health Check](./healthcheck.png)

## Test fail over

1. Edit the `health` function in the first origin pool location, and change its implementation to `throw new Error()`
1. Save
1. Wait for the health check to run for this origin pool
1. Get `https://hello-functions.mydomain.com/hello/world` again, it should now redirect to the other healthy pool

## Test load balancing

1. For load balancing, you would need to create one origin pool with all {{site.data.keyword.openwhisk_short}} APIs. CIS would then load balance queries from different clients between the {{site.data.keyword.openwhisk_short}} APIs.

## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{: #related}

* [Relevant links](https://blah)
