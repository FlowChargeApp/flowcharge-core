---
id: TL-6-dqaoqc
type: tasklist
workstream: WS-7-boovu9
slug: author-field-schema-mismatch
title: "Author-field schema mismatch: fixes"
status: ready
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: [IL-3-fd2plh]
links: []
mode: diff
base_commit: 2ba5fae
---

# FlowCharge Tasks

## Author-field schema mismatch: fixes

Four of the FlowCharge Core suite's own authoring templates and one skill file's own
documented example omit the `author` frontmatter key that CONVENTIONS.md requires on
every plan, issue-list, and task-list artefact. Each task below adds the missing
`author` key (or the instruction naming it) to exactly the file and location its
issue identifies, in the same position CONVENTIONS.md's canonical frontmatter block
and `fc-task-list/SKILL.md`'s own tasklist example already use: immediately after
`updated`, before `depends_on`.

- [x] 1. Add the missing `author` key to create-plan.md's plan frontmatter template
  ```yaml
  description: "skills/flowcharge/templates/create-plan.md's plan frontmatter YAML block lists id, type, workstream, slug, title, status, created, updated, depends_on, links with no author. Add author immediately after updated, before depends_on, sourced the same way created/updated already are."
  author: Anthony Koukoullis
  issues: [ISS-4-n2rzx3]
  implement:
    - |
      skills/flowcharge/templates/create-plan.md
      <<<<<<< SEARCH
      updated: <same>
      depends_on: []
      =======
      updated: <same>
      author: <from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section>
      depends_on: []
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/templates/create-plan.md"
  imports: "None"
  compatibility: "Position matches CONVENTIONS.md's canonical frontmatter block (author immediately after updated, before depends_on) and fc-plan-feature/SKILL.md's own requirement that plan frontmatter carry author."
  gotcha: "Add only the one author line; do not touch any other key or the 'Flat keys and inline arrays only' note on the following line."
  verify:
    - "node skills/flowcharge/scripts/test/run-tests.mjs"
    - "sed -n '24,37p' skills/flowcharge/templates/create-plan.md | grep -c '^author:' — must print 1 (printed 0 at base_commit 2ba5fae)"
  checklist:
    - "The block applied cleanly with no conflict markers left in the file"
    - "author sits on its own line immediately after updated and before depends_on"
    - "No other line in the file changed"
    - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
  self_eval:
    passed: true
    failures: []
  ```
- [x] 2. Add the missing `author` key to create-issues.md's frontmatter instruction
  ```yaml
  description: "skills/flowcharge/templates/create-issues.md line 19, the issuelist frontmatter instruction, lists id, type: issuelist, workstream, slug, status, created/updated with no author. Add author to that sentence, sourced the same way as task 1."
  author: Anthony Koukoullis
  issues: [ISS-5-7sal1s]
  implement:
    - |
      skills/flowcharge/templates/create-issues.md
      <<<<<<< SEARCH
      The file must open with frontmatter per the skill, with `id: <the IL ID you claim below>`, `type: issuelist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, and today's date (from `date +%F`) in `created`/`updated`. Flat keys and inline arrays only.
      =======
      The file must open with frontmatter per the skill, with `id: <the IL ID you claim below>`, `type: issuelist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, and `author` (from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section). Flat keys and inline arrays only.
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/templates/create-issues.md"
  imports: "None"
  compatibility: "Matches CONVENTIONS.md's requirement that issuelist frontmatter carry author, and the value-sourcing pattern used in task 1."
  gotcha: "This is a single prose sentence, not a YAML block; keep the rest of the sentence and the trailing 'Flat keys and inline arrays only.' unchanged."
  verify:
    - "node skills/flowcharge/scripts/test/run-tests.mjs"
    - "sed -n '19p' skills/flowcharge/templates/create-issues.md | grep -c 'author' — must print 1 (printed 0 at base_commit 2ba5fae)"
  checklist:
    - "The block applied cleanly with no conflict markers left in the file"
    - "Line 19 now names author alongside id, type, workstream, slug, status, created/updated"
    - "No other line in the file changed"
    - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
  self_eval:
    passed: true
    failures: []
  ```
