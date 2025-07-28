@echo off
setlocal enabledelayedexpansion

REM Docker Service Manager for Digital Tracking Merchandising Platform
REM Senior DevOps Engineer - Microservices Management Script

REM Configuration
set "COMPOSE_FILE=docker-compose.yml"
set "PROJECT_NAME=digital_tracking_merchandising"
set "API_GATEWAY_PORT=8080"
set "AUTH_SERVICE_PORT=3010"
set "FRONTEND_PORT=3000"
set "MOBILE_PORT=3003"
set "GRAFANA_PORT=3002"

REM Check if docker-compose.yml exists
if not exist "%COMPOSE_FILE%" (
    echo [ERROR] %COMPOSE_FILE% not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Parse command line arguments
set "COMMAND=%~1"
set "SERVICE=%~2"

if "%COMMAND%"=="" (
    call :show_usage
    pause
    exit /b 1
)

REM Execute command
if /i "%COMMAND%"=="start" (
    call :start_services
) else if /i "%COMMAND%"=="stop" (
    call :stop_services
) else if /i "%COMMAND%"=="restart" (
    call :restart_services
) else if /i "%COMMAND%"=="status" (
    call :show_status
) else if /i "%COMMAND%"=="logs" (
    call :show_logs
) else if /i "%COMMAND%"=="cleanup" (
    call :cleanup
) else if /i "%COMMAND%"=="health" (
    call :health_check
) else if /i "%COMMAND%"=="ports" (
    call :check_ports
) else (
    echo [ERROR] Unknown command: %COMMAND%
    call :show_usage
    pause
    exit /b 1
)

pause
exit /b 0

:show_usage
echo ========================================
echo Docker Service Manager
echo Digital Tracking Merchandising Platform
echo ========================================
echo.
echo [INFO] Usage: scripts\docker-service-manager.bat ^<command^> [service]
echo.
echo [INFO] Commands:
echo   start     - Start all services
echo   stop      - Stop all services
echo   restart   - Restart all services
echo   status    - Show service status
echo   logs      - Show service logs
echo   cleanup   - Clean up containers and networks
echo   health    - Check service health
echo   ports     - Check port availability
echo.
echo [INFO] Examples:
echo   scripts\docker-service-manager.bat start
echo   scripts\docker-service-manager.bat status
echo   scripts\docker-service-manager.bat logs frontend
echo   scripts\docker-service-manager.bat restart auth-service
echo.
exit /b 0

:check_ports
echo [INFO] Checking port availability...
echo.

set "ports=%API_GATEWAY_PORT% %AUTH_SERVICE_PORT% %FRONTEND_PORT% %MOBILE_PORT% %GRAFANA_PORT% 5432 5433 5434 5435 5436 5437 5438 5439 5440 6379 9090"

for %%p in (%ports%) do (
    netstat -an | findstr ":%%p " | findstr "LISTENING" >nul
    if errorlevel 1 (
        echo [SUCCESS] Port %%p is available
    ) else (
        echo [WARNING] Port %%p is already in use
    )
)
echo.
exit /b 0

:cleanup
echo [INFO] Cleaning up existing containers...
echo.

docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% down >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No existing containers to stop
) else (
    echo [SUCCESS] Existing containers stopped
)

REM Remove dangling containers and networks
docker system prune -f >nul 2>&1
echo [SUCCESS] System cleanup completed
echo.
exit /b 0

:start_services
echo [INFO] Starting Docker services...
echo.

REM Stop any existing containers first
call :cleanup

REM Start all services
echo [INFO] Starting all services...
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services!
    echo.
    echo [INFO] Checking service status:
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% ps
    echo.
    echo [INFO] Checking logs:
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs --tail=20
    echo.
    exit /b 1
)

echo.
echo [SUCCESS] All services started successfully!
echo.
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo.
echo [INFO] Service Status:
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% ps

echo.
echo [INFO] Service URLs:
echo API Gateway: http://localhost:%API_GATEWAY_PORT%
echo Auth Service: http://localhost:%AUTH_SERVICE_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%
echo Mobile App: http://localhost:%MOBILE_PORT%
echo Grafana: http://localhost:%GRAFANA_PORT%
echo Prometheus: http://localhost:9090

echo.
echo [SUCCESS] Digital Tracking Merchandising Platform is ready!
echo.
exit /b 0

:stop_services
echo [INFO] Stopping Docker services...
echo.

docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% down

if errorlevel 1 (
    echo [WARNING] No services to stop
) else (
    echo [SUCCESS] All services stopped
)
echo.
exit /b 0

:restart_services
echo [INFO] Restarting Docker services...
echo.

call :stop_services
call :start_services
exit /b 0

:show_status
echo [INFO] Service Status:
echo.
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% ps
echo.
exit /b 0

:show_logs
if "%SERVICE%"=="" (
    echo [INFO] Showing logs for all services:
    echo.
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs --tail=50
) else (
    echo [INFO] Showing logs for %SERVICE%:
    echo.
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs --tail=50 %SERVICE%
)
echo.
exit /b 0

:health_check
echo [INFO] Checking service health...
echo.

REM Check if services are running
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] No services are running
    exit /b 1
)

REM Check API Gateway
curl -s http://localhost:%API_GATEWAY_PORT%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] API Gateway not responding
) else (
    echo [SUCCESS] API Gateway is healthy
)

REM Check Auth Service
curl -s http://localhost:%AUTH_SERVICE_PORT%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Auth Service not responding
) else (
    echo [SUCCESS] Auth Service is healthy
)

REM Check Frontend
curl -s http://localhost:%FRONTEND_PORT%/ >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend not responding
) else (
    echo [SUCCESS] Frontend is healthy
)

echo.
echo [SUCCESS] Health check completed
echo.
exit /b 0 