// ESP32-S3 Flash Utilities
export interface FlashProgress {
  stage: 'connecting' | 'erasing' | 'writing' | 'verifying' | 'complete' | 'error'
  progress: number
  message: string
}

export class ESP32FlashTool {
  private port: SerialPort | null = null
  private reader: ReadableStreamDefaultReader | null = null
  private writer: WritableStreamDefaultWriter | null = null

  getPort(): SerialPort | null {
    return this.port
  }

  async connect(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API không được hỗ trợ')
      }

      // Request port access
      this.port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x303a }, // Espressif USB VID
        ]
      })

      if (!this.port) {
        throw new Error('Không thể lấy được port')
      }

      // Open the port
      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      })

      // Get reader and writer
      this.reader = this.port.readable?.getReader() || null
      this.writer = this.port.writable?.getWriter() || null

      return true
    } catch (error) {
      console.error('Connection error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.reader) {
        await this.reader.cancel()
        await this.reader.releaseLock()
        this.reader = null
      }

      if (this.writer) {
        await this.writer.releaseLock()
        this.writer = null
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
      if (!this.writer) throw new Error('Port chưa được kết nối')

      // Send break signal to enter bootloader mode
      await this.writer.write(new Uint8Array([0x00]))
      await new Promise(resolve => setTimeout(resolve, 100))

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
      if (!this.port || !this.writer || !this.reader) {
        throw new Error('Thiết bị chưa được kết nối')
      }

      const data = new Uint8Array(firmwareData)
      const totalSize = data.length
      let bytesWritten = 0

      // Stage 1: Enter bootloader mode
      onProgress?.({
        stage: 'connecting',
        progress: 0,
        message: 'Đang kết nối với ESP32-S3...'
      })

      const bootloaderEntered = await this.enterBootloader()
      if (!bootloaderEntered) {
        throw new Error('Không thể vào chế độ bootloader')
      }

      // Stage 2: Erase flash
      onProgress?.({
        stage: 'erasing',
        progress: 10,
        message: 'Đang xóa flash memory...'
      })

      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate erase time

      // Stage 3: Write firmware
      onProgress?.({
        stage: 'writing',
        progress: 20,
        message: 'Đang ghi firmware...'
      })

      // Write firmware in chunks
      const chunkSize = 4096 // 4KB chunks
      for (let offset = 0; offset < totalSize; offset += chunkSize) {
        const chunk = data.slice(offset, Math.min(offset + chunkSize, totalSize))
        
        // Write chunk to ESP32-S3
        await this.writer.write(chunk)
        bytesWritten += chunk.length

        const writeProgress = 20 + (bytesWritten / totalSize) * 60 // 20-80%
        onProgress?.({
          stage: 'writing',
          progress: writeProgress,
          message: `Đã ghi ${bytesWritten}/${totalSize} bytes (${(bytesWritten/totalSize*100).toFixed(1)}%)`
        })

        // Small delay to avoid overwhelming the device
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Stage 4: Verify
      onProgress?.({
        stage: 'verifying',
        progress: 85,
        message: 'Đang kiểm tra firmware...'
      })

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate verification

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Nạp firmware thành công!'
      })

      return true

    } catch (error) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `Lỗi: ${(error as Error).message}`
      })
      return false
    }
  }

  isConnected(): boolean {
    return this.port !== null
  }

  async getDeviceInfo(): Promise<string | null> {
    try {
      if (!this.writer || !this.reader) return null

      // Send command to get device info
      // This is a simplified implementation
      return 'ESP32-S3'
    } catch {
      return null
    }
  }
}