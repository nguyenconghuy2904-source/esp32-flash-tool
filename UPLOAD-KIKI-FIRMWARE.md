# 🎁 UPLOAD KIKI ĐÂY FIRMWARE

Hướng dẫn nhanh upload firmware Kiki đây lên website.

## 🚀 Quick Start (3 Bước)

### 1️⃣ Tạo Repo
```
https://github.com/new
- Name: kiki-day-firmware
- Private: ✓
- Create
```

### 2️⃣ Clone & Add File
```powershell
git clone https://github.com/nguyenconghuy2904-source/kiki-day-firmware.git
cd kiki-day-firmware
copy "C:\path\to\your\firmware.bin" esp32-s3-kiki-day.bin
git add .
git commit -m "add firmware"
git push
```

### 3️⃣ Create Release
```
https://github.com/nguyenconghuy2904-source/kiki-day-firmware/releases/new

Tag: v1.0.0
Title: Kiki đây VIP v1.0.0
Attach: esp32-s3-kiki-day.bin
Publish ✓
```

## ✅ Done!

Website tự động:
- Fetch từ GitHub
- Download qua proxy
- Nạp vào ESP32

Test tại: https://minizjp.com
→ ESP32-S3 → Kiki đây → Nạp FW

## 📖 Chi Tiết

Xem file: `UPLOAD-FIRMWARE-GUIDE.md`
