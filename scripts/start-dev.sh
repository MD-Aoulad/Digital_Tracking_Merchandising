#!/bin/bash

# Workforce Management Platform - Development Startup Script
# This script manages both frontend and backend servers with proper process management

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=5000
FRONTEND_URL="http://localhost:$FRONTEND_PORT"
BACKEND_URL="http://localhost:$BACKEND_PORT"

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

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        print_warning "Killing processes on port $port: $pids"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to start backend server
start_backend() {
    print_status "Starting backend server..."
    
    # Check if backend dependencies are installed
    if [ ! -d "backend/node_modules" ]; then
        print_warning "Backend dependencies not found. Installing..."
        cd backend
        npm install
        cd ..
    fi
    
    # Kill any existing backend processes
    kill_port $BACKEND_PORT
    
    # Start backend in background
    cd backend
    npm start > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service "$BACKEND_URL/api/health" "Backend"; then
        print_success "Backend server started successfully (PID: $BACKEND_PID)"
        echo $BACKEND_PID > .backend.pid
        return 0
    else
        print_error "Failed to start backend server"
        return 1
    fi
}

# Function to start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    
    # Check if frontend dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not found. Installing..."
        npm install
    fi
    
    # Kill any existing frontend processes
    kill_port $FRONTEND_PORT
    
    # Start frontend in background
    npm start > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    if wait_for_service "$FRONTEND_URL" "Frontend"; then
        print_success "Frontend server started successfully (PID: $FRONTEND_PID)"
        echo $FRONTEND_PID > .frontend.pid
        return 0
    else
        print_error "Failed to start frontend server"
        return 1
    fi
}

# Function to stop all servers
stop_servers() {
    print_status "Stopping all servers..."
    
    # Stop backend
    if [ -f ".backend.pid" ]; then
        local backend_pid=$(cat .backend.pid)
        if kill -0 $backend_pid 2>/dev/null; then
            kill $backend_pid
            print_success "Backend server stopped (PID: $backend_pid)"
        fi
        rm -f .backend.pid
    fi
    
    # Stop frontend
    if [ -f ".frontend.pid" ]; then
        local frontend_pid=$(cat .frontend.pid)
        if kill -0 $frontend_pid 2>/dev/null; then
            kill $frontend_pid
            print_success "Frontend server stopped (PID: $frontend_pid)"
        fi
        rm -f .frontend.pid
    fi
    
    # Kill any remaining processes on our ports
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    print_success "All servers stopped"
}

# Function to show server status
show_status() {
    echo -e "\n${BLUE}=== Server Status ===${NC}"
    
    # Backend status
    if check_port $BACKEND_PORT; then
        print_success "Backend: Running on $BACKEND_URL"
        if [ -f ".backend.pid" ]; then
            local backend_pid=$(cat .backend.pid)
            echo "  PID: $backend_pid"
        fi
    else
        print_error "Backend: Not running"
    fi
    
    # Frontend status
    if check_port $FRONTEND_PORT; then
        print_success "Frontend: Running on $FRONTEND_URL"
        if [ -f ".frontend.pid" ]; then
            local frontend_pid=$(cat .frontend.pid)
            echo "  PID: $frontend_pid"
        fi
    else
        print_error "Frontend: Not running"
    fi
    
    echo ""
}

# Function to show logs
show_logs() {
    local service=$1
    if [ "$service" = "backend" ]; then
        if [ -f "logs/backend.log" ]; then
            echo -e "\n${BLUE}=== Backend Logs ===${NC}"
            tail -f logs/backend.log
        else
            print_error "Backend log file not found"
        fi
    elif [ "$service" = "frontend" ]; then
        if [ -f "logs/frontend.log" ]; then
            echo -e "\n${BLUE}=== Frontend Logs ===${NC}"
            tail -f logs/frontend.log
        else
            print_error "Frontend log file not found"
        fi
    else
        print_error "Usage: $0 logs [backend|frontend]"
    fi
}

# Function to run tests
run_tests() {
    local test_type=$1
    
    case $test_type in
        "frontend")
            print_status "Running frontend tests..."
            npm test -- --watchAll=false --coverage
            ;;
        "backend")
            print_status "Running backend tests..."
            cd backend
            npm test
            cd ..
            ;;
        "all")
            print_status "Running all tests..."
            npm test -- --watchAll=false --coverage
            cd backend
            npm test
            cd ..
            ;;
        *)
            print_error "Usage: $0 test [frontend|backend|all]"
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo -e "${BLUE}Workforce Management Platform - Development Script${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start both frontend and backend servers"
    echo "  stop      Stop all servers"
    echo "  restart   Restart all servers"
    echo "  status    Show server status"
    echo "  logs      Show server logs (backend|frontend)"
    echo "  test      Run tests (frontend|backend|all)"
    echo "  clean     Clean up processes and temporary files"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start both servers"
    echo "  $0 logs backend   # Show backend logs"
    echo "  $0 test all       # Run all tests"
    echo ""
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Stop servers
    stop_servers
    
    # Remove PID files
    rm -f .backend.pid .frontend.pid
    
    # Clean up logs directory
    if [ -d "logs" ]; then
        rm -rf logs
    fi
    
    print_success "Cleanup completed"
}

# Main script logic
main() {
    # Create logs directory
    mkdir -p logs
    
    # Handle command line arguments
    case "${1:-start}" in
        "start")
            print_status "Starting Workforce Management Platform..."
            start_backend
            start_frontend
            show_status
            print_success "Development environment is ready!"
            print_status "Frontend: $FRONTEND_URL"
            print_status "Backend: $BACKEND_URL"
            print_status "API Docs: $BACKEND_URL/api/docs"
            echo ""
            print_status "Press Ctrl+C to stop all servers"
            
            # Wait for interrupt signal
            trap stop_servers INT
            wait
            ;;
        "stop")
            stop_servers
            ;;
        "restart")
            stop_servers
            sleep 2
            $0 start
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs $2
            ;;
        "test")
            run_tests $2
            ;;
        "clean")
            cleanup
            ;;
        "help"|"-h"|"--help")
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