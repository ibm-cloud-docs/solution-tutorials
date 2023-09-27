---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-09-27"
lasttested: "2023-09-26"

content-type: tutorial
services: vpc, openshift, iaas-vpn
account-plan: paid
completion-time: 2h
# use-case is a comma-separated list or yaml bullet format. Select one or more use cases that represent your architecture from the Digital Taxonomy [use case](https://github.ibm.com/digital/taxonomy/blob/main/subsets/use_cases/use_cases_flat_list.csv) list. Use the value in the code column. The list available under [Topics](https://github.ibm.com/digital/taxonomy/blob/main/topics/topics_flat_list.csv) can also be used, but don't go too crazy.
use-case: usecase1, usecase2
---

{{site.data.keyword.attribute-definition-list}}

# Connect to a VPC landing zone by using a client-to-site VPN
{: #connect-landingzone-client-vpn}
{: toc-content-type="tutorial"}
{: toc-services="vpc, openshift, iaas-vpn"}
{: toc-completion-time="2h"}


This tutorial dives into the fastest option to get up and running with a [client VPN for VPC](/docs/vpc?topic=vpc-vpn-client-to-site-overview) connectivity. Rather than doing manual steps, you set up an automated way to create a client-to-site VPN connection to one or more landing zones in your account by using Terraform.
{: shortdesc}

## Objectives
{: #solution-connect-client-vpn-objectives}

- Create a client-to-site VPN connection between the private VPC network and clients by using Terraform automation that's packaged as a [deployable architecture](#x10293733){: term}.
- Add the deployable architecture to a private catalog in {{site.data.keyword.cloud_notm}} so you can share it with others in your organization.

### Problem
{: #solution-connect-client-vpn-problem}

Let's say that you deployed the [Red Hat OpenShift Container Platform on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external} deployable architecture. In the {{site.data.keyword.cloud_notm}} console, you can see that the cluster is created and healthy. When you try to access the Red Hat OpenShift web console on the management cluster, you see this error:

> It is not possible to access the Red Hat OpenShift console because the cluster is accessible only on the management VPC’s private network, which is locked down and not accessible from the internet.

You might also have connectivity issues to the VPC's private networks if you deploy the [VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vpc-9fc0fa64-27af-4fed-9dce-47b3640ba739-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}, [VSI on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vsi-ef663980-4c71-4fac-af4f-4a510a9bcf68-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}, or the [Red Hat OpenShift Container Platform on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external} deployable architecture.

For example, you ping the network but it times out:

```bash
ping 10.0.0.1
PING 10.0.0.1 (10.0.0.1): 56 data bytes
ping: sendto: Host is down
Request timeout for icmp_seq 0
ping: sendto: Host is down
Request timeout for icmp_seq 1
ping: sendto: Host is down
Request timeout for icmp_seq 2
ping: sendto: Host is down
Request timeout for icmp_seq 3
^C
--- 10.0.0.1 ping statistics ---
5 packets transmitted, 0 packets received, 100.0% packet loss
```
{: pre}

How can you securely access that private network to complete operations on resources within these VPCs?

### Solution
{: #solution-connect-client-vpn-solution}

Several methods exist to establish secure connections to a private VPC network:

- [Client-to-site VPN server and VPN Client](/docs/vpc?topic=vpc-vpn-client-to-site-overview) - Configure a VPN client application on your device to create a secure connection to your VPC network that uses {{site.data.keyword.cloud_notm}} VPN for VPC. The {{site.data.keyword.cloud_notm}} VPN server service has high availability mode for production use and is managed by {{site.data.keyword.IBM_notm}}.
- [Site-to-site VPC VPN gateway](/docs/solution-tutorials?topic=solution-tutorials-connect-landingzone-site-vpn) - Configure your on-premises VPN to connect to an {{site.data.keyword.cloud_notm}} VPN gateway by using a statically route-based VPN or a policy-based VPN to set up an IPsec site-to-site tunnel between your VPC and your on-premises private network or another VPC.
- [{{site.data.keyword.dl_short}}](/docs/vpc?topic=vpc-end-to-end-private-connectivity-vpe&interface=cli) - Establish a direct network connection between your on-premises network and {{site.data.keyword.dl_full_notm}}.
- [Access from a different VPC by using a transit gateway](/docs/vpc?topic=vpc-end-to-end-private-connectivity-vpe&interface=cli) - Access your {{site.data.keyword.vpc_short}} from another {{site.data.keyword.vpc_short}} by using {{site.data.keyword.tg_full_notm}}.

The VPC landing zone deployable architectures don't enable these connectivity options by default because the solution varies with the deployable architecture configuration.

In this tutorial, you enable the simplest method: a client-to-site VPN connection. But configuring even this option manually takes quite a few steps. You need a client-to-site VPC VPN server, {{site.data.keyword.security-groups_full}}, {{site.data.keyword.secrets-manager_full_notm}}, and certificates. Fortunately, {{site.data.keyword.IBM_notm}} provides these offerings in open source modules that are packaged as a deployable architecture to make the setup and configuration as easy as possible.

The Terraform module that you use in this tutorial creates a single zone client-to-site VPN in an existing landing zone management VPC. The default values in this module are designed to work with the default values used in all three variations of the landing zone deployable architectures: VPC, Red Hat OpenShift, and VSI.

The module creates and configures the following infrastructure:

- Creates an optional {{site.data.keyword.secrets-manager_short}} instance. You can pass a reference to an existing {{site.data.keyword.secrets-manager_short}} instance through the `existing_sm_instance_guid` input variable:
    - Configures a private certificate engine in the {{site.data.keyword.secrets-manager_short}} instance
    - Creates a secret group
    - Creates a private certificate (the "secret") from the private certificate engine in the secret group
- Creates a subnet named `client-to-site-subnet` in the landing zone management VPC.

   The network ACL on this subnet grants all access from any source.
- Creates a security group named `client-to-site-sg` that allows all incoming requests from any source.
- Creates an IAM access group that allows users to authenticate and connect to the client-to-site VPN gateway.
- Creates a client-to-site VPN gateway:
    - Uses the private certificate that is generated and stored in the {{site.data.keyword.secrets-manager_short}} instance
    - Locates the gateway in the `client-to-site-subnet` subnet
    - Attaches the `client-to-site-sg` to the client-to-site VPN gateway
    - Configures routes to allow access to the landing zone VPCs (management and workload)

### Architecture
{: #solution-connect-client-vpn-architecture}

![Architecture](images/connect-landingzone-client-vpn-hidden/c2s-basic.svg){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}

## Before you begin
{: #solution-connect-client-vpn-prereqs}

This tutorial requires the following setup:

- A [VPC landing zone deployable architecture](/docs/secure-infrastructure-vpc?topic=secure-infrastructure-vpc-overview).

    You also need some information from your VPC landing zone in the tutorial:
    - Find the `ID` and `region` of your landing zone’s management VPC. The Terraform module uses IDs rather than names.
- The list of users who will connect over the VPN connection to your {{site.data.keyword.cloud_notm}} account.

    The module takes a list of email addresses of the users in your {{site.data.keyword.cloud_notm}} account. For more information about how to add users, see [Inviting users to an account](/docs/account?topic=account-iamuserinv&interface=ui).
- If you have a {{site.data.keyword.secrets-manager_short}} instance, find the `GUID` and `region` of your {{site.data.keyword.secrets-manager_short}} instance by using the {{site.data.keyword.cloud_notm}} console.

    The Terraform module creates a {{site.data.keyword.secrets-manager_short}} instance if you don’t already have one.

    You can locate the {{site.data.keyword.secrets-manager_short}} GUID in your account from the resource explorer in the {{site.data.keyword.cloud_notm}} console:
    1.  Enter "secret" in the product filter. A list of {{site.data.keyword.secrets-manager_short}} instances ID displayed.
    1.  Click the item to show the sidebar details for the {{site.data.keyword.secrets-manager_short}} instance that you want to use.
    1.  Press the copy action to the right of the GUID field as shown in this screenshot:

    ![Example of resource list](images/connect-landingzone-client-vpn-hidden/secrets-manager-resource-list.png){: caption="Figure 1. Example view of the resource list in {{site.data.keyword.cloud_notm}} console" caption-side="bottom"}

## Set up the deployable architecture
{: #client-vpn-setup}
{: step}

A deployable architecture is IAC that's designed for easy deployment, scalability, and modularity. In this case, the deployable architecture represents a repeatable way to create client-to-site VPN connections for more than one landing zone in your org. It also simplifies how others in your company can set up more VPN connections for their landing zones.

A deployable architecture is a simple and repeatable way to create VPN connections for more than one landing zone in your org. However, you can set up the infrastructure by running Terraform on your computer. Skip to [Set up by using Terraform](#solution-connect-client-vpn-local-setup).
{: note}

A private catalog hosts your deployable architectures for users in your organization.

Follow these steps to use the {{site.data.keyword.cloud_notm}} console to set up a deployable architecture with the {{site.data.keyword.cloud_notm}} console and add it to a private catalog.

1.  Create a private catalog to hold your organization’s custom deployable architectures.

    1.  Go to **Manage** > **Catalogs** > **Private Catalogs** in the {{site.data.keyword.cloud_notm}} console.
    1.  Click **Create**.

        If your organization has a private catalog for deployable architectures, select the catalog and click **Add**.
    1.  Give the catalog a name. For example, "My deployable architectures".
    1.  Click **Create**.

1.  Select the catalog and click **Add** to add the client-to-site VPN to the new private catalog with the following settings.

    Alternatively, you can use the {{site.data.keyword.cloud_notm}} CLI. See [Onboard a deployable architecture to a private catalog by using the CLI](client-vpn-onboard-cat-cli).
    {: tip}

    Update the information for `Source URL` and `Software Version` to match the latest release of the [client-to-site VPN](https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn) GitHub module.

    - Product type: Deployable architecture
    - Delivery method: Terraform
    - Repository type: Public repository
    - Source URL: https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn/archive/refs/tags/v1.4.13.tar.gz
    - Variation: Standard
    - Software Version: 1.4.13
1.  Click **Add product**.
1.  Skip to [Validate the deployable architecture](client-vpn-validate-da).

### Onboard a deployable architecture to a private catalog by using the CLI
{: #client-vpn-onboard-cat-cli}

If you already added your deployable architecture to your private catalog in the previous section, skip to [Validate the deployable architecture](client-vpn-validate-da).
{: tip}

Follow these steps to use the {{site.data.keyword.cloud_notm}} console to onboard a deployable architecture to a private catalog with the {{site.data.keyword.cloud_notm}} CLI.

1.  Make sure that you have a recent version of the [{{site.data.keyword.cloud_notm}} CLI](/docs/cli?topic=cli-install-ibmcloud-cli) installed.
1.  Run the following command:

    - Edit the `--catalog` option to match the name of your private catalog.
    - Update the `--target-version` and `--zipurl` to match the latest release of the [client-to-site VPN](https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn) GitHub module.

    ```sh
    ibmcloud catalog offering create --catalog "My deployable architectures" --name "deploy-arch-ibm-slz-c2s-vpn" --target-version 1.4.13 --zipurl https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn/archive/refs/tags/v1.4.13.tar.gz --include-config  --variation "standard"  --format-kind terraform  --product-kind solution --install-type extension`
    ```
    {: pre}

1.  When the command finishes successfully, go to your private catalog in the {{site.data.keyword.cloud_notm}} console and verify that the new version is listed in `Draft` state.
1.  Skip to [Validate the deployable architecture](client-vpn-validate-da).

### Set up by using Terraform
{: #solution-connect-client-vpn-local-setup}

This section includes steps to use Terraform on your computer to set up the infrastructure. If you [set up a deployable architecture in the previous section](#client-vpn-setup), skip to the next section, [Validate the deployable architecture](#client-vpn-validate-da).
{: fast-path}

To set up the VPN server cloud resources by using Terraform on your workstation, follow these steps.

#### Before you begin with the Terraform setup
{: #client-vpn-local-prereqs}

Make sure you have your development environment configured:

- On Microsoft Windows, set up [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/windows/wsl/install){: external} and run commands within WSL.
- [Install Terraform](/docs/ibm-cloud-provider-for-terraform?topic=ibm-cloud-provider-for-terraform-getting-started).

#### Clone the repo and configure the module
{: #client-vpn-local-configure}

1.  Clone the relevant modules to your computer. Update the `--branch` to match the latest release of the [client-to-site VPN](https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn) GitHub module.

    ```bash
    git clone --branch v1.4.13 https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn
    ```
    {: pre}

1.  Change to the directory that contains the Terraform module to deploy the client-to-site VPN in a landing zone VPC:

    ```bash
    cd terraform-ibm-client-to-site-vpn/extensions/landing-zone
    ```
    {: pre}

1.  Create a file called `terraform.tfvars` with a text editor.

    ```bash
    vi terraform.tfvars
    ```
    {: pre}

1.  Add the following lines to the `terraform.tfvars` file.

    ```tf
    ibmcloud_api_key              = "<IBM Cloud API key>"

    /*
    ID, not VPC name.  You can find the information in the Optional inputs
    section of the console or fom the "ibmcloud is vpcs" CLI command
    */
    vpc_id                         = "<ID>"

    /*
    Set to the region referred to by the `vpc_id`
    input variable, where the VPC is located.
    */
    region                         = "<region where the existing VPC is located>”
    resource_group                 = "<landingzone_prefix>-management-rg"
    existing_sm_instance_guid      = "<secretmgr_guid>"
    existing_sm_instance_region    = "<secretmgr_region>"

    /*
    The following list identifies users who are authorized to access
    the network that uses the new VPN connection. Make sure that
    they are members of your IBM Cloud account.
    */
    vpn_client_access_group_users  = ["user1@example.com",”user2@example.com”]
    ```
    {: codeblock}

    - Replace the values with the ones that you looked up in [Before you begin](#solution-connect-client-vpn-prereqs).
    - If you don’t already have a {{site.data.keyword.secrets-manager_short}} instance, remove the lines that start with `existing_sm`. The Terraform module creates a {{site.data.keyword.secrets-manager_short}} instance if you don’t already have one.

    Don't check in this file to version control because it contains the API key secret. If you don't want to save the information in the file, you can pass the variable to Terraform through command-line arguments.
    {: important}

1.  Save the `terraform.tfvars` file, and then run the following commands. Enter **yes** to apply the plan when prompted:

    ```bash
    terraform init
    terraform plan -out myplan
    terraform apply "myplan"
    ```
    {: pre}


    The script takes approximately 15 minutes to complete.

    The last few lines of the output of the script should look something like the following example:

    ```text
    Apply complete! Resources: 5 added, 2 changed, 0 destroyed.

    Outputs:

    resource_group_id = "737bb1c6828346a5a961638973cafd31"
    resource_group_name = "ccm-management-rg"
    server_cert_id = "dc0e30d0-d16c-6d91-6e17-ae241b68b955"
    vpn_id = "r014-fb0de1e3-2ea4-4f00-b557-75b91c24d2ca"
    vpn_server_certificate_secret_crn = "crn:v1:bluemix:public:secrets-manager:us-east:a/f8ce6d5aa4cf4f45bf77ff019b6d9463:66b08f1d-d3ac-4583-b35e-da08145e5820:secret:dc0e30d0-d16c-6d91-6e17-ae241b68b955"
    ```
    {: screen}

    If the script runs successfully, the cloud VPN resources now exist and are configured.
1.  Skip to [Configure the OpenVPN client](#solution-connect-client-vpn-openvpn).

## Validate the deployable architecture
{: #client-vpn-validate-da}
{: step}

The deployable architecture isn't visible to others until you validate it and make sure that users can provision it with your default input variables. To validate a deployable architecture in a private catalog, you specify input values that are passed to {{site.data.keyword.bpshort}}, which then runs the Terraform plan and apply steps in {{site.data.keyword.cloud_notm}} to make sure that the deployable architecture runs successfully.

Validate the latest version of the deployable architecture in your private catalog.

1.  Select **Validate** from the **…** menu on the version.
1.  Follow the steps to read the license file.
1.  Select a {{site.data.keyword.bpshort}} instance to run the DA.
1.  Specify the input values that are specific to your landing zone:

    - API key: Select an API key from your {{site.data.keyword.secrets-manager_short}} instance.
    - vpc_id = "\<VPC ID>"

        Not VPC name. You can find the information in the Optional inputs section of the console.
    - region = "\<Where the existing VPC is located>"

        Set this field to the region referred to by the `vpc_id` input variable, where the VPC is located.
    - resource_group = "<landingzone_prefix>-management-rg"
    - existing_sm_instance_guid = "<secretmgr_guid>"
    - existing_sm_instance_region = "<secretmgr_region>"
    - vpn_client_access_group_users = ["user1@example.com","user2@example.com"]

        This list identifies users who are authorized to access the network that uses the new VPN connection. Make sure that they are members of your {{site.data.keyword.cloud_notm}} account.
1.  Click **Validate**.

    After a few minutes, if the inputs are correct and the validation completes successfully, the client-to-site VPN-related cloud resources are deployed in your account.
1.  Share the deployable architecture:

    Now that the client-to-site VPN deployable architecture is imported and validated in your private catalog, you can share the deployable architecture with other developers in your organization. By sharing the deployable architecture, you save them the time of finding and testing the automation for the VPN connectivity each time that they stand up a new landing zone.

    1.  Add configurations of the client-to-site VPN deployable architecture to the project:

        From your private catalog, you can add configurations to the same project that contains your landing zone VPC deployments. Each configuration can support a different set of users with access by using VPN profiles that are specific to each configuration.

    If you have other Terraform automation that you want to package as a deployable architecture for your teams to reuse, check out [Turn your Terraform templates into deployable architectures](https://www.ibm.com/cloud/blog/turn-your-terraform-templates-into-deployable-architectures){: external}.

## Configure the OpenVPN client
{: #solution-connect-client-vpn-openvpn}
{: step}

After the VPN server cloud resources are deployed, set up the OpenVPN client on devices that will access your landing zone.

1.  Download the OpenVPN profile from the VPN server

    - By using the {{site.data.keyword.cloud_notm}} console:
        1.  Click the **Navigation menu** icon ![Navigation menu icon](../icons/icon_hamburger.svg "Menu"), and then click **VPC Infrastructure** > **VPNs** in the **Network** section to open the VPNs for VPC page.
        1.  Click the **Client-to-site servers** tab and select the client-to-site VPN server that you created.
        1.  Click the **Clients** tab. Then, click **Download client profile**.

      Or

    - By using the {{site.data.keyword.cloud_notm}} CLI:

      ```sh
      ibmcloud is vpn-server-client-configuration VPN_SERVER --file client2site-vpn.ovpn
      ```
      {: pre}

      Look for the `VPN_SERVER` ID in the output of the Terraform apply from the validation step. If you don't find it there, follow the previous steps to download the profile and look in the `<vpn_server>.ovpn` file.
1.  Set up the client:

    You can follow the steps in [Setting up a VPN client](/docs/vpc?topic=vpc-setting-up-vpn-client).
    {: tip}

    1.  Download and install the OpenVPN client application from https://openvpn.net.
    1.  Open the OpenVPN client application, and import the `client2site-vpn.ovpn` file.
    1.  Enter one of the {{site.data.keyword.cloud_notm}} email addresses that was configured to access the VPN as the user ID.
1.  Go to http://iam.cloud.ibm.com/identity/passcode in your browser to generate a passcode. Copy the passcode.
1.  Return to the OpenVPN client application and paste the one-time passcode. Then, import the `client2site-vpn.ovpn` certificate file.

### Using client certificates rather than one-time passcodes
{: #connect-client-vpn-certs}

If you want to configure client certs on the VPN rather than using a one-time-passcode, follow the instructions in the [Managing VPN server and client certifications](/docs/vpc?topic=vpc-client-to-site-authentication#creating-cert-manager-instance-import) section of the client-to-site documentation.

## Test access to the Red Hat OpenShift web console
{: #connect-client-vpn-rh}
{: step}

If your landing zone includes a Red Hat OpenShift cluster, you can now test that you have access to the web console.

1.  Open https://cloud.ibm.com/kubernetes/clusters in your browser.
1.  Select the cluster details for the management cluster in your landing zone.
1.  Click **OpenShift Web Console** in the upper right to access your Red Hat OpenShift web console.
1.  Repeat steps (2) and (3) to test connectivity to the landing zone’s workload cluster.

## Test your VPN connection
{: #connect-client-vpn-connection}
{: step}

On the device that has the OpenVPN client, ping the `10.*` network (which is in your management VPC).

```bash
ping 10.0.0.1
PING 10.0.0.1 (10.0.0.1): 56 data bytes
64 bytes from 10.0.0.1: icmp_seq=0 ttl=64 time=19.920 ms
64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=19.301 ms
64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=14.490 ms
64 bytes from 10.0.0.1: icmp_seq=3 ttl=64 time=20.896 ms
64 bytes from 10.0.0.1: icmp_seq=4 ttl=64 time=13.938 ms
^C
--- 10.0.0.1 ping statistics ---
5 packets transmitted, 5 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 13.938/17.709/20.896/2.904 ms
```

If you see no timeouts or other errors, your local workstation has connectivity to the VPC’s private network.

### Solving connectivity issues
{: #connect-client-vpn-connectivity}

In the following error, OpenVPN has an active connection, but can't reach a server on your private VPN subnet. Check the local network that your device connects through. Some newer routers allocate IP addresses in `10.*` range rather than `192.168.*`.

```text
error: dial tcp: lookup YOUR_SERVER_URL on 10.0.0.1:53: read udp 10.0.0.2:0->10.0.0.1:53: i/o timeout - verify you have provided the correct host and port and that the server is currently running.
```
{: screen}

## Summary
{: #connect-client-vpn-summary}

Automating the creation of client-to-site VPN connections to your secure landing zones is straightforward when you use the capabilities of deployable architectures on {{site.data.keyword.cloud_notm}}.

## Related content
{: #connect-client-vpn-related}

Tutorial: [Connect a VPC landing zone to a network by using a site-to-site VPN](/docs/solution-tutorials?topic=solution-tutorials-connect-landingzone-site-vpn)
