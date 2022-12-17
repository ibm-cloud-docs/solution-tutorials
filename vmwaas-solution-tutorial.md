VMware as a Service

The purpose of this guide is to provide a quick guided tutorial that can be used both internally and externally to demonstrate the basic initial steps of operationalizing a VMware as a Service – single tenant instance after provisioning. The steps that follow will create a basic working environment for a client, providing a network, basic firewall and network address translation (NAT) implementation, and a test virtual machine that demonstrates that the end-to-end environment is functional.

This guide is broken into five steps to make implementation easier. These steps are:
1.	Log into the instance and deploy the initial network
2.	Create a NAT rule to allow virtual machines to access the Internet
3.	Create an IP set
4.	Create a firewall rule to allow the initial network to access resources outside the instance
5.	Create a virtual machine and validate the deployment

This guide should take around ten minutes to complete and assumes VMware as a Service – single tenant has already been provisioned.
#


<!-- comment for copy paste caracters like: #  -->