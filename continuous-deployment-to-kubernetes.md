---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-01-02"
lasttested: "2022-11-30"

content-type: tutorial
services: containers, Registry, ContinuousDelivery
account-plan: paid
completion-time: 1h

---


{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}
{:tip: .tip}


# Continuous Deployment to Kubernetes
{: #continuous-deployment-to-kubernetes}
{: toc-content-type="tutorial"}
{: toc-services="containers, Registry, ContinuousDelivery"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through the process setting up a continuous integration and delivery pipeline for containerized applications running on the {{site.data.keyword.containershort_notm}}.  You will learn how to set up source control, then build, test and deploy the code to different deployment stages. Next, you will add integrations to other services like Slack notifications.
{: shortdesc}

## Objectives
{: #continuous-deployment-to-kubernetes-objectives}

<!--##istutorial#-->
* Create development and production Kubernetes clusters.
<!--#/istutorial#-->
* Create a starter application, run it locally and push it to a Git repository.
* Configure the DevOps delivery pipeline to connect to your Git repository, build and deploy the starter app to dev/prod environments.
* Explore and integrate the app to use Slack notifications.

![Architecture diagram](images/solution21/Architecture.png){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

1. The code is pushed to a private Git repository.
2. The pipeline picks up changes in Git and builds container image.
3. The container image is uploaded to registry. The app is deployed to the Development environment.
4. Once changes are validated, the app is deployed to the Production environment.
5. Notifications are sent to Slack to track the deployment activities.

<!--##istutorial#-->
## Before you begin
{: #continuous-deployment-to-kubernetes-prereq}

This tutorial requires:
- [set up a registry namespace](/docs/Registry?topic=Registry-registry_setup_cli_namespace#registry_namespace_setup)
- and [understand the basics of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/).

## Create development Kubernetes cluster
{: #continuous-deployment-to-kubernetes-create_kube_cluster}
{: step}

{{site.data.keyword.containershort_notm}} delivers powerful tools by combining Docker and Kubernetes technologies, an intuitive user experience, and built-in security and isolation to automate the deployment, operation, scaling, and monitoring of containerized apps in a cluster of compute hosts.

Create a cluster:
1. Open [kubernetes clusters](https://{DomainName}/kubernetes/clusters) or navigate to Kubernetes > Clusters from the left hamburger navigation menu.
2. Click **Create a cluster**.
3. Choose **Standard** plan, Default Kubernetes **version**, **Classic** infrastructure.
4. Choose desired resource group.
5. Choose desired Geography, Availability and Metro.
6. One zone, one worker node per zone and the smallest **flavor** with 2 **CPUs**, 4 **GB RAM**, and 1 **Worker Nodes** is sufficient for this tutorial.
7. Master service endpoint of **Public endpoint only**.
8. Choose a cluster name that you can remember.

**Note:** Do not proceed until your workers are ready.
<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Log in {{site.data.keyword.cloud_notm}}
{: #continuous-deployment-to-kubernetes-access-cluster}
{: step}

1. Open the [{{site.data.keyword.cloud_notm}} console](https://{DomainName}).
2. Switch to the account where you have been invited.
-->
<!--#/isworkshop#-->

## Create a starter application
{: #continuous-deployment-to-kubernetes-create_application}
{: step}

{{site.data.keyword.containershort_notm}} offers a selection of starter applications to generate all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.  The cloud console is used in this example but the ibmcloud cli, `ibmcloud dev create`, is also available.

1. From the [{{site.data.keyword.cloud_notm}} console](https://{DomainName}), use the left side menu option and select [DevOps](https://{DomainName}/devops).
2. Click **Create toolchain**.
3. Under the left hand column, select **Kubernetes** as a filter.
4. Click on the **Develop a Kubernetes app with Helm** tile.
5. Enter a unique **Toolchain Name** for the toolchain such as `<your-initials>-mynodestarter-toolchain` and select a resource group.
6. Enter a unique **Repository Name** for the repository such as `<your-initials>-mynodestarter-repository`.
7. Click on the **Delivery Pipeline** tab.
8. Provide an {{site.data.keyword.Bluemix_notm}} API Key. If you don't have one, create by clicking on **New**.
9. Select a region and your cluster from the list.
10. Make sure to set the cluster namespace to `default` and click **Create**.

The toolchain will build your application and deploy it to the cluster.

1. Once the pipeline is created, click the pipeline under **Delivery Pipelines**.
1. After the DEPLOY stage passes, click on **View logs and history** to see the logs.
1. Scroll to the bottom of the log and visit the URL displayed to access the application (`http://worker-public-ip:portnumber/`).
   ![Screen capture showing how to find the IP address](images/solution21/Logs.png){: caption="How to find the IP address" caption-side="bottom"}

## Modify the application and deploy the updates
{: #continuous-deployment-to-kubernetes-6}
{: step}

1. Follow the breadcrumbs on the upper left of the screen and click on the first entry after of `<your-initials>-mynodestarter` after `Toolchains`.
1. Click the link under the **Repositories** tile, a new browser tab will open to the repository.
1. Click on the `utils.js` file and then click on **Edit**. 
1. Make a simple change, for example change "Welcome to" to something else.
1. Enter a commit message: *my first changes* and click on **Commit changes**.
1. Return to the previous tab showing the toolchain.
1. Click on the **Delivery Pipeline** tile named **ci-pipeline**.
1. Notice a new **BUILD** has started.
1. Wait for the **DEPLOY** stage to complete.
1. After the DEPLOY stage passes, click on **View logs and history** to see the logs and open the application.
1. Scroll to the bottom of the log and visit the URL displayed to access the application (`http://worker-public-ip:portnumber/`).

If you don't see your application updating, confirm all the steps passed and review their respective logs.

**Note:** If you prefer to work locally for making and viewing updates to the application, you can  clone the repository to your own environment for editing and use `ibmcloud dev build` and `ibmcloud dev run` to view the changes locally before pushing them back to the repository. Once your changes are pushed to the repository they will also trigger a build in the **Delivery Pipeline**.

## Deploy to a production environment
{: #continuous-deployment-to-kubernetes-deploytoproduction}
{: step}

In this section, you will complete the deployment pipeline by deploying the application to development and production environments respectively.

There are [different options](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-users-teams-applications) to handle the deployment of an application to multiple environments. In this tutorial, you will deploy the application to two different namespaces.

1. Go to the toolchain you created earlier and click the **Delivery Pipeline** tile.
2. Rename the **DEPLOY** stage to `Deploy dev` by clicking on the settings icon, then **Configure Stage**.
   ![Access the settings Icon](images/solution21/deploy_stage.png){: caption="Access the settings Icon" caption-side="bottom"}
3. To save the changes scroll down and click **Save**.
4. Clone the **Deploy dev** stage (settings icon > Clone Stage) and name the cloned stage as `Deploy prod`.
5. On the **Input** panel change the **stage trigger** to `Run jobs only when this stage is run manually`.
6. In **Environment properties** panel, set **CLUSTER_NAMESPACE** to **production**.
7. **Save** the stage.
8. Click the **Play** button on the **Deploy prod** stage just created.

You now have the full deployment setup. To deploy from dev to production, you must manually run the `Deploy prod` stage. This is a simplification process stage over a more advanced scenario where you would include unit tests and integration tests as part of the pipeline.
   ![Toolchain with dev and prod stages](images/solution21/full-deploy.png){: caption="Toolchain with dev and prod stages" caption-side="bottom"}

You now have the full deployment setup. To deploy from dev to test, you manually run the `Run Pipeline`. This is a simplification process stage over a more advanced scenario where you would include unit tests, integration tests and automated deployment as part of the pipeline. 

## Setup Slack notifications
{: #continuous-deployment-to-kubernetes-setup_slack}
{: step}

1. For **Slack webhook**, follow the steps in this [link](https://api.slack.com/messaging/webhooks). You need to login with your Slack credentials and provide an existing channel name or create a new one. Copy the **Webhook URL** for later use.
2. Go back to view the list of [toolchains](https://{DomainName}/devops/toolchains) and select your toolchain, then click on **Add**.
3. Search for Slack in the search box or scroll down to see **Slack**. Click to see the configuration page.
    ![Configure the Slack integration](images/solution21/configure_slack.png){: caption="Configure the Slack integration" caption-side="bottom"}
4. Once the Incoming webhook integration is added, copy the **Webhook URL** captured earlier and paste under **Slack webhook**.
5. The Slack channel is the channel name you provided while creating a webhook integration above.
6. **Slack team name** is the team-name(first part) of team-name.slack.com. for example, kube is the team name in kube.slack.com
7. Click **Create Integration**. A new tile will be added to your toolchain.
    ![Toolchain with new Slack integration](images/solution21/toolchain_slack.png){: caption="Toolchain with new Slack integration" caption-side="bottom"}
8. From now on, whenever your toolchain executes, you should see Slack notifications in the channel you configured.
    ![Slack app with notification](images/solution21/slack_channel.png){: caption="Slack app with notification" caption-side="bottom"}

## Remove resources
{: #continuous-deployment-to-kubernetes-removeresources}
{: step}

In this step, you will clean up the resources to remove what you created above.

- Delete the Git repository.
   - Back to the toolchain, click  the link under the **Repositories** tile, a new browser tab will open to the repository.
   - In the git repository: select **Settings** on the right then **General** > **Advanced** > **Delete Project**.
- Delete the toolchain.
- Delete the images from the [{{site.data.keyword.registryshort}}](https://{DomainName}/registry/images).
<!--##istutorial#-->
- Delete the cluster.
<!--#/istutorial#-->
- Delete the Slack channel.

## Expand the Tutorial
{: #continuous-deployment-to-kubernetes-expandTutorial}

Do you want to learn more? Here are some ideas of what you can do next:

- [Analyze logs and monitor application health](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis).
- Add a 3rd environment dedicated to testing.

## Related Content
{: #continuous-deployment-to-kubernetes-related}

* End to end Kubernetes solution guide, [moving VM based apps to Kubernetes](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vm-to-containers-and-kubernetes#vm-to-containers-and-kubernetes).
* [Security](https://{DomainName}/docs/containers?topic=containers-security) for {{site.data.keyword.containerlong_notm}}.
* Toolchain [integrations](https://{DomainName}/docs/ContinuousDelivery?topic=ContinuousDelivery-integrations#integrations).
* Analyze logs and monitor [application health](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis).


