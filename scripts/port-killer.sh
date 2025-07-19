#!/bin/bash

# Digital Tracking Merchandising Platform - Port Killer
# This script stops processes using a specific port
# Usage: ./scripts/port-killer.sh <port_number>

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if port number is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Port number is required${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo "  ./scripts/port-killer.sh <port_number>"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./scripts/port-killer.sh 3000"
    echo "  ./scripts/port-killer.sh 8000"
    echo ""
    echo -e "${BLUE}Common ports in this project:${NC}"
    echo "  3000 - Frontend Web App"
    echo "  8000 - Backend API Gateway"
    echo "  8001 - Auth Service"
    echo "  8002 - User Service"
    echo "  8003 - Todo Service"
    echo "  8004 - Chat Service"
    echo "  8005 - Notification Service"
    echo "  8006 - Approval Service"
    echo "  8007 - Report Service"
    echo "  8008 - Attendance Service"
    echo "  8009 - Workplace Service"
    echo "  19000 - Mobile App (Expo)"
    echo "  19001 - Mobile App Dev"
    echo "  19002 - Mobile App Metro"
    echo "  5432 - Database"
    echo "  6379 - Redis"
    echo "  9090 - Prometheus"
    echo "  3001 - Grafana"
    exit 1
fi

PORT=$1

# Validate port number
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo -e "${RED}❌ Error: Invalid port number. Port must be between 1 and 65535.${NC}"
    exit 1
fi

echo -e "${BLUE}🔫 Digital Tracking Merchandising Platform - Port Killer${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Check if lsof is available
if ! command -v lsof &> /dev/null; then
    echo -e "${RED}❌ Error: lsof command not found. Please install lsof to use this script.${NC}"
    echo "On macOS: brew install lsof"
    echo "On Ubuntu/Debian: sudo apt-get install lsof"
    echo "On CentOS/RHEL: sudo yum install lsof"
    exit 1
fi

echo -e "${BLUE}Targeting port: $PORT${NC}"
echo ""

# Check if port is in use
if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Port $PORT is already free${NC}"
    exit 0
fi

# Get process information
echo -e "${YELLOW}📋 Process information for port $PORT:${NC}"
lsof -Pi :$PORT -sTCP:LISTEN
echo ""

# Get PIDs
PIDS=$(lsof -ti:$PORT)

if [ -z "$PIDS" ]; then
    echo -e "${GREEN}✅ No processes found on port $PORT${NC}"
    exit 0
fi

echo -e "${YELLOW}🔄 Found processes with PIDs: $PIDS${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  Warning: This will forcefully terminate the processes using port $PORT${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (y/N)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Operation cancelled.${NC}"
    exit 0
fi

echo ""

# Kill processes
echo -e "${BLUE}🔄 Stopping processes...${NC}"

for pid in $PIDS; do
    echo -e "${YELLOW}   Killing process $pid...${NC}"
    
    # Try graceful termination first
    if kill -TERM "$pid" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Process $pid terminated gracefully${NC}"
    else
        # Force kill if graceful termination fails
        if kill -KILL "$pid" 2>/dev/null; then
            echo -e "${GREEN}   ✅ Process $pid force killed${NC}"
        else
            echo -e "${RED}   ❌ Failed to kill process $pid${NC}"
        fi
    fi
done

echo ""

# Verify port is free
sleep 2

if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}🎉 Success! Port $PORT is now free${NC}"
    echo ""
    echo -e "${GREEN}You can now start your service on port $PORT${NC}"
    exit 0
else
    echo -e "${RED}❌ Warning: Port $PORT is still in use${NC}"
    echo ""
    echo -e "${YELLOW}Remaining processes:${NC}"
    lsof -Pi :$PORT -sTCP:LISTEN
    echo ""
    echo -e "${YELLOW}You may need to manually stop these processes or restart your system.${NC}"
    exit 1
fi 