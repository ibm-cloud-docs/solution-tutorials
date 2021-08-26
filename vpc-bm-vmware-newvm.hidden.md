---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-08-26"
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

# Provision VPC Subnets and configure Distributed Virtual Switch Portgroups for VMs
{: #vpc-bm-vmware-newvm}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This is a Beta feature that requires special approval. Contact your IBM Sales representative if you are interested in getting access.
{: beta}

This tutorial presents a simple example to deploy a VMware virtual machine running on VMware cluster and attached to VPC subnet using a VLAN interface and allow the virtual machine to vMotion between hosts.
{: shortdesc}

Important. This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives).
{: important}

## Objectives
{: #vpc-bm-vmware-newvm-objectives}

In this tutorial, you will create a VMware virtual machine running on VMware cluster using VPC and VPC bare metal server network constructs. Your virtual machine will be attached to VPC subnet using bare metal server's VLAN NIC.

![Virtual machines attached to VPC subnet](images/solution63-ryo-vmware-on-vpc-hidden/Self-Managed-Simple-20210813v1-Non-NSX-based-VMs.svg "Virtual machines attached to VPC subnet"){: caption="Figure 1. Virtual machines attached to VPC subnet" caption-side="bottom"}

1. Create a VPC prefix and a subnet for VMware Virtual machines
2. Allow new VLAN on PCI NICs
3. Create a VLAN NIC
4. Create new Portgroup for the Distributed Switch
5. Deploy a first Virtual Machine
6. Run a vMotion test for the first Virtual Machine
7. Deploy a second Virtual Machine

## Before you begin
{: #vpc-bm-vmware-newvm-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

Important. This tutorial is part of series, and requires that you have completed the related tutorials.
{: important}

Make sure you have successfully completed the required previous steps

* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan) or
* [Provision NFS storage and attach to cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

Note. When advised to use Web browser, use the Jump machine provisioned in the [VPC provisioning tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. 'https://vcenter.vmware.ibmcloud.local' as used in this example.
{: note}

## Create a VPC prefix and a subnet for VMware Virtual machines
{: #vpc-bm-vmware-newvm-prefix}
{: step}

### Create a VPC prefix
{: #vpc-bm-vmware-newvm-create-prefix}

In this example, a new VPC prefix for VMware VMs is created.

1. Create a prefix. '192.168.0.0/20' is used as the new prefix for VPC.

```bash
VMWARE_PREFIX_VM_1=$(ibmcloud is vpc-address-prefix-create vmw-vm-prefix $VMWARE_VPC $VMWARE_VPC_ZONE 192.168.0.0/20)
```

### Create a VPC subnet
{: #vpc-bm-vmware-newvm-create-subnet}

Next you will create a new VPC subnet with a name 'vmw-vm-subnet-1'.

1. Create a subnet using an IP subnet / CIDR block '192.168.0.0/24'.

```bash
VMWARE_SUBNET_VM1=$(ibmcloud is subnetc vmw-vm-subnet-1 $VMWARE_VPC --ipv4-cidr-block 192.168.0.0/24 --zone $VMWARE_VPC_ZONE --json | jq -r .id)
```

This VPC subnet will be used as the subnet for your initial virtual machines.

## Allow new VLAN on PCI NICs
{: #vpc-bm-vmware-newvm-allow-vlans}
{: step}

VLAN 1000 is used as the VLAN ID for the subnet in this tutorial. You can customize the VLAN IDs based on your preferences.

1. Allow the Bare metal server PCI NICs to use the VLAN ID.

```bash
ibmcloud is bm-nicu $VMWARE_BMS001 $VMWARE_BMS001_PNIC --allowed-vlans 100,200,300,400,1000
ibmcloud is bm-nicu $VMWARE_BMS002 $VMWARE_BMS002_PNIC --allowed-vlans 100,200,300,400,1000
ibmcloud is bm-nicu $VMWARE_BMS003 $VMWARE_BMS003_PNIC --allowed-vlans 100,200,300,400,1000
```

Important. It is important to allow the VLAN for each VMware host's PCI interface in your cluster to retain connectivity after vMotion.  
{: important}

## Create a VLAN NIC
{: #vpc-bm-vmware-newvm-create-vlannic}
{: step}

Next you will create a new VLAN NIC in the subnet '192.168.0.0/24', which is allowed to 'float' between host (for enabling vMotion).

1. Create a VLAN interface.

```bash
VMWARE_VNIC_VM1=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_VM1 --interface-type vlan --vlan 1000 --allow-interface-to-float true --name vlan-nic-vm-1 --output json | jq -r .id)
```

2. Get the IP address allocated by VPC.

```bash
VMWARE_VM1_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_VM1 --output json | jq -r .primary_ipv4_address)
echo "IP for VM-1 : "$VMWARE_VM1_IP
```

In this example, IP address '192.168.0.4' was allocated for the VLAN NIC by VPC. You will need to configure this for the virtual machine with a netmask '/24' and a default gateway '192.168.1.1'.

3. Alternatively, you could allow VPC to provide an IP address to the VMware Virtual Machine via DHCP by configuring a VPC provided MAC address to the Virtual Machine's network interface.

```bash
VMWARE_VM1_MAC=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_VM1 --output json | jq -r .mac_address)
echo "MAC address for VM-1 : "$VMWARE_VM1_MAC
```

## Create new Portgroup for the Distributed Switch
{: #vpc-bm-vmware-newvm-create-dpg}
{: step}

Next, you need to create a Portgroup for the VMs in the Distributed Switch in vCenter. This portgroup must use VLAN ID '1000' (or any VLAN ID you chose in your setup).

To create a Port Group for the  Distributed Switch:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. On the vSphere Client Home page, click Networking and navigate to the distributed switch.
3. Right-click the distributed switch and select Distributed port group > New distributed port group.
4. On the Name and location page, enter the name of the new distributed port group (e.g. 'dpg-vm-subnet-1000'), or accept the generated name, and click Next.
5. On the Configure settings page, set the general properties for the new distributed port group and click Next.
6. Use the VLAN type drop-down menu to specify the type of VLAN traffic filtering and marking. Select VLAN and in the VLAN ID text box, enter the VLAN number '1000'.
7. On the Ready to complete page, review your settings and click Finish.

## Deploy a first Virtual Machine
{: #vpc-bm-vmware-newvm-deploy-vm1}
{: step}

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Deploy a VM on your Vmware cluster with the following configurations:

* Cluster : Previously created VMware cluster or one of its hosts
* Storage : Previously created NFS or vSAN
* Portgroup : 'dpg-vm-subnet-1000'
* IP address : 192.168.0.4/24
* Default Gateway : 192.168.0.1
* DNS : 161.26.0.7, 161.26.0.8
* NTP : 161.26.0.6

Note. For more information on deploying virtual machines on VMware, see [Deploying Virtual Machines on VMware Docs](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.vm_admin.doc/GUID-39D19B2B-A11C-42AE-AC80-DDA8682AB42C.html).
{: note}

2. After the deployment, test that you can ping your default gateway and that you can resolve names with DNS.

```bash
ping 192.168.0.1
ping 161.26.0.7
nslookup {DomainName}
```

## Run a vMotion test for the first Virtual Machine
{: #vpc-bm-vmware-newvm-vmotion}
{: step}

At this point, you may try to move your VM from the original host (e.g. BMS001) to another host with vMotion.

To migrate the created VM:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Click to select the vCenter Virtual Machine.
3. Right Click, and select migrate
4. Click Change compute resource only, click Next.
5. Select e.g. BMS002 / esx-002, click Next
6. Keep the same Port group, click Next.
7. Select your preferred vMotion priority, click Next.
8. Click Finish.

Network connectivity should remain intact and you should be able to see your Virtual Machine running on a different host e.g. BMS002 / esx-002 via vCenter.

In addition, if you run the following commands, you can see the location change of the VLAN NIC 'vlan-nic-vm-1'.

```bash
ibmcloud is bm-nics $VMWARE_BMS001
Listing network interfaces of server 02b7-18928fa3-55b7-4d63-a2bb-b0d832ea19bc under account IBM Cloud Acc as user xxx@yyy.com...
ID                                          Name                  Status      Type        Address       Floating IP   Interface Type   MAC address         Allowed VLANs                   VLAN ID   
02b7-122e2c9e-3a9d-4f0c-87c3-f6d75f40a51d   pci-nic-vmnic0        available   primary     10.97.0.5                   pci              02:00:02:21:ED:95   100, 200, 300, 400, 500, 1000   -   
02b7-6103583c-8a01-4506-95bd-f30eb7338561   vlan-nic-tep-vmk10    available   secondary   10.97.1.132                 vlan             02:00:01:21:ED:9A   -                               400   
02b7-8114ba6d-0dbd-4453-b38d-83db068cf959   vlan-nic-vmotion-vmk1 available   secondary   10.97.1.4                   vlan             02:00:01:21:ED:97   -                               200   
02b7-9276f471-1426-49ee-8e8c-0a6d964eccdb   vlan-nic-vsan-vmk2    available   secondary   10.97.2.8                   vlan             02:00:05:21:ED:98   -                               300   
```

```bash
$ ibmcloud is bm-nics $VMWARE_BMS002
Listing network interfaces of server 02b7-02890a7a-e543-4479-92d5-a9d7d5819286 under account IBM Cloud Acc as user xxx@yyy.com...
ID                                          Name                  Status      Type        Address       Floating IP   Interface Type   MAC address         Allowed VLANs                   VLAN ID   
02b7-ba818812-d5a6-4622-9ea5-c5088a60d724   pci-nic-vmnic0        available   primary     10.97.0.6                   pci              02:00:03:21:ED:95   100, 200, 300, 400, 500, 1000   -   
02b7-736f325e-9b3b-4254-8c0c-6c4add8934c3   vlan-nic-tep-vmk10    available   secondary   10.97.1.133                 vlan             02:00:02:21:ED:9A   -                               400   
02b7-94073d6d-6658-4b91-b4e1-b15a15fdbf4d   vlan-nic-vsan-vmk2    available   secondary   10.97.2.6                   vlan             02:00:03:21:ED:98   -                               300   
02b7-97c2c802-a236-41c7-b6ca-bd9f0145cba2   vlan-nic-vmotion-vmk1 available   secondary   10.97.1.5                   vlan             02:00:02:21:ED:97   -                               200   
02b7-159f23b6-67e1-4aca-a4b8-36fede3b8fc7   vlan-nic-vcenter      available   secondary   10.97.0.132                 vlan             02:00:01:22:01:2B   -                               100   
02b7-9d8a9d99-c11a-4573-ad69-737f8878387e   vlan-nic-vm-1         available   secondary   192.168.0.4                 vlan             02:00:01:22:6B:AC   -                               1000   
```

You should be able to access ping / access other Virtual Machines on the same VPC subnet from the provisioned Virtual Machine.

Note. In a VMware environment, traffic between VLAN network interfaces that have the same VLAN ID on the same bare metal server will typically be switched by the Standard / Distributed vSwitch internally within the server and never reach the VPC network. For example, on a bare metal server host, the default Standard vSwitch is vSwitch0. You can create a Port Group with VLAN ID 111 and add it to vSwitch0. Traffic between network interfaces attached to Port Group 111 is controlled by vSwitch0. This has the consequences for Security Group rules that control traffic between the network interfaces in Port Group 111 - they will not be applied to the internal traffic. If you need Security Group rules enforced, you should use separate VLAN IDs for the VLAN interfaces.
{: note}

## Deploy a second Virtual Machine
{: #vpc-bm-vmware-newvm-deploy-vm2}
{: step}

This time you will deploy a 2nd Virtual machine to the cluster, but using a new VLAN NIC and using a different VLAN ID '1001' but attached to the same VPC subnet 'SUBNET_VM1'. You may alter the VLAN ID based on your preferences.

1. Allow the VLAN ID '1001' for the bare metal servers' PCI interface.

With the process outlined in the previous example, you can allow the BMSs to use the new VLAN ID with the following commands:

```bash
ibmcloud is bm-nicu $VMWARE_BMS001 $VMWARE_BMS001_PNIC --allowed-vlans 100,200,300,400,1000,1001
ibmcloud is bm-nicu $VMWARE_BMS002 $VMWARE_BMS002_PNIC --allowed-vlans 100,200,300,400,1000,1001
ibmcloud is bm-nicu $VMWARE_BMS003 $VMWARE_BMS003_PNIC --allowed-vlans 100,200,300,400,1000,1001
```

2. Create a new VLAN NIC in the subnet '192.168.0.0/24', which is allowed to float between host (for vMotion).

```bash
VMWARE_VNIC_VM2=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_VM1 --interface-type vlan --vlan 1001 --allow-interface-to-float true --name vlan-nic-vm-2 --output json | jq -r .id)
```

3. Get the IP address allocated by VPC, by using the following commands:

```bash
VMWARE_VM2_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_VM2 --output json | jq -r .primary_ipv4_address)
echo "IP for VM-2 : "$VMWARE_VM2_IP
```

In this example, IP address '192.168.0.5' was allocated by VPC, which you will need to configure for the virtual machine with netmask '/24' and default gateway '192.168.0.1'.

4. Using the process outlined on the previous example, create a new DPG via vCenter with VLAN ID '1001'.

5. Deploy a new Virtual Machine with the following parameters:

* Cluster : Previously created VMware cluster or one of its hosts
* Storage : Previously created NFS or vSAN
* Portgroup : 'dpg-vm-subnet-1001'
* IP address : 192.168.0.5/24
* Default Gateway : 192.168.0.1
* DNS : 161.26.0.7, 161.26.0.8
* NTP : 161.26.0.6

5. At this point you should be able to ping the first Virtual Machine (VM1) from this newly created Virtual Machine (VM2).

```bash
ping 192.168.0.4
```
