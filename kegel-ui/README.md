# Kegel UI (Vite + React)

Part of the `goliathuy.github.io` migration. Production build is copied to `/kegel/` at the repo root.

## Commands

- `npm install` — install dependencies  
- `npm run dev` — dev server (use `npm run dev -- --base /kegel/` if you need to match GitHub Pages paths)  
- `npm run build` — output in `kegel-ui/dist/`  
- **Pre-push (local):** From the **repo root**, run `npm install` once so Husky installs. On `git push`, `.husky/pre-push` runs `kegel-ui`’s `npm run build`; a failed build blocks the push. Skip when needed: `git push --no-verify` or `SKIP_KEGEL_BUILD=1 git push`. (`CI=1` skips the hook so CI jobs that `git push` don’t double-build.)
- **CI:** Pushes that touch `kegel-ui/**` run [`.github/workflows/kegel-build.yml`](../.github/workflows/kegel-build.yml): `npm ci` → `npm run build` → sync to `kegel/` and commit. You can also run `workflow_dispatch` manually. Pushes that **only** change `kegel/` do not retrigger (avoids commit loops).
- For local work, you can still copy `dist` to `../kegel/` yourself.

`base` is set to `/kegel/` in `vite.config.ts`. There is **no** service worker in `main.tsx` (v1).

## Usage (traffic) and link previews (optional)

- **Why two different things?** A **preview image** (e.g. on `tkigo.com`) is only for **Open Graph** / social cards when someone pastes a link. It does **not** measure how many people visit `goliathuy.github.io`. **Visit counts** need a small script on the GitHub.io pages.
- **Light traffic stats:** Register **`goliathuy.github.io`** in [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) (no proxy required; you add a site and get a public beacon token). Copy **`.env.example`** to **`.env`**, set `VITE_CF_WEB_ANALYTICS_TOKEN`, then run `npm run build` — the Kegel `index.html` will include the beacon. For **CI**, add the same as **Repository variables** in GitHub: `VITE_CF_WEB_ANALYTICS_TOKEN` and, if you use it, `VITE_KEGEL_OG_IMAGE` (see below).
- **Link preview image:** If you host a PNG (or similar) on `tkigo.com`, set `VITE_KEGEL_OG_IMAGE` to the full `https://tkigo.com/...` URL. That only adds `og:*` / Twitter meta tags to the Kegel build; it keeps **tkigo** and **github.io** separate except for that optional image URL in metadata.
- **Root hub** (`/index.html` on this repo) is a separate HTML file: if you want the same Cloudflare **hub** pageviews, paste the same `<script ... beacon ...>` from the Cloudflare dashboard into that file’s `<head>`, or leave analytics only on `/kegel/`.
