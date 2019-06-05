---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-05-28"
lasttested: "2019-05-28"
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

This tutorial walks you through creating your own {{site.data.keyword.vpc_full}} (VPC) with a public and a private subnet and a virtual server instance (VSI) in each subnet. A VPC is your own, private cloud on shared cloud infrastructure with logical isolation from other virtual networks.

A [subnet](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#subnet) is an IP address range. It is bound to a single zone and cannot span multiple zones or regions. For the purposes of VPC, the important characteristic of a subnet is the fact that subnets can be isolated from one another, as well as being interconnected in the usual way. Subnet isolation can be accomplished by Network [Access Control Lists](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#access-control-list) (ACLs) that act as firewalls to control the flow of data packets among subnets. Similarly, [Security Groups](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#security-group) (SGs) act as virtual firewalls to control the flow of data packets to and from individual VSIs.

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

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

![Architecture](images/solution40-vpc-public-app-private-backend/Architecture.png)


1. The admin (DevOps) sets up the required infrastructure (VPC, subnets, security groups with rules, VSIs) on the cloud.
2. The internet user makes an HTTP/HTTPS request to the web server on the frontend.
3. The frontend requests private resources from the secured backend and serves results to the user.

## Before you begin

{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/vpc-on-classic?topic=vpc-on-classic-managing-user-permissions-for-vpc-resources).

- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/vpc-on-classic?topic=vpc-on-classic-getting-started#prerequisites).

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
   * As a unique name enter **vpc-pubpriv-backend-subnet**.
   * Select a location.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.xxx.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
5. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
6. Click **Create virtual private cloud** to provision the instance.

If the VSIs attached to the private subnet need access to the Internet to load software, switch the public gateway to **Attached** because attaching a public gateway will allow all attached resources to communicate with the public internet. Once the VSIs have all software needed, return the public gateway to **Detached** so that the subnet cannot reach the public internet.
{: important}

To confirm the creation of subnet, Click **Subnets** on the left pane and wait until the status changes to **Available**. You can create a new subnet under **Subnets**.

## Create a backend security group and VSI
{: #backend-subnet-vsi}

In this section, you will create a security group and a virtual server instance for the backend.

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
2. Click **Attached resources**, then **New instance**.
3. Enter a unique name and pick **vpc-pubpriv-backend-vsi**. Then, select the VPC you created earlier and the **Location** as before.
4. Choose the **Ubuntu Linux** image, click **All profiles** and under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM.
5. For **SSH keys** pick the SSH key you created earlier.
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

1. Click **Subnets** under **Network** on the left pane > **New subnet**.
   * Enter **vpc-pubpriv-frontend-subnet** as name, then select the VPC you created.
   * Select a location.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.xxx.1.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
1. Select **VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
1. Given all virtual server instances in the subnet will have a floating IP attached, it is not required to enable a public gateway for the subnet. The virtual server instances will have Internet connectivity through their floating IP.
1. Click **Create subnet** to provision it.

### Create a frontend security group

To create a new security group for the frontend:
1. Click **Security groups** under Network, then **New security group**.
2. Enter **vpc-pubpriv-frontend-sg** as name and select the VPC you created earlier.
3. Click **Create security group**.

### Create a frontend virtual server instance

To create a virtual server instance in the newly created subnet:

1. Click on the frontend subnet under **Subnets**.
2. Click **Attached resources**, then **New instance**.
3. Enter a unique name, **vpc-pubpriv-frontend-vsi**, select the VPC your created earlier, then the same **Location** as before.
4. Select **Ubuntu Linux** image, click **All profiles** and, under **Compute**, choose **c-2x4** with 2vCPUs and 4 GB RAM
5. For **SSH keys** pick the SSH key you created earlier.
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
   </thead>
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
   </thead>
   <tbody>
      <tr>
         <td>Type: <strong>Security Group</strong> - Name: <strong>vpc-pubpriv-frontend-sg</strong></td>
         <td>TCP</td>
         <td>Port of the backend server</td>
      </tr>
   </tbody>
   </table>


## Install software and perform maintenance tasks
{: #install-software-maintenance-tasks}

Follow the steps mentioned in [securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.

## Remove resources
{: #remove-resources}

1. In the VPC management console, click on **Floating IPs**, then on the IP address for your VSIs, then in the action menu select **Release**. Confirm that you want to release the IP address.
2. Next, switch to **Virtual server instances** and **Delete** your instances. The instances will be deleted and their status will remain in **Deleting** for a while. Make sure to refresh the browser from time to time.
3. Once the VSIs are gone, switch to **Subnets**. If the subnet has an attached public gateway, then click on the subnet name. In the subnet details, detach the public gateway. Subnets without public gateway can be deleted from the overview page. Delete your subnets.
4. After the subnets have been deleted, switch to **VPC** tab and delete your VPC.

When using the console, you may need to refresh your browser to see updated status information after deleting a resource.
{:tip}

## Expand the tutorial
{: #expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- Add a [load balancer](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-ibm-cloud-console#creating-a-load-balancer) to distribute inbound traffic across multiple instances.
- Create a [virtual private network](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-ibm-cloud-console#creating-a-vpn) (VPN) so your VPC can connect securely to another private network, such as an on-premises network or another VPC.


## Related content
{: #related}

- [VPC Glossary](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#vpc-glossary)
- [VPC using the IBM Cloud CLI](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-ibm-cloud-cli)
- [VPC using the REST APIs](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-rest-apis)
