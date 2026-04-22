/**
 * Remove **legacy** service workers (e.g. root `sw.js` from the old `kegel-timer.html` flow) so
 * they do not cache/stale the site. **Keeps** workers whose script lives under `/kegel/` (the
 * PWA from `vite-plugin-pwa`). See docs/kegel-migration-plan.md §9.2.
 */
export async function unregisterLegacyServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    for (const r of regs) {
      const script = r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL
      if (script) {
        try {
          const path = new URL(script, location.origin).pathname
          if (path.startsWith('/kegel/')) {
            continue
          }
        } catch {
          /* treat as legacy */
        }
      }
      await r.unregister()
    }
  } catch {
    /* ignore */
  }
}
