---
copyright:
  years: 2017, 2018
lastupdated: "2018-03-09"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}


# Modern web application using MEAN stack

This tutorial walks you through the creation of a web application using the popular MEAN stack. It is composed of a **M**ongo DB, **E**xpress web framework, **A**ngular front end framework and a Node.js runtime.

## Objectives

- Create and run a starter Node.js app locally
- Create a MongoDB database on the IBM cloud
- Deploy the Node.js app to the cloud
- Scale MongoDB Resources
- Monitor application performance

![Architecture diagram](images/solution7/Architecture.png)

## Products

This tutorial uses the following products:
   * [Compose for MongoDB](https://console.bluemix.net/catalog/services/compose-for-mongodb)
   * [SDK for Node.js](https://console.bluemix.net/catalog/starters/sdk-for-nodejs)

## Cost

{: #cost}

This tutorial uses billable components of IBM Cloud Platform, including: 

- SDK for Node.js using Cloud Foundry 
- Compose for MongoDB

Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.  

## Before you begin

{: #prereqs}

1. [Install Git](https://git-scm.com/)
2. [Install Bluemix Command Line Tool](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)


And to develop and run the application locally:
1. [Install Node.js and NPM](https://nodejs.org/)
2. [Install and run MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)

## Apps and Services
- SDK for Node.js Cloud Foundry App
- Compose for MongoDB database


## Run MEAN application locally
In this section, you will run a local MongoDB database, clone a MEAN sample code and start the application which will use the local database.

1. Install and run MongoDB using the instructions [here](https://docs.mongodb.com/manual/administration/install-community/). Confirm your database is running with the following command.
  ```sh
     mongo
  ```
   If this results in a connection error, confirm that your **mongod** server is running.
2. In a terminal window, change to a working directory and run the following command to clone the MEAN sample repository.
  ```sh
     git clone https://github.com/IBM-Cloud/nodejs-MEAN-stack
     cd nodejs-MEAN-stack
  ```
3. Install the required packages.
  ```sh
     npm install
  ```
4. Copy .env.example file to .env. Edit the contents as needed, at a minimum adding your own SESSION_SECRET.
5. Run node server.js to start your app
  ```
     node server.js
  ```
6. Access your application, create a new user and log in

## Create a MongoDB service on the cloud

In this section, we will create a Compose for MongoDB database on the cloud using the command line.
1. Login to the IBM cloud via the command line and target your IBM Cloud account. [More info](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)
  ```sh
     bx login
     bx target --cf
  ```

2. Create the instance of Compose for MongoDB. This can also be done using the [UI](https://console.bluemix.net/catalog/services/compose-for-mongodb?env_id=ibm:yp:us-south). It is important that you call this service **mean-starter-mongodb** as the application is configured to look for this service by this name.

  ```sh
     bx cf create-service compose-for-mongodb Standard mean-starter-mongodb
  ```

## Deploy the Node.js app

Next, you will deploy the node.js application to the cloud. When running in the cloud, the application is configured to look for the "compose-for-mongodb" database service and connect to it.

```sh
   bx cf push
```

The source code contains a **manifest.yml** file which is configured to connect the "mongodb" service to this application. This will allow the application to read the database credentials using the VCAP_SERVICES environment variable.

Once the code been pushed, you should be able to view the app in your dashboard. After deployment, a random host name is generated and will look something like: **https://mean-random-name.mybluemix.net**

![Live App](images/solution7/live-app.png)


## Scaling MongoDB Resources
{: #database}

If your service needs additional storage, or you want to reduce the amount of storage allocated to your service, you can do this by scaling resources.
1. In the application **Dashboard**, go to **Connections** -> **Click on the MongoDB instance**
2. In the **Deployment Details** panel, click **Scale Resources**.
  ![](images/solution7/mongodb-scale-show.png)
3. Adjust the **slider** to raise or lower the storage allocated to the Compose for MongoDB service.
4. Click **Scale Deployment** to trigger the rescaling and return to the dashboard overview. A 'Scaling initiated' message appears at the top of the page to let you know the rescaling is in progress and the Deployment Details pane also shows the scaling in progress.
  ![](images/solution7/scaling-in-progress.png)When the scaling is complete the Deployment Details pane updates to show the current usage and the new value for the available storage.


## Monitor application performance
{: #monitor}

Lets check the health of your application,

1. In the application dashboard, select **Monitoring**
2. Click **View All Tests**
   ![](images/solution7/alert_frequency.png)

Availability Monitoring runs synthetic tests from locations around the world, around the clock to proactively detect and fix performance issues before they impact users.

## Summary

In this tutorial, you deployed a MEAN stack application using Compose for MongoDB to the IBM Cloud. We also covered how to scale the database and monitor the application performance.

You learned how to:

- Create and run a basic Node.js app locally
- Create a Compose for MongoDB database on the IBM Cloud
- Deploy the Node.js app to the IBM Cloud
- Scale MongoDB Resources
- Monitor application performance




## Next steps

Advance to the next tutorial to learn how to:

- [Set up source control and continuous delivery](multi-region-webapp.html#devops)
