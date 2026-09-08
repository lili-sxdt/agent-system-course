import { defineConfig } from 'vitepress'
import { execSync } from 'node:child_process'

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

// 侧栏短名规范见 docs/title-spec.md：侧栏只进两级（部分→章），用短名；页面 H1 用全名。
// 章以下（节/小节）由页面内大纲（outline）自动生成，不写进侧栏。

const part = (text, items, collapsed = false) => ({
  text,
  collapsed,
  items, // 章条目：text 用短名 / link 指向 docs/learn/part-N/NN.md
})

const chapter = (num, shortName, link) => ({
  text: `第${num}章 ${shortName}`,
  link,
})

export default defineConfig({
  base: '/agent-system-course/',
  lang: 'zh-CN',
  title: 'Agent 系统课程',
  description: '从零到能自己编写一个 Agent Harness 系统，并发布维护到 v0.2',
  // 页内大纲（章下 1.1 / 1.1.1 自动生成）
  outline: {
    level: [2, 3], // h2 = 节，h3 = 小节
    label: '本节导航',
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始阅读', link: '/learn/part-0/01' },
      { text: '版本说明', link: '/version-status' },
      { text: '标题规范', link: '/title-spec' },
    ],
    sidebar: {
      '/learn/': [
        part('第〇部分 · 引子', [
          chapter(1, '什么是大模型 Agent', '/learn/part-0/01'),
          chapter(2, '什么是 Harness / 壳', '/learn/part-0/02'),
          chapter(3, 'Agent 五要素', '/learn/part-0/03'),
          chapter(4, '学习地图与目标', '/learn/part-0/04'),
          chapter(5, '环境准备', '/learn/part-0/05'),
        ]),
        part('第1部分 · 地基', [
          chapter(1, '上下文（Context）', '/learn/part-1/01'),
          chapter(2, '调模型（LLM）', '/learn/part-1/02'),
          chapter(3, '认识工具（Tool）', '/learn/part-1/03'),
          chapter(4, '核心循环（Loop）', '/learn/part-1/04'),
          chapter(5, '跑通第一个 Agent', '/learn/part-1/05'),
        ]),
        part('第2部分 · 抽象与容器', [
          chapter(1, '为什么要插件化', '/learn/part-2/01'),
          chapter(2, '依赖注入与容器', '/learn/part-2/02'),
          chapter(3, '注册思维', '/learn/part-2/03'),
          chapter(4, '生命周期', '/learn/part-2/04'),
          chapter(5, '配置系统', '/learn/part-2/05'),
        ]),
        part('第3部分 · 三大你写的东西', [
          chapter(1, '技能（Skill）', '/learn/part-3/01'),
          chapter(2, '工具（Tool）', '/learn/part-3/02'),
          chapter(3, '角色 / 预设', '/learn/part-3/03'),
          chapter(4, '三者协作', '/learn/part-3/04'),
        ]),
        part('第4部分 · 让系统长大', [
          chapter(1, '会话与持久化', '/learn/part-4/01'),
          chapter(2, '记忆与压缩', '/learn/part-4/02'),
          chapter(3, '文件系统 / 工作区', '/learn/part-4/03'),
          chapter(4, '安全与沙箱', '/learn/part-4/04'),
          chapter(5, '审批与授权', '/learn/part-4/05'),
        ]),
        part('第5部分 · 多智能体与编排', [
          chapter(1, '子代理（Subagent）', '/learn/part-5/01'),
          chapter(2, '工作流（Workflow）', '/learn/part-5/02'),
          chapter(3, '目标驱动循环', '/learn/part-5/03'),
          chapter(4, '工具与任务编排', '/learn/part-5/04'),
        ]),
        part('第6部分 · 把它变成真产品', [
          chapter(1, '协议与 SDK', '/learn/part-6/01'),
          chapter(2, '服务化', '/learn/part-6/02'),
          chapter(3, '前端', '/learn/part-6/03'),
          chapter(4, '命令行入口', '/learn/part-6/04'),
        ]),
        part('第7部分 · 工程化与规范', [
          chapter(1, '项目结构规范', '/learn/part-7/01'),
          chapter(2, '测试与可复现', '/learn/part-7/02'),
          chapter(3, '日志 / 监控 / 错误', '/learn/part-7/03'),
          chapter(4, '版本管理与发布', '/learn/part-7/04'),
          chapter(5, '编码规范与评审', '/learn/part-7/05'),
        ]),
        part('第8部分 · 结课项目', [
          chapter(1, '需求与架构设计', '/learn/part-8/01'),
          chapter(2, '分模块实现', '/learn/part-8/02'),
          chapter(3, '联调与踩坑', '/learn/part-8/03'),
          chapter(4, '验收清单与扩展', '/learn/part-8/04'),
        ]),
        part('第9部分 · 发布后生命周期', [
          chapter(1, '发布 v0.1', '/learn/part-9/01'),
          chapter(2, '收集与分类反馈', '/learn/part-9/02'),
          chapter(3, '验证', '/learn/part-9/03'),
          chapter(4, '维护', '/learn/part-9/04'),
          chapter(5, '修改', '/learn/part-9/05'),
          chapter(6, '再发布 v0.2', '/learn/part-9/06'),
          chapter(7, '复盘与进入下一轮', '/learn/part-9/07'),
        ]),
      ],
    },
    socialLinks: [],
    search: { provider: 'local' },
    docFooter: { prev: '上一章', next: '下一章' },
    outlineTitle: '本节导航',
    footer: {
      message: `内容更新至 ${lastUpdated()}`,
      copyright: '© 2026 Agent 系统课程',
    },
    lastUpdated: true,
  },
})
