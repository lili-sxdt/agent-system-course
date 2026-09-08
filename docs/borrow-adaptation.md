# 外部英文资源 · 借鉴与改编清单

> 目的：业界已有大量英文 agent 教程/书籍。这些资源围绕的**系统各不相同**（OpenAI、Anthropic、LangChain、CrewAI、AutoGen、smolagents…），但**工程方法论与踩坑经验高度相通**。本清单梳理"**能借什么、怎么用到我们这套课里、什么不该借**"，供逐章写正文时对照。

## 一、总体借鉴原则（先记住这四条）

1. **借"方法论/术语/教学设计"，不借"框架 API"**。大多数资源是"用某框架拼 agent"，而我们的课是"**教你自己造 harness**（插件容器 + 循环 + 沙箱）"。所以拿它们的**模式、术语、教学节奏**，**不拿它们的代码和抽象**。
2. **抽象到"模块/概念"层再拿**。把框架特有的东西剥掉，只留"这一步解决什么问题、有什么坑"，再用我们自己的 mini-harness（TypeScript、插件化）来落地。
3. **借"教学手感"**。英文资源里把"变难"的课往往输在"无脑堆概念"；好的课（如 HuggingFace/OpenAI 指南）都主张"**先做最简单能跑的，再叠复杂度**"——这正好是我们"五件套 + 最小可跑"的哲学，可直接吸收。
4. **认清缺口，别指望外部资源补**。现有资源大多停在"**拼一个 agent**"；而"**插件化 harness + 沙箱/安全 + 会话记忆 + 发布后运营**"这层**系统性资源极少**——这部分我们要自己设计 + 从零散工程文章中提炼，不能照抄。

## 二、可借鉴的外部资源清单

| 资源 | 里面有什么 | 能借什么 | 用到我们哪部分 |
|---|---|---|---|
| **Anthropic《Building Effective Agents》**（官方，免费） | 核心构件「增强型 LLM（检索/工具/记忆）」；**workflow 与 agent 的区分**；模式：prompt chaining、routing、parallelization、orchestrator-workers、evaluator-optimizer、agent | ① workflow vs agent 的边界 ② orchestrator-workers / evaluator-optimizer 模式 ③「先简单、再按需加复杂度、别过度设计」的价值观 | **第5部分**（多智能体/编排）、**第1部分**（上下文+工具→增强型 LLM）、贯穿全课的教学哲学 |
| **OpenAI《A Practical Guide to Building Agents》**（官方，免费） | 上下文工程（压缩/摘要）、工具选择与持久工具、记忆、评估（LLM-as-judge）、护栏（guardrails）、结构化输出/schema | ① 上下文压缩/记忆 ② 工具 schema 与"选对工具" ③ 评估（用模型评模型）④ 护栏 | **第4.2**（记忆/压缩）、**第3.2/3.4**（工具设计/协作）、**第7.2**（测试/评估）、**第4.5+5.x**（审批/护栏） |
| **OpenAI Agents SDK / Cookbook**（context_personalization、状态管理与长期记忆） | 状态管理、长记忆、上下文工程的工程化实现 | 状态与记忆的分层模式、结构化 schema | **第4.1/4.2**（会话/记忆），**第3.2**（schema） |
| **Hugging Face《Agents Course》**（免费、带可运行 notebook） | 从零用 smolagents 搭 agent：工具、记忆、多智能体；面向初学者、逐步可跑 | ① 教学节奏（一步一跑、colab 实例）② 最简"工具=函数+schema"的讲法 ③ 通俗化表达 | **最好的"通俗教学"范本**，参考它讲"工具/循环"的口吻；**第3.2**（工具定义讲法） |
| **LangChain / LangGraph Academy** | 基于图的 agent 工作流：state、nodes/edges、ReAct、工具、记忆 | 工作流/图式编排的模式（state、阶段、屏障） | **第5.2**（工作流：stage/barrier）、**第5.4**（任务编排） |
| **CrewAI / AutoGen** | 角色化 agent（role-based）、任务（task）、crew 工作流、多 agent 对话 | ① "角色/人设"分工约定 ② 任务化工作流 | **第3.3**（persona/preset）、**第5.1**（子代理/分工） |
| **mcp-agent（官方文档，effective patterns）** | MCP 集成、操作性建议、结构化/类型化工具、循环加固 | ① 工具与外部系统（MCP）连接的概念 ② "循环加固"的操作性建议 | **第3.2**（工具）、**第8.3**（联调加固） |
| **书：《Building Applications with AI Agents》(多智能体系统设计)、《Python Agentic Frameworks》(LangGraph/CrewAI/AutoGen/LlamaIndex)** | 多 agent 系统设计、角色/监督者（supervisor）、交接（handoff）模式 | 多智能体架构设计的系统化视角 | **第5部分**（多智能体与编排） |
| **Aider / Claude Code / Codex 等编码 agent 工程文章**（多为博客，散落） | 编码 agent 的**循环加固**：git 集成、沙箱/审批流、工具结果裁剪、上下文工程 | 沙箱/审批流（approval）、工具结果修剪、git 协作——**最贴近 "harness 工程" 的那一层** | **第4.4/4.5**（沙箱/审批）、**第1.4**（循环终止/结果修剪）、**第8.3**（联调）——**这是外部资源最少、也最该我们自己补的** |

## 三、哪些**不**借 / 别踩的坑

- ❌ **别照抄任何框架的 API/抽象**（LangGraph 的 graph/state、CrewAI 的 crew/task、AutoGen 的对话协议、OpenAI Agents SDK 的 runner…）——我们教的是"**造 harness**"，不是"用框架"。
- ❌ **别让"框架优先"的写法带偏**：很多教程会让人直接"导入框架、组装几步就完"，这会**掩盖**"循环/上下文/权限/插件容器"这些真正要懂的东西，与我们的目标相反。
- ❌ **别把"工作流/图"当作唯一设计**：主流资源过度强调 workflow 编排，但 **agent 循环本身 + 沙箱权限 + 会话记忆** 才是 harness 的命门，要单独讲透，不能被 workflow 覆盖。
- ❌ **别英化表达硬翻**：术语可以保留"context / sandbox / compaction"等英文，但**讲解必须通俗中文**，避免把英文资源的中式直译腔带进课里。

## 四、改编策略（把外部内容变成"我们的"）

1. **语言**：全部通俗中文，关键术语保留英文原词（context、sandbox、schema、compaction）。
2. **抽象到模块层**：拿"这一步解决什么问题、有什么坑"，不带框架特有的代码。
3. **用自己的示例**：示例一律用**我们的 mini-harness**（TS、插件容器、`defineTool`/`SKILL.md`），不用外部框架的。
4. **补缺口**：plugin/IoC harness、沙箱/权限、会话/记忆、发布后生命周期——这些**外部系统化资源少**，我们自己设计，并标注"本课程原创部分"。
5. **标版本**：涉及具体 API 的地方标版本、"以官方为准"（沿用 v3 目录的约定）。

## 五、一句话总结

**现有英文资源能给我们最大的帮助，是①一套清晰的工作流 vs agent 模式、②上下文工程/工具设计/评估的方法论、③"先简单后复杂"的教学节奏——这些借来当骨架；而"造 harness 的插件化/沙箱/会话/发布"这部分，别人帮不上，得我们自己搭，这正是我们课程的差异化价值。**
