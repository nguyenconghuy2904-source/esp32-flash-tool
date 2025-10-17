import React from 'react';

interface DeviceConnectionProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  status: string;
}

const DeviceConnection: React.FC<DeviceConnectionProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  status
}) => {
  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <div>
            <h3 className="text-lg font-bold text-primary">Kết nối ESP32</h3>
            <p className="text-sm text-gray-600">
              {isConnected ? '✅ Đã kết nối' : '🔌 Chưa kết nối'}
            </p>
          </div>
        </div>
        
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Kết nối thiết bị
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Ngắt kết nối
          </button>
        )}
      </div>
      
      {status && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-700">{status}</p>
        </div>
      )}
    </div>
  );
};

export default DeviceConnection;
