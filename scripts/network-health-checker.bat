@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Network Health Checker
REM Network Engineer - Network Infrastructure Monitoring Script
REM Usage: scripts\network-health-checker.bat

REM Configuration
set "PROJECT_NAME=digital_tracking_merchandising"
set "NETWORK_NAME=microservices-network"
set "SERVICE_PORTS=frontend:3000 api-gateway:8080 auth-service:3010 user-service:3002 todo-service:3005 chat-service:3003 attendance-service:3004 report-service:3006 approval-service:3007 workplace-service:3008 notification-service:3009 database:5432 redis:6379 prometheus:9090 grafana:3002"

echo ========================================
echo Digital Tracking Merchandising Platform
echo Network Health Checker
echo ========================================
echo.

REM Check if Docker is running
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker before proceeding.
    pause
    exit /b 1
) else (
    echo [SUCCESS] Docker is running
)

echo.
echo [HEADER] Docker Network Analysis
echo.

echo [INFO] Checking Docker networks...

REM List all networks
echo [INFO] Available Docker Networks:
docker network ls --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"
echo.

REM Check if our network exists
docker network ls | findstr "%NETWORK_NAME%" >nul
if errorlevel 1 (
    echo [WARNING] Network '%NETWORK_NAME%' does not exist
) else (
    echo [SUCCESS] Network '%NETWORK_NAME%' exists
    
    REM Inspect network details
    echo [INFO] Network '%NETWORK_NAME%' Details:
    docker network inspect %NETWORK_NAME% --format "table {{.Name}}\t{{.IPAM.Config.Subnet}}\t{{.Driver}}\t{{.Internal}}"
    echo.
    
    REM Check connected containers
    echo [INFO] Connected Containers:
    docker network inspect %NETWORK_NAME% --format "{{range .Containers}}{{.Name}}\t{{.IPv4Address}}\n{{end}}"
    echo.
)

echo [HEADER] Port Availability Analysis
echo.

echo [INFO] Checking port availability for all services...

set "issues_found=0"
set "busy_ports="

REM Check each service port
for %%s in (%SERVICE_PORTS%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set "service=%%a"
        set "port=%%b"
        
        REM Check if port is in use
        netstat -an | findstr ":!port! " | findstr "LISTENING" >nul
        if !errorlevel! equ 0 (
            REM Check if it's our Docker containers (which is expected)
            netstat -an | findstr ":!port! " | findstr "LISTENING" | findstr "Docker" >nul
            if !errorlevel! equ 0 (
                echo [SUCCESS] !service! (port !port!): RUNNING (Docker)
            ) else (
                echo [ERROR] !service! (port !port!): CONFLICT
                
                REM Get process details
                echo [INFO] Process details:
                netstat -ano | findstr ":!port! " | findstr "LISTENING"
                
                set /a "issues_found+=1"
                set "busy_ports=!busy_ports! !port!"
            )
        ) else (
            echo [SUCCESS] !service! (port !port!): AVAILABLE
        )
    )
)

echo.
echo [HEADER] Service Connectivity Analysis
echo.

echo [INFO] Testing service connectivity...

set "connectivity_issues=0"

REM Test API Gateway
curl -s http://localhost:8080/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] API Gateway not responding on port 8080
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] API Gateway responding on port 8080
)

REM Test Auth Service
curl -s http://localhost:3010/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Auth Service not responding on port 3010
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] Auth Service responding on port 3010
)

REM Test Frontend
curl -s http://localhost:3000/ >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend not responding on port 3000
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] Frontend responding on port 3000
)

REM Test Database connectivity
docker exec -it %PROJECT_NAME%-database pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database not responding
    set /a "connectivity_issues+=1"
) else (
    echo [SUCCESS] Database responding
)

echo.
echo [HEADER] Container Health Analysis
echo.

echo [INFO] Checking container health status...

set "health_issues=0"

REM Check running containers
for /f "tokens=1" %%c in ('docker ps --format "{{.Names}}"') do (
    set "container=%%c"
    
    REM Check if container is healthy
    docker inspect --format='{{.State.Health.Status}}' !container! 2>nul | findstr "healthy" >nul
    if errorlevel 1 (
        REM Check if container is running
        docker inspect --format='{{.State.Status}}' !container! 2>nul | findstr "running" >nul
        if errorlevel 1 (
            echo [ERROR] !container!: Not running
            set /a "health_issues+=1"
        ) else (
            echo [WARNING] !container!: Running but not healthy
            set /a "health_issues+=1"
        )
    ) else (
        echo [SUCCESS] !container!: Healthy
    )
)

echo.
echo [HEADER] Network Performance Analysis
echo.

echo [INFO] Testing network latency...

REM Test localhost latency
ping -n 1 localhost >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Localhost connectivity issues
) else (
    echo [SUCCESS] Localhost connectivity OK
)

REM Test Docker network latency
docker run --rm --network %NETWORK_NAME% alpine ping -c 1 api-gateway >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker network connectivity issues
) else (
    echo [SUCCESS] Docker network connectivity OK
)

echo.
echo ========================================

REM Summary
if %issues_found% equ 0 (
    if %connectivity_issues% equ 0 (
        if %health_issues% equ 0 (
            echo [SUCCESS] All network health checks passed!
            echo.
            echo [SUCCESS] Network Status:
            echo   • All ports are properly configured
            echo   • All services are responding
            echo   • All containers are healthy
            echo   • Network connectivity is optimal
            echo.
            echo [SUCCESS] System is ready for development!
            pause
            exit /b 0
        ) else (
            echo [WARNING] Found %health_issues% container health issues
        )
    ) else (
        echo [WARNING] Found %connectivity_issues% connectivity issues
    )
) else (
    echo [ERROR] Found %issues_found% port conflicts
)

echo.
echo [WARNING] Network issues detected!
echo.
echo [INFO] Troubleshooting steps:
echo   1. Check Docker service status
echo   2. Restart Docker containers: docker-compose restart
echo   3. Check container logs: docker-compose logs
echo   4. Verify network configuration: docker network inspect
echo   5. Check port conflicts: scripts\port-killer.bat ^<port^>
echo.

pause
exit /b 1 