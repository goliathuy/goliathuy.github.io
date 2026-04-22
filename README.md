
# Kegel Timer & Developer Hub — GitHub Pages Site

This repo hosts a professional developer portfolio (`index.html`) and the **Kegel exercise timer**. The **primary timer app** is the Vite + React build under **`/kegel/`** (source: `kegel-ui/`). The legacy static page **`kegel-timer.html`** remains as a bridge: it shows a “moved” notice and redirects to `/kegel/`.

---

## Primary Kegel app (`/kegel/`)

- **Live URL (example):** `https://goliathuy.github.io/kegel/` (exact path depends on your GitHub Pages setup).
- **Source:** `kegel-ui/` — run `npm ci && npm run build`; output goes to `kegel/` (or let CI update `kegel/` on push).
- **Tests:** `cd kegel-ui && npm test` (Vitest + Testing Library on `useKegelTimer`, etc.).
- **Privacy / analytics:** Optional **Cloudflare Web Analytics** (public beacon token in build via `VITE_CF_WEB_ANALYTICS_TOKEN`). Documented in `kegel-ui/README.md` and `kegel-ui/.env.example`.

### Migration from `kegel-timer.html`

If you bookmarked the old page, open **`/kegel/`** instead. Storage uses the **same origin** on GitHub Pages, so `localStorage` keys (`todayCount`, `streak`, `lastDate`, etc.) carry over. The React app unregisters any legacy **service worker** on load so cached assets do not block the new bundle.

More detail: [docs/kegel-migration-plan.md](docs/kegel-migration-plan.md).

---

## Project structure (high level)

```
goliathuy.github.io/
├── index.html                 # Developer portfolio hub
├── kegel/                     # Built Kegel app (Vite output; commit or CI-generated)
├── kegel-ui/                  # Vite + React + TypeScript source for /kegel/
├── kegel-timer.html           # Legacy static timer → redirects to kegel/
├── script.js                  # Legacy timer logic (still used by kegel-timer.html only)
├── sw.js                      # Legacy service worker (legacy page no longer registers it)
├── styles.css, manifest.json  # Shared / legacy assets
├── tests/                     # Legacy browser test runner (deprecated for Kegel — use kegel-ui tests)
└── docs/                      # Architecture notes; kegel-migration-plan.md
```

---

## Developer hub (portfolio)

- Introduction, experience, projects, capabilities.
- “Launch app” points to **`kegel/`**.

---

## Legacy static timer & tests

- **`kegel-timer.html` + `script.js`:** older single-page flow; not the recommended entry. Prefer **`/kegel/`**.
- **`tests/test-runner.html`:** custom browser-based runner for the legacy stack. **Not** the source of truth for the React app; kept for reference. New work should use **`kegel-ui`** + Vitest.

---

## Local development

**Kegel (React):**

```bash
cd kegel-ui
npm ci
npm run dev:kegel
# open the URL Vite prints; use /kegel/ base
```

**Legacy page (optional):**

- Use `start-timer.bat` or a static server at the repo root so `kegel-timer.html` resolves.

**VS Code:** see `.vscode/` for launch and tasks.

---

## Documentation

- [Kegel migration plan](docs/kegel-migration-plan.md) — scope, cutover, storage, CI
- [Kegel UI backlog](kegel-ui/TODO.md) — post–v1 tasks for `kegel-ui` (supersedes the archived [code review progress](docs/code-review-progress.md) for `script.js`)
- [Project overview (HTML)](docs/project-overview.html)
- [API / service worker (legacy)](docs/api/core-functions.md)
- [Timer implementation (legacy)](docs/implementation/timer-system.md)

---

## License

MIT License — see [LICENSE](LICENSE).
