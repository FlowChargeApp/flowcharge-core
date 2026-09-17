---
id: TL-12-ke31sf
type: tasklist
workstream: WS-16-1n524u
slug: briefing-block-self-contradiction
title: "Close the remaining briefing-block contradictions and grammar gap"
status: done
created: 2026-09-17
updated: 2026-09-17
author: Anthony Koukoullis
depends_on: [PLN-10-bymiu2]
links: []
mode: diff
base_commit: 73cb41c
---

# FlowCharge Tasks

## Close the remaining briefing-block contradictions and grammar gap

Implements PLN-10-bymiu2: six textual substitutions across six files under
`skills/flowcharge/`, closing four leftover wording/grammar issues a post-merge
review found in the briefing-placeholder prose (`plan-and-tasks-spec.md`,
`plan-and-tasks-diff.md`, `issues-and-tasks-spec.md`, `issues-and-tasks-diff.md`,
`execute-parent-task.md`, and `SKILL.md`'s "Filling a template" step 4). Every
edit is an independent, non-interacting substring substitution on its own line;
the plan authors one stage for all six, so this file authors one parent task
with one child per file plus a closing verification child for the plan's
global regression checks (AC9-AC12). Wording only: no orchestrator behaviour,
runtime logic, or script changes.

- [x] 1. Apply all six substitutions and verify (PLN-10-bymiu2 Stage 1)
  ```yaml
  description: "Land AC1-AC8 across the six named files, then verify AC9-AC12"
  ```

  - [x] 1.1 Fix plan-and-tasks-spec.md line 16: drop "target files" clause, add missing "and"
    ```yaml
    description: "plan-and-tasks-spec.md line 16: delete the redundant tasks-only target-file clause (AC1) and restore the missing and in the plan-only sentence (AC6)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-spec.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken, the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: what the plan at `{plan}` changes, the target files and how they relate, the decisions already taken, and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken, and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: what the plan at `{plan}` changes, the decisions already taken, and the constraints in play.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md"
    imports: "None. PLN-10-bymiu2 Design section, plan-and-tasks-spec.md/plan-and-tasks-diff.md block."
    compatibility: "Line stays one wrapped placeholder line; the untouched plan-and-tasks sentence between the two edited sentences must survive verbatim."
    gotcha: "The line carries two separate edits (AC1 delete, AC6 insert) in one SEARCH/REPLACE block; do not split them across two blocks since they share one physical line. Do not touch the plan-and-tasks sentence in the middle."
    verify:
      - "grep -o 'the target files and how they relate' skills/flowcharge/templates/plan-and-tasks-spec.md | wc -l  # expect 0 (was 1 at base_commit)"
      - "grep -o 'and the constraints in play' skills/flowcharge/templates/plan-and-tasks-spec.md | wc -l  # expect 2 (was 1 at base_commit)"
    checklist:
      - "The tasks-only sentence no longer contains 'the target files and how they relate'"
      - "The plan-only sentence ends '...the decisions already taken, and the constraints in play.'"
      - "The plan-and-tasks sentence in between is unchanged"
      - "No other line in the file changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Fix plan-and-tasks-diff.md line 16: drop "target files" clause, add missing "and"
    ```yaml
    description: "plan-and-tasks-diff.md line 16: same substitution as 1.1 (AC2, AC7), identical line to plan-and-tasks-spec.md at base_commit"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-diff.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken, the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: what the plan at `{plan}` changes, the target files and how they relate, the decisions already taken, and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken, and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: what the plan at `{plan}` changes, the decisions already taken, and the constraints in play.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md"
    imports: "None. PLN-10-bymiu2 Design section, plan-and-tasks-spec.md/plan-and-tasks-diff.md block."
    compatibility: "Line stays one wrapped placeholder line; the untouched plan-and-tasks sentence between the two edited sentences must survive verbatim."
    gotcha: "Same two-edits-one-line caveat as 1.1. This file is diff mode's own template; do not confuse it with 1.1's spec-mode template despite identical line content."
    verify:
      - "grep -o 'the target files and how they relate' skills/flowcharge/templates/plan-and-tasks-diff.md | wc -l  # expect 0 (was 1 at base_commit)"
      - "grep -o 'and the constraints in play' skills/flowcharge/templates/plan-and-tasks-diff.md | wc -l  # expect 2 (was 1 at base_commit)"
    checklist:
      - "The tasks-only sentence no longer contains 'the target files and how they relate'"
      - "The plan-only sentence ends '...the decisions already taken, and the constraints in play.'"
      - "The plan-and-tasks sentence in between is unchanged"
      - "No other line in the file changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 Fix issues-and-tasks-spec.md line 15: drop both "target files" clauses
    ```yaml
    description: "issues-and-tasks-spec.md line 15: delete the redundant target-file clause from both the issues-and-tasks and tasks-only sentences (AC3)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks-spec.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `issues-only`: every finding to be filed, each with its location, failure scenario, severity and confidence. When `{stages}` is `issues-and-tasks`: the same, plus anything the task-authoring half needs that the issues themselves will not carry, namely the target files and how they relate, the decisions already taken, and the constraints in play. When `{stages}` is `tasks-only`: what the issues at `{issuelist}` cover, the target files and how they relate, the decisions already taken, and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `issues-only`: every finding to be filed, each with its location, failure scenario, severity and confidence. When `{stages}` is `issues-and-tasks`: the same, plus anything the task-authoring half needs that the issues themselves will not carry, namely the decisions already taken, and the constraints in play. When `{stages}` is `tasks-only`: what the issues at `{issuelist}` cover, the decisions already taken, and the constraints in play.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/issues-and-tasks-spec.md"
    imports: "None. PLN-10-bymiu2 Design section, issues-and-tasks-spec.md/issues-and-tasks-diff.md block."
    compatibility: "The issues-only sentence earlier in the same paragraph is untouched."
    gotcha: "The phrase 'the target files and how they relate' occurs twice on this one physical line (once per sentence); both must be removed by this single block, and grep -c would undercount them as one matching line."
    verify:
      - "grep -o 'the target files and how they relate' skills/flowcharge/templates/issues-and-tasks-spec.md | wc -l  # expect 0 (was 2 at base_commit)"
    checklist:
      - "Neither the issues-and-tasks nor the tasks-only sentence contains 'the target files and how they relate'"
      - "The issues-only sentence is unchanged"
      - "No other line in the file changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.4 Fix issues-and-tasks-diff.md line 15: drop both "target files" clauses
    ```yaml
    description: "issues-and-tasks-diff.md line 15: same substitution as 1.3 (AC4), identical line to issues-and-tasks-spec.md at base_commit"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks-diff.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `issues-only`: every finding to be filed, each with its location, failure scenario, severity and confidence. When `{stages}` is `issues-and-tasks`: the same, plus anything the task-authoring half needs that the issues themselves will not carry, namely the target files and how they relate, the decisions already taken, and the constraints in play. When `{stages}` is `tasks-only`: what the issues at `{issuelist}` cover, the target files and how they relate, the decisions already taken, and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `issues-only`: every finding to be filed, each with its location, failure scenario, severity and confidence. When `{stages}` is `issues-and-tasks`: the same, plus anything the task-authoring half needs that the issues themselves will not carry, namely the decisions already taken, and the constraints in play. When `{stages}` is `tasks-only`: what the issues at `{issuelist}` cover, the decisions already taken, and the constraints in play.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/issues-and-tasks-diff.md"
    imports: "None. PLN-10-bymiu2 Design section, issues-and-tasks-spec.md/issues-and-tasks-diff.md block."
    compatibility: "The issues-only sentence earlier in the same paragraph is untouched."
    gotcha: "Same two-occurrences-one-line caveat as 1.3. This file is issues-and-tasks' diff-mode template; do not confuse it with 1.3's spec-mode template despite identical line content."
    verify:
      - "grep -o 'the target files and how they relate' skills/flowcharge/templates/issues-and-tasks-diff.md | wc -l  # expect 0 (was 2 at base_commit)"
    checklist:
      - "Neither the issues-and-tasks nor the tasks-only sentence contains 'the target files and how they relate'"
      - "The issues-only sentence is unchanged"
      - "No other line in the file changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.5 Fix execute-parent-task.md line 19: collapse three-item list to one, fix plural agreement
    ```yaml
    description: "execute-parent-task.md line 19: delete 'what they change, the files involved, and', replace with 'any', and correct 'those points' to singular 'that point' (AC5)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/execute-parent-task.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself about this parent task and its subtasks: what they change, the files involved, and any constraint in play, complete on those points, no padding}}
        =======
        {{everything the subagent needs and cannot discover for itself about this parent task and its subtasks: any constraint in play, complete on that point, no padding}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    imports: "None. PLN-10-bymiu2 Design section, execute-parent-task.md block."
    compatibility: "The rest of the Context section (the {{context docs}} block above it, the ```md fence) is untouched."
    gotcha: "Two coupled corrections on one line: dropping two of the three list items and re-singularising 'points' to 'point' to agree with the one remaining item ('any constraint in play'). Do not leave 'points' plural after the list is collapsed to one item."
    verify:
      - "grep -c 'what they change, the files involved' skills/flowcharge/templates/execute-parent-task.md  # expect 0 (was 1 at base_commit)"
      - "grep -c 'complete on that point, no padding' skills/flowcharge/templates/execute-parent-task.md  # expect 1"
    checklist:
      - "The placeholder names only 'any constraint in play' as the remaining item"
      - "The placeholder reads 'complete on that point' (singular), not 'those points'"
      - "No other line in the file changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.6 Fix SKILL.md step 4: narrow "and the repo" to "files under flowcharge/"
    ```yaml
    description: "SKILL.md 'Filling a template' step 4 (lines 452-454): replace 'and the repo' with 'and files under `flowcharge/`' (AC8)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
           the points the placeholder text names. Draw facts from the conversation, the
           chained artefacts (read them if needed), and the repo, never invent.
        =======
        4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
           the points the placeholder text names. Draw facts from the conversation, the
           chained artefacts (read them if needed), and files under `flowcharge/`, never invent.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None. PLN-10-bymiu2 Design section, SKILL.md 'Filling a template' step 4 block."
    compatibility: "Steps 1-3 and 5-6 of the 'Filling a template' procedure, and the sentence structure around 'never invent', are untouched."
    gotcha: "'the repo' appears at two other unrelated lines in this file (a repo's default branch note, and a report-deletion note); the SEARCH block's surrounding step-4 text keeps this edit scoped to the one occurrence this plan names."
    verify:
      - "grep -c 'and the repo,' skills/flowcharge/SKILL.md  # expect 0 (was 1 at base_commit, line 454)"
      - "grep -c 'and files under \\`flowcharge/\\`, never invent' skills/flowcharge/SKILL.md  # expect 1"
    checklist:
      - "Step 4 reads '...and files under `flowcharge/`, never invent.' with no other wording change"
      - "No other occurrence of 'the repo' in the file was touched"
      - "No other line in the file changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.7 Verify the global regression checks (AC9-AC12)
    ```yaml
    description: "After 1.1-1.6 land, confirm the plan's four regression greps return zero and the suite's own test runner still passes"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "No source edit. Run the verify commands below once tasks 1.1-1.6 are all applied, and record their output in self_eval."
    pattern: "skills/flowcharge/ (read-only checks; no file targeted)"
    imports: "None. PLN-10-bymiu2 Global regression checks (AC9-AC12)."
    compatibility: "These checks are file-content assertions and the suite's own test runner; no other tooling is available (no package.json by design, per DEVELOPMENT.md)."
    gotcha: "AC9-AC11 must be re-measured, not assumed: the individual per-file greps in 1.1-1.4 already confirm the phrase-level counts, but this task re-runs the plan's own repo-wide grep form to match its exact wording and scope."
    verify:
      - "grep -rn 'the target files and how they relate' skills/flowcharge/ | wc -l  # expect 0 (was 4 matching lines at base_commit, AC9)"
      - "grep -rn 'what they change, the files involved' skills/flowcharge/ | wc -l  # expect 0 (was 1 at base_commit, AC10)"
      - "grep -n 'and the repo,' skills/flowcharge/SKILL.md | wc -l  # expect 0 (was 1 at base_commit, AC11)"
      - "git diff --stat -- skills/flowcharge/templates/plan-and-tasks-spec.md skills/flowcharge/templates/plan-and-tasks-diff.md skills/flowcharge/templates/issues-and-tasks-spec.md skills/flowcharge/templates/issues-and-tasks-diff.md skills/flowcharge/templates/execute-parent-task.md skills/flowcharge/SKILL.md  # confirm only these six files changed, and no other file in the repo (AC12's file-scope half)"
      - "node skills/flowcharge/scripts/test/run-tests.mjs  # expect the same pass count as at base_commit (264/264 passed, measured at base_commit); a regression backstop only, since none of its eight docs-consistency rules govern this prose (AC12's regression half)"
    checklist:
      - "All four AC9-AC11 greps return zero"
      - "git diff --stat lists exactly the six named files and no others"
      - "run-tests.mjs still reports every case passing, with no new failure"
    self_eval:
      passed: true
      failures: []
    ```
