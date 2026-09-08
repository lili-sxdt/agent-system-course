// CI 校验：H2 显式锚点 {#sec-k} 的 k 必须等于其在文件内的位置序号（1-based）
// 与 docs/.vitepress/config.mts 的 extractH2 逻辑一致；用于防止"调整 H2 顺序后侧栏锚点漂移"
// 用法: node scripts/check-anchors.mjs   退出码非0表示有文件不通过
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LEARN = path.join(__dirname, '..', 'docs', 'learn')

const MOJI = /mmport|tmtle|awamt|鈥|鎴|鑻|绗|鏄|锛|涓/

function checkFile(fp) {
  const errors = []
  const lines = fs.readFileSync(fp, 'utf8').split('\n')
  let inFence = false
  let idx = 0 // H2 序号(1-based)
  for (const ln of lines) {
    if (/^```+/.test(ln)) { inFence = !inFence; continue }
    if (inFence) continue
    if (/^##\s+/.test(ln)) {
      idx++
      // 提显式锚点 {#sec-N}
      const m = ln.match(/\{#sec-(\d+)\}/)
      if (!m) errors.push(`H2#${idx} 缺显式锚点: "${ln.trim()}"`)
      else if (Number(m[1]) !== idx) errors.push(`H2#${idx} 锚点序号=${m[1]} 但位置=${idx}: "${ln.trim()}"`)
    }
  }
  return errors
}

let bad = []
let total = 0
for (const sub of ['part-pre', 'part-0', 'part-1', 'part-2', 'part-3', 'part-4', 'part-5', 'part-6', 'part-7', 'part-8', 'part-9']) {
  const dir = path.join(LEARN, sub)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, f)
    total++
    const errs = checkFile(fp)
    const c = fs.readFileSync(fp, 'utf8')
    if (MOJI.test(c)) errs.push('疑似乱码')
    if (errs.length) bad.push(`${sub}/${f}: ${errs.join(' | ')}`)
  }
  const pracDir = path.join(LEARN, 'practice', sub)
  if (fs.existsSync(pracDir)) {
    for (const f of fs.readdirSync(pracDir).filter((x) => x.endsWith('.md'))) {
      const fp = path.join(pracDir, f)
      total++
      const errs = checkFile(fp)
      const c = fs.readFileSync(fp, 'utf8')
      if (MOJI.test(c)) errs.push('疑似乱码')
      if (errs.length) bad.push(`practice/${sub}/${f}: ${errs.join(' | ')}`)
    }
  }
}

if (bad.length) {
  console.error(`\n[check-anchors] ${bad.length} 处问题，共 ${total} 个文件：`)
  bad.forEach((e) => console.error('  -', e))
  process.exit(1)
}
console.log(`[check-anchors] OK：${total} 个文件的 H2 显式锚点与位置序号一致，无乱码。`)
