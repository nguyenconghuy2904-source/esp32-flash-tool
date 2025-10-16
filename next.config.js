/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for static export (GitHub Pages)
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.minizjp.com',
    NEXT_PUBLIC_GITHUB_REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || 'nguyenconghuy2904-source/esp32-flash-tool'
  }
}

module.exports = nextConfig