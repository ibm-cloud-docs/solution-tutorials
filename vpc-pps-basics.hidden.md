---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-11-28"
lasttested: "2023-01-01"

content-type: tutorial
services: vpc
account-plan: paid
completion-time: 2h
use-case: VirtualPrivateCloud, CloudNetworkSecurity, NetworkSecurity
---

{{site.data.keyword.attribute-definition-list}}

# Expose services to consumers through private connectivity
{: #vpc-pps-basics}
{: toc-content-type="tutorial"}
{: toc-services="vpc"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through the steps to set up a Private Path service between a provider and a set of consumers. With Private Path service, the application or service implemented by the provider will be accessed by consumers through the IBM backbone without traversing the internet.
{: shortdesc}

## Objectives
{: #vpc-pps-basics-objectives}

* Understand the basics of Private Path Service.
* Deploy an application in one account without exposing any public endpoints.
* Expose the application with Private Path service.
* Access the application from a consumer application through private connectivity only.

![Architecture](images/vpc-pps-basics-hidden/architecture.png){: caption="Figure 1. Architecture showing Private Path service" caption-side="bottom"}
{: style="text-align: center;"}

1. A provider implements a resilient application supported by multiple virtual servers spread in multiple zones.
1. The provider creates a Private Path Network Load Balancer (NLB) configured with backend pools pointing to the virtual servers.
1. A Private Path service references the Private Path NLB and is published so that it can be accessed by consumers.
1. Consumers access the provider application by going through virtual private endpoint gateways. All traffic remains private to {{site.data.keyword.cloud_notm}}.

## Before you begin
{: #vpc-pps-basics-prereqs}

This tutorial requires:
* Two {{site.data.keyword.cloud_notm}} [billable accounts](/docs/account?topic=account-accounts), one for the provider, one for the consumer. The tutorial will also work with only one account to host both the provider and the consumer resources.
* A VPC SSH key to connect to the virtual server instances provisioned in the tutorial.

### Create a VPC SSH key
{: #vpc-pps-basics-create-ssh-key}

When provisioning virtual server instances, an SSH key will be injected into the instances so that you can later connect to the servers.

1. If you don't have an SSH key on your local machine, refer to [these instructions](/docs/vpc?topic=vpc-ssh-keys) for creating a key for VPC. By default, the private key is found at `$HOME/.ssh/id_rsa`.
1. Add the SSH key in the **VPC console** under **Compute / SSH keys**.

## Create the provider resources and application
{: #vpc-pps-basics-provider-deploy}
{: step}

In this tutorial, you will first act as a provider and implement an application. In a second phase, you will be in the role of the consumer and call the application. For simplicity, the application is a simple `nginx` web server.

Acting as the provider for the application:
1. Go to Schematics.
1. Point to the `provider` directory in the example repo.
1. Set variables, prefix for resources, SSH key, API key (optional?).
1. Click **Deploy**.

## Review the provider resources and application
{: #vpc-pps-basics-provider-review}
{: step}

1. Review Schematics output.
1. Check the resource group that was created.
1. See the nginx through floating IP (maybe make it an optional step?).
1. Make note of the PPS CRN to pass on to consumers.

## Create the consumer resources
{: #vpc-pps-basics-consumer-deploy}
{: step}

To verify that the PPS is correctly setup you are going to deploy virtual servers to access the application.

Prereq: an SSH key to connect to the VSI we deploy

Acting as a consumer for the application,
1. Go to Schematics.
1. Point to the `consumer` directory in the example repo.
1. Set variables, prefix for resources, PPS CRN, SSH key, API key (optional?).
1. Click **Deploy**.

## Review the consumer resources and application
{: #vpc-pps-basics-consumer-review}
{: step}

1. Show a diagram of the consumer resources.
1. Notice the VPE is waiting for approval.
1. If you were to try to access the service it would not work just yet.

## Approve the consumer request
{: #vpc-pps-basics-provider-approve}
{: step}

Acting as the provider,
1. review the PPS request.
1. permit the connection request.

## Test connectivity from consumer to provider
{: #vpc-pps-basics-test-connectivity}
{: step}

Acting as the consumer,
1. notice the VPE turns active.
1. ssh to consumer vsi
1. From VSI, `curl` the VPE fqdn address, notice it goes to the provider VSIs
1. Repeat the `curl`, notice it round-robin as configured on the PPS NLB!

## Next steps?

* Here we tested in the same account. This is the first step in validating your PPS.
* To allow users from other accounts to access it, you need to publish the PPS.
* Once published, you can onboard consumers
* You can also set policies to automatically approve requests from specific accounts.

## Remove resources
{: #vpc-pps-basics-removeresources}
{: step}

Go to Schematics,
1. Delete the consumer resources and workspace.
1. Delete the producer resources and workspace.

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}
