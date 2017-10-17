# Serverless Application and API

Create a serverless web application by hosting static website content in GitHub Pages and using Cloud Functions to implement the application backend.

## Objectives

* Deploy a serverless backend
* Expose a REST API implemented by a serverless backend
* Host a static website

## Before you begin
{: #prereqs}

1. GitHub account

## Create the database

1. Create Cloudant service instance guestbook-database
1. Create Cloudant credentials
1. Add a guestbook database

## Create actions

### One sequence of actions to save the guestbook entry

1. Create prepare-entry-for-save

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

1. Link into a sequence
1. Pick Cloudant **create document**
1. Create new binding
1. Set name to binding-for-guestbook
1. Select the guestbook Cloudant instance and the guestbook database
1. Done
1. Add to sequence
1. This looks good
1. Name the sequence **save-guestbook-entry**
1. Save
1. Done

1. Run the sequence to test it
```
{
  "name": "John Smith",
  "email": "john@smith.com",
  "comment": "this is my comment"
}
```

1. Check the database

### One sequence of actions to retrieve entries

1. Browse public packages
1. Pick Cloudant **list documents**
1. Select the guestbook database binding
1. Link into a sequence
1. Save the sequence

1. Create an action to configure the **list documents** call. Name it **set-read-input**

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

1. Add **format-entries** at the end of the sequence

## Create an API

1. Go to Actions https://console.bluemix.net/openwhisk/manage/actions

1. Select the **read-guestbook-entries** sequence. In **Additional details**, check **Enable Web Action**

1. Do the same for the **save-guestbook-entry** sequence

1. Go to APIs https://console.bluemix.net/openwhisk/apimanagement

1. **Create Managed API**

1. Set name to **guestbook**

1. Set base path to **/api**

1. Create operation GET /entries with action set to **read-guestbook-entries**

1. Create operation PUT /entries with action set to **save-guestbook-entry**

1. Save and expose the API

## Connect the web app

1. Fork the Guestbook user interface repository https://github.ibm.com/frederic-lavigne/serverless-guestbook to your public GitHub

1. Modify docs/guestbook.js and replace apiUrl with the route given by API Connect

1. Change the Settings of the repo to have GitHub Pages enabled on master/documents

1. Access the public page

1. Use the app
