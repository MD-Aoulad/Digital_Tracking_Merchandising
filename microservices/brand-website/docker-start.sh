#!/bin/bash

# Brand Website Docker Startup Script
# This script will build and run the brand website in Docker

set -e

echo "🚀 Starting Brand Website Docker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is running"
}

# Stop existing container if running
stop_existing_container() {
    print_status "Checking for existing brand-website container..."
    if docker ps -q -f name=brand-website | grep -q .; then
        print_warning "Found existing brand-website container. Stopping it..."
        docker stop brand-website
        docker rm brand-website
        print_success "Existing container stopped and removed"
    else
        print_status "No existing container found"
    fi
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    docker build -t brand-website:latest .
    print_success "Docker image built successfully"
}

# Run Docker container
run_container() {
    print_status "Starting brand-website container..."
    docker run -d \
        --name brand-website \
        -p 3013:3013 \
        --restart unless-stopped \
        brand-website:latest
    
    print_success "Container started successfully"
}

# Check container health
check_health() {
    print_status "Checking container health..."
    sleep 5
    
    if docker ps -q -f name=brand-website | grep -q .; then
        print_success "Container is running"
        
        # Check if website is accessible
        print_status "Testing website accessibility..."
        if curl -f http://localhost:3013 > /dev/null 2>&1; then
            print_success "Website is accessible at http://localhost:3013"
        else
            print_warning "Website might take a moment to start. Please check http://localhost:3013"
        fi
    else
        print_error "Container failed to start"
        docker logs brand-website
        exit 1
    fi
}

# Show container status
show_status() {
    print_status "Container status:"
    docker ps -f name=brand-website
    
    echo ""
    print_status "Container logs:"
    docker logs brand-website --tail 10
}

# Main execution
main() {
    echo "🏢 Brand Website Docker Deployment"
    echo "=================================="
    
    check_docker
    stop_existing_container
    build_image
    run_container
    check_health
    show_status
    
    echo ""
    print_success "🎉 Brand Website is now running!"
    echo ""
    echo "📱 Access your website at: http://localhost:3013"
    echo "🐳 Container name: brand-website"
    echo "📊 View logs: docker logs brand-website"
    echo "🛑 Stop container: docker stop brand-website"
    echo "🔄 Restart container: docker restart brand-website"
    echo ""
}

# Run main function
main "$@" 