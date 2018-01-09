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


# Analyze application logs in Kibana from a Kubernetes Cluster
{: #kibana_tutorial_1}

This tutorial walks you through creating a cluster, configuring the cluster to send logs to the {site.data.keyword.loganalysisshort}} service, deploying an application to the cluster and then using Kibana to view and analayze logs.
{:shortdesc}


## Objectives:

* Create a Kubernetes cluster.
* Provision the {{site.data.keyword.loganalysisshort}} service.
* Create logging configurations in the cluster.
* View, search and analyze logs in Kibana

**Note:** To complete this tutorial, you must complete the pre-requites and the tutorials that are linked from the different steps.

## Prerequisites
{: #prereq}

1. Be a member or an owner of an {{site.data.keyword.Bluemix_notm}} account with permissions to create Kubernetes standard clusters, deploy apps into clusters, and query the logs in {{site.data.keyword.Bluemix_notm}} for advanced analysis in Kibana.

    Your user ID for the {{site.data.keyword.Bluemix_notm}} must have the following policies assigned:
    
    * An IAM policy for the {{site.data.keyword.containershort}} with *operator* or *administrator* permissions.
    * An IAM policy for the {{site.data.keyword.loganalysisshort}} service with *viewer* permissions.
    
    For more information, see [Assign an IAM policy to a user through the IBM Cloud UI](/docs/services/CloudLogAnalysis/security/grant_permissions.html#grant_permissions_ui_account).

3. Install the CLIs to work with the {{site.data.keyword.containershort}} and the {{site.data.keyword.loganalysisshort}}.

    * Install the {{site.data.keyword.Bluemix_notm}} CLI. For more information, see [Install from shell](/docs/cli/reference/bluemix_cli/download_cli.html#download_install).
    * Install the required CLIs to create and manage your Kubernetes clusters in {{site.data.keyword.containershort}}, and to deploy containerized apps to your cluster. For more information, see [Install the CLI plugins](/docs/containers/cs_cli_install.html#cs_cli_install_steps).
    * Install the {{site.data.keyword.loganalysisshort}} CLI. For more information, see [Configuring the Log Analysis CLI (IBM Cloud plugin)](/docs/services/CloudLogAnalysis/how-to/manage-logs/config_log_collection_cli_cloud.html#config_log_collection_cli).

## Create a Kubernetes cluster
{: #step1}

1. Create a standard Kubernetes cluster.
   * [Create a Kubernetes standard cluster through the UI](/docs/containers/cs_cluster.html#cs_cluster_ui).
   * [Create a Kubernetes standard cluster by using the CLI](/docs/containers/cs_cluster.html#cs_cluster_cli).

2. Set up the cluster context in a terminal. 
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


## Configure your cluster to forward logs automatically to the {{site.data.keyword.loganalysisshort}} service
{: #step3}

When an application is deployed, logs are collected automatically by the {{site.data.keyword.containershort}}. However, logs are not automatically forwarded to the {{site.data.keyword.loganalysisshort}} service. You must create one or more [logging configurations](/docs/services/CloudLogAnalysis/containers/containers_kubernetes.html#log_sources) in your cluster that define:
* Where logs are to be forwarded. You can forward logs to the account domain or to a space domain.
* What logs are forwarded to the {{site.data.keyword.loganalysisshort}} service for analysis.

### Configure your cluster to forward stderr and stdout logs to the {{site.data.keyword.loganalysisshort}} service
{: #containerlogs}

1. Run the following command to send *stdout* and *stderr* log files to the {{site.data.keyword.loganalysisshort}} service:

    ```
    bx cs logging-config-create mycluster --logsource container --namespace '*' --type ibm --hostname EndPoint --port 9091 --org OrgName --space SpaceName 
    ```
    {: codeblock}

    where 
    * *mycluster* is the name of the cluster.
    * *EndPoint* is the URL to the logging service in the region where the {{site.data.keyword.loganalysisshort}} service is provisioned. For a list of endpoints, see [Endpoints](/docs/services/CloudLogAnalysis/log_ingestion.html#log_ingestion_urls).
    * *OrgName* is the name of the organization where the space is available.
    * *SpaceName* is the name of the space where the {{site.data.keyword.loganalysisshort}} service is provisioned.


## Grant the {{site.data.keyword.containershort_notm}} key owner permissions
{: #step4}

**NOTE:** This step only applies if you forward logs to a space domain.

When you forward logs to a space, you must also grant Cloud Foundry (CF) permissions to the {{site.data.keyword.containershort}} key owner in the organization and space. The key owner needs *orgManager* role for the organization, and *SpaceManager* and *Developer* for the space. 

Complete the following steps:

1. Log in to the {{site.data.keyword.Bluemix_notm}} console. Open a web browser and launch the {{site.data.keyword.Bluemix_notm}} dashboard: [http://bluemix.net ![External link icon](../../../icons/launch-glyph.svg "External link icon")](http://bluemix.net){:new_window}
	
	After you log in with your user ID and password, the {{site.data.keyword.Bluemix_notm}} UI opens.

2. From the menu bar, click **Manage > Account > Users**.  The *Users* window displays a list of users with their email addresses for the currently selected account.
	
3. Select the {{site.data.keyword.containershort_notm}} key owner userID, and verify that the user ID has the *orgManager* role for the organization, and *SpaceManager* and *Developer* for the space.
 

## Step 5: Grant your user permissions to see logs in the account domain
{: #step5}


To grant a user permissions to view logs, you must add a policy for that user that describes the actions that this user can do with the {{site.data.keyword.loganalysisshort}} service in the account. Only account owners or administrators can assign individual policies to users.

In {{site.data.keyword.Bluemix_notm}}, complete the following steps to grant a user permissions to work with the {{site.data.keyword.loganalysisshort}} service in the German region:

1. Log in to the {{site.data.keyword.Bluemix_notm}} console.

    Open a web browser and launch the {{site.data.keyword.Bluemix_notm}} dashboard: [http://bluemix.net ![External link icon](../../../icons/launch-glyph.svg "External link icon")](http://bluemix.net){:new_window}
	
	After you log in with your user ID and password, the {{site.data.keyword.Bluemix_notm}} UI opens.

2. From the menu bar, click **Manage > Account > Users**. 

    The *Users* window displays a list of users with their email addresses for the currently selected account.
	
3. If the user is a member of the account, select the user name from the list, or click **Manage user** from the *Actions* menu.

    If the user is not a member of the account, see [Inviting users](/docs/iam/iamuserinv.html#iamuserinv).

4. In the **Access policies** section, click **Assign service policies**, then select **Assign access to resources**..

    The *Assign resource access to user** window opens.
    
5. Enter information about the policy. The following table lists the fields and the values that you need to enter to define a policy that allows your user ID to see account logs in the German region: 

    <table>
	  <caption>List of fields to configure an IAM policy.</caption>
	  <tr>
	    <th>Field</th>
		<th>Value</th>

	  </tr>
	  <tr>
	    <td>Services</td>
		<td>*IBM Cloud Log Analysis*</td>
      </tr>
      <tr>
	    <td>Regions</td>
		<td>*Germany*</td>
	  </tr>
	  <tr>
	    <td>Service instance</td>
		<td>*All service instances*</td>
	  </tr>
	  <tr>
	    <td>Select roles</td>
		<td>*Viewer* <br>For more information about the actions that are allowed per role, see [IAM roles](/docs/services/CloudLogAnalysis/security_ov.html#iam_roles).</td>
	  </tr>
	</table>
	
6. Click **Assign policy**.
	
The policy that you configure is applicable to the selected regions. 


## Step 6: Grant your user permissions to see logs in a space domain
{: #step6}

To grant a user permissions to view logs in a space, you must assign the user a Cloud Foundry role that describes the actions that this user can do with the {{site.data.keyword.loganalysisshort}} service in the space. 

**Note:** The space that you configured to send logs from the cluster must be available in the German region. 

Complete the following steps to grant a user permissions to work with the {{site.data.keyword.loganalysisshort}} service:

1. Log in to the {{site.data.keyword.Bluemix_notm}} console.

    Open a web browser and launch the {{site.data.keyword.Bluemix_notm}} dashboard: [http://bluemix.net ![External link icon](../../../icons/launch-glyph.svg "External link icon")](http://bluemix.net){:new_window}
	
	After you log in with your user ID and password, the {{site.data.keyword.Bluemix_notm}} UI opens.

2. From the menu bar, click **Manage > Account > Users**. 

    The *Users* window displays a list of users with their email addresses for the currently selected account.
	
3. If the user is a member of the account, select the user name from the list, or click **Manage user** from the *Actions* menu.

    If the user is not a member of the account, see [Inviting users](/docs/iam/iamuserinv.html#iamuserinv).

4. Select **Cloud Foundry access**, then select the organization.

    The list of spaces available in that organization are listed.

5. Choose the space. Then, from the menu action, select **Edit space role**.

    If you cannot see the space for Germany, create the space before you proceed.

6. Select 1 or more space roles. Valid roles are: *Manager*, *Developer*, and *Auditor*
	
7. Click **Save role**.
	

## Step 7: Deploy an app in the Kubernetes cluster
{: #step7}

Deploy and run a sample app in the Kubernetes cluster. 

Complete the following steps:

1. Log in to the IBM Cloud Container Registry CLI. Note: Ensure that you have the container-registry plugin installed.

    ```
    bx cr login
    ```
    {: codeblock}

    If you forgot your namespace in IBM Cloud Container Registry, run the following command.

    ```
    bx cr namespace-list
    ```
    {: codeblock}

3. Clone or download the source code for the [Hello world app ![External link icon](../../../icons/launch-glyph.svg "External link icon")](https://github.com/Osthanes/container-service-getting-started-wt){:new_window} to your user home directory.

    ```
    git clone https://github.com/Osthanes/container-service-getting-started-wt.git 
    ```
    {: codeblock}

    If you downloaded the repository, extract the compressed file.


The app is a Hello World Node.js app:

```
var express = require('express')
var app = express()

app.get('/', function(req, res) {
  res.send('Hello world! Your app is up and running in a cluster!\n')
})
app.listen(8080, function() {
  console.log('Sample app is listening on port 8080.')
})
```
{: screen}

In this sample app, when you test your app in a browser, the app writes to stdout the following message: `Sample app is listening on port 8080.`

For more information, see [Lesson 1: Deploying single instance apps to Kubernetes clusters](/docs/containers/cs_tutorials_apps.html#cs_apps_tutorial_lesson1).




## Step 8: View log data in Kibana
{: #step8}

Complete the following steps:

1. Launch Kibana in a browser. 

    For more information on how to launch Kibana, see [Navigating to Kibana from a web browser](/docs/services/CloudLogAnalysis/kibana/launch.html#launch_Kibana_from_browser).

    To analyze log data for a cluster, you must access Kibana in the cloud Public region where the cluster is created. 
    
    For example, in the German region, enter the following URL to launch Kibana:
	
	```
	https://logging.eu-fra.bluemix.net/ 
	```
	{: codeblock}
	
    Kibana opens.
    
    **NOTE:** Verify that you launch Kibana in the region where you are forwarding your cluster logs. For information on the URLs per region, see [Logging endpoints](docs/services/CloudLogAnalysis/kibana/analyzing_logs_Kibana.html#urls_kibana).
    	
2. To view log data that is available in the space domain, complete the following steps:

    1. In Kibana, click your user ID. The view to set the space opens.
    
    2. Select the account where the space is available. 
    
    3. Select the following domain: **space**
    
    4. Select the organization where the space is available.
    
    5. Select a space.
    
3. To view log data that is available in the account domain, complete the following steps:

    1. In Kibana, click your user ID. The view to set the space opens.
    
    2. Select the account where the space is available. 
    
    3. Select the following domain: **account**
    
4. In the **Discover** page, look at the events that are displayed. 

    The sample Hello-World application logs one entry in stdout. Therefore, to see this log entry, you must view log data in the space.
    
    Worker logs are configured to send entries to the account domain. Therefore, to see these log entries, you must view log data in the account domain.
        
    In the *Available fields* section, you can see the list of fields that you can use to define new queries or filter the entries listed in the table that is displayed on the page.
    
    The following table lists some of the fields that you can use to define new search queries when analyzing application logs. The table also includes sample values that correspond to the event that is generated by the sample app:
 
    <table>
              <caption>Table 2. Common fields for container logs </caption>
               <tr>
                <th align="center">Field</th>
                <th align="center">Description</th>
                <th align="center">Example</th>
              </tr>
              <tr>
                <td>*ibm-containers.region_str*</td>
                <td>The value of this field corresponds to the {{site.data.keyword.Bluemix_notm}} region where the log entry is collected.</td>
                <td>us-south</td>
              </tr>
			  <tr>
                <td>*ibm-containers.account_id_str*</td>
                <td>Account ID</td>
                <td></td>
              </tr>
			  <tr>
                <td>*ibm-containers.cluster_id_str*</td>
                <td>Cluster ID.</td>
                <td></td>
              </tr>
              <tr>
                <td>*ibm-containers.cluster_name_str*</td>
                <td>Cluster ID</td>
                <td></td>
              </tr>
			  <tr>
                <td>*kubernetes.namespace_name_str*</td>
                <td>Namespace name</td>
                <td>*default* is the default value.</td>
              </tr>
              <tr>
                <td>*kubernetes.container_name_str*</td>
                <td>Container name</td>
                <td>hello-world-deployment</td>
              </tr>
              <tr>
                <td>*kubernetes.labels.label_name*</td>
                <td>Label fields are optional. You can have 0 or more labels. Each label starts with the prefix `kubernetes.labels.` followed by the *label_name*. </td>
                <td>In the sample app, you can see 2 labels: <br>* *kubernetes.labels.pod-template-hash_str* = 3355293961 <br>* *kubernetes.labels.run_str* =	hello-world-deployment  </td>
              </tr>
              <tr>
                <td>*stream_str*</td>
                <td>Type of log.</td>
                <td>*stdout*, *stderr*</td>
              </tr>
        </table>
     
For more information about other search fields that are relevant to Kubernetes clusters, see [Searching logs](/docs/services/CloudLogAnalysis/containers/containers_kubernetes.html#log_search).


## Step 8: Filter data by Kubernetes cluster name in Kibana
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

