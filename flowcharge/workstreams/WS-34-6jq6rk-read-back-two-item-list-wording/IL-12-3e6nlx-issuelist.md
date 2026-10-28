---
id: IL-12-3e6nlx
type: issuelist
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "The read-back bullet misses a two-item list without its conjunction, joins two units with a comma only, and states its bound twice"
status: in-progress
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [ ] ISS-39-943mdj. The read-back list clause no longer names a two-item list that lost its conjunction

  ```yaml
  id: ISS-39-943mdj
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md tells the validator to report, in prose, a sentence that 'ends a list of three or more items without its conjunction'. A two-item list that lost its conjunction, as in 'update the index, the board', then matches neither list clause, because the other clause names only a needless comma before a conjunction. The word 'ungrammatical' may not catch it, since 'the index, the board' can parse as an apposition. The earlier wording, 'ends a list without its conjunction', covered a list of any length."
  steps_to_reproduce:
    - "Read the read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md, at the clause 'ends a list of three or more items without its conjunction'."
    - "Apply the bullet to a replacement text that holds 'update the index, the board'."
  expected: "The clause covers a list of any length that ends without its conjunction, so the two-item case is reported."
  actual: "The clause covers only a list of three or more items, so the two-item case matches neither list clause."
  affected: "skills/fc-validate/SKILL.md:121-122 (Part 2, ### Accuracy, the read-back bullet's prose sentence); skills/flowcharge/scripts/test/run-tests.mjs:5825-5826 (READ_BACK_BULLET); flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md:52 and :80 and TL-37-n97uvg-tasklist.md:102 (verify steps that quote the clause)"
  environment: ""
  tasks: [TL-38-2wkkol task 1]
  notes: "Fix direction: delete 'of three or more items' from the bullet and from READ_BACK_BULLET, and bring the three verify steps that quote the clause to the new wording. The records TL-36-75pmjv, TL-37-n97uvg and IL-10-iavmdl otherwise stay as they ran. The closed WS-33-cimamb records also quote the older wording and stay unchanged."
  ```

- [ ] ISS-40-oc6338. The read-back bullet names its two units with a comma and no conjunction

  ```yaml
  id: ISS-40-oc6338
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The read-back bullet says to read 'the smallest enclosing unit as a reader would: a paragraph or list item in prose, a statement, block or function in code'. The two groups of units are joined by a comma only, so the sentence holds a list of two items that ends without its conjunction, which the bullet's own clause reports."
  steps_to_reproduce:
    - "Read the read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md, at the words 'in prose, a statement, block or function in code'."
  expected: "The sentence joins its two groups of units with a conjunction."
  actual: "The sentence joins them with a comma only."
  affected: "skills/fc-validate/SKILL.md:119 (the read-back bullet); skills/flowcharge/scripts/test/run-tests.mjs:5823 (READ_BACK_BULLET)"
  environment: ""
  tasks: [TL-38-2wkkol task 2]
  notes: "Fix direction: change 'in prose, a statement' to 'in prose and a statement' in the bullet and in READ_BACK_BULLET."
  ```

- [ ] ISS-41-0ekw6f. The read-back bullet states its bound twice

  ```yaml
  id: ISS-41-0ekw6f
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The read-back bullet says 'The bound is that one unit only: not the section, not sibling files, and nothing the replacement does not touch.' and then 'A defect outside the unit, such as a contradiction with a paragraph the change never touches or a missed sibling file, is out of scope.' The second sentence repeats the first, which the bullet's own clause reports."
  steps_to_reproduce:
    - "Read the read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md, from 'The bound is that one unit only' to 'is out of scope'."
  expected: "The bullet states the bound once."
  actual: "The bullet states the bound in two consecutive sentences."
  affected: "skills/fc-validate/SKILL.md:127-130 (the read-back bullet); skills/flowcharge/scripts/test/run-tests.mjs:5831-5834 (READ_BACK_BULLET)"
  environment: ""
  tasks: [TL-38-2wkkol task 3]
  notes: "Fix direction: delete the second sentence from the bullet and from READ_BACK_BULLET, and keep the first sentence and the report-only sentence unchanged. The closed WS-33-cimamb records quote the second sentence and stay unchanged."
  ```
