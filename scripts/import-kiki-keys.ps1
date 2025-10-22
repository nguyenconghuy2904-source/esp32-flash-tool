# Import Kiki đây Keys to Cloudflare D1
# Usage: .\scripts\import-kiki-keys.ps1

param(
    [string]$KeyFile = "",
    [switch]$Production = $false
)

Write-Host "📤 Importing Kiki đây VIP Keys to Database..." -ForegroundColor Cyan
Write-Host ""

# Find latest key file if not specified
if ([string]::IsNullOrEmpty($KeyFile)) {
    $latestFile = Get-ChildItem -Path "keys" -Filter "kiki-day-keys-*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($null -eq $latestFile) {
        Write-Host "❌ No key files found in 'keys' directory!" -ForegroundColor Red
        Write-Host "Please run: .\scripts\generate-kiki-keys.ps1 first" -ForegroundColor Yellow
        exit 1
    }
    
    $KeyFile = $latestFile.FullName
}

if (-not (Test-Path $KeyFile)) {
    Write-Host "❌ Key file not found: $KeyFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Using key file: $KeyFile" -ForegroundColor Yellow
Write-Host ""

# Check if wrangler is installed
$wranglerCheck = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wranglerCheck) {
    Write-Host "❌ Wrangler CLI not found!" -ForegroundColor Red
    Write-Host "Please install: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Change to cloudflare-workers directory
Push-Location "$PSScriptRoot\..\cloudflare-workers"

try {
    if ($Production) {
        Write-Host "🚀 Importing to PRODUCTION database..." -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "Are you sure? Type 'YES' to confirm"
        
        if ($confirm -ne "YES") {
            Write-Host "❌ Import cancelled" -ForegroundColor Yellow
            exit 0
        }
        
        wrangler d1 execute esp32-flash-db --file="$KeyFile"
    } else {
        Write-Host "🧪 Importing to LOCAL database..." -ForegroundColor Yellow
        Write-Host ""
        wrangler d1 execute esp32-flash-db --local --file="$KeyFile"
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Keys imported successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Database stats:" -ForegroundColor Cyan
        
        # Query stats
        if ($Production) {
            $stats = wrangler d1 execute esp32-flash-db --command="SELECT COUNT(*) as total FROM auth_keys WHERE description LIKE '%Kiki%'"
        } else {
            $stats = wrangler d1 execute esp32-flash-db --local --command="SELECT COUNT(*) as total FROM auth_keys WHERE description LIKE '%Kiki%'"
        }
        
        Write-Host $stats
        Write-Host ""
        Write-Host "🎉 100 VIP keys ready for distribution!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Distribute keys to VIP customers" -ForegroundColor White
        Write-Host "   2. Track key usage in dashboard" -ForegroundColor White
        Write-Host "   3. Monitor database for activations" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Import failed!" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}
