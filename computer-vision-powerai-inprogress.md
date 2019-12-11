---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-12-11"
lasttested: "2019-12-11"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Computer vision with PowerAI and Schematics
{: #computer-vision-powerai-schematics}

This tutorial walks you through how to provision a dedicated backend instance(VSI) of PowerAI Vision in {{site.data.keyword.vpc_full}}, upload an image dataset, train, deploy an optimized deep learning model as an API using a GPU provisioned on the VSI and deploy a front-end application to a VSI to interact with the backend API to classify an image. Once the front-end VM is created on {{site.data.keyword.vpc_short}} using {{site.data.keyword.bplong_notm}}, its public IP address along with the username and password to log into the application will be displayed for easy access.
{:shortdesc}

Cameras are everywhere. Videos and images have become one of the most interesting data sets for artificial intelligence. In particular, deep learning is being used to create models for computer vision, and you can train these models to let your applications recognize what an image (or video) represents.

IBM PowerAI Vision is a new generation video/image analysis platform that offers built-in deep learning models that learn to analyze images and video streams for classification and object detection.
PowerAI Vision includes tools and interfaces that allow anyone with limited skills in deep learning technologies to get up and running quickly and easily. And because PowerAI Vision is built on open source frameworks for modeling and managing containers it delivers a highly available platform that includes application life-cycle support, centralized management and monitoring, and support from IBM.

## Objectives
{: #objectives}

* Understand how to setup PowerAI vision trial running on Power CPU
* Deploy an object detection and image classification application to a VSI on {{site.data.keyword.vpc_short}}
* Upload an image dataset to train and deploy a deep learning model
* Test the accuracy and adjust the hyperparameters for an optimized model

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* PowerAI Vision Trial
* [{{site.data.keyword.bplong_notm}}](https://{DomainName}/schematics/overview)
* [{{site.data.keyword.vpc_short}}](https://{DomainName}/vpc/provision/vpc)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![Architecture](images/solution53-powerai-vision/architecture_diagram.png)

1. User logs into a backend application running in a VSI with PowerAI vision trial preinstalled to train and deploy a deep learning model(API)
2. User deploys a web application to a front-end subnet on {{site.data.keyword.vpc_short}} through {{site.data.keyword.bplong_notm}}
3. The front-end app interacts with the back-end API
4. User uploads an image for classification to the front-end web app

## Before you begin
{: #prereqs}

1. Obtain your [IBM Cloud API key](https://{DomainName}/iam/apikeys) and save the key for future reference.
2. If you don't have an SSH key on your local machine, [refer to these instructions for creating a key](/docs/vpc?topic=vpc-ssh-keys). By default, the private key is found at `$HOME/.ssh/id_rsa`. [Upload your public SSH key](https://{DomainName}/vpc/compute/sshKeys) to IBM Cloud and save the UUID for future reference.

## Provision a PowerAI Vision Trial service
{: #provision_powerai_vision}
In this section, you will provision a PowerAI vision Trial service. Once successfully provisioned, the result is a VPC, subnet and a VSI where PowerAI Vision trial is pre-installed.

1. Create [PowerAI vision trial](https://{DomainName}/catalog/services/powerai) service from the [{{site.data.keyword.Bluemix}} catalog](https://{DomainName}/catalog).
2. Click on **Create** to provision
   * a VPC
   * a backend subnet
   * Virtual server instance(VSI) within the backend subnet in VPC (particular region and availability zone (AZ))
   * Floating IP (FIP) address on the public Internet for the back-end subnet. _Temporarily attached to train the model._
   * Security group with a rule that allows ingress traffic on port 22 (for SSH)

## Train, deploy and test the deep learning model
{: #train_deploy_dl_model}
In this section, you will train, deploy a deep learning model and expose it as an API

### Train the model
{: #train_model}
1. Access the application via the Floating IP of the backend subnet and login with the credentials generated. Click **Get started**.
2. Click **Create new data set** and give it a name
   - Click on the data set tile.
   - Click on **Import files** and point to the images to be uploaded for classification
3. Label the objects
   - Select at least 5 images of a type and click **Label Objects**
   - Click **Assign category**, give a name and click **Assign**
   - Repeat the steps if you have images of different type

   There must be at least two categories.Each category must have at least five images.
   {:tip}

4. Click **Train model**
   - Modify the model name
   - Select **Image classification** as your type of training
   - Select **System Default(GoogLeNet)** as your Optimization technique
   - Click **Train model**

### Deploy and test the model
{: #deploy_test_model}
1. Once the training is completed, check the accuracy and other parameters.
2. To deploy the trained model, click **Deploy model**
   - Give it a name and click **Deploy**
   - Once the status changes to **Ready**, click on the model **name**
3. To test the deployed model,
   - Click on **import** and select an image
   - Check the **Results** section to check the category and the confidence value
You should also see the created API for the deployed model and the endpoints.

## Create a web app with {{site.data.keyword.bpshort}} to classify images
{: #create_access_webapp}

{{site.data.keyword.bplong_notm}} delivers Terraform-as-a-Service so that you can use a high-level scripting language to model the resources that you want in your IBM Cloud environment, and enable Infrastructure as Code (IaC). Terraform is an Open Source software that is developed by HashiCorp that enables predictable and consistent resource provisioning to rapidly build complex, multi-tier cloud environments.

### Create web app with {{site.data.keyword.bplong_notm}}
{: #create_webapp}

1. Navigate to [Schematics overview page](https://{DomainName}/schematics/overview) and click **Create a workspace**.
2. Enter a **Workspace name** and select a resource group.
3. Provide the [GitHub repository URL](https://github.com/abc/abc.git) to import the Terraform template.
4. Click on **Retrieve input variables** and complete the fields
    For the 'ssh_priv_key', on a terminal run `cat ~/.ssh/id_rsa` command and paste the output between `<<EOF` and `EOF`.
   {:tip}
5. Click on **Create** to start creation.
6. On the Schematics page, Click on **Generate Plan**.
7. Once the plan has successfully generated, a new item appears under Recent Activity saying Plan Generated. Click **Apply plan** to provision
   * a front-end subnet
   * VSI within the front-end subnet to deploy the web app
   * Floating IP (FIP) address on the public Internet for the front-end subnet to access the web app
   * Security group with a rule that allows ingress traffic on port 22 (for SSH)
8. In a browser, enter `http://<Floating_IP>` to see the front-end web app that calls the deployed deep learning model via an API call.

### Classify images
{: #classify_images}

1. Click on **Upload** to select an image from your machine.
2. Click on **Classify** to see the response from the deployed model.
3. Check the configure and confidence output.
4. Repeat the above steps with different types of images.

## Remove resources
{: #cleanup}
Navigate to [resource list](https://{DomainName}/resources) and delete the services.

## Related resources
{: #related_resources}
