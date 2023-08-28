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
- Create a VSI with any Linux-based OS on a different VPC. To simulate an on-premises network, these steps assume that a VSI is deployed onto a separate VPC.

## Set up Strongswan
{: #strongswan-setup}
{: step}

The following steps are specific to CentOS. For more information about how to install strongSwan on a different operating system, see the [installation documentation](https://docs.strongswan.org/docs/5.9/install/install.html).{: external}
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
    sudo dnf install epel-release
    ```
    {: pre}

    ```sh
    sudo dnf install strongswan
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
             leftsubnet=10.160.x.x/26      <== Subnet of your on-premises network
             rightsubnet=192.168.x.x/28    <== 1. Subnet in which VPN gateway is deployed
             right=169.61.x.x              <== 2. Public IP of the VPN gateway
             leftauth=psk
             rightauth=psk
             leftid="169.45.x.x"           <== Public IP of your strongSwan server
             keyexchange=ikev2
             lifetime=10800s
             ikelifetime=36000s
             dpddelay=30s
             dpdaction=restart
             dpdtimeout=120s
        ```
        {: codeblock}

1.  Configure a pre-shared key (PSK) for peer-to-peer authentication.
    1.  Generate a strong PSK for the peers to use for authentication:

        ```sh
        head -c 24 /dev/urandom | base64
        ```
        {: pre}

    1.  Add the PSK to the `/etc/strongswan/ipsec.secrets` file.

        ```text
        169.45.x.x  169.61.x.x : PSK "***********"
        ```
        {: codeblock}

1.  Start the strongSwan service and check the status of connections.

    ```sh
    systemctl restart strongswan
    ```
    {: pre}

    ```sh
    strongswan status
    ```
    {: pre}

## Edit the ACLs to allow connections from strongSwan
{: #solution-connect-site-vpn-strongswan-acls}
{: step}

1.  Click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **Access control lists** from the **Network** section.
1.  Select the ACL that is associated with your VPC landing zone deployable architecture.

1.  Create inbound rules for the on-premises subnet and public IP to access the VPN subnet.
    1.  Click **Create** in the inbound rules section.
    1.  Add two inbound rules with the following values:

        | Priority | Allow or deny | Protocol | Source | Destination |
        |----------|------------|----------|--------|-------------|
        | 1 | Allow | ALL | 169.45.74.119/32 | Any IP |
        | 2 | Allow | ALL | 10.160.26.64/26 | Any IP |
        {: caption="Table 1. Inbound ACL rules" caption-side="bottom"}

1.  Create Outbound Rules for the VPN subnet and public IP to access the on-premises subnet.
    1.  Click **Create** in the Outbound rules section.
    1.  Add two outbound rules with the following values:

        | Priority | Allow or deny | Protocol | Source | Destination |
        |--------------|-----------|------|------|------|
        | 1 | Allow | ALL | Any IP | 10.160.26.64/26 |
        | 2 | Allow | ALL | Any IP | 169.45.74.119/32 |
        {: caption="Table 2. Outbound ACL rules" caption-side="bottom"}

## Create a VPN connection in the {{site.data.keyword.cloud_notm}} VPN
{: #create-vpn}
{: step}

1.  On the gateway details page, click **Create** in the VPN connections section.
1.  Define a connection between this gateway and a network outside your VPC by specifying the following information:
    - **VPN connection name**: Enter a name for the connection, such as `my-connection`.
        - **Peer gateway address**: Specify the IP address of the VPN gateway for the network outside your VPC.
    - **Pre-shared key**: Specify the authentication key of the VPN gateway for the network outside your VPC. The pre-shared key is a string of hexadecimal digits, or a passphrase of printable ASCII characters. To be compatible with most peer gateway types, the string must follow these rules:
        - A combination of digits, lowercase or uppercase characters, or the following special characters: `- + & ! @ # $ % ^ - ( ) . , :`.
        - Between 6 - 128 characters in length.
        - Cannot start with `0x` or `0s`.

        Make sure that you use the same pre-shared key that is mentioned in the strongSwan secrets.
        {: remember}

1.  Create an IKE policy.
    1.  From the VPN connection for VPC page, select **Create IKE policy**.
    1.  Specify the following information:
        - **Name**: Enter a name for the IKE policy.
        - **Resource group**: Select the resource group for this IKE policy.
        - **IKE version**: Set the IKE protocol version to `2`. Some vendors do not support both IKE versions. Check with peer vendor documentation to verify IKE version support.
        - **Encryption**: Encryption algorithm to use for IKE Phase 1. Set Encryption to `aes256`.
        - **Authentication**: Authentication algorithm to use for IKE Phase 1. Set Authentication to `sha256`.
        - **Diffie-Hellman group**: DH group to use for IKE Phase 1. Set DH group to `14`
        - **Key lifetime**: Lifetime in number of seconds of Phase 1 tunnel. Set Key lifetime to `36000`
    1.  Click **Create**.
1.  Create an IPsec policy.
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
1.  Select the VPC that is associated with the instance of your VPC landing zone deployable architecture.
1.  Scroll to the Routes section and click **Create**.
1.  In the Create route panel, specify the following information:
    - **Name**: Type a name for the new route.
    - **Destination CIDR**: Specify a destination CIDR range for the destination network. For example, for an on-premises network, enter the IPv4 CIDR range of the site-to-site gateway connection.
    - **Action**: Select **Deliver** when the route destination is in the VPC or if an on-premises private subnet is connected with a VPN gateway.
    - **Next hop type**: Click **VPN connection** and select the VPN connection that you created in the previous step.
1.  Click **Save**.

## Test the site-to-site gateway setup
{: #test-connection}
{: step}

The following steps assume that your deployable architecture includes a private Red Hat OpenShift cluster that can be accessed only from the private network.
{: tip}

Follow these steps to verify that you have a working site-to-site gateway.

1.  Install the `kubectl` command-line tool on your computer.
1.  Download the `kubeconfig` configuration file for the Red Hat OpenShift cluster. For more information, see [Accessing Red Hat OpenShift clusters](https://cloud.ibm.com/docs/openshift?topic=openshift-access_cluster).
1.  Test the connection with the following commands:

    ```sh
    kubectl get pods
    ```
    {: pre}

1.  Verify the cluster information with the following command:

    ```sh
    kubectl cluster-info
    ```
    {: pre}

## Summary
{: #solution-connect-site-vpn-summary}

To Do: Add a summary or next steps. Perhaps link to the client-to-site tutorial?
{: attention}
