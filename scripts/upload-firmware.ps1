# Script tự động upload firmware lên GitHub Releases
# Upload Firmware to MinizJP.com via GitHub Releases

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$false)]
    [string]$FirmwarePath = ".\firmware",
    
    [Parameter(Mandatory=$false)]
    [string]$ReleaseNotes = ""
)

Write-Host "=== MinizFlash Firmware Uploader ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra GitHub CLI
Write-Host "[1] Checking GitHub CLI..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Host "  ✓ GitHub CLI installed: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ GitHub CLI not found!" -ForegroundColor Red
    Write-Host "    Install: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Kiểm tra authentication
Write-Host "[2] Checking GitHub authentication..." -ForegroundColor Yellow
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Authenticated to GitHub" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Not authenticated!" -ForegroundColor Red
        Write-Host "    Run: gh auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  ✗ Authentication check failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Kiểm tra thư mục firmware
Write-Host "[3] Checking firmware directory..." -ForegroundColor Yellow
if (Test-Path $FirmwarePath) {
    $firmwareFiles = Get-ChildItem -Path $FirmwarePath -Filter "*.bin"
    Write-Host "  ✓ Found $($firmwareFiles.Count) firmware files" -ForegroundColor Green
    
    foreach ($file in $firmwareFiles) {
        Write-Host "    - $($file.Name) ($([math]::Round($file.Length/1KB, 2)) KB)" -ForegroundColor Gray
    }
    
    if ($firmwareFiles.Count -eq 0) {
        Write-Host "  ✗ No .bin files found in $FirmwarePath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ Firmware directory not found: $FirmwarePath" -ForegroundColor Red
    Write-Host "    Create directory and add .bin files" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Validate firmware names
Write-Host "[4] Validating firmware filenames..." -ForegroundColor Yellow
$validPattern = "^(esp32-s3|esp32-s3-zero|esp32-c3-super-mini)-(robot-otto|dogmaster|smart-switch-pc)\.bin$"
$invalidFiles = @()

foreach ($file in $firmwareFiles) {
    if ($file.Name -notmatch $validPattern) {
        $invalidFiles += $file.Name
    }
}

if ($invalidFiles.Count -gt 0) {
    Write-Host "  ⚠ Warning: Invalid filenames found:" -ForegroundColor Yellow
    foreach ($invalid in $invalidFiles) {
        Write-Host "    - $invalid" -ForegroundColor Red
    }
    Write-Host "  Expected format: {chip}-{category}.bin" -ForegroundColor Gray
    Write-Host "  Example: esp32-s3-robot-otto.bin" -ForegroundColor Gray
    
    $continue = Read-Host "  Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "  ✓ All filenames are valid" -ForegroundColor Green
}
Write-Host ""

# Generate release notes if not provided
if ([string]::IsNullOrWhiteSpace($ReleaseNotes)) {
    $ReleaseNotes = @"
## 🚀 MinizFlash Firmware $Version

### 📦 Firmware Updates

#### 🤖 Robot Otto
- ✨ New features and improvements
- 🐛 Bug fixes

**Files:** esp32-s3-robot-otto.bin, esp32-s3-zero-robot-otto.bin, esp32-c3-super-mini-robot-otto.bin  
**Yêu cầu:** 🔑 Key

---

#### 🐕 DogMaster
- ✨ New features and improvements
- 🐛 Bug fixes

**Files:** esp32-s3-dogmaster.bin, esp32-s3-zero-dogmaster.bin, esp32-c3-super-mini-dogmaster.bin  
**Yêu cầu:** 🔑 Key

---

#### 💻 Smart Switch PC
- ✨ New features and improvements
- 🐛 Bug fixes

**Files:** esp32-s3-smart-switch-pc.bin, esp32-s3-zero-smart-switch-pc.bin, esp32-c3-super-mini-smart-switch-pc.bin  
**Yêu cầu:** 🆓 Miễn phí

---

### 📥 Installation
1. Visit: https://minizjp.com
2. Select chip & firmware
3. Enter key (if required)
4. Flash firmware

🔑 **Get Key:** Zalo 0389827643 | YouTube @miniZjp
"@
}

# Save release notes to temp file
$releaseNotesFile = [System.IO.Path]::GetTempFileName()
$ReleaseNotes | Out-File -FilePath $releaseNotesFile -Encoding UTF8

# Confirm
Write-Host "[5] Release Summary" -ForegroundColor Yellow
Write-Host "  Version: $Version" -ForegroundColor White
Write-Host "  Files: $($firmwareFiles.Count) firmware(s)" -ForegroundColor White
Write-Host "  Total Size: $([math]::Round(($firmwareFiles | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Ready to create release and upload firmware? (y/N)"
if ($confirm -ne "y") {
    Write-Host "  Cancelled by user" -ForegroundColor Yellow
    Remove-Item $releaseNotesFile
    exit 0
}
Write-Host ""

# Create GitHub Release
Write-Host "[6] Creating GitHub Release..." -ForegroundColor Yellow
try {
    $releaseOutput = gh release create $Version `
        --title "MinizFlash Firmware $Version" `
        --notes-file $releaseNotesFile `
        --repo nguyenconghuy2904-source/esp32-flash-tool `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Release created successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to create release" -ForegroundColor Red
        Write-Host "  Error: $releaseOutput" -ForegroundColor Red
        Remove-Item $releaseNotesFile
        exit 1
    }
} catch {
    Write-Host "  ✗ Error creating release: $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $releaseNotesFile
    exit 1
}
Write-Host ""

# Upload firmware files
Write-Host "[7] Uploading firmware files..." -ForegroundColor Yellow
$uploadedCount = 0
$failedCount = 0

foreach ($file in $firmwareFiles) {
    Write-Host "  Uploading $($file.Name)..." -ForegroundColor Gray
    
    try {
        $uploadOutput = gh release upload $Version $file.FullName `
            --repo nguyenconghuy2904-source/esp32-flash-tool `
            --clobber `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Uploaded successfully" -ForegroundColor Green
            $uploadedCount++
        } else {
            Write-Host "    ✗ Upload failed: $uploadOutput" -ForegroundColor Red
            $failedCount++
        }
    } catch {
        Write-Host "    ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    }
}
Write-Host ""

# Cleanup
Remove-Item $releaseNotesFile

# Summary
Write-Host "=== Upload Summary ===" -ForegroundColor Cyan
Write-Host "  Version: $Version" -ForegroundColor White
Write-Host "  Uploaded: $uploadedCount files" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "  Failed: $failedCount files" -ForegroundColor Red
}
Write-Host ""

if ($failedCount -eq 0) {
    Write-Host "✓ All firmware files uploaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View release:" -ForegroundColor Cyan
    Write-Host "  https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases/tag/$Version" -ForegroundColor White
    Write-Host ""
    Write-Host "Test on website:" -ForegroundColor Cyan
    Write-Host "  https://minizjp.com" -ForegroundColor White
} else {
    Write-Host "⚠ Some files failed to upload. Please check errors above." -ForegroundColor Yellow
}
Write-Host ""
