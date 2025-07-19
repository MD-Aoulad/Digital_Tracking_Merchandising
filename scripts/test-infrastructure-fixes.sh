#!/bin/bash

# 🚨 CRITICAL INFRASTRUCTURE FIXES TEST SCRIPT
# Tests Redis connection and API Gateway service restoration

set -e

echo "🔧 Testing Critical Infrastructure Fixes..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

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

# Function to check if service is running
check_service() {
    local service_name="$1"
    local port="$2"
    
    if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local test_name="$3"
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/response.json "http://localhost:8080$endpoint" 2>/dev/null)
    local status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_test_result "$test_name" "PASS" "Status: $status_code"
        return 0
    else
        print_test_result "$test_name" "FAIL" "Expected: $expected_status, Got: $status_code"
        return 1
    fi
}

echo -e "${BLUE}1. Testing Docker Services Status...${NC}"

# Check if Docker containers are running
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "api-gateway"; then
    print_test_result "Docker API Gateway" "PASS" "Container is running"
else
    print_test_result "Docker API Gateway" "FAIL" "Container is not running"
fi

if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "redis"; then
    print_test_result "Docker Redis" "PASS" "Container is running"
else
    print_test_result "Docker Redis" "FAIL" "Container is not running"
fi

if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "auth-service"; then
    print_test_result "Docker Auth Service" "PASS" "Container is running"
else
    print_test_result "Docker Auth Service" "FAIL" "Container is not running"
fi

echo -e "\n${BLUE}2. Testing API Gateway Health...${NC}"

# Wait for API Gateway to be ready
echo "Waiting for API Gateway to be ready..."
for i in {1..30}; do
    if check_service "API Gateway" "8080"; then
        print_test_result "API Gateway Health" "PASS" "Service is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        print_test_result "API Gateway Health" "FAIL" "Service not responding after 30 seconds"
        exit 1
    fi
    sleep 1
done

echo -e "\n${BLUE}3. Testing Redis Connection...${NC}"

# Test Redis connection through API Gateway
if test_api_endpoint "/api/test-redis" "200" "Redis Connection Test"; then
    # Check Redis status in response
    if jq -e '.status == "connected"' /tmp/response.json > /dev/null 2>&1; then
        print_test_result "Redis Status" "PASS" "Redis is connected"
    else
        print_test_result "Redis Status" "FAIL" "Redis is not connected"
    fi
fi

echo -e "\n${BLUE}4. Testing Service Discovery...${NC}"

# Test service discovery endpoint
if test_api_endpoint "/api/service-discovery" "200" "Service Discovery"; then
    # Check if all services are registered
    local service_count=$(jq '.services | length' /tmp/response.json 2>/dev/null || echo "0")
    if [ "$service_count" -ge 9 ]; then
        print_test_result "Service Registry" "PASS" "All 9 services registered"
    else
        print_test_result "Service Registry" "FAIL" "Only $service_count services registered"
    fi
fi

echo -e "\n${BLUE}5. Testing Auth Service Connectivity...${NC}"

# Test auth service connectivity
if test_api_endpoint "/api/test-auth" "200" "Auth Service Connectivity"; then
    print_test_result "Auth Service" "PASS" "Service is reachable"
else
    print_test_result "Auth Service" "FAIL" "Service is not reachable"
fi

# Test auth service database connectivity
if test_api_endpoint "/api/test-auth-db" "200" "Auth Service Database"; then
    print_test_result "Auth Database" "PASS" "Database is connected"
else
    print_test_result "Auth Database" "FAIL" "Database is not connected"
fi

echo -e "\n${BLUE}6. Testing Login Endpoint...${NC}"

# Test login endpoint with proper request
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@company.com","password":"password"}' \
    "http://localhost:8080/api/auth/login" 2>/dev/null)

LOGIN_STATUS="${LOGIN_RESPONSE: -3}"

