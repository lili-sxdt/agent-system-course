// 校验双向导航脚本产物：frontmatter 完整性 / 无重复 / 无乱码 / 链接正确
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LEARN = path.join(__dirname, '..', 'docs', 'learn')

const MARK_MAIN = '<!-- 双向导航: 去实践线 -->'
const MARK_PRAC = '<!-- 双向导航: 回主线 -->'
const MOJI = /mmport|tmtle|awamt|鈥|鎴|鑻|绗|鏄|锛|涓/

let errors = []
let mainChecked = 0, pracChecked = 0

// 主线 part-1..9
for (let p = 1; p <= 9; p++) {
  const dir = path.join(LEARN, `part-${p}`)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, f)
    let c = fs.readFileSync(fp, 'utf8')
    mainChecked++
    // frontmatter: 必须是 3 行内闭合，& 闭包前无空行
    const fm = c.match(/^---\n([\s\S]*?)\n---/)
    if (!fm) errors.push(`part-${p}/${f}: 无 frontmatter`)
    else {
      if (fm[1].includes('\n\n')) errors.push(`part-${p}/${f}: frontmatter 内空行`)
      // title 必须存在
      if (!/^title:/.test(fm[1])) errors.push(`part-${p}/${f}: frontmatter 无 title`)
    }
    // 交叉引用块唯一
    const cnt = c.split(MARK_MAIN).length - 1
    if (cnt !== 1) errors.push(`part-${p}/${f}: 去实践块出现 ${cnt} 次`)
    // 乱码
    if (MOJI.test(c)) errors.push(`part-${p}/${f}: 疑似乱码`)
    // 链接
    if (!c.includes(`/learn/practice/part-${p}/01`)) errors.push(`part-${p}/${f}: 去实践链接不对`)
  }
}
// 实践线 part-1..9
for (let p = 1; p <= 9; p++) {
  const dir = path.join(LEARN, 'practice', `part-${p}`)
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const fp = path.join(dir, f)
    let c = fs.readFileSync(fp, 'utf8')
    pracChecked++
    const cnt = c.split(MARK_PRAC).length - 1
    if (cnt !== 1) errors.push(`practice/part-${p}/${f}: 回主线块出现 ${cnt} 次`)
    if (MOJI.test(c)) errors.push(`practice/part-${p}/${f}: 疑似乱码`)
    if (!c.includes(`/learn/part-${p}/01`)) errors.push(`practice/part-${p}/${f}: 回主线链接不对`)
  }
}

console.log(`main=${mainChecked} practice=${pracChecked}`)
if (errors.length === 0) console.log('ALL OK ✅')
else { console.log('ERRORS:'); errors.forEach(e => console.log(' -', e)) }
