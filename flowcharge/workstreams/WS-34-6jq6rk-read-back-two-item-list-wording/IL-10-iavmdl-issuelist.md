---
id: IL-10-iavmdl
type: issuelist
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "fc-validate's read-back list clause, which can be read as forbidding a conjunction in a two-item list"
status: done
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-35-wg7pon. The read-back bullet's list clause can be read as forbidding a conjunction in a two-item list

  ```yaml
  id: ISS-35-wg7pon
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md tells the validator to report, in prose, a sentence that 'ends a list without its conjunction or carries one on a two-item list'. The word 'one' has no clear referent. Read alone, the clause can mean that a two-item list must not hold a conjunction, which would flag correct text such as 'the index and the board'. The intended defect is a comma before the conjunction of a two-item list, as in 'the index, and the board'."
  steps_to_reproduce:
    - "Read the read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md, at the sentence that opens 'In prose, report a sentence that'."
    - "Apply its list clause, 'ends a list without its conjunction or carries one on a two-item list', to a replacement text that holds the correct two-item list 'the index and the board'."
  expected: "The clause names each list defect without ambiguity: a list of three or more items that ends without its conjunction, and a two-item list that puts a comma before the conjunction, as in 'the index, and the board'. Correct text such as 'the index and the board' is not a defect under it."
  actual: "'one' has no clear referent. Read as 'a conjunction', the clause flags 'the index and the board', and it never names the comma before the conjunction that is the intended defect."
  affected: "skills/fc-validate/SKILL.md:121-122 (Part 2, ### Accuracy, the list clause in the read-back bullet's prose sentence); skills/flowcharge/scripts/test/run-tests.mjs:5825-5826 (READ_BACK_BULLET, which pins the whole bullet)"
  environment: ""
  tasks: [TL-36-75pmjv task 1.1, TL-36-75pmjv task 1.2]
  notes: "Named in the workstream record. Fix direction, from the record: name a list of three or more items that ends without its conjunction and a two-item list that puts a comma before the conjunction, update the READ_BACK_BULLET pin to the new clause, and keep the class count at four, the report-only rule and the two stop conditions unchanged. A sweep of the repository finds the clause only in the two affected files and in WS-33-cimamb's closed record, plan and task list, which record that workstream as it ran and stay unchanged. CHANGELOG.md's read-back entry under ## Unreleased gives 'a list that lost its conjunction' as an example and does not restate the clause, so it takes no entry. Resolved by TL-36-75pmjv tasks 1.1 and 1.2: the bullet reports a sentence that 'ends a list of three or more items without its conjunction, puts a needless comma before the conjunction of a two-item list', and READ_BACK_BULLET pins that wording in the case 'fc-validate carries the bounded read-back and reports its findings under Undetermined'."
  ```
