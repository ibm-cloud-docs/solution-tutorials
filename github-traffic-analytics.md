---
copyright:
  years: 2018
lastupdated: "2018-04-03"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Github Traffic Analytics

Overall flow:
- Describe scenario
- setup database to hold statistics and for multi-tenant user management
- add App ID, add initial admin user
- deploy Python app
- add repo database
- setup Cloud Functions to collect database
- add DDE as analytics dashboarding to app

Do we have to distinguish between local and cloud? Focus on cloud!

![](images/solution24-github-traffic-analytics/Architecture.png)

## Objectives

* Deploy Python database app with multi-tenant support
* Integrate App ID as openID Connect-based authentication provider
* Set up automated, serverless collection of Github traffic statistics
* Integrate Dynamic Dashboard Embedded for graphical traffic analytics

## Products

This tutorial uses the following products:
   * [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
   * [{{site.data.keyword.dashdblong}}](https://console.bluemix.net/catalog/services/db2-warehouse)
   * [{{site.data.keyword.appid_long}}](https://console.bluemix.net/catalog/services/app-id)
   * [{{site.data.keyword.dynamdashbemb_notm}}](https://console.bluemix.net/catalog/services/dynamic-dashboard-embedded)
   * Cloud Foundry Python runtime

## Before you begin
{: #prereqs}

To complete this tutorial, you need the latest version of the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).

## Service and Environment Setup
In this section, we are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Clone the [Github repository](https://github.com/IBM-Cloud/github-traffic-stats) and navigate into the cloned directory and its **backend** subdirectory:

   ```bash
   git clone https://github.com/IBM-Cloud/github-traffic-stats
   cd github-traffic-stats/backend
   ```
   {:codeblock}

2. Use `bx login` to log in interactively into . You can reconfirm the details by running `bx target` command.

3. Create a {{site.data.keyword.dashdbshort}} instance with the **Entry** plan and name it **ghstatsDB**:

   ```
   bx service create dashDB Entry ghstatsDB
   ```
   {:codeblock}
   You can also use another than the **Entry** plan.

4. To access the database service from {{site.data.keyword.openwhisk_short}} later on, we need the authorization. Thus, we create service credentials and label them **ghstatskey**:   
   ```
   bx service key-create ghstatsDB ghstatskey
   ```
   {:codeblock}

5. Create an instance of the {{site.data.keyword.appid_short}} service. We use **ghstatsAppID** as name. Use the offered **Graduated tier** plan.
   ```
   bx service create appID "Graduated tier" ghstatsAppID
   ```
   {:codeblock}
   TODO: May need service key
6. Create an instance of the {{site.data.keyword.dynamdashbemb_short}} service using the **lite** plan.
   ```
   bx service create dynamic-dashboard-embedded lite ghstatsDDE
   ```
   {:codeblock}
   TODO: May need service key

7. Later on, we are collecting traffic statistics for Github repositories. This can be done for repositories which you have **push** privileges for. In order to access your Github account from the program code, we need a **Github access token**. In a browser, visit [Github.com](https://github.com/settings/tokens) and go to **Settings -> Developer settings -> Personal access tokens**. Click on the button **Generate new token**. Enter **GHStats Tutorial** for the **Token description**. Thereafter, enable **public_repo** under the **repo** category and **read:org** under **admin:org**. Now, at the bottom of that page, click on **Generate token**. The new access token is displayed on the next page. You will need it during the following application setup.
   ![](images/solution24-github-traffic-analytics/GithubAccessToken.png)

## Configure App ID
Describe how to configure the App ID service to use the Cloud Directory or social logins. We need to add the redirect URI, too.

## Deploy and configure Python app
After the preparation, we now deploy the management app to the IBM Cloud. The app is written in Python using the popular [Flask](http://flask.pocoo.org/) microframework. Using the application, repositories can be added to and removed from statistics collection. The traffic data can be accessed in a tabular view.

1. In the **backend** directory, push the application to the IBM Cloud. The command uses a random application name.
   ```bash
   bx cf push
   ```
   {:codeblock}
   Wait for the deployment to finish. Once the process finishes successfully, the application URI is displayed.

   The above command uses a random, but unique application name. If you want to pick one yourself, add it as additional parameter to the command: `bx cf push your-app-name`.
   {:tip}

2. In a browser, open the URI of the deployed app. You should see a welcome page.
   ![](images/solution24-github-traffic-analytics/WelcomeScreen.png)
   TODO: REPLACE once finalized

3. In the browser, add `/admin/initialize-app` to the URI and access the page. It is used to initialize the application and its data. Click on the button **Start initialization**. This will take you to a password-protected configuration page. The email address you log in with is taken as identification for the system administrator.

4. In the configuration page, enter a name (it is used for greetings), your Github user name and the access token that you generated before. Click on **Initialize**. This creates the database tables and inserts some configuration values. Finally, it creates database records for the system administrator and a tenant.
   ![](images/solution24-github-traffic-analytics/InitializeApp.png)
   TODO: REPLACE once finalized

5. Once done, you are taken to the list of managed repositories. You can now add repositories by providing the name of the Github account or organization and the name of the repository. After entering the data, click on **Add repository**. The repository, along with a newly assigned identifier, should appear in the table. You can remove repositories from the system by entering their ID and clicking **Delete repository**.

## Deploy Cloud Function and Trigger

Do each step on the command line and explain, don't use the script.

1. Next, we are going to register actions for {{site.data.keyword.openwhisk_short}} and bind service credentials to those actions.

   One of the actions gets invoked to create a table in {{site.data.keyword.dashdbshort}}. By using an action of {{site.data.keyword.openwhisk_short}}, we neither need a local Db2 driver nor have to use the browser-based interface to manually create the table. To perform the registration and setup, run the line below and this will execute the **setup.sh** file which contains all the actions.

   ```bash
   sh setup.sh
   ```
   {:codeblock}   




## Cleanup

## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
1. Expand multi-tenant support
2. Add support for Github Enterprise
3.
4.

# Related Content
Here are links to additional information on the topics covered in this tutorial.

Blogs:
*
*

Documentation and SDKs:
* [{{site.data.keyword.openwhisk_short}} documentation](https://console.bluemix.net/docs/openwhisk/openwhisk_about.html#about-cloud-functions)
* Documentation: [IBM Knowledge Center for {{site.data.keyword.dashdbshort}}](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
*
