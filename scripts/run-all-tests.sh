#!/bin/bash

# Comprehensive Test Runner Script
# Runs all test suites for the Digital Tracking Merchandising platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to run a test suite
run_test_suite() {
    local suite_name=$1
    local command=$2
    local directory=$3
    
    print_status "INFO" "Running $suite_name tests..."
    
    if [ -n "$directory" ]; then
        cd "$directory"
    fi
    
    if eval "$command"; then
        print_status "SUCCESS" "$suite_name tests passed"
        ((PASSED_TESTS++))
    else
        print_status "ERROR" "$suite_name tests failed"
        ((FAILED_TESTS++))
        return 1
    fi
    
    if [ -n "$directory" ]; then
        cd - > /dev/null
    fi
    
    ((TOTAL_TESTS++))
    echo ""
}

# Function to check if servers are running
check_servers() {
    print_status "INFO" "Checking if servers are running..."
    
    # Check backend server
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        print_status "SUCCESS" "Backend server is running on port 5000"
    else
        print_status "WARNING" "Backend server is not running on port 5000"
        print_status "INFO" "Starting backend server..."
        cd backend && npm start &
        cd ..
        sleep 5
    fi
    
    # Check frontend server
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "SUCCESS" "Frontend server is running on port 3000"
    else
        print_status "WARNING" "Frontend server is not running on port 3000"
        print_status "INFO" "Starting frontend server..."
        npm start &
        sleep 10
    fi
    
    echo ""
}

# Function to run health checks
run_health_checks() {
    print_status "INFO" "Running health checks..."
    
    # Backend health check
    if curl -s http://localhost:5000/api/health | grep -q '"status":"OK"'; then
        print_status "SUCCESS" "Backend health check passed"
    else
        print_status "ERROR" "Backend health check failed"
        return 1
    fi
    
    # Frontend health check
    if curl -s http://localhost:3000 | grep -q "React"; then
        print_status "SUCCESS" "Frontend health check passed"
    else
        print_status "ERROR" "Frontend health check failed"
        return 1
    fi
    
    echo ""
}

# Function to run smoke tests
run_smoke_tests() {
    print_status "INFO" "Running smoke tests..."
    
    if node scripts/smoke-test.js; then
        print_status "SUCCESS" "Smoke tests passed"
    else
        print_status "ERROR" "Smoke tests failed"
        return 1
    fi
    
    echo ""
}

# Function to generate test report
generate_report() {
    local report_file="test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    echo "=== Digital Tracking Merchandising - Test Report ===" > "$report_file"
    echo "Generated: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    echo "Test Summary:" >> "$report_file"
    echo "- Total Test Suites: $TOTAL_TESTS" >> "$report_file"
    echo "- Passed: $PASSED_TESTS" >> "$report_file"
    echo "- Failed: $FAILED_TESTS" >> "$report_file"
    echo "- Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%" >> "$report_file"
    echo "" >> "$report_file"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo "🎉 All tests passed successfully!" >> "$report_file"
        print_status "SUCCESS" "Test report generated: $report_file"
    else
        echo "❌ Some tests failed. Please review the output above." >> "$report_file"
        print_status "ERROR" "Test report generated: $report_file"
    fi
}

# Main execution
main() {
    echo "🚀 Starting Comprehensive Test Suite"
    echo "======================================"
    echo ""
    
    # Parse command line arguments
    SKIP_HEALTH=false
    SKIP_SMOKE=false
    SKIP_BACKEND=false
    SKIP_FRONTEND=false
    SKIP_MOBILE=false
    SKIP_E2E=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-health)
                SKIP_HEALTH=true
                shift
                ;;
            --skip-smoke)
                SKIP_SMOKE=true
                shift
                ;;
            --skip-backend)
                SKIP_BACKEND=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --skip-mobile)
                SKIP_MOBILE=true
                shift
                ;;
            --skip-e2e)
                SKIP_E2E=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-health     Skip health checks"
                echo "  --skip-smoke      Skip smoke tests"
                echo "  --skip-backend    Skip backend tests"
                echo "  --skip-frontend   Skip frontend tests"
                echo "  --skip-mobile     Skip mobile tests"
                echo "  --skip-e2e        Skip E2E tests"
                echo "  --help            Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_status "ERROR" "Please run this script from the project root directory"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "INFO" "Installing frontend dependencies..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        print_status "INFO" "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    # Run health checks
    if [ "$SKIP_HEALTH" = false ]; then
        check_servers
        run_health_checks
    fi
    
    # Run smoke tests
    if [ "$SKIP_SMOKE" = false ]; then
        run_smoke_tests
    fi
    
    # Run backend tests
    if [ "$SKIP_BACKEND" = false ]; then
        run_test_suite "Backend Unit" "npm run test:unit" "backend"
        run_test_suite "Backend Integration" "npm run test:integration" "backend"
        run_test_suite "Backend Security" "npm run test:security" "backend"
        run_test_suite "Backend Performance" "npm run test:performance" "backend"
    fi
    
    # Run frontend tests
    if [ "$SKIP_FRONTEND" = false ]; then
        run_test_suite "Frontend Unit" "npm run test:unit"
        run_test_suite "Frontend Integration" "npm run test:integration"
        run_test_suite "Frontend Component" "npm test -- --testPathPattern='components' --coverage --watchAll=false"
    fi
    
    # Run mobile tests
    if [ "$SKIP_MOBILE" = false ] && [ -d "mobile" ]; then
        run_test_suite "Mobile" "npm test -- --coverage --watchAll=false" "mobile"
    fi
    
    # Run E2E tests
    if [ "$SKIP_E2E" = false ]; then
        run_test_suite "E2E" "npm run test:e2e"
    fi
    
    # Generate coverage reports
    print_status "INFO" "Generating coverage reports..."
    
    if [ "$SKIP_BACKEND" = false ]; then
        cd backend && npm run test:coverage && cd ..
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        npm run test:coverage
    fi
    
    # Generate final report
    generate_report
    
    # Print summary
    echo ""
    echo "======================================"
    echo "🏁 Test Suite Complete"
    echo "======================================"
    echo "Total Test Suites: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_status "SUCCESS" "🎉 All tests passed successfully!"
        exit 0
    else
        print_status "ERROR" "❌ $FAILED_TESTS test suite(s) failed"
        exit 1
    fi
}

# Run main function with all arguments
main "$@" 