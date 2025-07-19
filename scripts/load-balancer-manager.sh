#!/bin/bash

# Digital Tracking Merchandising Platform - Load Balancer Manager
# Network Engineer - Load Balancing and Traffic Management Script
# Usage: ./scripts/load-balancer-manager.sh [command] [options]

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
NGINX_CONTAINER="${PROJECT_NAME}_nginx-1"
API_GATEWAY_CONTAINER="${PROJECT_NAME}_api-gateway-1"
LOAD_BALANCER_CONFIG="/tmp/load-balancer-config.conf"

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

# Generate load balancer configuration
generate_config() {
    local backend_services=("$@")
    
    print_status "Generating load balancer configuration..."
    
    cat > $LOAD_BALANCER_CONFIG << EOF
# Load Balancer Configuration for Digital Tracking Merchandising Platform
# Generated on $(date)

upstream api_backend {
    # Health check configuration
    keepalive 32;
    
    # Backend services
EOF
    
    for service in "${backend_services[@]}"; do
        IFS=':' read -r service_name port health_endpoint <<< "$service"
        
        # Get container IP
        local container_name="${PROJECT_NAME}_${service_name}-1"
        local container_ip=$(docker inspect "$container_name" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" 2>/dev/null || echo "")
        
        if [ -n "$container_ip" ]; then
            echo "    server $container_ip:$port max_fails=3 fail_timeout=30s;" >> $LOAD_BALANCER_CONFIG
            print_success "Added backend: $service_name ($container_ip:$port)"
        else
            print_warning "Cannot get IP for service: $service_name"
        fi
    done
    
    cat >> $LOAD_BALANCER_CONFIG << EOF
}

upstream frontend_backend {
    server ${PROJECT_NAME}_frontend-app-1:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name localhost;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # API Gateway routing
    location /api/ {
        proxy_pass http://api_backend/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Health check
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
    }
    
    # Frontend routing
    location / {
        proxy_pass http://frontend_backend/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
    
    print_success "Load balancer configuration generated: $LOAD_BALANCER_CONFIG"
}

# Deploy load balancer configuration
deploy_config() {
    print_status "Deploying load balancer configuration..."
    
    if [ ! -f "$LOAD_BALANCER_CONFIG" ]; then
        print_error "Load balancer configuration not found. Run 'generate' first."
        exit 1
    fi
    
    # Check if nginx container is running
    if ! docker ps --format "{{.Names}}" | grep -q "$NGINX_CONTAINER"; then
        print_warning "Nginx container is not running. Starting nginx..."
        docker-compose -f docker-compose.microservices.yml up -d nginx
    fi
    
    # Copy configuration to container
    docker cp "$LOAD_BALANCER_CONFIG" "$NGINX_CONTAINER:/etc/nginx/nginx.conf"
    
    # Test configuration
    if docker exec "$NGINX_CONTAINER" nginx -t; then
        # Reload nginx
        docker exec "$NGINX_CONTAINER" nginx -s reload
        print_success "Load balancer configuration deployed successfully"
    else
        print_error "Invalid nginx configuration"
        exit 1
    fi
}

# Check load balancer status
check_status() {
    print_header "Load Balancer Status"
    echo ""
    
    # Check nginx container
    if docker ps --format "{{.Names}}" | grep -q "$NGINX_CONTAINER"; then
        print_success "Nginx container is running"
        
        # Check nginx process
        if docker exec "$NGINX_CONTAINER" pgrep nginx >/dev/null; then
            print_success "Nginx process is running"
        else
            print_error "Nginx process is not running"
        fi
        
        # Check nginx configuration
        if docker exec "$NGINX_CONTAINER" nginx -t >/dev/null 2>&1; then
            print_success "Nginx configuration is valid"
        else
            print_error "Nginx configuration is invalid"
        fi
    else
        print_warning "Nginx container is not running"
    fi
    
    echo ""
    
    # Check backend services
    print_status "Backend Service Status:"
    local backend_services=(
        "api-gateway:8080:/health"
        "auth-service:3010:/health"
        "user-service:3002:/health"
        "todo-service:3005:/health"
        "chat-service:3003:/health"
    )
    
    for service in "${backend_services[@]}"; do
        IFS=':' read -r service_name port health_endpoint <<< "$service"
        
        local container_name="${PROJECT_NAME}_${service_name}-1"
        if docker ps --format "{{.Names}}" | grep -q "$container_name"; then
            local container_ip=$(docker inspect "$container_name" --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" 2>/dev/null || echo "")
            
            if [ -n "$container_ip" ]; then
                if curl -f -s "http://$container_ip:$port$health_endpoint" >/dev/null 2>&1; then
                    print_success "$service_name: $container_ip:$port (HEALTHY)"
                else
                    print_warning "$service_name: $container_ip:$port (UNHEALTHY)"
                fi
            else
                print_warning "$service_name: Cannot get IP address"
            fi
        else
            print_warning "$service_name: Container not running"
        fi
    done
}

# Test load balancer
test_load_balancer() {
    print_header "Load Balancer Testing"
    echo ""
    
    local test_endpoints=(
        "/health"
        "/api/health"
        "/api/auth/health"
        "/"
    )
    
    for endpoint in "${test_endpoints[@]}"; do
        print_status "Testing endpoint: $endpoint"
        
        if curl -f -s "http://localhost$endpoint" >/dev/null 2>&1; then
            print_success "Endpoint $endpoint is responding"
        else
            print_error "Endpoint $endpoint is not responding"
        fi
    done
    
    echo ""
    
    # Test load distribution
    print_status "Testing load distribution..."
    local response_times=()
    
    for i in {1..5}; do
        local start_time=$(date +%s%N)
        curl -f -s "http://localhost/api/health" >/dev/null 2>&1
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 ))
        response_times+=($response_time)
        print_status "Request $i: ${response_time}ms"
    done
    
    # Calculate average response time
    local total=0
    for time in "${response_times[@]}"; do
        total=$((total + time))
    done
    local average=$((total / ${#response_times[@]}))
    
    echo ""
    print_success "Average response time: ${average}ms"
}

# Monitor load balancer
monitor_load_balancer() {
    local interval=${1:-30}
    
    print_header "Load Balancer Monitoring"
    echo ""
    print_status "Monitoring load balancer every $interval seconds (Press Ctrl+C to stop)"
    echo ""
    
    while true; do
        echo -e "${CYAN}[$(date '+%H:%M:%S')] Load Balancer Status:${NC}"
        
        # Check nginx status
        if docker ps --format "{{.Names}}" | grep -q "$NGINX_CONTAINER"; then
            if docker exec "$NGINX_CONTAINER" pgrep nginx >/dev/null; then
                echo -e "  ${GREEN}✅${NC} Nginx: Running"
            else
                echo -e "  ${RED}❌${NC} Nginx: Not Running"
            fi
        else
            echo -e "  ${RED}❌${NC} Nginx: Container Not Running"
        fi
        
        # Check key endpoints
        local endpoints=("/health" "/api/health")
        for endpoint in "${endpoints[@]}"; do
            if curl -f -s "http://localhost$endpoint" >/dev/null 2>&1; then
                echo -e "  ${GREEN}✅${NC} $endpoint: OK"
            else
                echo -e "  ${RED}❌${NC} $endpoint: FAIL"
            fi
        done
        
        echo ""
        sleep $interval
    done
}

# Show load balancer statistics
show_stats() {
    print_header "Load Balancer Statistics"
    echo ""
    
    if docker ps --format "{{.Names}}" | grep -q "$NGINX_CONTAINER"; then
        # Get nginx statistics
        print_status "Nginx Statistics:"
        docker exec "$NGINX_CONTAINER" nginx -V 2>&1 | head -1
        
        # Get connection statistics
        print_status "Connection Statistics:"
        docker exec "$NGINX_CONTAINER" netstat -an | grep :80 | wc -l | xargs echo "Active connections:"
        
        # Get process statistics
        print_status "Process Statistics:"
        docker exec "$NGINX_CONTAINER" ps aux | grep nginx | wc -l | xargs echo "Nginx processes:"
    else
        print_warning "Nginx container is not running"
    fi
}

# Restart load balancer
restart_load_balancer() {
    print_status "Restarting load balancer..."
    
    if docker ps --format "{{.Names}}" | grep -q "$NGINX_CONTAINER"; then
        docker restart "$NGINX_CONTAINER"
        print_success "Load balancer restarted"
    else
        print_warning "Nginx container is not running. Starting nginx..."
        docker-compose -f docker-compose.microservices.yml up -d nginx
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  generate [services...]  Generate load balancer configuration"
    echo "  deploy                 Deploy load balancer configuration"
    echo "  status                 Check load balancer status"
    echo "  test                   Test load balancer functionality"
    echo "  monitor [interval]     Monitor load balancer (default: 30s)"
    echo "  stats                  Show load balancer statistics"
    echo "  restart                Restart load balancer"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 generate api-gateway auth-service user-service"
    echo "  $0 deploy"
    echo "  $0 status"
    echo "  $0 test"
    echo "  $0 monitor 60"
    echo ""
    echo "Default Backend Services:"
    echo "  - api-gateway:8080"
    echo "  - auth-service:3010"
    echo "  - user-service:3002"
    echo "  - todo-service:3005"
    echo "  - chat-service:3003"
}

# Main execution
main() {
    check_docker
    
    case "${1:-}" in
        generate)
            shift
            if [ $# -eq 0 ]; then
                # Use default services
                generate_config "api-gateway:8080:/health" "auth-service:3010:/health" "user-service:3002:/health" "todo-service:3005:/health" "chat-service:3003:/health"
            else
                generate_config "$@"
            fi
            ;;
        deploy)
            deploy_config
            ;;
        status)
            check_status
            ;;
        test)
            test_load_balancer
            ;;
        monitor)
            monitor_load_balancer "$2"
            ;;
        stats)
            show_stats
            ;;
        restart)
            restart_load_balancer
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