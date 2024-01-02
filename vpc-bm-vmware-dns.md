---
subcollection: solution-tutorials
copyright:
  years: 2024
lastupdated: "2024-01-02"
lasttested: ""

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, vmwaresolutions, dns-svcs
account-plan: paid
completion-time: 1h
use-case: ApplicationModernization, Vmware
---
{{site.data.keyword.attribute-definition-list}}


# Provision {{site.data.keyword.dns_full_notm}} for VMware deployment
{: #vpc-bm-vmware-dns}
{: toc-content-type="tutorial"}
{: toc-services="vpc, vmwaresolutions, dns-svcs"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial is part of [series](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-objectives), and requires that you have completed the related tutorials in the presented order.
{: important}

In this tutorial, you will deploy {{site.data.keyword.dns_full_notm}} for a VMware Deployment in {{site.data.keyword.vpc_short}}. {{site.data.keyword.dns_full_notm}} will be used and your {{site.data.keyword.vpc_short}} will be configured to access and use the deployed DNS serrvice.
{: shortdesc}

## Objectives
{: #vpc-bm-vmware-dns-objectives}

In this tutorial [{{site.data.keyword.dns_full_notm}}](/docs/dns-svcs?topic=dns-svcs-getting-started) is used as the {{site.data.keyword.dns_full_notm}} solution for the VMware Deployment.

![Deploying DNS service for a VMware Deployment](images/solution63-ryo-vmware-on-vpc/Self-Managed-Simple-20210813v1-DNS.svg "Deploying DNS service for a VMware Deployment"){: caption="Figure 1. Deploying DNS service for a VMware Deployment" caption-side="bottom"}


## Before you begin
{: #vpc-bm-vmware-dns-prereqs}

This tutorial requires:

* Common [prereqs](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware#vpc-bm-vmware-prereqs) for VMware Deployment tutorials in {{site.data.keyword.vpc_short}}

This tutorial is part of series, and requires that you have completed the related tutorials. Make sure you have successfully completed the required previous steps:

* [Provision a {{site.data.keyword.vpc_short}} for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-vpc#vpc-bm-vmware-vpc)

[Login](/docs/cli?topic=cli-getting-started) with IBM Cloud CLI with username and password, or use the API key. Select your target region and your preferred resource group.

The used variables e.g. $VMWARE_VPC_CRN are defined in the previous steps of this tutorial.
{: note}


## Provision IBM Cloud DNS service
{: #vpc-bm-vmware-dns-provision}
{: step}

1. Create the DNS service using the `standard-dns` plan and get its ID.

   ```sh
   VMWARE_DNS=$(ibmcloud dns instance-create dns-vmware standard-dns --output json | jq -r .id)
   ```
   {: codeblock}

2. Set the DNS as a default DNS target.

   ```sh
   ibmcloud dns instance-target $VMWARE_DNS
   ```
   {: codeblock}


## Provision a Zone
{: #vpc-bm-vmware-dns-zone}
{: step}

1. Provision a zone. In this example `vmware.ibmcloud.local` is used, but you may modify this to fit your needs.

   ```sh
   VMWARE_DNS_ZONE_NAME=vmware.ibmcloud.local
   ```
   {: codeblock}
   
   ```sh
   VMWARE_DNS_ZONE=$(ibmcloud dns zone-create $VMWARE_DNS_ZONE_NAME -d "Zone for VMware on VPC" --output json | jq -r .id)
   ```
   {: codeblock}

2. Add your previously created {{site.data.keyword.vpc_short}} in the permitted networks. Use the {{site.data.keyword.vpc_short}} CRN here.

   ```sh
   ibmcloud dns permitted-network-add $VMWARE_DNS_ZONE --vpc-crn $VMWARE_VPC_CRN
   ```
   {: codeblock}


## Creating DNS records
{: #vpc-bm-vmware-dns-record}
{: step}

DNS records for the ESXi hosts will be created after they will be provisioned in the [next tutorial](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms) following the commands provided below.
{: note}

1. To create DNS records via CLI, the following command provides a help for record creation.

   ```sh
   ibmcloud dns resource-record-create --help
   ```
   {: codeblock}

2. To create `A records` for your previously created Zone `vmware.ibmcloud.local`, you can use the following CLI command (modify the 'NAME' and 'IP_ADDRESS' accordingly):

   ```sh
   ibmcloud dns resource-record-create $VMWARE_DNS_ZONE --type A --name NAME --ipv4 IP_ADDRESS
   ```
   {: codeblock}


## Validate DNS records
{: #vpc-bm-vmware-dns-validation}
{: step}

1. List information about configured zones in your DNS instance `dns-vmware`. Use the following command.

   ```sh
   ibmcloud dns zones -i dns-vmware
   ```
   {: codeblock}

2. List information about configured records in your DNS instance `dns-vmware` and zone `vmware.ibmcloud.local`. Use the following command.

   ```sh
   ibmcloud dns resource-records $VMWARE_DNS_ZONE -i dns-vmware 
   ```
   {: codeblock}

3. Verify that you permitted your {{site.data.keyword.vpc_short}} networks to access and use the DNS service:

   ```sh
   ibmcloud dns permitted-networks $VMWARE_DNS_ZONE
   ```
   {: codeblock}

4. When a DNS record is created during the tutorial, validate that you get correct responses from your Windows Jump host, for example using `nslookup` via Windows command line.

   ```sh
   nslookup <hostname>
   ```
   {: codeblock}

## Next steps
{: #vpc-bm-vmware-dns-next-steps}

The next step in the tutorial series is:

* [Provision bare metal servers for VMware deployment](/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware-bms#vpc-bm-vmware-bms)
