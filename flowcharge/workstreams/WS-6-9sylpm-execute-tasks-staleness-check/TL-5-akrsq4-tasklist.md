---
id: TL-5-akrsq4
type: tasklist
workstream: WS-6-9sylpm
slug: execute-tasks-staleness-check
title: "Staleness check before execute-tasks' first subagent spawn"
status: done
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: [PLN-4-32c19e]
links: []
mode: diff
base_commit: e544a88
---

# FlowCharge Tasks

## Staleness check before execute-tasks' first subagent spawn

Adds hard rule 13 to `skills/flowcharge/SKILL.md`, directly after rule 12 and
before the "## Standing vs. one-off instructions" heading. Before the
orchestrator spawns the first parent-task subagent of an execute-tasks run, it
reads the task list's `base_commit` (or, absent that, its `updated` date) and
compares it against current `HEAD` via `git log --oneline <base_commit>..HEAD`
or `git log --oneline --since=<updated>`, states what changed and roughly how
much, and recommends `fc-validate` or a fresh diff-mode re-scan when drift is
found. The finding is a surfaced recommendation, never a hard block: it runs
once per run, is the orchestrator's own reading (never a subagent's), and
proceeds exactly as today when nothing has landed. The change also echoes rule
13 in the `execute-tasks` Operations-table note, and adds a sixth clause
naming rule 13's result to the "Before execute-tasks" report bullet in
"Prompts" — the one place the finding actually reaches the user. All edits
land in `skills/flowcharge/SKILL.md` only; no other file changes.

