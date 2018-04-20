---
copyright:
  years: 2017, 2018
lastupdated: "2018-04-20"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Deploy a secure web application across multiple regions

This tutorial walks you through creating, securing, and deploying a Cloud Foundry application across multiple regions by using a [{{site.data.keyword.contdelivery_short}}](https://console.bluemix.net/catalog/services/continuous-delivery) pipeline. 

Apps or parts of your apps will have outages - it is a fact. It can be a problem in your code, a planned maintenance impacting the resources used by your app, a hardware failure bringing down a zone, a region, a data center where your app is hosted. Any of these will happen and you have to be prepared. With {{site.data.keyword.Bluemix_notm}}, you can deploy your application to [multiple regions](https://console.bluemix.net/docs/overview/ibm-cloud.html#ov_intro_reg) to increase your application resilience. And with your application now running in multiple locations, you can also redirect user traffic to the nearest region to reduce latency.

## Objectives

* Deploy a Cloud Foundry application to multiple regions with {{site.data.keyword.contdelivery_short}}.
* Map a custom domain to the application.
* Bind an SSL certificate to your application.
* Monitor application performance.

## Services used

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.sdk4node}}](https://console.bluemix.net/catalog/starters/sdk-for-nodejs) Cloud Foundry App
* [{{site.data.keyword.contdelivery_short}}](https://console.bluemix.net/catalog/services/continuous-delivery) for DevOps

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

This tutorial involves an active/passive scenario where two copies of the application are deployed in two different regions but only one copy is serving client requests. The DNS configuration initially points to the first region. If the first region fails, the DNS configuration should be updated to point to the other region.

<p style="text-align: center;">

   ![Architecture](./images/solution1/Architecture.png)
</p>

Some DNS providers may include capabilities to detect this situation and automatically route traffic to the other region. Another option would be to deploy a global load balancer in front of the applications and have the load balancer spread the traffic. This tutorial does not explore these options.

## Create a Node.js application
{: #create}

Start by creating a Node.js starter application that runs in a Cloud Foundry environment.

1. Click **[Catalog](https://console.bluemix.net/catalog/)** in the {{site.data.keyword.Bluemix_notm}} console.
2. Click **Cloud Foundry Apps** under the **Platform** category and select **[{{site.data.keyword.sdk4node}}](https://console.bluemix.net/catalog/starters/sdk-for-nodejs)** .
     ![](images/solution1/SDKforNodejs.png)
3. Enter a **unique name** for your application, which will also be your host name, for example: myusername-nodeapp. And click **Create**.
4.  After the application starts, click the **Visit URL** link on the **Overview** page to see your application LIVE on a new tab.

![HelloWorld](images/solution1/HelloWorld.png)

Great start! You have your very own Node.js starter application running in {{site.data.keyword.Bluemix_notm}}.

Next, let's push the source code of your application to a repository and deploy your changes automatically.

## Set up source control and {{site.data.keyword.contdelivery_short}}
{: #devops}

In this step, you set up a git source control repository to store your code and then create a pipeline, which deploys any code changes automatically.

1. On the left pane of your application you just created, select **Overview** and scroll to find **{{site.data.keyword.contdelivery_short}}**. Click **Enable**.

   ![HelloWorld](images/solution1/Enable_Continuous_Delivery.png)
2. Keep the default options and click **Create**. You should now have a default **toolchain** created.

   ![HelloWorld](images/solution1/DevOps_Toolchain.png)
3. Select the **Git** tile under **Code**. You're then directed to your git repository page.
4. If you haven't set up SSH keys yet, you should see a notification bar at the top with instructions. Follow the steps by opening the **add an SSH key** link in a new tab or if you want to use HTTPS instead of SSH, follow the steps by clicking  **create a personal access token**. Remember to save the key or token for future reference.
5. Select SSH or HTTPS and copy the git URL. Clone the source to your local machine.
   ```bash
   git clone <your_repo_url>
   cd <name_of_your_app>
   ```
   **Note:** If you're prompted for a user name, provide your git user name. For the password, use an existing **SSH key** or **personal access token** or the one created you created in the previous step.
6. Open the cloned repository in an IDE of your choice and navigate to `public/index.html`. Now, let's update the code. Try changing "Hello World" to something else.
7. Run the application locally by running the commands one after another
  `npm install`, `npm build`,  `npm start ` and visit ```localhost:<port_number>```in your browser.
  **<port_number>** as displayed on the console.
8. Push the change to your repository with three simple steps: Add, commit, and push.
   ```bash
   git add public/index.html
   git commit -m "my first changes"
   git push origin master
   ```
9. Go to the toolchain you created earlier and click the **Delivery Pipeline** tile.
10. Confirm that you see n **BUILD** and **DEPLOY** stage.
  ![HelloWorld](images/solution1/DevOps_Pipeline.png)
11. Wait for the **DEPLOY** stage to complete.
12. Click the application **url** under Last Execution result to view your changes live.

Continue making further changes to your application and periodically commit your changes to your git repository. If you don't see your application updating, check the logs of the DEPLOY and BUILD stages of your pipeline.

## Deploy to another region
{: #deploy_another_region}

Next, we will deploy the same application to a different {{site.data.keyword.Bluemix_notm}} region. We can use the same toolchain but will add another DEPLOY stage to handle the deployment of the application to another region.

1. Navigate to Application **Overview** and scroll to find **View toolchain**.
2. Select **Delivery Pipeline** from Deliver.
3. Click the **Gear icon** on the **DEPLOY** stage and select **Clone Stage**.
   ![HelloWorld](images/solution1/CloneStage.png)
4. Rename stage to "Deploy to UK" and select **JOBS**.
5. Change **Target** to **United Kingdom**. Create a **space** if you don't have one.
6. Change **Deploy script** to `cf push "${CF_APP}" -d eu-gb.mybluemix.net`

   ![HelloWorld](images/solution1/DeployToUK.png)
7. Click **Save** and run the new stage by clicking the **Play button**.

## Configure custom domain to your application
{: #add_domain}

When deploying a real world application, you will likely want to use your own domain instead of the IBM-provided mybluemix.net domain.

1. Buy a domain from a registrar such as [http://godaddy.com](http://godaddy.com).
2. Switch to the US region by clicking your account name from the menu bar in the {{site.data.keyword.Bluemix_notm}} console.
3. Navigate to Application **Overview** > **Routes** > **Manage Domains**.

   ![HelloWorld](images/solution1/ApplicationRoutes.png)
4. Click **Add Domain** and enter your domain URL.
5. Navigate to Application **Overview** > **Edit Routes** > **Choose your domain**.

## Map the custom domain to the {{site.data.keyword.Bluemix_notm}} system domain
{: #map_domain}

Map the custom domain name to the secure endpoint for the {{site.data.keyword.Bluemix_notm}} region where your application is running.

1. Set up a 'CNAME' record for the custom domain name on your DNS server. The steps for setting up the CNAME record vary depending on your DNS provider. For example, if you are using GoDaddy, you follow the [Domains Help ![External link icon](https://console.bluemix.net/docs/api/content/icons/launch-glyph.svg?lang=en)](https://www.godaddy.com/help/add-a-cname-record-19236)guidance from GoDaddy.
2. Set the CNAME record to the US-South endpoint. `secure.us-south.bluemix.net`
  For more information, see the [related documentation](https://console.bluemix.net/docs/).

## Bind SSL certificate to your application
{: #ssl}

1. Obtain a SSL certificate. For example, you can purchase from https://www.godaddy.com/web-security/ssl-certificate or generate a free one at https://letsencrypt.org/.
2. Navigate to Application **Overview** > **Routes** > **Manage Domains**.
3. Click the SSL Certificate upload button and upload the certificate.
5. Access your application with https instead of http.

## Monitor application performance
{: #monitor}

Lets check the health of your multi-region application.

1. In the application dashboard, select **Monitoring**.
2. Click **View All Tests**
   ![](images/solution1/alert_frequency.png)

Availability Monitoring runs synthetic tests from locations around the world, around the clock to proactively detect and fix performance issues before users are impacted. If you configured a custom route for your application, change the test definition to access your application through its custom domain.

## Remove resources

* Delete the toolchain
* Delete the two Cloud Foundry applications deployed in the two regions
* Delete the DNS configuration

## Related content

[Adding a Cloudant Database](https://console.bluemix.net/docs/services/Cloudant/tutorials/create_service.html)

[Auto-Scaling Cloud Foundry applications](https://console.bluemix.net/docs/services/Auto-Scaling/index.html)
