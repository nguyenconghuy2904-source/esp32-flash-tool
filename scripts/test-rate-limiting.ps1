# Test Rate Limiting
# This script tests if rate limiting is working correctly

Write-Host "🧪 Testing Rate Limiting..." -ForegroundColor Cyan
Write-Host ""

$API_URL = "https://esp32-flash-api.minizjp.workers.dev"
$TEST_KEY = "999999999"  # Invalid key for testing

Write-Host "Testing with invalid key: $TEST_KEY" -ForegroundColor Yellow
Write-Host "Attempting 7 requests (should block after 5)..." -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le 7; $i++) {
    Write-Host "Attempt $i/7: " -NoNewline -ForegroundColor Cyan
    
    try {
        $body = @{
            key = $TEST_KEY
            deviceId = "test-device-$i"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_URL/auth" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "✅ Response: $($response.message)" -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($statusCode -eq 429) {
            Write-Host "🚫 BLOCKED (429) - Rate limit working!" -ForegroundColor Red
            Write-Host "   Message: $($errorResponse.message)" -ForegroundColor Yellow
        }
        elseif ($statusCode -eq 401) {
            Write-Host "❌ Invalid key (401) - Expected" -ForegroundColor Yellow
        }
        else {
            Write-Host "❓ Error ($statusCode): $($errorResponse.message)" -ForegroundColor Magenta
        }
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Expected result:" -ForegroundColor Cyan
Write-Host "  - First 5 attempts: 401 (Invalid key)" -ForegroundColor White
Write-Host "  - Attempts 6-7: 429 (Rate limited/blocked)" -ForegroundColor White
