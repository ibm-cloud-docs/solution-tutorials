---
copyright:
  years: 2018
lastupdated: "2019-03-01"
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
{:important: .important}

# VPC with globally available deployment
{: #vpc-globally-available}

IBM will be accepting a limited number of customers to participate in an Early Access program to VPC starting in early April, 2019 with expanded usage being opened in the following months. If your organization would like to gain access to IBM Virtual Private Cloud, please complete this [nomination form](https://{DomainName}/vpc){: new_window} and an IBM representative will be in contact with you regarding next steps.
{: important}

This tutorial walks you through on how you can isolate workloads by provisioning VPCs in different IBM Cloud regions with subnets and virtual server instances(VSIs) created in multiple zones of a region and how you can increase resiliency within a region and globally by provisioning and configuring load balancers with back-end pools, front-end listeners and proper health checks. 

For global load balancer, you will provision an IBM Cloud internet services (CIS) from the catalog and for managing the SSL certificate for all HTTPS requests, {{site.data.keyword.cloudcerts_long_notm}} catalog service will be created and the certification along with the private key will be imported.

{:shortdesc}

## Objectives
{: #objectives}

* Understand the isolation of workloads through infrastructure objects available for virtual private clouds
* Use a load balancer between zones in a region
* Use a global load balancer between regions

## Services used
{: #services}

This tutorial uses the following runtimes and services:

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.loadbalancer_full}}](https://{DomainName}/vpc/provision/loadBalancer)
- IBM Cloud [Internet Services](https://{DomainName}/catalog/services/internet-services)
- [{{site.data.keyword.cloudcerts_long_notm}}](https://{DomainName}/catalog/services/cloudcerts)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![Architecture](images/solution41-vpc-globally-available/Architecture.png)

1. The admin (DevOps) provisions VSIs in subnets under two different zones in a VPC in region 1 and repeats the same in a VPC created in region 2.
2. The admin creates a load balancer with a backend pool of servers of subnets in different zones of region 1 and a frontend listener. Repeats the same in region 2.
3. The admin provisions cloud internet services service with an associated custom domain and creates a global load balancer pointing to the load balancers created in two different VPCs.
4. The admin enables HTTPS encryption by adding the domain SSL certificate to the Certificate manager service.
5. The internet user makes an HTTP/HTTPS request and the global load balancer handles the request.
6. The request is routed to the load balancers both global and local. The request is then fullfiled by the available server instance.

## Before you begin
{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc/vpc-user-permissions.html).

- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc/getting-started.html#prerequisites).

## Create VPCs, subnets and VSIs
{: #create-infrastructure}

In this section, you will create your own VPC in Dallas region with subnets created in two different zones (Dallas 1 and 2) followed by provisioning of VSIs.

To create your own {{site.data.keyword.vpc_short}} in region 1,

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
2. Under **New virtual private cloud** section:  
   * Enter **vpc-dallas** as name for your VPC.  
   * Select a **Resource group**.  
   * Optionally, add **Tags** to organize your resources.  
3. Select **Create new default (Allow all)** as your VPC default access control list (ACL).
4. Uncheck SSH and ping from the **Default security group** and leave **classic access** unchecked.
5. Under **New subnet for VPC**:  
   * As a unique name enter **vpc-dallas1-subnet**.  
   * Select **Dallas** as your location and **Dallas 1** as your zone .
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
6. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
7. Switch the public gateway to **Attached** because attaching a public gateway will allow all attached resources to communicate with the public internet. You can also attach the public gateway after you create the subnet.
8. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click on **All virtual private clouds** breadcrumb, then select **Subnets** tab and wait until the status changes to **Available**. You can create a new subnet under the **Subnets** tab.

### Create subnet in zone 2

1. Click on **New Subnet**, enter **vpc-dallas2-subnet** as a unique name for your subnet and select **vpc-dallas** as the VPC.
2. Select **Dallas** as your location and **Dallas 2** as your zone.
3. Enter the IP range for the subnet in CIDR notation, i.e., **10.240.64.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
4. Select **Use VPC default** for your subnet access control list (ACL). 
5. Switch the public gateway to **Attached** and click **Create subnet** to provision a new subnet.

### Provision VSIs
Once the status of the subnets change to **Available**, 

1. Click on the vpc-dallas1-subnet subnet and click **Attached instances**, then **New instance**.
2. Enter a unique name and pick **vpc-dallas1-vsi**. Then, select the VPC your created earlier and the **Location** as before.
3. Choose the **Ubuntu Linux** image, click **All profiles** and under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM.
4. For **SSH keys** pick the SSH key you created initially.
5. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups  
   * Select **vpc-dallas1-subnet** as the subnet.   
   * Click **Save**.
   * Click **Create virtual server instance**.
6.  Wait until the status of the VSI changes to **Powered On**. Then, select the VSI **vpc-dallas1-vsi**, scroll to **Network Interfaces** and click **Reserve** under **Floating IP** to associate a public IP address to your VSI. Save the associated IP Address to a clipboard for future reference.
7. REPEAT the steps 1-6 to provision a VSI in dallas 2.

Navigate to **VPC and Subnets** and **REPEAT** the above steps for provisioning a new VPC with subnets and VSIs in **Frankfurt** region by replacing **dallas** with **frankfurt** in the names.

## Install and configure a web server on the VSI

**TODO**: Point to the bastion server tutorial once drafted.

Once you successfully SSH into the server provisioned in subnet of Dallas 1 zone, 

1. At the prompt, run the below commands to install Nginx as your web server

	```
	sudo apt-get update
	sudo apt-get install nginx
	```
	{:pre}
2. Check the status of the Nginx service with the following command:
    
    ```
    sudo systemctl status nginx
    ```
    {:pre}
    
    The output should show you that the Nginx service is **active** and running.
3. You’ll need to open **HTTP (80)** and **HTTPS (443)** ports to receive traffic(requests). You can do that by adjusting the Firewall via [UFW](https://help.ubuntu.com/community/UFW) - `sudo ufw enable` and by enabling the ‘Nginx Full’ profile which includes rules for both ports:

    ```
    sudo ufw allow 'Nginx Full'
    ```
    {:pre}
4. To verify that Nginx works as expected open `http://FLOATING_IP` in your browser of choice, and you should see the default Nginx welcome page.
5. To update the html page with the region and zone details, run the below command

 	```
 	nano /var/www/html/index.nginx-debian.html
 	```
 	{:pre}
 	
 	Append the region and zone (server running in **Dallas 1**) to the `h1` tag quoting `Welcome to nginx!` and save the changes.
6. Restart the nginx server to reflect the changes

   ```
	sudo systemctl restart nginx
   ```
    {:pre}

**REPEAT** the steps 1-6 to install and configure the webserver on the VSIs in subnets of all the zones and don't forget to update the html with respective zone information.

## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{: #related}

* [Relevant links](https://blah)
