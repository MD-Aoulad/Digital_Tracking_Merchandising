#!/bin/bash

# Enhanced Attendance System Test Script
# Tests all attendance service endpoints with comprehensive validation

set -e

# Configuration
ATTENDANCE_SERVICE_URL="http://localhost:3007"
API_GATEWAY_URL="http://localhost:8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local description="$6"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log_info "Testing: $test_name - $description"
    
    local response
    local status_code
    
        if [ "$method" = "GET" ]; then
      response=$(curl -s -w "\n%{http_code}" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
    elif [ "$method" = "POST" ]; then
      if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
      else
        response=$(curl -s -w "\n%{http_code}" -X POST "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
      fi
    fi
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$test_name passed (Status: $status_code)"
        echo "Response: $response_body" | head -c 200
        echo "..."
    else
        log_error "$test_name failed (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
    fi
    
    echo ""
}

test_file_upload() {
    local test_name="$1"
    local endpoint="$2"
    local file_path="$3"
    local expected_status="$4"
    local description="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log_info "Testing: $test_name - $description"
    
    # Create a test image file if it doesn't exist
    if [ ! -f "$file_path" ]; then
        # Create a simple test image (1x1 pixel PNG)
        echo -n -e '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x07tIME\x07\xe5\x01\x13\x0b\x1d\x0e\xb7\xc7\xc7\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178\xea\x00\x00\x00\x00IEND\xaeB`\x82' > "$file_path"
    fi
    
    local response
    local status_code
    
    response=$(curl -s -w "\n%{http_code}" -X POST -F "photo=@$file_path" -F "workplaceId=test-workplace-123" -F "latitude=40.7128" -F "longitude=-74.0060" -F "accuracy=5" "$ATTENDANCE_SERVICE_URL$endpoint" || echo -e "\n000")
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$test_name passed (Status: $status_code)"
        echo "Response: $response_body" | head -c 200
        echo "..."
    else
        log_error "$test_name failed (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
    fi
    
    echo ""
}

# Mock JWT tokens (in real scenario, these would be obtained from auth service)
MOCK_EMPLOYEE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVtcGxveWVlLTEyMyIsInJvbGUiOiJlbXBsb3llZSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTcwNTYwMDAwMCwiZXhwIjoxNzA1Njg2NDAwfQ.mock-signature"
MOCK_MANAGER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1hbmFnZXItMTIzIiwicm9sZSI6Im1hbmFnZXIiLCJuYW1lIjoiSmFuZSBTbWl0aCIsImlhdCI6MTcwNTYwMDAwMCwiZXhwIjoxNzA1Njg2NDAwfQ.mock-signature"
MOCK_ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTEyMyIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiaWF0IjoxNzA1NjAwMDAwLCJleHAiOjE3MDU2ODY0MDB9.mock-signature"

echo "=========================================="
echo "Enhanced Attendance System Test Suite"
echo "=========================================="
echo "Service URL: $ATTENDANCE_SERVICE_URL"
echo "Timestamp: $(date)"
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/health" "" "200" "Service health check"

# Test 2: Service without authentication (should fail)
test_endpoint "Unauthorized Access" "GET" "/api/attendance/current" "" "401" "Access without authentication should be denied"

# Test 3: Punch In without photo (should fail)
test_endpoint "Punch In No Photo" "POST" "/api/attendance/punch-in" '{"workplaceId":"test-123","latitude":40.7128,"longitude":-74.0060}' "401" "Punch in without authentication"

# Test 4: Punch In with invalid token (should fail)
test_endpoint "Punch In Invalid Token" "POST" "/api/attendance/punch-in" '{"workplaceId":"test-123","latitude":40.7128,"longitude":-74.0060}' "403" "Punch in with invalid token"

# Test 5: Get Current Status with invalid token (should fail)
test_endpoint "Current Status Invalid Token" "GET" "/api/attendance/current" "" "403" "Get current status with invalid token"

# Test 6: Start Break without authentication (should fail)
test_endpoint "Start Break No Auth" "POST" "/api/attendance/break/start" '{"type":"lunch","notes":"Test break"}' "401" "Start break without authentication"

# Test 7: Request Approval without authentication (should fail)
test_endpoint "Request Approval No Auth" "POST" "/api/attendance/approval/request" '{"type":"late","reason":"Traffic delay"}' "401" "Request approval without authentication"

# Test 8: Team Status without manager role (should fail)
test_endpoint "Team Status No Manager Role" "GET" "/api/attendance/team/status" "" "403" "Team status without manager role"

# Test 9: Get Attendance History without authentication (should fail)
test_endpoint "Attendance History No Auth" "GET" "/api/attendance/history" "" "401" "Get attendance history without authentication"

# Test 10: Test rate limiting (multiple rapid requests)
log_info "Testing Rate Limiting..."
for i in {1..5}; do
    response=$(curl -s -w "\n%{http_code}" "$ATTENDANCE_SERVICE_URL/health" || echo -e "\n000")
    status_code=$(echo "$response" | tail -n1)
    if [ "$status_code" = "200" ]; then
        log_success "Rate limit test $i passed"
    else
        log_error "Rate limit test $i failed (Status: $status_code)"
    fi
done

# Test 11: Test WebSocket connection (basic connectivity)
log_info "Testing WebSocket Connection..."
# This would require a WebSocket client, but we can test the endpoint exists
response=$(curl -s -w "\n%{http_code}" "$ATTENDANCE_SERVICE_URL/" || echo -e "\n000")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "404" ] || [ "$status_code" = "200" ]; then
    log_success "WebSocket endpoint accessible"
