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
* [Container Service](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
* [Cloud Object Storage](https://console.bluemix.net/catalog/infrastructure/cloud-object-storage)
* [Cloud Foundry](https://console.bluemix.net/catalog/?category=cf-apps&search=foundry)
* [Cloudant NoSQL database](https://console.bluemix.net/catalog/services/cloudant-nosql-db)

<!-- ## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins -->

## Define a project

When building an application, it is very common to define multiple environments reflecting the development lifecycle of a project from a developer committing code to the application code being made available to the end-users. *Sandbox*, *test*, *staging*, *UAT* (user acceptance testing), *pre-production*, *production* are typical names for these environments.

Isolating the underlying resources, implementing governance and access policies, protecting a production workload, validating changes before pushing them to production, are some of the reasons why you would want to create these separate environments.

Let's consider a sample project with the following components:
* several microservices deployed in Kubernetes,
* databases,
* file storage buckets.

In this project, we define three environments:
* *Development* - this environment is continuously updated with every commit, unit tests, smoke tests are executed. It gives access to the latest and greatest deployment of the project.
* *Testing* - this environment is built after a stable branch or tag of the code. This is where user acceptance testing is made. It is very close from the production environment, it is loaded with realistic data (anonymized production data as example).
* *Production* - this environment is updated with the version validated in the previous environment.

A build pipeline manages the progression of a build through the environment. It can be fully automated or include manual validation gates to promote approved builds between environments - this is really open and should be set up to match the company best practices and workflows.

When it comes to assigning responsibilities to the project team members, let's define the following roles and related permissions:

|           | Development | Testing | Production |
| --------- | ----------- | ------- | ---------- |
| Developer | <ul><li>can deploy/undeploy applications</li><li>can access log files</li><li>can view app and service configuration</li></ul> | <ul><li>can access log files</li><li>can view app and service configuration</li></ul> | <ul><li>no access</li></ul> |
| Tester    | <ul><li>use the deployed applications</li></ul> | <ul><li>use the deployed applications</li></ul> | <ul><li>no access</li></ul> |
| Operator  | <ul><li>can deploy/undeploy applications</li><li>can access log files</li><li>can view app and service configuration</li></ul> | <ul><li>can deploy/undeploy applications</li><li>can access log files</li><li>can view app and service configuration</li></ul> | <ul><li>can deploy/undeploy applications</li><li>can access log files</li><li>can view app and service configuration</li></ul> |

## Identity and Access Management (IAM)
{: #first_objective}

IBM Cloud Identity and Access Management (IAM) enables you to securely authenticate users for both platform and infrastructure services and control access to **resources** consistently across the IBM Cloud platform. A set of IBM Cloud services are enabled to use Cloud IAM for access control and are organized into **resource groups** within your **account** to enable giving **users** quick and easy access to more than one resource at a time. Cloud IAM access **policies** are used to assign users and **service IDs** access to the resources within your account.

A **policy** assigns a user or service ID one or more **roles** with a combination of attributes that define the scope of access. The policy can provide access to a single service down to the instance level, or the policy can apply to a set of resources organized together in a resource group. Depending on the user roles that you assign, the user or service ID is allowed varying levels of access for completing platform management tasks or accessing a service by using the UI or performing specific types of API calls.

  ![](./images/solution20-users-teams-applications/governance_ibmcloud_iam.gv.png)

At this time, not all services in the IBM Cloud catalog can be managed by using IAM. For these services, you can continue to use Cloud Foundry for these service instances by providing users access to the org and space to which the instance belongs with a Cloud Foundry role assigned to define the level of access that is allowed.
{:tip}

## Mapping the project to IAM

Although the three environments needed by this sample project require different access rights and may need to be allocated different capacities, they share a common architecture pattern.

  ![](./images/solution20-users-teams-applications/one-environment.png)

### Create the resources for one environment

* Pick a region
* Create an organization for the project
* Create a Cloud Foundry space for the environment
* Create a new cluster dedicated to the environment
  Before you create a cluster, either through the IBM Cloud UI or through the command line, you must log into a specific IBM Cloud region, account, organization, and space. The space where you are logged in is the space where logging and monitoring data for the cluster and its resources is collected. If later you want to change the space where a cluster is sending its logging data, you can use the [logging plugin for the bx command line](https://console.bluemix.net/docs/containers/cs_health.html#log_sources_update).
  {: tip}
* In the Container Registry, create a namespace for the Docker images used by the environment
* Create the Cloud Foundry services used by the project under the space dedicated to the environment

The following diagram shows where the project resources are created under the account:

  ![](./images/solution20-users-teams-applications/resources.png)

### Assign roles within the environment

* Invite users to the account
* Assign Policies to the users to control who can access the Container Service instance and their permissions. Refer to the [access policy definition](https://console.bluemix.net/docs/containers/cs_users.html#access_policies) to select the right policy for a user in the environment.
* Configure their Cloud Foundry organization and space roles based on their needs within the environment. Refer to the [role definition](https://console.bluemix.net/docs/iam/cfaccess.html#cfaccess) to assign the right roles based on the environment.

### Replicate for multiple environments

From there, you can replicate similar steps to build the other environments.

* Create one Cloud Foundry space per environment
* Create the required service instances in each each space
* Create one cluster per environment
* Create one namespace per environment in the Container Registry
  The separate namespaces will be used to promote images between environments through tagging

  ![](./images/solution20-users-teams-applications/multiple-environments.png)

Using a combination of tools like the [IBM Cloud `bx` CLI](https://github.com/IBM-Cloud/ibm-cloud-developer-tools), [HashiCorp's `terraform`](https://www.terraform.io/), the [IBM Cloud provider for Terraform](https://github.com/IBM-Cloud/terraform-provider-ibm), Kubernetes CLI `kubectl`, you can script and automate the creation of these environments.

Separate clusters for the environments comes with good properties:
* no matter the environment, all clusters will tend to look the same;
* it is easier to control who has access to a specific cluster;
* it gives flexibility in the update cycles for deployments and underlying resources; when there is a new Kubernetes version, it gives you the option to update the Development cluster first, validate your application then update the other environment;
* it avoids mixing different workloads that may impact each other such as isolating the production deployment from the others;

When it comes to deploying to the different environments, your continuous integration / continuous delivery pipeline can be setup to drive the full process:
* continuously update the `Development` environment with the latest and greatest code from the `development` branch, running unit tests and integration tests on the dedicated cluster.
* promote development builds to the `Testing` environment, either automatically if all tests from the previous stages are OK or through a manual promotion process. When doing so, Docker images from the `development` namespaces are pushed to the `testing` namespaces and tagged accordingly. Some teams will use different branches too here, merging the working development state to a `stable` branch as example.
* Repeat a similar process to move to the `Production` environment.
 
  ![](./images/solution20-users-teams-applications/cicd.png)

In all stages it is critical to properly version Docker images. You can use the GIT commit SHA as part of the image tag, or a unique identifier provided by your DevOps toolchain; any identifier that will make it easy for you to map the image to the actual build and source code contained in the image.

## Clean up resources

Steps to take to remove the resources created in this tutorial

## Related information

* [Getting Started with Identity and Access Management](https://console.bluemix.net/docs/iam/quickstart.html#getstarted)

## TODO

monitoring needs role at account level
https://internal-ibmcloud.ideas.aha.io/ideas/IDEAINT-I-1082

* create a resource group for the cluster and compatible service
* what roles to give dev/test/operator in IAM and in Cloud Foundry? Reuse the tables from IAM/CF docs

* use service ID in your application

* you create a resource group including all the resources making your app - not all services can be included into a resource group today

* you can assign policies to users in your account to define their permissions on these resources and resource groups

* you can isolate access between resources using namespaces but there are some resources which are global to the cluster

* someone could mess up and accidentally grant access to a namespace in prod that was not expected

* there’s no benefit to combining them since you pay for the capacity (via worker nodes) and you are likely to plan for the capacity you want to use in your clusters including resources for all environments

* since it is simple to get a cluster it is far better to separate clusters based on development lifecycles (at a minimum)