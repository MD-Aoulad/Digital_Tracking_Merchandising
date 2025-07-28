@echo off
setlocal enabledelayedexpansion

REM Complete Microservices Stop Script for Windows
REM This script will stop ALL microservices

echo 🛑 Stopping ALL Microservices...
echo.

REM Check if Docker is running
echo [INFO] Checking Docker installation...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running.
    pause
    exit /b 1
)
echo [SUCCESS] Docker is running
echo.

REM Stop all microservices using docker-compose
echo [INFO] Stopping all microservices...
docker-compose down
if %errorlevel% neq 0 (
    echo [WARNING] Some services might not have been running
) else (
    echo [SUCCESS] All microservices stopped
)
echo.

REM Stop any remaining containers
echo [INFO] Stopping any remaining containers...
docker stop $(docker ps -q) 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] All containers stopped
) else (
    echo [INFO] No containers were running
)
echo.

REM Remove stopped containers
echo [INFO] Cleaning up stopped containers...
docker container prune -f
echo [SUCCESS] Cleanup completed
echo.

REM Show final status
echo [INFO] Final container status:
docker ps
echo.

echo 🎉 ALL Microservices have been stopped!
echo.
echo 📋 Stopped Services:
echo    • API Gateway
echo    • Auth Service
echo    • User Service
echo    • Chat Service
echo    • Attendance Service
echo    • Todo Service
echo    • Report Service
echo    • Approval Service
echo    • Workplace Service
echo    • Notification Service
echo    • Brand Website
echo    • PostgreSQL Databases
echo    • Redis Cache
echo.
echo 🚀 To restart all services, run: start-all-microservices.bat
echo.
pause 