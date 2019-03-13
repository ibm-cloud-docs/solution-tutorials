---
copyright:
  years: 2019
lastupdated: "2019-03-13"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}

# Use a VPC/VPN gateway for secure and private on-premises access to cloud resources
{: #vpc-site2site-vpn}

IBM will be accepting a limited number of customers to participate in an Early Access program to VPC starting in early April, 2019 with expanded usage being opened in the following months. If your organization would like to gain access to IBM Virtual Private Cloud, please complete this [nomination form](https://{DomainName}/vpc){: new_window} and an IBM representative will be in contact with you regarding next steps.
{: important}

IBM offers a number of ways to securely extend an on-premises computer network with resources in the IBM cloud. It allows you to benefit from the elasticity of provisioning servers when you need them and removing them when no longer required. Moreover, you can easily and securely connect your on-premises capabilities to the {{site.data.keyword.cloud_notm}} services.

This tutorial walks you through connecting an on-premises Virtual Private Network (VPN) gateway to a cloud VPN created within a VPC (a VPC/VPN gateway). First, you will create a new {{site.data.keyword.vpc_full}} (VPC) and the associated resources like subnets, network Access Control Lists (ACLs), Security Groups and Virtual Server Instance (VSI). 
The VPC/VPN gateway will establish an [IPsec](https://en.wikipedia.org/wiki/IPsec) site-to-site link to an on-premises VPN gateway. The IPsec and the [Internet Key Exchange](https://en.wikipedia.org/wiki/Internet_Key_Exchange), IKE, protocols are proven open standards for secure comunication. To further demonstrate secure and private access, you will deploy a microservice on a VPC/VSI to access {{site.data.keyword.cos_short}} (COS), representing a line of business application.
The COS service has a Cloud Service Endpoint (CSE), that can be used for private no cost ingress/egress within {{site.data.keyword.cloud_notm}}. An on-premises computer will access the COS microservice. All traffic will flow through the VPN and privately through {{site.data.keyword.cloud_notm}}.

There are many popular on-premises VPN solutions for site-to-site gateways available. This tutorial utilizes the [strongSwan](https://www.strongswan.org/) VPN Gateway to connect with the VPC/VPN gateway. To simulate an on-premises data center, you will install the strongSwan gateway on a VSI in {{site.data.keyword.cloud_notm}}.

{:shortdesc}
In short, using a VPC with Virtual Private Network gateway and a Cloud Service Endpoint you can

- connect your on-premises computers to workloads running in {{site.data.keyword.cloud_notm}},
- insure private and low cost connectivity to cloud services,
- connect your cloud-based systems to on-premises computers.

## Objectives
{: #objectives}

* Access a virtual private cloud environment from an on-premises data center or (virtual) private cloud.
* Securely reach cloud services using private service endpoints.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.vpn_full}}](https://{DomainName}/vpc/provision/vpngateway)
- [{{site.data.keyword.cos_full}}](https://{DomainName}/catalog/services/cloud-object-storage)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

The following diagram shows the virtual private cloud consisting of a bastion and an app server. The app server hosts a microservice interfacing with {{site.data.keyword.cos_short}} service. A (simulated) on-premises network and the virtual cloud environment are connected via VPN gateways.

![Architecture](images/solution46-vpc-vpn/ArchitectureDiagram.png)

Notes:

1. After setting up the required infrastructure (subnets, security groups with rules, VSIs) on the cloud, the admin (DevOps) connects (SSH) to the VSI using the private SSH key and installs the microservice software and verifies it is working.
1. A VSI with associated floating IP address will be provisioned to hold the open source VPN Gateway. Note the public IP address.
1. A VPC/VPN Gateway is provisioned, note the public IP address.
1. Configure both the VPC/VPN Gateway and open source VPN Gateway connections with each others public ip addresses
1. Verify connectivity through the VPN Gateways by accessin the microservice directly through the vpn site-to-site connection

Possible flow / toc:
- git clone https://github.com/IBM-Cloud/vpc-tutorials
- run shell script to create vpc, subnets, sg, network acl, instances, ...
- explain that there is a second shell script that does the rest of this stuff:
- gui description of how to create resources for cos and vpn (Either by CLI or UI): Obtain credentials for COS (and provision COS if not present). Copy into credentials file.
- on cloud vsi:
  - git clone https://github.com/IBM-Cloud/vpc-tutorials
  - run script for cos micro service
- on strongswan vsi:
  - git clone https://github.com/IBM-Cloud/vpc-tutorials
  - run script to install and configure strong swan
  - curl micro service - works
  - shut down ipsec
  - curl micro service - fails
  - start up ipsec
  - curl micro service - works
- clean up resources


## Before you begin
{: #prereqs}

- Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview). You need the optional CLI infrastructure plugin.
- Login to {{site.data.keyword.cloud_notm}} via the command line. See [CLI Getting Started](https://{DomainName}/docs/cli/reference/ibmcloud?topic=cloud-cli-ibmcloud-cli) for details.
- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc/vpc-user-permissions.html).
- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc/getting-started.html#prerequisites).

## Deploy a virtual app server in a virtual private cloud
In the following, you will download the scripts to set up a baseline VPC environment and code for a microservice to interface with the {{site.data.keyword.cos_short}}. Thereafter, you will provision the {{site.data.keyword.cos_short}} service and set up the baseline.

### Get the code
{: #setup}


1. Get the application's code:
   ```sh
   git clone https://github.com/IBM-Cloud/vpc-tutorials
   ```
   {: codeblock}
2. Go to the scripts for this tutorial by changing into **vpc-tutorials**, then **vpc-site2site-vpn**:
   ```sh
   cd vpc-tutorials/vpc-site2site-vpn
   ```
   {: codeblock}

### Create services
In this section, you will login to {{site.data.keyword.cloud_notm}} on the CLI and create an instance of {{site.data.keyword.cos_short}}.

1. Verify that you have followed the prerequisite steps of logging in
    ```sh
    ibmcloud target
    ```
    {: codeblock}
2. Create an instance of [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage).
   ```sh
   ibmcloud resource service-instance-create vpns2s-cos cloud-object-storage lite global
   ```
   {: codeblock}
3. Create a service key with role **Writer**:
   ```sh
   ibmcloud resource service-key-create vpns2s-cos-key Writer --instance-name vpns2s-cos
   ```
   {: codeblock}
4. Obtain the service key details in JSON format:
   ```sh
   ibmcloud resource service-key vpns2s-cos-key --output json | jq '.[] | .credentials'
   ```
   {: codeblock}
   Copy the output, a JSON object, into a new file **credentials.json** in the subdirectory **vpc-app-cos**. It will be used later on by the app.


### Create a Virtual Private Cloud baseline resources
{: #create-vpc}

The tutorial assumes that you already have a VPC with required subnets, security groups and virtual server instances provisioned. In the following, create these resources by configuring and then running a setup script.

1. Configure TODO
2. Run the script:
    ```sh
   ./vpc-site2site-vpn-baseline-create.sh
   ```
   {: codeblock}

This will result in creating the following resources:
- 1 VPC named ...
- 2 subnets within the VPC
- X security groups with ingress and egress rules
- 2 VSIs


Review the *data.sh* file created.  It has useful information and parameters

### Deploy the microservice

Install and start the small storage app.

## Create the Virtual Private Network gateways

### Create the VPC Virtual Private Network gateway

When the local and remote VPNs connect to each other they will set up a security association using
[IKE](https://en.wikipedia.org/wiki/Internet_Key_Exchange) based on a pre-shared key and then securely communicate using the
[IPsec](https://en.wikipedia.org/wiki/IPsec) protocol.

A VPN gateway working with a local router will forward packets to the remote VPN gateway peer.
The router will be initialized with the CIDR range of the remote network and route packets that match the CIDR to the local VPN gateway.
The local VPN gateway will receive the packets that match the remote CIDR range and forward them to the remote VPN gateway over the IPsec encrypted connection.
The local VPN gateway will receive the packets from the remote VPN gateway that match the local CIDR range and forward them to the local network.

The end result will be an integration of your IBM cloud network of devices and services with your on-premises network fabric.

Each VPN will be configured with the following information:
- Shared secret key - a string of characters, like a password, that must be the same on both VPNs
- IP address of the remote VPN
- CIDR block of the local network that is accessible by the remote network
- CIDR block of the remote network that is accessible by the local network

In addition there will be a collection of IKE and IPsec configuration parameters that the VPNs must agree.

In this tutorial there is a left side (on-premises) and a right side (in the cloud) of the architecture as shown in the diagram above.
The left strongswan vsi can not be configured until the IP address of the remote VPN is known.
So let us create the right side VPC/VPN.
This can be done by simply running the 


1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
1. Under **New virtual private cloud** section:  
   * Enter **vpns2s** as name for your VPC.  
   * Select a **Resource group**.  
1. Under **New subnet for VPC**:  
   * As a unique name enter **vpns2sleft**.  
   * Select a location.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
1. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
1. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click on **All virtual private clouds** breadcrumb, then select **Subnets** tab and wait until the status changes to **Available**. You can create a new subnet under the **Subnets** tab.

1. Click **New subnet**
1. In the New Subnet for VPC
   * As a unique name enter **vpns2sright**.  
   * Select the VPC created above from the Virual Private Cloud drop down
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.1.0/24**. Leave the remaining fields unchanged.


### Create the on-premises Virtual Private Network gateway

### Test the connectivity


## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

* [Relevant links](https://blah)
## Expand the tutorial 
{: #expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- Add a [load balancer](/docs/infrastructure/vpc/console-tutorial.html#creating-a-load-balancer) to distribute inbound microservice traffic across multiple instances.


## Related content
{: #related}

- [VPC Glossary](/docs/infrastructure/vpc/vpc-glossary.html)
- [VPC using the IBM Cloud CLI](/docs/infrastructure/vpc/hello-world-vpc.html)
- [VPC using the REST APIs](/docs/infrastructure/vpc/example-code.html)
- bastion tutorial
