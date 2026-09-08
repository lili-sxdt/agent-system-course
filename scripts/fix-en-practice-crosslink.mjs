// 修复 en 实践线「回主线」链接指向英文主线(/en/learn/part-N/01)，而非中文(/learn/part-N/01)
// 用法: node scripts/fix-en-practice-crosslink.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EN_PRAC = path.join(__dirname, '..', 'docs', 'en', 'learn', 'practice')

let fixed = 0, total = 0
for (let p = 1; p <= 9; p++) {
  const dir = path.join(EN_PRAC, `part-${p}`)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, f)
    let c = fs.readFileSync(fp, 'utf8')
    total++
    // 把链接到中文主线的 /learn/part-N/... 改为 /en/learn/part-N/...
    let changed = false
    const out = c.replace(/\/learn\/part-(\d+)\/(\d+)/g, (m, part, ch) => {
      // 排除已是 /en/learn 的(不会匹配，因为前面无 en)
      changed = true
      return `/en/learn/part-${part}/${ch}`
    })
    if (changed) { fs.writeFileSync(fp, out, 'utf8'); fixed++ }
  }
}
console.log(`[fix-en-practice-crosslink] total=${total} fixed=${fixed}`)
