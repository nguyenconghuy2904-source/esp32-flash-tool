# 📤 Hướng dẫn Upload Firmware lên MinizJP.com

## 🎯 Tổng quan

Website **minizjp.com** tự động lấy firmware từ **GitHub Releases**. Bạn chỉ cần upload firmware lên GitHub Releases, website sẽ tự động hiển thị và cho phép người dùng tải về.

---

## 📋 Quy trình Upload Firmware

### ✅ Bước 1: Chuẩn bị file firmware

#### 1.1 Đặt tên file đúng quy chuẩn:
```
{chip-type}-{firmware-category}.bin
```

#### 1.2 Các loại chip được hỗ trợ:
- `esp32-s3` - ESP32-S3 DevKit
- `esp32-s3-zero` - ESP32-S3 Zero (nhỏ gọn)
- `esp32-c3-super-mini` - ESP32-C3 Super Mini

#### 1.3 Các loại firmware:
- `robot-otto` - Robot Otto (Miễn phí)
- `dogmaster` - DogMaster (Yêu cầu key)
- `smart-switch-pc` - Smart Switch PC (Miễn phí)

#### 1.4 Ví dụ tên file:
```
esp32-s3-robot-otto.bin
esp32-s3-zero-dogmaster.bin
esp32-c3-super-mini-smart-switch-pc.bin
```

---

### ✅ Bước 2: Tạo GitHub Release

#### 2.1 Truy cập GitHub Repository
```
https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases
```

#### 2.2 Click **"Draft a new release"**

#### 2.3 Điền thông tin Release:

**Tag version:**
```
v1.0.0  (hoặc v1.1.0, v1.2.0...)
```
💡 Mỗi lần release mới phải tăng số version

**Release title:**
```
MinizFlash Firmware v1.0.0
```

**Description (Mô tả chi tiết):**
````markdown
## 🚀 MinizFlash Firmware v1.0.0

### 📦 Firmware đã cập nhật

#### 🤖 Robot Otto v2.1.5
**Tính năng mới:**
- ✨ Thêm AI nhận diện giọng nói
- 🎮 Chế độ game mới
- 🐛 Sửa lỗi kết nối Bluetooth

**Files:**
- `esp32-s3-robot-otto.bin`
- `esp32-s3-zero-robot-otto.bin`
- `esp32-c3-super-mini-robot-otto.bin`

**Yêu cầu:** 🔑 Key

---

#### 🐕 DogMaster v1.8.2
**Tính năng mới:**
- 📊 Dashboard theo dõi sức khỏe
- 🔔 Thông báo thông minh
- 📷 Livestream HD

**Files:**
- `esp32-s3-dogmaster.bin`
- `esp32-s3-zero-dogmaster.bin`
- `esp32-c3-super-mini-dogmaster.bin`

**Yêu cầu:** 🔑 Key

---

#### 💻 Smart Switch PC v3.0.1
**Tính năng mới:**
- ⚡ Tối ưu hiệu năng
- 📈 Monitor CPU/RAM realtime
- 🌐 Web interface mới

**Files:**
- `esp32-s3-smart-switch-pc.bin`
- `esp32-s3-zero-smart-switch-pc.bin`
- `esp32-c3-super-mini-smart-switch-pc.bin`

**Yêu cầu:** 🆓 Miễn phí

---

### 📥 Hướng dẫn cài đặt

1. Truy cập: **https://minizjp.com**
2. Chọn loại chip của bạn
3. Chọn firmware cần nạp
4. Nhập key (nếu yêu cầu)
5. Kết nối ESP32 và flash

### 🔑 Mua Key

- **Zalo:** 0389827643
- **YouTube:** @miniZjp

---

**Tổng số file:** 9 firmware files
**Tương thích:** ESP32-S3, ESP32-S3-Zero, ESP32-C3-Super-Mini
````

---

### ✅ Bước 3: Upload file firmware

#### 3.1 Kéo thả hoặc click để chọn files
Trong phần **"Attach binaries"** ở cuối trang Release:

#### 3.2 Upload các file firmware:
```
✓ esp32-s3-robot-otto.bin
✓ esp32-s3-zero-robot-otto.bin
✓ esp32-c3-super-mini-robot-otto.bin
✓ esp32-s3-dogmaster.bin
✓ esp32-s3-zero-dogmaster.bin
✓ esp32-c3-super-mini-dogmaster.bin
✓ esp32-s3-smart-switch-pc.bin
✓ esp32-s3-zero-smart-switch-pc.bin
✓ esp32-c3-super-mini-smart-switch-pc.bin
```

#### 3.3 Đợi upload hoàn tất
GitHub sẽ hiển thị progress bar cho mỗi file

---

### ✅ Bước 4: Publish Release

#### 4.1 Kiểm tra lại thông tin:
- ✅ Tag version đúng
- ✅ Title đúng
- ✅ Description đầy đủ
- ✅ Tất cả files đã upload

#### 4.2 Click **"Publish release"**

#### 4.3 Chờ vài giây
GitHub sẽ tạo release và tạo link download cho từng file

