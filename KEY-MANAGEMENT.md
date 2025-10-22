# 🔑 Hướng dẫn Quản lý Keys

## Tổng quan
ESP32 Flash Tool sử dụng hệ thống key **9 chữ số** để xác thực firmware có yêu cầu key.

Hệ thống hỗ trợ 2 loại key:
1. **Key thường** - Một key chỉ dùng cho 1 thiết bị
2. **Test key** - Dùng được cho nhiều thiết bị (không giới hạn)

## 🧪 Test Keys (5 key unlimited)

### Danh sách Test Keys:
```
111111111 - Test Key 1 (Unlimited use, multiple devices)
222222222 - Test Key 2 (Unlimited use, multiple devices)
333333333 - Test Key 3 (Unlimited use, multiple devices)
444444444 - Test Key 4 (Unlimited use, multiple devices)
555555555 - Test Key 5 (Unlimited use, multiple devices)
```

### Đặc điểm Test Keys:
- ✅ **Dùng được nhiều chip** - Không giới hạn số thiết bị
- ✅ **999,999 lượt sử dụng** - Không giới hạn thực tế
- ✅ **Không bind device** - Không ràng buộc với device ID
- ✅ **Cho demo/test** - Chia sẻ cho khách hàng test
- ✅ **Bypass device check** - Không check thiết bị đã sử dụng

### Cài đặt Test Keys:
```powershell
.\scripts\add-test-keys.ps1
```

Hoặc chạy migration thủ công:
```bash
cd cloudflare-workers
wrangler d1 execute esp32-flash-db --file=./migrations/0004_add_test_keys.sql
wrangler deploy
```

## Format Key Thường
- **Định dạng**: 9 chữ số (0-9)
- **Ví dụ**: `123456789`, `987654321`, `555123456`
- **Đặc điểm**: Mỗi key chỉ có thể sử dụng với 1 thiết bị duy nhất

## Tạo Keys mới

### 1. Tạo 1 key
```bash
node scripts/generate-keys.js single
```

### 2. Tạo nhiều keys (batch)
```bash
# Tạo 10 keys
node scripts/generate-keys.js batch 10

# Tạo 20 keys với mô tả
node scripts/generate-keys.js batch 20 "VIP Customer Keys - Jan 2025"
```

### 3. Validate key
```bash
node scripts/generate-keys.js validate 123456789
```

## Thêm Keys vào Database

### Cloudflare D1 (Production)
```bash
cd cloudflare-workers

# Chạy migration (nếu chưa chạy)
wrangler d1 migrations apply esp32-flash-keys --remote

# Thêm key thủ công
wrangler d1 execute esp32-flash-keys --remote --command="INSERT INTO auth_keys (key_hash, description) VALUES ('123456789', 'Customer #1 - Jan 2025')"

# Hoặc thêm nhiều keys bằng SQL file
wrangler d1 execute esp32-flash-keys --remote --file=./add-keys.sql
```

### Local Testing
```bash
cd cloudflare-workers

# Chạy migration local
wrangler d1 migrations apply esp32-flash-keys --local

# Thêm key local
wrangler d1 execute esp32-flash-keys --local --command="INSERT INTO auth_keys (key_hash, description) VALUES ('123456789', 'Test key')"
```

## Quản lý Keys

### Kiểm tra key trong database
```bash
# Production
wrangler d1 execute esp32-flash-keys --remote --command="SELECT * FROM auth_keys WHERE key_hash = '123456789'"

# Local
wrangler d1 execute esp32-flash-keys --local --command="SELECT * FROM auth_keys WHERE key_hash = '123456789'"
```

### Xem tất cả keys
```bash
wrangler d1 execute esp32-flash-keys --remote --command="SELECT key_hash, description, is_used, device_id, created_at, used_at FROM auth_keys ORDER BY created_at DESC LIMIT 20"
```

### Xem keys đã sử dụng
```bash
wrangler d1 execute esp32-flash-keys --remote --command="SELECT * FROM auth_keys WHERE is_used = 1"
```

### Xem keys chưa sử dụng
```bash
wrangler d1 execute esp32-flash-keys --remote --command="SELECT * FROM auth_keys WHERE is_used = 0"
```

### Thống kê
```bash
wrangler d1 execute esp32-flash-keys --remote --command="SELECT COUNT(*) as total_keys, SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_keys, COUNT(DISTINCT device_id) as unique_devices FROM auth_keys"
```

## Gửi Key cho Khách hàng

### Template Email
```
Xin chào,

Cảm ơn bạn đã sử dụng ESP32 Flash Tool!

KEY KÍCH HOẠT CỦA BẠN: 123456789

Hướng dẫn sử dụng:
1. Truy cập: https://minizjp.com
2. Chọn loại chip ESP32 của bạn
3. Chọn firmware cần nạp
4. Nhập key: 123456789
5. Kết nối và nạp firmware

Lưu ý:
- Mỗi key chỉ có thể sử dụng với 1 thiết bị
- Key không thể chuyển nhượng sau khi kích hoạt
- Hỗ trợ: Zalo 0389827643

Trân trọng,
MiniZ Team
```

### Template Zalo/SMS
```
🔑 ESP32 Flash Tool
KEY: 123456789
Truy cập: minizjp.com
Hỗ trợ: 0389827643
```

## Xử lý lỗi

### Key không tồn tại
- Kiểm tra lại key trong database
- Đảm bảo đã add key vào production database

### Key đã được sử dụng
- Mỗi key chỉ dùng cho 1 thiết bị
- Kiểm tra `device_id` để xác nhận thiết bị
- Nếu cần reset, xóa `device_id` và set `is_used = 0`

### Reset key (nếu cần)
```bash
wrangler d1 execute esp32-flash-keys --remote --command="UPDATE auth_keys SET is_used = 0, device_id = NULL, used_at = NULL WHERE key_hash = '123456789'"
```

## Security Best Practices

1. **Không public keys**: Chỉ gửi key cho khách hàng đã thanh toán
2. **Rate limiting**: Worker có thể add rate limiting nếu bị spam
3. **Logging**: Tất cả usage đều được log vào `usage_logs` table
4. **Backup**: Backup database định kỳ

## API Endpoints

### POST /auth
Xác thực key và gắn với device

**Request:**
```json
{
  "key": "123456789",
  "deviceId": "device-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Key hợp lệ và đã được xác thực thành công",
  "deviceId": "device-abc123"
}
```

### GET /auth?key=123456789
Kiểm tra trạng thái key

**Response:**
```json
{
  "success": true,
  "used": true,
  "deviceId": "device-abc123",
  "createdAt": "2025-01-15 10:30:00",
  "usedAt": "2025-01-15 11:00:00"
}
```

### GET /stats
Thống kê tổng quan

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_keys": 100,
    "used_keys": 45,
    "unique_devices": 42
  }
}
```

## Troubleshooting

### Worker không nhận key
1. Deploy lại Worker: `wrangler deploy`
2. Kiểm tra logs: `wrangler tail`
3. Test endpoint: `curl -X POST https://your-worker.workers.dev/auth -H "Content-Type: application/json" -d '{"key":"123456789"}'`

### Database không sync
1. Chạy lại migrations: `wrangler d1 migrations apply esp32-flash-keys --remote`
2. Kiểm tra database binding trong `wrangler.toml`

---

**Liên hệ hỗ trợ**: Zalo 0389827643 | YouTube @miniZjp
