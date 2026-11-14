@echo off
title MnIntel Backend Gateway & Tunnel
echo ========================================================
echo   Starting MnIntel Backend Server and Cloudflare Tunnel
echo ========================================================
echo.

start "MnIntel Backend Server" cmd /k "node backend/server.js"
timeout /t 3 /nobreak >nul

start "Cloudflare Tunnel" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000"

echo.
echo Both services are now running!
echo Look at the "Cloudflare Tunnel" window to see your trycloudflare URL.
echo You can paste that URL directly into the "Global Connection Status"
echo page at https://mnintel.vercel.app to reconnect immediately.
echo.
pause
