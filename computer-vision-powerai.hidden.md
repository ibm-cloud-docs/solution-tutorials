---
subcollection: solution-tutorials
copyright:
  years: 2019, 2020
lastupdated: "2020-03-03"
lasttested: "2020-03-03"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Computer vision with PowerAI and Schematics
{: #computer-vision-powerai-schematics}

This tutorial walks you through provisioning a dedicated backend virtual server instance (VSI) of PowerAI Vision in {{site.data.keyword.vpc_full}} through {{site.data.keyword.bplong_notm}}. Once provisioned, you will upload an image data set, train, deploy, and test an optimized deep learning (image classification) model through a GPU on the VSI. You will also deploy a front-end application through {{site.data.keyword.bplong_notm}} to a new VSI on the same {{site.data.keyword.vpc_full}}. Once deployed, you will upload an image for classification by communicating with the backend deployed model exposed an an API.
{:shortdesc}

Videos and images have become one of the most interesting data sets for artificial intelligence. In particular, deep learning is being used to create models for computer vision, and you can train these models to let your applications recognize what an image (or video) represents.

IBM PowerAI Vision is a new generation video and image analysis platform that offers built-in deep learning models that learn to analyze images and video streams for classification and object detection. PowerAI Vision includes tools and interfaces that allow anyone with limited skills in deep learning technologies to get up and running quickly and easily. And because PowerAI Vision is built on open source frameworks for modeling and managing containers it delivers a highly available platform that includes application life-cycle support, centralized management and monitoring, and support from IBM.

## Objectives
{: #objectives}

* Use {{site.data.keyword.bpshort}} to deploy a virtual server instance running PowerAI on Power CPU in {{site.data.keyword.vpc_full}}.
* Train and test an image classification model.
* Augment the VPC environment by deploying an image classification application to a new virtual server instance.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.bplong_notm}}](https://{DomainName}/schematics/overview)
* [{{site.data.keyword.vpc_short}}](https://{DomainName}/vpc/provision/vpc)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![Architecture](images/solution53-powerai-vision-hidden/architecture_diagram.png)

1. Admin uses {{site.data.keyword.bpshort}} and a Terraform template to provision a virtual server instance running PowerAI Vision.
1. Once the environment is provisioned, the admin deploys a deep learning model(API) for image classification.
1. Admin deploys a web application to a front-end subnet on the same {{site.data.keyword.vpc_short}} through {{site.data.keyword.bplong_notm}}.
1. User uploads an image to the front-end web app for classification
1. The front-end communicates with the backend, sending and receiving images for classification and displaying the results on the web page.

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
  * vpc-infrastructure/infrastructure-service plugin
* Obtain an [IBM Cloud API key](https://{DomainName}/iam/apikeys) and save the key for future reference.

## Provision a virtual server instance with Power AI Vision using {{site.data.keyword.bpshort}}
{:#provision_VPC_backend_vsi}

In this section, you will provision a VPC with PowerAI Vision installed on a virtual server instance via {{site.data.keyword.bplong_notm}} service. {{site.data.keyword.bplong_notm}} delivers Terraform-as-a-Service so that you can use a high-level scripting language to model the resources that you want in your {{site.data.keyword.Bluemix_notm}} environment, and enable Infrastructure-as-Code (IaC).

### Create a {{site.data.keyword.bplong_notm}} workspace

1. Navigate to [{{site.data.keyword.bplong_notm}}](https://{DomainName}/schematics/overview) overview page, and click on **Create a workspace**.
1. Set **Workspace name** to **powerai-vision-workspace**.
1. Select a resource group.
1. Set **GitHub or GitLab repository URL** to `https://github.com/ibm/vision-terraform`.
1. Click **Retrieve input variables**.
1. Once the input variables have been discovered, set `ibmcloud_api_key` to your {{site.data.keyword.Bluemix_notm}} API key. Other variables can be kept to their default values unless you want to customize the deployed environment.
1. Create the workspace.

### Apply the workspace plan

Once applied, the workspace will lead to the provisioning of:
   - a Virtual Private Cloud (VPC)
   - a backend Subnet
   - a Virtual Server Instance within the VPC and a particular region and availability zone (AZ)
   - a floating IP (FIP) address on the public Internet
   - a security group that allows ingress traffic on port 443 (SSL) and on port 22 (for debug)
   - a SSH keypair - For private key, check the logs. For public key, Refer [this link](https://{DomainName}/vpc-ext/compute/sshKeys).

1. Click on **Apply plan**.
1. Click on **View log** next to the current running plan to follow the logs.
1. Wait for the plan to complete (it may take around 20 minutes) and save the **Outputs** from the log for quick reference.

## Train, deploy and test the image classification model
{: #train_deploy_dl_model}

In this section, you will create a flower data set and train a image classification model based on the flower images uploaded. Once you are happy with the accuracy and other model parameters, you will deploy and test the image classification model.

### Train the model
{: #train_model}

For training the model and testing the deployed model, Download the [Caltech 101 dataset](http://www.vision.caltech.edu/Image_Datasets/Caltech101/) that contains pictures of objects belonging to 101 categories. Unzip and extract the dataset folder.

1. Access the application via the **PowerAI Vision UI** URL saved from the log output and login with the **PowerAI Vision** credentials provided in the log. Click **Get started**.

   Ignore the certificate warning as the SSL certificate is self signed with no potential security threats.
   {:tip}
1. Click **Create new data set**, set the **Data set name** to `flower_classification_dataset` and click **Create**.
1. To add images to the dataset:
   1. Click on the data set tile.
   1. Click on **Import files** and point to the downloaded dataset folder.
   1. Select **lotus** image dataset folder and import the images to be uploaded for classification

   There must be at least **2 categories**.Each category must at least have **5 images**.
   {:tip}
3. Categorize the objects
   - Select at least 5 images of a category type
   - Click **Assign category**, give **Lotus** as the name and click **Assign**
   - Repeat the steps with images from **Sunflower** dataset folder

   If you wish to categorize multiple images, expand **categories** on the left pane, select **Uncategorized**, check **Select** on the top menu bar and then Assign a category.
   {:tip}

4. Click **Train model**
   - Select **Image classification** as your type of training
   - Select **System Default(GoogLeNet)** as your Optimization technique
   - Click **Train model**

### Deploy and test the model
{: #deploy_test_model}

1. Once the training is completed, check the accuracy, model hyperparameters, precision and other details by clicking on **Model details**.
2. Click **Deploy model** to deploy the trained model.
   - Keep the suggested deployed model name.
   - Click **Deploy**.
1. Once the status changes to **Ready**, click on the model **name**.
3. Click on **Copy** under Deployed model API endpoint. Save the endpoint for quick reference.

   To learn more about the exposed APIs reference and their usage, click on **GET** or **POST** next to the endpoint.
   {:tip}

4. To test the deployed model,
   - Click on **Import** and select an image
   - Check the **Results** section to check the category and the confidence value

## Create a web app with {{site.data.keyword.bpshort}} for image classification
{: #create_access_webapp}

In this section, you will deploy a web application to a new VSI and upload an image for classification. An URL is provided for you to access the web app from any browser anywhere.

### Deploy a web app with {{site.data.keyword.bpshort}}
{: #deploy_webapp}

1. Navigate to [Schematics overview page](https://{DomainName}/schematics/overview) and click on **Create a workspace**.
2. Enter **powerai-vision-frontend-workspace** as the Workspace name and select a resource group.
3. Enter the GitHub repository URL - `https://github.ibm.com/portfolio-solutions/powerai-image-classifier/tree/tf-0.11`
4. Click on **Retrieve input variables** and complete the fields
   <table>
    <thead>
        <tr>
            <td><strong>Name</strong></td>
            <td><strong>Description</strong></td>
            <td><strong>Type</strong></td>
            <td><strong>Default</strong></td>
            <td><strong>Override value</strong></td>
            <td><strong>Sensitive</strong></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>ibmcloud_api_key</td>
            <td>Enter the IBM Cloud API key. Use the same API key used with PowerAI vision trial backend</td>
            <td>string</td>
            <td></td>
            <td>ENTER THE KEY HERE without any trailing spaces</td>
            <td>yes</td>
        </tr>
         <tr>
            <td>vpc_id</td>
            <td>Retrieve the VPC ID by running the command - ibmcloud is vpcs</td>
            <td>string</td>
            <td></td>
            <td>ENTER THE ID HERE without any trailing space</td>
            <td></td>
        </tr>
        <tr>
            <td>powerai_vision_api_url</td>
            <td>The URL of backend PowerAI vision trial API</td>
            <td>string</td>
            <td></td>
            <td>ENTER THE URL HERE without any trailing spaces</td>
            <td></td>
        </tr>
        <tr>
            <td>resource_group_name</td>
            <td>Name of the resource group to provision the resources</td>
            <td>string</td>
            <td>default</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>generation</td>
            <td>VPC generation to provision the resources</td>
            <td>string</td>
            <td>2</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>ibmcloud_timeout</td>
            <td>Timeout for API operations in seconds.</td>
            <td>number</td>
            <td>900</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>region</td>
            <td>Should be same as the PowerAI vision region</td>
            <td>string</td>
            <td>us-south</td>
            <td></td>
            <td></td>
        </tr>
         <tr>
            <td>zone</td>
            <td>Should be same as the PowerAI vision zone</td>
            <td>string</td>
            <td>us-south-1</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>basename</td>
            <td>Name for the VPC to create and prefix to use for all other resources</td>
            <td>string</td>
            <td>powerai-vision</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>image_name</td>
            <td>Name of the base image for the virtual server (should be an Ubuntu 18.04 base).Run ibmcloud is images command</td>
            <td>string</td>
            <td>ibm-ubuntu-18-04-1-minimal-amd64-1</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>profile_name</td>
            <td>Name of the instance profile.Run ibmcloud is instance-profiles command</td>
            <td>string</td>
            <td>cx2-2x4</td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
   </table>
5. Click on **Create** to create the workspace.
6. On the subsequent page, Click **Apply plan** to provision
   * a front-end subnet
   * VSI within the front-end subnet to deploy the web app
   * Floating IP (FIP) address on the public Internet for the front-end subnet to access the web app
   * Security group with rules that allows ingress traffic on port 22 (for SSH), HTTP requests on port 80 , HTTP requests on port 3000 to allow nodeJS traffic and HTTPS on port 443.
   * a SSH keypair - For private key, check the logs. For public key, Refer [this link](https://{DomainName}/vpc-ext/compute/sshKeys)
7. Click on **View log** next to the current running plan to follow the logs.
8. Wait for the plan to complete and check the **Outputs** from the log for the application access URL. In a browser, enter `http://<Floating_IP>:3000` to see the front-end web app that calls the deployed model via an API call.

### Classify images
{: #classify_images}

1. Click on **Upload a JPEG image** to select a `.JPEG` or `.JPG` image from your machine.
2. Click on **Classify image** to see the response from the deployed model.
3. Check the category and confidence output.
4. Repeat the above steps with images of different categories.

## Remove resources
{: #cleanup}

1. Navigate to [{{site.data.keyword.bpshort}}]([https://{DomainName}/schematics/workspaces) workspaces.
2. Click on the action menu next to each of the workspaces.
3. Click on **Delete**, check all the Delete options, enter the name of the workspace and click **Delete** to cleanup all the provisioned resources.

## Related resources
{: #related_resources}

* [Introduction to computer vision using PowerAI Vision](https://developer.ibm.com/articles/introduction-powerai-vision/)
* If you wish to log into the respective servers for debugging or troubleshooting using the generated SSH keypair, check this [VPC tutorial](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server#test-your-bastion)