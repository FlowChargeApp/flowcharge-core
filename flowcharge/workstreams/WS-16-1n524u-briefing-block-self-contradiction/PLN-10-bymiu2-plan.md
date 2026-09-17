---
id: PLN-10-bymiu2
type: plan
workstream: WS-16-1n524u
slug: briefing-block-self-contradiction
title: "Close the remaining briefing-block contradictions and grammar gap"
status: done
created: 2026-09-17
updated: 2026-09-18
author: Anthony Koukoullis
base_commit: 73cb41c
depends_on: []
links: []
---

## Summary

A post-merge review of the first round (PLN-9-wewcwy / TL-11-ob2exa) found that
round's fix correct but narrower than the underlying problem. Four points remain,
all inside this workstream's own scope:

1. The `tasks-only` branch of the `{{briefing}}` paragraph in
   `plan-and-tasks-spec.md:16` and `plan-and-tasks-diff.md:16` still tells the
   orchestrator to brief "the target files and how they relate" even though the
   subagent is told, in that same branch, to read the plan in full, and the plan
   names its target files.
2. Three sibling templates carry the same pattern and were untouched by round
   one: `issues-and-tasks-spec.md:15` and `issues-and-tasks-diff.md:15` (in both
   their `issues-and-tasks` and `tasks-only` branches), and
   `execute-parent-task.md:19`.
3. Round one's edit left the `plan-only` branch's list without its closing "and",
   so it disagrees in form with the `tasks-only` branch in the same paragraph.
4. `SKILL.md`'s "Filling a template" procedure, step 4, still tells the
   orchestrator to draw briefing facts from "the conversation, the chained
   artefacts (read them if needed), and the repo" — "and the repo" licenses
   reading arbitrary project source for a task round one already fixed in kind.

The fix is six textual substitutions across six files: remove the redundant
target-file/change-detail phrasing wherever the subagent is already handed a
document that names those files, add back the missing "and", and narrow "and
the repo" to name only files under `flowcharge/`. Nothing else changes.

## Scope

In scope, one stage covering all six edits (grouped by point for traceability):

**Point 1 — `tasks-only` branch, plan-and-tasks templates**

- AC1: `skills/flowcharge/templates/plan-and-tasks-spec.md` line 16's
  `tasks-only` sentence reads "what the plan at `{plan}` changes, the decisions
  already taken, and the constraints in play." with no "target files" clause.
- AC2: `skills/flowcharge/templates/plan-and-tasks-diff.md` line 16 reads the
  same.

**Point 2 — sibling templates**

- AC3: `skills/flowcharge/templates/issues-and-tasks-spec.md` line 15's
  `issues-and-tasks` sentence reads "...namely the decisions already taken, and
  the constraints in play." and its `tasks-only` sentence reads "what the
  issues at `{issuelist}` cover, the decisions already taken, and the
  constraints in play." — both with no "target files" clause.
- AC4: `skills/flowcharge/templates/issues-and-tasks-diff.md` line 15 reads the
  same as AC3.
- AC5: `skills/flowcharge/templates/execute-parent-task.md` line 19 reads
  "{{everything the subagent needs and cannot discover for itself about this
  parent task and its subtasks: any constraint in play, complete on that
  point, no padding}}" — with "what they change, the files involved," removed
  and the trailing "points" corrected to singular "point" to match the one
  remaining item.

**Point 3 — missing "and"**

- AC6: `skills/flowcharge/templates/plan-and-tasks-spec.md` line 16's
  `plan-only` sentence ends "...the decisions already taken, and the
  constraints in play." (matches AC1's ending exactly).
- AC7: `skills/flowcharge/templates/plan-and-tasks-diff.md` line 16 reads the
  same as AC6.

**Point 4 — SKILL.md step 4**

- AC8: `skills/flowcharge/SKILL.md`'s "Filling a template" step 4 reads "Draw
  facts from the conversation, the chained artefacts (read them if needed),
  and files under `flowcharge/`, never invent." with no other change to that
  step or its surrounding sentence.

**Global regression checks**

- AC9: `grep -rn "the target files and how they relate" skills/flowcharge/`
  returns zero matches (measured now, at `base_commit`: 4 matching lines — 1
  each in `plan-and-tasks-spec.md`, `plan-and-tasks-diff.md`,
  `issues-and-tasks-spec.md`, and `issues-and-tasks-diff.md`; the phrase
  occurs twice on that one matched line in each issues-and-tasks file, which
  `grep -n` still reports as a single line).
