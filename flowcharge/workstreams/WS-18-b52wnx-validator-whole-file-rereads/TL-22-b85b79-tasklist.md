---
id: TL-22-b85b79
type: tasklist
workstream: WS-18-b52wnx
slug: validator-whole-file-rereads
title: "Scope fc-validate's Accuracy anchor checks to the cited line range"
status: done
created: 2026-09-20
updated: 2026-09-20
author: Anthony Koukoullis
depends_on: [PLN-18-6qf6n4]
links: []
mode: diff
base_commit: 89e5c69
---

# FlowCharge Tasks

## Scope fc-validate's Accuracy anchor checks to a line range plus a small margin

Implements `PLN-18-6qf6n4`: fc-validate's Accuracy class re-reads whole files to
check a cited `file:line`, though the check needs only the cited line range and a
small margin. `skills/fc-validate/SKILL.md` states no read scope for that check, and
both validation templates carry an unscoped "reading the file" sentence. Four edits,
one per plan stage, in plan order: the rule lands in `SKILL.md` and names the Accuracy
bullets it covers, both templates reference that rule instead of restating it, and
one prose pin in the test suite keeps the rule in place. Every SEARCH block is copied
from the working tree at `base_commit` (`89e5c69`), and every `verify` baseline was
measured there. Execute the tasks in order: task 4's pin asserts the text task 1
writes.

- [x] 1. State the anchor-check reading rule in `skills/fc-validate/SKILL.md`'s Accuracy class

  ```yaml
  description: "Add one paragraph after the Accuracy class's read-scope paragraph in skills/fc-validate/SKILL.md, stating that an anchor check reads the cited line range plus a small margin around it, never the whole file, and naming which Accuracy bullets the rule covers and which it leaves alone."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      skills/fc-validate/SKILL.md
      <<<<<<< SEARCH
      You follow only the references the artefact itself makes. You never survey the
      workstream or the repository for related artefacts, and an artefact the artefact under
      validation does not name is not your subject.
      =======
      You follow only the references the artefact itself makes. You never survey the
      workstream or the repository for related artefacts, and an artefact the artefact under
      validation does not name is not your subject.

      An anchor check reads the cited line range plus a small margin around it, never the
      whole file. The rule covers two of the bullets above: a cited `file:line`, and a
      command, flag or argument checked against the file it cites. It does not cover the
      last bullet: a claim about another artefact is proved by reading that artefact, as
      that bullet says. The path, count and `depends_on` bullets cite no line, so the rule
      does not apply to them.
      >>>>>>> REPLACE
  pattern: "skills/fc-validate/SKILL.md, section 2 (\"The four check classes\"), the paragraph directly under the Accuracy bullet list, lines 109-111 at base_commit 89e5c69; the new paragraph is inserted between that paragraph and the ### Form heading on line 113."
  imports: "None."
  compatibility: "Plan PLN-18-6qf6n4, Design item 1. The new paragraph must read exactly as the plan's quoted block. Its first sentence, \"An anchor check reads the cited line range plus a small margin around it, never the whole file.\", is the string task 4's test pin asserts after whitespace collapse, so its words must not change."
  gotcha: "The SEARCH is the whole existing paragraph (three lines), which is unique in the file; do not match only the final line. The new text is a separate paragraph with a blank line on each side, not a sentence appended to the existing one. The Accuracy class's last bullet already says \"Check it by reading that artefact.\"; the new paragraph must agree with it, not override it."
  verify:
    - "grep -c 'An anchor check reads the cited line range' skills/fc-validate/SKILL.md — expect 1 (returns 0 at base_commit 89e5c69)."
    - "grep -c 'reading that artefact' skills/fc-validate/SKILL.md — expect 2 (returns 1 at base_commit 89e5c69, the existing bullet)."
    - "git diff -U0 skills/fc-validate/SKILL.md — expect exactly one hunk, headed '@@ -112,0 +113,7 @@', a pure insertion of seven lines between the existing paragraph and the ### Form heading, and no other line in the file changes."
  checklist:
    - "The new paragraph reads exactly as Design item 1's quoted block."
    - "No bullet in the Accuracy list, and no other class (Coverage, Invented content, Form), changed."
    - "No file other than skills/fc-validate/SKILL.md was modified by this task."
    - "The new text names no model, vendor or harness product, and depends on no harness-specific tool or feature."
  self_eval:
    passed: true
    failures: []
  ```

