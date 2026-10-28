---
id: TL-38-2wkkol
type: tasklist
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "Fix three wording defects in the read-back bullet and bring the verify steps that quote it to the new wording"
status: in-progress
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: [IL-12-3e6nlx]
links: []
mode: diff
base_commit: 2769708
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Three wording fixes in the read-back bullet

Fixes the three defects IL-12-3e6nlx files in the read-back bullet under `### Accuracy` in `skills/fc-validate/SKILL.md`. ISS-39-943mdj: the list clause names only a list of three or more items that ends without its conjunction, so a two-item list without one matches no list clause. Task 1 deletes "of three or more items" in the bullet (1.1) and in `READ_BACK_BULLET` in `skills/flowcharge/scripts/test/run-tests.mjs` (1.2), and brings the three verify steps that quote the old clause to the new wording: two in TL-36-75pmjv (1.3, 1.4) and one in TL-37-n97uvg (1.5). ISS-40-oc6338: the bullet joins "a paragraph or list item in prose" and "a statement, block or function in code" with a comma only. Task 2 changes "in prose, a statement" to "in prose and a statement" in the bullet (2.1) and in `READ_BACK_BULLET` (2.2). ISS-41-0ekw6f: the bullet states its bound twice. Task 3 deletes the sentence "A defect outside the unit, such as a contradiction with a paragraph the change never touches or a missed sibling file, is out of scope." from the bullet (3.1) and from `READ_BACK_BULLET` (3.2). The bullet and its pin sit inside the same parent task, so the suite passes at every parent-task boundary, and the read-back case checks the pin against the bullet. The class count of four, the report-only sentence and the two stop conditions stay word for word. The records of TL-36-75pmjv, TL-37-n97uvg and IL-10-iavmdl otherwise stay as they ran, and the closed WS-33-cimamb records, which quote the older wording, stay unchanged. `CHANGELOG.md`'s read-back entry does not restate any of the three passages, so it takes no entry, and no version changes.

Every SEARCH text was copied from the file at `base_commit`. Each `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there, and each one fails there. A `grep -c` that counts zero exits 1, so its pass is the printed `0`. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Name a list of any length that ends without its conjunction

  ```yaml
  description: "The read-back bullet, its READ_BACK_BULLET pin and the three verify steps that quote the clause say 'ends a list without its conjunction'. Fixes ISS-39-943mdj."
  ```

  - [x] 1.1 Delete "of three or more items" from the read-back bullet
    ```yaml
    description: "In skills/fc-validate/SKILL.md, the read-back bullet reports a sentence that ends a list without its conjunction"
    issues: [ISS-39-943mdj]
    pattern: "skills/fc-validate/SKILL.md"
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
          sentence that is ungrammatical, disagrees in number, ends a list of
          three or more items without its conjunction, puts a needless comma before the
        =======
          sentence that is ungrammatical, disagrees in number, ends a list
          without its conjunction, puts a needless comma before the
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'three or more items without its conjunction' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
      - "tr -s ' \\n' ' ' < skills/fc-validate/SKILL.md | grep -cF 'ends a list without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats'  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); expected 0, 1 at base_commit"
        - result: YES
          measured: "source: verify 2 returned 1 (exit 0); expected 1, 0 at base_commit"
    ```

  - [x] 1.2 Pin the clause without "of three or more items" in READ_BACK_BULLET
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, READ_BACK_BULLET carries 'ends a list without its conjunction', the same words as the bullet"
    issues: [ISS-39-943mdj]
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          + 'sentence that is ungrammatical, disagrees in number, ends a list of '
          + 'three or more items without its conjunction, puts a needless comma before the '
        =======
          + 'sentence that is ungrammatical, disagrees in number, ends a list '
          + 'without its conjunction, puts a needless comma before the '
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'three or more items without its conjunction' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
      - "grep -c \"^  + 'without its conjunction, puts a needless comma before the '\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); expected 0, 1 at base_commit"
        - result: YES
          measured: "source: verify 2 returned 1 (exit 0); expected 1, 0 at base_commit"
    ```

  - [x] 1.3 Bring TL-36-75pmjv's SKILL.md verify step to the new wording
    ```yaml
    description: "In TL-36-75pmjv, the SKILL.md verify step of task 1.1 quotes 'ends a list without its conjunction'"
    issues: [ISS-39-943mdj]
    pattern: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md"
    implement:
      - |
        flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md
        <<<<<<< SEARCH
        ends a list of three or more items without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,
        =======
        ends a list without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'ends a list of three or more items without its conjunction, puts a needless comma before the conjunction' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md  # expect 0; 1 at base_commit"
      - "grep -cF 'ends a list without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); expected 0, 1 at base_commit"
        - result: YES
          measured: "source: verify 2 returned 1 (exit 0); expected 1, 0 at base_commit"
    ```

  - [x] 1.4 Bring TL-36-75pmjv's run-tests.mjs verify step to the new wording
    ```yaml
    description: "In TL-36-75pmjv, the run-tests.mjs verify step of task 1.2 quotes the two segments without 'of three or more items'"
    issues: [ISS-39-943mdj]
    pattern: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md"
    implement:
      - |
        flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md
        <<<<<<< SEARCH
        \"+ 'sentence that is ungrammatical, disagrees in number, ends a list of '\" -e \"+ 'three or more items without its conjunction, puts a needless comma before the '\"
        =======
        \"+ 'sentence that is ungrammatical, disagrees in number, ends a list '\" -e \"+ 'without its conjunction, puts a needless comma before the '\"
        >>>>>>> REPLACE
    verify:
      - "grep -c 'three or more items without its conjunction, puts a needless comma before the' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md  # expect 0; 2 at base_commit"
      - "grep -c \"ends a list '.\" flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); expected 0, 2 at base_commit"
        - result: YES
          measured: "source: verify 2 returned 1 (exit 0); expected 1, 0 at base_commit"
    ```

  - [x] 1.5 Bring TL-37-n97uvg's SKILL.md verify step to the new wording
    ```yaml
    description: "In TL-37-n97uvg, the SKILL.md verify step of task 3.1 quotes 'ends a list without its conjunction'"
    issues: [ISS-39-943mdj]
    pattern: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-37-n97uvg-tasklist.md"
    implement:
      - |
        flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-37-n97uvg-tasklist.md
        <<<<<<< SEARCH
        ends a list of three or more items without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,
        =======
        ends a list without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'ends a list of three or more items without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-37-n97uvg-tasklist.md  # expect 0; 1 at base_commit"
      - "grep -cF 'ends a list without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-37-n97uvg-tasklist.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); expected 0, 1 at base_commit"
        - result: YES
          measured: "source: verify 2 returned 1 (exit 0); expected 1, 0 at base_commit"
    ```

