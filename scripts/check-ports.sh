#!/bin/bash

# Digital Tracking Merchandising Platform - Port Availability Checker
# This script MUST be run before starting any development work
# Usage: ./scripts/check-ports.sh

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service ports mapping (compatible with all shells)
SERVICE_PORTS="frontend:3000 api-gateway:8080 auth-service:3010 user-service:3002 todo-service:3005 chat-service:3003 notification-service:3009 approval-service:3011 report-service:3006 attendance-service:3007 workplace-service:3008 mobile-expo:3003 mobile-expo-dev:19001 mobile-expo-metro:19002 database:5432 redis:6379 prometheus:9090 grafana:3002"

echo -e "${BLUE}🔍 Digital Tracking Merchandising Platform - Port Availability Checker${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# Check if lsof is available
if ! command -v lsof &> /dev/null; then
    echo -e "${RED}❌ Error: lsof command not found. Please install lsof to use this script.${NC}"
    echo "On macOS: brew install lsof"
    echo "On Ubuntu/Debian: sudo apt-get install lsof"
    echo "On CentOS/RHEL: sudo yum install lsof"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Docker is not running. Please start Docker before proceeding.${NC}"
    echo ""
fi

echo -e "${BLUE}Checking port availability for all services...${NC}"
echo ""

# Track issues
ISSUES_FOUND=0
BUSY_PORTS=()

# Check each service port
for service_port in $SERVICE_PORTS; do
    IFS=':' read -r service port <<< "$service_port"
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        # Check if it's our Docker containers (which is expected)
        PROCESS_INFO=$(lsof -Pi :$port -sTCP:LISTEN)
        if echo "$PROCESS_INFO" | grep -q "com.docke\|docker"; then
            echo -e "${GREEN}✅ $service (port $port): RUNNING (Docker)${NC}"
        else
            echo -e "${RED}❌ $service (port $port): CONFLICT${NC}"
            
            # Get process details
            echo -e "${YELLOW}   Process details:${NC}"
            echo "$PROCESS_INFO" | while IFS= read -r line; do
                echo -e "${YELLOW}   $line${NC}"
            done
            
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
            BUSY_PORTS="$BUSY_PORTS $port"
        fi
    else
        echo -e "${GREEN}✅ $service (port $port): AVAILABLE${NC}"
    fi
done

echo ""
echo -e "${BLUE}================================================================${NC}"

# Summary
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 All ports are properly configured! System is running correctly.${NC}"
    echo ""
    echo -e "${GREEN}✅ Services Status:${NC}"
    echo "• All required services are running on correct ports"
    echo "• No port conflicts detected"
    echo "• System is ready for development"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Continue with your development work"
    echo "2. Monitor services: docker-compose ps"
    echo "3. Check logs if needed: docker-compose logs -f"
    exit 0
else
    echo -e "${RED}🚨 Found $ISSUES_FOUND port conflict(s)!${NC}"
    echo ""
    echo -e "${YELLOW}Conflicting ports: $BUSY_PORTS${NC}"
    echo ""
    echo -e "${YELLOW}To resolve port conflicts:${NC}"
    echo "1. Stop the conflicting processes:"
    for port in $BUSY_PORTS; do
        echo "   ./scripts/port-killer.sh $port"
    done
    echo ""
    echo "2. Or stop all Docker containers:"
    echo "   docker-compose down"
    echo ""
    echo "3. Or stop specific services:"
    echo "   docker stop <container_name>"
    echo ""
    echo -e "${YELLOW}After resolving conflicts, run this script again to verify.${NC}"
    exit 1
fi 