// GitHub API client for managing firmware releases
export interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  created_at: string
  published_at: string
  assets: GitHubAsset[]
}

export interface GitHubAsset {
  id: number
  name: string
  size: number
  download_count: number
  browser_download_url: string
  content_type: string
}

export interface FirmwareInfo {
  name: string
  version: string
  description: string
  downloadUrl: string
  size: number
  uploadDate: string
  chipType?: string
  compatibility?: string[]
}

class GitHubReleaseManager {
  private owner: string
  private repo: string
  private apiBase: string = 'https://api.github.com'
  private releaseCache: Map<string, GitHubRelease[]> = new Map()

  constructor(repository?: string) {
    const repoPath = repository || process.env.NEXT_PUBLIC_GITHUB_REPO || 'user/esp32-flash-tool'
    const [owner, repo] = repoPath.split('/')
    this.owner = owner
    this.repo = repo
  }

  async fetchReleases(): Promise<GitHubRelease[]> {
    try {
      const response = await fetch(`${this.apiBase}/repos/${this.owner}/${this.repo}/releases`)
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching releases:', error)
      return []
    }
  }

  async fetchReleasesFromRepo(owner: string, repo: string): Promise<GitHubRelease[]> {
    const cacheKey = `${owner}/${repo}`
    
    // Check cache first
    if (this.releaseCache.has(cacheKey)) {
      return this.releaseCache.get(cacheKey) || []
    }

    try {
      const response = await fetch(`${this.apiBase}/repos/${owner}/${repo}/releases`)
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      const data = await response.json()
      this.releaseCache.set(cacheKey, data)
      return data
    } catch (error) {
      console.error(`Error fetching releases from ${owner}/${repo}:`, error)
      return []
    }
  }

  async getFirmwareList(): Promise<FirmwareInfo[]> {
    const releases = await this.fetchReleases()
    const firmwareList: FirmwareInfo[] = []

    for (const release of releases) {
      for (const asset of release.assets) {
        // Filter for .bin files
        if (asset.name.endsWith('.bin')) {
          const firmware: FirmwareInfo = {
            name: asset.name,
            version: release.tag_name,
            description: release.body || release.name,
            downloadUrl: asset.browser_download_url,
            size: asset.size,
            uploadDate: release.published_at || release.created_at,
            chipType: this.extractChipType(asset.name),
            compatibility: this.extractCompatibility(release.body)
          }
          firmwareList.push(firmware)
        }
      }
    }

    return firmwareList.sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )
  }

  async getFirmwareListFromRepo(owner: string, repo: string): Promise<FirmwareInfo[]> {
    const releases = await this.fetchReleasesFromRepo(owner, repo)
    const firmwareList: FirmwareInfo[] = []

    for (const release of releases) {
      for (const asset of release.assets) {
        // Filter for .bin files
        if (asset.name.endsWith('.bin')) {
          const firmware: FirmwareInfo = {
            name: asset.name,
            version: release.tag_name,
            description: release.body || release.name,
            downloadUrl: asset.browser_download_url,
            size: asset.size,
            uploadDate: release.published_at || release.created_at,
            chipType: this.extractChipType(asset.name),
            compatibility: this.extractCompatibility(release.body)
          }
          firmwareList.push(firmware)
        }
      }
    }

    return firmwareList.sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )
  }

  async downloadFirmware(downloadUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }
    return await response.arrayBuffer()
  }

  private extractChipType(filename: string): string {
    const match = filename.match(/(esp32[-_]?s?[0-9]*)/i)
    return match ? match[1].toUpperCase() : 'ESP32-S3'
  }

  private extractCompatibility(description: string): string[] {
    if (!description) return []
    
    const compatMatch = description.match(/compatibility[:\s]*([^\n\r]*)/i)
    if (compatMatch) {
      return compatMatch[1]
        .split(/[,;]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
    }
    return []
  }

  getRepositoryUrl(): string {
    return `https://github.com/${this.owner}/${this.repo}`
  }

  getReleasesUrl(): string {
    return `${this.getRepositoryUrl()}/releases`
  }
}

export const githubReleaseManager = new GitHubReleaseManager()

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}