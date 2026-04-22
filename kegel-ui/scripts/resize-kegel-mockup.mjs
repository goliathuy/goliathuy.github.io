/**
 * Crops and resizes a wide Kegel hero PNG to match TkigoMockup.png (1920×1440, 4:3).
 * Usage: from repo root, `node kegel-ui/scripts/resize-kegel-mockup.mjs [input.png]`
 * Default input: ./KegelTimerMockup.png (re-encode) — pass a new high-res file to replace.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..', '..')
const inFile = process.argv[2] ?? path.join(repoRoot, 'KegelTimerMockup.png')
const outFile = path.join(repoRoot, 'KegelTimerMockup.png')

const w = 1920
const h = 1440

await sharp(inFile)
  .rotate()
  .resize(w, h, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(outFile)

const m = await sharp(outFile).metadata()
console.log(
  `Wrote ${path.relative(repoRoot, outFile)} — ${m.width}×${m.height} (matches TkigoMockup.png)`,
)
