---
copyright:
  years: 2017, 2018
lastupdated: "2018-02-23"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to implement common patterns based on best practices and proven technologies.

<style>
    .solutionBox {
        margin: 0 10px 20px 0 !important;
        padding: 10px !important;
        width: 100% !important;
        border: 1px #dfe3e6 solid !important;
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2) !important;
    }
    .solutionBoxContainer {
    }
    .solutionBoxTitle {
      margin: 0rem !important;
      font-size: 16px !important;
      margin-bottom: 10px !important;
      font-weight: 600 !important;
    }
    .tag-filter.category {
        background: #aaf9e6 !important;
        color: #238070 !important;
    }
    .tag-filter {
        padding: 3px 12px !important;
        font-size: 12px !important;
        margin-right: 1px !important;
        border-radius: 10px !important;
        white-space: nowrap !important;
        line-height: 1.8rem !important;
    }
    .solutionBoxDescription {
        display:flex !important;
        flex-wrap: wrap !important;
    }
   .solutionBoxTitle a {
      text-decoration-line:none !important;
    }
    .descriptionContainer {
        flex-grow: 1 !important;
        width: 200px !important;
    }
    .architectureDiagramContainer {
        width: 300px !important;
        padding: 0 10px !important;
    }
    .architectureDiagram {
        max-height: 200px !important;
        padding: 5px !important;
    }
