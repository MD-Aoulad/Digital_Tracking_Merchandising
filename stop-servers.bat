@echo off
echo ========================================
echo Stopping Development Servers
echo ========================================
echo.

:: Kill processes on port 3000 (frontend)
echo [INFO] Stopping frontend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo [INFO] Killing process %%a on port 3000
        taskkill /f /pid %%a >nul 2>&1
    )
)

:: Kill processes on port 5000 (backend)
echo [INFO] Stopping backend server (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo [INFO] Killing process %%a on port 5000
        taskkill /f /pid %%a >nul 2>&1
    )
)

:: Kill any Node.js processes (as backup)
echo [INFO] Stopping any remaining Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo [SUCCESS] All development servers stopped!
echo.
pause 