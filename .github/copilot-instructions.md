# Copilot / AI agent instructions

## Core Project Understanding
This is a kegel exercise PWA with two main pages:
- `index.html` (hub page)
- `kegel-timer.html` (PWA timer functionality)

Main app logic lives in `script.js` with no bundling system - just vanilla JS loaded via script tags.

## Essential Files to Read First
1. `script.js` - Contains timer logic, localStorage initialization, and debug tools
2. `kegel-timer.html` - Main timer UI and debug panel markup
3. `tests/test-runner.html` - Test harness (auto-runs when opened)

## Critical Invariants
- **NEVER clear users' LocalStorage in production code**
- `script.js` only initializes LocalStorage keys if missing
- Key LocalStorage values: `todayCount`, `streak`, `lastDate`
- Tests use deterministic LocalStorage; use `window.restoreLocalStorage()` or `window.forceResetLocalStorage()` in tests

## Developer Workflow
- Run tests before/after changes: open `tests/test-runner.html` in browser
- For PWA/ServiceWorker testing: start local server at repo root
  - VS Code task "Start Timer Server" or `python -m http.server 8000`

## UI Architecture
- Panel-based UI: use `hideAllPanels()` then show target panel with `display: 'block'`
- Always check DOM element existence before operations:
  ```js
  if (element) element.addEventListener(...)
  ```

## Debug Tools
- Debug panel appears only with `?debug=true` in URL (DOM id: `ls-debug-panel`)
- Debug API: `window.lsDebug` with methods:
  - `show()`, `refresh()`, `clear()`
  - `getItem(key)`, `setItem(key, value)`

## Testing
- Framework: `tests/test-framework.js`
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`

## PWA Components
- Service Worker: `sw.js` - handles asset caching
- Manifest: `manifest.json` - defines PWA installation properties

## Edit Guidelines
- Make minimal, focused changes
- Preserve global names and existing patterns
- Run tests after changes
- Request human review for changes to user state or PWA caching
- Avoid reformatting code unnecessarily

## Acceptance Criteria
- Production pages preserve user data on load
- Tests run deterministically via test runner
- Test harness can restore pre-test LocalStorage


When generating PowerShell commands for pwsh -Command "...", always escape $ as `$ and inner double quotes as `". For complex logic, prefer a script file and use -File. For long one-liners, use -EncodedCommand to avoid nested quoting issues.