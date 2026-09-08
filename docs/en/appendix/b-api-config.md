---
title: "Appendix B · API and Configuration Reference"
---

# Appendix B · API and Configuration Reference

> A quick reference to the core interfaces and configuration used throughout the course. **Use your actual system as the authority** — this is the course's "minimal consensus."

## 1. Core types

```ts
// message
type Role = 'system' | 'user' | 'assistant' | 'tool'
interface Message {
  role: Role
  content?: string
  tool_calls?: ToolCall[]     // when the assistant requests a tool
  tool_call_id?: string       // which call a tool result corresponds to
}

// tool-call intent
interface ToolCall {
  id: string
  function: { name: string; arguments: string }   // arguments is a JSON string
}
```

## 2. Provider (calling the model)

```ts
async function chat(
  messages: Message[],
  opts?: { model?: string; temperature?: number; tools?: ToolDef[] }
): Promise<Message>
```

| Parameter | Description | Default |
|---|---|---|
| `model` | model name | `deepseek-chat` |
| `temperature` | randomness | `0.3` (keep low for agents) |
| `tools` | list of available tools | `[]` |

## 3. defineTool (defining a tool)

```ts
interface ToolDef {
  name: string
  description: string          // state clearly "when to use"
  parameters: JSONSchema
  handler(args: any): Promise<{ ok: boolean; data?: unknown; error?: string }>
}
```

**Convention**: output is uniformly `{ ok, ... }`; on failure return `{ ok:false, error }`, **do not throw and crash.**

## 4. Plugin container (Context)

```ts
ctx.plugin(fn, config?)      // mount a plugin
ctx.tool(toolDef)            // register a tool
ctx.skill(skillPath)         // register a skill
ctx.on(event, handler)       // subscribe to events (ready / dispose / ...)
ctx.inject(deps, fn)         // declare dependencies, then run
```

## 5. Session / goal / job

```ts
interface Session { id: string; messages: Message[]; createdAt: number; title?: string }
interface Goal    { id: string; objective: string; phase: 'active'|'done'|'blocked'; rounds: number; maxRounds: number }
interface Job     { id: string; status: 'pending'|'running'|'done'|'failed'|'killed'; progress?: number; output?: string }
```

## 6. Key loop constants

| Constant | Suggested value | Purpose |
|---|---|---|
| `MAX_STEPS` | 20 | max turns, prevents infinite loops |
| per-step timeout | 30s | prevents hanging |
| retry count | 3 | transient failures |
| retry backoff | exponential | avoids cascading failure |

## 7. Configuration priority

```
default  <  user config  <  preset / command line
```

## 8. Release-related (package.json)

```jsonc
{
  "name": "my-agent",
  "version": "0.1.0",              // semver
  "bin": { "my-agent": "./dist/cli.js" },
  "files": ["dist"],
  "exports": { ".": "./dist/index.js" },
  "license": "MIT"                 // if based on DSH (MIT), keep its copyright notice
}
```

## 9. Log levels

`debug` < `info` < `warn` < `error` (filter as needed)
