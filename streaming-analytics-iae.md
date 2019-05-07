---
copyright:
  years: 2018, 2019
lastupdated: "2019-03-08"

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
{:important: .important}

# Streaming Analytics using Apache Kafka with IAE
{: #streaming-analytics-iae}

In this tutorial you will build a streaming analytics pipeline which collects and stores Kafka streaming data into Cloud Object Storage. Simple operations are done on the streaming data before pushing it to Object Storage. 

This solution leverages several services available in IBM Cloud: IBM Analytics Engine, Event Streams and Object Storage.
{:shortdesc}

## Objectives
{: #objectives}

* Makes statements on what developers will learn/achieve - not what will they do Solutions and Tasks
* Short and informational (do not use sentences)

## Services used
{: #services}

<!-- Please Note when creating links:  

For anchors within the same document always only use the following format:
  [link_description](#anchor_name) 

For anchors or any links to external documents, even for those are are within our tutorials use the following format: 
  [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview)

If you have an old format html link that you are trying to translate to the new ?topic= format there are two methods you can use:
  1. Try entering the link uri, i.e. /docs/tutorials/serverless-api-webapp.html in the test.cloud.ibm.com, i.e. https://test.cloud.ibm.com/docs/tutorials/serverless-api-webapp.html, you will be redirected to the new ?topic= format which is: https://test.cloud.ibm.com/docs/tutorials?topic=solution-tutorials-serverless-api-webapp#serverless-api-webapp

  2. If the redirect does not work, you may be able to use the old https://console.bluemix.net and enter the uri for the document you are searching for, some times the document uri changed, but you cn recognize it from reading the content and comparing back to the https://test.cloud.ibm.com and obtain the new link

Finally refer to the link topic under the content and design documentation if you have any other questions: https://test.cloud.ibm.com/docs/developing/writing?topic=writing-linking#linking

-->

This tutorial uses the following runtimes and services:
* [IaaS or PaaS service name](https://{DomainName}/catalog/services/ServiceName)
* [IaaS or PaaS service name](https://{DomainName}/catalog/services/ServiceName)
* [IaaS or PaaS service name](https://{DomainName}/catalog/services/ServiceName)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

intro sentence

<p style="text-align: center;">

  ![Architecture](images/solution1/Architecture.png)
</p>

1. The user does this
2. Then that

## Before you begin
{: #prereqs}

1. Install all the necessary command line (CLI) tools by [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview).

## Create services
{: #setup}

In this section, you will create the services required to ...

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview).
    ```sh
    ibmcloud login
    ```
    {: pre}
    ```sh
    ibmcloud target --cf
    ```
    {: pre}
2. Create an instance of [Service A](https://{DomainName}/catalog/services/the-service-name).
  ```sh
  ibmcloud resource service-instance-create service-instance-name service-name lite global
  ```
3. Create an instance of [Service B](https://{DomainName}/catalog/services/the-service-name).

## Solution Specific Section
{: #section_one}

Introductory statement that overviews the section

1. Step 1 Click **This** and enter your name.

  This is a tip.
  {:tip}

2. Keep each step as short as possible.
3. Do not use blank lines between steps except for tips or images.
4. *Avoid* really long lines like this one explaining a concept inside of a step. Do not offer optional steps or FYI inside steps. *Avoid* using "You can do ...". Be prescriptive and tell them exactly what to do succinctly, like a lab.
5. Do not use "I", "We will", "Let's", "We'll", etc.
6. Another step
7. Try to limit to 7 steps.

### A sub section

   ```bash
   some shellscript
   ```
   {: pre}


This paragraph only appears in the iOS documentation
{: ios}

And this paragraph only appears in the Android documentation
{: android}

This paragraph only appears for Java code
{: java}

And this paragraph only appears for Swift code
{: swift}


## Another Solution Specific Section
{: #section_two}

Introductory statement that overviews the section

### Another sub section

## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- idea with [link]() to resources to help implement the idea
- idea with high level steps the user should follow
- avoid generic ideas you did not test on your own
- don't throw up ideas that would take days to implement
- this section is optional

## Related content
{: #related}

* [Relevant links in IBM Cloud docs](https://{DomainName}/docs/cli?topic=blah)
* [Relevant links in external sources, i.e. normal link](https://kubernetes.io/docs/tutorials/hello-minikube/)
