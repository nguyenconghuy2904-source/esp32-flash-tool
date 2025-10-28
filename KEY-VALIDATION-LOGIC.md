# 🔑 Key Validation Logic - Firmware Kiki Đây

## 📋 Yêu Cầu

**1 key chỉ dùng được trên 1 thiết bị, nhưng có thể nạp lại nhiều lần trên thiết bị đó**

---

## ✅ Logic Hoạt Động

### Frontend (src/lib/api-client.ts)

#### Device Fingerprinting với localStorage
```typescript
export function generateDeviceFingerprint(): string {
  const STORAGE_KEY = 'esp32_device_id'
  
  // 1. Check localStorage first (stable across sessions)
  const existingDeviceId = localStorage.getItem(STORAGE_KEY)
  if (existingDeviceId) {
    return existingDeviceId  // ✅ Stable device ID
  }
  
  // 2. Generate new fingerprint only on first use
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    Math.random().toString(36)  // Uniqueness
  ].join('|')
  
  const deviceId = hash(fingerprint)
  
  // 3. Save to localStorage for persistence
  localStorage.setItem(STORAGE_KEY, deviceId)
  
  return deviceId
}
```

**Ưu điểm:**
- ✅ Device ID **stable** across browser restarts
- ✅ Device ID **unique** per browser
- ✅ Không thay đổi khi browser/GPU update

---

### Backend (cloudflare-workers/src/index.ts)

#### Key Validation Logic
```typescript
// 1. Check if key exists
const keyRecord = await DB.query('SELECT * FROM auth_keys WHERE key_hash = ?', [key])

if (!keyRecord) {
  return error('Key không tồn tại')
}

// 2. CRITICAL CHECK: Key already used with DIFFERENT device?
if (keyRecord.is_used && keyRecord.device_id !== deviceId) {
  return error('Key đã được sử dụng với thiết bị khác')
  // ❌ Reject - cannot use on different device
}

// 3. Key is either:
//    a) Not used yet → OK, bind to this device
//    b) Used on SAME device → OK, allow reuse
// ✅ Allow and update

await DB.query(
  'UPDATE auth_keys SET is_used = 1, device_id = ?, used_at = NOW() WHERE key_hash = ?',
  [deviceId, key]
)

return success('Key hợp lệ')
```

---

## 🎯 Use Cases

### Case 1: First Time Use (Lần đầu sử dụng)
```
User A on Device A:
1. Nhập key: 123456789
2. Device ID: device-abc123 (generated & saved to localStorage)
3. Backend check: key chưa dùng → Bind key to device-abc123
4. ✅ Success → Flash firmware

Database:
- key_hash: 123456789
- is_used: 1
- device_id: device-abc123
```

### Case 2: Reuse on Same Device (Dùng lại trên cùng thiết bị)
```
User A on Device A (reload page, or come back later):
1. Nhập key: 123456789
2. Device ID: device-abc123 (loaded from localStorage)
3. Backend check: 
   - Key đã dùng: YES
   - Device ID match: YES (device-abc123 == device-abc123)
4. ✅ Success → Flash firmware again

Database: (unchanged)
- key_hash: 123456789
- is_used: 1
- device_id: device-abc123
```

### Case 3: Try on Different Device (Dùng trên thiết bị khác)
```
User B on Device B:
1. Nhập key: 123456789 (same key as User A)
2. Device ID: device-xyz789 (different device)
3. Backend check:
   - Key đã dùng: YES
   - Device ID match: NO (device-abc123 ≠ device-xyz789)
4. ❌ Error: "Key đã được sử dụng với thiết bị khác"

Database: (unchanged)
- key_hash: 123456789
- is_used: 1
- device_id: device-abc123
```

---

## 🔒 Security Features

### 1. Device Binding
- Key bind với device ID lần đầu tiên
- Không thể transfer key sang device khác
- Ngăn chặn key sharing

### 2. Stable Device ID
- Lưu trong localStorage
- Persistent across browser restarts
- Không thay đổi khi browser update

### 3. Rate Limiting
- Max 5 failed attempts / 15 minutes
- Auto block IP sau 5 lần sai
- Block duration: 60 minutes

