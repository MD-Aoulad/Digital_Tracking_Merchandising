@echo off
echo ========================================
echo Docker Service Manager for LG Gram
echo ========================================
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [INFO] Starting Docker services...
echo.

REM Stop any existing containers
echo [INFO] Stopping existing containers...
docker-compose down >nul 2>&1

REM Start all services
echo [INFO] Starting all services...
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] All services started successfully!
    echo.
    echo [INFO] Waiting for services to be ready...
    timeout /t 30 /nobreak >nul
    
    echo.
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
    echo [SUCCESS] Digital Tracking Merchandising Platform is ready!
    echo.
) else (
    echo.
    echo [ERROR] Failed to start services!
    echo.
    echo [INFO] Checking service status:
    docker-compose ps
    echo.
    echo [INFO] Checking logs:
    docker-compose logs --tail=20
    echo.
)

pause 