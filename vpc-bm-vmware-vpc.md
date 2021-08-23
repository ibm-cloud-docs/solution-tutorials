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

# Deploy VPC for a VMware Deployment
{: #vpc-bm-vmware-vpc}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

In this tutorial, you will deploy a VPC for a VMware Deployment and a jump machine for configuration tasks.
{:shortdesc}

Important. This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives). 
{:important}

## Objectives
{: #vpc-bm-vmware-vpc-objectives}

The following diagram shows the VPC layout and subnets to be provisioned. NSX-T subnets are optional for NSX-T based deployments.

![VPC Subnets for VMware Deployment](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-VPC-subnets.svg) "VPC Subnets for VMware Deployment"){: caption="Figure 1. VPC Subnets for VMware Deployment" caption-side="bottom"}

In this tutorial, a dedicated VPC for VMware is used, but you can alter and modify the deployment based on your needs.  

1. Create a VPC
2. Provision a Prefix
3. Provision Subnets
4. Provision a Public Gateway for Management Subnet
5. Create a SSH Key
6. Provision a Jump Machine / Bastion Host


## Before you begin
{: #vpc-bm-vmware-vpc-prereqs}

This tutorial requires:
* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

Important. This tutorial is part of series, and it is required that you follow the [order](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives).
{:important}

[Login](https://cloud.ibm.com/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region.


## Create a VPC
{: #vpc-bm-vmware-vpc-create}
{: step}

Create a VPC, and record its ID and CRN.

```bash
VMWARE_VPC=$(ibmcloud is vpcc vmw --output json | jq -r .id)
VMWARE_VPC_CRN=$(ibmcloud is vpc $VMWARE_VPC --output json | jq -r .crn)
```

Note: You can use the commands directly e.g. 'ibmcloud is vpcc ic4v' without using the json output format and store the required values into variables manually, if you prefer this way. 
{:tip}

For example:

```bash
$ ibmcloud is vpcc vmw
Creating vpc vmw-sami under account IBM Cloud Acc as user xxx@yyy.com...
                                                  
ID                                             r010-366ecef2-3e98-4559-87ef-5bd78022c54e   
Name                                           vmw
CRN                                            crn:v1:bluemix:public:is:eu-de:a/1b0834ebce7f4b94983d856f532ebfe2::vpc:r010-366ecef2-3e98-4559-87ef-5bd78022c54e   
Status                                         pending   
Classibmcloud access                                 false   
Created                                        2021-08-04T10:41:39+03:00   
Resource group                                 ID                                 Name      
                                               28b0e7d18da9417ea85b2ba308088657   Default      
                                                  
Default network ACL                            ID                                          Name      
                                               r010-14260f3f-d680-417a-88ef-a2e7052426bf   work-cresting-subatomic-portside      
                                                  
Default security group                         ID                                          Name      
                                               r010-79fef5bb-95e5-468b-9955-43aae03c8a17   breath-reflux-revivable-race      
                                                  
Default routing table                          ID                                          Name      
                                               r010-2f1c8ef7-afbf-46ad-8aed-858bb184b0fd   wielder-jiffy-freight-bottomless      
                                                  
                                                  
Cloud Service Endpoint source IP addresses:    Zone      Address      
                                               eu-de-1   10.223.27.32      
                                               eu-de-2   10.223.43.115      
                                               eu-de-3   10.223.53.208      

```

In this case the VPC ID is 'r010-366ecef2-3e98-4559-87ef-5bd78022c54e' and its CRN is 'crn:v1:bluemix:public:is:eu-de:a/1b0834ebce7f4b94983d856f532ebfe2::vpc:r010-366ecef2-3e98-4559-87ef-5bd78022c54e'. These values are needed several times when creating various assets, so it is convenient to store these in variables.

Tip. All local variables used in this tutorial start with 'VMWARE_' and they are present within the current instance of the shell. If you want to collect them after for future use, you can use the following command:

```bash
( set -o posix; set; set +o posix ) | grep VMWARE_
```

## Provision a Prefix
{: #vpc-bm-vmware-vpc-prefix}
{: step}

Provision a prefix for the VPC. In this example '10.97.0.0/22' is used in Zone 'eu-de-1'.

```bash
VMWARE_VPC_ZONE=eu-de-1
VMWARE_PREFIX=$(ibmcloud is vpc-address-prefix-create <UNIQUE_PREFIX_NAME> $VMWARE_VPC $VMWARE_VPC_ZONE 10.97.0.0/22)
```

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
* [OPTIONAL] NSX-T T0 uplinks (tbd later)

Provision the following VPC subnets, and record their IDs for future use. The subnets have been provisioned inside the VPC zone specifibmcloud prefix defined in the previous step.

```bash
VMWARE_SUBNET_HOST=$(ibmcloud is subnetc vmw-host-mgmt-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.0.0/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
VMWARE_SUBNET_MGMT=$(ibmcloud is subnetc vmw-inst-mgmt-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.0.128/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
VMWARE_SUBNET_VMOT=$(ibmcloud is subnetc vmw-vmot-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.1.0/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
VMWARE_SUBNET_VSAN=$(ibmcloud is subnetc vmw-vsan-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.2.0/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
VMWARE_SUBNET_TEP=$(ibmcloud is subnetc vmw-tep-subnet $VMWARE_VPC --ipv4-cidr-block 10.97.1.128/25 --zone $VMWARE_VPC_ZONE --output json | jq -r .id)
```

List the subnets and take a note of the CIDRs. Check that this maps your network addressing design.

```bash
$ ibmcloud is subnets
Listing subnets in resource group Default and region eu-de under account IBM Cloud Acc as user xxx@yyy.com...
ID                                          Name                         Status      Subnet CIDR      Addresses   ACL                              Public Gateway   VPC         Zone      Resource group   
02b7-e298b6db-eb18-40af-ac69-2cab0d2161ee   vmw-host-mgmt-subnet   available   10.97.0.0/25     119/128     vascular-attend-fancier-gurgle   -                ic4v   eu-de-1   Default   
02b7-d16dbb14-00e8-44ea-a85e-452a57e67b79   vmw-inst-mgmt-subnet   available   10.97.0.128/25   122/128     vascular-attend-fancier-gurgle   -                ic4v   eu-de-1   Default   
02b7-fd0fac49-e154-473a-a543-709bb0f1a10e   vmw-vmot-subnet        available   10.97.1.0/25     123/128     vascular-attend-fancier-gurgle   -                ic4v   eu-de-1   Default   
02b7-436453c0-8769-4260-8e44-18df56afd1e3   vmw-vsan-subnet        available   10.97.2.0/25     123/128     vascular-attend-fancier-gurgle   -                ic4v   eu-de-1   Default   
02b7-cd53ac25-60d3-4c41-9a00-0caa6f1d54ae   vmw-tep-subnet        available   10.97.1.128/25   123/128     vascular-attend-fancier-gurgle   -                ic4v   eu-de-1   Default   
```

## Provision a Public Gateway for Management Subnet
{: #vpc-bm-vmware-vpc-pgw}
{: step}

Subnets are private by default. As the management subnet needs outbound internet access (e.g. for getting software updates from VMware), a Public Gateway is needed. A Public Gateway enables a subnet and all its attached virtual or bare metal server instances to connect to the internet. After a subnet is attached to the public gateway, all instances in that subnet can connect to the internet. Public gateways use Many-to-1 SNAT.

Provision a Public Gateway and attach that to the management subnet.

```bash
VMWARE_PUBLIC_GW=$(ibmcloud is public-gateway-create vmware-mgmt-internet-outbound $VMWARE_VPC $VMWARE_VPC_ZONE --output json | jq -r .id)
ibmcloud is subnetu $VMWARE_SUBNET_MGMT --public-gateway-id $VMWARE_PUBLIC_GW
```

## Create a SSH Key
{: #vpc-bm-vmware-vpc-sshkey}
{: step}

If you have not already done so, create a SSH key for the VPC. The SSH key is used e.g. for accessing linux based virtual servers or decrypting the passwords.

Create a new key on your local workstation or use on existing key based on your preferences. For more information, refer to [IBM Cloud Docs](https://cloud.ibm.com/docs/vpc?topic=vpc-ssh-keys).

Record and note the SSH key ID.

```bash
SSH_KEY=<your_ssh_key_ID>
```

## Provision a Jump Machine / Bastion Host
{: #vpc-bm-vmware-vpc-jump}
{: step}

To ease up configuration tasks, provision a Windows server on the management subnet with a floating IP.  

Create a Windows Virtual Server with CLI or UI. For more information on creating Virtual Servers, refer to [creating Virtual Servers using UI](https://cloud.ibm.com/docs/vpc?topic=vpc-creating-virtual-servers) or [creating Virtual Servers using CLI](https://cloud.ibm.com/docs/vpc?topic=vpc-creating-virtual-servers-cli). In this example the CLI method is used.

To list all available images, you can use the following CLI command:

```bash
ibmcloud is images
```

In this example, Windows Server 2019 is used as the Jump.

```bash
$ ibmcloud is images | grep windows-server-2019
r010-8fe2043d-4a25-44bd-8016-7980e1346077   ibm-windows-server-2019-core-amd64-2               available    amd64   windows-2019-amd64-core              2019 Standard Edition Core                12              public       provider     none         -   
r010-9891fe13-fc3a-4106-a154-f66f5a5a8fe8   ibm-windows-server-2019-full-standard-amd64-6      available    amd64   windows-2019-amd64                   2019 Standard Edition                     18              public       provider     none         -   
```

Record the image ID as a variable, which is going to be used when provisioning the Windows Server.

IMAGE_WIN=r010-9891fe13-fc3a-4106-a154-f66f5a5a8fe8

Once the Virtual Server Instance is created, record the Jump server's ID and its NIC ID.

```bash
VMWARE_JUMP=$(ibmcloud is instance-create jump-001 $VMWARE_VPC $VMWARE_VPC_ZONE bx2-2x8 $VMWARE_SUBNET_MGMT --image-id $IMAGE_WIN --key-ids $SSH_KEY --output json | jq -r .id)
VMWARE_JUMP_NIC=$(ibmcloud is in $VMWARE_JUMP --output json | jq -r .network_interfaces[0].id)
```

In this example, the Jump server is accessed directly from the Internet and a Floating IP to the server for this purpose. Floating IP addresses are IP addresses that are provided by IBM Cloud platform and are reachable from the public internet. You can reserve a floating IP address from the pool of available addresses that are provided by IBM, and you can associate it with a network interface of your server. That interface also will have a private IP address.

Create a floating IP for the Virtual Server and record the IP.

```bash
VMWARE_JUMP_FIP=$(ibmcloud is ipc jump-001-ip --nic-id $VMWARE_JUMP_NIC --output json | jq -r .address)
echo "Public IP for the Jump : "$VMWARE_JUMP_FIP
```

To get the server Administrator’s password, use the SSH key to decrypt it. In this example, the private key is located in the folder '~/.ssh/' in the workstation where 'ibmcloud' CLI command in run from.

```bash
ibmcloud is in-init $VMWARE_JUMP --private-key @~/.ssh/id_rsa
```

Note: Inbound access to RDP port (TCP/3389) is blocked by default. Add a SG rule for inbound TCP/3389 from your IP to access the jump.
{:tip}

```bash
VMWARE_JUMP_NIC_SG=$(ibmcloud is in $VMWARE_JUMP --output json | jq -r .network_interfaces[0].security_groups[0].id)
ibmcloud is sg-rulec $VMWARE_JUMP_NIC_SG inbound tcp --port-min 3389 --port-max 3389 --remote <add_your_IP_here>
```



