---
id: TL-19-u7yezv
type: tasklist
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Bound hard rule 8's briefing carve-out to flowcharge/ and forbid source reads"
status: dropped
created: 2026-09-19
updated: 2026-09-19
author: Anthony Koukoullis
depends_on: [PLN-15-yk7nnu]
links: []
mode: diff
base_commit: 3aa9d05
---

# FlowCharge Tasks

## Bound hard rule 8's briefing carve-out to flowcharge/ and forbid source reads

Implements PLN-15-yk7nnu: two textual edits across three files under
`skills/flowcharge/`, closing the gap between hard rule 8's unbound "artefact
files" carve-out and the "Filling a template" step 4 procedure's existing
"files under `flowcharge/`" bound, and stating plainly, at the site the
orchestrator composes a plan-authoring briefing, that it never opens a
project source file to fill one. Task 1 realises Plan Stage 1 (`SKILL.md`);
task 2, with two children, realises Plan Stage 2 (both plan-and-tasks
templates' shared line-16 placeholder); task 3 verifies the plan's
acceptance criteria across all three files. Wording only: no orchestrator
behaviour, runtime logic, or script changes, per `DEVELOPMENT.md`'s "no
script can check this" pattern.

- [ ] 1. Bound hard rule 8's carve-out to `flowcharge/` and state the prohibition (PLN-15-yk7nnu Stage 1)
  ```yaml
  description: "SKILL.md hard rule 8: replace the unbound 'artefact files' carve-out with step 4's own 'files under `flowcharge/`' bound, and add the explicit never-open-a-project-source-file prohibition (AC1, AC2, AC3)"
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      skills/flowcharge/SKILL.md
      <<<<<<< SEARCH
      is recognized (see "Standing vs. one-off instructions"), and reading artefact
         files when a stage's return needs verifying or a briefing needs facts.
      =======
      is recognized (see "Standing vs. one-off instructions"), and reading files
         under `flowcharge/` when a stage's return needs verifying or a briefing
         needs facts, never a project source file — a file outside `flowcharge/` —
         to fill one.
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/SKILL.md"
  imports: "None. PLN-15-yk7nnu Design section, SKILL.md hard rule 8 block."
  compatibility: "Hard rule 8's other inline actions (branch cutting, ID allocation, index generation, agents.md writes, etc.) and every other hard rule are untouched. Step 4's own 'files under `flowcharge/`, never invent' sentence (line 459) is untouched."
  gotcha: "'reading artefact' also appears at lines 157 and 193 (hard rules 12 and 13), paraphrasing rule 8's carve-out without quoting it verbatim; per the plan's explicit exclusion of every hard rule but 8, those two lines are not touched by this SEARCH/REPLACE block and must not change."
  verify:
    - "grep -c 'reading artefact' skills/flowcharge/SKILL.md  # expect 2 (was 3 at base_commit: lines 96, 157, 193; this edit removes only line 96's)"
    - "grep -c 'project source' skills/flowcharge/SKILL.md  # expect 1 (was 0 at base_commit, AC3)"
    - "grep -c 'files under \\`flowcharge/\\`' skills/flowcharge/SKILL.md  # expect 2 (was 1 at base_commit: step 4 only; this edit adds rule 8's, AC1)"
  checklist:
    - "Hard rule 8's carve-out clause reads 'files under `flowcharge/`', the same bound phrase step 4 already carries"
    - "Hard rule 8 states, in its own words, that the orchestrator never opens a project source file to fill a briefing, with 'project source file' defined inline as a file outside `flowcharge/`"
    - "Lines 157 and 193 (hard rules 12 and 13) are unchanged"
    - "No other line in the file changed"
  self_eval:
    passed: false
    failures: []
  ```

- [ ] 2. State the same prohibition in the plan-and-tasks briefing placeholder, in both modes (PLN-15-yk7nnu Stage 2)

  ```yaml
  description: "Land the identical added sentence on plan-and-tasks-spec.md and plan-and-tasks-diff.md line 16 (AC4, AC5)"
  ```

  - [ ] 2.1 Add the prohibition sentence to plan-and-tasks-spec.md line 16
    ```yaml
    description: "plan-and-tasks-spec.md line 16: append the never-open-a-project-source-file sentence to the {{briefing}} placeholder (AC4, AC5)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-spec.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Draw its facts from the conversation, the chained artefacts, and files under `flowcharge/`; never open a project source file — a file outside `flowcharge/` — to fill this block.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md"
    imports: "None. PLN-15-yk7nnu Design section, plan-and-tasks-spec.md/plan-and-tasks-diff.md block."
    compatibility: "The rest of the paragraph (all three {stages} branches) and the Context section above it, including the {{context docs}} block, are untouched."
    gotcha: "The line is one long wrapped placeholder; the appended sentence must land after the tasks-only sentence and inside the closing }}, not after it."
    verify:
      - "grep -c 'project source' skills/flowcharge/templates/plan-and-tasks-spec.md  # expect 1 (was 0 at base_commit, AC5)"
    checklist:
      - "Line 16 ends with the new sentence inside the {{...}} block, before the closing }}"
      - "All three {stages} branches (plan-only, plan-and-tasks, tasks-only) read exactly as before, apart from the appended sentence"
      - "No other line in the file changed"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.2 Add the identical prohibition sentence to plan-and-tasks-diff.md line 16
    ```yaml
    description: "plan-and-tasks-diff.md line 16: same substitution as 2.1, identical line to plan-and-tasks-spec.md at base_commit (AC4, AC5)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-diff.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Draw its facts from the conversation, the chained artefacts, and files under `flowcharge/`; never open a project source file — a file outside `flowcharge/` — to fill this block.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md"
    imports: "None. PLN-15-yk7nnu Design section, plan-and-tasks-spec.md/plan-and-tasks-diff.md block."
    compatibility: "The rest of the paragraph (all three {stages} branches) and the Context section above it, including the {{context docs}} block, are untouched."
    gotcha: "This file is plan-and-tasks' diff-mode template; do not confuse it with 2.1's spec-mode template despite identical line content at base_commit."
    verify:
      - "grep -c 'project source' skills/flowcharge/templates/plan-and-tasks-diff.md  # expect 1 (was 0 at base_commit, AC5)"
    checklist:
      - "Line 16 ends with the new sentence inside the {{...}} block, before the closing }}"
      - "All three {stages} branches read exactly as before, apart from the appended sentence"
      - "No other line in the file changed"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 3. Verify the plan's acceptance criteria and the byte-identical templates (AC1-AC7)
  ```yaml
  description: "After tasks 1, 2.1 and 2.2 land, confirm PLN-15-yk7nnu's AC1-AC7 hold and the two templates' line 16 stay byte-identical"
  author: Anthony Koukoullis
  issues: []
  implement:
    - "No source edit. Run the verify commands below once tasks 1, 2.1 and 2.2 are all applied, and record their output in self_eval."
  pattern: "skills/flowcharge/ (read-only checks; no file targeted)"
  imports: "None. PLN-15-yk7nnu Acceptance criteria section."
  compatibility: "These checks are file-content assertions and the suite's own test runner; no other tooling is available (no package.json by design, per DEVELOPMENT.md)."
  gotcha: "AC4's byte-identical check must be re-run after both 2.1 and 2.2 land; checking either file alone cannot confirm the other still matches it. The no-stray-file check must use `git diff --name-only`, not `--stat`: `--stat`'s trailing summary line (e.g. '3 files changed...') names no file and would slip past a filename-based grep filter, producing a false-positive line even when only the three intended files changed."
  verify:
    - "diff <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-spec.md) <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-diff.md)  # expect no output (AC4). This asserts the two lines stay identical; it must hold both before and after, so it cannot be written to fail at base_commit (confirmed matching then too, via equal md5 sums) without wrongly implying the files should ever diverge."
    - "grep -c 'files under \\`flowcharge/\\`' skills/flowcharge/SKILL.md  # expect 2 (AC1; was 1 at base_commit)"
    - "grep -c 'reading artefact' skills/flowcharge/SKILL.md  # expect 2 (AC2; was 3 at base_commit)"
    - "grep -c 'project source' skills/flowcharge/SKILL.md skills/flowcharge/templates/plan-and-tasks-spec.md skills/flowcharge/templates/plan-and-tasks-diff.md  # expect 1 for each of the three files (AC3, AC5; was 0 for each at base_commit)"
    - "git diff --stat -- skills/flowcharge/SKILL.md skills/flowcharge/templates/plan-and-tasks-spec.md skills/flowcharge/templates/plan-and-tasks-diff.md  # confirm exactly these three files show a non-empty diff (empty at base_commit)"
    - "git diff --name-only -- skills/flowcharge/ | grep -v -E 'SKILL\\.md|plan-and-tasks-spec\\.md|plan-and-tasks-diff\\.md'  # expect no output (AC6). This asserts no stray file changed; it must read empty both before and after by design, so a non-empty result at either point signals a defect, not an expected transition."
    - "node skills/flowcharge/scripts/test/run-tests.mjs  # expect the same pass count as at base_commit (256/256 passed, measured at base_commit); a regression backstop only, since none of its docs-consistency rules govern this prose (AC7)"
  checklist:
    - "The two templates' line 16 are byte-identical after both edits land"
    - "AC1-AC3 and AC5 greps all return the expected post-change counts"
    - "git diff --stat lists exactly the three named files and no others under skills/flowcharge/"
    - "run-tests.mjs still reports every case passing, with no new failure"
  self_eval:
    passed: false
    failures: []
  ```
