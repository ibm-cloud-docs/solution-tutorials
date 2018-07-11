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
2. VLANs are assigned to the VRA
3. The VRA is secured

## Before you begin
{: #prereqs}

### Configure the SoftLayer VPN

In this tutorial this network is not visible on the public Internet. The VRA and any servers will only be accessible via private IP addresses and you will use your SoftLayer VPN for connectivity. 

1. [Ensure your VPN Access is enabled](https://knowledgelayer.softlayer.com/procedure/getting-started-softlayer-vpn) and configured for SSL. 

     You should be a **Master User** to enable VPN access or contact your master user for access.
     {:tip}
2. Obtain your VPN Access credentials in [your profile page](https://control.softlayer.com/account/user/profile).
3. Log in to the VPN through [the web interface](https://www.softlayer.com/VPN-Access) or preferably use your local workstation with a VPN client for [Linux](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-linux), [macOS](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-mac-os-x-1010) or [Windows](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-windows). Use the FQDN of a single data center VPN access point from the previous of the form vpn.xxxnn.softlayer.com.  

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
4. You will be redirected to the ordering screen where the target data center and the VRA Server type can be selected. For a production environment it is recommended to use at a minimum: Dual Intel Xeon E5-2620 v4 (16 Cores, 2.10 GHz) with 64GB of RAM

   1. Select the target data center in the drop down at the top of the page
   2. Select the link under **STARTING PRICE PER MONTH** for the desired server type to host the VRA 
   3. RAM. Select 64GB minimum for production
   4. Operating System. Select the only option
        - Virtual Router Appliance 5.x (up to 20Gbps) Subscription Edition (64 Bit) 
   5. Uplink Port Speeds. Take the default or if required select 1Gbps, 10Gbps  and redundant links
   6. Click **Add To Order**
   
 5. You will be directed to the Checkout screen
 
   1. Validate or change the choices already made.   
   2. Add SSH Key under the **Advanced System Configuration** heading. Via the 'Server 1' drop down select the SSH key you specified earlier. 
   3. Set the VRA Hostname and Domain name. This domain name is not used for routing and DNS but should align with your network naming standards. 
   4. Click **Submit Order** 
      



### Test the private network behavior


## Remove resources
{:removeresources}
Steps to take to remove the resources created in this tutorial. The VRA is on a monthly paid plan. Cancellation does not result in a refund. It is suggested to only cancel if this VRA will not be required again in the next month.     
1. Cancel any virtual servers of bare-metal servers
2. Cancel the VRA

## Related content
{:related}

* [Relevant links](https://blah)
