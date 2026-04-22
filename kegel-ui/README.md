# Kegel UI (Vite + React)

Part of the `goliathuy.github.io` migration. Production build is copied to `/kegel/` at the repo root.

**Backlog (rescoped from the legacy `script.js` code-review tracker):** [TODO.md](TODO.md).

## Commands

- `npm install` — install dependencies  
- `npm run dev` — dev server (use `npm run dev -- --base /kegel/` if you need to match GitHub Pages paths)  
- `npm test` — Vitest (timer hook smoke tests; same command runs in CI before `npm run build`)  
- `npm run build` — output in `kegel-ui/dist/`  
- `npm run og:portfolio` — (from `kegel-ui/`) regenerates `../og-portfolio.png` (1200×630) for the **portfolio homepage** link preview on `goliathuy.github.io`  
- **Pre-push (local):** From the **repo root**, run `npm install` once so Husky installs. On `git push`, `.husky/pre-push` runs `kegel-ui`’s **`npm test`** then **`npm run build`**; either failing blocks the push. Skip when needed: `git push --no-verify` or `SKIP_KEGEL_BUILD=1 git push`. (`CI=1` skips the hook so CI jobs that `git push` don’t double-build.)
- **CI:** Pushes that touch `kegel-ui/**` run [`.github/workflows/kegel-build.yml`](../.github/workflows/kegel-build.yml): `npm ci` → `npm test` → `npm run build` → sync to `kegel/` and commit. You can also run `workflow_dispatch` manually. Pushes that **only** change `kegel/` do not retrigger (avoids commit loops).
- For local work, you can still copy `dist` to `../kegel/` yourself.

`base` is set to `/kegel/` in `vite.config.ts`. A **PWA** is enabled via **`vite-plugin-pwa`**: Workbox precaches the built assets; **manifest** `start_url` and **scope** are `/kegel/` (separate from the portfolio hub). `main.tsx` calls `unregisterLegacyServiceWorkers()` (root/legacy workers only) then `registerSW()`. Icons: same artwork as the legacy app — **`icons/icon.svg`** in the repo (run **`node generate-icons.js`** in **`icons/`** to refresh `icon-192.png` / `icon-512.png`); copy into **`kegel-ui/public/`** (`icon.svg` plus the PNGs for manifest and `favicon`).

## WSL + Windows and `node_modules`

The repo path is the same files whether you open `C:\…` or `/mnt/c/…`, but **`npm install` is per OS**: Rollup (and similar tools) pull **native** optional binaries for the current platform. A Linux install does not add Windows `.node` addons, and vice versa.

`package.json` uses an **`overrides`** entry so **`rollup` resolves to `@rollup/wasm-node`** everywhere (WSL, Windows, CI). It is a bit slower than native Rollup but avoids missing-binary failures when you mix shells or share one tree on the drive.

After pulling lockfile changes, run **`npm ci`** (or `npm install`) in **`kegel-ui/`** from the environment you use for **`git push`** so `node_modules` matches the lockfile. If **`rm -rf node_modules`** errors on `/mnt/c/` in WSL (I/O on `.node` files), delete **`kegel-ui\node_modules`** from Windows Explorer or run **`npm ci`** in PowerShell from that folder.

If **`npm ci`** on Windows fails with **`EPERM`** / **`unlink`** on a path under **`node_modules\`** (often a **`.node`** file under **`@tailwindcss`** or similar): something still has the binary open. Quit **Node**-based processes in this repo (stop **Vite** / **`npm run dev`**, test runners, any terminal **`node`** still running), **close Cursor/VS Code** (or the window with this folder), **close WSL** sessions that have touched **`/mnt/c/.../kegel-ui`**, then retry. If it persists, use **Task Manager** to end stray **`Node.js`** tasks, or reboot, then **delete the whole `kegel-ui\node_modules` folder in Explorer** and run **`npm ci`** again. Temporarily pausing real-time **antivirus** for that path also helps on some machines.

**`npm warn cleanup` + `EACCES` on `node_modules\.bin\....` (Windows):** npm sometimes can’t remove temporary stub files under **`.bin`** (locked by Defender, another process, or **WSL** touching the same tree). If the run still ends with “added/audited N packages” and **`npm test`** works, the install is fine. If installs keep failing, use the same “close Node / delete `node_modules` / run **`npm ci`** in PowerShell” flow above, and **avoid** running `npm` against **`C:\…\kegel-ui`** and **`/mnt/c/…/kegel-ui`** on the same folder in the same few minutes.

**`npm warn deprecated glob@…`:** comes from a **transitive** dependency (e.g. tooling under **Workbox**). Safe to ignore until upstream updates; it does not mean *your* app is shipping bad `glob` code.

**`npm audit` / “4 high”:** This repo uses **`overrides.serialize-javascript`** so **`workbox-build` / `@rollup/plugin-terser`** pull a fixed **`serialize-javascript`**. **Do not** run **`npm audit fix --force`** here — it can **downgrade** `vite-plugin-pwa` in ways you don’t want. After `git pull`, run **`npm ci`** so the lockfile matches.

## Usage (traffic) and link previews (optional)

- **Link previews vs traffic:** `VITE_KEGEL_OG_IMAGE` only sets **Open Graph** metadata for when someone pastes a `/kegel/` link; it does **not** provide metrics. **Visit counts** use something like the **Cloudflare Web Analytics** beacon (`VITE_CF_WEB_ANALYTICS_TOKEN`) on the real pages.
- **Light traffic stats:** Register **`goliathuy.github.io`** in [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (no proxy required; you add a site and get a public beacon token). Copy **`.env.example`** to **`.env`**, set `VITE_CF_WEB_ANALYTICS_TOKEN`, then run `npm run build` — the Kegel `index.html` will include the beacon. For **CI**, add the same as **Repository variables** in GitHub: `VITE_CF_WEB_ANALYTICS_TOKEN` and, if you use it, `VITE_KEGEL_OG_IMAGE` (absolute URL to **`KegelTimerMockup.png`** on goliathuy, e.g. `https://goliathuy.github.io/KegelTimerMockup.png`).
- **Kegel mockup:** Keep **`KegelTimerMockup.png`** at the **repo root** (1920×1440, from `resize-kegel-mockup.mjs`); use the same public URL in **`VITE_KEGEL_OG_IMAGE`** for the Vite build and in the portfolio project card.  
- **Homepage portfolio OG:** `og-portfolio.png` (see `npm run og:portfolio`) is the **`og:image`** for the portfolio `index.html`.
- **Root hub** (`/index.html` on this repo) is a separate HTML file: if you want the same Cloudflare **hub** pageviews, paste the same `<script ... beacon ...>` from the Cloudflare dashboard into that file’s `<head>`, or leave analytics only on `/kegel/`.
