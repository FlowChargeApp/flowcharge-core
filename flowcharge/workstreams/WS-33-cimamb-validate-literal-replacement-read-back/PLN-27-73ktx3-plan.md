---
id: PLN-27-73ktx3
type: plan
workstream: WS-33-cimamb
slug: validate-literal-replacement-read-back
title: "Read a replacement text back in fc-validate's Accuracy class"
status: ready
created: 2026-10-27
updated: 2026-10-27
author: Anthony Koukoullis
base_commit: 4e44975
depends_on: []
links: []
---

# Read a replacement text back in fc-validate's Accuracy class

## Summary

- **Problem:** fc-validate checks the anchors, paths, counts and claims around a literal replacement text, but never reads the text as it will stand in its file, so defective wording passes validation.
- **For:** every validation of a plan or a task list that holds the exact text a file will carry after a change.
- **Success:** criterion 9.
- **Approach:** one bounded read-back bullet in the Accuracy class, its findings placed under Part 4's existing Undetermined condition, the description brought into agreement, one prose-pin test case and one changelog entry.
- **Top risk:** the read growing past the one enclosing unit into a review; the bullet carries the record's bound word for word (criterion 3).

## Scope

Acceptance criteria:

1. (Must) Where an artefact holds the exact text a file will carry after the change, the validator reads the target file at the anchor, applies the text mentally and reads the smallest enclosing unit as a reader would, without comparing the unit against what the artefact says it should say (Content specification, row 1).
2. (Must) The read-back reports the prose defects of the workstream record's item 2 and the code defects of its item 3, in the record's words, and each finding names the unit and the defect.
3. (Must) The read covers that one unit only, as the record's item 4 bounds it; a defect outside the unit is out of scope.
4. (Must) A read-back finding always reports and is never applied.
5. (Must) Part 4's Undetermined condition holds every read-back finding (Content specification, row 2), and the correction rule keeps exactly its two stop conditions and still says there are no others.
6. (Must) Every statement of what the Accuracy class covers agrees with the read-back bullet: the description's Accuracy item names it (Content specification, row 3), and the class count stays four in the description, in Part 2 and in `skills/flowcharge/templates/validate.md`.
7. (Must) A test case pins what a static check can (Testing strategy).
8. (Must) `CHANGELOG.md` carries Content specification row 4 under `## Unreleased`.
9. (Must) Validating a task list whose REPLACE block ends a three-item list without its conjunction reports one read-back finding naming the unit and the defect, and changes no file.

Out of scope, per the workstream record: a new stage, subagent spawn or command; a post-execution validation stage; any check of code an executor produced; any read beyond the one unit. Also out of scope: the description's closing sentence, which says what the skill never judges and states no class's coverage; the released entries in `CHANGELOG.md`; the suite version stamps and the version number, which a release decides (`VERSIONING.md`).

Assumptions:

- No file other than `skills/fc-validate/SKILL.md` restates the Accuracy coverage: `skills/flowcharge/templates/validate.md`, `skills/flowcharge/SKILL.md`, `skills/flowcharge/CONVENTIONS.md`, `README.md`, the other skills and `run-tests.mjs` name fc-validate's checks in general terms or not at all.
- The record's items 1 to 5 are carried word for word; only their third-person verbs take the skill's imperative voice.
- The read-back is a new capability, so its changelog entry goes under `### Added`, placed before `### Changed` as in the 0.5.0 release.

## Design

- `skills/fc-validate/SKILL.md:102-118`, Part 2, Accuracy: row 1 becomes the list's last bullet, after the bullet on statements about another artefact and before the paragraph on following only the artefact's own references. Criteria 1 to 4.
- `skills/fc-validate/SKILL.md:224-236`, Part 4, The two stop conditions: row 2 ends the Undetermined bullet. The lead sentence and the Irreversible bullet stay as they are. Criterion 5.
- `skills/fc-validate/SKILL.md:3`, the frontmatter `description`: the Accuracy item of the four-class parenthetical becomes row 3, and nothing else in the description changes. Criterion 6.
- `skills/flowcharge/templates/validate.md:19-21`: unedited. It names the classes only by count, reaches a target file through "following only the references the artefact itself makes", and reports only what the correction rule says to report, so it agrees with rows 1 and 2. Criterion 6.
- `CHANGELOG.md:14-16`: a `### Added` section holding row 4 sits between `## Unreleased` and `### Changed`, wrapped at about 80 columns like the file's other entries. Criterion 8.
- `skills/flowcharge/scripts/test/run-tests.mjs`: one case directly after the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file' (`:5788`), built on the slice-and-guard pattern of the prompt-policy pin (`:5688-5712`). Criterion 7.

