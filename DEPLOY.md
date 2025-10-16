# 🚀 Hướng dẫn Deploy ESP32 Flash Tool lên GitHub Pages

## 📋 Tổng quan

Dự án này sẽ được deploy theo kiến trúc sau:
- **Frontend**: GitHub Pages (miễn phí)
- **API Backend**: Cloudflare Workers (miễn phí 100k request/tháng)
- **Database**: Cloudflare D1 SQLite (miễn phí đến 1 GB)
- **Firmware Storage**: GitHub Releases (miễn phí)

## 🏗️ Bước 1: Chuẩn bị Repository

### 1.1 Tạo GitHub Repository

```bash
# Khởi tạo git repository
git init
git add .
git commit -m "Initial commit: ESP32 Flash Tool"

# Tạo repository trên GitHub và push
git branch -M main
git remote add origin https://github.com/USERNAME/esp32-flash-tool.git
git push -u origin main
```

### 1.2 Cấu hình GitHub Pages

1. Vào **Settings** > **Pages**
2. Chọn **Source**: GitHub Actions
3. Workflow sẽ tự động chạy khi push code

## 🔧 Bước 2: Setup Cloudflare Workers & Database

### 2.1 Cài đặt Wrangler CLI

```bash
npm install -g wrangler
wrangler auth login
```

### 2.2 Tạo D1 Database

```bash
cd cloudflare-workers
wrangler d1 create esp32-flash-keys
```

**Quan trọng**: Copy database ID từ output và cập nhật vào `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "esp32-flash-keys" 
database_id = "YOUR_DATABASE_ID_HERE"
```

### 2.3 Chạy Migration

```bash
# Migration cho local development
wrangler d1 migrations apply esp32-flash-keys --local

# Migration cho production  
wrangler d1 migrations apply esp32-flash-keys --remote
```

### 2.4 Deploy Cloudflare Worker

```bash
cd cloudflare-workers
npm install
wrangler deploy
```

Copy URL của Worker (ví dụ: `https://esp32-flash-api.your-subdomain.workers.dev`)

## 🌐 Bước 3: Cấu hình Environment Variables

### 3.1 GitHub Repository Secrets

Vào **Settings** > **Secrets and variables** > **Actions**, thêm:

- `API_URL`: URL của Cloudflare Worker (từ bước 2.4)

### 3.2 Update Environment Variables

File `.github/workflows/deploy.yml` sẽ tự động sử dụng secret này.

## 📦 Bước 4: Upload Firmware vào GitHub Releases

### 4.1 Tạo Release mới

1. Vào repository > **Releases** > **Create a new release**
2. Đặt tag version (ví dụ: `v1.0.0`)
3. Upload file `.bin` vào **Assets**
4. Publish release

### 4.2 Format mô tả (tùy chọn)

```markdown
## ESP32-S3 Firmware v1.0.0

### Tính năng
- WiFi connectivity
- Bluetooth support  
- GPIO control

### Compatibility
ESP32-S3, ESP32-S3-WROOM-1
```

## 🚀 Bước 5: Deploy và Test

### 5.1 Automatic Deployment

Mỗi lần push vào branch `main`, GitHub Actions sẽ tự động:
1. Build Next.js app
2. Export static files
3. Deploy lên GitHub Pages

### 5.2 Manual Deployment

```bash
# Build và export
npm run build

# Or sử dụng script tùy chỉnh  
npm run export
```

## 🔍 Bước 6: Testing

### 6.1 Kiểm tra các URL

- **Frontend**: `https://username.github.io/esp32-flash-tool`
- **API**: `https://esp32-flash-api.your-subdomain.workers.dev`

### 6.2 Test chức năng

1. **Key validation**: Thử với key mẫu từ database
2. **Firmware loading**: Check firmware hiển thị từ Releases
3. **Device connection**: Test WebSerial API
4. **Flashing process**: Test với firmware thật

## 🛠️ Troubleshooting

### Frontend không load

- Check GitHub Pages settings
- Xem GitHub Actions logs
- Verify `next.config.js` output settings

### API không hoạt động

```bash
# Check Worker logs
wrangler tail esp32-flash-api

# Test API endpoint
curl https://your-worker.workers.dev/auth?key=TEST
```

### Database lỗi

```bash
# Check database
wrangler d1 execute esp32-flash-keys --command="SELECT * FROM auth_keys LIMIT 5"

# Re-run migrations
wrangler d1 migrations apply esp32-flash-keys --remote
```

### Firmware không hiển thị

- Ensure file `.bin` uploaded to Releases  
- Check repository name trong environment
- Verify GitHub API rate limits

## 📊 Monitoring & Analytics

### API Usage

```bash
# View Worker analytics
wrangler analytics esp32-flash-api
```

### Database Queries

```bash
# Check key usage
wrangler d1 execute esp32-flash-keys --command="
SELECT 
  COUNT(*) as total_keys,
  SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_keys 
FROM auth_keys"
```

## 🔒 Security Best Practices

1. **API Keys**: Rotate Cloudflare API tokens regularly
2. **Database**: Monitor for unusual query patterns  
3. **CORS**: Review allowed origins in Worker
4. **Rate Limiting**: Implement if high traffic expected

## 🆙 Updates & Maintenance

### Update Frontend

```bash
git add .
git commit -m "Update: [description]"
git push origin main
# GitHub Actions auto-deploys
```

### Update API Worker

```bash
cd cloudflare-workers
# Make changes to src/index.ts
wrangler deploy
```

### Add New Keys

```bash
wrangler d1 execute esp32-flash-keys --command="
INSERT INTO auth_keys (key_hash, description) 
VALUES ('NEW32CHARHEXKEY', 'Description')"
```

---

## 🎉 Hoàn thành!

Sau khi follow các bước trên, bạn sẽ có:

✅ **Frontend** chạy trên GitHub Pages miễn phí  
✅ **API** chạy trên Cloudflare Workers miễn phí  
✅ **Database** lưu keys trên Cloudflare D1 miễn phí  
✅ **Firmware** quản lý qua GitHub Releases miễn phí  
✅ **CI/CD** tự động qua GitHub Actions  

**URL Frontend**: `https://yourusername.github.io/repository-name`  
**URL API**: `https://your-worker.workers.dev`

🔗 **Test và chia sẻ với users!**