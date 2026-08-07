@echo off
chcp 65001 >nul
title chat - 本地服务器 (localhost:8000)
cd /d "%~dp0chat"

where python >nul 2>nul
if %errorlevel%==0 (
    echo 正在启动服务器...
    start "" http://localhost:8000/手机模式.html
    python -m http.server 8000 --bind 127.0.0.1
) else (
    echo [错误] 未检测到 Python，请先安装 Python 3。
    pause
)