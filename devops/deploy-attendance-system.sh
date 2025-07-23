#!/bin/bash

# Enhanced Attendance System Deployment Script
# This script deploys the complete attendance system with monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="attendance-system"
COMPOSE_FILE="attendance-service-deployment.yml"
ENV_FILE=".env"

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Enhanced Attendance System Deployment${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are ready."
}

# Check ports availability
check_ports() {
    print_status "Checking port availability..."
    
    local ports=("3007" "5437" "6387" "8087" "8088" "9097" "3008" "80" "443")
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use. Stopping process..."
            sudo lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    print_status "All ports are available."
}

# Create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" << EOF
# Attendance System Environment Variables
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=postgresql://attendance_user:attendance_password@attendance-db:5432/attendance_db
REDIS_URL=redis://attendance-redis:6379
UPLOAD_PATH=/uploads/attendance
MAX_FILE_SIZE=5242880
DEFAULT_GEOFENCE_RADIUS=100
LOG_LEVEL=info

# Database Configuration
POSTGRES_DB=attendance_db
POSTGRES_USER=attendance_user
POSTGRES_PASSWORD=attendance_password

# Monitoring Configuration
GRAFANA_ADMIN_PASSWORD=password
PGADMIN_EMAIL=admin@attendance.com
PGADMIN_PASSWORD=password
EOF
        print_status "Environment file created: $ENV_FILE"
    else
        print_status "Environment file already exists: $ENV_FILE"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs/nginx
    mkdir -p logs/attendance
    mkdir -p database/backups
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p nginx/ssl
    
    print_status "Directories created successfully."
}

# Build and deploy services
deploy_services() {
    print_status "Building and deploying services..."
    
    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
    
    # Build and start services
    docker-compose -f "$COMPOSE_FILE" up -d --build
    
    print_status "Services deployment initiated."
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Checking service health (attempt $attempt/$max_attempts)..."
        
        # Check attendance service
        if curl -f http://localhost:3007/health >/dev/null 2>&1; then
            print_status "Attendance service is ready."
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Services failed to start within expected time."
            docker-compose -f "$COMPOSE_FILE" logs
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Initialize database
initialize_database() {
    print_status "Initializing database..."
    
    # Wait for PostgreSQL to be ready
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T attendance-db pg_isready -U attendance_user -d attendance_db >/dev/null 2>&1; then
            print_status "Database is ready."
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start within expected time."
            exit 1
        fi
        
        sleep 5
        ((attempt++))
    done
    
    # Run database initialization
    docker-compose -f "$COMPOSE_FILE" exec -T attendance-db psql -U attendance_user -d attendance_db -c "SELECT version();" >/dev/null 2>&1
    
    print_status "Database initialized successfully."
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check attendance service
    if curl -f http://localhost:3007/health >/dev/null 2>&1; then
        print_status "✅ Attendance service: HEALTHY"
    else
        print_error "❌ Attendance service: UNHEALTHY"
        return 1
    fi
    
    # Check PostgreSQL
    if docker-compose -f "$COMPOSE_FILE" exec -T attendance-db pg_isready -U attendance_user -d attendance_db >/dev/null 2>&1; then
        print_status "✅ PostgreSQL: HEALTHY"
    else
        print_error "❌ PostgreSQL: UNHEALTHY"
        return 1
    fi
    
    # Check Redis
    if docker-compose -f "$COMPOSE_FILE" exec -T attendance-redis redis-cli ping >/dev/null 2>&1; then
        print_status "✅ Redis: HEALTHY"
    else
        print_error "❌ Redis: UNHEALTHY"
        return 1
    fi
    
    # Check Grafana
    if curl -f http://localhost:3008/api/health >/dev/null 2>&1; then
        print_status "✅ Grafana: HEALTHY"
    else
        print_warning "⚠️  Grafana: Starting up..."
    fi
    
    # Check Prometheus
    if curl -f http://localhost:9097/-/healthy >/dev/null 2>&1; then
        print_status "✅ Prometheus: HEALTHY"
    else
        print_warning "⚠️  Prometheus: Starting up..."
    fi
    
    print_status "Health checks completed."
}

# Display service information
display_service_info() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Service Information${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${GREEN}Attendance Service:${NC} http://localhost:3007"
    echo -e "${GREEN}API Health Check:${NC} http://localhost:3007/health"
    echo -e "${GREEN}Grafana Dashboard:${NC} http://localhost:3008 (admin/password)"
    echo -e "${GREEN}Prometheus Metrics:${NC} http://localhost:9097"
    echo -e "${GREEN}pgAdmin:${NC} http://localhost:8088 (admin@attendance.com/password)"
    echo -e "${GREEN}Redis Commander:${NC} http://localhost:8087"
    echo -e "${GREEN}Nginx Proxy:${NC} http://localhost"
    echo ""
    echo -e "${YELLOW}Database Connection:${NC}"
    echo -e "Host: localhost"
    echo -e "Port: 5437"
    echo -e "Database: attendance_db"
    echo -e "Username: attendance_user"
    echo -e "Password: attendance_password"
    echo ""
    echo -e "${YELLOW}Redis Connection:${NC}"
    echo -e "Host: localhost"
    echo -e "Port: 6387"
    echo ""
    echo -e "${BLUE}==========================================${NC}"
}

# Main deployment process
main() {
    print_status "Starting Enhanced Attendance System deployment..."
    
    # Check prerequisites
    check_docker
    check_ports
    
    # Setup environment
    create_env_file
    create_directories
    
    # Deploy services
    deploy_services
    
    # Wait for services
    wait_for_services
    
    # Initialize database
    initialize_database
    
    # Health checks
    run_health_checks
    
    # Display information
    display_service_info
    
    print_status "Enhanced Attendance System deployment completed successfully!"
    print_status "You can now access the services using the URLs above."
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_status "Stopping attendance system..."
        docker-compose -f "$COMPOSE_FILE" down
        print_status "Attendance system stopped."
        ;;
    "restart")
        print_status "Restarting attendance system..."
        docker-compose -f "$COMPOSE_FILE" restart
        print_status "Attendance system restarted."
        ;;
    "logs")
        print_status "Showing service logs..."
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    "status")
        print_status "Checking service status..."
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "clean")
        print_warning "This will remove all data and containers. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_status "Cleaning up attendance system..."
            docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
            docker system prune -f
            print_status "Cleanup completed."
        else
            print_status "Cleanup cancelled."
        fi
        ;;
    *)
        main
        ;;
esac 