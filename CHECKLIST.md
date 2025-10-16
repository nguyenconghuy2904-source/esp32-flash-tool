# ✅ Checklist Deploy ESP32 Flash Tool - minizjp.com

## 📋 Pre-deployment Checklist

### 1. Tài khoản & Domain
- [ ] ✅ GitHub account đã tạo
- [ ] ✅ Cloudflare account đã tạo  
- [ ] ✅ Domain minizjp.com đã có trên Porkbun
- [ ] ✅ Nameservers đã chuyển về Cloudflare
- [ ] ✅ Domain status "Active" trên Cloudflare

### 2. Repository Setup
- [ ] ✅ GitHub repository đã tạo: `esp32-flash-tool`
- [ ] ✅ Repository là Public
- [ ] ✅ Code đã push lên GitHub
- [ ] ✅ File CNAME có nội dung `minizjp.com`

### 3. Cloudflare Workers
- [ ] ✅ Wrangler CLI đã cài đặt: `npm install -g wrangler`  
- [ ] ✅ Wrangler đã login: `wrangler auth login`
- [ ] ✅ D1 database đã tạo: `wrangler d1 create esp32-flash-keys`
- [ ] ✅ Database ID đã cập nhật vào `wrangler.toml`
- [ ] ✅ Migration đã chạy: `wrangler d1 migrations apply esp32-flash-keys --remote`
- [ ] ✅ Worker đã deploy: `wrangler deploy`

### 4. DNS Configuration
- [ ] ✅ GitHub Pages A records đã thêm (4 records)
- [ ] ✅ CNAME record cho www đã thêm
- [ ] ✅ CNAME record cho api đã thêm → Worker URL
- [ ] ✅ Custom domain cho Worker: `api.minizjp.com`

### 5. GitHub Configuration
- [ ] ✅ GitHub Pages enabled với GitHub Actions
- [ ] ✅ Custom domain `minizjp.com` đã set
- [ ] ✅ Enforce HTTPS enabled
- [ ] ✅ Repository secret `API_URL` = `https://api.minizjp.com`

---

## 🚀 Deployment Steps

### Step 1: Final Code Push
```bash
git add .
git commit -m "Ready for production: minizjp.com"
git push origin main
```

### Step 2: Watch GitHub Actions
- GitHub repo → Actions → "Deploy to GitHub Pages"
- Wait for ✅ success

### Step 3: Add Sample Keys
```bash
cd cloudflare-workers
wrangler d1 execute esp32-flash-keys --command="
INSERT INTO auth_keys (key_hash, description) VALUES 
('A1B2C3D4E5F6789012345678901234AB', 'Demo Key 1'),
('B2C3D4E5F6789012345678901234ABCD', 'Demo Key 2'),
('C3D4E5F6789012345678901234ABCDEF', 'Demo Key 3')
"
```

### Step 4: Create Sample Release
1. GitHub repo → Releases → "Create a new release"
2. Tag: `v1.0.0`  
3. Title: `ESP32-S3 Test Firmware v1.0.0`
4. Upload a `.bin` file (even dummy file for testing)
5. Publish release

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] ✅ https://minizjp.com loads successfully
- [ ] ✅ UI is responsive on mobile/desktop  
- [ ] ✅ No console errors in browser
- [ ] ✅ Key input accepts 32-char hex
- [ ] ✅ Firmware selector shows GitHub releases

### API Tests
- [ ] ✅ https://api.minizjp.com/stats returns JSON
- [ ] ✅ Key validation works: `/auth` POST
- [ ] ✅ Key status check works: `/auth?key=xxx` GET
- [ ] ✅ CORS headers allow minizjp.com

### Integration Tests  
- [ ] ✅ Key `A1B2C3D4E5F6789012345678901234AB` validates
- [ ] ✅ Firmware list loads from GitHub Releases
- [ ] ✅ WebSerial API connection works (with real ESP32-S3)

### Database Tests
```bash
# Test database connection
wrangler d1 execute esp32-flash-keys --command="SELECT COUNT(*) as total FROM auth_keys"

# Test key lookup
wrangler d1 execute esp32-flash-keys --command="SELECT * FROM auth_keys WHERE key_hash='A1B2C3D4E5F6789012345678901234AB'"
```

---

## 📊 Post-Deploy Monitoring

### URLs to Monitor
- **Main Site**: https://minizjp.com
- **API Health**: https://api.minizjp.com/stats
- **SSL Check**: https://www.ssllabs.com/ssltest/analyze.html?d=minizjp.com

### Daily Checks
- [ ] Website loads < 3 seconds
- [ ] API responds < 1 second  
- [ ] No 5xx errors in Cloudflare Analytics
- [ ] GitHub Actions passing
- [ ] SSL certificate valid

### Weekly Tasks
- [ ] Check GitHub Releases download stats
- [ ] Review Cloudflare Workers analytics
- [ ] Monitor database usage
- [ ] Check for dependency updates

---

## 🆘 Emergency Contacts & Recovery

### Rollback Plan
```bash
# Rollback GitHub Pages
git revert HEAD
git push origin main

# Rollback Worker
wrangler rollback esp32-flash-api

# Check previous versions
wrangler deployments list esp32-flash-api
```

### Key Recovery
```bash
# Backup all keys  
wrangler d1 execute esp32-flash-keys --command="SELECT * FROM auth_keys" --json > keys-backup.json

# Restore from backup (if needed)
# Import from keys-backup.json
```

### Domain Issues
- **DNS Propagation**: Use https://dnschecker.org
- **Cloudflare Status**: Check https://cloudflarestatus.com  
- **GitHub Status**: Check https://githubstatus.com

---

## 🎯 SUCCESS METRICS

### Launch Day Targets
- [ ] ✅ Website loads in all major browsers
- [ ] ✅ Mobile-friendly (Google PageSpeed > 90)
- [ ] ✅ API response time < 500ms
- [ ] ✅ 0 critical errors in first 24h

### Week 1 Targets  
- [ ] Firmware download > 10 times
- [ ] Key validation > 50 requests
- [ ] Uptime > 99.9%
- [ ] User feedback collected

---

## 📚 Resources & Documentation

### Quick Links
- **Frontend**: https://minizjp.com
- **API Docs**: https://api.minizjp.com (API endpoint list)
- **Source Code**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool
- **Firmware Releases**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases

### Support Docs
- [GUIDE-BEGINNER.md](./GUIDE-BEGINNER.md) - Complete setup guide
- [DEPLOY.md](./DEPLOY.md) - Technical deployment details  
- [README.md](./README.md) - User documentation

### External Resources
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- GitHub Pages: https://pages.github.com/
- ESP32-S3 Documentation: https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/
- WebSerial API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API

---

**🚀 Ready to launch minizjp.com!**