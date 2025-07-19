#!/bin/bash

# Docker Service Manager for Digital Tracking Merchandising Platform
# Senior Backend Developer - Microservices Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.microservices.yml"
PROJECT_NAME="digital_tracking_merchandising"
API_GATEWAY_PORT=8080
AUTH_SERVICE_PORT=3010
FRONTEND_PORT=3000
GRAFANA_PORT=3002

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

# Function to check if ports are available
check_ports() {
    print_status "Checking port availability..."
    
    local ports=($API_GATEWAY_PORT $AUTH_SERVICE_PORT $FRONTEND_PORT $GRAFANA_PORT 5432 5433 5434 5435 5436 5437 5438 5439 5440 6379 9090)
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
        else
            print_success "Port $port is available"
        fi
    done
}

# Function to stop and remove existing containers
cleanup() {
    print_status "Cleaning up existing containers..."
    
    if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down >/dev/null 2>&1; then
        print_success "Existing containers stopped"
    else
        print_warning "No existing containers to stop"
    fi
    
    # Remove dangling containers and networks
    docker system prune -f >/dev/null 2>&1 || true
}

# Function to start services in proper order
start_services() {
    print_status "Starting microservices in proper order..."
    
    # 1. Start databases first
    print_status "Starting databases..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d \
        auth-db user-db chat-db attendance-db todo-db \
        report-db approval-db workplace-db notification-db
    
    # Wait for databases to be healthy
    print_status "Waiting for databases to be healthy..."
    sleep 30
    
    # 2. Start Redis
    print_status "Starting Redis..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d redis
    
    # Wait for Redis to be healthy
    sleep 10
    
    # 3. Start microservices
    print_status "Starting microservices..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d \
        auth-service user-service chat-service attendance-service \
        todo-service report-service approval-service workplace-service \
        notification-service
    
    # Wait for microservices to be healthy
    print_status "Waiting for microservices to be healthy..."
    sleep 30
    
    # 4. Start API Gateway
    print_status "Starting API Gateway..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d api-gateway
    
    # Wait for API Gateway to be healthy
    sleep 15
    
    # 5. Start frontend applications
    print_status "Starting frontend applications..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d frontend-app mobile-app
    
    # 6. Start monitoring stack
    print_status "Starting monitoring stack..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d prometheus grafana nginx
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    local services=(
        "api-gateway:8080/health"
        "auth-service:3010/health"
        "frontend:3000"
        "grafana:3002"
        "prometheus:9090"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name url <<< "$service"
        if curl -f -s "http://localhost:$url" >/dev/null 2>&1; then
            print_success "$name is healthy"
        else
            print_error "$name is not responding"
        fi
    done
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo ""
    print_status "Service URLs:"
    echo "API Gateway: http://localhost:$API_GATEWAY_PORT"
    echo "Auth Service: http://localhost:$AUTH_SERVICE_PORT"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
    echo "Grafana: http://localhost:$GRAFANA_PORT"
    echo "Prometheus: http://localhost:9090"
}

# Function to show logs
show_logs() {
    local service=${1:-"api-gateway"}
    print_status "Showing logs for $service..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f $service
}

# Function to restart a specific service
restart_service() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service to restart"
        exit 1
    fi
    
    print_status "Restarting $service..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart $service
    print_success "$service restarted"
}

# Function to test database connectivity
test_databases() {
    print_status "Testing database connectivity..."
    
    local databases=(
        "auth-db:5432:auth_user:auth_db"
        "user-db:5433:user_user:user_db"
        "chat-db:5434:chat_user:chat_db"
        "attendance-db:5435:attendance_user:attendance_db"
        "todo-db:5436:todo_user:todo_db"
        "report-db:5437:report_user:report_db"
        "approval-db:5438:approval_user:approval_db"
        "workplace-db:5439:workplace_user:workplace_db"
        "notification-db:5440:notification_user:notification_db"
    )
    
    for db in "${databases[@]}"; do
        IFS=':' read -r name port user database <<< "$db"
        if docker exec $PROJECT_NAME-$name-1 pg_isready -U $user -d $database >/dev/null 2>&1; then
            print_success "$name is ready"
        else
            print_error "$name is not ready"
        fi
    done
}

# Function to test API endpoints
test_api() {
    print_status "Testing API endpoints..."
    
    # Test API Gateway health
    if curl -f -s "http://localhost:$API_GATEWAY_PORT/health" >/dev/null; then
        print_success "API Gateway health check passed"
    else
        print_error "API Gateway health check failed"
    fi
    
    # Test auth service through gateway
    if curl -f -s "http://localhost:$API_GATEWAY_PORT/api/test-auth" >/dev/null; then
        print_success "Auth service connectivity test passed"
    else
        print_error "Auth service connectivity test failed"
    fi
    
    # Test database connectivity through gateway
    if curl -f -s "http://localhost:$API_GATEWAY_PORT/api/test-auth-db" >/dev/null; then
        print_success "Database connectivity test passed"
    else
        print_error "Database connectivity test failed"
    fi
}

# Main script logic
case "${1:-start}" in
    "start")
        check_ports
        cleanup
        start_services
        sleep 10
        check_health
        show_status
        print_success "All services started successfully!"
        ;;
    "stop")
        print_status "Stopping all services..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
        print_success "All services stopped"
        ;;
    "restart")
        print_status "Restarting all services..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME restart
        print_success "All services restarted"
        ;;
    "status")
        show_status
        ;;
    "health")
        check_health
        ;;
    "logs")
        show_logs $2
        ;;
    "restart-service")
        restart_service $2
        ;;
    "test-db")
        test_databases
        ;;
    "test-api")
        test_api
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|health|logs|restart-service|test-db|test-api|cleanup}"
        echo ""
        echo "Commands:"
        echo "  start           - Start all services in proper order"
        echo "  stop            - Stop all services"
        echo "  restart         - Restart all services"
        echo "  status          - Show service status and URLs"
        echo "  health          - Check service health"
        echo "  logs [service]  - Show logs for a specific service"
        echo "  restart-service [service] - Restart a specific service"
        echo "  test-db         - Test database connectivity"
        echo "  test-api        - Test API endpoints"
        echo "  cleanup         - Clean up existing containers"
        exit 1
        ;;
esac 