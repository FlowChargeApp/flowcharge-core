---
id: TL-3-ycaucg
type: tasklist
workstream: WS-3-t2lfk1
slug: branch-name-ws-prefix
title: "Prefix FlowCharge Core branch names with the workstream code"
status: done
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: [PLN-2-25o0ic]
links: []
mode: diff
base_commit: 7ef1ae1
---

# FlowCharge Tasks

## Prefix FlowCharge Core branch names with the workstream code

Implements PLN-2-25o0ic. A branch cut for a FlowCharge Core workstream currently
carries only a bare slug (`feature/<slug>`), unlike the
`flowcharge/workstreams/WS-N-SUFFIX-<slug>/` folder it belongs to. This task list
adds the workstream code to the branch name — `feature/<WS-N-SUFFIX>-<slug>` — by
editing the two places branch names are decided: `skills/fc-git/SKILL.md`'s
Branching section (the convention fc-git itself follows when asked to cut a
branch directly) and `skills/flowcharge/SKILL.md`'s hard rule 11 (the convention
the flowcharge orchestrator follows when it auto-cuts a branch before a run's
first execute-tasks or commit). Both files change together, in one stage, so
they never disagree. Both target files matched the plan's assumptions
byte-for-byte at `base_commit` 7ef1ae1 — no divergence to record.

