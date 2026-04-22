# Kegel UI (Vite + React)

Part of the `goliathuy.github.io` migration. Production build is copied to `/kegel/` at the repo root.

## Commands

- `npm install` — install dependencies  
- `npm run dev` — dev server (use `npm run dev -- --base /kegel/` if you need to match GitHub Pages paths)  
- `npm run build` — output in `kegel-ui/dist/`  
- After build, copy `dist` to `../kegel/` (or wire CI) so Pages serves `https://<user>.github.io/<repo>/kegel/`.

`base` is set to `/kegel/` in `vite.config.ts`. There is **no** service worker in `main.tsx` (v1).
