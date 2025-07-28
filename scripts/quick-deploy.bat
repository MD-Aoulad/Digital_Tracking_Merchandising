@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Quick Deploy Script
REM Rapid deployment script for development and testing environments

echo ========================================
echo Digital Tracking Merchandising Platform
echo Quick Deploy Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker before proceeding.
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

echo [INFO] Starting quick deployment...
echo.

REM Stop any existing containers
echo [INFO] Stopping existing containers...
docker-compose down >nul 2>&1

REM Clean up Docker system
echo [INFO] Cleaning up Docker system...
docker system prune -f >nul 2>&1

REM Build and start all services
echo [INFO] Building and starting all services...
docker-compose up -d --build

if errorlevel 1 (
    echo [ERROR] Failed to start services!
    echo.
    echo [INFO] Checking service status:
    docker-compose ps
    echo.
    echo [INFO] Checking logs:
    docker-compose logs --tail=20
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Services started successfully!
echo.

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
echo [INFO] Service Status:
docker-compose ps

echo.
echo [INFO] Service URLs:
echo API Gateway: http://localhost:8080
echo Auth Service: http://localhost:3010
echo Frontend: http://localhost:3000
echo Mobile App: http://localhost:3003
echo Grafana: http://localhost:3002
echo Prometheus: http://localhost:9090

echo.
echo [SUCCESS] Quick deployment completed!
echo [SUCCESS] Digital Tracking Merchandising Platform is ready!
echo.

pause 