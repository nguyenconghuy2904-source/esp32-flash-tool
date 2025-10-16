#!/bin/bash

# MinizFlash Firmware Repository Setup Script
echo "🚀 Setting up MinizFlash Firmware Repository..."

# Tạo thư mục firmware repository
REPO_NAME="miniz-firmware"
echo "📁 Creating repository directory: $REPO_NAME"

mkdir -p "$REPO_NAME"
cd "$REPO_NAME"

# Initialize git repository
echo "🔧 Initializing Git repository..."
git init
git branch -M main

# Tạo README.md
echo "📝 Creating README.md..."
cat > README.md << 'EOF'
# MinizFlash Firmware Repository

Repository chứa firmware cho MinizFlash Tool - Công cụ nạp firmware ESP32 với xác thực key.

## 📋 Structure Firmware

### 🎯 Naming Convention
```
{chip-type}-{firmware-category}.bin
```

### 🔧 Supported Chips
- **ESP32-S3** - DevKit với WiFi, Bluetooth, Camera support
- **ESP32-S3-Zero** - Form factor nhỏ gọn 
- **ESP32-C3-Super-Mini** - Siêu nhỏ, giá rẻ

### 🚀 Firmware Categories

#### 🤖 Robot Otto
- `esp32-s3-robot-otto.bin`
- `esp32-s3-zero-robot-otto.bin`
- `esp32-c3-robot-otto.bin`

#### 🐕 DogMaster  
- `esp32-s3-dogmaster.bin`
- `esp32-s3-zero-dogmaster.bin`
- `esp32-c3-dogmaster.bin`

#### 💻 Smart Switch PC
- `esp32-s3-smart-switch-pc.bin`
- `esp32-s3-zero-smart-switch-pc.bin`
- `esp32-c3-smart-switch-pc.bin`

## 📦 Latest Release: v1.0.0

### Download URLs:
```
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-robot-otto.bin
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-c3-dogmaster.bin
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-zero-smart-switch-pc.bin
```

## 🌐 Website Integration
**MinizFlash Tool:** https://minizjp.com

## 📞 Support
- **Zalo:** 0389827643  
- **YouTube:** www.youtube.com/@miniZjp

---
© 2025 MinizFlash Tool
EOF

# Tạo thư mục firmware samples
echo "📂 Creating firmware directories..."
mkdir -p firmware/samples

# Tạo dummy firmware files để demo structure
echo "🔧 Creating sample firmware files..."
cd firmware/samples

# Robot Otto firmwares
echo "Sample Robot Otto firmware for ESP32-S3" > esp32-s3-robot-otto.bin
echo "Sample Robot Otto firmware for ESP32-S3-Zero" > esp32-s3-zero-robot-otto.bin  
echo "Sample Robot Otto firmware for ESP32-C3" > esp32-c3-robot-otto.bin

# DogMaster firmwares
echo "Sample DogMaster firmware for ESP32-S3" > esp32-s3-dogmaster.bin
echo "Sample DogMaster firmware for ESP32-S3-Zero" > esp32-s3-zero-dogmaster.bin
echo "Sample DogMaster firmware for ESP32-C3" > esp32-c3-dogmaster.bin

# Smart Switch PC firmwares  
echo "Sample Smart Switch PC firmware for ESP32-S3" > esp32-s3-smart-switch-pc.bin
echo "Sample Smart Switch PC firmware for ESP32-S3-Zero" > esp32-s3-zero-smart-switch-pc.bin
echo "Sample Smart Switch PC firmware for ESP32-C3" > esp32-c3-smart-switch-pc.bin

cd ../..

# Tạo .gitignore
echo "🚫 Creating .gitignore..."
cat > .gitignore << 'EOF'
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
EOF

# Tạo CHANGELOG.md
echo "📜 Creating CHANGELOG.md..."
cat > CHANGELOG.md << 'EOF'
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
EOF

# First commit
echo "💾 Creating initial commit..."
git add .
git commit -m "🎉 Initial MinizFlash firmware repository setup

- ✅ Repository structure với naming convention
- ✅ Sample firmware files cho 3 categories × 3 chips
- ✅ Documentation và changelog
- ✅ Ready for GitHub integration với MinizFlash Tool"

echo ""
echo "✅ MinizFlash Firmware Repository đã được setup thành công!"
echo ""
echo "📋 Next Steps:"
echo "1. Tạo GitHub repository: https://github.com/new"
echo "   - Repository name: miniz-firmware"
echo "   - Description: MinizFlash Tool Firmware Repository"
echo "   - Public repository"
echo ""
echo "2. Connect local repo với GitHub:"
echo "   git remote add origin https://github.com/nguyenconghuy2904-source/miniz-firmware.git"
echo "   git push -u origin main"
echo ""
echo "3. Tạo first release v1.0.0:"
echo "   - Vào GitHub → Releases → Create new release"
echo "   - Tag: v1.0.0"
echo "   - Upload 9 firmware files từ firmware/samples/"
echo ""
echo "4. Update MinizFlash Tool config:"
echo "   - Repository URL trong github-releases.ts"
echo ""
echo "🌐 Website: https://minizjp.com"
echo "📱 Zalo: 0389827643"
echo "🎥 YouTube: www.youtube.com/@miniZjp"
EOF