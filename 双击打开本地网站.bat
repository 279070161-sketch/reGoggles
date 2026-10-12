@echo off
chcp 65001 >nul
title reGoggles 本地预览启动器

echo ===================================================================
echo   reGoggles - 正在启动本地服务...
echo   浏览器将自动打开：http://localhost:3000
echo   (如需关闭服务，直接关闭此窗口即可)
echo ===================================================================

:: 延迟 1 秒后自动弹出默认浏览器
start "" http://localhost:3000

:: 启动 Vite 开发服务
npm run dev
