---
copyright:
  years: 2019
lastupdated: "2019-01-29"
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

# Private and public subnets in a Virtual Private Cloud

This tutorial walks you through creating your own {{site.data.keyword.vpc_full}} (VPC) with a public and a private subnet and a virtual server instance (VSI) in each subnet. Moreover, a bastion VSI is deployed to securely access the other VSIs by ssh. A VPC is your own, private cloud on shared cloud infrastructure with logical isolation from other virtual networks.

A [subnet](https://{DomainName}/docs/infrastructure/vpc/vpc-glossary.html#subnet) is an IP address range. It is bound to a single zone and cannot span multiple zones or regions. For the purposes of VPC, the important characteristic for a subnet is the fact that subnets can be isolated from one another, as well as being interconnected in the usual way. Subnet isolation can be accomplished by Network [Access Control Lists](https://{DomainName}/docs/infrastructure/vpc/vpc-glossary.html#access-control-list) (ACLs) that act as firewalls to control the flow of data packets among subnets. Similarly, security groups act as virtual firewalls to control the flow of data packets to and from individual VSIs.

The public subnet is used for resources that must be exposed to the outside world. Resources with restricted access that should never be directly accessed from the outside world are placed within the private subnet. Instances on such a subnet could be your backend database or some secret store that you do not want to be publicly accessible. You will define Security Groups (SGs) to allow or deny traffic to the VSIs.
{:shortdesc}

In short, using VPC you can

- create a software-defined network (SDN),
- isolate workloads,
- have fine control of inbound/outbound traffic.

## Objectives

{: #objectives}

- Create a public subnet for frontend servers
- Create a private subnet for backend servers
- Create virtual server instances in each subnet, including a bastion server
- Configure network rules through security groups
- Reserve a floating IP to allow inbound and outbound internet traffic

## Services used

{: #services}

This tutorial uses the following runtimes and services:

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

![Architecture](images/solution40-vpc-public-app-private-backend/Architecture.png)


1. After setting up the required infrastructure (subnets, security groups with rules, VSIs) on the cloud, the user assigns a security group with proper outbound rules to the instances to connect to the internet for installing or updating software.
2. Connects to the bastion server using the private SSH key.
3. Connects securely to the frontend instance's **public IP address** via bastion server to install or update any required frontend software e.g.,a web server.
4. Connects securely to the backend instance's **private IP address** via bastion server to install or update any required backend software e.g.,a database server
5. The internet user connects to web server on frontend. 
6. Frontend requests private resources from secured backend and serves results to user.

## Before you begin

{: #prereqs}

Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](https://{DomainName}/docs/infrastructure/vpc/vpc-user-permissions.html).

Moreover, you need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](https://cloud.ibm.com/docs/infrastructure/vpc/example-code.html#create-an-ssh-key).

## Create a Virtual Private Cloud
{: #create-vpc}

To create your own {{site.data.keyword.vpc_short}},

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
2. Under **New virtual private cloud** section:  
   a. Enter **vpc-pubpriv** as name for your VPC.  
   b. Select a **Resource group**.  
   c. Optionally, add **Tags** to organize your resources.  
3. Select **Create new default (Allow all)** as your VPC default access control list (ACL). Leave the settings for **Default security group** as is.
4. Under **New subnet for VPC**:  
   a. As a unique name enter **vpc-pubpriv-bastion-subnet**.  
   b. Select a location.  
   c. Enter the IP range for the subnet in CIDR notation, i.e., **10.240.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
5. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
6. Switch the public gateway to **Attached** because attaching a public gateway will allow all attached resources to communicate with the public Internet. You can also attach the public gateway after you create the subnet.
7. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click on **All virtual private clouds** breadcrumb > select **Subnets** tab and wait until the status changes to **Available**. You can create a new subnet under the **Subnets** tab.

## Create a bastion for secure management
{: #bastion-secure-management}

To reduce exposure of servers within the VPC you will create and use a bastion instance. Administrative tasks on the individual servers is going to be performed using SSH, proxied through the bastion. Access to the servers and regular Internet access from the servers, e.g., for software installation, will only be allowed with a special maintenance security group attached to those servers.

### Create a bastion security group

ACLs provide security at the subnet level and Security Groups (SGs) provide security at the server instance level. Let's create a security group and configure inbound rules to your bastion VSI.

1. Navigate to **Security groups** and click **New security group**. Enter **vpc-pubpriv-bastion-sg** as name and select your VPC. 
2. Now, create the following inbound rules by clicking **Add rule** in the inbound section.
 
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
	   </tbody>
	</table>

   To enhance security further, the inbound traffic could be restricted to the company network or a typical home network. You could run `curl ipecho.net/plain ; echo` to obtain your network's external IP address and use that instead.
   {:tip: .tip}

### Create a bastion instance
With the subnet and security group already in place, next, create the bastion virtual server instance.

1. Under **VPC and subnets** select the **Subnets** tab, then select **vpc-pubpriv-bastion-subnet**.
2. Click on **Attached instances** and provision a **New instance** called **vpc-pubpriv-bastion-vsi** under your own VPC. Select Ubuntu Linux as your image and **c-2x4** (2 vCPUs and 4 GB RAM) as your profile.
3. Select a **Location** and make sure to later use the same location again.
4. To create a new SSH key, click **New key**  
   a. Enter **vpc-ssh-key** as key name.  
   b. Leave the **Region** as is.
   c. Copy the contents of your existing local SSH key and paste it under **Public key**.  
   d. Click **Add SSH key**.
5. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups 
   a. Make sure that **vpc-pubpriv-bastion-subnet** is selected as the subnet.
   b. Uncheck the default security group and mark **vpc-pubpriv-bastion-sg**.
   c. Click **Save**.
6. Click **Create virtual server instance**.
7. Once the instance is powered on, click on **vpc-pubpriv-bastion-vsi** and **reserve** a floating IP.

### Test your bastion

Once your bastion's floating IP address is active, try connecting to it using **ssh**:

   ```sh
   ssh root@<BASTION_FLOATING_IP_ADDRESS>
   ```
   {:pre: .pre}


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
   {:tip: .tip}

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
   a. Enter **vpc-pubpriv-backend-subnet** as name, then select the VPC you created.  
   b. Select a location.  
   c. Enter the IP range for the subnet in CIDR notation, i.e., **10.240.1.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
3. Select **VPC default** for your subnet access control list (ACL).
4. Switch the **Public gateway** to **Attached** to allow the virtual server instances in the subnet to have access to the public internet.
5. Click **Create subnet** to provision it.


### Create a backend security group

By default, a security group is created along with your VPC allowing all SSH (TCP port 22) and Ping (ICMP type 8) traffic to the attached instances. To create a new security group for the backend:  
1. Click **Security groups** under **Network**, then **New security group**.  
2. Enter **vpc-pubpriv-backend-sg** as name and select the VPC you created earlier.  
3. Click **Create security group**.  

You will later edit the security group to add the inbound and outbound rules as and when required.

### Create a backend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the backend subnet under **Subnets**.
2. Click **Attached instances**, then **New instance**.
3. Enter a unique name and pick **vpc-pubpriv-backend-vsi**. Then, select the VPC your created earlier and the **Location** as before.
4. Choose the **Ubuntu Linux** image, click **All profiles** and under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM.
5. For **SSH keys** pick the ssh key you created earlier for the bastion.
6. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups 
   a. Select **vpc-pubpriv-backend-subnet** as the subnet.
   b. Uncheck the default security group and check **vpc-pubpriv-backend-sg** as active.
   c. Click **Save**.
7. Click **Create virtual server instance**.

## Create a frontend subnet, security group and VSI
{: #frontend-subnet-vsi}

Similar to the backend, you will create a frontend subnet with virtual server instance and a security group.

### Create a subnet for the frontend

To create a new subnet for the frontend,

1. Click **VPC and subnets** under **Network** on the left pane
2. Click **Subnets**, then **New subnet**.  
   a. Enter **vpc-pubpriv-frontend-subnet** as name, then select the VPC you created.  
   b. Select a location.  
   c. Enter the IP range for the subnet in CIDR notation, i.e., **10.240.2.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
3. Select **VPC default** for your subnet access control list(ACL). You can configure the inbound and outbound rules later.
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
5. For **SSH keys** pick the ssh key you created earlier for the bastion.
6. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups 
   a. Select **vpc-pubpriv-frontend-subnet** as the subnet.
   b. Uncheck the default security and group and activate **vpc-pubpriv-frontend-sg**.
   c. Click **Save**.
   d. Click **Create virtual server instance**.
7. Wait until the status of the VSI changes to **Powered On**. Then, select the frontend VSI **vpc-pubpriv-frontend-vsi**, scroll to **Network Interfaces** and click **Reserve** under **Floating IP** to associate a public IP address to your frontend VSI. Save the associated IP Address to a clipboard for future reference.

## Create a bastion host to securely connect
{: #bastion-host-to-connect-securely}

If you have observed, there's no floating IP assigned to your backend instance. So, you will need to create and configure a **bastion instance** to ping or SSH into your backend instance. 

A bastion server's sole purpose is to provide access to a private network from an external network, such as the Internet. It's a gateway between an inside network and an outside network. 

You will also use bastion instance to securely connect to your frontend instance.

#
##
### DONE UNTIL HERE
##
#



### Create a bastion instance and configure security groups
Let's create a bastion instance and a bastion security group with required inbound and outbound rules.

1. Under VPC and subnets > select **Subnets** tab > select `vpc-pubpriv-bastion-subnet`.
2. Click on **Attached instances** and provision a **new instance** called **vpc-pubpriv-bastion-vsi** under your own VPC by selecting Ubuntu Linux as your image, **c-2x4** (2 vCPUs and 4 GB RAM) as your profile, your SSH key.
3. Once the instance is powered on, click on `vpc-pubpriv-bastion-vsi` and **reserve** a floating IP.
4. Navigate to **Security groups** and provision a new security group called **vpc-pubpriv-bastion-sg** under your VPC with the below mentioned inbound and outbound rules and by selecting `vpc-pubpriv-bastion-vsi` under Edit interfaces for VPC
 
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
	         <td>Public IP address range of home network.<br>Run <strong>curl ipecho.net/plain ; echo</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	   </tbody>
	</table>
	
	**Outbound rules:**
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
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-backend-sg</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	       <tr>
	         <td>Floating IP Address of <strong>frontend</strong> VSI</td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	       <tr>
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-backend-sg</strong></td>
	         <td>ICMP</td>
	         <td>Type: <strong>8</strong>,Code: <strong>Leave empty</strong></td>
	      </tr>
	   </tbody>
	</table>
5. Edit the `vpc-pubpriv-backend-sg` security group to add the following new rules

  **Inbound rules:**
	<table>
	   <thead>
	      <tr>
	         <td><strong>Source</strong></td>
	         <td><strong>Protocol</strong></td>
	         <td><strong>Value</strong></td>
	      </tr>
	   <tbody>
	      <tr>
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-bastion-sg</strong></td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	       <tr>
	         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-bastion-sg</strong></td>
	         <td>ICMP</td>
	         <td>Type: <strong>8</strong>,Code: <strong>Leave empty</strong></td>
	      </tr>
	   </tbody>
	</table>

6. Edit the `vpc-pubpriv-frontend-sg` security group to add an inbound rule to allow the SSH only from `vpc-pubpriv-bastion-sg` and also a rule to ping the server from internet.

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
	         <td>Floating IP Address of <strong>bastion</strong> VSI</td>
	         <td>TCP</td>
	         <td>From: <strong>22</strong> To <strong>22</strong></td>
	      </tr>
	       <tr>
	         <td><strong>Any</strong> - 0.0.0.0/0</td>
	         <td>ICMP</td>
	         <td>Type: <strong>8</strong>,Code: <strong>Leave empty</strong></td>
	      </tr>
	   </tbody>
	</table>

In the next section, you will see the steps to SSH into your backend or frontend instance via bastion host.

## SSH into your backend or frontend instance via bastion
{: #ssh-backend-frontend-via-bastion}

Let's start the ssh-agent on your machine and add your private key. An ssh-agent is a program to hold private keys used for public key authentication (RSA, DSA).

1. On a machine running macOS, run the below to start the ssh-agent

	```sh
	 eval "$(ssh-agent -s)"
	```
	{:pre: .pre}
	
	Should return the `Agent pid`.
	On a Linux machine, you can install an ssh-agent from [openSSH](http://www.openssh.org/).
2. Add your SSH private key to the ssh-agent and store your passphrase in the keychain.

   ```sh
   ssh-add -K ~/.ssh/<YOUR_PRIVATE_KEY_NAME>
   ```
   {:pre: .pre}
   
   This command adds and stores the passphrase in your keychain for you when you add an ssh key to the ssh-agent.
   
3. To SSH into the frontend using `floating IP` or backend instance using `private IP`, you will use the bastion instance as your **Jump host**

   ```sh
   # ssh -J root@<BASTION_IP_ADDRESS> root@<PUBLIC_IP_ADDRESS_OR_PRIVATE_IP_ADDRESS>
   ```
   {:pre: .pre}
   
   To SSH into the bastion instance itself, run `ssh root@<BASTION_IP_ADDRESS>`

You can now install or update the softwares on your backend or frontend instance.

## Install software and run updates
{: #install-update-software}

Let's setup a new security group that allows you to install or update software when its required.

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
DNS server requests are addressed on port 53. DNS uses TCP for Zone transfer and UDP for name queries either regular (primary) or reverse.

2. Whenever you plan to **install or update** software on your instances  
   a. Navigate to **Security groups** and select **vpc-pubpriv-maintenance-sg** security group.  
   b. Click **Attached interfaces** > Edit interfaces.  
   c. Expand and select the instances you want to associate with this security group.  
   d. Click **Save**.

To install software, e.g., on the frontend VSI, SSH into the frontend instance as shown in the previous section.


1. Then, update the software package information:

   ```sh
   # apt-get update
   ```
   {:pre: .pre}
2. Install the desired software
   
3. Once the required frontend and backend softwares are installed, you can add new inbound and outbound rules to allow traffic on the required ports. For example, you can define the following **inbound** rule in your backend SG to allow requests on port 3306 for your backend database and **inbound** rules in your frontend SG to allow HTTP traffic on port 80 and HTTPS traffic on port 443 to your frontend web server.
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
   </tbody>
</table>


## Remove resources

{: #remove-resources}
To remove the resources associated with this tutorial you have two options. Either use the console and follow the steps below. Or clone the [GitHub repository vpc-tutorials](https://github.com/IBM-Cloud/vpc-tutorials) and execute:

   ```sh
   # ./vpc-pubpriv-cleanup.sh
   ```
   {:pre: .pre}

If you want to use the console, note that you may need to refresh your browser to see updated status information after deleting a resource.  
1. In the VPC management console, click on **Floating IPs**, then on the IP address for your VSIs, then in the action menu select **Release**. Confirm that you want to release the IP address.  
2. Next, switch to **Virtual server instances** and **Delete** your instances. The instances will be deleted and their status will remain in **Deleting** for a while. Make sure to refresh the browser from time to time.  
3. Once the VSIs are gone, switch to **VPC and subnets** and there to the **Subnets** tab. If the subnet has an attached public gateway, then click on the subnet name. In the subnet details, detach the public gateway. Subnets without public gateway can be deleted from the overview page. Delete your subnets.  
4. After the subnets have been deleted, switch to the **Virtual private clouds** tab and delete your VPC.  

## Expand the tutorial 
{: #expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- Add a [load balancer](https://{DomainName}/docs/infrastructure/vpc/console-tutorial.html#creating-a-load-balancer) to distribute inbound traffic across multiple instances.
- Create a [virtual private network](https://{DomainName}/docs/infrastructure/vpc/console-tutorial.html#creating-a-vpn) (VPN) so your VPC can connect securely to another private network, such as an on-premises network or another VPC.


## Related content
{: #related}

- [VPC Glossary](https://{DomainName}/docs/infrastructure/vpc/vpc-glossary.html#vpc-glossary)
- [VPC using the IBM Cloud CLI](https://{DomainName}/docs/infrastructure/vpc/hello-world-vpc.html#creating-a-vpc-using-the-ibm-cloud-cli)
- [VPC using the REST APIs](https://{DomainName}/docs/infrastructure/vpc/example-code.html#creating-a-vpc-using-the-rest-apis)
- [VPC: What's New?](https://{DomainName}/docs/infrastructure/vpc/whats-new.html)