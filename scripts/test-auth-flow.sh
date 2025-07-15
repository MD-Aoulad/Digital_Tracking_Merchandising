#!/bin/bash

# Authentication Flow Testing Script
# Tests the complete login/logout cycle to ensure proper user flow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"
LOG_FILE="auth-flow-test.log"

echo -e "${BLUE}🔐 Authentication Flow Testing${NC}"
echo "=================================="
echo "Testing complete login/logout cycle"
echo ""

# Function to log messages
log_message() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to check if service is running
check_service() {
    local url=$1
    local service_name=$2
    
    log_message "${YELLOW}🔍 Checking if $service_name is running...${NC}"
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        log_message "${GREEN}✅ $service_name is running at $url${NC}"
        return 0
    else
        log_message "${RED}❌ $service_name is not running at $url${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    
    log_message "${YELLOW}🔍 Testing API endpoint: $method $endpoint${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BACKEND_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "%{http_code}" -X "$method" \
            "$BACKEND_URL$endpoint" 2>/dev/null)
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        log_message "${GREEN}✅ API endpoint $endpoint returned $http_code${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        log_message "${RED}❌ API endpoint $endpoint returned $http_code${NC}"
        echo "$body"
    fi
    
    echo ""
}

# Function to test authentication flow
test_auth_flow() {
    log_message "${BLUE}🧪 Testing Authentication Flow${NC}"
    echo "----------------------------------------"
    
    # Test 1: Check if login page is accessible
    log_message "${YELLOW}📋 Test 1: Login page accessibility${NC}"
    if curl -s "$FRONTEND_URL/login" | grep -q "login\|Login"; then
        log_message "${GREEN}✅ Login page is accessible${NC}"
    else
        log_message "${RED}❌ Login page not accessible${NC}"
    fi
    
    # Test 2: Test login API
    log_message "${YELLOW}📋 Test 2: Login API functionality${NC}"
    test_api_endpoint "/api/auth/login" "POST" '{"email":"admin@company.com","password":"password"}'
    
    # Test 3: Test profile API (requires authentication)
    log_message "${YELLOW}📋 Test 3: Profile API (authenticated)${NC}"
    # This would require a valid token, so we'll just check if the endpoint exists
    test_api_endpoint "/api/auth/profile" "GET"
    
    # Test 4: Test logout API
    log_message "${YELLOW}📋 Test 4: Logout API functionality${NC}"
    test_api_endpoint "/api/auth/logout" "POST"
    
    echo ""
}

# Function to test frontend authentication
test_frontend_auth() {
    log_message "${BLUE}🌐 Testing Frontend Authentication${NC}"
    echo "--------------------------------------------"
    
    # Test 1: Check if React app is running
    log_message "${YELLOW}📋 Test 1: React application status${NC}"
    if curl -s "$FRONTEND_URL" | grep -q "React\|react"; then
        log_message "${GREEN}✅ React application is running${NC}"
    else
        log_message "${RED}❌ React application not running${NC}"
    fi
    
    # Test 2: Check for authentication context
    log_message "${YELLOW}📋 Test 2: Authentication context check${NC}"
    if [ -f "src/contexts/AuthContext.tsx" ]; then
        log_message "${GREEN}✅ AuthContext exists${NC}"
        
        # Check if logout function uses proper navigation
        if grep -q "navigate.*login" "src/contexts/AuthContext.tsx"; then
            log_message "${GREEN}✅ Logout uses proper React Router navigation${NC}"
        else
            log_message "${RED}❌ Logout may not use proper navigation${NC}"
        fi
    else
        log_message "${RED}❌ AuthContext not found${NC}"
    fi
    
    # Test 3: Check for logout confirmation component
    log_message "${YELLOW}📋 Test 3: Logout confirmation component${NC}"
    if [ -f "src/components/common/LogoutConfirmation.tsx" ]; then
        log_message "${GREEN}✅ LogoutConfirmation component exists${NC}"
    else
        log_message "${RED}❌ LogoutConfirmation component not found${NC}"
    fi
    
    echo ""
}

