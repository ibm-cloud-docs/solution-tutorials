---
copyright:
  years: 2017, 2019
lastupdated: "2019-04-12"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}


# Analyze logs and monitor the health of Kubernetes applications
{: #kubernetes-log-analysis-kibana}

This tutorial shows how the [{{site.data.keyword.la_full_notm}}](https://{DomainName}/observe/logging) service can be used to configure and access logs of a Kubernetes application that is deployed on {{site.data.keyword.Bluemix_notm}}. You will deploy a Python application to a cluster provisioned on {{site.data.keyword.containerlong_notm}}, configure a LogDNA agent, generate different levels of application logs and access worker logs, pod logs or network logs. Then, you will search, filter and visualize those logs through {{site.data.keyword.la_short}} Web UI.

Moreover, you will also setup the [{{site.data.keyword.mon_full_notm}}](https://{DomainName}/observe/monitoring) service and configure Sysdig agent to monitor the performance and health of your application and your {{site.data.keyword.containerlong_notm}} cluster.
{:shortdesc}

For an updated version of this tutorial, [click the link here](https://{DomainName}/docs/tutorials?topic=solution-tutorials-application-log-analysis#application-log-analysis)