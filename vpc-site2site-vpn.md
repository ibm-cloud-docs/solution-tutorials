---
subcollection: solution-tutorials
copyright:
  years: 2021
lastupdated: "2021-11-15"
lasttested: "2021-11-15"

content-type: tutorial
services: schematics, vpc, cloud-object-storage, databases-for-postgresql, dns-svcs
account-plan: paid
completion-time: 2h
---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}
{:important: .important}
{:note: .note}

# Use a VPC/VPN gateway for secure and private on-premises access to cloud resources
{: #vpc-site2site-vpn}
{: toc-content-type="tutorial"}
{: toc-services="schematics, vpc, cloud-object-storage, databases-for-postgresql, dns-svcs"}
{: toc-completion-time="2h"}

<!--##istutorial#-->
This tutorial will incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}

<!--#/istutorial#-->

IBM offers a number of ways to securely extend an on-premises computer network with resources in the {{site.data.keyword.cloud_notm}}. This allows you to benefit from the elasticity of provisioning cloud resources when you need them and removing them when no longer required. Moreover, you can easily and securely connect your on-premises capabilities to the {{site.data.keyword.cloud_notm}} services.

This tutorial provides the automation to create resources that demonstrate Virtual Private Network (VPN) connectivity between on-premises servers and cloud resources like {{site.data.keyword.vpc_full}} Virtual Service Instances (VSIs) and {{site.data.keyword.cloud_notm}} data services.  DNS resolution to cloud resources is also configured. The popular [strongSwan](https://www.strongswan.org/) VPN Gateway is used to represent the on-premises VPN gateway.
{: shortdesc}


## Objectives
{: #vpc-site2site-vpn-objectives}

* Access a virtual private cloud environment from an on-premises data center.
* Securely reach cloud services using private service endpoints.
* Use DNS on-premises to access cloud resources over VPN

The following diagram shows the resources created by this tutorial

![Architecture](images/solution46-vpc-vpn/vpc-site2site-vpn-tutorial.png){: class="center"}
{: style="text-align: center;"}

A terraform configuration will create the following resources:

1. The infrastructure (VPC, Subnets, Security Groups with rules, Network ACL and VSIs)
2. The {{site.data.keyword.cos_short}} and {{site.data.keyword.databases-for-postgresql}} private endpoint gateways to data services.
3. The strongSwan open source IPsec gateway software is used on-premises to establish the VPN connection with the cloud environment.
4. A VPC/VPN Gateway is provisioned to allow private connectivity between on-premises resources and cloud resources.
6. The on-premises DNS resolver is connected to the cloud DNS Resolver Location to allow tls access to cloud resources including [access to service endpoints using VPN](https://{DomainName}/docs/vpc?topic=vpc-build-se-connectivity-using-vpn)

## Before you begin
{: #vpc-site2site-vpn-prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} CLI,
   * {{site.data.keyword.vpc_short}} plugin (`vpc-infrastructure`),
* `jq` to query JSON files,
* `git` to clone source code repository to optionally deploy an example microservice application,
* `Terraform CLI` to optionally run Terraform on your desktop instead of the schematics service

The on-premises data center in this tutorial will be simulated using a VSI within a VPC.

The preferred mechanism to connect VPCs is [{{site.data.keyword.tg_short}}](https://{DomainName}/interconnectivity/transit). Simulation of an on premises environment with VPC, VSI and VPN is used only for illustration.
{: note}

<!--##istutorial#-->
You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.
<!--#/istutorial#-->

In addition:
- check for user permissions. Be sure that your user account has sufficient permissions to create and manage VPC resources. For a list of required permissions, see [Granting permissions needed for VPC users](/docs/vpc?topic=vpc-managing-user-permissions-for-vpc-resources).
- you need an SSH key to connect to the virtual servers. If you don't have an SSH key, see the [instructions for creating a key](/docs/vpc?topic=vpc-getting-started#prereqs).
- you need another SSH key to connect to the classic infrastructure virtual server. If you don't have such an SSH key, see [Adding an SSH key](https://{DomainName}/docs/ssh-keys?topic=ssh-keys-adding-an-ssh-key).

## Use {{site.data.keyword.bpshort}}  to create the resources
1. Navigate to [{{site.data.keyword.bpshort}} Workspaces](https://{DomainName}/schematics/workspaces), click on **Create workspace**.
   1. Under the **Specify Template** section, provide `https://github.com/IBM-Cloud/vpc-tutorials/tree/master/vpc-site2site-vpn` under GitHub or GitLab repository URL. 
   1. Select **terraform_v1.1** as the Terraform version and click *Next.
2. Under **Workspace details**,
   1. Provide a workspace name : **vpnsts**.
   2. Choose a `Resource Group` and a `Location`.
   3. Click on **Next**.
3. Verify the details and then click on **Create**.
4. Under **Variables**, provide the required values (**resource_group_name**, **ssh_key_name**) by clicking the edit for each row.  The variable **maintenance** must be true.
7. Scroll to the top of the page and click **Apply plan**. Check the logs to see the status of the services created.

## Verify connectivity
The schematics workspace output contains a script that you can use to verify the VPN connectivity.

```
# get the list of workspaces, note the ID column, set the shell variable:
ibmcloud schematics workspace list
WORKSPACE_ID=YOUR_WORKSPACE_ID
...

# get the example script
ibmcloud schematics output --id $WORKSPACE_ID --output json | jq -r '.[0].output_values[].connectivity_verification.value'
```

The output will look something like the following.  You can now follow the instructions and verify the connectivity:

```
# if the ssh key is not the default for ssh try the -I PATH_TO_PRIVATE_KEY_FILE option

#-----------------------------------
# IP and hostname variables
#-----------------------------------
IP_FIP_ONPREM=150.240.65.214
IP_PRIVATE_ONPREM=10.0.0.4
IP_PRIVATE_CLOUD=10.1.1.4
IP_FIP_BASTION=52.116.143.204
IP_PRIVATE_BASTION=10.1.0.4
IP_DNS_SERVER_0=10.1.0.5
IP_DNS_SERVER_1=10.1.1.7
IP_ENDPOINT_GATEWAY_POSTGRESQL=10.1.1.6
IP_ENDPOINT_GATEWAY_COS=10.1.1.5
HOSTNAME_POSTGRESQL=1d054183-4def-40c8-ba19-36430a4742a2.b2b5a92ee2df47d58bad0fa448c15585.private.databases.appdomain.cloud
HOSTNAME_COS=s3.direct.us-south.cloud-object-storage.appdomain.cloud

#-----------------------------------
# Test access
#-----------------------------------
# onprem VSI
ssh root@$IP_FIP_ONPREM
exit

#-----------------------------------
# cloud bastion
ssh root@$IP_FIP_BASTION
exit

#-----------------------------------
# cloud VSI through bastion
ssh -J root@$IP_FIP_BASTION root@$IP_PRIVATE_CLOUD
exit

#-----------------------------------
# cloud VSI through onprem, through the VPN tunnel, through bastion
ssh -J root@$IP_FIP_ONPREM,root@$IP_FIP_BASTION root@$IP_PRIVATE_CLOUD
exit

#-----------------------------------
# onprem VSI through bastion, through cloud VSI, through VPN tunnel
ssh -J root@$IP_FIP_BASTION,root@$IP_PRIVATE_CLOUD root@$IP_PRIVATE_ONPREM
exit

#-----------------------------------
# Test DNS resolution to postgresql and object storage through the Virtual Endpoint Gateway
#-----------------------------------
ssh root@$IP_FIP_ONPREM
HOSTNAME_POSTGRESQL=1d054183-4def-40c8-ba19-36430a4742a2.b2b5a92ee2df47d58bad0fa448c15585.private.databases.appdomain.cloud
HOSTNAME_COS=s3.direct.us-south.cloud-object-storage.appdomain.cloud
# should resolve to $IP_ENDPOINT_GATEWAY_POSTGRESQL
dig $HOSTNAME_POSTGRESQL
# the telnet should display "connected" but ths is postgresql not a telent server so telnet is not going to work
telnet $HOSTNAME_POSTGRESQL 32610
# <control><c>

# Test DNS resolution to cloud object storage through the Virtual Endpoint Gateway
dig $HOSTNAME_COS
telnet $HOSTNAME_COS 443
# <control><c>
exit

...

```

Using the ibm cloud console you can visit the resources created
- [Resource list](https://{DomainName}/resources)
   - Services and software - Databases for postgresql
   - Services and software - DNS services (check out the Custom resolver)
   - Storage - Cloud object storage
- [Virtual private endpoint gateways for VPC](https://{DomainName}/vpc-ext/network/endpointGateways)

## Optionally deploy a virtual app server in a virtual private cloud
{: #vpc-site2site-vpn-deploy}
{: step}

Automated deployment of an application with associated credentials and certificates is beyond the scope of this tutorial but here is an example with manual steps that need to be automated:

1. Get the application's code:
   ```sh
   git clone https://github.com/IBM-Cloud/vpc-tutorials
   ```
   {: codeblock}

2. Go to the directory for the sample application.
   ```sh
   cd vpc-tutorials/sampleapps/nodejs-graphql
   ```
   {: codeblock}

3 get the script to deploy application and test.
   ```sh
   ibmcloud schematics output --id $WORKSPACE_ID --output json | jq -r '.[0].output_values[].application_deploy_test.value'
   ```
   {: codeblock}

   The output will look something like the following.  Follow the instructions. Be careful not to share the credentials to the data stores.
   ```sh
   #-----------------------------------
   # Configure the microservice by adding credentials and certificates
   #-----------------------------------
   # verify you are in the .../vpc-tutorials/sampleapps/nodejs-graphql directory
   pwd
   # create credentials
   ibmcloud resource service-key 4f37f39b-db7d-49a8-859a-51475064f7fa --output json > config/pg_credentials.json
   ibmcloud resource service-key a65f4239-e6ed-43a1-8ce3-73ff59a5abbb --output json > config/cos_credentials.json
   # create postgresql certificates
   ibmcloud cdb deployment-cacert crn:v1:bluemix:public:databases-for-postgresql:us-south:a/123:456:: -e private -c . -s
   
   #-----------------------------------
   # copy the application to the cloud and onprem VSIs
   #-----------------------------------
   scp -J root@$IP_FIP_BASTION -r ../nodejs-graphql root@$IP_PRIVATE_CLOUD:
   scp -r ../nodejs-graphql root@$IP_FIP_ONPREM:
   
   #-----------------------------------
   # run microservice on the cloud VSI
   #-----------------------------------
   ssh -J root@$IP_FIP_BASTION root@$IP_PRIVATE_CLOUD
   cd nodejs-graphql
   npm install
   npm run build
   # copy and optionally touch up a little (not required)
   cp config/config.template.json config/config.json
   node ./build/createTables.js
   node ./build/createBucket.js
   # notice the unique bucket name
   vi config/config.json; # change the bucketName
   # start the application
   npm start
   
   #-----------------------------------
   # Test the microservice from the onprem VSI (over the VPN), on a different terminal
   #-----------------------------------
   IP_FIP_ONPREM=150.240.65.214
   ssh root@$IP_FIP_ONPREM
   IP_PRIVATE_CLOUD=10.1.1.4
   # exect empty array from postgresql
   curl -X POST -H "Content-Type: application/json" --data '{ "query": "query read_database { read_database { id balance transactiontime } }" }' http://$IP_PRIVATE_CLOUD/api/bank
   # expect empty array from object storage
   curl -X POST -H "Content-Type: application/json" --data '{ "query": "query read_items { read_items { key size modified } }" }' http://$IP_PRIVATE_CLOUD/api/bank
   # add a record to postgresql and object storage
   curl -X POST -H "Content-Type: application/json" --data '{ "query": "mutation add_to_database_and_storage_bucket { add(balance: 10, item_content: \"Payment for movie, popcorn and drink...\") { id status } }" }' http://$IP_PRIVATE_CLOUD/api/bank
   # read the records in postgresql and object storage
   curl -X POST -H "Content-Type: application/json" --data '{ "query": "query read_database_and_items { read_database { id balance transactiontime } read_items { key size modified } }" }' http://$IP_PRIVATE_CLOUD/api/bank
   
   # test access to postgresql over the private endpoint gateway
   cd ~/nodejs-graphql
   PGPASSWORD=abc PGSSLROOTCERT=xyz psql 'host=hhh.private.databases.appdomain.cloud port=32610 dbname=ibmclouddb user=ibm_cloud_123 sslmode=verify-full'
   exit

#-----------------------------------
# Back in the cloud VSI terminal session
#-----------------------------------
# <control><c>
exit
   ```
   {: codeblock}


4. Using your browser, access the [Resource List](https://{DomainName}/resources), navigate to the **Storage** category and open the `vpns2s-cos` {{site.data.keyword.cos_short}}.  You can open the storage bucket that was created and view the file that was added by the API server along with the metadata associated with it.


## Optionally expand the tutorial
{: #vpc-site2site-vpn-expand-tutorial}

Want to add to or extend this tutorial? Here are some ideas:

- You already have a DNS Service, [add a DNS zone](https://cloud.ibm.com/docs/dns-svcs?topic=dns-svcs-getting-started) for the application you deployed
- Add a [load balancer](/docs/vpc?topic=vpc-nlb-vs-elb) to distribute inbound microservice traffic across multiple instances.
- Deploy the [application on a public server, your data and services on a private host](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-public-app-private-backend).

## Remove resources
{: #vpc-site2site-vpn-remove-resources}
{: step}

1. Navigate to [{{site.data.keyword.bpshort}} Workspaces](https://{DomainName}/schematics/workspaces), click on your workspace
1. Click **Actions... > Destroy resources**
1. Click **Actions... > Delete workspace**


## Related content
{: #vpc-site2site-vpn-related}

- [IBM Cloud CLI plugin for VPC Reference](/docs/vpc?topic=vpc-infrastructure-cli-plugin-vpc-reference)
- [VPC using the REST APIs](/docs/vpc?topic=vpc-creating-a-vpc-using-the-rest-apis)
- Solution tutorial: [Securely access remote instances with a bastion host](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server)
