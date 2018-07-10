---
copyright:
  years: 2017, 2018
lastupdated: "2018-07-09"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to use IBM Cloud to implement common patterns based on best practices and proven technologies.
<style>
<!--
    #tutorials { /* hide the page header */
        display: none !important
    }
    p.last-updated { /* hide the last updated */
        display: none !important;
    }
    .doesNotExist, #doc-content, #single-content { /* use full width */
        width: calc(100% - 8%) !important;
        max-width: calc(100% - 8%) !important;
    }
    aside.side-nav, #topic-toc-wrapper { /* no need for side-nav */
        display: none !important;
    }
    .detailContentArea { /* use full width */
        max-width: 100% !important;
    }
    .allCategories {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
    }
    .categoryBox {
        flex-grow: 1 !important;
        width: calc(33% - 20px) !important;
        text-decoration: none !important;
        margin: 0 10px 20px 0 !important;
        padding: 20px !important;
        border: 1px #dfe6eb solid !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2) !important;
        text-align: center !important;
        text-overflow: ellipsis !important;
        overflow: hidden !important;
    }
    .solutionBoxContainer {}
    .solutionBoxContainer a {
        text-decoration: none !important;
        border: none !important;
    }
    .solutionBox {
        display: inline-block !important;
        width: 100% !important;
        margin: 0 10px 20px 0 !important;
        padding: 10px !important;
        border: 1px #dfe6eb solid !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2) !important;
    }
    @media screen and (min-width: 960px) {
        .solutionBox {
        width: calc(50% - 3%) !important;
        }
        .solutionBox.solutionBoxFeatured {
        width: calc(50% - 3%) !important;
        }
        .solutionBoxContent {
        height: 270px !important;
        }
    }
    @media screen and (min-width: 1298px) {
        .solutionBox {
        width: calc(33% - 2%) !important;
        }
        .solutionBoxContent {
        min-height: 270px !important;
        }
    }
    .solutionBox:hover {
        border-color: rgb(136, 151, 162) !important;
    }
    .solutionBoxContent {
        display: flex !important;
        flex-direction: column !important;
    }
    .solutionBoxTitle {
        margin: 0rem !important;
        margin-bottom: 5px !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        line-height: 16px !important;
        height: 37px !important;
        text-overflow: ellipsis !important;
        overflow: hidden !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
    }
    .solutionBoxDescription {
        flex-grow: 1 !important;
        display: flex !important;
        flex-direction: column !important;
    }
    .descriptionContainer {
    }
    .descriptionContainer p {
        margin: 0 !important;
        overflow: hidden !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 4 !important;
        -webkit-box-orient: vertical !important;
        font-size: 12px !important;
        font-weight: 400 !important;
        line-height: 1.5 !important;
        letter-spacing: 0 !important;
        max-height: 70px !important;
    }
    .architectureDiagramContainer {
        flex-grow: 1 !important;
        min-width: 250px !important;
        padding: 0 10px !important;
        text-align: center !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
    }
    .architectureDiagram {
        max-height: 175px !important;
        padding: 5px !important;
        margin: 0 auto !important;
    }
-->
</style>

