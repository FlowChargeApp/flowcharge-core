---
id: TL-14-7bj7pq
type: tasklist
workstream: WS-22-lq25m7
slug: validate-accuracy-class-not-exercised
title: "Make fc-validate's Accuracy class exercised, not just defined"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: [PLN-11-s3bs39]
links: []
mode: diff
base_commit: 1ad4c4a
---

# FlowCharge Tasks

## Make fc-validate's Accuracy class exercised, not just defined

Seven literal wording substitutions across `skills/fc-validate/SKILL.md`,
`skills/flowcharge/templates/validate-issues-and-tasks.md`, and
`skills/flowcharge/templates/validate-plan-and-tasks.md`, per PLN-11-s3bs39. The edits
close the gap where the Accuracy class defines command/flag/argument checking but the
skill's own description and the two templates that restate the Accuracy bullet list
(load-bearing because the validator reads the template first) do not carry that scope
through. All seven edits are read as they stand at `base_commit` (1ad4c4a), confirmed
live and matching the plan with no drift. Stage 1 lands all seven substitutions; stage
2 confirms the test backstop still passes at 264/264. No pipeline stage, file, or
capability is added; `SKILL.md:102-104`'s bounded-survey guard is untouched.

- [x] 1. Apply all seven wording edits, across the three named files, in one change (plan Stage 1: AC1-AC7)
  ```yaml
  description: "Category heading for the seven literal substitutions across skills/fc-validate/SKILL.md and the two validate templates. Each child task is one SEARCH/REPLACE block in one file, per diff-mode's one-block-per-task rule."
  ```

  - [x] 1.1 skills/fc-validate/SKILL.md: correct the description clause (AC1)
    ```yaml
    description: "Replace the description field's overbroad 'never judges the code... or whether a task's approach actually works' clause with the corrected clause that scopes command/flag/argument expression into the Accuracy class."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
        it never judges the code an executor produced, and it never judges whether a task's approach actually works.
        =======
        it never judges the code an executor produced or whether a task's chosen approach is right, but how that approach is expressed — every command, flag, argument, path, anchor and count — is in scope wherever a file the artefact cites disproves it.
        >>>>>>> REPLACE
    pattern: "skills/fc-validate/SKILL.md line 3 (the `description` field)"
    imports: "None. Plan PLN-11-s3bs39 AC1 gives the exact before/after text."
    compatibility: "Frontmatter YAML must stay parseable: the `description` value stays a single-line scalar with no unescaped colon-space sequence introduced."
    gotcha: "The SEARCH text sits inside a long single-line YAML `description` value; match only the sentence, not the surrounding clauses, to keep the block minimal and unambiguous."
    verify:
      - "grep -c \"it never judges the code an executor produced or whether a task's chosen approach is right\" skills/fc-validate/SKILL.md"
      - "Expect 1 (baseline at base_commit: 0, confirmed by measurement)."
      - "grep -c \"it never judges the code an executor produced, and it never judges whether a task's approach actually works.\" skills/fc-validate/SKILL.md"
      - "Expect 0 (baseline at base_commit: 1, confirmed by measurement — this discriminates)."
    checklist:
      - "The old clause no longer appears anywhere in SKILL.md."
      - "The new clause appears verbatim, once."
      - "Frontmatter still parses (the file's `---` delimited block is unchanged in shape)."
      - "No other line in SKILL.md changed."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 skills/fc-validate/SKILL.md: add the command/flag/argument Accuracy bullet (AC2)
    ```yaml
    description: "Insert a new Accuracy-class bullet after the existing depends_on bullet and before the 'statement about what another artefact says' bullet, covering a command/flag/argument a file the artefact cites shows wrong, incomplete or unrunnable."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
        - A `depends_on` naming the wrong upstream ID.
        - A statement about what another artefact says, requires, or is currently in, where that
        =======
        - A `depends_on` naming the wrong upstream ID.
        - A command, flag or argument the artefact tells an executor to run, where a file it
          cites shows it wrong, incomplete or unrunnable as written.
        - A statement about what another artefact says, requires, or is currently in, where that
        >>>>>>> REPLACE
    pattern: "skills/fc-validate/SKILL.md lines 97-98 (the Accuracy bullet list, ## 2 > Accuracy)"
    imports: "None. Plan PLN-11-s3bs39 AC2 gives the exact bullet text and its position."
    compatibility: "Bullet wrapping and 2-space continuation-line indent match the surrounding list's existing style (see line 98-100)."
    gotcha: "This task depends on task 1.1 landing first only in the sense both touch SKILL.md; the two SEARCH blocks target disjoint regions (line 3 vs lines 97-98) so order between 1.1 and 1.2 does not matter for anchor matching, but run 1.1 first per numbering."
    verify:
      - "grep -c \"A command, flag or argument the artefact tells an executor to run\" skills/fc-validate/SKILL.md"
      - "Expect 1 (baseline at base_commit: 0, confirmed by measurement)."
    checklist:
      - "The new bullet sits directly after the depends_on bullet and directly before the 'statement about what another artefact says' bullet."
      - "The bullet's wording matches AC2 verbatim."
      - "SKILL.md:102-104 (the bounded-survey guard) is byte-for-byte unchanged."
      - "No other bullet in the Accuracy list changed."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 validate-issues-and-tasks.md: correct the comparison-1 source sentence (AC3)
    ```yaml
    description: "Replace the ambiguous 'go looking for no file behind them' sentence with wording that limits where the source lives without being read as a general licence to check nothing."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/validate-issues-and-tasks.md
        <<<<<<< SEARCH
        The findings in that block are the whole source: go looking for no file behind them.
        =======
        The findings in that block are the whole source, and no file holds them, so look for none. That limits where the source lives, not which files you may open to check the issue list's own claims.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/validate-issues-and-tasks.md line 21"
    imports: "None. Plan PLN-11-s3bs39 AC3 gives the exact before/after text."
    compatibility: "The sentence sits mid-paragraph in Comparison 1's instructions; punctuation and surrounding prose are otherwise unchanged."
    gotcha: "This exact sentence is the only occurrence of 'go looking for no file behind them' anywhere under skills/flowcharge/templates/, so this task also clears AC5's repo-wide grep; do not duplicate that grep in a later task."
    verify:
      - "grep -c \"go looking for no file behind them\" skills/flowcharge/templates/validate-issues-and-tasks.md"
      - "Expect 0 (baseline at base_commit: 1, confirmed by measurement)."
      - "grep -rn \"go looking for no file behind them\" skills/flowcharge/templates/"
      - "Expect zero matches repo-wide, satisfying AC5 (baseline at base_commit: 1 match, confirmed by measurement)."
    checklist:
      - "The old sentence no longer appears in the file."
      - "The new sentence appears verbatim, once."
      - "No other line in validate-issues-and-tasks.md changed."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.4 validate-issues-and-tasks.md: extend the comparison-1 Accuracy bullet (AC4, first of four)
    ```yaml
    description: "Insert 'commands with their flags and arguments,' after 'Anchors, paths, counts,' in the Comparison 1 Accuracy bullet (line 25)."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/validate-issues-and-tasks.md
        <<<<<<< SEARCH
        - **Accuracy.** Anchors, paths, counts, and claims about another artefact that the issue list itself names by ID or by path.
        =======
        - **Accuracy.** Anchors, paths, counts, commands with their flags and arguments, and claims about another artefact that the issue list itself names by ID or by path.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/validate-issues-and-tasks.md line 25"
    imports: "None. Plan PLN-11-s3bs39 AC4 gives the exact replacement fragment, applied identically across all four bullets (tasks 1.4-1.7)."
    compatibility: "The remainder of the bullet (the 'Follow only the references...' sentence) is unchanged."
    gotcha: "Line 25's bullet reads 'Anchors, paths, counts, and claims' (no depends_on IDs clause); do not confuse with line 33's bullet, which does carry a depends_on IDs clause (task 1.5)."
    verify:
      - "grep -c \"Anchors, paths, counts, commands with their flags and arguments, and claims about another artefact that the issue list itself names\" skills/flowcharge/templates/validate-issues-and-tasks.md"
      - "Expect 1 (baseline at base_commit: 0, confirmed by measurement)."
    checklist:
      - "The bullet reads 'Anchors, paths, counts, commands with their flags and arguments, and claims...' verbatim."
      - "No other part of the bullet or surrounding prose changed."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.5 validate-issues-and-tasks.md: extend the comparison-2 Accuracy bullet (AC4, second of four)
    ```yaml
    description: "Insert 'commands with their flags and arguments,' after 'Anchors, paths, counts,' in the Comparison 2 Accuracy bullet (line 33)."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/validate-issues-and-tasks.md
        <<<<<<< SEARCH
        - **Accuracy.** Anchors, paths, counts, `depends_on` IDs, and claims about another artefact that the task list itself names by ID or by path.
        =======
        - **Accuracy.** Anchors, paths, counts, commands with their flags and arguments, `depends_on` IDs, and claims about another artefact that the task list itself names by ID or by path.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/validate-issues-and-tasks.md line 33"
    imports: "None. Plan PLN-11-s3bs39 AC4 gives the exact replacement fragment, applied identically across all four bullets (tasks 1.4-1.7)."
    compatibility: "The remainder of the bullet (the 'Follow only the references...' sentence) is unchanged."
    gotcha: "Run this after task 1.4 so both edits land in the same file without SEARCH-text overlap; the two bullets differ by the depends_on IDs clause, so their SEARCH texts do not collide."
    verify:
      - "grep -c \"Anchors, paths, counts, commands with their flags and arguments, \\`depends_on\\` IDs, and claims about another artefact that the task list itself names\" skills/flowcharge/templates/validate-issues-and-tasks.md"
      - "Expect 1 (baseline at base_commit: 0, confirmed by measurement)."
    checklist:
      - "The bullet reads 'Anchors, paths, counts, commands with their flags and arguments, `depends_on` IDs, and claims...' verbatim."
      - "No other part of the bullet or surrounding prose changed."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.6 validate-plan-and-tasks.md: extend the comparison-1 Accuracy bullet (AC4, third of four)
    ```yaml
    description: "Insert 'commands with their flags and arguments,' after 'Anchors, paths, counts,' in the Comparison 1 Accuracy bullet (line 25)."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/validate-plan-and-tasks.md
        <<<<<<< SEARCH
        - **Accuracy.** Anchors, paths, counts, and claims about another artefact that the plan itself names by ID or by path.
        =======
        - **Accuracy.** Anchors, paths, counts, commands with their flags and arguments, and claims about another artefact that the plan itself names by ID or by path.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/validate-plan-and-tasks.md line 25"
    imports: "None. Plan PLN-11-s3bs39 AC4 gives the exact replacement fragment, applied identically across all four bullets (tasks 1.4-1.7)."
    compatibility: "The remainder of the bullet (the 'Follow only the references...' sentence) is unchanged."
    gotcha: "This bullet names 'the plan' rather than 'the issue list', matching this file's Comparison 1 subject; do not carry over validate-issues-and-tasks.md's wording."
    verify:
      - "grep -c \"Anchors, paths, counts, commands with their flags and arguments, and claims about another artefact that the plan itself names\" skills/flowcharge/templates/validate-plan-and-tasks.md"
      - "Expect 1 (baseline at base_commit: 0, confirmed by measurement)."
    checklist:
      - "The bullet reads 'Anchors, paths, counts, commands with their flags and arguments, and claims...' verbatim."
      - "No other part of the bullet or surrounding prose changed."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.7 validate-plan-and-tasks.md: extend the comparison-2 Accuracy bullet (AC4, fourth of four) and confirm the rollup counts (AC6)
    ```yaml
    description: "Insert 'commands with their flags and arguments,' after 'Anchors, paths, counts,' in the Comparison 2 Accuracy bullet (line 33), the last of the four shared edits, then confirm AC6's rollup grep across both templates."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/validate-plan-and-tasks.md
        <<<<<<< SEARCH
        - **Accuracy.** Anchors, paths, counts, `depends_on` IDs, and claims about another artefact that the task list itself names by ID or by path.
        =======
        - **Accuracy.** Anchors, paths, counts, commands with their flags and arguments, `depends_on` IDs, and claims about another artefact that the task list itself names by ID or by path.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/validate-plan-and-tasks.md line 33"
    imports: "None. Plan PLN-11-s3bs39 AC4 and AC6 give the exact replacement fragment and the rollup grep."
    compatibility: "The remainder of the bullet (the 'Follow only the references...' sentence) is unchanged."
    gotcha: "Run this task last in the parent so AC6's rollup grep, which spans both template files, sees all four bullet edits (tasks 1.4-1.7) already applied."
    verify:
      - "grep -c \"Anchors, paths, counts, commands with their flags and arguments, \\`depends_on\\` IDs, and claims about another artefact that the task list itself names\" skills/flowcharge/templates/validate-plan-and-tasks.md"
      - "Expect 1 (baseline at base_commit: 0, confirmed by measurement)."
      - "grep -c \"Anchors, paths, counts, commands with their flags and arguments,\" skills/flowcharge/templates/validate-plan-and-tasks.md skills/flowcharge/templates/validate-issues-and-tasks.md"
      - "Expect 2 for each file, 4 total, satisfying AC6 (baseline at base_commit: both files return 0, confirmed by measurement)."
    checklist:
      - "The bullet reads 'Anchors, paths, counts, commands with their flags and arguments, `depends_on` IDs, and claims...' verbatim."
      - "AC6's combined grep returns 2 for each file."
      - "No other part of the bullet or surrounding prose changed."
      - "SKILL.md:102-104 remains untouched (checked once for the whole parent task, per AC7)."
    self_eval:
      passed: true
      failures: []
    ```

