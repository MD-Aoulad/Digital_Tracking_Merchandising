@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Workforce Management Platform Setup
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Recommended version: 18.x or higher
    echo.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    echo Please install npm or use Node.js installer which includes npm
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version
echo.

:: Create logs directory
if not exist "logs" mkdir logs

:: Function to install dependencies in a directory
:install_deps
set "dir_name=%~1"
set "display_name=%~2"
echo [INFO] Installing dependencies for %display_name%...
cd /d "%~dp0%dir_name%"
if %errorlevel% neq 0 (
    echo [ERROR] Directory %dir_name% not found!
    goto :error_exit
)

echo [INFO] Running npm install in %dir_name%...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies for %display_name%
    goto :error_exit
)
echo [SUCCESS] Dependencies installed for %display_name%
echo.
cd /d "%~dp0"
goto :eof

:: Install dependencies for each package
echo ========================================
echo Installing Dependencies
echo ========================================
echo.

:: Root package
if exist "package.json" (
    echo [INFO] Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install root dependencies
        goto :error_exit
    )
    echo [SUCCESS] Root dependencies installed
    echo.
)

:: Backend
if exist "backend" (
    call :install_deps "backend" "Backend API"
)

:: Frontend (main web app)
if exist "src" (
    call :install_deps "." "Frontend Web App"
)

:: Mobile app
if exist "mobile" (
    call :install_deps "mobile" "Mobile App"
)

:: WorkforceMobileApp
if exist "WorkforceMobileApp" (
    call :install_deps "WorkforceMobileApp" "Workforce Mobile App"
)

:: WorkforceMobileExpo
if exist "WorkforceMobileExpo" (
    call :install_deps "WorkforceMobileExpo" "Workforce Mobile Expo"
)

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo [SUCCESS] All dependencies have been installed successfully!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. To start the development servers, run:
echo    start-dev.bat
echo.
echo 2. Or start servers individually:
echo    - Backend: cd backend ^&^& npm start
echo    - Frontend: npm start
echo    - Mobile: cd mobile ^&^& npm start
echo.
echo 3. Access the application:
echo    - Web App: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - API Docs: http://localhost:5000/api/docs
echo.
echo ========================================
echo Troubleshooting:
echo ========================================
echo.
echo - If you get port conflicts, run: kill-ports.bat
echo - If you get memory errors, close other applications
echo - For mobile development, install Expo CLI: npm install -g @expo/cli
echo.
pause
exit /b 0

:error_exit
echo.
echo [ERROR] Setup failed! Please check the error messages above.
echo.
pause
exit /b 1 