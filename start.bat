@echo off
echo ========================================
echo   PROJET PHARMACIES ABIDJAN
echo ========================================
echo.
echo Ce script va lancer le backend et le frontend
echo.
echo Appuyez sur une touche pour continuer...
pause >nul

echo.
echo [1/3] Demarrage du backend Python...
cd backend
start "Backend Flask" cmd /k "python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python app.py"

echo.
echo [2/3] Attente du demarrage du backend...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] Demarrage du frontend React...
cd ..\frontend
start "Frontend React" cmd /k "npm install && npm start"

echo.
echo ========================================
echo   LANCEMENT TERMINE !
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer...
pause >nul

