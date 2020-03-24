---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-03-23"
lasttested: "2020-03-05"

---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}
{:note: .note}

# Coligo tutorial
{: #coligo}

In this tutorial, you will be learn about Coligo by deploying an object detection application to a Coligo cluster. The application is actually made up of two separate applications: a frontend and a backend. The frontend application is a web server that will host a browser based application that people will use to upload images. This frontend application will then send those images to the backend application for processing. The backend application will upload the images into an object storage "bucket" and then initiate a "batch" job over the uploaded images. A batch job is a collection of tasks that wehre each task performs exactly one action and then exits. In this case, we will define a batch job to process all of the images uploaded to the bucket - one job per image. This processing will involve passing the image to the Watson image analysis service to determine what is in the image. The result of that analysis will then be uploaded into another bucket. And finally, the results of those scans will then be visible on the frontend application/UI.

Coligo aims to create a platform to unify the deployment of functions, applications, batch jobs (run-to-completion workloads), and pre-built containers to Kubernetes-based infrastructure. It provides a "one-stop-shop" experience for developers, enabling higher productivity and faster time to market. Delivered as a managed service on the cloud and built on open-source projects (Kubernetes, Istio, Knative, Tekton etc.,).
{:shortdesc}

Kubernetes is a complex product that needs a lot of configuration to run properly. Developers need to carry out repetitive tasks, such as installing dependencies and configuring networking rules. They must generate configuration files, manage logging and tracing, and write their own CI/CD scripts using tools like Jenkins. Before they can deploy their containers, they have to go through multiple steps to containerize their source code in the first place.

Knative helps developers by hiding many of these tasks, simplifying container-based management and enabling you to concentrate on writing code. It also makes available many of the features of a serverless platform, such as "scale-to-zero".

## Objectives
{: #objectives}

* Understand Coligo and how it simplifies the developer experience.
* Deploy a frontend application to Coligo to upload images for object detection.
* Store the uploaded images in COS service bucket on {{site.data.keyword.Bluemix}}.
* Process the images as individual jobs and store the results of object detection in a different bucket on COS service.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* Coligo service
* [{{site.data.keyword.cos_full}}](https://{DomainName}/catalog/services/cloud-object-storage)
* [{{site.data.keyword.visualrecognitionfull}}](https://{DomainName}/catalog/services/visual-recognition)


<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution54-coligo-hidden/architecture_diagram.png)
</p>

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * Coligo plugin (`coligo-service`),
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`)

## Create Coligo and required cloud services
{: #create_coligo_project}

In this section, you will provision a Coligo service and a subsequent project to group applications and jobs. You will also provision other services required

### Provision Coligo service and create a project
{:#coligo_service_project}

1. On {{site.data.keyword.Bluemix_notm}} catalog, provision a Coligo service.
   - Select a region and a resource group
   - Provide a service name
   - Click **Create** to provision he Coligo service
2. Create a new project to group your components (applications,jobs etc.,). Use projects to organize your Coligo related entities like a folder and work on focused context. On the Coligo dashboard, click **Projects** on the left pane,
   - Provide a project name
   - Click on **Create Project**
3. On a terminal, define an environment variable `COLIGO_PROJECT` and set it to your project name.
   ```sh
   export COLIGO_PROJECT=<your-project-name>
   ```
   {:pre}
4. Check the details of your project by running the following command
   ```sh
   ibmcloud coligo project get --name $COLIGO_PROJECT
   ```
   {:pre}
5. Target the project to run the future commands
   ```sh
   ibmcloud coligo target --name $COLIGO_PROJECT
   ```
   {:pre}

## Deploy the frontend and backend apps as Coligo services
{: #deploy_app}

In this section, you will deploy your front-end web application to Coligo under the targeted project. Once deployed and tested, you will deploy your back-end application and verify the connection. You will use the pre-built container images to deploy the respective applications,

### Deploy a frontend application

1. To deploy a new Coligo application, you need to run the below command by provide a service name "frontend" and the pre-built container image as a parameter to `--image` flag.
   ```sh
   ibmcloud coligo application create --name frontend \
   --image ibmcom/coligo-frontend \
   --project $COLIGO_PROJECT
   ```
   {:pre}

2. Copy the URL from the output above and open it in a browser to see an output as similar to the one below
   ```
   Hello World!! from the frontend.
   Connection to the backend failed as there is no backend defined yet.
   ```
3. For secured browsing, you can also browse the application with `HTTPS`.

   For troubleshooting and to display logs of your application, run the command `ibmcloud coligo application logs --name APPLICATION_NAME`
   {:tip}
<!--4. List the pods of the service and notice that it has a running pod
   ```sh
   kubectl get pods --watch
   ```
   {:pre}-->

Congratulations!! on deploying a web application to Coligo with a simple command and also without the intricacies of Kubernetes such as pods, deployments, services, and ingress.

### Deploy a backend app and test the connection

1. To deploy a new backend application, run the below command
   ```sh
   ibmcloud coligo application create --name backend \
   --image ibmcom/coligo-backend \
   --project $COLIGO_PROJECT \
   --cluster-local
   ```
   {:pre}
2. Copy the private endpoint (URL) from the output above.
3. Edit the frontend application to set the environment variable pointing to the backend private endpoint
   ```sh
   ibmcloud coligo application update --name frontend \
   --env backend=backend.XXX.svc.cluster.local
   ```
   {:pre}
4. Refresh the frontend URL on the browser to test the connection to the backend service. Now, backend should be available. Try uploading an image from your computer to detect objects, you should still see an error message as the backend is still not connected with the required services to store the image and process it.

## Connect the backend service to {{site.data.keyword.cos_short}} and {{site.data.keyword.visualrecognitionshort}} services
{:connect_cloud_services}

In this section, you will create the required {{site.data.keyword.cos_short}} and {{site.data.keyword.visualrecognitionshort}} services and bind them to the backend service.

### Create {{site.data.keyword.cos_short}} and {{site.data.keyword.visualrecognitionshort}} services
{:#create_services}

1. Create an instance of [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage)
   1. Select the **Lite** plan or the **Standard** plan if you already have an {{site.data.keyword.cos_short}} service instance in your account.
   2. Set **Service name** to **coligo-cos** and select a resource group.
   3. Click on **Create**.
2. Under **Service Credentials**, create new credential and select **Include HMAC Credential**. Click **Add** and save the credentials for future reference
3. Create a **Standard** bucket named `<your-initial>-coligo-images` with **Cross Region** resiliency and another bucket named `<your-initial>-coligo-results` with **Cross Region** resiliency.
4. Under **Endpoint**, find the **private** endpoint to access each of your bucket and save the endpoint for quick reference.
5. Create an instance of [{{site.data.keyword.visualrecognitionshort}}](https://{DomainName}/catalog/services/visual-recognition)
   1. Select a region and select **Lite** plan.
   2. Set **Service name** to **coligo-vr** and select a resource group.
   3. Click on **Create**.
6. Under **Service Credentials**, expand **View credentials** and **save** the credentials for quick reference. If you don't see auto-generated credentials, create a **New credential**.

### Bind the services to the backend service

1. Create a secret for {{site.data.keyword.cos_short}} service by replacing the placeholders with appropriate service credentials and a configmap to hold the bucket name,
   ```sh
   ibmcloud coligo secret create --name cos-secret \
   --from-literal=cos-access-key=ACCESS_KEY_ID \
   --from-literal=access-secret=SECRET_ACCESS_KEY
   ```
   {:pre}

   ```sh
   ibmcloud coligo configmap create --name cos-bucket-name \
   --from-literal=bucket.name=COS_BUCKET_NAME
   ```
   {:pre}

2. Similarly, create a secret for {{site.data.keyword.visualrecognitionshort}} service,
   ```sh
   ibmcloud coligo secret create --name vr-secret \
   --from-literal=api-key=VISUAL_RECOGNITION_APIKEY \
   --from-literal=url=VISUAL_RECOGNITION_URL
   ```
   {:pre}
3. Update the environment variables from the created secrets with the below command
   ```sh
     ibmcloud coligo application update --name backend \
     --env-from secret:cos-secret \
     --env-from secret:vr-secret \
     --env-from configmap:cos-bucket-name
   ```
   {:pre}
4. To verify whether the backend application `yaml` is updated with the secret. You can run the below command
   ```sh
   ibmcloud coligo application describe --name backend -o yaml
   ```
   {:pre}

## Testing the entire application
{:testing_app}

Now that we have the backend application connected to the frontend application, let's test it by uploading images for processing.

1. Test the app by uploading an image through the frontend UI. The image will be stored in the {{site.data.keyword.cos_short}} bucket - `<your-initial>-coligo-images`.
2. Uploading an image to {{site.data.keyword.cos_short}} bucket triggers a new job and the uploading image is passed to {{site.data.keyword.visualrecognitionshort}} service for object detection. The results are stored in `<your-initial>-coligo-results` bucket.
3. Upload multiple images to trigger individual jobs. Each job retrieves a single image to process from the bucket.
4. Check the results of the processed images on the UI.

   If you are interested in checking the job details, run the command `ibmcloud coligo job list` to see the list of job runs and then pass the job name retrieved from the list to the command - `ibmcloud coligo job get --name JOBRUN_NAME`
   {:tip}

<!--## Build your own container image and push it to {{site.data.keyword.registrylong_notm}}
{:#container_image_registry}

> Optional step

In this section, you will build your own container image from the source code and store the image in a private registry - {{site.data.keyword.registrylong_notm}}

1. If you wish to build your own container image from source code, run the below command
    - If `ibmcloud coligo CLI` provides a way to build a container from the source code, we can mention that here or use Tekton pipelines
    - Or we can talk about Kaniko, Buildkit, Jib, Skaffold etc., to build the container image from source code.
    - Or follow the usual Dockerfile create flow
2. With Coligo, I am assuming something like this (internally using any of the methods above)
   ```sh
   ibmcloud coligo service frontend --source https://github.com/test/nodeapp.git
   ```
   {:pre}-->

## Remove resources
{:#cleanup}

1. With the command below, delete the project to delete all it's components (applications, jobs etc.,).
   ```sh
   ibmcloud coligo project delete --name $COLIGO_PROJECT
   ```
   {:pre}
2. Navigate to [Resource List](https://{DomainName}/resources/)
3. Delete the services you have created:
 * [{{site.data.keyword.cos_full}}](https://{DomainName}/catalog/services/cloud-object-storage)
 * [{{site.data.keyword.visualrecognitionfull}}](https://{DomainName}/catalog/services/visual-recognition)