- [x] 1. Prefix the branch name in both skill files together
  ```yaml
  description: "Add the workstream-ID-prefixed branch name convention to fc-git/SKILL.md's Branching section and flowcharge/SKILL.md's hard rule 11, so a branch cut for a FlowCharge Core workstream is named feature/<WS-N-SUFFIX>-<slug> in both places."
  ```

  - [x] 1.1 Add the FlowCharge Core workstreams bullet to fc-git/SKILL.md's Branching section
    ```yaml
    description: "Add a new bullet after the Naming paragraph in fc-git/SKILL.md's Branching section, prefixing a workstream-driven branch name with the WS-N-SUFFIX ID ahead of the description, mirroring the Committing section's existing FlowCharge Core artefacts bullet."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-git/SKILL.md
        <<<<<<< SEARCH
        Naming: follow the repo's existing convention (detect from `git branch -a`);
        otherwise `feature/`, `fix/`, `chore/` prefixes. Delete merged branches only with
        confirmation, and prefer `git branch -d` (refuses if unmerged) over `-D`.

        ### Merging & rebasing
        =======
        Naming: follow the repo's existing convention (detect from `git branch -a`);
        otherwise `feature/`, `fix/`, `chore/` prefixes. Delete merged branches only with
        confirmation, and prefer `git branch -d` (refuses if unmerged) over `-D`.

        FlowCharge Core workstreams: when the branch is cut for work that traces to
        a FlowCharge Core workstream identifiable in context (`WS-N-SUFFIX`) — the
        same "in context" test the Committing section's FlowCharge Core artefacts
        rule uses — prefix the chosen name with that workstream's ID ahead of the
        description: `feature/WS-3-t2lfk1-branch-name-ws-prefix`, matching the
        `flowcharge/workstreams/WS-N-SUFFIX-<slug>/` folder convention. Work that
        isn't workstream-driven keeps the bare form above — never invent or hunt
        for an ID.

        ### Merging & rebasing
        >>>>>>> REPLACE
    pattern: "skills/fc-git/SKILL.md, Branching section"
    imports: "None."
    compatibility: "PLN-2-25o0ic Design, 'fc-git/SKILL.md, Branching section (currently lines 139–151)' — one new bullet, no new mechanism; the generic example command block stays the placeholder it already is."
    gotcha: "SEARCH must match the Naming paragraph through the '### Merging & rebasing' heading exactly, or the block will not apply. Leave the generic `git switch -c feature/<short-description>` example (line 146) and the two unrelated feature/x mentions (line 25's merge example, line 164's merge-style example) untouched."
    verify:
      - "grep -c 'FlowCharge Core workstreams:' skills/fc-git/SKILL.md   # expect 1 (measured 0 at base_commit 7ef1ae1)"
      - "grep -c 'feature/WS-3-t2lfk1-branch-name-ws-prefix' skills/fc-git/SKILL.md   # expect 1 (measured 0 at base_commit 7ef1ae1)"
      - "sed -n '25p;164p' skills/fc-git/SKILL.md   # both lines byte-for-byte unchanged: the 'Merge feature/x into main...' sentence and the 'git merge --no-ff feature/x ...' command"
      - "node skills/flowcharge/scripts/test/run-tests.mjs   # regression check; measured 252/252 passed at base_commit 7ef1ae1, must still report all passed"
    checklist:
      - "The new bullet sits after the Naming paragraph and before '### Merging & rebasing', not inside the generic command block."
      - "The generic `git switch -c feature/<short-description>` example is untouched."
      - "Line 25's merge example and line 164's merge-style example are byte-for-byte unchanged."
      - "The new bullet cites the same 'identifiable in context' test the Committing section's FlowCharge Core artefacts bullet already uses, and adds no filesystem-scanning or ID-inventing mechanism."
    self_eval:
      passed: true
      failures: []

  - [x] 1.2 Prefix the workstream ID onto flowcharge/SKILL.md hard rule 11's branch name
    ```yaml
    description: "Replace hard rule 11's branch name from feature/<slug> to feature/<ws_id>-<slug>, so a run's auto-cut branch carries the run's own workstream ID ahead of its slug."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
            `feature/<slug>` from the current HEAD (`git switch -c`; no fetch, no pull),
            switch to it, and say so in that stage's report. `<slug>` is the run's
            workstream slug, bare and unprefixed, matching the repo's existing branch
            names. Creating a branch is in fc-git's "Safe. Execute directly" tier: no
        =======
            `feature/<ws_id>-<slug>` from the current HEAD (`git switch -c`; no
            fetch, no pull), switch to it, and say so in that stage's report.
            `<ws_id>` is the run's own workstream ID (see "ID slots"), and `<slug>` is
            the run's workstream slug, bare and unprefixed — together matching the
            `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/` folder convention.
            Creating a branch is in fc-git's "Safe. Execute directly" tier: no
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md, hard rule 11"
    imports: "None. `{ws_id}` is already resolved earlier in every run, under 'ID slots' / 'Start of run'; this task introduces no new resolution mechanism."
    compatibility: "PLN-2-25o0ic Design, 'flowcharge/SKILL.md, hard rule 11 (currently lines 128–139)' — only the branch name and its explanation change; the default-branch check, the 'Safe. Execute directly' tier, and the once-per-run check are unchanged."
    gotcha: "SEARCH must match the feature/<slug> sentence group exactly, including the leading 'Creating a branch is in fc-git's...' clause used to anchor the end of the replaced span, or the block will not apply. Do not touch the surrounding checks."
    verify:
      - "grep -c 'feature/<slug>' skills/flowcharge/SKILL.md   # expect 0 (measured 1 at base_commit 7ef1ae1)"
      - "grep -c 'feature/<ws_id>-<slug>' skills/flowcharge/SKILL.md   # expect 1 (measured 0 at base_commit 7ef1ae1)"
      - "node skills/flowcharge/scripts/test/run-tests.mjs   # regression check; measured 252/252 passed at base_commit 7ef1ae1, must still report all passed"
    checklist:
      - "Rule 11's default-branch check, 'Safe. Execute directly' tier wording, and once-per-run check are unchanged."
      - "The new text cites 'ID slots' as `<ws_id>`'s source, introducing no second, independent derivation."
      - "`<slug>` stays bare and unprefixed, matching the folder convention `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/`."
      - "No other hard rule, and no other occurrence of `feature/<slug>` elsewhere in the file, is touched."
    self_eval:
      passed: true
      failures: []
