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

# Big Data Analytics with Apache Spark

In this tutorial, we are going to analyze and visualize data sets using IBM Data Science Experience, Jupyter Notebooks and the Apache Spark service on IBM Cloud.

![](images/solution23/Architecture.png)

## Objectives

* Deploy Apache Spark and Data Science Experience on IBM Cloud.
* Work with a Jupyter Notebook and a Python kernel.
* Import, transform, analyze and visualize data sets.

## Products

This tutorial uses the following products:
   *
   *
   *

## Service and Environment Setup

## Create a blank Jupyter Notebook

1. create a new notebook
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

## Transform data

1. Define data frame for data with world population. Thereafter, create a view on top of the loaded data and print out the schema.
   ```Python
   sqlContext.registerDataFrameAsTable(df_pop, "PopTable")
   df_pop = sqlContext.sql("SELECT `Country or Area` as Country, Year, Value as Population FROM PopTable")
   df_pop.createOrReplaceTempView('population')
   df_pop.printSchema()
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
1. as
2. as

# Related Content
Here are links to additional information on the topics covered in this tutorial.
