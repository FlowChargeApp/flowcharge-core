---
id: WS-33-cimamb
type: workstream
workstream: WS-33-cimamb
slug: validate-literal-replacement-read-back
title: "The validator never reads a replacement text back, so defective wording reaches the file"
status: done
tags: [quality, correctness, prompts, feature]
created: 2026-10-27
updated: 2026-10-27
author: Anthony Koukoullis
depends_on: []
links: []
---
`fc-validate` checks the anchors, paths, counts and claims around a literal replacement text, but never reads the replacement text itself the way a reader would once it is applied. An ungrammatical sentence, a number that no longer agrees, a list that lost its conjunction, or a line that repeats what its own paragraph already states passes validation and reaches the file.

Required change: add one bounded read-back bullet to the Accuracy class in `skills/fc-validate/SKILL.md`. No new stage, no new subagent spawn and no command.

1. Where an artefact holds the exact text a file will carry after the change (a REPLACE block in a task, or a quoted after-text in a plan's Design), the validator reads the target file at the anchor, applies the text mentally, and reads the smallest enclosing unit as a reader would: a paragraph or list item in prose, a statement, block or function in code. It does not compare the unit against what the artefact says it should say.
2. Prose branch: report a sentence that is ungrammatical, disagrees in number, ends a list without its conjunction or carries one on a two-item list, or repeats inside the same unit what the unit already states.
3. Code branch: report a unit that does not parse as a unit, has unbalanced braces or indentation, uses a name not defined in the unit, calls with the wrong argument count, or holds a duplicated statement.
4. The bound is that one unit only: not the section, not sibling files, and nothing the replacement does not touch. A defect outside the unit, such as a contradiction with a paragraph the change never touches or a missed sibling file, is out of scope.
5. A read-back finding always reports and is never applied, because no file on disk proves what a file should hold after a change. The correction rule in `skills/fc-validate/SKILL.md` keeps exactly its two stop conditions, so the text places a read-back finding under the existing "Undetermined" condition and adds no third condition.
6. The validate stage file `skills/flowcharge/templates/validate.md`, the skill description and every other statement of what the Accuracy class covers agree with the new bullet. The class count stays at four.
7. A test case pins whatever a test can pin, such as the new bullet and its report-only sentence being present.
8. `CHANGELOG.md` gets an entry. The version is decided at release, per `VERSIONING.md`.

Acceptance: validating a task list whose REPLACE block ends a three-item list without its conjunction reports one read-back finding naming the unit and the defect, and changes no file.

Out of scope: a post-execution validation stage, any check of code an executor produced, and any read beyond the one unit.
