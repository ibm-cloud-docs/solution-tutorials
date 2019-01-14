---
copyright:
  years: 2019
lastupdated: "2019-01-15"


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

This tutorial walks you through creating your own {{site.data.keyword.vpc_full}} (VPC) with a public and a private subnet and a virtual server instance in each subnet. The public subnet is used for resources that must be exposed to the outside world. Resources with restricted access that should never be directly accessed from the outside world are placed within the private subnet. Instances on such a subnet could be your backend database or some secret store that you do not want to be publicly accessible. You will also define Access Control Lists (ACLs) with inbound and outbound rules for subnet isolation.

A VPC is your own, private cloud on shared cloud infrastructure with a logical isolation from other virtual networks.

A [subnet](https://{DomainName}/docs/infrastructure/vpc/vpc-glossary.html#subnet) is an IP address range. It is bound to a single zone and cannot span multiple zones or regions. For the purposes of VPC, the important characteristic for a subnet is the fact that subnets can be isolated from one another, as well as being interconnected in the usual way. Subnet isolation can be accomplished by Network [Access Control Lists](https://{DomainName}/docs/infrastructure/vpc/vpc-glossary.html#access-control-list) (ACLs) that act as firewalls to control the flow of data packets among subnets. Similarly, security groups act as virtual firewalls to control the flow of data packets to and from individual virtual server instances (VSIs).
{:shortdesc}

- software defined network
- isolate workloads
- fine control of inbound/outbound traffic

## Objectives

{: #objectives}

- Define a 3-tier architecture
- Create a public subnet for frontend servers
- Create a private subnet for backend servers
- Create a virtual server instance in each subnet
- Configure network rules through access control lists (ACL)
- **TODO:** Define a security group
- **TODO:** Load Balancers and VPN

## Services used

{: #services}

This tutorial uses the following runtimes and services:

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

![Architecture](images/solution40-vpc-public-app-private-backend/Architecture.png)

**TODO**
1. The user accesses an app within a VPC.
2. Configures individual access control list (ACLs) to limit the subnet's inbound and outbound traffic. By default, all traffic is allowed.
3. Creates respective virtual server instances (VSIs).
4. Configures a security group to define the inbound and outbound traffic that's allowed for the instance.
5. Reserves and associates a floating IP address to enable your instance to communicate with the internet.
6. Creates a virtual private network (VPN) so your VPC can connect securely to another private network, such as your on-premises network or another VPC.

## Before you begin

{: #prereqs}

Check for user permissions. Be sure that your user has sufficient permissions to create and manage resources in your VPC. For a list of required permissions, see [Granting permissions needed for VPC users](https://{DomainName}/docs/infrastructure/vpc/vpc-user-permissions.html).

## Create SSH key
{: #create_ssh_key}

Check for an existing SSH key if there's none, create a new SSH key.

1. Open a Terminal and run this command to check if there are any existing SSH key

   ```sh
   ls -al ~/.ssh
   ```
   Look for a file called `id_rsa.pub`.
2. Alternatively, You can check under an `.ssh` directory under your home directory, for example, `/Users/<USERNAME>/.ssh/id_rsa.pub`. The file starts with `ssh-rsa` and ends with your email address
3. If you do not have a public SSH key or if you forgot the password of an existing one, generate a new one by running the `ssh-keygen` command and following the prompts. For example, you can generate an SSH key on your Linux server by running the command

     ```sh
       ssh-keygen -t rsa -C "user_ID"
     ```

     You can find your `user_ID` under your [user preferences](https://{DomainName}/user). This command generates two files. The generated public key is in the `<your key>.pub` file.


## Create a Virtual Private Cloud
{: #create_vpc}

To create your own {{site.data.keyword.vpc_short}},

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
2. Under **New virtual private cloud** section,  
   a. Enter a unique name as `vpc-pubpriv` for your VPC.  
   b. Select a **Resource group**.  
   c. Optionally, add **Tags** to organize your resources.  
3. Select **Create new default (Allow all)** as your VPC default access control list (ACL). Leave the settings for **Default security group** as is.
4. Under **New subnet for VPC**,  
   a. Enter a unique name as `vpc-pubpriv-backend-subnet`.  
   b. Select a Location.  
   c. Enter an IP range for the subnet in CIDR notation, say  `10.240.0.0/24`.   Leave the **Address prefix** as it is and select the **Number of addresses** as 256
5. Select **Use VPC default** for your subnet access control list(ACL). You can configure the Inbound and outbound rules later.
6. Switch the Public gateway to **Attached** as attaching a public gateway will allow all attached resources to communicate with the public Internet. You can also attach the public gateway after you create the subnet.
7. Click **Create virtual private cloud** to provision the instance.

To confirm creation of subnet, click on **Subnets** and wait until the Status changes to **Available**. You can create a new subnet under the **Subnets** tab.

## Backend
{: #backend}

In this section, you will create a backend subnet with virtual server instance and define the rules for network access.

### Create a subnet for the backend

You will be using the Subnet created with the VPC as the subnet for the backend.

### Create a backend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the backend subnet under **Subnets**.
2. Click **Attached instances** > New instance
3. Enter a unique name as `vpc-pubpriv-backend-vsi` > Select the VPC your created earlier and select **Dallas** as your Location
4. Select **Ubuntu Linux** image > Click **All profiles** and under Balanced, choose b-2x8 with 2vCPUs and 8 GM RAM
5. To create a new SSH key, Click **New key**  
   a. Enter a key name.  
   b. Select **Dallas** region.  
   c. Copy the contents of  `<your key>.pub` and paste under Public key.  
   d. Click **Add SSH key**.
6. Leave the other options as it is and click **Create virtual server instance**.

Wait for the status to change to **Powered On**.

??? how to connect to the vm to install software? can I vpn with the softlayer vpn? or do I need to setup a vpn for the VPC? and if so, show the VPN on the architecture diagram

## Frontend
{: #frontend}

In this section, you will create a frontend subnet with virtual server instance and define the rules for network access.

### Create a subnet for the frontend

To create a new subnet for the frontend,

1. Click **VPC and subnets** under Network on the left pane
2. Click **Subnets **> New subnet  
   a. Enter a unique name as `vpc-pubpriv-frontend-subnet` and select the VPC you created.  
   b. Select a Location.  
   c. Enter an IP range for the subnet in CIDR notation, say  `10.240.1.0/24`. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
3. Select **VPC default** for your subnet access control list(ACL). You can configure the Inbound and outbound rules later.
4. Switch the Public gateway to **Attached** as attaching a public gateway will allow all attached resources to communicate with the public Internet. You can also attach the public gateway after you create the subnet.
5. Click **Create subnet** to provision.

### Create a frontend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the frontend subnet under **Subnets**.
2. Click **Attached instances** > New instance
3. Enter a unique name as `vpc-pubpriv-frontend-vsi` > Select the VPC your created earlier and select **Dallas** as your Location
4. Select **Ubuntu Linux** image > Click **All profiles** and under Balanced, choose b-2x8 with 2vCPUs and 8 GM RAM
5. Select the SSH key you created earlier.
6. Leave the other options as it is and click **Create virtual server instance**.

Wait for the status to change to **Powered On**. Configure network rules for the backend subnet.

## Create and configure ACLs
{: #create_configure_acls}

You can configure ACLs to limit inbound and outbound traffic to the subnet. By default, all traffic is allowed. Each subnet can be attached to only one ACL. However, an ACL can be attached to multiple subnets.

### Configure network rules for the backend subnet

To create a new ACL,
1. Click **Access control lists** under Network > New access control list
2. Enter a name as `vpc-pubpriv-backend-acl` and select **Dallas** region.
3. Define these **Inbound** rules

   <table><thead>
   <tr><td><strong>Allow/Deny</strong></td><td><strong>Source</strong></td><td><strong>Protocol</strong></td><td><strong>Value</strong></td></tr>
   <tbody><tr>
   <td>Allow</td><td>IP address or CIDR - **IP range of Frontend**  say 10.240.1.0/24</td><td>TCP</td><td>1433</td>
   </tr>
   <tr><td>Deny</td><td>Any</td><td>ALL</td><td></td></tr></tbody>
   </table>
4. Define these **Outbound rules**

   <table><thead>
   <tr><td><strong>Allow/Deny</strong></td><td><strong>Destination</strong></td><td><strong>Protocol</strong></td><td><strong>Value</strong> </td></tr>
   </thead>
   <tbody>
   <tr><td>Allow</td><td>Any</td><td>TCP</td><td>From: **80** To **80**</td></tr>

   <tr><td>Allow</td><td>Any</td><td>TCP</td><td>From: **443** To **443**</td></tr>
   <tr><td>Deny</td><td>Any</td><td>ALL</td><td></td></tr>
 
   </tbody>
   </table>
5. Under Attach subnets, select the backend subnet.
6. Click **Create access control list**.


This will override the VPC ACL and assigns an ACL with rules specific to the backend subnet.

### Configure network rules for the frontend subnet

To create an ACL for frontend,

1. Click on the [All access control lists for VPC ](https://{DomainName}/vpc/network/acl) > New access control list
2. Enter a name as `vpc-pubpriv-frontend-acl` and select **Dallas** region.
3. Define these **Inbound** rules

   <table><thead>
   <tr><td><strong>Allow/Deny</strong></td><td><strong>Source</strong></td><td><strong>Protocol</strong></td><td><strong>Value</strong></td></tr>
   </thead>
   <tbody>
     <tr><td>Allow</td><td>Any</td><td>TCP</td><td>From: **80** To **80**</td></tr>
   <tr><td>Allow</td><td>Any</td><td>TCP</td><td>From: **443** To **443**</td></tr>
   <tr><td>Deny</td><td>Any</td><td>ALL</td><td></td></tr>
   </tbody></table>
4. Define these **Outbound rules**

  <table><thead>
 <tr><td><strong>Allow/Deny</strong></td><td><strong>Destination</strong></td><td><strong>Protocol</strong></td><td><strong>Value</strong> </td></tr>
     <tr><td>Allow</td><td>Any</td><td>TCP</td><td>From: **80** To **80**</td></tr>
  <tr><td>Allow</td><td>Any</td><td>TCP</td><td>From: **443** To **443**</td></tr>
  </thead>
  <tbody>
  <tr><td>Allow</td><td>IP address or CIDR <br> **IP range of Backend**  say 10.240.0.0/24</td><td>TCP</td><td>1433</td></tr>
  <tr><td>Deny</td><td>Any</td><td>ALL</td><td></td></tr>
  </tbody></table>
5. Under Attach subnets, select the frontend subnet.
6. Click **Create access control list**.

This will override the VPC ACL and assigns an ACL with rules specific to the frontend subnet.

**TODO:** Define Security groups

### Give the frontend vm a public IP so that it can be access from the Internet

### Add a public gateway so that frontend and backend can access the Internet

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

- [Relevant links](

* https://blah)
