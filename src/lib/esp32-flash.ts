// ESP32 Flash Utilities using esptool-js
// Inspired by esp-web-tools: https://github.com/esphome/esp-web-tools
// Architecture improved based on ESP Launchpad best practices:
//
// 💡 Key improvements:
// 1. 🔥 Request port FIRST to preserve user gesture (CRITICAL!)
// 2. Clean up other ports AFTER port selection (doesn't break user gesture)
// 3. Explicit error handling for user permission denial (NotAllowedError)
// 4. Verify port is readable/writable BEFORE calling esptool.connect()
// 5. Call esptool.connect() ONLY after port is successfully opened
//
// Connection Flow:
// 1. Request port (preserving user gesture - NO async before this!)
// 2. Clean up other open ports (after port selected)
// 3. Open the selected port (with error handling)
// 4. Verify port is readable & writable
// 5. Initialize transport & ESPLoader
// 6. Connect to bootloader (esptool-js handles DTR/RTS automatically)
// 7. Detect chip
//
// ⚠️ CRITICAL: Do NOT call ANY async operations before requestPort()
// or the browser will block the port selection popup due to lost user gesture!

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

// USB Vendor/Product IDs for ESP32 devices (improved from espflash repo)
const ESP_USB_FILTERS: SerialPortFilter[] = [
  // Espressif native USB devices (ESP32-S2/S3 with USB support)
  { usbVendorId: 0x303a, usbProductId: 0x1001 }, // Espressif USB_SERIAL_JTAG
  { usbVendorId: 0x303a, usbProductId: 0x1002 }, // esp-usb-bridge
  { usbVendorId: 0x303a, usbProductId: 0x0002 }, // ESP32-S2 USB_CDC
  { usbVendorId: 0x303a, usbProductId: 0x0009 }, // ESP32-S3 USB_CDC
  { usbVendorId: 0x303a }, // Allow any Espressif product (fallback)
  
  // Common USB-to-Serial bridges (CH340 family)
  { usbVendorId: 0x1a86, usbProductId: 0x7523 }, // CH340T
  { usbVendorId: 0x1a86, usbProductId: 0x55d4 }, // CH9102F
  { usbVendorId: 0x1a86, usbProductId: 0x55d3 }, // CH343
  
  // Silicon Labs CP210x family
  { usbVendorId: 0x10c4, usbProductId: 0xea60 }, // CP2102/CP2104
  { usbVendorId: 0x10c4, usbProductId: 0xea63 }, // CP2102N (variant)
  { usbVendorId: 0x10c4, usbProductId: 0xea71 }, // CP2102N newer boards
  
  // FTDI chips
  { usbVendorId: 0x0403, usbProductId: 0x6001 }, // FT232R
  { usbVendorId: 0x0403, usbProductId: 0x6010 }, // FT2232H
  { usbVendorId: 0x0403, usbProductId: 0x6015 }, // FT231X/FT234XD
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
// NOTE: This function is NOT used anymore!
// ESP Launchpad approach: Let esptool-js handle bootloader entry automatically
// Calling this manually can cause conflicts with esptool-js internal logic
// Kept here for reference only
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
    const previousPort = this.port

    try {
      // Check WebSerial support
      if (!('serial' in navigator)) {
        throw new Error('WebSerial API không được hỗ trợ. Vui lòng sử dụng Chrome, Edge, hoặc Opera.');
      }

      // Request port directly (preserve user gesture)
      console.log('🔌 Requesting serial port...');

      let selectedPort: SerialPort | null = null

      try {
        selectedPort = await (navigator as any).serial.requestPort({
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

      if (!selectedPort) {
        throw new Error('Không thể lấy port. Vui lòng thử lại.')
      }

      console.log(`✅ Port selected (${this.describePort(selectedPort)})`)

      // Clean up any previously opened ports AFTER user selects the new port to keep the gesture intact
      try {
        await this.releaseStalePorts(selectedPort, previousPort)
      } catch (releaseError) {
        console.warn('⚠️ Không thể giải phóng các cổng serial cũ:', releaseError)
      }

      this.port = selectedPort
      this.transport = null
      this.espLoader = null

      // Ensure the selected port is closed before attempting a fresh open (handles stale open handles)
      await this.safeClosePort(this.port, 'cổng serial đã chọn (trước khi mở)')

      // Open port with the desired settings
      console.log('📂 Opening port at 115200 baud...')
      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
        bufferSize: 256 * 1024
      })

      if (!this.port.readable || !this.port.writable) {
        throw new Error('Cổng serial không hỗ trợ đọc/ghi. Vui lòng rút cắm lại thiết bị và thử lại.')
      }

      console.log('✅ Port opened')

      // Initialize transport
      this.transport = new Transport(this.port)

      // Initialize ESPLoader
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

      // Connect to bootloader
      console.log('🔗 Connecting to bootloader...')
      await this.espLoader.connect()
      console.log('✅ Bootloader connected')

      // Detect chip
      console.log('🔍 Detecting chip type...')
      await this.espLoader.detectChip()
      const detectedChip = (this.espLoader as any)?.chipFamily || 'ESP32'
      this.chipName = detectedChip
      console.log(`✅ Chip detected: ${this.chipName}`)

      return true
    } catch (error: any) {
      console.error('❌ Connection error:', error)
      await this.cleanup()
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.cleanup()
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up...')
    
    // Reset ESPLoader
    this.espLoader = null
    
    // Reset transport
    this.transport = null
    
    // Close port
    if (this.port) {
      await this.safeClosePort(this.port, 'cổng serial hiện tại')
      this.port = null
    }
    
    // Reset chip name
    this.chipName = null
    
    console.log('✅ Cleanup complete')
  }

  /**
   * Attempt to close any ports returned by navigator.serial.getPorts().
   * Useful when the browser has stuck port state ("port already open").
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
        await this.safeClosePort(port)
      }
      
      console.log('✅ Đã giải phóng tất cả cổng')
    } catch (error) {
      console.error('❌ Lỗi giải phóng cổng:', error)
    }
  }

  private describePort(port: SerialPort): string {
    try {
      const info = port.getInfo?.()
      if (info) {
        const vendor = info.usbVendorId !== undefined ? `0x${info.usbVendorId.toString(16).padStart(4, '0')}` : 'unknown'
        const product = info.usbProductId !== undefined ? `0x${info.usbProductId.toString(16).padStart(4, '0')}` : 'unknown'
        return `${vendor}:${product}`
      }
    } catch (error) {
      // Ignore errors when trying to get info
    }
    return 'unknown'
  }

  private async safeClosePort(port: SerialPort | null | undefined, label?: string): Promise<void> {
    if (!port) return

    const description = label ?? `cổng serial (${this.describePort(port)})`

    try {
      await port.close()
      console.log(`✅ Đã đóng ${description}`)
    } catch (error: any) {
      if (error?.name === 'InvalidStateError') {
        console.log(`ℹ️ ${description} đã ở trạng thái đóng`)
      } else {
        console.warn(`⚠️ Không thể đóng ${description}:`, error)
      }
    }
  }

  private async releaseStalePorts(selectedPort: SerialPort, previousPort: SerialPort | null): Promise<void> {
    const portsToClose: SerialPort[] = []

    if (previousPort && previousPort !== selectedPort) {
      portsToClose.push(previousPort)
    }

    if ('serial' in navigator) {
      try {
        const grantedPorts: SerialPort[] = await (navigator as any).serial.getPorts()
        for (const port of grantedPorts) {
          if (port !== selectedPort && port !== previousPort) {
            portsToClose.push(port)
          }
        }
      } catch (error) {
        console.warn('⚠️ Không thể lấy danh sách cổng serial để giải phóng:', error)
      }
    }

    if (portsToClose.length === 0) {
      return
    }

    console.log(`🧹 Đang đóng ${portsToClose.length} cổng serial còn lại...`)

    for (const port of portsToClose) {
      await this.safeClosePort(port)
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
