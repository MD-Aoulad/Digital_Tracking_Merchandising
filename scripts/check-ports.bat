@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Port Availability Checker
REM This script MUST be run before starting any development work
REM Usage: scripts\check-ports.bat

echo ========================================
echo Digital Tracking Merchandising Platform
echo Port Availability Checker
echo ========================================
echo.

REM Service ports mapping
set "SERVICE_PORTS=frontend:3000 api-gateway:8080 auth-service:3010 user-service:3002 todo-service:3005 chat-service:3003 notification-service:3009 approval-service:3011 report-service:3006 attendance-service:3007 workplace-service:3008 mobile-expo:3003 mobile-expo-dev:19001 mobile-expo-metro:19002 database:5432 redis:6379 prometheus:9090 grafana:3002"

REM Check if netstat is available
netstat >nul 2>&1
if errorlevel 1 (
    echo [ERROR] netstat command not found. This script requires Windows networking tools.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker is not running. Please start Docker before proceeding.
    echo.
)

echo [INFO] Checking port availability for all services...
echo.

REM Track issues
set "ISSUES_FOUND=0"
set "BUSY_PORTS="

REM Check each service port
for %%s in (%SERVICE_PORTS%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set "service=%%a"
        set "port=%%b"
        
        REM Check if port is in use
        netstat -an | findstr ":!port! " | findstr "LISTENING" >nul
        if !errorlevel! equ 0 (
            REM Check if it's our Docker containers (which is expected)
            netstat -an | findstr ":!port! " | findstr "LISTENING" | findstr "Docker" >nul
            if !errorlevel! equ 0 (
                echo [SUCCESS] !service! (port !port!): RUNNING (Docker)
            ) else (
                echo [ERROR] !service! (port !port!): CONFLICT
                
                REM Get process details
                echo [INFO] Process details:
                netstat -ano | findstr ":!port! " | findstr "LISTENING"
                
                set /a "ISSUES_FOUND+=1"
                set "BUSY_PORTS=!BUSY_PORTS! !port!"
            )
        ) else (
            echo [SUCCESS] !service! (port !port!): AVAILABLE
        )
    )
)

echo.
echo ========================================

REM Summary
if %ISSUES_FOUND% equ 0 (
    echo [SUCCESS] All ports are properly configured! System is running correctly.
    echo.
    echo [SUCCESS] Services Status:
    echo • All required services are running on correct ports
    echo • No port conflicts detected
    echo • System is ready for development
    echo.
    echo [SUCCESS] Next steps:
    echo 1. Continue with your development work
    echo 2. Monitor services: docker-compose ps
    echo 3. Check logs if needed: docker-compose logs -f
    exit /b 0
) else (
    echo [ERROR] Found %ISSUES_FOUND% port conflict(s)!
    echo.
    echo [WARNING] Conflicting ports: %BUSY_PORTS%
    echo.
    echo [WARNING] To resolve port conflicts:
    echo 1. Stop the conflicting processes:
    for %%p in (%BUSY_PORTS%) do (
        echo    scripts\port-killer.bat %%p
    )
    echo.
    echo 2. Or stop all Docker containers:
    echo    docker-compose down
    echo.
    echo 3. Or stop specific services:
    echo    docker stop ^<container_name^>
    echo.
    echo [WARNING] After resolving conflicts, run this script again to verify.
    exit /b 1
) 