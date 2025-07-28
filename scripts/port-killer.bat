@echo off
setlocal enabledelayedexpansion

REM Digital Tracking Merchandising Platform - Port Killer
REM This script stops processes using a specific port
REM Usage: scripts\port-killer.bat ^<port_number^>

REM Check if port number is provided
if "%~1"=="" (
    echo [ERROR] Port number is required
    echo.
    echo [INFO] Usage:
    echo   scripts\port-killer.bat ^<port_number^>
    echo.
    echo [INFO] Examples:
    echo   scripts\port-killer.bat 3000
    echo   scripts\port-killer.bat 8000
    echo.
    echo [INFO] Common ports in this project:
    echo   3000 - Frontend Web App
    echo   8080 - API Gateway
    echo   3010 - Auth Service
    echo   3002 - User Service
    echo   3005 - Todo Service
    echo   3003 - Chat Service
    echo   3009 - Notification Service
    echo   3011 - Approval Service
    echo   3006 - Report Service
    echo   3007 - Attendance Service
    echo   3008 - Workplace Service
    echo   19000 - Mobile App (Expo)
    echo   19001 - Mobile App Dev
    echo   19002 - Mobile App Metro
    echo   5432 - Database
    echo   6379 - Redis
    echo   9090 - Prometheus
    echo   3002 - Grafana
    pause
    exit /b 1
)

set "PORT=%~1"

REM Validate port number
echo %PORT%| findstr /r "^[0-9]*$" >nul
if errorlevel 1 (
    echo [ERROR] Invalid port number. Port must be a number.
    pause
    exit /b 1
)

if %PORT% LSS 1 (
    echo [ERROR] Invalid port number. Port must be between 1 and 65535.
    pause
    exit /b 1
)

if %PORT% GTR 65535 (
    echo [ERROR] Invalid port number. Port must be between 1 and 65535.
    pause
    exit /b 1
)

echo ========================================
echo Digital Tracking Merchandising Platform
echo Port Killer
echo ========================================
echo.

echo [INFO] Targeting port: %PORT%
echo.

REM Check if port is in use
netstat -an | findstr ":%PORT% " | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [SUCCESS] Port %PORT% is already free
    pause
    exit /b 0
)

REM Get process information
echo [WARNING] Process information for port %PORT%:
netstat -ano | findstr ":%PORT% " | findstr "LISTENING"
echo.

REM Get PIDs
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set "PIDS=!PIDS! %%a"
)

if "!PIDS!"=="" (
    echo [SUCCESS] No processes found on port %PORT%
    pause
    exit /b 0
)

echo [WARNING] Found processes with PIDs: !PIDS!
echo.

REM Ask for confirmation
echo [WARNING] Warning: This will forcefully terminate the processes using port %PORT%
echo [WARNING] Are you sure you want to continue? (y/N)
set /p "response="

if /i not "!response!"=="y" (
    echo [INFO] Operation cancelled.
    pause
    exit /b 0
)

echo.

REM Kill processes
echo [INFO] Stopping processes...

for %%p in (!PIDS!) do (
    echo [WARNING] Killing process %%p...
    
    REM Try graceful termination first
    taskkill /PID %%p /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo [SUCCESS] Process %%p terminated
    ) else (
        echo [ERROR] Failed to kill process %%p
    )
)

echo.

REM Verify port is free
timeout /t 2 /nobreak >nul

netstat -an | findstr ":%PORT% " | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [SUCCESS] Success! Port %PORT% is now free
    echo.
    echo [SUCCESS] You can now start your service on port %PORT%
    pause
    exit /b 0
) else (
    echo [ERROR] Warning: Port %PORT% is still in use
    echo.
    echo [WARNING] Remaining processes:
    netstat -ano | findstr ":%PORT% " | findstr "LISTENING"
    echo.
    echo [WARNING] You may need to manually stop these processes or restart your system.
    pause
    exit /b 1
) 