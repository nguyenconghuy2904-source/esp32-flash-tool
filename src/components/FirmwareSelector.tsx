'use client'

import { useState, useEffect } from 'react'
import { githubReleaseManager, FirmwareInfo, formatFileSize, formatDate } from '@/lib/github-releases'

interface FirmwareSelectorProps {
  onFirmwareSelect: (firmware: FirmwareInfo) => void
  selectedFirmware?: FirmwareInfo | null
  disabled?: boolean
}

export default function FirmwareSelector({ 
  onFirmwareSelect, 
  selectedFirmware,
  disabled = false 
}: FirmwareSelectorProps) {
  const [firmwareList, setFirmwareList] = useState<FirmwareInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadFirmwareList()
  }, [])

  const loadFirmwareList = async () => {
    try {
      setLoading(true)
      setError('')
      const firmwares = await githubReleaseManager.getFirmwareList()
      setFirmwareList(firmwares)
    } catch (err) {
      setError('Không thể tải danh sách firmware: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleFirmwareClick = (firmware: FirmwareInfo) => {
    if (disabled) return
    onFirmwareSelect(firmware)
  }

  const displayedFirmwares = showAll ? firmwareList : firmwareList.slice(0, 5)

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          📦 Firmware từ GitHub Releases
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách firmware...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          📦 Firmware từ GitHub Releases
        </h3>
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button
            onClick={loadFirmwareList}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📦 Firmware từ GitHub Releases
        </h3>
        <a
          href={githubReleaseManager.getReleasesUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Xem tất cả →
        </a>
      </div>

      {firmwareList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có firmware nào được upload.</p>
          <p className="text-sm mt-2">
            Upload file .bin vào GitHub Releases để hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedFirmwares.map((firmware, index) => (
            <div
              key={`${firmware.name}-${firmware.version}`}
              onClick={() => handleFirmwareClick(firmware)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                disabled
                  ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                  : selectedFirmware?.downloadUrl === firmware.downloadUrl
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{firmware.name}</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {firmware.version}
                    </span>
                    {firmware.chipType && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {firmware.chipType}
                      </span>
                    )}
                  </div>
                  
                  {firmware.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {firmware.description.split('\n')[0].slice(0, 100)}
                      {firmware.description.length > 100 ? '...' : ''}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📁 {formatFileSize(firmware.size)}</span>
                    <span>📅 {formatDate(firmware.uploadDate)}</span>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {selectedFirmware?.downloadUrl === firmware.downloadUrl ? (
                    <span className="text-blue-600 font-medium">✓ Đã chọn</span>
                  ) : (
                    <span className="text-gray-400">Chọn</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {firmwareList.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {showAll ? 'Thu gọn' : `Xem thêm ${firmwareList.length - 5} firmware`}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        💡 <strong>Mẹo:</strong> Upload file .bin vào GitHub Releases để tự động hiển thị trong danh sách này.
      </div>
    </div>
  )
}