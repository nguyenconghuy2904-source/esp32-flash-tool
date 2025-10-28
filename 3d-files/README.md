# Thư mục File 3D

Đây là nơi lưu trữ các file 3D (ZIP) cho các dự án.

## Cách thêm file 3D mới

### Thủ công:
1. Nén tất cả file 3D (`.stl`, `.step`, `.obj`, v.v.) vào file `.zip`
2. Đặt tên file theo format: `tên-dự-án.zip`
3. Chép file vào thư mục này
4. Cập nhật URL trong `src/app/page.tsx`:
   ```typescript
   file3dUrl: '/3d-files/tên-dự-án.zip'
   ```

### Bằng PowerShell script:
```powershell
.\scripts\upload-3d-file.ps1 -ProjectName "robot-otto" -FilePath "C:\path\to\file.zip"
```

## Các file hiện có:

### Robot Otto
- File: `robot-otto.zip`
- Mô tả: File 3D mô hình Robot Otto (STL, STEP)
- URL: `/3d-files/robot-otto.zip`

### Thùng Rác Thông Minh
- File: `smart-trash-bin.zip`
- Mô tả: File 3D thùng rác thông minh (STL, STEP)
- URL: `/3d-files/smart-trash-bin.zip`

### Smart Switch PC
- File: `smart-switch-pc.zip`
- Mô tả: File 3D vỏ hộp switch (STL, STEP)
- URL: `/3d-files/smart-switch-pc.zip`

## Lưu ý:
- ✅ **CHỈ chấp nhận file .zip**
- File ZIP nên chứa: STL, STEP, hoặc các định dạng 3D khác
- Dung lượng file không nên quá 50MB
- Đặt tên file rõ ràng, không dấu tiếng Việt
- Có thể thêm README.txt trong ZIP để hướng dẫn
- File sẽ được deploy cùng với website
