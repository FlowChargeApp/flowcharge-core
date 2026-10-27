---
id: TL-34-m83k55
type: tasklist
workstream: WS-32-9mzwq7
slug: ignored-generated-files-in-skill-prose
title: "Correct the skill prose that says git status lists, or a commit captures, the git-ignored generated files"
status: ready
created: 2026-10-27
updated: 2026-10-27
author: Anthony Koukoullis
depends_on: [IL-9-m8mgu2]
links: []
mode: spec
base_commit: 8d433ab
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## The git-ignored generated files in the orchestrator's commit passages and fc-validate's precondition

Fixes the four defects IL-9-m8mgu2 files, one task per issue. The generator keeps `flowcharge/index.md`, `flowcharge/kanban.md`, `flowcharge/ids/` and every workstream `.lease` out of git, and a live check in a throwaway git repository confirmed that `git status --short` never lists them and `git add -A --dry-run` never stages them. Tasks 1 to 3 correct the three passages in `skills/flowcharge/SKILL.md` that say otherwise: the commit row of the Operations table, the Before commit prompt, which gains one sentence pointing at the CONVENTIONS.md section that owns the `.gitignore` rule rather than restating it, and the Successful end of run item. Task 4 corrects the explanation under fc-validate's baseline precondition, whose two numbered conditions stay as they are, and ends the `### Fixed` list under `## Unreleased` in `CHANGELOG.md` with one bullet for the whole fix, wrapped at about 80 columns. No version changes, and the generator stays unchanged. The test-update task adds one case to `run-tests.mjs` that pins each retired claim deleted from every skill file and each corrected passage to its file, through the single-copy check, so it must fail against the wording at `base_commit`.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Drop the ignored views and the lease from the commit row's inputs
  ```yaml
  description: "The Operations table's commit row lists only the upkeep writes a commit can capture: the issue closures and the --sync status flips"
  issues: [ISS-31-fg8y52]
  pattern: "skills/flowcharge/SKILL.md"
  implement:
    - "In skills/flowcharge/SKILL.md, section `## Operations`, in the table row whose Operation cell is `commit`, delete `, regenerated index/board, released lease` from the parenthesis in the Consumes cell, so the parenthesis reads (issue closures, `--sync` status flips) and the cell still ends with `, **PROMPTED**`. Change no other cell or row."
  verify:
    - "grep -cF 'regenerated index/board, released lease' skills/flowcharge/SKILL.md  # expect 0; 1 at base_commit"
    - "grep -cF '(issue closures, `--sync` status flips), **PROMPTED**' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 0"
      - result: YES
        measured: "source: verify 2 returned 1; the edit changes only the commit row's Consumes cell, which still ends with `, **PROMPTED**`"
  ```

- [ ] 2. Correct what the Before commit prompt expects git status to list
  ```yaml
  description: "The Before commit prompt expects the status to list the issue-status closures and the --sync status flips, and says it never lists the regenerated index and board, the claim markers or the lease, which the generator keeps out of git"
  issues: [ISS-32-xsbd4p]
  pattern: "skills/flowcharge/SKILL.md"
  implement:
    - "In skills/flowcharge/SKILL.md, section `## Prompts`, item `**Before commit**`: replace the parenthesis that lists FlowCharge Core's own edits with (the issue-status closures and `--sync`'s task-list, issue-list and workstream status flips), dropping the regenerated `index.md` and `kanban.md` and the released `.lease`."
    - "After the sentence that ends `alongside the run's authored and executed artefacts.`, add this sentence: It never lists the regenerated `index.md` and `kanban.md`, the claim markers or the `.lease`: the generator keeps them out of git (CONVENTIONS.md, The index and the board are generated). Keep the item's other sentences word for word. Re-wrap the item at about 88 columns with its two-space continuation indent, and keep the pointer, from its opening parenthesis to its closing one, on one line: the pointer-resolution case in run-tests.mjs reads pointers line by line."
  verify:
    - "grep -cF 'and the released' skills/flowcharge/SKILL.md  # expect 0; 1 at base_commit"
    - "grep -cF 'It never lists the regenerated' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
    - "grep -cF '(CONVENTIONS.md, The index and the board are generated)' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
  ```

- [ ] 3. Say the commit captures the status writes the end-of-run upkeep lists
  ```yaml
  description: "The Successful end of run item says the commit stage captures the status writes it lists, not every write"
  issues: [ISS-33-aambxj]
  pattern: "skills/flowcharge/SKILL.md"
  implement:
    - "In skills/flowcharge/SKILL.md, section `## FlowCharge Core upkeep (automatic, every pipeline run)`, item `**Successful end of run**`: in the sentence that opens `The commit` and ends `it captures every write listed below.`, replace `every write listed below` with `the status writes listed below`, keeping the line breaks where they are. The regenerations and the lease release the item lists reach no commit, because the generator keeps the views and the lease out of git. Change nothing else in the item."
  verify:
    - "grep -cF 'it captures every write listed below' skills/flowcharge/SKILL.md  # expect 0; 1 at base_commit"
    - "grep -cF 'it captures the status writes listed below' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
  ```

- [ ] 4. Name only what git status shows in fc-validate's precondition, and record the fix in CHANGELOG.md
  ```yaml
  description: "fc-validate's baseline precondition names only the files git status can show at validation time, the workstream record and the artefact under validation, and CHANGELOG.md records the whole fix in one bullet"
  issues: [ISS-34-9ml9x4]
  implement:
    - "In skills/fc-validate/SKILL.md, section `### The baseline precondition`, in the paragraph that opens `The precondition is never \"the working tree is clean\".`, rewrite the second sentence as: At validation time the workstream record is routinely modified by the upkeep that runs between stages, and the artefact under validation is untracked. Keep the paragraph's first and last sentences word for word, and re-wrap it at the width of the surrounding paragraphs, about 88 columns."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with one bullet of three lines: '- The orchestrator and fc-validate no longer say that `git status` lists, or a', then '  commit captures, the generated index and board, the ID-claim markers or the', then '  workstream lease files, which the generator keeps out of git.' It records the fixes of tasks 1 to 4."
  pattern: "skills/fc-validate/SKILL.md, CHANGELOG.md"
  compatibility: "Only the explanation of why the precondition is never a clean tree changes. The two numbered conditions above the paragraph and the drift report below it keep their words, because the workstream record and the artefact under validation both sit under flowcharge/, which condition 2 already leaves out. GITIGNORE_TARGETS in skills/flowcharge/scripts/fc-index.mjs is the authority for the four ignored paths and stays unchanged."
  gotcha: "Rule E of the docs-consistency cases in run-tests.mjs fails on the word gate in any skills/ Markdown file, and rule D on a bare FlowCharge that Core does not follow; the new sentence needs neither. The bullet joins the existing ### Fixed list under ## Unreleased after its last bullet, the CONVENTIONS.md one; no release heading and no SKILL.md version line changes."
  verify:
    - "grep -cF 'At validation time the generated' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
    - "grep -cF 'the lease file plus' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
    - "tr -s ' \\n' ' ' < skills/fc-validate/SKILL.md | grep -cF 'At validation time the workstream record is routinely modified by the upkeep that runs between stages, and the artefact under validation is untracked. A clean-tree precondition'  # expect 1; 0 at base_commit"
    - "grep -cF 'workstream lease files, which the generator keeps out of git.' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: the precondition paragraph names the workstream record as modified and the artefact under validation as untracked, and names no index, board or lease file"
    - "source: the paragraph's first and last sentences, the two numbered conditions above it and the drift report below it keep their words"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with the three-line bullet, and no line of it is wider than 80 columns"
    - "source: no version line, release heading or other file changes in this task"
  self_eval:
    passed: false
  ```

- [ ] 5. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Add, for tasks 1 to 4 (ISS-31-fg8y52, ISS-32-xsbd4p, ISS-33-aambxj, ISS-34-9ml9x4), directly after the case 'fc-validate still carries the correction-direction rule': a constant IGNORED_FILES_PROSE_PINS in the { phrase, files } shape SINGLE_COPY_PHRASES uses, and the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file'. The constant pins each of the five retired claims with files: [], so each must appear nowhere: 'regenerated index/board, released lease'; 'the regenerated `index.md` and `kanban.md`, and the released `.lease`'; 'it captures every write listed below'; 'the generated index, the board and the workstream record are routinely modified'; 'the lease file plus the artefact under validation are untracked'. It pins each corrected passage to its one file: '(issue closures, `--sync` status flips), **PROMPTED**', the whole new Before commit sentence from 'It never lists' to 'are generated).', and 'and it captures the status writes listed below.' to flowcharge/SKILL.md, and the new second sentence of the precondition paragraph to fc-validate/SKILL.md. The case asserts with assert.deepStrictEqual that singleCopyViolations(skillMarkdownSources(), IGNORED_FILES_PROSE_PINS) is [], with a message naming each file and phrase and marking a missing one, as the single-copy case's message does."
    - "Give the block a comment: the generator keeps the index, the board, the ID-claim markers and the lease files out of git, so git status never lists them and no commit captures them; four passages once said otherwise; the harness runs no agent, so this static check, built on the single-copy check, pins each retired claim deleted from every skill file and each corrected passage to its file; the pointer the Before commit sentence carries is left to the pointer-resolution case."
  verify:
    - "grep -cF \"testCase('no skill file says git status lists, or a commit captures, a git-ignored generated file'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
  ```

- [ ] 6. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: false
    test_run_result: pending
    test_run_baseline: []
    test_run_failures: []
  ```
