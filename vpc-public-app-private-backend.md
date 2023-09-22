---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-09-22"
lasttested: "2023-09-12"

content-type: tutorial
services: vpc
account-plan: paid
completion-time: 2h
use-case: ApplicationModernization, Cybersecurity, VirtualPrivateCloud
---
{{site.data.keyword.attribute-definition-list}}

# Public frontend and private backend in a Virtual Private Cloud
{: #vpc-public-app-private-backend}
{: toc-content-type="tutorial"}
{: toc-services="vpc"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through creating your own {{site.data.keyword.vpc_full}} (VPC) with multiple subnets and a virtual server instance (VSI) in each subnet. A VPC is your own, private cloud on shared cloud infrastructure with logical isolation from other virtual networks.
{: shortdesc}

A subnet is an IP address range. It is bound to a single zone and cannot span multiple zones or regions. For the purposes of VPC, the important characteristic of a subnet is the fact that subnets can be isolated from one another, as well as being interconnected in the usual way. Subnet isolation can be accomplished by Security Groups that act as firewalls to control inbound and outbound traffic for one or more virtual server instances.

A good practice is to have a subnet used for resources that must be exposed to the outside world. Resources with restricted access that should never be directly accessed from the outside world are placed within a different subnet. Instances on such a subnet could be your backend database or some secret store that you do not want to be publicly accessible. You will define Security Groups to allow or deny traffic to the VSIs.

In short, using VPC you can:
- create a software-defined network (SDN),
- isolate workloads,
- have fine control of inbound and outbound traffic.

## Objectives
{: #vpc-public-app-private-backend-objectives}

- Understand the infrastructure objects available for virtual private clouds
- Learn how to create a virtual private cloud, subnets and server instances
- Know how to apply security groups to secure access to the servers


![Architecture](images/solution40-vpc-public-app-private-backend/Architecture.svg){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

1. The admin (DevOps) sets up the required infrastructure (VPC, subnets, security groups with rules, VSIs) on the cloud.
2. The internet user makes an HTTP/HTTPS request to the web server on the frontend.
3. The frontend requests private resources from the secured backend and serves results to the user.

## Before you begin
{: #vpc-public-app-private-backend-prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. See the list of [required permissions](/docs/vpc?topic=vpc-managing-user-permissions-for-vpc-resources) for VPC.
- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see [the instructions](/docs/vpc?topic=vpc-ssh-keys) for creating a key for VPC.

## Create a Virtual Private Cloud and subnets
{: #vpc-public-app-private-backend-create-vpc}
{: step}

To tighten the security of your servers, it is recommended to only allow connections to the ports required by the applications deployed on the servers. In this tutorial, the application will be a web server, thus it will only need to allow inbound connections on port 80.

To perform maintenance tasks on these servers such as installing software, performing operating system upgrades, you will go through a bastion host. A bastion host is an instance that is provisioned with a public IP address and can be accessed via SSH. Once set up, the bastion host acts as a jump server allowing a secure connection to instances provisioned in the VPC.

In this section, you will create the VPC and the bastion host.

This tutorial also comes with companion shell scripts and a Terraform template, that can be used to generate the resources that you will create using the UI below. They are available [in this Github repository](https://github.com/IBM-Cloud/vpc-tutorials/tree/master/vpc-public-app-private-backend){: external}.
{: note}

1. Navigate to the **[Virtual Private Clouds](/vpc-ext/network/vpcs){: external}** page and click on **Create**.
1. Under **New Virtual Private Cloud** section:
   1. Enter **vpc-pubpriv** as name for your VPC.
   2. Select a **Resource group**.
   3. Optionally, add **Tags** to organize your resources.
1. Uncheck **Allow SSH** and **Allow ping** from the **Default security group**.  SSH access will later be added to the maintenance security group.  The maintenance security group must be added to an instance to allow SSH access from the bastion server.  Ping access is not required for this tutorial.
1. Under **Subnets** change the name of the Zone 1 subnet.  Click the pencil icon:
   * Enter **vpc-secure-bastion-subnet** as your subnet's unique name.
   * Select the same **Resource group** as the VPC resource group.
   * Leave the defaults in the other values.
   * Click **Save**
1. Under **Subnets** change the name of the Zone 2 subnet.  Click the pencil icon:
   * Enter **vpc-pubpriv-backend-subnet** as your subnet's unique name.
   * Select the same **Resource group** as the VPC resource group.
   * Leave the defaults in the other values.
   * Click **Save**
1. Under **Subnets** change the name of the Zone 3 subnet.  Click the pencil icon:
   * Enter **vpc-pubpriv-frontend-subnet** as your subnet's unique name.
   * Select the same **Resource group** as the VPC resource group.
   * Leave the defaults in the other values.
   * Click **Save**
1. Click **Create virtual private cloud**.

To confirm the creation of the subnet, go to the [**Subnets**](/vpc-ext/network/subnets){: external} page and wait until the status changes to **Available**.

### Create and configure bastion security group
{: #vpc-public-app-private-backend-3}

Follow the steps described in [this section of the bastion tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server#vpc-secure-management-bastion-server-create-configure-security-group) to create a security group and configure inbound rules for the bastion virtual server instance.

### Create a bastion instance
{: #vpc-public-app-private-backend-4}

Follow the steps described in [this section of the bastion tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server#vpc-secure-management-bastion-server-create-bastion-instance) to create the bastion virtual server instance.

### Configure a security group with maintenance access rules
{: #vpc-public-app-private-backend-5}

Follow the steps described in [this section of the bastion tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server#vpc-secure-management-bastion-server-maintenance-security-group) to create the security group **vpc-secure-maintenance-sg**. This security group will be used when performing maintenance tasks on virtual server instances, such as installing software or updating the operating system.

## Create a backend security group and VSI
{: #vpc-public-app-private-backend-backend-subnet-vsi}
{: step}

In this section, you will create a security group and a virtual server instance for the backend.

### Create a backend security group
{: #vpc-public-app-private-backend-8}

The backend security group controls the inbound and outbound connections for the backend servers.

To create a new security group for the backend:
1. Select [**Security groups**](/vpc-ext/network/securityGroups){: external} under **Network**, then click **Create**.
2. Enter **vpc-pubpriv-backend-sg** as name and select the VPC you created earlier.
3. Select a resource group same as your VPC.
4. Click **Create security group**.

You will later edit the security group to add the inbound and outbound rules.

### Create a backend virtual server instance
{: #vpc-public-app-private-backend-9}

To create a virtual server instance in the newly created subnet:

1. Click on the backend subnet under [**Subnets**](/vpc-ext/network/subnets){: external}.
1. Click **Attached resources**, under **Attached instances** click **Create**.
1. To configure the instance:
   1. Select **Architecture** as **Intel** and the same **Location** as before.
   2. Set the **name** to **vpc-pubpriv-backend-vsi**.
   3. Select the resource group as earlier.
   4. Under **Image** click on **Change image**. Use the search field to select **Ubuntu Linux** as your **Operating system**. You can pick any version of the image.
   5. Click **Change profile**, select **Compute** as category and pick **cx2-2x4** (2 vCPUs and 4 GB RAM) as your profile.
   6. Set **SSH keys** to the SSH key you created earlier.
   7. Under **Advanced options** set **User data** to
      ```sh
      #!/bin/bash
      apt-get update
      apt-get install -y nginx
      echo "I'm the backend server" > /var/www/html/index.html
      service nginx start
      ```
      {: pre}

      This will install a simple web server into the instance.
2. Under **Networking**, select the VPC your created.
3. Under **Network interfaces**, click on the **Edit** icon
   1. Select **vpc-pubpriv-backend-subnet** as the subnet.
   2. Uncheck the default security group and check **vpc-pubpriv-backend-sg** and **vpc-secure-maintenance-sg**.
   3. Click **Save**.
4. Click **Create virtual server instance**.

## Create a frontend security group and VSI
{: #vpc-public-app-private-backend-frontend-subnet-vsi}
{: step}

Similar to the backend, you will create a frontend virtual server instance and a security group.

### Create a frontend security group
{: #vpc-public-app-private-backend-12}

To create a new security group for the frontend:
1. Click **Security groups** under Network, then click **Create**.
2. Enter **vpc-pubpriv-frontend-sg** as name and select the VPC you created earlier.
3. Select a resource group same as your VPC.
4. Click **Create security group**.

### Create a frontend virtual server instance
{: #vpc-public-app-private-backend-13}

To create a virtual server instance in the newly created subnet:

1. Click on the frontend subnet under [**Subnets**](/vpc-ext/network/subnets){: external}.
2. Click **Attached resources**, under **Attached instances** click **Create**.
3. To configure the instance:
   1. Select **Architecture** as **Intel** and the same **Location** as before.
   2. Set the **name** to **vpc-pubpriv-frontend-vsi**.
   3. Select the resource group as earlier.
   4. Under **Image** click on **Change image**. Use the search field to select **Ubuntu Linux** as your **Operating system**. You can pick any version of the image.
   5. Click **Change profile**, select **Compute** as category and pick **cx2-2x4** (2 vCPUs and 4 GB RAM) as your profile.
   6. Set **SSH keys** to the the SSH key you created earlier.
   7. Under **Advanced options** set **User data** to
      ```sh
      #!/bin/bash
      apt-get update
      apt-get install -y nginx
      echo "I'm the frontend server" > /var/www/html/index.html
      service nginx start
      ```
      {: pre}

      This will install a simple web server into the instance.
4. Under **Networking**, select the VPC your created.
5. Under **Network interfaces**, click on the **Edit** icon
   1. Select **vpc-pubpriv-frontend-subnet** as the subnet.
   2. Uncheck the default security and group and activate **vpc-pubpriv-frontend-sg** and **vpc-secure-maintenance-sg**.
   3. Click **Save**.
   4. Click **Create virtual server instance**.
6. Once the instance is up and **running**, select the frontend VSI **vpc-pubpriv-frontend-vsi**, scroll to **Network Interfaces** and click on the **Edit** icon. Under **Floating IP address** ,associate a public IP address to your frontend VSI. Save the associated IP Address to a clipboard for future reference.

## Set up connectivity between frontend and backend
{: #vpc-public-app-private-backend-setup-connectivity-frontend-backend}
{: step}

With all servers running, in this section you will set up the connectivity to allow regular operations between the frontend and backend servers.

### Configure the frontend security group
{: #vpc-public-app-private-backend-15}

The frontend instance has its software installed, but it cannot yet be reached due to the configuration.

1. To confirm the web server can not yet be accessed, open a web browser pointing to `http://<floating-ip-address-of-the-frontend-vsi>` or use:
   ```sh
   curl -v -m 30 http://<floating-ip-address-of-the-frontend-vsi>
   ```
   {: pre}
   
   _The connection should time out eventually._
1. To enable inbound connection to the web server installed on the frontend instance, you need to open the port where the web server is listening on.
1. Navigate to **Security groups** in the **Network** section, then click on **vpc-pubpriv-frontend-sg**.
1. Click on the **Rules** tab and under the **Inbound rules** click on **Create**. Add the rules from the table below, they allow incoming HTTP requests and Ping (ICMP). .

   | Protocol | Source type| Source | Value    | Description |
   |------------|---------------|----------|-----------|------|
   | TCP        | Any           | 0.0.0.0/0 | Ports 80-80  | This rule allows connections from any IP address to the frontend web server. |
   | ICMP       | Any           | 0.0.0.0/0 | Type: **8**,Code: **Leave empty**| This rule allows the frontend server to be pinged by any host. |
   {: caption="Inbound rules" caption-side="bottom"}

1. Next, add the **outbound** rule. The port of the backend depends on the software you are installing on the virtual server. This tutorial uses a web server listening on port 80. See the table **Outbound rules** below for values.

   | Protocol | Destination type | Destination | Value    | Description |
   |------------|---------------|----------|-----------|----------|
   | TCP         | Security group | vpc-pubpriv-backend-sg | Ports 80-80  | This rule allows the frontend server to communicate with the backend server. |
   {: caption="Outbound rules" caption-side="bottom"}

1. Access the frontend instance again at `http://<floating-ip-address-of-the-frontend-vsi>` to view the welcome page of the web server.

### Test the connectivity between the frontend and the backend
{: #vpc-public-app-private-backend-16}

The backend server is running the same web server software as the frontend server. It could be considered as a microservice exposing an HTTP interface that the frontend would be calling. In this section, you will attempt to connect to the backend from the frontend server instance.

1. In the [**Virtual Server Instances**](/vpc-ext/compute/vs){: external} list, retrieve the floating IP address of the bastion server host (**vpc-secure-bastion**) and the private IP addresses of the frontend (**vpc-pubpriv-frontend-vsi**) and backend (**vpc-pubpriv-backend-vsi**) server instances.
1. Use `ssh` to connect to the frontend virtual server:
   ```sh
   ssh -J root@<floating-ip-address-of-the-bastion-vsi> root@<private-ip-address-of-the-frontend-vsi>
   ```
   {: pre}

   SSH to the frontend is only be possible through the bastion and only when the **vpc-secure-maintenance-sg** has been attached to the frontend instance.
   {: note}

1. Call the backend web server:
   ```sh
   curl -v -m 30 http://<private-ip-address-of-the-backend-vsi>
   ```
   {: pre}

   _After 30 seconds, the call should time out. Indeed, the security group for the backend server has not yet been configured and is not allowing any inbound connection._

### Configure the backend security group
{: #vpc-public-app-private-backend-17}

To allow inbound connections to the backend server, you need to configure the associated security group.

1. Navigate to **Security groups** in the **Network** section, then click on **vpc-pubpriv-backend-sg**.
2. Click on the **Rules** tab and under the **Inbound rules** click on **Create**.  Add the following rule.


   | Protocol | Source type | Source | Value   | Description |
   |------------|---------------|----------|-----------|--|
   | TCP        | Security group | vpc-pubpriv-frontend-sg | Ports 80-80  | This rule allows incoming connections on port 80 from the frontend server to the backend server. |
   {: caption="Inbound rules" caption-side="bottom"}

### Confirm the connectivity
{: #vpc-public-app-private-backend-18}

1. Call the backend web server from the frontend server again:
   ```sh
   curl -v -m 30 http://<private-ip-address-of-the-backend-vsi>
   ```
   {: pre}

1. The request returns quickly and outputs the message `I'm the backend server` from the backend web server. This completes the configuration of the connectivity between the servers.

### Complete the maintenance
{: #vpc-public-app-private-backend-19}

With the frontend and backend server software properly installed and working, the servers can be removed from the maintenance security group.

1. Navigate to **Security groups** in the **Network** section, then click on **vpc-secure-maintenance-sg**.
1. Select **Attached resources**.
1. Click **Edit interfaces**, expand and uncheck the **vpc-pubpriv-frontend-vsi** and **vpc-pubpriv-backend-vsi** interfaces.
1. **Save** the configuration.
1. Access the frontend instance again at `http://<floating-ip-address-of-the-frontend-vsi>` to confirm it is still working as expected.

Once the servers are removed from the maintenance group, they can no longer be accessed with `ssh`. They will only allow traffic to their web servers.

In this tutorial, you deployed two tiers of an application, one frontend server visible from the public Internet and one backend server only accessible within the VPC by the frontend server. You configured security group rules to ensure traffic would be allowed only the specific ports required by the application.

## Remove resources
{: #vpc-public-app-private-backend-remove-resources}
{: step}

1. In the [VPC Infrastructure console](/vpc-ext/overview){: external}, click on **Floating IPs** under **Network**, then on the IP address for your VSIs, then in the action menu select **Release**. Confirm that you want to release the IP address.
2. Next, switch to **Virtual server instances**, **Stop** and **Delete** your instances by clicking on the respective action menu.
3. Once the VSIs are gone, switch to **Subnets**. If the subnet has an attached public gateway, then click on the subnet name. In the subnet details, detach the public gateway. Subnets without public gateway can be deleted from the overview page. Delete your subnets.
4. After the subnets have been deleted, switch to **VPCs** tab and delete your VPC.

When using the console, you may need to refresh your browser to see updated status information after deleting a resource.
{: tip}

## Related content
{: #vpc-public-app-private-backend-related}

- [Install software on virtual server instances in VPC](/docs/solution-tutorials?topic=solution-tutorials-vpc-app-deploy)
- [Securely access remote instances with a bastion host](/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server)
- [How to deploy isolated workloads across multiple locations and regions](/docs/solution-tutorials?topic=solution-tutorials-vpc-multi-region)
