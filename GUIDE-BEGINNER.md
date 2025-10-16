# 🚀 Hướng dẫn Deploy ESP32 Flash Tool cho người mới
## Với domain minizjp.com từ Porkbun

### 📋 Tổng quan
Chúng ta sẽ tạo một trang web hoàn chỉnh để nạp firmware ESP32-S3 với:
- **Trang web**: `https://minizjp.com` (miễn phí với GitHub Pages)
- **API**: `https://api.minizjp.com` (miễn phí với Cloudflare Workers)
- **Database**: Cloudflare D1 (miễn phí 1GB)
- **Firmware**: GitHub Releases (miễn phí)

---

## 🎯 BƯỚC 1: Tạo tài khoản cần thiết

### 1.1 GitHub Account
1. Truy cập https://github.com
2. Đăng ký tài khoản mới (nếu chưa có)
3. Verify email

### 1.2 Cloudflare Account  
1. Truy cập https://cloudflare.com
2. Đăng ký tài khoản miễn phí
3. Verify email

---

## 🌐 BƯỚC 2: Cấu hình Domain minizjp.com

### 2.1 Thêm Domain vào Cloudflare
1. **Login Cloudflare** → Click **"Add a Site"**
2. **Nhập domain**: `minizjp.com` → **Continue**
3. **Chọn plan**: **Free** → **Continue**
4. **Cloudflare sẽ scan DNS records** → **Continue**

### 2.2 Thay đổi Nameservers tại Porkbun
1. **Login Porkbun** → Vào **Domain Management**
2. **Click minizjp.com** → **DNS Management**
3. **Thay đổi Nameservers** thành nameservers Cloudflare:
   ```
   elena.ns.cloudflare.com
   walt.ns.cloudflare.com
   ```
   (Cloudflare sẽ cung cấp nameservers cụ thể cho bạn)

4. **Save changes** → **Đợi 1-24 giờ** để propagate

### 2.3 Verify trên Cloudflare
- Quay lại Cloudflare → **Recheck Nameservers**
- Khi thấy ✅ **Active** là xong

---

## 📂 BƯỚC 3: Tạo GitHub Repository

### 3.1 Tạo Repository mới
1. **Login GitHub** → Click **"New repository"**
2. **Repository name**: `esp32-flash-tool`
3. **Description**: `ESP32-S3 Web Flash Tool with Key Authentication`
4. ✅ **Public** 
5. ✅ **Add README file**
6. **Create repository**

### 3.2 Clone code về máy tính
Mở **Command Prompt** hoặc **PowerShell**:

```bash
# Clone repository về máy
git clone https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git
cd esp32-flash-tool

# Copy code từ dự án hiện tại
# (Copy tất cả files từ F:\minizjp vào thư mục này, trừ .git)
```

### 3.3 Push code lên GitHub
```bash
# Thêm tất cả files
git add .

# Commit với message
git commit -m "Initial: ESP32-S3 Flash Tool"

# Push lên GitHub
git push origin main
```

---

## ⚡ BƯỚC 4: Setup Cloudflare Workers (API Backend)

### 4.1 Cài đặt Wrangler CLI
Mở **PowerShell as Administrator**:

```powershell
# Cài Node.js (nếu chưa có)
# Tải từ https://nodejs.org và cài đặt

# Cài Wrangler globally
npm install -g wrangler

# Login Cloudflare
wrangler auth login
```

### 4.2 Tạo D1 Database
```bash
# Vào thư mục cloudflare-workers
cd cloudflare-workers

# Tạo database
wrangler d1 create esp32-flash-keys
```

**📝 LƯU Ý**: Sao chép **Database ID** từ output, ví dụ:
```
database_id = "abcd1234-5678-90ef-ghij-klmnopqrstuv"
```

### 4.3 Cập nhật cấu hình
Mở file `cloudflare-workers/wrangler.toml` và cập nhật:

```toml
name = "esp32-flash-api"
main = "src/index.ts"
compatibility_date = "2024-10-16"

# Thay YOUR_DATABASE_ID bằng ID thật
[[d1_databases]]
binding = "DB"
database_name = "esp32-flash-keys"
database_id = "YOUR_DATABASE_ID_FROM_STEP_4.2"

[env.production]
name = "esp32-flash-api"

[env.production.vars]
ENVIRONMENT = "production"
```

### 4.4 Chạy Migration tạo bảng
```bash
# Migration local để test
wrangler d1 migrations apply esp32-flash-keys --local

# Migration production
wrangler d1 migrations apply esp32-flash-keys --remote
```

