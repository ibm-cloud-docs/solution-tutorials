---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-01-19"
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

# Deploy NSX-T Managers 
{: #vpc-bm-vmware-nsx-t-managers}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->


This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}


In this tutorial, NSX-T will be deployed including NSX-T managers and adding compute manager and transport nodes. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-managers-objectives}

In the [previous tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics), you deployed VLAN interfaces and you registered the required IP addresses to the DNS Service. These IP addresses and FQDNs will be used throughout this tutorial.

In this tutorial, you will first deploy one NSX-T manager on a {{site.data.keyword.bm_is_short}} running VMware ESXi in {{site.data.keyword.vpc_short}}. After the first NSX-T manager has been deployed, you will register the vCenter as a compute manager and you can then deploy the 2nd and 3rd NSX-T managers via the NSX Manager GUI. After the cluster formation, you can configure the NSX-T transport zones and various profiles based on your preference and add the {{site.data.keyword.bm_is_short}} hosts as transport nodes as well as create the edge transport nodes and edge cluster.

![NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210924v1-NSX-self-managed-mgmt.svg "NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-nsx-t-managers-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan) or [Provision NFS storage and attach to cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)
* [Provision {{site.data.keyword.vpc_short}} network interfaces for NSX-T](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}


## Review NSX-T installation requirements 
{: #vpc-bm-vmware-nsx-t-managers-deploy}
{: step}

Before you start the actual NSX-T deployment, review the following requirements: 

1. Review [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
2. Review the NSX Manager installation requirements. See [NSX Manager Installation](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-A65FE3DD-C4F1-47EC-B952-DEDF1A3DD0CF.html#GUID-A65FE3DD-C4F1-47EC-B952-DEDF1A3DD0CF){: external}.
3. Review and configure the necessary ports and protocols in security groups (if detailed rules are applied). See [Ports and Protocols](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-2ABB0F95-E918-43A1-B096-7401979D51AA.html#GUID-2ABB0F95-E918-43A1-B096-7401979D51AA){: external}.
4. Review the NSX Edge installation requirements. See [NSX Edge Installation Requirements](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-11417AA2-5EBC-49C7-8A86-EB94604261A6.html#GUID-11417AA2-5EBC-49C7-8A86-EB94604261A6).
5. Collect the IP addresses and FQDNs for the provisioned {{site.data.keyword.bm_is_full_notm}} VLAN interfaces from the [previous tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics).


## Deploy NSX-T managers and for a cluster
{: #vpc-bm-vmware-nsx-t-managers-deploy}
{: step}

Follow the recommended order of procedures to deploy NSX-T on {{site.data.keyword.bm_is_full_notm}} with VMware ESXi.

1. Install the NSX Manager. Use the VLAN interface IP for the NSX-T manager 1 created in the [previous tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics). For more information, see [Install NSX Manager and Available Appliances](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-FA0ABBBD-34D8-4DA9-882D-085E7E0D269E.html#GUID-FA0ABBBD-34D8-4DA9-882D-085E7E0D269E){: external}.
2. Log in to the newly created NSX Manager using the jump box provisioned earlier. Use e.g. `https://nsx-1.vmware.ibmcloud.local`. For more information, see [Log In to the Newly Created NSX Manager](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-BF9FF9E2-47BD-466F-BDD2-8FF5145412E5.html#GUID-BF9FF9E2-47BD-466F-BDD2-8FF5145412E5){: external}.
3. Configure a compute manager. Add the previously provisioned vCenter as the compute manager. For more information, see [Add a Compute Manager](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-D225CAFC-04D4-44A7-9A09-7C365AAFCA0E.html#GUID-D225CAFC-04D4-44A7-9A09-7C365AAFCA0E){: external}.
4. Deploy additional NSX Manager nodes (2 and 3) to form a cluster. See [Deploy NSX Manager Nodes to Form a Cluster from the UI](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-B89F5831-62E4-4841-BFE2-3F06542D5BF5.html#GUID-B89F5831-62E4-4841-BFE2-3F06542D5BF5){: external}.
5. Create transport zones. For simplicity, you can use the default overlay and VLAN transport zones. For more information, see [Create Transport Zones](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-F739DC79-4358-49F4-9C58-812475F33A66.html#GUID-F739DC79-4358-49F4-9C58-812475F33A66){: external}.

Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
{: note}

## Create uplink profile
{: #vpc-bm-vmware-nsx-t-managers-transport-nodes-uplink-profile}
{: step}

In preparation for the next step, you will need to create a new uplink profile

1. Create an uplink profile, assigning the TEP vlan id e.g. `400` and assign the active uplink as uplink-1. For more information, see [Create an Uplink Profile](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-50FDFDFB-F660-4269-9503-39AE2BBA95B4.html){: external}


## Add host transport nodes
{: #vpc-bm-vmware-nsx-t-managers-transport-nodes-hosts}
{: step}

Follow the recommended order of procedures to add {{site.data.keyword.bm_is_full_notm}} with VMware ESXi as host transport nodes to NSX-T.

1. Create host transport nodes. When configuring the host TEP IPs, configure each host individually by using the [previously provisioned TEP IPs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics) of the related {{site.data.keyword.bm_is_full_notm}} VLAN interface for TEP. For more information, see [Prepare Standalone Hosts as Transport Nodes or Prepare ESXi Cluster Hosts as Transport Nodes](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-D7CA778B-6554-4A23-879D-4BC336E01031.html#GUID-D7CA778B-6554-4A23-879D-4BC336E01031){: external}.

Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
{: note}

## Create a segment and port group for NSX-T edge deployment
{: #vpc-bm-vmware-nsx-t-managers-transport-nodes-prep}
{: step}

1. Create a NSX-T VLAN backed segment for the vlan transport zone using with the VLAN ID, e.g. `400`. For more information, see [Adding a Segment](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-D018DB03-0C07-4980-887D-AF3B3E93EF63.html){: external}
2. Create a Distributed port group for the overlay transport zine using the VLAN trunk, e.g. `0-4094`. For more information, see [Configure VLAN Tagging on a Distributed Port Group or Distributed Port](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.networking.doc/GUID-D5960C77-0D19-4669-A00C-B05D58A422F8.html){: external}


## Add edge transport nodes and create an edge cluster
{: #vpc-bm-vmware-nsx-t-managers-transport-nodes-edges}
{: step}

Follow the recommended order of procedures to install edge transport nodes and form an edge cluster for your logical routers.

1. Install NSX Edges. When configuring the host TEP IPs, configure each host individually by using the [previously provisioned TEP IPs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics) of the related {{site.data.keyword.bm_is_full_notm}} VLAN interface for TEP. For more information, see [Install an NSX Edge on ESXi Using the vSphere GUI](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-AECC66D0-C968-4EF2-9CAD-7772B0245BF6.html#GUID-AECC66D0-C968-4EF2-9CAD-7772B0245BF6){: external}.
2. Create an NSX Edge cluster. For more information, see [Create an NSX Edge Cluster](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-898099FC-4ED2-4553-809D-B81B494B67E7.html#GUID-898099FC-4ED2-4553-809D-B81B494B67E7){: external}.


When installing NSX Edges, create two N-VDSs. One for overlay traffic and one for accessing VPC subnets.
{: important}

When configuring uplink for TEP traffic in Edges, create a VLAN based segment for the vlan transport zone using with the VLAN ID, e.g. `400`.  
{: important}

Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
{: note}


## Next Steps
{: #vpc-bm-vmware-nsx-t-managers-next-steps}

The next step in the tutorial series is:

* [Configure routing for {{site.data.keyword.vpc_short}} and NSX-T Logical Routers](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-routing)