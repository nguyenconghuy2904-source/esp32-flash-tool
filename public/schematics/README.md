# Sơ Đồ Kết Nối (Schematics)

Thư mục này chứa các file PDF sơ đồ kết nối cho các dự án ESP32.

## Cách thêm sơ đồ mới:

### 1. Upload file PDF vào thư mục này

Đặt file PDF với tên rõ ràng, ví dụ:
- `robot-otto-wiring.pdf` - Sơ đồ kết nối Robot Otto
- `smart-trash-bin-setup.pdf` - Hướng dẫn lắp đặt Thùng Rác Thông Minh
- `smart-switch-wiring.pdf` - Sơ đồ kết nối Smart Switch PC

### 2. Cập nhật link trong page.tsx

File: `src/app/page.tsx`

Tìm firmware tương ứng và update `schematicUrl`:

```typescript
{
  id: 'robot-otto',
  name: 'Robot Otto',
  schematicUrl: '/schematics/robot-otto-wiring.pdf',
  // ...
}
```

### 3. Commit và push

```bash
git add public/schematics/
git commit -m "docs: add schematic diagram for [tên dự án]"
git push origin main
```

## Truy cập sơ đồ

Sau khi deploy, file PDF có thể truy cập tại:
```
https://minizjp.com/schematics/[tên-file].pdf
```

## Lưu ý

- ✅ File nên dưới 5MB để load nhanh
- ✅ Định dạng: PDF (khuyến nghị) hoặc PNG/JPG
- ✅ Tên file không dấu, viết thường, dùng dấu gạch ngang (-)
- ✅ File sẽ được serve trực tiếp, không cần proxy
