---


copyright:
  years: 2017
lastupdated: "2017-09-28"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}


# SQL Database for Cloud Data 

This tutorial shows how to provision a SQL (relational) database service, create a table and load a larger data set into the database. Thereafter, we deploy a web app to make use of that data and show how to access the cloud database. The app is written in Python using the [Flask framework](http://flask.pocoo.org/).

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

3.  Pick the Entry plan. Change the suggested service name if you want. Pick a region (data center) for the deployment of the database and make sure that the correct organization and space are selected.

4.  Click on **Create**.

5.  After a short moment you should get a success notification. You can click it away or wait until you are taken to the Bluemix dashboard.

## Get Started with Db2 Warehouse on Cloud
We create the SQL database service in the form of Db2 Warehouse on Cloud. Let's take a quick tour to familiarize ourselves with the Web UI.

1. In the Bluemix dashboard locate the entry for the Db2 Warehouse on Cloud service.

2. Click on it and you will be taken to service dashboard. From here you can get to documentation ("IBM Knowledge Center") under "Learn" or to the console (Web UI) for Db2 Warehouse on Cloud.

3. Click on **Open**. The console is now loaded.

4. If it is the first time using the console, you are offered to take a tour. Take it. Remember how you can easily take the tour again. It is explained during the tour.

## Create a table
We need a table to hold the sample data. That table can be created as part of the load process or before. If we do it directly, then it is simpler to set up the load process.

1. In the console for Db2 Warehouse on Cloud click **Explore** in the navigation bar. It takes you to a list of existing schemas in the database.

2. Locate the schema beginning with "DASH". Click on it.

3. Now we are creating the new table. Use the **"+ New Table"** for it. It brings up a form for the table name and its columns.

4. Put in "cities" as table name. Copy the column definitions from the file [cityschema.txt](https://github.com/data-henrik/cloud-sql-database/blob/master/cityschema.txt) and paste them into box for the columns and data types.

5. Click on **Create** to define the new table.

## Load data



## Get the web application code

{: #get_code}

This guide uses a simple web application which links to the files (css, images and videos) served by a Content Delivery Network.


blah

## Related Content
* [IBM Knowledge Center for Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers

