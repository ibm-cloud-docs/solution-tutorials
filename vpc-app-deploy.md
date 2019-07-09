---
subcollection: solution-tutorials
copyright:
  years: 2019
lastupdated: "2019-07-08"
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

## Objectives
{: #objectives}

* Understand operating system software provided by {{site.data.keyword.IBM_notm}}
* Utilize manual steps for updating the operating system software and installing new software
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

1. The admin (DevOps) sets up the required infrastructure (VPC, subnets, security groups with rules, VSIs) on the cloud.
1. Install software from {{site.data.keyword.IBM_notm}} mirrors
1. Install software from external repositories

## Before you begin
{: #prereqs}

- Provision your own VPC with a public and a private subnet and a virtual server instance (VSI) in each subnet - [Private and public subnets in a Virtual Private Cloud](/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend). Only the public subnet and web server is required for this tutorial.
- For secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group - [Securely access remote instances with a bastion host](/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server)

## General software installation principles
{: #general_software_installation}

Software can originate from the following locations:
- Initial VSI image
- {{site.data.keyword.IBM_notm}} mirrors
- Internet or intranet available repositories
- File system of the workstation in the architecture diagram above (provisioning system)

Initial {{site.data.keyword.Bluemix_notm}} VSI images are populated with popular off the shelf operating systems:

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

In this tutorial,
- A public, private and bastion VSI are provisioned with the ubuntu-18.04 base image
- nginx is installed on the public and private VSI - demonstrating the use of {{site.data.keyword.IBM}} mirrors
- Internet software is accessed - demonstrating the use of internet repositories on the public VSI and failure on the private VSI
- A file is copied from the file system of the provisioning computer to the public VSI and executed
- Tests are run to verify the above

### {{site.data.keyword.IBM_notm}} Mirrors
{{site.data.keyword.IBM_notm}} has internal mirrors to support the {{site.data.keyword.IBM_notm}} images. The mirrors are part of the [service endpoints available for IBM Cloud VPC](/docs/vpc-on-classic?topic=vpc-on-classic-service-endpoints-available-for-ibm-cloud-vpc). There are no ingress charges for reading the mirrors. The mirrors will contain new versions for the software in the {{site.data.keyword.IBM_notm}} provided images as well as optional packages.

Consider both `updating` the version lists available to the provisioned instances and `upgrading` the installed software from these mirrors.

## Initialize and Customize cloud instances with Cloud-init
{: #cloud_init}

Cloud-init is a package that contains utilities for early initialization of cloud instances.
The [cloud-init](https://cloudinit.readthedocs.io/en/latest/index.html) syntax is readable, even by a novice linux administrator. An example cloud-config.yaml file is shown below and does what you would expect:

- package\_update - update the list of software packages available for either upgrade or installation
- package\_upgrade - upgrade the currently installed software provided in the base with the latest versions
- packages - software packages to install - nginx
- write\_files - paths to text files with contents
- runcmd - commands to be executed

```
#cloud-config
bootcmd:
- sed -i -e "s/mirrors.service.networklayer.com\|mirrors.service.softlayer.com/mirrors.adn.networklayer.com/g" /etc/cloud/cloud.cfg.d/*_networklayer_common.cfg
package_update: true
package_upgrade: true
packages:
  - nginx
write_files:
  - path: /init.bash
    content: |
      #!/bin/bash
      indexhtml=/var/www/html/index.nginx-debian.html

      # wait for the cloud-init boot process to complete
      until [ -f /$indexhtml ]; do
        date
        sleep 11
      done

      # initial value
      cat > $indexhtml <<EOF
      INIT
      EOF

      # Internet is availble then more software can be installed from the internet like
      # npm, pip, docker, ...  if isolated only the software from the ibm mirrors can be installed
      if curl -o /tmp/x https://www.python.org/downloads/release/python-373/; then
      cat > $indexhtml <<EOF
      INTERNET
      EOF
      else
      cat > $indexhtml <<EOF
      ISOLATED
      EOF
      fi

runcmd:
  - systemctl start nginx.service
  - bash -x /init.bash
```
{:codeblock}

### Demonstrate the mirrors
Upgrading the installed software and installing nginx and other packages using the operating system provided software installation tools will demonstrate that even the private instances have access to the {{site.data.keyword.IBM}} provided mirrors.  The cloud-init program uses the OS native install software, ubuntu apt for example, to install software from the mirrors.  The mirrors contain the full linux distributions of updates and optionally installed software, like nginx, for the provided images.

### Demonstrating internet access
When nginx is initialized it will surface the following file: /var/www/html/index.nginx-debian.html

The /init.bash script executed by cloud-init will test if www.python.org can be accessed and put one of these strings in index html file:
- INTERNET - if it is possible to install software from the internet
- ISOLATED - if the internet is not available

## Upload and execute
There may be data and software that is available on the filesystem of your on premise system or CI/CD pipeline that needs to be uploaded to the VSI and then executed.  To demonstrate a script will be uploaded from the filesystem of your computer being used for this tutorial. The execution of the script will wait for the index html file to exist indicating that nginx has been installed.  It will then create a file, testupload.html, containing the string `hi`.

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

The various mechanisms for upload and execution will be discussed below.

Once these steps are complete testing will verify the initialization.

## Using the GUI Console
{: #gui_console}
### Provisiong resources
If you do not want to use the GUI console [VPC overview](https://{DomainName}/vpc/overview) you may still wish to browse the text in the tutorial to familiarize yourself with the set up that will be used through out this tutorial:

[Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) contains step by step instructions for creating the cloud resources including a public facing front end VSI and a private back end VSI both optionally acessible through a bastion VSI.

### Cloud-init
See the general `Cloud-init` section above.

At the point the instance is created change the cloud-init User data as shown below:

1. To configure the instance:
   1. Set **User data** to
      ```
      #!/bin/bash
      apt-get update
      apt-get install -y nginx
      echo "I'm the backend server" > /var/www/html/index.html
      service nginx start
      ```
      {:codeblock}
      This will install a simple web server into the instance.

Instead fill the **User data** text box with the contents found here: [cloud-config.yaml](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/shared/cloud-config.yaml) or in the terminal .../vpc-app-deploy/shared/cloud-config.yaml

### Upload and execute
See the general `Upload and execute` section above.

To upload software you can scp the software to the frontend and backend VSIs and then ssh to the VSIs to install the software.  Assuming that the PWD is .../vpc-app-deploy use the following steps to copy and then execute through the bastion:
```
scp -F ../scripts/ssh.notstrict.config -o ProxyJump=root@<BASTION_IP_ADDRESS> shared/uploaded.sh root@<FRONT_NIC_IP>:/uploaded.sh
ssh -F ../scripts/ssh.notstrict.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP> sh /uploaded.sh
scp -F ../scripts/ssh.notstrict.config -o ProxyJump=root@<BASTION_IP_ADDRESS> shared/uploaded.sh root@<BACK_NIC_IP>:/uploaded.sh
ssh -F ../scripts/ssh.notstrict.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<BACK_NIC_IP> sh /uploaded.sh
```
{:codeblock}

The floating ips come from a common pool and are reused.  To avoid complaints from ssh the -F specifies a configuration file:
```
Host *
  StrictHostKeyChecking no
  UserKnownHostsFile=/dev/null
  LogLevel=quiet
```
{:codeblock}

### Testing
The frontend is easy to test using curl since a floating ip, FRONT_IP_ADDRESS, is attached:
```sh
curl <FRONT_IP_ADDRESS>
curl <FRONT_IP_ADDRESS>/testupload.html
```
{:pre}

The backend is only accessible from the frontend (see Diagram).  The frontend can be accessed through the bastion.
```sh
ssh -F shared/ssh.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP>
curl <BACK_IP_ADDRESS>
curl <BACK_IP_ADDRESS>/testupload.html
```
{:pre}

### Troubleshooting
It can be helpful to use the GUI console [VPC overview](https://{DomainName}/vpc/overview) to browse through the resources created.  The `ibmcloud is` command line can be used as well.

Here is how to ssh to the bastion, frontend and backend.  The frontend and backend jump through the bastion.
```sh
ssh -F shared/ssh.config root@<BASTION_IP_ADDRESS>
ssh -F shared/ssh.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<FRONT_NIC_IP>
ssh -F shared/ssh.config -o ProxyJump=root@<BASTION_IP_ADDRESS> root@<BACK_NIC_IP>
```
{:pre}

The cloud-init log files on the frontend and backend can be found in the /var/log/cloud-init-output.log and will contain the standard output from the commands in the cloud-init.yaml file.

Network connectivity to any of the VSIs needs to be enabled through the VPC Security Groups on the network interface:
- to ssh to a VSI ingress over tcp port
- to install software egress to port 53 (DNS), 80 and 443 are required

Network ACLs could restrict access as well.

## Before you continue
{: #before_you_continue}

This tutorial will walk through example steps on a terminal using a shell.  Shell scripts, terraform, ansible, etc will be demonstrated. Initialize your environment now:
1. Install the command line (CLI) tools [following these steps](https://{DomainName}/docs/cli?topic=cloud-cli-ibmcloud-cli#overview). Not required for terraform.
1. Clone the git repository and point to the folder
   ```sh
    git clone https://github.com/IBM-Cloud/vpc-tutorials.git
    cd .../vpc-app-deploy
   ```
   {:pre}

The scripts in this directory assume you have exported some environment variables.  Start with the provided template:
```
cp export.template export; # create your copy
edit export; # edit your copy by substituting in your values
source export; # source the values into each shell environment that you create
```
{:codeblock}

Check out the comments in the export.template.  The environment variables are in terraform format but will also be used in the cli example.

`TF_VAR_bluemix_api_key` is an ibm cloud api key. Follow the [Configuring the IBM Cloud Provider plug-in](https://{DomainName}/docs/terraform?topic=terraform-configure_provider) instructions for finding the value of ibmcloud_api_key
```
provider "ibm" {
  ibmcloud_api_key    = "${var.ibmcloud_api_key}"
}
```
{:codeblock}

`TF_VAR_ssh_key_name` is the name of the VPC SSH public key in the cloud.  This is the public key that will be loaded into the instance to provide secure ssh access via the private key on my laptop.  Use the cli to verify it exists:
```sh
ibmcloud is keys
```
{:pre}
By default the private key is found here: $HOME/.ssh/id_rsa
For more info or instructions on how to manage and/or create an SSH key read [SSH keys](https://{DomainName}/docs/vpc-on-classic-vsi?topic=vpc-on-classic-vsi-managing-ssh-keys#managing-ssh-keys).

## CLI and scripting
{:#cli_scripting}
### Provisiong resources
[Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) also contains some handy shell scripts that do everything that was done by hand in the GUI console as well.

The steps are captured in the .../vpc-app-deploy/Makefile. You can use the make targets or use the Makefile as a reference.

The vpc-pubpriv-create-with-bastion.sh shell script will create three hosts: front, back, and bastion.  The cloud-config.yaml file is passed as a paramter, it's contents will be passed to the `ibmcloud is create-instance` cli command.  When this step is complete the Front VSI is a publicly accessible host with an attached floating ip.  The Back VSI is isolated from the internet.  A great explination of this environment is found in these two tutorials.

- [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) only the public subnet and web server is required for this tutorial.
- [Securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.

Makefile:
```
resources.sh:
	bash -x ../vpc-public-app-private-backend/vpc-pubpriv-create-with-bastion.sh us-south-1 $(TF_VAR_ssh_key_name) $(PREFIX) $(RESOURCE_GROUP) resources.sh @shared/cloud-config.yaml @shared/cloud-config.yaml $(IMAGE)
```
{:codeblock}

Example command:
```sh
../vpc-public-app-private-backend/vpc-pubpriv-create-with-bastion.sh us-south-1 ssh_key tst default resources.sh @shared/cloud-config.yaml @shared/cloud-config.yaml ubuntu-18.04-amd64
```
{:pre}
- ssh_key is one of the keys output from the `ibmcloud is keys` command
- tst is the common prefix to all resources and the name of the vpc, keep this lower case and a valid dns name
- ubuntu-18.04-amd64 one of the VSI images from the `ibmcloud is images` command, the scripts are expecting ubuntu
- shared/cloud-config.yaml is the cloud-init file
- resources.sh is the output of a successful build

After the command is complete examine the contents of resources.sh

### Cloud init
{:#cloud_init}
The parameter, @shared/cloud-config.yaml, contained the user-data in the instance create command.  In the cli:
```sh
ibmcloud is instance-create ... --user-data @shared/cloud-config.yaml
```
{:pre}

## Upload and execute
{:#upload_execute}
The next steps copy the file to the Front VSI through the bastion.  Then the script is executed.  ProxyJump will jump through the bastion floating ip address on the way to the FRONT VSI.

Makefile:
```
cli_upload_public: resources.sh
	source resources.sh ; scp -F ../scripts/ssh.insecure.config -o ProxyJump=root@$$BASTION_IP_ADDRESS shared/uploaded.sh root@$$FRONT_NIC_IP:/uploaded.sh
	source resources.sh ; ssh -F ../scripts/ssh.insecure.config -o ProxyJump=root@$$BASTION_IP_ADDRESS root@$$FRONT_NIC_IP sh /uploaded.sh
```
{:codeblock}

### Testing
Makefile:
```
cli_test_public:
	source resources.sh ; bash -x test_provision.bash $$FRONT_IP_ADDRESS $(FRONT_INDEX_EXPECTING) $(UPLOAD_EXPECTING)
```
{:codeblock}

The test_provision.bash script automates the testing discussed above.

See troubleshoot above if there are problems.

### Update and analysis
To update the system software from the mirrors create a shell script and scp it to the computers and execute it.  Similarly new versions of on premises files can be deployed.  Extend the tests to verify correct results.

The monotony and chances for error when managing resources in the console UI has lead to scripting.  Integrating scripting into your CI/CD pipeline can also be hard since the scripts either do not consider the current state of the resources or do so in an ad hoc way.  This has led to other kinds of orchestration systems.
Two of them: terraform and ansible, are discussed below.

## Terraform
### Inroduction
{: #section_two}
Install terraform and the terraform IBM provider on your laptop.
See, Automating cloud resource provisioning with Terraform [Getting started tutorial](https://{DomainName}/docs/terraform).

If you are new to terraform or the IBM VPC resource model it will be helpful to start with a self contained example that creates the recources required to create a VSI that you can get to via ssh. [main.tf](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/tfinstance/main.tf) or .../vpc-app-deploy/tfinstance/main.tf in the terninal.  It utilizes the `TF_VAR_bluemix_api_key` and `TF_VAR_ssh_key_name` initialized earlier:

```sh
cd .../vpc-app-deploy/tfinstance
terraform init
terraform apply
terraform output
# notice the ssh command.  try it out
terraform destroy
```
{:pre}

### Provisiong resources
Back to the example this tutorial has been demonstrating.  The terraform configuration creates all the resources in the [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) tutorial.  Notice that the the previous two tutorials contribute terraform modules that are referenced by [main.tf](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/tf/main.tf) or .../vpc-app-deploy/tf/main.tf.

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
  frontend_user_data = "${file("../shared/cloud-config.yaml")}"
  backend_user_data = "${file("../shared/cloud-config.yaml")}"
}
```
{:codeblock}
The parameters help us understand the concepts presented thus far.  Most will be familiar but these may be new:
- backend_pgw - a public gateway can be connected to the backend subnet.  The frontend has a floating ip connected which provides both a public IP and gateway to the internet.  This is going to allow open internet access for software installation.  The backend does not have have access to the internet unless backend_pgw is true.  A test will verify by checking the value of htp://HOST:/index.html which will be either ISOLATED or INTERNET.
- frontend_user_data, backend_user_data - cloud-init contents that is executed at provision time

## Upload and execute
All terraform resources can have associated provisioners.  The null resource does not provision a cloud resource but can be used to copy the uploaded.sh file and then execute it.  Terraform has some special connection variables to use the bastion.
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

From the .../vpc-app-deploy directory the Makefile has targets that you can use to see it in action.  Or cd .../vpc-app-deploy/tf to use the terraform commands.  Makefile:

```
tf_apply: check_TF_VARs
	cd $(TF); terraform init
	cd $(TF); terraform apply -auto-approve
tf_test_public:
	./test_provision.bash $$(cd $(TF); terraform output FRONT_IP_ADDRESS) $(FRONT_INDEX_EXPECTING) $(UPLOAD_EXPECTING)
```
{:codeblock}

## Repeat the same steps with ansible
{: #ansible_steps}
Install ansible and make sure ansible-playbook is on your path.  The .../vpc-app-deploy/ansible/Makefile has a section that worked for me.  Your milage may vary.  Search the web for `python virtualenv` for creating an isolated python environment for further isolation.

[Makefile](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/ansible/Makefile):

```
# Optionally install ansible in a virtual env if it is not available on your computer.
# After making prereq source ./pyvirt/bin/activate in your shell to put ansible-playbook on your path
pyvirt:
	virtualenv pyvirt
	. ./pyvirt/bin/activate; pip install ansible
```
{:codeblock}

Alternatively you can simply install ansible using pip, use --user if you are not root or do not want it installed for all users.
For a more typical installation:
```sh
python --version
Python 2.7.15
pip install --user ansible
...
which ansible
/Users/pquiring/Library/Python/2.7/bin/ansible
```
{:pre}

Ansible could be used to provision the cloud resources, but the approach we are going to use is to provision the resources using terraform then deploy the software on the VSIs using ansible.

### Provisioning resources
{:#provisioning_resources}
A new ansible/tf directory contains a terraform [configuration](ansible/tf/main.tf) similar to the one described previously except the software installation has been stripped out.

The ansible script will install software from the mirrors and then upload software from your laptop.

### Ansible Playbook

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

### Ansible Inventory
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

## Related content
{: #related}

- [VPC Glossary](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#vpc-glossary)
- [VPC using the IBM Cloud CLI](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-ibm-cloud-cli)
- [VPC using the REST APIs](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-rest-apis)
- [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend),
- [Deploy a LAMP stack using Terraform](https://{DomainName}/docs/tutorials?topic=solution-tutorials-infrastructure-as-code-terraform)
