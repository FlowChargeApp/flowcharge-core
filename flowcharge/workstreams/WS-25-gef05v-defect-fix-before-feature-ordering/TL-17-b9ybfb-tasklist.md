---
id: TL-17-b9ybfb
type: tasklist
workstream: WS-25-gef05v
slug: defect-fix-before-feature-ordering
title: "Close the defect-fix-before-feature ordering gap with guidance-only wording fixes"
status: ready
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: [PLN-13-ph686h]
mode: diff
base_commit: d107ba9
links: []
---

Implements `PLN-13-ph686h`: five prose-only edits across `skills/flowcharge/SKILL.md` and
`skills/flowcharge/CONVENTIONS.md` closing the four named gaps plus the accepted fifth
(hard rule 13's drift-check cadence). No code, script, or schema change.

## Divergences

None. `git diff --name-only d107ba9..HEAD` returns empty at task-authoring time (HEAD equals
the plan's `base_commit`), so both target files were re-read fresh from disk as found, with no
divergence from what the plan assumes.

## Tasks

### 1. Name the ordered pattern in "Parsing the request" (plan Stage 1 / gap 1)

- type: task
- author: Anthony Koukoullis

Add the new standard chain bullet for "fix what blocks X, then plan X" to
`skills/flowcharge/SKILL.md`'s "Parsing the request" section, immediately after the
"plan X [and build it]" bullet.

```
SEARCH:
- "plan X [and build it]" → plan-and-tasks → validate →
  [prompt] execute-tasks → [prompt] commit
- "look into X" / "investigate X" → investigate (then stop; feed into plan-and-tasks or
REPLACE:
- "plan X [and build it]" → plan-and-tasks → validate →
  [prompt] execute-tasks → [prompt] commit
- "fix what blocks X, then plan X" → issues-and-tasks → validate → [prompt] execute-tasks →
  [prompt] commit → plan-and-tasks → validate → [prompt] execute-tasks → [prompt] commit. One
  workstream, two authoring stages. Each per-authoring-stage bound applies to each stage.
- "look into X" / "investigate X" → investigate (then stop; feed into plan-and-tasks or
```

File: `skills/flowcharge/SKILL.md`

verify:
- `grep -c 'fix what blocks X, then plan X' skills/flowcharge/SKILL.md` returns `1` (returned
  `0` at `base_commit`).

### 2. Fix the validation bound's once-per-run/once-per-authoring-stage contradiction (plan Stage 2 / gap 2)

- type: task
- author: Anthony Koukoullis

Three edits in `skills/flowcharge/SKILL.md`, each renaming the validation pass's cadence from
"once per run" to "once per authoring stage" and tightening the qualifier to name that stage
explicitly, leaving every other word of each sentence untouched.

```
SEARCH:
Under `on`, one pass runs once per run, after the authoring stage's return and before
the execute-tasks prompt. Under `off`, no validator is spawned.
REPLACE:
Under `on`, one pass runs once per authoring stage, after that stage's return and before the
execute-tasks prompt that follows it. Under `off`, no validator is spawned.
```

```
SEARCH:
- **validate**: under `validate: on`, one pass runs once per run, spawned after the
  authoring stage's return and before the execute-tasks prompt. The path chooses the
REPLACE:
- **validate**: under `validate: on`, one pass runs once per authoring stage, spawned after
  that stage's return and before the execute-tasks prompt that follows it. The path chooses the
```

```
SEARCH:
The validation stage is the one exception to "subagent returns feed the next
`{{briefing}}`", and it runs at most once per run. Its briefing
REPLACE:
The validation stage is the one exception to "subagent returns feed the next
`{{briefing}}`", and it runs at most once per authoring stage. Its briefing
```

File: `skills/flowcharge/SKILL.md`

Excluded on purpose: every other "once per run" occurrence in this file (hard rule 11's
default-branch check, the `{{context docs}}` resolution note, and the Chaining section's
separate one-re-spawn-per-run budget) names a different rule the plan does not scope this fix
to, and stays untouched.

verify:
- `grep -c 'one pass runs once per run' skills/flowcharge/SKILL.md` returns `0` (returned `2`
  at `base_commit`).
- `grep -c 'it runs at most once per run' skills/flowcharge/SKILL.md` returns `0` (returned `1`
  at `base_commit`).
- `grep -c 'once per authoring stage' skills/flowcharge/SKILL.md` returns `3` (returned `0` at
  `base_commit`: the pre-existing line at 562 names the bound as "once-per-authoring-stage", a
  hyphenated form this exact phrase does not match).

### 3. Point the dependency carve-out at the fixing task list, not the issue list (plan Stage 3 / gap 3)

- type: task
- author: Anthony Koukoullis

Two edits: one in `skills/flowcharge/CONVENTIONS.md`'s `depends_on` definition, carrying the
plan's added "No script can check" note per `DEVELOPMENT.md`'s rule for new CONVENTIONS.md
rules; one in `skills/flowcharge/SKILL.md`'s "Chaining" section, reinforcing the same point
where `depends_on` is already discussed for downstream artefacts.

```
SEARCH:
`depends_on` is data, not prose. Ordering constraints between workstreams or
artefacts go here, never only in a card's or file's body text.
REPLACE:
`depends_on` is data, not prose. Ordering constraints between workstreams or
artefacts go here, never only in a card's or file's body text.

Where the constraint is that defects must be fixed before this work starts, record the
fixing task list's ID, not the issue list's. A `tasklist` dependency requires `done`; an
issue-list dependency is met once authored, which is not the wait you mean. **No script can
check this**: whether a given `depends_on` entry expresses that constraint is a fact about the
author's intent, not the file's shape, so documented guidance is its only defence.
```

File: `skills/flowcharge/CONVENTIONS.md`

```
SEARCH:
- Downstream artefacts record their inputs as data: a task list authored from
  IL-3-k9d2s5 carries `depends_on: [IL-3-k9d2s5]`; one authored from PLN-2-m7v1q4
  carries `depends_on: [PLN-2-m7v1q4]`. The authoring templates instruct this;
  verify it landed.
REPLACE:
- Downstream artefacts record their inputs as data: a task list authored from
  IL-3-k9d2s5 carries `depends_on: [IL-3-k9d2s5]`; one authored from PLN-2-m7v1q4
  carries `depends_on: [PLN-2-m7v1q4]`. The authoring templates instruct this;
  verify it landed. A prerequisite-defect constraint records the fixing task list's ID, never
  the issue list's. Only a `tasklist` dependency waits for the fix to land.
```

File: `skills/flowcharge/SKILL.md`

verify:
- `grep -c 'fixing task list' skills/flowcharge/CONVENTIONS.md` returns `1` or more (returned
  `0` at `base_commit`).
- `grep -c 'fixing task list' skills/flowcharge/SKILL.md` returns `1` or more (returned `0` at
  `base_commit`).
- `grep -c 'No script can check this' skills/flowcharge/CONVENTIONS.md` returns `1` or more.

### 4. Stop hard rule 12 asking the plan to absorb an already-fixed defect (plan Stage 4 / gap 4)

- type: task
- author: Anthony Koukoullis

Insert one new sentence into hard rule 12 in `skills/flowcharge/SKILL.md`, between the
existing halt-on-unhandled-scenario sentence and the closing walkthrough-task caveat.

```
SEARCH:
    may override, per-run, exactly as rule 5's dependency check does. This
    check supplements, and never replaces, a walkthrough task a task list
    may still place against the finished file.
REPLACE:
    may override, per-run, exactly as rule 5's dependency check does. Where the record names a
    scenario as a prerequisite defect an earlier stage of this run already fixed, name that fix
    as the answer: the plan's design is not required to handle it, and must not absorb it. This
    check supplements, and never replaces, a walkthrough task a task list
    may still place against the finished file.
```

File: `skills/flowcharge/SKILL.md`

verify:
- `grep -c 'prerequisite defect' skills/flowcharge/SKILL.md` returns `1` or more (returned `0`
  at `base_commit`).

### 5. Fix hard rule 13's drift-check cadence to match its own per-stage scope (plan Stage 5 / accepted fifth fix)

- type: task
- author: Anthony Koukoullis

Rename the drift check's firing cadence from "once per run" to "once per execute-tasks stage"
in hard rule 13, `skills/flowcharge/SKILL.md`, so a run with two execute-tasks stages gets the
check before each one's first parent-task spawn, not only before the run's very first.

```
SEARCH:
    prompt. Run this check once per run, immediately before the first
    parent-task spawn; do not repeat it before later parent tasks in
    the same run. It is the orchestrator's own reading, under rule 8's
REPLACE:
    prompt. Run this check once per execute-tasks stage, immediately before that
    stage's first parent-task spawn; do not repeat it before later parent tasks in
    the same stage. It is the orchestrator's own reading, under rule 8's
```

File: `skills/flowcharge/SKILL.md`

verify:
- `grep -c 'once per execute-tasks stage' skills/flowcharge/SKILL.md` returns `1` (returned `0`
  at `base_commit`).

### 6. Whole-suite regression check

- type: task
- author: Anthony Koukoullis

Run the project's own test suite after all five wording edits land, to confirm no existing
case regresses. None of the five edits is covered by an existing case for this specific rule,
so the pass count is expected to stay unchanged rather than grow.

verify:
- `node skills/flowcharge/scripts/test/run-tests.mjs` reports `256/256 cases passed` (matches
  the `256/256` count measured at `base_commit`).