if [ "$LOGIN_STATUS" = "200" ]; then
    print_test_result "Login Endpoint" "PASS" "Login successful"
    
    # Check if response contains token
    if jq -e '.token' /tmp/login_response.json > /dev/null 2>&1; then
        print_test_result "Login Token" "PASS" "JWT token received"
    else
        print_test_result "Login Token" "FAIL" "No JWT token in response"
    fi
else
    print_test_result "Login Endpoint" "FAIL" "Status: $LOGIN_STATUS"
    
    # Show error details
    if [ -f /tmp/login_response.json ]; then
        echo -e "${YELLOW}Error details:${NC}"
        cat /tmp/login_response.json | jq '.' 2>/dev/null || cat /tmp/login_response.json
    fi
fi

echo -e "\n${BLUE}7. Testing Error Handling...${NC}"

# Test with invalid credentials
INVALID_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/invalid_login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@test.com","password":"wrongpassword"}' \
    "http://localhost:8080/api/auth/login" 2>/dev/null)

INVALID_LOGIN_STATUS="${INVALID_LOGIN_RESPONSE: -3}"

if [ "$INVALID_LOGIN_STATUS" = "401" ]; then
    print_test_result "Invalid Login" "PASS" "Proper error handling"
else
    print_test_result "Invalid Login" "FAIL" "Expected 401, got $INVALID_LOGIN_STATUS"
fi

echo -e "\n${BLUE}8. Testing Circuit Breaker...${NC}"

# Test circuit breaker by checking service health
if test_api_endpoint "/health" "200" "Circuit Breaker Health Check"; then
    # Check if circuit breaker is enabled
    if jq -e '.config.circuitBreaker == "enabled"' /tmp/response.json > /dev/null 2>&1; then
        print_test_result "Circuit Breaker" "PASS" "Circuit breaker is enabled"
    else
        print_test_result "Circuit Breaker" "FAIL" "Circuit breaker is not enabled"
    fi
fi

echo -e "\n${BLUE}9. Testing Request Timeout Handling...${NC}"

# Test timeout handling with a long request
TIMEOUT_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/timeout_response.json \
    --max-time 5 \
    "http://localhost:8080/api/auth/login" 2>/dev/null || echo "000")

TIMEOUT_STATUS="${TIMEOUT_RESPONSE: -3}"

if [ "$TIMEOUT_STATUS" = "000" ] || [ "$TIMEOUT_STATUS" = "504" ]; then
    print_test_result "Timeout Handling" "PASS" "Proper timeout handling"
else
    print_test_result "Timeout Handling" "FAIL" "Unexpected timeout behavior"
fi

echo -e "\n${BLUE}10. Testing Redis Recovery...${NC}"

# Test Redis recovery by restarting Redis container
echo "Testing Redis recovery..."
docker restart redis > /dev/null 2>&1

# Wait for Redis to restart
sleep 5

# Test Redis connection again
if test_api_endpoint "/api/test-redis" "200" "Redis Recovery Test"; then
    if jq -e '.status == "connected"' /tmp/response.json > /dev/null 2>&1; then
        print_test_result "Redis Recovery" "PASS" "Redis recovered successfully"
    else
        print_test_result "Redis Recovery" "FAIL" "Redis did not recover"
    fi
else
    print_test_result "Redis Recovery" "FAIL" "Redis recovery test failed"
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All Critical Infrastructure Fixes are working!${NC}"
    echo -e "${GREEN}✅ Redis connection issues resolved${NC}"
    echo -e "${GREEN}✅ API Gateway service restoration complete${NC}"
    echo -e "${GREEN}✅ Service discovery is functional${NC}"
    echo -e "${GREEN}✅ Error handling is robust${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the logs and fix the issues.${NC}"
    echo -e "${YELLOW}Check Docker logs:${NC}"
    echo "docker logs digital_tracking_merchandising-api-gateway-1"
    echo "docker logs digital_tracking_merchandising-redis-1"
    echo "docker logs digital_tracking_merchandising-auth-service-1"
    exit 1
fi 