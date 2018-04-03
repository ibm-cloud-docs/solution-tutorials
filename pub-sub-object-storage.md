---
copyright:
  years: 2017
lastupdated: "2017-11-22"

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

# Asynchronous Data Processing Media Using Pub/Sub Messaging
In this tutorial, you will learn how to use messaging services to orchestrate long running workloads to worker applications running in a Kubernetes cluster. You will create a application which will asynchronously process user uploaded files.
{:shortdesc}

## Products
{: #products}

This tutorial uses the following products:
* Cloud Object Storage
* MessageHub
* Kubernetes

<p style="text-align: center;">
![](images/solution25/Architecture.png)
</p>

1. The user uploads document using the UI application
2. Document is saved in Cloud Object Storage
3. Message is sent to MessageHub
4. When ready, workers listen up message and begin processing files
5. Workers send message when complete.

## Before you begin
{: #prereqs}

* [IBM Cloud Developer Tools](https://console.bluemix.net/docs/cli/idt/setting_up_idt.html#add-cli) - Tool to install IBM Cloud CLI, Kubernetes, Helm, and Docker.


## Create a Kubernetes cluster
{: #create_kube_cluster}

1. Create a Kubernetes cluster from the [Catalog](https://console.bluemix.net/containers-kubernetes/launch). Name it `mycluster` for ease of following this tutorial. This tutorial can be accomplished with a **free** cluster of type **Lite**.

   ![Kubernetes Cluster Creation on IBM Cloud](images/solution2/KubernetesClusterCreation.png)
2. Check the status of your **Cluster** and **Worker Nodes** and wait for them to be **ready**.

### Configure kubectl

In this step, you'll configure kubectl to point to your newly created cluster going forward. [kubectl](https://kubernetes.io/docs/user-guide/kubectl-overview/) is a command line tool that you use to interact with a Kubernetes cluster.

1. Use `bx login` to log in interactively. Provide the organization (org), region and space under which the cluster is created. You can reconfirm the details by running `bx target` command.

2. When the cluster is ready, retrieve the cluster configuration:
   ```bash
   bx cs cluster-config <cluster-name>
   ```
   {: pre}

3. Copy and paste the **export** command to set the KUBECONFIG environment variable as directed. To verify whether the KUBECONFIG environment variable is set properly or not, run the following command:
  `echo $KUBECONFIG`

4. Check that the `kubectl` command is correctly configured
   ```bash
   kubectl cluster-info
   ```
   ![](images/solution2/kubectl_cluster-info.png)

   {: pre}

 ## Create a MessageHub instance
 {: #create_messagehub}

 IBM Message Hub is a fast, scalable, fully managed messaging service, based on Apache Kafka, an open-source, high-throughput messaging system which provides a low-latency platform for handling real-time data feeds.

 1. From the dashboard, click on **Create resource** and select **Message Hub** from the Application Services section.
 2. Name the service `mymessagehub` and click `Create`.
 3. Bind this service to your cluster by binding the service instance to the `default` Kubernetes namespace.
 ```
 bx cs cluster-service-bind mycluster default mymessagehub
 ```


## Create an Object Storage instance
{: #create_cos}

IBM® Cloud Object Storage is encrypted and dispersed across multiple geographic locations, and accessed over HTTP using a REST API. Cloud Object Storage provides flexible, cost-effective, and scalable cloud storage for unstructured data. Object Storage combined with a [Content Delivery Network](https://console.bluemix.net/catalog/infrastructure/cdn-powered-by-akamai) allows you to store and serve ad payloads (images).

1. From the dashboard, click on **Create resource** and select **Object Storage** from the Storage section.
2. Name the service `myobjectstorage` click **Create**.
3. Click **Create Bucket**.
4. Set the bucket name to `mybucket` and click **Create**.
5. Bind this service to your cluster by binding the service instance to the `default` Kubernetes namespace.
 ```
 bx resource service-alias-create myobjectstorage --instance-name myobjectstorage
 bx cs cluster-service-bind mycluster default myobjectstorage
 ```

## Deploy the UI application to the cluster

1. Clone the sample application repository locally and change directory to the `webapp` folder.
```sh
  git clone https://github.com/IBM-Cloud/pub-sub-demo
```
{: pre}

2. Deploy the application. This command generates a docker images, pushes it to your IBM Cloud Container Registry and then creates a Kubernetes deployment.
```sh
bx dev deploy -t container
```
3. Visit the application and upload a test document.

## Deploy the worker application to the cluster

1. Build the docker image and push it to your IBM Container Registry.
```sh
docker build -t registry.ng.bluemix.net/<yournamespace>/myworkerapp worker
docker push registry.ng.bluemix.net/<yournamespace>/myworkerapp
```
3. Deploy the application.
```
kubectl create -f worker-deployment.yml
```
