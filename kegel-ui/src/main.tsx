import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { unregisterLegacyServiceWorkers } from './lib/unregisterLegacyServiceWorkers'

const root = document.getElementById('root')!

void (async () => {
  await unregisterLegacyServiceWorkers()
  registerSW({ immediate: true })
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})()
