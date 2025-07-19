#!/bin/bash

# Digital Tracking Merchandising - Docker Development Management Script
# This script provides easy management of the Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="digital-tracking-dev"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
}

# Function to check if ports are available
check_ports() {
    local ports=("3001" "5001" "3003" "5433" "6380" "8081" "9091" "3004")
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            conflicts+=($port)
        fi
    done
    
    if [ ${#conflicts[@]} -gt 0 ]; then
        print_warning "The following ports are already in use: ${conflicts[*]}"
        print_warning "This might cause conflicts with Docker services."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to start development environment
start_dev() {
    print_header "Starting Docker Development Environment"
    check_docker
    check_ports
    
    print_status "Building and starting services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    print_status "Checking service health..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    print_header "Development Environment Started Successfully!"
    echo -e "${GREEN}Services available at:${NC}"
    echo -e "  Frontend (React):     ${BLUE}http://localhost:3001${NC}"
    echo -e "  Backend (API):        ${BLUE}http://localhost:5001${NC}"
    echo -e "  Mobile App:           ${BLUE}http://localhost:3003${NC}"
    echo -e "  Nginx Proxy:          ${BLUE}http://localhost:8081${NC}"
    echo -e "  Grafana Dashboard:    ${BLUE}http://localhost:3004${NC} (admin/admin)"
    echo -e "  Prometheus:           ${BLUE}http://localhost:9091${NC}"
    echo -e "  PostgreSQL:           ${BLUE}localhost:5433${NC}"
    echo -e "  Redis:                ${BLUE}localhost:6380${NC}"
    echo
    echo -e "${YELLOW}Note: Your local development environment is still running on ports 3000 and 5000${NC}"
}

# Function to stop development environment
stop_dev() {
    print_header "Stopping Docker Development Environment"
    print_status "Stopping services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    
    print_status "Development environment stopped."
}

# Function to restart development environment
restart_dev() {
    print_header "Restarting Docker Development Environment"
    stop_dev
    start_dev
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
    else
        print_status "Showing logs for service: $service"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $service
    fi
}

# Function to show status
show_status() {
    print_header "Docker Development Environment Status"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo
    print_status "Service URLs:"
    echo -e "  Frontend (React):     ${BLUE}http://localhost:3001${NC}"
    echo -e "  Backend (API):        ${BLUE}http://localhost:5001${NC}"
    echo -e "  Mobile App:           ${BLUE}http://localhost:3003${NC}"
    echo -e "  Nginx Proxy:          ${BLUE}http://localhost:8081${NC}"
    echo -e "  Grafana Dashboard:    ${BLUE}http://localhost:3004${NC}"
    echo -e "  Prometheus:           ${BLUE}http://localhost:9091${NC}"
}

# Function to clean up
cleanup() {
    print_header "Cleaning Up Docker Development Environment"
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping and removing containers..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --remove-orphans
        
        print_status "Removing unused Docker resources..."
        docker system prune -f
        
        print_status "Cleanup completed."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to execute commands in containers
exec_container() {
    local service=${1:-""}
    local command=${2:-"sh"}
    
    if [ -z "$service" ]; then
        print_error "Please specify a service name."
        echo "Usage: $0 exec <service> [command]"
        exit 1
    fi
    
    print_status "Executing '$command' in $service container..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec $service $command
}

# Function to show help
show_help() {
    print_header "Docker Development Management Script"
    echo
    echo "Usage: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  start       Start the development environment"
    echo "  stop        Stop the development environment"
    echo "  restart     Restart the development environment"
    echo "  status      Show status of all services"
    echo "  logs        Show logs (all services or specific service)"
    echo "  exec        Execute command in a container"
    echo "  cleanup     Remove all containers, networks, and volumes"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs                     # Show all logs"
    echo "  $0 logs backend-dev         # Show backend logs"
    echo "  $0 exec backend-dev bash    # Open bash in backend container"
    echo "  $0 status                   # Show service status"
    echo
    echo "Available services:"
    echo "  frontend-dev, backend-dev, mobile-app-dev, postgres-dev, redis-dev"
    echo "  nginx-dev, prometheus-dev, grafana-dev, db-backup-dev"
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    exec)
        exec_container $2 $3
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac 