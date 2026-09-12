---
id: WS-2-3rs9lo
type: workstream
workstream: WS-2-3rs9lo
slug: plan-review-trace-originating-scenario
title: "The orchestrator never checks a plan's design against the scenario that motivated it before authoring tasks from it"
status: in-progress
tags: [orchestration, quality, feature]
created: 2026-09-10
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: [WS-1-qrec54]
---
Before any task list is authored from a plan, the orchestrator must itself trace the plan's actual proposed text against the concrete scenario that motivated the plan — not just accept that the plan reads as internally consistent, and not defer that check to a walkthrough task placed at the end of the resulting task list.

This gap surfaced concretely in WS-1-qrec54 (`skills/flowcharge/SKILL.md`'s execute-tasks/commit gate ambiguity). PLN-1-kqwu53's own Stage 8 was a seven-case behaviour walkthrough, and it correctly caught a real defect: the "Flagged tasks" block that Stage 6 added was scoped only to the execute-tasks gate report, so it never appeared in exactly the scenario that started the whole workstream — a run that stops before reaching execute-tasks. That check worked, but it ran last, as task 8 of what was by then task 9 — after all the edits had already landed, and after the user (not the orchestrator) had to ask why an investigation that specifically set out to find ambiguities in these same skill files still let a new one through, and why that only surfaced once execution began rather than during the investigation or plan-review stage.

The user's diagnosis, from that conversation: the chat-level analysis that produced WS-1-qrec54's three recommended modifications was a genuine and correct check — it read the rules as static text and found where they contradict each other. It is not the same check as replaying the actual failure scenario against the finished design, end to end. Nobody, including the orchestrator reading the plan-authoring subagent's summary before claiming task-list IDs, asked whether the "Flagged tasks" block's stated scope even covers the scenario that motivated modification 3 in the first place. Only task 8, placed at the very end of the task list, actually performed that trace — and it found the gap only after five other edits had already been applied to the live file.

The fix the user and orchestrator agreed on in chat, to be turned into a plan by this workstream when it is picked up: after a plan comes back from its authoring subagent, and before the orchestrator claims any task-list ID or spawns the tasks-from-plan stage, the orchestrator states in one line how the plan's design handles each concrete scenario or failure case that motivated the plan — not merely that the plan is internally consistent or that its own acceptance criteria are individually satisfiable. A walkthrough task at the end of the resulting task list remains valuable as a final, literal-text check against the finished file, but it must not be the first or only place this trace happens; the orchestrator's own plan-review step must catch a scenario-coverage gap before any task is authored, not after tasks have already begun landing.

This is documentation-only, confined to how `flowcharge` (this repo, `skills/flowcharge/`) reviews a plan before authoring tasks from it — most likely a new step in `SKILL.md`'s "Filling a template" procedure or a new clause on the `create-plan` operation, decided by whoever plans this workstream, not pre-decided here. The user explicitly said: open the workstream now, do not process it any further — no plan, no tasks, until picked up later.

### Carried over from FlowCharge Core's private archive — 2026-09-10

This workstream was recorded there but never planned or executed — it remains
genuine open backlog work here too. `WS-1-qrec54`, linked above, is the closed,
already-done incident that motivated it, carried across for context.
