---
copyright:
  years: 2018
lastupdated: "2018-06-11"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a database-driven Slackbot

In this tutorial, you are going to build a Slackbot to create and search Db2 database entries for events and conferences. The Slackbot is backed by the {{site.data.keyword.conversationfull}} service. You will integrate Slack and {{site.data.keyword.conversationfull}} using the  [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/) using the serverless approach.

The  [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/) uses {{site.data.keyword.openwhisk_short}} and {{site.data.keyword.cloudantfull}}. The chatbot interacts with the Db2 database through {{site.data.keyword.conversationshort}}. All (not much) function code is using Node.js, but other programming languages can be used to deliver the same.

Note that deploying to Slack is not available in all regions. Please check [this part of the {{site.data.keyword.conversationshort}} documentation](https://console.bluemix.net/docs/services/conversation/conversation-connector.html#deploying-to-a-channel-with-the-conversation-connector) for details on availability before you begin.

## Objectives
{: #objectives}

* Connect {{site.data.keyword.conversationfull}} to Slack using the Conversation connector
* Create, deploy and bind Node.js actions in {{site.data.keyword.openwhisk_short}}
* Access a Db2 database from {{site.data.keyword.openwhisk_short}} using Node.js

## Services used
{: #services}

This tutorial uses the following runtimes and services:
   * [{{site.data.keyword.conversationfull}}](https://console.bluemix.net/catalog/services/conversation)
   * [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
   * [{{site.data.keyword.dashdblong}} ](https://console.bluemix.net/catalog/services/db2-warehouse)
   * [{{site.data.keyword.cloudantfull}}](https://console.bluemix.net/catalog/services/cloudant-nosql-db)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution19/SlackbotArchitecture.png)
</p>

## Before you begin
{: #prereqs}

To complete this tutorial, you need the latest version of the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).


## Service and Environment Setup
In this section, you are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Clone the [Github repository](https://github.com/IBM-Cloud/slack-chatbot-database-watson) and navigate into the cloned directory:
   ```bash
   git clone https://github.com/IBM-Cloud/slack-chatbot-database-watson
   cd slack-chatbot-database-watson
   ```
1. If you are not logged in, use `ibmcloud login` to log in interactively.
1. Target the organization and space where to create the database service with:
   ```
   ibmcloud target --cf
   ```
1. Create a {{site.data.keyword.dashdbshort}} instance and name it **eventDB**:
   ```
   ibmcloud service create dashDB Entry eventDB
   ```
   {:codeblock}
   You can also use another than the **Entry** plan.
1. To access the database service from {{site.data.keyword.openwhisk_short}} later on, you need the authorization. Thus, you create service credentials and label them **slackbotkey**:   
   ```
   ibmcloud service key-create eventDB slackbotkey
   ```
   {:codeblock}
1. Create an instance of the {{site.data.keyword.conversationshort}} service. Use **eventConversation** as name and the free Lite plan.
   ```
   ibmcloud service create conversation free eventConversation
   ```
   {:codeblock}
1. Next, you are going to register actions for {{site.data.keyword.openwhisk_short}} and bind service credentials to those actions.

   One of the actions gets invoked to create a table in {{site.data.keyword.dashdbshort}}. By using an action of {{site.data.keyword.openwhisk_short}}, you neither need a local Db2 driver nor have to use the browser-based interface to manually create the table. To perform the registration and setup, run the line below and this will execute the **setup.sh** file which contains all the actions. If your system does not support shell commands, copy each line out of the file **setup.sh** and execute it individually.

   ```bash
   sh setup.sh
   ```
   {:codeblock}   

   **Note:** By default the script also inserts few rows of sample data. You can disable this by outcommenting the following line in the above script: `#ibmcloud wsk action invoke slackdemo/db2Setup -p mode "[\"sampledata\"]" -r`

## Load the conversation workspace
In this part of the tutorial you are going to load a pre-defined workspace into the {{site.data.keyword.conversationshort}} service.
1. In the [{{site.data.keyword.Bluemix_short}} dashboard](https://console.bluemix.net) open the overview of your services. Locate the instance of the {{site.data.keyword.conversationshort}} service created in the previous section. Click on its entry to open the service details.
2. Click on **Launch Tool** to get to the {{site.data.keyword.conversationshort}} Tool.
3. Switch to **Workspaces** and click on the **Import workspace** icon.
4. In the popup dialog select the file **conversation-workspace.json** from the local directory. Leave the import option at **Everything (Intents, Entities, and Dialog)**, then click **Import**. This creates a new conversation workspace named **SlackBot**.
5. Click on **Dialog** to see the dialog nodes. You can expand them to see a structure like shown below.

   The dialog has nodes to handle questions for help and simple Thank You. The node **newEvent** and it's child gather the necessary input and then call an action to insert a new event record into Db2.

   The node **query events** clarifies whether events are searched by their identifier or by date. The actual search and collecting the necessary data are then performed by the child nodes **query events by shortname** and **query event by dates**.

  Details will be explained later below once everything is set up.
  ![](images/solution19/SlackBot_Dialog.png)   



## Deploy the Conversation to Slack

1. Using the conversation left navigation panel, click on the **Deploy** icon.
2. Click on the **Deploy** for Slack button.
3. Click on the **Deploy to Slack app** button, this will bring you to the instructions page to create and configure for Slack.
4. Follow the instructions on that page which has several steps on its own. In order to create the Slack app, you need access to a Slack workspace. If you don't have that yet, then you can sign up and create such a workspace as part of that process. During the configuration process keep this in mind:
   * Remember how you name the Slack App and the Deployment. Also keep copies of the redirect and request URLs (see instructions on that **Deploy to Slack app** page).
   * In the Slack section **Events Subscription** choose at least **message.im** to be able to send direct messages to the bot.
5. Once all is done, you should have a fully configured Slack app in a messaging workspace. However, the Slackbot is not yet ready to successfully use the entire {{site.data.keyword.conversationshort}} dialog. Some credentials are missing to invoke the previously defined actions.

Deploying the Conversation to Slack includes authorization of the app. During that process you are asked to sign in to Slack, if not done earlier, and then to approve the app. Make sure to select the correct Slack workspace if you have multiple. The resulting authorization tokens are stored in an **authdb** {{site.data.keyword.cloudant_short_notm}} database. The related service is named **conversation-connector**.
{:tip}
   ​

## Add custom preprocessor to Conversation connector
In order to integrate Slack and Facebook Messenger with {{site.data.keyword.conversationshort}}, the [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector) uses a pipeline (sequence) of actions (see flow diagram in their documentation). They transform between the native messages and requests of the utilized communication tool (Slack or Facebook Messenger) and the format needed by {{site.data.keyword.conversationshort}}. All the actions in the sequence are customisable. You need to modify one action to retrieve credentials for {{site.data.keyword.openwhisk_short}} and to pass them into the dialog.

1. On the command line, execute the following. Replace **MySlackApp** with the name you used in the previous section. The command updates the existing action **pre-conversation** in the package **MySlackApp_starter-code** with the code from the file **pre-conversation-APIKey.js**. That action usually is empty, but now, with this code, will obtain and add credentials to the information passed from Slack into the dialog.   
   ```
   ibmcloud wsk action update MySlackApp_starter-code/pre-conversation pre-conversation-APIKey.js
   ```
   {:codeblock}

2. Verify that the new action is in place by retrieving its details:   
   ```
   ibmcloud wsk action get MySlackApp_starter-code/pre-conversation
   ```
   {:codeblock}   

   The output mainly shows the action code. That code, in its text, includes keywords like **user**, **password** or **icfcreds**. Now the Slackbot is fully deployed and ready for use.

## Test the Slackbot and learn
Open up your Slack workspace for a test drive of the chatbot. Begin a direct chat with the bot.

1. Type **help** into the messaging form. The bot should respond with some guidance.
2. Now enter **new event** to start gathering data for a new event record. You will use {{site.data.keyword.conversationshort}} slots to collect all the necessary input.
3. First up is the event identifier or name. Quotes are required. They allow entering more complex names. Enter **"Meetup: IBM Cloud"** as the event name. The event name is defined as a pattern-based entity **eventName**. It supports different kinds of double quotes at the beginning and ending.
4. Next is the event location. Input is based on the [system entity **sys-location**](https://console.bluemix.net/docs/services/conversation/system-entities.html#system-entity-details). As a limitation, only cities recognized by {{site.data.keyword.conversationshort}} can be used. Try **Friedrichshafen** as a city.
5. Contact information such as an email address or URI for a website is asked for in the next step. Start with **https://www.ibm.com/events**. You will use a pattern-based entity for that field.
6. The next questions are gathering date and time for the begin and end. **sys-date** and **sys-time** are used which allow for different input formats. Use **next Thursday** as start date, **6 pm** for the time, **2018-10-21** and **22:00** for the end date and time.
7. Last, with all data collected, a summary is printed and a server action, implemented as {{site.data.keyword.openwhisk_short}} action, is invoked to insert a new record into Db2. Thereafter, dialog switches to a child node to clean up the processing environment by removing the context variables. The entire input process can be canceled anytime by entering **cancel**, **exit** or similar. In that case, the user choice is acknowledged and the environment cleaned up.
  ![](images/solution19/SlackSampleChat.png)   

With some sample data in it is time to search.
1. Type in **show event information**. Next is a question whether to search by identifier or by date. Enter a **name** and for the next question **"Think 2018"**. Now, the chatbot should display information about that event. The dialog has multiple responses to choose from.
2. With {{site.data.keyword.conversationshort}} as a backend, it is possible to enter more complex phrases and thereby skipping parts of the dialog. Use **show event by the name "Think 2018"** as input. The chatbot directly returns the event record.
3. Now you are going to search by date. A search is defined by a pair of dates, the event start date has to be between. With **search conference by date in March** as input, the result should be the **Think 2018** event again. The entity **March** is interpreted as two dates, March 1st, and March 31st, thereby providing input for the start and end of the date range.

After some more searches and new event entries, you can revisit the chat history and improve the future dialog. Follow the instructions in the [{{site.data.keyword.conversationshort}} documentation on **Improving understanding**](https://console.bluemix.net/docs/services/conversation/logs.html#about-the-improve-component).


## Remove resources
{:removeresources}

Executing the cleanup script deletes the event table from {{site.data.keyword.dashdbshort}} and removes the actions from {{site.data.keyword.openwhisk_short}}. This might be useful when you start modifying and extending the code. The cleanup script neither changes the deployed Conversation connector nor the {{site.data.keyword.conversationshort}} workspace.   
```bash
sh cleanup.sh
```
{:codeblock}

## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
1. Add search capabilities to, e.g., wildcard search or search for event durations ("give me all events longer than 8 hours").
2. Use the Compose PostgreSQL or MySQL service instead of {{site.data.keyword.dashdbshort}}.
3. Add a weather service and retrieve forecast data for the event date and location.
4. Export event data as iCalendar **.ics** file.
5. Connect the chatbot to Facebook Messenger.
6. Add interactive elements, such as buttons, to the output.      


## Related content
{:related}

Here are links to additional information on the topics covered in this tutorial.

Chatbot-related blog posts:
* [Chatbots: Some tricks with slots in IBM Watson Conversation](https://www.ibm.com/blogs/bluemix/2018/02/chatbots-some-tricks-with-slots-in-ibm-watson-conversation/)
* [Lively chatbots: Best Practices](https://www.ibm.com/blogs/bluemix/2017/07/lively-chatbots-best-practices/)
* [Building chatbots: more tipcs and tricks](https://www.ibm.com/blogs/bluemix/2017/06/building-chatbots-tips-tricks/)

Documentation and SDKs:
* Github repository with [tips and tricks for handling variables in IBM Watson Conversation](https://github.com/IBM-Cloud/watson-conversation-variables)
* [{{site.data.keyword.openwhisk_short}} documentation](https://console.bluemix.net/docs/openwhisk/openwhisk_about.html#about-cloud-functions)
* Documentation: [IBM Knowledge Center for {{site.data.keyword.dashdbshort}}](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers
* Documentation: [API Description of the ibm_db Node.js driver](https://github.com/ibmdb/node-ibm_db)
* [{{site.data.keyword.cloudantfull}} documentation](https://console.bluemix.net/docs/services/Cloudant/cloudant.html#overview)
