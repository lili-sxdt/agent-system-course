---
title: "Appendix D · Evidence of Differentiation"
---

# Appendix D · Evidence of Differentiation

> You learned from DSH (MIT-licensed) and built an agent system yourself. This page covers two things: **how to stay compliant**, and **how to show it is more than a "reskin."**

## 1. Hold the compliance bottom line first (MIT)

All 222 `dsh-*` packages of DSH are **MIT-licensed (Copyright © 2026 DeepSeek)**. MIT allows use, modification, distribution, and commercial use, but requires:

> **retaining the copyright notice and license text in "all copies or substantial portions."**

**What you must do**:

- [ ] put a `LICENSE` in the repository (full MIT text + DeepSeek's copyright notice);
- [ ] add a `NOTICE` stating "**which parts come from DSH and which are newly written by you**";
- [ ] where you reused DSH code, cite the source;
- [ ] if you only "learned the ideas and wrote it from scratch," still state in the README that it is "inspired by DSH."

**Do not**: rename/reskin DSH and claim it is "entirely original."

## 2. What counts as a "new system" (evidence of differentiation)

| Dimension | What must be shown | How to leave evidence |
|---|---|---|
| **goal** | it solves a problem DSH does not, or does poorly | state the positioning and differences in the README |
| **architecture** | the core abstraction/design genuinely changed | architecture diagram + design-decision records |
| **skeleton** | whether it breaks away from Cordis/Cosmokit | dependency list (you implement the container/loop yourself) or explicitly note "built on DSH" |
| **capability** | at least one capability DSH lacks | the code + example + comparison for that capability |
| **artifact** | it has its own package name/version/docs/tests | repository structure + CHANGELOG |
| **reproducibility** | the key parts are your rewrite/original work | commit history + reproduction report |

## 3. A usable `NOTICE` template

```text
This software includes code from DeepSeek Harness (MIT License, Copyright © 2026 DeepSeek).
Upstream: https://github.com/deepseek-ai/deepseek-harness

The following parts are original/adapted:
- <module A>: independent implementation, no upstream code used
- <module B>: adapted from upstream <package>, original license notice retained

See LICENSE and the header notices in each source file.
```

## 4. One honest sentence

**"Building a derivative on top of open source" is entirely legitimate; the key is to state the relationship clearly.** To claim an "independent new system," you must show genuine differences in **goal / architecture / skeleton / capability**, and honestly attribute the sources.

> ⚠️ For a final determination involving commercial use, patents, or IP ownership, check the original DSH `LICENSE`, and consult a professional if necessary.
