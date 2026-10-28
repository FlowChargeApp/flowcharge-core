---
id: TL-37-n97uvg
type: tasklist
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "Name only a needless comma in the read-back clause, and correct two WS-34-6jq6rk records"
status: done
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: [IL-11-lcakxd]
links: []
mode: diff
base_commit: bd716d2
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## A read-back clause that names only a needless comma, and two corrected WS-34-6jq6rk records

Fixes the three defects IL-11-lcakxd files. ISS-36-1w8u46: the feature summary of TL-36-75pmjv says that the rest of the read-back bullet stays word for word, but commit bd716d2 removed the comma before "or" in the bullet's parenthetical. Task 1 deletes "the rest of the bullet," from that sentence. ISS-37-wy7wdx: the first body line of the WS-34-6jq6rk record says that the bullet says to report a list, where it says to report a sentence. Task 2 changes "a list" to "a sentence", and the line grows from 137 to 141 characters, inside the board's 200. ISS-38-ru0lmu: the bullet's clause "puts a comma before the conjunction of a two-item list" also flags a comma that the sentence needs. Task 3 changes "puts a comma" to "puts a needless comma" in `skills/fc-validate/SKILL.md` (3.1), in `READ_BACK_BULLET` in `skills/flowcharge/scripts/test/run-tests.mjs` (3.2) and in the quoted wording in the ISS-35-wg7pon notes in IL-10-iavmdl (3.3). Task 3.2 sits inside the same parent task as 3.1, so the suite passes at every parent-task boundary, and the read-back case checks the pin against the bullet. Each block changes one line. The class count of four, the report-only sentence and the two stop conditions stay word for word. `CHANGELOG.md`'s read-back entry does not restate the clause, so it takes no entry, and no version changes.