## Featured Tutorials
<div class = "solutionBoxContainer">
    <a href = "multi-region-k8s-cis.html">
    <div class = "solutionBox solutionBoxFeatured">
        <div class = "solutionBoxContent">
            <h3 id="multi-region-k8s-cis.html" class="solutionBoxTitle">
                Resilient and secure multi-region Kubernetes clusters
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Integrate Cloud Internet Services with Kubernetes clusters to deliver a resilient and secure solution across multiple regions.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution32-multi-region-k8s-cis/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "slack-chatbot-database-watson.html">
    <div class = "solutionBox solutionBoxFeatured">
        <div class = "solutionBoxContent">
            <h3 id="slack-chatbot-database-watson.html" class="solutionBoxTitle">
                Build a database-driven Slackbot
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a database-driven Slackbot with IBM Watson Assistant, Cloudant and IBM Cloud Functions.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution19/SlackbotArchitecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Websites and Web Apps
{: #websites }

<div class = "solutionBoxContainer">
    <a href = "multi-region-webapp.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="multi-region-webapp.html" class="solutionBoxTitle">
                Secure web application across multiple regions
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create, secure, deploy, and load balance a web application across multiple regions using a continuous delivery pipeline.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution1/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "scalable-webapp-kubernetes.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="scalable-webapp-kubernetes.html" class="solutionBoxTitle">
                Scalable web app on Kubernetes
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Scaffold a Java web application, run it locally in a container and then deploy it to a IBM Cloud Kubernetes cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution2/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "multi-region-k8s-cis.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="multi-region-k8s-cis.html" class="solutionBoxTitle">
                Resilient and secure multi-region Kubernetes clusters
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Integrate Cloud Internet Services with Kubernetes clusters to deliver a resilient and secure solution across multiple regions.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution32-multi-region-k8s-cis/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "kubernetes-log-analysis-kibana.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="kubernetes-log-analysis-kibana.html" class="solutionBoxTitle">
                Analyze logs and monitor the health of Kubernetes applications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a cluster and configuring the Log Analysis and the Monitoring service. Use Kibana to view and analyze logs and Grafana to view health and metrics.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution17/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "vm-to-containers-and-kubernetes.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="vm-to-containers-and-kubernetes.html" class="solutionBoxTitle">
                Move a VM based application to Kubernetes
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Take a VM based application, containerize it, deploy it to a Kubernetes cluster. Use the steps as a general guides for other applications.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution30/modern_architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "continuous-deployment-to-kubernetes.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="continuous-deployment-to-kubernetes.html" class="solutionBoxTitle">
                Continuous Deployment to Kubernetes
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Set up a continuous integration and delivery pipeline for containerized applications running on the {{site.data.keyword.containershort_notm}}. Add integrations to other services like security scanners, Slack notifications, and analytics.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution21/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "static-files-cdn.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="static-files-cdn.html" class="solutionBoxTitle">
                Accelerate delivery of static files using Object Storage and CDN
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Host and serve website assets (images, videos, documents) and user generated content in a Cloud Object Storage and use a Content Delivery Network (CDN) for fast and secure delivery to users around the world.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution3/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "pub-sub-object-storage.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="pub-sub-object-storage.html" class="solutionBoxTitle">
                Asynchronous data processing using object storage and pub/sub messaging
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use the Apache Kafka based Message Hub to orchestrate workloads between microservices running in a Kubernetes cluster and store data in Object Storage.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution25/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "lamp-stack.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="lamp-stack.html" class="solutionBoxTitle">
                Web application on LAMP stack
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create an Ubuntu Linux virtual server, with Apache web server, MySQL, and PHP. Then install and configure the WordPress open source application on the LAMP stack.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution4/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "infrastructure-as-code-terraform.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="infrastructure-as-code-terraform.html" class="solutionBoxTitle">
                Deploy a LAMP stack using Terraform
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use Terraform to provision a Linux virtual server, with Apache web server, MySQL, PHP and the IBM Cloud Object Storage service. Update the configuration to scale the resources and tune the environment.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution10/architecture-2.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "plan-create-update-deployments.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="plan-create-update-deployments.html" class="solutionBoxTitle">
                Plan, create and update deployment environments
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Automate the creation and maintenance of multiple deployment environments with IBM Cloud CLI and Terraform.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution26-plan-create-update-deployments/architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "highly-available-and-scalable-web-application.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="highly-available-and-scalable-web-application.html" class="solutionBoxTitle">
                Use Virtual Servers to build highly available and scalable web app
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a load balancer, two application servers running on Ubuntu with NGINX and PHP installed, one MySQL database server, and durable file storage to store application files and backups.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution14/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "mean-stack.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="mean-stack.html" class="solutionBoxTitle">
                Modern web application using MEAN stack
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a web application using the popular MEAN stack - Mongo DB, Express, Angular, Node.js. Run the app locally, create and use a database-as-a-service, deploy the app and monitor the application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution7/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "sql-database.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="sql-database.html" class="solutionBoxTitle">
                SQL Database for Cloud Data
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Provision a SQL relational database service, create a table, and load a large data set into the database. Deploy a web app to make use of that data and show how to access the cloud database.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution5/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "serverless-api-webapp.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="serverless-api-webapp.html" class="solutionBoxTitle">
                Serverless web application and API
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution8/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "application-log-analysis.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="application-log-analysis.html" class="solutionBoxTitle">
                Analyze logs and monitor health of Cloud Foundry applications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use IBM Cloud Log Analysis to understand and diagnose application activities. Generate, search, analyze and visualize different log types using Elasticsearch and Kibana.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution12/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "create-manage-secure-apis.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="create-manage-secure-apis.html" class="solutionBoxTitle">
                Create, secure and manage REST APIs
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a new REST API using the LoopBack Node.js API framework. Add management, visibility, security and rate limiting to the API using the API Connect service on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution13/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Chatbots
{: #chatbots }

<div class = "solutionBoxContainer">
    <a href = "slack-chatbot-database-watson.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="slack-chatbot-database-watson.html" class="solutionBoxTitle">
                Build a database-driven Slackbot
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a database-driven Slackbot with IBM Watson Assistant, Cloudant and IBM Cloud Functions.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution19/SlackbotArchitecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "android-watson-chatbot.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="android-watson-chatbot.html" class="solutionBoxTitle">
                Build a voice-enabled Android chatbot
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Define intents, entities and build a dialog flow for the chatbot to respond to customer&#x27;s queries. Enable speech to text and text to speech services for easy interaction with the Android app.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution28-watson-chatbot-android/architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Mobile
{: #mobile }

<div class = "solutionBoxContainer">
    <a href = "ios-mobile-push-analytics.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="ios-mobile-push-analytics.html" class="solutionBoxTitle">
                iOS mobile app with Push Notifications and Analytics
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create an iOS Swift application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution6/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "android-mobile-push-analytics.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="android-mobile-push-analytics.html" class="solutionBoxTitle">
                Android native mobile app with Push Notifications and Analytics
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Write an Android native application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution9/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "hybrid-mobile-push-analytics.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="hybrid-mobile-push-analytics.html" class="solutionBoxTitle">
                Hybrid mobile application with Push and Analytics
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Develop a hybrid Cordova application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution15/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "serverless-mobile-backend.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="serverless-mobile-backend.html" class="solutionBoxTitle">
                Mobile application with a serverless backend
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use Cloud Functions with cognitive and data services to build a serverless backend for a mobile application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution11/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Machine Learning and Analytics
{: #ml }

<div class = "solutionBoxContainer">
    <a href = "smart-data-lake.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="smart-data-lake.html" class="solutionBoxTitle">
                Build a data lake with Object Storage
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Provide tools to data scientists to query data using SQL Query and conduct analysis in Watson Studio. Share data and insights through interactive charts using {{site.data.keyword.dynamdashbemb_short}}.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution29/architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "serverless-github-traffic-analytics.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="serverless-github-traffic-analytics.html" class="solutionBoxTitle">
                Combining serverless and Cloud Foundry for data retrieval and analytics
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Automatically collect GitHub traffic statistics for repositories, store them in a SQL database and get started with traffic analytics.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution24-github-traffic-analytics/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "create-deploy-retrain-machine-learning-model.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="create-deploy-retrain-machine-learning-model.html" class="solutionBoxTitle">
                Build, deploy, test, and retrain a predictive machine learning model
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a predictive machine learning model, deploy it as an API, test and retrain the model with feedback data.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution22-build-machine-learning-model/architecture_diagram.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "big-data-analytics-spark.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="big-data-analytics-spark.html" class="solutionBoxTitle">
                Analyze and visualize open data with Apache Spark
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Analyze and visualize open data sets using a Jupyter Notebook. Uses the Apache Spark service with IBM Watson Studio and Pixiedust to generate graphics.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution23/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Internet of Things
{: #iot }

<div class = "solutionBoxContainer">
    <a href = "gather-visualize-analyze-iot-data.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="gather-visualize-analyze-iot-data.html" class="solutionBoxTitle">
                Gather, visualize and analyze IoT data
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Set up an IoT device, gather large amounts of data in the Watson IoT Platform, analyze data with machine learning and create visualizations.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution16/Architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Identity and Access Management
{: #iam }

<div class = "solutionBoxContainer">
    <a href = "users-teams-applications.html">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 id="users-teams-applications.html" class="solutionBoxTitle">
                Best practices for organizing users, teams, applications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>An overview of the concepts available in IBM Cloud to manage identity and access management and how they can be implemented to support the multiple development stages of an application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution20-users-teams-applications/architecture.png" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

