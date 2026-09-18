---
id: PLN-14-rsflea
type: plan
workstream: WS-20-f1416h
slug: task-decomposition-numeric-cap
title: "Stop authoring project-wide test/build commands into tasks, and stop validating them"
status: done
created: 2026-09-19
updated: 2026-09-19
author: Anthony Koukoullis
base_commit: 52421d2
depends_on: []
links: []
---

## Summary

`skills/flowcharge/templates/plan-and-tasks-spec.md` Part 2 currently instructs the
authoring subagent to add the project's lint, type-check, build, or test commands to
every task as a `verify` step. `skills/fc-validate/SKILL.md` Part 3 admits those same
commands into its runnable class and runs them at `base_commit`, where a project-wide
command passes regardless of the task, so the run proves nothing and the validator's
own judgment section already says so. This plan makes the three wording changes the
workstream record specifies: stop authoring test-suite and build commands (lint and
type-check stay), narrow the validator's runnable class to task-specific assertions
only, and delete the now-dead sentence in the validator's judgment section that
describes a project-wide pass as expected.

## Scope

In scope:

- AC1: `skills/flowcharge/templates/plan-and-tasks-spec.md` no longer contains the
  string `Prefer the project's own lint, type-check, build, or test commands`
  (measured now, at `base_commit`: 1 match). It contains, in its place, prose that
  admits only lint and type-check as verify-step candidates and explicitly forbids
  test-suite and build commands.
- AC2: `skills/fc-validate/SKILL.md`'s `### The runnable command class` section no
  longer contains the string `Admitted: linting, type-checking, a unit or single-file
  test run` (measured now: 1 match), and no longer names
  `node skills/flowcharge/scripts/test/run-tests.mjs` as an admitted command
  (measured now: 1 match at line 142). The replacement text admits only a `grep`, a
  count, a file-existence check, or an equivalent read-only assertion about a named
  file, and explicitly excludes lint, type-check and test suites alongside the
  already-excluded builds/deploys/etc.
- AC3: `skills/fc-validate/SKILL.md`'s `### The judgment` section no longer contains
  the string `project-wide lint or test step that passes is expected and is not
  itself a defect` (measured now: 1 match), and the surrounding bullet list still
  reads grammatically with that sentence gone.
- AC4: `grep -rn "run-tests.mjs" skills/fc-validate/SKILL.md` returns zero matches
  after the change (measured now, at `base_commit`: 1 match, the one AC2 removes).
- AC5: no other sentence in either file's affected section changes; the
  configuration-discovery sources, the toolchain-mismatch prohibition, the
  `issues:`-key sentence, the file-existence/`grep` admission, the exclusion of
  builds/deploys/network operations, the "unrun" paragraph, the cross-reference to
  `execute-parent-task.md`, and the first and third bullets of the judgment section
  all survive verbatim.
- AC6: `skills/flowcharge/templates/plan-and-tasks-diff.md` no longer contains the
  string `Prefer the project's own lint, type-check, build, or test commands`
  (measured now, at `base_commit`: 1 match). It contains, in its place, the same
  replacement prose Stage 1 applies to `plan-and-tasks-spec.md`, admitting only lint
  and type-check as verify-step candidates and explicitly forbidding test-suite and
  build commands.

Out of scope, per the workstream record's own "Unchanged" section: the
discriminating-assertion rule ("Measure before you write" in
`plan-and-tasks-spec.md`), the validator's tautology-detection check (the judgment
section's first bullet), the accuracy class, the baseline gate, and the task file
format, frontmatter, or numbering scheme. None of these are touched by any stage
below.

