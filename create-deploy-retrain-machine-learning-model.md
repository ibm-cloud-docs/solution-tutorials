---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019
lastupdated: "2019-07-31"
lasttested: "2019-07-17"
---

{:java: #java .ph data-hd-programlang='java'}
{:swift: #swift .ph data-hd-programlang='swift'}
{:ios: #ios data-hd-operatingsystem="ios"}
{:android: #android data-hd-operatingsystem="android"}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Build, deploy, test, retrain and monitor a predictive machine learning model
{: #create-deploy-retrain-machine-learning-model}
This tutorial walks you through the process of building a predictive machine learning model, deploying it as an API to be used in applications, testing the model, monitoring the deployed model and retraining the model with feedback data. All of this happening in an integrated and unified self-service experience on IBM Cloud.

In this tutorial, the **Iris flower data set** is used for creating a machine learning model to classify species of flowers.

In the terminology of machine learning, classification is considered an instance of supervised learning, i.e. learning where a training set of correctly identified observations is available.
{:tip}

{:shortdesc}

<p style="text-align: center;">
  ![](images/solution22-build-machine-learning-model/architecture_diagram.png)
</p>

## Objectives
{: #objectives}

* Import data to a project.
* Build a machine learning model.
* Deploy the model and try out the API.
* Test a machine learning model.
* Monitor the deployed model
* Create a feedback data connection for continuous learning and model evaluation.
* Retrain your model.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience)
* [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/catalog/infrastructure/cloud-object-storage)
* [{{site.data.keyword.pm_full}}](https://{DomainName}/catalog/services/machine-learning)
* [{{site.data.keyword.dashdblong}}](https://{DomainName}/catalog/services/db2-warehouse)
* [{{site.data.keyword.aios_full_notm}} service](https://{DomainName}/catalog/services/watson-openscale)

## Before you begin
{: #prereqs}

* {{site.data.keyword.DSX_full}}, {{site.data.keyword.pm_full}} and {{site.data.keyword.knowledgestudiofull}} are applications that are part of IBM Watson. Go to [Try IBM Watson](https://dataplatform.ibm.com/registration/stepone) to activate and try the Watson applications for free with your IBM Cloud account
* Install [Python 3.x](https://www.python.org/downloads/)

## Import data to a project
{: #import_data_project}

A project is how you organize your resources to achieve a particular goal. Your project resources can include data, collaborators, and analytic tools like Jupyter notebooks and machine learning models.

You can create a project to add data and open a data asset in the data refiner for cleansing and shaping your data.

**Create a project:**

1. Go to the [{{site.data.keyword.Bluemix_short}} catalog](https://{DomainName}/catalog) and select [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience?taxonomyNavigation=app-services) under the **AI** section. **Create** the service.
1. Click on the **Get Started** button to launch the **{{site.data.keyword.DSX_short}}** dashboard.
1. Create a **project** and then on **Standard** tile, Click **Create Project**. Set the name to **iris_project**.
1. Leave the **Restrict who can be a collaborator** checkbox unchecked as there's no confidential data.
1. Under **Define Storage**, Click on **Add** and choose an existing Cloud Object Storage service or create a new one (Select **Lite** plan > Create). Hit **Refresh** to see the created service.
1. Click **Create**. Your new project opens and you can start adding resources to it.

**Import data:**

As mentioned earlier, you will be using the **Iris data set**. The Iris dataset was used in R.A. Fisher's classic 1936 paper, [The Use of Multiple Measurements in Taxonomic Problems](http://rcs.chemometrics.ru/Tutorials/classification/Fisher.pdf), and can also be found on the [UCI Machine Learning Repository](http://archive.ics.uci.edu/ml/). This small dataset is often used for testing out machine learning algorithms and visualizations. The aim is to classify Iris flowers among three species (Setosa, Versicolor or Virginica) from measurements of length and width of sepals and petals. The iris data set contains 3 classes of 50 instances each, where each class refers to a type of iris plant.
![](images/solution22-build-machine-learning-model/iris_machinelearning.png)


**Download** [iris_initial.csv](https://ibm.box.com/shared/static/nnxx7ozfvpdkjv17x4katwu385cm6k5d.csv) which consists of 40 instances of each class. You will use the rest 10 instances of each class to re-train your model.

1. Under **Assets** in your project, click the **Find and Add Data** icon ![Shows the find data icon.](images/solution22-build-machine-learning-model/data_icon.png).
1. Under **Load**, click on **browse** and upload the downloaded `iris_initial.csv`.
1. Once added, you should see `iris_initial.csv` under the **Data assets** section of the project. Click on the name to see the contents of the data set.

## Associate the {{site.data.keyword.pm_short}} service
{:#associate_services}

1. Click **Settings** on the top navigation bar > Associated Services.
1. Click **Add Service** and choose **Watson**.
1. Click **Add** on **{{site.data.keyword.pm_short}}** tile.
1. If you have an existing **{{site.data.keyword.pm_short}}** service instance, select it otherwise continue with the following steps to create a new instance.
   1. Choose the **Lite** plan and click **Create**.
   1. Leave the default values and click **Confirm** to provision a {{site.data.keyword.pm_short}} service.

## Build a machine learning model

{:#build_model}

1. Click **Add to project** and select **Watson Machine Learning model**. In the dialog, set the name to **iris_model**.
2. Under **Machine Learning Service** section, select the {{site.data.keyword.pm_short}} service instance you associated in the above step.
3. Select **Model builder** as your model type and Under **Select runtime** section, Choose the **Default Spark scala** runtime.
4. Select **Manual** to manually create a model. Click **Create**.

   For the automatic method, you rely on automatic data preparation (ADP) completely. For the manual method, in addition to some functions that are handled by the ADP transformer, you can add and configure your own estimators, which are the algorithms used in the analysis.
   {:tip}

5. On the next page, select `iris_initial.csv` as your data set and click **Next**.
6. On the **Select a technique** page, based on the data set added, Label columns and feature columns are pre-populated. Select **species (String)** as your **Label Col** and **petal_length (Decimal)** and **petal_width (Decimal)** as your **Feature columns**.
7. Choose **Multiclass Classification** as your suggested technique.
8. For **Validation Split** configure the following setting:

   **Train:** 50%,
   **Test** 25%,
   **Holdout:** 25%
9. Click on **Add Estimators** and select **Decision Tree Classifier**, then **Add**.

   You can evaluate multiple estimators in one go. For example, you can add **Decision Tree Classifier** and **Random Forest Classifier** as estimators to train your model and choose the best fit based on the evaluation output.
   {:tip}

10. Click **Next** to train the model. Once you see the status as **Trained & Evaluated**, click **Save**.
11. Click on **Overview** to check the details of the model.

## Deploy the model and try out the API

{:#deploy_model}

1. Under the created model, click on **Deployments** > **Add Deployment**.
1. Choose **Web Service**. Add a name say `iris_deployment` and an optional description.
1. Click **Save**. On the overview page, click on the name of the new web service. Once the status is **DEPLOY_SUCCESS** (You may have to refresh the page), you can check the scoring-endpoint, code snippets in various programming languages, and API Specification under **Implementation**.
1. Open a terminal and export the required values for the **cURL** code snippet by replacing the placeholders below
   ```sh
   export IAM_TOKEN='<IAM_TOKEN>'
   export ML_INSTANCE_ID='<ML_SERVICE_INSTANCE_ID>'
   export SCORING_ENDPOINT='<ML_SCORING_ENDPOINT>'
   ```
   {:pre}

   For getting an IAM token using a Watson service API key, refer this [link](https://{DomainName}/docs/services/watson?topic=watson-iam). You can find the ML_INSTANCE_ID under Service credentials of Machine Learning service you created earlier.
   {:tip}

1. Copy and paste the **cURL** code snippet in the terminal window where you have exported the variables. Thereafter, replace `$ARRAY_OF_VALUES_TO_BE_SCORED` with **[5.1,3.5,1.4,0.2]** and `$ANOTHER_ARRAY_OF_VALUES_TO_BE_SCORED` with **[3.2,1.2,5.2,1.7]**.
1. Run the **cURL** to see the prediction results.

## Test your model

{:#test_model}

1. Under **Test**, click on **Provide input data as JSON** icon next to **Enter input data** and provide the JSON below as input.
   ```json
     {
     	"fields": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
     	"values": [
     		[5.1, 3.5, 1.4, 0.2]
     	]
     }
     ```
1. Click **Predict** and you should see the **Predicted value for species** in a chart.
1. For JSON input and output, click on the icons next to the active input and output.
1. You can change the input data and continue testing your model.

## Create a feedback data connection

{:#create_feedback_connection}

1. For continuous learning and model evaluation, you need to store new data somewhere. Create a [{{site.data.keyword.dashdbshort}}](https://{DomainName}/catalog/services/db2-warehouse) service > **Entry** plan which acts as our feedback data connection.

  Make sure to select the **Entry** plan when creating the above instance.
  {:tip}

2. On the {{site.data.keyword.dashdbshort}} **Manage** page, click **Open Console**. Click **Load** under Load activity section.
3. Click on **browse files** under **My computer** and upload `iris_initial.csv`. Click **Next**.
4. Select **DASHXXXX**, e.g., DASH1234 as your **Schema** and then click on **New Table** > Name it `IRIS_FEEDBACK` > click **Create** and click **Next**.
5. Datatypes are automatically detected. Click **Next** and then **Begin Load**.
6. A new target **DASHXXXX.IRIS_FEEDBACK** is created.

   You will be using this in the next step where you will be re-training the model for better performance and precision.

## Monitor your deployed model with {{site.data.keyword.aios_full_notm}}
{:#monitor_openscale}

In this section, you will create a {{site.data.keyword.aios_full_notm}} service to monitor the health, performance, accuracy and quality metrics of your machine learning model along with throughput and Analytics.
1. Create a [{{site.data.keyword.aios_full_notm}} service](https://{DomainName}/catalog/services/watson-openscale) under AI section of {{site.data.keyword.Bluemix_notm}} Catalog and click **Launch Application**.
1. Click on **No thanks** to manually setup the monitors.
1. If prompted, click on `Show beta features` to enable the latest capabilities.
1. Click **Use the free lite plan database** to store model deployment output and retraining data > click **Save**.
1. Click **Select Provider** > Click **Add machine learning provider** > Select **Watson Machine Learning** as your service provider
      - In the dropdown, select the {{site.data.keyword.pm_full}} service you created above.
      - Provide a service provider instance name (say `iris-wml-provider`)
      - Click **Save**
1. Click **Go to Dashboard** to add a deployment > Click **Add deployments** and select `iris_deployment`> Click **Configure**.
1. Click **Configure monitors** to setup your monitors.
1. Under **Payload logging**,
      - Select **Numerical/categorical** as Data type
      - Select **Multi-class classification** as the Algorithm type > Click **Save** and then **OK**
      - Send a payload scoring request using the `POST /online` API call or using the TEST section. Once done, click **I'm finished**
1. Under **Model details**,
      - Click **Begin** and select **Manually configure monitors** > Click **Next**.
      - Select **Db2** as the location for your training data > Provide the credentials of your Db2 service under [{{site.data.keyword.Bluemix_short}} Resource List](https://{DomainName}/resources) > Click **Test**. Once the connection is successful, Click **Next**
      - Select the schema - DASHXXXX and the Table - IRIS_FEEDBACK > Click **Next**
      - Click on **Species** tile as your column that contains the answers to be predicted by the model > Click **Next**
      - Select petal_length, petal_width as your features used to train the model.> Click **Next**
      - Select petal_length, petal_width as the text and categorical features.> Click **Next**
      - Select nodeADP_class as the deployment prediction column.
      - Click **Save**.
1. Under **Accuracy**,
      - Click **Begin** and let the accuracy alert threshold be **80%**.
      - Set the minimum threshold to 10 and maximum threshold to 40 > Click **Next** and then **Save**.
      - Download the file [iris_retrain.csv](https://ibm.box.com/shared/static/96kvmwhb54700pjcwrd9hd3j6exiqms8.csv). Thereafter, Under **Feedback** tab, click **Add Feedback Data** and select `iris_retrain.csv` > select **Comma(,)** as the delimiter > click **Select**.

## Generate load and check metrics
{:#generate_load_metrics}

You can either generate load by sending multiple requests with random petal_width, petal_length, sepal_width and sepal_length values in the JSON to the scoring API endpoint or by executing the Python script below

1. Create a file with the name `scoring.py`, paste the code below and save the file.
   ```
    import os, urllib3, requests, json, random

    iam_token=os.environ.get('IAM_TOKEN')
    ml_instance_id=os.environ.get('ML_INSTANCE_ID')
    scoring_endpoint=os.environ.get('SCORING_ENDPOINT')
    array_of_values_to_be_scored=[round(random.uniform(0.0,10.0),1), round(random.uniform(0.0,10.0),1), round(random.uniform(0.0,10.0),1), round(random.uniform(0.0,10.0),1)]
    # NOTE: generate iam_token and retrieve ml_instance_id from the ML service credentials
    header = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + iam_token, 'ML-Instance-ID': ml_instance_id}
    payload_scoring = {"fields": ["sepal_length", "sepal_width", "petal_length", "petal_width"], "values": [array_of_values_to_be_scored]}
    response_scoring = requests.post(scoring_endpoint, json=payload_scoring, headers=header)
    print("Scoring response")
    print(json.loads(response_scoring.text))
   ```
   {:codeblock}

1. On a terminal, point to the directory where the Python script is saved and run the below bash command
   ```sh
   for i in {1..100}; do python3 scoring.py; done
   ```
   {:pre}
1. Once the command exits, Navigate to the {{site.data.keyword.aios_full_notm}} dashboard and click on the **Insights** on the left pane.
1. Once on the insights page, click on the WML deployment tile to see the Quality, Performance and Analytics monitors and metrics.
1. Click on **Throughput** under Performance to see the average number of requests per minute.
1. Click on **Accuracy** under Quality to check the quality of your model. Accuracy is proportion of correct predictions.On the generated chart, click on any point to see the confusion matrix.
1. Click on **Predictions by Confidence** under Analytics to check the Prediction Confidence of your model.
1. Explore the chart builder under to visualize various metrics plotted on X-axis and Y-axis of the generated chart.

## Re-train your model

{:#retrain_model}

1. Return to your [{{site.data.keyword.Bluemix_short}} Resource List](https://{DomainName}/resources) and under the {{site.data.keyword.DSX_short}} service you have been using, click on [Projects](https://dataplatform.cloud.ibm.com/projects) > iris_project >  **iris-model** (under assets) > Evaluation.
2. Under **Performance Monitoring**, Click on **Configure Performance Monitoring**.
3. On the configure Performance Monitoring page,
   * Select Default Spark Scala environment. Prediction type should be populated automatically.
   * Choose **weightedPrecision** as your metric and set `0.98` as the optional threshold.
   * Click on **Create new connection** to point to the IBM Db2 Warehouse on cloud which you created in the above section.This will open on a new tab. Once done, return to the main tab.
   * Select the Db2 warehouse connection and once the connection details are populated, click **Create**.
   * Click on **Select feedback data reference**, Select the schema - DASHXXXX and point to the IRIS_FEEDBACK table and click **Select**.
   * In the **Record count required for re-evaluation** box, type the minimum number of new records to trigger retraining. Use **10** or leave blank to use the default value of 1000.
   * In the **Auto retrain** box, select one of the following options:
     - To start automatic retraining whenever model performance is below the threshold that you set, select **when model performance is below threshold**. For this tutorial, you will choose this option as our precision is below the threshold (.98).
     - To prohibit automatic retraining, select **never**.
     - To start automatic retraining regardless of performance, select **always**.
   * In the **Auto deploy** box, select one of the following options:
     - To start automatic deployment whenever model performance is better than the previous version, select **when model performance is better than previous version**. For this tutorial, you will choose this option as our aim is to continuosly improve the performance of the model.
     - To prohibit automatic deployment, select **never**.
     - To start automatic deployment regardless of performance, select **always**.
   * Click **Save**.
4. Click **Add feedback data**, select the downloaded `iris_retrain.csv` file, and click **Open**.
5. Click **New evaluation** to begin.
6. Once the evaluation completes. You can check the **Last Evaluation Result** section for the improved **WeightedPrecision** value.

## Remove resources
{:removeresources}

1. Navigate to [{{site.data.keyword.Bluemix_short}} Resource List](https://{DomainName}/resources/) > choose the Location, Org and Space where you have created the services.
2. Delete the respective {{site.data.keyword.DSX_short}}, {{site.data.keyword.sparks}}, {{site.data.keyword.pm_short}}, {{site.data.keyword.dashdbshort}} and {{site.data.keyword.cos_short}} services which you created for this tutorial.

## Related content
{:related}

- [Watson Studio Overview](https://dataplatform.ibm.com/docs/content/getting-started/overview-ws.html?audience=wdp&context=wdp)
- [Detect Anomalies using Machine Learning](https://{DomainName}/docs/tutorials?topic=solution-tutorials-gather-visualize-analyze-iot-data#data_experiencee)
<!-- - [Watson Data Platform Tutorials](https://www.ibm.com/analytics/us/en/watson-data-platform/tutorial/) -->
- [Automatic model creation](https://datascience.ibm.com/docs/content/analyze-data/ml-model-builder.html?linkInPage=true)
- [Machine learning & AI](https://dataplatform.ibm.com/docs/content/analyze-data/wml-ai.html?audience=wdp&context=wdp)
<!-- - [Watson machine learning client library](https://dataplatform.ibm.com/docs/content/analyze-data/pm_service_client_library.html#client-libraries) -->
