#!/bin/bash

echo "🔄 Updating gnapi_customizations app with latest code from git..."

# Navigate to project root
cd "$(dirname "$0")"

# Pull latest code from git
echo "📥 Pulling latest code from git repository..."
git pull origin main

# Navigate to docker directory
cd docker

# Copy the entire gnapi_customizations directory to the container
echo "📁 Copying local changes to container..."
docker-compose exec frappe bash -c "mkdir -p /home/frappe/frappe-bench/apps/gnapi_customizations"

# Copy files from host to container using docker cp
echo "📁 Copying files from host to container..."
docker cp ../gnapi_customizations/. docker-frappe-1:/home/frappe/frappe-bench/apps/gnapi_customizations/

# Verify and copy JavaScript files individually
echo "📁 Ensuring JavaScript files are copied..."
docker cp ../gnapi_customizations/public/js/custom_timesheet_navigation.js docker-frappe-1:/home/frappe/frappe-bench/apps/gnapi_customizations/public/js/custom_timesheet_navigation.js
docker cp ../gnapi_customizations/public/js/timesheet_navigation_override.js docker-frappe-1:/home/frappe/frappe-bench/apps/gnapi_customizations/public/js/timesheet_navigation_override.js
docker cp ../gnapi_customizations/public/js/timesheet_override_direct.js docker-frappe-1:/home/frappe/frappe-bench/apps/gnapi_customizations/public/js/timesheet_override_direct.js

echo "✅ Local changes copied to container"

# Execute commands inside the Frappe container
docker-compose exec frappe bash -c "
    cd /home/frappe/frappe-bench
    
    echo '🔧 Running migration to apply changes...'
    bench --site mysite.localhost migrate
    
    echo '🧹 Clearing cache...'
    bench --site mysite.localhost clear-cache
    
    echo '🔄 Restarting services...'
    bench restart
    
    echo '✅ App updated successfully with latest code from git!'
"

echo "🚀 gnapi_customizations app has been updated with latest code from git!"
echo "📱 Access your site at: http://localhost:8000"
