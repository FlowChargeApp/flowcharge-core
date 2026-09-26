---
name: fc-task-list
description: Manage FlowCharge Core task list files stored as per-workstream Markdown in ./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md. Read, create, update, delete tasks, understand frontmatter, task types, authoring modes, schema, global TL IDs, and rules. Part of the FlowCharge Core suite (parallel successor to ak-task-list-md).
metadata:
  version: "0.4.0"
---

## What I do

- Read, create, update, and delete tasks in a FlowCharge Core task list Markdown file directly
- Enforce frontmatter, task type rules, numbering conventions, and self-evaluation standards
- Author tasks in either `spec` or `diff` mode, per the file's declared mode

## When to use me

Use this whenever you need to read, create, update, or delete tasks in a FlowCharge Core task list, or understand task types, authoring modes, schema, self-evaluation rules, or the Markdown format.

The FlowCharge Core data model (layout, IDs, frontmatter, status lifecycle, index generation) lives in `<skills-dir>/flowcharge/CONVENTIONS.md`; this skill restates the parts task lists need. Where they disagree, CONVENTIONS.md wins.

Inside a FlowCharge Core run, the flowcharge stage file answers every question this skill would ask a user (mode, smoke tests); follow it, and do not stop mid-stage to ask.

## Content

### Storage: workstream folders

Each workstream keeps ONE task list at: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`, where `{{TL-N-SUFFIX}}` is the file's own frontmatter `id`. If a second, separate list is needed in the same workstream, name it `{{TL-N-SUFFIX}}-tasklist-{{qualifier}}.md` in the same folder. The qualifier stays a tail after the plain name. There are no date buckets and no `_done/` folders. Completion is `status: done` in frontmatter, and the file stays put.

**Choosing the `{{slug}}`.** The workstream's folder is `{{WS-N-SUFFIX}}-{{slug}}` (for example `WS-4-a3x9k2-scope-service-bug-fixes`); `{{slug}}` stays bare and unprefixed (CONVENTIONS.md, Slugs).

**CRITICAL: "create a task list for X" means CREATE THE FILE, NOT A TASK.**

When the user says "create a task list for X":

1. Do NOT add any task to any existing file.
2. Ask which authoring mode applies (see **Two authoring modes** below).
3. Create `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md` with the frontmatter, heading, and summary block only (no tasks). Claim its `TL-N-SUFFIX` ID from the registry first (see Frontmatter). The filename is built from it. If the workstream folder is new, create it with `--new-ws` (CONVENTIONS.md, Creating a workstream).
4. Tell the user the file was created, with its ID and mode.

When the user says "add a task to X":

1. Resolve the file path: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`.
2. If the file doesn't exist, create it first as above, then add the task.
3. Resolve the file's mode before authoring the task. The mode determines the form of `implement`.

If no workstream is specified in a request, consult `index.md` (regenerate if stale); if it stays undecidable, ask the user.

### File frontmatter

Every task list opens with frontmatter. Flat keys and inline arrays only. The index parser depends on it:

```yaml
---
id: TL-4-a3x9k2
type: tasklist
workstream: WS-2-h4t6m8
slug: scope-service-bug-fixes
title: "Scope service bug fixes"
status: ready
created: 2026-07-29
updated: 2026-07-29
author: Ada Lovelace
depends_on: [IL-3-k9d2s5]
links: []
mode: spec              # spec | diff
base_commit: a1b2c3d    # required wherever SEARCH blocks appear, the commit they were authored against
runtime: "npm run dev"  # how the project runs itself, or none; see Runtime detection
e2e_tooling: [playwright] # browser/e2e tooling already present, or []
test_commands: ["<suite command>"] # the project's own suite commands, or []; see Test commands detection
---
```

