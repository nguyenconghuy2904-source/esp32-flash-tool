# MinizFlash Firmware Release Template

## 📋 Template cho GitHub Release

Copy và paste nội dung bên dưới khi tạo GitHub Release:

---

## 📦 MinizFlash Firmware v1.0.0

### 🎯 Tổng quan
Release đầu tiên của MinizFlash firmware với đầy đủ 3 categories cho 3 loại chip ESP32.

### 📁 Firmware Files (9 files)

#### 🤖 Robot Otto v2.1.5 (Yêu cầu Key)
| Chip | Filename | Size | Features |
|------|----------|------|----------|
| ESP32-S3 | `esp32-s3-robot-otto.bin` | ~2.5MB | Full features + Camera |
| ESP32-S3-Zero | `esp32-s3-zero-robot-otto.bin` | ~2.3MB | Compact version |
| ESP32-C3-Super-Mini | `esp32-c3-robot-otto.bin` | ~1.8MB | Basic features |

**Tính năng:**
- 🤖 Điều khiển robot Otto thông minh với AI
- 🎵 Nhận diện giọng nói và âm thanh  
- 👁️ Camera AI nhận diện đối tượng (S3 only)
- 📱 App điều khiển từ xa qua WiFi/Bluetooth
- 🎮 Chế độ game tương tác đa dạng
- 🔋 Quản lý pin thông minh và tiết kiệm năng lượng

#### 🐕 DogMaster v1.8.2 (Yêu cầu Key)  
| Chip | Filename | Size | Features |
|------|----------|------|----------|
| ESP32-S3 | `esp32-s3-dogmaster.bin` | ~2.8MB | Full AI features |
| ESP32-S3-Zero | `esp32-s3-zero-dogmaster.bin` | ~2.6MB | Compact AI |
| ESP32-C3-Super-Mini | `esp32-c3-dogmaster.bin` | ~2.0MB | Basic monitoring |

**Tính năng:**
- 🐕 Theo dõi hoạt động thú cưng 24/7 với AI behavior analysis
- 🍽️ Tự động cho ăn theo lịch trình và sức khỏe
- 🔊 Phát âm thanh huấn luyện và command voice
- 📊 Báo cáo sức khỏe chi tiết với metrics
- 📱 Thông báo realtime lên app mobile
- 🎥 Ghi hình và livestream (S3 models)

#### 💻 Smart Switch PC v3.0.1 (Miễn phí)
| Chip | Filename | Size | Features |
|------|----------|------|----------|  
| ESP32-S3 | `esp32-s3-smart-switch-pc.bin` | ~1.5MB | Advanced monitoring |
| ESP32-S3-Zero | `esp32-s3-zero-smart-switch-pc.bin` | ~1.4MB | Standard features |
| ESP32-C3-Super-Mini | `esp32-c3-smart-switch-pc.bin` | ~1.2MB | Basic control |

**Tính năng:**
- 💻 Bật/tắt máy tính từ xa qua relay control
- 📊 Monitor nhiệt độ, tải CPU, RAM usage
- 🔄 Restart/shutdown tự động theo schedule
- 📱 Điều khiển qua app mobile và web interface
- ⚡ Quản lý nguồn điện thông minh với UPS support
- 🚨 Cảnh báo lỗi hệ thống và emergency shutdown

### 🔑 Key Requirements

**Firmware có phí (Robot Otto, DogMaster):**
- Yêu cầu key 9 số để kích hoạt
- Format: `123456789`
- 1 key = 1 thiết bị duy nhất
- Liên hệ để mua key: **Zalo 0389827643**

**Firmware miễn phí (Smart Switch PC):**
- Không yêu cầu key
- Sử dụng tự do cho mọi mục đích

### 🛠️ Hướng dẫn sử dụng

