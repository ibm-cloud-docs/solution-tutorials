The need to create a private connection between a remote network environment and servers on {{site.data.keyword.Bluemix_notm}} 
IaaS platform’s private network is a common requirement. Most typically this connectivity supports hybrid workloads, data 
transfers, private workloads or administration of systems on the {{site.data.keyword.Bluemix_notm}}. A site-to-site Virtual 
Private Network (VPN) tunnel is the usual approach to securing connectivity between networks. 

{{site.data.keyword.Bluemix_notm}} provides a number of options for site-to-site data center connectivity, either using a 
VPN over the public internet or via a private dedicated network connection. 

See [IBM Cloud Direct Link]( https://console.bluemix.net/docs/infrastructure/direct-link/getting-started.html#get-started-with-ibm-cloud-direct-link) 
for more details on dedicated secure network links to the {{site.data.keyword.Bluemix_notm}} IaaS platform. Alternatively a 
VPN over the public internet provides a lower cost option, though without bandwidth guarantees. 

There are two suitable VPN options for connectivity over the public internet to servers provisioned on the IaaS platform:

-	[IPSEC VPN]( https://console.bluemix.net/catalog/infrastructure/ipsec-vpn)
-	[Virtual Router Appliance VPN](https://console.bluemix.net/docs/infrastructure/virtual-router-appliance/about.html#virtual-private-network-vpn-gateway)

This tutorial presents setup of a site-to-site IPSec VPN using a Virtual Router Appliance (VRA) to connect a subnet in 
a client data center to a secured subnet on the {{site.data.keyword.Bluemix_notm}}private network. 

This example builds on the secure private network enclosure documented in tutorial xxxxxxxx. It uses a site-to-site IPSec 
VPN, GRE tunnel and static routing. More complex VPN configurations that use dynamic routing (BGP etc) and VTI tunnels can 
be found in the [supplemental VRA documentation]( https://console.bluemix.net/docs/infrastructure/virtual-router-appliance/vra-docs.html#supplemental-vra-documentation).
{:shortdesc}

## Objectives
{: #objectives}

-	Document configuration parameters for IPSec VPN
-	Configure IPSec VPN on a VRA
-	Create GRE tunnel
-	Create static IP route

## Services used
{: #products}

This tutorial uses the following {{site.data.keyword.Bluemix_notm}} services: 

•	[Virtual Router Appliance VPN](https://console.bluemix.net/docs/infrastructure/virtual-router-appliance/about.html#virtual-private-network-vpn-gateway)

**Attention:** This tutorial might incur costs. The VRA is only available on a monthly pricing plan. Use the 
[Pricing Calculator](https://console.bluemix.net/pricing/)  to generate a cost estimate based on your projected usage.

  
## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/sec-priv-vpn.png)
</p>

1.	Document VPN Configuration
2.	Create IPSec VPN on a VRA
3.	Configuration of data center VPN and tunnel
4.	Create GRE tunnel
5.	Create static IP route
6.	Configure firewall 

## Before you begin
{: #prereqs}

This tutorial connects the secure private network enclosure created by tutorial XXXX to your data center. That tutorial 
must be completed first. 


## Document VPN configuration
{: #Document_VPN}

Configuring an IPSec VPN site-to-site link between your data center and {{site.data.keyword.Bluemix_notm}} requires 
coordination with your onsite networking team to determine many of the configuration parameters, the type of tunnel and 
routing choice. The parameters have to be in exact accordance for an operational VPN connection. Typically your onsite 
networking team will specify the configuration to match agreed corporate standards and provide you with the necessary 
local IP addresses of the VPN, and accessible subnet address ranges. 

Before commencing setup of the VPN, the IP addresses of the and subnet ranges must be determined and available for the data 
center VPN configuration and for the secure private network enclosure in the {{site.data.keyword.Bluemix_notm}}. These are 
illustrated in the following figure, where the App zone in the secure enclosure will be connected via the IPSec tunnel to 
systems in the ‘DC IP Subnet’ in the client data center.   

 

The following parameters must be agreed and documented between the {{site.data.keyword.Bluemix_notm}} user and the networking 
team for the client data center. In this example the Remote and Local tunnel IP addresses are set to 192.168.1.1 and 
192.168.1.2. Any arbitrary subnet may be used with agreement of the on-site networking team. (192.168.1.1/24).


| Item  | Description |
|:------ |:--- | 
| \<ike group name\> | Name given to the IKE group for the connection. |
| \<ike encryption\> | Agreed ike encryption standard between IBM Cloud and client data center, typically ‘aes256’. |
| \<ike hash\> | Agreed ike hash between IBM Cloud and client data center, typically ‘sha1’. |
| \<ike-lifetime\> | Ike lifetime from client data center, typically 3600. |
| \<esp group name\> | Name given to ESP group for the connection. |
| \<esp encryption\> | Agreed esp encryption standard between IBM Cloud and client data center, typically ‘aes256’. |
| \<esp hash\> | Agreed esp hash between IBM Cloud and client data center, typically ‘sha1’. |
| \<esp-lifetime\> | Esp lifetime from client data center, typically 1800. |
| \<DC VPN Public IP\>  | Internet facing public IP address of the VPN gateway at the client data centre. | 
| \<VRA Public IP\> | Public IP address of the VRA created earlier. |
| \<Remote tunnel IP\/24\> | IP address assigned to remote end of IPSec tunnel. Pair of IP address in range that does not conflict with IP Cloud or client data center.  192.168.1.1/24. |
| \<Local tunnel IP\/24\> | IP address assigned to local end of IPSec tunnel.  192.168.1.2/24. |
| \<DC Subnet/CIDR\> | IP address of subnet to be accessed in client data center and CIDR. |
| \<App Zone subnet/CIDR\> | Network IP address and CIDR of the App Zone subnet created with the VSI. | 
| \<Shared-Secret\> | Shared encryption key to be used between IBM Cloud and client data center. |


## Configure IPSec VPN on a VRA
{: #Configure_VRA_VPN}

To create the VPN on the {{site.data.keyword.Bluemix_notm}}, the commands and all the variables that need to changed, are 
highlighted below. The changes are identified line by line, for each line that needs to be changed. Values come from the 
table. 

1. SSH into VRA and enter \[edit\] mode.

```bash
SSH vyatta@<VRA Private IP Address>
configure
```
{: codeblock}

2. Create Internet Key Exchange (IKE) group.

```
set security vpn ipsec ike-group <ike group name> proposal 1
set security vpn ipsec ike-group <ike group name> proposal 1 encryption <ike encryption>
set security vpn ipsec ike-group <ike group name> proposal 1 hash <ike hash>
set security vpn ipsec ike-group <ike group name> proposal 1 dh-group 2
set security vpn ipsec ike-group <ike group name> lifetime <ike-lifetime>
```
{: codeblock}

3. Create Encapsulating Security Payload (ESP) group

```
set security vpn ipsec esp-group <esp group name> proposal 1 encryption <esp encryption>
set security vpn ipsec esp-group <esp group name> proposal 1 hash <esp hash>
set security vpn ipsec esp-group <esp group name> lifetime <esp-lifetime>
set security vpn ipsec esp-group <esp group name> mode tunnel
set security vpn ipsec esp-group <esp group name> pfs enable
```
{: codeblock}

4. Define site-to-site connection

```
set security vpn ipsec site-to-site peer <DC VPN Public IP>   authentication mode pre- shared-secret
set security vpn ipsec site-to-site peer <DC VPN Public IP>  authentication pre-shared-secret <Shared-Secret>
set security vpn ipsec site-to-site peer <DC VPN Public IP>  connection-type initiate
set security vpn ipsec site-to-site peer <DC VPN Public IP>  ike-group <ike group name>
set security vpn ipsec site-to-site peer <DC VPN Public IP>  local-address <VRA Public IP>
set security vpn ipsec site-to-site peer <DC VPN Public IP>  default-esp-group <esp group name>
commit
save
```
{: codeblock}


## Configure data center VPN and tunnel
{: #Configure_DC_VPN}

1. The network team at the client data centre will configure an identical IPSec VPN connection with the <DC VPN Public IP> 
and <VRA Public IP> swapped, the local and remote tunnel address and also the <DC Subnet/CIDR> and <App Zone subnet/CIDR> 
parameters swapped. The specific configuration commands at the client data center will depend on the vendor of the VPN. 

2. When data center configuration is complete, the IPSec link should come up automatically. Verify the status of the 
connection from the VRA operational command line:

```bash
show vpn ipsec sa
show vpn ipsec status
```
{: codeblock}

3. If the link is not been created, validate that the local and remote addresses have been correctly specified and other 
parameters:

``` bash
show vpn debug 
```
{: codeblock}

## Define GRE tunnel 
{: #Define_Tunnel}

1. Create the GRE tunnel in VRA edit mode.

```
set interfaces tunnel tun0 address <Local tunnel IP/24>
set interfaces tunnel tun0 encapsulation gre
set interfaces tunnel tun0 local-ip <VRA Public IP>
set interfaces tunnel tun0 local-ip <DC VPN Public IP>
commit
```
{: codeblock}


2. Check the operations state of tunnel from VRA ops mode.

```bash
show interfaces tunnel
show interfaces tun0
```
{: codeblock}


## Create static IP route
{: #Define_Routing}

Create the VRA routing to direct traffic to the remote subnet via the tunnel.  

1.	Create static route in VRA edit mode.

```
set protocols static route <DC Subnet/CIDR>  next-hop <Remote tunnel IP> 
```
{: codeblock}

2.	Check VRA routing table from ops mode. At this time no traffic will transverse the route as no firewall rules exist 
to allow traffic via the tunnel. Rules are bi-directional.

```bash
show ip route
```
{: codeblock}


## Configure firewall
{: #Configure_firewall}

1.	Create firewall rules for traffic to the remote subnet in VRA edit mode.

```
set security firewall name APP-TO-TUNNEL action drop 
set security firewall name APP-TO-TUNNEL default-log 

set security firewall name APP-TO-TUNNEL rule 100 action accept 
set security firewall name APP-TO-TUNNEL rule 100 protocol tcp
set security firewall name APP-TO-TUNNEL rule 100 destination port 22
set security firewall name APP-TO-TUNNEL rule 100 destination port 80
set security firewall name APP-TO-TUNNEL rule 100 destination port 443

set security firewall name APP-TO-TUNNEL rule 110 action drop 
set security firewall name APP-TO-TUNNEL rule 110 protocol udp

set security firewall name APP-TO-TUNNEL rule 200 protocol icmp
set security firewall name APP-TO-TUNNEL rule 200 icmp type 8
set security firewall name APP-TO-TUNNEL rule 200 action accept 
commit
```
{: codeblock}

```
set security firewall name TUNNEL-TO-APP action drop 
set security firewall name TUNNEL-TO-APP default-log 

set security firewall name TUNNEL-TO-APP rule 100 action accept 
set security firewall name TUNNEL-TO-APP rule 100 protocol tcp
set security firewall name TUNNEL-TO-APP rule 100 destination port 22
set security firewall name TUNNEL-TO-APP rule 100 destination port 80
set security firewall name TUNNEL-TO-APP rule 100 destination port 443


set security firewall name TUNNEL-TO-APP rule 110 action drop 
set security firewall name TUNNEL-TO-APP rule 110 protocol udp

set security firewall name TUNNEL-TO-APP rule 200 protocol icmp
set security firewall name TUNNEL-TO-APP rule 200 icmp type 8
set security firewall name TUNNEL-TO-APP rule 200 action accept 
commit
```
{: codeblock}


2.	Create Zone for tunnel and associate firewalls for traffic initiated in either zone.  

```
set security zone-policy zone TUNNEL description "GRE Tunnel"
set security zone-policy zone TUNNEL default-action drop
set security zone-policy zone TUNNEL interface tun0

set security zone-policy zone TUNNEL to APP firewall TUNNEL-TO-APP 
set security zone-policy zone APP to TUNNEL firewall APP-TO-TUNNEL 
commit
save
```
{: codeblock}

3.	To validate the APP-TO_TUNNEL firewall is now allowing ICMP and udp/tcp traffic, login to the local VSI using SSH and 
ping the gateway address of the remote subnet.

```bash
ssh root@<VSI Private IP>
ping <Remote Subnet Gateway IP>
```
{: codeblock}

This completes setup of the VPN from the secure private network enclosure. Additional tutorials in this series illustrate how the enclosure can access services on the public internet. 


## Remove resources
{:removeresources}
Steps to take to remove the resources created in this tutorial. 

The VRA is on a monthly paid plan. Cancellation does not result in a refund. It is suggested to only cancel if this VRA will not be required again in the next month. If a dual VRA High-Availability cluster is required, this single VRA can be upgraded on the [Gateway Details](https://control.bluemix.net/network/gateways/371923) page.{tip}  

1. Cancel any virtual servers or bare-metal servers
2. Cancel the VRA
3. Cancel any additional VLANs by support ticket. 

## Related content
{:related}
- [IBM Virtual Router Appliance](https://console.bluemix.net/docs/infrastructure/virtual-router-appliance/vra-basics.html#vra-basics)
- [Static and Portable IP Subnets](https://console.bluemix.net/docs/infrastructure/subnets/about.html)
- [Vyatta documentation](https://console.bluemix.net/docs/infrastructure/virtual-router-appliance/vra-docs.html#supplemental-vra-documentation)
- [Brocade Vyatta Network OS IPsec Site-to-Site VPN Configuration Guide, 5.2R1](https://public.dhe.ibm.com/cloud/bluemix/network/vra/vyatta-network-os-5.2r1-ipsec-vpn.pdf)
- [Brocade Vyatta Network OS Tunnels Configuration Guide, 5.2R1](https://public.dhe.ibm.com/cloud/bluemix/network/vra/vyatta-network-os-5.2r1-tunnels.pdf)
