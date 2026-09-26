---
id: PLN-16-zn02av
type: plan
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Bound the orchestrator's briefing-authoring reads to flowcharge/, closing the artefact-files carve-out"
status: done
created: 2026-09-19
updated: 2026-09-20
author: Anthony Koukoullis
base_commit: fffbf32
depends_on: []
links: []
---

## Scope

Forbid the orchestrator from opening a file outside `flowcharge/` to fill a `{{...}}`
briefing block, and bound every statement of what it may read to one phrase, "files under
`flowcharge/`". This is a prose-only wording fix, not a mechanism. It changes four passages in
`skills/flowcharge/SKILL.md` and one line in each of the two `plan-and-tasks-*.md` templates,
and nothing else.

**Files and passages touched, and nothing else** (line numbers at `base_commit` `fffbf32`):
- `skills/flowcharge/SKILL.md`, hard rule 8's carve-out clause (lines 96-97).
- `skills/flowcharge/SKILL.md`, hard rule 12's citation of that clause (lines 162-163).
- `skills/flowcharge/SKILL.md`, hard rule 13's citation of that clause (lines 197-199).
- `skills/flowcharge/SKILL.md`, "Filling a template" step 4 (lines 472-476).
- `skills/flowcharge/templates/plan-and-tasks-spec.md`, the `{{briefing}}` placeholder at
  line 16.
- `skills/flowcharge/templates/plan-and-tasks-diff.md`, the same placeholder at line 16,
  identical wording change. The two templates' line 16 is byte-identical today and stays so.

**Assumption 1: one term for the bound, everywhere.** Step 4 already states the positive bound
as "files under `flowcharge/`". Every passage this plan edits uses that exact phrase for what
may be read, and the exact phrase "a file outside `flowcharge/`" for what may not. The term
"project source file" is not used in any edited text: it is undefined in the skill, and it reads
as code, so a README or an architecture document would not obviously fall under it, yet those
are the files an orchestrator is most likely to open for briefing facts.

**Assumption 2: the rule lives in step 4; each placeholder carries a one-line pointer.** Step 4
of "Filling a template" is the numbered procedure step that governs every `{{...}}` block in
every template. Five templates carry a briefing block (`plan-and-tasks-*`, `issues-and-tasks-*`,
`execute-parent-task.md`). `DEVELOPMENT.md` places a procedural rule "at the step where it must
be applied", so the prohibition is written into step 4, where it protects all five. The two
`plan-and-tasks-*` placeholders, the ones the workstream record names, additionally carry an
eleven-word reminder at the point of drafting. That duplication is deliberate and small: one
rule, one pointer.

**Assumption 3: hard rule 8's closed list agrees with step 4's exception.** Rule 8 lists "the
only inline actions". Step 4 makes the `{{context docs}}` block "the one exception" to the
`flowcharge/` bound, because that block's own text sends the orchestrator to check the project
root for documentation. After narrowing rule 8 to "files under `flowcharge/`", the list would
omit that check unless it names it, so rule 8's clause names it in a parenthesis.

**Assumption 4: hard rules 12 and 13's citations are realigned.** Both rules cite "rule 8's
carve-out for reading artefact files when a briefing needs facts". Once rule 8 no longer contains
that phrase, the two citations point at wording that does not exist. Each is a three-word edit,
so both are included rather than left as a known stale reference.

**Assumption 5: the briefing placeholder points at the workstream record.** The template gives
the subagent `{ws_dir}` but never tells it to read `{ws_dir}/workstream.md`, so the motivating
scenario reaches the subagent only if the orchestrator retypes it into the briefing. The
`plan-only` clause of the placeholder now tells the orchestrator to point at that file rather
than restate its body. This removes a second duplicate read of the same kind the workstream
describes. `{name}` slots already appear inside this placeholder (`{stages}`), so `{ws_dir}`
inside it follows existing precedent and is substituted at step 3 before step 4 runs.

## Approach

**Chosen: one bound phrase, one prohibition in the procedure, one pointer per placeholder.**

1. In `SKILL.md` hard rule 8, replace "artefact files" with "files under `flowcharge/`" and
   name the `{{context docs}}` project-root check in a parenthesis, so the closed list and step
   4 agree.
