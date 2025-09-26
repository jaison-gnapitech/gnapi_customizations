#!/bin/bash

echo "🔄 Reloading gnapi_customizations app with local changes..."

# Navigate to docker directory
cd "$(dirname "$0")/docker"

# Execute commands inside the Frappe container
docker-compose exec frappe bash -c "
    cd /home/frappe/frappe-bench
    
    echo '📦 Uninstalling gnapi_customizations app...'
    bench --site mysite.localhost uninstall-app gnapi_customizations --yes --no-backup
    
    echo '🗑️ Removing app from bench...'
    bench remove-app gnapi_customizations
    
    echo '📁 Adding local app to bench...'
    bench get-app /home/frappe/frappe-bench/apps/gnapi_customizations
    
    echo '⚙️ Installing app with local changes...'
    bench --site mysite.localhost install-app gnapi_customizations --force
    
    echo '🔧 Running migration...'
    bench --site mysite.localhost migrate
    
    echo '🧹 Clearing cache...'
    bench --site mysite.localhost clear-cache
    
    echo '✅ App reloaded successfully with local changes!'
"

echo "🚀 gnapi_customizations app has been reloaded with your local changes!"
echo "📱 Access your site at: http://localhost:8000"
