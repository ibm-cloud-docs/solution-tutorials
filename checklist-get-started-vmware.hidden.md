---
copyright:
  years: 2022

lastupdated: "2022-11-01"

keywords:

subcollection: overview

---

{{site.data.keyword.attribute-definition-list}}

# Getting started with VMware checklist
{: #get-started-vmware-checklist}

Before getting started in this section, ensure that you have created and upgraded your account to a paid account. You should also be familiar with all the tasks from the [Getting started on IBM Cloud checklist](https://{DomainName}/docs/overview?topic=overview-get-started-checklist).

## Exploring the {{site.data.keyword.vmwaresolutions_short}} offerings
{: #exploring}

| Task | Description |
|------|-------------|
| ![Checklist](images/checklist-hidden/checklist.svg)  | **{{site.data.keyword.cloud_notm}} overview** \n Gain an understanding of {{site.data.keyword.cloud_notm}} by reading through this [documentation topic](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-under_the_hood).  |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Deployment offerings**. \n There are a number of options for VMware deployment in {{site.data.keyword.cloud_notm}}: Classic Infrastructure (sometimes refered as {{site.data.keyword.cloud_notm}} Infrastructure) and {{site.data.keyword.cloud_notm}} Virtual Private Cloud. Review the [description of the offerings](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-getting-started#getting-started-depl-offerings) for {{site.data.keyword.vmwaresolutions_short}} and determine the best option for your company. Note: Deploying VMware on Virtual Private Cloud is currently a manual process that is documented in a [tutorial](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-vpc-bm-vmware) and as a result is not available in the {{site.data.keyword.vmwaresolutions_short}} console as a deployment option.  |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Review solution architectures on Classic Infrastructure** \n Review reference architecture [documentation](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-solution_overview) based on {{site.data.keyword.cloud_notm}} Infrastructure. |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Roll-your-own VMware on Virtual Private Cloud** \n The {{site.data.keyword.bm_is_full_notm}} provides you compute capacity to host VMware workloads in the {{site.data.keyword.vpc_short}}. Review the reference architecture [documentation](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-ryo-overview) for roll-your-own VMware on {{site.data.keyword.vpc_short}}. |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **VMware Cloud Foundation (VCF) on Virtual Private Cloud** \n VCF is based on a comprehensive software-defined stack, which includes VCF with VMware Tanzu™, VMware vSAN™, VMware NSX-T™ Data Center, and VMware vRealize® Suite. It provides a complete set of software-defined services for compute, storage, network security, Kubernetes management, and cloud management. Review the reference architecture [documentation](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vpc-vcf-overview) for your VPC deployment on {{site.data.keyword.vpc_short}}. |
{: caption="Table 1. Exploring the {{site.data.keyword.vmwaresolutions_short}} offerings" caption-side="top"} 


## {{site.data.keyword.vmwaresolutions_short}} - Deploying on Classic Infrastructure
{: #vmware-classic-infrastructure}

| Task | Description |
|------|-------------|
| ![Checklist](images/checklist-hidden/checklist.svg) | **Reviewed and performed the steps in Connecting your network to {{site.data.keyword.cloud_notm}}** \n Make sure to have at minimum reviewed the tasks in [Connecting your network to {{site.data.keyword.cloud_notm}}](https://{DomainName}/docs/overview?topic=overview-get-started-checklist). You should have at least enabled your account for VRF and service endpoints.  |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Requirements for the IBM Cloud infrastructure account** \n The {{site.data.keyword.cloud_notm}} classic infrastructure account that you are using must have certain permissions to be able to order the resources in your {{site.data.keyword.vmwaresolutions_short}} instances and perform operations on your behalf. The permission requirements are applicable to all types of instances and services that you are ordering using the {{site.data.keyword.vmwaresolutions_full_notm}} console. Review the [permissions requirements](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-cloud-infra-acct-req) documentation topic and refer to the [Managing classic infrastructure access](https://{DomainName}/docs/account?topic=account-vrf-service-endpoint&interface=ui#vrf) for general steps on assigning permissions in the account. |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Create a classic infrastructure API key** \n {{site.data.keyword.vmwaresolutions_short}} communicates with the IBM Cloud infrastructure account through API calls. To access the API securely, you must link the {{site.data.keyword.vmwaresolutions_short}} console to the credentials of your IBM Cloud infrastructure account. You can use an API key to access classic infrastructure APIs. Folow the steps to [create a classic infrastructure API key](https://{DomainName}/docs/account?topic=account-classic_keys#create-classic-infrastructure-key) and then [Update the credentials](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-useraccount&interface=ui) in the {{site.data.keyword.vmwaresolutions_short}} console. |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Managing user accounts and settings** \n {{site.data.keyword.vmwaresolutions_short}} is integrated with {{site.data.keyword.cloud_notm}} Identity and Access Management (IAM) for collaboration among multiple users. Access to service instances for the users in your account is controlled by IAM. Every user that accesses the {{site.data.keyword.vmwaresolutions_short}} services in your account must be assigned an access policy with an IAM user role defined. Follow the steps in this [documentation topic](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-iam&interface=ui) to assign permissions to users in the account. |
| ![Checklist](images/checklist-hidden/checklist.svg) | **Order a {{site.data.keyword.vmwaresolutions_short}} instance** \n  Order an instance based on your selected deployment: \n * [Ordering virtual data center instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-shared_ordering). \n * [Ordering vCenter Server instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vc_orderinginstance-req). \n * [Ordering vSphere clusters](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vs_orderinginstances-req). \n * [Ordering VMware Regulated Workloads instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vrw-orderinginstance-req).   |
| ![Checklist](images/checklist-hidden/checklist.svg)  | **View the instance** \n After your instance is deployment, see the following topics based on your selected deployment: \n * [Viewing and managing virtual data center instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-shared_viewing-vdc-summary). \n * [Viewing vCenter Server instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vc_viewinginstances) \n * [Viewing vSphere clusters](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vc_viewinginstances). \n * [Viewing VMware Regulated Workloads instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vrw-view-delete-instance).  |
{: caption="Table 2. Getting started tasks for VMware on {{site.data.keyword.cloud_notm}} Classic Infrastructure" caption-side="top"} 

For additional resources on related topics that may be of interest, please see the table below:
* [Order VMware Solutions Shared Reserved](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-shared_ordering#shared_ordering-procedure-reserved)
* [Order VMware Solutions Shared on-demand](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-shared_ordering#shared_ordering-procedure-ondemand)
* [Order vCenter Server instances](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vc_orderinginstance-procedure)
* [Order vSphere clusters](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vs_orderinginstances-procedure)
* [Order VMware Regulated Workloads](https://{DomainName}/docs/vmwaresolutions?topic=vmwaresolutions-vrw-orderinginstance-procedure)
* [Deployment Journey for VMware on IBM Cloud](https://{DomainName}/docs/vmware-classic-journey)


## {{site.data.keyword.vmwaresolutions_short}} - Deploying on Virtual Private Cloud
{: #vmware-vpc}

| Task | Description |
|------|-------------|
| ![Checklist](images/checklist-hidden/checklist.svg)  | **Reviewed and performed the steps in Connecting your network to {{site.data.keyword.cloud_notm}}** Make sure to have at minimum reviewed the tasks in [Connecting your network to {{site.data.keyword.cloud_notm}}](https://{DomainName}/docs/overview?topic=overview-get-started-checklist). You should have at least enabled your account for VRF and service endpoints.  |
{: caption="Table 1. Getting started tasks for VMware on {{site.data.keyword.cloud_notm}} Virtual Private Cloud" caption-side="top"} 

For additional resources on related topics that may be of interest, please see the table below: