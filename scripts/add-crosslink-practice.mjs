// 双向导航：实践线每页引言后插入「对应主线」行
// 用法: node scripts/add-crosslink-practice.mjs
// 幂等: 含 CROSSLINK_MARK 则跳过
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRACTICE = path.join(__dirname, '..', 'docs', 'learn', 'practice')

const CROSSLINK_MARK = '<!-- 双向导航: 回主线 -->'
const PART_MAIN = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }

let added = 0, skipped = 0, files = 0
for (let p = 1; p <= 9; p++) {
  const dir = path.join(PRACTICE, `part-${p}`)
  if (!fs.existsSync(dir)) continue
  const mainP = PART_MAIN[p]
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, f)
    let content = fs.readFileSync(fp, 'utf8')
    files++

    const line = `> 📚 **先用主线打底**：这一练对应 **[主线 第${mainP}部分](/learn/part-${mainP}/01)**——建议先读主线概念，再动手做。`
    const commentedLine = `${CROSSLINK_MARK}\n` + line

    // 幂等: 已有 marker → 跳过；旧产物(有📚行但无marker) → 补 marker
    // 幂等: 已有 marker → 仅修正可能的历史重复(📚行重复件), 不追加新的
    if (content.includes(CROSSLINK_MARK)) {
      // 整行可能是 "标准行：这一练对应...(重复)" —— 在第二个"：这一练对应"处截断
      let fixed = content.replace(/^> 📚 \*\*先用主线打底\*\*：[^\n]*$/m, (line) => {
        const i = line.indexOf('：这一练对应')
        const j = line.indexOf('：这一练对应', i + 1)
        return j === -1 ? line : line.slice(0, j)
      }).trimEnd()
      if (fixed !== content) fs.writeFileSync(fp, fixed + '\n', 'utf8')
      skipped++
      continue
    }
    if (content.includes('先用主线打底')) {
      // 旧产物: 用整行替换(避免部分匹配造成重复)
      const re = /^> 📚 \*\*先用主线打底\*\*：[^\n]*$/m
      fs.writeFileSync(fp, content.replace(re, commentedLine), 'utf8')
      skipped++
      continue
    }

    // 新插入: 找到第一个 "## L..." H2，把行插到其前面的空行处
    const lines = content.split('\n')
    let idx = -1
    for (let i = 0; i < lines.length; i++) {
      if (/^## L\d+/.test(lines[i])) { idx = i; break }
    }
    if (idx === -1) { console.log(`[!] no L-section in ${fp}`); continue }
    let insertAt = idx
    while (insertAt - 1 >= 0 && lines[insertAt - 1].trim() === '') insertAt--
    lines.splice(insertAt, 0, '', line)
    fs.writeFileSync(fp, lines.join('\n'), 'utf8')
    added++
  }
}
console.log(`[practice->main] files=${files} added=${added} skipped=${skipped}`)
