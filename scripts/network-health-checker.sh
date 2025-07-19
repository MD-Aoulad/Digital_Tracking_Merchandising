#!/bin/bash

# Digital Tracking Merchandising Platform - Network Health Checker
# Network Engineer - Network Infrastructure Monitoring Script
# Usage: ./scripts/network-health-checker.sh

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
SERVICE_PORTS="frontend:3000 api-gateway:8080 auth-service:3010 user-service:3002 todo-service:3005 chat-service:3003 attendance-service:3004 report-service:3006 approval-service:3007 workplace-service:3008 notification-service:3009 database:5432 redis:6379 prometheus:9090 grafana:3002"

echo -e "${BLUE}🌐 Digital Tracking Merchandising Platform - Network Health Checker${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

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
    print_status "Checking Docker status..."
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker before proceeding."
        exit 1
    else
        print_success "Docker is running"
    fi
}

# Check Docker networks
check_networks() {
    print_header "Docker Network Analysis"
    echo ""
    
    print_status "Checking Docker networks..."
    
    # List all networks
    echo -e "${CYAN}Available Docker Networks:${NC}"
    docker network ls --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"
    echo ""
    
    # Check if our network exists
    if docker network ls | grep -q $NETWORK_NAME; then
        print_success "Network '$NETWORK_NAME' exists"
        
        # Inspect network details
        echo -e "${CYAN}Network '$NETWORK_NAME' Details:${NC}"
        docker network inspect $NETWORK_NAME --format "table {{.Name}}\t{{.IPAM.Config.Subnet}}\t{{.Driver}}\t{{.Internal}}"
        echo ""
        
        # Check connected containers
        echo -e "${CYAN}Connected Containers:${NC}"
        docker network inspect $NETWORK_NAME --format "{{range .Containers}}{{.Name}}\t{{.IPv4Address}}\n{{end}}"
        echo ""
    else
        print_warning "Network '$NETWORK_NAME' does not exist"
    fi
}

# Check port availability and conflicts
check_ports() {
    print_header "Port Availability Analysis"
    echo ""
    
    print_status "Checking port availability for all services..."
    
    local issues_found=0
    local busy_ports=()
    
    for service_port in $SERVICE_PORTS; do
        IFS=':' read -r service port <<< "$service_port"
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "$service (port $port): IN USE"
            
            # Get process details
            local process_info=$(lsof -Pi :$port -sTCP:LISTEN)
            echo -e "${YELLOW}   Process details:${NC}"
            echo "$process_info" | while IFS= read -r line; do
                echo -e "${YELLOW}   $line${NC}"
            done
            
            issues_found=$((issues_found + 1))
            busy_ports="$busy_ports $port"
        else
            print_success "$service (port $port): AVAILABLE"
        fi
    done
    
    echo ""
    if [ $issues_found -eq 0 ]; then
        print_success "All ports are available"
    else
        print_warning "Found $issues_found port(s) in use: $busy_ports"
    fi
}

# Check service connectivity
check_connectivity() {
    print_header "Service Connectivity Analysis"
    echo ""
    
    print_status "Checking service connectivity..."
    
    # Check if containers are running
    local running_containers=$(docker ps --format "{{.Names}}" | grep $PROJECT_NAME || true)
    
    if [ -z "$running_containers" ]; then
        print_warning "No containers from project '$PROJECT_NAME' are running"
        return
    fi
    
    echo -e "${CYAN}Running Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $PROJECT_NAME
    echo ""
    
    # Test connectivity for key services
    local connectivity_tests=(
        "api-gateway:8080:/health"
        "auth-service:3010:/health"
        "frontend:3000:/"
    )
    
    for test in "${connectivity_tests[@]}"; do
        IFS=':' read -r service port endpoint <<< "$test"
        
        print_status "Testing $service connectivity..."
        
        if curl -f -s "http://localhost:$port$endpoint" >/dev/null 2>&1; then
            print_success "$service is responding on port $port"
        else
            print_warning "$service is not responding on port $port"
        fi
    done
}

