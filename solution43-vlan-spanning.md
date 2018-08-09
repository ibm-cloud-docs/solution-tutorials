---
copyright:
  years: 2018
lastupdated: "2018-08-09"
---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}


# Linking secure private networks over the IBM network

As the need for global reach and 24-7 operations of web application increases, the need to host services in multiple cloud data centers increases. Data centers across multiple regions provide resilience in the case of a regional failure and also bring workloads closer to globally distributed users reducing latency and increasing perceived performance. Using the [{{site.data.keyword.Bluemix_notm}}  network]( https://www.ibm.com/cloud-computing/bluemix/our-network) enables users to link workloads hosted in secure private networks across data centers and regions. 

This tutorial presents setup of a privately routed IP connection over the {{site.data.keyword.Bluemix_notm}} private network between two secure private networks hosted in different data centers. All resources are owned by one {{site.data.keyword.Bluemix_notm}} account. It uses the [Isolate workloads with a secure private network]( https://console.bluemix.net/docs/tutorials/secure-network-enclosure.html) tutorial to deploy two private networks that are securely linked over the {{site.data.keyword.Bluemix_notm}} private network using the [VLAN Spanning]( https://console.bluemix.net/docs/infrastructure/vlans/vlan-spanning.html#vlan-spanning) service. 
{:shortdesc}

## Objectives
{: #objectives}

-	Link networks within an {{site.data.keyword.Bluemix_notm}} IaaS account
-	Setup firewall rules for site to site access 
-	Configure routing between sites

## Services used
{: #products}

This tutorial uses the following {{site.data.keyword.Bluemix_notm}} services: 
* [Virtual Router Appliance](https://console.bluemix.net/docs/infrastructure/virtual-router-appliance/about.html#about)
* [Virtual Servers]( https://console.bluemix.net/catalog/infrastructure/virtual-server-group)
* [VLAN Spanning]( https://console.bluemix.net/docs/infrastructure/vlans/vlan-spanning.html#vlan-spanning)

**Attention:** This tutorial might incur costs. The VRA is only available on a monthly pricing plan. Use the [Pricing Calculator](https://console.bluemix.net/pricing/)  to generate a cost estimate based on your projected usage.


## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution43-vlan-spanning/vlan-spanning.png)
</p>


1.	Deploy secure private networks
2.	Configure VLAN Spanning
3.	Configure firewall rules for remote site access
4.	Configure IP routing between private networks

## Before you begin
{: #prereqs}

This tutorial is based on the existing tutorial, [Isolate workloads with a secure private network]( https://console.bluemix.net/docs/tutorials/secure-network-enclosure.html#isolate-workloads-with-a-secure-private-network). That tutorial should be reviewed before commencing. 

## Configure secure private network sites
{: #private_network}

The tutorial [Isolate workloads with a secure private network]( https://console.bluemix.net/docs/tutorials/secure-network-enclosure.html#isolate-workloads-with-a-secure-private-network) is utilised twice to implement private networks in two different data centers. There is no restriction on which two data centers can be utilised, apart from noting the impact of latency on any traffic or workloads that will communicate between the sites. 

The [Isolate workloads with a secure private network]( https://console.bluemix.net/docs/tutorials/secure-network-enclosure.html#isolate-workloads-with-a-secure-private-network) tutorial can be followed without change for each selected data center, recording the following information for later steps. 


					Data center 1		Data center 2
Data center
VRA public IP address
VRA private IP address
VRA private subnet & CIDR

\<Private VLAN ID\>
VSI private IP address
APP zone subnet & CIDR

1.	Proceed to the Gateway Details for each VRA via the [Gateway Appliances]( https://control.bluemix.net/network/gateways) page.  
2.	Locate the Gateway VLANs section and select the Gateway [VLAN]( https://control.bluemix.net/network/vlans) on the **Private** network to view the VLAN details. The provisioned VRA can be seen under the **Devices* section as well as the assigned subnets. 
Make a note of the VRA subnet IP address and CIDR (/26) as these are required for routing configuration. 
3.	Again on the Gateway Details page, locate the **Associated VLANs** section and select the [VLAN]( https://control.bluemix.net/network/vlans) on the **Private** network that was associated to create the secure network and APP zone. The provisioned VSI can be seen under the **Devices* section as well as the assigned subnet. 
Under the **Subnets** section make a note of the VSI subnet IP address and CIDR (/26) as these are required for routing configuration. 
This VLAN and subnet is identified as the APP zone in both VRA firewall configurations. 



## Configure VLAN Spanning 
{: #vlan-spanning}

By default servers (and VRAs) on different VLANs and data centers, are unable to communicate with each other over the private network. In these tutorials, within a single data center VRA’s are used to link VLANs and subnets with classic IP routing and firewalls to create a private network for server communication across VLANs. In this configuration servers belonging to the same IBM Cloud account are unable to communicate across data centers. 

The [VLAN spanning]( https://console.bluemix.net/docs/infrastructure/vlans/vlan-spanning.html#vlan-spanning) service lifts this restriction of communication between the VLANs and subnets that are **NOT** associated with VRAs. It must be noted that even when VLAN spanning is enabled, VLANs associated with VRAs can only communicate via their associated VRA, as determined by the VRA firewall and routing configuration.

Outside of the secure private networks created by the VRAs, the VLANs and subnets are ‘spanned’ allowing interconnection of the ‘unassociated’ VLANs across data centers. This includes the VRA Gateway (transit) VLANs belonging to the same IBM Cloud account in different data centers. So allowing VRAs to communicate across data centers when VLAN spanning is enabled. With VRA to VRA connectivity, VRA firewall and routing configuration enables servers within the secure networks to connect. 

Enable VLAN Spanning:

1.	Proceed to the [VLANs]( https://control.bluemix.net/network/vlans) page.
2.	Select the **Span** tab at the top of the page
3.	Select the VLAN Spanning ‘On’ radio button. This will take a number of minutes for the network change to complete.
4.	Confirm that the two VRAs can now communicate:
-	Login to data center 1 VRA and ping data center 2 VRA
```
SSH vyatta@<DC1 VRA Private IP Address>
ping <DC2 VSI Private IP Address>
```

{: codeblock}

-	Login to data center 2 VRA and ping data center 1 VRA
```
SSH vyatta@<DC2 VRA Private IP Address>
ping <DC1 VSI Private IP Address>
```
{: codeblock}




## Configure VRA IP Routing 
{: #vra_routing}


Create the VRA routing in each data center to enable the VSIs in the APP zones in both data centers to communicate. 

1.	 Create static route in data center 1 to the APP zone private subnet in data center 2, in VRA edit mode.

   ```
	ssh vyatta@<DC1 VRA Private IP Address>
	conf
   set protocols static route <DC2 APP zone subnet/CIDR>  next-hop <DC2 VRA Private IP>
   ```
   {: codeblock}   

2.	 Create static route in data center 2 to the APP zone private subnet in data center 1, in VRA edit mode.

   ```
	ssh vyatta@<DC2 VRA Private IP Address>
	conf
   set protocols static route <DC1 APP zone subnet/CIDR>  next-hop <DC1 VRA Private IP>
   ```
   {: codeblock}   


2. Review the VRA routing table from the VRA command line. At this time the VSIs cannot communicate as no firewall rules exist to allow traffic for the APP Zone subnets. Firewall rules are required for traffic initiated at either side.

   ```bash
   show ip route
   ```
   {: codeblock}


## VRA firewall configuration
{: #vra_firewall}

The existing APP zone firewall rules are only configured to allow traffic to and from IBM Cloud services on the IBM Cloud private network. Subnets associated with VSIs in other data centers are blocked. The next step is to update the `ibmprivate` resource group associated with the APP-TO-INSIDE firewall rule to allow 


1.	On the data center 1 VRA edit command mode, add the <DC2 APP zone subnet>/CIDR to the `ibmprivate’ resource group

     ```
set resources group address-group ibmprivate address <DC2 APP zone subnet>/CIDR     commit
     ```

2.	On the data center 2 VRA edit command mode, add the <DC1 APP zone subnet>/CIDR to the `ibmprivate’ resource group

     ```
set resources group address-group ibmprivate address <DC1 APP zone subnet>/CIDR     commit
     ```
3.	

```bash
   ping <Remote Subnet Gateway IP>
   ssh root@<VSI Private IP>
   ping <Remote Subnet Gateway IP>
   ```
   {: codeblock}



## Remove resources
{:removeresources}
Steps to take to remove the resources created in this tutorial. 

The VRA is on a monthly paid plan. Cancellation does not result in a refund. It is suggested to only cancel if this VRA will not be required again in the next month. If a dual VRA High-Availability cluster is required, this single VRA can be upgraded on the [Gateway Details](https://control.bluemix.net/network/gateways/371923) page.{tip}  

1. Cancel any virtual servers or bare-metal servers
2. Cancel the VRA
3. Cancel any additional VLANs by support ticket. 



## Related material
{:related}

1.	Virtual Routing and Forwarding (VRF) is an alternative to the use of VLAN Spanning to connect networks across an IBM Cloud Account. VRF is mandatory for all clients using  [{{site.data.keyword.BluDirectLink}}]( https://github.ibm.com/steve-strutt/tutorials/blob/infrastructure/direct-link/subnet-configuration.html#configure-ibm-cloud-direct-link).

[Overview of Virtual Routing and Forwarding (VRF) on IBM Cloud](https://console.bluemix.net/docs/infrastructure/direct-link/vrf-on-ibm-cloud.html#customer-vrf-overview)

2.	[The IBM Cloud network]( https://www.ibm.com/cloud-computing/bluemix/our-network)
