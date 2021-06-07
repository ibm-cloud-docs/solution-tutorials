---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-06-07"
lasttested: "2021-06-07"

# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
content-type: tutorial
services: satellite
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}
{:deprecated: .deprecated}
{:important: .important}
{:note: .note}
{:tip: .tip}
{:preview: .preview}
{:beta: .beta}

# Satellite Tour
{: #satellite-tour}
{: toc-content-type="tutorial"}
{: toc-services="satellite"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This template shows how to structure a tutorial but also some writing tips and general documentation on how to work with tutorials.
{:shortdesc}

## Objectives
{: #satellite-tour-objectives}

* Review the underlying infrastructure of an existing {{site.data.keyword.satelliteshort}} location.
* Deploy an application to a {{site.data.keyword.openshiftlong_notm}} cluster running in the {{site.data.keyword.satelliteshort}} location.
* Use {{site.data.keyword.satelliteshort}} configurations to specify what Kubernetes resources you want to deploy to a group of {{site.data.keyword.openshiftlong_notm}} clusters.

![Architecture](./images/solution-satellite-tour-hidden/architecture.png)

<!-- 1. The user does this
2. Then that
3. Create a .drawio file in diagrams/ directory with the same name as the tutorial.md only tutorial.drawio with a separate tab for each diagram -->

## Before you begin
{: #satellite-tour-prereqs}

This tutorial requires:
* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.vpc_short}} plugin (`vpc-infrastructure`),
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
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
{:tip}
<!--#/istutorial#-->

In addition, make sure you have:
- a **namespace** created in the {{site.data.keyword.registryfull_notm}}
- and Android Studio installed.

<!--##isworkshop#-->
<!--
## Start a new {{site.data.keyword.cloud-shell_notm}}
{: #satellite-tour-shell}
{: step}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, select the account where you have been invited.
1. Click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell).

-->
<!--#/isworkshop#-->

## Review architecture
{: #satellite-tour-review-architecture}
{: step}

walk attendees through the architecture of the location, using the CLI, using the user interface:

* view all locations
  * CLI ibmcloud sat location ls
  * UI https://{DomainName}/satellite/locations
* view location
  * CLI ibmcloud sat location get --location c2j5j8jw0ofnre8vt5fg
  * UI https://{DomainName}/satellite/locations/c2j5j8jw0ofnre8vt5fg/overview
* view hosts
  * see where they are used (control plane vs cluster)
  * CLI ibmcloud sat host ls --location c2j5j8jw0ofnre8vt5fg
  * UI https://{DomainName}/satellite/locations/c2j5j8jw0ofnre8vt5fg/hosts
* view the clusters
  * CLI ibmcloud ks clusters (ibmcloud sat cluster ls does not work with the restricted permissions)
  * UI https://{DomainName}/kubernetes/clusters (https://{DomainName}/satellite/clusters does not work with the restricted permissions)
* log in into one cluster
* follow the instructions under `Actions / Connect via CLI` to access the cluster from the CLI in cloud shell
  * eventually a command like `oc login --token=XXX --server=https://123455.us-east.satellite.appdomain.cloud:30755`
  * use oc commands as if it was a regular cluster

## Logging and Monitoring
{: #satellite-tour-observe}

### for the location

* use Platform Logging and Platform Metrics instances
* available metrics https://{DomainName}/docs/satellite?topic=satellite-monitor#available-metrics

### for a cluster

* can be configured to forward logs/metrics to anything including our logdna/sysdig

## Deploy an app
{: #satellite-tour-deploy}
{: step}

deploy an app directly to your cluster
* provision a cloudant database
* make the database available as a link endpoint to the cluster
* create a new oc project
* create a secret
* deploy the app
  * use a pre-built image? or build an image from source?
* access the app

## Configure a group of clusters
{: #satellite-tour-config}
{: step}

* use satconf to deploy the same resources to all clusters
  * just a simple namespace and a configmap as example

## Remove resources
{: #satellite-tour-removeresources}
{: step}

Steps to take to remove the resources created in this tutorial

## Related content
{: #satellite-tour-related}

* [About {{site.data.keyword.satelliteshort}}](https://{DomainName}/docs/satellite?topic=satellite-about)
