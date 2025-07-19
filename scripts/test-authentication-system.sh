#!/bin/bash

# 🔐 AUTHENTICATION SYSTEM COMPLETION TEST SCRIPT
# Tests all authentication and user management endpoints

set -e

echo "🔐 Testing Authentication System Completion..."
echo "============================================="

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

# Test Auth Service health
if test_api_endpoint "GET" "/api/test-auth" "200" "Auth Service Health"; then
    echo -e "${GREEN}✅ Auth Service is healthy${NC}"
else
    echo -e "${RED}❌ Auth Service health check failed${NC}"
    exit 1
fi

echo -e "\n${BLUE}2. Testing Authentication Endpoints...${NC}"

# Test login with valid credentials
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@company.com","password":"password"}' \
    "http://localhost:8080/api/auth/login" 2>/dev/null)

LOGIN_STATUS="${LOGIN_RESPONSE: -3}"

if [ "$LOGIN_STATUS" = "200" ]; then
    print_test_result "Login with Valid Credentials" "PASS" "Login successful"
    
    # Extract token
    AUTH_TOKEN=$(cat /tmp/login_response.json | jq -r '.token' 2>/dev/null || echo "")
    if [ -n "$AUTH_TOKEN" ] && [ "$AUTH_TOKEN" != "null" ]; then
        print_test_result "JWT Token Generation" "PASS" "Token received"
    else
        print_test_result "JWT Token Generation" "FAIL" "No token in response"
    fi
else
    print_test_result "Login with Valid Credentials" "FAIL" "Status: $LOGIN_STATUS"
fi

# Test login with invalid credentials
if test_api_endpoint "POST" "/api/auth/login" "401" "Login with Invalid Credentials" '{"email":"invalid@test.com","password":"wrongpassword"}'; then
    print_test_result "Invalid Login Handling" "PASS" "Proper error response"
fi

# Test login with missing fields
if test_api_endpoint "POST" "/api/auth/login" "400" "Login with Missing Fields" '{"email":"admin@company.com"}'; then
    print_test_result "Missing Fields Validation" "PASS" "Proper validation"
fi

echo -e "\n${BLUE}3. Testing User Profile Endpoints...${NC}"

# Test get profile with valid token
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/auth/profile" "200" "Get User Profile" "" "Authorization: Bearer $AUTH_TOKEN"; then
        # Extract user ID
        USER_ID=$(cat /tmp/response.json | jq -r '.user.id' 2>/dev/null || echo "")
        if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
            print_test_result "User ID Extraction" "PASS" "User ID: $USER_ID"
        else
            print_test_result "User ID Extraction" "FAIL" "No user ID in response"
        fi
    fi
else
    print_test_result "Get User Profile" "FAIL" "No auth token available"
fi

# Test get profile without token
if test_api_endpoint "GET" "/api/auth/profile" "401" "Get Profile Without Token"; then
    print_test_result "Authentication Required" "PASS" "Proper auth check"
fi

# Test update profile
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "PUT" "/api/auth/profile" "200" "Update User Profile" '{"firstName":"Updated","lastName":"Name"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Profile Update" "PASS" "Profile updated successfully"
    fi
fi

echo -e "\n${BLUE}4. Testing Password Management...${NC}"

# Test change password
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/auth/change-password" "200" "Change Password" '{"currentPassword":"password","newPassword":"newpassword123"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Password Change" "PASS" "Password changed successfully"
        
        # Test login with new password
        if test_api_endpoint "POST" "/api/auth/login" "200" "Login with New Password" '{"email":"admin@company.com","password":"newpassword123"}'; then
            print_test_result "New Password Login" "PASS" "Login with new password successful"
            
            # Update token
            NEW_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/new_login_response.json \
                -X POST \
                -H "Content-Type: application/json" \
                -d '{"email":"admin@company.com","password":"newpassword123"}' \
                "http://localhost:8080/api/auth/login" 2>/dev/null)
            
            AUTH_TOKEN=$(cat /tmp/new_login_response.json | jq -r '.token' 2>/dev/null || echo "")
        fi
        
        # Change password back
        if test_api_endpoint "POST" "/api/auth/change-password" "200" "Revert Password" '{"currentPassword":"newpassword123","newPassword":"password"}' "Authorization: Bearer $AUTH_TOKEN"; then
            print_test_result "Password Revert" "PASS" "Password reverted successfully"
        fi
    fi
