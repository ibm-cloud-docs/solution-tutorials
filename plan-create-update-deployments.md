---
copyright:
  years: 2018
lastupdated: "2018-03-31"

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

# Plan, create and update deployment environments

This tutorial introduces tools to automate the creation and maintenance of multiple deployment environments.
{:shortdesc}

## Objectives
{: #objectives}

* Define an environment to deploy
* Overview of the available tools
* Write scripts to automate the deployment
* Configure the tools for your account
* Deploy this environment in your account

## Products
{: #products}

This tutorial uses the following products:
* [IBM Cloud provider for Terraform](https://ibm-cloud.github.io/tf-ibm-docs/index.html)
* [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
* [Identity and Access Management](https://console.bluemix.net/iam/#/users)
* [{{site.data.keyword.Bluemix_notm}} command line interface - the `bx` CLI](https://console.bluemix.net/docs/cli/index.html)
* [HashiCorp Terraform](https://www.terraform.io/)

<p style="text-align: center;">
![](./images/solution26-plan-create-update-deployments/architecture.png)
</p>

1. A set of Terraform files are created to describe the target infrastructure as code.
1. An operator uses `terraform apply` to provision the environments.
1. Shell scripts are written to complete the configuration of the environments.
1. The operator runs the scripts against the environments
1. The environments are fully configured, ready to be used.

## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins
* [Install Terraform](https://www.terraform.io/intro/getting-started/install.html)
* [Install the IBM Cloud Provider for Terraform](https://ibm-cloud.github.io/tf-ibm-docs/index.html)

## Define an environment we want to deploy/automate

Developers do not like to write the same thing twice. Similarly they don't like having to go through tons of clicks in a user interface to setup an environment. Shell scripts have been long used by system administrators and developers to automate repetitive, error-prone and tedious tasks.

IaaS, PaaS, SaaS, FaaS have given developers high level of abstraction and it became easier to acquire resources like bare metal servers, managed databases, virtual machines, etc. But once you have provisioned these resources, you need to connect them together, to configure user access, etc. Being able to automate all these steps and to repeat the installation, configuration under different environments is a must-have these days.

Multiple environments are pretty common with slight differences like credentials, capacity, networking. In [this other tutorial](./users-teams-applications.html), we've introduced best practices to organize users, teams and applications and a sample scenario. Building on this, how could we automated the creation of these environments?

* DEVELOPMENT
* TESTING
* PRODUCTION

## Overview of the available tools

The first straightforward tool to create repeatable deployments is the [{{site.data.keyword.Bluemix_notm}} command line interface - the `bx` CLI](https://console.bluemix.net/docs/cli/index.html). With `bx` and its plugins, you can automate the creation and configuration of your cloud resources.

Another tool introduced in [this tutorial](./infrastructure-as-code-terraform.html) is [Terraform](https://www.terraform.io/) by HashiCorp. Quoting HashiCorp, *Terraform enables you to safely and predictably create, change, and improve infrastructure. It is an open source tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.* It is infrastructure as code. You write down what your infrastructure should look like and Terraform will create, update, remove cloud resources as needed.

Terraform works with providers. A provider is responsible for understanding API interactions and exposing resources. {{site.data.keyword.Bluemix_notm}} has [its provider for Terraform](https://github.com/IBM-Cloud/terraform-provider-ibm) enabling users of {{site.data.keyword.Bluemix_notm}} to manage resources with Terraform. Although Terraform is categorized as infrastructure as code, it is not limited to Infrastructure-As-A-Service resources. The IBM Cloud Provider for Terraform supports IaaS (bare metal, virtual machine, network services, etc.), CaaS ({{site.data.keyword.containershort_notm}} and Kubernetes clusters), PaaS (Cloud Foundry and services) and FaaS ({{site.data.keyword.openwhisk_short}}) resources.

## Review the Terraform files and scripts needed to deploy such an environment

[This Git repository](https://github.com/IBM-Cloud/multiple-environments-as-code) has all the configuration files to setup the environments defined earlier.

```
git clone https://github.com/IBM-Cloud/multiple-environments-as-code
```

Structure of the repo

* All of your code should be in version control.

### Infrastructure with Terraform

**Global**

All environments share a common organization. Under the [global](terraform/global)

Only the account owner can create an org in the account so get the account API key to do this part

outputs environment files from terraform to consume them in bx scripts

if you already have an org you want to reuse, you can import its definition in the global state file


* import states between components of the same environment, and from global

**Individual Environments**

Terraform has a feature called workspaces. Workspaces are used to use the same terraform files (.tf) with different environments. In our example, we can use *development*, *staging* and *production* as workspace names. We will use the same Terraform definitions but with different configuration variables (different names, different capacities).

+ think about reuse, "don't repeat yourself", it is code, think about it as other code
+ think about resource isolation
+ environments
  one folder per environment
  one folder for the global resources - reused by environments
+ modules
  reusable blocks - referenced by the environments, could be versioned
  not shown here
  two repos: one for modules, and one for live infrastructure. Let’s look at these one at a time.
+ states
  separate tree for the states with the same layout as environments
+ vars
  tfvars

use terraform workspace but if you have a larger terraform config, split it in multiple as described in https://www.terraform.io/docs/state/workspaces.html#best-practices

* persist states in a reliable storage. in the example, we use the local backend to save state files. For production use, you will want to use a different backend to persist the state on a remote location. https://www.terraform.io/docs/backends/types/index.html

Not all IBM Cloud resource types are currently availabe in the {{site.data.keyword.Bluemix_notm}} provider for Terraform

### Policies with IAM

bx iam user-policy-create

## Deploy this environment in your account

### Install bx and Terraform for IBM Cloud

### Configure variables to match your environments

- get a IBM Cloud API key - to create an org you need the API key of the account user or you can import an existing orgs and only create spaces
  - get its ID with `bx iam org <org_name> --guid`
  - then terraform import ibm_org.organization GUID

- pick a location for your cluster with `bx cs locations`
- use bx cs vlans <location> to find available private and public VLANs for your cluster
- use bx cs machine-types to figure out what machine types you can use at this location

### Terraforming!

### Updating

### using Cloud Object Storage as a backend

Works today thanks to S3 compatibility

1. Provision COS
2. Create credentials to obtain the access key and secret key https://console.bluemix.net/docs/services/cloud-object-storage/iam/service-credentials.html#service-credentials make sure to add Inline Configuration Parameters (Optional) field: {“HMAC”:true}

```
terraform {
  backend "s3" {
    bucket                      = "terraforming"
    key                         = "global.tfstate"
    region                      = "us-geo"
    skip_region_validation      = true
    skip_credentials_validation = true
    skip_get_ec2_platforms      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    endpoint                    = "s3-api.us-geo.objectstorage.softlayer.net"
    access_key                  = "<from-credentials>"
    secret_key                  = "<from-credentials>"
  }
}
```

with COS, we miss Locking and Versioning


## Clean up resources

Steps to take to remove the resources created in this tutorial

```
terraform destroy
```

## Related information

* Terraform tutorial
* Terraform provider
* [Examples using IBM Cloud Provider for Terraform](https://github.com/IBM-Cloud/terraform-provider-ibm/tree/master/examples)
* IAM documentation
* CLI documentation
