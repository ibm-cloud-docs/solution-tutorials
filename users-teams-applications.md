---
copyright:
  years: 2018
lastupdated: "2018-02-28"

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

# Best practices for organizing users, teams, applications

This tutorial gives an overview of the concepts available in IBM Cloud to manage identity and access management and how they can be implemented to support the multiple development stages of an application.

{:shortdesc}

## Objectives
{: #objectives}

* Learn about Identity and Access Management and Cloud Foundry access models
* Configure a project with clear separation between roles and environments

## Products
{: #products}

This tutorial uses the following products:
* [Identity and Access Management](https://console.bluemix.net/docs/iam/index.html)
* Container Service
* Cloud Object Storage
* Cloud Foundry
* Cloudant NoSQL database

<p style="text-align: center;">
![](images/solutionXX/Architecture.png)
</p>

1. The user does this
2. Then that

## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins

## Define a project

Let's consider this application:
* several microservices deployed in Kubernetes
* databases
* file storage

This project defines dev, test and production environments.

The project team includes architect, developer, operator, quality tester roles. One person may play several roles. Similar roles may be found in each environment but assigned to different persons.

We want strong isolation between the environments.

### Development

Development Environment is continuously updated with every commit, unit tests, smoke tests are executed. It gives access to the latest and greatest deployment of the code

* Developer
  * can deploy/undeploy apps
  * can access log files
  * can view app and service configuration
* Tester
  * use the deployed apps
* Operator
  * can deploy/undeploy applications
  * can access log files
  * can view app and service configuration

### Testing

Test Environment is built after a more stable branch of the code. This is where user acceptance testing is made. It is very close from the production environment, it is loaded with realistic data (anonymous production data as example). All the testing could be automated or include manual validation and acceptance tests before passing the "ready for production" gate.
* Developer
* Tester
  * use the deployed apps
* Operator
  * can deploy/undeploy applications
  * can access log files
  * can view app and service configuration

### Production

Production Environment is updated with the version validated in the previous environment.
* Developer
  * no access
* Tester
  * no access
* Operator
  * can deploy/undeploy applications
  * can access log files
  * can view app and service configuration

Pipeline updates the environment. A complex pipeline may involve manual confirmation steps to proceed to the next step (a LGTM approval workflow).

## Identity and Access Management
{: #first_objective}

IBM Cloud Identity and Access Management (IAM) enables you to securely authenticate users for both platform and infrastructure services and control access to **resources** consistently across the IBM Cloud platform. A set of IBM Cloud services are enabled to use Cloud IAM for access control and are organized into **resource groups** within your **account** to enable giving **users** quick and easy access to more than one resource at a time. Cloud IAM access **policies** are used to assign users and **service IDs** access to the resources within your account.

A **policy** assigns a user or service ID one or more **roles** with a combination of attributes that define the scope of access. The policy can provide access to a single service down to the instance level, or the policy can apply to a set of resources organized together in a resource group. Depending on the user roles that you assign, the user or service ID is allowed varying levels of access for completing platform management tasks or accessing a service by using the UI or performing specific types of API calls.

  ![](./images/solution20-users-teams-applications/governance_ibmcloud_iam.gv.png)

Getting Started with IAM
https://console.bluemix.net/docs/iam/quickstart.html#getstarted

Access management for clusters
mapping between IAM roles and their permissions in cluster management and kubernetes resources
https://console.bluemix.net/docs/containers/cs_users.html#users

## Mapping the project to IAM

### let's start with one environment

  ![](./images/solution20-users-teams-applications/one-environment.png)

* typical kube + cf environment diagram
* build the cluster and cf services
* create a dedicated space for the cf services - will help with role setting
* create a resource group for the cluster and compatible service

### set roles

* assign roles to the users

* what roles to give dev/test/operator in IAM and in Cloud Foundry? Reuse the tables from IAM/CF docs

* use service ID in your application

* you create a resource group including all the resources making your app - not all services can be included into a resource group today

* you can assign policies to users in your account to define their permissions on these resources and resource groups

### then we replicate for multiple environments

  ![](./images/solution20-users-teams-applications/multiple-environments.png)

* diagram of the project showing the environments, the separate clusters and services
* dev branch pushing to pipeline
* master branch pushing to test
* a "stable" tag pushing to production

* It depends on the organization and the application but, in general, keep separate clusters for different types of environments in a delivery pipeline.

* you would not want to mix test and production deployments in the same clusters

* prevent from having a pod going crazy in a test deployment and eating up all the resources that the production deployment may need to scale

* who has access and what are the update cycles would be very different for each of these environments/clusters

* you can isolate access between resources using namespaces but there are some resources which are global to the cluster

* someone could mess up and accidentally grant access to a namespace in prod that was not expected

* there’s no benefit to combining them since you pay for the capacity (via worker nodes) and you are likely to plan for the capacity you want to use in your clusters including resources for all environments

* since it is simple to get a cluster it is far better to separate clusters based on development lifecycles (at a minimum)

* defining resource limits is important in kubernetes - at the deployment/pod level, but there are also settings at the namespace level. See https://kubernetes.io/docs/tasks/administer-cluster/memory-default-namespace/ and the sibling articles.

## Clean up resources

Steps to take to remove the resources created in this tutorial

## Related information

* [Relevant links](https://blah)
