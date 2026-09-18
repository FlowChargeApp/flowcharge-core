---
id: WS-5-geob84
type: workstream
workstream: WS-5-geob84
slug: unescape-frontmatter-quoted-values
title: "Frontmatter parser leaves escaped quotes in title and description values"
status: done
tags: [generator, correctness, data-integrity, issue]
created: 2026-09-10
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
File one or more issues for the frontmatter quote-unescaping bug found while executing WS-58's task 3, investigate the best fix, then open spec tasks.

The bug: `parseFrontmatter` in `skills/flowcharge/scripts/fc-index.mjs` strips only the outer quote marks from a double-quoted YAML scalar (`v.replace(/^["']|["']$/g, '')`). It never undoes backslash-escaping inside the value. This was always true, but was unreachable in practice because the record writer never correctly escaped an embedded quote before WS-58's task 3. That task made the writer use `JSON.stringify` for `title` and `description`, which is correct YAML, but it exposed the reader's pre-existing gap: a title or description holding a literal `"` now round-trips as `He said \"hi\"` instead of `He said "hi"` everywhere the generator reads frontmatter (the index, the board, --list).

This is a correctness/data-fidelity defect, not a security defect, and it is out of scope for WS-58-rzp680 (closed, security-defects only) — hence its own workstream, per the same pattern as WS-59.

### Carried over from FlowCharge Core's private archive — 2026-09-10

Its earlier plan/task/issue-list artefacts were left behind, not carried across:
they targeted the skill's pre-rebrand folder name, which had already stopped
existing even there. Per this project's own practice, a backlog-status
workstream carries only this body until it's actually about to be executed —
fresh artefacts get authored at that time, grounded in the codebase as it
stands then.
