---
id: WS-17-m5tjnc
type: workstream
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Orchestrator reads project source files that the plan-authoring subagent re-reads from a cold context"
status: done
tags: [orchestration, prompts, correctness, feature]
created: 2026-09-17
updated: 2026-09-20
author: Anthony Koukoullis
depends_on: [WS-16-1n524u]
links: []
---
The orchestrator opens project source files to fill the plan-authoring briefing, and the plan-authoring subagent then re-reads those same files from a cold context moments later.

Depends on WS-16-1n524u (the briefing block's self-contradiction fix): this item is the fuller behavioral change built on top of that wording fix, touching the same lines.

## The reviewing subagent's exact words

"Forbid the orchestrator from reading project source. Impact: 4-8% of total run."

Files: `skills/flowcharge/templates/plan-and-tasks-spec.md` line 16 and `plan-and-tasks-diff.md` line 16 (the `{{briefing}}` block), plus hard rule 8 in `skills/flowcharge/SKILL.md`.

## Full reasoning

"The briefing block contradicts itself... Hard rule 8 permits 'reading artefact files when a briefing needs facts', and the orchestrator stretched 'artefact files' to project source. Change: delete 'and the parts of the codebase it touches' from the briefing block. Name only what the orchestrator alone holds: the request, the decisions already taken, the constraints, the workstream record. Add one line saying the orchestrator opens no project source file to fill a briefing. Bound hard rule 8's carve-out to files under `flowcharge/`. Evidence: 326s and 55,661 output tokens in the candidate run, for information the next stage rediscovered. Baseline spent 102s with zero source reads. This also removes a 3x variance (102s / 196s / 326s) that is larger than several effects the series is trying to measure."

Confidence: CONFIRMED — the duplicate reconnaissance and its cost are measured directly from transcripts, not inferred.

Cross-cutting context from the same review: reaching a 50 percent total reduction is not realistic while validation runs at full strength. Stacking Items 2 (this one), 3 and 5 gets to roughly 38 percent off baseline; adding Item 4 gets to roughly 43 percent. Reaching 50 percent appears to need `validate: off` combined with this item and Item 5 — "the only path in the data" to that target.
