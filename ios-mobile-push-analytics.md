# iOS Mobile Application with Push and Analytics

Learn how easy it is to quickly create an iOS Swift application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud. 

This solution walks you through the creation of a mobile starter application, adding mobile services, setting up client SDKs, Importing the code to Xcode and then further enhance the application.

## Objectives

* Create a mobile project from Basic Swift starter kit.

* Add Push Notifications and Mobile Analytics services.

* Obtain APNs (notification provider) credentials.

* Download the code and setup client SDKs.

* Instrumenting the app to use Mobile Analytics.

* Send and monitor push notifications.

* Monitoring the app with Mobile Analytics.


## Before you begin
{: #prereqs}

[Apple Developers](https://developer.apple.com/) account to send remote notifications from Push Notifications service instance on Bluemix (the provider) to iOS devices and applications. 


## Create a mobile project from basic Swift starter kit.

{: #get_code}

1.  Navigate to [Mobile Dashboard](https://console.bluemix.net/developer/mobile/dashboard) to create your `Project` from pre-defined `Starter Kits`.
2. Click on `Starter Kits` and scroll down to select `Basic` Starter Kit.

    ![](images/solution6/mobile_dashboard.png)

3. Enter a project name which will also be the project and app name.
4. Select `Swift` as your language.

    ![](images/solution6/create_new_project.png)
5. Click on `Create Project` to scaffold a iOS Swift App.
6. A new `Project` will be created under Projects tab on the left pane.

In the next step, you will add mobile services like Push notifications and Mobile Analytics to accelerate your app.


## Add Push Notifications and Mobile Analytics services.
{: #create_cos}

1. Click on `Add Service` and select Mobile to accelerate your app with Mobile services. Click Next to see the available services.
2. Select `Push Notifications` and Click Next.
3. Select Lite plan and Click `Create` to provision a Push Notifications service. To understand the pricing, Click on `pricing details`.
4. Now, you should see Push Notifications service added to your project and also the Credentials.
5. To add Mobile Analytics service, click on Add Service and Select Basic plan.Once you click `Create`, you should see both the Mobile services with credentials.

![](images/solution6/mobile_services.png)
## Obtain APNs (notification provider) credentials.

For iOS devices and applications, Apple Push Notification Service (APNs) allows application developers to send remote notifications from Push Notifications service instance on Bluemix (the provider) to iOS devices and applications. Messages are sent to a target application on the device.

You need to obtain and configure your APNs credentials. The APNs certificates are securely managed by Push Notifications service and used to connect to APNs server as a provider.


## Related Content


