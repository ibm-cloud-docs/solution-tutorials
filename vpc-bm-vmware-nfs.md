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
completion-time: 1h
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

# Deploy and Configure NFS for VMware Cluster in VPC
{: #vpc-bm-vmware-nfs}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

In this tutorial, an NFS file share is created in VPC and it is attached to a VMware cluster as a Datastore.
{:shortdesc}

Important. This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives). 
{:important}

Note. This phase is optional, if you use vSAN as your preferred storage option.
{:note}

## Objectives
{: #vpc-bm-vmware-nfs-objectives}

In this tutorial, an NFS file share is created in VPC and you will attach this to the VMware Cluster as a datastore. 

![NFS as a Datastore](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-VPC-nfs.png "NFS as a Datastore"){: caption="Figure 1. NFS as a Datastore" caption-side="bottom"}

1. Create file share in VPC
2. Attach file share as a Datastore for a Compute Cluster in vCenter

## Before you begin
{: #vpc-bm-vmware-nfs-prereqs}

This tutorial requires:
* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

Important. This tutorial is part of series, and requires that you have completed the related tutorials.
{:important}

Make sure you have successfully completed the required previous steps
* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)

[Login](https://cloud.ibm.com/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region.


## Create file share in VPC
{: #vpc-bm-vmware-nfs-createfileshare}
{: step}

To create a file share in VPC, either CLI or UI (or API) can be used. The following provides the reference when using CLI:

```bash
$ ibmcloud is share-create --help
NAME:
    share-create - [Beta] Create a file share
  
USAGE:
    ibmcloud is share-create --zone ZONE_NAME --profile PROFILE --size SIZE [--name NAME] [--targets TARGETS_JSON | @TARGETS_JSON_FILE] [--resource-group-id RESOURCE_GROUP_ID | --resource-group-name RESOURCE_GROUP_NAME] [--output JSON] [-q, --quiet]

EXAMPLE:
    ibmcloud is share-create --name my-file-share --zone us-south-1 --profile tier-3iops --size 40
    ibmcloud is share-create --name my-file-share --zone us-south-1 --profile tier-3iops --size 40 --targets '[{"name": "my-target1", "vpc": {"id": "84710432-9473-4a29-b67d-9d0c92eecf6f"}}, {"name": "my-target2", "vpc": {"id": "93ee28fc-2d6c-4b56-b55d-ec8586042963 "}}]'
    ibmcloud is share-create --name my-file-share --zone us-south-1 --profile tier-3iops --size 40 --output JSON
  
OPTIONS:
    --name value                 The user-defined name for this file share.
    --zone value                 Name of the zone
    --profile value              The profile the file share uses
    --size value                 The size of the file share rounded up to the next gigabyte. (default: 0)
    --targets value              TARGETS_JSON|@TARGETS_JSON_FILE, file share targets in JSON or JSON file
    --resource-group-id value    ID of the resource group. This option is mutually exclusive with --resource-group-name
    --resource-group-name value  Name of the resource group. This option is mutually exclusive with --resource-group-id
    --output value               Specify output format, only JSON is supported. One of: JSON.
    -q, --quiet                  Suppress verbose output
```

To see the available storage profiles, use the following command.

```bash
$ ibmcloud is share-profiles
Listing file share profiles in region eu-de under account IBM Cloud Acc as user xxx@yyy.com...
Name          Family   
custom-iops   custom   
tier-3iops    tiered   
tier-5iops    tiered
tier-10iops   tiered 
```

In this example, a 1TB 10 IOPS/GB file share is created with using the previously created VPC as a targe. Record the file share's and the file share target's IDs.

```bash
VMWARE_DATASTORE01=$(ibmcloud is share-create --name vmware-nfs-datastore-01 --zone eu-de-1 --profile tier-10iops --size 1000 --targets '[{"name": "vmware-cluster-01", "vpc": {"id": "'$VMWARE_VPC'"}}]' --output json | jq -r .id)
VMWARE_DATASTORE01_TARGET01=$(ibmcloud is share $VMWARE_DATASTORE01 --output json | jq -r .targets[0].id)
```

For mounting to the server, you need to get the defined target's NFS mount path.

```bash
VMWARE_DATASTORE01_TARGET01_MOUNTPATH=$(ibmcloud is share-target $VMWARE_DATASTORE01 $VMWARE_DATASTORE01_TARGET01 --output json | jq -r .mount_path)
echo "Mount path is : "$VMWARE_DATASTORE01_TARGET01_MOUNTPATH
echo "Server : "$(echo $VMWARE_DATASTORE01_TARGET01_MOUNTPATH | awk -F: '{print $1}')
echo "Folder : "$(echo $VMWARE_DATASTORE01_TARGET01_MOUNTPATH | awk -F: '{print $2}')
```

Use the Server and Folder values when configuring the datastore in vCenter.


## Attach VPC File share as a Datastore for a Compute Cluster in vCenter
{: #vpc-bm-vmware-nfs-createfileshare}
{: step}

In the vSphere Client object navigator, browse to a host, a cluster, or a data center.

1. From the right-click menu, select Storage > New Datastore.
2. Select NFS as the datastore type and specify an NFS version as NFS 4.1.
3. Enter the datastore parameters: Datastore name, Folder and Server. With NFS 4.1, you can add multiple IP addresses or server names if the NFS server supports trunking, IBM Cloud uses multiple IPs behind the provided FQDN. The ESXi host uses these values to achieve multipathing to the NFS server mount point.
4. On Configure Kerberos authentication selection, select Don't use Kerberos authentication.
5. On Host Accessibility, select all hosts on your cluster.
6. Review the configuration options and click Finish.

The following parameters were used in this example.

```bash
General 
Name:  Datastore-VPC-NFS-01
Type:  NFS 4.1

NFS settings
Server:  fsf-fra0251a-fz.adn.networklayer.com
Folder:  /nxg_s_voll_mz02b7_7e070ef6_12f5_4794_9077_953ba53dde82
Access Mode:  Read-write
Kerberos:  Disabled

Hosts that will have access to this datastore
Hosts:  esx-001.vmware.ibmcloud.local, esx-002.vmware.ibmcloud.local, esx-003.vmware.ibmcloud.local 
```

Note. Your hosts will access NFS share using the PCI NICs with this setup. This is for simplicity for this non-production setup.  
{:note}