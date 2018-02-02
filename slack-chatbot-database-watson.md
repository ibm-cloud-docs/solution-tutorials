---
copyright:
  years: 2018
lastupdated: "2018-01-26"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a database-driven Slackbot with {{site.data.keyword.conversationfull}}

In this solution tutorial we are going to build a Slackbot to create and search Db2 database entries for events and conferences. The Slackbot is backed by the {{site.data.keyword.conversationfull}} service. We integrate Slack and {{site.data.keyword.conversationshort}} using the [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/). It is based on IBM Cloud Functions and Cloudant NoSQL DB.
The chatbot interacts with the Db2 database through {{site.data.keyword.conversationshort}}. All (not much) function code is written in Node.js, but other languages could have been easily used, too.

![](images/solution19/SlackbotArchitecture.png)

## Objectives

* Connect {{site.data.keyword.conversationfull}} to Slack using the Conversation connector
* Create, deploy and bind Node.js actions in {{site.data.keyword.openwhisk_short}}
* Access a Db2 database from {{site.data.keyword.openwhisk_short}} using Node.js

## Products

This tutorial uses the following products:
   * [{{site.data.keyword.conversationfull}}](https://console.bluemix.net/catalog/services/conversation)
   * [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
   * [Db2 Warehouse on Cloud](https://console.bluemix.net/catalog/services/db2-warehouse)
   * [Cloudant NoSQL DB](https://console.bluemix.net/catalog/services/cloudant-nosql-db)

## Before you begin
{: #prereqs}

To complete this tutorial you need the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).


## Service and Environment Setup
In the following, we are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Download or clone the repository https://github.com/IBM-Cloud/UPDATEME. Change into that directory.
2. If not already done, [login to {{site.data.keyword.Bluemix_short}} and select the organization and space where the services and code should be deployed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/bx_cli.html#bluemix_login).
3. Create a Db2 Warehouse instance. You can replace **myEventDB** with a name of your choice:
```
bx service create dashDB entry myEventDB
```
You can also use another than the **Entry** plan.
4. Create an instance of the {{site.data.keyword.conversationshort}} service. We use **eventConversation** as name and the free Lite plan.
```
bx service create conversation free eventConversation
```
5. Next, we are going to register actions for {{site.data.keyword.openwhisk_short}} and bind service credentials to those actions. Thereafter, one of the actions gets invoked to create a table in Db2 Warehouse. By using an action of {{site.data.keyword.openwhisk_short}} we neither need a local Db2 driver nor have to use the browser-based interface to manually create the table. To perform the registration and setup, copy each line of the file **setup.sh** and execute it on the command line or just simply invoke the script:
```
sh setup.sh
```
Note: By default the script also inserts few rows of sample data. You can disable this by outcommenting the following line in the above script:
```
#bx wsk action invoke slackdemo/db2Setup -p mode "[\"sampledata\"]" -r
```


## Load the conversation workspace
In this part of the tutorial we are going to load a pre-defined workspace into the {{site.data.keyword.conversationshort}} service. Thereafter, we need to replace service credentials and action names to adapt the workspace to the new environment.   
1. In the [{{site.data.keyword.Bluemix_short}} dashboard](https://console.bluemix.net) open the overview of your services. Locate the instance of the conversation service created in the previous section. Click on its entry to open the service details. Click on **Launch Tool** to get to the {{site.data.keyword.conversationshort}} Tool.
2. In the tool click on the **Import workspace** icon, right next to the **Create** button. In the popup dialog select the file **conversation-workspace.json** from the local directory. Leave the import option at **Everything (Intents, Entities, and Dialog)**, then click **Import**. This creates a new conversation workspace named **SlackBot**.
3. Click on **Dialog** to see the dialog nodes. You can expand them to see a structure like shown here:   
![](images/solution19/SlackBot_Dialog.png)   
The dialog has nodes to handle questions for help and simple Thank You. The node **newEvent** and its child gather the necessary input and then call an action to insert a new event record into Db2. The node **query events** clarifies whether events are searched by their name or by date. The actual search and collecting the necessary data are then performed by the child nodes **query events by shortname** and **query event by dates**. We come back to explaining some details once everything is set up.


## Deploy the Conversation to Slack

1. Click the deploy icon
2. Under Deploy Options in the **Deploy with Cloud Functions** click on **Deploy** for Slack.
3. Click on **Deploy to Slack app** which brings you to a page with instructions on how to create and configure the Slack app.
4. Follow the instructions on the that page which has about 8 steps on its own. In order to create the Slack app, you need access to a Slack workspace. If you don't have that yet, then you can sign up and create such a workspace as part of that process.


## Cleanup
Executing the cleanup script deletes the event table from Db2 Warehouse and removes the actions from {{site.data.keyword.openwhisk_short}}.
```
sh cleanup.sh
```



## Expand the tutorial
Want to extend this tutorial? Here are some ideas:
1. Use the Compose PostgreSQL or MySQL service instead of Db2 Warehouse.
2. E
3. Add a weather service and retrieve forecast data for the event date and location.
4. Export event data as iCalendar ics file.

# Related Content
* [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/) for connecting {{site.data.keyword.conversationshort}} to Slack and Facebook Messenger
* Documentation: [IBM Knowledge Center for Db2 Warehouse](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Frequently asked questions about IBM Db2 on Cloud and IBM Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/managed_service.html) answering questions related to managed service, data backup, data encryption and security, and much more.
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers
* Documentation: [API Description of the ibm_db Node.js driver](https://github.com/ibmdb/node-ibm_db)
* [IBM Data Server Manager](https://www.ibm.com/us-en/marketplace/data-server-manager)