- `id`: a `TL-N-SUFFIX` claimed by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim TL` and using the printed id verbatim. IDs are global and permanent; tasks are addressed globally as `TL-N-SUFFIX task M` (compact form `TL-4-a3x9k2.2.1` = task 2.1 in `TL-4-a3x9k2`).
- `status`: the uniform enum (`backlog`, `ready`, `in-progress`, `done`, `dropped`); `ready` when authored, `in-progress` once execution starts, `done` when every task line is `[x]`.
- `depends_on`: the IDs this list is built from and blocked on, the issue list or plan it implements, and any list that must execute first. The orchestrator refuses to execute a list whose `depends_on` are not all `done` (a `type: plan` or `type: issuelist` dependency is satisfied once authored: any status but `backlog`/`dropped`). Ordering constraints are data here, never only prose.
- `updated`: bump on EVERY edit to the file.
- `mode` / `base_commit`: see below. These live in the frontmatter, not a separate header block.
- `runtime` / `e2e_tooling`: facts about the project, recorded at authoring per **Runtime detection** below, never choices.
- `test_commands`: the project's own suite commands, recorded at authoring per **Test commands detection** below, never chosen or invented; only the list's **Test-run task** runs them.

After any status or task-state change, regenerate the index:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

### Runtime detection

At authoring time, record from disk alone how the project runs itself:

- `runtime`: a double-quoted command or approach found in a `start`/`dev` script, a Makefile target, a binary entrypoint, or a static-file approach for plain HTML (e.g. `"npm run dev"`, `"make serve"`, `"static: index.html"`); `none` when nothing runs.
- `e2e_tooling`: browser or e2e tooling already present (a Playwright, Cypress or Puppeteer config or dependency, an existing `e2e/` directory) as an inline array; `[]` when none.

Detection only: never invent, install or configure anything. These two keys alone decide, for the whole list, whether a probe exists: `runtime: none` allows no probe, and `e2e_tooling: []` allows no `rendered` probe (see **Evidence classes**). A list with no `runtime` key predates this rule: read it as `none`.

### Test commands detection

At authoring time, record from disk alone, as `test_commands`, every test suite the project defines: an inline array of double-quoted commands, each run from the project root.

- Record a command only where a project file names it: a build-tool script or target, a CI step, or an equivalent. A runner's default command that no project file names is never recorded.
- Record every suite (unit, integration, e2e), not one. Leave out a command that only runs other recorded ones, and every lint, type-check or build command.
- `[]` means the project defines no suite: the list then has no test-update or test-run task.

Detection only: never invent, install or configure anything. Only the **Test-run task** runs these commands. A list with no `test_commands` key predates this rule.

### Two authoring modes: `spec` and `diff`

Every task list declares a `mode` in its frontmatter that fixes the **form** of its `implement` steps. Mode describes the instruction format and the latitude granted to the executor. It never names a model, vendor, product, or tier. Do not record one anywhere in a task file.

- **`spec`.** Predominantly instruction-oriented: `implement` states intent and anchors, and the executor derives the change itself. Use when the executor is expected to read surrounding code, resolve ambiguity, and choose an approach. Files stay small and tolerate code drift. A literal SEARCH/REPLACE block is permitted for the occasional small, mechanical edit. See `implement` under **Metadata Schema** for the conditions.
- **`diff`.** `implement` carries a literal SEARCH/REPLACE block; the executor applies it verbatim and does not improvise. Use when the executor should not be making design decisions. Files are large and perishable.

**Ask, never infer.** When creating a task list, ask the user: *"Spec mode (intent + anchors) or diff mode (literal SEARCH/REPLACE blocks)?"*

**Mode resolution order** when reading or writing a task:

1. A `mode` key on the task's own YAML, a per-task override. Use sparingly; a mixed file is harder to hand to one executor.
2. The `mode` key in the file frontmatter.
3. No `mode` at all. The file predates this rule. Treat it as `diff` for **reading**. Do not backfill. Ask the user which mode applies before authoring anything new into it.

### Diff-mode staleness guard

A pre-written SEARCH/REPLACE block is only valid against the code it was authored from. It rots as soon as anything else edits that file.

- Record `base_commit` in the frontmatter when authoring a diff-mode file (or a spec-mode file that contains any SEARCH/REPLACE block) and re-record it if blocks are regenerated.
- **If a SEARCH block does not match at execution time, re-anchor it. Never approximate it.** Re-read the target file, locate the anchor in its current form, and re-derive the edit against what the file actually says now. Then record the re-anchoring in `self_eval` (see below): what the block expected, what the file contained, and how the edit was adapted. This rule exists to prevent a silent fix-up. A visible, reported one is fine.
- **Abort only when the anchor is gone or its meaning has changed.** The function, symbol, or region the block targeted no longer exists, or it now does something different enough that the intended edit may no longer be correct. In that case leave the task unchecked, record it, and stop rather than guessing at intent.
- Diff-mode files are perishable. Author them close to when they will be executed, not weeks ahead. If a diff-mode file has sat unexecuted while its target files changed, regenerate the blocks against current content rather than executing as-is.

### Three task types

- **Parent.** Category heading only. Has child tasks. Only has `description` in its YAML metadata. Not directly actionable.
- **Adult.** Standalone, childless task. Full or mini shape (see **Mini shape**).
- **Child.** Belongs to a parent task. Full or mini shape. Numbered as `N.M` (e.g. `2.1`, `2.2`).

### Task List Format

Each file follows this structure (after the file frontmatter):

````md
# FlowCharge Tasks

## Feature Name

{{ Detailed-yet-concise summary of the feature }}

- [ ] 1. Task (Childless / Adult)
  ```yaml
  description: "Describe the task"
  author: Ada Lovelace
  issues: []
  implement:
    - "Step or instruction"
    - "Option A: ..."
    - "Option B: ..."
  pattern: "Files applicable"
  imports: "Components, packages, etc required"
  compatibility: "Design patterns, package versions, etc, that the task output needs to be compatible with"
  gotcha: "Any known or foreseeable issues that can arise with such a task relating to imports, compatibility, etc"
  verify:
    - "Primary command or tool to verify successful implementation"
    - "Optional: follow-up check on the output of the above"
  checklist:
    - "source: binary YES/NO criterion derived from imports, compatibility, gotcha, or pattern"
    - "runtime [verify 1]: criterion the named probe proves; see Evidence classes"
  self_eval:
    passed: false
    evidence: []
    unverified: []
    failures: []
  ```
- [ ] 2. Parent task

  ```yaml
  description: "Describe the overall task"
  ```

  - [ ] 2.1 Child task / Subtask
    ```yaml
    description: "Describe the child task"
    author: Ada Lovelace
    issues: []
    implement:
      - "Step or instruction"
    pattern: "Files applicable"
    imports: "Components, packages, etc required"
    compatibility: "Relevant compatibility constraints"
    gotcha: "Known or foreseeable issues"
    verify:
      - "Primary command or tool to verify successful implementation"
      - "Optional: follow-up check on the output of the above"
    checklist:
      - "source: ..."
      - "rendered [verify 2]: ..."
    self_eval:
      passed: false
      evidence: []
      unverified: []
      failures: []
    ```
  - [ ] 2.2 Mini child task (see Mini shape)
    ```yaml
    description: "One change in one existing file"
    pattern: "src/one/file.ts"
    implement:
      - "Anchor and the change"
    verify:
      - "Command with an unambiguous pass/fail"
    self_eval:
      passed: false
      evidence: []
      unverified: []
      failures: []
    ```
  - [x] 2.3 Completed child task / subtask

- [x] 3. Completed parent task

## Divergences

1. **Short label.** What the plan assumed; what the file actually contains; the consequence.
````

### Divergences

Record every divergence found while authoring the file in one section named exactly
`Divergences`. Add no suffix and no artefact ID to the name. The source artefact is
already in `depends_on`, and the fixed string is what makes the section greppable.

Give the heading the level `##`, a sibling of the `## Feature Name` heading. Put the
section last in the file, after the final task line and after any other trailing
section.

