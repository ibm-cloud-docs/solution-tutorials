---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2021-01-05"
lasttested: "2019-03-08"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: service1, service2
account-plan: paid
completion-time: 1h
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
{:pre: .pre}
{:deprecated: .deprecated}
{:important: .important}
{:note: .note}
{:tip: .tip}
{:preview: .preview}
{:beta: .beta}

# Deploy DNS for a VMware Deployment
{: #vpc-bm-vmware-dns}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

In this tutorial, you will deploy DNS service for a VMware Deployment in VPC.
{:shortdesc}

Important. This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives). 
{:important}

## Objectives
{: #vpc-bm-vmware-dns-objectives}

In this example, [IBM Cloud DNS service](https://cloud.ibm.com/docs/dns-svcs?topic=dns-svcs-getting-started) is used as the DNS solution for the VMware Deployment.

![Deploying DNS service for a VMware Deployment](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-DNS.svg "Deploying DNS service for a VMware Deployment"){: caption="Figure 1. Deploying DNS service for a VMware Deployment" caption-side="bottom"}

1. Provision IBM Cloud DNS service
2. Provision a Zone
3. Create DNS records
4. Validate DNS records


## Before you begin
{: #vpc-bm-vmware-dns-prereqs}

This tutorial requires:
* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

Important. This tutorial is part of series, and requires that you have completed the related tutorials.
{:important}

Make sure you have successfully completed the required previous steps
* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)

[Login](https://cloud.ibm.com/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region.


## Setup target resource group
{: #vpc-bm-vmware-dns-rg}
{: step}

First, specify the target resource group for the DNS service. You can list the available resource groups with the following command.

```bash
$ ibmcloud resource groups
Retrieving all resource groups under account 1b0834ebce7f4b94983d856f532ebfe2 as xxx@yyy.com...
OK
Name           ID                                 Default Group   State   
Default        28b0e7d18da9417ea85b2ba308088657   true            ACTIVE 
```

The 'Default' resource group is used here, but you may well use another resource group.

```bash
VMWARE_DNS_RG=$(ibmcloud resource groups --output json | jq -r '.[] | select(.name == "Default")'.id)
ibmcloud target -g $VMWARE_DNS_RG
```

## Provision IBM Cloud DNS service
{: #vpc-bm-vmware-dns-provision}
{: step}

Get the plan ID for the DNS service.

```bash
$ ibmcloud dns plans 
Retrieving plans for service 'dns-svcs' ...
OK
                                                     
Name       dns-svcs                               
ID         b4ed8a30-936f-11e9-b289-1d079699cbe5   
Endpoint   api.dns-svcs.cloud.ibm.com             
Plans                                             
           Name                                   ID   
           standard-dns                           2c8fa097-d7c2-4df2-b53e-2efb7874cdf7 
```

Use the 'standard-dns' plan, and record it for future use.

```bash
DNS_PLAN=2c8fa097-d7c2-4df2-b53e-2efb7874cdf7
```

Create the DNS service using the 'standard-dns' plan. Get its ID and set it as a default DNS target.

```bash
VMWARE_DNS=$(ibmcloud dns instance-create dns-vmware $DNS_PLAN --output json | jq -r .id)
ibmcloud dns instance-target $VMWARE_DNS
```

## Provision a Zone
{: #vpc-bm-vmware-dns-zone}
{: step}

Provision a zone. In this example 'vmware.ibmcloud.local' is used, but you may modify this to fit your needs.

```bash
VMWARE_DNS_ZONE_NAME=vmware.ibmcloud.local
VMWARE_DNS_ZONE=$(ibmcloud dns zone-create $VMWARE_DNS_ZONE_NAME -d "Zone for VMware on VPC" --output json | jq -r .id)
```

Add your previously created VPC in the permitted networks. Use the VPC CRN here.

```bash
ibmcloud dns permitted-network-add $VMWARE_DNS_ZONE --vpc-crn $VMWARE_VPC_CRN
```

## Create DNS records
{: #vpc-bm-vmware-dns-record}
{: step}

To create DNS records the following provides a reference for the record creation via CLI.

```bash
$ ibmcloud dns resource-record-create --help
NAME:
   resource-record-create - Create a resource record.

USAGE:
   dns resource-record-create DNS_ZONE_ID (-r, --record-content @JSON_FILE | JSON_STRING) [-i, --instance INSTANCE_NAME | INSTANCE_ID] [--output FORMAT]
   dns resource-record-create DNS_ZONE_ID --type A --name NAME --ipv4 IP_ADDRESS [--ttl TTL]
   dns resource-record-create DNS_ZONE_ID --type AAAA --name NAME --ipv6 IP_ADDRESS [--ttl TTL]
   dns resource-record-create DNS_ZONE_ID --type CNAME --name NAME --cname CNAME [--ttl TTL]
   dns resource-record-create DNS_ZONE_ID --type PTR --name NAME --ptrdname PTRDNAME [--ttl TTL]
   dns resource-record-create DNS_ZONE_ID --type TXT --name NAME --text TEXT [--ttl TTL]
   dns resource-record-create DNS_ZONE_ID --type MX --name NAME --exchange EXCHANGE --preference PREFERENCE [--ttl TTL]
   dns resource-record-create DNS_ZONE_ID --type SRV --name NAME --service SERVICE --protocol PROTOCOL --priority PRIORITY --weight WEIGHT --port PORT --target TARGET  [--ttl TTL]

ARGUMENTS:  
   DNS_ZONE_ID is the id of DNS zone.
  
OPTIONS:
      --name value              Resource record name.
      --type value              Resource record type.
      --ipv4 value              IPv4 address.
      --ipv6 value              IPv6 address.
      --cname value             Canonical name.
      --ptrdname value          Hostname of the relevant A or AAAA record.
      --text value              Human readable text.
      --exchange value          Hostname of Exchange server.
      --preference value        Preference of the MX record
      --service value           The symbolic name of the desired service, start with an underscore (_).
      --protocol value          The symbolic name of the desired protocol.
      --port value              Port number of the target server.
      --weight value            Weight of distributing queries among multiple target servers.
      --priority value          Priority of the SRV record.
      --target value            Hostname of the target server.
      --ttl value               Time to live in second. Default value is 900.  Valid values: 60, 120, 300, 600, 900, 1800, 3600, 7200, 18000, 43200.
  -r, --record-content value    The JSON file or JSON string used to describe a DNS Resource Record.
                                For detailed JSON description, please refer to: https://cloud.ibm.com/docs/dns-svcs?topic=dns-svcs-cli-plugin-dns-services-cli-commands#required-fields-r-record-content.
  -i, --instance value          Instance name or ID. If not set, the context instance specified by 'dns instance-target INSTANCE' will be used.
      --output value            Specify output format, only JSON is supported now.
  -h, --help                    help for resource-record-create
```

E.g. when creating A records for your previously created Zone 'vmware.ibmcloud.local', you can use the following CLI commnd:

```bash
ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name NAME --ipv4 IP_ADDRESS
```

In this example, IBM Cloud VPC allocates the IP addresses for the instances and network interfaces from the prefix/subnets you provisioned in the previous phase. During the process you need to create the following A records and with the IP addresses allocated by VPC. Alternatively, you could create an IP address design and define the IP addresses for PCI NICs and VLAN NICs when you order the bare matal servers and/or VLAN NICs.

The following table summarizes the IP addresses and DNS A-records to be created.

Server type   | Zone                  | A record | IP address
--------------|-----------------------|----------|-----------------
bms-001       | vmware.ibmcloud.local | esx-001  | Allocated by VPC
bms-002       | vmware.ibmcloud.local | esx-002  | Allocated by VPC
bms-003       | vmware.ibmcloud.local | esx-003  | Allocated by VPC
VM - vcenter  | vmware.ibmcloud.local | vcenter  | Allocated by VPC
VM - nsx-mgr  | vmware.ibmcloud.local | nsxmgr-1 | Allocated by VPC
VM - nsx-mgr  | vmware.ibmcloud.local | nsxmgr-2 | Allocated by VPC
VM - nsx-mgr  | vmware.ibmcloud.local | nsxmgr-3 | Allocated by VPC
VIP - nsx-vip | vmware.ibmcloud.local | nsx-vip  | Allocated by VPC

## Validate DNS records
{: #vpc-bm-vmware-dns-validation}
{: step}

To list information about configured zones in your DNS instance 'dns-vmware', use the following command.

```bash
ibmcloud dns zones -i dns-vmware
```

To list information about configured records in your DNS instance 'dns-vmware' and zone 'vmware.ibmcloud.local', use the following command.

```bash
ibmcloud dns resource-records $VMWARE_DNS_ZONE -i dns-vmware 
```

When a DNS record is created during the totorial, validate that you get correct responses from your Windows Jump host, for example using 'nslookup' via Windows command line.

### Example validation using CLI
{: #vpc-bm-vmware-dns-validation-example}

1. List DNS zones:

```bash
ibmcloud dns zones
Listing zones for service instance 'dns-vmware' ...
OK
ID                                     Name                    Status   
78d0bb9b-672e-4f42-93a1-a08ddb9f09b9   vmware.ibmcloud.local   ACTIVE

VMWARE_DNS_ZONE=78d0bb9b-672e-4f42-93a1-a08ddb9f09b9
```

2. List DNS zone details:

```bash
ibmcloud dns zone $VMWARE_DNS_ZONE
Getting zone '78d0bb9b-672e-4f42-93a1-a08ddb9f09b9' for service instance 'dns-vmware' ...
OK
                 
ID            78d0bb9b-672e-4f42-93a1-a08ddb9f09b9   
Name          vmware.ibmcloud.local   
Description   Zone for VMware on VPC   
Label            
State         ACTIVE   
Created On    2021-08-05 17:46:41.913166091 +0000 UTC   
Modified On   2021-08-05 17:47:50.263650443 +0000 UTC 
```  

3. Retrieve list of DNS zone resource records:

```bash
ibmcloud dns resource-records $VMWARE_DNS_ZONE
Listing resource records in zone '78d0bb9b-672e-4f42-93a1-a08ddb9f09b9' for service instance 'dns-vmware' ...
OK
                
Count        3   
TotalCount   3   
Page         1   
Per_Page     200   
                
ID                                       Name                            Type   TTL   Content   
A:6d2a9353-2c64-4eab-9aab-52318c39607a   esx-002.vmware.ibmcloud.local   A      900   10.99.0.5   
A:a0ff286f-ff11-4496-b308-9d3e09a5c564   esx-001.vmware.ibmcloud.local   A      900   10.99.0.4   
A:d9241818-ed51-4c12-9b24-27899e8e9016   vcenter.vmware.ibmcloud.local   A      900   10.99.0.132   

```

4. Verify that you permitted your VPC networks to access and use the DNS service:

```bash
ibmcloud dns permitted-networks $VMWARE_DNS_ZONE
Listing permitted networks for zone '78d0bb9b-672e-4f42-93a1-a08ddb9f09b9' ...
OK
Name                ID                                          Type   VPC CRN                                                                                                            State      
vmw-arch           r010-608ee5e9-bad4-4c28-b179-57482236cac2   vpc    crn:v1:bluemix:public:is:eu-de:a/1b0834ebce7f4b94983d856f532ebfe2::vpc:r010-608ee5e9-bad4-4c28-b179-57482236cac2   ACTIVE   
```
