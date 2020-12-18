---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019
lastupdated: "2020-12-17"
lasttested: "2020-12-17"

content-type: tutorial
services: containers, Registry, certificate-manager
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Scalable web application on Kubernetes
{: #scalable-webapp-kubernetes}
{: toc-content-type="tutorial"}
{: toc-services="containers, Registry"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This tutorial walks you through how to scaffold a web application, run it locally in a container, and then deploy it to a Kubernetes cluster created with [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster). Additionally, you will learn how to <!--##istutorial#-->bind a custom subdomain,<!--#/istutorial#--> monitor the health of the environment, and scale the application.
{:shortdesc}

Containers are a standard way to package apps and all their dependencies so that you can seamlessly move the apps between environments. Unlike virtual machines, containers do not bundle the operating system. Only the app code, run time, system tools, libraries, and settings are packaged inside containers. Containers are more lightweight, portable, and efficient than virtual machines.

For developers looking to kickstart their projects, the {{site.data.keyword.dev_cli_notm}} CLI enables rapid application development and deployment by generating template applications that you can run immediately or customize as the starter for your own solutions. In addition to generating starter application code, Docker container image and CloudFoundry assets, the code generators used by the dev CLI and web console generate files to aid deployment into [Kubernetes](https://kubernetes.io/) environments. The templates generate [Helm](https://github.com/kubernetes/helm) charts that describe the application’s initial Kubernetes deployment configuration, and are easily extended to create multi-image or complex deployments as needed.

## Objectives
{: #scalable-webapp-kubernetes-objectives}

* Scaffold a starter application.
* Deploy the application to the Kubernetes cluster.
<!--##istutorial#-->
* Bind a custom subdomain.
<!--#/istutorial#-->
* Monitor the logs and health of the cluster.
* Scale Kubernetes pods.


<p style="text-align: center;">

  ![Architecture](images/solution2/Architecture.png)
</p>

1. A developer generates a starter application with {{site.data.keyword.dev_cli_notm}}.
1. Building the application produces a Docker container image.
1. The image is pushed to a namespace in {{site.data.keyword.registrylong_notm}}.
1. The application is deployed to a Kubernetes cluster.
1. Users access the application.

## Before you begin
{: #scalable-webapp-kubernetes-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
   * `dev` plugin,
* a Docker engine,
* `kubectl` to interact with Kubernetes clusters,
* `helm` to deploy charts.

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

Note: To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](https://{DomainName}/shell) from the {{site.data.keyword.cloud_notm}} console.
{:tip}
<!--#/istutorial#-->

In addition, make sure you:
- [set up a registry namespace](/docs/Registry?topic=Registry-registry_setup_cli_namespace#registry_namespace_setup)
- and [understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/).

<!--##istutorial#-->
## Create a Kubernetes cluster
{: #scalable-webapp-kubernetes-create_kube_cluster}
{: step}

{{site.data.keyword.containershort_notm}} delivers powerful tools by combining Docker and Kubernetes technologies, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

The major portion of this tutorial can be accomplished with a **Free** cluster. Two optional sections relating to Kubernetes Ingress and custom subdomain require a **Standard** cluster.

A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial.

- Create the Kubernetes cluster:
  - For Kubernetes on VPC infrastructure, you are required to create a VPC and subnet(s) prior to creating the Kubernetes cluster. You may follow the instructions provided under the [Creating a standard VPC Gen 2 compute cluster in the console](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_vpcg2_ui).
  - For Kubernetes on Classic infrastructure follow the [Creating a standard classic cluster](https://{DomainName}/docs/containers?topic=containers-clusters#clusters_standard) instructions.
{: #create_cluster}


<!--#/istutorial#-->

## Create a starter application
{: #scalable-webapp-kubernetes-create_application}
{: step}

The `ibmcloud dev` tooling greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

1. Start the `ibmcloud dev` wizard to create a new directory in the current working directory.
   ```
   ibmcloud dev create
   ```
   {: pre}

   You may be asked to target an organization and a space, follow the instructions on the CLI
   {:tip}
1. Select `Backend Service / Web App` > `Java - MicroProfile / JavaEE` > `Java Liberty App` to create a Java starter. (To create a Node.js starter instead, use `Backend Service / Web App` > `Node`> `Node.js Express App` )
1. Enter a **unique name** for your application such as `<your-initials>kubeapp`.
4. Select the **resource group** where your cluster has been created.
1. Do not add additional services.
1. Do not add a DevOps toolchain, select **manual deployment**.
1. Select **Helm-based** deployment target.

This generates a starter application complete with the code and all the necessary configuration files for local development and deployment to cloud on Cloud Foundry or Kubernetes.

![](images/solution2/Contents.png)

## Deploy application to cluster using helm chart
{: #scalable-webapp-kubernetes-deploy}
{: step}

In this section, you first push the Docker image to the IBM Cloud private container registry, and then create a Kubernetes deployment pointing to that image.

### Prepare the access to {{site.data.keyword.registryshort_notm}}
{: #scalable-webapp-kubernetes-7}

1. To identify your {{site.data.keyword.registryshort_notm}} URL, run
   ```sh
   ibmcloud cr region
   ```
   {:pre}
1. Define an variable named `MYREGISTRY` pointing to the URL such as:
   ```sh
   MYREGISTRY=us.icr.io
   ```
   {:pre}
1. Pick one of your existing registry namespaces or create a new one. To list existing namespaces, use:
   ```sh
   ibmcloud cr namespaces
   ```
   {:pre}
   Define an variable named `MYNAMESPACE` for the registry namespace:
   ```sh
   MYNAMESPACE=<REGISTRY_NAMESPACE>
   ```
   Create it if required:
   {:pre}
   ```sh
   ibmcloud cr namespace-add $MYNAMESPACE
   ```
   {:pre}

### Build the container image
{: #scalable-webapp-kubernetes-8}

1. Define an variable named `MYPROJECT` set with the name of the application you generated in the previous section:
   ```sh
   MYPROJECT=<your-initials>kubeapp
   ```
   {:pre}
1. Change to the directory of the generated project.
   ```
   cd $MYPROJECT
   ```
   {: pre}
1. Ensure your local Docker engine is started.
   ```
   docker ps
   ```
   {: pre}
1. Build, tag (`-t`) and push the docker image to your container registry on IBM Cloud
   ```sh
   ibmcloud cr build -t $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:v1.0.0 .
   ```
   {: pre}

### Deploy the application
{: #scalable-webapp-kubernetes-9}

1. Identify your cluster:

   ```bash
   ibmcloud ks cluster ls
   ```
   {:pre}
1. Initialize the variable with the cluster name

   ```bash
   MYCLUSTER=<CLUSTER_NAME>
   ```
   {:pre}
1. Initialize the `kubectl` cli environment

   ```bash
   ibmcloud ks cluster config --cluster $MYCLUSTER
   ```
   {:pre}
  For more information on gaining access to your cluster and to configure the CLI to run kubectl commands, check the [CLI configure](/docs/containers?topic=containers-cs_cli_install#cs_cli_configure) section
   {:tip}


[Helm](https://helm.sh/) helps you manage Kubernetes applications through Helm Charts, which helps define, install, and upgrade even the most complex Kubernetes application.

#### With Helm 3
{: #scalable-webapp-kubernetes-11}

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

#### With Helm 2
{: #scalable-webapp-kubernetes-10}

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

### View the application
{: #scalable-webapp-kubernetes-12}

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
   ibmcloud ks workers --cluster ${MYCLUSTER}
   ```
   {: pre}
1. For VPC the IP addresses of the clusters are private to the VPC. These will not be accessable from your desktop but can be accessed by opening the **Web Terminal** from the Kubernetes cluster console UI.  See [Using the Kubernetes web terminal in your web browser](https://{DomainName}/docs/containers?topic=containers-cs_cli_install#cli_web)
1. Access the application at `http://worker-ip-address:portnumber/`:
   ```sh
   curl http://<worker-ip-address>:<portnumber>
   ```
   {: pre}

## Use the IBM-provided domain for your cluster
{: #scalable-webapp-kubernetes-ibm_domain}
{: step}

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
     annotations:
       kubernetes.io/ingress.class: "public-iks-k8s-nginx"
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
             servicePort: 3000
   ```
   {: codeblock}
3. Deploy the Ingress
   ```sh
   kubectl apply -f ingress-ibmdomain.yml
   ```
   {: pre}
4. Open your application in a browser at `https://<nameofproject>.<ingress-sub-domain>/`

<!--##istutorial#-->
## Use your own custom subdomain
{: #scalable-webapp-kubernetes-custom_domain}
{: step}

This section requires you to own a custom domain. You will need to create a `CNAME` subdomain record pointing to the IBM <ingress-sub-domain> for the cluster.  If you domain is `example.com` then the subdomain will be `$MYPROJECT.example.com` or something like `abckubeapp.example.com` The 

### with HTTP
{: #scalable-webapp-kubernetes-15}

1. Create an Ingress file `ingress-customdomain-http.yml` pointing to your domain:
   ```yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress-for-customdomain-http
     annotations:
       kubernetes.io/ingress.class: "public-iks-k8s-nginx"
   spec:
     rules:
     - host: <my-custom-subdomain.com>
       http:
         paths:
         - path: /
           backend:
             serviceName: <service-name>
             servicePort: 3000
   ```
   {: codeblock}
2. Deploy the Ingress
   ```sh
   kubectl apply -f ingress-customdomain-http.yml
   ```
   {: pre}
3. Access your application at `http://<my-custom-subdomain.com>/`

### with HTTPS
{: #scalable-webapp-kubernetes-16}

If you were to try to access your application with HTTPS at this time `https://<my-custom-subdomain.com>/`, you will likely get a security warning from your web browser telling you the connection is not private. You would also get a 404 as the Ingress just configured would not know how to direct HTTPS traffic.

See [Managing TLS certificates and secrets](https://{DomainName}/docs/containers?topic=containers-ingress-types#manage_certs) for more information.  The basic steps are:
1. Navigate to the [resource list](https://{DomainName}/resources) and then open the {{site.data.keyword.cloudcerts_short}} created for the cluster.  The cluster ID displayed in the get command is in the name of the service instance:

   ```sh
   ibmcloud ks cluster get --cluster $MYCLUSTER
   ```
   {: pre}
1. Import the certificate for the $MYPROJECT subdomain and give it the bame $MYPROJECT, (.e.g abckubeapp.example.com) and certificate manager certificate name `abckubeapp`.  If you are already managing your certificate with the {{site.data.keyword.cloudcerts_short}} service you can download the certificate zip file, unzip it, then import into the cluster's {{site.data.keyword.cloudcerts_short}} instance.
1. Open the imported certificate in the cloud console and copy the Cerfificate CRN.  Create a TLS secret for the cert and the key, name the secret, <secret-name>, the same as the certificate name just imported (.e.g abckubeapp).
   ```sh
   SECRET_NAME=<certificate-name>
   CERT_CRN=<crn-of-the-certificate>
   DNS=<my-custom-subdomain.com>
   ```
   {: pre}
   ```sh
   ibmcloud ks ingress secret create --cluster $MYCLUSTER --name $SECRET_NAME --namespace default --cert-crn $CERT_CRN
   ```
   {: pre}
4. Create an Ingress file `ingress-customdomain-https.yml` pointing to your domain:
   ```yaml
   apiVersion: extensions/v1beta1
   kind: Ingress
   metadata:
     name: ingress-customdomain-https
     annotations:
       kubernetes.io/ingress.class: "public-iks-k8s-nginx"
   spec:
     tls:
     - hosts:
       - <my-custom-subdomain.com>
       secretName: <secret-name>
     rules:
     - host: <my-custom-subdomain.com>
       http:
         paths:
         - path: /
           backend:
             serviceName: <service-name>
             servicePort: 3000
   ```
   {: codeblock}
5. Deploy the Ingress:
   ```sh
   kubectl apply -f ingress-customdomain-https.yml
   ```
   {: pre}
6. Access your application at `https://<my-custom-subdomain.com>/`.
<!--#/istutorial#-->

## Monitor application health
{: #scalable-webapp-kubernetes-monitor_application}
{: step}

1. To check the health of your application, navigate to [clusters](https://{DomainName}/kubernetes/clusters) to see a list of clusters and click on your cluster.
2. Click **Kubernetes Dashboard** to launch the dashboard in a new tab.
3. Select **Nodes** on the left pane, click the **Name** of the nodes and see the **Allocation Resources** to see the health of your nodes.
4. To review the application logs from the container, select **Pods**, **pod-name**, click **View logs** in the action menu in the upper right
5. To exec into the container select **Exec into** in the action menu

## Scale Kubernetes pods
{: #scalable-webapp-kubernetes-scale_cluster}
{: step}

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

## Remove resources
{: #scalable-webapp-kubernetes-0}
{: step}

* Delete the resources applied:
   ```sh
   kubectl delete -f ingress-customdomain-https.yml
   kubectl delete -f ingress-customdomain-http.yml
   kubectl delete -f ingress-ibmdomain.yml
   ```
   {:pre}
* Delete the Kubernetes secret:
   ```sh
   ibmcloud ks ingress secret rm --cluster $MYCLUSTER --name $SECRET_NAME --namespace default
   ```
   {:pre}
* Delete the Kubernetes artifacts created for this application:
   ```sh
   helm delete ${MYPROJECT}
   ```
   {:pre}
<!--##istutorial#-->
* Delete the cluster.
<!--#/istutorial#-->

## Related content
{: #scalable-webapp-kubernetes-20}

* [{{site.data.keyword.containerlong_notm}}](https://{DomainName}/docs/containers)
* [Continuous Deployment to Kubernetes](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-continuous-deployment-to-kubernetes#continuous-deployment-to-kubernetes)
* [Scaling a deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment)
* [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
