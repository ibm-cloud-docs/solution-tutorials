---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-06-18"
lasttested: "2019-06-18"
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

# Deploy isolated workloads across multiple locations and zones
{: #vpc-multi-region}

This tutorial walks you through the steps of setting up isolated workloads by provisioning VPCs in different IBM Cloud regions. Regions with subnets and virtual server instances (VSIs). These VSIs are created in multiple zones within a region to increase resiliency within a region and globally by configuring load balancers with back-end pools, front-end listeners and proper health checks.

For global load balancer, you will provision an {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) service from the catalog and for managing the SSL certificate for all incoming HTTPS requests, {{site.data.keyword.cloudcerts_long_notm}} catalog service will be created and the certificate along with the private key will be imported.

{:shortdesc}

## Objectives
{: #objectives}

* Understand the isolation of workloads through infrastructure objects available for virtual private clouds.
* Use a load balancer between zones within a region to distribute traffic among virtual servers.
* Use a global load balancer between regions to increase resiliency and reduce latency.

## Services used
{: #services}

This tutorial uses the following runtimes and services:

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.loadbalancer_full}}](https://{DomainName}/vpc/provision/loadBalancer)
- [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services)
- [{{site.data.keyword.cloudcerts_long_notm}}](https://{DomainName}/catalog/services/cloudcerts)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![Architecture](images/solution41-vpc-multi-region/Architecture.png)

1. The admin (DevOps) provisions VSIs in subnets under two different zones in a VPC in region 1 and repeats the same in a VPC created in region 2.
2. The admin creates a load balancer with a backend pool of servers of subnets in different zones of region 1 and a frontend listener. Repeats the same in region 2.
3. The admin provisions a {{site.data.keyword.cis_full_notm}} instance with an associated custom domain and creates a global load balancer pointing to the load balancers created in two different VPCs.
4. The admin enables HTTPS encryption by adding the domain SSL certificate to the Certificate manager service.
5. The internet user makes an HTTP/HTTPS request and the global load balancer handles the request.
6. The request is routed to the load balancers both global and local. The request is then fulfilled by the available server instance.

## Before you begin
{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/vpc-on-classic?topic=vpc-on-classic-managing-user-permissions-for-vpc-resources).
- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/vpc-on-classic?topic=vpc-on-classic-getting-started#prerequisites).
- {{site.data.keyword.cis_full_notm}} requires you to own a custom domain so you can configure the DNS for this domain to point to {{site.data.keyword.cis_full_notm}} name servers. If you do not own a domain, you can buy one from a registrar.

## Create VPCs, subnets and VSIs
{: #create-infrastructure}

In this section, you will create your own VPC in region 1 with subnets created in two different zones of region 1 followed by provisioning of VSIs.

To create your own {{site.data.keyword.vpc_short}} in region 1,

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page and click on **Create a VPC**.
2. Under **New virtual private cloud** section:
   * Enter **vpc-region1** as name for your VPC.
   * Select a **Resource group**.
   * Optionally, add **Tags** to organize your resources.
3. Select **Create new default (Allow all)** as your VPC default access control list (ACL).
4. Uncheck SSH and ping from the **Default security group** and leave **classic access** unchecked.
5. Under **New subnet for VPC**:
   * Enter **vpc-region1-zone1-subnet** as your subnet's unique name.
   * Select a location (e.g., Dallas), let's call this **region 1** and a zone in region 1 (e.g., Dallas 1), let's call this **zone 1**.
   * Enter the IP range for the subnet in CIDR notation, i.e., **10.xxx.0.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
6. Select **Use VPC default** for your subnet access control list (ACL). You can configure the inbound and outbound rules later.
7. Given all virtual server instances in the subnet will have a floating IP attached, it is not required to enable a public gateway for the subnet. The virtual server instances will have Internet connectivity through their floating IP.
8. Click **Create virtual private cloud** to provision the instance.

To confirm the creation of subnet, click **Subnets** on the left pane and wait until the status changes to **Available**. You can create a new subnet under **Subnets**.

### Create subnet in a different zone

1. Click on **New Subnet**, enter **vpc-region1-zone2-subnet** as a unique name for your subnet and select **vpc-region1** as the VPC.
1. Select a location which we called as region 1 above (e.g., Dallas) and select a different zone in region 1 (e.g., Dallas 2), let's call the selected zone as **zone 2**.
1. Enter the IP range for the subnet in CIDR notation, i.e., **10.xxx.64.0/24**. Leave the **Address prefix** as it is and select the **Number of addresses** as 256.
1. Select **VPC default** for your subnet access control list (ACL).
1. Leave the public gateway to **Detached** and click **Create subnet**.

### Provision VSIs
Once the status of the subnets changes to **Available**,

1. Click on **vpc-region1-zone1-subnet** and click **Attached resources**, then **New instance**.
1. Enter **vpc-region1-zone1-vsi** as your virtual server's unique name. Then, select the VPC your created earlier, resource group and the **Location** along with the **zone** as before.
1. Select **Compute** with 2vCPUs and 4 GB RAM as your profile.To check other available profiles, click **All profiles**
1. Set **SSH keys** to the the SSH key you created earlier.
1. Set the **image** to **Ubuntu Linux** and pick any version of the image.
1. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups
   * Check whether **vpc-region1-zone1-subnet** is selected as the subnet. If not, select and click **Save**.
   * Click **Create virtual server instance**.
1.  Wait until the status of the VSI changes to **Powered On**. Then, select the VSI **vpc-region1-zone1-vsi**, scroll to **Network Interfaces** and click **Reserve** under **Floating IP** to associate a public IP address to your VSI. Save the associated IP Address to a clipboard for future reference.
1. **REPEAT** the above steps to provision a VSI in **zone 2** of **region 1**.

Navigate to **VPC** and **Subnets** under **Network** on the left pane and **REPEAT** the above steps for provisioning a new VPC with subnets and VSIs in **region2** by following the same naming conventions as above.

## Install and configure web server on the VSIs
{: #install-configure-web-server-vsis}

Follow the steps mentioned in [securely access remote instances with a bastion host](/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.
{:tip}

Once you successfully SSH into the server provisioned in subnet of zone 1 of region 1,

1. At the prompt, run the below commands to install Nginx as your web server
   ```
   sudo apt-get update
   sudo apt-get install nginx
   ```
   {:codeblock}
2. Check the status of the Nginx service with the following command:
   ```
   sudo systemctl status nginx
   ```
   {:codeblock}
   The output should show you that the Nginx service is **active** and running.
3. You’ll need to open **HTTP (80)** and **HTTPS (443)** ports to receive traffic (requests). You can do that by adjusting the Firewall via [UFW](https://help.ubuntu.com/community/UFW) - `sudo ufw enable` and by enabling the ‘Nginx Full’ profile which includes rules for both ports:
   ```
   sudo ufw allow 'Nginx Full'
   ```
   {:codeblock}
4. To verify that Nginx works as expected open `http://FLOATING_IP` in your browser of choice, and you should see the default Nginx welcome page.
5. To update the html page with the region and zone details, run the below command
   ```
   nano /var/www/html/index.nginx-debian.html
   ```
   {:codeblock}
   Append the region and zone say _server running in **zone 1 of region 1**_ to the `h1` tag quoting `Welcome to nginx!` and save the changes.
6. Restart the nginx server to reflect the changes
   ```
   sudo systemctl restart nginx
   ```
   {:codeblock}

**REPEAT** the above steps to install and configure the webserver on the VSIs in subnets of all the zones and don't forget to update the html with respective zone information.


## Distribute traffic between zones with load balancers
{: #distribute-traffic-with-load-balancers}

In this section, you will create two load balancers. One in each region to distribute traffic among multiple server instances under respective subnets within different zones.

### Configure load balancers

1. Navigate to **Load balancers** and click **New load balancer**.
2. Enter **vpc-lb-region1** as the unique name, select **vpc-region1** as your Virtual private cloud, select the resource group the VPC was created, Load balancer Type: **Public** and **region1** as the region.
3. Select the **Subnets** of both **zone 1** and **zone 2** of **region 1**.
4. Click **New pool** to create a new back-end pool of VSIs that acts as equal peers to share the traffic routed to the pool. Set the paramaters with the values below and click **create**.
	- **Name**:  region1-pool
	- **Protocol**: HTTP
	- **Method**: Round robin
	- **Session stickiness**: None
	- **Health check path**: /
	- **Health protocol**: HTTP
	- **Interval(sec)**: 15
	- **Timeout(sec)**: 5
	- **Max retries**: 2
5. Click **Attach** to add server instances to the region1-pool
   - Select the private IP of **vpc-region1-zone1-subnet**, select the instance your created and set 80 as the port.
   - Click **Add** and this time select the private IP of **vpc-region1-zone2-subnet**, select the instance and set 80 as the port.
   - Click **Attach** to complete the creation of a back-end pool.
6. Click **New listener** to create a new front-end listener; A listener is a process that checks for connection requests.
   - **Protocol**: HTTP
   - **Port**: 80
   - **Back-end pool**: region1-pool
   - **Maxconnections**: Leave it empty and click **Create**.
7. Click **Create load balancer** to provision a load balancer.

### Test the load balancers

1. Wait until the status of the load balancer changes to **Active**.
2. Open the **Address** in a web browser.
3. Refresh the page several times and notice the load balancer hitting different servers with each refresh.
4. **Save** the address for future reference.

If you observe, the requests are not encrypted and supports only HTTP. You will configure an SSL certificate and enable HTTPS in the next section.

**REPEAT** the steps 1-7 above in **region 2**.

## Secure traffic within the VPC with HTTPS
{: #secure_https}

Before adding a HTTPS listener, you need to generate an SSL certificate, verify the authenticity of your custom domain, a place to hold the certificate and map it to the infrastructure service.

### Provision a {{site.data.keyword.cis_short_notm}} service and configure custom domain

In this section, you will create {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) service,  configure a custom domain by pointing it to {{site.data.keyword.cis_short_notm}} name servers and later configure a global load balancer.

1. Navigate to the [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
2. Enter a service name, select a resource group and click **Create** to provision an instance of the service. You can use any pricing plans for this tutorial.
3. When the service instance is provisioned, set your domain name by clicking **Let's get started** > enter your domain name and click **Connect and continue**.
4. Click **Next step**. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
5. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

   When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <YOUR_DOMAIN_NAME> ns` command to verify that the new name servers have taken effect.
   {:tip}

You should obtain a SSL certificate for the domain and subdomain you plan to use with the global load balancer. Assuming a domain like mydomain.com, the global load balancer could be hosted at `lb.mydomain.com`. The certificate will need to be issued for lb.mydomain.com.

You can get free SSL certificates from [Let's Encrypt](https://letsencrypt.org/). During the process you may need to configure a DNS record of type TXT in the DNS interface of {{site.data.keyword.cis_full_notm}} to prove you are the owner of the domain.
{:tip}

Once you have obtained the SSL certificate and private key for your domain make sure to convert them to the [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format.

1. To convert a Certificate to PEM format:
   ```
   openssl x509 -in domain-crt.txt -out domain-crt.pem -outform PEM
   ```
   {: pre}
2. To convert a Private Key to PEM format:
   ```
   openssl rsa -in domain-key.txt -out domain-key.pem -outform PEM
   ```
   {: pre}

### Import the certificate and authorize load balancer service

You can manage the SSL certificates through IBM Certificate Manager.

1. Create a [{{site.data.keyword.cloudcerts_short}}](https://{DomainName}/catalog/services/cloudcerts) instance in a supported location and under a resource group.
2. In the service dashboard, use **Import Certificate**:
   * Set **Name** to the custom subdomain and domain, such as *lb.mydomain.com*.
   * Browse for the **Certificate file** in PEM format.
   * Browse for the **Private key file** in PEM format.
   * **Import**.
3. Create an authorization that gives the load balancer service instance access to the certificate manager instance that contains the SSL certificate. You may manage such an authorization through [Identity and Access Authorizations](https://{DomainName}/iam#/authorizations).
  - Click **Create** and choose **Infrastructure Service** as the source service
  - **Load Balancer for VPC** as the resource type
  - **Certificate Manager** as the target service
  - Assign the **Writer** service access role.
  - To create a load balancer, you must grant All resource instances authorization for the source resource instance. The target service instance may be **All instances**, or it may be your specific certificate manager resource instance.

### Create a HTTPS listener

Now, navigate to the [Load balancers](https://{DomainName}/vpc/network/loadBalancers)

1. Select **vpc-lb-region1**
2. Under **Front-end listeners**, Click **New listener**

   -  **Protocol**: HTTPS
   -  **Port**: 443
   -  **Back-end pool**: POOL in the same region
   - Choose the current region as your SSL region
   - Choose the SSL certificate for **lb.YOUR-DOMAIN-NAME**

3. Click **Create** to configure an HTTPS listener

**REPEAT** the above steps in the load balancer of **region 2**.

## Configure a global load balancer
{: #global-load-balancer}

In this section, you will configure a global load balancer (GLB) distributing the incoming traffic to the local load balancers configured in different {{site.data.keyword.Bluemix_notm}} regions.

### Distribute traffic across regions with a global load balancer
Open the {{site.data.keyword.cis_short_notm}} service you created by navigating to the [Resource list](https://{DomainName}/resources) under services.

1. Navigate to **Global Load Balancers** under **Reliability** and click **create load balancer**.
2. Enter **lb.YOUR-DOMAIN-NAME** as your hostname and TTL as 60 seconds.
3. Click **Add pool** to define a default origin pool
   - **Name**: lb-region1
   - **Health check**: Create new
     - **Monitor Type**: HTTP
     - **Path**: /
     - **Port**: 80
   - **Health check region**: Eastern North America
   - **origins**
     - **name**: region1
     - **address**: ADDRESS OF **REGION1** LOCAL LOAD BALANCER
     - **weight**: 1
     - Click **Add**

4. **ADD** one more **origin pool** pointing to **region2** load balancer in the **Western Europe** region and click **Provision 1 Resource** to provision your global load balancer.

Wait until the **Health** check status changes to **Healthy**. Open the link **lb.YOUR-DOMAIN-NAME** in a browser of your choice to see the global load balancer in action.

### Failover test
By now, you should have seen that most of the time you are hitting the servers in **region 1** as it's assigned higher weight compared to the servers in **region 2**. Let's introduce a health check failure in the **region 1** origin pool,

1. Navigate to [virtual server instances](https://{DomainName}/vpc/compute/vs).
2. Click **three dots(...)** next to the server(s) running in **zone 1** of **region 1** and click **Stop**.
3. **REPEAT** the same for server(s) running in **zone 2** of **region 1**.
4. Return to GLB under {{site.data.keyword.cis_short_notm}} service and wait until the health status changes to **Critical**.
5. Now, when you refresh your domain url, you should always be hitting the servers in **region 2**.

Don't forget to **start** the servers in zone 1 and zone 2 of region 1
{:tip}

## Remove resources
{: #removeresources}

- Remove the Global load balancer, origin pools and health checks under the {{site.data.keyword.cis_short_notm}} service
- Remove the certificates in the certificate manager service.
- Remove the load balancers, VSIs, subnets and VPCs.
- Under [Resource list](https://{DomainName}/resources), delete the services used in this tutorial.


## Related content
{: #related}

* [Using Load Balancers in IBM Cloud VPC](/docs/vpc-on-classic-network?topic=vpc-on-classic-network---using-load-balancers-in-ibm-cloud-vpc)
