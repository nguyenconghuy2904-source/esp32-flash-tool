# 📦 Hướng Dẫn Upload File 3D lên GitHub Release

## Bước 1: Đổi tên file

File hiện tại: `robot-otto.zip` (14.4 MB)
Đổi thành: `robot-otto-3d-files.zip`

```powershell
cd f:\minizjp\public\3d-files
Rename-Item "robot-otto.zip" "robot-otto-3d-files.zip"
```

## Bước 2: Upload lên GitHub Release

### Option 1: GitHub Web UI (KHUYẾN NGHỊ)

1. Truy cập: https://github.com/nguyenconghuy2904-source/robot-otto-firmware/releases/tag/v1.0.0

2. Click **"Edit release"** (icon bút chì)

3. Kéo thả file hoặc click **"Attach files"**:
   - File: `f:\minizjp\public\3d-files\robot-otto-3d-files.zip`
   - Size: ~14.4 MB

4. Đợi upload xong (có progress bar)

5. Click **"Update release"**

### Option 2: GitHub CLI

```powershell
# Install GitHub CLI nếu chưa có
winget install GitHub.cli

# Login
gh auth login

# Upload file vào release
gh release upload v1.0.0 `
  "f:\minizjp\public\3d-files\robot-otto-3d-files.zip" `
  --repo nguyenconghuy2904-source/robot-otto-firmware `
  --clobber
```

## Bước 3: Verify

Test download URL:

```powershell
$url = "https://github.com/nguyenconghuy2904-source/robot-otto-firmware/releases/download/v1.0.0/robot-otto-3d-files.zip"
Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing
```

Kết quả mong đợi: **Status 200** hoặc **302 redirect**

## Bước 4: Deploy Website

Sau khi upload xong file 3D:

```powershell
cd f:\minizjp
npm run build
git add .
git commit -m "feat: update 3D file URL to use GitHub Release for robot-otto"
git push origin main
```

---

## ✅ Checklist

- [ ] Đổi tên file: `robot-otto-3d-files.zip`
- [ ] Upload lên Release v1.0.0
- [ ] Verify download URL hoạt động
- [ ] Build và deploy website
- [ ] Test download trên https://minizjp.com

---

## 📊 Files 3D Configuration

| Firmware | File 3D | Location | Size |
|----------|---------|----------|------|
| Robot Otto | `robot-otto-3d-files.zip` | GitHub Release v1.0.0 | 14.4 MB |
| Kiki đây | - | TBD | - |
| Trash Bin | - | TBD | - |

---

## 💡 Tại Sao Dùng GitHub Release?

✅ **Ưu điểm:**
- Không giới hạn file size (trong lý do)
- CDN global của GitHub
- Download nhanh
- Không làm repo nặng
- Dễ quản lý version

❌ **Nhược điểm của /public/:**
- GitHub Pages giới hạn file size
- Làm repo nặng
- Build chậm
- Bandwidth giới hạn

---

**Sau khi upload xong, file sẽ có tại:**
```
https://github.com/nguyenconghuy2904-source/robot-otto-firmware/releases/download/v1.0.0/robot-otto-3d-files.zip
```

**Website sẽ link đến file này khi user click "📦 File 3D"**
