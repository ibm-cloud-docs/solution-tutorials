---
copyright:
  years: 2018
lastupdated: "2018-02-23"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Analyze and visualize open data with Apache Spark

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

## Create and prepare a notebook
We utilize a Jupyter Notebook as user interface. In there, we can execute code and see the results, including visualizations. Notebooks and other resources are organized in projects.
1. In the project overview, click on the **Assets** tab. There, click on **New notebook** to open a dialog for configuring a notebook.
2. In the dialog, use **Blank** notebook. Enter **MyNotebook** as **Name**. You can leave the description empty. Keep the **Language** selected as **Python**. Also, leave the **Spark version** as suggested. At the bottom, you can pick the preferred Spark service if more than one has been provisioned. Complete the process by clicking **Create Notebook**.
3. You are taken to a new notebook. If you have never worked with Jupyter Notebooks, then click on the **Docs** icon on the upper right menu. Navigate to the **Analyze data**, then [**Notebooks** section](https://dataplatform.ibm.com/docs/content/analyze-data/notebooks-parent.html?context=analytics) to learn more about [notebooks and their parts](https://dataplatform.ibm.com/docs/content/analyze-data/parts-of-a-notebook.html?context=analytics&linkInPage=true). In short, the field where you can enter text and commands is called a **Cell**. You can execute the content of a cell by either clicking on the **Run** icon in the toolbar or by pressing **Shift+Enter** on the keyboard. Let's try it.
4. Copy the following code into the empty cell. It is used to import the [**Pixiedust** package](https://ibm-watson-data-lab.github.io/pixiedust/use.html).
   ```Python
   import pixiedust
   ```
   {:codeblock}
   Now run the cell, i.e., execute the **import pixiedust** command. Something like the following should be the result.   
   ![](images/solution23/FirstCell_ImportPixiedust.png)

## Load data
Next, we are going to load three open data sets and make them available within the notebook. We are using a feature of the **Pixiedust** library to easily [load **CSV** files using an URL](https://ibm-watson-data-lab.github.io/pixiedust/loaddata.html).

1.  Copy the following line into the next empty cell in your notebook, but don't run it yet.   
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

The list of country codes comes in handy later on. It allows to simplify data selection by using a country code instead of the written, exact country name.

## Transform data
After the data is made available, we are going to transform it slightly, then combine the three sets into a single data frame.
1. First, we redefine the data frame for the population data. This is done with a SQL statement which renames the columns. Thereafter, we create a view and print out the schema. Copy the following code block into the next empty cell, then run it.
   ```Python
   sqlContext.registerDataFrameAsTable(df_pop, "PopTable")
   df_pop = sqlContext.sql("SELECT `Country or Area` as Country, Year, Value as Population FROM PopTable")
   df_pop.createOrReplaceTempView('population')
   df_pop.printSchema()
   ```
   {:codeblock}
2. Repeat the same for the Life Expectancy data. The only difference is that we don't print the schema, but show the first 10 rows of data.   
   ```Python
   sqlContext.registerDataFrameAsTable(df_life, "lifeTable")
   df_life = sqlContext.sql("SELECT `Country or Area` as Country, Year, Value as Life FROM lifeTable")
   df_life = df_life.withColumn("Life", df_life["Life"].cast("double"))
   df_life.createOrReplaceTempView('life')
   df_life.show(10)


3. Last, repeat the transformation of the schema for the country data.
   ```Python
   sqlContext.registerDataFrameAsTable(df_countries, "CountryTable")
   df_countries = sqlContext.sql("SELECT `Name` as Country, Code as CountryCode FROM CountryTable")
   df_countries.createOrReplaceTempView('countries')
   ```
   {:codeblock}

4. Now that we have simpler and the same column names across the data sets, we want to combine them into one data frame. First, we perform an **outer** join on the life expectancy and population data. Thereafter, in the same statement, we utilize an **inner** join to bring the just combined data together with the country codes. Everything is ordered by country and year. The output defines the data frame **df_all**.
 By utilizing an inner join the resulting data contains only countries which are found in the ISO list. Thereby, we cleanse the data from regional and other entries.
   ```Python
   df_all = df_life.join(df_pop, ['Country', 'Year'], 'outer').join(df_countries, ['Country'], 'inner').orderBy(['Country', 'Year'], ascending=True)
   df_all.show(10)
   ```
   {:codeblock}

5. Next, we change the data type for **Year** and make it an integer.
df_all.printSchema()

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
