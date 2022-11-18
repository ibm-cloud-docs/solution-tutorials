---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-11-18"
lasttested: "2022-11-18"

content-type: tutorial
services: containers, cloud-object-storage, activity-tracker, Registry, secrets-manager, appid, Cloudant, key-protect, log-analysis
account-plan: paid
completion-time: 2h

---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Enhance cloud security by applying context-based restrictions
{: #cbr-security}
{: toc-content-type="tutorial"}
{: toc-services="containers, cloud-object-storage, activity-tracker, Registry, secrets-manager, appid, Cloudant, key-protect, log-analysis"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through the process of implementing context-based restrictions (CBRs) in your {{site.data.keyword.cloud_notm}} account. They help you to secure the cloud environment further and move towards a [zero trust security model](https://en.wikipedia.org/wiki/Zero_trust_security_model).
{: shortdesc}



## Objectives
{: #cbr-security-objectives}

* Learn about context-based restrictions to protect your cloud resources
* Define network zones to identify traffic sources for allowed and denied access
* Create rules that define context for access to your cloud resources


![Architecture](images/solution-cbr-security-hidden/architecture-e2e-security.svg){: class="center"}
{: style="text-align: center;"}


1. Adapt to creating CBR zones and rules
2. Need to decide how to visualize it
3. could be boxes around zones, lines with question marks for rules?

<!--##istutorial#-->
## Before you begin
{: #cbr-security-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
* `git` to clone source code repository,
* `terraform` to deploy resources.

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

!!!Need to have app from other tutorial DEPLOYED!!!


## Define the access strategy for your cloud resources
{: #cbr-security-strategy}
{: step}

* what to protect
* which by CBR, by IAM
* what endpoints to protect / use
* make sure to not locked you out (console, CLI, TF)

### Overview: Context-based restrictions
{: #cbr-security-strategy-overview}
{: step}

Context-based restrictions provide the ability to define and enforce access restrictions for {{site.data.keyword.cloud_notm}} resources based on the network location and the type of access requests. These restrictions add an extra layer of protection and are additional to traditional IAM (Identity and Access Management) policies. Because both IAM policies and context-based restrictions enforce access, context-based restrictions offer protection even in the face of compromised or mismanaged credentials.

* discuss actions / privileges, who is authorized to create / update / view zones and rules
* show how to add CBR zone and rule in the UI
* IKS to COS? or COS to KP?



in the tutorial and TF code,
- discuss that rules can be disabled, reported, enabled
- provide switch to change the mode for rules, so that there could be a transition (and test) phase towards enabled rules
- discuss how to check that rules are in place but not enforced yet


- configure zone and rule for CR
- perform local pull on image uploaded

## Some headline
{: #cbr-security-xyz}
{: step}

For evaluating the impact of context-based restrictions, you are going to start with creating a rule governing the access to {{site.data.keyword.registryshort_notm}}.

1. In the {{site.data.keyword.cloud_notm}} console, click on the **Manage** menu and select [**Context-based restrictions**](https://{DomainName}/context-based-restrictions). In the overview page, click on **Create a network zone**.
2. Enter **VPCzone** as name.
3. Under **Allowed VPCs**, select the one with your {{site.data.keyword.containershort_notm}} cluster. Click **Next** to review, then **Create** the zone.
4. Next, create a rule using the zone by clicking on **Rules** in the navigation on the left, then **Create**.
5. 





```
ibmcloud cr login
ibmcloud cr namespace-add YOUR_INITIALS-e2esec
docker pull icr.io/solution-tutorials/tutorial-cloud-e2e-security
docker tag icr.io/solution-tutorials/tutorial-cloud-e2e-security REGION.icr.io/YOUR_INITIALS-e2esec/tutorial-cloud-e2e-security
docker push REGION.icr.io/YOUR_INITIALS-e2esec/tutorial-cloud-e2e-security
```

registry.access.redhat.com/ubi8/ubi-micro

## Verify the rules
{: #cbr-security-verify}
{: step}

When in report mode, log entries are written to {{site.data.keyword.at_short}} when a rule matches. The log record has details on the request. In the image below, the rule to allow

![Verify rules in report mode](images/solution-cbr-security-hidden/CBR_rule_warning_registry.png){: class="center"}
{: style="text-align: center;"}


![Verify rules in enforced mode](images/solution-cbr-security-hidden/CBR_rule_denied_registry.png){: class="center"}
{: style="text-align: center;"}

https://{DomainName}/docs/account?topic=account-cbr-monitor

## Expand the tutorial
{: #cbr-security-21}

Security is never done. Try the below suggestions to enhance the security of your application.



## Remove resources
{: #cbr-security-23}
{: removeresources}

To remove the resource, delete the created network zones and rules.


## Related content
{: #cbr-security-12}
{: related}

https://{DomainName}/docs/vpc?topic=vpc-cbr&interface=cli