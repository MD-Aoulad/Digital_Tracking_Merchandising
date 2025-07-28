@echo off
setlocal enabledelayedexpansion

REM Workforce Management Platform - Development Startup Script
REM This script manages both frontend and backend servers with proper process management

REM Configuration
set "FRONTEND_PORT=3000"
set "BACKEND_PORT=5000"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%"
set "BACKEND_URL=http://localhost:%BACKEND_PORT%"

echo ========================================
echo Workforce Management Platform
echo Development Startup Script
echo ========================================
echo.

REM Check if required tools are available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js to continue.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH
    echo Please install npm to continue.
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Function to check if a port is in use
:check_port
set "port=%~1"
netstat -an | findstr ":%port% " | findstr "LISTENING" >nul
if errorlevel 1 (
    exit /b 1
) else (
    exit /b 0
)

REM Function to kill processes on a port
:kill_port
set "port=%~1"
echo [WARNING] Checking for processes on port %port%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port% " ^| findstr "LISTENING"') do (
    echo [WARNING] Killing process %%a on port %port%
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul
goto :eof

REM Function to wait for a service to be ready
:wait_for_service
set "url=%~1"
set "service_name=%~2"
set "max_attempts=30"
set "attempt=1"

echo [INFO] Waiting for %service_name% to be ready...

:wait_loop
curl -s "%url%" >nul 2>&1
if errorlevel 1 (
    if %attempt% LSS %max_attempts% (
        echo -n .
        timeout /t 2 /nobreak >nul
        set /a "attempt+=1"
        goto :wait_loop
    ) else (
        echo [ERROR] %service_name% failed to start within %max_attempts% attempts
        exit /b 1
    )
) else (
    echo [SUCCESS] %service_name% is ready!
    exit /b 0
)

REM Function to start backend server
:start_backend
echo [INFO] Starting backend server...

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo [WARNING] Backend dependencies not found. Installing...
    cd backend
    call npm install
    cd ..
)

REM Kill any existing backend processes
call :kill_port %BACKEND_PORT%

REM Start backend in background
cd backend
start /B npm start > ..\logs\backend.log 2>&1
cd ..

REM Wait for backend to be ready
call :wait_for_service "%BACKEND_URL%" "Backend Server"
if errorlevel 1 (
    echo [ERROR] Failed to start backend server
    echo [INFO] Check logs\backend.log for details
    pause
    exit /b 1
)

echo [SUCCESS] Backend server started successfully!
goto :eof

REM Function to start frontend server
:start_frontend
echo [INFO] Starting frontend server...

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo [WARNING] Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    cd ..
)

REM Kill any existing frontend processes
call :kill_port %FRONTEND_PORT%

REM Start frontend in background
cd frontend
start /B npm start > ..\logs\frontend.log 2>&1
cd ..

REM Wait for frontend to be ready
call :wait_for_service "%FRONTEND_URL%" "Frontend Server"
if errorlevel 1 (
    echo [ERROR] Failed to start frontend server
    echo [INFO] Check logs\frontend.log for details
    pause
    exit /b 1
)

echo [SUCCESS] Frontend server started successfully!
goto :eof

REM Function to display service status
:show_status
echo.
echo [INFO] Service Status:
echo.
echo [INFO] Backend Server:
echo   URL: %BACKEND_URL%
echo   Port: %BACKEND_PORT%
echo   Log: logs\backend.log
echo.
echo [INFO] Frontend Server:
echo   URL: %FRONTEND_URL%
echo   Port: %FRONTEND_PORT%
echo   Log: logs\frontend.log
echo.
echo [SUCCESS] Development environment is ready!
echo.
echo [INFO] Next steps:
echo   1. Open %FRONTEND_URL% in your browser
echo   2. Monitor logs in the logs\ directory
echo   3. Use Ctrl+C to stop all services
echo.
goto :eof

REM Function to cleanup on exit
:cleanup
echo.
echo [INFO] Stopping development servers...
echo [INFO] This may take a few seconds...

REM Kill processes on our ports
call :kill_port %BACKEND_PORT%
call :kill_port %FRONTEND_PORT%

echo [SUCCESS] Development servers stopped.
goto :eof

REM Main execution
echo [INFO] Starting development environment...
echo.

REM Check if ports are available
call :check_port %BACKEND_PORT%
if errorlevel 0 (
    echo [WARNING] Port %BACKEND_PORT% is already in use
    echo [INFO] Attempting to free the port...
    call :kill_port %BACKEND_PORT%
)

call :check_port %FRONTEND_PORT%
if errorlevel 0 (
    echo [WARNING] Port %FRONTEND_PORT% is already in use
    echo [INFO] Attempting to free the port...
    call :kill_port %FRONTEND_PORT%
)

REM Start backend server
call :start_backend
if errorlevel 1 (
    echo [ERROR] Failed to start backend server
    pause
    exit /b 1
)

REM Start frontend server
call :start_frontend
if errorlevel 1 (
    echo [ERROR] Failed to start frontend server
    pause
    exit /b 1
)

REM Show status
call :show_status

REM Set up cleanup on exit
echo [INFO] Press Ctrl+C to stop all services...
echo.

REM Keep the script running
:keep_alive
timeout /t 10 /nobreak >nul
goto :keep_alive 