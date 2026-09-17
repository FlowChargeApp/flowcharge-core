---
id: WS-16-1n524u
type: workstream
workstream: WS-16-1n524u
slug: briefing-block-self-contradiction
title: "Self-contradicting instruction in the plan-and-tasks briefing block"
description: "In plan-and-tasks-spec.md line 16 and plan-and-tasks-diff.md line 16, the briefing placeholder text the orchestrator fills before every plan-authoring spawn contains one self-contradicting sentence: it opens with everything the subagent needs and cannot discover for itself and closes with the parts of the codebase it touches, which is exactly what the subagent can discover itself. Fix: delete the and the parts of the codebase it touches clause so the two clauses stop disagreeing. Evidence this is not cosmetic: on the run-3 benchmark the candidate orchestrator took 326 seconds and made 30 Bash calls and 13 Reads before its first spawn, 9 of them project source files that the authoring subagent then read again from a cold context moments later. Baseline orchestrator read zero project source files and took 102 seconds. Scope: the wording fix alone."
status: in-progress
tags: [prompts, correctness]
created: 2026-09-17
updated: 2026-09-17
author: Anthony Koukoullis
depends_on: []
links: []
---
The briefing placeholder text in plan-and-tasks-spec.md:16 and plan-and-tasks-diff.md:16 contradicts itself, telling the orchestrator to include something the subagent can discover on its own.

## The contradiction

In `skills/flowcharge/templates/plan-and-tasks-spec.md` line 16 and `plan-and-tasks-diff.md` line 16 (the `{{briefing}}` placeholder text the orchestrator fills before every plan-authoring spawn), one sentence contradicts itself. It opens with "everything the subagent needs and **cannot discover for itself**" and closes with "...and the parts of the codebase it touches" — the second clause is exactly what the subagent CAN discover itself.

This is a narrow, self-contained wording defect. The fix is to make the two clauses stop disagreeing, most simply by deleting the "and the parts of the codebase it touches" clause from the sentence.

## Why this is not cosmetic

On the run-3 benchmark (a real multi-file codebase), the candidate orchestrator took 326 seconds and made 30 Bash calls and 13 Reads before its first spawn. Nine of those Reads were project source files: `src/lib/projects.ts`, `src/http/routes-projects.ts`, `src/ports/app-api.ts`, `src/core/board-api.ts`, `src/public/home.ts` (twice), `electron/ipc-handlers.cts`, `electron/preload.cts`, and both test files — exactly the files the authoring subagent then read again from a cold context moments later.

Baseline's orchestrator (pre-redesign) read zero project source files and took 102 seconds.

## Scope

This item is scoped to the wording fix alone: make the sentence internally consistent. The fuller behavioral fix (forbidding the orchestrator from reading project source at all, and bounding hard rule 8's carve-out) is tracked separately as WS-17-m5tjnc, which depends on this item's fix landing first.

Confidence: CONFIRMED — the duplicate reconnaissance and its cost are measured directly from transcripts, not inferred.

Cross-cutting context from the same review: reaching a 50 percent total reduction is not realistic while validation runs at full strength. Stacking this item with WS-17, WS-18 and WS-20 gets to roughly 38 percent off baseline; adding WS-19 gets to roughly 43 percent. Reaching 50 percent appears to need `validate: off` combined with WS-17 and WS-20 — "the only path in the data" to that target.

## Reopened: second round, from a post-merge quality review

After the first round (PLN-9-wewcwy / TL-11-ob2exa) merged, a `cl-fable-high`
review of the plan, tasks and resultant edit found the fix was correct but
narrower than the underlying problem, inside this same workstream's own
scope (not the broader WS-17-m5tjnc behavioral question). Four points to
address in a second plan:

1. The `tasks-only` branch of the same `{{briefing}}` paragraph, in the
   same two files (`skills/flowcharge/templates/plan-and-tasks-spec.md`
   and `plan-and-tasks-diff.md`, both line 16), still says "the target
   files and how they relate" — discoverable by the subagent from the
   plan it is told to read in full, so it carries the same kind of
   contradiction the first round fixed in the `plan-only` branch.
2. Three sibling templates carry the same pattern and were not touched:
   `skills/flowcharge/templates/issues-and-tasks-spec.md:15` and
   `issues-and-tasks-diff.md:15` ("the target files and how they relate",
   in both their `issues-and-tasks` and `tasks-only` branches), and
   `skills/flowcharge/templates/execute-parent-task.md:19` ("what they
   change, the files involved" — already recorded in the task list the
   subagent reads).
3. The first round's edit left the `plan-only` list without its closing
   conjunction: it now reads "...the constraints in play." while the
   `tasks-only` branch in the same paragraph reads "...and the constraints
   in play." Add the missing "and" in both files.
4. `skills/flowcharge/SKILL.md`, the "Filling a template" procedure, step
   4, says to draw briefing facts from "the conversation, the chained
   artefacts (read them if needed), and the repo" — this still licenses
   reading arbitrary project source when authoring a briefing, which is
   the same class of problem as points 1 and 2. Narrow "and the repo" to
   name only files under `flowcharge/`.

Scope for this round: wording and instruction-text fixes only, matching the
first round's own scope discipline. No change to orchestrator behavior,
runtime logic, or scripts.
