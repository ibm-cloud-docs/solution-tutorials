---
subcollection: solution-tutorials
copyright:
  years: 2024
lastupdated: "2024-01-17"
lasttested: "2024-01-17"

content-type: tutorial
services: containers, openshift, cloud-object-storage, activity-tracker, Registry, secrets-manager, appid, Cloudant, key-protect, log-analysis, cis
account-plan: paid
completion-time: 2h
use-case: Cybersecurity
---
{{site.data.keyword.attribute-definition-list}}


# Apply end to end security to a cloud application
{: #cloud-e2e-security}
{: toc-content-type="tutorial"}
{: toc-services="containers, openshift, cloud-object-storage, activity-tracker, Registry, secrets-manager, appid, Cloudant, key-protect, log-analysis, cis"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator){: external} to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through key security services available in the {{site.data.keyword.cloud}} catalog and how to use them together. An application that provides file sharing will put security concepts into practice.
{: shortdesc}

No application architecture is complete without a clear understanding of potential security risks and how to protect against such threats. Application data is a critical resource which can not be lost, compromised or stolen. Additionally, data should be protected at rest and in transit through encryption techniques. Encrypting data at rest protects information from disclosure even when it is lost or stolen. Encrypting data in transit (e.g. over the Internet) through methods such as HTTPS, SSL, and TLS prevents eavesdropping and so called man-in-the-middle attacks.

Authenticating and authorizing users' access to specific resources is another common requirement for many applications. Different authentication schemes may need to be supported: customers and suppliers using social identities, partners from cloud-hosted directories, and employees from an organization’s identity provider.

## Objectives
{: #cloud-e2e-security-objectives}

* Encrypt content in storage buckets with your own encryption keys.
* Require users to authenticate before accessing an application.
* Monitor and audit security-related API calls and other actions across cloud services.


The tutorial features a sample application that enables groups of users to upload files to a common storage pool and to provides access to those files via shareable links. The application is written in Node.js and deployed as a container to either {{site.data.keyword.containerfull_notm}} or {{site.data.keyword.openshiftlong_notm}}. It leverages several security-related services and features to improve the application's security posture.

<!--##istutorial#-->
This tutorial will work with a cluster running in Classic Infrastructure or VPC Infrastructure.
<!--#/istutorial#-->

![Architecture](images/solution34-cloud-e2e-security/architecture-e2e-security.svg){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}


1. User connects to the application.
2. If using a custom domain and a TLS certificate, the certificate is managed by and deployed from {{site.data.keyword.secrets-manager_short}}.
3. {{site.data.keyword.appid_short}} secures the application and redirects the user to the authentication page. Users can also sign up.
4. The application runs in a Kubernetes cluster from an image stored in the {{site.data.keyword.registryshort_notm}}. This image is automatically scanned for vulnerabilities.
5. Uploaded files are stored in {{site.data.keyword.cos_short}} with accompanying metadata stored in {{site.data.keyword.cloudant_short_notm}}.
6. Object storage buckets, {{site.data.keyword.appid_short}}, and {{site.data.keyword.secrets-manager_short}} services leverage a user-provided key to encrypt data.
7. Application management activities are logged by {{site.data.keyword.at_full_notm}}.

<!--##istutorial#-->
## Before you begin
{: #cloud-e2e-security-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.containerfull_notm}} plugin (`kubernetes-service`),
   * {{site.data.keyword.registryshort_notm}} plugin (`container-registry`),
* `kubectl` to interact with Kubernetes clusters,
* `git` to clone source code repository.

You will find instructions to download and install these tools for your operating environment in the [Getting started with solution tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](/shell){: external} from the {{site.data.keyword.cloud_notm}} console.
{: tip}

<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
## Start a new {{site.data.keyword.cloud-shell_notm}}
{: #cloud-e2e-security-2}
{: step}
1. From the {{site.data.keyword.cloud_notm}} console in your browser, select the account where you have been invited.
1. Click the button in the upper right corner to create a new [{{site.data.keyword.cloud-shell_short}}](/shell).

-->
<!--#/isworkshop#-->

## Create services
{: #cloud-e2e-security-setup}
{: step}

In the next section, you are going to create the services used by the application.

<!--##istutorial#-->
### Decide where to deploy the application
{: #cloud-e2e-security-4}

The **location** and **resource group** of all resources that you create should match with the **location** and **resource group** of the Kubernetes cluster.
<!--#/istutorial#-->

<!--##istutorial#-->
### Capture user and application activities
{: #cloud-e2e-security-activity-tracker }

The {{site.data.keyword.at_full_notm}} service records user-initiated activities that change the state of a service in {{site.data.keyword.Bluemix_notm}}. At the end of this tutorial, you will review the events that were generated by completing the tutorial's steps.

1. Access the {{site.data.keyword.cloud_notm}} catalog and create an instance of [{{site.data.keyword.at_full_notm}}](/observe/activitytracker/create). Note that there can only be one instance of {{site.data.keyword.at_short}} per region. Set the **Service name** to **secure-file-storage-activity-tracker**.
1. Ensure you have the right permissions assigned to manage the service instance by following [these instructions](/docs/activity-tracker?topic=activity-tracker-iam_manage_events#admin_account_opt1).

<!--#/istutorial#-->

<!--##istutorial#-->
### Create a cluster for the application
{: #cloud-e2e-security-6}

{{site.data.keyword.containerfull_notm}} and {{site.data.keyword.openshiftlong_notm}} provide environments to deploy highly available apps in containers that run in Kubernetes clusters.

Skip this section if you have an existing Kubernetes cluster you want to reuse with this tutorial, throughout the remainder of this tutorial the cluster name is referenced as **secure-file-storage-cluster**, simply substitute with the name of your cluster.
{: tip}

A minimal cluster with one (1) zone, one (1) worker node and the smallest available size (**Flavor**) is sufficient for this tutorial. To create a {{site.data.keyword.containerfull_notm}} cluster, follow the steps for either [Creating VPC clusters](/docs/containers?topic=containers-cluster-create-vpc-gen) or [Creating classic clusters](/docs/containers?topic=containers-cluster-create-classic). To create a {{site.data.keyword.openshiftlong_notm}} cluster, follow the steps for either [Creating VPC clusters](/docs/openshift?topic=openshift-cluster-create-vpc-gen) or [Creating classic clusters](/docs/openshift?topic=openshift-cluster-create-classic).
<!--#/istutorial#-->

### Use your own encryption keys
{: #cloud-e2e-security-7}

{{site.data.keyword.keymanagementserviceshort}} helps you provision encrypted keys for apps across {{site.data.keyword.Bluemix_notm}} services. {{site.data.keyword.keymanagementserviceshort}} and {{site.data.keyword.cos_full_notm}} [work together to protect your data at rest](/docs/key-protect/integrations?topic=key-protect-integrate-cos). In this section, you will create one root key for the storage bucket.

1. Create an instance of [{{site.data.keyword.keymanagementserviceshort}}](/catalog/services/kms){: external}.
   1. Select a **location**.
   2. Set the name to `<!--##isworkshop#--><!--&lt;your-initials&gt;---><!--#/isworkshop#-->secure-file-storage-kp`.
   3. Select the **resource group** where to create the service instance and click **Create**.
2. Under **Keys**, click the **Add** button to create a new root key. It will be used to encrypt the storage bucket and {{site.data.keyword.appid_short}} data.
   1. Set the key type to **Root key**.
   2. Set the name to `secure-file-storage-root-enckey`.
   3. Then **Add key**.

<!--##istutorial#-->
Bring your own key (BYOK) by [importing an existing root key](/docs/key-protect?topic=key-protect-import-root-keys#import-root-keys).
{: tip}

<!--#/istutorial#-->

### Setup storage for user files
{: #cloud-e2e-security-8}

The file sharing application saves files to a {{site.data.keyword.cos_short}} bucket. The relationship between files and users is stored as metadata in a {{site.data.keyword.cloudant_short_notm}} database. In this section, you'll create and configure these services.

#### A bucket for the content
{: #cloud-e2e-security-9}

1. Create an instance of [{{site.data.keyword.cos_short}}](/objectstorage/create){: external}.
   1. Select a **Standard** plan and Set the **name** to `<!--##isworkshop#--><!--&lt;your-initials&gt;---><!--#/isworkshop#-->secure-file-storage-cos`.
   2. Use the same **resource group** as for the previous services and click **Create**.
2. Under **Service credentials**, create a *New credential*.
   1. Set the **name** to `secure-file-storage-cos-acckey`.
   2. For **Role** select **Writer**.
   3. Under **Advanced options**, check **Include HMAC Credential**. This is required to generate pre-signed URLs.
   4. Click **Add**.
   5. Make note of the credentials. You will need them in a later step.
3. Click **Endpoints** from the navigation sidebar:
   1. Set **Resiliency** to **Regional** and set the **Location** to the target location:
   2. For Classic infrastructure: Copy the **Private** service endpoint. It will be used later in the configuration of the application.
   3. For VPC infrastructure: Copy the **Direct** service endpoint. It will be used later in the configuration of the application.

Before creating the bucket, you will grant the {{site.data.keyword.cos_short}} service instance access to the root key stored in the {{site.data.keyword.keymanagementserviceshort}} service instance.

1. Go to [Manage > Access (IAM) > Authorizations](/iam/authorizations){: external} in the {{site.data.keyword.cloud_notm}} console.
2. Click the **Create** button.
3. In the **Source service** menu, select **Cloud Object Storage**.
4. Switch to **Resources based on selected attributes**, check **Source service instance** and select the {{site.data.keyword.cos_short}} service instance previously created.
5. In the **Target service** menu, select **{{site.data.keyword.keymanagementserviceshort}}**.
6. Switch to **Resources based on selected attributes**, check **Instance ID**, select the {{site.data.keyword.keymanagementserviceshort}} service instance created earlier.
7. Enable the **Reader** role.
8. Click the **Authorize** button.

Finally, create the bucket.

1. Access the {{site.data.keyword.cos_short}} service instance from the [Resource List](/resources){: external} Under **Storage**.
2. Click **Create bucket** and then **Customize your bucket**.
   1. Use a unique value for **name**, such as `<your-initials>-secure-file-upload`.
   2. Set **Resiliency** to **Regional**.
   3. Set **Location** to the same location where you created the {{site.data.keyword.keymanagementserviceshort}} service instance.
   4. Set **Storage class** to **Standard**
3. Under **Service integrations (optional) / Encryption**, enable **Key management**
   1. Select the {{site.data.keyword.keymanagementserviceshort}} service instance created earlier by clicking on **Use existing instance**
   2. Select **secure-file-storage-root-enckey** as the key and click **Associate key**.
4. Under **Service integrations (optional) / Monitoring & Activity tracking**, enable **Activity tracking** to have events recording in {{site.data.keyword.cloudaccesstrailshort}}.
   1. After clicking the checkmark the service information for the {{site.data.keyword.at_short}} instance in the region should be shown.
   2. Now, enable **Track Data events** and select **read & write** as **Data Events**.
5. Click **Create bucket**.

### A database map relationships between users and their files
{: #cloud-e2e-security-10}

The {{site.data.keyword.cloudant_short_notm}} database will contain metadata for all files uploaded from the application.

1. Create an instance of [{{site.data.keyword.cloudant_short_notm}}](/catalog/services/cloudant){: external} service.
   1. Select **Cloudant** as the offering. 
   2. Select a **Multitenant** environment and a **region** same as the previous services.
   3. Set the **name** to `<!--##isworkshop#--><!--&lt;your-initials&gt;---><!--#/isworkshop#-->secure-file-storage-cloudant`.
   4. Use the same **resource group** as for the previous services.
   5. Set **Authentication method** to **IAM**.
   6. Click **Create**.
2. Back to the **Resource List**, locate the newly created service and click on it. *Note: You will need to wait until the status changes to Active*.
   1. Under **Service credentials**, create **New credential**.
   2. Set the **name** to `secure-file-storage-cloudant-acckey`.
   3. For **Role** select **Manager**.
   4. Keep the default values for the remaining fields.
   5. Click **Add**.
3. Expand the newly created credentials and make note of the values. You will need them in a later step.
4. Under **Manage**, click on **Launch Dashboard**.
5. Click **Create Database** to create a **Non-partitioned** database named `secure-file-storage-metadata`.

### Authenticate users
{: #cloud-e2e-security-11}

With {{site.data.keyword.appid_short}}, you can secure resources and add authentication to your applications. As an alternative not used in this tutorial, {{site.data.keyword.appid_short}} can [integrate](/docs/containers?topic=containers-comm-ingress-annotations#app-id-authentication) with {{site.data.keyword.containershort_notm}} to authenticate users accessing applications deployed in the cluster.

Before creating the {{site.data.keyword.appid_short}} service, grant service access to {{site.data.keyword.keymanagementserviceshort}} service. You must be the account owner or an administrator for the instance of {{site.data.keyword.keymanagementserviceshort}} that you're working with. You must also have at least Viewer access for the {{site.data.keyword.appid_short}} service.

1. Go to [Manage > Access IAM > Authorizations](/iam/authorizations){: external} and click **Create**.
2. Select the **{{site.data.keyword.appid_short}}** service as your source service.
3. Select **{{site.data.keyword.keymanagementserviceshort}}** as your target service.
4. Switch to **Resources based on selected attributes**, check **Instance ID**, select the {{site.data.keyword.keymanagementserviceshort}} service instance created earlier.
5. Assign the **Reader** role under Service access.
6. Click **Authorize** to confirm the delegated authorization.

Now, Create an instance of the {{site.data.keyword.appid_short}} service.
1. Navigate to the [{{site.data.keyword.appid_short}}](/catalog/services/AppID){: external} service creation page.
   1. Use the same **location** used for the previous services.
   2. Select the **Graduated tier** as plan.
   3. Set the **Service name** to `<!--##isworkshop#--><!--&lt;your-initials&gt;---><!--#/isworkshop#-->secure-file-storage-appid`.
   4. Select a **resource group** same as the previous services.
   5. Select the authorized {{site.data.keyword.keymanagementserviceshort}} service **name** and the **root key** from the respective dropdowns.
   6. Click **Create**.
2. Under **Manage Authentication**, in the **Authentication Settings** tab, add a **web redirect URL** pointing to the domain you will use for the application. The URL format is `https://secure-file-storage.<Ingress subdomain>/redirect_uri`. For example:
   * with the ingress subdomain: `mycluster-1234-d123456789.us-south.containers.appdomain.cloud`
   * the redirect URL is `https://secure-file-storage.mycluster-1234-d123456789.us-south.containers.appdomain.cloud/redirect_uri`.

   [{{site.data.keyword.appid_short}} requires the web redirect URL](/docs/appid?topic=appid-managing-idp#add-redirect-uri) to be **https** or **http**. You can view your Ingress subdomain in the cluster dashboard or with `ibmcloud ks cluster get --cluster <cluster-name>`.
   {: tip}

3. In the same tab under **Authentication Settings** under **Runtime Activity** enable capturing events in {{site.data.keyword.at_short}}.
4. Create service credentials:
   1. Under **Service credentials**, create **New credential**.
   2. Set the **name** to `secure-file-storage-appid-acckey`.
   3. For **Role** select **Manager**.
   4. Keep the default values for the remaining fields.
   5. Click **Add**.


You should customize the identity providers used as well as the login and user management experience in the {{site.data.keyword.appid_short}} dashboard. This tutorial uses the defaults for simplicity. For a production environment, consider to use Multi-Factor Authentication (MFA) and advanced password rules.
{: tip}

## Deploy the app
{: #cloud-e2e-security-deploy}
{: step}

All services have been configured. In this section you will deploy the tutorial application to the cluster. All of this can be accomplished from a shell environment (terminal).

### Get the code
{: #cloud-e2e-security-13}

1. Get the application's code:
   ```sh
   git clone https://github.com/IBM-Cloud/secure-file-storage
   ```
   {: codeblock}
   
2. Go to the **secure-file-storage/app** directory:
   ```sh
   cd secure-file-storage/app
   ```
   {: codeblock}

### Fill in configuration settings and credentials
{: #cloud-e2e-security-15}

1. If you are not logged in, use `ibmcloud login` or `ibmcloud login --sso` to log in interactively. Target your {{site.data.keyword.cloud_notm}} region and resource group.

   ```sh
   ibmcloud target -r <region> -g <resource_group>
   ```
   {: codeblock}

   You can find more CLI commands in the [General IBM Cloud CLI (ibmcloud) commands](/docs/cli?topic=cli-ibmcloud_cli) topic in the documentation.

2. Set the environment variables required for generating configuration files in the next step. 
   1. Start by setting the cluster name by replacing `<YOUR_CLUSTER_NAME>`:
      ```sh
      export MYCLUSTER=<YOUR_CLUSTER_NAME>
      ```
      {: pre}

   2. Set the ingress subdomain using `ibmcloud ks` commands:
      ```sh
      export INGRESS_SUBDOMAIN=$(ibmcloud ks cluster get --cluster $MYCLUSTER --output json | jq -r 'try(.ingressHostname) // .ingress.hostname')
      ```
      {: pre}

   3. Set the ingress secret using `ibmcloud ks` commands:
      ```sh
      export INGRESS_SECRET=$(ibmcloud ks cluster get --cluster $MYCLUSTER --output json | jq -r 'try(.ingressSecretName) // .ingress.secretName')
      ```
      {: pre}

   4. Set the image repository name to the pre-built image `icr.io/solution-tutorials/tutorial-cloud-e2e-security`:
      ```sh
      export IMAGE_REPOSITORY=icr.io/solution-tutorials/tutorial-cloud-e2e-security
      ```
      {: pre}

   5. Set additional environment variables by replacing the default values:
      ```sh
      export BASENAME=<!--##isworkshop#--><!--<your-initials>---><!--#/isworkshop#-->secure-file-storage
      ```
      {: pre}

   6. Set the namespace to use:
      ```sh
      export TARGET_NAMESPACE=default
      ```
      {: pre}

   7. Optionally set `$IMAGE_PULL_SECRET` environment variable only if you are using another Kubernetes namespace than the `default` namespace and the {{site.data.keyword.registryfull_notm}} for the image. This requires additional Kubernetes configuration (e.g. [creating a container registry secret in the new namespace](/docs/containers?topic=containers-registry#other)).

3. Run the below command to generate `secure-file-storage.yaml` and `secure-file-storage-ingress.yaml`. It will use the environment variables you just configured together with the template files `secure-file-storage.template.yaml` and `secure-file-storage-ingress.template.yaml`. 
      ```sh
      ./generate_yaml.sh
      ```
      {: pre}

   As example, assuming the application is deployed to the *default* Kubernetes namespace:
   
   | Variable | Value | Description |
   | -------- | ----- | ----------- |
   | `$IMAGE_PULL_SECRET` | Do not define when using provided image| A secret to access the registry.  |
   | `$IMAGE_REPOSITORY` | *icr.io/solution-tutorials/tutorial-cloud-e2e-security* or *icr.io/namespace/image-name* | The URL-like identifier for the built image based on the registry URL, namespace and image name from the previous section. |
   | `$TARGET_NAMESPACE` | *default* |   the Kubernetes namespace where the app will be pushed. |
   | `$INGRESS_SUBDOMAIN` | *secure-file-stora-123456.us-south.containers.appdomain.cloud* | Retrieve from the cluster overview page or with `ibmcloud ks cluster get --cluster <your-cluster-name>`. |
   | `$INGRESS_SECRET` | *secure-file-stora-123456* | Retrieve with `ibmcloud ks cluster get --cluster <your-cluster-name>`. |
   | `$BASENAME` | *<!--##isworkshop#--><!--&lt;your-initials&gt;---><!--#/isworkshop#-->secure-file-storage* | The prefix used to identify resources. |
   {: caption="Environment variables used by the script" caption-side="bottom"}

4. Copy `credentials.template.env` to `credentials.env`:
   ```sh
   cp credentials.template.env credentials.env
   ```
   {: codeblock}

5. Edit `credentials.env` and fill in the blanks with these values:
   * the {{site.data.keyword.cos_short}} service regional endpoint, the bucket name, the credentials created for the {{site.data.keyword.cos_short}} service,
   * the credentials for **<!--##isworkshop#--><!--&lt;your-initials&gt;---><!--#/isworkshop#-->secure-file-storage-cloudant**,
   * and the credentials for {{site.data.keyword.appid_short}}. The variable `appid_redirect_uris` is a comma-separated list of redirect URIs as discussed above.

   When using {{site.data.keyword.cloud-shell_short}}, you can use `nano credentials.env` to edit the file.
   {: tip}


### Deploy to the cluster
{: #cloud-e2e-security-16}

<!--##istutorial#-->
1. Gain access to your cluster as described in the instructions **Connect via CLI** accessible from the **Actions...** menu in your console overview page.
   ```sh
   ibmcloud ks cluster config --cluster $MYCLUSTER --admin
   ```
   {: codeblock}

2. Only if deploying to a non-default namespace, ensure that the Ingress secret is available in that namespace. First, get the CRN of the Ingress secret for your custom domain or default Ingress subdomain. It should be named similar to your cluster.
   ```sh
   ibmcloud ks ingress secret ls -c $MYCLUSTER
   ```
   {: codeblock}   

   If it has a CRN, use its name and CRN to create a secret in the namespace:
   ```sh
   ibmcloud ks ingress secret create -c $MYCLUSTER -n $TARGET_NAMESPACE --cert-crn <crn-shown-in-the-output-above> --name <secret-name-shown-above>
   ```
   {: codeblock}   

   If the Ingress secret does not have a CRN, use the following command to recreate it in the target namespace:
   ```sh
   kubectl get secret $INGRESS_SECRET --namespace=ibm-cert-store -oyaml | grep -v '^\s*namespace:\s'| kubectl apply  --namespace=$TARGET_NAMESPACE -f -
   ```
   {: codeblock}   

3. Create the secret used by the application to obtain service credentials:
   ```sh
   kubectl create secret generic secure-file-storage-credentials --from-env-file=credentials.env
   ```
   {: codeblock}

4. Deploy the app.
   ```sh
   kubectl apply -f secure-file-storage.yaml
   ```
   {: codeblock}

5. Deploy the network routing (a ClusterIP service and Ingress) for your app to make it accessible from the public internet. 
   ```sh
   kubectl apply -f secure-file-storage-ingress.yaml
   ```
   {: codeblock}


<!--#/istutorial#-->

<!--##isworkshop#-->
<!--
1. Gain access to your cluster as described in the **Connect via CLI** instructions accessible from the **Actions...** menu in your console overview page.
   ```sh
   ibmcloud ks cluster config --cluster $MYCLUSTER --admin
   ```
   {: codeblock}

2. Create the secret used by the application to obtain service credentials:
   ```sh
   kubectl create secret generic YOUR-INITIALS-secure-file-storage-credentials --from-env-file=credentials.env
   ```
   {: codeblock}

3. Deploy the app.
   ```sh
   kubectl apply -f secure-file-storage.yaml
   ```
   {: codeblock}

4. Deploy the network routing (a ClusterIP service and Ingress) for your app to make it accessible from the public internet.
   ```sh
   kubectl apply -f secure-file-storage-ingress.yaml
   ```
   {: codeblock}

-->
<!--#/isworkshop#-->

## Test the application
{: #cloud-e2e-security-5}
{: step}

The application can be accessed at `https://secure-file-storage.<your-cluster-ingress-subdomain>/`.

1. Go to the application's home page. You will be redirected to the {{site.data.keyword.appid_short_notm}} default login page.
2. Sign up for a new account with a valid email address.
3. Wait for the email in your inbox to verify the account.
4. Login.
5. Choose a file to upload. Click **Upload**.
6. Use the **Share** action on a file to generate a pre-signed URL that can be shared with others to access the file. The link is set to expire after 5 minutes.

Authenticated users have their own spaces to store files. While they can not see each other files, they can generate pre-signed URLs to grant temporary access to a specific file.

You can find more details about the application in the [source code repository](https://github.com/IBM-Cloud/secure-file-storage){: external}.

## Review Security Events
{: #cloud-e2e-security-18}
{: step}

Now that the application and its services have been successfully deployed, you can review the security events generated by that process. All the events are centrally available in {{site.data.keyword.at_short}} instance.

1. From the [**Observability**](/observe/activitytracker) dashboard, locate the {{site.data.keyword.at_short}} instance for the region where your application is deployed and click **Open dashboard**.
2. Review all logs sent to the service as you were provisioning and interacting with resources.

<!--##istutorial#-->
## Optional: Use a custom domain and encrypt network traffic
{: #cloud-e2e-security-19}
{: step}

By default, the application is accessible on a generic subdomain of `containers.appdomain.cloud`. However, it is also possible to use a custom domain with the deployed app. For continued support of **https**, access with encrypted network traffic, either a certificate for the desired hostname or a wildcard certificate needs to be provided. There are various combinations of services that can be used to manage DNS names and TLS certificates for integration into a Kubernetes application. This tutorial will use the following services:
- DNS subdomain, **secure-file-storage**, of your own custom DNS domain, that is managed by {{site.data.keyword.cis_full_notm}} ({{site.data.keyword.cis_short_notm}}) service. For the purpose of simplifying the steps in this tutorial, we will use **example.com** for the name of the custom DNS domain, make sure to substitute with your custom DNS domain in all steps.
- [Let's Encrypt](https://letsencrypt.org/){: external} to generate the TLS certificates.
- {{site.data.keyword.secrets-manager_full_notm}} to integrate with Let's Encrypt to generate the TLS certificate for **secure-file-storage.example.com** and securely store it.
- Kubernetes [External Secrets Operator](https://external-secrets.io/v0.7.0/){: external} to pull the secret TLS certificate directly from {{site.data.keyword.secrets-manager_short}}

Instead of the following steps, you could also create a CNAME pointing to the app URI at your DNS provider, generate a TLS certificate and import its components into {{site.data.keyword.secrets-manager_short}}.
{: tip}

### Provision a {{site.data.keyword.cis_short_notm}} and {{site.data.keyword.secrets-manager_short}} instance
{: #cloud-e2e-security-cis-instance}

- A [{{site.data.keyword.cis_full_notm}}](/catalog/services/internet-services){: external} instance is required. Use an existing instance or create one from this [catalog entry](/catalog/services/internet-services){: external}.  A number of pricing plans are available, including a free trial. The provisioning process of a new {{site.data.keyword.cis_short_notm}} will explain how to configure your existing DNS registrar (perhaps not in {{site.data.keyword.cloud_notm}}) to use the CIS-provided domain name servers. Export the custom domain in the shell window:
   ```sh
   export MYDOMAIN=example.com
   ```
   {: codeblock}

- A {{site.data.keyword.secrets-manager_short}} instance is required. Use an existing instance or create a new one described in [Creating a Secrets Manager service instance](/docs/secrets-manager?topic=secrets-manager-create-instance&interface=ui). If creating a new instance, name it **secure-file-storage-sm**.  You can enhance the security of your secrets at rest by integrating with the {{site.data.keyword.keymanagementserviceshort}} instance created earlier.

Create a DNS entry in the {{site.data.keyword.cis_short_notm}} instance using your Kubernetes cluster **Ingress subdomain** as the alias.
1. Open the {{site.data.keyword.cis_short_notm}} service instance, you can find it in the [Resource List](/resources).
2. Click the **Reliability** tab on the left.
3. Click the **DNS** tab on the top.
4. Scroll down to the DNS Records section and click **Add** to create a new record:
   1. Type: **CNAME**
   2. Name: **secure-file-storage**
   3. Alias: The **Ingress subdomain** of your cluster. You can obtain the correct value in the shell by executing the following command:
      ```sh
      echo $INGRESS_SUBDOMAIN
      ```
   {: codeblock}

   4. Click **Add** to add the new record.

Connect {{site.data.keyword.secrets-manager_short}} instance to Let's Encrypt.
1. A Let's Encrypt ACME account and associated **.pem** file is required. Use an existing one or [create one](/docs/secrets-manager?topic=secrets-manager-prepare-order-certificates#create-acme-account):
   1. Install the **acme-account-creation-tool**.  [Creating a Let's Encrypt ACME account](/docs/secrets-manager?topic=secrets-manager-prepare-order-certificates#create-acme-account) contains instructions and a link to the creation tool.
   2. Run **acme-account-creation-tool** to create an account specifically for this secure-file-storage example. Below is an example:
      ```sh
      $ ./acme-account-creation-tool-darwin-amd64 -e YOUREMAIL -o secure-file-storage.example.com -d letsencrypt-prod
      INFO[2022-12-28T13:30:00-08:00] Registering a new account with the CA
      INFO[2022-12-28T13:30:00-08:00] Account information written to file : secure-file-storage.example.com-account-info.json
      INFO[2022-12-28T13:30:00-08:00] Private key written to file : secure-file-storage.example.com-private-key.pem

      Account Info
      {
         "email": "YOUREMAIL",
         "registration_uri": "https://acme-v02.api.letsencrypt.org/acme/acct/891897087",
         "registration_body": {
            "status": "valid",
            "contact": [
               "mailto:YOUREMAIL"
            ]
         }
      }%
      $ ls
      secure-file-storage.example.com-account-info.json secure-file-storage.example.com-private-key.pem
      ```
2. Connect the Let's Encrypt ACME account to the {{site.data.keyword.secrets-manager_short}} instance. See [Adding a certificate authority configuration in the UI](/docs/secrets-manager?topic=secrets-manager-add-certificate-authority&interface=ui#add-certificate-authority-ui) for more details:
   1. Open the {{site.data.keyword.secrets-manager_short}} service instance, you can find it in the [Resource List](/resources){: external}.
   2. Open **Secrets engines** on the left and click **Public certificates**.
   3. Under **Certificate authorities** click **Add**.
   4. **Name**: LetsEncrypt and **Certificate authority**: Let's Encrypt.
   5. Under **Select file** click **Add file** and choose the **secure-file-storage.example.com-private-key.pem** or your existing **.pem** file from the chooser.
   6. Click **Add**.
3. Connect the {{site.data.keyword.cis_short_notm}} as a DNS provider:
   1. Under DNS providers click **Add**.
   2. **Name** cis and choose **Cloud Internet Services** from the dropdown.
   3. Click **Next**.
   4. In the **Authorization** tab choose the {{site.data.keyword.cis_short_notm}} instance.
   5. Click **Add**.
4. Order a certificate in {{site.data.keyword.secrets-manager_short}}
   1. Open the {{site.data.keyword.secrets-manager_short}} service and select **Secrets** on the left.
   2. Click **Add**.
   3. Click on **Public certificate** and then click on **Next**.
   4. Complete the form:
         - **Name** - type a name you can remember.
         - **Description** - enter a description of your choice.
         - Click on **Next**.
         - Under **Certificate authority** select your configured **Let's Encrypt** certificate authority engine.
         - Under **Key algorithm**, pick your preferred algorithm,
         - **Bundle certificates** - leave off
         - **Automatic certificate rotation** - leave off
         - Under **DNS provider** select your configured DNS provider instance
         - Click on **Select domains** check the **Select with wildcard** and leave the domain itself unchecked and click on **Done**.
   5. Click **Next**.
   6. Review your selections and click on **Add**.
   7. Click the three vertical dots menu for the active secret and choose **Details** and copy the **CRN** from the dialog. Export the value in the shell. It will look something like this:
      ```sh   
      export PUBLIC_CERT_CRN=crn:v1:bluemix:public:secrets-manager:eu-de:a/abc123abc123abc123abc123:99999999-9999-9999-9999-999999999999:secret:aaaaaaaa-9999-9999-aaaa-123456781234
      ```
      {: codeblock}

5. This tutorial leverages service to service authorization to give the cluster access to the {{site.data.keyword.secrets-manager_short}} service instance and its managed secrets.

   1. Go to the [IAM Authorizations page](/iam/authorizations){: external} and click **Create** to add a new authorization.
   2. Under **Source** select **Kubernetes Service**, then click to pick **Specific resources**. Then, for **Source service instance**, choose your cluster.
   3. Under **Target** select **Secrets Manager**, then, going with **Specific resources** and **Instance ID**, select your {{site.data.keyword.secrets-manager_short}} service instance.
   4. Finally, under **Roles** select **Manager** and grant the authorization by clicking **Authorize**.

6. Verify the values for MYDOMAIN and PUBLIC_CERT_CRN have been exported into the environment:
   ```sh   
   echo MYDOMAIN $(printenv MYDOMAIN)
   echo PUBLIC_CERT_CRN $(printenv PUBLIC_CERT_CRN)
   ```
   {: codeblock}


7. Create an Ingress secret from the new TLS certificate.
   ```sh
   ibmcloud ks ingress secret create --name secure-file-storage-certificate --cluster $MYCLUSTER --cert-crn $PUBLIC_CERT_CRN --namespace $TARGET_NAMESPACE
   ```
   {: codeblock}

8. Run the below command to generate new copies of the configuration files. It will use all the environment variables you configured together with the template files `secure-file-storage.template.yaml` and `secure-file-storage.template-ingress.yaml`. You may want to first save the current version:
   ```sh
   cp secure-file-storage.yaml /tmp
   cp secure-file-storage-ingress.yaml /tmp
   ```
   {: pre}

   ```sh
   ./generate_yaml.sh
   ```
   {: pre}

   
9. Apply the configuration changes to your cluster:
   ```sh
   kubectl apply -f secure-file-storage-ingress.yaml
   ```
   {: codeblock}

10. Switch back to the browser. In the [{{site.data.keyword.Bluemix_notm}} Resource List](/resources) locate the previously created and configured {{site.data.keyword.appid_short}} service and launch its management dashboard.
   * Click **Manage Authentication** on the left and the **Authentication Settings** tab on the top.
   * In the **Add web redirect URLs** form add `https://secure-file-storage.example.com/redirect_uri` as another URL.
11. Everything should be in place now. Test the app by accessing it at your configured custom domain `https://secure-file-storage.<your custom domain>`.

<!--#/istutorial#-->

## Security: Rotate service credentials
{: #cloud-e2e-security-20}
{: step}

To maintain security, service credentials, passwords and other keys should be replaced (rotated) a regular basis. Many security policies have a requirement to change passwords and credentials every 90 days or with similar frequency. Moreover, in the case an employee leaves the team or in (suspected) security incidents, access privileges should be changed immediately.

In this tutorial, services are utilized for different purposes, from storing files and metadata over securing application access to managing container images. Rotating the service credentials typically involves
- renaming the existing service keys,
- creating a new set of credentials with the previously used name,
- replacing the access data in existing Kubernetes secrets and applying the changes,
- and, after verification, deactivating the old credentials by deleting the old service keys.

<!--##istutorial#-->
## Expand the tutorial
{: #cloud-e2e-security-21}

Security is never done. Try the below suggestions to enhance the security of your application.

* Replace {{site.data.keyword.keymanagementservicelong_notm}} by [{{site.data.keyword.hscrypto}}](/docs/hs-crypto?topic=hs-crypto-get-started) for even greater security and control over encryption keys.

<!--#/istutorial#-->

<!--##istutorial#-->
## Share resources
{: #cloud-e2e-security-22}

If you want to work with others on resources of this solution tutorial, you can share all or only some of the components. [{{site.data.keyword.cloud_notm}} Identity and Access Management (IAM)](/docs/account?topic=account-iamoverview) enables the authentication of users and service IDs and the access control to cloud resources. For granting access to a resource, you can assign [predefined access roles](/docs/account?topic=account-userroles) to either a user, a service ID, or to an [access group](/docs/account?topic=account-groups). An access group can be created to organize a set of users and service IDs into a single entity. It makes it easy for you to assign access. You can assign a single policy to the group instead of assigning the same access multiple times per individual user or service ID. Thus, you can organize groups for roles on your development project and align security and project management.

You can find information on the individual services and their available IAM access roles here:
* [{{site.data.keyword.containershort_notm}}](/docs/containers?topic=containers-access_reference). Note that this service also provides examples for [mapping service roles to typical project roles](/docs/containers?topic=containers-users). Or the same for [{{site.data.keyword.openshiftshort}}](/docs/openshift?topic=openshift-access_reference) with [details on user access and roles](/docs/openshift?topic=openshift-users).
* https://cloud.ibm.com/docs/openshift?topic=openshift-access_reference&interface=ui
* [{{site.data.keyword.registryshort_notm}}](/docs/Registry?topic=Registry-iam#iam)
* [{{site.data.keyword.appid_short}}](/docs/appid?topic=appid-service-access-management)
* [{{site.data.keyword.cloudant_short_notm}}](/docs/Cloudant?topic=Cloudant-managing-access-for-cloudant)
* [{{site.data.keyword.cos_short}}](/docs/cloud-object-storage?topic=cloud-object-storage-iam)
* [{{site.data.keyword.at_short}}](/docs/activity-tracker?topic=activity-tracker-iam)
* [{{site.data.keyword.keymanagementserviceshort}}](/docs/key-protect?topic=key-protect-manage-access)
* [{{site.data.keyword.secrets-manager_short}}](/docs/secrets-manager?topic=secrets-manager-iam)

To get started, check out the [best practices for access management and how to define access groups](/docs/account?topic=account-account_setup#resource-group-strategy).
<!--#/istutorial#-->

## Remove resources
{: #cloud-e2e-security-23}
{: removeresources}

To remove the resource, delete the deployed container and then the provisioned services.

If you share an account with other users, always make sure to delete only your own resources.
{: tip}

1. Delete the deployed network configuration and the container:
   ```sh
   kubectl delete -f secure-file-storage-ingress.yaml
   ```
   {: codeblock}

   or

   ```sh
   kubectl delete -f secure-file-storage-route.yaml
   ```
   {: codeblock}

   Thereafter, run the following command:
   ```sh
   kubectl delete -f secure-file-storage.yaml
   ```
   {: codeblock}

3. Delete the secrets for the deployment:
   ```sh
   kubectl delete secret <!--##isworkshop#--><!--<your-initials>---><!--#/isworkshop#-->secure-file-storage-credentials
   ```
   {: codeblock}

4. In the [{{site.data.keyword.Bluemix_notm}} Resource List](/resources) locate the resources that were created for this tutorial. Use the search box and **secure-file-storage** as pattern. Delete each of the services by clicking on the context menu next to each service and choosing **Delete Service**. Note that the {{site.data.keyword.keymanagementserviceshort}} service can only be removed after the key has been deleted. Click on the service instance to get to the related dashboard and to delete the key.

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}

## Related content
{: #cloud-e2e-security-12}
{: related}

* [{{site.data.keyword.Bluemix_notm}} Platform security](/docs/overview?topic=overview-security#security)
* [Security in the IBM Cloud](https://www.ibm.com/cloud/security){: external}
* Blog: [Secure Apps on IBM Cloud with Wildcard Certificates](https://www.ibm.com/blog/secure-apps-on-ibm-cloud-with-wildcard-certificates){: external}
* Blog: [Cloud Offboarding: How to Remove a User and Maintain Security](https://www.ibm.com/blog/cloud-offboarding-how-to-remove-a-user-and-maintain-security){: external}
* Blog: [Going Passwordless on IBM Cloud Thanks to FIDO2](https://www.ibm.com/blog/going-passwordless-on-ibm-cloud-thanks-to-fido2){: external}
