---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-07-10"
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

# Deploy applications on a VSI in VPC
{: #vpc-app-deploy}

This tutorial walks you through provisioning {{site.data.keyword.vpc_full}} (VPC) infrastructure and installing software on a virtual server instance (VSI) using Infrastructure as code(IaC) tools like Terraform and Ansible.

{:shortdesc}

This tutorial starts with a general background and then has technology specific sections.  Each technology section is stand alone so feel free to jump to a specific section, like Terraform, after reviewing the overall architecture and the background section.

## Objectives
{: #objectives}

* Understand operating system software provided by {{site.data.keyword.IBM_notm}}
* Utilize manual steps for updating the operating system software and installing new software
* Understand the cli provisioning capabilities of VPC and VSI
* Become familiar with the Terraform object model for VPC
* Understand how to use Terraform for installing software
* Become familiar with Ansible

## Services used
{: #services}

This tutorial uses the following runtimes and services:
- [{{site.data.keyword.vpc_full}}](https://{DomainName}/vpc/provision/vpc)
- [{{site.data.keyword.vsi_is_full}}](https://{DomainName}/vpc/provision/vs)

This tutorial may incur costs. Use the [Pricing Calculator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.

## Architecture
{: #architecture}

<p style="text-align: center;">

  ![Architecture](images/solution49-vpc-app-deploy/ArchitectureDiagram.png)
</p>

1. The admin (DevOps) sets up the required infrastructure (VPC, subnets, security groups with rules, VSIs) on the cloud.  Copy files and scripts to the VSIs.
1. Install software from {{site.data.keyword.IBM_notm}} mirrors
1. Install software from external repositories

## Background
{: #background}

### General software installation principles
{: #general_software_installation}

The base VSI image software supplied by {{site.data.keyword.IBM_notm}} can be augmented with software originating from places corresponding to the numbers in the architecture diagram above:
1. File system of the workstation (provisioning system)
2. {{site.data.keyword.IBM_notm}} mirrors
3. Internet or intranet repositories

Following the steps in this tutorial, you will be able to:
- provision a frontend, a backend and a bastion VSI with the ubuntu-18.04 base image.
- install nginx on the frontend and on the backend VSIs - demonstrating the use of {{site.data.keyword.IBM}} mirrors.
- access Internet software - demonstrating the use of internet repositories on the public VSI and the lack of internet connection on the private VSI.
- copy a file from the file system of the provisioning computer to the public VSI and then execute the file.
- run tests and verify the configuration. 

### Base virtual server images
{: #base-vsi-images}

Base {{site.data.keyword.Bluemix}} VSI images are populated with popular off the shelf operating systems:

```
ibmcloud is images
ID                                     Name                    OS                                                        Created                         Status      Visibility
...
2d7acb16-3d4b-d0e5-d623-e43783a9b126   red-7.x-amd64           Red Hat Enterprise Linux (7.x - Minimal Install)          2019-03-10T19:30:57.249-07:00   available   public
7eb4e35b-4257-56f8-d7da-326d85452591   ubuntu-16.04-amd64      Ubuntu Linux (16.04 LTS Xenial Xerus Minimal Install)     2018-10-29T23:12:06.537-07:00   available   public
cfdaf1a0-5350-4350-fcbc-97173b510843   ubuntu-18.04-amd64      Ubuntu Linux (18.04 LTS Bionic Beaver Minimal Install)    2018-10-29T23:12:06.51-07:00    available   public
...
```
{:pre}

#### Maintain software on images with {{site.data.keyword.IBM_notm}} Mirrors

{{site.data.keyword.IBM_notm}} has internal mirrors to support the {{site.data.keyword.IBM_notm}} images. The mirrors will contain new versions for the software in the {{site.data.keyword.IBM_notm}} provided images as well as the optional packages associated with the distribution. The mirrors are part of the [service endpoints available for {{site.data.keyword.vpc_short}}](/docs/vpc-on-classic?topic=vpc-on-classic-service-endpoints-available-for-ibm-cloud-vpc). There are no ingress charges for reading the mirrors.

Consider both *updating* the version lists available to the provisioned instances and *upgrading* the installed software from these mirrors.

### Initialize and Customize cloud instances with Cloud-init
{: #cloud_init}

[Cloud-init](https://cloudinit.readthedocs.io/en/latest/index.html) is a multi-distribution package that handles early initialization of a cloud instance. It defines a collection of file formats to encode the initialization of cloud instances. In {{site.data.keyword.cloud_notm}}, the Cloud-init file contents are provided in the user-data parameter at the time the VSI is provisioned. See [User-Data Formats](https://cloudinit.readthedocs.io/en/latest/topics/format.html#user-data-formats) for acceptable user-data content.

This tutorial will use a shell script (starts with `#!`). You can also find the source in [install.sh](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/shared/install.sh):

```sh
#!/bin/bash
apt-get update
apt-get install -y nginx
indexhtml=/var/www/html/index.html
if curl -o /tmp/x https://www.python.org/downloads/release/python-373/; then
    echo INTERNET > $indexhtml
else
    echo ISOLATED > $indexhtml
fi
```
{:codeblock}

In this script, upgrading the installed software and installing nginx and other packages using the operating system provided software installation tools demonstrates that even the isolated instances have access to the {{site.data.keyword.IBM}} provided mirrors. For ubuntu that `apt-get` commands will access mirrors. This is step 2 on the architecture diagram.

The curl command accessing www.python.org demonstrates the attempt to access and potentially install software from the internet. This is step 3 on the architecture diagram.

### Upload from the filesystem and execute on the instance

There may be data and software that is available on the filesystem of your on-premise system or CI/CD pipeline that needs to be uploaded to the VSI and then executed.

To demonstrate, a script will be uploaded from the filesystem of the workstation (see architecture diagram). The execution of the script will wait for the index html file to exist indicating that nginx has been installed.  It will then create a file, `testupload.html`, containing the string `hi`. Before executing, replace the `content`(User data) part of `write_files` directive in the above example with the shell script below

```
#!/bin/bash

indexhtml=/var/www/html/index.nginx-debian.html
testupload=/var/www/html/testupload.html

# wait for nginx to be installed
until [ -f $indexhtml ]; do
  date
  sleep 10
done

# initial value
cat > $testupload <<EOF
hi
EOF
```
{:codeblock}

See 1 on the architecture diagram

### Test
When nginx is initialized it will return the file: `/var/www/html/index.html`

In the example above, the `initialize.sh` script will test if www.python.org can be accessed and put one of these strings in index html file:
- INTERNET - if it is possible to install software from the internet
- ISOLATED - if the internet is not available

You can test the connection to the frontend using curl with the attached floating ip (FRONT_IP_ADDRESS)
```sh
curl <FRONT_IP_ADDRESS>
curl <FRONT_IP_ADDRESS>/testupload.html
```
{:pre}

The backend is only accessible from the frontend.  The frontend is accessed through the bastion.
```sh
ssh -F shared/ssh.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP>
curl <BACK_IP_ADDRESS>
curl <BACK_IP_ADDRESS>/testupload.html
```
{:pre}

The following test_provision.sh script will be used to verify the successful provisioning of resources:

```sh
#!/bin/bash
host_ip=$1
expectingIndex=$2
expectingUploadtest=$3
ssh_command="$4"

testuploadfile=testupload.html
contents=$($ssh_command curl -s $host_ip)
if [ "x$contents" = x$expectingIndex ]; then
  echo success: httpd default file was correctly replaced with the following contents:
  echo $contents
  hi=$($ssh_command curl -s $host_ip/$testuploadfile)
  if [ "x$hi" = "x$expectingUploadtest" ]; then
    echo success: provision of file from on premises worked and was replaced with the following contents:
    echo $hi
    exit 0
  else
    echo $hi
    echo "fail: terraform provision does not work, expecting $expectingUploadtest but got the stuff above intead"
    exit 2
  fi
fi
```
{:pre}

This script will be used in each of the technologies.  To test the 1.2.3.4 host for internet access and that the upload from the workstation worked correctly:
```sh
./test_provision.bash 1.2.3.4 INTERNET hi
```
{:pre}

To test the 1.2.3.4 host from the 1.2.3.5 host through the bastion 1.2.3.6:
```sh
test_provision.bash 1.2.3.4 INTERNET hi "ssh -F ../scripts/ssh.notstrict.config root@$1.2.3.5 -o ProxyJump=root@1.2.3.6"
```
{:pre}

The actual test provision script loops waiting for success.  Provisioning and boot up can take a few minutes.


### Example Program

[Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) also contains some handy shell scripts that do everything that was done by hand in the GUI console as well.
- [Securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.

### Troubleshooting
You can check the provisioned resources on the [VPC overview](https://{DomainName}/vpc/overview) page.Alternatively, The `ibmcloud is` command line can also be used.

Here is how to ssh into the bastion, frontend and backend instances, notice the frontend and backend jump through the bastion.
```sh
ssh -F shared/ssh.config root@<BASTION_IP_ADDRESS>
ssh -F shared/ssh.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP>
ssh -F shared/ssh.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<BACK_NIC_IP>
```
{:pre}

The cloud-init log files on the frontend and backend instances can be found in the `/var/log/cloud-init-output.log` and will contain the standard output from the commands in the cloud-init.yaml file.

Network connectivity to any of the VSIs needs to be enabled through the VPC Security Groups on the network interface:
- to ssh to a VSI ingress tcp port 22 is required
- to install software egress to port 53 (DNS), 80 and 443 are required

The default Network ACLs allow all traffic.  If this is changed keep in mind that both ingress and egress need to be allowed and the specification is not statefull (unlike security groups)

### Choose your technology
The next sections will use the concepts described above and apply them to the following major technology mechanisms for provisioning and installing software:

- VPC GUI Console and typing
- CLI and shell scripts
- terraform
- ansible

## Common steps (work in progress)

### Get the source code

1. Check out the tutorial source code
   ```sh
   git clone https://github.com/IBM-Cloud/vpc-tutorials.git
   ```
   {: codeblock}

### Create a VPC ssh key

xxx

### Set environment variables

This tutorial will walk through example steps on a terminal using the shell, `terraform` and `ansible`.

1. Change to the tutorial directory:
   ```sh
   cd vpc-app-deploy
   ```
   {:codeblock}
1. Copy the configuration file:
   ```sh
   cp export.template export
   ```
   {:codeblock}
1. Edit the `export` file and set the environment variable values:
   * `TF_VAR_ibmcloud_api_key` is an IBM Cloud API key. You can create one [from the console](https://{DomainName}/iam/apikeys).
   * `TF_VAR_ssh_key_name` is the name of the VPC SSH public key in the cloud. This is the public key that will be loaded into the virtual service instances to provide secure ssh access via the private key on your workstation. Use the CLI to verify it exists:
      ```sh
      ibmcloud is keys
      ```
      {:codeblock}
   By default the private key is found here: $HOME/.ssh/id_rsa. For more info or instructions on how to manage and/or create an SSH key read [SSH keys](https://{DomainName}/docs/vpc-on-classic-vsi?topic=vpc-on-classic-vsi-managing-ssh-keys#managing-ssh-keys).
   * `TF_VAR_resource_group_name` is a resource group where resources will be created. See [Creating and managing resource groups](https://{DomainName}/docs/resources?topic=resources-rgs).
1. Load the variables into the environments:
   ```sh
   source export
   ```
   {:codeblock}

The environment variables in `export` are in terraform format (notice the `TF_` prefix) for convenience but are used in all environments.

## VPC GUI console and typing
{: #provision-vpc-cloud-init}
In this section, you will provision a new VPC with subnets and VSIs (if you don't have one) and configure instances to use cloud-init user data.

Step through the instructions in the [Private and public subnets in a Virtual Private Cloud](/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) tutorial.

Now ssh to the frontend server:

```sh
ssh -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP>
```
{:codeblock}

At the root prompt on the frontend server demonstrate installing software from the mirrors by executing the following:

```sh
apt-get update
apt-get install -y nginx
curl localhost
```
{:codeblock}

To demonstrate the capability of installing from internet repositories try:

```sh
indexhtml=/var/www/html/index.html
if curl -o /tmp/x https://www.python.org/downloads/release/python-373/; then
    echo INTERNET > $indexhtml
else
    echo ISOLATED > $indexhtml
fi
curl localhost
```
{:codeblock}

Exit the ssh connected to the frontend and repeat on the backend.

    **Note:**   While provisioning a VSI it is possible to paste the cloud-init script into the **User Data** field.  Make sure to start with the line: #!/bin/sh

To upload software to the frontend and backend VSIs, you can use the `scp` command and then SSH into the VSIs to install the software. On a terminal run the following commands to copy and then execute through the bastion:
```sh
cd .../vpc-app-deploy
scp -o ProxyJump=root@<BASTION_IP_ADDRESS> shared/uploaded.sh root@<FRONT_NIC_IP>:/uploaded.sh
ssh -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP> sh /uploaded.sh
```
{:codeblock}

Repeat for the backend

### Test

The tutorial leaves both the frontend and backend VSIs in a maintenance mode ready to install from the internet.  Try the following tests:
```sh
./test_provision.bash <FRONT_IP_ADDRESS> INTERNET hi
./test_provision.bash <BACK_NIC_IP> INTERNET hi 'ssh -F ../scripts/ssh.notstrict.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP>'
```
{:pre}

### Clean up

Follow the instructions in the referencd tutorials or use the shell script to clean up as described in the next section.

## CLI and shell scripts
### Before you begin
{: #prereqs}

- Install the command line (CLI) tools by [following these steps](/docs/cli?topic=cloud-cli-install-ibmcloud-cli)

### Provision

the [Private and public subnets in a Virtual Private Cloud](/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) tutorial provides a shell script for creating all of the infrastructure in the example.  In the .../vpc-app-deploy directory do the following:

```sh
cd .../vpc-app-deploy
../vpc-public-app-private-backend/vpc-pubpriv-create-with-bastion.sh us-south-1 $TF_VAR_ssh_key_name tst $TF_VAR_resource_group_name resources.sh @shared/install.sh @shared/install.sh ubuntu-18.04-amd64
```
{:pre}

In the script above,

- $TF_VAR_ssh_key_name is the ssh key name described earlier
- tst is the common prefix to all resources and the name of the vpc, keep this lower case and a valid dns name
- $TF_VAR_resource_group_name is the resource group name described earlier which will contain all of the resources created
- resources.sh is the output of a successful build
- shared/install.sh is the frontend cloud-init file discussed in the introduction
- shared/install.sh is the backend cloud-init file discussed in the introduction
- ubuntu-18.04-amd64 one of the VSI images from the `ibmcloud is images` command, the scripts are expecting ubuntu

The `vpc-pubpriv-create-with-bastion.sh` shell script once executed successfully will create three hosts: frontend, backend and bastion.  The `@shared/install.sh` will have been passed to a `ibmcloud is create-instance` cli command --user-data parameter like this:

```sh
 ibmcloud is instance-create ... --user-data @shared/install.sh
```
{:pre}


{:#upload_execute}
Take a look at the `resources.sh` file after the script completes.  Shown below is example contents.
```sh
$ cat resources.sh
FRONT_IP_ADDRESS=169.61.247.108
BASTION_IP_ADDRESS=169.61.247.105
FRONT_NIC_IP=10.240.2.12
BACK_NIC_IP=10.240.1.8
FRONT_VSI_NIC_ID=8976fbde-0f57-4829-a834-a773952f6d19
BACK_VSI_NIC_ID=216aeb65-1296-4445-ab9e-694f751e773d
```
{:codeblock}

The following snippet could be added to a script that you create to upload and execute a script from the workstation.  The -F parameter to ssh is used to avoid using a hosts file.  The floating IP addresses provisioned will be allocated from a fixed pool so SSH strict host checking is likely to fail.

```sh
source resources.sh
scp -F ../scripts/ssh.notstrict.config -o ProxyJump=root@$BASTION_IP_ADDRESS shared/uploaded.sh root@$FRONT_NIC_IP:/uploaded.sh
ssh -F ../scripts/ssh.notstrict.config -o ProxyJump=root@$BASTION_IP_ADDRESS root@$FRONT_NIC_IP sh /uploaded.sh
scp -F ../scripts/ssh.notstrict.config -o ProxyJump=root@$BASTION_IP_ADDRESS shared/uploaded.sh root@$BACK_NIC_IP:/uploaded.sh
ssh -F ../scripts/ssh.notstrict.config -o ProxyJump=root@$BASTION_IP_ADDRESS root@$BACK_NIC_IP sh /uploaded.sh
```
{:pre}

../scripts/ssh.notstrict.config:
```
Host *
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null
```
{:codeblock}

### Test
The tutorial leaves both the frontend and backend VSIs in maintenance mode ready to install from the internet.  Try the following tests:
```sh
./test_provision.bash $FRONT_IP_ADDRESS INTERNET hi
./test_provision.bash $BACK_NIC_IP INTERNET hi "ssh -F ../scripts/ssh.notstrict.config -o ProxyJump=root@$BASTION_IP_ADDRESS root@$FRONT_NIC_IP"
```
{:pre}

### Clean up
The following script will delete the vpc and `all` of the conents in the vpc, be careful:

```sh
../scripts/vpc-cleanup.sh tstvpc-pubpriv
```
{:pre}


## Provisioning infrastructure with Terraform

[Terraform](https://www.terraform.io/) enables you to safely and predictably create, change, and improve infrastructure. It is an open source tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.

If you are starting with terraform for the first time, or if you are unfamiliar with the IBM VPC object model expressed in terraform you can optionally spend a few minutes [with a smaller example](https://github.com/IBM-Cloud/terraform-provider-ibm/tree/master/examples/ibm-is-vpc) before moving ahead with this tutorial.

### Before you begin

1. Follow the instructions found in [Getting started tutorial](https://{DomainName}/docs/terraform) to install Terraform and the IBM Cloud Provider plug-in for Terraform on your workstation.

### Provision a single virtual server instance

Before deploying a more complex architecture, let's deploy a single VSI with a floating IP and access this VSI with `ssh`.

Check the [main.tf](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/tfinstance/main.tf) file for a terraform script. It utilizes the environment variables defined earlier.

1. Change to the terraform script folder for this example:
   ```sh
   cd <checkout_dir>/vpc-app-deploy/tfinstance
   ```
   {:codeblock}
1. Initialize Terraform:
   ```sh
   terraform init
   ```
   {:codeblock}
1. Apply the Terraform plan:
   ```sh
   terraform apply
   ```
   {:codeblock}
   The script creates a VPC, a VSI and enable SSH access.
1. View the output generated by the plan:
   ```sh
   terraform output
   ```
   {:codeblock}
1. You could copy paste the output of the previous command or you can use `terraform output` as follow to SSH into the VSI
   ```sh
   $(terraform output sshcommand)
   ```
   {:codeblock}
   Using outputs in Terraform can become quite handy when you want to reuse resource properties in other scripts after you have applied a Terraform plan.
   {:tip}
1. Remove the resources created by Terraform:
   ```sh
   terraform destroy
   ```
   {:codeblock}

### Provision

Continuing with the tutorial, let's dig deep into the [main.tf](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/tf/main.tf) script under `tf` folder of the repo to understand the individual parts of the terraform script

```json
module vpc_pub_priv {
  source = "../../vpc-public-app-private-backend/tfmodule"
  basename = "${local.BASENAME}"
  ssh_key_name = "${var.ssh_key_name}"
  zone = "${var.zone}"
  backend_pgw = false
  profile = "${var.profile}"
  image_name = "${var.image_name}"
  resource_group_name = "${var.resource_group_name}"
  maintenance = "${var.maintenance}"
  frontend_user_data = "${file("../shared/install.sh")}"
  backend_user_data = "${file("../shared/install.sh")}"
}
```
{:codeblock}

The parameters help us understand the concepts presented thus far,

- backend_pgw - a public gateway can be connected to the backend subnet.  The frontend has a floating ip connected which provides both a public IP and gateway to the internet.  This is going to allow open internet access for software installation.  The backend does not have access to the internet unless backend_pgw is true.
- frontend_user_data, backend_user_data - cloud-init content described in the introduction.

All terraform resources can have associated provisioners.  The null resource does not provision a cloud resource but can be used to copy the [uploaded.sh](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/shared/uploaded.sh) file and then execute it.  Terraform has some special connection variables to use the bastion.
```
resource "null_resource" "copy_from_on_prem" {
  connection {
    type        = "ssh"
    user        = "root"
    host        = "${module.vpc_pub_priv.frontend_network_interface_address}"
    private_key = "${file("~/.ssh/id_rsa")}"
    bastion_user        = "root"
    bastion_host        = "${local.bastion_ip}"
    bastion_private_key = "${file("~/.ssh/id_rsa")}"
  }
  provisioner "file" {
    source      = "../shared/${local.uploaded}"
    destination = "/${local.uploaded}"
  }
  provisioner "remote-exec" {
    inline      = [
      "bash -x /${local.uploaded}",
    ]
  }
}
```
{:codeblock}

To provision the resources:

1. Enter the directory

    ```sh
    cd .../vpc-app-deploy/tf
    ```
    {:pre}
1. Initialize and apply the terraform script.  Notice the output generated.

    ```sh
    terraform init
    terraform apply
    terraform output
    ```
    {:pre}

### Test
Test the frontend:
```
cd .../vpc-app-deploy/tf
../test_provision.bash $(terraform output FRONT_IP_ADDRESS) INTERNET hi
```
{:pre}

Test the backend:
```
../test_provision.bash $(terraform output BACK_NIC_IP) ISOLATED hi "ssh -F ../../scripts/ssh.notstrict.config root@$(terraform output FRONT_NIC_IP) -o ProxyJump=root@$(terraform output BASTION_IP_ADDRESS)"
```
{:pre}

### Clean up
```
cd .../vpc-app-deploy/tf
terraform destroy
```
{:pre}

## Ansible

### Before you begin
This tutorial uses both terraform and ansible
- Install terraform and the terraform IBM provider on your workstation.  See, Automating cloud resource provisioning with Terraform [Getting started tutorial](https://{DomainName}/docs/terraform).
- Install ansible and make sure ansible-playbook is on your path:
Install ansible using pip, use --user if you are not root or do not want it installed for all users.
```sh
python --version
Python 2.7.15
pip install --user ansible-playbook
...
which ansible-playbook
/Users/me/Library/Python/2.7/bin/ansible-playbook
```
{:pre}
### Provision

Ansible could be used to provision the cloud resources, but the approach we are going to use is to provision the resources using terraform then deploy the software on the VSIs using ansible.

{:#provisioning_resources}
A new ansible/tf directory contains a terraform [configuration](ansible/tf/main.tf) similar to the one described previously except the software installation has been stripped out.

The ansible script will install software from the mirrors and then upload software from your workstation.

#### Ansible Playbook

The ansible playbook provides the tasks to be run.  The example below has a set of tasks required to install nginx and upload a script.  You will notice the similarities to the Cloud-init script discussed earlier.  The uploaded.sh script is identical.
```
- hosts: FRONT_NIC_IP BACK_NIC_IP
  remote_user: root
  tasks:
  - name: update apt cache manual
    # this should not be required but without it the error: Failed to lock apt for exclusive operation is generated
    shell: apt update
    args:
      executable: /bin/bash
  - name: update apt cache
    apt:
      update_cache: yes
  - name: ensure nginx is at the latest version
    apt:
      name: nginx
      state: latest
    notify:
    - restart nginx
  - name: execute init.bash
    script: ./init.bash
  - name: upload execute uploaded.sh
    script: ../shared/uploaded.sh
  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
```
{:codeblock}

#### Ansible Inventory
{:#ansible_inventory}
Ansible inventory is generated from the terraform output by the inventory.bash script.  It uses the terraform output variables:
```
#!/bin/bash
TF=tf
printf 'all:
  children:
    FRONT_NIC_IP:
      hosts:
        %s
    BACK_NIC_IP:
      hosts:
        %s
' $(cd $TF; terraform output FRONT_NIC_IP) $(cd $TF; terraform output BACK_NIC_IP)

```
{:codeblock}

#### Steps

Provision resources but no software:
```
cd .../vpc-app-deploy/ansible/tf
terraform init
terraform apply
terraform output
```
{:pre}

Create inventory:
```
cd .../vpc-app-deploy/ansible
./inventory.bash > inventory
```
{:pre}

Provision software:
```
ansible-playbook -T 40 -l FRONT_NIC_IP -u root --ssh-common-args "-F ../../scripts/ssh.notstrict.config -o ProxyJump=root@$(cd tf; terraform output BASTION_IP_ADDRESS)" -i inventory lamp.yaml 
ansible-playbook -T 40 -l BACK_NIC_IP -u root --ssh-common-args "-F ../../scripts/ssh.notstrict.config -o ProxyJump=root@$(cd tf; terraform output BASTION_IP_ADDRESS)" -i inventory lamp.yaml 
```
{:pre}

### Test
Test the frontend:
```
cd .../vpc-app-deploy/ansible/tf
../../test_provision.bash $(terraform output FRONT_IP_ADDRESS) INTERNET hi
```
{:pre}

Test the backend:
```
../../test_provision.bash $(terraform output BACK_NIC_IP) ISOLATED hi "ssh -F ../../../scripts/ssh.notstrict.config root@$(terraform output FRONT_NIC_IP) -o ProxyJump=root@$(terraform output BASTION_IP_ADDRESS)"
```

### Clean up
```
cd .../vpc-app-deploy/ansible/tf
terraform destroy
```
{:pre}

## Related content
{: #related}

- [VPC Glossary](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#vpc-glossary)
- [VPC using the IBM Cloud CLI](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-ibm-cloud-cli)
- [VPC using the REST APIs](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-rest-apis)
- [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend),
- [Deploy a LAMP stack using Terraform](https://{DomainName}/docs/tutorials?topic=solution-tutorials-infrastructure-as-code-terraform)

