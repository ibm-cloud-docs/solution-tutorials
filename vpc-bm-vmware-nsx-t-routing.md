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

# Provision {{site.data.keyword.vpc_short}} network interfaces for NSX-T 
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

In this tutorial, a {{site.data.keyword.vpc_short}} network interfaces are created for your NSX-T Logical Router and routing is configured between {{site.data.keyword.vpc_short}} and NSX-T overlay. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-routing-objectives}

In this tutorial, you will create {{site.data.keyword.bm_is_short}} network interfaces for your NSX-T Logical Router. 

![NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210924v1-NSX-self-managed.svg "NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


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
* [Provision {{site.data.keyword.vpc_short}} network interfaces for NSX-T](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics)
* [Deploy {{site.data.keyword.vpc_short}} NSX-T](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-deployment)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the Jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}


## Create VLAN NICs for NSX-T Tier 0 Logical Router Uplinks 
{: #vpc-bm-vmware-nsx-t-routing-vpc-uplinks}
{: step}

In this step, the following {{site.data.keyword.vpc_short}} subnets and VLAN interfaces will be created for Tier 0 (T0) private uplinks. These uplinks and subnets will be used as trasit networks and interfaces between NSX-T and {{site.data.keyword.vpc_short}}.

Interface name              | Interface type | VLAN ID | Subnet                       | Allow float  | Allow IP spoofing | Enable Infra NAT  | NSX-T Interface            | Segment Name
----------------------------|----------------|---------|------------------------------|--------------|-------------------|-------------------|----------------------------|------------------------------
vlan-nic-t0-pub-uplink-1    | vlan           | 700     | vpc-t0-public-uplink-subnet  | true         | false             | false             | T0 Public Uplink * Edge 1  | vpc-zone-t0-public-*vlanid*
vlan-nic-t0-pub-uplink-2    | vlan           | 700     | vpc-t0-public-uplink-subnet  | true         | false             | false             | T0 Public Uplink * Edge 2  | vpc-zone-t0-public-*vlanid*
vlan-nic-t0-pub-uplink-vip  | vlan           | 700     | vpc-t0-public-uplink-subnet  | true         | false             | false             | T0 Public Uplink VIP       | vpc-zone-t0-public-*vlanid*
vlan-nic-t0-priv-uplink-1   | vlan           | 710     | vpc-t0-private-uplink-subnet | true         | true              | true              | T0 Private Uplink * Edge 1 | vpc-zone-t0-private-*vlanid*
vlan-nic-t0-priv-uplink-2   | vlan           | 710     | vpc-t0-private-uplink-subnet | true         | true              | true              | T0 Private Uplink * Edge 2 | vpc-zone-t0-private-*vlanid*
vlan-nic-t0-priv-uplink-vip | vlan           | 710     | vpc-t0-private-uplink-subnet | true         | true              | true              | T0 Private Uplink VIP      | vpc-zone-t0-private-*vlanid*
{: caption="Table 4. VLAN interfaces for T0 uplinks" caption-side="top"}

Depending on your networking design, provision only the VLAN interfaces you need. Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for architectural considerations.
{: note}

Using new VLAN IDs require modification for each {{site.data.keyword.bm_is_full_notm}} where the NSX-T edge nodes are planned to run. In this setup, all three hosts are allowed to host the Edges and modifications are needed for all of them.

1. Allow the {{site.data.keyword.bm_is_full_notm}} PCI NICs to use the VLANs stated above.
   
   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS001 $VMWARE_BMS001_PNIC --allowed-vlans 100,200,300,400,700,710
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS002 $VMWARE_BMS002_PNIC --allowed-vlans 100,200,300,400,700,710
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS003 $VMWARE_BMS003_PNIC --allowed-vlans 100,200,300,400,700,710
   ```
   {: codeblock}

2. Provision NSX-T Uplink Prefix and Subnets.

   ```sh
   VMWARE_T0_UPLINK_PREFIX=$(ibmcloud is vpc-address-prefix-create <UNIQUE_PREFIX_NAME> $VMWARE_VPC $VMWARE_VPC_ZONE 192.168.0.0/24)
   ```
   {: codeblock}

   ```sh
   VMWARE_SUBNET_T0_UPLINK_PUBLIC=$(ibmcloud is subnetc vmw-subnet-t0-uplink-public $VMWARE_VPC --ipv4-cidr-block 192.168.0.0/29 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_SUBNET_T0_UPLINK_PRIVATE=$(ibmcloud is subnetc vmw-subnet-t0-uplink-private $VMWARE_VPC --ipv4-cidr-block 192.168.0.8/29 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}


3. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for T0 Public Uplinks.
   
   **Public Uplink VIP:**

   ```sh
   VMWARE_VNIC_T0_PUBLIC_VIP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PUBLIC --interface-type vlan --vlan 700 --allow-interface-to-float true --name vlan-nic-t0-private-vip --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_VIP_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PUBLIC_VIP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "Public Uplink VIP : "$VMWARE_VNIC_T0_PUBLIC_VIP_IP
   ```
   {: codeblock}
   
   **Public Uplink 1 for Edge 1:**
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_1_IP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PUBLIC --interface-type vlan --vlan 700 --allow-interface-to-float true --name vlan-nic-t0-private-1 --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PUBLIC_1_IP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "Public Uplink 1 for Edge 1 : "$VMWARE_VNIC_T0_PUBLIC_1_IP
   ```
   {: codeblock}
   
   **Public Uplink 2 for Edge 2:**
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PUBLIC --interface-type vlan --vlan 700 --allow-interface-to-float true --name vlan-nic-t0-private-2 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_T0_PUBLIC_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PUBLIC_2 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "Public Uplink 2 for Edge 2 : "$VMWARE_VNIC_T0_PUBLIC_2_IP
   ```
   {: codeblock}



4. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for T0 Private Uplinks.
   
   **Private Uplink VIP:**

   ```sh
   VMWARE_VNIC_T0_PRIVATE_VIP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PRIVATE --interface-type vlan --vlan 710 --allow-interface-to-float true --name vlan-nic-t0-private-vip --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_VIP_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PRIVATE_VIP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "Private Uplink VIP : "$VMWARE_VNIC_T0_PRIVATE_VIP_IP
   ```
   {: codeblock}
   
   **Private Uplink 1 for Edge 1:**
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_1_IP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PRIVATE --interface-type vlan --vlan 710 --allow-interface-to-float true --name vlan-nic-t0-private-1 --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PRIVATE_1_IP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "Private Uplink 1 for Edge 1 : "$VMWARE_VNIC_T0_PRIVATE_1_IP
   ```
   {: codeblock}
   
   **Private Uplink 2 for Edge 2:**
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PRIVATE --interface-type vlan --vlan 710 --allow-interface-to-float true --name vlan-nic-t0-private-2 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_T0_PRIVATE_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PRIVATE_2 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "Private Uplink 2 for Edge 2 : "$VMWARE_VNIC_T0_PRIVATE_2_IP
   ```
   {: codeblock}

## Create NSX-T VLAN Backed Segments 
{: #vpc-bm-vmware-nsx-t-routing-create-t0}
{: step}

1. Create VLAN backed Segments for your NSX-T deployment for public and private transit networks.
   
2. Use the VLAN IDs used earlier in this tutorial. Name your segments so that you can identify the public and private.

For more information on creating Segments, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-316E5027-E588-455C-88AD-A7DA930A4F0B.html). 


## Create NSX-T Tier-0 Logical Router 
{: #vpc-bm-vmware-nsx-t-routing-create-t0}
{: step}

1. Create NSX-T Tier 0 Logical Router in the created NSX-T edges cluster.
2. Set high availability (HA) mode as active-standby.
3. Create external interfaces using the IPs for each required uplink. Use the created VLAN backed Segments.  

For more information on creating Tier 0 logical router, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-E9E62E02-C226-457D-B3A6-FE71E45628F7.html). 


## Create NSX-T Tier-0 Logical Router 
{: #vpc-bm-vmware-nsx-t-routing-create-t0-routes}
{: step}

1. Configure static routes in your Tier-0 Logical Router.
2. Create static routes for private networks using the private uplinks, and use the 1st IP of the private uplink subnet as the next hop. This is the {{site.data.keyword.vpc_short}} implicit router.
3. Create default route `0.0.0.0/0` using the public uplinks, and use the 1st IP of the private subnet as the next hop. The first IP of the subnet is owned by the {{site.data.keyword.vpc_short}} implicit router, and your {{site.data.keyword.vpc_short}} routes.

For more information on creating Tier 0 logical router, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-E9E62E02-C226-457D-B3A6-FE71E45628F7.html). 


## Create {{site.data.keyword.vpc_short}} routes
{: #vpc-bm-vmware-nsx-t-routing-create-vpc-routes}
{: step}

1. Create {{site.data.keyword.vpc_short}} routes for your overlay networks. 

   For example, if your overlay IP would be 172.16.0.0/12 create the following route pointing to the VIP IP `$VMWARE_VNIC_T0_PRIVATE_VIP_IP` of the T0.
   
   ```sh
   ibmcloud is vpc-route-create nsx-t-overlay-172-16-0-0-12 $VMWARE_VPC --zone $VMWARE_VPC_ZONE --destination 172.16.0.0/12 --next-hop-ip $VMWARE_VNIC_T0_PRIVATE_VIP_IP
   ```
   {: codeblock}


## Provision {{site.data.keyword.vpc_short}} public IPs
{: #vpc-bm-vmware-nsx-t-routing-create-vpc-ips}
{: step}

You can provision one or more `/32` public IPs for your workloads.

1. Order a {{site.data.keyword.vpc_short}} public IP for the `$VMWARE_VNIC_T0_PUBLIC_VIP` VLAN interface.
   
   ```sh
   ibmcloud is floating-ip-reserve my-public-ip-1 --nic $VMWARE_VNIC_T0_PUBLIC_VIP
   ```
   {: codeblock}

You can use this IP for e.g. NATing or as an NSX-T IPSec VPN endpoint. You can create multiple IPs, if needed. 

Ordering subnets is currently not supported.
{: note}

## Next Steps
{: #vpc-bm-vmware-nsx-t-routing-next-steps}

The next step in the tutorial series is:

* todo