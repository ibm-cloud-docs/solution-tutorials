# Modern Web Application using MEAN stack 

This solution walks you through the creation of a web application using the popular MEAN stack. It is composed of a **M**ongo DB, **E**xpress web framework, **A**ngular front end framework and a Node.js runtime. 

## Objectives

- Create and run a starter Node.js app locally

- Create a Compose for MongoDB database on Bluemix 

- Deploy the Node.js app to Bluemix

- Manage the app on Bluemix 

- Manage the MongoDB database 

  ​

## Before you begin

{: #prereqs}

1. [Install Git](https://git-scm.com/)

2. [Install Node.js and NPM](https://nodejs.org/)

3. [Install and run MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)

4. [Install Cloud Foundry Command Line Tool](https://github.com/cloudfoundry/cli)

   ​

## Apps and Services 
- SDK for Node.js Cloud Foundry App
- Continuous Delivery Service for DevOps
- Compose for MongoDB database




## Create and run a starter Node.js app locally

{: #get_code}

This guide uses a sample MEAN stack ([MongoDB](https://www.mongodb.org/), [Express](http://expressjs.com/), [AngularJS](https://angularjs.org/) and [Node.js](https://nodejs.org/)) application. 



## Test local MongoDB

Open the terminal window and `cd` to the `bin` directory of your MongoDB installation. You can use this terminal window to run all the commands in this tutorial.

Run `mongo` in the terminal to connect to your local MongoDB server.
```sh
   mongo
```

If your connection is successful, then your MongoDB database is already running. If not, make sure that your local MongoDB database is started by following the steps at Install MongoDB Community Edition. Often, MongoDB is installed, but you still need to start it by running mongod.
When you're done testing your MongoDB database, type Ctrl+C in the terminal.

### Create local Node.js app
In this step, you set up the local Node.js project.

**Clone the sample application**

1. In the terminal window, cd to a working directory. Run the following command to clone the sample repository.
  ```sh
     git clone https://github.com/IBM-Bluemix/nodejs-MEAN-stack
  ```
  This sample repository contains a copy of the [MEAN.js repository](https://github.com/IBM-Bluemix/nodejs-MEAN-stack). 

### Run the application
1. Run the following commands to install the required packages and start the application.
  ```sh
     cd nodejs-MEAN-stack
     npm install
  ```

2. Rename .env.example file to .env. Edit the contents as needed, at a minimum adding your own SESSION_SECRET.

3. Run node server.js to start your app
  ```
     node server.js
  ```


## Create a Compose for MongoDB database on Bluemix
In this step we will create a Compose for MongoDB database on Bluemix and then push the code to Bluemix.

1. Set your Cloud Foundry CLI tool's API endpoint to Bluemix   
  ```sh
     cf api https://api.ng.bluemix.net
  ```
2. Login to Bluemix via the command line   
  ```sh
     cf login
  ```
3. Create the instance of Compose for MongoDB on Bluemix   
  ```sh
     cf create-service compose-for-mongodb Standard mongodb
  ```




## Deploy the Node.js app to Bluemix

There are many ways in which we can deploy the app to Bluemix, first let's push the code to Bluemix by using the following command: 

```sh
   cf push
```

By running this command, the code locally will be pushed to Bluemix. Note we created an database instance earlier with the name called **mongodb**. Bluemix will look for the manifest.yml file, then it will find and bind the mongodb database to our application. 

Once the code been pushed to Bluemix, you should be able to view the app on Bluemix. There is a random host name generated where it should be something like: **https://mean-random-name.mybluemix.net** 

![Live App](images/solution7/live-app.png)

## Manage the app on Bluemix 

blah...



## Manage the MongoDB database 

blah...



## Summary

In this tutorial, you deployed a MEAN stack application using Compose for MongoDB. 

You learned how to:

- Create and run a starter Node.js app locally
- Create a Compose for MongoDB database on Bluemix 
- Deploy the Node.js app to Bluemix
- Manage the app on Bluemix 
- Manage the MongoDB database 



## Next steps

Advance to the next tutorial to learn how to:

- [Set up source control and continuous delivery](https://dev-console.stage1.bluemix.net/docs/solutions/multi-region-webapp.html)


