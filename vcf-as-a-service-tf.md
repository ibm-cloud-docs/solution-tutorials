---
subcollection: solution-tutorials
copyright:
  years: 2024, 2025
lastupdated: "2025-04-16"
lasttested: "2024-01-04"


content-type: tutorial
services: vmware-service
account-plan: paid
completion-time: 1h
use-case: ApplicationModernization, Vmware

---
{{site.data.keyword.attribute-definition-list}}

# Configuring a virtual data center in {{site.data.keyword.vmware-service_short}} with Terraform
{: #vmware-as-a-service-tf}
{: toc-content-type="tutorial"}
{: toc-services="vmware-service"}
{: toc-completion-time="1h"}
{: toc-use-case="ApplicationModernization, Vmware"}

This tutorial may incur costs. Use the [Cost Estimator](/estimator) to generate a cost estimate based on your projected usage.
{: tip}


This tutorial is to demonstrate the basic steps to operationalize an {{site.data.keyword.vmware-service_full}} single-tenant or multitenant virtual data center (VDC) after initial instance provisioning. This tutorial should take about 20-30 minutes to complete and assumes that [a {{site.data.keyword.vmware-service_short}} instance](/docs/vmware-service?topic=vmware-service-tenant-ordering) and [a VDC](/docs/vmware-service?topic=vmware-service-vdc-adding) have already been provisioned. This tutorial uses an example Terraform template, which can be customized and modified for your use case, if needed.
{: shortdesc}

## Objectives
{: #vmware-as-a-service-tf-objectives}

In this tutorial, you will learn:

* How to create VDC networks with Terraform.
* How to create virtual machines (VMs) on your VDC networks with Terraform.
* How to configure network address translation (NAT) and firewall (FW) rules on your VDC edge gateway with Terraform.

The following diagram presents an overview of the solution to be deployed.

![Architecture](images/solution66-vcf-as-a-service/vcfaas-example-diagrams-tf-vcfaas-basic.svg){: caption="Architecture diagram of the tutorial" caption-side="bottom"}
{: style="text-align: center;"}

1. Use IBM Cloud Console to create a VDC in your single tenant instance. Your instance may have one or more VDCs, so you can have a dedicated VDC for testing purposes. This example VDC uses only a `2 IOPS/GB` storage pool.
2. When a VDC is created, an edge gateway and external networks are created automatically. External network provides you Internet access and an IP address block of `/29` with 6 usable public IP addresses is provided.
3. Terraform templates are used to create VDC networks, VMs as well as firewall and network address translation rules. The creation is fully controlled though variables. Terraform authenticates to the VMware Cloud Director API with a user name and password. Access tokens will be supported in the near future.
4. Three VDC networks are created: two routed (`application-network-1` and `db-network-1`) and one isolated (`isolated-network-1`). Routed VDC networks are attached to the edge gateway while isolated VDC network is a standalone network. You can create more networks based on your needs.
5. A jump server (`jump-server-1`) is created with the Windows 2022 Operating System. The server is attached to the `application-network-1`. You can access the virtual machine though the VM console, or using RDP though the DNAT rule created on the Edge Gateway.
6. One example virtual machine (`application-server-1`) is created on the `application-network-1`. The `application-server-1` has an additional disk e.g. for logging. You can create more VMs or disks based on your needs.
7. One example virtual machine (`db-server-1`) is created on the `db-network-1` and `isolated-network-1` with two separate vnics. The `db-server-1` has two additional disks e.g. for data and logging. You can create more VMs or disks based on your needs.
8. Source NAT (SNAT) and destination NAT (DNAT) rules are created for public network access. SNAT to public internet is configured for all routed networks and DNAT is configured to access the application server.
9. Firewall rules are provisioned to secure network access to the environment. To create firewall rules, Static Groups and IP Sets are created for networks and individual IP addresses.

This tutorial is divided into the following steps:

1. [Clone examples repo](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf#vmware-as-a-service-tf-clonerepo) 
2. [Obtain the required information about your VDC](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf#vmware-as-a-service-tf-vdcinfo)
3. [Configure Terraform template variables](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf#vmware-as-a-service-tf-tfvars)
4. [Init, plan and apply](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf#vmware-as-a-service-tf-apply)
5. [Connect to the VMware Cloud Director Console](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf#vmware-as-a-service-tf-connect-to-console)
6. [Connect to the VMs through the Internet and validate connectivity](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf#vmware-as-a-service-tf-connect-to-vm)

An [alternative tutorial](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-tf) using VMware Cloud Director Console is also available.
{: note}

## Before you begin
{: #vmware-as-a-service-tf-prereqs}

This tutorial requires:

* An {{site.data.keyword.cloud_notm}} [billable account](/docs/account?topic=account-accounts),
* Check for user permissions. Be sure that your user account has sufficient permissions [to create and manage {{site.data.keyword.vmware-service_short}} resources](/docs/vmware-service?topic=vmware-service-getting-started).
* [A pre-provisioned {{site.data.keyword.vmware-service_short}} single-tenant instance](/docs/vmware-service?topic=vmware-service-tenant-ordering),
* [A pre-provisioned VDC on the {{site.data.keyword.vmware-service_short}} single-tenant instance](/docs/vmware-service?topic=vmware-service-vdc-adding),
* [{{site.data.keyword.cloud_notm}} CLI](/docs/cli?topic=cli-getting-started),
* [{{site.data.keyword.cloud_notm}} API KEY](/docs/account?topic=account-userapikey&interface=ui),
* [`jq` to query JSON files](https://stedolan.github.io/jq/){: external}, and
* [Terraform](https://developer.hashicorp.com/terraform){: external} with [VMware Cloud Director Provider](https://registry.terraform.io/providers/vmware/vcd/latest/docs){: external} to use Infrastructure as Code to provision resources.

You will find instructions to download and install these tools for your operating environment in the [Getting started with tutorials](/docs/solution-tutorials?topic=solution-tutorials-tutorials) guide.


## Clone examples repo
{: #vmware-as-a-service-tf-clonerepo}
{: step}

The example Terraform templates for {{site.data.keyword.vmware-service_short}} are located in [GitHub](https://github.com/IBM/vmwaas-Terraform-examples){: external}.

Clone the examples repo into your local machine, for example laptop or a virtual server with Internet access.

For example using GitHub CLI:

```bash
gh repo clone IBM/vmwaas-terraform-examples
```
{: codeblock}

Or using HTTPS with the following URL:

```bash
https://github.com/IBM/vmwaas-terraform-examples.git
```
{: codeblock}


## Obtain the required information about your VDC
{: #vmware-as-a-service-tf-vdcinfo}
{: step}

As a prerequisite, use the [IBM Cloud Console](/vmware) to [create your {{site.data.keyword.vmware-service_short}} single-tenant instance](/docs/vmware-service?topic=vmware-service-tenant-ordering) and [one or more VDCs](/docs/vmware-service?topic=vmware-service-vdc-adding) on it.

Once the instance and VDC has been deployed, you can collect the required details and VDC IDs from the Console.

Log in to the {{site.data.keyword.vmware-service_short}} single-tenant instance's VMware Cloud Director Console:

1. In the **{{site.data.keyword.vmware-service_short}}** table, click a {{site.data.keyword.vmware-service_short}} instance name.
2. On the **Summary** tab, review the information.
3. If this is the first time that you access the VMware Cloud Director console for the VDC region, you must set the admin credentials to generate an initial, complex, and random password.
4. On the VDC details page, click **VMware Cloud Director Console** to access the console.
5. Use the admin username and password to log in to the VMware Cloud Director Console for the first time. 
6. After the admin is logged in to the VMware Cloud Director Console, you can create extra users who have roles that allow them to access the VMware Cloud Director Console.

You can login to the VMware Cloud Director Console to collect the required information for your Terraform deployment. You can alternatively use the provided `vmwaas.sh` shell script on the examples repo. The script will collect these values using {{site.data.keyword.vmware-service_short}} API.

To use the script, configure your region and API key with:

```bash
export IBMCLOUD_API_KEY=your-api-key-here
export IBMCLOUD_REGION=region-here 
```
{: codeblock}

The default region is `us-south`.
{: note}

Script usage:

```bash
% ./vmwaas.sh
USAGE : vmwaas [ ins | in | vdcs | vdc | vdcgw | tf | tfvars ]
```


To list your instances:

```bash
% ./vmwaas.sh ins
Get instances.


Instances:

NAME          DIRECTOR_SITE_ID                      LOCATION    STATUS
demo          b75efs1c-35df-40b3-b569-1124be37687d  us-south-1  ReadyToUse
```


To list your VDCs:

```bash
% ./vmwaas.sh vdcs           
Get virtual datacenters.


VDCs:

NAME             ID                                    DIRECTOR_SITE_ID                      CRN
vdc-demo         5e37ed2d-54cc-4798-96cf-c363de922ab4  b75efs1c-35df-40b3-b569-1124be37687d  crn:v1:bluemix:public:vmware:us-south:...
```

To get Terraform TF_VARs for authentication:

```bash
% ./vmwaas.sh tfvars vdc-demo
Get variables for Terraform in export format.


TF_VARs:

export TF_VAR_vmwaas_url="https://<your_url>.us-south.vmware.cloud.ibm.com/api"
export TF_VAR_vmwaas_org="f37f3422-e6c4-427e-b277-9fec334b99fb"
export TF_VAR_vmwaas_vdc_name="vdc-demo"
```

You can export these to your shell, or you can get the terraform.tfvars lines to be added to `terraform.tfvars` files as an output of the script using the `tfvars` option.

## Configure Terraform template variables
{: #vmware-as-a-service-tf-tfvars}
{: step}

This example infrastructure Terraform template is located in folder [`vcd-demo-infra`](https://github.com/IBM/vmwaas-terraform-examples/tree/main/vcd-demo-infra/){: external}.

This demo Terraform template deploys the following example infrastructure, which consists of two routed and one isolated VDC networks, three VMs as well as example SNAT, DNAT and firewall rules.

![Basic infrastructure](images/solution66-vcf-as-a-service/vcfaas-example-diagrams-tf-vcfaas-basic-no-steps.svg){: caption="Basic infrastructure" caption-side="bottom"}
{: style="text-align: center;"}

The Terraform uses [VMware Cloud Director Provider](https://registry.terraform.io/providers/vmware/vcd/latest/docs){: external} and the main provider resources in the example used are:

* [vcd_network_routed_v2](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/network_routed_v2){: external}
* [vcd_network_isolated_v2](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/network_isolated_v2){: external}
* [vcd_vm](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/vm){: external}
* [vcd_nsxt_ip_set](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/nsxt_ip_set){: external}
* [vcd_nsxt_security_group](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/nsxt_security_group){: external}
* [vcd_nsxt_nat_rule](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/nsxt_nat_rule){: external}
* [vcd_nsxt_firewall](https://registry.terraform.io/providers/vmware/vcd/latest/docs/resources/nsxt_firewall){: external}

In this example template, the creation is fully controlled though Terraform variables - you do not need to change the actual Terraform template, for example if you need more networks or VMs. An example `terraform.tfvars-example` file is provided and example values are provided with explanations.

Before you begin, copy the example `terraform.tfvars-example` to `terraform.tfvars`, for example:

```bash
cp terraform.tfvars-example terraform.tfvars
```
{: codeblock}

You can use it as such, add more networks, more VMs and customize NAT or firewall rules and so on based on your needs.

1. Set the following common variable to access your instance and VDC.

   ```terraform
   # Note. Variable values to access your Director instance. Use the Director portal
   # to figure our your values here.
   
   vmwaas_url = "put-your-director-url-here" # for example "https://abcxyz.us-south.vmware.cloud.ibm.com/api"
   vmwaas_org = "put-your-org-id-here"
   vmwaas_vdc_name = "put-your-vdc-name-here"
   
   vmwaas_api_token = ""                                    # Note. See VMware Docs to create API token.
   #vmwaas_user = "put-your-username-here"                  # Note. When using a username and password, create a new local user in Director for terraform.
   #vmwaas_password = "put-your-password-here"              # Note. When using a username and password, create a new local user in Director for terraform.
   ```

   To create an API token, see [VMware Cloud Director Docs](https://techdocs.broadcom.com/us/en/vmware-cis/cloud-director/vmware-cloud-director/10-6.html).
   {: tip}

   For these variables, you could alternatively create environment variables named TF_VAR_ for `vmwaas_api_token`, `vmwaas_user` and `vmwaas_password` rather than defining them in `terraform.tfvars` as shown through the `vmwaas.sh` script. In this case, comment these lines out in your `terraform.tfvars`.
   {: tip}

   If you change the authentication method, the provider block in the code needs to changed to use a different authentication method.
   {: tip}

2. Set a common name prefix to identify and separate your VDC networks, VMs and so on.

   ```terraform
   # Note. Use a common name prefix for each item. 
   
   item_name_prefix = "demo"
   ```

3. Define DNS servers for the VMs.

   You can use IBM Cloud Public DNS server in your VMs, or you can use your own. 

   ```terraform
   # Note. IBM Cloud DNS servers listed here. 
   # You may also use your own here. 
   
   dns_servers = ["161.26.1.10","161.26.1.11"] 
   ```

   When using your own DNS servers here, make sure you have network connectivity to reach these.
   {: important}

4. Define VDC networks.

   When creating VDC networks, use the map variable `vdc_networks` to define these and their IP pools.

   ```terraform
   # Note. Create VDC networks of type `routed` or
   # `isolated`. You can define one `static_ip_pool`and one
   # `dhcp_ip_pool` for each.
   
   vdc_networks = {
      application-network-1 = {
         description = "Application network 1"
         type = "routed"
         subnet = {
               cidr = "172.26.1.0/24"
               prefix_length = 24
               gateway = "172.26.1.1"
               static_ip_pool = {
                  start_address = "172.26.1.10"
                  end_address   = "172.26.1.100"
               }
               dhcp_ip_pool = {
                  start_address = "172.26.1.101"
                  end_address   = "172.26.1.199"
               }        
         }
      },
      db-network-1 = {
         description = "DB network 1"
         type = "routed"
         subnet = {
               cidr = "172.26.2.0/24"
               prefix_length = 24
               gateway = "172.26.2.1"
               static_ip_pool = {
                  start_address = "172.26.2.10"
                  end_address   = "172.26.2.100"
               }
               dhcp_ip_pool = {
                  start_address = "172.26.2.101"
                  end_address   = "172.26.2.199"
               }        
         }
      },
      isolated-network-1 = {
         description = "Isolated network 1"
         type = "isolated"
         subnet = {
               cidr = "172.26.3.0/24"
               prefix_length = 24
               gateway = "172.26.3.1"
               static_ip_pool = {
                  start_address = "172.26.3.10"
                  end_address   = "172.26.3.100"
               }
               dhcp_ip_pool = {} # leave empty for isolated network   
         }
      },
   }
   ```

5. Define virtual machine configurations.

   When creating VMs, use the map variable `virtual_machines` to define these.

   ```terraform
   # Note. Create VMs inside your VDC.
   # You can define each one individually and attach multiple networks
   # and disks. Individual disks are created for each additional disk.
   
   # Note. Check the storage profile names and apply to your VMs / disks.
   # If left empty, default profile is used.
   
   virtual_machines = {
      app-server-1 = {
         image = {
               catalog_name  = "Public Catalog"
               template_name = "RedHat-8-Template-Official"
         }
         memory          = 8192
         cpus            = 2
         cpu_hot_add_enabled = true
         memory_hot_add_enabled = true
         storage_profile = "2 IOPS/GB"
         networks = {
               0 = {
                  name = "application-network-1"
                  ip_allocation_mode = "POOL"
                  is_primary = true
                  ip = ""
               },
         }
         disks = {
               0 = {
                  name = "logDisk"
                  size_in_mb = "100"
                  bus_type = "SCSI"
                  bus_sub_type = "VirtualSCSI"
                  bus_number = 1
                  storage_profile = ""
               },
         }
      },
      db-server-1 = {
         image = {
               catalog_name  = "Public Catalog"
               template_name = "RedHat-8-Template-Official"
         }
         memory        = 8192
         cpus          = 2
         cpu_hot_add_enabled = true
         memory_hot_add_enabled = true
         storage_profile = ""
         networks = {
               0 = {
                  name = "db-network-1"
                  ip_allocation_mode = "POOL"
                  is_primary = true
                  ip = ""
               },
               1 = {
                  name = "isolated-network-1"
                  ip_allocation_mode = "POOL"
                  is_primary = false
                  ip = ""
               },
         }
         disks = {
               0 = {
                  name = "dbDisk"
                  size_in_mb = "100"
                  bus_type = "SCSI"
                  bus_sub_type = "VirtualSCSI"
                  bus_number = 1
                  storage_profile = ""
               },
               1 = {
                  name = "dbLogDisk"
                  size_in_mb = "100"
                  bus_type = "SCSI"
                  bus_sub_type = "VirtualSCSI"
                  bus_number = 1
                  storage_profile = ""
               },
         }    
      },
      jump-server-1 = {
         image = {
               catalog_name  = "Public Catalog"
               template_name = "Windows-2022-Template-Official"
         }
         memory        = 8192
         cpus          = 2
         cpu_hot_add_enabled = true
         memory_hot_add_enabled = true
         storage_profile = ""
         networks = {
               0 = {
                  name = "application-network-1"
                  ip_allocation_mode = "POOL"
                  is_primary = true
                  ip = ""
               },
         },
         disks = {}
      },
   }
   ```

6. Define public IP address map.
   
   Each VDC gets 6 public IP addresses for each VDC and its edge gateway. This Terraform template treats the provided consecutive list of IP addresses as a map. The following variable `public_ips` describes the public IP addresses provided for your VDC. You can use the keys (e.g. `public-ip-1`) to define and use as reference to an IP address in the template without actually specifying the real IP address (e.g. `xx.yy.zz.56`) in the other variables.

   ```terraform
   # Note. Map of available 6 public IPs. You can use these names
   # in NAT rules. Do not change the map's keys here.
   
   public_ips = {
      public-ip-0 = {
         name = "public-ip-0"
         description = ""
      },
      public-ip-1 = {
         name = "public-ip-1" 
         description = ""
      },
      public-ip-2 = {
         name = "public-ip-2" 
         description = ""
      },
      public-ip-3 = {
         name = "public-ip-3" 
         description = ""
      },
      public-ip-4 = {
         name = "public-ip-4" 
         description = ""
      },
      public-ip-5 = {
         name = "public-ip-5" 
         description = ""
      },
   }
   ```

7. Define NAT rules.

   The variable `nat_rules` defines the NAT rules to be created. Check the provided examples and modify based on your needs.

   ```terraform
   # Note. You can use `vdc_networks` or `virtual_machines` keys as 
   # address_targets here. Terraform will pick the IP address of 
   # the specific resource and use that in the actual NAT rule.
   
   # Note. You can specify the desired actual public IP address 
   # (`external_address`) in the rule, or you can use the 
   # `external_address_list_index`, which will pick the IP 
   # addresses from the allocated IP pool (`edge_gateway_allocated_ips`). 
   
   # Note. Use Director UI to get the name for the Application
   # profiles."
   
   nat_rules = {
      dnat-to-app-1 = {
         rule_type   = "DNAT"
         description = "DNAT rule to app-server-1"
         external_address_target = "public-ip-1"
         external_address = "" 
         internal_address_target = "app-server-1"
         internal_address = ""
         dnat_external_port = ""
         app_port_profile = ""
         logging = false
         priority = 90
         enabled = true
      },
      dnat-to-jump-1 = {
         rule_type   = "DNAT"
         description = "DNAT rule to jump-server-1"
         external_address_target = "public-ip-2"
         external_address = "" 
         internal_address_target = "jump-server-1"
         internal_address = ""
         dnat_external_port = ""
         app_port_profile = ""
         logging = false
         priority = 90
         enabled = true
      },
      snat-to-internet-1 = {
         rule_type = "SNAT"
         description = "SNAT rule to application-network-1"
         external_address_target = "public-ip-0"
         external_address = ""  
         internal_address_target = "application-network-1"
         internal_address = ""
         snat_destination_address = ""
         logging = false
         priority = 100
         enabled = true
      },    
      snat-to-internet-2 = {
         rule_type = "SNAT"
         description = "SNAT rule to db-network-1"
         external_address_target = "public-ip-0"
         external_address = ""  
         internal_address_target = "db-network-1"
         internal_address = ""
         snat_destination_address = ""
         logging = false
         priority = 100
         enabled = true
      },  
   }  
   ```

8. Create IP Sets and Static Groups, which are needed in the defining firewall rules.
   
   The Terraform template creates IP Sets for the public IP addresses used in NAT rules. You can also define additional IP sets, for example for your on-premises networks or other private or public IP addresses.
   
   ```terraform
   # Note. You need to create IP sets to be used in firewall rules.
   # You can use the `public_ips` keys here as address_targets,
   # but you can define IP sets using real IP addresses using a
   # list `ip_addresses`.
   
   ip_sets = {
      ip-set-on-public-ip-0 = {
         description = "Public IP 0 - used for SNAT"
         ip_addresses = []
         address_target = "public-ip-0"
      },
      ip-set-on-public-ip-1 = {
         description = "Public IP 1 - used for DNAT to app-server-1"
         ip_addresses = []
         address_target = "public-ip-1"
      },
      ip-set-on-public-ip-2 = {
         description = "Public IP 2 - used for DNAT to jump-server-1"
         ip_addresses = []
         address_target = "public-ip-2"
      },
      ip-set-on-public-ip-3 = {
         description = "Public IP 3"
         ip_addresses = []
         address_target = "public-ip-3"
      },
      ip-set-on-public-ip-4 = {
         description = "Public IP 4"
         ip_addresses = []
         address_target = "public-ip-4"
      },
      ip-set-on-public-ip-5 = {
         description = "Public IP 5"
         ip_addresses = []
         address_target = "public-ip-5"
      },
      ip-set-on-premises-networks = {
         description = "On-premises networks"
         ip_addresses = ["172.16.0.0/16",]
         address_target = ""
      },
   }
   ```
   
   You can also use Static Groups in firewall rules as sources and targets. This example creates three Static Groups, one for each routed VDC network and one which includes all routed VDC networks. 
   
   ```terraform
   # Note. You need to create Static Groups to be used in firewall rules.
   # You can use `vdc_networks` as keys here.
   
   security_groups = {
      sg-application-network-1 = {
         description = "Static Group for application-network-1"
         address_targets = ["application-network-1"]
      },
      sg-db-network-1 = {
         description = "Static Group for db-network-1"
         address_targets = ["db-network-1"]
      },
      sg-all-routed-networks = {
         description = "Static Group for all VDC networks"
         address_targets = ["application-network-1", "db-network-1"]
      },
   }
   ```

9. Define firewall rules.

   The variable `firewall_rules` defines the firewall rules to be created. See the provided examples and modify based on your needs.
   
   ```terraform
   # Note. Use "ALLOW or "DROP".
   
   # Note. Use Director UI to get the name for the Application
   # profiles."
   
   firewall_rules = {
      app-1-egress = {
         action  = "ALLOW"
         direction = "OUT"
         ip_protocol = "IPV4"
         destinations = []                                          # These refer to IP sets (ip_sets or nat_rules) or Static Groups (vdc_networks)
         sources = ["sg-application-network-1", "sg-db-network-1"]  # These refer to IP sets (ip_sets or nat_rules) or Static Groups (vdc_networks)
         system_app_ports = []
         logging = false
         enabled = true
      },
      dnat-to-app-1-ingress = {
         action  = "ALLOW"
         direction = "IN"
         ip_protocol = "IPV4"
         destinations = ["ip-set-on-public-ip-1"]                   # These refer to IP sets (ip_sets or nat_rules) or Static Groups (vdc_networks)
         sources = []                                               # These refer to IP sets (ip_sets or nat_rules) or Static Groups (vdc_networks)
         system_app_ports = ["SSH","HTTPS","ICMP ALL"]
         logging = false
         enabled = true
      },
      dnat-to-jump-1-ingress = {
         action  = "ALLOW"
         direction = "IN"
         ip_protocol = "IPV4"
         destinations = ["ip-set-on-public-ip-2"]                   # These refer to IP sets (ip_sets or nat_rules) or Static Groups (vdc_networks)
         sources = []                                               # These refer to IP sets (ip_sets or nat_rules) or Static Groups (vdc_networks)
         system_app_ports = ["RDP"]
         logging = false
         enabled = true
      },
   }
   ```

It is generally not advised to use RDP over public Internet. The rule listed above is just used for illustration purposes.
{: note}

## Init, plan and apply
{: #vmware-as-a-service-tf-apply}
{: step}

1. To initialize your Terraform project, run `terraform init` command in the example directory and observe the output.

   For example:

   ```bash
   % terraform init

   Initializing the backend...

   Initializing provider plugins...
   - Finding latest version of hashicorp/random...
   - Finding latest version of vmware/vcd...
   - Installing hashicorp/random v3.4.3...
   - Installed hashicorp/random v3.4.3 (signed by HashiCorp)
   - Installing vmware/vcd v3.8.2...
   - Installed vmware/vcd v3.8.2 (signed by a HashiCorp partner, key ID 8BF53DB49CDB70B0)

   Partner and community providers are signed by their developers.
   If you'd like to know more about provider signing, you can read about it here:
   https://www.terraform.io/docs/cli/plugins/signing.html

   Terraform has created a lock file .terraform.lock.hcl to record the provider
   selections it made above. Include this file in your version control repository
   so that Terraform can guarantee to make the same selections by default when
   you run "terraform init" in the future.

   Terraform has been successfully initialized!

   You may now begin working with Terraform. Try running "terraform plan" to see
   any changes that are required for your infrastructure. All Terraform commands
   should now work.

   If you ever set or change modules or backend configuration for Terraform,
   rerun this command to reinitialize your working directory. If you forget, other
   commands will detect it and remind you to do so if necessary.
   ```

2. Next, you can run `terraform plan` to see what will be deployed.

   ```bash
   % terraform plan
   data.vcd_resource_list.list_of_vdcs: Reading...
   data.vcd_resource_list.list_of_vdc_edges: Reading...
   data.vcd_resource_list.list_of_catalog_items: Reading...
   data.vcd_nsxt_app_port_profile.system["SSH"]: Reading...
   data.vcd_nsxt_app_port_profile.system["HTTPS"]: Reading...
   data.vcd_nsxt_app_port_profile.system["ICMP ALL"]: Reading...
   data.vcd_org_vdc.org_vdc: Reading...

   [output omitted]

   Plan: 29 to add, 0 to change, 0 to destroy.
   ```

3. Check the output of your plan, and if all look as planned, you can run `terraform apply` to actually deploy assets. 

   For example: 

   ```bash
   % terraform apply --auto-approve
   data.vcd_resource_list.list_of_vdcs: Reading...
   data.vcd_resource_list.list_of_vdc_edges: Reading...
   data.vcd_resource_list.list_of_catalog_items: Reading...
   data.vcd_nsxt_app_port_profile.system["SSH"]: Reading...
   data.vcd_nsxt_app_port_profile.system["HTTPS"]: Reading...
   data.vcd_nsxt_app_port_profile.system["ICMP ALL"]: Reading...
   data.vcd_org_vdc.org_vdc: Reading...

   [output omitted]

   Apply complete! Resources: 29 added, 0 changed, 0 destroyed.
   ```

4. In addition to the examples above, terraform provides a few variables as `outputs`. Check these`output` values to get, for example, IP addressing and other access information to access your VMs. 

   For example, you can run `terraform output created_virtual_machines` to get access access information to your VMs:

   ```bash
   % terraform output created_virtual_machines
   {
   "app-server-1" = {
      "admin_password" = "<omitted>"
      "name" = "demo-app-server-1"
      "network" = [
         {
         "ip_address" = "172.26.1.10"
         "is_primary" = true
         "name" = "demo-application-network-1"
         },
      ]
   }
   "db-server-1" = {
      "admin_password" = "<omitted>"
      "name" = "demo-db-server-1"
      "network" = [
         {
         "ip_address" = "172.26.2.10"
         "is_primary" = true
         "name" = "demo-db-network-1"
         },
         {
         "ip_address" = "172.26.3.10"
         "is_primary" = false
         "name" = "demo-isolated-network-1"
         },
      ]
   }
   "jump-server-1" = {
      "admin_password" = "<omitted>"
      "name" = "demo-jump-server-1"
      "network" = [
         {
         "ip_address" = "172.26.1.11"
         "is_primary" = true
         "name" = "demo-application-network-1"
         },
      ]
   }
   }
   ```

   To get the NAT rules, and used public IP addresses you can run `terraform output created_nat_rules`:

   ```bash
   % terraform output created_nat_rules
   {
   "dnat-to-app-1" = {
      "dnat_external_port" = ""
      "external_address" = "xxx.yyy.zzz.19"
      "internal_address" = "172.26.1.10"
      "name" = "demo-dnat-to-app-1"
      "rule_type" = "DNAT"
      "snat_destination_address" = ""
   }
   "dnat-to-jump-1" = {
      "dnat_external_port" = ""
      "external_address" = "xxx.yyy.zzz.20"
      "internal_address" = "172.26.1.11"
      "name" = "demo-dnat-to-jump-1"
      "rule_type" = "DNAT"
      "snat_destination_address" = ""
   }
   "snat-to-internet-1" = {
      "dnat_external_port" = ""
      "external_address" = "xxx.yyy.zzz.18"
      "internal_address" = "172.26.1.0/24"
      "name" = "demo-snat-to-internet-1"
      "rule_type" = "SNAT"
      "snat_destination_address" = ""
   }
   "snat-to-internet-2" = {
      "dnat_external_port" = ""
      "external_address" = "xxx.yyy.zzz.18"
      "internal_address" = "172.26.2.0/24"
      "name" = "demo-snat-to-internet-2"
      "rule_type" = "SNAT"
      "snat_destination_address" = ""
   }
   }
   ``` 

   You can get the configured firewall rules though an output `created_fw_rules`, IP Sets with `created_ip_sets` and Static Groups with `created_static_groups`and so on. For example:

   ```bash
   terraform output created_fw_rules
   ```
   {: codeblock}

After provisioning, please make sure you adjust the example firewall rules according to your standards and needs. They will expose public access to your VMs, like `ssh` and `RDP`, which is configured here for demonstration purposes only.
{: important}


## Connect to the VMware Cloud Director Console
{: #vmware-as-a-service-tf-connect-to-console}
{: step}

Refer to the [alternative tutorial](/docs/solution-tutorials?topic=solution-tutorials-vmware-as-a-service-vdc) how to use and access VMware Cloud Director Console. Check the deployed assets and how the Edge Gateway has been configured (FW and NAT rules).

Get the VMs usernames and passwords from the terraform `output`, for example:

```bash
terraform output created_virtual_machines
```
{: codeblock}

To connect to the virtual machine with console in VMware Cloud Director Console:
1. Click **Launch Web Console** to open a local console to the virtual machine.
2. Using the web console, log in to the virtual machine using root as the user ID and the password you captured from the previous step.
3. You should then be able to ping Internet resources such as `www.ibm.com`, showing that the networking is complete and working.


## Connect to the VMs though Internet and validate connectivity
{: #vmware-as-a-service-tf-connect-to-vm}
{: step}

The final step is to connect to the virtual machine through the Internet to validate the deployment and network connectivity.

To connect to the virtual machine through the Internet:
1. You should be able to ping the public IP address `public-ip-1` and ssh to your `app-server-1` from your laptop or workstation, showing that the networking is complete and working.
2. You should be able to use RDP to connect to your Jump Server `jump-server-1` using the public IP address `public-ip-2` and the username and password collected in the previous step.
3. You can then disable the FW rule `dnat-to-app-1-ingress` created in the previous step by editing the rule and its State by sliding the State to Disabled (gray) using Console, or you can change the Terraform variable in the specific rule to `Drop` and run `terraform apply --auto-approve`.
4. You can then disable the FW rule `dnat-to-jump-1-ingress` created in the previous step by editing the rule and its State by sliding the State to Disabled (gray) using Console, or you can change the Terraform variable in the specific rule to `Drop` and run `terraform apply --auto-approve`.


## Reference material
{: #vmware-as-a-service-tf-reference}

Check the following VMware Cloud Director™ Tenant Portal Guides for more detailed information about managing VDCs:

* [Managing Organization Virtual Data Center Networks in the VMware Cloud Director Tenant Portal](https://techdocs.broadcom.com/us/en/vmware-cis/cloud-director/vmware-cloud-director/10-6/map-for-vmware-cloud-director-tenant-portal-guide-10-6/working-with-networks-tenant/managing-organization-vdc-networks-tenant.html){: external}
* [Managing NSX Edge Gateways in VMware Cloud Director Tenant Portal](https://techdocs.broadcom.com/us/en/vmware-cis/cloud-director/vmware-cloud-director/10-6/map-for-vmware-cloud-director-tenant-portal-guide-10-6/working-with-networks-tenant/managing-nsx-t-edge-gateways-in-vcd-tenant.html){: external}
* [Working with Virtual Machines](https://techdocs.broadcom.com/us/en/vmware-cis/cloud-director/vmware-cloud-director/10-6/map-for-vmware-cloud-director-tenant-portal-guide-10-6/working-with-virtual-machines-tenant.html){: external}

Check the Terraform registry for more detailed information about the provider, resources and data sources:

* [VMware Cloud Director Provider](https://registry.terraform.io/providers/vmware/vcd/latest/docs){: external}
