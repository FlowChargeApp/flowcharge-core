---
id: IL-3-fd2plh
type: issuelist
workstream: WS-7-boovu9
slug: author-field-schema-mismatch
title: "Author-field schema mismatch: findings"
status: ready
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [ ] ISS-4-n2rzx3. create-plan.md's frontmatter template omits the required author key

  ```yaml
  id: ISS-4-n2rzx3
  status: in-progress
  severity: medium
  author: Anthony Koukoullis
  description: "skills/flowcharge/templates/create-plan.md's plan frontmatter block (lines 23-36) lists id, type, workstream, slug, title, status, created, updated, depends_on, links, but omits author. Line 38's 'Flat keys and inline arrays only' note does not mention author either, and nothing else in the file does. CONVENTIONS.md (lines 274-276) states author is required in the frontmatter of all four artefact kinds, including plans, and skills/fc-plan-feature/SKILL.md (lines 130-132) requires it explicitly, agreeing with CONVENTIONS.md. create-plan.md is the one place in this chain that disagrees."
  steps_to_reproduce:
    - "Read skills/flowcharge/templates/create-plan.md, lines 23-38 (the plan frontmatter block and its accompanying note)."
    - "Compare the listed keys against CONVENTIONS.md lines 274-276, which requires author on plan frontmatter."
    - "Observe that create-plan.md's template and note never mention author."
  expected: "create-plan.md's frontmatter template lists author among the required keys, matching CONVENTIONS.md and fc-plan-feature/SKILL.md."
  actual: "create-plan.md's frontmatter template and its accompanying note omit author entirely."
  affected: "skills/flowcharge/templates/create-plan.md, lines 23-38"
  environment: ""
  tasks: [TL-6-dqaoqc task 1]
  notes: "Confirmed in practice: of 4 plans currently authored in this repository, 2 are missing author (flowcharge/workstreams/WS-2-3rs9lo-plan-review-trace-originating-scenario/PLN-3-fhpj8i-plan.md, flowcharge/workstreams/WS-3-t2lfk1-branch-name-ws-prefix/PLN-2-25o0ic-plan.md); the other 2 happen to carry it anyway (PLN-1-kqwu53-plan.md, PLN-4-32c19e-plan.md)."
  ```

- [ ] ISS-5-7sal1s. create-issues.md's frontmatter template omits the required author key

  ```yaml
  id: ISS-5-7sal1s
  status: in-progress
  severity: medium
  author: Anthony Koukoullis
  description: "skills/flowcharge/templates/create-issues.md, line 19, the issuelist frontmatter instruction, lists id, type: issuelist, workstream, slug, status, created/updated, and says 'Flat keys and inline arrays only', but never mentions author. CONVENTIONS.md requires author on issue-list frontmatter (same lines 274-276 as the create-plan.md finding)."
  steps_to_reproduce:
    - "Read skills/flowcharge/templates/create-issues.md, line 19 (the issuelist frontmatter instruction)."
    - "Compare the listed keys against CONVENTIONS.md lines 274-276, which requires author on issue-list frontmatter."
    - "Observe that line 19 never mentions author."
  expected: "create-issues.md's frontmatter instruction lists author among the required keys, matching CONVENTIONS.md."
  actual: "create-issues.md's frontmatter instruction omits author entirely."
  affected: "skills/flowcharge/templates/create-issues.md, line 19"
  environment: ""
  tasks: [TL-6-dqaoqc task 2]
  notes: "Confirmed in practice: the one issue list currently authored in this repository is missing author (flowcharge/workstreams/WS-5-geob84-unescape-frontmatter-quoted-values/IL-1-8o0id7-issuelist.md)."
  ```

- [ ] ISS-6-nr0bag. fc-issue-list/SKILL.md's own documented frontmatter example omits author, disagreeing with CONVENTIONS.md

  ```yaml
  id: ISS-6-nr0bag
  status: in-progress
  severity: medium
  author: Anthony Koukoullis
  description: "skills/fc-issue-list/SKILL.md's 'File frontmatter' example block (lines 41-54) omits author at the issuelist level, even though the same file documents per-issue author correctly elsewhere (line 140). This is distinct from the create-issues.md template gap: even a careful author reading this skill file directly, not via the orchestrator template, would copy an example missing author, because the skill file's own canonical example is wrong, not merely silent."
  steps_to_reproduce:
    - "Read skills/fc-issue-list/SKILL.md, 'File frontmatter' example block, lines 41-54."
    - "Compare the example's keys against CONVENTIONS.md lines 274-276, which requires author on issue-list frontmatter."
    - "Observe the issuelist-level example omits author, while the file's per-issue author documentation at line 140 is correct."
  expected: "fc-issue-list/SKILL.md's issuelist-level frontmatter example includes author, matching CONVENTIONS.md's canonical schema."
  actual: "The example in fc-issue-list/SKILL.md's 'File frontmatter' section omits author, contradicting CONVENTIONS.md."
  affected: "skills/fc-issue-list/SKILL.md, lines 41-54"
  environment: ""
  tasks: [TL-6-dqaoqc task 3]
  notes: "Same downstream effect as ISS-5-7sal1s (the one authored issue list in this repository is missing author), but a distinct defect: the skill file's own documented example, not just the orchestrator's template, is wrong."
  ```

- [ ] ISS-7-40lthe. The four tasks-from-plan/tasks-from-issues templates never spell out the author key, unlike create-plan.md and create-issues.md

  ```yaml
  id: ISS-7-40lthe
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "skills/flowcharge/templates/tasks-from-plan-spec.md line 18, tasks-from-plan-diff.md line 18, tasks-from-issues-spec.md line 18, and tasks-from-issues-diff.md line 18 each say only 'frontmatter per the skill: id, type: tasklist, workstream, slug, status: ready, created/updated, and depends_on', never mentioning author, unlike create-plan.md and create-issues.md which at least attempt to spell out the full key list."
  steps_to_reproduce:
    - "Read line 18 of each of: skills/flowcharge/templates/tasks-from-plan-spec.md, tasks-from-plan-diff.md, tasks-from-issues-spec.md, tasks-from-issues-diff.md."
    - "Compare the listed keys against CONVENTIONS.md lines 274-276, which requires author on task-list frontmatter."
    - "Observe that none of the four lines mentions author."
  expected: "Each of the four templates' frontmatter instruction lists author among the required keys, matching CONVENTIONS.md."
  actual: "Each of the four templates' frontmatter instruction omits author entirely."
  affected: "skills/flowcharge/templates/tasks-from-plan-spec.md:18, tasks-from-plan-diff.md:18, tasks-from-issues-spec.md:18, tasks-from-issues-diff.md:18"
  environment: ""
  tasks: [TL-6-dqaoqc task 4]
  notes: "Currently non-impactful in practice: all 5 task lists so far authored in this repository do carry author at the tasklist level, because fc-task-list/SKILL.md's own 'File frontmatter' example (lines 49-65) correctly includes it, and each authoring subagent evidently followed that skill's own example rather than relying on the orchestrator template's silence. The correctness is accidental rather than guaranteed by the template's own text, so this is a latent defect: it has not yet produced a missing author on any existing task list, but nothing in these four templates' own text prevents it on a future authoring pass that does not consult fc-task-list/SKILL.md's example as closely."
  ```
