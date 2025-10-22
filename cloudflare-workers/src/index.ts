// Cloudflare Worker Environment
interface Env {
  DB: D1Database
  KV: KVNamespace
  ENVIRONMENT: string
  API_VERSION: string
}

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,           // Max failed attempts
  WINDOW_MINUTES: 15,        // Time window in minutes
  BLOCK_DURATION_MINUTES: 60 // Block duration after max attempts
}

// CORS headers for frontend communication
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// Response helper functions
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, message }, status)
}

// Key validation function - updated to support 9-digit numeric keys
function validateKeyFormat(key: string): boolean {
  return /^[0-9]{9}$/.test(key)
}

// Generate device fingerprint from request
function generateDeviceId(request: Request): string {
  const userAgent = request.headers.get('User-Agent') || ''
  const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1'
  const fingerprint = btoa(`${ip}-${userAgent}`).slice(0, 16)
  return `device-${fingerprint}`
}

// Rate limiting helper functions
async function checkRateLimit(env: Env, ip: string): Promise<{ allowed: boolean; message?: string }> {
  const key = `rate_limit:${ip}`
  const blockKey = `blocked:${ip}`
  
  // Check if IP is blocked
  const blocked = await env.KV.get(blockKey)
  if (blocked) {
    return {
      allowed: false,
      message: `IP của bạn đã bị chặn do spam. Vui lòng thử lại sau ${RATE_LIMIT.BLOCK_DURATION_MINUTES} phút.`
    }
  }
  
  // Get current attempt count
  const attemptsStr = await env.KV.get(key)
  const attempts = attemptsStr ? parseInt(attemptsStr) : 0
  
  if (attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
    // Block IP
    await env.KV.put(blockKey, 'true', { expirationTtl: RATE_LIMIT.BLOCK_DURATION_MINUTES * 60 })
    
    // Log blocked IP to database
    await env.DB.prepare(
      'INSERT INTO blocked_ips (ip_address, reason, blocked_at, expires_at) VALUES (?, ?, datetime("now"), datetime("now", "+' + RATE_LIMIT.BLOCK_DURATION_MINUTES + ' minutes"))'
    ).bind(ip, 'Too many failed attempts').run()
    
    return {
      allowed: false,
      message: `Quá nhiều lần thử sai! IP của bạn đã bị chặn trong ${RATE_LIMIT.BLOCK_DURATION_MINUTES} phút.`
    }
  }
  
  return { allowed: true }
}

async function incrementFailedAttempt(env: Env, ip: string): Promise<void> {
  const key = `rate_limit:${ip}`
  const attemptsStr = await env.KV.get(key)
  const attempts = attemptsStr ? parseInt(attemptsStr) : 0
  
  // Increment and set expiration
  await env.KV.put(key, (attempts + 1).toString(), {
    expirationTtl: RATE_LIMIT.WINDOW_MINUTES * 60
  })
}

async function resetFailedAttempts(env: Env, ip: string): Promise<void> {
  const key = `rate_limit:${ip}`
  await env.KV.delete(key)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Route: POST /auth - Validate authentication key
      if (path === '/auth' && request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1'
        
        // Check rate limit FIRST
        const rateLimitCheck = await checkRateLimit(env, ip)
        if (!rateLimitCheck.allowed) {
          return errorResponse(rateLimitCheck.message || 'Too many requests', 429)
        }
        
        const { key, deviceId: providedDeviceId } = await request.json()

        if (!key) {
          await incrementFailedAttempt(env, ip)
          return errorResponse('Key là bắt buộc')
        }

        if (!validateKeyFormat(key)) {
          await incrementFailedAttempt(env, ip)
          return errorResponse('Key không đúng định dạng (phải là 9 chữ số)')
        }

        // Generate device ID from request if not provided
        const deviceId = providedDeviceId || generateDeviceId(request)

        // Check if key exists in database (9-digit keys are stored as-is, not uppercased)
        const keyRecord = await env.DB.prepare(
          'SELECT * FROM auth_keys WHERE key_hash = ?'
        ).bind(key).first()

        if (!keyRecord) {
          await incrementFailedAttempt(env, ip)
          return errorResponse('Key không tồn tại trong hệ thống', 401)
        }

        // Check if key is already used with different device
        if (keyRecord.is_used && keyRecord.device_id !== deviceId) {
          await incrementFailedAttempt(env, ip)
          return errorResponse('Key này đã được sử dụng với thiết bị khác', 403)
        }

        // Mark key as used
        await env.DB.prepare(
          'UPDATE auth_keys SET is_used = 1, device_id = ?, used_at = datetime("now") WHERE key_hash = ?'
        ).bind(deviceId, key).run()

        // Log usage for analytics
        await env.DB.prepare(
          'INSERT INTO usage_logs (key_hash, device_id, ip_address, user_agent, timestamp) VALUES (?, ?, ?, ?, datetime("now"))'
        ).bind(
          key,
          deviceId,
          ip,
          request.headers.get('User-Agent') || 'Unknown'
        ).run()

        // SUCCESS - Reset failed attempts for this IP
        await resetFailedAttempts(env, ip)

        return jsonResponse({
          success: true,
          message: 'Key hợp lệ và đã được xác thực thành công',
          deviceId
        })
      }

      // Route: GET /auth - Check key status
      if (path === '/auth' && request.method === 'GET') {
        const key = url.searchParams.get('key')

        if (!key) {
          return errorResponse('Vui lòng cung cấp key')
        }

        const keyRecord = await env.DB.prepare(
          'SELECT is_used, device_id, created_at, used_at FROM auth_keys WHERE key_hash = ?'
        ).bind(key).first()

        if (!keyRecord) {
          return errorResponse('Key không tồn tại', 404)
        }

        return jsonResponse({
          success: true,
          used: keyRecord.is_used === 1,
          deviceId: keyRecord.device_id,
          createdAt: keyRecord.created_at,
          usedAt: keyRecord.used_at
        })
      }

      // Route: POST /keys - Create new key (admin only)
      if (path === '/keys' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return errorResponse('Unauthorized', 401)
        }

        const { keys, description } = await request.json()

        if (!Array.isArray(keys) || keys.length === 0) {
          return errorResponse('Danh sách keys không hợp lệ')
        }

        // Validate all keys
        for (const key of keys) {
          if (!validateKeyFormat(key)) {
            return errorResponse(`Key không hợp lệ: ${key}`)
          }
        }

        // Insert keys to database (9-digit keys are stored as-is)
        for (const key of keys) {
          await env.DB.prepare(
            'INSERT OR IGNORE INTO auth_keys (key_hash, description, created_at) VALUES (?, ?, datetime("now"))'
          ).bind(key, description || 'Bulk import').run()
        }

        return jsonResponse({
          success: true,
          message: `Đã thêm ${keys.length} keys thành công`,
          count: keys.length
        })
      }

      // Route: GET /stats - Get usage statistics
      if (path === '/stats' && request.method === 'GET') {
        const stats = await env.DB.prepare(`
          SELECT 
            COUNT(*) as total_keys,
            SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_keys,
            COUNT(DISTINCT device_id) as unique_devices
          FROM auth_keys
        `).first()

        return jsonResponse({
          success: true,
          stats
        })
      }

      // Route not found
      return errorResponse('Endpoint không tồn tại', 404)

    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse('Lỗi server nội bộ', 500)
    }
  },
}