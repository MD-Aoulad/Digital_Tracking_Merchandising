@echo off
setlocal enabledelayedexpansion

REM Complete Microservices Startup Script for Windows
REM This script will start ALL microservices including the brand website

echo 🚀 Starting ALL Microservices Docker Deployment...
echo.

REM Check if Docker is running
echo [INFO] Checking Docker installation...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo [SUCCESS] Docker is running
echo.

REM Stop any existing containers
echo [INFO] Stopping existing containers...
docker-compose down
echo [SUCCESS] Existing containers stopped
echo.

REM Start all microservices using docker-compose
echo [INFO] Starting ALL microservices...
echo.
echo 📋 Starting the following microservices:
echo    • API Gateway (Port 8080)
echo    • Auth Service (Port 3010)
echo    • User Service (Port 3002)
echo    • Chat Service (Port 3003)
echo    • Attendance Service (Port 3007)
echo    • Todo Service (Port 3005)
echo    • Report Service (Port 3006)
echo    • Approval Service (Port 3011)
echo    • Workplace Service (Port 3008)
echo    • Notification Service (Port 3009)
echo    • Brand Website (Port 3013)
echo    • PostgreSQL Databases
echo    • Redis Cache
echo.

docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start microservices
    pause
    exit /b 1
)
echo [SUCCESS] All microservices started
echo.

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service status
echo [INFO] Checking service status...
docker-compose ps
echo.

REM Show running containers
echo [INFO] All running containers:
docker ps
echo.

REM Test key services
echo [INFO] Testing key services...
echo.

REM Test API Gateway
echo [TEST] API Gateway (http://localhost:8080)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080/health' -UseBasicParsing | Out-Null; Write-Host '[SUCCESS] API Gateway is accessible' } catch { Write-Host '[WARNING] API Gateway might take a moment to start' }"

REM Test Brand Website
echo [TEST] Brand Website (http://localhost:3013)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3013' -UseBasicParsing | Out-Null; Write-Host '[SUCCESS] Brand Website is accessible' } catch { Write-Host '[WARNING] Brand Website might take a moment to start' }"

echo.
echo 🎉 ALL Microservices are now running!
echo.
echo 📱 Access Points:
echo    • API Gateway: http://localhost:8080
echo    • Brand Website: http://localhost:3013
echo    • Auth Service: http://localhost:3010
echo    • User Service: http://localhost:3002
echo    • Chat Service: http://localhost:3003
echo    • Attendance Service: http://localhost:3007
echo    • Todo Service: http://localhost:3005
echo    • Report Service: http://localhost:3006
echo    • Approval Service: http://localhost:3011
echo    • Workplace Service: http://localhost:3008
echo    • Notification Service: http://localhost:3009
echo.
echo 🐳 Management Commands:
echo    • View all services: docker-compose ps
echo    • View logs: docker-compose logs -f
echo    • Stop all services: docker-compose down
echo    • Restart all services: docker-compose restart
echo.
echo 📊 Monitor Services:
echo    • Container status: docker ps
echo    • Service logs: docker-compose logs [service-name]
echo    • Health checks: docker-compose ps
echo.
pause 