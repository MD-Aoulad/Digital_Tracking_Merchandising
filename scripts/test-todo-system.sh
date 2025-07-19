#!/bin/bash

# 📋 TODO MANAGEMENT SYSTEM TEST SCRIPT
# Tests all todo management and assignment endpoints

set -e

echo "📋 Testing Todo Management System..."
echo "==================================="

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
TODO_ID=""
USER_ID=""

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

# Test Todo Service health
if test_api_endpoint "GET" "/api/test-todo" "200" "Todo Service Health"; then
    echo -e "${GREEN}✅ Todo Service is healthy${NC}"
else
    echo -e "${RED}❌ Todo Service health check failed${NC}"
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

echo -e "\n${BLUE}3. Testing Todo CRUD Operations...${NC}"

# Test create todo
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/todos" "201" "Create Todo" '{"title":"Test Todo","description":"Test description","priority":"high","category":"testing"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Todo Creation" "PASS" "Todo created successfully"
        
        # Extract todo ID
        TODO_ID=$(cat /tmp/response.json | jq -r '.todo.id' 2>/dev/null || echo "")
        if [ -n "$TODO_ID" ] && [ "$TODO_ID" != "null" ]; then
            print_test_result "Todo ID Extraction" "PASS" "Todo ID: $TODO_ID"
        else
            print_test_result "Todo ID Extraction" "FAIL" "No todo ID in response"
        fi
    fi
else
    print_test_result "Create Todo" "FAIL" "No auth token available"
fi

# Test get todos
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos" "200" "Get User Todos" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Todos" "PASS" "Todos retrieved successfully"
        
        # Check if todos are returned
        TODO_COUNT=$(cat /tmp/response.json | jq '.todos | length' 2>/dev/null || echo "0")
        if [ "$TODO_COUNT" -gt 0 ]; then
            print_test_result "Todo List Content" "PASS" "$TODO_COUNT todos found"
        else
            print_test_result "Todo List Content" "FAIL" "No todos in response"
        fi
    fi
fi

# Test get todo by ID
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "GET" "/api/todos/$TODO_ID" "200" "Get Todo by ID" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Todo by ID" "PASS" "Todo details retrieved"
    fi
fi

# Test update todo
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "PUT" "/api/todos/$TODO_ID" "200" "Update Todo" '{"title":"Updated Todo","description":"Updated description","priority":"medium"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Todo" "PASS" "Todo updated successfully"
    fi
fi

echo -e "\n${BLUE}4. Testing Todo Assignment...${NC}"

# Test assign todo to user
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ] && [ -n "$USER_ID" ]; then
    if test_api_endpoint "POST" "/api/todos/$TODO_ID/assign" "200" "Assign Todo" "{\"assignedTo\":\"$USER_ID\"}" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Assign Todo" "PASS" "Todo assigned successfully"
    fi
fi

# Test get assigned todos
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos/assigned" "200" "Get Assigned Todos" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Assigned Todos" "PASS" "Assigned todos retrieved"
    fi
fi

# Test get created todos
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos/created" "200" "Get Created Todos" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Created Todos" "PASS" "Created todos retrieved"
    fi
fi

echo -e "\n${BLUE}5. Testing Todo Status Management...${NC}"

# Test mark todo as complete
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "POST" "/api/todos/$TODO_ID/complete" "200" "Complete Todo" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Complete Todo" "PASS" "Todo marked as complete"
    fi
fi

# Test reopen completed todo
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "POST" "/api/todos/$TODO_ID/reopen" "200" "Reopen Todo" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Reopen Todo" "PASS" "Todo reopened successfully"
    fi
fi

# Test update todo status directly
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "PUT" "/api/todos/$TODO_ID" "200" "Update Todo Status" '{"status":"in_progress"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Todo Status" "PASS" "Todo status updated"
    fi
fi

echo -e "\n${BLUE}6. Testing Todo Search and Filtering...${NC}"

# Test search todos
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos/search?q=test" "200" "Search Todos" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Search Todos" "PASS" "Todo search successful"
    fi
fi

# Test get todos with filters
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos?priority=high&status=pending" "200" "Filter Todos" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Filter Todos" "PASS" "Todo filtering successful"
    fi
fi

# Test get todo categories
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos/categories" "200" "Get Categories" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Categories" "PASS" "Categories retrieved"
    fi
fi

echo -e "\n${BLUE}7. Testing Todo Statistics...${NC}"

# Test get todo statistics
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos/stats" "200" "Get Todo Stats" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get Todo Statistics" "PASS" "Statistics retrieved"
        
        # Check if stats are returned
        TOTAL_TODOS=$(cat /tmp/response.json | jq '.total' 2>/dev/null || echo "0")
        if [ "$TOTAL_TODOS" -ge 0 ]; then
            print_test_result "Todo Statistics Content" "PASS" "Total todos: $TOTAL_TODOS"
        else
            print_test_result "Todo Statistics Content" "FAIL" "Invalid statistics data"
        fi
    fi
fi

echo -e "\n${BLUE}8. Testing Bulk Operations...${NC}"

