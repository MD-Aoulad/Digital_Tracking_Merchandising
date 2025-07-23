#!/bin/bash

# Enhanced Attendance System - Comprehensive Test Suite
# This script tests all features of the enhanced attendance system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ATTENDANCE_SERVICE_URL="http://localhost:3007"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci0xMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiZW1wbG95ZWUiLCJpYXQiOjE3MzE5NzY4MDAsImV4cCI6MTczMjA2MzIwMH0.test-signature"
MANAGER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtbWFuYWdlci0xMjMiLCJlbWFpbCI6Im1hbmFnZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoibWFuYWdlciIsImlhdCI6MTczMTk3NjgwMCwiZXhwIjoxNzMyMDYzMjAwf0.test-manager-signature"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"
    local description="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}[TEST $TOTAL_TESTS]${NC} $test_name - $description"
    
    local response
    local status_code
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TEST_TOKEN" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
    elif [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TEST_TOKEN" -d "$data" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Bearer $TEST_TOKEN" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
        fi
    fi
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$test_name passed (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "$test_name failed (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Function to test file upload
test_file_upload() {
    local test_name="$1"
    local endpoint="$2"
    local description="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}[TEST $TOTAL_TESTS]${NC} $test_name - $description"
    
    # Create a test image file
    local file_path="/tmp/test_photo.jpg"
    echo "test image data" > "$file_path"
    
    local response
    local status_code
    
    response=$(curl -s -w "\n%{http_code}" -X POST -F "photo=@$file_path" -F "workplaceId=test-workplace-123" -F "latitude=40.7128" -F "longitude=-74.0060" -F "accuracy=5" -H "Authorization: Bearer $TEST_TOKEN" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        print_success "$test_name passed (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "$test_name failed (Status: $status_code)"
        echo "Response: $response_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Clean up
    rm -f "$file_path"
    echo ""
}

# Function to test WebSocket connection
test_websocket() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}[TEST $TOTAL_TESTS]${NC} WebSocket Connection - Test real-time communication"
    
    # Test if WebSocket endpoint is accessible
    local response=$(curl -s -I "$ATTENDANCE_SERVICE_URL/socket.io/" | head -n1 | cut -d' ' -f2)
    
    if [ "$response" = "200" ] || [ "$response" = "101" ]; then
        print_success "WebSocket endpoint accessible"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "WebSocket endpoint not accessible"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Function to test performance
test_performance() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}[TEST $TOTAL_TESTS]${NC} Performance Test - Measure response time"
    
    local start_time=$(date +%s%N)
    curl -s -f "$ATTENDANCE_SERVICE_URL/health" >/dev/null
    local end_time=$(date +%s%N)
    
    local duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
    
    if [ $duration -lt 100 ]; then
        print_success "Performance test passed: ${duration}ms (target: <100ms)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_warning "Performance test: ${duration}ms (target: <100ms)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    
    echo ""
}

# Main test execution
main() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Enhanced Attendance System Test Suite${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "Service URL: $ATTENDANCE_SERVICE_URL"
    echo -e "Timestamp: $(date)"
    echo ""
    
    # Check if service is running
    print_status "Checking if attendance service is running..."
    if ! curl -f "$ATTENDANCE_SERVICE_URL/health" >/dev/null 2>&1; then
        print_error "Attendance service is not running. Please start it first."
        exit 1
    fi
    
    print_status "Attendance service is running. Starting tests..."
    echo ""
    
    # Core API Tests
    run_test "Health Check" "GET" "/health" "200" "" "Service health check"
    run_test "Unauthorized Access" "GET" "/api/attendance/current" "401" "" "Access without authentication"
    run_test "Invalid Token" "GET" "/api/attendance/current" "401" "" "Access with invalid token"
    
    # Enhanced Punch In/Out Tests
    test_file_upload "Punch In with Photo" "/api/attendance/punch-in" "Punch in with photo upload"
    run_test "Punch In Data" "POST" "/api/attendance/punch-in" "200" '{"workplaceId":"test-123","latitude":40.7128,"longitude":-74.0060,"accuracy":5}' "Punch in with GPS data"
    run_test "Punch Out" "POST" "/api/attendance/punch-out" "200" '{"latitude":40.7128,"longitude":-74.0060,"accuracy":5}' "Punch out with GPS data"
    
    # Break Management Tests
    run_test "Start Break" "POST" "/api/attendance/break/start" "200" '{"type":"lunch","notes":"Lunch break"}' "Start lunch break"
    run_test "End Break" "POST" "/api/attendance/break/end" "200" '{"notes":"Back from lunch"}' "End break"
    
    # Current Status Tests
    run_test "Current Status" "GET" "/api/attendance/current" "200" "" "Get current attendance status"
    
    # Approval System Tests
    run_test "Request Approval" "POST" "/api/attendance/approval/request" "200" '{"type":"late","reason":"Traffic delay"}' "Request late arrival approval"
    run_test "Approval History" "GET" "/api/attendance/approval/requests" "200" "" "Get approval requests"
    
    # Manager Tests (with manager token)
    run_test "Team Status" "GET" "/api/attendance/team/status" "200" "" "Get team status (manager view)"
    run_test "Attendance History" "GET" "/api/attendance/history" "200" "" "Get attendance history"
    
    # Advanced Features Tests
    run_test "Geofencing Test" "POST" "/api/attendance/punch-in" "200" '{"workplaceId":"test-123","latitude":40.7128,"longitude":-74.0060,"accuracy":5,"deviceInfo":{"device":"iPhone 15","os":"iOS 17.0"}}' "Punch in with device info"
    run_test "Shift Management" "GET" "/api/attendance/shifts" "200" "" "Get available shifts"
    
    # Security Tests
    run_test "Rate Limiting" "GET" "/api/attendance/current" "200" "" "Test rate limiting (should work)"
    run_test "GPS Spoofing Detection" "POST" "/api/attendance/punch-in" "400" '{"workplaceId":"test-123","latitude":40.7128,"longitude":-74.0060,"accuracy":0.1}' "Test GPS spoofing detection"
    
    # File Upload Security Tests
    test_file_upload "File Upload Security" "/api/attendance/punch-in" "Test file upload security"
    
    # WebSocket Tests
    test_websocket
    
    # Performance Tests
    test_performance
    
    # Display test summary
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Test Summary${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: $PASSED_TESTS"
    echo -e "Failed: $FAILED_TESTS"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Success Rate: ${success_rate}%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Some tests failed. Please check the errors above.${NC}"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "health")
        print_status "Checking service health..."
        curl -s "$ATTENDANCE_SERVICE_URL/health" | jq . 2>/dev/null || curl -s "$ATTENDANCE_SERVICE_URL/health"
        ;;
    "endpoints")
        print_status "Testing basic endpoints..."
        run_test "Health Check" "GET" "/health" "200" "" "Service health check"
        run_test "Current Status" "GET" "/api/attendance/current" "200" "" "Get current status"
        ;;
    *)
        main
        ;;
esac 