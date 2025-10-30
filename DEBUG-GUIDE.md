# 🐛 HƯỚNG DẪN DEBUG LỖI FLASH FIRMWARE

## 💡 CẢI TIẾN MỚI (v2.1 - USER GESTURE FIX)

Tool đã được cải tiến để hoạt động giống **ESP Launchpad** với các tính năng:

✅ **🔥 Request port NGAY LẬP TỨC** - Bảo vệ user gesture (FIX CHÍNH!)  
✅ **Clean up ports sau khi chọn** - Không phá vỡ user gesture  
✅ **Bắt lỗi khi người dùng từ chối quyền** - Thông báo rõ ràng hơn  
✅ **Kiểm tra port readable/writable** - Đảm bảo port thật sự mở  
✅ **Gọi esptool.connect() chỉ sau khi port mở thành công** - Tránh lỗi kết nối

### 🐛 Lỗi đã fix: "Popup chọn port không hiện"

**Nguyên nhân:** Các async operations (`cleanup()`, `getPorts()`) trước `requestPort()` phá vỡ user gesture chain.

**Giải pháp:** Gọi `requestPort()` TRƯỚC mọi async operation khác!

---

## ⚠️ Bạn đang gặp lỗi này:
```
❌ Flash firmware thất bại. Vui lòng kiểm tra console để biết chi tiết.
```

---

## 📋 BƯỚC 1: MỞ CONSOLE (F12)

### Windows/Linux:
- Nhấn **F12** 
- Hoặc **Ctrl + Shift + I**
- Hoặc **Right-click → Inspect → Tab Console**

### Mac:
- **Cmd + Option + I**

---

## 📋 BƯỚC 2: XEM ERROR LOGS

Trong Console, tìm các dòng màu **đỏ** (errors) như:

```javascript
❌ Flash error details: ...
❌ Error: ...
❌ Failed to ...
```

**QUAN TRỌNG:** Copy **TOÀN BỘ** text từ console (Ctrl+A → Ctrl+C)

---

## 🔧 BƯỚC 3: CÁC LỖI THƯỜNG GẶP & CÁCH FIX

### ❌ LỖI 1: "Failed to connect"
```
Error: Failed to connect with the device
Timeout waiting for packet header
```

**Nguyên nhân:** ESP32 không vào bootloader mode

**CÁCH FIX:**
1. **Rút cáp USB** ra khỏi ESP32
2. **Giữ nút BOOT** trên ESP32 (nút nhỏ gần cổng USB)
3. Trong khi **giữ BOOT**, cắm lại cáp USB
4. **Giữ BOOT thêm 3 giây** sau khi cắm
5. **Thả BOOT**
6. Thử lại "Kết nối thiết bị"

**Hình minh họa:**
```
[ESP32 Board]
  ↓
[BOOT] ← Nút này (giữ khi cắm USB)
[EN/RST] ← Nút reset
```

---

### ❌ LỖI 2: "Firmware file is empty" hoặc "0 KB"
```
Firmware downloaded: 0 KB
Error: Firmware file rỗng
```

**Nguyên nhân:** Không download được firmware từ GitHub

**CÁCH FIX:**
1. Check internet connection
2. Thử firmware khác (chọn Robot Otto thay vì Kiki)
3. Check GitHub có block không: https://github.com/nguyenconghuy2904-source/robot-otto-firmware/releases

---

### ❌ LỖI 3: "A fatal error occurred" từ esptool
```
A fatal error occurred: Failed to write to target
MD5 of file does not match
```

**Nguyên nhân:** 
- Cáp USB kém chất lượng (không truyền data tốt)
- ESP32 bị reset giữa chừng
- Flash memory lỗi

**CÁCH FIX:**
1. **Thay cáp USB** khác (dùng cáp data tốt, không dùng cáp sạc phone)
2. **Thử cổng USB khác** trên máy tính
3. Giữ ESP32 **đứng yên** khi đang flash (đừng rung)
4. **Nhấn nút RST** trên ESP32 để reset, sau đó thử lại

---

### ❌ LỖI 4: "Serial port not found" hoặc "Port disconnected"
```
Error: Port is not open
Device disconnected during flashing
```

**Nguyên nhân:** Port bị mất kết nối

**CÁCH FIX:**
1. **Đóng tất cả** app khác đang dùng port:
   - Arduino IDE
   - PlatformIO
   - Putty/Terminal
   - Device Manager
2. **Rút cắm lại** ESP32
3. Kết nối lại từ đầu

---

