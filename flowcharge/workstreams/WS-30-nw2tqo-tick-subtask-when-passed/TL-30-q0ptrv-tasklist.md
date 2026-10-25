---
id: TL-30-q0ptrv
type: tasklist
workstream: WS-30-nw2tqo
slug: tick-subtask-when-passed
title: "Tick each subtask checkbox as soon as it passes"
status: ready
created: 2026-10-25
updated: 2026-10-25
author: Anthony Koukoullis
depends_on: [PLN-26-4hmfwm]
links: []
mode: spec
base_commit: 01a57d2
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Tick each subtask checkbox as soon as it passes

Implements PLN-26-4hmfwm. The executor stage file ticks each subtask in its own edit as soon as it passes, ticks the parent task after its last child, and defines a re-run over partly ticked children. The changelog records the change, and two test cases pin the stage-file wording and, at each tick, the task-line counts and the index figure.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Tick each subtask in the stage file

  ```yaml
  description: "The stage file ticks a subtask in its own edit as soon as it passes, ticks a parent with children after its last child, and defines a re-run over partly ticked children; no statement of the old write rule remains under skills/. Realises PLN-26-4hmfwm stage 1 (criteria 1 to 6)."
  ```

  - [x] 1.1 Replace the two write bullets with the per-subtask and parent rules
    ```yaml
    description: "The bullet that sets self_eval.passed and the bullet that writes the task list once per parent task become a per-subtask tick rule and a parent tick rule, and no statement of the old write rule remains under skills/"
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    implement:
      - "In skills/flowcharge/templates/execute-parent-task.md, Instructions, replace the two adjacent bullets that begin 'Set `self_eval.passed` true only when no checklist item is NO' and 'Write the task list file once per parent task' with the two bullets below, verbatim."
      - "Bullet 1: - Set `self_eval.passed` true only when no checklist item is NO, and tick a subtask `[x]` only then. Tick a parent task with children only when every one of its children is ticked. Leave anything aborted or still failing unchecked, and its parent with it. Children that already passed stay ticked."
      - "Bullet 2: - Write the task list file after each subtask passes, never once at the end of the parent task. As soon as a subtask passes, make one edit that ticks its checkbox, records its `self_eval` and bumps the `updated` date in its frontmatter to today (from `date +%F`), then start the next subtask. Once every subtask of a parent task with children is ticked, make one more edit that ticks the parent and bumps `updated`. A task with no children is its own subtask: one edit, after it passes. Write at any other point only to promote a mini subtask, or to record an abort or a failure that stays failed. Change no other frontmatter key: `status` is set by the run's upkeep, not by this stage."
    verify:
      - "grep -c 'Write the task list file once per parent task' skills/flowcharge/templates/execute-parent-task.md  # expect 0; 1 at base_commit"
      - "grep -cF 'Write the task list file after each subtask passes, never once at the end of the parent task' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'Tick a parent task with children only when every one of its children is ticked' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'Children that already passed stay ticked.' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'make one more edit that ticks the parent' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'A task with no children is its own subtask: one edit, after it passes.' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'The bullets below do not apply to it, except the `updated` bump.' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 1 at base_commit, so this step guards the kept test-run rule and cannot fail there"
      - "grep -rniE 'task list file once|tick every checkbox' skills --exclude=run-tests.mjs | wc -l  # expect 0, so no statement of the old write rule remains under skills/; 1 at base_commit. run-tests.mjs is excluded because task 3 adds the old phrase there as a negative assertion"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: grep -c of the old write bullet returned 0"
        - item: "verify 2"
          result: YES
          measured: "source: grep -cF of the new write bullet returned 1"
        - item: "verify 3"
          result: YES
          measured: "source: grep -cF of the parent tick rule returned 1"
        - item: "verify 4"
          result: YES
          measured: "source: grep -cF of the passed-children rule returned 1"
        - item: "verify 5"
          result: YES
          measured: "source: grep -cF of the parent edit phrase returned 1"
        - item: "verify 6"
          result: YES
          measured: "source: grep -cF of the no-children sentence returned 1"
        - item: "verify 7"
          result: YES
          measured: "source: grep -cF of the kept test-run sentence returned 1"
        - item: "verify 8"
          result: YES
          measured: "source: grep -rniE of the old phrases under skills, run-tests.mjs excluded, counted 0"
      unverified: []
      failures: []
  - [x] 1.2 Add the re-run bullet
    ```yaml
    description: "A bullet defines a re-run of a parent task whose children are partly ticked: skip ticked children, run the rest, tick the parent last"
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    implement:
      - "In skills/flowcharge/templates/execute-parent-task.md, directly after the bullet that begins 'Write the task list file after each subtask passes' (added by task 1.1) and before the '## Return' heading, add the bullet below, verbatim."
      - "Bullet: - **A re-run of a parent task with children reads the task list first.** A subtask already `[x]` passed in an earlier run: skip its steps, its checklist and its edit, report it as already applied, and keep its recorded `self_eval`. The rule above that an already-applied subtask still runs its steps does not apply to it. Run the unticked subtasks in file order. When every subtask is ticked and the parent is not, make the parent's tick edit only. When the parent is ticked, change nothing."
    verify:
      - "grep -cF 'A re-run of a parent task with children reads the task list first' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'report it as already applied' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF 'still runs its steps does not apply to it' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF \"make the parent's tick edit only\" skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: grep -cF of the re-run heading returned 1"
        - item: "verify 2"
          result: YES
          measured: "source: grep -cF of the already-applied phrase returned 1"
        - item: "verify 3"
          result: YES
          measured: "source: grep -cF of the line-29 exception returned 1"
        - item: "verify 4"
          result: YES
          measured: "source: grep -cF of the parent tick-only phrase returned 1"
      unverified: []
      failures: []

