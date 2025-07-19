#!/bin/bash

# Digital Tracking Merchandising - Local DevOps Setup Script
# This script sets up a complete local DevOps environment on your Mac

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="digital-tracking-merchandising"
LOCAL_DOMAIN="localhost"
DOCKER_COMPOSE_FILE="docker-compose.local.yml"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "This script is designed for macOS"
        exit 1
    fi
    
    # Check Homebrew
    if ! command_exists brew; then
        log_warning "Homebrew not found. Installing..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Check Docker Desktop
    if ! command_exists docker; then
        log_warning "Docker Desktop not found. Installing..."
        brew install --cask docker
        log_info "Please start Docker Desktop and run this script again"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop"
        exit 1
    fi
    
    log_success "System requirements check passed"
}

# Install required tools
install_tools() {
    log_info "Installing required tools..."
    
    # Install kubectl
    if ! command_exists kubectl; then
        log_info "Installing kubectl..."
        brew install kubectl
    fi
    
    # Install Minikube
    if ! command_exists minikube; then
        log_info "Installing Minikube..."
        brew install minikube
    fi
    
    # Install Helm
    if ! command_exists helm; then
        log_info "Installing Helm..."
        brew install helm
    fi
    
    # Install Terraform
    if ! command_exists terraform; then
        log_info "Installing Terraform..."
        brew install terraform
    fi
    
    # Install additional tools
    if ! command_exists jq; then
        log_info "Installing jq..."
        brew install jq
    fi
    
    if ! command_exists curl; then
        log_info "Installing curl..."
        brew install curl
    fi
    
    log_success "All tools installed successfully"
}

# Setup Minikube
setup_minikube() {
    log_info "Setting up Minikube..."
    
    # Check if Minikube is already running
    if minikube status | grep -q "Running"; then
        log_info "Minikube is already running"
        return
    fi
    
    # Start Minikube
    log_info "Starting Minikube..."
    minikube start --driver=docker --memory=4096 --cpus=2 --disk-size=20g
    
    # Enable addons
    log_info "Enabling Minikube addons..."
    minikube addons enable ingress
    minikube addons enable metrics-server
    minikube addons enable dashboard
    
    log_success "Minikube setup completed"
}

# Create local directories
create_directories() {
    log_info "Creating local directories..."
    
    mkdir -p backups/local
    mkdir -p devops/monitoring/local
    mkdir -p devops/infrastructure/kubernetes/local
    mkdir -p devops/infrastructure/terraform/local
    mkdir -p ssl
    mkdir -p logs
    
    log_success "Directories created successfully"
}

# Generate SSL certificates
generate_ssl() {
    log_info "Generating SSL certificates for local development..."
    
    if [ ! -f "ssl/localhost.key" ] || [ ! -f "ssl/localhost.crt" ]; then
        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/localhost.key \
            -out ssl/localhost.crt \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        log_success "SSL certificates generated"
    else
        log_info "SSL certificates already exist"
    fi
}

