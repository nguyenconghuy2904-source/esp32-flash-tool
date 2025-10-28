'use client'

import { useState, useRef, useEffect } from 'react'
import SerialMonitor from '@/components/SerialMonitor'
import Image from 'next/image'
import { validateKeyWithDevice, generateDeviceFingerprint } from '@/lib/api-client'
import { ESP32FlashTool, FlashProgress } from '@/lib/esp32-flash'
import { githubReleaseManager, FirmwareInfo as GithubFirmwareInfo } from '@/lib/github-releases'
import { FIRMWARE_REPOS, getFirmwareRepoConfig } from '@/lib/firmware-config'

type ChipType = 'esp32-s3' | 'esp32-s3-zero' | 'esp32-c3-super-mini'
type FirmwareCategory = 'kiki-day' | 'robot-otto' | 'dogmaster' // | 'smart-switch-pc' - Tạm ẩn

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
  file3dUrl?: string
  version?: string
  versions: Array<{
    id: string
    name: string
    description: string
    chip: ChipType
    requiresKey: boolean
  }>
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
    id: 'kiki-day',
    name: 'Kiki đây',
    description: 'Firmware đặc biệt dành riêng cho khách hàng VIP',
    image: '/images/kiki-day.png',
    features: [
      '⭐ Phiên bản đặc biệt cho khách hàng',
      '🎁 Tính năng độc quyền',
      '🔐 Bảo mật cao cấp',
      '💎 Hỗ trợ ưu tiên',
      '🚀 Cập nhật sớm nhất',
      '🎯 Tùy chỉnh theo yêu cầu'
    ],
    requiresKey: true,
    youtubeUrl: 'https://youtube.com/watch?v=demo-kiki',
    schematicUrl: '/schematics/kiki-day.pdf',
    file3dUrl: '/3d-files/kiki-day.zip',
    version: 'v1.0.0 VIP',
    versions: [
      { id: 'kiki-s3', name: 'ESP32-S3', description: 'Phiên bản VIP đặc biệt', chip: 'esp32-s3', requiresKey: true }
    ],
    notes: [
      '⚠️ Yêu cầu key kích hoạt riêng',
      '✔️ Dành cho khách hàng đã mua gói VIP',
      '✔️ Liên hệ Zalo 0389827643 để nhận key'
    ]
  },
  // Tạm ẩn Smart Switch PC - đang cập nhật
  // {
  //   id: 'smart-switch-pc',
  //   name: 'Smart Switch PC',
  //   description: 'Điều khiển máy tính từ xa thông minh',
  //   image: '/images/chrome_zdtZmuxmqs.png',
  //   features: [
  //     '💻 Bật/tắt máy tính từ xa',
  //     '📊 Monitor nhiệt độ, tải CPU',
  //     '🔄 Restart/shutdown tự động',
  //     '📱 Điều khiển qua app mobile',
  //     '⚡ Quản lý nguồn điện thông minh',
  //     '🚨 Cảnh báo lỗi hệ thống'
  //   ],
  //   requiresKey: false,
  //   youtubeUrl: 'https://youtube.com/watch?v=demo-smart-switch',
  //   schematicUrl: '/schematics/smart-switch-wiring.pdf',
  //   file3dUrl: '/3d-files/smart-switch-pc.zip',
  //   version: 'v3.0.1',
  //   versions: [
  //     { id: 'switch-s3', name: 'ESP32-S3', description: 'Version đầy đủ', chip: 'esp32-s3', requiresKey: false },
  //     { id: 'switch-c3', name: 'ESP32-C3 Super Mini', description: 'Version tiêu chuẩn', chip: 'esp32-c3-super-mini', requiresKey: false }
  //   ],
  //   notes: [
  //     '✔️ Miễn phí, không cần key',
  //     '✔️ Tương thích mọi mainboard',
  //     '✔️ Hỗ trợ WOL (Wake on LAN)'
  //   ]
  // }
  {
    id: 'robot-otto',
    name: 'Robot Otto',
    description: 'Firmware điều khiển robot Otto với AI và học máy',
    image: '/images/robot-otto.png',
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
    file3dUrl: 'https://github.com/nguyenconghuy2904-source/robot-otto-firmware/releases/download/v1.0.0/robot-otto-3d-files.zip',
    version: 'v2.1.5',
    versions: [
      { id: 'otto-s3', name: 'ESP32-S3', description: 'Version cao cấp với camera', chip: 'esp32-s3', requiresKey: false },
      { id: 'otto-s3-zero', name: 'ESP32-S3 Zero', description: 'Version compact nhỏ gọn', chip: 'esp32-s3-zero', requiresKey: false },
      { id: 'otto-c3', name: 'ESP32-C3 Super Mini', description: 'Version siêu tiết kiệm', chip: 'esp32-c3-super-mini', requiresKey: false }
    ],
    notes: [
      '✔️ Miễn phí, không cần key',
      '✔️ Tương thích với tất cả các model Otto',
      '✔️ Hỗ trợ nhiều cảm biến: ultrasonic, camera, mic'
    ]
  },
  {
    id: 'dogmaster',
    name: 'Thùng Rác Thông Minh',
    description: 'Hệ thống quản lý thùng rác tự động với AI phân loại rác',
    image: '/images/smart-trash-bin.png',
    features: [
      '♻️ Phân loại rác tự động AI',
      '🚪 Nắp thùng mở tự động',
      '📊 Theo dõi mức đầy rác',
      '🔔 Thông báo khi đầy',
      '📱 Ứng dụng điều khiển từ xa',
      '🌐 Tích hợp IoT thông minh'
    ],
    requiresKey: true,
    youtubeUrl: 'https://youtube.com/watch?v=demo-smart-trash',
    schematicUrl: '/schematics/smart-trash-bin-setup.pdf',
    file3dUrl: '/3d-files/smart-trash-bin.zip',
    version: 'v1.8.2',
    versions: [
      { id: 'trash-s3', name: 'ESP32-S3', description: 'Version đầy đủ AI', chip: 'esp32-s3', requiresKey: true },
      { id: 'trash-c3', name: 'ESP32-C3 Super Mini', description: 'Version tiêu chuẩn', chip: 'esp32-c3-super-mini', requiresKey: true }
    ],
    notes: [
      '✔️ Kết nối cảm biến cân tải, camera AI',
      '✔️ Tích hợp ML nhận diện loại rác',
      '⚠️ Cần key để unlock tính năng AI'
    ]
  }
  // Tạm ẩn Smart Switch PC
  // {
  //   id: 'smart-switch-pc',
  //   name: 'Smart Switch PC',
  //   description: 'Điều khiển máy tính từ xa thông minh',
  //   image: '/images/chrome_zdtZmuxmqs.png',
  //   features: [
  //     '💻 Bật/tắt máy tính từ xa',
  //     '📊 Monitor nhiệt độ, tải CPU',
  //     '🔄 Restart/shutdown tự động',
  //     '📱 Điều khiển qua app mobile',
  //     '⚡ Quản lý nguồn điện thông minh',
  //     '🚨 Cảnh báo lỗi hệ thống'
  //   ],
  //   requiresKey: false,
  //   youtubeUrl: 'https://youtube.com/watch?v=demo-smart-switch',
  //   schematicUrl: '/schematics/smart-switch-wiring.pdf',
  //   file3dUrl: '/3d-files/smart-switch-pc.zip',
  //   version: 'v3.0.1',
  //   versions: [
  //     { id: 'switch-s3', name: 'ESP32-S3', description: 'Version đầy đủ', chip: 'esp32-s3', requiresKey: false },
  //     { id: 'switch-c3', name: 'ESP32-C3 Super Mini', description: 'Version tiêu chuẩn', chip: 'esp32-c3-super-mini', requiresKey: false }
  //   ],
  //   notes: [
  //     '✔️ Miễn phí, không cần key',
  //     '✔️ Tương thích mọi mainboard',
  //     '✔️ Hỗ trợ WOL (Wake on LAN)'
  //   ]
  // }
]

