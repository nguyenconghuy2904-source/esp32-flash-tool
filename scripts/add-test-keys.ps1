# Add Test Keys Migration
# Run this script to add 5 test keys that can be used with multiple devices

Write-Host "🔑 Adding Test Keys..." -ForegroundColor Cyan
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

Write-Host "📋 Running migration: 0004_add_test_keys.sql" -ForegroundColor Yellow
Write-Host ""

# Apply migration
wrangler d1 execute esp32-flash-db --local --file=./migrations/0004_add_test_keys.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Test keys added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔑 5 Test Keys (Unlimited use):" -ForegroundColor Cyan
    Write-Host "  1. 111111111" -ForegroundColor Yellow
    Write-Host "  2. 222222222" -ForegroundColor Yellow
    Write-Host "  3. 333333333" -ForegroundColor Yellow
    Write-Host "  4. 444444444" -ForegroundColor Yellow
    Write-Host "  5. 555555555" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✨ Features:" -ForegroundColor Cyan
    Write-Host "  - Can be used with multiple devices" -ForegroundColor White
    Write-Host "  - Unlimited uses (999,999 max)" -ForegroundColor White
    Write-Host "  - Perfect for testing and demos" -ForegroundColor White
    Write-Host "  - No device binding restriction" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Note: These are TEST keys only!" -ForegroundColor Yellow
    Write-Host "     For production, use unique keys per customer." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test locally: wrangler dev" -ForegroundColor White
    Write-Host "  2. Deploy: wrangler deploy" -ForegroundColor White
    Write-Host "  3. Share test keys with customers for demo" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
