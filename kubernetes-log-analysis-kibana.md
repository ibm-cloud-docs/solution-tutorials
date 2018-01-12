---

copyright:
  years: 2017, 2018

lastupdated: "2018-01-10"

---


{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}


# Analyze Kubernetes cluster and application logs in Kibana
{: #kibana_tutorial_1}

This tutorial walks you through creating a cluster, configuring the cluster to send logs to the {site.data.keyword.loganalysisshort}} service, deploying an application to the cluster and then using Kibana to view and analayze logs.
{:shortdesc}

## Objectives:

* Create a Kubernetes cluster.
* Provision the {{site.data.keyword.loganalysisshort}} service.
* Create logging configurations in the cluster.
* View, search and analyze logs in Kibana

## Prerequisites
{: #prereq}

* [Container registry with namespace configured](https://console.bluemix.net/docs/services/Registry/registry_setup_cli_namespace.html)
* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins
* [Basic understanding of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

## Create a Kubernetes cluster
{: #step1}

1. Create a Kubernetes cluster from the [{{site.data.keyword.Bluemix}} catalog](https://console.bluemix.net/containers-kubernetes/launch). Create a **Pay-As-You_Go** cluster. Log forwading is *not* enabled for the **Free** cluster.
  {:tip}
   ![Kubernetes Cluster Creation on IBM Cloud](images/solution17/KubernetesPaidClusterCreation.png)
2. For convinience, use the name `mycluster` to be consistent with this tutorial.
3. Check the status of your **Cluster** and **Worker Nodes** and wait for them to be **ready**.

**NOTE:** Do not proceed until your workers are ready. This might take up to one hour.

### Configure kubectl and helm

In this step, you'll configure kubectl to point to your newly created cluster going forward. [kubectl](https://kubernetes.io/docs/user-guide/kubectl-overview/) is a command line tool that you use to interact with a Kubernetes cluster.

1. Use `bx login` to log in interactively. Provide the organization (org), region and space under which the cluster is created. You can reconfirm the details by running `bx target` command.
2. When the cluster is ready, retrieve the cluster configuration:
   ```bash
   bx cs cluster-config <cluster-name>
   ```
   {: pre}
3. Copy and paste the **export** command to set the KUBECONFIG environment variable as directed. To verify whether the KUBECONFIG environment variable is set properly or not, run the following command:
  `echo $KUBECONFIG`
4. Check that the `kubectl` command is correctly configured
   ```bash
   kubectl cluster-info
   ```
   {: pre}
5. [Helm](https://helm.sh/) helps you manage Kubernetes applications through Helm Charts, which helps define, install, and upgrade even the most complex Kubernetes application. After your cluster workers are ready, run the command below to initialize Helm in your cluster.
   ```bash
   helm init
   ```
   {: pre}

## Configure your cluster to forward logs to the {{site.data.keyword.loganalysisshort}} service
{: #forwardlogs}

When an application is deployed, logs are collected automatically by the {{site.data.keyword.containershort}}. To forward these logs to the {{site.data.keyword.loganalysisshort}} service, you must create one or more [logging configurations](/docs/services/CloudLogAnalysis/containers/containers_kubernetes.html#log_sources) in your cluster that define:
* Where logs are to be forwarded. You can forward logs to the account domain or to a space domain.
* What logs are forwarded to the {{site.data.keyword.loganalysisshort}} service for analysis.

### Configure your cluster to forward logs
{: #containerlogs}

1. From the IBM Cloud Dashboard, select the **region**, **org** and **space** where you want to create your **Log Analysis** service.
2. From the [Catalog](https://console.bluemix.net/catalog/), select and create a **Log Analysis** service.
3. Run the following command to send *container* log files to the {{site.data.keyword.loganalysisshort}} service:
    ```
    bx cs logging-config-create mycluster --logsource container --namespace default --type ibm --hostname EndPoint --port 9091 --org OrgName --space SpaceName
    ```
    {: codeblock}
    where
    * *mycluster* is the name of your cluster.
    * *EndPoint* is the URL to the logging service in the region where the {{site.data.keyword.loganalysisshort}} service is provisioned. For a list of endpoints, see [Endpoints](/docs/services/CloudLogAnalysis/log_ingestion.html#log_ingestion_urls).
    * *OrgName* and *SpaceName* is the location where the {{site.data.keyword.loganalysisshort}} service is provisioned.

## Create a starter application
{: #create_application}
The `bx dev` tooling greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

1. Start the `bx dev` wizard.
   ```
   bx dev create
   ```
   {: pre}

2. Select `Backend Service / Web App` > `Node `> `Web App - Express.js Basic` to create a Node.js starter application.
3. Enter a **name** (`mynodestarter`) and a unique **hostname** (`username-mynodestarter`) for your project.
4. Select **n** to skip adding services.
![](images/solution17/bx_dev_create.png)
This generates a starter application complete with the code and all the necessary configuration files for local development and deployment to cloud on Cloud Foundry or Kubernetes. For an overview of the files generated, see [Project Contents Documentation](https://console.bluemix.net/docs/cloudnative/java_project_contents.html).

![](images/solution2/Contents.png

### Build the application

You can build and run the application as you normally would using `mvn` for java local development or `npm` for node development.  You can also build a docker image and run the application in a container to ensure consistent execution locally and on the cloud. Use the following steps to build your docker image.

1. Ensure your local Docker engine is started.
   ```
   docker ps
   ```
   {: pre}
2. Change to the generated project directory.
   ```
   cd <project name>
   ```
   {: pre}
3. Build the application.
   ```
   bx dev build
   ```
   {: pre}

   This might take a few minutes to run as all the application dependencies are downloaded and a Docker image, which contains your application and all the required environment, is built.

### Run the application locally

1. Run the container.
   ```
   bx dev run
   ```
   {: pre}

   This uses your local Docker engine to run the docker image that you built in the previous step.
2. After your container starts, go to http://localhost:3000/
  ![](images/solution17/node_starter_localhost.png)

## Deploy application to cluster
{: #deploy}

In this section, we first push the Docker image to the IBM Cloud private container registry, and then create a Kubernetes deployment pointing to that image.

1. Find your **namespace** by listing all the namespace in the registry.
   ```
   bx cr namespaces
   ```
   {: pre}
   If you have a namespace, make note of the name for use later. If you don't have one, create it.
   ```
   bx cr namespace-add <name>
   ```
   {: pre}
2. Find the **Container Registry** information by running.
   ```
   bx cr info
   ```
   {: pre}
3. Deploy to your Kubernetes cluster:
   ```
   bx dev deploy -t container
   ```
   {: pre}
4. When prompted, enter your **cluster name**.
5. Next, enter your **image name**. Use the following format: `<registry_url>/<namespace>/<projectname>`
6. Wait a few minutes for your application to be deployed.
7. Visit the URL displayed to access the application by `http://ip-address:portnumber/`


![](images/solution17/node_starter_cluster.png)

## View log data in Kibana
{: #step8}

The application generates some log data every time you visit its URL. Because of our logging configuration, this data should be forwarded to Log Analysis service and available via Kibana.

1. From the IBM Cloud **Dashboard**, select your **Log Analysis** instance and click **Launch**.
2. In the **Discover** page, look at the events that are displayed.
    ![](images/solution17/kibana_home.png)
    For more information about other search fields that are relevant to Kubernetes clusters, see [Searching logs](/docs/services/CloudLogAnalysis/containers/containers_kubernetes.html#log_search).

## Filter data by Kubernetes cluster name in Kibana
{: #step8}

In the table that is displayed in the *Discovery* page, you can see all the entries that are available for analysis. The entries that are listed correspond to the search query that is displayed in the *Search* bar. Use an asterisk (*) to display all entries within the period of time that is configured for the page.

For example, to filter the data by Kubernetes cluster name, modify the *Search* bar query. Add a filter based on the custom field *kubernetes.cluster_name_str*:

1. In the **Available fields** section, select the field *kubernetes.cluster_name_str*. A subset of available values for the field is displayed.    
2. Select the value that corresponds to the cluster for which you want to analyze logs.

    After you select the value, a filter is added to the *Search bar* and the table displays only entries that match the criteria you just selected.     


**Note:**

If you cannot see your cluster name, add a filter for any cluster name. Then, select the filter's edit symbol.    

The following query displays:

```
	{
        "query": {
          "match": {
            "kubernetes.cluster_name_str": {
              "query": "cluster1",
              "type": "phrase"
            }
          }
        }
      }
```
{: screen}

Replace the name of the cluster (*cluster1*) with the name of the cluster for which you want to view log data.

If you cannot see any data, try changing the time filter. For more information, see [Setting a time filter](/docs/services/CloudLogAnalysis/kibana/filter_logs.html#set_time_filter).

For more information, see [Filtering logs in Kibana](/docs/services/CloudLogAnalysis/kibana/filter_logs.html#filter_logs).
