---
copyright:
  years: 2017, 2018
lastupdated: "2018-01-19"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Automate deployment of environments using Infrastructure as Code

[Terraform](https://www.terraform.io/)  enables you to safely and predictably create, change, and improve infrastructure. It is an open source tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.

In this tutorial, you will use an IBM provided [terraform template](https://ibm-cloud.github.io/tf-ibm-docs/) to provision a **L**inux virtual server, with **A**pache web server, **M**ySQL, and **P**HP server (LAMP stack). You will then configure the template to add an Object Storage service and scale the resources to tune the environment (memory, CPU, and disk size). Finish by deleting all of the resources created by the configuration.

## Objectives

- Terraform setup with IBM Cloud Provider
- Prepare terraform configuration
- Create a LAMP stack server from the terraform configuration
- Customise server configuration from the template
- Verify VM and Object Storage
- Scale resources using configuration
- Delete the environment

![Architecture diagram](images/solution10/Architecture.png)

**ToDO: update the digram…** 

1. Create or use an existing Terraform configuration to describe the environment and store it in GitHub.
2. Create the LAMP stack and Cloud Object Storage service from the Terraform template.

## Products
{: #products}

- [Terraform](https://console.bluemix.net/schematics)
- [IBM Cloud Infrastructure](https://console.bluemix.net/dashboard/ibm-iaas-g1)
- [Object Storage](https://console.bluemix.net/catalog/infrastructure/cloud-object-storage)

## Before you begin
{: #prereqs}

Contact your Infrastructure master user to get the following permissions:
- Network (to add **Public and Private Network Uplink**)
- API Key

## Prerequisites

{: #prereq}

- [Install Homebrew](https://brew.sh/)
- [Install terraform via installer](https://www.terraform.io/intro/getting-started/install.html) or use **Homebrew** by running the command: `brew install terraform`

## Terraform setup with IBM Cloud Provider

{: #setup}

In this section, you will setup the required items and makes sure everything installed correctly. 

1. Check terraform installation by running `terraform` in your terminal window.  You should see a list of terraform `Common commands`.

  ```bash
  $ terraform 
  ```

2. Download the [IBM Cloud Provider](https://github.com/IBM-Cloud/terraform-provider-ibm/releases) into the root directory of your computer. Keep note of the URL, you would need the full path of the IBM Cloud Provider file later.
   -  [**Mac download**](https://github.com/IBM-Cloud/terraform-provider-ibm/releases/download/v0.7.0/darwin_amd64.zip)
   -  [**Windows download**](https://github.com/IBM-Cloud/terraform-provider-ibm/releases/download/v0.7.0/windows_amd64.zip)
   -  [**Linux download**](https://github.com/IBM-Cloud/terraform-provider-ibm/releases/download/v0.7.0/linux_amd64.zip)

3. Navigate to your root directory, then create and edit a `.terraformrc` file using: 
  ```bash
  Navigary to root directory 				- $ cd 
  Create a file 							- $ touch .terraformrc 
  Check that the .terraformrc created 	- $ ls -la
  Edit .terraformrc file 					- $ nano .terraformrc
  ```

4. Add the IBM provider URL to the .terraformrc file and replace the `<IBM-Cloud-Provider-full-path>` with the full path of your downloaded provider from **steps 2**.
  ```bash
  providers 
  {
  	ibm = "/<IBM-Cloud-Provider-full-path>/terraform-provider-ibm"
  }
  ```
  Then save and exit from nano by using `Cont+X`.


## Prepare terraform configuration 

{: #terraformconfig}

In this section, you will learn the basics of a Terraform configuration by using a sample template configuration provided by IBM Cloud. 

1. Fork the Terraform template code used above: 

2. Clone your fork locally:
   `git clone https://github.com/YOUR_USER_NAME/infrastructure-as-code-terraform`

3. Inspect the configuration files
   - [install.yml](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/install.yml) - contains installing script, this is where you can add all scripts related to your server install. See phpinfo() injected.
   - [provider.tf](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/provider.tf) - variables related to the provider where provider username and api key needed.
   - [vm.tf](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/vm.tf) - server configuration file to deploy the VM with specified variables.
   - [terraform.tfvars](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/terraform.tfvars) - contains Softlayer username and api key, these credentials can be added to this file to avoid entering them committing the terraform configuration. - You do not want to publish that file with your credentials ever.

4. Open the [vm.tf](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/vm.tf) file with your IDE, modify the file by adding your **public SSH key to access the VM**. To copy the public key to your clipboard, you can run the pbcopy < ~/.ssh/id_rsa.pub command in your terminal.

     ```bash
     $ pbcopy < ~/.ssh/id_rsa.pub
     ```

     This will copy the SSH to your clipboard, you can then past that into  [vm.tf](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/vm.tf) under the `ssh_key` default variable.

     From https://console.bluemix.net, use the left side menu option and select **Schematics**.

5. Open the [terraform.tfvars](https://github.com/IBM-Cloud/infrastructure-as-code-terraform/blob/master/terraform.tfvars)  file with your IDE, modify the file by adding your `softlayer_username` and `softlayer_api_key`. Retrieve your API key and Softlayer username [here](https://knowledgelayer.softlayer.com/procedure/retrieve-your-api-key).


## Create a LAMP stack server from the terraform configuration 
{: #Createserver} 

In this section, you will learn the how to create a LAMP stack server from the terraform template. The template is used to provision a virtual machine instance and install Apache, MySQL (MariaDB), and PHP onto that instance.

1. From the command line window, navigate to the template folder 

   ```bash
   $ cd infrastructure-as-code-terraform
   ```

2. Initialization would be the first command to run for a new configuration, run the command below to Initialize the configuration files. 

   ````bash
   $ terraform init
   ````

3. Apply the changes by running:

   ```
   terraform apply
   ```

   You should see output similar to below, though we've truncated some of the output to save space: ![Source Control URL](images/solution10/created.png)

4. Next, head over to your [infrastructure device list](https://control.bluemix.net/devices) to see the server getting created.  ![Source Control URL](images/solution10/configuration.png)













## Customise server configuration from the template

{: #modifytemplate}

**To be continued…** 

In this section, you will modify the code in the LAMP template to create your own custom configuration. You will modify the code to add an [Object Storage](https://console.bluemix.net/catalog/infrastructure/cloud-object-storage) service to the configuration and create a new environment.

1. Fork the LAMP template code used above: https://github.com/Cloud-Schematics/LAMP
2. Clone your fork locally:
  `git clone https://github.com/YOUR_USER_NAME/LAMP`
3. Inspect the configuration files
   - [install.yml](https://github.com/Cloud-Schematics/LAMP/blob/master/install.yml) - contains installing script, this is where you can add all scripts related to your server install. See phpinfo() injected.
   - [provider.tf](https://github.com/Cloud-Schematics/LAMP/blob/master/provider.tf) - variables related to the provider where provider username and api key needed.
   - [vm.tf](https://github.com/Cloud-Schematics/LAMP/blob/master/vm.tf) - server configuration file to deploy the VM with specified variables.
4. Create a new file called **object-storage.tf** and add the code below:
   ```
   resource "ibm_object_storage_account" "lamp_storage" {
     count = "${var.object_storage_enabled}"
   }

   variable "object_storage_enabled" {
       default = 1
   }
   ```
   **Note** the label "lamp_storage", we will later look for that in the logs to make sure Object Storage service getting created.
5. **Save** the **object-storage.tf** file and push your changes to your forked repo.
   ```
   git add object-storage.tf
   git commit -m "Added object storage"
   git push origin master
   ```

## Verify VM and Object Storage
{: #verifyvm}

In this section, we are going to verify the VM and Object Storage created successfully.

**Verify VM**

1. Using the left side menu, click on **Infrastructure** to view the list of virtual server devices.![Source Control URL](images/solution10/infrastructure.png)
2. Click **Devices** -> **Device List** to find the server created. You should see your server device listed.
3. Click on the server to view more information on the server configuration. Looking at the screenshot below, we can see that the server is successfully created. ![Source Control URL](images/solution10/configuration.png)
4. Next, let's test the server in the web browser. Open the server public IP address in the web browser. You should see the server default installation page like below.![Source Control URL](images/solution10/LAMP.png)


**Verify Object Storage**

1. From the **Infrastructure** section, click on the **Object Storage** button. You should see object storage service created.![object-storage](images/solution10/object-storage.png)
2. Click on the **Object Storage** name to view the full list of regions Object Storage is available on.
3. Object Storage is available from different regions, click on **Dallas 5** to get to the dashboard. ![object-storage](images/solution10/regions.png)
4. Click on **View Credentials** to view your Object Storage credentials and API end points.  ![object-storage](images/solution10/ob-dashboard.png)

More info on [IBM Object Storage can be found here](https://ibm-public-cos.github.io/crs-docs/index.html).

## Scale resources using configuration
{: #scaleresources}

In this section, we are going to look at how to scale the virtual server resource. Our configuration contains variables with default values that are editable in Schematics. We are going to override the default value of the variables to accomplish the following:
  - Increase number of CPU cores to 4 cores
  - Increase RAM to 4GB
  - Increase disk size to 100GB

1. From the IBM Cloud dashboard, navigate to **Schematics** -> **Environments** -> **My custom LAMP environment** -> **Variables**.
2. Under the variables section, update the variables **memory** to 4096, **disk_size** to 100, and **cores** to 4 and click **Save**.
3. Under the **Detail** section click **Plan** and **Apply**.
4. You should see in the logs that your changes applied successfully. ![Source Control URL](images/solution10/Replan-Reapply.png)


## Delete environments and resources
{: #deleteresources}

You can delete environments by using the options menu. Delete both **My LAMP environment** and **My custom LAMP environment** when you are done.

![Source Control URL](images/solution10/delete.png)


## Related information

[IBM Object Storage](https://ibm-public-cos.github.io/crs-docs/index.html)

[IBM Cloud Provider](https://ibm-cloud.github.io/tf-ibm-docs/)

[IBM Cloud Schematics](https://github.com/Cloud-Schematics)

[Accelerate delivery of static files using a CDN - Object Storage](static-files-cdn.html)
