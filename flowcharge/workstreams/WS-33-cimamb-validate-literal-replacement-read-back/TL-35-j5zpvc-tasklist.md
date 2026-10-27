---
id: TL-35-j5zpvc
type: tasklist
workstream: WS-33-cimamb
slug: validate-literal-replacement-read-back
title: "Read a replacement text back in fc-validate's Accuracy class"
status: done
created: 2026-10-27
updated: 2026-10-27
author: Anthony Koukoullis
depends_on: [PLN-27-73ktx3]
links: []
mode: spec
base_commit: 4e44975
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Read a replacement text back in fc-validate's Accuracy class

Implements PLN-27-73ktx3. fc-validate's Accuracy class ends with one bounded read-back bullet, and Part 4's Undetermined condition holds every read-back finding, so such a finding always reports and is never applied. The description's Accuracy item names the read-back, `templates/validate.md` stays unedited because it names the classes only by count, the changelog records the change under `### Added`, and one test case pins the prose a static check can reach. Task 1 also shows the acceptance with a simulated validation of a fixture in a temporary directory.

Every command `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A step that ends in `wc -l` prints its count with leading spaces, and a `grep -c` that counts zero exits 1, so its pass is the printed count. Task 1's acceptance step is judged by hand and states why it fails at `base_commit`. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Add the read-back bullet and place its findings under Undetermined
  ```yaml
  description: "fc-validate's Accuracy list ends with the read-back bullet, and the Undetermined stop condition holds every read-back finding while the correction rule keeps its two stop conditions. Realises PLN-27-73ktx3 stage 1 (criteria 1 to 5 and 9)."
  pattern: "skills/fc-validate/SKILL.md"
  implement:
    - "In skills/fc-validate/SKILL.md, Part 2, under '### Accuracy', add PLN-27-73ktx3's Content specification row 1, verbatim, as the list's last bullet: directly after the bullet that ends 'Check it by reading that artefact.' and before the paragraph that begins 'You follow only the references the artefact itself makes.' Wrap it as the list's other bullets are wrapped, with continuation lines indented two spaces."
    - "In the same file, Part 4, under '### The two stop conditions', append row 2's sentence to the '**Undetermined.**' bullet, after 'Choosing one would be authoring, not correction.', on that bullet's continuation lines. The lead sentence that ends 'and there are no others.' and the '**Irreversible.**' bullet stay as they are."
  gotcha: "Row 1 keeps the workstream record's wording, 'carries one on a two-item list' included; change nothing in it but line breaks."
  verify:
    - "paste -sd ' ' skills/fc-validate/SKILL.md | tr -s ' ' | grep -oF -e 'A replacement text that reads wrong once applied, found by the read-back.' -e 'read the smallest enclosing unit as a reader would: a paragraph or list item in prose, a statement, block or function in code.' -e 'Do not compare the unit against what the artefact says it should say.' | wc -l  # expect 3; 0 at base_commit"
    - "paste -sd ' ' skills/fc-validate/SKILL.md | tr -s ' ' | grep -oF -e 'ends a list without its conjunction or carries one on a two-item list, or repeats inside the same unit what the unit already states.' -e 'calls with the wrong argument count, or holds a duplicated statement.' -e 'Name the unit and the defect in each finding.' | wc -l  # expect 3; 0 at base_commit"
    - "paste -sd ' ' skills/fc-validate/SKILL.md | tr -s ' ' | grep -oF -e 'The bound is that one unit only: not the section, not sibling files, and nothing the replacement does not touch.' -e 'A defect outside the unit, such as a contradiction with a paragraph the change never touches or a missed sibling file, is out of scope.' -e 'A read-back finding always reports and is never applied, because no file on disk proves what a file should hold after a change.' | wc -l  # expect 3; 0 at base_commit"
    - "awk '/^### Accuracy/{f=1;next} /^### Form/{f=0} f' skills/fc-validate/SKILL.md | paste -sd ' ' - | tr -s ' ' | grep -oF -e 'Check it by reading that artefact. - A replacement text that reads wrong once applied' -e 'what a file should hold after a change. You follow only the references the artefact itself makes.' | wc -l  # expect 2, so row 1 is the list's last bullet; 0 at base_commit"
    - "paste -sd ' ' skills/fc-validate/SKILL.md | tr -s ' ' | grep -oF 'Choosing one would be authoring, not correction. A read-back finding (Part 2, Accuracy) always meets this condition.' | wc -l  # expect 1; 0 at base_commit"
    - "paste -sd ' ' skills/fc-validate/SKILL.md | tr -s ' ' | grep -oF 'A finding reports instead of being fixed only when one of these holds, and there are no others.' | wc -l; awk '/^### The two stop conditions/{f=1;next} /^### Authoring within a fix/{f=0} f && /^- \\*\\*/' skills/fc-validate/SKILL.md | wc -l; awk '/^## 2\\. The four check classes/{f=1;next} /^## 3\\./{f=0} f && /^### /' skills/fc-validate/SKILL.md | wc -l  # expect 1, 2 and 4; the same at base_commit, so this step guards the kept lead sentence, the two stop conditions and the four classes, and cannot fail there"
    - "Acceptance (criterion 9), judged by hand: in a new directory from `mktemp -d`, run `git init -q`, write notes.md holding '# Notes', a blank line and 'The generator writes the index and the board.', then run `git add notes.md` and `git -c user.name=fixture -c user.email=fixture@example.invalid commit -qm fixture`. Write, untracked, PLN-1-aaaaaa-plan.md, a small plan whose one Must criterion and one stage say notes.md names the lease file among the files the generator writes, and TL-1-aaaaaa-tasklist.md, a diff-mode task list with base_commit the fixture HEAD, depends_on [PLN-1-aaaaaa], runtime none, e2e_tooling [] and test_commands [], whose one mini task realises that stage through the SEARCH line 'The generator writes the index and the board.', the REPLACE line 'The generator writes the index, the board, the lease file.' and the verify step `grep -c 'the lease file' notes.md`. Record `shasum -a 256` of the three files and `git status --porcelain`, validate the task list against the plan by following skills/fc-validate/SKILL.md as it now reads, then record both again. Expect the summary line 'Validated TL-1-aaaaaa. 0 fixes applied. 1 open findings.', one open finding naming the paragraph in notes.md and the list that ends without its conjunction, and identical checksums and status. At base_commit the Accuracy class holds no read-back bullet, so the same validation returns 0 open findings and this step fails there."
  checklist:
    - "source: the Accuracy list ends with row 1 word for word, between the bullet that ends 'Check it by reading that artefact.' and the paragraph 'You follow only the references the artefact itself makes.'"
    - "source: the Undetermined bullet ends with row 2's sentence, and the section holds exactly two bold-lead stop conditions, Irreversible and Undetermined, under a lead sentence that still says there are no others"
    - "source: Part 2 still holds exactly four class headings, Coverage, Invented content, Accuracy and Form, and no line of the file changes outside the Accuracy list and the Undetermined bullet"
    - "source: the acceptance validation in verify 7 returns the summary line 'Validated TL-1-aaaaaa. 0 fixes applied. 1 open findings.' and one open finding, a read-back finding that names the paragraph in notes.md and the list that ends without its conjunction"
    - "source: every fixture file's sha256 and the fixture's git status are identical before and after the acceptance validation in verify 7"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1, 2, 3 and 4 returned 3, 3, 3 and 2; lines 115 to 130 hold row 1 word for word once the line breaks are joined, directly after the bullet that ends 'Check it by reading that artefact.' and before the paragraph 'You follow only the references the artefact itself makes.'; its widest line is 88 columns"
      - result: YES
        measured: "source: verify 5 returned 1; verify 6 returned 1 for the lead sentence that says there are no others and 2 bold-lead bullets, Irreversible and Undetermined, in the stop-conditions section"
      - result: YES
        measured: "source: verify 6 returned 4 class headings in Part 2; git diff -U0 of the file shows two hunks only, 16 lines added after line 114 and the Undetermined bullet's last line rewrapped into two"
      - result: YES
        measured: "source: the fixture validation, following the edited skill, returned 'Validated TL-1-aaaaaa. 0 fixes applied. 1 open findings.' and one open finding: the one-sentence paragraph on line 3 of notes.md would read 'The generator writes the index, the board, the lease file.', a three-item list that ends without its conjunction; it reported under Undetermined and applied nothing. Coverage, Invented content, the other Accuracy checks and Form found nothing; the fixture HEAD matched base_commit a83785d, and the verify step grep -c 'the lease file' notes.md returned 0 with exit 1 at base_commit"
      - result: YES
        measured: "source: the sha256 of notes.md (787d4acf), PLN-1-aaaaaa-plan.md (8136d61b) and TL-1-aaaaaa-tasklist.md (d32e9b58) and git status --porcelain (the two untracked fixture artefacts) were identical before and after the validation; the fixture commit ran with -c commit.gpgsign=false added, because the global git settings sign every commit"
  ```

- [x] 2. Name the read-back in the description's Accuracy item
  ```yaml
  description: "The description's four-class parenthetical names the read-back in its Accuracy item, and templates/validate.md, which names the classes only by count, stays unedited. Realises PLN-27-73ktx3 stage 2 (criterion 6)."
  pattern: "skills/fc-validate/SKILL.md"
  implement:
    - "In skills/fc-validate/SKILL.md, frontmatter description, replace the Accuracy item 'accuracy of anchors, paths, counts and claims about other artefacts' with PLN-27-73ktx3's Content specification row 3, verbatim, and change nothing else on the line. Leave skills/flowcharge/templates/validate.md unedited (PLN-27-73ktx3, Design)."
  verify:
    - "grep -cF 'accuracy of anchors, paths, counts, claims about other artefacts and how a replacement text reads once applied, and form, meaning spelling' skills/fc-validate/SKILL.md  # expect 1; 0 at base_commit"
    - "grep -cF 'accuracy of anchors, paths, counts and claims about other artefacts' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
    - "grep -cF 'Checks four classes (coverage of the source, content with no source behind it, accuracy of' skills/fc-validate/SKILL.md  # expect 1; 1 at base_commit, so this step guards the class count in the description and cannot fail there"
    - "git diff --quiet 4e44975 -- skills/flowcharge/templates/validate.md && grep -cF \"check all four of the skill's classes\" skills/flowcharge/templates/validate.md  # expect exit 0 and 1; the same at base_commit, because the plan's Design leaves the stage file unedited, so this step cannot fail there"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: grep -cF of the new Accuracy item and the words after it returned 1"
      - item: "verify 2"
        result: YES
        measured: "source: grep -cF of the old Accuracy item returned 0"
      - item: "verify 3"
        result: YES
        measured: "source: grep -cF of the opening of the four-class parenthetical returned 1"
      - item: "verify 4"
        result: YES
        measured: "source: git diff --quiet against 4e44975 exited 0 for templates/validate.md and its grep -cF returned 1; git diff -U0 of SKILL.md against task 1's commit shows the description line as the only change, and the frontmatter still parses as YAML"
  ```

- [x] 3. Add the changelog entry
  ```yaml
  description: "CHANGELOG.md gains an Added section under ## Unreleased holding the read-back entry. Realises PLN-27-73ktx3 stage 3 (criterion 8)."
  pattern: "CHANGELOG.md"
  implement:
    - "In CHANGELOG.md, between the '## Unreleased' heading and its '### Changed' heading, add '### Added', a blank line, PLN-27-73ktx3's Content specification row 4 as one '- ' bullet wrapped at about 80 columns with two-space continuation lines like the file's other entries, and a blank line. No version heading or number changes."
  verify:
    - "awk '/^## /{n++} n==1' CHANGELOG.md | grep '^### '  # expect '### Added', '### Changed' and '### Fixed' in that order; '### Changed' and '### Fixed' at base_commit"
    - "paste -sd ' ' CHANGELOG.md | tr -s ' ' | grep -oF -e '- fc-validate reads a replacement text back in place.' -e 'It reports such a finding and never applies it.' | wc -l  # expect 2; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: the headings under ## Unreleased read ### Added, ### Changed and ### Fixed, in that order"
      - item: "verify 2"
        result: YES
        measured: "source: the count was 2; the bullet's five lines are 76, 75, 75, 76 and 65 columns wide, and git diff -U0 shows one hunk of 8 added lines with no release heading changed"
  ```

- [x] 4. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Update: no existing case reads the Accuracy list, the stop conditions or the description's class wording, the new text adds no path, spawn word, slot or bare product name for the docs-consistency and stage-file cases to flag, and '## 2. The four check classes', where the correction-direction pin ends its slice, stays. No existing case changes."
    - "Add (PLN-27-73ktx3 criterion 7): directly after the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file', a '// ---- case: ...' comment block in the style of the pins above it, then the case 'fc-validate carries the bounded read-back and reports its findings under Undetermined'. Read skills/fc-validate/SKILL.md through SKILLS_ROOT. Cut two slices by text, never by line number: from '### Accuracy' to the next '### Form', and from '### The two stop conditions' to the next '### Authoring within a fix'; assert each is non-empty, as the prompt-policy pin does, so the case cannot pass on an empty slice. With whitespace collapsed to single spaces, assert the Accuracy slice includes PLN-27-73ktx3's Content specification row 1, held whole in one constant so that every sentence of the bullet is pinned, and, as its own assertion, the report-only sentence 'A read-back finding always reports and is never applied, because no file on disk proves what a file should hold after a change.' Assert the stop-conditions slice includes 'and there are no others.' and 'A read-back finding (Part 2, Accuracy) always meets this condition.', and that its lines opening '- **' open with exactly '- **Irreversible.**' and '- **Undetermined.**', in that order. Assert the text from '## 2. The four check classes' to the next '## 3.' holds exactly the four '### ' headings Coverage, Invented content, Accuracy and Form. Assert the frontmatter description line includes 'Checks four classes (' and 'accuracy of anchors, paths, counts, claims about other artefacts and how a replacement text reads once applied'. Assert skills/flowcharge/templates/validate.md, whitespace collapsed, includes \"check all four of the skill's classes\". Every assertion message names the file and the text it did not find."
  verify:
    - "grep -cF \"testCase('fc-validate carries the bounded read-back and reports its findings under Undetermined'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: grep -cF of the case returned 1; the case and its READ_BACK_ constants sit directly after the git-ignored files pin, node --check of run-tests.mjs passes, and its constants match the edited SKILL.md while the bullet, the report-only sentence, the Undetermined sentence and the description item are absent from the SKILL.md at 4e44975"
  ```

- [x] 5. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: true
    test_run_result: passed
    test_run_baseline: []
    test_run_failures: []
    test_run_counts:
      - "node skills/flowcharge/scripts/test/run-tests.mjs: 325 passed, 0 failed"
  ```
