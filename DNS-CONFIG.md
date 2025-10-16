# 🌐 Hướng dẫn cấu hình DNS cho minizjp.com

## ❌ Vấn đề hiện tại
Domain `minizjp.com` đang hiển thị parking page của Porkbun thay vì website ESP32 Flash Tool.

## ✅ Giải pháp: Cấu hình DNS Records tại Porkbun

### Bước 1: Đăng nhập Porkbun
1. Truy cập https://porkbun.com
2. Đăng nhập tài khoản
3. Vào **Domain Management** > chọn `minizjp.com`

### Bước 2: Cấu hình DNS Records

Xóa tất cả DNS records hiện có và thêm các records sau:

#### A Records (Required - trỏ về GitHub Pages)
```
Type: A
Host: @
Answer: 185.199.108.153
TTL: 600

Type: A
Host: @
Answer: 185.199.109.153
TTL: 600

Type: A
Host: @
Answer: 185.199.110.153
TTL: 600

Type: A
Host: @
Answer: 185.199.111.153
TTL: 600
```

#### CNAME Record (Optional - cho www subdomain)
```
Type: CNAME
Host: www
Answer: nguyenconghuy2904-source.github.io
TTL: 600
```

### Bước 3: Verify CNAME file
File `CNAME` đã có trong repository với nội dung:
```
minizjp.com
```

### Bước 4: Kích hoạt GitHub Pages với Custom Domain

1. Truy cập GitHub repository: https://github.com/nguyenconghuy2904-source/esp32-flash-tool
2. Vào **Settings** > **Pages**
3. Trong phần **Custom domain**, nhập: `minizjp.com`
4. Click **Save**
5. Chờ GitHub verify (5-10 phút)
6. Sau khi verify thành công, check ✅ **Enforce HTTPS**

### Bước 5: Kiểm tra DNS propagation

Mở terminal/command prompt và chạy:
```bash
# Kiểm tra A records
nslookup minizjp.com

# Kiểm tra CNAME
nslookup www.minizjp.com
```

Kết quả mong đợi:
```
minizjp.com
Address: 185.199.108.153
Address: 185.199.109.153
Address: 185.199.110.153
Address: 185.199.111.153
```

### Bước 6: Test website

Sau 5-30 phút (DNS propagation time):
- Truy cập: https://minizjp.com
- Truy cập: https://www.minizjp.com
- Truy cập: https://nguyenconghuy2904-source.github.io/esp32-flash-tool

Tất cả đều phải hiển thị website ESP32 Flash Tool.

## 🔍 Troubleshooting

### 1. Vẫn thấy Porkbun parking page
- **Nguyên nhân**: DNS chưa propagate hoàn toàn
- **Giải pháp**: Chờ thêm 10-30 phút, xóa browser cache, thử incognito mode

### 2. GitHub Pages báo lỗi "Domain is not properly configured"
- **Nguyên nhân**: A records chưa đúng hoặc CNAME file thiếu
- **Giải pháp**: 
  - Verify lại 4 A records ở trên
  - Đảm bảo file `CNAME` có trong repository
  - Remove và add lại custom domain trong GitHub Settings

### 3. HTTPS không hoạt động
- **Nguyên nhân**: GitHub chưa issue SSL certificate
- **Giải pháp**: Đợi 24h để GitHub tự động issue certificate, hoặc:
  - Remove custom domain
  - Chờ 5 phút
  - Add lại custom domain
  - Check "Enforce HTTPS"

### 4. www.minizjp.com không hoạt động
- **Nguyên nhân**: CNAME record chưa được add
- **Giải pháp**: Add CNAME record như bước 2

## 📊 Kiểm tra DNS online

Sử dụng các công cụ sau để kiểm tra DNS:
- https://dnschecker.org/#A/minizjp.com
- https://www.whatsmydns.net/#A/minizjp.com
- https://mxtoolbox.com/SuperTool.aspx?action=a%3aminizjp.com

## ⏱️ Timeline

- **0-5 phút**: GitHub Actions build và deploy (check tại https://github.com/nguyenconghuy2904-source/esp32-flash-tool/actions)
- **5-30 phút**: DNS propagation
- **30 phút - 24 giờ**: HTTPS certificate issuance

## ✅ Checklist

- [ ] Đã add 4 A records vào Porkbun DNS
- [ ] Đã add CNAME record cho www (optional)
- [ ] Đã add custom domain `minizjp.com` vào GitHub Pages Settings
- [ ] GitHub Actions workflow đã chạy thành công
- [ ] DNS check tool hiển thị đúng IP của GitHub Pages
- [ ] Website accessible tại minizjp.com
- [ ] HTTPS đã được enforce

## 🎉 Kết quả mong đợi

Sau khi hoàn thành:
- ✅ https://minizjp.com → ESP32 Flash Tool
- ✅ https://www.minizjp.com → ESP32 Flash Tool  
- ✅ HTTPS enabled với Let's Encrypt certificate
- ✅ Serial Monitor feature available
- ✅ Auto-deploy on git push

---

**Lưu ý**: Nếu sau 24 giờ vẫn không hoạt động, hãy kiểm tra lại GitHub Pages Settings và DNS records.
