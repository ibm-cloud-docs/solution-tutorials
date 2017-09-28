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

1. Create a **Content Delivery Network** instance

1. Find the instance in https://control.bluemix.net/storage/cdn

### Define an Origin Mapping between the S3 bucket and the CDN

1. Click **Add Mapping**

1. Set the Origin Base URL to http://your-bucket-name.s3-api.us-geo.objectstorage.softlayer.net/

1. Leave CNAME empty for now

1. Make note of the CDN URL Preview. It will look like:

   http://your-cdn-account-id.http.cdn.softlayer.net/another-id/your-bucket-name.s3-api.us-geo.objectstorage.softlayer.net/

1. Wait for the <cdn-account-id>.http.cdn.softlayer.net DNS address to propagate

   > You can ping <cdn-account-id>.http.cdn.softlayer.net to check if it is ready

1. Once the mapping is available, wait for the uploaded file to be distributed to the CDN

   http://your-cdn-account-id.http.cdn.softlayer.net/another-id/your-bucket-name.s3-api.us-geo.objectstorage.softlayer.net/your-filename

## Use a custom domain to access the content
{: #custom_domain}

1. Create a CNAME record in your DNS pointing to the your-cdn-account-id.http.cdn.softlayer.net

1. In the CDN, click **Add Mapping**

1. Set the Origin Base URL to http://your-bucket-name.s3-api.us-geo.objectstorage.softlayer.net/

1. Set the CNAME to your-subdomain.your-domain.com

1. The CDN URL Preview will look like http://your-subdomain.your-domain.com

1. Access the file through your browser http://your-subdomain.your-domain.com/your-filename

## Configure SSL
{: #ssl}

> This does not look possible with COS + CDN