- [x] 2. Reference the rule from `skills/flowcharge/templates/validate-plan-and-tasks.md`'s comparison-1 instruction

  ```yaml
  description: "Extend the comparison-1 accuracy-proof sentence in skills/flowcharge/templates/validate-plan-and-tasks.md so that \"reading the file the plan itself cites\" is bounded by a reference to the read scope the /fc-validate skill's Accuracy class sets, without restating that rule."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      skills/flowcharge/templates/validate-plan-and-tasks.md
      <<<<<<< SEARCH
      Run no command as part of comparison 1. Executing a `verify` step is comparison 2's business alone. Prove a comparison 1 accuracy finding by reading the file the plan itself cites.
      =======
      Run no command as part of comparison 1. Executing a `verify` step is comparison 2's business alone. Prove a comparison 1 accuracy finding by reading the file the plan itself cites, within the read scope the /fc-validate skill's Accuracy class sets for an anchor check.
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/templates/validate-plan-and-tasks.md, line 28 at base_commit 89e5c69, immediately after the comparison-1 four-class bullet list."
  imports: "None."
  compatibility: "Plan PLN-18-6qf6n4, Design item 2. The sentence references the skill's rule; it does not copy the rule's wording. The form \"the /fc-validate skill\" is the one the file already uses on lines 7, 17, 37 and 42. Comparison 2 needs no edit: it carries no equivalent sentence and runs under SKILL.md's Accuracy class directly."
  gotcha: "Line 28 is one long line; copy it whole rather than reconstructing it. The suite's Rule G checks that a path written in prose resolves on disk; \"/fc-validate\" is a skill reference the file already carries, not a new path. Comparison 2's own instructions (line 30 onward) must not change."
  verify:
    - "grep -c 'read scope the /fc-validate skill' skills/flowcharge/templates/validate-plan-and-tasks.md — expect 1 (returns 0 at base_commit 89e5c69)."
    - "grep -c 'the plan itself cites\\.$' skills/flowcharge/templates/validate-plan-and-tasks.md — expect 0 (returns 1 at base_commit 89e5c69, the sentence that ended unscoped)."
    - "git diff -U0 skills/flowcharge/templates/validate-plan-and-tasks.md — expect exactly one hunk, headed '@@ -28 +28 @@', and no other line in the file changes."
  checklist:
    - "Line 28 reads exactly as Design item 2's quoted block."
    - "Comparison 2's own instructions are byte-identical to base_commit."
    - "No file other than skills/flowcharge/templates/validate-plan-and-tasks.md was modified by this task."
    - "The new text names no model, vendor or harness product, and depends on no harness-specific tool or feature."
  self_eval:
    passed: true
    failures: []
  ```

