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

In this section, you will provision the services used by the application.

1. Step 1

  This is a tip.
  {:tip}

2. Step 2

### Sub objective

   ```bash
   some shellscript
   ```
   {: pre}


This paragraph only appears in the iOS documentation{: ios}

And this paragraph only appears in the iOS documentation{: android}

## Configure push notifications
{: #push_notifications}

When a user submits a new feedback, the application will analyze this feedback and send back a notification to the user. The user may have moved to another task, may not have the mobile app started so using push notifications is a good way to communicate with the user. The Push Notifications service makes it possible to send notifications to iOS or Android users via one unified API. In this section, you will configure the Push Notifications service with your Apple Push Notification Service (APNs) or Firebase Cloud Messaging (FCM).

### Sub objective

## Deploy a serverless backend
{: #serverless_backend}

With all the services configured, you can now deploy the serverless backend.

1. Checkout the code from the GitHub repository

   ```sh
   git clone https://github.com/IBM-Bluemix/serverless-followupapp-android
   ```
   {: pre}

## Configure and run a native mobile application to collect user feedback
{: #mobile_app}

Our Cloud Functions actions are ready for our mobile app. Before running the mobile app, you need to configure its settings to target the services you created.

## Related information

* [Relevant links](https://blah)
