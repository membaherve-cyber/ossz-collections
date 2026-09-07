@echo off
echo ==========================================
echo   OSSZ Collections - Create Deploy ZIP
echo ==========================================
echo.

:: Navigate to project directory
cd /d "%~dp0"

:: Remove old ZIP if exists
if exist ossz-laravel-deploy.zip del ossz-laravel-deploy.zip

echo Creating deployment ZIP file...
echo (This may take a moment)
echo.

:: Create ZIP using PowerShell (built into Windows)
powershell -Command "Compress-Archive -Path 'app','bootstrap','config','database','public','resources','routes','storage','composer.json','artisan','.env.example','DEPLOYMENT.md' -DestinationPath 'ossz-laravel-deploy.zip' -Force"

if exist ossz-laravel-deploy.zip (
    echo.
    echo ✓ SUCCESS! Created: ossz-laravel-deploy.zip
    echo.
    echo You can now upload this file to cPanel.
    echo.
    echo File location: %~dp0ossz-laravel-deploy.zip
) else (
    echo.
    echo ✗ ERROR: Could not create ZIP file
    echo Please check that you have PowerShell available.
)

echo.
echo ==========================================
echo  Open QUICK-DEPLOY.txt for deployment steps
echo ==========================================
pause
