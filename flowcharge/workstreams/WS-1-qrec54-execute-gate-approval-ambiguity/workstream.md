---
id: WS-1-qrec54
type: workstream
workstream: WS-1-qrec54
slug: execute-gate-approval-ambiguity
title: "A blanket 'go with your recommendations' reply can satisfy the execute-tasks or commit gate by accident"
status: done
tags: [orchestration, checks]
created: 2026-09-10
updated: 2026-09-26
author: Anthony Koukoullis
depends_on: []
links: []
---
Hard rule 4 requires "an explicit yes" to satisfy an unsatisfied execute-tasks or commit gate. But the "Gates" section tells the orchestrator to ask for that yes as "a numbered question with a recommendation" — the same shape as every ordinary question — and "Talking to the user" states, with no exception, that a numbered question with a recommendation is always safely resolved by "go with your recommendations." Together these three rules make it correct, by the letter of the file, for a blanket "go with your recommendations" reply to satisfy a gate it should not. This is not limited to one run; it applies to every gate, in every run, in every project this suite orchestrates.

The user observed the concrete failure in a different project (LAD): a run whose requested scope was investigate → issues → spec tasks (no execute-tasks asked) ended its summary with "Three things need your call before anything executes" — item 1 being whether to execute the freshly authored task list, items 2 and 3 being two unrelated per-task confirmations (a breaking API rename, a logging behaviour change). The user replied "go with your recommendations," intending it to answer items 2 and 3 only, whenever execution eventually happened. The orchestrator read it as also answering item 1, and began executing immediately, without a distinct gate prompt.

Investigation of `skills/flowcharge/SKILL.md` (this repo) found three modifications, discussed and agreed with the user in chat before this workstream was opened:

1. **The root ambiguity.** Amend hard rule 4 (or the "Gates" section) to state explicitly that "go with your recommendations" never satisfies the execute-tasks or commit gate on its own. A reply satisfies an unsatisfied gate only when it is itself direct and determinate about that specific stage — naming execution or commit — not merely endorsing a list that happens to include the gate as one item.

2. **Why the gate got offered at all.** "Parsing the request" already says a run stops where the user asked it to stop; nothing says how to handle "the next stage would be gated — should I mention that as an option?" today. SKILL.md already has the right pattern for this elsewhere: archiving a finished workstream is offered only as "an available follow-up" in prose, never as a numbered, recommendation-bearing item. Amend "Parsing the request" (or "Gates") so that when the requested pipeline stops before a gated stage, the orchestrator does not add "should I proceed to execute-tasks/commit" to the end-of-run numbered list — it is offered only as a follow-up mention in prose, with no recommendation attached, so a blanket reply can never sweep it up.

3. **A smaller, related gap.** The two per-task confirmations in the user's example (a breaking API rename, a logging behaviour change) were sensible flags, but SKILL.md defines no place for a per-task risk flag to live — the orchestrator improvised one and blended it with the gate. Add a defined home for a per-task risk flag found during task authoring: a dedicated place in the gate report, separate from the gate's own yes-or-no, so approving the gate never silently approves a flagged task too.

This workstream is documentation-only, confined to `skills/flowcharge/SKILL.md` in this repository, unless the plan finds good reason otherwise. It does not touch `CONVENTIONS.md`, the prompt templates, or `fc-index.mjs` unless the plan makes an explicit case for it. It does not touch the installed copies under `~/.claude/skills/` or `~/.config/opencode/skills/` — that sync, per this suite's established pattern, is a separate, later act.

### Carried over from FlowCharge Core's private archive — 2026-09-10

This workstream was originally authored and fully executed there. Its plan and
task list are carried across with it, both already `done`, as a closed
historical record — not queued for re-execution here. `WS-2-3rs9lo` links to
this record as the incident that motivated it.
