---


copyright:
  years: 2017
lastupdated: "2017-09-28"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Deploy a secure web application across multiple regions

This tutorial is a walkthrough of how to create, secure, and deploy a web application across multiple regions using a continuous delivery pipeline. Among many other starter applications on IBM Cloud, you will be using Node.js starter application for this tutorial.

## Objectives
* Create a starter Node.js application
* Set up source control and continuous delivery
* Deploy to another region
* Map a custom domain to your application
* Bind an SSL certificate to your application

![HelloWorld](images/solution1/Architecture.png)

### Apps and Services
* SDK for Node.js Cloud Foundry App
* Continuous Delivery Service for DevOps

## Create a Node.js application
{: #create}

Start by creating a Node.js starter application which runs in a Cloud Foundry environment.

1.  Click on **Catalog** in the top navigation bar.
2.  Click on **Cloud Foundry Apps** under Platform on the left pane and select **SDK for Node.js** .
     ![](images/solution1/SDKforNodejs.png)
3.  Enter a **unique name** for your application which will also be your hostname. For example: myusername-nodeapp. And click **Create**.
4.  Wait until the application starts and click on the **Visit URL** link on top of the **Overview** page to see your application LIVE on a new tab.

![HelloWorld](images/solution1/HelloWorld.png)

Great start! You have your very own node.js starter application running on IBM Cloud.

Let's push the source code of your application to a repository and deploy your changes automatically.

## Set up source control and continuous delivery
{: #devops}

In this step, you will set up a git source control repository to store your code and then create a pipeline which will deploy any code changes automatically.

1. On the left pane of your application you just created, select **Overview** and scroll down to find **Continuous delivery**. Click on **Enable**.

   ![HelloWorld](images/solution1/Enable_Continuous_Delivery.png)
2. Keep the default options and click **Create**. You should now have a default **toolchain** created.

   ![HelloWorld](images/solution1/DevOps_Toolchain.png)
3. Select **Git** tile under **Code**. You will be taken to your git repository page.
4. If you haven't set up SSH keys yet, you should see a notification bar at the top with instructions. Follow the steps by opening the link **add an SSH key** in a new tab or if you want to use HTTPS instead of SSH, follow the steps by clicking on **create a personal access token**. Remember to save the key or token for future reference.
5. Select SSH or HTTPS and copy the git URL.Clone the source to your local machine.
   ```bash
   git clone <your_repo_url>
   cd <name_of_your_app>
   ```
   **Note:** If asked for username, provide your git username and for password use the **SSH key** or **personal access token** you already have or the one created above.
6. Open the cloned repository in an IDE of your choice and navigate to `public/index.html`. Now, Let's update the code. Try changing "Hello World" to something else.
7. Run the application locally by running the commands one after another
  `npm install`, `npm build`,  `npm start ` and visit ```localhost:<port_number>```in your browser.
  **<port_number>** as displayed on the console.
8. Let's push the change to your repository with three simple steps - Add, Commit and Push.
   ```bash
   git add public/index.html
   git commit -m "my first changes"
   git push origin master
   ```
9. Let's go to the toolchain you created earlier, click on the **Delivery Pipeline** tile.
10. You should see an **BUILD** and **DEPLOY** stage.
  ![HelloWorld](images/solution1/DevOps_Pipeline.png)
11. Wait for the **DEPLOY** stage to complete.
12. Click the application **url** under Last Execution result to view your changes live.

Continue making further changes to your application and periodically commit your changes to your git repository. If you don't see your application updating, check the logs of the DEPLOY and BUILD stages of your pipeline.

## Deploy to another region
{: #deploy_another_region}

Next, we will deploy the same application to a different IBM Cloud region. We can use the same toolchain but will add another DEPLOY stage to handle the deployment of the application to another region.

1. Navigate to Application **Overview** and scroll down to find **View toolchain**.
2. Select **Delivery Pipeline** under Deliver.
3. Click on the **Gear icon** on the **DEPLOY** stage and select **Clone Stage**.
   ![HelloWorld](images/solution1/CloneStage.png)
4. Rename stage to "Deploy to UK" and select **JOBS**.
5. Change **Target** to **United Kingdom**. Create a **space** if you don't have one.
6. Change **Deploy script** to `cf push "${CF_APP}" -d eu-gb.mybluemix.net`

   ![HelloWorld](images/solution1/DeployToUK.png)
7. Click **Save** and run the new stage by clicking on the **Play button**.

## Configure custom domain to your application
{: #add_domain}

When deploying a real world application, you will likely want to use your own domain instead of the IBM-provided mybluemix.net domain.

1. Buy a domain from a registrar such as http://godaddy.com
2. **Switch to the US region** by clicking on your account name in the top navigation bar.
3. Application **Overview** -> **Routes**  -> **Manage Domains**

   ![HelloWorld](images/solution1/ApplicationRoutes.png)
4. Click on **Add Domain** and enter your domain url.
5. Application **Overview** -> **Edit Routes** -> **Choose your domain**.

## Map the custom domain to the IBM Cloud system domain
{: #map_domain}

Map the custom domain name to the secure endpoint for the IBM Cloud region where your application is running.

1. Set up a 'CNAME' record for the custom domain name on your DNS server. Steps for setting up the CNAME record vary depending on your DNS provider. For example, if you are using GoDaddy, you follow the [Domains Help ![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://www.godaddy.com/help/add-a-cname-record-19236)guidance from GoDaddy.
2. Set the CNAME record to the US-South endpoint. `secure.us-south.bluemix.net`
  [Related documentation](https://console.bluemix.net/docs/)

## Bind SSL certificate to your application
{: #ssl}

1. Obtain a SSL certificate. For example, you can purchase from https://www.godaddy.com/web-security/ssl-certificate or generate a free one via https://letsencrypt.org/
2. Navigate to Application **Overview** -> **Routes**  -> **Manage Domains**.
3. Click on SSL Certificate upload button.
4. Upload the certificate.
5. Access your application with https instead of http

## Further Reading

[Adding a Cloudant Database](https://console.bluemix.net/docs/services/Cloudant/tutorials/create_service.html)

[Auto-Scaling Cloud Foundry applications](https://console.bluemix.net/docs/services/Auto-Scaling/index.html)
