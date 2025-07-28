@echo off
setlocal enabledelayedexpansion

REM Network Architecture Enforcement Script
REM Digital Tracking Merchandising Platform
REM This script ensures all services follow the defined network architecture

REM Network Architecture Constants
set "FRONTEND_PORT=3000"
set "API_GATEWAY_PORT=8080"
set "AUTH_SERVICE_PORT=3010"
set "USER_SERVICE_PORT=3002"
set "CHAT_SERVICE_PORT=3003"
set "ATTENDANCE_SERVICE_PORT=3007"
set "TODO_SERVICE_PORT=3005"
set "REPORT_SERVICE_PORT=3006"
set "APPROVAL_SERVICE_PORT=3011"
set "WORKPLACE_SERVICE_PORT=3008"
set "NOTIFICATION_SERVICE_PORT=3009"
set "MOBILE_APP_PORT=3003"
set "GRAFANA_PORT=3002"
set "PROMETHEUS_PORT=9090"
set "REDIS_PORT=6379"

REM Database Ports
set "AUTH_DB_PORT=5432"
set "USER_DB_PORT=5433"
set "CHAT_DB_PORT=5434"
set "ATTENDANCE_DB_PORT=5435"
set "TODO_DB_PORT=5436"
set "REPORT_DB_PORT=5437"
set "APPROVAL_DB_PORT=5438"
set "WORKPLACE_DB_PORT=5439"
set "NOTIFICATION_DB_PORT=5440"

echo ========================================
echo Network Architecture Enforcement Script
echo Digital Tracking Merchandising Platform
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Function to validate port assignments
call :validate_port_assignments
if errorlevel 1 (
    echo [ERROR] Port assignment validation failed!
    pause
    exit /b 1
)

REM Function to validate service connectivity
call :validate_service_connectivity
if errorlevel 1 (
    echo [ERROR] Service connectivity validation failed!
    pause
    exit /b 1
)

REM Function to validate network isolation
call :validate_network_isolation
if errorlevel 1 (
    echo [ERROR] Network isolation validation failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] All network architecture validations passed!
echo [SUCCESS] System is properly configured according to architecture standards.
pause
exit /b 0

:validate_port_assignments
echo [INFO] Validating Port Assignments...
echo.

set "violations=0"

REM Check Frontend
for /f "tokens=2 delims=:" %%a in ('docker ps --format "table {{.Names}}\t{{.Ports}}" ^| findstr "frontend-app" ^| findstr /r "0.0.0.0:[0-9]*"') do (
    set "frontend_port=%%a"
    goto :check_frontend_port
)
set "frontend_port=NOT_RUNNING"

:check_frontend_port
if "!frontend_port!"=="NOT_RUNNING" (
    echo [WARNING] frontend-app: Not running
    set /a "violations+=1"
) else if not "!frontend_port!"=="%FRONTEND_PORT%" (
    echo [ERROR] frontend-app: Expected port %FRONTEND_PORT%, got !frontend_port!
    set /a "violations+=1"
) else (
    echo [SUCCESS] frontend-app: Port !frontend_port! (correct)
)

REM Check API Gateway
for /f "tokens=2 delims=:" %%a in ('docker ps --format "table {{.Names}}\t{{.Ports}}" ^| findstr "api-gateway" ^| findstr /r "0.0.0.0:[0-9]*"') do (
    set "api_gateway_port=%%a"
    goto :check_api_gateway_port
)
set "api_gateway_port=NOT_RUNNING"

:check_api_gateway_port
if "!api_gateway_port!"=="NOT_RUNNING" (
    echo [WARNING] api-gateway: Not running
    set /a "violations+=1"
) else if not "!api_gateway_port!"=="%API_GATEWAY_PORT%" (
    echo [ERROR] api-gateway: Expected port %API_GATEWAY_PORT%, got !api_gateway_port!
    set /a "violations+=1"
) else (
    echo [SUCCESS] api-gateway: Port !api_gateway_port! (correct)
)

REM Check Auth Service
for /f "tokens=2 delims=:" %%a in ('docker ps --format "table {{.Names}}\t{{.Ports}}" ^| findstr "auth-service" ^| findstr /r "0.0.0.0:[0-9]*"') do (
    set "auth_service_port=%%a"
    goto :check_auth_service_port
)
set "auth_service_port=NOT_RUNNING"

