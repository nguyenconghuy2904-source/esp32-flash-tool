# 🧪 HƯỚNG DẪN TEST TOOL TRÊN LOCAL

## 🚀 Bước 1: Khởi Động Dev Server

Dev server đã được khởi động! Mở trình duyệt tại:

```
http://localhost:3000
```

**Lưu ý:** Dùng Chrome hoặc Edge (có hỗ trợ WebSerial API)

---

## ✅ Bước 2: Test Các Cải Tiến Mới

### Test 1: Đóng Port Cũ Trước Khi Mở Port Mới

**Mục đích:** Kiểm tra không còn lỗi "port already open"

**Các bước:**
1. Kết nối ESP32 với máy tính
2. Nhấn "Kết nối thiết bị"
3. Chọn COM port
4. ✅ Kết nối thành công
5. Nhấn "Ngắt kết nối"
6. **NGAY LẬP TỨC** nhấn "Kết nối thiết bị" lại
7. Chọn COM port

**Kết quả mong đợi:**
- ✅ Kết nối lại thành công KHÔNG có lỗi "port already open"
- ✅ Trong console (F12) thấy: `"🧹 Cleaning up connections..."`
- ✅ Thấy: `"✅ Cleanup complete"`

**Console log mẫu:**
```
🧹 Cleaning up connections...
  - Closing serial port...
  ✅ Port closed successfully
  - Waiting for port release...
✅ Cleanup complete
Requesting serial port...
✅ Port selected successfully
✅ Port opened successfully (readable & writable)
```

---

### Test 2: Bắt Lỗi Khi User Nhấn Cancel

**Mục đích:** Kiểm tra thông báo lỗi rõ ràng khi user hủy

**Các bước:**
1. Nhấn "Kết nối thiết bị"
2. Khi popup chọn port hiện ra → **NHẤN "Cancel"**

**Kết quả mong đợi:**
- ✅ Thấy thông báo: `"❌ Người dùng đã hủy chọn thiết bị"`
- ✅ KHÔNG thấy lỗi generic "NotFoundError"
- ✅ Có nút "🔄 Thử lại"

**Console log mẫu:**
```
Requesting serial port...
Connection error: Error: Người dùng đã hủy chọn thiết bị
```

---

### Test 3: Kiểm Tra Port Readable/Writable

**Mục đích:** Đảm bảo port thật sự mở trước khi dùng

**Các bước:**
1. Mở Arduino IDE hoặc PlatformIO
2. Mở Serial Monitor trong Arduino IDE (để chiếm port)
3. Quay lại tool web, nhấn "Kết nối thiết bị"
4. Chọn COM port

**Kết quả mong đợi:**
- ✅ Thấy lỗi rõ ràng: `"❌ Port đang được sử dụng bởi ứng dụng khác"`
- ✅ Có hướng dẫn: `"Vui lòng đóng Arduino IDE, PlatformIO"`
- ✅ Có nút "🔄 Thử lại"

**Console log mẫu:**
```
Opening port at 115200 baud...
Port open error: Port đang được sử dụng bởi ứng dụng khác
```

---

### Test 4: Connect() Gọi Đúng Lúc

**Mục đích:** Kiểm tra esptool.connect() chỉ gọi sau khi port mở

**Các bước:**
1. Kết nối ESP32 (KHÔNG nhấn giữ BOOT)
2. Nhấn "Kết nối thiết bị"
3. Chọn COM port
4. Mở Console (F12) để xem log

**Kết quả mong đợi:**
- ✅ Thấy thứ tự log đúng:
  ```
  Opening port at 115200 baud...
  ✅ Port opened successfully (readable & writable)
  Initializing transport layer...
  Entering bootloader mode...
  Initializing ESPLoader...
  Connecting to bootloader...
  🔄 Connection attempt 1/3...
  ```
- ✅ KHÔNG thấy "Connection attempt" TRƯỚC "Port opened"
- ✅ Nếu ESP32 không ở bootloader mode → retry 3 lần

**Nếu không kết nối được:**
- ✅ Thấy: `"Không thể kết nối bootloader sau 3 lần thử"`
- ✅ Có hướng dẫn: `"💡 Vui lòng: • Nhấn giữ nút BOOT khi cắm USB"`

---

### Test 5: Memory Leak Check

