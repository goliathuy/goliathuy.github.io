import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

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
    plugins: [
      react(),
      tailwindcss(),
      kegelHeadPlugin(env),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'vite.svg'],
        manifest: {
          name: 'Kegel exercise timer',
          short_name: 'Kegel timer',
          description: 'Guided Kegel exercise timer — pelvic floor sessions',
          start_url: '/kegel/',
          scope: '/kegel/',
          display: 'standalone',
          background_color: '#f9f9f9',
          theme_color: '#4a90e2',
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
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
