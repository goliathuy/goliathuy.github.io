@echo off
echo Starting Exercise Timer...

SETLOCAL EnableDelayedExpansion

:: Check for Python first
where python >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo Python found. Would you like to launch using Python's HTTP server? (Y/N)
    set /p choice=
    if /i "!choice!"=="Y" (
        echo Starting Python HTTP server...
        start cmd /k "python -m http.server 8000"
        timeout /t 3 > nul
        start "" "http://localhost:8000"
        goto :end
    )
)

:: Continue with browser fallback if Python is not chosen or not available
echo Launching in browser...

:: Try to use Chrome first, fall back to Edge, then default browser
:: Check if Chrome exists
IF EXIST "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" -new-window "file://%~dp0index.html"
    goto :end
)
IF EXIST "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" -new-window "file://%~dp0index.html"
    goto :end
)

:: Check if Edge exists
IF EXIST "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" -new-window "file://%~dp0index.html"
    goto :end
)
IF EXIST "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" -new-window "file://%~dp0index.html"
    goto :end
)

:: Fall back to default browser
start "" "file://%~dp0index.html"

:end
echo Application launched. You can close this window.
timeout /t 5
ENDLOCAL