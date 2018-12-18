---
copyright:
  years: 2018
lastupdated: "2018-12-18"

---

## The relationship between CFEE and Kubernetes

CFEE - as an application platform - runs on some form of physical or virtual infrastructure. For many years, developers thought little about the underlying Cloud Foundry platform because IBM managed it for them. With CFEE, you are not only a developer writing Cloud Foundry applications but also an operator of the Cloud Foundry platform. This is because CFEE is deployed on an IBM Kubernetes cluster that you control.

While Cloud Foundry developers may be new to Kubernetes, there are many concepts they both share. Like Cloud Foundry, Kubernetes isolates applications into containers, which run inside a pod. And similar to application instances, pods can have multiple copies (called replica sets) with application load balancing provided by Kubernetes.  The Cloud Foundry applications you deployed earlier run inside the `diego-cell-0` pod. Because these Cloud Foundry apps run "inside" Kuberenetes, you can communicate with additional Kubernetes microservices using Kuberenetes-based networking. The following sections will help illustrate the relationships between CFEE and Kubernetes in more detail.

## Deploy a Kubernetes service broker

In this section, you'll deploy a microservice to Kubernetes that acts as a service broker for Cloud Foundry. [Service brokers](https://github.com/openservicebrokerapi/servicebroker/blob/v2.13/spec.md) provide details on available services as well as binding and provisioning of a service to your Cloud Foundry application. This is no different than how you added the Cloudant service earlier, which used the default IBM Cloud service broker.

1. Clone the projects that provide Kubernetes deployment files and the service broker implementation.

  ```sh
   git clone https://github.com/IBM-Cloud/cloud-foundry-osb-on-kubernetes.git
   cd cloud-foundry-osb-on-kubernetes
   git clone https://github.com/IBM/sample-resource-service-brokers.git
  ```

2. Build and store the Docker image that contains the service broker on IBM Container Registry. Use the `ibmcloud cr` command to manually retrieve the registry URL or automatically with the `export REGISTRY` command below.

  ```sh
  export REGISTRY=$(ibmcloud cr info | head -2 | awk '{ print $3 }')
  ibmcloud cr namespace-add cfee-tutorial
  docker build . -t $REGISTRY/cfee-tutorial/service-broker-impl
  docker push $REGISTRY/cfee-tutorial/service-broker-impl
  ```

3. If your container registry is different than `registry.ng.bluemix.net`, edit the `deployment.yaml` file found in `cloud-foundry-osb-on-kubernetes`. Update the `image` attribute to reflect your container registry URL.

4. Deploy the container image to CFEE's Kubernetes cluster.

  ```sh
  $(ibmcloud ks cluster-config cfee-tutorials-cluster --export)
  kubectl apply -f deployment.yaml
  ```

5. Verify the pods have STATUS as `Running`. It may take a few moments for Kubernetes to pull the image and start the containers.  Note that you'll have two pods because the `deployment.yaml` has requested 2 `replicas`.

  ```sh
  kubectl get pods
  ```

## Verify the service broker is deployed

Now that you've deployed the service broker, confirm it functions properly. You'll do this in several ways: first by using the Kubernetes dashboard, then by accessing the broker from a Cloud Foundry app and finally by actually provisioning a service from the broker.

### View your pods from Kubernetes dashboard

This section will confirm that Kubernetes artifacts are configured using IBM Kubernetes Service's dashboard.

1. Access your CFEE cluster by clicking the row item with the name **CLUSTER-NAME** from the [Clusters](https://{DomainName}/containers-kubernetes/clusters) page.

2. Open the **Kubernetes Dashboard** by clicking the corresponding button.

3. Click the **Services** link from the left menu and select **tutorial-broker-service**. This service was deployed when you ran `kubectl apply`.

4. In the resulting dashboard, notice the following:
   - The service has been provided an overlay IP address that is resolvable only within the Kubernetes cluster.
   - The service has two endpoints, which correspond to the two running pods that have the service broker implementation.

Having confirmed that the service is available and is proxying the service broker pods, you can verify the broker responds with information about available services.

### Access the broker from a Cloud Foundry container

To demonstrate Cloud Foundry to Kubernetes communication, you'll connect to the service broker directly from a Cloud Foundry application.

1. Back in your terminal, login to IBM Cloud target your CFEE organization and space.

  ```sh
  ibmcloud login
  ibmcloud target -o $ORG -s $SPACE
  ```

2. By default, SSH is disabled in spaces. This is different than the public cloud, so enable SSH in your space.

  ```sh
  ibmcloud cf allow-space-ssh $SPACE
  ```

3. SSH into the application that you deployed earlier and retrieve data from the service broker. This example uses the `kubectl` command to obtain the same ClusterIP you saw in the Kubenetes dashboard.

  ```sh
   kubectl get service tutorial-broker-service
   ibmcloud cf ssh $CF_APP
   export CLUSTER_IP=<ip address>
   wget --header --user TestServiceBrokerUser --password TestServiceBrokerPassword -O- http://$CLUSTER_IP/v2/catalog
  ```

4. It's likely that you received a `connection refused` error. This is due to CFEE's default [application security groups](https://docs.cloudfoundry.org/concepts/asg.html). An application security group (ASG) defines the allowable IP range for egress traffic from a Cloud Foundry container. Exit the SSH session and download the `public_networks` ASG.

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

3. In your browser, access your **CFEE-INSTANCE** from the [**Environments**](https://{Domain}/dashboard/cloudfoundry?filter=cf_environments) page and navigate to the space you created previously.

4. Select the **Services** and **Create Service** button.

5. In the search texbox, search for **Test**. The mock service from the broker will display.

6. Click the **Create** button and provide a name to create a service instance. You can also bind the service to the **$APP_NAME** created earlier using the **Bind to appliction** item in the overflow menu.