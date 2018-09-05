---
copyright:
  years: 2018
lastupdated: "2018-08-01"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Reviewing IBM Cloud services, resources and usage
As Cloud adoption increases, IT and finance managers will need to understand Cloud usage in the context of innovation and cost control. Questions such as: "Which services are teams using?", "How much does it cost to operate a solution?" and "How can I contain sprawl?" can be answered by investigating available data. This tutorial introduces ways to explore such information and answer common usage-related questions.
{:shortdesc}

## Objectives
{: #objectives}
* Itemize IBM Cloud artifacts: Cloud Foundry apps and services, IAM resources and IaaS devices
* Associate IBM Cloud artifacts with usage and billing
* Define the relationships between IBM Cloud artifacts and development teams
* Leverage usage and billing data to create data sets for accounting purposes

## Before you begin
{: #prereqs}

* [Install {{site.data.keyword.Bluemix_notm}} CLI](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)
* Install cURL
* Install node.js and json2csv
* Install jq

## Background
{: #background}

Prior to executing commands that inventory and detail IBM Cloud usage, it's helpful to have some background on the broad categories of usage and their function. Key terms used later in the tutorial are bolded.

### Cloud Foundry
Cloud Foundry is an open-source, platform-as-a-service (PaaS) on IBM Cloud that enables you to deploy and scale applications and **Services** without managing servers. Cloud Foundry organizes applications and services into orgs or spaces.  An **Org** is a development account that one or many users can own and use. An org can contain multiple spaces. Each **Space** provides users with access to a shared location for application development, deployment, and maintenance. A helpful visual may be found in [documentation](https://console.bluemix.net/docs/iam/cfaccess.html#cfaccess).

### Identity and Access Management
Newer and migrated services exist as **Resources** managed by IBM Cloud Identity and Access Management. Resources are organized into **Resource Groups** and provide access control through Policies and Roles. Additionally, resources can be tagged to conceptually group resources for tracking purposes. Another helpful visual and overview may be found in [documentation](https://console.bluemix.net/docs/iam/index.html#iamoverview).

### Infrastructure
Infrastructure encompasses a variety of compute options: bare metal services, virtual server instances and Kubernetes nodes. Each are seen as a **Device** in the console. Similar to resources, devices can be tagged.

### Account
The aforementioned artifacts are associcated with an **Account** for billing purposes.

## Explore usage using the Usage Dashboard

The most straightforward means of determining usage is reviewing the IBM Cloud Usage Dashboard.

... Add Usage Dashboard Steps ...

## Explore usage using the command line

In this section, you'll explore usage using the command line interface. To do so, you must have appropriate access in Cloud Foundry as the Billing Manager organization role and IBM Identity and Asset Management as Administrator <--- TODO fact check or re-word

1. List all Cloud Foundry orgs available to you and set an environment variable to store one for testing.
    ```sh
    ibmcloud cf orgs
    ```
    {: pre}

    ```sh
    export ORG_NAME=<org name>
    ```
    {: pre}

2. Itemize billing and usage for a given org with the `billing` command. Specify a particular month using the `-d` flag with a date in the format YYYY-MM.
    ```sh
    ibmcloud billing org-usage $ORG_NAME -d 2018-07
    ```
    {: pre}

3. Conduct the same investigation for resources. Every account has a `default` resource group. Substitute the value `<resource group>` for a resource group listed in the first command.
    ```sh
    ibmcloud resource groups
    ```
    {: pre}

    ```sh
    ibmcloud billing resource-group-usage <resource group> -d 2018-07
    ```
    {: pre}

4. If you have administrative access, you can view both Cloud Foundry services and IAM resources using the `resource-instances-usage` command. (Note this includes only Cloud Foundry services that have been migrated to IAM.)
    ```sh
    ibmcloud billing resource-instances-usage
    ```
    {: pre}

5. If you are not the account administrator but are the creator of services or resources, the following commands can be used.
    ```sh
    ibmcloud billing resource-instances-usage -o <org name>
    ```
    {: pre}

    ```sh
    ibmcloud billing resource-instances-usage -g <resource group>
    ```
    {: pre}

6. To view infrastructure devices, use the `sl` commands. You can login to your infrastructure using the *Use Bluemix Single-Sign-On* option and accept the default API endpoint. Then use the `vs` command to review {{site.data.keyword.virtualmachinesshort}} and {{site.data.keyword.containershort_notm}} clusters.
    ```sh
    ibmcloud sl init
    ```
    {: pre}

    ```sh
    ibmcloud sl vs list
    ```
    {: pre}

    ```sh
    ibmcloud sl vs detail <id>
    ```
    {: pre}

## Resource accounting through tagging

Describe tagging methodologies

## Export usage using the command line

Reviewers often simply need data exported to another application. A common example is exporting usage data into a spreadsheet. In this section, you will export usage data into the comma separated value (CSV) format, which is compatible with most spreadsheet applications.

This section uses two third-party tools: `jq` and `json2csv`. Each of the below commands is composed of three steps: obtaining usage data as JSON, parsing the JSON, and formatting the result as CSV.

Use the `-p` option to pretty print results. If the data prints poorly, remove the `-p` argument to print the raw CSV data.
{:tip}

1. Export the `default` resource group's usage with anticipated costs for each resource type.
    ```sh
    ibmcloud billing resource-group-usage default --json | \
    jq '.[0].resources[] | {resource_name,billable_cost}' | \
    json2csv -f resource_name,billable_cost -p
    ```
    {: pre}

2. Itemize the instances for each resource type in the `default` group.
    ```sh
    ibmcloud billing resource-instances-usage -g default --json | jq '.[] | {month,resource_name,resource_instance_name,organization_name,space_name}' | json2csv -f month,resource_name,resource_instance_name,organization_name,space_name -p
    ```
    {: pre}

3. Follow the same approach for a Cloud Foundry Org.
    ```sh
    ibmcloud billing resource-instances-usage -o $ORG_NAME --json | \
    jq '.[] | {month,resource_name,resource_instance_name,organization_name,space_name}' | \
    json2csv -f month,resource_name,resource_instance_name,organization_name,space_name -p
    ```
    {: pre}

4. Add antipated costs to the data using a more advanced `jq` query. This will create more rows as some resource types have multiple cost metrics.
    ```sh
    ibmcloud billing resource-instances-usage -g default --json | \
    jq '.[] | {month,resource_name,resource_instance_name,organization_name,space_name,metric: .usage[].metric,cost : .usage[].cost}' | \
    json2csv -f month,resource_name,resource_instance_name,organization_name,space_name,metric,cost -p
    ```
    {: pre}

5. Use the same `jq` query to also list Cloud Foundry resources with associated costs.
    ```sh
    ibmcloud billing resource-instances-usage -o $ORG_NAME --json | \
    jq '.[] | {month,resource_name,organization_name,space_name,resource_group_name,metric: .usage[].metric,cost : .usage[].cost}' | \
    json2csv -f month,resource_name,resource_instance_name,organization_name,space_name,metric,cost -p
    ```
    {: pre}

## Export usage using APIs

While `billing` commands are helpful, trying to assemble a "big picture" view using the command line interface is tedious. Similarly, the Usage Dashboard presents an overview of Orgs and Resource Groups but not necessarily a team or project's usage. In this section you'll begin to explore a more data-driven approach to obtaining usage to address custom requirements.

1. In the terminal, set the environment `BLUEMIX_TRACE=true` to print API requests and responses.
    ```sh
    export BLUEMIX_TRACE=true
    ```
    {: pre}

2. Re-run the `billing org-usage` command to see the API calls. Note that multiple hosts and API routes are used for this single command.
    ```sh
    ibmcloud billing org-usage $ORG_NAME -d 2018-07
    ```
    {: pre}

3. Obtain an OAuth token and execute one of the API calls seen in the `billing org-usage` command.
    ```sh
    export IAM_TOKEN=`ibmcloud iam oauth-tokens | head -n 1 | awk ' {print $4} '`
    export UAA_TOKEN=`ibmcloud iam oauth-tokens | tail -n 1 | awk ' {print $4} '`
    ```
    {: pre}

    ```sh
    curl -H "Authorization: Bearer $UAA_TOKEN" https://mccp.ng.bluemix.net/v2/organizations?q=name:$ORG_NAME
    ```
    {: pre}

4. To execute infrastructure APIs, obtain and set environment variables for your **API Username** and **Authentication Key** seen in your [User Profile](https://control.softlayer.com/account/user/profile). If you do not see an API username and Authentication Key, you can create one on the **Actions** menu next to your name in the [User List](https://control.softlayer.com/account/users).
    ```sh
    export IAAS_USERNAME=<API Username>
    ```
    {: pre}

    ```sh
    export IAAS_KEY=<Authentication Key>
    ```
    {: pre}

5. Obtain infrastructure billing totals and billing items using the following APIs. Similar APIs are documented [here](https://softlayer.github.io/reference/services/SoftLayer_Account/).
    ```sh
    curl -u $IAAS_USERNAME:$IAAS_KEY https://api.softlayer.com/rest/v3/SoftLayer_Account/getNextInvoiceTotalAmount
    ```
    {: pre}

    ```sh
    curl -u $IAAS_USERNAME:$IAAS_KEY https://api.softlayer.com/rest/v3/SoftLayer_Account/getAllBillingItems
    ```
    {: pre}

6. Disable tracing for the remainder of the tutorial.
    ```sh
    export BLUEMIX_TRACE=false
    ```
    {: pre}

You've now seen how usage data can be obtained via API; however, it should be apparent that a custom program will be necessary to call the various APIs, store data and create a standardized format. The next section will present such a solution.

## Remove resources
{:removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial

Use the following suggestions to expand your investigation into usage-related data:
- Explore the `ibmcloud billing` commands with the `--json` option. This will show the other data properties available and not covered in the tutorial.
- Review the [Infrastructure Account APIs](https://softlayer.github.io/reference/services/SoftLayer_Account/) for addition APIs to investigate infrastructure usage.
- Review the [jq Manual](https://stedolan.github.io/jq/manual/) for advanced queries to aggregate usage data.

## Related content
{:related}

... Blog posts to be added over time ...
