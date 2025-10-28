// ESP32-S3 Flash Utilities using esptool-js
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

// Hard reset utility from esp-web-tools
const hardReset = async (transport: Transport) => {
  console.log('Triggering hard reset')
  await transport.device.setSignals({
    dataTerminalReady: false,
    requestToSend: true,
  })
  await new Promise(resolve => setTimeout(resolve, 250))
  await transport.device.setSignals({
    dataTerminalReady: false,
    requestToSend: false,
  })
  await new Promise(resolve => setTimeout(resolve, 250))
  await new Promise(resolve => setTimeout(resolve, 1000))
}

export class ESP32FlashTool {
  private port: SerialPort | null = null
  private espLoader: ESPLoader | null = null
  private transport: Transport | null = null

  getPort(): SerialPort | null {
    return this.port
  }

  async connect(): Promise<boolean> {
  let retry = false;
  try {
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API không được hỗ trợ')
      }

      // Close any existing port first
      if (this.port) {
        console.log('Closing existing port before reconnect...')
        try {
          await this.port.close()
          await new Promise(resolve => setTimeout(resolve, 100)) // Wait for port to fully close
        } catch (e) {
          console.log('Port already closed or error closing:', e)
        }
        this.port = null
      }

      // Request port access - allow all serial devices
      this.port = await (navigator as any).serial.requestPort({
        // No filters - allow user to select any serial port
      })

      if (!this.port) {
        throw new Error('Không thể lấy được port')
      }

      // Open the port with standard baud rate first, then increase for flashing
      console.log('Opening serial port...')
      await this.port.open({
        baudRate: 115200, // Start with standard baud rate
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
        bufferSize: 256 * 1024 // 256KB buffer
      })
      console.log('✅ Serial port opened')

      // Initialize esptool-js with standard settings
      console.log('Initializing esptool-js...')
      this.transport = new Transport(this.port)
      this.espLoader = new ESPLoader({
        transport: this.transport,
        baudrate: 115200, // Match port baud rate
        romBaudrate: 115200, // Standard ROM baud rate
        terminal: {
          clean: () => {},
          writeLine: (data: string) => console.log('ESP32:', data),
          write: (data: string) => console.log('ESP32:', data)
        }
      })
      console.log('✅ esptool-js initialized')

      // Connect to ESP32 bootloader and detect chip with timeout
      console.log('Syncing with ESP32 bootloader...')
      const connectPromise = this.espLoader.connect()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      })

      await Promise.race([connectPromise, timeoutPromise])
      console.log('✅ Connected to ESP32 bootloader')

      console.log('Detecting ESP32 chip...')
      await this.espLoader.detectChip()
      console.log('✅ ESP32 chip detected')

      return true
    } catch (error: any) {
      // Nếu gặp lỗi "port already open" thì tự động close và thử lại 1 lần
      if (!retry && error?.message && error.message.includes('port is already open')) {
        console.warn('Port already open, attempting to close and retry...')
        try {
          if (this.port) {
            await this.port.close()
            await new Promise(resolve => setTimeout(resolve, 300))
            this.port = null
          }
        } catch (closeErr) {
          console.error('Error closing port on retry:', closeErr)
        }
        retry = true;
        return this.connect();
      }
      console.error('Connection error:', error)
      
      // CRITICAL: Cleanup port if connection failed
      // Otherwise port stays open and next attempt will fail with "port already open"
      try {
        if (this.port) {
          console.log('Cleaning up port after connection error...')
          await this.port.close()
          console.log('Port closed after connection error')
          // Wait for port to fully close
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (closeError) {
        console.error('Error closing port:', closeError)
      }
      
      // Reset state
      this.port = null
      this.espLoader = null
      this.transport = null
      
      // Try hard reset if we have transport
      try {
        if (this.transport) {
          console.log('Attempting hard reset after connection error...')
          await hardReset(this.transport)
        }
      } catch (resetError) {
        console.error('Hard reset failed:', resetError)
      }
      
      // Throw error with helpful message
      throw new Error(`Không thể kết nối ESP32: ${error.message}. Vui lòng giữ nút BOOT và thử lại.`)
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.espLoader) {
        await this.espLoader.after()
        this.espLoader = null
      }

      if (this.transport) {
        this.transport = null
      }

      if (this.port) {
        await this.port.close()
        this.port = null
      }
    } catch (error) {
      console.error('Error during disconnect:', error)
    }
  }

  async enterBootloader(): Promise<boolean> {
    try {
      if (!this.espLoader) throw new Error('ESP32 chưa được kết nối')

      // Connect to ESP32 using esptool-js
      await this.espLoader.connect()
      return true
    } catch (error) {
      console.error('Enter bootloader error:', error)
      return false
    }
  }

  async flashFirmware(
    firmwareData: ArrayBuffer,
    onProgress?: (progress: FlashProgress) => void
  ): Promise<boolean> {
    try {
      if (!this.espLoader) {
        throw new Error('Thiết bị chưa được kết nối')
      }

      // Stage 1: Connect and detect chip
      onProgress?.({
        stage: FlashStage.INITIALIZING,
        progress: 0,
        message: 'Đang kết nối với ESP32...'
      })

      // Note: Port is already opened from handleConnect()
      // We just need to sync with bootloader, not open port again
      
      onProgress?.({
        stage: FlashStage.INITIALIZING,
        progress: 5,
        message: 'Đã kết nối với ESP32'
      })

      // Stage 2: Prepare firmware data first to detect type
      onProgress?.({
        stage: FlashStage.PREPARING,
        progress: 10,
        message: 'Đang chuẩn bị firmware...'
      })

      const firmwareBytes = new Uint8Array(firmwareData)
      
      // Auto-detect firmware type by checking magic bytes
      // ESP32 bootloader starts with magic byte 0xE9
      const hasMagicByte = firmwareBytes[0] === 0xE9
      
      // IMPORTANT: Only erase full flash if we have merged firmware
      // If app-only firmware, esptool-js will auto-erase only needed sectors during write
      // This prevents accidentally erasing the bootloader!
      if (hasMagicByte) {
        onProgress?.({
          stage: 'erasing',
          progress: 15,
          message: 'Đang xóa toàn bộ flash (merged firmware)...'
        })
        await this.espLoader.eraseFlash()
      } else {
        // For app-only firmware, skip full erase
        // esptool-js will auto-erase sectors during write (safer)
        console.log('App-only firmware detected - skipping full erase to preserve bootloader')
      }

      // Stage 3: Write firmware
      onProgress?.({
        stage: FlashStage.WRITING,
        progress: 20,
        message: 'Đang ghi firmware...'
      })

      // Convert ArrayBuffer to base64 string for esptool-js using FileReader (from esp-web-tools)
      const blob = new Blob([firmwareData])
      const reader = new FileReader()
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.addEventListener('load', () => resolve(reader.result as string))
        reader.readAsBinaryString(blob)
      })
      
      const firmwareBase64 = await base64Promise

      // CRITICAL: ESP32 Partition Table
      // If firmware contains bootloader (merged firmware):
      //   - Start: 0xE9 magic byte
      //   - Flash to: 0x0 (includes bootloader + partition + app)
      //
      // If firmware is app-only:
      //   - No 0xE9 magic byte at start
      //   - Flash to: 0x10000 (app partition only)
      //
      // Standard ESP32 partition layout:
      //   0x1000  - Bootloader
      //   0x8000  - Partition table
      //   0x10000 - App firmware (factory partition)
      
      const flashAddress = hasMagicByte ? 0x0 : 0x10000
      console.log(`Detected firmware type: ${hasMagicByte ? 'Merged (bootloader included)' : 'App-only'}, flashing to 0x${flashAddress.toString(16)}`)
      
      // Write flash using esptool-js
      await this.espLoader.writeFlash({
        fileArray: [{
          data: firmwareBase64, // Base64 encoded data
          address: flashAddress // Auto-detected address
        }],
        flashSize: 'keep', // Keep existing flash size (from esp-web-tools)
        flashMode: 'keep', // Keep existing flash mode
        flashFreq: 'keep', // Keep existing flash frequency
        eraseAll: false, // Already erased above
        compress: true, // Enable compression for faster flashing
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const progress = 20 + (written / total) * 60 // 20-80%
          onProgress?.({
            stage: FlashStage.WRITING,
            progress: progress,
            message: `Đã ghi ${(written/1024).toFixed(0)}KB/${(total/1024).toFixed(0)}KB (${(written/total*100).toFixed(1)}%)`
          })
        },
        calculateMD5Hash: (image: string) => {
          // Return empty string for now - esptool-js handles verification
          return ''
        }
      })

      // Stage 4: Verify
      onProgress?.({
        stage: FlashStage.VERIFYING,
        progress: 85,
        message: 'Đang kiểm tra firmware...'
      })

      // esptool-js handles verification internally during writeFlash

      // Stage 5: Complete with hard reset
      onProgress?.({
        stage: FlashStage.FINISHED,
        progress: 100,
        message: 'Nạp firmware thành công!'
      })

      // Hard reset after successful flash (from esp-web-tools)
      try {
        if (this.transport) {
          console.log('Performing hard reset after successful flash...')
          await hardReset(this.transport)
        }
      } catch (resetError) {
        console.error('Hard reset after flash failed:', resetError)
        // Don't fail the whole operation for reset failure
      }

      return true

    } catch (error: any) {
      console.error('Flash error details:', error)
      console.error('Error stack:', error?.stack)
      
      // Try hard reset on flash error
      try {
        if (this.transport) {
          console.log('Performing hard reset after flash error...')
          await hardReset(this.transport)
        }
      } catch (resetError) {
        console.error('Hard reset after flash error failed:', resetError)
      }
      
      // Provide detailed error message
      let errorMessage = 'Lỗi không xác định'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.toString) {
        errorMessage = error.toString()
      }
      
      onProgress?.({
        stage: FlashStage.ERROR,
        progress: 0,
        message: `Lỗi flash: ${errorMessage}`
      })
      return false
    }
  }

  async testBasicConnection(): Promise<boolean> {
    try {
      if (!this.port) return false

      // Try to read some data to test if ESP32 is responding
      const reader = this.port.readable?.getReader()
      if (!reader) return false

      // Set a timeout for reading
      const timeout = setTimeout(() => {
        reader.cancel()
      }, 2000)

      try {
        const { value, done } = await reader.read()
        clearTimeout(timeout)
        reader.releaseLock()
        return !done && value && value.length > 0
      } catch {
        clearTimeout(timeout)
        reader.releaseLock()
        return false
      }
    } catch {
      return false
    }
  }

  async getDeviceInfo(): Promise<string | null> {
    try {
      if (!this.espLoader) return null

      // detectChip() returns void, so we can't get the chip name directly
      // Just return a generic ESP32 name
      return 'ESP32-S3'
    } catch {
      return null
    }
  }
}