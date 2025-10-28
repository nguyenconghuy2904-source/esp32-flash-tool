# 🚀 MinizJP - ESP32 Web Flash Tool

Công cụ nạp firmware cho ESP32 trực tiếp qua trình duyệt web, không cần cài đặt phần mềm.

## ✨ Tính Năng

- 🌐 **Nạp qua Web**: Không cần Arduino IDE hay driver
- ⚡ **Nhanh & Đơn Giản**: Chỉ cần trình duyệt Chrome/Edge
- 🔐 **Bảo Mật**: Hệ thống key cho firmware VIP
- 📱 **Responsive**: Hoạt động mọi thiết bị
- 🎯 **Nhiều Chip**: ESP32-S3, ESP32-S3 Zero, ESP32-C3

## 🎯 Hỗ Trợ

- ESP32-S3 DevKit
- ESP32-S3 Zero
- ESP32-C3 Super Mini
- Và nhiều board khác...

## 🚀 Sử Dụng

### Truy cập website: https://minizjp.com

1. **Chọn Chip**: ESP32-S3 / S3-Zero / C3
2. **Chọn Firmware**: Robot Otto, Kiki đây, v.v.
3. **Kết Nối**: Click "Nạp FW" và chọn cổng COM
4. **Nạp**: Đợi 30-60 giây là xong!

### Yêu Cầu

- Chrome/Edge (phiên bản mới)
- Cáp USB (data cable)
- ESP32 board

## 📖 Firmware Có Sẵn

### 🆓 Free (Không cần key)
- **Robot Otto**: Robot AI với camera
- **Smart Switch PC**: Điều khiển PC từ xa

### 🔑 VIP (Cần key kích hoạt)
- **Kiki đây**: Firmware độc quyền
- **Thùng Rác Thông Minh**: AI phân loại rác

**Liên hệ nhận VIP key**: Zalo 0389827643

## 🛡️ Bảo Mật

- Rate limiting: 5 attempts / 15 phút
- Key validation qua API
- Device fingerprint tracking
- IP blocking tự động
- Encrypted connections (HTTPS)

Xem chi tiết: [SECURITY.md](./SECURITY.md)

## ❓ Troubleshooting

### Không kết nối được?
- Dùng Chrome/Edge (không phải Firefox/Safari)
- Kiểm tra cáp USB (phải là data cable)
- Giữ nút BOOT khi cắm USB
- Đóng Arduino IDE / PlatformIO

### Key không hợp lệ?
- Kiểm tra lại 9 số
- Liên hệ Zalo: 0389827643

### Nạp firmware thất bại?
- Reset ESP32 và thử lại
- Thử cổng USB khác
- Cài driver CH340/CP2102

Xem thêm: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🛠️ Tech Stack

- Next.js + TypeScript
- Tailwind CSS
- WebSerial API
- GitHub Pages

## 📞 Liên Hệ

- **Website**: https://minizjp.com
- **Zalo**: 0389827643
- **YouTube**: @miniZjp

## 📝 License

© 2025 MinizJP. All rights reserved.

---

**Made with ❤️ in Vietnam** 🇻🇳