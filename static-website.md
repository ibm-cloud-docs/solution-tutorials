# Serve static files to users around the world
Host and serve website assets and user generated cotent in a Content Delivery Network (CDN) and Cloud Object Storage fast and secure to users around the world.

## Objectives
* Create a Cloud Object Storage S3 bucket
* Upload files to a bucket
* Make the website content globally available with a CDN

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

## Create a Cloud Object Storage S3 bucket
{: #create_cos}

### Create a Cloud Object Storage S3

1. Go in the Bluemix catalog

2. Search for **Storage**

3. Select **Cloud Object Storage**

4. Select **Cloud Object Storage S3**

5. Click **Create**

   > You are redirected to the Infrastructure console

6. Click **Continue**

7. Click **Place Order**

8. Go to the **Storage** page https://control.bluemix.net/storage/objectstorage to view the newly created storage

9. Update its description with your name to easily find the storage later

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

### Configure a desktop client to work with the storage

By default the bucket and its files are not publicly available. We are going to check the permissions so that the file can be accessed through the Internet without authentication.

COS provides a S3 compatible API https://ibm-public-cos.github.io/crs-docs/api-reference and you can use command line interfaces too https://ibm-public-cos.github.io/crs-docs/cli.

Cyberduck is a desktop client that makes it easy to work with S3 storages.

Follow the steps detailed here https://ibm-public-cos.github.io/crs-docs/desktop-clients to configure Cyberduck to access your storage. The steps are:
      1. Download an install Cyberduck from https://cyberduck.io/
      2. Add a new connection of type **S3 Storage**
      3. Find your storage access keys and endpoints in the storage page

### Upload a file in the bucket

1. Go inside the created bucket

2. Upload one file named **index.html**

### Make the file publicly available

1. Edit the permissions of the file and give **Everyone** the **READ** permission.

2. Access the file through your browser. The link will look like

   http://s3-api.us-geo.objectstorage.softlayer.net/your-bucket-name/your-filename

   > this link is for a cross-region bucket in the US

## Make the website content globally available with a CDN

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

## Use a custom domain to access the content
{: #custom_domain}

1. Create a CNAME record in your DNS pointing to the your-cdn-cname.cdnedge.bluemix.net. Make sure to use the same domain name you specified when creating the CDN.

2. Confirm the CNAME is correctly created

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

3. Access your file with http://your-custom-domain/your-filename
