# SQL Database for Cloud Data 

This tutorial shows how to provision a SQL (relational) database service, create a table and load a larger data set, city informationy into the database. Thereafter, we deploy a web app "worldcities" to make use of that data and show how to access the cloud database. The app is written in Python using the [Flask framework](http://flask.pocoo.org/).

## Objectives

* Pick an SQL database service
* Create SQL database
* Create the database schema (table)
* Load data
* Connect the app and database service (share credentials)
* Monitoring, Backups & Recovery, Security

## Before you begin
{: #prereqs}

Go to [GeoNames](http://www.geonames.org/) and download and extract the file [cities1000.zip](http://download.geonames.org/export/dump/cities1000.zip). It holds information about cities with a population of more than 1000. We are going to use it as data set. 

## Provision the SQL Database
Start by creating an instance of the **Db2 Warehouse on Cloud** service.

1.  Click on **Catalog** in the top navigation bar.
2.  Click on **Data & Analytics** under Platform on the left pane and select **Db2 Warehouse on Cloud**.
3.  Pick the Entry plan. Change the suggested service name to "sqldatabase" (we will use that name later on). Pick a region (data center) for the deployment of the database and make sure that the correct organization and space are selected.
4.  Click on **Create**.
5.  After a short moment you should get a success notification. You can click it away or wait until you are taken to the dashboard.

## Get Started with Db2 Warehouse on Cloud
We create the SQL database service in the form of Db2 Warehouse on Cloud. Let's take a quick tour to familiarize ourselves with the Web UI.

1. In the dashboard locate the entry for the Db2 Warehouse on Cloud service.
2. Click on it and you will be taken to service dashboard. From here you can get to documentation ("IBM Knowledge Center") under "Learn" or to the console (Web UI) for Db2 Warehouse on Cloud.
3. Click on **Open**. The console is now loaded.
4. If it is the first time using the console, you are offered to take a tour. Take it. Remember how you can easily take the tour again. It is explained during the tour.

## Create a table
We need a table to hold the sample data. That table can be created as part of the load process or before. If we do it directly, then it is simpler to set up the load process.

1. In the console for Db2 Warehouse on Cloud click **Explore** in the navigation bar. It takes you to a list of existing schemas in the database.
2. Locate the schema beginning with "DASH". Click on it.
3. Now we are creating the new table. Use the **"+ New Table"** for it. It brings up a form for the table name and its columns.
4. Put in "cities" as table name. Copy the column definitions from the file [cityschema.txt](https://github.com/data-henrik/cloud-sql-database/blob/master/cityschema.txt) and paste them into box for the columns and data types.
5. Click on **Create** to define the new table.    ![](images/solution5/TableCitiesCreated.png)

## Load data
Now that the table "cities" has been created, we are going to load data into it.

1. In the top navigation click on **Load**. This brings up the load dialog where you have a choice of loading data from your local machine, from cloud object storage (COS) with Swift interface (IBM Cloud / Softlayer) or from Amazon S3. You can also utilize the [Lift](https://console.bluemix.net/catalog/services/lift) migration service to transfer data from existing data sources. And if that's not enough you could [send in disk drives](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/learn_how/load_mail_in_drive.html) to quickly upload large amounts of data. For our case, uploading from the local machine will do.
2. In the "File selection" either use "browse files" to locate and pick the file "cities1000.txt" (see above) or drag it into that landing area.
3. Click **Next** to get to the schema overview. Choose the schema starting with "DASH" again, then the table "CITIES". Because the table is empty it does not make a difference to either append to or overwrite existing data. Click on **Next** again.
4. The dialog shown then is used to customize how the data from the file "cities1000.txt" is interpreted during the load process. First, disable "Header in first row" because the file contains data only. Next, type in "0x09" as separator. It means that values within the file are delimited by tab(ulator). Last, pick "YYYY-MM-DD" as date format. Now, everything should look like in this screenshot.    ![](images/solution5/LoadTabSeparator.png)
5. Click **Next** and you are offered to review the load settings. If you agree, click **Begin Load** to start loading the data into the "CITIES" table. The progress is displayed. Once the data is uploaded it should only take few seconds until the load is finished and some statistics are presented.    ![](images/solution5/LoadProgressSteps.png)

## Verify Loaded Data Using SQL
The data has been loaded into our relational database. There were no errors, but we want to run some quick tests anyway.

1. In the top navigation click on **Run SQL**. This brings up a bare bones tool to edit and run SQL statements. Remember that you can connect cloud-based and traditional SQL tools on your desktop or server machine to the Db2 Warehouse on Cloud. The connection information can be found in the settings menu. Some tools are even offered for download in the "Downloads" section in the menu offered behind the "book" icon (standing for documentation and help).
2. In the "SQL Editor" type or copy in `select count(*) from cities`, then press the **Run All** button. In the results section the same number of rows as reported by the load process should be shown.
3. In the "SQL Editor" enter the following statement on a new line:
```
select countrycode, count(name) from cities 
group by countrycode
order by 2 desc
```
4. In the editor select the text of the above statement. Click the **Run Selected** button. Only this statement should be executed now, returning some by country statistics in the results section.

## Deploy the application code
The ready-to-run [code for the database app is located in this Github repository](https://github.com/data-henrik/cloud-sql-database). Clone or download the repository, then push it to the IBM Cloud.

1. Clone the Github repository:
   ```bash
   git clone https://github.com/data-henrik/cloud-sql-database
   cd cloud-sql-database
   ```

2. Push the application to the IBM Cloud. You need to be logged in to the region, org and space to which the database has been provisioned.
   ```
   cf push your-app-name
   ```

## Test the app


## Security, Backup & Recovery, Monitoring
tbd

## Related Content
* [IBM Knowledge Center for Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Frequently asked questions about IBM Db2 on Cloud and IBM Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/managed_service.html) answering questions related to managed service, data backup, data encryption and security, and much more.
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers

