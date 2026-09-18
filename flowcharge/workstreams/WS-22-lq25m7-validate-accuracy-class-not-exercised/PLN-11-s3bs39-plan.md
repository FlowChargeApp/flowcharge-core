---
id: PLN-11-s3bs39
type: plan
workstream: WS-22-lq25m7
slug: validate-accuracy-class-not-exercised
title: "Make fc-validate's Accuracy class exercised, not just defined"
status: ready
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
base_commit: 1ad4c4a
depends_on: []
links: []
---

## Summary

`fc-validate`'s Accuracy class at `skills/fc-validate/SKILL.md:90-100` already covers
commands, flags and arguments, but three benchmark audits on 2026-09-18 found it
missing exactly that kind of finding. The workstream record traces this to three
causes, not a narrow mandate: the skill's `description` reads as a blanket licence not
to check technical correctness, the Accuracy bullet list is restated (not referenced)
in both validate templates so a `SKILL.md`-only fix would stay invisible to a validator
that reads the template first, and one ambiguous template sentence gets over-applied as
grounds for checking nothing. Seven wording-only edits across three files close all
three causes: `skills/fc-validate/SKILL.md` (2 edits),
`skills/flowcharge/templates/validate-issues-and-tasks.md` (1 edit plus 2 of the shared
edit below), and `skills/flowcharge/templates/validate-plan-and-tasks.md` (2 of the
shared edit below). No pipeline stage, file, or capability is added.

## Scope

In scope: exactly the seven edits the workstream record names, confined to the three
files and locations it gives. Verified against the live files during planning
(2026-09-18, at `base_commit`) with no drift from the record's line numbers.

- AC1: `skills/fc-validate/SKILL.md`'s `description` field (line 3) no longer contains
  the string "it never judges the code an executor produced, and it never judges
  whether a task's approach actually works." and instead contains, verbatim: "it never
  judges the code an executor produced or whether a task's chosen approach is right,
  but how that approach is expressed — every command, flag, argument, path, anchor and
  count — is in scope wherever a file the artefact cites disproves it."
- AC2: `skills/fc-validate/SKILL.md` carries a new Accuracy-class bullet, positioned
  directly after the existing "A `depends_on` naming the wrong upstream ID." bullet
  (line 97 at `base_commit`) and before the existing "A statement about what another
  artefact says..." bullet, reading verbatim: "A command, flag or argument the artefact
  tells an executor to run, where a file it cites shows it wrong, incomplete or
  unrunnable as written."
- AC3: `skills/flowcharge/templates/validate-issues-and-tasks.md` line 21 no longer
  contains the string "go looking for no file behind them" and instead contains,
  verbatim: "The findings in that block are the whole source, and no file holds them,
  so look for none. That limits where the source lives, not which files you may open to
  check the issue list's own claims."
- AC4: each of the four `**Accuracy.**` bullets — `validate-plan-and-tasks.md` lines 25
  and 33, `validate-issues-and-tasks.md` lines 25 and 33 (all four confirmed live at
  `base_commit`) — reads "Anchors, paths, counts, commands with their flags and
  arguments," in place of "Anchors, paths, counts,", with the remainder of each bullet
  unchanged.
- AC5: `grep -rn "go looking for no file behind them" skills/flowcharge/templates/`
  returns zero matches (measured now, at `base_commit`, it returns 1).
- AC6: `grep -c "Anchors, paths, counts, commands with their flags and arguments,"
  skills/flowcharge/templates/validate-plan-and-tasks.md
  skills/flowcharge/templates/validate-issues-and-tasks.md` returns 2 for each file (4
  total; measured now, at `base_commit`, both return 0).
- AC7: `skills/fc-validate/SKILL.md` lines 102-104 (the bounded-survey guard, "You
  follow only the references the artefact itself makes...") are unchanged, verbatim.
- AC8: `node skills/flowcharge/scripts/test/run-tests.mjs` passes 264/264 after all
  seven edits land.

Out of scope: any change to `SKILL.md:102-104`'s bounded-survey guard, any change that
would let the validator survey the repo, judge whether an approach is sound, author a
missing task, or delete an unsourced one, and any file other than the three named
above. No line in any of the three files changes beyond the seven edits above.

Assumption: the workstream record's cited line numbers (3, 97, 21, 25, 33) were
confirmed against the live files during planning and show no drift, so this plan cites
them as-is rather than as approximate. If a later stage finds the working tree has
moved past `base_commit` before execution, the executor re-reads each target region
fresh rather than trusting these numbers, per this suite's own editing discipline.

## Design

**Approach chosen: land all seven edits in one change.** Edits 4-7 (the four template
bullets) are what makes edits 1-2 (the `SKILL.md` description and new bullet) visible
to a validator, because the templates restate the Accuracy list rather than reference
it and the validator reads the template first. Landing them separately would leave the
suite in a state where the record's own diagnosis (cause two) is still true for however
long the split lasts. Edit 3 is independent of the other six but touches the same file
as two of the shared edits (`validate-issues-and-tasks.md`), so batching it in avoids a
second pass over that file.

Each edit is a literal string substitution; none requires new design beyond locating
the exact current text, which AC1-AC4 above pin down. No new field, section, or
mechanism is introduced anywhere.

## Stages

1. **Apply all seven wording edits, across the three named files, in one change.**
   Goal: `SKILL.md`'s description and Accuracy bullet list, and both templates' four
   Accuracy bullets and the one issues-and-tasks sentence, all read the corrected text,
   with nothing else in any of the three files touched. This is the only stage: seven
   literal substitutions with no sequencing risk between them and no partial state
   worth stopping at, matching the size and shape of the previous single-stage wording
   fix in this suite (WS-16-1n524u). Observable when it ends: AC1 through AC7 all hold
   by direct read or grep.
2. **Run the test/lint backstop and confirm the baseline.** Goal: confirm the edits
   introduced no regression and no unresolvable path, per `DEVELOPMENT.md`'s
   docs-consistency backstop. Observable when it ends: AC8 holds
   (`node skills/flowcharge/scripts/test/run-tests.mjs` reports 264/264).

## Data & compatibility

None. This is a wording change in one skill file and two prompt-template files, with no
runtime state, schema, or API surface. The new wording introduces no new path
reference (the replacement text in AC1-AC4 names no file or directory), so the
docs-consistency rule that every path in prose resolves on disk is satisfied by
construction, and AC8's full test run confirms it. No migration or rollback beyond a
normal revert applies.

## Testing strategy

`node skills/flowcharge/scripts/test/run-tests.mjs` is this suite's only automated
check and the record's stated verification: baseline 264/264, no test asserts on the
exact description or Accuracy-list wording, so no test needs updating alongside the
edits. Beyond that, verification is AC1-AC7's direct reads and greps, which is the same
style of check the record itself specifies (a grep and a line-count).

## Open questions

None. The workstream record gives exact before/after text for all seven edits and
names all three target files and locations; nothing Context leaves unsettled required
an assumption beyond the one recorded above, which is recoverable by a later edit if
wrong.

## Alternatives considered and rejected

- Land the `SKILL.md` edits (1-2) as a separate, earlier change from the four template
  edits (4-7): rejected because the record identifies edits 4-7 as load-bearing — the
  validator reads the template first, so a `SKILL.md`-only change would leave the
  suite's actual behaviour unchanged until the second change lands, reproducing cause
  two for the gap between the two changes.
- A new proofreading pipeline stage that re-reads the artefact against an ad-hoc
  accuracy checklist: rejected per the record's own "why not a new pipeline stage"
  reasoning — the pipeline already runs 30-60 minutes per workstream and reducing that
  is the current goal, while these seven edits add no stage, session, or measurable
  time and use a mechanism (the Accuracy class) that already exists.
- Rephrase edit 3's replacement sentence to something shorter than the record's exact
  quoted text: rejected because the record gives exact replacement text for every edit,
  and Context instructs planning these edits exactly as specified rather than
  redesigning them.

## Final summary

One stage of seven literal wording substitutions across `skills/fc-validate/SKILL.md`,
`skills/flowcharge/templates/validate-plan-and-tasks.md`, and
`skills/flowcharge/templates/validate-issues-and-tasks.md`, landed together because
four of the seven are load-bearing for the other three, followed by a test-suite run
confirming the 264/264 baseline. No risk beyond an anchor-text mismatch at execution
time, which is checked by re-reading each target region fresh rather than trusting this
plan's line numbers. No open questions.