- [x] 3. Add the missing `author` key to fc-issue-list/SKILL.md's documented frontmatter example
  ```yaml
  description: "skills/fc-issue-list/SKILL.md's 'File frontmatter' example block omits author at the issuelist level, even though the same file documents per-issue author correctly elsewhere. Add author to the example, in the position fc-task-list/SKILL.md's equivalent tasklist example already uses."
  author: Anthony Koukoullis
  issues: [ISS-6-nr0bag]
  implement:
    - |
      skills/fc-issue-list/SKILL.md
      <<<<<<< SEARCH
      updated: 2026-07-29
      depends_on: []
      links: []
      ---
      ```

      - `id`: an `IL-N-SUFFIX` claimed from the registry (see Issue IDs below, same procedure, `IL` counter)
      =======
      updated: 2026-07-29
      author: Ada Lovelace
      depends_on: []
      links: []
      ---
      ```

      - `id`: an `IL-N-SUFFIX` claimed from the registry (see Issue IDs below, same procedure, `IL` counter)
      >>>>>>> REPLACE
  pattern: "skills/fc-issue-list/SKILL.md"
  imports: "None"
  compatibility: "Matches CONVENTIONS.md's canonical frontmatter block and fc-task-list/SKILL.md's own tasklist example: author immediately after updated, before depends_on, using the same placeholder name (Ada Lovelace) fc-task-list/SKILL.md's example uses."
  gotcha: "The two-line anchor `updated: 2026-07-29` / `depends_on: []` is already unique: each of those lines occurs exactly once in the file (lines 50 and 51 at base_commit 2ba5fae). The file has only one frontmatter-shaped example; the completed-issue example further down (lines 115-130) is a per-issue YAML block that carries neither key, so it cannot collide. The extra trailing context (the closing fence and the following `id:` bullet) is therefore harmless but not required; do not let it change anything past the author line."
  verify:
    - "node skills/flowcharge/scripts/test/run-tests.mjs"
    - "sed -n '42,55p' skills/fc-issue-list/SKILL.md | grep -c '^author:' — must print 1 (printed 0 at base_commit 2ba5fae)"
  checklist:
    - "The block applied cleanly with no conflict markers left in the file"
    - "author: Ada Lovelace sits immediately after updated and before depends_on in the File frontmatter example"
    - "No other line in the file changed, including the per-issue author documentation at line 140 at base_commit (line 141 once the author line is inserted above it)"
    - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
  self_eval:
    passed: true
    failures: []
  ```
