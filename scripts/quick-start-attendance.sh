#!/bin/bash

# Quick Start Attendance System - Local Development
# This script sets up the attendance system for immediate testing

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Quick Start Attendance System${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if PostgreSQL is installed
check_postgres() {
    print_status "Checking PostgreSQL installation..."
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL is installed"
        return 0
    else
        print_warning "PostgreSQL not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install postgresql@15
            brew services start postgresql@15
        else
            print_warning "Please install PostgreSQL manually"
            return 1
        fi
    fi
}

# Check if Redis is installed
check_redis() {
    print_status "Checking Redis installation..."
    if command -v redis-server &> /dev/null; then
        print_status "Redis is installed"
        return 0
    else
        print_warning "Redis not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew install redis
            brew services start redis
        else
            print_warning "Please install Redis manually"
            return 1
        fi
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Create database and user
    psql postgres -c "CREATE USER attendance_user WITH PASSWORD 'attendance_password';" 2>/dev/null || true
    psql postgres -c "CREATE DATABASE attendance_db OWNER attendance_user;" 2>/dev/null || true
    psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;" 2>/dev/null || true
    
    # Run schema initialization
    psql -U attendance_user -d attendance_db -f devops/database/init/01-attendance-schema.sql
    
    print_status "Database setup completed"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start Redis in background
    redis-server --daemonize yes --port 6379
    
    # Start attendance service
    cd ../microservices/attendance-service
    
    # Set environment variables
    export NODE_ENV=production
    export PORT=3007
    export JWT_SECRET=your-super-secret-jwt-key-for-testing
    export DATABASE_URL=postgresql://attendance_user:attendance_password@localhost:5432/attendance_db
    export REDIS_URL=redis://localhost:6379
    export UPLOAD_PATH=./uploads/attendance
    export MAX_FILE_SIZE=5242880
    export DEFAULT_GEOFENCE_RADIUS=100
    export LOG_LEVEL=info
    
    # Create upload directory
    mkdir -p uploads/attendance
    
    # Start the service
    print_status "Starting attendance service..."
    node server.js &
    ATTENDANCE_PID=$!
    
    echo $ATTENDANCE_PID > .attendance.pid
    
    print_status "Attendance service started with PID: $ATTENDANCE_PID"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for Redis
    for i in {1..30}; do
        if redis-cli ping >/dev/null 2>&1; then
            print_status "Redis is ready"
            break
        fi
        sleep 1
    done
    
    # Wait for attendance service
    for i in {1..30}; do
        if curl -f http://localhost:3007/health >/dev/null 2>&1; then
            print_status "Attendance service is ready"
            break
        fi
        sleep 1
    done
}

# Display service information
display_info() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Service Information${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${GREEN}Attendance Service:${NC} http://localhost:3007"
    echo -e "${GREEN}Health Check:${NC} http://localhost:3007/health"
    echo -e "${GREEN}PostgreSQL:${NC} localhost:5432 (attendance_db)"
    echo -e "${GREEN}Redis:${NC} localhost:6379"
    echo ""
    echo -e "${YELLOW}Database Connection:${NC}"
    echo -e "Host: localhost"
    echo -e "Port: 5432"
    echo -e "Database: attendance_db"
    echo -e "Username: attendance_user"
    echo -e "Password: attendance_password"
    echo ""
    echo -e "${BLUE}==========================================${NC}"
}

# Main execution
main() {
    print_status "Starting quick setup..."
    
    # Check prerequisites
    check_postgres
    check_redis
    
    # Setup database
    setup_database
    
    # Start services
    start_services
    
    # Wait for services
    wait_for_services
    
    # Display information
    display_info
    
    print_status "Quick setup completed!"
    print_status "You can now test the attendance system."
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_status "Stopping services..."
        if [ -f .attendance.pid ]; then
            kill $(cat .attendance.pid) 2>/dev/null || true
            rm .attendance.pid
        fi
        redis-cli shutdown 2>/dev/null || true
        print_status "Services stopped."
        ;;
    "status")
        print_status "Checking service status..."
        if [ -f .attendance.pid ] && kill -0 $(cat .attendance.pid) 2>/dev/null; then
            print_status "Attendance service: RUNNING"
        else
            print_status "Attendance service: STOPPED"
        fi
        
        if redis-cli ping >/dev/null 2>&1; then
            print_status "Redis: RUNNING"
        else
            print_status "Redis: STOPPED"
        fi
        ;;
    *)
        main
        ;;
esac 