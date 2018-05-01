---
copyright:
  years: 2017, 2018
lastupdated: "2018-05-01"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Understand how to move a VM based application to Kubernetes

This tutorial walks you through the process of moving a VM based application to IBM Cloud Kubernetes cluster. You will learn how to containerize an existing VM based applications, run it locally, then push it to a Kubernetes cluster. You will then learn some of the benefits comes with Kubernetes. Moving existing applications to the container and Kubernetes world can be different from an application to allocation. However, the process is always the same. In this tutorial guide, you will the process and what to prepare for. 

There are two main options when moving applications to Kubernetes, these are: 

- For large monolith applications, sometimes you may want to only move a portion of the application to the Cloud and leave the core application in your current data center. This means that you will select a small portion of the application running as a microservice in the cloud. To do that you would need to containerize that microservice and then run inside a Kubernetes cluster. You will repeat that process by breaking the monolith application into many microservices all running in the cloud inside a Kubernetes cluster.
- The second option would be to move the complete application to the Cloud, this can take little longer and often require you to make an extensive amount of code modifications, but in most cases, this would be the preferred option. With this approach, you will containerize the complete application into some Docker container images, and then run it inside a Kubernetes cluster. In this tutorial, you will learn how to tackle this approach. You will learn how to take an existing application and move it entirely to the cloud, containerize it and run it inside a Kubernetes Cluster.

A Kubernetes cluster consists of one or more worker nodes, and each worker nodes can have many pods, and inside each pod, you will have the docker contents image. A worker nods are just a collection VMs or physical machines.

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

The following diagram outlines the system's high-level architecture. For this example, an [existing WordPress application](highly-available-and-scalable-web-application.html) been selected that contains multiple VM's with a MySQL database server, File Storage, and a load balancer. Below you see two architecture diagram. First, you will look at the existing application diagram and then explain how to map that when moving to Kubernetes. 



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
2. Ingress controller load balance traffic between available workers nodes.
3. Pods within a worker node share a storage volume outside the scope of the pod managed by a storage service on IBM Cloud. 
4. Compose for MySQL service available to server the application with data. 

**Components:**

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

In this section, we will cover the fundamentals of moving VM based applications to Kubernetes. You will learn how to create A development/production cluster with the appropriate amount of resources need. You will learn what code to modifications needed, and things like creating docker files and Kubernetes deployments files. Next, you will learn how to handle file storage in Kubernetes, how to handle traffic load balancing, where to store your databases and the options available, finally then how to run your application locally before pushing to the Cluster on IBM Cloud. 

###Configure Resources

To run a production application in the Cloud using Kubernetes, there are few items in which you need to think about and these are: 

1. How many clusters you need, you may want to have three clusters, one for development, one testing and one for production.
2. Should these clusters be in a shared virtual server, dedicated server or bare metal. 
3. How much CPU and RAM needed for each cluster worker node, think of a worker node like a VM. On IBM Cloud you can configure these very easily, you can start from a 4GB RAM all the way to 242GB RAM. 
4. How many worker nodes you need. If running a production app and to gain good resiliency, you should consider minimum of two worker nodes.

Above some of the questions you need to think about before configuring clusters. If we to look the WordPress example,  assuming that this is a production application with high load of traffic. Let's explore what resources you would need:

1. Setup three clusters, one for development, one testing and one for production.
2. Development and testing cluster can use the **shared virtual server**, minimum RAM and CPU option like 2 CPUs and 4GB of RAM should be ok. And one worker node for each. 
3. For the production server you may want more resources for resiliency. For the production server, you can select any of the three hardware options shared, dedicated or bare metal. CPU and RAM you should have at least 4 CPUs and 16GB of RAM, and 2 workers nodes.

###Modify your code 

ToDo: add what code changes a developer would make on a high level. How to handle service credentials 

###How to handle file storage 

ToDo: managing storage, PersistentVolumes, PersistentVolumeClaim. How all that works. (How to copy existing files over).

###Create your docker images 

ToDo: What is a docker container file consist off, how to create one based on an existing application, how ingress works and how to configure it. 

###Run your dockerized application locally

ToDo: How to run all this locally before pushing it to the cloud. 

Now that you understand the fundamentals of moving application to Kubernetes, next you will explore creating a cluster and run the WordPress example. 

###Create Kubernetes deployment files 

ToDo: 

### Create Kubernetes deployment files 

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