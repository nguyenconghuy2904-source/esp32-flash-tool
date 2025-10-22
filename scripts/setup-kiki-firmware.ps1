# Setup Kiki đây Firmware Repository
# This script helps you create and setup the kiki-day-firmware repository

param(
    [string]$FirmwarePath = "",
    [string]$Version = "v1.0.0"
)

Write-Host "🚀 Setting up Kiki đây Firmware Repository..." -ForegroundColor Cyan
Write-Host ""

# Check if firmware file exists
if ([string]::IsNullOrEmpty($FirmwarePath)) {
    Write-Host "❌ Please provide firmware .bin file path!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-kiki-firmware.ps1 -FirmwarePath 'C:\path\to\esp32-s3-kiki-day.bin' -Version 'v1.0.0'" -ForegroundColor White
    Write-Host ""
    Write-Host "Steps to create firmware:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "  2. Repository name: kiki-day-firmware" -ForegroundColor White
    Write-Host "  3. Description: VIP Firmware for Kiki đây" -ForegroundColor White
    Write-Host "  4. Private: ✓ (recommended for VIP content)" -ForegroundColor White
    Write-Host "  5. Create repository" -ForegroundColor White
    Write-Host ""
    Write-Host "  6. Clone: git clone https://github.com/nguyenconghuy2904-source/kiki-day-firmware.git" -ForegroundColor White
    Write-Host "  7. Add README and firmware file" -ForegroundColor White
    Write-Host "  8. Create Release with firmware attached" -ForegroundColor White
    exit 1
}

if (-not (Test-Path $FirmwarePath)) {
    Write-Host "❌ Firmware file not found: $FirmwarePath" -ForegroundColor Red
    exit 1
}

$fileName = Split-Path $FirmwarePath -Leaf
$fileSize = (Get-Item $FirmwarePath).Length / 1MB
$fileSizeMB = [math]::Round($fileSize, 2)

Write-Host "📁 Firmware file: $fileName" -ForegroundColor Yellow
Write-Host "📊 File size: $fileSizeMB MB" -ForegroundColor Yellow
Write-Host "🏷️  Version: $Version" -ForegroundColor Yellow
Write-Host ""

# Check if git is installed
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Host "❌ Git not found! Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host "📝 Instructions to create GitHub Release:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Create repository (if not exists):" -ForegroundColor Green
Write-Host "   - Go to: https://github.com/new" -ForegroundColor White
Write-Host "   - Name: kiki-day-firmware" -ForegroundColor White
Write-Host "   - Private: ✓ (recommended)" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Clone repository:" -ForegroundColor Green
Write-Host "   git clone https://github.com/nguyenconghuy2904-source/kiki-day-firmware.git" -ForegroundColor White
Write-Host "   cd kiki-day-firmware" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Add files:" -ForegroundColor Green
Write-Host "   copy '$FirmwarePath' ." -ForegroundColor White
Write-Host "   copy '$PSScriptRoot\..\robot-otto-firmware\KIKI-README.md' README.md" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'feat: add Kiki đây VIP firmware $Version'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  Create Release:" -ForegroundColor Green
Write-Host "   - Go to: https://github.com/nguyenconghuy2904-source/kiki-day-firmware/releases/new" -ForegroundColor White
Write-Host "   - Tag: $Version" -ForegroundColor White
Write-Host "   - Title: Kiki đây VIP Firmware $Version" -ForegroundColor White
Write-Host "   - Description:" -ForegroundColor White
Write-Host ""
Write-Host "     🎉 Kiki đây VIP Firmware $Version" -ForegroundColor Gray
Write-Host "     " -ForegroundColor Gray
Write-Host "     ## ✨ Features" -ForegroundColor Gray
Write-Host "     - ⭐ VIP exclusive firmware" -ForegroundColor Gray
Write-Host "     - 🔐 Secure and optimized" -ForegroundColor Gray
Write-Host "     - 💎 Priority support" -ForegroundColor Gray
Write-Host "     - 🚀 Latest updates" -ForegroundColor Gray
Write-Host "     " -ForegroundColor Gray
Write-Host "     ## 📥 Installation" -ForegroundColor Gray
Write-Host "     1. Visit: https://minizjp.com" -ForegroundColor Gray
Write-Host "     2. Select ESP32-S3 chip" -ForegroundColor Gray
Write-Host "     3. Choose 'Kiki đây' firmware" -ForegroundColor Gray
Write-Host "     4. Enter your VIP key" -ForegroundColor Gray
Write-Host "     5. Flash firmware" -ForegroundColor Gray
Write-Host "     " -ForegroundColor Gray
Write-Host "     ## 🔑 Key Required" -ForegroundColor Gray
Write-Host "     Contact: Zalo 0389827643" -ForegroundColor Gray
Write-Host ""
Write-Host "   - Attach firmware file: $fileName" -ForegroundColor White
Write-Host "   - Publish release" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣  Test on website:" -ForegroundColor Green
Write-Host "   - Go to: https://minizjp.com" -ForegroundColor White
Write-Host "   - Select: ESP32-S3" -ForegroundColor White
Write-Host "   - Choose: Kiki đây" -ForegroundColor White
Write-Host "   - Enter VIP key" -ForegroundColor White
Write-Host "   - Flash firmware" -ForegroundColor White
Write-Host ""

Write-Host "✅ Ready to upload!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: Use GitHub Desktop for easier upload" -ForegroundColor Cyan
Write-Host "💡 Tip: Keep repository private for VIP exclusivity" -ForegroundColor Cyan
