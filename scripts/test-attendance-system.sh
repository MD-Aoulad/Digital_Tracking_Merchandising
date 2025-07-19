#!/bin/bash

# 📍 ATTENDANCE SYSTEM TEST SCRIPT
# Tests all attendance tracking and workplace management endpoints

set -e

echo "📍 Testing Attendance System..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Global variables
AUTH_TOKEN=""
USER_ID=""
WORKPLACE_ID=""
ATTENDANCE_ID=""

# Function to print test results
print_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name - $message"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name - $message"
        ((TESTS_FAILED++))
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local test_name="$4"
    local data="$5"
    local headers="$6"
    
    local curl_cmd="curl -s -w \"%{http_code}\" -o /tmp/response.json"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        curl_cmd="$curl_cmd -X $method -H \"Content-Type: application/json\""
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    else
        curl_cmd="$curl_cmd -X $method"
    fi
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd -H \"$headers\""
    fi
    
    curl_cmd="$curl_cmd \"http://localhost:8080$endpoint\" 2>/dev/null"
    
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_test_result "$test_name" "PASS" "Status: $status_code"
        return 0
    else
        print_test_result "$test_name" "FAIL" "Expected: $expected_status, Got: $status_code"
        return 1
    fi
}

echo -e "${BLUE}1. Testing Service Health...${NC}"

# Test API Gateway health
if test_api_endpoint "GET" "/health" "200" "API Gateway Health"; then
    echo -e "${GREEN}✅ API Gateway is healthy${NC}"
else
    echo -e "${RED}❌ API Gateway health check failed${NC}"
    exit 1
fi

# Test Attendance Service health
if test_api_endpoint "GET" "/api/test-attendance" "200" "Attendance Service Health"; then
    echo -e "${GREEN}✅ Attendance Service is healthy${NC}"
else
    echo -e "${RED}❌ Attendance Service health check failed${NC}"
    exit 1
fi

echo -e "\n${BLUE}2. Testing Authentication...${NC}"

# Login to get auth token
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@company.com","password":"password"}' \
    "http://localhost:8080/api/auth/login" 2>/dev/null)

LOGIN_STATUS="${LOGIN_RESPONSE: -3}"

if [ "$LOGIN_STATUS" = "200" ]; then
    print_test_result "Admin Login" "PASS" "Login successful"
    
    # Extract token and user ID
    AUTH_TOKEN=$(cat /tmp/login_response.json | jq -r '.token' 2>/dev/null || echo "")
    USER_ID=$(cat /tmp/login_response.json | jq -r '.user.id' 2>/dev/null || echo "")
    
    if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
        print_test_result "JWT Token Extraction" "PASS" "Token received"
    else
        print_test_result "JWT Token Extraction" "FAIL" "No token in response"
    fi
else
    print_test_result "Admin Login" "FAIL" "Status: $LOGIN_STATUS"
    exit 1
fi

echo -e "\n${BLUE}3. Testing Workplace Management...${NC}"

# Test create workplace
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/workplaces" "201" "Create Workplace" '{"name":"Test Office","address":"123 Test St","latitude":40.7128,"longitude":-74.0060,"radius":100,"description":"Test workplace"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Create Workplace" "PASS" "Workplace created successfully"
        
        # Extract workplace ID
        WORKPLACE_ID=$(cat /tmp/response.json | jq -r '.workplace.id' 2>/dev/null || echo "")
        if [ -n "$WORKPLACE_ID" ] && [ "$WORKPLACE_ID" != "null" ]; then
            print_test_result "Workplace ID Extraction" "PASS" "Workplace ID: $WORKPLACE_ID"
        else
            print_test_result "Workplace ID Extraction" "FAIL" "No workplace ID in response"
        fi
    fi
else
    print_test_result "Create Workplace" "FAIL" "No auth token available"
fi

