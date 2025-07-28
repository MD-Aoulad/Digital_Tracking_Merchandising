@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Network Troubleshooter
REM Network Engineer - Automated Network Troubleshooting Script
REM Usage: scripts\network-troubleshooter.bat [issue] [options]

REM Configuration
set "PROJECT_NAME=digital_tracking_merchandising"
set "NETWORK_NAME=microservices-network"
set "LOG_FILE=%TEMP%\network-troubleshooting.log"

REM Check if issue type is provided
set "ISSUE_TYPE=%~1"
if "!ISSUE_TYPE!"=="" (
    set "ISSUE_TYPE=all"
)

echo ========================================
echo Digital Tracking Merchandising Platform
echo Network Troubleshooter
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker before proceeding.
    pause
    exit /b 1
)

REM Function to troubleshoot port conflicts
:troubleshoot_port_conflicts
echo [HEADER] Port Conflict Troubleshooting
echo.

set "problematic_ports=5432 3001 8080 3000"
set "conflicts_found=0"

for %%p in (%problematic_ports%) do (
    echo [INFO] Checking port %%p...
    
    netstat -an | findstr ":%%p " | findstr "LISTENING" >nul
    if errorlevel 1 (
        echo [SUCCESS] Port %%p is available
    ) else (
        echo [WARNING] Port %%p is in use
        
        REM Get process details
        echo [INFO] Process details:
        netstat -ano | findstr ":%%p " | findstr "LISTENING"
        
        REM Suggest resolution
        echo [INFO] Resolution:
        echo   To kill processes: scripts\port-killer.bat %%p
        echo   Or manually: taskkill /PID ^<PID^> /F
        
        set /a "conflicts_found+=1"
    )
    echo.
)

if %conflicts_found% equ 0 (
    echo [SUCCESS] No port conflicts detected
) else (
    echo [WARNING] Found %conflicts_found% port conflict(s)
    echo [INFO] Logged to: %LOG_FILE%
)

goto :eof

REM Function to troubleshoot Docker network issues
:troubleshoot_docker_network
echo [HEADER] Docker Network Troubleshooting
echo.

echo [INFO] Checking Docker network status...

REM Check if network exists
docker network ls | findstr "%NETWORK_NAME%" >nul
if errorlevel 1 (
    echo [ERROR] Network '%NETWORK_NAME%' does not exist
    echo [INFO] Creating network...
    docker network create %NETWORK_NAME%
    if errorlevel 1 (
        echo [ERROR] Failed to create network
    ) else (
        echo [SUCCESS] Network created successfully
    )
) else (
    echo [SUCCESS] Network '%NETWORK_NAME%' exists
)

REM Check network connectivity
echo [INFO] Testing network connectivity...
docker run --rm --network %NETWORK_NAME% alpine ping -c 1 api-gateway >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Network connectivity issues detected
    echo [INFO] Attempting to restart network...
    docker network disconnect %NETWORK_NAME% api-gateway 2>nul
    docker network connect %NETWORK_NAME% api-gateway 2>nul
) else (
    echo [SUCCESS] Network connectivity OK
)

goto :eof

REM Function to troubleshoot service connectivity
:troubleshoot_service_connectivity
echo [HEADER] Service Connectivity Troubleshooting
echo.

set "services=api-gateway:8080 auth-service:3010 frontend:3000"
set "connectivity_issues=0"

for %%s in (%services%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set "service=%%a"
        set "port=%%b"
        
        echo [INFO] Testing %%service connectivity...
        curl -s http://localhost:!port!/health >nul 2>&1
        if errorlevel 1 (
            echo [ERROR] %%service not responding on port !port!
            set /a "connectivity_issues+=1"
            
            REM Check if container is running
            docker ps | findstr "%%service" >nul
            if errorlevel 1 (
                echo [ERROR] %%service container is not running
                echo [INFO] Attempting to start %%service...
                docker-compose up -d %%service
            ) else (
                echo [WARNING] %%service container is running but not responding
                echo [INFO] Checking container logs...
                docker-compose logs --tail=10 %%service
            )
        ) else (
            echo [SUCCESS] %%service responding on port !port!
        )
        echo.
    )
)

if %connectivity_issues% equ 0 (
    echo [SUCCESS] All services are responding
) else (
    echo [WARNING] Found %connectivity_issues% connectivity issues
)

goto :eof

REM Function to troubleshoot container health
:troubleshoot_container_health
echo [HEADER] Container Health Troubleshooting
echo.

set "health_issues=0"

REM Check all containers
for /f "tokens=1" %%c in ('docker ps -a --format "{{.Names}}"') do (
    set "container=%%c"
    
    echo [INFO] Checking !container! health...
    
    REM Check if container is running
    docker inspect --format='{{.State.Status}}' !container! 2>nul | findstr "running" >nul
    if errorlevel 1 (
        echo [ERROR] !container!: Not running
        echo [INFO] Attempting to start !container!...
        docker-compose up -d !container!
        set /a "health_issues+=1"
    ) else (
        REM Check if container is healthy
        docker inspect --format='{{.State.Health.Status}}' !container! 2>nul | findstr "healthy" >nul
        if errorlevel 1 (
            echo [WARNING] !container!: Running but not healthy
            echo [INFO] Container logs:
            docker-compose logs --tail=5 !container!
            set /a "health_issues+=1"
        ) else (
            echo [SUCCESS] !container!: Healthy
        )
    )
    echo.
)

if %health_issues% equ 0 (
    echo [SUCCESS] All containers are healthy
) else (
    echo [WARNING] Found %health_issues% health issues
)

goto :eof

REM Function to perform comprehensive troubleshooting
:troubleshoot_all
echo [INFO] Performing comprehensive network troubleshooting...
echo.

call :troubleshoot_port_conflicts
call :troubleshoot_docker_network
call :troubleshoot_service_connectivity
call :troubleshoot_container_health

echo [HEADER] Troubleshooting Summary
echo.

echo [INFO] Troubleshooting completed!
echo [INFO] Check the output above for any issues found.
echo [INFO] Log file: %LOG_FILE%
echo.

goto :eof

REM Main execution based on issue type
if /i "!ISSUE_TYPE!"=="ports" (
    call :troubleshoot_port_conflicts
) else if /i "!ISSUE_TYPE!"=="network" (
    call :troubleshoot_docker_network
) else if /i "!ISSUE_TYPE!"=="connectivity" (
    call :troubleshoot_service_connectivity
) else if /i "!ISSUE_TYPE!"=="health" (
    call :troubleshoot_container_health
) else if /i "!ISSUE_TYPE!"=="all" (
    call :troubleshoot_all
) else (
    echo [ERROR] Unknown issue type: !ISSUE_TYPE!
    echo.
    echo [INFO] Available issue types:
    echo   ports        - Troubleshoot port conflicts
    echo   network      - Troubleshoot Docker network issues
    echo   connectivity - Troubleshoot service connectivity
    echo   health       - Troubleshoot container health
    echo   all          - Perform comprehensive troubleshooting
    echo.
    echo [INFO] Usage: scripts\network-troubleshooter.bat [issue_type]
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Troubleshooting completed!
pause
exit /b 0 