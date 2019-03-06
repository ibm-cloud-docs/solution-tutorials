---
copyright:
  years: 2019
lastupdated: "2019-03-06"
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

For global load balancer, you will provision an IBM Cloud internet services (CIS) from the catalog and for managing the SSL certificate for all HTTPS requests, {{site.data.keyword.cloudcerts_long_notm}} catalog service will be created and the certificate along with the private key will be imported.

{:shortdesc}

## Objectives
{: #objectives}

* Understand the isolation of workloads through infrastructure objects available for virtual private clouds.
* Use a load balancer between zones within a region to distribute traffic among virtual servers.
* Use a global load balancer between regions to increase resiliency and reduce latency.I'm

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

- Cloud Internet Services requires you to own a custom domain so you can configure the DNS for this domain to point to Cloud Internet Services name servers. If you do not own a domain, you can buy one from a registrar such as [godaddy.com](http://godaddy.com/).

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

## Install and configure a web server on the VSIs

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


## Distribute traffic between zones with load balancers

In this section, you will create two load balancers. One in each region to distribute traffic among multiple server instances under respective subnets within different zones.

### Configure load balancers

1. Navigate to **Load balancers** and click **New load balancer**.
2. Give **vpc-lb-dallas** as the unique name and Select **vpc-dallas** as your Virtual private cloud followed by the resource group the VPC was created and  **Dallas** as the region.
3. Select the private IPs of both **Dallas 1** and **Dallas 2**.
4. Create a new back-end pool of VSIs that acts as equal peers to share the traffic routed to the pool. Set the paramaters with the values below and click **create**.
	- **Name**:  Dallas-pool
	- **Protocol**: HTTP
	- **Method**: Round robin
	- **Session stickiness**: None
	- **Health check path**: /
	- **Health protocol**: HTTP
	- **Interval(sec)**: 15
	- **Timeout(sec)**: 2
	- **Max retries**: 2
5. Click **Attach** to add server instances to the Dallas-pool
   - Select the private IP of **vpc-dallas1-subnet**, select the instance your created and set 80 as the port.
   - Click **Add** and this time select the private IP of **dallas2** subnet, select the instance and set 80 as the port.
   - Click **Attach** to complete the creation of a back-end pool.
6. Click **New listener** to create a new front-end listener; A listener is a process that checks for connection requests.
   - **Protocol**: HTTP
   - **Port**: 80
   - **Back-end pool**: Dallas-pool
   - **Maxconnections**: Leave it empty and click **create**.
7. Click **Create load balancer** to provision a load balancer. 

### Test the load balancers

1. Wait until the status changes to **Active**.
1. Open the **Address** in a web browser
1. Refresh the page several times and notice the load balancer hitting different servers every time.
1. **Save** the address for future reference.

If you observe, the requests are not encrypted and supports only HTTP. You will configure an SSL certificate and enable HTTPS in the next section.

**REPEAT** the steps 1-7 above in the **Frankfurt** region.

## Secure traffic within the VPC with HTTPS
{:#secure_https}

Before adding a HTTPS listener, you need to generate an SSL certificate, verify the authenticity of your custom domain, a place to hold the certificate and map it to the infrastructure service. 

### Provision a CIS service and configure custom domain.

In this section, you will create IBM Cloud internet services(CIS) service,  configure a custom domain by pointing it to CIS name servers and later configure a global load balancer.

1. Navigate to the [Internet Services](https://{DomainName}/catalog/services/internet-services) in the {{site.data.keyword.Bluemix_notm}} catalog.
2. Set the service name, and click **Create** to create an instance of the service. You can use any pricing plans for this tutorial.
3. When the service instance is provisioned, set your domain name by clicking **Let's get started** and click **Add domain**.
4. Click **Next step**. When the name servers are assigned, configure your registrar or domain name provider to use the name servers listed.
5. After you've configured your registrar or the DNS provider, it may require up to 24 hours for the changes to take effect.

   When the domain's status on the Overview page changes from *Pending* to *Active*, you can use the `dig <YOUR_DOMAIN_NAME> ns` command to verify that the new name servers have taken effect.
   {:tip}
   
You should obtain a SSL certificate for the domain and subdomain you plan to use with the global load balancer. Assuming a domain like mydomain.com, the global load balancer could be hosted at `lb.mydomain.com`. The certificate will need to be issued for lb.mydomain.com.

You can get free SSL certificates from [Let's Encrypt](https://letsencrypt.org/). During the process you may need to configure a DNS record of type TXT in the DNS interface of Cloud Internet Services to prove you are the owner of the domain.
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

1. Create a [{{site.data.keyword.cloudcerts_short}}](https://{DomainName}/catalog/services/cloudcerts) instance in a supported location.
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
  - To create a load balancer, you must grant All resource instances authorization for the source resource instance. The target service instance may be **All instances**, or it may be or your specific certificate manager resource instance.

Now, navigate to your [Load balancers](https://{DomainName}/vpc/network/loadBalancers), Select **vpc-lb-dallas** > click to add new **Front-end listeners** and create a **HTTPS** listener with port **443**, respective back-end pool and choose the SSL certificate `lb.YOUR-DOMAIN-NAME` > click **Create**. 

**REPEAT** the same in the load balancer of **Frankfurt** region.

## Configure a global load balancer
{:#global-load-balancer}

In this section, you will configure a global load balancer distributing the incoming traffic to the local load balancers configured in different {{site.data.keyword.Bluemix_notm}} regions.

### Distribute traffic across regions with a global load balancer
Open the CIS service you created by navigating to the [Resource list](https://{DomainName}/resources) under services.

1. Navigate to **Global Load Balancers** under **Reliability** and click **create load balancer**.
2. Enter **lb.YOUR-DOMAIN-NAME** as your hostname and TTL be 60 seconds.
3. Click **Add pool** to define a default origin pool
   - **Name**: lb-dallas
   - **Health check**: CREATE A NEW HEALTH CHECK
     - **Monitor Type**: HTTP
     - **Path**: /
     - **Port**: 80
   - **Health check region**: Eastern North America
   - **origins** 
     - **name**: Dallas
     - **address**: ADDRESS OF DALLAS LOCAL LOAD BALANCER
     - **weight**: 1
     - Click **Add**

**ADD** one more **origin pool** pointing to FRANKFURT load balancer in the **Western Europe** region and click **Provision 1 Resource** to provision your global load balancer.

Wait until the **Health** check status changes to **Healthy**. Open the link **lb.YOUR-DOMAIN-NAME** in a browser of your choice to see the global load balancer in action.

### Failover test
By now, you should have seen that most of the time you are hitting the servers in the Dallas region as it's assigned higher weight compared to the servers in Frankfurt region. Let's introduce a health check failure in the **dallas** origin pool,

- Click **three dots(...)** next to the **lb-dallas** pool and click **Edit pool**
- Select **Health check** and **create new** health check with **HTTP** > **/test** > port - 80
- Apply changes.

Wait until the health status changes to **Critical**. Now, when you refresh your  domain url, you should always be hitting the servers in the **Frankfurt** region.

Don't forget to delete the **/test** health check and revoke the changes in the **dallas** origin pool.
{:tip}

## Remove resources
{: #removeresources}

- Remove the Global load balancer, origin pools and health checks under the CIS service 
- Remove the certificates in the certificate manager service.
- Remove the load balancers, VSIs, subnets and VPCs.
- Under [Resource list](https://{DomainName}/resources), delete the services used in this tutorial.


## Related content
{: #related}

* [Using Load Balancers in IBM Cloud VPC](https://{DomainName}/docs/infrastructure/vpc-network?topic=vpc-network---beta-using-load-balancers-in-ibm-cloud-vpc#--beta-using-load-balancers-in-ibm-cloud-vpc)
