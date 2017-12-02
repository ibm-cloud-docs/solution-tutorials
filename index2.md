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
        margin: 0 10px 10px 0;
        padding: 10px;
        height: 260px;
        width: 240px;
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.1);
    }
    .solutionBoxContainer {
        display: flex;
        flex-wrap: wrap;
    }
    .solutionBoxTitle {
        margin: 0rem;
    }
</style>
<body>
  <h2>Websites and Web Apps</h2>
  {: #web}
    <div class = "solutionBoxContainer">
        <div class = "solutionBox">
            <a href = "multi-region-webapp.html">
              <h3 class="solutionBoxTitle">Deploy a secure web application across multiple regions</h3>
            </a>
            This tutorial is a walkthrough of how to create, secure, and deploy a web application across multiple regions using a continuous delivery pipeline.
        </div>
        <div class = "solutionBox">
              <a href = "scalable-webapp-kubernetes.html">
                <h3 class="solutionBoxTitle">Scalable web app on Kubernetes</h3>
              </a>
              This tutorial is a walkthrough of how to scaffold a Java web application, run it locally in a container and then deploy it to a IBM Cloud Kubernetes cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.
        </div>
        <div class = "solutionBox">
            <a href = "static-files-cdn.html">
              <h3 class="solutionBoxTitle">Accelerate delivery of static files using Object Storage and CDN</h3>
            </a>
            Host and serve website assets (images, videos, documents) and user generated content in a Cloud Object Storage and use a Content Delivery Network (CDN) for fast and secure delivery to users around the world.
        </div>
        <div class = "solutionBox">
              <a href = "lamp-stack.html">
                <h3 class="solutionBoxTitle">Web Application on LAMP Stack</h3>
              </a>
              This tutorial walks you through the creation of an Ubuntu Linux virtual server, with Apache web server, MySQL, and PHP (the LAMP stack). To see the LAMP server in action, you will install and configure the [WordPress](https://wordpress.org/) open source application.
        </div>
        <div class = "solutionBox">
            <a href = "infrastructure-as-code.html">
              <h3 class="solutionBoxTitle">Automate deployment of environments using Infrastructure as Code</h3>
            </a>
            Use a Schematics template to provision a Linux virtual server, with Apache web server, MySQL, and PHP server (LAMP stack) and Object Storage. You will then configure the template to scale the resources and tune the environment.
        </div>
        <div class = "solutionBox">
              <a href = "mean-stack.html">
                <h3 class="solutionBoxTitle">Modern Web Applications using MEAN stack</h3>
              </a>
              This tutorial walks you through the creation of a web application using the popular MEAN stack. It is composed of a Mongo DB, Express web framework, Angular front end framework and a Node.js runtime.
        </div>
        <div class = "solutionBox">
            <a href = "sql-database.html">
              <h3 class="solutionBoxTitle">SQL Database for Cloud Data</h3>
            </a>
            This tutorial shows how to provision a SQL (relational) database service, create a table, and load a large data set (city information) into the database. Then, we deploy a web app "worldcities" to make use of that data and show how to access the cloud database.
        </div>
        <div class = "solutionBox">
              <a href = "serverless-api-webapp.html">
                <h3 class="solutionBoxTitle">Serverless Web Application and API</h3>
              </a>
              Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.
        </div>
        <div class = "solutionBox">
              <a href = "application-log-analysis.html">
                <h3 class="solutionBoxTitle">Generate, Access and Analyze Application Logs</h3>
              </a>
              Learn how the IBM Cloud Log Analysis service can be used to understand and diagnose activities of an app deployed in the IBM Cloud. Generate, search, analyze and visualize different log types using Elasticsearch and Kibana.
        </div>
        <div class = "solutionBox">
              <a href = "scalable-webapp-kubernetes.html">
                <h3 class="solutionBoxTitle">Create, Secure and Manage REST APIs</h3>
              </a>
              This tutorial demonstrates how to create a new REST API using the LoopBack Node.js API framework and then add management, visibility, security and rate limiting to your API using the API Connect service on IBM Cloud.
        </div>
    </div>
  <h2>Mobile</h2>
  {: #web}
    <div class = "solutionBoxContainer">
        <div class = "solutionBox">
            <a href = "ios-mobile-push-analytics.html">
              <h3 class="solutionBoxTitle">iOS mobile app with Push Notifications and Analytics</h3>
            </a>
            Learn how easy it is to quickly create an iOS Swift application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.
        </div>
        <div class = "solutionBox">
              <a href = "scalable-webapp-kubernetes.html">
                <h3 class="solutionBoxTitle">Android native mobile app with Push Notifications and Analytics</h3>
              </a>
              Learn how easy it is to quickly create an Android native application with high-value mobile services - Push Notifications and Mobile Analytics on IBM Cloud.
        </div>
        <div class = "solutionBox">
            <a href = "serverless-mobile-backend.html">
              <h3 class="solutionBoxTitle">Mobile application with a serverless backend</h3>
            </a>
            Learn how to use Cloud Functions along with other cognitive and data services to build a serverless backend for a mobile application.
        </div>
    </div>
</body>