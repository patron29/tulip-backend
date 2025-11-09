@echo off
REM Tulip Backend - Automated Setup Script for Windows
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    Tulip Backend - Automated Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% found
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Generate JWT secret
echo Generating secure JWT secret...
for /f "tokens=*" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%i
echo [OK] JWT secret generated
echo.

REM Check if .env exists
if exist .env (
    echo [INFO] .env file already exists. Creating backup...
    copy .env .env.backup >nul
    echo [OK] Backup created as .env.backup
)

REM MongoDB setup
echo.
echo How do you want to set up MongoDB?
echo 1. Local MongoDB (you'll install it separately)
echo 2. MongoDB Atlas (cloud - free tier available)
echo.
set /p "mongo_choice=Choose option (1 or 2): "

if "%mongo_choice%"=="2" (
    echo.
    echo MongoDB Atlas Setup:
    echo 1. Go to https://www.mongodb.com/atlas
    echo 2. Sign up for free
    echo 3. Create a new cluster (free tier^)
    echo 4. Create a database user with password
    echo 5. Whitelist your IP (or use 0.0.0.0/0 for development^)
    echo 6. Get your connection string (looks like mongodb+srv://...^)
    echo.
    set /p "MONGODB_URI=Enter your MongoDB Atlas connection string: "
) else (
    set "MONGODB_URI=mongodb://localhost:27017/tulip"
    echo [INFO] Using local MongoDB. Make sure MongoDB is running on your machine!
    echo [INFO] Download MongoDB from: https://www.mongodb.com/try/download/community
)

REM Get frontend URL
echo.
set /p "FRONTEND_URL=Enter your frontend URL (press Enter for http://localhost:3000): "
if "%FRONTEND_URL%"=="" set "FRONTEND_URL=http://localhost:3000"

REM Create .env file
(
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # Database
echo MONGODB_URI=%MONGODB_URI%
echo.
echo # Security
echo JWT_SECRET=%JWT_SECRET%
echo.
echo # Frontend
echo FRONTEND_URL=%FRONTEND_URL%
) > .env

echo [OK] .env file created
echo.

REM Create start script
(
echo @echo off
echo echo Starting Tulip Backend...
echo npm run dev
) > start-dev.bat

REM Create test script
(
echo @echo off
echo echo Testing Tulip API...
echo echo.
echo echo 1. Health Check:
echo curl -s http://localhost:5000/api/health
echo echo.
echo echo.
echo echo 2. Testing Signup:
echo curl -s -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
echo echo.
) > test-api.bat

echo [OK] Helper scripts created (start-dev.bat, test-api.bat^)
echo.

REM Display summary
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your configuration:
echo   * Port: 5000
echo   * Frontend: %FRONTEND_URL%
echo   * MongoDB: configured
echo.
echo Quick commands:
echo   * Start server:    start-dev.bat  (or npm run dev^)
echo   * Test API:        test-api.bat
echo.
echo Next steps:
echo   1. Start the backend: start-dev.bat
echo   2. In another terminal, test it: test-api.bat
echo   3. Update your frontend's API_BASE_URL to: http://localhost:5000/api
echo.
echo Happy coding!
echo.
pause
