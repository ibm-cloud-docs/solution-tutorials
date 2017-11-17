---
copyright:
  years: 2017
lastupdated: "2017-11-16"

---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: data-hd-operatingsystem="ios"}
{:android: data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Serverless Mobile backend
In this tutorial, you will learn how to use Cloud Functions along with other Cognitive and Data services to build a serverless backend for a mobile application.

The application shown in this tutorial is a feedback app that smartly analyses the Tone of the feedback provided and appropriately acknowledges the customer through a Push Notification.
{:shortdesc}

## Objectives

* Provision services to handle user authentication, feedback persistence and analysis
* Configure push notifications
* Deploy a serverless backend
* Configure and run a native mobile application to collect user feedback

![](images/solutionX/Architecture.png)

## Products

* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudantNoSQLDB)
* [App ID](https://console.ng.bluemix.net/catalog/services/AppID)
* [Push Notifications](https://console.ng.bluemix.net/catalog/services/imfpush)
* [Cloud Functions](https://console.bluemix.net/openwhisk)
* [Tone Analyzer](https://console.ng.bluemix.net/catalog/services/tone_analyzer)

## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://github.com/IBM-Bluemix/ibm-cloud-developer-tools) - Script to install bx cli and required plug-ins (Cloud Foundry and Cloud Functions)
* Java 8
* Android Studio 2.3.3
* Google Developer account to configure Firebase Cloud Messaging
* Apple Developer account to configure Apple Push Notification Service

## Provision services to handle user authentication, feedback persistence and analysis
{: #provision_services}

In this section, you will provision the services used by the application. You can choose to provision the services from the IBM Cloud catalog or using the `bx` command line.

It is recommended that you create a new space to provision the services and deploy the serverless backend. This helps to keep all the resources together.

### Provision services from the IBM Cloud catalog

1. Go to the [IBM Cloud catalog](https://console.bluemix.net/catalog/)

1. Create a Cloudant NoSQL DB service with the **Lite** plan. Set the name to **serverless-followupapp-db**.

1. Create a Watson Tone Analyzer service with the **Standard** plan. Set the name to **serverless-followupapp-tone**.

1. Create an App ID service with the **Graduated tier** plan. Set the name to **serverless-followupapp-appid**.

1. Create a Push Notifications service with the **Lite** plan. Set the name to **serverless-followupapp-mobilepush**.

### Provision services from the command line

With the command line, run the following commands to provision the services and retrieve their credentials:

   ```sh
   bx cf create-service cloudantNoSQLDB Lite serverless-followupapp-db
   bx cf create-service-key serverless-followupapp-db for-cli
   bx cf service-key serverless-followupapp-db for-cli
   ```
   {: pre}

   ```sh
   bx cf create-service tone_analyzer standard serverless-followupapp-tone
   bx cf create-service-key serverless-followupapp-tone for-cli
   bx cf service-key serverless-followupapp-tone for-cli
   ```
   {: pre}

   ```sh
   bx cf create-service AppID "Graduated tier" serverless-followupapp-appid
   bx cf create-service-key serverless-followupapp-appid for-cli
   bx cf service-key serverless-followupapp-appid for-cli
   ```
   {: pre}

   ```sh
   bx cf create-service imfpush lite serverless-followupapp-mobilepush
   bx cf create-service-key serverless-followupapp-mobilepush for-cli
   bx cf service-key serverless-followupapp-mobilepush for-cli
   ```
   {: pre}

## Configure push notifications
{: #push_notifications}

When a user submits a new feedback, the application will analyze this feedback and send back a notification to the user. The user may have moved to another task, may not have the mobile app started so using push notifications is a good way to communicate with the user. The Push Notifications service makes it possible to send notifications to iOS or Android users via one unified API. In this section, you will configure the Push Notifications service with your Apple Push Notification Service (APNs) or Firebase Cloud Messaging (FCM).

## Deploy a serverless backend
{: #serverless_backend}

With all the services configured, you can now deploy the serverless backend.

1. Checkout the code from the GitHub repository

   ```sh
   git clone https://github.com/IBM-Bluemix/serverless-followupapp-android
   ```
   {: pre}

1. From the root of the project, complile the actions code

   ```sh
   ./android/gradlew -p actions clean jar
   ```
   {: pre}

1. Copy template.local.env to local.env

   ```
   cp template.local.env local.env
   ```

1. Get the credentials for Cloudant, Tone Analyzer, Push Notifications and App ID services from the IBM Cloud dashboard (or the output of the bx commands we ran before) and replace placeholders in `local.env` with corresponding values. These properties will be injected into a package so that all actions can get access to the database.

1. Deploy the actions to Cloud Functions

   ```
   ./deploy.sh --install
   ```

## Configure and run a native mobile application to collect user feedback
{: #mobile_app}

Our Cloud Functions actions are ready for our mobile app. Before running the mobile app, you need to configure its settings to target the services you created.

## Related information

* [Relevant links](https://blah)
