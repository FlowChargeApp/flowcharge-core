---
id: TL-20-swnqz1
type: tasklist
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Bound the orchestrator's briefing reads to flowcharge/, closing the artefact-files carve-out"
status: ready
created: 2026-09-19
updated: 2026-09-20
author: Anthony Koukoullis
depends_on: [PLN-16-zn02av]
links: []
mode: diff
base_commit: fffbf32
---

# FlowCharge Tasks

## Bound the orchestrator's briefing reads to flowcharge/, closing the artefact-files carve-out

Implements `PLN-16-zn02av`. This is a prose-only wording fix across three files, with no
mechanism and no test/build/lint step. It forbids the orchestrator from opening a file outside
`flowcharge/` to fill a `{{...}}` briefing block, and states the bound with one phrase, "files
under `flowcharge/`", everywhere `SKILL.md` states or cites it. Six edit sites carry it, in
file order: hard rule 8's carve-out clause, hard rule 12's and 13's citations of that clause,
"Filling a template" step 4, and the line-16 `{{briefing}}` placeholder in each of
`plan-and-tasks-spec.md` and `plan-and-tasks-diff.md`. Every SEARCH block below is copied from
the working tree at `base_commit` (`fffbf32`), never from the plan's quoted snippets. Line
numbers cited below are those at `base_commit`; task 1.1 adds one line to `SKILL.md`, so every
later `SKILL.md` anchor sits one line lower once 1.1 has landed.

