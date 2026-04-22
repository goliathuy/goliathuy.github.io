import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const KEGEL_PUBLIC_URL = 'https://goliathuy.github.io/kegel/'

/** Optional: Cloudflare Web Analytics (token from dashboard) + / or Open Graph for a preview image. */
function kegelHeadPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'kegel-head',
    transformIndexHtml(html) {
      const token = env.VITE_CF_WEB_ANALYTICS_TOKEN
      const ogImage = env.VITE_KEGEL_OG_IMAGE
      if (!token && !ogImage) {
        return html
      }
      const parts: string[] = []
      if (ogImage) {
        const title = 'Kegel timer'
        const desc = 'Guided Kegel exercise timer — pelvic floor sessions'
        parts.push(
          `    <meta property="og:type" content="website" />
    <meta property="og:url" content="${KEGEL_PUBLIC_URL}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${ogImage.replace(/"/g, '&quot;')}" />
    <meta name="twitter:card" content="summary_large_image" />`
        )
      }
      if (token) {
        const beaconJson = JSON.stringify({ token })
        parts.push(
          `    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=${JSON.stringify(
            beaconJson
          )}></script>`
        )
      }
      return html.replace('</head>', `${parts.join('\n')}\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: '/kegel/',
    plugins: [react(), tailwindcss(), kegelHeadPlugin(env)],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('motion')) return 'motion'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
          },
        },
      },
    },
  }
})
