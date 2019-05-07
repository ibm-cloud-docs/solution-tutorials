---
copyright:
  years: 2017, 2019
lastupdated: "2019-04-23"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Deploy a LAMP stack using Terraform
{: #infrastructure-as-code-terraform}

[Terraform](https://www.terraform.io/) enables you to safely and predictably create, change, and improve infrastructure. It is an open source tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.

In this tutorial, you will use a sample configuration to provision a **L**inux virtual server, with **A**pache web server, **M**ySQL, and **P**HP server termed as **LAMP** stack. You will then update the configuration to add the {{site.data.keyword.cos_full_notm}} service and scale the resources to tune the environment (memory, CPU, and disk size). Finish by deleting all of the resources created by the configuration.

## Objectives
{: #objectives}

* Configure Terraform and the {{site.data.keyword.Bluemix_notm}} Provider for Terraform.
* Use Terraform to create, update, scale and finally destroy a LAMP stack configuration.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.virtualmachinesshort}}
](https://{DomainName}/catalog/infrastructure/virtual-server-group)
* [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/catalog/services/cloud-object-storage)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture diagram](images/solution10/architecture-2.png)
</p>

1. A set of Terraform files are created to describe the LAMP stack configuration.
1. `terraform` is invoked from the configuration directory.
1. `terraform` calls the {{site.data.keyword.cloud_notm}} API to provision the resources.

