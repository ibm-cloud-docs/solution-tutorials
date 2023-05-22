---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-05-22"
lasttested: "2023-05-22"

content-type: tutorial
services: secure-enterprise, containers, cloud-object-storage, activity-tracker, Registry, secrets-manager, appid, Cloudant
account-plan: paid
completion-time: 2h
use-case: IdentityAndAccessManagement, ApplicationIntegration
---

{{site.data.keyword.attribute-definition-list}}

# Use trusted profiles as foundation for secure cloud environments
{: #trusted-profile-for-enterprise-security}
{: toc-content-type="tutorial"}
{: toc-services="containers, Cloudant"}
{: toc-completion-time="2h"}


This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}


{{site.data.keyword.cloud_notm}} [Identity and Access Management (IAM)](/docs/account?topic=account-cloudaccess) enables you to control which users see, create, use, and manage resources in your cloud environment. Your environment might be a single {{site.data.keyword.cloud_notm}} account, multiples accounts, or an [enterprise](/docs/secure-enterprise?topic=secure-enterprise-what-is-enterprise) with a hierarchy of many account groups and accounts. When operating with account resources, typically users and service IDs are involved. But there are more options available to manage access, assign privileges, and to identify: [Trusted profiles](/docs/account?topic=account-identity-overview#trustedprofiles-bestpract).

In this tutorial, you are going to learn about trusted profiles, their use cases, and how to utilize them for enhanced security. Learn how to use trusted profiles as foundation for secure cloud environments. They can serve as building block for secure cloud solutions.


Learn about trusted profiles as building block for secure cloud environments
{: shortdesc}

## Objectives
{: #trusted-profile-for-enterprise-security-objectives}

* Learn use cases for trusted profiles
* Create a trusted profile and assign access
* Use a trusted profile for secure enterprise deployment



![Architecture](images/solution67-cbr-enhanced-security/architecture-e2e-security-cbr.svg){: caption="Solution architecture" caption-side="bottom"}


## Before you begin
{: #trusted-profile-for-enterprise-security-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](/docs/account?topic=account-accounts)

You will find instructions to download and install these tools for your operating environment in the [Getting started with solution tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.


To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}




## Trusted profile use cases
{: #trusted-profile-for-enterprise-security-use-cases}
{: step}

Similar to users and service IDs, [trusted profiles](/docs/account?topic=account-identity-overview#trustedprofiles-bestpract) are identities that can be granted in IAM policies.


Learn about trusted profiles
- what is a TP
- what are the supported use cases
- what is needed to use a TP

[TP based on](/docs/account?topic=account-create-trusted-profile&interface=ui)
- federated ID (IdP)
- compute resource
- cloud service with CRN
- service ID


federated ID
- bring in users from corporate directory (LDAP, Active Directory)
- uses SAML or OIDC via App ID
- use dynamic rule in Access Group to determine which users to map to IBM Cloud privileges

compute resource
- avoid using API keys, but perform (administrative) tasks
- access to a compute resource indicates privilege
- compute resource can obtain token, turn into IAM token and perform the action

cloud service
- could be a Project identified by its CR^

service ID
- initiate work (in a different account) authorized by the originating service ID


## Federated identity
{: #trusted-profile-for-enterprise-security-federated-id}
{: step}


details on federated ID, including resources and blogs, why should I use it?

- bring in users from corporate directory (LDAP, Active Directory)
- uses SAML or OIDC via App ID
- use dynamic rule in Access Group to determine which users to map to IBM Cloud privileges





## Remove resources
{: #trusted-profile-for-enterprise-security-removeresources}
{: step}

Steps to take to remove the resources created in this tutorial

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}


## Related content
{: #trusted-profile-for-enterprise-security-related}

some content here