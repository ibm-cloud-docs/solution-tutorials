---
copyright:
  years: 2018

lastupdated: "2018-02-16"

---


{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:pre: .pre}
{:tip: .tip}


# Continuous Deployment to Kubernetes

This tutorial walks you thru setting up a continuous deployment and delivery pipeline for containerized applications running in Kubernetes. This will cover the set up of source control, build, test and deploy stages as well as adding integrations such as security scanners, notifications, and analytics.

{:shortdesc}

## Objectives:

* Create a Kubernetes cluster - done

* Create a starter application - done

* Configure DevOps delivery pipeline - done

* Build and run the application locally - done

* Explore vulnerability advisor - pending  

* Setup Slack notifications  - pending  

* ToDo (what more can be added?) - ???

  ​

![](images/solution21/Architecture.png)

ToDo: Need to create an architecture digram

## Prerequisites
{: #prereq}

* [Container registry with namespace configured](https://console.bluemix.net/docs/services/Registry/registry_setup_cli_namespace.html)
* [IBM Cloud Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Script to install docker, kubectl, helm, bx cli and required plug-ins
* [Basic understanding of Kubernetes](https://kubernetes.io/docs/tutorials/kubernetes-basics/)

## Create a Kubernetes cluster
{: #step1}

1. Create **Containers in Kubernetes Clusters** from the [{{site.data.keyword.Bluemix}} catalog](https://console.bluemix.net/containers-kubernetes/launch) and choose the **Lite plan or the paid plan** cluster.
  {:tip}
   ![Kubernetes Cluster Creation on IBM Cloud](images/solution21/KubernetesPaidClusterCreation.png)
2. For convenience, use the name `mycluster` to be consistent with this tutorial.
3. The smallest **Machine Type** with 1 **Worker Nodes** is sufficient for this tutorial. Leave all other options set to defaults.
4. Check the status of your **Cluster** and **Worker Nodes** and wait for them to be **ready**.

**NOTE:** Do not proceed until your workers are ready. This might take up to one hour.

## Create a starter application

{: #create_application}
IBM Cloud offers a selection of starter applications, these starter applications can be created using the `bx dev` command or the web console. In this tutorial, we are going to use the web console. The starter application greatly cuts down on development time by generating application starters with all the necessary boilerplate, build and configuration code so that you can start coding business logic faster.

1. From https://console.bluemix.net, use the left side menu option and select [Web Apps](https://console.bluemix.net/developer/appservice/dashboard).

2. Under **Start from the Web**, section click on the **Get Started** button.

3. Select the `Express.js Basic` and then `Create Project` to create a Node.js starter application.

4. Enter a **name** `mynodestarter` and a unique **hostname** (`username-mynodestarter`) for your project.

5. Done, this will create the starter application, we will later clone the code once setting up the pipeline.


## Configure DevOps delivery pipeline

   1. Now that you successfully created the starter application, under the **Deploy your App**, click on the **Deploy to Cloud** button. ![](images/solution21/Pipeline.png)

   2. Select the cluster you created earlier and then click **Create**. This will create the delivery pipeline and setup the toolchain. ![](images/solution21/BindCluster.png)

   3. Once the pipeline created, click on **View Toolchain** then **Delivery Pipeline** to view the pipeline. ![](images/solution21/Delivery-pipeline.png)

   4.  Once the deploy stages completed, click on the **View logs and history** to see the logs.

   5. Visit the URL displayed to access the application by `http://worker-public-ip:portnumber/`. ![](images/solution21/Logs.png)

## Build and run the application locally

Twana: In progress

In this step, you set up a git source control repository to store your code and then create a pipeline, which deploys any code changes automatically.

1. Keep the default options and click **Create**. You should now have a default **toolchain** created.

   ![HelloWorld](images/solution21/DevOps_Toolchain.png)

2. Select the **Git** tile under **Code**. You're then directed to your git repository page.

3. If you haven't set up SSH keys yet, you should see a notification bar at the top with instructions. Follow the steps by opening the **add an SSH key** link in a new tab or if you want to use HTTPS instead of SSH, follow the steps by clicking  **create a personal access token**. Remember to save the key or token for future reference.

4. Select SSH or HTTPS and copy the git URL. Clone the source to your local machine.

   ```bash
   git clone <your_repo_url>
   cd <name_of_your_app>
   ```

   **Note:** If you're prompted for a user name, provide your git user name. For the password, use an existing **SSH key** or **personal access token** or the one created you created in the previous step.

5. Open the cloned repository in an IDE of your choice and navigate to `public/index.html`. Now, let's update the code. Try changing "Hello World" to something else.

6. Run the application locally by running the commands one after another
   `npm install`, `npm build`,  `npm start ` and visit ```localhost:<port_number>```in your browser.
   **<port_number>** as displayed on the console.

7. Push the change to your repository with three simple steps: Add, commit, and push.

   ```bash
   git add public/index.html
   git commit -m "my first changes"
   git push origin master
   ```

8. Go to the toolchain you created earlier and click the **Delivery Pipeline** tile.

9. Confirm that you see n **BUILD** and **DEPLOY** stage.
   ![](images/solution21/Delivery-pipeline.png)

10. Wait for the **DEPLOY** stage to complete.

11. Click the application **url** under Last Execution result to view your changes live.

Continue making further changes to your application and periodically commit your changes to your git repository. If you don't see your application updating, check the logs of the DEPLOY and BUILD stages of your pipeline.

### Build the application

You can build and run the application as you normally would using `mvn` for java local development or `npm` for node development.  You can also build a docker image and run the application in a container to ensure consistent execution locally and on the cloud. Use the following steps to build your docker image.

1. Ensure your local Docker engine is started.

   ```
   docker ps
   ```

   {: pre}

2. Change to the generated project directory.

   ```
   cd <project name>
   ```

   {: pre}

3. Build the application.

   ```
   bx dev build
   ```

   {: pre}

   This might take a few minutes to run as all the application dependencies are downloaded and a Docker image, which contains your application and all the required environment, is built.


### Run the application locally

1. Run the container.

   ```
   bx dev run
   ```

   {: pre}

   This uses your local Docker engine to run the docker image that you built in the previous step.

2. After your container starts, go to http://localhost:3000/
   ![](images/solution21/node_starter_localhost.png)


## Security using Vulnerability Advisor
{: #vulnerability_advisor}

Vidya: In Progress

[Vulnerability Advisor](https://console.bluemix.net/docs/containers/va/va_index.html) checks the security status of container images before deployment,
and also checks the status of running containers.

1. Go to the toolchain you created earlier and click the **Delivery Pipeline** tile.

2. Click on **Add Stage** and change MyStage to **Validate Stage**.

3. Click on JOBS  > **ADD JOB**.

4. Select **Test** as the Job Type and Change **Test** to **Vulnerability advisor** in the box.

5. Under Tester type, select **Vulnerability Advisor**.

6. All the other fields should be populated automatically.

  Container Registry namespace should be same as the one mentioned in **Build Stage** of this toolchain.
  {:tip}

7. Uncheck **Stop running this stage if this job fails** and click **Save**.

8. Click on Settings ![](images/solution21/settings.png) icon of **Validate Stage** and select **Reorder Stage**.

9. Click on the button with left arrow and then click **Done**.

    ![](images/solution21/toolchain.png)

10. If your code is still open in an IDE or select Eclipse Orion web IDE tile, open `.bluemix/scripts/container_build.sh` and change $BUILD_NUMBER on lines 57 and 59 to **latest**.

11. Commit and Push the changes.

## Setup Slack notifications
{: #setup_slack}

1. Go to the toolchain you created and click on **Add a Tool**.

2. Search for slack in the search box or scroll down to see **Slack**. Click to see the configuration page.

    ![](images/solution21/configure_slack.png)

3. For **Slack webhook**, follow the steps in this [link](https://my.slack.com/services/new/incoming-webhook/). You need to login with your Slack credentials and provide an existing channel name or create a new one.

4. Once the Incoming webhook integration is added, copy the **Webhook URL** and paste the same under **Slack webhook**.

5. **Slack channel** is the channel name your provided while creating a webhook integration above.

6. **Slack team name** is the team-name(first part) of team-name.slack.com. e.g., kube is the team name in kube.slack.com

7. Click **Create Integration**. A new tile will be added to your toolchain.

    ![](images/solution21/toolchain_slack.png)

8. From now on, whenever your toolchain executes, You should see slack notifications in the channel you configured.

    ![](images/solution21/slack_channel.png)

## Expand the Tutorial

ToDo: add info



## Related Content

ToDo: add related content