## Content specification

`skills/fc-validate/SKILL.md`:

| Element | Exact value | Rationale |
|---|---|---|
| Row 1: the read-back bullet, after its `- ` marker | A replacement text that reads wrong once applied, found by the read-back. Where an artefact holds the exact text a file will carry after the change (a REPLACE block in a task, or a quoted after-text in a plan's Design), read the target file at the anchor, apply the text mentally, and read the smallest enclosing unit as a reader would: a paragraph or list item in prose, a statement, block or function in code. Do not compare the unit against what the artefact says it should say. In prose, report a sentence that is ungrammatical, disagrees in number, ends a list without its conjunction or carries one on a two-item list, or repeats inside the same unit what the unit already states. In code, report a unit that does not parse as a unit, has unbalanced braces or indentation, uses a name not defined in the unit, calls with the wrong argument count, or holds a duplicated statement. Name the unit and the defect in each finding. The bound is that one unit only: not the section, not sibling files, and nothing the replacement does not touch. A defect outside the unit, such as a contradiction with a paragraph the change never touches or a missed sibling file, is out of scope. A read-back finding always reports and is never applied, because no file on disk proves what a file should hold after a change. | The record's items 1 to 5 word for word, under the voice assumption; the naming sentence carries criterion 9. |
| Row 2: the sentence that ends the Undetermined bullet | A read-back finding (Part 2, Accuracy) always meets this condition. | Places the finding under the existing condition and adds no third one. |
| Row 3: the description's Accuracy item | accuracy of anchors, paths, counts, claims about other artefacts and how a replacement text reads once applied | Keeps the description's own wording and adds the read-back. |

`CHANGELOG.md`:

| Element | Exact value | Rationale |
|---|---|---|
| Row 4: the `### Added` bullet, after its `- ` marker | fc-validate reads a replacement text back in place. Where a plan or a task list holds the exact text a file will carry after a change, the validator reads the smallest unit that encloses it as a reader would, and reports a defect there, such as a list that lost its conjunction or a code unit that does not parse. It reports such a finding and never applies it. | Under the changelog assumption. |

## Stages

### Stage 1: the read-back bullet and its report-only placement

- **Goal:** criteria 1 to 5 and 9.
- **Position:** first, because Stages 2 and 3 restate it.
- **Observable:** criterion 9 holds against the edited skill.

### Stage 2: every statement of the Accuracy coverage agrees

- **Goal:** criterion 6.
- **Position:** second; it restates Stage 1's bullet.
- **Observable:** criterion 6.

### Stage 3: record the change

- **Goal:** criterion 8.
- **Position:** last; it describes Stages 1 and 2.
- **Observable:** criterion 8.

## Testing strategy

- `skills/flowcharge/scripts/test/run-tests.mjs`, one static case, 'fc-validate carries the bounded read-back and reports its findings under Undetermined', proving criteria 1 to 6 as prose: row 1's sentences inside the slice from `### Accuracy` to `### Form`; row 2, the two bold-lead stop conditions and "there are no others" inside the slice from `### The two stop conditions` to `### Authoring within a fix`; exactly four `### ` headings in Part 2; row 3 and "Checks four classes" in the description; "all four of the skill's classes" in `templates/validate.md`. Each slice has an empty-slice guard, and whitespace is collapsed before each containment check, because the prose wraps.
- Criterion 9 is not pinned by the suite, because no script runs a validation. Stage 1's task shows it with a simulated validation of a fixture in a temporary directory, compared by checksum before and after.
- The full suite runs in the test-run task.

## Alternatives considered and rejected

- A fifth check class for the read-back: the record keeps the count at four, and reading cited text at its anchor is Accuracy's work.
- A third stop condition: the correction rule holds exactly two, and Undetermined already covers a finding whose correct content no evidence determines.
- A copy of the bullet in `templates/validate.md`: the stage file defers every class to the skill, and a second copy is one more statement to keep in agreement.
- A read of the whole section or file: the record bounds the read to the smallest enclosing unit, and a wider read becomes a review.
- A suite case that runs the read-back: no script runs a validation, so the suite pins the prose and a simulated validation shows the behaviour.
