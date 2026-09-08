// 归一化英文实践线措辞：主线译名统一为 "Main Line"，并修复拼写错误
// 用法: node scripts/fix-en-practice-consistency.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EN_PRAC = path.join(__dirname, '..', 'docs', 'en', 'learn', 'practice')

const REPLACEMENTS = [
  ['Main Track', 'Main Line'],
  ['Main thread', 'Main Line'],
  ['main track', 'main line'],
  ['main thread', 'main line'],
  ['unpursisted', 'unpersisted'],
]

let touchedFiles = 0, total = 0
for (let p = 1; p <= 9; p++) {
  const dir = path.join(EN_PRAC, `part-${p}`)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, f)
    let c = fs.readFileSync(fp, 'utf8')
    total++
    let changed = false
    for (const [from, to] of REPLACEMENTS) {
      if (c.includes(from)) { c = c.split(from).join(to); changed = true }
    }
    if (changed) { fs.writeFileSync(fp, c, 'utf8'); touchedFiles++ }
  }
}
console.log(`[fix-en-practice-consistency] total=${total} touched=${touchedFiles}`)
