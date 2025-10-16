@echo off
REM Deployment script for ESP32 Flash Tool (Windows)
REM This script helps deploy the application to different platforms

echo 🚀 ESP32 Flash Tool Deployment Script
echo ======================================

:menu
echo.
echo Select deployment option:
echo 1) Deploy to Vercel
echo 2) Deploy to Netlify
echo 3) Setup GitHub Pages
echo 4) Deploy Cloudflare Workers
echo 5) Setup Cloudflare D1 Database
echo 6) Full setup (Workers + Database)
echo q) Quit
echo.

set /p choice="Enter your choice: "

if "%choice%"=="1" goto deploy_vercel
if "%choice%"=="2" goto deploy_netlify
if "%choice%"=="3" goto setup_github_pages
if "%choice%"=="4" goto deploy_workers
if "%choice%"=="5" goto setup_database
if "%choice%"=="6" goto full_setup
if "%choice%"=="q" goto quit
if "%choice%"=="Q" goto quit

echo Invalid option. Please try again.
goto menu

:deploy_vercel
echo 📦 Deploying to Vercel...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo 🔧 Setting environment variables...
vercel env add NEXT_PUBLIC_API_URL production

echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Vercel deployment completed!
goto end

:deploy_netlify
echo 📦 Deploying to Netlify...

REM Check if Netlify CLI is installed
where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Netlify CLI...
    npm install -g netlify-cli
)

echo 🔨 Building project for Netlify...
npm run build

echo 🚀 Deploying to Netlify...
netlify deploy --prod --dir=out

echo ✅ Netlify deployment completed!
goto end

:setup_github_pages
echo 📦 Setting up GitHub Pages deployment...

echo 📝 To complete GitHub Pages setup:
echo 1. Push your code to GitHub repository
echo 2. Go to repository Settings ^> Pages
echo 3. Select 'GitHub Actions' as source
echo 4. The workflow will automatically deploy on push to main branch
echo.
echo 🔧 Don't forget to set your API URL in GitHub repository secrets:
echo    NEXT_PUBLIC_API_URL=https://your-cloudflare-worker.workers.dev

echo ✅ GitHub Pages setup instructions provided!
goto end

:deploy_workers
echo 📦 Deploying Cloudflare Workers...

cd cloudflare-workers

REM Check if Wrangler is installed
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Wrangler CLI...
    npm install -g wrangler
)

echo 📦 Installing Worker dependencies...
npm install

echo 🚀 Deploying Worker...
wrangler deploy

cd ..
echo ✅ Cloudflare Workers deployment completed!
goto end

:setup_database
echo 🗄️ Setting up Cloudflare D1 Database...

cd cloudflare-workers

echo 📦 Creating D1 database...
wrangler d1 create esp32-flash-keys

echo.
echo ⚠️  IMPORTANT: Copy the database ID from above and update wrangler.toml
echo.
echo After updating wrangler.toml, run:
echo   cd cloudflare-workers
echo   wrangler d1 migrations apply esp32-flash-keys --remote

cd ..
echo ✅ Database setup instructions provided!
goto end

:full_setup
call :setup_database
call :deploy_workers
goto end

:quit
echo Goodbye!
exit /b 0

:end
pause
goto menu