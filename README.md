![FlowCharge](flowcharge-name-logo-readme.png)

**FlowCharge is a markdown project-management suite that runs in your agent sessions,
writing every plan, issue and task into your repository to keep the project on
track.**

## What it is

FlowCharge Core is the engine: skill and script files that your coding agent loads at
the start of a session. There is no separate mode. Mid-conversation you can ask for a
plan, an issue list or a task list and get one. A full request runs as an ordered
pipeline: investigate, plan, file, task, execute, commit. Every stage runs in the
session that loaded the orchestrator, with no subagents. Every artifact is written
to markdown in your repository. It runs in any agent that loads skills, and needs
Node 16 with nothing to install. FlowCharge is the application that installs it and
shows the board.

## The idea

Every artifact is a markdown file that opens with YAML frontmatter. **That
frontmatter is the single source of truth.** Statuses, dependencies and IDs live
there. The index and the board are generated views, rewritten from it. You never
hand-edit a view. You change the data, and FlowCharge Core regenerates the view.

Dependencies are data, not prose. A task list authored from an issue list carries
`depends_on: [IL-3-k9d2s5]`, and the orchestrator refuses to run it until IL-3-k9d2s5
is `done`.

Every stage follows its stage file **as written**, with only marked slots filled, so
every run is predictable. Detail in means better code out, so every
task carries the context the agent that runs it needs: the exact anchor to edit, the
imports to add, the trap to avoid, the verify command and the acceptance checklist.

## Install

You need an agentic coding tool that loads `SKILL.md` folders,
**Node 16 or newer** for the generator script, with nothing to install, and **git**.
Claude Code, OpenCode and OpenAI Codex are proven.

`<skills-dir>` below is the folder your tool loads skills from, `~/.claude/skills/`
for Claude Code. Delete any older folder of the same name in `<skills-dir>` first.

