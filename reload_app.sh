#!/bin/bash

echo "🔄 Updating gnapi_customizations app with local changes..."

# Navigate to docker directory
cd "$(dirname "$0")/docker"

# Execute commands inside the Frappe container
docker-compose exec frappe bash -c "
    cd /home/frappe/frappe-bench
    
    echo '📁 Syncing local changes to app directory...'
    # Copy local changes to the app directory
    if [ -d '/workspace/gnapi_customizations' ]; then
        cp -r /workspace/gnapi_customizations/* /home/frappe/frappe-bench/apps/gnapi_customizations/
        echo '✅ Local changes synced to app directory'
    else
        echo '⚠️ Local gnapi_customizations directory not found in /workspace'
    fi
    
    echo '🔧 Running migration to apply changes...'
    bench --site mysite.localhost migrate
    
    echo '🧹 Clearing cache...'
    bench --site mysite.localhost clear-cache
    
    echo '🔄 Restarting services...'
    bench restart
    
    echo '✅ App updated successfully with local changes!'
"

echo "🚀 gnapi_customizations app has been updated with your local changes!"
echo "📱 Access your site at: http://localhost:8000"
