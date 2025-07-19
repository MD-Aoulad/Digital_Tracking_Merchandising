#!/bin/bash

# Digital Tracking Merchandising Platform - UI Compliance Checker
# This script checks for UI changes to ensure compliance with UI immutability rule
# Usage: ./scripts/ui-compliance-checker.sh [commit_hash]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
show_usage() {
    echo -e "${BLUE}🎨 Digital Tracking Merchandising Platform - UI Compliance Checker${NC}"
    echo -e "${BLUE}================================================================${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo "  ./scripts/ui-compliance-checker.sh [commit_hash]"
    echo ""
    echo -e "${BLUE}Description:${NC}"
    echo "  This script checks for UI-related changes to ensure compliance with"
    echo "  the UI immutability rule. It prevents modification of existing UI"
    echo "  components while allowing new components and non-visual changes."
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./scripts/ui-compliance-checker.sh                    # Check against HEAD~1"
    echo "  ./scripts/ui-compliance-checker.sh HEAD~5             # Check against 5 commits ago"
    echo "  ./scripts/ui-compliance-checker.sh abc1234            # Check against specific commit"
    echo ""
    echo -e "${BLUE}UI Files Monitored:${NC}"
    echo "  - .tsx (React TypeScript components)"
    echo "  - .jsx (React JavaScript components)"
    echo "  - .css (Cascading Style Sheets)"
    echo "  - .scss (Sass stylesheets)"
    echo "  - .less (Less stylesheets)"
    echo "  - .styl (Stylus stylesheets)"
}

# Function to check if git is available
check_git() {
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Error: git command not found${NC}"
        echo "Please install git to use this script."
        exit 1
    fi
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Not in a git repository${NC}"
        echo "Please run this script from within a git repository."
        exit 1
    fi
}

# Function to validate commit hash
validate_commit() {
    local commit=$1
    
    if ! git rev-parse --verify "$commit" > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Invalid commit hash '$commit'${NC}"
        echo "Please provide a valid commit hash or reference."
        exit 1
    fi
}

# Function to check UI changes
check_ui_changes() {
    local compare_commit=$1
    
    echo -e "${BLUE}🎨 Checking UI compliance...${NC}"
    echo -e "${BLUE}Comparing against: $compare_commit${NC}"
    echo ""
    
    # Get UI-related file changes
    UI_CHANGES=$(git diff --name-only "$compare_commit" HEAD | grep -E "\.(css|scss|less|styl|tsx|jsx)$" | grep -v "test" | grep -v "__tests__" | grep -v ".test." | grep -v ".spec.")
    
    if [ -n "$UI_CHANGES" ]; then
        echo -e "${RED}⚠️  UI changes detected!${NC}"
        echo ""
        echo -e "${YELLOW}Modified UI files:${NC}"
        echo "$UI_CHANGES" | while IFS= read -r file; do
            echo -e "${RED}  - $file${NC}"
        done
        echo ""
        echo -e "${YELLOW}UI Compliance Rules:${NC}"
        echo "  ✅ ALLOWED:"
        echo "    - Adding new components"
        echo "    - Adding new features"
        echo "    - Non-visual changes (logic, data, etc.)"
        echo "    - Test files and documentation"
        echo ""
        echo "  ❌ NOT ALLOWED:"
        echo "    - Modifying existing component layouts"
        echo "    - Changing existing CSS/styling"
        echo "    - Altering existing navigation"
        echo "    - Modifying existing form layouts"
        echo ""
        echo -e "${YELLOW}Please review these changes and ensure they don't modify existing UI components.${NC}"
        echo -e "${YELLOW}If you need to make UI changes, please:${NC}"
        echo "  1. Create a new component instead of modifying existing ones"
        echo "  2. Add new features without changing existing layouts"
        echo "  3. Use CSS classes instead of inline styles"
        echo "  4. Document why UI changes are necessary"
        echo ""
        
        # Show detailed changes for each file
        echo -e "${BLUE}📋 Detailed changes:${NC}"
        echo "$UI_CHANGES" | while IFS= read -r file; do
            echo ""
            echo -e "${YELLOW}File: $file${NC}"
            echo -e "${BLUE}Changes:${NC}"
            git diff "$compare_commit" HEAD -- "$file" | head -20
            echo "..."
        done
        
        exit 1
    else
        echo -e "${GREEN}✅ No UI changes detected${NC}"
        echo ""
        echo -e "${GREEN}UI compliance check passed!${NC}"
        echo "All changes are compliant with the UI immutability rule."
        exit 0
    fi
}

