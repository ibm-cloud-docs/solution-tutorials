---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-02-17"
lasttested: "2020-02-17"

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
{:important: .important}
{:note: .note}

# Coligo tutorial
{: #coligo}

In this tutorial, you will be learn about Coligo by deploying an Image processing application to a Coligo cluster. Coligo aims to create a platform to unify the deployment of functions, applications and pre-built containers to Kubernetes-based infrastructure. It provides a “one-stop-shop” experience for developers, enabling higher productivity and faster time to market. Delivered as a managed service on the cloud and built on open-source projects (Kubernetes, Istio, knative, Tekton etc.,).

Starting with a multi-tenant shared container environment, but extendable to ”bring your own cluster” (either IKS or OpenShift) for higher isolation.
{:shortdesc}

Kubernetes is a complex product that needs a lot of configuration to run properly. Developers must log into individual worker nodes to carry out repetitive tasks, such as installing dependencies and configuring networking rules. They must generate configuration files, manage logging and tracing, and write their own CI/CD scripts using tools like Jenkins. Before they can deploy their containers, they have to go through multiple steps to containerize their source code in the first place.

Knative helps developers by hiding many of these tasks, simplifying container-based management and enabling you to concentrate on writing code. It also has support for serverless functions.

Knative's serving component incorporates Istio, which is an open source tool developed by IBM, Google, and Lyft to help manage tiny, container-based software services known as microservices.

Istio provides a routing mechanism that allows services to access each other via URLs in what's known as a service mesh. It's essentially a switchboard for the vast, complex array of container-based services that can quickly develop in a microservice environment. It handles all of this routing without needing the developer to make any changes to their underlying application code.

## Objectives
{: #objectives}

* Understand Project Coligo and how it simplifies the developer experience.
* Deploy a frontend application to Coligo cluster to upload images for classification.
* Store the uploaded images in a COS service bucket on {{site.data.keyword.Bluemix}}.
* Process the images as individual jobs and store the results in a different bucket on COS service.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
* Coligo service

<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution54-coligo-hidden/architecture_diagram.png)
</p>

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * Coligo plugin (`coligo-service`),
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
* a Docker engine,
* `kubectl` to interact with Kubernetes clusters,
* Knative client [kn](https://storage.googleapis.com/knative-nightly/client/latest/kn-darwin-amd64) for troubleshooting Knative.

## Create a Coligo project
{: #create_coligo_project}

In this section, you will provision a Coligo service and a subsequent project to group applications and jobs

1. On {{site.data.keyword.Bluemix_notm}} catalog, create a Coligo service.
2. Once provisioned, create a new project to group your artifacts (applications,jobs etc.,).
   - Provide a project name
   - Click on **Create Project**
3. On a terminal, define an environment variable `COLIGO_PROJECT` and set it to your project name.
   ```sh
   export COLIGO_PROJECT=<your-project-name>
   ```
   {:pre}
4. Check the details of your project by running the following command
   ```sh
   ibmcloud coligo project get $COLIGO_PROJECT
   ```
   {:pre}
5. Target the project to run the future commands
   ```sh
   ibmcloud coligo target $COLIGO_PROJECT
   ```
   {:pre}

## Deploy an application to Coligo
{: #deploy_app}

In this section, you will deploy an application to Coligo under the targeted project. You will use the pre-built container image to deploy the application,

1. Create an app