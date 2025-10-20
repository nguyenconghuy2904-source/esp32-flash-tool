# Script để upload sơ đồ PDF vào web

param(
    [Parameter(Mandatory=$true)]
    [string]$PdfFile,
    
    [Parameter(Mandatory=$true)]
    [string]$ProjectName
)

$ErrorActionPreference = "Stop"

# Validate PDF file exists
if (-not (Test-Path $PdfFile)) {
    Write-Host "❌ File không tồn tại: $PdfFile" -ForegroundColor Red
    exit 1
}

# Validate file is PDF
if ([System.IO.Path]::GetExtension($PdfFile) -ne ".pdf") {
    Write-Host "❌ File phải có định dạng .pdf" -ForegroundColor Red
    exit 1
}

# Get file size
$fileSize = (Get-Item $PdfFile).Length / 1MB
if ($fileSize -gt 5) {
    Write-Host "⚠️  Cảnh báo: File lớn hơn 5MB ($($fileSize.ToString('0.00'))MB)" -ForegroundColor Yellow
    Write-Host "Nên nén file để load nhanh hơn" -ForegroundColor Yellow
}

# Create destination filename
$destFileName = "$ProjectName-wiring.pdf"
$destPath = Join-Path $PSScriptRoot "..\public\schematics" $destFileName

Write-Host "📋 Uploading schematic PDF..." -ForegroundColor Cyan
Write-Host "Source: $PdfFile" -ForegroundColor Gray
Write-Host "Destination: $destPath" -ForegroundColor Gray

# Copy file
Copy-Item -Path $PdfFile -Destination $destPath -Force

Write-Host "✅ PDF copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit: git add public/schematics/$destFileName" -ForegroundColor White
Write-Host "2. Commit: git commit -m 'docs: add $ProjectName schematic diagram'" -ForegroundColor White
Write-Host "3. Push: git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "🌐 File sẽ có tại: https://minizjp.com/schematics/$destFileName" -ForegroundColor Cyan

# Update page.tsx schematicUrl reference
Write-Host ""
Write-Host "💡 Cập nhật schematicUrl trong src/app/page.tsx:" -ForegroundColor Yellow
Write-Host "schematicUrl: '/schematics/$destFileName'" -ForegroundColor White
