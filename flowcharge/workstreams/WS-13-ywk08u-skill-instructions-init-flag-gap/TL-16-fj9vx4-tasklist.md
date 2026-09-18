---
id: TL-16-fj9vx4
type: tasklist
workstream: WS-13-ywk08u
slug: skill-instructions-init-flag-gap
title: "fc-issue-list workstream-folder creation instruction fix"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: [IL-5-snfkoy]
links: []
mode: diff
base_commit: 8220a77
---

# FlowCharge Tasks

## skill-instructions-init-flag-gap

`skills/fc-issue-list/SKILL.md` line 29 tells an agent that, when
`flowcharge/` or the workstream folder is missing, it should "create them" as
a single undifferentiated instruction. This conflates two different creation
targets: `flowcharge/` itself, which `fc-index.mjs --init` creates
idempotently, and the workstream folder, which `fc-index.mjs --new-ws`
creates, never `--init`. An agent reading "create them" has no reason to
reach for either flag and instead hand-creates the folder, the same class of
defect already corrected elsewhere in this workstream for
`skills/flowcharge/SKILL.md`'s "Start of run" bullet (ISS-8-1zjdxx). One task
splits the single "create them" clause into two accurate clauses, one per
command, leaving the rest of the sentence untouched.

- [x] 1. Split the `flowcharge/`/workstream-folder "create them" clause into separate `--init` and `--new-ws` directions

  ```yaml
  description: "Replace the single 'create them' instruction in fc-issue-list/SKILL.md's target-file-creation sentence with two accurate clauses: flowcharge/-folder creation directed at fc-index.mjs --init, workstream-folder creation directed at fc-index.mjs --new-ws, leaving the file's own no-issues-yet clause and the workstream.md-record clause unchanged."
  author: Anthony Koukoullis
  issues: [ISS-9-vsdlvd]
  implement:
    - |
      skills/fc-issue-list/SKILL.md
      <<<<<<< SEARCH
      If the target file does not exist, create it with frontmatter and the heading only (no issues) before adding the first issue. If `flowcharge/` or the workstream folder is missing, create them; a new workstream also needs a `workstream.md` record (see CONVENTIONS.md).
      =======
      If the target file does not exist, create it with frontmatter and the heading only (no issues) before adding the first issue. If `flowcharge/` is missing, run `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --init` to create it. If the workstream folder is missing, run `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>"` to create it; a new workstream also needs a `workstream.md` record (see CONVENTIONS.md).
      >>>>>>> REPLACE
  pattern: "skills/fc-issue-list/SKILL.md"
  imports: "None"
  compatibility: "Must stay generic per DEVELOPMENT.md's portability rule: plain node/CLI invocation only, no harness-specific tool names, matching the accurate --new-ws invocation form already used at skills/fc-plain-text-kanban/SKILL.md line 31 and the --init citation style used in TL-13-5l5my6 task 1's fix to skills/flowcharge/SKILL.md."
  gotcha: "The SEARCH text is the whole single-line paragraph at line 29; match it exactly, including the two backtick-quoted terms and the trailing CONVENTIONS.md parenthetical. Do not alter the leading 'create it with frontmatter and the heading only (no issues) before adding the first issue' sentence, and do not alter or drop the trailing 'a new workstream also needs a workstream.md record (see CONVENTIONS.md)' clause: both stay exactly as they are per the confirmed finding. Only the 'create them' clause is being split into two accurate directions."
  verify:
    - "grep -c 'create them' skills/fc-issue-list/SKILL.md (base_commit 8220a77: 1; must be 0 after the edit)"
    - "grep -c -- '--init' skills/fc-issue-list/SKILL.md (base_commit 8220a77: 0; must be >=1 after the edit)"
    - "grep -c -- '--new-ws' skills/fc-issue-list/SKILL.md (base_commit 8220a77: 0; must be >=1 after the edit)"
    - "grep -c 'create it with frontmatter and the heading only' skills/fc-issue-list/SKILL.md (base_commit 8220a77: 1; must still be 1 after the edit: proves the file's own no-issues-yet clause survived unaltered)"
    - "grep -c 'a new workstream also needs a' skills/fc-issue-list/SKILL.md (base_commit 8220a77: 1; must still be 1 after the edit: proves the workstream.md-record clause survived unaltered)"
    - "node skills/flowcharge/scripts/test/run-tests.mjs (base_commit 8220a77: 256/256 cases pass; this is a regression backstop only, no existing docs-consistency rule covers this sentence, so it passes both before and after and cannot discriminate the fix itself. Confirm it still reads 256/256 after the edit.)"
  checklist:
    - "Does skills/fc-issue-list/SKILL.md line 29 now name fc-index.mjs --init as the command for a missing flowcharge/ folder?"
    - "Does the same line separately name fc-index.mjs --new-ws as the command for a missing workstream folder?"
    - "Does grep -c 'create them' skills/fc-issue-list/SKILL.md return 0?"
    - "Do the file's leading no-issues-yet clause and trailing workstream.md-record clause survive verbatim, with no other sentence in the paragraph changed?"
    - "Does node skills/flowcharge/scripts/test/run-tests.mjs still report 256/256 cases passed?"
  self_eval:
    passed: true
    failures: []
  ```