### 4.5 Deploy Worker
```bash
# Cài dependencies
npm install

# Deploy lên Cloudflare
wrangler deploy
```

**📝 GHI CHÚ**: Lưu lại **Worker URL**, ví dụ:
```
https://esp32-flash-api.YOUR_SUBDOMAIN.workers.dev
```

---

## 🌐 BƯỚC 5: Cấu hình Custom Domain cho API

### 5.1 Thêm subdomain cho API
1. **Login Cloudflare** → **Chọn minizjp.com**
2. **DNS** → **Add record**:
   - **Type**: CNAME
   - **Name**: api  
   - **Target**: esp32-flash-api.YOUR_SUBDOMAIN.workers.dev
   - **Proxy status**: ✅ Proxied
3. **Save**

### 5.2 Setup Custom Domain trong Worker
1. **Cloudflare Dashboard** → **Workers & Pages**
2. **Chọn esp32-flash-api** → **Settings** → **Triggers**
3. **Add Custom Domain** → Nhập: `api.minizjp.com`
4. **Add Domain**

✅ **Giờ API sẽ có địa chỉ**: `https://api.minizjp.com`

---

## 🏠 BƯỚC 6: Cấu hình GitHub Pages

### 6.1 Setup GitHub Pages
1. **GitHub repository** → **Settings** → **Pages**
2. **Source**: **GitHub Actions**
3. **Save**

### 6.2 Cấu hình Custom Domain
1. **Pages settings** → **Custom domain**
2. **Nhập**: `minizjp.com`
3. ✅ **Enforce HTTPS**
4. **Save**

### 6.3 Update DNS trên Cloudflare
**Cloudflare DNS** → **Add records**:

1. **Record 1**:
   - **Type**: A
   - **Name**: @
   - **IPv4**: 185.199.108.153
   - **Proxy**: 🟡 DNS only

2. **Record 2**:
   - **Type**: A  
   - **Name**: @
   - **IPv4**: 185.199.109.153
   - **Proxy**: 🟡 DNS only

3. **Record 3**:
   - **Type**: A
   - **Name**: @  
   - **IPv4**: 185.199.110.153
   - **Proxy**: 🟡 DNS only

4. **Record 4**:
   - **Type**: A
   - **Name**: @
   - **IPv4**: 185.199.111.153  
   - **Proxy**: 🟡 DNS only

5. **Record 5**:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: nguyenconghuy2904-source.github.io
   - **Proxy**: 🟡 DNS only

---

## 🔧 BƯỚC 7: Cấu hình Environment Variables

### 7.1 GitHub Repository Secrets
1. **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   - **Name**: `API_URL`
   - **Value**: `https://api.minizjp.com`
3. **Add secret**

### 7.2 Update Next.js Config
Cập nhật file `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for static export (GitHub Pages)
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.minizjp.com'
  },
  // Custom domain
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : ''
}

module.exports = nextConfig
```

---

## 🚀 BƯỚC 8: Deploy và Test

### 8.1 Push để trigger deployment
```bash
# Commit changes
git add .
git commit -m "Configure for minizjp.com domain"
git push origin main
```

### 8.2 Theo dõi GitHub Actions
1. **GitHub repo** → **Actions**
2. **Xem workflow "Deploy to GitHub Pages"**
3. **Đợi cho đến khi ✅ thành công**

### 8.3 Test các URL
- **Frontend**: https://minizjp.com
- **API**: https://api.minizjp.com/stats
- **API Test**: https://api.minizjp.com/auth?key=A1B2C3D4E5F6789012345678901234AB

---

## 📦 BƯỚC 9: Upload Firmware mẫu

### 9.1 Tạo file firmware test
Tạo file `test-firmware-v1.0.bin` (có thể là file dummy để test):

```bash
# Tạo file test 1MB
fsutil file createnew test-firmware-v1.0.bin 1048576
```

### 9.2 Tạo GitHub Release
1. **GitHub repo** → **Releases** → **Create a new release**
2. **Tag version**: `v1.0.0`
3. **Release title**: `ESP32-S3 Firmware v1.0.0`
4. **Description**:
   ```markdown
   ## ESP32-S3 Test Firmware v1.0.0
   
   ### Features
   - Basic WiFi connectivity
   - GPIO control
   - Serial communication
   
   ### Compatibility  
   ESP32-S3, ESP32-S3-WROOM-1
   
   ### Installation
   Upload this firmware using the web tool at minizjp.com
   ```
5. **Attach files**: Upload `test-firmware-v1.0.bin`
6. **Publish release**

---

## 🔑 BƯỚC 10: Thêm Authentication Keys

