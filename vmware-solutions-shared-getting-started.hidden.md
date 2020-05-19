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

On {{site.data.keyword.Bluemix_notm}} there are a number of [deployment offerings](https://{DomainName}/docs/services/vmwaresolutions?topic=vmware-solutions-getting-started#getting-started-depl-offerings) for VMware that you can choose from, with each providing a different level of abstraction. VMware vCloud Director (VCD) is offered under the banner of {{site.data.keyword.vmwaresolutions_short}} Shared. It is a multi-tenant service with elasticity and two subscription types: 
  - On-demand where vCPU and RAM are allocated as needed and priced on an hourly basis.
  - Reserved where vCPU and RAM are pre-allocated and priced monthly. 

{:shortdesc}

## Objectives
{: #objectives}

* Create and explore a {{site.data.keyword.vmwaresolutions_short}} Shared instance in the {{site.data.keyword.Bluemix_notm}}.
* Create a {{site.data.keyword.bpshort}} workspace in the {{site.data.keyword.Bluemix_notm}} to run Infrastructure as Code(IaC) based on Terraform.
* Use {{site.data.keyword.bpshort}} to create a network, firewall, source network address translation (SNAT) rules, and deploy a virtual machine instance in VMware Virtual Data Center via a Terraform template.

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
2. Create a {{site.data.keyword.vmwaresolutions_short}} Shared virtual data center instance using the {{site.data.keyword.Bluemix_notm}} console.
3. Review a Terraform template that will be used to configure and create resources in the virtual data center (VDC).
4. Use the {{site.data.keyword.bplong_notm}} service to run the Terraform template and:
    - With each virtual data center instance, an Edge Gateway is provided with five external IP addresses. Add firewall and SNAT rules to the gateway.
    - Add a network and configure it to the Edge Gateway.
    - Provision a virtual machine instance in the virtual data center.

## Before you begin
{: #prereqs}

This tutorial requires:
* {{site.data.keyword.cloud_notm}} Pay-As-You-Go account,

  A GitHub account is optional and only required if you plan on modifying the provided Terraform template beyond the steps outlined in this tutorial.
  {:tip}

## Create services
{: #create_services}

Login to {{site.data.keyword.cloud_notm}} via a web browser to create the {{site.data.keyword.vmwaresolutions_short}} Shared virtual data center instance with the desired vCPU and RAM configuration.

#### {{site.data.keyword.vmwaresolutions_short}} Shared
{: #create-vmware-solutions-shared}

1. Navigate to [{{site.data.keyword.vmwaresolutions_short}} Shared](https://{DomainName}/infrastructure/vmware-solutions/console).
2. In the **Start Provisioning** section, click the **VMware Solutions Shared** card.
3. For **Pricing Plans**, select `On-Demand`.
4. Enter the virtual data center name, i.e. `vmware-tutorial`.
5. Select the {{site.data.keyword.Bluemix_notm}} data center to host the instance, i.e. `Dallas`.
6. Scroll to **Virtual data center capacity** and set the **vCPU Limit** to `4 vCPU` and the **RAM Limit** to `16 GB`.  You may increase or reduce the capacity as needed later on. 
7. From the **Summary** pane on the right side of the screen, verify the configuration and estimated cost.
8. After having read and agreed to the third-party service agreements, click on **Create**. While waiting for the instance to create, proceed to review the Terraform template section of this tutorial and come back to perform access steps below once the instance is available.

#### Access the {{site.data.keyword.vmwaresolutions_short}} Shared Instance
{: #access-vmware-solutions-shared}

1. Navigate to the [{{site.data.keyword.vmwaresolutions_short}} Shared instances](https://{DomainName}/infrastructure/vmware-solutions/console/instances) page.
2. Click on the newly created instance `vmware-tutorial`.
3. Click on **Set Organization Admin Password**, and copy the password (`vcd_password`) for the **admin** user (`vcd_user`) when it is presented on the screen.
4. With your password created, click on the **vCloud Director console** button found on the top right of the page and login with your credentials.
5. In the left navigation click on **Edges** under the **Networking** category.  Take note of the name of the edge gateway (`vdc_edge_gateway_name`). 
6. In the menu bar, click on the hamburger menu and select **Administration**, click on **General** under the **Settings** category and take note of the **Organization name**. It is your virtual cloud director organization (`vcd_org`).

    Use the following table to confirm that you have all of the information you will need for use later on.
    {:tip}

    <table>
      <thead>
        <tr>
          <td><strong>Name</strong></td>
          <td><strong>Description</strong></td>
          <td><strong>Default</strong></td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>vcd_user</td>
          <td>vCloud Director username</td>
          <td></td>
        </tr>
        <tr>
          <td>vcd_password</td>
          <td>vCloud Director instance password</td>
          <td></td>
        </tr>
        <tr>
          <td>vcd_org</td>
          <td>vCloud Director organization name/id</td>
          <td></td>
        </tr>
        <tr>
          <td>vcd_url</td>
          <td>vCloud Director url</td>
          <td>https://daldir01.vmware-solutions.cloud.ibm.com/api</td>
        </tr>
        <tr>
          <td>vdc_edge_gateway_name</td>
          <td>vCloud Director virtual datacenter edge gateway name</td>
          <td></td>
        </tr>
        <tr>
          <td>vdc_name</td>
          <td>vCloud Director virtual data center name/id</td>
          <td>vmware-tutorial</td>
        </tr>        
      </tbody>
    </table>

## Review the Terraform template
{: #review_terraform_template}

[Terraform](https://www.terraform.io/) is an open-source infrastructure as code tool. It enables users to define and provision a data center infrastructure using a high-level configuration language known as Hashicorp Configuration Language (HCL). Configuration files (Terraform template) describe to Terraform the components needed to run a single application or your entire datacenter.  

In a previous step you created a virtual data center(VDC). This tutorial includes a Terraform template available in a [public Github repository](https://github.com/IBM-Cloud/vmware-solutions-shared) which will be used to configure and deploy resources in that VDC. 

The `main.tf` file contains most of the critical sections for this template.

### Create a routed network
{:#create_routed_network}

An organization VDC network with a routed connection provides controlled access to machines and networks outside of the organization VDC.  The following section creates a routed network and connects it to the existing edge gateway. The template also specifies a static IP pool and DNS servers for the network.

   ```hcl
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

### Create a firewall and SNAT rule to access the Internet
{:#create_internet_rules}

You can create rules to allow or deny traffic, this section creates a rule to allow traffic from the vcd network to reach the Internet with no additional restrictions.

   ```hcl
    resource "vcd_nsxv_firewall_rule" "rule_internet" {
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      name         = vcd_network_routed.tutorial_network.name

      logging_enabled = "false"
      action          = "accept"

      source {
        exclude             = false
        gateway_interfaces  = []
        ip_addresses        = []
        ip_sets             = []
        org_networks        = [vcd_network_routed.tutorial_network.name]
        virtual_machine_ids = []
      }

      destination {
        exclude             = false
        gateway_interfaces  = []
        ip_addresses        = []
        ip_sets             = []
        org_networks        = []
      }

      service {
        protocol = "any"
      }
    }

    resource "vcd_nsxv_snat" "rule_internet" {
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      network_type = "ext"
      network_name = module.ibm_vmware_solutions_shared_instance.default_gateway_network

      original_address   = "${vcd_network_routed.tutorial_network.gateway}/24"
      translated_address = module.ibm_vmware_solutions_shared_instance.default_external_network_ip
    }
   ```

### Create a firewall rule to access the IBM Cloud private network
{:#create_private_rules}

You can create rules to allow or deny traffic, this section creates a rule to allow traffic from the vcd network to the IBM Cloud private network with no additional restrictions. This will all for your virtual machines to access other IBM Cloud services, such as AI, cloud databases, storage without going over the Internet. 

   ```hcl
    resource "vcd_nsxv_firewall_rule" "rule_ibm_private" {
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      name         = "${vcd_network_routed.tutorial_network.name}-IBM-Private"

      logging_enabled = "false"
      action          = "accept"

      source {
        exclude             = false
        gateway_interfaces  = []
        ip_addresses        = []
        ip_sets             = []
        org_networks        = [vcd_network_routed.tutorial_network.name]
        virtual_machine_ids = []
      }

      destination {
        exclude             = false
        gateway_interfaces  = [module.ibm_vmware_solutions_shared_instance.external_networks_2]
        ip_addresses        = []
        ip_sets             = []
        org_networks        = []
      }

      service {
        protocol = "any"
      }
    }

    resource "vcd_nsxv_snat" "rule_ibm_private" {
      edge_gateway = module.ibm_vmware_solutions_shared_instance.edge_gateway_name
      network_type = "ext"
      network_name = module.ibm_vmware_solutions_shared_instance.external_networks_2

      original_address   = "${vcd_network_routed.tutorial_network.gateway}/24"
      translated_address = module.ibm_vmware_solutions_shared_instance.external_network_ips_2
    }
   ```


### Create VM section
{:#create_vm}

A vApp consists of one or more virtual machines that communicate over a network and use resources and services in a deployed environment. A vApp can contain multiple virtual machines. This section creates a vApp and adds a virtual machine to it. The virtual machine is configured with 8 GB of RAM, 2 vCPUs, and based on a CentOS template from the Public catalog.

   ```hcl
    resource "vcd_vapp" "vmware_tutorial_vapp" {
      name = "vmware-tutorial-vApp"
    }

    resource "vcd_vapp_org_network" "tutorial_network" {
      vapp_name        = vcd_vapp.vmware_tutorial_vapp.name
      org_network_name = vcd_network_routed.tutorial_network.name
    }

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

## Deploy using Schematics
{: #deploy_using_schematics}

{{site.data.keyword.bplong_notm}} delivers Terraform-as-a-Service so that you can use a high-level scripting language to model the resources that you want in your {{site.data.keyword.Bluemix_notm}} environment, and enable Infrastructure as Code (IaC). You can organize your IBM Cloud resources across environments by using workspaces. Every workspace is connected to a GitHub repository that contains a set of Terraform configuration files, which build a Terraform template. Use {{site.data.keyword.bpshort}} to connect to the template hosted in GitHub which was reviewed above to configure networking and deploy a virtual machine.

#### 	{{site.data.keyword.bplong_notm}}
{: #create-schematics}

1. Navigate to the [{{site.data.keyword.bplong_notm}}](https://{DomainName}/schematics/overview) overview page and click **Create a workspace**.
2. Enter the workspace name for your workspace, i.e. `vmware-tutorial`.
   - Select the resource group and location of the workspace, you can also add tags and description as needed.
   - Click **Create** to create your workspace. Your workspace is created with a Draft state and the workspace Settings page opens.
3. Connect your workspace to the GitHub source repository where our Terraform template for this tutorial is stored.
   - On the workspace Settings page, enter the link to our GitHub repository, `https://github.com/IBM-Cloud/vmware-solutions-shared`. 
   - Select `terraform_v0.12` as the **Terraform version**.
   - Click **Save template information**. 
4. In the Input variables section, enter the information that was previously captured from the VMware vCloud Director console. 
  
    Some values have defaults which are appropriate to keep for this tutorial.
    {:tip}

    Set the Sensitive flag for the `vcd-password` variable to that the value is not displayed in the workspace and/or logs.
    {:tip}

5. Click Save changes.
6. Scroll to the top of the page and click on **Generate Plan** to create the execution plan, review the logs and confirm it was successful.
7. Click on **Apply plan**.
8. Click on **View log** next to the current running plan to follow the logs. Confirm it completes with no errors. 

## Access deployed virtual machine and test 
{: #access-vmware-solutions-shared}

1. Navigate to the [{{site.data.keyword.vmwaresolutions_short}} Shared instances](https://{DomainName}/infrastructure/vmware-solutions/console/instances) page.
2. Click on the instance `vmware-tutorial` instance.
3. Click on the **vCloud Director console** button found on the top right of the page.
4. Click on **Virtual Machines** 
5. On the card for the `vm-centos8-01` virtual machine, click on **Details** 
6. Scroll down to **Guest OS Customization** and expand the section. Capture the password for the instance. 
7. Back at the **Virtual Machines** page, click on **Actions**  and then **Launch Web Console**. 
8. Login to the instance using the user `root` and the password captured above. You will be required to change the password. Change it to a password of your choice and proceed to login. 
9. Test connectivity to the Internet by pinging known addresses on the Internet, i.e. `ping 8.8.8.8`. 
10. Test connectivity to the IBM Cloud by pinging internal addresses, i.e. [IBM Cloud private DNS resolver endpoint](https://test.cloud.ibm.com/docs/vpc?topic=vpc-service-endpoints-for-vpc#dns-domain-name-system-resolver-endpoints) or [Ubuntu and Debian APT Mirrors](https://{DomainName}/docs/vpc?topic=vpc-service-endpoints-for-vpc#ubuntu-apt-mirrors).

## Remove resources
{: #removeresources}

1. Navigate to [{{site.data.keyword.bpshort}}](https://{DomainName}/schematics/workspaces) workspaces.
2. Click on the action menu next to the `vmware-tutorial` workspace.
3. Click on **Delete**, check all the Delete options, enter the name of the workspace, and click **Delete** to clean up all the provisioned resources.

## Expand the tutorial 

Want to add to or change this tutorial? Here are some ideas:
- Create a fork of the `vmware-solutions-shared` repository and modify it to include additional virtual machine and update your Schematics workspace to use it. 
- Modify the Terraform template to add a firewall and [DNAT rule](https://www.terraform.io/docs/providers/vcd/r/nsxv_dnat.html) to the edge gateway to allow you to SSH directly to it.

## Related content
{: #related}

* [Relevant links in {{site.data.keyword.vmwaresolutions_short}} docs](https://{DomainName}/docs/vmwaresolutions?topic=vmware-solutions-shared_overview)
* [Relevant links in {{site.data.keyword.bpshort}} docs](https://{DomainName}/docs/schematics?topic=schematics-getting-started)
* [{{site.data.keyword.vmwaresolutions_short}}](https://www.ibm.com/cloud/vmware)
* [VMware Cloud Director Documentation](https://docs.vmware.com/en/VMware-Cloud-Director/index.html)