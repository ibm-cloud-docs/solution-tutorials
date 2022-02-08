---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-02-08"
lasttested: "2022-02-08"

content-type: tutorial
services: codeengine, databases-for-mongodb
account-plan: paid
completion-time: 1h
---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}


# Modern web application using MEAN stack
{: #mean-stack}
{: toc-content-type="tutorial"}
{: toc-services="codeengine, databases-for-mongodb"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through the creation of a web application using the popular MEAN stack. It is composed of a **M**ongo DB, **E**xpress web framework, **A**ngular front end framework and a **N**ode.js runtime. You will learn how to run a MEAN starter locally, create and use a managed database-as-a-service (DBasS), deploy the app to {{site.data.keyword.cloud_notm}} and scale the database resources.
{: shortdesc}

## Objectives
{: #mean-stack-0}

{: #objectives}

- Create and run a starter Node.js app locally.
- Create a managed database-as-a-service (DBasS).
- Deploy the Node.js app to the cloud using {{site.data.keyword.codeengineshort}}.
- Scale MongoDB memory and disk resources.

{: #architecture}

![Architecture diagram](images/solution7/Architecture.png){: class="center"}
{: style="text-align: center;"}

1. The user accesses the application using a web browser.
2. The Node.js app running in {{site.data.keyword.codeengineshort}} accesses the {{site.data.keyword.databases-for-mongodb}} database to fetch data.

## Before you begin
{: #mean-stack-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI - This CLI tool will enable you to interact with {{site.data.keyword.cloud_notm}}.
   * code-engine/ce plugin (`code-engine/ce`) - Plugins extend the capabilities of the {{site.data.keyword.cloud_notm}} CLI with commands specific to a service. The {{site.data.keyword.codeengineshort}} plugin will give you access to {{site.data.keyword.codeengineshort}} commands on {{site.data.keyword.cloud_notm}}.
   * **Optional** {{site.data.keyword.registryshort_notm}} plugin (`container-registry`)
* `git` to clone source code repository.

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.
<!--#/istutorial#-->

In addition, make sure you [install Node.js](https://nodejs.org/).

## Create an instance of MongoDB database in the cloud
{: #mean-stack-2}
{: step}

{: #createdatabase}

In this section, you will create a {{site.data.keyword.databases-for-mongodb}} instance in the cloud. {{site.data.keyword.databases-for-mongodb}} is a database-as-a-service that usually easier to configure and provides built-in backups and scaling. You can find many different types of databases in the [IBM cloud catalog](https://{DomainName}/catalog?category=databases#services). To create a {{site.data.keyword.databases-for-mongodb}} instance follow the steps below.

{: shortdesc}

1. Login to your {{site.data.keyword.cloud_notm}} account via the command line and target your preferred {{site.data.keyword.cloud_notm}} region, however we will use `ca-tor` in this tutorial.

   ```sh
   ibmcloud login 
   ibmcloud target -r ca-tor 
   ```
   {: codeblock}

   You can find more CLI commands [here](https://{DomainName}/docs/cli?topic=cli-install-ibmcloud-cli).

2. Create an instance of {{site.data.keyword.databases-for-mongodb}} via the [command line](https://cloud.ibm.com/docs/databases-for-mongodb?topic=cloud-databases-provisioning#use-cli). This can also be done using the [console UI](https://{DomainName}/catalog/services/databases-for-mongodb). The service name must be named **mean-starter-mongodb** as the application used in this tutorial is configured to look for the service by this name. For `<region>`, you can choose a region that is closer to you, however we will use `ca-tor` in this tutorial.

   ```sh
   ibmcloud resource service-instance-create mean-starter-mongodb databases-for-mongodb standard ca-tor
   ```
   {: codeblock}

3. Wait for the instance to be ready. You can check the provisioning status with the following command:
   
   ```sh
   ibmcloud resource service-instance mean-starter-mongodb
   ```
   {: codeblock}

4.Once you have verified the service status changed to "create succeeded", you may proceed to create a service key.
  
   ```sh
   ibmcloud resource service-key-create mean-starter-mongodb-key --instance-name mean-starter-mongodb
   ```
   {: codeblock} 

## Run the MEAN app locally
{: #mean-stack-runapplocally}
{: step}

In this section, you will clone a MEAN sample code and run the application locally to test the connection to the MongoDB database running on {{site.data.keyword.cloud_notm}}.
{: shortdesc}

1. Clone the MEAN starter code.
  
   ```sh
   git clone https://github.com/IBM-Cloud/nodejs-MEAN-stack
   cd nodejs-MEAN-stack
   ```
   {: codeblock}

1. Install the required packages.
  
   ```sh
   npm install
   ```
   {: codeblock}

1. Copy .env.example file to .env.
  
   ```sh
   cp .env.example .env
   ```
   {: codeblock}

1. In the .env file, add your own SESSION_SECRET. For MONGODB_URL and CERTIFICATE_BASE64, run the below command:
  
   ```sh
   ibmcloud resource service-key mean-starter-mongodb-key --output json
   ```
   {: codeblock}

   You can find the value required for **MONGODB_URL** under `credentials -> connection -> mongodb -> composed` and the value for **CERTIFICATE_BASE64** under `credentials -> connection -> mongodb -> certificate -> certificate_base64` in the returned JSON output.
1. Run node server.js to start your app.
  
   ```sh
   node server.js
   ```
   {: codeblock}

1. Access your application, create a new user and log in.

## Deploy app to the cloud
{: #mean-stack-4}
{: step}

{: #deployapp}

{{site.data.keyword.codeenginefull}} is a fully managed, serverless platform that runs your containerized workloads, including web apps, microservices, event-driven functions, or batch jobs. In this section, you will create a {{site.data.keyword.codeengineshort}} project and deploy the Node.js app to the project. In the previous section, the source code reads the `.env` that you have locally to obtain the URL and credentials to the MongoDB service. You will create a secret in the cloud to contain these same keys/values that will be read by the application when running in the cloud.

We've already built a container image for the application and pushed it to the public {{site.data.keyword.registryshort_notm}}. You will use this pre-built container image to deploy the application.
{: shortdesc}

1. Create a project in {{site.data.keyword.codeenginefull_notm}}.
   
   ```sh
   ibmcloud ce project create --name mean-stack
   ```
   {: codeblock}

2. Create a secret in the project that contains the keys/values from the `.env` file.
   
   ```sh
   ibmcloud ce secret create --name mean-stack-secrets --from-env-file .env
   ```
   {: codeblock}

3. Create the application based on the public container image that is based on the same source code downloaded from the `https://github.com/IBM-Cloud/nodejs-MEAN-stack` repository.  If you are interested in the steps used to create this image, you can review [create-container-image.md](https://github.com/IBM-Cloud/nodejs-MEAN-stack/blob/master/create-container-image.md).
   
   ```sh
   ibmcloud code-engine application create --name mean-stack --image icr.io/solution-tutorials/mean-stack --env-from-secret mean-stack-secrets
   ```
   {: codeblock}

4. Once the code been pushed, you should be able to view the app in your browser. A random host name been generated that can look like: `https://mean-stack.<randome_name>.ca-tor.codeengine.appdomain.cloud/`. You can get your application URL from the console dashboard or command line.![Live App](images/solution7/live-app.png)

## Scaling MongoDB database resources
{: #mean-stack-scaledatabase}
{: step}

If your service needs additional storage, or you want to reduce the amount of storage allocated to your service, you can do this by scaling resources.
{: shortdesc}

1. Using the console **dashboard**, locate the **MongoDB** service instance and click until you are in the **Service Details**.
2. Click on the **Resources** panel.
   ![Scale Resources](images/solution7/MongoDB_ScaleResources.png)
3. Adjust the **slider** to raise or lower the storage allocated to your {{site.data.keyword.databases-for-mongodb}} database service.
4. Click **Scale Deployment** to trigger the rescaling and return to the dashboard overview. It will indicate that the  rescaling is in progress.
5. Alternatively configure autoscaling rules to automatically increase the database resources as its usage is increasing.

## Remove resources
{: #mean-stack-6}
{: removeresources}
{: step}

To remove resource, follow these steps:
1. With the command below, delete the project to delete all it's components (applications, jobs etc.).
   ```sh
   ibmcloud code-engine project delete --name mean-stack
   ```
   {: pre}
   
2. Visit the [{{site.data.keyword.cloud_notm}} Resource List](https://{DomainName}/resources). Locate your app.
2. Delete the {{site.data.keyword.databases-for-mongodb}} service.

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](https://{DomainName}/docs/account?topic=account-resource-reclamation).
{: tip}

## Related Content
{: #mean-stack-7}

{: #related}

- Set up source control and [continuous delivery](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-multi-region-webapp#multi-region-webapp-devops).
- Secure web application across [multiple locations](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-multi-region-webapp).
- Create, secure and manage [REST APIs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-create-manage-secure-apis#create-manage-secure-apis).
