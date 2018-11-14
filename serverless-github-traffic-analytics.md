---
copyright:
  years: 2018
lastupdated: "2018-11-13"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Combining serverless and Cloud Foundry for data retrieval and analytics
In this tutorial, you create an application to automatically collect GitHub traffic statistics for repositories and provide the foundation for traffic analytics. GitHub only provides access to the traffic data for the last 14 days. If you want to analyze statistics over a longer period of time, you need to download and store that data yourself. In this tutorial, you deploy a serverless action to retrieve the traffic data and store it in a SQL database. Moreover, a Cloud Foundry app is used to manage repositories and provide access to the statistics for data analytics. The app and the serverless action discussed in this tutorial implement a multi-tenant-ready solution with the initial feature set supporting single-tenant mode.

![](images/solution24-github-traffic-analytics/Architecture.png)

## Objectives

* Deploy a Python database app with multi-tenant support and secured access
* Integrate App ID as OpenID Connect-based authentication provider
* Set up automated, serverless collection of GitHub traffic statistics
* Integrate {{site.data.keyword.dynamdashbemb_short}} for graphical traffic analytics

## Products
This tutorial uses the following products:
   * [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
   * [{{site.data.keyword.dashdblong}}](https://console.bluemix.net/catalog/services/db2-warehouse)
   * [{{site.data.keyword.appid_long}}](https://console.bluemix.net/catalog/services/app-id)
   * [{{site.data.keyword.dynamdashbemb_notm}}](https://console.bluemix.net/catalog/services/ibm-cognos-dashboard-embedded)

## Before you begin
{: #prereqs}

To complete this tutorial, you need the latest version of the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).

## Service and Environment Setup (shell)
In this section, you set up the needed services and prepare the environment. All of this can be accomplished from the shell environment.

1. Clone the [GitHub repository](https://github.com/IBM-Cloud/github-traffic-stats) and navigate into the cloned directory and its **backend** subdirectory:
   ```bash
   git clone https://github.com/IBM-Cloud/github-traffic-stats
   cd github-traffic-stats/backend
   ```
   {:codeblock}

2. Use `ibmcloud login` to log in interactively into {{site.data.keyword.Bluemix_short}}. You can reconfirm the details by running `ibmcloud target` command. You need to have an organization and space set.

3. Create a {{site.data.keyword.dashdbshort}} instance with the **Entry** plan and name it **ghstatsDB**:
   ```
   ibmcloud service create dashDB Entry ghstatsDB
   ```
   {:codeblock}

4. To access the database service from {{site.data.keyword.openwhisk_short}} later on, you need the authorization. Thus, you create service credentials and label them **ghstatskey**:   
   ```
   ibmcloud service key-create ghstatsDB ghstatskey
   ```
   {:codeblock}

5. Create an instance of the {{site.data.keyword.appid_short}} service. Use **ghstatsAppID** as name and the **Graduated tier** plan.
   ```
   ibmcloud resource service-instance-create ghstatsAppID appid graduated-tier us-south
   ```
   {:codeblock}
   Thereafter, create an alias of that new service instance in the Cloud Foundry space. Replace **YOURSPACE** with the space you are deploying to.
   ```
   ibmcloud resource service-alias-create ghstatsAppID --instance-name ghstatsAppID -s YOURSPACE
   ```
  {:codeblock}

6. Create an instance of the {{site.data.keyword.dynamdashbemb_short}} service using the **lite** plan.
   ```
   ibmcloud resource service-instance-create ghstatsDDE dynamic-dashboard-embedded lite us-south
   ```
   {:codeblock}
   Again, create an alias of that new service instance and replace **YOURSPACE**.
   ```
   ibmcloud resource service-alias-create ghstatsDDE --instance-name ghstatsDDE -s YOURSPACE
   ```
  {:codeblock}
7. In the **backend** directory, push the application to the IBM Cloud. The command uses a random route for your application.
   ```bash
   ibmcloud cf push
   ```
   {:codeblock}
   Wait for the deployment to finish. The application files are uploaded, the runtime environment created, and the services bound to the application. The service information is taken from the file `manifest.yml`. You need to update that file, if you used other service names. Once the process finishes successfully, the application URI is displayed.

   The above command uses a random, but unique route for the application. If you want to pick one yourself, add it as additional parameter to the command, e.g., `ibmcloud cf push your-app-name`. You could also edit the file `manifest.yml`, change the **name** and change **random-route** from **true** to **false**.
   {:tip}

## App ID and GitHub configuration (browser)
The following steps are all performed using your Internet browser. First, you configure {{site.data.keyword.appid_short}} to use the Cloud Directory and to work with the Python app. Thereafter, you create a GitHub access token. It is needed for the deployed function to retrieve the traffic data.

1. In the [{{site.data.keyword.Bluemix_short}} dashboard](https://console.bluemix.net) open the overview of your services. Locate the instance of the {{site.data.keyword.appid_short}} service in the **Services** section. Click on its entry to open the details.
2. In the service dashboard, click on **Manage** under **Identity Providers** in the menu on the left side. It brings a list of the available identity providers, such as Facebook, Google, SAML 2.0 Federation and the Cloud Directory. Switch the Cloud Directory to **On**, all other providers to **Off**.
3. At the bottom of that page is the list of redirect URLs. Enter the **url** of your application + /redirect_uri. For example `https://github-traffic-stats-random-word.mybluemix.net/redirect_uri`.

   For testing the app locally, the redirect URL is `http://0.0.0.0:5000/redirect_uri`. You can configure multiple redirect URLs.
   {:tip}

   ![](images/solution24-github-traffic-analytics/ManageIdentityProviders.png)
4. In the menu on the left, click on **Users**. It opens the list of users in the Cloud Directory. Click on the **Add User** button to add yourself as the first user. You are now done configuring the {{site.data.keyword.appid_short}} service.
5. In the browser, visit [Github.com](https://github.com/settings/tokens) and go to **Settings -> Developer settings -> Personal access tokens**. Click on the button **Generate new token**. Enter **GHStats Tutorial** for the **Token description**. Thereafter, enable **public_repo** under the **repo** category and **read:org** under **admin:org**. Now, at the bottom of that page, click on **Generate token**. The new access token is displayed on the next page. You need it during the following application setup.
   ![](images/solution24-github-traffic-analytics/GithubAccessToken.png)


## Configure and test Python app
After the preparation, you configure and test the app. The app is written in Python using the popular [Flask](http://flask.pocoo.org/) microframework. Repositories can be added to and removed from statistics collection. The traffic data can be accessed in a tabular view.

1. In a browser, open the URI of the deployed app. You should see a welcome page.
   ![](images/solution24-github-traffic-analytics/WelcomeScreen.png)

2. In the browser, add `/admin/initialize-app` to the URI and access the page. It is used to initialize the application and its data. Click on the button **Start initialization**. This will take you to a password-protected configuration page. The email address you log in with is taken as identification for the system administrator. Use the email address and password that you configured earlier.

3. In the configuration page, enter a name (it is used for greetings), your GitHub user name and the access token that you generated before. Click on **Initialize**. This creates the database tables and inserts some configuration values. Finally, it creates database records for the system administrator and a tenant.
   ![](images/solution24-github-traffic-analytics/InitializeApp.png)

4. Once done, you are taken to the list of managed repositories. You can now add repositories by providing the name of the GitHub account or organization and the name of the repository. After entering the data, click on **Add repository**. The repository, along with a newly assigned identifier, should appear in the table. You can remove repositories from the system by entering their ID and clicking **Delete repository**.
![](images/solution24-github-traffic-analytics/RepositoryList.png)

## Deploy Cloud Function and Trigger
With the management app in place, deploy an action, a trigger and a rule to connect the two in for {{site.data.keyword.openwhisk_short}}. These objects are used to automatically collect the GitHub traffic data on the specified schedule. The action connects to the database, iterates over all tenants and their repositories and obtains the view and cloning data for each repository. Those statistics are merged into the database.

1. Change into the **functions** directory.
   ```bash
   cd ../functions
   ```
   {:codeblock}   
2. Create a new action **collectStats**. It uses a [Python 3 environment](https://console.bluemix.net/docs/openwhisk/openwhisk_reference.html#openwhisk_ref_python_environments) which already includes the required database driver. The source code for the action is provided in the file `ghstats.zip`.
   ```bash
   ibmcloud fn action create collectStats --kind python-jessie:3 ghstats.zip
   ```
   {:codeblock}   

   If you modify the source code for the action (`__main__.py`), then you can repackage the zip archive with `zip -r ghstats.zip  __main__.py github.py` again. See the file `setup.sh` for details.
   {:tip}
3. Bind the action to the database service. Use the instance and the service key that you created during the environment setup.
   ```bash
   ibmcloud fn service bind dashDB collectStats --instance ghstatsDB --keyname ghstatskey
   ```
   {:codeblock}   
4. Create a trigger based on the [alarms package](https://console.bluemix.net/docs/openwhisk/openwhisk_alarms.html#openwhisk_catalog_alarm). It supports different forms of specifying the alarm. Use the [cron](https://en.wikipedia.org/wiki/Cron)-like style. Starting April 21st and ending December 21st, the trigger fires daily at 6am UTC. Make sure to have a future start date.
   ```bash
   ibmcloud fn trigger create myDaily --feed /whisk.system/alarms/alarm \
              --param cron "0 6 * * *" --param startDate "2018-04-21T00:00:00.000Z"\
              --param stopDate "2018-12-31T00:00:00.000Z"
   ```
  {:codeblock}   

  You can change the trigger from a daily to a weekly schedule by applying `"0 6 * * 0"`. This would fire every Sunday at 6am.
  {:tip}
5. Finally, you create a rule **myStatsRule** that connects the trigger **myDaily** to the **collectStats** action. Now, the trigger causes the action to be executed on the schedule specified in the previous step.
   ```bash
   ibmcloud fn rule create myStatsRule myDaily collectStats
   ```
   {:codeblock}   
6. Invoke the action for an initial test run. The returned **repoCount** should reflect the number of repositories that you configured earlier.
   ```bash
   ibmcloud fn action invoke collectStats  -r
   ```
   {:codeblock}   
   The output will look like this:
   ```
   {
       "repoCount": 18
   }
   ```
7. In your browser window with the app page, you can now visit the repository traffic. By default, 10 entries are displayed. You can change it to different values. It is also possible to sort the table columns or use the search box to filter for specific repositories. You could enter a date and an organization name and then sort by viewcount to list the top scorers for a particular day.
   ![](images/solution24-github-traffic-analytics/RepositoryTraffic.png)

## Conclusions
In this tutorial, you deployed a serverless action and a related trigger and rule. They allow to automatically retrieve traffic data for GitHub repositories. Information about those repositories, including the tenant-specific access token, is stored in a SQL database ({{site.data.keyword.dashdbshort}}). That database is used by the Cloud Foundry app to manage users, repositories and to present the traffic statistics in the app portal. Users can see the traffic statistics in searchable tables or visualized in an embedded dashboard ({{site.data.keyword.dynamdashbemb_short}} service, see image below). It is also possible to download the list of repositories and the traffic data as CSV files.

The Cloud Foundry app manages access through an OpenID Connect client connecting to {{site.data.keyword.appid_short}}.
![](images/solution24-github-traffic-analytics/EmbeddedDashboard.png)

## Cleanup
To clean up the resources used for this tutorial, you can delete the related services and app as well as the action, trigger and rule in the reverse order as created:

1. Delete the {{site.data.keyword.openwhisk_short}} rule, trigger and action.
   ```bash
   ibmcloud fn rule delete myStatsRule
   ibmcloud fn trigger delete myDaily
   ibmcloud fn action delete collectStats
   ```
   {:codeblock}   
2. Delete the Python app and its services.
   ```bash
   ibmcloud resource service-instance-delete ghstatsAppID
   ibmcloud resource service-instance-delete ghstatsDDE
   ibmcloud service delete ghstatsDB
   ibmcloud cf delete github-traffic-stats
   ```
   {:codeblock}   


## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
* Expand the app for multi-tenant support.
* Integrate a chart for the data.
* Use social identity providers.
* Add a date picker to the statistics page to filter displayed data.
* Use a custom login page for {{site.data.keyword.appid_short}}.
* Explore the social coding relationships between developers using [{{site.data.keyword.DRA_short}}](https://console.bluemix.net/catalog/services/devops-insights).

# Related Content
Here are links to additional information on the topics covered in this tutorial.

Documentation and SDKs:
* [{{site.data.keyword.openwhisk_short}} documentation](https://console.bluemix.net/docs/openwhisk/openwhisk_about.html#about-cloud-functions)
* Documentation: [IBM Knowledge Center for {{site.data.keyword.dashdbshort}}](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [{{site.data.keyword.appid_short}} documentation](https://console.bluemix.net/docs/services/appid/index.html#gettingstarted)
* [Python runtime on IBM Cloud](https://console.bluemix.net/docs/runtimes/python/index.html#python_runtime)