# Test get workplaces
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/workplaces" "200" "Get Workplaces" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Workplaces" "PASS" "Workplaces retrieved successfully"
        
        # Check if workplaces are returned
        WORKPLACE_COUNT=$(cat /tmp/response.json | jq '.workplaces | length' 2>/dev/null || echo "0")
        if [ "$WORKPLACE_COUNT" -gt 0 ]; then
            print_test_result "Workplace List Content" "PASS" "$WORKPLACE_COUNT workplaces found"
        else
            print_test_result "Workplace List Content" "FAIL" "No workplaces in response"
        fi
    fi
fi

# Test get workplace by ID
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "GET" "/api/workplaces/$WORKPLACE_ID" "200" "Get Workplace by ID" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Workplace by ID" "PASS" "Workplace details retrieved"
    fi
fi

# Test update workplace
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "PUT" "/api/workplaces/$WORKPLACE_ID" "200" "Update Workplace" '{"name":"Updated Office","address":"456 Updated St","radius":150}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Workplace" "PASS" "Workplace updated successfully"
    fi
fi

echo -e "\n${BLUE}4. Testing Location Verification...${NC}"

# Test verify location
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "GET" "/api/attendance/verify-location?latitude=40.7128&longitude=-74.0060&workplaceId=$WORKPLACE_ID" "200" "Verify Location" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Verify Location" "PASS" "Location verification successful"
        
        # Check if verification is valid
        IS_VALID=$(cat /tmp/response.json | jq '.verification.isValid' 2>/dev/null || echo "false")
        if [ "$IS_VALID" = "true" ]; then
            print_test_result "Location Validation" "PASS" "Location is within workplace radius"
        else
            print_test_result "Location Validation" "FAIL" "Location is outside workplace radius"
        fi
    fi
fi

echo -e "\n${BLUE}5. Testing Attendance Punch In...${NC}"

# Test punch in
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "POST" "/api/attendance/punch-in" "201" "Punch In" "{\"workplaceId\":\"$WORKPLACE_ID\",\"latitude\":40.7128,\"longitude\":-74.0060,\"accuracy\":5,\"notes\":\"Test punch in\"}" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Punch In" "PASS" "Punch in successful"
        
        # Extract attendance ID
        ATTENDANCE_ID=$(cat /tmp/response.json | jq -r '.attendance.id' 2>/dev/null || echo "")
        if [ -n "$ATTENDANCE_ID" ] && [ "$ATTENDANCE_ID" != "null" ]; then
            print_test_result "Attendance ID Extraction" "PASS" "Attendance ID: $ATTENDANCE_ID"
        else
            print_test_result "Attendance ID Extraction" "FAIL" "No attendance ID in response"
        fi
    fi
else
    print_test_result "Punch In" "FAIL" "Missing auth token or workplace ID"
fi

# Test punch in without workplace (should fail)
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/attendance/punch-in" "400" "Punch In Without Workplace" '{"latitude":40.7128,"longitude":-74.0060}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Punch In Validation" "PASS" "Proper validation"
    fi
fi

# Test punch in without GPS (should fail)
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "POST" "/api/attendance/punch-in" "400" "Punch In Without GPS" "{\"workplaceId\":\"$WORKPLACE_ID\"}" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "GPS Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}6. Testing Current Attendance Status...${NC}"

# Test get current attendance
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/attendance/current" "200" "Get Current Attendance" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Current Attendance" "PASS" "Current attendance retrieved"
        
        # Check if user is punched in
        IS_PUNCHED_IN=$(cat /tmp/response.json | jq '.isPunchedIn' 2>/dev/null || echo "false")
        if [ "$IS_PUNCHED_IN" = "true" ]; then
            print_test_result "Punch In Status" "PASS" "User is currently punched in"
        else
            print_test_result "Punch In Status" "FAIL" "User is not punched in"
        fi
    fi
fi

echo -e "\n${BLUE}7. Testing Attendance Punch Out...${NC}"

# Test punch out
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/attendance/punch-out" "200" "Punch Out" '{"latitude":40.7128,"longitude":-74.0060,"accuracy":5,"notes":"Test punch out"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Punch Out" "PASS" "Punch out successful"
        
        # Check work duration
        WORK_DURATION=$(cat /tmp/response.json | jq '.attendance.workDurationMinutes' 2>/dev/null || echo "0")
        if [ "$WORK_DURATION" -gt 0 ]; then
            print_test_result "Work Duration" "PASS" "Work duration calculated: $WORK_DURATION minutes"
        else
            print_test_result "Work Duration" "FAIL" "Invalid work duration"
        fi
    fi
