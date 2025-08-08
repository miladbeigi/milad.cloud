#!/bin/bash

# Script to run the Hugo site locally using Docker

echo "🚀 Starting Milad.cloud locally..."
echo "📍 Site will be available at: http://localhost:8080"
echo "📝 Serving pre-built static files with nginx"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start the containers
echo "📦 Building and starting containers..."
docker compose up --build

echo ""
echo "✅ Site is running! Press Ctrl+C to stop."
