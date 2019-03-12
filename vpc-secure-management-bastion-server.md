---
copyright:
  years: 2019
lastupdated: "2019-03-12"

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

# Secure management of VSIs using Bastion server
{: #secure-management-vsi-bastion-server}

This tutorial walks you through on how a bastion VSI is deployed to securely access the other VSIs by SSH. Bastion servers or hosts are instances that sit within your public subnet and are typically accessed using SSH. Once remote connectivity has been established with the bastion host, it then acts as a **jump** server, allowing you to use SSH to log in to other instances (within private subnets) deeper within your VPC.

To reduce exposure of servers within the VPC you will create and use a bastion instance. Administrative tasks on the individual servers are going to be performed using SSH, proxied through the bastion. Access to the servers and regular internet access from the servers, e.g., for software installation, will only be allowed with a special maintenance security group attached to those servers.
{:shortdesc}

## Objectives
{: #objectives}

* Understand the infrastructure objects available for virtual private clouds
* Learn how to setup a bastion instance and security groups with rules
* Securely manage servers via the bastion instance

## Services used
{: #services}

This tutorial uses the following runtimes and services:  

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)  
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![Architecture](images/solution47-vpc-secure-management-bastion-server/ArchitectureDiagram.png)

1. After setting up the required infrastructure (subnets, security groups with rules, VSIs) on the cloud, the admin (DevOps) connects (SSH) to the bastion server using the private SSH key.
2. The admin assigns a maintenance security group with proper outbound rules.
3. The admin connects(SSH) securely to the instance's private IP address via bastion server to install or update any required software eg., a web server
4. The internet user makes an HTTP/HTTPS request to the web server.

## Before you begin
{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc?topic=vpc-managing-user-permissions-for-vpc-resources#managing-user-permissions-for-vpc-resources).

- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc?topic=vpc-getting-started-with-ibm-cloud-virtual-private-cloud-infrastructure#prerequisites).

## Create a Virtual Private Cloud
{: #create-vpc}

To create your own {{site.data.keyword.vpc_short}},

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
2. Under **New virtual private cloud** section:  
   * Enter **vpc-secure** as name for your VPC.  
   * Select a **Resource group**.  
   * Optionally, add **Tags** to organize your resources.  
3. Select **Create new default (Allow all)** as your VPC default access control list (ACL).
1. Uncheck SSH and ping from the **Default security group**.
4. Under **New subnet for VPC**:  
   * As a unique name enter **vpc-secure-bastion-subnet**.  
   * Select a location.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
5. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
6. Switch the public gateway to **Attached** because attaching a public gateway will allow all attached resources to communicate with the public internet. You can also attach the public gateway after you create the subnet.
7. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click on **All virtual private clouds** breadcrumb, then select **Subnets** tab and wait until the status changes to **Available**. You can create a new subnet under the **Subnets** tab.

## Create a bastion security group
{: #bastion-security-group}

Let's create a security group and configure inbound rules to your bastion VSI.

1. Navigate to **Security groups** and click **New security group**. Enter **vpc-secure-bastion-sg** as name and select your VPC. 
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

1. Under **VPC and subnets** select the **Subnets** tab, then select **vpc-secure-bastion-subnet**.
2. Click on **Attached instances** and provision a **New instance** called **vpc-secure-vsi** under your own VPC. Select Ubuntu Linux as your image and **c-2x4** (2 vCPUs and 4 GB RAM) as your profile.
3. Select a **Location** and make sure to later use the same location again.
4. To create a new **SSH key**, click **New key**
   * Enter **vpc-ssh-key** as key name.
   * Leave the **Region** as is.
   * Copy the contents of your existing local SSH key and paste it under **Public key**.  
   * Click **Add SSH key**.
5. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups 
   * Make sure that **vpc-secure-subnet** is selected as the subnet.
   * Uncheck the default security group and mark **vpc-secure-bastion-sg**.
   * Click **Save**.
6. Click **Create virtual server instance**.
7. Once the instance is powered on, click on **vpc-secure-bastion-vsi** and **reserve** a floating IP.

### Test your bastion

Once your bastion's floating IP address is active, try connecting to it using **ssh**:

   ```sh
   ssh -i ~/.ssh/<PRIVATE_KEY> root@<BASTION_FLOATING_IP_ADDRESS>
   ```
   {:pre}


### Create a security group for system maintenance

With access to the bastion working, continue and create the security group for maintenance tasks like installing and updating the software.

1. Navigate to **Security groups** and provision a new security group called **vpc-secure-maintenance-sg** with the below outbound rules

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
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-secure-bastion-sg</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	   </tbody>
	</table>

3. Create the security group.
4. Navigate to **All Security Groups for VPC**, then select **vpc-secure-sg**.
5. Finally, edit the security group and add the following **outbound** rule.

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
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-secure-maintenance-sg</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	   </tbody>
	</table>

## Create a private subnet, security group and VSI
{: #frontend-subnet-vsi}

In this section, you will create a private subnet with virtual server instance and a security group. By default, any subnet created in a VPC is private.

### Create a private subnet

To create a new private subnet,

1. Click **VPC and subnets** under **Network** on the left pane
2. Click **Subnets**, then **New subnet**.  
   * Enter **vpc-secure-private-subnet** as name, then select the VPC you created.  
   * Select a location.  
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.240.1.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
3. Select **VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
4. Switch the **Public gateway** to **Attached**. 
5. Click **Create subnet** to provision it.

### Create a private security group

To create a new security group:  
1. Click **Security groups** under Network, then **New security group**.  
2. Enter **vpc-secure-private-sg** as name and select the VPC you created earlier.   
3. Click **Create security group**.  

### Create a private virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the private subnet under **Subnets**.
2. Click **Attached instances**, then **New instance**.
3. Enter a unique name, **vpc-secure-private-vsi**, select the VPC your created earlier, then the same **Location** as before.
4. Select **Ubuntu Linux** image, click **All profiles** and, under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM
5. For **SSH keys** pick the SSH key you created earlier for the bastion.
6. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups   
   * Select **vpc-secure-private-subnet** as the subnet.  
   * Uncheck the default security and group and activate **vpc-secure-private-sg**.  
   * Click **Save**.  
7. Click **Create virtual server instance**.  

## Maintenance of private VSI
{: #maintenance-frontend-backend}

For administrative work on the private servers, you have to associate the specific VSI with the maintenance security group. In the following, you will enable maintenance, log into the private server, update the software package information, then disassociate the security group again.

### Enable the maintenance security group
Let's enable the maintenance security group for the frontend and backend server.

1. Navigate to **Security groups** and select **vpc-secure-maintenance-sg** security group.  
2. Click **Attached interfaces**, then **Edit interfaces**.  
3. Expand **vpc-secure-private-vsi** and activate the selection next to **primary** in the **Interfaces** column.
4. Click **Save** for the changes to be applied.

To disable the maintenance security group follow the steps above, but uncheck **primary**. The maintenance security group should not be active during regular server operations for security purposes.

### Connect to the private server

To SSH into the private instance using its **private IP**, you will use the bastion instance as your **Jump host**.

1. For the private IP address, navigate to **Virtual server instances**, then click on **vpc-secure-private-vsi**.
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
2. Install the desired software, e.g., Nginx or MySQL or IBM Db2.

When done, disconnect from the server. Thereafter, follow the instructions in the earlier section to disassociate the maintenance security group from the VSI.

To allow HTTP/HTTPS requests from the internet user, assign a **floating IP** to the VSI in the private subnet and open required ports via the inbound rules in the security group of private VSI.
{:tip}

## Remove resources
{: #removeresources}

1. Switch to **Virtual server instances** and **Delete** your instances. The instances will be deleted and their status will remain in **Deleting** for a while. Make sure to refresh the browser from time to time.
2. Once the VSI is gone, switch to **VPC and subnets** and there to the **Subnets** tab. Delete your subnet.
4. After the subnet has been deleted, switch to the **Virtual private clouds** tab and delete your VPC.

When using the console, you may need to refresh your browser to see updated status information after deleting a resource.
{:tip}


## Expand the tutorial 

Want to add to or change this tutorial? Here are some ideas:

- Add a public subnet with frontend server on public subnet and backend on private subnet

## Related content
{: #related}

* [Relevant links](https://blah)
