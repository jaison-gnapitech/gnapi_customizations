#!/bin/bash

# Advanced reload script with git operations
# Usage: ./reload_app_advanced.sh [branch_name]

BRANCH=${1:-main}

echo "🔄 Updating gnapi_customizations app with latest code from branch: $BRANCH"

# Navigate to project root
cd "$(dirname "$0")"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please initialize git first."
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status --porcelain

# Pull latest code from git
echo "📥 Pulling latest code from git branch: $BRANCH"
if git pull origin $BRANCH; then
    echo "✅ Successfully pulled latest code"
else
    echo "⚠️ Git pull failed. Continuing with local changes..."
fi

# Navigate to docker directory
cd docker

# Execute commands inside the Frappe container
docker-compose exec frappe bash -c "
    cd /home/frappe/frappe-bench
    
    echo '📁 Syncing latest code to app directory...'
    # Copy latest changes to the app directory
    if [ -d '/workspace/gnapi_customizations' ]; then
        cp -r /workspace/gnapi_customizations/* /home/frappe/frappe-bench/apps/gnapi_customizations/
        echo '✅ Latest code synced to app directory'
    else
        echo '⚠️ Local gnapi_customizations directory not found in /workspace'
    fi
    
    echo '🔧 Running migration to apply changes...'
    bench --site mysite.localhost migrate
    
    echo '🧹 Clearing cache...'
    bench --site mysite.localhost clear-cache
    
    echo '🔄 Restarting services...'
    bench restart
    
    echo '✅ App updated successfully with latest code!'
"

echo "🚀 gnapi_customizations app has been updated with latest code!"
echo "📱 Access your site at: http://localhost:8000"
echo "🌿 Branch: $BRANCH"
