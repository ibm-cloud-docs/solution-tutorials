---
subcollection: solution-tutorials
copyright:
  years: 2024
lastupdated: "2024-06-21"
lasttested: "2024-06-10"

content-type: tutorial
services: containers, Registry, secrets-manager
account-plan: paid
completion-time: 2h
use-case: ApplicationModernization, Cybersecurity, Containers
---
{{site.data.keyword.attribute-definition-list}}


# Scalable web application on Kubernetes
{: #scalable-webapp-kubernetes}
{: toc-content-type="tutorial"}
{: toc-services="containers, Registry, secrets-manager"}
{: toc-completion-time="2h"}

This tutorial may incur costs. Use the [Cost Estimator](/estimator) to generate a cost estimate based on your projected usage.
{: tip}


This tutorial walks you through how to run a web application locally in a container, and then deploy it to a Kubernetes cluster created with [{{site.data.keyword.containershort_notm}}](/kubernetes/catalog/about). As an optional step you can build a container image and push the image to a private registry. Additionally, you will learn how to bind a custom subdomain, monitor the health of the environment, and scale the application.
{: shortdesc}

Containers are a standard way to package apps and all their dependencies so that you can seamlessly move the apps between environments. Unlike virtual machines, containers do not bundle the operating system. Only the app code, run time, system tools, libraries, and settings are packaged inside containers. Containers are more lightweight, portable, and efficient than virtual machines.

## Objectives
{: #scalable-webapp-kubernetes-objectives}

* Deploy a web application to the Kubernetes cluster.
* Bind a custom subdomain.
* Monitor the logs and health of the cluster.
* Scale Kubernetes pods.

![Architecture](images/solution2/Architecture.svg){: caption="Architecture diagram" caption-side="bottom" class="center" }
{: style="text-align: center;"}

1. A developer downloads or clones a sample web application.
1. Optionally build the application to produce a container image.
1. Optionally the image is pushed to a namespace in the {{site.data.keyword.registrylong_notm}}.
1. The application is deployed to a Kubernetes cluster.
1. Users access the application.

## Before you begin
{: #scalable-webapp-kubernetes-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
* `kubectl` to interact with Kubernetes clusters,
* `Helm 3` to deploy charts.

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](/shell) from the {{site.data.keyword.cloud_notm}} console.
{: tip}

In addition:
- You will need a {{site.data.keyword.secrets-manager_short}} instance. With {{site.data.keyword.secrets-manager_short}}, you can create, lease, and centrally manage secrets that are used in IBM Cloud services or your custom-built applications. Secrets are stored in a dedicated {{site.data.keyword.secrets-manager_short}} instance and you can use built in features to monitor for expiration, schedule or manually rotate your secrets. In this tutorial, you will use a Kubernetes Operator to retrieve a TLS certificate from {{site.data.keyword.secrets-manager_short}} and inject into a Kubernetes secret. You can use an existing instance if you already have one or create a new one by following the steps outlined in [Creating a {{site.data.keyword.secrets-manager_short}} service instance](/docs/secrets-manager?topic=secrets-manager-create-instance&interface=ui).
- Optionally [set up a registry namespace](/docs/Registry?topic=Registry-registry_setup_cli_namespace#registry_namespace_setup). It is only needed if you will build your own custom container image.
- [Understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/){: external}.

## Enable service-to-service communication with {{site.data.keyword.secrets-manager_short}}
{: #secrets-mgr_setup_s2s} 
{: step}

Integrating {{site.data.keyword.secrets-manager_short}} with your {{site.data.keyword.containerlong_notm}} cluster requires service-to-service communication authorization. Follow these steps to set up the authorization. For more information, see [Integrations for {{site.data.keyword.secrets-manager_short}}](/docs/secrets-manager?topic=secrets-manager-integrations#create-authorization).

1. In the {{site.data.keyword.cloud_notm}} console, click **Manage > Access (IAM)**.
2. Click **Authorizations**.
3. Click **Create**.
4. In the **Source service** list, select **Kubernetes Service**.
5. Select the option to scope the access to **All resources**.
6. In the **Target service** list, select **{{site.data.keyword.secrets-manager_short}}**.
7. Select the option to scope the access to **All resources**.
8. In the **Service access** section, check the **Manager** option.
9. Click **Authorize**.

## Create a Kubernetes cluster
{: #scalable-webapp-kubernetes-create_kube_cluster}
{: step}

The {{site.data.keyword.containerlong_notm}} is a managed offering to create your own Kubernetes cluster of compute hosts to deploy and manage containerized apps on IBM Cloud. A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial.

1. Open the [Kubernetes clusters](/kubernetes/clusters) and click **Create cluster**. 

2. Create a cluster on your choice of **Infrastructure**. 
   - The following steps are if you select **VPC** for Kubernetes on VPC infrastructure. You are required to create a VPC and subnet(s) before creating the Kubernetes cluster. Reference the [Creating VPC clusters](/docs/containers?topic=containers-cluster-create-vpc-gen2&interface=ui) documentation for more details.
      1. Click **Create VPC**.
      2. Under the **Location** section, select a **Geography** and **Region**, for example `Europe` and `London`.
      3. Enter a **Name** of your VPC, select a **Resource group** and optionally, add **Tags** to organize your resources.
      4. Uncheck **Allow SSH** and **Allow ping** from the **Default security group**.
      5. Uncheck **Create subnet in every zone**.
      5. Click on **Create**.
      6. Under **Worker zones and subnets**, uncheck the two zones for which the subnet wasn't created.
      7. Set the **Worker nodes per zone** to `1` and click on **Change flavor** to explore and change to the worker node size of your choice.
      8. Under **Ingress**, enable **Ingress secrets management** and select your existing {{site.data.keyword.secrets-manager_short}} instance.
      8. Enter a **Cluster name** and select the same **Resource group** that you used for the VPC.
      9. Logging or Monitoring aren't required in this tutorial, disable those options and click on **Create**.
      10. While you waiting for the cluster to become active, attach a public gateway to the VPC. Navigate to the [Virtual private clouds](/vpc-ext/network/vpcs).
      11. Click on the name for the VPC used by the cluster and scroll down to subnets section.
      13. Click on the name of the subnet created earlier and in the **Public Gateway** section, click on **Detached** to change the state to **Attached**.

   - The following steps are if you select **Classic** for Kubernetes on Classic infrastructure. Reference the [Creating a standard classic cluster](/docs/containers?topic=containers-cluster-create-classic&interface=ui) documentation for more details.
      1. Under the **Location** section, select a **Geography**, multizone **Availability**, and **Metro** for example `Europe` and `London`.
      2. Under **Worker zones and VLANs**, uncheck all zones except for one.
      3. Set the **Worker nodes per zone** to `1` and click on **Change flavor** to explore and change to the worker node size of your choice.
      4. Under **Master service endpoint**, select **Both private & public endpoints**.
      5. Under **Ingress**, enable **Ingress secrets management** and select your existing {{site.data.keyword.secrets-manager_short}} instance.
      6. Enter a **Cluster name** and select the **Resource group** to create these resources under.
      7. Logging or Monitoring aren't required in this tutorial, disable those options and click on **Create**.


## Clone a sample application
{: #scalable-webapp-kubernetes-clone_application}
{: step}

In this section, you will clone a GitHub repo with a simple Helm-based [NodeJS](https://nodejs.org/){: external} sample application with a landing page and two endpoints to get started. You can always extend the sample application based on your requirements.

1. On a terminal, run the below command to clone the [GitHub repository](https://github.com/IBM-Cloud/kubernetes-node-app/){: external}:
   ```sh
   git clone https://github.com/IBM-Cloud/kubernetes-node-app
   ```
   {: pre}

2. Change to the application directory:
   ```sh
   cd kubernetes-node-app
   ```
   {: pre}

This sample application code contains all the necessary configuration files for local development and deployment to Kubernetes.

## Deploy application to cluster using helm chart
{: #scalable-webapp-kubernetes-deploy}
{: step}

### Deploy the application with Helm 3
{: #scalable-webapp-kubernetes-9}

The container image for the application as already been built and pushed to a public registry in the {{site.data.keyword.registryfull_notm}}. In this section you will deploy the sample application using [Helm](https://helm.sh/){: external}. Helm helps you manage Kubernetes applications through Helm Charts, which helps define, install, and upgrade even the most complex Kubernetes application.

Note: If you want to build and push the application to your own container registry you can use the Docker CLI to do so. The Dockerfile is provided in the repository and images can be pushed to the {{site.data.keyword.registryfull_notm}} or any other container registry.  
{: tip}


1. Define an environment variable named `MYAPP` and set the name of the application by replacing the placeholder with your initials:
   ```sh
   export MYAPP=<your-initials>kubenodeapp
   ```
   {: pre}

1. Identify your cluster:

   ```bash
   ibmcloud ks cluster ls
   ```
   {: pre}

1. Initialize the variable with the cluster name:

   ```bash
   export MYCLUSTER=<CLUSTER_NAME>
   ```
   {: pre}

1. Initialize the `kubectl` cli environment:

   ```bash
   ibmcloud ks cluster config --cluster $MYCLUSTER
   ```
   {: pre}
   
   Make sure the CLI is configured for the region and resource group where your created your cluster using `ibmcloud target -r <region> -g <resource_group>`. For more information on gaining access to your cluster and to configure the CLI to run kubectl commands, check the [CLI configure](/docs/containers?topic=containers-access_cluster) section
   {: tip}

1. You can either use the `default` Kubernetes namespace or create a new namespace for this application. 
   1. If you want to use the `default` Kubernetes namespace, run the below command to set an environment variable:
      ```sh
      export KUBERNETES_NAMESPACE=default
      ```
      {: pre}

   2. If you want to create a new Kubernetes namespace, follow the steps mentioned under [Copying an existing image pull secret](/docs/containers?topic=containers-registry#copy_imagePullSecret) and [Storing the image pull secret in the Kubernetes service account for the selected namespace](/docs/containers?topic=containers-registry#store_imagePullSecret) sections of the Kubernetes service documentation. Once completed, run the below command: 
      ```sh
      export KUBERNETES_NAMESPACE=<KUBERNETES_NAMESPACE_NAME>
      ```
      {: pre}

1. Change to the chart directory under your sample application directory:
   ```sh
   cd chart/kubernetesnodeapp
   ```
   {: pre}

1. Install the Helm chart:
   ```sh
   helm install $MYAPP --namespace $KUBERNETES_NAMESPACE . --set image.repository=icr.io/solution-tutorials/tutorial-scalable-webapp-kubernetes
   ```
   {: pre}

1. Change back to the sample application directory:
   ```sh
   cd ../..
   ```
   {: pre}

### View the application
{: #scalable-webapp-kubernetes-12}

1. List the Kubernetes services in the namespace:
   ```sh
   kubectl get services -n $KUBERNETES_NAMESPACE
   ```
   {: pre}

1. List the Kubernetes pods in the namespace:
   ```sh
   kubectl get pods -n $KUBERNETES_NAMESPACE
   ```
   {: pre}

## Use the IBM-provided domain for your cluster
{: #scalable-webapp-kubernetes-ibm_domain}
{: step}

Clusters come with an IBM-provided domain. This gives you a better option to expose applications with a proper URL and on standard HTTP/S ports.

Use Ingress to set up the cluster inbound connection to the service.

![Ingress](images/solution2/Ingress.png){: caption="Ingress" caption-side="bottom"}
{: style="text-align: center;"}

1. Identify your IBM-provided **Ingress subdomain** and **Ingress secret**:
   ```sh
   ibmcloud ks cluster get --cluster $MYCLUSTER
   ```
   {: pre}

   to find
   ```yaml
   Ingress subdomain: mycluster.us-south.containers.appdomain.cloud
   Ingress secret:    mycluster
   ```
   {: screen}

2. Define environment variable `INGRESS_SUBDOMAIN` to hold the value of the Ingress subdomain:
   ```sh
   export INGRESS_SUBDOMAIN=<INGRESS_SUBDOMAIN>
   ```
   {: pre}

3. Define environment variable `INGRESS_SECRET` to hold the value of the Ingress secret:
   ```sh
   export INGRESS_SECRET=<INGRESS_SECRET>
   ```
   {: pre}

4. In the sample application directory run the below bash command to create an Ingress file `ingress-ibmsubdomain.yaml` pointing to the IBM-provided domain with support for HTTP and HTTPS: 

   ```sh
   ./ingress.sh ibmsubdomain_https
   ```
   {: pre}

   The file is generated from a template file `ingress-ibmsubdomain-template.yaml` under yaml-templates folder by replacing all the values wrapped in the placeholders (`$`) with the appropriate values from the environment variables.
5. Deploy the Ingress:
   ```sh
   kubectl apply -f ingress-ibmsubdomain.yaml
   ```
   {: pre}

6. Open your application in a browser at `https://<myapp>.<ingress-subdomain>/` or run the below command to see the HTTP output:
   ```sh
   curl -I https://$MYAPP.$INGRESS_SUBDOMAIN
   ```
   {: pre}

## Use your own custom subdomain
{: #scalable-webapp-kubernetes-custom_domain}
{: step}

This section requires you to own a custom domain. You will need to create a `CNAME` record pointing to the IBM-provided ingress subdomain for the cluster. If your domain is `example.com` then the CNAME will be `<myapp>.<example.com>` pointing to `<myapp>.<ingress-subdomain>`.

### with HTTP
{: #scalable-webapp-kubernetes-15}

1. Create an environment variable pointing to your custom domain:
   ```sh
   export CUSTOM_DOMAIN=<example.com>
   ```
   {: pre}

1. Create an Ingress file `ingress-customdomain-http.yaml` pointing to your domain from the template file `ingress-customdomain-http-template.yaml`:
   ```sh
   ./ingress.sh customdomain_http
   ```
   {: pre}

1. Deploy the Ingress:
   ```sh
   kubectl apply -f ingress-customdomain-http.yaml
   ```
   {: pre}

1. Access your application at `http://<myapp>.<example.com>/`.

### with HTTPS
{: #scalable-webapp-kubernetes-16}

If you were to try to access your application with HTTPS at this time `https://<myapp>.example.com/`, you will likely get a security warning from your web browser telling you the connection is not private.

Now, import your certificate into the {{site.data.keyword.secrets-manager_short}} instance you configured earlier to your cluster.

1. Access the {{site.data.keyword.secrets-manager_short}} service instance from the [Resource List](/resources) Under **Security**.
2. Click on **Secrets** in the left navigation.
3. Click **Add**.
4. You can select either **Public certificate**, **Imported certificate** or **Private certificate**. Detailed steps are available in the respective documentation topics: [Ordering SSL/TLS public certificates](/docs/secrets-manager?topic=secrets-manager-public-certificates&interface=ui), [Importing SSL/TLS certificates](/docs/secrets-manager?topic=secrets-manager-certificates&interface=ui) or [Creating SSL/TLS private certificates](/docs/secrets-manager?topic=secrets-manager-private-certificates&interface=ui). If you selected to import a certificate, make sure to upload the certificate, private key and intermediate certificate files.
5. Locate the entry for the imported or ordered certificate and click on it.
   * Verify the domain name matches your $CUSTOM_DOMAIN. If you uploaded a wildcard certificate, an asterisk is included in the domain name.
   * Click the **copy** icon next to the certificate's **CRN**.
   * Create an environment variable pointing to the value you just copied:

   ```sh
   export CERTIFICATE_CRN=<certificate CRN>
   ```
   {: pre}

6. Create an Ingress secret in your cluster for the SSL/TLS certificate:
   ```sh
   ibmcloud ks ingress secret create --name nodeapp-tls-cert --cluster $MYCLUSTER --cert-crn $CERTIFICATE_CRN --namespace $KUBERNETES_NAMESPACE
   ```
   {: pre}

7. Create an environment variable pointing to your custom domain:
   ```sh
   export CUSTOM_DOMAIN=<example.com>
   ```
   {: pre}


8. Create an Ingress file `ingress-customdomain-https.yaml` pointing to your domain from the template `ingress-customdomain-https-template-sm.yaml`:
   ```sh
   ./ingress.sh customdomain_https_sm
   ```
   {: pre}

9. Deploy the Ingress:
   ```sh
   kubectl apply -f ingress-customdomain-https.yaml
   ```
   {: pre}

10. Access your application at `https://$MYAPP.$CUSTOM_DOMAIN/`.
   ```sh
   curl -I https://$MYAPP.$CUSTOM_DOMAIN
   ```
   {: pre}


## Monitor application health
{: #scalable-webapp-kubernetes-monitor_application}
{: step}

1. To check the health of your application, navigate to [clusters](/kubernetes/clusters) to see a list of clusters and click on your cluster.
2. Click **Kubernetes Dashboard** to launch the dashboard in a new tab.
3. Click  **Pods** on the left then click a **pod-name** matching $MYAPP
   - Examine he CPU and Memory usage.
   - Note the node IP name.
   - Click **View logs** in the action menu in the upper right to see the standard output and error of the application.
4. Select **Nodes** on the left pane, click the **Name** of a node noted earlier and see the **Allocation Resources** to see the health of your nodes.
5. To exec into the container select **Exec into** in the action menu

## Scale Kubernetes pods
{: #scalable-webapp-kubernetes-scale_cluster}
{: step}

As load increases on your application, you can manually increase the number of pod replicas in your deployment. Replicas are managed by a [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/){: external}. To scale the application to two replicas, run the following command:

```sh
kubectl scale deployment kubernetesnodeapp-deployment --replicas=2
```
{: pre}

After a short while, you will see two pods for your application in the Kubernetes dashboard (or with `kubectl get pods`). The Ingress controller in the cluster will handle the load balancing between the two replicas.

With Kubernetes, you can enable [horizontal pod autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/){: external} to automatically increase or decrease the number of instances of your apps based on CPU.

To create an autoscaler and to define your policy, run the below command
```sh
kubectl autoscale deployment kubernetesnodeapp-deployment --cpu-percent=5 --min=1 --max=5
```
{: pre}

Once the autoscaler is successfully created, you should see
`horizontalpodautoscaler.autoscaling/<deployment-name> autoscaled`.

## Remove resources
{: #scalable-webapp-kubernetes-0}
{: step}

* Delete the horizontal pod autoscaler:
   ```sh
   kubectl delete horizontalpodautoscaler.autoscaling/kubernetesnodeapp-deployment
   ```
   {: pre}

* Delete the resources applied:
   ```sh
   kubectl delete -f ingress-customdomain-https.yaml
   kubectl delete -f ingress-customdomain-http.yaml
   kubectl delete -f ingress-ibmsubdomain.yaml
   ```
   {: pre}

* Delete the Kubernetes artifacts created for this application:
   ```sh
   helm uninstall $MYAPP --namespace $KUBERNETES_NAMESPACE
   ```
   {: pre}

* Delete the Kubernetes secret:
   ```sh
   kubectl -n $KUBERNETES_NAMESPACE delete secret kubernetesnodeapp-api-key 
   ```
   {: pre}

* Delete the External Secrets Operator:
   ```sh
   helm uninstall external-secrets
   ```
   {: pre}

* Delete the service ID:

   ```sh
   ibmcloud iam service-id-delete $SERVICE_ID
   ```
   {: pre}

* Delete the cluster.

## Related content
{: #scalable-webapp-kubernetes-20}

* [{{site.data.keyword.containerlong_notm}}](/docs/containers)
* [Continuous Deployment to Kubernetes](/docs/ContinuousDelivery?topic=ContinuousDelivery-tutorial-cd-kubernetes)
* [Scaling a deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment){: external}
* [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/){: external}
