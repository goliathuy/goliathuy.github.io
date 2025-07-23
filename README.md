
# Kegel Timer & Developer Hub — Dual-Purpose GitHub Pages Site

>This project is a dual-purpose GitHub Pages site combining a professional developer hub with a Progressive Web App (PWA) Kegel exercise timer. Built as an exploration of AI-assisted development with robust defensive coding and custom browser-based testing.

---

## 📁 Project Structure

```
goliathuy.github.io/
├── index.html                    # Developer portfolio hub
├── kegel-timer.html              # PWA timer application
├── hub.js                        # Hub functionality & navigation
├── script.js                     # Timer logic & PWA features
├── styles.css                    # Shared styling for both apps
├── manifest.json                 # PWA manifest configuration
├── sw.js                         # Service Worker for offline
├── start-timer.bat               # Development server launcher
├── debug-tests.bat               # Test debugging utilities
├── .vscode/
│   ├── launch.json               # VS Code debugging config
│   └── tasks.json                # Development tasks
├── icons/
│   ├── icon-192.png              # PWA icon (small)
│   ├── icon-512.png              # PWA icon (large)
│   └── generate-icons.html       # Icon generation tool
├── tests/
│   ├── test-framework.js         # Custom testing framework
│   ├── test-runner.html          # Browser test runner
│   ├── unit/
│   │   ├── timer-tests.js        # Timer functionality tests
│   │   ├── dom-manipulation-tests.js # DOM operation tests
│   │   └── debug-tests.js        # Debug panel tests
│   └── integration/
│       └── user-flow-tests.js    # End-to-end user flows
└── docs/
    ├── project-overview.html     # Visual documentation
    ├── explanations/
    │   └── project-overview.md   # Technical architecture
    ├── implementation/
    │   └── timer-system.md       # Implementation guide
    ├── tests/
    │   └── testing-framework.md  # Testing documentation
    └── api/
        └── core-functions.md     # API reference
```

---

## 🏠 Developer Hub

- Professional introduction, experience timeline, and skills showcase
- Panel-based navigation system
- Direct link to the Kegel Timer app

## ⏱️ Kegel Timer Application

- Visual timer with hold/relax phases
- Multiple pre-defined and custom exercise routines
- Progress tracking and streaks (localStorage)
- Audio and haptic feedback (Web Audio API, Vibration API)
- PWA: Offline support, installable on mobile
- Debug panel for localStorage inspection

## 🧪 Testing Framework

- Custom browser-based test runner (`test-framework.js`)
- Unit tests for timer, DOM, and debug panel
- Integration tests for user flows
- Run all tests via `tests/test-runner.html`

## 🚀 Local Development & Workflows

**Recommended:**
- Use `start-timer.bat` to launch a Python HTTP server at `localhost:8000` for local development
- Use VS Code launch configurations for Chrome debugging

**Testing:**
- Open `tests/test-runner.html` in your browser

**VS Code Tasks:**
- Start Timer Server: Launches Python development server
- Start Test Server: Alternative HTTP server for testing

## 📚 Documentation

- [Project Overview (HTML)](docs/project-overview.html)
- [API Reference](docs/api/core-functions.md)
- [Testing Documentation](docs/tests/testing-framework.md)
- [Implementation Guide](docs/implementation/timer-system.md)

## 💡 Key Patterns & Best Practices

- Defensive coding: Always check for element existence before DOM operations
- Panel-based UI: `hideAllPanels()` then show target panel
- LocalStorage: Fallback values and string storage
- PWA: Service worker cache versioning, manifest updates
- Custom test framework: Mocks for localStorage and timers

## 🗺️ Mermaid Diagrams & Visual Docs

See [project-overview.html](docs/project-overview.html) for interactive architecture and flow diagrams using Mermaid.js.

## 🔮 Future Developments

- Save progress/history to local file and allow upload
- Expand project collection and experience sections
- Add more advanced test cases and visualizations

## License

MIT License — see [LICENSE](LICENSE) for details.