**Mục đích:** Đảm bảo không bị memory leak khi connect nhiều lần

**Các bước:**
1. Mở Task Manager → Performance → Memory
2. Ghi nhận memory usage hiện tại
3. Kết nối → Ngắt → Kết nối lại (10 lần)
4. Check memory usage

**Kết quả mong đợi:**
- ✅ Memory tăng KHÔNG quá 50MB sau 10 lần connect
- ✅ Port được cleanup đầy đủ mỗi lần

---

### Test 6: Flash Firmware

**Mục đích:** Đảm bảo flash vẫn hoạt động bình thường

**Các bước:**
1. Kết nối ESP32
2. Chọn firmware (Robot Otto)
3. Nhấn "Bắt đầu nạp Firmware"

**Kết quả mong đợi:**
- ✅ Download firmware thành công
- ✅ Flash progress bar hiển thị đúng
- ✅ Flash thành công
- ✅ ESP32 tự động reset

---

## 🔍 Console Logs Quan Trọng

Mở Console (F12) để xem logs chi tiết:

### ✅ Logs Tốt (Good)
```
🧹 Cleaning up connections...
✅ Cleanup complete
Requesting serial port...
✅ Port selected successfully
✅ Port opened successfully (readable & writable)
Initializing transport layer...
Entering bootloader mode...
🔄 Connection attempt 1/3...
✅ Bootloader connected successfully
✅ Chip detected: ESP32
```

### ❌ Logs Lỗi (Errors)
```
❌ Attempt 1 failed: timeout
Waiting 500ms before retry...
🔄 Connection attempt 2/3...
```

---

## 📊 Checklist Tổng Hợp

Test tất cả các scenarios:

- [ ] **Test 1:** Kết nối → Ngắt → Kết nối lại (không lỗi)
- [ ] **Test 2:** Nhấn Cancel khi chọn port (thông báo rõ ràng)
- [ ] **Test 3:** Arduino IDE đang mở (thông báo lỗi rõ ràng)
- [ ] **Test 4:** Xem thứ tự logs trong console (đúng thứ tự)
- [ ] **Test 5:** Connect 10 lần liên tiếp (không memory leak)
- [ ] **Test 6:** Flash firmware thành công

### Kết Quả
- **Pass:** ___ / 6
- **Fail:** ___ / 6

---

## 🐛 Nếu Gặp Lỗi

### Lỗi: "WebSerial API không được hỗ trợ"
**Fix:** Dùng Chrome hoặc Edge (không phải Firefox/Safari)

### Lỗi: "WebSerial chỉ hoạt động trên HTTPS"
**Fix:** Đang chạy localhost → OK! Hoặc thêm flag `--unsafely-treat-insecure-origin-as-secure`

### Lỗi: "Port already open" vẫn xuất hiện
**Fix:** 
1. Check console có thấy "🧹 Cleaning up connections..." không?
2. Nếu không → code chưa update
3. Refresh page (Ctrl+Shift+R) để clear cache

### Lỗi: ESP32 không kết nối
**Fix:**
1. Nhấn giữ nút BOOT khi cắm USB
2. Thử cáp USB khác
3. Check driver CH340/CP2102

---

## 📸 Screenshots Để So Sánh

### Before (Version 1.0)
- Lỗi "port already open" thường xuyên
- Thông báo lỗi chung chung
- Không có retry logic

### After (Version 2.0)
- ✅ Không còn lỗi "port already open"
- ✅ Thông báo lỗi rõ ràng
- ✅ Retry tự động 3 lần
- ✅ Console logs chi tiết

---

## 📞 Report Bugs

Nếu tìm thấy bug:
1. Copy FULL console logs (Ctrl+A trong Console)
2. Screenshot lỗi
3. Ghi rõ:
   - Browser: Chrome/Edge
   - OS: Windows 10/11
   - ESP32 chip: S3/C3
   - Firmware: Robot Otto / Kiki / ...

**Zalo:** 0389827643  
**GitHub Issues:** nguyenconghuy2904-source/minizjp

---

## ✅ Khi Nào Test Thành Công?

Tất cả 6 tests PASS + Không có lỗi trong console → **READY FOR PRODUCTION!** 🎉

---

**Happy Testing!** 🧪✨

**Date:** 28/10/2025  
**Version:** 2.0  
**Status:** Testing Phase


