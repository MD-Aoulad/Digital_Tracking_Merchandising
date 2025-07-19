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
SERVICE_PORTS="frontend:3000 api-gateway:8000 auth-service:8001 user-service:8002 todo-service:8003 chat-service:8004 notification-service:8005 approval-service:8006 report-service:8007 attendance-service:8008 workplace-service:8009 mobile-expo:19000 mobile-expo-dev:19001 mobile-expo-metro:19002 database:5432 redis:6379 prometheus:9090 grafana:3001"

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
        echo -e "${RED}❌ $service (port $port): IN USE${NC}"
        
        # Get process details
        PROCESS_INFO=$(lsof -Pi :$port -sTCP:LISTEN)
        echo -e "${YELLOW}   Process details:${NC}"
        echo "$PROCESS_INFO" | while IFS= read -r line; do
            echo -e "${YELLOW}   $line${NC}"
        done
        
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        BUSY_PORTS="$BUSY_PORTS $port"
    else
        echo -e "${GREEN}✅ $service (port $port): AVAILABLE${NC}"
    fi
done

echo ""
echo -e "${BLUE}================================================================${NC}"

# Summary
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 All ports are available! Safe to proceed with development.${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Start your required services with: docker-compose up -d"
    echo "2. Verify services are running: docker-compose ps"
    echo "3. Check service logs if needed: docker-compose logs -f"
    exit 0
else
    echo -e "${RED}🚨 Found $ISSUES_FOUND port(s) in use!${NC}"
    echo ""
    echo -e "${YELLOW}Busy ports: $BUSY_PORTS${NC}"
    echo ""
    echo -e "${YELLOW}To resolve port conflicts:${NC}"
    echo "1. Stop the processes using the busy ports:"
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