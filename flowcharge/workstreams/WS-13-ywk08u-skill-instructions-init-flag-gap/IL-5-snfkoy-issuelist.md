---
id: IL-5-snfkoy
type: issuelist
workstream: WS-13-ywk08u
slug: skill-instructions-init-flag-gap
title: "fc-issue-list workstream-folder creation instruction conflates --init and --new-ws"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-9-vsdlvd. `fc-issue-list/SKILL.md`'s folder-creation sentence tells an agent to hand-create `flowcharge/` instead of directing it to `fc-index.mjs --init`

  ```yaml
  id: ISS-9-vsdlvd
  status: done
  severity: medium
  author: Anthony Koukoullis
  description: "skills/fc-issue-list/SKILL.md, line 29, reads: 'If `flowcharge/` or the workstream folder is missing, create them; a new workstream also needs a `workstream.md` record (see CONVENTIONS.md).' The sentence conflates two different creation targets under one instruction, 'create them': `flowcharge/` itself, which is created by `fc-index.mjs --init`, and the workstream folder, which is created by `fc-index.mjs --new-ws`, never by `--init`. It should direct `flowcharge/` creation to `--init` and workstream-folder creation to `--new-ws`, matching the accurate pattern already used correctly elsewhere in this codebase: skills/fc-plain-text-kanban/SKILL.md line 32 and skills/flowcharge/templates/kanban-add.md line 24 both correctly point workstream-folder creation at `--new-ws` with no claim about creating `flowcharge/` itself. This is the same class of defect already fixed elsewhere in this workstream (skills/flowcharge/SKILL.md's 'Start of run' bullet, fixed for issue ISS-8-1zjdxx)."
  steps_to_reproduce:
    - "Read skills/fc-issue-list/SKILL.md line 29."
    - "Follow it literally, as an agent filing the first issue on a project with no flowcharge/ folder yet would: the sentence says to 'create them' for both flowcharge/ and the workstream folder, with no mention of fc-index.mjs --init."
    - "Compare against skills/fc-plain-text-kanban/SKILL.md line 32 and skills/flowcharge/templates/kanban-add.md line 24, which correctly direct workstream-folder creation to --new-ws and make no claim about creating flowcharge/ itself."
  expected: "The sentence directs flowcharge/-folder creation to fc-index.mjs --init and workstream-folder creation to fc-index.mjs --new-ws, as two separate accurate clauses."
  actual: "The sentence conflates both creation targets under a single 'create them' instruction with no mention of --init or --new-ws, so an agent hand-creates flowcharge/ instead of running --init."
  affected: "skills/fc-issue-list/SKILL.md (line 29)"
  environment: ""
  tasks: [TL-16-fj9vx4 task 1]
  notes: ""
  ```
