---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-09-20"
lasttested: "2022-09-12"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, log-analysis, activity-tracker, secrets-manager, appid, key-protect, cloud-object-storage
account-plan: paid
completion-time: 2h
---

{{site.data.keyword.attribute-definition-list}}

# Resource sharing across accounts
{: #resource-sharing}
{: toc-content-type="tutorial"}
{: toc-services="vpc, log-analysis, activity-tracker, Ssecrets-manager, appid, key-protect, cloud-object-storage"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through different options on how to share cloud-based resources across accounts.
{: shortdesc}

An uncountable number of services is offered on the internet. You probably own accounts at many service providers. To use these services, you typically access them with a combination of user ID and password or by providing some form of API key or access token, often combined with additional levels (factors) of authentication. When building native cloud applications with a microservices-based architecture, the individual services can use the same techniques to access each other for collaboration. Often, however, automatic service binding with an even tighter integration is the desired form, usually combining authentication and authorization into a single, automated setup. Typically, the service binding requires the microservices to be in the same cloud account. That grouping is logically and simplifies development and operation. But sometimes, organizational, and especially security- and compliance-related requirements could mean to separate out some services and maintain them in central accounts. Thus, applications have to share resources across accounts. Sharing can be between accounts in an [IBM Cloud Enterprise environment](https://{DomainName}/docs/account?topic=account-what-is-enterprise) or without a formal enterprise organization.

This tutorial walks you through typical use cases and benefits of sharing cloud resources across accounts. Then, it helps you learn how to implement those common sharing scenarios, either manually or fully automated with Terraform.

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

## Resource sharing overview
{: #resource-sharing-overview}
{: step}

When resources are shared, possibly multiple applications access and use the same resource or parts of it. This might be for various reasons including that applications and compute environments have to live in the same corporate network, or that security logs are collected in a central storage service. It requires that services in a microservice architecture can be configured to access and use external services, that the shared service authorizes access, and that the network between the services is configured to support such collaboration, but not more.

Some typical use cases of resource sharing are:
- Central management of security-related infrastructure. Monitor security from a dedicated account, aggregate security logs in a single place.
- Control costs by sharing more expensive services where possible.
- Coordination of network addresses and subnets. Accounts and their applications and compute environments need to fit into the corporate network. This requires sharing of address ranges and domain names.
- Central management of resources for disaster recovery, including backup services. Applications and their services may be designed for high availability, but additional centrally organized resources might be available to fall back to in the worst case.
- Make scarce resources available to more users. Sometimes, a resource type is only available in limited quantity. By sharing, more applications can benefit from it. This may require rate limiting.


## Security
{: #resource-sharing-security}
{: step}

Often, security is managed on a corporate level with company-wide rules in place. Therefore, enforcement is managed centrally, too. This is still true with workloads moving to cloud environments. Resource sharing is at the foundation of centrally managing security as well as assessing and enforcing compliance. By scoping privileges to the required minimum, restricting resources to 

### Encryption key management
{: #resource-sharing-security-kms}

In almost all environments, data is stored encrypted. By default, encryption is system-managed which means the encryption key is provided and maintained by the cloud provider. To increase security, customers can use their own keys by utilizing a key management service (KMS). In {{site.data.keyword.cloud_notm}}, the KMS can be either located in the same or in another account as the service using an encryption key. This allows to centrally manage encryption keys for all corporate accounts. That way, it is possible to monitor usage and invalidate encryption keys when needed.

[{{site.data.keyword.keymanagementserviceshort}}](https://{DomainName}/docs/key-protect) and [{{site.data.keyword.hscrypto}}](https://{DomainName}/docs/hs-crypto?topic=hs-crypto-get-started) support this deployment pattern. Access to them can be configured to allow central key management and thereby resource sharing across {{site.data.keyword.cloud_notm}} accounts.

### {{site.data.keyword.compliance_short}}
{: #resource-sharing-security-scc}

The [{{site.data.keyword.compliance_short}}](https://{DomainName}/security-compliance/overview) features Posture Management and Configuration Governance functionality. It helps to monitor deployed environments for security and assess them against compliance goals. Moreover, it can provide configuration defaults or even enforce settings of newly deployed resources. While the latter only applies to the current account, you can [utilize {{site.data.keyword.compliance_short}} to monitor and assess multiple accounts](https://{DomainName}/docs/security-compliance?topic=security-compliance-scanning-multiple-accounts-from-a-single-account) from a central instance. With custom collectors in place, the current security posture of multiple cloud accounts can be assessed and necessary actions taken.


### {{site.data.keyword.at_short}}
{: #resource-sharing-security-at}

All {{site.data.keyword.cloud_notm}} services produce events for security-related actions. They are logged into {{site.data.keyword.at_short}} instances. By utilzing {{site.data.keyword.atracker_short}} Event Routing, the security records can be centralized to one or few instances with either event search (logdna) or {{site.data.keyword.cos_short}} as storage options. By aggregating all records in one location, security events can be easily correlated and thereby increasing insights into incidents or even allowing an earlier detection.


## Cost-oriented resource management
{: #resource-sharing-cost-management}
{: step}


## Network
{: #resource-sharing-network}
{: step}

Coordination of network addresses and subnets. Accounts and their applications and compute environments need to fit into the corporate network. This requires sharing of address ranges and domain names.
DNS, Direct Link, Transit Gateway


### {{site.data.keyword.dns_short}}
{: #resource-sharing-network-dns}



### {{site.data.keyword.tg_short}}
{: #resource-sharing-network-transit-gateway}



## Disaster recovery
{: #resource-sharing-disaster-recovery}
{: step}

data replication, backup and restore

IBM Cloud Databases
> Backups are restorable across accounts, but only through the API and only if the user that is running the restore has access to both the source and destination accounts.
Details:
- a new DB is provisioned through the standard resource controller, but with extra ICD-specific parameters
- the backup CRN has to be provided to create from a backup image
- if the user has access to both accounts, the backup image from a different account be read and used to provision the new database



## Resource sharing categories
{: #resource-sharing-categories}
{: step}


SCC, key management, scoping, reduction of attack surface


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
- Activity Tracker, consolidate events in another account's COS, see https://{DomainName}/docs/activity-tracker?topic=activity-tracker-getting-started-routing-2
- Transit Gateway: connect across accounts https://{DomainName}/docs/transit-gateway?topic=transit-gateway-about#use-case-5
- Direct Link: https://{DomainName}/docs/vpc-journey?topic=vpc-journey-vpc-directlink#vpc-directlink-patterns
- DNS service cross-account access https://{DomainName}/docs/dns-svcs?topic=dns-svcs-cross-account-about
- IBM Cloud Databases allow backup / restore across accounts via API: https://{DomainName}/docs/cloud-databases?topic=cloud-databases-dashboard-backups
- IBM Cloud API keys for a user have a scope that may be across multiple accounts, the same as the user has: https://{DomainName}/docs/account?topic=account-manapikey#ibm-cloud-api-keys
- Container Registry, manage container images centrally, use service IDs to access them






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


- Central management: An example is key management service (KMS) like Key Protect and Hyper Protect Crypto Services to monitor usage and invalidate encryption keys when needed.
- Central management: Use the Security and Compliance Center to actively monitor other accounts for compliance. Govern resources from one account across other accounts.
- Central management: 
- Cost reduction: Only allow specific services to be provisioned by setting up custom catalogs. Offer more expensive or restricted services as shared resource from a central account.
- 

## Related resources
{: #resource-sharing-related_resources}