- [x] 2. Run the test/lint backstop and confirm the baseline (plan Stage 2: AC8)
  ```yaml
  description: "Run this suite's only automated check after all seven edits (tasks 1.1-1.7) land, and confirm it still reports 264/264 with no regression."
  author: Anthony Koukoullis
  issues: []
  implement:
    - "Run `node skills/flowcharge/scripts/test/run-tests.mjs` from the project root after tasks 1.1-1.7 are complete."
    - "Confirm the output ends with '264/264 cases passed' and no `FAIL` line, matching the count already measured at base_commit (also 264/264)."
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs (project-wide check; no single target file)"
  imports: "None beyond the project's own test runner."
  compatibility: "Per DEVELOPMENT.md, this is the suite's sole verification backstop; no package.json/npm test exists in this project by design."
  gotcha: "This check cannot discriminate at base_commit: the suite already passes 264/264 before any edit lands, because per plan PLN-11-s3bs39's Testing strategy, no existing test asserts on the exact description or Accuracy-list wording the seven edits change. This task exists to catch an unintended regression, not to prove the edits landed — that proof is tasks 1.1-1.7's own verify steps."
  verify:
    - "node skills/flowcharge/scripts/test/run-tests.mjs"
    - "Confirm the final line reads '264/264 cases passed' (baseline at base_commit, confirmed by measurement: also 264/264, unchanged by design per the gotcha above)."
  checklist:
    - "The test runner exits without error."
    - "The reported count is 264/264, with no new failures introduced by the seven edits."
    - "No file outside the three named in tasks 1.1-1.7 was modified in the course of this task."
  self_eval:
    passed: true
    failures: []
  ```
