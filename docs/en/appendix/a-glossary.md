---
title: "Appendix A · Glossary"
---

# Appendix A · Glossary (plain term ↔ technical term)

> Terms used throughout the course, organized by "plain term / technical term / one-line explanation / chapter." Come back here when you get stuck.

> **Chapter numbering**: the "Chapter" column is written `A-B` = **Part A, Chapter B** (e.g., `0-3` = Part 0, Chapter 3; `1-1` = Part 1, Chapter 1).

## 1. Basic concepts

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| memory | Context | everything the model can "see" each turn | 0-3, 1-1 |
| brain | LLM | the model that understands, reasons, and generates | 0-3, 1-2 |
| hands | Tool | an external capability the model can call | 0-3, 1-3 |
| way of working | Agent Loop | repeat "think→act→observe→think" to advance | 0-3, 1-4 |
| character & boundaries | Preset / Persona | the agent's identity, tone, bottom line | 0-3, 3-3 |
| workbench | Harness | the system that ties model/tools/memory together and spins them | 0-2 |
| engine | Kernel | the core engine that actually runs the loop and calls the model | 0-2 |
| body + dashboard | Shell | starts the kernel, shows the interface, tray, etc. | 0-2 |

## 2. Model and context

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| the rules | System Prompt | a rule that is always present and high-priority | 1-1 |
| which brain | model | which model to use | 1-2 |
| randomness knob | temperature | low = deterministic, high = divergent | 1-2 |
| the boss's rule | system role | long-term rule, higher priority than user | 1-1 |
| asking for a capability | Function Calling | the model outputs a "call intent"; the program executes it | 1-3 |
| a manual for machines | Schema / JSON Schema | declares parameter types and structure | 1-3, 3-2 |

## 3. Architecture and engineering

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| building block | Plugin | a self-contained, mountable/unmountable capability unit | 2-1 |
| steward | Container | handles registration, distribution, switching | 2-2 |
| pass dependencies in from outside | DI | a component depends on interfaces, not implementations | 2-2 |
| hand control to the container | IoC | do not `new` it yourself; let the container do it | 2-2 |
| register with the container | register | register a capability into the system | 2-3 |
| from onboarding to offboarding | Lifecycle | load → initialize → work → unmount | 2-4 |
| clean up before leaving | dispose | release timers/connections/listeners | 2-4 |
| settings sheet | Config | tunable items + defaults + validation | 2-5 |
| if it can be defaulted, don't make the user fill it | Convention over Configuration | convention over configuration | 2-3 |

## 4. Things you can write

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| manual | Skill | structured knowledge, loaded on demand | 3-1 |
| when to load | whenToUse | decides when a skill is loaded | 3-1 |
| define a tool | defineTool | name + description + parameters + handler | 3-2 |
| uniform output | `{ ok, error }` | data on success, reason on failure | 3-2 |

## 5. Memory and security

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| chat window | Session | the carrier of one continuous conversation | 4-1 |
| write to disk | Persistence | save the session so it is still there next time | 4-1 |
| add, don't modify | append | safer than rewriting the whole file | 4-1 |
| slim down memory | Compaction | summarize/prune to free up context | 4-2 |
| detail nearby, gist far away | layered memory | recent turns in full + earlier summarized | 4-2 |
| office | Workspace | the root directory the agent is authorized to use | 4-3 |
| a path that wants to escape | Path Traversal | `../` out-of-bounds; must be blocked | 4-3 |
| fence | Sandbox | restricts the agent's operating range | 4-4 |
| grant only what is enough | Least Privilege | do not over-grant | 4-4 |
| let a human decide | Approval | ask the user before a sensitive operation | 4-5 |
| dashcam | Audit Log | records who did what, when | 4-5 |

## 6. Multi-agent and orchestration

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| clone | Subagent | an agent instance with an independent context | 5-1 |
| go with the background | fork | the subagent inherits the parent conversation | 5-1 |
| go from scratch | spawn | the subagent starts fresh (required for audits) | 5-1 |
| assembly line | Workflow | a multi-stage structured process | 5-2 |
| wait a bit | Barrier | a synchronization point between stages | 5-2 |
| advance toward a goal | Goal | self-advancement around a persistent goal | 5-3 |
| stuck | blocked | the same condition unresolved for consecutive rounds | 5-3 |
| resume from the checkpoint | checkpoint resume | enabled by persisted progress | 5-3 |
| queuing | Scheduling | who runs first, how many resources | 5-4 |
| task ledger | Jobs | each task has a status; inspectable and stoppable | 5-4 |

## 7. Productization and engineering

| Plain term | Technical term | One-line explanation | Ch. |
|---|---|---|---|
| agree on how to speak | JSON-RPC | request/response pairing (by id) | 6-1 |
| dev kit | SDK | wraps the protocol into convenient functions | 6-1 |
| an always-open channel | WebSocket | two-way, pushable (streaming) | 6-2 |
| is it alive | Health Check | probes whether the service is available | 6-2 |
| use it in the terminal | CLI | command-line entry, scriptable | 6-4 |
| three-part version number | semver | major.minor.patch | 7-4 |
| version log | CHANGELOG | records what changed in each version | 7-4 |
| release gate | Quality Gate | no pass, no publish | 7-4 |
| others can rerun it | Reproducibility | same input + same environment → same output | 7-2 |
| fix the randomness | seed | makes results repeatable | 7-2 |
| graceful retreat | Fallback | retreat to a backup when the primary path fails | 7-3 |
| don't break things after a change | Regression | run the full suite to confirm nothing broke | 9-3, 9-5 |
| aging dependencies | Tech Debt | repay it regularly | 9-4 |
| how to upgrade | Migration Guide | upgrade notes for breaking changes | 9-6 |
| revert to the previous version | Rollback | quickly revert when something goes wrong | 9-6 |
