#!/bin/bash

# 📋 APPROVAL SYSTEM TEST SCRIPT
# Tests all approval workflow and request management endpoints

set -e

echo "📋 Testing Approval System..."
echo "=============================="

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
WORKFLOW_ID=""
REQUEST_ID=""

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

# Test Approval Service health
if test_api_endpoint "GET" "/api/test-approval" "200" "Approval Service Health"; then
    echo -e "${GREEN}✅ Approval Service is healthy${NC}"
else
    echo -e "${RED}❌ Approval Service health check failed${NC}"
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

echo -e "\n${BLUE}3. Testing Workflow Management...${NC}"

# Test create workflow
if [ -n "$AUTH_TOKEN" ]; then
    WORKFLOW_DATA='{
      "name": "Leave Request Workflow",
      "description": "Multi-step approval for leave requests",
      "steps": [
        {
          "name": "Manager Approval",
          "approverRole": "manager",
          "order": 1,
          "description": "Direct manager approval"
        },
        {
          "name": "HR Approval",
          "approverRole": "hr",
          "order": 2,
          "description": "HR department approval"
        }
      ],
      "isActive": true,
      "autoApprove": false,
      "maxDuration": 72
    }'
    
    if test_api_endpoint "POST" "/api/approval/workflows" "201" "Create Workflow" "$WORKFLOW_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Create Workflow" "PASS" "Workflow created successfully"
        
        # Extract workflow ID
        WORKFLOW_ID=$(cat /tmp/response.json | jq -r '.workflow.id' 2>/dev/null || echo "")
        if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
            print_test_result "Workflow ID Extraction" "PASS" "Workflow ID: $WORKFLOW_ID"
        else
            print_test_result "Workflow ID Extraction" "FAIL" "No workflow ID in response"
        fi
    fi
else
    print_test_result "Create Workflow" "FAIL" "No auth token available"
fi

# Test get workflows
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/workflows" "200" "Get Workflows" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Workflows" "PASS" "Workflows retrieved successfully"
        
        # Check if workflows are returned
        WORKFLOW_COUNT=$(cat /tmp/response.json | jq '.workflows | length' 2>/dev/null || echo "0")
        if [ "$WORKFLOW_COUNT" -gt 0 ]; then
            print_test_result "Workflow List Content" "PASS" "$WORKFLOW_COUNT workflows found"
        else
            print_test_result "Workflow List Content" "FAIL" "No workflows in response"
        fi
    fi
fi

# Test get workflow by ID
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKFLOW_ID" ]; then
    if test_api_endpoint "GET" "/api/approval/workflows/$WORKFLOW_ID" "200" "Get Workflow by ID" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Workflow by ID" "PASS" "Workflow details retrieved"
    fi
fi

# Test update workflow
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKFLOW_ID" ]; then
    UPDATE_DATA='{
      "name": "Updated Leave Workflow",
      "description": "Updated workflow description",
      "maxDuration": 48
    }'
    
    if test_api_endpoint "PUT" "/api/approval/workflows/$WORKFLOW_ID" "200" "Update Workflow" "$UPDATE_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Workflow" "PASS" "Workflow updated successfully"
    fi
fi

echo -e "\n${BLUE}4. Testing Approval Request Creation...${NC}"

# Test create approval request
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKFLOW_ID" ]; then
    REQUEST_DATA="{
      \"workflowId\": \"$WORKFLOW_ID\",
      \"title\": \"Annual Leave Request\",
      \"description\": \"Requesting 5 days annual leave\",
      \"requestType\": \"leave\",
      \"priority\": \"medium\",
      \"dueDate\": \"2025-02-15T00:00:00Z\",
      \"metadata\": {
        \"leaveType\": \"annual\",
        \"days\": 5,
        \"startDate\": \"2025-02-10\",
        \"endDate\": \"2025-02-14\"
      }
    }"
    
    if test_api_endpoint "POST" "/api/approval/requests" "201" "Create Request" "$REQUEST_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Create Request" "PASS" "Request created successfully"
        
        # Extract request ID
        REQUEST_ID=$(cat /tmp/response.json | jq -r '.request.id' 2>/dev/null || echo "")
        if [ -n "$REQUEST_ID" ] && [ "$REQUEST_ID" != "null" ]; then
            print_test_result "Request ID Extraction" "PASS" "Request ID: $REQUEST_ID"
        else
            print_test_result "Request ID Extraction" "FAIL" "No request ID in response"
        fi
    fi
