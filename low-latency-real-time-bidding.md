---
copyright:
  years: 2017
lastupdated: "2018-02-14"

---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Standing up Real-Time Bidding environment
{:shortdesc}
This tutorial covers the type of environment you would need to set up in order to achieve the 100ms response time requirements of auction in  Real-Time Bidding process. This involves multi-region kubernetes clusters with replicated databases, caching and object storage.

When a user visits a website and advertisements are displayed, a lot goes on under the covers to determine what ad to display.
1. User visits a website.
2. The website sends a request with user data to an ad exchange.  
3. Ad exchange starts an auction with multiple advertisers.
4. Advertisers bid on ad impressions within 100ms.
5. Ad exchange picks a winner and provides the ad information to the website.
6. Website displays the ad.

In order for the advertisers to determine the ad they want to show and the bidding price, they have to analyze user data against their existing database and respond with the ad along with a price they are willing to pay. All of this has to happen within 100ms. To achieve this speed, the architecture has to be optimized to reduce networking latency as much as possible.

## Objectives
{: #objectives}

* Create clusters in multiple regions
* Add global load Balancer
* Add low latency caching - Redis
* Add data store - Cloudant NoSQL DB
* Add Object storage

## Products
{: #products}

This tutorial uses the following products:
* [IaaS or PaaS service name](https://console.bluemix.net/catalog/services/ServiceName)
* [IaaS or PaaS service name](https://console.bluemix.net/catalog/services/ServiceName)
* [IaaS or PaaS service name](https://console.bluemix.net/catalog/services/ServiceName)

<p style="text-align: center;">
![](images/solutionXX/Architecture.png)
</p>

## Create Kubernetes clusters
{: #first_objective}

The first step of creating the environment is the compute which will run your bidding application. Use IBM Cloud Container Service with Kubernetes to deploy highly available apps using the power and flexibility of clusters. Developers provide containerized applications and Kubernetes on IBM Cloud will handle deployment, scaling, and management aspects. Multiple instances of your application can run in a single cluster. We'll create multiple clusters to load balancer based on proximity of the request.

In this section, we'll create two Kubernetes clusters, one in `US South` and another in `United Kingdom`.

1. Create a Resource Group called "RTB" by visiting **Manage > Account > Resource Groups**. A resource group is a way for you to organize your account resources in customizable groupings, so that you can quickly assign users access to more than one resource at a time.
2. In the Dashboard, select the US-South region.
3. Click on **Create resource**. In the **Containers** category, click **Kubernetes cluster**.
3. Enter a **Cluster Name**. The default cluster type is free.
4. Click **Create Cluster**. The details for the cluster open, but the worker node in the cluster takes a few minutes to provision. You can see the status of the worker node in the **Worker nodes** tab. When the status reaches `Ready`, your worker node is ready to be used.
5. In the Dashboard, select the United Kingdom region.
6. Repeat the steps to create another cluster.

You now have two independent clusters across 2 regions.

## Add application caching
{: #second_objective}

Next step is to add a caching layer to your stack. Each application instance needs to save and read temporary data to improve performance, reduce trips to a database and ultimately reduce response times. This data needs to be shared across multiple instances of the application across the same data center. Redis is an open-source, blazingly fast, key/value low maintenance store. IBM Compose for Redis makes Redis even better by managing it for you. Features include auto-scaling deployments, high availability, and automated no-stop backups.

We'll create a managed Redis services close to each of the Kubernetes clusters. Because speed is a priority with caching, the proximity of the caching server to your application server is important to keep the network latency as low as possible.

1. Compose for Redis instances are grouped using Cloud Foundry org and spaces. Start by creating a space called "RTB-space" by visiting **Manage > Account > Cloud Foundry Orgs > View Details** next to your org.
2. Click on **Create resource**. In the **Data & Analytics** category, select **Compose for Redis**.
3. Select `US South` region, and your new `RTB-space` space.
4. Create. 
4. Repeat the steps to create another Redis instance in the `United Kingdom` region.
## Clean up resources

Steps to take to remove the resources created in this tutorial

## Related information

* [Relevant links](https://blah)
