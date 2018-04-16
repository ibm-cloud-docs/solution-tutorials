---
copyright:
  years: 2017, 2018
lastupdated: "2018-04-16"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Move existing infrastructure applications to Kubernetes

In this tutorial, you will learn the process of moving an existing WordPress infrastructure application to Kubernetes. You will learn the process of containerizing a WordPress infrastructure applications. For this example, we are going to move a current infrastructure WordPress site that covered in details [here](highly-available-and-scalable-web-application.html), we will explore all the components when moving to Kubernetes. You will learn how to handle application Kubernetes worker nodes, file storage, databases, scaling, and backups. 

Migrating legacy applications to Kubernetes can be different from application to application, but the process is the same, so we will focus on the process and not so much the type of application we are migrating. Most production applications have some of these components, a number of application servers, load balancer, auto-scaler, database, file storage and backup system, so let's cover these base components when running such application on Kubernetes.

**How to plan a migration and what to consider?**

Looking at the diagram below, let's first identify the components within the existing infrastructure application and compare that with the Kubernetes section, let's outline the different components for each setup. 

**1. Infrastructure components:** 

- Multiple virtual servers to host the application
- Separate file storage service to store files between application servers
- Load balancer service to load balance traffic between application servers 
- Database installed and setup on a virtual server  
- Another file storage service to backup database data

**2. Kubernetes components:** 

- One Kubernetes cluster to manage application nodes 
- Multiple worker nodes to store the application, think of this like virtual servers in the Infrastructure components step one.
- PersistentVolume to share files worker nodes, this comes built in with Kubernetes and no service is needed for this.
- Kubernetes Ingress Controller used to load balance between worker nodes, this comes built in with Kubernetes and no need for a separate load balancer service.
- Database as service, the advantage of using a Database as service is that you no longer need to handle manual backups and database scaling, which comes out of the box with most IBM database as service offerings. For this tutorial we will use [Compose for MySQL](https://console.bluemix.net/catalog/services/compose-for-mysql) but you can any other database as service like Compose for MongoDB or Cloudant. See full list of IBM Databases services in the [catalog](https://console.bluemix.net/catalog/?category=data). 

<p style="text-align: center;">
![Architecture diagram](/Applications/MAMP/htdocs/_GitHub/tutorials/images/solution29/Architecture.png)
</p>

## Objectives:

- Create a Kubernetes cluster 
- Configure a PersistentVolume in the Kubernetes cluster
  - [Create volumes.yml]()
  - [Create your Kubernetes volumes]()
- Create Compose for MySQL service 
  - Configure Compose for MySQL service 
- Deploy WordPress to Kubernetes
  - [Configure the Docker file]()
  - [Build & push the Docker image]()
  - [Create wordpress.yml]()
  - [Details of wordpress.yml]()
  - [Create your WP instance on Kubernetes]()
- Use Ingress Controller to load balance between nodes 
  - Configure Ingress Controller 
- Scale application nodes 
- Configure DevOps delivery pipeline (optional)
- Setup Slack notifications (optional)
- Advantages of Kubernetes
  - Scaling 
  - Management and flexibility 
  - Security using Vulnerability Advisor 
  - … add more here
- Clean up resources

## Cost

{: #cost}

This tutorial uses billable components of IBM Cloud Platform, including: 

- [Kubernetes](https://console.bluemix.net/containers-kubernetes/catalog/cluster/create)
- [Compose for MySQL](https://console.bluemix.net/catalog/services/compose-for-mysql)

Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.  



Solution Development Steps 

Step 1) 



