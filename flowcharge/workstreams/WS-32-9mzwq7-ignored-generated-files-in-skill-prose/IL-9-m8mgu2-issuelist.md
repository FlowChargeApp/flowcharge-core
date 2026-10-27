---
id: IL-9-m8mgu2
type: issuelist
workstream: WS-32-9mzwq7
slug: ignored-generated-files-in-skill-prose
title: "Skill prose that says git status lists, or a commit captures, the git-ignored index, board, claim markers and lease"
status: done
created: 2026-10-27
updated: 2026-10-27
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-31-fg8y52. The Operations table's commit row says the commit stage consumes the regenerated index and board and the released lease

  ```yaml
  id: ISS-31-fg8y52
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The commit row of the Operations table in skills/flowcharge/SKILL.md lists, among what the commit stage consumes, the end-of-run upkeep writes that have already landed: issue closures, --sync status flips, the regenerated index and board, and the released lease. The generator keeps flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and every workstream .lease out of git, so no commit can include the regenerated views or the lease release, and a reader building the commit expects them among its inputs."
  steps_to_reproduce:
    - "In a throwaway git repository, run the installed generator's --init, --new-ws and --claim TL, acquire a workstream lease with the orchestrator's exclusive create, run a plain regenerate, and commit every file git lists."
    - "Flip the workstream's status so the content of index.md and kanban.md changes, then refresh the lease, regenerate, run --sync and release the lease."
    - "Run git status --short, git add -A --dry-run and git check-ignore -v on the four paths."
  expected: "The commit row names only the upkeep writes a commit can capture: the issue closures and the --sync status flips."
  actual: "git status --short lists only the workstream record, git add -A --dry-run stages only that file, and git check-ignore -v attributes index.md, kanban.md, the ids/ markers and the .lease to the generator's .gitignore lines, while the row names the regenerated index and board and the released lease as commit inputs."
  affected: "skills/flowcharge/SKILL.md:356 (Operations table, commit row, Consumes cell)"
  environment: "Any git repository the generator has run in: every writing mode adds the four .gitignore lines."
  tasks: [TL-34-m83k55 task 1]
  notes: "Found by the sweep of every skill file, template, CONVENTIONS.md, README.md and CONTRIBUTING.md; no other passage outside the three the workstream record names states or assumes the opposite. Fix direction: drop 'regenerated index/board, released lease' from the cell. Resolved by TL-34-m83k55 task 1: the commit row's Consumes cell reads (issue closures, `--sync` status flips), and the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file' pins it."
  ```

- [x] ISS-32-xsbd4p. The Before commit prompt expects git status to list the regenerated index and board and the released lease

  ```yaml
  id: ISS-32-xsbd4p
  status: done
  severity: medium
  author: Anthony Koukoullis
  description: "The Before commit item under Prompts in skills/flowcharge/SKILL.md says that, because the end-of-run bookkeeping has already run, git status --short is expected to list FlowCharge Core's own edits: the issue-status closures, the --sync status flips, the regenerated index.md and kanban.md, and the released .lease. git status never lists the last three, because the generator keeps the index, the board, the ID-claim markers and every workstream .lease out of git. At the commit prompt the orchestrator expects entries git never shows, so its prompt report is wrong, and it can read their absence as missing bookkeeping or try to add ignored files."
  steps_to_reproduce:
    - "In a throwaway git repository, run the installed generator's --init, --new-ws and --claim TL, acquire a workstream lease with the orchestrator's exclusive create, run a plain regenerate, and commit every file git lists."
    - "Flip the workstream's status, then run --sync, release the lease and regenerate, as the end-of-run bookkeeping does before the commit prompt."
    - "Run git status --short and git status --short --ignored -uall."
  expected: "The prompt expects the status to list the issue-status closures and the --sync status flips beside the run's own artefacts, and states that the regenerated index and board, the claim markers and the lease never appear there, because the generator keeps them out of git."
  actual: "git status --short lists only the workstream record. index.md and kanban.md, whose content changed, appear only under --ignored, as ignored files, and the lease release changes nothing git lists."
  affected: "skills/flowcharge/SKILL.md:678-684 (Prompts, Before commit)"
  environment: "Any git repository the generator has run in: every writing mode adds the four .gitignore lines."
  tasks: [TL-34-m83k55 task 2]
  notes: "Named in the workstream record. Fix direction: drop the regenerated index.md and kanban.md and the released .lease from the expected list, and say that the status never lists the regenerated views, the claim markers or the lease, pointing at the CONVENTIONS.md section that owns the .gitignore rule rather than restating it. Resolved by TL-34-m83k55 task 2: the Before commit item lists the issue-status closures and the --sync status flips, and says git status never lists the regenerated index.md and kanban.md, the claim markers or the .lease, pointing at (CONVENTIONS.md, The index and the board are generated); the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file' pins it."
  ```

