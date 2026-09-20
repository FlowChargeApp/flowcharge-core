---
id: TL-21-pz0cu2
type: tasklist
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Forbid project reads at request intake and strip source facts from every briefing"
status: ready
created: 2026-09-20
updated: 2026-09-20
author: Anthony Koukoullis
depends_on: [PLN-17-2ai3df]
links: []
mode: diff
base_commit: a835a70
---

# FlowCharge Tasks

## Move the read prohibition to request intake and add a content re-scan in SKILL.md

Implements `PLN-17-2ai3df`, stage 1 (`skills/flowcharge/SKILL.md`). Six edits in file order:
hard rule 8's clause, hard rules 12 and 13's citations, the "Parsing the request" opening
paragraph, "Filling a template" step 4, and step 5. Every SEARCH block is copied from the
working tree at `base_commit` (`a835a70`). Line numbers cited are those at `base_commit`; each
task's `pattern` states where its anchor sits once the earlier tasks have landed.

- [x] 1. Move the read prohibition to request intake and add a content re-scan in `SKILL.md`

  ```yaml
  description: "Six edits to skills/flowcharge/SKILL.md in file order: reword hard rule 8's clause away from 'a briefing needs facts', drop the purpose clause from rules 12 and 13's citations, add the unconditional intake prohibition to 'Parsing the request', rewrite step 4 to keep self-gathered facts out and author every briefing fresh, and add the content re-scan to step 5."
  ```

  - [x] 1.1 Reword hard rule 8's carve-out clause
    ```yaml
    description: "Replace 'project-root check' with 'project-root listing' and 'a briefing needs facts' with 'a briefing restates a decision already taken or a constraint on the outcome' in hard rule 8's carve-out clause."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
           is recognized (see "Standing vs. one-off instructions"), and reading
           files under `flowcharge/` (plus the project-root check the `{{context docs}}`
           block names) when a stage's return needs verifying or a briefing needs facts.
        =======
           is recognized (see "Standing vs. one-off instructions"), and reading
           files under `flowcharge/` (plus the project-root listing the `{{context docs}}`
           block names) when a stage's return needs verifying or a briefing restates a
           decision already taken or a constraint on the outcome.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 8, lines 96-98 at base_commit. The REPLACE is four lines where the SEARCH is three, so every later anchor moves down one line."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 1. 'files under `flowcharge/`' stays on one line. The phrase 'project-root listing' must match the wording tasks 1.4 and 1.5 introduce."
    gotcha: "Only the parenthesis and the final clause change; the first line of the SEARCH is unchanged context that makes the anchor unique."
    verify:
      - "grep -c 'briefing restates a' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit a835a70)."
      - "grep -c 'plus the project-root check' skills/flowcharge/SKILL.md — expect 0 (returns 1 at base_commit, line 97)."
      - "git diff -U0 skills/flowcharge/SKILL.md — expect exactly one hunk, headed '@@ -97,2 +97,3 @@' (line 96 is unchanged context, so the hunk starts at line 97)."
    checklist:
      - "Hard rule 8's clause reads exactly as Design item 1's New block (AC4)."
      - "No other line in hard rule 8 differs from base_commit (AC8)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Drop the purpose clause from hard rule 12's citation of rule 8
    ```yaml
    description: "In hard rule 12, cite rule 8's carve-out as 'reading files under `flowcharge/`' with no 'when a briefing needs facts' clause."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
            own reading, under rule 8's carve-out for reading files under `flowcharge/`
            when a briefing needs facts, never a subagent's. When the workstream record
        =======
            own reading, under rule 8's carve-out for reading files under `flowcharge/`,
            never a subagent's. When the workstream record
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 12, lines 163-164 at base_commit (164-165 once task 1.1 has landed). The anchor lines are indented four spaces."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 2 (Assumption 4)."
    gotcha: "Hard rule 13 carries a near-identical citation with different wrapping; it is task 1.3's anchor. The trailing 'When the workstream record' makes this anchor unique. The second line becomes short; leave the following lines' wrapping alone."
    verify:
      - "grep -c \"when a briefing needs facts, never a subagent's\" skills/flowcharge/SKILL.md — expect 0 (returns 1 at base_commit, line 164)."
      - "grep -c 'carve-out for reading files under `flowcharge/`,$' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit)."
    checklist:
      - "Hard rule 12's citation reads exactly as Design item 2's New block (AC4)."
      - "No other line in hard rule 12 differs from base_commit (AC8)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC8)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 Drop the purpose clause from hard rule 13's citation of rule 8
    ```yaml
    description: "In hard rule 13, cite rule 8's carve-out as 'reading files under `flowcharge/`' with no 'when a briefing needs facts' clause, folding the last line into the one before."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
            the same stage. It is the orchestrator's own reading, under rule 8's
            carve-out for reading files under `flowcharge/` when a briefing needs facts,
            never a subagent's.
        =======
            the same stage. It is the orchestrator's own reading, under rule 8's
            carve-out for reading files under `flowcharge/`, never a subagent's.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 13, lines 198-200 at base_commit (199-201 once task 1.1 has landed). The REPLACE is two lines where the SEARCH is three, so later anchors move up one line, cancelling task 1.1's shift."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 3 (Assumption 4)."
    gotcha: "The first SEARCH line is unchanged context that makes the anchor unique against rule 12's citation, which task 1.2 owns."
    verify:
      - "grep -c \"carve-out for reading files under \\`flowcharge/\\`, never a subagent's\" skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit a835a70)."
      - "grep -c 'briefing needs facts' skills/flowcharge/SKILL.md — expect 0 once tasks 1.1 and 1.2 have landed (returns 3 at base_commit, lines 98, 164 and 199; each of tasks 1.1, 1.2 and this one removes one) (AC4)."
    checklist:
      - "Hard rule 13's citation reads exactly as Design item 3's New block (AC4)."
      - "No line in skills/flowcharge/SKILL.md contains 'briefing needs facts' (AC4)."
      - "No other line in hard rule 13 differs from base_commit (AC8)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC8)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.4 Add the unconditional intake prohibition to "Parsing the request"
    ```yaml
    description: "Insert, between the 'Parsing the request' heading and 'Map the user's English', a paragraph forbidding any read outside flowcharge/ and <skills-dir> for the whole run, by any tool and for any purpose, naming the two sanctioned exceptions."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        ## Parsing the request

        Map the user's English onto an ordered subset of operations. The standard chains:
        =======
        ## Parsing the request

        From the moment a request arrives until the run ends, read no file outside
        `flowcharge/` and `<skills-dir>`, by any tool: not to understand the request, not
        to check feasibility, not to fill a briefing. The subagents read the target
        project; you never do. What you need to know is what the user said and what the
        chained artefacts record; everything else is the spawned stage's job to discover
        from a cold context, by design. Two exceptions: the project-root listing the
        `{{context docs}}` block names, which is a listing and not a read, and the commit
        stage, where the fc-git skill reads the diff it commits.

        Map the user's English onto an ordered subset of operations. The standard chains:
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, 'Parsing the request', lines 425-427 at base_commit (unchanged position once tasks 1.1 to 1.3 have landed, whose shifts cancel). The REPLACE adds nine lines, so step 4 and step 5 move down nine lines."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 4 (Assumptions 1 and 2). '<skills-dir>' is the token SKILL.md already uses for the skills directory. The phrase 'project-root listing' matches rule 8 (task 1.1) and step 4 (task 1.5)."
    gotcha: "The SEARCH includes the heading and the blank line so the paragraph lands before the chains and not after them. Preserve the blank line between the new paragraph and 'Map the user's English'."
    verify:
      - "grep -c 'From the moment a request arrives' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit a835a70) (AC1)."
      - "grep -n -A1 '^## Parsing the request' skills/flowcharge/SKILL.md | tail -1 — expect a blank line, then confirm the next line starts 'From the moment' (at base_commit the line after the blank starts 'Map the user')."
      - "grep -c 'which is a listing and not a read' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit)."
    checklist:
      - "'Parsing the request' opens with the intake paragraph exactly as Design item 4's New block, before 'Map the user's English' (AC1)."
      - "The paragraph names both exceptions: the project-root listing and the commit stage (AC1)."
      - "No other line in 'Parsing the request' differs from base_commit (AC8)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.5 Rewrite "Filling a template" step 4
    ```yaml
    description: "Rewrite step 4 to point at 'Parsing the request', keep self-gathered facts out even when they sit in the conversation, require every briefing to be authored fresh, and describe the {{context docs}} look as a listing."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
           the points the placeholder text names. Draw facts from the conversation, the
           chained artefacts (read them if needed), and files under `flowcharge/`; never
           invent, never open a file outside `flowcharge/`. The `{{context docs}}` block is
           the one exception: its own text names the project-root files to check for.
        =======
        4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
           the points the placeholder text names. Draw on the conversation, the chained
           artefacts (read them if needed), and files under `flowcharge/`; never invent, and
           never open a file outside `flowcharge/` (see "Parsing the request"). Facts about
           the target project that you gathered yourself, by any read, stay out even when
           they sit in the conversation: the subagent rediscovers them from a cold context,
           by design. Author every briefing fresh from the placeholder's points, and
           never paste an earlier briefing. The project-root listing the `{{context docs}}`
           block names is the one look outside `flowcharge/`: a listing, not a read.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, 'Filling a template: the verbatim procedure', step 4, lines 473-477 at base_commit (482-486 once task 1.4 has landed). The REPLACE is nine lines where the SEARCH is five, so step 5 moves down four more lines."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 5. 'files under `flowcharge/`' stays on one line. 'never paste an earlier briefing' is the same phrase the templates' line 16 carries (tasks 2.2 and 2.4)."
    gotcha: "Copy the SEARCH from the file after task 1.4 has landed; its text is unchanged by 1.4 but its position is not. The step-5 line that follows is task 1.6's anchor and is not part of this block."
    verify:
      - "grep -c 'never paste an earlier briefing' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit a835a70) (AC3)."
      - "grep -c 'Draw facts from the conversation' skills/flowcharge/SKILL.md — expect 0 (returns 1 at base_commit, line 474)."
      - "grep -c 'project-root listing' skills/flowcharge/SKILL.md — expect 3 once tasks 1.1 and 1.4 have landed (returns 0 at base_commit; rule 8, the intake paragraph and step 4 carry one each) (AC4)."
    checklist:
      - "Step 4 reads exactly as Design item 5's New block (AC3)."
      - "Step 4 points at 'Parsing the request', keeps self-gathered facts out, requires a fresh briefing every spawn, and calls the {{context docs}} look a listing (AC3)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.6 Add the content re-scan to "Filling a template" step 5
    ```yaml
    description: "Extend step 5 with a second re-scan over every {{briefing}} block for a path outside flowcharge/, a line number, quoted source or file contents, exempting what the request or a subagent's return supplied verbatim, and deleting the rest without paraphrase."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        5. Re-scan the result against the template: outside the slots, nothing changed.
        =======
        5. Re-scan the result against the template: outside the slots, nothing changed.
           Then re-scan every `{{briefing}}` block: it carries no path outside
           `flowcharge/`, no line number, no quoted source, and no file contents, except
           what the user's request or a subagent's return supplied verbatim. Delete any
           other such item; do not paraphrase it into a hint.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, 'Filling a template: the verbatim procedure', step 5, line 478 at base_commit (491 once tasks 1.4 and 1.5 have landed). The SEARCH is the whole single line of step 5, which is unique in the file."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 6 (Assumptions 3 and 5). '{{briefing}}' is the slot name the operations table uses; {{context docs}} and {{source material}} are not scanned."
    gotcha: "Step 6 follows immediately; it is not part of this block and must not change."
    verify:
      - "grep -c 'no line number' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit a835a70) (AC2)."
      - "grep -c 'Then re-scan every `{{briefing}}` block' skills/flowcharge/SKILL.md — expect 1 (returns 0 at base_commit)."
      - "git diff -U0 a835a70 -- skills/flowcharge/SKILL.md — expect exactly six hunks, at hard rule 8, hard rule 12, hard rule 13, 'Parsing the request', step 4 and step 5, and no hunk anywhere else (AC8)."
    checklist:
      - "Step 5 reads exactly as Design item 6's New block (AC2)."
      - "Step 6 is byte-identical to base_commit (AC8)."
      - "Every hard rule other than 8, 12 and 13 is byte-identical to base_commit (AC8)."
      - "No file other than skills/flowcharge/SKILL.md was modified by this task (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: true
      failures: []
    ```

## Reword both plan-and-tasks templates' context-docs and briefing placeholders

Implements `PLN-17-2ai3df`, stage 2 (the two `plan-and-tasks-*.md` templates). Lines 14 and 16
are byte-identical between the two files at `base_commit` and must stay so.

- [ ] 2. Reword the `{{context docs}}` and `{{briefing}}` placeholders in both `plan-and-tasks-*.md` templates

  ```yaml
  description: "Four edits: in each of plan-and-tasks-spec.md and plan-and-tasks-diff.md, narrow line 14's {{context docs}} placeholder to a bare listing and rewrite line 16's {{briefing}} placeholder to ask for only what the subagent cannot discover, with the content rule stated at the point of drafting. Each line lands character-for-character identically in both files."
  ```

  - [ ] 2.1 Narrow `plan-and-tasks-spec.md` line 14 to a bare listing
    ```yaml
    description: "Rewrite the {{context docs}} placeholder on line 14 of plan-and-tasks-spec.md so it lists the project root and names documents by what their filename implies, never opening one."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-spec.md
        <<<<<<< SEARCH
        {{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what that document covers and when to read it. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
        =======
        {{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what its filename and location imply it covers, and so when to read it. List the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and name only files the listing showed; never open one to describe it. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md, line 14 (the {{context docs}} placeholder, one line)."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 7. Must match Design item 7 character for character and be the line task 2.3 lands in plan-and-tasks-diff.md."
    gotcha: "Line 14 is one long line; copy it whole. Line 16 (the {{briefing}} placeholder) is task 2.2's anchor and must not change here."
    verify:
      - "grep -c 'never open one to describe it' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 1 (returns 0 at base_commit a835a70) (AC6)."
      - "grep -c 'list only files you have confirmed are there' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 0 (returns 1 at base_commit, line 14)."
      - "git diff -U0 skills/flowcharge/templates/plan-and-tasks-spec.md — expect exactly one hunk, headed '@@ -14 +14 @@'."
    checklist:
      - "Line 14 reads exactly as Design item 7's New block (AC6)."
      - "No other line in the file changed (AC8)."
      - "No file other than plan-and-tasks-spec.md was modified by this task (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.2 Rewrite `plan-and-tasks-spec.md` line 16 to ask only for what the subagent cannot discover
    ```yaml
    description: "Rewrite the {{briefing}} placeholder on line 16 of plan-and-tasks-spec.md: drop 'complete on the points below', ask for the request, decisions and constraints on the outcome, state the content rule, keep the {ws_dir}/workstream.md pointer, and require a fresh briefing."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-spec.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Never open a file outside `flowcharge/` to fill this block.}}
        =======
        {{only what the subagent cannot discover for itself: the request, the decisions already taken, and the constraints on the outcome (scope, compatibility, what must not change). Nothing about how the code is built: no path outside `flowcharge/`, line number or quoted source beyond what the request or a subagent's return supplied; the subagent reads the target project itself. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, plus those decisions and constraints. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: those decisions and constraints only. Author this fresh; never paste an earlier briefing.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md, line 16 (the {{briefing}} placeholder, one line)."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 8 (Assumption 3). Must match Design item 8 character for character and be the line task 2.4 lands in plan-and-tasks-diff.md. The {ws_dir}/workstream.md pointer from PLN-16 is kept."
    gotcha: "Line 16 is one long line; copy it whole. Line 14 is task 2.1's anchor and must not change here."
    verify:
      - "grep -c 'only what the subagent cannot discover' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 1 (returns 0 at base_commit a835a70) (AC5)."
      - "grep -c 'complete on the points below' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 0 (returns 1 at base_commit, line 16) (AC5)."
      - "grep -c 'pointing at `{ws_dir}/workstream.md` rather than restating its body' skills/flowcharge/templates/plan-and-tasks-spec.md — expect 1. This already returns 1 at base_commit and cannot fail there; it is carried to confirm the rewrite kept the pointer PLN-16 landed."
    checklist:
      - "Line 16 reads exactly as Design item 8's New block (AC5)."
      - "No other line in the file changed (AC8)."
      - "No file other than plan-and-tasks-spec.md was modified by this task (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.3 Narrow `plan-and-tasks-diff.md` line 14 identically
    ```yaml
    description: "Apply the identical line-14 change to plan-and-tasks-diff.md and confirm the two templates' line 14 stays byte-identical."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-diff.md
        <<<<<<< SEARCH
        {{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what that document covers and when to read it. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
        =======
        {{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what its filename and location imply it covers, and so when to read it. List the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and name only files the listing showed; never open one to describe it. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md, line 14 (the {{context docs}} placeholder, one line)."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 9, identical to item 7."
    gotcha: "Run this task only after task 2.1 has landed, so the byte-identical check compares two edited files."
    verify:
      - "grep -c 'never open one to describe it' skills/flowcharge/templates/plan-and-tasks-diff.md — expect 1 (returns 0 at base_commit a835a70) (AC6)."
      - "diff <(sed -n '14p' skills/flowcharge/templates/plan-and-tasks-spec.md) <(sed -n '14p' skills/flowcharge/templates/plan-and-tasks-diff.md) — expect no output. This is empty at base_commit too, because line 14 is already byte-identical there; it cannot fail at base_commit and is carried to confirm tasks 2.1 and 2.3 kept that equality (AC7)."
    checklist:
      - "Line 14 is byte-identical to plan-and-tasks-spec.md's line 14 after both edits land (AC7)."
      - "No other line in the file changed (AC8)."
      - "No file other than plan-and-tasks-diff.md was modified by this task (AC8)."
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.4 Rewrite `plan-and-tasks-diff.md` line 16 identically
    ```yaml
    description: "Apply the identical line-16 change to plan-and-tasks-diff.md and confirm the two templates' line 16 stays byte-identical."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks-diff.md
        <<<<<<< SEARCH
        {{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Never open a file outside `flowcharge/` to fill this block.}}
        =======
        {{only what the subagent cannot discover for itself: the request, the decisions already taken, and the constraints on the outcome (scope, compatibility, what must not change). Nothing about how the code is built: no path outside `flowcharge/`, line number or quoted source beyond what the request or a subagent's return supplied; the subagent reads the target project itself. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, plus those decisions and constraints. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: those decisions and constraints only. Author this fresh; never paste an earlier briefing.}}
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md, line 16 (the {{briefing}} placeholder, one line)."
    imports: "None."
    compatibility: "Plan PLN-17-2ai3df, Design item 9, identical to item 8."
    gotcha: "Run this task only after task 2.2 has landed, so the byte-identical check compares two edited files."
    verify:
      - "grep -c 'only what the subagent cannot discover' skills/flowcharge/templates/plan-and-tasks-diff.md — expect 1 (returns 0 at base_commit a835a70) (AC5)."
      - "grep -c 'complete on the points below' skills/flowcharge/templates/plan-and-tasks-diff.md — expect 0 (returns 1 at base_commit, line 16) (AC5)."
      - "diff <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-spec.md) <(sed -n '16p' skills/flowcharge/templates/plan-and-tasks-diff.md) — expect no output. This is empty at base_commit too, because line 16 is already byte-identical there; it cannot fail at base_commit and is carried to confirm tasks 2.2 and 2.4 kept that equality (AC7)."
      - "git diff --stat a835a70 -- skills/ — expect exactly three files: skills/flowcharge/SKILL.md, skills/flowcharge/templates/plan-and-tasks-spec.md, skills/flowcharge/templates/plan-and-tasks-diff.md (AC8)."
    checklist:
      - "Line 16 is byte-identical to plan-and-tasks-spec.md's line 16 after both edits land (AC7)."
      - "No other line in the file changed (AC8)."
      - "Across the whole task list only the three files named in the plan's Scope differ from base_commit (AC8)."
      - "The new text names no model, vendor or harness product (AC9)."
    self_eval:
      passed: false
      failures: []
    ```
