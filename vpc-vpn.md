---
copyright:
  years: 2019
lastupdated: "2019-02-28"

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



{:shortdesc}


## Objectives
{: #objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.vpn_full}}](https://{DomainName}/vpc/provision/vpngateway)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution46-vpc-vpn/ArchitectureDiagram.png)
</p>

1. The user does this
2. Then that

## Before you begin
{: #prereqs}

1. Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli/index.html#overview).

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
