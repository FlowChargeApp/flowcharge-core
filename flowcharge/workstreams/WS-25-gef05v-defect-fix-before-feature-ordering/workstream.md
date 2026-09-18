---
id: WS-25-gef05v
type: workstream
workstream: WS-25-gef05v
slug: defect-fix-before-feature-ordering
title: "A feature blocked by defects cannot be ordered behind their fix in one run"
status: done
tags: [orchestration, schema, correctness]
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: []
links: []
---

FlowCharge Core cannot express "fix these blocking defects first, then plan the feature" as one ordered piece of work, so the plan is written against code the fixes have not yet reached.

## The gap, in plain terms

A defect makes a function return a wrong value. The feature plan reads that function, sees the
wrong behaviour, and designs around it. The defect is then fixed. The plan is now wrong, and
every task derived from it is wrong too. Nothing in the suite knows that the fix had to land
first.

## The merge is not the cause

Both merged templates route on `{stages}` and keep `plan-only`, `issues-only` and `tasks-only`
as values, so the halves are still separable on demand. Hard rule 6 governs one operation at a
time, not one authoring stage per run. The sequence issues-and-tasks, execute, commit,
plan-and-tasks, execute, commit is therefore already expressible as serial stages in one
workstream.

`skills/flowcharge/CONVENTIONS.md` already anticipates the combination. Its automatic-tag rule
states that `issue` and `feature` "may sit on one workstream at the same time, because a
workstream may hold both a plan and a filed issue list."

Mechanical precedent exists. `WS-13-ywk08u` holds two issue list plus task list pairs, and
`WS-16-1n524u` holds two plan plus task list pairs. No workstream in this repository yet holds a
plan and an issue list together.

**The merge neither created this gap nor would undoing it close the gap.** Merging plan-writing
with task authoring is sound in isolation, and that assessment stands. This gap only appears when
one workstream needs a defect list and a feature plan in the same run, which is a case that does
not arise when the merge is examined on its own. The one cost the merge adds is narrow and
recoverable: the plan and its task list are authored in one session at one `base_commit`, so fixes
landing after that session leave the task list derived from pre-fix code. `{stages}: tasks-only`
re-derives it.

## The four gaps

1. **Nothing names the ordered pattern.** The "Parsing the request" standard chains in
   `skills/flowcharge/SKILL.md` list the plan chain and the issue chain as alternatives, never as
   a sequence. A request of this shape reads as two unrelated requests.
2. **The validation bound contradicts itself.** `skills/flowcharge/SKILL.md` says validation runs
   "once per run, after the authoring stage's return" at lines 319, 396 and 512, then calls the
   same bound "once-per-authoring-stage" at line 562. The two readings only diverge once a run
   carries two authoring stages, and the second reading is the correct one.
3. **The dependency carve-out is pointed at the wrong artefact.** Hard rule 5 satisfies a plan or
   issue-list dependency on mere authorship. Its own stated reason is sound and specific: an issue
   list only reaches `done` once its issues are fixed, and the task list carrying the dependency is
   the artefact whose execution fixes them, so requiring `done` would deadlock. Here the dependency
   means the opposite, that the feature work must wait until those issues are truly `done`. The
   carve-out's wording is unconditional on artefact type, so it waves that through. The schema
   already expresses the constraint correctly if the dependency names the task list that fixes the
   issues: a `tasklist` dependency gets no carve-out and already requires `done`. This is a guidance
   gap, not a schema gap.
4. **The plan-versus-scenario check asks the wrong question.** Hard rule 12 asks how the plan's
   design handles each scenario the workstream record names. Where the record names the blocking
   defects as the reason the work is needed, the plan should not handle them; the fix should. The
   result is a spurious halt, or pressure on the plan to absorb the defect fixes into its own design.

Two residual points that fix 3 alone does not close, recorded for whoever plans this. Hard rule 5
fires only before the execute-tasks prompt, while the damage happens earlier, at authoring, when
the plan reads code that still contains the defects. And a plan's own `depends_on` is read by
nothing today.

## Proposed instruction wording, per location

The blocks below are final wording, ready to insert as written.

**1. `skills/flowcharge/SKILL.md`, "Parsing the request", a new standard chain:**

> - "fix what blocks X, then plan X" → issues-and-tasks → validate → [prompt] execute-tasks →
>   [prompt] commit → plan-and-tasks → validate → [prompt] execute-tasks → [prompt] commit. One
>   workstream, two authoring stages. Each per-authoring-stage bound applies to each stage.

**2. `skills/flowcharge/SKILL.md`, the validation bound, at lines 319, 396 and 512:**

> one pass runs once per authoring stage, after that stage's return and before the execute-tasks
> prompt that follows it

and, at line 512:

> it runs at most once per authoring stage

**3a. `skills/flowcharge/CONVENTIONS.md`, at the `depends_on` definition:**

> Where the constraint is that defects must be fixed before this work starts, record the fixing
> task list's ID, not the issue list's. A `tasklist` dependency requires `done`; an issue-list
> dependency is met once authored, which is not the wait you mean.

**3b. `skills/flowcharge/SKILL.md`, "Chaining":**

> A prerequisite-defect constraint records the fixing task list's ID, never the issue list's. Only
> a `tasklist` dependency waits for the fix to land.

**4. `skills/flowcharge/SKILL.md`, hard rule 12, one added sentence:**

> Where the record names a scenario as a prerequisite defect an earlier stage of this run already
> fixed, name that fix as the answer: the plan's design is not required to handle it, and must not
> absorb it.

## Additional finding, not one of the four

Hard rule 13's drift check runs "once per run, immediately before the first parent-task spawn". A
run with two execute-tasks stages therefore skips the check for the second task list, which is the
case where drift matters most, because the defect fixes landed between the two. Proposed wording,
for whoever plans this to accept or reject:

> Run this check once per execute-tasks stage, immediately before that stage's first parent-task
> spawn; do not repeat it before later parent tasks in the same stage.

This is recorded, not decided. It shares the per-run-versus-per-stage cause with gap 2 but is a
separate rule and a separate edit.

## Relationship to other records

`WS-24-8s5mt6` covers codebase confirmation before an issue is filed. This record covers ordering
and dependency semantics for a run carrying two authoring stages. They are independent gaps and
neither blocks the other, so `depends_on` stays empty.
