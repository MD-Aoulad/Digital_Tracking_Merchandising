#!/bin/bash

# Digital Tracking Merchandising Platform - Network Troubleshooter
# Network Engineer - Automated Network Troubleshooting Script
# Usage: ./scripts/network-troubleshooter.sh [issue] [options]

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
LOG_FILE="/tmp/network-troubleshooting.log"

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

# Log function
log_message() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" >> "$LOG_FILE"
    echo "$1"
}

# Check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker before proceeding."
        exit 1
    fi
}

# Troubleshoot port conflicts
troubleshoot_port_conflicts() {
    print_header "Port Conflict Troubleshooting"
    echo ""
    
    local problematic_ports=("5432" "3001" "8080" "3000")
    local conflicts_found=0
    
    for port in "${problematic_ports[@]}"; do
        print_status "Checking port $port..."
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is in use"
            
            # Get process details
            local process_info=$(lsof -Pi :$port -sTCP:LISTEN)
            echo -e "${YELLOW}Process details:${NC}"
            echo "$process_info" | while IFS= read -r line; do
                echo -e "${YELLOW}  $line${NC}"
            done
            
            # Suggest resolution
            local pids=$(lsof -ti:$port)
            if [ -n "$pids" ]; then
                echo -e "${CYAN}Resolution:${NC}"
                echo "  To kill processes: ./scripts/port-killer.sh $port"
                echo "  Or manually: kill -9 $pids"
            fi
            
            conflicts_found=$((conflicts_found + 1))
        else
            print_success "Port $port is available"
        fi
        echo ""
    done
    
    if [ $conflicts_found -eq 0 ]; then
        print_success "No port conflicts detected"
    else
        print_warning "Found $conflicts_found port conflict(s)"
        log_message "Port conflicts detected: $conflicts_found conflicts found"
    fi
}