# Function to provide manual testing instructions
manual_testing_instructions() {
    log_message "${BLUE}📝 Manual Testing Instructions${NC}"
    echo "====================================="
    echo ""
    echo "To manually test the authentication flow:"
    echo ""
    echo "1. ${YELLOW}Open your browser and go to:${NC} $FRONTEND_URL"
    echo ""
    echo "2. ${YELLOW}Login Test:${NC}"
    echo "   - Navigate to /login"
    echo "   - Enter credentials: admin@company.com / password"
    echo "   - Verify you can access the dashboard"
    echo ""
    echo "3. ${YELLOW}Logout Test:${NC}"
    echo "   - Click the logout button in the navbar"
    echo "   - Verify the confirmation dialog appears"
    echo "   - Confirm logout"
    echo "   - Verify you're redirected to login page"
    echo ""
    echo "4. ${YELLOW}Re-login Test:${NC}"
    echo "   - Try logging in again with the same credentials"
    echo "   - Verify you can access the dashboard again"
    echo ""
    echo "5. ${YELLOW}Session Management Test:${NC}"
    echo "   - Stay logged in for a few minutes"
    echo "   - Verify session timeout works (30 minutes)"
    echo "   - Verify you can log back in after timeout"
    echo ""
}

# Function to check for common issues
check_common_issues() {
    log_message "${BLUE}🔍 Checking for Common Issues${NC}"
    echo "================================="
    
    # Check if ports are in use
    log_message "${YELLOW}🔍 Checking port usage...${NC}"
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_message "${GREEN}✅ Port 3000 is in use (Frontend)${NC}"
    else
        log_message "${RED}❌ Port 3000 is not in use (Frontend not running)${NC}"
    fi
    
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_message "${GREEN}✅ Port 5000 is in use (Backend)${NC}"
    else
        log_message "${RED}❌ Port 5000 is not in use (Backend not running)${NC}"
    fi
    
    # Check for authentication files
    log_message "${YELLOW}🔍 Checking authentication files...${NC}"
    
    if [ -f "src/contexts/AuthContext.tsx" ]; then
        log_message "${GREEN}✅ AuthContext.tsx exists${NC}"
    else
        log_message "${RED}❌ AuthContext.tsx missing${NC}"
    fi
    
    if [ -f "src/services/api.ts" ]; then
        log_message "${GREEN}✅ API service exists${NC}"
    else
        log_message "${RED}❌ API service missing${NC}"
    fi
    
    # Check for recent authentication fixes
    log_message "${YELLOW}🔍 Checking for authentication fixes...${NC}"
    
    if grep -q "navigate.*login" "src/contexts/AuthContext.tsx"; then
        log_message "${GREEN}✅ Logout uses React Router navigation${NC}"
    else
        log_message "${RED}❌ Logout may still use window.location.href${NC}"
    fi
    
    if [ -f "src/components/common/LogoutConfirmation.tsx" ]; then
        log_message "${GREEN}✅ Logout confirmation component exists${NC}"
    else
        log_message "${RED}❌ Logout confirmation component missing${NC}"
    fi
    
    echo ""
}

# Main execution
main() {
    echo "Authentication Flow Test - $(date)" > "$LOG_FILE"
    echo "=====================================" >> "$LOG_FILE"
    
    log_message "${BLUE}🚀 Starting Authentication Flow Testing${NC}"
    echo ""
    
    # Check if services are running
    check_service "$FRONTEND_URL" "Frontend"
    check_service "$BACKEND_URL" "Backend"
    echo ""
    
    # Run tests
    test_auth_flow
    test_frontend_auth
    check_common_issues
    
    # Provide manual testing instructions
    manual_testing_instructions
    
    log_message "${GREEN}✅ Authentication flow testing completed!${NC}"
    log_message "${BLUE}📄 Full test log saved to: $LOG_FILE${NC}"
    echo ""
    log_message "${YELLOW}💡 Next Steps:${NC}"
    log_message "1. Start both frontend and backend servers"
    log_message "2. Follow the manual testing instructions above"
    log_message "3. Verify login → logout → re-login flow works"
    log_message "4. Check that logout confirmation dialog appears"
    echo ""
}

# Run main function
main "$@" 