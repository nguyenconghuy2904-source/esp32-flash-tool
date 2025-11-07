# 🚀 HƯỚNG DẪN DEPLOY LÊN MINIZJPNEW

**Repo mới:** https://github.com/conghuy93/minizjpnew.git  
**Ngày:** 30/10/2025

---

## ⚠️ VẤN ĐỀ

Lỗi 403 khi push vào repo mới:
```
remote: Permission to conghuy93/minizjpnew.git denied to nguyenconghuy2904-source.
fatal: unable to access 'https://github.com/conghuy93/minizjpnew.git/': The requested URL returned error: 403
```

**Nguyên nhân:** Tài khoản `nguyenconghuy2904-source` không có quyền push vào repo `conghuy93`.

---

## ✅ GIẢI PHÁP

### **Cách 1: Dùng GitHub CLI (Đơn giản nhất)**

#### Bước 1: Cài GitHub CLI
```bash
# Windows (dùng winget)
winget install --id GitHub.cli

# Hoặc download từ: https://cli.github.com/
```

#### Bước 2: Đăng nhập với account conghuy93
```bash
gh auth login
# Chọn:
# - GitHub.com
# - HTTPS
# - Login with web browser
# - Đăng nhập với account conghuy93
```

#### Bước 3: Push lên repo mới
```bash
cd F:\minizjp
git push minizjpnew main
```

---

### **Cách 2: Dùng Personal Access Token**

#### Bước 1: Tạo Personal Access Token

1. Đăng nhập GitHub với account **conghuy93**
2. Vào: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Click **"Generate new token (classic)"**
4. Đặt tên: `minizjpnew-deploy`
5. Chọn scopes:
   - ✅ `repo` (full control)
6. Click **"Generate token"**
7. **Copy token** (chỉ hiện 1 lần!)

#### Bước 2: Push với token
```bash
cd F:\minizjp

# Xóa remote cũ
git remote remove minizjpnew

# Thêm remote mới với token
git remote add minizjpnew https://YOUR_TOKEN@github.com/conghuy93/minizjpnew.git

# Push
git push minizjpnew main
```

**Thay `YOUR_TOKEN`** bằng token vừa tạo.

---

### **Cách 3: Dùng SSH Key**

#### Bước 1: Tạo SSH key mới
```bash
ssh-keygen -t ed25519 -C "conghuy93@email.com"
# Lưu vào: C:\Users\YourUser\.ssh\id_ed25519_conghuy93
```

#### Bước 2: Thêm public key vào GitHub

1. Copy public key:
```bash
cat C:\Users\YourUser\.ssh\id_ed25519_conghuy93.pub
```

2. Đăng nhập GitHub với account **conghuy93**
3. Vào: **Settings** → **SSH and GPG keys** → **New SSH key**
4. Paste public key
5. Click **"Add SSH key"**

#### Bước 3: Config SSH
Tạo file `C:\Users\YourUser\.ssh\config`:
```
Host github-conghuy93
  HostName github.com
  User git
  IdentityFile C:\Users\YourUser\.ssh\id_ed25519_conghuy93
```

#### Bước 4: Push với SSH
```bash
cd F:\minizjp

# Xóa remote cũ
git remote remove minizjpnew

# Thêm remote SSH
git remote add minizjpnew git@github-conghuy93:conghuy93/minizjpnew.git

# Push
git push minizjpnew main
```

---

### **Cách 4: Import trực tiếp từ GitHub Web UI (Dễ nhất!)**

#### Bước 1: Vào repo minizjpnew

1. Đăng nhập GitHub với account **conghuy93**
2. Vào: https://github.com/conghuy93/minizjpnew

#### Bước 2: Import repo

1. Click **"Import code"** (nếu có)
2. Hoặc click **"+"** → **"Import repository"**
3. **Old repository's clone URL:**
   ```
   https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git
   ```
4. **New repository:**
   - Owner: `conghuy93`
   - Name: `minizjpnew`
   - Privacy: Public/Private (tùy chọn)
5. Click **"Begin import"**

✅ **Done!** GitHub tự động import toàn bộ code, commits, branches!

---

### **Cách 5: Clone và Push lại (Manual)**

