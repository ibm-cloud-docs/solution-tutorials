---
copyright:
  years: 2019
lastupdated: "2019-03-06"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}

# VPC/VPN gateway for secure and private on premises access to cloud resources
{: #vpc-vpn}

IBM will be accepting a limited number of customers to participate in an Early Access program to VPC starting in early April, 2019 with expanded usage being opened in the following months. If your organization would like to gain access to IBM Virtual Private Cloud, please complete this [nomination form](https://{DomainName}/vpc){: new_window} and an IBM representative will be in contact with you regarding next steps.
{: important}

This tutorial walks you through creating a new {{site.data.keyword.vpc_full}} (VPC) and the associated resources like subnets, network Access Control Lists ACLs, Security Groups and Virtual Server Instance (VSI). 
Then a secure Virtual Private Network (VPN) gateway will be created within the VPC (VPC/VPN gateway).
The VPC/VPN gateway will establish a [IPsec](https://en.wikipedia.org/wiki/IPsec) site-to-site link to an on premises VPN gateway.
The IBM Cloud Object Storage, COS, service has a Cloud Service Endpoint, CSE, that can be used for private no cost egress within the IBM cloud.
Egress charges for data to on premises will still be incurred.
To further demonstrate secure and private access a microservice will be deployed on a VPC/VSI to access COS representing a line of business application.
An on premises computer that can access COS with all traffic flowing through the VPN and privately through IBMs cloud.

There are many popular on premises VPN site-to-site gateways available.
This tutorial demonstrates a VPC/VPN gateway connection to the popular [strongSwan](https://www.strongswan.org/) VPN Gateway.
The strongSwan gateway will be installed on a VSI in the IBM cloud,
definitely not the most effective way for inter cloud communication,
but ideal for demonstrating the configuration of a typical on premises VPN Gateway.

{:shortdesc}
In short, using VPC/VPN Gateway and CSE you can

- connect your on premises computers to workloads running in the cloud
- insure private and low cost connectivity to cloud services

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

1. After setting up the required infrastructure (subnets, security groups with rules, VSIs) on the cloud, the admin (DevOps) connects (SSH) to the VSI using the private SSH key and installs the microservice software and verifies it is working
1. A vsi with associated floating-ip will be provisioned to hold the open source VPN Gateway, note the public ip address
1. A VPC/VPN Gateway is provisioned, note the public IP address
1. Configure both the VPC/VPN Gateway and open source VPN Gateway connections with each others public ip addresses
1. Verify connectivity through the VPN Gateways by accessin the microservice directly through the vpn site-to-site connection


## Before you begin

{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc/vpc-user-permissions.html).

- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc/getting-started.html#prerequisites).

## Create a Virtual Private Cloud
{: #create-vpc}

To create your own {{site.data.keyword.vpc_short}},

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
1. Under **New virtual private cloud** section:  
   * Enter **pfqIA** as name for your VPC.  
   * Select a **Resource group**.  
1. Under **New subnet for VPC**:  
   * As a unique name enter **pfqIAleft**.  
   * Select a location.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
1. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
1. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click on **All virtual private clouds** breadcrumb, then select **Subnets** tab and wait until the status changes to **Available**. You can create a new subnet under the **Subnets** tab.

1. Click **New subnet**
1. In the New Subnet for VPC
   * As a unique name enter **pfqIAright**.  
   * Select the VPC created above from the Virual Private Cloud drop down
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.1.0/24**. Leave the remaining fields unchanged.


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
