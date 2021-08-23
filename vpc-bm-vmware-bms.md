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

# Deploy VPC Baremetal Servers for a VMware Deployment
{: #vpc-bm-vmware-bms}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

In this turtorial will show how to [provision bare metal servers](https://cloud.ibm.com/docs/vpc?topic=vpc-creating-bare-metal-servers) into VPC, and how to provision network interfaces for VMkernel adapters. 
{:shortdesc}

Important. This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives). 
{:important}

In IBM Cloud™ VPC, you can create two types of network interfaces on a bare metal server: PCI (peripheral component interconnect) and VLAN (virtual LAN) interface.

The PCI interface is a physical network interface. By default, each bare metal server is attached with one PCI network interface as the server's primary network interface. You can create up to 8 PCI interfaces on a bare metal server. In this example, the single PCI interface is used as a vSphere vSphere Standard and/or Distributed Switch uplink. In is important to understand, that all network interfaces on the bare metal server are backed by 2 physical ports that are connected redundantly to the TORs (top-of-rack) switch. IBM manages the aggregation, so you do not need to create multiple PCI interfaces for redundancy reasons. Read more about [network interfaces of Bare Metal Servers for VPC with VMware vSphere](https://cloud.ibm.com/docs/vpc?topic=vpc-bare-metal-servers-network#bm-vmware-nic-mapping).

The VLAN interface is a virtual network interface that is associated with a PCI interface via the VLAN ID. The VLAN interface automatically tags traffic that is routed through it with the VLAN ID. Inbound traffic tagged with a VLAN ID is directed to the appropriate VLAN interface, which is always associated with a VPC subnet. Note that VLAN interfaces have only local significance inside the bare metal server, VLAN ID is not visible in the VPC subnet, but to be able to communicate with a VPC subnet you must use the correct VLAN ID and the IP address of the provisioned VLAN interface. In addition, PCI interface needs to have an allowed VLAN list of [e.g. 100, 200, 300, 400] to allow network interfaces attached to vSphere Switches with the listed VLAN ID tags to communicate with VPC.


## Objectives
{: #vpc-bm-vmware-bms-objectives}

In this tutorial, you will learn how to:
* provision bare metal servers for VMware deployment in VPC
* how to provision baremetal network interfaces for VMkernel adapters

In this tutorial, PCI interface is used as the vSphere Switch uplink and its IP address is used as 'vmk0' for managing the host, and additional VLAN NICs are provisioned for other vSphere VMkernel adapters' (VMK) needs (such as vMotion, vSAN, NFS and TEP) as 'vmk1', 'vmk2' etc. as shown in the following diagram.

![Deploying Bare metal server as ESX hosts in VPC](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-VPC-hosts.svgg "Deploying Bare metal server as ESX hosts in VPC"){: caption="Figure 1. Deploying Bare metal server as ESX hosts in VPC" caption-side="bottom"}

1. Validate BMS images
2. Validate BMS profiles
3. Provision BMS
4. Add hosts to DNS
5. Create VLAN NICs for VMkernel adapters


## Before you begin
{: #vpc-bm-vmware-bms-prereqs}

This tutorial requires:
* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

Important. This tutorial is part of series, and requires that you have completed the related tutorials.
{:important}

Make sure you have successfully completed the required previous steps
* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)


## Validate BMS images
{: #vpc-bm-vmware-bms-image}
{: step}

Before provisioning a bare metal server, you need to get the Operating System Image ID. To list all available images, you can use the following CLI command:

```bash
ibmcloud is images
```

For VMware deployment, an ID for ESXi image is needed and you can seatch that with a key word 'esx'. In this example, IBM Cloud provided licences are used. You can also bring your own, and in that case select the BYOL image option.

```bash
$ ibmcloud is images | grep esx
r010-85e78310-b809-4e03-9257-52c7959435ea   ibm-esxi-7-amd64-1                                 available    amd64   esxi-7                               7.x                                       1               public       provider     none         -   
r010-1c4be597-1090-4aca-8521-623bcf5cbea4   ibm-esxi-7-byol-amd64-1                            available    amd64   esxi-7-byol                          7.x                                       1               public       provider     none         -   
```

Record the image ID as a variable, which is going to be used when provisioning the BMSs.

```bash
IMAGE_ESX=r010-85e78310-b809-4e03-9257-52c7959435ea
```

## Validate BMS profiles
{: #vpc-bm-vmware-bms-profile}
{: step}

There are multiple BMS profiles available with different compute, memory and storage characteristics. You can get the currently available profiles with the following command:

```bash
ic is bm-prs
```

During the Beta, following images are available. The 'bx2' profile provides minimal local storage and this profile would be used with File Storage based environments. The 'bxd2' comes with more local disk which can be used to form a vSAN Storage.

```bash
$ ic is bm-prs
Listing bare metal server profiles in region eu-de under account IBM Cloud Acc as user xxx@yyy.com...
Name                 Architecture   Family     CPU socket count   CPU core count   Memory(GiB)   Network(Mbps)   Storage(GB)   
bx2-metal-192x768    amd64          balanced   4                  96               768           100000          1x960   
bx2d-metal-192x768   amd64          balanced   4                  96               768           100000          1x960, 16x3200   
```

## Provision BMS
{: #vpc-bm-vmware-bms-provision}
{: step}

Bare metal servers can be provisioned with CLI by using the following command:

```bash
$ ibmcloud is bmc --help 
NAME:
    bare-metal-server-create - [Beta] Create a bare metal server
  
USAGE:
    ibmcloud is bare-metal-server-create --zone ZONE_NAME --profile PROFILE --image IMAGE --keys KEYS (--pnic-subnet PRIMARY_NIC_SUBNET [--pnic-name PRIMARY_NIC_NAME] [--pnic-ip PRIMARY_NIC_IPV4_ADDRESS] [--pnic-sgs PNIC_SGS] [--pnic-allowed-vlans PNIC_ALLOWED_VLANS] [--pnic-ein true | false] [--pnic-ais false | true]) [--name NAME] [--user-data DATA] [--network-interfaces NETWORK_INTERFACES_JSON | @NETWORK_INTERFACES_JSON_FILE] [--resource-group-id RESOURCE_GROUP_ID | --resource-group-name RESOURCE_GROUP_NAME] [-i, --interactive] [--output JSON] [-q, --quiet]

EXAMPLE:
    ibmcloud is bare-metal-server-create --name my-server-name --zone us-east-1 --profile bmx2d-24x384 --image cfdaf1a0-5350-4350-fcbc-97173b510844 --keys 7ab1ee27-564c-4730-a1ad-9b9466589250,9727e31a-74d4-45cd-8f39-1ef7484b5f3e --pnic-subnet bdea9c01-ada2-46ba-a314-4b3240477a5f 
    ibmcloud is bare-metal-server-create --name my-server-name2 --zone us-east-1 --profile bmx2d-24x384 --image cfdaf1a0-5350-4350-fcbc-97173b510844 --keys 7ab1ee27-564c-4730-a1ad-9b9466589250,9727e31a-74d4-45cd-8f39-1ef7484b5f3e --pnic-subnet bdea9c01-ada2-46ba-a314-4b3240477a5f  --pnic-name eth0 --pnic-ip 46.9.49.11 --pnic-sgs c791f26f-4cf1-4bbf-be0e-72d7cb87133e,fefc8362-93c2-4f3d-90d4-82c56cce787e --pnic-allowed-vlans 1,2,3,4 --pnic-ein true --pnic-ais true
      -Create a bare metal server with specified primary network interface configuration.
    ibmcloud is bare-metal-server-create --name my-server-name --zone us-east-1 --profile bmx2d-24x384 --image cfdaf1a0-5350-4350-fcbc-97173b510844 --keys 7ab1ee27-564c-4730-a1ad-9b9466589250,9727e31a-74d4-45cd-8f39-1ef7484b5f3e --pnic-subnet bdea9c01-ada2-46ba-a314-4b3240477a5f  --resource-group-name Finance --output JSON
      -Create a bare metal server in the `Finance` resource group.
    ibmcloud is bare-metal-server-create --name my-server-name --zone us-east-1 --profile bmx2d-24x384 --image cfdaf1a0-5350-4350-fcbc-97173b510844 --keys 7ab1ee27-564c-4730-a1ad-9b9466589250,9727e31a-74d4-45cd-8f39-1ef7484b5f3e --pnic-subnet bdea9c01-ada2-46ba-a314-4b3240477a5f  --network-interfaces '[{"name": "eth2", "allow_ip_spoofing": true, "enable_infrastructure_nat": true, "interface_type": "pci", "allowed_vlans": [1, 2, 3, 4], "subnet": {"id":"72b27b5c-f4b0-48bb-b954-5becc7c1dcb3"}, "primary_ipv4_address": "10.240.129.11", "security_groups": [{"id": "72b27b5c-f4b0-48bb-b954-5becc7c1dcb8"}, {"id": "72b27b5c-f4b0-48bb-b954-5becc7c1dcb3"}]}, {"name": "eth3", "allow_ip_spoofing": true, "enable_infrastructure_nat": true, "interface_type": "vlan", "vlan": 4, "allow_interface_to_float": true, "subnet": {"id":"72b27b5c-f4b0-48bb-b954-5becc7c1dcb3"}, "primary_ipv4_address": "10.240.129.12", "security_groups": [{"id": "72b27b5c-f4b0-48bb-b954-5becc7c1dcb8"}, {"id": "72b27b5c-f4b0-48bb-b954-5becc7c1dcb3"}]}]'
      -Create a bare metal server with a PCI secondary network interface and a VLAN secondary network interface. Configurations of the two secondary interfaces are specified in JSON format. See help text for '--network-interfaces' option.
  
OPTIONS:
    --name value                 Name of the server.
    --zone value                 Name of the zone
    --profile value              Name of the bare metal server profile
    --image value                ID of the image.
    --keys value                 Comma-separated IDs of ssh keys
    --user-data value            data|@data-file. User data to transfer to the bare metal server
    --pnic-name value            Name of the primary network interface
    --pnic-subnet value          Subnet ID for the primary network interface
    --pnic-ip value              Primary IPv4 address for the primary network interface
    --pnic-sgs value             Comma-separated security group IDs for primary network interface
    --pnic-allowed-vlans value   Comma-separated VLAN IDs. Indicates which VLAN IDs (for VLAN interfaces only) can use the primary network interface.
    --pnic-ein value             Enable infrastructure NAT. If 'true', the VPC infrastructure performs any needed NAT operations. If 'false', the packet is passed unmodified to or from the network interface, allowing the VM associated with the floating IP to perform any needed NAT operations. One of: true, false. (default: "true")
    --pnic-ais value             Indicates whether source IP spoofing is allowed on the network interface. If 'true', source IP spoofing is allowed on this interface. If 'false', source IP spoofing is prevented on this interface. One of: false, true. (default: "false")
    --network-interfaces value   NETWORK_INTERFACES_JSON|@NETWORK_INTERFACES_JSON_FILE. Network interface configuration in JSON or JSON file. For the data schema, check 'network_interfaces' property in the API docs 'https://cloud.ibm.com/apidocs/vpc-beta#create-bare-metal-server'.
    --resource-group-id value    ID of the resource group. This option is mutually exclusive with --resource-group-name
    --resource-group-name value  Name of the resource group. This option is mutually exclusive with --resource-group-id
    --interactive, -i            Supply the parameters under interactive mode. This option is mutually exclusive with all other arguments and options.
    --output value               Specify output format, only JSON is supported. One of: JSON.
    -q, --quiet                  Suppress verbose output
```

As part of the command line the '--user-data' property is used to execute commands as part of the bare metal configuration. In the example below you can enable ESXi SSH and Shell and set the host name. You will need to create a local file per bare metal server, in the location where you plan to execute the ibmcloud CLI. A script per bare metal server is required to pass in the hostname. An example for VMWARE_BMS001 is shown below. Modify this to fit your deployment's needs.

```bash
# enable & start SSH
vim-cmd hostsvc/enable_ssh
vim-cmd hostsvc/start_ssh
# enable & start ESXi Shell
vim-cmd hostsvc/enable_esx_shell
vim-cmd hostsvc/start_esx_shell
# Attempting to set the hostname
esxcli system hostname set --fqdn=esx-001.vmware.ibmcloud.local
```

To provision the BMS with IBM Cloud provided ESXi licences and 'bx2d-metal-192x768' profile the following command is used. If you use your own licences or other profiles, modify the parameters accordingly. You need to record the ID of the BMS for future use.

```bash
VMWARE_BMS001=$(ibmcloud is bmc --name esx-001 --zone $VPC_ZONE --profile bx2d-metal-192x768 --image $IMAGE_ESX --keys $SSH_KEY --pnic-subnet $VMWARE_SUBNET_HOST --pnic-name pci-nic-vmnic0-vmk0 --user-data @~/host1_esxi.sh --output json | jq -r .id)
VMWARE_BMS002=$(ibmcloud is bmc --name esx-002 --zone $VPC_ZONE --profile bx2d-metal-192x768 --image $IMAGE_ESX --keys $SSH_KEY --pnic-subnet $VMWARE_SUBNET_HOST --pnic-name pci-nic-vmnic0-vmk0 --user-data @~/host2_esxi.sh --output json | jq -r .id)
VMWARE_BMS003=$(ibmcloud is bmc --name esx-003 --zone $VPC_ZONE --profile bx2d-metal-192x768 --image $IMAGE_ESX --keys $SSH_KEY --pnic-subnet $VMWARE_SUBNET_HOST --pnic-name pci-nic-vmnic0-vmk0 --user-data @~/host3_esxi.sh --output json | jq -r .id)
```

To show details for each BMS, you can use the following commands, swapping out the bare metal variable:

```bash
$ ic is bm $VMWARE_BMS001
Getting bare metal server 02b7-18928fa3-55b7-4d63-a2bb-b0d832ea19bc under account IBM Cloud Acc as user xxx@yyy.com...
                             
ID                        02b7-18928fa3-55b7-4d63-a2bb-b0d832ea19bc   
Name                      esx-001   
CRN                       crn:v1:bluemix:public:is:eu-de-1:a/1b0834ebce7f4b94983d856f532ebfe2::bare-metal-server:02b7-18928fa3-55b7-4d63-a2bb-b0d832ea19bc   
Status                    pending   
Profile                   bx2d-metal-192x768   
CPU                       Architecture   Socket count   Core count   Threads per core      
                          amd64          4              96           0      
                             
Memory                    768   
Network(Mbps)             100000   
Enable secure boot        false   
Boot target               ID                                          Name                                  Resource type      
                          02b7-37f712eb-a85c-4857-aa52-0d859936f278   boots-chihuahua-washbasin-overreact   bare_metal_server_disk      
                             
Disks                     ID                                          Name                                    Size   Interface Type      
                          02b7-37f712eb-a85c-4857-aa52-0d859936f278   boots-chihuahua-washbasin-overreact     960    sata      
                          02b7-914b8422-236d-421f-827f-97c3dc17efc2   wiry-surround-backlight-attic           3200   nvme      
                          02b7-27d3a5c0-19ff-40d3-9789-21b52d9039ed   mayday-scooter-fragility-setup          3200   nvme      
                          02b7-77c4022a-9d07-41de-9bff-947079fe9657   lullaby-pamperer-bacterium-hangout      3200   nvme      
                          02b7-66e8834d-e142-41bf-9b32-cd737dcbc41a   secrecy-kit-alive-reshape               3200   nvme      
                          02b7-6ec431c0-810b-4b8d-9222-58fcd0b93612   afterparty-sandlot-overcome-smokeless   3200   nvme      
                          02b7-982b1cb8-766f-4cc1-b146-3334f04b3e4a   craftsman-hanky-tingly-squirm           3200   nvme      
                          02b7-1f2469d9-d0de-49ee-8bdd-5e5e5f6822c6   juror-helpful-frosting-mobile           3200   nvme      
                          02b7-04ed1c5c-e7f0-4a8d-8fb6-5e190f4480ed   chitchat-proofs-marvelous-employed      3200   nvme      
                          02b7-22725a44-7a19-4c46-be4a-cb2d0b19a243   shading-amends-dreamt-dime              3200   nvme      
                          02b7-246fe75a-8656-4086-8ffb-589cde2044c9   unshipped-dining-premolar-freeway       3200   nvme      
                          02b7-2936861e-9eb6-48c5-bd41-c4c9fdcbcdca   smile-frantic-kindred-amusable          3200   nvme      
                          02b7-4269641f-c21b-4184-b8ab-b882f926ed69   grinch-crescent-snowy-wise              3200   nvme      
                          02b7-e29c7e77-217e-4443-8110-3f031980e867   defense-tremor-walnut-probiotic         3200   nvme      
                          02b7-06bb70e2-5a19-4766-8b97-64121f2d653d   daylong-bountiful-splendid-plural       3200   nvme      
                          02b7-3195d321-a60e-4699-8f2d-bbfbafe5887f   subside-bundle-unnatural-darkness       3200   nvme      
                          02b7-4825c10e-9f90-45cf-b810-9bfc6f5d7ee1   hermit-gargle-codesign-operative        3200   nvme      
                             
Network(Mbps)             100000   
Network Interfaces        Interface   Name                  ID                                          Subnet                  Subnet ID                                   Private IP   Floating IP      
                          Primary     pci-nic-vmnic0-vmk0   02b7-122e2c9e-3a9d-4f0c-87c3-f6d75f40a51d   vmw-mgmt-subnet         02b7-e298b6db-eb18-40af-ac69-2cab0d2161ee   10.97.0.5    -      
                             
Trusted platform module   -   
VPC                       ID                                          Name      
                          r010-608ee5e9-bad4-4c28-b179-57482236cac2   ic4v      
                             
Zone                      eu-de-1   
Resource group            ID                                 Name      
                          28b0e7d18da9417ea85b2ba308088657   Default      
                             
Created                   2021-07-28T16:40:50+03:00   
```

Host provisioning will typically take 10-15 minutes, and you can continue the next steps after the provisioning is completed, and the bare metal server **Status** shows 'running'. 

### Obtain Bare Metal Credentials
{: #vpc-bm-vmware-bms-provision-cred}

Once the hosts have been provisioned, get the credentials for 'root' user for each BMS. You need the SSH key for decrypting the passwords, and you can use the following commands for this. 

```bash
ibmcloud is bm-init $VMWARE_BMS001 --private-key @~/.ssh/id_rsa
ibmcloud is bm-init $VMWARE_BMS002 --private-key @~/.ssh/id_rsa
ibmcloud is bm-init $VMWARE_BMS003 --private-key @~/.ssh/id_rsa
```

Record the passwords for future use. 

### Obtain the Bare metal IP Details
{: #vpc-bm-vmware-bms-provision-ip}

Get the IP addresses of the servers and record them for future use into a variable.

```bash
VMWARE_BMS001_MGMT_IP=$(ic is bm $VMWARE_BMS001 -output json | jq -r .primary_network_interface.primary_ipv4_address)
echo "VMWARE_BMS001 IP : "$VMWARE_BMS001_MGMT_IP

VMWARE_BMS002_MGMT_IP=$(ic is bm $VMWARE_BMS002 -output json | jq -r .primary_network_interface.primary_ipv4_address)
echo "VMWARE_BMS002 IP : "$VMWARE_BMS002_MGMT_IP

VMWARE_BMS003_MGMT_IP=$(ic is bm $VMWARE_BMS003 -output json | jq -r .primary_network_interface.primary_ipv4_address)
echo "VMWARE_BMS003 IP : "$VMWARE_BMS003_MGMT_IP
```

## Add hosts to DNS
{: #vpc-bm-vmware-bms-dns}
{: step}

Add the host 'A records' to your previously created DNS instance's zone:

```bash
ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name esx-001 --ipv4 $VMWARE_BMS001_MGMT_IP
ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name esx-002 --ipv4 $VMWARE_BMS002_MGMT_IP
ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name esx-003 --ipv4 $VMWARE_BMS003_MGMT_IP
```

## Create VLAN NICs for VMkernel adapters
{: #vpc-bm-vmware-bms-vlannic}
{: step}

In the following step, the VLAN interfaces for different VMware VMKs will be created. Each VMK will need its own VLAN interface, for example:

* vMotion traffic
* vSAN traffic
* NSX-T TEP traffic
* NFS traffic

In IBM Cloud VPC, you can attach PCI and VLAN network interfaces to the bare metal servers to support the VMware networking topology. The PCI interface is a physical network interface. The VLAN interface is a virtual network interface that is associated with a PCI interface via the VLAN ID. The VLAN interface automatically tags traffic that is routed through it with the VLAN ID. Inbound traffic tagged with a VLAN ID is directed to the appropriate VLAN interface. See more in [Network interfaces of the bare metal servers](https://cloud.ibm.com/docs/vpc?topic=vpc-bare-metal-servers-network#bare-metal-servers-nics-intro).

The following diagram shows how each VMK's network configurations map to VPC network constructs (Subnets). Each host will be configured first with Standard Virtual Switch (default 'vSwitch0') and after vCenter deployment, these will be configured and migrated to Distributed Virtual Switch.

![VMkernel adapter mapping to VPC Subnets](../../08000_Diagrams/manual-deployment/Self-Managed-Simple-20210813v1-VPC-hosts-vmk.png "VMkernel adapter mapping to VPC Subnets"){: caption="Figure 2. VMkernel adapter mapping to VPC Subnets" caption-side="bottom"}

### Configure PCI NIC to allow VLANs
{: #vpc-bm-vmware-bms-vlannic-allow}

By default, each bare metal server is attached with one PCI network interface as the server's primary network interface. In this example, the PCI NIC is used as the uplink. In is important to understand, that all network interfaces on the bare metal server are backed by 2 physical ports that are connected redundantly to the TORs (top-of-rack) switch. IBM manages the aggregation, so you do not need to create multiple PCI interfaces for redundancy reasons.

Before provisioning VLAN interfaces, configure each hosts' PCI NIC to allow VLANs. The following VLAN IDs are use in this example:

* VLAN 100 - Instance management (e.g. vCenter and NSX Managers)
* VLAN 200 - vMotion
* VLAN 300 - vSAN
* VLAN 400 - TEP

Get the PCI NIC IDs and allow them to use the VLANs stated above:

```bash
VMWARE_BMS001_PNIC=$(ic is bm-nics $VMWARE_BMS001 --output json | jq -r .[0].id)
VMWARE_BMS002_PNIC=$(ic is bm-nics $VMWARE_BMS002 --output json | jq -r .[0].id)
VMWARE_BMS003_PNIC=$(ic is bm-nics $VMWARE_BMS003 --output json | jq -r .[0].id)

ibmcloud is bm-nicu $VMWARE_BMS001 $VMWARE_BMS001_PNIC --allowed-vlans 100,200,300,400
ibmcloud is bm-nicu $VMWARE_BMS002 $VMWARE_BMS002_PNIC --allowed-vlans 100,200,300,400
ibmcloud is bm-nicu $VMWARE_BMS003 $VMWARE_BMS003_PNIC --allowed-vlans 100,200,300,400
```

### Creating VLAN NICs
{: #vpc-bm-vmware-bms-vlannic-create}

Next you need to create VLAN NICs for VMware kernel adapters (VMK) and NSX-T TEPs. 

Interface name        | Interface type | VLAN ID | Subnet              | Allow float
----------------------|----------------|---------|---------------------|--------------
vlan-nic-vmotion-vmk2 | vlan           | 200     | $VMWARE_SUBNET_VMOT | false
vlan-nic-vsan-vmk3    | vlan           | 300     | $VMWARE_SUBNET_VSAN | false
vlan-nic-tep-vmk10    | vlan           | 400     | $VMWARE_SUBNET_TEP  | false

Note. Instance management VLAN NICs e.g. for vCenter will be created later.
{: note}

Note. When creating the VLAN NICs for VMware VMKs, they are not allowed to float between hosts.
{: note}

To create the VLAN NICs you can use CLI, and the command reference is shown below. The next chapters will detail each VLAN interface provisioning for each VMK.

```bash
$ ic is bm-nicc --help
NAME:
    bare-metal-server-network-interface-create - [Beta] Create a network interface for a bare metal server
  
USAGE:
    ibmcloud is bare-metal-server-network-interface-create SERVER --subnet SUBNET [--name NAME] [--interface-type pci | vlan] [--ip IPV4_ADDRESS] [--security-groups SECURITY_GROUPS] [--allowed-vlans ALLOWED_VLANS | --vlan VLAN --allow-interface-to-float false | true] [--allow-ip-spoofing false | true] [--enable-infrastructure-nat true | false] [--output JSON] [-q, --quiet]
    SERVER: ID of the server.

EXAMPLE:
    ibmcloud is bare-metal-server-network-interface-create 7d317c32-71f8-4060-9bdc-6c971b0317d4 --subnet dcaec790-f0b0-48e6-b4cb-03dd82b745c0
      -Create a PCI network interface.
    ibmcloud is bare-metal-server-network-interface-create 7d317c32-71f8-4060-9bdc-6c971b0317d4 --subnet dcaec790-f0b0-48e6-b4cb-03dd82b745c0 --interface-type pci --name eth1 --ip 10.0.0.11 --security-groups 43846d71-0f04-473f-9de5-5a2d33200a4b,27c8ca96-17f3-4943-898d-ad1a1f5aec26 --allowed-vlans 1,2,3,4 -allow-ip-spoofing true --enable-infrastructure-nat true
      -Create a PCI network interface with specified configuration.
    ibmcloud is bare-metal-server-network-interface-create 7d317c32-71f8-4060-9bdc-6c971b0317d4 --subnet dcaec790-f0b0-48e6-b4cb-03dd82b745c0 --interface-type vlan --name eth2 --ip 10.0.0.12 --security-groups 43846d71-0f04-473f-9de5-5a2d33200a4b,27c8ca96-17f3-4943-898d-ad1a1f5aec26 --vlan 1 -allow-interface-to-float true -allow-ip-spoofing true --enable-infrastructure-nat true
      -Create a VLAN network interface with specified configuration.
    ibmcloud is bare-metal-server-network-interface-create 7d317c32-71f8-4060-9bdc-6c971b0317d4 --subnet dcaec790-f0b0-48e6-b4cb-03dd82b745c0 --output JSON
      -Create a PCI network interface and specify JSON as the output format.
  
OPTIONS:
    --name value                       Name of the network interface
    --interface-type value             Type of the network interface. One of: pci, vlan. (default: "pci")
    --subnet value                     Subnet ID for the network interface
    --ip value                         Primary IPv4 address for the network interface
    --security-groups value            Comma-separated security group IDs for the network interface
    --allowed-vlans value              Comma-separated VLAN IDs. Indicates which VLAN IDs (for VLAN interfaces only) can use this PCI interface.
    --vlan value                       Indicates the 802.1Q VLAN ID tag that must be used for all traffic on this VLAN interface
    --allow-interface-to-float value   Indicates if the interface can float to any other server within the same 'resource_group'. The interface floats automatically if the network detects a GARP or RARP on another bare metal server in the resource group. Applies only to VLAN interfaces. One of: false, true. (default: "false")
    --allow-ip-spoofing value          Indicates whether source IP spoofing is allowed on the network interface. If 'true', source IP spoofing is allowed on this interface. If 'false', source IP spoofing is prevented on this interface. One of: false, true. (default: "false")
    --enable-infrastructure-nat value  If true, the VPC infrastructure performs any needed NAT operations. If false, the packet is passed unmodified to or from the network interface, allowing the workload to perform any needed NAT operations. One of: true, false. (default: "true")
    --output value                     Specify output format, only JSON is supported. One of: JSON.
    -q, --quiet                        Suppress verbose output
```

### Create VLAN NICs for vMotion
{: #vpc-bm-vmware-bms-vlannic-vmot}

Create vMotion VLAN NICs for each host. Record the IP addresses for later use.

| Bare Metal Name | Subnet Name         | VLAN | Allowed to Float |
|-----------------|---------------------|------|------------------|
| VMWARE_BMS001   | $VMWARE_SUBNET_VMOT | 200  | false            |
| VMWARE_BMS002   | $VMWARE_SUBNET_VMOT | 200  | false            |
| VMWARE_BMS003   | $VMWARE_SUBNET_VMOT | 200  | false            |

```bash
VMWARE_BMS001_VMOT=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS001 --subnet $VMWARE_SUBNET_VMOT --name vlan-nic-vmotion-vmk2 --interface-type vlan --vlan 200 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS001_VMOT_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS001 $VMWARE_BMS001_VMOT --output json | jq -r .primary_ipv4_address)
echo "vMotion IP for BMS001 : "$VMWARE_BMS001_VMOT_IP

VMWARE_BMS002_VMOT=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS002 --subnet $VMWARE_SUBNET_VMOT --name vlan-nic-vmotion-vmk2 --interface-type vlan --vlan 200 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS002_VMOT_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS002 $VMWARE_BMS002_VMOT --output json | jq -r .primary_ipv4_address)
echo "vMotion IP for BMS002 : "$VMWARE_BMS002_VMOT_IP

VMWARE_BMS003_VMOT=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS003 --subnet $VMWARE_SUBNET_VMOT --name vlan-nic-vmotion-vmk2 --interface-type vlan --vlan 200 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS003_VMOT_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS003 $VMWARE_BMS003_VMOT --output json | jq -r .primary_ipv4_address)
echo "vMotion IP for BMS003 : "$VMWARE_BMS003_VMOT_IP
```

Note. In the above example, the default security group was used for the VMKs. This is for easy testing, but in real environments it is recommended to isolate VMK traffic, and only allow traffic what is needed. To be able to do this in VPC, create separate Security Groups for each interface role, and create rules to only allow the required traffic at the detail level required by your network security policies.
{: note}

### Create VLAN NICs for vSAN
{: #vpc-bm-vmware-bms-vlannic-vsan}

Note. This phase is optional, if you use NFS.
{:note}

Create vSAN VLAN NICs for each host. Record the IP addresses for later use.

| Bare Metal Name | Subnet Name         | VLAN | Allowed to Float |
|-----------------|---------------------|------|------------------|
| VMWARE_BMS001   | $VMWARE_SUBNET_VSAN | 300  | false            |
| VMWARE_BMS002   | $VMWARE_SUBNET_VSAN | 300  | false            |
| VMWARE_BMS003   | $VMWARE_SUBNET_VSAN | 300  | false            |

```bash
VMWARE_BMS001_VSAN=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS001 --subnet $VMWARE_SUBNET_VSAN --name vlan-nic-vsan-vmk3 --interface-type vlan --vlan 300 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS001_VSAN_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS001 $VMWARE_BMS001_VSAN --output json | jq -r .primary_ipv4_address)
echo "vSAN IP for BMS001 : "$VMWARE_BMS001_VSAN_IP

VMWARE_BMS002_VSAN=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS002 --subnet $VMWARE_SUBNET_VSAN --name vlan-nic-vsan-vmk3 --interface-type vlan --vlan 300 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS002_VSAN_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS002 $VMWARE_BMS002_VSAN --output json | jq -r .primary_ipv4_address)
echo "vSAN IP for BMS002 : "$VMWARE_BMS002_VSAN_IP

VMWARE_BMS003_VSAN=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS003 --subnet $VMWARE_SUBNET_VSAN --name vlan-nic-vsan-vmk3 --interface-type vlan --vlan 300 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS003_VSAN_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS003 $VMWARE_BMS003_VSAN --output json | jq -r .primary_ipv4_address)
echo "vSAN IP for BMS003 : "$VMWARE_BMS003_VSAN_IP
```

Note. In the above example, the default security group was used for the VMKs. This is for easy testing, but in real environments it is recommended to isolate VMK traffic, and only allow traffic what is needed. To be able to do this in VPC, create separate Security Groups for each interface role, and create rules to only allow the required traffic at the detail level required by your network security policies.
{: note}


### Create VLAN NICs for TEPs
{: #vpc-bm-vmware-bms-vlannic-tep}

If you would use NSX-T, you also need to create TEP VLAN NICs for each host. Record the IP addresses for later use.

| Bare Metal Name | Subnet Name        | VLAN | Allowed to Float |
|-----------------|--------------------|------|------------------|
| VMWARE_BMS001   | $VMWARE_SUBNET_TEP | 400  | false            |
| VMWARE_BMS002   | $VMWARE_SUBNET_TEP | 400  | false            |
| VMWARE_BMS003   | $VMWARE_SUBNET_TEP | 400  | false            |

```bash
VMWARE_BMS001_TEP=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS001 --subnet $VMWARE_SUBNET_TEP --name vlan-nic-tep-vmk10 --interface-type vlan --vlan 400 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS001_TEP_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS001 $VMWARE_BMS001_TEP --output json | jq -r .primary_ipv4_address)
echo "TEP IP for BMS001 : "$VMWARE_BMS001_TEP_IP

VMWARE_BMS002_TEP=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS002 --subnet $VMWARE_SUBNET_TEP --name vlan-nic-tep-vmk10 --interface-type vlan --vlan 400 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS002_TEP_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS002 $VMWARE_BMS002_TEP --output json | jq -r .primary_ipv4_address)
echo "TEP IP for BMS002 : "$VMWARE_BMS002_TEP_IP

VMWARE_BMS003_TEP=$(ibmcloud is bare-metal-server-network-interface-create $VMWARE_BMS003 --subnet $VMWARE_SUBNET_TEP --name vlan-nic-tep-vmk10 --interface-type vlan --vlan 400 --allow-interface-to-float false --output json | jq -r .id)
VMWARE_BMS003_TEP_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS003 $VMWARE_BMS003_TEP --output json | jq -r .primary_ipv4_address)
echo "TEP IP for BMS003 : "$VMWARE_BMS003_TEP_IP
```

Note. In the above example, the default security group was used for the VMKs. This is for easy testing, but in real environments it is recommended to isolate VMK traffic, and only allow traffic what is needed. To be able to do this in VPC, create separate Security Groups for each interface role, and create rules to only allow the required traffic at the detail level required by your network security policies.
{: note}
