---
subcollection: solution-tutorials
copyright:
  years: 2020
lastupdated: "2020-05-15"
lasttested: "2020-05-15"
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
{:important: .important}
{:note: .note}

# Getting Started with {{site.data.keyword.vmwaresolutions_short}} Shared
{: #vmware-solutions-shared-getting-started}

On {{site.data.keyword.Bluemix_notm}} there are a number of [deployment offerings](https://{DomainName}/docs/services/vmwaresolutions?topic=vmware-solutions-getting-started#getting-started-depl-offerings) for VMware that you can choose from, with each providing a different level of abstraction. VMware vCloud Director is offered under the banner of {{site.data.keyword.vmwaresolutions_short}} Shared. It is a multi-tenant service with elasticity and two subscription types: 
  - On-demand where vCPU and RAM are allocated as needed and priced on an hourly basis.
  - Reserved where vCPU and RAM are pre-allocated and priced on a monthly basis. 

{:shortdesc}

## Objectives
{: #objectives}

* Create and explore a {{site.data.keyword.vmwaresolutions_short}} Shared instance in the {{site.data.keyword.Bluemix_notm}}.
* Create a {{site.data.keyword.bpshort}} workspace in the {{site.data.keyword.Bluemix_notm}} to run Infrastructure as Code(IaC) based on Terraform.
* Use {{site.data.keyword.bpshort}} to create a network, firewall and SNAT rules, and deploy a virtual machine instance in VMware Virtual Data Center via a Terraform template.

## Services used
{: #services}

This tutorial uses the following services:
* [{{site.data.keyword.vmwaresolutions_short}} Shared](https://{DomainName}/infrastructure/vmware-solutions/console)
* [{{site.data.keyword.bpshort}}](https://{DomainName}/catalog/services/schematics)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">
  ![Architecture](images/solution58-vmware-solutions-getting-started/Architecture.png)
</p>

1. Create a {{site.data.keyword.bpshort}} Workspace using the {{site.data.keyword.Bluemix_notm}} console.
2. Create a {{site.data.keyword.vmwaresolutions_short}} Shared using the {{site.data.keyword.Bluemix_notm}} console.
3. Review a Terraform template that will be used to create various resources in VMware virtual data center (VCD).
4. Use the {{site.data.keyword.bplong_notm}} service to run the template and to create the instance in the VCD.


## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} Pay-As-You-Go account,

  A GitHub account is optional and only required if you plan on modifying the provided Terraform template beyond the steps outlined in this tutorial.
  {:tip}

## Create services
{: #setup}

Login to {{site.data.keyword.cloud_notm}} via a web browser, we will create the {{site.data.keyword.vmwaresolutions_short}} Shared and {{site.data.keyword.bplong_notm}} services via the UI and later on will use a Terraform template to configure networking in the VMware vCloud Director and deploy a virtual machine.

#### {{site.data.keyword.vmwaresolutions_short}} Shared
{: #create-vmware-solutions-shared}

1. Create an instance of [{{site.data.keyword.vmwaresolutions_short}} Shared](https://{DomainName}/infrastructure/vmware-solutions/console).
2. In the Start Provisioning section, click the {{site.data.keyword.vmwaresolutions_short}} Shared card.
3. For **Pricing Plans**, select `On-Demand`.
4. Enter the virtual data center name, i.e. `vmware-tutorial`.
5. Select the {{site.data.keyword.Bluemix_notm}} data center to host the instance, i.e. `Dallas`.
6. Select the capacity for your **Virtual data center**, we will not need much for this tutorial, set for `4 vCPU` for the **vCPU Limit** and `16 GB` for the **RAM Limit**. You can increase or reduce the capacity as needed later on. 
7. On the Summary pane, verify the configuration and estimated cost before you place the order.
8. After having read and agreed to the third-part service agreements, click on **Create**.

#### Access the {{site.data.keyword.vmwaresolutions_short}} Shared Instance
{: #access-vmware-solutions-shared}

1. Navigate to your [{{site.data.keyword.vmwaresolutions_short}} Shared instances](https://cloud.ibm.com/infrastructure/vmware-solutions/console/instances).
2. Click on the newly created instance `vmware-tutorial`.
3. Click on **Set Organization Admin Password**, set a password (`vcd_password`) for the **admin** user (`vcd_user`).
4. With your password created, click on the **vCloud Director console** button found on the top right of the page.
5. In the left navigation click on **Edges** under the **Networking** category.  Take note of the name of the edge gateway (`vdc_edge_gateway_name`). 
6. In the menu bar, click on the hamburger menu and select **Administration**, click on **General** under the **Settings** category and take note of the **Organization name**. It is your virtual cloud director organization (`vcd_org`).


## Review the Terraform template
{: #review_terraform_template}

Introductory statement that overviews the section

1. Step 1 Click **This** and enter your name.

  This is a tip.
  {:tip}

### Create a routed network

Introductory statement that overviews the section...

   ```hcl
    # Create a routed network
    resource "vcd_network_routed" "tutorial_network" {

      name         = "Tutorial-Network"
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      gateway      = "192.168.100.1"

      interface_type = "distributed"

      static_ip_pool {
        start_address = "192.168.100.5"
        end_address   = "192.168.100.254"
      }

      dns1 = "9.9.9.9"
      dns2 = "1.1.1.1"
    }
   ```
   {: pre}


### Create SNAT rules

Introductory statement that overviews the section...

   ```hcl
   # Create SNAT rule to access the Internet
    resource "vcd_nsxv_snat" "rule_internet" {
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      network_type = "ext"
      network_name = module.ibm_vmware_solutions_shared_instance.default_gateway_network

      original_address   = "${vcd_network_routed.tutorial_network.gateway}/24"
      translated_address = module.ibm_vmware_solutions_shared_instance.default_external_network_ip
    }

    # Create SNAT rule to access the IBM Cloud services over a private network
    resource "vcd_nsxv_snat" "rule_ibm_private" {
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      network_type = "ext"
      network_name = module.ibm_vmware_solutions_shared_instance.external_networks_2

      original_address   = "${vcd_network_routed.tutorial_network.gateway}/24"
      translated_address = module.ibm_vmware_solutions_shared_instance.external_network_ips_2
    }
   ```
   {: pre}


### Create VM section

Introductory statement that overviews the section...

   ```hcl
   # Create vcd App
    resource "vcd_vapp" "vmware_tutorial_vapp" {
      name = "vmware-tutorial-vApp"
    }

    # Connect org Network to vcpApp
    resource "vcd_vapp_org_network" "tutorial_network" {
      vapp_name        = vcd_vapp.vmware_tutorial_vapp.name
      org_network_name = vcd_network_routed.tutorial_network.name
    }

    # Create VM
    resource "vcd_vapp_vm" "vm_1" {
      vapp_name     = vcd_vapp.vmware_tutorial_vapp.name
      name          = "vm-centos8-01"
      catalog_name  = "Public Catalog"
      template_name = "CentOS-8-Template-Official"
      memory        = 8192
      cpus          = 2

      guest_properties = {
        "guest.hostname" = "vm-centos8-01"
      }

      network {
        type               = "org"
        name               = vcd_vapp_org_network.tutorial_network.org_network_name
        ip_allocation_mode = "POOL"
        is_primary         = true
      }
    }
   ```
   {: pre}

## Deploy using Schematics
{: #deploy_using_schematics}

Introductory statement that overviews the section

#### 	{{site.data.keyword.bplong_notm}}
{: #create-schematics}

{{site.data.keyword.bplong_notm}} delivers Terraform-as-a-Service so that you can use a high-level scripting language to model the resources that you want in your {{site.data.keyword.Bluemix_notm}} environment, and enable Infrastructure as Code (IaC). We will use {{site.data.keyword.bpshort}} to automate the process of creating/deleting virtual server in our vCloud Directory virtual data center. 

1. Navigate to the [{{site.data.keyword.bplong_notm}}](https://{DomainName}/schematics/overview) overview page and click **Create a workspace**.
2. Enter the workspace name for your workspace, i.e. `vmware-tutorial`.
   - Select the resource group and location of the workspace, you can also add tags and description as needed.
   - Click **Create** to create your workspace. Your workspace is created with a Draft state and the workspace Settings page opens.
3. Connect your workspace to the GitHub source repository where our Terraform template for this tutorial are stored.
   - On the workspace Settings page, enter the link to our GitHub repository, `https://github.com/IBM-Cloud/vmware-solutions-shared`. 
   - Select `terraform_v0.12` as the **Terraform version**.
   - Click **Save template information**. 
4. In the Input variables section, enter the information that were previously captured from the VMware vCloud Director console. 
  
    Some values have defaults which are appropriate to keep for this tutorial, replace those with `your_xxx`.
    {:tip}

    <table>
      <thead>
        <tr>
          <td><strong>Name</strong></td>
          <td><strong>Description</strong></td>
          <td><strong>Type</strong></td>
          <td><strong>Default</strong></td>
          <td><strong>Sensitive</strong></td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>vcd_user</td>
          <td>Enter the vCloud Director username</td>
          <td>string</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>vcd_password</td>
          <td>Enter vCloud Director instance password</td>
          <td>string</td>
          <td></td>
          <td>yes</td>
        </tr>
        <tr>
          <td>vcd_org</td>
          <td>Enter vCloud Director organization name/id</td>
          <td>string</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>vcd_url</td>
          <td>Enter the vCloud Director url</td>
          <td>string</td>
          <td>https://daldir01.vmware-solutions.cloud.ibm.com/api</td>
          <td></td>
        </tr>
        <tr>
          <td>vdc_edge_gateway_name</td>
          <td>Enter vCloud Director virtual datacenter edge gateway name</td>
          <td>string</td>
          <td></td>
          <td>yes</td>
        </tr>
        <tr>
          <td>vdc_name</td>
          <td>Enter vCloud Director virtual data center name/id</td>
          <td>string</td>
          <td>vmware-tutorial</td>
          <td></td>
        </tr>        
      </tbody>
    </table>

    Set the Sensitive flag for the `vcd-password` variable to that the value is not displayed in the workspace and/or logs.
    {:tip}

5. Click Save changes.
6. Scroll to the top of the page and click on **Generate Plan** to create the execution plan, review the logs and confirm it was successful.
7. Click on **Apply plan**.
8. Click on **View log** next to the current running plan to follow the logs.
9. Wait for the plan to complete and check the Outputs from the log for the application the password to the deployed virtual machine, note you will be prompted to change the password on first use. 

## Remove resources
{: #removeresources}

1. Navigate to [{{site.data.keyword.bpshort}}](https://{DomainName}/schematics/workspaces) workspaces.
2. Click on the action menu next to the `vmware-tutorial` workspace.
3. Click on **Delete**, check all the Delete options, enter the name of the workspace and click **Delete** to cleanup all the provisioned resources.

## Expand the tutorial 

Want to add to or change this tutorial? Here are some ideas:
- Create a fork of the `vmware-solutions-shared` repository and modify it to include additional virtual machine and update your Schematics workspace to use it. 
- 

## Related content
{: #related}

* [Relevant links in {{site.data.keyword.vmwaresolutions_short}} docs](https://{DomainName}/docs/vmwaresolutions?topic=vmware-solutions-shared_overview)
* [Relevant links in {{site.data.keyword.bpshort}} docs](https://{DomainName}/docs/schematics?topic=schematics-getting-started)
