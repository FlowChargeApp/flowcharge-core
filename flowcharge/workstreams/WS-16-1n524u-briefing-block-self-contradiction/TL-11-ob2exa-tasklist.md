---
id: TL-11-ob2exa
type: tasklist
workstream: WS-16-1n524u
slug: briefing-block-self-contradiction
title: "Delete the self-contradicting clause from the briefing paragraph"
status: done
created: 2026-09-17
updated: 2026-09-17
author: Anthony Koukoullis
depends_on: [PLN-9-wewcwy]
links: []
mode: diff
base_commit: 152a4d0
---

# FlowCharge Tasks

## Delete the self-contradicting clause from the briefing paragraph

PLN-9-wewcwy found that line 16 of both `skills/flowcharge/templates/plan-and-tasks-spec.md`
and `skills/flowcharge/templates/plan-and-tasks-diff.md` carries an identical `{{briefing}}`
placeholder paragraph, and that the `plan-only` sentence inside it tells the orchestrator to
include "the parts of the codebase it touches" as something the subagent "cannot discover
for itself" — which contradicts the sentence, since a subagent can discover that by reading
the repo. The fix deletes that clause, and the comma and "and" that connect it to the rest
of the list, from both files, landed together so the templates are never left disagreeing.
Confirmed at `base_commit` 152a4d0: both files are byte-identical at line 16, the target
string is present exactly once per file (grep across `skills/flowcharge/templates/` returns
2, one per file), and the opening clause "everything the subagent needs and cannot discover
for itself" is present verbatim in both. No divergence from the plan was found.

- [x] 1. Delete the contradicting clause in both templates (Parent task)
  ```yaml
  description: "Apply the single substring deletion to line 16 of both plan-and-tasks-spec.md and plan-and-tasks-diff.md in the same change, per PLN-9-wewcwy Stage 1 and Design."
  ```

  - [x] 1.1 Delete the clause in plan-and-tasks-spec.md
    ```yaml
    description: "Remove 'and the parts of the codebase it touches' (with its leading comma) from the plan-only sentence at line 16."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        File: skills/flowcharge/templates/plan-and-tasks-spec.md

        <<<<<<< SEARCH
        the decisions already taken, the constraints in play, and the parts of the codebase it touches.
        =======
        the decisions already taken, the constraints in play.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md, line 16 only"
    imports: "None. PLN-9-wewcwy Design: plain deletion only, no rephrasing, no added connecting word."
    compatibility: "No other wording on line 16 changes; the plan-and-tasks and tasks-only branches later in the same paragraph stay untouched, per PLN-9-wewcwy AC5."
    gotcha: "The search string must match exactly once (confirmed at base_commit); if the file has since changed, re-anchor per the diff-mode staleness guard rather than approximating."
    verify:
      - "grep -c \"the parts of the codebase it touches\" skills/flowcharge/templates/plan-and-tasks-spec.md"
      - "Confirm the count is 0 (was 1 at base_commit 152a4d0, per PLN-9-wewcwy AC3)."
      - "grep -c \"everything the subagent needs and cannot discover for itself\" skills/flowcharge/templates/plan-and-tasks-spec.md"
      - "Confirm the count is still 1 (PLN-9-wewcwy AC4: opening clause unchanged)."
      - "git diff --stat skills/flowcharge/templates/plan-and-tasks-spec.md"
      - "Confirm only line 16 shows as changed (PLN-9-wewcwy AC5)."
    checklist:
      - "Line 16 no longer contains the string 'the parts of the codebase it touches' (AC1)."
      - "The opening clause 'everything the subagent needs and cannot discover for itself' is unchanged, verbatim (AC4)."
      - "No line other than line 16 changed in this file (AC5)."
      - "No other wording on line 16 changed beyond the deleted clause (AC5)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Delete the clause in plan-and-tasks-diff.md
    ```yaml
    description: "Remove 'and the parts of the codebase it touches' (with its leading comma) from the plan-only sentence at line 16, matching task 1.1 so the two templates land together and never disagree."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        File: skills/flowcharge/templates/plan-and-tasks-diff.md

        <<<<<<< SEARCH
        the decisions already taken, the constraints in play, and the parts of the codebase it touches.
        =======
        the decisions already taken, the constraints in play.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md, line 16 only"
    imports: "None. PLN-9-wewcwy Design: plain deletion only, no rephrasing, no added connecting word."
    compatibility: "No other wording on line 16 changes; the plan-and-tasks and tasks-only branches later in the same paragraph stay untouched, per PLN-9-wewcwy AC5. After this task and 1.1, the paragraph at line 16 must remain byte-identical between both files."
    gotcha: "The search string must match exactly once (confirmed at base_commit); if the file has since changed, re-anchor per the diff-mode staleness guard rather than approximating."
    verify:
      - "grep -c \"the parts of the codebase it touches\" skills/flowcharge/templates/plan-and-tasks-diff.md"
      - "Confirm the count is 0 (was 1 at base_commit 152a4d0, per PLN-9-wewcwy AC3)."
      - "grep -c \"everything the subagent needs and cannot discover for itself\" skills/flowcharge/templates/plan-and-tasks-diff.md"
      - "Confirm the count is still 1 (PLN-9-wewcwy AC4: opening clause unchanged)."
      - "git diff --stat skills/flowcharge/templates/plan-and-tasks-diff.md"
      - "Confirm only line 16 shows as changed (PLN-9-wewcwy AC5)."
      - "diff <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-spec.md) <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-diff.md)"
      - "Confirm no output: the two files stay byte-identical at line 16 (PLN-9-wewcwy Stage 1 acceptance)."
    checklist:
      - "Line 16 no longer contains the string 'the parts of the codebase it touches' (AC2)."
      - "The opening clause 'everything the subagent needs and cannot discover for itself' is unchanged, verbatim (AC4)."
      - "No line other than line 16 changed in this file (AC5)."
      - "Line 16 is byte-identical to plan-and-tasks-spec.md's line 16 after task 1.1."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 Confirm the repo-wide acceptance criterion
    ```yaml
    description: "Run PLN-9-wewcwy's own repo-scoped AC3 grep and the project's test backstop after tasks 1.1 and 1.2 both land, to confirm the fix as a whole, not just file-by-file."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "No code change. Run the verify steps below after tasks 1.1 and 1.2 are both applied."
    pattern: "skills/flowcharge/templates/ (read-only verification, no file edited by this task)"
    imports: "None."
    compatibility: "Depends on tasks 1.1 and 1.2 both being complete first."
    gotcha: "This is the plan's own AC3 check, scoped exactly as PLN-9-wewcwy states it (rooted at skills/flowcharge/templates/, not the whole repo)."
    verify:
      - "grep -rn \"the parts of the codebase it touches\" skills/flowcharge/templates/"
      - "Confirm zero matches (was 2 at base_commit 152a4d0, per PLN-9-wewcwy AC3)."
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm the suite's existing cases still pass (this fix adds no new script-checked rule, per DEVELOPMENT.md's note that a rule with no script check needs an explicit CONVENTIONS.md note instead; this wording fix is prose-only and outside that rule)."
    checklist:
      - "grep -rn \"the parts of the codebase it touches\" skills/flowcharge/templates/ returns zero matches (AC3)."
      - "node skills/flowcharge/scripts/test/run-tests.mjs exits clean."
      - "Both target files still exist at their original paths, unmoved and unrenamed."
      - "No file outside the two named templates was touched by tasks 1.1 or 1.2."
    self_eval:
      passed: true
      failures: []
    ```
