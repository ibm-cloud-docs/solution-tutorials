---
copyright:
  years: 2018, 2019
lastupdated: "2019-03-11"
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

# Strategies for resilient applications
{: #strategies-for-resilient-applications}

Regardless of the compute option, Kubernetes, Cloud Foundry, Cloud Functions or Virtual Servers, enterprises seek to minimize downtime and create resilient architectures that achieve maximum availability. This tutorial highlights IBM Cloud's capabilities to build resilient solutions, and in doing so, answers the following questions.

- What should I consider when preparing a solution to be globally available?
- How available compute options help you deliver multi-region applications?
- How do I import application or service artifacts into additional regions?
- How can databases replicate across locations?
- Which backing services should be used: Block Storage, File Storage, Object Storage, Databases?
- Are there any service-specific considerations?

## Objectives
{: #objectives}

* Learn architectural concepts involved when building resilient applications.
* Understand how such concepts map to IBM Cloud compute and service offerings

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.containershort_notm}}](https://{DomainName}/containers-kubernetes/catalog/cluster)
* [{{site.data.keyword.cfee_full_notm}}](https://{DomainName}/cfadmin/create)
* [{{site.data.keyword.openwhisk_short}}](https://{DomainName}/openwhisk)
* [{{site.data.keyword.BluVirtServers}}](https://{DomainName}/catalog/infrastructure/virtual-server-group)
* [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudant)
* [{{site.data.keyword.Db2_on_Cloud_short}}](https://{DomainName}/catalog/services/db2)
* {{site.data.keyword.databases-for}}
* [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage)
* [Cloud Internet Services](https://{DomainName}/catalog/services/internet-services)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture and Concepts

{: #architecture}

To design a resilient architecture, you need to consider the individual blocks of your solution and their specific capabilities. 

Below is a multi-region architecture showcasing the different components that may exist in a multi-region setup. ![Architecture](images/solution39/Architecture.png)

The architecture diagram above may be different depending on the compute option. You will see specific architecture diagrams under each compute option in later sections. 

### Disaster recovery with two regions 

To facilitate disaster recovery, two widely accepted architectures are used: **active/active** and **active/passive**. Each architecture has its own costs and benefits related to time and effort during recovery.

#### Active-active configuration

In an active/active architecture, both locations have identical active instances with a load balancer distributing traffic between them. Using this approach, data replication must be in place to synchronize data between both regions in real time.

![Active/Active](images/solution39/Active-active.png)

This configuration provides higher availability with less manual remediation than an active/passive architecture. Requests are served from both data centers. You should configure the edge services (load balancer) with appropriate timeout and retry logic to automatically route the request to the second data center if a failure occurs in the first data center environment.

When considering **recovery point objective** (RPO) in the active/active scenario, data synchronization between the two active data centres must be extremely timely to allow seamless request flow.

#### Active-passive configuration

An active/passive architecture relies on one active region and a second (passive) region used as a backup. In the event of an outage in the active region, the passive region becomes active. Manual intervention may be required to ensure databases or file storage is current with the application and user needs. 

![Active/Active](images/solution39/Active-passive.png)

Requests are served from the active site. In the event of an outage or application failure, pre-application work is performed to make the standby data center ready to serve the request. Switching from the active to the passive data centre is a time-consuming operation. Both **recovery time objective** (RTO) and **recovery point objective** (RPO) are higher compared to the active/active configuration.

### Disaster recovery with three regions

In today's era of "Always On" services with zero tolerance for downtime, customers expect every business service to remain accessible around the clock anywhere in the world. A cost-effective strategy for enterprises involves architecting your infrastructure for continuous availability rather than building disaster recovery infrastructures.

Using three data centers provides greater resiliency and availability than two. It can also offer better performance by spreading the load more evenly across data centers. If the enterprise has only two data centers, a variant of this is to deploy two applications in one data center and deploy the third application in the second data center. Alternatively, you can deploy business logic and presentation layers in the 3-active topology and deploy the data layer in the 2-active topology.

#### Active-active-active (3-active) configuration

![](images/solution39/Active-active-active.png)

Requests are served by the application running in any of the three active data centers. A case study on IBM.com website indicates that 3-active requires only 50% of the compute, memory, and network capacity per cluster, but 2-active requires 100% per cluster. The data layer is where the cost difference stands out. For further details, read [*Always On: Assess, Design, Implement, and Manage Continuous Availability*](http://www.redbooks.ibm.com/redpapers/pdfs/redp5109.pdf).

#### Active-active-passive configuration

![](images/solution39/Active-active-passive.png)

In this scenario, when either of the two active applications in the primary and secondary data centers suffers an outage, the standby application in the third data center is activated. The disaster recovery procedure described in the two data centers scenario is followed for restoring normalcy to process customer requests. The standby application in the third data center can be set up in either a hot or a cold standby configuration.

Refer to [this guide](https://www.ibm.com/cloud/garage/content/manage/hadr-on-premises-app/) for more on disaster recovery.

### Multi-regions architectures

In a multi-region architecture, an application is deployed to different locations where each region runs an identical copy of the application. 

A region is a specific geographical location where you can deploy apps, services, and other {{site.data.keyword.cloud_notm}} resources. [{{site.data.keyword.cloud_notm}} regions](https://{DomainName}/docs/containers?topic=containers-regions-and-zones) consist of one or more zones, which are physical data centers that host the compute, network, and storage resources and related cooling and power that host services and applications. Zones are isolated from each other, which ensures no shared single point of failure.

Additionally, in a multi-region architecture, a Global load balancer like [Cloud Internet Services](https://{DomainName}/catalog/services/internet-services) is required in order to distribute traffic between regions.

Deploying a solution across multiple regions comes with the following benefits:
- Improve latency for end-users - speed is the key, the closer your backend origin is to end-users, the better the experience for users and the faster.
- Disaster recovery - when the active region fails, then you have a backup region to recover quickly.
- Business requirements - in some cases you need to store data in distinct regions, separated by several hundreds of kilometers. Therefore, those in such case you have have to store data in multiple regions. 

### Multi-zones within regions architectures

Building multi-zones regions applications means having your application deployed across zones within a region and then you may also have two or three regions. 

With multi-zone region architecture you would require to have a local load balancer to distribute traffic locally between zones in a region, and then if a second region is set up then a global load balancer distributes traffic between the regions. 

You can learn more about regions and zones [here](https://{DomainName}/docs/containers?topic=containers-regions-and-zones#regions-and-zones).

## Compute Options 

This section reviews the compute options available in {{site.data.keyword.cloud_notm}}. For each compute option, an architecture diagram is provided together with a tutorial on how to deploy such architecture.

Note: all compute options architectures do not have databases or other services included, they only focus on deploying an app to two regions for the selected compute option. Once you deployed any of the multi-region compute options examples, the next logical step would be to add databases and other services. Later sections of this solution tutorial will cover [databases](#databaseservices), and [non-database-services](#nondatabaseservices).

### Cloud Foundry 

Cloud Foundry offers the capability to achieve deployment of a multi-region architecture, also using a [continuous delivery](https://{DomainName}/catalog/services/continuous-delivery) pipeline services allows you to deploy your application across multiple regions. The architecture for Cloud Foundry multi-region looks like this:

![CF-Architecture](images/solution39/CF2-Architecture.png)

The same application is deployed in multiple regions and a global load balancer routes traffic to the closest and healthy region. The [**Secure web application across multiple regions**](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-webapp#multi-region-webapp) tutorial guides you through the deployment of a similar architecture.

### {{site.data.keyword.cfee_full_notm}}

**{{site.data.keyword.cfee_full_notm}} (CFEE)** offers all the same functionalities as the public Cloud Foundry together with additional features.

**{{site.data.keyword.cfee_full_notm}}** allows you to instantiate multiple, isolated, enterprise-grade Cloud Foundry platforms on demand. Instances of CFEE run within your own account in [{{site.data.keyword.cloud_notm}}
](http://ibm.com/cloud). The environment is deployed on isolated hardware on top of [the {{site.data.keyword.containershort_notm}}](https://www.ibm.com/cloud/container-service). You have full control over the environment, including access control, capacity management, change management, monitoring, and services.

A multi-region architecture using {{site.data.keyword.cfee_full_notm}} is below.

![Architecture](images/solution39/CFEE-Architecture.png)

Deploying this architecture requires the following: 

- Setup two CFEE instances - one in each region.
- Create and bind the services to the CFEE account. 
- Push the apps targeting the CFEE API endpoint. 
- Setup database replication, just as you would on public Cloud Foundry. 

Additionally, check out the step by step guide [Deploy Logistics Wizard to Cloud Foundry Enterprise Environment (CFEE)](https://github.com/IBM-Cloud/logistics-wizard/blob/master/Deploy_Microservices_CFEE.md). It will take you through the deployment of a microservice based application to CFEE. Once deployed to one CFEE instance, you can replicate the procedure to a second region and attach the [Internet Services](https://{DomainName}/docs/infrastructure/cis?topic=cis-getting-started-with-ibm-cloud-internet-services-cis-#getting-started-with-ibm-cloud-internet-services-cis-) in front of the two CFEE instances to load balance the traffic. 

Refer to the [{{site.data.keyword.cfee_full_notm}} documentation](https://{DomainName}/docs/cloud-foundry?topic=cloud-foundry-about#about) for additional details.

### Kubernetes

With Kubernetes, you can achieve a multi-zones within regions architecture, this can be an active/active use case. When implementing a solution with {{site.data.keyword.containershort_notm}}, you benefit from built-in capabilities, like load balancing and isolation, increased resiliency against potential failures with hosts, networks, or apps. By creating multiple clusters and if an outage occurs with one cluster, users can still access an app that is also deployed in another cluster. With multiple clusters in different regions, users can also access the closest cluster with reduced network latency. For additional resiliency, you have the option to also select the multi-zone clusters, meaning your nodes are deployed across multiple zones within a region. 

The Kubernetes multi-region architecture looks like this.

![Kubernetes](images/solution39/Kub-Architecture.png)

1. The developer builds Docker images for the application.
2. The images are pushed to {{site.data.keyword.registryshort_notm}} in two different locations.
3. The application is deployed to Kubernetes clusters in both locations.
4. End-users access the application.
5. Cloud Internet Services is configured to intercept requests to the application and to distribute the load across the clusters. In addition, DDoS Protection and Web Application Firewall are enabled to protect the application from common threats. Optionally assets like images, CSS files are cached.

The tutorial [**Resilient and secure multi-region Kubernetes clusters with Cloud Internet Services**](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-k8s-cis#multi-region-k8s-cis) walks you through the steps to deploy such architecture.

### {{site.data.keyword.openwhisk_short}}

{{site.data.keyword.openwhisk_short}} is available in multiple {{site.data.keyword.cloud_notm}} locations. To increase resiliency and reduce network latency, applications can deploy their back-end in multiple locations. Then, with IBM Cloud Internet Services (CIS), developers can expose a single entry point in charge of distributing traffic to the closest healthy back-end. The architecture for {{site.data.keyword.openwhisk_short}} multi-region looks like this.

 ![Functions-Architecture](images/solution39/Functions-Architecture.png)

1. Users access the application. The request goes through Internet Services.
2. Internet Services redirect the users to the closest healthy API back-end.
3. Certificate Manager provides the API with its SSL certificate. The traffic is encrypted end-to-end.
4. The API is implemented with Cloud Functions.

Find out how to deploy this architecture by following the tutorial [**Deploy serverless apps across multiple regions**](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-serverless#multi-region-serverless).

### {{site.data.keyword.baremetal_short}} and {{site.data.keyword.virtualmachinesshort}}

{{site.data.keyword.virtualmachinesshort}} and {{site.data.keyword.baremetal_short}} offer the capability to achieve a multi-region architecture. You can provision servers on many available locations on {{site.data.keyword.cloud_notm}}.

![server locations](images/solution39/ServersLocation.png)

When preparing for such architecture using {{site.data.keyword.virtualmachinesshort}} and {{site.data.keyword.baremetal_short}}, consider the following: file storage, backups, recovery and databases, selecting between a database as service or installing a database on a virtual server. 

The below architecture demonstrates deployment of a multi-region architecture using {{site.data.keyword.virtualmachinesshort}} in an active/passive architecture where one region is active and the second region is passive. 

![VM-Architecture](images/solution39/vm-Architecture2.png)

The components required for such architecture: 

1. Users access the application through IBM Cloud Internet Services (CIS).
2. CIS routes traffic to the active location.
3. Within a location a load balancer redirects traffic to a server.
4. Databases deployed on a virtual server, meaning you would configure the database and setup replications and backups between regions. The alternative would be use a database-as-service, a topic discussed later in the tutorial.
5. File storage to store the application images and files, File storage offers the capability to take a snapshot at a given time and date, this snapshot then can be reused within another region, something in which you would do manually. 

The tutorial [**Use Virtual Servers to build highly available and scalable web app**](https://{DomainName}/docs/tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#highly-available-and-scalable-web-application) implements this architecture.

## Databases and application files
{: #databaseservices}

{{site.data.keyword.cloud_notm}} offers a selection of [databases as a service](https://{DomainName}/catalog/?category=databases) with both relational and non-relational databases depending on your business needs. [Database-as-a-service (DBaaS)](https://www.ibm.com/cloud/learn/what-is-cloud-database) comes with many advantages. Using a DBaaS like {{site.data.keyword.cloudant}}, you can take advantages of the multi-region support allowing you to do live replication between two database services in different regions, perform backups, and have scaling and maximum uptime. 

**Key features:** 

- A database service built and accessed through a cloud platform
- Enables enterprise users to host databases without buying dedicated hardware
- Can be managed by the user or offered as a service and managed by a provider
- Can support SQL or NoSQL databases
- Accessed through a web interface or vendor-provided API

**Prepping for multi-region architecture:**

- What are the resiliency options of the database service?
- How is replication handled between multiple database services across regions?
- How is the data backed up?
- What are the disaster recovery approaches for each?

### {{site.data.keyword.cloudant}}

{{site.data.keyword.cloudant}} is a distributed database that is optimized for handling heavy workloads that are typical of large, fast-growing web and mobile apps. Available as an SLA-backed, fully managed {{site.data.keyword.Bluemix_notm}} service, {{site.data.keyword.cloudant}} elastically scales throughput and storage independently. {{site.data.keyword.cloudant}} is also available as a downloadable on-premises installation, and its API and powerful replication protocol are compatible with an open source ecosystem that includes CouchDB, PouchDB, and libraries for the most popular web and mobile development stacks.

{{site.data.keyword.cloudant}} supports [replication](https://{DomainName}/docs/services/Cloudant/api?topic=cloudant-replication-api#replication-operation) between multiple instances across locations. Any change that occurred in the source database is reproduced in the target database. You can create replications between any number of databases, either continuously or as a 'one-off' task. The following diagram shows a typical configuration that uses two {{site.data.keyword.cloudant}} instances, one in each region:

![active-active](images/solution39/Active-active.png)

Refer to [these instructions](https://{DomainName}/docs/services/Cloudant/guides?topic=cloudant-configuring-ibm-cloudant-for-cross-region-disaster-recovery#configuring-ibm-cloudant-for-cross-region-disaster-recovery) to configure replication between {{site.data.keyword.cloudant}} instances. The service also provides instructions and tooling to [backup and restore data](https://{DomainName}/docs/services/Cloudant/guides?topic=cloudant-ibm-cloudant-backup-and-recovery#ibm-cloudant-backup-and-recovery).

### {{site.data.keyword.Db2_on_Cloud_short}}, {{site.data.keyword.dashdbshort_notm}}, and {{site.data.keyword.Db2Hosted_notm}}

{{site.data.keyword.cloud_notm}} offers several [Db2 database services](https://{DomainName}/catalog/?search=db2h). These are:

- [**{{site.data.keyword.Db2_on_Cloud_short}}**](https://{DomainName}/catalog/services/db2): A fully-managed cloud SQL database for typical operational, OLTP-like workloads.
- [**{{site.data.keyword.dashdbshort_notm}}**](https://{DomainName}/catalog/services/db2-warehouse): A fully-managed cloud data warehouse service for high performance, petabyte-scale analytic workloads. It offers both SMP and MPP service plans and utilizes an optimized columnar data store and in-memory processing.
- [**{{site.data.keyword.Db2Hosted_notm}}**](https://{DomainName}/catalog/services/db2-hosted): A hosted by IBM and managed by the user database system. It provides Db2 with full administrative access on cloud infrastructure, thereby eliminating the cost, complexity, and risk of managing your own infrastructure.

In the following, we will focus on {{site.data.keyword.Db2_on_Cloud_short}} as DBaaS for operational workloads. These workloads are typical for the applications discussed in this tutorial.

#### Multi-region support for {{site.data.keyword.Db2_on_Cloud_short}}

{{site.data.keyword.Db2_on_Cloud_short}} offers several [options to achieve High Availability and Disaster Recovery (HADR)](https://{DomainName}/docs/services/Db2onCloud?topic=Db2onCloud-fs#overview). You can choose the High Availability option when you create a new service. Later on, you can [add a Geo-Replicated Disaster Recovery Node](https://{DomainName}/docs/services/Db2onCloud?topic=Db2onCloud-ha#ha) through the instance dashboard. The offsite DR node option gives you the ability to synchronize your data in real time to a database node in an offsite {{site.data.keyword.cloud_notm}} data center of your choice.

More information is available in the [High Availability documentation](https://{DomainName}/docs/services/Db2onCloud?topic=Db2onCloud-ha#ha).

#### Backup and restore

{{site.data.keyword.Db2_on_Cloud_short}} includes daily backups for paid plans. Typically, the backups are stored using {{site.data.keyword.cos_short}} and thereby utilizing three data centers for increased availability of retained data. Backups are kept for 14 days. You can use them to perform a point-in-time recovery. The [backup and restore documentation](https://{DomainName}/docs/services/Db2onCloud?topic=Db2onCloud-bnr#br) provides details on how you can restore data to the desired date and time.

### {{site.data.keyword.databases-for}}

{{site.data.keyword.databases-for}} offers several open source database systems as fully managed services. They are:  
* [{{site.data.keyword.databases-for-postgresql}}](https://{DomainName}/catalog/services/databases-for-postgresql)
* [{{site.data.keyword.databases-for-redis}}](https://{DomainName}/catalog/services/databases-for-redis)
* [{{site.data.keyword.databases-for-elasticsearch}}](https://{DomainName}/catalog/services/databases-for-elasticsearch)
* [{{site.data.keyword.databases-for-etcd}}](https://{DomainName}/catalog/services/databases-for-etcd)
* [{{site.data.keyword.databases-for-mongodb}}](https://{DomainName}/catalog/services/databases-for-mongodb)

All of these services share the same characteristics:   
* For high availability they are deployed in clusters. Details can be found in the documentation of each service:
  - [PostgreSQL](https://{DomainName}/docs/services/databases-for-postgresql?topic=databases-for-postgresql-high-availability#high-availability)
  - [Redis](https://{DomainName}/docs/services/databases-for-redis?topic=databases-for-redis-high-availability#high-availability)
  - [Elasticsearch](https://{DomainName}/docs/services/databases-for-elasticsearch?topic=databases-for-elasticsearch-high-availability#high-availability)
  - [etcd](https://{DomainName}/docs/services/databases-for-etcd?topic=databases-for-etcd-high-availability#high-availability)
  - [MongoDB](https://{DomainName}/docs/services/databases-for-mongodb?topic=databases-for-mongodb-high-availability#high-availability)
* Each cluster is spread over multiple zones.
* Data is replicated across the zones.
* Users can scale up storage and memory resources for an instance. See the [documentation on scaling for, e.g., {{site.data.keyword.databases-for-redis}}](https://{DomainName}/docs/services/databases-for-redis?topic=databases-for-redis-dashboard-settings#settings) for details.
* Backups are taken daily or on demand. Details are documented for each service. Here is [backup documentation for, e.g., {{site.data.keyword.databases-for-postgresql}}](https://{DomainName}/docs/services/databases-for-postgresql?topic=databases-for-postgresql-dashboard-backups#backups).
* Data at rest, backups and network traffic are encrypted.
* Each [service can be managed using the {{site.data.keyword.databases-for}} CLI plugin](https://{DomainName}/docs/databases-cli-plugin?topic=cloud-databases-cli-cdb-reference#cloud-databases-cli-plug-in)


### {{site.data.keyword.cos_full_notm}}

{{site.data.keyword.cos_full_notm}} (COS) provides durable, secure and cost-effective cloud storage. Information stored with {{site.data.keyword.cos_full_notm}} is encrypted and dispersed across multiple geographic locations. When creating storage buckets within a COS instance, you decide in which location the bucket should be created and which resiliency option to use.

There are three types of bucket resiliency:
   - **Cross Region** resiliency will spread your data across several metropolitan areas. This can be seen as a multi-region option. When accessing content stored in a Cross Region bucket, COS offers a special endpoint able to retrieve content from a healthy region.
   - **Regional** resiliency will spread data across a single metropolitan area. This can be seen as a multi-zones within a region configuration.
   - **Single Data Center** resiliency spreads data across multiple appliances within a single data center.

Refer to [this documentation](https://{DomainName}/docs/services/cloud-object-storage/basics?topic=cloud-object-storage-endpoints#select-regions-and-endpoints) for a detailed explanation of {{site.data.keyword.cos_full_notm}} resiliency options.

### {{site.data.keyword.filestorage_full_notm}}

{{site.data.keyword.filestorage_full_notm}} is persistent, fast, and flexible network-attached, NFS-based file storage. In this network-attached storage (NAS) environment, you have total control over your file shares function and performance. {{site.data.keyword.filestorage_short}} shares can be connected to up to 64 authorized devices over routed TCP/IP connections for resiliency.

Some of file storage features are _Snapshots_, _Replication_, _Concurrent access_. Refer to [the  documentation](https://{DomainName}/docs/infrastructure/FileStorage?topic=FileStorage-about#getting-started-with-file-storage) for a full list of features.

Once attached to your servers, a {{site.data.keyword.filestorage_short}} service can be used easily to store data backups, application files like images and videos, these images and files can then be used within different servers in the same region.

When adding a second region, you can use the snapshots feature of {{site.data.keyword.filestorage_short}} to take a snapshot automatically or manually, and then reuse it within the second passive region. 

Replication can be scheduled to automatically copy snapshots to a destination volume in a remote data center. The copies can be recovered in the remote site if a catastrophic event occurs or your data becomes corrupted. More on File Storage snapshots can be found [here](https://{DomainName}/docs/infrastructure/FileStorage?topic=FileStorage-snapshots#snapshots).

## Non-database services
{: #nondatabaseservices}

{{site.data.keyword.cloud_notm}} offers a selection of non-database [services](https://{DomainName}/catalog), these are both IBM services and 3rd party service. When planning for multi-region architecture, you need to understand how services like Watson services can work in a multi-region setup.

### {{site.data.keyword.conversationfull}}

[{{site.data.keyword.conversationfull}}](https://{DomainName}/docs/services/assistant?topic=assistant-index#about) is a platform that allows developers and non-technical users to collaborate on building conversational AI-powered assistants.

An assistant is a cognitive bot that you can customize for your business needs, and deploy across multiple channels to bring help to your customers where and when they need it. The assistant includes one or many skills. A dialog skill contains the training data and logic that enables an assistant to help your customers.

It's important to note that {{site.data.keyword.conversationshort}} V1 is stateless. {{site.data.keyword.conversationshort}} delivers 99.5% uptime, but still, for highly available applications across multiple regions, you may even want to have multiple instances of this services across regions. 

Once you have created instances in multiple locations, use the tooling {{site.data.keyword.conversationshort}} to export, from one instance, an existing workspace, including intents, entities, and dialog. Then import this workspace in other locations.

## Summary

| Offering | Resiliency Options |
| -------- | ------------------ |
| Cloud Foundry | <ul><li>Deploy applications to multiple locations</li><li>Serve requests from multiple locations with Cloud Internet Services</li><li>Use Cloud Foundry APIs to configure orgs, spaces and push apps to multiple locations</li></ul> |
| {{site.data.keyword.cfee_full_notm}} | <ul><li>Deploy applications to multiple locations</li><li>Serve requests from multiple locations with Cloud Internet Services</li><li>Use Cloud Foundry APIs to configure orgs, spaces and push apps to multiple locations</li><li>Built on Kubernetes service</li></ul> |
| {{site.data.keyword.containerlong_notm}} | <ul><li>Resiliency by design with support for multi-zone clusters</li><li>Serve requests from clusters spread in multiple locations with Cloud Internet Services</li></ul> |
| {{site.data.keyword.openwhisk_short}} | <ul><li>Available in multiple locations</li><li>Serve requests from multiple locations with Cloud Internet Services</li><li>Use Cloud Functions API to deploy actions in multiple locations</li></ul> |
| {{site.data.keyword.baremetal_short}} and {{site.data.keyword.virtualmachinesshort}} | <ul><li>Provision servers in multiple locations</li><li>Attach servers in the same location to a local load balancer</li><li>Serve requests from multiple locations with Cloud Internet Services</li></ul> |
| {{site.data.keyword.cloudant}} | <ul><li>One-shot and Continuous replication between databases</li><li>Automatic data redundancy within a region</li></ul> |
| {{site.data.keyword.Db2_on_Cloud_short}} | <ul><li>Provision a geo-replicated disaster recovery node for real-time data synchronization</li><li>Daily backup with paid plans</li></ul> |
| {{site.data.keyword.databases-for-postgresql}}, {{site.data.keyword.databases-for-redis}} | <ul><li>Built on multi-zone Kubernetes clusters</li><li>Cross-region read replicas</li><li>Daily and on-demand backups</li></ul> |
| {{site.data.keyword.cos_short}} | <ul><li>Single Data Center, Regional and Cross-Regional resiliency</li><li>Use API to synchronize contents across storage buckets</li></ul> |
| {{site.data.keyword.filestorage_short}} | <ul><li>Use snapshots to automatically capture content to a destination in a remote data center</li></ul> |
| {{site.data.keyword.conversationshort}} | <ul><li>Use Watson API to export and import workspace specification between multiple instances across locations</li></ul> |

## Related content

{:related}

- IBM Cloud [Internet Services](https://{DomainName}/docs/infrastructure/cis?topic=cis-getting-started-with-ibm-cloud-internet-services-cis-#getting-started-with-ibm-cloud-internet-services-cis-)
- [Improving App Availability with Multizone Clusters](https://www.ibm.com/blogs/bluemix/2018/06/improving-app-availability-multizone-clusters/)
- [Cloud Foundry, secure web application across multiple regions](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-webapp#secure-web-application-across-multiple-regions)
- [Cloud Functions, deploy serverless apps across multiple regions](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-serverless#deploy-serverless-apps-across-multiple-regions)
- [Kubernetes, resilient and secure multi-region Kubernetes clusters with Cloud Internet Services](https://{DomainName}/docs/tutorials?topic=solution-tutorials-multi-region-k8s-cis#resilient-and-secure-multi-region-kubernetes-clusters-with-cloud-internet-services)
- [Virtual Servers, build highly available and scalable web app](https://{DomainName}/docs/tutorials?topic=solution-tutorials-highly-available-and-scalable-web-application#use-virtual-servers-to-build-highly-available-and-scalable-web-app)