- [x] 3. Reference the rule from `skills/flowcharge/templates/validate-issues-and-tasks.md`'s comparison-1 instruction

  ```yaml
  description: "Extend the parallel comparison-1 accuracy-proof sentence in skills/flowcharge/templates/validate-issues-and-tasks.md so that \"reading the file the issue list itself cites\" is bounded by the same reference task 2 adds to the plan template."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      skills/flowcharge/templates/validate-issues-and-tasks.md
      <<<<<<< SEARCH
      Run no command as part of comparison 1. Executing a `verify` step is comparison 2's business alone. Prove a comparison 1 accuracy finding by reading the file the issue list itself cites.
      =======
      Run no command as part of comparison 1. Executing a `verify` step is comparison 2's business alone. Prove a comparison 1 accuracy finding by reading the file the issue list itself cites, within the read scope the /fc-validate skill's Accuracy class sets for an anchor check.
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/templates/validate-issues-and-tasks.md, line 28 at base_commit 89e5c69, immediately after the comparison-1 four-class bullet list."
  imports: "None."
  compatibility: "Plan PLN-18-6qf6n4, Design item 3. The added clause, \", within the read scope the /fc-validate skill's Accuracy class sets for an anchor check.\", must match task 2's clause verbatim so the two templates reference the rule in one form. The file already names \"the /fc-validate skill\" on lines 7, 17, 37 and 42."
  gotcha: "Line 28 is one long line; copy it whole rather than reconstructing it. The only difference from task 2's SEARCH is \"issue list\" for \"plan\"; do not paste task 2's block here. Comparison 2's own instructions (line 30 onward) must not change."
  verify:
    - "grep -c 'read scope the /fc-validate skill' skills/flowcharge/templates/validate-issues-and-tasks.md — expect 1 (returns 0 at base_commit 89e5c69)."
    - "grep -c 'the issue list itself cites\\.$' skills/flowcharge/templates/validate-issues-and-tasks.md — expect 0 (returns 1 at base_commit 89e5c69, the sentence that ended unscoped)."
    - "git diff -U0 skills/flowcharge/templates/validate-issues-and-tasks.md — expect exactly one hunk, headed '@@ -28 +28 @@', and no other line in the file changes."
  checklist:
    - "Line 28 reads exactly as Design item 3's quoted block."
    - "Comparison 2's own instructions are byte-identical to base_commit."
    - "No file other than skills/flowcharge/templates/validate-issues-and-tasks.md was modified by this task."
    - "The new text names no model, vendor or harness product, and depends on no harness-specific tool or feature."
  self_eval:
    passed: true
    failures: []
  ```

