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

  ![Architecture](images/solution49-vpc-app-deploy/ArchitectureDiagram.png)
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
- On the file system of the provisioning system, the users system in the architecture diagram above

Initial IBM VSI images are populated with popular off the shelf operating systems:

```
$ ibmcloud is images
ID                                     Name                    OS                                                        Created                         Status      Visibility
...
2d7acb16-3d4b-d0e5-d623-e43783a9b126   red-7.x-amd64           Red Hat Enterprise Linux (7.x - Minimal Install)          2019-03-10T19:30:57.249-07:00   available   public
7eb4e35b-4257-56f8-d7da-326d85452591   ubuntu-16.04-amd64      Ubuntu Linux (16.04 LTS Xenial Xerus Minimal Install)     2018-10-29T23:12:06.537-07:00   available   public
cfdaf1a0-5350-4350-fcbc-97173b510843   ubuntu-18.04-amd64      Ubuntu Linux (18.04 LTS Bionic Beaver Minimal Install)    2018-10-29T23:12:06.51-07:00    available   public
...
```


At a high level:
- A public, private and bastion VSI are provisioned with the ubuntu-18.04 base image
- nginx is installed on the public and private VSI - demonstrating the use of IBM mirrors
- Internet software is accessed - demonstrating the use of internet repositories on the public VSI and failure on the private VSI
- A file is copied from the file system of the provisioning computer to the public VSI and executed
- Tests are run to verify the above

