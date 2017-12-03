---
copyright:
  years: 2017
lastupdated: "2017-11-29"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to implement common patterns based on best practices and proven technologies.

<style>
    .solutionBox {
        margin: 0 10px 20px 0;
        padding: 10px;
        width: 100%;
        border: 1px #dfe3e6 solid;
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
    }
    .solutionBoxContainer {
    }
    .solutionBoxTitle {
      margin: 0rem;
      font-size: 16px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .tag-filter.category {
        background: #aaf9e6;
        color: #238070;
    }
    .tag-filter {
        padding: 3px 12px;
        font-size: 12px;
        margin-right: 1px;
        border-radius: 10px;
    }
   .solutionBoxTitle a {
      text-decoration-line:none;
    }
</style>
<body>
  <h2>Websites and Web Apps</h2>
  {: #websites}
    <div class = "solutionBoxContainer">
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "multi-region-webapp.html">Deploy a secure web application across multiple regions</a>
            </div>
            <p>This tutorial is a walkthrough of how to create, secure, and deploy a web application across multiple regions using a continuous delivery pipeline.</p>
            <span class="tag-filter category">Multiple Regions</span>
            <span class="tag-filter category">Cloud Foundry</span>
            <span class="tag-filter category">Node.js</span>
            <span class="tag-filter category">Continous Delivery</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "scalable-webapp-kubernetes.html">Scalable web app on Kubernetes</a>
            </div>
            <p>This tutorial is a walkthrough of how to scaffold a Java web application, run it locally in a container and then deploy it to a IBM Cloud Kubernetes cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.</p>
            <span class="tag-filter category">Docker</span>
            <span class="tag-filter category">Kubernetes</span>
            <span class="tag-filter category">Container Registry</span>
            <span class="tag-filter category">Java</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "static-files-cdn.html">Accelerate delivery of static files using Object Storage and CDN</a>
            </div>
            <p>Host and serve website assets (images, videos, documents) and user generated content in a Cloud Object Storage and use a Content Delivery Network (CDN) for fast and secure delivery to users around the world.</p>
            <span class="tag-filter category">Cloud Foundry</span>
            <span class="tag-filter category">Node.js</span>
            <span class="tag-filter category">Content Delivery Network</span>
            <span class="tag-filter category">Cloud Object Storage</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "lamp-stack.html">Web Application on LAMP Stack</a>
            </div>
            <p>This tutorial walks you through the creation of an Ubuntu Linux virtual server, with Apache web server, MySQL, and PHP (the LAMP stack). To see the LAMP server in action, you will install and configure the WordPress open source application.</p>
            <span class="tag-filter category">Virtual Servers</span>
            <span class="tag-filter category">PHP</span>
            <span class="tag-filter category">WordPress</span>
            <span class="tag-filter category">Vulnerability Scanner</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "infrastructure-as-code.html">Automate deployment of environments using Infrastructure as Code</a>
            </div>
            <p>Use a Schematics template to provision a Linux virtual server, with Apache web server, MySQL, and PHP server (LAMP stack) and Object Storage. You will then configure the template to scale the resources and tune the environment.</p>
            <span class="tag-filter category">Schematics</span>
            <span class="tag-filter category">Virtual Servers</span>
            <span class="tag-filter category">PHP</span>
            <span class="tag-filter category">Object Storage</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "mean-stack.html">Modern Web Applications using MEAN stack</a>
            </div>
            <p>This tutorial walks you through the creation of a web application using the popular MEAN stack. It is composed of a Mongo DB, Express web framework, Angular front end framework and a Node.js runtime.</p>
            <span class="tag-filter category">Cloud Foundry</span>
            <span class="tag-filter category">Node.js</span>
            <span class="tag-filter category">Compose for MongoDB</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "sql-database.html">SQL Database for Cloud Data</a>
            </div>
            <p>This tutorial shows how to provision a SQL (relational) database service, create a table, and load a large data set (city information) into the database. Then, we deploy a web app `worldcities` to make use of that data and show how to access the cloud database.</p>
            <span class="tag-filter category">Cloud Foundry</span>
            <span class="tag-filter category">Python</span>
            <span class="tag-filter category">Db2 Warehouse</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "serverless-api-webapp.html">Serverless Web Application and API</a>
            </div>
            <p>Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.</p>
            <span class="tag-filter category">Cloud Functions</span>
            <span class="tag-filter category">API Gateway</span>
            <span class="tag-filter category">Cloudant NoSQL DB</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "application-log-analysis.html">Generate, Access and Analyze Application Logs</a>
            </div>
            <p>Learn how the IBM Cloud Log Analysis service can be used to understand and diagnose activities of an app deployed in the IBM Cloud. Generate, search, analyze and visualize different log types using Elasticsearch and Kibana.</p>
            <span class="tag-filter category">Cloud Foundry</span>
            <span class="tag-filter category">Python</span>
            <span class="tag-filter category">Log Analysis</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "create-manage-secure-apis.html">Create, Secure and Manage REST APIs</a>
            </div>
            <p>This tutorial demonstrates how to create a new REST API using the LoopBack Node.js API framework and then add management, visibility, security and rate limiting to your API using the API Connect service on IBM Cloud.</p>
            <span class="tag-filter category">Cloud Foundry</span>
            <span class="tag-filter category">Node.js</span>
            <span class="tag-filter category">API Connect</span>
        </div>
    </div>
  <h2>Mobile</h2>
  {: #mobile}
    <div class = "solutionBoxContainer">
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "ios-mobile-push-analytics.html">iOS mobile app with Push Notifications and Analytics</a>
            </div>
            <p>Learn how easy it is to quickly create an iOS Swift application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
            <span class="tag-filter category">iOS</span>
            <span class="tag-filter category">Swift</span>
            <span class="tag-filter category">Push Notifications</span>
            <span class="tag-filter category">Mobile Analytics</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "android-mobile-push-analytics.html">Android native mobile app with Push Notifications and Analytics</a>
            </div>
            <p>Learn how easy it is to quickly create an Android native application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.</p>
            <span class="tag-filter category">Android</span>
            <span class="tag-filter category">Java</span>
            <span class="tag-filter category">Push Notifications</span>
            <span class="tag-filter category">Mobile Analytics</span>
        </div>
        <div class = "solutionBox">
            <div class="solutionBoxTitle">
              <a href = "serverless-mobile-backend.html">Mobile application with a serverless backend</a>
            </div>
            <p>Learn how to use Cloud Functions along with other cognitive and data services to build a serverless backend for a mobile application.</p>
            <span class="tag-filter category">Cloud Functions</span>
            <span class="tag-filter category">App ID</span>
            <span class="tag-filter category">Cloudant NoSQL DB</span>
            <span class="tag-filter category">Watson Tone Analyzer</span>
            <span class="tag-filter category">Push Notifications</span>
        </div>
    </div>
</body>