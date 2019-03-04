---
copyright:
  years: 2019
lastupdated: "2019-03-01"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}

# VPC, VPN and service consumption
{: #vpc-vpn}

IBM will be accepting a limited number of customers to participate in an Early Access program to VPC starting in early April, 2019 with expanded usage being opened in the following months. If your organization would like to gain access to IBM Virtual Private Cloud, please complete this [nomination form](https://{DomainName}/vpc){: new_window} and an IBM representative will be in contact with you regarding next steps.
{: important}

Possible titles:
* Create app with private services on VPC and connect to it through VPN
* End to end private network for your secure app on VPC

This tutorial walks you through connecting an existing {{site.data.keyword.vpc_full}} (VPC) to another computing environment by establishing a secure Virtual Private Network (VPN). Moreover, it shows how your app running on a virtual server instance (VSI) in a VPC can securely use an IBM Cloud service by connecting to it through a private endpoint.

It will demontrate three connectivity options:
* VPC/VPN connected to VPC/VPN
* VPC/VPN connected to on premises VPN
* VPC/VPN connected to classic VPN
(HL: ^^ Do we need all three, does it add anything to the solution?)


Possible flow / toc:
- Make sure that CLI and IaaS plugin are installed.
- Clone GH repo.
- Deploy the basic VPC with bastion and app VSI, related SGs and subnets by script.
- (Either by CLI or UI): Obtain credentials for COS (and provision COS if not present). Copy into credentials file.
- Deploy app to VSI.
- Now, we pick it up in the UI. Walk through steps for setting up VPN.
- Test app in browser if possible. Verify VPN-based access using curl.


{:shortdesc}


## Objectives
{: #objectives}

* Access a virtual private cloud environment from an on-premises data center or (virtual) private cloud
* Securely reach cloud resources using private service endpoints.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.vpn_full}}](https://{DomainName}/vpc/provision/vpngateway)
- [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

The following diagram shows the virtual private cloud consisting of a bastion and an app server. The application utilizes a storage service. SOME MORE DESCRIPTION

<p style="text-align: center;">
  ![Architecture](images/solution46-vpc-vpn/ArchitectureDiagram.png)
</p>

1. The user does this
2. Then that


## Before you begin
{: #prereqs}

1. Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli/index.html#overview). You need the optional CLI infrastructure plugin.

## Deploy a virtual app server in a virtual private cloud

In the following, you will download the script to set up your VPC environment and for a simple app to interface with the storage service.

### Get the code

1. Get the application's code:
   ```sh
   git clone https://github.com/IBM-Cloud/vpc-tutorial
   ```
   {: codeblock}
2. Go to the script directory in the **vpc-tutorial** directory:
   ```sh
   cd secure-file-storage/TODO
   ```
   {: codeblock}

### Set up the VPC resources

TODO: We could extend the script to use an existing VPC. It would complicate cleanup and instructions.
TODO: We need an ssh key.

Execute the setup script. At a minimum, pass in a zone name (e.g., `eu-de-1`or `us-south-2`) and the name of your SSH key for that region.

TODO: Could mention optional naming prefix and resource group.

1. Get the application's code:
   ```sh
   ./vpc-vpn-create-with-bastion.sh ZONE SSH-KEY-NAME
   ```
   {: codeblock}




## Create services
{: #setup}

In this section, you will create the services required to ...

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://{DomainName}/docs/cli/reference/bluemix_cli/download_cli.html#install_use).
    ```sh
    ibmcloud login
    ```
    {: pre}
    ```sh
    ibmcloud target --cf
    ```
    {: pre}
2. Create an instance of [Service A](https://{DomainName}/catalog/services/the-service-name).
  ```sh
  ibmcloud resource service-instance-create service-instance-name service-name lite global
  ```
3. Create an instance of [Service B](https://{DomainName}/catalog/services/the-service-name).

## Solution Specific Section
{: #section_one}

Introductory statement that overviews the section

1. Step 1 Click **This** and enter your name.

  This is a tip.
  {:tip}

2. Keep each step as short as possible.
3. Do not use blank lines between steps except for tips or images.
4. *Avoid* really long lines like this one explaining a concept inside of a step. Do not offer optional steps or FYI inside steps. *Avoid* using "You can do ...". Be prescriptive and tell them exactly what to do succinctly, like a lab.
5. Do not use "I", "We will", "Let's", "We'll", etc.
6. Another step
7. Try to limit to 7 steps.

### A sub section

   ```bash
   some shellscript
   ```
   {: pre}




## Another Solution Specific Section
{: #section_two}

Introductory statement that overviews the section


## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{: #related}

* [Relevant links](https://blah)
