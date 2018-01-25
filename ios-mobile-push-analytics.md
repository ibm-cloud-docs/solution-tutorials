---
copyright:
  years: 2017, 2018
lastupdated: "2018-01-05"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# iOS mobile application with Push and Analytics

Learn how easy it is to quickly create an iOS Swift application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.

This tutorial walks you through the creation of a mobile starter application, adding mobile services, setting up client SDKs, importing the code to Xcode and then further enhance the application.

## Objectives

* Create a mobile project with Push Notifications and Mobile Analytics services from Basic Swift starter kit.
* Obtain APNs credentials and configure Push Notifications service instance.
* Download the code and setup client SDKs.
* Instrumenting the app to use Mobile Analytics.
* Send and monitor push notifications.
* Monitoring the app with Mobile Analytics.

  ![](images/solution6/Architecture.png)

## Products

This tutorial uses the following products:
   * [Mobile Analytics](https://console.bluemix.net/catalog/services/mobile-analytics)
   * [Push Notifications](https://console.bluemix.net/catalog/services/push-notifications)

## Before you begin
{: #prereqs}

1. [Apple Developers![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://developer.apple.com/) account to send remote notifications from Push Notifications service instance on IBM Cloud (the provider) to iOS devices and applications.
2. Xcode for importing and enhancing your code.

## Create a mobile project from basic Swift starter kit
{: #get_code}

1. Navigate to [Mobile Dashboard](https://console.bluemix.net/developer/mobile/dashboard) to create your `Project` from pre-defined `Starter Kits`.
2. Click on **Starter Kits** and scroll down to select **Basic** Starter Kit.
    ![](images/solution6/mobile_dashboard.png)
3. Enter a project name which will also be the Xcode project and app name.
4. Select `Swift` as your language and check the mobile services on the right pane.
    ![](images/solution6/create_new_project.png)
5. Click on `Create Project` to scaffold an iOS Swift App.
6. A new `Project` will be created under Projects tab on the left pane.

​      **Note:** Push Notifications and Mobile Analytics Services should already be added with the Basic Starter.

## Download the code and setup client SDKs
If you haven't downloaded the code yet, Click on `Download Code` under Projects > `Your Mobile Project`
The downloaded code comes with **Push Notifications** and **Mobile Analytics** Client SDKs included. The Client SDKs are available on CocoaPods and Carthage. For this solution, you will use CocoaPods.

1. To install CocoaPods on your machine, Open the `Terminal` and run the below command.
   ```
   sudo gem install cocoapods
   ```
   {: pre:}
2. Unzip the downloaded code and using the terminal, navigate to the unzipped folder

   ```
   cd <Name of Project>
   ```
   {: pre:}
3. The folder already includes a `podfile` with required dependencies. Run the below command to install the dependencies (Client SDKs) and the required dependencies will be installed.

  ```
  pod install
  ```
  {: pre:}



## Instrumenting the app to use Mobile Analytics

1. Open `.xcworkspace` in Xcode and navigate to `AppDelegate.swift`.
  **Note:** Ensure that you always open the new Xcode workspace, instead of the original Xcode project file: `MyApp.xcworkspace`.
   ![](images/solution6/Xcode.png)

  `BMSCore` is the Core SDK and is base for the Mobile Client SDKs. `BMSClient` is a class of BMSCore and initialized in AppDelegate.swift. Along with BMSCore, Mobile Analytics SDK is already imported into the project.
2. Analytics initialization code is already included as shown below
  ```
  // Analytics client SDK is configured to record lifecycle events.
         	Analytics.initialize(appName:dictionary["appName"] as? String,
        			     apiKey: dictionary["analyticsApiKey"] as? String,
        	        	     deviceEvents: .lifecycle)

        	// Enable Logger (disabled by default) and set level to ERROR (DEBUG by default).
        	Logger.isLogStorageEnabled = true
        	Logger.logLevelFilter = .error
  ```
   {: codeblock:}

  **Note:** The service credentials are part of `BMSCredentials.plist` file.

3. Gathering usage analytics and using logger - Navigate to `ViewController.swift` to see the below code.
   ```
    func didBecomeActive(_ notification: Notification) {
        Analytics.send()
        Logger.send()
     }
   ```
   For advanced Analytics and logging capabilities, Refer [Gathering usage Analytics](https://console.bluemix.net/docs/services/mobileanalytics/sdk.html#app-monitoring-gathering-analytics) and [logging](https://console.bluemix.net/docs/services/mobileanalytics/sdk.html#enabling-configuring-and-using-logger)
   {:tip}


   ## Obtain APNs credentials and configure Push Notifications service instance.

   For iOS devices and applications, Apple Push Notification Service (APNs) allows application developers to send remote notifications from Push Notifications service instance on IBM Cloud (the provider) to iOS devices and applications. Messages are sent to a target application on the device.

   You need to obtain and configure your APNs credentials. The APNs certificates are securely managed by Push Notifications service and used to connect to APNs server as a provider.

   ### Registering an App ID

   The App ID (the bundle identifier) is a unique identifier that identifies a specific application. Each application requires an App ID. Services like the Push Notifications service are configured to the App ID.
   Ensure that you have an [Apple Developers![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://developer.apple.com/) account. This is a mandatory prerequisite.

   1. Go to the [Apple Developer![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://developer.apple.com/) portal, click `Member Center`, and select `Certificates, IDs & Profiles`.
   2. Go to `Identifiers` > App IDs section.
   3. In the `Registering App IDs` page, provide the App name in the App ID Description Name field. For example: ACME Push Notifications. Provide a string for the App ID Prefix.
   4. For the App ID Suffix, choose `Explicit App ID` and provide a Bundle ID value. It is recommended that you provide a reverse domain-name style string. For example: com.ACME.push.
   5. Select the `Push Notifications` check-box and click `Continue`.
   6. Go through your settings and click `Register` > `Done`.
     Your App ID is now registered.

     ![](images/solution6/push_ios_register_appid.png)

  ### Create a development and distribution APNs SSL certificate
   Before you obtain an APNs certificate, you must first generate a certificate signing request (CSR) and submit it to Apple, the certificate authority (CA). The CSR contains information that identifies your company and your public and private key that you use to sign for your Apple push notifications. Then, generate the SSL certificate on the iOS Developer Portal. The certificate, along with its public and private key, is stored in Keychain Access.
   You can use APNs in two modes:

     * Sandbox mode for development and testing.
     * Production mode when distributing applications through the App Store (or other enterprise distribution mechanisms).

   You must obtain separate certificates for your development and distribution environments. The certificates are associated with an App ID for the app that is the recipient of remote notifications. For production, you can create up to two certificates. IBM Cloud uses the certificates to establish an SSL connection with APNs.


   1. Go to the Apple Developer website, click **Member Center**, and select **Certificates, IDs & Profiles**.
   2. In the **Identifiers** area, click **App IDs**.
   3. From your list of App IDs, select your App ID, then select `Edit`.
   4. Select the  **Push Notifications** check-box, and then on **Development SSL certificate** pane, click **Create Certificate**.

     ![Push Notification SSL certificates](images/solution6/certificate_createssl.png)

   5. When the **About Creating a Certificate Signing Request (CSR) screen** displays, follow the instructions shown to create a Certificate Signing Request (CSR) file. Give a meaningful name that helps you identify whether it is a certificate for development (sandbox) or distribution (production); for example, sandbox-apns-certificate or production-apns-certificate.
   6. Click **Continue** and on the Upload CSR file screen, click **Choose File**, and select the file **CertificateSigningRequest.certSigningRequest** you just created. Click **Continue**.
   7. On the Download, Install and Backup pane, click Download. The **aps_development.cer** file is downloaded.
        ![Download certificate](images/solution6/push_certificate_download.png)

        ![Generate certificate](images/solution6/generate_certificate.png)
   8. On your mac, open **Keychain Access**, **File**, **Import** and select the downloaded .cer file to install it.
   9. Right-click on the new certificate and private key, and then select **Export** and change the **File Format** to Personal information exchange format (`.p12` format).
     ![Export certificate and keys](images/solution6/keychain_export_key.png)
   10. In the **Save As** field, provide the certificate a meaningful name. For example, `sandbox_apns.p12` or **production_apns.p12**, then click Save.
     ![Export certificate and keys](images/solution6/certificate_p12v2.png)
   11. In the **Enter a password** field, enter a password to protect the exported items, then click OK. You can use this password to configure your APNs settings on the Push Notifications service console.
   
       ![Export certificate and keys](images/solution6/export_p12.png)
   12. The **Key Access.app** prompts you to export your key from the **Keychain** screen. Enter your administrative password for your Mac to allow your system to export these items, and then select the `Always Allow` option. A `.p12` certificate is generated on your desktop.

      For Production SSL, On **Production SSL certificate** pane, click **Create Certificate** and repeat Steps 5 to 12 above.
      {:tip}

 ### Creating a development provisioning profile
   The provisioning profile works with the App ID to determine which devices can install and run your app and which services your app can access. For each App ID, you create two provisioning profiles: one for development and the other for distribution. Xcode uses the development provisioning profile to determine which developers are allowed to build the application and which devices are allowed to be tested on the application.

   Ensure that you have registered an App ID, enabled it for Push Notifications service, and configured it to use a development and production APNs SSL certificate.

   Create a development provisioning profile, as follows:

   1. Go to the [Apple Developer](https://developer.apple.com/) portal, click `Member Center`, and select `Certificates, IDs & Profiles`.
   2. Go to the [Mac Developer Library](https://developer.apple.com/library/mac/documentation/IDEs/Conceptual/AppDistributionGuide/MaintainingProfiles/MaintainingProfiles.html#//apple_ref/doc/uid/TP40012582-CH30-SW62site), scroll to the `Creating Development Provisioning Profiles` section, and follow the instructions to create a development profile.
     **Note:** When you configure a development provision profile, select the following options:

     - **iOS App Development**
     - **For iOS and watchOS apps**

 ### Creating a store distribution provisioning profile
   Use the store provisioning profile to submit your app for distribution to the App Store.

   1. Go to the [Apple Developer](https://developer.apple.com/), click `Member Center`, and select `Certificates, IDs & Profiles`.
   2. Double-click the downloaded provisioning profile to install it into Xcode.
     After obtaining the credentials, the next step is to [Configure a service instance](https://console.bluemix.net/docs/services/mobilepush/push_step_2.html).

 ### Configure the service instance

   To use the Push Notifications service to send notifications, upload the .p12 certificates that you had created in the above Step. This certificate contains the private key and SSL certificates that are required to build and publish your application.

   **Note:** After the `.cer` file is in your key chain access, export it to your computer to create a `.p12` certificate.

   1. Click on `Push Notifications` under Services section or Click on the three vertical dots next to the Push Notifications service and select `Open dashboard`.
   2. On the Push Notifications Dashboard, you should see `Configure` option under `Manage > Send Notifications`.
     ![](images/solution6/push_configure.png)

   To set up APNs on the `Push Notification services` console, complete the steps:

   1. Select `Configure` on the Push Notification services Dashboard.
   2. Choose the `Mobile option` to update the information in the APNs Push Credentials form.
   3. Select `Sandbox (development)` or `Production (distribution)` as appropriate and then upload the `p.12` certificate that you have created.
   4. In the Password field, enter the password that is associated with the .p12 certificate file, then click Save.

   ![](images/solution6/Mobile_push_configure.png)

## Configure,send, and monitor push notifications

1. Push initialization code (under `func application`) and notification registration code can be found in `AppDelegate.swift`. Provide an unique USER_ID(Optional).
2. Run the app on a physical device as notifications can't be sent to an iPhone Simulator.
3. Open Push Notifications service under `Mobile Services` > **Existing services**  on IBM Cloud Mobile dashboard and to send basic push notifications, complete the following steps:
  * Select `Send Notifications`, and compose a message by choosing a Send to option. The supported options are Device by Tag, Device Id, User Id, Android devices, iOS devices, Web Notifications, and All Devices.

       **Note:** When you select the All Devices option, all devices subscribed to Push Notifications will receive notifications.
  * In the `Message` field, compose your message. Choose to configure the optional settings as required.
  * Click `Send` and verify that your physical devices has received the notification.
    ![](images/solution6/send_notifications.png)

4. You should see a notification on your iPhone.

   ![](images/solution6/iphone_notification.png)

5. You can monitor your sent notifications by navigating to `Monitoring` on the Push Notifications Service.

The IBM Push Notifications service now extends capabilities to monitor the push performance by generating graphs from your user data. You can use the utility to list all the sent push notifications, or to list all the registered devices and to analyze information on a daily, weekly, or monthly basis.
![](images/solution6/monitoring_messages.png)

## Monitoring the app with Mobile Analytics.
You can record application logs and monitor data with the Mobile Analytics Client SDK. Developers can control when to send this data to the Mobile Analytics Service. When data is delivered to Mobile Analytics, you can use the Mobile Analytics console to get analytics insights about your mobile applications, devices, and application logs.

1. Open the `Mobile Analytics` service from the mobile project you created or click on the three vertical dots next to the service and select `Open Dashboard`.
2. You should see LIVE Users, Sessions and other App Data by disabling `Demo Mode`. You can filter the analytics information by
    * Date.
    * Application.
    * Operating System.
    * Version of the app.
         ![Mobile Analytics](images/solution6/mobile_analytics.png)
3. [Click here](https://console.bluemix.net/docs/services/mobileanalytics/app-monitoring.html#monitoringapps) to set alerts, Monitor App crashes, and Monitor network requests.

## Related Content

[Tag-based notifications](https://console.bluemix.net/docs/services/mobilepush/push_step_4_nf_tag.html#tag_based_notifications)

[Push Notifications REST APIs](https://console.bluemix.net/docs/services/mobilepush/push_restapi.html#push-api-rest)

[Security in Push Notifications](https://console.bluemix.net/docs/services/mobilepush/push_security.html#overview-push)

[Exporting Analytics data to Db2 Warehouse](https://console.bluemix.net/docs/services/mobileanalytics/app-monitoring.html#dashdb)
