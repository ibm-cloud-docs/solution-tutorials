# VMware as a Service
## About
<p>The purpose of this guide is to provide a quick guided tutorial that can be used both internally and externally to demonstrate the basic initial steps of operationalizing a VMware as a Service – single tenant instance after provisioning. The steps that follow will create a basic working environment for a client, providing a network, basic firewall and network address translation (NAT) implementation, and a test virtual machine that demonstrates that the end-to-end environment is functional.</p>
<br>
<p>This guide is broken into five steps to make implementation easier. These steps are:</p>

1.	[Log into the instance and deploy the initial network](#vmwaas-tag-01loginandnet)
2.	[Create a NAT rule to allow virtual machines to access the Internet](#vmwaas-tag-02createnat)
3.	[Create an IP set](#vmwaas-tag-03createip) 
4.	[Create a firewall rule to allow the initial network to access resources outside the instance](#vmwaas-tag-04fwrules) 
5.	[Create a virtual machine and validate the deployment](#vmwaas-tag-05createvm) 
<br>
<p>This guide should take around ten minutes to complete and assumes VMware as a Service – single tenant has already been provisioned.</p>

<br>
<br>

### 1.	Log into the instance and deploy the initial network {#vmwaas-tag-01loginandnet}
<br>
<p>The first step is to log into your VMware as a Service – single tenant instance and deploy the initial network that will be used for testing.</p> 

To log in and deploy the initial network: 
o	From the instance log in page, log in using admin as the user ID and the password as provided in the IBM Cloud portal.

o	In the top menu navigation click on Networking.

o	Click on New to create a new virtual data center network. The New Organization VDC Network wizard will appear. 

o	Select Organization Virtual Data Center (Default) and then select the VDC you wish to deploy the new network to. In most cases there will be a single VDC. In the example vdcdal is used. Click Next to continue.

o	Leave the network type as Routed (default) and click Next to continue.

o	For Edge Connection select the edge that was provisioned for you and leave all other settings as default. Click Next to continue.

o	Provide a name and the gateway CIDR for the new network. The gateway CIDR is a bring your own IP deployment. Therefore, this IP address can either be related to your internal network or created specifically for IBM Cloud. The recommendation is to use a non-routable RFC-1918 address such as an IP subnet from the 10.0.0.0/8 range or another non-routable range. In the example test-network is used as the name and 192.168.100.1/24 is used for the gateway CIDR. Click Next to continue.

o	Create a static IP pool for your new network. While optional, a static IP pool allows virtual machines to automatically be assigned an IP address upon provisioning. For the purposes of this guide a small static IP pool is created for testing. This pool should be part of the subnet created during the previous step. In the example 192.168.100.2 – 192.168.100.10 is used. 

To add a static IP pool, type the range in the box provided and click on Add. Click Next to continue when complete. 

o	For DNS use the IBM Cloud public DNS servers, which are 161.26.0.10 and 161.26.0.11 respectively. The DNS suffix can be left blank. Click Next to continue.

---MISSING STEP---
Segment Profile Template
Choose a profile template that will define a set of custom profiles to be applied on the network.

Custom segments profiles are needed in a number of specific situations. These include, but are not limited to:

    MAC or IP learning needs to be enabled for nested environments
    Custom security profiles to allow for DHCP traffic originating from a network
    Custom security profiles for HCX
    Enabling spoof guards
    Defining QoS on specific networks

o	Review your input and click Finish to complete the New Organization VDC Network wizard and create your test network. 

Upon completion your new network will be deployed and will appear in the networks tab. This may take a few seconds to complete.


### 2.	Create a NAT rule to allow virtual machines to access the Internet {#vmwaas-tag-02createnat}

The next step is to create a NAT rule to allow your virtual machines to access the public Internet.  

To create a NAT rule: 
o	From the Networking tab, click on Edge Gateways.

o	Click on the name of your default edge gateway.

o	In the left-hand navigation under Services, click on NAT. 

o	Click on New to create a new NAT rule.

o	The Add NAT Rule wizard will appear. There are four fields that must be filled out. 
	Name – In the example test-nat-rule is used.
	Interface type – Select SNAT (source NAT) as the interface type.
	External IP – Input one of the public IP addresses provided by IBM Cloud to your instance. You may click on the information button to the right of the field to see these IP addresses. In the example 150.240.132.162 is used.
	Internal IP – This is the CIDR range of the network you created in the previous step. In the example 192.168.100.0/24 is used. 

Click Save when complete. The new NAT rule will be created. 

Stay on this screen and proceed to the next step.

### 3.	Create an IP set {#vmwaas-tag-03createip}

The next step is to create an IP set. This IP set is used as part of configuration of the firewall rules and is required. Unlike other firewalls IBM Cloud for VMware Solutions – single tenant uses static groups and IP sets to configure firewalls. 

To create an IP set: 
o	From the previous step, click on IP Sets.

o	Click on new to create a new IP set.

o	In the new IP set window, select a name and the IP range for this IP set. In the example test-ip-set is used as the name and 192.168.100.0/24 (same as the network created in step one) is used. Click add to add the IP set then click Save to complete the window. The new IP set will be added.

Stay on this screen and proceed to the next step.

### 4.	Create a firewall rule. {#vmwaas-tag-04fwrules}

The next step is to create a firewall rule. By default, the VMware as a Service – single tenant instance has been provisioned with a default firewall rule that will drop all traffic to ensure security. An additional rule must be put in place to allow the traffic from the previously created network to access the Internet.

To create a firewall rule: 
o	From the previous step, click on Firewall.

o	Click on Edit Rules.

o	Click on New on Top to create a new firewall rule above the default drop all rule.

o	A new entry in the firewall rule list will be created. This entry needs to be completed. To complete the entry:
	Name – In the example test-fw-rule is used.
	Source – click on the pencil icon next to source and select the test-ip-rule created in the previous step. Click on Keep when complete. 
	Destination – click on the pencil icon next to destination and toggle the slider next to Any destination to green (enabled). Click on Keep when complete. 

Review the inputs and click on Save when complete. The new firewall rule will be created. 

Stay on this screen and proceed to the next step.

### 5.	Create a virtual machine and validate deployment {#vmwaas-tag-05createvm}

The final step is to create a virtual machine that will be used to test and validate the deployment. 

To create a virtual machine: 

o	In the top menu navigation click on Applications.

o	Click on Virtual Machines in the sub navigation tabs. 

o	Click on New VM to launch the new virtual machine window. 

o	Select the target virtual data center and click on Next to continue.

o	The new VM wizard will appear. There are five fields that must be filled out. Note depending on the size of your display you may need to scroll down to see all fields.
	Name – In the example testvm is used.
	Computer name – This field is auto-populated from the name. In the example testvm is used.
	Templates – For this example the vm-centos7 template is used.
	Storage policy – The values here depend on what was provisioned in the instance. In the example 4 IOPS/GB is used (VDC Default). 
	NICs – Check the box for connected and then in the drop-down field below network select the network created in the first step, test-network in the example. In the drop-down field below IP mode select Static-IP Pool. 

Leave all other values at their defaults and click OK when complete. The new virtual machine will be created.

Provisioning of the virtual machine may take several minutes to complete. When complete the virtual machine will power on and show as Powered On.

o	Prior to logging into the virtual machine for the first time you will need to get the provisioned password. To do so click on Details on the virtual machine.

Click on Guest OS Customizations.

o	Click on Edit. 

o	Under Specify Password will list the password auto generated during virtual machine provisioning. Copy this password to a safe space to be used upon initial login. Click on Discard when this password has been saved.

o	Click on Launch Web Console to open a local console to the virtual machine.

o	Using the web console, log into the virtual machine using root as the user ID and the password you captured from the previous step. You should then be able to ping Internet resources such as www.ibm.com, showing that the networking is complete and working. 

This completes this guide. To remove the resources provisioned simply reverse the steps provided, choosing delete at each step. 

<!-- comment for copy paste caracters like: #  -->


