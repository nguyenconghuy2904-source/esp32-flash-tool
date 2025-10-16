# MinizFlash Firmware Repository Setup Script - Windows PowerShell
Write-Host "🚀 Setting up MinizFlash Firmware Repository..." -ForegroundColor Green

# Tạo thư mục firmware repository
$RepoName = "miniz-firmware"
Write-Host "📁 Creating repository directory: $RepoName" -ForegroundColor Cyan

New-Item -ItemType Directory -Path $RepoName -Force
Set-Location $RepoName

# Initialize git repository
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
git init
git branch -M main

# Tạo README.md
Write-Host "📝 Creating README.md..." -ForegroundColor Cyan
$ReadmeContent = @"
# MinizFlash Firmware Repository

Repository chứa firmware cho MinizFlash Tool - Công cụ nạp firmware ESP32 với xác thực key.

## 📋 Structure Firmware

### 🎯 Naming Convention
``````
{chip-type}-{firmware-category}.bin
``````

### 🔧 Supported Chips
- **ESP32-S3** - DevKit với WiFi, Bluetooth, Camera support
- **ESP32-S3-Zero** - Form factor nhỏ gọn 
- **ESP32-C3-Super-Mini** - Siêu nhỏ, giá rẻ

### 🚀 Firmware Categories

#### 🤖 Robot Otto
- ``esp32-s3-robot-otto.bin``
- ``esp32-s3-zero-robot-otto.bin``
- ``esp32-c3-robot-otto.bin``

#### 🐕 DogMaster  
- ``esp32-s3-dogmaster.bin``
- ``esp32-s3-zero-dogmaster.bin``
- ``esp32-c3-dogmaster.bin``

#### 💻 Smart Switch PC
- ``esp32-s3-smart-switch-pc.bin``
- ``esp32-s3-zero-smart-switch-pc.bin``
- ``esp32-c3-smart-switch-pc.bin``

## 📦 Latest Release: v1.0.0

### Download URLs:
``````
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-robot-otto.bin
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-c3-dogmaster.bin
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-zero-smart-switch-pc.bin
``````

## 🌐 Website Integration
**MinizFlash Tool:** https://minizjp.com

## 📞 Support
- **Zalo:** 0389827643  
- **YouTube:** www.youtube.com/@miniZjp

---
© 2025 MinizFlash Tool
"@

$ReadmeContent | Out-File -FilePath "README.md" -Encoding UTF8

# Tạo thư mục firmware samples
Write-Host "📂 Creating firmware directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "firmware\samples" -Force
Set-Location "firmware\samples"

# Tạo dummy firmware files để demo structure
Write-Host "🔧 Creating sample firmware files..." -ForegroundColor Yellow

# Robot Otto firmwares
"Sample Robot Otto firmware for ESP32-S3" | Out-File "esp32-s3-robot-otto.bin"
"Sample Robot Otto firmware for ESP32-S3-Zero" | Out-File "esp32-s3-zero-robot-otto.bin"
"Sample Robot Otto firmware for ESP32-C3" | Out-File "esp32-c3-robot-otto.bin"

# DogMaster firmwares
"Sample DogMaster firmware for ESP32-S3" | Out-File "esp32-s3-dogmaster.bin"
"Sample DogMaster firmware for ESP32-S3-Zero" | Out-File "esp32-s3-zero-dogmaster.bin"
"Sample DogMaster firmware for ESP32-C3" | Out-File "esp32-c3-dogmaster.bin"

# Smart Switch PC firmwares  
"Sample Smart Switch PC firmware for ESP32-S3" | Out-File "esp32-s3-smart-switch-pc.bin"
"Sample Smart Switch PC firmware for ESP32-S3-Zero" | Out-File "esp32-s3-zero-smart-switch-pc.bin"
"Sample Smart Switch PC firmware for ESP32-C3" | Out-File "esp32-c3-smart-switch-pc.bin"

Set-Location "..\..\"

# Tạo .gitignore
Write-Host "🚫 Creating .gitignore..." -ForegroundColor Cyan
$GitignoreContent = @"
# Build files
*.o
*.elf
*.map

# IDE files  
.vscode/
*.code-workspace

# OS files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
"@

$GitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8

# Tạo CHANGELOG.md
Write-Host "📜 Creating CHANGELOG.md..." -ForegroundColor Cyan
$ChangelogContent = @"
# Changelog

All notable changes to MinizFlash firmware will be documented in this file.

## [v1.0.0] - 2025-10-16

### 🤖 Robot Otto v2.1.5
#### Added
- 🤖 Điều khiển robot Otto thông minh
- 🎵 Nhận diện giọng nói và âm thanh  
- 👁️ Camera AI nhận diện đối tượng
- 📱 App điều khiển từ xa
- 🎮 Chế độ game tương tác
- 🔋 Quản lý pin thông minh

### 🐕 DogMaster v1.8.2
#### Added
- 🐕 Theo dõi hoạt động thú cưng 24/7
- 🍽️ Tự động cho ăn theo lịch trình
- 🔊 Phát âm thanh huấn luyện
- 📊 Báo cáo sức khỏe chi tiết  
- 📱 Thông báo realtime lên app
- 🎥 Ghi hình và livestream

### 💻 Smart Switch PC v3.0.1  
#### Added
- 💻 Bật/tắt máy tính từ xa
- 📊 Monitor nhiệt độ, tải CPU
- 🔄 Restart/shutdown tự động
- 📱 Điều khiển qua app mobile
- ⚡ Quản lý nguồn điện thông minh
- 🚨 Cảnh báo lỗi hệ thống
"@

$ChangelogContent | Out-File -FilePath "CHANGELOG.md" -Encoding UTF8

# First commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Magenta
git add .
git commit -m "🎉 Initial MinizFlash firmware repository setup

- ✅ Repository structure với naming convention
- ✅ Sample firmware files cho 3 categories × 3 chips
- ✅ Documentation và changelog
- ✅ Ready for GitHub integration với MinizFlash Tool"

Write-Host ""
Write-Host "✅ MinizFlash Firmware Repository đã được setup thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Tạo GitHub repository: https://github.com/new"
Write-Host "   - Repository name: miniz-firmware"
Write-Host "   - Description: MinizFlash Tool Firmware Repository"
Write-Host "   - Public repository"
Write-Host ""
Write-Host "2. Connect local repo với GitHub:" -ForegroundColor Cyan
Write-Host "   git remote add origin https://github.com/nguyenconghuy2904-source/miniz-firmware.git"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Tạo first release v1.0.0:" -ForegroundColor Magenta
Write-Host "   - Vào GitHub → Releases → Create new release"
Write-Host "   - Tag: v1.0.0"
Write-Host "   - Upload 9 firmware files từ firmware/samples/"
Write-Host ""
Write-Host "4. Update MinizFlash Tool config:" -ForegroundColor Yellow
Write-Host "   - Repository URL trong github-releases.ts"
Write-Host ""
Write-Host "🌐 Website: https://minizjp.com" -ForegroundColor Blue
Write-Host "📱 Zalo: 0389827643" -ForegroundColor Green
Write-Host "🎥 YouTube: www.youtube.com/@miniZjp" -ForegroundColor Red