# Check network performance
check_performance() {
    print_header "Network Performance Analysis"
    echo ""
    
    print_status "Checking network performance..."
    
    # Check Docker stats
    echo -e "${CYAN}Container Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    echo ""
    
    # Check network interfaces
    echo -e "${CYAN}Network Interfaces:${NC}"
    docker network inspect $NETWORK_NAME --format "{{range .Containers}}{{.Name}}\t{{.IPv4Address}}\t{{.MacAddress}}\n{{end}}" 2>/dev/null || print_warning "Cannot inspect network interfaces"
    echo ""
}

# Check network security
check_security() {
    print_header "Network Security Analysis"
    echo ""
    
    print_status "Checking network security..."
    
    # Check if network is internal
    local is_internal=$(docker network inspect $NETWORK_NAME --format "{{.Internal}}" 2>/dev/null || echo "unknown")
    
    if [ "$is_internal" = "true" ]; then
        print_success "Network is internal (isolated)"
    elif [ "$is_internal" = "false" ]; then
        print_warning "Network is external (not isolated)"
    else
        print_warning "Cannot determine network isolation status"
    fi
    
    # Check for exposed ports
    local exposed_ports=$(docker ps --format "{{.Ports}}" | grep -o "[0-9]*->[0-9]*" || true)
    
    if [ -n "$exposed_ports" ]; then
        echo -e "${CYAN}Exposed Ports:${NC}"
        echo "$exposed_ports" | while IFS= read -r port; do
            echo -e "${YELLOW}   $port${NC}"
        done
    else
        print_success "No ports are exposed"
    fi
}

# Generate network health report
generate_report() {
    print_header "Network Health Report"
    echo ""
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}Report Generated:${NC} $timestamp"
    echo ""
    
    # Summary
    echo -e "${CYAN}Network Health Summary:${NC}"
    echo "✅ Docker Status: $(docker info &>/dev/null && echo "Running" || echo "Not Running")"
    echo "✅ Network '$NETWORK_NAME': $(docker network ls | grep -q $NETWORK_NAME && echo "Exists" || echo "Missing")"
    echo "✅ Port Conflicts: $(lsof -i :5432 -i :3001 -i :8080 -sTCP:LISTEN -t 2>/dev/null | wc -l | tr -d ' ') found"
    echo "✅ Running Containers: $(docker ps --format "{{.Names}}" | grep $PROJECT_NAME | wc -l | tr -d ' ') containers"
    echo ""
    
    # Recommendations
    echo -e "${CYAN}Recommendations:${NC}"
    
    if ! docker info &>/dev/null; then
        echo "🔴 Start Docker daemon"
    fi
    
    if ! docker network ls | grep -q $NETWORK_NAME; then
        echo "🔴 Create network '$NETWORK_NAME'"
    fi
    
    if lsof -i :5432 -i :3001 -i :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "🟡 Resolve port conflicts using: ./scripts/port-killer.sh [port]"
    fi
    
    local container_count=$(docker ps --format "{{.Names}}" | grep $PROJECT_NAME | wc -l | tr -d ' ')
    if [ "$container_count" -eq 0 ]; then
        echo "🟡 Start project containers using: docker-compose up -d"
    fi
    
    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}Starting Network Health Check...${NC}"
    echo ""
    
    check_docker
    echo ""
    
    check_networks
    echo ""
    
    check_ports
    echo ""
    
    check_connectivity
    echo ""
    
    check_performance
    echo ""
    
    check_security
    echo ""
    
    generate_report
    echo ""
    
    echo -e "${BLUE}================================================================${NC}"
    print_success "Network health check completed"
    echo ""
}

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Verbose output"
    echo "  --ports-only   Check only port availability"
    echo "  --network-only Check only network configuration"
    echo ""
    echo "Examples:"
    echo "  $0              # Full network health check"
    echo "  $0 --ports-only # Check only port conflicts"
    echo "  $0 --network-only # Check only network configuration"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    --ports-only)
        check_docker
        check_ports
        exit 0
        ;;
    --network-only)
        check_docker
        check_networks
        check_security
        exit 0
        ;;
    -v|--verbose)
        set -x
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 