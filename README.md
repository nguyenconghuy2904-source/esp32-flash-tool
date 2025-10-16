# ESP32-S3 Web Flash Tool

Một ứng dụng web hiện đại để nạp firmware lên chip ESP32-S3 với hệ thống xác thực key bảo mật.

## Tính năng

- 🔐 **Xác thực key bảo mật**: Mỗi key chỉ có thể sử dụng với một thiết bị duy nhất
- 🌐 **WebSerial API**: Kết nối trực tiếp với ESP32-S3 qua trình duyệt
- 📁 **Upload firmware**: Hỗ trợ tải lên file .bin
- ⚡ **Real-time progress**: Theo dõi tiến độ nạp firmware
- 💻 **Responsive UI**: Giao diện thân thiện, responsive trên mọi thiết bị
- 🔄 **API Backend**: RESTful API để quản lý key validation

## Yêu cầu hệ thống

- **Trình duyệt**: Chrome/Edge phiên bản 89+ (hỗ trợ WebSerial API)
- **Thiết bị**: ESP32-S3 với USB CDC
- **Node.js**: 18.0 hoặc cao hơn
- **Key xác thực**: 32-digit hex key được cung cấp

## Cài đặt và chạy

### 1. Clone repository và cài đặt dependencies

```bash
git clone <repository-url>
cd esp32-s3-web-flash-tool
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Truy cập ứng dụng tại: http://localhost:3000

### 3. Deploy lên GitHub Pages

Xem hướng dẫn chi tiết trong [DEPLOY.md](./DEPLOY.md)

```bash
# Push code lên GitHub để tự động deploy
git add .
git commit -m "Deploy ESP32 Flash Tool"
git push origin main
```

### 4. Build local

```bash
npm run build  # Tạo static export cho GitHub Pages
npm start      # Chạy production server
```

## Hướng dẫn sử dụng

### Bước 1: Chuẩn bị thiết bị
1. Kết nối ESP32-S3 với máy tính qua cáp USB
2. Đảm bảo driver USB-to-UART đã được cài đặt

### Bước 2: Xác thực
1. Nhập **Authentication Key** (32 ký tự hex) được cung cấp
2. Key sẽ được validate qua API backend

### Bước 3: Kết nối thiết bị
1. Nhấn nút **"Kết nối ESP32-S3"**
2. Chọn cổng COM tương ứng trong dialog
3. Đợi thông báo kết nối thành công

### Bước 4: Tải lên firmware
1. Chọn file firmware (.bin) từ máy tính
2. Kiểm tra thông tin file đã chọn
3. Nhấn **"Bắt đầu nạp Firmware"**

### Bước 5: Theo dõi tiến độ
- Theo dõi các giai đoạn: Connecting → Erasing → Writing → Verifying → Complete
- Xem progress bar và thông báo chi tiết

## Cấu trúc dự án

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── route.ts      # API endpoint cho key validation
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page component
├── lib/
│   └── esp32-flash.ts       # ESP32-S3 flashing utilities
├── types/
│   └── webserial.d.ts       # WebSerial API type definitions
```

## Kiến trúc Deployment

- **Frontend**: GitHub Pages (static export)
- **API Backend**: Cloudflare Workers  
- **Database**: Cloudflare D1 (SQLite)
- **Firmware Storage**: GitHub Releases

## API Endpoints (Cloudflare Workers)

### POST /auth
Xác thực authentication key

**Request:**
```json
{
  "key": "A1B2C3D4E5F6789012345678901234AB",
  "deviceId": "unique-device-identifier"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Key hợp lệ và đã được xác thực thành công",
  "deviceId": "unique-device-identifier"
}
```

### GET /auth?key=xxx
Kiểm tra trạng thái key

**Response:**
```json
{
  "success": true,
  "used": false,
  "deviceId": null
}
```

### GET /stats
Lấy thống kê sử dụng

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_keys": 100,
    "used_keys": 25,
    "unique_devices": 23
  }
}
```

## Hệ thống Key

- **Format**: 32 ký tự hexadecimal (0-9, A-F)
- **Unique binding**: Mỗi key chỉ liên kết với 1 device ID
- **One-time use**: Key đã sử dụng không thể dùng cho thiết bị khác
- **Backend validation**: Tất cả key được validate qua Cloudflare Workers
- **Database**: Lưu trữ trên Cloudflare D1 với tracking đầy đủ

## Quản lý Firmware

- **GitHub Releases**: Upload file .bin vào Releases để tự động hiển thị
- **Version management**: Mỗi release có thể chứa nhiều firmware
- **Auto-detection**: Tự động detect chip type từ tên file
- **Download**: Trực tiếp download từ GitHub CDN

## Bảo mật

- ✅ Key validation qua encrypted API calls
- ✅ Device fingerprinting để prevent reuse
- ✅ Input sanitization và validation
- ✅ HTTPS enforced in production
- ✅ No key storage in localStorage/cookies

## Troubleshooting

### Lỗi kết nối
- **"WebSerial API không được hỗ trợ"**: Sử dụng Chrome/Edge mới nhất
- **"Không thể kết nối thiết bị"**: Kiểm tra driver USB và cáp kết nối
- **"Thiết bị đã bị chiếm dụng"**: Đóng tất cả ứng dụng khác đang sử dụng COM port

### Lỗi key
- **"Key không đúng định dạng"**: Đảm bảo 32 ký tự hex (0-9, A-F)
- **"Key không tồn tại"**: Liên hệ admin để lấy key hợp lệ
- **"Key đã được sử dụng"**: Key chỉ dùng được cho 1 thiết bị

### Lỗi firmware
- **"File không hợp lệ"**: Chỉ chấp nhận file .bin
- **"Firmware quá lớn"**: Kiểm tra kích thước file phù hợp với ESP32-S3
- **"Lỗi trong quá trình nạp"**: Thử reset thiết bị và nạp lại

## Development

### Thêm key mới
Chỉnh sửa file `src/app/api/auth/route.ts`:

```typescript
const validKeys = new Map<string, { deviceId: string | null, used: boolean }>([
  ['A1B2C3D4E5F6789012345678901234AB', { deviceId: null, used: false }],
  ['NEW_KEY_HERE', { deviceId: null, used: false }],
  // Thêm keys mới...
])
```

### Tùy chỉnh flash parameters
Chỉnh sửa file `src/lib/esp32-flash.ts` để thay đổi:
- Baud rate
- Chunk size
- Flash addresses
- Bootloader commands

## Công nghệ sử dụng

- **Framework**: Next.js 15.5 (Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: WebSerial API
- **Backend**: Cloudflare Workers + D1 Database
- **Frontend Hosting**: GitHub Pages
- **Domain**: minizjp.com (Porkbun + Cloudflare)
- **CI/CD**: GitHub Actions

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 📚 Tài liệu hỗ trợ

- **[GUIDE-BEGINNER.md](./GUIDE-BEGINNER.md)**: Hướng dẫn step-by-step cho người mới
- **[DEPLOY.md](./DEPLOY.md)**: Chi tiết kỹ thuật deployment 
- **[CHECKLIST.md](./CHECKLIST.md)**: Checklist deploy và monitoring
- **scripts/generate-keys**: Tools tạo authentication keys

## 🌐 Live Demo

- **Website**: https://minizjp.com
- **API**: https://api.minizjp.com
- **Source**: https://github.com/nguyenconghuy2904-source/esp32-flash-tool

## Liên hệ hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng tạo issue trên repository này hoặc truy cập https://minizjp.com để test trực tiếp.