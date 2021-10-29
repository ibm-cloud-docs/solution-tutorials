---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-10-29"
lasttested: "2021-10-29"

content-type: tutorial
services: vmwaresolutions
account-plan: paid
completion-time: 45m
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

# Setup SSL VPN Client
{: #vmware-onboarding-ssl-vpn-client}
{: toc-content-type="tutorial"}
{: toc-services="vmwaresolutions"}
{: toc-completion-time="1h"}

<!--##istutorial#-->

In this section of the deployment journey, a SSL VPN client is configured. The SSL VPN client establishes connectivity with the IBM Cloud Classic Infra. 

![Architecture](images/solution-vmware-onboarding-hidden/ssl-vpn/journey-map.png){: class="center"}


As shown in the architecute below, the SSL VPN allows you to connect to the 10.x.x.x Private IPs of the  VCS Cluster for managemenet and configuration purposes.  For production, businesses will typically establish network connectivity to the IBM Cloud Classic Infra via Direct Link or Site-to-Site VPN, but having the SSL VPN client configured is useful for initial configuration and/or to serve as a backup.
{: tip}

<!--#/istutorial#-->

![Architecture](images/solution-vmware-onboarding-hidden/ssl-vpn/architecture-sslvpn-callout.jpg){: class="center"}




## Video Walk Through
{: #vmware-onboarding-ssl-vpn-client-video-intro}



<!--##istutorial#-->
## Detailed Instructions
{: #vmware-onboarding-ssl-vpn-client-instructions}

Complete the steps on the VPN [Getting started](https://{DomainName}/docs/iaas-vpn?topic=iaas-vpn-getting-started#enable-user-vpn-access) page to:

1. Enable SSL VPN access for your account
2. Set the SSL VPN password
3. Login to the VPN

Once connected, validate connectivity by pinging the vCenter IP and/or opening the vCenter console:

![Architecture](images/solution-vmware-onboarding-hidden/ssl-vpn/vcenter-ips.png){: class="center"}

<!--#/istutorial#-->


## Next Steps
{: #vmware-onboarding-ssl-vpn-client-next-steps}

The next step in the tutorial series is:

* [Order vCenter Server cluster w/NSX-T and NFS Storage](/docs/solution-tutorials?topic=solution-tutorials-vmware-onboarding-order-cluster-storage)

