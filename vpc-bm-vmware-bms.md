---
subcollection: solution-tutorials
copyright:
  years: 2022, 2023
lastupdated: "2023-03-28"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vmwaresolutions, vpc
account-plan: paid
completion-time: 1h
---
{{site.data.keyword.attribute-definition-list}}

# Provision {{site.data.keyword.bm_is_short}} for VMware deployment
{: #vpc-bm-vmware-bms}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}

This tutorial will show how to [provision {{site.data.keyword.bm_is_short}}](/docs/vpc?topic=vpc-creating-bare-metal-servers) into {{site.data.keyword.vpc_short}}, and how to provision network interfaces for vSphere VMkernel adapters (VMK) adapters.
{: shortdesc}

You need to plan and decide your VMware deployments storage solution before you order the bare metal servers. If you use NFS backed {{site.data.keyword.vpc_short}} file share as the primary storage, you can start with a minimum of 2 bare metal servers with and select a [profile](/docs/vpc?topic=vpc-bare-metal-servers-profile) starting with `bx2-`, which includes a local SATA M.2 mirrored drive. If you plan to use vSAN, you need to select a minimum of 3 bare metal servers with and select a [profile](/docs/vpc?topic=vpc-bare-metal-servers-profile) starting with `bx2d-`, which includes a local SATA M.2 mirrored drive and a number of NVMe U.2 SSDs.  

In {{site.data.keyword.vpc_full}}, you can create two types of network interfaces on a {{site.data.keyword.bm_is_short}}: PCI (peripheral component interconnect) and VLAN (virtual LAN) interface. Before provisioning {{site.data.keyword.bm_is_short}}, it is important to understand how these two interface types work.

The PCI interface is a physical network interface. By default, each {{site.data.keyword.bm_is_short}} is attached with one PCI network interface as the server's primary network interface. You can create up to 8 PCI interfaces on a {{site.data.keyword.bm_is_short}}. In this example, the single PCI interface is used as a vSphere Standard and/or Distributed Switch uplink. Note, that all network interfaces on the {{site.data.keyword.bm_is_short}} are backed by 2 physical ports that are connected redundantly to the TORs (top-of-rack) switch. IBM manages the aggregation, so you do not need to create multiple PCI interfaces for redundancy reasons. Read more about [network interfaces of Bare Metal Servers for {{site.data.keyword.vpc_short}} with VMware vSphere](/docs/vpc?topic=vpc-bare-metal-servers-network#bm-vmware-nic-mapping).

The VLAN interface is a virtual network interface that is associated with a PCI interface via the VLAN ID. The VLAN interface automatically tags traffic that is routed through it with the VLAN ID. Inbound traffic tagged with a VLAN ID is directed to the appropriate VLAN interface, which is always associated with a {{site.data.keyword.vpc_short}} subnet. Note that VLAN interfaces have only local significance inside the {{site.data.keyword.bm_is_short}}, VLAN ID is not visible in the {{site.data.keyword.vpc_short}} subnet, but to be able to communicate with a {{site.data.keyword.vpc_short}} subnet you must use the correct VLAN ID and the IP address of the provisioned VLAN interface. In addition, PCI interface needs to have an allowed VLAN list of [e.g. 100, 200, 300] to allow network interfaces attached to vSphere Switches with the listed VLAN ID tags to communicate with {{site.data.keyword.vpc_short}}.


## Objectives
{: #vpc-bm-vmware-bms-objectives}

In this tutorial, you will learn how to:
* provision {{site.data.keyword.bm_is_short}} for VMware deployment in {{site.data.keyword.vpc_short}}
* provision baremetal network interfaces for VMkernel adapters

In this tutorial, PCI interface is used as the vSphere Switch uplink and its IP address is used as `vmk0` for managing the host, and additional VLAN NICs are provisioned for other vSphere VMkernel adapters needs (such as vMotion and vSAN) as `vmk1`, `vmk2` etc. as shown in the following diagram.

![Deploying Bare metal server as ESX hosts in {{site.data.keyword.vpc_short}}](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-VPC-hosts.svg "Deploying Bare metal server as ESX hosts in {{site.data.keyword.vpc_short}}"){: caption="Figure 1. Deploying Bare metal server as ESX hosts in {{site.data.keyword.vpc_short}}" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-bms-prereqs}

This tutorial requires:

* Common [prereqs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision {{site.data.keyword.dns_full_notm}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)

[Login](/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

The used variables e.g. $VMWARE_VPC_ZONE, $VMWARE_SUBNET_HOST and $VMWARE_DNS_ZONE are defined in the previous steps of this tutorial.
{: note}


## Validate {{site.data.keyword.bm_is_short}} images
{: #vpc-bm-vmware-bms-image}
{: step}

1. Before provisioning a {{site.data.keyword.bm_is_short}}, you need to get the Operating System Image ID. To list all available images, you can use the following CLI command:

   ```sh
   ibmcloud is images
   ```
   {: codeblock}

2. For VMware deployment, an ID for ESXi image is needed and you can search that with a key word **esx**. In this example, IBM Cloud provided licenses are used.

   ```sh
   $ ibmcloud is images | grep esx | grep available
   r006-29e4a5c0-cc2f-45ff-b3f2-9cb64cf7e407   ibm-esxi-7-0u3g-20328353-amd64-1                    available    amd64   esxi-7                               7.x                                                      1               public       provider     none         Default          -   
   ```
   {: screen}

   The available images vary over time. Always pick the latest to get the most recent updates available.
   {: important}

3. Record the image ID as a variable, which is going to be used when provisioning the BMSs.
   
   ```sh
   IMAGE_ESX=r006-29e4a5c0-cc2f-45ff-b3f2-9cb64cf7e407
   ```
   {: screen}

   The image IDs vary per region. Select the value matching your deployment.
   {: important}

## Validate {{site.data.keyword.bm_is_short}}  profiles
{: #vpc-bm-vmware-bms-profile}
{: step}

1. There are multiple BMS profiles available with different compute, memory and storage characteristics. You can get the currently available profiles with the following command:

   ```sh
   ibmcloud is bm-prs
   ```
   {: codeblock}

2. The following images are available. The `bx2` profile provides minimal local storage and this profile would be used with File Storage based environments. The `bxd2` comes with more local disk which can be used to form a vSAN Storage.

   ```sh
   $ ibmcloud is bm-prs
   Listing bare metal server profiles in region eu-de under account IBM Cloud Acc as user xxx@yyy.com...
   Name                 Architecture   Family     CPU socket count   CPU core count   Memory(GiB)   Network(Mbps)   Storage(GB)   
   bx2-metal-96x384     amd64          balanced   2                  48               384           100000          1x960   
   bx2d-metal-96x384    amd64          balanced   2                  48               384           100000          1x960, 8x3200   
   bx2-metal-192x768    amd64          balanced   4                  96               768           100000          1x960   
   bx2d-metal-192x768   amd64          balanced   4                  96               768           100000          1x960, 16x3200   
   cx2-metal-96x192     amd64          compute    2                  48               192           100000          1x960   
   cx2d-metal-96x192    amd64          compute    2                  48               192           100000          1x960, 8x3200   
   mx2-metal-96x768     amd64          memory     2                  48               768           100000          1x960   
   mx2d-metal-96x768    amd64          memory     2                  48               768           100000          1x960, 8x3200    
   ```
   {: screen}

   If you plan to use vSAN in your VMware deployment, select bare metal server profiles with `d` in the name. For example `bx2d-metal-192x768` has 16x3200 NVMe disks.
   {: important}


## Provision {{site.data.keyword.bm_is_short}} 
{: #vpc-bm-vmware-bms-provision}
{: step}

1. {{site.data.keyword.bm_is_short}} can be provisioned with CLI or GUI. When provisioning with CLI, you can get help for the required parameters with the following command.

   ```sh
   ibmcloud is bmc --help 
   ```
   {: codeblock}

1. Create user data shell scripts. 

   As part of the command line the `--user-data` property is used to execute commands as part of the bare metal configuration. In the example below, SSH and ESXi Shell are enabled, and the host name is set for {{site.data.keyword.bm_is_short}} `$VMWARE_BMS001. Modify this example to fit your deployment's needs.

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
   {: screen}

   A script per {{site.data.keyword.bm_is_short}} is required to pass in the hostname. Create a file for each server (e.g. `host1_esxi.sh`, `host2_esxi.sh`, etc.) and store them on the folder where you execute the `ibmcloud` CLI commands.

1. To provision the BMS with IBM Cloud provided ESXi licenses and `bx2d-metal-192x768` profile the following commands are used. 
  
   If you use your own licenses or other profiles, modify the parameters accordingly. You need to record the ID of the BMS for future use.
  
   The following commands will order your {{site.data.keyword.bm_is_short}}. You may also have a different number of servers. Make sure your parameters match your planned design and deployment as you may not alter e.g. profile, image or subnet post deployment.
   {: important}

   ```sh
   VMWARE_BMS001=$(ibmcloud is bmc --name esx-001 --zone $VMWARE_VPC_ZONE --profile bx2d-metal-192x768 --image $IMAGE_ESX --keys $SSH_KEY --pnic-subnet $VMWARE_SUBNET_HOST --pnic-name pci-nic-vmnic0-vmk0 --user-data @~/host1_esxi.sh --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS002=$(ibmcloud is bmc --name esx-002 --zone $VMWARE_VPC_ZONE --profile bx2d-metal-192x768 --image $IMAGE_ESX --keys $SSH_KEY --pnic-subnet $VMWARE_SUBNET_HOST --pnic-name pci-nic-vmnic0-vmk0 --user-data @~/host2_esxi.sh --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS003=$(ibmcloud is bmc --name esx-003 --zone $VMWARE_VPC_ZONE --profile bx2d-metal-192x768 --image $IMAGE_ESX --keys $SSH_KEY --pnic-subnet $VMWARE_SUBNET_HOST --pnic-name pci-nic-vmnic0-vmk0 --user-data @~/host3_esxi.sh --output json | jq -r .id)
   ```
   {: codeblock}

   Note: If running inside of Git sh on Windows, prefix the above command with `MSYS_NO_PATHCONV=1`. In this case insert this inside the brackets, e.g. `$(MSYS_NO_PATHCONV=1 ibmcloud is ...`).
   {: note}

2. To show details for each BMS, you can use the following commands, swapping out the bare metal variable:

   ```sh
   ibmcloud is bm $VMWARE_BMS001
   ```
   {: codeblock}

   Host provisioning will typically take 10-15 minutes, and you can continue the next steps after the provisioning is completed, and the {{site.data.keyword.bm_is_short}} **Status** shows `running`.


### Obtain {{site.data.keyword.bm_is_short}} Credentials
{: #vpc-bm-vmware-bms-provision-cred}

1. Once the hosts have been provisioned, get the credentials for `root` user for each BMS. You need the SSH key for decrypting the passwords, and you can use the following commands for this.

   ```sh
   ibmcloud is bm-init $VMWARE_BMS001 --private-key @~/.ssh/id_rsa
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-init $VMWARE_BMS002 --private-key @~/.ssh/id_rsa
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-init $VMWARE_BMS003 --private-key @~/.ssh/id_rsa
   ```
   {: codeblock}

2. Record the passwords for future use.


### Obtain the {{site.data.keyword.bm_is_short}} IP Details
{: #vpc-bm-vmware-bms-provision-ip}

1. Get the IP addresses of the servers and record them for future use into a variable.

   ```sh
   VMWARE_BMS001_MGMT_IP=$(ibmcloud is bm $VMWARE_BMS001 -output json | jq -r '.primary_network_interface.primary_ip.address')
   echo "VMWARE_BMS001 IP : "$VMWARE_BMS001_MGMT_IP
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS002_MGMT_IP=$(ibmcloud is bm $VMWARE_BMS002 -output json | jq -r '.primary_network_interface.primary_ip.address')
   echo "VMWARE_BMS002 IP : "$VMWARE_BMS002_MGMT_IP
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS003_MGMT_IP=$(ibmcloud is bm $VMWARE_BMS003 -output json | jq -r '.primary_network_interface.primary_ip.address')
   echo "VMWARE_BMS003 IP : "$VMWARE_BMS003_MGMT_IP
   ```
   {: codeblock}

## Add hosts to {{site.data.keyword.dns_full_notm}}
{: #vpc-bm-vmware-bms-dns}
{: step}

1. Add the host `A records` to your previously created DNS instance's zone:

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name esx-001 --ipv4 $VMWARE_BMS001_MGMT_IP
      ```
   {: codeblock}

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name esx-002 --ipv4 $VMWARE_BMS002_MGMT_IP
      ```
   {: codeblock}

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name esx-003 --ipv4 $VMWARE_BMS003_MGMT_IP
   ```
   {: codeblock}


## Create VLAN NICs for VMkernel adapters
{: #vpc-bm-vmware-bms-vlannic}
{: step}

In this step, the VLAN interfaces for different VMware VMKs will be created. In VMware deployments, each VMK will need its own VLAN interface, for example:

* vMotion traffic
* vSAN traffic
* NSX-T TEP traffic

In IBM Cloud VPC, you can attach PCI and VLAN network interfaces to the {{site.data.keyword.bm_is_short}} to support the VMware networking topology. The PCI interface is a physical network interface. The VLAN interface is a virtual network interface that is associated with a PCI interface via the VLAN ID. The VLAN interface automatically tags traffic that is routed through it with the VLAN ID. Inbound traffic tagged with a VLAN ID is directed to the appropriate VLAN interface. See more in [Network interfaces of the bare metal servers](/docs/vpc?topic=vpc-bare-metal-servers-network#bare-metal-servers-nics-intro).

The following diagram shows how each VMK's network configurations map to {{site.data.keyword.vpc_short}} network constructs (Subnets). Each host will be configured first with Standard Virtual Switch (default `vSwitch0`) and after vCenter deployment, these will be configured and migrated to Distributed Virtual Switch.

![VMkernel adapter mapping to {{site.data.keyword.vpc_short}} Subnets](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-VPC-hosts-vmk.svg "VMkernel adapter mapping to {{site.data.keyword.vpc_short}} Subnets"){: caption="Figure 2. VMkernel adapter mapping to {{site.data.keyword.vpc_short}} Subnets" caption-side="bottom"}


### Configure PCI NIC to allow VLANs
{: #vpc-bm-vmware-bms-vlannic-allow}

By default, each {{site.data.keyword.bm_is_short}} is attached with one PCI network interface as the server's primary network interface. In this example, the PCI NIC is used as the uplink. In is important to understand, that all network interfaces on the {{site.data.keyword.bm_is_short}} are backed by 2 physical ports that are connected redundantly to the TORs (top-of-rack) switch. IBM manages the aggregation, so you do not need to create multiple PCI interfaces for redundancy reasons.

Before provisioning VLAN interfaces, configure each host's PCI NIC to allow VLANs. The following VLAN IDs are use in this example:

* VLAN 100 - Instance management (e.g. vCenter and NSX-T Managers)
* VLAN 200 - vMotion
* VLAN 300 - vSAN

1. Get the PCI NIC IDs for the provisioned {{site.data.keyword.bm_is_short}}:

   ```sh
   VMWARE_BMS001_PNIC=$(ibmcloud is bm-nics $VMWARE_BMS001 --output json | jq -r '.[0].id')
      ```
   {: codeblock}

   ```sh
   VMWARE_BMS002_PNIC=$(ibmcloud is bm-nics $VMWARE_BMS002 --output json | jq -r '.[0].id')
      ```
   {: codeblock}

   ```sh
   VMWARE_BMS003_PNIC=$(ibmcloud is bm-nics $VMWARE_BMS003 --output json | jq -r '.[0].id')
   ```
   {: codeblock}

2. Allow PCI NICs to use the VLANs stated above:

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS001 $VMWARE_BMS001_PNIC --allowed-vlans 100,200,300
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS002 $VMWARE_BMS002_PNIC --allowed-vlans 100,200,300
      ```
   {: codeblock}

   ```sh
   ibmcloud is bm-nicu $VMWARE_BMS003 $VMWARE_BMS003_PNIC --allowed-vlans 100,200,300
   ```
   {: codeblock}


### Creating VLAN NICs
{: #vpc-bm-vmware-bms-vlannic-create}

Next, you need to create VLAN NICs for VMkernel adapters (VMKs).

| Interface name        | Interface type | VLAN ID | Subnet              | Allow float
| ----------------------|----------------|---------|---------------------|--------------
| vlan-nic-vmotion-vmk2 | vlan           | 200     | $VMWARE_SUBNET_VMOT | false
| vlan-nic-vsan-vmk3    | vlan           | 300     | $VMWARE_SUBNET_VSAN | false
{: caption="VLAN NICs" caption-side="bottom"}


When creating the VLAN NICs for VMware VMKs, they are not allowed to float between hosts.
{: note}

Instance management VLAN NICs e.g. for vCenter will be created later.
{: note}

1. To create the VLAN NICs you can use CLI, and to get the command reference use the following command. The next chapters will detail each VLAN interface provisioning for each VMK.

   ```sh
   ibmcloud is bm-nicc --help
   ```
   {: codeblock}


### Create VLAN NICs for vMotion
{: #vpc-bm-vmware-bms-vlannic-vmot}

1. Create vMotion VLAN NICs for each host. Record the IP addresses for later use.

   | Bare Metal Name | Subnet Name         | VLAN | Allowed to Float |
   |-----------------|---------------------|------|------------------|
   | VMWARE_BMS001   | $VMWARE_SUBNET_VMOT | 200  | false            |
   | VMWARE_BMS002   | $VMWARE_SUBNET_VMOT | 200  | false            |
   | VMWARE_BMS003   | $VMWARE_SUBNET_VMOT | 200  | false            |
   {: caption="List of vMotion VLAN NICs to create" caption-side="bottom"}

   ```sh
   VMWARE_BMS001_VMOT=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_VMOT --name vlan-nic-vmotion-vmk2 --interface-type vlan --vlan 200 --allow-interface-to-float false --output json | jq -r .id)
   VMWARE_BMS001_VMOT_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS001 $VMWARE_BMS001_VMOT --output json | jq -r .primary_ip.address)
   echo "vMotion IP for BMS001 : "$VMWARE_BMS001_VMOT_IP
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS002_VMOT=$(ibmcloud is bm-nicc $VMWARE_BMS002 --subnet $VMWARE_SUBNET_VMOT --name vlan-nic-vmotion-vmk2 --interface-type vlan --vlan 200 --allow-interface-to-float false --output json | jq -r .id)
   VMWARE_BMS002_VMOT_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS002 $VMWARE_BMS002_VMOT --output json | jq -r .primary_ip.address)
   echo "vMotion IP for BMS002 : "$VMWARE_BMS002_VMOT_IP
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS003_VMOT=$(ibmcloud is bm-nicc $VMWARE_BMS003 --subnet $VMWARE_SUBNET_VMOT --name vlan-nic-vmotion-vmk2 --interface-type vlan --vlan 200 --allow-interface-to-float false --output json | jq -r .id)
   VMWARE_BMS003_VMOT_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS003 $VMWARE_BMS003_VMOT --output json | jq -r .primary_ip.address)
   echo "vMotion IP for BMS003 : "$VMWARE_BMS003_VMOT_IP
   ```
   {: codeblock}

   In the above example, the default security group was used for the VMKs. This is for easy testing, but in real environments it is recommended to isolate VMK traffic, and only allow traffic what is needed. To be able to do this in VPC, create separate Security Groups for each interface role, and create rules to only allow the required traffic at the detail level required by your network security policies.
   {: note}


### Create VLAN NICs for vSAN
{: #vpc-bm-vmware-bms-vlannic-vsan}

This phase is optional, if you use NFS.
{: note}

1. Create vSAN VLAN NICs for each host. Record the IP addresses for later use.

   | Bare Metal Name | Subnet Name         | VLAN | Allowed to Float |
   |-----------------|---------------------|------|------------------|
   | VMWARE_BMS001   | $VMWARE_SUBNET_VSAN | 300  | false            |
   | VMWARE_BMS002   | $VMWARE_SUBNET_VSAN | 300  | false            |
   | VMWARE_BMS003   | $VMWARE_SUBNET_VSAN | 300  | false            |
   {: caption="List of vSAN VLAN NICs to create" caption-side="bottom"}

   ```sh
   VMWARE_BMS001_VSAN=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_VSAN --name vlan-nic-vsan-vmk3 --interface-type vlan --vlan 300 --allow-interface-to-float false --output json | jq -r .id)
   VMWARE_BMS001_VSAN_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS001 $VMWARE_BMS001_VSAN --output json | jq -r .primary_ip.address)
   echo "vSAN IP for BMS001 : "$VMWARE_BMS001_VSAN_IP
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS002_VSAN=$(ibmcloud is bm-nicc $VMWARE_BMS002 --subnet $VMWARE_SUBNET_VSAN --name vlan-nic-vsan-vmk3 --interface-type vlan --vlan 300 --allow-interface-to-float false --output json | jq -r .id)
   VMWARE_BMS002_VSAN_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS002 $VMWARE_BMS002_VSAN --output json | jq -r .primary_ip.address)
   echo "vSAN IP for BMS002 : "$VMWARE_BMS002_VSAN_IP
   ```
   {: codeblock}

   ```sh
   VMWARE_BMS003_VSAN=$(ibmcloud is bm-nicc $VMWARE_BMS003 --subnet $VMWARE_SUBNET_VSAN --name vlan-nic-vsan-vmk3 --interface-type vlan --vlan 300 --allow-interface-to-float false --output json | jq -r .id)
   VMWARE_BMS003_VSAN_IP=$(ibmcloud is bare-metal-server-network-interface $VMWARE_BMS003 $VMWARE_BMS003_VSAN --output json | jq -r .primary_ip.address)
   echo "vSAN IP for BMS003 : "$VMWARE_BMS003_VSAN_IP
   ```
   {: codeblock}

   In the above example, the default security group was used for the VMKs. This is for easy testing, but in real environments it is recommended to isolate VMK traffic, and only allow traffic what is needed. To be able to do this in {{site.data.keyword.vpc_short}}, create separate Security Groups for each interface role, and create rules to only allow the required traffic at the detail level required by your network security policies.
   {: note}


## Next steps
{: #vpc-bm-vmware-bms-next-steps}

The next step in the tutorial series is:

* [Provision vCenter Appliance](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vcenter#vpc-bm-vmware-vcenter)
