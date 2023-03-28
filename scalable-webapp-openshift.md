---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-03-28"
lasttested: "2023-02-24"

content-type: tutorial
services: openshift, containers, Registry
account-plan: paid
completion-time: 2h
---
{{site.data.keyword.attribute-definition-list}}


# Scalable web application on {{site.data.keyword.openshiftshort}}
{: #scalable-webapp-openshift}
{: toc-content-type="tutorial"}
{: toc-services="openshift, containers, Registry"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through how to deploy an application to a [{{site.data.keyword.openshiftlong_notm}}](/kubernetes/catalog/openshiftcluster) cluster from a remote Git repository, expose the app on an {{site.data.keyword.openshiftshort}} route, monitor the health of the environment, and scale the application. Additionally, you will learn how to use a private container registry, deploy an application from a private Git repository and bind a custom domain to your application.
{: shortdesc}

With {{site.data.keyword.openshiftlong_notm}}, you can create {{site.data.keyword.containerlong_notm}} clusters with worker nodes that come installed with the {{site.data.keyword.openshiftlong_notm}} Container Platform orchestration software. You get all the [advantages of managed {{site.data.keyword.containerlong_notm}}](/docs/containers?topic=containers-responsibilities_iks) for your cluster infrastructure environment, while using the [{{site.data.keyword.openshiftshort}} tooling and catalog](https://docs.openshift.com/container-platform/4.12/welcome/index.html){: external} that runs on Red Hat Enterprise Linux for your app deployments.

## Objectives
{: #scalable-webapp-openshift-objectives}

* Deploy a web application to the {{site.data.keyword.openshiftlong_notm}} cluster.<!-- markdownlint-disable-line -->
<!--##istutorial#-->
* Bind a custom domain.<!-- markdownlint-disable-line -->
<!--#/istutorial#-->
* Monitor the logs and health of the cluster.
* Scale {{site.data.keyword.openshiftshort}} pods.


![Architecture](images/solution50-scalable-webapp-openshift/Architecture.png){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}


1. The developer deploys a web application using the code from a remote Git repository. Optionally, the dev can also push the code to a private Git repository on {{site.data.keyword.Bluemix_notm}}.
2. A Docker container image is build from the code.
3. The image can pushed be pushed to a local container registry that comes with the cluster or to a namespace in {{site.data.keyword.registrylong_notm}}.
4. The application is deployed to an {{site.data.keyword.openshiftshort}} cluster by pulling the image.
5. Users access the application.

<!--##istutorial#-->
## Before you begin
{: #scalable-webapp-openshift-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * (optional) {{site.data.keyword.registryshort_notm}} plugin (`container-registry`)
* Docker engine,
* `oc` to interact with {{site.data.keyword.openshiftshort}},
* `git` to clone source code repository,
* (optional) {{site.data.keyword.cloud_notm}} GitLab configured with your **SSH key**.Check the instructions under the `Generate an SSH key pair` and `Add an SSH key to your GitLab account` sections of the [documentation here](https://us-south.git.cloud.ibm.com/help/ssh/README)

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools, you can use the [{{site.data.keyword.cloud-shell_short}}](/shell) from the {{site.data.keyword.cloud_notm}} console. Use `oc version` to ensure the version of the {{site.data.keyword.openshiftshort}} CLI matches your cluster version (`4.12.x`). If they do not match, install the matching version by following [these instructions](/docs/solution-tutorials?topic=solution-tutorials-tutorials#getting-started-cloud-shell).
{: note}

In addition, make sure you [set up a registry namespace](/docs/Registry?topic=Registry-registry_setup_cli_namespace#registry_namespace_setup).
<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Before you begin
{: #scalable-webapp-openshift-prereqs-workshop}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} GitLab configured with your **SSH key**. Check the instructions under the `Generate an SSH key pair` and `Add an SSH key to your GitLab account` sections of the [documentation here](https://us-south.git.cloud.ibm.com/help/ssh/README)

## Start a new {{site.data.keyword.cloud-shell_notm}}
{: #scalable-webapp-openshift-2}
{: step}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, select the account where you have been invited.
1. Click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](/shell).
-->
<!--#/isworkshop#-->

<!--##istutorial#-->
<!--This section is identical in all openshift tutorials, copy/paste any changes-->
## Create an {{site.data.keyword.openshiftshort}} cluster
{: #scalable-webapp-openshift-create_openshift_cluster}
{: step}

With {{site.data.keyword.openshiftlong_notm}}, you have a fast and secure way to containerize and deploy enterprise workloads in {{site.data.keyword.openshiftshort}} clusters. {{site.data.keyword.openshiftshort}} clusters build on Kubernetes container orchestration that offers consistency and flexibility for your development lifecycle operations.

In this section, you will provision a {{site.data.keyword.openshiftlong_notm}} cluster in one (1) zone with two (2) worker nodes:

1. Create an {{site.data.keyword.openshiftshort}} cluster from the [{{site.data.keyword.Bluemix}} catalog](/kubernetes/catalog/create?platformType=openshift).
2. Set the **Orchestration service** to **4.12.x version of {{site.data.keyword.openshiftshort}}**.
3. Select your OCP entitlement.
4. Under **Infrastructure** choose Classic or VPC,
   - For {{site.data.keyword.openshiftshort}} on VPC infrastructure, you are required to create a VPC and one subnet prior to creating the Kubernetes cluster.  Create or inspect a desired VPC keeping in mind the following (see instructions provided under the [Creating a standard VPC cluster](/docs/openshift?topic=openshift-clusters#clusters_vpcg2)):
      - One subnet that can be used for this tutorial, take note of the subnet's zone and name.
      - Public gateway is attached to the subnet.
   - Select the desired VPC.
   - Select an existing **Cloud Object Storage** service or create one if required and then select.
5. Under **Location**,
   - For {{site.data.keyword.openshiftshort}} on VPC infrastructure
      - Select a **Resource group**.
      - Uncheck the inapplicable zones.
      - In the desired zone verify the desired subnet name and if not present click the edit pencil to select the desired subnet name
   - For {{site.data.keyword.openshiftshort}} on Classic infrastructure follow the [Creating a standard classic cluster](/docs/openshift?topic=openshift-clusters#clusters_standard) instructions:
      - Select a **Resource group**.
      - Select a **Geography**.
      - Select **Single zone** as **Availability**.
      - Choose a **Datacenter**.
6. Under **Worker pool**,
   - Select **4 vCPUs 16GB Memory** as the flavor.
   - Select **2** Worker nodes per data center for this tutorial (classic only: Leave **Encrypt local disk**).
7. Under **Resource details**,Set **Cluster name** to **myopenshiftcluster**.
8. Click **Create** to provision an {{site.data.keyword.openshiftshort}} cluster.

Take a note of the resource group selected above.  This same resource group will be used for all resources in this lab.
{: note}

### Configure CLI
{: #scalable-webapp-openshift-4}

In this step, you'll configure `oc` to point to your newly created cluster. The [{{site.data.keyword.openshiftshort}} Container Platform CLI](https://docs.openshift.com/container-platform/4.12/cli_reference/openshift_cli/getting-started-cli.html){: external} exposes commands for managing your applications, as well as lower level tools to interact with each component of your system. The CLI is available using the `oc` command.

1. When the cluster is ready, click on **{{site.data.keyword.openshiftshort}} web console** to open the console.
2. On the web console, from the dropdown menu in the upper right of the page, click **Copy Login Command** and then click the **Display Token** link.
3. **Copy** the text under Log in with this token.
4. Once logged-in using the `oc login` command, run the below command to see all the namespaces in your cluster
   ```sh
   oc get ns
   ```
   {: pre}

<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Configure the access to your cluster
{: #scalable-webapp-openshift-access-cluster}
{: step}

In this step, you'll configure `oc` to point to the cluster assigned to you. The [{{site.data.keyword.openshiftshort}} Container Platform CLI](https://docs.openshift.com/container-platform/4.12/cli_reference/openshift_cli/getting-started-cli.html){: external} exposes commands for managing your applications, as well as lower level tools to interact with each component of your system. The CLI is available using the `oc` command.

1. Check the version of the {{site.data.keyword.openshiftshort}} CLI:
   ```sh
   oc version
   ```
   {: pre}

1. If the version does not match your cluster version, install the matching version by following [these instructions](/docs/solution-tutorials?topic=solution-tutorials-tutorials#getting-started-common_shell).
1. Navigate to your cluster from the [cluster list](/kubernetes/clusters?platformType=openshift) and click on the **Access** tab under the cluster name.
1. Open the **{{site.data.keyword.openshiftshort}} web console**.
1. From the dropdown menu in the upper right of the page, click **Copy Login Command**. Paste the copied command in your local terminal.
1. Once logged-in using the `oc login` command, run the below command to see all the namespaces in your cluster
   ```sh
   oc get ns
   ```
   {: pre}

-->
<!--#/isworkshop#-->

## Create a new {{site.data.keyword.openshiftshort}} application
{: #scalable-webapp-openshift-create_openshift_app}
{: step}

In this section, you will create an {{site.data.keyword.openshiftshort}} project and then deploy an application to {{site.data.keyword.openshiftshort}} from a [GitHub repository](https://github.com/IBM-Cloud/openshift-node-app/). The code sample is a simple [NodeJS](https://nodejs.dev){: external} sample application with a landing page and two endpoints to get started. You can always extend the sample application based on your requirement.

### Create an {{site.data.keyword.openshiftshort}} project
{: #scalable-webapp-openshift-create-project}

A Kubernetes namespace provides a mechanism to scope resources in a cluster. In {{site.data.keyword.openshiftshort}}, a project is a Kubernetes namespace with additional annotations.

1. Define an environment variable named `MYPROJECT` and set the application name by replacing `<your-initials>` with your own initials :
   ```sh
   export MYPROJECT=<your-initials>-openshiftapp
   ```
   {: pre}

2. Create a new {{site.data.keyword.openshiftshort}} project
   ```sh
   oc new-project $MYPROJECT
   ```
   {: pre}

### Deploy an application to {{site.data.keyword.openshiftshort}}
{: #scalable-webapp-openshift-deploy-app}

With the `oc new-app` command you can create applications from source code in a local or remote Git repository.

1. Create an application using the `docker` build strategy to build a container image from a Dockerfile in the repo. _You are setting the application name to the project name for simplicity._
   ```sh
   oc new-app https://github.com/IBM-Cloud/openshift-node-app --name=$MYPROJECT --strategy=docker --as-deployment-config
   ```
   {: pre}

   If a Jenkins file exists in the root or specified context directory of the source repository when creating a new application, {{site.data.keyword.openshiftshort}} generates a `pipeline` build strategy. Otherwise, it generates a `source` build strategy.You can always override the build strategy by setting the `--strategy` flag.
   {: tip}

2. To check the builder container image creation and pushing to the Internal {{site.data.keyword.openshiftshort}} Container Registry (OCR), run the below command
   ```sh
   oc logs -f buildconfig/$MYPROJECT
   ```
   {: pre}

   Your cluster is set up with the internal {{site.data.keyword.openshiftshort}} Container Registry so that {{site.data.keyword.openshiftshort}} can automatically build, deploy, and manage your application lifecycle from within the cluster. 
   {: tip}

3. Wait till the build is successful and the image is pushed. You can check the status of deployment and service using
   ```sh
   oc status
   ```
   {: pre}

### Access the app through IBM provided domain
{: #scalable-webapp-openshift-16}

To access the app, you need to create a route. A route announces your service to the world.

1. Create a route by running the below command in a terminal
   ```sh
   oc expose service/$MYPROJECT
   ```
   {: pre}

2. You can access the app through IBM provided domain. Run the below command for the URL
   ```sh
   oc get route/$MYPROJECT
   ```
   {: pre}

3. Copy the **HOST/PORT** value and paste the URL in a browser to see your app in action at `http://<HOST/PORT>`. Also, set an environment variable pointing to the hostname
   ```sh
   export HOST=<HOST>
   ```
   {: pre}

### Secure the default IBM provided domain route
{: #scalable-webapp-openshift-secure_default_route}

1. To create a secured HTTPS route encrypted with the default certificate for {{site.data.keyword.openshiftshort}}, you can use the `create route` command.
   ```sh
   oc create route edge $MYPROJECT-https --service=$MYPROJECT --port=3000
   ```
   {: pre}

2. For the HTTPS HOST URL, run `oc get routes`. Copy and paste the URL with HTTPS(`https://<HOST>`) next to the route _$MYPROJECT-https_ in a browser.
   
## Monitor the app
{: #scalable-webapp-openshift-monitor_application}
{: step}

In this section, you will learn to monitor the health and performance of your application.
{{site.data.keyword.openshiftshort}} Container Platform ships with a pre-configured and self-updating monitoring and alerting stack.

1. In the **{{site.data.keyword.openshiftshort}} web console**, switch to the **Administrator** view.
1. Under **Observe**, select **Metrics**.
2. Run the below command with the route URL that generates load. The command will endlessly send requests to the application.
   ```sh
   while sleep 1; do curl --max-time 2 -s http://$HOST/load/50; done
   ```
   {: pre}

3. In the expression box, enter **`sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{namespace="<MYPROJECT>"}) by (container)`**, replace `<MYPROJECT>` by your project name and click **Run queries** to see the total container cpu usage in seconds on a graph.
4. Under **Observe**, select **Dashboards**.
5. Click on the **Dashboard** dropdown and select **Kubernetes / Compute Resources / Namespace (Workloads)**.
1. Change **Namespace** to your project.
1. Set **Time Range** to **Last 5 minutes**.
6. Check the CPU and memory usage.
7. Stop the above script using `control+C`. For logging, you can use the in-built `oc logs` command. Check [viewing logs for a resource](https://docs.openshift.com/container-platform/4.12/logging/viewing-resource-logs.html){: external} to learn about the usage of `oc logs`.

   You can also provision and use {{site.data.keyword.la_full_notm}} and {{site.data.keyword.mon_full_notm}} services for logging and monitoring your {{site.data.keyword.openshiftshort}} application. Follow the instructions mentioned in [this link](/docs/openshift?topic=openshift-health) to setup logging and monitoring add-ons to monitor cluster health.
   {: tip}

## Scale the app
{: #scalable-webapp-openshift-scaling_app}
{: step}

In this section, you will learn how to manually and automatically scale your application.

### Manual scaling
{: #scalable-webapp-openshift-25}

1. You can achieve manual scaling of your pods with `oc scale` command. The command sets a new size for a deployment configuration or replication controller
   ```sh
   oc scale dc/$MYPROJECT --replicas=2
   ```
   {: pre}

2. You can see a new pod being provisioned by running `oc get pods` command.
3. Rerun the [Monitoring](/docs/solution-tutorials?topic=solution-tutorials-scalable-webapp-openshift#scalable-webapp-openshift-monitor_application) step to see the updated logs for both the pods using the `oc logs` command.

### Autoscaling
{: #scalable-webapp-openshift-24}

You can use a horizontal pod autoscaler (HPA) to specify how {{site.data.keyword.openshiftshort}} should automatically increase or decrease the scale of a deployment configuration(dc) or replication controller(rc), based on metrics collected from the pods that belong to that `dc` or `rc`.

1. Before you can setup autoscaling for your pods, you first need to set resource limits on the pods running in the cluster. Limits allows you to choose the minimum and maximum CPU and memory usage for a pod. You can set the limits and requests on a container using `oc set resources` command.
   ```sh
   oc set resources dc/$MYPROJECT --limits=cpu=250m,memory=512Mi --requests=cpu=100m,memory=256Mi
   ```
   {: pre}

   To verify, run `oc describe dc/$MYPROJECT` and look for `Limits` and `Requests`.
2. To create an autoscaler, you need to run the `oc autoscale` command with the lower(min) and upper(max) limits for the number of pods that can be set by the autoscaler and the target average CPU utilization (represented as a percent of requested CPU) over all the pods. For testing, let's set `--cpu-percent` to 5%.
   ```sh
   oc autoscale dc/$MYPROJECT \
    --min=1 \
    --max=5 \
    --cpu-percent=5
   ```
   {: pre}

4. Rerun the [Monitoring](/docs/solution-tutorials?topic=solution-tutorials-scalable-webapp-openshift#scalable-webapp-openshift-monitor_application) step to generate load on the application.
3. You can see new pods being provisioned by running `oc get pods --watch` command or by looking at the application in the web console.
5. Remove the auto scaler:
   ```sh
   oc delete hpa/$MYPROJECT
   ```
   {: pre}

## (Optional) Build and push the container image to {{site.data.keyword.registryshort_notm}}
{: #scalable-webapp-openshift-12}
{: step}

In this section, you will learn how to use a remote private {{site.data.keyword.registryshort_notm}} to store the created container images.

{{site.data.keyword.registrylong_notm}} provides a multi-tenant, highly available, scalable, and encrypted private image registry that is hosted and managed by {{site.data.keyword.IBM_notm}}. You can use {{site.data.keyword.registrylong_notm}} by setting up your own image namespace and pushing container images to your namespace.

1. To identify your {{site.data.keyword.registryshort_notm}} URL, run
   ```sh
   ibmcloud cr region
   ```
   {: pre}

2. Define an environment variable named `MYREGISTRY` pointing to the URL such as:
   ```sh
   export MYREGISTRY=us.icr.io
   ```
   {: pre}

3. Pick one of your existing registry namespaces or create a new one. To list existing namespaces, use:
   ```sh
   ibmcloud cr namespaces
   ```
   {: pre}

   To create a new namespace:
   ```sh
   ibmcloud cr namespace-add <REGISTRY_NAMESPACE>
   ```
   {: pre}

4. Define an environment variable named `MYNAMESPACE` pointing to the registry namespace:
   ```sh
   export MYNAMESPACE=<REGISTRY_NAMESPACE>
   ```
   {: pre}

5. Define an environment variable name `API_KEY` pointing to an {{site.data.keyword.Bluemix_notm}} IAM API key.

   To create an API key, refer to this [link](/docs/Registry?topic=Registry-registry_access#registry_access_user_apikey_create).
   {: tip}

6. To automate access to your registry namespaces and to push the generated builder container image to {{site.data.keyword.registryshort_notm}}, create a secret:
   ```sh
   oc create secret docker-registry push-secret --docker-username=iamapikey --docker-password=$API_KEY --docker-server=$MYREGISTRY
   ```
   {: pre}

7. Also, you need to copy and patch the image-pull secret from the `default` project to your project:
   ```sh
   oc get secret all-icr-io -n default -o yaml | sed 's/default/'$MYPROJECT'/g' | oc -n $MYPROJECT create -f -
   ```
   {: pre}

8. For the image pull secret to take effect, you need to add it in the `default` service account
   ```sh
   oc secrets link serviceaccount/default secrets/all-icr-io --for=pull
   ```
   {: pre}

### Clone a sample application
{: #scalable-webapp-openshift-clone-web-app-code}

In this section, you will clone a GitHub repo with `yaml` template files and a shell script to generate `yaml` file with updated environment variables. The generated file is used to build a container image, push the image to the private container registry and deploy a new app using the private container image.

1. On a terminal, run the below command to clone the GitHub repository to your machine:
   ```sh
   git clone https://github.com/IBM-Cloud/openshift-node-app
   ```
   {: pre}

2. Change to the application directory,
   ```sh
   cd openshift-node-app
   ```
   {: pre}

### Update the BuildConfig and Push the builder image to {{site.data.keyword.registryshort_notm}}
{: #scalable-webapp-openshift-13}

In this step, you will update the sections of `openshift.template.yaml` file to generate a new `yaml` file pointing to {{site.data.keyword.registryshort_notm}} namespace and push the generated container image to {{site.data.keyword.registryshort_notm}}.

1. Run the below bash script to update the placeholders in the `openshift.template.yaml` file and to generate **openshift_private_registry.yaml** file.
   ```sh
   ./generate_yaml.sh use_private_registry
   ```
   {: pre}

2. Run the export command from the output to set the existing `MYPROJECT` environment variable with the new application name. Run `echo $MYPROJECT` to see the new application name.
3. Optionally, check the generated `openshift_private_registry.yaml` file to see if all the placeholders are updated with the respective environment variables. The below are 3 important places to do a quick check. _You can skip to the next section_.
4. **Optional** Locate the _ImageStream_ object with the **name** attribute set to your project (`$MYPROJECT`) and check whether the placeholders `$MYREGISTRY`,`$MYNAMESPACE`, and `$MYPROJECT` under `dockerImageRepository` definition of `spec` are updated
   ```yaml
   -
   apiVersion: image.openshift.io/v1
   kind: ImageStream
   metadata:
     annotations:
       openshift.io/generated-by: OpenShiftNewApp
     creationTimestamp: null
     labels:
       app: $MYPROJECT
       app.kubernetes.io/component: $MYPROJECT
       app.kubernetes.io/instance: $MYPROJECT
     name: $MYPROJECT
   spec:
     dockerImageRepository: $MYREGISTRY/$MYNAMESPACE/$MYPROJECT
     lookupPolicy:
       local: false
   status:
       dockerImageRepository: ""
   ```
   {: codeblock}

   An image stream and its associated tags provide an abstraction for referencing container images from within {{site.data.keyword.openshiftshort}} Container Platform

5. **Optional** Check the `spec` under `BuildConfig` section for the output set to kind `DockerImage` and placeholders under `name` updated.
   ```yaml
   spec:
     nodeSelector: null
     output:
       to:
         kind: DockerImage
         name: $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:latest
       pushSecret:
         name: push-secret
   ```
   {: codeblock}

   A build is the process of transforming input parameters into a resulting object. Most often, the process is used to transform input parameters or source code into a runnable image. A `BuildConfig` object is the definition of the entire build process.

6. **Optional** Search for `containers`, check the `image` and `name`
   ```yaml
   containers:
   - image: $MYREGISTRY/$MYNAMESPACE/$MYPROJECT:latest
     name: $MYPROJECT
   ```
   {: codeblock}

7. If updated, **save** the YAML file.

### Deploy the application using the {{site.data.keyword.registrylong_notm}}
{: #scalable-webapp-openshift-deploy-app-priv-reg}

In this section, you will deploy the application to the cluster using the generated **openshift_private_registry.yaml** file. Once deployed, you will access the application by creating a route. 

1. Create a new openshift app along with a buildconfig(bc), deploymentconfig(dc), service(svc), imagestream(is) using the updated yaml
   ```sh
   oc apply -f openshift_private_registry.yaml
   ```
   {: pre}

2. To check the builder container image creation and pushing to the {{site.data.keyword.registryshort_notm}}, run the below command
   ```sh
   oc logs -f bc/$MYPROJECT
   ```
   {: pre}

   In the logs, you should see the below message if the container image is pushed to the private container registry 
   ```sh
   Pushing image us.icr.io/mods15/vmac-openshift-app-registry:latest ...
   Getting image source signatures
   Copying blob sha256:9d038e1c7afbe92c29313557c02110e8fb796818ebb78441c68929381103a94b
   Copying blob sha256:61c671f49591a059c9b6728a9f84c16f5b00126470112ee9c9f9e01dbbfcc3ea
   Copying blob sha256:e2787650308235c87eff7d2b88c3ab217e84b74a3fa9696103bd46bb99068c7a
   Copying blob sha256:dcef409117430ed9906a59ad0a3ea0752061fbf8a9e544f4edd77667a25d85ae
   Copying blob sha256:a1f889dd610c6510c7fc091a51c247463f3cc9a7c67bdc397c9632168808f7d2
   Copying blob sha256:bd278801acd18ada10f43b732113a6fffc163011862ea6cde729f8dc59e64222
   Copying blob sha256:2d6c03ed5d15be86cdef7d9c0c9fea40a3f6b89662bca59680d037074f52bb38
   Copying blob sha256:fa2ef7f80d6fc9543f6eb472846931ed1cec2b5f776d1b67bcb1b9942e1a947e
   Copying blob sha256:ff5a4e4d3690ccc931900b63714d326cc53a58e644f8d0a4f06bf8c62f11c5c7
   Copying config sha256:01aa1ebb7be74529867106100c4e699ca2ae87f8242460771527f772e6a3d174
   Writing manifest to image destination
   Storing signatures
   Successfully pushed us.icr.io/mods15/vmac-openshift-app-registry@sha256:6847b889397704b9fb8c3122c84b505c3dc5f99a0669fb69f534d3504eec385d
   Push successful
   ```
   {: screen}

3. You can check the status of deployment and service using
   ```sh
   oc status
   ```
   {: pre}

4. Manually import the latest image stream to ensure the deployment takes place as soon as possible with the command 
   ```sh
   oc import-image $MYPROJECT
   ```
   {: pre}
   
   You can also use the command if the deployment is taking more time, Refer to this [link](https://docs.openshift.com/container-platform/4.12/registry/index.html#registry-third-party-registries_registry-overview){: external} for more info.
   {: tip}

5. Expose the service to create a new route and access the application with the `HOST/PORT` from the `oc get route/$MYPROJECT` command.
   ```sh
   oc expose service/$MYPROJECT
   ```
   {: pre}

You should see the same application exposed on a different route and deployed using the container image stored in a private container registry.

## (Optional) Push the code to a private {{site.data.keyword.cloud_notm}} Git repository
{: #scalable-webapp-openshift-private-git-repo}
{: step}

In this step, you will create a private {{site.data.keyword.cloud_notm}} Git repository and push the sample application code. You will also learn how to automatically build and redeploy when the app is updated.

   You need to configure an SSH key for the push to be successful,check the instructions under the `Generate an SSH key pair` and `Add an SSH key to your GitLab account` sections of the [documentation here](https://us-south.git.cloud.ibm.com/help/ssh/README)
   {: important}

1. On a browser, open [{{site.data.keyword.cloud_notm}} Git](https://us-south.git.cloud.ibm.com)

   The link above is for `us-south` region. For other regions, run `ibmcloud regions` and replace `us-south` in the URL with region name.
   {: tip}

2. Click on **New project**, click on **Create blank project**, and then provide `openshiftapp` as the project name.
3. Set the visibility level to **Private** and click **Create project**
4. Follow the instructions under **Git global setup** and **Push an existing Git repository** sections to setup Git and to push the sample application code.
5. Once you push the code to the private repository, you should see the sample code in the project.

### Create a Git deploy token
{: #scalable-webapp-openshift-git-deploy-token}

In this section, you will create a Git deploy token to allow **read-only** access to your repository.

To generate a deploy token:
1. On the left pane of the Git repo page, click **Settings** > **Repository**.
2. Click on **Expand** next to **Deploy Tokens**.
   1. Provide **foropenshift** as the **Name** then check **read_repository** checkbox and click **create deploy token**.
   2. **Save** the generated **username** and **password** for future reference.
3. On the left pane, click on **Project overview** then click **Details**, click on **Clone** and copy **Clone with HTTPS** URL. Save the URL for future reference.
4. Define environment variables for the username, password and private Git repo URL to be used with the YAML file later in the tutorial
   ```sh
   export GIT_TOKEN_USERNAME=<PRIVATE_GIT_DEPLOY_TOKEN_USERNAME>
   export GIT_TOKEN_PASSWORD=<PRIVATE_GIT_DEPLOY_TOKEN_PASSWORD>
   export REPO_URL=<PRIVATE_GIT_REPO_URL>
   ```
   {: pre}

### Deploy a new application using the private registry and the code from private repository
{: #scalable-webapp-openshift-private-reg-repo}

1. Run the below bash script to update the placeholders in the `openshift.template.yaml` file and to generate **openshift_private_repository.yaml** file.
   ```sh
   ./generate_yaml.sh use_private_repository
   ```
   {: pre}

2. Run the export command from the output to set the existing `MYPROJECT` environment variable with new project name.
3. Additional to the private container registry placeholders, the script will also replace the `REPO_URL` under `BuildConfig` spec with the the environment variables you set in the above step,
   ```yaml
    source:
      git:
        uri: $REPO_URL
      type: Git
   ```
   {: codeblock}

4. Create a new openshift app along with a buildconfig(bc), deploymentconfig(dc), service(svc), imagestream(is) using the updated yaml
   ```sh
   oc apply -f openshift_private_repository.yaml
   ```
   {: pre}

5. You can check the status of buildconfig, deployment and service using
   ```sh
   oc logs -f bc/$MYPROJECT
   oc status
   ```
   {: pre}

6. Manually import the latest image stream to ensure the deployment takes place as soon as possible with the command 
   ```sh
   oc import-image $MYPROJECT
   ```
   {: pre}

7. Expose the service to create a new route and access the application with the `HOST/PORT` from the `oc get route/$MYPROJECT` command
   ```sh
   oc expose service/$MYPROJECT
   ```
   {: pre}   

A new application is deployed using the code from the private Git repo and the container image from the private registry namespace.

### Update the app and redeploy
{: #scalable-webapp-openshift-18}

In this step, you will automate the build and deploy process. So that whenever you update the application and push the changes to the private repo, a new build config is generated creating a build in turn generating a new version of the builder Docker image. This image will be deployed automatically.

1. You will create a new **GitLab** Webhook trigger. Webhook triggers allow you to trigger a new build by sending a request to the {{site.data.keyword.openshiftshort}} Container Platform API endpoint.You can define these triggers using GitHub, GitLab, Bitbucket, or Generic webhooks.
   ```sh
   oc set triggers bc $MYPROJECT --from-gitlab
   ```
   {: pre}

2. To add a webhook on the GitLab repository, you need a URL and a secret
   - For webhook GitLab URL,
     ```sh
     oc describe bc/$MYPROJECT | grep -A 1 "GitLab"
     ```
     {: pre}

   - For secret that needs to be passed in the webhook URL,
     ```sh
     oc get bc/$MYPROJECT -o yaml | grep -A 3 "\- gitlab"
     ```
     {: pre}

   - **Replace** `<secret>` in the webhook GitLab URL with the secret value under _gitlab_ in the above command output.
3. Open your private git repo on a browser using the Git repo HTTPS link then click on **Settings** and click **Webhooks**.
4. Paste the **URL** and click **Add webhook**. Test the URL by clicking **Test** and selecting Push events. You should see `Hook executed successfully: HTTP 200` message. This triggers a new build.
5. Update the ImagePolicy of the image stream to query {{site.data.keyword.registryshort_notm}} at a scheduled interval to synchronize tag and image metadata. This will update the `tags` definition
   ```sh
   oc tag $MYREGISTRY/$MYNAMESPACE/${MYPROJECT}:latest ${MYPROJECT}:latest --scheduled=true
   ```
   {: pre}

6. Open the cloned repo in an IDE to update the `h1` tag of local _public/index.html_ file and change it to `Congratulations! <YOUR_NAME>`.
7. Save and push the code to the repo
   ```sh
    git add public/index.html
    git commit -m "Updated with my name"
    git push -u origin master
   ```
   {: pre}

8. You can check the progress of the build and deploy with `oc status` command. Once the deployment is successful, refresh the route HOST address to see the updated web app.

   Sometimes, the deployment may take up to 15 minutes to import the latest image stream. You can either wait or manually import using `oc import-image $MYPROJECT` command. Refer to this [link](https://docs.openshift.com/container-platform/4.12/registry/#registry-third-party-registries_registry-overview){: external} for more info.
   {: tip}


<!--##istutorial#-->
## (Optional) Use your own custom domain
{: #scalable-webapp-openshift-custom_domain}
{: step}

This section requires you to own a custom domain and to be able to modify the DNS records of the domain. You will need to create a `CNAME` record pointing to the IBM-provided domain.

Steps for setting up the CNAME record vary depending on your DNS provider. Under DNS Management/Zone of your domain, add a new `CNAME` record, set **Host(name)** to `openshiftapp` or any subdomain you like and set **Points to** to IBM-provided domain without HTTP or HTTPS
{: tip}

### With HTTP
{: #scalable-webapp-openshift-20}

1. Create a route exposing the service at a hostname by replacing `<HOSTNAME>` with your hostname(e.g.,www.example.com or openshiftapp.example.com), so that external clients can reach it by name.
   ```sh
   oc expose svc/$MYPROJECT --hostname=<HOSTNAME> --name=$MYPROJECT-domain --port=3000
   ```
   {: pre}

2. Access your application at `http://<HOSTNAME>/`

### With HTTPS
{: #scalable-webapp-openshift-21}

1. To create a secured HTTPS route, you can use your own certificate and key files from a CA like [Let's Encrypt](https://letsencrypt.org/){: external} or order through [{{site.data.keyword.secrets-manager_short}}](/docs/secrets-manager?topic=secrets-manager-certificates&interface=ui). Pass them with the `create route` command
   ```sh
   oc create route edge $MYPROJECT-httpsca --service=$MYPROJECT --cert=example.pem --key=example.key --hostname=<www.HOSTNAME> --port=3000
   ```
   {: pre}

   Here, you have used Edge termination. To learn about other secured routes and termination types like passthrough and re-encryption, run `oc create route --help` command)
   {: tip}
   
<!--#/istutorial#-->

## Remove resources
{: #scalable-webapp-openshift-cleanup}
{: step}

* Delete all resource objects specific to an application:
   ```sh
   oc delete all --selector app=$MYPROJECT
   ```
   {: pre}

   To list the application names in the project, run `oc get svc | awk '{print $1}'` 
   {: tip}

* Delete the project:
   ```sh
   oc delete project $MYPROJECT
   ```
   {: pre}

<!--##istutorial#-->
* Delete the cluster you created.

<!--#/istutorial#-->

## Related content
{: #scalable-webapp-openshift-0}

* [{{site.data.keyword.openshiftlong_notm}}](/docs/openshift?topic=openshift-why_openshift)
* [Horizontal Pod Autoscaling](https://docs.openshift.com/container-platform/4.12/nodes/pods/nodes-pods-autoscaling.html)
* [Secured routes](https://docs.openshift.com/container-platform/4.12/networking/routes/secured-routes.html)
