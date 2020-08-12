---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019, 2020
lastupdated: "2020-08-12"
lasttested: "2020-08-12"

content-type: tutorial
services: containers, Log-Analysis-with-LogDNA, Registry, Monitoring-with-Sysdig
account-plan:
completion-time: 2h

---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Analyze logs and monitor application health with LogDNA and Sysdig
{: #application-log-analysis}
{: toc-content-type="tutorial"}
{: toc-services="containers, Log-Analysis-with-LogDNA, Registry, Monitoring-with-Sysdig"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This tutorial shows how the [{{site.data.keyword.la_full_notm}}](https://{DomainName}/observe/) service can be used to configure and access logs of a Kubernetes application that is deployed on {{site.data.keyword.Bluemix_notm}}. You will deploy a Python application to a cluster provisioned on {{site.data.keyword.containerlong_notm}}, configure a LogDNA agent, generate different levels of application logs and access worker logs, pod logs or network logs. Then, you will search, filter and visualize those logs through {{site.data.keyword.la_short}} Web UI.

Moreover, you will also setup the [{{site.data.keyword.mon_full_notm}}](https://{DomainName}/observe/) service and configure Sysdig agent to monitor the performance and health of your application and your {{site.data.keyword.containerlong_notm}} cluster.
{:shortdesc}

## Objectives
{: #objectives}
* Deploy an application to a Kubernetes cluster to generate log entries.
* Access and analyze different types of logs to troubleshoot problems and pre-empt issues.
* Gain operational visibility into the performance and health of your app and the cluster running your app.


  ![](images/solution12/Architecture.png)

1. User connects to the application and generates log entries.
1. The application runs in a Kubernetes cluster from an image stored in the {{site.data.keyword.registryshort_notm}}.
1. The user will configure {{site.data.keyword.la_full_notm}} service agent to access application and cluster-level logs.
1. The user will configure {{site.data.keyword.mon_full_notm}} service agent to monitor the health and performance of the {{site.data.keyword.containerlong_notm}} cluster and also the app deployed to the cluster.

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
* `kubectl` to interact with Kubernetes clusters,
* `git` to clone source code repository.

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-getting-started) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{:tip}

<!--#/istutorial#-->

<!--##istutorial#-->
In addition, make sure you:
- [grant permissions to a user to view logs in LogDNA](/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-work_iam#user_logdna)
* and [grant permissions to a user to view metrics in Sysdig](/docs/services/Monitoring-with-Sysdig?topic=Sysdig-iam#iam_users)
<!--#/istutorial#-->

<!--##istutorial#-->

<!--##isworkshop#-->
<!--
## Start a new {{site.data.keyword.cloud-shell_notm}}
{: step}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell).

-->
<!--#/isworkshop#-->

## Create a Kubernetes cluster
{: #create_cluster}
{: step}

{{site.data.keyword.containershort_notm}} provides an environment to deploy highly available apps in Docker containers that run in Kubernetes clusters.

A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial. The name `mycluster` will be used in this tutorial.

- For Kubernetes on VPC infrastructure, you are required to create a VPC and subnet(s) prior to creating the Kubernetes cluster. You may follow the instructions provided under the [Creating a standard VPC Gen 1 compute cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_vpc_standard) or [Creating a standard VPC Gen 2 compute cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_vpcg2)
  - Make sure to attach a Public Gateway for each of the subnet that you create as it is required for accessing cloud services.
- For Kubernetes on Classic infrastructure follow the [Creating a standard classic cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_standard) instructions.
<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Configure the access to your cluster
{: #access-cluster}
{: step}

`ibmcloud` is the command line tool to interact with {{site.data.keyword.cloud_notm}}. It comes with plugins to work with {{site.data.keyword.cloud_notm}} services.

1. Open a command prompt.
1. Run the login command
   ```sh
   ibmcloud login
   ```
   {:pre}
2. When prompted, select the region where your cluster was allocated.
3. Enter your IBMid email and password.
4. Select the account where you have been invited.

### Log in to your cluster

In this step, you'll configure `kubectl` to point to the cluster assigned to you.

1. Navigate to your cluster from the [cluster list](https://{DomainName}/kubernetes/clusters) and click on the **Access** tab under the cluster name.
1. Under **After your cluster provisions, gain access** section, follow instructions to log into your cluster on a terminal.
1. Run the below command to see all the namespaces in your cluster:
   ```sh
   kubectl get namespaces
   ```
   {:pre}
-->
<!--#/isworkshop#-->

## Deploy and configure a Kubernetes app to forward logs
{: #deploy_configure_kubernetes_app}
{: step}

The ready-to-run [code for the logging app is located in this GitHub repository](https://github.com/IBM-Cloud/application-log-analysis). The application is written using [Django](https://www.djangoproject.com/), a popular Python server-side web framework. Clone or download the repository, then deploy the app to {{site.data.keyword.containershort_notm}} on {{site.data.keyword.Bluemix_notm}}.

### Prepare the access to {{site.data.keyword.registryshort_notm}}

1. Set the target region and resource group to the same as your cluster.
   ```sh
   ibmcloud target -r YOUR_REGION -g YOUR_RESOURCE_GROUP
    ```
   {: pre}
1. To identify your {{site.data.keyword.registryshort_notm}} URL, run
   ```sh
   ibmcloud cr region
   ```
   {:pre}
1. Define an environment variable named `MYREGISTRY` pointing to the URL such as:
   ```sh
   MYREGISTRY=us.icr.io
   ```
   {:pre}
1. Pick one of your existing registry namespaces or create a new one. To list existing namespaces, use:
   ```sh
   ibmcloud cr namespaces
   ```
   {:pre}
   To create a new namespace:
   ```sh
   ibmcloud cr namespace-add <REGISTRY_NAMESPACE>
   ```
   {:pre}
1. Define an environment variable named `MYNAMESPACE` pointing to the registry namespace:
   ```sh
   MYNAMESPACE=<REGISTRY_NAMESPACE>
   ```
   {:pre}
1. Define a **unique name** for the container image such as `<your-initials>-app-log-analysis`.
   ```sh
   MYIMAGE=<your-initials>-app-log-analysis
   ```
   {:pre}

### Build the application

On a terminal:

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
5. Build a Docker image with the [Dockerfile](https://github.com/IBM-Cloud/application-log-analysis/blob/master/Dockerfile) in {{site.data.keyword.registryshort_notm}}.
   ```sh
   ibmcloud cr build . -t ${MYREGISTRY}/${MYNAMESPACE}/${MYIMAGE}:latest
   ```
   {: pre}

### Deploy the application

1. Gain access to your cluster as described under the **Access** section of your cluster.

   For more information on gaining access to your cluster and to configure the CLI to run kubectl commands, check the [CLI configure](/docs/containers?topic=containers-cs_cli_install#cs_cli_configure) section
   {:tip}
2. Define an environment variable named `MYCLUSTER` with your cluster name:
   ```sh
   MYCLUSTER=mycluster
   ```
3. Retrieve the cluster ingress subdomain:
   ```sh
   ibmcloud ks cluster get --cluster $MYCLUSTER
   ```
   {:pre}
4. Define a variable pointing to the subdomain:
   ```sh
   MYINGRESSSUBDOMAIN=<Ingress Subdomain value>
   ```
   {: pre}

5. Edit `app-log-analysis.yaml` and replace the placeholders (`$MYREGISTRY`, `$MYNAMESPACE`, `$MYIMAGE`, `$MYINGRESSSUBDOMAIN`) with the values captured in previous sections/steps. *Check the table in this section below for more details*.
6. Once the `yaml` is updated, deploy the app with the following command:
   ```sh
   kubectl apply -f app-log-analysis.yaml
   ```
   {: pre}
7. You can now access the application at `http://$MYINGRESSSUBDOMAIN/`.


   | **Variable**        | **Value**                                                            | **Description**                                                                                             |
   |---------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
   | $MYREGISTRY         | us\.icr\.io                                                          | The registry where the image was built in the previous section\.                                            |
   | $MYNAMESPACE        | &lt;your\-namespace&gt;                                                    | The registry namespace where the image was built in the previous section\.                                  |
   | $MYIMAGE            | &lt;your\-initials&gt;\-app\-log\-analysis                                 | The name of the container image\.                                                                           |
   | $MYINGRESSSUBDOMAIN | mycluster\-1234\-d123456789\.us\-south\.containers\.appdomain\.cloud | Retrieve from the cluster overview page or with ibmcloud ks cluster get \-\-cluster  &lt;your\-cluster\-name&gt;\. |


## Connect a {{site.data.keyword.la_short}} instance
{: #connect_logna_instance}
{: step}

Applications deployed to an {{site.data.keyword.containerlong_notm}} cluster in {{site.data.keyword.Bluemix_notm}} will likely generate some level of diagnostic output, i.e. logs. As a developer or an operator, you may want to access and analyze different types of logs such as worker logs, pod logs, app logs, or network logs to troubleshoot problems and pre-empt issues.

By using the {{site.data.keyword.la_short}} service, it is possible to aggregate logs from various sources and retain them as long as needed. This allows to analyze the "big picture" when required and to troubleshoot more complex situations.

To provision and connect a {{site.data.keyword.la_short}} service,

1. From the [Kubernetes clusters](https://{DomainName}/kubernetes/clusters), click on the name of the Kubernetes cluster you just created and click **Overview** on the left pane.
2. Click the Logging **Connect** button.  Use an existing {{site.data.keyword.la_short}} instance or create a new instance as shown below:
   1. Leave **Use private endpoint** checked if possible and click **Create and connect**.
   2. Select a region where you have your cluster created.
   3. Select **7 day Log Search** as your plan.
   4. Create a unique **Service name** such as `<your-initials>-logging`.
   5. Use the resource group associated with your cluster and click **Create**.

   The service provides a centralized log management system where log data is hosted on IBM Cloud. Connect simplifies the installation of *logdna-agent* pod on each node of your cluster. The LogDNA agent reads log files from the pod where it is installed, and forwards the log data to your LogDNA instance.

3. Launch the LogDNA UI by clicking **Launch** (*the connect button should have changed to Launch*). It may take a few minutes before you start seeing logs.
4. To check whether the `logdna-agent` pods on each node of your cluster are in **Running** status, run the below command in a shell:
   ```sh
   kubectl get pods --namespace ibm-observe
   ```
   {:pre}

   You should see an output similar to this

   ```sh
   NAME                 READY   STATUS    RESTARTS   AGE
   logdna-agent-4nlsw   1/1     Running   0          39s
   logdna-agent-lgq9f   1/1     Running   0          39s
   logdna-agent-ls6dc   1/1     Running   0          39s
   ```

<!--### Configure the cluster to send logs to your LogDNA instance

To configure your Kubernetes cluster to send logs to your {{site.data.keyword.la_full_notm}} instance, you must install a *logdna-agent* pod on each node of your cluster. The LogDNA agent reads log files from the pod where it is installed, and forwards the log data to your LogDNA instance.

1. Navigate to [Observability](https://{DomainName}/observe/) page and click **Logging**.
2. Click on **Edit log resources** next to the service which you created earlier and select **Kubernetes**.
3. Copy and run the first command on a terminal where you have targeted your cluster to create a Kubernetes secret with the LogDNA ingestion key for your service instance.
4. Copy and run the second command to deploy a LogDNA agent on every worker node of your Kubernetes cluster. The LogDNA agent collects logs with the extension **.log** and extensionless files that are stored in the */var/log* directory of your pod. By default, logs are collected from all namespaces, including kube-system, and automatically forwarded to the {{site.data.keyword.la_full_notm}} service.
5. After you configure a log source, launch the LogDNA UI by clicking **View LogDNA**. It may take a few minutes before you start seeing logs.-->

## Generate and access application logs
{: generate_application_logs}
{: step}

In this section, you will generate application logs and review them in LogDNA.

### Generate application logs

The application deployed in the previous steps allows you to log a message at a chosen log level. The available log levels are **critical**, **error**, **warn**, **info** and **debug**. The application's logging infrastructure is configured to allow only log entries on or above a set level to pass. Initially, the logger level is set to **warn**. Thus, a message logged at **info** with a server setting of **warn** would not show up in the diagnostic output.

Take a look at the code in the file [**views.py**](https://github.com/IBM-Cloud/application-log-analysis/blob/master/app/views.py). The code contains **print** statements as well as calls to **logger** functions. Printed messages are written to the **stdout** stream (regular output, application console / terminal), logger messages appear in the **stderr** stream (error log).

1. Open the web app at `http://$MYINGRESSSUBDOMAIN/` and click on the `Logging` tab.
1. Generate several log entries by submitting messages at different levels. The UI allows to change the logger setting for the server log level as well. Change the server-side log level in-between to make it more interesting. For example, you can log a "500 internal server error" as an **error** or "This is my first log entry" as an **info**.

### Access application logs

You can access the application specific log in the LogDNA UI using the filters.

1. On the top bar, click on **All Apps**.
1. Under containers, check **app-log-analysis**. A new unsaved view is shown with application logs of all levels.
1. To see logs of specific log level(s), Click on **All Levels** and select multiple levels like Error, info, warning etc.,

## Search and filter logs
{: #search_filter_logs}
{: step}

The {{site.data.keyword.la_short}} UI, by default, shows all available log entries(Everything). Most recent entries are shown on the bottom through an automatic refresh.
In this section, you will modify what and how much is displayed and save this as a **View** for future use.

### Search logs

1. In the **Search** input box located at the bottom of the page in the LogDNA UI,
   - you can search for lines that contain a specific text like **"This is my first log entry"** or **500 internal server error**.
   - or a specific log level by entering `level:info` where level is a field that accepts string value.

   For more search fields and help, click the syntax help icon next to the search input box
   {:tip}
1. To jump to a specific timeframe, enter **5 mins ago** in the **Jump to timeframe** input box. Click the icon next to the input box to find the other time formats within your retention period.
1. To highlight the terms, click on **Toggle Viewer Tools** icon.
1. Enter **error** as your highlight term in the first input box, **container** as your highlight term in the second input box and check the highlighted lines with the terms.
1. Click on **Toggle Timeline** icon to see lines with logs at a specific time of a day.

### Filter logs

You can filter logs by tags, sources, apps or levels.

1. On the top bar, click **All Tags** and select the checkbox next to your cluster name to see Kubernetes related logs specific to your cluster.
2. Click **All Sources** and select the name of the host (worker node) you are interested in checking the logs. Works well if you have multiple worker nodes in your cluster.
3. To check container or file logs, click **All Apps** and select the checkbox(s) you are interested in seeing the logs.

### Create a view

Views are saved shortcuts to a specific set of filters and search queries.

As soon as you search or filter logs, you should see **Unsaved View** in the top bar. To save this as a view:
1. Click **All Apps** and select the checkbox next to **app-log-analysis**
1. Click on **Unsaved View** > click **save as new view / alert** and name the view as **app-log-analysis-view**. Leave the **Category** as empty.
1. Click **Save View** and new view should appear on the left pane showing logs for the app.

### Visualize logs with graphs and breakdowns

In this section, you will create a board and then add a graph with a breakdown to visualize the app level data. A board is a collection of graphs and breakdowns.

1. On the left pane, click on the **board** icon (above the settings icon) > click **NEW BOARD**.
1. Click **Edit** on the top bar and let's name this **app-log-analysis-board**. Click **Save**.
1. Click **Add Graph**:
   - Enter **app** as your field in the first input box and hit enter.
   - Choose **app-log-analysis** as your field value.
   - Click **Add Graph**.
1. Select **Counts** as your metric to see the number of lines in each interval over last 24 hours.
1. To add a breakdown, click on the arrow below the graph:
   - Choose **Histogram** as your breakdown type.
   - Choose **level** as your field type.
   - Click **Add Breakdown** to see a breakdown with all the levels you logged for the app.

## Connect {{site.data.keyword.mon_full_notm}} and monitor your cluster
{: #monitor_cluster_sysdig}
{: step}

In the following, you are going to add {{site.data.keyword.mon_full_notm}} to the application. The service regularly checks the availability and response time of the app.

1. From the [Kubernetes clusters](https://{DomainName}/kubernetes/clusters), click on the name of the Kubernetes cluster you just created and click **Overview** on the left pane.
2. click the Monitoring **Connect** button. Use an existing {{site.data.keyword.monitoringshort_notm}} instance or create a new instance as shown below:
   1. Leave **Use private endpoint** checked if possible and click **Create and connect**.
   2. Select a region where you have your cluster created.
   3. Select **Graduated Tier** as your plan.
   4. Create a unique **Service name** such as `<your-initials>-monitoring`.
   5. Use the resource group associated with your cluster.
   6. Leave IBM platform metrics to `Disable` and click **Create**.
3. Click **Launch** and you should see the Sysdig monitor UI. It may take few minutes for the monitoring information to appear.
4. To check whether the `sysdig-agent` pods on each node of your cluster are in **Running** status, run the below command in a shell:
   ```sh
   kubectl get pods --namespace ibm-observe
   ```
   {:pre}

   You should see the `sysdig-agent` installed
   ```sh
   sysdig-agent-m6k9w   1/1     Running   0          73s
   sysdig-agent-mp4d6   1/1     Running   0          73s
   sysdig-agent-q2s55   1/1     Running   0          73s
   ```

Note: The Sysdig agent installation as provided by the IBM Cloud script includes the enablement of the Prometheus metrics feature by default. The deployment configuration `app-log-analysis.yaml` used for the example Python application in this tutorial [here](#deploy_configure_kubernetes_app) includes the appropriate annotations to `scrape` for Prometheus metrics.
  ```yaml
  spec:
    template:
      metadata:
        annotations:
          prometheus.io/scrape: "true"
          prometheus.io/port: "8002"
  ```
Finally, the application includes a Prometheus library `prometheus_client`, which is used by the sample app in this tutorial to generate custom metrics.  You can find a Prometheus client to use for most programming languages. See the [Sysdig Blog](https://sysdig.com/blog/prometheus-metrics/) for details.
{: tip}


<!--### Configure {{site.data.keyword.mon_short}}

To Configure Sysdig to monitor health and performance of your cluster:
1. Click **Launch** and you should see the Sysdig monitor UI. On the welcome page, click **Next**.
2. Choose **Kubernetes** as your installation method under set up environment.
3. Click **Go to Next step** next to the agent configuration success message and click **Let's Get started** on the next page.
4. Click **Next** and then **Complete onboarding** to see the `Explore` tab of Sysdig UI.-->

### Monitor your cluster

To check the health and performance of your app and cluster you can review the default (out-of-the-box) and/or custom application generated metrics that are captured.

Note: Change the interval to **1 M** on the bottom bar of the Sysdig UI.
{: tip}

1. Go back to the application running at `http://$MYINGRESSSUBDOMAIN/` and click on the **Monitoring** tab, generate several metrics.
1. Back to the Sysdig UI, under `Explore` choose `Deployments` for `My Groupings`
    ![](images/solution12/sysdig_groupings.png)
2. Expand your cluster name on the left pane > expand **default** namespace > click on **app-log-analysis-deployment**.
3. To check **default metrics** such as the HTTP request-response codes, select `HTTP` under `Applications` in the `Metrics and Dashboards` dropdown.
4. To monitor the latency of the application,
   - From the Explore tab, select `Deployments`.
   - Select `Metrics` > `Network` in the `Metrics and Dashboards` dropdown.
   - Select **net.http.request.time**.
   - Select Time: **Sum** and Group: **Average**.
   - Click **More options** and then click **Topology** icon.
   - Click **Done** and Double click the box to expand the view.
5. To monitor the Kubernetes namespace where the application is running,
   - From the Explore tab, select `Deployments`.
   - On the left pane, click on the name of the namespace under which the app is running. _If you haven't set a namespace, the app will be running under `default` namespace_
   - Click the arrow next to `net.http.request.time`.
   - Select `Default Dashboards` > `Kubernetes`.
   - Select `Kubernetes Namespace Overview`.

This sample application includes code to generate **custom metrics**. These custom metrics are provided using a Prometheus client and mock multiple access to API endpoints.

![](images/solution12/wolam_api_counter_total.png)

1. Expand your cluster name on the left pane > expand **default** namespace > click on **app-log-analysis-deployment**.
2. To monitor the calls to a given api endpoint of the application,
   - From the Explore tab, select `Deployments`.
   - Select `Metrics` > `Prometheus` > `wolam_api_counter_total` in the `Metrics and Dashboards` dropdown.
   - Select Time: **Rate**, Group: **Sum**, Segment: **endpoint**
3. Go back to the application running at `http://$MYINGRESSSUBDOMAIN/` and click on the **Monitoring** tab, generate a few metrics after changing the region.
4. To monitor the calls to a given api endpoint of the application by region,
   - Select Time: **Rate**, Group: **Sum**, Segment: **region**

### Create a custom dashboard

Along with the pre-defined dashboards, you can create your own custom dashboard to display the most useful/relevant views and metrics for the containers running your app in a single location. Each dashboard is comprised of a series of panels configured to display specific data in a number of different formats.

To create a dashboard:
1. Click on **Dashboards** on the left most pane > click **Add Dashboard**.
1. Click on **Blank Dashboard** > name the dashboard as **Container Request Overview** by clicking the `edit` icon next to Blank Dashboard.
1. Select **Top List** as your new panel and name the panel as **Request time per container** by clicking the `edit` icon next to **My Panel**.
   - Under **Metrics**, Type **net.http.request.time**.
   - Scope: Click on **Override Dashboard Scope** > select **container.image** > select **is** > select _the application image_ e.g., `us.icr.io/<namespace>/initials-app-log-analysis-latest`
   - Segment by **container.id** and you should see the net request time of each container.
   - Click **save**.
1. To add a new panel, Click on the **plus** icon and select **Number(#)** as the panel type
   - Under **Metrics**, Type **net.http.request.count** > Click on **RATE** > Change the time aggregation from **Average(Avg)** to **Sum**.
   - Scope: Click on **Override Dashboard Scope** > select **container.image** > select **is** > select _the application image_
   - Compare to **1 hour** ago and you should see the net request count of each container.
   - Click **save**.
1. To edit the scope of this dashboard,
   - Click **Edit Scope** in the title panel.
   - Select/Type **Kubernetes.cluster.name** in the dropdown
   - Leave display name empty and select **is**.
   - Select your cluster name as the value and click **Save**.

## Remove resources
{: #remove_resource}
{: step}

- Remove the LogDNA and Sysdig instances from [Observability](https://{DomainName}/observe) page.
<!--##istutorial#-->
- Delete the cluster including worker node, app and containers. This action cannot be undone.
   ```sh
   ibmcloud ks cluster rm --cluster $MYCLUSTER -f
   ```
   {:pre}
<!--#/istutorial#-->

## Expand the tutorial
{: #expand_tutorial}

- Use the [{{site.data.keyword.at_full}} service](/docs/services/Activity-Tracker-with-LogDNA?topic=logdnaat-getting-started#getting-started) to track how applications interact with IBM Cloud services.
- [Add alerts](/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-alerts#alerts) to your view.
- [Export logs](/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-export#export) to a local file.
- Examine `views.py` in the sample application and experiment updating the application to capture additional custom metrics. Create an updated image version and update and apply `app-log-analysis.yaml` to redeploy your updates.

## Related content
{:related}
- [Resetting the ingestion key used by a Kubernetes cluster](/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-kube_reset#kube_reset)
- [Archiving logs to IBM Cloud Object Storage](/docs/services/Log-Analysis-with-LogDNA?topic=LogDNA-archiving#archiving)
- [Configuring alerts in Sysdig](https://sysdigdocs.atlassian.net/wiki/spaces/Monitor/pages/205324292/Alerts)
- [Working with notification channels in Sysdig UI](/docs/services/Monitoring-with-Sysdig?topic=Sysdig-notifications#notifications)
