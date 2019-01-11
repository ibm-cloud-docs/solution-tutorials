---
copyright:
  years: 2018
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

# Private and Public Subnets with VPC

This tutorial walks you through creating your own virtual private cloud (VPC) with a public subnet for resources that must be exposed to the outside world and a private subnet for resources that should never be directly accessed from the outside world. Instances on such a subnet could be your backend database or some secret store that you do not want to be publicly available. You will also define Access Control Lists with Inbound and Outbound rules for subnet Isolation.

A Virtual Private Cloud (VPC) is a virtual network that is tied to your customer account. It offers you a cost-effective entry point that provides cloud security and the ability to scale dynamically with growth. It gives you fine-grained control over your virtual infrastructure and your network traffic segmentation.

A subnet is an IP address range, bound to a single Zone, which cannot span multiple Zones or Regions. A subnet can span the entirety of the Zone in the IBM Cloud VPC. For the purposes of IBM Cloud VPC, the important characteristic for a **subnet** is the fact that subnets can be isolated from one another, as well as being interconnected in the usual way. Subnet isolation can be accomplished by Network Access Control Lists (ACLs) that act as firewalls to control the flow of data packets among subnets. Similarly, security groups act as virtual firewalls to control the flow of data packets to and from individual virtual server instances (VSIs).
{:shortdesc}

- software defined network
- isolate workloads
- fine control of inbound/outbound traffic

## Objectives

