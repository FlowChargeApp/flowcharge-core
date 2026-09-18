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
{{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what that document covers and when to read it. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
````md
{{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play.}}
````

## Instructions
This stage writes a plan, a task list, or both. Read `{stages}` and route on it. When `{stages}` is `tasks-only`, read the artefact at `{plan}` in full and start at Part 2. Otherwise do Part 1, and when `{stages}` is `plan-only`, stop after Part 1 and report. When `{stages}` is `plan-and-tasks`, do Part 1 and then go straight on to Part 2.

### Part 1: write the plan

Skip this part when `{stages}` is `tasks-only`.

Write a plan for the feature described in Context, and save it to `{ws_dir}/<the PLN ID you claim below>-plan.md`. Plan what Context asks for and no more. Do not widen the feature, add capabilities it does not call for, or plan work it does not describe.

The file must open with frontmatter, exactly these keys:

```yaml
---
id: <the PLN ID you claim below>
type: plan
workstream: {ws_id}
slug: {slug}
title: "<a short title for the plan>"
status: ready
created: <today, YYYY-MM-DD, from `date +%F`>
updated: <same>
author: <from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section>
base_commit: <short SHA of HEAD, from `git rev-parse --short HEAD`>
depends_on: []
links: []
---
```

Flat keys and inline arrays only. The index parser depends on it.

Allocate the PLN ID by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim PLN` and using the printed id verbatim. IDs are global and permanent across every plan.

You are running without a user, so answer the skill's prompts yourself rather than stopping at them:

- Do not stop for blocking questions, or for deployment and release constraints. Take the most reasonable reading, state it in the plan as an explicit assumption in the plan's Scope section, and raise a would-have-asked item as an Open question only where a wrong answer is not recoverable by a later follow-up change.
- Do not stop for approach approval. Weigh the candidate approaches, commit to one, and record the alternatives and why you rejected them in the plan.
- Never invent a requirement to fill a gap. Anything Context leaves unsettled is an assumption or an open question, recorded as one.

What you leave unresolved is honoured downstream: Part 2 authors nothing for a stage resting on an open question. Raising a question costs one round trip. A fabricated decision gets built as if the user had chosen it.

### Part 2: author the task list

Skip this part when `{stages}` is `plan-only`.

Read the plan in full — the artefact you wrote in Part 1, or the one at `{plan}` when you skipped Part 1 — then author tasks that implement it, and save them to `{ws_dir}/<the TL ID you claim below>-tasklist.md` (if that file already exists for other work, use `<the TL ID you claim below>-tasklist-<qualifier>.md` in the same folder).

The file must open with frontmatter per the skill: `id: <the TL ID you claim below>`, `type: tasklist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, today's date (from `date +%F`) in `created`/`updated`, `author` (from `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami`, per CONVENTIONS.md's author section), and `depends_on: [<the plan's ID from its own frontmatter>]`. Flat keys and inline arrays only.

Allocate the TL ID by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim TL` and using the printed id verbatim. IDs are global and permanent across every task list.

This file is **diff mode**: set `mode: diff` and `base_commit` to the current HEAD short SHA in the frontmatter. Do not ask which mode to use and do not add smoke-test verify steps. You have no user to ask, so these are the answers.

Mirror the plan's scope, design and stage order; the decomposition into tasks is yours:

* One parent task per plan stage, in the plan's order. Decompose each stage into atomic child tasks yourself, derived from the stage's goal, the plan's Design contracts, and its acceptance criteria; the plan carries no per-task detail to copy. Atomic per the fc-task-list skill: one file, one coherent change, one SEARCH/REPLACE block, one verify sequence.
* Cover every stage. This plan exists because partial implementation is the failure mode, and an untasked stage is how that happens.
* Carry the plan's acceptance criteria into the tasks that satisfy them, as `verify` steps or `checklist` items, keeping the plan's own measurable form (e.g. a grep that must return zero).
* Honour the plan's exclusions: anything it says a change must not touch stays untouched. Build what the plan specifies and nothing beyond it: no extra abstractions, options, or capabilities you judge would help.

Before writing any SEARCH/REPLACE block:

* Read the target file as it stands now. This plan may predate the current code. Copy SEARCH text from the file you just read, never from the plan's quoted snippets, never from memory.
* If a file no longer matches what the plan assumes, author no task for it; record the divergence in the file's `## Divergences` section, per the `fc-task-list` skill, and continue with the rest.

Where a stage depends on an open question or on an assumption the plan marks unconfirmed, author no task for it and list it instead. Do not settle it yourself.

Add the project's own lint or type-check command as a verify step alongside the plan's acceptance checks, and only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Where it has none, add none: never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step. Those assert nothing about the task, they pass before the change as readily as after, and running a suite is the user's own step after execution. Where the plan names issue IDs, record them in the task's `issues:` key.

Measure before you write. Where a `verify` step asserts a count, a file's existence, or the presence or absence of a string, run that command at `base_commit` before you write it down, and record the number or state it actually returned rather than the one you expect. Where the command already passes with nothing changed, the step does not discriminate, so rewrite it until it fails at `base_commit`, or state in the step why it cannot fail there. Rewriting means making the assertion specific to the change. It never means deleting the step or weakening what it asserts.

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
