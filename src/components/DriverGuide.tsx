import React, { useState } from 'react'

interface DriverGuideProps {
  onClose: () => void
}

export default function DriverGuide({ onClose }: DriverGuideProps) {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'mac' | 'linux'>('windows')

  const windowsDrivers = [
    {
      name: 'CH340/CH341 Driver',
      description: 'Driver phổ biến nhất cho ESP32',
      downloadUrl: 'https://www.wch.cn/downloads/CH341SER_EXE.html',
      directUrl: 'https://www.wch.cn/downloads/file/65.html',
      instructions: [
        'Tải file CH341SER.EXE',
        'Chạy file với quyền Administrator',
        'Khởi động lại máy tính',
        'Kết nối ESP32 để kiểm tra'
      ]
    },
    {
      name: 'CP2102 Driver',
      description: 'Driver cho ESP32 sử dụng chip CP2102',
      downloadUrl: 'https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers',
      instructions: [
        'Chọn "Downloads" > "CP2102 Universal Windows Driver"',
        'Tải và chạy file .exe',
        'Khởi động lại máy tính',
        'Kiểm tra Device Manager'
      ]
    }
  ]

  const macDrivers = [
    {
      name: 'CH340/CH341 Driver',
      description: 'Driver cho macOS',
      downloadUrl: 'https://www.wch.cn/downloads/CH341SER_MAC_ZIP.html',
      instructions: [
        'Tải file CH341SER_MAC.ZIP',
        'Giải nén và chạy CH34xVCPDriver.pkg',
        'Khởi động lại máy tính',
        'Kiểm tra System Information > USB'
      ]
    }
  ]

  const linuxDrivers = [
    {
      name: 'Built-in Support',
      description: 'Linux thường có sẵn driver',
      downloadUrl: undefined,
      instructions: [
        'Linux thường có sẵn driver ch340/cp2102',
        'Nếu thiếu, cài đặt qua package manager:',
        'Ubuntu/Debian: sudo apt install linux-modules-extra-$(uname -r)',
        'Arch: sudo pacman -S linux-headers',
        'Kiểm tra: lsmod | grep ch341'
      ]
    }
  ]

  const getDrivers = () => {
    switch (selectedOS) {
      case 'windows': return windowsDrivers
      case 'mac': return macDrivers
      case 'linux': return linuxDrivers
      default: return windowsDrivers
    }
  }

  const checkDriverInstallation = () => {
    // This would open a system check
    alert('Để kiểm tra driver đã cài đúng:\n\nWindows: Device Manager > Ports > CH340/CP2102\nmacOS: System Information > USB\nLinux: ls /dev/ttyUSB* hoặc ls /dev/ttyACM*')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">🔧 Hướng dẫn cài Driver ESP32</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* OS Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Chọn hệ điều hành của bạn:</h3>
            <div className="flex space-x-2">
              {[
                { id: 'windows', name: 'Windows', icon: '🪟' },
                { id: 'mac', name: 'macOS', icon: '🍎' },
                { id: 'linux', name: 'Linux', icon: '🐧' }
              ].map((os) => (
                <button
                  key={os.id}
                  onClick={() => setSelectedOS(os.id as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedOS === os.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {os.icon} {os.name}
                </button>
              ))}
            </div>
          </div>

          {/* Driver List */}
          <div className="space-y-6">
            {getDrivers().map((driver, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">{driver.name}</h4>
                    <p className="text-gray-600 mb-3">{driver.description}</p>
                  </div>
                  {driver.downloadUrl && (
                    <a
                      href={driver.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-accent-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      ⬇️ Tải Driver
                    </a>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn cài đặt:</h5>
                  <ol className="text-blue-700 space-y-1">
                    {driver.instructions.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start">
                        <span className="mr-2 font-bold">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Section */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-semibold mb-2">✅ Kiểm tra driver đã cài đúng:</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>Windows:</strong> Device Manager → Ports (COM & LPT) → CH340/CP2102</p>
              <p><strong>macOS:</strong> System Information → USB → CH340/CP2102</p>
              <p><strong>Linux:</strong> Terminal: <code className="bg-gray-100 px-1 rounded">ls /dev/ttyUSB*</code> hoặc <code className="bg-gray-100 px-1 rounded">ls /dev/ttyACM*</code></p>
            </div>
            <button
              onClick={checkDriverInstallation}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔍 Hướng dẫn kiểm tra
            </button>
          </div>

          {/* Troubleshooting */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-semibold mb-2">🔧 Xử lý sự cố:</h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• <strong>Driver không cài được:</strong> Chạy với quyền Administrator/root</li>
              <li>• <strong>Không thấy trong Device Manager:</strong> Thử cổng USB khác</li>
              <li>• <strong>ESP32 vẫn không nhận:</strong> Kiểm tra ESP32 có hoạt động (LED)</li>
              <li>• <strong>Vẫn gặp lỗi:</strong> Thử ESP32 khác hoặc cáp USB khác</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Đã hiểu
            </button>
            <button
              onClick={() => window.open('http://zalo.me/0389827643', '_blank')}
              className="flex-1 bg-accent-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📱 Hỗ trợ Zalo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}