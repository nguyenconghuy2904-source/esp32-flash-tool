import React, { useState, useRef, useEffect } from 'react';

interface SerialMonitorProps {
  port: SerialPort | null;
  isConnected: boolean;
}

const SerialMonitor: React.FC<SerialMonitorProps> = ({ port, isConnected }) => {
  const [monitorEnabled, setMonitorEnabled] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const monitoringRef = useRef(false);

  // Stop monitoring when component unmounts or connection is lost
  useEffect(() => {
    if (!isConnected || !port) {
      stopMonitor();
    }
  }, [isConnected, port]);

  const startMonitor = async () => {
    if (!port || !isConnected) return;
    setMonitorEnabled(true);
    monitoringRef.current = true;
    setError(null);
    
    try {
      if (!port.readable) throw new Error('Thiết bị không hỗ trợ đọc dữ liệu');
      
      const textDecoder = new TextDecoder();
      readerRef.current = port.readable.getReader();
      
      while (monitoringRef.current && readerRef.current) {
        try {
          const { value, done } = await readerRef.current.read();
          if (done) break;
          if (value) {
            const text = textDecoder.decode(value);
            setOutput(prev => prev + text);
          }
        } catch (readError: any) {
          if (readError.name !== 'AbortError') {
            throw readError;
          }
          break;
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Không thể đọc dữ liệu: ' + err.message);
      }
      setMonitorEnabled(false);
      monitoringRef.current = false;
    }
  };

  const stopMonitor = async () => {
    monitoringRef.current = false;
    setMonitorEnabled(false);
    
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
    } catch (err: any) {
      // Ignore errors when stopping
      console.error('Error stopping monitor:', err);
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
    <div className="bg-accent-lightBlue border-2 border-accent-blue/30 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">📡 Serial Monitor</h2>
      
      {!isConnected ? (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-yellow-800 text-sm font-medium mb-4">
          ⚠️ Vui lòng kết nối thiết bị ở phần trên để sử dụng Monitor
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg font-medium shadow-md transition-colors ${monitorEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-primary text-white hover:bg-primary-dark'}`}
              onClick={monitorEnabled ? stopMonitor : startMonitor}
            >
              {monitorEnabled ? '⏸️ Tắt Monitor' : '▶️ Bật Monitor'}
            </button>
            <button
              className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary-dark font-medium shadow-md transition-colors"
              onClick={resetDevice}
            >
              🔄 Reset thiết bị
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium shadow-md transition-colors"
              onClick={() => setOutput('')}
            >
              🗑️ Xóa màn hình
            </button>
          </div>
          <div className="border-2 border-primary/20 rounded-lg bg-white p-3 h-96 overflow-y-auto font-mono text-sm text-primary shadow-inner whitespace-pre-wrap">
            {output || 'Chưa có dữ liệu từ thiết bị...'}
          </div>
        </>
      )}
      
      {error && <div className="mt-3 p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm font-medium">{error}</div>}
    </div>
  );
};

export default SerialMonitor;
