@echo off
setlocal

echo =========================================
echo AmbientGlass Theme Uninstaller
echo =========================================
echo.

set "THEME_DIR=%APPDATA%\spicetify\Themes\AmbientGlass"
set "EXT_DIR=%APPDATA%\spicetify\Extensions"

echo [1/3] Removing theme files...
if exist "%THEME_DIR%" rmdir /s /q "%THEME_DIR%"
if exist "%EXT_DIR%\theme.js" del /q "%EXT_DIR%\theme.js"

echo [2/3] Resetting Spicetify configuration...
REM Removes the extension from the config
call spicetify config extensions theme.js-
REM Select empty theme (default)
call spicetify config current_theme "" color_scheme ""

echo [3/3] Applying changes...
call spicetify apply

echo.
echo =========================================
echo Uninstallation complete!
echo =========================================
pause
