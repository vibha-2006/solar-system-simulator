@echo off
title Solar System Simulator — Start All Services
echo ===========================================
echo  Solar System Simulator Solar System Simulator
echo  Starting all services...
echo ===========================================
cd /d "%~dp0"

echo [1/2] Starting Backend (port 8000)...
start "Solar System Simulator Backend" cmd /k "python -m uvicorn backend.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (port 5173)...
start "Solar System Simulator Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===========================================
echo  Solar System Simulator is starting up!
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo ===========================================
echo.
echo Press any key to also launch the Desktop app...
pause >nul

echo [3/3] Starting Desktop (OpenGL 3.3 Core)...
python desktop/main.py
