#!/bin/bash

# Workforce Management - Microservices Development Management Script
# This script provides professional management of the microservices architecture

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.microservices.yml"
PROJECT_NAME="workforce-microservices"

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

print_service() {
    echo -e "${CYAN}[SERVICE]${NC} $1"
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
    local ports=("3000" "3001" "3002" "3003" "3004" "3005" "3006" "3007" "3008" "3009" "8080" "80" "6379" "9090")
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            conflicts+=($port)
        fi
    done
    
    if [ ${#conflicts[@]} -gt 0 ]; then
        print_warning "The following ports are already in use: ${conflicts[*]}"
        print_warning "This might cause conflicts with microservices."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to start microservices environment
start_microservices() {
    print_header "Starting Microservices Architecture"
    check_docker
    check_ports
    
    print_status "Building and starting microservices..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check service health
    print_status "Checking microservices health..."
    check_microservices_health
    
    print_header "Microservices Architecture Started Successfully!"
    echo -e "${GREEN}Services available at:${NC}"
    echo -e "  API Gateway:          ${BLUE}http://localhost:8080${NC}"
    echo -e "  Frontend App:         ${BLUE}http://localhost:3000${NC}"
    echo -e "  Mobile App:           ${BLUE}http://localhost:3002${NC}"
    echo -e "  Load Balancer:        ${BLUE}http://localhost:80${NC}"
    echo -e "  Grafana Dashboard:    ${BLUE}http://localhost:3001${NC} (admin/admin)"
    echo -e "  Prometheus:           ${BLUE}http://localhost:9090${NC}"
    echo -e "  Redis:                ${BLUE}localhost:6379${NC}"
    echo
    echo -e "${PURPLE}Microservices:${NC}"
    echo -e "  Auth Service:         ${BLUE}http://localhost:3001${NC}"
    echo -e "  User Service:         ${BLUE}http://localhost:3002${NC}"
    echo -e "  Chat Service:         ${BLUE}http://localhost:3003${NC}"
    echo -e "  Attendance Service:   ${BLUE}http://localhost:3004${NC}"
    echo -e "  Todo Service:         ${BLUE}http://localhost:3005${NC}"
    echo -e "  Report Service:       ${BLUE}http://localhost:3006${NC}"
    echo -e "  Approval Service:     ${BLUE}http://localhost:3007${NC}"
    echo -e "  Workplace Service:    ${BLUE}http://localhost:3008${NC}"
    echo -e "  Notification Service: ${BLUE}http://localhost:3009${NC}"
    echo
    echo -e "${YELLOW}Note: Each microservice has its own database and can scale independently${NC}"
}

# Function to check microservices health
check_microservices_health() {
    local services=(
        "api-gateway:8080"
        "auth-service:3001"
        "user-service:3002"
        "chat-service:3003"
        "attendance-service:3004"
        "todo-service:3005"
        "report-service:3006"
        "approval-service:3007"
        "workplace-service:3008"
        "notification-service:3009"
    )
    
    for service in "${services[@]}"; do
        local service_name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
            print_service "$service_name: ✅ Healthy"
        else
            print_service "$service_name: ❌ Unhealthy"
        fi
    done
}

# Function to stop microservices environment
stop_microservices() {
    print_header "Stopping Microservices Architecture"
    print_status "Stopping all microservices..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    
    print_status "Microservices environment stopped."
}

# Function to restart microservices environment
restart_microservices() {
    print_header "Restarting Microservices Architecture"
    stop_microservices
    start_microservices
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all microservices..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
    else
        print_status "Showing logs for service: $service"
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $service
    fi
}

# Function to show status
show_status() {
    print_header "Microservices Architecture Status"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo
    print_status "Service URLs:"
    echo -e "  API Gateway:          ${BLUE}http://localhost:8080${NC}"
    echo -e "  Frontend App:         ${BLUE}http://localhost:3000${NC}"
    echo -e "  Mobile App:           ${BLUE}http://localhost:3002${NC}"
    echo -e "  Load Balancer:        ${BLUE}http://localhost:80${NC}"
    echo -e "  Grafana Dashboard:    ${BLUE}http://localhost:3001${NC}"
    echo -e "  Prometheus:           ${BLUE}http://localhost:9090${NC}"
    echo
    print_status "Microservices Health Check:"
    check_microservices_health
}

# Function to scale microservices
scale_service() {
    local service=${1:-""}
    local replicas=${2:-2}
    
    if [ -z "$service" ]; then
        print_error "Please specify a service name and number of replicas."
        echo "Usage: $0 scale <service> <replicas>"
        echo "Available services:"
        echo "  auth-service, user-service, chat-service, attendance-service"
        echo "  todo-service, report-service, approval-service, workplace-service"
        echo "  notification-service"
        exit 1
    fi
    
    print_status "Scaling $service to $replicas replicas..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --scale $service=$replicas
    
    print_status "Service $service scaled to $replicas replicas."
}

# Function to clean up
cleanup() {
    print_header "Cleaning Up Microservices Architecture"
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
    print_header "Microservices Development Management Script"
    echo
    echo "Usage: $0 <command> [options]"
    echo
    echo "Commands:"
    echo "  start       Start the microservices architecture"
    echo "  stop        Stop the microservices architecture"
    echo "  restart     Restart the microservices architecture"
    echo "  status      Show status of all microservices"
    echo "  health      Check health of all microservices"
    echo "  logs        Show logs (all services or specific service)"
    echo "  scale       Scale a specific microservice"
    echo "  exec        Execute command in a container"
    echo "  cleanup     Remove all containers, networks, and volumes"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start                    # Start all microservices"
    echo "  $0 logs                     # Show all logs"
    echo "  $0 logs chat-service        # Show chat service logs"
    echo "  $0 exec chat-service bash   # Open bash in chat service"
    echo "  $0 status                   # Show service status"
    echo "  $0 scale chat-service 3     # Scale chat service to 3 replicas"
    echo "  $0 health                   # Check all services health"
    echo
    echo "Available microservices:"
    echo "  api-gateway, auth-service, user-service, chat-service"
    echo "  attendance-service, todo-service, report-service"
    echo "  approval-service, workplace-service, notification-service"
    echo
    echo "Architecture Benefits:"
    echo "  ✅ Independent scaling of each service"
    echo "  ✅ Isolated databases per service"
    echo "  ✅ Fault tolerance and resilience"
    echo "  ✅ Technology diversity per service"
    echo "  ✅ Independent deployment cycles"
    echo "  ✅ Team autonomy and ownership"
}

# Function to check health
check_health() {
    print_header "Microservices Health Check"
    check_microservices_health
}

# Main script logic
case "${1:-help}" in
    start)
        start_microservices
        ;;
    stop)
        stop_microservices
        ;;
    restart)
        restart_microservices
        ;;
    status)
        show_status
        ;;
    health)
        check_health
        ;;
    logs)
        show_logs $2
        ;;
    scale)
        scale_service $2 $3
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