- [x] 4. Pin the anchor-check reading rule in `skills/flowcharge/scripts/test/run-tests.mjs`

  ```yaml
  description: "Add one static prose-pin test case to skills/flowcharge/scripts/test/run-tests.mjs that slices the Accuracy class out of fc-validate/SKILL.md and asserts it still carries the anchor-check reading rule, in the same shape as the existing correction-direction pin."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      skills/flowcharge/scripts/test/run-tests.mjs
      <<<<<<< SEARCH
          + `${CORRECTION_DIRECTION_RULE}`,
        );
      });

      // ---- cases: LICENSE presence and agreement ---------------------------------
      =======
          + `${CORRECTION_DIRECTION_RULE}`,
        );
      });

      // ---- case: anchor-read-scope prose pin -------------------------------------
      // The Accuracy class tells the validator that an anchor check reads the cited
      // line range plus a small margin around it, never the whole file. The harness
      // runs no agent, so a static prose check is the strongest available pin for
      // that instruction. The slice cuts the Accuracy class alone, exactly as the
      // correction-direction pin above cuts its own section, so the case fails if
      // the rule moves out of that class; the empty-slice assertion fails if either
      // heading stops matching.

      const ANCHOR_READ_SCOPE_SECTION_OPEN = '### Accuracy';
      const ANCHOR_READ_SCOPE_SECTION_END = '### Form';
      const ANCHOR_READ_SCOPE_RULE =
        'An anchor check reads the cited line range plus a small margin around it, never the '
        + 'whole file.';

      testCase('fc-validate still scopes an anchor check to the cited line range', () => {
        const text = fs.readFileSync(path.join(SKILLS_ROOT, 'fc-validate', 'SKILL.md'), 'utf8');
        const from = text.indexOf(ANCHOR_READ_SCOPE_SECTION_OPEN);
        const to = text.indexOf(ANCHOR_READ_SCOPE_SECTION_END, from + 1);
        const slice = from === -1 || to === -1 ? '' : text.slice(from, to);
        assert.ok(
          slice.trim().length > 0,
          `the Accuracy class ("${ANCHOR_READ_SCOPE_SECTION_OPEN}") could not be sliced out of `
          + `fc-validate/SKILL.md: the case would otherwise pass on an empty slice`,
        );
        assert.ok(
          slice.replace(/\s+/g, ' ').includes(ANCHOR_READ_SCOPE_RULE),
          `fc-validate/SKILL.md no longer scopes an anchor check to the cited line range plus `
          + `a small margin, never the whole file:\n  ${ANCHOR_READ_SCOPE_RULE}`,
        );
      });

      // ---- cases: LICENSE presence and agreement ---------------------------------
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs, lines 5028-5032 at base_commit 89e5c69: the last three lines of the correction-direction case, the blank line after it, and the LICENSE cases' banner comment. The new case is inserted between the two."
  imports: "None new. The case uses fs, path, assert, SKILLS_ROOT and testCase, all already in scope in the file."
  compatibility: "Plan PLN-18-6qf6n4, Design item 4. The shape copies the correction-direction pin at lines 5009-5030: two heading constants, one rule constant, a section slice, an empty-slice assertion, then a whitespace-collapsed containment check. ANCHOR_READ_SCOPE_RULE must equal the first sentence task 1 writes, word for word, because the check collapses whitespace but not wording. '### Accuracy' and '### Form' each occur exactly once in fc-validate/SKILL.md at base_commit (lines 95 and 113)."
  gotcha: "The SEARCH's first line begins with four spaces then a plus sign; copy the indentation exactly. The correction-direction pin's own section-end string names a heading fc-validate/SKILL.md no longer has, so that case fails at base_commit; that failure is pre-existing, outside this task, and must not be fixed here. The suite reports 254/256 at base_commit for that reason and one stale Rule E allowlist pair; after tasks 1-4 it reports 255/257. This case passes only after task 1 has landed, so run it after task 1, never before."
  verify:
    - "grep -c 'still scopes an anchor check' skills/flowcharge/scripts/test/run-tests.mjs — expect 1 (returns 0 at base_commit 89e5c69)."
    - "grep -c 'ANCHOR_READ_SCOPE_RULE' skills/flowcharge/scripts/test/run-tests.mjs — expect 3 (returns 0 at base_commit 89e5c69)."
    - "git diff --numstat skills/flowcharge/scripts/test/run-tests.mjs — expect '32\t0': thirty-two lines inserted after line 5030 and none removed. (git diff -U0 may split this pure insertion into two hunks, because the inserted case ends with the same three lines as the case above it; that split is alignment, not a second change.)"
  checklist:
    - "The inserted block reads exactly as this task's REPLACE block between the correction-direction case and the LICENSE banner comment."
    - "Running node skills/flowcharge/scripts/test/run-tests.mjs by hand after tasks 1-4 prints 'ok   fc-validate still scopes an anchor check to the cited line range' and reports 255/257."
    - "The two failures the suite reports at base_commit are unchanged: no other case's text was edited."
    - "No file other than skills/flowcharge/scripts/test/run-tests.mjs was modified by this task."
    - "The new text names no model, vendor or harness product, and depends on no harness-specific tool or feature."
  self_eval:
    passed: true
    failures: []
  ```

## Divergences

1. **A second template carries the same unscoped sentence.** The plan's source, the
   workstream record, lists only `skills/fc-validate/SKILL.md` and
   `skills/flowcharge/templates/validate-plan-and-tasks.md`.
   `skills/flowcharge/templates/validate-issues-and-tasks.md` line 28 at `89e5c69`
   carries the same sentence with "issue list" for "plan". The plan brings it into
   scope as Design item 3, and task 3 covers it.
2. **A test suite covers both original targets.** The workstream record says nothing
   about tests. `skills/flowcharge/scripts/test/run-tests.mjs` at `89e5c69` pins
   prose in `fc-validate/SKILL.md` and both validation templates, and
   `.github/workflows/ci.yml` line 40 runs it. The plan brings it into scope as Design
   item 4, and task 4 adds the pin. The suite's two pre-existing failures at
   `base_commit` are outside this workstream; no task touches them.
