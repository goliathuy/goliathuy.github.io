# Kegel UI backlog (React / `kegel-ui/`)

Migrated from the legacy **[code review progress](../docs/code-review-progress.md)**, which targeted **`script.js` + `kegel-timer.html`**. Items below are **rescoped** to the current stack. Superseded or already-covered legacy work is listed under *Done / N/A* so we do not duplicate it.

## Done / N/A (vs legacy list)

- **Timer races / stop guard** — `useKegelTimer` + React lifecycle (replaces ad hoc `script.js` guards).
- **AudioContext `resume` when suspended** — `src/lib/sounds.ts` calls `audioContext.resume()` when needed.
- **localStorage: parse/defaults** — `progressStorage.ts` and `customRoutineStorage.ts` defensively read and clamp; custom routine has `try`/`catch` on load/save.
- **PWA (scoped `/kegel/`)** — `vite-plugin-pwa` + Workbox (`sw.js`); `start_url` / `scope` `/kegel/`; legacy `unregisterLegacyServiceWorkers` keeps root `sw.js` from fighting the PWA, does not remove `/kegel/` workers.
- **Event delegation, cached DOM, monolithic “AppState” in `script.js`** — **N/A**; React + hooks replace these patterns. Do not port literally.

## Open (prioritized)

- [ ] **Storage hardening (parity with legacy “quota” intent):** `logSessionLegacy` and related writes are not all wrapped; on `QuotaExceeded` or `SecurityError`, consider silent degrade + optional one-time UI hint (or document “private mode” limits in README). *Maps legacy: localStorage try/catch + user feedback.*
- [ ] **Tests:** Expand Vitest for `progressStorage` / `loadProgress` (day roll, `NaN` in storage) and for storage failure paths if implemented. *Maps legacy: “update tests for all changes.”*
- [ ] **TSDoc** on public exports: `useKegelTimer`, `progressStorage` API, and any hook used from multiple files. *Maps legacy: JSDoc / constants / clarity — but TypeScript + named exports already cover much of this.*
- [ ] **A11y follow-up (§10.4):** full modal focus trap + screen-reader pass if you tighten beyond current `aria-live` + `eslint-plugin-jsx-a11y`.
- [ ] **Optional E2E:** Playwright (or similar) against `vite preview` — start → finish → log. *Legacy browser test runner is deprecated for Kegel; Vitest is primary.*
- [ ] **Optional: online / offline** — `navigator.onLine` + small non-blocking banner. *Low priority; not required for v1.* Legacy `script.js` had planned UI for this; React app does not need feature parity unless you want it.
- [x] **PWA** — Shipped: `vite-plugin-pwa` (`kegel-ui/vite.config.ts`), `registerSW` in `main.tsx` after legacy cleanup. Optional later: more precache, push, or stricter update UX.

## Legacy app (reference only)

**Yes, the old static version is still in the repo:** `kegel-timer.html` at the site root, with `script.js` and styles under the same paths as before. It shows a “moved” banner and **meta-refresh to `/kegel/` in 20s**, so the legacy UI is only briefly visible (users can still scroll to the old layout before redirect). *Canonical entry and portfolio links point to `/kegel/`.*
