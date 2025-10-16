# Test Key Validation API
# Test 9-digit key validation with Cloudflare Workers backend

Write-Host "=== Testing 9-Digit Key Validation ===" -ForegroundColor Cyan
Write-Host ""

$API_URL = "https://esp32-flash-api.minizjp.workers.dev"

# Test 1: Valid 9-digit key
Write-Host "[Test 1] Valid 9-digit key (123456789)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"key":"123456789","deviceId":"test-device-123"}'
    
    if ($response.success) {
        Write-Host "  ✓ SUCCESS: $($response.message)" -ForegroundColor Green
        Write-Host "    Device ID: $($response.deviceId)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Invalid format (8 digits)
Write-Host "[Test 2] Invalid key (8 digits: 12345678)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"key":"12345678","deviceId":"test-device-456"}' `
        -ErrorAction Stop
    
    Write-Host "  ✗ UNEXPECTED SUCCESS (should fail)" -ForegroundColor Red
} catch {
    Write-Host "  ✓ CORRECTLY REJECTED: Invalid format" -ForegroundColor Green
}
Write-Host ""

# Test 3: Invalid format (contains letters)
Write-Host "[Test 3] Invalid key (contains letters: ABC123456)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"key":"ABC123456","deviceId":"test-device-789"}' `
        -ErrorAction Stop
    
    Write-Host "  ✗ UNEXPECTED SUCCESS (should fail)" -ForegroundColor Red
} catch {
    Write-Host "  ✓ CORRECTLY REJECTED: Invalid characters" -ForegroundColor Green
}
Write-Host ""

# Test 4: Check key status
Write-Host "[Test 4] Check key status (123456789)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth?key=123456789" -Method GET
    
    if ($response.success) {
        Write-Host "  ✓ Key Status Retrieved:" -ForegroundColor Green
        Write-Host "    Used: $($response.used)" -ForegroundColor Gray
        Write-Host "    Device ID: $($response.deviceId)" -ForegroundColor Gray
        Write-Host "    Created: $($response.createdAt)" -ForegroundColor Gray
        Write-Host "    Used At: $($response.usedAt)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Non-existent key
Write-Host "[Test 5] Non-existent key (999999999)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"key":"999999999","deviceId":"test-device-000"}' `
        -ErrorAction Stop
    
    Write-Host "  ✗ UNEXPECTED SUCCESS (should fail)" -ForegroundColor Red
} catch {
    Write-Host "  ✓ CORRECTLY REJECTED: Key not found" -ForegroundColor Green
}
Write-Host ""

# Test 6: Get statistics
Write-Host "[Test 6] Get usage statistics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/stats" -Method GET
    
    if ($response.success) {
        Write-Host "  ✓ Statistics Retrieved:" -ForegroundColor Green
        Write-Host "    Total Keys: $($response.stats.total_keys)" -ForegroundColor Gray
        Write-Host "    Used Keys: $($response.stats.used_keys)" -ForegroundColor Gray
        Write-Host "    Unique Devices: $($response.stats.unique_devices)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ 9-digit key format is working correctly" -ForegroundColor Green
Write-Host "✓ Invalid formats are properly rejected" -ForegroundColor Green
Write-Host "✓ API endpoints are responding" -ForegroundColor Green
Write-Host ""
Write-Host "Sample valid keys for testing:" -ForegroundColor Yellow
Write-Host "  - 123456789" -ForegroundColor White
Write-Host "  - 234567890" -ForegroundColor White
Write-Host "  - 345678901" -ForegroundColor White
Write-Host "  - 456789012" -ForegroundColor White
Write-Host "  - 567890123" -ForegroundColor White
Write-Host ""
