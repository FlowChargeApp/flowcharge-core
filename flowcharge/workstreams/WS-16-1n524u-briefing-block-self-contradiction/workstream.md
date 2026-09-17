---
id: WS-16-1n524u
type: workstream
workstream: WS-16-1n524u
slug: briefing-block-self-contradiction
title: "Self-contradicting instruction in the plan-and-tasks briefing block"
description: "In plan-and-tasks-spec.md line 16 and plan-and-tasks-diff.md line 16, the briefing placeholder text the orchestrator fills before every plan-authoring spawn contains one self-contradicting sentence: it opens with everything the subagent needs and cannot discover for itself and closes with the parts of the codebase it touches, which is exactly what the subagent can discover itself. Fix: delete the and the parts of the codebase it touches clause so the two clauses stop disagreeing. Evidence this is not cosmetic: on the run-3 benchmark the candidate orchestrator took 326 seconds and made 30 Bash calls and 13 Reads before its first spawn, 9 of them project source files that the authoring subagent then read again from a cold context moments later. Baseline orchestrator read zero project source files and took 102 seconds. Scope: the wording fix alone."
status: done
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
