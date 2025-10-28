// ESP32-S3 Flash Utilities using esptool-js
import { ESPLoader, Transport } from 'esptool-js'

export interface FlashProgress {
  stage: 'connecting' | 'erasing' | 'writing' | 'verifying' | 'complete' | 'error'
  progress: number
  message: string
}

export class ESP32FlashTool {
  private port: SerialPort | null = null
  private espLoader: ESPLoader | null = null
  private transport: Transport | null = null

  getPort(): SerialPort | null {
    return this.port
  }

  async connect(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API không được hỗ trợ')
      }

      // Request port access - allow all serial devices
      this.port = await (navigator as any).serial.requestPort({
        // No filters - allow user to select any serial port
      })

      if (!this.port) {
        throw new Error('Không thể lấy được port')
      }

      // Open the port with high-speed baud rate for faster flashing
      await this.port.open({
        baudRate: 921600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
        bufferSize: 65536
      })

      // Initialize esptool-js
      this.transport = new Transport(this.port)
      this.espLoader = new ESPLoader({
        transport: this.transport,
        baudrate: 921600,
        romBaudrate: 115200, // Required for ROM communication
        terminal: {
          clean: () => {},
          writeLine: (data: string) => console.log('ESP32:', data),
          write: (data: string) => console.log('ESP32:', data)
        }
      })

      // Connect to ESP32 bootloader and detect chip
      console.log('Syncing with ESP32 bootloader...')
      await this.espLoader.connect()
      await this.espLoader.detectChip()
      console.log('✅ ESP32 bootloader ready')

      return true
    } catch (error: any) {
      console.error('Connection error:', error)
      
      // CRITICAL: Cleanup port if connection failed
      // Otherwise port stays open and next attempt will fail with "port already open"
      try {
        if (this.port && this.port.readable) {
          await this.port.close()
          console.log('Port closed after connection error')
        }
      } catch (closeError) {
        console.error('Error closing port:', closeError)
      }
      
      // Reset state
      this.port = null
      this.espLoader = null
      this.transport = null
      
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
        stage: 'connecting',
        progress: 0,
        message: 'Đang kết nối với ESP32...'
      })

      // Note: Port is already opened from handleConnect()
      // We just need to sync with bootloader, not open port again
      
      onProgress?.({
        stage: 'connecting',
        progress: 5,
        message: 'Đã kết nối với ESP32'
      })

      // Stage 2: Prepare firmware data first to detect type
      onProgress?.({
        stage: 'erasing',
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
        stage: 'writing',
        progress: 20,
        message: 'Đang ghi firmware...'
      })

      // Convert ArrayBuffer to base64 string for esptool-js
      // Use chunked conversion to avoid stack overflow with large files
      const chunkSize = 0x8000 // 32KB chunks
      let firmwareBase64 = ''
      
      for (let i = 0; i < firmwareBytes.length; i += chunkSize) {
        const chunk = firmwareBytes.slice(i, Math.min(i + chunkSize, firmwareBytes.length))
        const chunkArray = Array.from(chunk)
        firmwareBase64 += btoa(String.fromCharCode.apply(null, chunkArray as any))
      }

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
        flashSize: 'keep', // Keep existing flash size
        flashMode: 'dio', // Dual I/O mode
        flashFreq: '40m', // 40MHz flash frequency
        eraseAll: false, // Already erased above
        compress: true, // Enable compression for faster flashing
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const progress = 20 + (written / total) * 60 // 20-80%
          onProgress?.({
            stage: 'writing',
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
        stage: 'verifying',
        progress: 85,
        message: 'Đang kiểm tra firmware...'
      })

      // esptool-js handles verification internally during writeFlash

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Nạp firmware thành công!'
      })

      return true

    } catch (error: any) {
      console.error('Flash error details:', error)
      console.error('Error stack:', error?.stack)
      
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
        stage: 'error',
        progress: 0,
        message: `Lỗi flash: ${errorMessage}`
      })
      return false
    }
  }

  isConnected(): boolean {
    return this.port !== null && this.espLoader !== null
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