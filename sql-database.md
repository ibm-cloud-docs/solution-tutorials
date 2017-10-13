# SQL Database for Cloud Data 

To build a new cloud app I need to store relational data. I need to select a SQL database, set it up, load data, bind it to my app. The database needs to have some security and I need to monitor it once the app is in production.

## Objectives

* Pick an SQL database service
* Create SQL database
* Create the schema
* Load initial data
* Connect the app to the database (share credentials)
* Secure the SQL database
* Monitoring
* (Discuss) Backups & Recovery



## Before you begin
{: #prereqs}

1. > ​

2. ​

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

