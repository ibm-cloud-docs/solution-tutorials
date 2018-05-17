---
copyright:
  years: 2017, 2018
lastupdated: "2018-05-17"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Understand how to move a VM based application to Kubernetes

This tutorial walks you through the process of moving a VM based application to a Kubernetes cluster on the {{site.data.keyword.containershort_notm}}. You will learn how to take an existing application, containerize it, deploy it to a Kubernetes cluster, and then extend it using IBM Cloud services. While the specific steps to migrate an existing application will vary, this tutorial aims to outline the general path with an example.

The [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/docs/containers/container_index.html) offers managed Kubernetes clusters with isolation and hardware choice, operational tools, integrated security, as well as insights into images and containers.

There are two options for moving an application to Kubernetes:

1. Identify components of a large monolith application, which can be separated into their own micro-service, containerized and deployed to Kubernetes.
2. Containerize the entire application and deploy it on a Kubernetes cluster.

In this tutorial, you will exercise the latter option using a popular Java e-commerce application **JPetStore**. After moving it to Kubernetes, you will extend it by using IBM Cloud services.

## Objectives:

{: #objectives}

- Understand how to map components between VMs and Kubernetes.
- Containerize the application.
- Deploy the container to a Kubernetes cluster on the {{site.data.keyword.containershort_notm}}.
- Extend the application with IBM Cloud services.

## Services used

{: #products}

This tutorial uses the following cloud services:

- [{{site.data.keyword.containershort}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
- [{{site.data.keyword.composeForMySQL_full}}](https://console.bluemix.net/catalog/services/compose-for-mysql)
- [{{site.data.keyword.visualrecognitionfull}}](https://console.bluemix.net/catalog/services/visual-recognition)
- [Twilio](https://www.twilio.com/)

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{:#architecture}

The following diagram outlines a traditonal application architecture, based on virtual machines.

<p style="text-align: center;">
![Architecture diagram](images/solution30/traditional_architecture.png)

</p>

1. The user sends a request to the endpoint.
2. The load balancer selects one of the healthy application instances, running on VMs to handle the request.
3. The application server is backed by another VM, running a database.

**Components:**

- Two VMs to host the Java application, the application files are stored within the VMs.
- A load balancer service to balance traffic between the two application servers.
- A MySQL database, installed on a virtual server.

A modern container architecture would look similar to:

<p style="text-align: center;">
![Architecture diagram](images/solution30/Architecture.png)
</p>

1. The user sends a request to the endpoint.
2. Ingress load balances traffic to workloads in the cluster
3. The data layer is an external managed database service.

**Components:**

- A cluster can have one or more worker nodes. A worker node is a virtual server, physical server or bare metal machine. In this tutorial, you will set up a cluster with two worker nodes.
- Persistent volumes for saving and sharing data between the application instances.
- A Kubernetes ingress controller to manage balancing the load between worker nodes. Ingress is a collection of rules that allow inbound connections to reach the cluster services. Ingress balances the traffic between worker nodes internally.
- A MySQL service, acting as the database. While Kubernetes allows you to run your own database inside the cluster, it is usually more favorable to use a managed database-as-a service. This is operationally simpler and allows for "built in" backups and scaling. You can find many different types databases in the [IBM cloud catalog](https://console.bluemix.net/catalog/?category=data).

## VMs, containers and Kubernetes

IBM Cloud provides the capability to run applications in containers on Kubernetes. The {{site.data.keyword.containershort_notm}} runs Kubernetes clusters that deliver the following tools and functions:

- Intuitive user experience and powerful tools
- Built-in security and isolation to enable rapid delivery of secure applications
- Cloud services that include cognitive capabilities from IBM® Watson™
- Ability to manage dedicated cluster resources for both stateless applications and stateful workloads

### Virtual machines vs containers 

**VMs**, traditional applications are run on native hardware.  A single application does not typically use the full resources of a single machine. Most organizations try to run multiple applications on a single machine to avoid wasting resources. You could run multiple copies of the same application, but to provide isolation, you can use VMs to run multiple application instances (VMs) on the same hardware. These VMs have full operating system stacks that make them relatively large and inefficient due to duplication both at runtime and on disk.

**Containers** are a standard way to package apps and all their dependencies so that you can seamlessly move the apps between environments. Unlike virtual machines, containers do not bundle the operating system. Only the app code, run time, system tools, libraries, and settings are packaged inside containers. Containers are more lightweight, portable, and efficient than virtual machines.

In addition, containers allow you to share the host OS. This reduces duplication while still providing the isolation. Containers also allow you to drop unneeded files such as system libraries and binaries to save space and reduce your attack surface. 

### Kubernetes orchestration

[Kubernetes](http://kubernetes.io/) is a container orchestrator to manage the lifecycle of containerized applications in a cluster of nodes. Your applications might need many other resources to run such as volumes, networks, and secrets (which will help you connect to other cloud services), talk to firewalled backends, and secure keys. Kubernetes helps you add these resources to your application. The key paradigm of Kubernetes is its declarative model. The user provides the desired state and Kubernetes will attempt to conform to, and then maintain the described state.

This [2-hour self-paced course](https://developer.ibm.com/courses/all/get-started-kubernetes-ibm-cloud-container-service/) will help you to get your first hands-on experience with Kubernetes. Additionally, check out the Kubernetes [concepts](https://kubernetes.io/docs/concepts/) documentation page to learn more about the concepts of Kubernetes.

## Plan the move

{: #plan_the_move}

In this section, you will learn how to configure a Kubernetes cluster, how to containerize the application and how to create the required Kubernetes deployment files.

By using Kubernetes clusters with the {{site.data.keyword.containershort_notm}}, you get the following benefits:

- Multiple data centers where you can deploy your clusters
- Support for ingress and load balancer networking options
- Dynamic persistent volume support
- Highly available, IBM-managed Kubernetes masters

### Configure Resources

To run a production application in the cloud using Kubernetes, there are several items to consider:

1. How many clusters do you need? A good starting point might be three clusters, one for development, one for testing and one for production.
2. What [hardware](https://console.bluemix.net/docs/containers/cs_clusters.html#planning_worker_nodes) do I need for my worker nodes? Virtual machines or Bare Metal?
3. How many worker nodes do you need? This depends highly on the applications scale, the more nodes you have the more resilient your application will be.
4. How many replicas should you have for higher availability? Deploy replica clusters in multiple regions to make your app more available and protect the app from being down due to a region failure. Check out the [Best practices for organizing users, teams, applications](users-teams-applications.html#replicate-for-multiple-environments) solution guide for creating multiple environments. **<<ToDo: Needs 2nd review>>**
5. Which is the minimal set of resources your app needs to startup? You might wantg to test your application for the amount of memory and CPU it requires to run. Your worker node should then have enough resources to deploy and start the app. Make sure to then set resource requests as part of the pod specifications. This setting is what Kubernetes uses to select (or schedule) a worker node that has enough capacity to support the request. Estimate how many pods will run on the worker node and the resource requirements for those pods. At a minimum, your worker node must be large enough to support one pod for the app.
6. When to increase the number of nodes? You can monitor the cluster usage and increase nodes when needed. See this tutorial to understand how to [analyze logs and monitor the health of Kubernetes applications](analyze-logs-and-monitor-the-health-of-kubernetes-applications.html).
7. Do you need redundant, reliable storage? If yes, create a persistent volume claim for NFS storage or bind an IBM Cloud database service to your pod. For either option, when a container crashes or a pod is removed from a worker node, the data is not removed and can still be accessed by other pods.

To make the above more specific, let's assume you want to run the JPetStore application in the cloud for production use and expect a high load of traffic. Let's explore what resources you would need:

1. Setup three clusters, one for development, one testing and one for production.
2. The development and testing clusters can start with minimum RAM and CPU option (e.g. 2 CPU's, 4GB of RAM and one worker node for each cluster).
3. For the production cluster, you may want to have more resources for performance, high availability and resiliency. We might choose a dedicated or even a bare metal option and have at least 4 CPU's, 16GB of RAM, and two workers nodes.

###Managing Compute Resources

When specifying a pod, you have the option to specify how much CPU and memory (RAM) each container needs. If containers have resource requests specified, the scheduler can make better decisions about which nodes to place pods on. 

Each container of a pod can specify one or more of the following:

```bash
spec.containers[].resources.limits.cp
spec.containers[].resources.limits.memory
```

There is lot's more information about managing Kubernetes compute resources [here](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/).

### Applying the 12 factor principle to your app

The [twelve-factor app](https://12factor.net/) is a methodology for building cloud native applications and you should understand and apply it when moving applications to containers and orchestrating these via Kubernetes.

Here are some of key principles that apply to this tutorial:

- **Codebase** - All source code and configuration files are tracked inside a version control system (e.g. a GIT repository).
- **Build, release, run** - The 12-factor app uses strict separation between the build, release, and run stages. This can be automated with an integrated DevOps delivery pipeline to build and test the application before deploying it to the cluster. Checkout the [Continuous Deployment to Kubernetes tutorial](continuous-deployment-to-kubernetes.html) to learn how to set up a continuous integration and delivery pipeline. It covers the set up of source control, build, test and deploy stages and will show you how to add integrations such as security scanners, notifications, and analytics.
- **Config** - All configuration information is stored in environment variables, and no service credentials are hardcoded within the application.
- **Backing Services** - Your application code can connect to many services, such as databases, messaging queues or even AI services. These services (e.g. a database) can be installed locally in a separate node or used "as a service" in the cloud. In either case, the service is referenced by a simple endpoint (URL) and accessed through service credentials. Your code shouldn’t know the difference.

### Containerize the application 

To containerize your application, you need to create a Dockerfile inside the root of the application. A Dockerfile is a text document that contains commands which are executed by Docker to build an image.

To build one based on your existing application, you may use following common commands.

- FROM - to define an official runtime as parent image.
- ADD/COPY - to copy the current directory contents into the container
- WORKDIR - Set the working directory
- RUN - to Install any needed packages
- EXPOSE - Make port available to the world outside this container
- ENV NAME - Define the environment variable
- CMD - Run application when the container launches

For more information on creating a Dockerfile, checkout the docker [file reference](https://docs.docker.com/engine/reference/builder/#usage).

To containerize the JPetStore application, the following [Dockerfile](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/Dockerfile) has been used. **<<ToDo: Dockerfile link to be updated public repo available>>**

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

Once a Dockerfile created, next you would need to build and push the docker images. The docker images for each of the microservices need to be built and the images need to be pushed to a container registry. These steps are for building the image and pushing it IBM Cloud private registry, but you can also push them to a public registry.

1. Identify your registry namespace with `bx cr namespaces` or create a new one using `bx cr namespace-add <NAMESPACE>`

2. Build and push the **jpetstoreweb** image:

   ```bash
   $ docker build . -t registry.ng.bluemix.net/<NAMESPACE>/jpetstoreweb
   $ docker push registry.ng.bluemix.net/<NAMESPACE>/jpetstoreweb
   ```

### Modify your code

When moving to a container-based microservice architecture, (at least) two topics have to be handled differently from a traditional VM-based application:

-	**Service credentials**: How to handle and store sensitive information (e.g. credentials) to access databases or other backing services.
    **Storage**: Where and how to store data in your cluster.

**Service Credentials**

For several reasons, it's never good practice to store credentials within the application. Instead, Kubernetes provides so called **["secrets"](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)**, which are intended to hold sensitive information (e.g. passwords, OAuth tokens or ssh keys). Putting this information in a `secret` is safer and more flexible than putting it verbatim into a `pod` definition or in a docker image.

Let's explore how to create a secret. In this case we want to add the [Watson Visual Recognition](https://www.ibm.com/watson/services/visual-recognition/) service to our application:

1. Create a new file called `watson-secrets.txt` and add the service credential (which you can obtain from the IBM Cloud dashboard or using the CLI):

   ```bash
   {
       "url": "https://gateway-a.watsonplatform.net/visual-recognition/api",
       "api_key": ""
   }
   ```

   .	Next, create a secret from the file by running:

   ```bash
   kubectl create secret generic watson-visual-secret --from-file=watson-secrets.txt=./watson-secrets.txt
   ```

   .	To verify that the secret has been created, run the command:

   ```bash
   kubectl get secrets
   ```

The secret can now be referenced from the Kubernetes deployment file. We will go over the Kubernetes deployment files and how the secret can been referenced a bit later in this tutorial.

**Saving data in your cluster**

The {{site.data.keyword.containershort_notm}} allows you to choose from several options of storage and then sharing it across pods in your cluster. Not all storage options offer the same level of persistence and availability in disaster situations.

**Non-persistent data storage**: Containers and pods are, by design, short-lived and can fail unexpectedly. While you can store data in the local file system of the container, this only stores it throughout the lifecycle of the container. This data (inside a container) can not be shared with other containers or pods and is lost when the container crashes or is removed. 

**Persistent data storage**: To persist data, you need to create a persistent volume claim (PVC), which will provision [NFS](https://en.wikipedia.org/wiki/Network_File_System) file storage or block storage for your cluster. This mount is then claimed to a persistent volume (PV) to ensure that data is available, even if the pods crash or shut down. The NFS file storage and block storage that backs the PV is clustered by IBM in order to provide high availability for your data. The storage classes describe the types of storage offerings available and define various aspects, such as the data retention policy, size in gigabytes, and IOPS when you create your PV.

In Kubernetes, the way this can be done is by using `PersistentVolume` to store the data in a [NFS-based file storage](https://www.ibm.com/cloud/file-storage/details) or [block storage](https://www.ibm.com/cloud/block-storage) and then use `PersistentVolumeClaim` to make that storage available to your pods. 

To create a PV and matching PVC, follow these steps: 

1. Review the available storage classes (full list of storage classes [here](https://console.bluemix.net/docs/containers/cs_storage.html#create) with storage capacity breakdown).

   ```bash
   kubectl get storageclasses
   ```

2. Run the command below to decide the storage class. 

   Note: The **retain** options means that the storage class will not be removed, even after deleting the `PersistentVolumeClaim`. 

   ```bash
   kubectl describe storageclasses ibmc-file-retain-silver 
   ```

3. Create a new file called `mypvc.yaml` with the following content:

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

4. Create the PVC:

   ```bash
   kubectl apply -f mypvc.yaml
   ```

5. Verify that your PVC is created and bound to the PV (this process can take a few minutes):

   ```bash
   kubectl describe pvc mypvc
   ```

For more details on creating custom storages classes, please see the [cluster storage documentation](https://console.bluemix.net/docs/containers/cs_storage.html#create).

**Setting up backup and restore solutions for NFS file shares and block storage**

File shares and block storage are provisioned into the same location as your cluster. The storage itself is hosted on clustered servers by IBM to provide high availability. However, file shares and block storage are not backed up automatically and might be inaccessible if the entire location fails. To protect your data from being lost or damaged, you can set up periodic backups, which you can use to restore your data when needed.

Please review the following [backup and restore](https://console.bluemix.net/docs/containers/cs_storage.html#backup_restore) options for your NFS file shares and block storage.

**Moving existing data**

Use the `kubectl cp` command to copy files and directories to and from pods or specific containers in your cluster. The command has various options:

- Copy data from your local machine to a pod in your cluster: `kubectl cp <local_filepath>/<filename> <namespace>/<pod>:<pod_filepath>`
- Copy data from a pod in your cluster to your local machine: `kubectl cp <namespace>/<pod>:<pod_filepath>/<filename> <local_filepath>/<filename>`
- Copy data from a pod in your cluster to a specific container in another pod: `kubectl cp<namespace>/<pod>:<pod_filepath> <namespace>/<other_pod>:<pod_filepath> -c<container>`

**ToDo:** Need to add steps to copy data to File Storage.

### Create the Kubernetes deployment yaml

A *Deployment* Controller provides declarative updates for Pods and ReplicaSets. You describe a *desired state* in a Deployment object, and the Deployment Controller changes the actual state to the desired state at a controlled rate. It allows you to define deployments to create new ReplicaSets, or to remove existing deployments and adopt all their resources with new deployments. 

Note that the [JPetStore deployment YAML](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/jpetstore.yaml) file contains:

- Two deployments to create the database and the web microservices
- Two services for exposing the microservices
- An Ingress controller to manage the traffic to the services.

Kubernetes allows you to have multiple deployment YAML files, one for each microservice. 

### Push Deployments

You can create a deployment from the yaml file using the `kubectl` command:

```bash
kubectl create -f <yaml-file-name>.yaml
```

Verify your deployment and the associated pods and services by using: 

```bash
kubectl get deployments
kubectl get services
kubectl get pods
```

Now that you understand the fundamentals of moving application to Kubernetes, you can run the JPetStore application in a Kubernetes cluster and apply the concepts you've learned.

## Run the JPetStore in your cluster   

{: #run_application} 

Follow the README in the JPetStore GitHub repository for steps to run the application in your cluster.  This application demo allows you to take an existing Java web application (JPetStore) that runs on WebSphere Application Server, containerize it and move it to Kubernetes, and then extend it with an Messaging interface using [Twilio](https://www.twilio.com/) to provide a Watson Visual Recognition capabilities.

Run the JPetStore using [this repo](https://github.ibm.com/ibmcloud/ModernizeDemo). 

## Extend the application 

{: #extend_application} 

Once an application is containerized and pushed to a Kubernetes cluster on IBM Cloud, the application can be easily extended. In this section you will learn how the **JPetStore** can be extended with the text messaging interface service [Twilio](https://www.twilio.com/) and [Watson Visual Recognition](https://console.bluemix.net/catalog/services/visual-recognition) service. 

You will extend the **JPetStore** application to be able to query for availability and price by simply sending a text message of a pet. The **JPetStore** has a list of pets in the database and no modifications is made to the core **JPetStore** application. This shows how you can enhance the application functionality by adding additional microservices on top of an existing application.

To extend **JPetStore** application you need to do the following: 

1. Visit [Twilio](http://twilio.com/) and sign up for a free account and **Buy a Number** with MMS capabilties then from the IBM Cloud catalog create a **Watson Visual Recognition** service.

2. Create two new files **mmsSearch and watson-secrets** and copy the JSON credentials to each file. Reference the [twilio-secrets](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/twilio-secrets) and [watson-secrets](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/watson-secrets) files here.

3. Run the command below to create secret objects in Kubernetes for the Watson and Twilio Service using the files. 

   ```bash
   # from the directory in which you created these two files
   $ kubectl create secret generic mms-secret \
     --from-file=watson-secrets=./watson-secrets --from-file=twilio-secrets=./twilio-secrets
   ```

4. Write the functionality to extend the application to allow responding to the user via a text message with a response if a pet is available or not. The user will send an image of a pet and get a response if the pet is available or not. This is done by using Twilio to process the messages and Watson visual recognition to verify the image. Use the GO sample to how this functionality been developed. Use the GO sample **[here](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/main.go).**

5. Create a **[Dockerfile](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/mmsSearch/Dockerfile)** to package the GO application and a Kubernetes [deployment.yaml](https://github.ibm.com/ibmcloud/ModernizeDemo/blob/master/jpetstore/jpetstore-watson.yaml) file to deploy the GO micro service to Kubernetes.

6. Build and push the **mmssearch** image to IBM Cloud container registry and push it Kubernetes.

   ```bash
   // Build and push the mmssearch image 
   $ cd ../../mmsSearch
   $ docker build . -t registry.ng.bluemix.net/${MYNAMESPACE}/mmssearch
   $ docker push registry.ng.bluemix.net/${MYNAMESPACE}/mmssearch
   
   // Push to Kubernetes
   $ kubectl create -f jpetstore-watson.yaml
   ```

7. To verify, send a text message to your Twilio number with an image of a pet and you should receive a response. <p style="text-align: center;">

   ![Architecture diagram](images/solution30/sms.png)
   </p>

   In summary, you were able to create a MMSSearch microservice written in a different language, deploy it and provide extended functionality without needing to modify the core Java PerStore application. For more detailed steps check out the JPetStore demo on **[GitHub](https://github.ibm.com/ibmcloud/ModernizeDemo)**.

## Expand the Tutorial

Do you want to learn more? Here are some ideas of what you can do next:

- [Analyze logs and monitor the health of Kubernetes applications using Kibana and Grafana](kubernetes-log-analysis-kibana.html).
- Set up [continuous integration and delivery pipeline](continuous-deployment-to-kubernetes.html) for containerized applications running in Kubernetes.
- Deploy the production cluster [across multiple regions](multi-region-webapp.html).
- Use [multiple clusters across multiple regions](https://console.bluemix.net/docs/containers/cs_regions.html#regions-and-locations) for high availability. 

## Remove services and resources

{: #clean_up_resources}

In this step, you will clean up the resources to remove what you created above.

- Delete Kubernetes deployments.

  ```sh
  kubectl get deployments
  ```
  ```sh
  kubectl delete deployments <DEPLOYMENT_NAME>
  ```

  If you wish to delete all the deployments in one go, use `--all` in place of `<DEPLOYMENT_NAME>`
  {:tip}  

- Delete Kubernetes secrets.
  ```sh
  kubectl get secrets
  ```
  ```sh
  kubectl delete secrets <SECRET_NAME>
  ```
- Delete the storage PV and PVC. 
  ```sh
  kubectl get pvc
  ```
  ```sh
  kubectl delete pvc <PVC_NAME>
  ```
- Delete Watson visual recognition service.
- Delete Twilio MMS.

## Related Content
{: #related_content}

- [Get started](https://developer.ibm.com/courses/all/get-started-kubernetes-ibm-cloud-container-service/) with Kubernetes and {{site.data.keyword.containershort_notm}}.
- {{site.data.keyword.containershort_notm}} labs on [GitHub](https://github.com/IBM/container-service-getting-started-wt).
- Kubernetes main [docs](http://kubernetes.io/).
- IBM Cloud [docs](https://console.bluemix.net/docs/containers/cs_storage.html) managing storage on a cluster.
- [Best practices solution guide](users-teams-applications.html) for organizing users, teams and applications.



