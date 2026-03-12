@echo off
REM This script generates secure random values for environment variables
REM Run this in PowerShell (run as administrator if needed)

echo ======================================================
echo Secure Environment Variable Generator for Windows
echo ======================================================
echo.

REM Generate base64 encoded random values (using certutil on Windows)
echo 1. JWT_SECRET (Access Token):
for /f "delims=" %%a in ('certutil -randfile 32 NUL ^| findstr /r "^"') do (
    set "jwt_secret=%%a"
)
echo    %jwt_secret%
echo.

echo 2. JWT_REFRESH_SECRET (Refresh Token):
for /f "delims=" %%a in ('certutil -randfile 32 NUL ^| findstr /r "^"') do (
    set "jwt_refresh=%%a"
)
echo    %jwt_refresh%
echo.

echo 3. ENCRYPTION_KEY (32 hex characters):
for /f "delims=" %%a in ('certutil -randfile 16 NUL ^| findstr /r "^"') do (
    set "encrypt_key=%%a"
)
echo    %encrypt_key%
echo.

echo ======================================================
echo IMPORTANT: Copy these values to Vercel
echo ======================================================
echo.
echo Backend Environment Variables:
echo JWT_SECRET=%jwt_secret%
echo JWT_REFRESH_SECRET=%jwt_refresh%
echo ENCRYPTION_KEY=%encrypt_key%
echo.
pause
