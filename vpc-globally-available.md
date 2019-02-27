---
copyright:
  years: 2018
lastupdated: "2019-02-27"
---

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

# VPC with globally available deployment
{: #vpc-globally-available}

This tutorial walks you through on how you can isolate workloads by creating VPCs in different IBM Cloud regions with subnets and virtual server instances(VSIs) in multiple zones of a region and how you can increase resiliency within a region and globally by provisioning and configuring load balancers with backend pools, frontend listeners and health checks.

{:shortdesc}

## Objectives
{: #objectives}

* Understand the isolation of workloads through infrastructure objects available for virtual private clouds
* Use a load balancer between zones in a region
* Use a global load balancer between regions

## Services used
{: #services}

This tutorial uses the following runtimes and services:

- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)
- [{{site.data.keyword.loadbalancer_full}}](https://{DomainName}/vpc/provision/loadBalancer)
- IBM Cloud [Internet Services](https://{DomainName}/catalog/services/internet-services)
- [{{site.data.keyword.cloudcerts_long_notm}}](https://{DomainName}/catalog/services/cloudcerts)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

  ![Architecture](images/solution41-vpc-globally-available/Architecture.png)

1. The admin (DevOps) provisions VSIs in subnets under two different zones in a VPC in region 1 and repeats the same in a VPC created in region 2.
2. The admin creates a load balancer with a backend pool of servers of subnets in different zones of region 1 and a frontend listener. Repeats the same in region 2.
3. The admin provisions cloud internet services service with an associated custom domain and creates a global load balancer pointing to the load balancers created in two different VPCs.
4. The admin enables HTTPS encryption by adding the domain SSL certificate to the Certificate manager service.
5. The internet user makes an HTTP/HTTPS request and the global load balancer handles the request.
6. The request is routed to the load balancers and fullfiled by the available server instance through the respective load balancer.

## Before you begin
{: #prereqs}

- Check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/infrastructure/vpc/vpc-user-permissions.html).

- You need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/infrastructure/vpc/getting-started.html#prerequisites).

## Create VPC

??? If the terraform provider is available, it might be good to use it given the number of elements we need to create. The other option it to use scripting. This tutorial basically deploys the other vpc tutorial in multiple zones/locations.

## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{: #related}

* [Relevant links](https://blah)
