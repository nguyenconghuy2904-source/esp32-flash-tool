# 📦 Firmware Directory

Thư mục này chứa firmware files (`.bin`) trước khi upload lên GitHub Releases.

## 📋 Structure

```
firmware/
├── esp32-s3-robot-otto.bin
├── esp32-s3-zero-robot-otto.bin
├── esp32-c3-super-mini-robot-otto.bin
├── esp32-s3-dogmaster.bin
├── esp32-s3-zero-dogmaster.bin
├── esp32-c3-super-mini-dogmaster.bin
├── esp32-s3-smart-switch-pc.bin
├── esp32-s3-zero-smart-switch-pc.bin
└── esp32-c3-super-mini-smart-switch-pc.bin
```

## 🚀 Cách upload firmware

### Method 1: Sử dụng Script (Khuyến nghị)

```powershell
# Upload tất cả firmware trong thư mục này
.\scripts\upload-firmware.ps1 -Version "v1.0.0"

# Upload với custom path
.\scripts\upload-firmware.ps1 -Version "v1.1.0" -FirmwarePath ".\my-firmware"

# Upload với custom release notes
.\scripts\upload-firmware.ps1 -Version "v1.2.0" -ReleaseNotes "Custom notes here"
```

### Method 2: Manual Upload

1. Truy cập: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases
2. Click **"Draft a new release"**
3. Điền thông tin và upload files từ thư mục này
4. Click **"Publish release"**

## 📝 Naming Convention

```
{chip-type}-{firmware-category}.bin
```

**Chip Types:**
- `esp32-s3` - ESP32-S3 DevKit
- `esp32-s3-zero` - ESP32-S3 Zero (compact)
- `esp32-c3-super-mini` - ESP32-C3 Super Mini

**Firmware Categories:**
- `robot-otto` - Robot Otto (free)
- `dogmaster` - DogMaster (requires key)
- `smart-switch-pc` - Smart Switch PC (free)

## ⚠️ Important Notes

- **Chỉ upload file `.bin`** (binary firmware)
- **Đặt tên đúng format** để website tự động nhận diện
- **Test firmware** trước khi upload
- **Tăng version** mỗi lần release mới

## 📚 Documentation

- **Upload Guide:** [UPLOAD-FIRMWARE-GUIDE.md](../UPLOAD-FIRMWARE-GUIDE.md)
- **Firmware Repo:** [FIRMWARE-REPO-README.md](../FIRMWARE-REPO-README.md)

---

**Website:** https://minizjp.com  
**Support:** Zalo 0389827643 | YouTube @miniZjp
