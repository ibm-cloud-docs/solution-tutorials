---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-06-14"
lasttested: "2022-11-03"

content-type: tutorial
services: openshift, log-analysis, monitoring, containers, Cloudant
account-plan: paid
completion-time: 1h
use-case: Cybersecurity, IdentityAndAccessManagement
---
{{site.data.keyword.attribute-definition-list}}

# Best practices for organizing users, teams, applications
{: #users-teams-applications}
{: toc-content-type="tutorial"}
{: toc-services="openshift, log-analysis, monitoring, containers, Cloudant"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial gives an overview of the concepts available in {{site.data.keyword.cloud_notm}} for identity and access management and how they can be implemented to support the multiple development stages of an application.
{: shortdesc}

When building an application, it is very common to define multiple environments. They reflect the development lifecycle of a project from a developer committing code to the application code being made available to the end-users. *Sandbox*, *test*, *staging*, *UAT* (user acceptance testing), *pre-production*, *production* are typical names for these environments.

Isolating the underlying resources, implementing governance and access policies, protecting a production workload, validating changes before pushing them to production, are some of the reasons why you would want to create these separate environments.

## Objectives
{: #users-teams-applications-objectives}

* Learn about {{site.data.keyword.iamlong}}.
* Configure a project with separation between roles and environments.
* Setup continuous integration.


## Define a project
{: #users-teams-applications-1}

Let's consider a sample project with the following components:
* several microservices deployed in {{site.data.keyword.containershort_notm}} or virtual server instances (VSIs) within {{site.data.keyword.vpc_short}} (Virtual Private Cloud),
* databases,
* file storage buckets.

In this project, we define three environments:
* *Development* - this environment is continuously updated with every commit, unit tests, smoke tests are executed. It gives access to the latest and greatest deployment of the project.
* *Testing* - this environment is built after a stable branch or tag of the code. This is where user acceptance testing is made. Its configuration is similar to the production environment. It is loaded with realistic data (anonymized production data as example).
* *Production* - this environment is updated with the version validated in the previous environment.

**A delivery pipeline manages the progression of a build through the environment.** It can be fully automated or include manual validation gates to promote approved builds between environments - this is really open and should be set up to match the company best practices and workflows.

To support the execution of the build pipeline, we introduce **a [Service ID](/docs/account?topic=account-serviceids)**. A service ID identifies a service or application similar to how a user ID identifies a user. Policies can be assigned to a service ID, providing it access to resources. This service ID is used in the delivery pipelines and any other cloud resources requiring strong ownership. This approach helps in the case where a team member leaves the company or is moving to another project. The service ID will be dedicated to your project and will not change over the lifetime of the project. The [service ID should be locked](/docs/account?topic=account-serviceids#lock_serviceid) to protect it against accidental deletion. The next thing you will want to create is [an API key](/iam/serviceids) for this service ID. You will select this API key when you set up the DevOps (or DevSecOps) pipelines, or when you want to run automation scripts, to impersonate the service ID.

When it comes to assigning responsibilities to the project team members, let's define the following roles and related permissions:

|           | Development | Testing | Production |
| --------- | ----------- | ------- | ---------- |
| Developer | - contributes code  \n - can access log files  \n - can view app and service configuration  \n - use the deployed applications | - can access log files  \n - can view app and service configuration  \n - use the deployed applications | - no access |
| Tester    | - use the deployed applications | - use the deployed applications | - no access |
| Operator  | - can access log files  \n - can view/set app and service configuration | - can access log files  \n - can view/set app and service configuration | - can access log files  \n - can view/set app and service configuration |
| Pipeline Service ID  | - can deploy/undeploy applications  \n - can view/set app and service configuration | - can deploy/undeploy applications  \n - can view/set app and service configuration | - can deploy/undeploy applications  \n - can view/set app and service configuration |
{: caption="Roles and permissions across environments" caption-side="bottom"}

## Identity and Access Management (IAM)
{: #users-teams-applications-first_objective}

{{site.data.keyword.iamshort}} (IAM) enables you to securely authenticate users for both platform and infrastructure services and control (authorize) access to **resources** consistently across the {{site.data.keyword.cloud_notm}} platform. {{site.data.keyword.cloud_notm}} services enabled to use Cloud IAM for access control are provisioned into [**resource groups**](/docs/account?topic=account-rgs) within your **account**. They allow you to give **users**, **service IDs**, and **trusted profiles** quick and easy access to more than one resource at a time. Cloud IAM access **policies** are used to assign users and service IDs access to the resources within your account.

This tutorial focuses on a single account. Multiple accounts can be grouped within an [enterprise account](/docs/account?topic=account-what-is-enterprise) and organized in account groups to centrally manage billing and resource usage.
{: tip}

A **policy** assigns a user, service ID, or trusted profile one or more **roles** with a combination of attributes that define the scope of access. The policy can provide access to a single service down to the instance level, or the policy can apply to a set of resources organized together in a resource group. Depending on the user roles that you assign, the user, service ID, or trusted profile is allowed varying levels of access for completing platform management tasks or accessing a service by using the UI or performing specific types of API calls.

![Diagram of IAM model](./images/solution20-users-teams-applications/IAM-access-groups-diagram.svg){: caption="How IAM access works in an account by using access groups" caption-side="bottom"}


## Create the resources for one environment
{: #users-teams-applications-3}

Although the three environments needed by this sample project require different access rights and may need to be allocated different capacities, they share a common architecture pattern.

![Architecture diagram showing one environment](./images/solution20-users-teams-applications/one-environment.svg){: caption="Architecture diagram showing one environment" caption-side="bottom"}

Let's start by building the Development environment. Note that {{site.data.keyword.registrylong_notm}} is always present and you don't need to provision it.

1. Most cloud service instances are regional. Keep this in mind and choose the same region for all resources in this tutorial.
1. [Create a resource group for the environment](/account/resource-groups).
1. Create an instance of [{{site.data.keyword.at_full_notm}}](/observe/activitytracker/create) for the region to allow the audit of all API calls for the region.
1. In that resource group create the services [{{site.data.keyword.contdelivery_short}}](/catalog/services/continuous-delivery),  [{{site.data.keyword.cos_full_notm}}](/objectstorage/create), [{{site.data.keyword.la_full_notm}}](/catalog/services/logdna?callback=%2Fobserve%2Flogging%2Fcreate), [{{site.data.keyword.mon_full_notm}}](/catalog/services/ibm-cloud-monitoring?callback=%2Fobserve%2Fmonitoring%2Fcreate) and [{{site.data.keyword.cloudant_short_notm}}](/catalog/services/cloudant).
1. Create a [Virtual Private Cloud](/vpc-ext/network/vpcs) including subnets. Select the resource group you created earlier and the region.
1. [Create a new Kubernetes cluster](/kubernetes/catalog/cluster) in {{site.data.keyword.containershort_notm}}, under **Infrastructure** select the new VPC as target, make sure to select the resource group created above.
1. Create a [{{site.data.keyword.vsi_is_short}} instance](/vpc-ext/compute/vs) in the same VPC.
1. From the Kubernetes cluster connect to the {{site.data.keyword.la_full_notm}} and {{site.data.keyword.mon_full_notm}} service instances to send logs and to monitor the cluster.

The following diagram shows where the project resources are created under the account:

![Diagram showing the project resources](./images/solution20-users-teams-applications/resource-deployment.svg){: caption="Project resources" caption-side="bottom"}

## Assign roles within the environment
{: #users-teams-applications-4}

1. Invite users to the account. 
1. Assign Policies to the users to control who can access the resource group, the services within the group and the {{site.data.keyword.containershort_notm}} instance and their permissions. Refer to the [access policy definition](/docs/containers?topic=containers-users#access_policies) to select the right policies for a user in the environment. Users with the same set of policies can be placed into the [same access group](/docs/account?topic=account-groups#groups). It simplifies the user management as policies will be assigned to the access group and inherited by all users in the group.

Usually, you can invite team members to the account as users. You could also leverage [trusted profiles](/docs/account?topic=account-create-trusted-profile) to map federated users to your defined roles (see above). By defining rules on the properties provided by the **Identity Provider** (IdP), you could assign external users to trusted profiles which you would define for the roles, e.g., Developer or Tester. Then you would apply policies similar to those defined for access groups.
{: tip}


Refer to the services documentation to understand how a service is mapping IAM roles to specific actions. See for example [how the {{site.data.keyword.mon_full_notm}} service maps IAM roles to actions](/docs/monitoring?topic=monitoring-iam).

Assigning the right roles to users will require several iterations and refinement. Given permissions can be controlled at the resource group level, for all resources in a group or be fine-grained down to a specific instance of a service, you will discover over time what are the ideal access policies for your project.

Some services also provide IAM-based data access controls, i.e. IAM groups combined with the service own group filtering. For example: 

- [Using groups to control data access in IBM Log Analysis](/docs/log-analysis?topic=log-analysis-group_data_access)
- [Using groups to control data access in IBM Cloud Activity Tracker](/docs/activity-tracker?topic=activity-tracker-group_data_access)
- [Monitoring RBAC, teams, and IAM integration](/docs/monitoring?topic=monitoring-iam_grant_team)

Note that by default accounts are configured for [unrestricted user view access](/docs/account?topic=account-iam-user-setting). Any user in the account can see any other user information. You can [change the setting](/iam/settings) to a restrictive mode.
{: tip}

A good practice is to start with the minimum set of permissions then expand carefully as needed. For Kubernetes, you will want to look at its [Role-Based Access Control (RBAC)](https://kubernetes.io/docs/reference/access-authn-authz/rbac/){: external} to configure in-cluster authorizations.

For the Development environment, the user responsibilities defined earlier could translate to the following:

|           | IAM Access policies |
| --------- | ----------- |
| Developer | - Resource Group: *Viewer*  \n - Platform Access Roles in the Resource Group: *Viewer*  \n - Logging & Monitoring service role: *Writer* |
| Tester    | - No configuration needed. Tester accesses the deployed application, not the development environments |
| Operator  | - Resource Group: *Viewer*  \n - Platform Access Roles in the Resource Group: *Operator*, *Viewer*  \n - Logging & Monitoring service role: *Writer* |
| Pipeline Service ID | - Resource Group: *Viewer*  \n - Platform Access Roles in the Resource Group: *Editor*, *Viewer* |
{: caption="Roles and permissions in the Development environment" caption-side="bottom"}

The IAM access configuration for groups is centralized in [access groups (IAM)](/iam/groups):
1. Select or create an access group.
1. Select the **Access policies** tab
1. Click **Assign access** button to assign policies as shown below
1. Click the **Users** tab of the **Access group** to add users to the group


![Configuration of permissions for the developer role](./images/solution20-users-teams-applications/edit-policy-new.png){: caption="Configuration of permissions for the developer role" caption-side="bottom"}
{: class="center"}


## Replicate for multiple environments
{: #users-teams-applications-5}

From there, you can replicate similar steps to build the other environments.

1. Create one resource group per environment.
2. Create one VPC per environment in the related resource group, each with a cluster and VSI.
3. Create the required service instances per environment in the related resource group.

The following diagram shows the development, testing, and production resource groups each having the same components with the VPC, cluster and VSI, and services.

![Diagram showing separate clusters and resource groups to isolate environments](./images/solution20-users-teams-applications/multiple-environments.svg){: caption="Separate clusters and resource groups to isolate environments" caption-side="bottom"}

Using a combination of tools like the [{{site.data.keyword.cloud_notm}} `ibmcloud` CLI](/docs/cli?topic=cli-install-ibmcloud-cli), [Terraform](/docs/ibm-cloud-provider-for-terraform?topic=ibm-cloud-provider-for-terraform-about), the [{{site.data.keyword.cloud_notm}} provider for Terraform](https://github.com/IBM-Cloud/terraform-provider-ibm){: external}, Kubernetes CLI `kubectl`, you can script and automate the creation of these environments.

The above design utilizes a Kubernetes cluster for each environment. This has the following benefits:
* no matter the environment, all clusters will tend to look the same,
* it is easier to control who has access to a specific cluster,
* it gives flexibility in the update cycles for deployments and underlying resources: When there is a new Kubernetes version, it gives you the option to update the Development cluster first, validate your application then update the other environment,
* it avoids mixing different workloads that may impact each other such as isolating the production deployment from the others.

However, often not all of that properties are needed and the use of fewer resources is desired. Then, another approach is to use [Kubernetes namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/){: external} in conjunction with [Kubernetes resource quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/){: external} to isolate environments and control resource consumption. The following diagram shows a **non-production** and a **production resource group** with a Kubernetes cluster in a VPC each. The non-production cluster has a **development** and **testing** namespace, the **production** cluster a production namespace.

![Diagram showing separate Kubernetes namespaces to isolate environments](./images/solution20-users-teams-applications/multiple-environments-with-namespaces.svg){: caption="Use separate Kubernetes namespaces to isolate environments" caption-side="bottom"}


## Setup delivery pipeline
{: #users-teams-applications-6}

When it comes to deploying to the different environments, your continuous integration / continuous delivery pipeline can be setup to drive the full process:
* continuously update the `Development` environment with the latest and greatest code from the `development` branch, running unit tests and integration tests on the dedicated cluster;
* promote development builds to the `Testing` environment, either automatically if all tests from the previous stages are OK or through a manual promotion process. Some teams will use different branches too here, merging the working development state to a `stable` branch as example;
* Repeat a similar process to move to the `Production` environment.

![A CI/CD pipeline from build to deploy](./images/solution20-users-teams-applications/cicd.png){: caption="A CI/CD pipeline from build to deploy" caption-side="bottom"}
{: class="center"}

When configuring the DevOps pipeline, make sure to use the API key of a service ID. Only the service ID should need to have the required rights to deploy apps to your clusters.

During the build phase, it is important to properly version the Docker images. You can use the Git commit revision as part of the image tag, or a unique identifier provided by your DevOps toolchain; any identifier that will make it easy for you to map the image to the actual build and source code contained in the image.

As you get acquainted with Kubernetes, [Helm](https://helm.sh/){: external}, the package manager for Kubernetes, will become a handy tool to version, assemble and deploy your application. [This sample DevOps toolchain](https://github.com/open-toolchain/simple-helm-toolchain){: external} is a good starting point and is preconfigured for continuous delivery to a Kubernetes cluster. As your project grows into multiple microservices, the [Helm umbrella chart](https://helm.sh/docs/howto/charts_tips_and_tricks/#complex-charts-with-many-dependencies){: external} will provide a good solution to compose your application.

## Expand the tutorial
{: #users-teams-applications-7}

Congratulations, your application can now safely be deployed from dev to production. Below are additional suggestions to improve application delivery.

* Follow the tutorial [Plan, create and update deployment environments](/docs/solution-tutorials?topic=solution-tutorials-plan-create-update-deployments#plan-create-update-deployments) to automate the deployment of your environments.
* Investigate [Using the IBM Cloud console to create VPC resources](/docs/vpc?topic=vpc-creating-a-vpc-using-the-ibm-cloud-console)

## Related information
{: #users-teams-applications-8}

* [Getting Started with {{site.data.keyword.iamshort}}](/docs/account?topic=account-access-getstarted)
* [Best practices for organizing resources in a resource group](/docs/account?topic=account-account_setup)
* [Analyze logs and monitor health](/docs/solution-tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis)
* [Continuous Deployment to Kubernetes](/docs/solution-tutorials?topic=solution-tutorials-continuous-deployment-to-kubernetes#continuous-deployment-to-kubernetes)
* [Hello Helm toolchain](https://github.com/open-toolchain/simple-helm-toolchain){: external}
* [Develop a microservices application with Kubernetes and Helm](https://github.com/open-toolchain/microservices-helm-toolchain){: external}
* [Grant permissions to a user to view logs](/docs/log-analysis?topic=log-analysis-work_iam)
* [Grant permissions to a user to view metrics](/docs/monitoring?topic=monitoring-iam)
