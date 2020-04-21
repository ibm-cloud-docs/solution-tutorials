---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2019-03-07"
lasttested: "2019-04-23"
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

# Hosting web applications from a secure private network
{: #web-app-private-network}

Hosting web applications is a common deployment pattern for public cloud, where resources can be scaled on demand to meet short term and long term usage demands. Security for the application workloads is a fundamental prerequisite, to complement the resilience and scalability afforded by public cloud. 

This tutorial takes you through the creation of a scalable and secure Internet facing web application hosted in private network secured using a virtual router appliance (VRA), VLANs, NAT and firewalls. The application comprises a load balancer, two web application servers and a MySQL database server. It combines three tutorials to illustrate how web applications can be securely deployed on the {{site.data.keyword.Bluemix_notm}} IaaS platform using classic networking. 
{:shortdesc}

## Objectives
{: #objectives}

- Create Virtual Servers to install PHP and MySQL
- Provision a Load Balancer to distribute requests to the application servers
- Deploy a Virtual Router Appliance (VRA) to create a secure network
- Define VLANs and IP subnets 
- Secure the network with firewall rules
- Source Network Address Translation (SNAT) for application deployment

## Services used
{: #products}

This tutorial uses the following runtimes and services:
* [Virtual Router Appliance VPN](https://{DomainName}/docs/infrastructure/virtual-router-appliance?topic=virtual-router-appliance-about-the-vra#virtual-private-network-vpn-gateway)
* [Load Balancer]( https://{DomainName}/catalog/infrastructure/load-balancer-group)
* [{{site.data.keyword.virtualmachinesshort}}]( https://{DomainName}/catalog/infrastructure/virtual-server-group)

This tutorial may incur costs. The VRA is only available on a monthly pricing plan.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution42-web-app-private-network/web-app-private.png)
</p>

1.	Configure Secure Private Network
2.	Configure NAT access for application deployment
3.	Deploy scalable web app and load balancer

## Before you begin
{: #prereqs}

This tutorial utilises three existing tutorials, which are deployed in sequence. All three should be reviewed before commencing:

-	[Isolate workloads with a secure private network]( https://{DomainName}/docs/tutorials?topic=solution-tutorials-secure-network-enclosure#isolate-workloads-with-a-secure-private-network) 
-	[Configure NAT for Internet access from a secure network]( https://{DomainName}/docs/tutorials?topic=solution-tutorials-nat-config-private#configure-firewall-rules-for-internet-access-from-a-private-network)
-	[Use Virtual Servers to build highly available and scalable web app]( https://{DomainName}/docs/tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#use-virtual-servers-to-build-highly-available-and-scalable-web-app)



## Configure secure private network
{: #private_network}

Isolated and secure private network environments are central to the IaaS application security model on public cloud. Firewalls, VLANs, routing, and VPNs are all necessary components in the creation of isolated private environments. 
The first step is to create the secure private network enclosure within which the web app will be deployed.  

- [Isolate workloads with a secure private network](https://{DomainName}/docs/tutorials?topic=solution-tutorials-secure-network-enclosure#isolate-workloads-with-a-secure-private-network)

This tutorial can be followed without change. In a later step three virtual machines will be deployed in the APP zone as Nginx web servers and a MySQL database. 

## Configure NAT for secure application deployment
{: #nat_config}

Installation of open-source applications requires secure access to the Internet to access the source repositories. To protect the servers in the secure private network from being exposed on the public Internet, Source NAT is used where the source address is obfuscated and firewall rules are used to secure the out-bound application repository requests. All inbound requests are denied. 

- [Configure NAT for Internet access from a secure network]( https://{DomainName}/docs/tutorials?topic=solution-tutorials-nat-config-private#configure-firewall-rules-for-internet-access-from-a-private-network)

This tutorial can be followed without change. In the next step the NAT configuration will be used to access the required Nginx and MySQL modules.  


## Deploy scalable web app and load balancer
{: #scalable_app}

A Wordpress installation on Nginx and MySQL, with an Load Balancer is used to illustrate how a scalable and resilient web application can be deployed in the secure private network 

This tutorial walks you through this scenario with the creation of a {{site.data.keyword.Bluemix_notm}} load balancer, two web application servers and one MySQL database server. The servers are deployed into the APP zone in the secure private network to provide firewall separation from other workloads and the public network. 

- [Use Virtual Servers to build highly available and scalable web app]( https://{DomainName}/docs/tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#use-virtual-servers-to-build-highly-available-and-scalable-web-app)

There are three changes from this tutorial:

1.	The virtual servers used in this tutorial are deployed onto the VLAN and subnet protected by the APP firewall zone behind the VRA.
2. Specify the &lt;Private VLAN ID&gt; when ordering the virtual servers. See the [Order the first virtual server](https://{DomainName}/docs/tutorials?topic=solution-tutorials-secure-network-enclosure#order_virtualserver) instructions in the [Isolate workloads with a secure private network]( https://{DomainName}/docs/tutorials?topic=solution-tutorials-secure-network-enclosure#isolate-workloads-with-a-secure-private-network) tutorial for details of how to specify the &lt;Private VLAN ID&gt; when ordering a virtual server. Also remember to select your SSH key uploaded earlier in the tutorial to allow access to the virtual servers. 
3. It is strongly recommended **NOT** to use the file storage service for this tutorial due to poor rsync performance copying the Wordpress files to shared storage. This does not affect the overall tutorial. The steps relating to creating the file storage and setting up mounts can be ignored for the app servers and db. Alternatively all the [Install and configure the PHP application on the application servers](https://{DomainName}/docs/tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#php_application) steps need to be performed on both app servers.
   Prior to completing the steps in [Install and configure the PHP application on the application servers](https://{DomainName}/docs/tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#php_application), first create the directory `/mnt/www/` on both app servers. This directory was original created in the now removed file storage section. 

   ```sh
   mkdir /mnt/www
   ```

At the end of this step the load balancer should be in a healthy state and the Wordpress site accessible on the internet. The virtual servers making up the web application are protected from external access via the internet by the VRA firewall and the only access is via the load balancer. For a production environment DDoS protection and Web Application Firewall (WAF) should also be consider as provided by [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services).


## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial. 

The VRA is on a monthly paid plan. Cancellation does not result in a refund. It is suggested to only cancel if this VRA will not be required again in the next month. 
{:tip}  

1. Cancel any virtual servers or bare-metal servers
2. Cancel the VRA
3. Cancel any additional VLANs by support ticket.
4. Delete the Load Balancer
5. Delete the File Storage services

## Expand the tutorial 

1. In this tutorial only two virtual servers are initially provisioned as the app tier, more servers could be added automatically to handle additional load. [Auto Scale]( https://{DomainName}/docs/vsi?topic=virtual-servers-about-auto-scale) provides you with the ability to automate the manual scaling process associated with adding or removing virtual servers to support your business applications.

2. Separately protect user data by adding a second private VLAN and IP subnet to the VRA to create a DATA zone for hosting the MySQL database server. Configure firewall rules to only allow only MySQL IP traffic on port 3306 inbound from the APP zone to the DATA zone. 

