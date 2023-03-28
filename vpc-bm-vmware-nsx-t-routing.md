---
subcollection: solution-tutorials
copyright:
  years: 2022, 2023
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

# Configure routing for {{site.data.keyword.vpc_short}} and NSX-T Logical Routers
{: #vpc-bm-vmware-nsx-t-routing}
{: toc-content-type="tutorial"}
{: toc-services="vpc, vmwaresolutions"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->


This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}

In this tutorial, a {{site.data.keyword.bm_is_short}} VLAN interfaces will be created for your NSX-T Tier 0 logical router external uplinks. Tier 0 logical router or Gateway will be connected to one or more the {{site.data.keyword.vpc_short}} subnets. When the interfaces are created, IP routing is configured between {{site.data.keyword.vpc_short}} and the NSX-T overlay networks. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-routing-objectives}

You will first create {{site.data.keyword.bm_is_short}} VLAN interfaces for your NSX-T Tier 0 logical router (or also known as T0 gateway) external interfaces (or also called as uplinks). These interfaces will be attached to two {{site.data.keyword.vpc_short}} subnets. These IP addresses will be used as next-hops for IP routing. Static routes will be configured - first in NSX-T T0 gateway and then in {{site.data.keyword.vpc_short}}.

![NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/vpc-ryo-diagrams-nsx-t-vpc-routing.svg "NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. NSX-T based VMware Solution in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-nsx-t-routing-prereqs}

This tutorial requires:

* Common [prereqs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan) or [Provision NFS storage and attach to cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)
* [Provision {{site.data.keyword.vpc_short}} network interfaces for NSX-T](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-vlannics)
* [Deploy {{site.data.keyword.vpc_short}} NSX-T](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-deployment)

[Login](/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the Jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://nsx.vmware.ibmcloud.local` as used in this example.
{: note}


## Create Tier 0 logical router uplink subnets in {{site.data.keyword.vpc_short}} 
{: #vpc-bm-vmware-nsx-t-routing-vpc-subnets}
{: step}

In this step, the following {{site.data.keyword.vpc_short}} subnets will be created for the Tier 0 (T0) private uplinks. These subnets will be used as transit networks. When the interfaces have been created, static routing will be configured between {{site.data.keyword.vpc_short}} implicit router and NSX-T T0's private uplinks.

| Subnet name                   | System Traffic Type          | Subnet Sizing Guidance  
| ------------------------------|------------------------------|-----------------------------------
| vpc-t0-public-uplink-subnet   | T0 public uplink subnet      | /29 or larger
| vpc-t0-private-uplink-subnet  | T0 private uplink subnet     | /29 or larger
{: caption="Table 1. VPC subnets for NSX-T T0 uplinks" caption-side="top"}


1. Provision NSX-T uplink Prefix and Subnets.

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


## Create VLAN NICs for NSX-T Tier 0 logical router uplinks 
{: #vpc-bm-vmware-nsx-t-routing-vpc-uplinks}
{: step}

In this step, {{site.data.keyword.bm_is_short}}VLAN interfaces will be created for the Tier 0 (T0)  external uplinks for public and private connectivity. These uplinks and subnets will be used as transit networks and static routing is configured between {{site.data.keyword.vpc_short}} implicit router and NSX-T T0 logical router.

| Interface name              | Interface type | VLAN ID | Subnet                       | Allow float  | Allow IP spoofing | Enable Infra NAT  | NSX-T Interface            | Segment Name
| ----------------------------|----------------|---------|------------------------------|--------------|-------------------|-------------------|----------------------------|------------------------------
| vlan-nic-t0-pub-uplink-1    | vlan           | 700     | vpc-t0-public-uplink-subnet  | true         | false             | false             | T0 Public uplink * Edge 1  | vpc-zone-t0-public-*vlanid*
| vlan-nic-t0-pub-uplink-2    | vlan           | 700     | vpc-t0-public-uplink-subnet  | true         | false             | false             | T0 Public uplink * Edge 2  | vpc-zone-t0-public-*vlanid*
| vlan-nic-t0-pub-uplink-vip  | vlan           | 700     | vpc-t0-public-uplink-subnet  | true         | false             | false             | T0 Public uplink VIP       | vpc-zone-t0-public-*vlanid*
| vlan-nic-t0-priv-uplink-1   | vlan           | 710     | vpc-t0-private-uplink-subnet | true         | true              | true              | T0 Private uplink * Edge 1 | vpc-zone-t0-private-*vlanid*
| vlan-nic-t0-priv-uplink-2   | vlan           | 710     | vpc-t0-private-uplink-subnet | true         | true              | true              | T0 Private uplink * Edge 2 | vpc-zone-t0-private-*vlanid*
| vlan-nic-t0-priv-uplink-vip | vlan           | 710     | vpc-t0-private-uplink-subnet | true         | true              | true              | T0 Private uplink VIP      | vpc-zone-t0-private-*vlanid*
{: caption="Table 4. VLAN interfaces for T0 uplinks" caption-side="top"}

Depending on your networking design, provision only the VLAN interfaces you need, for example if you do not need direct public connectivity you can skip that part. Refer to [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t) for architectural considerations.
{: note}

When using new VLAN IDs for VLAN interfaces, you need to modify each {{site.data.keyword.bm_is_full_notm}} where the NSX-T edge nodes are planned to run. In this setup, all three hosts are allowed to host the edge nodes and modifications are needed for all of them.
{: note}


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

2. Create Security groups for uplinks

   **Public uplink security group:**

   ```sh
   VMWARE_SG_T0_PUBLIC=$(ibmcloud is security-group-create sg-t0-public $VMWARE_VPC --output json | jq -r .id)
   ```
   {: codeblock}

   **Public uplink security group rules:**

   The following rules will allow inbound icmp and all outbound. You may customize the rules based on your needs.
   {: note}

   ```sh
   ibmcloud is security-group-rule-add sg-t0-public inbound icmp 
   ibmcloud is security-group-rule-add sg-t0-public outbound all
   ```
   {: codeblock}

   When creating rules, remember that security groups are stateful.
   {: note}

   **Validate the created rules:**

   ```sh
   ibmcloud is security-group-rules sg-t0-public 
   ```
   {: codeblock}


   **Private uplink security group:**

   ```sh
   VMWARE_SG_T0_PUBLIC=$(ibmcloud is security-group-create sg-t0-private $VMWARE_VPC --output json | jq -r .id)
   ```
   {: codeblock}

   **Private uplink security group rules:**

   ```sh
   ibmcloud is security-group-rule-add sg-t0-private inbound all
   ibmcloud is security-group-rule-add sg-t0-private outbound all
   ```
   {: codeblock}

   When creating rules, remember that security groups are stateful.
   {: note}

   **Validate the created rules:**

   ```sh
   ibmcloud is security-group-rules sg-t0-public 
   ```
   {: codeblock}


3. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for T0 **Public uplinks**.
   
   **Public uplink VIP:**

   ```sh
   VMWARE_VNIC_T0_PUBLIC_VIP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PUBLIC --interface-type vlan --vlan 700 --allow-interface-to-float true --name vlan-nic-t0-public-vip --security-groups sg-t0-public --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_VIP_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PUBLIC_VIP --output json | jq -r .primary_ip.address)
   ```
   {: codeblock}

   ```sh
   echo "Public uplink VIP : "$VMWARE_VNIC_T0_PUBLIC_VIP_IP
   ```
   {: codeblock}
   
   **Public uplink 1 for Edge 1:**
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_1=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PUBLIC --interface-type vlan --vlan 700 --allow-interface-to-float true --name vlan-nic-t0-public-1 --security-groups sg-t0-public --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PUBLIC_1_IP --output json | jq -r .primary_ip.address)
   ```
   {: codeblock}

   ```sh
   echo "Public uplink 1 for Edge 1 : "$VMWARE_VNIC_T0_PUBLIC_1_IP
   ```
   {: codeblock}
   
   **Public uplink 2 for Edge 2:**
   
   ```sh
   VMWARE_VNIC_T0_PUBLIC_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PUBLIC --interface-type vlan --vlan 700 --allow-interface-to-float true --name vlan-nic-t0-public-2 --security-groups sg-t0-public --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_T0_PUBLIC_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PUBLIC_2 --output json | jq -r .primary_ip.address)
   ```
   {: codeblock}

   ```sh
   echo "Public uplink 2 for Edge 2 : "$VMWARE_VNIC_T0_PUBLIC_2_IP
   ```
   {: codeblock}

   When creating public uplinks, you may add new rules for your {{site.data.keyword.vpc_short}} security group to permit traffic what you need. The example ruleset allows all outbound and icmp inbound.
   {: note}

4. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for T0 **Private uplinks**.
   
   **Private uplink VIP:**

   ```sh
   VMWARE_VNIC_T0_PRIVATE_VIP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PRIVATE --interface-type vlan --vlan 710 --allow-interface-to-float true --name vlan-nic-t0-private-vip --security-groups sg-t0-private --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_VIP_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PRIVATE_VIP --output json | jq -r .primary_ip.address)
   ```
   {: codeblock}

   ```sh
   echo "Private uplink VIP : "$VMWARE_VNIC_T0_PRIVATE_VIP_IP
   ```
   {: codeblock}
   
   **Private uplink 1 for Edge 1:**
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_1=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PRIVATE --interface-type vlan --vlan 710 --allow-interface-to-float true --name vlan-nic-t0-private-1 --security-groups sg-t0-private --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PRIVATE_1_IP --output json | jq -r .primary_ip.address)
   ```
   {: codeblock}

   ```sh
   echo "Private uplink 1 for Edge 1 : "$VMWARE_VNIC_T0_PRIVATE_1_IP
   ```
   {: codeblock}
   
   **Private uplink 2 for Edge 2:**
   
   ```sh
   VMWARE_VNIC_T0_PRIVATE_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_T0_UPLINK_PRIVATE --interface-type vlan --vlan 710 --allow-interface-to-float true --name vlan-nic-t0-private-2 --security-groups sg-t0-private --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_T0_PRIVATE_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_T0_PRIVATE_2 --output json | jq -r .primary_ip.address)
   ```
   {: codeblock}

   ```sh
   echo "Private uplink 2 for Edge 2 : "$VMWARE_VNIC_T0_PRIVATE_2_IP
   ```
   {: codeblock}

   When creating private uplinks, you may create more restrictive rules for your {{site.data.keyword.vpc_short}} security group to permit only the traffic what you need. The example ruleset allows all traffic for private uplink for simplicity.
   {: note}

## Create NSX-T VLAN backed segments 
{: #vpc-bm-vmware-nsx-t-routing-create-segments}
{: step}

In the previous step, VLAN interfaces where created for the private and public uplinks using VLAN IDs `700` and `710`. These uplinks and {{site.data.keyword.vpc_short}} subnets will be used as transit networks, and for the T0 matching VLAN backed segments will be created in NSX-T. These VLAN backed segments will be used in the T0 external interface configurations. 

1. Create VLAN backed segments for your NSX-T deployment for public and private transit networks.
   
2. Use the VLAN IDs used earlier in this tutorial, e.g. `700` for the public and `710` for the private. Name your segments so that you can identify the public and private, or refer to [naming recommendations in {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t).

For more information on creating NSX-T segments, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-316E5027-E588-455C-88AD-A7DA930A4F0B.html). 

The VLAN IDs are only local to the hosts, they are not visible in {{site.data.keyword.vpc_short}}.
{: note}

## Create NSX-T Tier-0 logical router 
{: #vpc-bm-vmware-nsx-t-routing-create-t0}
{: step}

In this step, you will create the Tier 0 logical router or gateway in the NSX-T edge cluster. As the name says, this logical router is a logical construct inside the edge cluster VMs and uses virtual routing and forwarding (VRF) technology to separate routing tables etc..

1. Create NSX-T Tier 0 logical router in the created NSX-T edge cluster.
2. Set high availability (HA) mode as active-standby.
3. Create external interfaces using the IPs created in the previous steps for each required uplink. Use the created VLAN backed segments as the `Connected To (Segment)`.  

For more information on creating Tier 0 logical router, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-E9E62E02-C226-457D-B3A6-FE71E45628F7.html). 

NSX-T has a strict URPF rule by default on the external uplinks. Make sure that your routing is symmetric, or Tier 0 logical routers may discard the packets arriving from a "wrong" interface. See more in [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-7B0CD287-C5EB-493C-A57F-EEA8782A741A.html){: external}.
{: note}

When creating public and private uplinks, a recommended best practice is to [enable NSX-T Edge Gateway firewall](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-A52E1A6F-F27D-41D9-9493-E3A75EC35481.html){: external} on the interfaces and create required rule set to secure your workloads properly.
{: note}

## Create static routes in Tier-0 logical router 
{: #vpc-bm-vmware-nsx-t-routing-create-t0-routes}
{: step}

In this step, you will configure static routes in your Tier 0 logical router pointing to the {{site.data.keyword.vpc_short}} implicit router IP, which is the first IP address of the {{site.data.keyword.vpc_short}} subnet used for the specific NSX-T uplink.

1. Create default route `0.0.0.0/0` using the public uplinks. Use the 1st IP address of the private uplink subnet as the next hop, e.g. `192.168.0.1`. This is the {{site.data.keyword.vpc_short}} implicit router IP address.
2. Create static routes for your private networks, e.g. `192.168.0.0/16` and `10.0.0.0/8` using the private uplinks. These prefixes are for those networks that are reachable via the {{site.data.keyword.vpc_short}}, or Transit Gateway attached to the {{site.data.keyword.vpc_short}}.  Use the 1st IP address of the private uplink subnet as the next hop, e.g. `192.168.0.9`. This is the {{site.data.keyword.vpc_short}} implicit router IP address.

For more information on creating Tier 0 logical router, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-E9E62E02-C226-457D-B3A6-FE71E45628F7.html). 


NSX-T has a strict URPF rule by default on the external uplinks. Make sure that your routing is symmetric, or otherwise Tier 0 logical routers may discard the packets arriving from a "wrong" interface.
{: note}

When creating public and private uplinks, you may need to customize the security group rules. For more information, see [{{site.data.keyword.vpc_short}} Security Groups](/docs/vpc?topic=vpc-using-security-groups).
{: note}

When creating public and private uplinks, a recommended best practice is to enable NSX-T Edge Gateway Firewall on the interfaces and create required rule set to secure your workloads properly. For more information for configuring Gateway Firewall, see [VMware Docs](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-A52E1A6F-F27D-41D9-9493-E3A75EC35481.html).
{: note}


## Create {{site.data.keyword.vpc_short}} routes
{: #vpc-bm-vmware-nsx-t-routing-create-vpc-routes}
{: step}

In this step, you will configure static routes in your {{site.data.keyword.vpc_short}} for the subnets/prefixes


1. Create {{site.data.keyword.vpc_short}} routes for your overlay networks. 

   For example, if your overlay IP would be 172.16.0.0/12 create the following route pointing to the VIP IP `$VMWARE_VNIC_T0_PRIVATE_VIP_IP` of the T0.
   
   ```sh
   ibmcloud is vpc-route-create nsx-t-overlay-172-16-0-0-12 $VMWARE_VPC --zone $VMWARE_VPC_ZONE --destination 172.16.0.0/12 --next-hop-ip $VMWARE_VNIC_T0_PRIVATE_VIP_IP
   ```
   {: codeblock}

If you are using Transit Gateways or Direct Links, you need to create ingress routing table with ingress {{site.data.keyword.vpc_short}} routes. Ingress routes enable you to customize routes on incoming traffic to a {{site.data.keyword.vpc_short}} from traffic sources external to the {{site.data.keyword.vpc_short}}'s availability zone (IBM Cloud Direct Link 2.0, IBM Cloud Transit Gateway, or another availability zone in same {{site.data.keyword.vpc_short}}). For more information and design considerations, refer to [Interconnectivity solutions overview for VMware Solutions in {{site.data.keyword.vpc_short}}](/docs/vmwaresolutions?topic=vmwaresolutions-interconnectivity-overview) and [{{site.data.keyword.vpc_short}} routing tables and routes](/docs/vpc?topic=vpc-about-custom-routes&interface=ui#egress-ingress-overview)].
{: note}



## Provision {{site.data.keyword.vpc_short}} public IPs
{: #vpc-bm-vmware-nsx-t-routing-create-vpc-ips}
{: step}

You can provision `/32` public IPs (floating IPs) for your workloads. You can use this IP for e.g. NATing or as an NSX-T IPSec VPN endpoint. You can create multiple IPs, if needed. You need to order these floating IPs to be bind them to the public uplink VIP, which will make sure the ingress and egress routing works in case of edge transport node issues.

1. Order a {{site.data.keyword.vpc_short}} public IP for the `$VMWARE_VNIC_T0_PUBLIC_VIP` VLAN interface.
   
   ```sh
   ibmcloud is floating-ip-reserve my-public-ip-1 --nic $VMWARE_VNIC_T0_PUBLIC_VIP
   ```
   {: codeblock}

Ordering of subnets is currently not supported.
{: note}


## Next steps
{: #vpc-bm-vmware-nsx-t-routing-next-steps}

After you have created your NSX-T T0 logical router/gateway and routing between NSX-T and {{site.data.keyword.vpc_short}}, you can continue adding Tier 1 (T1) logical routers and NSX-T overlay segments into your solution based on the overlay network design. 

For more information, refer to [NSX-T Data Center Administration Guide](https://docs.vmware.com/en/VMware-NSX-T-Data-Center/3.1/administration/GUID-FBFD577B-745C-4658-B713-A3016D18CB9A.html){: external}. 
