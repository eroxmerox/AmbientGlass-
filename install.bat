@echo off
setlocal

echo =========================================
echo AmbientGlass Theme Installer (Spicetify)
echo =========================================
echo.

set "THEME_DIR=%APPDATA%\spicetify\Themes\AmbientGlass"
set "EXT_DIR=%APPDATA%\spicetify\Extensions"

echo [1/4] Creating directories...
if not exist "%THEME_DIR%" mkdir "%THEME_DIR%"
if not exist "%EXT_DIR%" mkdir "%EXT_DIR%"

echo [2/4] Downloading files from GitHub...
curl -sL https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/user.css -o "%THEME_DIR%\user.css"
curl -sL https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/color.ini -o "%THEME_DIR%\color.ini"
curl -sL https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/theme.js -o "%EXT_DIR%\theme.js"

echo [3/4] Configuring Spicetify...
call spicetify config current_theme AmbientGlass
call spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1

REM Adds the extension. If it already exists, it won't be added twice.
call spicetify config extensions theme.js

echo [4/4] Applying theme (Spotify will restart)...
call spicetify apply

echo.
echo =========================================
echo Installation complete!
echo =========================================
pause