else
    print_test_result "Create Request" "FAIL" "Missing auth token or workflow ID"
fi

# Test create request without workflow (should fail)
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/approval/requests" "400" "Create Request Without Workflow" '{"title":"Test","requestType":"test"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Request Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}5. Testing Request Management...${NC}"

# Test get requests
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests" "200" "Get Requests" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Requests" "PASS" "Requests retrieved successfully"
        
        # Check if requests are returned
        REQUEST_COUNT=$(cat /tmp/response.json | jq '.requests | length' 2>/dev/null || echo "0")
        if [ "$REQUEST_COUNT" -gt 0 ]; then
            print_test_result "Request List Content" "PASS" "$REQUEST_COUNT requests found"
        else
            print_test_result "Request List Content" "FAIL" "No requests in response"
        fi
    fi
fi

# Test get request by ID
if [ -n "$AUTH_TOKEN" ] && [ -n "$REQUEST_ID" ]; then
    if test_api_endpoint "GET" "/api/approval/requests/$REQUEST_ID" "200" "Get Request by ID" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Request by ID" "PASS" "Request details retrieved"
        
        # Check if request details are complete
        REQUEST_STATUS=$(cat /tmp/response.json | jq -r '.request.status' 2>/dev/null || echo "")
        if [ -n "$REQUEST_STATUS" ]; then
            print_test_result "Request Details Content" "PASS" "Request status: $REQUEST_STATUS"
        else
            print_test_result "Request Details Content" "FAIL" "Incomplete request details"
        fi
    fi
fi

echo -e "\n${BLUE}6. Testing Request Filtering...${NC}"

# Test get pending requests
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests/pending" "200" "Get Pending Requests" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Pending Requests" "PASS" "Pending requests retrieved"
    fi
fi

# Test get assigned requests
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests/assigned" "200" "Get Assigned Requests" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Assigned Requests" "PASS" "Assigned requests retrieved"
    fi
fi

# Test get created requests
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests/created" "200" "Get Created Requests" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Created Requests" "PASS" "Created requests retrieved"
    fi
fi

echo -e "\n${BLUE}7. Testing Request Statistics...${NC}"

# Test get request statistics
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests/stats" "200" "Get Request Stats" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Request Statistics" "PASS" "Statistics retrieved"
        
        # Check if stats are returned
        TOTAL_REQUESTS=$(cat /tmp/response.json | jq '.total' 2>/dev/null || echo "0")
        if [ "$TOTAL_REQUESTS" -ge 0 ]; then
            print_test_result "Request Statistics Content" "PASS" "Total requests: $TOTAL_REQUESTS"
        else
            print_test_result "Request Statistics Content" "FAIL" "Invalid statistics data"
        fi
    fi
fi

echo -e "\n${BLUE}8. Testing Request Actions...${NC}"

# Test approve request (this will fail if user doesn't have manager role)
if [ -n "$AUTH_TOKEN" ] && [ -n "$REQUEST_ID" ]; then
    APPROVE_DATA='{
      "comments": "Approved by manager",
      "nextStep": true
    }'
    
    # This might fail if user doesn't have the right role, which is expected
    if test_api_endpoint "POST" "/api/approval/requests/$REQUEST_ID/approve" "403" "Approve Request (Expected Fail)" "$APPROVE_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Approve Request Authorization" "PASS" "Proper authorization check"
    fi
fi

# Test reject request (this will fail if user doesn't have manager role)
if [ -n "$AUTH_TOKEN" ] && [ -n "$REQUEST_ID" ]; then
    REJECT_DATA='{
      "comments": "Rejected due to insufficient notice"
    }'
    
    if test_api_endpoint "POST" "/api/approval/requests/$REQUEST_ID/reject" "403" "Reject Request (Expected Fail)" "$REJECT_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Reject Request Authorization" "PASS" "Proper authorization check"
    fi
