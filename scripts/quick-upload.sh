#!/bin/bash

# Quick Upload Script for Digital Tracking Merchandising Platform
# Provides different verification levels for uploads

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Quick Upload Script${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 \"commit message\" [verification_level]${NC}"
    echo ""
    echo "Verification Levels:"
    echo "  none     - No verification (fastest)"
    echo "  basic    - Basic checks only"
    echo "  full     - Full verification (recommended for major changes)"
    echo ""
    echo "Examples:"
    echo "  $0 \"Fix typo in documentation\" none"
    echo "  $0 \"Add new feature\" basic"
    echo "  $0 \"Major architectural change\" full"
    exit 1
fi

COMMIT_MESSAGE="$1"
VERIFICATION_LEVEL="${2:-basic}"

echo -e "${BLUE}Commit Message:${NC} $COMMIT_MESSAGE"
echo -e "${BLUE}Verification Level:${NC} $VERIFICATION_LEVEL"
echo ""

# Function to run verification based on level
run_verification() {
    local level="$1"
    
    case $level in
        "none")
            echo -e "${YELLOW}⚠️  Skipping verification (none)${NC}"
            ;;
        "basic")
            echo -e "${BLUE}🔍 Running basic verification...${NC}"
            ./scripts/check-ports.sh
            echo -e "${GREEN}✅ Basic verification completed${NC}"
            ;;
        "full")
            echo -e "${BLUE}🔍 Running full verification...${NC}"
            ./scripts/check-ports.sh
            ./scripts/network-architecture-enforcer.sh validate
            ./scripts/ui-compliance-checker.sh
            echo -e "${GREEN}✅ Full verification completed${NC}"
            ;;
        *)
            echo -e "${RED}❌ Invalid verification level: $level${NC}"
            exit 1
            ;;
    esac
}

# Main upload process
echo -e "${BLUE}📁 Adding files to git...${NC}"
git add .

echo -e "${BLUE}🔍 Checking git status...${NC}"
git status --porcelain

echo ""
echo -e "${BLUE}🔍 Running verification...${NC}"
run_verification "$VERIFICATION_LEVEL"

echo ""
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE"

echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ Upload completed successfully!${NC}"
echo -e "${GREEN}📊 Verification level used: $VERIFICATION_LEVEL${NC}"
echo ""
echo -e "${BLUE}🔗 Repository: https://github.com/MD-Aoulad/Digital_Tracking_Merchandising${NC}" 