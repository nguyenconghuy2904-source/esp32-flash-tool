# ========================================
# SCRIPT TỰ ĐỘNG PUSH CODE LÊN MINIZJPNEW
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH CODE LÊN REPO MINIZJPNEW" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set error action
$ErrorActionPreference = "Stop"

# Kiểm tra git
Write-Host "[1/5] Kiểm tra Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài Git từ: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

Write-Host ""

# Lựa chọn phương thức
Write-Host "[2/5] Chọn phương thức deploy:" -ForegroundColor Yellow
Write-Host "1. Dùng Personal Access Token (Khuyến nghị)" -ForegroundColor White
Write-Host "2. Dùng GitHub CLI (Cần cài gh)" -ForegroundColor White
Write-Host "3. Hướng dẫn import qua GitHub Web UI" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Chọn (1/2/3)"

Write-Host ""

if ($choice -eq "1") {
    # ========================================
    # PHƯƠNG THỨC 1: PERSONAL ACCESS TOKEN
    # ========================================
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "PHƯƠNG THỨC 1: PERSONAL ACCESS TOKEN" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "📝 HƯỚNG DẪN TẠO TOKEN:" -ForegroundColor Yellow
    Write-Host "1. Đăng nhập GitHub với account: conghuy93" -ForegroundColor White
    Write-Host "2. Vào: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "3. Đặt tên: minizjpnew-deploy" -ForegroundColor White
    Write-Host "4. Chọn scope: [✓] repo (Full control)" -ForegroundColor White
    Write-Host "5. Click 'Generate token'" -ForegroundColor White
    Write-Host "6. Copy token (dạng: ghp_xxxxxxxxxxxx)" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "Mở browser để tạo token? (y/n)"
    if ($openBrowser -eq "y") {
        Start-Process "https://github.com/settings/tokens/new"
        Write-Host "✅ Đã mở browser. Tạo token và quay lại đây." -ForegroundColor Green
        Write-Host ""
    }
    
    # Nhập token
    Write-Host "Nhập Personal Access Token:" -ForegroundColor Yellow
    $token = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    $tokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    if ([string]::IsNullOrWhiteSpace($tokenPlain)) {
        Write-Host "❌ Token không được để trống!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[3/5] Cấu hình remote..." -ForegroundColor Yellow
    
    # Xóa remote cũ nếu có
    git remote remove minizjpnew 2>$null
    
    # Thêm remote mới với token
    $remoteUrl = "https://$tokenPlain@github.com/conghuy93/minizjpnew.git"
    git remote add minizjpnew $remoteUrl
    
    Write-Host "✅ Đã thêm remote: minizjpnew" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[4/5] Đang push code..." -ForegroundColor Yellow
    Write-Host "Vui lòng đợi..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        git push minizjpnew main --force 2>&1 | ForEach-Object { Write-Host $_ }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ PUSH THÀNH CÔNG!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Code đã được push lên:" -ForegroundColor Cyan
        Write-Host "   https://github.com/conghuy93/minizjpnew" -ForegroundColor White
        Write-Host ""
        
        # Cleanup token trong remote
        git remote set-url minizjpnew "https://github.com/conghuy93/minizjpnew.git"
        
        $openRepo = Read-Host "Mở repo trên GitHub? (y/n)"
        if ($openRepo -eq "y") {
            Start-Process "https://github.com/conghuy93/minizjpnew"
        }
        
    } catch {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "❌ PUSH THẤT BẠI!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Lỗi: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 GỢI Ý KHẮC PHỤC:" -ForegroundColor Yellow
        Write-Host "1. Kiểm tra token có quyền 'repo' không" -ForegroundColor White
        Write-Host "2. Kiểm tra account conghuy93 có quyền push không" -ForegroundColor White
        Write-Host "3. Kiểm tra repo minizjpnew đã tồn tại chưa" -ForegroundColor White
        Write-Host "4. Thử lại hoặc dùng Phương thức 3 (GitHub Web UI)" -ForegroundColor White
        Write-Host ""
        
        # Cleanup
        git remote remove minizjpnew 2>$null
        
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    
} elseif ($choice -eq "2") {
    # ========================================
    # PHƯƠNG THỨC 2: GITHUB CLI
    # ========================================
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "PHƯƠNG THỨC 2: GITHUB CLI" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Kiểm tra gh CLI
    Write-Host "[3/5] Kiểm tra GitHub CLI..." -ForegroundColor Yellow
    try {
        $ghVersion = gh --version
        Write-Host "✅ GitHub CLI đã cài: $($ghVersion[0])" -ForegroundColor Green
    } catch {
        Write-Host "❌ GitHub CLI chưa được cài đặt!" -ForegroundColor Red
        Write-Host ""
        Write-Host "📥 CÁCH CÀI ĐẶT:" -ForegroundColor Yellow
        Write-Host "1. Dùng winget: winget install --id GitHub.cli" -ForegroundColor White
        Write-Host "2. Hoặc download từ: https://cli.github.com/" -ForegroundColor White
        Write-Host ""
        
        $installNow = Read-Host "Cài đặt ngay bằng winget? (y/n)"
        if ($installNow -eq "y") {
            Write-Host "Đang cài đặt GitHub CLI..." -ForegroundColor Yellow
            winget install --id GitHub.cli --silent
            Write-Host "✅ Đã cài xong! Vui lòng chạy lại script." -ForegroundColor Green
        }
        
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[4/5] Đăng nhập GitHub CLI..." -ForegroundColor Yellow
    Write-Host "Vui lòng đăng nhập với account: conghuy93" -ForegroundColor White
    Write-Host ""
    
    gh auth login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Đăng nhập thất bại!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[5/5] Đang push code..." -ForegroundColor Yellow
    
    # Add remote nếu chưa có
    git remote remove minizjpnew 2>$null
    git remote add minizjpnew "https://github.com/conghuy93/minizjpnew.git"
    
    try {
        git push minizjpnew main --force
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ PUSH THÀNH CÔNG!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Code đã được push lên:" -ForegroundColor Cyan
        Write-Host "   https://github.com/conghuy93/minizjpnew" -ForegroundColor White
        Write-Host ""
        
        Start-Process "https://github.com/conghuy93/minizjpnew"
        
    } catch {
        Write-Host "❌ Push thất bại: $_" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
    
} else {
    # ========================================
    # PHƯƠNG THỨC 3: GITHUB WEB UI
    # ========================================
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "PHƯƠNG THỨC 3: GITHUB WEB UI IMPORT" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "✨ ĐÂY LÀ CÁCH ĐỂ NHẤT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 HƯỚNG DẪN TỪNG BƯỚC:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "BƯỚC 1: Đăng nhập GitHub" -ForegroundColor Cyan
    Write-Host "   → Đăng nhập với account: conghuy93" -ForegroundColor White
    Write-Host "   → https://github.com/login" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "BƯỚC 2: Vào trang Import" -ForegroundColor Cyan
    Write-Host "   → https://github.com/new/import" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "BƯỚC 3: Điền thông tin" -ForegroundColor Cyan
    Write-Host "   Old repository URL:" -ForegroundColor White
    Write-Host "   → https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Owner: conghuy93" -ForegroundColor White
    Write-Host "   Repository name: minizjpnew" -ForegroundColor White
    Write-Host "   Privacy: Public" -ForegroundColor White
    Write-Host ""
    
    Write-Host "BƯỚC 4: Click 'Begin import'" -ForegroundColor Cyan
    Write-Host "   → Đợi GitHub import (1-2 phút)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "BƯỚC 5: Xong!" -ForegroundColor Cyan
    Write-Host "   → https://github.com/conghuy93/minizjpnew" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    $openImport = Read-Host "Mở trang Import ngay? (y/n)"
    if ($openImport -eq "y") {
        Start-Process "https://github.com/new/import"
        Write-Host ""
        Write-Host "✅ Đã mở browser!" -ForegroundColor Green
        Write-Host "Làm theo hướng dẫn trên và import repo." -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "💡 TIP: Copy URL này để paste:" -ForegroundColor Yellow
    Write-Host "https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git" -ForegroundColor Cyan
    Set-Clipboard -Value "https://github.com/nguyenconghuy2904-source/esp32-flash-tool.git"
    Write-Host "✅ Đã copy vào clipboard!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[5/5] HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 BƯỚC TIẾP THEO:" -ForegroundColor Yellow
Write-Host "1. ✅ Code đã lên GitHub" -ForegroundColor White
Write-Host "2. 🌐 Setup auto deploy (Netlify/Vercel)" -ForegroundColor White
Write-Host "3. 🚀 Web sẽ live sau vài phút" -ForegroundColor White
Write-Host ""

Write-Host "📚 Xem hướng dẫn chi tiết:" -ForegroundColor Yellow
Write-Host "   → DEPLOY-TO-MINIZJPNEW.md" -ForegroundColor White
Write-Host ""

Read-Host "Nhấn Enter để thoát"



