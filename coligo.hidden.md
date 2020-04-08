---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-04-07"
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

# Object detection with Coligo
{: #coligo}

> :warning: WORK-IN-PROGRESS

In this tutorial, you will be learn about Coligo by deploying an object detection application to a Coligo cluster. The application is made up of frontend and backend applications:. The frontend application is a web application that user will use to upload images. This web app will send the uploaded images to the backend application for processing. The backend application will store the images into an object storage "bucket" and then initiate a "batch" job to process all of the images uploaded to the bucket - one job per image. A batch job is a collection of tasks that where each task performs exactly one action and then exits. This processing will involve passing the image to the {{site.data.keyword.visualrecognitionshort}} service to determine what is in the image. The result from the {{site.data.keyword.visualrecognitionshort}} service will be stored into another bucket. And finally, the results of those scans will then be visible on the web application.
{:shortdesc}

Coligo aims to create a platform to unify the deployment of functions, applications, batch jobs (run-to-completion workloads), and pre-built containers to Kubernetes-based infrastructure. It provides a "one-stop-shop" experience for developers, enabling higher productivity and faster time to market. Delivered as a managed service on the cloud and built on open-source projects (Kubernetes, Istio, Knative, Tekton etc.,)

Kubernetes is a complex product that requires developers to understand a lot of configuration knobs in order to properly run their applications. Developers need to carry out repetitive tasks, such as installing dependencies and configuring networking rules. They must generate configuration files, manage logging and tracing, and write their own CI/CD scripts using tools like Jenkins. Before they can deploy their containers, they have to go through multiple steps to containerize their source code in the first place.

Knative helps developers by hiding many of these tasks, simplifying container-based management and enabling you to concentrate on writing code. It also makes available many of the features of a serverless platform, such as "scale-to-zero".

## Objectives
{: #objectives}

* Understand Coligo and how it simplifies the developer experience.
* Understand how easy it is to deploy and scale an application using Coligo.
* Learn the use of jobs to execute task-to-completion workloads.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [IBM Coligo](https://{DomainName}/knative/overview)
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

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/tutorials?topic=solution-tutorials-getting-started) guide.
<!--#/istutorial#-->

## Create a IBM Coligo project
{: #create_coligo_project}

In this section, you will provision a Coligo service and a subsequent project to group applications and jobs.

1. Navigate to [IBM Coligo Overview](https://{DomainName}/knative/overview) page
2. Click on **Create project**. Create a new project to group your components (applications,jobs etc.). Use projects to organize your Coligo related entities like a folder and work on focused context.
   - Provide a project name
   - Select a resource group and Location
   - Click on **Create**
3. On a terminal, make the command line tooling point to your project
   ```sh
   ibmcloud coligo target --name $COLIGO_PROJECT
   ```
   {:pre}

## Deploy the frontend and backend apps as Coligo applications
{: #deploy_app}

In this section, you will deploy your front-end web application to Coligo under the targeted project. Once deployed and tested, you will deploy your back-end application and verify the connection. You will use the pre-built container images to deploy the respective applications,

### Deploy a frontend application

1. To deploy a new Coligo application, you need to run the below command by providing a service name "frontend" and the pre-built container image as a parameter to `--image` flag.
   ```sh
   ibmcloud coligo application create --name frontend \
   --image ibmcom/frontend
   ```
   {:pre}

    The only two parameters includes the name you want to give to this new application ("frontend"), and the container image that has its running code ("ibmcom/coligo-frontend") as Coligo will handle everything else for you.
    {:tip}

2. Copy the URL from the output above and open it in a browser to see an output as similar to this
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
Congratulations!! You've just deployed a web application to Coligo with a simple command and also without the intricacies of Kubernetes such as pods, deployments, services, and ingress.

### Scale the application

To check the autoscaling capabilities of Coligo,
1. Navigate to the [load generator URL](https://load.fun.{DomainName}/) and paste the frontend application URL from the above step
2. Click on **Generate load** to generate traffic.
3. Run the below command to see the pod count incrementing as part the autoscaling
   ```sh
   kubectl get pods --watch
   ```
   {:pre}
4. Once load generation is stopped, wait for a minute to see the pods scaling to zero.

### Deploy a backend app and test the connection

1. To deploy a new backend application, run this command
   ```sh
   ibmcloud coligo application create --name backend \
   --image ibmcom/backend --cluster-local
   ```
   {:pre}
   The `--cluster-local` flag will instruct Coligo to keep the endpoint for this application private. Meaning, it will only be available from within the cluster often used for security purposes.
   {:tip}

2. Copy the private endpoint (URL) from the output above.
3. The frontend application uses an environment variable to know where the backend application is hosted. You now need to modify the frontend application to set this value to point to the backend application's endpoint - make sure to use the value from the previous command
   ```sh
   ibmcloud coligo application update --name frontend \
   --env backend=backend.XXX.svc.cluster.local
   ```
   {:pre}

   The `--env` flag can appear as many times as you would like if you need to set more than one environment variable. This option could have also been used on the `application create` command for the frontend application as well if you knew its value at that time.
   {:tip}

4. Refresh the frontend URL on the browser to test the connection to the backend service. Now, backend should be available. Try uploading an image from your computer to detect objects, you should still see an error message as the backend is still not connected with the required services to store the image and process it.

## Connect the backend service to {{site.data.keyword.cos_short}} and {{site.data.keyword.visualrecognitionshort}} services
{:connect_cloud_services}

In this section, you will provision the required {{site.data.keyword.cos_short}} and {{site.data.keyword.visualrecognitionshort}} services and bind them to the backend service. The backend service will store the images into the {{site.data.keyword.cos_short}}, while the {{site.data.keyword.visualrecognitionshort}} will be used to analyze the images.

### Provision {{site.data.keyword.cos_short}} and {{site.data.keyword.visualrecognitionshort}} services
{:#create_services}

1. Create an instance of [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage)
   1. Select the **Lite** plan or the **Standard** plan if you already have an {{site.data.keyword.cos_short}} service instance in your account.
   2. Set **Service name** to **coligo-cos** and select a resource group.
   3. Click on **Create**.
2. Under **Service Credentials**, create new credential and select **Include HMAC Credential**. Click **Add** and save the credentials for future reference
3. Create a **Standard** bucket named `<your-initials>-coligo-images` with **Cross Region** resiliency and another bucket named `<your-initials>-coligo-results` with **Cross Region** resiliency.
4. Under **Endpoint**, find the **private** endpoint to access your buckets and save the endpoint for quick reference.
5. Create an instance of [{{site.data.keyword.visualrecognitionshort}}](https://{DomainName}/catalog/services/visual-recognition)
   1. Select a region and select **Lite** plan.
   2. Set **Service name** to **coligo-vr** and select a resource group.
   3. Click on **Create**.
6. Under **Service Credentials**, expand **View credentials** and **save** the credentials for quick reference. If you don't see auto-generated credentials, create a **New credential**.

### Bind the services to the backend service

Now, you will need to pass in the credentials for the services you just created into our backend application. You will do this by storing the credentials into "secrets", and then asking the Coligo runtime to make them available to the application via environment variables.

1. Create a secret for {{site.data.keyword.cos_short}} service by replacing the placeholders with appropriate service credentials and a configmap to hold the bucket name,
   ```sh
   ibmcloud coligo secret create --name cos-secret \
   --from-literal=cos-endpoint=ENDPOINT \
   --from-literal=cos-api-key=API_KEY
   --from-literal=cos-resource-instance-id=RESOURCE_INSTANCE_ID
   ```
   {:pre}

   You will put the bucket name into a "configmap" as the information isn't sensitive.
   {:tip}

   ```sh
   ibmcloud coligo configmap create --name cos-bucket-name \
   --from-literal=bucket.name=COS_BUCKET_NAME
   ```
   {:pre}

2. With the secrets and configmap defined, you can now update the backend service by asking Coligo to set environment variables in the runtime of the application based on the values in those resources.Update the backend application with the following command
   ```sh
   ibmcloud coligo application update --name backend \
   --env-from secret:cos-secret \
   --env-from configmap:cos-bucket-name
   ```
   {:pre}

   Both secrets and configmap are "maps"; so the environment variables set will have a name corresponding to the "key" of each entry in those maps, and the environment variable values will be the value of that "key".
   {:tip}

3. To verify whether the backend application is updated with the secret. You can run the below command and look for the "env" section
   ```sh
   ibmcloud coligo application describe --name backend -o yaml
   ```
   {:pre}

## Testing the entire application
{:testing_app}

Now that you have the backend application connected to the frontend application, let's test it by uploading images for processing.

1. Before testing the application, let's create a secret for {{site.data.keyword.visualrecognitionshort}} service to be used with the jobs in the subsequent steps,
   ```sh
   ibmcloud coligo secret create --name vr-secret \
   --from-literal=api-key=VISUAL_RECOGNITION_APIKEY \
   --from-literal=url=VISUAL_RECOGNITION_URL
   ```
   {:pre}
2. Test the app by uploading an image through the frontend UI
   1. Click on **Choose an image...** and point to the image on your computer. You should see the preview of the image with a "Not Analyzed" tag on it.
   2. Click on **Upload Images** to store the image in the {{site.data.keyword.cos_short}} bucket - `<your-initials>-coligo-images`.
3. Click on **Analyze** to create a new job that passes the uploaded image in the {{site.data.keyword.cos_short}} bucket to {{site.data.keyword.visualrecognitionshort}} service for object detection. The results are stored in a separate {{site.data.keyword.cos_short}} bucket - `<your-initials>-coligo-results` and can be seen on the UI.
4. Upload multiple images to create individual jobs. Each job retrieves a single image to process from the bucket.
5. Check the results of the processed images on the UI.

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

1. With the command below, delete the project to delete all it's components (applications, jobs etc.).
   ```sh
   ibmcloud coligo project delete --name $COLIGO_PROJECT
   ```
   {:pre}
2. Navigate to [Resource List](https://{DomainName}/resources/)
3. Delete the services you have created:
 * [{{site.data.keyword.cos_full}}](https://{DomainName}/catalog/services/cloud-object-storage)
 * [{{site.data.keyword.visualrecognitionfull}}](https://{DomainName}/catalog/services/visual-recognition)
