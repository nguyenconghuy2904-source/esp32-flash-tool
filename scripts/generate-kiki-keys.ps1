# Generate 100 VIP Keys for Kiki đây Firmware
# Keys are 9-digit numeric format
# Run: .\scripts\generate-kiki-keys.ps1

Write-Host "🔑 Generating 100 VIP Keys for Kiki đây..." -ForegroundColor Cyan
Write-Host ""

# Generate 100 unique 9-digit keys
$keys = @()
$usedKeys = @{}

while ($keys.Count -lt 100) {
    # Generate random 9-digit number
    $key = Get-Random -Minimum 100000000 -Maximum 999999999
    
    # Ensure uniqueness
    if (-not $usedKeys.ContainsKey($key)) {
        $keys += $key.ToString()
        $usedKeys[$key] = $true
    }
}

# Sort keys for easier management
$keys = $keys | Sort-Object

# Create output directory
$outputDir = "keys"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$fileName = "kiki-day-keys-$timestamp.txt"
$filePath = "$outputDir\$fileName"

# Write to file with header
$header = @"
# KIKI ĐÂY - VIP KEYS
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Total Keys: 100
# Firmware: Kiki đây (VIP Exclusive)
# Description: Dành riêng cho khách hàng VIP
# Contact: Zalo 0389827643
#
# Format: 9 chữ số
# Usage: Mỗi key chỉ dùng 1 lần cho 1 thiết bị
#
# ================================================
# KEY LIST (100 KEYS)
# ================================================

"@

$header | Out-File -FilePath $filePath -Encoding UTF8

# Write keys
for ($i = 0; $i -lt $keys.Count; $i++) {
    $keyNumber = $i + 1
    "$keyNumber. $($keys[$i])" | Out-File -FilePath $filePath -Append -Encoding UTF8
}

Write-Host "✅ Generated 100 keys successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 File saved: $filePath" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Sample keys:" -ForegroundColor Cyan
for ($i = 0; $i -lt 5; $i++) {
    Write-Host "   $($i+1). $($keys[$i])" -ForegroundColor White
}
Write-Host "   ..." -ForegroundColor Gray
Write-Host ""

# Create JSON file for database import
$jsonFileName = "kiki-day-keys-$timestamp.json"
$jsonFilePath = "$outputDir\$jsonFileName"

$keysJson = @{
    firmware = "kiki-day"
    description = "VIP Keys for Kiki đây firmware"
    generated_at = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    total = $keys.Count
    keys = $keys
} | ConvertTo-Json -Depth 10

$keysJson | Out-File -FilePath $jsonFilePath -Encoding UTF8

Write-Host "📄 JSON export: $jsonFilePath" -ForegroundColor Yellow
Write-Host ""

# Create SQL insert script
$sqlFileName = "kiki-day-keys-$timestamp.sql"
$sqlFilePath = "$outputDir\$sqlFileName"

$sqlHeader = @"
-- KIKI ĐÂY VIP KEYS
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Total: 100 keys
-- Firmware: Kiki đây

-- Insert keys into auth_keys table
"@

$sqlHeader | Out-File -FilePath $sqlFilePath -Encoding UTF8

foreach ($key in $keys) {
    "INSERT INTO auth_keys (key_hash, description, created_at) VALUES ('$key', 'Kiki đây VIP Key', datetime('now'));" | Out-File -FilePath $sqlFilePath -Append -Encoding UTF8
}

Write-Host "💾 SQL script: $sqlFilePath" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review keys in: $filePath" -ForegroundColor White
Write-Host "   2. Import to database using SQL script" -ForegroundColor White
Write-Host "   3. Or use API: .\scripts\add-test-keys.ps1" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Keep these keys secure!" -ForegroundColor Red
Write-Host "   - Do not share publicly" -ForegroundColor Yellow
Write-Host "   - One key per customer" -ForegroundColor Yellow
Write-Host "   - Track key distribution" -ForegroundColor Yellow
