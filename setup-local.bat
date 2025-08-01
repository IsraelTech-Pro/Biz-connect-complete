@echo off
echo ===========================================
echo KTU BizConnect - Local Setup Script
echo ===========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed
node --version

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo ✓ npm is available
npm --version

REM Install dependencies
echo.
echo Installing project dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed successfully

REM Check if .env file exists
if not exist .env (
    echo.
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file and update your PostgreSQL password
    echo    Look for YOUR_POSTGRES_PASSWORD and replace it with your actual password
    echo.
    pause
)

REM Check if PostgreSQL is accessible
echo.
echo Checking PostgreSQL connection...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL command line tools not found in PATH
    echo    Make sure PostgreSQL is installed and added to PATH
    echo    You can still use pgAdmin to manage the database
    echo.
) else (
    echo ✓ PostgreSQL command line tools are available
    psql --version
)

echo.
echo ===========================================
echo Setup Complete!
echo ===========================================
echo.
echo Next steps:
echo 1. Edit the .env file with your PostgreSQL password
echo 2. Create database 'ktu_bizconnect_local' in pgAdmin or psql
echo 3. Run: npm run db:push
echo 4. Run: npm run dev
echo.
echo See LOCAL_SETUP_GUIDE.md for detailed instructions
echo.
pause