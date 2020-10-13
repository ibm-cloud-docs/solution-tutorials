---
copyright:
  years: 2017, 2018, 2019, 2020
lastupdated: "2020-10-13"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to use IBM Cloud to implement common patterns based on best practices and proven technologies.
<style>
<!--
    #tutorials { /* hide the page header */
        display: none !important;
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
        -webkit-box-align: inherit !important;
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
        max-width: 100% !important;
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
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-site2site-vpn#vpc-site2site-vpn">
    <div class = "solutionBox solutionBoxFeatured">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Use a VPC/VPN gateway for secure and private on-premises access to cloud resources
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Connect a Virtual Private Cloud to another computing environment over a secure Virtual Private Network and consume IBM Cloud services.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution46-vpc-vpn/ArchitectureDiagram.png" alt="Architecture diagram for the solution Use a VPC/VPN gateway for secure and private on-premises access to cloud resources" />
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-scalable-webapp-openshift#scalable-webapp-openshift">
    <div class = "solutionBox solutionBoxFeatured">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Scalable web app on OpenShift
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Scaffold a nodejs web application, run it locally in a container and then deploy it to an OpenShift cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution50-scalable-webapp-openshift/Architecture.png" alt="Architecture diagram for the solution Scalable web app on OpenShift" />
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Websites and Web Apps
{: #websites }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-scalable-webapp-kubernetes#scalable-webapp-kubernetes">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Scalable web app on Kubernetes
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Scaffold a Java web application, run it locally in a container and then deploy it to a Kubernetes cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution2/Architecture.png" alt="Architecture diagram for the solution Scalable web app on Kubernetes"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vm-to-containers-and-kubernetes#vm-to-containers-and-kubernetes">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Move a VM based application to Kubernetes
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Take a VM based application, containerize it, deploy it to a Kubernetes cluster. Use the steps as a general guides for other applications.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution30/modern_architecture.png" alt="Architecture diagram for the solution Move a VM based application to Kubernetes"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-strategies-for-resilient-applications#strategies-for-resilient-applications">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Strategies for resilient applications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Regardless of the Compute option: Kubernetes, Cloud Foundry, Cloud Functions or Virtual Servers, enterprises seek to minimize downtime and create resilient architectures that achieve maximum availability.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution39/Architecture.png" alt="Architecture diagram for the solution Strategies for resilient applications"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-continuous-deployment-to-kubernetes#continuous-deployment-to-kubernetes">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Continuous Deployment to Kubernetes
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Set up a continuous integration and delivery pipeline for containerized applications running on a Kubernetes cluster. Add integrations to other services like security scanners, Slack notifications, and analytics.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution21/Architecture.png" alt="Architecture diagram for the solution Continuous Deployment to Kubernetes"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-scalable-webapp-openshift#scalable-webapp-openshift">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Scalable web app on OpenShift
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Scaffold a nodejs web application, run it locally in a container and then deploy it to an OpenShift cluster. Additionally, bind a custom domain, monitor the health of the environment and scale.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution50-scalable-webapp-openshift/Architecture.png" alt="Architecture diagram for the solution Scalable web app on OpenShift"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-openshift-service-mesh#openshift-service-mesh">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Service Mesh on OpenShift
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Install Red Hat OpenShift Service Mesh alongside microservices for a sample app called BookInfo in a Red Hat OpenShift on IBM Cloud cluster.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution57-openshift-service-mesh/Architecture.png" alt="Architecture diagram for the solution Service Mesh on OpenShift"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-openshift-microservices#openshift-microservices">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Deploy microservices with OpenShift
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Deploy microservices to an OpenShift cluster, view their logs and metrics, use an operator to provision IBM Cloud services.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution55-openshift-microservices/Architecture.png" alt="Architecture diagram for the solution Deploy microservices with OpenShift"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-static-files-cdn#static-files-cdn">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Accelerate delivery of static files using Object Storage and CDN
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Host and serve website assets (images, videos, documents) and user generated content in a Cloud Object Storage and use a Content Delivery Network (CDN) for fast and secure delivery to users around the world.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution3/Architecture.png" alt="Architecture diagram for the solution Accelerate delivery of static files using Object Storage and CDN"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-dynamic-content-cdn#dynamic-content-cdn">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Accelerate a dynamic website using Dynamic Content Acceleration
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use Dynamic Content Acceleration to reduce latency for dynamic and uncacheable contents of your web application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution52-cdn-dca/solution_52_architecture.png" alt="Architecture diagram for the solution Accelerate a dynamic website using Dynamic Content Acceleration"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-pub-sub-object-storage#pub-sub-object-storage">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Asynchronous data processing using object storage and pub/sub messaging
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use the Apache Kafka based Message Hub to orchestrate workloads between microservices running in a Kubernetes cluster and store data in Object Storage.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution25/Architecture.png" alt="Architecture diagram for the solution Asynchronous data processing using object storage and pub/sub messaging"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-plan-create-update-deployments#plan-create-update-deployments">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Plan, create and update deployment environments
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Automate the creation and maintenance of multiple deployment environments with IBM Cloud CLI and Terraform.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution26-plan-create-update-deployments/architecture.png" alt="Architecture diagram for the solution Plan, create and update deployment environments"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#highly-available-and-scalable-web-application">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Use Virtual Servers to build highly available and scalable web app
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a load balancer, two application servers running on Ubuntu with NGINX and PHP installed, one MySQL database server, and durable file storage to store application files and backups.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution14/Architecture.png" alt="Architecture diagram for the solution Use Virtual Servers to build highly available and scalable web app"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-mean-stack#mean-stack">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Modern web application using MEAN stack
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a web application using the popular MEAN stack - Mongo DB, Express, Angular, Node.js. Run the app locally, create and use a database-as-a-service, deploy the app and monitor the application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution7/Architecture.png" alt="Architecture diagram for the solution Modern web application using MEAN stack"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-sql-database#sql-database">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                SQL Database for Cloud Data
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Provision a SQL relational database service, create a table, and load a large data set into the database. Deploy a web app to make use of that data and show how to access the cloud database.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution5/Architecture.png" alt="Architecture diagram for the solution SQL Database for Cloud Data"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-serverless-api-webapp#serverless-api-webapp">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Serverless web application and API
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution8/Architecture.png" alt="Architecture diagram for the solution Serverless web application and API"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-multi-region-serverless#multi-region-serverless">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Deploy serverless apps across multiple regions
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use Cloud Functions and Internet Services to build globally available and secure serverless applications.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution44-multi-region-serverless/Architecture.png" alt="Architecture diagram for the solution Deploy serverless apps across multiple regions"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Analyze logs and monitor application health with LogDNA and Sysdig
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use IBM Log Analysis with LogDNA to understand and diagnose application activities. Monitor applications with IBM Cloud Monitoring with Sysdig.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution12/Architecture.png" alt="Architecture diagram for the solution Analyze logs and monitor application health with LogDNA and Sysdig"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-image-classification-code-engine#image-classification-code-engine">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Visual Recognition with Code Engine
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a Code Engine project and deploy an image classification application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution54-code-engine/architecture_diagram.png" alt="Architecture diagram for the solution Visual Recognition with Code Engine"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Chatbots
{: #chatbots }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-slack-chatbot-database-watson#slack-chatbot-database-watson">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Build a database-driven Slackbot
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a database-driven Slackbot with IBM Watson Assistant, Cloudant and IBM Cloud Functions.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution19/SlackbotArchitecture.png" alt="Architecture diagram for the solution Build a database-driven Slackbot"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-android-watson-chatbot#android-watson-chatbot">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Build a voice-enabled Android chatbot
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Define intents, entities and build a dialog flow for the chatbot to respond to customer's queries. Enable speech to text and text to speech services for easy interaction with the Android app.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution28-watson-chatbot-android/architecture.png" alt="Architecture diagram for the solution Build a voice-enabled Android chatbot"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Security
{: #security }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-multi-region-webapp#multi-region-webapp">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Secure web application across multiple regions
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create, secure, deploy, and load balance a web application across multiple regions using a continuous delivery pipeline.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution1/Architecture.png" alt="Architecture diagram for the solution Secure web application across multiple regions"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-multi-region-k8s-cis#multi-region-k8s-cis">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Resilient and secure multi-region Kubernetes clusters
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Integrate Cloud Internet Services with Kubernetes clusters to deliver a resilient and secure solution across multiple regions.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution32-multi-region-k8s-cis/Architecture.png" alt="Architecture diagram for the solution Resilient and secure multi-region Kubernetes clusters"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-create-manage-secure-apis#create-manage-secure-apis">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Create, secure and manage REST APIs
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a new REST API using the LoopBack Node.js API framework. Add management, visibility, security and rate limiting to the API using the API Connect service on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution13/Architecture.png" alt="Architecture diagram for the solution Create, secure and manage REST APIs"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-cloud-e2e-security#cloud-e2e-security">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Apply end to end security to a cloud application
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a secure cloud application that features data encrypted with your own keys, user authentication, and security auditing.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution34-cloud-e2e-security/Architecture.png" alt="Architecture diagram for the solution Apply end to end security to a cloud application"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-extended-app-security#extended-app-security">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Enhance security of your deployed application
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Enhance security of your cloud application by isolating compute, network and runtime resources.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution51-extended-app-security/Sol51_Architecture.png" alt="Architecture diagram for the solution Enhance security of your deployed application"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Mobile
{: #mobile }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-ios-mobile-push-analytics#ios-mobile-push-analytics">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                iOS mobile app with Push Notifications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create an iOS Swift application with Push Notifications on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution6/Architecture.png" alt="Architecture diagram for the solution iOS mobile app with Push Notifications"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-android-mobile-push-analytics#android-mobile-push-analytics">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Android native mobile app with Push Notifications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Write an Android native application with Push Notifications on IBM Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution9/Architecture.png" alt="Architecture diagram for the solution Android native mobile app with Push Notifications"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-serverless-mobile-backend#serverless-mobile-backend">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Mobile application with a serverless backend
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use Cloud Functions with cognitive and data services to build a serverless backend for a mobile application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution11/Architecture.png" alt="Architecture diagram for the solution Mobile application with a serverless backend"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Machine Learning and Analytics
{: #ml }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-big-data-log-analytics#big-data-log-analytics">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Big data logs with streaming analytics and SQL
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Collect, store and analyze log records to support regulatory requirements and aid information discovery. Using publish-subscribe messaging, scale the solution to millions of records and then perform analysis on persisted logs with familiar SQL.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution31/Architecture.png" alt="Architecture diagram for the solution Big data logs with streaming analytics and SQL"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-smart-data-lake#smart-data-lake">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Build a data lake with Object Storage
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Provide tools to data scientists to query data using SQL Query and conduct analysis in Watson Studio. Share data and insights through interactive charts.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution29/architecture.png" alt="Architecture diagram for the solution Build a data lake with Object Storage"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-serverless-github-traffic-analytics#serverless-github-traffic-analytics">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Combining serverless and Cloud Foundry for data retrieval and analytics
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Automatically collect GitHub traffic statistics for repositories, store them in a SQL database and get started with traffic analytics.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution24-github-traffic-analytics/Architecture.png" alt="Architecture diagram for the solution Combining serverless and Cloud Foundry for data retrieval and analytics"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-create-deploy-retrain-machine-learning-model#create-deploy-retrain-machine-learning-model">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Build, deploy, test and monitor a predictive machine learning model
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build a predictive machine learning model, deploy it as an API, test and retrain the model with feedback data.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution22-build-machine-learning-model/architecture_diagram.png" alt="Architecture diagram for the solution Build, deploy, test and monitor a predictive machine learning model"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Internet of Things
{: #iot }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-gather-visualize-analyze-iot-data#gather-visualize-analyze-iot-data">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Gather, visualize and analyze IoT data
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Set up an IoT device, gather large amounts of data in the Watson IoT Platform, analyze data with machine learning and create visualizations.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution16/Architecture.png" alt="Architecture diagram for the solution Gather, visualize and analyze IoT data"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Identity and Access Management
{: #iam }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-users-teams-applications#users-teams-applications">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Best practices for organizing users, teams, applications
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>An overview of the concepts available in IBM Cloud to manage identity and access management and how they can be implemented to support the multiple development stages of an application.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution20-users-teams-applications/architecture.png" alt="Architecture diagram for the solution Best practices for organizing users, teams, applications"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Virtual Private Cloud
{: #VPC }
<div class = "solutionBoxContainer"><a name="Network">&nbsp;</a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-public-app-private-backend#vpc-public-app-private-backend">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Public frontend and private backend in a Virtual Private Cloud
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a virtual private cloud with subnets and instances. Secure your resources by attaching security groups and only allow minimal access.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution40-vpc-public-app-private-backend/Architecture.png" alt="Architecture diagram for the solution Public frontend and private backend in a Virtual Private Cloud"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-multi-region#vpc-multi-region">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Deploy isolated workloads across multiple locations and zones
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Deploy a workload in virtual private clouds across multiple zones and regions. Distribute traffic across zones with local and global load balancers.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution41-vpc-multi-region/Architecture.png" alt="Architecture diagram for the solution Deploy isolated workloads across multiple locations and zones"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-site2site-vpn#vpc-site2site-vpn">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Use a VPC/VPN gateway for secure and private on-premises access to cloud resources
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Connect a Virtual Private Cloud to another computing environment over a secure Virtual Private Network and consume IBM Cloud services.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution46-vpc-vpn/ArchitectureDiagram.png" alt="Architecture diagram for the solution Use a VPC/VPN gateway for secure and private on-premises access to cloud resources"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-app-deploy#vpc-app-deploy">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Install software on virtual server instances in VPC
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Learn how to use the IBM Cloud CLI, Terraform and Ansible to install software on virtual server instances running in a Virtual Private Cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution49-vpc-app-deploy/ArchitectureDiagram.png" alt="Architecture diagram for the solution Install software on virtual server instances in VPC"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server#vpc-secure-management-bastion-server">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Securely access remote instances with a bastion host
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Deploy a bastion host to securely access remote instances within a virtual private cloud.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution47-vpc-secure-management-bastion-server/ArchitectureDiagram.png" alt="Architecture diagram for the solution Securely access remote instances with a bastion host"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-lamp-stack-on-vpc#lamp-stack-on-vpc">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                PHP web application on a LAMP Stack in VPC Gen2
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create an Ubuntu Linux virtual server on VPC, with Apache web server, MySQL, and PHP. Then install and configure the WordPress open source application on the LAMP stack.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution56-lamp-stack-on-vpc/Architecture.png" alt="Architecture diagram for the solution PHP web application on a LAMP Stack in VPC Gen2"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vpc-tg-dns-iam#vpc-tg-dns-iam">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Team based privacy using IAM, VPC, Transit Gateway and DNS
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Connect multiple VPCs with Transit Gateway. Use DNS name resolution for microservices. Work in isolated teams with IAM</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution59-vpc-tg-dns-iam/architecture.png" alt="Architecture diagram for the solution Team based privacy using IAM, VPC, Transit Gateway and DNS"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## Classic Infrastructure
{: #classic }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-secure-network-enclosure#secure-network-enclosure">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Isolate workloads with a secure private network
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Configure a Virtual Router Appliance to create a secure enclosure. Associate VLANs, provision servers, setup IP routing and firewalls.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution33-secure-network-enclosure/Secure-priv-enc.png" alt="Architecture diagram for the solution Isolate workloads with a secure private network"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-nat-config-private#nat-config-private">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Configure NAT for Internet access from a private network
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Use NAT masquerade to translate private IP addresses to out-bound public interface.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution35-nat-config-private/vra-nat.png" alt="Architecture diagram for the solution Configure NAT for Internet access from a private network"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-byoip#byoip">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Bring Your Own IP Address
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>An overview of BYOIP implementation patterns and a guide to identify the appropriate pattern.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution37-byoip/byoipdecision.png" alt="Architecture diagram for the solution Bring Your Own IP Address"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-configuring-IPSEC-VPN#configuring-IPSEC-VPN">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                VPN into a secure private network
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a private connection between a remote network environment and servers on IBM Cloud's private network.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution36-configuring-IPSEC-VPN/sec-priv-vpn.png" alt="Architecture diagram for the solution VPN into a secure private network"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-linking-secure-network-enclosures#linking-secure-network-enclosures">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Linking secure private networks over the IBM network
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Deploy two private networks that are securely linked over the IBM Cloud private network using the VLAN Spanning service.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution43-linking-secure-network-enclosures/vlan-spanning.png" alt="Architecture diagram for the solution Linking secure private networks over the IBM network"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-web-app-private-network#web-app-private-network">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Hosting web applications from a secure private network
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a scalable and secure Internet facing web application hosted in private network secured using a virtual router appliance (VRA), VLANs, NAT and firewalls.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution42-web-app-private-network/web-app-private.png" alt="Architecture diagram for the solution Hosting web applications from a secure private network"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## VMware Solutions
{: #vmware }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-vmware-solutions-shared-getting-started#vmware-solutions-shared-getting-started">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Getting Started with IBM Cloud for VMware Solutions Shared
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Create a network for Internet and IBM Cloud private access inside of a VMware virtual data center and deploy a virtual machine.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution58-vmware-solutions-getting-started/Architecture.png" alt="Architecture diagram for the solution Getting Started with IBM Cloud for VMware Solutions Shared"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

## High Performance Computing
{: #hpc }
<div class = "solutionBoxContainer">
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-hpc-eda#hpc-eda">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Extend an existing IBM Spectrum LSF cluster to the IBM Cloud
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Build and configure an hybrid environment for a IBM Spectrum LSF Multi-Cluster</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution60-hpc-eda/hpc-eda-arch.svg" alt="Architecture diagram for the solution Extend an existing IBM Spectrum LSF cluster to the IBM Cloud"/>
                </div>
            </div>
        </div>
    </div>
    </a>
    <a href = "/docs/solution-tutorials?topic=solution-tutorials-hpc-lsf-on-vpc#hpc-lsf-on-vpc">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
            <h3 class="solutionBoxTitle">
                Provision an IBM Spectrum LSF cluster on the Virtual Private Cloud
            </h3>
            <div class="solutionBoxDescription">
                <div class="descriptionContainer">
                    <p>Provision and configure IBM Cloud resources to create an IBM Spectrum LSF cluster.</p>
                </div>
                <div class="architectureDiagramContainer">
                    <img class="architectureDiagram" src = "images/solution61-hpc-lsf-on-vpc/hpc-lsf-on-vpc-arch.svg" alt="Architecture diagram for the solution Provision an IBM Spectrum LSF cluster on the Virtual Private Cloud"/>
                </div>
            </div>
        </div>
    </div>
    </a>
</div>

