// Cloudflare Worker to proxy firmware downloads from GitHub
// Deploy this to Cloudflare Workers at: firmware-proxy.minizjp.workers.dev

export default {
  async fetch(request: Request): Promise<Response> {
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const firmwareUrl = url.searchParams.get('url')

    // Validate firmware URL
    if (!firmwareUrl) {
      return new Response('Missing url parameter', { status: 400 })
    }

    // Only allow GitHub URLs
    if (!firmwareUrl.startsWith('https://github.com/') && 
        !firmwareUrl.startsWith('https://objects.githubusercontent.com/')) {
      return new Response('Invalid URL - must be from GitHub', { status: 400 })
    }

    try {
      // Fetch firmware from GitHub
      const response = await fetch(firmwareUrl, {
        headers: {
          'User-Agent': 'ESP32-Flash-Tool-Proxy',
          'Accept': 'application/octet-stream',
        },
        redirect: 'follow', // Follow redirects
      })

      if (!response.ok) {
        return new Response(`Failed to fetch firmware: ${response.statusText}`, {
          status: response.status,
        })
      }

      // Create new response with CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
      })

      // Add CORS headers
      newResponse.headers.set('Access-Control-Allow-Origin', '*')
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET')
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      newResponse.headers.set('Content-Type', 'application/octet-stream')
      newResponse.headers.set('Cache-Control', 'public, max-age=3600')

      return newResponse
    } catch (error: any) {
      return new Response(`Error: ${error.message}`, { status: 500 })
    }
  },
}
