# Copilot / AI agent instructions for this repository

Purpose: give concise, actionable rules so an automated coding agent (Copilot-style) edits this repo safely and predictably.

Quick rules
- Read `script.js`, `kegel-timer.html`, and `tests/test-runner.html` first — they contain the app logic, UI, and test harness.
- Never force-reset or clear users' localStorage in production files. Test-only resets must live inside `tests/test-runner.html` or test-specific code.
- Keep changes minimal and focused. Don't reformat whole files.

Key files to inspect (in order)
- `script.js` — primary application logic, debug utility (`window.lsDebug`), and localStorage initialization IIFE.
- `kegel-timer.html` — application shell and UI. Ensure debug panel markup (id `ls-debug-panel`) exists when adding the debug UI.
- `tests/test-runner.html` — browser test harness. It exposes `window.forceResetLocalStorage()` and `window.restoreLocalStorage()` and auto-runs tests.
- `tests/test-framework.js` and files under `tests/unit` and `tests/integration` — review test helpers and existing tests before adding new ones.

LocalStorage conventions
- Keys in use: `todayCount`, `streak`, `lastDate`.
- Production behavior: app initializes missing keys only ("set if missing"). Do not overwrite existing values in the production app.
- Test behavior: `tests/test-runner.html` backs up existing values, writes deterministic initial values (`todayCount: '0'`, `streak: '0'`), and exposes a `restoreLocalStorage()` to return the prior state.

Debug panel and test helpers
- Debug panel DOM id: `ls-debug-panel`. The debug IIFE in `script.js` will only show the panel if the element exists and `?debug=true` is present in the URL.
- Debug API: `window.lsDebug` with methods `show()`, `refresh()`, `clear()`, `getItem(key)`, `setItem(key, value)`.
- Test harness debugging helpers: `window.testDebug` (in `tests/test-runner.html`) logs test output to the runner UI.

How to run / test locally
- Start a local HTTP server from the repo root. Recommended: run the VS Code task "Start Timer Server" (uses `start-timer.bat`) or run `python -m http.server 8000` from the repo root.
- Open `kegel-timer.html` for manual app testing. Add `?debug=true` to the URL to enable the debug panel (if markup is present).
- Open `tests/test-runner.html` in a browser to run the automated tests. The test harness auto-runs on load and forces a test-only localStorage reset first.

Editing and PR guidance for AI agents
- Small focused commits. Each change should include a short README/commit message describing intent.
- Before editing `script.js` or `kegel-timer.html`, run the tests in `tests/test-runner.html` to ensure no regressions.
- If adding new tests, place them under `tests/unit` (unit) or `tests/integration` (e2e) and update the runner if necessary.
- Avoid changing the service worker (`sw.js`) or manifest unless you're explicitly updating PWA behavior; note that those affect cached assets during development.

Acceptance criteria for changes touching state or tests
- Production pages must not clear user data on load. (Verify `kegel-timer.html` only initializes missing keys.)
- Tests must run deterministically: test-runner should back up and restore localStorage values and seed a known initial state.
- Debug panel must appear when `?debug=true` and the markup exists; `window.lsDebug` functions must work and log to console.

When you're blocked
- If a required DOM element is missing (for example the debug panel), prefer adding a small, well-scoped HTML block near the bottom of `kegel-timer.html` rather than reworking page structure.
- If tests are failing due to environment issues (service worker cache, offline), run the runner in an Incognito/Private window with service worker disabled, or unregister the service worker in dev tools.

Contact point for humans
- If the change could overwrite user data or alter the PWA caching strategy, create a draft PR and request a human review.

Minimal troubleshooting checklist for humans
1. Start server, open `tests/test-runner.html`.
2. Confirm console logs: script included/loaded, LocalStorage Debug Utility IIFE called, LocalStorage initialization IIFE called, ServiceWorker registered.
3. If debug panel not visible: confirm `?debug=true` is in URL and `#ls-debug-panel` markup exists in `kegel-timer.html`.

---
Keep this file short and update when test patterns or localStorage keys change.
# Code Review & Refactor Progress Tracking

