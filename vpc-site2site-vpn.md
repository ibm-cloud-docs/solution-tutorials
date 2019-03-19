---
copyright:
  years: 2019
lastupdated: "2019-03-19"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}

# Use a VPC/VPN gateway for secure and private on-premises access to cloud resources
{: #vpc-site2site-vpn}

IBM will be accepting a limited number of customers to participate in an Early Access program to VPC starting in early April, 2019 with expanded usage being opened in the following months. If your organization would like to gain access to IBM Virtual Private Cloud, please complete this [nomination form](https://{DomainName}/vpc){: new_window} and an IBM representative will be in contact with you regarding next steps.
{: important}

IBM offers a number of ways to securely extend an on-premises computer network with resources in the IBM cloud. It allows you to benefit from the elasticity of provisioning servers when you need them and removing them when no longer required. Moreover, you can easily and securely connect your on-premises capabilities to the {{site.data.keyword.cloud_notm}} services.

This tutorial walks you through connecting an on-premises Virtual Private Network (VPN) gateway to a cloud VPN created within a VPC (a VPC/VPN gateway). First, you will create a new {{site.data.keyword.vpc_full}} (VPC) and the associated resources like subnets, network Access Control Lists (ACLs), Security Groups and Virtual Server Instance (VSI). 
The VPC/VPN gateway will establish an [IPsec](https://en.wikipedia.org/wiki/IPsec) site-to-site link to an on-premises VPN gateway. The IPsec and the [Internet Key Exchange](https://en.wikipedia.org/wiki/Internet_Key_Exchange), IKE, protocols are proven open standards for secure comunication. To further demonstrate secure and private access, you will deploy a microservice on a VPC/VSI to access {{site.data.keyword.cos_short}} (COS), representing a line of business application.
The COS service has a Cloud Service Endpoint (CSE), that can be used for private no cost ingress/egress within {{site.data.keyword.cloud_notm}}. An on-premises computer will access the COS microservice. All traffic will flow through the VPN and privately through {{site.data.keyword.cloud_notm}}.

There are many popular on-premises VPN solutions for site-to-site gateways available. This tutorial utilizes the [strongSwan](https://www.strongswan.org/) VPN Gateway to connect with the VPC/VPN gateway. To simulate an on-premises data center, you will install the strongSwan gateway on a VSI in {{site.data.keyword.cloud_notm}}.

{:shortdesc}
In short, using a VPC with Virtual Private Network gateway and a Cloud Service Endpoint you can

- connect your on-premises computers to workloads running in {{site.data.keyword.cloud_notm}},
- insure private and low cost connectivity to cloud services,
- connect your cloud-based systems to on-premises computers.

## Objectives
{: #objectives}

* Access a virtual private cloud environment from an on-premises data center or (virtual) private cloud.
* Securely reach cloud services using private service endpoints.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.vpn_full}}](https://{DomainName}/vpc/provision/vpngateway)
- [{{site.data.keyword.cos_full}}](https://{DomainName}/catalog/services/cloud-object-storage)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

The following diagram shows the virtual private cloud consisting of a bastion and an app server. The app server hosts a microservice interfacing with {{site.data.keyword.cos_short}} service. A (simulated) on-premises network and the virtual cloud environment are connected via VPN gateways.

![Architecture](images/solution46-vpc-vpn/ArchitectureDiagram.png)

Notes:

1. After setting up the required infrastructure (subnets, security groups with rules, VSIs) on the cloud, the admin (DevOps) connects (SSH) to the VSI using the private SSH key and installs the microservice software and verifies it is working.
1. A VSI with associated floating IP address will be provisioned to hold the open source VPN Gateway. Note the public IP address.
1. A VPC/VPN Gateway is provisioned, note the public IP address.
1. Configure both the VPC/VPN Gateway and open source VPN Gateway connections with each others public ip addresses
1. Verify connectivity through the VPN Gateways by accessin the microservice directly through the vpn site-to-site connection

## Before you begin
{: #prereqs}

- Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview). You need the optional CLI infrastructure plugin.
- Login to {{site.data.keyword.cloud_notm}} via the command line. See [CLI Getting Started](https://{DomainName}/docs/cli/reference/ibmcloud?topic=cloud-cli-ibmcloud-cli) for details.
- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc/vpc-user-permissions.html).
- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc/getting-started.html#prerequisites).

## Deploy a virtual app server in a virtual private cloud
In the following, you will download the scripts to set up a baseline VPC environment and code for a microservice to interface with the {{site.data.keyword.cos_short}}. Thereafter, you will provision the {{site.data.keyword.cos_short}} service and set up the baseline.

### Get the code
{: #setup}


1. Get the application's code:
   ```sh
   git clone https://github.com/IBM-Cloud/vpc-tutorials
   ```
   {: codeblock}
2. Go to the scripts for this tutorial by changing into **vpc-tutorials**, then **vpc-site2site-vpn**:
   ```sh
   cd vpc-tutorials/vpc-site2site-vpn
   ```
   {: codeblock}

### Create services
In this section, you will login to {{site.data.keyword.cloud_notm}} on the CLI and create an instance of {{site.data.keyword.cos_short}}.

1. Verify that you have followed the prerequisite steps of logging in
    ```sh
    ibmcloud target
    ```
    {: codeblock}
2. Create an instance of [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage).
   ```sh
   ibmcloud resource service-instance-create vpns2s-cos cloud-object-storage lite global
   ```
   {: codeblock}
3. Create a service key with role **Writer**:
   ```sh
   ibmcloud resource service-key-create vpns2s-cos-key Writer --instance-name vpns2s-cos
   ```
   {: codeblock}
4. Obtain the service key details in JSON format:
   ```sh
   ibmcloud resource service-key vpns2s-cos-key --output json | jq '.[] | .credentials'
   ```
   {: codeblock}
   Copy the output, a JSON object, into a new file **credentials.json** in the subdirectory **vpc-app-cos**. It will be used later on by the app.


### Create a Virtual Private Cloud baseline resources
{: #create-vpc}

The tutorial assumes that you already have a VPC with required subnets, security groups and virtual server instances provisioned. In the following, create these resources by configuring and then running a setup script.

1. Configure TODO
2. Run the script:
    ```sh
   ./vpc-site2site-vpn-baseline-create.sh
   ```
   {: codeblock}
3. This will result in creating the following resources:
   - 1 VPC named ...
   - 2 subnets within the VPC
   - X security groups with ingress and egress rules
   - 2 VSIs

   Note down for later use the returned values for **VSI_CLOUD_IP**, **ONPREM_IP**, **CLOUD_CIDR**, and **ONPREM_CIDR**.


Review the *data.sh* file created.  It has useful information and parameters

### Create the Virtual Private Network gateway and connection
In the following, you will add a VPN gateway and an associated connection to the subnet with the application VSI.

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page, then click on **VPNs** in the navigation tab and on **New VPN gateway** in the dialog.
2. In the form **New VPN gateway for VPC** enter **vpns2s-gateway** as name. Make sure that the correct VPC, resource group and subnet are selected.
3. Leave **New VPN connection for VPC** is activated. Enter **vpns2s-gateway-conn** as name.
4. For the **Peer gateway address** use the floating IP address of **vpns2s-onprem-vsi**. Type in **20_PRESHARED_KEY_KEEP_SECRET_19** as **Preshared key**.
5. For **Local subnets** use the information provided for **CLOUD_CIDR**, for **Peer subnets** the one for **ONPREM_CIDR**.
6. Leave the settings in **Dead peer detection** as is. Click **Create VPN gateway** to create the gateway and an associated connection.
7. Wait for the VPN gateway to become available (you may need to refresh the screen). Note down the assigned **Gateway IP** address as **CLOUD_IP**. 

### Create the on-premises Virtual Private Network gateway
Next, you will create the VPN gateway on the other site, in the simulated on-premises environment. You will use the open source-based IPsec software [strongSwan](https://strongswan.org/).

1. Connect to the "on-premises" VSI **vpns2s-onprem-vsi** using ssh. Execute the following and replace **ONPREM_IP** with the IP address returned earlier.

   ```sh
   ssh root@ONPREM_IP
   ```
   {:pre}


2. Next, on the machine **vpns2s-onprem-vsi**, execute the following commands to update the package manager and to install the strongSwan software.

   ```sh
   apt-get update
   ```
   {:pre}
   ```sh
   apt-get install strongswan
   ```
   {:pre}

3. Configure the file **/etc/sysctl.conf** by adding three lines to its end. Copy the following over and run it:

   ```sh
   cat >> /etc/sysctl.conf << EOF
   net.ipv4.ip_forward = 1
   net.ipv4.conf.all.accept_redirects = 0
   net.ipv4.conf.all.send_redirects = 0
   EOF
   ```
   {:codeblock}

4. Next, edit the file **/etc/ipsec.secrets**. Add the following line to configure source and destination IP addresses and the pre-shared key. The key is the same as configured earlier.
   ```
   ONPREM_IP CLOUD_IP : PSK "20_PRESHARED_KEY_KEEP_SECRET_19"
   ```
   {:pre}

5. The last file you need to configure is **/etc/ipsec.conf**. Add the following codeblock to the end of that file. Replace **ONPREM_IP**, **ONPREM_CIDR**, **CLOUD_IP**, and **CLOUD_CIDR** with the respective known values.
   ```sh
   # basic configuration
   config setup
      charondebug="all"
      uniqueids=yes
      strictcrlpolicy=no

   # connection to vpc/vpn datacenter 
   # left=onprem / right=vpc
   conn tutorial-site2site-onprem-to-cloud
      authby=secret
      left=%defaultroute
      leftid=ONPREM_IP
      leftsubnet=ONPREM_CIDR
      right=CLOUD_IP
      rightsubnet=CLOUD_CIDR
      ike=aes256-sha2_256-modp1024!
      esp=aes256-sha2_256!
      keyingtries=0
      ikelifetime=1h
      lifetime=8h
      dpddelay=30
      dpdtimeout=120
      dpdaction=restart
      auto=start
    ```
    {:codeblock}


6. Restart the VPN gateway, then check its status by running: ipsec restart
   ```sh
   ipsec restart
   ```
   {:pre}
   ```sh
   ipsec status
   ```
   {:pre}

   It should report that a connection has been established. Keep the terminal and ssh connection to this machine open.

## Test the connectivity


### Test using ssh
To test that the VPN connection has been successfully established, use the simulated on-premises environment as proxy to log in to the cloud-based application server. 

1. In a new terminal, execute the following command after replacing the values. It uses the strongSwan host as jump host to connect via VPN to the application server's private IP address.

   ```sh
   ssh -J root@ONPREM_IP root@VSI_CLOUD_IP
   ```
   {:pre}
  Once successfully connected, close the ssh connection.

2. In the "onprem" VSI terminal, stop the VPN gateway:
   ```sh
   ipsec stop
   ```
   {:pre}
3. In the command window from step 1), try to establish the connection again:

   ```sh
   ssh -J root@ONPREM_IP root@VSI_CLOUD_IP
   ```
   {:pre}
  The command should not succeed because the VPN connection is not active and hence there is no direct link between the simulated on-prem and cloud environments.


### Test using a microservice

TODO: Install and start the small storage app, access COS.



## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

* [Relevant links](https://blah)

## Expand the tutorial 
{: #expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- Add a [load balancer](/docs/infrastructure/vpc/console-tutorial.html#creating-a-load-balancer) to distribute inbound microservice traffic across multiple instances.


## Related content
{: #related}

- [VPC Glossary](/docs/infrastructure/vpc/vpc-glossary.html)
- [VPC using the IBM Cloud CLI](/docs/infrastructure/vpc/hello-world-vpc.html)
- [VPC using the REST APIs](/docs/infrastructure/vpc/example-code.html)
- bastion tutorial



# SAVED

### Create the VPC Virtual Private Network gateway

When the local and remote VPNs connect to each other they will set up a security association using
[IKE](https://en.wikipedia.org/wiki/Internet_Key_Exchange) based on a pre-shared key and then securely communicate using the
[IPsec](https://en.wikipedia.org/wiki/IPsec) protocol.

A VPN gateway working with a local router will forward packets to the remote VPN gateway peer.
The router will be initialized with the CIDR range of the remote network and route packets that match the CIDR to the local VPN gateway.
The local VPN gateway will receive the packets that match the remote CIDR range and forward them to the remote VPN gateway over the IPsec encrypted connection.
The local VPN gateway will receive the packets from the remote VPN gateway that match the local CIDR range and forward them to the local network.

The end result will be an integration of your IBM cloud network of devices and services with your on-premises network fabric.

Each VPN will be configured with the following information:
- Shared secret key - a string of characters, like a password, that must be the same on both VPNs
- IP address of the remote VPN
- CIDR block of the local network that is accessible by the remote network
- CIDR block of the remote network that is accessible by the local network

In addition there will be a collection of IKE and IPsec configuration parameters that the VPNs must agree.