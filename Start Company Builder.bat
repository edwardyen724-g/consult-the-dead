@echo off
title Great Mind Company Builder
cd /d "%~dp0company-builder"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
)

:: Kill any existing process on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    echo Killing existing process on port 3001 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo  ================================================
echo   Great Mind Company Builder
echo   http://localhost:3001
echo  ================================================
echo.

start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3001"
call npx next dev --port 3001

:: If we get here, something went wrong or user closed the server
echo.
echo Server stopped.
pause
