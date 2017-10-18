# Serverless Application and API

Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.

The application is a simple guestbook website where users can post messages.

## Objectives

* Deploy a serverless backend and database
* Expose a REST API
* Host a static website

![](./images/solution8/Architecture.png)

## Before you begin
{: #prereqs}

This guide uses GitHub Pages to host the static website. Make sure you have a public GitHub account.

## Create the Guestbook database

1. In the catalog, under **Data & Analytics**, select **Cloudant NoSQL DB**

1. Set the service name to **guestbook-db**

1. Click **Create**

1. **Launch** the Cloudant service console

1. Create a database named **guestbook**

## Create actions

### One sequence of actions to save the guestbook entry

The first sequence we create is used to persist a guest message. Given a name, an email and a comment, the sequence will:
   * create a document to be persisted
   * store the document

1. Switch to **Cloud Functions**

1. Create a new Node.js action named **prepare-entry-for-save**

1. Use this code for the action:

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

1. Open the action in the Develop view https://console.bluemix.net/openwhisk/editor

1. Link into a sequence

1. Pick Cloudant **create document**

1. Create new binding

1. Set name to **binding-for-guestbook**

1. Select the **guestbook-db** Cloudant instance

1. Select the **guestbook** database

1. Save the configuration

1. Click **Add to sequence**

1. Click **This looks good**

1. Name the sequence **save-guestbook-entry**

1. Save the sequence

1. Done

1. Select the sequence

1. Run the sequence to test it

   ```json
   {
     "name": "John Smith",
     "email": "john@smith.com",
     "comment": "this is my comment"
   }
   ```

1. Check the database it should contain one record

### One sequence of actions to retrieve entries

The second sequence is used to retrieve the existing guestbook entries. The sequence will:
   * list all documents from the database
   * format the documents before returning them

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

1. And one to process the results. Name it **format-entries**

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

1. Select the **set-read-input** action

1. Select **Link into a sequence**

1. Select **Cloudant** then the **list documents** action

1. Select the **binding-for-guestbook** binding

1. Click **Add to Sequence**

1. Click **Extend**

1. Select **My Actions**

1. Select **format-entries**

1. Click **Add to Sequence**

1. Click **This Looks Good**

1. Name the sequence **read-guestbook-entries**

1. Save the action sequence

1. Done

## Create an API

1. Go to Actions https://console.bluemix.net/openwhisk/manage/actions

1. Select the **read-guestbook-entries** sequence. In **Additional details**, check **Enable Web Action**

1. Do the same for the **save-guestbook-entry** sequence

1. Go to APIs https://console.bluemix.net/openwhisk/apimanagement

1. **Create Managed API**

1. Set name to **guestbook**

1. Set base path to **/guestbook**

1. Create an operation to retrieve guestbook entries:
   1. Set **path** to **/entries**
   1. Set **verb** to **GET**
   1. Select the **read-guestbook-entries** action

1. Create an operation to persist a guestbook entry:
   1. Set **path** to **/entries**
   1. Set **verb** to **PUT**
   1. Select the **save-guestbook-entry** action

1. Save and expose the API

## Connect the web app

1. Fork the Guestbook user interface repository https://github.ibm.com/frederic-lavigne/serverless-guestbook to your public GitHub

1. Modify docs/guestbook.js and replace apiUrl with the route given by API Connect

1. Change the Settings of the repo to have GitHub Pages enabled on master/documents

1. Access the public page

1. Use the app