### IBM Mirrors
IBM has internal mirrors for the images that we provide.  The mirrors are part of the [Service endpoints available for IBM Cloud VPC](https://{DomainName}/docs/vpc-on-classic?topic=vpc-on-classic-service-endpoints-available-for-ibm-cloud-vpc).  There are no ingress charges for reading the mirrors.  The mirrors will contain new versions for the software in the IBM provided images as well as optional packages.

Consider both `updating` the version lists available to the provisioned instances and `upgrading` the installed software from these mirrors.

### Linux cloud-init
The [cloud-init](https://cloudinit.readthedocs.io/en/latest/index.html) syntax is readable, even by a novice linux administrator.  A portion of the cloud-config.yaml file is shown below and does what you would expect:
- bootcmd works around an initial problem with the ubuntu image that will soon be resolved
- package\_update - update the list of software packages available for either upgrade or installation
- package\_upgrade - upgrade the currently installed software provied in the base with the latest versions
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

### Demonstrate the mirrors
Upgrading the installed software and installing nginx and other packages using the operating system provided software installation tools will demonstrate that even the private instances have access to the IBM provided mirrors.  The cloud-init program is hiding ubuntu's use of `apt` and the accessing of the associated mirrors.  The mirrors for all the 

### Demonstrating internet access

When nginx is initialized it will surface the following file: /var/www/html/index.nginx-debian.html

The /init.bash script executed by cloud-init will put one of these strings in index html file:
- INTERNET - if it is possible to install software from the internet
- ISOLATED - if the internet is not available

### Demonstrating upload of file from the on premises environment

A script will be uploaded from on premise and executed.  This mechanism could be extended for arbitrary data upload.  The execution of the script will wait for the index html file above to exist to indicate that nginx has been installed.  It will then create a file, testupload.html, containing the string `hi`

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

Check out the comments in the export.template.

`TF_VAR_bluemix_api_key` is an ibm cloud api key. Follow the [Configuring the IBM Cloud Provider plug-in](https://{DomainName}/docs/terraform?topic=terraform-configure_provider) instructions for finding the value of ibmcloud_api_key
```
provider "ibm" {
  ibmcloud_api_key    = "${var.ibmcloud_api_key}"
}
``` 

`TF_VAR_ssh_key_name` is the name of the VPC SSH public key in the cloud.  This is the public key that will be loaded into the instance to provide secure ssh access via the private key on my laptop.  Use the cli to verify it exists:
```
ibmcloud is keys
```
My private key is in the default location: $HOME/.ssh/id_rsa
If the public key was not previoulsy copied the cloud, copy it now using the gui console or use this CLI command:
```
ibmcloud is key-create $TF_VAR_ssh_key_name @$HOME/.ssh/id_rsa.pub
```

For more info or instructions on how to create an SSH key read [SSH keys](https://{DomainName}/docs/vpc-on-classic-vsi?topic=vpc-on-classic-vsi-ssh-keys).

## Using the GUI Console
If you do not want to use the GUI console [VPC overview](https://{DomainName}/vpc/overview) feel free to browse through this tutorial without executing any steps.  Sip to one of the next sections that automate the same steps.

[Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) contains step by step instructions for creating the cloud resources including a public facing front end VSI and a private back end VSI both optionally acessible through a bastion VSI.


At the point the instance is created change the User data as shown below:

1. To configure the instance:
   1. Set **User data** to
      ```sh
      #!/bin/bash
      apt-get update
      apt-get install -y nginx
      echo "I'm the backend server" > /var/www/html/index.html
      service nginx start
      ```
      {:pre}
      This will install a simple web server into the instance.

Instead fill the **User data** text box with the contents found here: [cloud-config.yaml](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/shared/cloud-config.yaml) and if your cwd in the shell is .../vpc-app-deploy see it in shared/cloud-config.yaml

To upload software you can scp the software to the frontend and backend VSIs and then ssh to the VSIs to install the software.  The [uploaded.sh](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/shared/uploaded.sh) file is an example that will be used below, see it in shared/uploaded.sh.

## Using the scripts in the cli or the GUI
[Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) also contains some handy shell scripts that do everything that was done by hand in the GUI console as well.

The steps are captured in the .../vpc-app-deploy/Makefile, but are easy to execute them with your fingers.  These steps will create a new VPC with all the resources, test the installation, delete the newly created vpc and all the resources including subnets, security groups, and instances.  Here is an illustrative portion of the Makefile:

```
resources.sh:
	$(MAKE) check_TF_VARs
	../vpc-public-app-private-backend/vpc-pubpriv-create-with-bastion.sh us-south-1 $(TF_VAR_ssh_key_name) $(PREFIX) defaultRG $(IMAGE) shared/cloud-config.yaml resources.sh
cli_upload_public: resources.sh
	source resources.sh ; scp -F shared/ssh.config -o ProxyJump=root@$$BASTION_IP_ADDRESS shared/uploaded.sh root@$$FRONT_NIC_IP:/uploaded.sh
	source resources.sh ; ssh -F shared/ssh.config -o ProxyJump=root@$$BASTION_IP_ADDRESS root@$$FRONT_NIC_IP sh /uploaded.sh
cli_test_public:
	source resources.sh ; bash -x test_provision.bash $$FRONT_IP_ADDRESS $(FRONT_INDEX_EXPECTING) $(UPLOAD_EXPECTING)
```

### Cloud init
The first step executes a shell script to create three hosts: front, back, and bastion.  The cloud-config.yaml file is passed as a paramter, it's contents will be passed to the `ibmcloud is create-instance` cli command.  When this step is complete the Front vsi is a publically accessible host with an attached floating ip.  The Back vsi is isolated from the internet.  A great explination of this environment is found in these two tutorials.

- [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend) only the public subnet and web server is required for this tutorial.
- [Securely access remote instances with a bastion host](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-secure-management-bastion-server) for secured maintenance of the servers using a bastion host which acts as a `jump` server and a maintenance security group.

Example command:
```
../vpc-public-app-private-backend/vpc-pubpriv-create-with-bastion.sh us-south-1 ssh_key tst default ubuntu-18.04-amd64 shared/cloud-config.yaml resources.sh
```
- ssh_key is one of the keys output from the `ibmcloud is keys` command
- tst is the common prefix to all resources, keep this lower case and a valid dns name
- ubuntu-18.04-amd64 one of the vsi images from the `ibmcloud is images` command, the scripts are expecting ubuntu
- shared/cloud-config.yaml is the cloud-init file
- resources.sh is the output of a successful build

After the command is complete examine the contents of resources.sh

### Copy file from on prem to the instance and execute
The next steps copy the file to the Front vsi through the bastion.  Then the script is executed.  ProxyJump will jump through the bastion floating ip address on the way to the FRONT vsi.
```
source resources.sh
scp -F shared/ssh.config -o ProxyJump=root@$BASTION_IP_ADDRESS shared/uploaded.sh root@$FRONT_NIC_IP:/uploaded.sh
ssh -F shared/ssh.config -o ProxyJump=root@$BASTION_IP_ADDRESS root@$FRONT_NIC_IP sh /uploaded.sh
```

### Test
Verify that the Front host was initialized with software from the internet and the Back host was not.  Verify both hosts have the contents of the on premises file.  The Front vsi has internet capability so the index html file has the string `INTERNET` the uploaded file has the contents `hi`.  These files can be curled from the laptop you are using through Front's floatin ip address.
```
source resources.sh
test_provision.bash $FRONT_IP_ADDRESS INTERNET hi
```

### Update and analysis
To update the system software from the mirrors create a shell script and scp it to the computers and execute it.  Similarly new versions of on premises files can be deployed.  Extend the tests to verify correct results.

The monotony and chances for error when managing resources in the console UI has lead to scripting.  Integrating scripting into your CI/CD pipeline can also be hard since the scripts either do not consider the current state of the resources or do so in an ad hoc way.  This has led to other kinds of orchestration systems.
Two of them: terraform and ansible, are discussed below.

## Repeat the same steps with terraform
{: #section_two}
Install terraform and the terraform IBM provider on your laptop.
See, Automating cloud resource provisioning with Terraform [Getting started tutorial](https://{DomainName}/docs/terraform).

The main.tf file creates the vpc, subnets, security groups and instances.  Notice that the the previous two tutorials contribute terraform modules that are referenced by [main.tf](https://github.com/IBM-Cloud/vpc-tutorials/blob/master/vpc-app-deploy/tf/main.tf) or .../vpc-app-deploy/main.tf in the terninal.

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

From the .../vpc-app-deploy directory the Makefile has targets that you can use to see it in action.  Or cd .../vpc-app-deploy/tf and use the normal terraform commands.  Makefile:

```
tf_all: tf_apply_test tf_destroy
tf_apply_test: tf_apply tf_test_public tf_test_private
tf_apply: check_TF_VARs
	cd $(TF); terraform init
	cd $(TF); terraform apply -auto-approve
tf_test_public:
	./test_provision.bash $$(cd $(TF); terraform output FRONT_IP_ADDRESS) $(FRONT_INDEX_EXPECTING) $(UPLOAD_EXPECTING)
```

## Repeat the same steps with ansible
{: #section_two}
Install ansible and make sure ansible-playbook is on your path.  The .../vpc-app-deploy/ansible/Makefile has a section that worked for me.  Your milage may vary.  Search the web for `python virtualenv` for creating an isolated python environment for further isolation. 

```
# Optionally install ansible in a virtual env if it is not available on your computer.
# After making prereq source ./pyvirt/bin/activate in your shell to put ansible-playbook on your path
pyvirt:
	virtualenv pyvirt
	. ./pyvirt/bin/activate; pip install ansible
```

You can simply install ansible using pip, use --user if you are not root or do not want it installed for all users.
For a more typical installation:
```
$ python --version
Python 2.7.15
$ pip install --user ansible
...
$ which ansible
/Users/pquiring/Library/Python/2.7/bin/ansible
```

Ansible could be used to provision the cloud resources, but the approach we are going to use is to provision the resources using terraform then deploy the software on the vsis using ansible.

A new ansible/tf directory contains a terraform [configuration](ansible/tf/main.tf) similar to the one described previously except the software installation has been stripped out.

The ansible script will install software from the mirrors and then upload software from your laptop.

### Inventory
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

################ vidya stop here



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

- [VPC Glossary](/docs/vpc-on-classic?topic=vpc-on-classic-vpc-glossary#vpc-glossary)
- [VPC using the IBM Cloud CLI](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-ibm-cloud-cli)
- [VPC using the REST APIs](/docs/vpc-on-classic?topic=vpc-on-classic-creating-a-vpc-using-the-rest-apis)
- [Private and public subnets in a Virtual Private Cloud](https://{DomainName}/docs/tutorials?topic=solution-tutorials-vpc-public-app-private-backend),
- [Deploy a LAMP stack using Terraform](https://{DomainName}/docs/tutorials?topic=solution-tutorials-infrastructure-as-code-terraform)

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
