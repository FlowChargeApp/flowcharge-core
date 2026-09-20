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

## Reopened 2026-09-20: the first fix did not hold in a live benchmark

PLN-16-zn02av and TL-20-swnqz1 shipped the first fix (bound rule 8/12/13 to "files under
`flowcharge/`", added a prohibition to "Filling a template" step 4, added a pointer
sentence to both `plan-and-tasks-*.md` templates) and executed it on commit `a835a70`.
A self-benchmark run the same day (baseline `v0.4.0` vs. candidate `a835a70`, fresh
feature brief, real FlowCharge app — see
`../../../../flowcharge-benchmarks/runs/2026-09-20-card-last-touched-badge/` and its
write-up in the private vault) found the candidate's orchestrator still opened
`src/public/app.ts` and an e2e fixtures file directly to fill its plan-authoring
briefing, producing a briefing with exact line numbers and verbatim quoted source the
prompt never supplied — recurring verbatim in a second spawn later in the same session.
One part of the first fix did land and hold: the briefing's `plan-only` clause correctly
pointed at `{ws_dir}/workstream.md` instead of retyping it.

The reviewing subagent's diagnosis, on being shown the transcripts: the prohibition was
placed too late (step 4, after the tempting reads already happen at request intake) and
scoped to one purpose ("to fill this block"), so reading a file "to understand the
request" was never covered. Its recommendations, to become this reopened workstream's
next plan:

1. Move the prohibition to "Parsing the request", unconditional, before the operation
   chains — not only where the briefing gets drafted.
2. Add a checkable content rule at step 5 (re-scanning the template): a filled briefing
   containing a path outside `flowcharge/`, a line number, or quoted source has that
   content deleted before the spawn runs.
3. Reword the `{{briefing}}` placeholder to drop the "complete on the points below"
   pressure toward thoroughness; ask for constraints on the outcome, not findings about
   the code.
4. Narrow the `{{context docs}}` exception to a bare listing: name project-root
   documents by path and by what their filename implies, never open them.
5. Two smaller follow-ons from the same diagnosis: forbid reusing an earlier briefing
   verbatim in a later re-spawn (author every briefing fresh), and reword rule 8's
   clause so it no longer frames briefing-writing as "a briefing needs facts" (the
   failure mode) but as restating an already-known decision or constraint.

Explicitly out of scope for this reopened workstream: a scripted `fc-index.mjs --check`
enforcement of the content rule (the subagent's own recommendation 5 in its original
numbering) — it named that a separate workstream, since it needs a new persisted-prompt
file class and a `CONVENTIONS.md` entry. A user-level `CLAUDE.md` backstop outside the
skill was also proposed but is not a FlowCharge Core change.
