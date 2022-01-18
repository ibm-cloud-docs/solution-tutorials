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
{: #vpc-bm-vmware-nsx-t-managers}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->


This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}


In this tutorial, a {{site.data.keyword.vpc_short}} network interfaces are created for NSX-T managers. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-managers-objectives}

In this tutorial, you will create {{site.data.keyword.bm_is_short}} network interfaces for NSX-T managers. 

![NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-NSX-based.svg "NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-nsx-t-managers-prereqs}

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



## Deploy NSX-T Managers
{: #vpc-bm-vmware-nsx-t-managers-deploy}
{: step}


## Configure NSX-T Transport Zones
{: #vpc-bm-vmware-nsx-t-managers-deploy}
{: step}


## Configure NSX-T Profiles
{: #vpc-bm-vmware-nsx-t-managers-deploy}
{: step}


Follow the recommended order of procedures.

1. Review the NSX Manager installation requirements. See [NSX Manager Installation](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-A65FE3DD-C4F1-47EC-B952-DEDF1A3DD0CF.html#GUID-A65FE3DD-C4F1-47EC-B952-DEDF1A3DD0CF).
2. Configure the necessary ports and protocols. See [Ports and Protocols](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-2ABB0F95-E918-43A1-B096-7401979D51AA.html#GUID-2ABB0F95-E918-43A1-B096-7401979D51AA).
3. Install the NSX Manager. See [Install NSX Manager and Available Appliances](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-FA0ABBBD-34D8-4DA9-882D-085E7E0D269E.html#GUID-FA0ABBBD-34D8-4DA9-882D-085E7E0D269E).
4. Log in to the newly created NSX Manager. See [Log In to the Newly Created NSX Manager](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-BF9FF9E2-47BD-466F-BDD2-8FF5145412E5.html#GUID-BF9FF9E2-47BD-466F-BDD2-8FF5145412E5).
5. Configure a compute manager. See [Add a Compute Manager](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-D225CAFC-04D4-44A7-9A09-7C365AAFCA0E.html#GUID-D225CAFC-04D4-44A7-9A09-7C365AAFCA0E).
6. Deploy additional NSX Manager nodes to form a cluster. See [Deploy NSX Manager Nodes to Form a Cluster from the UI](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-B89F5831-62E4-4841-BFE2-3F06542D5BF5.html#GUID-B89F5831-62E4-4841-BFE2-3F06542D5BF5).
7. Review the NSX Edge installation requirements. See [NSX Edge Installation Requirements](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-11417AA2-5EBC-49C7-8A86-EB94604261A6.html#GUID-11417AA2-5EBC-49C7-8A86-EB94604261A6).
8. Install NSX Edges. See [Install an NSX Edge on ESXi Using the vSphere GUI](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-AECC66D0-C968-4EF2-9CAD-7772B0245BF6.html#GUID-AECC66D0-C968-4EF2-9CAD-7772B0245BF6).
9. Create an NSX Edge cluster. See [Create an NSX Edge Cluster](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-898099FC-4ED2-4553-809D-B81B494B67E7.html#GUID-898099FC-4ED2-4553-809D-B81B494B67E7).
10. Create transport zones. See [Create Transport Zones](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-F739DC79-4358-49F4-9C58-812475F33A66.html#GUID-F739DC79-4358-49F4-9C58-812475F33A66).
11. Create host transport nodes. See [Prepare Standalone Hosts as Transport Nodes or Prepare ESXi Cluster Hosts as Transport Nodes](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-D7CA778B-6554-4A23-879D-4BC336E01031.html#GUID-D7CA778B-6554-4A23-879D-4BC336E01031).



## Next Steps
{: #vpc-bm-vmware-nsx-t-managers-next-steps}

The next step in the tutorial series is:

* todo