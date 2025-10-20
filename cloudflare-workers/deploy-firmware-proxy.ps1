# Deploy firmware proxy to Cloudflare Workers

Write-Host "Deploying firmware proxy to Cloudflare Workers..." -ForegroundColor Green

# Check if wrangler is installed
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "Error: wrangler CLI not found!" -ForegroundColor Red
    Write-Host "Install: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Deploy
Set-Location $PSScriptRoot

Write-Host "Publishing firmware-proxy worker..." -ForegroundColor Cyan
wrangler deploy firmware-proxy.ts --name firmware-proxy --compatibility-date 2024-01-01

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Firmware proxy deployed successfully!" -ForegroundColor Green
    Write-Host "URL: https://firmware-proxy.minizjp.workers.dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: https://firmware-proxy.minizjp.workers.dev?url=GITHUB_RELEASE_URL" -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}
