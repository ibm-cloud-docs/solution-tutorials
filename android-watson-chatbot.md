---
copyright:
  years: 2018
lastupdated: "2018-04-09"


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

# Build a voice-enabled Android Chatbot

Learn how easy it is to quickly create a voice-enabled Android native chatbot with Watson Assistant (formerly Conversation), Text-to-Speech, Speech-to-Text and mobile analytics services on IBM Cloud.

This tutorial walks you through the process of defining intents and entities and building a dialog flow for your chatbot to respond to customer's queries. You will learn how to enable speech-to-text and text-speech services for easy interaction with the Android app. Also, track the usage metrics through mobile analytics service.
{:shortdesc}

## Objectives

{: #objectives}

- Create a workspace
- Define an intent
- Define an entity
- Build a dialog flow
- Enable Speech to Text
- Enable Text to Speech
- Add mobile analytics to track usage

## Products

{: #products}

This tutorial uses the following products:

- [{{site.data.keyword.conversationfull}}](https://console.bluemix.net/catalog/services/ServiceName)
- [{{site.data.keyword.speechtotextfull}}](https://console.bluemix.net/catalog/services/speech-to-text)
- [{{site.data.keyword.texttospeechfull}}](https://console.bluemix.net/catalog/services/text-to-speech)
- [{{site.data.keyword.mobileanalytics_full}}](https://console.bluemix.net/catalog/services/mobile-analytics)

<p style="text-align: center;">
![]()
</p>

1. The user does this
2. Then that

## Before you begin

{: #prereqs}

- [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins

## Create a workspace

{: #create_workspace}

To begin, you will create {{site.data.keyword.conversationshort}} service on IBM Cloud and add a workspace. A workspace is a container for the artifacts that define the conversation flow. Download the JSON with predefined intents,entities and dialog flow.

1. Go to the [**{{site.data.keyword.Bluemix_notm}} Catalog**](https://console.bluemix.net/catalog/) and select [{{site.data.keyword.conversationshort}}](https://console.bluemix.net/catalog/services/watson-assistant-formerly-conversation) service > Lite plan under **Watson**. Click **Create**.

2. Click on **Launch tool** to see the {{site.data.keyword.conversationshort}} dashboard.

   ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/watson_assistant_launch_tool.png)

3. Click on **Workspaces** tab.

4. Click on **Import workspace** ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/import_icon.png) icon and choose the JSON file downloaded above. 

   ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/import_workspace.png)

5. Select **Everything** option and click **Import**.

6. A new workspace is created with predefined intents, entities and dialog flow.

## Define an intent

{:#define_intent}

An intent represents the purpose of a user's input, such as answering a question or processing a bill payment. You define an intent for each type of user request you want your application to support.By recognizing the intent expressed in a user's input, the Watson Assistant service can choose the correct dialog flow for responding to it. 

Simply put, intents are the intentions of the end-user. The following are examples of intent names.

- `#weather_conditions`
- `#pay_bill`
- `#escalate_to_agent`

1. Click on the newly create Workspace- **Ana**.

    Ana is an insurance bot for users to query their health benefits and file claims.
    {:tip}

2. Click on the first tab to see all the **Intents**. 

3. Click on **Add intent** to create a new intent. Enter `cancel_policy` as your intent name after `#`and provide an optional description.

   ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/add_intent.png)

4. Click **Create intent**.

5. Add user examples to cancel a policy

   - `Procedure to cancel my policy`
   - `Drop my policy now`
   - `How much is the penalty to cancel my car insurance policy early?`
   - `I wish to stop making payments on my policy.`

6. 
   Add user examples one after another and click **add example**. Repeat this for all the other user examples.

   Remember to add atleast 5 user examples to train your bot better.
   {:tip}

7. Click the **close** ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/close_icon.png) button next to the intent name to save the intent.

8. Click on **Content Catalog** and select **General**. Click **Add to Workspace**.

   Content catalog helps you in getting started faster by adding existing intents (banking, customer care, insurance, telco, e-commerce and many more). These intents are trained on common questions that users may ask.
   {:tip}

## Define an entity

{:#define_entity}

An entity represents a term or object that is relevant to your intents and that provides a specific context for an intent. You list the possible values for each entity and synonyms that users might enter. By recognizing the entities that are mentioned in the user's input, the Watson Assistant service can choose the specific actions to take to fulfill an intent.

1. Click **Entities** tab to see the existing entities.

2. Click **Add entity** and enter the name of the entity as `location` after `@`. Click **Create entity**.

3. Enter `address` as the value name and select **Synonyms**. 

4. Add `place` as a synonym and click the ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/plus_icon.png)icon. Repeat with synonyms `office`,`centre`etc., and Click **Add Value**.

   ![](/Users/VMac/Documents/VMAC/Code/Github-Enterprise/solutions/images/solution28-watson-chatbot-android/add_entity.png)


## Clean up resources



## Related information

- [Planning your Intents and Entities](https://console.bluemix.net/docs/services/conversation/intents-entities.html#planning-your-entities)