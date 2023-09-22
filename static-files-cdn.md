---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-09-06"
lasttested: "2023-09-06"

content-type: tutorial
services: CDN, cloud-object-storage
account-plan: paid
completion-time: 2h
use-case: ApplicationPerformance
---
{{site.data.keyword.attribute-definition-list}}

# Accelerate delivery of static files using a CDN
{: #static-files-cdn}
{: toc-content-type="tutorial"}
{: toc-services="CDN, cloud-object-storage"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through how to host and serve website assets (images, videos, documents) and user-generated content in a {{site.data.keyword.cos_full_notm}}, and how to use a [{{site.data.keyword.cdn_full}} (CDN)](/catalog/infrastructure/cdn-powered-by-akamai) for fast and secure delivery to users around the world.
{: shortdesc}

Web applications have different types of content: HTML content, images, videos, cascading style sheets (CSS), JavaScript files, user-generated content. Some content changes often, other not so much, some is accessed very often, other occasionally. As the audience for the application grows, you may want to offload serving these media objects to another component, freeing resources for your main application. You may also want to have these files served from a location close to your application users, wherever they are in the world.

There are many reasons why you would use a Content Delivery Network in these situations:
* the CDN will cache the content, pulling the content from the origin (your servers) only if it is not available in its cache or if it has expired;
* with multiple data centers across the world, the CDN will serve the cached content from the closest location for your users;
* running on a different domain than your main application, the browser will be able to load more content in parallel - most browsers have a limit in the number of connections per hostname.

## Objectives
{: #static-files-cdn-objectives}

* Upload files to an {{site.data.keyword.cos_full_notm}} bucket.
* Make content globally available with a Content Delivery Network (CDN).
* Expose files by using a static website application.

![Architecture](images/solution3/Architecture.png){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

1. The user accesses the application
2. The application includes content distributed through a Content Delivery Network
3. If the content is not available in the CDN or has expired, the CDN pulls the content from the origin.

## Before you begin
{: #static-files-cdn-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI with the {{site.data.keyword.cos_full_notm}} plugin (`cloud-object-storage`),
* `git` to clone the source code repository,
* `jq` to query JSON files.

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.

To avoid the installation of these tools you can use the [{{site.data.keyword.cloud-shell_short}}](/shell){: external} from the {{site.data.keyword.cloud_notm}} console.
{: tip}

<!--#/istutorial#-->

In addition, you need the following permissions on Classic Infrastructure:
* [Manage CDN Account](/docs/CDN?topic=CDN-faqs#how-do-i-use-cloud-to-give-users-permission-to-create-or-manage-cdn)

These permissions are required to be able to order and view the CDN service.

## Get the web application code
{: #static-files-cdn-get_code}
{: step}

Let's consider a simple web application with different types of content like images, videos and cascading style sheets. You will store the content in a storage bucket and configure the CDN to use the bucket as its origin.

To start, retrieve the application code:

   ```sh
   git clone https://github.com/IBM-Cloud/webapp-with-cos-and-cdn
   cd webapp-with-cos-and-cdn
   ```
   {: pre}

## Create an Object Storage
{: #static-files-cdn-create_cos}
{: step}

{{site.data.keyword.cos_full_notm}} provides flexible, cost-effective, and scalable cloud storage for unstructured data.

1. Go to the [catalog](/catalog/){: external} in the console, and select [**Object Storage**](/catalog/services/cloud-object-storage){: external} from the Storage section.
2. Provide a **Service Name**.
3. Select the desired **resource group**
4. Click **Create** to create a new instance of {{site.data.keyword.cos_full_notm}}

Next, create a storage bucket.
1. In the service dashboard, click **Buckets**, then **Create bucket** followed by choosing **Customize your bucket**.
1. Set a unique bucket name such as `username-mywebsite` avoid dots (.) in the bucket name.
1. Set the **Resiliency** to **Regional**.
1. Set the **Location** appropriately. Choose **us-south** or make substitutions in the instructions below when you see **us-south**.
1. Pick **Smart Tier** for **Storage class**.
1. Scroll down to **Static website hosting** and click **Add**.
   * **Routing rules (individual)** should be selected.
   * Enter **index.html** into the **Index document** text box.
   * Click **Public access** to **On**.
   * Click **Save** above in the **Static website hosting** title.
1. Scroll down and click **Create bucket**.
1. The bucket will be displayed after creation completes. Click on the **Configuration** tab. Notice the **Endpoint** section and take note of the **Public** endpoint which will be needed later to both configure ibmcloud CLI and the CDN. As example for a bucket with resiliency set to _Regional_ in the _us-south_ region, the public endpoint would be _s3.us-south.cloud-object-storage.appdomain.cloud_.

## Upload files to a bucket
{: #static-files-cdn-upload}
{: step}

In this section, you will use the {{site.data.keyword.cos_short}} plugin to upload files to the bucket.

1. Set a variable for the COS endpoint URL and a variable for the bucket name:
   ```sh
   PUBLIC_ENDPOINT=s3.us-south.cloud-object-storage.appdomain.cloud
   ```
   {: pre}

   ```sh
   BUCKET_NAME=<YOUR_BUCKET_NAME>
   ```
   {: pre}

1. If you are not logged in, use `ibmcloud login` or `ibmcloud login --sso` to log in interactively. Target the region where the bucket was created. As example for a bucket created in `us-south`:
   ```sh
   ibmcloud target -r us-south
   ```
   {: pre}

   If you had used the cloud-object-storage (cos) plugin before, you might need to [reconfigure the crn and set it to the current service](/docs/cli?topic=cli-ic-cos-cli#ic-iam-authentication).
   {: tip}

1. Upload the files named `index.html`, `a-css-file.css`, `a-picture.png`, and `a-video.mp4` from the content directory of the web application code you downloaded previously. Upload the files to the root of the bucket.
   ```sh
   ibmcloud cos upload --bucket $BUCKET_NAME --key index.html --file index.html
   ibmcloud cos upload --bucket $BUCKET_NAME --key a-picture.png --file a-picture.png 
   ibmcloud cos upload --bucket $BUCKET_NAME --key a-css-file.css --file a-css-file.css
   ibmcloud cos upload --bucket $BUCKET_NAME --key a-video.mp4 --file a-video.mp4
   ```
   {: pre}

1. View your files from your dashboard.
   ![Bucket Content](images/solution3/Buckets.png){: caption="Bucket Content" caption-side="bottom"}
1. Access the files through your browser or by using curl:
   ```sh
   curl http://$BUCKET_NAME.$PUBLIC_ENDPOINT/index.html
   echo open http://$BUCKET_NAME.$PUBLIC_ENDPOINT/index.html
   ```
   It will look like:
   ```html
   <html>
   <head>
     <title>Files hosted in Cloud Object Storage and accessible through a Content Delivery Network</title>
   ...
   </html>
   open http://fredflinstone-mywebsite.s3.us-south.cloud-object-storage.appdomain.cloud/index.html
   ```
   {: screen}

## Make the files globally available with a CDN
{: #static-files-cdn-5}
{: step}

In this section, you will create a CDN service. The CDN service distributes content to where it is needed. The first time content is requested, it’s pulled from the host server (your bucket in {{site.data.keyword.cos_full_notm}}) to the delivery network and stays there for other users to access it quickly without the network latency to reach the host server again.

### Create a CDN instance
{: #static-files-cdn-6}

1. Go to the catalog in the console, and select [**Content Delivery Network**](/catalog/infrastructure/cdn-powered-by-akamai){: external} from the Network section. This CDN is powered by Akamai. Click **Create**.
2. On the next dialog, set the **Hostname** to a DNS subdomain like `static.example.com` (option a, see below) or simply a unique name (option b).

   The **Hostname** has two purposes. It is a unique name that identifies the CDN instance. It can also be the [DNS subdomain](https://en.wikipedia.org/wiki/Subdomain){: external}.  When filling out this form you will choose one of the following options:
   
   1. To use a DNS subdomain in a domain that you control:
      - Fill in the hostname as the DNS subdomain. For example if you control `example.com` then `static.example.com` would be a valid choice.
      - Choose HTTP port if required by your application.
      - Choose HTTPS port if required by your application and chose the SSL certificate **DV SAN certificate**.
      - CDN Content will be available at your subdomain, `static.example.com`, for example.
      - CDN Content is also available on the generated CNAME.
      
   1. Use the IBM generated DNS subdomain:
      - Fill in a unique hostname to identify the DNS instance, this will not be used in the URL for the CDN content.
      - Choose HTTP port if required by your application.
      - Choose HTTPS port - **this is required**.
      - Choose SSL certificate **Wildcard** - **this is required**.
      - CDN Content will be available in the generated CNAME.

3. Leave the **Custom CNAME** prefix blank, it will default to a unique name.
4. Next, under **Configure your origin**, leave **Host header** and **Path** empty.
5. Select **Object Storage** to configure the CDN for COS.
6. Set the **Endpoint** to your bucket public endpoint ($PUBLIC_ENDPOINT). Above this was: **s3.us-south.cloud-object-storage.appdomain.cloud**.
7. Set **Bucket name** to the bucket name from above.
8. Enable HTTP (80).
9. Enable HTTPS (443) for https access.
    - If using a subdomain that you control (option a):
      - HTTPS is optional.
      - If HTTPS is selected it is required to select **DV SAN Certificate** for the **SSL certificate**.
    - If not using a subdomain (option b):
      - Select HTTPS.  It is **required**.
      - Select **Wildcard Certificate** for the **SSL certificate**. 
10. Accept the **Master Service Agreement** and click **Create**.

### Access your content through the CDN CNAME
{: #static-files-cdn-7}

1. Select the CDN instance [in the list](/network/cdn){: external}.
2. If you earlier picked _DV SAN Certificate_, you are likely seeing `Requesting certificate`.  It can take as long as 24 hours for this state to complete. When available follow the steps shown when clicking on **View domain validation**.  Note, that this can take a few hours. If you want to continue with this tutorial just create a new CDN and this time do not enable HTTPS or select a wildcard certificate. Do not forget to select a different hostname.
3. The **Details** panel shows both the **Hostname** and the **IBM CNAME** for your CDN
4. Go to your DNS provider and create a CNAME record for the **HOSTNAME** for **IBM CNAME**.  For me it was `static.example.com` -> `cdnakawazw9dpv33.cdn.appdomain.cloud`.
   
   Often, it takes some minutes for DNS changes to become active. You might need to wait before proceeding to the next step.
   {: tip}

5. Access your files with `http://<static.example.com>/index.html`.

You can demonstrate the performance improvement. Access via the CDN.  Check the output of the first curl to verify successful connection:
```sh
SUBDOMAIN=static.example.com
curl http://$SUBDOMAIN/index.html
while sleep 1; do curl --output /tmp/fast http://$SUBDOMAIN/a-video.mp4; done
```
{: screen}

Access via COS:

```sh
curl http://$PUBLIC_ENDPOINT/$BUCKET_NAME/index.html
while sleep 1; do curl --output /tmp/slow http://$PUBLIC_ENDPOINT/$BUCKET_NAME/a-video.mp4 ; done
```

If you are using {{site.data.keyword.cloud-shell_short}} you can change the location to a region with more distance from the bucket to see a more substantial performance change.

### Access index.html through COS and other content through CDN
{: #static-files-cdn-8}

All of the content is now distributed through the CDN.  Website content can be broken into static content and dynamic content. To demonstrate this a file `cdn.html` has references to the CDN related files through the prefix CDN/.  Edit cdn.html and replace the occurrences of CDN with your CNAME, `http://static.example.com`, in the example above.  If you open the file in the `vim` editor the command `:%s#CDN#http://static.yourwebsite.com#` will do the trick.

Upload **cdn.html** by replacing the file **index.html**:
```sh
ibmcloud cos upload --bucket $BUCKET_NAME --key index.html --file cdn.html
```
{: pre}

Back in the {{site.data.keyword.cloud_notm}} console in the bucket **Configuration** panel scroll down to the **Static website hosting endpoints** section and copy the **Public** URL into a browser tab.  Since you configured this earlier to redirect to `index.html` the web application will be displayed and content will be delivered through the CDN.  For me the URL was `fredflinstone-mywebsite.s3-web.us-south.cloud-object-storage.appdomain.cloud`, notice the `s3-web`.

### Access the static website through custom subdomain
{: #static-files-cdn-9}

Accessing the website at the URL provided by the COS bucket is great, but access via a custom domain, like web.example.com, is even better. Follow the instructions at [Domain Routing for IBM Cloud Object Storage static web hosting](/docs/cloud-object-storage?topic=cloud-object-storage-routing-rules-cos).  Paste web.example.com into the browser which will default to https:// which will display the page correctly, but the CDN content will only be rendered if it also accessed via an https:// URL.  You can explicitly specify http://example.com or better yet ensure that HTTPS was selected when creating the CDN and https:// URL references to the CDN content were pasted into the index.html file in the previous step.

## Remove resources
{: #static-files-cdn-10}
{: step}

To clean up resource, perform the following steps:
* Delete the [{{site.data.keyword.cdn_full}} service](/cdn).
* Delete the [{{site.data.keyword.cos_full_notm}} bucket and / or service](/resources).

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}

## Related content
{: #static-files-related-content}

* [{{site.data.keyword.cos_full_notm}}](/docs/cloud-object-storage)
* [Manage Access to {{site.data.keyword.cos_full_notm}}](/docs/cloud-object-storage?topic=cloud-object-storage-iam)
* [Getting Started with CDN](/docs/CDN?topic=CDN-getting-started#getting-started)
