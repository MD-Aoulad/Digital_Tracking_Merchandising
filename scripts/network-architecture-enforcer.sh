#!/bin/bash

# Network Architecture Enforcement Script
# Digital Tracking Merchandising Platform
# This script ensures all services follow the defined network architecture

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Network Architecture Constants (compatible with bash 3.2)
FRONTEND_PORT="3000"
API_GATEWAY_PORT="8080"
AUTH_SERVICE_PORT="3010"
USER_SERVICE_PORT="3002"
CHAT_SERVICE_PORT="3003"
ATTENDANCE_SERVICE_PORT="3007"
TODO_SERVICE_PORT="3005"
REPORT_SERVICE_PORT="3006"
APPROVAL_SERVICE_PORT="3011"
WORKPLACE_SERVICE_PORT="3008"
NOTIFICATION_SERVICE_PORT="3009"
MOBILE_APP_PORT="3003"
GRAFANA_PORT="3002"
PROMETHEUS_PORT="9090"
REDIS_PORT="6379"

# Database Ports
AUTH_DB_PORT="5432"
USER_DB_PORT="5433"
CHAT_DB_PORT="5434"
ATTENDANCE_DB_PORT="5435"
TODO_DB_PORT="5436"
REPORT_DB_PORT="5437"
APPROVAL_DB_PORT="5438"
WORKPLACE_DB_PORT="5439"
NOTIFICATION_DB_PORT="5440"

# Network Architecture Validation Functions
validate_port_assignments() {
    echo -e "${BLUE}🔍 Validating Port Assignments...${NC}"
    
    local violations=0
    
    # Check Frontend
    local frontend_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "frontend-app" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$frontend_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  frontend-app: Not running${NC}"
        ((violations++))
    elif [[ "$frontend_port" != "$FRONTEND_PORT" ]]; then
        echo -e "${RED}❌ frontend-app: Expected port $FRONTEND_PORT, got $frontend_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ frontend-app: Port $frontend_port (correct)${NC}"
    fi
    
    # Check API Gateway
    local api_gateway_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "api-gateway" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$api_gateway_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  api-gateway: Not running${NC}"
        ((violations++))
    elif [[ "$api_gateway_port" != "$API_GATEWAY_PORT" ]]; then
        echo -e "${RED}❌ api-gateway: Expected port $API_GATEWAY_PORT, got $api_gateway_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ api-gateway: Port $api_gateway_port (correct)${NC}"
    fi
    
    # Check Auth Service
    local auth_service_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "auth-service" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$auth_service_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  auth-service: Not running${NC}"
        ((violations++))
    elif [[ "$auth_service_port" != "$AUTH_SERVICE_PORT" ]]; then
        echo -e "${RED}❌ auth-service: Expected port $AUTH_SERVICE_PORT, got $auth_service_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ auth-service: Port $auth_service_port (correct)${NC}"
    fi
    
    # Check Attendance Service
    local attendance_service_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "attendance-service" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$attendance_service_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  attendance-service: Not running${NC}"
        ((violations++))
    elif [[ "$attendance_service_port" != "$ATTENDANCE_SERVICE_PORT" ]]; then
        echo -e "${RED}❌ attendance-service: Expected port $ATTENDANCE_SERVICE_PORT, got $attendance_service_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ attendance-service: Port $attendance_service_port (correct)${NC}"
    fi
    
    # Check Mobile App
    local mobile_app_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "mobile-app" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$mobile_app_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  mobile-app: Not running${NC}"
        ((violations++))
    elif [[ "$mobile_app_port" != "$MOBILE_APP_PORT" ]]; then
        echo -e "${RED}❌ mobile-app: Expected port $MOBILE_APP_PORT, got $mobile_app_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ mobile-app: Port $mobile_app_port (correct)${NC}"
    fi
    
    return $violations
}

validate_database_ports() {
    echo -e "${BLUE}🔍 Validating Database Port Assignments...${NC}"
    
    local violations=0
    
    # Check Auth DB
    local auth_db_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "auth-db" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$auth_db_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  auth-db: Not running${NC}"
        ((violations++))
    elif [[ "$auth_db_port" != "$AUTH_DB_PORT" ]]; then
        echo -e "${RED}❌ auth-db: Expected port $AUTH_DB_PORT, got $auth_db_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ auth-db: Port $auth_db_port (correct)${NC}"
    fi
    
    # Check Attendance DB
    local attendance_db_port=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "attendance-db" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")
    if [[ "$attendance_db_port" == "NOT_RUNNING" ]]; then
        echo -e "${YELLOW}⚠️  attendance-db: Not running${NC}"
        ((violations++))
    elif [[ "$attendance_db_port" != "$ATTENDANCE_DB_PORT" ]]; then
        echo -e "${RED}❌ attendance-db: Expected port $ATTENDANCE_DB_PORT, got $attendance_db_port${NC}"
        ((violations++))
    else
        echo -e "${GREEN}✅ attendance-db: Port $attendance_db_port (correct)${NC}"
    fi
    
    return $violations
}

validate_service_health() {
    echo -e "${BLUE}🔍 Validating Service Health...${NC}"
    
    local violations=0
    
    # Check API Gateway
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API Gateway: Healthy${NC}"
    else
        echo -e "${RED}❌ API Gateway: Unhealthy${NC}"
        ((violations++))
    fi
    
    # Check Auth Service
    if curl -f http://localhost:3010/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Auth Service: Healthy${NC}"
    else
        echo -e "${RED}❌ Auth Service: Unhealthy${NC}"
        ((violations++))
    fi
    
    # Check Attendance Service
    if curl -f http://localhost:3007/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Attendance Service: Healthy${NC}"
    else
        echo -e "${RED}❌ Attendance Service: Unhealthy${NC}"
        ((violations++))
    fi
    
    return $violations
}

