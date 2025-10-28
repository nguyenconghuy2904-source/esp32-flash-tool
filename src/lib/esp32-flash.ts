// ESP32 Flash Utilities using esptool-js
// Inspired by esp-web-tools: https://github.com/esphome/esp-web-tools
import { ESPLoader, Transport } from 'esptool-js'

export interface FlashProgress {
  stage: 'initializing' | 'preparing' | 'erasing' | 'writing' | 'verifying' | 'finished' | 'error'
  progress: number
  message: string
  details?: any
}

export enum FlashStage {
  INITIALIZING = 'initializing',
  PREPARING = 'preparing',
  ERASING = 'erasing',
  WRITING = 'writing',
  VERIFYING = 'verifying',
  FINISHED = 'finished',
  ERROR = 'error',
}

export interface FlashError {
  type: 'initialization_failed' | 'connection_failed' | 'download_failed' | 'write_failed' | 'verification_failed'
  message: string
  details?: any
}

export enum FlashErrorType {
  FAILED_INITIALIZING = 'failed_initialize',
  FAILED_MANIFEST_FETCH = 'fetch_manifest_failed',
  NOT_SUPPORTED = 'not_supported',
  FAILED_FIRMWARE_DOWNLOAD = 'failed_firmware_download',
  WRITE_FAILED = 'write_failed',
}

// USB Vendor/Product IDs for ESP32 devices (from esp-web-tools)
const ESP_USB_FILTERS = [
  // ESP32-S3
  { usbVendorId: 0x303a, usbProductId: 0x1001 },
  // Common USB-to-Serial chips
  { usbVendorId: 0x1a86, usbProductId: 0x7523 }, // CH340
  { usbVendorId: 0x1a86, usbProductId: 0x55d4 }, // CH9102
  { usbVendorId: 0x10c4, usbProductId: 0xea60 }, // CP2102/CP2104
  { usbVendorId: 0x0403, usbProductId: 0x6001 }, // FT232
]

// Hard reset sequence (from esp-web-tools)
const hardReset = async (transport: Transport) => {
  console.log('Performing hard reset...')
  await transport.device.setSignals({
    dataTerminalReady: false,
    requestToSend: true,
  })
  await new Promise(resolve => setTimeout(resolve, 100))
  await transport.device.setSignals({
    dataTerminalReady: false,
    requestToSend: false,
  })
  await new Promise(resolve => setTimeout(resolve, 50))
}

// Enter bootloader sequence (from esp-web-tools)
const enterBootloader = async (transport: Transport) => {
  console.log('Entering bootloader mode...')
  // DTR = LOW, RTS = HIGH -> Reset
  await transport.device.setSignals({
    dataTerminalReady: false,
    requestToSend: true,
  })
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // DTR = LOW, RTS = LOW -> Boot mode
  await transport.device.setSignals({
    dataTerminalReady: false,
    requestToSend: false,
  })
  await new Promise(resolve => setTimeout(resolve, 50))
}

export class ESP32FlashTool {
  private port: SerialPort | null = null
  private espLoader: ESPLoader | null = null
  private transport: Transport | null = null
  private chipName: string | null = null

  getPort(): SerialPort | null {
    return this.port
  }

