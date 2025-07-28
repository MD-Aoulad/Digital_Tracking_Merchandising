@echo off
setlocal enabledelayedexpansion

REM Brand Website Docker Startup Script for Windows
REM This script will build and run the brand website in Docker

echo 🚀 Starting Brand Website Docker Deployment...

REM Check if Docker is running
echo [INFO] Checking Docker installation...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo [SUCCESS] Docker is running

REM Stop existing container if running
echo [INFO] Checking for existing brand-website container...
docker ps -q -f name=brand-website >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Found existing brand-website container. Stopping it...
    docker stop brand-website
    docker rm brand-website
    echo [SUCCESS] Existing container stopped and removed
) else (
    echo [INFO] No existing container found
)

REM Build Docker image
echo [INFO] Building Docker image...
docker build -t brand-website:latest .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker image
    pause
    exit /b 1
)
echo [SUCCESS] Docker image built successfully

REM Run Docker container
echo [INFO] Starting brand-website container...
docker run -d --name brand-website -p 3013:3013 --restart unless-stopped brand-website:latest
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start container
    pause
    exit /b 1
)
echo [SUCCESS] Container started successfully

REM Check container health
echo [INFO] Checking container health...
timeout /t 5 /nobreak >nul

docker ps -q -f name=brand-website >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Container is running
    
    REM Test website accessibility
    echo [INFO] Testing website accessibility...
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3013' -UseBasicParsing | Out-Null; Write-Host '[SUCCESS] Website is accessible at http://localhost:3013' } catch { Write-Host '[WARNING] Website might take a moment to start. Please check http://localhost:3013' }"
) else (
    echo [ERROR] Container failed to start
    docker logs brand-website
    pause
    exit /b 1
)

REM Show container status
echo.
echo [INFO] Container status:
docker ps -f name=brand-website

echo.
echo [INFO] Container logs:
docker logs brand-website --tail 10

echo.
echo 🎉 Brand Website is now running!
echo.
echo 📱 Access your website at: http://localhost:3013
echo 🐳 Container name: brand-website
echo 📊 View logs: docker logs brand-website
echo 🛑 Stop container: docker stop brand-website
echo 🔄 Restart container: docker restart brand-website
echo.
pause 