---
copyright:
  years: 2019
lastupdated: "2019-06-15"
lasttested: "2019-06-15"

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

# Deploy applications on VSI in VPC
{: #vpc-app-deploy}

{:shortdesc}
This tutorial will walk you through the following mechanisms for installing software onto a Virtual Server Instance, VSI on the Virtual Private Cloud for Classic, VPC.

## Objectives
{: #objectives}

* Understand the need for updating system software and open source software
* Utilize manual steps for installing software
* Identify automated processes that can be used for installing software

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

```
 ---
|   |
|vsi| <--ibm cloud----> ibm cloud mirrors
|   | <--internet-----> open source software packages: npm, pyPI, github, ...
|   | <--on premises--> my own software package and data
 ---
  ^
  |
  +-- manual or automation drivers
```

<p style="text-align: center;">
  ![Architecture](images/solution49-vpc-app-deploy/ArchitectureDiagram.png)
</p>

1. The user identifies the software that is required
1. Manually practices the installation of the software
1. Optionally automates the procedures using API, CLI, Terraform or Ansible

## Before you begin
{: #prereqs}

1. Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview).

## Create services
{: #setup}

- Run the provided script or follow the steps mentioned in [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) only the public subnet and web server is required for this tutorial.
- Optionally follow the steps mentioned in [securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.


## General software installation principles
{: #section_one}
Software can generally be though of coming from the following places (align wording here with diagram above):
- IBM cloud mirrors
- Internet available respositories
- On premises repositories

IBM instances are initially populated with popular off the shelf operating systems.  Consider if upgrading the installed software is appropriate and do so if necessary.
(pfq find the answers:)
- How frequently are these upgraded?
- What prompts IBM to create a new version?
- Do we suggest customers upgrade instance OS software as part of their own initialization processes?

For illustrative purposes the following software will be installed:
- NGINX - an example open source software package
- Static web site from github
- Data uploaded from on premises

## Software installation using ssh
{: #section_two}

Using Centos as an example:

Identify the VSI created above.  Modify the steps to use the bastion host as required:
1. scp data.zip root@ip:<IP>
1. ssh root@ip
1. update repositories
1. upgrade software intalled
1. install nginx
1. install git
1. git clone static website repository
1. unzip data.zip into the website
1. systemctl ...nginx
1. test

## Repeat the same steps with cli
{: #section_two}

## Repeat the same steps with terraform
{: #section_two}

## Repeat the same steps with ansible
{: #section_two}

## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- add a load balancer for high availability and zero down time software upgrades
- install operating system patches
- install new software/data from internet repositories
- install new software/data from on premises

## Related content
{: #related}

