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

const PART_TITLES_EN: Record<number, string> = {
  0: 'Introduction', 1: 'Foundation', 2: 'Abstraction & Container', 3: 'Three Things You Write',
  4: 'Growing the System', 5: 'Multi-Agent & Orchestration', 6: 'Becoming a Product',
  7: 'Engineering & Standards', 8: 'Capstone Project', 9: 'Post-Release Lifecycle',
}

function partLabel(p: number, en = false): string {
  if (en) return `Part ${p} · ${PART_TITLES_EN[p] ?? ''}`
  const num = p === 0 ? '〇' : String(p)
  return `第${num}部分 · ${PART_TITLES[p] ?? ''}`
}

// 去掉标题尾部"—— 一句话扩展"与"（English）"，得到侧栏短名（见 docs/title-spec.md）
function shorten(text: string): string {
  return text
    .replace(/\s*——.*$/, '')       // zh subtitle separator
    .replace(/\s+—\s+.*$/, '')     // en subtitle separator (single em dash)
    .replace(/\s*（[^）]*）\s*$/, '')  // full-width parenthetical
    .replace(/\s*\([^)]*\)\s*$/, '')   // half-width parenthetical
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
    groups.push({ text: partLabel(p, langSubDir === 'en'), collapsed: true, items: chapters })
  }
  return groups
}

// ---------- 中文（root） ----------
const zhThemeConfig = {
  nav: [
    { text: '首页', link: '/' },
    { text: '开始阅读', link: '/learn/part-0/01' },
    { text: '版本说明', link: '/version-status' },
    { text: '附录', link: '/appendix/a-glossary' },
    { text: 'English', link: '/en/' },
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
    copyright: '© 2026 Mini-Harness',
  },
  lastUpdated: true,
}

// ---------- 英文（/en/） ----------
const enThemeConfig = {
  nav: [
    { text: 'Home', link: '/en/' },
    { text: 'Start reading', link: '/en/learn/part-0/01' },
    { text: 'Version', link: '/en/version-status' },
    { text: 'Appendix', link: '/en/appendix/a-glossary' },
    { text: '中文版', link: '/' },
  ],
  sidebar: {
    '/en/learn/': genLearnSidebar('en'),
    '/en/appendix/': [
      {
        text: 'Appendix',
        items: [
          { text: 'A · Glossary', link: '/en/appendix/a-glossary' },
          { text: 'B · API & Config', link: '/en/appendix/b-api-config' },
          { text: 'C · DSH Source Lookup', link: '/en/appendix/c-dsh-source-index' },
          { text: 'D · Differentiation', link: '/en/appendix/d-differentiation' },
        ],
      },
    ],
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
    message: `Content updated ${lastUpdated()} · Based on DeepSeek Harness (MIT License, Copyright © 2026 DeepSeek) for learning and derivation`,
    copyright: '© 2026 Mini-Harness',
  },
  lastUpdated: true,
}

export default defineConfig({
  base: '/mini-harness/',
  title: 'Mini-Harness',
  description: '从零搭建智能体系统（Agent Harness），并发布维护到 v0.2',
  head: [
    ['meta', { property: 'og:title', content: 'Mini-Harness' }],
    ['meta', { property: 'og:description', content: '从零搭建智能体：参照 DeepSeek Harness，从概念到发布，亲手搭出你的 v0.1 → v0.2' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://lili-sxdt.github.io/mini-harness/' }],
    ['meta', { property: 'og:image', content: 'https://lili-sxdt.github.io/mini-harness/share.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['script', { type: 'application/ld+json' }, '{"@context":"https://schema.org","@type":"WebSite","name":"Mini-Harness","description":"从零搭建智能体系统（Agent Harness），并发布维护到 v0.2","url":"https://lili-sxdt.github.io/mini-harness/","inLanguage":["zh-CN","en"]}'],
  ],
  // 关闭内容区顶部"本节导航"下拉（节导航已并入左侧三级侧栏）
  outline: false,
  // canonical：每页自引用，避免中英/路径重复内容在搜索端分裂
  transformHead({ pageData }) {
    const rel = (pageData.relativePath || 'index.md').replace(/\.md$/, '')
    const noIndex = rel.replace(/index$/, '')
    const dir = noIndex ? '/' + noIndex.replace(/\/$/, '') : ''
    const href = 'https://lili-sxdt.github.io/mini-harness' + dir + '/'
    return [['link', { rel: 'canonical', href }]]
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      title: 'Mini-Harness',
      themeConfig: zhThemeConfig,
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Mini-Harness',
      description: 'Build your own agent system from zero and ship it to v0.2',
      themeConfig: enThemeConfig,
    },
  },
})