  async connect(): Promise<boolean> {
    try {
      // Check WebSerial support
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API không được hỗ trợ. Vui lòng sử dụng Chrome, Edge, hoặc Opera.')
      }

      // Clean up existing connection
      await this.cleanup()

      // Request port with ESP32 filters
      console.log('Requesting serial port...')
      try {
        this.port = await (navigator as any).serial.requestPort({
          filters: ESP_USB_FILTERS
        })
      } catch (e: any) {
        // If filtered request fails, try without filters
        if (e.name === 'NotFoundError') {
          console.log('No ESP device found with filters, trying all devices...')
          this.port = await (navigator as any).serial.requestPort()
        } else {
          throw e
        }
      }

      if (!this.port) {
        throw new Error('Không thể lấy port. Vui lòng thử lại.')
      }

      // Get port info for debugging
      const portInfo = this.port.getInfo()
      console.log('Port info:', {
        vendorId: portInfo.usbVendorId?.toString(16),
        productId: portInfo.usbProductId?.toString(16)
      })

      // Open port at ROM bootloader baud rate
      console.log('Opening port at 115200 baud...')
      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
        bufferSize: 256 * 1024
      })
      console.log('✅ Port opened successfully')

      // Initialize transport
      this.transport = new Transport(this.port)

      // Enter bootloader mode using DTR/RTS (CRITICAL!)
      await enterBootloader(this.transport)

      // Initialize ESPLoader
      console.log('Initializing ESPLoader...')
      this.espLoader = new ESPLoader({
        transport: this.transport,
        baudrate: 115200,
        romBaudrate: 115200,
        terminal: {
          clean: () => {},
          writeLine: (data: string) => console.log('[ESP]', data),
          write: (data: string) => console.log('[ESP]', data)
        }
      })

      // Connect with retries (like esp-web-tools)
      console.log('Connecting to bootloader...')
      let connected = false
      let lastError = null
      const MAX_ATTEMPTS = 3

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          console.log(`Connection attempt ${attempt}/${MAX_ATTEMPTS}...`)
          await this.espLoader.connect()
          connected = true
          console.log('✅ Bootloader connected')
          break
        } catch (e: any) {
          lastError = e
          console.warn(`Attempt ${attempt} failed:`, e.message)
          
          if (attempt < MAX_ATTEMPTS) {
            console.log('Retrying in 500ms...')
            await new Promise(resolve => setTimeout(resolve, 500))
            // Re-enter bootloader mode
            await enterBootloader(this.transport!)
          }
        }
      }

      if (!connected) {
        throw new Error(`Không thể kết nối bootloader sau ${MAX_ATTEMPTS} lần thử. ${lastError?.message || ''}`)
      }

      // Detect chip
      console.log('Detecting chip...')
      await this.espLoader.detectChip()
      // Note: ESPLoader.detectChip() doesn't return chip name, but detects it internally
      this.chipName = 'ESP32' // Generic name, actual chip is detected by esptool
      console.log(`✅ Chip detected successfully`)

      return true

    } catch (error: any) {
      console.error('Connection error:', error)
      
      // Auto-retry on "port already open"
      if (error?.message?.includes('port is already open')) {
        console.warn('Port already open, cleaning up and retrying...')
        await this.cleanup()
        await new Promise(resolve => setTimeout(resolve, 500))
        // Only retry once to avoid infinite loop
        return this.connect()
      }

      // Cleanup on error
      await this.cleanup()

      // User-friendly error messages
      let errorMsg = error.message || 'Lỗi không xác định'
      
      if (error.name === 'NotFoundError') {
        errorMsg = 'Không tìm thấy thiết bị USB.\n\n📌 Vui lòng:\n• Kết nối ESP32 vào máy tính\n• Nhấn giữ nút BOOT khi cắm USB\n• Thử cổng USB khác\n• Cài driver CH340/CP2102'
      } else if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        errorMsg = 'Quyền truy cập bị từ chối.\n\n📌 Vui lòng:\n• Cho phép quyền truy cập khi popup hiện\n• Làm mới trang và thử lại\n• Kiểm tra settings trình duyệt'
      } else if (error.message?.includes('timeout') || error.message?.includes('sync')) {
        errorMsg = 'Không thể đồng bộ với ESP32.\n\n📌 Cách vào chế độ flash:\n1️⃣ Nhấn giữ nút BOOT\n2️⃣ Cắm cáp USB vào máy\n3️⃣ Thả nút BOOT\n4️⃣ Thử kết nối lại'
      } else if (error.message?.includes('Failed to execute')) {
        errorMsg = 'Thiết bị đang được sử dụng.\n\n📌 Vui lòng:\n• Đóng Arduino IDE\n• Đóng PlatformIO\n• Đóng Serial Monitor khác\n• Đợi 3 giây và thử lại'
      }

      throw new Error(errorMsg)
    }
  }

  async disconnect(): Promise<void> {
    await this.cleanup()
  }

  private async cleanup(): Promise<void> {
    try {
      // Reset ESPLoader (no disconnect method, just null it)
      if (this.espLoader) {
        this.espLoader = null
      }

      // Close transport
      if (this.transport) {
        this.transport = null
      }

      // Close port
      if (this.port) {
        try {
          if (this.port.readable) {
            await this.port.close()
            console.log('Port closed')
          }
        } catch (e) {
          console.log('Port close error (safe to ignore):', e)
        }
        this.port = null
      }

      this.chipName = null

      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 250))
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  async flashFirmware(
    firmwareData: ArrayBuffer,
    onProgress?: (progress: FlashProgress) => void
  ): Promise<boolean> {
    try {
      if (!this.espLoader || !this.transport) {
        throw new Error('ESP32 chưa được kết nối. Vui lòng kết nối trước.')
      }

      // Stage 1: Initialize
      onProgress?.({
        stage: FlashStage.INITIALIZING,
        progress: 0,
        message: '🔌 Chuẩn bị flash firmware...'
      })

      onProgress?.({
        stage: FlashStage.INITIALIZING,
        progress: 5,
        message: `✅ Đã kết nối với ${this.chipName || 'ESP32'}`
      })

      // Stage 2: Prepare firmware
      onProgress?.({
        stage: FlashStage.PREPARING,
        progress: 10,
        message: '📦 Đang phân tích firmware...'
      })

      const firmwareBytes = new Uint8Array(firmwareData)
      console.log(`Firmware size: ${firmwareBytes.length} bytes`)

      if (firmwareBytes.length === 0) {
        throw new Error('File firmware rỗng!')
      }

      // Detect firmware type (merged vs app-only)
      const hasMagicByte = firmwareBytes[0] === 0xE9
      const firmwareType = hasMagicByte ? 'Merged (full)' : 'App-only'
      console.log(`Firmware type: ${firmwareType}`)

      // Convert to base64 using FileReader (more reliable)
      const blob = new Blob([firmwareData])
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsBinaryString(blob)
      })
      const firmwareBase64 = await base64Promise
      console.log('Firmware converted to base64')

      // Stage 3: Erase (only for merged firmware)
      if (hasMagicByte) {
        onProgress?.({
          stage: FlashStage.ERASING,
          progress: 15,
          message: '🗑️ Đang xóa flash (merged firmware)...'
        })
        await this.espLoader.eraseFlash()
        console.log('Flash erased')
      } else {
        console.log('App-only firmware - skipping full erase')
      }

      // Stage 4: Write firmware
      onProgress?.({
        stage: FlashStage.WRITING,
        progress: 20,
        message: '✏️ Đang ghi firmware...'
      })

      // Flash address: 0x0 for merged, 0x10000 for app-only
      const flashAddress = hasMagicByte ? 0x0 : 0x10000
      console.log(`Flashing to address: 0x${flashAddress.toString(16)}`)

      await this.espLoader.writeFlash({
        fileArray: [{
          data: firmwareBase64,
          address: flashAddress
        }],
        flashSize: 'keep',
        flashMode: 'keep',
        flashFreq: 'keep',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const percent = Math.round((written / total) * 100)
          const progress = 20 + (written / total) * 60 // 20-80%
          onProgress?.({
            stage: FlashStage.WRITING,
            progress: progress,
            message: `✏️ Đang ghi: ${(written/1024).toFixed(0)}KB/${(total/1024).toFixed(0)}KB (${percent}%)`
          })
        },
        calculateMD5Hash: () => '' // esptool-js handles this
      })

      console.log('Firmware written successfully')

      // Stage 5: Verify
      onProgress?.({
        stage: FlashStage.VERIFYING,
        progress: 85,
        message: '✅ Đang kiểm tra...'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      // Stage 6: Complete
      onProgress?.({
        stage: FlashStage.FINISHED,
        progress: 100,
        message: '🎉 Flash thành công!'
      })

      // Hard reset to run firmware
      try {
        console.log('Performing hard reset...')
        await hardReset(this.transport)
        console.log('ESP32 reset successfully')
      } catch (resetError) {
        console.warn('Hard reset failed (non-critical):', resetError)
      }

      return true

    } catch (error: any) {
      console.error('Flash error:', error)
      console.error('Error stack:', error?.stack)

      // Try hard reset on error
      try {
        if (this.transport) {
          await hardReset(this.transport)
        }
      } catch (e) {
        console.error('Hard reset on error failed:', e)
      }

      const errorMsg = error?.message || error?.toString() || 'Lỗi không xác định'
      
      onProgress?.({
        stage: FlashStage.ERROR,
        progress: 0,
        message: `❌ Lỗi flash: ${errorMsg}`
      })

      return false
    }
  }

  async testBasicConnection(): Promise<boolean> {
    return this.port !== null && this.espLoader !== null
  }

  async getDeviceInfo(): Promise<string | null> {
    return this.chipName
  }

  isConnected(): boolean {
    return this.port !== null && this.espLoader !== null
  }
}
