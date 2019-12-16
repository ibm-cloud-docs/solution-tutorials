---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2019-07-08"
lasttested: "2019-05-23"

---


{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}
{:tip: .tip}


# Continuous Deployment to Kubernetes
{: #continuous-deployment-to-kubernetes}

This tutorial walks you through the process setting up a continuous integration and delivery pipeline for containerized applications running on the {{site.data.keyword.containershort_notm}}.  You will learn how to set up source control, then build, test and deploy the code to different deployment stages. Next, you will add integrations to other services like Slack notifications.

{:shortdesc}

## Objectives
{: #objectives}

<!--##istutorial#-->
* Create development and production Kubernetes clusters.
<!--#/istutorial#-->
* Create a starter application, run it locally and push it to a Git repository.
* Configure the DevOps delivery pipeline to connect to your Git repository, build and deploy the starter app to dev/prod environments.
* Explore and integrate the app to use Slack notifications.

## Services used
{: #services}

This tutorial uses the following {{site.data.keyword.Bluemix_notm}} services:

- [{{site.data.keyword.registrylong_notm}}](https://{DomainName}/kubernetes/registry/main/start)
- [{{site.data.keyword.containershort_notm}}](https://{DomainName}/kubernetes/catalog/cluster)
- [{{site.data.keyword.contdelivery_short}}](https://{DomainName}/catalog/services/continuous-delivery)

<!--##istutorial#-->
This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
<!--#/istutorial#-->

## Architecture
{: #architecture}

![](images/solution21/Architecture.png)

1. The code is pushed to a private Git repository.
2. The pipeline picks up changes in Git and builds container image.
3. The container image is uploaded to registry. The app is deployed to the Development environment.
4. Once changes are validated, the app is deployed to the Production environment.
5. Notifications are sent to Slack to track the deployment activities.

## Before you begin
{: #prereq}

* [Install {{site.data.keyword.dev_cli_notm}}](https://{DomainName}/docs/cli?topic=cloud-cli-getting-started) - Script to install docker, kubectl, helm, ibmcloud cli and required plug-ins.
* [Set up the {{site.data.keyword.registrylong_notm}} CLI and your registry namespace](https://{DomainName}/docs/services/Registry?topic=registry-registry_setup_cli_namespace#registry_setup_cli_namespace).
* [Understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/).

<!--##istutorial#-->
## Create development Kubernetes cluster
{: #create_kube_cluster}

{{site.data.keyword.containershort_notm}} delivers powerful tools by combining Docker and Kubernetes technologies, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

To complete this tutorial you would need to select the **Paid** cluster of type **Standard**. You would be required to setup two clusters, one for development and one for production.
{: shortdesc}

1. Create the first development Kubernetes cluster from the [{{site.data.keyword.Bluemix}} catalog](https://{DomainName}/kubernetes/catalog/cluster/create). Later you will be required to repeat these steps and create a production cluster.

   For ease of use, check the configuration details like the number of CPUs, memory and the number of worker nodes you get.
   {:tip}

   ![](images/solution21/KubernetesPaidClusterCreation.png)

2. Select the **Cluster type** and click **Create Cluster** to provision a Kubernetes cluster. The smallest **Machine type** with 2 **CPUs**, 4 **GB RAM**, and 1 **Worker Nodes** is sufficient for this tutorial. All other options can be left to their defaults.
3. Check the status of your **Cluster** and **Worker Nodes** and wait for them to be **ready**.

**Note:** Do not proceed until your workers are ready.
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
-->
<!--#/isworkshop#-->

## Create a starter application
{: #create_application}

{{site.data.keyword.containershort_notm}} offers a selection of starter applications, these starter applications can be created using the `ibmcloud dev create` command or the web console. In this tutorial, we are going to use the web console. The starter application greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

1. From the [{{site.data.keyword.cloud_notm}} console](https://{DomainName}), use the left side menu option and select [Web Apps](https://{DomainName}/developer/appservice/dashboard).
2. Under **Start from the Web**, section click on the **Get Started** button.
3. Select the `Node.js Web App with Express.js` tile and then `Create app` to create a Node.js starter application.
4. Enter a unique **name** for the application such as `<your-initial>-mynodestarter`. Then, click **Create**.

## Configure DevOps delivery pipeline
{: #create_devops}

Now that you successfully created the starter application, you can automate its deployment to the Kubernetes cluster.

1. Click **Deploy your app**, under the **Configure continuous delivery** tile.
1. Select **{{site.data.keyword.containershort_notm}}** as the **Deployment target**.
1. Select your cluster from the list.
1. Select **Helm** as the **Deployment type**.
1. Define a unique **toolchain name**.
1. Click **Create**.

The toolchain will build your application and deploy it to the cluster.

1. Once the pipeline is created, click the pipeline under **Delivery Pipelines**.
4. After the deploy stages complete, click on **View logs and history** to see the logs.
5. Visit the URL displayed to access the application (`http://worker-public-ip:portnumber/`).
   ![](images/solution21/Logs.png)

## Clone, build and run the application locally
{: #cloneandbuildapp}

In this section, you will use the starter app created in the earlier section, clone it to your local machine, modify the code and then build/run it locally.
{: shortdesc}

### Clone the application
1. From the Toolchain overview, select the **Git** tile under **Code**. You will be redirected to your git repository page where you can clone the repo.![HelloWorld](images/solution21/DevOps_Toolchain.png)

2. If you haven't set up SSH keys yet, you should see a notification bar at the top with instructions. Follow the steps by opening the **add an SSH key** link in a new tab or if you want to use HTTPS instead of SSH, follow the steps by clicking **create a personal access token**. Remember to save the key or token for future reference.
3. Select SSH or HTTPS and copy the git URL. Clone the source to your local machine. If you're prompted for a username, provide your git username. For the password, use an existing **SSH key** or **personal access token** or the one created you created in the previous step.

   ```bash
   git clone <your_repo_url>
   cd <name_of_your_app>
   ```
   {: codeblock}

4. Open the cloned repository in an IDE of your choice and navigate to `public/index.html`. Update the code by trying to change "Congratulations!" to something else and the save the file.

### Build the application locally
You can build and run the application as you normally would using `mvn` for java local development or `npm` for node development.  You can also build a docker image and run the application in a container to ensure consistent execution locally and on the cloud. Use the following steps to build your docker image.
{: shortdesc}

1. Ensure your local Docker engine is started, to check run the command below:
   ```
   docker ps
   ```
   {: codeblock}
2. Navigate to the generated project directory cloned.
   ```
   cd <project name>
   ```
   {: codeblock}
3. Build the application locally.
   ```
   ibmcloud dev build
   ```
   {: codeblock}

   This might take a few minutes to run as all the application dependencies are downloaded and a Docker image, which contains your application and all the required environment, is built.

### Run the application locally

1. Run the container.
   ```
   ibmcloud dev run
   ```
   {: codeblock}

   This uses your local Docker engine to run the docker image that you built in the previous step.
2. After your container starts, go to http://localhost:3000/
   ![](images/solution21/node_starter_localhost.png)

## Push application to your Git repository

In this section, you will commit your change to your Git repository. The pipeline will pick up the commit and push the changes to your cluster automatically.
1. In your terminal window, make sure you are inside the repo you cloned.
2. Push the change to your repository with three simple steps: Add, commit, and push.
   ```bash
   git add public/index.html
   git commit -m "my first changes"
   git push origin master
   ```
   {: codeblock}

3. Go to the toolchain you created earlier and click the **Delivery Pipeline** tile.
4. Notice a new **BUILD** has started.
5. Wait for the **DEPLOY** stage to complete.
6. Click the application **url** under Last Execution result to view your changes live.

If you don't see your application updating, check the logs of the DEPLOY and BUILD stages of your pipeline.

## Deploy to a production environment
{: #deploytoproduction}

In this section, you will complete the deployment pipeline by deploying the application to development and production environments respectively.

There are [different options](https://{DomainName}/docs/tutorials?topic=solution-tutorials-users-teams-applications) to handle the deployment of an application to multiple environments. In this tutorial, you will deploy the application to two different namespaces.

1. Go to the toolchain you created earlier and click the **Delivery Pipeline** tile.
1. Rename the **Deploy Stage** to `Deploy dev` by clicking on settings Icon > **Configure Stage**.
   ![](images/solution21/deploy_stage.png)
1. Clone the **Deploy dev** stage (settings icon > Clone Stage) and name the cloned stage as `Deploy prod`.
5. Change the **stage trigger** to `Run jobs only when this stage is run manually`.
   ![](images/solution21/prod-stage.png)
6. In **Environment properties**, set **CLUSTER_NAMESPACE** to **production**.
7. **Save** the stage.

You now have the full deployment setup. To deploy from dev to production, you must manually run the `Deploy prod` stage. This is a simplification process stage over a more advanced scenario where you would include unit tests and integration tests as part of the pipeline.
   ![](images/solution21/full-deploy.png)

## Setup Slack notifications
{: #setup_slack}

1. Go back to view the list of [toolchains](https://{DomainName}/devops/toolchains) and select your toolchain, then click on **Add a Tool**.
2. Search for slack in the search box or scroll down to see **Slack**. Click to see the configuration page.
    ![](images/solution21/configure_slack.png)
3. For **Slack webhook**, follow the steps in this [link](https://my.slack.com/services/new/incoming-webhook/). You need to login with your Slack credentials and provide an existing channel name or create a new one.
4. Once the Incoming webhook integration is added, copy the **Webhook URL** and paste the same under **Slack webhook**.
5. The slack channel is the channel name you provided while creating a webhook integration above.
6. **Slack team name** is the team-name(first part) of team-name.slack.com. e.g., kube is the team name in kube.slack.com
7. Click **Create Integration**. A new tile will be added to your toolchain.
    ![](images/solution21/toolchain_slack.png)
8. From now on, whenever your toolchain executes, You should see slack notifications in the channel you configured.
    ![](images/solution21/slack_channel.png)

## Remove resources
{: #removeresources}

In this step, you will clean up the resources to remove what you created above.

- Delete the Git repository.
- Delete the toolchain.
<!--##istutorial#-->
- Delete the cluster.
<!--#/istutorial#-->
- Delete the Slack channel.

## Expand the Tutorial
{: #expandTutorial}

Do you want to learn more? Here are some ideas of what you can do next:

- [Analyze logs and monitor application health with LogDNA and Sysdig](https://{DomainName}/docs/tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis).
- Add a 3rd environment dedicated to testing.
- Deploy the production app [across multiple locations](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-webapp#multi-region-webapp).

## Related Content
{: #related}

* End to end Kubernetes solution guide, [moving VM based apps to Kubernetes](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vm-to-containers-and-kubernetes#vm-to-containers-and-kubernetes).
* [Security](https://{DomainName}/docs/containers?topic=containers-security#cluster) for IBM Cloud Container Service.
* Toolchain [integrations](https://{DomainName}/docs/services/ContinuousDelivery?topic=ContinuousDelivery-integrations#integrations).
* Analyze logs and monitor application health with [LogDNA and Sysdig](https://{DomainName}/docs/tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis).