Assumption: "lint and type-check stay" (the record's own phrase) means both survive
as admitted verify-step candidates in both files, on the same conditional footing
they have today — only when the project already has one configured, never invented.
The record states this outcome directly for change 1 and implies it for change 2 by
listing "linting, type-checking" nowhere in either the admitted or excluded list of
its own current-text quote for change 2, but its replacement text for change 2
excludes lint and type-check from the validator's runnable class explicitly. This is
correct on a close reading: the record separates two different questions. Change 1 is
about what the *authoring* subagent may add to a task's `verify` steps (lint/type-check
stay there). Change 2 is about what the *validator* may execute at `base_commit`
(lint/type-check are excluded there too, because the validator's job is to catch
tautologies, and a lint/type-check command is exactly as incapable of failing on
unmodified code as a test-suite command is — the record's replacement text for change
2 says this explicitly: "Lint, type-check and test commands are excluded although they
are fast and side-effect-free"). So lint/type-check remain authorable but become
**unrun** by the validator, joining the class of steps that are neither pass nor fail.
This reading is taken directly from the record's own replacement text, not invented,
so it is recorded here as a confirmation, not an open question.

## Design

### Approach chosen

Apply the workstream record's three drafted wording changes as literal, targeted
substitutions in the two named files, verified against the live file content read in
this session (all three anchors were re-verified in this session and match the
record's quoted "Current text" verbatim — no drift from the later-merged WS-16/WS-25/
WS-13/WS-22/WS-23 changes touched these particular sentences). No new mechanism, no
new frontmatter key, no new script. This is a direct wording edit because the record
already specifies the exact replacement text, has already stated why each clause goes,
and the "Unchanged" section already forecloses any structural alternative.

### Alternatives considered and rejected

- **Add a machine-checkable rule (e.g. a script that scans authored task lists for
  banned command substrings) instead of a wording change.** Rejected: the workstream
  record scopes this as a documentation/instruction-wording change to two skill files,
  states plainly that no build, lint or type-check exists for these Markdown files,
  and does not ask for tooling. A new script would be an invented capability the
  record never requested.
- **Also fix `plan-and-tasks-diff.md`, which carries the identical stale paragraph
  found at `plan-and-tasks-spec.md` line 87 (confirmed in this session: grep for the
  same "Prefer the project's own lint, type-check, build, or test commands" string
  returns 1 match in `plan-and-tasks-diff.md` too).** Rejected as a silent scope
  expansion: the record explicitly says diff mode "doesn't add verify steps the same
  way spec mode does" and asks the plan/task-authoring stage to confirm this itself
  rather than assume it. Having read the file, the paragraph is byte-identical to the
  one in spec mode and is reachable the same way (Part 2's task-authoring guidance),
  so the confirmation does not support the record's premise — diff mode has the same
  defect. Per the record's own instruction, this is raised as an open question below
  rather than actioned.
- **Rephrase change 2's replacement text rather than adopting the record's own
  drafted wording verbatim.** Rejected: the record's replacement text is already
  precise, already explains its own reasoning inline (so a future reader does not
  need to consult the workstream record to understand why lint/type-check are
  excluded from the runnable class), and Context directs treating the record's three
  numbered changes as the plan's starting point, not merely background.

## Stages

1. **Stop authoring test-suite and build commands into tasks.** Goal: replace the
   "Prefer the project's own lint, type-check, build, or test commands..." paragraph
   in `skills/flowcharge/templates/plan-and-tasks-spec.md` Part 2 with the record's
   replacement text, verbatim. Observable when it ends: AC1 holds, and lint/type-check
   commands are still describable as verify steps in the file's prose while test-suite
   and build commands are explicitly forbidden.

2. **Narrow the validator's runnable command class.** Goal: replace the
   `### The runnable command class` section body in `skills/fc-validate/SKILL.md`
   Part 3 with the record's replacement text, verbatim. Observable when it ends: AC2
   holds — the class admits only `grep`, count, file-existence, and equivalent
   read-only per-file assertions, excludes lint/type-check/test/build alongside the
   prior exclusions, and no longer names `run-tests.mjs` as admitted.

3. **Delete the dead clause in the validator's judgment section.** Goal: shorten the
   second bullet of `skills/fc-validate/SKILL.md`'s `### The judgment` section to
   drop the now-impossible "project-wide lint or test step that passes is expected"
   sentence, verbatim per the record's replacement text. Observable when it ends: AC3
   holds, and the bullet list (three bullets, unchanged first and third) still reads
   as a coherent list.

Stages 2 and 3 both touch `skills/fc-validate/SKILL.md` but at non-adjacent sections
(`### The runnable command class` and `### The judgment`) and change unrelated
sentences, so they stay as two stages rather than merging into one — each has its own
independently statable goal and acceptance criterion, and the task list may decompose
each into its own task.

4. **Fix the identical paragraph in `plan-and-tasks-diff.md`.** Goal: replace the
   "Prefer the project's own lint, type-check, build, or test commands..." paragraph
   in `skills/flowcharge/templates/plan-and-tasks-diff.md` Part 2 with Stage 1's own
   replacement text, verbatim. Re-read in this session, the paragraph and its
   surrounding sentences (`Where a stage depends on an open question...` before it,
   `Measure before you write...` after it) are byte-identical to
   `plan-and-tasks-spec.md`'s own copy, so Stage 1's replacement text fits without any
   adjustment. Observable when it ends: AC6 holds, mirroring AC1 for the diff-mode
   template.

Stage 4 was added after this plan's own Open questions section first flagged the
identical paragraph in `plan-and-tasks-diff.md` and recommended a separate workstream;
the user directly instructed folding the fix into this same workstream instead, so it
is added here as a fourth stage rather than left open (see "Open questions" below).

## Data & compatibility

None. Both target files are Markdown instruction prose consumed by an LLM subagent at
run time; there is no schema, stored data, or API surface to migrate. No other file in
the suite quotes the sentences being changed (confirmed: `run-tests.mjs` appears
in exactly three places across `skills/` — its own script header, a `CONVENTIONS.md`
mention of a `run-tests.mjs` test case that is unrelated to this change, and the one
`fc-validate/SKILL.md` line AC4 removes). No task list, issue list, or plan already
written and merged depends on the current wording of either paragraph; this plan does
not touch or ask to touch `TL-8-jxzn3o-tasklist.md`, the example the workstream record
cites, which stays as a historical artefact.

## Testing strategy

No build, lint, or type-check applies to these Markdown files (stated directly in
Context). Verification is:

- The AC1 through AC6 greps and reads, run against the working tree after each stage.
- A read of the full modified paragraph/section in each file, checking that the
  surrounding sentences the record marks unchanged are still present and that the
  new prose reads as a coherent instruction on its own, without needing the
  workstream record to disambiguate it.
- `node skills/flowcharge/scripts/test/run-tests.mjs`, the project's own check suite,
  run after all four stages land, to confirm nothing else in the suite depends on
  the exact wording being changed.

## Open questions

- **Resolved:** `skills/flowcharge/templates/plan-and-tasks-diff.md` line 85 carried
  the identical "Prefer the project's own lint, type-check, build, or test commands"
  paragraph that spec mode carries at line 87. This plan originally recommended a
  separate workstream for it. The user has since directly instructed folding the fix
  into this same workstream instead, so it is now Stage 4 and AC6 above rather than a
  follow-up.

## Alternatives considered and rejected

See "Design" above; the two alternatives considered (a machine-checkable rule, and
silently also fixing `plan-and-tasks-diff.md`) are recorded there together with the
approach chosen, per this plan's own stage-adjacent reasoning.

## Final summary

Four stages, one wording substitution each, confined to
`skills/flowcharge/templates/plan-and-tasks-spec.md`,
`skills/flowcharge/templates/plan-and-tasks-diff.md`, and `skills/fc-validate/SKILL.md`.
All "Current text" anchors from the workstream record, and Stage 4's anchor in
`plan-and-tasks-diff.md`, were re-verified against the live files in this session and
match verbatim, so no anchor drift applies. The open question about
`plan-and-tasks-diff.md` carrying the identical defect has been resolved, not left
open: the user directly instructed folding the fix into this same workstream, which
Stage 4 and AC6 now do.