**From the release zip.** Download `flowcharge-core-<X.Y.Z>.zip` from the
[Releases page](https://github.com/FlowChargeApp/flowcharge-core/releases) and unzip
it into `<skills-dir>`. The current release is `0.1.0`. The skill folders sit at the
top level of the archive, so this is the whole install:

```bash
unzip flowcharge-core-<X.Y.Z>.zip -d <skills-dir>
```

```powershell
Expand-Archive flowcharge-core-<X.Y.Z>.zip -DestinationPath <skills-dir>
```

**From a clone.** Link the skill folders so an edit here takes effect immediately.
Run from the root of your clone:

```bash
for s in skills/*/; do ln -s "$PWD/${s%/}" "<skills-dir>/$(basename "$s")"; done
```

If your tool or filesystem does not follow symbolic links, use
`cp -R skills/*/ <skills-dir>/` instead, and copy again after every pull.

## Use

Type `/flowcharge` once to load the orchestrator. For the rest of the session, tell
it what you want in plain English:

```
Create a new workstream, with the tags #button #extra+, to add a sort button to the main list of users

Write up a plan and open tasks

Create a feature branch, execute all tasks, committing after each task
```

You reach for `/flowcharge` again only at a new decision point, not before every
request. The orchestrator keeps the index and the board fresh at every stage
boundary. There is no script for you to run.

You can also start the whole pipeline as one separate agent, for example in the
background. That agent loads the orchestrator and runs every stage itself. It cannot
ask you anything, so it stops at an execute or commit prompt you did not waive.

| Operation        | What it does                                                          | Say something like                                              |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| backlog-add      | Creates workstreams in the backlog column of the board                | "Create a workstream to implement an export feature"            |
| investigate      | Reads the codebase and returns findings; goes no further unless asked | "Investigate the codebase to determine the cause of this bug"   |
| plan-and-tasks   | Writes a staged plan for a feature and authors its task list          | "Write up a plan and open tasks"                                |
| issues-and-tasks | Files findings as an issue list and authors a task list from them     | "Write up an issue list and open tasks"                         |
| execute-tasks    | Runs a task list, one parent task at a time, in order                 | "Execute all tasks"                                             |
| commit           | Commits the completed work                                            | "Commit all changes"                                            |
| list             | Prints a table of what is in flight                                   | "List what is in flight"                                        |

Task lists are written in spec mode by default, and you ask for diff mode when you
want it.

You can add your own instructions to any operation. Ask to execute all tasks,
committing after each one, and the orchestrator does exactly that.

FlowCharge Core only does what you asked: "Write up an issue list" stops at
the issue list. Any failure halts the pipeline rather than improvising around it.

When your project already defines its own test suites, in a build-tool script, a CI
step or an equivalent, every task list records those commands and ends with two
tasks. A test-update task updates any existing test the change makes wrong. A
test-gate task runs the suites once before the first task and once after the last.
A project with no suites gets neither task, and nothing is installed or configured.

A failing test gate does not halt the run at once. The orchestrator files each new
failure as an issue in the same workstream and fixes it through a new task list,
never inline. It halts after two fix rounds that do not pass. A failure that was
already there before the first task never blocks the run, and its issue stays open.

## How often it stops for you

An optional `flowcharge/agents.md` in your project sets three standing defaults and
holds one reserved key:

```
default_agent: <agent type>        # unused; kept for a possible future parallel mode
task_list_mode: spec | diff        # how task lists are authored
prompts: manual | assist | cruise  # how much the orchestrator decides on its own
validate: on | off                 # whether artefacts are checked against their source
```

`on` runs one check of the run's artefacts against what they were authored from; `off`
runs none and is the cheaper, faster choice.

`prompts:` decides how much of a run comes back to you. `manual` is the default.

- `manual`: every question comes to you, and execute and commit wait for your yes.
- `assist`: the orchestrator settles a question itself when the stage supplied a
  recommendation and the change carries no real risk. It still asks when the change
  could lose work, when it alters something others cannot opt out of, such as an
  interface, a stored format, a default, a dependency or the build and release path,
  or when it needs edits outside what you asked for. Execute and commit run without
  asking.
- `cruise`: the orchestrator adopts every recommendation and records the risky ones.
  Execute and commit run without asking.

Three floors hold at every setting. A question with no recommendation always comes to
you. Anything that could lose work, data or history always comes to you. A failure
always halts the run.

Tell the orchestrator "default to diff mode for this project" and it writes the
matching line for you.

## Layout in a target project

FlowCharge Core adds one folder to your project, `flowcharge/`, plus three lines to
your `.gitignore` for the generated files. Each workstream, the unit of work the
board tracks, gets one folder under `flowcharge/workstreams/`. Date is metadata,
never location.

```
flowcharge/
  ids.md                          # the global ID registry
  agents.md                       # optional per-project defaults (see above)
  tags.md                         # the tag pool: every workstream tag is defined here
  index.md                        # GENERATED: the query layer
  kanban.md                       # GENERATED: the board FlowCharge displays
  workstreams/<WS-N-SUFFIX>-<slug>/   # workstream.md, plus its plan, issue list, task list
  archive/<WS-N-SUFFIX>-<slug>/       # archived workstreams, same shape
```

`workstream.md` is the workstream record, and it drives the board card. The plan, the
issue list and the task list are optional and sit beside it.

**IDs** are global, permanent, and never reused: `WS-N-SUFFIX` workstream,
`PLN-N-SUFFIX` plan, `IL-N-SUFFIX` issue list, `TL-N-SUFFIX` task list,
`ISS-N-SUFFIX` issue. `SUFFIX` is six random lowercase base-36 characters, so two
independent clones never collide on an ID.

**Status** is one enum on every artifact: `backlog | ready | in-progress | done |
dropped`. An individual issue adds `blocked`. The full data model is
[`skills/flowcharge/CONVENTIONS.md`](skills/flowcharge/CONVENTIONS.md). Where any
skill disagrees with it, that document wins.

## What is in this repo

| Path | What it is |
|---|---|
| `skills/flowcharge/` | The orchestrator: hard rules, operations, the stage files it follows as written, the generator |
| `skills/flowcharge/CONVENTIONS.md` | The canonical data model. Start here |
| `skills/fc-issue-list/` | Issue-list schema: per-issue YAML blocks, severities, cross-linking |
| `skills/fc-task-list/` | Task-list schema: spec and diff modes, `base_commit` guard, test-update and test-gate tasks, self-eval |
| `skills/fc-plain-text-kanban/` | Board skill: the generated-view rules and file format |
| `skills/fc-plan-feature/` | Feature planning: approach prompt, required plan structure |
| `skills/fc-validate/` | Checks an authored artifact against its source |
| `skills/fc-git/` | Disciplined git operations: commit, branch, merge, worktrees, recovery |
| `skills/fc-dev-principles/` | Engineering-principles checklist loaded by the planning and tasking prompts |

Every skill also works on its own, `/fc-plan-feature` or `/fc-git`, when you want a
single artifact rather than a pipeline.

Also here: [`CHANGELOG.md`](CHANGELOG.md), and [`VERSIONING.md`](VERSIONING.md),
which sets one suite version and mirrors it into every `SKILL.md`.

## The other half

[FlowCharge](https://github.com/FlowChargeApp/flowcharge) is the application. It
installs Core, tracks its version, updates it in one click, and renders every
workstream as a card on a local board with five columns: Backlog, Ready, In Progress,
Done, Dropped. Each runs on its own: Core needs no application, and FlowCharge reads
any `flowcharge/` folder, whoever wrote it.

## Contributing

Bug reports and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
first.

---

FlowCharge Core is released under the [MIT License](LICENSE).
To report a vulnerability, see [SECURITY.md](SECURITY.md).
Copyright (c) 2026 Anthony Koukoullis.
