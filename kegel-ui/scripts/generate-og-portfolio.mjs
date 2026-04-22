/**
 * Renders a 1200×630 homepage Open Graph image (goliathuy.github.io).
 * Run from repo: `node kegel-ui/scripts/generate-og-portfolio.mjs`
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..', '..')
const out = path.join(repoRoot, 'og-portfolio.png')

const w = 1200
const h = 630

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f5ff"/>
      <stop offset="100%" stop-color="#e4e8ff"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="0" y="0" width="10" height="100%" fill="#0058bb"/>
  <text x="64" y="240" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="56" font-weight="700" fill="#232c51">Mario Albornoz</text>
  <text x="64" y="310" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="32" fill="#515981">Senior Full-Stack Engineer</text>
  <text x="64" y="400" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="24" fill="#0058bb">Portfolio · goliathuy.github.io</text>
</svg>`

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(out)
console.log(`Wrote ${path.relative(repoRoot, out)} — ${w}×${h}`)
