@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Workforce Management Platform - Start Dev
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please run setup-windows.bat first
    pause
    exit /b 1
)

:: Create logs directory
if not exist "logs" mkdir logs

:: Function to kill processes on a port
:kill_port
set "port=%~1"
echo [INFO] Checking for processes on port %port%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%port%') do (
    if not "%%a"=="0" (
        echo [WARNING] Killing process %%a on port %port%
        taskkill /f /pid %%a >nul 2>&1
        timeout /t 2 /nobreak >nul
    )
)
goto :eof

:: Function to wait for a service to be ready
:wait_for_service
set "url=%~1"
set "service_name=%~2"
set "max_attempts=30"
set "attempt=0"

echo [INFO] Waiting for %service_name% to be ready...
:wait_loop
set /a attempt+=1
curl -s "%url%" >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] %service_name% is ready!
    goto :eof
)
if %attempt% geq %max_attempts% (
    echo [ERROR] %service_name% failed to start within timeout
    goto :error_exit
)
echo [INFO] Attempt %attempt%/%max_attempts% - waiting...
timeout /t 2 /nobreak >nul
goto :wait_loop

:: Kill any existing processes on our ports
echo [INFO] Cleaning up existing processes...
call :kill_port "5000"
call :kill_port "3000"
echo.

:: Start backend server
echo [INFO] Starting backend server...
cd /d "%~dp0backend"
if %errorlevel% neq 0 (
    echo [ERROR] Backend directory not found!
    goto :error_exit
)

start "Backend Server" cmd /k "npm start > ..\logs\backend.log 2>&1"
set "backend_pid=%errorlevel%"

:: Wait for backend to be ready
call :wait_for_service "http://localhost:5000/api/test" "Backend"
if %errorlevel% neq 0 goto :error_exit

:: Start frontend server
echo [INFO] Starting frontend server...
cd /d "%~dp0"
start "Frontend Server" cmd /k "npm start > logs\frontend.log 2>&1"
set "frontend_pid=%errorlevel%"

:: Wait for frontend to be ready
call :wait_for_service "http://localhost:3000" "Frontend"
if %errorlevel% neq 0 goto :error_exit

echo.
echo ========================================
echo Server Status
echo ========================================
echo [SUCCESS] Backend: Running on http://localhost:5000
echo [SUCCESS] Frontend: Running on http://localhost:3000
echo [SUCCESS] Development environment is ready!
echo.
echo [INFO] Frontend: http://localhost:3000
echo [INFO] Backend: http://localhost:5000
echo [INFO] API Docs: http://localhost:5000/api/docs
echo.
echo [INFO] Press Ctrl+C in the server windows to stop them
echo [INFO] Or run: stop-servers.bat
echo.
echo ========================================
echo Quick Access Links:
echo ========================================
echo.
echo [LINK] Open Frontend: http://localhost:3000
echo [LINK] Open Backend: http://localhost:5000
echo [LINK] Open API Docs: http://localhost:5000/api/docs
echo.
echo ========================================
echo Demo Credentials:
echo ========================================
echo Email: admin@company.com
echo Password: password
echo.
echo Email: richard@company.com
echo Password: password
echo.
pause
exit /b 0

:error_exit
echo.
echo [ERROR] Failed to start development environment!
echo [INFO] Check the logs in the logs/ directory
echo.
pause
exit /b 1 