{: #objectives}

- Define a 3-tier architecture
- Create a public subnet for frontend web servers
- Create a private subnet for backend database servers
- Create virtual server instances (Web and database)
- Configure network rules through access control lists (ACL)
- **TODO:** Define a security group
- **TODO:** Load Balancers and VPN

## Services used

{: #services}

This tutorial uses the following runtimes and services:

- [Virtual Private Cloud](https://cloud.ibm.com/vpc/provision/vpc)
- [Virtual Server for VPC](https://cloud.ibm.com/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution40-vpc-public-app-private-backend/Architecture.png)
</p>

1. The user creates a VPC and subnets (Public and Private) to define the network.
2. Configures individual access control list (ACLs) to limit the subnet's inbound and outbound traffic. By default, all traffic is allowed.
3. Creates respective virtual server instances(VSIs).
4. Configures a security group to define the inbound and outbound traffic that's allowed for the instance.
5. Reserves and associates a floating IP address to enable your instance to communicate with the internet.
6. Creates a virtual private network (VPN) so your VPC can connect securely to another private network, such as your on-premises network or another VPC.

## Before you begin

{: #prereqs}

Check for User Permissions. Be sure that your user has sufficient permissions to create and manage resources in your VPC. For a list of required permissions, see [Granting permissions needed for VPC users](https://console.test.cloud.ibm.com/docs/infrastructure/vpc/vpc-user-permissions.html).

## Create SSH key

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

     You can find your `user_ID` under your [user preferences](https://cloud.ibm.com/user). This command generates two files. The generated public key is in the `<your key>.pub` file.


## Create a VPC

To create your own VPC,

1. Navigate to https://cloud.ibm.com/vpc/overview and click on **Create a VPC**.

2. Under **New virtual private cloud** section,

   a. Enter a unique name (say my-vpc) for your VPC

   b. Select a Resource group

   c. Add Tags(optional).

3. Select **Create new default (Allow all)** as your VPC default access control list (ACL). Leave the default security group selections as it is.

4. Under **New subnet for VPC**,

   a. Enter a unique name (say my-subnet-backend).

   b. Select a Location.

   c. Enter an IP range for the subnet in CIDR notation, say  `10.240.0.0/24`. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.

5. Select **Use VPC default** for your subnet access control list(ACL). You can configure the Inbound and outbound rules later.

6. Switch the Public gateway to **Attached** as attaching a public gateway will allow all attached resources to communicate with the public Internet. You can also attach the public gateway after you create the subnet.

7. Click **Create virtual private cloud** to provision the instance.

To confirm creation of subnet, click on **Subnets** and wait until the Status changes to **Available**. You can create a new subnet under the **Subnets** tab.

## Backend

### Create a subnet for the backend

You will be using the Subnet created with the VPC as the subnet for the backend.

### Create a backend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the backend subnet under **Subnets**.

2. Click **Attached instances** > New instance

3. Enter a unique name (say my-vsi-backend) > Select the VPC your created earlier and select **Dallas** as your Location

4. Select **Ubuntu Linux** image > Click **All profiles** and under Balanced, choose b-2x8 with 2vCPUs and 8 GM RAM

5. To create a new SSH key, Click **New key**

   a. Enter a key name

   b. Select **Dallas** region

   c. Copy the contents of  `<your key>.pub` and paste under Public key

   d. Click **Add SSH key**

6. Leave the other options as it is and click **Create virtual server instance**.

Wait for the status to change to **Powered On**.

??? how to connect to the vm to install software? can I vpn with the softlayer vpn? or do I need to setup a vpn for the VPC? and if so, show the VPN on the architecture diagram

## Frontend

### Create a subnet for the frontend

To create a new subnet for the frontend,

1. Click **VPC and subnets** under Network on the left pane

2. Click **Subnets **> New subnet

   a. Enter a unique name (say my-subnet-frontend) and select the VPC you created.

   b. Select a Location.

   c. Enter an IP range for the subnet in CIDR notation, say  `10.240.1.0/24`. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.

3. Select **VPC default** for your subnet access control list(ACL). You can configure the Inbound and outbound rules later.

4. Switch the Public gateway to **Attached** as attaching a public gateway will allow all attached resources to communicate with the public Internet. You can also attach the public gateway after you create the subnet.

5. Click **Create subnet** to provision.

### Create a frontend virtual server instance

1. To create a virtual server instance in the newly created subnet:

   1. Click on the frontend subnet under **Subnets**.
   2. Click **Attached instances** > New instance
   3. Enter a unique name (say my-vsi-frontend) > Select the VPC your created earlier and select **Dallas** as your Location
   4. Select **Ubuntu Linux** image > Click **All profiles** and under Balanced, choose b-2x8 with 2vCPUs and 8 GM RAM
   5. Select the SSH key you created earlier.
   6. Leave the other options as it is and click **Create virtual server instance**.

   Wait for the status to change to **Powered On**.Configure network rules for the backend subnet

### Create and configure ACLs

You can configure the ACL to limit inbound and outbound traffic to the subnet. By default, all traffic is allowed. Each subnet can be attached to only one ACL. However, an ACL can be attached to multiple subnets.

#### Configure network rules for the backend subnet

Network rules can be configured under the subnet's ACL. To create a new ACL,

1. Click **Access control lists** under Network > New access control list

2. Enter a name say my-acl-backend and select **Dallas** region.

3. Define these **Inbound** rules

   | Allow/Deny | Source                                                       | Protocol | Value |
   | ---------- | ------------------------------------------------------------ | -------- | ----- |
   | Allow      | IP address or CIDR - **IP range of Frontend**  say 10.240.1.0/24 | TCP      | 1433  |

4. Define these **Outbound rules**

   | Allow/Deny | Destination | Protocol | Value                    |
   | ---------- | ----------- | -------- | ------------------------ |
   | Allow      | Any         | TCP      | From: **443** To **443** |
   | Allow      | Any         | TCP      | From: **80** To **80**   |

5. Under Attach subnets, select the backend subnet.

6. Click **Create access control list**.

This will override the VPC ACL and creates an ACL specific to the backend subnet.

#### Configure network rules for the frontend subnet

To create an ACL for frontend,

1. Click on the [All access control lists for VPC ](https://cloud.ibm.com/vpc/network/acl) > New access control list

2. Enter a name say my-acl-frontend and select **Dallas** region.

3. Define these **Inbound** rules

   | Allow/Deny | Source | Protocol | Value                    |
   | ---------- | ------ | -------- | ------------------------ |
   | Allow      | Any    | TCP      | From: **443** To **443** |
   | Allow      | Any    | TCP      | From: **80** To **80**   |

4. Define these **Outbound rules**

   | Allow/Deny | Destination                                                  | Protocol | Value |
   | ---------- | ------------------------------------------------------------ | -------- | ----- |
   | Allow      | IP address or CIDR - **IP range of Backend**  say 10.240.0.0/24 | TCP      | 1433  |

5. Under Attach subnets, select the frontend subnet.

6. Click **Create access control list**.

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
