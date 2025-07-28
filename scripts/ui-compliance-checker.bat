@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - UI Compliance Checker
REM This script checks for UI changes to ensure compliance with UI immutability rule
REM Usage: scripts\ui-compliance-checker.bat [commit_hash]

REM Check if commit hash is provided
set "COMPARE_COMMIT=%~1"
if "!COMPARE_COMMIT!"=="" (
    set "COMPARE_COMMIT=HEAD~1"
)

echo ========================================
echo Digital Tracking Merchandising Platform
echo UI Compliance Checker
echo ========================================
echo.

REM Function to display usage
if "%~1"=="--help" (
    echo [INFO] Digital Tracking Merchandising Platform - UI Compliance Checker
    echo [INFO] ================================================================
    echo.
    echo [INFO] Usage:
    echo   scripts\ui-compliance-checker.bat [commit_hash]
    echo.
    echo [INFO] Description:
    echo   This script checks for UI-related changes to ensure compliance with
    echo   the UI immutability rule. It prevents modification of existing UI
    echo   components while allowing new components and non-visual changes.
    echo.
    echo [INFO] Examples:
    echo   scripts\ui-compliance-checker.bat                    # Check against HEAD~1
    echo   scripts\ui-compliance-checker.bat HEAD~5             # Check against 5 commits ago
    echo   scripts\ui-compliance-checker.bat abc1234            # Check against specific commit
    echo.
    echo [INFO] UI Files Monitored:
    echo   - .tsx (React TypeScript components)
    echo   - .jsx (React JavaScript components)
    echo   - .css (Cascading Style Sheets)
    echo   - .scss (Sass stylesheets)
    echo   - .less (Less stylesheets)
    echo   - .styl (Stylus stylesheets)
    pause
    exit /b 0
)

REM Function to check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] git command not found
    echo Please install git to use this script.
    pause
    exit /b 1
)

REM Function to check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Not in a git repository
    echo Please run this script from within a git repository.
    pause
    exit /b 1
)

REM Function to validate commit hash
git rev-parse --verify "!COMPARE_COMMIT!" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Invalid commit hash '!COMPARE_COMMIT!'
    echo Please provide a valid commit hash or reference.
    pause
    exit /b 1
)

echo [INFO] Checking UI compliance...
echo [INFO] Comparing against: !COMPARE_COMMIT!
echo.

REM Get UI-related file changes
set "UI_CHANGES="
for /f "delims=" %%f in ('git diff --name-only "!COMPARE_COMMIT!" HEAD ^| findstr /r "\.css$ \.scss$ \.less$ \.styl$ \.tsx$ \.jsx$" ^| findstr /v "test" ^| findstr /v "__tests__" ^| findstr /v "\.test\." ^| findstr /v "\.spec\."') do (
    set "UI_CHANGES=!UI_CHANGES! %%f"
)

if not "!UI_CHANGES!"=="" (
    echo [WARNING] UI changes detected!
    echo.
    echo [WARNING] Modified UI files:
    for %%f in (!UI_CHANGES!) do (
        echo [ERROR]   - %%f
    )
    echo.
    echo [WARNING] UI Compliance Rules:
    echo   [SUCCESS] ALLOWED:
    echo     - Adding new components
    echo     - Adding new features
    echo     - Non-visual changes (logic, data, etc.)
    echo     - Test files and documentation
    echo.
    echo   [ERROR] NOT ALLOWED:
    echo     - Modifying existing component layouts
    echo     - Changing existing CSS/styling
    echo     - Altering existing UI components
    echo     - Modifying existing visual elements
    echo.
    echo [ERROR] UI IMMUTABILITY VIOLATION DETECTED!
    echo [ERROR] Please review the changes above and ensure compliance with UI rules.
    echo.
    echo [INFO] To fix this issue:
    echo   1. Revert UI-related changes
    echo   2. Create new components instead of modifying existing ones
    echo   3. Use CSS classes for styling changes
    echo   4. Ensure all changes are non-visual
    echo.
    pause
    exit /b 1
) else (
    echo [SUCCESS] No UI changes detected!
    echo.
    echo [SUCCESS] UI Compliance Status:
    echo   • No existing UI components modified
    echo   • No existing CSS/styling changed
    echo   • All changes comply with UI immutability rule
    echo.
    echo [SUCCESS] You can proceed with your commit!
    pause
    exit /b 0
) 