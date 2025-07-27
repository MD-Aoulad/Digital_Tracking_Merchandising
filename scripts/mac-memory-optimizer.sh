#!/bin/bash

# Mac Memory Optimizer for 8GB RAM Systems
# Senior DevOps Engineer - Memory Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration for 8GB Mac
MAX_DOCKER_MEMORY="4GB"
MAX_CONTAINERS=5
ESSENTIAL_SERVICES=("frontend-app" "api-gateway" "auth-service" "chat-service" "todo-service")

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

# Function to check system memory
check_system_memory() {
    print_status "Checking system memory..."
    
    local total_memory=$(sysctl -n hw.memsize | awk '{print $0/1024/1024/1024}')
    local available_memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//' | awk '{print $0*4096/1024/1024/1024}')
    
    echo "Total Memory: ${total_memory}GB"
    echo "Available Memory: ${available_memory}GB"
    
    if (( $(echo "$total_memory < 8" | bc -l) )); then
        print_warning "System has less than 8GB RAM - using lightweight mode"
        return 0
    else
        print_success "System has sufficient memory"
        return 1
    fi
}

# Function to optimize Docker settings
optimize_docker_settings() {
    print_status "Optimizing Docker settings for 8GB Mac..."
    
    # Set Docker memory limit
    if command -v docker >/dev/null 2>&1; then
        # Create or update Docker daemon configuration
        sudo mkdir -p /etc/docker
        cat > /tmp/daemon.json << EOF
{
  "memory": "$MAX_DOCKER_MEMORY",
  "swap": "1GB",
  "default-ulimits": {
    "nofile": {
      "Hard": 64000,
      "Name": "nofile",
      "Soft": 64000
    }
  }
}
EOF
        
        if [ -f /etc/docker/daemon.json ]; then
            sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
        fi
        
        sudo cp /tmp/daemon.json /etc/docker/daemon.json
        print_success "Docker daemon configuration updated"
    else
        print_error "Docker not found"
        return 1
    fi
}

# Function to start lightweight services
start_lightweight_services() {
    print_status "Starting lightweight services for 8GB Mac..."
    
    # Stop all existing containers
    docker-compose down 2>/dev/null || true
    
    # Start only essential services
    local services_to_start=""
    for service in "${ESSENTIAL_SERVICES[@]}"; do
        if docker-compose config --services | grep -q "$service"; then
            services_to_start="$services_to_start $service"
        fi
    done
    
    if [ -n "$services_to_start" ]; then
        docker-compose up -d $services_to_start
        print_success "Lightweight services started: $services_to_start"
    else
        print_error "No essential services found"
        return 1
    fi
}

# Function to monitor memory usage
monitor_memory_usage() {
    print_status "Monitoring memory usage..."
    
    local docker_memory=$(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | tail -n +2 | awk '{sum+=$2} END {print sum}')
    local system_memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//' | awk '{print $0*4096/1024/1024/1024}')
    
    echo "Docker Memory Usage: $docker_memory"
    echo "System Available Memory: ${system_memory}GB"
    
    if (( $(echo "$system_memory < 1" | bc -l) )); then
        print_warning "Low system memory - consider stopping non-essential services"
        return 1
    else
        print_success "Memory usage is within acceptable limits"
        return 0
    fi
}

# Function to cleanup Docker resources
cleanup_docker_resources() {
    print_status "Cleaning up Docker resources..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    print_success "Docker resources cleaned up"
}

# Function to show memory-optimized status
show_lightweight_status() {
    print_status "Lightweight Mode Status:"
    
    echo ""
    echo "Running Services:"
    docker-compose ps --services | while read service; do
        if docker-compose ps $service | grep -q "Up"; then
            echo "✅ $service"
        else
            echo "❌ $service"
        fi
    done
    
    echo ""
    echo "Memory Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}"
    
    echo ""
    echo "Service URLs:"
    echo "Frontend: http://localhost:3000"
    echo "API Gateway: http://localhost:8080"
    echo "Auth Service: http://localhost:3010"
    echo "Chat Service: http://localhost:3012"
}

# Main function
main() {
    print_status "Starting Mac Memory Optimizer for 8GB RAM..."
    
    # Check system memory
    if check_system_memory; then
        print_warning "Using lightweight mode for 8GB Mac"
        
        # Optimize Docker settings
        optimize_docker_settings
        
        # Cleanup resources
        cleanup_docker_resources
        
        # Start lightweight services
        start_lightweight_services
        
        # Monitor memory
        monitor_memory_usage
        
        # Show status
        show_lightweight_status
        
        print_success "Mac memory optimization complete!"
        print_warning "Only essential services are running. Use LG Gram for full-stack development."
    else
        print_success "System has sufficient memory for full development"
    fi
}

# Handle command line arguments
case "${1:-}" in
    "start")
        start_lightweight_services
        ;;
    "monitor")
        monitor_memory_usage
        ;;
    "cleanup")
        cleanup_docker_resources
        ;;
    "status")
        show_lightweight_status
        ;;
    "optimize")
        optimize_docker_settings
        ;;
    *)
        main
        ;;
esac 