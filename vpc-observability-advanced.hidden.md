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

# Advanced logging, metrics, application tracing
{: #vpc-observability-advanced}
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
{: #vpc-observability-advanced-objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

![Architecture](images/solution1/Architecture.png){: class="center"}
{: style="text-align: center;"}

1. The user does this
2. Then that
3. Create a .drawio file in diagrams/ directory with the same name as the tutorial.md only tutorial.drawio with a separate tab for each diagram


## Before you begin
{: #vpc-observability-advanced-prereqs}

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

## Generate real-time data
{: #vpc-observability-advanced-realtime}
{: step}

With the architecture logging and monitoring dashboard opened, generate some logs/metrics in the application. See the data in real-time.

## Configure alerts in Log Analysis and Monitoring
{: #vpc-observability-advanced-alerts}
{: step}

* can this be configured in terraform and email be sent to the user?

## Custom metrics from an app
{: #vpc-observability-advanced-metrics}
{: step}

* embed example from application-log-analysis showing custom metrics with prometheus
* pre-configure https://github.com/prometheus/node_exporter and show filesystem read/write?
* pre-configure https://github.com/slanatech/swagger-stats?
* Show custom metrics sent by one VSI (network ping to other hosts)

## Application tracing
{: #vpc-observability-advanced-tracing}
{: step}

* Custom logs from an app? How to import logs produced by your app.Things not in stdout/stderr but in other files on disk
* Application call tracing (OpenTracing?)
* Application and System Level Observability (like New Relic, Instana for apps)