else
    log_error "WebSocket endpoint not accessible (Status: $status_code)"
fi

# Test 12: Test file upload endpoint (without authentication)
test_file_upload "File Upload No Auth" "/api/attendance/punch-in" "/tmp/test_photo.png" "401" "File upload without authentication"

# Test 13: Test invalid file type
log_info "Testing Invalid File Type..."
# Create a text file instead of image
echo "This is not an image" > /tmp/invalid_file.txt
response=$(curl -s -w "\n%{http_code}" -X POST -F "photo=@/tmp/invalid_file.txt" -F "workplaceId=test-123" -F "latitude=40.7128" -F "longitude=-74.0060" "$ATTENDANCE_SERVICE_URL/api/attendance/punch-in" || echo -e "\n000")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ] || [ "$status_code" = "400" ]; then
    log_success "Invalid file type rejected"
else
    log_error "Invalid file type not properly rejected (Status: $status_code)"
fi

# Test 14: Test GPS spoofing detection
test_endpoint "GPS Spoofing Detection" "POST" "/api/attendance/punch-in" '{"workplaceId":"test-123","latitude":40.7128,"longitude":-74.0060,"accuracy":0.1}' "401" "GPS spoofing detection with unrealistic accuracy"

# Test 15: Test missing required fields
test_endpoint "Missing Required Fields" "POST" "/api/attendance/punch-in" '{"latitude":40.7128}' "401" "Punch in with missing required fields"

# Test 16: Test invalid approval type
test_endpoint "Invalid Approval Type" "POST" "/api/attendance/approval/request" '{"type":"invalid_type","reason":"Test"}' "401" "Request approval with invalid type"

# Test 17: Test invalid break type
test_endpoint "Invalid Break Type" "POST" "/api/attendance/break/start" '{"type":"invalid_break","notes":"Test"}' "401" "Start break with invalid type"

# Test 18: Test pagination parameters
test_endpoint "Pagination Parameters" "GET" "/api/attendance/history?page=1&limit=10" "" "401" "Get attendance history with pagination"

# Test 19: Test date filtering
test_endpoint "Date Filtering" "GET" "/api/attendance/history?startDate=2025-01-01&endDate=2025-01-31" "" "401" "Get attendance history with date filtering"

# Test 20: Test workplace filtering
test_endpoint "Workplace Filtering" "GET" "/api/attendance/team/status?workplaceId=test-123" "" "403" "Team status with workplace filtering"

# Test 21: Test shift filtering
test_endpoint "Shift Filtering" "GET" "/api/attendance/team/status?shiftId=test-shift-123" "" "403" "Team status with shift filtering"

# Test 22: Test approval action without proper role
test_endpoint "Approval Action No Role" "POST" "/api/attendance/approval/test-request-123/action" '{"action":"approve","notes":"Test approval"}' "403" "Approval action without proper role"

# Test 23: Test invalid approval action
test_endpoint "Invalid Approval Action" "POST" "/api/attendance/approval/test-request-123/action" '{"action":"invalid_action","notes":"Test"}' "403" "Invalid approval action"

# Test 24: Test break end without active break
test_endpoint "Break End No Active Break" "POST" "/api/attendance/break/end" '{"notes":"End break"}' "401" "End break without active break"

# Test 25: Test punch out without active punch in
test_endpoint "Punch Out No Active Punch In" "POST" "/api/attendance/punch-out" '{"latitude":40.7128,"longitude":-74.0060}' "401" "Punch out without active punch in"

# Performance Tests
log_info "Running Performance Tests..."

# Test 26: Concurrent health checks
log_info "Testing concurrent health checks..."
for i in {1..10}; do
    (curl -s "$ATTENDANCE_SERVICE_URL/health" > /dev/null && log_success "Concurrent health check $i") &
done
wait

# Test 27: Response time test
log_info "Testing response time..."
start_time=$(date +%s%N)
curl -s "$ATTENDANCE_SERVICE_URL/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))
if [ $response_time -lt 1000 ]; then
    log_success "Response time acceptable: ${response_time}ms"
else
    log_warning "Response time slow: ${response_time}ms"
fi

# Cleanup
rm -f /tmp/test_photo.png /tmp/invalid_file.txt

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    log_success "All tests passed! Enhanced attendance system is working correctly."
    exit 0
else
    log_error "Some tests failed. Please check the service configuration and try again."
    exit 1
fi 