---


copyright:
  years: 2017
lastupdated: "2017-09-28"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}


# Serverless Web Application and API

Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.

The application is a simple guestbook website where users can post messages.

## Objectives

* Deploy a serverless backend and database
* Expose a REST API
* Host a static website
* Optional: Use a custom domain for the REST API

![](./images/solution8/Architecture.png)

## Before you begin
{: #prereqs}

This guide uses GitHub Pages to host the static website. Make sure you have a public GitHub account.

## Create the Guestbook database

Start by creating a database. Cloudant NoSQL DB is a fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema. Cloudant is built upon and compatible with Apache CouchDB and accessible through a secure HTTPS API, which scales as your application grows.

![](images/solution8/Catalog_Cloudant.png)

1. In the Catalog, under **Data & Analytics**, select **Cloudant NoSQL DB**
2. Set the service name to **guestbook-db**
3. Click **Create**
4. **Launch** the Cloudant service console
5. Create a database named **guestbook**
   ![](images/solution8/Create_Database.png)

## Create Cloud Functions actions

In this section, you will create serverless actions (also commonly called functions). IBM Cloud Functions (based on Apache OpenWhisk) is a Function-as-a-Service (FaaS) platform which executes functions in response to incoming events and costs nothing when not in use.

![](images/solution8/Functions.png)

### Sequence of actions to save the guestbook entry

You can create an action that chains together a sequence of actions. The first sequence we create is used to persist a guest message. Given a name, an email and a comment, the sequence will:

   * Create a document to be persisted
   * Store the document in the database

1. Switch to **Cloud Functions**
2. Create a new Node.js action named **prepare-entry-for-save**
3. Use this code for the action:
   ```js
   /**
    * Prepare the guestbook entry to be persisted
    */
   function main(params) {
     if (!params.name || !params.comment) {
       return Promise.reject({ error: 'no name or comment'});
     }

     return {
       doc: {
         createdAt: new Date(),
          name: params.name,
          email: params.email,
          comment: params.comment
       }
     };
   }
   ```
   {: codeblock}
4. Open the action in the Develop view https://console.bluemix.net/openwhisk/editor
5. **Link into a sequence**
6. Pick Cloudant **create document**.
7. Create new binding.
8. Set name to **binding-for-guestbook**
9. Select the **guestbook-db** Cloudant instance and the **guestbook** database
10. Save the configuration
11. Click **Add to sequence** and then **This looks good**.
12. Name the sequence **save-guestbook-entry**
13. **Save the sequence** and then **Done**
14. Select the sequence and **Run** the sequence to test it

    ```json
    {
      "name": "John Smith",
      "email": "john@smith.com",
      "comment": "this is my comment"
    }
    ```
    {: codeblock}
15. Check the database to confirm it contains the new record

### Sequence of actions to retrieve entries

The second sequence is used to retrieve the existing guestbook entries. The sequence will:
   * List all documents from the database
   * Format the documents and returning them

1. Create an action to configure the **list documents** call. Name it **set-read-input**
   ```js
   function main(params) {
     return {
       params: {
         include_docs: true
       }
     };
   }
   ```
   {: codeblock}
2. And one to process the results. Name it **format-entries**
   ```js
   const md5 = require('spark-md5');

   function main(params) {
     return {
       entries: params.rows.map((row) => { return {
         name: row.doc.name,
         email: row.doc.email,
         comment: row.doc.comment,
         createdAt: row.doc.createdAt,
         icon: (row.doc.email ? `https://secure.gravatar.com/avatar/${md5.hash(row.doc.email.trim().toLowerCase())}?s=64` : null)
       }})
     };
   }
   ```
   {: codeblock}
3. Select the **set-read-input** action
4. Select **Link into a sequence**
5. Select **Cloudant** then the **list documents** action
6. Select the **binding-for-guestbook** binding
7. Click **Add to Sequence**
8. Click **Extend**
9. Select **My Actions**
10. Select **format-entries**
11. Click **Add to Sequence**
12. Click **This Looks Good**
13. Name the sequence **read-guestbook-entries**
14. Save the action sequence
15. Done

## Create an API

1. Go to Actions https://console.bluemix.net/openwhisk/manage/actions
2. Select the **read-guestbook-entries** sequence. In **Additional details**, check **Enable Web Action**
3. Do the same for the **save-guestbook-entry** sequence
4. Go to APIs https://console.bluemix.net/openwhisk/apimanagement
5. **Create Managed API**
6. Set name to **guestbook**
7. Set base path to **/guestbook**
8. Create an operation to retrieve guestbook entries:
   1. Set **path** to **/entries**
   2. Set **verb** to **GET**
   3. Select the **read-guestbook-entries** action
9. Create an operation to persist a guestbook entry:
   1. Set **path** to **/entries**
   2. Set **verb** to **PUT**
   3. Select the **save-guestbook-entry** action
10. Save and expose the API

## Deploy the web app

1. Fork the Guestbook user interface repository https://github.ibm.com/frederic-lavigne/serverless-guestbook to your public GitHub
2. Modify docs/guestbook.js and replace the value of **apiUrl** with the route given by API Connect
3. Commit the modified file
4. In the Settings page of your repository, scroll to **GitHub Pages**, change the source to **master branch /docs folder** and Save
5. Access the public page for your repository
6. You should the test guestbook entry created earlier
7. Add one new entry

## Optional: Use your own domain for the API

1. Create your domain under your organization https://console.bluemix.net/docs/admin/manageorg.html#managedomains
2. Upload a SSL certificate for your domain and the subdomain you will use for the API
3. Go to the Cloud Functions dashboard, select **APIs** and the Guestbook API
4. Switch to **Definition**
5. Set the **Domain for API** to the domain you added to your organization
6. Set the **Subdomain for API** to **guestbook-api**
7. At this stage, you need to configure your DNS to create a CNAME mapping this subdomain to the IBM Cloud servers. Create a CNAME record for the domain targeting one of the following secure endpoints depending on which region hosts the target API:
   * US South: secure.us-south.bluemix.net.
   * United Kingdom: secure.eu-gb.bluemix.net.
   * Frankfurt: secure.eu-de.bluemix.net.
   * Sydney: secure.au-syd.bluemix.net.

   > Refer to https://console.bluemix.net/docs/apis/management/manage_apis.html#custom_domains for additional information

8. Save the API
9. Wait for DNS to propagate and you will be able to access your guestbook api at https://guestbook-api.mydomain.com/guestbook
10. Edit docs/guestbook.js and update the value of **apiUrl** with https://guestbook-api.mydomain.com/guestbook
11. Commit the modified file
12. Your application now accesses the API through your custom domain
