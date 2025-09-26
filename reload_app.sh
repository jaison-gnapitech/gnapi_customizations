#!/bin/bash

echo "🔄 Updating gnapi_customizations app with latest code from git..."

# Navigate to project root
cd "$(dirname "$0")"

# Pull latest code from git
echo "📥 Pulling latest code from git repository..."
git pull origin main

# Navigate to docker directory
cd docker

# Execute commands inside the Frappe container
docker-compose exec frappe bash -c "
    cd /home/frappe/frappe-bench
    
    echo '📥 Pulling latest code from git repository...'
    # Navigate to the app directory and pull from git
    if [ -d 'apps/gnapi_customizations' ]; then
        cd apps/gnapi_customizations
        git pull origin main
        echo '✅ Latest code pulled from git repository'
        cd /home/frappe/frappe-bench
    else
        echo '⚠️ gnapi_customizations app directory not found'
        echo '📁 Creating app directory and cloning from git...'
        # Clone the repository if it doesn't exist
        git clone https://github.com/jaison-gnapitech/gnapi_customizations.git apps/gnapi_customizations
        echo '✅ Repository cloned from git'
    fi
    
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