# Function to check for new UI components
check_new_components() {
    local compare_commit=$1
    
    echo -e "${BLUE}🔍 Checking for new UI components...${NC}"
    echo ""
    
    # Get new UI files (not modified, but new)
    NEW_UI_FILES=$(git diff --name-only --diff-filter=A "$compare_commit" HEAD | grep -E "\.(tsx|jsx)$" | grep -v "test" | grep -v "__tests__" | grep -v ".test." | grep -v ".spec.")
    
    if [ -n "$NEW_UI_FILES" ]; then
        echo -e "${GREEN}✅ New UI components detected (this is good!):${NC}"
        echo "$NEW_UI_FILES" | while IFS= read -r file; do
            echo -e "${GREEN}  + $file${NC}"
        done
        echo ""
        echo -e "${BLUE}New components are allowed and encouraged!${NC}"
    else
        echo -e "${YELLOW}No new UI components detected${NC}"
    fi
}

# Function to check for styling changes
check_styling_changes() {
    local compare_commit=$1
    
    echo -e "${BLUE}🎨 Checking for styling changes...${NC}"
    echo ""
    
    # Get styling file changes
    STYLING_CHANGES=$(git diff --name-only "$compare_commit" HEAD | grep -E "\.(css|scss|less|styl)$" | grep -v "test" | grep -v "__tests__" | grep -v ".test." | grep -v ".spec.")
    
    if [ -n "$STYLING_CHANGES" ]; then
        echo -e "${YELLOW}⚠️  Styling changes detected:${NC}"
        echo "$STYLING_CHANGES" | while IFS= read -r file; do
            echo -e "${YELLOW}  - $file${NC}"
        done
        echo ""
        echo -e "${YELLOW}Please ensure these styling changes:${NC}"
        echo "  - Don't affect existing component layouts"
        echo "  - Only add new styles or modify new components"
        echo "  - Don't change existing visual appearance"
        echo ""
    else
        echo -e "${GREEN}✅ No styling changes detected${NC}"
    fi
}

# Function to provide recommendations
provide_recommendations() {
    echo -e "${BLUE}💡 UI Development Recommendations:${NC}"
    echo ""
    echo "1. **Component Architecture**:"
    echo "   - Create new components instead of modifying existing ones"
    echo "   - Use composition over modification"
    echo "   - Follow the existing component patterns"
    echo ""
    echo "2. **Styling Guidelines**:"
    echo "   - Use Tailwind CSS classes for new components"
    echo "   - Don't modify existing CSS files"
    echo "   - Create new CSS modules for new components"
    echo ""
    echo "3. **Layout Guidelines**:"
    echo "   - Don't change existing page layouts"
    echo "   - Add new sections without modifying existing ones"
    echo "   - Use existing layout components"
    echo ""
    echo "4. **Navigation Guidelines**:"
    echo "   - Don't modify existing navigation structure"
    echo "   - Add new routes without changing existing ones"
    echo "   - Use existing navigation components"
    echo ""
    echo "5. **Form Guidelines**:"
    echo "   - Don't modify existing form layouts"
    echo "   - Create new forms using existing form components"
    echo "   - Follow existing validation patterns"
}

# Main script logic
main() {
    # Check if help is requested
    if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi
    
    # Check git availability
    check_git
    check_git_repo
    
    # Set default compare commit if none provided
    local compare_commit=${1:-"HEAD~1"}
    
    # Validate commit hash
    validate_commit "$compare_commit"
    
    echo -e "${BLUE}🎨 Digital Tracking Merchandising Platform - UI Compliance Checker${NC}"
    echo -e "${BLUE}================================================================${NC}"
    echo ""
    
    # Run all checks
    check_ui_changes "$compare_commit"
    check_new_components "$compare_commit"
    check_styling_changes "$compare_commit"
    
    echo ""
    echo -e "${BLUE}================================================================${NC}"
    provide_recommendations
    
    echo ""
    echo -e "${GREEN}🎉 UI compliance check completed successfully!${NC}"
}

# Run main function with all arguments
main "$@" 