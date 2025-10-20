# Upload 3D File Script
# Usage: .\scripts\upload-3d-file.ps1 -ProjectName "robot-otto" -FilePath "C:\path\to\file.stl"

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
$allowedExtensions = @('.stl', '.step', '.stp', '.obj', '.3mf')

if ($extension -notin $allowedExtensions) {
    Write-Host "❌ File phải là định dạng 3D: .stl, .step, .obj, .3mf" -ForegroundColor Red
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
    Write-Host "✅ Đã upload file 3D thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Vị trí: $targetFile" -ForegroundColor Yellow
    Write-Host "🌐 URL: /3d-files/$ProjectName$extension" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Hãy cập nhật file3dUrl trong src/app/page.tsx:" -ForegroundColor Cyan
    Write-Host "   file3dUrl: '/3d-files/$ProjectName$extension'" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Sau đó commit và push để deploy:" -ForegroundColor Cyan
    Write-Host "   git add public/3d-files/$ProjectName$extension" -ForegroundColor White
    Write-Host "   git commit -m 'feat: add 3D file for $ProjectName'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
} else {
    Write-Host "❌ Lỗi khi upload file!" -ForegroundColor Red
    exit 1
}
