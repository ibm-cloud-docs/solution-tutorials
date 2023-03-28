---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2023-03-28"
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
{: #vpc-bm-vmware-nsx-t-deploy}
{: toc-content-type="tutorial"}
{: toc-services="vpc, vmwaresolutions"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.

<!--#/istutorial#-->

This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}


In this tutorial, NSX-T will be deployed on the VMware Cluster. This includes deploying NSX-T managers, adding compute manager and adding host and edge transport nodes. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-deploy-objectives}

In the [previous tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics), you deployed required {{site.data.keyword.bm_is_short}} VLAN interfaces. The management IPs were registered to the DNS Service, so that these can be resolved with a name. These IP addresses and FQDNs will be used throughout this tutorial.

In this tutorial, you will first deploy one NSX-T manager on a {{site.data.keyword.bm_is_short}} running VMware ESXi. After the first NSX-T manager has been deployed, you will register the vCenter as a compute manager and you can then deploy the 2nd and 3rd NSX-T managers via the NSX Manager GUI. After the cluster formation, you can configure the NSX-T transport zones and various profiles based on your preference and add the {{site.data.keyword.bm_is_short}} hosts as transport nodes as well as create the edge transport nodes and edge cluster.

![Deploying NSX-T in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210924v1-NSX-self-managed-mgmt.svg "Deploying NSX-T in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. Deploying NSX-T in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-nsx-t-deploy-prereqs}

This tutorial requires:

* Common [prereqs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan) or [Provision NFS storage and attach to cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)
* [Provision {{site.data.keyword.vpc_short}} network interfaces for NSX-T](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics)

[Login](/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}

## Order a vCenter License from IBM Cloud
{: #vpc-bm-vmware-nsx-t-deploy-license}

As a customer on IBM Cloud, you can bring your own license or you can obtain a license from IBM Cloud as a monthly fee.

Use the following steps to order licenses for the VMware products

VMware NSX-T™ Data Center SP license editions available include:
* NSX Data Center SP Base
* NSX Data Center SP Professional
* NSX Data Center SP Advanced
* NSX Data Center SP Enterprise Plus.

1. From the [{{site.data.keyword.cloud_notm}} Portal > Classic Infrastructure](/classic/devices/vmwarelicenses)
2. Click **Devices** > **Managed** > **VMware Licenses** > **Order VMware licenses**.
3. Click the drop-down list under **Order VMware License**. to list the VMware products and number of CPUs for the licenses that you want to order.
4. List of the VMware products and number of CPUs for the licenses that you want to order. Select **NSX Data Center SP Advanced** .
5. Click Continue to order the licenses or you can click Add License to add more licenses.
6. After you click Continue, you are taken back to the VMware Licenses page, which displays your VMware products and license keys.
7. Copy the VMware vCenter license key and can be added to the vCenter after the installation.


## Review NSX-T installation requirements 
{: #vpc-bm-vmware-nsx-t-review}
{: step}

Before you start the actual NSX-T deployment, review the following requirements: 

1. Review [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
2. Review the NSX Manager installation requirements. See [NSX Manager Installation](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-A65FE3DD-C4F1-47EC-B952-DEDF1A3DD0CF.html#GUID-A65FE3DD-C4F1-47EC-B952-DEDF1A3DD0CF){: external}.
3. Review and configure the necessary ports and protocols in security groups (if detailed rules are applied). See [Ports and Protocols](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-2ABB0F95-E918-43A1-B096-7401979D51AA.html#GUID-2ABB0F95-E918-43A1-B096-7401979D51AA){: external}.
4. Review the NSX Edge installation requirements. See [NSX Edge Installation Requirements](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-11417AA2-5EBC-49C7-8A86-EB94604261A6.html#GUID-11417AA2-5EBC-49C7-8A86-EB94604261A6).
5. Collect the IP addresses and FQDNs for the provisioned {{site.data.keyword.bm_is_full_notm}} VLAN interfaces from the [previous tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics).


## Deploy NSX-T managers and for a cluster
{: #vpc-bm-vmware-nsx-t-deploy-deploy}
{: step}

Follow the recommended order of procedures to deploy NSX-T on {{site.data.keyword.bm_is_full_notm}} with VMware ESXi.

1. Install the NSX Manager. Use the VLAN interface IP for the NSX-T manager 1 which was created in the [previous tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics). For more information, see [Install NSX Manager and Available Appliances](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-FA0ABBBD-34D8-4DA9-882D-085E7E0D269E.html#GUID-FA0ABBBD-34D8-4DA9-882D-085E7E0D269E){: external}.
2. Log in to the newly created NSX Manager using the jump box provisioned earlier. Use e.g. `https://nsx-1.vmware.ibmcloud.local` as the URL to connect. For more information, see [Log In to the Newly Created NSX Manager](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-BF9FF9E2-47BD-466F-BDD2-8FF5145412E5.html#GUID-BF9FF9E2-47BD-466F-BDD2-8FF5145412E5){: external}.
3. Configure a compute manager. Add the previously provisioned vCenter as the compute manager. For more information, see [Add a Compute Manager](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-D225CAFC-04D4-44A7-9A09-7C365AAFCA0E.html#GUID-D225CAFC-04D4-44A7-9A09-7C365AAFCA0E){: external}.
4. Deploy additional NSX Manager nodes (2 and 3) to form a cluster. Use the IP addresses provisioned in the [previous tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics). For more information, see [Deploy NSX Manager Nodes to Form a Cluster from the UI](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-B89F5831-62E4-4841-BFE2-3F06542D5BF5.html#GUID-B89F5831-62E4-4841-BFE2-3F06542D5BF5){: external}.
5. Configure a Virtual IP Address for a Cluster. se the IP addresses provisioned in the [previous tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics).For more information, see [Configure a Virtual IP Address for a Cluster](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-A8DF27CC-B3A6-45F2-856D-4278A7DBC98E.html?hWord=N4IghgNiBcIG4EsAOIC+Q){: external}.
6. Create transport zones. For simplicity, you can use the default overlay and VLAN transport zones. For more information, see [Create Transport Zones](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-F739DC79-4358-49F4-9C58-812475F33A66.html#GUID-F739DC79-4358-49F4-9C58-812475F33A66){: external}.

Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
{: note}

You can order NSX licenses through [IBM Cloud Classic portal](/classic/devices/vmwarelicenses).
{: note}

If you do not have access to VMware customer connect, please contact IBM Cloud Support to download NSX-T images.
{: note}

## Create uplink profile
{: #vpc-bm-vmware-nsx-t-deploy-transport-nodes-uplink-profile}
{: step}

In preparation for the next step, you will need to create a new uplink profile

1. Create an uplink profile, assigning the TEP vlan id e.g. `400` and assign the active uplink as uplink-1. For more information, see [Create an Uplink Profile](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-50FDFDFB-F660-4269-9503-39AE2BBA95B4.html){: external}


## Add host transport nodes
{: #vpc-bm-vmware-nsx-t-deploy-transport-nodes-hosts}
{: step}

An NSX Edge Node is a transport node that runs the local control plane daemons and forwarding engines implementing the NSX-T data plane. It runs an instance of the NSX-T virtual switch called the NSX Virtual Distributed Switch, or N-VDS. The Edge Nodes are service appliances dedicated to running centralized network services that cannot be distributed to the hypervisors. An NSX Edge can belong to one overlay transport zone and multiple VLAN transport zones. In this example, the NSX edge belongs to one VLAN transport zone which represents the physical connectivity to provide the uplink access to {{site.data.keyword.vpc_short}}.

Follow the recommended order of procedures to add {{site.data.keyword.bm_is_full_notm}} with VMware ESXi as host transport nodes to NSX-T.

1. Create host transport nodes. When configuring the host TEP IPs, configure each host individually by using the [previously provisioned TEP IPs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics) of the related {{site.data.keyword.bm_is_full_notm}} VLAN interface for TEP. For more information, see [Prepare Standalone Hosts as Transport Nodes or Prepare ESXi Cluster Hosts as Transport Nodes](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-D7CA778B-6554-4A23-879D-4BC336E01031.html#GUID-D7CA778B-6554-4A23-879D-4BC336E01031){: external}.

When you deploy an NSX-T edge, you can think of it as an empty container. The NSX-T edge does not do anything until you create logical routers, it provides the compute backing for Tier 0 and Tier 1 logical routers.
{: important}

Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
{: note}

## Create a segment and port group for NSX-T edge deployment
{: #vpc-bm-vmware-nsx-t-deploy-transport-nodes-prep}
{: step}

1. Create a NSX-T VLAN backed segment for the vlan transport zone using with the VLAN ID, e.g. `400`. For more information, see [Adding a Segment](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-D018DB03-0C07-4980-887D-AF3B3E93EF63.html){: external}
2. Create a Distributed port group for the overlay transport zine using the VLAN trunk, e.g. `0-4094`. For more information, see [Configure VLAN Tagging on a Distributed Port Group or Distributed Port](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.networking.doc/GUID-D5960C77-0D19-4669-A00C-B05D58A422F8.html){: external}


## Add edge transport nodes and create an edge cluster
{: #vpc-bm-vmware-nsx-t-deploy-transport-nodes-edges}
{: step}

Edge nodes are grouped in one or several clusters, representing a pool of capacity.

Follow the recommended order of procedures to install edge transport nodes and form an edge cluster for your logical routers.

1. Install NSX Edges. When configuring the host TEP IPs, configure each host individually by using the [previously provisioned TEP IPs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics) of the related {{site.data.keyword.bm_is_full_notm}} VLAN interface for TEP. For more information, see [Install an NSX Edge on ESXi Using the vSphere GUI](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-AECC66D0-C968-4EF2-9CAD-7772B0245BF6.html#GUID-AECC66D0-C968-4EF2-9CAD-7772B0245BF6){: external}.
2. Create an NSX Edge cluster. For more information, see [Create an NSX Edge Cluster](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/installation/GUID-898099FC-4ED2-4553-809D-B81B494B67E7.html#GUID-898099FC-4ED2-4553-809D-B81B494B67E7){: external}.


When installing NSX Edges, create two N-VDSs. One for overlay traffic and one for accessing VPC subnets.
{: important}

When configuring uplink for TEP traffic in Edges, create a VLAN based segment for the vlan transport zone using with the VLAN ID, e.g. `400`.  
{: important}

When you deploy an NSX-T edge cluster, you can think of it as an empty pool of compute resources. The NSX-T edge cluster does not do anything until you create Tier 0 and/or Tier 1 logical routers into it.
{: important}

Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for naming and architectural considerations.
{: note}


## Next steps
{: #vpc-bm-vmware-nsx-t-deploy-next-steps}

The next step in the tutorial series is:

* [Configure routing for {{site.data.keyword.vpc_short}} and NSX-T Logical Routers](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-routing#vpc-bm-vmware-nsx-t-routing)
