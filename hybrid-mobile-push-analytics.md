---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019
lastupdated: "2019-05-29"
lasttested: "2019-05-29"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Hybrid mobile application with Push Notifications
{: #hybrid-mobile-push-analytics}

Learn how easy it is to quickly create a Hybrid Cordova application with high-value mobile service like {{site.data.keyword.mobilepushshort}} on {{site.data.keyword.Bluemix_notm}}.

Apache Cordova is an open-source mobile development framework. It allows you to use standard web technologies - HTML5, CSS3, and JavaScript for cross-platform development. Applications execute within wrappers targeted to each platform, and rely on standards-compliant API bindings to access each device's capabilities such as sensors, data, network status, etc.

This tutorial walks you through the creation of a Cordova mobile starter application, adding a mobile service, setting up client SDK, downloading the scaffolded code and then further enhancing the application.

## Objectives

* Create a mobile project with {{site.data.keyword.mobilepushshort}} service.
* Learn how to obtain APNs and FCM credentials.
* Download the code and complete required setup.
* Configure, send, and monitor {{site.data.keyword.mobilepushshort}}.

 ![](images/solution15/Architecture.png)

## Products

This tutorial uses the following products:
* [{{site.data.keyword.pushfull}}](https://{DomainName}/catalog/services/push-notifications)

## Before you begin
{: #prereqs}

- Cordova [CLI](https://cordova.apache.org/docs/en/latest/guide/cli/) for executing Cordova commands.
- Cordova-iOS [Prerequisites](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html) and Cordova-Android [Prerequisites](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html)
- Google account to log into Firebase console for Sender ID and Server API Key.
- [Apple Developers](https://developer.apple.com/) account to send remote notifications from {{site.data.keyword.mobilepushshort}} service instance on {{site.data.keyword.Bluemix_notm}} (the provider) to iOS devices and applications.
- Xcode and Android Studio for importing and further enhancing your code.

## Create Cordova mobile project from starter kit
{: #get_code}
The {{site.data.keyword.Bluemix_notm}} Mobile Dashboard allows you to fast-track your mobile app development by creating your project from a Starter Kit.
1. Navigate to [Mobile Dashboard](https://{DomainName}/developer/mobile/dashboard)
1. Click on **Starter Kits** and click on **Create App**.
1. Enter an app name(this will be your android project name as well) > select a resource group.
1.Choose **Create a new app** under Starting point.
1. Select **Cordova** as your platform and click **Create**.
1. Under App details > Click on **Create service** > Web and Mobile > **Push Notifications** and select the location you want to provision the service, resource group and **Lite** pricing plan.
1. Click **Create** to provision {{site.data.keyword.mobilepushshort}} service. A new App will be created under **Apps** of [Resource list](https://{DomainName}/resources).

​      **Note:** {{site.data.keyword.mobilepushshort}} service should already be added with the Empty Starter.

In the next step, you will download the scaffolded code and complete the required setup.

## Download the code and complete required setup
{: #download_code}

If you haven't downloaded the code yet, then use {{site.data.keyword.Bluemix_notm}} Mobile dashboard to get the code by clicking on the **Download Code** button under Projects > **Your Mobile Project**.

1. In an IDE of your choice, Navigate to `/platforms/android/project.properties` and replace the last two lines (library.1 and library.2) with the lines below

  ```sh
  cordova.system.library.1=com.android.support:appcompat-v7:26.1.0
  cordova.system.library.2=com.google.firebase:firebase-messaging:10.2.6
  cordova.system.library.3=com.google.android.gms:play-services-location:10.2.6
  ```
  {: pre:}
  The above changes are specific to Android
  {: tip}
2. To launch the app on an Android emulator, run the below command in a terminal or command prompt
```sh
 cordova build android
 cordova run android
```
{: pre:}
 If you see an error, launch an emulator and try running the above command.
 {: tip}
3. To preview the app in the iOS simulator, run the below commands in a terminal,
    ```sh
    cordova build ios
    ```
   {: pre:}

    ```sh
    open platforms/ios/{YOUR_PROJECT_NAME}.xcworkspace/
    ```
    {: pre:}
    You can find your project name in `config.xml` file by running `cordova info` command.
    {: tip}

## Obtain FCM and APNs credentials
{: #obtain_fcm_apns_credentials}

 ### Configure Firebase Cloud Messaging (FCM)

  1. In the [Firebase console](https://console.firebase.google.com), create a new project. Set the name to **hybridmobileapp**
  2. Navigate to the Project **Settings**
  3. Under the **General** tab, add two applications:
       1. one with the package name set to: **com.ibm.mobilefirstplatform.clientsdk.android.push**
       2. and one with the package name set to: **io.cordova.hellocordovastarter**
  4. Find the Sender ID and Server Key (also called API Key later on) under the **Cloud Messaging** tab.
  5. In the {{site.data.keyword.mobilepushshort}} service dashboard, set the value of the Sender ID and API Key.


Refer [Obtain FCM credentials](https://{DomainName}/docs/tutorials?topic=solution-tutorials-android-mobile-push-analytics#obtain-fcm-credentials) for detailed steps.
{: tip}

### Configure Apple {{site.data.keyword.mobilepushshort}} Service (APNs)

  1. Go to the [Apple Developer](https://developer.apple.com/) portal and Register an App ID.
  2. Create a development and distribution APNs SSL certificate.
  3. Create a development provisioning profile.
  4. Configure the {{site.data.keyword.mobilepushshort}} service instance on {{site.data.keyword.Bluemix_notm}}.

Refer [Obtain APNs credentials and configure {{site.data.keyword.mobilepushshort}} service](https://{DomainName}/docs/tutorials?topic=solution-tutorials-ios-mobile-push-analytics#obtain-apns-credentials) for detailed steps.
{: tip}

## Configure, send and monitor {{site.data.keyword.mobilepushshort}}
{: #configure_push}

1. In index.js, under `onDeviceReady` function, replace `REPLACEME` with push service *clientSecret*.
2. Go to your App under [Resource list](https://{DomainName}/resources) > Apps > Cordova Project, Click on the {{site.data.keyword.mobilepushshort}} service and follow the below steps.

### APNs - Configure the service instance

To use the {{site.data.keyword.mobilepushshort}} service to send notifications, upload the .p12 certificates that you had created in the above Step. This certificate contains the private key and SSL certificates that are required to build and publish your application.

**Note:** After the `.cer` file is in your keychain access, export it to your computer to create a `.p12` certificate.

1. Click on `{{site.data.keyword.mobilepushshort}}` under **App details** or Click on the three vertical dots next to the {{site.data.keyword.mobilepushshort}} service and select `Open dashboard`.
2. On the {{site.data.keyword.mobilepushshort}} Dashboard, you should see `Configure` option under `Manage > Send Notifications`.

To set up APNs on the `Push Notification services` console, complete the steps:

1. Select `Configure` from the Push Notification services dashboard.
2. Choose the `Mobile option` to update the information in the APNs Push Credentials form.
3. Select `Sandbox (development)` or `Production (distribution)` as appropriate and then upload the `p.12` certificate that you have created.
4. In the Password field, enter the password that is associated with the .p12 certificate file, then click Save.

### FCM - Configure the service instance

1. Select **Mobile** and then update the GCM/FCM Push Credentials tab with the Sender ID/Project number and API Key(Server Key) which you initially created on Firebase console.
2. Click **Save**. The {{site.data.keyword.mobilepushshort}} service is now configured.

### Send {{site.data.keyword.mobilepushshort}}

1. Select **Send Notifications**, and compose a message by choosing a send option. The supported options are the device by tag, device id, user id, Android devices, IOS devices, web notifications, and all devices.
   **Note:** When you select the **All Devices** option, all devices subscribed to {{site.data.keyword.mobilepushshort}} will receive notifications.

2. In the **Message** field, compose your message. Choose to configure the optional settings as required.
3. Click **Send** and verify that your physical device has received the notification.

### Monitor sent notifications

You can monitor your sent notifications by navigating to **Monitoring** section.
The IBM {{site.data.keyword.mobilepushshort}} service now extends capabilities to monitor the push performance by generating graphs from your user data. You can use the utility to list all the sent {{site.data.keyword.mobilepushshort}}, or to list all the registered devices and to analyze information on a daily, weekly, or monthly basis.
 ![](images/solution6/monitoring_messages.png)

## Related Content
{: #related_content}

- [Tag-based notifications](https://{DomainName}/docs/services/mobilepush?topic=mobile-pushnotification-tag_based_notifications#tag_based_notifications)
- [{{site.data.keyword.mobilepushshort}} APIs](https://{DomainName}/docs/services/mobilepush?topic=mobile-pushnotification-apis-for-push-notification#apis-for-push-notification)
- [Security in {{site.data.keyword.mobilepushshort}}](https://{DomainName}/docs/services/mobilepush?topic=mobile-pushnotification-security-in-push-notifications#overview-push)

