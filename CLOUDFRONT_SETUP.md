# CloudFront Configuration Guide

## Lỗi thường gặp và cách khắc phục

### 1. Lỗi "CloudFront configuration is missing"

**Nguyên nhân:** Thiếu environment variables cho CloudFront
**Giải pháp:** Đảm bảo có đầy đủ các biến sau trong file `.env`:

```bash
CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=your-key-pair-id
CLOUDFRONT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 2. Lỗi "error:1E08010C:DECODER routines::unsupported"

**Nguyên nhân:** Format private key không đúng
**Giải pháp:**

#### Cách format private key đúng:

1. **Từ file .pem:** Nếu bạn có file private key `.pem`, convert như sau:

```bash
# Đọc nội dung file và format cho .env
cat your-private-key.pem | sed ':a;N;$!ba;s/\n/\\n/g'
```

2. **Format thủ công:** Thay thế tất cả line breaks bằng `\n`:

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5wZJj...\n-----END PRIVATE KEY-----
```

3. **Đặt trong dấu ngoặc kép:**

```bash
CLOUDFRONT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-key-content-here\n-----END PRIVATE KEY-----"
```

### 3. Cách kiểm tra cấu hình

Code đã được cập nhật để log thông tin debug. Khi chạy sẽ hiển thị:

```
CloudFront Configuration Check: {
  hasCloudFrontUrl: true,
  hasKeyPairId: true,
  hasPrivateKey: true,
  cloudFrontUrl: 'https://d1234567890.cloudfront.net',
  keyPairId: 'K1234567890',
  privateKeyLength: 1675
}
```

### 4. Các bước cấu hình CloudFront trong AWS:

1. Tạo CloudFront distribution
2. Tạo Key Pair trong CloudFront console
3. Download private key và note key pair ID
4. Cấu hình trong `.env` file
5. Restart server để load lại environment variables

### 5. Lưu ý bảo mật:

- **KHÔNG** commit file `.env` vào git
- Thêm `.env` vào `.gitignore`
- Sử dụng AWS Secrets Manager hoặc environment variables trong production
- Private key phải được bảo vệ cẩn thận
