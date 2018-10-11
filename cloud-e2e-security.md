---
copyright:
  years: 2018
lastupdated: "2018-10-09"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Apply end to end security to a cloud application

No application architecture is complete without a clear understanding of the security risks it is exposed to and how to protect it against these threats. The application data is a critical resource and can't be lost, compromised, or stolen. It needs to be protected whether at rest or in transit. Encrypting data at rest protects information from disclosure even if that information is lost or stolen. For data in transit — for instance, when it is transmitted over the Internet — encryption methods like HTTPS, SSL, and TLS are often used.

Authenticating users and only authorizing access to specific resources come as another common requirement for many applications. Different authentication schemes may need to be supported: Customers and suppliers log in with social identities, partners log in with cloud-hosted directories, and employees log in with an organization’s identity provider (SAML).

This tutorial walks you through key security services available in the {{site.data.keyword.cloud}} catalog and how to use them together. A file sharing application that allows to share uploaded files via expiring links serves as sample scenario.
{:shortdesc}

## Objectives
{: #objectives}

* Encrypt storage bucket content with your own encryption keys.
* Require users to authenticate before accessing an application.
* Monitor and audit security-related API calls and other actions that are made to selected cloud services.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.containershort_notm}}](https://console.bluemix.net/containers-kubernetes/catalog/cluster)
* [{{site.data.keyword.registryshort_notm}}](https://console.bluemix.net/containers-kubernetes/launchRegistryView)
* [{{site.data.keyword.appid_short}}](https://console.bluemix.net/catalog/services/AppID)
* [{{site.data.keyword.cloudant_short_notm}}](https://console.bluemix.net/catalog/services/cloudantNoSQLDB)
* [{{site.data.keyword.cos_short}}](https://console.bluemix.net/catalog/services/cloud-object-storage)
* [{{site.data.keyword.cloudaccesstrailshort}}](https://console.bluemix.net/catalog/services/activity-tracker)
* [{{site.data.keyword.keymanagementserviceshort}}](https://console.bluemix.net/catalog/services/key-protect)
* Optional: [{{site.data.keyword.cloudcerts_short}}](https://console.bluemix.net/catalog/services/certificate-manager)

This tutorial requires a [non-Lite account](https://console.bluemix.net/docs/account/index.html#accounts) and may incur costs. Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

The tutorial features a sample application that enables groups of users to upload files to a common storage pool and to provide access to those files via shareable links. The application is written in Node.js and deployed as Docker container to the {{site.data.keyword.containershort_notm}}. It leverages several security-related services and features to improve app security.

<p style="text-align: center;">

  ![Architecture](images/solution34-cloud-e2e-security/Architecture.png)
</p>

1. The user connects to the application.
2. If using a custom domain and a TLS certificate, the certificate is managed by and deployed from the {{site.data.keyword.cloudcerts_short}}.
3. {{site.data.keyword.appid_short}} secures the application and redirects the user to the authentication page. Users can sign up from there too.
4. The application is running in a Kubernetes cluster from an image stored in the {{site.data.keyword.registryshort_notm}}. The image is automatically scanned for vulnerabilities.
5. Files uploaded by the user are stored in {{site.data.keyword.cos_short}} with metadata in {{site.data.keyword.cloudant_short_notm}}.
6. The bucket where the files are stored is using a user-provided key to encrypt the data.
7. All activities related to managing the solution are logged by {{site.data.keyword.cloudaccesstrailshort}}.

## Before you begin
{: #prereqs}

1. Install all the necessary command line (CLI) tools by [following these steps](https://console.bluemix.net/docs/cli/index.html#overview).

## Create services
{: #setup}

### Decide where to deploy the application

1. Identify **a region**, **a Cloud Foundry organization and a space**, and **a resource group** where you will deploy the application and its resources.
1. Make sure you have [one private repository](https://console.bluemix.net/containers-kubernetes/registry/private) to push Docker images in the selected region.

### Capture user and application activities 
{: #activity-tracker }

The {{site.data.keyword.cloudaccesstrailshort}} service records user-initiated activities that change the state of a service in the {{site.data.keyword.Bluemix_notm}}. At the end of this tutorial, you will review the events that were generated by going over the tutorial steps.

1. Go in the catalog and create an instance of [{{site.data.keyword.cloudaccesstrailshort}}](https://console.bluemix.net/catalog/services/activity-tracker). Note that there can only be one instance of {{site.data.keyword.cloudaccesstrailshort}} per space.
1. After the instance is created, change its name to **secure-file-storage-activity-tracker**.
1. To be able to view all activity tracker events, make sure you have the following permissions [assigned to your user](https://console.bluemix.net/iam/#/users):
   1. **Developer** role in the Cloud Foundry space of the region where {{site.data.keyword.cloudaccesstrailshort}} was provisioned.
   1. IAM policy for the {{site.data.keyword.loganalysisshort_notm}}.
 service with **viewer** role in the region.

You can find detailed instructions to set up the proper permissions in the [{{site.data.keyword.cloudaccesstrailshort}} documentation](https://console.bluemix.net/docs/services/cloud-activity-tracker/how-to/grant_permissions.html#grant_iam_policy).
{: tip}

### Create a cluster for the application

{{site.data.keyword.containershort_notm}} provides an environment to deploy highly available apps in Docker containers that run in Kubernetes clusters.

Skip this section if you have an existing **Standard** cluster you want to reuse with this tutorial.
{: tip}

1. Go to the [cluster creation page](https://console.bluemix.net/containers-kubernetes/catalog/cluster/create).
   1. Set the **Location** to the region you identified in previous steps.
   1. Set **Cluster type** to **Standard**.
   1. Set **Availability** to **Single Zone**.
   1. Select a **Master Zone**.
1. Keep the default **Kubernetes version**, **Hardware isolation**.
1. If you plan to only deploy this tutorial on this cluster, use the smallest flavor and set **Worker nodes** to **1**.
1. Set the **Cluster name** to **secure-file-storage-cluster**.
1. **Create Cluster**

While the cluster is being provisioned, you will create the other services required by the tutorial.

### Use your own encryption keys

{{site.data.keyword.keymanagementserviceshort}} helps you provision encrypted keys for apps across {{site.data.keyword.Bluemix_notm}} services. {{site.data.keyword.keymanagementserviceshort}} and {{site.data.keyword.cos_full_notm}} [work together to help you own the security of your at-rest data](https://console.bluemix.net/docs/services/key-protect/integrations/integrate-cos.html#integrate-cos). In this section, you will create one root key for the storage bucket.

1. Create an instance of [{{site.data.keyword.keymanagementserviceshort}}](https://console.bluemix.net/catalog/services/kms).
   * Set the name to **secure-file-storage-kp**.
   * Select the resource group where to create the service instance.
1. Under **Manage**, add a new key. This key will be used to encrypt the storage bucket content.
   * Set the name to **secure-file-storage-root-enckey**.
   * Set the key type to **Root key**.
   * Then **Generate key**.

You can bring your own key (BYOK) by [importing an existing root key](https://console.bluemix.net/docs/services/key-protect/import-root-keys.html#import-root-keys).
{: tip}

### Setup storage for user files

The application stores the user files in a {{site.data.keyword.cos_short}} bucket and maintain a mapping between the files and the users in a {{site.data.keyword.cloudant_short_notm}} database.

#### A bucket for the content

1. Create an instance of [{{site.data.keyword.cos_short}}](https://console.bluemix.net/catalog/services/cloud-object-storage).
   * Set the **name** to **secure-file-storage-cos**.
   * Use the same **resource group** as for the previous services.
1. Under **Service credentials**, create *New credential*.
   * Set the **name** to **secure-file-storage-cos-acckey**.
   * Set **Role** to **Writer**
   * Do not specify a **Service ID**
   * Set **Inline Configuration Parameters** to **{"HMAC":true}**. This is required to get the right set of credentials to be able to generate pre-signed URLs.
   * **Add**.
   * Make note of the credentials you will need them in a later step.
1. Under **Endpoint**, set **Resiliency** to **Regional**, set the **location** to the target location and write down the Public service endpoint. It will be used later in the configuration of the application.

Before creating the bucket, you need to grant **secure-file-storage-cos** with access to the root key stored in **secure-file-storage-kp**.

1. Go to [Identity & Access > Authorizations](https://console.bluemix.net/iam/#/authorizations) in the {{site.data.keyword.cloud_notm}} console.
1. Click **Create** authorization.
1. In the **Source service** menu, select **Cloud Object Storage**.
1. In the **Source service instance** menu, select the **secure-file-storage-cos** service previously created.
1. In the **Target service** menu, select **Key Protect**.
1. In the **Target service instance** menu, select the **secure-file-storage-kp** service to authorize.
1. Enable the **Reader** role.
1. Click **Authorize**.

Finally create the bucket.

1. Go to the **secure-file-storage-cos** service dashboard.
1. Click **Create bucket**
   1. Set the **name** to a unique value, such as **&lt;your-initials&gt;-secure-file-upload**.
   1. Set **Resiliency** to **Regional**.
   1. Set **Location** to the same location where you created the **secure-file-storage-kp** service.
   1. Set **Storage class** to **Standard**
1. Check **Add Key Protect Keys**
   1. Select the **secure-file-storage-kp** service.
   1. Select **secure-file-storage-root-enckey** as the key.
1. **Create** the bucket.

#### A database to store the mapping between users and their files

The {{site.data.keyword.cloudant_short_notm}} database will contain a metadata document for every file uploaded via the application.

1. Create an instance of [{{site.data.keyword.cloudant_short_notm}}](https://console.bluemix.net/catalog/services/cloudantNoSQLDB).
   * Set the **name** to **secure-file-storage-cloudant**.
   * Set the region.
   * Use the same **resource group** as for the previous services.
   * Set **Available authentication methods** to **Use only IAM**.
1. Under **Service credentials**, create *New credential*.
   * Set the **name** to **secure-file-storage-cloudant-acckey**.
   * Set **Role** to **Manager**
   * Keep the default values for the *Optional* fields
   * **Add**.
1. Make note of the credentials, you will need them in a later step.
1. Under **Manage**, launch the Cloudant dashboard.
1. Create a database named **secure-file-storage-metadata**.

### Authenticate users

With {{site.data.keyword.appid_short}}, you can secure resources and add authentication to your applications. {{site.data.keyword.appid_short}} provides [an integration](https://console.bluemix.net/docs/containers/cs_annotations.html#appid-auth) with {{site.data.keyword.containershort_notm}} to authenticate users accessing applications deployed in the cluster.

1. Create an instance of [{{site.data.keyword.appid_short}}](https://console.bluemix.net/catalog/services/AppID).
   * Set the **name** to **secure-file-storage-appid**.
   * Use the same **region** and **resource group** as for the previous services.
1. Under **Identity Providers / Manage**, in the **Settings** tab, add a **web redirect URL** pointing to the domain you will use for the application. Assuming your cluster Ingress subdomain is 
_&lt;cluster-name&gt;.us-south.containers.appdomain.cloud_, the redirect URL will be `https://secure-file-storage.<cluster-name>.us-south.containers.appdomain.cloud/appid_callback`. {{site.data.keyword.appid_short}} requires the web redirect URL to be **https**. You can view your Ingress subdomain in the cluster dashboard or with `ibmcloud ks cluster-get <cluster-name>`.

You should customize the identity providers that are used and the login and user management experience in the {{site.data.keyword.appid_short}} dashboard. In this tutorial we use the defaults for simplicity.
{: tip}

## Deploy the app

All services have been configured. In this section you will deploy the tutorial application to the cluster.

### Get the code

1. Get the application code:
   ```sh
   git clone https://github.com/IBM-Cloud/secure-file-storage
   ```
   {: codeblock}
1. Go to the **secure-file-storage** directory:
   ```sh
   cd secure-file-storage
   ```
   {: codeblock}

### Build the Docker image

1. Build the Docker image in {{site.data.keyword.registryshort_notm}}:
   ```sh
   ibmcloud cr build -t registry.<region>.bluemix.net/<namespace>/secure-file-storage:latest .
   ```
   {: codeblock}

### Fill in credentials and configuration settings

1. Copy `credentials.template.env` to `credentials.env`:
   ```sh
   cp credentials.template.env credentials.env
   ```
   {: codeblock}
1. Edit `credentials.env` and fill in the blanks with these values:
   * the {{site.data.keyword.cos_short}} service regional endpoint, the bucket name, the credentials created for **secure-file-storage-cos**,
   * and the credentials for **secure-file-storage-cloudant**.
1. Copy `secure-file-storage.template.yaml` to `secure-file-storage.yaml`:
   ```sh
   cp secure-file-storage.template.yaml secure-file-storage.yaml
   ```
   {: codeblock}
1. Edit `secure-file-storage.yaml` and replace the placeholders (`$IMAGE_PULL_SECRET`, `$REGISTRY_URL`, `$REGISTRY_NAMESPACE`, `$IMAGE_NAME`, `$TARGET_NAMESPACE`, `$INGRESS_SUBDOMAIN`, `$INGRESS_SECRET`) with the correct values. `$IMAGE_PULL_SECRET` is only needed if you want to use another Kubernetes namespace than the default one. This would requires additional Kubernetes configuration (like creating a Docker registry secret in the new namespace). As example, assuming the _default_ Kubernetes namespace:

| Variable | Value |
| -------- | ----- |
| `$IMAGE_PULL_SECRET` | Keep the lines commented in the .yaml |
| `$REGISTRY_URL` | *registry.ng.bluemix.net* |
| `$REGISTRY_NAMESPACE` | *a-namespace* |
| `$IMAGE_NAME` | *secure-file-storage* |
| `$TARGET_NAMESPACE` | *default* |
| `$INGRESS_SUBDOMAIN` | *secure-file-storage-cluster-123.us-south.containers.appdomain.cloud* |
| `$INGRESS_SECRET` | *secure-file-storage-cluster* |

### Deploy to the cluster

1. Retrieve the cluster configuration:
   ```sh
   ibmcloud ks cluster-config --export <cluster-name>
   ```
   {: codeblock}
1. Copy and paste the export command to set the KUBECONFIG environment variable as directed.
1. Create the secret used by the application to obtain service credentials:
   ```sh
   kubectl create secret generic secure-file-storage-credentials --from-env-file=credentials.env
   ```
   {: codeblock}
1. Bind the {{site.data.keyword.appid_short_notm}} service instance to the cluster.
   ```sh
   ibmcloud ks cluster-service-bind --cluster <cluster-name> --namespace default --service secure-file-storage-appid
   ```
   {: codeblock}
   If you have several services with the same name the command will fail. You should pass the service GUID instead of its name. To find the GUID of a service, use `ibmcloud resource service-instance secure-file-storage-appid`.
   {: tip}
1. Deploy the app
   ```sh
   kubectl apply -f secure-file-storage.yaml
   ```
   {: codeblock}

## Test the application

The application can be accessed at `https://secure-file-storage.<cluster-name>.<region>.containers.appdomain.cloud/`.

1. Go to the application home page. You are redirected to the {{site.data.keyword.appid_short_notm}} default login page.
1. Sign up for a new account with a valid email address.
1. Wait for the email in your inbox to verify the account.
1. Login
1. Choose a file to upload. Click **Upload**.
1. Use the **Share** action on a file to generate a pre-signed URL which can be shared with others to access the file. In the tutorial, the link is set to expire after 5 minutes.

Authenticated users get their own space to store files. They don't see each other files but can generate pre-signed URLs to grant temporary access to a specific file.

You will find more details about the tutorial application code in the [source code repository](https://github.com/IBM-Cloud/secure-file-storage).

## Review Security Events
Now that the application and its services have been successfully deployed, you can review the security events generated by that process. All the events are centrally available in the instance of {{site.data.keyword.cloudaccesstrailshort}} and can be accessed via [graphical UI (Kibana), CLI or API](https://console.bluemix.net/docs/services/cloud-activity-tracker/how-to/viewing_event_information.html#viewing_event_status).

1. In the [{{site.data.keyword.Bluemix_notm}} console](https://console.bluemix.net) locate the {{site.data.keyword.cloudaccesstrailshort}} instance **secure-file-storage-activity-tracker** and open its dashboard.
2. By default it opens the **Manage** tab and shows **Space logs**. Switch to **Account logs** by clicking on the selector next to **View logs**. It should display several events.
3. Click on **View in Kibana** to open the full event viewer.
4. See event details the entries by clicking on **Discover**.
5. From the **Available Fields** add **action_str** and **initiator.name_str**.
6. Expand interesting entries by clicking the triangle icon, then choosing a table or JSON format.

You can change the settings for the automatic refresh and the displayed time range and thereby change how and what data is analysed.
{: tip}

## Optional: Use a custom domain and encrypt network traffic
By default, the application is accessible on a generic hostname at a subdomain of `containers.appdomain.cloud`. However, it is also possible to use a custom domain with the deployed app. For continued support of **https**, access with encrypted network traffic, either a certificate for the desired hostname or a wildcard certificate needs to be provided. In the following, you will upload an existing certificate to the {{site.data.keyword.cloudcerts_short}} and deploy it to the cluster. You will also update the app configuration to use the custom domain.

An example of how to obtain a certificate from [Let's Encrypt](https://letsencrypt.org/) is described in the following [{{site.data.keyword.cloud}} blog](https://www.ibm.com/blogs/bluemix/2018/07/secure-apps-on-ibm-cloud-with-wildcard-certificates/).
{: tip}

1. Create an instance of [{{site.data.keyword.cloudcerts_short}}](https://console.bluemix.net/catalog/services/certificate-manager)
   * Set the name to **secure-file-storage-certmgr**.
   * Use the same **region** and **resource group** as for the other services.
1. Click on **Import Certificate** to import your certificate.
   * Set name to **SecFileStorage** and description to **Certificate for e2e security tutorial**.
   * Upload the certificate file using the **Browse** button.
   * Click **Import** to complete the import process.
1. Locate the entry for the imported certificate and expand it
   * Verify the certificate entry, e.g., that the domain name matches your custom domain. If you uploaded a wildcard certificate, an asterisk is included in the domain name.
   * Click the **copy** symbol next to the certificate's **crn**.
1. Switch to the command line to deploy the certificate information as a secret to the cluster. Execute the following command after copying in the crn from the previous step.
   ```sh
   ibmcloud ks alb-cert-deploy --secret-name secure-file-storage-certificate --cluster secure-file-storage-cluster --cert-crn <the copied crn from previous step>
   ```
   {: codeblock}
   Verify that the cluster knows about the certificate by executing the following command.
   ```sh
   ibmcloud ks alb-certs --cluster secure-file-storage-cluster
   ```
   {: codeblock}
1. Edit the file `secure-file-storage.yaml`. 
   * Find the section for **Ingress**.
   * Uncomment and edit the lines covering custom domains and fill in your domain and host name.   
   The CNAME entry for your custom domain needs to point to the cluster. Check this [guide on mapping custom domains](https://console.bluemix.net/docs/containers/cs_ingress.html#private_3) in the documentation for details.
   {: tip}
1. Apply the configuration changes to the deployed:
   ```sh
   kubectl apply -f secure-file-storage.yaml
   ```
   {: codeblock}
1. Switch back to the browser. In the [{{site.data.keyword.Bluemix_notm}} console](https://console.bluemix.net) locate the previously created and configured {{site.data.keyword.appid_short}} service and launch its management dashboard. 
   * Go to **Manage** under the **Identity Providers**, then to **Settings**.
   * In the **Add web redirect URLs** form add `https://secure-file-storage.<your custom domain>/appid_callback` as another URL.
1. Everything should be in place now. Test the app by accessing it at your configured custom domain `https://secure-file-storage.<your custom domain>`.


## Expand the tutorial

Security is never done. Try the below suggestions to enhance the security of your application.

* Use [{{site.data.keyword.DRA_short}}](https://console.bluemix.net/catalog/services/devops-insights) to perform static and dynamic code scans
* Ensure only quality code is released by using policies and rules with [{{site.data.keyword.DRA_short}}](https://console.bluemix.net/catalog/services/devops-insights)

## Remove resources
{:removeresources}

To remove the resource, delete the deployed container and then the provisioned services.

1. Delete the deployed container:
   ```sh
   kubectl delete -f secure-file-storage.yaml
   ```
   {: codeblock}
2. Delete the secrets for the deployment:
   ```sh
   kubectl delete secret secure-file-storage-credentials
   ```
   {: codeblock}
3. Remove the Docker image from the container registry:
   ```sh
   ibmcloud cr image-rm registry.<region>.bluemix.net/<namespace>/secure-file-storage:latest
   ```
   {: codeblock}
4. In the [{{site.data.keyword.Bluemix_notm}} console](https://console.bluemix.net) locate the resources that were created for this tutorial. Use the search box and **secure-file-storage** as pattern. Delete each of the services by clicking on the context menu next to each service and choosing **Delete Service**. Note that the {{site.data.keyword.keymanagementserviceshort}} service can only be removed after the key has been deleted. Click on the service instance to get to the related dashboard and to delete the key.

If you share an account with other users, always make sure to delete only your own resources.
{: tip}

## Related content
{:related}

* [{{site.data.keyword.security-advisor_short}} documentation](https://console.bluemix.net/docs/services/security-advisor/about.html#about)
* [Security to safeguard and monitor your cloud apps](https://www.ibm.com/cloud/garage/architectures/securityArchitecture)
* [{{site.data.keyword.Bluemix_notm}} Platform security](https://console.bluemix.net/docs/overview/security.html#security)
* [Security in the IBM Cloud](https://www.ibm.com/cloud/security)
* [Tutorial: Best practices for organizing users, teams, applications](https://console.bluemix.net/docs/tutorials/users-teams-applications.html)
* [Secure Apps on IBM Cloud with Wildcard Certificates](https://www.ibm.com/blogs/bluemix/2018/07/secure-apps-on-ibm-cloud-with-wildcard-certificates/)

