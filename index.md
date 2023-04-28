---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-03-29"
lasttested: "2022-12-21"

---
{{site.data.keyword.attribute-definition-list}}

<!--##istutorial#-->
# Getting started with solution tutorials
{: #tutorials}

<!--#/istutorial#-->
<!--##isworkshop#-->
<!--
# Getting started with workshops<!-- markdownlint-disable-line -->
{: #tutorials}<!-- markdownlint-disable-line -->
-->
<!--#/isworkshop#-->

Solution tutorials provide step-by-step instructions on how to use IBM Cloud to implement common patterns based on best practices and proven technologies.

Before going through the tutorials collection, this guide will help you set up your development environment to successfully follow the instructions of the guides found in this collection.
{: shortdesc}

## Objectives
{: #getting-started-objectives}

Install must-have tools to be productive with {{site.data.keyword.cloud_notm}}:

* **{{site.data.keyword.cloud_notm}} CLI** - the command line interface to interact with {{site.data.keyword.cloud_notm}} API.
* **Docker** - to deliver and run software in packages called containers.
* **kubectl** - a command line interface for running commands against Kubernetes clusters.
* **oc** - manages OpenShift applications, and provides tools to interact with each component of your system.
* **Helm 3** - helps you manage Kubernetes applications — Helm Charts help you define, install, and upgrade even the most complex Kubernetes application.
* **Terraform** - automates your resource provisioning.
* **jq** - a lightweight and flexible command-line JSON processor.
* **Git** - a free and open source distributed version control system.

To avoid the installation of these tools, you can also use the [{{site.data.keyword.cloud-shell_short}}](/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

## Microsoft Windows
{: #getting-started-windows}

The following sections assume you are running Microsoft Windows 10 64-bit under a user with Administrator privileges. Once you're done with the specific sections, proceed to the configuration [common to all operating systems](#getting-started-common).

### {{site.data.keyword.cloud_notm}} CLI
{: #getting-started-windows_cli}

1. Download and install the {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
2. Verify the installation with:

   ```sh
   ibmcloud version
   ```
   {: pre}

   You may need to restart your machine after the installation.
   {: tip}

### Docker
{: #getting-started-windows_docker}

1. Docker Desktop on Windows is one option to run container images on Windows. Make sure to review the terms of the [license agreement](https://docs.docker.com/subscription/#docker-desktop-license-agreement){: external} before proceeding with the installation.
1. If you don't have one, sign up for a free account at https://hub.docker.com/signup.
1. Download and install Docker Desktop on Windows from https://docs.docker.com/docker-for-windows/install/.
1. Verify the installation with:

   ```sh
   docker --version
   docker run hello-world
   ```
   {: pre}

   You may need to log out and wait for the Docker daemon to be started.
   {: tip}

### kubectl
{: #getting-started-windows_kubectl}

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-windows.
1. Move `kubectl.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   kubectl version --client=true
   ```
   {: pre}

### oc
{: #getting-started-windows_oc}

1. Download the latest 4.x OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/.
1. Move `oc.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   oc version
   ```
   {: pre}

### Helm 3
{: #getting-started-windows_helm}

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move `helm.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   helm version
   ```
   {: pre}

### Terraform
{: #getting-started-windows_terraform}

1. Download `terraform` from https://www.terraform.io/downloads.html.
1. Uncompress the downloaded archive.
1. Move the `terraform.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   terraform version
   ```
   {: pre}

To manage {{site.data.keyword.cloud_notm}} resources with Terraform, you also need to install the {{site.data.keyword.cloud_notm}} Provider. Starting with Terraform 0.13, the provider can be automatically downloaded from Terraform plugin registry. Follow the instructions in the [provider documentation](/docs/ibm-cloud-provider-for-terraform?topic=ibm-cloud-provider-for-terraform-setup_cli#install-provider-v13) to configure the `required_providers` property in your Terraform templates.

### jq
{: #getting-started-windows_jq}

1. Download jq from https://stedolan.github.io/jq/.
1. Rename `jq-win64.exe` to `jq.exe`.
1. Move `jq.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   jq --version
   ```
   {: pre}

### Git
{: #getting-started-windows_git}

1. Download and install `git` from https://github.com/git-for-windows/git/releases/latest.
1. Verify the installation with:
   ```sh
   git --version
   ```
   {: pre}

Proceed to the configuration [common to all operating systems](#getting-started-common).

## Apple macOS
{: #getting-started-macos}

The following sections assume you are running macOS High Sierra or later under a user with Administrator privileges. Once you're done with the specific sections, proceed to the configuration [common to all operating systems](#getting-started-common).

### {{site.data.keyword.cloud_notm}} CLI
{: #getting-started-macos_cli}

1. Download and install the {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
2. Verify the installation with:
   ```sh
   ibmcloud version
   ```
   {: pre}

### Docker
{: #getting-started-macos_docker}

1. Docker Desktop on Mac is one option to run container images on macOS. Make sure to review the terms of the [license agreement](https://docs.docker.com/subscription/#docker-desktop-license-agreement){: external} before proceeding with the installation. Other options include [Podman](https://podman.io/getting-started/){: external}.
1. If you don't have one, sign up for a free account at https://hub.docker.com/signup.
1. Download and install Docker Desktop on Mac from https://docs.docker.com/docker-for-mac/install/.
1. Verify the installation with:
   ```sh
   docker --version
   docker run hello-world
   ```
   {: pre}

### kubectl
{: #getting-started-macos_kubectl}

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-macos.
1. Make the kubectl binary executable.
   ```sh
   chmod +x ./kubectl
   ```
   {: pre}

1. Move the binary to your PATH.
   ```sh
   sudo mv ./kubectl /usr/local/bin/kubectl
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   kubectl version --client=true
   ```
   {: pre}

### oc
{: #getting-started-macos_oc}

1. Download the latest 4.x OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/.
2. Extract `openshift-client-mac.tar.gz`:
   ```sh
   tar zxvf openshift-client-mac.tar.gz oc
   ```
   {: pre}

3. Move the `oc` binary to your PATH.
   ```sh
   sudo mv ./oc /usr/local/bin/oc
   ```
   {: pre}

4. Verify the installation with:
   ```sh
   oc version
   ```
   {: pre}

   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow `oc` to be executed anyway, run `sudo xattr -r -d com.apple.quarantine /usr/local/bin/oc`.
   {: tip}

### Helm 3
{: #getting-started-macos_helm}

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move the `helm` binary to your PATH.
   ```sh
   sudo mv ./darwin-amd64/helm /usr/local/bin/helm
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   helm version
   ```
   {: pre}

   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow `helm` to be executed anyway, run `sudo xattr -r -d com.apple.quarantine /usr/local/bin/helm`.
   {: tip}

### Terraform
{: #getting-started-macos_terraform}

1. Download `terraform` from https://www.terraform.io/downloads.html.
1. Uncompress the downloaded archive.
1. Move the `terraform` binary to your PATH.
   ```sh
   sudo mv ./terraform /usr/local/bin/terraform
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   terraform version
   ```
   {: pre}

To manage {{site.data.keyword.cloud_notm}} resources with Terraform, you also need to install the {{site.data.keyword.cloud_notm}} Provider. Starting with Terraform 0.13, the provider can be automatically downloaded from Terraform plugin registry. Follow the instructions in the [provider documentation](/docs/ibm-cloud-provider-for-terraform?topic=ibm-cloud-provider-for-terraform-setup_cli#install-provider-v13) to configure the `required_providers` property in your Terraform templates.

### jq
{: #getting-started-macos_jq}

1. Download `jq` from https://stedolan.github.io/jq/.
1. Rename the downloaded file to `jq`.
1. Move the `jq` binary to your PATH.
   ```sh
   sudo mv ./jq /usr/local/bin/jq
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   jq --version
   ```
   {: pre}

### Git
{: #getting-started-macos_git}

1. Check that `git` is installed:
   ```sh
   git --version
   ```
   {: pre}

   macOS may prompt you to install the developer tools. These tools include the `git` command line.
   {: tip}

Proceed to the configuration [common to all operating systems](#getting-started-common).

## Ubuntu Linux
{: #getting-started-ubuntu}

The following sections assume you are running Ubuntu Linux as non-root user with access to root privileges. Once you're done with the specific sections, proceed to the configuration [common to all operating systems](#getting-started-common). If you are using the Linux-based Cloud Shell, proceed to [the section on Cloud Shell](#getting-started-cloud-shell).

### {{site.data.keyword.cloud_notm}} CLI
{: #getting-started-ubuntu_cli}

1. Download and install the {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
2. Verify the installation with:
   ```sh
   ibmcloud version
   ```
   {: pre}

### Docker
{: #getting-started-ubuntu_docker}

1. If you don't have one, sign up for a free account at https://hub.docker.com/signup.
1. Install Docker Engine - Community for Ubuntu following the instructions from https://docs.docker.com/install/linux/docker-ce/ubuntu/.
1. Verify the installation with:
   ```sh
   docker --version
   sudo docker run hello-world
   ```
   {: pre}

   To run Docker under your own user instead of root, perfom the [post install](https://docs.docker.com/install/linux/linux-postinstall/){: external} steps.
   {: tip}

### kubectl
{: #getting-started-ubuntu_kubectl}

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-linux.
1. Make the kubectl binary executable.
   ```sh
   chmod +x ./kubectl
   ```
   {: pre}

1. Move the binary to your PATH.
   ```sh
   sudo mv ./kubectl /usr/local/bin/kubectl
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   kubectl version --client=true
   ```
   {: pre}

### oc
{: #getting-started-ubuntu_oc}

1. Download the latest 4.x OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/.
2. Extract `openshift-client-linux.tar.gz`:
   ```sh
   tar zxvf openshift-client-linux.tar.gz oc
   ```
   {: pre}

3. Move the `oc` binary to your PATH.
   ```sh
   sudo mv ./oc /usr/local/bin/oc
   ```
   {: pre}

4. Verify the installation with:
   ```sh
   oc version
   ```
   {: pre}

### Helm 3
{: #getting-started-ubuntu_helm}

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move the `helm` binary to your PATH.
   ```sh
   sudo mv ./linux-amd64/helm /usr/local/bin/helm
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   helm version
   ```
   {: pre}

### Terraform
{: #getting-started-ubuntu_terraform}

1. Download `terraform` from https://www.terraform.io/downloads.html.
1. Uncompress the downloaded archive.
1. Move the `terraform` binary to your PATH.
   ```sh
   sudo mv ./terraform /usr/local/bin/terraform
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   terraform version
   ```
   {: pre}

To manage {{site.data.keyword.cloud_notm}} resources with Terraform, you also need to install the {{site.data.keyword.cloud_notm}} Provider. Starting with Terraform 0.13, the provider can be automatically downloaded from Terraform plugin registry. Follow the instructions in the [provider documentation](/docs/ibm-cloud-provider-for-terraform?topic=ibm-cloud-provider-for-terraform-setup_cli#install-provider-v13) to configure the `required_providers` property in your Terraform templates.

### jq
{: #getting-started-ubuntu_jq}

1. Install `jq` with:
   ```sh
   sudo apt install jq
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   jq --version
   ```
   {: pre}

### Git
{: #getting-started-ubuntu_git}

1. Install `git` with:
   ```sh
   sudo apt install git
   ```
   {: pre}

1. Verify the installation with:
   ```sh
   git --version
   ```
   {: pre}

Proceed to the configuration [common to all operating systems](#getting-started-common).

## Common to all operating systems
{: #getting-started-common}

The next sections are common to all operating systems.

### {{site.data.keyword.cloud_notm}} CLI plugins
{: #getting-started-29}

Plugins extend the capabilities of the {{site.data.keyword.cloud_notm}} CLI with commands specific to a service.

1. Install the following plugins:
   ```sh
   ibmcloud plugin install container-registry
   ibmcloud plugin install cloud-object-storage
   ibmcloud plugin install kubernetes-service
   ibmcloud plugin install vpc-infrastructure
   ibmcloud plugin install code-engine
   ```
   {: pre}

   To see all the available plugins, run `ibmcloud plugin repo-plugins` and to install a plugin `ibmcloud plugin install <PLUGIN_NAME>`
   {: tip}

### GitHub account
{: #getting-started-common_github}

1. Sign up for a free account at https://github.com/.
1. Create a new public repository at https://github.com/new to get familiar with GitHub.

### {{site.data.keyword.cloud_notm}} GitLab
{: #getting-started-common_gitlab}

{{site.data.keyword.cloud_notm}} provides you with hosted Git repositories built on GitLab Community Edition and accessible with the same credentials used to log in {{site.data.keyword.cloud_notm}}. It is recommended to configure your SSH public key to simplify the command line interactions with the Git repositories.

1. [Use these instructions](https://us-south.git.cloud.ibm.com/help/user/ssh.md#generate-an-ssh-key-pair){: external} to generate a new SSH key pair if you don't have one.
1. [Add your SSH public key](https://us-south.git.cloud.ibm.com/help/user/ssh.md#add-an-ssh-key-to-your-gitlab-account){: external} to your Git settings in the region where you plan to host your Git repositories, such as [Dallas (us-south.git.cloud.ibm.com)](https://us-south.git.cloud.ibm.com/-/profile/keys){: external}, [London (eu-gb.git.cloud.ibm.com)](https://eu-gb.git.cloud.ibm.com/-/profile/keys){: external} or [Frankfurt (eu-de.git.cloud.ibm.com)](https://eu-de.git.cloud.ibm.com/-/profile/keys){: external}.

To verify the configuration:
1. Create a new private project in GitLab, select the option to initialize the repository with a README.
1. Checkout the project from the command line by cloning with the SSH link.
1. Update the README file.
1. Commit and push the changes.

## Cloud Shell
{: #getting-started-cloud-shell}

### oc
{: #getting-started-cloud-shell_oc}

Follow these steps if you need to use another version of the OpenShift CLI than the one pre-installed:
1. Download the latest stable 4.x OpenShift CLI (`oc`)
   ```sh
   curl https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz --output oc.tar.gz
   ```
   {: pre}
   
2. Extract `oc.tar.gz`:
   ```sh
   tar zxvf oc.tar.gz oc
   ```
   {: pre}

3. Add your current directory to `PATH`
   ```sh
   export PATH=$PWD:$PATH
   ```
   {: pre}
   
4. Verify the installation with:
   ```sh
   oc version
   ```
   {: pre}
