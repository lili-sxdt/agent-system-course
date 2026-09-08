---
title: 附录 C · DSH 源码查字典
---

# 附录 C · DSH 源码查字典

> DSH 有 200 多个 `dsh-*` 包。**别背，会查就行。** 这张表帮你"想找什么能力 → 去哪个包找"。

## 一、怎么查（三步）

1. **定位包名**：按下面的"概念 → 包名前缀"表找到候选包。
2. **看 package.json**：确认它的 description 和依赖。
3. **读 `lib/` 或 `src/`**：看导出与实现（`src` 通常带类型，更好读）。

```bash
# 例：找"沙箱"相关
ls node_modules/@deepseek-ai | grep sandbox
# → dsh-sandbox / dsh-sandbox-local / dsh-sandbox-policy / dsh-sandbox-windows-acl
```

## 二、概念 → 包名前缀（速查）

| 你想找 | 去这些包 |
|---|---|
| 主循环 / 会话 | `dsh-agent-loop` `dsh-session*` |
| 上下文 / 提示词 | `dsh-system-prompt` `dsh-persona` |
| 工具 | `dsh-tools` `dsh-tool-*`（如 `dsh-tool-fs` `dsh-tool-web`） |
| 技能 | `dsh-skill` `dsh-skill-filesystem` `dsh-tool-skill` |
| 子代理 / 工作流 | `dsh-subagent*` `dsh-workflow*` `dsh-tool-subagent*` |
| 目标 / 计划 | `dsh-goal*` `dsh-plan-mode` `dsh-tool-goal` |
| 模型适配 | `dsh-llm` `dsh-llm-deepseek` `dsh-llm-pi-ai` |
| 文件系统 | `dsh-fs*` `dsh-tool-fs*` `dsh-fs-sandbox` |
| 沙箱 / 权限 | `dsh-sandbox*` `dsh-permission-presets` |
| 审批 | `dsh-user-approval` `dsh-tool-ask-user` |
| 会话持久化 | `dsh-session-persistence*` `dsh-session-query*` |
| 压缩 | `dsh-compaction*` |
| 日志 / 监控 | `dsh-session-telemetry*` `dsh-token-meter` |
| 前端 | `dsh-web*` `dsh-client-ui-*` |
| SDK / 协议 | `dsh-sdk-*` `dsh-typert-*` |
| 命令行 / 启动 | `dsh-cmdline` `dsh-app-boot` `dsh-shell` |
| 作业 / 调度 | `dsh-jobs*` `dsh-tool-jobs` |
| 依赖注入底座 | `cordis` `cosmokit` `schemastery`（**注意：非 DeepSeek 原创**） |

## 三、关键提醒

- **底座不是 DeepSeek 原创**：`cordis` / `cosmokit` / `schemastery` 作者是 **Shigma**，被 vendor 进 DSH 仓库。想真正独立，核心容器得自己写（见附录 D）。
- **全部 MIT 许可**：222 个 `dsh-*` 包均为 MIT（Copyright © 2026 DeepSeek）。复用"实质性部分"要保留声明。
- **别一上来通读**：按需查、看 description 和导出即可。**查字典，不背字典。**

## 四、一个实用检索顺序

```
概念 → 包名前缀（本表）→ package.json.description → 导出/类型 → 实现
```
