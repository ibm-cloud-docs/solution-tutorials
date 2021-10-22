---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-10-22"
lasttested: "2021-10-22"

content-type: tutorial
services: vmwaresolutions
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
{:tip: .tip}
{:pre: .pre}
{:important: .important}
{:note: .note}

# Order vCenter Server cluster w/NSX-T and NFS Storage
{: #vmware-onboarding-order-cluster-storage}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions"}
{: toc-completion-time="20m"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->


## Objectives
{: #vmware-onboarding-order-cluster-storage-objectives}



<!--##istutorial#-->
## Before you begin
{: #vmware-onboarding-order-cluster-storage-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts), 

<!--#/istutorial#-->



## Provision VMware Solutions Dedicated Environment

{: #vmware-onboarding-order-cluster-storage-provision}

{: step}

1. Login to the IBM Cloud and navigate to the IBM Cloud Catalog. Search for and click on the VMware Solutions tile:

   ![Architecture](images/solution-vmware-onboarding-hidden/order-cluster/catalog-tile.png){: class="center"}
   

1. Select the VMware Solutions Dedicate resource.

   ![Architecture](images/solution-vmware-onboarding-hidden/order-cluster/vmware-sol-dedicated-tile.png){: class="center"}
   

1. Cluster to be ordered:

   - A single VMware instance (cluster) to be located in Washington 07
   - vSphere 7.0 with NSX-T
   - 6 hosts (bare metal servers) each running Intel Xeon Gold 5218 with 192GB RAM
   - 5TB of NFS storage (again making it easy - no vSAN)

   

   Detailed ordering information:

   * Solution Type: vCenter Server

   * Instance configurations: New Configuration

   * Instance Name: nf-vcs

   * Resource group: netfinity-vcs 

   * VMware vSphere Version: vSphere 7.0u2

   * Instance Type: Primary instance

   * Licensing: All include / NSX-T Advanced license
     

   Consolidated cluster

   - Cluster name: nf-vcs-consolidated
   - Location: Washington 07
   - CPU Generation: Cascade Lake
   - CPU model: Gold 5128
   - RAM: 192GB
   - Number of servers: 6
   - Storage: NFS Storage
   - Configure shares individually: leave unchecked:
   - Number of shares: 1
   - Size: 5000
   - Performance : 2IOPS/GB

   

   Public and private network

   * Uplink speed: 10GB

   * VLANs: Order new VLANs

   * Leave workload cluster unchecked

   * Leave edge services cluster unchecked

   * Hostname prefix: esxi-0

   * Domain name: wdc07.netfinity.local

   * Single public Windows VSI

   

   No recommended or optional services



<!--#/istutorial#-->


## Next Steps
{: #vmware-onboarding-order-cluster-storage-next-steps}

The next step in the tutorial series is:

* [Order vSRX Gateway](/docs/solution-tutorials?topic=solution-tutorials-vmware-onboarding-vsrx-gateway)
