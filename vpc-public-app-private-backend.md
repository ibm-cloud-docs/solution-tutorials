---
copyright:
  years: 2019
lastupdated: "2019-03-13"
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

# Private and public subnets in a Virtual Private Cloud
{: #vpc-public-app-private-backend}

IBM will be accepting a limited number of customers to participate in an Early Access program to VPC starting in early April, 2019 with expanded usage being opened in the following months. If your organization would like to gain access to IBM Virtual Private Cloud, please complete this [nomination form](https://{DomainName}/vpc){: new_window} and an IBM representative will be in contact with you regarding next steps.
{: important}

This tutorial walks you through creating your own {{site.data.keyword.vpc_full}} (VPC) with a public and a private subnet and a virtual server instance (VSI) in each subnet. Moreover, a bastion VSI is deployed to securely access the other VSIs by SSH. A VPC is your own, private cloud on shared cloud infrastructure with logical isolation from other virtual networks.

A [subnet](/docs/infrastructure/vpc?topic=vpc-vpc-glossary#subnet) is an IP address range. It is bound to a single zone and cannot span multiple zones or regions. For the purposes of VPC, the important characteristic of a subnet is the fact that subnets can be isolated from one another, as well as being interconnected in the usual way. Subnet isolation can be accomplished by Network [Access Control Lists](/docs/infrastructure/vpc?topic=vpc-vpc-glossary#access-control-list) (ACLs) that act as firewalls to control the flow of data packets among subnets. Similarly, [Security Groups](/docs/infrastructure/vpc?topic=vpc-vpc-glossary#security-group) (SGs) act as virtual firewalls to control the flow of data packets to and from individual VSIs.

The public subnet is used for resources that must be exposed to the outside world. Resources with restricted access that should never be directly accessed from the outside world are placed within the private subnet. Instances on such a subnet could be your backend database or some secret store that you do not want to be publicly accessible. You will define SGs to allow or deny traffic to the VSIs.
{:shortdesc}

In short, using VPC you can

- create a software-defined network (SDN),
- isolate workloads,
- have fine control of inbound and outbound traffic.

## Objectives

{: #objectives}

- Understand the infrastructure objects available for virtual private clouds
- Learn how to create a virtual private cloud, subnets and server instances
- Know how to apply security groups to secure access to the servers

## Services used

{: #services}

This tutorial uses the following runtimes and services:

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

![Architecture](images/solution40-vpc-public-app-private-backend/Architecture.png)


1. After setting up the required infrastructure (subnets, security groups with rules, VSIs) on the cloud, the admin (DevOps) connects (SSH) to the bastion server using the private SSH key.
2. The admin assigns a maintenance security group with proper outbound rules and connects securely to the frontend instance's **public IP address** via bastion server to install or update any required frontend software e.g., a web server.
3. The admin assigns a maintenance security group with proper outbound rules connects securely to the backend instance's **private IP address** via bastion server to install or update any required backend software e.g., a database server
4. The internet user makes an HTTP/HTTPS request to the web server on the frontend. 
5. Frontend requests private resources from secured backend and serves results to the user.

## Before you begin

{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc?topic=vpc-managing-user-permissions-for-vpc-resources#managing-user-permissions-for-vpc-resources).

- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc?topic=vpc-getting-started-with-ibm-cloud-virtual-private-cloud-infrastructure#prerequisites).

## Create a Virtual Private Cloud
{: #create-vpc}

To create your own {{site.data.keyword.vpc_short}},

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
2. Under **New virtual private cloud** section:  
   * Enter **vpc-pubpriv** as name for your VPC.  
   * Select a **Resource group**.  
   * Optionally, add **Tags** to organize your resources.  
3. Select **Create new default (Allow all)** as your VPC default access control list (ACL).
1. Uncheck SSH and ping from the **Default security group**.
4. Under **New subnet for VPC**:  
   * As a unique name enter **vpc-pubpriv-bastion-subnet**.  
   * Select a location.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
5. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
6. Switch the public gateway to **Attached** because attaching a public gateway will allow all attached resources to communicate with the public internet. You can also attach the public gateway after you create the subnet.
7. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click on **All virtual private clouds** breadcrumb, then select **Subnets** tab and wait until the status changes to **Available**. You can create a new subnet under the **Subnets** tab.

## Create a bastion for secure management
{: #bastion-secure-management}

To reduce exposure of servers within the VPC you will create and use a bastion instance. Administrative tasks on the individual servers are going to be performed using SSH, proxied through the bastion. Access to the servers and regular internet access from the servers, e.g., for software installation, will only be allowed with a special maintenance security group attached to those servers.

### Create a bastion security group

Let's create a security group and configure inbound rules to your bastion VSI.

1. Navigate to **Security groups** and click **New security group**. Enter **vpc-pubpriv-bastion-sg** as name and select your VPC. 
2. Now, create the following inbound rules by clicking **Add rule** in the inbound section. They allow SSH access and Ping (ICMP).
 
	**Inbound rule:**
	<table>
	   <thead>
	      <tr>
	         <td><strong>Source</strong></td>
	         <td><strong>Protocol</strong></td>
	         <td><strong>Value</strong></td>
	      </tr>
	   <tbody>
	      <tr>
	         <td>Any - 0.0.0.0/0</td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
         <tr>
            <td>Any - 0.0.0.0/0</td>
	         <td>ICMP</td>
	         <td>Type: <strong>8</strong>,Code: <strong>Leave empty</strong></td>
         </tr>
	   </tbody>
	</table>

   To enhance security further, the inbound traffic could be restricted to the company network or a typical home network. You could run `curl ipecho.net/plain ; echo` to obtain your network's external IP address and use that instead.
   {:tip }

### Create a bastion instance
With the subnet and security group already in place, next, create the bastion virtual server instance.

1. Under **VPC and subnets** select the **Subnets** tab, then select **vpc-pubpriv-bastion-subnet**.
2. Click on **Attached instances** and provision a **New instance** called **vpc-pubpriv-bastion-vsi** under your own VPC. Select Ubuntu Linux as your image and **c-2x4** (2 vCPUs and 4 GB RAM) as your profile.
3. Select a **Location** and make sure to later use the same location again.
4. To create a new **SSH key**, click **New key**
   * Enter **vpc-ssh-key** as key name.
   * Leave the **Region** as is.
   * Copy the contents of your existing local SSH key and paste it under **Public key**.  
   * Click **Add SSH key**.
5. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups 
   * Make sure that **vpc-pubpriv-bastion-subnet** is selected as the subnet.
   * Uncheck the default security group and mark **vpc-pubpriv-bastion-sg**.
   * Click **Save**.
6. Click **Create virtual server instance**.
7. Once the instance is powered on, click on **vpc-pubpriv-bastion-vsi** and **reserve** a floating IP.

### Test your bastion

Once your bastion's floating IP address is active, try connecting to it using **ssh**:

   ```sh
   ssh -i ~/.ssh/<PRIVATE_KEY> root@<BASTION_FLOATING_IP_ADDRESS>
   ```
   {:pre}


### Create a security group for system maintenance

With access to the bastion working, continue and create the security group for maintenance tasks.

1. Navigate to **Security groups** and provision a new security group called **vpc-pubpriv-maintenance-sg** with the below outbound rules

   <table>
   <thead>
      <tr>
         <td><strong>Destination</strong></td>
         <td><strong>Protocol</strong></td>
         <td><strong>Value</strong> </td>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>Any - 0.0.0.0/0 </td>
         <td>TCP</td>
         <td>From: <strong>80</strong> To <strong>80</strong></td>
      </tr>
      <tr>
         <td>Any - 0.0.0.0/0</td>
         <td>TCP</td>
         <td>From: <strong>443</strong> To <strong>443</strong></td>
      </tr>
       <tr>
         <td>Any - 0.0.0.0/0 </td>
         <td>TCP</td>
         <td>From: <strong>53</strong> To <strong>53</strong></td>
      </tr>
      <tr>
         <td>Any - 0.0.0.0/0</td>
         <td>UDP</td>
         <td>From: <strong>53</strong> To <strong>53</strong></td>
      </tr>
   </tbody>
   </table>

   DNS server requests are addressed on port 53. DNS uses TCP for Zone transfer and UDP for name queries either regular (primary) or reverse. HTTP requests are n port 80 and 443.
   {:tip }

2. Next, add this **inbound** rule which allows SSH access from the bastion server.

   <table>
	   <thead>
	      <tr>
	         <td><strong>Source</strong></td>
	         <td><strong>Protocol</strong></td>
	         <td><strong>Value</strong> </td>
	      </tr>
	   </thead>
	   <tbody>
	     <tr>
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-bastion-sg</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	   </tbody>
	</table>

1. Create the security group.
3. Navigate to **All Security Groups for VPC**, then select **vpc-pubpriv-bastion-sg**.
4. Finally, edit the security group and add the following **outbound** rule.

   <table>
	   <thead>
	      <tr>
	         <td><strong>Destination</strong></td>
	         <td><strong>Protocol</strong></td>
	         <td><strong>Value</strong> </td>
	      </tr>
	   </thead>
	   <tbody>
	     <tr>
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-maintenance-sg</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	   </tbody>
	</table>


## Create a backend subnet, security group and VSI
{: #backend-subnet-vsi}

In this section, you will create a subnet, a security group and a virtual server instance for the backend.

### Create a subnet for the backend

To create a new subnet for the backend,

1. Click **VPC and subnets** under **Network** on the left pane
2. Click **Subnets**, then **New subnet**.  
   * Enter **vpc-pubpriv-backend-subnet** as name, then select the VPC you created.  
   * Select a location.  
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.1.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
3. Select **VPC default** for your subnet access control list (ACL).
4. Switch the **Public gateway** to **Attached** to allow the virtual server instances in the subnet to have access to the public internet.
5. Click **Create subnet** to provision it.


### Create a backend security group

By default, a security group is created along with your VPC allowing all SSH (TCP port 22) and Ping (ICMP type 8) traffic to the attached instances. 

To create a new security group for the backend:  
1. Click **Security groups** under **Network**, then **New security group**.  
2. Enter **vpc-pubpriv-backend-sg** as name and select the VPC you created earlier.  
3. Click **Create security group**.  

You will later edit the security group to add the inbound and outbound rules.

### Create a backend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the backend subnet under **Subnets**.
2. Click **Attached instances**, then **New instance**.
3. Enter a unique name and pick **vpc-pubpriv-backend-vsi**. Then, select the VPC your created earlier and the **Location** as before.
4. Choose the **Ubuntu Linux** image, click **All profiles** and under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM.
5. For **SSH keys** pick the SSH key you created earlier for the bastion.
6. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups  
   * Select **vpc-pubpriv-backend-subnet** as the subnet.  
   * Uncheck the default security group and check **vpc-pubpriv-backend-sg** as active.  
   * Click **Save**.  
7. Click **Create virtual server instance**.

## Create a frontend subnet, security group and VSI
{: #frontend-subnet-vsi}

Similar to the backend, you will create a frontend subnet with virtual server instance and a security group.

### Create a subnet for the frontend

To create a new subnet for the frontend,

1. Click **VPC and subnets** under **Network** on the left pane
2. Click **Subnets**, then **New subnet**.  
   * Enter **vpc-pubpriv-frontend-subnet** as name, then select the VPC you created.  
   * Select a location.  
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.2.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
3. Select **VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
4. Similar as for the backend, switch the **Public gateway** to **Attached**. 
5. Click **Create subnet** to provision it.

### Create a frontend security group

To create a new security group for the frontend:  
1. Click **Security groups** under Network, then **New security group**.  
2. Enter **vpc-pubpriv-frontend-sg** as name and select the VPC you created earlier.   
3. Click **Create security group**.  

### Create a frontend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the frontend subnet under **Subnets**.
2. Click **Attached instances**, then **New instance**.
3. Enter a unique name, **vpc-pubpriv-frontend-vsi**, select the VPC your created earlier, then the same **Location** as before.
4. Select **Ubuntu Linux** image, click **All profiles** and, under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM
5. For **SSH keys** pick the SSH key you created earlier for the bastion.
6. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups   
   * Select **vpc-pubpriv-frontend-subnet** as the subnet.  
   * Uncheck the default security and group and activate **vpc-pubpriv-frontend-sg**.  
   * Click **Save**.  
   * Click **Create virtual server instance**.  
7. Wait until the status of the VSI changes to **Powered On**. Then, select the frontend VSI **vpc-pubpriv-frontend-vsi**, scroll to **Network Interfaces** and click **Reserve** under **Floating IP** to associate a public IP address to your frontend VSI. Save the associated IP Address to a clipboard for future reference.

## Set up connectivity between frontend and backend
{: #setup-connectivity-frontend-backend}

With all servers in place, in this section you will set up the connectivity to allow regular operations between the frontend and backend servers.

### Configure the frontend security group

1. Navigate to **Security groups** in the **Network** section, then click on **vpc-pubpriv-frontend-sg**.
2. First, add the following **inbound** rules using **Add rule**. They allow incoming HTTP requests and Ping (ICMP).

	<table>
   <thead>
      <tr>
         <td><strong>Source</strong></td>
         <td><strong>Protocol</strong></td>
         <td><strong>Value</strong></td>
      </tr>
   <tbody>
      <tr>
         <td>Any - 0.0.0.0/0 </td>
         <td>TCP</td>
         <td>From: <strong>80</strong> To <strong>80</strong></td>
      </tr>
      <tr>
         <td>Any - 0.0.0.0/0</td>
         <td>TCP</td>
         <td>From: <strong>443</strong> To <strong>443</strong></td>
      </tr>
      <tr>
         <td>Any - 0.0.0.0/0</td>
	      <td>ICMP</td>
	      <td>Type: <strong>8</strong>,Code: <strong>Leave empty</strong></td>
      </tr>
   </tbody>
   </table>

3. Next, add these **outbound** rules.

   <table>
   <thead>
      <tr>
         <td><strong>Destination</strong></td>
         <td><strong>Protocol</strong></td>
         <td><strong>Value</strong></td>
      </tr>
   <tbody>
      <tr>
         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-backend-sg</strong></td>
         <td>TCP</td>
         <td>Port of the backend server, see tip</td>
      </tr>
   </tbody>
   </table>

Here are ports for typical backend services. MySQL is using port 3306, PostgreSQL port 5432. Db2 is accessed on port 50000 or 50001. Microsoft SQL Server by default uses port 1433. One of many [lists with common port is found on Wikipedia](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers).
{:tip }

### Configure the backend security group
Similar to the frontend, configure the security group for the backend.

1. Navigate to **Security groups** in the **Network** section, then click on **vpc-pubpriv-backend-sg**.
2. Add the following **inbound** rule using **Add rule**. It allows a connection to the backend service.

   <table>
   <thead>
      <tr>
         <td><strong>Source</strong></td>
         <td><strong>Protocol</strong></td>
         <td><strong>Value</strong></td>
      </tr>
   <tbody>
      <tr>
         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-frontend-sg</strong></td>
         <td>TCP</td>
         <td>Port of the backend server</td>
      </tr>
   </tbody>
   </table>

## Maintenance of frontend and backend
{: #maintenance-frontend-backend}

For administrative work on the frontend and backend servers, you have to associate the specific VSI with the maintenance security group. In the following, you will enable maintenance, log into the backend server, update the software package information, then disassociate the security group again.

### Enable the maintenance security group
Let's enable the maintenance security group for the frontend and backend server.

1. Navigate to **Security groups** and select **vpc-pubpriv-maintenance-sg** security group.  
2. Click **Attached interfaces**, then **Edit interfaces**.  
3. Expand both **vpc-pubpriv-frontend-vsi** and **vpc-pubpriv-backend-vsi**.
4. For each activate the selection next to **primary** in the **Interfaces** column.
5. Click **Save** for the changes to be applied.

To disable the maintenance security group follow the steps above, but uncheck **primary**. The maintenance security group should not be active during regular server operations for security purposes.

### Connect to the backend server

To SSH into the backend instance using its **private IP**, you will use the bastion instance as your **Jump host**.

1. For the backend's private IP address, navigate to **Virtual server instances**, then click on **vpc-pubpriv-backend-vsi**.
2. Use the ssh command with `-J` to log into the backend with the bastion **floating IP** address you used earlier and the backend **Private IP** address shown under **Network interfaces**.

   ```sh
   ssh -J root@<BASTION_FLOATING_IP_ADDRESS> root@<PRIVATE_IP_ADDRESS>
   ```
   {:pre}
   
   `-J` flag is supported in OpenSSH version 7.3+. In older versions `-J` is not available. In this case the safest and most straightforward way is to use ssh's stdio forwarding (`-W`) mode to "bounce" the connection through a bastion host. e.g., `ssh -o ProxyCommand="ssh -W %h:%p root@<BASTION_FLOATING_IP_ADDRESS" root@<PRIVATE_IP_ADDRESS>`
   {:tip }


### Install software and perform maintenance tasks

Once connected, you can install software on the backend VSI or perform maintenance tasks.

1. First, update the software package information:

   ```sh
   apt-get update
   ```
   {:pre}
2. Install the desired software, e.g., MySQL or IBM Db2.

When done, disconnect from the server. Thereafter, follow the instructions in the earlier section to disassociate the maintenance security group from the VSI.


## Remove resources
{: #remove-resources}

1. In the VPC management console, click on **Floating IPs**, then on the IP address for your VSIs, then in the action menu select **Release**. Confirm that you want to release the IP address.
2. Next, switch to **Virtual server instances** and **Delete** your instances. The instances will be deleted and their status will remain in **Deleting** for a while. Make sure to refresh the browser from time to time.
3. Once the VSIs are gone, switch to **VPC and subnets** and there to the **Subnets** tab. If the subnet has an attached public gateway, then click on the subnet name. In the subnet details, detach the public gateway. Subnets without public gateway can be deleted from the overview page. Delete your subnets.
4. After the subnets have been deleted, switch to the **Virtual private clouds** tab and delete your VPC.

When using the console, you may need to refresh your browser to see updated status information after deleting a resource.
{:tip}

## Expand the tutorial 
{: #expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- Add a [load balancer](/docs/infrastructure/vpc?topic=vpc-creating-a-vpc-using-the-ibm-cloud-console#creating-a-load-balancer) to distribute inbound traffic across multiple instances.
- Create a [virtual private network](/docs/infrastructure/vpc?topic=vpc-creating-a-vpc-using-the-ibm-cloud-console#creating-a-vpn) (VPN) so your VPC can connect securely to another private network, such as an on-premises network or another VPC.


## Related content
{: #related}

- [VPC Glossary](/docs/infrastructure/vpc?topic=vpc-vpc-glossary#vpc-glossary)
- [VPC using the IBM Cloud CLI](/docs/infrastructure/vpc?topic=vpc-creating-a-vpc-using-the-ibm-cloud-cli#creating-a-vpc-using-the-ibm-cloud-cli)
- [VPC using the REST APIs](/docs/infrastructure/vpc?topic=vpc-creating-a-vpc-using-the-rest-apis#creating-a-vpc-using-the-rest-apis)
