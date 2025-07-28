@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - System Usage Checker
REM Check system resource usage and Docker container status

echo ========================================
echo Digital Tracking Merchandising Platform
echo System Usage Checker
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo [HEADER] System Resource Usage
echo.

REM Check CPU usage
echo [INFO] CPU Usage:
wmic cpu get loadpercentage /value | findstr "LoadPercentage"

REM Check memory usage
echo [INFO] Memory Usage:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value | findstr "Memory"

REM Check disk usage
echo [INFO] Disk Usage:
wmic logicaldisk get size,freespace,caption /value | findstr "Disk"

echo.
echo [HEADER] Docker Resource Usage
echo.

REM Check Docker disk usage
echo [INFO] Docker Disk Usage:
docker system df

echo.
echo [INFO] Docker Container Status:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Size}}"

echo.
echo [HEADER] Port Usage
echo.

REM Check port usage for our services
set "service_ports=3000 8080 3010 3002 3005 3003 3009 3011 3006 3007 3008"

for %%p in (%service_ports%) do (
    netstat -an | findstr ":%%p " | findstr "LISTENING" >nul
    if errorlevel 1 (
        echo [INFO] Port %%p: Available
    ) else (
        echo [INFO] Port %%p: In Use
        netstat -ano | findstr ":%%p " | findstr "LISTENING"
    )
)

echo.
echo [SUCCESS] System usage check completed!
pause 