fi

# Test punch out without being punched in (should fail)
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/attendance/punch-out" "400" "Punch Out Without Punch In" '{"latitude":40.7128,"longitude":-74.0060}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Punch Out Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}8. Testing Attendance History...${NC}"

# Test get attendance history
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/attendance/history" "200" "Get Attendance History" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Attendance History" "PASS" "Attendance history retrieved"
        
        # Check if attendance records are returned
        ATTENDANCE_COUNT=$(cat /tmp/response.json | jq '.attendance | length' 2>/dev/null || echo "0")
        if [ "$ATTENDANCE_COUNT" -gt 0 ]; then
            print_test_result "Attendance History Content" "PASS" "$ATTENDANCE_COUNT attendance records found"
        else
            print_test_result "Attendance History Content" "FAIL" "No attendance records in response"
        fi
    fi
fi

# Test get attendance history with filters
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/attendance/history?page=1&limit=5&status=completed" "200" "Get Filtered History" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Filtered Attendance History" "PASS" "Filtered history retrieved"
    fi
fi

echo -e "\n${BLUE}9. Testing Attendance Statistics...${NC}"

# Test get attendance statistics
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/attendance/stats" "200" "Get Attendance Stats" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Attendance Statistics" "PASS" "Statistics retrieved"
        
        # Check if stats are returned
        TOTAL_DAYS=$(cat /tmp/response.json | jq '.totalDays' 2>/dev/null || echo "0")
        if [ "$TOTAL_DAYS" -ge 0 ]; then
            print_test_result "Attendance Statistics Content" "PASS" "Total days: $TOTAL_DAYS"
        else
            print_test_result "Attendance Statistics Content" "FAIL" "Invalid statistics data"
        fi
    fi
fi

echo -e "\n${BLUE}10. Testing Attendance Reports (Admin)...${NC}"

# Test get attendance reports (admin only)
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/attendance/reports" "200" "Get Attendance Reports" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Attendance Reports" "PASS" "Reports retrieved"
        
        # Check if reports are returned
        REPORTS_COUNT=$(cat /tmp/response.json | jq '.reports | length' 2>/dev/null || echo "0")
        if [ "$REPORTS_COUNT" -ge 0 ]; then
            print_test_result "Attendance Reports Content" "PASS" "$REPORTS_COUNT reports found"
        else
            print_test_result "Attendance Reports Content" "FAIL" "Invalid reports data"
        fi
    fi
fi

echo -e "\n${BLUE}11. Testing Photo Upload...${NC}"

# Create a test image file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png

# Test photo upload
if [ -n "$AUTH_TOKEN" ]; then
    PHOTO_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/photo_response.json \
        -X POST \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -F "photo=@/tmp/test_image.png" \
        "http://localhost:8080/api/attendance/photo-upload" 2>/dev/null)
    
    PHOTO_STATUS="${PHOTO_RESPONSE: -3}"
    
    if [ "$PHOTO_STATUS" = "200" ]; then
        print_test_result "Photo Upload" "PASS" "Photo uploaded successfully"
        
        # Extract photo URL
        PHOTO_URL=$(cat /tmp/photo_response.json | jq -r '.photoUrl' 2>/dev/null || echo "")
        if [ -n "$PHOTO_URL" ] && [ "$PHOTO_URL" != "null" ]; then
            print_test_result "Photo URL Extraction" "PASS" "Photo URL: $PHOTO_URL"
        else
            print_test_result "Photo URL Extraction" "FAIL" "No photo URL in response"
        fi
    else
        print_test_result "Photo Upload" "FAIL" "Status: $PHOTO_STATUS"
    fi
fi

echo -e "\n${BLUE}12. Testing Error Handling...${NC}"

