@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Usage: open-clean-chrome.bat <url> [windowTitle]
set "SCRIPT_DIR=%~dp0"
set "URL=%~1"
set "WTITLE=%~2"
if "%WTITLE%"=="" set "WTITLE=ChromeClean"
if "%URL%"=="" (
  echo [CHROME] Missing URL argument.
  exit /b 1
)

REM Resolve Chrome executable path
set "CHROME_EXE="
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if "%CHROME_EXE%"=="" if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if "%CHROME_EXE%"=="" if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if "%CHROME_EXE%"=="" (
  for /f "tokens=*" %%P in ('where chrome 2^>nul') do (
    set "CHROME_EXE=%%P"
    goto :gotchrome
  )
)
:gotchrome

set "PROFILE_DIR=%SCRIPT_DIR%.chrome-clean-profile"
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%" >nul 2>nul

if "%CHROME_EXE%"=="" (
  echo [CHROME] Could not find chrome.exe. Attempting to use default association...
  start "%WTITLE%" chrome --user-data-dir="%PROFILE_DIR%" --no-first-run --disable-extensions --disable-component-extensions-with-background-pages --disable-default-apps --disable-background-networking --disable-sync --disable-features=Translate,ExtensionsToolbarMenu --new-window "%URL%"
  exit /b 0
)

start "%WTITLE%" "%CHROME_EXE%" --user-data-dir="%PROFILE_DIR%" --no-first-run --disable-extensions --disable-component-extensions-with-background-pages --disable-default-apps --disable-background-networking --disable-sync --disable-features=Translate,ExtensionsToolbarMenu --new-window "%URL%"

endlocal
exit /b 0
