---
copyright:
  years: 2017, 2018
lastupdated: "2018-03-09"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}


# PHP web application on a LAMP Stack

This tutorial walks you through the creation of an Ubuntu **L**inux virtual server, with **A**pache web server, **M**ySQL, and **P**HP (the LAMP stack). To see the LAMP server in action, you will install and configure the [WordPress](https://wordpress.org/) open source application.

## Objectives

* Provision a LAMP server.
* Re-install Apache, MySQL, and PHP.
* Verify the installation and configuration.
* Install and configure WordPress.
* Configure a domain.
* Monitor a LAMP server.
* Secure the server.

![Architecture diagram](images/solution4/Architecture.png)

## Products

This tutorial uses the following products:
   * [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group)

## Before you begin

{: #prereqs}

1. Contact your Infrastructure master user to get the following permissions:

   - Network permission

   Network permission is required to be able to add **Public and Private Network Uplink**  


## Cost

{: #cost}

This tutorial uses billable components of IBM Cloud Platform, including: 

- Virtual Server 

Use the [Pricing Calculator](https://console.bluemix.net/pricing/) to generate a cost estimate based on your projected usage.  

## Provision a LAMP server

1. Go to the catalog in the {{site.data.keyword.Bluemix}} console, and select the [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group) service from the Infrastructure section.

2. Select **Public Virtual Server** and then click **Create**.

3. Under **Image**, select **LAMP** latest version under **Ubuntu**. Even though this comes pre-installed with Apache, MySQL, and PHP, we'll re-install PHP and MySQL with the latest version.

4. Under **Network Interface** select the **Public and Private Network Uplink** option.
   **Note:** Infrastructure network permission is needed to add **Public and Private Network Uplink**.

5. Review the other configuration options and click **Provision** to provision the server.    ![Configure virtual server](images/solution4/ConfigureVirtualServer.png)


    **Note**: The provisioning process can take up to 10 minutes for the server to be ready for use. After the server is created, you'll see the server login credentials. To SSH into the server, you need the server user name, password, and public IP address.
6. Connect to the server by using SSH.
   ```sh
   sudo ssh root@<Public-IP-Address>
   ```
   {: pre}

  You can find the server public IP address and password in the dashboard.
  {:tip}


![Virtual server created](images/solution4/VirtualServerCreated.png)


## Re-install Apache, MySQL, and PHP

Run the following command to update Ubuntu package sources and re-install Apache, MySQL, and PHP with latest versions.  

```sh
sudo apt update && sudo apt install lamp-server^
```
Be sure to note the caret (^) at the end of the command.

## Verify the installation and configuration

Verify Apache, MySQL, and PHP running on the Ubuntu image.

1. Verify Ubuntu by opening in the public IP address in the browser. You should see the Ubuntu welcome page.
   ![Verify Ubuntu](images/solution4/VerifyUbuntu.png)
2. Verify the Apache version is installed by using the following command:
   ```
   apache2 -v
   ```
   {: pre}
3. Verify port 80 for web traffic by running the following command:
   ```
   sudo netstat -ntlp | grep LISTEN
   ```
   {: pre}
   ![Verify Port](images/solution4/VerifyPort.png)  
4. Check the version of MySQL by using the following command:
   ```sh
   mysql -V
   ```
   {: pre}
5. Run the following script to help secure MySQL database:
   ```sh
   mysql_secure_installation
   ```
   {: pre}
6. Enter the MySQL root password and configure the security settings for your environment.
   To create a MySQL database, add users, or change configuration settings, log in to MySQL:
   ```sh
   mysql -u root -p
   ```
   {: pre}

   MySQL default user name and password is root and root.
   {:tip}

   When done, exit the mysql prompt by typing `\q`.
7. Check the version of PHP by using the following command:

   ```sh
   php -v
   ```
   {: pre}
8. If you want to test further, create a quick PHP info page to view in a browser. The following command creates the PHP info page:
   ```sh
   sudo sh -c 'echo "<?php phpinfo(); ?>" > /var/www/html/info.php'
   ```
   {: pre}

   Now you can check the PHP info page you created. Open a browser and go to http://{YourPublicIPAddress}/info.php. Substitute the public IP address of your virtual server. It should look similar to the following image.
   ![PHP info](images/solution4/PHPInfo.png)

## Install and configure WordPress

If you want to try your LAMP stack, install a sample app. As an example, the following steps install the open source WordPress platform that's used to create websites and blogs. For more information and settings for production installation, see the WordPress documentation.

### Install the WordPress packages

1. Run the following command to install WordPress:

   ```sh
   sudo apt install wordpress
   ```
   {: pre}
2. Configure WordPress to use MySQL and PHP. Run the following command to open a text editor and create the file `/etc/wordpress/config-localhost.php`.

   ```sh
   sudo sensible-editor /etc/wordpress/config-localhost.php
   ```
   {: pre}
3. Copy the following lines to the file, substituting *yourPassword* with your MySQL database password (leave the other values unchanged). Then save using Ctrl+X to exit and save the file.   
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
4. In a working directory, create a text file wordpress.sql to configure the WordPress database:
   ```sh
   sudo sensible-editor wordpress.sql
   ```
   {: pre}
5. Add the following commands, substituting your database password for yourPassword (leave the other values unchanged). Then save the file.
   ```sql
   CREATE DATABASE wordpress;
   GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,ALTER ON wordpress.*
   TO wordpress@localhost
   IDENTIFIED BY 'yourPassword';
   FLUSH PRIVILEGES;
   ```
   {: pre}
6. Run the following command to create the database:
   ```sh
   cat wordpress.sql | sudo mysql --defaults-extra-file=/etc/mysql/debian.cnf
   ```
   {: pre}
7. After the command completes, delete the file wordpress.sql. Move the WordPress installation to the web server document root:
   ```sh
   sudo ln -s /usr/share/wordpress /var/www/html/wordpress
   sudo mv /etc/wordpress/config-localhost.php /etc/wordpress/config-default.php
   ```
   {: pre}
8. Complete the WordPress setup and publish on the platform. Open a browser and go to http://{yourVMPublicIPAddress}/wordpress. Substitute the public IP address of your VM. It should look similar to the following image.
   ![WordPress site running](images/solution4/WordPressSiteRunning.png)
-----------

## Configure Domain

To point your domain to the LAMP server, simply point the A record to the server public IP address.
You can get the server public IP address from the dashboard.

## Server monitoring and usage

The correct monitoring must be in place for any production application. In this section, we'll explore the options that are available to monitor a LAMP stack server and understand the usage of the server at any given time.

### Server monitoring

The two basic monitoring types are SERVICE PING and SLOW PING.  
 * **SERVICE PING:** Test ping to address  
 * **SLOW PING:** Test ping address, will not fail on slow server response due to high latency or high server load  

Service ping is added by default so let's add Slow ping. To add Slow ping monitoring, use the following steps:
1. From the dashboard, select your server from the list of devices and then click the Monitoring tab.
  ![Slow Ping Monitoring](images/solution4/SlowPing.png)     
2. Click **Manage Monitors**.
3. Add the **SLOW PING** monitoring option and then click **Add Monitor**. Select your public IP address for the IP address.
  ![Add Slow Ping Monitoring](images/solution4/AddSlowPing.png)      

  **Note**: Duplicate monitors with the same configurations are not allowed. Only one monitor per configuration can be created.   

Now, you should now receive a notification alert at your IBM Cloud account email address.
  ![Two Monitoring](images/solution4/TwoMonitoring.png)        

### Server usage

To understand the current usage of the server memory and CPU, track the usage on the Usage tab.
  ![Server Usage](images/solution4/ServerUsage.png)       


## Server security

With IBM Cloud Virtual Servers, you have several security options like vulnerability scanner and add-on firewalls.

### Vulnerability scanner

The vulnerability scanner scans the server for any vulnerabilities related to the server. To run a vulnerability scan on the server follow the steps below.

1. From the dashboard, select your server and then click the Security tab.  
2. Click **Scan** to start the scan, which can take up to 10 minutes depending on the type of application running on your server.  
3. After the scan completes, click **Scan Complete** to view the scan report.
  ![Two Monitoring](images/solution4/Vulnerabilities.png)       
4. View the report for any vulnerabilities.

    The report should look like the image below:
      ![Two Monitoring](images/solution4/VulnerabilityResults.png)       

### Firewalls

Another way to secure the server is by adding firewall to the server. With IBM Cloud Virtual Servers, you have several firewall options that provide an essential security layer. The firewall options are provisioned on demand without service interruptions. The firewall services prevent unwanted traffic from hitting your servers, reducing the likelihood of an attack and allowing your server resources to be dedicated for their intended use.  

Firewalls are available as an add-on feature for all servers on the Infrastructure public network. As part of the ordering process, you can select device-specific hardware or a software firewall to provide protection. Alternatively, you can deploy dedicated firewall appliances to the environment and deploy the virtual server to a protected VLAN. For more information, see [Firewalls](http://knowledgelayer.softlayer.com/topic/firewall).



## Next steps

Advance to the next tutorial to learn how to

- [Automate deployment of environments using Terraform](infrastructure-as-code-terraform.html)
