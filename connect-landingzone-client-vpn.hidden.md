---
subcollection: solution-tutorials
copyright:
  years: 2022, 2023
lastupdated: "2023-08-04"
lasttested: "2023-08-04"

content-type: tutorial
services: vpc, openshift, iaas-vpn
account-plan: paid
completion-time: 2h
# use-case is a comma-separated list or yaml bullet format. Select one or more use cases that represent your architecture from the Digital Taxonomy [use case](https://github.ibm.com/digital/taxonomy/blob/main/subsets/use_cases/use_cases_flat_list.csv) list. Use the value in the code column. The list available under [Topics](https://github.ibm.com/digital/taxonomy/blob/main/topics/topics_flat_list.csv) can also be used, but don't go too crazy. 
use-case: usecase1, usecase2 
---

{{site.data.keyword.attribute-definition-list}}

# Connect to a VPC landing zone by using a client to site VPN
{: #connect-landingzone-client-vpn}
{: toc-content-type="tutorial"}
{: toc-services="vpc, openshift, iaas-vpn"}
{: toc-completion-time="2h"}


This tutorial dives into the fastest option to get up and running with [Client-to-Site VPC VPN connectivity](/docs/vpc?topic=vpc-vpn-client-to-site-overview). Rather than doing manual steps, we show you how to set up an automated way to create a client-to-site VPN connection to one or more landing zones in your accounts by using Terraform.
{: shortdesc}

## Problem
{: #solution-connect-client-vpn-problem}

You deployed one of the {{site.data.keyword.cloud_notm}} landing zone deployable architectures, like [Red Hat OpenShift Container Platform on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-ocp-95fccffc-ae3b-42df-b6d9-80be5914d852-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}, [VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vpc-9fc0fa64-27af-4fed-9dce-47b3640ba739-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external} or [VSI on VPC landing zone](https://cloud.ibm.com/catalog/architecture/deploy-arch-ibm-slz-vsi-ef663980-4c71-4fac-af4f-4a510a9bcf68-global?catalog_query=aHR0cHM6Ly9jbG91ZC5pYm0uY29tL2NhdGFsb2cjcmVmZXJlbmNlX2FyY2hpdGVjdHVyZQ%3D%3D){: external}. In the {{site.data.keyword.cloud_notm}} console you can see that the cluster is created and healthy.

Next, you try to access the Red Hat OpenShift Web Console on the management cluster but you get stuck with this error:

```
It is not possible to access the Red Hat OpenShift console because the cluster is accessible only on the management VPC’s private network, which is locked down and not accessible from the internet.
```
{: screen}

Now, how can you securely access that private network to complete operations on resources within these VPC’s?

Another issue might be that you will not be able to reach any of the VPC's private networks if you just deployed the base VPC or VSI landing zone patterns that didn’t include a Red Hat OpenShift cluster. For example, pinging the network also fails:

```bash
❯ ping 10.0.0.1
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

You can use several supported methods of establishing secure connections to your private VPC network:

- [Client to Site with IBM Cloud VPN Server and VPN Client](/docs/vpc?topic=vpc-vpn-client-to-site-overview) - Configure a VPN client application on your device to create a secure connection to your VPC network that uses IBM Cloud VPN Server. The IBM Cloud VPN Server service has high availability mode for production use and is managed by IBM.
- [Site to Site VPC VPN Gateway](/docs/vpc?topic=vpc-using-vpn&interface=cli) - Configure your on-premises VPN to connect to an IBM Cloud VPN Gateway by using a statically route-based VPN or a policy-based VPN to set up an IPsec site-to-site tunnel between your VPC and your on-premises private network or another VPC.
- [Direct Link](/docs/vpc?topic=vpc-end-to-end-private-connectivity-vpe&interface=cli) - A direct network connection can be established between your on-premises network and IBM Cloud Direct Link.
- [Access from another VPC by using Transit Gateway](/docs/vpc?topic=vpc-end-to-end-private-connectivity-vpe&interface=cli) - Access from another IBM Cloud VPC to your VPC can be achieved by using a Transit Gateway.

By default, the VPC landing zone deployable architecture has none of the described connectivity options that are enabled because each option varies depending on the situation. The simplest of the three options are to establish a client to site VPN connection. But even configuring this option manually takes quite a few steps. 

Instead, we want to make setting up such a connection easy, with a minimal amount of information by using Terraform IaC automation packaged as a deployable architecture.

## Solution
{: #solution-connect-client-vpn-solution}

The first thing that we need are Terraform modules for configuring a client-to-site VPC VPN server, security groups, Secrets Manager, and certificates. Fortunately, IBM wrote these modules already, and contributed them in open source in the `ibm-terraform-modules` repository.

The Terraform module that we use creates a single-zone client-to-site VPN in an existing landing-zone management VPC.

The default values in this module are designed to work against the default values used in the landing-zone module (all 3 variations: VPC, Red Hat OpenShift, and VSI).

It creates and configures the following infrastructure:

- A Secrets Manager instance (Optional - a reference to an existing Secrets Manager instance can be passed through the existing_sm_instance_guid input variable).
   - A private certificate engine is configured in the Secret Manager instance.
   - A secret group is created.
   - A private certificate (the "secret") using the private certificate engine is created in the secret group that is created.

- A subnet named `client-to-site-subnet` in the landing-zone management VPC.
   - The network ACL on this subnet grants all access from any source.

- A new security group named `client-to-site-sg` that allows all incoming request from any source.

- An IAM access group that allows users to authenticate and connect to the client-to-site VPN gateway.

- A client-to-site VPN gateway: 
   - Using the private certificate that is generated and stored in the Secret Manager instance.
   - The gateway is located in the `client-to-site-subnet` subnet.
   - Attaches the `client-to-site-sg` to the client-to-site VPN gateway.
   - With routes configured to allow accessing the landing zone VPCs (management and workload).

### Architecture
{: #solution-connect-client-vpn-architecture}

![Architecture](images/connect-landingzone-client-vpn-hidden/c2s-basic.svg){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}


## Before you begin
{: #solution-connect-client-vpn-prereqs}

You’ll lookup some values for resources in your existing VPC landing zone that are required to create the VPN connectivity.

Find the `id` and `region` of your landing zone’s `management vpc`. The terraform module uses ID’s rather than names.

Add the users that will be given access to connect over the VPN connection to your {{site.data.keyword.cloud_notm}} account. The module takes a list of emails for users in your {{site.data.keyword.cloud_notm}} account that will be given access to connect over the VPN connection. For more details on how to add users, see [Inviting users to an account](/docs/account?topic=account-iamuserinv&interface=ui).

The terraform module creates a Secrets Manager instance if you don’t already have one. However, since you created a landing zone by using projects, you most likely have a Secrets Manager instance that you can use. Look up the GUID and region of your Secrets Manager instance by using the {{site.data.keyword.cloud_notm}} console.

A quick way to locate the Secrets Manager GUID in your account is to use the resource explorer view, enter “secret” in the Product filter and a list of secrets manager instances will be shown. Next, select the item to show the sidebar details for the Secrets Manager instance that you want to use and select the copy action to the right of the GUID field as shown in this screenshot:

![Example of resource list](images/connect-landingzone-client-vpn-hidden/secrets-manager-resource-list.png){: caption="Figure 1. Example view of the resource list in {{site.data.keyword.cloud_notm}} console" caption-side="bottom"}

## Set up by using Terraform on a local workstation
{: #solution-connect-client-vpn-local-setup}
{: step}

To perform a manual setup of the VPN Server cloud resources by using Terraform on your workstation, follow the steps. If you instead want an even simpler setup that makes use of deployable architectures and projects, skip to the next section, “Set up by using a deployable architecture”.

Before you begin step 1, ensure that you have the following prerequisites installed:
- (Linux/Mac) Windows users can use the [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install){: external} on Windows.
- [Install Terraform](https://developer.hashicorp.com/terraform/downloads){: external}


1. Lets start by cloning the relevant modules on our local workstation:

   ```bash
   git clone https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn
   ```
   {: codeblock}

2. Navigate into the directory containing the terraform module to deploy the client-to-site VPN in a landing-zone VPC:

   ```bash
   cd terraform-ibm-client-to-site-vpn/examples/landing-zone
   ```

3. Create a file, terraform.tfvars by using your text editor:

   ```bash
   vi terraform.tfvars
   ```
   {: codeblock}

4. Add the following lines and replace the values with the ones you looked up from your landing zone earlier.

   ```bash
   ibmcloud_api_key = "{IBM CLOUD API KEY}"
   vpc_id = "{ID}"  // Not the vpc name. Lookup in console or ibmcloud is vpcs
   region = "{region where the existing VPC is located}” (this field must be set to the region where the vpc refered by the vpc_id input is located)
   resource_group = "{landingzone_prefix}-management-rg"
   existing_sm_instance_guid = "{secretmgr_guid}"
   existing_sm_instance_region = "{secretmgr_region}"
   vpn_client_access_group_users = ["user1@domain.com",”user2@domain.com”]
   ```
   {: codeblock}

   Do not check this file into version control. It contains API Key secret! Optionally, you can specify the input values with the command line.
   {: important}

5. If for some reason you don’t already have a Secret Manager, remove the lines that start with “existing_sm”, and the Terraform will create a secret manager instance for you.

6. Save the file and run each of the following commands:

   ```bash
   terraform init
   terraform plan -out myplan
   terraform apply “myplan”
   ```
   {: codeblock}

7. Enter **yes** when prompted.

The script runs for approximately 15 minutes. If there are no errors, the cloud VPN resources are now created and configured. The last few lines of output should look something like the following:

```bash
Apply complete! Resources: 5 added, 2 changed, 0 destroyed.

Outputs:

resource_group_id = "737bb1c6828346a5a961638973cafd31"
resource_group_name = "ccm-management-rg"
server_cert_id = "dc0e30d0-d16c-6d91-6e17-ae241b68b955"
vpn_id = "r014-fb0de1e3-2ea4-4f00-b557-75b91c24d2ca"
vpn_server_certificate_secret_crn = "crn:v1:bluemix:public:secrets-manager:us-east:a/f8ce6d5aa4cf4f45bf77ff019b6d9463:66b08f1d-d3ac-4583-b35e-da08145e5820:secret:dc0e30d0-d16c-6d91-6e17-ae241b68b955"
```
{: screen}

## Set up by using a deployable architecture
{: #solution-connect-client-vpn-da-setup}
{: step}

If you instead want a repeatable way to create client to site VPN connections for more than one landing zone in your org, and want to make it even simpler for other users in your company to setup additional VPN connections for their landing zones, follow these steps.

1. Create a private catalog to hold your organization’s custom deployable architectures. This step is optional if your organization already has a private catalog for deployable architectures.

   1. Navigate to **Manage** > **Catalogs** > **Private catalogs** in the {{site.data.keyword.cloud_notm}} console.
   1. Click **Create**.
   c1. Give the catalog a name, for example “My Deployable Architectures”.
   1. Click **Create**.

2. Optional. Select the catalog, and click **Add** to add a product to the new catalog offering.

   - Product type: Deployable architecture
   - Delivery method: Terraform
   - Repository type: Public repository
   - Source URL: https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn/archive/refs/tags/v1.3.0.tar.gz
   - Variation: Standard
   - Software Version: 1.3.0
   - Click **Add product**

3. Optional. Rather than using the private catalog UI, you can import the deployable architecture into your private catalog from the CLI. Edit the `--catalog` option to match the name of your private catalog. Also, make sure the `--target-version` and `--zipurl` match the Latest release version that is listed on the https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn GitHub page.

   1. `ibmcloud catalog offering create --catalog "My Deployable Architectures" --name "deploy-arch-ibm-slz-c2s-vpn" --target-version 1.3.0 --zipurl https://github.com/terraform-ibm-modules/terraform-ibm-client-to-site-vpn/archive/refs/tags/v1.3.0.tar.gz --include-config  --variation “standard”  --format-kind terraform  --product-kind solution --install-type extension`
   1. When the import is complete, go back into your private catalog and verify that the new version is now listed in “Draft” state.
   1. The deployable architectures will not be visible to other users until you first Validate the deployable architecture to ensure that it works in your environment.

4. Select Validate from the **…** menu on the version.

   1. Validate the latest version of the deployable architecture in your private catalog. Validating this deployable architecture in the private catalog involves specifying input values that will be passed to Schematics, which then runs the Terraform plan and apply steps in the cloud to make sure that the deployable architecture works.
   1. Follow the steps to read the license file and select a schematics instance to run the DA with: 
   1. Enter the input values that are specific to your landing zone:

      1. Select an api key from your secret manager instance
      1. vpc_id                             = "{VPC Id}"   (This field is found in the Optional inputs section of the UI)
      1. region                             = "{region where the existing VPC is located}” (this field must be set to the region where the VPN that is referred by the vpc_id input is located)
      1. resource_group             = "{landingzone_prefix}-management-rg"
      1. existing_sm_instance_guid = "{secretmgr_guid}"
      1. existing_sm_instance_region = "{secretmgr_region}"
      1. vpn_client_access_group_users = ["user1@domain.com",”user2@domain.com”,…]  (A list of users that are authorized to access the network that uses the new VPN connection. These users must be member of the {{site.data.keyword.cloud_notm}} account)

   1. Click **Validate**. After a few minutes, if correct inputs were provided, the validation should complete without errors. When the validation has completed successfully, the client-to-site VPN-related cloud resources are deployed in your account.

5. Now that the client-to-site VPN deployable architecture has been imported and validated in your private catalog, you can share the deployable architecture with other developers in your organization, saving them the steps of finding and testing the automation for the VPN connectivity each time they stand up a new landing zone.

6. From your private catalog, you can now add one or more configurations of the Client-to-Site VPN deployable architecture to the same project that contains your Landing Zone VPC deployments, each configured with a different set of users that can access by using VPN profiles that are specific to each Landing Zone VPC configuration.

If you have other Terraform automation that you would like to package as a deployable architecture for your teams to reuse, check out [Turn Your Terraform Templates Into Deployable Architectures](https://www.ibm.com/cloud/blog/turn-your-terraform-templates-into-deployable-architectures){: external}.

## Configure the OpenVPN client
{: #solution-connect-client-vpn-openvpn}
{: step}

After the VPN server cloud resources have been deployed by using either the manual or deployable architecture steps, you’ll need to set up an OpenVPN client on devices that will access your landing zone.

1. Download the OpenVPN profile from the VPN server
   - By using the {{site.data.keyword.cloud_notm}} CLI: 

      The ID of the VPN server should be in the output of the terraform apply from verification. If not, open the VPN server in {{site.data.keyword.cloud_notm}} console and download the `.ovpn` client profile to your local machine.

      `ibmcloud is vpn-server-client-configuration {VPN server ID} --file client2site-vpn.ovpn`

   - By using the {{site.data.keyword.cloud_notm}} Console:
       1. Navigate to VPC infrastructure > VPNs > Client-to-site servers and select the client-to-site VPN server that was created
       1. Under the **Clients** tab, click **Download client profile**

2. Download and Install the OpenVPN client application on the device that will access the landing zone from https://openvpn.net
3. Open the OpenVPN client application, and import the `client2site-vpn.ovpn` file
4. Enter one of the {{site.data.keyword.cloud_notm}} email addresses that was configured to access the VPN as the user ID
5. Open http://iam.cloud.ibm.com/identity/passcode in your browser, and copy the one time passcode.
6. Return to the OpenVPN client application and paste the one time passcode, then Continue when it prompts about certificate.

## Access Red Hat OpenShift Web Console in a private network
{: #solution-connect-client-vpn-rh}
{: step}

If your landing zone includes a Red Hat OpenShift cluster, you can now test that you have access to the Web Console.

1. Open https://cloud.ibm.com/kubernetes/clusters in your browser.
2. Select the cluster details for the management cluster `prefix-management-cluster`` in your landing zone.
3. Click Red Hat OpenShift Web Console button in the upper right corner. You are now able to access your Red Hat OpenShift Web Console.
4. Repeat steps (2) and (3) to test connectivity to the landing zone’s workload cluster.

### Using client certifications rather than one-time passcodes
{: #client-certifications}

If you want to configure client certifications on the VPN rather than using a one-time-passcode, there are instructions that you can follow in the [Managing VPN Server and Client Certifications section of the VPN Client to Site documentation](/docs/vpc?topic=vpc-client-to-site-authentication).

### Test your VPN connection
{: #vpn-connection}

On the device that has the OpenVPN client, ping the `10.*` network (which is in your management VPC).

```bash
❯ ping 10.0.0.1
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

If there are no errors, the ping confirms that your local workstation now has connectivity to the VPC’s private network.

### Solving connectivity issues
{: #connectivity-issues}

If you get an error when you test your VPN connectivity, such as the following: 

```bash
error: dial tcp: lookup YOUR_SERVER_URL on 10.0.0.1:53: read udp 10.0.0.2:0->10.0.0.1:53: i/o timeout - verify you have provided the correct host and port and that the server is currently running.
```
{: screen}

where OpenVPN has an active connection, but a server on your private VPN subnet cannot be reached, check the local network that your device is connecting through. Some newer routers allocate IP addresses in `10.*` rather than `192.168.*`. 

## Summary
{: #solution-connect-client-vpn-summary}

Automating the creation of client-to-site VPN connections to your secure landing zones is made straightforward by using deployable architecture capabilities of {{site.data.keyword.cloud_notm}}.
