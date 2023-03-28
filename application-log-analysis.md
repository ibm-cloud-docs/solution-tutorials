---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2023-03-28"
lasttested: "2023-02-23"

content-type: tutorial
services: containers, log-analysis, Registry, monitoring
account-plan: paid
completion-time: 2h
---
{{site.data.keyword.attribute-definition-list}}

# Analyze logs and monitor application health 
{: #application-log-analysis}
{: toc-content-type="tutorial"}
{: toc-services="containers, log-analysis, Registry, monitoring"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial shows how the [{{site.data.keyword.la_full_notm}}](/observe/logging) service can be used to configure and access logs of a Kubernetes application that is deployed on {{site.data.keyword.Bluemix_notm}}. You will deploy a Python application to a cluster provisioned on {{site.data.keyword.containerlong_notm}}, configure a logging agent, generate different levels of application logs and access worker logs, pod logs or network logs. Then, you will search, filter and visualize those logs through {{site.data.keyword.la_short}} Web UI.
{: shortdesc}

Moreover, you will also setup the [{{site.data.keyword.mon_full_notm}}](/observe/monitoring) service and configure monitoring agent to monitor the performance and health of your application and your {{site.data.keyword.containerlong_notm}} cluster.

## Objectives
{: #application-log-analysis-objectives}

* Deploy an application to a Kubernetes cluster to generate log entries.
* Access and analyze different types of logs to troubleshoot problems and pre-empt issues.
* Gain operational visibility into the performance and health of your app and the cluster running your app.


![Architecture diagram](images/solution12/Architecture.png){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

1. User connects to the application and generates log entries.
1. The application runs in a Kubernetes cluster from an image stored in the {{site.data.keyword.registryshort_notm}}.
1. The user will configure {{site.data.keyword.la_full_notm}} service agent to access application and cluster-level logs.
1. The user will configure {{site.data.keyword.mon_full_notm}} service agent to monitor the health and performance of the {{site.data.keyword.containerlong_notm}} cluster and also the app deployed to the cluster.

<!--##istutorial#-->
## Before you begin
{: #application-log-analysis-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
* `kubectl` to interact with Kubernetes clusters,
* `git` to clone source code repository.

You will find instructions to download and install these tools for your operating environment in the [Getting started with solution tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

In addition, make sure you:
- [grant permissions to a user to view logs](/docs/log-analysis?topic=log-analysis-work_iam#user_logdna)
* and [grant permissions to a user to view monitoring metrics](/docs/monitoring?topic=monitoring-iam#iam_users)

<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Start a new {{site.data.keyword.cloud-shell_notm}}
{: #application-log-analysis-2}
{: step}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, select the account where you have been invited.
1. Click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](/shell).

-->
<!--#/isworkshop#-->

<!--##istutorial#-->
## Create a Kubernetes cluster
{: #application-log-analysis-create_cluster}
{: step}

{{site.data.keyword.containershort_notm}} provides an environment to deploy highly available containerized applications that run in Kubernetes clusters.

A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial. The name `mycluster` will be used in this tutorial.

Open the [Kubernetes clusters](/kubernetes/clusters) and click **Create cluster**. See the documentation referenced below for more details based on the cluster type.  Summary:
- Click **Standard tier cluster**
- For Kubernetes on VPC infrastructure see reference documentation[Creating VPC clusters](/docs/containers?topic=containers-cluster-create-vpc-gen2&interface=ui).
   - Click **Create VPC**:
      - Enter a **name** for the VPC.
      - Chose the same resource group as the cluster.
      - Click **Create**.
   - Attach a Public Gateway to each of the subnets that you create:
      - Navigate to the [Virtual private clouds](/vpc-ext/network/vpcs)).
      - Click the previously created VPC used for the cluster.
      - Scroll down to subnets section and click a subnet.
      - In the **Public Gateway** section, click **Detached** to change the state to **Attached**.
      - Click the browser **back** button to return to the VPC details page.
      - Repeat the previous three steps to attach a public gateway to each subnet.
- For Kubernetes on Classic infrastructure see reference documentation [Creating classic cluster](/docs/containers?topic=containers-cluster-create-classic&interface=ui).
- Choose a resource group.
- Uncheck all zones except one.
- Scale down to 1 **Worker nodes per zone**.
- Choose the smallest **Worker Pool flavor**.
- Enter a **Cluster name**.
- Click **Create**.
<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Configure the access to your cluster
{: #application-log-analysis-access-cluster}
{: step}

In this step, you'll configure `kubectl` to point to the cluster assigned to you.

1. Navigate to your cluster from the [cluster list](/kubernetes/clusters) and click on the **Access** tab under the cluster name.
1. Under **After your cluster provisions, gain access** section, follow instructions to log into your cluster on a terminal.
1. Run the below command to see all the namespaces in your cluster:
   ```sh
   kubectl get namespaces
   ```
   {: pre}
    
-->
<!--#/isworkshop#-->

## Deploy and configure a Kubernetes app to forward logs
{: #application-log-analysis-deploy_configure_kubernetes_app}
{: step}

The ready-to-run [code for the logging app is located in this GitHub repository](https://github.com/IBM-Cloud/application-log-analysis). The application is written using [Django](https://www.djangoproject.com/), a popular Python server-side web framework. Clone or download the repository, then deploy the app to {{site.data.keyword.containershort_notm}} on {{site.data.keyword.Bluemix_notm}}.

### Clone the application
{: #application-log-analysis-build}

In a terminal window:
1. Clone the GitHub repository:
   ```sh
   git clone https://github.com/IBM-Cloud/application-log-analysis
   ```
   {: pre}

1. Change to the application directory
   ```sh
   cd application-log-analysis
   ```
   {: pre}

### Deploy the application
{: #application-log-analysis-8}

1. Gain access to your cluster as described under the **Access** section of your cluster.

   For more information on gaining access to your cluster and to configure the CLI to run kubectl commands, check the [CLI configure](/docs/containers?topic=containers-cs_cli_install#cs_cli_configure) section
   {: tip}

2. Define an environment variable named `MYCLUSTER` with your cluster name:
   ```sh
   MYCLUSTER=mycluster
   ```
   {: pre}

3. Make sure to be logged in. Retrieve the cluster ingress subdomain:
   ```sh
   ibmcloud ks cluster get --cluster $MYCLUSTER
   ```
   {: pre}

4. Define a variable pointing to the subdomain:
   ```sh
   MYINGRESSSUBDOMAIN=<Ingress Subdomain value>
   ```
   {: pre}

5. Initialize the `kubectl` cli environment

   ```bash
   ibmcloud ks cluster config --cluster $MYCLUSTER
   ```
   {: pre}

6. Edit `app-log-analysis.yaml` and replace the placeholder (`$MYINGRESSSUBDOMAIN`) with the value captured in the previous step. *Check the table in this section below for more details*.
7. Once the `yaml` is updated, deploy the app with the following command:
   ```sh
   kubectl apply -f app-log-analysis.yaml
   ```
   {: pre}

8. You can now access the application at `http://$MYINGRESSSUBDOMAIN/`.


   | **Variable**        | **Value**                                                            | **Description**                                                                                             |
   |---------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
   | $MYINGRESSSUBDOMAIN | mycluster\-1234\-d123456789\.us\-south\.containers\.appdomain\.cloud | Retrieve from the cluster overview page or with `ibmcloud ks cluster get --cluster $MYCLUSTER`\. |
   {: caption="Example and description for the environment variable MYINGRESSSUBDOMAIN" caption-side="bottom"}


## Validate {{site.data.keyword.la_short}} instance configuration
{: #application-log-analysis-connect_logna_instance}
{: step}

Applications deployed to an {{site.data.keyword.containerlong_notm}} cluster in {{site.data.keyword.Bluemix_notm}} will likely generate some level of diagnostic output, i.e. logs. As a developer or an operator, you may want to access and analyze different types of logs such as worker logs, pod logs, app logs, or network logs to troubleshoot problems and pre-empt issues.

By using the {{site.data.keyword.la_short}} service, it is possible to aggregate logs from various sources and retain them as long as needed. This allows to analyze the "big picture" when required and to troubleshoot more complex situations.

During creation of the {{site.data.keyword.containerlong_notm}} cluster, it is expected that you completed the steps to also connect to a {{site.data.keyword.la_short}} service. 

1. From the [Kubernetes clusters](/kubernetes/clusters), click on the name of the Kubernetes cluster you just created and click **Overview** on the left pane.
2. Scroll down to **Integrations** and open the {{site.data.keyword.la_short}} UI by clicking **Launch**. It may take a few minutes before you start seeing logs.
   
   If instead of **Launch** you see a **Connect** button, you can click on it to create the integration if it was not done during the creation of the cluster.  It simplifies the installation of *logdna-agent* pod on each node of your cluster. The logging agent reads log files from the pod where it is installed, and forwards the log data to your logging instance.
   {: tip}

3. To check whether the `logdna-agent` pods on each node of your cluster are in **Running** status, run the below command in a shell:
   ```sh
   kubectl get pods --namespace ibm-observe
   ```
   {: pre}

   You should see an output similar to the one below, with one `logdna-agent` running per worker node that you have deployed in your cluster.

   ```sh
   NAME                 READY   STATUS    RESTARTS   AGE
   logdna-agent-4nlsw   1/1     Running   0          39s
   logdna-agent-lgq9f   1/1     Running   0          39s
   logdna-agent-ls6dc   1/1     Running   0          39s
   ```

## Generate and access application logs
{: #application-log-analysis-7}
{: generate_application_logs}
{: step}

In this section, you will generate application logs and review them in {{site.data.keyword.la_short}}.

### Generate application logs
{: #application-log-analysis-11}

The application deployed in the previous steps allows you to log a message at a chosen log level. The available log levels are **critical**, **error**, **warn**, **info** and **debug**. The application's logging infrastructure is configured to allow only log entries on or above a set level to pass. Initially, the logger level is set to **warn**. Thus, a message logged at **info** with a server setting of **warn** would not show up in the diagnostic output.

Take a look at the code in the file [**views.py**](https://github.com/IBM-Cloud/application-log-analysis/blob/master/app/views.py). The code contains **print** statements as well as calls to **logger** functions. Printed messages are written to the **stdout** stream (regular output, application console / terminal), logger messages appear in the **stderr** stream (error log).

1. Open the web app at `http://$MYINGRESSSUBDOMAIN/` and click on the `Logging` tab.
1. Generate several log entries by submitting messages at different levels. The UI allows to change the logger setting for the server log level as well. Change the server-side log level in-between to make it more interesting. For example, you can log a "500 internal server error" as an **error** or "This is my first log entry" as an **info**.

### Access application logs
{: #application-log-analysis-access}

You can access the application specific log in the {{site.data.keyword.la_short}} UI using the filters.

1. On the top bar, click on **Apps**.
1. Under containers, check **app-log-analysis**. A new unsaved view is shown with application logs of all levels. You can also type `app:app-log-analysis` in the *Search...* field.
1. To see logs of specific log level(s), Click on **Levels** and select multiple levels like Error, info, warning etc.,

## Search and filter logs
{: #application-log-analysis-search_filter_logs}
{: step}

The {{site.data.keyword.la_short}} UI, by default, shows all available log entries(Everything). Most recent entries are shown on the bottom through an automatic refresh.
In this section, you will modify what and how much is displayed and save this as a **View** for future use.

### Search logs
{: #application-log-analysis-14}

1. In the **Search** input box located at the bottom of the page in the {{site.data.keyword.la_short}} UI,
   - you can search for lines that contain a specific text like **"This is my first log entry"** or **500 internal server error**.
   - or a specific log level by entering `level:info` where level is a field that accepts string value.

   For more search fields and help, click the syntax help icon next to the search input box
   {: tip}

1. To jump to a specific timeframe, enter **5 mins ago** in the **Jump to timeframe** input box. Click the icon next to the input box to find the other time formats within your retention period.
1. To highlight the terms, click on **Toggle Viewer Tools** icon.
1. Type **error** as your highlight term in the first input box and hit **Enter** on your keyboard. Check the highlighted lines with the terms.
1. Type **container** as your highlight term in the second input box and hit **Enter** on your keyboard. Check the highlighted lines with the terms.
1. Click on **Toggle Timeline** icon to see lines with logs at a specific time of a day.

### Filter logs
{: #application-log-analysis-15}

You can filter logs by tags, sources, apps or levels.

1. On the top bar, click **Sources** and select the name of the host (worker node) you are interested in checking the logs. Works well if you have multiple worker nodes in your cluster.
2. To check other container or file logs, click **app-log-analysis** or **Apps** and select the checkbox(s) you are interested in seeing the logs.

### Create a view
{: #application-log-analysis-16}

Views are saved shortcuts to a specific set of filters and search queries.

As soon as you search or filter logs, you should see **Unsaved View** in the top bar. To save this as a view:
1. Click **Apps** and select the checkbox next to **app-log-analysis**
1. Click on **Unsaved View** > click **save as new view** and name the view as **app-log-analysis-view**. Leave the **Category** as empty.
1. Click **Save View** and new view should appear on the left pane showing logs for the app.

### Visualize logs with graphs and breakdowns
{: #application-log-analysis-17}

In this section, you will create a board and then add a graph with a breakdown to visualize the app level data. A board is a collection of graphs and breakdowns.

1. On the left pane, click on the **board** icon (above the settings icon) > click **New Board**.
1. Set **Name** to **app-log-analysis-board**. Click **Save**.
1. Under **Select a field to graph**:
   1. Select **app** as the field
   1. Select **app-log-analysis** as the field value
1. Click **Add Graph**.
1. Select **Counts** as your metric to see the number of lines in each interval over last 24 hours.
1. To add a breakdown, click on the arrow below the graph:
   - Choose **Histogram** as your breakdown type.
   - Choose **level** as your field type.
   - Click **Add Breakdown** to see a breakdown with all the levels you logged for the app.

## Validate {{site.data.keyword.mon_full_notm}} instance configuration and monitor your cluster
{: #application-log-analysis-monitor_cluster_sysdig}
{: step}

During creation of the {{site.data.keyword.containerlong_notm}} cluster, it is expected that you completed the steps to also connect to a {{site.data.keyword.monitoringshort_notm}} service. In the following, you are going to add {{site.data.keyword.mon_full_notm}} to the application. The service regularly checks the availability and response time of the app.

1. From the [Kubernetes clusters](/kubernetes/clusters), click on the name of the Kubernetes cluster you just created and click **Overview** on the left pane.
2. Scroll down to **Integrations** and open the {{site.data.keyword.monitoringshort_notm}} UI by clicking on the **Launch** button. It may take few minutes for the monitoring information to appear.
   If instead of **Launch** you see a **Connect** button, you can click on it to create the integration if it was not done during the creation of the cluster.  It simplifies the installation of *sysdig-agent* pod on each node of your cluster. The agent captures metrics and forwards them to your monitoring instance.
   {: tip}

3. To check whether the `sysdig-agent` pods on each node of your cluster are in **Running** status, run the below command in a shell:
   ```sh
   kubectl get pods --namespace ibm-observe
   ```
   {: pre}

   You should see an output similar to the one below, with one `sysdig-agent` running per worker node that you have deployed in your cluster.
   ```sh
   sysdig-agent-m6k9w   1/1     Running   0          73s
   sysdig-agent-mp4d6   1/1     Running   0          73s
   sysdig-agent-q2s55   1/1     Running   0          73s
   ```
Small clusters will result in pods in a Pending state.  This can be adjusted by changing the daemon set:
   ```sh
   kubectl edit daemonset/sysdig-agent -n ibm-observe
   ```
   {: pre}

Change the values in the requests section to cpu: "200m" and memory to "200Mi" and check the pods again.
   ```yaml
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "200m"
            memory: 200Mi
   ```

Note: The agent installation as provided by the IBM Cloud script includes the enablement of the Prometheus metrics feature by default. The deployment configuration `app-log-analysis.yaml` used for the example Python application in this tutorial [here](#application-log-analysis-deploy_configure_kubernetes_app) includes the appropriate annotations to `scrape` for Prometheus metrics.
```yaml
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8002"
```

The application includes a Prometheus library `prometheus_client`, which is used by the sample app in this tutorial to generate custom metrics. You can find a Prometheus client to use for most programming languages. See the [Prometheus metrics](https://sysdig.com/blog/prometheus-metrics/){: external} for details.
{: tip}

Use an existing {{site.data.keyword.monitoringshort_notm}} instance or create a new instance as shown below:

1.  Leave **Use private endpoint** checked if possible and click **Create and connect**.
2.  Select a region where you have your cluster created.
3.  Select **Graduated Tier** as your plan.
4.  Create a unique **Service name** such as `<your-initials>-monitoring`.
5.  Use the resource group associated with your cluster.
6.  Leave IBM platform metrics to `Disable` and click **Create**.

### Monitor your cluster
{: #application-log-analysis-19}

To check the health and performance of your app and cluster you can review the default (out-of-the-box) and/or custom application generated metrics that are captured.

Note: Change the interval to **10 M** on the bottom bar of the UI.
{: tip}

1. Go back to the application running at `http://$MYINGRESSSUBDOMAIN/` and click on the **Monitoring** tab, generate several metrics.
2. Back to the Monitoring UI, select **Dashboards**.
1. Search for the predefined dashboard named `Workload Status & Performance`.
1. In this dashboard, set the **workload** filter to `app-log-analysis-deployment` to focus on the metrics generated by the application deployed earlier.
1. Scroll through the dashboard to discover all the predefined graphs like `HTTP Requests Count per Workload` or `HTTP Requests Latency per Workload`, `Resource usage by Pod`.

The sample application that was deployed includes code to generate **custom metrics**. These custom metrics are provided using a Prometheus client and mock multiple access to API endpoints.

![Dashboard showing API counter metrics](images/solution12/wolam_api_counter_total.png){: caption="Figure 2. Dashboard showing API counter metrics" caption-side="bottom"}
{: style="text-align: center;"}

1. Under **Explore**, select **All workloads**.
1. Expand your cluster name on the left pane, then expand **default** namespace and then click on **app-log-analysis-deployment**.
1. In the list of **metrics**, expand `wolam`.
1. Select `wolam_api_counter_total` to monitor the calls to API endpoints.
1. Configure the query
   1. Set **Metric** to **sum**
   1. Set **Group by** to **sum**
   1. Set **label** to **endpoint**
3. Go back to the application running at `http://$MYINGRESSSUBDOMAIN/` and click on the **Monitoring** tab, generate a few metrics after changing the region.
4. To monitor the calls to a given API endpoint of the application by region, change the **Group by** label to **region**.

### Create a custom dashboard
{: #application-log-analysis-20}

Along with the pre-defined dashboards, you can create your own custom dashboard to display the most useful/relevant views and metrics for the containers running your app in a single location. Each dashboard is comprised of a series of panels configured to display specific data in a number of different formats.

To create a dashboard with a first panel:
1. Under **Dashboards**, click **New Dashboard**.
2. In the New Panel:
   1. Set the **Metric** to **sysdig_container_net_http_request_time**.
   3. Set **Group by** to **container_id**.
4. Edit the **Dashboard scope**, set the filter to **container_image**, **is** and **`icr.io/solution-tutorials/tutorial-application-log-analysis:latest`**.
5. Save the dashboard.

![New Dashboard](images/solution12/new_dashboard.png){: caption="Figure 3. New dashboard" caption-side="bottom"}
{: style="text-align: center;"}

To add another panel:
1. Use the **Add Panel** button in the dashboard.
2. Change the panel type from **Timechart** to **Number**
3. Set the **Metric** to **sysdig_container_net_request_count**.
4. Set the **Time Aggregation** to **Rate**.
5. Set the **Group by** to **Sum**.
7. Enable **Compare To** and set the value to **1 Hour ago**.
8. Save the dashboard.

## Remove resources
{: #application-log-analysis-remove_resource}
{: step}

- If you created them as part of this tutorial, remove the logging and monitoring instances from [Observability](/observe) page.<!-- markdownlint-disable-line -->
<!--##istutorial#-->
- Delete the cluster including worker node, app and containers. This action cannot be undone.
   ```sh
   ibmcloud ks cluster rm --cluster $MYCLUSTER -f --force-delete-storage
   ```
   {: pre}

<!--#/istutorial#-->

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}

## Expand the tutorial
{: #application-log-analysis-expand_tutorial}

- Use the [{{site.data.keyword.at_full}} service](/docs/activity-tracker?topic=activity-tracker-getting-started) to track how applications interact with IBM Cloud services.
- [Add alerts](/docs/activity-tracker?topic=activity-tracker-alerts) to your view.
- [Export logs](/docs/activity-tracker?topic=activity-tracker-export) to a local file.
- Examine `views.py` in the sample application and experiment updating the application to capture additional custom metrics. Create an updated image version and update and apply `app-log-analysis.yaml` to redeploy your updates.

## Related content
{: #application-log-analysis-12}
{: related}

- [Resetting the ingestion key used by a Kubernetes cluster](/docs/log-analysis?topic=log-analysis-kube_reset_ingestion)
- [Archiving logs to IBM Cloud Object Storage](/docs/log-analysis?topic=log-analysis-archiving#archiving)
- [Working with monitoring alerts](/docs/monitoring?topic=monitoring-alerts)
- [Working with monitoring notification channels](/docs/monitoring?topic=monitoring-notifications#notifications)
