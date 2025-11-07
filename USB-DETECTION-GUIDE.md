# Hướng dẫn Nhận diện USB và Flash ESP32

## Cải tiến từ espflash repository

### 1. USB Filters đầy đủ

Đã cập nhật danh sách USB Vendor/Product IDs để hỗ trợ nhiều loại chip USB-to-Serial và ESP32 native USB:

```typescript
// Espressif native USB (ESP32-S2/S3)
0x303a:0x1001 - USB_SERIAL_JTAG
0x303a:0x1002 - esp-usb-bridge
0x303a:0x0002 - ESP32-S2 USB_CDC
0x303a:0x0009 - ESP32-S3 USB_CDC

// CH340 family (phổ biến nhất)
0x1a86:0x7523 - CH340T
0x1a86:0x55d4 - CH9102F
0x1a86:0x55d3 - CH343

// CP210x family (Silicon Labs)
0x10c4:0xea60 - CP2102/CP2104
0x10c4:0xea63 - CP2102N
0x10c4:0xea71 - CP2102N (mới)

// FTDI chips
0x0403:0x6001 - FT232R
0x0403:0x6010 - FT2232H
0x0403:0x6015 - FT231X/FT234XD
```

### 2. Quy trình kết nối tối ưu

#### Luồng kết nối hiện tại:

```
1. Kiểm tra WebSerial support
2. Request port (preserve user gesture) ← QUAN TRỌNG!
3. Clean up các port cũ (sau khi đã chọn)
4. Đóng port đã chọn (nếu đang mở)
5. Mở port với cấu hình 115200 baud
6. Kiểm tra readable/writable
7. Khởi tạo Transport & ESPLoader
8. Connect to bootloader (tự động)
9. Detect chip type
```

#### Điểm quan trọng:
- ✅ **Request port TRƯỚC** - giữ nguyên user gesture
- ✅ **Clean up SAU** - không làm mất user gesture
- ✅ **Auto-retry không có** - tránh vòng lặp vô hạn
- ✅ **Error messages rõ ràng** - hướng dẫn người dùng cụ thể

### 3. Xử lý lỗi thông minh

#### Lỗi thường gặp và giải pháp:

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| `NotFoundError` | User hủy chọn thiết bị | Cho phép retry |
| `NotAllowedError` | Quyền truy cập bị từ chối | Hướng dẫn cấp quyền |
| `Port already open` | Port bị khóa bởi browser | Dùng nút "Giải phóng cổng" |
| `timeout/sync` | Không vào được bootloader | Hướng dẫn nhấn giữ nút BOOT |
| `Not readable/writable` | Port lỗi | Rút cắm lại thiết bị |

### 4. Progress Tracking

#### Từ espflash:
```javascript
// Parse log từ esptool: "Writing at 0x1a6a88... (37%)"
function handleProgressFromLog(raw) {
    const match = text.match(/\((\d{1,3})%\)/);
    if (match) {
        const pct = parseInt(match[1]);
        updateProgress(pct, written, total);
    }
}

// Tính toán tốc độ và thời gian
const speed = bytesWritten / elapsed / 1024; // KB/s
const remaining = (totalBytes - bytesWritten) / (speed * 1024);
```

#### Đã áp dụng:
- ✅ `reportProgress` callback trong `writeFlash`
- ✅ Progress từ 20-80% (writing stage)
- ✅ Hiển thị KB đã ghi và tổng KB

## Checklist khắc phục lỗi không nhận USB

### 1. Kiểm tra trình duyệt
- [ ] Đang dùng Chrome/Edge/Opera (>= 89)?
- [ ] Không dùng Firefox/Safari (không hỗ trợ WebSerial)
- [ ] Extension có chặn popup không?

### 2. Kiểm tra thiết bị
- [ ] ESP32 đã cắm USB chưa?
- [ ] Thử cổng USB khác
- [ ] Thử cáp USB khác (cáp data, không phải chỉ sạc)
- [ ] Đèn nguồn ESP32 có sáng không?

### 3. Kiểm tra driver
#### Windows:
```powershell
# Mở Device Manager
devmgmt.msc

# Tìm trong "Ports (COM & LPT)"
# Nếu thấy dấu ! vàng → cài driver:
```

