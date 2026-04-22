# Kegel UI (Vite + React)

Part of the `goliathuy.github.io` migration. Production build is copied to `/kegel/` at the repo root.

## Commands

- `npm install` — install dependencies  
- `npm run dev` — dev server (use `npm run dev -- --base /kegel/` if you need to match GitHub Pages paths)  
- `npm test` — Vitest (timer hook smoke tests; same command runs in CI before `npm run build`)  
- `npm run build` — output in `kegel-ui/dist/`  
- `npm run og:portfolio` — (from `kegel-ui/`) regenerates `../og-portfolio.png` (1200×630) for the **portfolio homepage** link preview on `goliathuy.github.io`  
- **Pre-push (local):** From the **repo root**, run `npm install` once so Husky installs. On `git push`, `.husky/pre-push` runs `kegel-ui`’s **`npm test`** then **`npm run build`**; either failing blocks the push. Skip when needed: `git push --no-verify` or `SKIP_KEGEL_BUILD=1 git push`. (`CI=1` skips the hook so CI jobs that `git push` don’t double-build.)
- **CI:** Pushes that touch `kegel-ui/**` run [`.github/workflows/kegel-build.yml`](../.github/workflows/kegel-build.yml): `npm ci` → `npm test` → `npm run build` → sync to `kegel/` and commit. You can also run `workflow_dispatch` manually. Pushes that **only** change `kegel/` do not retrigger (avoids commit loops).
- For local work, you can still copy `dist` to `../kegel/` yourself.

`base` is set to `/kegel/` in `vite.config.ts`. There is **no** service worker in `main.tsx` (v1).

## Usage (traffic) and link previews (optional)

- **Link previews vs traffic:** `VITE_KEGEL_OG_IMAGE` only sets **Open Graph** metadata for when someone pastes a `/kegel/` link; it does **not** provide metrics. **Visit counts** use something like the **Cloudflare Web Analytics** beacon (`VITE_CF_WEB_ANALYTICS_TOKEN`) on the real pages.
- **Light traffic stats:** Register **`goliathuy.github.io`** in [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (no proxy required; you add a site and get a public beacon token). Copy **`.env.example`** to **`.env`**, set `VITE_CF_WEB_ANALYTICS_TOKEN`, then run `npm run build` — the Kegel `index.html` will include the beacon. For **CI**, add the same as **Repository variables** in GitHub: `VITE_CF_WEB_ANALYTICS_TOKEN` and, if you use it, `VITE_KEGEL_OG_IMAGE` (absolute URL to **`KegelTimerMockup.png`** on goliathuy, e.g. `https://goliathuy.github.io/KegelTimerMockup.png`).
- **Kegel mockup:** Keep **`KegelTimerMockup.png`** at the **repo root** (1920×1440, from `resize-kegel-mockup.mjs`); use the same public URL in **`VITE_KEGEL_OG_IMAGE`** for the Vite build and in the portfolio project card.  
- **Homepage portfolio OG:** `og-portfolio.png` (see `npm run og:portfolio`) is the **`og:image`** for the portfolio `index.html`.
- **Root hub** (`/index.html` on this repo) is a separate HTML file: if you want the same Cloudflare **hub** pageviews, paste the same `<script ... beacon ...>` from the Cloudflare dashboard into that file’s `<head>`, or leave analytics only on `/kegel/`.
