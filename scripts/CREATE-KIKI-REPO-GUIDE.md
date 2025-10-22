# 📦 Hướng Dẫn Tạo Repo Kiki Firmware

## Bước 1: Tạo Repository Trên GitHub

### 1.1. Truy cập GitHub
```
https://github.com/new
```

### 1.2. Điền thông tin repo
- **Repository name**: `xiaozhi-esp32-kiki-day`
- **Description**: `🎁 Kiki đây - VIP Firmware for ESP32-S3 (Exclusive)`
- **Visibility**: ✅ **Public** (quan trọng!)
- **Initialize**:
  - ✅ Add a README file
  - ✅ Add .gitignore (chọn template: **None**)
  - ⬜ Choose a license (skip, dùng proprietary)

### 1.3. Click "Create repository"

---

## Bước 2: Clone Repo Về Máy

```powershell
cd f:\
git clone https://github.com/nguyenconghuy2904-source/xiaozhi-esp32-kiki-day.git
cd xiaozhi-esp32-kiki-day
```

---

## Bước 3: Tạo Structure

### 3.1. Tạo file README.md (nội dung sẵn)

Copy từ: `f:\minizjp\KIKI-FIRMWARE-README-TEMPLATE.md`

```powershell
# Trong thư mục xiaozhi-esp32-kiki-day
Copy-Item "f:\minizjp\KIKI-FIRMWARE-README-TEMPLATE.md" -Destination "README.md" -Force
```

### 3.2. Tạo .gitignore

```powershell
@"
# Build files
*.bin
*.elf
*.map
*.o

# IDE
.vscode/
.idea/
*.code-workspace

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log

# Temp
tmp/
temp/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
```

### 3.3. Tạo thư mục firmware (để sau này thêm source nếu cần)

```powershell
New-Item -ItemType Directory -Path "firmware" -Force
@"
# Firmware Source (Optional)

Thư mục này có thể chứa:
- Source code (.c, .h, .cpp)
- Build scripts
- Config files

Hiện tại firmware được build sẵn và upload qua Releases.
"@ | Out-File -FilePath "firmware/README.md" -Encoding UTF8
```

---

## Bước 4: Commit & Push

```powershell
git add .
git commit -m "Initial commit - VIP Kiki firmware repository structure"
git push origin main
```

---

## Bước 5: Tạo GitHub Release v1.0.0

### 5.1. Chuẩn bị file firmware

**File .bin cần có:**
- `kiki-day-esp32s3-v1.0.0.bin` (tên file tùy ý nhưng phải có .bin)
- Kích thước: phù hợp với ESP32-S3 (thường < 4MB)

**Đặt file tại:**
```
f:\kiki-firmware\kiki-day-esp32s3-v1.0.0.bin
```
(hoặc đường dẫn khác tùy bạn)

### 5.2. Tạo Release qua GitHub Web UI

#### Cách 1: Tạo qua Web (KHUYẾN NGHỊ)

1. Truy cập: https://github.com/nguyenconghuy2904-source/xiaozhi-esp32-kiki-day/releases/new

2. Điền thông tin:
   - **Tag version**: `v1.0.0`
   - **Release title**: `🎁 Kiki đây v1.0.0 - VIP Release`
   - **Description**:
     ```markdown
     # 🎉 Kiki đây v1.0.0 - VIP Firmware
     
     ## ✨ Features
     - ⭐ VIP exclusive features
     - 🔐 Secure authentication
     - ⚡ Optimized for ESP32-S3
     - 💎 Priority support
     
     ## 📥 Installation
     
     ### Option 1: Web Flash (Recommended)
     1. Visit: https://minizjp.com
     2. Select: ESP32-S3
     3. Choose: "Kiki đây"
     4. Enter your VIP key (9 digits)
     5. Connect ESP32 and flash!
     
     ### Option 2: Manual Flash (Advanced)
     ```bash
     esptool.py --chip esp32s3 --port COM3 write_flash 0x0 kiki-day-esp32s3-v1.0.0.bin
     ```
     
     ## 🔑 VIP Key Required
     
     Contact for VIP key:
     - 📱 Zalo: 0389827643
     - 🌐 Website: https://minizjp.com
     - 📺 YouTube: @miniZjp
     
     ## 🛠️ Requirements
     - ESP32-S3 DevKit/Module
     - Chrome/Edge browser (for web flash)
     - USB Type-C data cable
     
     ## 📊 File Info
     - **Target**: ESP32-S3
     - **Size**: ~XXX KB (check your file)
     - **MD5**: (optional)
     
     ---
     
     **Made with ❤️ by MinizJP**
     © 2025 - VIP Proprietary License
     ```

