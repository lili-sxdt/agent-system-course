import { defineConfig } from 'vitepress'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, '..')

// "最后更新" = 仓库最近一次提交日期+时刻（每次构建自动刷新，无需手动改）
// 用 %cI（带时区 ISO）再取出 YYYY-MM-DD HH:MM，规避 Windows 对 % 的解析坑；保留作者本地时区（不按构建机 UTC 转，否则差 8 小时）
function lastUpdated(): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  try {
    const raw = execSync('git log -1 --format=%cI', { cwd: process.cwd() }).toString().trim()
    const m = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/)
    if (m) return `${m[1]} ${m[2]}:${m[3]}`
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
}

// ---------- 三级侧栏自动生成（部分 → 章 → 节），支持按语言 ----------

const PART_TITLES: Record<number, string> = {
  0: '引子', 1: '地基', 2: '抽象与容器', 3: '三大你写的东西', 4: '让系统长大',
  5: '多智能体与编排', 6: '把它变成真产品', 7: '工程化与规范', 8: '结课项目', 9: '发布后生命周期',
}

function partLabel(p: number): string {
  const num = p === 0 ? '〇' : String(p)
  return `第${num}部分 · ${PART_TITLES[p] ?? ''}`
}

// 去掉标题尾部"—— 一句话扩展"与"（English）"，得到侧栏短名（见 docs/title-spec.md）
function shorten(text: string): string {
  return text
    .replace(/\s*——.*$/, '')
    .replace(/\s*（[^）]*）\s*$/, '')
    .trim()
}

function extractH1(text: string): string {
  const m = text.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

// 抽取 H2（节），跳过代码栅栏（```），并去掉已加上的显式锚点 {#sec-k}
function extractH2(text: string): string[] {
  const out: string[] = []
  let inFence = false
  for (const line of text.split('\n')) {
    if (/^```+/.test(line)) { inFence = !inFence; continue }
    if (inFence) continue
    const m = line.match(/^##\s+(.+?)\s*$/)
    if (m) out.push(m[1].replace(/\s*\{#[^}]*\}\s*$/, '').trim())
  }
  return out
}

// 生成某语言的学习区三级侧栏；langSubDir: '' = 中文(root)，'en' = 英文
function genLearnSidebar(langSubDir: string) {
  const LEARN_DIR = path.join(DOCS_DIR, langSubDir ? `${langSubDir}/learn` : 'learn')
  const prefix = langSubDir ? `/${langSubDir}/learn/part-` : '/learn/part-'
  const groups: any[] = []
  for (const p of Object.keys(PART_TITLES).map(Number).sort((a, b) => a - b)) {
    const dir = path.join(LEARN_DIR, `part-${p}`)
    if (!fs.existsSync(dir)) continue
    const chapters = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => {
        const stem = path.parse(f).name
        const content = fs.readFileSync(path.join(dir, f), 'utf8')
        const shortName = shorten(extractH1(content))
        const sections = extractH2(content)
        return {
          text: shortName,
          link: `${prefix}${p}/${stem}`,
          collapsed: true,
          items: sections.map((s, i) => ({
            text: shorten(s),
            link: `${prefix}${p}/${stem}#sec-${i + 1}`,
          })),
        }
      })
    groups.push({ text: partLabel(p), collapsed: true, items: chapters })
  }
  return groups
}

// ---------- 中文（root） ----------
const zhThemeConfig = {
  nav: [
    { text: '首页', link: '/' },
    { text: '开始阅读', link: '/learn/part-0/01' },
    { text: '版本说明', link: '/version-status' },
    { text: '标题规范', link: '/title-spec' },
    { text: '附录', link: '/appendix/a-glossary' },
  ],
  sidebar: {
    '/learn/': genLearnSidebar(''),
    '/appendix/': [
      {
        text: '附录',
        items: [
          { text: 'A · 术语对照表', link: '/appendix/a-glossary' },
          { text: 'B · API 与配置参考', link: '/appendix/b-api-config' },
          { text: 'C · DSH 源码查字典', link: '/appendix/c-dsh-source-index' },
          { text: 'D · 差异化作证', link: '/appendix/d-differentiation' },
        ],
      },
    ],
  },
  socialLinks: [],
  search: { provider: 'local' },
  docFooter: { prev: '上一章', next: '下一章' },
  footer: {
    message: `内容更新至 ${lastUpdated()} · 课程内容基于 DeepSeek Harness（MIT License, Copyright © 2026 DeepSeek）学习与衍生`,
    copyright: '© 2026 Agent 系统课程',
  },
  lastUpdated: true,
}

// ---------- 英文（/en/，占位） ----------
const enThemeConfig = {
  nav: [
    { text: 'Home', link: '/en/' },
    { text: '中文版', link: '/' },
  ],
  sidebar: {
    '/en/': [
      {
        text: 'English Course',
        items: [
          { text: 'Home', link: '/en/' },
          { text: 'Chinese 中文版', link: '/' },
        ],
      },
    ],
  },
  socialLinks: [],
  search: { provider: 'local' },
  docFooter: { prev: 'Previous', next: 'Next' },
  footer: {
    message: 'English version is being translated · 中文版请见 /',
    copyright: '© 2026 Agent 系统课程',
  },
  lastUpdated: true,
}

export default defineConfig({
  base: '/agent-system-course/',
  title: 'Agent 系统课程',
  description: '从零到能自己编写一个 Agent Harness 系统，并发布维护到 v0.2',
  // 关闭内容区顶部"本节导航"下拉（节导航已并入左侧三级侧栏）
  outline: false,
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      title: 'Agent 系统课程',
      themeConfig: zhThemeConfig,
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Agent System Course',
      themeConfig: enThemeConfig,
    },
  },
})
