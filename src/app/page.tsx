'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { validateKeyWithDevice, generateDeviceFingerprint } from '@/lib/api-client'
import { ESP32FlashTool, FlashProgress } from '@/lib/esp32-flash'
import { githubReleaseManager, FirmwareInfo as GithubFirmwareInfo } from '@/lib/github-releases'

type ChipType = 'esp32-s3' | 'esp32-s3-zero' | 'esp32-c3-super-mini'
type FirmwareCategory = 'robot-otto' | 'dogmaster' | 'smart-switch-pc'

interface ChipInfo {
  id: ChipType
  name: string
  image: string
  description: string
  specs: string
}

interface FirmwareInfo {
  id: FirmwareCategory
  name: string
  description: string
  image: string
  features: string[]
  requiresKey: boolean
  youtubeUrl?: string
  schematicUrl?: string
  version: string
  notes?: string[]
}

const CHIPS: ChipInfo[] = [
  {
    id: 'esp32-s3',
    name: 'ESP32-S3',
    image: '/images/esp32-s3.jpg',
    description: 'ESP32-S3 DevKit với WiFi, Bluetooth, Camera support',
    specs: '240MHz, 512KB SRAM, WiFi 4, Bluetooth 5.0'
  },
  {
    id: 'esp32-s3-zero',
    name: 'ESP32-S3 Zero',
    image: '/images/esp32-s3-zero.jpg', 
    description: 'ESP32-S3 Zero form factor nhỏ gọn',
    specs: '240MHz, 512KB SRAM, Size nhỏ gọn'
  },
  {
    id: 'esp32-c3-super-mini',
    name: 'ESP32-C3 Super Mini',
    image: '/images/esp32-c3.jpg',
    description: 'ESP32-C3 Super Mini siêu nhỏ, giá rẻ',
    specs: '160MHz, 400KB SRAM, WiFi 4, Bluetooth 5.0'
  }
]

const FIRMWARES: FirmwareInfo[] = [
  {
    id: 'robot-otto',
    name: 'Robot Otto',
    description: 'Firmware điều khiển robot Otto với AI và học máy',
    image: '/images/robot-otto.jpg',
    features: [
      '🤖 Điều khiển robot Otto thông minh',
      '🎵 Nhận diện giọng nói và âm thanh',
      '👁️ Camera AI nhận diện đối tượng',
      '📱 App điều khiển từ xa',
      '🎮 Chế độ game tương tác',
      '🔋 Quản lý pin thông minh'
    ],
    requiresKey: true,
    youtubeUrl: 'https://youtube.com/watch?v=demo-otto',
    schematicUrl: '/schematics/robot-otto-wiring.pdf',
    version: 'v2.1.5',
    notes: [
      '✔️ Tương thích với tất cả các model Otto',
      '✔️ Hỗ trợ nhiều cảm biến: ultrasonic, camera, mic',
      '⚠️ Yêu cầu key để kích hoạt đầy đủ tính năng'
    ]
  },
  {
    id: 'dogmaster',
    name: 'DogMaster',
    description: 'Hệ thống huấn luyện và quản lý thú cưng thông minh',
    image: '/images/dogmaster.jpg',
    features: [
      '🐕 Theo dõi hoạt động thú cưng 24/7',
      '🍽️ Tự động cho ăn theo lịch trình',
      '🔊 Phát âm thanh huấn luyện',
      '📊 Báo cáo sức khỏe chi tiết',
      '📱 Thông báo realtime lên app',
      '🎥 Ghi hình và livestream'
    ],
    requiresKey: true,
    youtubeUrl: 'https://youtube.com/watch?v=demo-dogmaster',
    schematicUrl: '/schematics/dogmaster-setup.pdf',
    version: 'v1.8.2',
    notes: [
      '✔️ Kết nối với camera IP và cảm biến',
      '✔️ Tích hợp AI nhận diện hành vi',
      '⚠️ Cần key để unlock tính năng premium'
    ]
  },
  {
    id: 'smart-switch-pc',
    name: 'Smart Switch PC',
    description: 'Điều khiển máy tính từ xa thông minh',
    image: '/images/smart-switch.jpg',
    features: [
      '💻 Bật/tắt máy tính từ xa',
      '📊 Monitor nhiệt độ, tải CPU',
      '🔄 Restart/shutdown tự động',
      '📱 Điều khiển qua app mobile',
      '⚡ Quản lý nguồn điện thông minh',
      '🚨 Cảnh báo lỗi hệ thống'
    ],
    requiresKey: false,
    youtubeUrl: 'https://youtube.com/watch?v=demo-smart-switch',
    schematicUrl: '/schematics/smart-switch-wiring.pdf',
    version: 'v3.0.1',
    notes: [
      '✔️ Miễn phí, không cần key',
      '✔️ Tương thích mọi mainboard',
      '✔️ Hỗ trợ WOL (Wake on LAN)'
    ]
  }
]

