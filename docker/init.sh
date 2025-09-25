#!/bin/bash

if [ -d "/home/frappe/frappe-bench/apps/frappe" ]; then
    echo "Bench already exists, skipping init"
    cd frappe-bench
    bench start
else
    echo "Creating new bench..."
fi

export PATH="${NVM_DIR}/versions/node/v${NODE_VERSION_DEVELOP}/bin/:${PATH}"

bench init --skip-redis-config-generation frappe-bench

cd frappe-bench

# Use containers instead of localhost
bench set-mariadb-host mariadb
bench set-redis-cache-host redis://redis:6379
bench set-redis-queue-host redis://redis:6379
bench set-redis-socketio-host redis://redis:6379

# Remove redis, watch from Procfile
sed -i '/redis/d' ./Procfile
sed -i '/watch/d' ./Procfile

# Get base apps
bench get-app erpnext
bench get-app hrms

# Create new site
bench new-site mysite.localhost \
  --force \
  --mariadb-root-password 123 \
  --admin-password admin \
  --no-mariadb-socket

# Install HRMS first
bench --site mysite.localhost install-app hrms

# Install gnapi_customizations (custom app)
bench get-app gnapi_customizations https://github.com/jaison-gnapitech/gnapi_customizations.git
bench --site mysite.localhost install-app gnapi_customizations

# Setup configs
bench --site mysite.localhost set-config developer_mode 1
bench --site mysite.localhost enable-scheduler
bench --site mysite.localhost clear-cache

# Set default site
bench use mysite.localhost

# Start bench
bench start
