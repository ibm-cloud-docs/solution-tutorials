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

This tutorial uses the following products:

* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudantNoSQLDB)
* [App ID](https://console.ng.bluemix.net/catalog/services/AppID)
* [Push Notifications](https://console.ng.bluemix.net/catalog/services/imfpush)
* [Cloud Functions](https://console.bluemix.net/openwhisk)
* [Tone Analyzer](https://console.ng.bluemix.net/catalog/services/tone_analyzer)

## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://github.com/IBM-Bluemix/ibm-cloud-developer-tools) - Script to install bx cli and required plug-ins (Cloud Foundry and Cloud Functions)
* Java 8
{: java}
* Android Studio 2.3.3
{: java}
* Google Developer account to configure Firebase Cloud Messaging
{: java}
* Apple Developer account to configure Apple Push Notification Service
{: swift}

   In this tutorial, you will configure push notifications for the application. The tutorial assumes you have completed the basic Push Notifications tutorial for either [Android](./android-mobile-push-analytics.md) or [iOS](./ios-mobile-push-analytics.md) and you are familiar with the configuration of Firebase Cloud Messaging or Apple Push Notification Service.
   {:tip}

## Provision services to handle user authentication, feedback persistence and analysis
{: #provision_services}

In this section, you will provision the services used by the application. You can choose to provision the services from the IBM Cloud catalog or using the `bx` command line.

It is recommended that you create a new space to provision the services and deploy the serverless backend. This helps to keep all the resources together.

### Provision services from the IBM Cloud catalog

1. Go to the [IBM Cloud catalog](https://console.bluemix.net/catalog/)

1. Create a Cloudant NoSQL DB service with the **Lite** plan. Set the name to **serverlessfollowup-db**.

1. Create a Watson Tone Analyzer service with the **Standard** plan. Set the name to **serverlessfollowup-tone**.

1. Create an App ID service with the **Graduated tier** plan. Set the name to **serverlessfollowup-appid**.

1. Create a Push Notifications service with the **Lite** plan. Set the name to **serverlessfollowup-mobilepush**.

### Provision services from the command line

With the command line, run the following commands to provision the services and retrieve their credentials:

   ```sh
   bx cf create-service cloudantNoSQLDB Lite serverlessfollowup-db
   ```
   {: pre}

   ```sh
   bx cf create-service-key serverlessfollowup-db for-cli
   ```
   {: pre}

   ```sh
   bx cf service-key serverlessfollowup-db for-cli
   ```
   {: pre}

   ```sh
   bx cf create-service tone_analyzer standard serverlessfollowup-tone
   ```
   {: pre}

   ```sh
   bx cf create-service-key serverlessfollowup-tone for-cli
   ```
   {: pre}

   ```sh
   bx cf service-key serverlessfollowup-tone for-cli
   ```
   {: pre}

   ```sh
   bx cf create-service AppID "Graduated tier" serverlessfollowup-appid
   ```
   {: pre}

   ```sh
   bx cf create-service-key serverlessfollowup-appid for-cli
   ```
   {: pre}

   ```sh
   bx cf service-key serverlessfollowup-appid for-cli
   ```
   {: pre}

   ```sh
   bx cf create-service imfpush lite serverlessfollowup-mobilepush
   ```
   {: pre}

   ```sh
   bx cf create-service-key serverlessfollowup-mobilepush for-cli
   ```
   {: pre}

   ```sh
   bx cf service-key serverlessfollowup-mobilepush for-cli
   ```
   {: pre}

## Configure push notifications
{: #push_notifications}

When a user submits a new feedback, the application will analyze this feedback and send back a notification to the user. The user may have moved to another task, or may not have the mobile app started so using push notifications is a good way to communicate with the user. The Push Notifications service makes it possible to send notifications to iOS or Android users via one unified API. In this section, you will configure the Push Notifications service with your Apple Push Notification Service (APNs) or Firebase Cloud Messaging (FCM).

### Configure Firebase Cloud Message
{: swift}

1. In the [Firebase console](https://console.firebase.google.com), create a new project. Set the name to **serverlessfollowup**

1. Navigate to the Project **Settings**

1. Under the **General** tab, add two applications:

   1. one with the package name set to: **com.ibm.mobilefirstplatform.clientsdk.android.push**

   1. and one with the package name set to: **serverlessfollowup.app**

1. Download the `google-services.json` containing the two defined applications from Firebase console and place this file in the `android/app` folder of the checkout directory.

1. Make note of the Sender ID and Server Key under the **Cloud Messaging** tab, you will need them in the next section.

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

   ```sh
   cp template.local.env local.env
   ```

1. Get the credentials for Cloudant, Tone Analyzer, Push Notifications and App ID services from the IBM Cloud dashboard (or the output of the bx commands we ran before) and replace placeholders in `local.env` with corresponding values. These properties will be injected into a package so that all actions can get access to the database.

1. Deploy the actions to Cloud Functions. `deploy.sh` loads the credentials from `local.env` to create the Cloudant databases and deploy the Cloud Functions artifacts for the application.

   ```sh
   ./deploy.sh --install
   ```

   You can use `./deploy.sh --uninstall` to remove the Cloud Functions artifacts once you have completed the tutorial.
   {: tip}

## Configure and run a native mobile application to collect user feedback
{: #mobile_app}
{: swift}

Our Cloud Functions actions are ready for our mobile app. Before running the mobile app, you need to configure its settings to target the services you created.

1. With Android Studio, open the project located in the `android` folder of your checkout directory.

1. Edit android/app/src/main/res/values/credentials.xml and fill in the blanks with values from credentials. You will need the App ID `tenantId`, the Push Notification `appGuid` and `clientSecret` and the organization and space names where the Cloud Functions have been deployed.

1. Build the project

1. Start the application on a real device or with an emulator.

   For the emulator to receive push notifications, make sure to pick an image with the Google APIs and to log in with a Google account within the emulator.
   {: tip}

1. Watch the Cloud Functions in the background

   ```
   bx wsk activation poll
   ```

1. In the application, select **Log in* to authenticate with a Facebook or Google account. Once logged in, type a feedback message and press the **Send Feedback** button. Few seconds after the feedback has been sent, you should receive a push notifications on the device. The notification text can be customized by modifying the template documents in the `moods` database in the Cloudant service instance. Use the **View token** button to inspect the access and identification tokens generated by App ID upon login.

## Clean up resources

1. Use `deploy.sh` to remove the Cloud Functions artifacts:

   ```
   ./deploy.sh --uninstall
   ```

1. Delete the Cloudant, App ID, Push Notifications and Tone Analyzer services from the IBM Cloud console.

## Related information

* App ID provides a default configuration to help with the initial set up of your identity providers. Prior to publishing your app, [update the configuration to your own credentials](../services/appid/identity-providers.md).
