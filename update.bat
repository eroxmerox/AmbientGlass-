@echo off
setlocal

echo =========================================
echo AmbientGlass Theme Updater
echo =========================================
echo.

set "THEME_DIR=%APPDATA%\spicetify\Themes\AmbientGlass"
set "EXT_DIR=%APPDATA%\spicetify\Extensions"

echo [1/3] Checking directories...
if not exist "%THEME_DIR%" mkdir "%THEME_DIR%"
if not exist "%EXT_DIR%" mkdir "%EXT_DIR%"

echo [2/3] Downloading latest files from GitHub...
curl -sL https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/user.css -o "%THEME_DIR%\user.css"
curl -sL https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/color.ini -o "%THEME_DIR%\color.ini"
curl -sL https://raw.githubusercontent.com/eroxmerox/AmbientGlass/main/theme.js -o "%EXT_DIR%\theme.js"

echo [3/3] Applying updates (Spotify will restart)...
call spicetify apply

echo.
echo =========================================
echo Update complete!
echo =========================================
pause
