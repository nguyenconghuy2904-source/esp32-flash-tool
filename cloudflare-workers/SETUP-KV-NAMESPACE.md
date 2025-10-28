# Hướng dẫn setup KV Namespace cho Rate Limiting

## Vấn đề
Cloudflare Worker sử dụng KV namespace để lưu trữ thông tin rate limiting (giới hạn số lần thử), nhưng hiện tại chưa được cấu hình trong `wrangler.toml`.

## Các bước setup

### 1. Tạo KV Namespace

Chạy lệnh sau để tạo KV namespace cho production:

```bash
wrangler kv:namespace create "KV"
```

Lệnh này sẽ trả về ID của namespace, ví dụ:
```
🌀 Creating namespace with title "esp32-flash-api-KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "KV", id = "abc123def456..." }
```

### 2. Tạo Preview KV Namespace (cho development)

```bash
wrangler kv:namespace create "KV" --preview
```

Lệnh này sẽ trả về preview ID:
```
🌀 Creating namespace with title "esp32-flash-api-KV_preview"
✨ Success!
{ binding = "KV", preview_id = "xyz789abc123..." }
```

### 3. Cập nhật wrangler.toml

Mở file `wrangler.toml` và thay thế:

```toml
# KV Namespace binding for rate limiting
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID"        # <- Thay bằng ID từ bước 1
preview_id = "YOUR_KV_PREVIEW_ID"   # <- Thay bằng preview_id từ bước 2
```

Ví dụ:
```toml
[[kv_namespaces]]
binding = "KV"
id = "abc123def456789"
preview_id = "xyz789abc123456"
```

### 4. Test local

```bash
cd cloudflare-workers
npm run dev
```

### 5. Deploy

```bash
cd cloudflare-workers
npm run deploy
```

## Kiểm tra KV hoạt động

Sau khi setup xong, bạn có thể test rate limiting bằng cách:

1. Gửi nhiều request với key sai đến endpoint `/auth`
2. Sau 5 lần thử sai, IP sẽ bị block trong 60 phút
3. Kiểm tra KV namespace trên Cloudflare dashboard để xem dữ liệu rate limit

## Lệnh hữu ích

### Xem danh sách KV namespaces
```bash
wrangler kv:namespace list
```

### Xem key trong KV namespace
```bash
wrangler kv:key list --binding=KV
```

### Xóa một key (ví dụ unblock IP)
```bash
wrangler kv:key delete "rate_limit:1.2.3.4" --binding=KV
wrangler kv:key delete "blocked:1.2.3.4" --binding=KV
```

### Xem giá trị của một key
```bash
wrangler kv:key get "rate_limit:1.2.3.4" --binding=KV
```

## Lưu ý

- KV namespace có limit 1000 operations/second (rất đủ cho rate limiting)
- Dữ liệu trong KV có thể mất tới 60s để sync globally
- KV lưu trữ key-value dạng string, nên phải parse khi cần
- Rate limit keys tự động expire nhờ `expirationTtl`

## Troubleshooting

### Lỗi: "KV binding not found"
→ Chưa setup KV namespace hoặc chưa cập nhật `wrangler.toml`

### Lỗi: "Error 1101: Worker threw exception"
→ Kiểm tra logs bằng `wrangler tail` để xem lỗi chi tiết

### Rate limiting không hoạt động
→ Kiểm tra KV namespace đã được bind đúng trong wrangler.toml
→ Kiểm tra KV có data bằng `wrangler kv:key list`

