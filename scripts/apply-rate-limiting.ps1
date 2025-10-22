# Apply Rate Limiting Migration
# Run this script to add rate limiting support to the database

Write-Host "🔒 Applying Rate Limiting Migration..." -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
$wranglerCheck = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wranglerCheck) {
    Write-Host "❌ Wrangler CLI not found!" -ForegroundColor Red
    Write-Host "Please install: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Change to cloudflare-workers directory
Set-Location "$PSScriptRoot\..\cloudflare-workers"

Write-Host "📋 Running migration: 0003_add_rate_limiting.sql" -ForegroundColor Yellow

# Apply migration
wrangler d1 execute esp32-flash-db --local --file=./migrations/0003_add_rate_limiting.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔒 Rate limiting now active:" -ForegroundColor Cyan
    Write-Host "  - Max 5 failed attempts per 15 minutes" -ForegroundColor White
    Write-Host "  - IP blocked for 60 minutes after max attempts" -ForegroundColor White
    Write-Host "  - Blocked IPs logged to database" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test locally: npm run dev" -ForegroundColor White
    Write-Host "  2. Deploy: wrangler deploy" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