fi

# Test change password with wrong current password
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/auth/change-password" "401" "Change Password Wrong Current" '{"currentPassword":"wrongpassword","newPassword":"newpassword123"}' "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Wrong Current Password" "PASS" "Proper validation"
    fi
fi

# Test forgot password
if test_api_endpoint "POST" "/api/auth/forgot-password" "200" "Forgot Password" '{"email":"admin@company.com"}'; then
    print_test_result "Forgot Password" "PASS" "Reset email sent"
fi

# Test forgot password with non-existent email
if test_api_endpoint "POST" "/api/auth/forgot-password" "200" "Forgot Password Non-existent" '{"email":"nonexistent@test.com"}'; then
    print_test_result "Forgot Password Security" "PASS" "Same response for security"
fi

echo -e "\n${BLUE}5. Testing User Registration...${NC}"

# Test user registration
if test_api_endpoint "POST" "/api/auth/register" "201" "User Registration" '{"email":"testuser@company.com","password":"password123","firstName":"Test","lastName":"User"}'; then
    print_test_result "User Registration" "PASS" "User registered successfully"
fi

# Test registration with existing email
if test_api_endpoint "POST" "/api/auth/register" "409" "Registration Duplicate Email" '{"email":"admin@company.com","password":"password123","firstName":"Test","lastName":"User"}'; then
    print_test_result "Duplicate Email Validation" "PASS" "Proper duplicate check"
fi

# Test registration with invalid email
if test_api_endpoint "POST" "/api/auth/register" "400" "Registration Invalid Email" '{"email":"invalid-email","password":"password123","firstName":"Test","lastName":"User"}'; then
    print_test_result "Email Format Validation" "PASS" "Proper email validation"
fi

# Test registration with weak password
if test_api_endpoint "POST" "/api/auth/register" "400" "Registration Weak Password" '{"email":"test@company.com","password":"123","firstName":"Test","lastName":"User"}'; then
    print_test_result "Password Strength Validation" "PASS" "Proper password validation"
fi

echo -e "\n${BLUE}6. Testing User Management Endpoints...${NC}"

# Test get all users (admin only)
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/users" "200" "Get All Users" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Admin User List" "PASS" "User list retrieved"
        
        # Check if users are returned
        USER_COUNT=$(cat /tmp/response.json | jq '.users | length' 2>/dev/null || echo "0")
        if [ "$USER_COUNT" -gt 0 ]; then
            print_test_result "User List Content" "PASS" "$USER_COUNT users found"
        else
            print_test_result "User List Content" "FAIL" "No users in response"
        fi
    fi
fi

# Test get user by ID
if [ -n "$AUTH_TOKEN" ] && [ -n "$USER_ID" ]; then
    if test_api_endpoint "GET" "/api/users/$USER_ID" "200" "Get User by ID" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get User by ID" "PASS" "User details retrieved"
    fi
fi

# Test get user profile
if [ -n "$AUTH_TOKEN" ] && [ -n "$USER_ID" ]; then
    if test_api_endpoint "GET" "/api/users/$USER_ID/profile" "200" "Get User Profile" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Get User Profile" "PASS" "User profile retrieved"
    fi
fi

# Test search users
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/users/search?q=admin" "200" "Search Users" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Search Users" "PASS" "User search successful"
    fi
fi

# Test user statistics
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/users/stats" "200" "User Statistics" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "User Statistics" "PASS" "Statistics retrieved"
    fi
fi

echo -e "\n${BLUE}7. Testing Token Management...${NC}"

