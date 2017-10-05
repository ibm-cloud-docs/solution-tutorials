# Low latency delivery of static files to users around the world

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
   * Confirm you can see the `Storage` section and the `Object Storage` section underneath

## Get the web application code

This guide uses a simple web application linking to files served by a Content Delivery Network.

To start with, retrieve the application code:

   ```
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

5. Go to the **Storage** page https://control.bluemix.net/storage/objectstorage to view the newly created storage

6. Update its description with your name to easily find the storage later

### Create a bucket

1. Select the storage

2. Select **Manage Buckets**

3. Click the **+** button to add a bucket

4. Set Resiliency/Location to **Cross Region - us**

5. Set Storage Class to **Standard**

6. Set the Bucket Name to **mywebsite**

   > Avoid dots (.) in the bucket name

## Upload files to a bucket
{: #upload}

In this section, we will use a desktop client to connect to the COS, upload files and configure permissions.

### Configure a desktop client to work with the storage

By default the bucket and its files are not publicly available. We are going to change the permissions so that the file can be accessed through the Internet without authentication.

COS provides both a [S3 compatible API](https://ibm-public-cos.github.io/crs-docs/api-reference) and [command line interfaces](https://ibm-public-cos.github.io/crs-docs/cli).

**Cyberduck** is a desktop client that makes it easy to work with S3 storages. Follow the steps detailed here https://ibm-public-cos.github.io/crs-docs/desktop-clients to configure Cyberduck to access your storage. The steps are:

      1. Download an install Cyberduck from https://cyberduck.io/
      2. Add a new connection of type **S3 Storage**
      3. Find your storage access keys and endpoints in the storage page

### Upload a file in the bucket

1. Go inside the created bucket

2. Upload the files named **a-css-file.css**, **a-picture.png** and **a-video.mp4** from the **content** directory at the root of the bucket.

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

2. The *Details* panel shows the CNAME for your CDN

3. Access your file with https://your-cdn-cname.cdnedge.bluemix.net/your-filename

   > If you omit the filename, you should see the S3 ListBucketResult instead

## Deploy the Cloud Foundry application

The application contains a web page **public/index.html** that includes references to the files now hosted in the Cloud Object Storage. The backend **app.js** serves this web page and replace a placeholder with the actual location of your CDN. This way all assets used by the web page will be served by the CDN.

1. With a terminal, go in the directory where you checked out the code

1. Push the application without starting it

   ```
   bx cf push --no-start
   ```

1. Configure the CDN_NAME environment variable so the app can reference the CDN contents

   ```
   bx cf set-env webapp-with-cos-and-cdn CDN_CNAME your-cdn.cdnedge.bluemix.net
   ```

1. Start the app

   ```
   bx cf start webapp-with-cos-and-cdn
   ```

1. Access the app with your web browser, the page stylesheet, a picture and a video are loaded from the CDN.