2. In `SKILL.md` hard rules 12 and 13, replace "reading artefact files" with "reading files
   under `flowcharge/`" in each citation of rule 8.
3. In `SKILL.md` step 4, replace "`flowcharge/`, never invent." with "`flowcharge/`; never
   invent, never open a file outside `flowcharge/`." so the existing "one exception" sentence
   that follows now reads as an exception to a stated prohibition.
4. In both `plan-and-tasks-*.md` templates, line 16: (a) in the `plan-only` clause, insert
   "pointing at `{ws_dir}/workstream.md` rather than restating its body," after "why it is
   wanted,"; and (b) append the closing sentence "Never open a file outside `flowcharge/` to
   fill this block." The line lands character-for-character identically in both files.

**Rejected: put the prohibition only in the two template placeholders.** A placeholder is
deleted the moment it is obeyed, is not a procedure step, and covers two of the five briefing
blocks. The positive bound in step 4 already existed and was stretched to project source, so the
explicit negation is the new ingredient and belongs where every block is governed.

**Rejected: a longer template sentence that restates the allowed sources.** "Draw every fact
here from the conversation, the chained artefacts, and files under `flowcharge/`" repeats step
4 almost word for word. `DEVELOPMENT.md` requires every instruction to be token-efficient, so
the placeholder carries only the eleven-word prohibition.

**Rejected: leave rules 12 and 13 citing the retired phrase.** Two citations of wording that no
longer exists are a maintenance defect, and the fix is three words each.

**Rejected: a script-level check that flags a briefing whose text overlaps a project source
file.** `skills/flowcharge/CONVENTIONS.md` records the governing pattern: nothing on disk records
why the orchestrator opened a given file, so no `--check` warning can verify intent. The fix is a
stated prohibition in prose.

## Design: the exact text changes

All "Current" blocks are the text at `base_commit` `fffbf32`. Indentation is part of the text.

**1. `skills/flowcharge/SKILL.md`, hard rule 8's carve-out clause (lines 96-97).**

Current:
```
   is recognized (see "Standing vs. one-off instructions"), and reading artefact
   files when a stage's return needs verifying or a briefing needs facts.
```
New (three lines; the phrase "files under `flowcharge/`" sits on one line):
```
   is recognized (see "Standing vs. one-off instructions"), and reading
   files under `flowcharge/` (plus the project-root check the `{{context docs}}`
   block names) when a stage's return needs verifying or a briefing needs facts.
```
No other word in hard rule 8 changes.

**2. `skills/flowcharge/SKILL.md`, hard rule 12's citation (lines 162-163).**

Current:
```
    own reading, under rule 8's carve-out for reading artefact files when a
    briefing needs facts, never a subagent's. When the workstream record
```
New:
```
    own reading, under rule 8's carve-out for reading files under `flowcharge/`
    when a briefing needs facts, never a subagent's. When the workstream record
```

**3. `skills/flowcharge/SKILL.md`, hard rule 13's citation (lines 197-199).**

Current:
```
    the same stage. It is the orchestrator's own reading, under rule 8's
    carve-out for reading artefact files when a briefing needs facts,
    never a subagent's.
```
New:
```
    the same stage. It is the orchestrator's own reading, under rule 8's
    carve-out for reading files under `flowcharge/` when a briefing needs facts,
    never a subagent's.
```

**4. `skills/flowcharge/SKILL.md`, "Filling a template" step 4 (lines 472-476).**

Current:
```
4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
   the points the placeholder text names. Draw facts from the conversation, the
   chained artefacts (read them if needed), and files under `flowcharge/`, never invent.
   The `{{context docs}}` block is the one exception: its own text names the
   project-root files to check for.
```
New:
```
4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
   the points the placeholder text names. Draw facts from the conversation, the
   chained artefacts (read them if needed), and files under `flowcharge/`; never
   invent, never open a file outside `flowcharge/`. The `{{context docs}}` block is
   the one exception: its own text names the project-root files to check for.
```

**5. `skills/flowcharge/templates/plan-and-tasks-spec.md`, line 16.**