- AC10: `grep -rn "what they change, the files involved" skills/flowcharge/`
  returns zero matches (measured now: 1, in `execute-parent-task.md`).
- AC11: `grep -n "and the repo," skills/flowcharge/SKILL.md` returns zero
  matches (measured now: 1, at line 454).
- AC12: no line other than the ones named in AC1–AC8 changes in any of the six
  files, and `node skills/flowcharge/scripts/test/run-tests.mjs` still passes
  (its docs-consistency check covers rules A–H; none of those rules govern this
  free-text briefing prose, so this run is a regression guard, not a
  content check for this change).

Out of scope: the `plan-only` and `plan-and-tasks` branches of the
plan-and-tasks paragraph beyond the AC6/AC7 "and" fix (per Context point 3);
the `issues-only` branch of the issues-and-tasks paragraph (it already lists
only findings-with-location, which round one's review did not flag); any
change to orchestrator behavior, runtime logic, or scripts; and WS-17-m5tjnc's
broader question of whether the orchestrator should read project source at
all outside briefing-authoring.

Assumption: "files under `flowcharge/`" (Context's own suggested wording for
AC8) is the correct narrowing, since it mirrors the workstream/plan/task-list
artefacts step 4 already means to point at, and matches the phrasing pattern
`flowcharge/SKILL.md` already uses elsewhere for `{ws_dir}`-rooted paths. A
wrong reading here is recoverable by a follow-up wording tweak, so this is an
assumption, not an open question.

## Design

All six edits are literal substring substitutions, each scoped to one line in
one file, following the same pattern round one used. No file needs re-reading
beyond confirming the exact anchor text at edit time, since this plan already
quotes each anchor from a fresh read taken while authoring it.

**plan-and-tasks-spec.md:16 and plan-and-tasks-diff.md:16** (identical in both
files today; both are one long line, wrapped here for readability):

Before:
> {{everything the subagent needs and cannot discover for itself, complete on
> the points below, no padding. When `{stages}` is `plan-only`: the feature
> to be planned and why it is wanted, the decisions already taken, the
> constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus
> anything the task-authoring half needs that the plan itself will not
> carry. When `{stages}` is `tasks-only`: what the plan at `{plan}` changes,
> the target files and how they relate, the decisions already taken, and the
> constraints in play.}}

After:
> {{everything the subagent needs and cannot discover for itself, complete on
> the points below, no padding. When `{stages}` is `plan-only`: the feature
> to be planned and why it is wanted, the decisions already taken, and the
> constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus
> anything the task-authoring half needs that the plan itself will not
> carry. When `{stages}` is `tasks-only`: what the plan at `{plan}` changes,
> the decisions already taken, and the constraints in play.}}

Two changes on the same line: insert "and " before "the constraints in play"
in the `plan-only` sentence (AC6/AC7), and delete "the target files and how
they relate, " from the `tasks-only` sentence (AC1/AC2). The
`plan-and-tasks` sentence between them is untouched.

**issues-and-tasks-spec.md:15 and issues-and-tasks-diff.md:15** (identical in
both files today; both are one long line, wrapped here for readability):

Before:
> {{everything the subagent needs and cannot discover for itself, complete on
> the points below, no padding. When `{stages}` is `issues-only`: every
> finding to be filed, each with its location, failure scenario, severity
> and confidence. When `{stages}` is `issues-and-tasks`: the same, plus
> anything the task-authoring half needs that the issues themselves will not
> carry, namely the target files and how they relate, the decisions already
> taken, and the constraints in play. When `{stages}` is `tasks-only`: what
> the issues at `{issuelist}` cover, the target files and how they relate,
> the decisions already taken, and the constraints in play.}}

After:
> {{everything the subagent needs and cannot discover for itself, complete on
> the points below, no padding. When `{stages}` is `issues-only`: every
> finding to be filed, each with its location, failure scenario, severity
> and confidence. When `{stages}` is `issues-and-tasks`: the same, plus
> anything the task-authoring half needs that the issues themselves will not
> carry, namely the decisions already taken, and the constraints in play.
> When `{stages}` is `tasks-only`: what the issues at `{issuelist}` cover,
> the decisions already taken, and the constraints in play.}}

Two deletions of "the target files and how they relate, " on the same line,
one per sentence (AC3/AC4). The `issues-only` sentence earlier in the
paragraph is untouched.

**execute-parent-task.md:19**:

Before:
> {{everything the subagent needs and cannot discover for itself about this
> parent task and its subtasks: what they change, the files involved, and
> any constraint in play, complete on those points, no padding}}

After:
> {{everything the subagent needs and cannot discover for itself about this
> parent task and its subtasks: any constraint in play, complete on that
> point, no padding}}

Deletes "what they change, the files involved, and" and replaces it with
"any", leaving one item where the placeholder previously named three, and
corrects "those points" to "that point" to agree with the single remaining
item (AC5).

**SKILL.md, "Filling a template" step 4** (spans lines 452–454 at
`base_commit`; the edited sentence is 453–454):

- Before: ``...satisfying exactly the points the placeholder text names. Draw facts from the conversation, the chained artefacts (read them if needed), and the repo, never invent.``
- After: ``...satisfying exactly the points the placeholder text names. Draw facts from the conversation, the chained artefacts (read them if needed), and files under `flowcharge/`, never invent.``

Replaces "the repo" with "files under `flowcharge/`"; nothing else in the
step or its sentence changes (AC8).

## Stages

1. **Apply all six substitutions and verify.** Goal: land AC1 through AC8 in
   the six named files, in one change, then run the AC9–AC12 checks. One
   stage: every edit is an independent, non-interacting substring
   substitution (each on its own line, in its own sentence, in files that
   share no text with each other at these anchors), so there is no
   sequencing risk and nothing to build incrementally toward. Observable when
   it ends: every AC1–AC12 check holds, and `git diff --stat` shows changes
   only to `plan-and-tasks-spec.md`, `plan-and-tasks-diff.md`,
   `issues-and-tasks-spec.md`, `issues-and-tasks-diff.md`,
   `execute-parent-task.md`, and `SKILL.md`.

## Data & compatibility

None. This is a wording change in five prompt-template files and one skill
instructions file, none of which hold runtime state, a schema, or an API
surface. The deleted and inserted phrases appear only at the lines this plan
names (confirmed by the AC9–AC11 greps, scoped to `skills/flowcharge/`). No
migration or rollback beyond a normal revert applies.

## Testing strategy

No unit or integration coverage applies: this suite has no automated test
that parses briefing prose for grammatical or redundancy defects. Verification
is the AC1 through AC12 checks themselves — greps for the deleted strings,
reads confirming the untouched sentences and branches survive verbatim, a
`git diff` scoped to the six named files, and the existing
`node skills/flowcharge/scripts/test/run-tests.mjs` docs-consistency run as a
regression backstop (it does not exercise these specific sentences, since none
of its eight known rules govern this prose, but a run confirms this change
introduces no unrelated breakage).

## Open questions

None. Every one of the four points carries a decision already taken in
Context, naming the exact files, branches, and resulting wording; nothing is
left for a later call.

## Alternatives considered and rejected

- Rephrase "the target files and how they relate" into something narrower
  (e.g. "how the target files relate to each other") instead of deleting it
  outright: rejected because Context's decision already taken for points 1
  and 2 is removal, on the grounds that the plan or task list already names
  the files; a narrower phrase would still duplicate information the
  subagent already holds.
- Leave `execute-parent-task.md`'s placeholder wording as "any constraint in
  play, complete on those points, no padding" (keep the plural to minimize
  the diff): rejected because "those points" would then refer to a single
  remaining item, which is a grammar defect of exactly the kind this
  workstream exists to remove.
- Fold points 1–4 into four separate stages instead of one: rejected because
  the six edits do not depend on each other, touch disjoint lines, and each
  is independently a one-line substring substitution; splitting them would
  add process overhead (four commits, four verify passes) without reducing
  risk anywhere.
- Narrow "and the repo" in SKILL.md step 4 to "and this repository's own
  tracked artefacts" instead of "files under `flowcharge/`": rejected because
  Context names the latter phrasing as the decision already taken, and it
  reads unambiguously against this suite's own path convention
  (`flowcharge/workstreams/...`), where "tracked artefacts" would need a
  reader to infer the same boundary.

## Final summary

One stage, six substring substitutions across six files: drop the redundant
"target files"/"files involved" phrasing from the `plan-and-tasks`,
`issues-and-tasks`, and `execute-parent-task` briefing placeholders wherever
the subagent already holds a document naming those files; restore the missing
"and" in the `plan-and-tasks` `plan-only` branch; and narrow SKILL.md step 4's
"and the repo" to "and files under `flowcharge/`". No risk beyond a normal
textual edit: every change is grep-checkable, none touches runtime code, and
the suite's own test runner stands as a regression backstop. No open
questions.
