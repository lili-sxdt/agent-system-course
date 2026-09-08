---
title: 附录 B · API 与配置参考
---

# 附录 B · API 与配置参考

> 全课用到的核心接口与配置项速查。**以你实际系统为准**——这里给的是课程约定的"最小共识"。

## 一、核心类型

```ts
// 消息
type Role = 'system' | 'user' | 'assistant' | 'tool'
interface Message {
  role: Role
  content?: string
  tool_calls?: ToolCall[]     // assistant 请求调工具时
  tool_call_id?: string       // tool 结果对应哪次调用
}

// 工具调用意图
interface ToolCall {
  id: string
  function: { name: string; arguments: string }   // arguments 是 JSON 字符串
}
```

## 二、Provider（调模型）

```ts
async function chat(
  messages: Message[],
  opts?: { model?: string; temperature?: number; tools?: ToolDef[] }
): Promise<Message>
```

| 参数 | 说明 | 默认 |
|---|---|---|
| `model` | 模型名 | `deepseek-chat` |
| `temperature` | 随机性 | `0.3`（Agent 建议偏低） |
| `tools` | 可用工具清单 | `[]` |

## 三、defineTool（定义工具）

```ts
interface ToolDef {
  name: string
  description: string          // 写清"何时用"
  parameters: JSONSchema
  handler(args: any): Promise<{ ok: boolean; data?: unknown; error?: string }>
}
```

**约定**：出参统一 `{ ok, ... }`；失败返回 `{ ok:false, error }`，**不抛异常崩掉**。

## 四、插件容器（Context）

```ts
ctx.plugin(fn, config?)      // 装入插件
ctx.tool(toolDef)            // 注册工具
ctx.skill(skillPath)         // 注册技能
ctx.on(event, handler)       // 订阅事件（ready / dispose / ...）
ctx.inject(deps, fn)         // 声明依赖后执行
```

## 五、会话 / 目标 / 任务

```ts
interface Session { id: string; messages: Message[]; createdAt: number; title?: string }
interface Goal    { id: string; objective: string; phase: 'active'|'done'|'blocked'; rounds: number; maxRounds: number }
interface Job     { id: string; status: 'pending'|'running'|'done'|'failed'|'killed'; progress?: number; output?: string }
```

## 六、循环关键常量

| 常量 | 建议值 | 作用 |
|---|---|---|
| `MAX_STEPS` | 20 | 最大轮数，防死循环 |
| 单步超时 | 30s | 防卡死 |
| 重试次数 | 3 | 偶发失败 |
| 重试退避 | 指数 | 避免雪崩 |

## 七、配置优先级

```
默认值  <  用户配置  <  预设 / 命令行
```

## 八、发布相关（package.json）

```jsonc
{
  "name": "my-agent",
  "version": "0.1.0",              // semver
  "bin": { "my-agent": "./dist/cli.js" },
  "files": ["dist"],
  "exports": { ".": "./dist/index.js" },
  "license": "MIT"                 // 若基于 DSH(MIT)，保留其版权声明
}
```

## 九、日志级别

`debug` < `info` < `warn` < `error`（按需过滤）
