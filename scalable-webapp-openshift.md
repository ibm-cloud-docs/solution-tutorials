---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-07-22"
lasttested: "2019-07-22"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Scalable web application on OpenShift
{: #scalable-webapp-kubernetes}

This tutorial walks you through how to scaffold a web application, run it locally in a container, push the scaffolded code to a private repository and then deploy it to a standard Red Hat OpenShift on IBM Cloud cluster created with [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster). Additionally, you will learn how expose the app on an Openshift route, bind a custom domain, monitor the health of the environment, and scale the application.
{:shortdesc}

With the Red Hat OpenShift on IBM Cloud, you can create {{site.data.keyword.containerlong_notm}}clusters with worker nodes that come installed with the Red Hat OpenShift on IBM Cloud Container Platform orchestration software. You get all the [advantages of managed {{site.data.keyword.containerlong_notm}}](https://{DomainName}/docs/containers?topic=containers-responsibilities_iks&locale=en\043science) for your cluster infrastructure environment, while using the [OpenShift tooling and catalog](https://docs.openshift.com/container-platform/3.11/welcome/index.html) that runs on Red Hat Enterprise Linux for your app deployments.

For developers looking to kickstart their projects, the {{site.data.keyword.dev_cli_notm}} CLI enables rapid application development and deployment by generating template applications that you can run immediately or customize as the starter for your own solutions. In addition to generating starter application code, Docker container image and CloudFoundry assets, the code generators used by the dev CLI and web console generate files to aid deployment into [Kubernetes](https://kubernetes.io/) environments.

## Objectives
{: #objectives}

* Scaffold a starter application.
* Deploy the application to the Red Hat OpenShift on IBM Cloud cluster.
* Bind a custom domain.
* Monitor the logs and health of the cluster.
* Scale Openshift pods.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
* [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution2/Architecture.png)
</p>

1. A developer generates a starter application with {{site.data.keyword.dev_cli_notm}}.
1. Building the application produces a Docker container image.
1. The image is pushed to a namespace in {{site.data.keyword.containershort_notm}}.
1. The application is deployed to an Openshift cluster.
1. Users access the application.

## Before you begin
{: #prereqs}

* [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://{DomainName}/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_setup_cli_namespace)
* [Install {{site.data.keyword.dev_cli_notm}}](/docs/cli?topic=cloud-cli-install-ibmcloud-cli) - Script to install docker, kubectl, ibmcloud cli and required plug-ins like dev, ks, cr ...
* [Install the OpenShift Origin (oc) CLI](/docs/containers?topic=containers-cs_cli_install&locale=en\043science#cli_oc)
* [Understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

## Create an OpenShift cluster
{: #create_openshift_cluster}

{{site.data.keyword.containershort_notm}} delivers powerful tools by combining Docker containers, the Kubernetes technology, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

You will provision a **Standard** Red Hat OpenShift on IBM Cloud cluster as OpenShift worker nodes are available for paid accounts and standard clusters only.

1. Create an openshift cluster from the [{{site.data.keyword.Bluemix}} catalog](https://{DomainName}/kubernetes/catalog/cluster/create).
1. Under **Select a plan**,
    - Select a **Standard** cluster > Choose **OpenShift 3.11** as your cluster type and version.
    - Provide **myopenshiftcluster** as your cluster name > select a **resource group** name >  choose a **Geography**.
1. Under **Location**,
    - Select a **Single zone** followed by a **Worker zone**.
    - Select **Public endpoint only** as your Master service endpoint.
1. Under **Default worker pool**,
    - Select **4 Cores 16GB RAM** as the flavor for Worker nodes.
    - Select **2** Worker nodes for this tutorial.
1. Check **Infrastructure permissions checker** to verify the required permissions and Click **Create** to provision an openshift cluster.

### Configure CLI

In this step, you'll configure `oc` to point to your newly created cluster. The [OpenShift Container Platform CLI](https://docs.openshift.com/container-platform/3.11/cli_reference/get_started_cli.html) exposes commands for managing your applications, as well as lower level tools to interact with each component of your system. The CLI is available using the `oc` command.

1. When the cluster is ready, click on the **Access** tab under the cluster name.
1. Under **Gain access to your cluster** section, click on **oauth token request page** to follow instructions to log into your cluster on a terminal.
1. Once logged-in using the `oc login` command, run the below command to see all the namespaces in your cluster
    ```sh
    oc get ns
    ```
    {:pre}

## Generate a starter kit
{: #generate_starter_kit}
The `ibmcloud dev` tooling greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

### Using ibmcloud dev plugin

1. On a terminal, Start the `ibmcloud dev` wizard by running the below command
   ```
   ibmcloud dev create
   ```
   {: pre}

1. Select `Backend Service / Web App` > `Java - MicroProfile / JavaEE` > `Java Web App with Eclipse MicroProfile and Java EE` to create a Java starter. (To create a Node.js starter instead, use `Backend Service / Web App` > `Node`> `Node.js Web App with Express.js (Web App)` )
1. Enter a **name** for your application.
1. Select the **resource group** where to deploy this application.
1. Do not add additional services.
1. Do not add a DevOps toolchain, select **manual deployment**.

This generates a starter application complete with the code and all the necessary configuration files for local development and deployment to cloud on Cloud Foundry or Kubernetes service.

### Run the application locally

You can build and run the application as you normally would using `mvn` for java local development or `npm` for node development.  You can also build a docker image and run the application in a container to ensure consistent execution locally and on the cloud. Use the following steps to build your docker image.

1. Ensure your local Docker engine is started.
   ```
   docker ps
   ```
   {: pre}
2. Change to the directory of the generated project.
   ```
   cd <project name>
   ```
   {: pre}
3. Build the application.
   ```
   ibmcloud dev build
   ```
   {: pre}

   This might take a few minutes to run as all the application dependencies are downloaded and a Docker image, which contains your application and all the required environment, is built.

1. Run the container.
   ```
   ibmcloud dev run
   ```
   {: pre}

   This uses your local Docker engine to run the docker image that you built in the previous step.
1. After your container starts, go to `http://localhost:9080/`. If you created a Node.js application, go to `http://localhost:3000/`.
  ![](images/solution2/LibertyLocal.png)

### Push the code to a Private IBM Cloud Git repo
In this step, you will create a private IBM Cloud Git repository and push the generated code.

1. Create a [{{site.data.keyword.contdelivery_short}}](https://{DomainName}/catalog/services/continuous-delivery) service > provide a **Service name** > choose a **region/location** > select a **resource group** > select a **Lite** plan and click **Create**.
1. Once provisioned, click on **Manage** tab to authorize users and manage access to the toolchains.
1. Create an [empty toolchain](https://{DomainName}/devops/setup/deploy?repository=https%3A%2F%2Fgithub.com%2Fopen-toolchain%2Fempty-toolchain) with **openshift-toolchain** as the **Toolchain Name**.
1. Select a **region** preferably where you have created the cluster > select a **resource group**
1. Select **GitLab** as the source provider and click **Create**.
1. Once your toolchain is ready, click on **Add Tool**.
1. Select **Git Repos and Issue Tracking**
   - Select a **Server** and choose **New** as the repository type
   - Select a **Owner** and provide **openshiftapp** as the repository name
   - Leave the checkboxes checked and Click **Create Integration**
1. Click on **Git** tile under CODE to open your Git repository.
1. Follow the instructions under **Existing folder** section of project **Details** by pointing it to the local folder where you have created the starter kit using `ibmcloud dev`.
1. Once you push the code to the private repository, you should see the scaffolded code in the project.

## Create a new OpenShift application
### Generate a build configuration yaml file
### Update the BuildConfig and Push the builder image to ICR

## Deploy the application to cluster

### Create the app using the buildconfig yaml
### Access the app through IBM provided domain

### Update the app and redeploy

## Monitor the app

## Scale the app

![](images/solution2/Contents.png)


{: #deploy}

In this section, you first push the Docker image to the IBM Cloud private container registry, and then create a Kubernetes deployment pointing to that image.

1. Find your **namespace** by listing all the namespace in the registry.
   ```sh
   ibmcloud cr namespaces
   ```
   {: pre}
   If you have a namespace, make note of the name for use later. If you don't have one, create it.
   ```sh
   ibmcloud cr namespace-add <Name>
   ```
   {: pre}
2. Set MYNAMESPACE and MYPROJECT environment variables to your namespace and project name respectively

    ```sh
    export MYNAMESPACE=<NAMESPACE>
    ```
    {: pre}
    ```sh
    export MYPROJECT=<PROJECT_NAME>
    ```
    {: pre}
3. Log in the **Container Registry**:
   ```sh
   ibmcloud cr login
   ```
   {: pre}
3. Identify your **Container Registry** (e.g. us.icr.io) by running `ibmcloud cr info`
4. Set MYREGISTRY env var to your registry.
   ```sh
   export MYREGISTRY=<REGISTRY>
   ```
   {: pre}
5. Build and tag (`-t`)the docker image
   ```sh
   docker build . -t ${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}:v1.0.0
   ```
   {: pre}
6. Push the docker image to your container registry on IBM Cloud
   ```sh
   docker push ${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}:v1.0.0
   ```
   {: pre}
7. On an IDE, navigate to **values.yaml** under `chart\YOUR PROJECT NAME` and update the **image repository** value pointing to your image on IBM Cloud container registry. **Save** the file.

   For image repository details, run `echo ${MYREGISTRY}/${MYNAMESPACE}/${MYPROJECT}`

8. [Helm](https://helm.sh/) helps you manage Kubernetes applications through Helm Charts, which helps define, install, and upgrade even the most complex Kubernetes application. Navigate to `chart\YOUR PROJECT NAME`, then [follow steps 2) and 3) on how to configure tiller and initialize helm](https://{DomainName}/docs/containers?topic=containers-helm#public_helm_install).

9. To install a Helm chart, change to the `chart\YOUR PROJECT NAME` directory and run the below command
  ```sh
  helm install . --name ${MYPROJECT}
  ```
  {: pre}
10. Use `kubectl get service ${MYPROJECT}-service` for your Java application and `kubectl get service ${MYPROJECT}-application-service`  for your Node.js application to identify the public port the service is listening on. The port is a 5-digit number(e.g., 31569) under `PORT(S)`.
11. For the public IP of worker node, run the below command
   ```sh
   ibmcloud ks workers ${MYCLUSTER}
   ```
   {: pre}
12. Access the application at `http://worker-ip-address:portnumber/`.


{: #ibm_domain}

In the previous step, the application was accessed with a not standard port. The service was exposed by way of Kubernetes NodePort feature.

Paid clusters come with an IBM-provided domain. This gives you a better option to expose applications with a proper URL and on standard HTTP/S ports.

Use Ingress to set up the cluster inbound connection to the service.

![Ingress](images/solution2/Ingress.png)

1. Identify your IBM-provided **Ingress domain**
   ```
   ibmcloud ks cluster-get ${MYCLUSTER}
   ```
   {: pre}
   to find
   ```
   Ingress subdomain:	mycluster.us-south.containers.appdomain.cloud
   Ingress secret:		mycluster
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
1. Deploy the Ingress
   ```sh
   kubectl apply -f ingress-ibmdomain.yml
   ```
   {: pre}
1. Access your application at `https://<nameofproject>.<ingress-sub-domain>/`

## Use your own custom domain
{: #custom_domain}

To use your custom domain, you need to update your DNS records with either a CNAME record pointing to your IBM-provided domain or an A record pointing to the portable public IP address of the IBM-provided Ingress. Given a paid cluster comes with fixed IP addresses, an A record is a good option.

See [Using the Ingress controller with a custom domain](https://{DomainName}/docs/containers?topic=containers-ingress#ingress) for more information.

### with HTTP

1. Create an Ingress file `ingress-customdomain-http.yml` pointing to your domain:
   ```
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
   {: pre}
2. Deploy the Ingress
   ```sh
   kubectl apply -f ingress-customdomain-http.yml
   ```
   {: pre}
3. Access your application at `http://<customdomain>/`

### with HTTPS

If you were to try to access your application with HTTPS at this time `https://<customdomain>/`, you will likely get a security warning from your web browser telling you the connection is not private. You would also get a 404 as the Ingress just configured would not know how to direct HTTPS traffic.

1. Obtain a trusted SSL certificate for your domain. You'll need the certificate and the key:
  https://{DomainName}/docs/containers?topic=containers-ingress#public_inside_3
   You can use [Let's Encrypt](https://letsencrypt.org/) to generate trusted certificate.
2. Save the cert and the key in base64 ascii format files.
3. Create a TLS secret to store the cert and the key:
   ```
   kubectl create secret tls my-custom-domain-secret-name --cert=<custom-domain.cert> --key=<custom-domain.key>
   ```
   {: pre}
4. Create an Ingress file `ingress-customdomain-https.yml` pointing to your domain:
   ```
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
   {: pre}
5. Deploy the Ingress:
   ```
   kubectl apply -f ingress-customdomain-https.yml
   ```
   {: pre}
6. Access your application at `https://<customdomain>/`.


{: #monitor_application}

1. To check the health of your application, navigate to [clusters](https://{DomainName}/kubernetes/clusters) to see a list of clusters and click on the cluster you created above.
2. Click **Kubernetes Dashboard** to launch the dashboard in a new tab.
   ![](images/solution2/launch_kubernetes_dashboard.png)
3. Select **Nodes** on the left pane, click the **Name** of the nodes and see the **Allocation Resources** to see the health of your nodes.
   ![](images/solution2/KubernetesDashboard.png)
4. To review the application logs from the container, select **Pods**, **pod-name** and **Logs**.
5. To **ssh** into the container, identify your pod name from the previous step and run
   ```sh
   kubectl exec -it <pod-name> -- bash
   ```
   {: pre}


{: #scale_cluster}

As load increases on your application, you can manually increase the number of pod replicas in your deployment. Replicas are managed by a [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/). To scale the application to two replicas, run the following command:

   ```sh
 kubectl scale deployment <nameofproject>-deployment --replicas=2
   ```
   {: pre}

After a shortwhile, you will see two pods for your application in the Kubernetes dashboard (or with `kubectl get pods`). The Ingress controller in the cluster will handles the load balancing between the two replicas.

With Kubernetes, you can enable [horizontal pod autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) to automatically increase or decrease the number of instances of your apps based on CPU.

To create an autoscaler and to define your policy, run the below command
   ```sh
kubectl autoscale deployment <nameofproject>-deployment --cpu-percent=<percentage> --min=<min_value> --max=<max_value>
   ```
   {: pre}

Once the autoscaler is successfully created, you should see
`horizontalpodautoscaler.autoscaling/<nameofproject>-deployment autoscaled`

Refer [scaling apps](https://{DomainName}/docs/containers?topic=containers-app#app_scaling) for prerequisites and additional info.

## Remove resources

* Delete the cluster or only delete the Kubernetes artifacts created for the application if you plan to reuse the cluster.

## Related content

* [IBM Cloud Kubernetes Service](https://{DomainName}/docs/containers?topic=containers-container_index#container_index)
<!-- * [IBM Cloud App Service](https://{DomainName}/docs/cloudnative/index.html#web-mobile) -->
* [Continuous Deployment to Kubernetes](https://{DomainName}/docs/tutorials?topic=solution-tutorials-continuous-deployment-to-kubernetes#continuous-deployment-to-kubernetes)
* [Scaling a deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment)
* [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
