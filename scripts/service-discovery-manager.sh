#!/bin/bash

# Digital Tracking Merchandising Platform - Service Discovery Manager
# Network Engineer - Service Discovery and Registration Script
# Usage: ./scripts/service-discovery-manager.sh [command] [service]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="digital_tracking_merchandising"
NETWORK_NAME="microservices-network"
SERVICES=(
    "api-gateway:8080:/health"
    "auth-service:3010:/health"
    "user-service:3002:/health"
    "todo-service:3005:/health"
    "chat-service:3003:/health"
    "attendance-service:3004:/health"
    "report-service:3006:/health"
    "approval-service:3007:/health"
    "workplace-service:3008:/health"
    "notification-service:3009:/health"
    "frontend:3000:/"
)

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
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker before proceeding."
        exit 1
    fi
}

# Register a service
register_service() {
    local service_name=$1
    local port=$2
    local health_endpoint=$3
    
    print_status "Registering service: $service_name on port $port"
    
    # Check if service container is running
    local container_name="${PROJECT_NAME}_${service_name}-1"
    if ! docker ps --format "{{.Names}}" | grep -q "$container_name"; then
        print_warning "Service container '$container_name' is not running"
        return 1
    fi
    
    # Get container IP
    local container_ip=$(docker inspect "$container_name" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}")
    
    if [ -z "$container_ip" ]; then
        print_warning "Cannot get IP address for service '$service_name'"
        return 1
    fi
    
    # Test service health
    if curl -f -s "http://$container_ip:$port$health_endpoint" >/dev/null 2>&1; then
        print_success "Service '$service_name' is healthy at $container_ip:$port"
        echo "$service_name:$container_ip:$port:$health_endpoint" >> /tmp/service-registry.txt
    else
        print_warning "Service '$service_name' is not responding at $container_ip:$port"
        return 1
    fi
}

# Unregister a service
unregister_service() {
    local service_name=$1
    
    print_status "Unregistering service: $service_name"
    
    if [ -f /tmp/service-registry.txt ]; then
        sed -i "/^$service_name:/d" /tmp/service-registry.txt
        print_success "Service '$service_name' unregistered"
    else
        print_warning "No service registry found"
    fi
}

# List all registered services
list_services() {
    print_header "Registered Services"
    echo ""
    
    if [ -f /tmp/service-registry.txt ]; then
        echo -e "${CYAN}Service Registry:${NC}"
        echo "Service Name | IP Address | Port | Health Endpoint"
        echo "------------|------------|------|----------------"
        while IFS=':' read -r name ip port endpoint; do
            echo "$name | $ip | $port | $endpoint"
        done < /tmp/service-registry.txt
    else
        print_warning "No services registered"
    fi
    
    echo ""
    print_status "Current Docker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $PROJECT_NAME || print_warning "No project containers running"
}

# Health check all services
health_check() {
    local service_name=$1
    
    print_header "Service Health Check"
    echo ""
    
    if [ -n "$service_name" ]; then
        # Check specific service
        print_status "Checking health of service: $service_name"
        
        # Find service in registry
        if [ -f /tmp/service-registry.txt ]; then
            local service_info=$(grep "^$service_name:" /tmp/service-registry.txt || true)
            if [ -n "$service_info" ]; then
                IFS=':' read -r name ip port endpoint <<< "$service_info"
                
                if curl -f -s "http://$ip:$port$endpoint" >/dev/null 2>&1; then
                    print_success "Service '$service_name' is healthy"
                else
                    print_error "Service '$service_name' is not responding"
                    return 1
                fi
            else
                print_warning "Service '$service_name' not found in registry"
                return 1
            fi
        else
            print_warning "No service registry found"
            return 1
        fi
    else
        # Check all services
        print_status "Checking health of all registered services..."
        
        if [ -f /tmp/service-registry.txt ]; then
            local healthy_count=0
            local total_count=0
            
            while IFS=':' read -r name ip port endpoint; do
                total_count=$((total_count + 1))
                print_status "Checking $name..."
                
                if curl -f -s "http://$ip:$port$endpoint" >/dev/null 2>&1; then
                    print_success "$name is healthy"
                    healthy_count=$((healthy_count + 1))
                else
                    print_error "$name is not responding"
                fi
            done < /tmp/service-registry.txt
            
            echo ""
            echo -e "${CYAN}Health Check Summary:${NC}"
            echo "Healthy: $healthy_count/$total_count services"
            
            if [ $healthy_count -eq $total_count ]; then
                print_success "All services are healthy"
            else
                print_warning "Some services are unhealthy"
                return 1
            fi
        else
            print_warning "No services registered"
        fi
    fi
}

