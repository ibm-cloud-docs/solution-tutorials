---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-09-29"
lasttested: "2023-09-27"

content-type: tutorial
# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
services: vpc, virtual-servers
account-plan: paid
completion-time: 1h
# use-case is a comma-separated list or yaml bullet format. Select one or more use cases that represent your architecture from the Digital Taxonomy [use case](https://github.ibm.com/digital/taxonomy/blob/main/subsets/use_cases/use_cases_flat_list.csv) list. Use the value in the code column. The list available under [Topics](https://github.ibm.com/digital/taxonomy/blob/main/topics/topics_flat_list.csv) can also be used, but don't go too crazy.
use-case: Cybersecurity, VirtualPrivateCloud, VirtualMachines
---

{{site.data.keyword.attribute-definition-list}}

# Connect a VPC landing zone to a network by using a site-to-site VPN
{: #connect-landingzone-site-vpn}
{: toc-content-type="tutorial"}
{: toc-services="vpc, virtual-servers"}
{: toc-completion-time="1h"}

In this tutorial, you use {{site.data.keyword.cloud_notm}} {{site.data.keyword.vpn_vpc_short}} to connect your VPC landing zone deployable architectures securely to an on-premises network through a site-to-site VPN tunnel. You configure a strongSwan VPN gateway to connect to {{site.data.keyword.vpn_vpc_short}}.
{: shortdesc}

strongSwan is an open source IPsec-based VPN solution. For more information about strongSwan, see [Introduction to strongSwan](https://docs.strongswan.org/docs/5.9/howtos/introduction.html){: external}.

## Objectives
{: #solution-connect-site-vpn-objectives}

You deployed one of the {{site.data.keyword.cloud_notm}} landing zone deployable architectures, like [Red Hat OpenShift Container Platform on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}, [VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vpc-9fc0fa64-27af-4fed-9dce-47b3640ba739-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external} or [VSI on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vsi-ef663980-4c71-4fac-af4f-4a510a9bcf68-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}. The virtual servers are created and working correctly.

By default, network access to the VPC landing zone topology is locked down for security compliance reasons, so you can't access the management or workload VSIs. How can you deploy your application in the workload VSIs that are located in the workload VPC?

The answer is by assigning operator access through the Management VPC. You have several options to give operator access, with varying levels of security, compliance, and ease of enablement.

- [Client to Site with {{site.data.keyword.cloud_notm}} VPN Server and VPN Client](/docs/vpc?topic=vpc-vpn-client-to-site-overview) - Configure a VPN client application on your device to create a secure connection to your VPC network that uses {{site.data.keyword.cloud_notm}} VPN server. The VPN server service has a high availability mode for production use and is managed by IBM.
- [Site to Site VPC VPN Gateway](/docs/vpc?topic=vpc-using-vpn&interface=cli) - Configure your on-premises VPN to connect to an {{site.data.keyword.cloud_notm}} VPN Gateway by using a statically route-based VPN or a policy-based VPN to set up an IPsec site-to-site tunnel between your VPC and your on-premises private network or another VPC.
- [{{site.data.keyword.dl_short}}](/docs/vpc?topic=vpc-end-to-end-private-connectivity-vpe&interface=cli) - You can establish a direct network connection between your on-premises network and {{site.data.keyword.dl_full_notm}}.
- [Access from another VPC by using {{site.data.keyword.tg_short}}](/docs/vpc?topic=vpc-end-to-end-private-connectivity-vpe&interface=cli) - Access from another {{site.data.keyword.vpc_short}} to your VPC can be achieved by using {{site.data.keyword.tg_full_notm}}.

<!--
![Architecture diagram of site-to-site-VPN connection with strongSwan](images/connect-landingzone-site2site-hidden/s2s-strongswan-architecture.svg){: caption="Figure 1. VPC landing zone connected to a network with a site-to-site VPN and strongSwan" caption-side="bottom"}
 -->

In this tutorial, we can learn on how to set up a site-to-site VPN connection to your on-premises network.

## Before you begin
{: #solution-connect-site-vpn-prereqs}

- Deploy an instance of a VPC landing zone deployable architecture. For more information, see [Deploying a landing zone deployable architecture](/docs/secure-infrastructure-vpc?topic=secure-infrastructure-vpc-deploy).
- Create a VSI with any Linux-based OS in different Virtual Private Cloud(VPC), subnet, with default ACL rules, and a security group that allows SSH access. Make sure that the VSI is assigned a floating IP, which is used for SSH access to the machine. To simulate an on-premises network, these steps assume that a VSI is deployed onto a separate VPC.

The tutorial is based on the following assumptions:

- The operating system is CentOS. For more information about other VPN configurations, see [Configuring the on-premises VPN gateway](https://cloud.ibm.com/docs/vpc?topic=vpc-vpn-onprem-example#configuring-onprem-gateway).
- The VPN gateway is deployed on a landing zone VPC that is named `management-vpc`.
- Your deployable architecture includes a VSI in `management-vpc` that is supported by the VSI on VPC landing zone deployable architecture in the {{site.data.keyword.cloud_notm}} catalog.

## Set up Strongswan
{: #strongswan-setup}
{: step}

For more information about how to install strongSwan on an operating system other than CentOS, see the [installation documentation](https://docs.strongswan.org/docs/5.9/install/install.html).{: external}
{: tip}

1.  Enable IP forwarding:
    1.  Open the `/etc/sysctl.conf` file in a text editor and add the following line:

        ```text
        net.ipv4.ip_forward = 1
        ```
        {: codeblock}

    1.  Save and close the file.
    1.  Apply the changes with the following command:

        ```sh
        sudo sysctl -p
        ```
        {: pre}

1.  Install strongSwan:

    ```sh
    sudo dnf install epel-release -y
    ```
    {: pre}

    ```sh
    sudo dnf install strongswan -y
    ```
    {: pre}

1.  Start the strongSwan service and enable it to start at system startup:

    ```sh
    systemctl start strongswan
    ```
    {: pre}

    ```sh
    systemctl enable strongswan
    ```
    {: pre}

    ```sh
    systemctl status strongswan
    ```
    {: pre}

1.  Configure security gateways:
    1.  Open the `/etc/strongswan/ipsec.conf` file:

        In the following example, a connection is defined between the on-premises subnet `10.160.x.x/26` with the IP address `169.45.x.x` for the strongSwan VPN gateway and the deployable architecture VPN gateway and management VSI subnets `10.10.30.0/24,10.20.10.0/24` with a {{site.data.keyword.vpn_vpc_short}} gateway IP address `169.61.x.x`.

        ```text
         conn all
             type=tunnel
             auto=start
             esp=aes256-sha256!
             ike=aes256-sha256-modp2048!
             left=%any
             leftsubnet=10.160.x.x/26                    #<== c. Subnet CIDR of your on-premises network
             rightsubnet=10.10.30.0/24,10.20.10.0/24     #<== d, e. Subnet CIDR of the deployable architecture VPN gateway. Subnet CIDR of the Management VSI
             right=169.61.x.x                            #<== f. Public IP of the VPN gateway
             leftauth=psk
             rightauth=psk
             leftid="169.45.x.x"                         #<== g. Public IP of your strongSwan server
             keyexchange=ikev2
             lifetime=10800s
             ikelifetime=36000s
             dpddelay=30s
             dpdaction=restart
             dpdtimeout=120s
        ```
        {: codeblock}

    1.  Click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Virtual server instances** from the **Compute** section.
    1.  Specify the subnet of your on-premises network:
        1.  Select the VSI that has the strongSwan gateway installed.
        1.  In the **Network Interfaces** section, click the subnet name of the interface that has the floating IP assigned to it.
        1.  Copy the subnet IP range of your on-premises network to the `leftsubnet` property in the `ipsec.conf` file.
    1.  Specify the CIDR of the management VSI:
        1.  Click **Subnets** in the **Network** section to open the Subnets for VPC page.
        1.  Search for subnets associated with the management VPC (in our example, `management-vpc`).
        1.  From the list of subnets, click the subnet name with the management VSI deployed.
        1.  Copy the subnet IP range column to the `rightsubnet` property in the `ipsec.conf` file.
    1.  Specify the CIDRs of the landing zone VPN gateway:
        1.  Click **VPNs** in the **Network** section to open the VPNs for VPC page.
        1.  Make sure that the **Site-to-site gateways** > **VPN gateways** tabs are selected.
        1.  Select the site-to-site VPN associated with your landing zone deployable architecture (in our example, `management-gateway`).
        1.  On the VPN gateway details page, click **Subnet** to see details about the subnet associated with your VPN gateway.
        1.  Copy the subnet IP range column of the deployable architecture VPN gateway.

            Copy the IP range to the beginning of the `rightsubnet` property in the `ipsec.conf` file. Separate this range from the CIDR of the management VSI with a comma, as shown in the example.
    1.  Specify the public IP address of the VPN gateway:
        1.  On the VPNs for VPC page, make sure that the **Site-to-site gateways** > **VPN gateways** tabs are selected.
        1.  Select the site-to-site VPN associated with your landing zone deployable architecture again (in our example, `management-gateway`).
        1.  In the VPN gateway details page, click any Public IP to copy it and paste it in the `right` property in the `ipsec.conf` file.
    1.  Verify the public IP of your strongSwan server:
        - Click **Virtual server instances** in the **Compute** section.
        - Click the name of the VSI that has the strongSwan gateway installed.
        - Click the Floating IP that is associated with the subnet you chose in the Step 1 in the **Network Interfaces** section.
        - Paste the IP address in the `leftid` property to identify the IP address of the strongSwan server.
1.  Configure a pre-shared key (PSK) for peer-to-peer authentication.
    1.  On the command line, issue the following command to generate a strong PSK for the peers to use:

        ```sh
        head -c 24 /dev/urandom | base64
        ```
        {: pre}

    1.  Add the PSK to the `/etc/strongswan/ipsec.secrets` file.

        ```text
        # <Public IP of your strongSwan server> <Public IP of the Landing Zone VPN gateway> : PSK "***********"
        169.45.x.x  169.61.x.x : PSK "***********"
        ```
        {: codeblock}

1.  Start the strongSwan service and check the status of connections.

    ```sh
    systemctl restart strongswan
    ```
    {: pre}

    ```sh
    ❯ strongswan status
      Security Associations (0 up, 1 connecting):
            all[1]: CONNECTING, 10.160.x.x[%any]...169.61.x.x[%any]
    ```
    {: screen}

    It's normal for the status to show '0 up, 1 connecting' because the connection on the landing zone side is not yet set up.

## Edit the ACLs to allow connections from strongSwan
{: #solution-connect-site-vpn-strongswan-acls}
{: step}

1.  In the {{site.data.keyword.cloud_notm}} console, click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Access control lists** from the **Network** section.
1.  Select the ACL `management-acl` that is associated with your landing zone deployable architecture VPC (in our example, `management-vpc`).

1.  Create inbound rules for the on-premises subnet and public IP to access the VPN subnet.
    1.  Click **Create** in the inbound rules section.
    1.  Add two inbound rules with the following values:

        | Priority | Allow or deny | Protocol | Source | Destination |
        |----------|------------|----------|--------|-------------|
        | 1 | Allow | ALL | strongSwan VSI public IP | LZ s2s VPN gateway's subnet |
        | 2 | Allow | ALL | strongSwan VSI subnet CIDR | LZ VPC CIDR |
        | 3 | Allow | ALL | LZ VPC CIDR | strongSwan VSI subnet CIDR |
        | 4 | Allow | ALL | strongSwan VSI public IP | Management VSI subnet CIDR |
        {: caption="Table 1. Inbound ACL rules" caption-side="bottom"}

1.  Create outbound rules for the VPN subnet and public IP to access the on-premises subnet.
    1.  Click **Create** in the Outbound rules section.
    1.  Add two outbound rules with the following values:

        | Priority | Allow or deny | Protocol | Source | Destination |
        |--------------|-----------|------|------|------|
        | 1 | Allow | ALL | LZ s2s VPN gateway's subnet | strongSwan VSI public IP |
        | 2 | Allow | ALL | LZ VPC CIDR | strongSwan VSI subnet CIDR |
        | 3 | Allow | ALL | strongSwan VSI subnet CIDR | LZ VPC CIDR |
        | 4 | Allow | ALL | Management VSI subnet CIDR | strongSwan VSI public IP |
        {: caption="Table 2. Outbound ACL rules" caption-side="bottom"}

## Create a VPN connection in the {{site.data.keyword.cloud_notm}} VPN
{: #create-vpn}
{: step}

1.  Click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **VPN** from the **Network** section.
1.  Select the site-to-site VPN that is associated with your landing zone deployable architecture (in our example, `management-gateway`).
1.  On the gateway details page, click **Create** in the VPN connections section.
1.  Define a connection between this gateway and a network outside your VPC by specifying the following information:
    - **VPN connection name**: Enter a name for the connection, such as `my-connection`.
    - **Peer gateway address**: Specify the floating IP address of the strongSwan server.
    - **Pre-shared key**: Specify the authentication key of the VPN gateway. Make sure that you use the same pre-shared key that is mentioned in the strongSwan secrets.

    1.  Create an IKE policy:
        1.  From the VPN connection for VPC page, select **Create IKE policy**.
        1.  Specify the following information:
            - **Name**: Enter a name for the IKE policy.
            - **Resource group**: Select the resource group for this IKE policy.
            - **IKE version**: Set the IKE protocol version to `2`.
            - **Encryption**: Encryption algorithm to use for IKE Phase 1. Set Encryption to `aes256`.
            - **Authentication**: Authentication algorithm to use for IKE Phase 1. Set Authentication to `sha256`.
            - **Diffie-Hellman group**: DH group to use for IKE Phase 1. Set DH group to `14`
            - **Key lifetime**: Lifetime in number of seconds of Phase 1 tunnel. Set Key lifetime to `36000`
        1.  Click **Create**.
    1.  Create an IPsec policy:
        1.  From the VPN connection for VPC page, select **Create IPsec policy**.
        1.  Specify the following information:
            - **Name**: Enter a name for the IPsec policy.
            - **Resource group**: Select the resource group for this IPsec policy.
            - **Encryption**: Encryption algorithm to use for IKE Phase 2. Set Encryption to `aes256`.
            - **Authentication**: Authentication algorithm to use for IKE Phase 2. Set Authentication to `sha256`.
            - **Perfect Forward Secrecy**: Disable PFS.
            - **Diffie-Hellman Group (If PFS is enabled)**: DH group to use for IKE Phase 2 key exchange. When PFS is disabled, the DH group is set to `14` by default.
            - **Key lifetime**: Lifetime in number of seconds of the Phase 2 tunnel. Set the lifetime to `10800`.
        1.  Click **Create**.
1.  Click **Create VPN connection**.

## Create a route in the UI
{: #strongswan-create-route}
{: step}

Follow these steps to create a route to control how the destination network traffic is directed.

1.  Click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Routing tables** from the **Network** section.
1.  Select the management VPC (in our example, `management-vpc`).
1.  Click the default routing table that is associated with `management-vpc`.
1.  In the Routes section, click **Create**.
1.  On the Create route page, specify the following information:
    - **Zone**: Select the zone on which the VPN gateway is deployed.
    - **Name**: Type a name for the new route.

        You can create a name by using a combination of random names.
        {: tip}

    - **Destination CIDR**: Specify the subnet CIDR of your strongSwan VSI network.
    - **Action**: Select **Deliver** when the route destination is in the VPC or if an on-premises private subnet is connected with a VPN gateway.
    - **Next hop type**: Click **VPN connection** and select the VPN connection that you created in the previous step.
1.  Click **Save**.
1.  Similarly, create a separate route for the management VSI zone.
    - **Zone**: Select the zone on which management VSI is deployed.
    - **Name**: Type a name for the new route.
    - **Destination CIDR**: Specify the subnet CIDR of your strongSwan VSI network.
    - **Action**: Select **Deliver** when the route destination is in the VPC or if an on-premises private subnet is connected with a VPN gateway.
    - **Next hop type**: Click **VPN connection** and select the VPN connection that you created in the previous step.
1.  Click **Save**.

## Check Strongswan Status
{: #strongswan-status}
{: step}

After you complete the previous steps, check the status of the strongSwan process in the strongSwan VSI.

1.  Restart the strongSwan service.

    ```sh
    systemctl restart strongswan
    ```
    {: pre}

1.  Check the status of connections.
    ```sh
    ❯ strongswan status
      Security Associations (1 up, 0 connecting):
            all[1]: ESTABLISHED 59 minutes ago, 10.160.x.x[169.45.x.x]...169.61.x.x[169.61.x.x]
            all{1}:  INSTALLED, TUNNEL, reqid 1, ESP in UDP SPIs: cfbbd5d9_i c864dc75_o
            all{1}:   10.160.x.x/24 === 10.10.10.0/24 10.20.10.0/24
    ```
    {: pre}

## Test the site-to-site gateway setup
{: #test-connection}
{: step}

Follow these steps to verify that you have a working site-to-site gateway.

1.  Access the strongSwan VSI. On your computer, issue the following command on the command line:

    ```sh
    ssh -i <private-key> root@<Floating IP of strongswan VSI>
    ```
    {: pre}

1.  Access the management VSI by completing the following steps:
    1.  Go to **Virtual server instances** for VPC. Copy the private IP (“Reserved IP”) for the VSI that's labeled `<management-server-2>` (10.20.10.4 in this example).
    1.  On the strongSwan VSI, ping the management VSI.

       ```sh
       ❯ ping 10.20.10.4
       PING 10.20.10.4 (10.20.10.4) 56(84) bytes of data.
       64 bytes from 10.20.10.4: icmp_seq=1 ttl=62 time=99.5 ms
       64 bytes from 10.20.10.4: icmp_seq=2 ttl=62 time=99.4 ms
       64 bytes from 10.20.10.4: icmp_seq=3 ttl=62 time=99.4 ms
       ^C
       --- 10.20.10.4 ping statistics ---
       3 packets transmitted, 3 received, 0% packet loss, time 2003ms
       rtt min/avg/max/mdev = 99.415/99.462/99.502/0.035 ms
       ```
       {: pre}

    1.  You can also SSH to `<management-server-2>`. Copy the private key that corresponds to the public key used to deploy the landing zone to the strongSwan VSI and run the following command on the strongSwan command line:

    ```sh
    ssh -i <private-key> root@10.20.10.4
    ```
    {: pre}

## Summary
{: #solution-connect-site-vpn-summary}

After you set up the site-to-site VPN to the management VPC, you can access the workload VPC through the management VSIs with the necessary ACL rules in place. With an established connection to the workload VPC, you can deploy your application on the workload VSIs.

## Related content
{: #connect-site-vpn-related}

Tutorial: [Connect to a VPC landing zone by using a client-to-site VPN](/docs/solution-tutorials?topic=solution-tutorials-connect-landingzone-client-vpn)
