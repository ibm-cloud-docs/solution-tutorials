---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-01-21"
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


# Provision {{site.data.keyword.bm_is_short}} network interfaces for NSX-T 
{: #vpc-bm-vmware-nsx-t-vlannics}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->


This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}

In this tutorial, {{site.data.keyword.bm_is_short}} VLAN network interfaces are created for NSX-T management and edge components. This phase is optional, if you plan to use NSX-T for your Virtual Machine networking.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-nsx-t-vlannics-objectives}

In the NSX-T deployment, multiple components will be attached to {{site.data.keyword.vpc_short}}. These NSX-T components include:

* NSX-T Managers
* NSX-T Edge Transport Nodes
* NSX-T Host Transport Nodes (ESXi hosts)
* NSX-T Logical Router (Tier 0) uplinks

Each of these require one or more {{site.data.keyword.bm_is_short}} VLAN interfaces to be created before you can start the actual NSX-T deployment and configurations. In this tutorial, you will create {{site.data.keyword.bm_is_short}} network interfaces for NSX-T Managers and Transport Nodes.

![VLAN interfaces for NSX-T deployment {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210924v1-NSX-self-managed-mgmt.svg "VLAN interfaces for NSX-T deployment {{site.data.keyword.vpc_short}}"){: caption="Figure 1. VLAN interfaces for NSX-T deployment {{site.data.keyword.vpc_short}}" caption-side="bottom"}

For more information about the NSX-T architecture and architectural considerations in VPC, see [VMware Solution Architectures for {{site.data.keyword.vpc_short}}](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-nsx-t).


## Before you begin
{: #vpc-bm-vmware-nsx-t-vlannics-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan) or [Provision NFS storage and attach to cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the Jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}


## Create VLAN NICs for NSX-T Managers
{: #vpc-bm-vmware-nsx-t-managers-vlannic}
{: step}

In this step, the following {{site.data.keyword.bm_is_short}} VLAN interfaces will be created for NSX-T Managers and a virtual IP address (VIP) for NSX-T Managers, which provides fault tolerance and high availability to the NSX-T cluster.

Interface name        | Interface type | VLAN ID | Subnet              | Allow float  | NSX-T Interface   | Distributed Port Group Name
----------------------|----------------|---------|---------------------|--------------|-------------------|------------------------------
vlan-nic-nsx-0        | vlan           | 100     | vpc-mgmt-subnet     | true         | NSX-T Manager 1   | dpg-mgmt
vlan-nic-nsx-1        | vlan           | 100     | vpc-mgmt-subnet     | true         | NSX-T Manager 2   | dpg-mgmt
vlan-nic-nsx-2        | vlan           | 100     | vpc-mgmt-subnet     | true         | NSX-T Manager 3   | dpg-mgmt
vlan-nic-nsx-vip      | vlan           | 100     | vpc-mgmt-subnet     | true         | NSX-T Manager VIP | dpg-mgmt
{: caption="Table 1. VLAN interfaces for NSX-T Managers" caption-side="top"}


1. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for NSX-T Managers.
   
   **NSA Manager 1:**
   
   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_1=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-nsx-1 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_MANAGER_1 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Manager 1 IP : "$VMWARE_VNIC_NSX_T_MANAGER_1_IP
   ```
   {: codeblock}
   
   **NSA Manager 2:**

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-nsx-2 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_MANAGER_2 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Manager 2 IP : "$VMWARE_VNIC_NSX_T_MANAGER_2_IP
   ```
   {: codeblock}

   **NSA Manager 3:**

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_3=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-nsx-3 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_3_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_MANAGER_3 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Manager 1 IP : "$VMWARE_VNIC_NSX_T_MANAGER_1_IP
   ```
   {: codeblock}

2. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for NSX-T Manager VIP.

   **NSA Manager VIP:**

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_VIP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-nsx-vip --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_MANAGER_VIP_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_MANAGER_VIP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Manager 1 IP : "$VMWARE_VNIC_NSX_T_MANAGER_1_IP
   ```
   {: codeblock}

3. Add NSX Manager IPs to DNS Zone as A records to the DNS Service.

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name nsx-1 --ipv4 $VMWARE_VNIC_NSX_T_MANAGER_1_IP
   ```
   {: codeblock}

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name nsx-2 --ipv4 $VMWARE_VNIC_NSX_T_MANAGER_2_IP
   ```
   {: codeblock}

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name nsx-3 --ipv4 $VMWARE_VNIC_NSX_T_MANAGER_3_IP
   ```
   {: codeblock}

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name nsx --ipv4 $VMWARE_VNIC_NSX_T_MANAGER_VIP_IP
   ```
   {: codeblock}


## Create VLAN NICs for ESXi host TEPs
{: #vpc-bm-vmware-nsx-t-hosts-vlannic}
{: step}

In this step, the following {{site.data.keyword.bm_is_short}} VLAN interfaces will be created for each host to be used as NSX-T Tunnel Endpoints (TEPs).

Interface name        | Interface type | VLAN ID | Subnet              | Allow float  | VMkernel Adapter | Distributed Port Group Name
----------------------|----------------|---------|---------------------|--------------|------------------|------------------------------
vlan-nic-tep-vmk10    | vlan           | 400     | vpc-tep-subnet      | false        | vmk10            | dpg-tep
{: caption="Table 2. Host management networks and VMkernel adapters" caption-side="top"}


1. Allow PCI NICs to use the VLANs stated above. Repeat for each host.
   
   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS001 $VMWARE_BMS001_PNIC --allowed-vlans 100,200,300,400
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS002 $VMWARE_BMS002_PNIC --allowed-vlans 100,200,300,400
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS003 $VMWARE_BMS003_PNIC --allowed-vlans 100,200,300,400
   ```
   {: codeblock}
   
2. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for ESXi TEPs. Repeat for each host.

   **ESXi 001:**

   ```sh
   VMWARE_BMS001_TEP=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_TEP --name vlan-nic-tep-vmk10 --interface-type vlan --vlan 400 --allow-interface-to-float false --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS001_TEP_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS001 $VMWARE_BMS001_TEP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "TEP IP for BMS001 : "$VMWARE_BMS001_TEP_IP
   ```
   {: codeblock}

   **ESXi 002:**

   ```sh
   VMWARE_BMS002_TEP=$(ibmcloud is bm-nicc $VMWARE_BMS002 --subnet $VMWARE_SUBNET_TEP --name vlan-nic-tep-vmk10 --interface-type vlan --vlan 400 --allow-interface-to-float false --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS002_TEP_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS002 $VMWARE_BMS002_TEP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "TEP IP for BMS002 : "$VMWARE_BMS002_TEP_IP
   ```
   {: codeblock}

   **ESXi 003:**

   ```sh
   VMWARE_BMS003_TEP=$(ibmcloud is bm-nicc $VMWARE_BMS003 --subnet $VMWARE_SUBNET_TEP --name vlan-nic-tep-vmk10 --interface-type vlan --vlan 400 --allow-interface-to-float false --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_BMS003_TEP_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS003 $VMWARE_BMS003_TEP --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "TEP IP for BMS003 : "$VMWARE_BMS003_TEP_IP
   ```
   {: codeblock}


## Create VLAN NICs for NSX-T edge nodes
{: #vpc-bm-vmware-nsx-t-vlannics-vlannic-tep}
{: step}

In this step, the following VLAN interfaces will be created for NSX-T edge nodes. Each edge node require one IP address for management and one for TEP traffic.

Interface name        | Interface type | VLAN ID | Subnet              | Allow float  | NSX-T Interface   | DPG/Segment Name
----------------------|----------------|---------|---------------------|--------------|-------------------|------------------------------
vlan-nic-nsx-edge-1   | vlan           | 100     | vpc-mgmt-subnet     | true         | NSX-T Edge 1 Mgmt | dpg-mgmt
vlan-nic-nsx-edge-2   | vlan           | 100     | vpc-mgmt-subnet     | true         | NSX-T Edge 2 Mgmt | dpg-mgmt
vlan-nic-tep-edge-1   | vlan           | 400     | vpc-tep-subnet      | true         | NSX-T Edge 1 TEP  | vpc-zone-edge-tep
vlan-nic-tep-edge-2   | vlan           | 400     | vpc-tep-subnet      | true         | NSX-T Edge 2 TEP  | vpc-zone-edge-tep
{: caption="Table 3. Edge management and TEP VLAN interfaces" caption-side="top"}


1. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for edge management.

   **Edge 1 management:**

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_MGMT_1=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-edge-mgmt-1 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_MGMT_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_EDGE_MGMT_1 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Edge 1 management IP : "$VMWARE_VNIC_NSX_T_EDGE_MGMT_1_IP
   ```
   {: codeblock}

   **Edge 2 management:**

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_MGMT_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-edge-mgmt-2 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_MGMT_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_EDGE_MGMT_2 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Edge 2 management IP : "$VMWARE_VNIC_NSX_T_EDGE_MGMT_2_IP
   ```
   {: codeblock}

2. Provision {{site.data.keyword.bm_is_short}} VLAN interfaces for Edge TEPs.

   **Edge 1 TEP:**

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_TEP_1=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 400 --allow-interface-to-float true --name vlan-nic-edge-tep-1 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_TEP_1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_EDGE_TEP_1 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Edge 1 TEP IP : "$VMWARE_VNIC_NSX_T_EDGE_TEP_1_IP
   ```
   {: codeblock}

   **Edge 2 TEP:**

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_TEP_2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 400 --allow-interface-to-float true --name vlan-nic-edge-tep-2 --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VNIC_NSX_T_EDGE_TEP_2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_NSX_T_EDGE_TEP_2 --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "NSX Edge 2 TEP IP : "$VMWARE_VNIC_NSX_T_EDGE_TEP_2_IP
   ```
   {: codeblock}

3. Add NSX Edge management IPs to DNS Zone as `A records` to the DNS Service.

   **Edge 1 management:**

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name edge-1 --ipv4 $VMWARE_VNIC_NSX_T_EDGE_MGMT_1_IP
   ```
   {: codeblock}

   **Edge 2 management:**

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name edge-2 --ipv4 $VMWARE_VNIC_NSX_T_EDGE_MGMT_2_IP
   ```
   {: codeblock}


## Next steps
{: #vpc-bm-vmware-nsx-t-vlannics-next-steps}

The next step in the tutorial series is:

* [Deploy {{site.data.keyword.vpc_short}} NSX-T](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nsx-t-hosts#vpc-bm-vmware-nsx-t-deployment) 