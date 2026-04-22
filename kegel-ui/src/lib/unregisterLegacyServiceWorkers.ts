/**
 * v1 Kegel app ships without a service worker. Users of legacy `kegel-timer.html` + `sw.js`
 * may have a stale registration; clear it once so GitHub Pages serves fresh `/kegel/` assets.
 * See kegel-migration-plan.md §9.2.
 */
export async function unregisterLegacyServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.unregister()))
  } catch {
    /* ignore */
  }
}
