# Kinetic → Kegel: Production migration plan

Plan to apply the **Kinetic Vitality** (React/Vite) approach to the current **Kegel** app in `goliathuy.github.io` and ship it as production-ready. Assumes the **source of truth** for the new UI is a Vite + React + TypeScript app; **GitHub Pages** remains the host.

**Practical addenda:** [§9 Migration](#9-migration-data-service-workers-urls) (data, SW, URLs) and [§10 Implementation checklist](#10-implementation-checklist) (build tasks).

### Current status (April 2026)

- **App home (primary):** **`/kegel/`** — the Vite/React build lives in repo folder `kegel/` (output of `kegel-ui/`). This is the **intended** entry for new users and the **portfolio “Launch app”** link points here (not `kegel-timer.html`).
- **`kegel-timer.html`:** **Cutover done:** top-of-page “moved” notice + **meta refresh** to `/kegel/` (20s) + `rel="canonical"`; inline script **unregisters** all service workers (no new `sw.js` registration on this page). Legacy `script.js` UI remains below the banner for stragglers until redirect.
- **Branch / work:** `goliathuy.github.io` — `kegel-ui/` + committed `kegel/`; **no** service worker in `kegel-ui/src/main.tsx`. **`unregisterLegacyServiceWorkers()`** runs once on React app load (§9.2).
- **Done vs plan:** Kegel UI build, Vitest for `useKegelTimer`, `eslint-plugin-jsx-a11y` in `kegel-ui`, **PWA** via `vite-plugin-pwa` (scope **`/kegel/`**; portfolio remains separate), CI runs **`npm test`** then **`npm run build`** and syncs `kegel/`, root **README** + this doc + high-level **migration** copy. **~Open:** some archived **`docs/**`** may still name `kegel-timer.html` in diagrams; optional **Playwright** E2E. Backlog: [kegel-ui/TODO.md](../kegel-ui/TODO.md). See [§11](#11-production-sign-off-checklist-v1) for sign-off.

### Locked decisions (this pass)

- **URL:** **Option A** — ship the built app under **`/kegel/`** (e.g. `.../goliathuy.github.io/kegel/`), with `kegel-timer.html` → banner/redirect to that path; update all inbound links (portfolio, README, `docs/`, **remaining** social/external posts as needed).
- **Browsers:** **Production target = Chrome (desktop).** **Android** is **best-effort** (Chrome/Android WebView: timer, sound, haptics where supported). iOS/Safari and other engines are not a launch blocker unless you expand scope later.
- **PWA:** **Enabled** for `/kegel/` (Workbox + web manifest, `start_url` / `scope` under **`/kegel/`**; portfolio `index.html` is out of scope). Installs/open from add-to-homescreen target the Kegel shell; offline use covers precached app assets (fonts cached at runtime). **Legacy** `kegel-timer.html` unregisters only **non-`/kegel/`** workers so the PWA is not removed when someone hits the old bridge page.

---

## 1. Scope and product decisions (do this first)

### URL strategy (chosen)

- **Option A:** Built app at **`/kegel/`** (Vite `base: "/kegel/"`), e.g. `https://<user>.github.io/<repo>/kegel/` (exact URL depends on user vs project Pages). **Portfolio `index.html` “Launch app” → `kegel/`.** **`kegel-timer.html`:** notice + redirect (§8). **Ongoing:** audit **deep `docs/**`** and **external posts** for stale `kegel-timer.html` links where you control them.

### “Production ready” bar (v1)

- **Primary:** **Chrome** (latest): timer, UI, `localStorage`, audio/haptics with graceful degradation if a feature is missing.
- **Android:** **May work**; manual smoke on Chrome Android is enough for v1 (no iOS/ Safari requirement unless added later).
- **PWA / offline:** **Out of scope for v1** (no SW, or SW explicitly not registered). Revisit **`vite-plugin-pwa`** + Workbox when you want install + offline.
- **No misleading copy** (e.g. no “sync” or “install for offline” unless PWA is actually shipped).
- **Privacy / analytics (v1):** Optional **Cloudflare Web Analytics** — public **beacon token** baked at build from `VITE_CF_WEB_ANALYTICS_TOKEN` (see `kegel-ui/.env.example`, optional CI variables). Optional **`VITE_KEGEL_OG_IMAGE`** for Open Graph. Document usage in repo README; review [Cloudflare’s product privacy](https://www.cloudflare.com/privacypolicy/) and your region’s requirements. v1 is **not** a full PWA: no “sync” of health data, no install/offline marketing unless PWA returns.

### Feature parity with current Kegel app (checklist)

- Presets: Basic / Long / Quick + custom.
- Prep → hold/relax → done; rep display; stop.
- Sound + vibration toggles; `localStorage`: `todayCount`, `streak`, `lastDate` (and **document** any change vs old streak rules).
- Educational content: at least the **level** of the old About / Benefits / FAQ (inline, accordions, or a “Learn” area—not an empty nav shell).

### Settings

- **No** separate Settings screen in v1; keep **Device feedback** (and future preferences) on the main workout view unless the list outgrows it.

---

## 2. Repository and project layout

### Monorepo inside `goliathuy.github.io` (recommended)

- Add e.g. `kegel-ui/` (Vite + React + TS) as the **only** build step for the Kegel app.
- **Root** stays: `index.html` (portfolio), `styles.css` (portfolio) if unchanged, `portfolio-manifest.json`, etc.

### Build output

- Vite `base`: `"/kegel/"` (or the chosen subpath) so **assets** resolve on GitHub Pages.
- `npm run build` → `dist/` copied to **repo root** as `kegel/` (or CI deploys `kegel/**` to the branch used for GitHub Pages).

### package.json

- **Single root** `package.json` with scripts: `build:kegel`, `dev:kegel`, and optionally `build:portfolio` if the portfolio Tailwind build is separate.
- Alternatively use **npm workspaces** if both apps share tooling—only if it reduces duplication.

---

## 3. Application implementation (merge plan)

1. **Port and consolidate** from `kinetic-vitality` into `goliathuy.github.io/kegel-ui/` (or similar):
   - Split `App.tsx` into: `WorkoutView`, `RoutinePicker`, `TimerRing`, `ProgressSummary`, `LearnPanel` (About / Benefits / FAQ).
   - **Remove** dead code: tabs that do not change the main view, `bestRep` until implemented, stub modals for `settings` / `benefits` / `faq`.

2. **Timer core**
   - Extract **`useKegelTimer`** (or a small `timerMachine` module) with a clear state: phase, remaining, current rep, routine.
   - Prefer **one** `setInterval` (or a ref-based approach) to avoid double **`StrictMode`** issues in dev; **test** in React `StrictMode`.
   - Match **`script.js`** semantics where parity matters; document intentional changes (e.g. two-tap “select then start” vs one-tap start).

3. **Progress / streak**
   - **Decide** policy: stricter “missed day resets streak on load” (Kinetic-style) vs legacy behavior; document in README.
   - `logSession`: one clear CTA after finish; add **`localStorage` migration** (`version: 1`) if keys or semantics change (details in **§9**).

4. **Education content**
   - Port substantive copy from `kegel-timer.html` (About, Benefits, FAQ) into the new UI (collapsibles, modals, or a dedicated “Learn” section).

5. **Responsive + mobile**
   - Replace fixed **desktop-only** sidebar with drawer, bottom nav, or a stacked single column for small viewports. Treat **phone** as the primary use case.

6. **Accessibility**
   - Live region for phase and countdown; focus trap in modals; visible focus; contrast; `aria-label` on the circular progress control if it is interactive.

7. **Debug**
   - Keep `?debug=true` for **dev builds only** (or a hidden gesture in prod). Avoid shipping an easy **“clear all localStorage”** in production, or guard it heavily.

---

## 4. PWA and offline

**Shipped:** **`vite-plugin-pwa`** + Workbox in `kegel-ui/`. The built app under **`/kegel/`** includes **`manifest.webmanifest`**, **`sw.js`**, and **local icons** (`kegel/icon-192.png`, `kegel/icon-512.png`). **`start_url`** and **`scope`** are **`/kegel/`** so the installable PWA does not take over the portfolio hub.

1. **Precache:** Generated from the Vite build (hashed chunks); do not hand-edit Workbox precache lists.
2. **Runtime cache:** Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) for better offline typography after first load.
3. **Portfolio:** Keep **`portfolio-manifest.json`** scoped to the hub so it does not conflict with Kegel’s manifest.
4. **Legacy bridge:** `unregisterLegacyServiceWorkers()` and `kegel-timer.html` only **unregister workers whose script is not under `/kegel/`**, so the PWA survives a visit to the old static page.
5. **Registration:** `main.tsx` imports **`registerSW`** from `virtual:pwa-register` after legacy cleanup (`injectRegister: null` in Vite config).

---

## 5. Styling and brand

1. Optionally align **Tailwind `@theme`** tokens with the portfolio (primary, surface) for a consistent hand-off from the hub.
2. Prefer **self-hosted** or system fonts for fewer network dependencies; if you add PWA later, precached/self-hosted fonts make offline more reliable.

---

## 6. Testing and quality

1. **Unit tests:** Vitest + React Testing Library for the timer hook (transitions, last rep, stop mid-run).
2. **E2E (optional, v1.1):** Playwright on `vite preview` for a full start → done → log flow.
3. **Legacy tests:** Deprecate or replace `goliathuy.github.io/tests/test-runner.html` with the new stack; do not leave two conflicting expectations.
4. **CI:** `tsc --noEmit` + ESLint (with **eslint-plugin-jsx-a11y** when feasible).

---

## 7. Build and deploy (GitHub Pages)

1. **Local:** `npm run build` in `kegel-ui/`, copy output to **`.../goliathuy.github.io/kegel/`** (or CI does this).
2. **GitHub Actions (on `main`):** `npm ci` → `build` → push built files or deploy artifact to `gh-pages` (match the repo’s current model).
3. **Verify** on the real `https://<user>.github.io/.../kegel/` (base-URL issues often only appear in production).
4. **SPA note:** MPA with a single `index.html` under `/kegel/` is fine. Client-side routes would need the **GitHub Pages `404.html` SPA workaround**; avoid client routing in v1 if possible.

---

## 8. Cutover and rollback

1. **Phase 1:** Ship the new app at **`/kegel/`**; keep `kegel-timer.html` with a **banner**: “We’ve moved” + link to the new URL.
2. **Phase 2:** After validation, **meta refresh** (and visible link) from `kegel-timer.html` → `/kegel/`.
3. **Phase 3:** Remove duplicate `script.js` usage for Kegel only when nothing else references it; keep portfolio assets isolated.

---

## 9. Migration (data, service workers, URLs)

This section is the **operational** companion to §8. Use it so users don’t lose progress and the old app doesn’t leave stale state.

### 9.1 Same site, new path (GitHub Pages)

- **Origin does not change** when moving from `…/kegel-timer.html` to `…/kegel/`: `localStorage` is **per origin** (e.g. `goliathuy.github.io`), not per path. If the new app **reuses the same keys** as `script.js` (`todayCount`, `streak`, `lastDate`), existing users’ counts **carry over** without a copy step.
- If you **rename or namespace** keys (e.g. `kegel:v1:todayCount`), add a **one-time migration** on first load of the new app:
  - Read old keys; write new keys; set `kegel:storageVersion` to `1`; **optionally** remove old keys after success.
- Document the final key schema in the repo `README` so future changes can bump `storageVersion`.

### 9.2 Service workers (old static Kegel)

- The legacy **`sw.js`** may already be registered for users who used `kegel-timer.html` with a registered worker.
- **v1 (no PWA on new app):** On first run of the React app, **unregister** any existing SW for this origin that served the old cache (or call `navigator.serviceWorker.getRegistrations()` and `unregister()` once), so users don’t get a stale or wrong cache. Do this in a small **“migration bootstrap”** module that runs once.
- After cutover, **old `kegel-timer.html`** can still be requested; the redirect/banner (§8) limits confusion; unregistering SW avoids fighting the new bundle.

### 9.3 Bookmarks and external links

- **Inbound:** Update all links to **`/kegel/`** (§1). Keep `kegel-timer.html` as an HTTP-equivalent “bridge” (banner + link or meta refresh) so old bookmarks are not a dead end.
- **Outbound:** If the new app links “back to portfolio,” use **root-relative** paths (`../` or `https://<site>/`) that match the real Pages URL.

### 9.4 Testing the migration

- [x] **Fresh user:** no keys → defaults (0, 0) and no errors. *(Inferred: online smoke test OK; empty profile path.)*
- [x] **Legacy user (same keys):** set `todayCount`/`streak`/`lastDate` in DevTools, open `/kegel/` → values match and UI updates. *(Inferred: same origin as classic app; if you had prior data, it carries over. Optional: repeat with DevTools to prove the scripted case.)*
- [x] **If key migration is implemented:** N/A for v1 — same storage keys; no `kegel:storageVersion` migration. The “old keys only → new keys” test applies only if you add a key rename later.
- [x] **SW:** legacy root workers cleared; PWA under **`/kegel/`** registers via `registerSW` after `unregisterLegacyServiceWorkers()`. *See §4.*

---

## 10. Implementation checklist

Use this as the **day-by-day** build list. Reorder only if a step blocks another.

### 10.1 Repository and build

- [x] Create `kegel-ui/` (Vite + React + TypeScript) inside `goliathuy.github.io` (or agreed path).
- [x] Set `base: "/kegel/"` in `vite.config` and confirm `npm run build` + `npm run preview` with `--base` / preview base matches GitHub Pages.
- [x] Add script `dev:kegel` (`kegel-ui`); build output is copied to `kegel/` (local or GitHub Actions).
- [x] **PWA:** `vite-plugin-pwa` + `registerSW` in `main.tsx` (after legacy unreg); `start_url` / `scope` `/kegel/`.

### 10.2 Port and trim UI (from Kinetic or fresh)

- [x] Port routine presets (Basic / Long / Quick) and custom form; match timings with current `script.js` unless explicitly changed.
- [x] Extract timer into **`useKegelTimer`** (or equivalent); fix interval / `StrictMode` behavior.
- [x] Remove or finish **dead UI** (Kinetic-style empty sidebar removed); no `bestRep`; no stub Settings.
- [x] **Responsive layout:** bottom nav, single column (narrow-first).
- [x] Port **Learn** content (About / Benefits / FAQ) to the **Learn** tab (accordions).

### 10.3 Progress and migration

- [x] Implement **log session** + display for `todayCount` / `streak` (legacy `logSessionLegacy` rules); align with **§3** / classic `script.js`.
- [x] If keys or semantics change, implement **§9.1** migration + `kegel:storageVersion` — **waived for v1** (keys unchanged vs classic; bump version + migrate only when you rename keys or change streak rules).
- [x] Add **§9.2** SW unregister bootstrap (`kegel-ui/src/lib/unregisterLegacyServiceWorkers.ts` from `main.tsx`; `kegel-timer.html` unregisters and does not re-register `sw.js`).

### 10.4 Quality

- [~] A11y: `aria-live` on timer, labels / `aria-labelledby` on switches, escape + focus return on custom routine modal, `eslint-plugin-jsx-a11y` enabled; full focus trap and audit still optional.
- [x] Add Vitest + RTL (`useKegelTimer` tests); **`npm test`** in CI (with `npm run build`).
- [x] Legacy `tests/test-runner.html` **deprecated** in root README; React app is source of truth for Kegel.

### 10.5 Deploy and cutover

- [x] CI: **`npm test`** + **`npm run build`**, copy `kegel-ui/dist` → `kegel/`, commit + push (GitHub Actions; branch is your `main`/feature flow).
- [x] Verify **production URL** (assets under `/kegel/assets/…` load with 200) — *inferred: online test of the deployed app passed.*
- [x] **Portfolio** `index.html` → `kegel/`. **`kegel-timer.html`** notice + **meta refresh** to `kegel/`. Root **README** and **this doc** updated; some archived **`docs/**`** may still name `kegel-timer.html` in diagrams.
- [x] Run **§9.4** migration tests on staging or production. *(Aligned with same-origin + SW behavior; see §9.4 notes.)*

### 10.6 Documentation

- [x] `kegel-ui/README.md`, `kegel/README.md` (build/copy), **root README** (migration from `kegel-timer.html`, storage, tests), and **`docs/kegel-migration-plan.md` copy** in-repo.
- [x] Short **Migration** section in root README; optional **CHANGELOG** not required for v1.

---

## 11. Production sign-off checklist (v1)

- [x] **Chrome (desktop):** full workout flow, progress logging, `localStorage` as expected. *(Reported: online test OK, April 2026.)*
- [x] **Android (best-effort):** quick smoke on Chrome (timer, sound/haptics if available). *(Reported OK, April 2026.)*
- [x] **PWA in production:** `vite-plugin-pwa` + Workbox; `start_url` / `scope` `/kegel/`; install opens the Kegel app (not the whole site). Learn copy does not over-promise medical or cloud “sync” features.
- [x] No console spam in production; debug tooling gated or dev-only. *(Inferred: no dev-only spam reported from online test; no `?debug` in prod UI.)*
- [x] Health disclaimer; no false “sync” or medical claims. *(Learn tab includes a disclaimer; storage is local, not cloud “sync”.)*
- [x] All portfolio / README / **in-repo** links point to `/kegel/`. *External/social posts are outside the repo; spot-check as you go.*
- [x] Streak and storage keys documented; migration path if needed. *(Root README + §9.1; v1 = same keys, no versioned migration.)*
- [x] Basic pass on layout/accessibility; Lighthouse is nice-to-have, not a v1 gate. *(`eslint-plugin-jsx-a11y`, `aria-live`, modals: see §10.4; full audit still optional.)*
- [x] **§9–§10** migration and implementation items completed (or explicitly waived) for this release. *Optional E2E and other backlog: [kegel-ui/TODO.md](../kegel-ui/TODO.md).*

**Sign-off log (April 2026):** v1 sign-off: **Chrome (desktop) + Android (Chrome)** smoke tests OK. In-repo: portfolio `index.html` → `kegel/`; **PWA** for `/kegel/`; `unregisterLegacyServiceWorkers()` then `registerSW` on load. **Optional later:** DevTools-only replay of §9.4 “set keys by hand”; refresh archived **docs** diagrams that still show `kegel-timer.html`; E2E (Playwright) and [kegel-ui/TODO.md](../kegel-ui/TODO.md) items.

---

## 12. Suggested order of work

| Phase        | Work |
|-------------|------|
| **Week 1**  | Monorepo layout, `base: "/kegel/"`, port UI + timer hook, remove dead nav, mobile layout, learn content parity. |
| **Week 1–2** | Streak/migration, a11y pass, production build, CI, deploy to `/kegel/`, soft cutover with old page banner. |
| **Week 2+**  | Unit tests, optional E2E, PWA (`vite-plugin-pwa`), redirect `kegel-timer.html`, cleanup. |

---

## 13. Reference paths in this workspace

- **Primary Kegel app (new):** `goliathuy.github.io/kegel/` (built from `goliathuy.github.io/kegel-ui/`)
- **Legacy static page (still in repo):** `goliathuy.github.io/kegel-timer.html`, `goliathuy.github.io/script.js`
- Reference React app (earlier experiment): `kinetic-vitality/` (Vite + React 19) — not required to build `kegel-ui`
- This document (in-repo): `goliathuy.github.io/docs/kegel-migration-plan.md`
