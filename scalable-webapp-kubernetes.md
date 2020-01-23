---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019
lastupdated: "2019-11-22"
lasttested: "2019-11-22"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Scalable web application on Kubernetes
{: #scalable-webapp-kubernetes}

This tutorial walks you through how to scaffold a web application, run it locally in a container, and then deploy it to a Kubernetes cluster created with [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster). Additionally, you will learn how to <!--##istutorial#-->bind a custom domain,<!--#/istutorial#--> monitor the health of the environment, and scale the application.
{:shortdesc}

Containers are a standard way to package apps and all their dependencies so that you can seamlessly move the apps between environments. Unlike virtual machines, containers do not bundle the operating system. Only the app code, run time, system tools, libraries, and settings are packaged inside containers. Containers are more lightweight, portable, and efficient than virtual machines.

For developers looking to kickstart their projects, the {{site.data.keyword.dev_cli_notm}} CLI enables rapid application development and deployment by generating template applications that you can run immediately or customize as the starter for your own solutions. In addition to generating starter application code, Docker container image and CloudFoundry assets, the code generators used by the dev CLI and web console generate files to aid deployment into [Kubernetes](https://kubernetes.io/) environments. The templates generate [Helm](https://github.com/kubernetes/helm) charts that describe the application’s initial Kubernetes deployment configuration, and are easily extended to create multi-image or complex deployments as needed.

## Objectives
{: #objectives}

* Scaffold a starter application.
* Deploy the application to the Kubernetes cluster.
<!--##istutorial#-->
* Bind a custom domain.
<!--#/istutorial#-->
* Monitor the logs and health of the cluster.
* Scale Kubernetes pods.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
* [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster)

<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution2/Architecture.png)
</p>

1. A developer generates a starter application with {{site.data.keyword.dev_cli_notm}}.
1. Building the application produces a Docker container image.
1. The image is pushed to a namespace in {{site.data.keyword.registrylong_notm}}.
1. The application is deployed to a Kubernetes cluster.
1. Users access the application.

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
   * `dev` plugin,
* a Docker engine,
* `kubectl` to interact with Kubernetes clusters,
* `helm` to deploy charts.

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/tutorials?topic=solution-tutorials-getting-started) guide.

In addition, make sure you:
- [set up a registry namespace](/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_namespace_setup)
- and [understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/).

<!--##istutorial#-->
## Create a Kubernetes cluster
{: #create_kube_cluster}

{{site.data.keyword.containershort_notm}} delivers powerful tools by combining Docker and Kubernetes technologies, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

The major portion of this tutorial can be accomplished with a **Free** cluster. Two optional sections relating to Kubernetes Ingress and custom domain require a **Standard** cluster.

A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial.

- Create the Kubernetes cluster:
  - For Kubernetes on VPC infrastructure, you are required to create a VPC and subnet(s) prior to creating the Kubernetes cluster. You may follow the instructions provided under the [Creating a standard VPC Gen 1 compute cluster in the console](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_vpc_ui).
  - For Kubernetes on Classic infrastructure follow the [Creating a standard classic cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_standard) instructions.
{: #create_cluster}

- Gain access to your cluster as described on the Access tab of your cluster.
- Initialize the environment variable with the cluster name

   ```bash
   export MYCLUSTER=<CLUSTER_NAME>
   ibmcloud ks cluster config ${MYCLUSTER}
   ```
<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Configure the access to your cluster
{: #access-cluster}

`ibmcloud` is the command line tool to interact with {{site.data.keyword.cloud_notm}}. It comes with plugins to work with {{site.data.keyword.cloud_notm}} services.

1. Open a command prompt.
1. Run the login command
   ```sh
   ibmcloud login
   ```
   {:pre}
2. When prompted, select the region where your cluster was allocated.
3. Enter your IBMid email and password.
4. Select the account where you have been invited.

### Log in to your cluster

In this step, you'll configure `kubectl` to point to the cluster assigned to you.

1. Navigate to your cluster from the [cluster list](https://{DomainName}/kubernetes/clusters) and click on the **Access** tab under the cluster name.
1. Under **After your cluster provisions, gain access** section, follow instructions to log into your cluster on a terminal.
1. Run the below command to see all the namespaces in your cluster:
   ```sh
   kubectl get namespaces
   ```
   {:pre}
1. Initialize the environment variable with the cluster name:
   ```sh
   export MYCLUSTER=<CLUSTER_NAME>
   ```
   {:pre}
-->
<!--#/isworkshop#-->

## Create a starter application
{: #create_application}

The `ibmcloud dev` tooling greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

1. Start the `ibmcloud dev` wizard to create a new directory in the current working directory.
   ```
   ibmcloud dev create
   ```
   {: pre}

   You may be asked to target an organization and a space, follow the instructions on the CLI
   {:tip}
1. Select `Backend Service / Web App` > `Java - MicroProfile / JavaEE` > `Java Web App with Eclipse MicroProfile and Java EE` to create a Java starter. (To create a Node.js starter instead, use `Backend Service / Web App` > `Node`> `Node.js Web App with Express.js (Web App)` )
1. Enter a **unique name** for your application such as `<your-initials>kubeapp`.
4. Select the **resource group** where your cluster has been created.
1. Do not add additional services.
1. Do not add a DevOps toolchain, select **manual deployment**.

This generates a starter application complete with the code and all the necessary configuration files for local development and deployment to cloud on Cloud Foundry or Kubernetes.

![](images/solution2/Contents.png)

### Build the application

You can build and run the application as you normally would using `mvn` for java local development or `npm` for node development.  You can also build a docker image and run the application in a container to ensure consistent execution locally and on the cloud. Use the following steps to build your docker image.

1. Ensure your local Docker engine is started.
   ```
   docker ps
   ```
   {: pre}
1. Define an environment variable named `MYPROJECT` set with the name of the application you generated in the previous section:
   ```sh
   export MYPROJECT=<your-initials>kubeapp
   ```
   {:pre}
2. Change to the directory of the generated project.
   ```
   cd $MYPROJECT
   ```
   {: pre}
3. Build the application.
   ```
   ibmcloud dev build
   ```
   {: pre}

   This might take a few minutes to run as all the application dependencies are downloaded and a Docker image, which contains your application and all the required environment, is built.

### Run the application locally

1. Run the container.
   ```
   ibmcloud dev run
   ```
   {: pre}
2. After your container starts, on a browser go to `http://localhost:9080/` to see the app. If you created a Node.js application, go to `http://localhost:3000/`.

## Deploy application to cluster using helm chart
{: #deploy}

In this section, you first push the Docker image to the IBM Cloud private container registry, and then create a Kubernetes deployment pointing to that image.

### Prepare the access to {{site.data.keyword.registryshort_notm}}

1. To identify your {{site.data.keyword.registryshort_notm}} URL, run
   ```sh
   ibmcloud cr region
   ```
   {:pre}
1. Define an environment variable named `MYREGISTRY` pointing to the URL such as:
   ```sh
   export MYREGISTRY=us.icr.io
   ```
   {:pre}
1. Pick one of your existing registry namespaces or create a new one. To list existing namespaces, use:
   ```sh
   ibmcloud cr namespaces
   ```
   {:pre}
   To create a new namespace:
   ```sh
   ibmcloud cr namespace-add <REGISTRY_NAMESPACE>
   ```
   {:pre}
1. Define an environment variable named `MYNAMESPACE` pointing to the registry namespace:
   ```sh
   export MYNAMESPACE=<REGISTRY_NAMESPACE>
   ```
   {:pre}

### Build the container image

1. Build and tag (`-t`) the docker image
   ```sh
   docker build . -t ${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}:v1.0.0
   ```
   {: pre}
1. Push the docker image to your container registry on IBM Cloud
   ```sh
   docker push ${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}:v1.0.0
   ```
   {: pre}

### Deploy the application

[Helm](https://helm.sh/) helps you manage Kubernetes applications through Helm Charts, which helps define, install, and upgrade even the most complex Kubernetes application.

#### With Helm 2

1. Install Helm into your cluster [by following steps 2) and 3) on how to configure tiller and initialize Helm](https://{DomainName}/docs/containers?topic=containers-helm#public_helm_install).
1. Change to the chart directory:
   ```sh
   cd chart/$MYPROJECT
   ```
   {:pre}
1. Install the chart:
   ```sh
   helm install . --name ${MYPROJECT} --set image.repository=${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}
   ```
   {:pre}

#### With Helm 3

1. Change to the chart directory:
   ```sh
   cd chart/$MYPROJECT
   ```
   {:pre}
1. Install the chart:
   ```sh
   helm install ${MYPROJECT} . --set image.repository=${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}
   ```
   {:pre}

### View the application

1. List the Kubernetes services in the namespace:
   ```sh
   kubectl get services
   ```
   {:pre}
1. Locate the service linked to your application. It is named after your project.
   If your project name contains hyphens, they may have been removed by the chart, e.g `my-project` would become `myproject`.
1. Make note of the the public port the service is listening on. The port is a 5-digit number(e.g., 31569) under `PORT(S)`.
1. Identify a public IP of a worker node with the command below:
   ```sh
   ibmcloud ks workers ${MYCLUSTER}
   ```
   {: pre}
1. Access the application at `http://worker-ip-address:portnumber/`. For VPC the IP addresses of the clusters are private to the VPC. These can be accessed by opening the **Web Terminal** from the Kubernetes cluster console UI.  See [Using the Kubernetes web terminal in your web browser](https://{DomainName}/docs/containers?topic=containers-cs_cli_install#cli_web)

## Use the IBM-provided domain for your cluster
{: #ibm_domain}

In the previous step, the application was accessed with a not standard port. The service was exposed by way of Kubernetes NodePort feature.

Paid clusters come with an IBM-provided domain. This gives you a better option to expose applications with a proper URL and on standard HTTP/S ports.

Use Ingress to set up the cluster inbound connection to the service.

![Ingress](images/solution2/Ingress.png)

1. Identify your IBM-provided **Ingress domain**
   ```sh
   ibmcloud ks cluster get --cluster ${MYCLUSTER}
   ```
   {: pre}
   to find
   ```yaml
   Ingress subdomain: mycluster.us-south.containers.appdomain.cloud
   Ingress secret:    mycluster
   ```
   {: screen}
2. Create an Ingress file `ingress-ibmdomain.yml` pointing to your domain with support for HTTP and HTTPS. Use the following file as a template, replacing all the values wrapped in <> with the appropriate values from the above output. **service-name** is the name under `==> v1/Service` in the above step. You can also use `kubectl get svc` to find the service name of type **NodePort**.

   ```yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress-for-ibmdomain-http-and-https
   spec:
     tls:
     - hosts:
       -  <nameofproject>.<ingress-sub-domain>
       secretName: <ingress-secret>
     rules:
     - host: <nameofproject>.<ingress-sub-domain>
       http:
         paths:
         - path: /
           backend:
             serviceName: <service-name>
             servicePort: 9080
   ```
   {: codeblock}
3. Deploy the Ingress
   ```sh
   kubectl apply -f ingress-ibmdomain.yml
   ```
   {: pre}
4. Access your application at `https://<nameofproject>.<ingress-sub-domain>/`

<!--##istutorial#-->
## Use your own custom domain
{: #custom_domain}

This section requires you to own a custom domain and to be able to modify the DNS records of the domain. You will need to create a `CNAME` record pointing to the IBM-provided domain.

See [Using the Ingress controller with a custom domain](https://{DomainName}/docs/containers?topic=containers-ingress#ingress) for more information.

### with HTTP

1. Create an Ingress file `ingress-customdomain-http.yml` pointing to your domain:
   ```yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress-for-customdomain-http
   spec:
     rules:
     - host: <my-custom-domain.com>
       http:
         paths:
         - path: /
           backend:
             serviceName: <service-name>
             servicePort: 9080
   ```
   {: codeblock}
2. Deploy the Ingress
   ```sh
   kubectl apply -f ingress-customdomain-http.yml
   ```
   {: pre}
3. Access your application at `http://<my-custom-domain.com>/`

### with HTTPS

If you were to try to access your application with HTTPS at this time `https://<my-custom-domain.com>/`, you will likely get a security warning from your web browser telling you the connection is not private. You would also get a 404 as the Ingress just configured would not know how to direct HTTPS traffic.

1. Obtain a trusted SSL certificate for your domain. You'll need the certificate and the key as described [here](https://{DomainName}/docs/containers?topic=containers-ingress#public_inside_3). To generate a trusted certificate, you can either use [Let's Encrypt](https://letsencrypt.org/) or [{{site.data.keyword.cloudcerts_long}}](https://{DomainName}/docs/services/certificate-manager?topic=certificate-manager-ordering-certificates).
2. Save the cert and the key in base64 ascii format files.
3. Create a TLS secret to store the cert and the key:
   ```sh
   kubectl create secret tls my-custom-domain-secret-name --cert=<custom-domain.cert> --key=<custom-domain.key>
   ```
   {: pre}
4. Create an Ingress file `ingress-customdomain-https.yml` pointing to your domain:
   ```yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress-customdomain-https
   spec:
     tls:
     - hosts:
       - <my-custom-domain.com>
       secretName: <my-custom-domain-secret-name>
     rules:
     - host: <my-custom-domain.com>
       http:
         paths:
         - path: /
           backend:
             serviceName: <service-name>
             servicePort: 9080
   ```
   {: codeblock}
5. Deploy the Ingress:
   ```sh
   kubectl apply -f ingress-customdomain-https.yml
   ```
   {: pre}
6. Access your application at `https://<my-custom-domain.com>/`.
<!--#/istutorial#-->

## Monitor application health
{: #monitor_application}

1. To check the health of your application, navigate to [clusters](https://{DomainName}/kubernetes/clusters) to see a list of clusters and click on your cluster.
2. Click **Kubernetes Dashboard** to launch the dashboard in a new tab.
3. Select **Nodes** on the left pane, click the **Name** of the nodes and see the **Allocation Resources** to see the health of your nodes.
4. To review the application logs from the container, select **Pods**, **pod-name** and **Logs**.
5. To **ssh** into the container, identify your pod name from the previous step and run
   ```sh
   kubectl exec -it <pod-name> -- bash
   ```
   {: pre}

## Scale Kubernetes pods
{: #scale_cluster}

As load increases on your application, you can manually increase the number of pod replicas in your deployment. Replicas are managed by a [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/). To scale the application to two replicas, run the following command:

```sh
kubectl scale deployment <deployment-name> --replicas=2
```
{: pre}

After a shortwhile, you will see two pods for your application in the Kubernetes dashboard (or with `kubectl get pods`). The Ingress controller in the cluster will handles the load balancing between the two replicas.

With Kubernetes, you can enable [horizontal pod autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) to automatically increase or decrease the number of instances of your apps based on CPU.

To create an autoscaler and to define your policy, run the below command
```sh
kubectl autoscale deployment <deployment-name> --cpu-percent=<percentage> --min=<min_value> --max=<max_value>
```
{: pre}

Once the autoscaler is successfully created, you should see
`horizontalpodautoscaler.autoscaling/<deployment-name> autoscaled`

Refer to [scaling apps](https://{DomainName}/docs/containers?topic=containers-app#app_scaling) for prerequisites and additional info.

## Remove resources

* Delete the Kubernetes artifacts created for this application:
   ```sh
   helm delete ${MYPROJECT}
   ```
   {:pre}
<!--##istutorial#-->
* Delete the cluster.
<!--#/istutorial#-->

## Related content

* [IBM Cloud Kubernetes Service](https://{DomainName}/docs/containers?topic=containers-container_index#container_index)
<!-- * [IBM Cloud App Service](https://{DomainName}/docs/cloudnative/index.html#web-mobile) -->
* [Continuous Deployment to Kubernetes](https://{DomainName}/docs/tutorials?topic=solution-tutorials-continuous-deployment-to-kubernetes#continuous-deployment-to-kubernetes)
* [Scaling a deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment)
* [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
