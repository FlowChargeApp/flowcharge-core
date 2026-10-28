---
id: WS-34-6jq6rk
type: workstream
workstream: WS-34-6jq6rk
slug: read-back-two-item-list-wording
title: "The read-back rule words its two-item list defect unclearly"
status: done
tags: [prompts, correctness, quality, issue]
created: 2026-10-28
updated: 2026-10-28
author: Anthony Koukoullis
depends_on: []
links: []
---
The `fc-validate` read-back bullet says to report a list that "carries one on a two-item list", and the word "one" has no clear referent.

The Accuracy class in `skills/fc-validate/SKILL.md` tells the validator to report a sentence that "ends a list without its conjunction or carries one on a two-item list". Read alone, this can mean that a two-item list must not hold a conjunction, which would flag correct text such as "the index and the board". The intended defect is a comma before the conjunction of a two-item list, as in "the index, and the board".

Required change:
1. Reword that clause so it names the defect without ambiguity: a three-item or longer list that ends without its conjunction, and a two-item list that puts a comma before the conjunction. Correct text such as "the index and the board" is not a defect under the new wording.
2. The test case that pins the bullet in `skills/flowcharge/scripts/test/run-tests.mjs` carries the old clause. It is updated to pin the new clause.
3. Any other statement of the same clause agrees with it. The class count stays at four, and the report-only rule and the two stop conditions are unchanged.
4. The change is to unreleased wording, so `CHANGELOG.md` gets an entry only where its existing read-back entry restates the clause.

Acceptance: the clause cannot be read as forbidding a conjunction in a two-item list, and the test suite passes.

Out of scope: any other wording in the Accuracy class and any change to what the read-back checks.
