---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-08-30"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, vmwaresolutions
account-plan: paid
completion-time: 8h
---

{:step: data-tutorial-type='step'}
{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}
{:deprecated: .deprecated}
{:important: .important}
{:note: .note}
{:tip: .tip}
{:preview: .preview}
{:beta: .beta}

# Deploying Roll Your Own VMware on VPC Bare Metal Servers
{: #vpc-bm-vmware}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="8h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This is a Beta feature that requires special approval. Contact your IBM Sales representative if you are interested in getting access.
{: beta}

IBM Cloud™ has a number of [offerings for VMware deployments in Classic](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-getting-started#getting-started-depl-offerings). These can be classified and described as:

1. Automated vSphere Hypervisor Image deployment ([IBM Cloud bare metal servers with VMware vSphere](https://{DomainName}/docs/vmware?topic=vmware-vmware-getting-started))
2. Automated vSphere Hypervisor Image deployment, installation and configuration ([VMware Solutions Dedicated - VMware vSphere®](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vs_vsphereclusteroverview))
3. Automated vCenter and vSphere clusters deployment, installation and configuration ([VMware Solutions Dedicated - vCenter Server](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vc_vcenterserveroverview))

[Bare metal servers on IBM Cloud™ Virtual Private Cloud (VPC)](https://{DomainName}/docs/vpc?topic=vpc-about-bare-metal-servers) environment provide a new option to deploy VMware on IBM Cloud. Currently the IBM Cloud™ VPC environment provides only the automated vSphere Hypervisor (ESXi) Operating System image deployment to Intel Bare Metals on VPC. Therefore, you need to manually install and configure the required VMware components, such as ESXi hosts, vCenter, vSAN or NSX-T components.

This tutorial walks you through creating your own IBM Cloud™ VPC with multiple subnets as required to support vSphere networking and the provisioning of bare metal servers (BMS) for a basic VMware vSphere deployment. After the VPC and bare metal servers have been provisioned, the tutorial covers a manual deployment of the vCenter, creating VMware compute cluster with vSAN or NFS shared storage options. The tutorial also covers optional features, such as using VPC network for VMware Virtual Machine networking.
{: shortdesc}

This tutorial assumes a working knowledge of VMware vSphere Hypervisor and vCenter Server 7.0 as well as IBM Cloud™ zones, regions, prefixes, subnets and security groups that build the base VPC networking and are used to support the vSphere deployment. More information about VMware products can be found in [VMware Docs](https://docs.vmware.com). VPC concepts and the networking constructs are explained in the [VPC pages of the IBM Cloud™ Docs](https://{DomainName}/docs/vpc?topic=vpc-getting-started). More information about planning and deploying bare metal servers on VPC can be found in the [Bare metal server section of VPC pages](https://{DomainName}/docs/vpc?topic=vpc-planning-for-bare-metal-servers).  
{: note}

## Objectives
{: #vpc-bm-vmware-objectives}

* Understand the Virtual Private Cloud infrastructure used for VMware vSphere deployment.
* Create a VPC, subnets and bare metal server instances for a vSphere deployment.
* Manually deploy vCenter and create a compute cluster.
* Create shared storage for your compute cluster either by using vSAN or VPC file share (NFS).
* Use VPC networking for your VMware Virtual Machines.

The following diagram presents an overview of the base deployment in IBM Cloud VPC. The deployment is based on bare metal servers on IBM Cloud VPC and uses [subnets](https://{DomainName}/docs/vpc?topic=vpc-about-networking-for-vpc) to host the servers' network interfaces and [access control lists and security groups](https://{DomainName}/docs/vpc?topic=vpc-security-in-your-vpc) to secure the network access. VMware vSAN with local ESXi host embedded SSDs or IBM Cloud VPC file share are the storage options for datastores to be used for VMware Virtual Machines. VPC subnets can also be used to host network interfaces of VMware Virtual machines. 

![Architecture Overview - Base Deployment](images/solution63-ryo-vmware-on-vpc-hidden/Self-Managed-Simple-20210813v1-Non-NSX-based.svg "Architecture Overview - Base Deployment"){: caption="Figure 1. Architecture Overview - Base Deployment" caption-side="bottom"}

You need to plan and decide your VPC networking solution for the VMware deployment before you start. This tutorial provides a simple example where a fully dedicated IBM Cloud™ Virtual Private Cloud is created for the VMware deployment, but you may customise your network solution if you so wish. You may also use [IBM Cloud interconnectivity ](https://{DomainName}/docs/vpc?topic=vpc-interconnectivity) options. These are recommended for advanced users only.
{: important}

You need to plan / decide your VMware deployments storage solution before you order the bare metal servers. If you use NFS backed VPC file share as the primary storage, you can start with a minimum of 2 bare metal servers with and select a [profile](https://{DomainName}/docs/vpc?topic=vpc-bare-metal-servers-profile) starting with 'bx2-', which includes a local SATA M.2 mirrored drive. If you plan to use vSAN, you need to select a minimum of 3 bare metal servers with and select a [profile](https://{DomainName}/docs/vpc?topic=vpc-bare-metal-servers-profile) starting with 'bx2d-', which includes a local SATA M.2 mirrored drive and a number of NVMe U.2 SSDs.  
{: important}

Deploying VMware on VPC requires multiple steps. Follow the steps below for an initial setup for your base VMware Deployment.

1. [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
2. [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
3. [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
4. [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)

After vCenter and the base setup has been completed, you can create storage for your cluster based on your preference.

1. OPTIONAL: [Provision vSAN storage cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan)
2. OPTIONAL: [Provision NFS storage and attach to cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)

When using VPC subnets for your VMware Virtual Machines, follow these additional steps to setup your VMware Virtual Machine networking.

1. [Provision VPC Subnets and configure Distributed Virtual Switch Portgroups for VMs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-newvm#vpc-bm-vmware-newvm)
2. [Provision VPC Public Gateways and Floating IPs for VMware Virtual Machines](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-pgwip#vpc-bm-vmware-pgwip)

## Before you begin
{: #vpc-bm-vmware-prereqs}

Make sure you understand the [IBM Cloud VPC concepts](https://{DomainName}/vpc-ext/overview) and [VPC bare metal server capabilities](https://{DomainName}/docs/vpc?topic=vpc-planning-for-bare-metal-servers).

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
   * Setup up an IBM Cloud account, see [Getting Started](https://{DomainName}/docs/account?topic=account-account-getting-started).
   * Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources and managing bare metal servers. See the list of [required permissions  for VPC](https://{DomainName}/docs/vpc?topic=vpc-managing-user-permissions-for-vpc-resources) and [prerequisites for creating bare metal servers on VPC](https://{DomainName}/docs/vpc?topic=vpc-creating-bare-metal-servers#prereq).
   * [Setup](https://{DomainName}/docs/account?topic=account-userapikey&interface=ui)  an API key.
* {{site.data.keyword.cloud_notm}} CLI,
   * Install {{site.data.keyword.cloud_notm}} command line (CLI) tooling. See [Getting started with the IBM Cloud CLI](https://{DomainName}/docs/cli).
   * Install {{site.data.keyword.vpc_short}} plugin (`vpc-infrastructure`)
   * Install {{site.data.keyword.vpc_short}} plugin (`cloud-dns-services`)
* Install `jq` i.e. [json query](https://stedolan.github.io/jq/) on your workstation used to query JSON files.
* SSH key
   * Create an SSH key on your workstation and [import](https://{DomainName}/docs/vpc?topic=vpc-ssh-keys) it to the VPC. 
   * If you don't already have an SSH key, see the [instructions](https://{DomainName}/docs/vpc?topic=vpc-ssh-keys#locating-ssh-keys) for creating a key for VPC.

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}
<!--#/istutorial#-->


[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key.

Specify the target resource group for your resources. You can list the available resource groups with the following command.

```bash
ibmcloud resource groups
Retrieving all resource groups under account 1b0834ebce7f4b94983d856f532ebfe2 as xxx@yyy.com...
OK
Name           ID                                 Default Group   State   
default        28b0e7d18da9417ea85b2ba308088657   true            ACTIVE 
```

If you want to use the 'default' resource group, you can set your target resource group with the following command: 

```sh
VMWARE_RG=$(ibmcloud resource groups --output json | jq -r '.[] | select(.name == "default")'.id)
```
{: codeblock}

If you want to create a new resource group for your VMware assets e.g. with a name 'VMware', you can use the following commands:

```sh
VMWARE_RG_NAME="VMware"
```
{: codeblock}

```sh
VMWARE_RG=$(ibmcloud resource group-create $VMWARE_RG_NAME --output json | jq -r .id)
```
{: codeblock}

Then set your target to the wanted resource group.

```sh
ibmcloud target -g $VMWARE_RG
```
{: codeblock}

## Next Steps
{: #vpc-bm-vmware-next-steps}

The next step in the tutorial series is:

* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