### ❌ LỖI 5: "Invalid firmware format" hoặc "Magic byte"
```
Error: Invalid firmware file
Unexpected magic byte
```

**Nguyên nhân:** File firmware bị lỗi hoặc sai format

**CÁCH FIX:**
1. Thử firmware **khác**
2. Chờ admin update firmware mới
3. Liên hệ Zalo: 0389827643

---

## 🔬 BƯỚC 4: GỬI LOGS CHO ADMIN

Nếu các cách trên không fix được:

### 1. Copy Full Console Logs
```
Ctrl+A (chọn tất cả trong Console)
Ctrl+C (copy)
```

### 2. Paste vào file text hoặc gửi qua:
- Zalo: 0389827643
- Facebook/Messenger
- Email

### 3. Ghi rõ:
- Firmware đang chọn: (Robot Otto / Kiki đây / ...)
- Loại ESP32: (ESP32-S3 / C3 / ...)
- OS: (Windows 10/11 / Mac / Linux)
- Browser: (Chrome / Edge / ...)

---

## 🛠️ CHECKLIST TRƯỚC KHI FLASH

### Phần Cứng
- [ ] Cáp USB là **cáp data** (không phải cáp sạc)
- [ ] ESP32 đã cắm chắc vào USB
- [ ] Đèn LED trên ESP32 sáng (có nguồn)
- [ ] Driver CH340/CP2102 đã cài (Windows)

### Phần Mềm
- [ ] Dùng Chrome/Edge (KHÔNG dùng Firefox/Safari)
- [ ] Website chạy trên HTTPS
- [ ] Đã đóng Arduino IDE / PlatformIO
- [ ] Đã cho phép quyền truy cập USB

### Kết Nối
- [ ] Đã click "Kết nối thiết bị"
- [ ] Thấy "✅ Đã kết nối ESP32"
- [ ] Có chọn đúng COM port
- [ ] Giữ BOOT nếu không detect được

---

## 🔄 QUY TRÌNH KẾT NỐI MỚI (v2.1)

Tool hiện tại sử dụng quy trình kết nối tương tự **ESP Launchpad**:

```
1️⃣ Request port NGAY LẬP TỨC (🔥 preserving user gesture!)
   ↓
2️⃣ Clean up other open ports (sau khi đã có port)
   ↓
3️⃣ Open the selected port (kiểm tra lỗi "already open")
   ↓
4️⃣ Verify port readable & writable ✅
   ↓
5️⃣ Initialize transport & ESPLoader
   ↓
6️⃣ Connect to bootloader (esptool-js tự động xử lý DTR/RTS)
   ↓
7️⃣ Detect chip type
```

**Lợi ích:**
- ✅ Popup chọn port LUÔN hiện (không bị chặn bởi browser)
- ✅ Ít lỗi "port already open" hơn
- ✅ Thông báo lỗi rõ ràng hơn
- ✅ Tỷ lệ kết nối thành công cao hơn
- ✅ Tương thích hoàn toàn với ESP Launchpad/esp-web-tools

---

## 💡 TIPS HAY

### Tip 1: Reset ESP32
```
Trước khi flash:
1. Nhấn nút RST/EN trên ESP32
2. Chờ 2 giây
3. Thử flash lại
```

### Tip 2: Baudrate Thấp Hơn
```
Nếu flash bị lỗi giữa chừng:
→ Có thể do baudrate cao (921600)
→ Tạm thời chưa có option giảm (đang fix)
→ Thử cáp USB tốt hơn
```

### Tip 3: Test Connection
```
1. Click "Serial Monitor" tab
2. Click "Bật Monitor"
3. Nhấn nút RST trên ESP32
4. Xem có text hiện ra không
→ Nếu có → Connection OK
→ Nếu không → Check driver/cáp
```

---

## 📞 LIÊN HỆ HỖ TRỢ

**Zalo:** 0389827643  
**YouTube:** @miniZjp  
**GitHub Issues:** nguyenconghuy2904-source/esp32-flash-tool

**Gửi kèm:**
- Screenshot lỗi
- Console logs (full text)
- Thông tin thiết bị

---

## ✅ KHI NÀO FLASH THÀNH CÔNG?

Bạn sẽ thấy:
```
✅ Đã kết nối với ESP32
⏳ Flashing... 10%
⏳ Flashing... 50%
⏳ Flashing... 100%
🎉 Flash firmware thành công!
```

Sau đó:
1. Nhấn nút **RST** trên ESP32
2. ESP32 sẽ chạy firmware mới
3. Done! ✨

---

**Last Updated:** 28/10/2025  
**Version:** 1.0

