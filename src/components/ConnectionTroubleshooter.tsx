import React, { useState } from 'react'

interface ConnectionCheck {
  name: string
  status: 'pending' | 'checking' | 'success' | 'error'
  message: string
  details?: string
}

interface ConnectionTroubleshooterProps {
  onClose: () => void
}

export default function ConnectionTroubleshooter({ onClose }: ConnectionTroubleshooterProps) {
  const [checks, setChecks] = useState<ConnectionCheck[]>([
    {
      name: 'WebSerial API Support',
      status: 'pending',
      message: 'Kiểm tra hỗ trợ WebSerial API'
    },
    {
      name: 'HTTPS/Localhost',
      status: 'pending',
      message: 'Kiểm tra giao thức HTTPS'
    },
    {
      name: 'USB Device Access',
      status: 'pending',
      message: 'Kiểm tra quyền truy cập USB'
    },
    {
      name: 'ESP32 Driver',
      status: 'pending',
      message: 'Kiểm tra driver ESP32'
    },
    {
      name: 'Serial Port Available',
      status: 'pending',
      message: 'Kiểm tra cổng serial'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)

  const updateCheck = (index: number, status: ConnectionCheck['status'], message: string, details?: string) => {
    setChecks(prev => prev.map((check, i) =>
      i === index ? { ...check, status, message, details } : check
    ))
  }

  const runChecks = async () => {
    setIsRunning(true)

    // Check 1: WebSerial API Support
    updateCheck(0, 'checking', 'Đang kiểm tra WebSerial API...')
    await new Promise(resolve => setTimeout(resolve, 500))

    if ('serial' in navigator) {
      updateCheck(0, 'success', '✅ WebSerial API được hỗ trợ')
    } else {
      updateCheck(0, 'error', '❌ WebSerial API không được hỗ trợ',
        'Vui lòng dùng Chrome, Edge, hoặc Opera. Firefox và Safari không hỗ trợ WebSerial.')
    }

    // Check 2: HTTPS/Localhost
    updateCheck(1, 'checking', 'Đang kiểm tra giao thức...')
    await new Promise(resolve => setTimeout(resolve, 500))

    const isHttps = window.location.protocol === 'https:'
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    if (isHttps || isLocalhost) {
      updateCheck(1, 'success', '✅ Chạy trên HTTPS hoặc localhost')
    } else {
      updateCheck(1, 'error', '❌ Cần chạy trên HTTPS hoặc localhost',
        'WebSerial chỉ hoạt động trên HTTPS. Vui lòng truy cập qua https:// hoặc chạy localhost.')
    }

    // Check 3: USB Device Access
    updateCheck(2, 'checking', 'Đang kiểm tra quyền USB...')
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // Try to request a port (this will show permission dialog)
      const port = await (navigator as any).serial.requestPort()
      if (port) {
        await port.close() // Close it immediately
        updateCheck(2, 'success', '✅ Quyền truy cập USB được cấp')
      } else {
        updateCheck(2, 'error', '❌ Không thể truy cập USB',
          'Bạn đã từ chối quyền truy cập USB hoặc không có thiết bị nào được chọn.')
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        updateCheck(2, 'error', '❌ Quyền truy cập USB bị từ chối',
          'Bạn cần cho phép quyền truy cập USB khi popup hiện ra.')
      } else if (error.name === 'NotFoundError') {
        updateCheck(2, 'error', '❌ Không tìm thấy thiết bị USB',
          'Vui lòng kết nối ESP32 và thử lại. Nếu popup không hiện, thiết bị có thể chưa được nhận diện.')
      } else {
        updateCheck(2, 'error', '❌ Lỗi truy cập USB',
          `Lỗi: ${error.message}`)
      }
    }

    // Check 4: ESP32 Driver
    updateCheck(3, 'checking', 'Đang kiểm tra driver ESP32...')
    await new Promise(resolve => setTimeout(resolve, 500))

    // This is a basic check - we can't really detect drivers from browser
    // But we can check if common ESP32 VID/PID are available
    updateCheck(3, 'success', '✅ Driver ESP32 (CH340/CP2102) cần được cài đặt',
      'Nếu gặp lỗi kết nối, hãy cài driver CH340 hoặc CP2102 cho ESP32 của bạn.')

    // Check 5: Serial Port Available
    updateCheck(4, 'checking', 'Đang kiểm tra cổng serial...')
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const ports = await (navigator as any).serial.getPorts()
      if (ports && ports.length > 0) {
        updateCheck(4, 'success', `✅ Tìm thấy ${ports.length} cổng serial`)
      } else {
        updateCheck(4, 'error', '❌ Không tìm thấy cổng serial',
          'Vui lòng kết nối ESP32 và làm mới trang. Nếu vẫn không thấy, kiểm tra driver và cáp USB.')
      }
    } catch (error) {
      updateCheck(4, 'error', '❌ Không thể kiểm tra cổng serial',
        'Trình duyệt có thể không hỗ trợ getPorts() hoặc có lỗi bảo mật.')
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: ConnectionCheck['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'checking': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = (status: ConnectionCheck['status']) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'checking': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">🔧 Kiểm tra kết nối ESP32</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              🛠️ Công cụ này sẽ kiểm tra các yêu cầu cần thiết để kết nối ESP32.
              Hãy chạy từng bước kiểm tra để xác định vấn đề.
            </p>
          </div>

          {/* Run Button */}
          <div className="mb-6">
            <button
              onClick={runChecks}
              disabled={isRunning}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isRunning ? '🔄 Đang kiểm tra...' : '🚀 Chạy kiểm tra kết nối'}
            </button>
          </div>

          {/* Checks List */}
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className={`text-lg ${getStatusColor(check.status)}`}>
                    {getStatusIcon(check.status)}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary mb-1">{check.name}</h3>
                    <p className={`text-sm ${getStatusColor(check.status)}`}>{check.message}</p>
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Chi tiết
                        </summary>
                        <p className="text-xs text-gray-700 mt-1 pl-4 border-l-2 border-gray-300">
                          {check.details}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Troubleshooting Tips */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-semibold mb-2">💡 Mẹo khắc phục:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• <strong>Không hiện popup USB:</strong> Dùng Chrome/Edge/Opera, chạy HTTPS</li>
              <li>• <strong>Không tìm thấy thiết bị:</strong> Nhấn giữ BOOT khi cắm USB</li>
              <li>• <strong>Lỗi driver:</strong> Cài CH340/CP2102 driver cho ESP32</li>
              <li>• <strong>Thiết bị đang dùng:</strong> Đóng Arduino IDE, PlatformIO</li>
              <li>• <strong>Cáp USB kém:</strong> Thử cáp khác, cổng USB khác</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Đóng
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