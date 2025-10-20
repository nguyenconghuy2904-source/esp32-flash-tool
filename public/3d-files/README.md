# Thư mục File 3D

Đây là nơi lưu trữ các file 3D (STL, STEP, OBJ) cho các dự án.

## Cách thêm file 3D mới

### Thủ công:
1. Chép file 3D (`.stl`, `.step`, `.obj`) vào thư mục này
2. Đặt tên file theo format: `tên-dự-án.stl`
3. Cập nhật URL trong `src/app/page.tsx`:
   ```typescript
   file3dUrl: '/3d-files/tên-dự-án.stl'
   ```

### Bằng PowerShell script:
```powershell
.\scripts\upload-3d-file.ps1 -ProjectName "robot-otto" -FilePath "C:\path\to\file.stl"
```

## Các file hiện có:

### Robot Otto
- File: `robot-otto.stl`
- Mô tả: File 3D mô hình Robot Otto
- URL: `/3d-files/robot-otto.stl`

### Thùng Rác Thông Minh
- File: `smart-trash-bin.stl`
- Mô tả: File 3D thùng rác thông minh
- URL: `/3d-files/smart-trash-bin.stl`

### Smart Switch PC
- File: `smart-switch-pc.stl`
- Mô tả: File 3D vỏ hộp switch
- URL: `/3d-files/smart-switch-pc.stl`

## Lưu ý:
- File 3D nên ở định dạng STL hoặc STEP để dễ mở
- Dung lượng file không nên quá 50MB
- Đặt tên file rõ ràng, không dấu tiếng Việt
- File sẽ được deploy cùng với website
