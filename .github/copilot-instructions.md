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
