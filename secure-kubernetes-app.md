---
copyright:
  years: 2018
lastupdated: "2018-08-01"

---

{:java: #java .ph data-hd-programlang='java'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Leverage security services for a Kubernetes app
The solution features an app that enables groups of users to upload files to a common storage pool and provide access to those files via shareable links. The app is written in Node.js and deployed as Docker container to the {{site.data.keyword.containershort_notm}}. It leverages several security-related services and features to improve app security.
{:shortdesc}

## Objectives
{: #objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
* [{{site.data.keyword.registryshort}}](https://console.bluemix.net/containers-kubernetes/launchRegistryView)
* [{{site.data.keyword.appid_short}}](https://console.bluemix.net/catalog/services/AppID)
* [{{site.data.keyword.cloudant_short_notm}}](https://console.bluemix.net/catalog/services/cloudantNoSQLDB)
* [{{site.data.keyword.cos_short}}](https://console.bluemix.net/catalog/services/cloud-object-storage)
* [{{site.data.keyword.cloudaccesstrailshort}}](https://console.bluemix.net/catalog/services/activity-tracker)
* [{{site.data.keyword.keymanagementserviceshort}}](https://console.bluemix.net/catalog/services/key-protect)
* [{{site.data.keyword.cloudcerts_short}}](https://console.bluemix.net/catalog/services/certificate-manager)

This tutorial requires a [non-Lite account](https://console.bluemix.net/docs/account/index.html#accounts) and may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution1/Architecture.png)
</p>

1. The user does this
2. Then that

## Before you begin
{: #prereqs}

* [Install all the necessary command line (CLI) tools by following](https://console.bluemix.net/docs/cli/index.html#overview)

## Create services
{: setup}

rough outline
* Prepare org and space
* Deploy Activity Tracker (no config necessary..?)
* create K8S cluster, takes a while...
* Deploy Key Protect
* create your own key (how?), import as root key into KP
* deploy COS (no config needed?)
* deploy Cloudant
* deploy App ID, config login page
* git clone the repo
* configure and push app: how much config can be done automatically? do this as container, push to registry, use vulnerability advisor as part of CR
* configure App ID, set redirect page (could be don from within code)
* optional: custom domain, deploy CM, deploy cert to cluster, config ingress


In this section, you will create the services required to ...

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started). It assumes that you already have a Cloud Foundry organization and space created.
    ```sh
    ibmcloud login
    ```
    {: pre}
    ```sh
    ibmcloud target --cf
    ```
    {: pre}
2. Create an instance of [{{site.data.keyword.cloudaccesstrailshort}}](https://console.bluemix.net/catalog/services/activity-tracker) and name it **SKAActivityTracker**.
    ```sh
    ibmcloud service create accesstrail free SKAActivityTracker
    ```
    {: pre}
3. Create a new [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster) cluster. First, decide on an available zone within your region:
    ```sh
    ibmcloud ks zones
    ```
    {: pre}
    For the zone of your choice (**YOURZONE**) look up the VLAN identifiers for the public and private network:
    ```sh
    ibmcloud ks vlans --zone YOURZONE
    ```
    {: pre}
    Finally, create a cluster named **SKACluster** with 2 worker nodes and virtual, shared machines with 2 cores and 4 GB of RAM. Replace the VLAN IDs with the obtained values.
    ```sh
    ibmcloud ks cluster-create --name SKACluster --zone YOURZONE --machine-type u2c.2x4 --workers 2 --public-vlan PUBLIC-ID --private-vlan PRIVATE-ID
    ```
    {: pre}

## Solution Specific Section
{: #section_one}

Introductory statement that overviews the section

1. Step 1 Click **This** and enter your name.

  This is a tip.
  {:tip}

2. Keep each step as short as possible.
3. Do not use blank lines between steps except for tips or images.
4. *Avoid* really long lines like this one explaining a concept inside of a step. Do not offer optional steps or FYI inside steps. *Avoid* using "You can do ...". Be prescriptive and tell them exactly what to do succinctly, like a lab.
5. Do not use "I", "We will", "Let's", "We'll", etc.
6. Another step
7. Try to limit to 7 steps.

### Sub section

   ```bash
   some shellscript
   ```
   {: pre}


## Another Solution Specific Section
{: #section_two}

Introductory statement that overviews the section

### Sub section

## Remove resources
{:removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{:related}

* [Secure Apps on IBM Cloud with Wildcard Certificates](https://www.ibm.com/blogs/bluemix/2018/07/secure-apps-on-ibm-cloud-with-wildcard-certificates/)
* more blogs
* and some more
