---
copyright:
  years: 2017, 2018
lastupdated: "2018-05-10"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Understand how to move a VM based application to Kubernetes

This tutorial walks you through the process of moving a VM based application to a Kubernetes cluster on the IBM Cloud Container Service. You will learn how to take an existing Java application (JPetStore), containerize it, move it to Kubernetes, and then extend it using other IBM Cloud services. Though migrating existing applications to the containers and Kubernetes can be different from an application to application, this tutorial aims to outline the path with an example. 

Kubernetes is a container orchestrator to provision, manage, and scale applications. Kubernetes allows you to manage the lifecycle of containerized applications in a cluster of nodes (which are a collection of worker machines, for example, VMs or physical machines). Kubernetes supports a wide spectrum of languages allowing you to develop locally, scale globally. Kubernetes packs all the fundamental components to build cloud native apps locally. With Kubernetes you get things like built-in scaling features, load balancing, auto-recovery, quick deployment rollout and more. 

There are two options for moving applications to Kubernetes:
- Identify single component of a large monolith application which can be separated into its own micro-service. Containerize and deploy micro-service to Kubernetes. Repeat.
- Containerize the entire application and deploy it on a Kubernetes cluster.

In this tutorial, you will exercise the latter option using a popular Java e-commerce application **JPetStore**. After moving it to Kubernetes, you will extend it using IBM Cloud services. 

## Objectives:

