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
Firmware điều khiển robot Otto với AI và học máy
- `esp32-s3-robot-otto.bin`
- `esp32-s3-zero-robot-otto.bin`
- `esp32-c3-robot-otto.bin`

#### 🐕 DogMaster  
Hệ thống huấn luyện và quản lý thú cưng thông minh
- `esp32-s3-dogmaster.bin`
- `esp32-s3-zero-dogmaster.bin`
- `esp32-c3-dogmaster.bin`

#### 💻 Smart Switch PC
Điều khiển máy tính từ xa thông minh
- `esp32-s3-smart-switch-pc.bin`
- `esp32-s3-zero-smart-switch-pc.bin`
- `esp32-c3-smart-switch-pc.bin`

## 📦 Releases

### v1.0.0 - Initial Release (Latest)

#### 🤖 Robot Otto v2.1.5
**Tính năng:**
- 🤖 Điều khiển robot Otto thông minh
- 🎵 Nhận diện giọng nói và âm thanh  

- 📱 App điều khiển từ xa
- 🎮 Chế độ game tương tác
- 🔋 Quản lý pin thông minh

**Yêu cầu Key:** ❌ Miễn phí

#### 🐕 DogMaster v1.8.2
**Tính năng:**
- 🐕 Theo dõi hoạt động thú cưng 24/7
- 🍽️ Tự động cho ăn theo lịch trình
- 🔊 Phát âm thanh huấn luyện
- 📊 Báo cáo sức khỏe chi tiết  
- 📱 Thông báo realtime lên app
- 🎥 Ghi hình và livestream

**Yêu cầu Key:** ✅ Có

#### 💻 Smart Switch PC v3.0.1  
**Tính năng:**
- 💻 Bật/tắt máy tính từ xa
- 📊 Monitor nhiệt độ, tải CPU
- 🔄 Restart/shutdown tự động
- 📱 Điều khiển qua app mobile
- ⚡ Quản lý nguồn điện thông minh
- 🚨 Cảnh báo lỗi hệ thống

**Yêu cầu Key:** ❌ Miễn phí

## 🔗 Download URLs

Files sẽ có URL format:
```
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/{filename}
```

**Ví dụ:**
```
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-robot-otto.bin
https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-c3-dogmaster.bin
```

## 🛠️ Cách Upload Firmware Mới

### Bước 1: Chuẩn bị files
Đặt tên theo convention: `{chip}-{category}.bin`

### Bước 2: Tạo Release
1. Vào tab **Releases** 
2. Click **Create a new release**
3. **Tag version:** v1.1.0 (increment version)
4. **Release title:** "MinizFlash Firmware v1.1.0"

### Bước 3: Upload Files
Upload 9 files firmware (3 chips × 3 categories):

```
esp32-s3-robot-otto.bin
esp32-s3-zero-robot-otto.bin  
esp32-c3-robot-otto.bin
esp32-s3-dogmaster.bin
esp32-s3-zero-dogmaster.bin
esp32-c3-dogmaster.bin
esp32-s3-smart-switch-pc.bin
esp32-s3-zero-smart-switch-pc.bin
esp32-c3-smart-switch-pc.bin
```

### Bước 4: Changelog
Thêm mô tả chi tiết:

```markdown
## v1.1.0 - Feature Update

### 🤖 Robot Otto
- ✅ Thêm tính năng X
- 🐛 Fix bug Y
- 📈 Cải thiện performance Z

### 🐕 DogMaster
- ✅ Feature A
- 🐛 Bug fix B

### 💻 Smart Switch PC  
- ✅ Feature C
- 📊 Improved monitoring
```

### Bước 5: Publish
Click **Publish release**

## 🔑 Key Management

### Sample Keys (9 digits):
```
381339845
900053760
877376102
813114077
882190490
```

### Tạo keys mới:
```bash
node scripts/generate-keys.js batch 10 "Batch description"
```

## 🌐 Website Integration

MinizFlash Tool sẽ tự động:
1. **Fetch releases** từ GitHub API
2. **Parse filenames** để match chip + category
3. **Download và flash** firmware tương ứng

**URL Website:** https://minizjp.com

## 📞 Support

- **Zalo:** 0389827643
- **YouTube:** www.youtube.com/@miniZjp
- **Website:** https://minizjp.com

---
© 2025 MinizFlash Tool - ESP32 Firmware Repository