# Test punch in without auth token
if test_api_endpoint "POST" "/api/attendance/punch-in" "401" "Unauthorized Punch In" '{"workplaceId":"1","latitude":40.7128,"longitude":-74.0060}'; then
    print_test_result "Unauthorized Access" "PASS" "Proper auth check"
fi

# Test get non-existent workplace
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/workplaces/999999" "404" "Get Non-existent Workplace" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "404 Error Handling" "PASS" "Proper 404 response"
    fi
fi

# Test create workplace without required fields
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/workplaces" "400" "Create Workplace Without Fields" '{"name":"Test"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Required Fields Validation" "PASS" "Proper validation"
    fi
fi

# Test create workplace with invalid coordinates
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/workplaces" "400" "Create Workplace Invalid Coords" '{"name":"Test","address":"Test","latitude":"invalid","longitude":"invalid"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Coordinate Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}13. Testing Pagination...${NC}"

# Test pagination
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/attendance/history?page=1&limit=5" "200" "Pagination Test" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Pagination" "PASS" "Pagination working"
        
        # Check pagination metadata
        PAGINATION_PAGE=$(cat /tmp/response.json | jq '.pagination.page' 2>/dev/null || echo "0")
        PAGINATION_LIMIT=$(cat /tmp/response.json | jq '.pagination.limit' 2>/dev/null || echo "0")
        
        if [ "$PAGINATION_PAGE" = "1" ] && [ "$PAGINATION_LIMIT" = "5" ]; then
            print_test_result "Pagination Metadata" "PASS" "Correct pagination data"
        else
            print_test_result "Pagination Metadata" "FAIL" "Incorrect pagination data"
        fi
    fi
fi

echo -e "\n${BLUE}14. Testing Workplace Management...${NC}"

# Test update workplace
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "PUT" "/api/workplaces/$WORKPLACE_ID" "200" "Update Workplace" '{"name":"Final Office","address":"789 Final St","radius":200}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Workplace" "PASS" "Workplace updated successfully"
    fi
fi

# Test delete workplace (should fail if has attendance records)
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKPLACE_ID" ]; then
    if test_api_endpoint "DELETE" "/api/workplaces/$WORKPLACE_ID" "400" "Delete Workplace With Records" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Delete Workplace Validation" "PASS" "Proper validation - cannot delete with records"
    fi
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Attendance System is Complete and Working!${NC}"
    echo -e "${GREEN}✅ All attendance endpoints functional${NC}"
    echo -e "${GREEN}✅ GPS-based tracking operational${NC}"
    echo -e "${GREEN}✅ Photo verification working${NC}"
    echo -e "${GREEN}✅ Workplace management functional${NC}"
    echo -e "${GREEN}✅ Location verification operational${NC}"
    echo -e "\n${BLUE}📋 Available Endpoints:${NC}"
    echo "  • POST /api/attendance/punch-in - Punch in with GPS and photo"
    echo "  • POST /api/attendance/punch-out - Punch out with GPS and photo"
    echo "  • GET /api/attendance/history - Get attendance history"
    echo "  • GET /api/attendance/current - Get current attendance status"
    echo "  • GET /api/attendance/reports - Get attendance reports (Admin)"
    echo "  • GET /api/attendance/stats - Get attendance statistics"
    echo "  • GET /api/workplaces - Get available workplaces"
    echo "  • GET /api/workplaces/:id - Get workplace details"
    echo "  • POST /api/workplaces - Create workplace (Admin)"
    echo "  • PUT /api/workplaces/:id - Update workplace (Admin)"
    echo "  • DELETE /api/workplaces/:id - Delete workplace (Admin)"
    echo "  • GET /api/attendance/verify-location - Verify location against workplace"
    echo "  • POST /api/attendance/photo-upload - Upload attendance photo"
    echo "  • GET /api/attendance/photo/:filename - Get attendance photo"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the logs and fix the issues.${NC}"
    echo -e "${YELLOW}Check Docker logs:${NC}"
    echo "docker logs digital_tracking_merchandising-api-gateway-1"
    echo "docker logs digital_tracking_merchandising-attendance-service-1"
    exit 1
fi 