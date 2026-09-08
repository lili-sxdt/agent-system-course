// 给缺失 {#sec-N} 显式锚点的英文(H2)补上顺序锚点，使其与侧栏 extractH2 一致
// 只补"完全没锚点"的 H2；若已有锚点则跳过(不做归一)，让既有锚点保持原样以避免破坏现状
// 用法: node scripts/fix-en-anchors.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EN_LEARN = path.join(__dirname, '..', 'docs', 'en', 'learn')

const targets = [
  'docs/en/learn/part-3/01.md',
  'docs/en/learn/part-3/03.md',
  'docs/en/learn/part-7/02.md',
  'docs/en/learn/part-9/06.md',
  'docs/en/learn/part-pre/06.md',
]

let fixedCount = 0
for (const rel of targets) {
  const fp = path.join(__dirname, '..', rel)
  if (!fs.existsSync(fp)) { console.log(`[skip] ${rel} not found`); continue }
  const lines = fs.readFileSync(fp, 'utf8').split('\n')
  let inFence = false, idx = 0, changed = false
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    if (/^```+/.test(ln)) { inFence = !inFence; continue }
    if (inFence) continue
    if (/^##\s+/.test(ln)) {
      idx++
      if (!/\{#sec-\d+\}/.test(ln)) {
        lines[i] = `${ln} {#sec-${idx}}`
        changed = true
      }
    }
  }
  if (changed) {
    fs.writeFileSync(fp, lines.join('\n'), 'utf8')
    fixedCount++
    console.log(`[fixed] ${rel} (H2 count=${idx})`)
  } else {
    console.log(`[noop] ${rel} already anchored`)
  }
}
console.log(`[fix-en-anchors] fixed=${fixedCount}/${targets.length}`)
