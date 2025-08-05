@echo off
REM DocuHero Platform Start Script for Windows
REM This script starts the complete DocuHero platform including backend, frontend, and blockchain services

echo 🚀 Starting DocuHero Platform...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version
echo ✅ npm version: 
npm --version

REM Create necessary directories
echo Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "cache" mkdir cache
if not exist "artifacts" mkdir artifacts
if not exist "deployments" mkdir deployments

REM Kill existing processes on our ports (Windows version)
echo Checking for existing processes...
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Backend server might be running on port 3001
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F >nul 2>&1
)

netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Frontend server might be running on port 5173
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /PID %%a /F >nul 2>&1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    if exist .env.example (
        copy .env.example .env >nul
        echo 📝 Please update .env file with your configuration
    ) else (
        echo ⚠️  .env.example not found. Creating basic .env file...
        (
            echo # Database Configuration
            echo DATABASE_URL="postgresql://docuhero:password@localhost:5432/docuhero_dev"
            echo.
            echo # JWT Secret
            echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
            echo.
            echo # Frontend URL
            echo FRONTEND_URL="http://localhost:5173"
            echo.
            echo # Blockchain Configuration
            echo SEPOLIA_URL=""
            echo MAINNET_URL=""
            echo POLYGON_URL=""
            echo MUMBAI_URL=""
            echo PRIVATE_KEY=""
            echo ETHERSCAN_API_KEY=""
            echo POLYGONSCAN_API_KEY=""
            echo.
            echo # External Services
            echo OPENAI_API_KEY=""
            echo STRIPE_SECRET_KEY=""
            echo STRIPE_PUBLISHABLE_KEY=""
            echo.
            echo # Email Configuration
            echo SMTP_HOST=""
            echo SMTP_PORT="587"
            echo SMTP_USER=""
            echo SMTP_PASS=""
            echo.
            echo # File Upload
            echo MAX_FILE_SIZE="10485760"
            echo UPLOAD_DIR="./uploads"
            echo.
            echo # Logging
            echo LOG_LEVEL="info"
            echo NODE_ENV="development"
        ) > .env
    )
)

REM Menu for startup options
echo.
echo Choose startup option:
echo 1^) Full platform ^(Backend + Frontend + Database^)
echo 2^) Backend only
echo 3^) Frontend only
echo 4^) Full platform + Blockchain development node
echo 5^) Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto full_platform
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto frontend_only
if "%choice%"=="4" goto full_with_blockchain
if "%choice%"=="5" goto exit
goto invalid_choice

:full_platform
echo 🚀 Starting full DocuHero platform...
echo Initializing database...
call npx prisma generate 2>nul || echo ⚠️  Prisma generate failed or not configured
call npx prisma db push 2>nul || echo ⚠️  Database push failed or not configured
call npm run dev
goto end

:backend_only
echo 🔧 Starting backend server only...
call npm run dev:backend
goto end

:frontend_only
echo 🎨 Starting frontend only...
call npm run dev:frontend
goto end

:full_with_blockchain
echo 🚀 Starting full platform with blockchain...
echo Starting local blockchain node...
start /B cmd /c "npx hardhat node > logs\blockchain.log 2>&1"
timeout /t 5 /nobreak >nul
echo Compiling smart contracts...
call npm run blockchain:compile
if %errorlevel% equ 0 (
    echo Deploying smart contracts...
    call npm run blockchain:deploy -- --network localhost
)
call npm run dev
goto end

:exit
echo Goodbye! 👋
exit /b 0

:invalid_choice
echo ❌ Invalid choice. Please run the script again.
pause
exit /b 1

:end
if "%choice%"=="4" (
    echo.
    echo ✅ DocuHero platform is running!
    echo 📊 Frontend: http://localhost:5173
    echo 🔧 Backend: http://localhost:3001
    echo ⛓️  Blockchain: http://localhost:8545
    echo 📋 Health Check: http://localhost:3001/health
    echo.
    echo Press Ctrl+C to stop all services
)
pause