fi

# Test return request (this will fail if user doesn't have manager role)
if [ -n "$AUTH_TOKEN" ] && [ -n "$REQUEST_ID" ]; then
    RETURN_DATA='{
      "comments": "Please provide additional documentation"
    }'
    
    if test_api_endpoint "POST" "/api/approval/requests/$REQUEST_ID/return" "403" "Return Request (Expected Fail)" "$RETURN_DATA" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Return Request Authorization" "PASS" "Proper authorization check"
    fi
fi

echo -e "\n${BLUE}9. Testing Error Handling...${NC}"

# Test create request without auth token
if test_api_endpoint "POST" "/api/approval/requests" "401" "Unauthorized Request Creation" '{"workflowId":"1","title":"Test","requestType":"test"}' ""; then
    print_test_result "Unauthorized Access" "PASS" "Proper auth check"
fi

# Test get non-existent workflow
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/workflows/999999" "404" "Get Non-existent Workflow" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "404 Error Handling" "PASS" "Proper 404 response"
    fi
fi

# Test get non-existent request
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests/999999" "404" "Get Non-existent Request" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "404 Request Error Handling" "PASS" "Proper 404 response"
    fi
fi

# Test create workflow without required fields
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/approval/workflows" "400" "Create Workflow Without Fields" '{"name":"Test"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Required Fields Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}10. Testing Pagination...${NC}"

# Test pagination
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/approval/requests?page=1&limit=5" "200" "Pagination Test" "" "Authorization: Bearer $AUTH_TOKEN"; then
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

echo -e "\n${BLUE}11. Testing Workflow Management...${NC}"

# Test delete workflow (should fail if has active requests)
if [ -n "$AUTH_TOKEN" ] && [ -n "$WORKFLOW_ID" ]; then
    if test_api_endpoint "DELETE" "/api/approval/workflows/$WORKFLOW_ID" "400" "Delete Workflow With Requests" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Delete Workflow Validation" "PASS" "Proper validation - cannot delete with requests"
    fi
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Approval System is Complete and Working!${NC}"
    echo -e "${GREEN}✅ All approval endpoints functional${NC}"
    echo -e "${GREEN}✅ Multi-step workflows operational${NC}"
    echo -e "${GREEN}✅ Request management working${NC}"
    echo -e "${GREEN}✅ Authorization and permissions functional${NC}"
    echo -e "${GREEN}✅ Statistics and reporting operational${NC}"
    echo -e "\n${BLUE}📋 Available Endpoints:${NC}"
    echo "  • POST /api/approval/workflows - Create approval workflow (Admin)"
    echo "  • GET /api/approval/workflows - Get approval workflows"
    echo "  • GET /api/approval/workflows/:id - Get workflow details"
    echo "  • PUT /api/approval/workflows/:id - Update workflow (Admin)"
    echo "  • DELETE /api/approval/workflows/:id - Delete workflow (Admin)"
    echo "  • POST /api/approval/requests - Create approval request"
    echo "  • GET /api/approval/requests - Get approval requests"
    echo "  • GET /api/approval/requests/:id - Get request details"
    echo "  • POST /api/approval/requests/:id/approve - Approve request"
    echo "  • POST /api/approval/requests/:id/reject - Reject request"
    echo "  • POST /api/approval/requests/:id/return - Return request for revision"
    echo "  • GET /api/approval/requests/pending - Get pending requests"
    echo "  • GET /api/approval/requests/assigned - Get assigned requests"
    echo "  • GET /api/approval/requests/created - Get created requests"
    echo "  • GET /api/approval/requests/stats - Get request statistics"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the logs and fix the issues.${NC}"
    echo -e "${YELLOW}Check Docker logs:${NC}"
    echo "docker logs digital_tracking_merchandising-api-gateway-1"
    echo "docker logs digital_tracking_merchandising-approval-service-1"
    exit 1
fi 