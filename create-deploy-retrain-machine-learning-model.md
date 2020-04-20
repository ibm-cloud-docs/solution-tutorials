---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019, 2020
lastupdated: "2020-04-20"
lasttested: "2020-04-20"
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

# Build, deploy and test a predictive machine learning model
{: #create-deploy-retrain-machine-learning-model}
This tutorial walks you through the process of building a predictive machine learning model, deploying the generated model as an API to be used in applications and testing the model.All of this happening in an integrated and unified self-service experience on {{site.data.keyword.Bluemix_notm}}.
{:shortdesc}

In this tutorial, the **Iris flower data set** is used for creating a machine learning model to classify species of flowers.

In the terminology of machine learning, classification is considered an instance of supervised learning, i.e. learning where a training set of correctly identified observations is available.
{:tip}

{{site.data.keyword.DSX}} provides you with the environment and tools to solve your business problems by collaboratively working with data. You can choose the tools you need to analyze and visualize data, to cleanse and shape data, to ingest streaming data, or to create and train machine learning models.

## Objectives
{: #objectives}

* Import data to a project.
* Build a machine learning model.
* Deploy the model and try out the API.
* Test a machine learning model.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience)
* [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/catalog/infrastructure/cloud-object-storage)
* [{{site.data.keyword.pm_full}}](https://{DomainName}/catalog/services/machine-learning)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}
![](images/solution22-build-machine-learning-model/architecture_diagram.png)

1. The admin uploads a CSV file from a local machine.
2. The uploaded CSV file is stored in {{site.data.keyword.cos_full_notm}} service as a dataset.
3. The dataset is then used to build and deploy a machine learning model. The deployed model is exposed as an API (scoring-endpoint).
4. The user makes an API call to predict the outcome with the test data.

## Before you begin
{: #prereqs}

* Obtain an [IBM Cloud API key](https://{DomainName}/iam/apikeys) and save the key for future reference.

## Import data to a project
{: #import_data_project}

A project is how you organize your resources to achieve a particular goal. Your project resources can include data, collaborators, and analytic tools like Jupyter notebooks and machine learning models.

You can create a project to add data and open a data asset in the data refiner for cleansing and shaping your data.

### Create a project
{: #create_project}

1. Go to the [{{site.data.keyword.Bluemix_short}} catalog](https://{DomainName}/catalog) and select [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience?taxonomyNavigation=app-services) under the **AI** section.
  1. Select a **region**.
  2. Select a **Lite** pricing plan.
  3. Provide a **Service name**.
  4. Select a **resource group** and click **Create**.
2. Click on the **Get Started** button to launch the **{{site.data.keyword.DSX_short}}** dashboard.
3. Create a **project** by clicking **Create an empty project**.
4. Provide **iris_project** as the project name and Leave the **Restrict who can be a collaborator** checkbox unchecked as there's no confidential data.
5. Under **Define Storage**, Click on **Add** and choose an **existing** Cloud Object Storage service or create a **new** service. If you choose to create a **New** service
   1. Select a **Lite** plan
   2. Click on **Create**
   3. Select a Resource group and change the service name if you wish to
   4. Click on **Confirm**
6. Hit **Refresh** to see the created service.
7. Click **Create**. Your new project opens and you can start adding resources to it.

### Import data
{: #import_data}

As mentioned earlier, you will be using the **Iris data set**. The Iris dataset was used in R.A. Fisher's classic 1936 paper, [The Use of Multiple Measurements in Taxonomic Problems](http://rcs.chemometrics.ru/Tutorials/classification/Fisher.pdf), and can also be found on the [UCI Machine Learning Repository](http://archive.ics.uci.edu/ml/). This small dataset is often used for testing out machine learning algorithms and visualizations. The aim is to classify Iris flowers among three species (Setosa, Versicolor or Virginica) from measurements of length and width of sepals and petals. The iris data set contains 3 classes of 50 instances each, where each class refers to a type of iris plant.
![](images/solution22-build-machine-learning-model/iris_machinelearning.png)

**Download** [iris_initial.csv](https://ibm.box.com/shared/static/nnxx7ozfvpdkjv17x4katwu385cm6k5d.csv) which consists of 40 instances of each class.

1. Under **Assets** in your project, click the **Find and Add Data** icon ![Shows the find data icon.](images/solution22-build-machine-learning-model/data_icon.png).
2. Under **Load**, click on **browse** and upload the downloaded `iris_initial.csv`.
3. Once added, you should see `iris_initial.csv` under the **Data assets** section of the project. Click on the name to see the contents of the data set.

## Associate the {{site.data.keyword.pm_short}} service
{:#associate_services}

1. In the top navigation menu, click on `iris-project`, click on **Settings** in the top bar and scroll to **Associated Services** section.
2. Click **Add Service** and choose **Watson**.
3. Click **Add** on **{{site.data.keyword.pm_short}}** tile.
4. If you have an existing **{{site.data.keyword.pm_short}}** service instance, select it otherwise continue with the following steps to create a new instance.
   1. Choose the **Lite** plan and click **Create**.
   2. Leave the default values for Region,Plan and Resource group.
   3. Enter `pm-20-lab` as the **Service name** and click **Confirm** to provision a {{site.data.keyword.pm_short}} service.

## Build a machine learning model
{:#build_model}

1. Click on **Add to project +** in the main menu and select **AutoAI experiment**. In the dialog,
  1. Select **From blank**.
  2. Set the Asset name to **iris_model**.
  3. Under **Associated service**, select the **Machine learning service instance**.
  4. Click **Create**.
2. Once the model is created,
  1. Add training data by clicking **Select from project**.
  2. Choose the **iris_initial.csv** file.
  3. Click **Select asset**.
3. Select **Species** as your Select column to predict.
4. Click **Experiment settings** > Set **Holdout data split** under **Data source** to **15%** by moving the slider.
5. On the left menu, Click on **Prediction**
   1. Check whether **Multiclass classification** is selected as the prediction type and **Accuracy** as the Optimized metric.
   2. Click on **Save and close**.
6. Click on **Run experiment**. The **AutoAI experiment** may take up to 5 minutes to select the right Algorithm for your model. Click on **Swap view** to see the Relationship map.

   Each model pipeline is scored for a variety of metrics and then ranked. The default ranking metric for binary classification models is the area under the ROC curve, for multi-class classification models is accuracy, and for for regression models is the root mean-squared error (RMSE). The highest-ranked pipelines are displayed in a leaderboard, so you can view more information about them. The leaderboard also provides the option to save select model pipelines after reviewing them.
   {:tip}

7. Once the experiment completes running, under the **Pipeline** leaderboard,
   1. Click on **Pipeline comparison** to view how the top pipelines compare.
   2. Sort the leaderboard by a different metric by selecting the **Rank by** dropdown
   3. Click a pipeline to view more detail about the metrics and performance.
8. Next to the model with *Rank 1*, click on **Save as** > **Model**.
9.  Check the details of the model and click **Save**.
10. In the received notification, click **View in project** then under **Overview** tab check the details of the model.

## Deploy the model and try out the API
{:#deploy_model}

In this section, you will deploy the saved model and expose the deployed model as an API to be accessed from your applications.

1. Under the created model, click on **Deployments** and then click **Add Deployment**.
1. Add a **name** -`iris_deployment`, choose **Web Service** as your deployment type and add an optional description.
2. Click **Save**. Once the status changes to **Ready** (You may have to refresh the page), click on the **name** of the new web service. Under **Implementation** tab of the deployment, You can see the scoring End-point, code snippets in various programming languages, and API Specification. **Copy and save** the scoring End-point in a notepad for future reference.
3. In a browser, launch the [{{site.data.keyword.Bluemix_notm}} Shell](https://{DomainName}/shell) and export the scoring End-point to be used in subsequent requests.
   ```sh
   export SCORING_ENDPOINT='<SCORING_ENDPOINT_FROM_ABOVE_STEP>'
   ```
   {:pre}

   {{site.data.keyword.Bluemix_notm}} Shell is a cloud-based shell workspace that you can access through your browser. It's preconfigured with the full {{site.data.keyword.Bluemix_notm}} CLI and tons of plug-ins and tools that you can use to manage apps, resources, and infrastructure.
   {:tip}
4. To use the Watson Machine Learning REST API, you need to obtain an [{{site.data.keyword.Bluemix_notm}} Identity and Access Management (IAM) token. Run the below command by replacing the `<IBM_CLOUD_API_KEY>` placeholder with your [{{site.data.keyword.Bluemix_notm}} API key to see the `access token` in the response
   ```sh
   curl -k -X POST \
   --header "Content-Type: application/x-www-form-urlencoded" \
   --header "Accept: application/json" \
   --data-urlencode "grant_type=urn:ibm:params:oauth:grant-type:apikey" \
   --data-urlencode "apikey=<IBM_CLOUD_API_KEY>" \
   "https://iam.cloud.ibm.com/identity/token" | jq --raw-output '.access_token'
   ```
   {:pre}
5. Copy the `access token` from the above response and export it as an `IAM_TOKEN` to be used in the subsequent API requests
   ```sh
   export IAM_TOKEN='<IAM_TOKEN>'
   ```
   {:pre}

6. For`ML_INSTANCE_ID`, run the below command in the Cloud Shell with the name of the machine learning service
   ```sh
   ibmcloud resource service-instance pm-20-lab | grep GUID
   ```
   {:pre}
7. Export the returned `GUID` as `ML_INSTANCE_ID` for use in subsequent API requests
   ```sh
   export ML_INSTANCE_ID='<ML_SERVICE_INSTANCE_GUID>'
   ```
   {:pre}

8. Run the below **cURL** code in the cloud shell to see the prediction results.
   ```sh
   curl -X POST \
   --header 'Content-Type: application/json' \
   --header 'Accept: application/json' \
   --header "Authorization: Bearer  $IAM_TOKEN" \
   --header "ML-Instance-ID: $ML_INSTANCE_ID" \
   -d '{"input_data": [{"fields": ["sepal_length", "sepal_width", "petal_length", "petal_width"],"values": [[5.1,3.5,1.4,0.2], [3.2,1.2,5.2,1.7]]}]}' \
   $SCORING_ENDPOINT
   ```
   {:pre}

   If you observe, the code is from the **Implementation** tab of the deployment your created above. Thereafter, replacing the `$ARRAY_OF_VALUES_TO_BE_SCORED` placeholder with **[5.1,3.5,1.4,0.2]** and `$ANOTHER_ARRAY_OF_VALUES_TO_BE_SCORED` placeholder with **[3.2,1.2,5.2,1.7]**.
   {:tip}

## Test your model
{:#test_model}

Along with CLI, you can also do predictions using an UI.

1. Under **Test**, click on **Provide input data as JSON** icon next to **Enter input data** and provide the JSON below as input.
   ```json
      {
      "input_data": [{
        "fields": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
        "values": [
          ["5.1", "3.5", "1.4", "0.2"]
        ]
      }]
    }
   ```
2. Click **Predict** and you should see the **Predictions** JSON output.
3. You can change the input data and continue testing your model.

## Remove resources
{:removeresources}

1. Navigate to [{{site.data.keyword.Bluemix_short}} Resource List](https://{DomainName}/resources/) > choose the Location, Org and Space where you have created the services.
2. Delete the respective {{site.data.keyword.DSX_short}}, {{site.data.keyword.sparks}}, {{site.data.keyword.pm_short}}, {{site.data.keyword.dashdbshort}} and {{site.data.keyword.cos_short}} services which you created for this tutorial.

## Related content
{:related}

- [Watson Studio Overview](https://dataplatform.ibm.com/docs/content/getting-started/overview-ws.html?audience=wdp&context=wdp)
- [Detect Anomalies using Machine Learning](https://{DomainName}/docs/tutorials?topic=solution-tutorials-gather-visualize-analyze-iot-data#data_experiencee)
- [Automatic model creation](https://datascience.ibm.com/docs/content/analyze-data/ml-model-builder.html?linkInPage=true)
- [Machine learning & AI](https://dataplatform.ibm.com/docs/content/analyze-data/wml-ai.html?audience=wdp&context=wdp)
