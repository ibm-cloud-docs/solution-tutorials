---
copyright:
  years: 2017, 2018
lastupdated: "2018-01-08"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Hybrid mobile application with Push and Analytics

Learn how easy it is to quickly create a Hybrid Cordova application with high-value mobile services like push notifications and mobile analytics on IBM Cloud.

This tutorial walks you through the creation of a mobile starter application, adding mobile services, setting up client SDKs, downloading the scaffolded code and then further enhancing the application.

## Objectives

* Create a mobile project with Push Notifications and Mobile Analytics services.
* Learn how to obtain APNs and FCM credentials.
* Download the code and complete required setup.
* Instrumenting the app to use mobile analytics.
* Configure, send, and monitor push notifications.
* Monitoring the app with mobile analytics.

 ![](images/solution15/Architecture.png)

## Products

This tutorial uses the following products:
   * [Mobile Analytics](https://console.bluemix.net/catalog/services/mobile-analytics)
   * [Push Notifications](https://console.bluemix.net/catalog/services/push-notifications)

## Before you begin
{: #prereqs}

- Cordova [CLI![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://cordova.apache.org/docs/en/latest/guide/cli/) for executing Cordova commands.
- Cordova-iOS [Prerequisites![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html) and Cordova-Android [Prerequisites![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html)
- Google account to log into Firebase console for Sender ID and Server API Key.
- [Apple Developers![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://developer.apple.com/) account to send remote notifications from Push Notifications service instance on IBM Cloud (the provider) to iOS devices and applications.
- Xcode and Android Studio for importing and further enhancing your code.

## Create Cordova mobile project from starter kit
{: #get_code}
The IBM Cloud Mobile Dashboard allows you to fast-track your mobile app development by creating your project from a Starter Kit.
1. Navigate to [Mobile Dashboard](https://console.bluemix.net/developer/mobile/dashboard).
2. Click on **Starter Kits** and scroll down to select the **Basic** Starter Kit.
    ![](images/solution6/mobile_dashboard.png)
3. Enter a project name, this can be your app name as well.
4. Select **Cordova** as your language and check the mobile services in the right pane.

    ![](images/solution15/create_cordova_project.png)
5. Click on **Create Project** to scaffold a Cordova (Javascript) App.
6. A new Project will be created under **Projects** tab on the left pane.

    **Note:** Push Notifications, and Mobile Analytics Services should be added to the Basic Starter.

In the next step, you will download the scaffolded code and complete the required setup.

## Download the code and complete required setup

If you haven't downloaded the code yet, then use IBM Cloud Mobile dashboard to get the code by clicking on the **Download Code** button under Projects > **Your Mobile Project**.

1. In an IDE of your choice, Navigate to `/platforms/android/project.properties` and replace the last two lines (library.1 and library.2) with the lines below

  ```
  cordova.system.library.1=com.android.support:appcompat-v7:26.1.0
  cordova.system.library.2=com.google.firebase:firebase-messaging:10.2.6
  cordova.system.library.3=com.google.android.gms:play-services-location:10.2.6
  ```
  The above changes are specific to Android
  {: tip}
2. To launch the app on an Android emulator, run the below command in a terminal or command prompt
```
 $ cordova build android
 $ cordova run android
```
 If you see an error, launch an emulator and try running the above command.
 {: tip}
3. To preview the app in the iOS simulator, run the below commands in a terminal,

    ```
    $ cordova build ios
    ```
    ```
    $ open platforms/ios/{YOUR_PROJECT_NAME}.xcworkspace/
    ```
    You can find your project name in `config.xml` file by running `cordova info` command.
    {: tip}

## Instrumenting the app to use Mobile Analytics.

1. Go to your Mobile dashboard > Projects > Cordova Project, Click on **Show** to unveil Push and Analytics service credentials.

   ![mobile dashboard](images/solution15/mobile_dashboard.png)

2. In `index.js`, under `onDeviceReady` function, update the value of `applicationName` with your app name and replace the value of `analyticsApiKey` with Analytics **apiKey**.
3. Just after **BMSAnalytics.initialize** call, add the below code to send analytics data to server

    ```
    BMSAnalytics.setUserIdentity("{YOUR_USER_IDENTITY}");
    BMSAnalytics.send();
    ```
4. For logging, add the below code after **BMSLogger.setLogLevel** call
   ```
   BMSLogger.send();
   ```
   Build and run the app. Navigate to the respective Mobile Analytics service > Manage > `Sessions` to see your app analytics.

 For advanced Analytics and logging capabilities, Refer [Gathering usage Analytics](https://github.com/ibm-bluemix-mobile-services/bms-clientsdk-cordova-plugin-core#using-bmsanalytics) and [logging](https://github.com/ibm-bluemix-mobile-services/bms-clientsdk-cordova-plugin-core#using-bmslogger)
 {:tip}

## Obtain FCM and APNs credentials

 ### Configure Firebase Cloud Messaging (FCM)

  1. In the [Firebase console](https://console.firebase.google.com), create a new project. Set the name to **hybridmobileapp**
  2. Navigate to the Project **Settings**
  3. Under the **General** tab, add two applications:
       1. one with the package name set to: **com.ibm.mobilefirstplatform.clientsdk.android.push**
       2. and one with the package name set to: **io.cordova.hellocordovastarter**
  4. Find the Sender ID and Server Key (also called API Key later on) under the **Cloud Messaging** tab.
  5. In the Push Notifications service dashboard, set the value of the Sender ID and API Key.


Refer [Obtain FCM credentials](https://console.bluemix.net/docs/tutorials/android-mobile-push-analytics.html#obtain-fcm-credentials) for detailed steps.
{: tip}

### Configure Apple Push Notifications Service (APNs)

  1. Go to the [Apple Developer![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en?lang=en)](https://developer.apple.com/) portal and Register an App ID.
  2. Create a development and distribution APNs SSL certificate.
  3. Create a development provisioning profile.
  4. Configure the Push Notifications service instance on IBM Cloud.

Refer [Obtain APNs credentials and configure Push Notifications service](https://console.bluemix.net/docs/tutorials/ios-mobile-push-analytics.html#obtain-apns-credentials-and-configure-push-notifications-service-instance-) for detailed steps.
{: tip}

## Configure, send and monitor push notifications

1. In index.js, under `onDeviceReady` function, replace the values  `{pushAppGuid}` and

   `{pushClientSecret} `with push service **credentials** - *appGuid* and *clientSecret*.

2. Go to your Mobile dashboard > Projects > Cordova Project, Click on the Push Notifications service and follow the below steps.

### APNs - Configure the service instance

To use the Push Notifications service to send notifications, upload the .p12 certificates that you had created in the above Step. This certificate contains the private key and SSL certificates that are required to build and publish your application.

**Note:** After the `.cer` file is in your keychain access, export it to your computer to create a `.p12` certificate.

1. Click on `Push Notifications` under Services section or Click on the three vertical dots next to the Push Notifications service and select `Open dashboard`.
2. On the Push Notifications Dashboard, you should see `Configure` option under `Manage > Send Notifications`.

To set up APNs on the `Push Notification services` console, complete the steps:

1. Select `Configure` from the Push Notification services dashboard.
2. Choose the `Mobile option` to update the information in the APNs Push Credentials form.
3. Select `Sandbox (development)` or `Production (distribution)` as appropriate and then upload the `p.12` certificate that you have created.
4. In the Password field, enter the password that is associated with the .p12 certificate file, then click Save.

### FCM - Configure the service instance

1. Select **Mobile** and then update the GCM/FCM Push Credentials tab with the Sender ID/Project number and API Key(Server Key) which you initially created on Firebase console.
2. Click **Save**. The push notifications service is now configured.

### Send push notifications

1. Select **Send Notifications**, and compose a message by choosing a send option. The supported options are the device by tag, device id, user id, Android devices, IOS devices, web notifications, and all devices.
   **Note:** When you select the **All Devices** option, all devices subscribed to Push Notifications will receive notifications.

2. In the **Message** field, compose your message. Choose to configure the optional settings as required.
3. Click **Send** and verify that your physical device has received the notification.

### Monitor sent notifications

You can monitor your sent notifications by navigating to **Monitoring** section.
The IBM Push Notifications service now extends capabilities to monitor the push performance by generating graphs from your user data. You can use the utility to list all the sent push notifications, or to list all the registered devices and to analyze information on a daily, weekly, or monthly basis.
 ![](images/solution6/monitoring_messages.png)

## Monitoring the app with Mobile Analytics.

You can record application logs and monitor data with the Mobile Analytics Client SDK. Developers can control when to send this data to the Mobile Analytics Service. When data is delivered to Mobile Analytics, you can use the Mobile Analytics console to get analytics insights about your mobile applications, devices, and application logs.
1. Open the **Mobile Analytics** service from the mobile project you created or click on the three vertical dots next to the service and select **Open Dashboard**.
2. You should see LIVE Users, Sessions, and other App Data by disabling **Demo Mode**. You can filter the analytics information by
   - Date.
   - Application.
   - Operating System.
   - The version of the app.

     ![](images/solution15/cordova_mobile_analytics.png)
3. [Click here](https://console.bluemix.net/docs/services/mobileanalytics/app-monitoring.html#monitoringapps) to set alerts, monitor app crashes, and monitor network requests.

## Related Content

[Tag-based notifications](https://console.bluemix.net/docs/services/mobilepush/push_step_4_nf_tag.html#tag_based_notifications)

[Push Notifications REST APIs](https://console.bluemix.net/docs/services/mobilepush/push_restapi.html#push-api-rest)

[Security in Push Notifications](https://console.bluemix.net/docs/services/mobilepush/push_security.html#overview-push)

[Exporting Analytics data to Db2 Warehouse](https://console.bluemix.net/docs/services/mobileanalytics/app-monitoring.html#dashdb)