## Before you begin
{: #prereqs}

Contact your Infrastructure master user to get the following permissions:
- Network (to add **Public and Private Network Uplink**)
- API Key

## Prerequisites

{: #prereq}

Install **Terraform** via [installer](https://www.terraform.io/intro/getting-started/install.html) or use [Homebrew](https://brew.sh/) on macOS by running the command: `brew install terraform`

On **Windows**, follow these steps to complete terraform setup:
   1. Copy files from the downloaded zip to `C:\terraform` (create a folder `terraform`).
   2. Open the command prompt as an administrator and set the PATH to use terraform binaries.

      ```
      set PATH=%PATH%;C:\terraform
      ```
      {:pre}

## Configure the {{site.data.keyword.Bluemix_notm}} Provider for Terraform
{: #setup}

To support a multi-cloud approach, Terraform works with providers. A provider is responsible for understanding API interactions and exposing resources. In this section, you will configure the CLI to specify the location of the {{site.data.keyword.Bluemix_notm}} provider.

1. Check Terraform installation by running `terraform` in your terminal or command prompt window.  You should see a list of `Common commands`.

  ```
  terraform
  ```

2. Download the appropriate [{{site.data.keyword.Bluemix_notm}} Provider](https://github.com/IBM-Cloud/terraform-provider-ibm/releases) plugin for your system and extract the archive. You should see the  `terraform-provider-ibm_VERSION` binary plugin file.

3. For non-Windows systems, create a `.terraform.d/plugins` directory in your user's home directory and to place the binary file inside of it. Use the following commands for reference.

  ```
  mkdir -p $HOME/.terraform.d/plugins
  mv $HOME/Downloads/terraform-provider-ibm_VERSION $HOME/.terraform.d/plugins/
  ```

    On **Windows**, the file needs to be placed in `terraform.d/plugins` beneath your user's "Application Data" directory.

  - Run the below commands on a command prompt [Provider Configuration](https://www.terraform.io/docs/configuration/providers.html)
   ```
  MD %USERPROFILE%\AppData\terraform.d\plugins
   ```
  ```
   MOVE PATH_TO_UNZIPPED_PROVIDER_FILE\terraform-provider-ibm_VERSION.exe  %USERPROFILE%\AppData\terraform.d\plugins
  ```
   - Launch **Windows Powershell** (Start + R > Powershell) and run the below command to create `terraform.rc` file
   ```
    echo > $env:APPDATA\terraform.rc
   ```
   At the first prompt, enter the below content
   ```
    # ~/.terraformrc
    providers {
        ibm = "PATH_TO_YOUR_APPDATA_PLUGINS/terraform-provider-ibm_VERSION.exe"
    }
   ```
        The PATH_TO_YOUR_APPDATA_PLUGINS should be an absolute path with forward slash(/). For  example , `C:/Users/VMac/AppData/terraform.d/plugins/terraform-provider-ibm.exe`
        {: tip}

  - Click enter to exit the prompt.

## Prepare terraform configuration

{: #terraformconfig}

In this section, you will learn the basics of a terraform configuration by using a sample Terraform configuration provided by {{site.data.keyword.Bluemix_notm}}.

1. Visit https://github.com/IBM-Cloud/LAMP-terraform-ibm and **Fork** your own copy to your account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USER_NAME/LAMP-terraform-ibm
   ```
3. Inspect the configuration files
   - [install.yml](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/install.yml) - contains server installation configurations, here is where you can add all scripts related to your server install to what to install on the server. See `phpinfo();` injected into this file.
   - [provider.tf](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/provider.tf) - contains the variables related to the provider where provider username and api key needed.
   - [vm.tf](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/vm.tf) - contains the server configurations to deploy the VM with specified variables.
   - [terraform.tfvars](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/terraform.tfvars) - contains **SoftLayer** username and api key, {{site.data.keyword.Bluemix_notm}} API Key and your space/org names. These credentials can be added to this file for best practices to avoid re-entering these credentials from the command line every time when deploying the server. Note: DO NOT publish this file with your credentials.
4. Open the [vm.tf](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/vm.tf) file in an IDE of your choice and modify the file by adding your **public SSH** key. This will be used to access the VM created by this configuration. For information on Creating SSH keys, follow instructions in [this link](https://confluence.atlassian.com/bitbucketserver/creating-ssh-keys-776639788.html) To copy the public key to your clipboard, you can run the below command in your terminal.

     ```bash
     pbcopy < ~/.ssh/id_rsa.pub
     ```
     This command will copy the SSH to your clipboard, you can then past that into [vm.tf](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/vm.tf) under the `ssh_key` default variable around line 69.

    On **Windows**, Download, install, launch [Git Bash](https://git-scm.com/download/win) and run the below command to copy the public SSH key to your clipboard.

    ```
     clip < ~/.ssh/id_rsa.pub
    ```

5. Open the [terraform.tfvars](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/terraform.tfvars) file with your IDE, modify the file by adding all the credentials listed, adding these credentials in that files means you don't need to renter these credentials every time running terraform apply. You must add all the five credentials listed in the [terraform.tfvars](https://github.com/IBM-Cloud/LAMP-terraform-ibm/blob/master/terraform.tfvars) file in order to complete the rest of this tutorial.

## Create a LAMP stack server from the terraform configuration
{: #Createserver}
In this section, you will learn the how to create a LAMP stack server from the terraform configuration sample. The configuration is used to provision a virtual machine instance and install **A**pache, **M**ySQL (**M**ariaDB), and **P**HP onto that instance.

1. Navigate to the folder of the repo you cloned.
   ```bash
    cd LAMP-terraform-ibm
   ```
   {: pre}
2. Initialize the terraform configuration. This will also install `terraform-provider-ibm_VERSION` plugin.
   ````bash
    terraform init
   ````
   {: pre}
3. Apply the terraform configuration. This will create the resources defined in the configuration.
   ```
    terraform apply
   ```
   {: pre}
   You should see an output similar to below.![Source Control URL](images/solution10/created.png)
4. Next, head over to your [infrastructure device list](https://{DomainName}/classic/devices) to verify that the server created.![Source Control URL](images/solution10/configuration.png)

## Add the {{site.data.keyword.cos_full_notm}} service and scale the resources

{: #modify}

In this section, you are going to look at how to scale the virtual server resource and add an [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/catalog/infrastructure/cloud-object-storage) service to your infrastructure environment.

1. Edit the `vm.tf` file to increase the following and the save the file.
 - Increase number of CPU cores to 4 cores
 - Increase RAM(memory) to 4096
 - Increase disk size to 100GB

2. Next, add a new [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/catalog/infrastructure/cloud-object-storage) service, to do that create a new file and name it **ibm-cloud-object-storage.tf**. Add the code snippets below to the newly created file. The code snippets below creates a variable name for the org name and space name, then these two variable names used to retrieve the space guid in which needed to create the service. It sets the {{site.data.keyword.cos_full_notm}} service name to `lamp_objectstorage`, then you need a space guid, service fully qualified name and plan type. The code below will create a premium plan given it is a pay-as-you-go plan anyway. You can also use the Lite plan, but note that the Lite plan is limited to only one service per account.

   ```
   variable "org_name" {
     description = "Enter your IBM Cloud org name, you can get your org name under your IBM Cloud dashboard account: https://{DomainName}/dashboard"
   }

   variable "space_name" {
     description = "Enter your IBM Cloud space name, you can get your space name under your IBM Cloud dashboard account: https://{DomainName}/dashboard"
   }

   data "ibm_space" "space" {
     space = "${var.space_name}"
     org   = "${var.org_name}"
   }

   # a cloud object storage
   resource "ibm_service_instance" "objectstorage" {
     name       = "lamp_objectstorage"
     space_guid = "${data.ibm_space.space.id}"
     service    = "cloud-object-storage"

     # you can only have one Lite plan per account so let's use the Premium - it is pay-as-you-go
     plan = "Premium"
   }
   ```
   {: pre}
   **Note:** the label "lamp_objectstorage", we will later look for that in the logs to make sure {{site.data.keyword.cos_full_notm}} created successfully.

3. Initialize the terraform configuration again by running:

   ```bash
    terraform init
   ```
   {: pre}

4. Apply the terraform changes by running:
   ```bash
    terraform apply
   ```
   {: pre}
   **Note:** after running the terraform apply command successfully, you should see a new a `terraform.tfstate`. file added to your directory. This file contains the full deployment confirmation to keep track of what you last applied and any future modifications to your configuration. If this file is removed or lost then you will lose your terraform deployment configurations.

## Verify VM and {{site.data.keyword.cos_short}}
{: #verifyvm}

In this section, you are going to verify the VM and {{site.data.keyword.cos_short}} to make sure it has been created successfully.

**Verify VM**

1. On the left side menu, click on **Infrastructure** to view the list of virtual server devices.
2. Click **Devices** -> **Device List** to find the server created. You should see your server device listed.
3. Click on the server to view more information on the server configuration. Looking at the screenshot below, we can see that the server is successfully created. ![Source Control URL](images/solution10/configuration.png)
4. Next, let's test the server in the web browser. Open the server public IP address in the web browser. You should see the server default installation page like below.![Source Control URL](images/solution10/LAMP.png)


**Verify {{site.data.keyword.cos_full_notm}}**

1. From the **{{site.data.keyword.Bluemix_notm}} Dashboard**, you should see an instance of the {{site.data.keyword.cos_full_notm}} service been created for you and ready for use. ![object-storage](images/solution10/ibm-cloud-object-storage.png)

   More info on {{site.data.keyword.cos_full_notm}} can be found [here](https://{DomainName}/docs/services/cloud-object-storage?topic=cloud-object-storage-about-ibm-cloud-object-storage#about-ibm-cloud-object-storage).

## Remove resources
{: #deleteresources}

Delete resources using the following command:
   ```bash
   terraform destroy
   ```
   {: pre}

**Note:** To delete resources, you would need Infrastructure admin permissions. If you don't have an admin superuser account, then please request to cancel the resources using the infrastructure dashboard. You can request to cancel a device from the infrastructure dashboard under the devices. ![object-storage](images/solution10/rm.png)

## Related content

- [Terraform](https://www.terraform.io/)
- [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/docs/services/cloud-object-storage?topic=cloud-object-storage-about-ibm-cloud-object-storage#about-ibm-cloud-object-storage)
- [{{site.data.keyword.Bluemix_notm}} Provider for Terraform](https://ibm-cloud.github.io/tf-ibm-docs/)
- [Accelerate delivery of static files using a CDN - {{site.data.keyword.cos_full_notm}}](https://{DomainName}/docs/tutorials?topic=solution-tutorials-static-files-cdn#static-files-cdn)

