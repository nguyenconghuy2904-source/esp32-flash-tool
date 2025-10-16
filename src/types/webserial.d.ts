// Type definitions for Web Serial API
declare global {
  interface Navigator {
    serial: Serial
  }

  interface Serial extends EventTarget {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
    getPorts(): Promise<SerialPort[]>
  }

  interface SerialPortRequestOptions {
    filters?: SerialPortFilter[]
  }

  interface SerialPortFilter {
    usbVendorId?: number
    usbProductId?: number
  }

  interface SerialPort extends EventTarget {
    readonly readable: ReadableStream<Uint8Array> | null
    readonly writable: WritableStream<Uint8Array> | null
    
    open(options: SerialOptions): Promise<void>
    close(): Promise<void>
    
    getInfo(): SerialPortInfo
    getSignals(): Promise<SerialInputSignals>
    setSignals(signals: SerialOutputSignals): Promise<void>
  }

  interface SerialOptions {
    baudRate: number
    dataBits?: number
    stopBits?: number
    parity?: 'none' | 'even' | 'odd'
    bufferSize?: number
    flowControl?: 'none' | 'hardware'
  }

  interface SerialPortInfo {
    usbVendorId?: number
    usbProductId?: number
  }

  interface SerialInputSignals {
    dataCarrierDetect: boolean
    clearToSend: boolean
    ringIndicator: boolean
    dataSetReady: boolean
  }

  interface SerialOutputSignals {
    dataTerminalReady?: boolean
    requestToSend?: boolean
    break?: boolean
  }
}

export {};