---
title: "Appendix C · DSH Source Lookup"
---

# Appendix C · DSH Source Lookup

> DSH has 200-plus `dsh-*` packages. **Do not memorize them; just know how to look them up.** This table helps you go from "which capability do I want" to "which package to search."

## 1. How to look it up (three steps)

1. **Locate the package name**: find candidates using the "concept → package-name prefix" table below.
2. **Read package.json**: confirm its description and dependencies.
3. **Read `lib/` or `src/`**: inspect the exports and implementation (`src` usually ships types and is easier to read).

```bash
# example: find "sandbox"-related packages
ls node_modules/@deepseek-ai | grep sandbox
# → dsh-sandbox / dsh-sandbox-local / dsh-sandbox-policy / dsh-sandbox-windows-acl
```

## 2. Concept → package-name prefix (quick lookup)

| What you are looking for | Look in these packages |
|---|---|
| main loop / sessions | `dsh-agent-loop` `dsh-session*` |
| context / prompt | `dsh-system-prompt` `dsh-persona` |
| tools | `dsh-tools` `dsh-tool-*` (e.g., `dsh-tool-fs` `dsh-tool-web`) |
| skills | `dsh-skill` `dsh-skill-filesystem` `dsh-tool-skill` |
| subagents / workflows | `dsh-subagent*` `dsh-workflow*` `dsh-tool-subagent*` |
| goals / planning | `dsh-goal*` `dsh-plan-mode` `dsh-tool-goal` |
| model adapters | `dsh-llm` `dsh-llm-deepseek` `dsh-llm-pi-ai` |
| filesystem | `dsh-fs*` `dsh-tool-fs*` `dsh-fs-sandbox` |
| sandbox / permissions | `dsh-sandbox*` `dsh-permission-presets` |
| approval | `dsh-user-approval` `dsh-tool-ask-user` |
| session persistence | `dsh-session-persistence*` `dsh-session-query*` |
| compaction | `dsh-compaction*` |
| logging / monitoring | `dsh-session-telemetry*` `dsh-token-meter` |
| frontend | `dsh-web*` `dsh-client-ui-*` |
| SDK / protocol | `dsh-sdk-*` `dsh-typert-*` |
| command line / boot | `dsh-cmdline` `dsh-app-boot` `dsh-shell` |
| jobs / scheduling | `dsh-jobs*` `dsh-tool-jobs` |
| DI foundation | `cordis` `cosmokit` `schemastery` (**note: not originally by DeepSeek**) |

## 3. Key reminders

- **The foundation is not originally by DeepSeek**: `cordis` / `cosmokit` / `schemastery` were authored by **Shigma** and vendored into the DSH repository. To be truly independent, you must write the core container yourself (see Appendix D).
- **All MIT-licensed**: the 222 `dsh-*` packages are all MIT (Copyright © 2026 DeepSeek). Reusing "substantial portions" requires retaining the notice.
- **Do not read them all at once**: look up as needed and check the description and exports. **Look up the dictionary, do not memorize it.**

## 4. A practical search order

```
concept → package-name prefix (this table) → package.json.description → exports/types → implementation
```