- [x] ISS-33-aambxj. The end-of-run upkeep says the commit stage captures every write it lists

  ```yaml
  id: ISS-33-aambxj
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The Successful end of run item under FlowCharge Core upkeep in skills/flowcharge/SKILL.md says the bookkeeping runs before the commit stage, and 'The commit stage is therefore the run's last stage, and it captures every write listed below.' The writes it lists include the regenerations and the lease release. The generator keeps the index, the board and the lease out of git, so the commit captures only the status writes, not every write."
  steps_to_reproduce:
    - "In a throwaway git repository, run the installed generator's --init, --new-ws and --claim TL, acquire a workstream lease with the orchestrator's exclusive create, run a plain regenerate, and commit every file git lists."
    - "Flip the workstream's status, then do what the item lists: run --sync, release the lease and regenerate."
    - "Run git add -A --dry-run."
  expected: "The item says the commit captures the status writes the bookkeeping lists, and claims nothing for the regenerations or the lease release."
  actual: "git add -A --dry-run stages only the workstream record. The regenerated index.md and kanban.md and the lease release reach no commit."
  affected: "skills/flowcharge/SKILL.md:796-801 (FlowCharge Core upkeep, Successful end of run), the sentence on line 799"
  environment: "Any git repository the generator has run in: every writing mode adds the four .gitignore lines."
  tasks: [TL-34-m83k55 task 3]
  notes: "Named in the workstream record. Fix direction: say that the commit captures the status writes listed below. Resolved by TL-34-m83k55 task 3: the Successful end of run item says the commit captures the status writes listed below, and the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file' pins it."
  ```

- [x] ISS-34-9ml9x4. fc-validate's baseline precondition says the index and the board are modified and the lease is untracked at validation time

  ```yaml
  id: ISS-34-9ml9x4
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "Part 3's baseline precondition in skills/fc-validate/SKILL.md explains why the precondition is never a clean working tree: 'At validation time the generated index, the board and the workstream record are routinely modified by the upkeep that runs between stages, and the lease file plus the artefact under validation are untracked.' git status never shows the index or the board as modified, or the lease as untracked, because the generator keeps them out of git. The stated reason names files git cannot show, and a validator reasoning from it about the tree's state is misled."
  steps_to_reproduce:
    - "In a throwaway git repository, run the installed generator's --init, --new-ws and --claim TL, acquire a workstream lease with the orchestrator's exclusive create, run a plain regenerate, and commit every file git lists."
    - "Flip the workstream's status, refresh the lease and regenerate, as the upkeep between stages does."
    - "Run git status --short and git status --short --ignored -uall."
  expected: "The paragraph names only what git status can show at validation time: the workstream record, modified by the upkeep, and the artefact under validation, untracked. The reason a clean-tree precondition would fail on every in-pipeline run still holds."
  actual: "git status --short lists only the workstream record, as modified. Neither index.md nor kanban.md shows as modified, although their content changed, and the .lease does not show as untracked: --ignored marks all three as ignored."
  affected: "skills/fc-validate/SKILL.md:145-149 (Part 3, The baseline precondition)"
  environment: "Any git repository the generator has run in: every writing mode adds the four .gitignore lines."
  tasks: [TL-34-m83k55 task 4]
  notes: "Named in the workstream record. The two numbered conditions above the paragraph are not part of this defect. Fix direction: drop the index, the board and the lease file from the sentence. Resolved by TL-34-m83k55 task 4: the precondition paragraph names the workstream record as modified and the artefact under validation as untracked, and the case 'no skill file says git status lists, or a commit captures, a git-ignored generated file' pins it."
  ```
