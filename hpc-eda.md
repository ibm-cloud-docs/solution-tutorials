---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-07-20"
lasttested: "2020-07-20"

---
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}
{:note: .note}

# Implementing Electronic Design Automation for High Performance Computing
{: #hpc-eda}

This tutorial demonstrates how to extending an existing on-premise IBM Spectrum LSF cluster to the IBM cloud using our latest Gen 2 Virtual Server Instances and Virtual Private Cloud (VPC).
{:shortdesc}

## Objectives
{: #objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* IBM Spectrum LSF
* IBM Cloud Direct Link
* IBM Cloud VPC
* IBM Cloud CLI

* Ansible (see Step 4 in word doc)

<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

</p>

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

## Step 2: Specify the Cloud Cluster Configuration
With the IBM Cloud CLI now configured, you can get the scripts and use the CLI to gather the information that you need to set up and use the automated provisioning and cloud cluster setup scripts.

1. The scripts that you will be using reside on Github.  To use them you will clone them from the Github repository.
2. Start the process by copying the tf_inventory.in file to tf_inventory.yml. See [The tf_inventory.yml file parameters](#tf_inventory-parameters).
3. Save the configuration file and create a backup copy.

### The tf_inventory.yml file parameters
{: #tf_inventory-parameters}

Much of the work needed to configure your cloud cluster is configuring the following parameters in the tf_inventory.yml file:

|Parameter|Description|
|---------|-----------|
|vpc_region|The available geographic regions for VPC Gen2 resources can be displayed with the command:<br><br>`ibmcloud regions`<br><br>In most cases, choose the region that is nearest your datacenter.|
|vpc_zone|Display the available zones for the target region (set in step 1).<br>Zones exist primarily to provide redundancy within a given region.  For the purposes of this tutorial, choose any of the available zones within a region.<br><br>`ibmcloud is zones`|
|resource_prefix|This can be any value. It must be only lowercase letters, numbers, hyphens, and is limited to 50 characters. This limitation to allows Terraform space to append descriptive suffixes to each resource.|
|domain_name|Your domain name.|
|worker_nodes|The number of LSF worker nodes to deploy to the cluster.|
|master_nodes|The number of LSF master nodes to deploy to the cluster.|
|key_name|This is the name of an ssh public key that you have stored in the IBM Cloud.  This key will be added to the access list of all newly provisioned virtual resources.<br>Note: If you use the key name of the public key for the machine and userid you plan to use for the deployer (such as /root/.ssh/id_rsa.pub), you will not need to add anything to the access lists of all the nodes before deploying LSF.<br>You can create the key instance in the cloud using the following commands:<br><br>`ibmcloud is keys (to view existing keys)`<br>`ibmcloud is key-create <descriptive name for key> @/root/.ssh/id_rsa.pub`|
|ssh_key_file|The ssh key file for the deployer that you will be using to log in to your provisioned hosts.  Typically, this is id_rsa unless you are using a non-standard file name.   The name of the matching public key will be inferred as <name of private key>.public (such as id_rsa.public ).|
|lsf_cluster_name|The name you want LSF to apply to your cloud based cluster.|
|worker_profile<br>master_profile<br>login_profile<br>|These are the names of the instance profiles that you would like created for the three  different types of instances.  The instance profile is a unique name (based on a terse description) for a particular profile.  You can see a listing of all available profiles and their associated attributes for your region with the following command:<br><br>`ibmcloud is in-prs`<br><br>The profiles you choose should be  specific to your workload needs for the worker and master. The login profile will likely be a minimal configuration.|
|image_name|This should be a recent RedHat or Centos amd64 release.  You can see the available options with the following command.<br><br>`ibmcloud is images`||volume_capacity|The size in Gigabytes for the cloud NFS volume your cloud cluster nodes will share.|
|volume_dir|The mount point for the cloud shared NFS volume.|
|vpn_peer|_address_: The public IP address of your on-premise VPN gateway.<br>_cidrs_: A list of CIDRs for the private IPs that will be accessible in your VPC.<br>_psk_: A passkey for authenticating with the VPN.  You can encrypt using ansible-vault.<br><br>`echo -n <your_key> \| ansible-vault encrypt_string --ask-vault-pass`<br><br>_Security_:There are a number of parameters in this section.  You can configure them now or they can be left to the defaults and edited as needed when you prepare the vpn.yml file in Step 5: Connect Your on-premise and Cloud Networks with a VPN.<br>Note: If you intend to install Terraform using the Ansible playbook as described below in Step 4: Provision the Cloud Resources, you can customize the installation to place the Terraform command and the IBM Cloud Terraform plugin in your preferred locations.  The defaults will probably work in most cases.|
|tfbinary_path|Location to install the Terraform command.|
|tfplugin_path|The location of the IBM Cloud specific Terraform plugin.|

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
