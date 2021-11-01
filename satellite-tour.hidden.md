---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-10-28"
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

# Introduction to {{site.data.keyword.satelliteshort}} locations, clusters, link and config
{: #satellite-tour}
{: toc-content-type="tutorial"}
{: toc-services="satellite"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial guides you through the architecture and components of a {{site.data.keyword.satellitelong_notm}} location.
{: shortdesc}

With {{site.data.keyword.satellitelong_notm}}, you use your own compute infrastructure that is in your on-premises data center, other cloud providers, or edge networks to create a {{site.data.keyword.satelliteshort}} location. Then, you use the capabilities of {{site.data.keyword.satelliteshort}} to run {{site.data.keyword.cloud_notm}} services on your infrastructure, and consistently deploy, manage, and control your app workloads through a single pane of glass.

Your {{site.data.keyword.satelliteshort}} location includes tools like {{site.data.keyword.satelliteshort}} Link and {{site.data.keyword.satelliteshort}} Config to provide additional capabilities for securing and auditing network connections in your location and consistently deploying, managing, and controlling your apps and policies across clusters in the location.

## Objectives
{: #satellite-tour-objectives}

* Review the underlying infrastructure of an existing {{site.data.keyword.satelliteshort}} location.
* Expose {{site.data.keyword.Bluemix_notm}} services to the location with {{site.data.keyword.satelliteshort}} Link.
* Deploy an application to a {{site.data.keyword.openshiftlong_notm}} cluster running in the location.
* Use {{site.data.keyword.satelliteshort}} configurations to specify what Kubernetes resources you want to deploy to a group of {{site.data.keyword.openshiftlong_notm}} clusters.

![Architecture](./images/solution-satellite-tour-hidden/architecture.png){: class="center"}
{: style="text-align: center;"}

The {{site.data.keyword.satelliteshort}} architecture is comprised of:
* The Control Plane Master, running in {{site.data.keyword.cloud_notm}},
* Cloud services to support the {{site.data.keyword.satelliteshort}} location operations like {{site.data.keyword.loganalysisshort_notm}}, {{site.data.keyword.monitoringshort_notm}}, {{site.data.keyword.cos_short}},
* {{site.data.keyword.satelliteshort}} Link to securely connect the {{site.data.keyword.satelliteshort}} location back to {{site.data.keyword.cloud_notm}},
* Host infrastructure assigned to the {{site.data.keyword.satelliteshort}} control plane, and to clusters and services running in the {{site.data.keyword.satelliteshort}} location.

![App Architecture](./images/solution-satellite-tour-hidden/app-architecture.png){: class="center"}
{: style="text-align: center;"}

The application you will deploy will be running in one cluster in the location. It will access a {{site.data.keyword.postgresql}} database running in {{site.data.keyword.Bluemix_notm}} through {{site.data.keyword.satelliteshort}} Link.

<!--##istutorial#-->
## Before you begin
{: #satellite-tour-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`container-service`),
* `oc` to interact with OpenShift,

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

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

In this section, you will walk through the components that make up a {{site.data.keyword.satelliteshort}} location. A {{site.data.keyword.satelliteshort}} location is the location (on-premises, edge, or other cloud provider's infrastructure) to which {{site.data.keyword.Bluemix_notm}} Services will be extended.

### using {{site.data.keyword.cloud_notm}} console
{: #satellite-tour-architecture-ui}

1. Navigate to [the list of locations](https://{DomainName}/satellite/locations). It lists the location you have been provided access to.
2. Select the location. The location is managed from one {{site.data.keyword.cloud_notm}} region, such as Washington DC or London.
3. Under **Hosts**, you find all hosts that have been attached to the {{site.data.keyword.satelliteshort}} location:
   * a set of hosts has been assigned to the location **Control plane**.
   * other hosts are assigned to {{site.data.keyword.satelliteshort}}-enabled services like **OpenShift clusters**.
   * remaining hosts are unassigned until they are manually or [automatically](https://{DomainName}/docs/satellite?topic=satellite-hosts#host-autoassign-ov) assigned to {{site.data.keyword.satelliteshort}}-enabled services.

### using {{site.data.keyword.cloud_notm}} CLI
{: #satellite-tour-architecture-cli}

`ibmcloud sat` is the CLI plugin for {{site.data.keyword.satelliteshort}}. It provides commands to work with all {{site.data.keyword.satelliteshort}} components.

1. From the CLI (in [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) as example), view available commands:
   ```sh
   ibmcloud sat
   ```
   {: pre}

1. List all locations:
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

## Review the logging and monitoring dashboards for the location
{: #satellite-tour-observe-location}
{: step}

A {{site.data.keyword.satelliteshort}} location and the {{site.data.keyword.cloud_notm}} services that run in the location can be set up to send logs to {{site.data.keyword.loganalysislong_notm}} and metrics to {{site.data.keyword.monitoringlong_notm}}.

Under [Logging](https://{DomainName}/observe/logging):
1. Locate the {{site.data.keyword.loganalysislong_notm}} service instance marked as **Platform logs** for the region from which the {{site.data.keyword.satelliteshort}} location is managed.
1. Click the **Open dashboard** link to access the {{site.data.keyword.satelliteshort}} location logs.
1. Set the search to `host:satellite` to view only logs from {{site.data.keyword.satelliteshort}}. You can filter even more by setting the `app` attribute to the {{site.data.keyword.satelliteshort}} location CRN or using the **Sources** and **Apps** filters at the top of the window.
   ```sh
   host:satellite app:crn:v1:bluemix:public:satellite:us-east:a/123456:c2k1k2jw0ofn1234::
   ```
   {: codeblock}

1. By default, three types of logs are automatically generated for your {{site.data.keyword.satelliteshort}} location: R00XX-level error messages, the status of whether resource deployment to the location is enabled, and the status of {{site.data.keyword.satelliteshort}} Link. Refer to [Logging for {{site.data.keyword.satelliteshort}}](https://{DomainName}/docs/satellite?topic=satellite-health) for details on how to analyze logs.

The same applies to [Monitoring](https://{DomainName}/observe/monitoring):
1. Locate the {{site.data.keyword.monitoringlong_notm}} service instance marked as **Platform metrics** for the region from which the {{site.data.keyword.satelliteshort}} location is managed.
1. Click the **Open dashboard** link to access the {{site.data.keyword.satelliteshort}} location metrics.
1. In the **Dashboards** list, select **Satellite Link - Overview** to get a global overview of {{site.data.keyword.satelliteshort}} link metrics like the number of tunnels or the location and endpoint traffic.
1. Change the time horizon to view past data.
1. Refer to [Monitoring for {{site.data.keyword.satelliteshort}}](https://{DomainName}/docs/satellite?topic=satellite-monitor#available-metrics) for an overview of the available metrics.

{{site.data.keyword.openshiftshort}} clusters can also be configured to send their [logs](https://{DomainName}/docs/satellite?topic=satellite-health#setup-clusters) and [metrics](https://{DomainName}/docs/satellite?topic=satellite-monitor#setup-clusters) to {{site.data.keyword.cloud_notm}}.

## Create a new project in the {{site.data.keyword.satelliteshort}} cluster
{: #satellite-tour-project}
{: step}

In the following section, you will deploy an application to a {{site.data.keyword.satelliteshort}} cluster and configure this application to access through {{site.data.keyword.satelliteshort}} Link a service running in {{site.data.keyword.cloud_notm}}.

1. Go to [the list of {{site.data.keyword.satelliteshort}} clusters](https://{DomainName}/satellite/clusters).
1. Select a cluster from your location.
1. Use the button **Manage cluster** to access the overview page of the {{site.data.keyword.openshiftshort}} cluster.

   You can also find the cluster directly from [the list of {{site.data.keyword.openshiftshort}} clusters](https://{DomainName}/kubernetes/clusters?platformType=openshift).
   {: tip}

1. To log in the cluster, click the **OpenShift web console** button.
1. In the web console, click the drop-down under your name in the right corner of your screen and select **Copy Login Command**.
1. In the window that opens, click **Display token**.
1. Copy and paste the **Log in with this token** command in your shell window.
1. Create a new {{site.data.keyword.openshiftshort}} project:
   ```sh
   oc new-project <your-initials>-tour
   ```
   {: pre}

## Use {{site.data.keyword.satelliteshort}} link to expose {{site.data.keyword.cloud_notm}} services
{: #satellite-tour-link}
{: step}

With {{site.data.keyword.satelliteshort}} Link endpoints, you can allow any client that runs in your {{site.data.keyword.satelliteshort}} location to connect to a service, server, or app that runs outside of the location, or allow a client that is connected to the {{site.data.keyword.cloud_notm}} private network to connect to a service, server, or app that runs in your location.

1. Locate the existing {{site.data.keyword.databases-for-postgresql}} service instance in the [Resource list](https://{DomainName}/resources) list.
1. In the **Service credentials**, locate the credentials that have already been created for use with {{site.data.keyword.satelliteshort}}.
1. Make note of the values for the following keys:
   * `connection` / `postgres` / `hosts` / `hostname`
   * `connection` / `postgres` / `hosts` / `port`
   * `connection` / `postgres` / `authentication` / `username`
   * `connection` / `postgres` / `authentication` / `password`
   * `connection` / `postgres` / `database`

Looking at the value for `hostname`, notice that this instance is using a private endpoint so it can only be accessed within {{site.data.keyword.Bluemix_notm}} private network. {{site.data.keyword.satelliteshort}} Link will be used to expose the service to your location.

1. Go to [the list of locations](https://{DomainName}/satellite/locations) and select your {{site.data.keyword.satelliteshort}} location.
1. Under **Link endpoints**, click **Create an endpoint** to start the creation wizard.
1. In the **Destination resource** step:
   * Select **Cloud** as destination.
   * Click **Next**.
1. In the **Resource details** step:
   * Set **Endpoint name** to something unique such as `<your-initials>-database`.
   * Set **Destination FQDN or IP** to the **hostname** of the database, taken from the credentials.
   * Set **Destination port** to the **port** of the database.
   * Click **Next**.
1. In the **Protocol** step:
   * Set the **Source protocol** as **TCP**
   * Click **Next**.
1. Click **Create endpoint**.
1. Select the created endpoint.
1. After few seconds, the endpoint will be ready and the **Endpoint address** (`host:port`) filled. You may need to refresh the page for the endpoint address to become visible.

With these steps you enabled, over a secured link, the connectivity between {{site.data.keyword.postgresql}} service instance and the applications running in the {{site.data.keyword.satelliteshort}} location.

## Deploy a test application to a {{site.data.keyword.satelliteshort}} cluster
{: #satellite-tour-deploy}
{: step}

1. From the command line, create a new application in the OpenShift project:
   ```sh
   oc new-app python~https://github.com/IBM/satellite-link-example.git --name link-example
   ```
   {: pre}

1. Wait for the first build of the application to complete by monitoring the logs:
   ```sh
   oc logs -f bc/link-example
   ```
   {: pre}

1. When the build is complete, create a secure route to access the application:
   ```sh
   oc create route edge link-example-https --service=link-example --port=8080
   ```
   {: pre}

1. Retrieve the created route:
   ```sh
   oc get route link-example-https --output json | jq -r '"https://" + .spec.host'
   ```
   {: pre}
   
1. Open the route URL to access the application.

The application allows to query a {{site.data.keyword.postgresql}} database. The form prompts you for the database credentials. These credentials will be sent to the application running in the cluster and the connection will be made to the database over {{site.data.keyword.satelliteshort}} link.

1. Use the Endpoint address to set the values for `hostname`, `port`.
1. Fill `username`, `password` and `database` from the credentials in the previous section.
1. Click `Login`.
1. Try out some SQL commands to verify the connection with the database:
1. Create a table:
   ```sql
   CREATE TABLE <your-initials>_EMPLOYEE( FIRST_NAME CHAR(20) NOT NULL, LAST_NAME CHAR(20), AGE INT, SEX CHAR(1), INCOME FLOAT )
   ```
   {: codeblock}

   To avoid conflicts with other users of the database, use a unique table name like `<your-initials>_EMPLOYEE`.
   {: tip}
   
1. Insert a row
   ```sql
   INSERT INTO <your-initials>_EMPLOYEE(FIRST_NAME, LAST_NAME, AGE, SEX, INCOME) VALUES ('John', 'Win', 30, 'M', 9000)
   ```
   {: codeblock}

1. List all rows
   ```sql
   SELECT * FROM <your-initials>_EMPLOYEE
   ```
   {: codeblock}

1. Delete the table
   ```sql
   DROP TABLE <your-initials>_EMPLOYEE
   ```
   {: codeblock}

This simple application demonstrated how you can make any service running in {{site.data.keyword.Bluemix_notm}} available to your {{site.data.keyword.satelliteshort}} location over a secured connection provided by {{site.data.keyword.satelliteshort}} Link.

## Configure a group of clusters with {{site.data.keyword.satelliteshort}} config
{: #satellite-tour-config}
{: step}

With [{{site.data.keyword.satelliteshort}} configurations](https://{DomainName}/docs/satellite?topic=satellite-cluster-config), you can consistently deploy Kubernetes resources across {{site.data.keyword.openshiftlong_notm}} clusters. You define cluster groups and subscriptions to map the groups to a specific version of a set of Kubernetes resources.

### Create a cluster group
{: #satellite-tour-cluster-group}

1. Go to the [Cluster groups](https://{DomainName}/satellite/groups) page.
1. Create a new cluster group with a unique name such as `<your-initials>-cluster-group`.
1. Select the group.
1. Under **Clusters**, click **Add clusters** and check the cluster you previously deployed your app to.

You have now defined a set of clusters you can consistency deploy Kubernetes resources to.

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
   * Set the YAML content to the following, making sure the `namespace` matches the name of the OpenShift project you created earlier:
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
     {: pre}

   * Click **Add**.

### Subscribe clusters to the version
{: #satellite-tour-version}

Finally you will map the version to a set of clusters.

1. Go back to the **Overview** page for the configuration.
1. Create a Subscription.
   * Set **Subscription name** to a unique name such as `<your-initials>-latest`.
   * Set **Version** to **V1**.
   * Select the cluster group previously created.
1. Click **Create**.

{{site.data.keyword.satelliteshort}} will now deploy the resources described in the YAML to the clusters.

### Check the deployed resources
{: #satellite-tour-deployed}

1. After a short while, from the shell, list the config maps in your project. Repeat until you see the `example` config map in the list:
   ```sh
   oc get configmaps
   ```
1. The config map was automatically deployed to this cluster by {{site.data.keyword.satelliteshort}} Config. Retrieve its values:
   ```sh
   oc describe configmap example
   ```
   {: pre}

You can also use the {{site.data.keyword.openshiftshort}} console to view the config map:
1. Switch to the **Developer** view.
1. Select **Config Maps**.
1. Make sure your project is selected.
1. Locate the config map named **example**.

To deploy an update to the resources, you can create a new version.

1. From the [Configurations](https://{DomainName}/satellite/configuration) page, select the configuration you created.
1. Create a new version by duplicating **V1**.
   * Set **Version name** to **V2**.
   * Change `example.property.2` to `you` in the YAML.
1. **Add** the version.
1. Back to the **Overview** page for the configuration, edit the existing subscription and change its **Version** to **V2**.
1. In the OpenShift console or from the shell, watch for updates to the existing Config Map.

In this example we deployed a simple ConfigMap but you could be deploying a full solution stack using {{site.data.keyword.satelliteshort}} Config and manage your fleet of clusters centrally.

## Remove resources
{: #satellite-tour-removeresources}
{: step}

* In the {{site.data.keyword.openshiftshort}} console, delete the project or use `oc delete project <your-initials>-tour`.
* Select the [{{site.data.keyword.satelliteshort}} configuration](https://{DomainName}/satellite/configuration) your created.
* Delete the subscription.
* Delete the {{site.data.keyword.satelliteshort}} configuration.
* Delete the [cluster group](https://{DomainName}/satellite/groups).
* On the {{site.data.keyword.satelliteshort}} location, delete the Link Endpoint exposing the service you provisioned.

