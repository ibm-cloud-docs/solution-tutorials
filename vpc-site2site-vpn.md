---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-05-07"
lasttested: "2019-05-28"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}

# Use a VPC/VPN gateway for secure and private on-premises access to cloud resources
{: #vpc-site2site-vpn}

IBM offers a number of ways to securely extend an on-premises computer network with resources in the IBM cloud. This allows you to benefit from the elasticity of provisioning servers when you need them and removing them when no longer required. Moreover, you can easily and securely connect your on-premises capabilities to the {{site.data.keyword.cloud_notm}} services.

This tutorial walks you through connecting an on-premises Virtual Private Network (VPN) gateway to a cloud VPN created within a VPC (a VPC/VPN gateway). First, you will create a new {{site.data.keyword.vpc_full}} (VPC) and the associated resources like subnets, network Access Control Lists (ACLs), Security Groups and Virtual Server Instance (VSI).
The VPC/VPN gateway will establish an [IPsec](https://en.wikipedia.org/wiki/IPsec) site-to-site link to an on-premises VPN gateway. The IPsec and the [Internet Key Exchange](https://en.wikipedia.org/wiki/Internet_Key_Exchange), IKE, protocols are proven open standards for secure communication.

To further demonstrate secure and private access, you will deploy a microservice on a VSI to access {{site.data.keyword.cos_short}} (COS), representing a line of business application.
The COS service has a direct endpoint that can be used for private no cost ingress/egress when all access is within the same region of the {{site.data.keyword.cloud_notm}}. An on-premises computer will access the COS microservice. All traffic will flow through the VPN and hence privately through {{site.data.keyword.cloud_notm}}.

There are many popular on-premises VPN solutions for site-to-site gateways available. This tutorial utilizes the [strongSwan](https://www.strongswan.org/) VPN Gateway to connect with the VPC/VPN gateway. To simulate an on-premises data center, you will install the strongSwan gateway on a VSI in {{site.data.keyword.cloud_notm}}.

{:shortdesc}
In short, using a VPC you can

- connect your on-premises systems to services and workloads running in {{site.data.keyword.cloud_notm}},
- ensure private and low cost connectivity to COS,
- connect your cloud-based systems to services and workloads running on-premises.

## Objectives
{: #objectives}

* Access a virtual private cloud environment from an on-premises data center or (virtual) private cloud.
* Securely reach cloud services using private service endpoints.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.vpn_full}}](https://{DomainName}/vpc/provision/vpngateway)
- [{{site.data.keyword.cos_full}}](https://{DomainName}/catalog/services/cloud-object-storage)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
Although there are no networking charges for accessing COS from the micro service in this tutorial, standard networking charges for access to the VPC will be incurred.

## Architecture
{: #architecture}

The following diagram shows the virtual private cloud containing an app server. The app server hosts a microservice interfacing with {{site.data.keyword.cos_short}} service. A (simulated) on-premises network and the virtual cloud environment are connected via VPN gateways.

![Architecture](images/solution46-vpc-vpn/ArchitectureDiagram.png)

1. The infrastructure (VPC, Subnets, Security Groups with rules, Network ACL and VSIs) are set up using a provided script.
2. The microservice interfaces with {{site.data.keyword.cos_short}} through a direct endpoint.
3. A VPC/VPN Gateway is provisioned to expose the virtual private cloud environment to the on-premises network.
4. The Strongswan open source IPsec gateway software is used on-premises to establish the VPN connection with the cloud environment.

## Before you begin
{: #prereqs}

- Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview). You need the optional CLI infrastructure plugin.
- Login to {{site.data.keyword.cloud_notm}} via the command line. See [CLI Getting Started](https://{DomainName}/docs/cli/reference/ibmcloud?topic=cloud-cli-ibmcloud-cli) for details.
- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/vpc-on-classic?topic=vpc-on-classic-managing-user-permissions-for-vpc-resources).
- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/vpc?topic=vpc-getting-started-with-ibm-cloud-virtual-private-cloud-infrastructure#prerequisites).
- Install [**jq**](https://stedolan.github.io/jq/download/). It is used by the provided scripts to process JSON output.

## Deploy a virtual app server in a virtual private cloud
In the following, you will download the scripts to set up a baseline VPC environment and code for a microservice to interface with the {{site.data.keyword.cos_short}}. Thereafter, you will provision the {{site.data.keyword.cos_short}} service and set up the baseline.

### Get the code
{: #setup}
The tutorial uses scripts to deploy a baseline of infrastructure resources before you create the VPN gateways. These scripts and the code for the microservice is available in a GitHub repository.

1. Get the application's code:
   ```sh
   git clone https://github.com/IBM-Cloud/vpc-tutorials
   ```
   {: codeblock}
2. Go to the scripts for this tutorial by changing into **vpc-tutorials**, then **vpc-site2site-vpn**:
   ```sh
   cd vpc-tutorials/vpc-site2site-vpn
   ```
   {: codeblock}

### Create services
In this section, you will login to {{site.data.keyword.cloud_notm}} on the CLI and create an instance of {{site.data.keyword.cos_short}}.

1. Verify that you have followed the prerequisite steps of logging in
    ```sh
    ibmcloud target
    ```
    {: codeblock}
2. Create an instance of [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage) using a **standard** or **lite** plan.
   ```sh
   ibmcloud resource service-instance-create vpns2s-cos cloud-object-storage lite global
   ```
   {: codeblock}

   Note that only one lite instance can be created per account. If you already have an instance of {{site.data.keyword.cos_short}}, you can reuse it.
   {: tip}

3. Create a service key with role **Reader**:
   ```sh
   ibmcloud resource service-key-create vpns2s-cos-key Reader --instance-name vpns2s-cos
   ```
   {: codeblock}
4. Obtain the service key details in JSON format and store it in a new file **credentials.json** in the subdirectory **vpc-app-cos**. The file will be used later on by the app.
   ```sh
   ibmcloud resource service-key vpns2s-cos-key --output json > vpc-app-cos/credentials.json
   ```
   {: codeblock}


### Create a Virtual Private Cloud baseline resources
{: #create-vpc}
The tutorial provides a script to create the baseline resources required for this tutorial, i.e., the starting environment. The script can either generate that environment in an existing VPC or create a new VPC.

In the following, create these resources by configuring and then running a setup script. The script incorporates the setup of a bastion host as discussed in [securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server).

1. Copy over the sample configuration file into a file to use:

   ```sh
   cp config.sh.sample config.sh
   ```
   {: codeblock}

2. Edit the file **config.sh** and adapt the settings to your environment. You need to change the value of **SSHKEYNAME** to the name or comma-separated list of names of SSH keys (see "Before you begin"). Modify the different **ZONE** settings to match your cloud region. All other variables can be kept as is.
3. To create the resources in a new VPC, run the script as follows:

   ```sh
   ./vpc-site2site-vpn-baseline-create.sh
   ```
   {: codeblock}

   To reuse an existing VPC, pass its name to the script in this way. Replace **YOUR_EXISTING_VPC** with the actual VPC name.
   ```sh
   REUSE_VPC=YOUR_EXISTING_VPC ./vpc-site2site-vpn-baseline-create.sh
   ```
   {: codeblock}

4. This will result in creating the following resources, including the bastion-related resources:
   - 1 VPC (optional)
   - 1 public gateway
   - 3 subnets within the VPC
   - 4 security groups with ingress and egress rules
   - 3 VSIs: vpns2s-onprem-vsi (floating-ip is ONPREM_IP), vpns2s-cloud-vsi (floating-ip is VSI_CLOUD_IP) and vpns2s-bastion (floating-ip is BASTION_IP_ADDRESS)

   Note down for later use the returned values for **BASTION_IP_ADDRESS**, **VSI_CLOUD_IP**, **ONPREM_IP**, **CLOUD_CIDR**, and **ONPREM_CIDR**. The output is also stored in the file **network_config.sh**. The file can be used for automated setup.

### Create the Virtual Private Network gateway and connection
In the following, you will add a VPN gateway and an associated connection to the subnet with the application VSI.

1. Navigate to [VPC overview](https://{DomainName}/vpc/overview) page, then click on **VPNs** in the navigation tab and on **New VPN gateway** in the dialog. In the form **New VPN gateway for VPC** enter **vpns2s-gateway** as name. Make sure that the correct VPC, resource group and **vpns2s-cloud-subnet** as subnet are selected.
2. Leave **New VPN connection for VPC** activated. Enter **vpns2s-gateway-conn** as name.
3. For the **Peer gateway address** use the floating IP address of **vpns2s-onprem-vsi** (ONPREM_IP). Type in **20_PRESHARED_KEY_KEEP_SECRET_19** as **Preshared key**.
4. For **Local subnets** use the information provided for **CLOUD_CIDR**, for **Peer subnets** the one for **ONPREM_CIDR**.
5. Leave the settings in **Dead peer detection** as is. Click **Create VPN gateway** to create the gateway and an associated connection.
6. Wait for the VPN gateway to become available (you may need to refresh the screen).
7. Note down the assigned **Gateway IP** address as **GW_CLOUD_IP**.

### Create the on-premises Virtual Private Network gateway
Next, you will create the VPN gateway on the other site, in the simulated on-premises environment. You will use the open source-based IPsec software [strongSwan](https://strongswan.org/).

1. Connect to the "on-premises" VSI **vpns2s-onprem-vsi** using ssh. Execute the following and replace **ONPREM_IP** with the IP address returned earlier.

   ```sh
   ssh root@ONPREM_IP
   ```
   {:pre}

   Depending on your environment, you may need to use `ssh -i <path to your private key file> root@ONPREMP_IP`.
   {:tip}

2. Next, on the machine **vpns2s-onprem-vsi**, execute the following commands to update the package manager and to install the strongSwan software.

   ```sh
   apt-get update
   ```
   {:pre}

   ```sh
   apt-get install strongswan
   ```
   {:pre}

3. Configure the file **/etc/sysctl.conf** by adding three lines to its end. Copy the following over and run it:

   ```sh
   cat >> /etc/sysctl.conf << EOF
   net.ipv4.ip_forward = 1
   net.ipv4.conf.all.accept_redirects = 0
   net.ipv4.conf.all.send_redirects = 0
   EOF
   ```
   {:codeblock}

4. Next, edit the file **/etc/ipsec.secrets**. Add the following line to configure source and destination IP addresses and the pre-shared key configured earlier. Replace **ONPREM_IP** with the known value of the floating ip of the vpns2s-onprem-vsi.  Replace the **GW_CLOUD_IP** with the known ip address of the VPC VPN gateway.

   ```
   ONPREM_IP GW_CLOUD_IP : PSK "20_PRESHARED_KEY_KEEP_SECRET_19"
   ```
   {:pre}

5. The last file you need to configure is **/etc/ipsec.conf**. Add the following codeblock to the end of that file. Replace **ONPREM_IP**, **ONPREM_CIDR**, **GW_CLOUD_IP**, and **CLOUD_CIDR** with the respective known values.

   ```sh
   # basic configuration
   config setup
      charondebug="all"
      uniqueids=yes
      strictcrlpolicy=no

   # connection to vpc/vpn datacenter
   # left=onprem / right=vpc
   conn tutorial-site2site-onprem-to-cloud
      authby=secret
      left=%defaultroute
      leftid=ONPREM_IP
      leftsubnet=ONPREM_CIDR
      right=GW_CLOUD_IP
      rightsubnet=CLOUD_CIDR
      ike=aes256-sha2_256-modp1024!
      esp=aes256-sha2_256!
      keyingtries=0
      ikelifetime=1h
      lifetime=8h
      dpddelay=30
      dpdtimeout=120
      dpdaction=restart
      auto=start
   ```
   {:pre}

6. Restart the VPN gateway, then check its status by running: ipsec restart

   ```sh
   ipsec restart
   ```
   {:pre}
   ```sh
   ipsec status
   ```
   {:pre}

   It should report that a connection has been established. Keep the terminal and ssh connection to this machine open.

## Test the connectivity
You can test the site to site VPN connection by using SSH or by deploying the microservice interfacing {{site.data.keyword.cos_short}}.

### Test using ssh
To test that the VPN connection has been successfully established, use the simulated on-premises environment as proxy to log in to the cloud-based application server.

1. In a new terminal, execute the following command after replacing the values. It uses the strongSwan host as jump host to connect via VPN to the application server's private IP address.

   ```sh
   ssh -J root@ONPREM_IP root@VSI_CLOUD_IP
   ```
   {:pre}

2. Once successfully connected, close the ssh connection.

3. In the "onprem" VSI terminal, stop the VPN gateway:
   ```sh
   ipsec stop
   ```
   {:pre}
4. In the command window from step 1), try to establish the connection again:

   ```sh
   ssh -J root@ONPREM_IP root@VSI_CLOUD_IP
   ```
   {:pre}
   The command should not succeed because the VPN connection is not active and hence there is no direct link between the simulated on-prem and cloud environments.

   Note that depending on deployment details this connection actually still succeeds. The reason is that intra-VPC connectivity is supported across zones. If you would deploy the simulated on-prem VSI to another VPC or to [{{site.data.keyword.virtualmachinesfull}}](/docs/vsi?topic=virtual-servers-about-public-virtual-servers), the VPN would be needed for successful access.
   {:tip}

5. In the "onprem" VSI terminal, start the VPN gateway again:
   ```sh
   ipsec start
   ```
   {:pre}


### Test using a microservice
You can test the working VPN connection by accessing a microservice on the cloud VSI from the onprem VSI.

1. Copy over the code for the microservice app from your local machine to the cloud VSI. The command uses the bastion as jump host to the cloud VSI. Replace **BASTION_IP_ADDRESS** and **VSI_CLOUD_IP** accordingly.
   ```sh
   scp -r  -o "ProxyJump root@BASTION_IP_ADDRESS"  vpc-app-cos root@VSI_CLOUD_IP:vpc-app-cos
   ```
   {:pre}
2. Connect to the cloud VSI, again using the bastion as jump host.
   ```sh
   ssh -J root@BASTION_IP_ADDRESS root@VSI_CLOUD_IP
   ```
   {:pre}
3. On the cloud VSI, change into the code directory:
   ```sh
   cd vpc-app-cos
   ```
   {:pre}
4. Install Python and the Python package manager PIP.
   ```sh
   apt-get update; apt-get install python python-pip
   ```
   {:pre}
5. Install the necessary Python packages using **pip**.
   ```sh
   pip install -r requirements.txt
   ```
   {:pre}
6. Start the app:
   ```sh
   python browseCOS.py
   ```
   {:pre}
7. In the "onprem" VSI terminal, access the service. Replace VSI_CLOUD_IP accordingly.
   ```sh
   curl VSI_CLOUD_IP/api/bucketlist
   ```
   {:pre}
   The command should return a JSON object.

## Remove resources
{: #remove-resources}

1. In the VPC management console, click on **VPNs**. In the action menu on the VPN gateway select **Delete** to remove gateway.
2. Next, click **Floating IPs** in the navigation, then on the IP address for your VSIs. In the action menu select **Release**. Confirm that you want to release the IP address.
3. Next, switch to **Virtual server instances** and **Delete** your instances. The instances will be deleted and their status will remain in **Deleting** for a while. Make sure to refresh the browser from time to time.
4. Once the VSIs are gone, switch to **Subnets**. If the subnet has an attached public gateway, then click on the subnet name. In the subnet details, detach the public gateway. Subnets without public gateway can be deleted from the overview page. Delete your subnets.
5. After the subnets have been deleted, switch to **VPC** and delete your VPC.

When using the console, you may need to refresh your browser to see updated status information after deleting a resource.
{:tip}

## Expand the tutorial
{: #expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- Add a [load balancer](/docs/vpc-on-classic-network?topic=vpc-on-classic-network---using-load-balancers-in-ibm-cloud-vpc) to distribute inbound microservice traffic across multiple instances.
- Deploy the [application on a public server, your data and services on a private host](/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend).


## Related content
{: #related}

- [VPC Glossary](/docs/vpc?topic=vpc-vpc-glossary)
- [IBM Cloud CLI plugin for VPC Reference](/docs/infrastructure-service-cli-plugin?topic=infrastructure-service-cli-vpc-reference)
- [VPC using the REST APIs](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-rest-apis)
- Solution tutorial: [Securely access remote instances with a bastion host](/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server)
