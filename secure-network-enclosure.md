copyright:
  years: 2018
lastupdated: "2018-06-05"

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

# Secure Private Network on the IBM Cloud
Networking and security are major considerations for workloads deployed on public cloud. The need to create an isolated and secure private network environment is central to the IaaS model of application deployment. Firewalls, VLANS, routing and VPNs are all necessary components in creating an isolated private environment, within which virtual machines and bare-metal servers can be securely deployed in multi-tier application topologies, while proving protection from risks on the public internet.  

This tutorial highlights how a Virtual Router Appliance (VRA) <link> can be configured on the IBM Cloud to create a simple secure private network (enclosure). The enclosure creates an isolated network environment within which complex application topologies can be created, using the familiar and well known networking technologies IP routing, VLANs, IP subnets and firewall rules. 

This tutorial is a starting point for classic networking on the IBM Cloud and should not be considered a production capability as described here. Additional capabilities that might be considered are:
* Direct Link <link>
* Hardware firewall appliances (Shared and Dedicated) <link>
* Hardware VPN appliances <link>
* High Availability with clustered routers and dual uplinks <link>

Options are presented for enhancing the enclosure with the configuration of site-to-site VPN for secure data center connectivity and Network Address Translation (SNAT) for access to Internet services. 

{:shortdesc}

