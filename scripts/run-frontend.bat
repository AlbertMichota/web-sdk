@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Resolve repo root from this script's folder
set SCRIPT_DIR=%~dp0
set ROOT=%SCRIPT_DIR%..

REM Optional first arg: app folder name under apps/ (e.g., Slot_Test_App). Defaults to Slot_Test_App.
set APP_NAME=%1
if "%APP_NAME%"=="" set APP_NAME=Slot_Test_App
set APP_DIR=%ROOT%\apps\%APP_NAME%

set STATIC_FALLBACK=0
if not exist "%APP_DIR%\package.json" (
  echo [FE] No package.json for "%APP_NAME%" at %APP_DIR%. Using static server fallback.
  set STATIC_FALLBACK=1
)

REM Choose directory to serve: app dir for dev, repo root for static so /shared is accessible
set SERVE_DIR=%APP_DIR%
if "%STATIC_FALLBACK%"=="1" set SERVE_DIR=%ROOT%

pushd "%SERVE_DIR%" || goto :eof

REM Read RGS URL from root scripts\rgs-url.txt (single line); fallback to localhost:8000/api/
set "RGS_URL=http://127.0.0.1:8000/api/"
if exist "%ROOT%\scripts\rgs-url.txt" (
  for /f "usebackq delims=" %%A in ("%ROOT%\scripts\rgs-url.txt") do set "RGS_URL=%%A"
)
set "PUBLIC_RGS_URL=%RGS_URL%"
set "RGS_PROXY_TARGET="

REM Fixed dev port for all apps unless overridden below
set "DEV_PORT=3001"

REM Prefer pnpm if available; otherwise fall back to npm
if "%STATIC_FALLBACK%"=="0" (
  where pnpm >nul 2>nul
  if %ERRORLEVEL%==0 (
    set RUN_CMD=pnpm dev
  ) else (
    echo [FE] pnpm not found; using npm. This may be slower.
    set RUN_CMD=npm run dev
  )
) else (
  where npx >nul 2>nul
  if %ERRORLEVEL%==0 (
    REM Using pushd APP_DIR as CWD; avoid quoting issues in SET with spaces
    set RUN_CMD=npx http-server -p %DEV_PORT%
  ) else (
    echo [FE] npx not found. Please install Node/npm or run a local web server manually in %APP_DIR%.
    set RUN_CMD=
  )
)

REM Use Vite dev proxy for supported apps so /api stays same-origin and avoids CORS preflights.
if "%STATIC_FALLBACK%"=="0" (
  if /I "%APP_NAME%"=="Crypto_Reapers" (
    set "PUBLIC_RGS_URL=/api/"
    set "RGS_PROXY_TARGET=%RGS_URL%"
  )
)

REM Attempt to free the dev port before starting (prevents Vite from switching to 3002)
echo [FE] Ensuring port %DEV_PORT% is free...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%DEV_PORT% .*LISTENING"') do (
  echo [FE] Port %DEV_PORT% is in use by PID %%P; terminating...
  taskkill /F /PID %%P >nul 2>nul
)
REM Short delay to allow the OS to release the port
timeout /t 1 /nobreak >nul

REM Start the selected app dev server from app directory (avoid turbo filters)
echo [FE] Starting frontend for %APP_NAME%: %RUN_CMD%
if not "%RUN_CMD%"=="" (
  start "frontend:%APP_NAME%" cmd /k "%RUN_CMD% ^&^& echo( ^&^& echo [FE] Dev server exited. Press any key to close... ^&^& pause"
) else (
  echo [FE] Unable to start dev/static server. Aborting open.
  exit /b 1
)

REM Give the server a moment to start (adjust if needed)
timeout /t 3 /nobreak >nul

REM Open the app with Stake Engine-style URL
REM Use sessionID explicitly per spec; device/lang/rgs_url are consumed as usual
if "%SESSIONID%"=="" set SESSIONID=Plebeans:owner

set "APP_PATH=/"
if /I "%APP_NAME%"=="gold-clumbs" set "APP_PATH=/phaser"
if /I "%APP_NAME%"=="fiesta-template" set "APP_PATH=/"
REM Crypto_Reaper uses the default root path but we keep an explicit rule for clarity
if /I "%APP_NAME%"=="Crypto_Reaper" set "APP_PATH=/"
if /I "%APP_NAME%"=="Crypto Reapers" set "APP_PATH=/"
if /I "%APP_NAME%"=="Crypto_Reapers" set "APP_PATH=/"

REM For static fallback, serve from repo root and open the app's index.html under /apps
if "%STATIC_FALLBACK%"=="1" set "APP_PATH=/apps/%APP_NAME%/index.html"

set "APP_URL=http://localhost:%DEV_PORT%%APP_PATH%?sessionID=%SESSIONID%&lang=en&device=desktop&rgs_url=%PUBLIC_RGS_URL%&debugFonts=1&spineverbose=1"
if /I "%2"=="clean" set CLEAN_CHROME=1

REM Encode spaces in APP_PATH for URL safety
set "APP_PATH_ENC=%APP_PATH: =%20%"
set "EXTRA_FLAGS="
if "%EVENTOVERLAY%"=="1" set "EXTRA_FLAGS=%EXTRA_FLAGS%&eventoverlay=1"
set "APP_URL=http://localhost:%DEV_PORT%%APP_PATH_ENC%?sessionID=%SESSIONID%&lang=en&device=desktop&rgs_url=%PUBLIC_RGS_URL%&debugFonts=1&spineverbose=1%EXTRA_FLAGS%"
if defined RGS_PROXY_TARGET (
  echo [FE] Opening %APP_NAME% at %APP_PATH_ENC% on port %DEV_PORT% with rgs_url=%PUBLIC_RGS_URL% -> proxy %RGS_PROXY_TARGET% and sessionID=%SESSIONID% (debugFonts=1, spineverbose=1)
) else (
  echo [FE] Opening %APP_NAME% at %APP_PATH_ENC% on port %DEV_PORT% with rgs_url=%PUBLIC_RGS_URL% and sessionID=%SESSIONID% (debugFonts=1, spineverbose=1)
)
if "%CLEAN_CHROME%"=="1" (
  call "%SCRIPT_DIR%open-clean-chrome.bat" "%APP_URL%" "%APP_NAME%"
) else (
  start "browser:%APP_NAME%" "%APP_URL%"
)
