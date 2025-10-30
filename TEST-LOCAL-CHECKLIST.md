# ✅ CHECKLIST TEST KẾT NỐI ESP32 Ở LOCAL

**Ngày:** 30/10/2025  
**Mục đích:** Kiểm tra fix lỗi kết nối USB ESP32

---

## 🚀 CHUẨN BỊ

### 1. Server đang chạy
- ✅ Dev server: `http://localhost:3000`
- ✅ Đã chạy `npm run dev`

### 2. Phần cứng
- [ ] ESP32-S3 hoặc ESP32-S2 đã cắm USB vào máy tính
- [ ] Cáp USB là cáp DATA (không phải cáp sạc)
- [ ] LED trên ESP32 sáng (có nguồn điện)
- [ ] Driver CH340/CP2102 đã cài đặt (Windows)

### 3. Trình duyệt
- [ ] Đang dùng **Chrome**, **Edge**, hoặc **Opera** (KHÔNG dùng Firefox/Safari)
- [ ] Chạy trên `localhost` (WebSerial hoạt động)

---

## 🔍 TEST CASES

### ✅ TEST 1: Kiểm tra WebSerial API Support

**Bước 1:** Mở `http://localhost:3000`

**Bước 2:** Mở Console (F12)

**Bước 3:** Gõ lệnh:
```javascript
'serial' in navigator
```

**Kết quả mong đợi:** `true`

**Nếu `false`:**
- ❌ Trình duyệt không hỗ trợ WebSerial
- 🔧 Fix: Dùng Chrome/Edge/Opera

---

### ✅ TEST 2: Popup Chọn Port Hiện Ra

**Bước 1:** Click nút **"Kết nối thiết bị"**

**Bước 2:** Quan sát popup chọn port

**Kết quả mong đợi:**
- ✅ Popup hiện ngay lập tức (< 500ms)
- ✅ Danh sách có ESP32 device
- ✅ Không có console error

**Nếu popup KHÔNG hiện:**
- ❌ Check console có error "User gesture required"
- 🔧 Fix: Đây là lỗi code - báo ngay!

**Console logs mong đợi:**
```
🔌 Requesting serial port...
```

---

### ✅ TEST 3: Chọn Port Thành Công

**Bước 1:** Chọn ESP32 device từ popup

**Bước 2:** Click "Connect"

**Kết quả mong đợi:**
- ✅ Console hiện: `✅ Port selected (0x303a:0x1001)` hoặc tương tự
- ✅ Console hiện: `📂 Opening port at 115200 baud...`
- ✅ Console hiện: `✅ Port opened`
- ✅ Console hiện: `🔗 Connecting to bootloader...`
- ✅ Console hiện: `✅ Bootloader connected`
- ✅ Console hiện: `✅ Chip detected: ESP32-S3` (hoặc ESP32)
- ✅ UI hiện: "✅ Đã kết nối với ESP32 thành công!"

**Console logs mong đợi:**
```
🔌 Requesting serial port...
✅ Port selected (0x303a:0x1001)
🧹 Đang đóng 0 cổng serial còn lại...
ℹ️ cổng serial đã chọn (trước khi mở) đã ở trạng thái đóng
📂 Opening port at 115200 baud...
✅ Port opened
🔗 Connecting to bootloader...
[ESP] Detecting chip type... ESP32-S3
✅ Bootloader connected
🔍 Detecting chip type...
✅ Chip detected: ESP32-S3
```

---

### ✅ TEST 4: Hủy Chọn Port (User Cancel)

**Bước 1:** Click "Kết nối thiết bị"

**Bước 2:** Khi popup hiện, click **"Cancel"** hoặc nhấn **ESC**

**Kết quả mong đợi:**
- ✅ Console hiện: `❌ Connection error: Error: Người dùng đã hủy chọn thiết bị`
- ✅ UI hiện thông báo lỗi rõ ràng
- ✅ Không có console error khác

---

### ✅ TEST 5: Port Already Open (Fix Chính!)

**Bước 1:** Kết nối ESP32 lần 1 thành công

**Bước 2:** KHÔNG disconnect, click "Kết nối thiết bị" lần 2

**Bước 3:** Chọn cùng port

**Kết quả mong đợi:**
- ✅ Console hiện: `🧹 Đang đóng 1 cổng serial còn lại...`
- ✅ Console hiện: `✅ Đã đóng cổng serial (0x303a:0x1001)`
- ✅ Kết nối thành công lần 2
- ✅ KHÔNG có lỗi "port already open"

**Console logs mong đợi:**
```
🔌 Requesting serial port...
✅ Port selected (0x303a:0x1001)
🧹 Đang đóng 1 cổng serial còn lại...
✅ Đã đóng cổng serial (0x303a:0x1001)
ℹ️ cổng serial đã chọn (trước khi mở) đã ở trạng thái đóng
📂 Opening port at 115200 baud...
✅ Port opened
```

