---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-09-09"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, vmwaresolutions
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

# Provision VPC network interfaces for NSX-T 
{: #vpc-bm-vmware-nsx-t-routing}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->


This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}


In this tutorial, a {{site.data.keyword.vpc_short}} network interfaces are created for your NSX-T Logical Router. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-routing-objectives}

In this tutorial, you will create {{site.data.keyword.bm_is_short}} network interfaces for your NSX-T Logical Router. 

![NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-NSX-based.svg "NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-nsx-t-routing-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan) or [Provision NFS storage and attach to cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the Jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}


## Create VLAN NICs for ESXi host TEPs
{: #vpc-bm-vmware-nsx-t-routing-vlannic}
{: step}

1. If you have not already done so, provision VLAN interfaces for your {{site.data.keyword.bm_is_short}} for ESXi TEPs.

See instructions in [provisioning {{site.data.keyword.bm_is_short}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms#vpc-bm-vmware-bms-vlannic).

If you provisioned the vSAN VLAN NICs following the guidance above, you can recall the vSAN IPs with the following commands:
{: tip}

   ```sh
   echo "vSAN IP for BMS001 : "$VMWARE_BMS001_VSAN_IP
   ```
   {: codeblock}

   ```sh
   echo "vSAN IP for BMS002 : "$VMWARE_BMS002_VSAN_IP
   ```
   {: codeblock}

   ```sh
   echo "vSAN IP for BMS003 : "$VMWARE_BMS003_VSAN_IP
   ```
   {: codeblock}


## Create vSAN using vSphere Client
{: #vpc-bm-vmware-nsx-t-routing-create}
{: step}



## Next Steps
{: #vpc-bm-vmware-nsx-t-routing-next-steps}

The next step in the tutorial series is:

* todo