# Test bulk assign todos (admin only)
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ] && [ -n "$USER_ID" ]; then
    if test_api_endpoint "POST" "/api/todos/bulk-assign" "200" "Bulk Assign Todos" "{\"todoIds\":[\"$TODO_ID\"],\"assignedTo\":\"$USER_ID\"}" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Bulk Assign Todos" "PASS" "Bulk assignment successful"
    fi
fi

echo -e "\n${BLUE}9. Testing Error Handling...${NC}"

# Test create todo without title
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/todos" "400" "Create Todo Without Title" '{"description":"Test description"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Title Validation" "PASS" "Proper validation"
    fi
fi

# Test create todo with invalid priority
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/todos" "400" "Create Todo Invalid Priority" '{"title":"Test","priority":"invalid"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Priority Validation" "PASS" "Proper validation"
    fi
fi

# Test get non-existent todo
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos/999999" "404" "Get Non-existent Todo" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "404 Error Handling" "PASS" "Proper 404 response"
    fi
fi

# Test update todo without permissions
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "PUT" "/api/todos/999999" "404" "Update Non-existent Todo" '{"title":"Updated"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Update Permission Check" "PASS" "Proper permission handling"
    fi
fi

# Test unauthorized access
if test_api_endpoint "GET" "/api/todos" "401" "Unauthorized Access"; then
    print_test_result "Unauthorized Access" "PASS" "Proper auth check"
fi

echo -e "\n${BLUE}10. Testing Pagination...${NC}"

# Test pagination
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/todos?page=1&limit=5" "200" "Pagination Test" "" "Authorization: Bearer $AUTH_TOKEN"; then
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

echo -e "\n${BLUE}11. Testing Todo Completion...${NC}"

# Test mark todo as complete again
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "POST" "/api/todos/$TODO_ID/complete" "200" "Complete Todo Again" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Complete Todo Again" "PASS" "Todo completed successfully"
    fi
fi

# Test complete already completed todo
if [ -n "$AUTH_TOKEN" ] && [ -n "$TODO_ID" ]; then
    if test_api_endpoint "POST" "/api/todos/$TODO_ID/complete" "400" "Complete Already Completed Todo" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Already Completed Validation" "PASS" "Proper validation"
    fi
fi

echo -e "\n${BLUE}12. Testing Todo Deletion...${NC}"

# Create a todo for deletion test
if [ -n "$AUTH_TOKEN" ]; then
    DELETE_TODO_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/delete_todo_response.json \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{"title":"Todo for Deletion","description":"This todo will be deleted"}' \
        "http://localhost:8080/api/todos" 2>/dev/null)
    
    DELETE_TODO_STATUS="${DELETE_TODO_RESPONSE: -3}"
    
    if [ "$DELETE_TODO_STATUS" = "201" ]; then
        DELETE_TODO_ID=$(cat /tmp/delete_todo_response.json | jq -r '.todo.id' 2>/dev/null || echo "")
        
        if [ -n "$DELETE_TODO_ID" ] && [ "$DELETE_TODO_ID" != "null" ]; then
            # Test delete todo
            if test_api_endpoint "DELETE" "/api/todos/$DELETE_TODO_ID" "200" "Delete Todo" "" "Authorization: Bearer $AUTH_TOKEN"; then
                print_test_result "Delete Todo" "PASS" "Todo deleted successfully"
            fi
            
            # Test get deleted todo
            if test_api_endpoint "GET" "/api/todos/$DELETE_TODO_ID" "404" "Get Deleted Todo" "" "Authorization: Bearer $AUTH_TOKEN"; then
                print_test_result "Get Deleted Todo" "PASS" "Proper 404 response"
            fi
        fi
    fi
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Todo Management System is Complete and Working!${NC}"
    echo -e "${GREEN}✅ All todo endpoints functional${NC}"
    echo -e "${GREEN}✅ Assignment system operational${NC}"
    echo -e "${GREEN}✅ Status management working${NC}"
    echo -e "${GREEN}✅ Search and filtering operational${NC}"
    echo -e "${GREEN}✅ Statistics and reporting functional${NC}"
    echo -e "\n${BLUE}📋 Available Endpoints:${NC}"
    echo "  • GET /api/todos - Get user todos"
    echo "  • GET /api/todos/:id - Get todo by ID"
    echo "  • POST /api/todos - Create new todo"
    echo "  • PUT /api/todos/:id - Update todo"
    echo "  • DELETE /api/todos/:id - Delete todo"
    echo "  • GET /api/todos/assigned - Get assigned todos"
    echo "  • GET /api/todos/created - Get created todos"
    echo "  • POST /api/todos/:id/assign - Assign todo to user (Admin)"
    echo "  • POST /api/todos/:id/complete - Mark todo as complete"
    echo "  • POST /api/todos/:id/reopen - Reopen completed todo"
    echo "  • GET /api/todos/search - Search todos"
    echo "  • GET /api/todos/stats - Todo statistics"
    echo "  • GET /api/todos/categories - Get todo categories"
    echo "  • POST /api/todos/bulk-assign - Bulk assign todos (Admin)"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the logs and fix the issues.${NC}"
    echo -e "${YELLOW}Check Docker logs:${NC}"
    echo "docker logs digital_tracking_merchandising-api-gateway-1"
    echo "docker logs digital_tracking_merchandising-todo-service-1"
    exit 1
fi 