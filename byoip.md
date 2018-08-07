---
copyright:
  years: 2018
lastupdated: "2018-07-31"
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

# Bring Your Own IP Address

Bring Your own IP (BYOIP) is a frequent requirement where its desired to connect existing client networks to infrastructure provisioned on the {{site.data.keyword.Bluemix_notm}}. The intent is typically to minimize change to the clients network routing configuration and operations with the adoption of a single IP address space based on the clients existing IP addressing scheme.

This tutorial presents a brief overview of BYOIP implementation patterns that can be used with {{site.data.keyword.Bluemix_notm}} and a decision tree for identifying the appropriate pattern when realising the secure enclosure as described in the [Isolate workloads with a secure private network](./secure-network-enclosure.html) tutorial. Setup may require additional input from your onsite network team, {{site.data.keyword.Bluemix_notm}} technical support or IBM Services.

{:shortdesc}

## Objectives
{: #objectives}

* Understand BYOIP implementation patterns
* Select implementation pattern for {{site.data.keyword.Bluemix_notm}}.

## {{site.data.keyword.Bluemix_notm}} IP addressing

The {{site.data.keyword.Bluemix_notm}} utilizes a number of private address ranges, most specifically 10.0.0.0/8, and in some cases these ranges may conflict with existing client networks. Where address conflicts exist, there are a number of patterns that support BYOIP to allow interoperability with the IBM Cloud network.

-	Network Address Translation
-	GRE (Generic Routing Encapsulation) tunneling
-	GRE tunneling with IP alias
-	Virtual Overlay Network

The choice of pattern is determined by the applications intended to be hosted on the {{site.data.keyword.Bluemix_notm}}. There are two key aspects, application sensitivity to the pattern implementation and the extent of overlap of address ranges between the client network and {{site.data.keyword.Bluemix_notm}}. Additional considerations will also apply if there is an intent to use a dedicated private network connection to {{site.data.keyword.Bluemix_notm}}. The documentation for [{{site.data.keyword.BluDirectLink}}
](../infrastructure/direct-link/subnet-configuration.html#configure-ibm-cloud-direct-link) is recommended reading for all users considering BYOIP. For {{site.data.keyword.BluDirectLink}} users, the associated guidance should be followed in deference to the information presented here.

## Implementation patterns overview
{: #patterns_overview}

1. **NAT**: NAT address translation at the on-premise client router. Perform on premise NAT to translate the client addressing scheme to the IP addresses assigned by {{site.data.keyword.Bluemix_notm}} to provisioned IaaS services.  
2. **GRE Tunneling**: The addressing scheme is unified by routing IP traffic over a GRE tunnel between {{site.data.keyword.Bluemix_notm}} and the on-premise network, typically via VPN. This is the scenario illustrated in [this tutorial](./configuring-IPSEC-VPN.html). 

   There are two sub-patterns depending on the potential for address space overlap.
     * No Address Overlapping: when there’s no address overlap of address ranges and risk of conflict between the networks.
     * Partial Address Overlapping: when the client and {{site.data.keyword.Bluemix_notm}} IP address spaces use the same address range and there is potential for overlap and conflict. In this case client subnet addresses are chosen which don’t overlap in {{site.data.keyword.Bluemix_notm}} private network.

3. GRE Tunneling + IP alias 
The addressing scheme is unified by routing IP traffic over a GRE tunnel between the on-premise network and alias IP addresses assigned to servers on the {{site.data.keyword.Bluemix_notm}} . This is a special case of the scenario illustrated in [this tutorial](./configuring-IPSEC-VPN.html). An additional interface and IP alias for a compatible IP subnet is created on the virtual and bare-metal servers provisioned on the {{site.data.keyword.Bluemix_notm}}, supported by appropriate routing configuration on the VRA.

4. Virtual Overlay Network
[{{site.data.keyword.Bluemix_notm}} Virtual Private Cloud (VPC)](../infrastructure/vpc/) supports BYOIP for fully virtual environments on the {{site.data.keyword.Bluemix_notm}}. It could be considered as an alternative to the secure private network enclosure described in [this tutorial](./secure-network-enclosure.html).

Alternatively consider a solution such as VMware NSX that implements a virtual overlay network in a layer over the [{{site.data.keyword.Bluemix_notm}} network. All BYOIP addresses in the virtual overlay are independent of [{{site.data.keyword.Bluemix_notm}} network address ranges. See [Getting started with VMware and [{{site.data.keyword.Bluemix_notm}}](../infrastructure/vmware/vmware_index.html#getting-started-with-vmware-and-ibm-cloud).

## Pattern decision tree
{: #decision_tree}

The decision tree here can be used to determine the appropriate implement pattern. 

<p style="text-align: center;">

  ![](images/solution37-byoip/byoipdecision.png)
</p>

The following notes provide further guidance:

### Is NAT problematic for your applications?
{: #nat_consideration}

There are following two distinctive cases where NAT could be problematic. In these cases, NAT should not be used. 

- Some applications such as Microsoft AD domain communication, and P2P applications could have technical problems with NAT.
- Where unknown servers need to communicate with the [{{site.data.keyword.Bluemix_notm}} or hundreds of bidirectional connections between [{{site.data.keyword.Bluemix_notm}} and on-premise servers are required. In this case all the mapping cannot be configured on the client router/NAT table because of an inability to identify the mapping beforehand.


### No address overlapping
{: #no-overlap}

Is 10.0.0.0/8 used in the on-premise network? When no address overlaps exist between the on-premise and the [{{site.data.keyword.Bluemix_notm}} private network, GRE tunneling as described in [this tutorial](./configuring-IPSEC-VPN.html) can be used between on-premise and IBM Cloud to avoid the need for NAT translation. This requires a review of network address usage with on-site network team. 

### Partial address overlapping
{: #partial_overlap}

If any of the 10.0.0.0/8 range is in use on the on-premise network, are there non-overlapping subnets available on the [{{site.data.keyword.Bluemix_notm}} network? Review existing network address usage with on-site network team and contact [{{site.data.keyword.Bluemix_notm}} technical sales to identify available non-overlapping networks. 

### Is IP aliasing problematic?
{: #ip_alias}

If no overlap-safe addresses exist, IP aliasing can be implemented on virtual and bare-metal servers deployed in the secure private network enclosure. IP aliasing assigns multiple subnet addresses on one or more network interfaces on each server. 

IP aliasing is a commonly used technique, though it is recommended to review server and application configurations to determine if they work well under multi-home and IP alias configurations.  

Additional routing configuration on the VRA will be required to create dynamic routes (e.g. BGP) or static routes for the BYOIP subnets. 

## Related content
{: #related}

- [{{site.data.keyword.BluDirectLink}}
]( https://console.bluemix.net/docs/infrastructure/direct-link/subnet-configuration.html#configure-ibm-cloud-direct-link)
- [Virtual Private Cloud (VPC)](https://console.bluemix.net/docs/infrastructure/vpc/about.html#cloud-native-workloads-generally-require-)
