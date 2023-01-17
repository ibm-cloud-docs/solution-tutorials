---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-09-15"
lasttested: "2021-12-08"

content-type: tutorial
services: vmware-service, schematics
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

# Creating a virtual data center in a {{site.data.keyword.vmware-service_short}} single tenant instance
{: #vmware-as-a-service-vdc}
{: toc-content-type="tutorial"}
{: toc-services="vmware, schematics"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->




## Objectives
{: #vmware-as-a-service-vdc-objectives}

The objective of this tutorial is to demonstrate the basic initial steps of operationalizing a {{site.data.keyword.vmware-service_full}} – single tenant instance after instance provisioning. In this tutorial, you will learn how to create virtual data center (VDC) networks and virtual machines. You will also learn how to create network address translation (NAT) and firewall (FW) rules to for you virtual data center edge gateway for basic network connectivity.

![Architecture](images/solution66-vmware-service-intro/vmwaas-example-diagrams-ui-vmwaas-vdc-tutorial.svg){: class="center"}
{: style="text-align: center;"}

This guide is broken into six steps:

1. [Log into the instance's VMware Cloud Director console and deploy networks](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-deploy-network)
2. [Create virtual machines](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-create-vm)
3. [Create an IP set](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-deploy-ip-set) 
4. [Create a NAT rule to allow virtual machines to access the Internet](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-configure-nat)
5. [Create a firewall rule to allow the initial network to access resources outside the instance](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-configure-fw)
6. [Connect to the virtual machine using console](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-connect-to-vm)
7. [Connect to the virtual machine through Internet](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc#vmware-as-a-service-connect-to-vm)

This tutorial should take about 20 minutes to complete and assumes {{site.data.keyword.vmware-service_full}} – single tenant and a virtual data center has already been provisioned.

## Before you begin
{: #vpc-bm-vmware-dns-prereqs}

This tutorial requires:

* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
* [Pre-provisioned {{site.data.keyword.vmware-service_full}} - single tenant instance](https://{DomainName}/docs/vmware-service?topic=vmware-service-tenant-ordering),
* [Pre-provisioned virtual data center on the {{site.data.keyword.vmware-service_full}} - single tenant instance](https://{DomainName}/docs/vmware-service?topic=vmware-service-vdc-adding),
* {{site.data.keyword.cloud_notm}} CLI (optional),
* `jq` to query JSON files (optional), and
* `terraform` to use Infrastructure as Code to provision resources (optional).

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}
<!--#/istutorial#-->


## Log into the instance and deploy the initial network
{: #vpc-bm-vmware-deploy-network}
{: step}

The first step is to log into your {{site.data.keyword.vmware-service_full}} – single tenant instance's VMware Cloud Director console and deploy the initial networks that will be used for testing.

Log in to the {{site.data.keyword.vmware-service_full}} – single tenant instance's VMware Cloud Director console:

1. In the VMware as a Service table, click a VMware as a Service instance name.
2. On the Summary tab, review the information.
3. On the VDC details page, click VMware Cloud Director console to access the console.
4. Use the admin username and password to log in to the VMware Cloud Director console for the first time.
5. After the admin is logged in to the VMware Cloud Director console, you can create extra users who have roles that allow them to access the VMware Cloud Director console.

Create the following virtual data center networks: 

Network type     | Name            | IP subnet
-----------------|-----------------|-------------------
routed network   | `application`   | `192.168.100.1/24`
routed network   | `db`            | `192.168.101.1/24`
isolated         | `isolated_db`   | `192.168.102.1/24`

Routed virtual data center networks are attached to the edge gateway while an isolated virtual data center network is a standalone network without any platform provided routing capabilities. You can create more networks based on your needs following the same instructions.

The recommendation is to use RFC1918 addresses, for example IP subnets from the `10.0.0.0/8`, `172.16.0.0/12` or `192.168.0.0/16` ranges.
{:note}

To create a virtual data center network:

1. In the top menu navigation, click on Networking.
2. Click on New to create a new virtual data center network. The New Organization VDC Network wizard will appear. 
3. Select Organization Virtual Data Center (Default) and then select the VDC you wish to deploy the new network to. In most cases there will be a single VDC, but you could have multiple VDC's, too. Click Next to continue.
4. Select network type as Routed (default) for routed networks `application` and `db` and select Isolated for the `isolated_db` network. Click Next to continue.
5. For Edge Connection, select the edge that was provisioned for you and leave all other settings as default. Isolated networks do not have a gateway connection. Click Next to continue.
6. Provide a name and the gateway CIDR for the new network. The gateway CIDR is a bring your own IP deployment. This IP address can either be related to your internal network or created specifically for {{site.data.keyword.cloud_notm}}. In this example, `application` is used as the name and `192.168.100.1/24` is used for the gateway CIDR. Click Next to continue.
7. Create a static IP pool for your new network. While optional, a static IP pool allows virtual machines to automatically be assigned an IP address upon provisioning. For the purposes of this guide a small static IP pool is created for testing. This pool should be part of the subnet created during the previous step. In this example, `192.168.100.10 – 192.168.100.19` is used. To add a static IP pool, type the range in the box provided and click on Add. Click Next to continue when complete.
8. For DNS use the {{site.data.keyword.cloud_notm}} public DNS servers, which are `161.26.0.10` and `161.26.0.11` respectively. The DNS suffix can be left blank. Click Next to continue.
9. For Segment Profile, leave as default and Click Next to continue.
10. Review your input and click Finish to complete the New Organization VDC Network wizard and create your first VDC network. 

Upon completion of these tasks, your new network will be deployed and will appear in the networks tab. This may take a few seconds to complete. Repeat the process for the other two networks, or more if needed in your solution.


## Create a virtual machine and connect to the virtual machine using console
{: #vpc-bm-vmware-create-vm}
{: step}

In this step, you will create a few virtual machines inside your virtual data center, and you will attach them to the virtual data center networks created in the previous step.

The following virtual machines will be created:

Virtual machine name   | Operating System     | Networks
-----------------------|----------------------|------------------------
`jump-server-1`        | Windows Server 2022  | `application`
`application-server-1` | RedHat Linux         | `application`
`db-server-1`          | RedHat Linux         | `db`, `isolated_db`

The first server will be used as a jump server, which you can optionally reach through the public Internet.

To create a virtual machine:

1. In the top menu navigation click on Applications.
2. Click on Virtual Machines in the sub navigation tabs. 
3. Click on New VM to launch the new virtual machine window. 
4. Select the target virtual data center and click on Next to continue.
5. The new VM wizard will appear. There are five fields that must be filled out. Note depending on the size of your display you may need to scroll down to see all fields.
   Name – `jump-server-1`
   Computer name – This field is auto-populated from the name.
   Templates – For this example the Windows 2022 template is used.
   Storage policy – The values here depend on what was provisioned in the instance. In this example, 4 IOPS/GB is used (VDC Default).
   NICs – Check the box for connected and then in the drop-down field below network select the network created in the first step. In this example, `application` is used. In the drop-down below IP mode, select Static-IP Pool.
6. Leave all other values at their defaults and click OK when complete. 

The new virtual machine will be created. Provisioning of the virtual machine may take several minutes to complete. Upon completion, the virtual machine will power on. Repeat the process for the other virtual machines, `application-server-1` and `db-server-1`.


## Create IP sets and Static Groups
{: #vpc-bm-vmware-deploy-ip-set}
{: step}

IP sets and Static Groups are used as part of configuration of the firewall rules and is required. Unlike with other firewalls, you must use  Static Groups and IP sets to configure firewalls to identify sources and destinations, IP addresses cannot be used directly.

The following IP sets and Static Groups will be created:

Type            | Name                  | Members or IP addresses
----------------|-----------------------|------------------------
IP Set          | `ipset-dnat-to-jump`  | `public-ip-0`
IP Set          | `ipset-snat`          | `public-ip-1`
Static Group    | `sg-private-networks` | `application` and `db`


Before configuring IP sets, find out your Public IP addresses assigned for your virtual data center. You need to [use {{site.data.keyword.cloud_notm}} portal for this](https://{DomainName}/docs/vmware-service?topic=vmware-service-vdc-view-delete).

To create an IP set:

1. From the previous step, click on IP Sets.
2. Click on new to create a new IP set.
3. In the new IP set window, select a name and the IP range for this IP set. In this example, test-ip-set is used as the name and 192.168.100.0/24 (same as the network created in step one) is used. Click add to add the IP set then click Save to complete the window.

To create a Static Group:

1. From the previous step, click on Static Groups.
2. Click on new to create a new Static Group. Click Save.
3. Select the created Static Group and click Manage Members. Select `application` and `db`networks created in the previous step. Click Save.  

Upon completion of these tasks, the new IP sets and Static Groups will be added. Repeat the process for the other two networks, or more if needed in your solution.

## Create a NAT rule to allow virtual machines to access the Internet
{: #vpc-bm-vmware-configure-nat}
{: step}


The next step is to create a NAT rule to allow your virtual machines to access the public Internet.  

To create a NAT rule:

1. From the Networking tab, click on Edge Gateways.
2. Click on the name of your default edge gateway.
3. In the left-hand navigation under Services, click on NAT. 
4. Click on New to create a new NAT rule.
5. The Add NAT Rule wizard will appear. There are four fields that must be filled out. 
	Name – In this example, test-nat-rule is used.
	Interface type – Select SNAT (source NAT) as the interface type.
	External IP – Input one of the public IP addresses provided by {{site.data.keyword.cloud_notm}} to your instance. You may click on the information button to the right of the field to see these IP addresses. In this example, 150.240.132.162 is used.
	Internal IP – This is the CIDR range of the network you created in the previous step. In this example, 192.168.100.0/24 is used. 
6. Click Save when complete.

The new NAT rule will be created. This may take a few seconds to complete. Repeat the process for the other NAT rules, or more if needed in your solution.


## Create a firewall rule
{: #vpc-bm-vmware-configure-fw}
{: step}

The next step is to create a firewall rule. By default, the {{site.data.keyword.vmware-service_full}} – single tenant instance has been provisioned with a default firewall rule that will drop all traffic to ensure security. An additional rule must be put in place to allow the traffic from the previously created network to access the Internet.

To create a firewall rule: 
1. From the previous step, click on Firewall.
2. Click on Edit Rules.
3. Click on New on Top to create a new firewall rule above the default drop all rule.
4. A new entry in the firewall rule list will be created. This entry needs to be completed. To complete the entry:
	Name – In this example, test-fw-rule is used.
	Source – click on the pencil icon next to source and select the test-ip-rule created in the previous step. Click on Keep when complete. 
	Destination – click on the pencil icon next to destination and toggle the slider next to Any destination to green (enabled). Click on Keep when complete. 
5. Review the inputs and click on Save when complete.

The new firewall rule will be created. This may take a few seconds to complete. Repeat the process for the other firewall rules, or more if needed in your solution.


## Connect to the virtual machine using console
{: #vpc-bm-vmware-create-vm}
{: step}

Prior to logging into the virtual machine for the first time you will need to get the provisioned password.

To get the password:

1. Click on Details on the virtual machine.
2. Click on Guest OS Customizations.
3. Click on Edit. 
4. Under Specify Password will list the password auto generated during virtual machine provisioning. Copy this password to a safe space to be used upon initial login. Click on Discard when this password has been saved.
5. Click on Launch Web Console to open a local console to the virtual machine.
6. Using the web console, log into the virtual machine using root as the user ID and the password you captured from the previous step.


## Connect to the virtual machines though Internet and validate connectivity
{: #vpc-bm-vmware-connect-to-vm}
{: step}

The final step is to connect the virtual machine validate the deployment.

To connect to the virtual machine with console
* Using the web console, log into the virtual machine using root as the user ID and the password you captured from the previous step.
* You should then be able to ping Internet resources such as www.ibm.com, showing that the networking is complete and working.
* You should be be able to ping your application server's public IP address, but RDP access should not work.






