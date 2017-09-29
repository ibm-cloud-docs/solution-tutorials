# Host a static website
Host static web content in a Content Delivery Network (CDN) for fast and secure access from around the world.

## Objectives
* Create a Cloud Object Storage S3 bucket
* Upload files to a bucket
* Make the website content globally available with a CDN
* Use a custom domain to access the content
* Configure SSL

## Before you begin
{: #prereqs}

1. **Contact your Infrastructure master user to get the following permissions:**
   * Manage CDN Account
   * Manage Storage
   * Manage CDN File Transfers
   * API Key

   > These permissions are required to be able to view and use the Storage and CDN services in this guide

1. Ensure that you have access to Storage in the Infrastructure console
   * Go to https://control.bluemix.net
   * Confirm you can see the `Storage` section and the `Object Storage` section underneath

## Create a Cloud Object Storage S3 bucket
{: #create_cos}

### Create a Cloud Object Storage S3

1. Go in the Bluemix catalog

1. Search for **Storage**

1. Select **Cloud Object Storage**

1. Select **Cloud Object Storage S3**

1. Click **Create**

   > You are redirected to the Infrastructure console

1. Click **Continue**

1. Click **Place Order**

1. Go to the **Storage** page https://control.bluemix.net/storage/objectstorage to view the newly created storage

1. Update its description with your name to easily find the storage later

### Create a bucket

1. Select the storage

1. Select **Manage Buckets**

1. Click the **+** button to add a bucket

1. Set Resiliency/Location to **Cross Region - us**

1. Set Storage Class to **Standard**

1. Set the Bucket Name to **mywebsite**

   > Avoid dots (.) in the bucket name

## Upload files to a bucket
{: #upload}

### Configure a desktop client to work with the storage

By default the bucket and its files are not publicly available. We are going to check the permissions so that the file can be accessed through the Internet without authentication.

COS provides a S3 compatible API https://ibm-public-cos.github.io/crs-docs/api-reference and you can use command line interfaces too https://ibm-public-cos.github.io/crs-docs/cli.

Cyberduck is a desktop client that makes it easy to work with S3 storages.

Follow the steps detailed here https://ibm-public-cos.github.io/crs-docs/desktop-clients to configure Cyberduck to access your storage. The steps are:
   1. Download an install Cyberduck from https://cyberduck.io/
   1. Add a new connection of type **S3 Storage**
   1. Find your storage access keys and endpoints in the storage page

### Upload a file in the bucket

1. Go inside the created bucket

1. Upload one file named **index.html**

### Make the file publicly available

1. Edit the permissions of the file and give **Everyone** the **READ** permission.

1. Access the file through your browser. The link will look like

   http://s3-api.us-geo.objectstorage.softlayer.net/your-bucket-name/your-filename

   > this link is for a cross-region bucket in the US

## Make the website content globally available with a CDN

### Create a CDN instance

1. Go into the Bluemix catalog

1. Search for **Content Delivery Network**

1. Pick the one under the **Network** category. This CDN is powered by Akamai.

1. Create a **Content Delivery Network** instance

1. Select **Akamai** as the CDN Provider

1. Click **Start Provision**

### Configure the CDN instance

1. Set the **hostname** for the CDN to your custom domain

   > Although you set a custom domain, you will still be able to access the CDN contents through the IBM provided CNAME. So if you don't plan to use custom domain, you can make set an arbitrary name.

1. Set the **Custom CNAME** prefix

   > Don't use dots "." in the name

1. Leave the **Path** empty

1. Select **Object Storage** as Origin

1. Set the **Endpoint** to your bucket API endpoint, such as *s3-api.us-geo.objectstorage.softlayer.net*

1. Set the **Bucket name** to *your-bucket-name*

1. Click **Create**

1. Find the instance in https://control.bluemix.net/network/cdn

### Access your content through the CDN domain

1. Select the CDN instance in the list at https://control.bluemix.net/network/cdn

1. The *Details* panel shows the CNAME for your CDN

1. Access your file with https://your-cdn-cname.cdnedge.bluemix.net/your-filename

   > If you omit the filename, you should see the S3 ListBucketResult instead

## Use a custom domain to access the content
{: #custom_domain}

1. Create a CNAME record in your DNS pointing to the your-cdn-cname.cdnedge.bluemix.net. Make sure to use the same domain name you specified when creating the CDN.

1. Confirm the CNAME is correctly created

   ```
   nslookup your-custom-domain
   ```

   the answer will look like:

   ```
   Non-authoritative answer:
   your-custom-domain	canonical name = your-cdn-name.cdnedge.bluemix.net.
   your-cdn-name.cdnedge.bluemix.net	canonical name = wildcard.cdnedge.bluemix.net.edgekey.net.
   wildcard.cdnedge.bluemix.net.edgekey.net	canonical name = e13937.dsce16.akamaiedge.net.
   Name:	e13937.dsce16.akamaiedge.net
   Address: 2.17.228.128
   ```

1. Access your file with http://your-custom-domain/your-filename
