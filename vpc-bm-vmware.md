---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2021-01-05"
lasttested: "2019-03-08"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: service1, service2
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
{:beta}

IBM Cloud™ has a number of [offerings for VMware deployments in Classic](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-getting-started#getting-started-depl-offerings). These can be described as:

1. Automated vSphere OS Image deployment ([IBM Cloud Baremetal Servers with VMware vSphere](https://{DomainName}/docs/vmware?topic=vmware-vmware-getting-started))
2. Automated vSphere OS Image deployment, Installation and Configuration ([VMware Solutions Dedicated - VMware vSphere®](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vs_vsphereclusteroverview))
3. Automated vCenter and vSphere clusters deployment, installation and configuration ([VMware Solutions Dedicated - vCenter Server](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vc_vcenterserveroverview))

[Baremetal servers on IBM Cloud™ Virtual Private Cloud (VPC)](https://{DomainName}/docs/vpc?topic=vpc-about-bare-metal-servers) environment provide a new option to deploy VMware on IBM Cloud. Currently the IBM Cloud™ VPC environment provides only the Automated vSphere OS Image deployment to Intel Bare Metals on VPC. Therefore, you need to manually install and configure the other required VMware components, such as vCenter, vSAN or NSX-T components.

This tutorial walks you through creating your own VPC with multiple subnets which are necessary to support different vSphere networking requirements and the provisioning of baremetal servers (BMS) on VPC for a basic VMware vSphere deployment. Manual deployment of the vCenter, creating VMware compute cluster with vSAN and NFS shared storage options are the basic essentials covered. The guide also covers optional features, such as using VPC network for VMware Virtual Machine networking.

This tutorial assumes a working knowledge of IBM Cloud™ zones, regions, prefixes, subnets and security groups that build the base VPC networking and are used to support the vSphere deployment. More information about VPC concepts and the networking constructs are found in the [VPC pages of the IBM Cloud™ Docs](https://{DomainName}/docs/vpc?topic=vpc-getting-started). More information about deploying Bare metal servers on VPC can be found in the [Bare metal server section of VPC pages](https://{DomainName}/docs/vpc?topic=vpc-planning-for-bare-metal-servers).
{:shortdesc}


## Objectives
{: #vpc-bm-vmware-objectives}

* Understand the VPC infrastructure used for VMware vSphere deployment and deploy vSphere in your VPC.
* Create a virtual private cloud, subnets and bare metal server instances for a vSphere deployment.
* Manually deploy vCenter and create a compute cluster.
* Create shared storage for your compute cluster either by using vSAN or VPC file share.

The following diagram presents an overview of the base deployment in IBM Cloud VPC. The deployment is based on bare metal servers on IBM Cloud VPC and uses [subnets](https://{DomainName}/docs/vpc?topic=vpc-about-networking-for-vpc) to host the servers' network interfaces and [access control lists and security groups](https://{DomainName}/docs/vpc?topic=vpc-security-in-your-vpc) to secure the network access. VMware vSAN with local ESXi host embedded SSDs or IBM Cloud VPC File Storage are storage options for datastores to be used for VMware Virtual Machines. VPC subnets can also be used to host network interfaces of VMware Virtual machines. This forms the base deployment for the VMware solution in VPC.

![Architecture Overview - Base Deployment](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-Non-NSX-based.svg "Architecture Overview - Base Deployment"){: caption="Figure 1. Architecture Overview - Base Deployment" caption-side="bottom"}

Important. Deploying VMware on VPC requires multiple steps. Follow the steps below for an initial setup for your base VMware Deployment.
{:important}

1. [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
2. [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
3. [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
4. [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)

After vCenter and the base setup has been completed, you can create storage for your cluster based on your preference.

Important. If you plan to use vSAN as your storage, you need to select a compatible bare metal server profile with local SSDs when ordering the server.
{:important}

1. OPTIONAL: [Provision vSAN storage cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan)
2. OPTIONAL: [Provision NFS storage and attach to cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)

When using VPC subnets for your VMware Virtual Machines, follow additional steps after your base VMware deployment to setup your VMware Virtual Machine networking:

1. [Provision VPC Subnets and configure Distributed Virtual Switch Portgoups for VMs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-newvm#vpc-bm-vmware-newvm)
2. [Provision VPC Public Gateways and Floating IPs for VMware Virtual Machines](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-pgwip#vpc-bm-vmware-pgwip)


## Before you begin
{: #vpc-bm-vmware-prereqs}

Make sure you understand the [IBM Cloud VPC concepts](https://{DomainName}/vpc-ext/overview) and [VPC bare metal server capabilities](https://{DomainName}/docs/vpc?topic=vpc-planning-for-bare-metal-servers).

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
  * Setup up an IBM Cloud account, see [Getting Started](https://{DomainName}/docs/account?topic=account-account-getting-started).
  * Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources and managing Baremetal servers. See the list of [required permissions  for VPC](https://{DomainName}/docs/vpc?topic=vpc-managing-user-permissions-for-vpc-resources) and [prerequisites for creating bare metal servers on VPC](https://{DomainName}/docs/vpc?topic=vpc-creating-bare-metal-servers#prereq).
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
{:tip}
<!--#/istutorial#-->


[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key.

Specify the target resource group for your resources. You can list the available resource groups with the following command.

```bash
$ ibmcloud resource groups
Retrieving all resource groups under account 1b0834ebce7f4b94983d856f532ebfe2 as xxx@yyy.com...
OK
Name           ID                                 Default Group   State   
default        28b0e7d18da9417ea85b2ba308088657   true            ACTIVE 
```

If you want to use the 'default' resource group, you can set your target resource group with the following command: 

```bash
VMWARE_RG=$(ibmcloud resource groups --output json | jq -r '.[] | select(.name == "default")'.id)
ibmcloud target -g $VMWARE_RG
```

If you want to create a new resource group for your VMware assets e.g. with a name 'VMware', you can use the following command:

```bash
VMWARE_RG_NAME="VMware"
VMWARE_RG=$(ibmcloud resource group-create $VMWARE_RG_NAME --output json | jq -r .id)
ibmcloud target -g $VMWARE_RG
```