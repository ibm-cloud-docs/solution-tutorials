---
copyright:
  years: 2018
lastupdated: "2018-11-13"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a database-driven Slackbot

In this tutorial, you are going to build a Slackbot to create and search Db2 database entries for events and conferences. The Slackbot is backed by the {{site.data.keyword.conversationfull}} service. You will integrate Slack and {{site.data.keyword.conversationfull}} using a [Botkit plugin for {{site.data.keyword.conversationshort}}](https://github.com/watson-developer-cloud/botkit-middleware). The Botkit app can be run locally or on {{site.data.keyword.Bluemix_notm}} with Cloud Foundry.

The  Botkit app channels messages between Slack and {{site.data.keyword.conversationshort}}. There, some server-side dialog actions perform SQL queries against a Db2 database. All (but not much) code is written in Node.js.

## Objectives
{: #objectives}

* Connect {{site.data.keyword.conversationfull}} to Slack using [Botkit](https://github.com/howdyai/botkit/)
* Create, deploy and bind Node.js actions in {{site.data.keyword.openwhisk_short}}
* Access a Db2 database from {{site.data.keyword.openwhisk_short}} using Node.js

## Services used
{: #services}

This tutorial uses the following runtimes and services:
   * [{{site.data.keyword.conversationfull}}](https://{DomainName}/catalog/services/conversation)
   * [{{site.data.keyword.openwhisk_short}}](https://{DomainName}/openwhisk/)
   * [{{site.data.keyword.dashdblong}} ](https://{DomainName}/catalog/services/db2-warehouse)
   * [Cloud Foundry runtime for Node.js](https://{DomainName}/catalog/starters/sdk-for-nodejs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution19/SlackbotArchitecture.png)
</p>

## Before you begin
{: #prereqs}

To complete this tutorial, you need the latest version of the [{{site.data.keyword.Bluemix_notm}} CLI](https://{DomainName}/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://{DomainName}/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).


## Service and Environment Setup
In this section, you are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Clone the [Github repository](https://github.com/IBM-Cloud/slack-chatbot-database-watson) and navigate into the cloned directory:
   ```bash
   git clone https://github.com/IBM-Cloud/slack-chatbot-database-watson
   cd slack-chatbot-database-watson
   ```
2. If you are not logged in, use `ibmcloud login` to log in interactively.
3. Target the organization and space where to create the database service with:
   ```
   ibmcloud target --cf
   ```
4. Create a {{site.data.keyword.dashdbshort}} instance and name it **eventDB**:
   ```
   ibmcloud service create dashDB Entry eventDB
   ```
   {:codeblock}
   You can also use another than the **Entry** plan.
5. To access the database service from {{site.data.keyword.openwhisk_short}} later on, you need the authorization. Thus, you create service credentials and label them **slackbotkey**:   
   ```
   ibmcloud service key-create eventDB slackbotkey
   ```
   {:codeblock}
6. Create an instance of the {{site.data.keyword.conversationshort}} service. Use **eventConversation** as name and the free Lite plan.
   ```
   ibmcloud service create conversation free eventConversation
   ```
   {:codeblock}
7. Next, you are going to register actions for {{site.data.keyword.openwhisk_short}} and bind service credentials to those actions.

   One of the actions gets invoked to create a table in {{site.data.keyword.dashdbshort}}. By using an action of {{site.data.keyword.openwhisk_short}}, you neither need a local Db2 driver nor have to use the browser-based interface to manually create the table. To perform the registration and setup, run the line below and this will execute the **setup.sh** file which contains all the actions. If your system does not support shell commands, copy each line out of the file **setup.sh** and execute it individually.

   ```bash
   sh setup.sh
   ```
   {:codeblock}   

   **Note:** By default the script also inserts few rows of sample data. You can disable this by outcommenting the following line in the above script: `#ibmcloud fn action invoke slackdemo/db2Setup -p mode "[\"sampledata\"]" -r`

## Load the skill / workspace
In this part of the tutorial you are going to load a pre-defined workspace or skill into the {{site.data.keyword.conversationshort}} service.
1. In the [{{site.data.keyword.Bluemix_short}} dashboard](https://{DomainName}) open the overview of your services. Locate the instance of the {{site.data.keyword.conversationshort}} service created in the previous section. Click on its entry to open the service details.
2. Remember the **API Key** and **Url** for the integration with Slack later on.
3. Click on **Launch Tool** to get to the {{site.data.keyword.conversationshort}} Tool.
4. Switch to **Skills**, then click **Create new** and then on **Import skill**.
5. In the dialog, after clicking **Choose JSON file**, select the file **assistant-skill.json** from the local directory. Leave the import option at **Everything (Intents, Entities, and Dialog)**, then click **Import**. This creates a new skill named **SlackBot**.
6. Click on **Dialog** to see the dialog nodes. You can expand them to see a structure like shown below.

   The dialog has nodes to handle questions for help and simple Thank You. The node **newEvent** and it's child gather the necessary input and then call an action to insert a new event record into Db2.

   The node **query events** clarifies whether events are searched by their identifier or by date. The actual search and collecting the necessary data are then performed by the child nodes **query events by shortname** and **query event by dates**.

  Details will be explained later below once everything is set up.
  ![](images/solution19/SlackBot_Dialog.png)   



## Integrate with Slack
Now we are creating a Slack app with a Bot user and obtain the credentials to access it from the Botkit app. Then, we configure the botkit app and push it as Cloud Foundry app.
1. Visit the [Slack apps](https://api.slack.com/slack-apps) page. If you don’t have an app already click **Create a Slack app** and follow the next steps. If you already have an app, click **Manage your apps** and choose the app you want to use, continue with step 3. 
2. Enter **Eventbot** as **App Name** and pick the Slack workspace you want to deploy the bot to. In the navigation menu select **Bot Users**, then **Add a Bot User**. Keep the names and enable **Always Show My Bot as Online**. Then finish the dialog.
3. Click on **OAuth & Permissions** in the navigation menu. Thereafter, if not done alreay, install the app into the workspace. You are presented two OAuth tokens. Copy the **Bot User OAuth Access Token**.
4. Change into the directory for the botkit app and create an environment configuration file.
   ```
   cd botkit-app
   cp .env.template .env
   ```
5. Edit the **.env** configuration file. Add the Slack OAuth token from step 4, the API Key and URL for {{site.data.keyword.conversationshort}} from the previous section as well as the API key for {{site.data.keyword.openwhisk_short}}. You can obtain that API key using the following command.
   ```
   ibmcloud fn property get --auth
   ```
6. Once the configuration is complete and you have saved the file, push the app.
   ```
   ibmcloud cf push
   ```
   After a moment, it should show success.


## Test the Slackbot and learn
Open up your Slack workspace for a test drive of the chatbot. Begin a direct chat with the bot.

1. Type **help** into the messaging form. The bot should respond with some guidance.
2. Now enter **new event** to start gathering data for a new event record. You will use {{site.data.keyword.conversationshort}} slots to collect all the necessary input.
3. First up is the event identifier or name. Quotes are required. They allow entering more complex names. Enter **"Meetup: IBM Cloud"** as the event name. The event name is defined as a pattern-based entity **eventName**. It supports different kinds of double quotes at the beginning and ending.
4. Next is the event location. Input is based on the [system entity **sys-location**](https://{DomainName}/docs/services/conversation/system-entities.html#system-entity-details). As a limitation, only cities recognized by {{site.data.keyword.conversationshort}} can be used. Try **Friedrichshafen** as a city.
5. Contact information such as an email address or URI for a website is asked for in the next step. Start with **https://www.ibm.com/events**. You will use a pattern-based entity for that field.
6. The next questions are gathering date and time for the begin and end. **sys-date** and **sys-time** are used which allow for different input formats. Use **next Thursday** as start date, **6 pm** for the time, **2018-10-21** and **22:00** for the end date and time.
7. Last, with all data collected, a summary is printed and a server action, implemented as {{site.data.keyword.openwhisk_short}} action, is invoked to insert a new record into Db2. Thereafter, dialog switches to a child node to clean up the processing environment by removing the context variables. The entire input process can be canceled anytime by entering **cancel**, **exit** or similar. In that case, the user choice is acknowledged and the environment cleaned up.
  ![](images/solution19/SlackSampleChat.png)   

With some sample data in it is time to search.
1. Type in **show event information**. Next is a question whether to search by identifier or by date. Enter a **name** and for the next question **"Think 2018"**. Now, the chatbot should display information about that event. The dialog has multiple responses to choose from.
2. With {{site.data.keyword.conversationshort}} as a backend, it is possible to enter more complex phrases and thereby skipping parts of the dialog. Use **show event by the name "Think 2018"** as input. The chatbot directly returns the event record.
3. Now you are going to search by date. A search is defined by a pair of dates, the event start date has to be between. With **search conference by date in March** as input, the result should be the **Think 2018** event again. The entity **March** is interpreted as two dates, March 1st, and March 31st, thereby providing input for the start and end of the date range.

After some more searches and new event entries, you can revisit the chat history and improve the future dialog. Follow the instructions in the [{{site.data.keyword.conversationshort}} documentation on **Improving understanding**](https://{DomainName}/docs/services/conversation/logs.html#about-the-improve-component).


## Remove resources
{:removeresources}

Executing the cleanup script in the main directory deletes the event table from {{site.data.keyword.dashdbshort}} and removes the actions from {{site.data.keyword.openwhisk_short}}. This might be useful when you start modifying and extending the code. The cleanup script does not change the {{site.data.keyword.conversationshort}} workspace or skill.   
```bash
sh cleanup.sh
```
{:codeblock}

To delete the botkit app, execute the following command:
```bash
ibmcloud cf delete botkit-app
```

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
* [{{site.data.keyword.openwhisk_short}} documentation](https://{DomainName}/docs/openwhisk/openwhisk_about.html#about-cloud-functions)
* Documentation: [IBM Knowledge Center for {{site.data.keyword.dashdbshort}}](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers
* Documentation: [API Description of the ibm_db Node.js driver](https://github.com/ibmdb/node-ibm_db)
* [{{site.data.keyword.cloudantfull}} documentation](https://{DomainName}/docs/services/Cloudant/cloudant.html#overview)
