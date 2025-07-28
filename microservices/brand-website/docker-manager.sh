#!/bin/bash

# Brand Website Docker Manager
# This script provides easy management of the brand website Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Check if Docker is running
check_docker() {
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

# Start the brand website
start_website() {
    print_header "🚀 Starting Brand Website..."
    
    # Stop existing container if running
    if docker ps -q -f name=brand-website | grep -q .; then
        print_warning "Found existing brand-website container. Stopping it..."
        docker stop brand-website
        docker rm brand-website
        print_success "Existing container stopped and removed"
    fi
    
    # Build Docker image
    print_status "Building Docker image..."
    docker build -t brand-website:latest .
    print_success "Docker image built successfully"
    
    # Run Docker container
    print_status "Starting brand-website container..."
    docker run -d \
        --name brand-website \
        -p 3013:3013 \
        --restart unless-stopped \
        brand-website:latest
    
    print_success "Container started successfully"
    
    # Check health
    sleep 5
    if docker ps -q -f name=brand-website | grep -q .; then
        print_success "Container is running"
        print_success "Website accessible at: http://localhost:3013"
    else
        print_error "Container failed to start"
        docker logs brand-website
        exit 1
    fi
}

# Stop the brand website
stop_website() {
    print_header "🛑 Stopping Brand Website..."
    
    if docker ps -q -f name=brand-website | grep -q .; then
        docker stop brand-website
        docker rm brand-website
        print_success "Brand website stopped and removed"
    else
        print_warning "No running brand-website container found"
    fi
}

# Restart the brand website
restart_website() {
    print_header "🔄 Restarting Brand Website..."
    stop_website
    sleep 2
    start_website
}

# Show status
show_status() {
    print_header "📊 Brand Website Status"
    
    echo ""
    print_status "Container Status:"
    docker ps -f name=brand-website
    
    echo ""
    print_status "Recent Logs:"
    if docker ps -q -f name=brand-website | grep -q .; then
        docker logs brand-website --tail 10
    else
        print_warning "Container is not running"
    fi
    
    echo ""
    print_status "Docker Images:"
    docker images | grep brand-website
}

# Show logs
show_logs() {
    print_header "📋 Brand Website Logs"
    
    if docker ps -q -f name=brand-website | grep -q .; then
        docker logs -f brand-website
    else
        print_warning "Container is not running"
    fi
}

# Clean up everything
cleanup() {
    print_header "🧹 Cleaning Up Brand Website"
    
    # Stop and remove container
    if docker ps -q -f name=brand-website | grep -q .; then
        docker stop brand-website
        docker rm brand-website
        print_success "Container stopped and removed"
    fi
    
    # Remove image
    if docker images -q brand-website:latest | grep -q .; then
        docker rmi brand-website:latest
        print_success "Docker image removed"
    fi
    
    print_success "Cleanup completed"
}

# Show help
show_help() {
    print_header "🏢 Brand Website Docker Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start the brand website"
    echo "  stop      - Stop the brand website"
    echo "  restart   - Restart the brand website"
    echo "  status    - Show container status and logs"
    echo "  logs      - Show real-time logs"
    echo "  cleanup   - Stop and remove everything"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start the website"
    echo "  $0 status   # Check status"
    echo "  $0 stop     # Stop the website"
    echo ""
}

# Main execution
main() {
    check_docker
    
    case "${1:-help}" in
        start)
            start_website
            ;;
        stop)
            stop_website
            ;;
        restart)
            restart_website
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        cleanup)
            cleanup
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@" 