import React, { useState, useRef } from 'react';


const SerialMonitor: React.FC = () => {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [monitorEnabled, setMonitorEnabled] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const connectSerial = async () => {
    setError(null);
    try {
      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      setPort(selectedPort);
      setIsConnected(true);
    } catch (err: any) {
      setError('Không thể kết nối thiết bị: ' + err.message);
      setIsConnected(false);
    }
  };

  const startMonitor = async () => {
    if (!port) return;
    setMonitorEnabled(true);
    setError(null);
    try {
      if (!port.readable) throw new Error('Thiết bị không hỗ trợ đọc dữ liệu');
      const textDecoder = new TextDecoder();
      readerRef.current = port.readable.getReader();
      let monitorOutput = output;
      while (monitorEnabled && readerRef.current) {
        const { value, done } = await readerRef.current.read();
        if (done) break;
        if (value) {
          monitorOutput += textDecoder.decode(value);
          setOutput(monitorOutput);
        }
      }
    } catch (err: any) {
      setError('Không thể đọc dữ liệu: ' + err.message);
      setMonitorEnabled(false);
    }
  };

  const stopMonitor = async () => {
    setMonitorEnabled(false);
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      }
    } catch (err: any) {
      setError('Lỗi khi dừng monitor: ' + err.message);
    }
  };

  const disconnectSerial = async () => {
    setMonitorEnabled(false);
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      }
      if (port) {
        await port.close();
      }
      setIsConnected(false);
      setPort(null);
    } catch (err: any) {
      setError('Lỗi khi ngắt kết nối: ' + err.message);
    }
  };

  const resetDevice = async () => {
    if (!port) return;
    try {
      if (!port.writable) throw new Error('Thiết bị không hỗ trợ ghi dữ liệu');
      const writer = port.writable.getWriter();
      // Gửi ký tự reset (ví dụ: Ctrl+D hoặc Ctrl+C)
      await writer.write(new Uint8Array([0x04])); // Ctrl+D
      writer.releaseLock();
    } catch (err: any) {
      setError('Lỗi khi reset thiết bị: ' + err.message);
    }
  };

  return (
    <div className="bg-accent-lightBlue border-2 border-accent-blue/30 rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">📡 Serial Monitor</h2>
      <div className="flex gap-2 mb-4">
        {!isConnected ? (
          <button
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors"
            onClick={connectSerial}
          >
            🔌 Kết nối thiết bị
          </button>
        ) : (
          <>
            <button
              className={`px-4 py-2 rounded-lg font-medium shadow-md transition-colors ${monitorEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-primary text-white hover:bg-primary-dark'}`}
              onClick={monitorEnabled ? stopMonitor : startMonitor}
            >
              {monitorEnabled ? '⏸️ Tắt Monitor' : '▶️ Bật Monitor'}
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-md transition-colors"
              onClick={disconnectSerial}
            >
              ⚠️ Ngắt kết nối
            </button>
            <button
              className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary-dark font-medium shadow-md transition-colors"
              onClick={resetDevice}
            >
              🔄 Reset thiết bị
            </button>
          </>
        )}
      </div>
      <div className="border-2 border-primary/20 rounded-lg bg-white p-3 h-64 overflow-y-auto font-mono text-sm text-primary shadow-inner">
        {output || 'Chưa có dữ liệu từ thiết bị...'}
      </div>
      {error && <div className="mt-3 p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm font-medium">{error}</div>}
    </div>
  );
};

export default SerialMonitor;
