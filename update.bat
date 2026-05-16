@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "REPO_URL=https://github.com/eroxmerox/AmbientGlass.git"
set "TEMP_REPO=%TEMP%\AmbientGlass-update-%RANDOM%"

echo.
echo AmbientGlass updater
echo --------------------

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git was not found in PATH.
  echo Install Git, or download the latest repository ZIP and run install.bat again.
  exit /b 1
)

if exist "%SCRIPT_DIR%.git" (
  echo Updating local repository...
  git -C "%SCRIPT_DIR%" pull --ff-only
  if errorlevel 1 goto :fail
  call "%SCRIPT_DIR%install.bat"
  exit /b %errorlevel%
)

echo Downloading the latest repository copy...
git clone --depth 1 "%REPO_URL%" "%TEMP_REPO%"
if errorlevel 1 goto :fail

if not exist "%TEMP_REPO%\Themes\AmbientGlass\user.css" goto :badlayout
if not exist "%TEMP_REPO%\Themes\AmbientGlass\color.ini" goto :badlayout
if not exist "%TEMP_REPO%\Extensions\theme.js" goto :badlayout

if not exist "%SCRIPT_DIR%Themes\AmbientGlass" mkdir "%SCRIPT_DIR%Themes\AmbientGlass"
if errorlevel 1 goto :fail

if not exist "%SCRIPT_DIR%Extensions" mkdir "%SCRIPT_DIR%Extensions"
if errorlevel 1 goto :fail

copy /Y "%TEMP_REPO%\Themes\AmbientGlass\user.css" "%SCRIPT_DIR%Themes\AmbientGlass\user.css" >nul
if errorlevel 1 goto :fail

copy /Y "%TEMP_REPO%\Themes\AmbientGlass\color.ini" "%SCRIPT_DIR%Themes\AmbientGlass\color.ini" >nul
if errorlevel 1 goto :fail

copy /Y "%TEMP_REPO%\Extensions\theme.js" "%SCRIPT_DIR%Extensions\theme.js" >nul
if errorlevel 1 goto :fail

call "%SCRIPT_DIR%install.bat"
set "INSTALL_EXIT=%errorlevel%"

if exist "%TEMP_REPO%" rmdir /S /Q "%TEMP_REPO%"
exit /b %INSTALL_EXIT%

:badlayout
echo.
echo [ERROR] The repository layout is not valid for AmbientGlass.
echo Expected:
echo   Themes\AmbientGlass\user.css
echo   Themes\AmbientGlass\color.ini
echo   Extensions\theme.js
if exist "%TEMP_REPO%" rmdir /S /Q "%TEMP_REPO%"
exit /b 1

:fail
echo.
echo [ERROR] AmbientGlass update failed.
if exist "%TEMP_REPO%" rmdir /S /Q "%TEMP_REPO%"
exit /b 1
