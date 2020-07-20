---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-07-20"
lasttested: "2020-07-20"

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

# How to write a tutorial
{: #change-me-to-the-filename-without-md-extension-it-must-be-unique-across-all-tutorials}

This template shows how to structure a tutorial but also some writing tips and general documentation on how to work with tutorials.
{:shortdesc}

## Objectives
{: #objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [IaaS or PaaS service name](https://{DomainName}/catalog/services/ServiceName)
* [IaaS or PaaS service name](https://{DomainName}/catalog/services/ServiceName)
* [IaaS or PaaS service name](https://{DomainName}/catalog/services/ServiceName)

* Ansible (see Step 4 in word doc)

<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution1/Architecture.png)
</p>

1. The user does this
2. Then that

## Before you begin
{: #prereqs}

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
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-getting-started) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{:tip}
<!--#/istutorial#-->

In addition, make sure you have:
- a **namespace** created in the {{site.data.keyword.registryfull_notm}}
- and Android Studio installed.

<!--##isworkshop#-->
<!--
## Start a new {{site.data.keyword.cloud-shell_notm}}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell).

-->
<!--#/isworkshop#-->

## Create the multi-cluster
{: #create-multi-cluster}

Use a master node from the on-premises cluster as a deployer to create the VPC, its virtual server instances, and a number of other associated resources. 

### Set up the IBM Cloud CLI
{: #set-up-cli}

1. If possible, log in to the on-premises master node as the root user.
2. Install the {{site.data.keyword.cloud_notm}} CLI:

  ```
  curl -sL https://ibm.biz/idt-installer | bash
  ```
  {: pre}

3. Test the {{site.data.keyword}} CLI:

  ```
  ibmcloud dev help
  ```
  {: pre}

4. Log in to the {{site.data.keyword.cloud_notm}} with your credentials:

  ```
  ibmcloud login
  ```
  {: pre}

5. Add the VPC infrastructure capabilities plugin to the CLI:

  ```
  ibmcloud plugin install vpc-infrastructure
  ```
  {: pre}

6. Add DNS-related commands:

  ```
  ibmcloud plugin install DNS
  ```
  {: pre}

7. Set the infrastructure (is) commands target to VPC gen 2:

  ```
  ibmcloud is target --gen 2
  ```
  {: pre}

8. Select the region where you would like your cloud resources to reside and set them as the target. You can use `ibmcloud regions` to list them. If you choose the region "us-south", the command is the following:

  ```
  ibmcloud target -r us-south
  ```
  {: pre}

### Specify the cloud cluster configuration
{: #specify-cloud-cluster-configuration}




## Create an IBM Cloud API key
{: #create-api-key}

You need an {{site.data.keyword.cloud_notm}} API key for your cloud account to provide Terraform with the credential it needs to provision resources on your behalf. If you do not already have an `api-key`, you can create one with the following commands:

1. Log in to the {{site.data.keyword.cloud_notm}} CLI:

  ```
  ibmcloud login
  ```
  {: pre}

2. Create the API key:

  ```
  ibmcloud iam api-key-create <name of key> --file <file to write the key> -d "your description of the key"
  ```
  {: pre}

3. You can find your API key in the text file (the file name you supplied for the `--file` parameter) on the line labeled `apikey`. Copy that key and store it in an environment variable where Terraform can find it:

  ```
  export IBMCLOUD_API_KEY="<the apikey from the text file you just created>"
  ```
  {: pre}

## Provision the cloud resources
{: #provision-cloud-resources}

1. Use an Ansible playbook to install Terraform and the IBM Cloud Terraform plugin:

  ```
  ansible-playbook -i tf_inventory.yml create_vpc.yml --tags "install-terraform"
  ```
  {: pre}



## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{: #related}

* [Relevant links in IBM Cloud docs](https://{DomainName}/docs/cli?topic=blah)
* [Relevant links in external sources, i.e. normal link](https://kubernetes.io/docs/tutorials/hello-minikube/)

## Writing guide
{: #writing_guide}


## Markup for workshops

Some tutorials are [turned into workshops](https://github.ibm.com/lab-in-a-box/tutorials-to-gitbook/blob/master/.travis.yml#L9).

### Tutorial-only content

To mark content as visible only in a tutorials enclose the content with `<!--##istutorial#-->` and `<!--#/istutorial#-->` as:

```markdown
<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->
```

### Workshop-only content

To have content showing only in a workshop, use:

```markdown
<!--##isworkshop#-->
<!--
## Configure the access to your cluster
{: #access-cluster}

This section will only appear in a workshop and not in the tutorial.
-->
<!--#/isworkshop#-->
```

Notice that the all section content is surrounded by html comments markup `<!--` and `-->`. This makes sure the content is not visible when the docs framework builds `test.cloud.ibm.com`. When we push changes to the `publish` branch, [`sync.sh`](https://github.ibm.com/cloud-docs/solution-tutorials/blob/draft/scripts/sync.sh#L32) makes sure to remove all markup so the workshop specific sections do not show up in our GitHub public repo.

