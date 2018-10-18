---
copyright:
  years: 2018
lastupdated: "2018-10-17"

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

# Strategies for globally available applications

Users are less likely to experience downtime when an application is designed with resiliency in mind. When implementing a solution using Kubernetes services, Cloud Foundry, Cloud Functions or virtual servers, regardless of the compute options, you want to minimize downtimes and have your application highly available. To achieve that, you may consider deploying your solutions across multiple zones and regions with replicating Cloudant databases. 

This tutorial highlights what IBM Cloud provides for resilient solutions, answering questions like: 

- Does IBM Cloud compute options come with built-in functionalities, and if not, do they provide guidance for running the application across multiple regions? 
- How to make an app globally available across multiple regions? 
- How does a database as service like Cloudant or Watson services work in such case? What about database replication? 

This tutorial will give you the guidelines needed for when deploying applications across multiple regions. The tutorial will work based on a sample scenario application that contents a runtime, database, login authentication service, Watson service, and a monitoring service. 

## Objectives
{: #objectives}

* ToDo

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* IBM Cloud [Internet services](https://console.bluemix.net/catalog/services/internet-services)
* ToDo

This tutorial may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

This tutorial involves an active/active scenario where two copies of the application are deployed in two different regions and the two copies are serving customer requests in a round-robin way. The DNS configuration automatically points to the healthy region if one copy fails.

<p style="text-align: center;">

![Architecture](images/solution39/Architecture.png)

</p>


1. Cloud Internet Services is configured to intercept requests to the application and to distribute the load across the regions. 
2. The application is deployed to US South and US East regions but App ID and Watson Assistant only deployed on the US South region. 
3. The application uses database and storage services, replication is set between the two regions.

## Before you begin
{: #prereqs}

* Deploy applications to a single region on IBM Cloud. 
* Understanding of database as a service like Cloudant NoSQL DB.
* Cloud Internet Services requires you to own a custom domain so you can configure the DNS for this domain to point to Cloud Internet Services name servers.

## Multi-zone regions applications

- Twana working on this

## Cloud Foundry apps deployed across multiple regions globally

- Twana working on this

## Global Infrastructure availability zones

- ToDo

##Kubernetes apps deployed across multiple regions globally

- ToDo

##Cloud Functions apps deployed across multiple regions globally

- ToDo

##Handing databases and application files in multi-region architecture

- ToDo

##Handling non-database services like Watson services in multi-region architecture

- ToDo

## Related content

{:related}

- IBM Cloud [Internet Services](https://console.bluemix.net/docs/infrastructure/cis/getting-started.html#getting-started-with-ibm-cloud-internet-services-cis-)
- [Manage your IBM CIS for optimal security](https://console.bluemix.net/docs/infrastructure/cis/managing-for-security.html#best-practice-2-configure-your-security-level-selectively)
- [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/docs/containers/cs_planning.html#cs_planning)
- [{{site.data.keyword.registrylong_notm}} Basic](https://console.bluemix.net/docs/services/Registry/registry_overview.html#registry_planning)
- [Deploying single instance apps to Kubernetes clusters](https://console.bluemix.net/docs/containers/cs_tutorials_apps.html#cs_apps_tutorial_lesson1)
- [Best practice to secure traffic and internet application via CIS](https://console.bluemix.net/docs/infrastructure/cis/managing-for-security.html#manage-your-ibm-cis-for-optimal-security)
- [Improving App Availability with Multizone Clusters](https://www.ibm.com/blogs/bluemix/2018/06/improving-app-availability-multizone-clusters/)