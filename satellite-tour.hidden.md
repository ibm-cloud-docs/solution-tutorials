---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-06-17"
lasttested: "2021-06-07"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: satellite
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}
{:deprecated: .deprecated}
{:important: .important}
{:note: .note}
{:tip: .tip}
{:preview: .preview}
{:beta: .beta}

# Satellite Tour
{: #satellite-tour}
{: toc-content-type="tutorial"}
{: toc-services="satellite"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This tutorial guides you through the architecture and components of a {{site.data.keyword.satellitelong_notm}} location.
{:shortdesc}

With {{site.data.keyword.satellitelong_notm}}, you use your own compute infrastructure that is in your on-premises data center, other cloud providers, or edge networks to create a {{site.data.keyword.satelliteshort}} location. Then, you use the capabilities of {{site.data.keyword.satelliteshort}} to run {{site.data.keyword.cloud_notm}} services on your infrastructure, and consistently deploy, manage, and control your app workloads.

Your {{site.data.keyword.satelliteshort}} location includes tools like {{site.data.keyword.satelliteshort}} Link and {{site.data.keyword.satelliteshort}} Config to provide additional capabilities for securing and auditing network connections in your location and consistently deploying, managing, and controlling your apps and policies across clusters in the location.

## Objectives
{: #satellite-tour-objectives}

* Review the underlying infrastructure of an existing {{site.data.keyword.satelliteshort}} location.
* Deploy an application to a {{site.data.keyword.openshiftlong_notm}} cluster running in the {{site.data.keyword.satelliteshort}} location exposing services with {{site.data.keyword.satelliteshort}} Link.
* Use {{site.data.keyword.satelliteshort}} configurations to specify what Kubernetes resources you want to deploy to a group of {{site.data.keyword.openshiftlong_notm}} clusters.

![Architecture](./images/solution-satellite-tour-hidden/architecture.png)

## Before you begin
{: #satellite-tour-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
* a Docker engine,
* `oc` to interact with OpenShift,

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{:tip}
<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Start a new {{site.data.keyword.cloud-shell_notm}}
{: #satellite-tour-shell}
{: step}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, select the account where you have been invited.
1. Click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell).

-->
<!--#/isworkshop#-->

## Understand the architecture of the {{site.data.keyword.satelliteshort}} location
{: #satellite-tour-architecture}
{: step}

In this section, you will discover the components making a {{site.data.keyword.satelliteshort}} location.

### using {{site.data.keyword.cloud_notm}} console
{: #satellite-tour-architecture-ui}

1. Navigate to [the list of locations](https://{DomainName}/satellite/locations). It lists the location you have been provided access to.
2. Select the location. The location is managed from one {{site.data.keyword.cloud_notm}} region, such as Washington or London.
3. Under **Hosts**, you find all hosts that have been attached to the {{site.data.keyword.satelliteshort}} location:
   * a set of hosts has been assigned to the location **Control plane**.
   * other hosts are assigned to {{site.data.keyword.satelliteshort}}-enabled services like **OpenShift clusters**.
   * remaining hosts are unassigned until they are manually or [automatically](https://{DomainName}/docs/satellite?topic=satellite-hosts#host-autoassign-ov) assigned to {{site.data.keyword.satelliteshort}}-enabled services.
walk attendees through the architecture of the location, using the CLI, using the user interface:

### using {{site.data.keyword.cloud_notm}} CLI
{: #satellite-tour-architecture-cli}

1. From the CLI (in {{site.data.keyword.cloud-shell_short}} as example), list all locations:
   ```sh
   ibmcloud sat location ls
   ```
   {: pre}
1. To view the details of a location, use:
   ```sh
   ibmcloud sat location get --location <name-or-id>
   ```
   {: pre}
1. Retrieve all hosts attached to a location with:
   ```sh
   ibmcloud sat host ls --location <name-or-id>
   ```
   {: pre}
   It also reports whether hosts are part of the control plane (`infrastructure`), or a part of a cluster, or unassigned.
1. To list all {{site.data.keyword.satelliteshort}} clusters, use:
   ```sh
   ibmcloud sat cluster ls
   ```
   {: pre}

## Review the logging and monitoring dashboards
{: #satellite-tour-observe}
{: step}

### For the {{site.data.keyword.satelliteshort}} location
{: #satellite-tour-observe-location}

1. use Platform Logging and Platform Metrics instances
1. available metrics https://{DomainName}/docs/satellite?topic=satellite-monitor#available-metrics

### For the {{site.data.keyword.satelliteshort}} cluster
{: #satellite-tour-observe-cluster}

* can be configured to forward logs/metrics to anything including our logdna/sysdig

## Create a new project in the {{site.data.keyword.satelliteshort}} cluster
{: #satellite-tour-project}
{: step}

1. Log in into one cluster
1. Follow the instructions under `Actions / Connect via CLI` to access the cluster from the CLI in cloud shell
   * eventually a command like `oc login --token=XXX --server=https://123455.us-east.satellite.appdomain.cloud:30755`
   * use oc commands as if it was a regular cluster
   * or https://cloud.ibm.com/docs/openshift?topic=openshift-access_cluster#access_oc_cli to log in with API key or one-time code
1. Create a new oc project
   ```sh
   oc new-project <your-initials>-tour
   ```
   {: pre}

## Use {{site.data.keyword.satelliteshort}} link to expose {{site.data.keyword.cloud_notm}} services
{: #satellite-tour-link}
{: step}

### Provision a service
{: #satellite-tour-link-service}

1. Provision a {{site.data.keyword.cloudant}} service instance.
1. Create service credentials.

### Expose the service to the {{site.data.keyword.satelliteshort}} location
{: #satellite-tour-link-location}

1. Select the {{site.data.keyword.satelliteshort}} location.
1. Under **Link endpoints**, click **Create an endpoint** to start the creation wizard.
1. In the **Destination resource** step:
   * Select **Cloud** as destination.
   * Click **Next**.
1. In the **Resource details** step:
   * Set **Endpoint name** to something unique such as `<your-initials>-database`.
   * Set **Destination FQDN or IP** to the **host** of the database, taken from the credentials.
   * Set **Destination port** to **443**.
   * Click **Next**.
1. In the **Protocol** step:
   * Set the **Source protocol** as **HTTPS**
   * Click **Next**.
1. Click **Create endpoint**.
1. Select the created endpoint.
1. After few seconds, the **Endpoint address** is ready to be used.

## Deploy an application to a {{site.data.keyword.satelliteshort}} cluster
{: #satellite-tour-deploy}
{: step}

### Create an application
{: #satellite-tour-deploy-create-app}

1. In the OpenShift console, switch the **Developer** perspective.
1. Select the project you created.
1. Click **+Add** and select the option named **From Git**.
1. Set **Git Repo URL** to **https://github.com/l2fprod/mytodo.git**.
1. Click **Create**.
1. Wait for the **Build** to complete and the application to come online.

At that stage the application is running but not using the database yet.

### Bind the service
{: #satellite-tour-deploy-bind-service}

1. Select the Deployment **mytodo-git**.
1. Under **Environment**, define two **Single values (env)**:
   * One with **Name** set to **CLOUDANT_APIKEY** and **Value** to the **apikey** value of the database credentials.
   * Another one with **Name** set to **CLOUDANT_URL** and with **Value** set to **https://<endpoint address and port>** created in the previous step.
1. Save the environment.
1. A new pod will be created and the database initialized.

## Configure a group of clusters with {{site.data.keyword.satelliteshort}} config
{: #satellite-tour-config}
{: step}

With [{{site.data.keyword.satelliteshort}} configurations](https://{DomainName}/docs/satellite?topic=satellite-cluster-config), you can consistently deploy Kubernetes resources across {{site.data.keyword.openshiftlong_notm}} clusters. You define cluster cluster groups and subscriptions to map the groups to a specific version of a set of Kubernetes resources.

### Create a cluster group
{: #satellite-tour-cluster-group}

1. Go to the [Cluster groups](https://{DomainName}/satellite/groups) page.
1. Create a new cluster group with a unique name such as `<your-initials>-cluster-group`.
1. Select the group.
1. Under **Clusters**, click **Add clusters** and check the cluster where you previously deployed your app.

### Create a configuration and a first version
{: #satellite-tour-configuration}

The next step is to create a {{site.data.keyword.satelliteshort}} configuration.

1. Navigate to [{{site.data.keyword.satelliteshort}} Configurations](https://{DomainName}/satellite/configuration).
1. Create a new configuration:
   * Set **Configuration name** to a unique name such as `<your-initials>-config`.
   * For **Satellite Config data location** use the same value as your {{site.data.keyword.satelliteshort}} location.
1. Select the configuration.
1. Under **Versions**, add a version.
   * Set **Version name** to **V1**
   * Set the YAML content to
     ```yaml
     apiVersion: v1
     kind: ConfigMap
     metadata:
       name: example
       namespace: <your-initials>-tour
     data:
       example.property.1: hello
       example.property.2: world
     ```
     Make sure the `namespace` matches the name of the OpenShift project you created earlier. This YAML will create a new config map in this project.
    {: important}

### Subscribe clusters to the version
{: #satellite-tour-version}

Finally you will map the version to a set of clusters.

1. Go back to the **Overview** page for the configuration.
1. Create a Subscription.
   * Set **Subscription name** to **latest version**.
   * Set **Version** to **V1**.
   * Select the cluster group previously created.
1. Click **Create**.

### Check the deployed resources
{: #satellite-tour-deployed}

{{site.data.keyword.satelliteshort}} will now deploy the resources described in the YAML to the cluster.

1. After a short while, open the {{site.data.keyword.openshiftshort}} console for the cluster.
1. Switch to the **Developer** view.
1. Select **Config Maps** and make sure your project is selected
1. Locate the config map named **example**. It was automatically deployed to this cluster by {{site.data.keyword.satelliteshort}} Config.

To deploy an update to the resources, you can create a new version.

1. From the [Configurations](https://{DomainName}/satellite/configuration) page, select the configuration you created.
1. Create a new version by duplicating **V1**.
   * Set **Version name** to **V2**.
   * Change `example.property.2` to `you` in the YAML.
1. **Add** the version.
1. Back to the **Overview** page for the configuration, select the existing subscription and change its **Version** to **V2**.
1. In the OpenShift console, watch for updates to the existing Config Map.

In this example we deployed a simple ConfigMap but you could be deploying a full solution stack using {{site.data.keyword.satelliteshort}} Config and manage your fleet of clusters centrally.

## Remove resources
{: #satellite-tour-removeresources}
{: step}

* In the {{site.data.keyword.openshiftshort}} console, delete the project.
* Select the [{{site.data.keyword.satelliteshort}} configuration](https://{DomainName}/satellite/configuration) your created.
* Delete the subscription.
* Delete the {{site.data.keyword.satelliteshort}} configuration.
* Delete the [cluster group](https://{DomainName}/satellite/groups).
* On the {{site.data.keyword.satelliteshort}} location, delete the Link Endpoint exposing the service you provisioned.
* Delete the service from the [Resources list](https://{DomainName}/resources).

## Related content
{: #satellite-tour-related}

* [About {{site.data.keyword.satelliteshort}}](https://{DomainName}/docs/satellite?topic=satellite-about)
