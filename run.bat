@echo off
title AI Interview Coach Launcher
echo ===================================================
echo   Starting AI Interview Preparation Assistant
echo ===================================================
echo.

echo [1/2] Starting Express API Server...
start "AI Interview Backend" cmd /c "cd backend && npm run dev"

echo [2/2] Starting Vite Frontend...
start "AI Interview Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Servers are starting in separate windows!
echo   - Backend: http://localhost:5001
echo   - Frontend: http://localhost:5173
echo.
echo   Press any key in this window to exit launcher.
echo ===================================================
pause > nul