- [x] 1. Define the check as hard rule 13, plus its Operations-table echo
  ```yaml
  description: "Add hard rule 13 to skills/flowcharge/SKILL.md, directly after rule 12, and echo it in the execute-tasks Operations-table note."
  ```

  - [x] 1.1 Insert hard rule 13 after rule 12, before "## Standing vs. one-off instructions"
    ```yaml
    description: "Add hard rule 13's full contract to skills/flowcharge/SKILL.md, numbered and placed directly after rule 12's closing sentence and before the 'Standing vs. one-off instructions' heading, matching rule 12's register and sentence shape."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        File: skills/flowcharge/SKILL.md

        <<<<<<< SEARCH
            check supplements, and never replaces, a walkthrough task a task list
            may still place against the finished file.

        ## Standing vs. one-off instructions
        =======
            check supplements, and never replaces, a walkthrough task a task list
            may still place against the finished file.
        13. **A task list is checked for drift against the branch before
            execute-tasks' first spawn.** Before spawning the first parent-task
            subagent of an execute-tasks run, for the task list that stage is
            about to execute — whether that list was authored earlier in this
            same run or an earlier one — read its frontmatter `base_commit` and
            `updated` keys, per `fc-task-list`'s schema, against the
            repository's current `HEAD`. When the frontmatter carries
            `base_commit`, run `git log --oneline <base_commit>..HEAD`: each
            returned line is one commit landed since the list was authored, the
            line count is roughly how much, and the subjects are what changed.
            When the frontmatter carries no `base_commit`, compare the
            `updated` date to today (`date +%F`) for the elapsed span, and run
            `git log --oneline --since=<updated>` on the current branch: the
            elapsed span and the commit count together are roughly how much,
            and the subjects are what changed. When the check finds no
            commit, state so in one line ("no commits have landed since
            <base_commit|updated>; proceeding") and proceed exactly as today.
            When one or more commits are found, state what changed and roughly
            how much, and recommend re-validating (`fc-validate`) or
            re-running the diff-mode scan that produced the list's own
            upstream plan or issue list, before proceeding. This is a stated
            recommendation, folded into the always-printed "Before
            execute-tasks" report content, never a halt and never a new
            prompt. Run this check once per run, immediately before the first
            parent-task spawn; do not repeat it before later parent tasks in
            the same run. It is the orchestrator's own reading, under rule 8's
            carve-out for reading artefact files when a briefing needs facts,
            never a subagent's.

        ## Standing vs. one-off instructions
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None. Pure prose edit to the orchestrator's hard-rules list."
    compatibility: "Matches PLN-4-32c19e's Design section and rule 12's own register and sentence shape (skills/flowcharge/SKILL.md:142-160), the plan's named precedent for an orchestrator-run, pre-stage check against a source artefact."
    gotcha: "The SEARCH text must match byte-for-byte, including the four-space continuation indent rule 12 uses and the blank line before the heading. Do not renumber or touch any other hard rule."
    verify:
      - "grep -c '^13\\. \\*\\*A task list is checked for drift' skills/flowcharge/SKILL.md"
      - "Expect 1 (baseline at base_commit e544a88 was 0, confirmed via grep -c '^13\\. \\*\\*' skills/flowcharge/SKILL.md returning 0)."
      - "grep -n '## Standing vs. one-off instructions' skills/flowcharge/SKILL.md — confirm the heading still immediately follows rule 13's closing sentence with exactly one blank line between them, and that rule 12 (skills/flowcharge/SKILL.md:142) is unchanged."
    checklist:
      - "Rule 13 is numbered 13 and sits directly after rule 12's closing sentence, before the 'Standing vs. one-off instructions' heading."
      - "Rule 13 states the base_commit branch's exact command: git log --oneline <base_commit>..HEAD."
      - "Rule 13 states the no-base_commit branch's exact command: git log --oneline --since=<updated>."
      - "Rule 13 states the zero-commits case proceeds exactly as today with a one-line statement, and the drift case recommends fc-validate or a fresh diff-mode re-scan without halting."
      - "Rule 13 states the check runs once per run, before the first parent-task spawn, and is the orchestrator's own reading, never a subagent's."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Echo rule 13 in the execute-tasks Operations-table note
    ```yaml
    description: "Append one sentence to the execute-tasks row's note in the Operations table, naming rule 13, stating it runs once before the first spawn, and stating it surfaces its finding rather than halting."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        File: skills/flowcharge/SKILL.md

        <<<<<<< SEARCH
        - **execute-tasks**: first Read the task list yourself and enumerate its parent
          tasks. Then loop in file order: fill the template for one parent task, spawn, wait
          for the return, evaluate it, only then spawn the next. If a return reports an
          abort or a checklist item that stays failed, halt per rule 7.
        =======
        - **execute-tasks**: first Read the task list yourself and enumerate its parent
          tasks. Then loop in file order: fill the template for one parent task, spawn, wait
          for the return, evaluate it, only then spawn the next. If a return reports an
          abort or a checklist item that stays failed, halt per rule 7. Before the first
          spawn, apply hard rule 13 once — compare the task list's `base_commit` or
          `updated` against current `HEAD` and state the finding in that stage's report
          rather than halting.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "Depends on task 1.1 landing first: this echo names 'hard rule 13', which must already exist in the file."
    compatibility: "Same one-line-echo shape the tasks-from-plan row already uses for rule 12 (skills/flowcharge/SKILL.md:322-325), per the plan's Design section."
    gotcha: "This is one sentence appended to the existing execute-tasks bullet, not a new bullet and not a rewrite of the existing sentences. Do not touch the tasks-from-plan or commit bullets above/below it."
    verify:
      - "grep -c 'apply hard rule 13 once' skills/flowcharge/SKILL.md"
      - "Expect 1 (baseline at base_commit e544a88 was 0, confirmed via grep -c 'hard rule 13' skills/flowcharge/SKILL.md returning 0)."
      - "grep -A5 -- '- \\*\\*execute-tasks\\*\\*:' skills/flowcharge/SKILL.md — confirm the new sentence sits inside this bullet and the abort/checklist-failure sentence before it is unchanged."
    checklist:
      - "The execute-tasks bullet names rule 13 by number."
      - "The added sentence states the check runs once, before the first spawn."
      - "The added sentence states the check states its finding rather than halting."
      - "No other Operations-table row or bullet is modified."
    self_eval:
      passed: true
      failures: []
    ```

- [x] 2. Wire the finding into the always-printed pre-execute-tasks report
  ```yaml
  description: "Add a sixth clause to the 'Before execute-tasks' report bullet in the Prompts section, naming rule 13's result, so the finding reaches the user whether the prompt is asked or posted as a statement."
  ```

  - [x] 2.1 Add the sixth clause to the "Before execute-tasks" bullet
    ```yaml
    description: "Append 'the staleness check's result (rule 13)' as a sixth item to the always-printed list in the 'Before execute-tasks' bullet under Prompts."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        File: skills/flowcharge/SKILL.md

        <<<<<<< SEARCH
        - **Before execute-tasks**: the task list path and ID, its parent-task count and
          one-line scope, the dependency check's result (rule 5), anything the authoring
          stage skipped or left open, and the resolved agent type.
        =======
        - **Before execute-tasks**: the task list path and ID, its parent-task count and
          one-line scope, the dependency check's result (rule 5), anything the authoring
          stage skipped or left open, the resolved agent type, and the
          staleness check's result (rule 13).
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "Depends on task 1.1 landing first: this clause names 'rule 13', which must already exist in the file."
    compatibility: "Sits under the existing 'Prompt satisfied: post it as a statement and continue' rule this bullet already follows (skills/flowcharge/SKILL.md:519-521), so the finding reaches the user under manual, assist and cruise alike, per the plan's Design section."
    gotcha: "This is the one place the finding actually reaches the user; do not also route it through rule 10's settling table (out of scope per the plan) or touch the 'Flagged tasks' or 'Before commit' bullets that follow it."
    verify:
      - "grep -c \"staleness check's result (rule 13)\" skills/flowcharge/SKILL.md"
      - "Expect 1 (baseline at base_commit e544a88 was 0, confirmed via grep -c 'rule 13' skills/flowcharge/SKILL.md returning 0)."
      - "grep -c 'rule 13' skills/flowcharge/SKILL.md — expect 2 (the execute-tasks echo from task 1.2 plus this clause), confirming both surfacing points landed and cross-reference a rule 13 that task 1.1 actually defined."
      - "Read skills/flowcharge/SKILL.md end to end from rule 12 through the 'Before execute-tasks' bullet to confirm rule 13, its echo, and this clause agree with each other and nothing above or below them shifted meaning, per the plan's Testing strategy."
    checklist:
      - "The 'Before execute-tasks' bullet lists six items, ending with the staleness check's result naming rule 13."
      - "The five pre-existing items (path/ID, scope, dependency check, skipped/open items, resolved agent type) are unchanged."
      - "The 'Flagged tasks' and 'Before commit' bullets that follow are untouched."
      - "No change was made to fc-validate, fc-task-list, the task-list frontmatter schema, or rule 10's settling table."
    self_eval:
      passed: true
      failures: []
    ```
