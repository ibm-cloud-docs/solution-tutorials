---
subcollection: solution-tutorials
copyright:
  years: 2022
lastupdated: "2022-02-22"
lasttested: "2022-02-22"

content-type: tutorial
services: vpc, log-analysis, activity-tracker, monitoring
account-plan: paid
completion-time: 2h
---

{{site.data.keyword.attribute-definition-list}}

# Troubleshooting problems, debugging common issues
{: #vpc-observability-troubleshooting}
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
{: #vpc-observability-troubleshooting-objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

![Architecture](images/solution1/Architecture.png){: class="center"}
{: style="text-align: center;"}

1. The user does this
2. Then that
3. Create a .drawio file in diagrams/ directory with the same name as the tutorial.md only tutorial.drawio with a separate tab for each diagram


## Before you begin
{: #vpc-observability-troubleshooting-prereqs}

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


## View logs where it happens
{: #vpc-observability-troubleshooting-shell}
{: step}

* Use KVM / serial console to 
* SSH to host through bastion?
* Client VPN and ssh to host?

## Use flow logs to detect unexpected activity
{: #vpc-observability-troubleshooting-flowlogs}
{: step}

* use SQL Query
   * view all incoming ports that are not _expected_
   * view all incoming SSH connection
* find a missing security group rule preventing access to an app

## Use metrics to detect a performance problem
{: #vpc-observability-troubleshooting-performances}
{: step}

## View bandwidth usage
{: #vpc-observability-troubleshooting-bandwidth}
{: step}

## Correlate logs and metrics
{: #vpc-observability-troubleshooting-correlate}
{: step}

## App is crashing
{: #vpc-observability-troubleshooting-crash}
{: step}

bug in an app?
