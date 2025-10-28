// API client for Cloudflare Workers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://esp32-flash-api.minizjp.workers.dev'

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
}

interface KeyValidationResponse {
  success: boolean
  message: string
  deviceId?: string
}

interface KeyStatusResponse {
  success: boolean
  used: boolean
  deviceId?: string
  createdAt?: string
  usedAt?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl // Use URL as-is for Cloudflare Workers
  }

  private async fetchApi<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async validateKey(key: string, deviceId?: string): Promise<KeyValidationResponse> {
    return this.fetchApi<KeyValidationResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify({ key, deviceId }),
    })
  }

  async checkKeyStatus(key: string): Promise<KeyStatusResponse> {
    return this.fetchApi<KeyStatusResponse>(`/auth?key=${encodeURIComponent(key)}`)
  }

  async getStats(): Promise<any> {
    return this.fetchApi('/stats')
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Helper functions for backward compatibility
export async function validateKey(key: string): Promise<boolean> {
  try {
    const response = await apiClient.validateKey(key)
    return response.success
  } catch (error) {
    console.error('Key validation error:', error)
    return false
  }
}

export async function validateKeyWithDevice(key: string, deviceId: string): Promise<KeyValidationResponse> {
  return apiClient.validateKey(key, deviceId)
}

// Device fingerprinting helper with localStorage persistence
export function generateDeviceFingerprint(): string {
  // CRITICAL: Use localStorage to keep deviceId stable across sessions
  // This ensures 1 key can be used multiple times on SAME device
  const STORAGE_KEY = 'esp32_device_id'
  
  // Check if we already have a stable device ID
  const existingDeviceId = localStorage.getItem(STORAGE_KEY)
  if (existingDeviceId) {
    console.log('Using existing device ID:', existingDeviceId)
    return existingDeviceId
  }
  
  // Generate new device fingerprint on first use
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    // Add random component to ensure uniqueness
    Math.random().toString(36).substring(2, 15)
  ].join('|')
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  const deviceId = `device-${Math.abs(hash).toString(16)}`
  
  // CRITICAL: Save to localStorage for persistence
  // This makes the device ID stable across browser restarts
  localStorage.setItem(STORAGE_KEY, deviceId)
  console.log('Generated new device ID:', deviceId)
  
  return deviceId
}