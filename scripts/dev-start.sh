#!/bin/bash

# Development startup script for microservices
# This script starts only the essential services for development

echo "🚀 Starting Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.microservices.yml down

# Start development environment
echo "🔧 Starting development services..."
docker-compose -f docker-compose.microservices.yml -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.microservices.yml -f docker-compose.dev.yml ps

echo ""
echo "✅ Development environment started!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   API Gateway: http://localhost:8080"
echo "   Auth Service: http://localhost:3010"
echo "   Chat Service: http://localhost:3012"
echo ""
echo "📝 Development Tips:"
echo "   - Frontend hot reload is enabled"
echo "   - API Gateway hot reload is enabled"
echo "   - Auth & Chat services have hot reload"
echo "   - Use 'docker-compose logs -f [service-name]' to watch logs"
echo ""
echo "🛑 To stop: docker-compose -f docker-compose.microservices.yml down" 