export default function Home() {
  const [selectedChip, setSelectedChip] = useState<ChipType | null>(null)
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareCategory | null>(null)
  const [authKey, setAuthKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [flashStatus, setFlashStatus] = useState('')
  const [flashProgress, setFlashProgress] = useState<FlashProgress | null>(null)
  const [isValidatingKey, setIsValidatingKey] = useState(false)
  const [keyValidated, setKeyValidated] = useState(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [showDetails, setShowDetails] = useState(false)
  const [showYouTubeAd, setShowYouTubeAd] = useState(false)
  const flashTool = useRef<ESP32FlashTool>(new ESP32FlashTool())

  const selectedChipInfo = CHIPS.find(chip => chip.id === selectedChip)
  const selectedFirmwareInfo = FIRMWARES.find(fw => fw.id === selectedFirmware)

  // Auto show YouTube ad when firmware is selected
  useEffect(() => {
    if (selectedFirmware && selectedFirmwareInfo?.youtubeUrl) {
      setTimeout(() => setShowYouTubeAd(true), 1000)
    }
  }, [selectedFirmware, selectedFirmwareInfo])

  const handleKeyValidation = async () => {
    if (!authKey.trim()) return

    setIsValidatingKey(true)
    try {
      const deviceFingerprint = generateDeviceFingerprint()
      const result = await validateKeyWithDevice(authKey.trim(), deviceFingerprint)
      
      if (result.success) {
        setKeyValidated(true)
        setDeviceId(result.deviceId || deviceFingerprint)
        setFlashStatus('✅ Key hợp lệ! Sẵn sàng để flash firmware.')
      } else {
        setFlashStatus(`❌ ${result.message}`)
        setKeyValidated(false)
      }
    } catch (error) {
      setFlashStatus('❌ Lỗi kết nối API. Vui lòng thử lại.')
      setKeyValidated(false)
    } finally {
      setIsValidatingKey(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedChip) {
      setFlashStatus('❌ Vui lòng chọn loại chip trước!')
      return
    }

    try {
      setFlashStatus('🔌 Đang kết nối với ESP32...')
      await flashTool.current.connect()
      setIsConnected(true)
      setFlashStatus('✅ Đã kết nối với ESP32!')
    } catch (error: any) {
      setFlashStatus(`❌ Lỗi kết nối: ${error.message}`)
      setIsConnected(false)
    }
  }

  const handleFlash = async () => {
    if (!selectedChip || !selectedFirmware) {
      setFlashStatus('❌ Vui lòng chọn chip và firmware!')
      return
    }

    if (selectedFirmwareInfo?.requiresKey && !keyValidated) {
      setFlashStatus('❌ Firmware này yêu cầu key hợp lệ!')
      return
    }

    if (!isConnected) {
      setFlashStatus('❌ Vui lòng kết nối với ESP32 trước!')
      return
    }

    try {
      setFlashStatus('📥 Đang tải firmware...')
      
      // Get firmware from GitHub releases  
      const firmwareList = await githubReleaseManager.getFirmwareList()
      const firmwarePattern = `${selectedChip}-${selectedFirmware}`
      const firmware = firmwareList.find(fw => fw.name.includes(firmwarePattern))

      if (!firmware) {
        setFlashStatus('❌ Không tìm thấy firmware phù hợp!')
        return
      }

      setFlashStatus('� Đang tải firmware...')
      
      // Download firmware
      const response = await fetch(firmware.downloadUrl)
      if (!response.ok) {
        throw new Error('Không thể tải firmware')
      }
      const firmwareData = await response.arrayBuffer()
      
      setFlashStatus('�🔄 Đang flash firmware...')
      
      await flashTool.current.flashFirmware(
        firmwareData,
        (progress) => {
          setFlashProgress(progress)
          setFlashStatus(`⏳ Flashing... ${progress.progress}%`)
        }
      )

      setFlashStatus('🎉 Flash firmware thành công!')
      setFlashProgress(null)
      
      // Show YouTube ad after successful flash
      if (selectedFirmwareInfo?.youtubeUrl) {
        setTimeout(() => setShowYouTubeAd(true), 2000)
      }
      
    } catch (error: any) {
      setFlashStatus(`❌ Lỗi flash: ${error.message}`)
      setFlashProgress(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ESP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ESP32 Flash Tool</h1>
                <p className="text-blue-200 text-sm">Công cụ nạp firmware cho ESP32 với xác thực key</p>
              </div>
            </div>
            <div className="text-right text-white/60 text-sm">
              <p>💻 Vui lòng sử dụng máy tính để nạp chương trình</p>
              <p>🔧 Nhấn giữ nút BOOT và cắm cáp nếu bị lỗi</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Facebook Group Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌟</div>
            <div>
              <h3 className="text-yellow-300 font-semibold">Nhóm Facebook ESP32 VN</h3>
              <p className="text-yellow-200 text-sm">Để được hướng dẫn chi tiết và hỗ trợ kỹ thuật</p>
              <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Tham gia
              </button>
            </div>
          </div>
        </div>

        {/* Step 1: Chip Selection */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Chọn Loại Chip ESP32</h2>
          <p className="text-blue-200 mb-6">Chọn loại chip ESP32 bạn đang sử dụng</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {CHIPS.map((chip) => (
              <div
                key={chip.id}
                onClick={() => setSelectedChip(chip.id)}
                className={`
                  cursor-pointer transition-all duration-300 transform hover:scale-105
                  ${selectedChip === chip.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }
                  border rounded-xl p-6 backdrop-blur-sm
                `}
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-xs">IMG</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{chip.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">{chip.description}</p>
                  <div className="text-blue-300 text-xs bg-blue-500/10 rounded-lg p-2">
                    {chip.specs}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step 2: Firmware Selection */}
        {selectedChip && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Chọn Chương Trình Cần Nạp</h2>
            <p className="text-blue-200 mb-6">Chọn firmware phù hợp với dự án của bạn</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {FIRMWARES.map((firmware) => (
                <div
                  key={firmware.id}
                  onClick={() => setSelectedFirmware(firmware.id)}
                  className={`
                    cursor-pointer transition-all duration-300 transform hover:scale-105
                    ${selectedFirmware === firmware.id 
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 border-green-400' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }
                    border rounded-xl overflow-hidden backdrop-blur-sm
                  `}
                >
                  <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-6xl">
                      {firmware.id === 'robot-otto' && '🤖'}
                      {firmware.id === 'dogmaster' && '🐕'}
                      {firmware.id === 'smart-switch-pc' && '💻'}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{firmware.name}</h3>
                      <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        {firmware.version}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{firmware.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {firmware.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="text-green-300 text-xs flex items-center">
                          <span className="mr-2">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        firmware.requiresKey 
                          ? 'bg-orange-500/20 text-orange-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {firmware.requiresKey ? '🔑 Cần Key' : '🆓 Miễn phí'}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDetails(true)
                        }}
                        className="text-blue-300 hover:text-blue-200 text-xs underline"
                      >
                        Chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Key Authentication */}
        {selectedFirmware && selectedFirmwareInfo?.requiresKey && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 border border-orange-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-orange-300 mb-4">🔑 Xác Thực Key</h3>
              <p className="text-orange-200 mb-4">Firmware này yêu cầu key để sử dụng. Nhập key của bạn:</p>
              
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Nhập 32-digit hex key..."
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value.toUpperCase())}
                  className="flex-1 bg-black/20 border border-orange-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  maxLength={32}
                />
                <button
                  onClick={handleKeyValidation}
                  disabled={isValidatingKey || !authKey.trim()}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isValidatingKey ? '⏳' : '🔓'} Xác thực
                </button>
              </div>
              
              {keyValidated && (
                <div className="mt-4 text-green-300 text-sm">
                  ✅ Key hợp lệ! Device ID: {deviceId.slice(0, 16)}...
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 4: Flash Actions */}
        {selectedChip && selectedFirmware && (selectedFirmwareInfo?.requiresKey ? keyValidated : true) && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-300 mb-4">🚀 Nạp Firmware</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <button
                  onClick={handleConnect}
                  disabled={isConnected}
                  className={`
                    ${isConnected 
                      ? 'bg-green-600/20 border-green-500/30 text-green-300' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                    border rounded-lg px-6 py-4 font-medium transition-colors disabled:cursor-not-allowed
                  `}
                >
                  {isConnected ? '✅ Đã kết nối ESP32' : '🔌 Kết nối ESP32'}
                </button>
                
                <button
                  onClick={handleFlash}
                  disabled={!isConnected || flashProgress !== null}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-green-500/30 rounded-lg px-6 py-4 font-medium transition-colors"
                >
                  {flashProgress ? '⏳ Đang nạp...' : '⚡ Bắt đầu nạp Firmware'}
                </button>
              </div>

              {/* Progress Bar */}
              {flashProgress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-blue-300 mb-2">
                    <span>Tiến độ: {flashProgress.progress}%</span>
                    <span>{flashProgress.stage}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${flashProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {flashStatus && (
                <div className={`
                  p-4 rounded-lg text-sm font-medium
                  ${flashStatus.includes('✅') || flashStatus.includes('🎉') 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                    : flashStatus.includes('❌') 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                  }
                `}>
                  {flashStatus}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Usage Instructions */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-indigo-300 mb-4">📋 Hướng dẫn sử dụng:</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-indigo-200">
              <div>
                <h4 className="font-semibold mb-2">🔌 Kết nối ESP32:</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Kết nối ESP32 với máy tính qua USB</li>
                  <li>Nhấn giữ nút BOOT nếu cần thiết</li>
                  <li>Chọn đúng loại chip</li>
                  <li>Nhấn &quot;Kết nối ESP32&quot;</li>
                  <li>Chọn cổng COM xuất hiện</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⚡ Nạp firmware:</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Nhập key nếu firmware yêu cầu</li>
                  <li>Chọn firmware phù hợp</li>
                  <li>Nhấn &quot;Bắt đầu nạp Firmware&quot;</li>
                  <li>Chờ quá trình hoàn tất</li>
                  <li>Reset ESP32 để sử dụng</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>💡 Lưu ý:</strong> Mỗi key chỉ có thể sử dụng với một thiết bị duy nhất. 
                Nếu bạn chưa có key mà spam kích hoạt, chip ESP32 sẽ bị đưa vào danh sách chặn sau 5 lần thử.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Firmware Details Modal */}
      {showDetails && selectedFirmwareInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedFirmwareInfo.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-4">🚀 Tính năng:</h3>
                  <div className="space-y-2">
                    {selectedFirmwareInfo.features.map((feature, idx) => (
                      <div key={idx} className="text-green-300 text-sm flex items-start">
                        <span className="mr-2 mt-1">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-300 mb-4">📝 Ghi chú:</h3>
                  <div className="space-y-2">
                    {selectedFirmwareInfo.notes?.map((note, idx) => (
                      <div key={idx} className="text-gray-300 text-sm">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                {selectedFirmwareInfo.schematicUrl && (
                  <a
                    href={selectedFirmwareInfo.schematicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    📊 Sơ đồ
                  </a>
                )}
                
                <button
                  onClick={() => {
                    setShowDetails(false)
                    setSelectedFirmware(selectedFirmwareInfo.id)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🔧 Chọn firmware này
                </button>

                {selectedFirmwareInfo.youtubeUrl && (
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setShowYouTubeAd(true)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    🎥 Xem hướng dẫn
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Advertisement Popup */}
      {showYouTubeAd && selectedFirmwareInfo?.youtubeUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-r from-red-900 to-purple-900 rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              {/* Ad Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">🎥 Video Hướng Dẫn</h3>
                <button
                  onClick={() => setShowYouTubeAd(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="text-center">
                <div className="bg-black/20 rounded-lg p-8 mb-6">
                  <div className="text-6xl mb-4">📺</div>
                  <p className="text-white mb-4">
                    Xem video hướng dẫn chi tiết cho <strong>{selectedFirmwareInfo.name}</strong>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Học cách cài đặt, cấu hình và sử dụng firmware một cách hiệu quả nhất!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={selectedFirmwareInfo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    🎬 Xem trên YouTube
                  </a>
                  
                  <button
                    onClick={() => setShowYouTubeAd(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    Bỏ qua
                  </button>
                </div>

                <p className="text-gray-400 text-xs mt-4">
                  💡 Tip: Subscribe kênh để nhận thông báo firmware mới!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Liên Hệ</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <a href="#" className="block hover:text-blue-300">💬 Zalo</a>
                <a href="#" className="block hover:text-blue-300">🎵 TikTok</a>
                <a href="#" className="block hover:text-blue-300">📘 Facebook</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Tài Nguyên</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <a href="#" className="block hover:text-blue-300">📚 Hướng dẫn</a>
                <a href="#" className="block hover:text-blue-300">🔧 Tools</a>
                <a href="#" className="block hover:text-blue-300">💾 Firmware Archive</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Thống Kê</h4>
              <div className="text-gray-300 text-sm">
                <p className="mb-2">👥 Online: 1,234</p>
                <p className="mb-2">📦 Total Downloads: 45,678</p>
                <div className="flex items-center">
                  <span className="mr-2">👁️</span>
                  <Image src="https://visitor-badge.laobi.icu/badge?page_id=esp32-flash-tool" alt="Visitor count" className="h-5" width={100} height={20} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 ESP32 Flash Tool - Phát triển bởi <span className="text-blue-300">ESP32 VN Community</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}