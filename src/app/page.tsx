'use client'

import { useState, useRef } from 'react'
import { validateKeyWithDevice, generateDeviceFingerprint } from '@/lib/api-client'
import { ESP32FlashTool, FlashProgress } from '@/lib/esp32-flash'
import { githubReleaseManager, FirmwareInfo } from '@/lib/github-releases'
import FirmwareSelector from '@/components/FirmwareSelector'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareInfo | null>(null)
  const [authKey, setAuthKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [flashStatus, setFlashStatus] = useState('')
  const [flashProgress, setFlashProgress] = useState<FlashProgress | null>(null)
  const [isValidatingKey, setIsValidatingKey] = useState(false)
  const [keyValidated, setKeyValidated] = useState(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [firmwareSource, setFirmwareSource] = useState<'upload' | 'github'>('github')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const flashTool = useRef<ESP32FlashTool>(new ESP32FlashTool())

  const connectToDevice = async () => {
    try {
      setFlashStatus('Đang kết nối với ESP32-S3...')
      
      const success = await flashTool.current.connect()
      if (success) {
        setIsConnected(true)
        setFlashStatus('Đã kết nối thành công với ESP32-S3')
        
        // Generate device ID if not already set
        if (!deviceId) {
          const newDeviceId = generateDeviceFingerprint()
          setDeviceId(newDeviceId)
        }
      } else {
        setFlashStatus('Không thể kết nối với thiết bị')
      }
    } catch (error) {
      setFlashStatus('Lỗi khi kết nối với thiết bị: ' + (error as Error).message)
    }
  }

  const disconnectDevice = async () => {
    try {
      await flashTool.current.disconnect()
      setIsConnected(false)
      setFlashStatus('Đã ngắt kết nối')
    } catch (error) {
      setFlashStatus('Lỗi khi ngắt kết nối: ' + (error as Error).message)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSelectedFirmware(null) // Clear GitHub firmware selection
      setFlashStatus(`Đã chọn file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    }
  }

  const handleFirmwareSelect = (firmware: FirmwareInfo) => {
    setSelectedFirmware(firmware)
    setSelectedFile(null) // Clear local file selection
    setFlashStatus(`Đã chọn firmware: ${firmware.name} từ GitHub Releases`)
  }

  const handleKeyValidation = async () => {
    if (!authKey) {
      setFlashStatus('Vui lòng nhập authentication key')
      return
    }

    setIsValidatingKey(true)
    setFlashStatus('Đang xác thực key...')
    
    try {
      const currentDeviceId = deviceId || generateDeviceFingerprint()
      if (!deviceId) setDeviceId(currentDeviceId)
      
      const result = await validateKeyWithDevice(authKey, currentDeviceId)
      
      if (result.success) {
        setKeyValidated(true)
        setFlashStatus('Key hợp lệ! Bạn có thể tiến hành kết nối thiết bị.')
      } else {
        setKeyValidated(false)
        setFlashStatus(result.message || 'Key không hợp lệ')
      }
    } catch (error) {
      setKeyValidated(false)
      setFlashStatus('Lỗi khi xác thực key: ' + (error as Error).message)
    } finally {
      setIsValidatingKey(false)
    }
  }

  const flashFirmware = async () => {
    if ((!selectedFile && !selectedFirmware) || !keyValidated || !isConnected) {
      setFlashStatus('Vui lòng xác thực key, chọn firmware và kết nối thiết bị')
      return
    }

    try {
      setFlashStatus('Đang chuẩn bị nạp firmware...')
      
      let fileBuffer: ArrayBuffer
      
      if (selectedFirmware) {
        // Download firmware from GitHub Releases
        setFlashStatus('Đang tải firmware từ GitHub...')
        fileBuffer = await githubReleaseManager.downloadFirmware(selectedFirmware.downloadUrl)
      } else if (selectedFile) {
        // Read local file as ArrayBuffer
        fileBuffer = await selectedFile.arrayBuffer()
      } else {
        throw new Error('Không có firmware nào được chọn')
      }
      
      // Start flashing process
      const success = await flashTool.current.flashFirmware(fileBuffer, (progress) => {
        setFlashProgress(progress)
        setFlashStatus(progress.message)
      })

      if (success) {
        setFlashStatus('🎉 Nạp firmware thành công!')
        setFlashProgress(null)
      } else {
        setFlashStatus('❌ Nạp firmware thất bại')
      }
    } catch (error) {
      setFlashStatus('Lỗi khi nạp firmware: ' + (error as Error).message)
      setFlashProgress(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ESP32-S3 Web Flash Tool
            </h1>
            <p className="text-gray-600">
              Công cụ nạp firmware cho ESP32-S3 với xác thực key
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Panel - Device Connection */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Kết nối thiết bị
                </h2>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isConnected ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                        {isConnected ? '✅ Đã kết nối' : '⚠️ Chưa kết nối'}
                      </span>
                      {isConnected ? (
                        <button
                          onClick={disconnectDevice}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Ngắt kết nối
                        </button>
                      ) : (
                        <button
                          onClick={connectToDevice}
                          disabled={!keyValidated}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            keyValidated
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Kết nối ESP32-S3
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authentication Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={authKey}
                        onChange={(e) => {
                          setAuthKey(e.target.value.toUpperCase())
                          setKeyValidated(false)
                        }}
                        placeholder="Nhập 32-digit hex key..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={32}
                        disabled={isValidatingKey}
                      />
                      <button
                        onClick={handleKeyValidation}
                        disabled={!authKey || authKey.length !== 32 || isValidatingKey}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          keyValidated
                            ? 'bg-green-500 text-white'
                            : authKey.length === 32
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isValidatingKey ? '⏳' : keyValidated ? '✅' : 'Xác thực'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Key phải là 32 ký tự hex (0-9, A-F)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Firmware Selection and Flashing */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Chọn Firmware
                </h2>
                
                {/* Firmware Source Toggle */}
                <div className="flex bg-gray-200 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setFirmwareSource('github')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      firmwareSource === 'github'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📦 GitHub Releases
                  </button>
                  <button
                    onClick={() => setFirmwareSource('upload')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      firmwareSource === 'upload'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📁 Tải lên
                  </button>
                </div>

                <div className="space-y-4">
                  {firmwareSource === 'upload' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn file firmware (.bin)
                        </label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".bin"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {selectedFile && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>File đã chọn:</strong> {selectedFile.name}
                          </p>
                          <p className="text-sm text-blue-600">
                            Kích thước: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <FirmwareSelector
                      onFirmwareSelect={handleFirmwareSelect}
                      selectedFirmware={selectedFirmware}
                      disabled={!keyValidated}
                    />
                  )}

                  <button
                    onClick={flashFirmware}
                    disabled={(!selectedFile && !selectedFirmware) || !keyValidated || !isConnected || !!flashProgress}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      (selectedFile || selectedFirmware) && keyValidated && isConnected && !flashProgress
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {flashProgress ? 'Đang nạp...' : 'Bắt đầu nạp Firmware'}
                  </button>

                  {/* Progress Bar */}
                  {flashProgress && (
                    <div className="w-full">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{flashProgress.stage}</span>
                        <span>{Math.round(flashProgress.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${flashProgress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Panel */}
          {flashStatus && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Trạng thái:</h3>
              <p className="text-gray-700">{flashStatus}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">Hướng dẫn sử dụng:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Kết nối ESP32-S3 với máy tính qua USB</li>
              <li>Nhập authentication key (32 ký tự hex) và nhấn &quot;Xác thực&quot;</li>
              <li>Sau khi key hợp lệ, nhấp &quot;Kết nối ESP32-S3&quot;</li>
              <li>Chọn cổng COM tương ứng trong dialog</li>
              <li>Chọn file firmware (.bin) cần nạp</li>
              <li>Nhấp &quot;Bắt đầu nạp Firmware&quot; và theo dõi tiến độ</li>
            </ol>
            <p className="mt-3 text-sm text-blue-600">
              <strong>Lưu ý:</strong> Mỗi key chỉ có thể sử dụng với một thiết bị duy nhất.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}