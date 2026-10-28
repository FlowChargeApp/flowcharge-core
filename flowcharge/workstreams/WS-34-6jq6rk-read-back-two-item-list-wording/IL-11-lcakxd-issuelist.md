---
id: IL-11-lcakxd
type: issuelist
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "The read-back comma clause flags a comma the sentence needs, and two WS-34-6jq6rk records misstate the bullet"
status: ready
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [ ] ISS-36-1w8u46. TL-36-75pmjv's feature summary says the rest of the read-back bullet stays word for word, which is false

  ```yaml
  id: ISS-36-1w8u46
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The feature summary of TL-36-75pmjv states that 'the rest of the bullet, the class count of four, the report-only sentence and the two stop conditions stay word for word'. Commit bd716d2 removed the comma before 'or' in the read-back bullet's parenthetical, '(a REPLACE block in a task or a quoted after-text in a plan's Design)', in skills/fc-validate/SKILL.md and in READ_BACK_BULLET in skills/flowcharge/scripts/test/run-tests.mjs. The rest of the bullet therefore did not stay word for word, and the record states something false."
  steps_to_reproduce:
    - "Read the feature summary of TL-36-75pmjv at the sentence that opens 'Each block changes only the two lines that carry the clause'."
    - "Run git show bd716d2 -- skills/fc-validate/SKILL.md and see the read-back bullet's parenthetical lose its comma before 'or'."
  expected: "The summary makes no claim that the rest of the bullet is unchanged. It still states that the class count of four, the report-only sentence and the two stop conditions stay word for word."
  actual: "The summary states that the rest of the bullet stays word for word."
  affected: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/TL-36-75pmjv-tasklist.md:24 (the feature summary)"
  environment: ""
  tasks: [TL-37-n97uvg task 1]
  notes: "Fix direction, from the findings: delete 'the rest of the bullet,' from that sentence."
  ```

- [ ] ISS-37-wy7wdx. The WS-34-6jq6rk record's card line says the read-back bullet reports a list, where it reports a sentence

  ```yaml
  id: ISS-37-wy7wdx
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The first body line of the WS-34-6jq6rk workstream record, which the board shows as the card description, says that the fc-validate read-back bullet says to report a list that 'carries one on a two-item list'. The bullet said to report a sentence: 'In prose, report a sentence that is ungrammatical, disagrees in number, ends a list without its conjunction or carries one on a two-item list'. The record misquotes the bullet."
  steps_to_reproduce:
    - "Read line 15 of the WS-34-6jq6rk workstream record."
    - "Run git show 1ec26a3:skills/fc-validate/SKILL.md and read the read-back bullet's sentence that opens 'In prose, report a sentence that'."
  expected: "The card line says that the bullet says to report a sentence that 'carries one on a two-item list', and the line stays inside 200 characters."
  actual: "The card line says that the bullet says to report a list that 'carries one on a two-item list'."
  affected: "flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/workstream.md:15 (the first body line, which the board shows as the card description)"
  environment: ""
  tasks: [TL-37-n97uvg task 2]
  notes: "Fix direction, from the findings: change 'a list' to 'a sentence' on that line and keep the line under 200 characters."
  ```

- [ ] ISS-38-ru0lmu. The read-back comma clause flags a comma the sentence needs

  ```yaml
  id: ISS-38-ru0lmu
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md tells the validator to report, in prose, a sentence that 'puts a comma before the conjunction of a two-item list'. The clause names every such comma, so it also flags a comma that the sentence needs: one that closes an inserted phrase, as in 'the index, which the generator writes, and the board', or one that keeps a long first item from taking in the second. The sentence 'a list of three or more items that ends without its conjunction, and a two-item list that puts a comma before the conjunction' needs its comma, because without it the list can be read as one that ends without both its conjunction and a two-item list. A read-back finding is reported to the user, so each such finding becomes an open question with no defect behind it."
  steps_to_reproduce:
    - "Read the read-back bullet under ### Accuracy in skills/fc-validate/SKILL.md, at the clause 'puts a comma before the conjunction of a two-item list'."
    - "Apply the clause to a replacement text that holds 'the index, which the generator writes, and the board'."
  expected: "The clause names only a comma the sentence does not need, as in 'the index, and the board'. A comma that closes an inserted phrase or prevents a misreading is not a defect under it."
  actual: "The clause names every comma before the conjunction of a two-item list, including one the sentence needs."
  affected: "skills/fc-validate/SKILL.md:122 (Part 2, ### Accuracy, the read-back bullet's prose sentence); skills/flowcharge/scripts/test/run-tests.mjs:5826 (READ_BACK_BULLET, which pins the whole bullet); flowcharge/workstreams/WS-34-6jq6rk-read-back-two-item-list-wording/IL-10-iavmdl-issuelist.md:33 (the ISS-35-wg7pon notes, which quote the clause as resolved)"
  environment: ""
  tasks: [TL-37-n97uvg task 3.1, TL-37-n97uvg task 3.2, TL-37-n97uvg task 3.3]
  notes: "Fix direction, from the findings: change 'puts a comma' to 'puts a needless comma' in the bullet, in READ_BACK_BULLET and in the quoted wording in the ISS-35-wg7pon notes, and keep READ_BACK_BULLET byte-consistent with the bullet. CHANGELOG.md's read-back entry does not restate the clause, so it takes no entry."
  ```
