# 🔧 Troubleshooting WebSerial USB Connection

## ❌ Vấn đề: Không hiện popup chọn cổng USB

### Nguyên nhân & Giải pháp:

---

### 1. **Trình duyệt không hỗ trợ WebSerial API**

**Triệu chứng:**
- Click "Kết nối ESP32" không có phản ứng
- Thông báo: "Trình duyệt không hỗ trợ WebSerial API"

**Giải pháp:**
✅ Dùng các trình duyệt sau:
- ✅ **Google Chrome** (khuyến nghị)
- ✅ **Microsoft Edge**
- ✅ **Opera**
- ✅ **Brave**

❌ KHÔNG dùng:
- ❌ Firefox (chưa hỗ trợ WebSerial)
- ❌ Safari (chưa hỗ trợ WebSerial)
- ❌ Internet Explorer

**Kiểm tra hỗ trợ:**
```javascript
// Mở Console (F12) và chạy:
console.log('WebSerial support:', 'serial' in navigator)
// Nếu false → trình duyệt không hỗ trợ
```

---

### 2. **Website không chạy trên HTTPS hoặc localhost**

**Triệu chứng:**
- Popup không hiện dù dùng Chrome
- Thông báo: "WebSerial chỉ hoạt động trên HTTPS hoặc localhost"

**Giải pháp:**
✅ Truy cập website qua HTTPS:
- ✅ `https://minizjp.com`
- ✅ `https://nguyenconghuy2904-source.github.io/esp32-flash-tool`
- ✅ `http://localhost:3000` (nếu chạy local)

❌ KHÔNG truy cập qua HTTP:
- ❌ `http://minizjp.com`
- ❌ `http://192.168.x.x`

**Kiểm tra:**
```javascript
// Mở Console (F12):
console.log('Protocol:', window.location.protocol)
// Phải là: "https:" hoặc "http:" (nếu localhost)
```

---

### 3. **Thiết bị USB chưa kết nối**

**Triệu chứng:**
- Popup hiện nhưng không có thiết bị nào
- Thông báo: "Không tìm thấy thiết bị USB"

**Giải pháp:**
1. **Kiểm tra cáp USB:**
   - Dùng cáp USB có hỗ trợ DATA (không chỉ sạc)
   - Thử cáp USB khác nếu cần

2. **Kiểm tra kết nối:**
   - Rút ESP32 ra và cắm lại
   - Thử cổng USB khác trên máy tính
   - Đèn LED trên ESP32 có sáng không?

3. **Kiểm tra Device Manager (Windows):**
   - Mở Device Manager (Win + X → Device Manager)
   - Tìm "Ports (COM & LPT)"
   - Phải thấy "USB-SERIAL CH340" hoặc "CP2102"
   - Nếu có dấu chấm than vàng → cài driver

---

### 4. **Thiết bị đang được sử dụng bởi app khác**

**Triệu chứng:**
- Popup hiện nhưng khi chọn cổng báo lỗi
- Thông báo: "Thiết bị đang được sử dụng"

**Giải pháp:**
Đóng các ứng dụng đang dùng cổng COM:
- ❌ Arduino IDE
- ❌ PlatformIO
- ❌ Serial Monitor tools
- ❌ Putty, Tera Term
- ❌ ESP-IDF Tools

**Kiểm tra process (Windows):**
```powershell
# PowerShell - check cổng COM đang mở:
Get-WmiObject Win32_SerialPort | Select-Object Name, DeviceID
```

---

### 5. **Chưa cài driver CH340/CP2102**

**Triệu chứng:**
- Device Manager không thấy cổng COM
- Hoặc có "Unknown Device"

**Giải pháp:**

**Windows:**
1. Download driver:
   - CH340: https://www.wch.cn/downloads/CH341SER_ZIP.html
   - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

2. Cài đặt driver
3. Restart máy tính
4. Cắm lại ESP32

**Mac:**
- CH340: https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver
- CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

**Linux:**
```bash
# Driver thường có sẵn, check bằng:
ls /dev/ttyUSB*
# hoặc
ls /dev/ttyACM*
```

---

### 6. **Quyền truy cập bị từ chối**

