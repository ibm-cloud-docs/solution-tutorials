---
copyright:
  years: 2018
lastupdated: "2018-08-06"

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

* Install [{{site.data.keyword.Bluemix_notm}} CLI](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started) <= v0.9.0
* Install [cURL](https://curl.haxx.se/) <= v7.61.1
* Install [Node.js](https://nodejs.org/) <= v8.0.0
* Install [json2csv](https://www.npmjs.com/package/json2csv) <= v4.2.1 using the command `npm install -g json2csv`
* Install [jq](https://stedolan.github.io/jq/) <= v1.4

## Background
{: #background}

Prior to executing commands that inventory and detail IBM Cloud usage, it's helpful to have some background on the broad categories of usage and their function. Key terms used later in the tutorial are bolded. A helpful visualization of the below artifacts can be found in [documentation](https://console.bluemix.net/docs/account/account_overview.html#overview).

### Cloud Foundry
Cloud Foundry is an open-source, platform-as-a-service (PaaS) on IBM Cloud that enables you to deploy and scale applications and **Services** without managing servers. Cloud Foundry organizes applications and services into orgs or spaces.  An **Org** is a development account that one or many users can own and use. An org can contain multiple spaces. Each **Space** provides users with access to a shared location for application development, deployment, and maintenance.

### Identity and Access Management
More recent offerings and migrated Cloud Foundry services exist as **Resources** managed by IBM Cloud Identity and Access Management. Resources are organized into **Resource Groups** and provide access control through Policies and Roles. Additionally, resources can be tagged to conceptually group resources for tracking purposes.

### Infrastructure
Infrastructure encompasses a variety of compute options: bare metal servers, virtual server instances and Kubernetes nodes. Each are seen as a **Device** in the console. Similar to resources, devices can be tagged.

### Account
The aforementioned artifacts are associated with an **Account** for billing purposes.

## Assign permissions
To view Cloud inventory and usage, you will need the appropriate roles assigned by the account administrator. If you are the account administrator, proceed to the next section.

1. The account administrator should login to IBM cloud and access the [**Identity & Access Users**](https://console.bluemix.net/iam/#/users) page.
2. Select your name from the list of users.
3. On the **Access policies** tab, click the **Assign Access** button.
4. On the following page, click the **Assign access within a resource group** tile. Select the **Resource group(s)** to be granted access to and apply the **Administrator** role. Finish by clicking the **Assign** button.
5. Again, click the **Assign Access** button.
6. On the following page, click the **Assign access by using Cloud Foundry** tile. Select the overflow menu next to each **Organizations(s)** to be granted access.
7. Select **Edit organization role** from the menu. Select **Billing Manager** from the **Organization roles** list. Finish by clicking the **Save role** button.

## Locating resources using search

As development teams begin using Cloud services, managers will benefit from knowing which services have been deployed. Deployment information helps answer questions related to innovation and service management:
- What service-related skills can be shared across teams to enhance other projects?
- What are commonalities across teams that might be lacking in some?
- Which teams are using a service that requires a critical fix or will soon be deprecated?
- How can teams review their service instances to minimize sprawl?

Search is not limited to services and resources. You can also query Cloud artifacts such as Cloud Foundry orgs and spaces, resource groups, resource bindings, aliases, etc. For more examples, see the [ibmcloud resource search](https://console.bluemix.net/docs/cli/reference/ibmcloud/cli_resource_group.html#ibmcloud_resource_search) documentation.
{:tip}

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started).
    ```sh
    ibmcloud login
    ```
    {: pre}

    ```sh
    ibmcloud target --cf
    ```
    {: pre}

2. Inventory all Cloud Foundry services used within the account.
    ```sh
    ibmcloud resource search 'type:cf-service-instance'
    ```
    {: pre}

3. Boolean filters can be applied to broaden or narrow searches. For example, find both Cloud Foundry services and apps as well as IAM resources using the below query.
    ```sh
    ibmcloud resource search 'type:cf-service-instance OR type:cf-application OR type:resource-instance'
    ```
    {: pre}

4. To notify teams using a particular service type, query using the service name. Replace `<name>` with text, for example `weather` or `cloudant`. Then get the organization's name by replacing `<Organization ID>` the **Organization ID**.
    ```sh
   ibmcloud resource search 'service_name: *<name>*'
    ```
    {: pre}

    ```sh
    ibmcloud cf curl /v2/organizations/<Organization ID> | tail -n +3 | jq .entity.name
    ```
    {: pre}

5. Tagging and searching can be used together to provide customized identification of resources. This involves: creating a tag, attaching the tag to resource(s) and searching using tag name(s). Create a tag named `env:tutorial`.
    ```sh
   ibmcloud resource tag-create --tag-name env:tutorial
    ```
    {: pre}

6. Attach the tag to a resource. A `--resource-crn` value can be obtained from a **CRN** property seen in the previous command's output.
    ```sh
    ibmcloud resource tag-attach --tag-name env:tutorial --resource-crn <resource CRN>
    ```
    {: pre}

7. Search for the Cloud artifacts that match a given tag using the below query.
    ```sh
    ibmcloud resource search 'tags: "env:tutorial"'
    ```
    {: pre}

By combining advanced Lucene search queries with an enterprise-agreed tagging schema, managers and team leads can more easily identify and take action on Cloud apps, resources, and services.

## Explore usage using the Usage Dashboard

Once management is aware of the services that teams are using, the next often-asked question is, "What does it cost to operate these services?" The most straightforward means of determining usage and cost is by reviewing the IBM Cloud Usage Dashboard.

1. Login to IBM Cloud and access the [Account Usage Dashboard](https://console.bluemix.net/account/usage).
2. From the **Groups** drop-down menu, select a Cloud Foundry Org to view service usage.
3. For a given **Service Offering**, click **View Instances** to view the service instances that have been created.
4. On the following page, choose an instance and click **View Instance**. The resulting page provides details about the instance such as Org, Space and Region as well as individual line items that build total cost.
5. Using the breadcrumb, revisit the [Usage Dashboard](https://console.bluemix.net/account/usage).
6. From the **Groups** drop-down menu, change the selector to **Resource Groups** and select a group such as **default**.
7. Conduct a similar review of available instances.

## Explore usage using the command line

In this section, you'll explore usage with the command line interface.

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

4. If you have administrative access, you can view both Cloud Foundry services and IAM resources using the `resource-instances-usage` command. (This includes only Cloud Foundry services that have been migrated to IAM.)
    ```sh
    ibmcloud billing resource-instances-usage
    ```
    {: pre}

5. If you are not the account administrator but are the creator of services or resources, the following commands can be used. <-- IS THAT RIGHT?
    ```sh
    ibmcloud billing resource-instances-usage -o <org name>
    ```
    {: pre}

    ```sh
    ibmcloud billing resource-instances-usage -g <resource group>
    ```
    {: pre}

6. To view infrastructure devices, use the `sl` command. You can login to your infrastructure using the **Use Bluemix Single-Sign-On** option and accept the default API endpoint. Then use the `vs` command to review {{site.data.keyword.virtualmachinesshort}} instances.
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

## Export usage using the command line

Some in management often need data exported to another application. A common example is exporting usage data into a spreadsheet. In this section, you will export usage data into the comma separated value (CSV) format, which is compatible with most spreadsheet applications.

This section uses two third-party tools: `jq` and `json2csv`. Each of the below commands is composed of three steps: obtaining usage data as JSON, parsing the JSON, and formatting the result as CSV.

Use the `-p` option to pretty print results. If the data prints poorly, remove the `-p` argument to print the raw CSV data.
{:tip}

1. Export the `default` resource group's usage with anticipated costs for each resource type.
    ```sh
    ibmcloud billing resource-group-usage default --output json | \
    jq '.[0].resources[] | {resource_name,billable_cost}' | \
    json2csv -f resource_name,billable_cost -p
    ```
    {: pre}

2. Itemize the instances for each resource type in the `default` group.
    ```sh
    ibmcloud billing resource-instances-usage -g default --output json | jq '.[] | {month,resource_name,resource_instance_name,organization_name,space_name}' | json2csv -f month,resource_name,resource_instance_name,organization_name,space_name -p
    ```
    {: pre}

3. Follow the same approach for a Cloud Foundry Org.
    ```sh
    ibmcloud billing resource-instances-usage -o $ORG_NAME --output json | \
    jq '.[] | {month,resource_name,resource_instance_name,organization_name,space_name}' | \
    json2csv -f month,resource_name,resource_instance_name,organization_name,space_name -p
    ```
    {: pre}

4. Add antipated costs to the data using a more advanced `jq` query. This will create more rows as some resource types have multiple cost metrics.
    ```sh
    ibmcloud billing resource-instances-usage -g default --output json | \
    jq '.[] | {month,resource_name,resource_instance_name,organization_name,space_name,metric: .usage[].metric,cost : .usage[].cost}' | \
    json2csv -f month,resource_name,resource_instance_name,organization_name,space_name,metric,cost -p
    ```
    {: pre}

5. Use the same `jq` query to also list Cloud Foundry resources with associated costs.
    ```sh
    ibmcloud billing resource-instances-usage -o $ORG_NAME --output json | \
    jq '.[] | {month,resource_name,organization_name,space_name,resource_group_name,metric: .usage[].metric,cost : .usage[].cost}' | \
    json2csv -f month,resource_name,resource_instance_name,organization_name,space_name,metric,cost -p
    ```
    {: pre}

## Export usage using APIs

While `billing` commands are helpful, trying to assemble a "big picture" view using the command line interface is tedious. Similarly, the Usage Dashboard presents an overview of Orgs and Resource Groups but not necessarily a team or project's usage. In this section you'll begin to explore a more data-driven approach to obtain usage for custom requirements.

1. In the terminal, set the environment variable `IBMCLOUD_TRACE=true` to print API requests and responses.
    ```sh
    export IBMCLOUD_TRACE=true
    ```
    {: pre}

2. Re-run the `billing org-usage` command to see the API calls. Note that multiple hosts and API routes are used for this single command.
    ```sh
    ibmcloud billing org-usage $ORG_NAME -d 2018-07
    ```
    {: pre}

3. Obtain an OAuth token and execute one of the API calls seen in the `billing org-usage` command. Note that some APIs use the UAA Token while others may use an IAM Token as bearer authorization.
    ```sh
    export IAM_TOKEN=`ibmcloud iam oauth-tokens | head -n 1 | awk ' {print $4} '`
    ```
    {: pre}

    ```sh
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

6. Disable tracing.
    ```sh
    export IBMCLOUD_TRACE=false
    ```
    {: pre}

While the data-driven approach provides the most flexibility in exploring usage, it is beyond the scope of this introductory tutorial. A GitHub project has been created to provide a sample application that leverages available APIs.

## Expand the tutorial

Use the following suggestions to expand your investigation into inventory and usage-related data.

- Explore the `ibmcloud billing` commands with the `--output json` option. This will show additional data properties available and not covered in the tutorial.
- Read the blog post [Using the IBM Cloud command line to find resources](https://www.ibm.com/blogs/bluemix/2018/06/where-are-my-resources/) for more examples on `ibmcloud resource search` and which properties can be used in your queries.
- Review the [Infrastructure Account APIs](https://softlayer.github.io/reference/services/SoftLayer_Account/) for addition APIs to investigate infrastructure usage.
- Review the [jq Manual](https://stedolan.github.io/jq/manual/) for advanced queries to aggregate usage data.