---

### ✅ TEST 6: USB Filters - Nhiều Loại Device

**Chuẩn bị:** Cắm nhiều loại ESP32 (nếu có):
- ESP32-S3 (Native USB - VID: 0x303a)
- ESP32 với CH340 (VID: 0x1a86, PID: 0x7523)
- ESP32 với CP2102 (VID: 0x10c4, PID: 0xea60)
- ESP32 với FT232 (VID: 0x0403, PID: 0x6001)

**Kết quả mong đợi:**
- ✅ Popup hiện TẤT CẢ các device
- ✅ Chọn bất kỳ device nào đều kết nối được

**Code đã fix (ESP_USB_FILTERS):**
```typescript
const ESP_USB_FILTERS: SerialPortFilter[] = [
  { usbVendorId: 0x303a },                        // ESP32-S2/S3 Native USB
  { usbVendorId: 0x1a86, usbProductId: 0x7523 }, // CH340/CH341
  { usbVendorId: 0x1a86, usbProductId: 0x55d4 }, // CH9102
  { usbVendorId: 0x1a86, usbProductId: 0x55d3 }, // CH343
  { usbVendorId: 0x10c4, usbProductId: 0xea60 }, // CP2102/CP2104
  { usbVendorId: 0x10c4, usbProductId: 0xea63 }, // CP2102N
  { usbVendorId: 0x10c4, usbProductId: 0xea71 }, // CP2102N newer
  { usbVendorId: 0x0403, usbProductId: 0x6001 }, // FT232
  { usbVendorId: 0x0403, usbProductId: 0x6015 }, // FT231X
]
```

---

### ✅ TEST 7: Multiple Connections (Stability Test)

**Bước 1:** Kết nối → Disconnect → Kết nối lại (x5 lần)

**Kết quả mong đợi:**
- ✅ Tất cả 5 lần kết nối thành công
- ✅ Không có memory leak
- ✅ Port được cleanup đúng mỗi lần

---

### ✅ TEST 8: Force Release Ports (Recovery Tool)

**Bước 1:** Nếu gặp lỗi "port already open"

**Bước 2:** Refresh trang (Ctrl+F5)

**Bước 3:** Mở Console và gõ:
```javascript
// Giả sử đã có instance flashTool
await flashTool.current.forceReleasePorts()
```

**Kết quả mong đợi:**
- ✅ Console hiện: `🧹 Giải phóng cổng...`
- ✅ Console hiện: `Tìm thấy X cổng`
- ✅ Console hiện: `✅ Đã giải phóng tất cả cổng`
- ✅ Sau đó kết nối lại thành công

---

### ✅ TEST 9: Flash Firmware (End-to-End)

**Bước 1:** Kết nối ESP32 thành công

**Bước 2:** Chọn firmware (ví dụ: Robot Otto)

**Bước 3:** Click "Flash Firmware"

**Kết quả mong đợi:**
- ✅ Progress bar hiện và tăng dần
- ✅ Console hiện các stage:
  - `🔌 Chuẩn bị flash firmware...`
  - `📦 Đang phân tích firmware...`
  - `✏️ Đang ghi firmware...`
  - `✅ Đang kiểm tra...`
  - `🎉 Flash thành công!`
- ✅ Không có error

---

### ✅ TEST 10: Serial Monitor

**Bước 1:** Kết nối ESP32

**Bước 2:** Chuyển tab "Serial Monitor"

**Bước 3:** Click "▶️ Bật Monitor"

**Bước 4:** Nhấn nút RESET trên ESP32

**Kết quả mong đợi:**
- ✅ Serial Monitor hiện dữ liệu từ ESP32
- ✅ Thấy boot messages
- ✅ Không có lỗi "port not readable"

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Popup không hiện
**Nguyên nhân:** User gesture bị phá vỡ  
**Fix:** Đã fix trong code - `requestPort()` gọi ngay lập tức  
**Verify:** Xem console có error "User gesture" không

### Issue 2: "Port already open"
**Nguyên nhân:** Port cũ không được đóng  
**Fix:** Đã fix - `releaseStalePorts()` cleanup tự động  
**Verify:** Test case 5 phải PASS

### Issue 3: Không tìm thấy device trong popup
**Nguyên nhân:** USB filter không đủ rộng  
**Fix:** Đã fix - thêm nhiều VID/PID hơn  
**Verify:** Test case 6 - tất cả device phải hiện

### Issue 4: "Port not readable/writable"
**Nguyên nhân:** Port không mở đúng  
**Fix:** Đã fix - verify readable/writable sau khi open  
**Code:**
```typescript
if (!this.port.readable || !this.port.writable) {
  throw new Error('Cổng serial không hỗ trợ đọc/ghi...')
}
```

