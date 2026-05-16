@echo off
setlocal EnableExtensions

set "SPICETIFY_DIR=%APPDATA%\spicetify"
set "CONFIG_FILE=%SPICETIFY_DIR%\config-xpui.ini"
set "THEME_TARGET=%SPICETIFY_DIR%\Themes\AmbientGlass"
set "EXTENSION_TARGET=%SPICETIFY_DIR%\Extensions\theme.js"
set "CURRENT_THEME="

echo.
echo AmbientGlass uninstaller
echo ------------------------

where spicetify >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Spicetify was not found in PATH.
  exit /b 1
)

if exist "%CONFIG_FILE%" (
  for /f "tokens=2 delims==" %%A in ('findstr /B /C:"current_theme" "%CONFIG_FILE%"') do set "CURRENT_THEME=%%A"
)
set "CURRENT_THEME=%CURRENT_THEME: =%"

spicetify config extensions theme.js-
if errorlevel 1 goto :fail

if /I "%CURRENT_THEME%"=="AmbientGlass" (
  spicetify config current_theme ""
  if errorlevel 1 goto :fail
  spicetify config color_scheme ""
  if errorlevel 1 goto :fail
)

if exist "%EXTENSION_TARGET%" del /F /Q "%EXTENSION_TARGET%"
if errorlevel 1 goto :fail

if exist "%THEME_TARGET%" rmdir /S /Q "%THEME_TARGET%"
if errorlevel 1 goto :fail

spicetify apply
if errorlevel 1 goto :fail

echo.
echo [OK] AmbientGlass was uninstalled.
exit /b 0

:fail
echo.
echo [ERROR] AmbientGlass uninstallation failed.
exit /b 1