- [ ] 2. Join the two groups of units with a conjunction

  ```yaml
  description: "The read-back bullet and its READ_BACK_BULLET pin say 'in prose and a statement'. Fixes ISS-40-oc6338."
  ```

  - [ ] 2.1 Add the conjunction in the read-back bullet
    ```yaml
    description: "In skills/fc-validate/SKILL.md, the read-back bullet reads 'a paragraph or list item in prose and a statement, block or function in code'"
    issues: [ISS-40-oc6338]
    pattern: "skills/fc-validate/SKILL.md"
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
          paragraph or list item in prose, a statement, block or function in code. Do not
        =======
          paragraph or list item in prose and a statement, block or function in code. Do not
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'list item in prose, a statement, block' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
      - "grep -cF 'list item in prose and a statement, block or function in code.' skills/fc-validate/SKILL.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.2 Pin the conjunction in READ_BACK_BULLET
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, READ_BACK_BULLET carries 'in prose and a statement', the same words as the bullet"
    issues: [ISS-40-oc6338]
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          + 'paragraph or list item in prose, a statement, block or function in code. Do not '
        =======
          + 'paragraph or list item in prose and a statement, block or function in code. Do not '
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'list item in prose, a statement, block' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
      - "grep -cF 'list item in prose and a statement, block or function in code. Do not ' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

- [ ] 3. State the bound once

  ```yaml
  description: "The read-back bullet and its READ_BACK_BULLET pin no longer repeat the bound in a second sentence. Fixes ISS-41-0ekw6f."
  ```

  - [ ] 3.1 Delete the repeated sentence from the read-back bullet
    ```yaml
    description: "In skills/fc-validate/SKILL.md, the read-back bullet states its bound in one sentence, followed by the report-only sentence"
    issues: [ISS-41-0ekw6f]
    pattern: "skills/fc-validate/SKILL.md"
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
          nothing the replacement does not touch. A defect outside the unit, such as a
          contradiction with a paragraph the change never touches or a missed sibling file, is
          out of scope. A read-back finding always reports and is never applied, because no file
          on disk proves what a file should hold after a change.
        =======
          nothing the replacement does not touch. A read-back finding always reports and is never
          applied, because no file on disk proves what a file should hold after a change.
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'A defect outside the unit' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
      - "tr -s ' \\n' ' ' < skills/fc-validate/SKILL.md | grep -cF 'nothing the replacement does not touch. A read-back finding always reports and is never applied, because no file on disk proves what a file should hold after a change.'  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 3.2 Delete the repeated sentence from READ_BACK_BULLET
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, READ_BACK_BULLET holds the same words as the bullet, without the repeated sentence"
    issues: [ISS-41-0ekw6f]
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          + 'nothing the replacement does not touch. A defect outside the unit, such as a '
          + 'contradiction with a paragraph the change never touches or a missed sibling file, is '
          + 'out of scope. A read-back finding always reports and is never applied, because no file '
          + 'on disk proves what a file should hold after a change.';
        =======
          + 'nothing the replacement does not touch. A read-back finding always reports and is never '
          + 'applied, because no file on disk proves what a file should hold after a change.';
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'A defect outside the unit' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
      - "grep -cF 'applied, because no file on disk proves what a file should hold after a change.' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

- [ ] 4. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  implement:
    - "No edit: tasks 1.2, 2.2 and 3.2 update READ_BACK_BULLET, the pin of the one test case the three fixes make out of date, 'fc-validate carries the bounded read-back and reports its findings under Undetermined', inside the parent task whose change it pins, and IL-12-3e6nlx asks for no new test"
  verify: []
  self_eval:
    passed: false
  ```

- [ ] 5. Test-run task: run the project's test suites
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
    test_run_baseline: pending
    test_run_failures: []
  ```
