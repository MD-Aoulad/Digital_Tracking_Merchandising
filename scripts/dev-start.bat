@echo off
setlocal enabledelayedexpansion

REM Simple Development Startup Script
REM Quick start for development environment

echo ========================================
echo Digital Tracking Merchandising Platform
echo Development Startup
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [INFO] Starting development environment...
echo.

REM Start all services
docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Development environment started!
echo.
echo [INFO] Service URLs:
echo Frontend: http://localhost:3000
echo API Gateway: http://localhost:8080
echo Auth Service: http://localhost:3010
echo.
echo [INFO] To stop services: docker-compose down
echo [INFO] To view logs: docker-compose logs -f
echo.

pause 