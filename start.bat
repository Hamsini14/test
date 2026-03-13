@echo off
echo Starting AI Accountability Framework...

start "Backend - FastAPI" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --reload --port 8000"
timeout /t 2 /nobreak >nul
start "Frontend - React" powershell -ExecutionPolicy Bypass -NoExit -Command "cd '%~dp0\frontend'; npm run dev"

echo.
echo Servers started!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173