For any significant code review, refactor, or multi-step implementation:

- Create or update a progress tracking file (e.g., `docs/code-review-progress.md`).
- The progress file should:
  - Reference the main code review or requirements document.
  - List all actionable items extracted from the review, categorized and mapped to files/regions.
  - Track progress with a visible todo list and dated progress log.
- Each implementation step (e.g., bug fix, optimization, readability, best practice, security, testing) should be committed separately with a descriptive message.
- The progress file must be updated after each step and referenced in code review discussions and PRs.
- This ensures traceability, reviewability, and a clear audit trail for all code review-driven or multi-step changes.

This workflow is recommended for any complex or multi-phase development effort, not just code reviews.
# GitHub Copilot Instructions

## Project Overview

This is a dual-purpose GitHub Pages site combining a professional developer hub (`index.html`) with a Progressive Web App (PWA) Kegel exercise timer (`kegel-timer.html`). The project was built as an exploration of AI-assisted development with minimal direct code manipulation.

## Architecture & Key Components

### Dual-Page Structure
- **Developer Hub** (`index.html` + `hub.js`): Professional portfolio with panel-based navigation
- **Kegel Timer** (`kegel-timer.html` + `script.js`): Timer application with exercise routines and progress tracking
- **Shared Resources**: `styles.css`, `manifest.json`, `sw.js`, and `icons/` directory

### PWA Implementation
- Service Worker (`sw.js`) caches assets for offline functionality
- Manifest file enables app installation on mobile devices
- Both pages link to PWA resources but timer app is the primary PWA entry point

### Navigation Pattern
Both pages use a **panel-based UI system**:
```javascript
// Standard pattern for showing/hiding content panels
function hideAllPanels() {
    // Hide all panels before showing the target
}
// Then show specific panel with display: 'block'
```

## Development Workflows

### Local Development
1. **Recommended**: Use `start-timer.bat` which launches Python HTTP server at `localhost:8000`
2. **Alternative**: Open HTML files directly, but service workers won't function
3. **Testing**: Open `tests/test-runner.html` for custom test framework

### VS Code Tasks Available
- `Start Timer Server`: Launches the Python development server
- `Start Test Server`: Alternative HTTP server for testing

### Testing Framework
Custom browser-based testing in `tests/`:
- `test-framework.js`: Simple assertion framework
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- Run via `test-runner.html`

## Project-Specific Patterns

### JavaScript Architecture
- **No bundling**: Direct script includes, vanilla JavaScript
- **DOM-first approach**: Heavy use of `getElementById()` and direct DOM manipulation
- **Defensive coding**: Extensive null checks before DOM operations:
  ```javascript
  if (element) element.addEventListener(...)
  ```

### Timer Implementation (`script.js`)
- Uses `setInterval()` for countdown timers
- Web Audio API for sound feedback
- Vibration API for haptic feedback
- LocalStorage for progress persistence

### CSS Strategy
- Single shared `styles.css` for both applications
- Panel-based layouts with `display: none/block` toggling
- Responsive design with mobile-first approach

### AI Development Context
Comments throughout indicate AI-assisted development:
```html
<!-- This application was transformed using AI code generation tools -->
```

## Key File Relationships

- `index.html` ↔ `hub.js`: Developer portfolio functionality
- `kegel-timer.html` ↔ `script.js`: Timer application logic
- `manifest.json` + `sw.js`: PWA infrastructure for both pages
- `tests/`: Independent testing system with custom framework

## Common Tasks

### Adding New Exercise Routines
Modify the exercise objects in `script.js` and add corresponding UI buttons in `kegel-timer.html`.

### Styling Changes
Edit `styles.css` - changes affect both applications. Use class naming that indicates which app (e.g., `.timer-specific` vs `.hub-specific`).

### PWA Updates
Update `CACHE_NAME` in `sw.js` and add new assets to `ASSETS_TO_CACHE` array when adding files.

### Adding Tests
Use the custom framework in `tests/test-framework.js` - add tests via `addUnitTest()` or `addIntegrationTest()` functions.
