@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Resolve repo root from this script's folder
set "SCRIPT_DIR=%~dp0"
set "ROOT=%SCRIPT_DIR%.."

REM Config
set "PORT=8800"
set "RGS_URL=http://127.0.0.1:%PORT%/api/"

REM Persist RGS URL so the frontend picks it up
echo [RGS] Writing URL to scripts\rgs-url.txt -> %RGS_URL%
(
	echo %RGS_URL%
) > "%SCRIPT_DIR%rgs-url.txt"

REM Start Mimic RGS in a new window (keeps server logs visible)
echo [RGS] Starting mimic RGS on %RGS_URL%
start "" cmd /k node "%ROOT%\scripts\new-rgs-server.mjs" %PORT%

REM Small delay to let RGS boot
timeout /t 2 /nobreak >nul

REM Default app: Crypto_Reapers (can override with first arg)
if "%~1"=="" (
	set "APP=Crypto_Reapers"
) else (
	set "APP=%~1"
)

REM Pass 'clean' if CLEAN_CHROME=1
if "%CLEAN_CHROME%"=="1" (
	start "" cmd /c ""%ROOT%\scripts\run-frontend.bat" "%APP%" clean"
) else (
	start "" cmd /c ""%ROOT%\scripts\run-frontend.bat" "%APP%""
)

echo [RGS] Launched Mimic RGS and Frontend. App=%APP%
endlocal
exit /b 0
