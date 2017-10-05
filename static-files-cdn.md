# Accelerate delivery of static files

Host and serve website assets (images, videos, documents) and user generated content in a Cloud Object Storage and use a Content Delivery Network (CDN) for fast and secure delivery to users around the world.

## Objectives

* Create a Cloud Object Storage S3 bucket
* Upload files to a bucket
* Make the content globally available with a CDN
* Expose files using a Cloud Foundry web application

![](images/solution3/Solution3Architecture.png)

## Before you begin
{: #prereqs}

1. **Contact your Infrastructure master user to get the following permissions:**
   * Manage CDN Account
   * Manage Storage
   * Manage CDN File Transfers
   * API Key

   > These permissions are required to be able to view and use the Storage and CDN services in this guide

2. Ensure that you have access to Storage in the Infrastructure console
   * Go to https://control.bluemix.net

   * Confirm you can see the `Storage` section and the `Object Storage` section underneath.

     ​

![](images/solution3/Storage_Catalog.png)

## Get the web application code

{: #get_code}

This guide uses a simple web application which links to the files (css, images and videos) served by a Content Delivery Network.

To start with, retrieve the application code:

   ```sh
   git clone https://github.ibm.com/frederic-lavigne/webapp-with-cos-and-cdn
   ```

## Create an Object Storage
{: #create_cos}

Cloud Object Storage provides flexible, cost-effective, and scalable cloud storage for unstructured data.

### Create a Cloud Object Storage S3

1. Go in the Bluemix catalog

2. Click on **Storage** and then **Cloud Object Storage**

3. Select **Cloud Object Storage S3** and click **Create** and **Continue**.

4. Review terms and click **Place Order**

5. Go to the **Storage** page https://control.bluemix.net/storage/objectstorage to view the newly created storage.

6. Update its description with your name to easily find the storage later.

### Create a bucket

1. Select the storage and select **Manage Buckets**

2. Click the **+** button to add a bucket

3. Set Resiliency/Location to **Cross Region - us**

4. Set Storage Class to **Standard**

5. Set the Bucket Name to **mywebsite**

   > Avoid dots (.) in the bucket name

## Upload files to a bucket
{: #upload}

In this section, we will use a desktop client to connect to the COS, upload files and configure permissions.

### Configure a desktop client to work with the storage

By default the bucket and its files are not publicly available. We are going to change the permissions so that the file can be accessed through the Internet without authentication. You can communicate with COS using a [S3 compatible API](https://ibm-public-cos.github.io/crs-docs/api-reference,  [command line interface](https://ibm-public-cos.github.io/crs-docs/cli) or a [desktop client](https://ibm-public-cos.github.io/crs-docs/desktop-clients).

**Cyberduck** is a popular, open-source, desktop client that makes it easy to work with S3 storages. To connect with Cyberduck:

    1. Download an install Cyberduck from https://cyberduck.io/
     2. Add a new connection of type **S3 Storage**
     3. Find your storage access keys and endpoints in the Bluemix**Storage** page.

### Upload a file in the bucket

1. Go inside the created bucket

2. Upload the files named **a-css-file.css**, **a-picture.png** and **a-video.mp4** from the **content** directory of the web application code you downloaded above. Upload the files to the root of the bucket.

### Make the files publicly available

1. Edit the permissions of the files and give **Everyone** the **READ** permission.

2. Access the files through your browser. The link will look like

   http://s3-api.us-geo.objectstorage.softlayer.net/your-bucket-name/your-filename

   > This link is for a cross-region bucket in the US

## Make the website content globally available with a CDN

In this section, we will create a CDN service. The CDN service distributes content where it is needed. The first time content is requested, it’s pulled from the host server (our bucket in Cloud Object Storage) to the network and stays there for other users to access it quickly without the network latency to reach the host server again.

### Create a CDN instance

1. Go into the Bluemix catalog

2. Search for **Content Delivery Network**

3. Pick the one under the **Network** category. This CDN is powered by Akamai.

4. Create a **Content Delivery Network** instance

5. Select **Akamai** as the CDN Provider

6. Click **Start Provision**

### Configure the CDN instance

1. Set the **hostname** for the CDN to your custom domain

   > Although you set a custom domain, you will still be able to access the CDN contents through the IBM provided CNAME. So if you don't plan to use custom domain, you can make set an arbitrary name.

2. Set the **Custom CNAME** prefix

   > Don't use dots "." in the name

3. Leave the **Path** empty

4. Select **Object Storage** as Origin

5. Set the **Endpoint** to your bucket API endpoint, such as *s3-api.us-geo.objectstorage.softlayer.net*

6. Set the **Bucket name** to *your-bucket-name*

7. Click **Create**

8. Find the instance in https://control.bluemix.net/network/cdn

### Access your content through the CDN domain

1. Select the CDN instance in the list at https://control.bluemix.net/network/cdn

2. The **Details** panel shows the **CNAME** for your CDN

3. Access your file with https://your-cdn-cname.cdnedge.bluemix.net/your-filename

   > If you omit the filename, you should see the S3 ListBucketResult instead

## Deploy the Cloud Foundry application

The application contains a web page **public/index.html** that includes references to the files now hosted in the Cloud Object Storage. The backend **app.js** serves this web page and replace a placeholder with the actual location of your CDN. This way all assets used by the web page will be served by the CDN.

1. With a terminal, go in the directory where you checked out the code

   ```
   cd webapp-with-cos-and-cdn
   ```

2. Push the application without starting it.

   ```
   bx cf push --no-start
   ```

3. Configure the CDN_NAME environment variable so the app can reference the CDN contents

   ```
   bx cf set-env webapp-with-cos-and-cdn CDN_CNAME your-cdn.cdnedge.bluemix.net
   ```

4. Start the app.

   ```
   bx cf start webapp-with-cos-and-cdn
   ```

5. Access the app with your web browser, the page stylesheet, a picture and a video are loaded from the CDN.

![](images/solution3/Application.png)

Using a CDN with an Object Storage is a powerful combination which lets you host files and serve them to users from around the world. You can also use Object Storage to store any files your users upload to your application.

## Related Content

[IBM Object Storage](https://ibm-public-cos.github.io/crs-docs/index.html)

[Manage Access to Object Storage](https://ibm-public-cos.github.io/crs-docs/manage-access)
