---
id: TL-4-05svg6
type: tasklist
workstream: WS-2-3rs9lo
slug: plan-review-trace-originating-scenario
title: "Trace a plan against its originating scenario before authoring tasks from it"
status: done
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: [PLN-3-fhpj8i]
links: []
mode: diff
base_commit: 2ac3ff7
---

# FlowCharge Tasks

## Trace a plan against its originating scenario before authoring tasks from it

Implements PLN-3-fhpj8i. `skills/flowcharge/SKILL.md` currently moves straight
from a returned plan to the tasks-from-plan stage once the plan reads as
internally consistent, with no check that its design actually handles the
concrete scenario that motivated it. This task list lands the plan's single
stage: a new hard rule 12 in `## Hard rules`, requiring the orchestrator
itself to state, in one line per case, how a plan's design handles each
scenario or failure case its workstream record names before tasks-from-plan
is spawned — halting instead, with a per-run override, when a named scenario
is not visibly handled — plus one echo bullet in the Operations table's
notes, at the `tasks-from-plan` row, pointing back to rule 12. Both edits
land in `skills/flowcharge/SKILL.md` only, in one pass, so the rule and its
echo never fall out of step with each other.

- [x] 1. Land hard rule 12 and its Operations-notes echo in `skills/flowcharge/SKILL.md`
  ```yaml
  description: "Insert the new hard rule 12 (Design D1) immediately after rule 11 in the Hard rules list, and the tasks-from-plan Operations-notes echo bullet (Design D2) between the existing ID slots and execute-tasks bullets, so both land together in one pass."
  ```

  - [x] 1.1 Append hard rule 12 after rule 11 in the Hard rules list
    ```yaml
    description: "Insert the new hard rule 12, exactly as PLN-3-fhpj8i Design D1 states it, immediately after rule 11's last sentence and before the '## Standing vs. one-off instructions' heading, with no renumbering of rules 1-11."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
            or cut again for the rest of the run.

        ## Standing vs. one-off instructions
        =======
            or cut again for the rest of the run.
        12. **A plan is checked against its motivating scenario before tasks are
            authored from it.** Before spawning the tasks-from-plan stage for any
            plan, read that plan and the workstream record it belongs to (its
            frontmatter `workstream:` key), then state, in one line per case, how
            the plan's design handles each concrete scenario or failure case the
            workstream record's body names as the reason the work is needed. This
            is a trace of the plan's actual proposed text against that scenario,
            not a restatement that the plan reads as internally consistent or that
            its acceptance criteria are individually satisfiable, and it runs
            whether the plan was authored earlier in this same run or in an earlier
            one. State the trace in that stage's report. It is the orchestrator's
            own reading, under rule 8's carve-out for reading artefact files when a
            briefing needs facts, never a subagent's. When the workstream record
            names no concrete scenario or failure case, say so in one line and
            proceed. When it names one the plan's stated design does not visibly
            handle, halt and report instead of spawning tasks-from-plan; the user
            may override, per-run, exactly as rule 5's dependency check does. This
            check supplements, and never replaces, a walkthrough task a task list
            may still place against the finished file.

        ## Standing vs. one-off instructions
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, ## Hard rules section, after rule 11"
    imports: "None."
    compatibility: "PLN-3-fhpj8i Design D1 — the exact rule 12 text, appended verbatim after rule 11. No existing hard rule is renumbered, moved, or reworded (AC6)."
    gotcha: "SEARCH must match rule 11's closing sentence through the blank line and the '## Standing vs. one-off instructions' heading exactly, or the block will not apply. Do not touch rule 11's own text. Rules 1-11 are contiguous list items with no blank line between them, so rule 12 follows rule 11's last line directly with no blank line before it; the one blank line before the heading stays."
    verify:
      - "grep -c '^[0-9]\\{1,2\\}\\. \\*\\*' skills/flowcharge/SKILL.md   # expect 12 (measured 11 at base_commit 2ac3ff7)"
      - "grep -n 'checked against its motivating scenario' skills/flowcharge/SKILL.md   # expect exactly one match, inside ## Hard rules (measured 0 matches at base_commit 2ac3ff7)"
      - "git diff 2ac3ff7 -- skills/flowcharge/SKILL.md | grep -c '^-[^-]'   # expect 0 (no existing line deleted or modified; only an insertion), confirming rules 1-11 are byte-identical (AC6)"
    checklist:
      - "Rule 12 sits immediately after rule 11 and before '## Standing vs. one-off instructions', with rules 1-11 unchanged (AC1, AC6)."
      - "Rule 12 states the halt-and-report behavior with a per-run override for a named scenario the plan's design does not visibly handle (AC2)."
      - "Rule 12 states that a workstream record naming no scenario is logged in one line and the run proceeds (AC3)."
      - "Rule 12 states the check is the orchestrator's own reading under rule 8's carve-out, never a subagent's, and that it supplements rather than replaces a walkthrough task (AC4)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Add the tasks-from-plan echo bullet to the Operations table's notes
    ```yaml
    description: "Insert the new tasks-from-plan bullet, exactly as PLN-3-fhpj8i Design D2 states it, after the existing ID slots bullet and before the existing execute-tasks bullet in the Operations table's Notes."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
          needed for each artefact's frontmatter `workstream:` key.
        - **execute-tasks**: first Read the task list yourself and enumerate its parent
        =======
          needed for each artefact's frontmatter `workstream:` key.
        - **tasks-from-plan**: before spawning this stage for any plan, apply hard rule 12
          — state in one line per case how the plan's design handles each scenario its
          workstream record names, and halt instead of spawning if one is not visibly
          handled.
        - **execute-tasks**: first Read the task list yourself and enumerate its parent
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, Operations table Notes, between the ID slots and execute-tasks bullets"
    imports: "None."
    compatibility: "PLN-3-fhpj8i Design D2 — one bullet, positioned at the same place in the Notes list as tasks-from-plan's position in the pipeline, between create-plan/ID-slots and execute-tasks."
    gotcha: "SEARCH must match the end of the ID slots bullet through the start of the execute-tasks bullet exactly, or the block will not apply. Do not touch either neighboring bullet's own text."
    verify:
      - "grep -n 'apply hard rule 12' skills/flowcharge/SKILL.md   # expect exactly one match, inside the Operations table's Notes (measured 0 matches at base_commit 2ac3ff7)"
      - "git status --short skills/   # expect exactly one line, ' M skills/flowcharge/SKILL.md' (measured empty at base_commit 2ac3ff7) — scoped form of AC7, see Divergence 1"
      - "node skills/flowcharge/scripts/fc-index.mjs --root /Users/akoukoullis/Work/AK/flowcharge-core-public --check   # expect exit 2 with the same 6 pre-existing WARN lines as the base_commit 2ac3ff7 baseline, since fc-index.mjs never reads SKILL.md; byte-identical except that the WS-4-bek93i line's 'claimed N days ago' figure counts calendar days from the claim and ticks up over time — scoped form of AC8, see Divergence 2"
      - "node skills/flowcharge/scripts/test/run-tests.mjs   # regression check; measured 252/252 passed at base_commit 2ac3ff7, must still report all passed"
    checklist:
      - "The new bullet sits after the ID slots bullet and before the execute-tasks bullet, matching the two operations' pipeline order (AC5)."
      - "The bullet names rule 12 as the point it applies, and states the halt condition in one line."
      - "git status --short skills/ shows exactly skills/flowcharge/SKILL.md as modified, nothing else under skills/."
      - "fc-index.mjs --check's WARN output is unchanged from the base_commit 2ac3ff7 baseline: no new warning introduced by this change."
    self_eval:
      passed: true
      failures: []
    ```

## Divergences

1. **AC7's git-status assertion, narrowed to `skills/`.** The plan's acceptance
   criterion 7 assumes `git status --short` shows exactly one changed file,
   `skills/flowcharge/SKILL.md`, after the work. At `base_commit` 2ac3ff7 the
   working tree already carries unrelated changes from this workstream's own
   earlier stages — `git status --short` shows ` M flowcharge/ids.md`, `??
   flowcharge/workstreams/WS-2-3rs9lo-plan-review-trace-originating-scenario/.lease`,
   and `?? flowcharge/workstreams/WS-2-3rs9lo-plan-review-trace-originating-scenario/PLN-3-fhpj8i-plan.md`
   — and authoring this task list itself adds another untracked file. A
   repo-wide "exactly one changed file" assertion cannot hold regardless of
   this stage's own work. Task 1.2's verify instead scopes the check to
   `git status --short skills/`, confirming `skills/flowcharge/SKILL.md` is
   the only changed file under `skills/` — the directory this stage's own
   edit actually touches.
2. **AC8's exit-code assertion, narrowed to "unchanged from baseline".** The
   plan's acceptance criterion 8 assumes
   `node skills/flowcharge/scripts/fc-index.mjs --root <project-root> --check`
   exits 0 with no new warning. At `base_commit` 2ac3ff7 that command already
   exits 2, printing six pre-existing WARN lines unrelated to `SKILL.md` (body
   length and tag-pool warnings on WS-1-qrec54, WS-2-3rs9lo, WS-3-t2lfk1 and
   WS-5-geob84, plus a stale WS-4-bek93i claim). Since `fc-index.mjs` never
   reads `SKILL.md` (Design's "Data and compatibility" section), task 1.2's
   verify instead checks that the command's output stays byte-identical to
   this baseline and still exits 2, which is the discriminating form of "no
   new warning" here. One line is time-dependent: the WS-4-bek93i warning
   reads "claimed N days ago" and N counts calendar days from the claim, so
   that figure may differ from the baseline's without being a new warning.
