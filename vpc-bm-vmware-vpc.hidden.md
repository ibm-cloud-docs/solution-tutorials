---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-08-30"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, vmwaresolutions
account-plan: paid
completion-time: 2h
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

# Provision VPC for a VMware Deployment
{: #vpc-bm-vmware-vpc}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

In this tutorial, you will deploy a VPC for a VMware Deployment and a jump machine for configuration tasks.
{: shortdesc}

This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}


## Objectives
{: #vpc-bm-vmware-vpc-objectives}

In this tutorial, you will create a VPC for your VMware Deployment. The following diagram shows the VPC layout and subnets to be provisioned. NSX-T subnets are optional for NSX-T based deployments.

In this tutorial, a dedicated VPC for VMware is used, but you can alter and modify the deployment based on your needs.  

![VPC Subnets for VMware Deployment](images/solution63-ryo-vmware-on-vpc-hidden/Self-Managed-Simple-20210813v1-VPC-subnets.svg) "VPC Subnets for VMware Deployment"){: caption="Figure 1. VPC Subnets for VMware Deployment" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-vpc-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

This tutorial is part of series, and it is required that you follow the [order](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives).

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.


## Create a VPC
{: #vpc-bm-vmware-vpc-create}
{: step}

1. Create a VPC, and record its ID and CRN.

   ```sh
   VMWARE_VPC=$(ibmcloud is vpcc vmw --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VPC_CRN=$(ibmcloud is vpc $VMWARE_VPC --output json | jq -r .crn)
   ```
   {: codeblock}

   You can use the commands directly e.g. 'ibmcloud is vpcc ic4v' without using the json output format and store the required values into variables manually, if you prefer this way.
   {: tip}

   All local variables used in this tutorial start with 'VMWARE_' and they are present within the current instance of the shell. If you want to collect them after for future use, you can use the following command.
   {: tip}

      ```sh
      ( set -o posix; set; set +o posix ) | grep VMWARE_
      ```
      {: codeblock}


## Provision a Prefix
{: #vpc-bm-vmware-vpc-prefix}
{: step}

1. Provision a prefix for the VPC. In this example '10.97.0.0/22' is used in Zone 'eu-de-1'.

   ```sh
   VMWARE_VPC_ZONE=eu-de-1
   ```
   {: codeblock}

   ```sh
   VMWARE_PREFIX=$(ibmcloud is vpc-address-prefix-create <UNIQUE_PREFIX_NAME> $VMWARE_VPC $VMWARE_VPC_ZONE 10.97.0.0/22)
   ```
   {: codeblock}


## Provision Subnets
{: #vpc-bm-vmware-vpc-subnets}
{: step}

Multiple subnets will be needed for various use cases in the VMware deployment, such as:

* hosts
* management
* vMotion
* vSAN
* [OPTIONAL] TEP
* [OPTIONAL] Virtual machines (attached directly to a VPC subnet)
* [OPTIONAL] NSX-T T0 uplinks

1. Provision the following VPC subnets, and record their IDs for future use. The subnets have been provisioned inside the CIDR block defined in the VPC zone's prefix.

   ```sh
   VMWARE_SUBNET_HOST=$(ibmcloud is subnetc vmw-host-mgmt-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.0.0/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_SUBNET_MGMT=$(ibmcloud is subnetc vmw-inst-mgmt-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.0.128/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_SUBNET_VMOT=$(ibmcloud is subnetc vmw-vmot-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.1.0/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_SUBNET_VSAN=$(ibmcloud is subnetc vmw-vsan-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.2.0/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_SUBNET_TEP=$(ibmcloud is subnetc vmw-tep-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.1.128/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}

2. List the subnets and take a note of the CIDRs. Check that this maps your network addressing design.

   ```sh
   ibmcloud is subnets
   ```
   {: codeblock}


## Provision a Public Gateway for Management Subnet
{: #vpc-bm-vmware-vpc-pgw}
{: step}

Subnets are private by default. As the management subnet needs outbound internet access (e.g. for getting software updates from VMware), a Public Gateway is needed. A Public Gateway enables a subnet and all its attached virtual or bare metal server instances to connect to the internet. After a subnet is attached to the public gateway, all instances in that subnet can connect to the internet. Public gateways use Many-to-1 SNAT.

1. Provision a Public Gateway and attach that to the management subnet.

   ```sh
   VMWARE_PUBLIC_GW=$(ibmcloud is public-gateway-create vmware-mgmt-internet-outbound $VMWARE_VPC $VMWARE_VPC_ZONE --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   ibmcloud is subnetu $VMWARE_SUBNET_MGMT --public-gateway-id $VMWARE_PUBLIC_GW
   ```
   {: codeblock}


## Create a SSH Key
{: #vpc-bm-vmware-vpc-sshkey}
{: step}

If you have not already done so, create a SSH key for the VPC. The SSH key is used e.g. for accessing linux based virtual servers or decrypting the passwords.

1. Create a new key on your local workstation or use on existing key based on your preferences. For more information, refer to [IBM Cloud Docs](https://{DomainName}/docs/vpc?topic=vpc-ssh-keys).

2. Record and note the SSH key ID.

   ```sh
   SSH_KEY=<your_ssh_key_ID>
   ```
   {: codeblock}


## Provision a Jump Machine / Bastion Host
{: #vpc-bm-vmware-vpc-jump}
{: step}

To ease up VMware configuration tasks, provision a Windows server on the management subnet in your VPC. In this tutorial, the Jump server will be used to access ESXi hosts and vCenter after they have been provisioned over the VPC network. The Jump server will be provisioned in to the Instance management subnet ($VMWARE_SUBNET_MGMT) and it will have network access to the baremetal server and the vCenter after. In addition, inbound and outbound Internet access is provided for easy remote access as well as downloading required VMware or other software.

For more information on creating Virtual Servers, refer to [creating Virtual Servers using UI](https://{DomainName}/docs/vpc?topic=vpc-creating-virtual-servers) or [creating Virtual Servers using CLI](https://{DomainName}/docs/vpc?topic=vpc-creating-virtual-servers-cli). In this example the CLI method is used.

1. List available images and select your preferred image. You can use the following CLI command to list all available images:

   ```sh
   ibmcloud is images
   ```
      {: codeblock}

2. Record the image ID. In this example, Windows Server 2019 is used as the Jump.

   ```sh
   IMAGE_WIN=$(ibmcloud is images --output json | jq -r '.[] | select(.name == "ibm-windows-server-2019-full-standard-amd64-6")'.id)
   ```
   {: codeblock}

3. Create a Windows Virtual Server with CLI or UI. Once the Virtual Server Instance is created, record the Jump server's ID and its NIC ID.

   ```sh
   VMWARE_JUMP=$(ibmcloud is instance-create jump-001 $VMWARE_VPC $VMWARE_VPC_ZONE bx2-2x8 $VMWARE_SUBNET_MGMT --image-id $IMAGE_WIN --key-ids $SSH_KEY --output json | jq -r .id)
   ```
   {: codeblock}
   
   ```sh
   VMWARE_JUMP_NIC=$(ibmcloud is in $VMWARE_JUMP --output json | jq -r '.network_interfaces[0].id')
   ```
   {: codeblock}

   In this example, the Jump server is accessed directly from the Internet and a Floating IP to the server for this purpose. Floating IP addresses are IP addresses that are provided by IBM Cloud platform and are reachable from the public internet. You can reserve a floating IP address from the pool of available addresses that are provided by IBM, and you can associate it with a network interface of your server. That interface also will have a private IP address.

4. Create a floating IP for the Virtual Server and record the IP.

   ```sh
   VMWARE_JUMP_FIP=$(ibmcloud is ipc jump-001-ip --nic-id $VMWARE_JUMP_NIC --output json | jq -r .address)
   ```
   {: codeblock}
   
   ```sh
   echo "Public IP for the Jump : "$VMWARE_JUMP_FIP
   ```
   {: codeblock}

5. To get the server Administrator’s password, use the SSH key to decrypt it. In this example, the private key is located in the folder '~/.ssh/' in the workstation where 'ibmcloud' CLI command in run from.

   ```sh
   ibmcloud is in-init $VMWARE_JUMP --private-key @~/.ssh/id_rsa
   ```
   {: codeblock}

   If running inside of Git sh on Windows, prefix the above command with 'MSYS_NO_PATHCONV=1', for example 'MSYS_NO_PATHCONV=1 ibmcloud is in-init ...'.
   {: tip}

6. Modify security group rule to allow inbound access.

   Inbound access to Microsoft Remote Desktop (RDP) port (TCP/3389) is blocked by default. Add a SG rule for inbound TCP/3389 from your IP to access the jump.
   {: tip}

   ```sh
   VMWARE_JUMP_NIC_SG=$(ibmcloud is in $VMWARE_JUMP --output json | jq -r '.network_interfaces[0].security_groups[0].id')
   ```
   {: codeblock}
   
   ```sh
   ibmcloud is sg-rulec $VMWARE_JUMP_NIC_SG inbound tcp --port-min 3389 --port-max 3389 --remote <add_your_IP_here>
   ```
   {: codeblock}

1. Login into the Windows Jump server with Microsoft Remote Desktop client using the credentials provided earlier. 

2. Install [Mozilla Firefox](https://www.mozilla.org/), [Google Chrome](https://www.google.com/intl/us_en/chrome/) or [Microsoft Edge](https://www.microsoft.com/en-us/edge) into your Jump server. One of these browsers is required e.g. to access hosts or vCenter later in this tutorial.

   You may need to use SSH later when configuring, managing or configuring various VMware assets. SSH is not required in this tutorial, but it is useful. You may use your favorite SSH client in the Jump server, such as [PuTTY](https://www.putty.org) or [mRemoteNG](https://mremoteng.org).
   {: tip}

## Next Steps
{: #vpc-bm-vmware-vpc-next-steps}

The next step in the tutorial series is:

* [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
