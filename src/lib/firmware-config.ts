// Firmware repository configuration
export interface FirmwareRepoConfig {
  id: string
  name: string
  repository: string
  owner: string
  repo: string
}

export const FIRMWARE_REPOS: Record<string, FirmwareRepoConfig> = {
  'kiki-day': {
    id: 'kiki-day',
    name: 'Kiki đây',
    repository: 'nguyenconghuy2904-source/xiaozhi-esp32-kiki-day',
    owner: 'nguyenconghuy2904-source',
    repo: 'xiaozhi-esp32-kiki-day'
  },
  'robot-otto': {
    id: 'robot-otto',
    name: 'Robot Otto',
    repository: 'nguyenconghuy2904-source/robot-otto-firmware',
    owner: 'nguyenconghuy2904-source',
    repo: 'robot-otto-firmware'
  },
  'dogmaster': {
    id: 'dogmaster',
    name: 'Thùng Rác Thông Minh',
    repository: 'nguyenconghuy2904-source/smart-trash-bin-firmware',
    owner: 'nguyenconghuy2904-source',
    repo: 'smart-trash-bin-firmware'
  },
  'smart-switch-pc': {
    id: 'smart-switch-pc',
    name: 'Smart Switch PC',
    repository: 'nguyenconghuy2904-source/smart-switch-pc-firmware',
    owner: 'nguyenconghuy2904-source',
    repo: 'smart-switch-pc-firmware'
  }
}

export function getFirmwareRepoConfig(firmwareId: string): FirmwareRepoConfig | undefined {
  return FIRMWARE_REPOS[firmwareId]
}
