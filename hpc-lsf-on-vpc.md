---
subcollection: solution-tutorials
copyright:
  years: 2020, 2021
lastupdated: "2021-08-26"
lasttested: "2020-12-21"

content-type: tutorial
services: vpc
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}
{:note: .note}

# Provision an IBM Spectrum LSF cluster on the {{site.data.keyword.vpc_short}}
{: #hpc-lsf-on-vpc}
{: toc-content-type="tutorial"}
{: toc-services="vpc"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial demonstrates how to provision and configure {{site.data.keyword.Bluemix_notm}} resources to create an IBM Spectrum LSF cluster.
{: shortdesc}

There are many reasons to consider hosting your IBM Spectrum LSF managed workload on the {{site.data.keyword.cloud}}.  While some reasons might be specific to a particular enterprise, this tutorial will demonstrate the advantages in the areas of cost, speed and flexibility. {{site.data.keyword.vpc_full}} offers essentially unlimited compute power that you can provision and return quickly to address increasing or decreasing demand and still allow you to manage costs.
This tutorial and the associated automation scripts will provide an easy way to get started by giving you an automated path to provisioning cloud based resources and configuring them to run an IBM Spectrum LSF Cluster.

## Objectives
{: #hpc-lsf-on-vpc-objectives}

* Automatically provision the resources needed for an IBM Spectrum LSF cluster on the {{site.data.keyword.vpc_full}}.
* Install and configure the Cloud based LSF cluster using Ansible automation.

![Architecture diagram](images/solution61-hpc-lsf-on-vpc/hpc-lsf-on-vpc-arch.svg){: class="center"}
{: style="text-align: center;"}

## Before you begin
{: #hpc-lsf-on-vpc-prereqs}

You need the following to complete this tutorial:
* A workstation or cloud instance to serve as the orchestrator for this deployment.  It must be capable of running the following tools
* Red Hat&reg; Ansible&reg; version 2.7 or higher
* [Terraform CLI and the IBM Cloud Provider plug-in](/docs/terraform?topic=terraform-getting-started)
* {{site.data.keyword.cloud_notm}} CLI

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

You will also need:
* An {{site.data.keyword.cloud_notm}} billable account
* A Spectrum LSF version 10.2 or higher installation binary. See [IBM Spectrum LSF Suites](https://www.ibm.com/products/hpc-workload-management) or contact your IBM Sales representative for details.

## Set up the {{site.data.keyword.cloud_notm}} CLI
{: #hpc-lsf-on-vpc-set-up-cli}
{: step}

1. Log into the machine you will use for this deployment.
2. Install the {{site.data.keyword.cloud_notm}} CLI. See [Installing from the shell](/docs/cli?topic=cli-install-ibmcloud-cli#shell_install).
3. Test the {{site.data.keyword.cloud_notm}} CLI:

   ```sh
   ibmcloud dev help
   ```
   {: pre}

4. Log in to the {{site.data.keyword.cloud_notm}} with your credentials:

   ```sh
   ibmcloud login
   ```
   {: pre}

5. Add the VPC infrastructure capabilities plugin to the CLI:

   ```sh
   ibmcloud plugin install vpc-infrastructure
   ```
   {: pre}

6. Add DNS-related commands:

   ```sh
   ibmcloud plugin install DNS
   ```
   {: pre}

7. Set the infrastructure (is) commands target to {{site.data.keyword.vpc_short}}:

   ```sh
   ibmcloud is target --gen 2
   ```
   {: pre}

8. Select the region where you would like your cloud resources to reside and set them as the target. You can use `ibmcloud is regions` to list them. If you choose the region "us-south", the command is the following:

   ```sh
   ibmcloud target -r us-south
   ```
   {: pre}

## Prepare your environment
{: #hpc-lsf-on-vpc-prep-environment}
{: step}

### Specify the cloud cluster configuration
{: #hpc-lsf-on-vpc-specify-cloud-cluster-configuration}

With the {{site.data.keyword.cloud_notm}} CLI now configured, you can get the LSF hybrid cloud scripts and use the CLI to gather the information that you need to set up and use the automated provisioning and cloud cluster setup scripts.

1. Download or clone the [IBM Spectrum LSF hybrid cloud scripts](https://github.com/IBMSpectrumComputing/lsf-hybrid-cloud) from GitHub.

   ```sh
   git clone https://github.com/IBMSpectrumComputing/lsf-hybrid-cloud.git
   ```
   {: pre}

2. Copy the tf_inventory.in file to tf_inventory.yml.
3. Fill out the parameters in the tf_inventory.yml file. See [The tf_inventory.yml file parameters](#tf_inventory-parameters).
4. Save the tf_inventory.yml file and create a backup copy.

#### The tf_inventory.yml file parameters
{: #hpc-lsf-on-vpc-tf_inventory-parameters}

Much of the work needed to configure your cloud cluster is configuring the following parameters in the tf_inventory.yml file:

|Parameter|Description|
|---------|-----------|
|vpc_region|The available geographic regions for {{site.data.keyword.vpc_short}} resources can be displayed with the command:  \n  \n `ibmcloud regions`  \n \n In most cases, choose the region that is nearest your datacenter.|
|vpc_zone|Display the available zones for the target region (set in step 1).  \n Zones exist primarily to provide redundancy within a given region.  For the purposes of this tutorial, choose any of the available zones within a region.  \n \n `ibmcloud is zones`|
|resource_prefix|This can be any value. It must be only lowercase letters, numbers, hyphens, and is limited to 50 characters. This limitation to allows Terraform space to append descriptive suffixes to each resource.|
|domain_name|Your domain name.|
|worker_nodes|The number of LSF worker nodes to deploy to the cluster.|
|master_nodes|The number of LSF master nodes to deploy to the cluster.|
|key_name|This is the name of an ssh public key that you have stored in the IBM Cloud.  This key will be added to the access list of all newly provisioned virtual resources.  \n Note: If you use the key name of the public key for the machine and userid you plan to use for the deployer (such as /root/.ssh/id_rsa.pub), you will not need to add anything to the access lists of all the nodes before deploying LSF.  \n You can create the key instance in the cloud using the following commands:  \n \n `ibmcloud is keys (to view existing keys)`  \n `ibmcloud is key-create <descriptive name for key> @/root/.ssh/id_rsa.pub`|
|ssh_key_file|The ssh key file for the deployer that you will be using to log in to your provisioned hosts.  Typically, this is id_rsa unless you are using a non-standard file name.   The name of the matching public key will be inferred as &lt;name of private key&gt;.pub (such as id_rsa.pub ).|
|lsf_cluster_name|The name you want LSF to apply to your cloud based cluster.|
|worker_profile\n master_profile  \n login_profile  \n |These are the names of the instance profiles that you would like created for the three  different types of instances.  The instance profile is a unique name (based on a terse description) for a particular profile.  You can see a listing of all available profiles and their associated attributes for your region with the following command:  \n  \n `ibmcloud is in-prs`  \n  \n The profiles you choose should be  specific to your workload needs for the worker and master. The login profile will likely be a minimal configuration.|
|image_name|This should be a recent RedHat or Centos amd64 release. You can see the available options with the following command.  \n  \n  `ibmcloud is images`|
|volume_capacity|The size in Gigabytes for the cloud NFS volume your cloud cluster nodes will share.|
|volume_dir|The mount point for the cloud shared NFS volume.|
|vpn_peer|This section does not apply to this type of deployment and will be ignored, so you can leave this section as is|
|tfbinary_path|Location to install the Terraform command.  \n Note: If you intend to install Terraform using the Ansible playbook as described below in Step 4: Provision the Cloud Resources, you can customize the installation to place the Terraform command and the {{site.data.keyword.cloud_notm}} Terraform plugin in your preferred locations.  The defaults will probably work in most cases.|
|tfplugin_path|The location of the IBM Cloud specific Terraform plugin.|

### Create an {{site.data.keyword.cloud_notm}} API key
{: #hpc-lsf-on-vpc-create-api-key}

You need an {{site.data.keyword.cloud_notm}} API key for your cloud account to provide Terraform with the credential it needs to provision resources on your behalf. If you do not already have an `api-key`, you can create one with the following commands:

1. If you are not already logged in, log in to the {{site.data.keyword.cloud_notm}} CLI:

   ```sh
   ibmcloud login
   ```
   {: pre}

2. Create the API key:

   ```sh
   ibmcloud iam api-key-create <name of key> --file <file to write the key> -d "your description of the key"
   ```
   {: pre}

3. You can find your API key in the text file (the file name you supplied for the `--file` parameter) on the line labeled `apikey`. Copy that key and store it in an environment variable where Terraform can find it:

   ```sh
   export IBMCLOUD_API_KEY="<the apikey from the text file you just created>"
   ```
   {: pre}

## Provision the cloud resources
{: #hpc-lsf-on-vpc-provision-cloud-resources}
{: step}

If it is not already installed, you need Ansible version 2.7 or higher installed to continue.  If Ansible is already installed, be sure to check the version and update if necessary.

1. After Ansible is installed, use an Ansible playbook to install Terraform and the {{site.data.keyword.cloud_notm}} Terraform plugin:

   ```sh
   ansible-playbook -i tf_inventory.yml create_vpc.yml --tags install-terraform
   ```
   {: pre}

2. The `create_vpc.yml` playbook is a hybrid that combines Ansible configuration with Terraform provisioning. You won’t interact directly with Terraform because all of the functions are orchestrated by Ansible. Because Terraform runs behind the scenes, some of the output files from this process will be familiar to Terraform users. These output files are needed to access the newly provisioned resources and complete the cluster setup. Before running the playbook, specify the location of the files by setting the `GEN_FILES_DIR` environment variable to tell the playbook where you would like the output files placed:

   ```sh
   export GEN_FILES_DIR=<a directory of your choice>
   ```
   {: pre}

   This playbook invokes Terraform to do the following:
   *	Creates and configures the {{site.data.keyword.vpc_short}} based on the parameters you provided in the `tf_inventory.yml` file
   *	Provisions the specified master and worker virtual instances
   *	Provisions a login virtual machine that will be used as a login jump box for the cluster
   *	Provisions and configures a DNS server
   *	Provisions storage for the virtual instances including storage for the NFS volume
   *	Provisions a floating IP (fip) for the login node.  This is a public IP used to SSH into the cluster.
   *	Creates an Ansible inventory file for the cluster to be used by subsequent Ansible playbooks

3. If this is the first time you are running the playbook, ensure that there is not an existing copy of the `terraform.tfstate` file in `GEN_FILES_DIR`. If you previously ran the playbook and it failed, don't delete the `terraform.tfstate` file. You will need it to restart the playbook, beginning with place that it failed.
4. Run the playbook:

   ```sh
   ansible-playbook -i tf_inventory.yml create_vpc.yml
   ```
   {: pre}

In addition to provisioning all of the cloud resources to create your cloud-based LSF cluster, this command creates the following files in the directory that you specified with the `GEN_FILES_DIR` environment variable:
* **cluster.inventory**: To use with subsequent steps (including resource connector)
* **ssh_config**: An ssh config file to allow a proxyjump login to the cluster nodes with private IPs via the login node (`ssh -F <ssh_config> <host>`)
* **terraform.tfstate**: Terraform status (required for tear down of resources)
* **terraform.tfvars**: Terraform variables (required for tear down of resources)
* **GEN2-cfg.yml**: Needed as input for the resource connector
* **vpn.yml**: Not used for this configuration
* **clusterhosts**: An `/etc/hosts-style` file with the cluster master and worker nodes

You can verify the resources that were created by viewing the `terraform.tfstate` file. You can get a quick overview by looking at the `resource_name` tag in the `terraform.tfstate` file:

   ```sh
   grep resource_name $GEN_FILES_DIR/terraform.tfstate
   ```
   {: pre}


## Deploy LSF on IBM Cloud to create the {{site.data.keyword.cloud_notm}} cluster
{: #hpc-lsf-on-vpc-deploy-lsf-cloud-cluster}
{: step}

1. To install and configure LSF on IBM Cloud, you will need to provide some information to the LSF install scripts by configuring the `lsf_install` file in the `group_vars` directory with the following parameters:

   Note: you will need at least the following 3 paramaters for this configuration.
   * **local_path**: The full path to the directory where the lsf binary resides on the local machine.
   * **target_path**: The full path to where the lsf binary will be copied on the cloud master.
   * **bin**: The name of the LSF install file which currently resides in the local_path.

   Additionally, you can add user credentials with the following parameters found in the cloud only: section of group_vars:
   * **lsf_user_list**: A comma separated list of user ids that will be created and given login credentials on the new cluster.
   * **lsf_user_group**: The group to which the users will be added.

   All other parameters will be ignored for this configuration and can be left at default values.

2. Install LSF:

   ```sh
   ansible-playbook -i ${GEN_FILES_DIR}/cluster.inventory cloud_only.yml --tags setup
   ```
   {: pre}

   The install command does the following:
   * Copies the LSF installation binary to the master node.
   * Installs packages to cluster nodes needed to install and run LSF.
   * Sets up the NFS server on the master node including creating and mounting the filesystem.
   * If you specified userids with the lsf_user_list parameter in the lsf_install configuration file, the directory ${GEN_FILES_DIR}/userkeys will now contain the login credentials for those userids.

## Verify and test the cluster
{: #hpc-lsf-on-vpc-verify-test-multi-cluster}
{: step}

Complete the following steps.

1. Login to your master node using the login node as a jump box.  You could do this in 2 steps by ssh'ing to the login box public IP then ssh'ing to the master node's private IP, but the scripts have created an ssh configuration file that allows you to login in 1 step using the ssh proxyjump feature.

   ```sh
   ssh -F ${GEN_FILES_DIR}/ssh_config <private IP: 10.x.x.x>
   ```
   {: pre}

   You should now be logged in to the master node, where you can run LSF commands to check the cluster.

2. The `lsclusters` command displays some information about the cluster:

   ```sh
   lsclusters
   ```
   {: pre}

   The output of the command should show the cloud cluster.

3. The `bqueues` command displays the default array of lsf queues.

   ```sh
   bqueues
   ```
   {: pre}

4. Submit a job to the cloud queue with the `bsub` command ("sleep 30" will work as a test job) and then confirm it with the `bjobs` command.

   ```sh
   bsub <job>
   ```
   {: pre}

   ```sh
   bjobs
   ```
   {: pre}

5.  If you specified userids with the lsf_user_list parameter in the lsf_install configuration file, you can also login with those userids and run the tests.  The procedure to login is the following:

   ```sh
   ssh -F ${GEN_FILES_DIR}/ssh_config -i ${GEN_FILES_DIR}/userkeys/id_rsa_<username> <username>@<cloud_master_ip>
   ```
   {: pre}

## Remove resources
{: #hpc-lsf-on-vpc-remove-resources}
{: step}

To clean up any resources that you created in this tutorial, use the following procedure.

Make sure `GEN_FILE_DIR` is set.
{: note}

   ```sh
   ansible-playbook -i ${GEN_FILES_DIR}/tf_inventory.yml clean_vpc.yml
   ```
   {: pre}

As an alternative, you can use the [{{site.data.keyword.cloud_notm}} Resource List](https://{DomainName}/resources) or the CLI to remove these resources individually.


## Related content
{: #hpc-lsf-on-vpc-related}

Refer to the [IBM Spectrum LSF](https://www.ibm.com/support/knowledgecenter/SSWRJV_10.1.0/lsf_welcome/lsf_welcome.html) documentation for information on additional commands and tasks.