# Troubleshoot service connectivity
troubleshoot_connectivity() {
    local service_name=$1
    
    print_header "Service Connectivity Troubleshooting"
    echo ""
    
    if [ -n "$service_name" ]; then
        print_status "Troubleshooting connectivity for service: $service_name"
        
        # Check if container is running
        local container_name="${PROJECT_NAME}_${service_name}-1"
        if ! docker ps --format "{{.Names}}" | grep -q "$container_name"; then
            print_error "Container '$container_name' is not running"
            echo -e "${CYAN}Resolution:${NC}"
            echo "  Start the service: docker-compose -f docker-compose.microservices.yml up -d $service_name"
            return 1
        fi
        
        # Get container IP
        local container_ip=$(docker inspect "$container_name" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" 2>/dev/null || echo "")
        
        if [ -z "$container_ip" ]; then
            print_error "Cannot get IP address for container '$container_name'"
            echo -e "${CYAN}Resolution:${NC}"
            echo "  Restart the container: docker restart $container_name"
            return 1
        fi
        
        print_success "Container IP: $container_ip"
        
        # Test network connectivity
        print_status "Testing network connectivity..."
        
        # Test container network
        if docker exec "$container_name" ping -c 1 8.8.8.8 >/dev/null 2>&1; then
            print_success "Container has internet connectivity"
        else
            print_warning "Container has no internet connectivity"
        fi
        
        # Test inter-container communication
        local other_services=("api-gateway" "auth-service" "user-service")
        for other_service in "${other_services[@]}"; do
            if [ "$other_service" != "$service_name" ]; then
                local other_container="${PROJECT_NAME}_${other_service}-1"
                if docker ps --format "{{.Names}}" | grep -q "$other_container"; then
                    local other_ip=$(docker inspect "$other_container" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" 2>/dev/null || echo "")
                    if [ -n "$other_ip" ]; then
                        if docker exec "$container_name" ping -c 1 "$other_ip" >/dev/null 2>&1; then
                            print_success "Can reach $other_service ($other_ip)"
                        else
                            print_warning "Cannot reach $other_service ($other_ip)"
                        fi
                    fi
                fi
            fi
        done
        
    else
        print_status "Troubleshooting general connectivity issues..."
        
        # Check Docker network
        if ! docker network ls | grep -q "$NETWORK_NAME"; then
            print_error "Network '$NETWORK_NAME' does not exist"
            echo -e "${CYAN}Resolution:${NC}"
            echo "  Create network: docker network create $NETWORK_NAME"
            return 1
        fi
        
        # Check network connectivity
        print_status "Checking network connectivity..."
        
        # Test DNS resolution
        if nslookup google.com >/dev/null 2>&1; then
            print_success "DNS resolution is working"
        else
            print_warning "DNS resolution issues detected"
        fi
        
        # Test internet connectivity
        if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
            print_success "Internet connectivity is working"
        else
            print_warning "Internet connectivity issues detected"
        fi
    fi
}

# Troubleshoot API Gateway issues
troubleshoot_api_gateway() {
    print_header "API Gateway Troubleshooting"
    echo ""
    
    local api_gateway_container="${PROJECT_NAME}_api-gateway-1"
    
    # Check if API Gateway is running
    if ! docker ps --format "{{.Names}}" | grep -q "$api_gateway_container"; then
        print_error "API Gateway container is not running"
        echo -e "${CYAN}Resolution:${NC}"
        echo "  Start API Gateway: docker-compose -f docker-compose.microservices.yml up -d api-gateway"
        return 1
    fi
    
    print_success "API Gateway container is running"
    
    # Check API Gateway health
    print_status "Checking API Gateway health..."
    
    if curl -f -s "http://localhost:8080/health" >/dev/null 2>&1; then
        print_success "API Gateway is responding on port 8080"
    else
        print_warning "API Gateway is not responding on port 8080"
        
        # Check container logs
        print_status "Checking API Gateway logs..."
        docker logs --tail=20 "$api_gateway_container" 2>&1 | head -10
    fi
    
    # Check API Gateway configuration
    print_status "Checking API Gateway configuration..."
    
    # Test routing to auth service
    if curl -f -s "http://localhost:8080/api/auth/health" >/dev/null 2>&1; then
        print_success "API Gateway can route to auth service"
    else
        print_warning "API Gateway cannot route to auth service"
        
        # Check auth service directly
        local auth_container="${PROJECT_NAME}_auth-service-1"
        if docker ps --format "{{.Names}}" | grep -q "$auth_container"; then
            local auth_ip=$(docker inspect "$auth_container" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" 2>/dev/null || echo "")
            if [ -n "$auth_ip" ]; then
                if curl -f -s "http://$auth_ip:3001/health" >/dev/null 2>&1; then
                    print_success "Auth service is healthy at $auth_ip:3001"
                    print_warning "Issue is with API Gateway routing"
                else
                    print_warning "Auth service is not responding at $auth_ip:3001"
                fi
            fi
        fi
    fi
}

# Troubleshoot database connectivity
troubleshoot_database() {
    print_header "Database Connectivity Troubleshooting"
    echo ""
    
    # Check if database container is running
    local db_containers=$(docker ps --format "{{.Names}}" | grep -E "(postgres|database)" || true)
    
    if [ -z "$db_containers" ]; then
        print_error "No database containers are running"
        echo -e "${CYAN}Resolution:${NC}"
        echo "  Start database: docker-compose -f docker-compose.microservices.yml up -d postgres"
        return 1
    fi
    
    print_success "Database containers are running:"
    echo "$db_containers" | while IFS= read -r container; do
        echo "  - $container"
    done
    
    # Check database connectivity from services
    local services=("auth-service" "user-service" "todo-service")
    
    for service in "${services[@]}"; do
        local container_name="${PROJECT_NAME}_${service}-1"
        
        if docker ps --format "{{.Names}}" | grep -q "$container_name"; then
            print_status "Testing database connectivity from $service..."
            
            # Test database connection
            if docker exec "$container_name" pg_isready -h postgres -p 5432 >/dev/null 2>&1; then
                print_success "$service can connect to database"
            else
                print_warning "$service cannot connect to database"
                
                # Check database logs
                print_status "Checking database logs..."
                docker logs --tail=10 "${PROJECT_NAME}_postgres-1" 2>&1 | grep -E "(error|ERROR|failed|FAILED)" || print_status "No database errors found"
            fi
        fi
    done
}

# Troubleshoot network performance
troubleshoot_performance() {
    print_header "Network Performance Troubleshooting"
    echo ""
    
    # Check Docker stats
    print_status "Checking container resource usage..."
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -10
    
    # Check network latency
    print_status "Testing network latency..."
    
    local services=("api-gateway" "auth-service" "user-service")
    for service in "${services[@]}"; do
        local container_name="${PROJECT_NAME}_${service}-1"
        
        if docker ps --format "{{.Names}}" | grep -q "$container_name"; then
            local container_ip=$(docker inspect "$container_name" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" 2>/dev/null || echo "")
            
            if [ -n "$container_ip" ]; then
                local start_time=$(date +%s%N)
                if ping -c 1 "$container_ip" >/dev/null 2>&1; then
                    local end_time=$(date +%s%N)
                    local latency=$(( (end_time - start_time) / 1000000 ))
                    print_success "$service latency: ${latency}ms"
                else
                    print_warning "$service is not reachable"
                fi
            fi
        fi
    done
    
    # Check network bandwidth
    print_status "Checking network bandwidth..."
    
    # Simple bandwidth test using curl
    local test_url="http://localhost:8080/health"
    local start_time=$(date +%s%N)
    
    if curl -f -s "$test_url" >/dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))
        
        if [ $response_time -lt 100 ]; then
            print_success "Response time: ${response_time}ms (Good)"
        elif [ $response_time -lt 500 ]; then
            print_warning "Response time: ${response_time}ms (Acceptable)"
        else
            print_error "Response time: ${response_time}ms (Poor)"
        fi
    else
        print_error "Cannot test response time - service not responding"
    fi
}

# Generate troubleshooting report
generate_report() {
    print_header "Network Troubleshooting Report"
    echo ""
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}Report Generated:${NC} $timestamp"
    echo ""
    
    # System information
    echo -e "${CYAN}System Information:${NC}"
    echo "Docker Version: $(docker --version)"
    echo "Docker Compose Version: $(docker-compose --version)"
    echo "Operating System: $(uname -s) $(uname -r)"
    echo ""
    
    # Network status
    echo -e "${CYAN}Network Status:${NC}"
    echo "Docker Networks: $(docker network ls | wc -l | tr -d ' ') networks"
    echo "Running Containers: $(docker ps | wc -l | tr -d ' ') containers"
    echo "Project Containers: $(docker ps --format '{{.Names}}' | grep $PROJECT_NAME | wc -l | tr -d ' ') containers"
    echo ""
    
    # Issues summary
    echo -e "${CYAN}Issues Summary:${NC}"
    if [ -f "$LOG_FILE" ]; then
        grep -E "(ERROR|WARNING)" "$LOG_FILE" | tail -5 || echo "No issues logged"
    else
        echo "No troubleshooting log found"
    fi
    
    echo ""
    echo -e "${CYAN}Recommendations:${NC}"
    echo "1. Check Docker daemon status"
    echo "2. Verify network configuration"
    echo "3. Ensure all services are running"
    echo "4. Monitor resource usage"
    echo "5. Review service logs for errors"
}

# Show help
show_help() {
    echo "Usage: $0 [ISSUE] [OPTIONS]"
    echo ""
    echo "Issues:"
    echo "  ports                 Troubleshoot port conflicts"
    echo "  connectivity [service] Troubleshoot service connectivity"
    echo "  api-gateway           Troubleshoot API Gateway issues"
    echo "  database              Troubleshoot database connectivity"
    echo "  performance           Troubleshoot network performance"
    echo "  all                   Run all troubleshooting checks"
    echo "  report                Generate troubleshooting report"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 ports                    # Troubleshoot port conflicts"
    echo "  $0 connectivity auth-service # Troubleshoot auth service connectivity"
    echo "  $0 api-gateway              # Troubleshoot API Gateway"
    echo "  $0 all                      # Run all troubleshooting checks"
    echo "  $0 report                   # Generate troubleshooting report"
}

# Main execution
main() {
    check_docker
    
    # Initialize log file
    echo "Network Troubleshooting Log - $(date)" > "$LOG_FILE"
    
    case "${1:-}" in
        ports)
            troubleshoot_port_conflicts
            ;;
        connectivity)
            troubleshoot_connectivity "$2"
            ;;
        api-gateway)
            troubleshoot_api_gateway
            ;;
        database)
            troubleshoot_database
            ;;
        performance)
            troubleshoot_performance
            ;;
        all)
            print_header "Running All Troubleshooting Checks"
            echo ""
            troubleshoot_port_conflicts
            echo ""
            troubleshoot_connectivity
            echo ""
            troubleshoot_api_gateway
            echo ""
            troubleshoot_database
            echo ""
            troubleshoot_performance
            echo ""
            generate_report
            ;;
        report)
            generate_report
            ;;
        help|--help|-h)
            show_help
            ;;
        "")
            show_help
            ;;
        *)
            print_error "Unknown issue: $1"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Troubleshooting completed. Check log file: $LOG_FILE"
}

# Run main function
main "$@" 