---

## 🌐 Kiểm tra trên Website

### Sau khi publish release:

1. **Truy cập:** https://minizjp.com
2. **Website sẽ tự động:**
   - Fetch firmware list từ GitHub Releases
   - Hiển thị firmware mới nhất
   - Cho phép người dùng tải về

3. **Kiểm tra:**
   - Chọn chip và firmware
   - Xem version hiển thị đúng
   - Test download và flash

---

## 🔗 URL Format của Firmware

Sau khi publish, mỗi file sẽ có URL:
```
https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases/download/{tag}/{filename}
```

**Ví dụ:**
```
https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases/download/v1.0.0/esp32-s3-robot-otto.bin
```

---

## 📝 Template Release Nhanh

Copy template này khi tạo release mới:

````markdown
## 🚀 MinizFlash Firmware v{VERSION}

### 📦 Firmware Updates

#### 🤖 Robot Otto v{VERSION}
- ✨ Feature 1
- 🐛 Bug fix 2
- 📈 Performance improvement 3

**Files:** `esp32-s3-robot-otto.bin`, `esp32-s3-zero-robot-otto.bin`, `esp32-c3-super-mini-robot-otto.bin`  
**Yêu cầu:** 🆓 Miễn phí

---

#### 🐕 DogMaster v{VERSION}
- ✨ Feature A
- 🐛 Bug fix B

**Files:** `esp32-s3-dogmaster.bin`, `esp32-s3-zero-dogmaster.bin`, `esp32-c3-super-mini-dogmaster.bin`  
**Yêu cầu:** 🔑 Key

---

#### 💻 Smart Switch PC v{VERSION}
- ✨ Feature X
- 🐛 Bug fix Y

**Files:** `esp32-s3-smart-switch-pc.bin`, `esp32-s3-zero-smart-switch-pc.bin`, `esp32-c3-super-mini-smart-switch-pc.bin`  
**Yêu cầu:** 🆓 Miễn phí

---

### 📥 Installation
1. Visit: https://minizjp.com
2. Select chip & firmware
3. Enter key (if required)
4. Flash firmware

🔑 **Get Key:** Zalo 0389827643 | YouTube @miniZjp
````

---

## 🔄 Cập nhật Firmware (Update)

### Khi cần cập nhật firmware mới:

1. **Tạo release mới** với version cao hơn:
   - Old: `v1.0.0`
   - New: `v1.1.0` hoặc `v2.0.0`

2. **Upload file mới** (có thể cùng tên)

3. **Publish release**

4. **Website tự động** hiển thị version mới nhất

---

## ⚠️ Lưu ý quan trọng

### ✅ DO (Nên làm):
- ✅ Đặt tên file theo đúng quy chuẩn
- ✅ Upload đủ 9 files (3 chips × 3 firmwares)
- ✅ Tăng version number mỗi lần release
- ✅ Viết changelog chi tiết
- ✅ Test firmware trước khi upload
- ✅ Ghi rõ firmware nào cần key

### ❌ DON'T (Không nên):
- ❌ Đặt tên file tùy tiện
- ❌ Upload file sai format (.hex, .elf...)
- ❌ Dùng version number trùng lặp
- ❌ Publish mà chưa test firmware
- ❌ Upload file bị lỗi hoặc chưa hoàn chỉnh

---

## 🛠️ Troubleshooting

### Website không hiển thị firmware mới?

**Nguyên nhân:**
- Release chưa public (draft mode)
- Tên file không đúng format
- GitHub API chưa sync

**Giải pháp:**
1. Kiểm tra release đã publish chưa
2. Kiểm tra tên file đúng format
3. Chờ 1-2 phút để GitHub API sync
4. Hard refresh website (Ctrl + Shift + R)
5. Kiểm tra browser console có lỗi không

### File download bị lỗi?

**Nguyên nhân:**
- File bị corrupt khi upload
- File không phải .bin format
- GitHub rate limit

**Giải pháp:**
1. Re-upload file
2. Kiểm tra file integrity (MD5/SHA256)
3. Đợi vài phút nếu bị rate limit

### Firmware flash lỗi?

**Nguyên nhân:**
- File firmware lỗi
- Không đúng chip type
- Partition scheme không match

**Giải pháp:**
1. Rebuild firmware với config đúng
2. Test trên device trước khi release
3. Ghi rõ requirements trong changelog

---

## 📞 Hỗ trợ

Nếu gặp vấn đề khi upload firmware:

- **Zalo:** 0389827643
- **YouTube:** www.youtube.com/@miniZjp
- **Website:** https://minizjp.com

---

## 📚 Tài liệu liên quan

- **Key Management:** [KEY-MANAGEMENT.md](KEY-MANAGEMENT.md)
- **Firmware Repo:** [FIRMWARE-REPO-README.md](FIRMWARE-REPO-README.md)
- **Deployment:** [DEPLOY.md](DEPLOY.md)
- **DNS Config:** [DNS-CONFIG.md](DNS-CONFIG.md)

---

© 2025 MinizFlash Tool - Hướng dẫn Upload Firmware
