---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-09-01"
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

# Provision vCenter Appliance
{: #vpc-bm-vmware-vcenter}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This is a Beta feature that requires special approval. Contact your IBM Sales representative if you are interested in getting access.
{: beta}

This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}

In this tutorial, you will deploy a vCenter for a VMware Deployment in {{site.data.keyword.vpc_short}} and a `floating` VLAN interface for it.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-vcenter-objectives}

In this tutorial you will provision a vCenter appliance to the ESXi hosts and create the first compute cluster. vCenter will use {{site.data.keyword.bm_is_short}} [VLAN NIC](https://{DomainName}/docs/vpc?topic=vpc-bare-metal-servers-network#bare-metal-servers-nics-intro) with an IP address allocated from a {{site.data.keyword.vpc_short}} subnet as shown in the following diagram.

![Provisioning vCenter into a bare metal server](images/solution63-ryo-vmware-on-vpc-hidden/Self-Managed-Simple-20210813v1-VPC-vcenter.svg "Provisioning vCenter into a bare metal server"){: caption="Figure 1. Provisioning vCenter into a bare metal server" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-vcenter-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)
* [Provision IBM Cloud DNS service for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-dns#vpc-bm-vmware-dns)
* [Provision bare metal servers for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

When advised to use Web browser, use the Jump machine provisioned in the [{{site.data.keyword.vpc_short}} provisioning tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc). This Jump machine has network access to the hosts, the private DNS service and vCenter IP to be provisioned. Use url with FQDN, e.g. `https://vcenter.vmware.ibmcloud.local` as used in this example.
{: note}


## Provision VLAN NIC for vCenter
{: #vpc-bm-vmware-vcenter-vlannic}
{: step}

In this step, you will provision a VLAN NIC for vCenter into `Instance Management Subnet` using `VLAN 100` as the matching VLAN ID. Use server BMS001 / esx-001 here. When creating the VLAN NIC, allow it to float between the hosts.

NIC              | Subnet              | VLAN ID  | Allow float | IP                       | MAC
-----------------|---------------------|----------|-------------|--------------------------|------------------
vlan-nic-vcenter | $VMWARE_SUBNET_MGMT | 100      | yes         | provided by VPC          | provided by VPC

While {{site.data.keyword.vpc_short}} provides both IP and MAC addresses, you only need to use the IP address here when configuring the vCenter to use a static IP.
{:note}

1. Create VLAN NIC for vCenter and record its IP address:

   ```sh
   VMWARE_VNIC_VCENTER=$(ibmcloud is bm-nicc $VMWARE_BMS001 --subnet $VMWARE_SUBNET_MGMT --interface-type vlan --vlan 100 --allow-interface-to-float true --name vlan-nic-vcenter --output json | jq -r .id)
   ```
   {: codeblock}

   ```sh
   VMWARE_VCENTER_IP=$(ibmcloud is bm-nic $VMWARE_BMS001 $VMWARE_VNIC_VCENTER --output json | jq -r .primary_ipv4_address)
   ```
   {: codeblock}

   ```sh
   echo "vCenter IP : "$VMWARE_VCENTER_IP
   ```
   {: codeblock}


1. Add vCenter IP to DNS Zone as A record:

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name vcenter --ipv4 $VMWARE_VCENTER_IP
   ```
   {: codeblock}


## Add Port Group for VLAN 100 for Standard switch
{: #vpc-bm-vmware-vcenter-portgroup}
{: step}

You need to create a temporary port group for vCenter's networking for the Standard Switch, i.e. add a Port Group for VLAN ID `100`. 

1. Login to host BMS001 / esx-001 as user `root` with a Web browser (https://<ip address>) using the hosts PCI interface IP address (`echo $VMWARE_BMS001_MGMT_IP`).
2. Select **Networking**.
3. On **Port Groups** tab, click `Add port group`.
4. For Virtual switch 0, add a Name **pg-mgmt** and select **VLAN ID 100**.
5. Click **Add**.


## Deploy vCenter appliance
{: #vpc-bm-vmware-vcenter-deployappliance}
{: step}

The vCenter appliance will be deployed next. You can do this via the Jump host's Web browser.

1. Download the VMware vCenter Server 7.0U2 (e.g. [VMware-VCSA-all-7.0.2-17958471.iso](https://customerconnect.vmware.com/downloads/details?downloadGroup=VC70U2C&productId=974&rPId=71684)) into your Windows Jump Machine.
2. Mount the iso into the Operating System and note the location (e.g. <drive_letter>:\).


### Deploy vCenter appliance - Phase 1
{: #vpc-bm-vmware-vcenter-deployappliance-1}

vCenter installation is split into two phases. In the first phase, the appliance is installed into the ESXi host.

Verify that `vcenter.vmware.ibmcloud.local` resolves to the correct IP address prior continuing.
{:important}

1. Before continuing further with vCenter deployment, verify that `vcenter.vmware.ibmcloud.local` resolves to the correct IP address. List information about configured records in your DNS instance `dns-vmware` and zone `vmware.ibmcloud.local`, use the following command.

   ```sh
   ibmcloud dns resource-records $VMWARE_DNS_ZONE -i dns-vmware 
   ```
   {: codeblock}

2. Validate that you get correct responses for each entry (including the listed esx hosts) from your Windows Jump host, for example using `nslookup` via Windows command line.
    
   ```sh
   nslookup vcenter.vmware.ibmcloud.local
   ```
  {: codeblock}
  
   ```sh
   nslookup esx-001.vmware.ibmcloud.local
   ```
  {: codeblock}

3. Start the VCSA UI installer (e.g. <drive_letter>:\vcsa-ui-installer\win32\installer.exe).
  
4. Click **Install a new vCenter Server**.

5. Deploy vcenter into BMS001 / esx-001 using the following parameters (match with your IP address plan and host names).

   Parameter | Value
   -----------------|----------
   Target ESXi host | esx-001.vmware.ibmcloud.local
   VM name | vcenter
   Deployment size | Small
   Storage size | Default
   Datastore | datastore1, thin
   Network | pg-mgmt (VLAN ID 100)
   IPv4 | static
   IP address | 10.97.0.132
   Host name | vcenter.vmware.ibmcloud.local
   Subnet mask or prefix length | 25
   Default gateway | 10.97.0.129
   DNS servers | 161.26.0.7, 161.26.0.9
   HTTP Port | 80
   HTTPS Port | 443


### Configure vCenter - Phase 2
{: #vpc-bm-vmware-vcenter-deployappliance-2}

After the previous step, vCenter installation continues with Phase 2.

1. Login to VMware vCenter Server Management as advised by the VCSA UI installer.

2. Use the following settings (match with your IP address plan and host names). Review the settings before finishing the wizard.

   Parameter | Value
   -----------------|----------
   Network configuration | Assign static IP address
   IP version | IPv4
   IP address | 10.97.0.132
   Subnet mask | 25
   Host name | vcenter.vmware.ibmcloud.local
   Gateway | 10.97.0.129
   DNS servers | 161.26.0.7,161.26.0.8
   Time synchronization mode | Synchronize time with the NTP servers
   NTP Servers | 161.26.0.6
   SSH access | Disabled
   SSO Details | vmware.ibmcloud.local
   Username | administrator
   CEIP setting | Opted out
    

## Create a new Datacenter and create a Cluster
{: #vpc-bm-vmware-vcenter-dccluster}
{: step}


### Create a new Datacenter
{: #vpc-bm-vmware-vcenter-dccluster-dc}

In this step, a new Datacenter is created.

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. In the vSphere Client **Host and Clusters view**, right-click and select **New data center**.
3. Enter a name, e.g. `VMware-On-IBM-Cloud-VPC`.
4. Finish the configuration.


### Create a Cluster
{: #vpc-bm-vmware-vcenter-dccluster-cluster}

In this step, you will create a new Cluster.

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. In the vSphere Client **Host and Clusters view**, right-click and select **New cluster**.
3. Enter a name, e.g. `Cluster-eu-de-1`.
4. Do not enable DRS or vSphere HA at this point.
5. Review the details.
6. Finish the configuration.


### Add hosts to vCenter
{: #vpc-bm-vmware-vcenter-dccluster-hosts}

Next, you need to add the deployed {{site.data.keyword.bm_is_short}} as hosts to the Cluster.

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. In the vSphere Client **Host and Clusters view**, right-click the created **Cluster** and select **Add hosts**.
3. Enter the hostnames and credentials for each host, and Click **Next**.
4. On Security Alert, manually verify these certificates and **accept the thumbprints**.
5. On Host summary, validate configurations and Click **Next**.
6. Review and finish the configuration.

Disable Maintenance mode, if needed.


## Create new Distributed Switch (vDS)
{: #vpc-bm-vmware-vcenter-dvs}
{: step}

Next, create a new distributed vSwitch.

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. In the vSphere Client **Host and Clusters view**, right-click a **data center** and select menu **New Distributed Switch**.
3. Enter a name, e.g. `vds-vpc`.
4. Select the version of the vSphere Distributed Switch. In this example, `version 7.0.0` is used.
5. Add the **settings**. Set the number of uplinks to 1.
6. You can create a default port group at this point (e.g. `dpg-management`), but additional port groups are needed e.g. for **vMotion, vSAN, NSX-T TEPs, NFS** etc.
7. Finish the configuration of the distributed vSwitch.


### Modify MTU
{: #vpc-bm-vmware-vcenter-dvs-mtu}

Modify distributed vSwitch MTU to 9000.

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. In the vSphere Client **Networking view**, right-click the `vds-vpc`.
3. Select Setting > Edit **Settings**.
4. Click **Advanced Tab**, and modify MTU (Bytes) to 9000.
5. Click **OK**.


### Create Port Groups
{: #vpc-bm-vmware-vcenter-dvs-dpgs}

A single default port group was created for the management network. Edit this port group to make sure it has all the characteristics of the management port group on the standard vSwitch, such as VLAN id, NIC teaming, and failover settings.

In this example the `VLAN ID` will be changed to be `100`, as this is where the vCenter is configured.

Create the additional Port Groups for the other VMKs:

* Hosts: **dpg-vmk**; no VLAN
* vMotion: **dpg-vmotion**; VLAN 200
* vSAN: **dpg-vsan**; VLAN 300

To create a Port Group in distributed switch:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. On the vSphere Client Home page, click **Networking** and navigate to the distributed switch.
3. Right-click the distributed switch and select Distributed port group > **New distributed port group**.
4. On the **Name and location** page, enter the name of the new distributed port group, or accept the generated name, and click Next.
5. On the **Configure settings** page, set the general properties for the new distributed port group and click **Next**.
6. Use the VLAN type drop-down menu to specify the type of VLAN traffic filtering and marking. Select VLAN and in the VLAN ID text box, enter the VLAN number.
7. (Optional) On the **Security** page, edit the security exceptions and click Next. No changes needed here for this example.
8. (Optional) On the **Traffic shaping** page, enable or disable Ingress or Egress traffic shaping and click Next. No changes needed here for this example.
9. (Optional) On the **Teaming and failover** page, edit the settings and click Next. No changes needed here for this example.
10. (Optional) On the **Monitoring** page, enable or disable NetFlow and click Next. No changes needed here for this example.
11. (Optional) On the **Miscellaneous** page, select Yes or No and click Next. No changes needed here for this example.
12. On the **Ready to complete** page, review your settings and click **Finish**.


## Create the vMotion Kernel Interfaces
{: #vpc-bm-vmware-vcenter-vmotvmk}
{: step}

Next, you need to configure a vMotion interface for the host using vCenter.

Configure a vMotion Interface as follows:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Click to select the **host**.
3. Click the **Configuration** tab.
4. Click **Networking**.
5. Click **Add Networking**.
6. Select VMkernel Network Adapter and click **Next**.
7. Select the existing standard vSwitch and click **Next**.
8. Enter a name in the **Network Label** to identify the network that vMotion uses.
9. Select a **VLAN ID** from the VLAN ID dropdown, use VLAN ID `200`. Inherit or set the vSwitch MTU (9000) and click **Next**.
10. Select **TCP/IP stack** vMotion and select **vMotion on Enabled** services and click **Next**.
11. Select Use static IPv4 settings.
12. Enter the **IP address** and **Subnet Mask** of the host's vMotion Interface. Use the provisioned server's vMotion VLAN NIC's IP.  
13. Click **Next**, then click **Finish**.

Repeat this for each host.


## Migrate Management / VMK interfaces
{: #vpc-bm-vmware-vcenter-migratevmks}
{: step}

With {{site.data.keyword.bm_is_short}}, a single uplink (PCI NIC) is used. To be able to migrate vmk interfaces smoothly, you need to follow the following procedure:

1. Configure `VMWARE_BMS002` / esx-002 and `VMWARE_BMS003` / esx-003 to use the distributed switch first.
2. Migrate vCenter to `VMWARE_BMS002` / esx-002.
3. Configure `VMWARE_BMS001` / esx-001 to use the distributed switch.


### Migrate the management network (vmk0) and its associated uplink (vmnic0) - BMS002 and BMS003
{: #vpc-bm-vmware-vcenter-migratevmks-vmk0-1}

In this step, you need to migrate the management network (vmk0) and its associated uplink (vmnic0) from the standard vSwitch to the distributed vSwitch (vDS) for `VMWARE_BMS002` and `VMWARE_BMS003`.

Perform this **only** for `VMWARE_BMS002` / esx-002 and `VMWARE_BMS003` / esx-003 at this point.
{:note}

Configure the distributed vSwitch as follows:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Right-click the **vDS** and select menu **Add and Manage Hosts**.
3. Add hosts to the vDS. Click the `green Add icon (+)`, and add esx-002/esx-003 from the cluster.
4. Configure the physical adapters (`assign uplink-1`) and VMkernel adapters (`assign to dpg-vmk`).
5. Click Manage physical adapters to migrate the physical adapters and VMkernel adapters, **vmnic0 and vmk0 to the vDS**.
6. Select an appropriate uplink on the vDS for physical adapter `vmnic0`. For this example, use `Uplink1`. The physical adapter is selected and an uplink is chosen.
7. Select to **migrate the management network** on vmk0 from the standard vSwitch to the distributed vSwitch as follows. Select these steps on host `VMWARE_BMS002` / esx-002 and `VMWARE_BMS003` / esx-003.
8. Select `vmk0`, and click Assign port group `dpg-vmk`.
9. Finish the configuration.
10. Review the changes to ensure that you are adding two hosts, two uplinks (vmnic0 from each host), and two VMkernel adapters (vmk0 from each host).
11. Click **Finish**.
12. Check connectivity to the host, and clear alarms if needed.


### Migrate the vCenter to `VMWARE_BMS002`
{: #vpc-bm-vmware-vcenter-migratevmks-vc}

Next, you need to migrate the vCenter:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Click to select the **vCenter Virtual Machine**.
3. Right Click, and select **Migrate**.
4. Click Change both **compute resource and storage**, click **Next**.
5. Select `VMWARE_BMS002` / esx-002, click **Next**
6. Select `DataStore1`, click **Next**.
7. Change Port group to be `dpg-management`.
8. Click **Next**, then click **Finish**.

After the vCenter migration, you may execute the following IBM Cloud CLO command to validate that the vCenter's VLAN NIC has been moved to `VMWARE_BMS002` / esx-002.

```sh
ibmcloud is bm-nics $VMWARE_BMS002  
```
{: codeblock}

### Migrate the management network (vmk0) and its associated uplink (vmnic0) - BMS001
{: #vpc-bm-vmware-vcenter-migratevmks-vmk0-2}

In this step, you need to migrate the management network (vmk0) and its associated uplink (vmnic0) from the standard vSwitch to the distributed vSwitch (vDS) for `VMWARE_BMS001`.

Perform this **only** for `VMWARE_BMS001` / esx-001 at this point.
{:note}

Configure the distributed vSwitch as follows:

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Right-click the **vDS** and select menu **Add and Manage Hosts**.
3. Add hosts to the vDS. Click the `green Add icon (+)`, and add esx-002/esx-003 from the cluster.
4. Configure the physical adapters (`assign uplink-1`) and VMkernel adapters (`assign to dpg-vmk`).
5. Click Manage physical adapters to migrate the physical adapters and VMkernel adapters, **vmnic0 and vmk0 to the vDS**.
6. Select an appropriate uplink on the vDS for physical adapter `vmnic0`. For this example, use `Uplink1`. The physical adapter is selected and an uplink is chosen.
7. Select to migrate the management network on vmk0 from the standard vSwitch to the distributed vSwitch as follows. Select these steps on host `VMWARE_BMS002` / esx-002 and `VMWARE_BMS003` / esx-003.
8. Select `vmk0`, and click **Assign port group** `dpg-vmk`.
9. **Finish** the configuration.
10. Review the changes to ensure that you are adding two hosts, two uplinks (vmnic0 from each host), and two VMkernel adapters (vmk0 from each host).
11. Click **Finish**.
12. Check connectivity to the host, and clear alarms if needed.

## Delete vSwitch0
{: #vpc-bm-vmware-vcenter-delvswitch}
{: step}

Delete `vSwitch0` on all hosts using the following method

1. Log into the vCenter Server using vSphere Client via Web Browser on the Jump machine.
2. Click on a **host**.
3. Click on the **Configure Tab**.
4. Click Networking, **Virtual Switches**.
5. Expand the standard switch.
6. Click the '...' and select **Remove**.

## Next Steps
{: #vpc-bm-vmware-vcenter-next-steps}

The next step in the tutorial series is:

* OPTIONAL: [Provision vSAN storage cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vsan#vpc-bm-vmware-vsan)
* OPTIONAL: [Provision NFS storage and attach to cluster](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-nfs#vpc-bm-vmware-nfs)
* [Provision {{site.data.keyword.vpc_short}} Subnets and configure Distributed Virtual Switch Portgroups for VMs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-newvm#vpc-bm-vmware-newvm)
* [Provision {{site.data.keyword.vpc_short}} Public Gateways and Floating IPs for VMware Virtual Machines](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-pgwip#vpc-bm-vmware-pgwip)
