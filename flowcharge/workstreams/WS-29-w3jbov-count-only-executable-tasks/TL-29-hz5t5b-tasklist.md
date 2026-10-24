---
id: TL-29-hz5t5b
type: tasklist
workstream: WS-29-w3jbov
slug: count-only-executable-tasks
title: "Count only executable tasks in task-list progress"
status: ready
created: 2026-10-24
updated: 2026-10-24
author: Anthony Koukoullis
depends_on: [PLN-25-lqq122]
links: []
mode: spec
base_commit: 44cfaea
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Count only executable tasks in task-list progress

Implements PLN-25-lqq122. `parseTasks()` in `skills/flowcharge/scripts/fc-index.mjs` reports the step count (child tasks and top-level tasks with no children) and the unticked steps beside its existing `open` and `total`. One helper formats the figure, and the three progress displays call it: the `--list tasklists` row, the workstream table's artefact cell in the index, and the index Task lists table. The `open` and `total` counts, and every use of them in the close rule, stay as they are. The test-update task adds two cases to the suite.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Report and print the step count

  ```yaml
  description: "parseTasks() returns the step count and the unticked steps, and the three progress displays print them through one helper, leaving open and total, and the close rule that reads them, unchanged. Realises PLN-25-lqq122 stage 1 (criteria 1 to 5)."
  ```

  - [x] 1.1 Report the step count from parseTasks
    ```yaml
    description: "parseTasks() records whether each task line is ticked and, after the loop, returns steps and stepsOpen counted over the items that have no children"
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    implement:
      - "In skills/flowcharge/scripts/fc-index.mjs, function parseTasks(text), add `checked: !/\\[ \\]/.test(line.slice(0, 8))` to the object assigned to `current`, next to `hasChildren: false`; the existing `open` test on the same line is left alone."
      - "Replace the final statement `return { open, total, items };` with a statement that builds `const steps = items.filter((i) => !i.hasChildren);` and returns `{ open, total, steps: steps.length, stepsOpen: steps.filter((i) => !i.checked).length, items }`."
      - "In the comment above parseTasks, after the sentence 'Returns the open/total counts the index and --list render, plus one item per', keep the sentence and add: open and total count every task line and drive the rule that closes a list; steps and stepsOpen count only child tasks and top-level tasks with no children, the executable ones, and drive the progress figure."
    verify:
      - "grep -c 'return { open, total, steps: steps.length, stepsOpen' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -c 'return { open, total, items };' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
      - "grep -c 'checked: !' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -cF 'if (/\\[ \\]/.test(line.slice(0, 8))) open++;' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 1 at base_commit, so this step guards the kept open count and cannot fail there"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: grep -c of the steps return statement returned 1"
        - item: "verify 2"
          result: YES
          measured: "source: grep -c of the old return statement returned 0"
        - item: "verify 3"
          result: YES
          measured: "source: grep -c of checked: ! returned 1"
        - item: "verify 4"
          result: YES
          measured: "source: grep -cF of the kept open count returned 1"
      unverified: []
      failures: []
  - [x] 1.2 Print the step count in the three progress displays
    ```yaml
    description: "One progress helper formats ticked steps over steps, and the --list tasklists row, the workstream table artefact cell and the Task lists table call it instead of total minus open over total"
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    implement:
      - "In skills/flowcharge/scripts/fc-index.mjs, directly after the closing brace of function parseTasks, add `const progress = (t) => `${t.steps - t.stepsOpen}/${t.steps}`;` with a one-line comment: the progress figure counts executable tasks only."
      - "Replace the three expressions `${a.tasks.total - a.tasks.open}/${a.tasks.total}` with `${progress(a.tasks)}`: in the `.map((a) => ({ ...a, progress: ... }))` of the tasklists scope of --list (giving `progress: progress(a.tasks)`), in `extra` of wsArtefacts (giving `extra = ` ${progress(a.tasks)}``) and in the `listCell(...)` of the Task lists table row."
      - "Leave every use of `a.tasks.total` and `a.tasks.open` in the SYNC close, the --check warning and the SYNC message untouched."
    verify:
      - "grep -c 'progress(a.tasks)' skills/flowcharge/scripts/fc-index.mjs  # expect 3; 0 at base_commit"
      - "grep -c 'a.tasks.total - a.tasks.open' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 3 at base_commit"
      - "grep -c 'a.tasks.total > 0 && a.tasks.open === 0' skills/flowcharge/scripts/fc-index.mjs  # expect 2; 2 at base_commit, so this step guards the close rule and cannot fail there"
      - "grep -c 'all ${a.tasks.total} tasks checked' skills/flowcharge/scripts/fc-index.mjs  # expect 2; 2 at base_commit, so this step guards the close messages and cannot fail there"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: grep -c progress(a.tasks) returned 3"
        - item: "verify 2"
          result: YES
          measured: "source: grep -c a.tasks.total - a.tasks.open returned 0"
        - item: "verify 3"
          result: YES
          measured: "source: grep -c of the close rule returned 2"
        - item: "verify 4"
          result: YES
          measured: "source: grep -c of the close messages returned 2"
      unverified: []
      failures: []

- [ ] 2. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Update: no existing case reads the progress figure, so no existing case changes."
    - "Add: in skills/flowcharge/scripts/test/run-tests.mjs, directly after the case 'a second --sync run changes no file and prints no SYNC line', the case 'task-list progress counts executable tasks only, in --list, the index table and the workstream row'. Build withFixture(baseTree({ [WS1]: workstream(...), [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'ready', tasks: [...] }) }, { TL: 1 })) with these task lines in order: taskLine(1, true, 'Parent group'), then the two literal lines `  - [x] 1.1. Child one\\n` and `  - [ ] 1.2. Child two\\n`, then taskLine(2, false, 'Adult open') and taskLine(3, true, 'Adult done'). The list holds five task lines and four steps, two of them ticked. Assert that `runGenerator(dir, ['--list', 'tasklists'])` prints a row containing `| 2/4 |`, that indexSection(dir, 'Task lists') holds a row containing `| 2/4 |` and none containing `| 3/5 |`, and that indexSection(dir, 'Workstreams') holds a row containing `TL-1-abcdef (ready 2/4)`. Add a second list `TL-2-abcdef`, written to the path `flowcharge/workstreams/WS-1-abcdef-alpha/TL-2-abcdef-tasklist.md`, with `{ TL: 2 }` in the baseTree counters and the tasks taskLine(1, true) and taskLine(2, false), and assert that indexSection(dir, 'Task lists') holds a row containing `| 1/2 |`, the figure a list without parents showed before this change."
    - "Add: directly after that case, the case 'a list whose children are ticked but whose parent is not stays open'. Build the same fixture with `taskLine(1, false, 'Parent group')`, `  - [x] 1.1. Child one\\n` and `  - [x] 1.2. Child two\\n` as its only tasks, at status 'ready'. Assert that expectSync(dir, []) finds no SYNC line, and that expectWarns(dir, []) finds no warning, the `all <n> tasks checked but status is` warning included."
  verify:
    - "grep -cF \"testCase('task-list progress counts executable tasks only, in --list, the index table and the workstream row'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('a list whose children are ticked but whose parent is not stays open'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF '| 2/4 |' skills/flowcharge/scripts/test/run-tests.mjs  # expect at least 2; 0 at base_commit"
    - "grep -cF 'TL-1-abcdef (ready 2/4)' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF '| 1/2 |' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1, the flat list's unchanged figure; 0 at base_commit"
    - "grep -cF 'TL-2-abcdef-tasklist.md' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
    evidence: []

- [ ] 3. Test-run task: run the project's test suites
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