{: #objectives}

- Understand how to map components between VM and Kubernetes.
- Containerize application
- Deploy the containerized application to IBM Cloud Container Service.
- Extend the application with IBM Cloud services.

## Services used

{: #products}

This tutorial uses the following products:

- [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{:#architecture}

The following diagram outlines the system's high-level architecture. For this example, an existing [https://github.com/mybatis/jpetstore-6) has been selected. The Java PetStore application runs on Java applciation server with a MySQL database. Let's look at how the existing application was deployed, and it's components.

<p style="text-align: center;">
![Architecture diagram](images/solution30/JPetStore.png)
</p>

1. The user connects to the application.
2. The Load Balancer selects one of the healthy servers to handle the request.
3. The server also pulls information from the database and finally renders the page to the user.

**Components:**

- Two Java app VM's to host the application, application files stored within the VM.
- Load balancer service to load balance traffic between application servers.
- MySQL database installed on a Virtual Server.



With a Kubernetes architecture, this may end up looking more like this:

<p style="text-align: center;">
![Architecture diagram](images/solution30/Architecture.png)
</p>

1. The user connects to the application.
2. Ingress controller load balance traffic between available workers nodes.
3. Pods within a worker node share a storage volume outside the scope of the pod managed by a storage service on IBM Cloud.
4. Compose for MySQL managed database as a service.

**Components:**

- Two worker nodes to host the application. A cluster can have one or more worker nodes. A worker node is a virtual server, physical server or bare metal. Following this tutorial, you will set up a cluster with two worker nodes.
- Persistent volume subsystem to share files between worker nodes. This comes built in with Kubernetes on IBM Cloud when using a paid cluster on IBM Cloud. A storage service gets created on the fly when storage is requested. You will later cover the concepts of PersistentVolumes and PersistentVolumeClaim in the storage section.
- Kubernetes ingress controller manages the load balancing between worker nodes. This comes built in with Kubernetes and no additional service needed for this.
- Compose For MySQL service to store the database. With Kubernetes you have the option to run the database on inside a cluster, but there is a more favorable option. This is by using the Database as a service option. For this tutorial example a database as service option been selected for two of reasons. One backup and two scaling. Many Databases as services options on IBM Cloud come with built-in backup snapshots and auto-scaling, so we don't need to worry about backups data and to scale the database. You can find many databases as service options on IBM Cloud [catalog](https://console.bluemix.net/catalog/?category=data).

## The world of VM's, containers and Kubernetes

### Virtual machines

Before containers were used, most infrastructure ran not on bare metal, but on hypervisors that managed multiple virtualized operating systems (OSs). This arrangement allowed isolation of applications from one another on a higher level than that provided by the OS. These virtualized operating systems recognize what looks like their own exclusive hardware. However, this also means that each of these virtual operating systems are replicating an entire OS, which requires more disk space.

IBM Cloud provides the capability to run applications in containers on Kubernetes. The IBM Cloud Container Service runs Kubernetes clusters that deliver the following tools and functions:

- Intuitive user experience and powerful tools
- Built-in security and isolation to enable rapid delivery of secure applications
- Cloud services that include cognitive capabilities from IBM® Watson™
- Ability to manage dedicated cluster resources for both stateless applications and stateful workloads

### Containers

Containers provide isolation similar to virtual machines (VMs), except provided by the OS and at the process level. Each container is a process or group of processes that are run in isolation. Typical containers explicitly run only a single process because they have no need for the standard system services. What they usually need to do can be provided by system calls to the base OS kernel.

The isolation on Linux is provided by a feature called namespaces. Each different kind of isolation, that is, user and cgroups, is provided by a different namespace.

### Virtual machines VS containers 

Traditional applications are run on native hardware. A single application does not typically use the full resources of a single machine. Most organizations try to run multiple applications on a single machine to avoid wasting resources. You could run multiple copies of the same application, but to provide isolation, you can use VMs to run multiple application instances (VMs) on the same hardware. These VMs have full operating system stacks that make them relatively large and inefficient due to duplication both at runtime and on disk.

However, containers allow you to share the host OS. This reduces duplication while still providing the isolation. Containers also allow you to drop unneeded files such as system libraries and binaries to save space and reduce your attack surface. If SSHD or LIBC are not installed, they cannot be exploited.

### Kubernetes orchestration

Now that you know what containers are, let’s define what Kubernetes is. Kubernetes is a container orchestrator to provision, manage, and scale applications. In other words, Kubernetes allows you to manage the lifecycle of containerized applications in a cluster of nodes (which are a collection of worker machines, for example, VMs or physical machines). Your applications might need many other resources to run such as Volumes, Networks, and Secrets that will help you to do things such as connect to databases, talk to firewalled backends, and secure keys. Kubernetes helps you add these resources to your application. Infrastructure resources needed by applications are managed declaratively.

The key paradigm of Kubernetes is its declarative model. The user provides the desired state and Kubernetes will do it's best to make it happen. If you need five instances, you do not start five separate instances on your own but rather tell Kubernetes that you need five instances, and Kubernetes will reconcile the state automatically. At this point, you simply need to know that you declare the state that you want and Kubernetes makes that happen. If something goes wrong with one of your instances and it crashes, Kubernetes still knows the desired state and creates new instances on an available node.

The main entry point for the Kubernetes project is at [http://kubernetes.io](http://kubernetes.io/), and the source code can be found at [https://github.com/kubernetes](https://github.com/kubernetes).

### Kubernetes resource model

Kubernetes infrastructure defines a resource for every purpose. Each resource is monitored and processed by a Controller. When you define your application, it contains a collection of these resources. This collection will then be read by Controllers to build your applications actual backing instances. Some of the resources that you might work with described in the following list. For a complete list, go to [https://kubernetes.io/docs/concepts](https://kubernetes.io/docs/concepts). In this tutorial, you will learn some of these resources, such as pod and deployment.

### Key resources and pods

A pod is the smallest object model that you can create and run. You can add labels to a pod to identify a subset to run operations on. When you are ready to scale your application, you can use the label to tell Kubernetes which Pod you need to scale. A pod typically represents a process in your cluster. Pods contain at least one container that runs the job and additionally might have other containers in it called sidecars for monitoring, logging, and so on. Essentially, a pod is a group of containers. An application is a group of pods. Although an entire application can be run in a single pod, you usually build multiple pods that talk to each other to make a useful application. Services define how to expose your application as a DNS entry to have a stable reference. Kubernetes provides a client interface through the kubectl command-line interface. Kubectl commands allow you to manage your applications, and manage cluster and cluster resources by modifying the model in the data store.

### Kubernetes application deployment workflow

The following diagram shows how applications are deployed in a Kubernetes environment.

<p style="text-align: center;">
![Architecture diagram](/Applications/MAMP/htdocs/_GitHub/tutorials/images/solution30/app_deploy_workflow.png)
</p>

1. Deploy a new application by using the kubectl CLI. Kubectl sends the request to the API server.
2. The API server receives the request and stores it in the data store (etcd). After the request is written to the data store, the API server is done with the request.
3. Watchers detect the resource changes and send notifications to the Controller to act on those changes.
4. The Controller detects the new application and creates new pods to match the desired number of instances. Any changes to the stored model will be used to create or delete pods.
5. The Scheduler assigns new pods to a node based on specific criteria. The Scheduler decides on whether to run pods on specific nodes in the cluster. The Scheduler modifies the model with the node information.
6. A Kubelet on a node detects a pod with an assignment to itself and deploys the requested containers through the container runtime, for example, Docker. Each node watches the storage to see what pods it is assigned to run. The node takes necessary actions on the resources assigned to it such as to create or delete pods.
7. Kubeproxy manages network traffic for the pods, including service discovery and load balancing. Kubeproxy is responsible for communication between pods that want to interact.

Now that you know virtual machines VS containers and the fundamental of Kubernetes, next let's explore how to plan the move to Kubernetes.

## How to plan the move

{: #plan_the_move}

In this section, you will learn what to consider when configuring a cluster, how to containerize the application and how to create Kubernetes deployment files. 

###Configure Resources

To run a production application in the Cloud using Kubernetes, there are few items in which you need to think about and these are:

1. How many clusters you need, you may want to have three clusters, one for development, one testing and one for production.
2. Should these clusters be in a shared virtual server, dedicated server or bare metal.
3. How much CPU and RAM needed for each cluster worker node, think of a worker node like a VM. On IBM Cloud you can configure these very easily, you can start from a 4GB RAM all the way to 242GB RAM.
4. How many worker nodes you need. If running a production app and to gain good resiliency, you should consider a minimum of two worker nodes.

Above are some of the questions, you need to think about before configuring your clusters. Assuming you want to run the PetStore application in the Cloud for a production use, and expect a high load of traffic. Let's explore what resources you would need:

1. Setup three clusters, one for development, one testing and one for production.
2. Development and testing cluster can start with minimum RAM and CPU option like 2 CPU's, 4GB of RAM and one worker node for each cluster.
3. For the production server, you may want to have more resources for resiliency. With the production server, you can select any of the three hardware options shared, dedicated or bare metal. For the CPU and RAM you should have at least 4 CPU's, 16GB of RAM, and four workers nodes. 

### Containerize the application 

To containerize your application, you need to create a file called Dockerfile inside the root of the application. A Dockerfile is a text document that contains all the commands you can execute to assemble an image.

To build one based on your existing application, you may need to define the following: 

- FROM - to define an official runtime as parent image.
- ADD/COPY - to copy the current directory contents into the container
- WORKDIR - Set the working directory
- RUN - to Install any needed packages
- EXPOSE - Make port available to the world outside this container
- ENV NAME - Define the environment variable
- CMD - Run application when the container launches

For more information on creating a Dockerfile, checkout the docker [file reference](https://docs.docker.com/engine/reference/builder/#usage).

To containerize the JPetStore application, below [Dockerfile](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/Dockerfile) been used.

```bash
# Build JPetStore war
FROM openjdk:8 as builder
COPY . /src
WORKDIR /src
RUN ./build.sh all

# Use WebSphere Liberty base image from the Docker Store
FROM websphere-liberty:latest

# Copy war from build stage and server.xml into image
COPY --from=builder /src/dist/jpetstore.war /opt/ibm/wlp/usr/servers/defaultServer/apps/
COPY --from=builder /src/server.xml /opt/ibm/wlp/usr/servers/defaultServer/
RUN mkdir -p /config/lib/global
COPY lib/mysql-connector-java-3.0.17-ga-bin.jar /config/lib/global
```

Once a Dockerfile created, next you would need to build and push the docker images. The docker images for each of the microservices need to be built and the images need to be pushed to a container registry. These steps are for pushing to your IBM Cloud private registry, but you can also push them to a public registry.

1. Identify your registry namespace with `bx cr namespaces` or create a new one using `bx cr namespace-add <NAMESPACE>`

2. Build and push the **jpetstoreweb** image:

   ```bash
   $ docker build . -t registry.ng.bluemix.net/<NAMESPACE>/jpetstoreweb
   $ docker push registry.ng.bluemix.net/<NAMESPACE>/jpetstoreweb
   ```

### Modify your code

There are few items in which you must handle when moving to Kubernetes:

- Service credentials, how to handle sensitive service, databases credentials within the cluster.
- High availability storage, how to handle data storage, where to store data in your cluster. 

**Service Credentials**

In Kubernetes, it's not a good practice to store credentials within the application but instead you should use what's called **[secrets](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)**. An objects of type `secret` are intended to hold sensitive information, such as passwords, OAuth tokens, and ssh keys. Putting this information in a `secret` is safer and more flexible than putting it verbatim in a `pod` definition or in a docker image. An application can have many different credentials like database credentials, 3rd party service credentials and more. These credentials should be distributed securely outside the application. 

Let's explore how to create a secret if you to add a Watson visual recognition service.

1. Create a new file called `watson-secrets.txt` and add the service credentials, you can get service credentials from the IBM Cloud dashboard or using the CLI.

   ```bash
   {
       "url": "https://gateway-a.watsonplatform.net/visual-recognition/api",
       "api_key": ""
   }
   ```

2. Create a secret from the file by running:

   ```bash
   $ kubectl create secret generic watson-visual-secret --from-file=watson-secrets.txt=./watson-secrets.txt
   ```

3. To verify secret been created, run the command: 

   ```bash
   $ kubectl get secrets
   ```

   The secret created can now be referenced from the Kubernetes deployment file. You will later learn about the Kubernetes deployment files and how the secret been referenced in the Kubernetes deployment file.  

**Saving data in your cluster**

In IBM Cloud Container Service, you can choose from several options to store your app data and share data across pods in your cluster. However, not all storage options offer the same level of persistence and availability in situations where a component in your cluster or a whole site fails.

**Non-persistent data storage options**

Containers and pods are, by design, short-lived and can fail unexpectedly. However, you can write data to the local file system of the container to store data throughout the lifecycle of the container. Data inside a container cannot be shared with other containers or pods and is lost when the container crashes or is removed. 

**Persistent data storage options for high availability**

Create a persistent volume claim (PVC) to provision NFS file storage or block storage for your cluster. Then, mount this claim to a persistent volume (PV) to ensure that data is available even if the pods crash or shut down.

The NFS file storage and block storage that backs the PV is clustered by IBM in order to provide high availability for your data. The storage classes describe the types of storage offerings available and define aspects such as the data retention policy, size in gigabytes, and IOPS when you create your PV.

In Kubernetes, the way this can is by using `PersistentVolume` to store the data in a [NFS-based file storage](https://www.ibm.com/cloud/file-storage/details) or [block storage](https://www.ibm.com/cloud/block-storage) and then use `PersistentVolumeClaim` to make that storage available to your pods. 

To create a PV and matching PVC, follow these steps below: 

1. Review the available storage classes. See full list of storage classes [here](https://console.bluemix.net/docs/containers/cs_storage.html#create) with storage capacity breakdown.

   ```bash
   $ kubectl get storageclasses
   ```

2. Create a `retain-silver ` storage class. The **retain** options means that the storage will not be removed altering deleting the PVC.

   ```bash
   $ kubectl describe storageclasses ibmc-file-retain-silver 
   ```

3. Create a new file and name it mypvc.yaml file with the following.

   ```bash
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: mypvc
     annotations:
       volume.beta.kubernetes.io/storage-class: "ibmc-file-silver"
     labels:
       billingType: "monthly"
   spec:
     accessModes:
       - ReadWriteMany
     resources:
       requests:
         storage: 24Gi
   ```

4. Create the PVC.

   ```bash
   $ kubectl apply -f mypvc.yaml
   ```

5. Verify that your PVC is created and bound to the PV. This process can take a few minutes.

   ```bash
   $ kubectl describe pvc mypvc
   ```

**Move existing data over**

ToDo: 



### Create Kubernetes deployment files

Point to the deployment file. 

### Push your deployment  

ToDo… 

Now that you understand the fundamentals of moving application to Kubernetes, next you will explore creating a cluster and run the PetStore application in a Kubernetes cluster.

## Run the application  

{: #run_application} 

ToDo...

Here it will send user to the [PetStore repo](https://github.ibm.com/ibmcloud/ModernizeDemo) to run the application or add the steps here…

## Extend the application

{: #extend_application}

ToDo...

## Expand the tutorial

{: #expand_tutorial}

Wait for now… 

ToDo...
- DevOps - continuous delivery pipeline
- Monitoring
- Security
- Slack notifications


## Remove Services
{: #clean_up_resources}

ToDo...

## Related Content
{: #related_content}

- [Get started with Kubernetes and IBM Cloud Container Service](https://developer.ibm.com/courses/all/get-started-kubernetes-ibm-cloud-container-service/)
- [http://kubernetes.io/](http://kubernetes.io/)



