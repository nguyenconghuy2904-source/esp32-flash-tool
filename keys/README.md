# 🔑 KIKI ĐÂY - VIP KEYS MANAGEMENT

## 📋 Tổng Quan

Thư mục này chứa 100 VIP keys dành riêng cho firmware **Kiki đây**.

## 📁 Files Được Tạo

### 1. Text File (`.txt`)
- File: `kiki-day-keys-YYYYMMDD_HHMMSS.txt`
- Mục đích: Danh sách keys dạng text thuần
- Dùng để: In ra giấy, chia sẻ đơn giản

### 2. JSON File (`.json`)
- File: `kiki-day-keys-YYYYMMDD_HHMMSS.json`
- Mục đích: Format JSON cho API/import
- Dùng để: Tích hợp với hệ thống khác

### 3. SQL File (`.sql`)
- File: `kiki-day-keys-YYYYMMDD_HHMMSS.sql`
- Mục đích: Script import vào database
- Dùng để: Import trực tiếp vào Cloudflare D1

### 4. CSV File (`.csv`)
- File: `kiki-day-distribution-YYYYMMDD_HHMMSS-excel.csv`
- Mục đích: Quản lý phân phối keys
- Dùng để: Mở bằng Excel, tracking khách hàng

## 🚀 Hướng Dẫn Sử Dụng

### Bước 1: Generate Keys
```powershell
.\scripts\generate-kiki-keys.ps1
```

### Bước 2: Import vào Database
```powershell
# Local testing
.\scripts\import-kiki-keys.ps1

# Production
.\scripts\import-kiki-keys.ps1 -Production
```

### Bước 3: Export CSV quản lý
```powershell
.\scripts\export-kiki-csv.ps1
```

### Bước 4: Quản lý trong Excel
1. Mở file CSV bằng Excel
2. Điền thông tin khách hàng khi giao key
3. Cập nhật trạng thái: ChuaGiao → DaGiao → DaKichHoat
4. Tracking ngày giao, ngày kích hoạt

## 📊 Cấu Trúc CSV

| Cột | Mô Tả | Giá Trị |
|-----|-------|---------|
| STT | Số thứ tự | 1-100 |
| Key | Mã key 9 số | 123456789 |
| TrangThai | Trạng thái key | ChuaGiao/DaGiao/DaKichHoat |
| KhachHang | Tên khách | Nguyễn Văn A |
| SDT | SĐT khách | 0389827643 |
| Email | Email khách | email@example.com |
| NgayGiao | Ngày giao key | 2025-10-22 |
| NgayKichHoat | Ngày kích hoạt | 2025-10-23 |
| GhiChu | Ghi chú | VIP Gold |

## ⚠️ BẢO MẬT

### QUAN TRỌNG:
- ✅ **KHÔNG commit** keys vào Git
- ✅ **KHÔNG share** keys công khai
- ✅ Giữ file trong thư mục `keys/` (đã có trong .gitignore)
- ✅ Backup keys ở nơi an toàn
- ✅ Mỗi key chỉ giao cho 1 khách hàng
- ✅ Track key distribution trong CSV

### Keys đã trong .gitignore:
```gitignore
keys/
*.csv
*.sql
*.json
```

## 📈 Thống Kê

### Tổng Keys: 100
- Chưa giao: 100
- Đã giao: 0
- Đã kích hoạt: 0

### Database:
```sql
-- Check total Kiki keys
SELECT COUNT(*) FROM auth_keys WHERE description LIKE '%Kiki%';

-- Check used keys
SELECT COUNT(*) FROM auth_keys WHERE description LIKE '%Kiki%' AND is_used = 1;

-- Check available keys
SELECT COUNT(*) FROM auth_keys WHERE description LIKE '%Kiki%' AND is_used = 0;
```

## 🔄 Quy Trình Giao Key

1. **Khách hàng mua VIP package**
2. **Chọn 1 key từ danh sách "ChuaGiao"**
3. **Điền thông tin khách vào CSV**
4. **Đổi trạng thái → "DaGiao"**
5. **Gửi key cho khách qua Zalo/Email**
6. **Khi khách kích hoạt → "DaKichHoat"**

## 📞 Liên Hệ

- **Zalo Support**: 0389827643
- **Email**: support@minizjp.com
- **YouTube**: @miniZjp

## 📝 Notes

- Keys được generate ngẫu nhiên 9 chữ số
- Mỗi key unique, không trùng lặp
- Keys được sort tăng dần để dễ tìm
- Format chuẩn cho Cloudflare D1 database
- Có rate limiting: 5 attempts / 15 minutes

---

**Generated**: 2025-10-22
**Total Keys**: 100
**Firmware**: Kiki đây (VIP Exclusive)
