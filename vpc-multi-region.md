---
subcollection: solution-tutorials
copyright:
  years: 2019, 2020
lastupdated: "2021-07-13"
lasttested: "2020-12-16"

content-type: tutorial
services: vpc, cis, certificate-manager
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
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
{:note: .note}

# Deploy isolated workloads across multiple locations and zones
{: #vpc-multi-region}
{: toc-content-type="tutorial"}
{: toc-services="vpc, cis, certificate-manager"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This tutorial walks you through the steps of setting up isolated workloads by provisioning {{site.data.keyword.vpc_full}}s (VPCs) in two different regions with subnets and virtual server instances (VSIs). You will create VSIs in multiple zones within one region to ensure the high availability of the application.  You will create additional VSIs in a second region and configure a global load balancer to provide high availability between regions and reduce network latency for users in different geographies.
{: shortdesc}

For the global load balancer, you will provision an {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) service from the catalog. For managing the SSL certificate for all incoming HTTPS requests, you will use the {{site.data.keyword.cloudcerts_long_notm}} service.

## Objectives
{: #vpc-multi-region-objectives}

* Understand the isolation of workloads through infrastructure objects available for virtual private clouds.
* Use a load balancer between zones within a region to distribute traffic among virtual servers.
* Use a global load balancer between regions to implement high availability, increase resiliency and reduce latency.


  ![Architecture](images/solution41-vpc-multi-region/Architecture.png)

1. The admin (DevOps) provisions VSIs in subnets under two different zones in a VPC in region 1 and repeats the same in a VPC created in region 2.
2. The admin creates a load balancer with a backend pool of servers of subnets in different zones of region 1 and a frontend listener. Repeats the same in region 2.
3. The admin provisions a {{site.data.keyword.cis_full_notm}} instance with an associated custom domain and creates a global load balancer pointing to the load balancers created in two different VPCs.
4. The admin enables HTTPS encryption by adding the domain SSL certificate to the {{site.data.keyword.cloudcerts_short}} service.
5. The internet user makes an HTTP/HTTPS request and the global load balancer handles the request.
6. The request is routed to the load balancers both on the global and local level. The request is then fulfilled by the available server instance.

## Before you begin
{: #vpc-multi-region-prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. See the list of [required permissions](https://{DomainName}/docs/vpc?topic=vpc-managing-user-permissions-for-vpc-resources) for VPC.
- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see [the instructions](/docs/vpc?topic=vpc-ssh-keys) for creating a key for VPC.

## Create VPCs, subnets and VSIs
{: #vpc-multi-region-create-infrastructure}
{: step}

In this section, you will create your own VPC in region 1 with subnets created in two different zones of region 1 followed by provisioning of VSIs.

To create your own {{site.data.keyword.vpc_short}} in region 1 with a subnet in each zone,

1. Navigate to [Virtual Private Clouds](https://{DomainName}/vpc-ext/network/vpcs) page and click on **Create**
2. Under **New virtual private cloud** section:
   * Enter **vpc-region1** as name for your VPC.
   * Select a **Resource group**.
   * Optionally, add **Tags** to organize your resources.
3. The default access control list (ACL) **(Allow all)** is appropriate for your VPC
4. Uncheck SSH and ping from the **Default security group** and leave **classic access** unchecked. SSH access will later be added to the maintenance security group.  The maintenance security group must be added to an instance to allow SSH access from the bastion server.  Ping access is not required for this tutorial.
4. Leave **Create a default prefix for each zone** checked.
5. Under **Subnets** change the name of the Zone 1 subnet.  Click the pencil icon:
   * Enter **vpc-region1-zone1-subnet** as your subnet's unique name.
   * Select the same **Resource group** as the VPC resource group.
   * Leave the defaults in the other values.
   * Click **Save**
6. Under **Subnets** change the name of the Zone 2 subnet.  Click the pencil icon:
   * Enter **vpc-region1-zone2-subnet** as your subnet's unique name.
   * Select the same **Resource group** as the VPC resource group.
   * Leave the defaults in the other values.
   * Click **Save**
7. Under **Subnets** delete the subnet in Zone 3.  Click the minus icon.
8. Click **Create virtual private cloud** to provision the instance.

### Create a security group to allow inbound traffic to your application
{: #vpc-multi-region-4}

To allow traffic to the application you will deploy on virtual server instances, you need to enable inbound rules for HTTP (80) and HTTPS (443) ports. In later steps, when creating virtual server instances, you will add these instances to the security group defining those rules.

1. Navigate to **Security groups**.
2. Create a new security group called **vpc-region1-sg** in **vpc-region1** with a selected **Resource group** and with the below inbound rules:
   

   | Protocol | Source type | Source | Value    |
   |------------|---------------|----------|-----------  |
   | TCP         | Any            | 0.0.0.0/0 | Ports 80-80  |
   | TCP         | Any            | 0.0.0.0/0 | Ports 443-443 |
   {: caption="Inbound rules" caption-side="bottom"}

### Provision VSIs
{: #vpc-multi-region-5}
1. Navigate to **Subnets**.
1. Verify status is available and click on **vpc-region1-zone1-subnet** and click **Attached resources**, then **Create**.
   1. Enter **vpc-region1-zone1-vsi** as your virtual server's unique name.
   2. Verify the VPC your created earlier, resource group and the **Location** along with the **zone** as before.
1. Set the **image** to **Ubuntu Linux** and pick any version of the image.
1. CLick on **View all profiles** and select **Compute** with 2vCPUs and 4 GB RAM as your profile.
1. Set **SSH keys** to the the SSH key you created earlier.
1. Under **Network interfaces**, click on the **Edit** icon next to the Security Groups
   * Select **vpc-region1-zone1-subnet** as the subnet.
   * Uncheck the default security group and check **vpc-region1-sg**.
   * Click **Save**.
1. Click **Create virtual server instance**.
1. **REPEAT** the above steps to provision a **vpc-region1-zone2-vsi** VSI in **zone 2** of **region 1**.

## And then to another location
{: #vpc-multi-region-20}
{: step}

Navigate to **VPC** and **Subnets** under **Network** on the left pane and **REPEAT** the above steps for provisioning a new VPC with subnets and VSIs in another region, form example, **Franfurt**.  Follow the same naming conventions as above while substituting region2 for region1.

## Install and configure web server on the VSIs
{: #vpc-multi-region-install-configure-web-server-vsis}
{: step}

Follow the steps mentioned in [securely access remote instances with a bastion host](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.  One bastion host in each VPC will be required.
{: tip}

Once you successfully SSH into the server provisioned in subnet of **zone 1** of **region 1**,

1. At the prompt, run the below commands to install Nginx as your web server
   ```
   sudo apt-get update
   sudo apt-get install nginx
   ```
   {: codeblock}
2. Check the status of the Nginx service with the following command:
   ```
   sudo systemctl status nginx
   ```
   {: codeblock}
   The output should show you that the Nginx service is **active** and running.
4. Optionally verify that Nginx works as expected.  `curl localhost`.  You should see the default Nginx welcome page.
5. To update the html page with the region and zone details, run the below command
   ```
   nano /var/www/html/index.nginx-debian.html
   ```
   {: codeblock}
   Append the region and zone say _server running in **zone 1 of region 1**_ to the `h1` tag quoting `Welcome to nginx!` and save the changes.
6. `curl localhost` again to notice the changes
7. **REPEAT** the above steps to install and configure the webserver on the VSIs in subnets of all the zones and don't forget to update the html with respective zone information.

## Distribute traffic between zones with load balancers
{: #vpc-multi-region-distribute-traffic-with-load-balancers}
{: step}

In this section, you will create two load balancers. One in each region to distribute traffic among multiple server instances under respective subnets within different zones.

### Configure load balancers
{: #vpc-multi-region-8}

1. Navigate to **Load balancers** and click **New load balancer**.
2. Enter **vpc-lb-region1** as the Name, select **vpc-region1** as the Virtual Private Cloud, select the resource group, **Application load balancer** as the Load balancer and Load balancer Type: **Public**.
3. Select the **Subnets** of **vpc-region1-zone1-subnet** and **vpc-region1-zone2-subnet**..
4. Click **New pool** to create a new back-end pool of VSIs that acts as equal peers to share the traffic routed to the pool. Set the parameters with the values below and click **Save**.
	- **Name**:  region1-pool
	- **Protocol**: HTTP
   - **Session stickiness**: None
	- **Proxy protocol**: Disabled
   - **Method**: Round robin
	- **Health check path**: /
	- **Health protocol**: HTTP
	- **Health port**: Leave blank
	- **Interval(sec)**: 15
	- **Timeout(sec)**: 5
	- **Max retries**: 2
5. Click **Attach** to add server instances to the pool
   - From the Subnet dropdown, select **vpc-region1-zone1-subnet**, select the instance your created and set 80 as the port.
   - Click on **Add**
   - From the Subnet dropdown, select **vpc-region1-zone2-subnet**, select the instance your created and set 80 as the port.
   - Click **Save** to complete the creation of a back-end pool.
6. Click **New listener** to create a new front-end listener; A listener is a process that checks for connection requests.
   - **Protocol**: HTTP
   - **Proxy protocol**: not checked
   - **Port**: 80
   - **Back-end pool**: region1-pool
   - **Maxconnections**: Leave it empty and click **Save**.
7. Click **Create load balancer** to provision a load balancer.
8. **REPEAT** the steps 1-7 above in **region 2**.

### Test the load balancers
{: #vpc-multi-region-9}

1. Wait until the status of the load balancer changes to **Active**.
2. Open the **Hostname** in a web browser.
3. Refresh the page several times and notice the load balancer hitting different servers with each refresh.
4. **Save** the address for future reference.

If you observe, the requests are not encrypted and supports only HTTP. You will configure an SSL certificate and enable HTTPS in the next section.

## Configure multi-location load-balancing
{: #vpc-multi-region-global-load-balancer}
{: step}

Your application is now running in two regions, but it is missing one component for the users to access it transparently from a single entry point.

In this section, you will configure {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) to distribute the load between the two regions. {{site.data.keyword.cis_short_notm}} is a one stop-shop service providing _Global Load Balancer (GLB)_, _Caching_, _Web Application Firewall (WAF)_ and _Page rule_ to secure your applications while ensuring the reliability and performance for your Cloud applications.

To configure a global load balancer, you will need:
* to point a custom domain to {{site.data.keyword.cis_short_notm}} name servers,
* to retrieve the IP addresses or hostnames of the VPC load balancers,
* to configure health checks to validate the availability of your application,
* and to define origin pools pointing to the VPC load balancers.

### Register a custom domain with {{site.data.keyword.cis_full_notm}}
{: #vpc-multi-region-10}

The first step is to create an instance of {{site.data.keyword.cis_short_notm}} and to point your custom domain to {{site.data.keyword.cis_short_notm}} name servers.

1. If you do not own a domain, you can buy one from a registrar.
2. Navigate to [{{site.data.keyword.cis_full_notm}}](https://{DomainName}/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
3. Set the service name, and click **Create** to create an instance of the service.
4. When the service instance is provisioned, click on **Let's get Started**.
5. Enter your domain name and click **Connect and continue**.
6. Setup your DNS records is an optional step and can be skipped for this tutorial. click on **Next Step**
6. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
7. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

   When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <your_domain_name> ns` command to verify that the new name servers have taken effect.
   {: tip}

### Configure Health Check for the Global Load Balancer
{: #vpc-multi-region-11}

A health check helps gain insight into the availability of pools so that traffic can be routed to the healthy ones. These checks periodically send HTTP/HTTPS requests and monitor the responses.

1. In the {{site.data.keyword.cis_full_notm}} dashboard, navigate to **Reliability** > **Global Load Balancers**, and at the bottom of the page, click **Create**.
1. Set **Name** to **nginx**.
1. Set **Monitor Type** to **HTTP**.
1. Set **Path** to **/**
1. Click **Save**.

   When building your own applications, you could define a dedicated health endpoint such as */health* where you would report the application state.
   {: tip}

### Define Origin Pools
{: #vpc-multi-region-12}

A pool is a group of origin VSIs or load balancers that traffic is intelligently routed to when attached to a GLB. With VPC load balancers in two regions, you can define location-based pools and configure {{site.data.keyword.cis_short_notm}} to redirect users to the closest VPC load balancer based on the geographical location of the user requests.

#### One pool for the VPC load balancers in region 1
{: #vpc-multi-region-13}
1. Click **Create**.
2. Set **Name** to **region-1-pool**
3. Set **Health check** to the one created in the previous section
4. Set **Health Check Region** to `closest to region 1`
5. Set **Origin Name** to **region-1**
6. Set **Origin Address** to hostname of **region1** VPC Load balancer, see the overview page of the VPC load balancer.
7. Click **Save**.

#### One pool for the VPC load balancers in region 2
{: #vpc-multi-region-18}
1. Click **Create**.
2. Set **Name** to **region-2-pool**
3. Set **Health check** to the one created in the previous section
4. Set **Health Check Region** to `closest to region 2`
5. Set **Origin Name** to **region-2**
6. Set **Origin Address** to hostname of **region1** VPC Load balancer, see the overview page of the VPC load balancer.
7. Click **Save**.

### Create the Global Load Balancer
{: #vpc-multi-region-19}

With the origin pools defined, you can complete the configuration of the load balancer.

1. Click **Create Load Balancer**.
1. Enter a name under **Balancer hostname** for the Global Load Balancer. This name will also be part of your universal application URL (`http://lb.mydomain.com`), regardless of the location.
1. Under **Default origin pools**, click **Add pool** and add the pool named **region-1-pool** and **region-2-pool**.
1. Expand the section of **Geo routes**, you can distribute traffic based on the origin region, pick a GLB region that is close to the VPC region 1. 
   1. You can add additional routes if desired based on geographies and direct traffic to the closest pool.  Click **Add route**, select a GLB region for example, **Western Europe**  and select the pool desired for example **region-2-pool** and click **Add**.

With this configuration, a request does not match any of the defined route, it will be redirected to the **Default origin pools**, users in the GLB region you have define will be directed to the closest Load Balancers/VSIs.

1. Click **Save**.

## Secure with HTTPS
{: #vpc-multi-region-6}
{: step}

HTTPS encryption requires signed certificates to be stored and accessed. Below the {{site.data.keyword.cloudcerts_long}} will be provisioned to order or import, then manage the certificate. Then the Identity and Access Management (IAM) service authorization is configured to allow read access.

### Create and authorize a {{site.data.keyword.cloudcerts_short}} instance
{: #vpc-multi-region-14}

Manage the SSL certificates through the {{site.data.keyword.cloudcerts_full_notm}}.

1. Create a [{{site.data.keyword.cloudcerts_short}}](https://{DomainName}/catalog/services/cloudcerts) instance in a supported location and in a resource group.
2. Create an authorization that gives the VPC load balancer service instance access to the {{site.data.keyword.cloudcerts_short}} instance that contains the SSL certificate. You may manage such an authorization through [Identity and Access Authorizations](https://{DomainName}/iam#/authorizations).
   - Click **Create** and choose **VPC Infrastructure Service** as the source service
   - **Load Balancer for VPC** as the resource type
   - **Certificate Manager** as the target service
   - Assign the **Writer** service access role.
   - To create a load balancer, you must grant All resource instances authorization for the source resource instance. The target service instance may be **All instances**, or it may be your specific {{site.data.keyword.cloudcerts_short}} instance.
   - Click on **Authorize**.
1. Continuing in the Authorizations panel, create an authorization that gives the {{site.data.keyword.cloudcerts_short}} access to {{site.data.keyword.cis_short_notm}}:
   - Click **Create** and choose **Certificate Manager** as the source service
   - Choose **All instances** or just the {{site.data.keyword.cloudcerts_short}} created earlier
   - **Internet Services** as the target service
   - Choose **All instances** or just the {{site.data.keyword.cis_short_notm}} created earlier
   - Assign the **Manager** service access role.
   - Click on **Authorize**.

### Alternative 1: Proxy in {{site.data.keyword.cis_short_notm}} with wildcard certificate
{: #vpc-multi-region-15}
This first alternative creates a wildcard certificate for **mydomain.com** and then proxies it in the {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) allowing you to take advantage of industry leading security, protection and performance capabilities.

1. Order a certficate in {{site.data.keyword.cloudcerts_short}}
   - Open the {{site.data.keyword.cloudcerts_short}} service and select **Order certificate** on the left.
   - Click **IBM Cloud Internet Services (CIS)** then **Continue**
   - The **Certificate details** panel is displayed
     - **Name** - choose a name you can remember to reference this certificate in a later step
     - **Description** - more text
     - **Certificate authority** choose  **Let's Encrypt**
     - Leave the defaults for **Signature algorithm**, **Key algorithm**
     - **Automatic certificate renewel** - leave off
   - Switch to the **Domains** panel
     - **IBM Cloud Internet Services (CIS) instance** choose your instance
     - **Certificate domains** check the **Add Wildccard** and leave **Add Domain** unchecked
   - Click Order
1. Configure https from client web browsers to the {{site.data.keyword.cis_short_notm}} endpoint. In {{site.data.keyword.cis_short_notm}} configure TLS Security:
   - Open the **Security** panel and choose **TLS**.
   - For the **Mode** choose **Client-to-edge**.  This will terminate https connections at the Global Load Balancer and will switch to http connections to the VPC load balancer.
1. In the {{site.data.keyword.cis_short_notm}} configure the Global Load Balancer to use TLS:
   - Open **Reliability** panel and choose **Global Load Balancer**
   - Locate the Global Load Balancer created earlier and turn on Proxy
1. In a browser open **https://lb.mydomain.com** to verify success

Next configure HTTPS from {{site.data.keyword.cis_short_notm}} to the VPC load balancer.

Add an HTTPS listener to the VPC load balancers:
1. Navigate to **VPC** then **Load balancers** and click **vpc-lb-region1**
1. Choose **Front-end listeners**
1. Click **New listener**
1. Select HTTPS, Port: 443. The SSL Certificate drop down should show the certificate **name** that you ordered using your {{site.data.keyword.cloudcerts_short}} instance earlier from Let's Encrypt. Click on **Save**.

   If the SSL Certificate drop down does not have **mydomain.com** you may have missed the authorization step above that gives the VPC load balancer access to the {{site.data.keyword.cloudcerts_short}} service. Verify that the {{site.data.keyword.cloudcerts_short}} service has a certificate for **mydomain.com**.
   {: tip}
1. Repeat for the **vpc-lb-region2** load balancer.

The wildcard certificate created will allow access to domain name like vpc-lb-region1.**mydomain.com**.  Open the the **Overview** tab of the VPC load balancer **vpc-lb-region1** and notice that the **Hostname** is xxxxxxx-<region>.lb.appdomain.cloud. The wildcard certificate is not going to work. Fix that problem by creating an alias and then update the configuration.

1. A DNS CNAME record can be created to allow clients to lookup vpc-lb-region1.**mydomain.com** and resolve xxxxxxx-<region>.lb.appdomain.cloud.
   - In the {{site.data.keyword.cis_short_notm}}, open **Reliability** panel and choose **DNS**
   - Scroll down to DNS Records and create a record of Type: **CNAME**, Name: **vpc-lb-region1**, TTL: **Automatic** and Alias Domain Name: **VPC load balancer Hostname**
   - Add a DNS CNAME record for **vpc-lb-region2**

1. Now adjust the Global load balancer to use the new CNAME records:
   - Open **Reliability** panel and choose **Global Load Balancers**
   - Find and edit the **Origin Pools** to change the **Origins** **Origin Address** to **vpc-lb-region1.mydomain.com**.
   - Repeat for **vpc-lb-region2.mydomain.com**.

1. Turn on end to end security
   - Open the **Security** panel and choose **TLS**.
   - For the **Mode** choose **End-to-end CA signed**.  This will terminate https connections at the Global Load Balancer and use https connections to the VPC load balancer.

In a browser open **https://lb.mydomain.com** to verify success

### Alternative 2: Have the Global Load Balancer pass through directly to VPC load balancers
{: #vpc-multi-region-16}
In this alternative you will order an SSL certificate for `lb.mydomain.com` from [Let's Encrypt](https://letsencrypt.org/) through {{site.data.keyword.cloudcerts_long}} and configure the Global Load Balancer 

It is not currently possible to order a certificate directly for a {{site.data.keyword.cis_short_notm}} Global Load Balancer, but it is possible to order one for a CNAME record.  So create one of these, order the the certificate, then delete the CNAME record.

1. Open the {{site.data.keyword.cis_short_notm}} service you created by earlier, you can find it in the [Resource list](https://{DomainName}/resources)

1. Navigate to **Global Load Balancers** under **Reliability** and click **DNS**.

1. In the DNS Records section:
    - Type: CNAME
    - Name: lb
    - TTL: default (Automatic)
    - Alias Domain Name: zzz.mydomain.com (remember, this is only going to be used to order a certificate)
    - Click Add Record

1. Order a certficate in {{site.data.keyword.cloudcerts_short}}
   - Open the {{site.data.keyword.cloudcerts_short}} service and select **Order certificate** on the left.
   - Click **IBM Cloud Internet Services (CIS)** then **Continue**
   - On the **Order certificate** the **Certificate details** panel is displayed
     - **Name** - choose an order name you can remember to reference this certificate in a later step
     - **Description** - more text
     - **Certificate authority** choose  **Let's Encrypt**
     - Leave the defaults for **Signature algorithm**, **Key algorithm**
     - **Automatic certificate renewel** - leave off
   - On the **Order certificate** select the **Domains** panel
     - **IBM Cloud Internet Services (CIS) instance** choose your instance
     - **Certificate domains** click the **Subdomains** link
     - in the pop up dialog, check the **Add Domain** box next to lb.mydomain.com
     - click Apply
   - Notice that lb.mydomain.com has been added to the Order summary
   - Click **Order**

1. Back in your {{site.data.keyword.cis_short_notm}} service delete the CNAME lb.mydomain.com DNS record you created in the **Global Load Balancers** under **Reliability** > **DNS**.


Create a HTTPS listener:

1. Navigate to the VPC **Load balancers** page.
1. Select **vpc-lb-region1**
2. Under **Front-end listeners**, Click **Create**

   -  **Protocol**: HTTPS
   -  **Port**: 443
   -  **Back-end pool**: POOL in the same region
   - Choose the current region as your SSL region
   - Choose the SSL certificate order name you just created for **lb.mydomain.com**

3. Click **Save** to configure an HTTPS listener

**REPEAT** the above steps in the load balancer of **region 2**.

In a browser open https://**lb.mydomain.com** to verify success


### Failover test
{: #vpc-multi-region-17}
By now, you should have seen that most of the time you are hitting the servers in **region 1** as it's assigned higher weight compared to the servers in **region 2**. Let's introduce a health check failure in the **region 1** origin pool,

1. Navigate to the list of **virtual server instances**.
2. Click **three dots(...)** next to the server(s) running in **zone 1** of **region 1** and click **Stop**.
3. **REPEAT** the same for server(s) running in **zone 2** of **region 1**.
4. Return to GLB under {{site.data.keyword.cis_short_notm}} service and wait until the health status changes to **Critical**.
5. Now, when you refresh your domain url, you should always be hitting the servers in **region 2**.

   Don't forget to **start** the servers in zone 1 and zone 2 of region 1.
   {: tip}

## Remove resources
{: #vpc-multi-region-removeresources}
{: step}

- Remove the Global load balancer, origin pools and health checks under the {{site.data.keyword.cis_short_notm}} service
- Remove the certificates in the {{site.data.keyword.cloudcerts_short}} service.
- Remove the load balancers, VSIs, subnets and VPCs.
- Under [Resource list](https://{DomainName}/resources), delete the services used in this tutorial.


## Related content
{: #vpc-multi-region-related}

* [Using Load Balancers in IBM Cloud VPC](/docs/vpc?topic=vpc-nlb-vs-elb)