```bash
# Clone repo hiện tại
cd /tmp
git clone https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git minizjpnew-temp
cd minizjpnew-temp

# Xóa remote origin cũ
git remote remove origin

# Thêm remote mới
git remote add origin https://github.com/conghuy93/minizjpnew.git

# Đăng nhập với credentials của conghuy93
git config user.name "conghuy93"
git config user.email "conghuy93@email.com"

# Push (sẽ hỏi username/password hoặc token)
git push -u origin main

# Cleanup
cd ..
rm -rf minizjpnew-temp
```

---

## 🎯 KHUYẾN NGHỊ

### **Cách nhanh nhất:** Dùng **Cách 4 - Import từ GitHub Web UI**

**Lý do:**
- ✅ Không cần setup credentials
- ✅ Không cần CLI/SSH
- ✅ GitHub tự động import tất cả
- ✅ Giữ nguyên commit history
- ✅ Chỉ mất 2 phút

### **Cách tốt nhất cho tương lai:** Dùng **Cách 1 - GitHub CLI**

**Lý do:**
- ✅ Dễ dàng switch giữa các accounts
- ✅ Secure (không cần paste token)
- ✅ Dùng được cho mọi repo sau này

---

## 📋 CHECKLIST SAU KHI IMPORT

### 1. ✅ Kiểm tra code đã lên
```bash
# Xem trên web:
https://github.com/conghuy93/minizjpnew

# Hoặc clone về test:
git clone https://github.com/conghuy93/minizjpnew.git test-minizjpnew
cd test-minizjpnew
npm install
npm run build
```

### 2. ✅ Update remote trong project hiện tại

Nếu muốn dùng repo mới làm origin:
```bash
cd F:\minizjp

# Đổi tên remote cũ
git remote rename origin old-origin

# Đổi tên remote mới thành origin
git remote rename minizjpnew origin

# Hoặc set-url cho origin
git remote set-url origin https://github.com/conghuy93/minizjpnew.git

# Verify
git remote -v
```

### 3. ✅ Setup deployment

#### Nếu dùng Netlify:
1. Vào: https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Chọn **GitHub**
4. Authorize với account **conghuy93**
5. Chọn repo **minizjpnew**
6. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
7. Click **"Deploy site"**

#### Nếu dùng Vercel:
1. Vào: https://vercel.com/
2. Click **"Add New"** → **"Project"**
3. Import từ GitHub
4. Chọn repo **minizjpnew**
5. Framework preset: **Next.js**
6. Click **"Deploy"**

#### Nếu dùng GitHub Pages:
```bash
cd F:\minizjp

# Cài gh-pages (nếu chưa có)
npm install --save-dev gh-pages

# Deploy
npm run deploy:github
```

### 4. ✅ Update documentation

Các file cần update:
- `README.md` - Đổi repo URL
- `package.json` - Đổi repository field
- `DEPLOY.md` - Đổi deploy instructions

Example:
```json
// package.json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/conghuy93/minizjpnew.git"
  },
  "bugs": {
    "url": "https://github.com/conghuy93/minizjpnew/issues"
  },
  "homepage": "https://github.com/conghuy93/minizjpnew#readme"
}
```

### 5. ✅ Update CNAME (nếu có custom domain)

```bash
# public/CNAME
your-domain.com
```

### 6. ✅ Test deployment

1. Push thay đổi nhỏ
2. Xem tự động build & deploy không
3. Mở web xem có hoạt động không

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi hoàn tất:

✅ Code đã ở: https://github.com/conghuy93/minizjpnew  
✅ Web live tại: `https://minizjpnew.netlify.app` (hoặc custom domain)  
✅ Auto deploy khi push code mới  
✅ Tất cả commits được giữ nguyên  
✅ Tất cả files được copy đầy đủ  

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

**Zalo:** 0389827643  
**GitHub Issues:** https://github.com/conghuy93/minizjpnew/issues

**Các lỗi thường gặp:**

1. **403 Forbidden:** Sai credentials, dùng Personal Access Token
2. **SSH key denied:** Chưa add public key vào GitHub
3. **Import failed:** Repo source private hoặc không tồn tại
4. **Build failed:** Missing dependencies, chạy `npm install`

---

**Created:** 30/10/2025  
**Status:** Ready to deploy  
**Version:** v2.2 (Refactored USB Connection)