# Discover services automatically
discover_services() {
    print_header "Automatic Service Discovery"
    echo ""
    
    print_status "Discovering services from running containers..."
    
    # Clear existing registry
    > /tmp/service-registry.txt
    
    local discovered_count=0
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port health_endpoint <<< "$service_info"
        
        print_status "Discovering $service_name..."
        
        if register_service "$service_name" "$port" "$health_endpoint"; then
            discovered_count=$((discovered_count + 1))
        fi
    done
    
    echo ""
    print_success "Discovered $discovered_count services"
    
    if [ $discovered_count -gt 0 ]; then
        list_services
    fi
}

# Update service endpoints
update_endpoints() {
    local service_name=$1
    local new_port=$2
    local new_endpoint=$3
    
    if [ -z "$service_name" ] || [ -z "$new_port" ] || [ -z "$new_endpoint" ]; then
        print_error "Usage: $0 update-endpoints <service> <port> <endpoint>"
        exit 1
    fi
    
    print_status "Updating endpoints for service: $service_name"
    
    if [ -f /tmp/service-registry.txt ]; then
        # Get current service info
        local service_info=$(grep "^$service_name:" /tmp/service-registry.txt || true)
        if [ -n "$service_info" ]; then
            IFS=':' read -r name ip old_port old_endpoint <<< "$service_info"
            
            # Update the entry
            sed -i "s|^$service_name:$ip:$old_port:$old_endpoint|$service_name:$ip:$new_port:$new_endpoint|" /tmp/service-registry.txt
            
            print_success "Updated endpoints for service '$service_name'"
            print_status "New configuration: $service_name:$ip:$new_port:$new_endpoint"
        else
            print_warning "Service '$service_name' not found in registry"
        fi
    else
        print_warning "No service registry found"
    fi
}

# Monitor services
monitor_services() {
    local interval=${1:-30}
    
    print_header "Service Monitoring"
    echo ""
    print_status "Monitoring services every $interval seconds (Press Ctrl+C to stop)"
    echo ""
    
    while true; do
        echo -e "${CYAN}[$(date '+%H:%M:%S')] Health Check:${NC}"
        
        if [ -f /tmp/service-registry.txt ]; then
            while IFS=':' read -r name ip port endpoint; do
                if curl -f -s "http://$ip:$port$endpoint" >/dev/null 2>&1; then
                    echo -e "  ${GREEN}✅${NC} $name"
                else
                    echo -e "  ${RED}❌${NC} $name"
                fi
            done < /tmp/service-registry.txt
        else
            print_warning "No services to monitor"
        fi
        
        echo ""
        sleep $interval
    done
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  discover              Discover all services automatically"
    echo "  register <service>    Register a specific service"
    echo "  unregister <service>  Unregister a specific service"
    echo "  list                  List all registered services"
    echo "  health [service]      Health check all services or specific service"
    echo "  update-endpoints <service> <port> <endpoint>  Update service endpoints"
    echo "  monitor [interval]    Monitor services (default: 30s interval)"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 discover                    # Discover all services"
    echo "  $0 register auth-service       # Register auth service"
    echo "  $0 health                      # Health check all services"
    echo "  $0 health auth-service         # Health check specific service"
    echo "  $0 monitor 60                  # Monitor services every 60 seconds"
    echo ""
    echo "Available Services:"
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port health_endpoint <<< "$service_info"
        echo "  - $service_name (port: $port, health: $health_endpoint)"
    done
}

# Main execution
main() {
    check_docker
    
    case "${1:-}" in
        discover)
            discover_services
            ;;
        register)
            if [ -z "$2" ]; then
                print_error "Service name required"
                show_help
                exit 1
            fi
            # Find service info
            for service_info in "${SERVICES[@]}"; do
                IFS=':' read -r service_name port health_endpoint <<< "$service_info"
                if [ "$service_name" = "$2" ]; then
                    register_service "$service_name" "$port" "$health_endpoint"
                    exit $?
                fi
            done
            print_error "Service '$2' not found"
            exit 1
            ;;
        unregister)
            if [ -z "$2" ]; then
                print_error "Service name required"
                show_help
                exit 1
            fi
            unregister_service "$2"
            ;;
        list)
            list_services
            ;;
        health)
            health_check "$2"
            ;;
        update-endpoints)
            update_endpoints "$2" "$3" "$4"
            ;;
        monitor)
            monitor_services "$2"
            ;;
        help|--help|-h)
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 