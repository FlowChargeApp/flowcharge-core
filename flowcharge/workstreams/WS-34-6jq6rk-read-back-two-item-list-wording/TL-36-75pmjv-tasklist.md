---
id: TL-36-75pmjv
type: tasklist
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "Reword the read-back list clause so it names its two list defects without ambiguity"
status: ready
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: [IL-10-iavmdl]
links: []
mode: diff
base_commit: 1ec26a3
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## The read-back list clause, reworded so a two-item list may carry its conjunction

Fixes the one defect IL-10-iavmdl files, ISS-35-wg7pon. The read-back bullet under `### Accuracy` in `skills/fc-validate/SKILL.md` tells the validator to report a sentence that "ends a list without its conjunction or carries one on a two-item list", and "one" has no clear referent, so the clause can be read as flagging correct text such as "the index and the board". Task 1.1 rewords the clause to name the two defects it means: a list of three or more items that ends without its conjunction, and a comma before the conjunction of a two-item list, as in "the index, and the board". Task 1.2 makes the same change to `READ_BACK_BULLET` in `skills/flowcharge/scripts/test/run-tests.mjs`, the constant through which the read-back case pins the whole bullet, inside the same parent task, so the suite passes at every parent-task boundary. Each block changes only the two lines that carry the clause, which become three; the rest of the bullet, the class count of four, the report-only sentence and the two stop conditions stay word for word. `CHANGELOG.md`'s read-back entry does not restate the clause, so it takes no entry, and no version changes.

Every SEARCH text was copied from the file at `base_commit`. Each `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there, and each one fails there. A `grep -c` that counts zero exits 1, so its pass is the printed `0`. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Reword the read-back list clause and its pin

  ```yaml
  description: "The read-back bullet names a list of three or more items that ends without its conjunction and a comma before the conjunction of a two-item list, and READ_BACK_BULLET pins the new wording. Fixes ISS-35-wg7pon."
  ```

  - [x] 1.1 Reword the list clause in the read-back bullet
    ```yaml
    description: "In skills/fc-validate/SKILL.md, the read-back bullet under ### Accuracy names the two list defects without ambiguity"
    issues: [ISS-35-wg7pon]
    pattern: "skills/fc-validate/SKILL.md"
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
          sentence that is ungrammatical, disagrees in number, ends a list without its
          conjunction or carries one on a two-item list, or repeats inside the same unit what
        =======
          sentence that is ungrammatical, disagrees in number, ends a list of
          three or more items without its conjunction, puts a comma before the
          conjunction of a two-item list, or repeats inside the same unit what
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'carries one on a two-item list' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
      - "tr -s ' \\n' ' ' < skills/fc-validate/SKILL.md | grep -cF 'In prose, report a sentence that is ungrammatical, disagrees in number, ends a list of three or more items without its conjunction, puts a comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,'  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); the old clause is gone"
        - result: YES
          measured: "source: verify 2 returned 1; the block applied cleanly, and lines 121 to 123 carry the reworded clause at 69, 70 and 70 columns"
    ```

  - [x] 1.2 Pin the reworded clause in READ_BACK_BULLET
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, READ_BACK_BULLET carries the reworded clause, one segment per new line of the bullet"
    issues: [ISS-35-wg7pon]
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          + 'sentence that is ungrammatical, disagrees in number, ends a list without its '
          + 'conjunction or carries one on a two-item list, or repeats inside the same unit what '
        =======
          + 'sentence that is ungrammatical, disagrees in number, ends a list of '
          + 'three or more items without its conjunction, puts a comma before the '
          + 'conjunction of a two-item list, or repeats inside the same unit what '
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'conjunction or carries one on a two-item list' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
      - "grep -cF -e \"+ 'sentence that is ungrammatical, disagrees in number, ends a list of '\" -e \"+ 'three or more items without its conjunction, puts a comma before the '\" -e \"+ 'conjunction of a two-item list, or repeats inside the same unit what '\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 3; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); the old segments are gone"
        - result: YES
          measured: "source: verify 2 returned 3; the block applied cleanly, and node --check of run-tests.mjs passes"
    ```

- [x] 2. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  implement:
    - "No edit: task 1.2 updates READ_BACK_BULLET, the pin of the one test case the reworded clause makes out of date, 'fc-validate carries the bounded read-back and reports its findings under Undetermined', inside the parent task whose change it pins, and ISS-35-wg7pon asks for no new test"
  verify: []
  self_eval:
    passed: true
  ```

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