export default function Home() {
  // State management
  const [selectedChip, setSelectedChip] = useState<ChipType>('esp32-s3') // Default to S3
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
  const [activeTab, setActiveTab] = useState<'flash' | 'monitor'>('flash')
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [pendingFirmware, setPendingFirmware] = useState<FirmwareCategory | null>(null)
  const flashTool = useRef<ESP32FlashTool>(new ESP32FlashTool())

  const selectedChipInfo = CHIPS.find(chip => chip.id === selectedChip)
  const selectedFirmwareInfo = FIRMWARES.find(fw => fw.id === selectedFirmware)

  // Auto show YouTube ad once per session (only once ever)
  useEffect(() => {
    const hasSeenYouTubeAd = localStorage.getItem('hasSeenYouTubeAd')
    if (!hasSeenYouTubeAd || hasSeenYouTubeAd !== 'true') {
      const timer = setTimeout(() => {
        setShowYouTubeAd(true)
        localStorage.setItem('hasSeenYouTubeAd', 'true')
      }, 3000)
      
      // Cleanup timer on unmount
      return () => clearTimeout(timer)
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
        // Check if rate limited or blocked
        if (result.message?.includes('chặn') || result.message?.includes('spam')) {
          setFlashStatus(`🚫 ${result.message}`)
        } else {
          setFlashStatus(`❌ ${result.message}`)
        }
        setKeyValidated(false)
      }
    } catch (error: any) {
      // Check for rate limit response (HTTP 429)
      if (error.message?.includes('429') || error.message?.includes('Too many')) {
        setFlashStatus('🚫 Quá nhiều lần thử! Vui lòng chờ 15 phút và thử lại.')
      } else {
        setFlashStatus('❌ Lỗi kết nối API. Vui lòng thử lại.')
      }
      setKeyValidated(false)
    } finally {
      setIsValidatingKey(false)
    }
  }

  // Handle firmware button click - Show connect modal
  const handleFirmwareClick = (firmwareId: FirmwareCategory) => {
    setPendingFirmware(firmwareId)
    setShowConnectModal(true)
  }

  const handleConnect = async () => {
    // Check WebSerial API support
    if (!('serial' in navigator)) {
      setFlashStatus('❌ Trình duyệt không hỗ trợ WebSerial API. Vui lòng dùng Chrome, Edge, hoặc Opera (không phải Firefox/Safari)')
      return
    }

    // Check if running on HTTPS or localhost
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
      setFlashStatus('❌ WebSerial chỉ hoạt động trên HTTPS hoặc localhost')
      return
    }

    try {
      setFlashStatus('🔌 Đang kết nối với ESP32...')
      await flashTool.current.connect()
      
      // If we get here, connection was successful
      const port = flashTool.current.getPort()
      setSerialPort(port)
      setIsConnected(true)
      setFlashStatus('✅ Đã kết nối với ESP32!')
      // Keep modal open to show "Nạp" button
      
    } catch (error: any) {
      console.error('Connection error:', error)
      setIsConnected(false)
      
      // Provide specific error messages
      if (error.name === 'NotFoundError') {
        setFlashStatus('❌ Không tìm thấy thiết bị USB. Vui lòng cắm ESP32 và thử lại.')
      } else if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        setFlashStatus('❌ Bạn đã từ chối quyền truy cập. Vui lòng thử lại và cho phép kết nối.')
      } else if (error.name === 'NetworkError') {
        setFlashStatus('❌ Thiết bị đang được sử dụng bởi ứng dụng khác. Đóng Arduino IDE, PlatformIO, hoặc ứng dụng serial khác.')
      } else {
        setFlashStatus(`❌ Lỗi kết nối: ${error.message}`)
      }
      
      setIsConnected(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setFlashStatus('🔌 Đang ngắt kết nối...')
      await flashTool.current.disconnect()
      setSerialPort(null)
      setIsConnected(false)
      setFlashStatus('✅ Đã ngắt kết nối!')
    } catch (error: any) {
      console.error('Disconnect error:', error)
      setFlashStatus(`❌ Lỗi ngắt kết nối: ${error.message}`)
    }
  }

  const handleFlash = async (firmwareOverride?: FirmwareCategory) => {
    const targetFirmware = firmwareOverride || selectedFirmware
    const targetFirmwareInfo = FIRMWARES.find(fw => fw.id === targetFirmware)
    
    if (!selectedChip || !targetFirmware) {
      setFlashStatus('❌ Vui lòng chọn chip và firmware!')
      return
    }

    if (targetFirmwareInfo?.requiresKey && !keyValidated) {
      setFlashStatus('❌ Firmware này yêu cầu key hợp lệ!')
      return
    }

    if (!isConnected) {
      setFlashStatus('❌ Vui lòng kết nối với ESP32 trước!')
      return
    }

    try {
      setFlashStatus('📥 Đang tải firmware...')
      
      // Get firmware repo config for target firmware
      const repoConfig = getFirmwareRepoConfig(targetFirmware)
      if (!repoConfig) {
        setFlashStatus('❌ Không tìm thấy cấu hình firmware!')
        return
      }

      // Get firmware from the specific firmware repository
      const firmwareList = await githubReleaseManager.getFirmwareListFromRepo(repoConfig.owner, repoConfig.repo)
      
      // Debug log
      console.log('Firmware list:', firmwareList)
      console.log('Selected chip:', selectedChip)
      
      const firmwarePattern = `${selectedChip}`
      const firmware = firmwareList.find(fw => fw.name.toLowerCase().includes(firmwarePattern.toLowerCase()))

      if (!firmware) {
        setFlashStatus(`❌ Không tìm thấy firmware phù hợp! (Tìm: ${firmwarePattern}, Có: ${firmwareList.map(f => f.name).join(', ')})`)
        console.error('Available firmware:', firmwareList)
        return
      }
      
      console.log('Selected firmware:', firmware)

      setFlashStatus('⬇️ Đang tải firmware...')
      
      // Use Cloudflare Worker proxy to bypass CORS
      const proxyUrl = `https://firmware-proxy.minizjp.workers.dev?url=${encodeURIComponent(firmware.downloadUrl)}`
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Không thể tải firmware: ${errorText}`)
      }
      
      const firmwareData = await response.arrayBuffer()
      console.log(`✅ Firmware downloaded: ${(firmwareData.byteLength / 1024).toFixed(0)} KB`)
      
      if (firmwareData.byteLength === 0) {
        throw new Error('Firmware file rỗng - vui lòng thử lại')
      }
      
      setFlashStatus('🔄 Đang flash firmware...')
      
      const flashSuccess = await flashTool.current.flashFirmware(
        firmwareData,
        (progress) => {
          setFlashProgress(progress)
          setFlashStatus(`⏳ Flashing... ${progress.progress}%`)
        }
      )

      // Only show success if flash actually succeeded
      if (flashSuccess) {
        setFlashStatus('🎉 Flash firmware thành công!')
        setFlashProgress(null)
        
        // Show YouTube ad after successful flash (only if not seen before)
        const hasSeenYouTubeAd = localStorage.getItem('hasSeenYouTubeAd')
        if (selectedFirmwareInfo?.youtubeUrl && !hasSeenYouTubeAd) {
          setTimeout(() => {
            setShowYouTubeAd(true)
            localStorage.setItem('hasSeenYouTubeAd', 'true')
          }, 2000)
        }
      } else {
        // Flash returned false - check console for details
        console.error('Flash failed with no exception - check ESP32 connection')
        throw new Error('Flash firmware thất bại. Vui lòng kiểm tra console để biết chi tiết.')
      }
      
    } catch (error: any) {
      console.error('Flash error caught:', error)
      setFlashStatus(`❌ ${error.message || 'Lỗi không xác định'}`)
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

        {/* Firmware Grid Section - Like xiaozhi.vn */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2" 
                style={{ textShadow: '0 4px 8px rgba(0,136,122,0.15)' }}>
              Kho Firmware Minizjp
            </h2>
            <p className="text-primary-dark text-lg">Chọn chương trình và phiên bản chip bạn muốn nạp</p>
          </div>
          
          {/* Chip Selector Tabs - Like xiaozhi.vn */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex bg-gray-800 rounded-xl p-1 shadow-xl">
              {CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChip(chip.id)}
                  className={`px-8 py-3 rounded-lg font-medium transition-all ${
                    selectedChip === chip.id
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {chip.name}
                </button>
              ))}
            </div>
          </div>

          {/* Firmware Grid */}
          {selectedChip === 'esp32-s3' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {FIRMWARES.map((firmware) => (
                <div key={firmware.id} className="bg-white border-2 border-primary/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Firmware Image - 1:1 Aspect Ratio */}
                  <div className="relative w-full aspect-square bg-gray-900 overflow-hidden">
                    {firmware.image ? (
                      <Image 
                        src={firmware.image} 
                        alt={firmware.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-4xl">
                        📱
                      </div>
                    )}
                    {/* Badge overlay */}
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-md ${
                        firmware.requiresKey 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {firmware.requiresKey ? '🔑' : '🆓'}
                      </div>
                    </div>
                  </div>

                  {/* Firmware Info */}
                  <div className="p-3">
                    <h3 className="text-base font-bold text-primary mb-1">{firmware.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{firmware.description}</p>
                    
                    {/* Quick links */}
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {firmware.youtubeUrl && (
                        <a href={firmware.youtubeUrl} target="_blank" rel="noopener noreferrer"
                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs transition-colors">
                          📺
                        </a>
                      )}
                      {firmware.schematicUrl && (
                        <a href={firmware.schematicUrl} target="_blank" rel="noopener noreferrer"
                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs transition-colors">
                          📋
                        </a>
                      )}
                      {firmware.file3dUrl && (
                        <a href={firmware.file3dUrl} target="_blank" rel="noopener noreferrer"
                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs transition-colors">
                          🗂️
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Firmware Features - Compact */}
                  <div className="px-3 pb-2 border-t border-gray-100 pt-2">
                    <div className="space-y-1">
                      {firmware.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="text-xs text-gray-700 flex items-start">
                          <span className="text-green-500 mr-1 text-xs">✓</span>
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 pt-2">
                    <button
                      onClick={() => handleFirmwareClick(firmware.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2"
                    >
                      Nạp FW
                    </button>
                    <div className="flex gap-2">
                      {firmware.schematicUrl && (
                        <a
                          href={firmware.schematicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1.5 rounded text-center text-xs font-medium transition-colors"
                        >
                          📋
                        </a>
                      )}
                      {firmware.file3dUrl && (
                        <a
                          href={firmware.file3dUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1.5 rounded text-center text-xs font-medium transition-colors"
                        >
                          🗂️
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-yellow-800 font-bold text-lg">📦 Chip này còn đang phát triển</p>
              <p className="text-yellow-700 text-sm mt-2">Vui lòng quay lại sau</p>
            </div>
          )}
        </section>

        {/* Step 3: Key Authentication */}
        {selectedFirmware && selectedFirmwareInfo?.requiresKey && (
          <section className="mb-12">
            <div className="bg-secondary border-2 border-secondary-dark rounded-xl p-6 shadow-lg max-w-md">
              <h3 className="text-xl font-bold text-primary mb-4">🔑 Xác Thực Key</h3>
              <p className="text-primary-dark mb-4">Firmware này yêu cầu key để sử dụng:</p>
              
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Nhập 9 số key..."
                  value={authKey}
                  onChange={(e: any) => setAuthKey(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="flex-1 bg-white border-2 border-primary/30 rounded-xl px-6 py-4 text-primary placeholder-gray-400 focus:outline-none focus:border-primary shadow-lg"
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
              
              {/* Tab Navigation */}
              <div className="flex space-x-2 mb-6 border-b-2 border-primary/20">
                <button
                  onClick={() => setActiveTab('flash')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'flash'
                      ? 'text-primary border-b-4 border-primary -mb-0.5'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  ⚡ Flash Firmware
                </button>
                <button
                  onClick={() => setActiveTab('monitor')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'monitor'
                      ? 'text-primary border-b-4 border-primary -mb-0.5'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  📡 Serial Monitor
                </button>
              </div>

              {/* Connection Status Bar */}
              <div className="mb-6 p-4 bg-white border-2 border-primary/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="text-primary font-medium">
                    {isConnected ? '✅ Đã kết nối ESP32' : '⚠️ Chưa kết nối'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {!isConnected ? (
                    <button
                      onClick={handleConnect}
                      className="bg-accent-blue hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
                    >
                      🔌 Kết nối thiết bị
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
                    >
                      🔌 Ngắt kết nối
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'flash' && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4">🚀 Nạp Firmware</h3>
                  
                  {!isConnected && (
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-yellow-800 text-sm font-medium">
                      ⚠️ Vui lòng kết nối thiết bị ESP32 ở phía trên để bắt đầu
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleFlash()}
                    disabled={!isConnected || flashProgress !== null}
                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white border-2 border-primary-dark rounded-lg px-6 py-4 font-medium transition-colors shadow-md mb-4"
                  >
                    {flashProgress ? '⏳ Đang nạp...' : '⚡ Bắt đầu nạp Firmware'}
                  </button>
                  
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
              )}

              {activeTab === 'monitor' && (
                <SerialMonitor port={serialPort} isConnected={isConnected} />
              )}
            </div>
          </section>
        )}



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
              <p className="text-yellow-800 text-sm mb-3">
                <strong>💡 Lưu ý bảo mật:</strong> Mỗi key chỉ có thể sử dụng với một thiết bị duy nhất.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3">
                <p className="text-red-800 text-sm font-semibold">
                  <strong>🚫 Chống spam:</strong> Hệ thống có rate limiting - tối đa 5 lần thử sai trong 15 phút.
                </p>
                <p className="text-red-700 text-xs mt-1">
                  Nếu spam key sai, IP của bạn sẽ bị chặn 60 phút. Không thể brute force!
                </p>
              </div>
              <details className="text-yellow-800 text-sm">
                <summary className="cursor-pointer font-semibold">🔧 Xử lý lỗi thường gặp</summary>
                <div className="mt-3 space-y-2 pl-4">
                  <p><strong>❌ Không hiện popup chọn USB:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Dùng Chrome, Edge, hoặc Opera (không phải Firefox/Safari)</li>
                    <li>Website phải chạy trên HTTPS hoặc localhost</li>
                    <li>Kiểm tra cáp USB có kết nối tốt không</li>
                    <li>Thử cổng USB khác trên máy tính</li>
                  </ul>
                  <p className="mt-2"><strong>❌ Không tìm thấy thiết bị:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cài driver CH340/CP2102 cho ESP32</li>
                    <li>Đóng Arduino IDE, PlatformIO hoặc app serial khác</li>
                    <li>Thử nhấn giữ nút BOOT khi cắm USB</li>
                  </ul>
                </div>
              </details>
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

      {/* Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => {
                setShowConnectModal(false)
                setPendingFirmware(null)
                setIsConnected(false)
                setFlashStatus('')
              }}
              className="float-right text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-primary mb-4">
              {isConnected ? '✅ Đã kết nối' : '🔌 Kết nối thiết bị'}
            </h3>
            
            {!isConnected ? (
              <>
                <p className="text-gray-600 mb-6">
                  Vui lòng kết nối ESP32 qua USB để tiếp tục nạp firmware
                </p>
                
                <button
                  onClick={handleConnect}
                  className="w-full bg-accent-blue hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                >
                  🔌 Kết nối ESP32
                </button>
              </>
            ) : (
              <>
                <p className="text-green-600 mb-6 font-medium">
                  ✅ Thiết bị đã sẵn sàng! Bấm nút bên dưới để bắt đầu nạp firmware
                </p>
                
                <button
                  onClick={async () => {
                    // Flash first, then close modal on success
                    if (pendingFirmware) {
                      setSelectedFirmware(pendingFirmware)
                      // Flash with explicit firmware parameter
                      await handleFlash(pendingFirmware)
                      // Close modal after flash completes (success or error)
                      setShowConnectModal(false)
                    }
                  }}
                  disabled={flashProgress !== null}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg animate-pulse"
                >
                  {flashProgress ? '⏳ Đang nạp...' : '⚡ Nạp Firmware'}
                </button>
              </>
            )}

            {flashStatus && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                flashStatus.includes('✅') ? 'bg-green-50 text-green-800' :
                flashStatus.includes('❌') ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {flashStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}