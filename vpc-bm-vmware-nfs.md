---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-05-05"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, vmwaresolutions, vpc-file-storage
account-plan: paid
completion-time: 1h
use-case: ApplicationModernization
---
{{site.data.keyword.attribute-definition-list}}

# Provision NFS storage and attach to cluster
{: #vpc-bm-vmware-nfs}
{: toc-content-type="tutorial"}
{: toc-services="vpc, vmwaresolutions, vpc-file-storage"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

File Storage in {{site.data.keyword.vpc_short}} is available for customers with special approval to preview this service in the selected regions. Contact your IBM Sales representative if you are interested in getting access.
{: beta}


This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}

In this tutorial, an NFS file share is created in {{site.data.keyword.vpc_short}} and it is attached to a VMware cluster as a Datastore. This phase is optional, if you use vSAN as your preferred storage option.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nfs-objectives}

In this tutorial, an {{site.data.keyword.vpc_short}} file share is created and you will attach this to the VMware Cluster as a datastore via NFS.

![NFS as a Datastore](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-VPC-nfs.svg "NFS as a Datastore"){: caption="Figure 1. NFS as a Datastore" caption-side="bottom"}

1. Create file share in {{site.data.keyword.vpc_short}}
2. Attach file share as a Datastore for a Compute Cluster in vCenter


## Before you begin
{: #vpc-bm-vmware-nfs-prereqs}

This tutorial requires:

* Common [prereqs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision {{site.data.keyword.bm_is_short}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)

[Login](/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the Jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}

The used variables e.g. $VMWARE_VPC are defined in the previous steps of this tutorial.
{: note}

## Create file share in {{site.data.keyword.vpc_short}}
{: #vpc-bm-vmware-nfs-createfileshare}
{: step}

To Create a file share in {{site.data.keyword.vpc_short}} you can use either CLI or UI (or API). 

1. The following provides the reference when using CLI:

   ```sh
   ibmcloud is share-create --help
   ```
   {: codeblock}

1. Check the available share profiles, and you can use the following command.

   ```sh
   ibmcloud is share-profiles
   ```
   {: codeblock}

   Example:
   ```bash
   ibmcloud is share-profiles
   Listing file share profiles in region eu-de under account IBM Cloud Acc as user xxx@yyy.com...
   Name          Family   
   custom-iops   custom   
   tier-3iops    tiered   
   tier-5iops    tiered
   tier-10iops   tiered 
   ```
   {: screen}

2. Create a file share.

   In this example, a 1TB with 10IOPS/GB file share is created with using the previously created {{site.data.keyword.vpc_short}} as a targe. Record the file share's and the file share target's IDs.

   ```sh
   VMWARE_DATASTORE01=$(ibmcloud is share-create --name vmware-nfs-datastore-01 --zone eu-de-1 --profile tier-10iops --size 1000 --targets '[{"name": "vmware-cluster-01", "vpc": {"id": "'$VMWARE_VPC'"}}]' --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_DATASTORE01_TARGET01=$(ibmcloud is share $VMWARE_DATASTORE01 --output json | jq -r .targets[0].id)
   ```
   {: codeblock}

3. For mounting to the server, you need to get the defined target's NFS mount path.

   ```sh
   VMWARE_DATASTORE01_TARGET01_MOUNTPATH=$(ibmcloud is share-target $VMWARE_DATASTORE01 $VMWARE_DATASTORE01_TARGET01 --output json | jq -r .mount_path)
   ```
   {: codeblock}
   
   ```sh
   echo "Mount path is : "$VMWARE_DATASTORE01_TARGET01_MOUNTPATH
   ```
   {: codeblock}

   vCenter needs the values separated for mount path, server and folder. You can use the following commands to get the required values:

   ```sh
   echo "Server : "$(echo $VMWARE_DATASTORE01_TARGET01_MOUNTPATH | awk -F: '{print $1}')
   ```
   {: codeblock}

   ```sh
   echo "Folder : "$(echo $VMWARE_DATASTORE01_TARGET01_MOUNTPATH | awk -F: '{print $2}')
   ```
   {: codeblock}

4. Use the **Server** and **Folder** values when configuring the datastore in vCenter.


## Attach {{site.data.keyword.vpc_short}} File share as a Datastore for a Compute Cluster in vCenter
{: #vpc-bm-vmware-nfs-attachfileshare}
{: step}

In the vSphere Client object navigator, browse to a host, a cluster, or a data center.

1. From the right-click menu, select Storage > **New Datastore**.
2. Select **NFS** as the datastore type and specify an NFS version as `NFS 4.1`.
3. Enter the datastore parameters: Datastore name, Folder and Server. With NFS 4.1, you can add multiple IP addresses or server names if the NFS server supports trunking, IBM Cloud uses multiple IPs behind the provided FQDN. The ESXi host uses these values to achieve multipathing to the NFS server mount point.
4. On Configure Kerberos authentication selection, select **Don't use Kerberos authentication**.
5. On Host Accessibility, select **all hosts on your cluster**.
6. Review the configuration options and click **Finish**.

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
{: screen}

Your hosts will access NFS share using the ESXi hosts' management interfaces (PCI NICs) with this setup. This is for simplicity for this non-production setup.  
{: note}

## Next steps
{: #vpc-bm-vmware-nfs-next-steps}

The next step in the tutorial series is:

* OPTIONAL: [Provision vSAN storage cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan)
* [Provision {{site.data.keyword.vpc_short}} Subnets and configure Distributed Virtual Switch Portgroups for VMs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-newvm#vpc-bm-vmware-newvm)
* [Provision {{site.data.keyword.vpc_short}} Public Gateways and Floating IPs for VMware Virtual Machines](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-pgwip#vpc-bm-vmware-pgwip)
