@echo off
echo ========================================
echo Kill Processes on Ports
echo ========================================
echo.

:: Kill processes on port 3000
echo [INFO] Checking port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo [INFO] Found process %%a on port 3000
        echo [INFO] Killing process %%a...
        taskkill /f /pid %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [SUCCESS] Process %%a killed
        ) else (
            echo [WARNING] Failed to kill process %%a
        )
    )
)

:: Kill processes on port 5000
echo [INFO] Checking port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo [INFO] Found process %%a on port 5000
        echo [INFO] Killing process %%a...
        taskkill /f /pid %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [SUCCESS] Process %%a killed
        ) else (
            echo [WARNING] Failed to kill process %%a
        )
    )
)

echo [SUCCESS] Port cleanup completed!
echo.
pause 