1. **Truy cập MinizFlash Tool:** https://minizjp.com
2. **Chọn chip ESP32** của bạn (S3, S3-Zero, C3-Super-Mini)
3. **Chọn firmware category** (Robot Otto, DogMaster, Smart Switch PC)
4. **Nhập key** (nếu firmware yêu cầu)
5. **Kết nối ESP32** qua USB
6. **Bắt đầu flash** và chờ hoàn tất

### 🔧 Technical Notes

**Compatible với:**
- Arduino IDE 2.x
- ESP-IDF v5.x
- PlatformIO

**Hardware Requirements:**
- ESP32-S3: 8MB Flash, 2MB PSRAM khuyến nghị
- ESP32-S3-Zero: 4MB Flash minimum  
- ESP32-C3-Super-Mini: 4MB Flash

**Pinout:**
- Xem schematics trong GitHub repository
- Compatible với standard ESP32 development boards

### 🚀 Installation

#### Via MinizFlash Tool (Khuyến nghị)
```
1. Vào https://minizjp.com
2. Chọn chip → firmware → flash
3. Tự động download và flash
```

#### Manual Download  
```bash
# Robot Otto for ESP32-S3
wget https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-robot-otto.bin

# DogMaster for ESP32-C3  
wget https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-c3-dogmaster.bin

# Smart Switch PC for ESP32-S3-Zero
wget https://github.com/nguyenconghuy2904-source/miniz-firmware/releases/download/v1.0.0/esp32-s3-zero-smart-switch-pc.bin
```

### 🐛 Known Issues

- ESP32-C3 camera features không available (hardware limitation)
- WiFi range có thể bị ảnh hưởng trong môi trường nhiều interference
- First boot có thể mất 30-60s để initialize

### 📈 Changelog

**New Features:**
- 🎉 Initial release với 3 firmware categories
- ✅ Support cho 3 loại chip ESP32 phổ biến  
- 🔑 Key-based authentication system
- 🌐 Integration với MinizFlash Tool website
- 📱 Mobile app companion support
- 🔧 OTA update capability

**Bug Fixes:**
- N/A (initial release)

**Performance Improvements:**  
- Optimized memory usage cho từng chip
- Fast boot sequence < 5 seconds
- Efficient power management

### 🔮 Roadmap v1.1.0

- 🤖 Robot Otto: Thêm machine learning offline
- 🐕 DogMaster: Integration với smart home systems
- 💻 Smart Switch PC: Support multiple PC management
- 📊 Dashboard web interface cho monitoring
- 🎵 Custom sound packs

### 📞 Support & Contact

- **🌐 Website:** https://minizjp.com
- **📱 Zalo:** 0389827643  
- **🎥 YouTube:** www.youtube.com/@miniZjp
- **📧 Email:** support@minizjp.com (if available)

### 📄 License

**Firmware miễn phí:** MIT License
**Firmware có phí:** Proprietary License (key required)

---

**🎯 Tải ngay và trải nghiệm MinizFlash Tool tại https://minizjp.com!**

---

## 📋 Upload Checklist

Khi tạo release, đảm bảo upload đầy đủ 9 files:

### Robot Otto (3 files)
- [ ] `esp32-s3-robot-otto.bin`
- [ ] `esp32-s3-zero-robot-otto.bin`  
- [ ] `esp32-c3-robot-otto.bin`

### DogMaster (3 files)
- [ ] `esp32-s3-dogmaster.bin`
- [ ] `esp32-s3-zero-dogmaster.bin`
- [ ] `esp32-c3-dogmaster.bin`

### Smart Switch PC (3 files)
- [ ] `esp32-s3-smart-switch-pc.bin`
- [ ] `esp32-s3-zero-smart-switch-pc.bin`
- [ ] `esp32-c3-smart-switch-pc.bin`

### Release Settings
- [ ] Tag version: v1.0.0
- [ ] Release title: "MinizFlash Firmware v1.0.0"  
- [ ] Description: Copy từ template trên
- [ ] Mark as latest release: ✅
- [ ] Pre-release: ❌