---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2021-01-05"
lasttested: "2019-03-08"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: service1, service2
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

# Deploy Public Gateway and Floating IPs for VMware Virtual Machines

{: #vpc-bm-vmware-pgwip}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

If your VMware Virtua Machines require public Internet Access, you need to use either Public Gateway (outbound) or Floating IP (inbound). This tutorial provides an example for these use cases for a VMware VM's VLAN NIC.
{:shortdesc}

Important. This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives).
{:important}

## Objectives
{: #vpc-bm-vmware-pgwip-objectives}

If your VMware Virtual Machines require public Internet Access, you need to use either Public Gateway (outbound) or Floating IP (inbound). This tutorial will provide you examples how to configure internet access for your VMware Virtual Machines using these VPC network constructs.

![Deploying Public Gateway and/or Floating IPs for a VMware Virtual Machines](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-Non-NSX-based-VMs-pgw.svg "Deploying Public Gateway and/or Floating IPs for a VMware Virtual Machines"){: caption="Figure 1. Deploying Public Gateway and/or Floating IPs for a VMware Virtual Machines" caption-side="bottom"}

1. The user does this
2. Then that
3. Create a .drawio file in diagrams/ directory with the same name as the tutorial.md only tutorial.drawio with a separate tab for each diagram

## Before you begin
{: #vpc-bm-vmware-pgwip-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

Important. This tutorial is part of series, and requires that you have completed the related tutorials.
{:important}

Make sure you have successfully completed the required previous steps

* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
* [Provision vCenter Appliance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
* [Provision vSAN storage cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan)
* [Provision NFS storage and attach to cluster](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)
* [Provision VPC Subnets and configure Distributed Virtual Switch Portgoups for VMs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-newvm#vpc-bm-vmware-newvm)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

## Establish Outbound Internet Access with Public Gateway
{: #vpc-bm-vmware-pgwip-outbound}
{: step}

VPC subnets are private by default. If your VMware Virtual Machines on the VM subnet ('$SUBNET_VM1') need outbound internet access, a Public Gateway is needed. A Public Gateway enables a subnet and all its attached virtual or bare metal server instances to connect to the internet. After a subnet is attached to the Public Gateway, all instances in that subnet can connect to the internet. Public Gateways use Many-to-1 SNAT.

1. As you already provisioned a Public Gateway ('$PUBLIC_GW') in the previous step for this VPC Zone, you only need to attach that to the VM subnet ('$SUBNET_VM1').

```bash
ibmcloud is subnetu $VMWARE_SUBNET_VM1 --public-gateway-id $VMWARE_PUBLIC_GW
```

2. After you have attached your newly created subnet to public gateway, you shold be able access Internet from the VM, e.g.:

```bash
ping 1.1.1.1
```

Tip. To control outbound Internet access from your virtual machines, you can use security groups or access control lists. In this example, the default security group allows all outbound Internet access.
{:tip}

## Establish Inbound Internet Access with Floating IP
{: #vpc-bm-vmware-pgwip-inbound}
{: step}

If you want to access the VMware Virtual Machines directly from the Internet, you need to provision a Floating IP to the VLAN NIC. Floating IP addresses are IP addresses that are provided by IBM Cloud platform and are reachable from the public Internet. You can reserve a Floating IP address from the pool of available addresses that are provided by IBM, and you can associate it with a network interface of your server, and VLAN NIC in this case. That VLAN NIC will keep its private IP address, and the Floating IP provides a One-to-One NAT to this private IP. Note that, associating a floating IP address with an instance removes the instance from the public gateway's Many-to-1 SNAT.

1. Create a floating IP for the First Virtual Machines (VM1) VLAN NIC and record the IP.

```bash
VMWARE_VM_FIP=$(ibmcloud is ipc floating-ip-vm-1 --nic-id $VMWARE_VNIC_VM1 --output json | jq -r .address)
echo "Public IP for your VLAN NIC : "$VMWARE_VM_FIP
```

Tip. To control access to your virtual machine, you may need to update the VLAN NIC's security group (or access control lists).
{:tip}

2. If you provisioned the VM's VLAN interface with the default VPC security group, use following commands:

```bash
VMWARE_VM_FIP_SG=$(ic is vpc $VMWARE_VPC --output json | jq -r .default_security_group.id)
ibmcloud is sg-rulec $VMWARE_VM_FIP_SG inbound tcp --port-min <your_port_number> --port-max <your_port_number> --remote <add_your_IP_here>
```

3. If you provisioned a new security group for the VLAN interface e.g. with a name 'your-security-group', use can use following commands:

```bash
VMWARE_VM_FIP_SG=$(ic is bm-nic $ESX1 $VMWARE_VNIC_VM1 --output json | jq -r '.security_groups[] | select(.name == "your-security-group")'.id)
ibmcloud is sg-rulec $VMWARE_VM_FIP_SG inbound tcp --port-min <your_port_number> --port-max <your_port_number> --remote <add_your_IP_here>
```
