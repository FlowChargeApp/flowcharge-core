# Plan and Tasks

## Role
You are a senior software architect and senior software developer.

## Skills
/fc-dev-principles
/fc-plan-feature
/fc-issue-list (for the frontmatter conventions it documents)
/fc-task-list

## Context
Read these to understand the structure and purpose of the app:
{{context docs}}
````md
{{only what the subagent cannot discover for itself: the request, the decisions already taken, and the constraints on the outcome (scope, compatibility, what must not change). Nothing about how the code is built: no path outside `flowcharge/`, line number or quoted source beyond what the request or a subagent's return supplied; the subagent reads the target project itself. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, plus those decisions and constraints. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: those decisions and constraints only. Author this fresh; never paste an earlier briefing.}}
````

## Instructions
This stage writes a plan, a task list, or both. Read `{stages}` and route on it. When `{stages}` is `tasks-only`, read the artefact at `{plan}` in full and start at Part 2. Otherwise do Part 1, and when `{stages}` is `plan-only`, stop after Part 1 and report. When `{stages}` is `plan-and-tasks`, do Part 1 and then go straight on to Part 2.

### Part 1: write the plan

Skip this part when `{stages}` is `tasks-only`.

Write a plan for the feature described in Context, and save it to `{ws_dir}/<the PLN ID you claim below>-plan.md`. Plan what Context asks for and no more. Do not widen the feature, add capabilities it does not call for, or plan work it does not describe.

Frontmatter per the fc-plan-feature skill, with `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, `base_commit` from `git rev-parse --short HEAD`, and `depends_on: []`.

Allocate the PLN ID by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim PLN` and using the printed id verbatim.

You are running without a user, so answer the skill's prompts yourself rather than stopping at them:

- Do not stop for blocking questions, or for deployment and release constraints. Take the most reasonable reading, state it in the plan as an explicit assumption in the plan's Scope section, and raise a would-have-asked item as an Open question only where a wrong answer is not recoverable by a later follow-up change.
- Do not stop for approach approval. Weigh the candidate approaches, commit to one, and record the alternatives and why you rejected them in the plan.
- Never invent a requirement to fill a gap. Anything Context leaves unsettled is an assumption or an open question, recorded as one.
- A value Context does not supply (copy, palette, typography, layout, config, schema) is yours to decide, not a requirement: state it in the plan's Content specification or Design, record it under assumptions, and raise it as an Open question only where a wrong choice is not recoverable. A task list is never the first place a value appears.

What you leave unresolved is honoured downstream: Part 2 authors nothing for a stage resting on an open question. Raising a question costs one round trip. A fabricated decision gets built as if the user had chosen it.

### Part 2: author the task list

Skip this part when `{stages}` is `plan-only`.

Read the plan in full — the artefact you wrote in Part 1, or the one at `{plan}` when you skipped Part 1 — then author tasks that implement it, and save them to `{ws_dir}/<the TL ID you claim below>-tasklist.md` (if that file already exists for other work, use `<the TL ID you claim below>-tasklist-<qualifier>.md` in the same folder).

Frontmatter per the fc-task-list skill, with `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, `mode: {mode}`, `base_commit` as the current HEAD short SHA (so any SEARCH/REPLACE block is dated), `runtime` and `e2e_tooling` per the skill's Runtime detection (read from the project, never invented), and `depends_on: [<the plan's ID from its own frontmatter>]`.

Allocate the TL ID by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim TL` and using the printed id verbatim.

The file is **{mode} mode**. Do not ask which mode to use and do not add smoke-test verify steps; a runtime probe under the skill's Verify tiers is not a smoke test. You have no user to ask, so these are the answers.

Mirror the plan's scope, design and stage order; the decomposition into tasks is yours:

* One parent task per plan stage, in the plan's order. Decompose each stage into atomic child tasks yourself, derived from the stage's goal, the plan's Design contracts and Content specification values, and its acceptance criteria; the plan carries no per-task detail to copy. Atomic per the fc-task-list skill: one file, one coherent change, one verify sequence, and in diff mode one SEARCH/REPLACE block; plus, per the skill, at most one verification-only child on a stage that produces a UI or a running service.
* Cover every stage. This plan exists because partial implementation is the failure mode, and an untasked stage is how that happens.
* Carry the plan's acceptance criteria into the tasks that satisfy them, as `verify` steps or `checklist` items, keeping the plan's own measurable form (e.g. a grep that must return zero). Tag every checklist item per the skill's Evidence classes. Turn the plan's Testing-strategy review criteria into `rendered` items carrying the plan's thresholds, on the verification-only child where one exists. Where the frontmatter records no tooling for an item's class, author it as `source` or `[unverified-by-execution]`, per the skill.
* Honour the plan's exclusions: anything it says a change must not touch stays untouched. Build what the plan specifies and nothing beyond it: no extra abstractions, options, or capabilities you judge would help.

How much of the codebase to read again before authoring:

* Run `git diff --name-only <the plan's `base_commit`>..HEAD`, and read again only those files the plan names that also appear in that output. When that output is empty, read nothing again. When the plan carries no `base_commit`, read every file the plan names.
* Whenever you write a SEARCH/REPLACE block, in either mode, read the target file first, as it stands now, and copy the SEARCH text from it, never from the plan's quoted snippets, never from memory.
* If a file no longer matches what the plan assumes, author no task for it; record the divergence in the file's `## Divergences` section, per the `fc-task-list` skill, and continue with the rest.

Where a stage depends on an open question or on an assumption the plan marks unconfirmed, author no task for it and list it instead. Do not settle it yourself.

Author `verify` steps per the fc-task-list skill's `verify` rules and Verify tiers: measured at `base_commit`, the project's own lint or type-check command only where configured, at most one runtime probe per task, never a full test suite or build. Where the plan names issue IDs, record them in the task's `issues:` key.

## Return
Reply in chat only, briefly. Report both artefacts. When `{stages}` named one artefact, report only the one you wrote and drop the other's lines.

The plan:
- the plan's file path and ID
- a summary of the plan
- the approach you chose, and what you rejected

The task list:
- the task list file path and ID
- each plan stage → task numbers, and any stage left untasked, with the reason
- any file that diverged from the plan, and any item left for you to decide

Either way:
- the assumptions and open questions a user needs to settle

**Open questions, the return shape**

Return every open question in this shape, and no other:

- **Question:** the question in one sentence that reads cold to somebody who was not here.
- **Recommendation:** the option you would take, and a one-line reason for it. Where you cannot recommend one, write `No recommendation possible` in this field, followed by the reason you cannot. A question carrying that sentinel never settles at any tier.