Write the section only when at least one divergence was found. Omit it entirely when
nothing diverged. One optional closing sentence may record that every other cited file
matched the plan.

Write the entries as an ordered numbered list from 1, one entry per divergence. Open
each entry with a bold short label, then state in prose:

1. what the plan assumed,
2. what the file or the project actually contains, cited by path and by the line or
   short SHA read at authoring time,
3. the consequence: the tasks affected, or that no task was authored.

Any task may point at an entry with the literal form `see Divergence N`, from
`implement`, `gotcha`, `verify`, or `checklist`. Never renumber an entry once it is
written, because those references are not updated with it.

Two prohibitions:

- Never use checkbox syntax in an entry. A `- [ ]` line here is counted as a task by
  the index generator.
- Record a divergence in this section and nowhere else in the file, not in the feature
  summary, and not as a bold inline paragraph.

### Metadata Schema

Every task includes an indented YAML block immediately after the task line. These are the standard keys:

- `description`: concise task description
- `author`: plaintext name of whoever authored the task. See **Author attribution** below. Adult and child tasks only.
- `mode`: **optional** per-task override of the file's mode: `spec` or `diff`. Omit unless this one task needs the other form.
- `issues`: **optional** list of issue IDs from `fc-issue-list` that this task addresses (e.g. `[ISS-3-q2j5w7, ISS-7-s5g9y0]`). Use `[]` if none. When populated, update the corresponding issue's `tasks` key and set its `status` to `in-progress`.
- `implement`: **ordered list** of implementation steps or instructions. Each item is a discrete action. Use multiple items to capture branching options (e.g. `"Option A: ..."`, `"Option B: ..."`) rather than embedding them in prose. **The form of these steps is set by the task's mode:**

  **`spec` mode**
  - Steps are prose. Name the target file and the **anchor** within it (function, method, symbol, export, config key, or region), then state the change to make and why.
  - Illustrative code is allowed but capped at roughly 10 lines, and must be labelled as illustrative rather than literal.
  - A literal SEARCH/REPLACE block is **allowed** in spec mode, but only when all of the following hold. Prose is the default; reach for a block because it is clearer, never because it is easier to author.
    - The change is small and targets **one unambiguous location** in one file.
    - It is mechanical enough that no design decision is left for the executor. If the executor would still have to choose an approach, write prose.
    - The block follows the same shape, SEARCH-text rule and one-block-per-task limit as `diff` mode below.
  - **Consequence:** a spec file containing at least one SEARCH/REPLACE block must carry `base_commit` in its frontmatter, and those tasks fall under the **Diff-mode staleness guard** exactly as diff-mode tasks do. Without the SHA a block has nothing to date it against. If a task is drifting toward several blocks, that is the signal it belongs in a diff-mode file, or give that one task a `mode: diff` override.

  **`diff` mode**
  - Steps that modify source code must be expressed as a SEARCH/REPLACE block, not prose. Each block states the full file path, then a `<<<<<<< SEARCH` section with the exact existing text, a `=======` divider, and a `>>>>>>> REPLACE` section with the new text.
  - Max **one** SEARCH/REPLACE block per task, targeting **one** file. Multi-file or multi-location changes: split into one child task per block, never multiple blocks in one task.
  - The SEARCH text must be copied from the file as read in this session, never recalled from memory or reconstructed. See **Diff-mode staleness guard** above.