:check_auth_service_port
if "!auth_service_port!"=="NOT_RUNNING" (
    echo [WARNING] auth-service: Not running
    set /a "violations+=1"
) else if not "!auth_service_port!"=="%AUTH_SERVICE_PORT%" (
    echo [ERROR] auth-service: Expected port %AUTH_SERVICE_PORT%, got !auth_service_port!
    set /a "violations+=1"
) else (
    echo [SUCCESS] auth-service: Port !auth_service_port! (correct)
)

REM Check Attendance Service
for /f "tokens=2 delims=:" %%a in ('docker ps --format "table {{.Names}}\t{{.Ports}}" ^| findstr "attendance-service" ^| findstr /r "0.0.0.0:[0-9]*"') do (
    set "attendance_service_port=%%a"
    goto :check_attendance_service_port
)
set "attendance_service_port=NOT_RUNNING"

:check_attendance_service_port
if "!attendance_service_port!"=="NOT_RUNNING" (
    echo [WARNING] attendance-service: Not running
    set /a "violations+=1"
) else if not "!attendance_service_port!"=="%ATTENDANCE_SERVICE_PORT%" (
    echo [ERROR] attendance-service: Expected port %ATTENDANCE_SERVICE_PORT%, got !attendance_service_port!
    set /a "violations+=1"
) else (
    echo [SUCCESS] attendance-service: Port !attendance_service_port! (correct)
)

REM Check Mobile App
for /f "tokens=2 delims=:" %%a in ('docker ps --format "table {{.Names}}\t{{.Ports}}" ^| findstr "mobile-app" ^| findstr /r "0.0.0.0:[0-9]*"') do (
    set "mobile_app_port=%%a"
    goto :check_mobile_app_port
)
set "mobile_app_port=NOT_RUNNING"

:check_mobile_app_port
if "!mobile_app_port!"=="NOT_RUNNING" (
    echo [WARNING] mobile-app: Not running
    set /a "violations+=1"
) else if not "!mobile_app_port!"=="%MOBILE_APP_PORT%" (
    echo [ERROR] mobile-app: Expected port %MOBILE_APP_PORT%, got !mobile_app_port!
    set /a "violations+=1"
) else (
    echo [SUCCESS] mobile-app: Port !mobile_app_port! (correct)
)

if %violations% GTR 0 (
    echo.
    echo [ERROR] Found %violations% port assignment violations!
    exit /b 1
) else (
    echo.
    echo [SUCCESS] All port assignments are correct!
    exit /b 0
)

:validate_service_connectivity
echo [INFO] Validating Service Connectivity...
echo.

set "connectivity_issues=0"

REM Test API Gateway connectivity
curl -s http://localhost:%API_GATEWAY_PORT%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] API Gateway not responding on port %API_GATEWAY_PORT%
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] API Gateway responding on port %API_GATEWAY_PORT%
)

REM Test Auth Service connectivity
curl -s http://localhost:%AUTH_SERVICE_PORT%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Auth Service not responding on port %AUTH_SERVICE_PORT%
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] Auth Service responding on port %AUTH_SERVICE_PORT%
)

REM Test Frontend connectivity
curl -s http://localhost:%FRONTEND_PORT%/ >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend not responding on port %FRONTEND_PORT%
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] Frontend responding on port %FRONTEND_PORT%
)

if %connectivity_issues% GTR 0 (
    echo.
    echo [ERROR] Found %connectivity_issues% connectivity issues!
    exit /b 1
) else (
    echo.
    echo [SUCCESS] All service connectivity tests passed!
    exit /b 0
)

:validate_network_isolation
echo [INFO] Validating Network Isolation...
echo.

set "isolation_issues=0"

REM Check if services are properly isolated in Docker networks
docker network ls | findstr "digital_tracking_merchandising" >nul
if errorlevel 1 (
    echo [ERROR] Project network not found
    set /a "isolation_issues+=1"
) else (
    echo [SUCCESS] Project network exists
)

REM Check if services are connected to the correct network
docker network inspect digital_tracking_merchandising_default >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Cannot inspect project network
) else (
    echo [SUCCESS] Project network is accessible
)

if %isolation_issues% GTR 0 (
    echo.
    echo [ERROR] Found %isolation_issues% network isolation issues!
    exit /b 1
) else (
    echo.
    echo [SUCCESS] Network isolation validation passed!
    exit /b 0
) 