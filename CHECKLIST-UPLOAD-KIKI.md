# ✅ CHECKLIST: Upload Kiki Firmware

## 📋 Danh Sách Cần Làm

### ☐ 1. Chuẩn bị File Firmware
- [ ] Có file `.bin` sẵn sàng
- [ ] Tên file: `esp32-s3-kiki-day.bin`
- [ ] Đã test firmware hoạt động
- [ ] Kích thước: < 4MB

### ☐ 2. Tạo GitHub Repository
- [ ] Truy cập: https://github.com/new
- [ ] Repository name: `kiki-day-firmware`
- [ ] Owner: `nguyenconghuy2904-source`
- [ ] Visibility: **Private** ✓ (recommended)
- [ ] Initialize with README: ✓
- [ ] Create repository

### ☐ 3. Setup Repository
```powershell
# Clone
git clone https://github.com/nguyenconghuy2904-source/kiki-day-firmware.git
cd kiki-day-firmware

# Copy README template
copy ..\esp32-flash-tool\KIKI-FIRMWARE-README-TEMPLATE.md README.md

# Add firmware file
copy "C:\path\to\your\firmware.bin" esp32-s3-kiki-day.bin

# Commit
git add .
git commit -m "feat: initial Kiki đây VIP firmware"
git push origin main
```
- [ ] README.md đã copy
- [ ] Firmware file đã add
- [ ] Đã push lên GitHub

### ☐ 4. Tạo GitHub Release
URL: https://github.com/nguyenconghuy2904-source/kiki-day-firmware/releases/new

**Release Details:**
- [ ] Tag version: `v1.0.0`
- [ ] Release title: `Kiki đây VIP Firmware v1.0.0`
- [ ] Description: (copy từ template hoặc tự viết)
- [ ] Attach binary: `esp32-s3-kiki-day.bin`
- [ ] Click **"Publish release"**

### ☐ 5. Import VIP Keys vào Production
```powershell
cd cloudflare-workers

# Import keys
wrangler d1 execute esp32-flash-db --file="../keys/kiki-day-keys-TIMESTAMP.sql"

# Verify
wrangler d1 execute esp32-flash-db --command="SELECT COUNT(*) FROM auth_keys WHERE description LIKE '%Kiki%'"
```
- [ ] Keys đã import
- [ ] Verify số lượng = 100

### ☐ 6. Test trên Website
- [ ] Truy cập: https://minizjp.com
- [ ] Chip mặc định: ESP32-S3 ✓
- [ ] Firmware đầu tiên: "Kiki đây" ✓
- [ ] Click "Nạp FW"
- [ ] Kết nối ESP32-S3
- [ ] Nhập 1 test key
- [ ] Key validation thành công
- [ ] Download firmware thành công
- [ ] Nạp firmware thành công
- [ ] ESP32 hoạt động ✓

### ☐ 7. Phân Phối Keys
- [ ] Mở file CSV: `keys/kiki-day-distribution-TIMESTAMP-excel.csv`
- [ ] Tracking khách hàng trong Excel
- [ ] Gửi key cho VIP customer đầu tiên
- [ ] Cập nhật trạng thái: ChuaGiao → DaGiao
- [ ] Follow up khi customer kích hoạt

### ☐ 8. Monitor & Support
- [ ] Check database usage logs
- [ ] Monitor blocked IPs (nếu có spam)
- [ ] Respond to customer inquiries
- [ ] Update firmware khi cần

## 🎉 HOÀN THÀNH!

Firmware Kiki đây đã live trên website!

---

## 📞 Cần Hỗ Trợ?

Nếu gặp vấn đề:
1. Check file: `UPLOAD-KIKI-FIRMWARE.md`
2. Check file: `UPLOAD-FIRMWARE-GUIDE.md`
3. Run script: `.\scripts\setup-kiki-firmware.ps1`

---

**Date**: _______________  
**By**: _______________  
**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Completed
