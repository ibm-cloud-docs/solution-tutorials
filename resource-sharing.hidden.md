---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-09-13"
lasttested: "2022-09-12"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: 
account-plan: paid
completion-time: 2h
---

{{site.data.keyword.attribute-definition-list}}

# Resource sharing across accounts
{: #resource-sharing}
{: toc-content-type="tutorial"}
{: toc-services="vpc, log-analysis, activity-tracker, monitoring"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through different options on how to share cloud-based resources across accounts.
{: shortdesc}

## Objectives
{: #resource-sharing-objectives}

* Understand the benefits of sharing resources across accounts
* Learn about different techniques to share resources across accounts

![Architecture](images/solution1/Architecture.png){: class="center"}
{: style="text-align: center;"}

1. The user does this
2. Then that


## Before you begin
{: #resource-sharing-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

<!--#/istutorial#-->

## thoughts
{: #resource-sharing-thoughts}
{: step}

resource sharing from loose to tightly coupled
* user ID / password to access internet / cloud service
* API key or some form of access token, sometimes with additional properties
* access automatically negotiated and established between services after initial setup ("introduction" and authorization)

benefits:
* sharing of scarce resources
* sharing of expensive / costly resources, could help optimize overall costs
* sharing of not often used resources, maybe with unwarranted setup costs
* data replication

custom catalogs


resource types:
* network resources like VPN, direct link, subnets and IP ranges
* KMS resources like Key Protect and Hyper Protect CS


^ examples:
- Cloudant data replication across accounts: https://{DomainName}/docs/Cloudant?topic=Cloudant-replication-guide#how-to-run-replication-across-different-ibm-cloudant-accounts
- SCC is able to scan multiple accounts: https://{DomainName}/docs/security-compliance?topic=security-compliance-scanning-multiple-accounts-from-a-single-account
- Transit Gateway: connect across accounts https://{DomainName}/docs/transit-gateway?topic=transit-gateway-about#use-case-5
- Direct Link: https://{DomainName}/docs/vpc-journey?topic=vpc-journey-vpc-directlink#vpc-directlink-patterns
- DNS service cross-account access https://{DomainName}/docs/dns-svcs?topic=dns-svcs-cross-account-about
- IBM Cloud Databases allow backup / restore across accounts via API: https://{DomainName}/docs/cloud-databases?topic=cloud-databases-dashboard-backups
- IBM Cloud API keys for a user have a scope that may be across multiple accounts, the same as the user has: https://{DomainName}/docs/account?topic=account-manapikey#ibm-cloud-api-keys


## Resource sharing categories
{: #resource-sharing-categories}
{: step}


### Security
{: #security}

SCC, key management, scoping, reduction of attack surface

### Disaster recovery
{: #disaster-recovery}

data replication, backup and restore

IBM Cloud Databases
> Backups are restorable across accounts, but only through the API and only if the user that is running the restore has access to both the source and destination accounts.
Details:
- a new DB is provisioned through the standard resource controller, but with extra ICD-specific parameters
- the backup CRN has to be provided to create from a backup image
- if the user has access to both accounts, the backup image from a different account be read and used to provision the new database

### Network
{: #network}

DNS, Direct Link, Transit Gateway



## Implementation strategies
{: #resource-sharing-implementation}
{: step}


- service to service authorizations
- discuss Terraform for multi-account setup
- service ID (account, including their API keys) vs. user (multiple accounts, including their API keys)
- Trusted Profiles as possible solution?


service to service:
for the examples, here are typical service to service authorizations. Target services are
- COS: store something in a bucket, e.g., archive logs or monitoring data, or retrieve data from it for analysis, or (CE) receive notifications about bucket updates
- KP and HPCS: obtain root key to encrypt data
- Event Notifications: push out some event data to subscribers
- Secrets Manager: obtain a secret 
- Satellite: ?
- Catalog Management: ?
- App Configuration: ?
- Internet Services: SM has it, maybe for certificates and domain validation?