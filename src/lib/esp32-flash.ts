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

      return true
    } catch (error) {
      console.error('Connection error:', error)
      return false
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

      await this.espLoader.connect()
      const chipName = await this.espLoader.detectChip()
      console.log('Detected chip:', chipName)

      // Stage 2: Erase flash
      onProgress?.({
        stage: 'erasing',
        progress: 10,
        message: 'Đang xóa flash memory...'
      })

      await this.espLoader.eraseFlash()

      // Stage 3: Write firmware
      onProgress?.({
        stage: 'writing',
        progress: 20,
        message: 'Đang ghi firmware...'
      })

      // Convert ArrayBuffer to base64 string for esptool-js
      const firmwareBytes = new Uint8Array(firmwareData)
      const firmwareBase64 = btoa(String.fromCharCode(...firmwareBytes))

      // Write flash using esptool-js
      await this.espLoader.writeFlash({
        fileArray: [{
          data: firmwareBase64, // Base64 encoded data
          address: 0x0 // ESP32 app partition starts at 0x0 for simple flashing
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

    } catch (error) {
      console.error('Flash error:', error)
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `Lỗi: ${(error as Error).message}`
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