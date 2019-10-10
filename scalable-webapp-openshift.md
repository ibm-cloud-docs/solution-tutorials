---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-08-13"
lasttested: "2019-07-30"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Scalable web application on {{site.data.keyword.openshiftshort}}
{: #scalable-webapp-openshift}

This tutorial walks you through how to scaffold a web application, run it locally in a container, push the scaffolded code to a private Git repository and then deploy it to a [{{site.data.keyword.openshiftlong_notm}}](https://{DomainName}/kubernetes/catalog/openshiftcluster) cluster. Additionally, you will learn how expose the app on an {{site.data.keyword.openshiftshort}} route, bind a custom domain, monitor the health of the environment, and scale the application.
{:shortdesc}

With the {{site.data.keyword.openshiftlong_notm}}, you can create {{site.data.keyword.containerlong_notm}} clusters with worker nodes that come installed with the {{site.data.keyword.openshiftlong_notm}} Container Platform orchestration software. You get all the [advantages of managed {{site.data.keyword.containerlong_notm}}](https://{DomainName}/docs/containers?topic=containers-responsibilities_iks) for your cluster infrastructure environment, while using the [{{site.data.keyword.openshiftshort}} tooling and catalog](https://docs.openshift.com/container-platform/3.11/welcome/index.html) that runs on Red Hat Enterprise Linux for your app deployments.

For developers looking to kickstart their projects, the {{site.data.keyword.dev_cli_notm}} CLI enables rapid application development and deployment by generating template applications that you can run immediately or customize as the starter for your own solutions.

## Objectives
{: #objectives}

* Scaffold a starter application.
* Deploy the application to the {{site.data.keyword.openshiftlong_notm}} cluster.
* Bind a custom domain.
* Monitor the logs and health of the cluster.
* Scale {{site.data.keyword.openshiftshort}} pods.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
* [{{site.data.keyword.openshiftlong_notm}}](https://{DomainName}/kubernetes/clusters?platformType=openshift)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution50-scalable-webapp-openshift/Architecture.png)
</p>

1. A developer generates a starter application with {{site.data.keyword.dev_cli_notm}}.
2. The dev adds the generated starter kit code to a private Git repository on {{site.data.keyword.Bluemix_notm}}
3. A Docker container image is build from the code.
4. The image is pushed to a namespace in {{site.data.keyword.registrylong_notm}}.
5. The application is deployed to an {{site.data.keyword.openshiftshort}} cluster by pulling the image.
6. Users access the application.

## Before you begin
{: #prereqs}

1. [Install {{site.data.keyword.dev_cli_notm}}](/docs/cli?topic=cloud-cli-getting-started) - Script to install docker, kubectl, ibmcloud cli and required plug-ins like dev, ks, cr ...
1. [Install the {{site.data.keyword.openshiftshort}} Origin (oc) CLI](/docs/openshift?topic=openshift-openshift-cli#cli_oc)
1. [Configure your access to {{site.data.keyword.Bluemix_notm}} Git](/docs/services/ContinuousDelivery?topic=ContinuousDelivery-git_working#creating-an-ssh-key) to be able to commit source code to a private Git repository.
   1. Use [these instructions](https://us-south.git.cloud.ibm.com/help/ssh/README#generating-a-new-ssh-key-pair) to generate a new SSH key pair if you don't have one.
   1. And [add your SSH public key to your Git settings](https://us-south.git.cloud.ibm.com/help/gitlab-basics/create-your-ssh-keys).
1. [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://{DomainName}/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_setup_cli_namespace)

## Create an {{site.data.keyword.openshiftshort}} cluster
{: #create_openshift_cluster}

With {{site.data.keyword.openshiftlong_notm}}, you have a fast and secure way to containerize and deploy enterprise workloads in {{site.data.keyword.openshiftshort}} clusters. {{site.data.keyword.openshiftshort}} clusters build on Kubernetes container orchestration that offers consistency and flexibility for your development lifecycle operations.

In this section, you will provision a {{site.data.keyword.openshiftlong_notm}} cluster with two worker nodes.

1. Create an {{site.data.keyword.openshiftshort}} cluster from the [{{site.data.keyword.Bluemix}} catalog](https://{DomainName}/kubernetes/catalog/cluster/create?platformType=openshift).
2. Set **Cluster name** to **myopenshiftcluster**.
3. Select a **Resource group** and choose a **Geography**.
4. Under **Location**,
   - Select a **Metro**.
   - Choose a single **Worker zone** by unchecking the other worker zones.
   - Select **Public endpoint only** as your Master service endpoint.
5. Under **Default worker pool**,
   - Choose **{{site.data.keyword.openshiftshort}} 3.11** as your cluster type and version.
   - Select **4 Cores 16GB RAM** as the flavor for Worker nodes.
   - Leave **Encrypt local disk** checked and select **2** Worker nodes for this tutorial.
6. Review **Infrastructure permissions checker** to verify the required permissions
7. Click **Create cluster** to provision an {{site.data.keyword.openshiftshort}} cluster.

### Configure CLI

In this step, you'll configure `oc` to point to your newly created cluster. The [{{site.data.keyword.openshiftshort}} Container Platform CLI](https://docs.openshift.com/container-platform/3.11/cli_reference/get_started_cli.html) exposes commands for managing your applications, as well as lower level tools to interact with each component of your system. The CLI is available using the `oc` command.

1. When the cluster is ready, click on the **Access** tab under the cluster name.
1. Under **After your cluster provisions, gain access** section, click on **oauth token request page** link and follow instructions to log into your cluster on a terminal.
1. Once logged-in using the `oc login` command, run the below command to see all the namespaces in your cluster
   ```sh
   oc get ns
   ```
   {:pre}

## Generate a starter kit
{: #generate_starter_kit}

The `ibmcloud dev` tooling greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

### Using ibmcloud dev plugin

1. On a terminal, start the `ibmcloud dev` wizard by running the below command
   ```sh
   ibmcloud dev create
   ```
   {: pre}

   You may be asked to target an organization and a space, follow the instructions on the CLI
   {:tip}

2. Select `Backend Service / Web App` then `Node` and select `Node.js Web App with Express.js` to create a Node starter.
3. Enter a **name** for your application.
4. Select a **resource group** same as the cluster to deploy this application.
5. Do not add additional services.
6. Do not add a DevOps toolchain, select **manual deployment**.

This generates a starter application complete with the code and all the necessary configuration files for local development and deployment to cloud on Cloud Foundry or {{site.data.keyword.containershort_notm}}.

### Run the application locally

You can build and run the application as you normally would using `npm` for node development.  You can also build a docker image and run the application in a container to ensure consistent execution locally and on the cloud. Use the following steps to build your docker image.

1. Ensure your local Docker engine is started.
   ```sh
   docker ps
   ```
   {: pre}
2. Change to the directory of the generated project.
   ```sh
   cd <project name>
   ```
   {: pre}
3. Build the application.
   ```sh
   ibmcloud dev build
   ```
   {: pre}
   This might take a few minutes to run as all the application dependencies are downloaded and a Docker image, which contains your application and all the required environment, is built.
4. Run the container.
   ```sh
   ibmcloud dev run
   ```
   {: pre}

   This uses your local Docker engine to run the docker image that you built in the previous step.
5. After your container starts, go to `http://localhost:3000/`.

### Push the code to a Private IBM Cloud Git repo

In this step, you will create a private IBM Cloud Git repository and push the generated code.

1. On a browser, open [IBM Cloud Git](https://us-south.git.cloud.ibm.com)

   The link above is for `us-south` region. For other regions, run `ibmcloud regions` and replace `us-south` in the URL with region name.
   {:tip}
2. Click on **New project** and provide `openshiftapp` as the project name.
3. Set the visibility level to **Private** and click **Create project**
4. Follow the instructions under *Git global setup* and *Existing folder* sections to setup Git and to import the code you have generated with `ibmcloud dev`.
5. Once you push the code to the private repository, you should see the scaffolded code in the project.

### Create a Git deploy token
In this step, you will create a deploy token to allow read-only access to your repository
1. To create a **Deploy token**,
      - On the left pane of the Git repo page, click **Settings** > Repository
      - Click on **Expand** next to **Deploy Tokens**.
      - Provide **foropenshift** as the name then check **read_repository** checkbox and click **create deploy token**.
      - Save the generated **username** and **password** for future reference.
2. Click on **Project** then click **Details**, click on **Clone** and copy **Clone with HTTPS** URL.Save the URL for future reference.

## Create a new {{site.data.keyword.openshiftshort}} application
{: #create_openshift_app}
In this section, you will generate a BuildConfig YAML file and update the file with Private registry details to push the generated builder Docker image to {{site.data.keyword.registryshort_notm}}.
### Generate a build configuration yaml file

A Kubernetes namespace provides a mechanism to scope resources in a cluster. In {{site.data.keyword.openshiftshort}}, a project is a Kubernetes namespace with additional annotations.

1. Create a new project
   ```sh
   oc new-project openshiftproject
   ```
   {:pre}
1. Generate a yaml file `openshift.yaml` in the same folder as your starter kit code by replacing the placeholders and running the below command
   ```sh
   oc new-app https://<DEPLOY_TOKEN_USERNAME>:<DEPLOY_TOKEN_PASSWORD>@<REPO_URL_WITHOUT_HTTPS> --name=openshiftapp --strategy=docker -o yaml > openshift.yaml
   ```
   {:pre}

   Replace `<REPO_URL_WITHOUT_HTTPS>` with the Git repository URL without `https://`.
   {:tip}

### Update the BuildConfig and Push the builder image to {{site.data.keyword.registryshort_notm}}
In this step, you will update the generated BuildConfig section of the generated yaml to point to {{site.data.keyword.registryshort_notm}} namespace and push the generated builder image to {{site.data.keyword.registryshort_notm}}. In this tutorial, a remote private {{site.data.keyword.registryshort_notm}} is used for persistent storage of created images.

1. To automate access to your registry namespaces and to push generated builder Docker image to {{site.data.keyword.registryshort_notm}}, create a secret using an IAM API key
   ```sh
   oc create secret docker-registry push-secret --docker-username=iamapikey --docker-password=<API_KEY> --docker-server=<REGISTRY_URL>
   ```
   {:pre}

   For creating an API key, refer this [link](https://{DomainName}/docs/services/Registry?topic=registry-registry_access#registry_api_key_create). For registry URL, run `ibmcloud cr region`.
   {:tip}
2. Edit the generated **openshift.yaml**.
3. Locate the *ImageStream* object named *openshiftapp* and add a `dockerImageRepository` definition under `spec` replacing the placeholders `<REGISTRY_URL>` and `<REGISTRY_NAMESPACE>` with their respective values:
   ```yaml
   -
   apiVersion: image.openshift.io/v1
   kind: ImageStream
   metadata:
       annotations:
               openshift.io/generated-by: OpenShiftNewApp
       creationTimestamp: null
       labels:
               app: openshiftapp
       name: openshiftapp
   spec:
       dockerImageRepository: <REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp
       lookupPolicy:
               local: false
   status:
       dockerImageRepository: ""
   ```
   {:codeblock}

   An image stream and its associated tags provide an abstraction for referencing container images from within {{site.data.keyword.openshiftshort}} Container Platform
4. Update the `spec` under `BuildConfig` section by changing the output to kind `DockerImage` and adding a `pushSecret`
   ```yaml
   spec:
   nodeSelector: null
   output:
       to:
               kind: DockerImage
               name: '<REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp:latest'
       pushSecret:
               name: push-secret
   ```
   {:codeblock}

   A build is the process of transforming input parameters into a resulting object. Most often, the process is used to transform input parameters or source code into a runnable image. A `BuildConfig` object is the definition of the entire build process.

5. Search for `containers` and update the image with
   ```yaml
   containers:
       -image: '<REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp:latest'
       name: openshiftapp
   ```
   {:codeblock}
6. Save the YAML file.

## Deploy the application to cluster
{:#deploy_app_to_cluster}
In this section, you will deploy the application to the cluster using the generated **openshift.yaml** file. Once deployed, you will access the application by creating a route. You will also learn how to automatically build and redeploy when the app is updated.

### Create the app using the updated yaml

1. Before creating the app, you need to copy and patch the image-pull secret from the `default` project to your project(openshiftproject)
   ```sh
   oc get secret default-us-icr-io -n default -o yaml | sed 's/default/openshiftproject/g' | oc -n openshiftproject create -f -
   ```
   {:pre}

   If you are using {{site.data.keyword.registryshort_notm}} from a region other than US, follow the instructions in this [link](https://{DomainName}/docs/containers?topic=containers-images#copy_imagePullSecret) to copy pull secrets.
   {:tip}

1. For the image pull secret to take effect, you need to add it in the `default` service account
   ```sh
   oc secrets add serviceaccount/default secrets/openshiftproject-us-icr-io --for=pull
   ```
   {:pre}
1. Create a new openshift app along with a buildconfig(bc), deploymentconfig(dc), service(svc), imagestream(is) using the updated yaml
   ```sh
   oc create -f openshift.yaml
   ```
   {:pre}

    To learn about the core concepts of {{site.data.keyword.openshiftshort}}, refer this [link](https://docs.openshift.com/container-platform/3.11/architecture/core_concepts/index.html)
    {:tip}

1. To check the builder Docker image creation and pushing to the {{site.data.keyword.registryshort_notm}}, run the below command
   ```sh
   oc logs -f bc/openshiftapp
   ```
   {:pre}
1. You can check the status of deployment and service using
   ```sh
   oc status
   ```
   {:pre}

### Access the app through IBM provided domain
To access the app, you need to create a route. A route announces your service to the world.

1. Create a route by running the below command in a terminal
   ```sh
   oc expose service openshiftapp --port=3000
   ```
   {:pre}
1. You can access the app through IBM provided domain. Run the below command for the URL
   ```sh
   oc get routes
   ```
   {:pre}
1. Copy the **HOST/PORT** value and paste the URL in a browser to see your app in action.

### Secure the default IBM provided domain route
{: #secure_default_route}

1. To create a secured HTTPS route encrypted with the default certificate for {{site.data.keyword.openshiftshort}}, you can use the `create route` command.
   ```sh
   oc create route edge openshifthttps --service=openshiftapp --port=3000
   ```
   {:pre}
1. For the HTTPS HOST URL, run `oc get routes`. Copy and paste the URL with HTTPS(`https://<HOST>`) next to the route *openshifthttps* in a browser.

### Update the app and redeploy
In this step, you will automate the build and deploy process. So that whenever you update the application and push the changes to the Private repo, a new build config is generated creating a build in turn generating a new version of the builder Docker image. This image will be deployed automatically.

1. You will create a new **GitLab** Webhook trigger. Webhook triggers allow you to trigger a new build by sending a request to the {{site.data.keyword.openshiftshort}} Container Platform API endpoint.You can define these triggers using GitHub, GitLab, Bitbucket, or Generic webhooks.
   ```sh
   oc set triggers bc openshiftapp --from-gitlab
   ```
   {:pre}
2. To add a webhook on the GitLab repository, you need a URL and a secret
   - For webhook GitLab URL,
     ```sh
     oc describe bc openshiftapp | grep -A 1 "GitLab"
     ```
     {:pre}
   - For secret that needs to be passed in the webhook URL,
     ```sh
     oc get bc openshiftapp -o yaml | grep -A 3 "\- gitlab"
     ```
     {:pre}
   - Replace `<secret>` in the webhook GitLab URL with the secret value under *gitlab* in the above command output.
3. Open your private git repo on a browser using the Git repo HTTPS link then click on **Settings** and click **Integrations**.
4. Paste the **URL** and click **Add webhook**. Test the URL by clicking **Test** and selecting Push events.
5. Update the ImagePolicy of the image stream to query {{site.data.keyword.registryshort_notm}} at a scheduled interval to synchronize tag and image metadata. This will update the `tags` definition
   ```sh
   oc tag <REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp:latest openshiftapp:latest --scheduled=true
   ```
   {:pre}
6. Open the cloned repo in an IDE to update the `h1` tag of local *public/index.html* file and change it to 'Congratulations! <YOUR_NAME>'.
7. Save and push the code to the repo
   ```sh
    git add public/index.html
    git commit -m "Updated with my name"
    git push -u origin master
   ```
   {:pre}
8. You can check the progress of the build and deploy with `oc status` command. Once the deployment is successful, refresh the route HOST address to see the updated web app.

   Sometimes, the deployment may take up to 15 minutes to import the latest image stream. You can either wait or manually import using `oc import-image openshiftapp` command. Refer this [link](https://docs.openshift.com/container-platform/3.11/dev_guide/managing_images.html#importing-tag-and-image-metadata) for more info.
   {:tip}

## Use your own custom domain
{: #custom_domain}

To use your custom domain, you need to update your domain DNS records with a `CNAME` record pointing to your IBM-provided domain(route URL).

### With HTTP
1. Create a route exposing the service at a hostname by replacing `<HOSTNAME>` with your hostname(e.g.,www.example.com), so that external clients can reach it by name.
   ```sh
   oc expose svc/openshiftapp --hostname=<HOSTNAME> --name=openshiftappdomain --port=3000
   ```
   {:pre}
2. Access your application at `http://<customdomain>/`

### With HTTPS

1. To create a secured HTTPS route, you can use your own certificate and key files from a CA like [letsencrypt.org](http://letsencrypt.org/) and pass them with the `create route` command
   ```sh
   oc create route edge openshifthttpsca --service=openshiftapp --cert=example.pem --key=example.key --ca-cert=ca.pem --hostname=<www.HOSTNAME> --port=3000
   ```
   {:pre}

   Here, you have used Edge termination. To learn about other termination types like passthrough and re-encryption, refer [secure routes](https://docs.openshift.com/container-platform/3.11/architecture/networking/routes.html#secured-routes)
   {:tip}

## Monitor the app
{:#monitor_application}

In this section, you will learn to monitor the health and performance of your application.
{{site.data.keyword.openshiftshort}} Container Platform ships with a pre-configured and self-updating monitoring stack that is based on the [Prometheus](https://prometheus.io/) open source project and its wider eco-system. It provides monitoring of cluster components and ships with a set of [Grafana](https://grafana.com/) dashboards

1. To access the web UIs of Prometheus and Grafana along with Alertmanager, run the below command and make sure to prepend `https://` to the returned addresses(HOST). You cannot access web UIs using unencrypted connection.If prompted, click **Login with OpenShift** and authorize access by allowing selected permissions.
   ```sh
    oc get routes -n openshift-monitoring
   ```
   {:pre}
2. You will use Apache *ab* to generate load on your deployed application by hitting the route URL 5000 times with 100 concurrent requests at a time. This will in turn generate data into Prometheus.
   ```sh
    ab -n 5000 -c 100 <APPLICATION_ROUTE_URL>/
   ```
   {:pre}
3. In the expression box of Prometheus web UI, enter **namespace_pod_name_container_name:container_cpu_usage_seconds_total:sum_rate{namespace="openshiftproject"}** and click **Execute** to see the total container cpu usage in seconds on a Graph and a console.
4. Open the **Grafana** web UI URL on a browser.
5. On the Grafana **Home** page, click on **K8s / Compute Resources / Pod** and Select
   - datasource: **Prometheus**
   - namespace: **openshiftproject**
   - pod: **openshiftapp-*DEPLOYMENT_NUMBER*-*POD_ID***
6. Check the CPU and memory usage.
7. For logging, you can use the in-built `oc logs` command.

  You can also provision and use {{site.data.keyword.la_full_notm}} and {{site.data.keyword.mon_full_notm}} services for logging and monitoring your {{site.data.keyword.openshiftshort}} application. Follow the instructions mentioned in [this link](/docs/openshift?topic=openshift-openshift_health#openshift_logmet) to setup LogDNA and Sysdig add-ons to monitor cluster health.
  {:tip}

## Scale the app
{:#scaling_app}

In this section, you will learn how to manually scale your application.

1. You can achieve manual scaling of your pods with `oc scale` command. The command sets a new size for a deployment or replication controller
   ```sh
    oc scale dc openshiftapp --replicas=2
   ```
   {:pre}
2. You can see a new pod being provisionsed by running `oc get pods` command.
3. Rerun the [Monitoring](/docs/tutorials?topic=solution-tutorials-scalable-webapp-openshift#monitor_application) step to see the updated logs for both the pods.

## Remove resources
{:#cleanup}

* Delete the cluster or only delete the {{site.data.keyword.openshiftshort}}(oc) artifacts created for the application if you plan to reuse the cluster.
* To delete all `openshiftapp` application resource objects, run the below command
   ```sh
   oc delete all --selector app=openshiftapp
   ```
   {:pre}
* To delete the project
   ```sh
   oc delete project openshiftproject
   ```
   {:pre}

## Related content

* [{{site.data.keyword.openshiftlong_notm}}](https://{DomainName}/docs/openshift?topic=openshift-why_openshift)
* [Horizontal Pod Autoscaling](https://docs.openshift.com/container-platform/3.11/dev_guide/pod_autoscaling.html)
* [Routes overview](https://docs.openshift.com/container-platform/3.11/architecture/networking/routes.html)
