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

- Provision one database server and install MySQL
- Setup VPN and create database
- Create file storage for database backups
- Provision two Ubuntu servers and install **P**HP runtime
- Create one file storage service to store the source code files for the two application servers
- Provision one load balancer server and configure the server to load balance the traffic

## Products
{: #products}

This tutorial uses the following products:
* [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group)
* [File Storage](https://console.bluemix.net/catalog/infrastructure/file-storage?taxonomyNavigation=apps)
* [Load Balancer](https://console.bluemix.net/catalog/infrastructure/ibm-bluemix-load-balancer)

<p style="text-align: center;">
![Architecture diagram](images/solution14/highly-available-wordpress-architecture.png)
</p>

TODO - update the digram

1. The user does this
2. Then that
3. TODO - Add steps for each case as per diagram

## Before you begin
{: #prereqs}

Contact your Infrastructure master user to get the following permissions:
- Network (to add **Public and Private Network Uplink**)
- TODO - Add more to this list

## Provision a database server

{: #database_server}

1. Go to the catalog in the {{site.data.keyword.Bluemix}} console, and select the [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group) service from the Infrastructure section.

2. Select **Public Virtual Server** and then click **Create**.

3. Configure the server with the following:

   - Under **Name**, name it db1

   - Under **Region**, select LON06 - London or any other region best for your application.

   - Under **Image**, select the **Ubuntu** and the latest version of **Minima**.

   - Under **Popular Flavors**, select the entry option or higher if you need a higher option. **TODO** - maybe we should select a higher spec. Something we need to revisit.

   - Under **Attached Storage Disks**, select the entry 25GB or bigger if needed.

   - Under **Network Interface**, select the **Private Network Uplink** option.

   - Review the other configuration options and click **Provision** to provision the server.    ![Configure virtual server](images/solution14/db-server.png)
```ssh
Note: The provisioning process can take 2 to 5 minutes for the server to be ready for use. After the server is created, you'll see the server login credentials. To SSH into the server, you need the server user name, password, and public IP address.
```

## Setup VPN and create database
Earlier we didn't add a Public IP address for the server, so we need to use the Softlayer VPN first and then we can do SSH to the server. To install and then ssh into the database server, follow the steps below.

1. Install the Softlayer VPN application, [Mac](https://knowledgelayer.softlayer.com/procedure/ssl-vpn-mac-os-x-1010), [Windows]() or [others]().

2. To connect you would need the following:

  - Under **Name**, type db1.IBM.com
  - Under **Host**, type vpn.dal09.softlayer.com
  - Under Username and password, add your Infrastructure  username and password.
  - Then click **OK** to connect

3. Connect to the server by using SSH and run the following commands on the server.
   ```sh
   sudo ssh root@<Private-IP-Address>
   ```
4. Install MySQL  
  ```sh
  sudo apt-get update
  sudo apt-get install mysql-server
  ```
5. Run the following script to help secure MySQL database:
  ```sh
  mysql_secure_installation
  ```
6. Login to MySQL and create a database called wordpress
  ```sh
  mysql -u root -p
  CREATE DATABASE wordpress;
  ```
7. Grant access to database
  ```
  GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,ALTER ON wordpress.*
  TO root@'%'
  IDENTIFIED BY '<database-password>';
  FLUSH PRIVILEGES;
  ```

## Create file storage service

1. Go to the catalog in the {{site.data.keyword.Bluemix}} console, and select the [Virtual Server](https://console.bluemix.net/catalog/infrastructure/virtual-server-group) service from the Infrastructure section.
2. From the Infrastructure dashboard, select your server from the list of devices and then click the storage tab and then **file storage**.
3. Click **order file storage** and then configure the service with the following:
   - Under **Storage Type**, Endurance option.
   - Under **Location**, select Lon06 - London or the location you selected for the database server.
   - Select the billing option where hourly or monthly
   - Under **Storage Packages**, select 2 IOPS/GB
   - Under **Storage Size**, select 100GB
   - Under **Snapshot Space Size**, select 40GB
   - Click continue to create the service.
4. Under the file storage service created, click on it and then click on the menu tab and authorise host to authorise the host.

## Mount file storage for database backups

There are many ways in which backups can be done and stored when comes to MySQL. For this tutorial we are going to use file storage to store the backup database data. Follow the steps below to create file storage and mount it to the server.

1. Downloading and Installing the Components
  ```sh
  apt-get -y install nfs-common
  ```
2. Create a file called mnt-database.mount
  ```sh
  nano /etc/systemd/system/mnt-database.mount
  ```
3. Store the following inside the mnt-database.mount file
  ```sh
  [Unit]
  Description = Mount for Container Storage

  [Mount]
  What=<CHANGE_ME-TO-WHAT - /etc/systemd/system/mnt-database.mount>
  Where=/mnt/database
  Type=nfs
  Options=vers=3,sec=sys,noauto

  [Install]
  WantedBy = multi-user.target
  ```
4. Create a folder called database to store the backup database
  ```sh
  mkdir /mnt/database
  ```
5. Mount the storage
  ```sh
  systemctl enable --now /etc/systemd/system/mnt-database.mount
  ```
6. Check if the mount was successfully done
  ```sh
  mount
  ```


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
