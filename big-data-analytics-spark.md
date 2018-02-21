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

## Import notebook into DSX


## Work with the Notebook

```Python
import pixiedust
```
{:codeblock}


another codeblock
```Python
df_all.createOrReplaceTempView('life2000')
df2=spark.sql("SELECT Life, Country FROM life2000 WHERE Country is not NULL AND Year=2000 AND Life is not NULL ")
```
{:codeblock}


## Expand the tutorial
Want to add to or change this tutorial? Here are some ideas:
1. as
2. as

# Related Content
Here are links to additional information on the topics covered in this tutorial.
