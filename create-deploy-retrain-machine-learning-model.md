---
subcollection: solution-tutorials
copyright:
  years: 2018, 2019, 2020
lastupdated: "2020-04-21"
lasttested: "2020-04-21"
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
This tutorial walks you through the process of building a predictive machine learning model, deploying the generated model as an API to be used in applications and testing the model. Also, monitor the deployed model and retrain the model with feedback data, all of this happening in an integrated and unified self-service experience on {{site.data.keyword.Bluemix_notm}}.
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
* Monitor the deployed model
* Retrain your model.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience)
* [{{site.data.keyword.cos_full_notm}}](https://{DomainName}/catalog/infrastructure/cloud-object-storage)
* [{{site.data.keyword.pm_full}}](https://{DomainName}/catalog/services/machine-learning)
* [{{site.data.keyword.aios_full}} service](https://{DomainName}/catalog/services/watson-openscale)

## Architecture
{: #architecture}
![](images/solution22-build-machine-learning-model/architecture_diagram.png)

1. The admin uploads a CSV file from a local machine.
2. The uploaded CSV file is stored in {{site.data.keyword.cos_full_notm}} service as a dataset.
3. The dataset is then used to build and deploy a machine learning model. The deployed model is exposed as an API (scoring-endpoint).
4. The user makes an API call to predict the outcome with the test data.
5. The deployed machine learning model is monitored for quality, accuracy and other key parameters.

## Import data to a project
{: #import_data_project}

A project is how you organize your resources to achieve a particular goal. Your project resources can include data, collaborators, and analytic tools like Jupyter notebooks and machine learning models.

You can create a project to add data and open a data asset in the data refiner for cleansing and shaping your data.

### Create a project
{: #create_project}

1. Go to the [{{site.data.keyword.Bluemix_short}} catalog](https://{DomainName}/catalog) and select [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience?taxonomyNavigation=app-services) under the **AI** section.
  1. Select a **region**
  2. Select a **Lite** pricing plan
  3. Provide a **Service name**
  4. Select a **resource group** and click **Create**
2. Click on the **Get Started** button to launch the **{{site.data.keyword.DSX_short}}** dashboard.
3. Create a **project** by clicking **Create an empty project**.
4. Provide **iris_project** as the project name and Leave the **Restrict who can be a collaborator** checkbox unchecked as there's no confidential data.
5. Under **Define Storage**, Click on **Add** and choose an **existing** Cloud Object Storage service or create a **new** service. If you choose to create a **New** service
   1. Select a **Lite** plan
   2. Click on **Create**
   3. Select a Resource group and change the service name to **cloud-object-storage-tutorial**
   4. Click on **Confirm**
   6. Hit **Refresh** to see the created service.
7. Click **Create**. Your new project opens and you can start adding resources to it.

### Import data
{: #import_data}

As mentioned earlier, you will be using the **Iris data set**. The Iris dataset was used in R.A. Fisher's classic 1936 paper, [The Use of Multiple Measurements in Taxonomic Problems](http://rcs.chemometrics.ru/Tutorials/classification/Fisher.pdf), and can also be found on the [UCI Machine Learning Repository](http://archive.ics.uci.edu/ml/). This small dataset is often used for testing out machine learning algorithms and visualizations. The aim is to classify Iris flowers among three species (Setosa, Versicolor or Virginica) from measurements of length and width of sepals and petals. The iris data set contains 3 classes of 50 instances each, where each class refers to a type of iris plant.
![](images/solution22-build-machine-learning-model/iris_machinelearning.png)

**Download** [iris_initial.csv](https://ibm.box.com/shared/static/nnxx7ozfvpdkjv17x4katwu385cm6k5d.csv) which consists of 40 instances of each species.

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
   3. Enter `pm-20-tutorial` as the **Service name** and click **Confirm** to provision a {{site.data.keyword.pm_short}} service.

## Build a machine learning model
{:#build_model}

1. Click on **Add to project +** in the main menu and select **AutoAI experiment**. In the dialog,
   1. Select **From blank**.
   2. Set the Asset name to **iris_model**.
   3. Under **Associated service**, select the **Machine learning service instance**.
4. Click **Create**.

Once the model is created,
1. Add training data by clicking **Select from project**.
   2. Choose the **iris_initial.csv** file.
   3. Click **Select asset**.
3. Select **Species** as your Select column to predict.
4. Click **Experiment settings** > Set **Holdout data split** under **Data source** to **15%** by moving the slider.
5. On the left menu, Click on **Prediction**:
   6. Set **Prediction type** to **Multiclass classification**.
   7. Set **Optimized metric** as **Accuracy**.
2. Click on **Save settings**.
6. Click on **Run experiment**.
1. The **AutoAI experiment** may take up to 5 minutes to select the right Algorithm for your model. Click on **Swap view** to see the Relationship map.

   Each model pipeline is scored for a variety of metrics and then ranked. The default ranking metric for binary classification models is the area under the ROC curve, for multi-class classification models is accuracy, and for for regression models is the root mean-squared error (RMSE). The highest-ranked pipelines are displayed in a leaderboard, so you can view more information about them. The leaderboard also provides the option to save select model pipelines after reviewing them.
   {:tip}

Once the experiment completes running, under the **Pipeline** leaderboard,
1. Click on **Pipeline comparison** to view how the top pipelines compare.
2. Sort the leaderboard by a different metric by selecting the **Rank by** dropdown
3. Click a pipeline to view more detail about the metrics and performance.

   You may not say any noted changes in the leadership board as the dataset used in this tutorial is very simple and used only for your understanding of the concepts. With other datasets, the rank will vary
   {:tip}

8. Next to the model with *Rank 1*, click on **Save as** > **Model**.
9.  Check the details of the model and click **Save**.
10. In the received notification, click **View in project** then under **Overview** tab check the details of the model.

## Deploy the model and try out the API
{:#deploy_model}

In this section, you will deploy the saved model and expose the deployed model as an API to be accessed from your applications.

1. Under the created model, click on **Deployments** and then click **Add Deployment**.
   1. Set the **Name** to **iris_deployment**.
   2. Select **Web Service** as your deployment type.
2. Click **Save**.

Once the status changes to **Ready** (You may have to refresh the page):
1. click on the **Name** of the new web service.
2. Under **Implementation** tab of the deployment, you can see the *Scoring End-point*, code snippets in various programming languages, and API Specification.
3. **Copy** the *Scoring End-point* in a notepad for future reference.
3. In a browser, launch the [{{site.data.keyword.Bluemix_notm}} Shell](https://{DomainName}/shell) and export the scoring End-point to be used in subsequent requests. Make sure to keep this window open.
   ```sh
   export SCORING_ENDPOINT='<SCORING_ENDPOINT_FROM_ABOVE_STEP>'
   ```
   {:pre}

   {{site.data.keyword.Bluemix_notm}} Shell is a cloud-based shell workspace that you can access through your browser. It's preconfigured with the full {{site.data.keyword.Bluemix_notm}} CLI and tons of plug-ins and tools that you can use to manage apps, resources, and infrastructure.
   {:tip}
4. To use the Watson Machine Learning REST API, you need to obtain an [{{site.data.keyword.Bluemix_notm}} Identity and Access Management (IAM) token. Run the below command
   ```sh
   ibmcloud iam oauth-tokens --output JSON | jq -r .iam_token
   ```
   {:pre}
5. Copy the IAM token from the above response and export it as an `IAM_TOKEN` to be used in the subsequent API requests
   ```sh
   export IAM_TOKEN='<IAM_TOKEN>'
   ```
   {:pre}

6. For `ML_INSTANCE_ID`, run the below command in the Cloud Shell by passing the name of the machine learning service key
   ```sh
   ibmcloud resource service-key wdp-writer
   ```
   {:pre}
7. Export the returned `instance_id` as `ML_INSTANCE_ID` for use in subsequent API requests
   ```sh
   export ML_INSTANCE_ID='<ML_SERVICE_INSTANCE_GUID>'
   ```
   {:pre}

8. Run the below **cURL** code in the cloud shell to see the prediction results.
   ```sh
   curl -X POST \
   --header 'Content-Type: application/json' \
   --header 'Accept: application/json' \
   --header "Authorization: $IAM_TOKEN" \
   --header "ML-Instance-ID: $ML_INSTANCE_ID" \
   -d '{"input_data": [{"fields": ["sepal_length", "sepal_width", "petal_length", "petal_width"],"values": [[5.1,3.5,1.4,0.2], [3.2,1.2,5.2,1.7]]}]}' \
   $SCORING_ENDPOINT
   ```
   {:pre}

   If you observe, the code is from the **Implementation** tab of the deployment your created above. Thereafter, replacing the `$ARRAY_OF_VALUES_TO_BE_SCORED` placeholder with **[5.1,3.5,1.4,0.2]** and `$ANOTHER_ARRAY_OF_VALUES_TO_BE_SCORED` placeholder with **[3.2,1.2,5.2,1.7]**.
   {:tip}

## Test your model
{:#test_model}

Along with CLI, you can also do predictions using the UI.

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

## Monitor your deployed model with {{site.data.keyword.aios_full_notm}}
{:#monitor_openscale}

### Create a {{site.data.keyword.pm_short}} model using a Jupyter notebook
In this section, you will create a ML model using the same iris dataset for exploring {{site.data.keyword.aios_full_notm}}

1. In the top navigation bar, click on the project name `iris_project` to see the project view.
2. Click on **Add to project** in the menu bar and then click **Notebook**
   1. Select **From URL** and give **iris_notebook** as the name
   2. Under **Notebook URL**, enter `https://github.com/IBM-Cloud/ml-iris-classification/blob/master/classify_iris.ipynb`
   3. Click **Create**
3. Once the notebook is created, scroll to **Set up the WML instance** section of the notebook and provide the {{site.data.keyword.aios_full_notm}} service credentials.
4. In the top menu of the notebook, Click **Cell** and then click **Run All**.
5. This should create a ML model and also a deployment under `iris_project`.
6. If you scroll to **Test the model** section, you can see that the accuracy score of the the model is around 0.9-0.9333. DON'T CLOSE THIS WINDOW/TAB.

Let's improve the quality and accuracy of the model in the next section.

### Monitor the deployed model

In this section, you will create a {{site.data.keyword.aios_full_notm}} service to monitor the health, performance, accuracy and quality metrics of your deployed machine learning model.

1. Create a [{{site.data.keyword.aios_full_notm}} service](https://{DomainName}/catalog/services/watson-openscale) under AI section of {{site.data.keyword.Bluemix_notm}} Catalog
   1. Select a region preferably Dallas. Create the service in the same region where you created the {{site.data.keyword.pm_short}} service.
   2. Choose **Lite** plan
   3. Provide a service name if you wish to and select a resource group
   4. Click **Create**.
2. Once the service is provisioned, Click **Manage** on the left pane and click **Launch Application**.
3. Click on **Manual setup** to manually setup the monitors.
4. Choose **Free lite plan database** as your Database type and click **Save**. This is to store your model transactions and model evaluation results.
5. Click **Machine learning providers**
   1. Click on **Add machine learning provider** and click the edit icon on the **connection** tile.
   2. Select **Watson Machine Learning** as your service provider.
   1. In the **Watson Machine Learning service** dropdown, select the {{site.data.keyword.pm_full}} service you created above.
   1. Leave the Environment type to **Pre-production**.
   2. Click **Save**.
6. On the notification, click **go to the dashboard** to add a deployment > Click **Add** and select `Deployment of iris model`> Click **Configure**.
7. Click **Configure monitors** to setup your monitors.
8. Provide the Model details by clicking the **edit** icon on the Model input tile and select
   1. Data type: **Numerical/categorical**
   2. Algorithm type: **Multi-class classification**
   3. Click **Save and continue**
9. Click the **edit** icon on the Training data tile and select
   1. Storage type: **Database or cloud storage**
   2. Location: **Cloud Object Storage**
   3. Login URL: **https://s3.us.cloud-object-storage.appdomain.cloud**
   4. For Resource instance ID and API key, Run the below command in the Cloud Shell
      ```sh
      ibmcloud resource service-key $(ibmcloud resource service-keys --instance-name "cloud-object-storage-tutorial" | awk '/WDP-Project-Management/ {print $1}')
      ```
      {:pre}
   5. Copy and paste the credentials and click **Connect**
   6. Select the Bucket that starts with `irisproject-donotdelete-`
   7. Select `iris_initial.csv` from the Data set dropdown and click **Next**
   8. Select **species** as your label column and click **Next**
   9. Select **all** the four training features and click **Next**
10. Before clicking on **Check now**, let's generate scoring payload required for logging. To do this, Go to the tab where you have your notebook open, scroll to **score data** section, select the code block and click **Run** on the top.
11. Click **Check now**. You should see `Logging is active Click Next` response. Click **Next**
12. Check both **prediction** and **probability** and click **Save**.
13. On the left pane, click on **Quality** and click the **edit** icon on the Quality threshold tile
    1. Threshold value: Accuracy - **0.98** and click **Next**
    2. Minimum sample size (number of transactions) - **10**, Maximum sample size (number of transactions) - **100** and click **Save**
    3. On the left pane, Click on **Go to model summary**

As the tutorial uses a small dataset, configuring Fairness and Drift won't have an impact.

### Evaluate the deployed model
In this section, you will evaluate the model by uploading a `iris_retrain.csv` file which contains 10 instances of each species. Download [iris_retrain.csv](https://ibm.box.com/s/96kvmwhb54700pjcwrd9hd3j6exiqms8).

1. Click on **Actions** and then **Evaluate now**.
2. Click on **browse**, upload the `iris_retrain.csv` file and click on **Upload and evaluate**.
3. After the evaluation is completed, you should see the dashboard with different metrics.
   1. Click on **1.00** under Quality to check the Accuracy of the model. Click on the back button next to **Deployment of iris model Evaluations**
   2. Click on the Number of explanations (2), select one of the transactions and click **View**.
   3. You can see important information like How this prediction was determined, Most important factors influencing prediction, confidence etc.,

## Remove resources
{:removeresources}

1. Navigate to [{{site.data.keyword.Bluemix_short}} Resource List](https://{DomainName}/resources/) > choose the Location, Org and Space where you have created the services.
2. Delete the respective {{site.data.keyword.DSX_short}}, {{site.data.keyword.pm_short}}, {{site.data.keyword.dashdbshort}} and {{site.data.keyword.cos_short}} services which you created for this tutorial.

## Related content
{:related}

- [Watson Studio Overview](https://dataplatform.ibm.com/docs/content/getting-started/overview-ws.html?audience=wdp&context=wdp)
- [Detect Anomalies using Machine Learning](https://{DomainName}/docs/tutorials?topic=solution-tutorials-gather-visualize-analyze-iot-data#data_experiencee)
- [Automatic model creation](https://datascience.ibm.com/docs/content/analyze-data/ml-model-builder.html?linkInPage=true)
- [Machine learning & AI](https://dataplatform.ibm.com/docs/content/analyze-data/wml-ai.html?audience=wdp&context=wdp)
