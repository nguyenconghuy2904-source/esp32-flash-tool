'use client'

import { useState, useRef, useEffect } from 'react'
import SerialMonitor from '@/components/SerialMonitor'
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
    requiresKey: false,
    youtubeUrl: 'https://youtube.com/watch?v=demo-otto',
    schematicUrl: '/schematics/robot-otto-wiring.pdf',
    version: 'v2.1.5',
    notes: [
      '✔️ Miễn phí, không cần key',
      '✔️ Tương thích với tất cả các model Otto',
      '✔️ Hỗ trợ nhiều cảm biến: ultrasonic, camera, mic'
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

  // Auto show YouTube ad once per session
  useEffect(() => {
    const hasSeenYouTubeAd = localStorage.getItem('hasSeenYouTubeAd')
    if (!hasSeenYouTubeAd) {
      setTimeout(() => {
        setShowYouTubeAd(true)
        localStorage.setItem('hasSeenYouTubeAd', 'true')
      }, 3000)
    }
  }, [])

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary shadow-xl border-b-4 border-primary-dark"
              style={{
                boxShadow: '0 10px 30px rgba(0,136,122,0.3)'
              }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg"
                   style={{
                     boxShadow: '0 8px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
                   }}>
                <span className="text-primary font-bold text-xl">MZ</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MinizFlash Tool</h1>
                <p className="text-white/80 text-sm">Công cụ nạp firmware cho ESP32 với xác thực key</p>
              </div>
            </div>
            <div className="text-right text-white/80 text-sm">
              <p>💻 Vui lòng sử dụng máy tính để nạp chương trình</p>
              <p>🔧 Nhấn giữ nút BOOT và cắm cáp nếu bị lỗi</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Contact Notice */}
        <div className="bg-secondary border-2 border-secondary-dark rounded-2xl p-6 mb-8 shadow-lg"
             style={{
               boxShadow: '0 15px 35px rgba(0,136,122,0.15)'
             }}>
          <div className="flex items-center space-x-4">
            <div className="text-3xl bg-primary rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-white">
              💬
            </div>
            <div>
              <h3 className="text-primary font-bold text-lg">Liên hệ hỗ trợ</h3>
              <p className="text-primary-dark text-sm mb-2">Để được hướng dẫn chi tiết và hỗ trợ kỹ thuật</p>
              <div className="flex gap-3">
                <a href="http://zalo.me/0389827643" 
                   className="bg-accent-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
                  📱 Zalo: 0389827643
                </a>
                <a href="https://www.youtube.com/@miniZjp" 
                   target="_blank" rel="noopener noreferrer"
                   className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md">
                  🎥 YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Chip Selection */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2" 
                style={{ textShadow: '0 4px 8px rgba(0,136,122,0.15)' }}>
              Chọn Loại Chip ESP32
            </h2>
            <p className="text-primary-dark text-lg">Chọn loại chip ESP32 bạn đang sử dụng</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {CHIPS.map((chip) => (
              <div
                key={chip.id}
                onClick={() => setSelectedChip(chip.id)}
                className={`
                  cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2
                  ${selectedChip === chip.id 
                    ? 'bg-primary text-white shadow-2xl border-primary-dark' 
                    : 'bg-white hover:bg-accent-lightBlue text-primary border-primary/20'
                  }
                  border-2 rounded-2xl p-8 shadow-lg
                `}
                style={{
                  boxShadow: selectedChip === chip.id 
                    ? '0 25px 50px rgba(0,136,122,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 15px 35px rgba(0,136,122,0.1)'
                }}
              >
                <div className="text-center">
                  <div className={`w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                    selectedChip === chip.id ? 'bg-white/20' : 'bg-secondary'
                  }`}
                       style={{
                         boxShadow: '0 12px 25px rgba(0,136,122,0.2)'
                       }}>
                    <span className={`text-2xl font-bold ${selectedChip === chip.id ? 'text-white' : 'text-primary'}`}>
                      📱
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${selectedChip === chip.id ? 'text-white' : 'text-primary'}`}>
                    {chip.name}
                  </h3>
                  <p className={`text-sm mb-4 ${selectedChip === chip.id ? 'text-white/80' : 'text-primary-dark'}`}>
                    {chip.description}
                  </p>
                  <div className={`text-xs rounded-xl p-3 ${
                    selectedChip === chip.id 
                      ? 'bg-white/10 text-white/90' 
                      : 'bg-accent-lightBlue text-accent-blue border border-accent-blue/30'
                  }`}>
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
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-primary mb-2"
                  style={{ textShadow: '0 4px 8px rgba(0,136,122,0.15)' }}>
                Chọn Chương Trình Cần Nạp
              </h2>
              <p className="text-primary-dark text-lg">Chọn firmware phù hợp với dự án của bạn</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {FIRMWARES.map((firmware) => (
                <div
                  key={firmware.id}
                  onClick={() => setSelectedFirmware(firmware.id)}
                  className={`
                    cursor-pointer transition-all duration-300 transform hover:scale-105
                    ${selectedFirmware === firmware.id 
                      ? 'bg-primary border-primary-dark shadow-xl' 
                      : 'bg-white hover:bg-accent-lightBlue border-primary/20'
                    }
                    border-2 rounded-xl overflow-hidden
                  `}
                >
                  <div className={`h-48 flex items-center justify-center ${selectedFirmware === firmware.id ? 'bg-white/10' : 'bg-secondary'}`}>
                    <span className={`text-6xl ${selectedFirmware === firmware.id ? 'text-white' : 'text-primary'}`}>
                      {firmware.id === 'robot-otto' && '🤖'}
                      {firmware.id === 'dogmaster' && '🐕'}
                      {firmware.id === 'smart-switch-pc' && '💻'}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-xl font-bold ${selectedFirmware === firmware.id ? 'text-white' : 'text-primary'}`}>{firmware.name}</h3>
                      <span className={`text-sm px-2 py-1 rounded ${selectedFirmware === firmware.id ? 'bg-white/20 text-white' : 'bg-accent-lightBlue text-accent-blue'}`}>
                        {firmware.version}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-4 ${selectedFirmware === firmware.id ? 'text-white/80' : 'text-primary-dark'}`}>{firmware.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {firmware.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className={`text-xs flex items-center ${selectedFirmware === firmware.id ? 'text-white/90' : 'text-primary'}`}>
                          <span className="mr-2">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        firmware.requiresKey 
                          ? selectedFirmware === firmware.id ? 'bg-white/20 text-white' : 'bg-secondary text-primary' 
                          : selectedFirmware === firmware.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {firmware.requiresKey ? '🔑 Cần Key' : '🆓 Miễn phí'}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDetails(true)
                        }}
                        className={`text-xs underline ${selectedFirmware === firmware.id ? 'text-white hover:text-white/80' : 'text-accent-blue hover:text-blue-700'}`}
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
            <div className="bg-secondary border-2 border-secondary-dark rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-primary mb-4">🔑 Xác Thực Key</h3>
              <p className="text-primary-dark mb-4">Firmware này yêu cầu key để sử dụng. Nhập key của bạn:</p>
              
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Nhập 9 số key..."
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="flex-1 bg-white border-2 border-primary/30 rounded-xl px-6 py-4 text-primary placeholder-gray-400 focus:outline-none focus:border-primary shadow-lg"
                  style={{
                    boxShadow: 'inset 0 2px 10px rgba(0,136,122,0.1)'
                  }}
                  maxLength={9}
                  pattern="[0-9]*"
                />
                <button
                  onClick={handleKeyValidation}
                  disabled={isValidatingKey || !authKey.trim()}
                  className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isValidatingKey ? '⏳' : '🔓'} Xác thực
                </button>
              </div>
              
              {keyValidated && (
                <div className="mt-4 text-primary font-semibold text-sm">
                  ✅ Key hợp lệ! Device ID: {deviceId.slice(0, 16)}...
                </div>
              )}
            </div>
          </section>
        )}


        {/* Step 4: Flash Actions */}
        {selectedChip && selectedFirmware && (selectedFirmwareInfo?.requiresKey ? keyValidated : true) && (
          <section className="mb-12">
            <div className="bg-accent-lightBlue border-2 border-accent-blue/30 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-primary mb-4">🚀 Nạp Firmware</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <button
                  onClick={handleConnect}
                  disabled={isConnected}
                  className={`
                    ${isConnected 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : 'bg-accent-blue hover:bg-blue-700 text-white'
                    }
                    border-2 rounded-lg px-6 py-4 font-medium transition-colors disabled:cursor-not-allowed shadow-md
                  `}
                >
                  {isConnected ? '✅ Đã kết nối ESP32' : '🔌 Kết nối ESP32'}
                </button>
                <button
                  onClick={handleFlash}
                  disabled={!isConnected || flashProgress !== null}
                  className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white border-2 border-primary-dark rounded-lg px-6 py-4 font-medium transition-colors shadow-md"
                >
                  {flashProgress ? '⏳ Đang nạp...' : '⚡ Bắt đầu nạp Firmware'}
                </button>
              </div>
              {/* Progress Bar */}
              {flashProgress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-primary font-semibold mb-2">
                    <span>Tiến độ: {flashProgress.progress}%</span>
                    <span>{flashProgress.stage}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 border border-primary/20">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300 shadow-md"
                      style={{ width: `${flashProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {/* Status Message */}
              {flashStatus && (
                <div className={`
                  p-4 rounded-lg text-sm font-medium border-2
                  ${flashStatus.includes('✅') || flashStatus.includes('🎉') 
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : flashStatus.includes('❌') 
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-accent-lightBlue border-accent-blue text-primary'
                  }
                `}>
                  {flashStatus}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Serial Monitor Section */}
        <SerialMonitor />



        {/* Usage Instructions */}
        <section className="mb-12">
          <div className="bg-secondary border-2 border-secondary-dark rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-primary mb-4">📋 Hướng dẫn sử dụng:</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-primary-dark">
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
            
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-yellow-800 text-sm">
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
      {showYouTubeAd && (
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
                    Chào mừng đến với <strong>MinizFlash Tool</strong>!
                  </p>
                  <p className="text-gray-300 text-sm">
                    Đăng ký kênh YouTube để xem hướng dẫn chi tiết và nhận firmware mới nhất!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://www.youtube.com/@miniZjp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    🎬 Subscribe @miniZjp
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
      <footer className="bg-primary shadow-2xl border-t-4 border-primary-dark py-8"
              style={{
                boxShadow: '0 -10px 30px rgba(0,136,122,0.3)'
              }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Liên Hệ</h4>
              <div className="space-y-2 text-white/80 text-sm">
                <a href="http://zalo.me/0389827643" className="block hover:text-white transition-colors">📱 Zalo: 0389827643</a>
                <a href="https://www.youtube.com/@miniZjp" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">🎥 YouTube: @miniZjp</a>
                <a href="#" className="block hover:text-white transition-colors">📘 Facebook</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Tài Nguyên</h4>
              <div className="space-y-2 text-white/80 text-sm">
                <a href="#" className="block hover:text-white">📚 Hướng dẫn</a>
                <a href="#" className="block hover:text-white">🔧 Tools</a>
                <a href="#" className="block hover:text-white">💾 Firmware Archive</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Thống Kê</h4>
              <div className="text-white/80 text-sm">
                <p className="mb-2">👥 Online: 1,234</p>
                <p className="mb-2">📦 Total Downloads: 45,678</p>
                <div className="flex items-center">
                  <span className="mr-2">👁️</span>
                  <Image src="https://visitor-badge.laobi.icu/badge?page_id=esp32-flash-tool" alt="Visitor count" className="h-5" width={100} height={20} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70 text-sm">
              © 2025 ESP32 Flash Tool - Phát triển bởi <span className="text-white font-semibold">ESP32 VN Community</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}