Every SEARCH text was copied from the file at `base_commit`. Each `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there, and each one fails there. A `grep -c` that counts zero exits 1, so its pass is the printed `0`. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Delete the false claim from TL-36-75pmjv's feature summary
  ```yaml
  description: "In TL-36-75pmjv's feature summary, the sentence about what stays word for word no longer names the rest of the bullet. Fixes ISS-36-1w8u46."
  issues: [ISS-36-1w8u46]
  pattern: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md"
  implement:
    - |
      flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md
      <<<<<<< SEARCH
      Fixes the one defect IL-10-iavmdl files, ISS-35-wg7pon. The read-back bullet under `### Accuracy` in `skills/fc-validate/SKILL.md` tells the validator to report a sentence that "ends a list without its conjunction or carries one on a two-item list", and "one" has no clear referent, so the clause can be read as flagging correct text such as "the index and the board". Task 1.1 rewords the clause to name the two defects it means: a list of three or more items that ends without its conjunction, and a comma before the conjunction of a two-item list, as in "the index, and the board". Task 1.2 makes the same change to `READ_BACK_BULLET` in `skills/flowcharge/scripts/test/run-tests.mjs`, the constant through which the read-back case pins the whole bullet, inside the same parent task, so the suite passes at every parent-task boundary. Each block changes only the two lines that carry the clause, which become three; the rest of the bullet, the class count of four, the report-only sentence and the two stop conditions stay word for word. `CHANGELOG.md`'s read-back entry does not restate the clause, so it takes no entry, and no version changes.
      =======
      Fixes the one defect IL-10-iavmdl files, ISS-35-wg7pon. The read-back bullet under `### Accuracy` in `skills/fc-validate/SKILL.md` tells the validator to report a sentence that "ends a list without its conjunction or carries one on a two-item list", and "one" has no clear referent, so the clause can be read as flagging correct text such as "the index and the board". Task 1.1 rewords the clause to name the two defects it means: a list of three or more items that ends without its conjunction, and a comma before the conjunction of a two-item list, as in "the index, and the board". Task 1.2 makes the same change to `READ_BACK_BULLET` in `skills/flowcharge/scripts/test/run-tests.mjs`, the constant through which the read-back case pins the whole bullet, inside the same parent task, so the suite passes at every parent-task boundary. Each block changes only the two lines that carry the clause, which become three; the class count of four, the report-only sentence and the two stop conditions stay word for word. `CHANGELOG.md`'s read-back entry does not restate the clause, so it takes no entry, and no version changes.
      >>>>>>> REPLACE
  verify:
    - "grep -cF 'the rest of the bullet,' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md  # expect 0; 1 at base_commit"
    - "grep -cF 'which become three; the class count of four, the report-only sentence and the two stop conditions stay word for word.' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md  # expect 1; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 0 (exit 1); the claim about the rest of the bullet is gone"
      - result: YES
        measured: "source: verify 2 returned 1; the block applied cleanly, and the REPLACE text is present exactly once"
  ```

- [x] 2. Quote the read-back bullet correctly on the WS-34-6jq6rk card line
  ```yaml
  description: "The first body line of the WS-34-6jq6rk record says that the bullet says to report a sentence, and it stays inside 200 characters. Fixes ISS-37-wy7wdx."
  issues: [ISS-37-wy7wdx]
  pattern: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/workstream.md"
  implement:
    - |
      flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/workstream.md
      <<<<<<< SEARCH
      The `fc-validate` read-back bullet says to report a list that "carries one on a two-item list", and the word "one" has no clear referent.
      =======
      The `fc-validate` read-back bullet says to report a sentence that "carries one on a two-item list", and the word "one" has no clear referent.
      >>>>>>> REPLACE
  verify:
    - "grep -cF 'says to report a list that' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/workstream.md  # expect 0; 1 at base_commit"
    - "grep -cF 'says to report a sentence that \"carries one on a two-item list\", and the word \"one\" has no clear referent.' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/workstream.md  # expect 1; 0 at base_commit"
    - "awk 'NR==15 {print length($0)}' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/workstream.md  # expect 141; 137 at base_commit"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 0 (exit 1); the misquote is gone"
      - result: YES
        measured: "source: verify 2 returned 1; the block applied cleanly"
      - result: YES
        measured: "source: verify 3 printed 141; the card line stays inside 200 characters"
  ```

- [x] 3. Name only a needless comma before the conjunction of a two-item list

  ```yaml
  description: "The read-back bullet, its READ_BACK_BULLET pin and the quoted wording in the ISS-35-wg7pon notes say 'puts a needless comma before the conjunction of a two-item list'. Fixes ISS-38-ru0lmu."
  ```

  - [x] 3.1 Add "needless" to the comma clause in the read-back bullet
    ```yaml
    description: "In skills/fc-validate/SKILL.md, the read-back bullet under ### Accuracy reports a sentence that puts a needless comma before the conjunction of a two-item list"
    issues: [ISS-38-ru0lmu]
    pattern: "skills/fc-validate/SKILL.md"
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
          three or more items without its conjunction, puts a comma before the
        =======
          three or more items without its conjunction, puts a needless comma before the
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'puts a comma before the' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
      - "tr -s ' \\n' ' ' < skills/fc-validate/SKILL.md | grep -cF 'In prose, report a sentence that is ungrammatical, disagrees in number, ends a list of three or more items without its conjunction, puts a needless comma before the conjunction of a two-item list, or repeats inside the same unit what the unit already states. In code,'  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); the clause without 'needless' is gone"
        - result: YES
          measured: "source: verify 2 returned 1; the block applied cleanly, and line 122 is 79 columns wide"
    ```

  - [x] 3.2 Pin the needless-comma clause in READ_BACK_BULLET
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, READ_BACK_BULLET carries 'puts a needless comma before the', the same words as the bullet"
    issues: [ISS-38-ru0lmu]
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          + 'three or more items without its conjunction, puts a comma before the '
        =======
          + 'three or more items without its conjunction, puts a needless comma before the '
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'puts a comma before the' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
      - "grep -cF 'without its conjunction, puts a needless comma before the ' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); the old segment is gone"
        - result: YES
          measured: "source: verify 2 returned 1; the block applied cleanly, node --check of run-tests.mjs passes, and READ_BACK_BULLET equals the whitespace-normalised bullet in skills/fc-validate/SKILL.md, 1363 characters each"
    ```

  - [x] 3.3 Quote the needless-comma clause in the ISS-35-wg7pon notes
    ```yaml
    description: "In IL-10-iavmdl, the ISS-35-wg7pon notes quote the bullet's clause as 'puts a needless comma before the conjunction of a two-item list', and the fix direction they record from the workstream record stays unchanged"
    issues: [ISS-38-ru0lmu]
    pattern: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/IL-10-iavmdl-issuelist.md"
    implement:
      - |
        flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/IL-10-iavmdl-issuelist.md
        <<<<<<< SEARCH
          notes: "Named in the workstream record. Fix direction, from the record: name a list of three or more items that ends without its conjunction and a two-item list that puts a comma before the conjunction, update the READ_BACK_BULLET pin to the new clause, and keep the class count at four, the report-only rule and the two stop conditions unchanged. A sweep of the repository finds the clause only in the two affected files and in WS-33-cimamb's closed record, plan and task list, which record that workstream as it ran and stay unchanged. CHANGELOG.md's read-back entry under ## Unreleased gives 'a list that lost its conjunction' as an example and does not restate the clause, so it takes no entry. Resolved by TL-36-75pmjv tasks 1.1 and 1.2: the bullet reports a sentence that 'ends a list of three or more items without its conjunction, puts a comma before the conjunction of a two-item list', and READ_BACK_BULLET pins that wording in the case 'fc-validate carries the bounded read-back and reports its findings under Undetermined'."
        =======
          notes: "Named in the workstream record. Fix direction, from the record: name a list of three or more items that ends without its conjunction and a two-item list that puts a comma before the conjunction, update the READ_BACK_BULLET pin to the new clause, and keep the class count at four, the report-only rule and the two stop conditions unchanged. A sweep of the repository finds the clause only in the two affected files and in WS-33-cimamb's closed record, plan and task list, which record that workstream as it ran and stay unchanged. CHANGELOG.md's read-back entry under ## Unreleased gives 'a list that lost its conjunction' as an example and does not restate the clause, so it takes no entry. Resolved by TL-36-75pmjv tasks 1.1 and 1.2: the bullet reports a sentence that 'ends a list of three or more items without its conjunction, puts a needless comma before the conjunction of a two-item list', and READ_BACK_BULLET pins that wording in the case 'fc-validate carries the bounded read-back and reports its findings under Undetermined'."
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"without its conjunction, puts a comma before the conjunction of a two-item list', and READ_BACK_BULLET pins\" flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/IL-10-iavmdl-issuelist.md  # expect 0; 1 at base_commit"
      - "grep -cF \"without its conjunction, puts a needless comma before the conjunction of a two-item list', and READ_BACK_BULLET pins\" flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/IL-10-iavmdl-issuelist.md  # expect 1; 0 at base_commit"
      - "grep -oF 'puts a comma before the conjunction' flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/IL-10-iavmdl-issuelist.md | wc -l  # expect 2; 3 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 0 (exit 1); the quote without 'needless' is gone"
        - result: YES
          measured: "source: verify 2 returned 1; the block applied cleanly, and the word diff adds 'needless' only"
        - result: YES
          measured: "source: verify 3 printed 2; the expected field and the fix direction recorded from the workstream record keep their wording"
    ```

- [x] 4. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  implement:
    - "No edit: task 3.2 updates READ_BACK_BULLET, the pin of the one test case the reworded clause makes out of date, 'fc-validate carries the bounded read-back and reports its findings under Undetermined', inside the parent task whose change it pins, and IL-11-lcakxd asks for no new test"
  verify: []
  self_eval:
    passed: true
  ```

- [x] 5. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: true
    test_run_result: passed
    test_run_baseline: []
    test_run_failures: []
    test_run_counts:
      - "node skills/flowcharge/scripts/test/run-tests.mjs: 325 passed, 0 failed"
  ```
