---
copyright:
  years: 2017, 2018
lastupdated: "2018-11-14"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# SQL Database for Cloud data

This tutorial shows how to provision a SQL (relational) database service, create a table, and load a large data set (city information) into the database. Then, you deploy a web app "worldcities" to make use of that data and show how to access the cloud database. The app is written in Python using the [Flask framework](http://flask.pocoo.org/).

![](images/solution5/Architecture.png)

## Objectives

* Provision a SQL database
* Create the database schema (table)
* Load data
* Connect the app and database service (share credentials)
* Monitoring, Security, Backups & Recovery

## Products

This tutorial uses the following products:
   * [{{site.data.keyword.dashdblong_notm}}](https://console.bluemix.net/catalog/services/db2-warehouse-on-cloud)

## Before you begin
{: #prereqs}

Go to [GeoNames](http://www.geonames.org/) and download and extract the file [cities1000.zip](http://download.geonames.org/export/dump/cities1000.zip). It holds information about cities with a population of more than 1000. You are going to use it as data set.

## Provision the SQL Database
Start by creating an instance of the **[{{site.data.keyword.dashdbshort_notm}}](https://console.bluemix.net/catalog/services/db2-warehouse-on-cloud)** service.

![](images/solution5/Catalog.png)

1. Visit the [{{site.data.keyword.Bluemix_short}} dashboard](https://console.bluemix.net). Click on **Catalog** in the top navigation bar.
2. Click on **Data & Analytics** under Platform on the left pane and select **{{site.data.keyword.dashdbshort_notm}}**.
3. Pick the **Entry** plan and change the suggested service name to "sqldatabase" (you will use that name later on). Pick a location for the deployment of the database and make sure that the correct organization and space are selected.
4. Click on **Create**. After a short moment you should get a success notification.
5. In the **Dashboard**, click on the entry for your newly created {{site.data.keyword.dashdbshort_notm}} service.
6. Click on **Open** to launch the database console. If it is the first time using the console, you are offered to take a tour.

## Create a table
You need a table to hold the sample data. Create it using the console.

1. In the console for {{site.data.keyword.dashdbshort_notm}} click **Explore** in the navigation bar. It takes you to a list of existing schemas in the database.
2. Locate and click on the schema beginning with "DASH".
3. Click on **"+ New Table"** to bring up a form for the table name and its columns.
4. Put in "cities" as table name. Copy the column definitions from the file [cityschema.txt](https://github.com/IBM-Cloud/cloud-sql-database/blob/master/cityschema.txt) and paste them into box for the columns and data types.
5. Click on **Create** to define the new table.   
   ![](images/solution5/TableCitiesCreated.png)

## Load data
Now that the table "cities" has been created, you are going to load data into it. This can be done in different ways, e.g. from your local machine or from cloud object storage (COS) with Swift or Amazon S3 interface, by utilizing the [{{site.data.keyword.dwl_full}}](https://console.bluemix.net/catalog/services/lift) migration service. For this tutorial, you are going to upload data from your machine. During that process, you adapt the table structure and data format to fully match the file content.

1. In the top navigation click on **Load**. Then, under **File selection**, click on **browse files** to locate and pick the file "cities1000.txt" you downloaded in the first section of this guide.
2. Click **Next** to get to the schema overview. Choose the schema starting with "DASH" again, then the table "CITIES". Click on **Next** again.   

   Because the table is empty it does not make a difference to either append to or overwrite existing data.
   {:tip }
3. Now customize how the data from the file "cities1000.txt" is interpreted during the load process. First, disable "Header in first row" because the file contains data only. Next, type in "0x09" as separator. It means that values within the file are delimited by tab(ulator). Last, pick "YYYY-MM-DD" as date format. Now, everything should look like in this screenshot.    
  ![](images/solution5/LoadTabSeparator.png)
4. Click **Next** and you are offered to review the load settings. Agree and click **Begin Load** to start loading the data into the "CITIES" table. The progress is displayed. Once the data is uploaded it should only take few seconds until the load is finished and some statistics are presented.   
   ![](images/solution5/LoadProgressSteps.png)

## Verify Loaded Data Using SQL
The data has been loaded into the relational database. There were no errors, but you should run some quick tests anyway. Use the built-in SQL editor to type in and execute some SQL statements.

1. In the top navigation click on **Run SQL**.
   Instead of the built-in SQL editor you can use cloud-based and traditional SQL tools on your desktop or server machine with {{site.data.keyword.dashdbshort_notm}}. The connection information can be found in the settings menu. Some tools are even offered for download in the "Downloads" section in the menu offered behind the "book" icon (standing for documentation and help).
    {:tip }
2. In the "SQL Editor" type or copy in the following query:   
   ```bash
   select count(*) from cities
   ```
   {:codeblock}
   then press the **Run All** button. In the results section the same number of rows as reported by the load process should be shown.   
3. In the "SQL Editor" enter the following statement on a new line:
   ```
   select countrycode, count(name) from cities
   group by countrycode
   order by 2 desc
   ```
   {:codeblock}   
4. In the editor select the text of the above statement. Click the **Run Selected** button. Only this statement should be executed now, returning some by country statistics in the results section.

## Deploy the application code
The ready-to-run [code for the database app is located in this Github repository](https://github.com/IBM-Cloud/cloud-sql-database). Clone or download the repository, then push it to the IBM Cloud.

1. Clone the Github repository:
   ```bash
   git clone https://github.com/IBM-Cloud/cloud-sql-database
   cd cloud-sql-database
   ```
2. Push the application to the IBM Cloud. You need to be logged in to the location, org and space to which the database has been provisioned. Copy and paste these commands one line at a time.
   ```bash
   ibmcloud login
   ibmcloud target --cf
   ibmcloud cf push your-app-name
   ```
3. Once the push process is finished you should be able to access the app. No further configuration is needed. The file `manifest.yml` tells the IBM Cloud to bind the app and the database service named "sqldatabase" together.

## Security, Backup & Recovery, Monitoring
The {{site.data.keyword.dashdbshort_notm}} is a managed service. IBM takes care of securing the environment, daily backups and system monitoring. In the entry plan the database environment is a multi-tenant setup with reduced administration and configured options for users. However, if you are using one of the enterprise plans there are [several options to manage users, to configure additional database security](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.security.doc/doc/security.html), and to [monitor the database](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.admin.mon.doc/doc/c0001138.html).   

In addition to the traditional administration options the [{{site.data.keyword.dashdbshort_notm}} service also offers a REST API for monitoring, user management, utilities, load, storage access and more](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/connecting/connect_api.html). The executable Swagger interface of that API can be accessed in the menu behind the "book" icon under "Rest APIs". Some tools that can be used for monitoring and more, e.g., the IBM Data Server Manager, can even be downloaded under the "Downloads" section in that same menu.

## Test the App
The app to display city information based on the loaded data set is reduced to a minimum. It offers a search form to specify a city name and few preconfigured cities. They are translated to either `/search?name=cityname` (search form) or `/city/cityname` (directly specified cities). Both requests are served from the same lines of code in the background. The cityname is passed as value to a prepared SQL statement using a parameter marker for security reasons. The rows are fetched from the database and passed to an HTML template for rendering.

## Cleanup
To clean up resources used by the tutorial, follow these steps:
1. Visit the [{{site.data.keyword.Bluemix_short}} dashboard](https://console.bluemix.net). Locate your app.
2. Click on the menu icon for the app and choose **Delete App**. In the dialog window tick the checkmark that you want to delete the related {{site.data.keyword.dashdbshort_notm}} service.
3. Click the **Delete** button. The app and database service are removed and you are taken back to the dashboard.

## Expand the tutorial
Want to extend this app? Here are some ideas:
1. Offer a wildcard search on the alternate names.
2. Search for cities of a specific country and within a certain population values only.
3. Change the page layout by replacing the CSS styles and extending the templates.
4. Allow form-based creation of new city information or allow updates to existing data, e.g. population.

## Related Content
* Documentation: [IBM Knowledge Center for {{site.data.keyword.dashdbshort_notm}}](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Frequently asked questions about {{site.data.keyword.Db2_on_Cloud_long_notm}} and {{site.data.keyword.dashdblong_notm}}](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/managed_service.html) answering questions related to managed service, data backup, data encryption and security, and much more.
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers
* Documentation: [API Description of ibm_db Python driver](https://github.com/ibmdb/python-ibmdb/wiki/APIs)
* [IBM Data Server Manager](https://www.ibm.com/us-en/marketplace/data-server-manager)
