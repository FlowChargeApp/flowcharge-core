---
id: PLN-13-ph686h
type: plan
workstream: WS-25-gef05v
slug: defect-fix-before-feature-ordering
title: "Close the defect-fix-before-feature ordering gap with guidance-only wording fixes"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
base_commit: d107ba9
depends_on: []
links: []
---

Close the four named gaps (plus one accepted fifth) that stop FlowCharge Core from expressing
"fix these blocking defects first, then plan the feature" as one ordered, correctly-scoped
piece of work, by editing instruction wording in `skills/flowcharge/SKILL.md` and
`skills/flowcharge/CONVENTIONS.md` only. No pipeline stage, `{stages}` value, or
`flowcharge/agents.md` setting is added.

## Scope

This plan implements exactly the four gaps `flowcharge/workstreams/WS-25-gef05v-defect-fix-before-feature-ordering/workstream.md`
names, plus the one additional finding that record leaves for this plan to accept or reject
(accepted below, as a fifth fix). Nothing else. The two residual points the record names under
gap 3 ("Hard rule 5 fires only before the execute-tasks prompt, while the damage happens
earlier, at authoring" and "a plan's own `depends_on` is read by nothing today") are explicitly
out of scope: the record raises them as residuals it does not ask this plan to close, and
closing them would mean either a new read-time check or a schema change, both of which the
record's own diagnosis rules out for this gap ("a guidance gap, not a schema gap").

**Assumption 1 — which files "skills/flowcharge/SKILL.md" and ".../CONVENTIONS.md" name.**
This repository is the FlowCharge Core skill suite's own source. It holds a project-root copy
at `skills/flowcharge/{SKILL.md,CONVENTIONS.md}` (version `0.4.0`) that differs from the
separately-installed copy at `/Users/akoukoullis/.claude/skills/flowcharge/` (version `0.3.0`,
confirmed by diff at plan time). The workstream record's paths are written relative to the
project root, and editing the installed copy would not change what this project ships. This
plan edits the project-root copy only.

**Assumption 2 — the CONVENTIONS.md addition needs a "no script can check" note.**
`DEVELOPMENT.md` requires that "a new rule added to CONVENTIONS.md ships with one of two
things, and never with neither: a matching check in `fc-index.mjs` plus a case in
`run-tests.mjs`... or an explicit 'no script can check this' note in CONVENTIONS.md next to the
rule itself." The gap-3 addition to CONVENTIONS.md is such a new rule. Whether a given
`depends_on` entry expresses a "fix this before that" constraint is a fact about the author's
intent, not about the file's shape, so no script can check it — the same class of
unverifiable rule CONVENTIONS.md already marks this way next to `plan: base_commit` and
`author`. This plan extends the record's proposed wording for location 3a with one added
sentence carrying that note, rather than lifting it fully verbatim. This is a refinement, not a
rejection: the record's own sentences are kept exactly, with the note appended.

**Assumption 3 — the fifth fix (hard rule 13's drift-check cadence) is accepted.**
The record marks this "recorded, not decided" and asks this plan to rule on it. Accepted,
because it shares the exact root cause the record already proved for gap 2: hard rule 13's own
prose already scopes the check to "the task list that stage is about to execute," but its
firing cadence is pinned to "once per run," so a run with two execute-tasks stages (the ordered
pattern gap 1 now names) would skip the drift check before the second stage's first spawn
entirely — the same once-per-run-versus-once-per-stage confusion gap 2 already diagnoses, in a
different rule. Rejecting it would leave a second, structurally identical bug sitting next to
the one this plan is fixing. The fix is a two-phrase wording change, bounded to hard rule 13
alone, recoverable by a follow-up edit if this judgment turns out wrong.

**Assumption 4 — line numbers.** The record's cited line numbers (319, 396, 512, 562 in
`SKILL.md`, and hard rules 12 and 13's positions) were re-checked against the file as read for
this plan and matched exactly. Task authoring must still re-read each file fresh per its own
rules, since drift is possible between plan and task authoring.

No open questions carry a recoverability risk high enough to withhold a stage; none are raised.

## Approach

**Chosen: apply the four proposed wordings as drafted, plus the accepted fifth, as
prose-only edits at the five named locations**, with the one deliberate refinement in
Assumption 2. Each location gets exactly the sentence(s) the record proposes (or, for gap 5,
the two-phrase cadence rewording it proposes), placed to read as one continuous sentence with
the surrounding paragraph, never as a bolted-on aside.

**Rejected: a new `{stages}` value or orchestrator stage modelling "fix-then-plan" as one
first-class operation.** The record's own diagnosis shows the ordered pattern already runs as
two chained authoring stages using `{stages}` values that already exist
(`issues-and-tasks`, then `plan-and-tasks`); a new stage would duplicate machinery gap 1 and
gap 2 already unlock by naming the chain and fixing its per-stage bound. This is also what
Context explicitly rules out.

**Rejected: a new `flowcharge/agents.md` setting to toggle the ordering.** The record found no
configurable *behavior* missing, only missing guidance; a setting would add surface area with
no behavior difference to key it on.

**Rejected: closing gap 3 by changing hard rule 5's carve-out logic instead of guidance.** The
record is explicit that this is "a guidance gap, not a schema gap": a `tasklist` dependency
already requires `done` with no carve-out, so the schema already expresses the constraint
correctly once the author points `depends_on` at the right artefact type. Changing the
carve-out itself would solve a problem that does not exist and risks breaking the working
authorship-only carve-out that genuine plan/issue-list dependencies still need.

**Rejected: putting the gap-3a rule inside the `depends_on: []` frontmatter YAML comment**
instead of as prose below the frontmatter block. CONVENTIONS.md's established pattern keeps the
frontmatter example compact and pushes elaboration into prose immediately below it (as it
already does for `blocked`, `plan: base_commit`, `tasklist: mode`, and "Author attribution").
Cramming a multi-sentence rule into the YAML comment would break that convention and bloat the
template past what it exists to show.

## Design, by stage

Each stage is one wording fix at one or two named locations in one file. SEARCH/REPLACE anchors
are for task authoring to copy fresh from the file as read at that time, per the task-list
rules; only the target text and its placement are decided here.

### Stage 1 — name the ordered pattern (gap 1)

**File:** `skills/flowcharge/SKILL.md`, "Parsing the request" section, the standard-chains
list (currently bullets starting "file these findings as issues...", "plan X...", "look into
X...", "turn <issue list / plan> into tasks...", "run <task list>...", "add X to the
board/backlog").

**Change:** add one new bullet, placed immediately after the "plan X [and build it]" bullet,
carrying the record's proposed chain verbatim:

> "fix what blocks X, then plan X" → issues-and-tasks → validate → [prompt] execute-tasks →
> [prompt] commit → plan-and-tasks → validate → [prompt] execute-tasks → [prompt] commit. One
> workstream, two authoring stages. Each per-authoring-stage bound applies to each stage.

The closing clause ("Each per-authoring-stage bound applies to each stage") depends on Stage 2
renaming the bound to "per authoring stage," so Stage 2 must land in the same edit or before
this sentence is read as correct; both land in this plan's single task-authoring pass.

**Acceptance:** the phrase "fix what blocks X, then plan X" appears once in `SKILL.md` (0
occurrences at `base_commit`).

### Stage 2 — fix the validation bound's self-contradiction (gap 2)

**File:** `skills/flowcharge/SKILL.md`, three locations that currently assert the validation
pass runs "once per run" (the validation-setting section, the Operations table's `validate`
note, and the Chaining section), against one location (already correct) that calls the same
bound "once-per-authoring-stage."

**Change**, at each of the three locations, replacing only the cadence phrase and its
immediate qualifier, leaving the rest of each sentence intact:

- Validation-setting section: "one pass runs once per run, after the authoring stage's return
  and before the execute-tasks prompt" → "one pass runs once per authoring stage, after that
  stage's return and before the execute-tasks prompt that follows it."
- Operations table's `validate` note: "one pass runs once per run, spawned after the authoring
  stage's return and before the execute-tasks prompt" → "one pass runs once per authoring
  stage, spawned after that stage's return and before the execute-tasks prompt that follows
  it."
- Chaining section: "it runs at most once per run" → "it runs at most once per authoring
  stage."

**Excluded from this stage, on purpose:** every other "once per run" occurrence in
`SKILL.md` (e.g. hard rule 11's default-branch check, the `{{context docs}}` resolution note,
and the Chaining section's separate one-re-spawn-per-run budget) names a different rule the
record does not flag as contradictory, and stays untouched. Widening the fix to those would
exceed what the record scopes.

**Acceptance:** "one pass runs once per run" and "it runs at most once per run" each occur 0
times in `SKILL.md` after the edit (2 and 1 occurrences respectively at `base_commit`); "once
per authoring stage" occurs 3 times after the edit (0 occurrences at `base_commit`: the
pre-existing line at 562 names the bound as "once-per-authoring-stage", a hyphenated form this
exact phrase does not match).

### Stage 3 — point the dependency carve-out at the right artefact (gap 3)

**Files:** `skills/flowcharge/CONVENTIONS.md` (the `depends_on` definition) and
`skills/flowcharge/SKILL.md` ("Chaining" section, where `depends_on` is already discussed for
downstream artefacts).

**Change, CONVENTIONS.md:** immediately after the existing sentence "`depends_on` is data, not
prose. Ordering constraints between workstreams or artefacts go here, never only in a card's or
file's body text," add the record's proposed rule plus the no-script-check note Assumption 2
requires:

> Where the constraint is that defects must be fixed before this work starts, record the
> fixing task list's ID, not the issue list's. A `tasklist` dependency requires `done`; an
> issue-list dependency is met once authored, which is not the wait you mean. **No script can
> check this**: whether a given `depends_on` entry expresses that constraint is a fact about
> the author's intent, not the file's shape, so documented guidance is its only defence.

**Change, SKILL.md:** immediately after the existing sentence "The authoring templates
instruct this; verify it landed" (end of the `depends_on`-recording bullet in "Chaining"), add
the record's proposed sentence verbatim:

> A prerequisite-defect constraint records the fixing task list's ID, never the issue list's.
> Only a `tasklist` dependency waits for the fix to land.

**Acceptance:** "fixing task list" occurs at least once in `CONVENTIONS.md` and at least once
in `SKILL.md` after the edit (0 occurrences in either file at `base_commit`); the CONVENTIONS.md
addition contains the literal string "No script can check".

### Stage 4 — stop hard rule 12 asking the plan to absorb an already-fixed defect (gap 4)

**File:** `skills/flowcharge/SKILL.md`, hard rule 12 ("A plan is checked against its
motivating scenario before anything is built from it").

**Change:** insert one new sentence immediately after the existing sentence "When it names one
the plan's stated design does not visibly handle, halt and report instead of spawning the next
stage; the user may override, per-run, exactly as rule 5's dependency check does," and before
"This check supplements, and never replaces, a walkthrough task a task list may still place
against the finished file," carrying the record's proposed exception verbatim:

> Where the record names a scenario as a prerequisite defect an earlier stage of this run
> already fixed, name that fix as the answer: the plan's design is not required to handle it,
> and must not absorb it.

Placed there, the exception reads immediately after the general halt-on-unhandled-scenario rule
it qualifies, and before the closing caveat about the walkthrough task, so the rule's shape
stays "handle it → unless already fixed → still checked at the walkthrough" in reading order.

**Acceptance:** "prerequisite defect" occurs at least once in `SKILL.md` after the edit (0
occurrences at `base_commit`).

### Stage 5 — fix hard rule 13's drift-check cadence to match its own per-stage scope (accepted fifth fix)

**File:** `skills/flowcharge/SKILL.md`, hard rule 13 ("A task list is checked for drift against
the branch before execute-tasks' first spawn").

**Change:** replace "Run this check once per run, immediately before the first parent-task
spawn; do not repeat it before later parent tasks in the same run" with the record's proposed
wording:

> Run this check once per execute-tasks stage, immediately before that stage's first
> parent-task spawn; do not repeat it before later parent tasks in the same stage.

**Acceptance:** "once per execute-tasks stage" occurs exactly once in `SKILL.md` after the edit
(0 occurrences at `base_commit`).

## Whole-plan acceptance

- `node skills/flowcharge/scripts/test/run-tests.mjs` reports the same pass count before and
  after this plan's edits (256/256 at `base_commit`), since none of the five locations is
  covered by an existing test case for this specific rule.
- Every grep-based per-stage acceptance criterion above holds simultaneously in one final
  read of both files.
- No edit touches any file other than `skills/flowcharge/SKILL.md` and
  `skills/flowcharge/CONVENTIONS.md`.

## Open questions

None. Every point Context left unsettled is resolved above as an assumption, each recoverable
by a follow-up edit if wrong.
