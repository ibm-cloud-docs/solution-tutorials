---
copyright:
  years: 2018
lastupdated: "2018-03-27"

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

![](images/solution24-github-traffic-analytics/Architecture.png)

## Objectives

* Set up serverless collection of Github traffic statistics
* Deploy Python app with multi-tenant support
* Integrate App ID as openID Connect-based authentication provider
* Integrate Dynamic Dashboard Embedded for traffic analytics

## Products

This tutorial uses the following products:
   * [{{site.data.keyword.openwhisk_short}}](https://console.bluemix.net/openwhisk/)
   * [{{site.data.keyword.dashdblong}} ](https://console.bluemix.net/catalog/services/db2-warehouse)
   * App ID
   * DDE
   * Cloud Foundry Python runtime

## Before you begin
{: #prereqs}

To complete this tutorial, you need the latest version of the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview) and the {{site.data.keyword.openwhisk_short}} [plugin installed](https://console.bluemix.net/docs/cli/reference/bluemix_cli/extend_cli.html#plug-ins).


## Service and Environment Setup
In this section, we are going to set up the needed services and prepare the environment. Most of this can be accomplished from the command line interface (CLI) using scripts. They are available on Github.

1. Clone the [Github repository](https://github.com/IBM-Cloud/github-traffic-stats) and navigate into the cloned directory and its **functions** subdirectory:

   ```bash
   git clone https://github.com/IBM-Cloud/github-traffic-stats
   cd github-traffic-stats/functions
   ```

2. Use `bx login` to log in interactively. You can reconfirm the details by running `bx target` command.

3. Create a {{site.data.keyword.dashdbshort}} instance and name it **ghstatsDB**:

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

5. Create an instance of the {{site.data.keyword.appid_short}} service. We use **ghstatsAppID** as name. The service only offers the **Graduated tier** plan.
   ```
   bx service create appID "Graduated tier" ghstatsAppID
   ```
   {:codeblock}

6. Next, we are going to register actions for {{site.data.keyword.openwhisk_short}} and bind service credentials to those actions.

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
