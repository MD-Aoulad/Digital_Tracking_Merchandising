@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Load Balancer Manager
REM Network Engineer - Load Balancing and Traffic Management

echo ========================================
echo Digital Tracking Merchandising Platform
echo Load Balancer Manager
echo ========================================
echo.

REM Configuration
set "PROJECT_NAME=digital_tracking_merchandising"
set "NGINX_CONF=nginx\nginx.conf"
set "LOAD_BALANCER_PORT=80"

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker before proceeding.
    pause
    exit /b 1
)

REM Function to check load balancer status
:check_status
echo [HEADER] Load Balancer Status
echo.

REM Check if nginx container is running
docker ps | findstr "nginx" >nul
if errorlevel 1 (
    echo [WARNING] Nginx load balancer is not running
) else (
    echo [SUCCESS] Nginx load balancer is running
    docker ps | findstr "nginx"
)

REM Check load balancer port
netstat -an | findstr ":%LOAD_BALANCER_PORT% " | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [WARNING] Load balancer not listening on port %LOAD_BALANCER_PORT%
) else (
    echo [SUCCESS] Load balancer listening on port %LOAD_BALANCER_PORT%
)

REM Check nginx configuration
if exist "%NGINX_CONF%" (
    echo [SUCCESS] Nginx configuration file found
) else (
    echo [ERROR] Nginx configuration file not found: %NGINX_CONF%
)

goto :eof

REM Function to start load balancer
:start_load_balancer
echo [INFO] Starting load balancer...

REM Check if nginx configuration exists
if not exist "%NGINX_CONF%" (
    echo [ERROR] Nginx configuration file not found: %NGINX_CONF%
    pause
    exit /b 1
)

REM Start nginx container
docker-compose up -d nginx

if errorlevel 1 (
    echo [ERROR] Failed to start load balancer
    pause
    exit /b 1
)

echo [SUCCESS] Load balancer started successfully!
goto :eof

REM Function to stop load balancer
:stop_load_balancer
echo [INFO] Stopping load balancer...

docker-compose stop nginx

echo [SUCCESS] Load balancer stopped!
goto :eof

REM Function to restart load balancer
:restart_load_balancer
echo [INFO] Restarting load balancer...

docker-compose restart nginx

echo [SUCCESS] Load balancer restarted!
goto :eof

REM Function to reload configuration
:reload_config
echo [INFO] Reloading load balancer configuration...

REM Test nginx configuration
docker exec nginx nginx -t
if errorlevel 1 (
    echo [ERROR] Nginx configuration test failed
    pause
    exit /b 1
)

REM Reload nginx configuration
docker exec nginx nginx -s reload

echo [SUCCESS] Load balancer configuration reloaded!
goto :eof

REM Function to show backend servers
:show_backends
echo [HEADER] Backend Server Status
echo.

echo [INFO] Checking backend server health...

set "backend_servers=api-gateway:8080 auth-service:3010 frontend:3000"

for %%s in (%backend_servers%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set "server=%%a"
        set "port=%%b"
        
        echo [INFO] Checking %%server on port !port!...
        
        REM Check if server is responding
        curl -s http://localhost:!port!/health >nul 2>&1
        if errorlevel 1 (
            echo [ERROR] %%server: Not responding
        ) else (
            echo [SUCCESS] %%server: Responding
        )
    )
)

goto :eof

REM Function to test load balancing
:test_load_balancing
echo [HEADER] Load Balancing Test
echo.

echo [INFO] Testing load balancer distribution...

REM Test multiple requests to see load distribution
for /l %%i in (1,1,5) do (
    echo [INFO] Request %%i:
    curl -s http://localhost:%LOAD_BALANCER_PORT%/api/health
    echo.
    timeout /t 1 /nobreak >nul
)

echo [SUCCESS] Load balancing test completed!
goto :eof

REM Function to show traffic statistics
:show_stats
echo [HEADER] Traffic Statistics
echo.

REM Get nginx access logs
echo [INFO] Recent access logs:
docker exec nginx tail -10 /var/log/nginx/access.log 2>nul || echo "No access logs available"

echo.
echo [INFO] Recent error logs:
docker exec nginx tail -10 /var/log/nginx/error.log 2>nul || echo "No error logs available"

goto :eof

REM Function to configure load balancing
:configure_load_balancing
echo [HEADER] Load Balancer Configuration
echo.

echo [INFO] Current configuration file: %NGINX_CONF%
echo [INFO] Available configuration options:
echo.
echo   1. Round Robin (default)
echo   2. Least Connections
echo   3. IP Hash
echo   4. Weighted Round Robin
echo.
echo [INFO] To modify load balancing algorithm, edit %NGINX_CONF%
echo [INFO] Then run: scripts\load-balancer-manager.bat reload

goto :eof

REM Main execution
set "action=%~1"

if "!action!"=="" (
    echo [INFO] Available actions:
    echo   status    - Check load balancer status
    echo   start     - Start load balancer
    echo   stop      - Stop load balancer
    echo   restart   - Restart load balancer
    echo   reload    - Reload configuration
    echo   backends  - Show backend server status
    echo   test      - Test load balancing
    echo   stats     - Show traffic statistics
    echo   config    - Show configuration options
    echo.
    echo [INFO] Usage: scripts\load-balancer-manager.bat [action]
    pause
    exit /b 0
)

if /i "!action!"=="status" (
    call :check_status
) else if /i "!action!"=="start" (
    call :start_load_balancer
) else if /i "!action!"=="stop" (
    call :stop_load_balancer
) else if /i "!action!"=="restart" (
    call :restart_load_balancer
) else if /i "!action!"=="reload" (
    call :reload_config
) else if /i "!action!"=="backends" (
    call :show_backends
) else if /i "!action!"=="test" (
    call :test_load_balancing
) else if /i "!action!"=="stats" (
    call :show_stats
) else if /i "!action!"=="config" (
    call :configure_load_balancing
) else (
    echo [ERROR] Unknown action: !action!
    echo [INFO] Run without parameters to see available actions.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Load balancer operation completed!
pause
exit /b 0 