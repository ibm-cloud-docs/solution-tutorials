---
copyright:
  years: 2017
lastupdated: "2017-12-05"
---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}
{:codeblock: .codeblock}
{:screen: .screen}
{:tip: .tip}
{:pre: .pre}

# Deploy a Highly Available and Scalable web application with Load Balancer and Backups

This tutorial walks you through the creation of a load balancer, two application servers running on Ubuntu with NGINX and **P**HP installed, one **M**ySQL database server, and durable file storage to store application files and backups.

## Objectives

- Provision one server for the database
- Install and configure MySQL
- Create a file storage for database backups
- Provision two servers for the PHP front-end
- Create a file storage to share application files between the front-end servers
- Provision one load balancer server in front of the application servers

## Products
{: #products}

This tutorial uses the following products:
* [Load Balancer](https://console.bluemix.net/catalog/infrastructure/ibm-bluemix-load-balancer)
* [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group)
* [File Storage](https://console.bluemix.net/catalog/infrastructure/file-storage)

<p style="text-align: center;">
![Architecture diagram](images/solution14/highly-available-wordpress-architecture.png)
</p>

TODO - update the digram

1. The user does this
2. Then that
3. TODO - Add steps for each case as per diagram

## Before you begin
{: #prereqs}

### Configure the SoftLayer VPN

In this tutorial, the load balancer is the front door for the application users. The virtual servers will not need to be visible on the public Internet. Thus they will be provisioned with only a private IP address and you will use your SoftLayer VPN connection to work on the servers.

1. [Ensure your VPN Access is enabled](https://knowledgelayer.softlayer.com/procedure/getting-started-softlayer-vpn)
1. Obtain your VPN Access credentials in [your profile page](https://control.softlayer.com/account/user/profile)
1. Log in to the VPN through [the web interface](https://www.softlayer.com/VPN-Access)
1. or use a VPN client for [Linux](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-linux), [macOS](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-mac-os-x-1010) or [Windows](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-windows)

{: tip} You can choose to skip this step. If so make sure to select **Public and Private Network Uplink** when provisioning virtual servers.

### Check account permissions

Contact your Infrastructure master user to get the following permissions:
- **Network** so that you can create virtual servers with **Public and Private Network Uplink** (this permission is not required if you use the VPN to connect to the servers)


## Provision one server for the database
{: #database_server}

1. Go to the catalog in the {{site.data.keyword.Bluemix}} console, and select the [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group) service from the Infrastructure section.
2. Select **Public Virtual Server** and then click **Create**.
3. Configure the server with the following:
   - Set **Name** to it **db1**
   - Select a location where to provision the server. **All other servers and resources created in this tutorial will need to be created in the same location.**
   - Select the **Ubuntu Minima** image
   - Keep the default compute flavor. You can pick any size, the tutorial has been tested with the smallest flavor.
   - Under **Attached Storage Disks**, select the 25GB boot disk.
   - Under **Network Interface**, select the **100Mbps Private Network Uplink** option.
   {: tip} If you did not configure the VPN Access, select the **100Mbps Public and Private Network Uplink** option.
   - Review the other configuration options and click **Provision** to provision the server.
   [Configure virtual server](images/solution14/db-server.png)

   {: tip}
   Note: The provisioning process can take 2 to 5 minutes for the server to be ready for use. After the server is created, you'll see the server login credentials. To SSH into the server, you need the server user name, password, and public IP address.

## Install and configure MySQL
{: #mysql}

### Install MySQL

1. Connect to the server by using SSH and run the following commands on the server.
   ```sh
   ssh root@<Private-IP-Address>
   ```
1. Install MySQL  
   ```sh
   apt-get update
   apt-get install mysql-server
   ```
1. Run the following script to help secure MySQL database:
   ```sh
   mysql_secure_installation
   ```

### Create a database for the application

1. Login to MySQL and create a database called `wordpress`
   ```sh
   mysql -u root -p
   CREATE DATABASE wordpress;
   ```
1. Grant access to database
   ```
   GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,ALTER ON wordpress.*
   TO root@'%'
   IDENTIFIED BY '<database-password>';
   FLUSH PRIVILEGES;
   ```

### Make the MySQL server visible to the outside

By default MySQL only listens on the local interface. The application servers will need to connect to the database so the MySQL configuration needs to be changed to listen on the private network interfaces.

1. Edit `/etc/mysql/my.cnf` and add these lines
   ```
   [mysqld]
   bind-address    = 0.0.0.0
   ```
1. Restart MySQL
   ```
   systemctl restart mysql
   ```
1. Confirm MySQL is listening on all interfaces
   ```
   netstat --listen --numeric-ports | grep 3306
   ```

## Create a file storage for database backups

There are many ways in which backups can be done and stored when it comes to MySQL. This tutorial will use crontab entry to regularly dump the database content to disk. The backup files will be stored in a file storage.

### Create the file storage
1. Go to the catalog in the {{site.data.keyword.Bluemix}} console, and select [File Storage](https://console.bluemix.net/catalog/infrastructure/file-storage)
1. Click **Create**
3. Configure the service with the following:
   - Under **Storage Type**, Endurance option.
   - Select the same **Location** as the one where you created the database server.
   - Select a billing method
   - Under **Storage Packages**, select 0.25 IOPS/GB
   - Under **Storage Size**, select 20GB
   - Under **Snapshot Space Size**, select 40GB
   - Click continue to create the service.

TODO(fredL) we could skip the Snapshot here - snapshot would be only needed if we want to replicate the backup to another location

### Authorize the database server to use the file storage

1. Select the File Storage from the [list of existing items](https://control.bluemix.net/storage/file)
1. Under **Authorized Hosts**, click **Authorize Host** to authorize the database server to use this file storage

### Mount file storage for database backups

1. Install the NFS client libraries
   ```sh
   apt-get -y install nfs-common
   ```
1. Create a file called `/etc/systemd/system/mnt-database.mount` with the following content, replacing the value of `What` with the **Mount Point** for the file storage (e.g *fsf-lon0601a-fz.adn.networklayer.com:/IBM01SEV12345_100/data01*)
   ```
   [Unit]
   Description = Mount for Container Storage
   
   [Mount]
   What=CHANGE_ME_TO_FILE_STORAGE_MOUNT_POINT
   Where=/mnt/database
   Type=nfs
   Options=vers=3,sec=sys,noauto

   [Install]
   WantedBy = multi-user.target
   ```
1. Create the mount point
  ```sh
  mkdir /mnt/database
  ```
1. Mount the storage
   ```sh
   systemctl enable --now /etc/systemd/system/mnt-database.mount
   ```
1. Check if the mount was successfully done
   ```sh
   mount
   ```
   {: tip} The last lines should list the File Storage mount. If this is not the case, use `journalctl -xe` to debug the mount operation.

### Setup a backup at regular interval

TODO(fredL) fill in crontal instructions to run mysqldump daily

## Provision two Ubuntu servers and install **P**HP runtime

We need to provision two application servers with the following.

1. Go to the catalog in the {{site.data.keyword.Bluemix}} console, and select the [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group) service from the Infrastructure section.
2. Select **Public Virtual Server** and then click **Create**.
3. Configure the server with the following:
   - Under **Name**, name it app1
   - Under **Region**, select LON06 - London or any other region best for your application.
   - Under **Image**, select the **Ubuntu** and the latest version of **Minima**.
   - Under **Popular Flavors**, select the entry option or higher if you need a higher option. **TODO** - maybe we should select a higher spec. Something we need to revisit.
   - Under **Attached Storage Disks**, select the entry 25GB or bigger if needed.
   - Under **Network Interface**, select the **Private Network Uplink and Public IP Address** option.
   - Review the other configuration options and click **Provision** to provision the server.    
4. Repeat steps 2 and 3 to provision server two with same configuration except for the **Name**, for the name type app2.

## Mount file storage for application VM's

File storage is going to be used to store the application source code between app1 and app2 servers. The following step will mount file storage to store the application source code:
1. Downloading and Installing the Components
  ```sh
  apt-get -y install nfs-common
  ```

2. Create a file called mnt-database.mount

  ```sh
  nano /etc/systemd/system/mnt-www.mount
  ```

3. Store the following inside the mnt-database.mount file
  ```sh
  [Unit]
  Description = Mount for Container Storage

  [Mount]
  What=<fsf-lon0601a-fz.adn.networklayer.com:/IBM02SEV1329499_109/data01>
  Where=/mnt/www
  Type=nfs
  Options=vers=3,sec=sys,noauto

  [Install]
  WantedBy = multi-user.target
  ```

4. Create a folder called database to store the backup database
  ```sh
  mkdir /mnt/www
  ```

5. Mount the storage
  ```sh
  systemctl enable --now /etc/systemd/system/mnt-www.mount
  ```

6. Check if the mount was successfully done
  ```sh
  mount
  ```


## Install Nginx and PHP
1. Install nginx

   ```
   apt-get -y install nginx
   ```


2. Install PHP and mysql client

   ```sh
   apt-get -y install php-fpm php-mysql
   ```


3. Stop PHP service and nginx

   ```sh
   systemctl stop php7.0-fpm
   systemctl stop nginx
   ```


4. Set nginx conf, replace content of /etc/nginx/sites-available/default with the following:

  ```sh
  server {
          listen 80 default_server;
          listen [::]:80 default_server;

          root /mnt/www/html;

          # Add index.php to the list if you are using PHP        
          index index.php index.html index.htm index.nginx-debian.html;

          server_name _;

          location = /favicon.ico {
                  log_not_found off;
                  access_log off;
          }

          location = /robots.txt {
                  allow all;
                  log_not_found off;
                  access_log off;
          }

          location / {
                  # following https://codex.wordpress.org/Nginx
                  try_files $uri $uri/ /index.php?$args;
          }

          # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
          #
          location ~ \.php$ {
                  include snippets/fastcgi-php.conf;
                  fastcgi_pass unix:/run/php/php7.0-fpm.sock;
          }

          location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
                  expires max;
                  log_not_found off;
          }

          # deny access to .htaccess files, if Apache's document root
          # concurs with nginx's one
          #
          location ~ /\.ht {
                  deny all;
          }
  }
  ```

## Install and configure WordPress

1. To install and configure WordPress, run the following commands

   ```sh
   apt-get install curl
   cd /tmp
   curl -O https://wordpress.org/latest.tar.gz
   tar xzvf latest.tar.gz
   touch /tmp/wordpress/.htaccess
   chmod 660 /tmp/wordpress/.htaccess
   cp /tmp/wordpress/wp-config-sample.php /tmp/wordpress/wp-config.php
   mkdir /tmp/wordpress/wp-content/upgrade

   rsync -av -P /tmp/wordpress/. /mnt/www/html

   chown -R www-data:www-data /mnt/www/html

   find /mnt/www/html -type d -exec chmod g+s {} \;
   chmod g+w /mnt/www/html/wp-content
   chmod -R g+w /mnt/www/html/wp-content/themes
   chmod -R g+w /mnt/www/html/wp-content/plugins
   ```

2. Inject the result of this into /var/www/html/wp-config.php

   ```sh
   curl -s https://api.wordpress.org/secret-key/1.1/salt/
   ```

3. Inject the database credentials in wp-config.php

4. Start the service by running the following commands

   ```sh
   systemctl start php7.0-fpm
   systemctl start nginx
   ```

5. Proceed to wordpress configuration and view your live WordPress site in the browser

   ```sh
   http://YourAppServerIPAddress/
   ```

   ​

## Looking further

- Use a custom domain name by adding a CNAME record pointing to the LB URL
- [Import your SSL certificates in the load balancer](https://knowledgelayer.softlayer.com/procedure/access-ssl-certificates-screen)
- Create an image of the first server and use it to provision server 2
- Use a CDN in front of the load balancer to offload the servers
- Use Compose for MySQL to remove the need to manage a server or setup HyperDB to have master/slave for MySQL - or setup a MySQL cluster
- Use a Local Load Balancer and an auto-scaler



## Related information

[Accelerate delivery of static files using a CDN - Object Storage](static-files-cdn.html)

TODO - Add more to this list
