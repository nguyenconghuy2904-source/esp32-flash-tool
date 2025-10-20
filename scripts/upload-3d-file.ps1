# Upload 3D File Script
# Usage: .\scripts\upload-3d-file.ps1 -ProjectName "robot-otto" -FilePath "C:\path\to\file.zip"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "❌ File không tồn tại: $FilePath" -ForegroundColor Red
    exit 1
}

# Get file extension
$extension = [System.IO.Path]::GetExtension($FilePath)

if ($extension -ne '.zip') {
    Write-Host "❌ File phải là định dạng .zip" -ForegroundColor Red
    Write-Host "💡 Vui lòng nén tất cả file 3D (STL, STEP, v.v.) vào file .zip" -ForegroundColor Yellow
    exit 1
}

# Target directory
$targetDir = "public\3d-files"
$targetFile = "$targetDir\$ProjectName$extension"

# Create directory if not exists
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Copy file
Write-Host "📂 Đang sao chép file 3D..." -ForegroundColor Cyan
Copy-Item -Path $FilePath -Destination $targetFile -Force

if (Test-Path $targetFile) {
    Write-Host "✅ Đã upload file 3D ZIP thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Vị trí: $targetFile" -ForegroundColor Yellow
    Write-Host "🌐 URL: /3d-files/$ProjectName.zip" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Hãy cập nhật file3dUrl trong src/app/page.tsx:" -ForegroundColor Cyan
    Write-Host "   file3dUrl: '/3d-files/$ProjectName.zip'" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Nội dung file ZIP nên bao gồm:" -ForegroundColor Cyan
    Write-Host "   - File STL, STEP, hoặc định dạng 3D khác" -ForegroundColor White
    Write-Host "   - README.txt (tùy chọn) để hướng dẫn" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Sau đó commit và push để deploy:" -ForegroundColor Cyan
    Write-Host "   git add public/3d-files/$ProjectName.zip" -ForegroundColor White
    Write-Host "   git commit -m 'feat: add 3D files for $ProjectName'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
} else {
    Write-Host "❌ Lỗi khi upload file!" -ForegroundColor Red
    exit 1
}
