// 双向导航：主线每章文末追加「动手练 → 实践线」块
// 用法: node scripts/add-crosslink-main.mjs
// 幂等: 含 CROSSLINK_MARK 则跳过
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LEARN = path.join(__dirname, '..', 'docs', 'learn')

const MORE = '更多知识在正文'
const CROSSLINK_MARK = '<!-- 双向导航: 去实践线 -->'

// 部分标题(中文,用于措辞)
const PART_TITLES = {
  1: '地基', 2: '抽象与容器', 3: '三大你写的东西', 4: '让系统长大',
  5: '多智能体与编排', 6: '把它变成真产品', 7: '工程化与规范', 8: '结课项目', 9: '发布后生命周期',
}

// 主语线部分 → 实践线部分 一一对应(实践从 part-1 起)
const PART_TO_PRACTICE = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }

let added = 0, skipped = 0, files = 0
for (let p = 1; p <= 9; p++) {
  const dir = path.join(LEARN, `part-${p}`)
  if (!fs.existsSync(dir)) continue
  const prac = PART_TO_PRACTICE[p]
  const partTitle = PART_TITLES[p]
  const filesList = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
  for (const f of filesList) {
    files++
    const fp = path.join(dir, f)
    let content = fs.readFileSync(fp, 'utf8')
    const block = `${CROSSLINK_MARK}

## 动手练 → 实践线 {#sec-practice}

> 想亲手把这一章的概念跑一遍？去 **[实践线 第${p}部分（${partTitle}）](/learn/practice/part-${prac}/01)**。
`
    // 已含标记: 仅修正其前方分隔(补齐"正文与---之间的空行"), 不重复追加
    if (content.includes(CROSSLINK_MARK)) {
      const fixed = content.replace(/([^\n])\n---\n/, '$1\n\n---\n')
      fs.writeFileSync(fp, fixed, 'utf8')
      skipped++
      continue
    }
    // 去掉文末冗余空行，保证"正文 → 空行 → --- → 提示"
    content = content.replace(/\s+$/, '')
    fs.writeFileSync(fp, content + '\n\n---\n\n' + block.trimStart(), 'utf8')
    added++
  }
}
console.log(`[main->practice] files=${files} added=${added} skipped=${skipped}`)
