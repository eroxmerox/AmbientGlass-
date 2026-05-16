@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "SPICETIFY_DIR=%APPDATA%\spicetify"
set "THEME_SOURCE=%SCRIPT_DIR%Themes\AmbientGlass"
set "EXTENSION_SOURCE=%SCRIPT_DIR%Extensions\theme.js"
set "THEME_TARGET=%SPICETIFY_DIR%\Themes\AmbientGlass"
set "EXTENSION_TARGET=%SPICETIFY_DIR%\Extensions\theme.js"

echo.
echo AmbientGlass installer
echo ----------------------

where spicetify >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Spicetify was not found in PATH.
  echo Install Spicetify first, then run this file again.
  exit /b 1
)

if not exist "%THEME_SOURCE%\user.css" (
  echo [ERROR] Missing source file: "%THEME_SOURCE%\user.css"
  exit /b 1
)

if not exist "%THEME_SOURCE%\color.ini" (
  echo [ERROR] Missing source file: "%THEME_SOURCE%\color.ini"
  exit /b 1
)

if not exist "%EXTENSION_SOURCE%" (
  echo [ERROR] Missing source file: "%EXTENSION_SOURCE%"
  exit /b 1
)

if not exist "%THEME_TARGET%" mkdir "%THEME_TARGET%"
if errorlevel 1 goto :fail

if not exist "%SPICETIFY_DIR%\Extensions" mkdir "%SPICETIFY_DIR%\Extensions"
if errorlevel 1 goto :fail

copy /Y "%THEME_SOURCE%\user.css" "%THEME_TARGET%\user.css" >nul
if errorlevel 1 goto :fail

copy /Y "%THEME_SOURCE%\color.ini" "%THEME_TARGET%\color.ini" >nul
if errorlevel 1 goto :fail

copy /Y "%EXTENSION_SOURCE%" "%EXTENSION_TARGET%" >nul
if errorlevel 1 goto :fail

spicetify config current_theme AmbientGlass
if errorlevel 1 goto :fail

spicetify config color_scheme ""
if errorlevel 1 goto :fail

spicetify config inject_css 1 replace_colors 1 inject_theme_js 1
if errorlevel 1 goto :fail

spicetify config extensions theme.js-
if errorlevel 1 goto :fail

spicetify config extensions theme.js
if errorlevel 1 goto :fail

spicetify apply
if errorlevel 1 goto :fail

echo.
echo [OK] AmbientGlass was installed and applied.
exit /b 0

:fail
echo.
echo [ERROR] AmbientGlass installation failed.
exit /b 1