- [x] 1. Bound every statement of the orchestrator's read permission in `SKILL.md` to "files under `flowcharge/`"

  ```yaml
  description: "Four independent edits to skills/flowcharge/SKILL.md, in file order: narrow hard rule 8's carve-out and name the {{context docs}} project-root check, realign hard rules 12 and 13's citations of that carve-out, and add the prohibition on opening a file outside flowcharge/ to 'Filling a template' step 4."
  ```

  - [x] 1.1 Narrow hard rule 8's carve-out to "files under `flowcharge/`" and name the `{{context docs}}` check
    ```yaml
    description: "Replace 'artefact files' in hard rule 8's carve-out clause with 'files under `flowcharge/`', add the parenthesis naming the project-root check the {{context docs}} block requires, and rewrap so the bound phrase sits on one line."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
           is recognized (see "Standing vs. one-off instructions"), and reading artefact
           files when a stage's return needs verifying or a briefing needs facts.
        =======
           is recognized (see "Standing vs. one-off instructions"), and reading
           files under `flowcharge/` (plus the project-root check the `{{context docs}}`
           block names) when a stage's return needs verifying or a briefing needs facts.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 8, lines 96-97 at base_commit (rule 8 spans lines 90-97)."
    imports: "None."
    compatibility: "Plan PLN-16-zn02av, Design item 1. The REPLACE keeps 'files under `flowcharge/`' on a single line so a single-line grep finds it (AC4). The parenthesis makes rule 8's closed list agree with step 4's '{{context docs}}' exception (Assumption 3)."
    gotcha: "At base_commit the old phrase wraps across two lines (line 96 ends 'reading artefact', line 97 opens 'files when'), so grep for 'artefact files' does not see it; the SEARCH block matches the real wrapping. The REPLACE is three lines where the SEARCH is two, so every later SKILL.md anchor moves down one line after this task lands."
    verify:
      - "grep -c 'plus the project-root check the' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit fffbf32)."
      - "grep -c 'reading artefact$' skills/flowcharge/SKILL.md — expect 0 (returns 1 at base_commit, line 96)."
      - "git diff -U0 skills/flowcharge/SKILL.md — expect exactly one hunk, headed '@@ -96,2 +96,3 @@'."
    checklist:
      - "Hard rule 8's carve-out clause reads exactly as Design item 1's New block (AC1)."
      - "No other line in hard rule 8 (lines 90-98 after the edit) differs from base_commit (AC1)."
      - "'files under `flowcharge/`' sits on one line, line 97, not split across a line break (AC4)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC7)."
      - "The new text names no model, vendor, or harness product (AC8)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Realign hard rule 12's citation of rule 8's carve-out
    ```yaml
    description: "Replace 'reading artefact files' with 'reading files under `flowcharge/`' in hard rule 12's citation of rule 8, rewrapping the two lines so the bound phrase sits on one line."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
            own reading, under rule 8's carve-out for reading artefact files when a
            briefing needs facts, never a subagent's. When the workstream record
        =======
            own reading, under rule 8's carve-out for reading files under `flowcharge/`
            when a briefing needs facts, never a subagent's. When the workstream record
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 12, lines 162-163 at base_commit (163-164 once task 1.1 has landed). The anchor lines are indented four spaces."
    imports: "None."
    compatibility: "Plan PLN-16-zn02av, Design item 2 (Assumption 4). Rule 12's citation must use the same phrase rule 8 now carries."
    gotcha: "Hard rule 13 (lines 197-199 at base_commit) carries a near-identical citation with different line wrapping; it is task 1.3's anchor, not this one's. Match only the two lines above, which are unique because of the trailing 'When the workstream record'."
    verify:
      - "grep -c \"own reading, under rule 8's carve-out for reading files under\" skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit fffbf32)."
      - "grep -c 'reading artefact files when a$' skills/flowcharge/SKILL.md — expect 0 (returns 1 at base_commit, line 162)."
    checklist:
      - "Hard rule 12's citation reads exactly as Design item 2's New block (AC2)."
      - "No other line in hard rule 12 differs from base_commit (AC7)."
      - "'files under `flowcharge/`' sits on one line, not split across a line break (AC4)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC7)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 Realign hard rule 13's citation of rule 8's carve-out
    ```yaml
    description: "Replace 'reading artefact files' with 'reading files under `flowcharge/`' in hard rule 13's citation of rule 8. The line wrapping already keeps the bound phrase on one line."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
            the same stage. It is the orchestrator's own reading, under rule 8's
            carve-out for reading artefact files when a briefing needs facts,
            never a subagent's.
        =======
            the same stage. It is the orchestrator's own reading, under rule 8's
            carve-out for reading files under `flowcharge/` when a briefing needs facts,
            never a subagent's.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 13, lines 197-199 at base_commit (198-200 once task 1.1 has landed). The anchor lines are indented four spaces."
    imports: "None."
    compatibility: "Plan PLN-16-zn02av, Design item 3 (Assumption 4). Rule 13's citation must use the same phrase rule 8 now carries."
    gotcha: "Only the middle line changes. The first and third lines are context that makes the anchor unique against rule 12's citation, which task 1.2 owns."
    verify:
      - "grep -c 'carve-out for reading files under `flowcharge/` when a briefing needs facts,' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit fffbf32)."
      - "grep -c 'artefact files' skills/flowcharge/SKILL.md — expect 0 once tasks 1.1 and 1.2 have landed (returns 2 at base_commit, lines 162 and 198; task 1.2 removes one, this task removes the other) (AC2)."
    checklist:
      - "Hard rule 13's citation reads exactly as Design item 3's New block (AC2)."
      - "No other line in hard rule 13 differs from base_commit (AC7)."
      - "No line in skills/flowcharge/SKILL.md contains 'artefact files' (AC2)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC7)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.4 Add the prohibition on opening a file outside `flowcharge/` to "Filling a template" step 4
    ```yaml
    description: "In step 4 of 'Filling a template', replace ', never invent.' with '; never invent, never open a file outside `flowcharge/`.' and rewrap the paragraph, leaving the '{{context docs}}' exception sentence's wording unchanged."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
           the points the placeholder text names. Draw facts from the conversation, the
           chained artefacts (read them if needed), and files under `flowcharge/`, never invent.
           The `{{context docs}}` block is the one exception: its own text names the
           project-root files to check for.
        =======
        4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
           the points the placeholder text names. Draw facts from the conversation, the
           chained artefacts (read them if needed), and files under `flowcharge/`; never
           invent, never open a file outside `flowcharge/`. The `{{context docs}}` block is
           the one exception: its own text names the project-root files to check for.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, 'Filling a template: the verbatim procedure', step 4, lines 472-476 at base_commit (473-477 once task 1.1 has landed)."
    imports: "None."
    compatibility: "Plan PLN-16-zn02av, Design item 4 (Assumption 2). Step 4 governs every {{...}} block in every template, so this is where the prohibition lives; the two plan-and-tasks templates carry a one-line pointer to it (tasks 2.1 and 2.2). The phrase 'a file outside `flowcharge/`' is the same one those templates use."
    gotcha: "The REPLACE is five lines, the same as the SEARCH, so no later anchor moves. 'files under `flowcharge/`' stays on the third line, unsplit. The exception sentence's words do not change; only its line wrapping does."
    verify:
      - "grep -c 'never open a file outside `flowcharge/`' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit fffbf32) (AC3)."
      - "grep -c 'files under `flowcharge/`, never invent' skills/flowcharge/SKILL.md — expect 0 (returns 1 at base_commit, line 474)."
      - "grep -c 'files under `flowcharge/`' skills/flowcharge/SKILL.md — expect 4 once tasks 1.1 to 1.3 have landed (returns 1 at base_commit, line 474; tasks 1.1, 1.2 and 1.3 add one each) (AC4)."
      - "git diff -U0 fffbf32 -- skills/flowcharge/SKILL.md — expect exactly four hunks, at hard rule 8, hard rule 12, hard rule 13 and step 4, and no hunk anywhere else (AC1, AC7)."
    checklist:
      - "Step 4 reads exactly as Design item 4's New block (AC3)."
      - "The '{{context docs}}' exception sentence's wording is unchanged and now follows a stated prohibition (AC3, AC9)."
      - "skills/flowcharge/SKILL.md contains 'files under `flowcharge/`' on exactly four lines: rule 8, rule 12, rule 13, step 4 (AC4)."
      - "Every hard rule other than 8, 12 and 13 is byte-identical to base_commit (AC7)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC7)."
      - "The new text names no model, vendor, or harness product (AC8)."
    self_eval:
      passed: true
      failures: []
    ```

- [x] 2. Point the `plan-and-tasks-*.md` briefing placeholders at the workstream record and add the prohibition

  ```yaml
  description: "In the line-16 {{briefing}} placeholder of plan-and-tasks-spec.md and plan-and-tasks-diff.md, tell the orchestrator to point at {ws_dir}/workstream.md rather than restate it, and append the sentence forbidding it to open a file outside flowcharge/ to fill the block. The line lands character-for-character identically in both files."
  ```

  - [x] 2.1 Edit `plan-and-tasks-spec.md` line 16
    ```yaml
    description: "Insert 'pointing at `{ws_dir}/workstream.md` rather than restating its body,' into the plan-only clause and append 'Never open a file outside `flowcharge/` to fill this block.' after the tasks-only clause on line 16 of plan-and-tasks-spec.md."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-spec.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Never open a file outside `flowcharge/` to fill this block.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md, line 16 (the {{briefing}} placeholder, one line)."
    imports: "None."
    compatibility: "Plan PLN-16-zn02av, Design item 5 (Assumptions 2 and 5). The new line must match Design item 5 character for character and must be the line task 2.2 lands in plan-and-tasks-diff.md. `{ws_dir}` inside the placeholder follows the existing `{stages}` precedent and is substituted at step 3 before the block is filled at step 4."
    gotcha: "The {{context docs}} placeholder (line 14), the Role/Skills/Instructions sections and the Part 1/Part 2 bodies must stay untouched; the SEARCH block targets only line 16. Line 16 is one long line; copy it whole."
    verify:
      - "grep -c 'Never open a file outside `flowcharge/` to fill this block' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 1 (returns 0 at base_commit fffbf32)."
      - "grep -c 'pointing at `{ws_dir}/workstream.md` rather than restating its body' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 1 (returns 0 at base_commit)."
      - "git diff -U0 skills/flowcharge/templates/plan-and-tasks-spec.md — expect exactly one hunk, headed '@@ -16 +16 @@'."
    checklist:
      - "Line 16 reads exactly as Design item 5's New block (AC5)."
      - "No other line in the file changed, including the {{context docs}} placeholder at line 14 (AC6)."
      - "No file other than plan-and-tasks-spec.md was modified by this task (AC7)."
      - "The new text names no model, vendor, or harness product (AC8)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 2.2 Edit `plan-and-tasks-diff.md` line 16 identically
    ```yaml
    description: "Apply the identical line-16 change to plan-and-tasks-diff.md and confirm the two templates' line 16 stays byte-identical."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-diff.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play.}}
        =======
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Never open a file outside `flowcharge/` to fill this block.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md, line 16 (the {{briefing}} placeholder, one line)."
    imports: "None."
    compatibility: "Plan PLN-16-zn02av, Design item 6, identical to item 5. At base_commit the two templates' line 16 is already byte-identical; this edit must preserve that."
    gotcha: "Run this task only after task 2.1 has landed, so the byte-identical check below compares two edited files rather than one edited and one not."
    verify:
      - "grep -c 'Never open a file outside `flowcharge/` to fill this block' skills/flowcharge/templates/plan-and-tasks-diff.md — expect 1 (returns 0 at base_commit fffbf32)."
      - "grep -c 'pointing at `{ws_dir}/workstream.md` rather than restating its body' skills/flowcharge/templates/plan-and-tasks-diff.md — expect 1 (returns 0 at base_commit)."
      - "diff <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-spec.md) <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-diff.md) — expect no output. This is empty at base_commit too, because line 16 is already byte-identical there; it cannot fail at base_commit and is carried to confirm tasks 2.1 and 2.2 kept that equality after both landed (AC5)."
      - "git diff -U0 fffbf32 --stat -- skills/ — expect exactly three files: skills/flowcharge/SKILL.md, skills/flowcharge/templates/plan-and-tasks-spec.md, skills/flowcharge/templates/plan-and-tasks-diff.md (AC7)."
    checklist:
      - "Line 16 is byte-identical to plan-and-tasks-spec.md's line 16 after both edits land (AC5)."
      - "No other line in the file changed, including the {{context docs}} placeholder at line 14 (AC6)."
      - "No file other than plan-and-tasks-diff.md was modified by this task; across the whole task list only the three files named in the plan's Scope differ from base_commit (AC7)."
      - "The new text names no model, vendor, or harness product (AC8)."
    self_eval:
      passed: true
      failures: []
    ```
