---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-05-13"
lasttested: "2020-05-13"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Service Mesh on {{site.data.keyword.openshiftshort}}
{: #istio-openshift}

This tutorial walks you through how to install Service Mesh alongside microservices for a simple mock app called BookInfo in a [{{site.data.keyword.openshiftlong_notm}}](https://{DomainName}/kubernetes/catalog/openshiftcluster) cluster.
{:shortdesc}

Based on the open source Istio project, {{site.data.keyword.openshiftlong_notm}}  Service Mesh adds a transparent layer on existing distributed applications. {{site.data.keyword.openshiftlong_notm}} Service Mesh provides a platform for behavioral insight and operational control over your networked microservices in a service mesh. With {{site.data.keyword.openshiftlong_notm}} , you can connect, secure, and monitor microservices in your OpenShift Container Platform environment.

[Istio](https://www.ibm.com/cloud/info/istio) is an open platform to connect, secure, control and observe microservices, also known as a service mesh, on cloud platforms such as Kubernetes in OpenShift. With Istio, you can manage network traffic, load balance across microservices, enforce access policies, verify service identity, secure service communication and observe what exactly is going on with your services.

## Objectives
{: #objectives}

* Install {{site.data.keyword.openshiftlong_notm}} Service Mesh in your cluster
* Deploy the BookInfo sample app
* Use metrics, logging and tracing to observe services
* Set up the Istio Ingress Gateway
* Perform simple traffic management, such as A/B tests and canary deployments
* Secure your mesh using mTLS

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.openshiftlong_notm}}](https://{DomainName}/kubernetes/clusters?platformType=openshift)

<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}


<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/tutorials?topic=solution-tutorials-getting-started) guide.
<!--#/istutorial#-->

In addition, make sure you [set up a registry namespace](/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_namespace_setup).

<!--##istutorial#-->
## Create an {{site.data.keyword.openshiftshort}} cluster
{: #create_openshift_cluster}

With {{site.data.keyword.openshiftlong_notm}}, you have a fast and secure way to containerize and deploy enterprise workloads in {{site.data.keyword.openshiftshort}} clusters. {{site.data.keyword.openshiftshort}} clusters build on Kubernetes container orchestration that offers consistency and flexibility for your development lifecycle operations.

In this section, you will provision a {{site.data.keyword.openshiftlong_notm}} cluster with two worker nodes.

1. Create an {{site.data.keyword.openshiftshort}} cluster from the [{{site.data.keyword.Bluemix}} catalog](https://{DomainName}/kubernetes/catalog/create?platformType=openshift).
2. Set the **Orchestration service** to **the Latest,Default version of OpenShift**.
3. Select **Purchase additional licenses for this worker pool** as your OCP entitlement.
4. Under **Location**,
   - Select a **Resource group**
   - Select a **Geography**
   - Select **Single zone** as **Availability**
   - Choose a **Datacenter**
5. Under **Worker pools**,
   - Select **4 vCPUs 16GB Memory** as the flavor
   - Select **2** Worker nodes per data center for this tutorial and Leave **Encrypt local disk** On.
6. Review **Infrastructure permissions checker** to verify the required permissions
7. Under **Resource details**,Set **Cluster name** to **myopenshiftcluster**.
8. Click **Create** to provision an {{site.data.keyword.openshiftshort}} cluster.

### Access the cluster using the {{site.data.keyword.Bluemix_notm}} Shell

In this step, you'll configure `oc` to point to your newly created cluster. To easily connect to the cluster, you need the {{site.data.keyword.openshiftshort}} CLI `oc` that exposes commands for managing your applications, as well as lower level tools to interact with each component of your system.

To avoid installing the command line, the recommended approach is to use the IBM Cloud Shell.

{{site.data.keyword.Bluemix_notm}} Shell is a cloud-based shell workspace that you can access through your browser. It's preconfigured with the full {{site.data.keyword.Bluemix_notm}} CLI and tons of plug-ins and tools that you can use to manage apps, resources, and infrastructure.

1. When the cluster is ready, click on the **Access** tab under the cluster name and open the **{{site.data.keyword.openshiftshort}} web console**.
2. On the web console, from the dropdown menu in the upper right of the page, click **Copy Login Command**.
3. In a new browser tab/window, open the [{{site.data.keyword.Bluemix_notm}} Shell](https://{DomainName}/shell) to start a new session.Once the session starts, you should be automatically logged-in to the {{site.data.keyword.Bluemix_notm}} CLI.
4. Paste the login command you copied from the web console and hit Enter. Once logged-in using the `oc login` command, run the below command to see all the namespaces in your cluster
   ```sh
   oc get ns
   ```
   {:pre}

## Install Service Mesh - Istio
{: #install_istio}

In this section, you will install Service Mesh - Istio on the cluster. Installing the Service Mesh involves installing the Elasticsearch, Jaeger, Kiali and Service Mesh Operators, creating and managing a `ServiceMeshControlPlane` resource to deploy the control plane, and creating a `ServiceMeshMemberRoll` resource to specify the namespaces associated with the Service Mesh.

### Install the Operators

1. On the left pane of **OpenShift web console**, select **Administrator** in the drop down
2. Select **Operators** and then **OperatorHub**
3. Search for **Elasticsearch Operator**, click **Install** and then **Subscribe**
4. **Repeat** steps 2 and 3 for installing **Red Hat OpenShift Jaeger**, **Kiali Operator provided by Red Hat** and **Red Hat OpenShift Service Mesh** Operators.

### Deploying the Red Hat OpenShift Service Mesh control plane

The operator uses a `ServiceMeshControlPlane` resource to determine how to install Istio and what components you want. Let's create that resource now.

1.  Create a new project by going to **Home** on the left pane of the web console, click **Projects** and then **Create Project**
2.  Enter `istio-system` in the **Name** and click **Create**
3.  Navigate to **Operators** and click **Installed Operators**
4.  Click the **Red Hat OpenShift Service Mesh Operator**. If you don't see it, wait a couple of minutes and refresh.
5.  Under **Istio Service Mesh Control Plane** click **Create ServiceMeshControlPlane**.
6.  Then, click **Create**. The Operator creates Pods, services, and Service Mesh control plane components based on your configuration parameters.

### Create a ServiceMeshMemberRoll
ServiceMeshMemberRoll resource is used to to specify the namespaces associated with the Service Mesh.

1. Navigate to **Operators** → **Installed Operators** again.
2. Click the **Red Hat OpenShift Service Mesh Operator**.
3. In the tab area, scroll to the right to find **Istio Service Mesh Member Roll**
4. Click **Create ServiceMeshMemberRoll**
5. Change `your-project` to `bookinfo` and delete the last line.
6. Then, click **Create**.

## Remove resources
{:#cleanup}

* Delete all application resource objects:
   ```sh
   oc delete all --selector app=$MYPROJECT
   ```
   {:pre}
* Delete the project:
   ```sh
   oc delete project $MYPROJECT
   ```
   {:pre}
<!--##istutorial#-->
* Delete the cluster you created.
<!--#/istutorial#-->

## Related content

* [{{site.data.keyword.openshiftlong_notm}}](https://{DomainName}/docs/openshift?topic=openshift-why_openshift)
* [Horizontal Pod Autoscaling](https://docs.openshift.com/container-platform/4.3/nodes/pods/nodes-pods-autoscaling.html)
* [Secured routes](https://docs.openshift.com/container-platform/4.3/networking/routes/secured-routes.html)
