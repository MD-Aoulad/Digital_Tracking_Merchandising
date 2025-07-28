@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Service Discovery Manager
REM Network Engineer - Service Discovery and Registration Management

echo ========================================
echo Digital Tracking Merchandising Platform
echo Service Discovery Manager
echo ========================================
echo.

REM Configuration
set "PROJECT_NAME=digital_tracking_merchandising"
set "NETWORK_NAME=microservices-network"

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker before proceeding.
    pause
    exit /b 1
)

REM Function to list all services
:list_services
echo [HEADER] Service Discovery - All Services
echo.

echo [INFO] Registered Services:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr "%PROJECT_NAME%"

echo.
echo [INFO] Service Details:
for /f "tokens=1" %%s in ('docker ps --format "{{.Names}}" ^| findstr "%PROJECT_NAME%"') do (
    set "service=%%s"
    echo [INFO] Service: !service!
    echo [INFO]   Status: 
    docker inspect --format='{{.State.Status}}' !service!
    echo [INFO]   Health: 
    docker inspect --format='{{.State.Health.Status}}' !service! 2>nul || echo "No health check"
    echo [INFO]   Ports:
    docker port !service!
    echo.
)

goto :eof

REM Function to register a service
:register_service
set "service_name=%~1"
set "service_port=%~2"

if "!service_name!"=="" (
    echo [ERROR] Service name is required
    echo Usage: scripts\service-discovery-manager.bat register ^<service_name^> [port]
    pause
    exit /b 1
)

echo [INFO] Registering service: !service_name!

REM Check if service container exists
docker ps -a | findstr "!service_name!" >nul
if errorlevel 1 (
    echo [ERROR] Service container '!service_name!' not found
    pause
    exit /b 1
)

REM Start the service if not running
docker inspect --format='{{.State.Status}}' !service_name! | findstr "running" >nul
if errorlevel 1 (
    echo [INFO] Starting service !service_name!...
    docker-compose up -d !service_name!
)

REM Add to network if not already connected
docker network inspect %NETWORK_NAME% | findstr "!service_name!" >nul
if errorlevel 1 (
    echo [INFO] Connecting !service_name! to network %NETWORK_NAME%...
    docker network connect %NETWORK_NAME% !service_name!
)

echo [SUCCESS] Service !service_name! registered successfully!
goto :eof

REM Function to deregister a service
:deregister_service
set "service_name=%~1"

if "!service_name!"=="" (
    echo [ERROR] Service name is required
    echo Usage: scripts\service-discovery-manager.bat deregister ^<service_name^>
    pause
    exit /b 1
)

echo [INFO] Deregistering service: !service_name!

REM Stop the service
docker-compose stop !service_name!

REM Remove from network
docker network disconnect %NETWORK_NAME% !service_name! 2>nul

echo [SUCCESS] Service !service_name! deregistered successfully!
goto :eof

REM Function to check service health
:check_health
echo [HEADER] Service Health Check
echo.

set "unhealthy_services=0"

for /f "tokens=1" %%s in ('docker ps --format "{{.Names}}" ^| findstr "%PROJECT_NAME%"') do (
    set "service=%%s"
    
    echo [INFO] Checking !service!...
    
    REM Check if container is running
    docker inspect --format='{{.State.Status}}' !service! | findstr "running" >nul
    if errorlevel 1 (
        echo [ERROR] !service!: Not running
        set /a "unhealthy_services+=1"
    ) else (
        REM Check health status
        docker inspect --format='{{.State.Health.Status}}' !service! 2>nul | findstr "healthy" >nul
        if errorlevel 1 (
            echo [WARNING] !service!: Running but not healthy
            set /a "unhealthy_services+=1"
        ) else (
            echo [SUCCESS] !service!: Healthy
        )
    )
    echo.
)

if %unhealthy_services% equ 0 (
    echo [SUCCESS] All services are healthy!
) else (
    echo [WARNING] Found %unhealthy_services% unhealthy services
)

goto :eof

REM Function to restart all services
:restart_all
echo [INFO] Restarting all services...

docker-compose restart

echo [SUCCESS] All services restarted!
goto :eof

REM Function to show service endpoints
:show_endpoints
echo [HEADER] Service Endpoints
echo.

echo [INFO] Available Service Endpoints:
echo.
echo [INFO] Web Services:
echo   Frontend: http://localhost:3000
echo   API Gateway: http://localhost:8080
echo   Auth Service: http://localhost:3010
echo   User Service: http://localhost:3002
echo   Todo Service: http://localhost:3005
echo   Chat Service: http://localhost:3003
echo   Attendance Service: http://localhost:3007
echo   Report Service: http://localhost:3006
echo   Approval Service: http://localhost:3011
echo   Workplace Service: http://localhost:3008
echo   Notification Service: http://localhost:3009
echo.
echo [INFO] Monitoring:
echo   Grafana: http://localhost:3002
echo   Prometheus: http://localhost:9090
echo.
echo [INFO] Mobile:
echo   Mobile App: http://localhost:3003
echo   Expo Dev: http://localhost:19001
echo   Expo Metro: http://localhost:19002
echo.
echo [INFO] Database:
echo   PostgreSQL: localhost:5432
echo   Redis: localhost:6379

goto :eof

REM Main execution
set "action=%~1"
set "param1=%~2"
set "param2=%~3"

if "!action!"=="" (
    echo [INFO] Available actions:
    echo   list              - List all services
    echo   register ^<service^> [port] - Register a service
    echo   deregister ^<service^>      - Deregister a service
    echo   health            - Check service health
    echo   restart           - Restart all services
    echo   endpoints         - Show service endpoints
    echo.
    echo [INFO] Usage: scripts\service-discovery-manager.bat [action] [parameters]
    pause
    exit /b 0
)

if /i "!action!"=="list" (
    call :list_services
) else if /i "!action!"=="register" (
    call :register_service "!param1!" "!param2!"
) else if /i "!action!"=="deregister" (
    call :deregister_service "!param1!"
) else if /i "!action!"=="health" (
    call :check_health
) else if /i "!action!"=="restart" (
    call :restart_all
) else if /i "!action!"=="endpoints" (
    call :show_endpoints
) else (
    echo [ERROR] Unknown action: !action!
    echo [INFO] Run without parameters to see available actions.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Service discovery operation completed!
pause
exit /b 0 