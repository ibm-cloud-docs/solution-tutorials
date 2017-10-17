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

1. Go to [GeoNames](http://www.geonames.org/) and download and extract the file [cities1000.zip](http://download.geonames.org/export/dump/cities1000.zip). It holds information about cities with a population of more than 1000. We are going to use it as data set.

2. 

## Provision the SQL Database
Start by creating an instance of the **Db2 Warehouse on Cloud** service.

1.  Click on **Catalog** in the top navigation bar.

2.  Click on **Data & Analytics** under Platform on the left pane and select **Db2 Warehouse on Cloud**.

3.  Change the suggested service name if you want. Pick a region (data center) for the deployment of the database and make sure that the correct organization and space are selected.

4.  Click on **Create**.

5.  After a short moment you should get a success notification. You can click it away or wait until you are taken to the Bluemix dashboard.

## Get Started with Db2 Warehouse on Cloud


## Get the web application code

{: #get_code}

This guide uses a simple web application which links to the files (css, images and videos) served by a Content Delivery Network.

To start with, retrieve the application code:

   ```sh
   git clone https://github.ibm.com/frederic-lavigne/webapp-with-cos-and-cdn
   ```

## Provision database
{: #create_cos}

blah

## Load data

{: #configure_permissions}

blah

## Related Content
* [IBM Knowledge Center for Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers

