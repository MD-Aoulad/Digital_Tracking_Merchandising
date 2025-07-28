@echo off
setlocal enabledelayedexpansion

REM Comprehensive Test Runner Script
REM Runs all test suites for the Digital Tracking Merchandising platform

REM Test results tracking
set "TOTAL_TESTS=0"
set "PASSED_TESTS=0"
set "FAILED_TESTS=0"

echo ========================================
echo Digital Tracking Merchandising Platform
echo Comprehensive Test Runner
echo ========================================
echo.

REM Function to run a test suite
:run_test_suite
set "suite_name=%~1"
set "command=%~2"
set "directory=%~3"

echo [INFO] Running %suite_name% tests...

if not "!directory!"=="" (
    cd /d "!directory!"
)

call !command!
if errorlevel 1 (
    echo [ERROR] %suite_name% tests failed
    set /a "FAILED_TESTS+=1"
    if not "!directory!"=="" (
        cd /d "%~dp0"
    )
    exit /b 1
) else (
    echo [SUCCESS] %suite_name% tests passed
    set /a "PASSED_TESTS+=1"
)

if not "!directory!"=="" (
    cd /d "%~dp0"
)

set /a "TOTAL_TESTS+=1"
echo.
goto :eof

REM Function to check if servers are running
:check_servers
echo [INFO] Checking if servers are running...

REM Check backend server
curl -s http://localhost:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Backend server is not running on port 5000
    echo [INFO] Starting backend server...
    cd backend
    start /B npm start
    cd ..
    timeout /t 5 /nobreak >nul
) else (
    echo [SUCCESS] Backend server is running on port 5000
)

REM Check frontend server
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend server is not running on port 3000
    echo [INFO] Starting frontend server...
    start /B npm start
    timeout /t 10 /nobreak >nul
) else (
    echo [SUCCESS] Frontend server is running on port 3000
)

echo.
goto :eof

REM Function to run health checks
:run_health_checks
echo [INFO] Running health checks...

REM Check API Gateway
curl -s http://localhost:8080/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] API Gateway health check failed
    exit /b 1
) else (
    echo [SUCCESS] API Gateway health check passed
)

REM Check Auth Service
curl -s http://localhost:3010/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Auth Service health check failed
    exit /b 1
) else (
    echo [SUCCESS] Auth Service health check passed
)

REM Check Frontend
curl -s http://localhost:3000/ >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend health check failed
    exit /b 1
) else (
    echo [SUCCESS] Frontend health check passed
)

echo.
goto :eof

REM Function to run unit tests
:run_unit_tests
echo [HEADER] Running Unit Tests
echo.

REM Frontend unit tests
call :run_test_suite "Frontend Unit" "npm test -- --watchAll=false" "frontend"

REM Backend unit tests
call :run_test_suite "Backend Unit" "npm test" "backend"

REM Microservices unit tests
for /d %%d in (microservices\*) do (
    if exist "%%d\package.json" (
        call :run_test_suite "%%d Unit" "npm test" "%%d"
    )
)

goto :eof

REM Function to run integration tests
:run_integration_tests
echo [HEADER] Running Integration Tests
echo.

REM Backend integration tests
call :run_test_suite "Backend Integration" "npm run test:integration" "backend"

REM API integration tests
call :run_test_suite "API Integration" "npm run test:api" "."

goto :eof

REM Function to run end-to-end tests
:run_e2e_tests
echo [HEADER] Running End-to-End Tests
echo.

REM Cypress E2E tests
if exist "cypress" (
    call :run_test_suite "Cypress E2E" "npx cypress run" "."
)

REM Playwright E2E tests
if exist "tests\e2e" (
    call :run_test_suite "Playwright E2E" "npx playwright test" "."
)

goto :eof

REM Function to run performance tests
:run_performance_tests
echo [HEADER] Running Performance Tests
echo.

REM Load testing
if exist "tests\performance" (
    call :run_test_suite "Load Testing" "npm run test:load" "."
)

REM Memory leak testing
if exist "tests\memory" (
    call :run_test_suite "Memory Testing" "npm run test:memory" "."
)

goto :eof

REM Function to run security tests
:run_security_tests
echo [HEADER] Running Security Tests
echo.

REM Security scanning
if exist "tests\security" (
    call :run_test_suite "Security Scan" "npm run test:security" "."
)

REM Dependency vulnerability check
call :run_test_suite "Dependency Check" "npm audit --audit-level=moderate" "."

goto :eof

REM Function to run accessibility tests
:run_accessibility_tests
echo [HEADER] Running Accessibility Tests
echo.

REM Accessibility testing
if exist "tests\accessibility" (
    call :run_test_suite "Accessibility" "npm run test:a11y" "."
)

goto :eof

REM Function to display test summary
:display_summary
echo [HEADER] Test Results Summary
echo.

echo [INFO] Total Test Suites: %TOTAL_TESTS%
echo [SUCCESS] Passed: %PASSED_TESTS%
echo [ERROR] Failed: %FAILED_TESTS%

if %FAILED_TESTS% equ 0 (
    echo.
    echo [SUCCESS] All tests passed! 🎉
    echo [SUCCESS] The application is ready for deployment.
    pause
    exit /b 0
) else (
    echo.
    echo [ERROR] Some tests failed! ❌
    echo [ERROR] Please fix the failing tests before proceeding.
    pause
    exit /b 1
)

goto :eof

REM Main execution
echo [INFO] Starting comprehensive test suite...
echo.

REM Check if required tools are available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if we're in the project root
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

REM Check servers
call :check_servers

REM Run health checks
call :run_health_checks

REM Run all test types
call :run_unit_tests
call :run_integration_tests
call :run_e2e_tests
call :run_performance_tests
call :run_security_tests
call :run_accessibility_tests

REM Display summary
call :display_summary 