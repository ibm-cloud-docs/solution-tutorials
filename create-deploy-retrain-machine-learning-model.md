---
subcollection: solution-tutorials
copyright:
  years: 2023
lastupdated: "2023-09-12"
lasttested: "2022-09-12"

content-type: tutorial
services: cloud-object-storage, ai-openscale
account-plan: paid
completion-time: 2h
use-case: AIAndML
---
{{site.data.keyword.attribute-definition-list}}


# Build, deploy, test and monitor a predictive machine learning model
{: #create-deploy-retrain-machine-learning-model}
{: toc-content-type="tutorial"}
{: toc-services="cloud-object-storage, ai-openscale"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

This tutorial walks you through the process of building a predictive machine learning model, deploying the generated model as an API to be used in your applications and testing the model all of this happening in an integrated and unified self-service experience on {{site.data.keyword.Bluemix_notm}}. You will then monitor the deployed model with {{site.data.keyword.aios_full_notm}}.
{: shortdesc}

In this tutorial, the **Iris flower data set** is used for creating a machine learning model to classify species of flowers.

In the terminology of machine learning, classification is considered an instance of supervised learning, i.e. learning where a training set of correctly identified observations is available.
{: tip}

{{site.data.keyword.DSX}} provides you with the environment and tools to solve your business problems by collaboratively working with data. You can choose the tools you need to analyze and visualize data, to cleanse and shape data, to ingest streaming data, or to create and train machine learning models.

## Objectives
{: #create-deploy-retrain-machine-learning-model-objectives}

* Import data to a project.
* Build a machine learning model.
* Deploy the model and try out the API.
* Test a machine learning model.
* Monitor the deployed model
* Retrain your model.

![Architecture Diagram](images/solution22-build-machine-learning-model/architecture_diagram.png){: caption="Figure 1. Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

1. The admin uploads a CSV file from a local machine.
2. The uploaded CSV file is stored in {{site.data.keyword.cos_full_notm}} service as a dataset.
3. The dataset is then used to build and deploy a machine learning model. The deployed model is exposed as an API (scoring-endpoint).
4. The user makes an API call to predict the outcome with the test data.
5. The deployed machine learning model is monitored for quality, accuracy and other key parameters with the test data.

## Import data to a project
{: #create-deploy-retrain-machine-learning-model-import_data_project}
{: step}

A project is how you organize your resources to achieve a particular goal. Your project resources can include data, collaborators, and analytic tools like Jupyter notebooks and machine learning models.

You can create a project to add data and open a data asset in the data refiner for cleansing and shaping your data.

### Create a project
{: #create-deploy-retrain-machine-learning-model-create_project}

1. If you do not have an existing {{site.data.keyword.cos_short}} service, go to the [{{site.data.keyword.Bluemix_short}} catalog](/catalog) and create an instance of [{{site.data.keyword.cos_short}}](/objectstorage/create).

   Insure the {{site.data.keyword.cos_short}} **One Rate** plan is not selected.  The **One Rate** plan is not currently supported for model deployment.
   {: note}

1. From the [catalog](/catalog), create [{{site.data.keyword.DSX_short}}](/catalog/services/data-science-experience?taxonomyNavigation=app-services)
   1. Select a **region**
   2. Select a **Lite** pricing plan
   3. Change the **Service name** to **watson-studio-tutorial**
   4. Select a **resource group** and click **Create**
2. Click on the **Launch in** twisty and select **IBM watsonx**.
3. Create a **project** by clicking on the upper left hamburger menu and selecting **Projects > Vew all projects** then **New project**.
3. In the subsequent page click **Create an empty project**.
4. Provide **iris_project** as the project name.
5. Under **Storage**, choose an **existing** {{site.data.keyword.cos_short}} service verified to exist a few steps earlier.
6. Click **Create**. Your new project opens and you can start adding resources to it.

### Import data
{: #create-deploy-retrain-machine-learning-model-import_data}

As mentioned earlier, you will be using the **Iris data set**. The Iris dataset was used in R.A. Fisher's classic 1936 paper, _The Use of Multiple Measurements in Taxonomic Problems_, and can also be found on the [UCI {{site.data.keyword.pm_short}} Repository](https://archive.ics.uci.edu/ml/datasets/iris){: external}. This small dataset is often used for testing out machine learning algorithms and visualizations. The aim is to classify Iris flowers among three species (Setosa, Versicolor or Virginica) from measurements of length and width of sepals and petals. The iris data set contains 3 classes of 50 instances each, where each class refers to a type of iris plant.

![Iris Example](images/solution22-build-machine-learning-model/iris_machinelearning.png){: caption="Iris Example" caption-side="bottom"}
{: style="text-align: center;"}

**Download** [iris_initial.csv](https://github.com/IBM-Cloud/ml-iris-classification/raw/master/data/iris_initial.csv){: external} which consists of 40 instances of each species. Make sure the downloaded file is named `iris_initial.csv`.

1. Select the **Assets** tab if not already selected.
1. Under **Data in this project**, click **Drop data files here or browse for files to upload**.
2. Upload the downloaded `iris_initial.csv`.
3. Once added, you should see `iris_initial.csv` under the **All assets** section of the project.

## Associate the {{site.data.keyword.pm_short}} service
{: #create-deploy-retrain-machine-learning-model-associate_services}
{: step}

1. In the top navigation menu, of the `iris-project` click on **Manage** then select the **Services & integrations** section on left.
2. Click **Associate Service**.  
3. If you have an existing **{{site.data.keyword.watson}} {{site.data.keyword.pm_short}}** service instance, skip to the next step. Otherwise continue with the following steps to create a new instance.
   1. Click **New service** and then click on the **{{site.data.keyword.watson}} {{site.data.keyword.pm_short}}** tile.
   2. Select a **region** same as the {{site.data.keyword.DSX_short}} service and choose a **Lite** plan.
   3. Enter `machine-learning-tutorial` as the **Service name** and select a resource group.
   4. Click **Create** to provision a {{site.data.keyword.pm_short}} service.
4. Check the checkbox next to the {{site.data.keyword.pm_short}} service and click **Associate service**.

## Build a machine learning model
{: #create-deploy-retrain-machine-learning-model-build_model}
{: step}

1. In the top navigation menu, click on `iris-project`, click on **Assets** in the top bar.
1. Click on **New task +** and search for **auto**.
   1. Click on the **Build machine models automatically** tile.
   2. Set the name to **iris_auto**.
   3. Under **{{site.data.keyword.watson}} {{site.data.keyword.pm_short}} service instance**, notice the service previously associated.
2. Click **Create**.

Once the model is created,
1. Add training data by clicking **Select data from project**.
   1. Choose the **iris_initial.csv** file under **Data asset**.
   2. Click **Select asset**.
1. If prompted, answer **No** to **Create a time series forecast?**.
2. Select **Species** as your **What do you want to predict?**.
3. Click **Experiment settings**.
1. Select **Data source**.
1. Under **Training and holdout method**, set **Holdout data split** to **14%** by moving the slider.
4. On the left menu, Click on **Prediction**:
   1. Set **Prediction type** to **Multiclass classification**.
   2. Set **Optimized metric** as **Accuracy**.
   3. Click on **Save settings**.
5. Click on **Run experiment**.
6. The **AutoAI experiment** may take up to 5 minutes to select the right Algorithm for your model.

   Each model pipeline is scored for a variety of metrics and then ranked. The default ranking metric for binary classification models is the area under the ROC curve, for multi-class classification models is accuracy, and for for regression models is the root mean-squared error (RMSE). The highest-ranked pipelines are displayed in a leaderboard, so you can view more information about them. The leaderboard also provides the option to save select model pipelines after reviewing them.
   {: tip}

Once the experiment completes running,
1. Scroll down to the **Pipeline leaderboard**.
1. Click a pipeline to view more detail about the metrics and performance.  When finished dismiss by clicking the **X**.
4. Next to the model with _Rank 1_ click on **Save as**
   1. Select **Model**.
   1. Keep the default name.
   1. Click **Create**.
6. From the received notification, click **View in project**.

## Deploy and test your model
{: #create-deploy-retrain-machine-learning-model-deploy_model}
{: step}

In this section, you will deploy the saved model and test the deployed model,

1. Under the created model, click on **Promote to deployment space**.
1. Under **Target Space**, select **Create a new deployment space**. _You use deployment spaces to deploy models and manage your deployments._
   1. Set the **Name** to **iris_deployment_space**.
   2. Select the {{site.data.keyword.cos_short}} storage service used in previous steps in the corresponding drop down.
   3. Select the `machine-learning-tutorial` service in the corresponding drop down.
   3. Click **Create**.
2. Click on **Promote**.
3. From the received notification, navigate to the **deployment space**.

In the **Deployments > iris_deployment_space**:
1. Click on the name of the model you just created.
5. Click the **New deployment** button.
6. Select **Online** as the Deployment type, provide **iris_deployment** as the name and then click **Create**.
7. Under **Deployments** tab, once the status changes to **Deployed**, Click on the **Name** in the table.  The properties of the deployed web service for the model will be displayed.

### Test the deployed model
{: #create-deploy-retrain-machine-learning-model-7}

1. Under **Test** tab of your deployment, click on **JSON input** icon next to **Enter input data** and provide the `JSON`below as input.
   ```json
      {
      "input_data": [{
        "fields": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
        "values": [
          [5.1,3.5,1.4,0.2], [3.2,1.2,5.2,1.7]
        ]
      }]
    }
   ```
   {: codeblock}

2. Click **Predict** and you should see the **Prediction results** in table and JSON view.
3. You can change the input data and continue testing your model.

## Try out the API
{: #create-deploy-retrain-machine-learning-model-try_api}
{: step}

Along with the UI, you can also do predictions using the API scoring endpoint by exposing the deployed model as an API to be accessed from your applications.

1. Under **API reference** tab of the deployment, you can see the _Endpoint_ under Direct link and code snippets in various programming languages.
2. **Copy** the _Endpoint_ in a notepad for future reference.
3. In a browser, launch the [{{site.data.keyword.Bluemix_notm}} Shell](/shell) and export the scoring End-point to be used in subsequent requests. **_Make sure you don't close this window/tab_**..
   ```sh
   export SCORING_ENDPOINT='<SCORING_ENDPOINT_FROM_ABOVE_STEP>'
   ```
   {: pre}

   {{site.data.keyword.Bluemix_notm}} Shell is a cloud-based shell workspace that you can access through your browser. It's preconfigured with the full {{site.data.keyword.Bluemix_notm}} CLI and tons of plug-ins and tools that you can use to manage apps, resources, and infrastructure.
   {: tip}

4. To use the {{site.data.keyword.watson}} {{site.data.keyword.pm_short}} REST API, you need to obtain an {{site.data.keyword.Bluemix_notm}} Identity and Access Management (IAM) token. Run the below command
   ```sh
   ibmcloud iam oauth-tokens --output JSON | jq -r .iam_token
   ```
   {: pre}

5. Copy the complete IAM token along with `Bearer` from the above response and export it as an `IAM_TOKEN` to be used in the subsequent API requests
   ```sh
   export IAM_TOKEN=$(ibmcloud iam oauth-tokens --output JSON | jq -r .iam_token)
   echo $IAM_TOKEN
   ```
   {: pre}

6. Run the below **cURL** code in the cloud shell to see the prediction results.
   ```sh
   curl -X POST \
   --header 'Content-Type: application/json' \
   --header 'Accept: application/json' \
   --header "Authorization: $IAM_TOKEN" \
   -d '{"input_data": [{"fields": ["sepal_length", "sepal_width", "petal_length","petal_width"],"values": [[5.1,3.5,1.4,0.2], [3.2,1.2,5.2,1.7]]}]}' \
   $SCORING_ENDPOINT
   ```
   {: pre}

   If you observe, the code is from the **cURL** tab of the deployment your created above. Thereafter, replacing the `[$ARRAY_OF_INPUT_FIELDS]` placeholder with  **["sepal_length", "sepal_width", "petal_length","petal_width"]**, `[$ARRAY_OF_VALUES_TO_BE_SCORED]` placeholder with **[5.1,3.5,1.4,0.2]** and `[$ANOTHER_ARRAY_OF_VALUES_TO_BE_SCORED]` placeholder with **[3.2,1.2,5.2,1.7]** respectively.
   {: tip}

## Monitor your deployed model with {{site.data.keyword.aios_full_notm}}
{: #create-deploy-retrain-machine-learning-model-monitor_openscale}
{: step}

{{site.data.keyword.aios_full}} tracks and measures outcomes from your AI models, and helps ensure they remain fair, explainable, and compliant wherever your models were built or are running. {{site.data.keyword.aios_short}} also detects and helps correct the drift in accuracy when an AI model is in production.

For ease of understanding, the tutorial concentrates only on improving the quality (accuracy) of the AI model through {{site.data.keyword.aios_short}} service.

### Provision {{site.data.keyword.aios_full_notm}} service
{: #create-deploy-retrain-machine-learning-model-11}

In this section, you will create a {{site.data.keyword.aios_short}} service to monitor the health, performance, accuracy and quality metrics of your deployed machine learning model.

1. Create a [{{site.data.keyword.aios_full_notm}} service](/catalog/services/watson-openscale)
   1. Select a region preferably Dallas. Create the service in the same region where you created the {{site.data.keyword.pm_short}} service.
   2. Choose **Lite** plan.
   3. Set the service name to **watson-openscale-tutorial**.
   1. Select a resource group.
   4. Click **Create**.
2. Once the service is provisioned, Click **Manage** on the left pane and click **Launch Application**.
3. Click on **Manual setup** to manually setup the monitors.

### Selecting a deployment
{: #create-deploy-retrain-machine-learning-model-12}

In this section, as part of preparing your model for monitoring you will set up and enable monitors for each deployment that you are tracking with {{site.data.keyword.aios_full_notm}}.

1. By clicking on the **Edit** icon on the **Database** tile, choose **Free lite plan database** as your Database type and click **Save**. _This is to store your model transactions and model evaluation results._
2. Click on **Machine learning providers**
   1. Click on **Add machine learning provider** and click the edit icon on the **Connection** tile.
   2. Select **{{site.data.keyword.watson}} {{site.data.keyword.pm_short}}(V2)** as your service provider type.
   3. In the **Deployment space** dropdown, select the deployment space `iris_deployment_space` you created above.
   4. Leave the Environment type to **Pre-production**.
   5. Click **Save**.
3. On the far left pane:
   1. Click the icon for **Insights dashboard**(first icon) to add a deployment
   2. Click on **Add to dashboard** to start the wizard on the **Select model location** page.
      1. On the **Deployment spaces** tab click on the `iris_deployment_space` radio button
      1. Click **Next**
   3. On the **Select deployed model** page:
      1. Click **iris_deployment**
      2. Click **Next**
   3. On the **Provide model information** page:
      1. Data type: **Numerical/categorical**
      2. Algorithm type: **Multi-class classification**
      3. Click **View summary**
   4. Click **Finish**

The **iris_deployment** pre production dashboard is now displayed.

Click **Actions** > **Configure monitors** 

1. Click the **pencil** icon on the **Training data** tile to start the wizard.
   1. In the **Select configuration** method page
      1. Click **Use manual setup**
      1. Click **Next**
   1. In the **Specify training data** method page
      1. For Training data option choose **Database or cloud storage**
      1. For Location choose **Cloud Object Storage**
      1. For Resource instance ID and API key, run the below command in the Cloud Shell. Make sure to change the value after `--instance-name` to match the name of the {{site.data.keyword.cos_short}} instance you have been using for this tutorial. 
      ```sh
      ibmcloud resource service-key $(ibmcloud resource service-keys --instance-name "cloud-object-storage-tutorial" | awk '/WDP-Project-Management/ {print $1}')
      ```
      {: pre}

      1. Copy and paste the Credentials resource_instance_id.  It will begin with **crn** and end with two colons **::**.
      1. Copy and paste the Credentials api key without any trailing spaces.
      1. Click **Connect**.
      1. Select the Bucket that starts with `irisproject-donotdelete-`.
      6. Select `iris_initial.csv` from the Data set dropdown.
      1. Click **Next**
   1. In the **Select the feature columns and label column** method page
      1. The defaults should be correct.  Species as the Label/Target and the rest as Features.
      1. Click **Next**
   1. In the **Select model output** method page
      1. The defaults should be correct, prediction for Prediction and probability for Probability.
      1. Click **View summary**
   1. Click **Finish**
1. Click the **pencil** icon on the **Model output details** tile to start the wizard.
   1. In the **Specify model output details** method page
      1. The defaults should be correct.
      1. Click **Save**
1. On the left pane, click on **Quality** under Evaluations and click the **edit** icon on the **Quality thresholds** tile
   1. In the **Quality thresholds** page set the following values:
      1. Accuracy **0.98**
      1. Click **Next**
   1. In the **Sample size** page
      1. Set Minimum sample size to **10**
      1. Click **Save**

On the left pane, Click on **Go to model summary**

   The quality monitor (previously known as the accuracy monitor) reveals how well your model predicts outcomes.
   {: tip}

As the tutorial uses a small dataset, configuring Fairness and Drift won't have any impact.

### Evaluate the deployed model
{: #create-deploy-retrain-machine-learning-model-14}

In this section, you will evaluate the model by uploading a `iris_retrain.csv` file which contains 10 instances of each species. **Download** [iris_retrain.csv](https://github.com/IBM-Cloud/ml-iris-classification/blob/master/data/iris_retrain.csv){: external}.

1. Click on **Actions** and then **Evaluate now**.
2. Choose **from CSV file** as your import option and click on **browse**, upload the `iris_retrain.csv` file.
2. Click  and click on **Upload and evaluate**.
3. After the evaluation is completed, you should see the dashboard with different metrics.

To understand the quality metrics, refer to [Quality metric overview](https://dataplatform.cloud.ibm.com/docs/content/wsj/model/wos-quality-overview.html?context=cpdaas)
{: tip}

## Remove resources
{: #create-deploy-retrain-machine-learning-model-0}
{: removeresources}
{: step}

1. Navigate to [{{site.data.keyword.Bluemix_short}} Resource List](/resources/).
2. Under **Name**, enter **tutorial** in the search box.
3. Delete the services which you created for this tutorial.

Depending on the resource it might not be deleted immediately, but retained (by default for 7 days). You can reclaim the resource by deleting it permanently or restore it within the retention period. See this document on how to [use resource reclamation](/docs/account?topic=account-resource-reclamation).
{: tip}

## Related content
{: #create-deploy-retrain-machine-learning-model-8}
{: related}

- [{{site.data.keyword.cpd_full_notm}} Overview](https://dataplatform.{DomainName}/docs/content/wsj/getting-started/welcome-main.html?context=analytics){: external}
- [Automatic model creation](https://dataplatform.{DomainName}/docs/content/wsj/analyze-data/autoai-overview.html?context=analytics)
- [Machine learning & AI](https://dataplatform.{DomainName}/docs/content/wsj/analyze-data/wml-ai.html?context=analytics)
- [{{site.data.keyword.aios_short}} documentation](https://dataplatform.{DomainName}/docs/content/wsj/model/getting-started.html?context=analytics)
