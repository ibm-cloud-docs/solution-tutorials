---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019, 2020, 2021
lastupdated: "2021-02-10"
lasttested: "2020-12-07"

content-type: tutorial
services: openwhisk, mobilepush, appid, Cloudant, tone-analyzer
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:java: .ph data-hd-programlang='java'}
{:swift: .ph data-hd-programlang='swift'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Mobile application with a serverless backend
{: #serverless-mobile-backend}
{: toc-content-type="tutorial"}
{: toc-services="openwhisk, mobilepush, appid, Cloudant, tone-analyzer"}
{: toc-completion-time="2h"}

This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

In this tutorial, you will learn how to use {{site.data.keyword.openwhisk}} along with Cognitive and Data services to build a serverless backend for a mobile application.
{:shortdesc}

Not all mobile developers have experience managing server-side logic, or a server to start with. They would prefer to focus their efforts on the app they are building. Now what if they could reuse their existing development skills to write their mobile backend?

{{site.data.keyword.openwhisk_short}} is a serverless event-driven platform. As [highlighted in this example](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-serverless-api-webapp#serverless-api-webapp), the actions you deploy can easily be turned into HTTP endpoints as *web actions* to build a web application backend API. A web application being a client to the REST API, it is easy to take this example a step further and apply the same approach to build a backend for a mobile app. And with {{site.data.keyword.openwhisk_short}}, mobile developers can write the actions in the same language used for their mobile app, Java for Android, and Swift for iOS.

## Objectives
{: #serverless-mobile-backend-objectives}

* Deploy a serverless mobile backend with {{site.data.keyword.openwhisk_short}}.
* Add user authentication to a mobile app with {{site.data.keyword.appid_short}}.
* Analyze user feedback with {{site.data.keyword.toneanalyzershort}}.
* Send notifications with {{site.data.keyword.mobilepushshort}}.

The application shown in this tutorial is a feedback app that smartly analyses the tone of the feedback text and appropriately acknowledges the customer through a {{site.data.keyword.mobilepushshort}}.

<p style="text-align: center;">
![Architecture Diagram](images/solution11/Architecture.png)
</p>

1. The user authenticates against [{{site.data.keyword.appid_short}}](https://{DomainName}/catalog/services/AppID). {{site.data.keyword.appid_short}} provides access and identification tokens.
2. Further calls to the backend API include the access token.
3. The backend is implemented with [{{site.data.keyword.openwhisk_short}}](https://{DomainName}/functions). The serverless actions, exposed as Web Actions, expect the token to be sent in the request headers and verify its validity (signature and expiration date) before allowing access to the actual API.
4. When the user submits a feedback, the feedback is stored in [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudantNoSQLDB)
5. The feedback text is processed with [{{site.data.keyword.toneanalyzershort}}](https://{DomainName}/catalog/services/tone_analyzer).
6. Based on the analysis result, a notification is sent back to the user with [{{site.data.keyword.mobilepushshort}}](https://{DomainName}/catalog/services/imfpush).
7. The user receives the notification on the device.

## Before you begin
{: #serverless-mobile-backend-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.openwhisk}} plugin (`cloud-functions`),
* `git` to clone source code repository.

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Additionally, based on the target mobile platform, you will need the following software and accounts:
   * For Android:
      1. Java 8
      2. Android Studio
      3. Google Developer account to configure Firebase Cloud Messaging
      4. Bash shell, cURL
   * For iOS:
      1. Xcode
      2. Apple Developer account to configure Apple Push Notification Service
      3. Bash shell, cURL

In this tutorial, you will configure push notifications for the application. The tutorial assumes you have completed the basic {{site.data.keyword.mobilepushshort}} steps for either [Android](https://{DomainName}/docs/mobilepush?topic=mobilepush-push_step_1#push_step_1_android) or [iOS](https:///docs/mobilepush?topic=mobilepush-push_step_1#push_step_1_ios) and you are familiar with the configuration of Firebase Cloud Messaging or Apple Push Notification Service.
{:tip}

## Get the application code
{: #serverless-mobile-backend-2}
{: step}

The repository contains both the mobile application and the {{site.data.keyword.openwhisk_short}} actions code.

1. Checkout the code from the GitHub repository

   ```sh
   git clone https://github.com/IBM-Cloud/serverless-followupapp-android
   ```
   {: pre}
   {: java}

   ```sh
   git clone https://github.com/IBM-Cloud/serverless-followupapp-ios
   ```
   {: pre}
   {: swift}

   For Windows 10 users to work with the command line instructions, we recommend installing the Windows Subsystem for Linux and Ubuntu as described in [this article](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10).
   {: tip}
   {: java}

2. Review the code structure

| File                                     | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| [**actions**](https://github.com/IBM-Cloud/serverless-followupapp-android/tree/master/actions) | Code for the {{site.data.keyword.openwhisk_short}} actions of the serverless mobile backend |
| [**android**](https://github.com/IBM-Cloud/serverless-followupapp-android/tree/master/android) | Code for the mobile application          |
| [**deploy.sh**](https://github.com/IBM-Cloud/serverless-followupapp-android/tree/master/deploy.sh) | Helper script to install, uninstall, update the {{site.data.keyword.openwhisk_short}} trigger, actions, rules |
{: java}

| File                                     | Description                              |
| ---------------------------------------- | ---------------------------------------- |
| [**actions**](https://github.com/IBM-Cloud/serverless-followupapp-ios/tree/master/actions) | Code for the {{site.data.keyword.openwhisk_short}} actions of the serverless mobile backend |
| [**followupapp**](https://github.com/IBM-Cloud/serverless-followupapp-ios/tree/master/followupapp) | Code for the mobile application          |
| [**deploy.sh**](https://github.com/IBM-Cloud/serverless-followupapp-ios/blob/master/deploy.sh) | Helper script to install, uninstall, update the {{site.data.keyword.openwhisk_short}} trigger, actions, rules |
{: swift}

## Provision services to handle user authentication, feedback persistence and analysis
{: #serverless-mobile-backend-provision_services}
{: step}

In this section, you will provision the services used by the application. You can choose to provision the services from the {{site.data.keyword.Bluemix_notm}} catalog or using the `ibmcloud` command line.

It is recommended that you create a new space to provision the services and deploy the serverless backend. This helps to keep all the resources together.

### Provision services from the {{site.data.keyword.Bluemix_notm}} catalog
{: #serverless-mobile-backend-4}


1. Create a [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudantNoSQLDB) service with the **Lite** plan. Select a region, Set the name to **serverlessfollowup-db** and select a resource group.
2. Create a [{{site.data.keyword.toneanalyzershort}}](https://{DomainName}/catalog/services/tone_analyzer) service with the **Lite** plan. Select a region same as the above service, Set the name to **serverlessfollowup-tone** and and select a resource group same as above.
3. Create an [{{site.data.keyword.appid_short}}](https://{DomainName}/catalog/services/AppID) service with the **Lite** plan. Set the name to **serverlessfollowup-appid**.
4. Create a [{{site.data.keyword.mobilepushshort}}](https://{DomainName}/catalog/services/imfpush) service with the **Lite** plan. Set the name to **serverlessfollowup-mobilepush**.

### Provision services from the command line
{: #serverless-mobile-backend-5}

With the command line, run the following commands to provision the services and retrieve their credentials:

Set the location where services should be created:

   ```sh
   REGION=us-south
   ```
   {: pre}

   ```sh
   ibmcloud resource service-instance-create serverlessfollowup-db cloudantnosqldb lite $REGION -p '{"legacyCredentials": true}'
   ```
   {: pre}

   ```sh
   ibmcloud resource service-key-create serverlessfollowup-db-for-cli Manager --instance-name serverlessfollowup-db
   ```
   {: pre}

   ```sh
   ibmcloud resource service-instance-create serverlessfollowup-tone tone-analyzer lite $REGION
   ```
   {: pre}

   ```sh
   ibmcloud resource service-key-create serverlessfollowup-tone-for-cli Writer --instance-name serverlessfollowup-tone
   ```
   {: pre}

   ```sh
   ibmcloud resource service-instance-create serverlessfollowup-appid appid lite $REGION

   ```
   {: pre}

   ```sh
   ibmcloud resource service-key-create serverlessfollowup-appid-for-cli Writer --instance-name serverlessfollowup-appid
   ```
   {: pre}

   ```sh
   ibmcloud resource service-instance-create serverlessfollowup-mobilepush imfpush lite $REGION
   ```
   {: pre}

   ```sh
   ibmcloud resource service-key-create serverlessfollowup-mobilepush-for-cli Writer --instance-name serverlessfollowup-mobilepush
   ```
   {: pre}

## Configure {{site.data.keyword.mobilepushshort}}
{: #serverless-mobile-backend-push_notifications}
{: step}

When a user submits a new feedback, the application will analyze this feedback and send back a notification to the user. The user may have moved to another task, or may not have the mobile app started so using push notifications is a good way to communicate with the user. The {{site.data.keyword.mobilepushshort}} service makes it possible to send notifications to iOS or Android users via one unified API. In this section, you will configure the {{site.data.keyword.mobilepushshort}} service for your target platform.

### Configure Firebase Cloud Messaging (FCM)
{: #serverless-mobile-backend-7}
{: java}

   1. In the [Firebase console](https://console.firebase.google.com), create a new project. Set the name to **serverlessfollowup**
   2. Navigate to the Project **Settings**
   3. Under the **General** tab, add two applications:
      1. one with the package name set to: **com.ibm.mobilefirstplatform.clientsdk.android.push**
      2. and one with the package name set to: **serverlessfollowup.app**
   4. Download the `google-services.json` containing the two defined applications from Firebase console and place this file in the `android/app` folder of the checkout directory.
   5. Find the Sender ID and Server Key under the **Cloud Messaging** tab.
   6. Navigate to the **Push Notifications** service page and under **Configure service**, click **Configure** on the **Android** tile and set the value of the Sender ID and Server Key.
   {: java}

### Configure Apple Push Notifications Service (APNs)
{: #serverless-mobile-backend-8}
{: swift}

1. Go to the [Apple Developer](https://developer.apple.com/) portal and Register an App ID.
2. Create a development and distribution APNs SSL certificate.
3. Create a development provisioning profile.
4. Configure the {{site.data.keyword.mobilepushshort}} service instance on {{site.data.keyword.Bluemix_notm}}. Refer to [Configure {{site.data.keyword.mobilepushshort}} service](https://{DomainName}/docs/mobilepush?topic=mobilepush-push_step_2#enable-push-ios-notifications) for detailed steps.
{: swift}

## Deploy a serverless backend
{: #serverless-mobile-backend-serverless_backend}
{: step}

With all the services configured, you can now deploy the serverless backend. The following {{site.data.keyword.openwhisk_short}} artifacts will be created in this section:

| Artifact                      | Type                           | Description                              |
| ----------------------------- | ------------------------------ | ---------------------------------------- |
| `serverlessfollowup`          | Package                        | A package to group the actions and to keep all service credentials |
| `serverlessfollowup-cloudant` | Package Binding                | Bound to the built-in {{site.data.keyword.cloudant_short_notm}} package   |
| `serverlessfollowup-push`     | Package Binding                | Bound to the {{site.data.keyword.mobilepushshort}} package  |
| `auth-validate`               | Action                         | Validates the access and identification tokens |
| `users-add`                   | Action                         | Persists the user information (id, name, email, picture, device id) |
| `users-prepare-notify`        | Action                         | Formats a message to use with {{site.data.keyword.mobilepushshort}} |
| `feedback-put`                | Action                         | Stores a user feedback in the database   |
| `feedback-analyze`            | Action                         | Analyzes a feedback with {{site.data.keyword.toneanalyzershort}}   |
| `users-add-sequence`          | Sequence exposed as Web Action | `auth-validate` and `users-add`          |
| `feedback-put-sequence`       | Sequence exposed as Web Action | `auth-validate` and `feedback-put`       |
| `feedback-analyze-sequence`   | Sequence                       | `read-document` from {{site.data.keyword.cloudant_short_notm}}, `feedback-analyze`, `users-prepare-notify` and `sendMessage` with {{site.data.keyword.mobilepushshort}} |
| `feedback-analyze-trigger`    | Trigger                        | Called by {{site.data.keyword.openwhisk_short}} when a feedback is stored in the database |
| `feedback-analyze-rule`       | Rule                           | Links the trigger `feedback-analyze-trigger` with the sequence `feedback-analyze-sequence` |

### Compile the code
{: #serverless-mobile-backend-10}
{: java}
1. From the root of the checkout directory, compile the actions code
{: java}

   ```sh
   ./android/gradlew -p actions clean jar
   ```
   {: pre}
   {: java}

### Configure and deploy the actions
{: #serverless-mobile-backend-11}
{: java}

1. Copy template.local.env to local.env

   ```sh
   cp template.local.env local.env
   ```
   {: pre}
2. Get the credentials for {{site.data.keyword.cloudant_short_notm}}, {{site.data.keyword.toneanalyzershort}}, {{site.data.keyword.mobilepushshort}} serviceand {{site.data.keyword.appid_short}} services from the [{{site.data.keyword.Bluemix_notm}} resources](https://{DomainName}/resources) (or the output of the ibmcloud commands we ran before) and replace placeholders in `local.env` with corresponding values. These properties will be injected into a package so that all actions can get access to the database.
   You can find the credentials for each of the service under **Service credentials** tab. If you don't see an auto-generated credential, click **New credential** to create one.
   {:tip}

3. Deploy the actions to {{site.data.keyword.openwhisk_short}}. `deploy.sh` loads the credentials from `local.env` to create the {{site.data.keyword.cloudant_short_notm}} databases (users, feedback and moods) and deploy the {{site.data.keyword.openwhisk_short}} artifacts for the application.
   ```sh
   ./deploy.sh --install
   ```
   {: pre}

   You can use `./deploy.sh --uninstall` to remove the {{site.data.keyword.openwhisk_short}} artifacts once you have completed the tutorial.
   {: tip}

4. Copy and **save** the `namespace` from the output of the `install` command above for future reference.

### Configure and deploy the actions
{: #serverless-mobile-backend-12}
{: swift}

1. Copy template.local.env to local.env
   ```sh
   cp template.local.env local.env
   ```
   {:pre}
2. Get the credentials for {{site.data.keyword.cloudant_short_notm}}, {{site.data.keyword.toneanalyzershort}}, {{site.data.keyword.mobilepushshort}} service and {{site.data.keyword.appid_short}} services from the [{{site.data.keyword.Bluemix_notm}} resources](https://{DomainName}/resources) (or the output of the ibmcloud commands we ran before) and replace placeholders in `local.env` with corresponding values. These properties will be injected into a package so that all actions can get access to the database.
   You can find the credentials for each of the service under **Service credentials** tab. If you don't see an auto-generated credential, click **New credential** to create one.
   {:tip}

3. Deploy the actions to {{site.data.keyword.openwhisk_short}}. `deploy.sh` loads the credentials from `local.env` to create the {{site.data.keyword.cloudant_short_notm}} databases (users, feedback and moods) and deploy the {{site.data.keyword.openwhisk_short}} artifacts for the application.

   ```sh
   ./deploy.sh --install
   ```
   {: pre}

   You can use `./deploy.sh --uninstall` to remove the {{site.data.keyword.openwhisk_short}} artifacts once you have completed the tutorial.
   {: tip}
4. Copy and **save** the `namespace` from the output of the `install` command above for future reference.

## Configure and run a native mobile application to collect user feedback
{: #serverless-mobile-backend-mobile_app}
{: step}

Our {{site.data.keyword.openwhisk_short}} actions are ready for our mobile app. Before running the mobile app, you need to configure its settings to target the services you created.

1. Launch **Android Studio**, open the project located in the `android` folder of your checkout directory.
2. Edit `android/app/src/main/res/values/credentials.xml` and fill in the blanks with values from credentials. You will need the {{site.data.keyword.appid_short}} `tenantId`, the {{site.data.keyword.mobilepushshort}} `appGuid` and `clientSecret` and `namespace` where the {{site.data.keyword.openwhisk_short}} have been deployed. For API host, launch command prompt or terminal and run the command
   ```sh
   ibmcloud fn property get --apihost
   ```
   {: pre}
3. In `android/app/src/main/java/serverlessfollowup/app/LoginActivity.java` and in `android/app/src/main/java/serverlessfollowup/app/LoginAndRegistrationListener.java`, update the value of the constant `region` to the location where the services were created.
4. Build the project.
5. Start the application on a real device or with an emulator.
   For the emulator to receive push notifications, make sure to pick an image with the Google APIs and to log in with a Google account within the emulator.
   {: tip}
6. Watch the {{site.data.keyword.openwhisk_short}} in the background
   ```sh
   ibmcloud fn activation poll
   ```
   {: pre}
7. In the application, select **Log in** to authenticate with a Facebook or Google account. Once logged in, type a feedback message and press the **Send Feedback** button. Few seconds after the feedback has been sent, you should receive a push notifications on the device. The notification text can be customized by modifying the template documents in the `moods` database in the {{site.data.keyword.cloudant_short_notm}} service instance. Use the **View token** button to inspect the access and identification tokens generated by {{site.data.keyword.appid_short}} upon login.
{: java}


1. Push client SDK and other SDKs are available on CocoaPods and Carthage. For this solution, you will use CocoaPods.
2. Launch terminal on your machine. Run the below command to move into `followupapp` folder and install the required dependencies.
   ```sh
   cd followupapp
   pod install
   ```
   {: pre}
3. Open the file with  `.xcworkspace` extension located under the `followupapp` folder of your checkout directory to launch your code in Xcode.
4. Edit `BMSCredentials.plist` file and fill in the blanks with values from credentials. You will need the {{site.data.keyword.appid_short}} `tenantId`, the {{site.data.keyword.mobilepushshort}} `appGuid` and `clientSecret` and the `namespace` where the {{site.data.keyword.openwhisk_short}} have been deployed. For API host, launch terminal and run the command

   ```sh
   ibmcloud fn property get --apihost
   ```
   {: pre}
5. Open `AppDelegate.swift` and update the push notifications service(BMSClient) region and AppID region depending on the location in which your service instances are created.
6. Build the project.
7. Start the application on a real device or with a simulator.
8. Watch the {{site.data.keyword.openwhisk_short}} in the background by running the below command on a Terminal.
   ```sh
   ibmcloud fn activation poll
   ```
   {: pre}
9. In the application, select **Log in** to authenticate with a Facebook or Google account. Once logged in, type a feedback message and press the **Send Feedback** button. Few seconds after the feedback has been sent, you should receive a push notifications on the device. The notification text can be customized by modifying the template documents in the `moods` database in the {{site.data.keyword.cloudant_short_notm}} service instance. Use the **View token** button to inspect the access and identification tokens generated by {{site.data.keyword.appid_short}} upon login.
{: swift}

## Remove resources
{: #serverless-mobile-backend-0}
{: step}

1. Use `deploy.sh` to remove the {{site.data.keyword.openwhisk_short}} artifacts:

   ```sh
   ./deploy.sh --uninstall
   ```
   {: pre}

2. Delete the {{site.data.keyword.cloudant_short_notm}}, {{site.data.keyword.appid_short}}, {{site.data.keyword.mobilepushshort}} and {{site.data.keyword.toneanalyzershort}} services from the [{{site.data.keyword.Bluemix_notm}} resources](https://{DomainName}/resources).

## Related content
{: #serverless-mobile-backend-15}
* [Serverless Computing](https://www.ibm.com/cloud/learn/serverless)
* {{site.data.keyword.appid_short}} provides a default configuration to help with the initial set up of your identity providers. Prior to publishing your app, [update the configuration to your own credentials](https://{DomainName}/docs/appid?topic=appid-social#social). You will also be able to [customize the login widget](https://{DomainName}/docs/appid?topic=appid-login-widget#login-widget).
