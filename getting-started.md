---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-01-01"
lasttested: "2020-01-01"

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

# Getting started with workshops
{: #getting-started}

This guide will help you set up your development environment to successfully follow the instructions of the tutorials found in this collection.
{:shortdesc}

## Objectives
{: #objectives}

* Install must-have tools to be productive with {{site.data.keyword.cloud_notm}}.

## Microsoft Windows
{: #windows}

The following sections assume you are running Microsoft Windows 10 under a user with Administrator privileges.

### {{site.data.keyword.cloud_notm}} CLI

1. Download {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
1. Verify installation with:
   ```sh
   ibmcloud version
   ```
   {:pre}
1. Install the following plugins:
   ```sh
   ibmcloud plugin install dev
   ibmcloud plugin install container-registry
   ibmcloud plugin install kubernetes-service
   ibmcloud plugin install cloud-functions
   ```
   {:pre}

### Docker

1. If you don't have one, sign up for a free account at https://docker.com.
1. Download and install Docker Desktop on Windows from https://docs.docker.com/docker-for-windows/install/.
1. Verify installation with:
   ```sh
   docker --version
   docker run hello-world
   ```
   {:pre}

   You may need to log out and to wait for the Docker daemon to be started.
   {:tip}

### kubectl

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-windows.
1. Move `kubectl.exe` binary to one directory found in your PATH environment variable.
1. Verify installation with:
   ```sh
   kubectl version --client=true
   ```
   {:pre}

### oc

1. Download the OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v3/clients/. The current default OpenShift version is 3.11.
1. Move `oc.exe` binary to one directory found in your PATH environment variable.
1. Verify installation with:
   ```sh
   oc version
   ```
   {:pre}

### Helm 3

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Move `helm.exe` binary to one directory found in your PATH environment variable.
1. Verify installation with:
   ```sh
   helm version
   ```
   {:pre}

### jq

1. Download jq from https://stedolan.github.io/jq/.
1. Rename `jq-win64.exe` to `jq.exe`.
1. Move `jq.exe` to one directory found in your PATH environment variable.
1. Verify installation with:
   ```sh
   jq --version
   ```
   {:pre}

### Git

1. Download and install `git` from https://github.com/git-for-windows/git/releases/latest.
1. Verify installation with:
   ```sh
   git --version
   ```
   {:pre}

## Apple macOS
{: #macos}

The following sections assume you are running macOS High Sierra or later under a user with Administrator privileges.

### {{site.data.keyword.cloud_notm}} CLI

1. Download {{site.data.keyword.cloud_notm}} CLI from https://github.com/IBM-Cloud/ibm-cloud-cli-release/releases/latest.
1. Verify installation with:
   ```sh
   ibmcloud version
   ```
   {:pre}
1. Install the following plugins:
   ```sh
   ibmcloud plugin install dev
   ibmcloud plugin install container-registry
   ibmcloud plugin install kubernetes-service
   ibmcloud plugin install cloud-functions
   ```
   {:pre}

### Docker

1. If you don't have one, sign up for a free account at https://docker.com.
1. Download and install Docker Desktop on Mac from https://docs.docker.com/docker-for-mac/install/.
1. Verify installation with:
   ```sh
   docker --version
   docker run hello-world
   ```
   {:pre}

   You may need to log out and to wait for the Docker daemon to be started.
   {:tip}

### kubectl

1. Download `kubectl` from https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-macos.
1. Make the kubectl binary executable.
   ```sh
   chmod +x ./kubectl
   ```
   {:pre}
1. Move the binary in to your PATH.
   ```sh
   sudo mv ./kubectl /usr/local/bin/kubectl
   ```
   {:pre}
1. Verify installation with:
   ```sh
   kubectl version --client=true
   ```
   {:pre}

### oc

1. Download the OpenShift CLI (`oc`) from https://mirror.openshift.com/pub/openshift-v3/clients/. The current default OpenShift version is 3.11.
1. Extract `oc.tar.gz`:
   ```sh
   tar zxvf oc.tar.gz
   ```
   {:pre}
1. Move the `oc` binary in to your PATH.
   ```sh
   sudo mv ./oc /usr/local/bin/oc
   ```
   {:pre}
1. Verify installation with:
   ```sh
   oc version
   ```
   {:pre}
   
   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow `oc` to be executed anyway, in the Finder on your Mac, locate the `oc` binary. Control-click its icon, then choose **Open** from the shortcut menu.
   {:pre}

### Helm 3

1. Download `helm` from https://github.com/helm/helm/releases/latest.
1. Uncompress the downloaded archive.
1. Move the `helm` binary in to your PATH.
   ```sh
   sudo mv ./darwin-amd64/helm /usr/local/bin/helm
   ```
   {:pre}
1. Verify installation with:
   ```sh
   helm version
   ```
   {:pre}

   macOS Catalina may prompt you with a message saying the developer cannot be verified. To allow `helm` to be executed anyway, in the Finder on your Mac, locate the `helm` binary. Control-click its icon, then choose **Open** from the shortcut menu.
   {:pre}

### jq

1. Download `jq` from https://stedolan.github.io/jq/.
1. Rename the downloaded file to `jq`.
1. Move the `jq` binary in to your PATH.
   ```sh
   sudo mv ./jq /usr/local/bin/jq
   ```
   {:pre}
1. Verify installation with:
   ```sh
   jq --version
   ```
   {:pre}

### Git

1. Check that `git` is installed:
   ```sh
   git --version
   ```
   {:pre}

   macOS may prompt you to install the developer tools. These tools include the `git` command line.
   {:tip}

## Linux
{: #linux}

mmm

## Common to all operating systems

### GitHub account

1. Sign up for a free account at https://github.com/

### {{site.data.keyword.cloud_notm}} GitLab

1. [Configure your access to {{site.data.keyword.cloud_notm}} GitLab](https://cloud.ibm.com/docs/services/ContinuousDelivery?topic=ContinuousDelivery-git_working#creating-an-ssh-key) to be able to commit source code to a private Git repository.
   1. [Use these instructions](https://us-south.git.cloud.ibm.com/help/ssh/README#generating-a-new-ssh-key-pair) to generate a new SSH key pair if you don't have one.
   1. And [add your SSH public key](https://us-south.git.cloud.ibm.com/help/gitlab-basics/create-your-ssh-keys) to your Git settings.
1. To verify the configuration:
   1. Create a new private project in GitLab, select the option to initialize the repository with a README.
   1. Checkout the project from the command line.
   1. Update README file.
   1. Commit and push the changes.