3. **Attach binaries**:
   - Click "Attach files" (kéo thả hoặc browse)
   - Upload file: `kiki-day-esp32s3-v1.0.0.bin`
   - Đợi upload xong (có progress bar)

4. **Set as latest release**:
   - ✅ Tick "Set as the latest release"

5. Click **"Publish release"**

#### Cách 2: Tạo qua GitHub CLI (nếu có gh cli)

```powershell
# Install GitHub CLI if not installed: winget install GitHub.cli

# Authenticate
gh auth login

# Create release with binary
cd f:\xiaozhi-esp32-kiki-day
gh release create v1.0.0 `
  --title "🎁 Kiki đây v1.0.0 - VIP Release" `
  --notes-file RELEASE_NOTES.md `
  "f:\kiki-firmware\kiki-day-esp32s3-v1.0.0.bin"
```

---

## Bước 6: Verify Release

### 6.1. Kiểm tra Release đã public

Truy cập: https://github.com/nguyenconghuy2904-source/xiaozhi-esp32-kiki-day/releases/tag/v1.0.0

**Cần thấy:**
- ✅ Tag: v1.0.0
- ✅ Release title và description
- ✅ Binary file có thể download
- ✅ "Latest" badge nếu là release mới nhất

### 6.2. Test download link

```powershell
# Test download (sẽ trả về 302 redirect)
Invoke-WebRequest -Uri "https://github.com/nguyenconghuy2904-source/xiaozhi-esp32-kiki-day/releases/download/v1.0.0/kiki-day-esp32s3-v1.0.0.bin" -Method Head
```

Kết quả mong đợi: `StatusCode: 200` hoặc `302` (redirect)

---

## Bước 7: Test trên Website

### 7.1. Truy cập minizjp.com

```
https://minizjp.com
```

### 7.2. Test flow

1. ✅ Chọn chip: **ESP32-S3** (default)
2. ✅ Firmware "Kiki đây" xuất hiện đầu tiên
3. ✅ Click vào card Kiki
4. ✅ Nhập 1 trong 100 key VIP (test key: `119117236`)
5. ✅ Validate key thành công
6. ✅ Click "Nạp FW"
7. ✅ Chọn cổng COM (mock hoặc ESP32 thật)
8. ✅ Firmware download từ GitHub Release
9. ✅ Nạp thành công (nếu có thiết bị)

### 7.3. Nếu lỗi "Not Found"

**Nguyên nhân có thể:**
- Repository vẫn đang private → Phải set Public
- Release chưa publish → Kiểm tra lại Releases page
- File binary sai tên → Phải đúng như trong Release
- GitHub API rate limit → Đợi 1 phút và thử lại

**Cách fix:**
```powershell
# Kiểm tra repo có public không
$repo = Invoke-RestMethod "https://api.github.com/repos/nguyenconghuy2904-source/xiaozhi-esp32-kiki-day"
$repo.private  # Phải là False

# Kiểm tra release
$release = Invoke-RestMethod "https://api.github.com/repos/nguyenconghuy2904-source/xiaozhi-esp32-kiki-day/releases/tags/v1.0.0"
$release.assets | Select-Object name, browser_download_url
```

---

## 🎯 Checklist Hoàn Thành

- [ ] Repository public: `xiaozhi-esp32-kiki-day`
- [ ] README.md đầy đủ
- [ ] .gitignore có
- [ ] Release v1.0.0 created
- [ ] Binary file uploaded (.bin)
- [ ] Website test pass
- [ ] Key validation hoạt động
- [ ] Firmware download OK

---

## 📞 Nếu Cần Hỗ Trợ

1. **Check logs**: F12 → Console tab khi test web
2. **Check GitHub API**: Dùng các lệnh PowerShell ở trên
3. **Xác nhận repo public**: Settings → Danger Zone
4. **Test download trực tiếp**: Click vào file .bin trong Release

---

## 🎉 DONE!

Sau khi hoàn thành tất cả bước trên:
- ✅ Repo sẵn sàng
- ✅ Firmware có thể flash qua web
- ✅ 100 VIP keys hoạt động
- ✅ Khách hàng có thể sử dụng ngay

**Next steps:**
- Phát key cho khách hàng VIP
- Track trong CSV: `keys/kiki-day-distribution-xxx.csv`
- Monitor usage logs trong Cloudflare D1

---

**Made with ❤️ by MinizJP**  
**Date**: 2025-10-23