---

## 📊 EXPECTED RESULTS SUMMARY

| Test Case | Status | Priority |
|-----------|--------|----------|
| 1. WebSerial Support | ⏳ | HIGH |
| 2. Popup Hiện | ⏳ | CRITICAL |
| 3. Chọn Port OK | ⏳ | CRITICAL |
| 4. User Cancel OK | ⏳ | MEDIUM |
| 5. Port Already Open Fix | ⏳ | CRITICAL |
| 6. USB Filters | ⏳ | HIGH |
| 7. Multiple Connections | ⏳ | HIGH |
| 8. Force Release | ⏳ | MEDIUM |
| 9. Flash Firmware | ⏳ | HIGH |
| 10. Serial Monitor | ⏳ | MEDIUM |

**Pass Criteria:** Ít nhất 8/10 tests PASS (bao gồm tất cả CRITICAL)

---

## 🎯 FOCUS AREAS (Đã Fix)

### 1. ✅ User Gesture Preservation
```typescript
// ❌ TRƯỚC - SAI:
await cleanup()  // async breaks gesture
this.port = await requestPort()  // BLOCKED!

// ✅ SAU - ĐÚNG:
this.port = await requestPort()  // FIRST!
await cleanup()  // AFTER port selected
```

### 2. ✅ Port Cleanup
```typescript
// Tự động cleanup ports cũ KHÔNG phá vỡ gesture
await this.releaseStalePorts(selectedPort, previousPort)
```

### 3. ✅ Safe Close
```typescript
// Handle InvalidStateError gracefully
private async safeClosePort(port, label) {
  try {
    await port.close()
  } catch (error) {
    if (error.name === 'InvalidStateError') {
      // Port đã đóng - OK
    }
  }
}
```

### 4. ✅ Wider USB Filters
```typescript
// Cho phép VID without PID (ESP32-S2/S3 native USB)
{ usbVendorId: 0x303a }  // All Espressif devices

// Thêm nhiều USB-to-Serial chips
{ usbVendorId: 0x1a86, usbProductId: 0x55d3 }  // CH343
{ usbVendorId: 0x10c4, usbProductId: 0xea63 }  // CP2102N
{ usbVendorId: 0x10c4, usbProductId: 0xea71 }  // CP2102N new
{ usbVendorId: 0x0403, usbProductId: 0x6015 }  // FT231X
```

---

## 🔬 DEBUG TIPS

### 1. Console Logging
Tất cả operations có console.log rõ ràng:
- `🔌` = Requesting port
- `✅` = Success
- `❌` = Error
- `⚠️` = Warning
- `🧹` = Cleanup
- `ℹ️` = Info

### 2. Check Port Info
```javascript
// Trong console, sau khi kết nối:
flashTool.current.getPort()?.getInfo()
// Kết quả: { usbVendorId: 0x303a, usbProductId: 0x1001 }
```

### 3. Check Granted Ports
```javascript
// Xem tất cả ports đã được grant permission:
await navigator.serial.getPorts()
```

---

## 📝 REPORT TEMPLATE

**Tester:** [Tên của bạn]  
**Date:** 30/10/2025  
**Browser:** Chrome 120 / Edge 120 / Opera [version]  
**OS:** Windows 10/11 / macOS / Linux  
**ESP32:** ESP32-S3 / S2 / C3 [model]  
**USB Chip:** CH340 / CP2102 / FT232 / Native USB

### Test Results:
- [ ] Test 1: WebSerial Support - PASS/FAIL
- [ ] Test 2: Popup Hiện - PASS/FAIL
- [ ] Test 3: Chọn Port - PASS/FAIL
- [ ] Test 4: User Cancel - PASS/FAIL
- [ ] Test 5: Port Already Open - PASS/FAIL ⭐ CRITICAL
- [ ] Test 6: USB Filters - PASS/FAIL
- [ ] Test 7: Multiple Connections - PASS/FAIL
- [ ] Test 8: Force Release - PASS/FAIL
- [ ] Test 9: Flash Firmware - PASS/FAIL
- [ ] Test 10: Serial Monitor - PASS/FAIL

### Console Logs:
```
[Paste console logs here]
```

### Screenshots:
- [ ] Popup chọn port
- [ ] Kết nối thành công
- [ ] Flash progress
- [ ] Console logs

### Issues Found:
1. [Mô tả issue nếu có]

### Conclusion:
✅ ALL PASS - Ready for production  
⚠️ MINOR ISSUES - Can deploy with notes  
❌ CRITICAL ISSUES - Need fix before deploy

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
- **Zalo:** 0389827643
- **GitHub Issues:** Create issue với console logs
- **Email:** [support email]

---

**Last Updated:** 30/10/2025  
**Version:** v2.1 (USB Connection Fix)



