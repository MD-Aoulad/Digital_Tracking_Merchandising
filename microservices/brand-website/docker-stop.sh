#!/bin/bash

# Brand Website Docker Stop Script
# This script will stop and clean up the brand website Docker container

set -e

echo "🛑 Stopping Brand Website Docker Container..."

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

# Stop and remove container
stop_container() {
    print_status "Stopping brand-website container..."
    
    if docker ps -q -f name=brand-website | grep -q .; then
        docker stop brand-website
        print_success "Container stopped"
        
        print_status "Removing container..."
        docker rm brand-website
        print_success "Container removed"
    else
        print_warning "No running brand-website container found"
    fi
}

# Remove Docker image (optional)
remove_image() {
    read -p "Do you want to remove the Docker image as well? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing Docker image..."
        docker rmi brand-website:latest
        print_success "Docker image removed"
    else
        print_status "Docker image kept for future use"
    fi
}

# Show cleanup status
show_status() {
    print_status "Cleanup completed"
    echo ""
    print_status "To restart the website:"
    echo "  ./docker-start.sh"
    echo ""
    print_status "To check running containers:"
    echo "  docker ps"
    echo ""
    print_status "To view all containers (including stopped):"
    echo "  docker ps -a"
}

# Main execution
main() {
    echo "🛑 Brand Website Docker Cleanup"
    echo "==============================="
    
    stop_container
    remove_image
    show_status
    
    print_success "🎉 Brand Website stopped successfully!"
}

# Run main function
main "$@" 