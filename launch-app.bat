@echo off
echo Starting Kegel Exercise Timer...

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