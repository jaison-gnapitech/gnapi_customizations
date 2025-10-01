#!/bin/bash

echo "🔄 Updating gnapi_customizations app inside Docker from Git..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOCKER_DIR="$SCRIPT_DIR/docker"

CONTAINER_NAME="docker-frappe-1"
APP_DIR="/home/frappe/frappe-bench/apps/gnapi_customizations"
SITE_NAME="mysite.localhost"
GIT_REPO="https://github.com/jaison-gnapitech/gnapi_customizations.git"
BENCH_DIR="/home/frappe/frappe-bench"

# Pull latest code inside container
echo "📥 Pulling latest code from Git inside container..."
docker-compose -f $DOCKER_DIR/docker-compose.yml exec -T -w $APP_DIR frappe bash -c "
    set -e

    if [ ! -d .git ]; then
        echo '⚠️ Git not initialized. Cloning repository...'
        rm -rf $APP_DIR/*
        git clone $GIT_REPO .
    fi

    git fetch origin main
    git reset --hard origin/main
    git clean -fd
    echo '✅ Latest code from Git applied.'
"

# Apply changes in ERPNext
echo "🔧 Running migrations, clearing cache, and restarting services..."
docker-compose -f $DOCKER_DIR/docker-compose.yml exec -T -w $BENCH_DIR frappe bash -c "
    set -e
    echo '🔧 Running migrate...'
    bench --site $SITE_NAME migrate

    echo '🧹 Clearing cache...'
    bench --site $SITE_NAME clear-cache
    bench --site $SITE_NAME clear-website-cache

    echo '🔨 Building assets...'
    bench build --app gnapi_customizations

    echo '🔄 Restarting services...'
    bench restart

    echo '✅ gnapi_customizations updated and active!'
"

echo "🚀 Update complete! Access your site at: http://localhost:8000"
