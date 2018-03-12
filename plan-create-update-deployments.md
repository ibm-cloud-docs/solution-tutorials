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

* Define an environment we want to deploy/automate
* Overview of the available tools
* Configure Terraform for IBM Cloud
* Review the Terraform files and scripts needed to deploy such an environment
  * with terraform and other tools as terraform can't do everything
* Deploy this environment in your account

## Products
{: #products}

This tutorial uses the following products:
* [IBM Cloud provider for Terraform]()
* [IBM Cloud Container Service]()
* [IAM]()

<p style="text-align: center;">
![](images/solutionXX/Architecture.png)
</p>

1. The user does this
2. Then that

## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins
* [Install Terraform](https://www.terraform.io/intro/getting-started/install.html)
* [Install the IBM Cloud Provider for Terraform](https://ibm-cloud.github.io/tf-ibm-docs/index.html)

## Define an environment we want to deploy/automate

Developers do not like to write the same thing twice. Similarly they don't like having to go through tons of clicks in a user interface to setup an environment. Shell scripts have been long used by system administrators and developers to automate repetitive, error-prone and tedious tasks.

https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

IaaS, PaaS, SaaS, FaaS have given developers high level of abstraction and it became easier to acquire resources like bare metal servers, managed databases, virtual machines, etc. But once you have provisioned these resources, you need to connect them together, to configure user access, etc.

Being able to automate all these steps and to repeat the installation, configuration under different environments is a must-have these days.

Multiple environments are pretty common, but slight differences (credentials, capacity, networking)


## Overview of the available tools



The first tool to create repeatable deployments is the IBM Cloud command line tool - the `bx` CLI.

```
NAME:
   bx - A command line tool to interact with IBM Cloud

USAGE:
   [environment variables] bx [global options] command [arguments...] [command options]

VERSION:
   0.6.4+41cb1aa9-2017-12-19T04:00:09+00:00

COMMANDS:
   api                    Set or view target API endpoint
   login                  Log user in
   logout                 Log user out
   target                 Set or view the targeted region, account, resource group, org or space
   info                   View cloud information
   config                 Write default values to the config
   update                 Update CLI to the latest version
   regions                List all the regions
   cloud-functions, wsk   Bluemix CLI plug-in for IBM Cloud Functions
   account                Manage accounts, users, orgs and spaces
   catalog                Manage catalog
   resource               Manage resource groups and resources
   iam                    Manage identities and access to resources
   app                    Manage Cloud Foundry applications and application related domains, routes and certificates
   service                Manage Cloud Foundry services
   billing                Retrieve usage and billing information
   plugin                 Manage plug-ins and plug-in repositories
   cf                     Run Cloud Foundry CLI with Bluemix CLI context
   sl                     Gen1 infrastructure Infrastructure services
   cr                     Commands for interacting with IBM Cloud Container Registry.
   cs                     Plug-in for the IBM Cloud Container Service.
   dev                    A CLI plugin to create, manage, and run projects on IBM Cloud
   schematics             IBM Cloud Schematics plug-in
   as                     Manage Bluemix auto-scaling service
   help
```

With `bx` and the available plugins, you can automate the creation and configuration of your cloud resources.


Another tool introduced in [this other tutorial](./infrastructure-as-code-terraform.html) is [Terraform](https://www.terraform.io/) by HashiCorp. Quoting HashiCorp, *Terraform enables you to safely and predictably create, change, and improve infrastructure. It is an open source tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.* It is infrastructure as code. You write down what your infrastructure should look like and Terraform will create, update, remove cloud resources as needed.

Terraform works with providers. A provider is responsible for understanding API interactions and exposing resources. IBM Cloud has [its provider for Terraform](https://github.com/IBM-Cloud/terraform-provider-ibm) enabling users of IBM Cloud to manage resources with Terraform. Although Terraform is categorized as infrastructure as code, it is not limited to Infrastructure-As-A-Service resources. The IBM Cloud Provider for Terraform supports IaaS (bare metal, virtual machine, network services, etc.), CaaS (IBM Cloud Container Service and Kubernetes clusters), PaaS (Cloud Foundry and services) and FaaS (IBM Cloud Functions) resources.

## Review the Terraform files and scripts needed to deploy such an environment
  * with terraform and other tools as terraform can't do everything

| Action                                                         | Supported by Terraform |
| -------------------------------------------------------------- | - |
| Create resource group                                          | Not supported |
| Create Cloud Foundry organization                              | OK |
| Create Cloud Foundry space                                     | OK |
| Invite users to org/space                                      | OK |
| Assign user roles to org/space                                 | OK |
| Assign IAM roles to user on resource group                     | Not supported |
| Create Kubernetes cluster in resource group with 1 worker node | OK |
| Provision Cloud Foundry services                               | OK |
| Add workers to the cluster                                     | OK (same machine type) |
| Bind the services to the cluster                               | OK |
| Install Helm in the cluster                                    | Should be feasible but maybe not the right place |
| Deploy hello world in the cluster                              | Not supported |

+ environments
  one folder per environment
  one folder for the global resources - reused by environments
+ modules
  reusable blocks - referenced by the environments, could be versioned
+ states
  separate tree for the states with the same layout as environments
+ vars
  tfvars

* All of your code should be in version control. two repos: one for modules, and one for live infrastructure. Let’s look at these one at a time.
* think about reuse, "don't repeat yourself", it is code, think about it as other code
* think about resource isolation
* import states between components of the same environment, and from global
* persist states in a reliable storage

use at least two environments, staging and production

## Deploy this environment in your account

### Install bx and Terraform for IBM Cloud

### Configure variables to match your environments

### Terraforming!

### Updating

## Clean up resources

```
terraform destroy
```
Steps to take to remove the resources created in this tutorial

## Related information

* Terraform tutorial
* Terraform provider
* [Examples using IBM Cloud Provider for Terraform](https://github.com/IBM-Cloud/terraform-provider-ibm/tree/master/examples)
* IAM documentation
* CLI documentation
