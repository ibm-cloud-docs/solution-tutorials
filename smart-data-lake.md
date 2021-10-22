---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-08-24"
lasttested: "2021-01-07"

content-type: tutorial
services: cloud-object-storage, sql-query
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build a data lake using object storage
{: #smart-data-lake}
{: toc-content-type="tutorial"}
{: toc-services="cloud-object-storage, sql-query"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

Definitions of the term data lake vary, but in the context of this tutorial, a data lake is an approach to storing data in its native format for organizational use. To that end, you will create a data lake for your organization using {{site.data.keyword.cos_short}}. By combining {{site.data.keyword.cos_short}} and {{site.data.keyword.sqlquery_short}}, data analysts can query data where it lies using SQL. You'll also leverage the SQL Query service in a Jupyter Notebook to conduct a simple analysis. When you're done, allow non-technical users to discover their own insights.
{: shortdesc}

## Objectives
{: #smart-data-lake-0}

- Use {{site.data.keyword.cos_short}} to store raw data files
- Query data directly from {{site.data.keyword.cos_short}} using SQL Query
- Refine and analyze data in {{site.data.keyword.DSX_full}}

![Architecture](images/solution29/Smart-Data-Lake-Architecture.png){: class="center"}
{: style="text-align: center;"}

1. Raw data is stored on {{site.data.keyword.cos_short}}.
2. Data is reduced, enhanced or refined with SQL Query.
3. Data analysis occurs in {{site.data.keyword.DSX}}.
4. Non-technical users access data through application(s).
5. Refined data is pulled from {{site.data.keyword.cos_short}}.

## Before you begin
{: #smart-data-lake-1}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI.

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.
<!--#/istutorial#-->

Optionally:
- [Install Aspera Connect](http://downloads.asperasoft.com/connect2/) for high-speed data upload to {{site.data.keyword.cos_short}}.

## Create services
{: #smart-data-lake-2}
{: step}

In this section, you will create the services required to build your data lake.

This section uses the command line to create service instances. Alternatively, you may do the same from the service page in the [catalog](https://{DomainName}/catalog) using the provided links.
{: tip}

1. Login to {{site.data.keyword.cloud_notm}} via the command line and target your Cloud Foundry account. See [CLI Getting Started](https://{DomainName}/docs/cli?topic=cli-getting-started).
    ```sh
    ibmcloud login
    ```
    {: pre}

    ```sh
    ibmcloud target --cf
    ```
    {: pre}

2. Initialize the default resource group used by the command line by listing the resource groups and setting the default.
    ```sh
    ibmcloud resource groups
    ```
    {: pre}

    ```sh
    ibmcloud target -g <your-default-resource-group>
    ```
    {: pre}

3. Create an instance of [{{site.data.keyword.cos_short}}](https://{DomainName}/catalog/services/cloud-object-storage) with a Cloud Foundry alias. If you already have {{site.data.keyword.cos_short}} instance with a **lite** plan, use **standard** instead of **lite**.
    ```sh
    ibmcloud resource service-instance-create data-lake-cos cloud-object-storage lite global
    ```
    {: pre}

4. Create an instance of [{{site.data.keyword.sqlquery_short}}](https://{DomainName}/catalog/services/sql-query). Replace **us-south** by your region, if needed.
    ```sh
    ibmcloud resource service-instance-create data-lake-sql sql-query lite us-south
    ```
    {: pre}

5. Create an instance of [{{site.data.keyword.DSX}}](https://{DomainName}/catalog/services/watson-studio).
    ```sh
    ibmcloud resource service-instance-create data-lake-studio data-science-experience free-v1 us-south
    ```
    {: pre}

## Uploading data
{: #smart-data-lake-3}
{: step}

In this section, you will upload data to an {{site.data.keyword.cos_short}} bucket. You can do this using regular http upload or by utilising the built-in {{site.data.keyword.CHSTSshort}}. {{site.data.keyword.CHSTSshort}} protects data as it is uploaded to the bucket and [can greatly reduce transfer time](https://www.ibm.com/cloud/blog/announcements/ibm-cloud-object-storage-simplifies-accelerates-data-to-the-cloud).

1. Download the [City of Los Angeles / Traffic Collision Data from 2010](https://data.lacity.org/api/views/d5tf-ez2w/rows.csv?accessType=DOWNLOAD) CSV file. The file is 81MB and may take a few minutes to download.
2. In your browser, access the **data-lake-cos** service instance from the [Resource List](https://{DomainName}/resources) under the storage section.
3. Create a new bucket to store data.
    - Click **Create a bucket**.
    - Select **Custom bucket**.
    - Select **Regional** from the **Resiliency** drop down.
    - Select a **Location**.
    - Provide a bucket **Name** and click **Create**. If you receive an *AccessDenied* error, try with an unique bucket name.
4. Upload the CSV file to {{site.data.keyword.cos_short}}.
    - From your bucket, click **Upload** > **Files**.
    - Select **Standard Upload** to use regular http file transfer or select the **Aspera high-speed transfer. Requires installation.** radio button.
    - In case of Aspera upload, click **Install Aspera connect** > Download Connect. This will download the Aspera plugin to your machine. Once the plugin is successfully installed. You may have to refresh the browser.
    - Click **Select files** > Browse and select the previously downloaded CSV file.

## Working with data
{: #smart-data-lake-4}
{: step}

In this section, you will convert the original, raw dataset into a targeted cohort based on time and age attributes. This is helpful to consumers of the data lake who have specific interests or would struggle with very large datasets.

You will use SQL Query to manipulate the data where it resides in {{site.data.keyword.cos_short}} using familiar SQL statements. {{site.data.keyword.sqlquery_short}} has built-in support for CSV, JSON and Parquet - no additional computation services or extract-transform-load is necessary.

1. Access the **data-lake-sql** {{site.data.keyword.sqlquery_short}} service instance from your [Resource List](https://{DomainName}/resources).
2. Click **Launch SQL Query UI** under **Manage**.
3. Create a new dataset by executing SQL directly on the previously uploaded CSV file.
    - Replace `<your-bucket-name` in the URL of the`FROM` clause with your bucket's name.
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
        FROM cos://us-south/<your-bucket-name>/Traffic_Collision_Data_from_2010_to_Present.csv
        WHERE
        `Time Occurred` >= 1700 AND
        `Time Occurred` <= 2000 AND
        `Victim Age` >= 20 AND
        `Victim Age` <= 35
        ```
        {: codeblock}

    - Click **Run**.
4. The **Target location** will auto-create a {{site.data.keyword.cos_short}} bucket to hold the result.
5. On the **Query details** tab, click on the URL under **Result Location** to view the intermediate dataset, which is now also stored on {{site.data.keyword.cos_short}}.

## Combine Jupyter Notebooks with SQL Query
{: #smart-data-lake-5}
{: step}

In this section, you will use the {{site.data.keyword.sqlquery_short}} client within a Jupyter Notebook. This re-uses the data stored on {{site.data.keyword.cos_short}} in a data analysis tool. The combination also creates datasets that are automatically stored in {{site.data.keyword.cos_short}} that can then be accessed by applications and tools serving line of business users.

1. Create a new Jupyter Notebook in {{site.data.keyword.DSX}}.
    - Access the **data-lake-studio** {{site.data.keyword.DSX}} service instance from your [Resource List](https://{DomainName}/resources).
    - Click **Projects** under **Quick navigation**, then **New project +** followed by **Create an empty project**.
    - Use **Data lake project** as **Name**.
    - Under **Define storage** select **data-lake-cos**.
    - Click **Create**.
    - In the resulting project, click **Add to project** and **Notebook**.
    - From the **Blank** tab, enter a **Data lake notebook** as **Name**.
    - Leave the **Language** and **Runtime** to defaults and click **Create notebook**.
2. From the Notebook, install and import PixieDust and ibmcloudsql by adding the following commands to the `In [ ]:` input prompt and then **Run**
    ```python
    !pip install --user --upgrade pixiedust
    !pip install --user --upgrade ibmcloudsql
    import ibmcloudsql
    from pixiedust.display import *
    ```
    {: codeblock}

3. Add a {{site.data.keyword.cos_short}} API key to the Notebook. This will allow {{site.data.keyword.sqlquery_short}} results to be stored in {{site.data.keyword.cos_short}}.
    - Add the following in the next cell, the `In [ ]:` prompt, and then **Run**.
        ```python
        import getpass
        cloud_api_key = getpass.getpass('Enter your IBM Cloud API Key')
        ```
        {: codeblock}

    - From the terminal, create an API key.
        ```sh
        ibmcloud iam api-key-create data-lake-cos-key
        ```
        {: pre}

    - Copy the **API Key** to the clipboard.
    - Paste the API Key into the textbox in the Notebook and hit the `enter` key.
    - You should also store the API Key to a secure, permanent location; the Notebook does not store the API key.
4. Add the {{site.data.keyword.sqlquery_short}} instance's CRN (Cloud Resource Name) to the Notebook.
    - In the next cell, assign the CRN to a variable in your Notebook. Copy the following into it, but do not run it yet.
        ```python
        sql_crn = '<SQL_QUERY_CRN>'
        ```
        {: codeblock}

    - From the terminal, copy the CRN from the **ID** property to your clipboard.
        ```sh
        ibmcloud resource service-instance data-lake-sql
        ```
        {: pre}

    - Paste the CRN between the single quotes, replacing **<SQL_QUERY_CRN>** and then **Run**.
5. Add another variable to the Notebook to specify the {{site.data.keyword.cos_short}} bucket and **Run**.
    ```python
    sql_cos_endpoint = 'cos://us-south/<your-bucket-name>'
    ```
    {: codeblock}

6. Enter the following commands in another cell and click **Run** to view the result set. You will also have new `accidents/jobid=<id>/<part>.csv*` file added to your bucket that includes the result of the `SELECT`.
    ```python
    sqlClient = ibmcloudsql.SQLQuery(cloud_api_key, sql_crn, sql_cos_endpoint + '/accidents')

    data_source = sql_cos_endpoint + "/Traffic_Collision_Data_from_2010_to_Present.csv"

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
    {: codeblock}

## Visualize data using PixieDust
{: #smart-data-lake-6}
{: step}

In this section, you will visualize the previous result set using PixieDust and Mapbox to better identify patterns or hot spots for traffic incidents.

1. Create a common table expression to convert the `location` column to separate `latitude` and `longitude` columns. **Run** the following from another Notebook cell.
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
    {: codeblock}

2. In the next cell **Run** the `display` command to view the result using PixieDust.
    ```python
    display(traffic_location)
    ```
    {: codeblock}
    
3. Select the chart dropdown button; then select **Map**.
4. Add `latitude` and `longitude` to **Keys**. Add `id` and `age` to **Values**. Click **OK** to view the map.
5. Click **File** > **Save** to save your Notebook to {{site.data.keyword.cos_short}}.

![Notebook](images/solution29/notebook-mapbox.png){: class="center"}
{: style="text-align: center;"}

## Share your dataset with the organization
{: #smart-data-lake-7}
{: step}

Not every user of the data lake is a data scientist. You can allow non-technical users to gain insight from the data lake. Tools with analytic capabilities or for visualization can import data stored in CSV files. Application developers can make use of [{{site.data.keyword.dynamdashbemb_notm}}](https://{DomainName}/docs/cognos-dashboard-embedded?topic=cognos-dashboard-embedded-gettingstartedtutorial) to let users build and use feature-rich dashboards. Such a dashboard for the traffic data is shown below. The tutorial on [combining serverless and Cloud Foundry for data retrieval and analytics](https://{DomainName/docs/solution-tutorials?topic=solution-tutorials-serverless-github-traffic-analytics) uses {{site.data.keyword.dynamdashbemb_notm}} to effortless provide visualizations as part of a web app.

![Dashboard Chart](images/solution29/dashboard-chart.png){: class="center"}
{: style="text-align: center;"}

## Expand the tutorial
{: #smart-data-lake-9}

Congratulations, you have built a data lake using {{site.data.keyword.cos_short}}. Below are additional suggestions to enhance your data lake.

- Experiment with additional datasets using {{site.data.keyword.sqlquery_short}}
- Stream data from multiple sources into your data lake by completing [Big data logs with streaming analytics and SQL](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-big-data-log-analytics#big-data-log-analytics)
- Build a web app with a dashboard for line of business users utilizing [{{site.data.keyword.dynamdashbemb_notm}}](https://{DomainName}/docs/cognos-dashboard-embedded?topic=cognos-dashboard-embedded-gettingstartedtutorial).

## Remove resources
{: #smart-data-lake-10}
{: step}

Run the following commands to remove services, applications and keys you created and used.

```sh
ibmcloud resource service-alias-delete dashboard-nodejs-cos
```
{: pre}

```sh
ibmcloud iam api-key-delete data-lake-cos-key
```
{: pre}

```sh
ibmcloud resource service-instance-delete data-lake-cos
```
{: pre}

```sh
ibmcloud resource service-instance-delete data-lake-sql
```
{: pre}

```sh
ibmcloud resource service-instance-delete data-lake-studio
```
{: pre}


Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](https://{DomainName}/docs/account?topic=account-resource-reclamation).
{: tip}

## Related content
{: #smart-data-lake-11}

- [ibmcloudsql](https://github.com/IBM-Cloud/sql-query-clients/tree/master/Python)
- [Jupyter Notebooks](http://jupyter.org/)
- [PixieDust](https://pixiedust.github.io/pixiedust/index.html)
