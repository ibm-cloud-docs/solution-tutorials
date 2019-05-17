---
copyright:
  years: 2017, 2019
lastupdated: "2019-03-07"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Gather, visualize, and analyze IoT data
{: #gather-visualize-analyze-iot-data}
This tutorial walks you through setting up an IoT device, gathering data in the {{site.data.keyword.iot_short_notm}}, exploring data and creating visualizations and then using advanced machine learning services to analyze data and detect anomalies in the historical data.
{:shortdesc}

## Objectives
{: #objectives}

* Set up IoT Simulator.
* Send collection data to {{site.data.keyword.iot_short_notm}}.
* Create visualizations.
* Analyze the device generated data and detect anomalies.

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.iot_full}}](https://{DomainName}/catalog/services/internet-of-things-platform)
* [Node.js Application](https://{DomainName}/catalog/starters/sdk-for-nodejs)
* [{{site.data.keyword.DSX_short}}](https://{DomainName}/catalog/services/data-science-experience) with [{{site.data.keyword.iae_full_notm}}](https://{DomainName}/catalog/services/analytics-engine) and {{site.data.keyword.cos_full_notm}}
* [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudant)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

   ![](images/solution16/Architecture.png)
</p>

* Devices send sensor data to {{site.data.keyword.iot_full}} using MQTT protocol
* Historical data is exported into a {{site.data.keyword.cloudant_short_notm}} database
* {{site.data.keyword.DSX_short}} pulls data from this database
* Data is analyzed and visualized through a Jupyter notebook

## Before you begin
{: #prereqs}

[{{site.data.keyword.Bluemix_notm}} Developer Tools](https://github.com/IBM-Cloud/ibm-cloud-developer-tools) - Run the script to install ibmcloud cli and required plug-ins

## Create IoT Platform
{: #iot_starter}

To begin, you will create Internet of Things Platform service - The hub which can manage devices, securely connect and **collect data**, and make historical data available for visualizations and applications.

1. Go to the [**{{site.data.keyword.Bluemix_notm}} Catalog**](https://{DomainName}/catalog/) and select [**Internet of Things Platform**](https://{DomainName}/catalog/services/internet-of-things-platform) under the **Internet of Things** section.
2. Enter `IoT demo hub` as the service name, click **Create** and **Launch** the dashboard.
3. From the side menu, select **Security > Connection Security** and choose **TLS Optional** under **Default Rule** > **Security Level** and click **Save**.
4. From the side menu, select **Devices** > **Device Types**  and **+ Add Device Type**.
5. Enter `simulator` as the **Name** and click **Next** and **Done**.
6. Next, click on **Register Devices**
7. Choose `simulator` for **Select Existing Device Type** and then enter `phone` for **Device ID**.
8. Click **Next** until the **Device Security** (under Security tab) screen is displayed.
9. Enter a value for the **Authentication Token**, for example: `myauthtoken` and click **Next**.
10. After clicking **Done**, your connection information is displayed. Keep this tab open.

The IoT platform is now configured to start receiving data. Devices will need to send their data to the IoT Platform with the Device Type, ID and Token specified.

## Create device simulator
{: #confignodered}
Next, you will deploy a Node.js web application and visit it on your phone, which will connect to and send device accelerometer and orientation data to the IoT Platform.

1. Clone the Github repository:
   ```bash
   git clone https://github.com/IBM-Cloud/iot-device-phone-simulator
   cd iot-device-phone-simulator
   ```
2. Open the code in an IDE of your choice and change the `name` and `host` values in the **manifest.yml** file to a unique value.
3. Push the application to the {{site.data.keyword.Bluemix_notm}}.
   ```bash
   ibmcloud login
   ibmcloud target --cf
   ibmcloud cf push
   ```
4. In a few minutes, your application will be deployed and you should see a URL similar to `<UNIQUE_NAME>.mybluemix.net`
5. Visit this URL on your phone using a browser.
6. Enter the connection information from your IoT Dashboard tab under **Device Credentials** and click **Connect**.
7. Your phone will start transmitting data. Back in the **IBM {{site.data.keyword.iot_short_notm}} tab**, check for new entires in the **Recent Events** section.
  ![](images/solution16/recent_events_with_phone.png)

## Display live data in IBM {{site.data.keyword.iot_short_notm}}
{: #createcards}
Next, you will create a board and cards to display device data in the dashboard.

### Create a board
{: #createboard}

1. Open the **IBM {{site.data.keyword.iot_short_notm}} dashboard**.
2. Select **Boards** from the left menu, and then click **Create New Board**.
3. Enter a name for the board, `Simulators` as example,  and click **Next** and then **Submit**.  
4. Select the board that you just created to open it.

### Display device data
{: #cardtemp}
1. Click **Add New Card**, and then select the **Line Chart** card type, which is located in the Devices section.
2. Select your device from the list, then click **Next**.
3. Click **Connect new data set**.
4. In the Create Value Card page, select or enter the following values and click **Next**.
   - Event: sensorData
   - Property: ob
   - Name: OrientationBeta
   - Type: Float
   - Min: -180
   - Max: 180
5. In the Card Preview page, select **L** for the line chart size, and click **Next** > **Submit**
6. The  card appears on the dashboard and includes a line chart of the live temperature data.
7. Use your mobile phone browser to launch the simulator again and slowly tilt the phone forward and backward.
8. Back in the **IBM {{site.data.keyword.iot_short_notm}} tab**, you should see the chart getting updated.
   ![](images/solution16/board.png)

## Store historical data in {{site.data.keyword.cloudant_short_notm}}
1. Go to the [**{{site.data.keyword.Bluemix_notm}} Catalog**](https://{DomainName}/catalog/) and create a new [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudant) named `iot-db`.
2. Under **Connections**:
   1. **Create connection**
   1. Select the Cloud Foundry location, organization and space where an alias to the {{site.data.keyword.cloudant_short_notm}} service should be created.
   1. Expand the space name in the **Connection Location** table and use the **Connect** button next to **iot demo hub** to create an alias for the {{site.data.keyword.cloudant_short_notm}} service in that space. 
   1. Connect and restage the app.
3. Open the **IBM {{site.data.keyword.iot_short_notm}} dashboard**.
4. Select **Extensions** from the left menu, and then click **Setup** under **Historical Data Storage**.
5. Select the `iot-db` {{site.data.keyword.cloudant_short_notm}} database.
6. Enter `devicedata` for **Database Name** and click **Done**.
7. A new window should load prompting for authorization. If you don't see this window, disable your pop-up blocker and refresh the page.

Your device data is now saved in {{site.data.keyword.cloudant_short_notm}}. After a few minutes, launch the {{site.data.keyword.cloudant_short_notm}} dashboard to see your data.

![](images/solution16/cloudant.png)

## Detect Anomalies using Machine Learning
{: #data_experience}

In this section, you will use the Jupyter Notebook that is available in the IBM {{site.data.keyword.DSX_short}} service to load your historical mobile data and detect anomalies using z-score. *z-score* is a standard score that indicates how many standard deviations an element is from the mean

### Create a new project
1. Go to the [**{{site.data.keyword.Bluemix_notm}} Catalog**](https://{DomainName}/catalog/) and under **AI**, select [**{{site.data.keyword.DSX_short}}**](https://{DomainName}/catalog/services/data-science-experience).
2. **Create** the service and launch it's dashboard by clicking **Get Started**
3. Create a Project > Select **Data Science** > Click **Create project** and enter `Detect Anomaly` as the **Name** of the project.
4. Leave the **Restrict who can be a collaborator** checkbox unchecked as there's no confidential data.
5. Under **Define Storage**, Click on **Add** and choose an existing **Cloud Object Storage** service or create a new one (Select **Lite** plan > Create). Hit **Refresh** to see the created service.
6. Click **Create**. Your new project opens and you can start adding resources to it.

### Connection to {{site.data.keyword.cloudant_short_notm}} for data

1. Click on **Assets** > **+ Add to Project** > **Connection**  
2. Select the **iot-db** {{site.data.keyword.cloudant_short_notm}} where the device data is stored.
3. Cross-check the **Credentials** and then click **Create**.

### Create an {{site.data.keyword.iae_full_notm}} service

1. Click **Services** on the top navigation bar > Compute Services.
2. Click **Add service**.
   1. Click **Add** on **{{site.data.keyword.iae_full_notm}}**.
   1. Select the **Lite** plan.
   1. Select **AE 1.1 Spark** as software package
   1. Click **Create**.
3. Select a resource group, change the service name if you want to and **Confirm**.
1. Navigate to the `Detect Anomaly` project through **Projects**.
1. In the **Settings**, scroll to **Associated services**.
1. Click **Add service**, select **{{site.data.keyword.iae_full_notm}}**.
1. Select the **{{site.data.keyword.iae_full_notm}}** instance previously created. If the service is not showing in the list, make sure it is fully provisioned first.

### Create a Jupyter (ipynb) notebook
1. Click **+ Add to Project** and add a new **notebook**.
2. Enter `Anomaly-detection-notebook` for the **Name**.
3. Enter `https://github.com/IBM-Cloud/iot-device-phone-simulator/raw/master/anomaly-detection/Anomaly-detection-watson-studio-python3.ipynb` in the **Notebook URL**.
4. Select the **{{site.data.keyword.iae_full_notm}}** service associated previously as the runtime.
5. Create **Notebook**. Set `Python 3.5 with Spark 2.3 (YARN Client Mode)` as your Kernel. Check that the notebook is created with metadata and code.
   ![Jupyter Notebook Watson Studio](images/solution16/jupyter_notebook_watson_studio.png)
   To update, **Kernel** > Change kernel. To **Trust** the notebook, **File** > Trust Notebook.
   {:tip}

### Run the notebook and detect anomalies   
1. Select the cell that starts with `!pip install --upgrade pixiedust,` and then click **Run** or **Ctrl + Enter** to execute the code.
2. When the installation is complete, restart the Spark kernel by clicking the **Restart Kernel** icon.
3. In the next code cell, Import your {{site.data.keyword.cloudant_short_notm}} credentials to that cell by completing the following steps:
   * Click ![](images/solution16/data_icon.png)
   * Select the **Connections** tab.
   * Click **Insert to code**. A dictionary called _credentials_1_ is created with your {{site.data.keyword.cloudant_short_notm}} credentials. If the name is not specified as _credentials_1_, rename the dictionary to `credentials_1`. `credentials_1` is used in the remaining cells.
4. In the cell with the database name (`dbName`) enter the name of the {{site.data.keyword.cloudant_short_notm}} database that is the source of data, for example, *iotp_yourWatsonIoTProgId_DBName_Year-month-day*. To visualize data of different devices, change the values of `deviceId` and `deviceType` accordingly.
   You can find the exact database by navigating to your **iot-db** {{site.data.keyword.cloudant_short_notm}} instance you created earlier > Launch Dashboard.
   {:tip}
5. Save the notebook and execute each code cell one after another or run all (**Cell** > Run All) and by end of the notebook you should see anomalies for device movement data (oa,ob, and og).
   You can change the time interval of interest to desired time of the day. Look for `start` and `end` values.
   {:tip}
   ![Jupyter Notebook DSX](images/solution16/anomaly_detection_watson_studio.png)
6. Along with anomaly detection, the key findings or takeaways from this section are
    * Usage of Spark to prepare the data for visualization.
    * Usage of Pandas for data visualization
    * Bar charts, Histograms for device data.
    * Correlation between two sensors through Correlation matrix.
    * A box plot for each devices sensor, produced with the Pandas plot function.
    * Density Plots through Kernel density estimation (KDE).
    ![](images/solution16/density_plots_sensor_data.png)

## Remove resources
{:removeresources}

1. Navigate to [Resource List](https://{DomainName}/resources/) > choose the Location, Org and Space where you have created the app and services. Under **Cloud Foundry Apps**, delete the Node.JS App your created above.
2. Under **Services**, delete the respective {{site.data.keyword.iot_full}}, {{site.data.keyword.iae_full_notm}}, {{site.data.keyword.cloudant_short_notm}} and {{site.data.keyword.cos_full_notm}} services which you created for this tutorial.

## Related content
{:related}

* [Build, deploy, test, and retrain a predictive machine learning model](https://{DomainName}/docs/tutorials?topic=solution-tutorials-create-deploy-retrain-machine-learning-model#build-deploy-test-and-retrain-a-predictive-machine-learning-model)
* Overview of [IBM {{site.data.keyword.DSX_short}}](https://dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/overview-ws.html)
* [Understanding z-score](https://en.wikipedia.org/wiki/Standard_score)
* Developing cognitive IoT solutions for anomaly detection by using deep learning - [5 post series](https://developer.ibm.com/series/iot-anomaly-detection-deep-learning/)
