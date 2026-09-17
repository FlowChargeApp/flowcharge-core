---
id: PLN-9-wewcwy
type: plan
workstream: WS-16-1n524u
slug: briefing-block-self-contradiction
title: "Remove the self-contradicting clause from the briefing sentence"
status: ready
created: 2026-09-17
updated: 2026-09-17
author: Anthony Koukoullis
base_commit: 152a4d0
depends_on: []
links: []
---

## Summary

`skills/flowcharge/templates/plan-and-tasks-spec.md` line 16 and
`skills/flowcharge/templates/plan-and-tasks-diff.md` line 16 carry an identical
`{{briefing}}` placeholder paragraph. Inside it, the clause written for the
`plan-only` case tells the orchestrator to include "the parts of the codebase
it touches" as something the subagent "cannot discover for itself" — but a
subagent can discover the parts of the codebase a task touches by reading the
repo, so the clause contradicts the sentence that introduces it. The fix
deletes that clause, and the comma and "and" that connect it to the rest of
the list, from both files. No other wording in either file changes.

## Scope

In scope:

- AC1: `skills/flowcharge/templates/plan-and-tasks-spec.md` line 16 no longer
  contains the string "the parts of the codebase it touches".
- AC2: `skills/flowcharge/templates/plan-and-tasks-diff.md` line 16 no longer
  contains the string "the parts of the codebase it touches".
- AC3: `grep -rn "the parts of the codebase it touches" skills/flowcharge/templates/`
  returns zero matches (measured now, at `base_commit`, it returns 2: one
  per file).
- AC4: the opening clause, "everything the subagent needs and cannot discover
  for itself", is unchanged, verbatim, in both files.
- AC5: no line other than line 16 changes in either file, and no other wording
  on line 16 changes beyond the deleted clause.

Out of scope: the broader question of whether the orchestrator should read
project source at all. That is tracked separately as WS-17-m5tjnc, which
depends on this fix landing first, and this plan does not touch it.

Assumption: the two template files are meant to stay identical at this
paragraph, since Context describes it as "the same sentence, duplicated
across both files." Both edits land together rather than one file at a time,
so the files are never left disagreeing with each other mid-fix. A wrong
reading here is recoverable by a follow-up edit, so this is recorded as an
assumption, not an open question.

## Design

Both files carry the identical paragraph at line 16 today:

> `{{everything the subagent needs and cannot discover for itself, complete
> on the points below, no padding. When `{stages}` is `plan-only`: the
> feature to be planned and why it is wanted, the decisions already taken,
> the constraints in play, and the parts of the codebase it touches. When
> `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring
> half needs that the plan itself will not carry. When `{stages}` is
> `tasks-only`: what the plan at `{plan}` changes, the target files and how
> they relate, the decisions already taken, and the constraints in play.}}`

The contradiction sits in the `plan-only` sentence only. The exact,
identical substitution for both files is:

- Before: `the decisions already taken, the constraints in play, and the parts of the codebase it touches.`
- After: `the decisions already taken, the constraints in play.`

This deletes the clause "and the parts of the codebase it touches" together
with the comma that precedes it, leaving the rest of the sentence, and the
two other `{stages}` branches later in the same paragraph, untouched. This is
the whole change: no other file defines or references this paragraph.

## Stages

1. **Delete the contradicting clause in both templates.** Goal: apply the
   substitution above to line 16 of both `plan-and-tasks-spec.md` and
   `plan-and-tasks-diff.md` in the same change, so the two files never
   disagree with each other. This is the only stage: the fix is one
   substring deletion, duplicated in two files, with no sequencing risk and
   nothing to build incrementally toward. Observable when it ends: AC1
   through AC5 all hold, and the two files are still byte-identical to each
   other at this paragraph.

## Data & compatibility

None. This is a wording change in two prompt-template files with no runtime
state, schema, or API surface. Nothing consumes the deleted phrase by exact
match elsewhere in the suite: it appears only at these two lines (confirmed
by the AC3 grep, scoped to `skills/flowcharge/templates/`). No migration or
rollback beyond a normal revert applies.

## Testing strategy

No unit or integration coverage applies: this suite has no automated test
that parses template prose. Verification is the AC1 through AC5 checks
themselves — a grep for the deleted string, a read confirming the opening
clause survives verbatim, and a diff confirming no other line moved.

## Open questions

None. The fix is a literal, fully specified deletion in two named files, and
Context leaves nothing else unsettled.

## Alternatives considered and rejected

- Rephrase the clause instead of deleting it (for example, narrowing it to
  "the parts of the codebase it must not touch"): rejected because Context's
  decision already taken is to delete the clause, not to rephrase the first
  clause or invent a replacement.
- Re-add a connecting "and" before the new final list item ("the decisions
  already taken, and the constraints in play.") to keep an Oxford-style
  final item: rejected because Context says not to restructure the sentence
  beyond removing the clause, and the plain deletion already leaves a
  grammatical sentence.
- Fix only one file and leave the other for a follow-up: rejected because
  Context describes both instances as the same duplicated sentence, and
  landing them separately would leave the two templates disagreeing until
  the second edit ships.

## Final summary

One stage: delete "and the parts of the codebase it touches" (with its
leading comma) from line 16 of both `plan-and-tasks-spec.md` and
`plan-and-tasks-diff.md`, landed together. No risks: a two-instance, single-
substring textual deletion with a grep-checkable acceptance criterion and no
runtime effect. No open questions.
