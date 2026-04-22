# Copilot / AI agent instructions

## Core project understanding

This GitHub Pages repo has:

- **`index.html`** — developer portfolio hub  
- **`kegel/`** — **primary** Kegel timer (Vite + React + TypeScript, source in **`kegel-ui/`**)  
- **`kegel-timer.html` + `script.js`** — legacy static timer; redirects to **`/kegel/`**; do not treat as the main product for new work  

## Essential files to read first

1. **`kegel-ui/`** — React app: `src/App.tsx`, `src/hooks/useKegelTimer.ts`, `src/lib/progressStorage.ts`  
2. **`script.js`** — legacy timer only (still used by `kegel-timer.html`)  
3. **`tests/test-runner.html`** — legacy browser harness; **deprecated** for the React app (use `cd kegel-ui && npm test`)

## Critical invariants

- **Never** clear users’ `localStorage` in production code without an explicit migration and user-facing reason.  
- React app reuses legacy keys where noted in `progressStorage.ts` (`todayCount`, `streak`, `lastDate`, `kegel_sessionDay`).  
- Legacy tests: deterministic `localStorage`; `window.restoreLocalStorage()` / `window.forceResetLocalStorage()` where applicable.

## Developer workflow

- **React Kegel:** `cd kegel-ui && npm ci && npm run dev:kegel` (or `npm test` / `npm run build`)  
- **Legacy page:** local static server at repo root if you must touch `kegel-timer.html` / `script.js`  
- **Service workers:** v1 React app **unregisters** existing workers on load (`unregisterLegacyServiceWorkers`); do not add `navigator.serviceWorker.register` in `kegel-ui` until PWA is an explicit goal.

## UI architecture (legacy `script.js`)

- Panel-based UI: `hideAllPanels()` then show target panel  
- Check DOM elements exist before use: `if (element) element.addEventListener(...)`  

## Debug tools (legacy)

- Debug panel with `?debug=true` (DOM id: `ls-debug-panel`)  
- `window.lsDebug`: `show()`, `refresh()`, `clear()`, `getItem`, `setItem`

## Testing

- **React:** `kegel-ui` — Vitest (`npm test`)  
- **Legacy:** `tests/test-framework.js` + `tests/test-runner.html` (maintenance only)

## Documentation

- Migration and cutover: [docs/kegel-migration-plan.md](../docs/kegel-migration-plan.md) (in-repo; keep in sync with implementation)