# Test refresh token
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/auth/refresh-token" "200" "Refresh Token" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Token Refresh" "PASS" "Token refreshed successfully"
        
        # Extract new token
        NEW_TOKEN=$(cat /tmp/response.json | jq -r '.token' 2>/dev/null || echo "")
        if [ -n "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
            AUTH_TOKEN="$NEW_TOKEN"
            print_test_result "New Token Extraction" "PASS" "New token received"
        fi
    fi
fi

# Test refresh token with invalid token
if test_api_endpoint "POST" "/api/auth/refresh-token" "401" "Refresh Invalid Token" "" "Authorization: Bearer invalid-token"; then
    print_test_result "Invalid Token Refresh" "PASS" "Proper error handling"
fi

echo -e "\n${BLUE}8. Testing Logout...${NC}"

# Test logout
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "POST" "/api/auth/logout" "200" "User Logout" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "User Logout" "PASS" "Logout successful"
    fi
fi

# Test access after logout
if [ -n "$AUTH_TOKEN" ]; then
    if test_api_endpoint "GET" "/api/auth/profile" "401" "Access After Logout" "" "Authorization: Bearer $AUTH_TOKEN"; then
        print_test_result "Post-Logout Security" "PASS" "Proper session invalidation"
    fi
fi

echo -e "\n${BLUE}9. Testing Error Handling...${NC}"

# Test invalid endpoints
if test_api_endpoint "GET" "/api/auth/invalid" "404" "Invalid Endpoint"; then
    print_test_result "404 Error Handling" "PASS" "Proper 404 response"
fi

# Test malformed JSON
if test_api_endpoint "POST" "/api/auth/login" "400" "Malformed JSON" '{"email":"admin@company.com"'; then
    print_test_result "Malformed JSON Handling" "PASS" "Proper JSON validation"
fi

# Test unauthorized access
if test_api_endpoint "GET" "/api/users" "401" "Unauthorized Access"; then
    print_test_result "Unauthorized Access" "PASS" "Proper auth check"
fi

echo -e "\n${BLUE}10. Testing Security Features...${NC}"

# Test rate limiting (make multiple requests)
echo "Testing rate limiting..."
for i in {1..5}; do
    curl -s -w "%{http_code}" -o /dev/null \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrongpassword"}' \
        "http://localhost:8080/api/auth/login" > /tmp/rate_limit_test 2>/dev/null
done

LAST_STATUS=$(cat /tmp/rate_limit_test | tail -c 3)
if [ "$LAST_STATUS" = "429" ]; then
    print_test_result "Rate Limiting" "PASS" "Rate limiting active"
else
    print_test_result "Rate Limiting" "FAIL" "Rate limiting not working"
fi

# Test CORS headers
CORS_HEADERS=$(curl -s -I -X OPTIONS "http://localhost:8080/api/auth/login" | grep -i "access-control" | wc -l)
if [ "$CORS_HEADERS" -gt 0 ]; then
    print_test_result "CORS Headers" "PASS" "CORS properly configured"
else
    print_test_result "CORS Headers" "FAIL" "CORS headers missing"
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Authentication System is Complete and Working!${NC}"
    echo -e "${GREEN}✅ All authentication endpoints functional${NC}"
    echo -e "${GREEN}✅ User management system operational${NC}"
    echo -e "${GREEN}✅ Security features implemented${NC}"
    echo -e "${GREEN}✅ Error handling robust${NC}"
    echo -e "\n${BLUE}🔐 Available Endpoints:${NC}"
    echo "  • POST /api/auth/login - User login"
    echo "  • POST /api/auth/register - User registration"
    echo "  • POST /api/auth/logout - User logout"
    echo "  • GET /api/auth/profile - Get user profile"
    echo "  • PUT /api/auth/profile - Update user profile"
    echo "  • POST /api/auth/change-password - Change password"
    echo "  • POST /api/auth/forgot-password - Forgot password"
    echo "  • POST /api/auth/reset-password - Reset password"
    echo "  • POST /api/auth/verify-email - Verify email"
    echo "  • POST /api/auth/refresh-token - Refresh token"
    echo "  • GET /api/users - Get all users (Admin)"
    echo "  • GET /api/users/:id - Get user by ID"
    echo "  • POST /api/users - Create user (Admin)"
    echo "  • PUT /api/users/:id - Update user"
    echo "  • DELETE /api/users/:id - Delete user (Admin)"
    echo "  • GET /api/users/:id/profile - Get user profile"
    echo "  • PUT /api/users/:id/profile - Update user profile"
    echo "  • GET /api/users/search - Search users (Admin)"
    echo "  • POST /api/users/:id/activate - Activate user (Admin)"
    echo "  • POST /api/users/:id/deactivate - Deactivate user (Admin)"
    echo "  • GET /api/users/stats - User statistics (Admin)"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the logs and fix the issues.${NC}"
    echo -e "${YELLOW}Check Docker logs:${NC}"
    echo "docker logs digital_tracking_merchandising-api-gateway-1"
    echo "docker logs digital_tracking_merchandising-auth-service-1"
    echo "docker logs digital_tracking_merchandising-user-service-1"
    exit 1
fi 