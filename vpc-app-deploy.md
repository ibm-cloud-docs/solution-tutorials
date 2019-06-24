---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-06-15"
lasttested: "2019-06-15"

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

# Deploy applications on VSI in VPC
{: #vpc-app-deploy}

{:shortdesc}
This tutorial will walk you through the following mechanisms for installing software onto {{site.data.keyword.vsi_is_full}}

## Objectives
{: #objectives}

* Understand operating system software provided by IBM
* Utilize manual steps for updating the operating system software and installing new software
* Identify automated processes that can be used for installing software

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">
  ![Architecture](images/solution49-vpc-app-deploy/Architecture.png)
</p>

1. The user identifies the software that is required
1. Manually practices the installation of the software
1. Optionally automates the procedures using API, CLI, Terraform or Ansible

## General software installation principles
{: #section_one}
Software can originate from the following locations:
- Initial VSI image
- IBM cloud mirrors
- Internet or intranet available repositories
- On the file system of the provisioning system

Initial IBM images are populated with popular off the shelf operating systems:

```
$ ibmcloud is images
Listing images under account Powell Quiring's Account as user pquiring@us.ibm.com...
ID                                     Name                    OS                                                        Created        Status   Visibility   
cc8debe0-1b30-6e37-2e13-744bfb2a0c11   centos-7.x-amd64        CentOS (7.x - Minimal Install)                            6 months ago   READY    public   
660198a6-52c6-21cd-7b57-e37917cef586   debian-8.x-amd64        Debian GNU/Linux (8.x jessie/Stable - Minimal Install)    6 months ago   READY    public   
e15b69f1-c701-f621-e752-70eda3df5695   debian-9.x-amd64        Debian GNU/Linux (9.x Stretch/Stable - Minimal Install)   6 months ago   READY    public   
2d7acb16-3d4b-d0e5-d623-e43783a9b126   red-7.x-amd64           Red Hat Enterprise Linux (7.x - Minimal Install)          2 months ago   READY    public   
...
```

For illustrative purposes the software initially described in the following tutorial,
[Deploy a LAMP stack using Terraform](https://{DomainName}/docs/tutorials?topic=solution-tutorials-infrastructure-as-code-terraform),
will be used.

At a high level:
- A public and private VSI are provisioned with centos-7 as the base image
- Httpd and other software is installed - demonstrating the use of IBM mirrors
- Internet software is accessed - demonstrating the use of internet repositories on the public VSI and failure on the private VSI
- A file is copied from the file system of the provisioning computer to the public VSI and executed
- Tests are run to verify the above

### IBM Mirrors
IBM has internal mirrors for the images that we provide.
The mirrors are part of the
[Service endpoints available for IBM Cloud VPC](https://{DomainName}/docs/vpc-on-classic?topic=vpc-on-classic-service-endpoints-available-for-ibm-cloud-vpc)
There are no ingress charges for reading the mirrors.
The mirrors will contain new versions for the software in the IBM provided images as well as optional packages.

Consider both `updating` the version lists available to the provisioned instances and `upgrading` the installed software from these mirrors.


### Linux cloud-init
The [cloud-init](https://cloudinit.readthedocs.io/en/latest/index.html) syntax is readable, even by a novice linux administrator.
A portion of the cloud-config.yaml file is shown below and does what you would expect:
- bootcmd works around an initial problem with the centos image that should be resolved by GA (todo)
- package\_update - update the list of software packages available for either upgrade or installation
- package\_upgrade - upgrade the software in the base with the latest versions
- packages - software packages to install
- write\_files - paths to text files with contents
- runcmd - commands to be executed

These packages will all be available from the IBM mirrors so both the public and private VSIs will be configured to this base level:

```
#cloud-config
bootcmd:
- sed -i -e "s/mirrors.service.networklayer.com\|mirrors.service.softlayer.com/mirrors.adn.networklayer.com/g" /etc/yum.repos.d/*.repo*
package_update: true
package_upgrade: true
packages:
  - httpd
...
write_files:
  - path: /var/www/html/info.php
    content: |
      <?php
      phpinfo();
      ?>
  - path: /init.bash
    content: |
      #!/bin/bash
      indexhtml=/usr/share/httpd/noindex/index.html

      # wait for the cloud-init boot process to complete
      until [ -f /$indexhtml ]; do
...
runcmd:
...
  - systemctl start httpd.service
  - systemctl enable httpd.service
  - bash -x /init.bash
...
```

### Demonstrate the mirrors
Upgrading the installed software and installing httpd and other packages will demonstrate that even the private instances have access to the IBM provided mirrors.

### Demonstrating internet access

When httpd is initialized it will surface the following files:
|url|file|
|/|/usr/share/httpd/noindex/index.html|
|/|/usr/share/httpd/noindex/css/bootstrap.min.css|

The /init.bash script executed by cloud-init will put one of these strings in index.html:
- INTERNET - if it is possible to install software from the internet
- ISOLATED - if the internet is not available

### Demonstrating upload of file from the on premises environment

A script will be uploaded from on premise and executed.  This mechanism could be extended for arbitrary data upload.  The execution of the script will replace the bootstrap.min.css file contents with the string `hi`

The mechanism for upload and excution depends on the type of automation and can be extended for arbitrary data upload and script execution.

Once these steps are complete testing will verify the initialization.  Repeating a subset of the process allows for the update of the resources.

## Let us do it

Clone the github repository 
We are going to walk through this example using shell scripts, terraform and ansible.
Regardless of the method used some initialization is going to be required:
1. Install the command line (CLI) tools [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview).
1. Clone the git repository used in this example git@github.com:IBM-Cloud/vpc-tutorials.git
1. cd .../vpc-app-deploy

The scripts in this directory assume you have exported some environment variables.  Start with the provided template:
```
cp export.template export; # create your copy
edit export; # edit your copy by substituting in your values
source export; # source the values into each shell environment that you create
```

Additional documentation for then environment variables in the export.template but a couple of the variables deserve additional explination:

`TF_VAR_bluemix_api_key` is an ibm cloud api key. todo better description

`TF_VAR_ssh_key_name` is the name of the VPC SSH public key in the cloud.  This is the public key that will be loaded into the instance to provide secure ssh access via the private key on my laptop.
Use the cli to verify it exists:
```
ibmcloud is keys
```
My private key is in the default location: /Users/pquiring/.ssh/id_rsa
If the public key was not previoulsy copied the cloud, copy it now using the gui console or use this CLI command:
```
ibmcloud is key-create $TF_VAR_bluemix_api_key @/Users/pquiring/.ssh/id_rsa.pub
```

If you don't have an SSH key, see the [instructions for creating a key](/docs/vpc?topic=vpc-getting-started-with-ibm-cloud-virtual-private-cloud-infrastructure#prerequisites).

## Using shell scripts in the cli or the GUI
Even if you do not plan to use the gui or cli to automate your software automation workflow you will find it informative to read through this description to get the feel for the process.

The steps are captured in the Makefile, but are easy to execute them with your fingers.  These steps will create a new VPC with all the resources, test the installation, delete the newly created vpc and all the resources including subnets, security groups, and instances.  In the Makefile:
```
all_cli:
  todo this needs to be fixed up when complete
	bash -x ../vpc-public-app-private-backend/vpc-pubpriv-create-with-bastion.sh us-south-1 $(TF_VAR_ssh_key_name) vadcli default resources.sh
	$(MAKE) test_public FRONT_IP_ADDRESS
  do the work
	$(MAKE) test_private BASTION_IP_ADDRESS BACK_NIC_IP
	../scripts/vpc-cleanup.sh pfqclivpc-pubpriv -f
```

### Cloud init
The first step executes a shell script to create three hosts: front, back, and bastion.  The cloud-config.yaml file is passed as a paramter, it's contents will be passed to the `ibmcloud is create-instance` command.  When this step is complete Front vsi is a publically accessible host with an attached floating ip.  Back is isolated from the internet.  A great explination of this environment is found in these two tutorials.

Instead of running the script you can walk through these two tutorials in the gui console in just a few minutes and create the resources interactively:
- [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) only the public subnet and web server is required for this tutorial.
- [Securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.

If you do execute this interactively you will need to paste in the shared/cloud-config.yaml file into the text box provided in the instance create screen.

### Copy file from on prem to the instance and execute
The next steps copy the file to both the Front and the Back hosts through the bastion.  Then the script is executed.

### Test
Verify that the Front host was initialized with software from the internet and the Back host was not.  Verify both hosts have the contents of the on premises file.

### Update and analysis
To update the system software from the mirrors create a shell script and scp it to the computers and execute it.  Similarly new versions of on premises files can be deployed.  Extend the tests to verify correct results.

The difficulty of managing instances in the console UI has lead to scripting.
Integrating scripting into your CI/CD pipeline can be hard. 
This has led to other kinds of orchestration systems.
Two of them: terraform and ansible, are discussed below.

## Repeat the same steps with terraform
{: #section_two}
Install terraform and the terraform IBM provider on your laptop.
See, Automating cloud resource provisioning with Terraform [Getting started tutorial](https://{DomainName}/docs/terraform).

The main.tf file creates the vpc, subnets, security groups and instances.  Notice that the the previous two tutorials contribute terraform modules that are referenced [main.tf](./tf/main.tf)

```
module vpc_pub_priv {
  source = "../../vpc-public-app-private-backend/tfmodule"
  basename = "${local.BASENAME}"
  ssh_key_name = "${var.ssh_key_name}"
  zone = "${var.zone}"
  backend_pgw = false
  profile = "${var.profile}"
  image_name = "${var.image_name}"
  maintenance = "${var.maintenance}"
  frontend_user_data = "${file("../shared/cloud-config.yaml")}"
  backend_user_data = "${file("../shared/cloud-config.yaml")}"
}
```
The parameters help us understand the concepts presented thus far:
- backend_pgw - a public gateway can be connected to the backend subnet.  The frontend has a floating ip connected which provides both a public IP and gateway to the internet.  This is going to allow open internet access for software installation.  The backend does not have have access to the internet unless backend_pgw is true.  A test will verify by checking the value of htp://HOST:/index.html which will be either ISOLATED or INTERNET.  
- frontend_user_data - cloud-init contents that is executed at provision time

In addition a null resource will provision the on premises file by copying it to the instance and then execute it.  Terraform has some special connection variables to use the bastion.  Pretty nifty:

```
resource "null_resource" "back_copy_from_on_prem" {
  connection {
    type        = "ssh"
    user        = "root"
    host        = "${module.vpc_pub_priv.backend_network_interface_address}"
    private_key = "${file("~/.ssh/id_rsa")}"
    bastion_user        = "root"
    bastion_host        = "${local.bastion_ip}"
    bastion_private_key = "${file("~/.ssh/id_rsa")}"
  }
  provisioner "file" {
    source      = "../shared/bootstrapmin.sh"
    destination = "/bootstrapmin.sh"
  }
  provisioner "remote-exec" {
    inline      = [
      "pwd > /pwd.txt",
      "bash -x /bootstrapmin.sh",
    ]
  }
}
```

## Repeat the same steps with ansible
{: #section_two}
Install ansible and add it to your path.  Use --user if you are not root or do not want it installed for all users.  Search the web for `python virtualenv` for creating an isolated python environment for further isolation.
```
$ python --version
Python 2.7.15
$ pip install --user ansible
...
$ which ansible
/Users/pquiring/Library/Python/2.7/bin/ansible
```

Ansible could be used to provision the cloud resources, but the approach we are going to use is to provision the resources using terraform then deploy the software on the virtual maching instances using ansible.  The second will be to provision software on the provisioned instances using the ansible.

A new ansible/tf directory contains a terraform [configuration](ansible/tf/main.tf) similar to the one described previously except the software installation has been stripped out.

The ansible script will both provision the software and 

### Inventory
Ansible inventory is generated from the terraform output in a simple script:
```
```



## Remove resources
{: #removeresources}

Steps to take to remove the resources created in this tutorial

## Expand the tutorial (this section is optional, remove it if you don't have content for it)

Want to add to or change this tutorial? Here are some ideas:
- add a load balancer for high availability and zero down time software upgrades
- install operating system patches
- install new software/data from internet repositories
- install new software/data from on premises

## Related content
{: #related}

------------------


## Create a VPC VSI with a floating ip
{: #setup}
This is an optional step required for some of the installation mechanisms below.
After this step is completed a VPC VSI should be provisioned and it should be possible to ssh
Before continuing with the ssh and cli examples a VPC VSI will need to be created.
Each of the mechanisms below are independent.
Feel free to skip the skip the ssh and cli and the manual steps described here:
these you can go straight to the terraform and ansible examples wich will create a VPC, subnet, security groups and VSI.
Creating a VPC VSI can be done 

- Optionally follow the steps mentioned in [securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.


## Manually perform steps using gui console and ssh
{: #section_two}

C
- Run the provided script or follow the steps mentioned in [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) only the public subnet and web server is required for this tutorial.

- Run the provided script or follow the steps mentioned in [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) only the public subnet and web server is required for this tutorial.

replace /usr/share/httpd/noindex/index.html with the new contents

Create a VPC VSI with a floating ip

Using Centos as an example:

Identify the VSI created above.  Modify the steps to use the bastion host as required:
1. scp data.zip root@ip:<IP>
1. ssh root@ip
1. update repositories
1. upgrade software intalled
1. install nginx
1. install git
1. git clone static website repository
1. unzip data.zip into the website
1. systemctl ...nginx
1. test
