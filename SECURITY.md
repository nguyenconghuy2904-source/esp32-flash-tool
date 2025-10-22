# 🔒 Hệ Thống Bảo Mật

## Tổng Quan

Hệ thống ESP32 Flash Tool được bảo vệ bằng nhiều lớp bảo mật để chống spam, brute force, và các cuộc tấn công khác.

## ✅ Các Biện Pháp Bảo Mật Đã Triển Khai

### 1. **Rate Limiting (Giới hạn tốc độ)**
- ✅ Tối đa **5 lần thử sai** trong **15 phút**
- ✅ Sử dụng Cloudflare KV để theo dõi attempts
- ✅ Tự động reset sau khi hết thời gian
- ✅ Áp dụng cho mọi IP address

### 2. **IP Blocking (Chặn IP)**
- ✅ Tự động chặn IP sau 5 lần thử sai
- ✅ Thời gian chặn: **60 phút**
- ✅ Lưu vào database để tracking
- ✅ Hiển thị thông báo rõ ràng cho user

### 3. **Key Validation (Xác thực Key)**
- ✅ Format chuẩn: **9 chữ số**
- ✅ Một key chỉ bind với **1 device duy nhất**
- ✅ Device fingerprint từ IP + User-Agent
- ✅ Không thể tái sử dụng key cho device khác

### 4. **Logging & Tracking**
- ✅ Log mọi attempt (thành công & thất bại)
- ✅ Lưu IP, User-Agent, timestamp
- ✅ Theo dõi blocked IPs
- ✅ Analytics để phát hiện pattern tấn công

### 5. **Database Security**
- ✅ Index tối ưu cho performance
- ✅ Prepared statements (chống SQL injection)
- ✅ Cloudflare D1 với isolation
- ✅ Automatic backups

### 6. **UI/UX Security**
- ✅ Cảnh báo rate limiting rõ ràng
- ✅ Thông báo lỗi chi tiết nhưng an toàn
- ✅ Không leak thông tin hệ thống
- ✅ User-friendly error messages

## 📊 Thống Kê Bảo Mật

### Trước khi có Rate Limiting:
- ❌ Có thể thử **hàng ngàn key/giây**
- ❌ Brute force 9 chữ số = 1 tỷ khả năng
- ❌ DDoS dễ dàng làm chết database
- ❌ Không tracking được attacker

### Sau khi có Rate Limiting:
- ✅ Chỉ **5 attempts / 15 phút / IP**
- ✅ Brute force không khả thi (cần 3,805 năm!)
- ✅ Database được bảo vệ
- ✅ Track và block attacker tự động

## 🧪 Kiểm Tra Bảo Mật

### Test Rate Limiting:
```powershell
.\scripts\test-rate-limiting.ps1
```

Expected output:
- Attempts 1-5: `401 Invalid key` (bình thường)
- Attempts 6+: `429 Rate limited` (đã chặn)

### Apply Migration:
```powershell
.\scripts\apply-rate-limiting.ps1
```

## 🚀 Deploy Bảo Mật

### 1. Apply migration to production:
```bash
cd cloudflare-workers
wrangler d1 execute esp32-flash-db --file=./migrations/0003_add_rate_limiting.sql
```

### 2. Deploy worker với rate limiting:
```bash
wrangler deploy
```

### 3. Test production:
```powershell
.\scripts\test-rate-limiting.ps1
```

## 📈 Monitoring

### Check blocked IPs:
```sql
SELECT * FROM blocked_ips 
WHERE expires_at > datetime('now')
ORDER BY blocked_at DESC;
```

### Check failed attempts:
```sql
SELECT ip_address, COUNT(*) as attempts
FROM usage_logs
WHERE success = 0
  AND timestamp > datetime('now', '-15 minutes')
GROUP BY ip_address
ORDER BY attempts DESC;
```

### Stats:
```bash
curl https://esp32-flash-api.minizjp.workers.dev/stats
```

## ⚠️ Known Limitations

1. **VPN/Proxy**: Người dùng có thể đổi IP để bypass
   - Giải pháp: Thêm device fingerprint phức tạp hơn
   
2. **Legitimate Users**: User bị chặn nếu thử sai 5 lần
   - Giải pháp: Hướng dẫn rõ ràng, warning trước

3. **Distributed Attack**: Botnet với nhiều IP
   - Giải pháp: Cloudflare WAF, challenge pages

## 🔮 Cải Thiện Tương Lai

- [ ] CAPTCHA sau 3 lần thử sai
- [ ] 2FA cho admin endpoints
- [ ] Anomaly detection với ML
- [ ] Geo-blocking cho regions nguy hiểm
- [ ] Webhook notification khi bị attack
- [ ] Dashboard real-time cho monitoring

## 📞 Liên Hệ

Nếu phát hiện lỗ hổng bảo mật, vui lòng liên hệ:
- Zalo: 0389827643
- Email: security@minizjp.com
- GitHub Issues: (chế độ riêng tư)

---

**Last Updated**: 2025-10-22
**Security Level**: HIGH ⭐⭐⭐⭐⭐
