---
copyright:
  years: 2018
lastupdated: "2018-04-03"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a smart data lake

In this tutorial, you will create a data lake for your organization using {{site.data.keyword.cos_full_notm}}. By combining {{site.data.keyword.cos_short}} and SQL Query, data analysts can query data where it lies using SQL. You'll also leverage the SQL Query service in a Jupyter Notebook to create rich charts and visualizations. When you're done with your analysis, you can share your datasets with the rest of the organization securely through Knowledge Catalog.

## Objectives

- Use {{site.data.keyword.cos_short}} to store raw data files
- Query data directly from {{site.data.keyword.cos_short}} using SQL Query
- Refine and visualize data in {{site.data.keyword.knowledgestudiofull}}
- Catalog and share data across your organization with Knowledge Catalog


## Services used

  * [{{site.data.keyword.cos_full_notm}}](https://console.bluemix.net/catalog/services/cloud-object-storage)
  * [SQL Query](https://console.bluemix.net/catalog/services/sql-query)
  * [{{site.data.keyword.knowledgestudiofull}}](https://console.bluemix.net/catalog/services/watson-studio)
  * [Knowledge Catalog](https://console.bluemix.net/catalog/services/knowledge-catalog)

## Before you begin

1. [Install Bluemix Command Line Tool](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started)
2. [Install cURL](https://curl.haxx.se/download.html)
3. [Install Aspera Connect](http://downloads.asperasoft.com/connect2/)

## Create required services
In this section, you will create the services required to build your smart data lake.

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://console.bluemix.net/docs/cli/reference/bluemix_cli/get_started.html#getting-started).

```sh
bx login
bx target --cf
```

2. Create an instance of {{site.data.keyword.cos_short}}. {{site.data.keyword.cos_short}} stores your raw data files and intermediate data sets created by other services.
```sh
bx resource service-instance-create data-lake-cos cloud-object-storage lite global
```

3. Create an instance of SQL Query. SQL Query converts native data files (CSV or JSON) into SQL executable data sets.
```sh
bx resource service-instance-create data-lake-sql sql-query beta us-south
```

4. Create an instance of {{site.data.keyword.knowledgestudiofull}}. {{site.data.keyword.knowledgestudioshort}} provides access to Jupyter Notebooks that contain live code, equations, visualizations and narrative text.
```sh
bx service create data-science-experience free-v1 data-lake-studio
```

5. Create an instance of Knowledge Catalog. Knowledge Catalog is used to classify and govern access to data.
```sh
bx service create datacatalog Lite data-lake-catalog
```

## Uploading data
In this section, you will begin to upload data to a {{site.data.keyword.cos_short}} bucket using built-in {{site.data.keyword.CHSTSshort}}.

1. Export the **IAM token:  Bearer** token. The token is needed to execute {{site.data.keyword.cos_short}} APIs. 

```sh
bx iam oauth-tokens
```

```sh
export IAM_TOKEN=<REPLACE_WITH_TOKEN>
```

2. Obtain the IBM Service Instance ID also used with {{site.data.keyword.cos_short}} APIs. (The Service Instance ID begins with `crn:`.)

```sh
bx resource service-instance data-lake-cos
```

```sh
export COS_SERVICE_ID=<REPLACE_WITH_ID_VALUE>
```

3. Create a bucket in the *us-south* region to store data. {{site.data.keyword.CHSTSshort}} is only available for buckets created in the [us-south region](https://console.bluemix.net/docs/services/cloud-object-storage/basics/endpoints.html) at this time.

```sh
export BUCKET_NAME=<REPLACE_WITH_BUCKET_NAME>
```

```sh
curl -X "PUT" "https://s3.us-south.objectstorage.softlayer.net/$BUCKET_NAME" -H "Authorization: Bearer $IAM_TOKEN" -H "ibm-service-instance-id: $COS_SERVICE_ID"
```

4. Download the [City of Los Angeles / Traffic Collision Data from 2010](https://catalog.data.gov/dataset/traffic-collision-data-from-2010-to-present/resource/643d0e98-5f40-4db3-8427-02641dd05fd9?inner_span=True) CSV file. The file is 77MB and may take a few minutes depending on your download speed.

```sh
curl -o traffic-los-angeles.csv https://data.lacity.org/api/views/d5tf-ez2w/rows.csv?accessType=DOWNLOAD
```

You could contine to upload the file directly to the bucket using cURL, but this does not benefit from [{{site.data.keyword.CHSTSshort}} features](https://www.ibm.com/blogs/bluemix/2018/03/ibm-cloud-object-storage-simplifies-accelerates-data-to-the-cloud/). {:tip: .tip}

5. In your browser, access the {{site.data.keyword.cos_short}} **data-lake-cos** service instance from the [Storage dashboard](https://console.bluemix.net/dashboard/storage).
 - From **Buckets**, select your bucket name.
 - Click the **Add objects** button.
 - Select the **Aspera high-speed transfer** radio button.
 - Click the **Add files** button. (This will open the Aspera plugin, which will be in a separate window - possibly behind your browser window.)
 - Browse to and select the previously downloaded **traffic-los-angeles.csv** file.

## Working with data

In this section, you will use SQL Query to manipulate your data where it resides in {{site.data.keyword.cos_short}}.

1. Access the **data-lake-sql** SQL Query service instance from your [Dashboard](https://console.bluemix.net/dashboard/apps).

2. Select **Open UI**.

3. Create a new dataset by executing SQL directly on the previously uploaded CSV file.
 - Enter the following SQL into the **Type SQL here ...** text area.

```sql
SELECT
 `Dr Number` AS id,
 `Date Occurred` AS date,
 `Time Occurred` AS time, 
 `Area Name` AS area, 
 `Victim Age` AS age, 
 `Victim Sex` AS sex, 
 `Location` AS location
FROM cos://us-south/<your-bucket-name>/traffic-los-angeles.csv 
WHERE 
 `Time Occurred` >= 1700 AND 
 `Time Occurred` <= 2000 AND 
 `Victim Age` >= 20 AND 
 `Victim Age` <= 35
```

 - Replace the URL in the `FROM` clause with your bucket's name.

4. The **Target** will auto-create a {{site.data.keyword.cos_short}} bucket to hold the result. Change the **Target** to `cos://us-south/<your-bucket-name>/results`.

5. Click the **Run** button. The results will appear below.

6. On the **Query Details** tab, click the **Launch** icon next after the **Result Location** URL to view the intermediate data set that is now also stored on {{site.data.keyword.cos_short}}.

## Combine Jupyter Notebooks with SQL Query

In this section, you will create a SQL Query client within a Jupyter Notebook. This will allow you to create intermediate datasets that can be visualized.

1. Create a new Jupyter Notebook in {{site.data.keyword.knowledgestudioshort}}.
 - In a browser, open [{{site.data.keyword.knowledgestudioshort}}](https://dataplatform.ibm.com/home?context=analytics&apps=data_science_experience&nocache=true).
 - Select the **New project** tile followed by **Jupyter Notebooks**.
 - Select **OK** and then provide a **Project name**.
 - Ensure **Storage** is set to **data-lake-cos**.
 - Click **Create**.
 - In the resulting project, click **Add to project** and **Notebook**.
 - From the **Blank** tab, enter a **Notebook name**.
 - Leave the **Language** and **Runtime** defaults; click **Create notebook**.

2. From the Notebook, install and import PixieDust and ibmcloudsql by adding the following commands to the **In [ ]:** input prompt and then **Run**.

```python
!pip -q install ibmcloudsql
!pip install --upgrade pixiedust
import ibmcloudsql
import pixiedust
```

3. Add a {{site.data.keyword.cos_short}} API key to the Notebook. This will allow SQL Query results to be stored in {{site.data.keyword.cos_short}}.
 - Add the following in the next **In [ ]:** prompt and then **Run**.

```python
import getpass
cloud_api_key = getpass.getpass('Enter your IBM Cloud API Key')
```

 - From the terminal, create an API key.

```sh
bx iam api-key-create data-lake-cos-key
```

 - Copy the **API Key** to the clipboard.
 - Paste the API Key into the textbox in the Notebook and hit the `enter` key.

You should also store the API Key to a secure, permanent location; the Notebook does not store the API key. {:tip: .tip}

4. Add the SQL Query instance's CRN (Cloud Resource Name) to the Notebook.
 - In the next **In [ ]:** prompt, assign the CRN to a variable in your Notebook.

```python
sql_crn = '<SQL_QUERY_CRN>'
```

 - From the terminal, copy the CRN from the **ID** property to your clipboard.

```sh
bx resource service-instance data-lake-sql
```
 - Paste the CRN between the single quotes and then **Run**.

5. Add another variable to the Notebook to specify the {{site.data.keyword.cos_short}} bucket and **Run**.

```python
sql_cos_endpoint = 'cos://us-south/<your-bucket-name>'
```

6. Execute the following commands in another **In [ ]:** prompt and **Run** to view the result set. You will also have new `accidents/jobid=<id>/<part>.csv*` file added to your bucket that includes the result of the `SELECT`.

```python
sqlClient = ibmcloudsql.SQLQuery(cloud_api_key, sql_crn, sql_cos_endpoint + '/accidents')

data_source = sql_cos_endpoint + "/traffic-los-angeles.csv"

query = """
SELECT 
    `Time Occurred` AS time, 
    `Area Name` AS area, 
    `Victim Age` AS age, 
    `Victim Sex` AS sex, 
    `Location` AS location 
FROM  {}
WHERE 
    `Time Occurred` >= 1700 AND `Time Occurred` <= 2000 AND 
    `Victim Age` >= 20 AND `Victim Age` <= 35
""".format(data_source)

traffic_collisions = sqlClient.run_sql(query)
traffic_collisions.head()
```

## Visualize data using PixieDust

In this section, you will visualize the previous result set using PixieDust and Mapbox.

1. Create a common table expression to convert the `location` column to separate `latitude` and `longitude` columns. **Run** the following from the Notebook's prompt.

```python
query = """
WITH location AS ( 
    SELECT 
        id, 
        cast(split(coordinates, ',')[0] as float) as latitude, 
        cast(split(coordinates, ',')[1] as float) as longitude 
    FROM (SELECT 
            `Dr Number` as id, 
            regexp_replace(Location, '[()]', '') as coordinates 
        FROM {0}
    ) 
) 
SELECT  
    d.`Dr Number` as id, 
    d.`Date Occurred` as date, 
    d.`Time Occurred` AS time, 
    d.`Area Name` AS area, 
    d.`Victim Age` AS age, 
    d.`Victim Sex` AS sex, 
    l.latitude, 
    l.longitude 
FROM {0} AS d 
    JOIN 
    location AS l 
    ON l.id = d.`Dr Number` 
WHERE 
    d.`Time Occurred` >= 1700 AND 
    d.`Time Occurred` <= 2000 AND 
    d.`Victim Age` >= 20 AND 
    d.`Victim Age` <= 35 AND 
    l.latitude != 0.0000 AND 
    l.latitude != 0.0000
""".format(data_source)

traffic_location = sqlClient.run_sql(query)
traffic_location.head()
```

2. In the next **In [ ]:** prompt **Run** the `display` command to view the result using PixieDust.

```python
display(traffic_location)
```

3. Select the chart dropdown button; then select **Map**.

4. Add `latitude` and `longitude` to **Keys**. Add `id` and `age` to **Values**. Click **OK** to view the map.

5. Click the **Save** icon to save your Notebook to {{site.data.keyword.cos_short}}.

## Share your dataset with the organization

Since you've created a new dataset using SQL Query and your Notebook, you should catalog this so others can re-use it.

1. Use the **Catalog** link in the header to **View All Catalogs**.

2. Create a new catalog using the **New Catalog** button.
 - Provide a catalog **Name** and **Description**.
 - Ensure `data-lake-cos` is the **Object storage instance** and click **Create**.

3. Click **Add to Catalog** then **Connection** and finally **Cloud Object Storage**.

4. Create Service Credentials to provide the information needed for the previous step.
 - In a new browser tab, access your **data-lake-cos** service instance from the [Storage dashboard](https://console.bluemix.net/dashboard/storage) and select **Service credentials** from the navigation.
 - Click the **New credential** button.
 - Assign the **Name** `data-lake-catalog-credentials` and set **Access role** to `Writer`.
 - Select **Create New Service ID** from **Select Service ID (Optional)**.
 - Provide **Name** `data-lake-catalog-serviceID` and **Description** `Service ID to access orgs COS data lakes`.
 - Enter `{"HMAC":true}` in the **Add Inline Configuration Parameters (Optional)** text area.
 - Click **Add** to create the credentials.

5. Copy the information in the new service ID's **View Credentials** to the **New Connection (Cloud Object Storage)** page in Knowledge Catalog.
 - Copy the `resource_instance_id` value to **Resource Instance ID**.
 - Copy the `apikey` value to **API Key**.
 - Enter `https://s3.us-south.objectstorage.softlayer.net` as the **Login URL**. (This is the us-south region originally used when you created data-lake-cos.)
 - Enter the **Name** `data-lake-cos1` and click the **Create** button.

6. Click **Add to Catalog** then **Connected Data**.
 - Click **Select Source** then **data-lake-cos1** > **your_bucket_name** > **traffic-los-angeles.csv** and click **Select**.
 - Provide the **Name** `Los Angeles Traffic from 2010`.
 - Provide the **Description** `This dataset reflects traffic collision incidents in the City of Los Angeles dating back to 2010.`
 - Add the **Tags** `vehicle_collisions` and `traffic_incidents` to further classify the dataset.
 - Click the **Add** button to share with your organization.

## Expand the tutorial
 - Visualize your CSV objects using the [{{site.data.keyword.dynamdashbemb_notm}} service](https://console.bluemix.net/catalog/services/dynamic-dashboard-embedded)

## Related information
 - [ibmcloudsql](https://github.com/IBM-Cloud/sql-query-clients/tree/master/Python)
 - [Jupyter Notebooks](http://jupyter.org/)
 - [Mapbox](https://console.bluemix.net/catalog/services/mapbox-maps)
 - [PixieDust](https://www.ibm.com/cloud/pixiedust)
