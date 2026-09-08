@echo off
echo ===================================================
echo   Starting Smart Billing & Invoice Generator System
echo ===================================================

echo Starting Spring Boot Backend (Port 8081)...
start "Smart Billing Backend" cmd /k "cd backend && mvn spring-boot:run"

timeout /t 5 /nobreak > nul

echo Starting React Frontend (Port 3000)...
start "Smart Billing Frontend" cmd /k "cd frontend && npm start"

echo ===================================================
echo Backend will be available at: http://localhost:8081
echo Frontend will be available at: http://localhost:3000
echo ===================================================
