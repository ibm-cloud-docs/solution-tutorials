---
copyright:
  years: 2017, 2018
lastupdated: "2018-04-23"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Understand how to move a VM based application to Kubernetes

This tutorial walks you through the process of moving a VM based application to IBM Cloud Kubernetes cluster. You will do that by packaging the application into different Docker container files, run it locally and then deploy it to a Kubernetes cluster.  

- Moving existing your VM based applications to the Docker container world, then push them on a Kubernetes cluster can be different from application to application. There are few options depending on the type of application you have:  

 - Move from the monolith approach to the microservices approach. With this approach, you will need to break out the monolith application into many microservices run these microservices in a managed Kubernetes Cluster on IBM Cloud, these microservices are packaged inside a Docker container file and then pushed to Kubernetes cluster. Sometimes, you may well keep the core application running as it is and only run few microservices inside a Kubernetes cluster in the Cloud. This can solution works very well if you want to leverage some of the IBM Cloud services while keeping your application core as it is. 
 - The second option would be to move the complete application to the Cloud, this means dockerizing your complete application and run it inside a Kubernetes cluster. In this tutorial, you will learn how to tackle this approach. Although this approach can sometimes require an extensive amount of code changes, however, it would have many benefits. 

How container world works is that your old VM based application will now be packaged as Docker container file running inside a Kubernetes cluster. The Kubernetes cluster consists of one or more worker nodes where the docker containers live, and these worker nods are just a collection VMs or physical machines. You as a developer no longer need to worry about this lower level meaning the infrastructure and focus on the application layer.  

## Objectives:

{: #objectives}

- Understand how to map components between VM and Kubernetes.
- Repackage an existing VM based application into a Kubernetes deployment.
- Deploy the Kubernetes application to IBM Cloud Container Service.

## Services used

{: #products}

This tutorial uses the following products:

- [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
- [{{site.data.keyword.composeForMySQL}}](https://console.bluemix.net/catalog/services/compose-for-mysql)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{:#architecture}

The following diagram outlines the system's high-level architecture. For this example, an [existing WordPress application](highly-available-and-scalable-web-application.html) been selected that contains multiple VM's with a MySQL database server, File Storage, and a load balancer. Below you see two architecture digram, first you will look at the existing application digram and then explain how to map that when moving to Kubernetes. 



<p style="text-align: center;">
![Architecture diagram](images/solution30/existing-architecture.png)
</p>

1. The user connects to the application.
2. The Load Balancer selects one of the healthy servers to handle the request.
3. The elected server accesses the application files stored on a shared file storage.
4. The server also pulls information from the database and finally renders the page to the user.
5. At a regular interval, the database content is backed up. A stand-by database is server is available in case the master fails.

**Components:**

- Two virtual servers to host the application.
- File storage service to store files between application servers.
- Load balancer service to load balance traffic between application servers.
- MySQL database installed on a Virtual Server.
- File storage service to backup database data.

Now let's explore how to map the same when moving to the Kubernetes world. 

<p style="text-align: center;">
![Architecture diagram](images/solution30/Architecture.png)
</p>

1. The user connects to the application.
2. Ingress controller load balance traffic between available workers nodes
3. Pods within a worker node share a storage volume outside the scope of the pod managed by a storage service on IBM Cloud. 
4. Compose for MySQL service available to server the application with data. 

Components:**

- Two worker nodes to host the application. A cluster can have one or more worker nodes. A worker node is a virtual server, physical server or bare metal. Following this tutorial, you will set up a cluster with two worker nodes.
- Persistent volume subsystem to share files between worker nodes. This comes built in with Kubernetes on IBM Cloud when using a paid cluster on IBM Cloud. A storage service gets created on the fly when storage is requested. You will later cover the concepts of PersistentVolumes and PersistentVolumeClaim in the storage section. 
- Kubernetes ingress controller manages the load balancing between worker nodes. This comes built in with Kubernetes and no additional service needed for this. 
- Compose For MySQL service to store the database. With Kubernetes you have the option to run the database on inside a cluster, but there is a more favorable option. This is by using the Database as a service option. For this tutorial example a database as service option been selected for two of reasons. One backup and two scaling. Many Databases as services options on IBM Cloud come with built-in backup snapshots and auto-scaling, so we don't need to worry about backups data and to scale the database. You can find many databases as service options on IBM Cloud [catalog](https://console.bluemix.net/catalog/?category=data). 

Now that you understand more on mapping components, next you will learn what code modifications make and the fundamentals when moving apps to the Kubernetes world. 

## Entering the world of containers and Kubernetes 

As you enter the world of containers and Kubernetes, you will discover a whole new world with access to many new resources and terminologies.

A Kubernetes cluster manages a collection of worker nodes, and a worker nodes is just a collection of VM's or physical machines. Inside that worker nodes you would then have a pod that has the Docker container image of your application. You as a developer will focus on your application and not so much worker nodes. To add to this, there is one more thing in which you need to understand, and that's Kubernetes Deployments. Kubernetes Deployments handles the creation of the pods and inserting the docker images inside the pod for you, but not only that, Kubernetes Deployments do more than just that for you. 

- The Deployment instructs Kubernetes how to create and update instances of your application pods. This provides a self-healing mechanism to address machine failure or maintenance. In the VM based application world, installation scripts would often be used to start the applications, but sometimes recovery from machine failures not even counted and handled. Now, Kubernetes in the other hand offers a much better solution to this because of the way Kubernetes works. This is by having a Deployment to create your application instances and keeping them running across Nodes, it makes sure that your pods are running at all times and if one pod failed then it will create another one. Kubernetes does that with the ReplicationController. 
- A *ReplicationController* ensures that a specified number of pod replicas are running at any one time. In other words, a ReplicationController makes sure that a pod or a homogeneous set of pods is always up and available. so this means If there are too many pods, the ReplicationController terminates the extra pods. If there are too few, the ReplicationController starts more pods. 

## How to plan a migration

{: #plan_a_migration}

In this section, we will cover the fundamentals of moving VM based applications to Kubernetes. You will learn what code to modify, how to handle file storage in the Docker world, how to create docker images, how to configure ingress controller to load balancer between worker nodes and then run it all locally before pushing it to the Cloud. Once you fully understand the fundamentals of moving to Kubernetes, then you can run the existing WordPress application on a Kubernetes cluster and see how it has been done. 

###Modify your code 

ToDo: add what code changes a developer would make on a high level. (How to copy existing code over).

ToDo: working on this...

###Manage application file storage 

ToDo: managing storage, PersistentVolumes, PersistentVolumeClaim. How all that works. (How to copy existing files over).

###Create your docker images 

ToDo: What is a docker container file consist off, how to create one based on an existing application, how ingress works and how to configure it. 

###Run your dockerized application locally

ToDo: How to run all this locally before pushing it to the cloud. 

Now that you understand the fundamentals of moving application to Kubernetes, next you will explore creating a cluster and run the WordPress example. 

###Create Kubernetes deployment files and configure the load balancer controller

ToDo: 

## Run the WordPress example on IBM Cloud 

{: #run_wordpress}

To run the WordPress example on IBM Cloud, follow the instructions explained in this repo: 

Link to the repo: 



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