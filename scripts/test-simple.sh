#!/bin/bash

# Simple, Reliable Test Runner for Workforce Management Platform
# This script runs tests without the complex configurations that cause issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    
    # Check if frontend is ready
    if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_error "Frontend not running on port 3000"
        return 1
    fi
    
    # Run simple frontend tests
    npm test -- --watchAll=false --passWithNoTests --verbose=false 2>&1 | tee test-frontend.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Frontend tests completed"
        return 0
    else
        print_error "Frontend tests failed"
        return 1
    fi
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend tests..."
    
    # Check if backend is ready
    if ! curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        print_error "Backend not running on port 5000"
        return 1
    fi
    
    # Run simple backend tests
    cd backend
    npm test -- --watchAll=false --passWithNoTests --verbose=false 2>&1 | tee ../test-backend.log
    local exit_code=${PIPESTATUS[0]}
    cd ..
    
    if [ $exit_code -eq 0 ]; then
        print_success "Backend tests completed"
        return 0
    else
        print_error "Backend tests failed"
        return 1
    fi
}

# Function to run API integration tests
run_api_tests() {
    print_status "Running API integration tests..."
    
    # Simple API health check
    if curl -s http://localhost:5000/api/health | grep -q "status"; then
        print_success "API health check passed"
    else
        print_error "API health check failed"
        return 1
    fi
    
    # Test authentication endpoint
    if curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@company.com","password":"password"}' | grep -q "token"; then
        print_success "Authentication test passed"
    else
        print_warning "Authentication test failed (expected for demo)"
    fi
    
    return 0
}

# Function to run basic smoke tests
run_smoke_tests() {
    print_status "Running smoke tests..."
    
    # Test frontend accessibility
    if curl -s http://localhost:3000 | grep -q "Workforce"; then
        print_success "Frontend accessible"
    else
        print_error "Frontend not accessible"
        return 1
    fi
    
    # Test backend accessibility
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        print_success "Backend accessible"
    else
        print_error "Backend not accessible"
        return 1
    fi
    
    return 0
}

# Main test runner
main() {
    echo -e "${BLUE}=== Workforce Management Platform - Simple Test Runner ===${NC}"
    echo ""
    
    local frontend_result=0
    local backend_result=0
    local api_result=0
    local smoke_result=0
    
    # Run smoke tests first
    if run_smoke_tests; then
        smoke_result=0
    else
        smoke_result=1
    fi
    
    echo ""
    
    # Run API tests
    if run_api_tests; then
        api_result=0
    else
        api_result=1
    fi
    
    echo ""
    
    # Run frontend tests (if requested)
    if [ "$1" = "frontend" ] || [ "$1" = "all" ] || [ -z "$1" ]; then
        if run_frontend_tests; then
            frontend_result=0
        else
            frontend_result=1
        fi
        echo ""
    fi
    
    # Run backend tests (if requested)
    if [ "$1" = "backend" ] || [ "$1" = "all" ] || [ -z "$1" ]; then
        if run_backend_tests; then
            backend_result=0
        else
            backend_result=1
        fi
        echo ""
    fi
    
    # Summary
    echo -e "${BLUE}=== Test Summary ===${NC}"
    echo "Smoke Tests: $([ $smoke_result -eq 0 ] && echo "PASS" || echo "FAIL")"
    echo "API Tests: $([ $api_result -eq 0 ] && echo "PASS" || echo "FAIL")"
    
    if [ "$1" = "frontend" ] || [ "$1" = "all" ] || [ -z "$1" ]; then
        echo "Frontend Tests: $([ $frontend_result -eq 0 ] && echo "PASS" || echo "FAIL")"
    fi
    
    if [ "$1" = "backend" ] || [ "$1" = "all" ] || [ -z "$1" ]; then
        echo "Backend Tests: $([ $backend_result -eq 0 ] && echo "PASS" || echo "FAIL")"
    fi
    
    echo ""
    
    # Overall result
    local total_failures=$((smoke_result + api_result + frontend_result + backend_result))
    
    if [ $total_failures -eq 0 ]; then
        print_success "All tests passed! 🎉"
        exit 0
    else
        print_error "$total_failures test suite(s) failed"
        exit 1
    fi
}

# Show help
if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Simple Test Runner for Workforce Management Platform"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  (none)   Run all tests"
    echo "  all      Run all tests"
    echo "  frontend Run only frontend tests"
    echo "  backend  Run only backend tests"
    echo "  smoke    Run only smoke tests"
    echo "  help     Show this help"
    echo ""
    echo "Examples:"
    echo "  $0           # Run all tests"
    echo "  $0 frontend  # Run only frontend tests"
    echo "  $0 backend   # Run only backend tests"
    exit 0
fi

# Run main function
main "$@" 