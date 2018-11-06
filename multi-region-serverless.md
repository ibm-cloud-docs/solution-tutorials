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

* Deploy {{site.data.keyword.openwhisk_short}} actions with a custom domain
* Distribute load across locations with Cloud Internet Services

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
* [{{site.data.keyword.cloudcerts_short}}](https://console.bluemix.net/catalog/services/cloudcerts)
* [Internet Services](https://console.bluemix.net/catalog/services/internet-svcs)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution44-multi-region-serverless/Architecture.png)
</p>

1. Users access the application. The request goes through Internet Services.
2. Internet Services redirect the users to the closest healthy API back-end.
3. {{site.data.keyword.cloudcerts_short}} provides the API with its SSL certificate. The traffic is encrypted end-to-end.
4. The API is implemented with {{site.data.keyword.openwhisk_short}}.

## Before you begin
{: #prereqs}

1. Install all the necessary command line (CLI) tools by [following these steps](https://console.bluemix.net/docs/cli/index.html#overview).

## Configure a custom domain

1. Get a custom domain such as *mydomain.com*
1. Create a Cloud Internet Services instance
1. Register the custom domain with Cloud Internet Services
1. Obtain a wildcard SSL certificate and private key for **.mydomain.com*. One can use Let's Encrypt via https://zerossl.com/. At some point you'll need to create DNS record of type TXT in CIS DNS to prove you are the owner of the domain.
1. Convert the Certificate CRT to PEM format:
   ```
   openssl x509 -in domain-crt.txt -out domain-crt.pem -outform PEM
   ```
1. Convert the Private Key to PEM format:
   ```
   openssl rsa -in domain-key.txt -out domain-key.pem -outform PEM
   ```

## Deploy actions in multiple locations

Repeat the following steps per location.

### Store certificate in {{site.data.keyword.cloudcerts_short}}

1. Create a {{site.data.keyword.cloudcerts_short}} instance
1. Import the SSL cert and private key for the custom domain in {{site.data.keyword.cloudcerts_short}}

![{{site.data.keyword.cloudcerts_short}}](./certificatemanager.png)

### Define {{site.data.keyword.openwhisk_short}}

1. Go to [{{site.data.keyword.openwhisk_short}} / Actions](https://console.bluemix.net/openwhisk/actions).
1. Create action **hello** from [*hello.js*](./hello.js).
1. Create action **healthz** from [*healthz.js*](./healthz.js).

![{{site.data.keyword.openwhisk_short}}](./actions-are-configured.png)

### Expose the {{site.data.keyword.openwhisk_short}} with a managed API

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
