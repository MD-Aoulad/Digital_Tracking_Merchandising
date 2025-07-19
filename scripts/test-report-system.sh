#!/bin/bash

# =============================================
# REPORT SYSTEM TEST SCRIPT
# Digital Tracking Merchandising Platform
# =============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3006"
API_BASE_URL="$BASE_URL/api"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test data storage
ADMIN_TOKEN=""
USER_TOKEN=""
TEMPLATE_ID=""
REPORT_ID=""
SCHEDULED_REPORT_ID=""

# Helper functions
print_header() {
    echo -e "\n${BLUE}=============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=============================================${NC}"
}

print_test() {
    echo -e "\n${CYAN}🧪 Testing: $1${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

print_success() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_error() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  INFO: $1${NC}"
}

# Test function
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local description="$6"
    
    print_test "$test_name"
    
    local response
    local status_code
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint" -H "Authorization: Bearer $ADMIN_TOKEN")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$data")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$data")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$endpoint" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$description"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "$description (Expected: $expected_status, Got: $status_code)"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    fi
}

# Test without authentication
test_endpoint_no_auth() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local description="$5"
    
    print_test "$test_name"
    
    local response
    local status_code
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$description"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        print_error "$description (Expected: $expected_status, Got: $status_code)"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    fi
}

# Main test execution
main() {
    print_header "REPORT SYSTEM COMPREHENSIVE TEST SUITE"
    echo -e "${YELLOW}Starting comprehensive testing of Report Service...${NC}"
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed. Please install jq to run this test script."
        exit 1
    fi
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed. Please install curl to run this test script."
        exit 1
    fi
    
    # =============================================
    # 1. SERVICE HEALTH CHECKS
    # =============================================
    print_header "1. SERVICE HEALTH CHECKS"
    
    test_endpoint_no_auth \
        "Service Health Check" \
        "GET" \
        "$BASE_URL/health" \
        "200" \
        "Service health endpoint should be accessible"
    
    test_endpoint_no_auth \
        "API Documentation" \
        "GET" \
        "$BASE_URL/docs" \
        "200" \
        "API documentation should be accessible"
    
    test_endpoint_no_auth \
        "Service Info" \
        "GET" \
        "$BASE_URL/" \
        "200" \
        "Service info endpoint should be accessible"
    
    # =============================================
    # 2. AUTHENTICATION TESTS
    # =============================================
    print_header "2. AUTHENTICATION TESTS"
    
    # Test without token
    test_endpoint_no_auth \
        "Unauthorized Access" \
        "GET" \
        "$API_BASE_URL/reports/templates" \
        "401" \
        "Should require authentication token"
    
    # Create test tokens (in real scenario, these would come from auth service)
    ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTEyMyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM0NjU0MjkwfQ.test"
    USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItNDU2Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDY1NDI5MH0.test"
    
    print_info "Using test tokens for authentication"
    
    # =============================================
    # 3. REPORT TEMPLATES TESTS
    # =============================================
    print_header "3. REPORT TEMPLATES TESTS"
    
    # Get all templates
    test_endpoint \
        "Get All Templates" \
        "GET" \
        "$API_BASE_URL/reports/templates" \
        "" \
        "200" \
        "Should retrieve all report templates"
    
    # Create template
    test_endpoint \
        "Create Template" \
        "POST" \
        "$API_BASE_URL/reports/templates" \
        '{
            "name": "Attendance Report Template",
            "description": "Template for generating attendance reports",
            "templateType": "report",
            "category": "attendance",
            "templateConfig": {
                "fields": ["employee_id", "date", "hours_worked", "status"],
                "format": "pdf",
                "layout": "table"
            },
            "dataSource": {
                "type": "database",
                "query": "SELECT * FROM attendance WHERE date >= :start_date"
            },
            "permissions": ["admin", "manager"]
        }' \
        "201" \
        "Should create new report template"
    
    # Extract template ID from response for subsequent tests
    TEMPLATE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/reports/templates" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{
            "name": "Performance Report Template",
            "description": "Template for performance reports",
            "templateType": "report",
            "category": "performance",
            "templateConfig": {
                "fields": ["employee_id", "tasks_completed", "rating"],
                "format": "pdf"
            }
        }')
    
    TEMPLATE_ID=$(echo "$TEMPLATE_RESPONSE" | jq -r '.template.id' 2>/dev/null)
    
    if [ "$TEMPLATE_ID" != "null" ] && [ -n "$TEMPLATE_ID" ]; then
        print_info "Created template with ID: $TEMPLATE_ID"
        
        # Update template
        test_endpoint \
            "Update Template" \
            "PUT" \
            "$API_BASE_URL/reports/templates/$TEMPLATE_ID" \
            '{
                "name": "Updated Performance Report Template",
                "description": "Updated description for performance reports"
            }' \
            "200" \
            "Should update existing template"
        
        # Get specific template
        test_endpoint \
            "Get Specific Template" \
            "GET" \
            "$API_BASE_URL/reports/templates?templateType=report" \
            "" \
            "200" \
            "Should filter templates by type"
        
    else
        print_warning "Could not extract template ID for update tests"
    fi
    
    # =============================================
    # 4. REPORT GENERATION TESTS
    # =============================================
    print_header "4. REPORT GENERATION TESTS"
    
    # Generate new report
    test_endpoint \
        "Generate Report" \
        "POST" \
        "$API_BASE_URL/reports" \
        '{
            "templateId": "'$TEMPLATE_ID'",
            "title": "Monthly Performance Report",
            "description": "Performance report for January 2025",
            "reportData": {
                "period": "2025-01",
                "department": "Sales",
                "metrics": {
                    "total_tasks": 150,
                    "completed_tasks": 142,
                    "completion_rate": 94.7
                }
            }
        }' \
        "201" \
        "Should generate new report"
    
    # Extract report ID from response
    REPORT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/reports" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{
            "templateId": "'$TEMPLATE_ID'",
            "title": "Test Report for Download",
            "description": "Test report for download functionality"
        }')
    
    REPORT_ID=$(echo "$REPORT_RESPONSE" | jq -r '.report.id' 2>/dev/null)
    
    if [ "$REPORT_ID" != "null" ] && [ -n "$REPORT_ID" ]; then
        print_info "Created report with ID: $REPORT_ID"
        
        # Get all reports
        test_endpoint \
            "Get All Reports" \
            "GET" \
            "$API_BASE_URL/reports" \
            "" \
            "200" \
            "Should retrieve all generated reports"
        
        # Get specific report
        test_endpoint \
            "Get Specific Report" \
            "GET" \
            "$API_BASE_URL/reports/$REPORT_ID" \
            "" \
            "200" \
            "Should retrieve specific report details"
        
        # Download report
        test_endpoint \
            "Download Report" \
            "GET" \
            "$API_BASE_URL/reports/$REPORT_ID/download" \
            "" \
            "200" \
            "Should initiate report download"
        
    else
        print_warning "Could not extract report ID for report tests"
    fi
    
    # =============================================
    # 5. REPORT COMMENTS TESTS
    # =============================================
    print_header "5. REPORT COMMENTS TESTS"
    
    if [ -n "$REPORT_ID" ]; then
        # Add comment
        test_endpoint \
            "Add Comment" \
            "POST" \
            "$API_BASE_URL/reports/$REPORT_ID/comments" \
            '{
                "comment": "This is a test comment on the report"
            }' \
            "201" \
            "Should add comment to report"
        
        # Get comments
        test_endpoint \
            "Get Comments" \
            "GET" \
            "$API_BASE_URL/reports/$REPORT_ID/comments" \
            "" \
            "200" \
            "Should retrieve report comments"
        
    else
        print_warning "Skipping comment tests - no report ID available"
    fi
    
    # =============================================
    # 6. SCHEDULED REPORTS TESTS
    # =============================================
    print_header "6. SCHEDULED REPORTS TESTS"
    
    # Get scheduled reports
    test_endpoint \
        "Get Scheduled Reports" \
        "GET" \
        "$API_BASE_URL/reports/scheduled" \
        "" \
        "200" \
        "Should retrieve scheduled reports"
    
    # Create scheduled report
    test_endpoint \
        "Create Scheduled Report" \
        "POST" \
        "$API_BASE_URL/reports/scheduled" \
        '{
            "templateId": "'$TEMPLATE_ID'",
            "name": "Weekly Performance Report",
            "scheduleType": "weekly",
            "scheduleConfig": {
                "dayOfWeek": 1,
                "time": "09:00",
                "timezone": "UTC"
            },
            "recipients": ["user-123", "user-456"],
            "deliveryMethod": "email"
        }' \
        "201" \
        "Should create scheduled report"
    
    # Extract scheduled report ID
    SCHEDULED_RESPONSE=$(curl -s -X POST "$API_BASE_URL/reports/scheduled" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{
            "templateId": "'$TEMPLATE_ID'",
            "name": "Monthly Summary Report",
            "scheduleType": "monthly",
            "scheduleConfig": {
                "dayOfMonth": 1,
                "time": "08:00"
            },
            "deliveryMethod": "system"
        }')
    
    SCHEDULED_REPORT_ID=$(echo "$SCHEDULED_RESPONSE" | jq -r '.scheduledReport.id' 2>/dev/null)
    
    if [ "$SCHEDULED_REPORT_ID" != "null" ] && [ -n "$SCHEDULED_REPORT_ID" ]; then
        print_info "Created scheduled report with ID: $SCHEDULED_REPORT_ID"
        
        # Update scheduled report
        test_endpoint \
            "Update Scheduled Report" \
            "PUT" \
            "$API_BASE_URL/reports/scheduled/$SCHEDULED_REPORT_ID" \
            '{
                "name": "Updated Monthly Summary Report",
                "scheduleConfig": {
                    "dayOfMonth": 5,
                    "time": "10:00"
                }
            }' \
            "200" \
            "Should update scheduled report"
        
    else
        print_warning "Could not extract scheduled report ID for update tests"
    fi
    
    # =============================================
    # 7. ANALYTICS TESTS
    # =============================================
    print_header "7. ANALYTICS TESTS"
    
    # Get report analytics
    test_endpoint \
        "Get Report Analytics" \
        "GET" \
        "$API_BASE_URL/reports/analytics" \
        "" \
        "200" \
        "Should retrieve report analytics"
    
    # Get user analytics
    test_endpoint \
        "Get User Analytics" \
        "GET" \
        "$API_BASE_URL/reports/analytics/user/admin-123" \
        "" \
        "200" \
        "Should retrieve user-specific analytics"
    
    # Get template analytics
    if [ -n "$TEMPLATE_ID" ]; then
        test_endpoint \
            "Get Template Analytics" \
            "GET" \
            "$API_BASE_URL/reports/analytics/template/$TEMPLATE_ID" \
            "" \
            "200" \
            "Should retrieve template-specific analytics"
    else
        print_warning "Skipping template analytics test - no template ID available"
    fi
    
    # =============================================
    # 8. EXPORT AND DASHBOARD TESTS
    # =============================================
    print_header "8. EXPORT AND DASHBOARD TESTS"
    
    # Export reports
    test_endpoint \
        "Export Reports" \
        "POST" \
        "$API_BASE_URL/reports/export" \
        '{
            "format": "json",
            "filters": {
                "status": "generated"
            },
            "startDate": "2025-01-01",
            "endDate": "2025-01-31"
        }' \
        "200" \
        "Should export reports data"
    
    # Get dashboard data
    test_endpoint \
        "Get Dashboard Data" \
        "GET" \
        "$API_BASE_URL/reports/dashboard" \
        "" \
        "200" \
        "Should retrieve dashboard data"
    
    # =============================================
    # 9. ERROR HANDLING TESTS
    # =============================================
    print_header "9. ERROR HANDLING TESTS"
    
    # Test invalid template ID
    test_endpoint \
        "Invalid Template ID" \
        "POST" \
        "$API_BASE_URL/reports" \
        '{
            "templateId": "invalid-uuid",
            "title": "Test Report"
        }' \
        "404" \
        "Should handle invalid template ID"
    
    # Test missing required fields
    test_endpoint \
        "Missing Required Fields" \
        "POST" \
        "$API_BASE_URL/reports/templates" \
        '{
            "description": "Template without required fields"
        }' \
        "400" \
        "Should validate required fields"
    
    # Test invalid report ID
    test_endpoint \
        "Invalid Report ID" \
        "GET" \
        "$API_BASE_URL/reports/invalid-uuid" \
        "" \
        "404" \
        "Should handle invalid report ID"
    
    # =============================================
    # 10. PERMISSION TESTS
    # =============================================
    print_header "10. PERMISSION TESTS"
    
    # Test user token (should have limited access)
    USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/reports/templates" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d '{
            "name": "User Template",
            "templateType": "report",
            "templateConfig": {}
        }')
    
    USER_STATUS=$(echo "$USER_RESPONSE" | tail -n1)
    
    if [ "$USER_STATUS" = "403" ]; then
        print_success "User permissions correctly restricted"
    else
        print_error "User permissions not properly enforced (Expected: 403, Got: $USER_STATUS)"
    fi
    
    # =============================================
    # 11. CLEANUP TESTS
    # =============================================
    print_header "11. CLEANUP TESTS"
    
    # Delete scheduled report
    if [ -n "$SCHEDULED_REPORT_ID" ]; then
        test_endpoint \
            "Delete Scheduled Report" \
            "DELETE" \
            "$API_BASE_URL/reports/scheduled/$SCHEDULED_REPORT_ID" \
            "" \
            "200" \
            "Should delete scheduled report"
    fi
    
    # Delete report
    if [ -n "$REPORT_ID" ]; then
        test_endpoint \
            "Delete Report" \
            "DELETE" \
            "$API_BASE_URL/reports/$REPORT_ID" \
            "" \
            "200" \
            "Should delete report"
    fi
    
    # Note: We don't delete the template as it might be used by other reports
    
    # =============================================
    # 12. PAGINATION TESTS
    # =============================================
    print_header "12. PAGINATION TESTS"
    
    # Test pagination
    test_endpoint \
        "Pagination Test" \
        "GET" \
        "$API_BASE_URL/reports/templates?page=1&limit=5" \
        "" \
        "200" \
        "Should support pagination parameters"
    
    # =============================================
    # 13. FILTERING TESTS
    # =============================================
    print_header "13. FILTERING TESTS"
    
    # Test filtering
    test_endpoint \
        "Filter by Category" \
        "GET" \
        "$API_BASE_URL/reports/templates?category=performance" \
        "" \
        "200" \
        "Should filter templates by category"
    
    test_endpoint \
        "Filter by Status" \
        "GET" \
        "$API_BASE_URL/reports?status=generated" \
        "" \
        "200" \
        "Should filter reports by status"
    
    # =============================================
    # TEST SUMMARY
    # =============================================
    print_header "TEST SUMMARY"
    
    echo -e "${GREEN}Total Tests: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Report System is working correctly.${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please check the errors above.${NC}"
        exit 1
    fi
}

# Run the main function
main "$@" 