### 10.1 Thêm keys vào database
```bash
# Mở PowerShell trong thư mục cloudflare-workers
cd cloudflare-workers

# Thêm keys mẫu
wrangler d1 execute esp32-flash-keys --command="
INSERT INTO auth_keys (key_hash, description) VALUES 
('A1B2C3D4E5F6789012345678901234AB', 'Test key 1 - Demo'),
('B2C3D4E5F6789012345678901234ABCD', 'Test key 2 - Demo'),  
('C3D4E5F6789012345678901234ABCDEF', 'Test key 3 - Demo'),
('12345678901234567890123456789ABC', 'Production key 1'),
('98765432109876543210987654321FED', 'Production key 2')
"
```

### 10.2 Verify keys
```bash
# Kiểm tra keys đã thêm
wrangler d1 execute esp32-flash-keys --command="SELECT * FROM auth_keys"
```

---

## ✅ BƯỚC 11: Test toàn bộ hệ thống

### 11.1 Test Frontend
1. **Mở**: https://minizjp.com
2. **Kiểm tra**: 
   - ✅ Trang web load
   - ✅ UI responsive 
   - ✅ Không có lỗi console

### 11.2 Test API
1. **Test API health**: https://api.minizjp.com/stats
2. **Expected response**:
   ```json
   {
     "success": true,
     "stats": {
       "total_keys": 5,
       "used_keys": 0,
       "unique_devices": 0
     }
   }
   ```

### 11.3 Test Key Authentication
1. **Nhập key**: `A1B2C3D4E5F6789012345678901234AB`
2. **Click**: "Xác thực"  
3. **Expected**: ✅ "Key hợp lệ!"

### 11.4 Test Firmware Loading
1. **Tab**: "GitHub Releases"
2. **Expected**: Hiển thị `test-firmware-v1.0.bin`
3. **Click firmware** → **Expected**: "Đã chọn firmware..."

### 11.5 Test WebSerial (cần ESP32-S3 thật)
1. **Cắm ESP32-S3** vào USB
2. **Click**: "Kết nối ESP32-S3"
3. **Chọn COM port** 
4. **Expected**: "Đã kết nối thành công"

---

## 🎉 HOÀN THÀNH!

### 🌟 Những gì bạn đã có:

✅ **Website**: https://minizjp.com - Trang web chính  
✅ **API**: https://api.minizjp.com - Backend xử lý keys  
✅ **Database**: Cloudflare D1 - Lưu trữ keys  
✅ **Firmware**: GitHub Releases - Quản lý firmware  
✅ **Custom Domain**: Domain riêng từ Porkbun  
✅ **SSL Certificate**: Tự động từ Cloudflare  
✅ **Auto Deploy**: GitHub Actions CI/CD  

### 📱 Hướng dẫn sử dụng cho End Users:

1. **Truy cập**: https://minizjp.com
2. **Nhập key** được cung cấp → **Xác thực**
3. **Kết nối ESP32-S3** qua USB
4. **Chọn firmware** từ danh sách hoặc upload file
5. **Bắt đầu nạp** và theo dõi tiến độ

---

## 🛠️ MAINTENANCE

### Thêm keys mới:
```bash
wrangler d1 execute esp32-flash-keys --command="
INSERT INTO auth_keys (key_hash, description) 
VALUES ('YOUR32CHARHEXKEY', 'Description here')
"
```

### Upload firmware mới:
1. **GitHub repo** → **Releases** → **New release**
2. **Upload .bin file** → **Publish**
3. **Tự động hiển thị** trên website

### Update code:
```bash
git add .
git commit -m "Update: description"  
git push origin main
# → Auto deploy via GitHub Actions
```

### Monitor usage:
- **Cloudflare Analytics**: Worker requests, errors
- **GitHub Insights**: Release download stats
- **Database queries**: Key usage statistics

---

## 🆘 TROUBLESHOOTING

### Website không load
- Check GitHub Actions status
- Verify DNS records trên Cloudflare
- Check custom domain settings

### API không hoạt động  
- Test trực tiếp Worker URL
- Check Wrangler logs: `wrangler tail esp32-flash-api`
- Verify database connection

### Keys không validate
- Check database: `wrangler d1 execute esp32-flash-keys --command="SELECT * FROM auth_keys LIMIT 5"`
- Verify API URL trong GitHub secrets
- Check CORS headers

### Firmware không load
- Verify GitHub API rate limits
- Check repository public/private status
- Ensure .bin files trong Releases

**🎯 Success!** Bạn đã có một hệ thống hoàn chỉnh để nạp firmware ESP32-S3 qua web với domain riêng!