# Create local configuration files
create_configs() {
    log_info "Creating local configuration files..."
    
    # Create local Prometheus config
    cat > devops/monitoring/local/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'local-services'
    static_configs:
      - targets: 
        - 'localhost:3000'
        - 'localhost:5000'
        - 'localhost:8080'
        - 'localhost:3010'
        - 'localhost:3011'
        - 'localhost:3012'
        - 'localhost:3014'
        - 'localhost:3015'
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
    scrape_interval: 30s
EOF

    # Create local Promtail config
    cat > devops/monitoring/local/promtail-config.yml << EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki-local:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
EOF

    # Create local AlertManager config
    cat > devops/monitoring/local/alertmanager.yml << EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://localhost:5001/'
EOF

    # Create local Nginx config
    cat > nginx-local.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend-local:3000;
    }
    
    upstream api {
        server api-gateway-local:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        location /api {
            proxy_pass http://api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
    
    server {
        listen 443 ssl;
        server_name localhost;
        
        ssl_certificate /etc/nginx/ssl/localhost.crt;
        ssl_certificate_key /etc/nginx/ssl/localhost.key;
        
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        location /api {
            proxy_pass http://api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF

    log_success "Configuration files created successfully"
}

# Start local services
start_services() {
    log_info "Starting local services..."
    
    # Build and start Docker services
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --build
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log_success "Local services started successfully"
}

# Check service health
check_service_health() {
    log_info "Checking service health..."
    
    local services=(
        "http://localhost:3000"  # Frontend
        "http://localhost:8080/health"  # API Gateway
        "http://localhost:3010/health"  # Auth Service
        "http://localhost:3011/health"  # User Service
        "http://localhost:3012/health"  # Chat Service
        "http://localhost:3014/health"  # Todo Service
        "http://localhost:3015/health"  # Notification Service
        "http://localhost:9090/-/healthy"  # Prometheus
        "http://localhost:3001/api/health"  # Grafana
    )
    
    for service in "${services[@]}"; do
        if curl -f -s "$service" > /dev/null; then
            log_success "$service is healthy"
        else
            log_warning "$service is not responding"
        fi
    done
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Wait for Prometheus to be ready
    sleep 10
    
    # Create Grafana datasource
    curl -X POST http://admin:admin@localhost:3001/api/datasources \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Prometheus",
            "type": "prometheus",
            "url": "http://prometheus-local:9090",
            "access": "proxy",
            "isDefault": true
        }' 2>/dev/null || log_warning "Could not create Prometheus datasource"
    
    # Create Loki datasource
    curl -X POST http://admin:admin@localhost:3001/api/datasources \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Loki",
            "type": "loki",
            "url": "http://loki-local:3100",
            "access": "proxy"
        }' 2>/dev/null || log_warning "Could not create Loki datasource"
    
    log_success "Monitoring setup completed"
}

# Display service URLs
display_urls() {
    log_success "Local DevOps environment is ready!"
    echo
    echo "🌐 Application URLs:"
    echo "  Frontend:        http://localhost:3000"
    echo "  Mobile App:      http://localhost:3002"
    echo "  API Gateway:     http://localhost:8080"
    echo "  Nginx Proxy:     http://localhost"
    echo
    echo "🔧 Development Tools:"
    echo "  Database Admin:  http://localhost:8081 (Adminer)"
    echo "  Redis GUI:       http://localhost:8082 (Redis Commander)"
    echo "  Minikube:        minikube dashboard"
    echo
    echo "📊 Monitoring:"
    echo "  Grafana:         http://localhost:3001 (admin/admin)"
    echo "  Prometheus:      http://localhost:9090"
    echo "  AlertManager:    http://localhost:9093"
    echo "  Loki:            http://localhost:3100"
    echo
    echo "🔍 Service Health:"
    echo "  Auth Service:    http://localhost:3010/health"
    echo "  User Service:    http://localhost:3011/health"
    echo "  Chat Service:    http://localhost:3012/health"
    echo "  Todo Service:    http://localhost:3014/health"
    echo "  Notification:    http://localhost:3015/health"
    echo
    echo "💾 Backup Location: ./backups/local/"
    echo "📝 Logs Location:   ./logs/"
    echo
}

# Stop services
stop_services() {
    log_info "Stopping local services..."
    docker-compose -f $DOCKER_COMPOSE_FILE down
    log_success "Services stopped"
}

# Clean up
cleanup() {
    log_info "Cleaning up local environment..."
    
    # Stop services
    docker-compose -f $DOCKER_COMPOSE_FILE down -v
    
    # Remove local volumes
    docker volume prune -f
    
    # Remove local images
    docker image prune -f
    
    log_success "Cleanup completed"
}

# Show logs
show_logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        log_info "Showing all service logs..."
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
    else
        log_info "Showing logs for $service..."
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f "$service"
    fi
}

# Backup data
backup_data() {
    log_info "Creating local backup..."
    
    local backup_dir="./backups/local/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Database backup
    docker exec postgres-local pg_dump -U workforce_user workforce_db > "$backup_dir/database.sql"
    
    # Application backup
    tar -czf "$backup_dir/app.tar.gz" src/ backend/ package.json docker-compose.local.yml
    
    # Configuration backup
    cp -r devops/ "$backup_dir/"
    
    log_success "Backup created: $backup_dir"
}

# Main function
main() {
    case "${1:-}" in
        "start")
            check_requirements
            install_tools
            setup_minikube
            create_directories
            generate_ssl
            create_configs
            start_services
            setup_monitoring
            display_urls
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            start_services
            display_urls
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            show_logs "$2"
            ;;
        "backup")
            backup_data
            ;;
        "health")
            check_service_health
            ;;
        "status")
            docker-compose -f $DOCKER_COMPOSE_FILE ps
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|cleanup|logs|backup|health|status}"
            echo
            echo "Commands:"
            echo "  start    - Start the complete local DevOps environment"
            echo "  stop     - Stop all services"
            echo "  restart  - Restart all services"
            echo "  cleanup  - Remove all containers, volumes, and images"
            echo "  logs     - Show service logs (optional: service name)"
            echo "  backup   - Create a local backup"
            echo "  health   - Check service health"
            echo "  status   - Show service status"
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 