- `pattern`: files, paths, or applicable scope; omitted only on a verification-only child (see **Rules**)
- `imports`: required components, packages, modules, or dependencies
- `compatibility`: required design patterns, package versions, or compatibility constraints
- `gotcha`: likely pitfalls, edge cases, or foreseeable issues
- `verify`: **ordered list** of verification steps. The first item is the primary command or tool. Subsequent items are follow-up checks on the output of the previous step (e.g. inspect a value, hit an endpoint, assert a file exists). Steps are executed in sequence. Later steps may depend on earlier ones succeeding. Every step sits in one tier of **Verify tiers** below. See **Smoke Tests** below for tasks whose output is a class/method with observable state. Each step asserts something specific to the change (a grep, a count, a file-existence check). Add the project's own lint or type-check command alongside, only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent); never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step: it asserts nothing about the task and passes before the change as readily as after. A suite runs in one place only: the list's final test-run task (see **Test-run task**). **Measure before you write.** Where a step asserts a count, a file's existence, or the presence or absence of a string, run it at `base_commit` before writing it down and record what it actually returned, not what you expect. Where it already passes with nothing changed it does not discriminate: rewrite it until it fails at `base_commit`, or state in the step why it cannot fail there. Rewriting makes the assertion specific to the change; it never deletes the step or weakens what it asserts.
- `checklist`: full shape only. 4–6 binary YES/NO criteria derived from `imports`, `compatibility`, `gotcha`, or `pattern`, each opening with its class per **Evidence classes** below
- `self_eval`: post-execution evaluation object with:
  - `passed`: boolean, true only if no checklist item is NO
  - `evidence`: array with one entry per checklist item, in order, each with `item`, `result` (`YES`/`NO`/`NOT CHECKED`) and `measured` (what was observed); `[]` until executed
  - `unverified`: array of NOT CHECKED items, each with `item` and `reason`; `[]` when none
  - `failures`: array of failed checklist items, each with `item`, `reason`, and `fix`

