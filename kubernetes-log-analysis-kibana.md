---
copyright:
  years: 2017, 2018

lastupdated: "2018-04-19"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}


# Analyze logs and monitor the health of Kubernetes applications

This tutorial walks you through creating a cluster and configuring the Log Analysis and the Monitoring service. Then, you will deploy an application to the cluster, use Kibana to view and analyze logs, and use Grafana to view health and metrics.
{:shortdesc}

## Objectives:

* Create a Kubernetes cluster.
* Provision the Log Analysis service.
* Create logging configurations in the cluster.
* Deploy application
* View, search and analyze logs in Kibana
* View metrics in Grafana

![](images/solution17/Architecture.png)

## Prerequisites
{: #prereq}

* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins
* [Container registry with namespace configured](https://console.bluemix.net/docs/services/Registry/registry_setup_cli_namespace.html)
* [Basic understanding of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

## Create a Kubernetes cluster
{: #create_cluster}

1. Create **Containers in Kubernetes Clusters** from the [{{site.data.keyword.Bluemix}} catalog](https://console.bluemix.net/containers-kubernetes/catalog/cluster/create) and choose the **Standard** cluster.

   Log forwarding is *not* enabled for the **Free** cluster.
   {:tip}

   ![Kubernetes Cluster Creation on IBM Cloud](images/solution17/KubernetesPaidClusterCreation.png)
2. For convenience, use the name `mycluster` to be consistent with this tutorial.
3. The smallest **Machine type** with 2 **CPUs** and 4 **GB RAM** is sufficient for this tutorial. Select 1 **Worker node** and leave all other options set to defaults. Click **Create Cluster**.
4. Check the status of your **Cluster** and **Worker Node** and wait for them to be **ready**.

**NOTE:** Do not proceed until your workers are ready.

### Configure kubectl and helm

In this step, you'll configure kubectl to point to your newly created cluster going forward. [kubectl](https://kubernetes.io/docs/user-guide/kubectl-overview/) is a command line tool that you use to interact with a Kubernetes cluster.

1. Update your **bx** plugins by running `bx plugin update`.
2. Use `bx login` to log in interactively. Provide the account under which the cluster is created. You can reconfirm the details by running `bx target` command.
3. When the cluster is ready, retrieve the cluster configuration:
   ```bash
   bx cs cluster-config <cluster-name>
   ```
   {: pre}
4. Copy and paste the **export** command to set the KUBECONFIG environment variable as directed. To verify whether the KUBECONFIG environment variable is set properly or not, run the following command:
  `echo $KUBECONFIG`
5. Check that the `kubectl` command is correctly configured
   ```bash
   kubectl cluster-info
   ```
   {: pre}
6. [Helm](https://helm.sh/) helps you manage Kubernetes applications through Helm Charts, which helps define, install, and upgrade even the most complex Kubernetes application. After your cluster workers are ready, run the command below to initialize Helm in your cluster.
   ```bash
   helm init
   ```
   {: pre}

## Configure your cluster to forward logs to the {{site.data.keyword.loganalysisshort}} service
{: #forwardlogs}

When an application is deployed to a container in a **standard** cluster, logs are collected automatically by the {{site.data.keyword.containershort}}. To forward these logs to the {{site.data.keyword.loganalysisshort}} service, you must enable in your cluster that define:

  - Where logs are to be forwarded. You can forward logs to the account domain or to a space domain.
  - What logs are forwarded to the {{site.data.keyword.loganalysisshort}} service for analysis.

1. To **enable logging**, navigate to [clusters](https://console.bluemix.net/containers-kubernetes/clusters) and select the appropriate **location** to see the cluster you created above - `mycluster`. Select the cluster.
2. Under **Summary**, click **Enable logging.**
3. On **Create Logging Configuration** window, select the appropriate Cloud Foundry **Org** and **Space.**

 To enable logging at the account level, you must use CLI. Refer **Enabling log forwarding** section of [logging and monitoring](https://console.bluemix.net/docs/containers/cs_health.html#logging)
 {:tip}

4. Enable all the **Log sources** and click **Create**.

   ![](images/solution17/cluster_logging.png)

If you specified a space when you created the cluster then both the account owner and IBM Cloud Container Service key owner need `Manager`, `Developer`, or `Auditor` permissions in that space, refer **before you begin** section of [logging and monitoring](https://console.bluemix.net/docs/containers/cs_health.html#logging)
{:tip}

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
  ![](images/solution17/bx_dev_create.png)

4. Choose **No DevOps** and Select **n** to skip adding services.

  Once complete, this generates a starter application complete with the code and all the necessary configuration files for local development and deployment to cloud on Cloud Foundry or Kubernetes. For an overview of the files generated, see [Project Contents Documentation](https://console.bluemix.net/docs/cloudnative/node_project_contents.html).

  ![](images/solution17/node_starter_contents.png)

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
3. Edit the file `server/server.js` and add the following code to the bottom of the file. This will output various random types of log message every second.

   ```
   setInterval(() => {
     var randomInt = Math.floor(Math.random() * 10);
     if (randomInt < 5)
       logger.info('Cheese is Gouda.');
     else if (randomInt >= 5 && randomInt < 8)
       logger.warn('Cheese is quite smelly.');
     else if (randomInt == 8)
       logger.fatal('Cheese was breeding ground for listeria.');
     else
       logger.error('Cheese is too ripe!');
   }, 1000)
   ```
4. Build the application.
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

The IBM Cloud has a Container Registry that is private to you. Let's push the Docker image there, and then create a Kubernetes deployment pointing to that image.

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
7. Visit the URL displayed to access the application by `http://worker-public-ip:portnumber/`. If you do not see a port number, run `kubectl get services` and look for the 5 digit port number next to your application service.
  ![](images/solution17/kubectl_get_services.png)
  ![](images/solution17/node_starter_cluster.png)

To set up Ingress and use your own custom domain see the [Use your own custom domain](/docs/tutorials/scalable-webapp-kubernetes.html#custom_domain) section of the [Deploy a scalable web application on Kubernetes](/docs/tutorials/scalable-webapp-kubernetes.html) tutorial.


## View log data in Kibana
{: #step8}

The application generates some log data every time you visit its URL. Because of our logging configuration, this data should be forwarded to {{site.data.keyword.loganalysisshort}} service and available via Kibana.

1. To view **log data**, navigate to [clusters](https://console.bluemix.net/containers-kubernetes/clusters) and select the appropriate **location** to see the cluster you created above - `mycluster`. Select the cluster.
2. Next to **Logs**, click **View**. This should launch Kibana in a new tab.
3. Click on your username in the upper right corner to select the correct **account**, **org** and **space**.

![](images/solution17/kibana_home.png)
For more information about other search fields that are relevant to Kubernetes clusters, see [Searching logs](/docs/services/CloudLogAnalysis/containers/containers_kubernetes.html#log_search).

### Filter data by Kubernetes cluster name in Kibana
{: #step8}

1. In the filtering menu on the left, you can filter down to only see message from the container you are interested in by expanding `kubernetes.container_name_str` and clicking on the container name.
2. Click on the **add** button next to **message** to only see the log messages.
   ![](images/solution17/message_add.png)
3. Adjust the displayed interval by navigating to the upper right and clicking on **Last 15 minutes**. Adjust the value to **Last 24 hours**.
4. Next to the configuration of the interval is the auto-refresh setting. By default it is switched off, but you can change it.
5. Below the configuration is the search field. Here you can [enter and define search queries](https://console.bluemix.net/docs/services/CloudLogAnalysis/kibana/define_search.html#define_search). To filter for all logs reported as app errors and containing one of the defined log levels, enter the following:
```
message:(WARN|INFO|ERROR|FATAL)
```
![](images/solution17/kibana_filter.png)
6. Store the search criteria for future use by clicking **Save** in the configuration bar. Use **mylogs** as name.

For more information, see [Filtering logs in Kibana](/docs/services/CloudLogAnalysis/kibana/filter_logs.html#filter_logs).
## Visualize Logs
Now that you have a query defined, in this section you will use it as foundation for a chart, a visualization of that data. You will first create visualizations and then use them to compose a dashboard.

### Pie Chart as Donut

1. Click on **Visualize** in the left navigation bar.
2. In the list of offered visualizations Locate **Pie chart** and click on it.
3. Select the query **mylogs** that you saved earlier.
4. On the next screen, under **Select buckets type**, select **Split Slices**, then for **Aggregation** choose **Filters**. Add 4 filters having the values of **INFO**, **WARN**, **ERROR**, and **FATAL** as shown here:
  ![](images/solution17/VisualizationFilters.png)
5. Click on **Options** (right to **Data**) and activate **Donut** as view option. Finally, click on the **play** icon to apply all changes to the chart. Now you should see a **Donut Pie Chart** similar to this one:
  ![](images/solution17/Donut.png)
6. Adjust the displayed interval by navigating to the upper right and clicking on **Last 15 minutes**. Adjust the value to **Last 24 hours**.
7. Save the visualization as **DonutLogs**.

### Metric

Next, create another visualization for **Metric**.
1. Click on **New** and pick **Metric** from the list of offered visualizations and click on the link beginning with **[logstash-]**.
2. On the next screen, expand **Metric** to be able to enter a custom label. Add **Log Entries within 24 hours** and click on the **play** icon to update the shown metric.
  ![](images/solution12/Metric_LogCount24.png)
3. Save the visualization as **LogCount24**.

#### Dashboard
Once you have added visualizations, they can be used to compose a dashboard. A dashboard is used to display all important metrics and to help indicate the health of your apps and services.
1. Click on **Dashboard** in the left navigation panel, then on **Add** to start placing existing visualizations onto the empty dashboard.
2. Add the log count on the left and the donut chart on the right. Change the size of each component and to move them as desired.
3. Click on the arrow in the lower left corner of a component to view changes to a table layout and additional information about the underlying request, response and execution statistics are offered.
  ![](images/solution12/DashboardTable.png)
4. Save the dashboard for future use.

## Monitor cluster health using Grafana
Metrics for standard clusters are located in the {{site.data.keyword.Bluemix_notm}} account that was logged in to when the Kubernetes cluster was created. If you specified an {{site.data.keyword.Bluemix_notm}} space when you created the cluster, then metrics are located in that space. Container metrics are collected automatically for all containers that are deployed in a cluster. These metrics are sent and are made available through Grafana.

1. To view **metrics**, navigate to [clusters](https://console.bluemix.net/containers-kubernetes/clusters) and select the appropriate **location** to see the cluster you created above - `mycluster`. Select the cluster.
2. Next to **Metrics**, click **View**. This should launch Grafana in a new tab.
3. In the top right corner, click on your username and choose **Domain**: **account** and select your **Account**.
4. Click on **Home** and select the **ClusterMonitoringDashboard_V1** dashboard that has been pre-defined.
5. Enter the region value (`bx cs regions` to see all regions) where your cluster was created next to **Region** and then enter your cluster name next to **Cluster**.
   ![](images/solution17/grafana_region_cluster.png)
6. In a different window, visit your application URL and refresh the page several times to generate some load.
7. Refresh your Grafana dashboard to see the updated metrics.
   ![](images/solution17/grafana.png)

## Expand the Tutorial
Do you want to learn more? Here are some ideas of what you can do next:
* Deploy another application to the cluster or use an [app deployed in a Cloud Foundry environment](application-log-analysis.html). The Log Analysis dashboard (Kibana) will show the combined logs of all apps.
* Filter by a single app.
* Add a saved search and metric only for specific error level.
* Build a dashboard for all your apps.


## Related Content
* [Logging and Monitoring](https://console.bluemix.net/docs/containers/cs_health.html#view_metrics)
* [Documentation for IBM Cloud Log Analysis](https://console.bluemix.net/docs/services/CloudLogAnalysis/index.html)
* [IBM Cloud Log Collection API](https://console.bluemix.net/apidocs/948-ibm-cloud-log-collection-api?&language=node#introduction)
* Kibana User Guide: [Discovering Your Data](https://www.elastic.co/guide/en/kibana/5.1/tutorial-discovering.html)
* Kibana User Guide: [Visualizing Your Data](https://www.elastic.co/guide/en/kibana/5.1/tutorial-visualizing.html)
* Kibana User Guide: [Putting it all Together with Dashboards](https://www.elastic.co/guide/en/kibana/5.1/tutorial-dashboard.html)
