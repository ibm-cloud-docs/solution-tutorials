---
copyright:
  years: 2018
lastupdated: "2018-02-02"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a database-driven Slackbot with {{site.data.keyword.conversationfull}}

In this solution tutorial we are going to build a Slackbot to create and search Db2 database entries for events and conferences. The Slackbot is backed by the {{site.data.keyword.conversationfull}} service. We integrate Slack and {{site.data.keyword.conversationshort}} using the [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/) in a serverless way. The connector is based on IBM Cloud Functions and {{site.data.keyword.cloudant_short_notm}}.
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
   * [{{site.data.keyword.dashdblong}} ](https://console.bluemix.net/catalog/services/db2-warehouse)
   * [ {{site.data.keyword.cloudantfull}}](https://console.bluemix.net/catalog/services/cloudant-nosql-db)

## Before you begin
{: #prereqs}

To complete this tutorial you need the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).


## Service and Environment Setup
In the following, we are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Download or clone [this Github repository](https://github.com/IBM-Cloud/slack-chatbot-database-watson) to your machine. Change into that new directory.
2. If not already done, [login to {{site.data.keyword.Bluemix_short}} and select the organization and space where the services and code should be deployed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/bx_cli.html#bluemix_login).
3. Create a {{site.data.keyword.dashdbshort}} instance and name it **eventDB**:
```
bx service create dashDB entry eventDB
```
You can also use another than the **Entry** plan.
4. To access the database service from {{site.data.keyword.openwhisk_short}} later on, we need the authorization. Thus, we create service credentials and label them **slackbotkey**:   
```
bx service key-create eventDB slackbotkey
```

5. Create an instance of the {{site.data.keyword.conversationshort}} service. We use **eventConversation** as name and the free Lite plan.
```
bx service create conversation free eventConversation
```
6. Next, we are going to register actions for {{site.data.keyword.openwhisk_short}} and bind service credentials to those actions. Thereafter, one of the actions gets invoked to create a table in {{site.data.keyword.dashdbshort}}. By using an action of {{site.data.keyword.openwhisk_short}} we neither need a local Db2 driver nor have to use the browser-based interface to manually create the table. To perform the registration and setup, copy each line of the file **setup.sh** and execute it on the command line or just simply invoke the script:
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

1. Click the **Deploy** icon in the left navigation panel.
2. Under Deploy Options in the **Deploy with Cloud Functions** click on **Deploy** for Slack.
3. Click on **Deploy to Slack app** which brings you to a page with instructions on how to create and configure the Slack app.
4. Follow the instructions on the that page which has several steps on its own. In order to create the Slack app, you need access to a Slack workspace. If you don't have that yet, then you can sign up and create such a workspace as part of that process. During the configuration process keep this in mind:
 * Remember how you name the Slack App and also keep copies of the important links (see instructions on that **Deploy to Slack app** page).
 * In the Slack section **Events Subscription** choose at least **message.im** to be able to send direct messages to the bot.
5. Once all is done you should have a fully configured Slack app in a messaging workspace. However, the Slackbot is not yet ready to successfully use the entire {{site.data.keyword.conversationshort}} dialog. Some credentials are missing.

## Add custom preprocessor to Conversation connector
In order to integrate Slack and Facebook Messenger with {{site.data.keyword.conversationshort}}, the [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector) uses a pipeline (sequence) of actions (see flow diagram in their documentation). They transform between the native messages and requests of the utilized communication tool (Slack or Facebook Messenger) and the format needed by {{site.data.keyword.conversationshort}}. All the actions in the sequence are custommizable. We need to adapt one action to retrieve credentials for {{site.data.keyword.openwhisk_short}} and to pass them into the dialog.

1. On the command line, execute the following update an already existing action. Replace **MySlackApp** with the name you used in the previous section.   
```
bx wsk action update MySlackApp_starter-code/pre-conversation pre-conversation-APIKey.js
```
2. Verify that the new action is in place by retrieving its details:   
```
bx wsk action get MySlackApp_starter-code/pre-conversation
```
In the output showing the action code should be keywords like **user**, **password** or **icfcreds**. Now the Slackbot is fully deployed and ready for use.

## Test the Slackbot and learn_how
Open up your Slack workspace for a test of the bot.

1. Type **help**.
2. **new event** to start gathering data for a new event record.
3. why in quotes? allows entries with spaces, try **"Meetup: IBM Cloud"**
4. uses sys-location, only cities recognized by WCS, can be changed to accept something like for shortname
5. any email address or URI for website
6. Dates are captured as date and time pair. see docs for what is possible
7. summary is printed and ICF action called, inserts data, then context variables are removed so that entire new entry is possible, done in child node

now repeat a new entry:
1. type **new event**
2. label the event **"my meeting"**
3. to abandon the input process enter **cancel**, **exit** or similar. No further questions should come up, only an acknowledgement of the cancellation.

now it is time to search
1. walk through one search
2. show short version of it



![](images/solution19/SlackSampleChat.png)   
TODO expand this section


Some things to remember and topics for blog:
* programmatic calls from Watson Conversation
* hide secrects, private context
* universal namespace for actions
* pre-conversation for retrieving credentials
* clean context and remove variables
* easy Db2 / database setup and cleanup via action
* cleanup context entries in Cloudant
* conditions to handle escape routes from slots


## Cleanup
Executing the cleanup script deletes the event table from {{site.data.keyword.dashdbshort}} and removes the actions from {{site.data.keyword.openwhisk_short}}. This might be useful when you start modifying and extending the code. The cleanup script neither changes the deployed Conversation connector nor the {{site.data.keyword.conversationshort}} workspace.   
```
sh cleanup.sh
```

## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
1. Use the Compose PostgreSQL or MySQL service instead of {{site.data.keyword.dashdbshort}}.
2. Add a weather service and retrieve forecast data for the event date and location.
3: Add search capabilities to, e.g., wildcard search or search for event durations ("give me all events longer than 8 hours").
4. Export event data as iCalendar ics file.
5. handle more "escape routes" out of information gathering dialog

# Related Content
TODO: Add Cloudant, ICF and more

* [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/) for connecting {{site.data.keyword.conversationshort}} to Slack and Facebook Messenger
* Documentation: [IBM Knowledge Center for {{site.data.keyword.dashdbshort}}](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Frequently asked questions about IBM Db2 on Cloud and IBM Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/managed_service.html) answering questions related to managed service, data backup, data encryption and security, and much more.
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers
* Documentation: [API Description of the ibm_db Node.js driver](https://github.com/ibmdb/node-ibm_db)
* [IBM Data Server Manager](https://www.ibm.com/us-en/marketplace/data-server-manager)
* {{site.data.keyword.cloudantfull}
