---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-02-22"
lasttested: "2022-02-22"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: vpc, log-analysis, activity-tracker, monitoring
account-plan: paid
completion-time: 2h
---

{{site.data.keyword.attribute-definition-list}}

# Discover the built-in capabilities of IBM Cloud observability suite using a non-trivial example
{: #vpc-observability-tour}
{: toc-content-type="tutorial"}
{: toc-services="vpc, log-analysis, activity-tracker, monitoring"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This template shows how to structure a tutorial but also some writing tips and general documentation on how to work with tutorials.
{: shortdesc}

## Objectives
{: #vpc-observability-tour-objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

![Architecture](images/solution1/Architecture.png){: class="center"}
{: style="text-align: center;"}

1. The user does this
2. Then that
3. Create a .drawio file in diagrams/ directory with the same name as the tutorial.md only tutorial.drawio with a separate tab for each diagram


## Before you begin
{: #vpc-observability-tour-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.vpc_short}} plugin (`vpc-infrastructure`),
   * {{site.data.keyword.containerfull_notm}} plugin (`container-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
   * {{site.data.keyword.cos_full_notm}} plugin (`cloud-object-storage`),
   * {{site.data.keyword.openwhisk}} plugin (`cloud-functions`),
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

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

<!--#/istutorial#-->

## Get ready with a few prereqs
{: #vpc-observability-tour-minimum}
{: step}

* Ensure the user has platform logging, monitoring, activity tracker setup
* Create an SSH key for VPC

## Deploy a sample advanced 3-tier web application using Schematics
{: #vpc-observability-tour-deploy}
{: step}

* Use terraform / Schematics to deploy the application
* Automatically deploy a typical VPC / VSI / LB / VPN / Block Storage / flow logs setup, using terraform/schematics
* Automatically configure VSI with Log Analysis and Monitoring agents

## Walk through architecture and highlight observability in the sample
{: #vpc-observability-tour-walkthrough}
{: step}

* All configuration was achieved with terraform
* Highlight the specificities of the configuration
* Show how the agent was configured for logdna and sysdig
   * point to blog post showing how to build a custom image with logdna and sysdig

## View platform logs
{: #vpc-observability-tour-pl}
{: step}

* This will not be a tutorial on all the capabilities of LogDNA.
* It should tell what the user should expect to see in the platform logs
   * which services in the architecture are sending data and maybe the right queries
   * terraform could have created default view in LogDNA to view these logs!
* Link to specific Log Analysis doc for details on how to configure

## View platform metrics
{: #vpc-observability-tour-pm}
{: step}

Same approach for monitoring

## View activity tracker
{: #vpc-observability-tour-atracker}
{: step}

Same approach for activity tracker

## View flow logs
{: #vpc-observability-tour-flow}
{: step}

* Confirm flow logs is working properly by looking at the COS bucket
* Run some basic queries in SQL Query

## View logs where it happens
{: #vpc-observability-tour-shell}
{: step}

* Use KVM / serial console to 
* SSH to host through bastion?
* Client VPN and ssh to host?

## Observability Best Practices Checklist
{: #vpc-observability-tour-checklist}

A growing list of tips taken from the tutorial - may turn into its own tutorial/blog:
* create platform logging, monitoring and activity tracker instances in all regions where you plan to deploy workload and in the GLOBAL region for global events
* use logdna/system teams to isolate logs
* use terraform to pre-configure logging/monitoring views and notifications
