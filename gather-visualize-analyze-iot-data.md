---
copyright:
  years: 2017
lastupdated: "2017-12-13"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Gather, Visualize and Analyze IoT data
This tutorial walks you thru setting up an IoT device, gathering data in the Watson IoT Platform, exploring data and creating visualizations and then using advanced machine learning services to analyze data and detect anomalies in the historical data.
{:shortdesc}

## Objectives
{: #objectives}

* Set up IoT Simulator
* Send collection data to Watson IoT Platform
* Create visualizations
* Analyze [TODO]

## Products
{: #products}

This tutorial uses the following products:
* [Internet of Things Platform](https://console.bluemix.net/catalog/services/internet-of-things-platform)
* [Node.js Application](https://console.ng.bluemix.net/catalog/)
* [Data Science Experience](https://console.bluemix.net/catalog/services/data-science-experience)

<p style="text-align: center;">
![](images/solution16/Architecture.png)
</p>

## Create IoT Platform
{: #iot_starter}

To begin, you will create Internet of Things Platform service - The hub which can manage devices, securely connect and **collect data**, and make historical data available for visulizations and applications.

1. Visit **IBM Cloud Dashboard** > **Catalog** and select **Internet of Things Platform** under the **Internet of Things** section.
2. Enter `IoT demo hub` as the service name, click **Create** and **Launch** the dashboard.
3. From the side menu, select **Security > Connection Security** and choose **TLS Optional** under *Default Rule > Security Level**
3. From the side menu, select **Devices** > **Add Device** > **Device Types**  and **+ Add Device Type**.
5. Enter `simulator` as the **Name** and click **Next** and **Done**.
6. Next, click on **Register Device **
7. Choose `simulator` for **Select Existing Device Type** and then enter `phone` for **Device ID**.
8. Cick **Next** until the **Device Security** screen is displayed.
9. Enter a value for the **Authentication Token**, for example: `myauthtoken` and click **Next**
10. After clicking **Done**, your connection information is displayed. Keep this tab open.

The IoT platform is now configured to start receiving data. Devices will need to send their data to the IoT Platform with the Device Type, ID and Token specified.

## Create device simulator
{: #confignodered}
Next, you will need to configure the simulator. You will deploy a Node.js web application which you will visit on your phone, which will connect to and send data to the IoT Platform.

1. Clone the Github repository:
   ```bash
   git clone https://github.com/cloud-dach/iotdeviceconnect
   cd iotdeviceconnect
   ```
2. Push the application to the IBM Cloud.
   ```bash
   bx login
   bx target --cf
   bx cf push <PICK_UNIQUE_NAME>
   ```
3. In a few minutes, your application will be deployed and you should see a URL similar to `<PICK_UNIQUE_NAME>.mybluemix.net`
4. Visit this URL on your phone using a browser.
5. Enter the connection information from your IoT Dashboard tab and click **Connect**.
6. Your phone will start trasmitting data. Back in the **IBM Watson IoT Platform tab**, check for new entires in the **Recent Events** section.

  ![](images/solution16/recent_events.png)

## Display live data in IBM Watson IoT Platform
{: #createcards}
Next, you will create a board and cards to display device data in the dashboard. For more information about boards and cards, see [Visualizing real-time data by using boards and cards](https://console.ng.bluemix.net/docs/services/IoT/data_visualization.html).

### Create a board
{: #createboard}

1. Open the **IBM Watson IoT Platform dashboard**.
2. Select **Boards** from the left menu, and then click **Create New Board**.
3. Enter a name for the board and click **Next** and then **Create**.  
4. Double-click the board that you just created to open it.

### Create a card to display temperature
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
8. Use your mobile phone to launch the simulator again and slowly tilt the phone forward and backward.
8. Back in the **IBM Watson IoT Platform tab**, you should see the chart update.

## Store historical data in Cloudant DB
1. Open the **IBM Watson IoT Platform dashboard**.
2. Select **Extensions** from the left menu, and then click **Setup** under **Historical Data Storage**.
3. Select the Cloudant database that was created by the IoT Starter.
4. Enter `TemperatureData` for **Database Name** and click **Done**

## Detect Anomolies using Machine Learning
{: #data_experience}

You will use the Jupyter Notebook that is available in IBM Data Science Experience to load your historical temperature data and detect anomalies using z-score.

![](images/solution16/DSX.png)

1. Visit **IBM Cloud Dashboard** > **Catalog** and select **Data Science Experience**.
2. **Create** the service and launch it's dashboard by clicking **Get Started**
3. Create a **New Project** and enter `Detect Anomoly` as the **Name**.
4. [TODO] Create and select **Object Storage** and **Spark** services. **Refresh**
  ![](images/solution16/define_storage.png)
5. **Create**.
6. **Assets** > **New notebook** > **From URL**
7. Enter `Anomoly-detection-sample` for the **Name**
8. Enter `https://github.com/ibm-watson-iot/predictive-analytics-samples/raw/master/Notebook/Anomaly-detection-DSX.ipynb` in the URL.
9. **Create Notebook**

