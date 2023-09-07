---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-08-28"
lasttested: "2023-08-28"

content-type: tutorial
# services is a comma-separated list of doc repo names as taken from https://github.ibm.com/cloud-docs/
services: vpc, openshift
account-plan: paid
completion-time: 1h
# use-case is a comma-separated list or yaml bullet format. Select one or more use cases that represent your architecture from the Digital Taxonomy [use case](https://github.ibm.com/digital/taxonomy/blob/main/subsets/use_cases/use_cases_flat_list.csv) list. Use the value in the code column. The list available under [Topics](https://github.ibm.com/digital/taxonomy/blob/main/topics/topics_flat_list.csv) can also be used, but don't go too crazy.
use-case: usecase1, usecase2
---

{{site.data.keyword.attribute-definition-list}}

# Connect a VPC landing zone to a network by using a site-to-site VPN
{: #connect-landingzone-site-vpn}
{: toc-content-type="tutorial"}
{: toc-services="vpc, openshift, iaas-vpn"}
{: toc-completion-time="1h"}

In this tutorial, you use {{site.data.keyword.cloud_notm}} {{site.data.keyword.vpn_vpc_short}} to connect your VPC landing zone deployable architectures securely to an on-premises network through a site-to-site VPN tunnel. You configure a strongSwan VPN gateway to connect to {{site.data.keyword.vpn_vpc_short}}.
{: shortdesc}

strongSwan is an open source IPsec-based VPN solution. For more information about strongSwan, see [Introduction to strongSwan](https://docs.strongswan.org/docs/5.9/howtos/introduction.html){: external}.

## Objectives
{: #solution-connect-site-vpn-objectives}

You deployed one of the {{site.data.keyword.cloud_notm}} landing zone deployable architectures, such as [Red Hat OpenShift Container Platform on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}, [VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vpc-9fc0fa64-27af-4fed-9dce-47b3640ba739-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}, or [VSI on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vsi-ef663980-4c71-4fac-af4f-4a510a9bcf68-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}. In the {{site.data.keyword.cloud_notm}} console, you can see that the cluster is created and healthy.

Next ...

To Do: Add the objectives or problem solved
{: attention}

## Before you begin
{: #solution-connect-site-vpn-prereqs}

- Deploy an instance of a VPC landing zone deployable architecture. For more information, see [Deploying a landing zone deployable architecture](/docs/secure-infrastructure-vpc?topic=secure-infrastructure-vpc-deploy).
- Create a VSI with any Linux-based OS in different Virtual Private Cloud(VPC), subnet, with default ACL rules, and a security group that allows SSH access. Ensure that the VSI is assigned a floating IP, which will be used for SSH access to the machine. To simulate an on-premises network, these steps assume that a VSI is deployed onto a separate VPC.

Here are some of the assumptions before we begin with the tutorial:
1. Steps are specific to CentOS.
1. VPN gateway is deployed on the landing zone VPC named `management-vpc`.
1. Your deployable architecture includes a VSI in the management-vpc. For this, you can deploy `VSI on VPC landing zone` from the catalog.
{: remember}

## Set up Strongswan
{: #strongswan-setup}
{: step}

For more information about how to install strongSwan on a different operating system, see the [installation documentation](https://docs.strongswan.org/docs/5.9/install/install.html).{: external}
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

        ```text
         conn all
             type=tunnel
             auto=start
             esp=aes256-sha256!
             ike=aes256-sha256-modp2048!
             left=%any
             leftsubnet=10.160.x.x/26                    #<== 1. Subnet CIDR of your on-premises network
             rightsubnet=10.10.30.0/24,10.20.10.0/24     #<== 2. Subnet CIDR of the Landing Zone VPN gateway, Subnet CIDR of the Management VSI
             right=169.61.x.x                            #<== 3. Public IP of the VPN gateway
             leftauth=psk
             rightauth=psk
             leftid="169.45.x.x"                         #<== 4. Public IP of your strongSwan server
             keyexchange=ikev2
             lifetime=10800s
             ikelifetime=36000s
             dpddelay=30s
             dpdaction=restart
             dpdtimeout=120s
        ```
        {: codeblock}

        1. Subnet of your on-premises network:
           - Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Virtual server instances** from the **Compute** section.
           - Select the VSI which has strongSwan gateway installed.
           - Scroll down in the Instance details page.
           - Click the highlighted subnet name of the interface which has the floating IP assigned to it in the **Network Interfaces** section.
           - Here you can find the **Subnet CIDR of your on-premises network** under IP range.
        1. Subnet CIDR of the Landing Zone VPN gateway:
           - Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **VPN** from the **Network** section.
           - Select the site-to-site VPN associated with your Landing Zone. For example: `management-gateway`
           - In the VPN gateway details page, click on Subnet.
           - This will take you to the subnet associated with your VPN gateway.
           - Here you can find the **Subnet CIDR of the Landing Zone VPN gateway** under IP range.
        1. Subnet CIDR of the Management VSI:
           - Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Subnets** from the **Network** section.
           - Search for subnets assoicated with the `management-vpc`.
           - From the list of subnets choose the subnet which has the management vsi deployed.
           - Copy the values from the IP range column.
        1. Public IP of the VPN gateway:
           - Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **VPN** from the **Network** section.
           - Select the site-to-site VPN associated with your Landing Zone. For example: `management-gateway`
           - In the VPN gateway details page, click on any one of the Public IP to copy it. Make sure to use that same IP on the strongSwan server side.
        1. Public IP of your strongSwan server:
           - Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Virtual server instances** from the **Compute** section.
           - Select the VSI which has strongSwan gateway installed.
           - Scroll down in the Instance details page.
           - Click the Floating IP associated with the subnet you chose in the Step 1 the **Network Interfaces** section.
1.  Configure a pre-shared key (PSK) for peer-to-peer authentication.
    1.  Generate a strong PSK for the peers to use for authentication:

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

    ```bash
    ❯ strongswan status
      Security Associations (0 up, 1 connecting):
            all[1]: CONNECTING, 10.160.x.x[%any]...169.61.x.x[%any]
    ```
    {: pre}

    It's normal for the status to show '0 up, 1 connecting' since we haven't set up the connection on the landing zone side.

## Edit the ACLs to allow connections from strongSwan
{: #solution-connect-site-vpn-strongswan-acls}
{: step}

1.  Click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Access control lists** from the **Network** section.
1.  Select the ACL `management-acl` that is associated with your landing zone deployable architecture `management-vpc` VPC.

1.  Create inbound rules for the on-premises subnet and public IP to access the VPN subnet.
    1.  Click **Create** in the inbound rules section.
    1.  Add two inbound rules with the following values:

        | Priority | Allow or deny | Protocol | Source | Destination |
        |----------|------------|----------|--------|-------------|
        | 1 | Allow | ALL | strongswan vsi public IP | LZ s2s VPN gateway's subnet |
        | 2 | Allow | ALL | strongswan vsi subnet CIDR | LZ VPC CIDR |
        | 3 | Allow | ALL | LZ VPC CIDR | strongswan vsi subnet CIDR |
        | 4 (optional) | Allow | ALL | strongswan vsi public IP | management vsi subnet CIDR |
        {: caption="Table 1. Inbound ACL rules" caption-side="bottom"}

1.  Create Outbound Rules for the VPN subnet and public IP to access the on-premises subnet.
    1.  Click **Create** in the Outbound rules section.
    1.  Add two outbound rules with the following values:

        | Priority | Allow or deny | Protocol | Source | Destination |
        |--------------|-----------|------|------|------|
        | 1 | Allow | ALL | LZ s2s VPN gateway's subnet | strongswan vsi public IP |
        | 2 | Allow | ALL | LZ VPC CIDR | strongswan vsi subnet CIDR |
        | 3 | Allow | ALL | strongswan vsi subnet CIDR | LZ VPC CIDR |
        | 4 (optional) | Allow | ALL | management vsi subnet CIDR | strongswan vsi public IP |      
        {: caption="Table 2. Outbound ACL rules" caption-side="bottom"}

## Create a VPN connection in the {{site.data.keyword.cloud_notm}} VPN
{: #create-vpn}
{: step}
1.  Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **VPN** from the **Network** section.
1.  Select the site-to-site VPN associated with your Landing Zone. For example: `management-gateway`
1.  On the gateway details page, click **Create** in the VPN connections section.
1.  Define a connection between this gateway and a network outside your VPC by specifying the following information:
    - **VPN connection name**: Enter a name for the connection, such as `my-connection`.
    - **Peer gateway address**: Specify the floating IP address of the strongSwan server.
    - **Pre-shared key**: Specify the authentication key of the VPN gateway. Make sure that you use the same pre-shared key that is mentioned in the strongSwan secrets.

    - **Create an IKE policy**
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

    -  **Create an IPsec policy**
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

1.  Click to the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Routing tables** from the **Network** section.
1.  Select the `management-vpc`.
1.  Click on the default routing table associated with the `management-vpc`. Note, that name can be created using a combination of random names.
1.  In Routes section and click **Create**.
1.  In the Create route panel, specify the following information:
    - **Zone**: Select the zone on which VPN gateway is deployed.
    - **Name**: Type a name for the new route.
    - **Destination CIDR**: Specify the subnet CIDR of your strongSwan vsi network.
    - **Action**: Select **Deliver** when the route destination is in the VPC or if an on-premises private subnet is connected with a VPN gateway.
    - **Next hop type**: Click **VPN connection** and select the VPN connection that you created in the previous step.
1.  Click **Save**.
1. Similarly, create a seperate route for the management vsi zone.
    - **Zone**: Select the zone on which management vsi is deployed.
    - **Name**: Type a name for the new route.
    - **Destination CIDR**: Specify the subnet CIDR of your strongSwan vsi network.
    - **Action**: Select **Deliver** when the route destination is in the VPC or if an on-premises private subnet is connected with a VPN gateway.
    - **Next hop type**: Click **VPN connection** and select the VPN connection that you created in the previous step.
1.  Click **Save**.

## Check Strongswan Status
{: #strongswan-status}
{: step}

Once all the above setup is complete, you can check the status of the strongswan process in the strongswan vsi.
1. Restart the strongSwan service.

    ```sh
    systemctl restart strongswan
    ```
    {: pre}

1. Check the status of connections.
    ```bash
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

1.  Access the strongswan vsi. On your computer, issue the following command from the terminal or command window:
    ```sh
    ssh -i <private-key> root@<Floating IP of strongswan vsi>
    ```
    {: pre}

1.  Access the Management VSI by completing the following steps:
    1. Go to **Virtual server instances** for VPC. Take note of the private IP(“Reserved IP”) for the VSI labeled <management-server-2> (10.20.10.4 in this example).
    1. On the strongswan vsi, you can ping the management vsi.
       ```bash
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
    1. You could also get ssh access to the <management-server-2>. Copy the private key that corresponds to the public key used to deploy the landing zone to the strongswan vsi and run the following command in the strongswan terminal:
    ```
    ssh -i <private-key> root@10.20.10.4
    ```
    {: pre}

## Summary
{: #solution-connect-site-vpn-summary}

To Do: Add a summary or next steps. Perhaps link to the client-to-site tutorial?
{: attention}