- [x] 2. Add the changelog entry
  ```yaml
  description: "CHANGELOG.md gains a ## Unreleased section with a Changed entry for the per-subtask tick. Realises PLN-26-4hmfwm stage 2 (criterion 7)."
  pattern: "CHANGELOG.md"
  implement:
    - "In CHANGELOG.md, directly before the heading '## 0.5.1 - 2026-10-13', add the section below, verbatim, followed by one blank line."
    - "Section: '## Unreleased', a blank line, '### Changed', a blank line, then the bullet in these four lines, wrapped as the file's other entries are: '- The executor ticks each subtask in the task list as soon as that subtask', '  passes, and ticks the parent task after its last subtask. A reader that', '  counts checkboxes now sees progress during a parent task. A re-run of a', '  parent task skips the subtasks already ticked.'"
  verify:
    - "grep -c '^## Unreleased' CHANGELOG.md  # expect 1; 0 at base_commit"
    - "grep -cF 'The executor ticks each subtask in the task list as soon as that subtask' CHANGELOG.md  # expect 1; 0 at base_commit"
    - "grep -n '^## ' CHANGELOG.md | head -2  # expect '## Unreleased' on the first line and '## 0.5.1 - 2026-10-13' on the second; the first line is '## 0.5.1 - 2026-10-13' at base_commit"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: grep -c of the Unreleased heading returned 1"
      - item: "verify 2"
        result: YES
        measured: "source: grep -cF of the entry's first line returned 1"
      - item: "verify 3"
        result: YES
        measured: "source: the first two headings are '## Unreleased' and '## 0.5.1 - 2026-10-13'"
    unverified: []
    failures: []

- [ ] 3. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Update: no existing case reads the stage file's write rule, and the new bullets add no slot, spawn word or path for the stage-file cases to flag, so no existing case changes."
    - "Add: in skills/flowcharge/scripts/test/run-tests.mjs, directly after the case 'fc-validate carries the discipline for validating an artefact its own session authored', the case 'the executor stage file ticks each subtask as it passes'. Read templates/execute-parent-task.md (STAGE_FILES_DIR) with whitespace collapsed to single spaces. Assert it includes each of: 'Write the task list file after each subtask passes, never once at the end of the parent task', 'Tick a parent task with children only when every one of its children is ticked', 'make one more edit that ticks the parent', 'A re-run of a parent task with children reads the task list first', 'report it as already applied'; assert it does not include 'Write the task list file once'."
    - "Add: directly after the case 'a list whose children are ticked but whose parent is not stays open', the case 'a parent with three children shows each tick as it lands, counted by task line and by step'. For each step s from 0 to 4, build tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, s === 4, 'Parent group'), then one child line per child i from 1 to 3, ticked when i <= s, written '  - [x] 1.i. Child' or '  - [ ] 1.i. Child' with a trailing newline] }), so steps 1 to 3 each tick one more child with the parent unticked and step 4 ticks the parent, and run it in withFixture(baseTree({ [TL1]: text }, { TL: 1 })). Read the file back with readRel(dir, TL1) and count its lines that match /^\\s*- \\[[ x]\\] \\d+\\./ and those that match /^\\s*- \\[x\\] \\d+\\./ : assert 4 task lines and s ticked lines at step s. Assert runGenerator(dir, ['--list', 'tasklists']) exits 0 and its stdout includes '| m/3 |', where m is the smaller of s and 3. Assert expectWarns(dir, []) at steps 0 to 3, so a list whose parent is unticked raises no warning, and at step 4 expectWarns(dir, [`TL-1-abcdef (${TL1}): all 4 tasks checked but status is \"ready\". Close it?`]). Every assertion message names the step and the count it found."
  verify:
    - "grep -cF \"testCase('the executor stage file ticks each subtask as it passes'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('a parent with three children shows each tick as it lands, counted by task line and by step'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
    evidence: []

- [ ] 4. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: false
    test_run_result: pending
    test_run_baseline: []
    test_run_failures: []
  ```

## Divergences

None.