**Parent tasks only have the `description` key**, so never `author`. All other task types (adult, child) carry the full set of keys above or the mini set (see **Mini shape**); no key is optional in either.

### Author attribution

Read `author` with `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami` and write the printed line verbatim into the file's frontmatter and every full-shape adult and child task's YAML; a mini task inherits the file's (CONVENTIONS.md, Author attribution).

### Where the detail sits, by mode

Both modes use the same schema, but the informational load moves. Filling every key to the same depth in both modes is what makes task files bloat.

| Key | `spec` | `diff` |
| --- | --- | --- |
| `implement` | **Terse.** Intent plus anchor. The executor derives the edit. | **Long.** The block *is* the task. |
| `imports`, `compatibility`, `gotcha` | **Referential when a plan backs the list.** Name the plan's contract (plan id plus section) and add only task-local facts the plan does not state, a few lines each. Copying the plan's Design into a task is duplication. **Rich** only when no plan backs the list (e.g. authored from an issue list alone): then these constraints are what let the executor derive a correct edit. | **Terse.** The block already encodes them; restating is duplication. |
| `checklist` | Outcome-based, "behaviour X holds", "no caller of Y is broken". | Mechanical, "block applied cleanly", "`grep` confirms Z", "type-check clean". |
| `verify` | May require judgement about the result. | Should be a runnable command with an unambiguous pass/fail. |

When a plan backs the list, each parent task realises one plan stage, and its child
tasks are derived from that stage's goal, the plan's Design contracts and Content
specification values, and its acceptance criteria. The plan carries no per-task
detail to copy. A list authored
from an issue list is unaffected.

### Mini shape

Every adult or child task except the test-run and test-update tasks (see their sections) takes one of two shapes, decided by a test on its own content, never by preference. Write `description`, `pattern`, `implement` and `verify` first, then test. The task is **full** if any one holds, else **mini**:

1. `pattern` names more than one file (a test file for the same change does not count: one under a `test`, `tests`, `spec`, `specs`, `e2e` or `__tests__` directory, or named `*.test.*` / `*.spec.*`), or a file the task creates or deletes.
2. `implement` changes more than one anchor (function, symbol or region) in the file.
3. The change needs a new dependency, module or component (`imports` would be non-empty).
4. `verify` has no step with an unambiguous pass/fail.

Mini carries `description`, `pattern`, `implement`, `verify` and `self_eval`, plus `issues` only when non-empty and `mode` only as an override; every other key is forbidden. Full carries every key; none is optional. A mini task is a leaf: it never has children. The verification-only child is always full. In a mini task `verify` is the checklist: `self_eval.evidence` holds one entry per `verify` step, classed by the step's tier (static is `source`; a probe is `runtime` or `rendered` as the step states). `fc-index.mjs --check` flags a mini task whose `pattern` names more than one file or that has sub-tasks.

### Evidence classes

Every `checklist` item opens with its evidence class, then a colon:

- `source`: provable by reading files (a grep, a count, a file's content).
- `runtime`: needs the program running (a response, an exit code, a written row).
- `rendered`: needs a rendered UI (a measured layout, a computed style, a visible element).

A `runtime` or `rendered` item names, in square brackets before the colon, the `verify` step that produces its evidence: `"rendered [verify 2]: no horizontal overflow at a 375px viewport width"`. Where the frontmatter records no tooling for the class, rewrite the item as `source` if a file proves the property, else mark it `[unverified-by-execution]`: the author's record, from disk, that no probe exists here. Only such an item may return NOT CHECKED at execution (see **Self-evaluation**); the executor never decides for itself that tooling is missing. A YES on an item whose class exceeds what was actually run is invalid: record NO. Where the plan's Testing strategy states review criteria for a content deliverable (contrast ratio, breakpoints, copy length), each becomes a `rendered` item carrying the plan's threshold.

### Verify tiers

Each `verify` step sits in one tier:

- **Static.** Always allowed: the project's configured lint or type-check, grep, counts, file-existence checks, reading a named file.
- **Probe.** Allowed, at most one per task: a task-scoped runtime probe. Start the program with the frontmatter `runtime`, load one page, send one request or run one command, read the concrete result (status, output, measurement), then stop it. Before the program starts, the step may run the build that the recorded `runtime` itself runs or needs, such as the `prestart` hook behind `npm start`, named by the project's own script (`npm run build`). That build is setup, never evidence. State the exact command, input, viewport or request, and the value expected. A `rendered` probe uses the recorded `e2e_tooling` only. Where the frontmatter records no tooling, no probe step is authored.
- **Forbidden.** A full test suite, a full build, a deploy, a package install, anything that writes outside a temporary directory. The one exception is a probe's `runtime` setup build (see Probe), which may write the project's own build output. The test-run task is outside these tiers (see **Test-run task**).

A probe is not a smoke test: it exercises the running program, where a smoke test is a script calling the changed code.

### Self-evaluation

After each task is executed, evaluate every checklist item as YES, NO or NOT CHECKED under **Evidence classes**, and record one `evidence` entry per item with what was actually observed, never "passes": a `source` item cites the grep or read and its output; a `runtime` or `rendered` item cites the observed value (e.g. "at a 375px viewport width, scrollWidth 375 equals clientWidth 375"). NOT CHECKED is allowed only on an `[unverified-by-execution]` item, with `measured` quoting the frontmatter fact ("not checked: e2e_tooling is []"); it is neither pass nor failure, and each such item is also listed in `self_eval.unverified`. A `[verify N]` item whose probe was not run, gave no measured value, or failed is NO. If any item is NO, add it to `self_eval.failures` with `item`, `reason`, and `fix`, apply the fix immediately, and re-check by re-running the item's `verify` step; re-reading the edit is no re-check for a `runtime` or `rendered` item. Repeat until no item is NO or no further progress is possible. Set `self_eval.passed` to true only if no checklist item is NO. Mark a task complete (`[x]`) only when `self_eval.passed` is true. Return the populated `self_eval`, naming every NOT CHECKED item, in the task result.

A diff-mode task whose SEARCH block failed to match is **not** a checklist failure. Handle it per the **Diff-mode staleness guard**: if the block was re-anchored, note that in `self_eval` as a `reanchored` entry (`item`, `expected`, `found`, `resolution`). The task may still pass, but the re-anchoring must be visible in the result, never folded silently into a green task. If the anchor was gone or its meaning had changed, leave the task unchecked, record the mismatch in `self_eval.failures`, and stop.

A mini task that turns out to need a design decision (an approach to choose, a second file, a new dependency) is **promoted**: the executor rewrites it into the full shape in place, records a `promoted` entry in `self_eval` (`item`, `reason`), names it in the result, then executes the full shape. Never silently.

### Test-run task

Where `test_commands` is not `[]`, the list ends with one test-run task: the last top-level task, numbered after every other. Add it exactly as written below, predicting no edit. It checks the whole change and detects no single one, so **Measure before you write** and the Forbidden tier do not apply to it, and it takes neither the full nor the mini shape. Every other task keeps both rules.

````md
- [ ] N. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: false
    test_run_result: pending
    test_run_baseline: pending
    test_run_failures: []
  ```
````

A list authored to fix test-run failures ends with the recheck form instead, never the full form. Its `verify` names one command per failing check, or the full recorded command where a check cannot run alone:

````md
- [ ] N. Test-run recheck: re-run the failing checks
  ```yaml
  description: "Re-run the checks that failed in <TL-id> task <n>"
  test_run: recheck
  implement:
    - "No edit; run every verify command per the fc-task-list skill's Test-run task section"
  verify:
    - "<one command per failing check>"
  self_eval:
    passed: false
    test_run_result: pending
    test_run_failures: []
  ```
````

**Two runs.** The full form runs twice. A run while no other top-level task is checked and `test_run_baseline` is `pending` is the baseline run: run every command, record the baseline, and leave the task unchecked. The run after every other task is the check itself: run every command again, and set a baseline still `pending` to `unavailable`. The baseline stands for `base_commit`, the tree before the list's first task. The recheck form runs once and has no baseline.

**The record**, in `self_eval`, replaces the evidence **Self-evaluation** asks of a checklist:

- A check is one failing test as the runner's output names it, or the whole command where the output names none.
- `test_run_baseline`: `pending`, `unavailable`, or the list of checks that failed at the baseline run, `[]` when none did.
- `test_run_failures`: one entry per check failing at the last run, with `check`, `command`, `message` (the runner's failure text, trimmed) and `blocking`: `false` when the check is in the baseline, else `true`. In the recheck form every entry blocks. Only the baseline sets `false`: never on evidence from another run, revert or stash. An entry you believe predates the list stays `true`, with that reason in its `message`.
- `test_run_result`: `passed` when no entry blocks, else `failed`.
- Set `passed: true` and mark the task `[x]` on `passed` only. On `failed`, leave it unchecked.

Never fix a failure, never edit a file to make a check pass, and never record a failing run as passed. Return every entry. A fix goes through a recorded issue and task, never inline; inside a flowcharge run, the orchestrator's test-run loop does this.

**No script can check** that the baseline ran first or that no failure was fixed inline, because no script reads a run. `fc-index.mjs --check` checks only a `done` list's record: `passed` where `test_commands` is not `[]`, and no `blocking: false` entry outside the baseline or in the recheck form.

### Test-update task

Where `test_commands` is not `[]`, the task directly before the test-run task is the test-update task; a list authored to fix test-run failures has none. In the project's own test files and style, it updates every existing test the list's other tasks make wrong or out of date, and adds a test only where the request, plan or issue asks for one. With nothing to update or add, it makes no edit and its `verify` is empty.

It may edit several test files and blocks, and takes neither the full nor the mini shape: its `verify` holds one static step per test updated or added, each failing at `base_commit`, and is its checklist, as in a mini task. It runs no test; the test-run task does.

````md
- [ ] N. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "<every test file it edits>"
  implement:
    - "<per the list's mode: one step or SEARCH/REPLACE block per test updated or added>"
  verify:
    - "<one static step per test updated or added>"
  self_eval:
    passed: false
    evidence: []
  ```
````

**No script can check** that it updated every affected test. `fc-index.mjs --check` checks only that a `done` list whose `test_commands` is not `[]`, other than a fix list, holds this task.

### Smoke Tests

A smoke test is a minimal script that instantiates/calls the changed code with concrete inputs and asserts a concrete expected output/state, proving it runs and does the basic thing, without a full test suite.

When generating a task that adds/changes a class or method with externally observable state (file written, DB row, API response, computed value), ask the user: *"Add a smoke-test verify step for this task?"* If yes, the `verify` entry must specify, inline, not just "run a smoke test":
- exact instantiation/call (class, method, args)
- concrete input values (e.g. temp dir, sample IDs)
- exact expected output and how to compute it independently of the code under test
- runtime to execute it with (match the project's actual entrypoint runtime, e.g. `tsx`, not `bun`, if the project runs via `tsx`; verify with the user or codebase if unknown)
- cleanup step if it writes temp files

### Rules

- Always include a detailed-yet-concise summary of the feature, from the discussion recently conducted about it, to give the section context. It sits under the `## Feature Name` heading, after the frontmatter.
- Record every authoring-time divergence in the file's `## Divergences` section (see **Divergences** above) and never in the feature summary or inline in a task's prose.
- **CRITICAL. Task Numbering:**
  - Parent and adult tasks are ALWAYS numbered `1.`, `2.`, etc.
  - Child tasks / subtasks are ALWAYS numbered `1.1`, `1.2`, etc., incorporating the parent task number. This is **IMPERATIVE**.
  - If adding existing discussed tasks to a parent task as subtasks, **RENUMBER** them to incorporate the parent task number in the subtask numbers.
- Tasks may include an inline description: `1. Task name (description)`
- If a task has child tasks, it is a parent task (see **Three task types**).
  - If a task's scope is large, break it down into atomic child tasks.
  - **Atomic = one file, one coherent change, provable by a single `verify` sequence.** A source file and its test file for the same change count as one. In `diff` mode, additionally: **one SEARCH/REPLACE block**. Split multi-file changes into separate child tasks in either mode.
  - **Verification-only child.** An exception to one-file (the **Test-update task** is the other): a child whose whole body is a `verify` sequence of probes, with no `pattern` and an `implement` of one step, "no edit; run `verify`". At most one per parent whose plan stage produces a UI or a running service, numbered last among that parent's children; its checklist holds the stage's `runtime` and `rendered` items.
  - If a task's scope is already atomic, keep it as a parent-level adult task.
  - A mini task is a leaf and never a parent (see **Mini shape**).
  - When all subtasks of a parent are completed, mark the parent task as completed too.
- Only add tasks that don't already exist in the file.
- Mark complete by switching `[ ]` → `[x]`.
- When every task line is `[x]`, set the frontmatter `status` to `done`. Inside a flowcharge pipeline the orchestrator or `--sync` does this; the execute stage itself changes no frontmatter key but `updated`.
- Bump the frontmatter `updated` date on every edit, and regenerate the index (command above) after the edit lands.
- Preserve all existing content, ordering, indentation, and metadata exactly.
- Never record a model, vendor, product, or tier name in a task file. Mode captures the instruction format; that is the only distinction the file needs.
- After writing, summarise what was added/updated/completed, and state the mode used.
- Where the edit authored a new task list, close by offering a standalone `/fc-validate` of it against the plan or issue list it was authored from. Offer this only for a newly authored list, never after a status flip, a checkbox change, or a one-line correction.

---

## File Operations for Large Task List Files

### Reading

**Locate a task** (get line number):

```bash
grep -n "7\.3" flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/TL-4-a3x9k2-tasklist.md
```

**Read a fixed range** (once you have line numbers):

```bash
sed -n '122,155p' flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/TL-4-a3x9k2-tasklist.md
```

**Read a task to the next task** (variable-length YAML):

```bash
# Child task (indented):
sed -n '/^  - \[.\] 7\.3/,/^  - \[.\] 7\.4/p' file.md
# Parent/adult task:
sed -n '/^- \[.\] 7\./,/^- \[.\] 8\./p' file.md
```

**Scan all task status lines:**

```bash
grep -n "^\s*- \[" flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/TL-4-a3x9k2-tasklist.md
```

**Read N lines from a known task line:**

```bash
START=$(grep -n "7\.3" file.md | head -1 | cut -d: -f1)
sed -n "${START},$((START+40))p" file.md
```

**Check a file's mode** (before authoring into it):

```bash
sed -n '1,20p' flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/TL-4-a3x9k2-tasklist.md | grep -E '^mode:|^base_commit:'
```

### Writing (SEARCH/REPLACE)

These rules govern edits to the **task list file itself**, in either mode.

1. `grep -n` to get line number → `sed -n` to read exact current content → write a SEARCH/REPLACE block.
2. The SEARCH section must match existing content exactly, including whitespace and indentation.
3. Include just enough surrounding lines in SEARCH to make the match unique within the file.
4. Label the fence with the target file's language (e.g. `python`, `yaml`, `md`), never a generic `diff` tag.
5. Apply the block using the coding tool's native file-editing capability. Do not shell out to `patch` or `git apply`.
6. If the edit fails (SEARCH text not found or matches multiple locations), re-read the file (lines may have shifted) and regenerate the block against current content.
7. Never generate a block against a file not re-read since the last write in this session.

**Block format:**

```
flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/TL-4-a3x9k2-tasklist.md
<<<<<<< SEARCH
  - [ ] 7.3 Some child task
=======
  - [x] 7.3 Some child task
>>>>>>> REPLACE
```

---

## Housekeeping: Completion & the Index

There is no per-file archive sweep and no `_done/` folder in FlowCharge Core. Files never move individually (a completed workstream may later be archived whole, on the user's say-so; see (CONVENTIONS.md, Archiving)). Housekeeping is:

1. **Close out**: when no open task line is left (`- [ ] N.` for parent/adult, `  - [ ] N.M` for child: real task-tracker lines only, not unchecked-looking bullets embedded in prose such as a "Definition of Done" inside a task's body), set the frontmatter `status: done` and bump `updated` (in a pipeline, the orchestrator's or `--sync`'s job, per Rules). If a done file gets a new open task, set it back to `ready` or `in-progress`.
2. **Regenerate**: run the index generator. Its Attention section flags task lists whose tasks are all checked but whose status is not yet `done`, and files left stale by an `in-progress` status or a `blocked` reason.
3. **Compaction on completion (diff mode).** Once a diff-mode file is `done`, its SEARCH/REPLACE blocks are dead weight. The applied changes now live in git history, and the blocks no longer match anything. Offer to compact it: keep the frontmatter, feature summary, the task lines with their `[x]` status, each `description`, `issues`, and `self_eval`, and record the commit SHAs; drop the `implement` blocks. Never compact without the user's confirmation, and never compact a file that still has open tasks.
4. **Never hand-edit** `index.md` or `kanban.md`. They are generated views; frontmatter here is the source of truth.
