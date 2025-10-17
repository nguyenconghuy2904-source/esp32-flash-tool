# 🚀 Upload Firmware Quick Guide

## 📦 Bước 1: Chuẩn bị firmware

**Đặt tên file đúng format:**
```
esp32-s3-robot-otto.bin
esp32-s3-zero-dogmaster.bin
esp32-c3-super-mini-smart-switch-pc.bin
```

**Copy vào thư mục:** `firmware/`

---

## 🎯 Bước 2: Upload lên minizjp.com

### ⚡ Cách 1: Dùng Script (Khuyến nghị)

```powershell
# Cài GitHub CLI (lần đầu)
winget install --id GitHub.cli

# Login GitHub
gh auth login

# Upload firmware
.\scripts\upload-firmware.ps1 -Version "v1.0.0"
```

### 📝 Cách 2: Manual Upload

1. **Vào:** https://github.com/nguyenconghuy2904-source/esp32-flash-tool/releases
2. **Click:** "Draft a new release"
3. **Điền thông tin:**
   - Tag: `v1.0.0`
   - Title: `MinizFlash Firmware v1.0.0`
4. **Upload:** File .bin từ thư mục `firmware/`
5. **Publish:** Click "Publish release"

---

## ✅ Bước 3: Kiểm tra

1. Truy cập: **https://minizjp.com**
2. Chọn chip và firmware
3. Xem version mới
4. Test download và flash

---

## � Repository Information
- **GitHub Repository**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool
- **Owner**: nguyenconghuy2904-source
- **Status**: ✅ Code đã được push thành công

## 🚀 Next Steps

### 1. Enable GitHub Pages
1. **Truy cập**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/settings/pages
2. **Source**: Chọn **GitHub Actions**
3. **Save**
4. **Custom domain**: Nhập `minizjp.com` (nếu đã cấu hình DNS)

### 2. Check GitHub Actions
1. **Truy cập**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/actions
2. **Xem workflow**: "Deploy to GitHub Pages"
3. **Đợi**: ✅ Build thành công

### 3. Setup Repository Secrets
1. **Truy cập**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/settings/secrets/actions
2. **New repository secret**:
   - **Name**: `API_URL`
   - **Value**: `https://api.minizjp.com` (sau khi setup Cloudflare Workers)

## 📂 Project Structure Overview

```
esp32-flash-tool/
├── 📁 .github/
│   ├── copilot-instructions.md     # GitHub Copilot configuration
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment
├── 📁 cloudflare-workers/          # API Backend
│   ├── src/index.ts               # Worker main code
│   ├── wrangler.toml              # Cloudflare config
│   ├── package.json               # Worker dependencies
│   └── migrations/                # Database schema
├── 📁 src/
│   ├── app/                       # Next.js App Router
│   ├── components/                # React components
│   ├── lib/                       # Utility libraries
│   └── types/                     # TypeScript definitions
├── 📁 scripts/                    # Deployment & key generation
├── 📁 public/
│   ├── CNAME                      # GitHub Pages domain
│   └── .nojekyll                  # GitHub Pages config
├── 📄 GUIDE-BEGINNER.md           # Complete setup guide
├── 📄 DEPLOY.md                   # Technical deployment
├── 📄 CHECKLIST.md                # Deployment checklist
├── 📄 README.md                   # Main documentation
├── ⚙️ next.config.js              # Next.js configuration
├── ⚙️ package.json                # Project dependencies
└── ⚙️ tailwind.config.js          # Tailwind CSS config
```

## 🔧 Immediate Actions Required

### A. Setup Cloudflare Workers (API Backend)
```bash
# 1. Cài Wrangler CLI
npm install -g wrangler

# 2. Login Cloudflare
wrangler auth login

# 3. Tạo D1 Database
cd cloudflare-workers
wrangler d1 create esp32-flash-keys

# 4. Update database ID trong wrangler.toml
# 5. Run migration
wrangler d1 migrations apply esp32-flash-keys --remote

# 6. Deploy Worker
wrangler deploy
```

### B. Configure DNS (minizjp.com)
1. **Cloudflare DNS Records**:
   - `A @ 185.199.108.153` (GitHub Pages)
   - `A @ 185.199.109.153` (GitHub Pages)
   - `A @ 185.199.110.153` (GitHub Pages)
   - `A @ 185.199.111.153` (GitHub Pages)
   - `CNAME www nguyenconghuy2904-source.github.io`
   - `CNAME api your-worker.workers.dev`

### C. Test URLs (After Setup)
- **Frontend**: https://minizjp.com
- **API**: https://api.minizjp.com/stats
- **Repository**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool

## 📚 Documentation Links

1. **[GUIDE-BEGINNER.md](https://github.com/nguyenconghuy2904-source/esp32-flash-tool/blob/main/GUIDE-BEGINNER.md)**
   - Complete step-by-step setup
   - Domain configuration
   - Cloudflare Workers setup

2. **[DEPLOY.md](https://github.com/nguyenconghuy2904-source/esp32-flash-tool/blob/main/DEPLOY.md)**
   - Technical deployment details
   - Advanced configuration

3. **[CHECKLIST.md](https://github.com/nguyenconghuy2904-source/esp32-flash-tool/blob/main/CHECKLIST.md)**
   - Pre-deployment checklist
   - Testing procedures
   - Monitoring guidelines

## 🎯 Success Metrics

### ✅ Completed
- [x] Code uploaded to GitHub
- [x] Repository structure created
- [x] GitHub Actions workflow configured
- [x] Documentation complete
- [x] TypeScript build successful

### ⏳ Next Steps
- [ ] GitHub Pages enabled
- [ ] Cloudflare Workers deployed
- [ ] DNS configured for minizjp.com
- [ ] API endpoints working
- [ ] End-to-end testing

## 🆘 Need Help?

### GitHub Repository
- **Issues**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/issues
- **Discussions**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/discussions

### Quick Commands
```bash
# Clone repository
git clone https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

**🚀 Repository URL**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool

**Next**: Follow the [GUIDE-BEGINNER.md](https://github.com/nguyenconghuy2904-source/esp32-flash-tool/blob/main/GUIDE-BEGINNER.md) để hoàn thành deployment!