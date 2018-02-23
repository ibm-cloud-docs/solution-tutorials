---
copyright:
  years: 2018
lastupdated: "2018-02-22"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Analyze and visualize open data

In this tutorial, we are going to analyze and visualize open data sets using a Jupyter Notebook. It runs on IBM Data Science Experience and uses the Apache Spark service on IBM Cloud for processing. First, we combine data about population growth, life expectancy and country ISO codes into a single data frame. Then, we query and visualize that data in several ways using the Pixiedust library for Python. All steps are performed within a notebook.

![](images/solution23/Architecture.png)

## Objectives

* Deploy Apache Spark and Data Science Experience on IBM Cloud.
* Work with a Jupyter Notebook and a Python kernel.
* Import, transform, analyze and visualize data sets.

## Products

This tutorial uses the following products:
   * {{site.data.keyword.sparkl}}
   * IBM Data Science Experience

## Service and Environment Setup
First, we need to provision the services we are using for this tutorial and create a project within the Data Science Experience.
1. Login to the [{{site.data.keyword.Bluemix_short}} catalog](https://console.bluemix.net/catalog) and navigate to the [**Data & Analytics** section](https://console.bluemix.net/catalog/?category=data). Locate the **Data Science Experience**. Once done, click on the **Get Started** button to take you to the **Data Science Experience** dashboard.
2. In the dashboard, click on the **New project** tile. In the **Name** field, enter **1stProject** as new name. You can leave the description empty.
3. On the right side of the dialog, there are the sections **Define storage** and **Define compute engine**. If it is a fresh account, then you are asked to add a service each. In that case, click on **Add** and follow the instructions in the new browser tab. Once done with the service creation, click **Refresh**. The new service should be listed now. If you already had provisioned storage or Spark services, they should  be shown.
4. Once all necessary information is filled in, you can click on **Create**. The project is created and you are taken to the project overview. Something like the following should be shown.   
   ![](images/solution23/NewProject.png)

## Add

## Create a notebook
We utilize a Jupyter Notebook as user interface. In there, we can execute code and see the results, including visualizations. Notebooks and other resources are organized in projects. Thus, we begin creating a project.
1. In the dashboard, click on the **New project** tile. In the **Name** field, enter **1stProject** as new name. You can leave the description empty. ccreate a new project, create a new notebook, choose Spark service
2. briefly explain the concept of cells and link to the docs
3. Import the [**Pixiedust** package](https://ibm-watson-data-lab.github.io/pixiedust/use.html).
   ```Python
   import pixiedust
   ```
   {:codeblock}


## Load data
Next, we are going to load three data sets and make them available within the notebook. We are using a feature of the **Pixiedust** library to easily [load **CSV** files using an URL](https://ibm-watson-data-lab.github.io/pixiedust/loaddata.html). You need two browser tabs, one for the notebook and one to obtain access links to data sets.

1.  Copy the following line into the next empty cell in your notebook.
   ```Python
   df_pop = pixiedust.sampleData('YourAccessURI')
   ```
   {:codeblock}
In another browser tab go to the [Community](https://dataplatform.ibm.com/community?context=analytics) section. Under **Data Sets** search for [**Total population by country** and click on that tile](https://dataplatform.ibm.com/exchange/public/entry/view/889ca053a19986a4445839358a91963e). On the upper right click on the green **link** icon to obtain an access URI. Copy that URI and replace the **YourAccessURI** in the notebook cell with that link. Press **Shift+Enter** or click on the **Run** icon in the toolbar. The load process should start and look similar to this:   
   ![](images/solution23/LoadData.png)

2. Now we repeat the step for another data set. Copy the following line into the next empty cell in your notebook.
   ```Python
   df_life = pixiedust.sampleData('YourAccessURI')
   ```
   {:codeblock}
   In the other browser tab with the **Data Sets** search for [**Life expectancy at birth by country in total years**. Clicking on the result tile will bring you here and click on that tile](https://dataplatform.ibm.com/exchange/public/entry/view/f15be429051727172e0d0c226e2ce895). Obtain the link again and use it to replace **YourAccessURI** in the notebook cell. Thereafter, press **Shift+Enter** to start the load process.

3. As the last of three data sets, we are going to load a list of country names and their ISO codes from a collection of open data sets on Github:   
   ```Python
  df_countries = pixiedust.sampleData('https://raw.githubusercontent.com/datasets/country-list/master/data.csv')
  ```
  {:codeblock}
  Copy the code into the next empty notebook cell and run it.

The list of country codes comes in handy later on. It allows to simplify data selection.

## Transform data

1. Define data frame for data with world population. Thereafter, create a view on top of the loaded data and print out the schema.
   ```Python
   sqlContext.registerDataFrameAsTable(df_pop, "PopTable")
   df_pop = sqlContext.sql("SELECT `Country or Area` as Country, Year, Value as Population FROM PopTable")
   df_pop.createOrReplaceTempView('population')
   df_pop.printSchema()
   ```
   {:codeblock}

2. Copy the following lines into the next empty cell and run them. The data frame **df_all** is created by using an **inner join** on the combined life expectancy and population data and the ISO country codes. Utilizing an inner join, the resulting data contains only countries which are found in the ISO list. Thereby, we cleanse the data from regional and other entries.
   ```Python
   df_all = df_life_pop.withColumn("Year", df_all["Year"].cast("integer")).join(df_countries, ['Country'], 'inner').orderBy(['Country', 'Year'], ascending=True)
   df_all.show(30)
   ```
   {:codeblock}

## Analyze data
put in instruction to transform data and how to visualize



2. visualize life expectancy in year 2010, display as world map
   ```Python
   df_all.createOrReplaceTempView('life2010')
   df_life_2010=spark.sql("SELECT Life, Country FROM life2010 WHERE Year=2010 AND Life is not NULL ")
display(df_life_2010)
   ```
   {:codeblock}

   ![](images/solution23/LifeExpectancyMap2010.png)

3. visualize data, here we show how the life expectancy increased over the recent decades. It increased for all countries, but more significantly in India and China.
   ```Python
   df_all.createOrReplaceTempView('l2')
   dfl2=spark.sql("SELECT Life, Country, Year FROM l2 where CountryCode in ('CN','DE','FR','IN','US')")
   display(dfl2)
   ```
   {:codeblock}

   ![](images/solution23/LifeExpectancy.png)

## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
1. Create and visualize a query showing the life expectancy rate relative to population growth for a country of your choice.
2. Compute and visualize the population growth rates per country on a world map.
3. Load and integrate further data from the catalog of data sets.
4. TODO: Link DSX environment to Github repository. Why???

# Related Content
Here are links to additional information on the topics covered in this tutorial.
