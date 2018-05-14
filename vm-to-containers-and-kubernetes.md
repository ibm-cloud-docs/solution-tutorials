---
copyright:
  years: 2017, 2018
lastupdated: "2018-05-14"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Understand how to move a VM based application to Kubernetes

This tutorial walks you through the process of moving a VM based application to a Kubernetes cluster on the IBM Cloud Container Service. You will learn how to take an existing application, containerize it, deploy it to a Kubernetes cluster, and then extend it using IBM Cloud services. Though migrating existing applications to Kubernetes can be different from an application to application, this tutorial aims to outline the path with an example. 

[Kubernetes](https://kubernetes.io/) is a container orchestrator to provision, manage, and scale applications. Kubernetes allows you to manage the lifecycle of containerized applications in a cluster of nodes. With Kubernetes you get built-in scaling features, load balancing, auto-recovery, quick deployment rollout and more. 

[IBM Cloud Container Service](https://console.bluemix.net/docs/containers/container_index.html) offers managed Kubernetes clusters with isolation and hardware choice, operational tools, integrated security insight into images and containers, and integration with Watson, IoT, and data. 

There are two options for moving an application to Kubernetes: 
- Identify single component of a large monolith application which can be separated into its own micro-service. Containerize and deploy micro-service to Kubernetes. Repeat. 
- Containerize the entire application and deploy it on a Kubernetes cluster. 

In this tutorial, you will exercise the latter option using a popular Java e-commerce application **JPetStore**. After moving it to Kubernetes, you will extend it using IBM Cloud services.

## Objectives:

{: #objectives}

- Understand how to map components between VMs and Kubernetes.
- Containerize application.
- Deploy the container to Kubernetes cluster on IBM Cloud Container Service.
- Extend the application with IBM Cloud services.

## Services used

{: #products}

This tutorial uses the following products:

- [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
- [{{site.data.keyword.visualrecognitionfull}}](https://console.bluemix.net/catalog/services/visual-recognition)
- [Twilio](https://www.twilio.com/)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{:#architecture}

The following diagram outlines the traditonal architecture of application. 

<p style="text-align: center;">
![Architecture diagram](images/solution30/traditional_architecture.png)

</p>

1. The user sends a request to the endpoint.
2. The Load Balancer selects one of the healthy application running in VM to handle the request.
3. The application server is backed by another VM running a database. 

**Components:**

- Two Java app VM's to host the application, application files stored within the VM.
- Load balancer service to load balance traffic between application servers.
- MySQL database installed on a Virtual Server.

With a modern Kubernetes architecture, this would look similar to:

<p style="text-align: center;">
![Architecture diagram](images/solution30/Architecture.png)
</p>

1. The user sends a request to the endpoint.
2. Ingress load balances traffic to  workloads in the cluster
3. The data layer is an external managed database service.

**Components:**

- A cluster can have one or more worker nodes. A worker node is a virtual server, physical server or bare metal. Following this tutorial, you will set up a cluster with two worker nodes.
- Persistent volumes and other options available for saving and sharing data between app instances.
- Kubernetes ingress controller manages the load balancing between worker nodes. This comes built in with Kubernetes and no additional service needed for this. [THIS NEEDS WORK]
- Compose For MySQL service to store the database. With Kubernetes you can run your own database inside the cluster, but it might be more favorable to use a managed database-as-a service for reasons such as built-in backups and scaling. You can find many different types databases in IBM Cloud [catalog](https://console.bluemix.net/catalog/?category=data).

## VM's, containers and Kubernetes

IBM Cloud provides the capability to run applications in containers on Kubernetes. The IBM Cloud Container Service runs Kubernetes clusters that deliver the following tools and functions:

- Intuitive user experience and powerful tools
- Built-in security and isolation to enable rapid delivery of secure applications
- Cloud services that include cognitive capabilities from IBM® Watson™
- Ability to manage dedicated cluster resources for both stateless applications and stateful workloads

### Virtual machines vs containers 

**Containers** are a standard way to package apps and all their dependencies so that you can seamlessly move the apps between environments. Unlike virtual machines, containers do not bundle the operating system. Only the app code, run time, system tools, libraries, and settings are packaged inside containers. Containers are more lightweight, portable, and efficient than virtual machines.

**VM's**, traditional applications are run on native hardware. A single application does not typically use the full resources of a single machine. Most organizations try to run multiple applications on a single machine to avoid wasting resources. You could run multiple copies of the same application, but to provide isolation, you can use VMs to run multiple application instances (VMs) on the same hardware. These VMs have full operating system stacks that make them relatively large and inefficient due to duplication both at runtime and on disk.

However, containers allow you to share the host OS. This reduces duplication while still providing the isolation. Containers also allow you to drop unneeded files such as system libraries and binaries to save space and reduce your attack surface. If SSHD or LIBC are not installed, they cannot be exploited.

### Kubernetes orchestration

Kubernetes is a container orchestrator to provision, manage, and scale applications. In other words, Kubernetes allows you to manage the lifecycle of containerized applications in a cluster of nodes. Your applications might need many other resources to run such as Volumes, Networks, and Secrets that will help you connect to databases, talk to firewalled backends, and secure keys. Kubernetes helps you add these resources to your application. Infrastructure resources needed by applications are managed declaratively.

The key paradigm of Kubernetes is its declarative model. The user provides the desired state and Kubernetes will do it's best to make it happen. If you need five instances, you do not start five separate instances on your own but rather tell Kubernetes that you need five instances, and Kubernetes will reconcile the state automatically. At this point, you simply need to know that you declare the state that you want and Kubernetes makes that happen. If something goes wrong with one of your instances and it crashes, Kubernetes still knows the desired state and creates new instances on an available node.

The main entry point for the Kubernetes project is at [http://kubernetes.io](http://kubernetes.io/), and IBM Cloud GitHub source code located [here](https://github.com/IBM/container-service-getting-started-wt).

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

Now that you understand virtual machines VS containers and the fundamental of Kubernetes, next let's explore how to plan the move to Kubernetes.

## Plan the move

{: #plan_the_move}

In this section, you will learn what to consider when configuring a cluster, how to containerize the application and how to create Kubernetes deployment files. 

###Configure Resources

To run a production application in the Cloud using Kubernetes, there are few items in which you need to think about and these are:

1. How many clusters you need, you may want to have three clusters, one for development, one testing and one for production.
2. Should these clusters be in a shared virtual server, dedicated server or bare metal.
3. How much CPU and RAM needed for each cluster worker node, think of a worker node like a VM. On IBM Cloud you can configure these very easily, you can start from a 4GB RAM all the way to 242GB RAM.
4. How many worker nodes you need. If running a production app and to gain good resiliency, you should consider a minimum of two worker nodes.

Above are some of the questions, you need to think about before configuring your clusters. Assuming you want to run the JPetStore application in the Cloud for a production use, and expect a high load of traffic. Let's explore what resources you would need:

1. Setup three clusters, one for development, one testing and one for production.
2. Development and testing cluster can start with minimum RAM and CPU option like 2 CPU's, 4GB of RAM and one worker node for each cluster.
3. For the production server, you may want to have more resources for resiliency. With the production server, you can select any of the three hardware options shared, dedicated or bare metal. For the CPU and RAM you should have at least 4 CPU's, 16GB of RAM, and four workers nodes. 

### Containerize the application 

[You need to make any code changes according to the 12 factor principles before you containerize your app]

To containerize your application, you need to create a Dockerfile inside the root of the application. A Dockerfile is a text document that contains commands which are executed by Docker to build an image.

To build one based on your existing application, you may need to the following common commands.

- FROM - to define an official runtime as parent image.
- ADD/COPY - to copy the current directory contents into the container
- WORKDIR - Set the working directory
- RUN - to Install any needed packages
- EXPOSE - Make port available to the world outside this container
- ENV NAME - Define the environment variable
- CMD - Run application when the container launches

For more information on creating a Dockerfile, checkout the docker [file reference](https://docs.docker.com/engine/reference/builder/#usage).

To containerize the JPetStore application, the following [Dockerfile](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/Dockerfile) been used.

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
       volume.beta.kubernetes.io/storage-class: "ibmc-file-retain-silver"
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

For more details on creating custom storages classes checkout the main cluster storage [docs](https://console.bluemix.net/docs/containers/cs_storage.html#create).

 **Setting up backup and restore solutions for NFS file shares and block storage**

File shares and block storage are provisioned into the same location as your cluster. The storage is hosted on clustered servers by IBM to provide availability in case a server goes down. However, file shares and block storage are not backed up automatically and might be inaccessible if the entire location fails. To protect your data from being lost or damaged, you can set up periodic backups that you can use to restore your data when needed.

Review the following [backup and restore](https://console.bluemix.net/docs/containers/cs_storage.html#backup_restore) options for your NFS file shares and block storage.

**Move existing data over**

Copy data to and from pods and containers

You can use the `kubectl cp` command to copy files and directories to and from pods or specific containers in your cluster.

You can use the command in various ways:

- Copy data from your local machine to a pod in your cluster: `kubectl cp<local_filepath>/<filename> <namespace>/<pod>:<pod_filepath>`
- Copy data from a pod in your cluster to your local machine: `kubectl cp <namespace>/<pod>:<pod_filepath>/<filename> <local_filepath>/<filename>`
- Copy data from a pod in your cluster to a specific container in another pod another: `kubectl cp<namespace>/<pod>:<pod_filepath> <namespace>/<other_pod>:<pod_filepath> -c<container>`

### Create Kubernetes deployment yaml

A *Deployment* controller provides declarative updates for Pods and ReplicaSets. You describe a *desired state* in a Deployment object, and the Deployment controller changes the actual state to the desired state at a controlled rate. You can define Deployments to create new ReplicaSets, or to remove existing Deployments and adopt all their resources with new Deployments. 

Looking at the [JPetStore deployment YAML](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/jpetstore.yaml), you have things like: 

- Two services, one for the database and second for the web to exposes the pod to the outside.
- Two deployments, one for each service defined. 
- Ingress controller to load balancer the traffic across the different nodes.

You may have multiple deployment YAML files, one for each micro service. 

A Deployments yaml contain things like services to expose your node to the outside world, Deployment

### Push Deployments  

You can push a deployment files using the command:

```bash
$ kubectl create -f <yaml-file-name>.yaml
```

Verify your deployment, pods and services using: 

```bash
 $ kubectl get deployments
 $ kubectl get services
 $ kubectl get pods
```

Now that you understand the fundamentals of moving application to Kubernetes, next you can run the JPetStore application in a Kubernetes cluster and use everything you learned so far.

## Run the JPetStore in your cluster   

{: #run_application} 

Follow the JPetStore GitHub repo for steps to run the application in your cluster.  This application demo allows you to take an existing Java web application (JPetStore) that runs on WebSphere Application Server, containerize it and move it to Kubernetes, and then extend it with an Messaging interface using [Twilio](https://www.twilio.com/) to provide a Watson Visual Recognition capabilities.

Run the JPetStore using [this repo](https://github.ibm.com/ibmcloud/ModernizeDemo). 

## Extend the application 

{: #extend_application} 

Once an application is containerizd and pushed to a Kubernetes cluster then extending it can be very simple. Now that the application running on a Kubernetes cluster, you have the possibility to extend the different part of the application without too much of effort. In this section you will learn how the **JPetStore** can be extend it with an Messaging interface service [Twilio](https://www.twilio.com/) and [Watson Visual Recognition](https://console.bluemix.net/catalog/services/visual-recognition) service. 

You will extend the **JPetStore** application to be able to send a picture of a pet to your Twilio number via your phone. The application should respond with an available pet from the store or no pet of that type message. The **JPetStore** has a list of pets in the database and no modifications is made to the core **JPetStore** application, all you will do is use some services to enhance the application functionality. 

To extend **JPetStore** application you need to do the following: 

1. Visit [Twilio](http://twilio.com/) and sign up for a free account and **Buy a Number** with MMS capabilties then from the IBM Cloud catalog create a **Watson Visual Recognition** service.

2. Go to the service credentials page and retrieve credentials for each. 

3. Create two new files **mmsSearch and watson-secrets** and copy the JSON credential to each file. Reference to the [twilio-secrets](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/twilio-secrets) and [watson-secrets](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/watson-secrets) files here.

4. Create secrets required to access Watson MMS Service and Twilio Service, create secrets for both in Kubernetes using the command:

   ```bash
   # from the directory in which you created these two files
   $ kubectl create secret generic mms-secret \
     --from-file=watson-secrets=./watson-secrets --from-file=twilio-secrets=./twilio-secrets
   ```

   You have now created the services needed, created the secrets in Kubernetes, and your cluster is ready to use these services. Next, you would need to write the functionality to respond to the user via a text message with a reply if the pet they requested is available in the database or not. The user sends the pet image they want, the MMS message received by Twilio and sent to Watson Visual Recognition to verify the image of the pet sent and that then checked in the database where if this pet exists or not in the catalog, the user then gets a text message response. You would need to write the functionality to check the database and send back the response to Twilio to send to the user. You can write this functionality in the language in which app be written with where in this case been Java or in any other programming languages. 

   The JPetStore extend functionality been written in Go programming language to demonstrate different part of the application can be written in different programming languages. **This can be found [here](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/main.go).**

5. Once the extend script implemented in your programming language of choice or in GO with the sample given, next you would need to create a **[Dockerfile](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/Dockerfile)** and a Kubernetes [deployment.yaml](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/jpetstore-watson.yaml) file.

6. Build and push the **mmssearch** image to IBM Cloud container registry and push it Kubernetes.

   ```bash
   // Build and push the mmssearch image 
   $ cd ../../mmsSearch
   $ docker build . -t registry.ng.bluemix.net/${MYNAMESPACE}/mmssearch
   $ docker push registry.ng.bluemix.net/${MYNAMESPACE}/mmssearch
   
   // Push to Kubernetes
   $ kubectl create -f jpetstore-watson.yaml
   ```

7. To verify, send a text message to your Twilio number with an image of a pet and you should receive a response if the pet is available or not with the name of the pet. <p style="text-align: center;">

   ![Architecture diagram](/Applications/MAMP/htdocs/_GitHub/tutorials/images/solution30/sms.png)
   </p>

   In **summary**, you were able to create a MMSSearch microservice written in a different language, deploy it and provide extended functionality without needing to modify the core Java PerStore application. For more detailed steps check out the JPetStore demo on **[GitHub](https://github.ibm.com/ibmcloud/ModernizeDemo)**.

## Remove Services

{: #clean_up_resources}

In this step, you will clean up the resources to remove what you created above.

- Delete Kubernetes deployments. 
- Delete Kubernetes secrets. 
- Delete the storage PV and PVC. 
- Delete Watson visual recognition service.
- Delete Twilio MMS.

## Related Content
{: #related_content}

- [Get started](https://developer.ibm.com/courses/all/get-started-kubernetes-ibm-cloud-container-service/) with Kubernetes and IBM Cloud Container Service.
- IBM Cloud Container Service labs on [GitHub](https://github.com/IBM/container-service-getting-started-wt).
- Kubernetes main [docs](http://kubernetes.io/).
- IBM Cloud [docs](https://console.bluemix.net/docs/containers/cs_storage.html) managing storage on a cluster.



