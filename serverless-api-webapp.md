# Serverless Web Application and API

Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.

## Objectives

* Deploy a serverless backend and database
* Expose a REST API
* Host a static website

## Before you begin
{: #prereqs}

1. GitHub account

## Create the database

Start by creating a database. Cloudant NoSQL DB is a fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema. Cloudant is built upon and compatible with Apache CouchDB and accessible through a secure HTTPS API, which scales as your application grows. 

![](images/solution8/Catalog_Cloudant.png)

1. Click on **Catalog** in the top navigation bar.
2. Click on **Data & Analytics** under Platform on the left pane and select **Cloudant NoSQL DB**.
3. Set **Service name** to "guestbook-database" and click **Create**.
4. Click on **Launch** to lauch the Cloudant dashboard.
5. Select the database icon on the left and then **Create Database** on top.
6. Enter "guestbook" as the value and click **Create**.

![](images/solution8/Create_Database.png)

Your database should now be created successfuly. 

## Create Cloud Functions actions

In this section, you will create serverless actions (also commonly called functions). IBM Cloud Functions (based on Apache OpenWhisk) is a Function-as-a-Service (FaaS) platform which executes functions in response to incoming events and costs nothing when not in use.

![](images/solution8/Functions.png)

### Sequence of actions to save the guestbook entry

1. In the left menu choose **Functions**. 
2. Click **Start Creating** and **Create Action** prepare.
3. Set **Action Name** to **prepare-entry-for-save**.
4. Select **Enable as Web Action** and **Create**
5. Replace the code in the editor with the the following and click **Save**.

```
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

1. Click **Open in Develop View** and  **Link into a Sequence**
2. Pick **Cloudant**  and **create document**
3. Click **New Binding** on the left.
4. **Add to Sequence**
5. Set **Name** to binding-for-guestbook
6. Select the **guestbook-database** instance and the **guestbook** database
7. Click **Save Configuration** and then **This Looks Good**
8. Name the sequence **save-guestbook-entry**
9. **Save Action Sequence**.
10. **Run the sequence** to test it with the following **JSON Input**.
```
{
  "name": "John Smith",
  "email": "john@smith.com",
  "comment": "this is my comment"
}
```
{: codeblock}

1. Check the database

### One sequence of actions to retrieve entries

1. Browse public packages
2. Pick Cloudant **list documents**
3. Select the guestbook database binding
4. Link into a sequence
5. Save the sequence

6. Create an action to configure the **list documents** call. Name it **set-read-input**

```
function main(params) {
	return {
	  params: {
	    include_docs: true
    }
	};
}
```

1. And one to process the results. Name it **format-entries**

```
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

1. Add **set-read-input** at the beginning of the sequence

2. Add **format-entries** at the end of the sequence

## Create an API

1. Go to Actions https://console.bluemix.net/openwhisk/manage/actions

2. Select the **read-guestbook-entries** sequence. In **Additional details**, check **Enable Web Action**

3. Do the same for the **save-guestbook-entry** sequence

4. Go to APIs https://console.bluemix.net/openwhisk/apimanagement

5. **Create Managed API**

6. Set name to **guestbook**

7. Set base path to **/api**

8. Create operation GET /entries with action set to **read-guestbook-entries**

9. Create operation PUT /entries with action set to **save-guestbook-entry**

10. Save and expose the API

## Connect the web app

1. Fork the Guestbook user interface repository https://github.ibm.com/frederic-lavigne/serverless-guestbook to your public GitHub

2. Modify docs/guestbook.js and replace apiUrl with the route given by API Connect

3. Change the Settings of the repo to have GitHub Pages enabled on master/documents

4. Access the public page

5. Use the app
