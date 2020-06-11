---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019
lastupdated: "2019-05-21"
lasttested: "2019-05-21"
---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Create, secure and manage REST APIs
{: #create-manage-secure-apis}

This tutorial demonstrates how to create REST APIs using the LoopBack Node.js API Framework. With Loopback you can quickly create REST APIs that connect devices and browsers to data and services. You'll also add management, visibility, security and rate limiting to your APIs using {{site.data.keyword.apiconnect_long}}.
{:shortdesc}

## Objectives

* Build a REST API with little to no coding
* Publish your API on {{site.data.keyword.Bluemix_notm}} to reach developers
* Bring existing APIs into {{site.data.keyword.apiconnect_short}}
* Securely expose and control access to systems of record

## Services used

This tutorial uses the following runtimes and services:

* [Loopback](https://loopback.io/)
* [{{site.data.keyword.apiconnect_short}}](https://{DomainName}/docs/services/apiconnect?topic=apiconnect-index#index)
* [SDK for Node.js](https://{DomainName}/catalog/starters/sdk-for-nodejs) Cloud Foundry App

## Architecture

![Architecture](images/solution13/Architecture.png)

1. Developer defines RESTful API
2. Developer publishes API to {{site.data.keyword.apiconnect_long}}
3. Users and applications consume API

## Before you begin

* Download and install [Node.js](https://nodejs.org/en/download/) version 8.15.0, or a higher 8.x.x version. It is recommended to use [nvm](https://github.com/creationix/nvm) to manage your Node.js versions.

## Create a REST API in Node.js

{: #create_api}
In this section, you will create an API in Node.js using [LoopBack](https://loopback.io/doc/index.html). LoopBack is a highly-extensible, open-source Node.js framework that enables you to create dynamic end-to-end REST APIs with little or no coding.

### Create application

1. Follow the instructions [here](https://{DomainName}/docs/services/apiconnect/tutorials?topic=apiconnect-tut_prereq_install_toolkit#installing-the-api-connect-toolkit) to install the {{site.data.keyword.apiconnect_short}} command line tool.
2. Enter the following command to create the application.
    ```sh
    apic loopback
    ```
    {: pre}
3. Use **entries-api** as the **name of your application**.
4. Use **entries-api** as the **directory to contain the project**.
6. Choose **empty-server** as the **kind of application**.

<!-- ![APIC Loopback scaffolding](images/solution13/apic_loopback.png) -->

### Add a data source

Data sources represent backend systems such as databases, external REST APIs, SOAP web services and storage services. Data sources typically provide create, retrieve, update and delete (CRUD) functions. While Loopback supports many types of [data sources](http://loopback.io/doc/en/lb3/Connectors-reference.html), for the sake of simplicity, you will use an in-memory data store with your API.

1. Change directory to the new project and launch the API Designer.
    ```sh
    cd entries-api
    ```
    {: pre}

    ```sh
    apic edit
    ```
    {: pre}
2. From the navigation, click **Data Sources**. Then click the **Add** button. A **New LoopBack Data Source** dialog will open.
3. Type `entriesDS` in the **Name** text field and click the **New** button.
4. Select **In-memory db** from the **Connector** combo box.
5. Click **All Data Sources** at the top left. The data source will appear in the list of data sources.

   The editor automatically updates the server/datasources.json file with settings for the new data source.
   {:tip}

![API Designer datasources](images/solution13/datastore.png)

### Add a model

A model is a JavaScript object with both Node and REST APIs that represents data in backend systems. Models are connected to these systems via data sources. In this section, you will define the structure of your data and connect it to the data source previously created.

1. From the navigation, click **Models**. Then click the **Add** button. A **New LoopBack Model** dialog will open.
2. Type `entry` in the **Name** text field and click the **New** button.
3. Select **entriesDS** from the **Data Source** combo box.
4. From the **Properties** card, add the following properties using the **Add property** icon.
    1. Type `name` for the **Property Name** and select **string** from the **Type** combo box.
    2. Type `email` for the **Property Name** and select **string** from the **Type** combo box.
    3. Type `comment` for the **Property Name** and select **string** from the **Type** combo box.
5. Click the **Save** icon in the upper right to save the model.

![Model generator](images/solution13/models.png)

## Create {{site.data.keyword.apiconnect_short}} service

To prepare for the next steps, you will create an **{{site.data.keyword.apiconnect_short}}** service on {{site.data.keyword.Bluemix_notm}}. {{site.data.keyword.apiconnect_short}} acts as the gateway to your API and also provides management, security and rate limits.

1. Launch {{site.data.keyword.Bluemix_notm}} [Resource List](https://{DomainName}/resources).
2. Navigate to **Catalog > Integration > {{site.data.keyword.apiconnect_short}}** and click the **Create** button.

## Publish an API to {{site.data.keyword.Bluemix_notm}}

{: #publish}
You will use the API Designer to deploy your application to {{site.data.keyword.Bluemix_notm}} as a Cloud Foundry application and also publish your API definition to **{{site.data.keyword.apiconnect_short}}**. The API Designer is your local toolkit. If you closed it, relaunch it with `apic edit` from the project directory.

The application can also be manually deployed using the `ibmcloud cf push` command; however, it will not be secured. To [import the API](https://{DomainName}/docs/services/apiconnect/tutorials?topic=apiconnect-tut_rest_landing#tut_rest_landing) into {{site.data.keyword.apiconnect_short}}, use the OpenAPI definition file is available in the `definitions` folder. Deploying using the API Designer secures the application and imports the definition automatically.
{:tip}

1. Back in the API Designer, click the **Publish** link in the banner. Then click **Add and Manage Targets > Add IBM Bluemix target**.
2. Select the **Region** and **Organization** that you want to publish to.
3. Select the **Sandbox** Catalog and click **Next**.
4. Type `entries-api-application` in the **Type a new application name** text field and click the **+** icon.
5. Click **entries-api-application** in the list and click **Save**.
6. Click on the hamburger **Menu** icon on the left top most corner of the banner. Then click **Projects** and the **entries-api** list item.
7. In the API Designer UI, click **APIs > entries-api > Assemble** links.
8. In the Assembly editor, click the **Filter policies** icon.
9. Select **DataPower Gateway policies** and click **Save**.
10. Click **Publish** on the top bar and select your target. Select **Publish application** and **Stage or Publish Products** > Select **Specific products** > **entries-api**.
11. Click **Publish** and wait for the application to finish publishing.
    ![Publishing dialog](images/solution13/publish.png)

    An application contains the Loopback models, datasources and code that relate to your API. A product allows you to declare how an API is made available to developers.
    {:tip}

The API application is now published to {{site.data.keyword.Bluemix_notm}} as a Cloud Foundry application. You can see it by looking at Cloud Foundry applications under {{site.data.keyword.Bluemix_notm}} [Resource List](https://{DomainName}/resources), but direct access using the URL is not possible as the application is protected. The next section will show how managed APIs can be accessed.

## API Gateway

Until now, you have been designing and testing your API locally. In this section, you will use {{site.data.keyword.apiconnect_short}} to test your deployed API on {{site.data.keyword.Bluemix_notm}}.

1. Launch the {{site.data.keyword.Bluemix_notm}} [Resource List](https://{DomainName}/resources).
2. Find and select your **{{site.data.keyword.apiconnect_short}}** service under **Cloud Foundry Services**.
3. Click on the **Explore** menu and then click the **Sandbox** link.
4. Click on the **entry.create** operation.
5. On the right pane, click **Try it**. Scroll down to **Parameters** and enter the following in the **data** text area.
    ```javascript
    {
      "name": "Cloud User",
      "email": "cloud@mycompany.com",
      "comment": "Entry on the cloud!"
    }
    ```
6. Click the **Call operation** button. A **Code: 200** response should display indicating success.

![gateway](images/solution13/gateway.png)

Your managed and secure API URL is displayed next to each operation and it should look like `https://api.us-south.apiconnect.appdomain.cloud/ORG-SPACE/sb/api/entries`.
{: tip}

## Rate Limiting

Setting rate limits enables you to manage the network traffic for your APIs and for specific operations within your APIs. A rate limit is the maximum number of calls allowed in a particular time interval.

1. Back in the API Designer, click **Products > entries-api**.
2. Select **Default Plan** on the left.
3. Expand **Default Plan** and scroll down to **Rate limits** field.
4. Set fields to **10** calls / **1** **Minute**.
5. Select **Enforce hard limit** and click **Save** icon.
  ![Rate limit page](images/solution13/rate_limit.png)
6. Follow the steps in [Publish API to {{site.data.keyword.Bluemix_notm}}](#publish) section to re-publish your API.

Your API is now limited to 10 requests per minute. Use the **Try it** feature to hit the limit. See more info about [Setting up rate limits](https://{DomainName}/docs/services/apiconnect/tutorials?topic=apiconnect-tut_rate_limit#setting-up-rate-limits) or explore the API Designer to see all the management features available.

## Expand the tutorial

Congratulations, you have built an API that is both managed and secure. Below are additional suggestions to enhance your API.

* Add data persistence using the [{{site.data.keyword.cloudant}}](https://{DomainName}/catalog/services/cloudant) LoopBack connector
* Use the API Designer to [view additional settings](http://127.0.0.1:9000/#/design/apis/editor/entries-api:1.0.0) to manage your API
* Review API **Analytics** and **Visualizations** [available](https://{DomainName}/docs/services/apiconnect/tutorials?topic=apiconnect-tut_insights_analytics#gaining-insights-from-basic-analytics) in {{site.data.keyword.apiconnect_short}}

## Related content

* [Loopback Documentation](https://loopback.io/doc/index.html)
* [Getting started with {{site.data.keyword.apiconnect_long}}](https://{DomainName}/docs/services/apiconnect?topic=apiconnect-index#index)
