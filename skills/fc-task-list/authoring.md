# fc-task-list: authoring

The fc-task-list skill's authoring rules. `SKILL.md` in this folder holds the schema and everything an executor needs; read both before you create a task list, add a task to one, or validate one.

## Creating a list and adding a task

**CRITICAL: "create a task list for X" means CREATE THE FILE, NOT A TASK.**

When the user says "create a task list for X":

1. Do NOT add any task to any existing file.
2. Ask which authoring mode applies (see **Two authoring modes** in SKILL.md).
3. Create `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md` with the frontmatter, heading, and summary block only (no tasks). Claim its `TL-N-SUFFIX` ID from the registry first (see SKILL.md, File frontmatter). The filename is built from it. If the workstream folder is new, create it with `--new-ws` (CONVENTIONS.md, Creating a workstream).
4. Tell the user the file was created, with its ID and mode.

When the user says "add a task to X":

1. Resolve the file path: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`.
2. If the file doesn't exist, create it first as above, then add the task.
3. Resolve the file's mode before authoring the task. The mode determines the form of `implement`.

## Runtime detection

At authoring time, record from disk alone how the project runs itself:

- `runtime`: a double-quoted command or approach found in a `start`/`dev` script, a Makefile target, a binary entrypoint, or a static-file approach for plain HTML (e.g. `"npm run dev"`, `"make serve"`, `"static: index.html"`); `none` when nothing runs.
- `e2e_tooling`: browser or e2e tooling already present (a Playwright, Cypress or Puppeteer config or dependency, an existing `e2e/` directory) as an inline array; `[]` when none.

Detection only: never invent, install or configure anything. These two keys alone decide, for the whole list, whether a probe exists: `runtime: none` allows no probe, and `e2e_tooling: []` allows no `rendered` probe (see **Evidence classes** in SKILL.md). A list with no `runtime` key predates this rule: read it as `none`.

## Test commands detection

At authoring time, record from disk alone, as `test_commands`, every test suite the project defines: an inline array of double-quoted commands, each run from the project root.

- Record a command only where a project file names it: a build-tool script or target, a CI step, or an equivalent. A runner's default command that no project file names is never recorded.
- Record every suite (unit, integration, e2e), not one. Leave out a command that only runs other recorded ones, and every lint, type-check or build command.
- `[]` means the project defines no suite: the list then has no test-update or test-run task.

Detection only: never invent, install or configure anything. Only the **Test-run task** (SKILL.md) runs these commands. A list with no `test_commands` key predates this rule.

## Writing verify steps

See **Smoke Tests** below for tasks whose output is a class/method with observable state. Each step asserts something specific to the change (a grep, a count, a file-existence check). Add the project's own lint or type-check command alongside, only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent); never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step: it asserts nothing about the task and passes before the change as readily as after. A suite runs in one place only: the list's final test-run task (see **Test-run task** in SKILL.md). **Measure before you write.** Where a step asserts a count, a file's existence, or the presence or absence of a string, run it at `base_commit` before writing it down and record what it actually returned, not what you expect. Where it already passes with nothing changed it does not discriminate: rewrite it until it fails at `base_commit`, or state in the step why it cannot fail there. Rewriting makes the assertion specific to the change; it never deletes the step or weakens what it asserts.

## Where the detail sits, by mode

Both modes use the same schema, but the informational load moves. Filling every key to the same depth in both modes is what makes task files bloat.

| Key | `spec` | `diff` |
| --- | --- | --- |
| `implement` | **Terse.** Intent plus anchor. The executor derives the edit. | **Long.** The block *is* the task. |
| `imports`, `compatibility`, `gotcha` | **Task-local when a plan backs the list.** Only facts the plan does not state, a few lines each, naming the plan section each extends; a key with nothing to add is omitted, and copying the plan's Design into a task is duplication. **Rich** only when no plan backs the list (e.g. authored from an issue list alone): then these constraints are what let the executor derive a correct edit. | **Terse.** The block already encodes them; restating is duplication. |
| `checklist` | Outcome-based, "behaviour X holds", "no caller of Y is broken". | Mechanical, "block applied cleanly", "`grep` confirms Z", "type-check clean". |
| `verify` | May require judgement about the result. | Should be a runnable command with an unambiguous pass/fail. |

When a plan backs the list, each parent task realises one plan stage, and its child
tasks are derived from that stage's goal, the plan's Design contracts and Content
specification values, and its acceptance criteria. The plan carries no per-task
detail to copy. A list authored
from an issue list is unaffected.

## Divergences

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
  summary, not inline in a task's prose, and not as a bold inline paragraph.

## Smoke Tests

A smoke test is a minimal script that instantiates/calls the changed code with concrete inputs and asserts a concrete expected output/state, proving it runs and does the basic thing, without a full test suite.

When generating a task that adds/changes a class or method with externally observable state (file written, DB row, API response, computed value), ask the user: *"Add a smoke-test verify step for this task?"* If yes, the `verify` entry must specify, inline, not just "run a smoke test":
- exact instantiation/call (class, method, args)
- concrete input values (e.g. temp dir, sample IDs)
- exact expected output and how to compute it independently of the code under test
- runtime to execute it with (match the project's actual entrypoint runtime, e.g. `tsx`, not `bun`, if the project runs via `tsx`; verify with the user or codebase if unknown)
- cleanup step if it writes temp files

## Authoring rules

- Always include a detailed-yet-concise summary of the feature, from the discussion recently conducted about it, to give the section context. It sits under the `## Feature Name` heading, after the frontmatter.
- Only add tasks that don't already exist in the file.
- Where the edit authored a new task list, close by offering a standalone `/fc-validate` of it against the plan or issue list it was authored from. Offer this only for a newly authored list, never after a status flip, a checkbox change, or a one-line correction.
