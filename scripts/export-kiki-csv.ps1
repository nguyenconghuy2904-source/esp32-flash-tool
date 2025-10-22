# Export Kiki đây Keys to CSV for Customer Management
# Creates CSV file for tracking key distribution

param(
    [string]$InputFile = ""
)

Write-Host "📊 Exporting Kiki đây Keys to CSV..." -ForegroundColor Cyan
Write-Host ""

# Find latest JSON file
if ([string]::IsNullOrEmpty($InputFile)) {
    $latestFile = Get-ChildItem -Path "keys" -Filter "kiki-day-keys-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($null -eq $latestFile) {
        Write-Host "❌ No key files found!" -ForegroundColor Red
        exit 1
    }
    
    $InputFile = $latestFile.FullName
}

# Read JSON
$jsonContent = Get-Content $InputFile -Raw | ConvertFrom-Json
$keys = $jsonContent.keys

# Create CSV data
$csvData = @()
$csvData += "STT,Key,TrangThai,KhachHang,SDT,Email,NgayGiao,NgayKichHoat,GhiChu"

for ($i = 0; $i -lt $keys.Count; $i++) {
    $stt = $i + 1
    $key = $keys[$i]
    # Add empty fields for customer info
    $csvData += "$stt,$key,ChuaGiao,,,,,,"
}

# Output file
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputFile = "keys\kiki-day-distribution-$timestamp.csv"

$csvData | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✅ CSV exported successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 File: $outputFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 CSV Format:" -ForegroundColor Cyan
Write-Host "   - STT: Số thứ tự" -ForegroundColor White
Write-Host "   - Key: Mã key 9 số" -ForegroundColor White
Write-Host "   - TrangThai: ChuaGiao/DaGiao/DaKichHoat" -ForegroundColor White
Write-Host "   - KhachHang: Tên khách hàng" -ForegroundColor White
Write-Host "   - SDT: Số điện thoại" -ForegroundColor White
Write-Host "   - Email: Email khách hàng" -ForegroundColor White
Write-Host "   - NgayGiao: Ngày giao key" -ForegroundColor White
Write-Host "   - NgayKichHoat: Ngày key được kích hoạt" -ForegroundColor White
Write-Host "   - GhiChu: Ghi chú thêm" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Mở file bằng Excel để quản lý dễ hơn" -ForegroundColor Cyan

# Create Excel-friendly version with UTF-8 BOM
$bomBytes = [byte[]](0xEF, 0xBB, 0xBF)
$csvBytes = [System.Text.Encoding]::UTF8.GetBytes(($csvData -join "`r`n"))
$allBytes = $bomBytes + $csvBytes

$excelFile = "keys\kiki-day-distribution-$timestamp-excel.csv"
[System.IO.File]::WriteAllBytes($excelFile, $allBytes)

Write-Host ""
Write-Host "📊 Excel version: $excelFile" -ForegroundColor Green
Write-Host "   (Có BOM để Excel đọc được tiếng Việt)" -ForegroundColor Gray
