---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-01-26"
lasttested: "2023-01-24"

content-type: tutorial
services: vmware-service
account-plan: paid
completion-time: 1h

---

{:step: data-tutorial-type='step'}
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
{:note: .note}

# Creating a VPN between virtual data center edge gateway and on-premises VPN gateway
{: #vmware-as-a-service-vpn-vsrx}
{: toc-content-type="tutorial"}
{: toc-services="vmware-service"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

## Objectives
{: #vmware-as-a-service-vpn-vsrx-objectives}

The objective of this tutorial is to demonstrate the basic steps of connecting via a Virtual Private Network (VPN) a {{site.data.keyword.vmware-service_full}} – single tenant instance with a Juniper vSRX. The vSRX can either be deployed in {{site.data.keyword.cloud_notm}} Classic Infrastructure or in a client data center. The steps that follow will create a basic working environment, providing a VPN and basic firewall implementation, with test virtual machines that can be used to verify  that the end-to-end environment is functional.

This tutorial should take about 30-60 minutes to complete and assumes that [{{site.data.keyword.vmware-service_full}} – single tenant instance](https://{DomainName}/docs/vmware-service?topic=vmware-service-tenant-ordering) and [a virtual data center (VDC)](https://{DomainName}/docs/vmware-service?topic=vmware-service-vdc-adding) have already been provisioned.

In this tutorial, you will learn:

* How to create VPNs in between virtual data center edge gateway and Juniper xSRX,
* How to create and configure matching IKE and IPsec tunnel proposals and profiles, and
* How to configure firewall (FW) rules on your virtual data center edge gateway and vSRX to allow VPN traffic.

The following diagram presents an overview of the solution to be deployed.

![Architecture](images/solution66-vmware-as-a-service/vmwaas-solution-tutorial-diagrams-ui-vmwaas-vdc-vpn.svg){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

This tutorial is divided into the following steps:

1. [Gather requirements](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vpn-vsrx#vmware-as-a-service-vpn-vsrx-gather-requirements)
2. [Configure vSRX](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vpn-vsrx#vmware-as-a-service-vpn-vsrx-config-vsrx)
3. [Configure {{site.data.keyword.vmware-service_full}} – single tenant edge gateway](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vpn-vsrx#vmware-as-a-service-vpn-vsrx-edge-gateway)


## Before you begin
{: #vmware-as-a-service-vpn-vsrx-prereqs}

This tutorial requires:

* An {{site.data.keyword.cloud_notm}} [billable account](https://{DomainName}/docs/account?topic=account-accounts),
* Check for user permissions. Be sure that your user account has sufficient permissions [to create and manage VMware as a Service resources](https://{DomainName}/docs/vmware-service?topic=vmware-service-getting-started).
* [A pre-provisioned {{site.data.keyword.vmware-service_full}} - single tenant instance](https://{DomainName}/docs/vmware-service?topic=vmware-service-tenant-ordering), and
* [A pre-provisioned virtual data center on the {{site.data.keyword.vmware-service_full}} - single tenant instance](https://{DomainName}/docs/vmware-service?topic=vmware-service-vdc-adding).


## Gather requirements
{: #vmware-as-a-service-vpn-vsrx-gather-requirements}
{: step}


## Configure vSRX
{: #vmware-as-a-service-vpn-vsrx-config-vsrx}
{: step}


## Configure {{site.data.keyword.vmware-service_full}} – single tenant edge gateway
{: #vmware-as-a-service-vpn-vsrx-config-edge-gateway}
{: step}


## Reference material
{: #vmware-as-a-service-vpn-vsrx-reference}

Check the following VMware Cloud Director™ Tenant Portal Guides for more detailed information:

* [Managing Organization Virtual Data Center Networks](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Tenant-Portal-Guide/GUID-B208CDD2-5D46-4841-8F3C-BED9E4F27F07.html){: external}
* [Managing NSX Edge Gateways](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Tenant-Portal-Guide/GUID-45C0FEDF-84F2-4487-8DB8-3BC281EB25CD.html){: external}
* [Working with Virtual Machines](https://docs.vmware.com/en/VMware-Cloud-Director/10.4/VMware-Cloud-Director-Tenant-Portal-Guide/GUID-DF0C111D-B638-4EC3-B805-CC33994F8D53.html){: external}





