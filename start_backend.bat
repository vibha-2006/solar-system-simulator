@echo off
title NOVA Backend - FastAPI
echo ===========================================
echo  NOVA Solar System Simulator - Backend
echo ===========================================
cd /d "%~dp0"
python -m uvicorn backend.main:app --reload --port 8000 --host 0.0.0.0
pause
