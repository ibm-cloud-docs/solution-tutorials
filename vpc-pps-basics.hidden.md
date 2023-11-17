---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-11-17"
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

This tutorial is an introduction to Private Path Service.
{: shortdesc}

## Objectives
{: #vpc-pps-basics-objectives}

* Understand the basis of Private Path Service.
* Deploy an application in one account without exposing any private endpoints.
* Expose the application with Private Path service.
* Access the application from another account through private connectivity only.

![Architecture](images/vpc-pps-basics-hidden/architecture.png){: caption="Figure 1. Architecture showing Private Path service" caption-side="bottom"}
{: style="text-align: center;"}

1. A provider implements a resilient application supported by multiple virtual servers spread in multiple zones.
1. The provider creates a Private Path Network Load Balancer (NLB) configured with backend pools pointing to the virtual servers.
1. A Private Path service references the Private Path NLB and is published so that it can be accessed by consumers.
1. Consumers access the provider application by going through virtual private endpoint gateways. All traffic remains private to {{site.data.keyword.cloud_notm}}.

## Before you begin
{: #vpc-pps-basics-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](/docs/account?topic=account-accounts),
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.vpc_short}} plugin (`vpc-infrastructure`),
   * {{site.data.keyword.containerfull_notm}} plugin (`container-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
   * {{site.data.keyword.cos_full_notm}} plugin (`cloud-object-storage`),
   * `dev` plugin,
* a Docker engine,
* `kubectl` to interact with Kubernetes clusters,
* `oc` to interact with OpenShift,
* `helm` to deploy charts,
* `terraform` to use Infrastructure as Code to provision resources,
* `jq` to query JSON files,
* `git` to clone source code repository,
* a GitHub account,
* {{site.data.keyword.cloud_notm}} GitLab configured with your SSH key.

You will find instructions to download and install these tools for your operating environment in the [Getting started with solution tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

## Create services
{: #vpc-pps-basics-setup}
{: step}

In this section, you will create the services required to ...

1. Login to {{site.data.keyword.cloud_notm}} via the command line. See [CLI Getting Started](/docs/cli?topic=cloud-cli-getting-started).
    
2. Create an instance of [Service A](/catalog/services/the-service-name).
    ```sh
    ibmcloud resource service-instance-create service-instance-name service-name lite global
    ```
3. Create an instance of [Service B](/catalog/services/the-service-name).

## Review Provider side
{: #vpc-pps-basics-review-provider}
{: step}

## Review Consumer side
{: #vpc-pps-basics-review-consumer}
{: step}

## Test connectivity from consumer to provider
{: #vpc-pps-basics-test-connectivity}
{: step}

## Remove resources
{: #vpc-pps-basics-removeresources}
{: step}

Steps to take to remove the resources created in this tutorial

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}