**Triệu chứng:**
- Popup hiện nhưng báo "Permission denied" khi chọn
- Thông báo: "Bạn đã từ chối quyền truy cập"

**Giải pháp:**
1. **Thử lại và cho phép:**
   - Click "Kết nối ESP32" lần nữa
   - Khi popup hiện → chọn cổng COM
   - Click **"Connect"** (không click Cancel)

2. **Reset quyền truy cập:**
   - Chrome: Settings → Privacy and security → Site settings → Additional permissions → Serial ports
   - Xóa minizjp.com và thử lại

3. **Linux - thêm user vào dialout group:**
```bash
sudo usermod -a -G dialout $USER
# Logout và login lại
```

---

### 7. **ESP32 không vào bootloader mode**

**Triệu chứng:**
- Kết nối được nhưng không flash được
- Báo "Cannot enter bootloader mode"

**Giải pháp:**
1. **Nhấn giữ nút BOOT:**
   - Nhấn giữ nút BOOT trên ESP32
   - Trong khi giữ, click "Kết nối ESP32"
   - Thả nút BOOT sau khi popup xuất hiện

2. **Reset ESP32:**
   - Nhấn nút RESET (EN) trước
   - Sau đó nhấn giữ BOOT và kết nối

3. **Auto-reset circuit:**
   - Một số board ESP32 cần kết nối thêm DTR/RTS
   - Hoặc dùng board có auto-reset (NodeMCU ESP32)

---

## 📋 Checklist Troubleshooting

### ✅ Kiểm tra trước khi kết nối:

- [ ] Dùng Chrome/Edge/Opera (không phải Firefox/Safari)
- [ ] Website mở qua HTTPS (`https://minizjp.com`)
- [ ] ESP32 đã cắm USB vào máy tính
- [ ] Cáp USB hỗ trợ DATA (không chỉ sạc)
- [ ] Driver CH340/CP2102 đã cài
- [ ] Device Manager thấy cổng COM
- [ ] Đóng Arduino IDE, PlatformIO, Serial Monitor khác
- [ ] Đèn LED trên ESP32 sáng

### ✅ Khi click "Kết nối ESP32":

- [ ] Popup chọn cổng USB hiện ra
- [ ] Thấy tên thiết bị (USB-SERIAL CH340 hoặc CP2102)
- [ ] Click chọn cổng → Click "Connect"
- [ ] Thông báo "✅ Đã kết nối với ESP32"

---

## 🔍 Debug Tools

### Test WebSerial API Support:
```javascript
// Mở Console (F12) và chạy:
if ('serial' in navigator) {
  console.log('✅ WebSerial API supported')
  
  navigator.serial.getPorts().then(ports => {
    console.log('Connected ports:', ports.length)
  })
} else {
  console.log('❌ WebSerial API NOT supported')
}
```

### Request Port Manually:
```javascript
// Test popup:
navigator.serial.requestPort().then(port => {
  console.log('✅ Port selected:', port)
}).catch(err => {
  console.error('❌ Error:', err.name, err.message)
})
```

### Check Available Ports:
```javascript
// List all ports:
navigator.serial.getPorts().then(ports => {
  console.log('Available ports:', ports)
  ports.forEach((port, i) => {
    console.log(`Port ${i}:`, port.getInfo())
  })
})
```

---

## 📞 Vẫn không giải quyết được?

**Liên hệ hỗ trợ:**
- **Zalo:** 0389827643
- **YouTube:** @miniZjp
- **Website:** https://minizjp.com

**Thông tin cần cung cấp:**
1. Trình duyệt và phiên bản (ví dụ: Chrome 120)
2. Hệ điều hành (Windows 10/11, macOS, Linux)
3. Loại chip ESP32 (S3, S3-Zero, C3-Super-Mini)
4. Screenshot lỗi từ Console (F12)
5. Screenshot Device Manager (Windows)

---

## 📚 Tài liệu liên quan:

- [WebSerial API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Chrome WebSerial Guide](https://web.dev/serial/)
- [ESP32 USB Driver Guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/establish-serial-connection.html)

---

© 2025 MinizFlash Tool - Troubleshooting Guide
