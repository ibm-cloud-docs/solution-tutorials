---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-01-20"
lasttested: "2020-01-20"

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

<!--##istutorial#-->
# Getting started with tutorials
{: #getting-started}
<!--#/istutorial#-->
<!--##isworkshop#-->
<!--
# Getting started with workshops
{: #getting-started}
-->
<!--#/isworkshop#-->

This guide will help you set up your development environment to successfully follow the instructions of the guides found in this collection.
{:shortdesc}

## Objectives
{: #objectives}

Install must-have tools to be productive with {{site.data.keyword.cloud_notm}}:

* **{{site.data.keyword.cloud_notm}} CLI** - the command line interface to interact with {{site.data.keyword.cloud_notm}} API.
* **Docker** - to deliver and run software in packages called containers.
* **kubectl** - a command line interface for running commands against Kubernetes clusters.
* **oc** - manages OpenShift applications, and provides tools to interact with each component of your system.
* **Helm 3** - helps you manage Kubernetes applications — Helm Charts help you define, install, and upgrade even the most complex Kubernetes application.
* **Terraform** - automates your resource provisioning.
* **jq** - a lightweight and flexible command-line JSON processor.
* **Git** - a free and open source distributed version control system.

## Microsoft Windows
{: #windows}

The following sections assume you are running Microsoft Windows 10 64-bit under a user with Administrator privileges. Once you're done with the specific sections, proceed to the configuration [common to all operating systems](#common).

### {{site.data.keyword.cloud_notm}} CLI
{: #windows_cli}

1. Download and install the {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
1. Verify the installation with:
   ```sh
   ibmcloud version
   ```
   {:pre}

   You may need to restart your machine after the installation.
   {:tip}

### Docker
{: #windows_docker}

1. If you don't have one, sign up for a free account at https://hub.docker.com/signup.
1. Download and install Docker Desktop on Windows from https://docs.docker.com/docker-for-windows/install/.
1. Verify the installation with:
   ```sh
   docker --version
   docker run hello-world
   ```
   {:pre}

   You may need to log out and wait for the Docker daemon to be started.
   {:tip}

### kubectl
{: #windows_kubectl}

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-windows.
1. Move `kubectl.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   kubectl version --client=true
   ```
   {:pre}

### oc
{: #windows_oc}

1. Download the latest 3.11 OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v3/clients/.
1. Move `oc.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   oc version
   ```
   {:pre}

### Helm 3
{: #windows_helm}

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move `helm.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   helm version
   ```
   {:pre}

### Terraform
{: #windows_terraform}

1. Download `terraform` from https://www.terraform.io/downloads.html.
1. Uncompress the downloaded archive.
1. Move the `terraform.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   terraform version
   ```
   {:pre}

To manage {{site.data.keyword.cloud_notm}} resources with Terraform, you also need to install the {{site.data.keyword.cloud_notm}} Provider.

1. Download the latest version of the {{site.data.keyword.cloud_notm}} Provider binary file from https://github.com/IBM-Cloud/terraform-provider-ibm/releases.
1. Uncompress the downloaded archive.
1. Create a folder for your plug-in.
   ```sh
   mkdir "%APPDATA%\terraform.d\plugins"
   ```
   {:pre}
1. Move the {{site.data.keyword.cloud_notm}} Provider plug-in into the `plugins` folder.
   ```sh
   move terraform-provider-ibm* "%APPDATA%\terraform.d\plugins"
   ```
   {:pre}
1. Navigate into the `plugins` directory and verify that the installation is complete by executing the provider binary file:
   ```sh
   cd "%APPDATA%\terraform.d\plugins"
   .\terraform-provider-ibm_<version>.exe
   ```
   {:pre}

### jq
{: #windows_jq}

1. Download jq from https://stedolan.github.io/jq/.
1. Rename `jq-win64.exe` to `jq.exe`.
1. Move `jq.exe` binary to your PATH.
1. Verify the installation with:
   ```sh
   jq --version
   ```
   {:pre}

### Git
{: #windows_git}

1. Download and install `git` from https://github.com/git-for-windows/git/releases/latest.
1. Verify the installation with:
   ```sh
   git --version
   ```
   {:pre}

Proceed to the configuration [common to all operating systems](#common).

## Apple macOS
{: #macos}

The following sections assume you are running macOS High Sierra or later under a user with Administrator privileges. Once you're done with the specific sections, proceed to the configuration [common to all operating systems](#common).

### {{site.data.keyword.cloud_notm}} CLI
{: #macos_cli}

1. Download and install the {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
1. Verify the installation with:
   ```sh
   ibmcloud version
   ```
   {:pre}

### Docker
{: #macos_docker}

1. If you don't have one, sign up for a free account at https://hub.docker.com/signup.
1. Download and install Docker Desktop on Mac from https://docs.docker.com/docker-for-mac/install/.
1. Verify the installation with:
   ```sh
   docker --version
   docker run hello-world
   ```
   {:pre}

### kubectl
{: #macos_kubectl}

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-macos.
1. Make the kubectl binary executable.
   ```sh
   chmod +x ./kubectl
   ```
   {:pre}
1. Move the binary to your PATH.
   ```sh
   sudo mv ./kubectl /usr/local/bin/kubectl
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   kubectl version --client=true
   ```
   {:pre}

### oc
{: #macos_oc}

1. Download the latest 3.11 OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v3/clients/.
1. Extract `oc.tar.gz`:
   ```sh
   tar zxvf oc.tar.gz
   ```
   {:pre}
1. Move the `oc` binary to your PATH.
   ```sh
   sudo mv ./oc /usr/local/bin/oc
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   oc version
   ```
   {:pre}

   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow `oc` to be executed anyway, in the Finder on your Mac, locate the `oc` binary. Control-click its icon, then choose **Open** from the shortcut menu.
   {:tip}

### Helm 3
{: #macos_helm}

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move the `helm` binary to your PATH.
   ```sh
   sudo mv ./darwin-amd64/helm /usr/local/bin/helm
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   helm version
   ```
   {:pre}

   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow `helm` to be executed anyway, in the Finder on your Mac, locate the `helm` binary. Control-click its icon, then choose **Open** from the shortcut menu.
   {:tip}

### Terraform
{: #macos_terraform}

1. Download `terraform` from https://www.terraform.io/downloads.html.
1. Uncompress the downloaded archive.
1. Move the `terraform` binary to your PATH.
   ```sh
   sudo mv ./terraform /usr/local/bin/terraform
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   terraform version
   ```
   {:pre}

To manage {{site.data.keyword.cloud_notm}} resources with Terraform, you also need to install the {{site.data.keyword.cloud_notm}} Provider.

1. Download the latest version of the {{site.data.keyword.cloud_notm}} Provider binary file from https://github.com/IBM-Cloud/terraform-provider-ibm/releases.
1. Uncompress the downloaded archive.
1. Create a hidden folder for your plug-in.
   ```sh
   mkdir $HOME/.terraform.d/plugins
   ```
   {:pre}
1. Move the {{site.data.keyword.cloud_notm}} Provider plug-in into your hidden folder.
   ```sh
   mv terraform-provider-ibm* $HOME/.terraform.d/plugins/
   ```
   {:pre}
1. Navigate into your hidden directory and verify that the installation is complete.
   ```sh
   cd $HOME/.terraform.d/plugins && ./terraform-provider-ibm_*
   ```
   {:pre}

   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow the provider to be executed anyway, in the Finder on your Mac, locate the provider binary. Control-click its icon, then choose **Open** from the shortcut menu.
   {:tip}

### jq
{: #macos_jq}

1. Download `jq` from https://stedolan.github.io/jq/.
1. Rename the downloaded file to `jq`.
1. Move the `jq` binary to your PATH.
   ```sh
   sudo mv ./jq /usr/local/bin/jq
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   jq --version
   ```
   {:pre}

### Git
{: #macos_git}

1. Check that `git` is installed:
   ```sh
   git --version
   ```
   {:pre}

   macOS may prompt you to install the developer tools. These tools include the `git` command line.
   {:tip}

Proceed to the configuration [common to all operating systems](#common).

## Ubuntu Linux
{: #ubuntu}

The following sections assume you are running Ubuntu Linux as non-root user with access to root privileges. Once you're done with the specific sections, proceed to the configuration [common to all operating systems](#common).

### {{site.data.keyword.cloud_notm}} CLI
{: #ubuntu_cli}

1. Download and install the {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
1. Verify the installation with:
   ```sh
   ibmcloud version
   ```
   {:pre}

### Docker
{: #ubuntu_docker}

1. If you don't have one, sign up for a free account at https://hub.docker.com/signup.
1. Install Docker Engine - Community for Ubuntu following the instructions from https://docs.docker.com/install/linux/docker-ce/ubuntu/.
1. Verify the installation with:
   ```sh
   docker --version
   sudo docker run hello-world
   ```
   {:pre}

   To run Docker under your own user instead of root, perfom the [post install](https://docs.docker.com/install/linux/linux-postinstall/) steps.
   {:tip}

### kubectl
{: #ubuntu_kubectl}

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-linux.
1. Make the kubectl binary executable.
   ```sh
   chmod +x ./kubectl
   ```
   {:pre}
1. Move the binary to your PATH.
   ```sh
   sudo mv ./kubectl /usr/local/bin/kubectl
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   kubectl version --client=true
   ```
   {:pre}

### oc
{: #ubuntu_oc}

1. Download the latest 3.11 OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v3/clients/.
1. Extract `oc.tar.gz`:
   ```sh
   tar zxvf oc.tar.gz
   ```
   {:pre}
1. Move the `oc` binary to your PATH.
   ```sh
   sudo mv ./oc /usr/local/bin/oc
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   oc version
   ```
   {:pre}

### Helm 3
{: #ubuntu_helm}

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move the `helm` binary to your PATH.
   ```sh
   sudo mv ./linux-amd64/helm /usr/local/bin/helm
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   helm version
   ```
   {:pre}

### Terraform
{: #ubuntu_terraform}

1. Download `terraform` from https://www.terraform.io/downloads.html.
1. Uncompress the downloaded archive.
1. Move the `terraform` binary to your PATH.
   ```sh
   sudo mv ./terraform /usr/local/bin/terraform
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   terraform version
   ```
   {:pre}

To manage {{site.data.keyword.cloud_notm}} resources with Terraform, you also need to install the {{site.data.keyword.cloud_notm}} Provider.

1. Download the latest version of the {{site.data.keyword.cloud_notm}} Provider binary file from https://github.com/IBM-Cloud/terraform-provider-ibm/releases.
1. Uncompress the downloaded archive.
1. Create a hidden folder for your plug-in.
   ```sh
   mkdir $HOME/.terraform.d/plugins
   ```
   {:pre}
1. Move the {{site.data.keyword.cloud_notm}} Provider plug-in into your hidden folder.
   ```sh
   mv terraform-provider-ibm* $HOME/.terraform.d/plugins/
   ```
   {:pre}
1. Navigate into your hidden directory and verify that the installation is complete.
   ```sh
   cd $HOME/.terraform.d/plugins && ./terraform-provider-ibm_*
   ```
   {:pre}

### jq
{: #ubuntu_jq}

1. Install `jq` with:
   ```sh
   sudo apt install jq
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   jq --version
   ```
   {:pre}

### Git
{: #ubuntu_git}

1. Install `git` with:
   ```sh
   sudo apt install git
   ```
   {:pre}
1. Verify the installation with:
   ```sh
   git --version
   ```
   {:pre}

Proceed to the configuration [common to all operating systems](#common).

## Common to all operating systems
{: #common}

The next sections are common to all operating systems.

### {{site.data.keyword.cloud_notm}} CLI plugins

Plugins extend the capabilities of the {{site.data.keyword.cloud_notm}} CLI with commands specific to a service.

1. Install the following plugins:
   ```sh
   ibmcloud plugin install container-registry
   ibmcloud plugin install cloud-functions
   ibmcloud plugin install cloud-object-storage
   ibmcloud plugin install dev
   ibmcloud plugin install kubernetes-service
   ```
   {:pre}

   To see all the available plugins, run `ibmcloud plugin repo-plugins` and to install a plugin `ibmcloud plugin install <PLUGIN_NAME>`
   {:tip}

### GitHub account
{: #common_github}

1. Sign up for a free account at https://github.com/.
1. Create a new public repository at https://github.com/new to get familiar with GitHub.

### {{site.data.keyword.cloud_notm}} GitLab
{: #common_gitlab}

{{site.data.keyword.cloud_notm}} provides you with hosted Git repositories built on GitLab Community Edition and accessible with the same credentials used to log in {{site.data.keyword.cloud_notm}}. It is recommended to configure your SSH public key to simplify the command line interactions with the Git repositories.

1. [Use these instructions](https://us-south.git.cloud.ibm.com/help/ssh/README#generating-a-new-ssh-key-pair) to generate a new SSH key pair if you don't have one.
1. [Add your SSH public key](https://us-south.git.cloud.ibm.com/help/gitlab-basics/create-your-ssh-keys) to your Git settings in the region where you plan to host your Git repositories, such as [Dallas (us-south.git.cloud.ibm.com)](https://us-south.git.cloud.ibm.com/profile/keys), [London (eu-gb.git.cloud.ibm.com)](https://eu-gb.git.cloud.ibm.com/profile/keys) or [Frankfurt (eu-de.git.cloud.ibm.com)](https://eu-de.git.cloud.ibm.com/profile/keys).

To verify the configuration:
1. Create a new private project in GitLab, select the option to initialize the repository with a README.
1. Checkout the project from the command line by cloning with the SSH link.
1. Update the README file.
1. Commit and push the changes.