### 4. Usage Logging
- Log mỗi lần validate key
- Track IP, User-Agent, timestamp
- Analytics và security monitoring

---

## 📊 Database Schema

### Table: auth_keys
```sql
CREATE TABLE auth_keys (
  id INTEGER PRIMARY KEY,
  key_hash TEXT UNIQUE NOT NULL,        -- 9-digit key
  description TEXT,
  is_used INTEGER DEFAULT 0,            -- 0 = chưa dùng, 1 = đã dùng
  device_id TEXT,                       -- Device fingerprint
  created_at TEXT,
  used_at TEXT
);
```

### Table: usage_logs
```sql
CREATE TABLE usage_logs (
  id INTEGER PRIMARY KEY,
  key_hash TEXT NOT NULL,
  device_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TEXT,
  FOREIGN KEY (key_hash) REFERENCES auth_keys(key_hash)
);
```

---

## 🧪 Testing Scenarios

### Test 1: ✅ Normal Flow
```bash
# First use
POST /auth
Body: { "key": "123456789", "deviceId": "device-abc" }
Response: { "success": true }

# Reuse on same device
POST /auth
Body: { "key": "123456789", "deviceId": "device-abc" }
Response: { "success": true }  # ✅ OK
```

### Test 2: ❌ Different Device
```bash
# Try on different device
POST /auth
Body: { "key": "123456789", "deviceId": "device-xyz" }
Response: { 
  "success": false, 
  "message": "Key đã được sử dụng với thiết bị khác" 
}
```

### Test 3: ❌ Invalid Key
```bash
POST /auth
Body: { "key": "999999999", "deviceId": "device-abc" }
Response: { 
  "success": false, 
  "message": "Key không tồn tại trong hệ thống" 
}
```

### Test 4: 🚫 Rate Limiting
```bash
# Try 6 times with wrong key
POST /auth (x6)
Response (6th attempt): { 
  "success": false, 
  "message": "Quá nhiều lần thử! IP đã bị chặn 60 phút" 
}
```

---

## 🔧 Admin Operations

### Check Key Status
```bash
# Via API
GET /auth?key=123456789

Response:
{
  "success": true,
  "used": true,
  "deviceId": "device-abc123",
  "createdAt": "2025-10-28T...",
  "usedAt": "2025-10-28T..."
}
```

### Check Usage Logs
```sql
-- Via D1 Console
SELECT * FROM usage_logs 
WHERE key_hash = '123456789' 
ORDER BY timestamp DESC;
```

### Reset Device Binding (Admin Only)
```sql
-- Allow key to be used on new device
UPDATE auth_keys 
SET is_used = 0, device_id = NULL 
WHERE key_hash = '123456789';
```

---

## 💡 User Guide

### Nếu User Clear localStorage?
- Device ID sẽ generate lại
- Key cũ sẽ bị coi là "device khác"
- ❌ Key sẽ không hoạt động nữa
- ⚠️ User cần liên hệ admin để reset binding

### Nếu User Chuyển Máy Tính?
- Device ID mới sẽ được generate
- Key cũ đã bind với device cũ
- ❌ Không thể dùng key trên máy mới
- 🔐 Security feature - ngăn key sharing

### Giải Pháp: Reset Device
```typescript
// User có thể xóa localStorage manually
localStorage.removeItem('esp32_device_id')
// Sau đó liên hệ admin để reset key binding
```

---

## ✅ Checklist Implementation

- [x] ✅ Device fingerprinting with localStorage
- [x] ✅ Stable device ID across sessions
- [x] ✅ Backend validation logic
- [x] ✅ Database schema with device_id
- [x] ✅ Rate limiting protection
- [x] ✅ Usage logging
- [x] ✅ Error messages
- [x] ✅ Frontend validation flow
- [x] ✅ Test scenarios
- [x] ✅ Documentation

---

## 📞 Support

Nếu user gặp vấn đề:
1. Check localStorage: `localStorage.getItem('esp32_device_id')`
2. Check usage logs trong D1
3. Reset key binding nếu cần (admin)
4. Contact: Zalo 0389827643

---

**Status**: ✅ IMPLEMENTED & TESTED  
**Last Updated**: 28/10/2025

