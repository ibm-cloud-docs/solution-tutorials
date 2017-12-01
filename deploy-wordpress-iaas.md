
## mount storage

```
apt-get -y install nfs-common
```

```
mkdir /mnt/www
```

in /etc/systemd/system/mnt-www.mount
```
[Unit]
Description = Mount for Container Storage

[Mount]
What=fsf-lon0601a-fz.adn.networklayer.com:/IBM02SEV1329499_109/data01
Where=/mnt/www
Type=nfs
Options=vers=3,sec=sys,noauto

[Install]
WantedBy = multi-user.target
```

```
systemctl enable --now /etc/systemd/system/mnt-www.mount
```

## install nginx

```
apt-get -y install nginx
```

### php and mysql client

```
apt-get -y install php-fpm php-mysql
```

### stop PHP service and nginx
systemctl stop php7.0-fpm
systemctl stop nginx

### set nginx conf

replace content of /etc/nginx/sites-available/default with

```
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

# install wordpress

```
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

## inject the result of this into /var/www/html/wp-config.php
curl -s https://api.wordpress.org/secret-key/1.1/salt/

## inject the database credentials in wp-config.php

# start the service
systemctl start php7.0-fpm
systemctl start nginx

# proceed to wordpress configuration
http://yourserver/