</style>
## Websites and Web Apps
{: #websites }

<div class = "solutionBoxContainer">
    <div class = "solutionBox">
        <h3 id="multi-region-webapp.html" class="solutionBoxTitle">
            <a href = "multi-region-webapp.html">Deploy a secure web application across multiple regions</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial is a walkthrough of how to create, secure, and deploy a web application across multiple regions using a continuous delivery pipeline.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Node.js</span>
                    <span class="tag-filter category">Continous Delivery</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution1/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="scalable-webapp-kubernetes.html" class="solutionBoxTitle">
            <a href = "scalable-webapp-kubernetes.html">Scalable web app on Kubernetes</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial is a walkthrough of how to scaffold a Java web application, run it locally in a container and then deploy it to a IBM Cloud Kubernetes cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.</p>
                    <span class="tag-filter category">Docker</span>
                    <span class="tag-filter category">Kubernetes</span>
                    <span class="tag-filter category">Container Registry</span>
                    <span class="tag-filter category">Java</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution2/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="static-files-cdn.html" class="solutionBoxTitle">
            <a href = "static-files-cdn.html">Accelerate delivery of static files using Object Storage and CDN</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Host and serve website assets (images, videos, documents) and user generated content in a Cloud Object Storage and use a Content Delivery Network (CDN) for fast and secure delivery to users around the world.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Node.js</span>
                    <span class="tag-filter category">Content Delivery Network</span>
                    <span class="tag-filter category">Cloud Object Storage</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution3/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="lamp-stack.html" class="solutionBoxTitle">
            <a href = "lamp-stack.html">Web application on LAMP stack</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial walks you through the creation of an Ubuntu Linux virtual server, with Apache web server, MySQL, and PHP (the LAMP stack). To see the LAMP server in action, you will install and configure the WordPress open source application.</p>
                    <span class="tag-filter category">Virtual Servers</span>
                    <span class="tag-filter category">PHP</span>
                    <span class="tag-filter category">WordPress</span>
                    <span class="tag-filter category">Vulnerability Scanner</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution4/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="infrastructure-as-code-terraform.html" class="solutionBoxTitle">
            <a href = "infrastructure-as-code-terraform.html">Automate deployment of environments using Terraform</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Use a terraform configuration to provision a Linux virtual server, with Apache web server, MySQL, and PHP server (LAMP stack) and Object Storage. You will then update the configuration to scale the resources and tune the environment.</p>
                    <span class="tag-filter category">Virtual Servers</span>
                    <span class="tag-filter category">PHP</span>
                    <span class="tag-filter category">Object Storage</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution10/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="highly-available-and-scalable-web-application.html" class="solutionBoxTitle">
            <a href = "highly-available-and-scalable-web-application.html">Use Virtual Servers to build highly available and scalable web app</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial walks you through the creation of a load balancer, two application servers running on Ubuntu with NGINX and PHP installed, one MySQL database server, and durable file storage to store application files and backups.</p>
                    <span class="tag-filter category">Virtual Servers</span>
                    <span class="tag-filter category">Load Balancer</span>
                    <span class="tag-filter category">PHP</span>
                    <span class="tag-filter category">File Storage</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution14/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="mean-stack.html" class="solutionBoxTitle">
            <a href = "mean-stack.html">Modern web application using MEAN stack</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial walks you through the creation of a web application using the popular MEAN stack. It is composed of a Mongo DB, Express web framework, Angular front end framework and a Node.js runtime.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Node.js</span>
                    <span class="tag-filter category">Compose for MongoDB</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution7/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="sql-database.html" class="solutionBoxTitle">
            <a href = "sql-database.html">SQL Database for Cloud Data</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial shows how to provision a SQL (relational) database service, create a table, and load a large data set (city information) into the database. Then, we deploy a web app to make use of that data and show how to access the cloud database.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Python</span>
                    <span class="tag-filter category">Db2 Warehouse</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution5/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="serverless-api-webapp.html" class="solutionBoxTitle">
            <a href = "serverless-api-webapp.html">Serverless web application and API</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.</p>
                    <span class="tag-filter category">Cloud Functions</span>
                    <span class="tag-filter category">API Gateway</span>
                    <span class="tag-filter category">Cloudant NoSQL DB</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution8/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="application-log-analysis.html" class="solutionBoxTitle">
            <a href = "application-log-analysis.html">Analyze logs and monitor health of Cloud Foundry applications</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Learn how the IBM Cloud Log Analysis service can be used to understand and diagnose activities of an app deployed in the IBM Cloud. Generate, search, analyze and visualize different log types using Elasticsearch and Kibana. Understand and diagnose application problems by using the IBM Cloud Log Analysis and Availability Monitoring services.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Python</span>
                    <span class="tag-filter category">Log Analysis</span>
                    <span class="tag-filter category">Availability Monitoring</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution12/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="kubernetes-log-analysis-kibana.html" class="solutionBoxTitle">
            <a href = "kubernetes-log-analysis-kibana.html">Analyze logs and monitor the health of Kubernetes applications</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial walks you through creating a cluster and configuring the Log Analysis and the Monitoring service. Then, you will deploy an application to the cluster, use Kibana to view and analyze logs, and use Grafana to view health and metrics.</p>
                    <span class="tag-filter category">Kubernetes</span>
                    <span class="tag-filter category">Docker</span>
                    <span class="tag-filter category">Node.js</span>
                    <span class="tag-filter category">Log Analysis</span>
                    <span class="tag-filter category">Monitoring</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution17/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="create-manage-secure-apis.html" class="solutionBoxTitle">
            <a href = "create-manage-secure-apis.html">Create, secure and manage REST APIs</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial demonstrates how to create a new REST API using the LoopBack Node.js API framework and then add management, visibility, security and rate limiting to your API using the API Connect service on IBM Cloud.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Node.js</span>
                    <span class="tag-filter category">API Connect</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution13/Architecture.png" />
            </div>
        </div>
    </div>
</div>

## Mobile
{: #mobile }

<div class = "solutionBoxContainer">
    <div class = "solutionBox">
        <h3 id="ios-mobile-push-analytics.html" class="solutionBoxTitle">
            <a href = "ios-mobile-push-analytics.html">iOS mobile app with Push Notifications and Analytics</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Learn how easy it is to quickly create an iOS Swift application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
                    <span class="tag-filter category">iOS</span>
                    <span class="tag-filter category">Swift</span>
                    <span class="tag-filter category">Push Notifications</span>
                    <span class="tag-filter category">Mobile Analytics</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution6/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="android-mobile-push-analytics.html" class="solutionBoxTitle">
            <a href = "android-mobile-push-analytics.html">Android native mobile app with Push Notifications and Analytics</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Learn how easy it is to quickly create an Android native application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
                    <span class="tag-filter category">Android</span>
                    <span class="tag-filter category">Java</span>
                    <span class="tag-filter category">Push Notifications</span>
                    <span class="tag-filter category">Mobile Analytics</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution9/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="hybrid-mobile-push-analytics.html" class="solutionBoxTitle">
            <a href = "hybrid-mobile-push-analytics.html">Hybrid mobile application with Push and Analytics</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Learn how easy it is to quickly create a hybrid Cordova application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
                    <span class="tag-filter category">Cordova</span>
                    <span class="tag-filter category">Push Notifications</span>
                    <span class="tag-filter category">Mobile Analytics</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution15/Architecture.png" />
            </div>
        </div>
    </div>
    <div class = "solutionBox">
        <h3 id="serverless-mobile-backend.html" class="solutionBoxTitle">
            <a href = "serverless-mobile-backend.html">Mobile application with a serverless backend</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Learn how to use Cloud Functions along with other cognitive and data services to build a serverless backend for a mobile application.</p>
                    <span class="tag-filter category">Cloud Functions</span>
                    <span class="tag-filter category">App ID</span>
                    <span class="tag-filter category">Cloudant NoSQL DB</span>
                    <span class="tag-filter category">Watson Tone Analyzer</span>
                    <span class="tag-filter category">Push Notifications</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution11/Architecture.png" />
            </div>
        </div>
    </div>
</div>

## Internet of Things
{: #iot }

<div class = "solutionBoxContainer">
    <div class = "solutionBox">
        <h3 id="gather-visualize-analyze-iot-data.html" class="solutionBoxTitle">
            <a href = "gather-visualize-analyze-iot-data.html">Gather, visualize and analyze IoT data</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>This tutorial walks you thru setting up an IoT device, gathering large amounts of data in the Watson IoT Platform, exploring data and creating visualizations and then using advanced machine learning services to analyze data.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">Internet of Things Platform</span>
                    <span class="tag-filter category">Cloudant</span>
                    <span class="tag-filter category">Data Science Experience</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution16/Architecture.png" />
            </div>
        </div>
    </div>
</div>

## Chatbots
{: #chatbots }

<div class = "solutionBoxContainer">
    <div class = "solutionBox">
        <h3 id="slack-chatbot-database-watson.html" class="solutionBoxTitle">
            <a href = "slack-chatbot-database-watson.html">Build a database-driven Slackbot</a>
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>Build a database-driven Slackbot with IBM Watson Conversation. The Conversation connector, Cloudant and IBM Cloud Functions are used for a serverless integration of the Conversation service with Slack. IBM Cloud Functions are also utilized for server actions within a dialog to reach out to Db2.</p>
                    <span class="tag-filter category">Cloud Foundry</span>
                    <span class="tag-filter category">IBM Watson Conversation</span>
                    <span class="tag-filter category">Cloudant NoSQL DB</span>
                    <span class="tag-filter category">Db2 Warehouse</span>
                    <span class="tag-filter category">IBM Cloud Functions</span>
                    <span class="tag-filter category">Slack</span>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "images/solution19/SlackbotArchitecture.png" />
            </div>
        </div>
    </div>
</div>

