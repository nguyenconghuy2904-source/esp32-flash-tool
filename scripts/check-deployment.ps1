# DNS & GitHub Pages Status Checker
# Check DNS configuration and GitHub Pages deployment status

Write-Host "=== DNS & GitHub Pages Status Checker ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check DNS A Records
Write-Host "[1] Checking DNS A Records for minizjp.com..." -ForegroundColor Yellow
try {
    $dnsResults = Resolve-DnsName -Name "minizjp.com" -Type A -ErrorAction SilentlyContinue
    if ($dnsResults) {
        Write-Host "  ✓ DNS A Records found:" -ForegroundColor Green
        foreach ($record in $dnsResults) {
            if ($record.IP4Address) {
                Write-Host "    - $($record.IP4Address)" -ForegroundColor White
            }
        }
        
        # Check if pointing to GitHub Pages IPs
        $githubIPs = @("185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153")
        $foundGithubIP = $false
        foreach ($record in $dnsResults) {
            if ($record.IP4Address -in $githubIPs) {
                $foundGithubIP = $true
                break
            }
        }
        
        if ($foundGithubIP) {
            Write-Host "  ✓ Domain is pointing to GitHub Pages!" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Domain is NOT pointing to GitHub Pages" -ForegroundColor Red
            Write-Host "    Expected IPs: $($githubIPs -join ', ')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ No DNS A Records found" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Error checking DNS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Check www subdomain
Write-Host "[2] Checking www.minizjp.com CNAME..." -ForegroundColor Yellow
try {
    $wwwResults = Resolve-DnsName -Name "www.minizjp.com" -Type CNAME -ErrorAction SilentlyContinue
    if ($wwwResults) {
        Write-Host "  ✓ CNAME Record found:" -ForegroundColor Green
        foreach ($record in $wwwResults) {
            if ($record.NameHost) {
                Write-Host "    - $($record.NameHost)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "  ⚠ No CNAME record for www subdomain (optional)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ www subdomain not configured (optional)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Check CNAME file in repository
Write-Host "[3] Checking CNAME file in repository..." -ForegroundColor Yellow
if (Test-Path ".\public\CNAME") {
    $cnameContent = Get-Content ".\public\CNAME" -Raw
    Write-Host "  ✓ CNAME file exists in public/" -ForegroundColor Green
    Write-Host "    Content: $($cnameContent.Trim())" -ForegroundColor White
} else {
    Write-Host "  ✗ CNAME file not found in public/" -ForegroundColor Red
}

Write-Host ""

# 4. Check GitHub Actions status
Write-Host "[4] Checking GitHub Actions workflow..." -ForegroundColor Yellow
Write-Host "  → Visit: https://github.com/nguyenconghuy2904-source/esp32-flash-tool/actions" -ForegroundColor Cyan
Write-Host "    Check if latest workflow run is successful" -ForegroundColor Gray

Write-Host ""

# 5. Check website accessibility
Write-Host "[5] Checking website accessibility..." -ForegroundColor Yellow
$urls = @(
    "https://minizjp.com",
    "https://www.minizjp.com",
    "https://nguyenconghuy2904-source.github.io/esp32-flash-tool"
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $url is accessible" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $url returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ✗ $url is NOT accessible" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# 6. Summary & Next Steps
Write-Host "=== Summary & Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see errors above, follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure DNS at Porkbun:" -ForegroundColor White
Write-Host "   - Login to https://porkbun.com" -ForegroundColor Gray
Write-Host "   - Add 4 A records pointing to GitHub Pages IPs" -ForegroundColor Gray
Write-Host "   - See DNS-CONFIG.md for details" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure GitHub Pages:" -ForegroundColor White
Write-Host "   - Go to repo Settings > Pages" -ForegroundColor Gray
Write-Host "   - Set custom domain: minizjp.com" -ForegroundColor Gray
Write-Host "   - Enable 'Enforce HTTPS'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Wait for DNS propagation (5-30 minutes)" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, read: DNS-CONFIG.md" -ForegroundColor Cyan
Write-Host ""
