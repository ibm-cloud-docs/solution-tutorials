---
copyright:
  years: 2018
lastupdated: "2018-01-26"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a database-driven Slackbot with IBM Watson Conversation

In this solution tutorial we are going to build a Slackbot backed by the IBM Watson Conversation service. We integrate Slack and Watson Conversation with the [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/). It is based on IBM Cloud Functions and Cloudant NoSQL DB.
The chatbot retrieves information from a Db2 database. The data can also be updated using the Slackbot. Code is written in Node.js.

![](images/solution19/SlackbotArchitecture.png)

## Objectives

* Connect IBM Watson Conversation to Slack using the Conversation connector
* Create, deploy and bind Node.js actions in IBM Cloud Functions
* Access a Db2 database from IBM Cloud Functions using Node.js

## Products

This tutorial uses the following products:
   * [IBM Watson Conversation](https://console.bluemix.net/catalog/services/conversation)
   * [IBM Cloud Functions](https://console.bluemix.net/openwhisk/)
   * [Db2 Warehouse on Cloud](https://console.bluemix.net/catalog/services/db2-warehouse)
   * [Cloudant NoSQL DB](https://console.bluemix.net/catalog/services/cloudant-nosql-db)

## Before you begin
{: #prereqs}

To complete this tutorial you need the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the IBM Cloud Functions [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).

## Service and Environment Setup
In the following, we are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Download or clone the repository https://github.com/IBM-Cloud/UPDATEME. Change into that directory.
2. If not already done, [login to IBM Cloud and select the organization and space where the services and code should be deployed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/bx_cli.html#bluemix_login).
3. 


overall flow:
1. clone repository
2. run script to create services
3. run script to set up database and actions
4. load workspace
5. adjust credentials in some nodes
6. deploy conversation to Slack
7. test

## Deploy the Conversation to Slack

1. Click the deploy icon
2. Under Deploy Options in the **Deploy with Cloud Functions** click on **Deploy** for Slack.
3. Click on **Deploy to Slack app** which brings you to a page with instructions on how to create and configure the Slack app.
4. Follow the instructions on the that page which has about 8 steps on its own. In order to create the Slack app, you need access to a Slack workspace. If you don't have that yet, then you can sign up and create such a workspace as part of that process.


## Expand the tutorial
Want to extend this tutorial? Here are some ideas:
1.
2.
3. Add a weather forecast for event data
4. Export event data as iCalendar ics file.

# Related Content
* [Conversation connector](https://github.com/watson-developer-cloud/conversation-connector/) for connecting Watson Conversation to Slack and Facebook Messenger
* Documentation: [IBM Knowledge Center for Db2 Warehouse](https://www.ibm.com/support/knowledgecenter/en/SS6NHC/com.ibm.swg.im.dashdb.kc.doc/welcome.html)
* [Frequently asked questions about IBM Db2 on Cloud and IBM Db2 Warehouse on Cloud](https://www.ibm.com/support/knowledgecenter/SS6NHC/com.ibm.swg.im.dashdb.doc/managed_service.html) answering questions related to managed service, data backup, data encryption and security, and much more.
* [Free Db2 Developer Community Edition](https://www.ibm.com/us-en/marketplace/ibm-db2-direct-and-developer-editions) for developers
* Documentation: [API Description of the ibm_db Node.js driver](https://github.com/ibmdb/node-ibm_db)
* [IBM Data Server Manager](https://www.ibm.com/us-en/marketplace/data-server-manager)
