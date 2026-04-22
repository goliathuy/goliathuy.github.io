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