- **CH340**: https://www.wch.cn/downloads/CH341SER_EXE.html
- **CP210x**: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
- **FTDI**: https://ftdichip.com/drivers/vcp-drivers/

#### macOS:
```bash
# CH340
brew install --cask wch-ch34x-usb-serial-driver

# CP210x (thường built-in)
# FTDI (thường built-in)
```

#### Linux:
```bash
# Thêm user vào group dialout
sudo usermod -a -G dialout $USER

# Logout và login lại

# Kiểm tra device
ls -l /dev/ttyUSB* /dev/ttyACM*
```

### 4. Kiểm tra quyền truy cập
- [ ] Trình duyệt hiển thị popup chọn thiết bị?
- [ ] Có chọn đúng device trong popup?
- [ ] Quyền "Serial ports" có được cấp không?

**Kiểm tra quyền:**
```
Chrome: chrome://settings/content/serialPorts
Edge: edge://settings/content/serialPorts
```

### 5. Vào chế độ bootloader
Nếu kết nối nhưng không flash được:

**Cách 1 (tự động):**
- Chỉ cần cắm USB bình thường
- Tool sẽ tự động reset ESP32 vào bootloader

**Cách 2 (thủ công):**
1. Nhấn giữ nút **BOOT**
2. Cắm cáp USB vào máy tính
3. Thả nút **BOOT**
4. Click "Kết nối thiết bị"

**Cách 3 (hardware reset):**
1. Nhấn giữ nút **BOOT**
2. Nhấn và thả nút **RESET**
3. Thả nút **BOOT**
4. Click "Kết nối thiết bị"

### 6. Debug với Console

Mở Developer Tools (F12) → Console:

```javascript
// Kiểm tra WebSerial support
console.log('WebSerial:', 'serial' in navigator);

// Liệt kê các port đã granted
navigator.serial.getPorts().then(ports => {
    console.log('Granted ports:', ports.length);
    ports.forEach(p => console.log(p.getInfo()));
});

// Thử request port thủ công
navigator.serial.requestPort().then(port => {
    console.log('Selected:', port.getInfo());
}).catch(e => console.error(e));
```

### 7. Dùng nút "Giải phóng cổng"

Nếu thấy lỗi "Port already open":
1. Click nút **🧹 Giải phóng cổng**
2. Đợi 2 giây
3. Thử kết nối lại

## Tips nâng cao

### 1. Kiểm tra baudrate
- Mặc định: 115200 (phù hợp hầu hết thiết bị)
- Nếu lỗi sync: thử 460800 hoặc 921600
- Thiết bị cũ: thử 57600 hoặc 9600

### 2. Firmware address
- **Merged binary** (0xE9 magic byte): flash tại `0x0000`
- **App-only binary**: flash tại `0x10000`
- Tool tự động detect và chọn địa chỉ đúng

### 3. Power issues
- ESP32 cần ~500mA khi flash
- USB 2.0 port: tối đa 500mA ✅
- USB hub không nguồn: có thể không đủ ⚠️
- Giải pháp: cắm trực tiếp vào cổng USB máy tính

### 4. Lỗi esptool sync
```
A fatal error occurred: Failed to connect to ESP32
```

**Nguyên nhân:**
- Thiết bị không vào bootloader mode
- Baudrate không phù hợp
- Cáp USB lỗi (chỉ sạc, không có data)
- Driver chưa cài đúng

**Giải pháp:**
1. Thử cách vào bootloader thủ công (Cách 2/3 ở trên)
2. Thử baudrate thấp hơn (115200 → 57600)
3. Đổi cáp USB
4. Cài lại driver

## Kết luận

Với những cải tiến từ espflash repository, tool hiện tại đã:
- ✅ Hỗ trợ nhiều loại USB-to-Serial chip hơn
- ✅ Xử lý lỗi tốt hơn với thông báo rõ ràng
- ✅ Quy trình kết nối ổn định hơn
- ✅ Progress tracking chi tiết hơn
- ✅ Auto-detect firmware type và flash address

Nếu vẫn gặp vấn đề, mở Developer Console (F12) và gửi log lỗi để được hỗ trợ chi tiết hơn.
