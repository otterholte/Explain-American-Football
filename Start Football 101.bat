@echo off
cd /d "%~dp0"
start "" http://localhost:8101
node serve.js
