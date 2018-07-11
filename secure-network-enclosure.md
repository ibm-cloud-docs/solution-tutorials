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

This tutorial is a starting point for classic networking on the IBM Cloud and should not be considered a production capability as is. Additional capabilities that might be considered are:
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

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

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
3. Log in to the VPN through [the web interface](https://www.softlayer.com/VPN-Access) or preferably use your local workstation with a VPN client for [Linux](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-linux), [macOS](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-mac-os-x-1010) or [Windows](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-windows). Use an FQDN of a single data center VPN access point from the previous of the form vpn.xxxnn.softlayer.com.  

### Check account permissions

Contact your Infrastructure master user to get the following permissions:
- Quick Permissions - Basic User
- **Network** so that you can create and configure the enclosure, All Network Permissions are required. 
- **Services** manage SSH Keys

### Upload SSH keys

Upload the SSH public key via the [Portal](https://console.bluemix.net/docs/infrastructure/ssh-keys/index.html) that will be used to access and administer the VRA and private network.  


## Create environment
{: setup}

In this section, you will create the services required to ...

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started).
    ```sh
    ibmcloud login
    ```
    {: pre}
    ```sh
    ibmcloud target --cf
    ```
    {: pre}
2. Create an instance of [Service A](https://console.bluemix.net/catalog/services/the-service-name).
  ```sh
  ibmcloud resource service-instance-create service-instance-name service-name lite global
  ```
3. Create an instance of [Service B](https://console.bluemix.net/catalog/services/the-service-name).

## Solution Specific Section
{: #section_one}

Introductory statement that overviews the section

1. Step 1 Click **This** and enter your name.

  This is a tip.
  {:tip}

2. Keep each step as short as possible.
3. Do not use blank lines between steps except for tips or images.
4. *Avoid* really long lines like this one explaining a concept inside of a step. Do not offer optional steps or FYI inside steps. *Avoid* using "You can do ...". Be prescriptive and tell them exactly what to do succinctly, like a lab.
5. Do not use "I", "We will", "Let's", "We'll", etc.
6. Another step
7. Try to limit to 7 steps.

### Sub section

   ```bash
   some shellscript
   ```
   {: pre}





## Another Solution Specific Section
{: #section_two}

Introductory statement that overviews the section

### Sub section

## Remove resources
{:removeresources}

Steps to take to remove the resources created in this tutorial
 * 

### Test the private network behavior



## Related content
{:related}

* [Relevant links](https://blah)
