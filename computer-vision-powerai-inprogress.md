---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-11-25"
lasttested: "2019-11-25"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

> **WARNING**: Work in Progress...

# Computer vision with PowerAI and Schematics
{: #computer-vision-powerai-schematics}

This tutorial walks you through how to instantiate a dedicated backend instance(VSI) of PowerAI Vision in {{site.data.keyword.vpc_full}}, deploy the front-end application to a VSI, upload an image dataset, train and deploy an optimized deep learning model using a GPU provisioned on the VSI and classify an image. Once the VM is created on {{site.data.keyword.vpc_short}} using {{site.data.keyword.bplong_notm}}, its public IP address along with the username and password to log into the application will be displayed for easy access.
{:shortdesc}

Cameras are everywhere. Videos and images have become one of the most interesting data sets for artificial intelligence. In particular, deep learning is being used to create models for computer vision, and you can train these models to let your applications recognize what an image (or video) represents.

IBM PowerAI Vision is a new generation video/image analysis platform that offers built-in deep learning models that learn to analyze images and video streams for classification and object detection.
PowerAI Vision includes tools and interfaces that allow anyone with limited skills in deep learning technologies to get up and running quickly and easily. And because PowerAI Vision is built on open source frameworks for modeling and managing containers it delivers a highly available platform that includes application life-cycle support, centralized management and monitoring, and support from IBM.

## Objectives
{: #objectives}

* Understand how to setup PowerAI vision running on Power CPU using {{site.data.keyword.bpshort}}
* Deploy an object detection and image classification application to a VSI on {{site.data.keyword.vpc_short}}
* Upload an image dataset to train and deploy a model

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* PowerAI Vision
* [{{site.data.keyword.bplong_notm}}](https://{DomainName}/schematics/overview)
* [{{site.data.keyword.vpc_short}}](https://{DomainName}/vpc/provision/vpc)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution53-powerai-vision/architecture_diagram.png)
</p>

## Before you begin
{: #prereqs}

1. [Download and configure](https://github.com/IBM-Cloud/terraform-provider-ibm) the IBM Cloud Terraform provider (0.17.3 or later)
2. Obtain your [IBM Cloud API key](https://{DomainName}/iam/apikeys) and save the key for future reference.
3. If you don't have an SSH key on your local machine, [refer to these instructions for creating a key](/docs/vpc?topic=vpc-ssh-keys). By default, the private key is found at `$HOME/.ssh/id_rsa`. [Upload your public SSH key](https://{DomainName}/vpc/compute/sshKeys) to IBM Cloud and save the UUID for future reference.


## Create VPC and other resources with Schematics
{: #vpc_schematics}

{{site.data.keyword.bplong_notm}} delivers Terraform-as-a-Service so that you can use a high-level scripting language to model the resources that you want in your IBM Cloud environment, and enable Infrastructure as Code (IaC). Terraform is an Open Source software that is developed by HashiCorp that enables predictable and consistent resource provisioning to rapidly build complex, multi-tier cloud environments.

1. Navigate to [Schematics overview page](https://{DomainName}/schematics/overview) and click **Create a workspace**.
2. Enter a **Workspace name** and select a resource group.
3. Provide the [GitHub repository URL](https://github.com/abc/abc.git) to import the Terraform template.
4. Click on **Retrieve input variables** and complete the fields
    For the 'ssh_priv_key', on a terminal run `cat ~/.ssh/id_rsa` command and paste the output between `<<EOF` and `EOF`.
   {:tip}
5. Click on **Create** to start creation.
6. On the Schematics page, Click on **Generate Plan**.
7. Once the plan has successfully generated, a new item appears under Recent Activity saying Plan Generated. Click **Apply plan** to provision
   * a VPC
   * Front-end and Back-end subnets
   * VM in each subnet within the VPC and a particular region and availability zone (AZ)
   * Floating IP (FIP) address on the public Internet for the front-end subnet
   * Security group with a rule that allows ingress traffic on port 22 (for SSH)

## Access the frontend webapp
## Train and deploy a deep learning model