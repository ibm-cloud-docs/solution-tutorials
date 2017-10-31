---
copyright:
  years: 2017
lastupdated: "2017-10-27"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Android Mobile Application with Push and Analytics

Learn how easy it is to quickly create an Android native application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.

This solution walks you through the creation of a mobile starter application, adding mobile services, setting up client SDKs, Importing the code to Android Studio and then further enhance the application.

## Objectives

* Create a mobile project from Basic Android native starter kit.
* Add Push Notifications and Mobile Analytics services.
* Obtain FCM credentials and configure Push Notifications service instance.
* Download the code and setup client SDKs.
* Instrumenting the app to use Mobile Analytics.
* Send and monitor push notifications.
* Monitoring the app with Mobile Analytics.

  ![](images/solution6/ios_arch.png)

## Before you begin
{: #prereqs}

- Android Studio for importing and enhancing your code.

## Create a mobile project from basic starter kit.

{: #get_code}

1. Navigate to [Mobile Dashboard](https://console.bluemix.net/developer/mobile/dashboard) to create your `Project` from pre-defined `Starter Kits`.
2. Click on `Starter Kits` and scroll down to select `Basic` Starter Kit.
    ![](images/solution6/mobile_dashboard.png)
3. Enter a project name which will also be your app name.
4. Select `Android` as your language.
    ![](images/solution6/create_new_project.png)
5. Click on `Create Project` to scaffold an Android native App.
6. A new `Project` will be created under Projects tab on the left pane.

In the next step, you will add mobile services like Push notifications and Mobile Analytics to accelerate your app.

## Add Push Notifications and Mobile Analytics services.
{: #create_cos}

**Note:** Push Notifications and Mobile Analytics Services should be added with the Basic Starter. If not, Please follow the below steps.
Also, Following the below steps you can add other value-add services.

1. Click on `Add Service` and select Mobile to accelerate your app with Mobile services. Click Next to see the available services.
2. Select `Push Notifications` and Click Next.
3. Select Lite plan and Click `Create` to provision a Push Notifications service. To understand the pricing, Click on `pricing details`.
4. Now, you should see Push Notifications service added to your project and also the Credentials.
5. To add Mobile Analytics service, click on `Add Service` and Select Basic plan.Once you click `Create`, you should see both the Mobile services with credentials.
