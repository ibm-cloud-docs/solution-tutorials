---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-07-24"
lasttested: "2019-07-24"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Scalable web application on OpenShift
{: #scalable-webapp-kubernetes}

> :warning: Work in progress

This tutorial walks you through how to scaffold a web application, run it locally in a container, push the scaffolded code to a private repository and then deploy it to a standard Red Hat OpenShift on IBM Cloud cluster created with [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster). Additionally, you will learn how expose the app on an Openshift route, bind a custom domain, monitor the health of the environment, and scale the application.
{:shortdesc}

With the Red Hat OpenShift on IBM Cloud, you can create {{site.data.keyword.containerlong_notm}} clusters with worker nodes that come installed with the Red Hat OpenShift on IBM Cloud Container Platform orchestration software. You get all the [advantages of managed {{site.data.keyword.containerlong_notm}}](https://{DomainName}/docs/containers?topic=containers-responsibilities_iks&locale=en\043science) for your cluster infrastructure environment, while using the [OpenShift tooling and catalog](https://docs.openshift.com/container-platform/3.11/welcome/index.html) that runs on Red Hat Enterprise Linux for your app deployments.

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
* [Generate a new SSH key](https://help.github.com/en/enterprise/2.16/user/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
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
1. Click on **Git** tile under CODE to open your Git repository in a browser. Copy the link to a clipboard for future reference.
1. Copy the SSH public key(e.g., id_rsa.pub) by running the below command on a terminal
    ```sh
     pbcopy < ~/.ssh/id_rsa.pub
    ```
    {:pre}
1. Under Git profile settings, click on **SSH Keys** and paste the SSH key > click **Add key**.
1. Click **Projects** on the top ribbon > Your projects > Openshiftapp and Follow the instructions under **Existing folder** section by pointing it to the local folder where you have created the starter kit using `ibmcloud dev`.
1. Once you push the code to the private repository, you should see the scaffolded code in the project.

## Create a new OpenShift application
{: #create_openshift_app}
In this section, you will generate a BuildConfig YAML file and update the file with Private registry details to push the generated builder Docker image to {{site.data.keyword.registryshort_notm}}.
### Generate a build configuration yaml file

A Kubernetes namespace provides a mechanism to scope resources in a cluster. In OpenShift, a project is a Kubernetes namespace with additional annotations.

1. Create a new project
   ```sh
    oc new-project openshiftproject
   ```
   {:pre}
1. Create a **Deploy token**. Deploy tokens allow read-only access to your repository.
      - On the left pane of the Git repo page, click **Settings** > Repository
      - Click on **Expand** next to **Deploy Tokens**.
      - Provide **foropenshift** as the name > check **read_repository** checkbox and click **create deploy token**.
      - Save the generated **username** and **password** for future reference.
1. Click on **Project** > Details, click on **Clone** and copy **Clone with HTTPS** URL.
1. Generate a yaml file in the same folder as your starter kit code by replacing the placeholders and running the below command
   ```sh
    oc new-app https://<USERNAME>:<PASSWORD@<REPO_URL_WITHOUT_HTTPS> \
    --name=openshiftapp \
    --strategy=docker -o yaml > myapp.yaml
   ```
   {:pre}

### Update the BuildConfig and Push the builder image to {{site.data.keyword.registryshort_notm}}
In this step, you will update the generated BuildConfig section of the generated yaml to point to {{site.data.keyword.registryshort_notm}} namespace and push the generated builder image to {{site.data.keyword.registryshort_notm}}

1. To automate access to your registry namespaces and to push generated builder Docker image to {{site.data.keyword.registryshort_notm}}, create a secret using an IAM API key
   ```sh
    oc create secret docker-registry push-secret \
    --docker-username=iamapikey \
    --docker-password=<API_KEY> \
    --docker-server=<REGISTRY_URL>
   ```
   {:pre}

   For creating an API key, refer this [link](https://{DomainName}/docs/services/Registry?topic=registry-registry_access#registry_api_key_create). For registry URL, run `ibmcloud cr region`.
   {:tip}
1. Open the generated **myapp.yaml** in an IDE and
   - Update the placeholders with the values. Thereafter, configure an image stream to import tag and image metadata from an image repository in an external container image registry by updating the ImageStream item of the definition to look like the one shown below
    ```yaml
    - apiVersion: image.openshift.io/v1
      kind: ImageStream
      metadata:
        annotations:
          openshift.io/generated-by: OpenShiftNewApp
        creationTimestamp: null
        labels:
          app: openshiftapp
        name: openshiftapp
      spec:
        dockerImageRepository: "<REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp"
        lookupPolicy:
          local: false
      status:
        dockerImageRepository: ""
    ```
    {:codeblock}
   - Update the `spec` under `BuildConfig` section with
    ```yaml
    spec:
       nodeSelector: null
       output:
         to:
           kind: DockerImage
           name: <REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp:latest
         pushSecret:
           name: push-secret
   ```
   {:codeblock}
   - Search for `containers` and update the image with
    ```yaml
    containers:
            - image: <REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp:latest
              name: openshiftnodeapp
    ```
   {:codeblock}
1. Save the YAML file.

## Deploy the application to cluster
{:#deploy_app_to_cluster}
In this section, you will deploy the application to the cluster using the generated **myapp.yaml** file. Once deployed, you will access the application by creating a route. You will also learn how to automatically build and redeploy when the app is updated.

### Create the app using the buildconfig yaml

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
    oc create -f myapp.yaml
   ```
   {:pre}

    To learn about the core concepts of OpenShift, refer this [link](https://docs.openshift.com/container-platform/3.11/architecture/core_concepts/index.html)
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

### Update the app and redeploy
In this step, you will automate the build and deploy process. So that whenever you update the application and push the changes to the Private repo, a new build config is generated creating a build in turn generating a new version of the builder Docker image. This image will be deployed automatically.

1. You will create a new **GitLab** Webhook trigger. Webhook triggers allow you to trigger a new build by sending a request to the OpenShift Container Platform API endpoint.You can define these triggers using GitHub, GitLab, Bitbucket, or Generic webhooks.
   ```sh
    oc set triggers bc openshiftapp --from-gitlab
   ```
   {:pre}
1. To add a webhook on the GitLab repository, you need a URL and a secret
   - For webhook GitLab URL,
     ```sh
      oc describe bc openshiftapp
     ```
     {:pre}
   - For secret that needs to be passed in the webhook URL,
     ```sh
      oc get bc openshiftapp -o yaml
     ```
     {:pre}
   - Replace `<secret>` in the webhook GitLab URL with the secret value under *gitlab* in the above command output.
1. Open your private git repo on a browser using the Git repo HTTPS link > Click on **Settings** > Integrations.
1. Paste the **URL** > click **Add webhook**. Test the URL by clicking **Test** > Push events.
1. Update the ImagePolicy of the image stream to query {{site.data.keyword.registryshort_notm}} at a scheduled interval to synchronize tag and image metadata. This will update the `tags` definition
   ```sh
   oc patch imagestream openshiftapp --patch \
   '{"spec":{"tags":[{"from":{"kind":"DockerImage","name":"<REGISTRY_URL>/<REGISTRY_NAMESPACE>/openshiftapp:latest"},"name":"latest","importPolicy":{"scheduled":true}}]}}'
   ```
   {:pre}
1. Open the cloned repo in an IDE to update the `h1` tag of local *public/index.html* file and change it to 'Congratulations! <YOUR_NAME>'.
1. Save and push the code to the repo
   ```sh
    git add public/index.html
    git commit -m "Updated with my name"
    git push -u origin master
   ```
   {:pre}
1. You can check the progress of the build and deploy with `oc status` command. Once the deployment is successful, refresh the route HOST address to see the updated web app.

## Monitor the app

## Scale the app

## Remove resources
{:#cleanup}

* Delete the cluster or only delete the Kubernetes artifacts created for the application if you plan to reuse the cluster.

## Related content

* [IBM Cloud Kubernetes Service](https://{DomainName}/docs/containers?topic=containers-container_index#container_index)
* [Continuous Deployment to Kubernetes](https://{DomainName}/docs/tutorials?topic=solution-tutorials-continuous-deployment-to-kubernetes#continuous-deployment-to-kubernetes)
* [Scaling a deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#scaling-a-deployment)
* [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)
