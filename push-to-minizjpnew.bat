@echo off
echo ========================================
echo PUSH TO MINIZJPNEW REPOSITORY
echo ========================================
echo.

REM Prompt for Personal Access Token
set /p TOKEN="Nhap GitHub Personal Access Token cua conghuy93: "

if "%TOKEN%"=="" (
    echo [ERROR] Token khong duoc de trong!
    pause
    exit /b 1
)

echo.
echo [INFO] Removing old remote...
git remote remove minizjpnew 2>nul

echo [INFO] Adding new remote with token...
git remote add minizjpnew https://%TOKEN%@github.com/conghuy93/minizjpnew.git

echo [INFO] Pushing to minizjpnew...
git push minizjpnew main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Da push thanh cong!
    echo ========================================
    echo.
    echo Xem tai: https://github.com/conghuy93/minizjpnew
    echo.
) else (
    echo.
    echo ========================================
    echo [ERROR] Push that bai!
    echo ========================================
    echo.
    echo Vui long:
    echo 1. Kiem tra token co quyen 'repo'
    echo 2. Kiem tra account conghuy93 co quyen push
    echo 3. Xem huong dan chi tiet trong DEPLOY-TO-MINIZJPNEW.md
    echo.
)

pause



