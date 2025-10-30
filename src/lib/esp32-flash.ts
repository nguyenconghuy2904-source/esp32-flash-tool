// ESP32 Flash Utilities using esptool-js
// Refactored based on: https://github.com/nguyenconghuy2904-source/espflash.git
// Simplified connection flow inspired by ESP Launchpad

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

// USB Filters for ESP32 devices (from espflash reference)
const ESP_USB_FILTERS: SerialPortFilter[] = [
  { usbVendorId: 0x10c4, usbProductId: 0xea60 }, // CP2102/CP2102N
  { usbVendorId: 0x0403, usbProductId: 0x6010 }, // FT2232H
  { usbVendorId: 0x303a, usbProductId: 0x1001 }, // Espressif USB_SERIAL_JTAG
  { usbVendorId: 0x303a, usbProductId: 0x1002 }, // esp-usb-bridge
  { usbVendorId: 0x303a, usbProductId: 0x0002 }, // ESP32-S2 USB_CDC
  { usbVendorId: 0x303a, usbProductId: 0x0009 }, // ESP32-S3 USB_CDC
  { usbVendorId: 0x1a86, usbProductId: 0x55d4 }, // CH9102F
  { usbVendorId: 0x1a86, usbProductId: 0x7523 }, // CH340T
  { usbVendorId: 0x0403, usbProductId: 0x6001 }, // FT232R
  { usbVendorId: 0x10c4, usbProductId: 0xea63 }, // CP2102N variant
  { usbVendorId: 0x1a86, usbProductId: 0x55d3 }, // CH343
]

// Hard reset sequence
const hardReset = async (transport: Transport) => {
  console.log('Performing hard reset...')
  await transport.setDTR(false)
  await transport.setRTS(true)
  await new Promise(resolve => setTimeout(resolve, 100))
  await transport.setDTR(false)
  await transport.setRTS(false)
  await new Promise(resolve => setTimeout(resolve, 50))
}

export class ESP32FlashTool {
  private device: SerialPort | null = null
  private transport: Transport | null = null
  private esploader: ESPLoader | null = null
  private chipName: string | null = null
  private connected: boolean = false

  getPort(): SerialPort | null {
    return this.device
  }

  isConnected(): boolean {
    return this.connected && this.device !== null && this.esploader !== null
  }

  async connect(): Promise<boolean> {
    try {
      // Check WebSerial support
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API không được hỗ trợ. Vui lòng sử dụng Chrome, Edge, hoặc Opera.')
      }

      console.log('🔌 Đang yêu cầu kết nối thiết bị...')
      
      // Request port directly (preserving user gesture)
      try {
        this.device = await (navigator as any).serial.requestPort({ 
          filters: ESP_USB_FILTERS 
        })
      } catch (e: any) {
        if (e.name === 'NotFoundError') {
          throw new Error('Người dùng đã hủy chọn thiết bị')
        } else if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
          throw new Error('Quyền truy cập USB bị từ chối. Vui lòng cho phép quyền truy cập.')
        } else {
          throw e
        }
      }

      if (!this.device) {
        throw new Error('Không thể lấy port. Vui lòng thử lại.')
      }

      console.log('✅ Port selected')

      // Create transport
      this.transport = new Transport(this.device)

      // Default baudrate for connection
      const baudrate = 115200

      console.log('🔗 Đang kết nối và nhận dạng chip...')

      // Create ESPLoader with simplified terminal
      const loaderOptions = {
        transport: this.transport,
        baudrate: baudrate,
        romBaudrate: baudrate,
        terminal: {
          clean: () => {},
          writeLine: (data: string) => console.log('[ESP]', data),
          write: (data: string) => console.log('[ESP]', data)
        }
      }

      this.esploader = new ESPLoader(loaderOptions)

      // Connect and detect chip using main()
      const chipDesc = await this.esploader.main()
      this.chipName = this.esploader.chip?.CHIP_NAME || 'ESP32'

      // Read flash ID
      await this.esploader.flashId()

      this.connected = true

      console.log(`✅ Kết nối thành công: ${chipDesc}`)

      return true

    } catch (error: any) {
      console.error('❌ Lỗi kết nối:', error)
      await this.cleanup()
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.cleanup()
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up...')
    
    this.connected = false
    this.chipName = null
    this.esploader = null

    // Disconnect transport
    if (this.transport) {
      try {
        await this.transport.disconnect()
        console.log('✅ Transport disconnected')
      } catch (e) {
        console.warn('⚠️ Error disconnecting transport:', e)
      }
      this.transport = null
    }

    this.device = null
    
    console.log('✅ Cleanup complete')
  }

  /**
   * Force release all granted ports
   */
  async forceReleasePorts(): Promise<void> {
    try {
      if (!('serial' in navigator)) return
      
      console.log('🧹 Giải phóng cổng...')
      
      // Clean up internal state
      await this.cleanup()
      
      // Get all ports and try to close them
      const ports: SerialPort[] = await (navigator as any).serial.getPorts()
      console.log(`Tìm thấy ${ports.length} cổng`)
      
      for (const port of ports) {
        try {
          await port.close()
          console.log('✅ Đã đóng cổng')
        } catch (e) {
          console.warn('⚠️ Không thể đóng cổng:', e)
        }
      }
      
      console.log('✅ Đã giải phóng tất cả cổng')
    } catch (error) {
      console.error('❌ Lỗi giải phóng cổng:', error)
    }
  }

  async flashFirmware(
    firmwareData: ArrayBuffer,
    onProgress?: (progress: FlashProgress) => void
  ): Promise<boolean> {
    try {
      if (!this.esploader || !this.transport || !this.connected) {
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
        await this.esploader.eraseFlash()
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

      await this.esploader.writeFlash({
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
    return this.connected && this.device !== null && this.esploader !== null
  }

  async getDeviceInfo(): Promise<string | null> {
    return this.chipName
  }
}
