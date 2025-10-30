/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for static export (GitHub Pages) - only for build
  // Dev mode uses default .next directory
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    distDir: 'out',
  }),
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
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