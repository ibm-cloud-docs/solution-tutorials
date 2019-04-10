---
copyright:
  years: 2017, 2019
lastupdated: "2019-04-10"


---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Analyze logs and monitor health of a Kubernetes application
{: #application-log-analysis}

> Work in Progress

This tutorial shows how the [{{site.data.keyword.la_full_notm}}](https://{DomainName}/observe/logging) service can be used to understand and diagnose activities of a Kubernetes app that is deployed on {{site.data.keyword.Bluemix_notm}}. You will deploy a Python Kubernetes application, configure a LogDNA agent, generate different types of logs. Then, you will search, filter and analyze those logs through {{site.data.keyword.la_short}} Web UI. Moreover, you will also setup the [{{site.data.keyword.mon_full_notm}}](https://{DomainName}/observe/monitoring) service to monitor the performance and health of your application.
{:shortdesc}

## Objectives
* Provision a Kubernetes cluster and deploy an application to generate log entries.
* Search, filter and visualize logs.
* Monitor the health and performance of the app and cluster.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.la_full_notm}}](https://{DomainName}/observe/logging)
* [{{site.data.keyword.mon_full_notm}}](https://{DomainName}/observe/monitoring)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![](images/solution12/Architecture.png)

## Prerequisites
{: #prereq}

* [Install {{site.data.keyword.dev_cli_notm}}](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#ibmcloud-cli) - Script to install docker, kubectl, helm, ibmcloud cli and required plug-ins.
* [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://{DomainName}/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_setup_cli_namespace).
* [Grant permissions to a user to view logs in LogDNA](https://{DomainName}/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-work_iam#user_logdna)
* [Grant permissions to a user to view metrics in Sysdig](https://{DomainName}/docs/services/Monitoring-with-Sysdig?topic=Sysdig-iam_work#user_sysdig)

## Create a Kubernetes cluster
{: #create_cluster}

{{site.data.keyword.containershort_notm}} provides an environment to deploy highly available apps in Docker containers that run in Kubernetes clusters.

Skip this section if you have an existing **Standard** cluster and want to reuse with this tutorial.
{: tip}

1. Create **a new Cluster** from the [{{site.data.keyword.Bluemix}} catalog](https://{DomainName}/kubernetes/catalog/cluster/create) and choose the **Standard** cluster.

	Log forwarding is *not* enabled for the **Free** cluster.
	{:tip}

1. Select a resource group and Geography.
1. For convenience, use the name `mycluster` to be consistent with this tutorial.
1. Select a **Worker Zone** and select the smallest **Machine type** with 2 **CPUs** and 4 **GB RAM** as it is sufficient for this tutorial.
1. Select 1 **Worker node** and leave all other options set to defaults. Click **Create Cluster**.
1. Check the status of your **Cluster** and **Worker Node** and wait for them to be **ready**.

## Provision a {{site.data.keyword.la_short}} instance
{: #provision_logna_instance}
From the movement, an application is deployed to a {{site.data.keyword.containerlong_notm}} cluster in {{site.data.keyword.Bluemix_notm}}, the app starts generating diagnostic output, i.e. logs and you want to access logs to troubleshoot problems and pre-empt issues. At any time, you want to have access to different types of logs such as worker logs, pod logs, app logs, or network logs. By using the {{site.data.keyword.la_short}} service, it is possible to aggregate logs from various sources and retain them as long as needed. This allows to analyze the "big picture" when required and to troubleshoot more complex situations.

To provision a {{site.data.keyword.la_short}} service,

1. Navigate to [observability](https://{DomainName}/observe/) page and under **Logging**, click **Create instance**.
1. Provide a unique **Service name**.
1. Choose a region/location and Select a resource group.
1. Select **7 day Log Search** as your plan and Click **Create**.

With this you configured a centralized log management system where log data is hosted on IBM Cloud.


## Deploy and configure a Kubernetes app to forward logs
{: #deploy_configure_kubernetes_app}
The ready-to-run [code for the logging app is located in this Github repository](https://github.com/IBM-Cloud/application-log-analysis). The application is written using [Django](https://www.djangoproject.com/), a popular Python server-side web framework. Clone or download the repository, then deploy the app to {{site.data.keyword.containershort_notm}} on {{site.data.keyword.Bluemix_notm}}.

### Deploy the python application
On a terminal,

1. Clone the Github repository:

   ```sh
   git clone https://github.com/IBM-Cloud/application-log-analysis
   cd application-log-analysis
   ```
   {: pre}
1. [Build the Docker image](https://{DomainName}/docs/services/Registry?topic=registry-registry_images_#registry_images_creating) in {{site.data.keyword.registryshort_notm}}.
 - Find the **Container Registry** with `ibmcloud cr info`, such as us.icr.io or uk.icr.io.
 - Create a namespace to store the container image.

      ```sh
      ibmcloud cr namespace-add app-log-analysis-namespace
      ```
      {: pre}

 - Replace `<CONTAINER_REGISTRY>` with your container registry value and use **app-log-analysis** as the image name.

	   ```sh
	   ibmcloud cr build -t <CONTAINER_REGISTRY>/app-log-analysis-namespace/app-log-analysis:latest .
	   ```
	   {: pre}

 - Replace the **image** value in `app-log-analysis.yaml` file with the image tag `<CONTAINER_REGISTRY>.icr.io/app-log-analysis-namespace/app-log-analysis:latest`

1. Retrieve the cluster configuration and set the `KUBECONFIG` environment variable.

   ```sh
   $(ibmcloud ks cluster-config --export mycluster)
   ```
   {: pre}
1. Deploy the app.

   ```sh
   kubectl apply -f app-log-analysis.yaml
   ```
   {: pre}

1. To access the application, you need `public IP` of the worker node and the `NodePort`
	- For public IP, run the following command

		```sh
		ibmcloud ks workers mycluster
		```
		{: pre}
	- For the NodePort which will be 5-digits (e.g., 3xxxx), run the below command

		```sh
		kubectl describe service app-log-analysis-svc
		```
		{: pre}

		You can now access the application at `http://worker-ip-address:portnumber`

### Configure the cluster to send logs to your LogDNA instance

To configure your Kubernetes cluster to send logs to your {{site.data.keyword.la_full_notm}} instance, you must install a logdna-agent pod on each node of your cluster. The LogDNA agent reads log files from the pod where it is installed, and forwards the log data to your LogDNA instance.

1. Navigate to [observability](https://{DomainName}/observe/) page and click **Logging**.
1. Click on **Edit log resources** next to the service which you created earlier and select **Kubernetes**.
1. Copy and run the first command on a terminal where you have set the KUBECONFIG to create a kubernetes secret with the logDNA ingestion key for your service instance.
1. Copy and run the second command to deploy a logDNA agent on every worker node of your Kubernetes cluster. The LogDNA agent collects logs with the extension *.log and extensionsless files that are stored in the /var/log directory of your pod. By default, logs are collected from all namespaces, including kube-system, and automatically forwarded to the {{site.data.keyword.la_full_notm}} service.
1. After you configure a log source, launch the logDNA UI by clicking **View LogDNA**. It may take a few minutes before you start seeing logs.

Let's generate some application logs and view them in logDNA UI.

## Generate and access application logs
{: generate_application_logs}
Next, in order to work with application logs, you first need to generate some. The deploy process above already generated many log entries.

### Generate application logs
1. Visit the web app at `http://worker-ip-address:portnumber`.
1. The application allows you to log a message at a chosen log level. The available log levels are **critical**, **error**, **warn**, **info** and **debug**. The application's logging infrastructure is configured to allow only log entries on or above a set level to pass. Initially, the logger level is set to **warn**. Thus, a message logged at **info** with a server setting of **warn** would not show up in the diagnostic output. The UI allows to change the logger setting for the server log level as well. Try it and generate several log entries.
1. Take a look at the code in the file [**views.py**](https://github.com/IBM-Cloud/application-log-analysis/blob/master/app/views.py). The code contains **print** statements as well as calls to **logger** functions. Printed messages are written to the **stdout** stream (regular output, application console / terminal), logger messages appear in the **stderr** stream (error log).
1. Back in the application, generate several log entries by submitting messages at different levels. Change the server-side log level in-between to make it more interesting. For example, you can log a "500 internal server error" as an **error** or "This is my first log entry" as an **info**.

### Access application logs
You can access the application specific log in the logDNA UI using the filters.

1. On the top bar, click on **All Apps**.
1. Under containers, check **app-log-analysis**. A new unsaved view is shown with application logs of all levels.
1. To see logs of specific log level(s), Click on **All Levels** and select multiple levels like Error,info, warning etc.,

## Search and filter logs
{: #search_filter_logs}
The {{site.data.keyword.la_short}} UI, by default shows all available log entries(Everything). Most recent entries are shown on the bottom through automatic refresh.
In this section, you will modify what and how much is displayed and save this as a **View** for future use.

### Search logs
1. In the **Search** input box located at the bottom of the page in the LogDNA UI, you can search for lines that contain

	- string like **"This is my first log entry"** and hit enter.
	- errors like **500 internal server error**.
	- specific log levels by entering `level:info` where level is a field that accepts string value.

      For more search fields and help, click the syntax help icon next to the search input box
      {:tip}

1. To jump to a specific timeframe, enter **5 mins ago** in the **Jump to timeframe** input box. Click the icon next to the input box to find the other time formats within your retention period.
1. To highlight the terms, click on **Toggle Viewer Tools** icon.
1. Enter **error** as your highlight term in the first input box, **container** as your highlight term in the second input box and check the highlighted lines with the terms.
1. Click on **Toggle Timeline** icon to see lines with logs at a specific time of a day.

### Filter logs
You can filter logs by tags, sources, apps or levels.

1. On the top bar, click **All Tags** and select the checkbox **k8s** to see Kubernetes related logs.
1. Click **All Sources** and select the name of the host(worker node) you are interested in checking the logs. Works well if you have multiple worker nodes in your cluster.
1. To check container or file logs, click **All Apps** and select the checkbox(s) you are interested in seeing the logs.

### Create a view
As soon as you search or filter logs, you should see **Unsaved View** in the top bar. To save this as a view

1. Click **All Apps** and select the checkbox next to **app-log-analysis**
1. Click on **Unsaved View** > click **save as new view / alert** and name the view as **app-log-analysis-view**. Leave the **Category** as empty.
1. Click **Save View** and new view should appear on the left pane showing logs for the app.

### Visualize logs with graphs and breakdowns
In this section, you will create and see a graph of the app level data in a board. A board is a collection of graphs and breakdowns. You will first create a board and then add a graph with a breakdown.

1. On the left pane, click on the **board** icon (above the settings icon) > click **NEW BOARD**.
1. Click **Edit** on the top bar and let's name this **app-log-analysis-board**. Click **Save**.
1. Click **Add Graph**
	- Enter **app** as your field in the first input box and hit enter.
	- Choose **app-log-analysis** as your field value.
	- Click **Add Graph**.
1. Select **Counts** as your metric to see the number of lines in each interval over last 24 hours.
1. To add a breakdown, click on the arrow below the graph
	- Choose **Histogram** as your breakdown type.
	- **level** as your field type.
	- Click **Add Breakdown** to see a breakdown with all the levels you logged for the app.

## Add {{site.data.keyword.mon_short}} and monitor your cluster
{: #monitor_cluster_sysdig}
In the following, you are going to add {{site.data.keyword.mon_short}} to the application. The service regularly checks the availability and response time of the app.

1. Navigate to [observability](https://{DomainName}/observe/) page and under **Monitoring**, click **Create instance**.
1. Provide a unique **Service name**.
1. Choose a region/location and Select a resource group.
1. Select **Graduated Tier** as your plan and Click **Create**.
1. Click on **Edit log resources** next to the service which you created earlier and select **Kubernetes**.
1. Copy and run the command under **Install Sysdig Agent to your cluster** on a terminal where you have set the `KUBECONFIG` environment variable to deploy the Sysdig agent in your cluster. Wait for the deployment to complete.

### Configure {{site.data.keyword.mon_short}}
To Configure Sysdig to monitor health and performance of your cluster,

1. Click **View Sysdig** and you should see the sysdig monitor UI. On the welcome page, click **Next**.
1. Choose **Kubernetes** as your installation method under set up environment.
1. Click **Go to Next step** next to the agent configuration success message and click **Let's Get started** on the next page.
1. Click **Next** > Complete onboarding to see the Explore tab of Sysdig UI.

### Monitor your cluster
To check the health and performance of your app amd cluster,

1. Back in the application running at `http://worker-ip-address:portnumber`, generate several log entries.
1. Expand **mycluster** on the left pane > expand **default** namespace > click on **app-log-analysis-deployment** to see the Request count, Response Time etc., on the Sysdig monitor wizard.
1. To check the HTTP request-response codes, click on the arrow next to **Kubernetes Pod Health** on the top bar and select **HTTP** under **Applications**. Change the interval to **10 M** on the bottom bar of the Sysdig UI.
1. To monitor the latency of the application,
    - From the Explore tab, select **Deployments and Pods**.
    - Click the arrow next to **HTTP** and then Select Metrics > Network.
    - Select **net.http.request.time**.
    - Select Time: **Sum** and Group: **Average**.
    - Click **More options** and then click **Topology** icon.
    - Click **Done** and Double click the box to expand the view.
1. To monitor the Kubernetes namespace where the application is running,
    - From the Explore tab, select **Deployments and Pods**.
    - Click the arrow next to **net.http.request.time**.
    - Select Default Dashboards > Kubernetes.
    - Select Kubernetes State > Kubernetes State Overview.

## Remove resources
{: #remove_resource}

- Remove the LogDNA and Sysdig instances from [observability](https://{DomainName}/observe) page.
- Delete the cluster including worker node, app and containers. This action cannot be undone.
    ```sh
    ibmcloud ks cluster-rm mycluster -f
    ```
## Expand the tutorial
{: #expand_tutorial}

- Use the [{{site.data.keyword.at_full}} service](https://{DomainName}/docs/services/Activity-Tracker-with-LogDNA?topic=logdnaat-getting-started#getting-started) to track how applications interact with IBM Cloud services.
- [Add alerts](https://{DomainName}/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-alerts#alerts) to your view.
- [Export logs](https://{DomainName}/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-export#export) to a local file.

## Related content
{:related}
- [Resetting the ingestion key used by a Kubernetes cluster](https://{DomainName}/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-kube_reset#kube_reset)
- [Archiving logs to IBM Cloud Object Storage](https://{DomainName}/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-archiving#archiving)
- [Configuring alerts in Sysdig](https://sysdigdocs.atlassian.net/wiki/spaces/Monitor/pages/205324292/Alerts)