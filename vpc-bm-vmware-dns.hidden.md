---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-08-27"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, vmwaresolutions, dns-svcs
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
{:tip .tip}
{:preview: .preview}
{:beta: .beta}

# Provision IBM Cloud DNS service for VMware deployment
{: #vpc-bm-vmware-dns}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions, vpc"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

In this tutorial, you will deploy DNS for a VMware Deployment in VPC. IBM Cloud DNS service will be used and your VPC will be configured to access and use the deployed DNS serrvice.
{: shortdesc}

This tutorial is part of [series](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}


## Objectives
{: #vpc-bm-vmware-dns-objectives}

In this tutorial [IBM Cloud DNS service](https://{DomainName}/docs/dns-svcs?topic=dns-svcs-getting-started) is used as the DNS solution for the VMware Deployment.

![Deploying DNS service for a VMware Deployment](images/solution63-ryo-vmware-on-vpc-hidden/Self-Managed-Simple-20210813v1-DNS.svg "Deploying DNS service for a VMware Deployment"){: caption="Figure 1. Deploying DNS service for a VMware Deployment" caption-side="bottom"}

1. Provision IBM Cloud DNS service
2. Provision a Zone
3. Create DNS records
4. Validate DNS records


## Before you begin
{: #vpc-bm-vmware-dns-prereqs}

This tutorial requires:

* Common [prereqs](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in VPC

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a VPC for VMware deployment](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)

[Login](https://{DomainName}/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.


## Provision IBM Cloud DNS service
{: #vpc-bm-vmware-dns-provision}
{: step}

1. Create the DNS service using the 'standard-dns' plan and get its ID.

   ```sh
   VMWARE_DNS=$(ibmcloud dns instance-create dns-vmware standard-dns --output json | jq -r .id)
   ```
   {: codeblock}

2.  Set the DNS as a default DNS target.

   ```sh
   ibmcloud dns instance-target $VMWARE_DNS
   ```
   {: codeblock}


## Provision a Zone
{: #vpc-bm-vmware-dns-zone}
{: step}

1. Provision a zone. In this example 'vmware.ibmcloud.local' is used, but you may modify this to fit your needs.

   ```sh
   VMWARE_DNS_ZONE_NAME=vmware.ibmcloud.local
   ```
   {: codeblock}
   
   ```sh
   VMWARE_DNS_ZONE=$(ibmcloud dns zone-create $VMWARE_DNS_ZONE_NAME -d "Zone for VMware on VPC" --output json | jq -r .id)
   ```
   {: codeblock}

2. Add your previously created VPC in the permitted networks. Use the VPC CRN here.

   ```sh
   ibmcloud dns permitted-network-add $VMWARE_DNS_ZONE --vpc-crn $VMWARE_VPC_CRN
   ```
   {: codeblock}


## Creating DNS records
{: #vpc-bm-vmware-dns-record}
{: step}

DNS records for the ESXi hosts will be created after they will be provisioned in the [next tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms) following the commands provided below.
{: note}

1. To create DNS records via CLI, the following command provides a help for record creation.

   ```sh
   ibmcloud dns resource-record-create --help
   ```
   {: codeblock}

2. Create 'A records' for your previously created Zone 'vmware.ibmcloud.local' using the following CLI commnd:

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name NAME --ipv4 IP_ADDRESS
   ```


## Validate DNS records
{: #vpc-bm-vmware-dns-validation}
{: step}

1. List information about configured zones in your DNS instance 'dns-vmware'. Use the following command.

   ```sh
   ibmcloud dns zones -i dns-vmware
   ```
   {: codeblock}

2. List information about configured records in your DNS instance 'dns-vmware' and zone 'vmware.ibmcloud.local'. Use the following command.

   ```sh
   ibmcloud dns resource-records $VMWARE_DNS_ZONE -i dns-vmware 
   ```
   {: codeblock}

3. Verify that you permitted your VPC networks to access and use the DNS service:

   ```sh
   ibmcloud dns permitted-networks $VMWARE_DNS_ZONE
   ```
   {: codeblock}

4. When a DNS record is created during the tutorial, validate that you get correct responses from your Windows Jump host, for example using 'nslookup' via Windows command line.

   ```sh
   nslookup <hostname>
   ```
   {: codeblock}
