---
id: IL-4-qhdkzx
type: issuelist
workstream: WS-13-ywk08u
slug: skill-instructions-init-flag-gap
title: "Skill instructions init-flag gap findings"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-8-1zjdxx. `SKILL.md`'s "Start of run" bullet describes a stale manual procedure instead of directing to `fc-index.mjs --init`

  ```yaml
  id: ISS-8-1zjdxx
  status: done
  severity: medium
  author: Anthony Koukoullis
  description: "skills/flowcharge/SKILL.md, line 699, inside the 'Start of run' bullet of the 'FlowCharge Core upkeep' section, reads: 'If `flowcharge/` itself is missing, create it plus a zeroed `ids.md` first.' This describes an older, manual, by-hand procedure. It does not mention that `fc-index.mjs --init` exists and is the correct command for this case, and it also misstates what happens to `ids.md`: `--init` does not create `ids.md` at all. `ids.md` is written lazily, by the first `--new-ws` or `--claim` run (both call the same `writeRegistryBack`, fc-index.mjs:1155-1188), so in this bullet's own flow the `--new-ws` run that follows `--init` is what seeds it; a fresh `--init` instead prints the WARN 'flowcharge/ids.md missing: create it before allocating new IDs' (fc-index.mjs:1432). CONVENTIONS.md:165-168 already documents the lazy seeding by `--claim`, though it does not mention that `--new-ws` seeds `ids.md` the same way."
  steps_to_reproduce:
    - "Read skills/flowcharge/SKILL.md's 'Start of run' bullet in the 'FlowCharge Core upkeep' section (line 699 at HEAD f53832f)."
    - "Follow it literally, as an agent initializing a new project's flowcharge/ folder would: the missing-folder case names only a manual create-the-folder-and-ids.md procedure, with no mention of fc-index.mjs --init."
    - "Compare against skills/flowcharge/scripts/fc-index.mjs's own --init implementation (line 280) and --help text, its shared writeRegistryBack (lines 1155-1188, called by --claim and --new-ws), and CONVENTIONS.md:165-168's description of ids.md's lazy creation by --claim. Or probe it: in an empty git repo, run fc-index.mjs --init (no ids.md, the WARN prints), then --new-ws probe --title Probe (ids.md now exists with WS: 1)."
  expected: "The instruction directs the missing-flowcharge/-folder case to run fc-index.mjs --init, and does not claim that step also creates a zeroed ids.md, since --init does not create ids.md."
  actual: "The instruction names only the old manual procedure ('create it plus a zeroed ids.md first'), never mentions --init, and its claim about ids.md being created at this step does not match --init's real behaviour."
  affected: "skills/flowcharge/SKILL.md (line 699, 'Start of run' bullet, 'FlowCharge Core upkeep' section)"
  environment: ""
  tasks: []
  notes: "Confirmed independently: a separate agent session following this instruction created the flowcharge/ tree by hand rather than running --init, because the instruction it read never mentioned the flag. Scope check: skills/flowcharge/SKILL.md:699 is the only place in skills/ with the 'create it plus a zeroed ids.md' wording. One related manual-creation sentence exists elsewhere and is not covered by this issue: skills/fc-issue-list/SKILL.md:29 says 'If `flowcharge/` or the workstream folder is missing, create them' with no mention of --init. CONVENTIONS.md:405 describes --init, and CONVENTIONS.md:165-168 describes ids.md's lazy seeding by --claim (not by --new-ws)."
  ```
