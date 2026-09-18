---
id: TL-13-5l5my6
type: tasklist
workstream: WS-13-ywk08u
slug: skill-instructions-init-flag-gap
title: "Skill instructions init-flag gap fix"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: [IL-4-qhdkzx]
links: []
mode: diff
base_commit: f53832f
---

# FlowCharge Tasks

## skill-instructions-init-flag-gap

`skills/flowcharge/SKILL.md`'s "Start of run" bullet, in the "FlowCharge Core
upkeep" section, tells an agent handling a missing `flowcharge/` folder to
create it by hand plus a zeroed `ids.md`. `fc-index.mjs --init` already does
the folder-creation part of that correctly and idempotently, but the
instruction never mentions the flag, so an agent following it takes the
stale manual path instead. The instruction's claim about `ids.md` is also
wrong: `--init` never creates `ids.md`, and a fresh `--init` prints the WARN
`flowcharge/ids.md missing: create it before allocating new IDs`; that file is
seeded lazily by the first `--new-ws` or `--claim` run (both share
`writeRegistryBack` in `fc-index.mjs`), and in this bullet's own flow the
`--new-ws` run that follows `--init` is what seeds it. One task corrects the
single sentence at lines 699-700 of `skills/flowcharge/SKILL.md` to direct the
missing-folder case to `fc-index.mjs --init`, to say the WARN needs no by-hand
action, and to state `ids.md`'s real, separate lazy-creation behaviour instead
of the inaccurate claim.

- [x] 1. Point the "Start of run" missing-`flowcharge/`-folder case at `fc-index.mjs --init` and correct the `ids.md` claim

  ```yaml
  description: "Replace SKILL.md's stale manual-creation instruction with a direction to run fc-index.mjs --init, say what --init creates and that its ids.md-missing WARN needs no by-hand action, and correct the inaccurate claim that this step creates ids.md: the --new-ws run that follows (like --claim) seeds it."
  author: Anthony Koukoullis
  issues: [ISS-8-1zjdxx]
  implement:
    - |
      skills/flowcharge/SKILL.md
      <<<<<<< SEARCH
        the folder was created. If `flowcharge/` itself is missing, create it plus a zeroed `ids.md`
        first. Once the workstream folder exists, acquire its lease before any artefact
      =======
        the folder was created. If `flowcharge/` itself is missing, run
        `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --init`
        first: it creates `flowcharge/workstreams/` and, transitively, `flowcharge/`, and is
        a no-op when they already exist. `--init` does not create `ids.md`, and its WARN that
        `ids.md` is missing needs no action here: the `--new-ws` run that follows seeds
        `ids.md`, as `--claim` does (CONVENTIONS.md, IDs: Registry). Once the workstream
        folder exists, acquire its lease before any artefact
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/SKILL.md"
  imports: "None"
  compatibility: "Must stay generic per DEVELOPMENT.md's portability rule: no harness-specific tool names, plain node/CLI invocation only, matching the file's existing citation style for CONVENTIONS.md (e.g. line 673's \"CONVENTIONS.md, `workstream` body\"; here the IDs section's Registry paragraph). Every factual claim in the REPLACE text is verified against fc-index.mjs at f53832f: --init runs fs.mkdirSync(wsRoot, { recursive: true }) and nothing else before the normal regenerate (line 280); the WARN comes from line 1432 and fires on a fresh --init; ids.md is written only by writeRegistryBack (lines 1155-1188), which both --claim and --new-ws call."
  gotcha: "The SEARCH text is the two whole source lines 699-700, each with the bullet's 2-space continuation indent; match them exactly, including that indent, or the block will not apply. The REPLACE keeps line 699's leading clause ('the folder was created.') and line 700's trailing clause ('Once the workstream folder exists, acquire its lease before any artefact') verbatim, re-wrapped; do not alter or drop them, and do not touch any other sentence in the bullet. Do not write '--claim seeds it' alone: in this bullet's flow the next command is --new-ws, which seeds ids.md the same way, and naming only --claim would send an agent to run a spurious --claim or create ids.md by hand."
  verify:
    - "grep -c -- '--init' skills/flowcharge/SKILL.md (base_commit f53832f: 0; must be >=1 after the edit)"
    - "grep -c 'create it plus a zeroed' skills/flowcharge/SKILL.md (base_commit f53832f: 1; must be 0 after the edit)"
    - "grep -c -- 'the `--new-ws` run that follows seeds' skills/flowcharge/SKILL.md (base_commit f53832f: 0; must be 1 after the edit)"
    - "grep -c 'the folder was created. If `flowcharge/` itself is missing, run' skills/flowcharge/SKILL.md (base_commit f53832f: 0; must be 1 after the edit: proves line 699's leading clause survived)"
    - "grep -c 'folder exists, acquire its lease before any artefact' skills/flowcharge/SKILL.md (base_commit f53832f: 1; must still be 1 after the edit: proves line 700's trailing clause survived)"
    - "node skills/flowcharge/scripts/test/run-tests.mjs (base_commit f53832f: 264/264 cases pass; this is a regression backstop only — no existing docs-consistency rule covers this sentence, so it passes both before and after and cannot discriminate the fix itself. Confirm it still reads 264/264 after the edit.)"
  checklist:
    - "Does skills/flowcharge/SKILL.md line 699's bullet now name fc-index.mjs --init as the command for a missing flowcharge/ folder, and say what it creates?"
    - "Is the claim that this step creates a zeroed ids.md removed, replaced with the accurate statement that --init does not create ids.md, that its ids.md-missing WARN needs no action, and that the --new-ws run that follows (like --claim) seeds it?"
    - "Does grep -c 'create it plus a zeroed' skills/flowcharge/SKILL.md return 0?"
    - "Do line 699's leading clause and line 700's trailing clause survive verbatim, and is no other sentence in the 'Start of run' bullet changed?"
    - "Does node skills/flowcharge/scripts/test/run-tests.mjs still report 264/264 cases passed?"
  self_eval:
    passed: true
    failures: []
  ```
