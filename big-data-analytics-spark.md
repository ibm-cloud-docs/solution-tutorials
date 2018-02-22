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


## Prepare data

1. Import the **Pixiedust** package.
   ```Python
   import pixiedust
   ```
   {:codeblock}

2.  Copy the following line into the cell in your notebook.
   ```Python
   df_pop = pixiedust.sampleData('YourAccessURI')
   ```
   {:codeblock}
In another browser tab go to the [Community](https://dataplatform.ibm.com/community?context=analytics) section. Under **Data Sets** search for [**Total population by country** and click on that tile](https://dataplatform.ibm.com/exchange/public/entry/view/889ca053a19986a4445839358a91963e). On the upper right click on the green **link** icon to obtain an access URI. Copy that URI and replace the **YourAccessURI** in the notebook cell with that link. Press **Shift+Enter** or click on the **Run** icon in the toolbar. The load process should start and look similar to this:   
   ![](images/solution23/LoadData.png)

3. Define data frame for data with world population. Thereafter, create a view on top of the loaded data and print out the schema.
   ```Python
   sqlContext.registerDataFrameAsTable(df_pop, "PopTable")
   df_pop = sqlContext.sql("SELECT `Country or Area` as Country, Year, Value as Population FROM PopTable")
   df_pop.createOrReplaceTempView('population')
   df_pop.printSchema()
   ```
   {:codeblock}

3. Load life expectancy data
4. Load country data
   ```Python
   df_countries = pixiedust.sampleData('https://raw.githubusercontent.com/datasets/country-list/master/data.csv')
   ```
   {:codeblock}



10. another codeblock
   ```Python
   df_all.createOrReplaceTempView('life2000')
   df2=spark.sql("SELECT Life, Country FROM life2000 WHERE Country is not NULL AND Year=2000 AND Life is not NULL ")
   ```
   {:codeblock}

## Analyze data
put in instruction to transform data and how to visualize


## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
1. as
2. as

# Related Content
Here are links to additional information on the topics covered in this tutorial.
