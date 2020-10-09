---
subcollection: solution-tutorials
copyright:
  years: 2017, 2019
lastupdated: "2019-05-20"
lasttested: "2019-05-20"

content-type: tutorial
services: virtual-servers
account-plan: paid
completion-time: 1h
---

{:step: data-tutorial-type='step'}
{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# PHP web application on a LAMP Stack
{: #lamp-stack}
{: toc-content-type="tutorial"}
{: toc-services="virtual-servers"}
{: toc-completion-time="1h"}

<!--##istutorial#-->
This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.
{: tip}
<!--#/istutorial#-->

This tutorial walks you through the creation of an Ubuntu **L**inux virtual server with **A**pache web server, **M**ySQL database and **P**HP scripting. This combination of software - more commonly called a LAMP stack - is very popular and often used to deliver websites and web applications. Using {{site.data.keyword.BluVirtServers}} you will quickly deploy your LAMP stack with built-in monitoring and vulnerability scanning. To see the LAMP server in action, you will install and configure the free and open source [WordPress](https://wordpress.org/) content management system.
{: shortdesc}

## Objectives
{: #lamp-stack-0}

* Provision a LAMP server in minutes
* Apply the latest Apache, MySQL and PHP version
* Host a website or blog by installing and configuring WordPress
* Utilize monitoring to detect outages and slow performance
* Assess vulnerabilities and protect from unwanted traffic

![Architecture diagram](images/solution4.hidden/Architecture.png)

1. End user accesses the LAMP server and applications using a web browser

## Before you begin
{: #lamp-stack-1}

{: #prereqs}

1. Contact your infrastructure administrator to get the following permissions.
  * Network permission required to complete the **Public and Private Network Uplink**

### Configure the VPN access
{: #lamp-stack-2}

1. [Ensure your VPN Access is enabled](/docs/iaas-vpn?topic=iaas-vpn-getting-started#enable-user-vpn-access).

     You should be a **Master User** to enable VPN access or contact master user for access.
     {:tip}
2. Obtain your VPN Access credentials in [your user page under the Users list](https://{DomainName}/iam#/users).
3. Log in to the VPN through [the web interface](https://www.softlayer.com/VPN-Access) or use a VPN client for [Linux](/docs/iaas-vpn?topic=VPN-setup-ssl-vpn-connections), [macOS](/docs/iaas-vpn?topic=VPN-connect-ssl-vpn-mac-osx) or [Windows](/docs/iaas-vpn?topic=VPN-connect-ssl-vpn-windows7).

   For the VPN client, use the FQDN of a single data center VPN access point from the [Available VPN endpoints page](https://www.ibm.com/cloud/vpn-access), such as vpn.ams01.softlayer.com as the gateway address.
   {:tip}

## Create services
{: #lamp-stack-3}
{: step}

In this section, you will provision a public virtual server with a fixed configuration. {{site.data.keyword.BluVirtServers_short}} can be deployed in a matter of minutes from virtual server images in specific geographic locations. Virtual servers often address peaks in demand after which they can be suspended or powered down so that the cloud environment perfectly fits your infrastructure needs.

1. In your browser, access the [{{site.data.keyword.BluVirtServers_short}}](https://{DomainName}/catalog/infrastructure/virtual-server-group) catalog page.
2. Select **Public Virtual Server** and click **Create**.
3. Under **Image**, select **LAMP** latest version under **Ubuntu**. Even though this comes pre-installed with Apache, MySQL and PHP, you'll re-install PHP and MySQL with the latest version.
4. Under **Network Interface** select the **Public and Private Network Uplink** option.
5. Review the other configuration options and click **Provision** to create your virtual server.

After the server is created, you'll see the server login credentials. Although you can connect through SSH using the server public IP address, it is recommended to access the server through the Private Network and to disable SSH access on the public network.

1. Follow [these steps](https://{DomainName}/docs/ssh-keys?topic=ssh-keys-restricting-ssh-access-on-a-public-network#restricting-ssh-access-on-a-public-network) to secure the virtual machine and to disable SSH access on the public network.
1. Using your username, password and private IP address, connect to the server with SSH.
   ```sh
   sudo ssh root@<Private-IP-Address>
   ```
   {: pre}

  You can find the server's private IP address and password in the dashboard.
  {:tip}

## Re-install Apache, MySQL, and PHP
{: #lamp-stack-reinstall}
{: step}

It's advised to update the LAMP stack with the latest security patches and bug fixes periodically. In this section, you'll run commands to update Ubuntu package sources and re-install Apache, MySQL and PHP with latest version. Note the caret (^) at the end of the command.

```sh
sudo apt update && sudo apt install lamp-server^
```
{: pre}

An alternative option is to upgrade all packages with `sudo apt-get update && sudo apt-get dist-upgrade`.
{:tip}

## Verify the installation and configuration
{: #lamp-stack-verify}
{: step}

In this section, you'll verify that Apache, MySQL and PHP are up to date and running on the Ubuntu image. You'll also implement the recommended security settings for MySQL.

1. Verify Ubuntu by opening the public IP address in the browser. You should see the Ubuntu welcome page.
   ![Verify Ubuntu](images/solution4.hidden/VerifyUbuntu.png)
2. Verify port 80 is available for web traffic by running the following command.
   ```sh
   sudo netstat -ntlp | grep LISTEN
   ```
   {: pre}
   ![Verify Port](images/solution4.hidden/VerifyPort.png)
3. Review the Apache, MySQL and PHP versions installed by using the following commands.
   ```sh
   apache2 -v
   ```
   {: pre}
   ```sh
   mysql -V
   ```
   {: pre}
   ```sh
   php -v
   ```
   {: pre}
4. Run the following script to secure the MySQL database.
  ```sh
  mysql_secure_installation
  ```
  {: pre}
5. Enter the MySQL root password and configure the security settings for your environment. When you're done, exit the mysql prompt by typing `\q`.
  ```sh
  mysql -u root -p
  ```
  {: pre}

  The MySQL default user name and password is root and root.
  {:tip}
6. Additionally you can quickly create a PHP info page with the following command.
   ```sh
   sudo sh -c 'echo "<?php phpinfo(); ?>" > /var/www/html/info.php'
   ```
   {: pre}
7. View the PHP info page you created: open a browser and go to `http://{YourPublicIPAddress}/info.php`. Substitute the public IP address of your virtual server. It will look similar to the following image.

![PHP info](images/solution4.hidden/PHPInfo.png)

### Install and configure WordPress
{: #lamp-stack-6}

Experience your LAMP stack by installing an application. The following steps install the open source WordPress platform, which is often used to create websites and blogs. For more information and settings for production installation, see the [WordPress documentation](https://codex.wordpress.org/Main_Page).

1. Run the following command to install WordPress.
   ```sh
   sudo apt install wordpress
   ```
   {: pre}
2. Configure WordPress to use MySQL and PHP. Run the following command to open a text editor and create the file `/etc/wordpress/config-localhost.php`.
   ```sh
   sudo sensible-editor /etc/wordpress/config-localhost.php
   ```
   {: pre}
3. Copy the following lines to the file substituting *yourPassword* with your MySQL database password and leaving the other values unchanged. Save and exit the file using `Ctrl+X`.
   ```php
   <?php
   define('DB_NAME', 'wordpress');
   define('DB_USER', 'wordpress');
   define('DB_PASSWORD', 'yourPassword');
   define('DB_HOST', 'localhost');
   define('WP_CONTENT_DIR', '/usr/share/wordpress/wp-content');
   ?>
   ```
   {: pre}
4. In a working directory, create a text file `wordpress.sql` to configure the WordPress database.
   ```sh
   sudo sensible-editor wordpress.sql
   ```
   {: pre}
5. Add the following commands substituting your database password for *yourPassword* and leaving the other values unchanged. Then save the file.
   ```sql
   CREATE DATABASE wordpress;
   GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,ALTER ON wordpress.*
   TO wordpress@localhost
   IDENTIFIED BY 'yourPassword';
   FLUSH PRIVILEGES;
   ```
   {: pre}
6. Run the following command to create the database.
   ```sh
   cat wordpress.sql | sudo mysql --defaults-extra-file=/etc/mysql/debian.cnf
   ```
   {: pre}
7. After the command completes, delete the file `wordpress.sql`. Move the WordPress installation to the web server document root.
   ```sh
   sudo ln -s /usr/share/wordpress /var/www/html/wordpress
   sudo mv /etc/wordpress/config-localhost.php /etc/wordpress/config-default.php
   ```
   {: pre}
8. Complete the WordPress setup and publish on the platform. Open a browser and go to `http://{yourVMPublicIPAddress}/wordpress`. Substitute the public IP address of your VM. It should look similar to the following image.
   ![WordPress site running](images/solution4.hidden/WordPressSiteRunning.png)

## Configure domain
{: #lamp-stack-configure}
{: step}

To use an existing domain name with your LAMP server, update the A record to point to the virtual server's public IP address.
You can view the server's public IP address from the dashboard.

## Server monitoring and usage
{: #lamp-stack-8}
{: step}

To ensure server availability and the best user experience, monitoring should be enabled on every production server. In this section, you'll explore the options that are available to monitor your virtual server and understand the usage of the server at any given time.

### Server monitoring
{: #lamp-stack-9}

Two basic monitoring types are available: SERVICE PING and SLOW PING.

* **SERVICE PING** checks that server response time is equal to 1 second or less
* **SLOW PING** checks that server response time is equal to 5 seconds or less

Since SERVICE PING is added by default, add SLOW PING monitoring with the following steps.

1. In the [Resource List](https://{DomainName}/resources), select your server from the list of devices and then click the **Monitoring** tab.
2. Click **Manage Monitors**.
3. Select **Add Monitor**.
   1. Select the **public IP address** of the server
   1. Set Monitor Type to **SLOW PING** monitoring option and click **Add Monitor**.
   1. Set **Notify** to **Notify Users**
   1. Set **Notify Wait** to **Immediately**

**Note**: Duplicate monitors with the same configurations are not allowed. Only one monitor per configuration can be created.

If a response is not received in the allotted time frame, an alert is sent to the email address on the {{site.data.keyword.Bluemix_notm}} account.
   ![Two Monitors](images/solution4.hidden/TwoMonitoring.png)

### Server usage
{: #lamp-stack-10}

Select the **Usage** tab to understand the current server's memory and CPU usage.
  ![Server Usage](images/solution4.hidden/ServerUsage.png)

## Server security
{: #lamp-stack-11}
{: step}

{{site.data.keyword.BluVirtServers}} provide several security options such as vulnerability scanning and firewalls.

### Vulnerability scanner
{: #lamp-stack-12}

The vulnerability scanner scans the server for any vulnerabilities related to the server. To run a vulnerability scan on the server follow the steps below.

1. From the resource list, select your server and then click the **Security** tab.
2. Click **Scan** to start the scan.
3. After the scan completes, click **Scan Complete** to view the scan report.
4. Review any reported vulnerabilities.
   ![Vulnerability Results](images/solution4.hidden/VulnerabilityResults.png)

### Firewalls
{: #lamp-stack-13}

Another way to secure the server is by adding a firewall. Firewalls provide an essential security layer: preventing unwanted traffic from hitting your servers, reducing the likelihood of an attack and allowing your server resources to be dedicated for their intended use. Firewall options are provisioned on demand without service interruptions.

Firewalls are available as an add-on feature for all servers on the Infrastructure public network. As part of the ordering process, you can select device-specific hardware or a software firewall to provide protection. Alternatively, you can deploy dedicated firewall appliances to the environment and deploy the virtual server to a protected VLAN. For more information, see [Firewalls](https://{DomainName}/docs/hardware-firewall-dedicated?topic=hardware-firewall-dedicated-getting-started-with-hardware-firewall-dedicated#getting-started).

## Remove resources
{: #lamp-stack-14}
{: step}

To remove your virtual server, complete the following steps.

1. Log in to the [{{site.data.keyword.slportal}}](https://{DomainName}/classic/devices).
2. From the **Devices** menu, select **Device List**.
3. Click **Actions** for the virtual server you want to remove and select **Cancel**.

## Related content
{: #lamp-stack-15}

* [Deploy a LAMP stack using Terraform](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-infrastructure-as-code-terraform#infrastructure-as-code-terraform)
* [PHP web application on a LAMP Stack in VPC](https://{DomainName}/docs/solution-tutorials?topic=solution-tutorials-lamp-stack-on-vpc)