- [ ] 4. Add the missing `author` key to the four tasks-from-plan/tasks-from-issues templates' frontmatter instructions

  ```yaml
  description: "skills/flowcharge/templates/tasks-from-plan-spec.md, tasks-from-plan-diff.md, tasks-from-issues-spec.md, and tasks-from-issues-diff.md each state their frontmatter instruction at line 18 without mentioning author. Fix each file individually."
  ```

  - [ ] 4.1 Add the missing `author` key to tasks-from-plan-spec.md's frontmatter instruction
    ```yaml
    description: "skills/flowcharge/templates/tasks-from-plan-spec.md line 18 lists id, type: tasklist, workstream, slug, status: ready, created/updated, and depends_on with no author. Add author, sourced the same way as task 1."
    author: Anthony Koukoullis
    issues: [ISS-7-40lthe]
    implement:
      - |
        skills/flowcharge/templates/tasks-from-plan-spec.md
        <<<<<<< SEARCH
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, and `depends_on: [<the plan's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        =======
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, `author` (from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section), and `depends_on: [<the plan's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/tasks-from-plan-spec.md"
    imports: "None"
    compatibility: "Matches CONVENTIONS.md's requirement that tasklist frontmatter carry author, and the value-sourcing pattern used in task 1."
    gotcha: "Keep the rest of the sentence, including the trailing 'Flat keys and inline arrays only.', unchanged."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '18p' skills/flowcharge/templates/tasks-from-plan-spec.md | grep -c 'author' — must print 1 (printed 0 at base_commit 2ba5fae)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "Line 18 now names author alongside the other frontmatter keys"
      - "No other line in the file changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.2 Add the missing `author` key to tasks-from-plan-diff.md's frontmatter instruction
    ```yaml
    description: "skills/flowcharge/templates/tasks-from-plan-diff.md line 18 lists id, type: tasklist, workstream, slug, status: ready, created/updated, and depends_on with no author. Add author, sourced the same way as task 1."
    author: Anthony Koukoullis
    issues: [ISS-7-40lthe]
    implement:
      - |
        skills/flowcharge/templates/tasks-from-plan-diff.md
        <<<<<<< SEARCH
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, and `depends_on: [<the plan's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        =======
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, `author` (from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section), and `depends_on: [<the plan's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/tasks-from-plan-diff.md"
    imports: "None"
    compatibility: "Matches CONVENTIONS.md's requirement that tasklist frontmatter carry author, and the value-sourcing pattern used in task 1."
    gotcha: "Keep the rest of the sentence, including the trailing 'Flat keys and inline arrays only.', unchanged."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '18p' skills/flowcharge/templates/tasks-from-plan-diff.md | grep -c 'author' — must print 1 (printed 0 at base_commit 2ba5fae)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "Line 18 now names author alongside the other frontmatter keys"
      - "No other line in the file changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.3 Add the missing `author` key to tasks-from-issues-spec.md's frontmatter instruction
    ```yaml
    description: "skills/flowcharge/templates/tasks-from-issues-spec.md line 18 lists id, type: tasklist, workstream, slug, status: ready, created/updated, and depends_on with no author. Add author, sourced the same way as task 1."
    author: Anthony Koukoullis
    issues: [ISS-7-40lthe]
    implement:
      - |
        skills/flowcharge/templates/tasks-from-issues-spec.md
        <<<<<<< SEARCH
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, and `depends_on: [<the issue list's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        =======
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, `author` (from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section), and `depends_on: [<the issue list's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/tasks-from-issues-spec.md"
    imports: "None"
    compatibility: "Matches CONVENTIONS.md's requirement that tasklist frontmatter carry author, and the value-sourcing pattern used in task 1."
    gotcha: "Keep the rest of the sentence, including the trailing 'Flat keys and inline arrays only.', unchanged."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '18p' skills/flowcharge/templates/tasks-from-issues-spec.md | grep -c 'author' — must print 1 (printed 0 at base_commit 2ba5fae)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "Line 18 now names author alongside the other frontmatter keys"
      - "No other line in the file changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.4 Add the missing `author` key to tasks-from-issues-diff.md's frontmatter instruction
    ```yaml
    description: "skills/flowcharge/templates/tasks-from-issues-diff.md line 18 lists id, type: tasklist, workstream, slug, status: ready, created/updated, and depends_on with no author. Add author, sourced the same way as task 1."
    author: Anthony Koukoullis
    issues: [ISS-7-40lthe]
    implement:
      - |
        skills/flowcharge/templates/tasks-from-issues-diff.md
        <<<<<<< SEARCH
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, and `depends_on: [<the issue list's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        =======
        The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, `author` (from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section), and `depends_on: [<the issue list's ID from its own frontmatter>]`. Flat keys and inline arrays only.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/tasks-from-issues-diff.md"
    imports: "None"
    compatibility: "Matches CONVENTIONS.md's requirement that tasklist frontmatter carry author, and the value-sourcing pattern used in task 1."
    gotcha: "Keep the rest of the sentence, including the trailing 'Flat keys and inline arrays only.', unchanged."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '18p' skills/flowcharge/templates/tasks-from-issues-diff.md | grep -c 'author' — must print 1 (printed 0 at base_commit 2ba5fae)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "Line 18 now names author alongside the other frontmatter keys"
      - "No other line in the file changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: false
      failures: []
    ```

## Skipped

None. All four open issues in IL-3-fd2plh describe an existing template or documented
example disagreeing with CONVENTIONS.md's own stated schema (a correction to text that
already exists), not new functionality, so every one of them was tasked.
