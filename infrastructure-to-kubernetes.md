---
copyright:
  years: 2017, 2018
lastupdated: "2018-04-20"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Understand how to move a VM based application to Kubernetes

This tutorial walks you through the process of moving a VM based application to IBM Cloud Kubernetes cluster. You will do that by packaging the application into different Docker container files, run it locally and then deploy it to a Kubernetes cluster.  For this example, we have selected an [existing WordPress application](highly-available-and-scalable-web-application.html) that contains multiple VM's with a MySQL database server, File Storage, and a load balancer. 

Following this tutorial results in:

- Understand the process involved when moving VM based applications to Kubernetes. 
- Your VM based application, packaged as a Docker container and pushed to your cluster.

## Objectives:

{: #objectives}

- Why use Kubernetes, what to migrate and how to plan a migration.
- Create a Kubernetes cluster, gain access to your cluster, download the tools required.
- Create and configure Compose for MySQL service, copy existing database.
- Prepare Kubernetes deployment templates, create PersistentVolume storage.
- Deploy the packaged Docker container to your cluster.
- Manually scale application worker nodes and test the load balancer.
- Expand the tutorial by adding, DevOps continuous delivery pipeline, slack notifications and, monitoring services.

## Services used

{: #products}

This tutorial uses the following products:

- [Kubernetes](https://console.bluemix.net/containers-kubernetes/catalog/cluster/create)
- [Compose for MySQL](https://console.bluemix.net/catalog/services/compose-for-mysql)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{:#architecture}

The following diagram outlines the system's high-level architecture.

<p style="text-align: center;">
![Architecture diagram](images/solution30/Architecture.png)
</p>

Above architecture diagram contains two sections, the top section is what we have, and the bottom part is what we want to accomplish. First, let's understand the components of each section. 

**1. VM base components:** 

- Two virtual servers to host the application
- File storage service to store files between application servers
- Load balancer service to load balance traffic between application servers 
- MySQL database installed on a Virtual Server 
- File storage service to backup database data

**2. Kubernetes components:** 

- One Kubernetes cluster configured to hold up to 4 worker nodes, when setting up the cluster, you can select any number of nodes needed, but we selected four nodes to cover beyond the need of this tutorial example for safety reasons. 
- Two worker nodes to store the application, the cluster capacity set to be able to increase the node replicate up to 4 nodes. 
- PersistenVolume storage to share files worker nodes, this comes built in with Kubernetes on IBM Cloud. Using the paid cluster on IBM Cloud, a storage service gets created with the requested PersistenVolume size. 
- Kubernetes Ingress controller used to load balance between worker nodes.
- Compose For MySQL service to store the database. With Kubernetes you have the option to run a database on a separate node inside docker, but we have selected the Database As Service option for few reasons. IBM Compose database services and many other databases as services come with built-in backup snapshots and auto-scaling, so we don't need to worry about backups and scaling. For that reason, we have selected the Database as a service option. You can find many databases as services on IBM Cloud [catalog](https://console.bluemix.net/catalog/?category=data). 

## Why use Kubernetes, what to migrate and how to plan a migration

{: #why_kubernetes}

Before we talk about what to migrate and how, let's discuss the why use Kubernetes. 

**Why use Kubernetes**

- High availability, Kubernetes delivers high availability is by treating each instance of software as a disposable entity in which called [Pods](https://kubernetes.io/docs/concepts/workloads/pods/pod/). 
- Load Balancing traffic, Ingress controller, can handle load balancing traffic between worker nodes simultaneously. 
- Performance and Scalability
- Security

**What to migrate**

In the VM's based application, there are components like the application VM's, load balancer, database server, file storage. For this given solution example, we are going to migrate everything and move the full application to Kubernetes, but this can not always be the case, sometimes you may only want to migrate the application runtime and keep the database in your existing environment or just migrate a microservice within your application. 

**How to plan migration**

Planning your migration is probably the most important of all, let's cover the steps required to plan a migration. 

1. Breakdown the existing solution into separate components. In the existing VM based application, we identified the following, application VM's, load balancer, file storage to share files between applications, Database server, and backup.

2. Understand existing component and if moved to Kubernetes. 

3. Migration order process:

   - Backup existing application database and source code. 
   - Setup your Kubernetes cluster, gain access to your cluster, download the tools required.
   - Create and configure Compose for MySQL service, copy existing database to the newly created database as a service.
   - Prepare Kubernetes deployment templates, create PersistentVolume storage.
   - Deploy the packaged Docker container to your cluster.

4. Test the application, test the database, test the load balancer, configure database backup policies. 

5. Next, you should explore what else can be added when using Kubernetes, things like auto-scaling, setup DevOps pipeline, monitoring, and security. We will cover these additional improvements forwarder down the tutorial.

   ​

## Create a Kubernetes cluster 

{: #create_cluster}

ToDo... 

## Create and configure a Database 

{: #create_database}

ToDo... 

### Configure Compose for MySQL service 

ToDo... 

### Copy Database to the newly created database service 

ToDo... 

## Create Kubernetes deployment templates

{: #create_deployment}

ToDo... 

### Configure a PersistentVolume in the Kubernetes cluster

{: #configure_persistent_volume}

ToDo... 

## Deploy WordPress to Kubernetes

{: #deploy_to_kubernetes}

ToDo... 

### Build & push the Docker image

ToDo... 

### Deploy to Kubernetes 

ToDo... 

## Manually scale application, test the load balancer
{: #scaling_and_testing}

ToDo... 

## Expand the tutorial 

{: #expand_tutorial}

ToDo... add pointers to other solutions for 
- DevOps - continuous delivery pipeline
- Monitoring
- Security 
- Slack notifications 


## Remove Services
{: #clean_up_resources}

ToDo... 

## Related Content
{: #related_content}

ToDo... 