## Objectives
{: #objectives}

* Create a secure private network within which virtual machines and bare-metal servers can be deployed
* Deploy a Virtual Router Appliance (VRA)
* Configure VLANs and IP subnets
* Secure the VRA and enclosure
* Configure VRA firewall rules

## Services used
{: #services}

This tutorial uses the following service:
* [Virtual Router Appliance](https://console.bluemix.net/catalog/services/ServiceName)

This tutorial will incur costs. The VRA is only available on a monthly pricing plan. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution1/Architecture.png)
</p>


1. The VRA is deployed
2. Initial VRA setup
2. Ordering the first server and VLAN
3. VRA configuration

## Before you begin
{: #prereqs}

### Configure the SoftLayer VPN

In this tutorial this network is not visible on the public Internet. The VRA and any servers will only be accessible via private IP addresses and you will use your SoftLayer VPN for connectivity. 

1. [Ensure your VPN Access is enabled](https://knowledgelayer.softlayer.com/procedure/getting-started-softlayer-vpn) and configured for SSL. 

     You should be a **Master User** to enable VPN access or contact your master user for access.
     {:tip}
2. Obtain your VPN Access credentials in [your profile page](https://control.softlayer.com/account/user/profile).
3. Log in to the VPN through [the web interface](https://www.softlayer.com/VPN-Access) or preferably use your local workstation with a VPN client for [Linux](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-linux), [macOS](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-mac-os-x-1010) or [Windows](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-windows). 

Use the FQDN of a single data center VPN access point from the previous of the form *vpn.xxxnn.softlayer.com* as the Gateway address.{tip}

### Check account permissions

Contact your Infrastructure master user to get the following permissions:
- **Quick Permissions** - Basic User
- **Network** so that you can create and configure the enclosure, All Network Permissions are required. 
- **Services** manage SSH Keys

### Upload SSH keys
Via the portal [Upload the SSH public key](https://console.bluemix.net/docs/infrastructure/ssh-keys/index.html) that will be used to access and administer the VRA and private network.  

## Provision Virtual Router Appliance
{: VRA}
The first step is to deploy a VRA that will provide IP routing and the firewall for the private network enclosure. The internet is accessible from the enclosure by an IBM Cloud provided public facing transit VLAN, a gateway and optionally a hardware firewall create the connectivity from the public VLAN to the secure private enclosure VLANs. In this solution tutorial a Virtual Router Appliance (VRA) provides this gateway and firewall perimeter. 

1. Go to the catalog to create a [IBM Virtual Router Appliance](https://console.bluemix.net/catalog/infrastructure/virtual-router-appliance)
2. Click on **Create** to go to the **Gateway Appliances** page.  
3. On the top right of the page click **Order Gateway**
4. You will be redirected to the ordering screen where the target data center and the VRA Server type can be selected. 

For a production environment it is recommended to use at a minimum - Dual Intel Xeon E5-2620 v4 (16 Cores, 2.10 GHz) with 64GB of RAM.{tip}

   1. Select the target data center in the drop down at the top of the page
   2. Select the link under **STARTING PRICE PER MONTH** for the desired server type to host the VRA 
   3. RAM. Select 64GB minimum for production use
   4. Operating System. Select the only option
        - Virtual Router Appliance 5.x (up to 20Gbps) Subscription Edition (64 Bit) 
   5. Uplink Port Speeds. Take the default or if required select 1Gbps, 10Gbps  and redundant links
   6. Click **Add To Order**
   
5. You will be directed to the Checkout screen
 
   1. Validate or change the choices already made.   
   2. Add SSH Key under the **Advanced System Configuration** heading. Via the 'Server 1' drop down select the SSH key you specified earlier. 
   3. Set the VRA Hostname and Domain name. This domain name is not used for routing and DNS but should align with your network naming standards. 
   4. Click **Submit Order** 

6. Monitor for creation on the Devices page or via email. VRA creation may take a number of hours to complete. 


### Review deployed VRA
The new VRA can be inspected on the Network -> Gateway Appliances page 

Clicking the Gateway name (gateway1) in the Gateway column, takes you to the Gateway Details page

Record the Private and Public IP addresses of the VRA for future use.

<< Screenshot >>

  

## Initial VRA setup
Using the SSL VPN login to the VRA from your workstation using the default **vyatta** account accepting the SSH security prompts. To increase security, once SSH login is successful via the private network, public network access to the VRA is removed along with userid/password authentication. 

```
SSH vyatta@<VRA Private IP Address>
```
Setup of the VRA requires the VRA to be placed into [edit] mode using the `configure` or `conf` command. When in [edit] mode the prompt changes from $ to #. After successful VRA command execution a change can be committed to the running configuration with the `commit` command. Once you have verified that the configuration is working as intended, it can be saved permanently using the `save` command. To return to the Vyatta system command prompt $, type `exit`. 

If at any stage before the `save` command is entered, access is lost due to committing a configuration change, rebooting the VRA will return it back to the last save point, restoring access.{tip}

First disable standard user/password login:

```
vyatta@gateway1:-$ configure
[edit]
vyatta@gateway1# set service ssh disable-password-authentication
[edit]
vyatta@gateway1# commit
[edit]
vyatta@gateway1# save
[edit]
vyatta@gateway1# exit
vyatta@gateway1:-$ 
```
From this point in this tutorial it is assumed that all VRA commands are entered at the \[edit\] # prompt. 


The VRA is pre-configured for the IBM Cloud IaaS environment. This includes

- NTP server
- Name servers
- SSH
- HTTPS web server 
- Default time-zone US/Chicago

Set local time zone as required. Auto-complete with the tab key will list the potential time zone values

```
$ configure 
# set system time-zone **<timezone>**
# commit 
```

The following parameters should be configured:

```
# set security firewall all-ping enable
# set security firewall broadcast-ping disable
```

By default the VRA firewall is stateless. Stateful firewalls are used in this guide and set with the following commands. 

```
# set security firewall global-state-policy icmp
# set security firewall global-state-policy udp
# set security firewall global-state-policy tcp
# commit
```
Save the configuration
```
# save
```
To proceed with the creation of the private enclosure, user VLANs for the provisioning of virtual and bare-metal servers must be first assigned to the VRA.

### Ordering the first virtual server and VLAN
Order a [virtual server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group) from the Compute category of the IBM cloud services catalog. This will create the first private user VLAN and IP subnet.  <Link to portable and static IPs>

1. Select ‘Public Virtual Server’. Click **Create**.

  On the Virtual Server ordering page specify:
  - Hostname
  - Domain
  - Location (Data Center same as the VRA)
  - Device Flavor – allow to default
  - SSH Key - key as uploaded earlier
  - Image – allow to default to CentOS
  - Network Interface. The network interface must be changed from the default of *public and private* to only specify a Private Network Uplink. This ensures that the new server has no direct access to the Internet, and access is controlled by rules on the VRA.  

![](images/solution3/Storage_Catalog.png)

2. Click tick box to accept the Third-Party service agreements. 
3. Click **Provision**
4. Monitor for completion on the **Devices > Device List** page or via email. 
5. Make not of the *Private IP address* of the VSI for a later step. 
6. Verify access to the VSI via the IBM Cloud private network using `ping` and `SSH` from your local workstation over the VPN. 
   ```
   ping <VSI Private IP Address>
   SSH root@<VSI Private IP Address>
   ``` 

### Adding the user VLAN to the VRA
A private VLAN will have been automatically provisioned by IBM Cloud for the virtual server and will be routed via the VRA to create the secure private network. 

On the [Infrastructure Dashboard](https://control.bluemix.net) Select **Network** in the left hand pane followed by **Gateway Appliances** to go to the [Gateway Appliances](https://control.bluemix.net/network/gateways) page. Select the name of the newly created VRA to proceed to the Gateway Details page. , the user VLAN can be associated with the VRA to create the enclosure.  Find the Associate a VLAN section on the Gateway detail page. The drop down box, ‘Select VLAN’ should be enabled and if selected the newly provisioned VLAN can be selected. 

![](images/solution3/Storage_Catalog.png)
 

NOTE: If no eligible VLAN is shown, the VSI has been created on a different frontend customer router to the VRA. This will require a ticket to be raised to request a private VLAN on the same router as the VRA and this VLAN to be deleted. See the instructions relating to multi-tier network topology for raising a ticket for multiple VLANs and specifying the target VLAN for VSI creation. 

If an eligible VLAN is shown, click **Associate** to tell IBM Cloud that the IP routing this VLAN will now be manged by this VRA.


 

Initial VLAN association may take a couple of minutes to complete. Once finished the VLAN should be shown under the Associated VLANs heading. At this stage the VLAN and associated subnet are not protected or routed via the VRA and the VSI is accessible via the IBM Cloud Private network. It is shown with a Status of *Bypassed*.  


 

To route the VLAN/Subnet via the VRA, select Actions > Route VLAN as below 

 

Routing will take a few minutes, where upon a screen refresh will show it is Routed. 


 

Select the VLAN name to view the VLAN details. The provisioned VSI can be seen as well as the assigned Primary IP Subnet. Network> IP Management > VLANs

 

Record the Private VLAN ID <nnnn> (1199 in this example). Select the subnet to see the subnet details. 

 


Record the subnet Network, Gateway addresses and CIDR (/26) as these are required for further VRA configuration. Also record the VSI IP address. 

At this time the VSI is now inaccessible via the private or management networks as the internal VRA routing for this subnet has not been configured. A ping of the VSI should timeout if the VLAN has been successfully associated with the VRA and IP traffic for the subnet routed to the VRA.  

The additional work to configure the enclosure and routing is now performed directly on the VRA via SSH. 







## Remove resources
{:removeresources}
Steps to take to remove the resources created in this tutorial. 

The VRA is on a monthly paid plan. Cancellation does not result in a refund. It is suggested to only cancel if this VRA will not be required again in the next month.{tip}
If a dual VRA High-Availability cluster is required, this single VRA can be upgraded to a xxxxxxxx.{tip}  

1. Cancel any virtual servers of bare-metal servers
2. Cancel the VRA

## Related content
{:related}
<VRA documentation>
<Static and Portable IP Subnets> 

* [Relevant links](https://blah)