Current:
```
{{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play.}}
```
New:
```
{{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Never open a file outside `flowcharge/` to fill this block.}}
```

**6. `skills/flowcharge/templates/plan-and-tasks-diff.md`, line 16.**

Identical change to the same line, character-for-character matching item 5. The two templates'
line 16 is byte-identical at `base_commit` and stays byte-identical after this change.

After all six edits, `skills/flowcharge/SKILL.md` contains the phrase "files under
`flowcharge/`" on exactly four lines (rule 8, rule 12, rule 13, step 4), the phrase "artefact
files" on none, and the phrase "never open a file outside `flowcharge/`" on one (step 4). Each
template contains "Never open a file outside `flowcharge/` to fill this block" once.

## Acceptance criteria

1. Hard rule 8's carve-out clause reads exactly as Design item 1's New block, and no other
   text in hard rule 8 (lines 90-98 after the edit) differs from `base_commit`.
2. Hard rules 12 and 13 cite rule 8 as "carve-out for reading files under `flowcharge/` when a
   briefing needs facts", exactly as Design items 2 and 3 show. A single-line grep for "artefact
   files" over `SKILL.md` returns 0 (it returns 2 at `base_commit`).
3. Step 4 reads exactly as Design item 4's New block. Its "one exception" sentence is unchanged
   in wording and now follows a stated prohibition.
4. A single-line grep for "files under `flowcharge/`" over `SKILL.md` returns 4 (it returns 1
   at `base_commit`). No edited line wraps that phrase across a line break.
5. `plan-and-tasks-spec.md` line 16 reads exactly as Design item 5's New block, and
   `plan-and-tasks-diff.md` line 16 is byte-identical to it.
6. No other line in either template changes: the `{{context docs}}` placeholder (line 14) and
   its instructions, the Role/Skills/Instructions sections, and the Part 1/Part 2 bodies are
   untouched.
7. No file other than the three named in Scope is modified. `issues-and-tasks-spec.md`,
   `issues-and-tasks-diff.md`, `execute-parent-task.md`, and every hard rule in `SKILL.md`
   other than 8, 12 and 13 are byte-identical to `base_commit`.
8. No new text names a model, vendor, or harness product, or depends on a harness-specific
   feature. All of it is plain instructional Markdown that a differently-capable compliant
   model, in a different compliant harness, could follow unchanged, per the "What this rules
   out" list in `DEVELOPMENT.md`.
9. No behavioral change beyond the prohibition: reading files under `flowcharge/` to verify a
   return or fill a briefing stays allowed, and the `{{context docs}}` block's own license to
   check the project root is untouched and is now named in rule 8.
10. No task's `verify` step names a test-suite, build, or lint command. Verification is by
    grep and diff only, per the Testing strategy below.

## Testing strategy

This is a prose change to skill files. No test-suite, build, or lint command is added as a
verify step: the `plan-and-tasks-*` templates forbid that, because such a command passes before
the change as readily as after. The repository's standing skill-file consistency checks cover
every `skills/**/*.md` and remain the user's own step after execution.

Verification is by direct reading of the edited passages against the Design section, and by
greps and diffs whose expected values are measured at `base_commit` before they are written down,
as the `plan-and-tasks-*` templates require:

- AC2 and AC4: a single-line grep count of "artefact files" (2 before, 0 after) and of "files
  under `flowcharge/`" (1 before, 4 after) over `SKILL.md`.
- AC3: a grep for "never open a file outside `flowcharge/`" in `SKILL.md` (0 before, 1 after).
- AC5: a grep for "Never open a file outside `flowcharge/` to fill this block" and for
  "pointing at `{ws_dir}/workstream.md`" in each template (0 before, 1 after each), then a diff
  of the two templates' line 16 against each other (empty before and after).
- AC1, AC6, AC7: `git diff` against `base_commit` shows hunks only at the six passages named in
  Scope.

## Open questions

None. The workstream record names the two templates' line 16 and hard rule 8, and its quoted
instruction lists the four things a briefing should name, including the workstream record.
This plan covers all of them and extends the same bound to the three passages in `SKILL.md`
that state or cite it, so that one phrase describes the bound everywhere.
