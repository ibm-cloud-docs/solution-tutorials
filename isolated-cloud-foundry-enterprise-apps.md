---
copyright:
  years: 2018
lastupdated: "2018-12-20"

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

# Isolated Cloud Foundry Enterprise Apps

With {{site.data.keyword.cfee_full_notm}} (CFEE) you can create multiple, isolated, enterprise-grade Cloud Foundry platforms on demand. This provides your developers with a private Cloud Foundry instance deployed on an isolated Kubernetes cluster. Unlike the public Cloud, you'll have full control over the environment: access control, capacity, version, resource usage and monitoring. Cloud Foundry Enterprise Environment provides the speed and innovation of a platform-as-a-service with the infrastructure ownership found in enterprise IT.

This tutorial will walk you through the process of creating and configuring a Cloud Foundry Enterpise Environment, setting up access control, and deploying apps and services. You'll also review the relationship between CFEE and [Kubernetes](https://{DomainName}/docs/containers/container_index.html) by deploying a custom service broker that integrates custom services with CFEE.

## Objectives
{: #objectives}

* Compare and contrast CFEE with public Cloud Foundy
* Deploy apps and services within CFEE
* Understand the relationship between Cloud Foundry and [IBM Kubernetes Service](https://{DomainName}/docs/containers/container_index.html)
* Investigate basic Cloud Foundry and Kubernetes networking

## Services used
{: #services}

This tutorial uses the following runtimes and services:
* [{{site.data.keyword.cfee_full_notm}}](https://{DomainName}/cfadmin/create)
* [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudant-nosql-db)
* [Cloud Internet Services](https://{DomainName}/catalog/services/internet-services)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/pricing/) to generate a cost estimate based on your projected usage.

## Architecture

{: #architecture}

<p style="text-align: center;">
![Architecture](images/solution45-multi-region-CFEE/Architecture.png)

ToDo: update this.

</p>

## Prerequisites

{: #prereq}

- [{{site.data.keyword.cloud_notm}} CLI](https://{DomainName}/docs/cli/reference/bluemix_cli/download_cli.html)
- [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html)
- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/)

## Provision Cloud Foundry Enterprise Environment

{:cfee}

In this section, you'll create an instance of Cloud Foundry Enterprise Environment deployed to Kubernetes worker nodes from {{site.data.keyword.containershort_notm}}.

1. [Prepare your {{site.data.keyword.cloud_notm}} account](https://{DomainName}/docs/cloud-foundry/prepare-account.html) to ensure creation of required infrastructure resources.
2. From the {{site.data.keyword.cloud_notm}} catalog, create a service instance of [Cloud Foundry Enterprise Environment](https://{DomainName}/cfadmin/create).
3. Configure CFEE by providing the following:
   - Select the **Standard** plan.
   - Enter a **Name** for the service instance.
   - Select a **Resource group** in which the environment is created. You'll need permission to access at least one resource group in the account to be able to create an CFEE.
   - Select a **Geography** and **Location** where the instance is deployed. See the list of [available provisioning locations and data centers](https://{DomainName}/docs/cloud-foundry/index.html#provisioning-targets).
   - Select a public Cloud Foundry **Organization** and **Space** where **{{site.data.keyword.composeForPostgreSQL}}** will be deployed.
   - Select the **Number of cells** for the Cloud Foundry environment. A cell runs Diego and Cloud Foundry applications. At least **2** cells are required for highly available applications.
   - Select the **Machine type**, which determines the size of the Cloud Foundry cells (CPU and memory) .
4. Review the **Infrastructure** section to view the properties of the Kubernetes cluster supporting CFEE. The **Number of worker nodes** equals the number of cells plus 2. Two of the provisioned Kubernetes worker nodes act as the CFEE control plane. The Kubernetes cluster on which the environment is deployed will appear in the {{site.data.keyword.cloud_notm}} [Clusters](https://{DomainName}/containers-kubernetes/clusters) dashboard.
5. Click the **Create** button to begin automated deployment.

The automated deployment takes approximately 90 to 120 minutes. Once successfully created, you'll receive an email confirming the provisioning of CFEE and supporting services.

### Create organizations and spaces

After you've created {{site.data.keyword.cfee_full_notm}}, see [creating organizations and spaces](https://{DomainName}/docs/cloud-foundry/orgs-spaces.html) for information on how to structure the environment through organizations and spaces. Apps in an {{site.data.keyword.cfee_full_notm}} are scoped within specific spaces. Similarly, a space exists within an organization. Members of an organization share a quota plan, apps, services instances, and custom domains.

The **Manage > Account > Cloud Foundry orgs** menu located in the top {{site.data.keyword.cloud_notm}} header is intended exclusively for public {{site.data.keyword.cloud_notm}} organizations. CFEE organizations are managed within the **organizations** page of an CFEE instance.

Follow the steps below to create a CFEE org and space.

1. From the [Cloud Foundry dashboard](https://{DomainName}/dashboard/cloudfoundry/overview) select **Environments** under **Enterprise**.
2. Select your CFEE instance and then select **Organizations**.
3. Click on the **Create Organizations** button, provide `tutorial` as the **Organization Name**, and select a **Quota Plan**. Finish by clicking **Add**.
4. Click on the newly created `tutorial` org, select the **Spaces** tab, and click the **Create Space** button.
5. Provide `dev` as a **Space Name** and click **Add**.

### Add users to orgs and spaces

In CFEE, you can assign role assignments controlling user access, but to do so, the user must be invited to your {{site.data.keyword.cloud_notm}} org in the **Identity & Access** page under the **Manage > Users** in the {{site.data.keyword.cloud_notm}} header.

Once the user has been invited, follow the steps below to add the user to the `tutorial` org and `dev` space.

1. Select your CFEE instance and then select **Organizations** again.
2. Select the `tutorial` from the list.
3. Click on the **Members** tab to view and add a new user.
4. Click on the **Add members** button, search for the username, select the approriate **Organization Roles**, and click **Add**.

More on adding users to CFEE orgs and spaces can be found [here](https://{DomainName}/docs/cloud-foundry/add-users.html#adding_users).

## Deploy, configure, and run CFEE apps

{:deploycfeeapps}

In this section, you'll deploy a Node.js application to CFEE. Once deployed, you'll then bind a {{site.data.keyword.cloudant_short_notm}} to it and enable auditing and logging persistence. The Stratos console will also be added to manage the application.

### Deploy the application to CFEE

1. From your terminal, clone the **get-started-node** Node.js sample application.

   ```sh
   git clone https://github.com/IBM-Cloud/get-started-node
   ```

2. Run the app locally to ensure it builds and starts correctly. Confirm by accessing `http://localhost:3000/` in your browser.

   ```sh
   cd get-started-node
   npm install
   npm start
   ```

3. Log in to {{site.data.keyword.cloud_notm}} and target your CFEE instance. An interactive prompt will help you select your new CFEE instance. Since only one CFEE organization and space exist, these will be the defaulted target. You can run `ibmcloud target -o tutorial -s dev` if you've added more than one org or space.

   ```sh
   ibmcloud login
   ibmcloud target --cf
   ```

4. Push the **get-started-node** app to CFEE.

   ```sh
   ibmcloud cf push
   ```

5. The endpoint of your app will display in the final output next to the `routes` property. Open the URL in your browser to confirm the application is running.

### Create and bind Cloudant database to the app

To bind {{site.data.keyword.cloud_notm}} services to the **get-started-node** application, you'll first need to create a service in your {{site.data.keyword.cloud_notm}} account.

1. Create a [{{site.data.keyword.cloudant_short_notm}}](https://{DomainName}/catalog/services/cloudant) service. Provide the **service name** `cfee-cloudant` and choose the same location where the CFEE instance has been created.
2. Add the newly created {{site.data.keyword.cloudant_short_notm}} service instance to CFEE.
   1. Navigate back to the `cfee-tutorial` **Organization**. Click the **Spaces** tab and select the `dev` space.
   2. Select the **Services** tab and click the **Add service** button.
   3. Type `cfee-cloudant` in the search textbox and select the result. Finish by clicking **Add**. The service is now available to CFEE applications; however, it still resides in public {{site.data.keyword.cloud_notm}}.
3. On the overflow menu of the service instance shown, select **Bind to application**.
4. Select the **GetStartedNode** application you pushed earlier and click **Restage application after binding**. Finally, click the **Bind** button. Wait for the application to restage. You can check progress with the command `ibmcloud app show GetStartedNode`.
5. In your browser, access the application, add your name and hit `enter`. Your name will be added to a {{site.data.keyword.cloudant_short_notm}} database.
6. Confirm by selecting the `cfee-tutorial` instance from the list on the **Services** tab. This will open the service instance's details page in public {{site.data.keyword.cloud_notm}}.
7. Click **Launch Cloudant Dashboard** and select the `myb` database. A JSON document with your name should exist.

### Enable auditing and logging persistence

Auditing allows CFEE administrators to track Cloud Foundry activities such as login, creation of organizations and spaces, user membership and role assignments, application deployments, service bindings, and domain configuration. Auditing is supported through integration with the {{site.data.keyword.cloudaccesstrailshort}} service.

Cloud Foundry application logs can be stored by integrating {{site.data.keyword.loganalysisshort_notm}}. The {{site.data.keyword.loganalysisshort_notm}} service instance selected by a CFEE administrator is configured automatically to receive and persist Cloud Foundry logging events generated from the CFEE instance.

1. Return to your CFEE dashboard and click the **Auditing** link in the left navigation pane.
2. Click **Enable auditing** and select one of the **Activity Tracker instances** available in the {{site.data.keyword.cloud_notm}} account. If no instances are available, the user will see an option to create a new Activity Tracker instance in the {{site.data.keyword.cloud_notm}} atalog.
3. Once auditing is enabled, configuration details are displayed on the page. Details include the status of the configuration, and a link to the Activity Tracker service instance itself, where the user can go to see and manage auditing events.

To enable logging for a CFEE instance:

1. Make sure that you have an [IAM access policy](https://{DomainName}/iam/#/users) that assigns you editor, operator, or administrator role to the Log Analysis service instance into which you intend to persist the logging events.
2. Open a CFEE's user interface and to **Operations > Logging** entry in the left navigation pane to open the Logging page.
3. Click **Enable persistence** and select one of the **Log Analysis instances** available in the {{site.data.keyword.cloud_notm}} account. If no instances are available, the user will see an option to create an instance in the {{site.data.keyword.cloud_notm}} catalog.
4. Once logging persistence is enabled, configuration details are displayed in the page. Details include the status of the configuration, and a link to the Log Analysis service instance itself, where they user can go to see and manage logging events.

**Warning:** Enabling Logging Persistence requires a disruptive restart of the CFEE control plane and cells. During the restart, all administrative functionality will be available, but some applications and services running in this CFEE instance may be unavailable. The status of the CFEE components will be reflected in the Health Check page during the restart. The restart takes approximately 20 minutes.

You can disable auditing or logging persistence by clicking **Disable auditing** or **Disable log persistence** on the respective configuration pages. This removes the service instance from CFEE; however, it will not delete the actual service instance from {{site.data.keyword.cloud_notm}}.
{:tip}

**Note:** When you disable log persistence, the Cloud Foundry logging events are still being generated, they are just not persisted outside the CFEE instance.

### Install the Stratos console to manage the app

The Stratos Console is an open source web-based tool for working with Cloud Foundry. The Stratos Console application can be optionally installed and used in a specific CFEE environment to manage its organizations, spaces, and applications.

Users with {{site.data.keyword.cloud_notm}} administrator or editor roles in the CFEE instance can install the Stratos Console application in that CFEE instance.

To install the Stratos Console application:

1. Open the CFEE instance where you want to install the Stratos console.
2. Click **Install Stratos Console** on the overview page. The button is visible only to users with administrator or editor permissions to that CFEE instance.
3. In the Install Stratos Console dialog, select an installation option. You can install the Stratos console application either on the CFEE control plane or in one of the cells. Select a version of the Stratos console and the number of instances of the application to install. If you install the Stratos console app in a cell, you're prompted for the organization and space where to deploy the application.
4. Click **Install**.

The application takes about 5 minutes to install. Once installation is complete, a **Stratos Console** button appears in place of the *Install Stratos Console* button on the overview page. The *Stratos Console* button launches the console and is available to all users with access to the CFEE instance. Organization and space membership assignments may limit what a user can see and manage in the Stratos console.

To start the Stratos console:

1. Open the CFEE instance where the Stratos console was installed.
2. Click **Stratos Console** on the overview page.
3. The Stratos console is opened in a separate browser tab. When you open the console for the first time, you're prompted to accept two consecutive warnings because of self-signed certificates.
4. Click **Login** to open the console. No credentials are required since the application uses your {{site.data.keyword.cloud_notm}} credentials.

## The relationship between CFEE and Kubernetes

CFEE - as an application platform - runs on some form of dedicated or shared virtual infrastructure. For many years, developers thought little about the underlying Cloud Foundry platform because IBM managed it for them. With CFEE, you are not only a developer writing Cloud Foundry applications but also an operator of the Cloud Foundry platform. This is because CFEE is deployed on an IBM Kubernetes cluster that you control.

While Cloud Foundry developers may be new to Kubernetes, there are many concepts they both share. Like Cloud Foundry, Kubernetes isolates applications into containers, which run inside a pod. And similar to application instances, pods can have multiple copies (called replica sets) with application load balancing provided by Kubernetes.  The Cloud Foundry *Hello World* application you deployed earlier runs inside the `diego-cell-0` pod. Because Cloud Foundry apps run "inside" Kuberenetes, you can communicate with additional Kubernetes microservices using Kuberenetes-based networking. The following sections will help illustrate the relationships between CFEE and Kubernetes in more detail.

## Deploy a Kubernetes service broker

In this section, you'll deploy a microservice to Kubernetes that acts as a service broker for Cloud Foundry. [Service brokers](https://github.com/openservicebrokerapi/servicebroker/blob/v2.13/spec.md) provide details on available services as well as binding and provisioning of a service to your Cloud Foundry application. This is no different than how you added the {{site.data.keyword.cloudant_short_notm}} service earlier using the built-in {{site.data.keyword.cloud_notm}} service broker.

1. Back in your terminal, clone the projects that provide Kubernetes deployment files and the service broker implementation.

  ```sh
   git clone https://github.com/IBM-Cloud/cloud-foundry-osb-on-kubernetes.git
   cd cloud-foundry-osb-on-kubernetes
   git clone https://github.com/IBM/sample-resource-service-brokers.git
  ```

2. Build and store the Docker image that contains the service broker on {{site.data.keyword.registryshort_notm}}. Use the `ibmcloud cr` command to manually retrieve the registry URL or automatically with the `export REGISTRY` command below.

  ```sh
  export REGISTRY=$(ibmcloud cr info | head -2 | awk '{ print $3 }')
  ibmcloud cr namespace-add cfee-tutorial
  docker build . -t $REGISTRY/cfee-tutorial/service-broker-impl
  docker push $REGISTRY/cfee-tutorial/service-broker-impl
  ```

3. If your container registry is different than `registry.ng.bluemix.net`, edit the `deployment.yaml` file found in `cloud-foundry-osb-on-kubernetes`. Update the `image` attribute to reflect your container registry URL.

4. Deploy the container image to CFEE's Kubernetes cluster. First find your CFEE's cluster name and export the KUBECONFIG variable using the second command. Then create the deployment.

  ```sh
  ibmcloud ks clusters
  $(ibmcloud ks cluster-config <your-cfee-cluster-name> --export)
  kubectl apply -f deployment.yaml
  ```

5. Verify the pods have STATUS as `Running`. It may take a few moments for Kubernetes to pull the image and start the containers.  Notice that you have two pods because the `deployment.yaml` has requested 2 `replicas`.

  ```sh
  kubectl get pods
  ```

## Verify the service broker is deployed

Now that you've deployed the service broker, confirm it functions properly. You'll do this in several ways: first by using the Kubernetes dashboard, then by accessing the broker from a Cloud Foundry app and finally by actually provisioning a service from the broker.

### View your pods from Kubernetes dashboard

This section will confirm that Kubernetes artifacts are configured using IBM Kubernetes Service's dashboard.

1. From the [Kubernetes Clusters](https://{DomainName}/containers-kubernetes/clusters) page, access your CFEE cluster by clicking the row item beginning with your CFEE service's name and ending with **-cluster**.

2. Open the **Kubernetes Dashboard** by clicking the corresponding button.

3. Click the **Services** link from the left menu and select **tutorial-broker-service**. This service was deployed when you ran `kubectl apply`.

4. In the resulting dashboard, notice the following:
   - The service has been provided an overlay IP address that is resolvable only within the Kubernetes cluster.
   - The service has two endpoints, which correspond to the two running pods that have the service broker implementation.

Having confirmed that the service is available and is proxying the service broker pods, you can verify the broker responds with information about available services.

### Access the broker from a Cloud Foundry container

To demonstrate Cloud Foundry to Kubernetes communication, you'll connect to the service broker directly from a Cloud Foundry application.

1. Back in your terminal, confirm you are still connected to your CFEE organization and space using `ibmcloud target`. If needed, re-target CFEE.

  ```sh
  ibmcloud target --cf
  ```

2. By default, SSH is disabled in spaces. This is different than the public cloud, so enable SSH in your space.

  ```sh
  ibmcloud cf allow-space-ssh $SPACE
  ```

3. SSH into the `GetStartedNode` application that you deployed earlier and retrieve data from the service broker. This example uses the `kubectl` command to show the same ClusterIP you saw in the Kubenetes dashboard.

  ```sh
   kubectl get service tutorial-broker-service
   ibmcloud cf ssh GetStartedNode
   export CLUSTER_IP=<ip address>
   wget --header --user TestServiceBrokerUser --password TestServiceBrokerPassword -O- http://$CLUSTER_IP/v2/catalog
  ```

4. It's likely that you received a **connection refused** error. This is due to CFEE's default [application security groups](https://docs.cloudfoundry.org/concepts/asg.html). An application security group (ASG) defines the allowable IP range for egress traffic from a Cloud Foundry container. Exit the SSH session and download the `public_networks` ASG.

  ```sh
   exit
   ibmcloud cf security-group public_networks > public_networks.json
  ```

5. Edit the `public_networks.json` file, and verify that the ClusterIP address being used falls outside of the existing rules. For example, the range `172.32.0.0-192.167.255.255` likely needs to be updated.

6. Adjust the ASG `destination` rule to include the IP address of the Kubernetes service. Trim the file to include only the JSON data beginning and ending with the brackets. Then upload the new ASG.

  ```sh
  ibmcloud cf update-security-group public_networks ./public_network.json
  ibmcloud cf restart $CF_APP
  ```

7. Repeat step 3, which should now succeed.

### Register the service broker with CFEE

To allow developers to provision and bind services from the service broker, you'll register it with CFEE. Previously you've worked with the broker using an IP address. This is problematic though. If the service broker restarts, it receives a new IP address, which requires updating CFEE. To address this problem, you'll use another Kubernetes feature called KubeDNS that provides a Fully Qualified Domain Name (FQDN) route to the service broker.

1. Register the service broker with CFEE using the FQDN of the `tutorial-service-broker` service. This route is internal to your CFEE Kubernetes cluster.
  
  ```sh
  ibmcloud cf create-service-broker my-company-broker TestServiceBrokerUser TestServiceBrokerPassword http://tutorial-broker-service.default.svc.cluster.local
  ```

2. Then add the services offered by the broker. Since the sample broker only has one mock service, a single command is needed.

   ```sh
  ibmcloud cf enable-service-access testnoderesourceservicebrokername
   ```

3. In your browser, access your Environment from the [**Environments**](https://{DomainName}/dashboard/cloudfoundry?filter=cf_environments) page and navigate to the `dev` space you created previously.

4. Select the **Services** tab and the **Create Service** button.

5. In the search texbox, search for **Test**. The mock service from the broker will display.

6. Click the **Create** button and provide a name to create a service instance. You can also bind the service to the **$APP_NAME** created earlier using the **Bind to appliction** item in the overflow menu.

TODO I'll look into binding the mock service with GetStartedNode app to see if there's anything the two can do together.

## Related content

{:related}

- ToDo