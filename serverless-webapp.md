---
subcollection: solution-tutorials
copyright:
  years: 2024
lastupdated: "2025-01-02"
lasttested: "2024-04-15"

content-type: tutorial
services: codeengine, Cloudant, cloud-object-storage
account-plan: paid
completion-time: 1h
use-case: ApplicationModernization
---
{{site.data.keyword.attribute-definition-list}}

# Serverless web application and API with {{site.data.keyword.codeengineshort}}
{: #serverless-webapp}
{: toc-content-type="tutorial"}
{: toc-services="codeengine, Cloudant, cloud-object-storage"}
{: toc-completion-time="1h"}
{: toc-use-case="ApplicationModernization"}

This tutorial may incur costs. Use the [Cost Estimator](/estimator){: external} to generate a cost estimate based on your projected usage.
{: tip}


In this tutorial, you will create a serverless web application using a bucket in {{site.data.keyword.cos_short}} and implementing the application backend using {{site.data.keyword.codeenginefull_notm}} and [{{site.data.keyword.cloudant_short_notm}}](/docs/Cloudant?topic=Cloudant-getting-started-with-cloudant) as JSON document database.
{: shortdesc}

Static websites are great for performance and security. Their architectural model is sometimes referred to as [Jamstack](https://jamstack.org/){: external} in reference to JavaScript, API, and Markup. In this tutorial, you will create a static website hosted on {{site.data.keyword.cos_short}}. The website has a guestbook which uses JavaScript to access an API for retrieving entries or to add a new entry. The API for interaction with the backing database is implemented using a serverless approach. It is deployed as backend app or microservice to [{{site.data.keyword.codeenginefull_notm}}](/docs/codeengine?topic=codeengine-getting-started). The backend only runs when required and thereby occurs charges when in use. 


## Objectives
{: #serverless-webapp-0}

* Deploy a serverless backend and a database
* Expose a REST API as serverless app
* Host a static website

The application shown in this tutorial is a simple guestbook website where users can post messages.

![Architecture](./images/solution64-serverless-webapp/architecture-serverless-api-webapp.svg){: caption="Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}


1. The user accesses the application hosted on the bucket in {{site.data.keyword.cos_short}}
2. The web application calls a backend API.
3. The app with the backend API is deployed to {{site.data.keyword.codeengineshort}}.
5. The backend uses {{site.data.keyword.cloudant_short_notm}} to store and retrieve guestbook entries.

## Create the Guestbook database
{: #serverless-webapp-2}
{: step}

Let's start by creating a [{{site.data.keyword.cloudant_short_notm}}](/docs/Cloudant?topic=Cloudant-getting-started-with-cloudant) service instance. {{site.data.keyword.cloudant_short_notm}} is a fully managed JSON document database. It is built upon and compatible with Apache CouchDB.

1. In the [Catalog](/catalog?category=databases#services){: external}, under **Services**, go to the **Databases** category. Click on the **{{site.data.keyword.cloudant}}** tile. In the new dialog:
   1. Under **Multitenant** select a region.
   1. Under **Configure Cloudant instance** pick a **unique** name for the service, such as `<yourinitials>-guestbook-db`.
   1. Select a resource group.

   1. Select **IAM** as authentication method.
   1. Select the **Lite** plan. If you already have a Lite plan in your account, select another service plan.
   1. Click **Create**.
2. Back in the [{{site.data.keyword.cloud_notm}} Resource List](/resources/){: external}, under **Services**, click on the {{site.data.keyword.cloudant}} instance you created to open the instance full details page. Note: You may be required to wait until the status of the service changes to `Active`.
3. Click on **Launch Dashboard** to open the dashboard in a new browser tab.
4. In the upper right, click on **Create Database**. Enter `guestbook` as name and select **Non-Partioned** under **Partitioning**. Click **Create** to create the database.

## Create serverless backend
{: #serverless-webapp-3}
{: step}

In this section, you will create the serverless backend app with {{site.data.keyword.codeengineshort}}. Serverless apps only incur charges for the execution time which is ideal for infrequently accessed solutions like a guestbook.


### Create a {{site.data.keyword.codeengineshort}} project
{: #serverless-webapp-4}

1. Navigate to [{{site.data.keyword.codeenginefull_notm}} Overview](/containers/serverless/overview){: external} page.
2. On the left pane, click on **Projects** and then click **Create**,
   - Select a location.
   - Use `<yourinitials>-guestbook` as project name and select the same resource group as before.
   - Click on **Create**.
   - Wait until the project `status` changes to **Active**.
3. Click on the project name to enter the project dashboard.


### Create and deploy backend app
{: #serverless-webapp-5}
{: step}

1. Within the project dashboard, click on **Applications**, then **Create**.
2. In the new dialog, enter `guestbook-backend` as name.
3. Leave **Container image** selected and use `icr.io/solution-tutorials/tutorial-serverless-api-webapp:latest` as **Image reference**. It uses an already existing container image.
4. Under **Instance resources**, select `0.25 vCPU / 0.5 GB` for **CPU and memory**. Not much of resources is needed for this type of app.
5. Increase the **Min number of instances** to 1 and reduce **Max number of instances** to 2. The minimum of one makes the app more responsive during the initial tests. You could reduce it later to zero again.
6. Click **Create** to deploy the new backend app for the guestbook. **Note that without the next step of creating a service binding the deployment will fail with a code error.**
7. Create a service binding to the database.
   1. Click **Service bindings** tab.
   2. Click **Create**.
   3. Click **IBM Cloud service instance** and choose your database from the dropdown.
   4. Leave **Role** as **Writer**.
   5. Click **Add**.
8. Wait for the provisioning to report as green and ready. Click on **Test application**, then on **Application URL**. The backend app should load and return a page saying `healthy`. Remember or copy the application URL because it is needed for the next part.

Instead of using the pre-built container image, you could build the image on your own. This can be done either outside of or [with the help of {{site.data.keyword.codeengineshort}}](/docs/codeengine?topic=codeengine-plan-build). If not using the pre-built container image and if [using a private container registry additional steps might be needed](/docs/codeengine?topic=codeengine-deploy-app-private). You can find the source at https://github.com/IBM-Cloud/serverless-guestbook/tree/ce
{: tip}

## Deploy the web app
{: #serverless-webapp-6}
{: step}

Create a {{site.data.keyword.cos_short}} bucket configured with static website hosting containing the files for the guestbook JavaScript application that uses the {{site.data.keyword.cloudant_short_notm}} database.

Create a {{site.data.keyword.cos_short}} instance:
1. Select [Object Storage](/objectstorage/create){: external} from the catalog.
1. Select **IBM Cloud** for the Infrastructure and **Standard** for the plan. 
1. Enter a **unique** service name for the instance, such as `<yourinitials>-guestbook-cos`.
1. Select a resource group.
1. Click **Create**

Create a bucket configured for static website hosting:
1. Click **Create a bucket**.
1. Click **Customize your bucket**.
1. Enter a bucket name that is unique across all IBM accounts. Try `<yourinitials>-guestbook`.
1. Select resiliency as **Regional**.
1. Select a **Location** consistent with the {{site.data.keyword.cloudant_short_notm}} instance.
1. Keep the **Storage class** default
1. Scroll down to the **Static website hosting** and click **Add+**.
1. Keep the Routing rules (individual) selected and add the Index document **index.html**.
1. Click Public access to **On**
1. Click **Save**
1. Scroll to the bottom and click **Create bucket**

Copy the files in the `docs` directory of https://github.com/IBM-Cloud/serverless-guestbook/tree/ce into the bucket:
1. Open https://github.com/IBM-Cloud/serverless-guestbook/tree/ce in a new tab.
1. Download a zip file by clicking **Code** then **Download ZIP**.
1. Unzip the file and navigate to the `docs` directory of the unzipped file.
1. Edit **guestbook.js** - replace the value of **apiUrl** with the application URL from the previous section. 
   
   Make sure that the URI does not end on a slash (`/`). Else the app will not work.
   {: note}

1. Open the bucket **Objects** view and drag and drop the **guestbook.js** and **index.html** files to the COS bucket.
1. Navigate to the **Configuration** tab for the bucket. In the **Endpoints** section locate the **Static website hosting endpoints** section. Copy the **Public** endpoint into a browser tab.
1. You should see the guestbook page.
1. Add new entries to the guestbook.

![Guestbook Screenshot](images/solution64-serverless-webapp/Guestbook.png){: caption="Guestbook Screenshot" caption-side="bottom"}
{: style="text-align: center;"}


## Remove resources
{: #serverless-webapp-cleanup}
{: step}

To delete the created bucket and {{site.data.keyword.cos_short}} service:
1. Navigate to the {{site.data.keyword.cos_short}} bucket objects
1. Check the box in the title row to select all objects in the bucket
1. Click **Delete objects**
1. In the upper right of the bucket object page **Actions** menu select **Delete bucket**
1. In the upper right of the {{site.data.keyword.cos_short}} instance **Actions** menu select **Delete Instance**

To delete the created {{site.data.keyword.cloudant_short_notm}} service,
1. Navigate to the [resource list](/resources){: external}
2. Under **Databases**, click on the action menu next to `<yourinitials>-guestbook-db` service
3. Click **Delete**

To delete the application and project {{site.data.keyword.codeengineshort}},
1. Navigate to the [{{site.data.keyword.codeengineshort}}](/containers/serverless/overview) landing page.
2. On the left pane, click on **Projects**.
3. In the list of projects, check the guestbook project, then click **Delete**.

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}

## Related content
{: #serverless-webapp-8}

* [Serverless Computing](https://www.ibm.com/think/topics/serverless){: external}
* [Serverless Deployment Model](https://developer.ibm.com/depmodels/serverless/){: external}
* [Getting started with {{site.data.keyword.codeenginefull_notm}}](/docs/codeengine?topic=codeengine-getting-started)
