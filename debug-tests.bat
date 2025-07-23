@echo off
echo Starting Test Server for Kegel Timer...

:: Start Python HTTP server
echo.
echo Starting Python HTTP server on port 8000...
start cmd /k "python -m http.server 8000"
timeout /t 3 > nul

:: Open VS Code if it's not already open
echo.
echo Opening VS Code for debugging...
code .

echo.
echo To debug tests:
echo 1. In VS Code, press F5 or click the Run and Debug icon
echo 2. Select "Debug Tests" from the dropdown menu
echo 3. Click the green play button
echo.
echo Server is running. You can close this window after debugging.
pause