validate_network_connectivity() {
    echo -e "${BLUE}🔍 Validating Network Connectivity...${NC}"
    
    local violations=0
    
    # Test inter-service communication
    local services=("auth-service" "user-service" "attendance-service" "todo-service")
    
    for service in "${services[@]}"; do
        local container_name="digital_tracking_merchandising-${service}-1"
        if docker exec "$container_name" ping -c 1 redis >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service: Can reach Redis${NC}"
        else
            echo -e "${RED}❌ $service: Cannot reach Redis${NC}"
            ((violations++))
        fi
    done
    
    return $violations
}

validate_architecture_patterns() {
    echo -e "${BLUE}🔍 Validating Architecture Patterns...${NC}"
    
    local violations=0
    
    # Check if API Gateway is routing correctly
    local auth_response=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"password"}' | grep -o '"message":"[^"]*"' || echo "FAILED")
    
    if [[ "$auth_response" == *"Login successful"* ]]; then
        echo -e "${GREEN}✅ API Gateway: Auth routing working${NC}"
    else
        echo -e "${RED}❌ API Gateway: Auth routing failed${NC}"
        ((violations++))
    fi
    
    # Check if services are using correct database connections
    local db_connections=$(docker ps | grep -E "(auth-db|user-db|attendance-db)" | wc -l)
    if [[ $db_connections -ge 3 ]]; then
        echo -e "${GREEN}✅ Database Services: All running${NC}"
    else
        echo -e "${RED}❌ Database Services: Missing some databases${NC}"
        ((violations++))
    fi
    
    return $violations
}

generate_architecture_report() {
    echo -e "${BLUE}📊 Generating Network Architecture Report...${NC}"
    
    local report_file="network-architecture-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Network Architecture Compliance Report"
        echo "Generated: $(date)"
        echo "======================================"
        echo ""
        
        # Port assignments
        echo "PORT ASSIGNMENTS:"
        echo "================="
        echo "Frontend: Expected $FRONTEND_PORT, Actual $(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "frontend-app" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")"
        echo "API Gateway: Expected $API_GATEWAY_PORT, Actual $(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "api-gateway" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")"
        echo "Auth Service: Expected $AUTH_SERVICE_PORT, Actual $(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "auth-service" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")"
        echo "Attendance Service: Expected $ATTENDANCE_SERVICE_PORT, Actual $(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep "attendance-service" | grep -o "0.0.0.0:[0-9]*" | cut -d: -f2 || echo "NOT_RUNNING")"
        echo ""
        
        # Service health
        echo "SERVICE HEALTH:"
        echo "==============="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        # Network connectivity
        echo "NETWORK CONNECTIVITY:"
        echo "===================="
        docker network ls
        echo ""
        
    } > "$report_file"
    
    echo -e "${GREEN}📄 Report saved to: $report_file${NC}"
}

fix_common_violations() {
    echo -e "${BLUE}🔧 Attempting to Fix Common Violations...${NC}"
    
    # Restart API Gateway if not running
    if ! docker ps | grep -q "api-gateway"; then
        echo -e "${YELLOW}🔄 Starting API Gateway...${NC}"
        docker-compose up -d api-gateway --no-deps
    fi
    
    # Restart services that might be unhealthy
    local unhealthy_services=$(docker ps --format "{{.Names}}" | grep "digital_tracking_merchandising" | xargs -I {} docker inspect {} --format='{{.State.Health.Status}}' | grep -n "unhealthy" | cut -d: -f1)
    
    if [[ -n "$unhealthy_services" ]]; then
        echo -e "${YELLOW}🔄 Restarting unhealthy services...${NC}"
        docker-compose restart
    fi
    
    # Check port conflicts
    for port in "$FRONTEND_PORT" "$API_GATEWAY_PORT" "$AUTH_SERVICE_PORT" "$ATTENDANCE_SERVICE_PORT"; do
        if lsof -i ":$port" >/dev/null 2>&1; then
            local process=$(lsof -i ":$port" | grep LISTEN | head -1 | awk '{print $1}')
            if [[ "$process" != "docker" ]]; then
                echo -e "${YELLOW}⚠️  Port $port conflict detected with $process${NC}"
            fi
        fi
    done
}

# Main execution
main() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Network Architecture Enforcement Tool${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
    
    local total_violations=0
    
    # Run all validations
    validate_port_assignments
    total_violations=$((total_violations + $?))
    
    validate_database_ports
    total_violations=$((total_violations + $?))
    
    validate_service_health
    total_violations=$((total_violations + $?))
    
    validate_network_connectivity
    total_violations=$((total_violations + $?))
    
    validate_architecture_patterns
    total_violations=$((total_violations + $?))
    
    echo ""
    echo -e "${BLUE}==========================================${NC}"
    
    if [[ $total_violations -eq 0 ]]; then
        echo -e "${GREEN}✅ All network architecture requirements met!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Found $total_violations architecture violations${NC}"
        
        if [[ "${1:-}" == "--fix" ]]; then
            fix_common_violations
        fi
        
        generate_architecture_report
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "report")
        generate_architecture_report
        ;;
    "fix")
        main --fix
        ;;
    "validate")
        main
        ;;
    *)
        echo "Usage: $0 [validate|report|fix]"
        echo "  validate: Run all validations (default)"
        echo "  report: Generate architecture report"
        echo "  fix: Run validations and attempt fixes"
        exit 1
        ;;
esac 