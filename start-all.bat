@echo off
title Adhikar AI - Full Stack Launcher
color 0A

echo ===================================================
echo           ADHIKAR AI - SYSTEM LAUNCHER
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Python Multi-Modal AI Engine (Port 5000)...
cd /d "%~dp0ai-engine"
start "Adhikar AI - AI Engine (Port 5000)" cmd /k "set PYTHONPATH=%~dp0.venv\Lib\site-packages&& C:\python313\python.exe app.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Backend (Port 8085)...
cd /d "%~dp0backend"
start "Adhikar AI - Backend (Port 8085)" cmd /k "gradlew.bat bootRun"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Web Portal (Port 5173)...
cd /d "%~dp0frontend"
start "Adhikar AI - Web Frontend (Port 5173)" cmd /k "npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo Opening browser to http://localhost:5173 ...
start http://localhost:5173

echo.
echo ===================================================
echo All services launched!
echo Web Portal:     http://localhost:5173
echo Backend API:    http://localhost:8085
echo AI Engine:      http://localhost:5000
echo Mobile APK:     adhikar-ai-citizen.apk
echo ===================================================
echo.
pause
