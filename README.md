![FlowCharge](flowcharge-name-logo-readme.png)

**FlowCharge is a markdown project-management suite that runs in your agent sessions,
writing every plan, issue and task into your repository to keep the project on
track.**

## What it is

FlowCharge Core is the engine: the skill and script files your coding agent loads, so
that one plain-English request becomes a plan, an issue list and a task list in your
repository. Ask for any one of them in the middle of an ordinary conversation, or ask
for the whole run: investigate, plan, file, task, execute, commit. Every stage runs
in the session you already have open, and you can hand the whole pipeline to a
separate agent when you would rather it worked in the background. It runs in any
agent that loads skills, and Node 16 or newer is all it needs. FlowCharge is the
application that installs it and shows the board.

To run the pipeline in the background, start a separate agent the way your tool
starts any other, and pass it your request verbatim. That agent loads the
orchestrator and runs every stage itself. It has no way to reach you, so waive the
execute and commit prompts in the request, or set `prompts: cruise` (see Settings).
Otherwise it stops at the first prompt, and you pick the run up from there.

## The idea

Every stage follows its stage file **as written**, with only marked slots filled, so
every run is predictable. Detail in means better code out, so every task carries the
context the agent needs: the exact anchor, the imports, the trap to avoid, the verify
command and the acceptance checklist.

Dependencies are data. A task list authored from an issue list carries
`depends_on: [IL-3-k9d2s5]` and runs only once IL-3-k9d2s5 is `done`.

Every artifact is a markdown file with YAML frontmatter, and **that frontmatter is
the single source of truth**: statuses, dependencies and IDs live there. The index
and the board are generated views, rewritten from it. You change the data, and Core
regenerates the view.

## Install

You need an agentic coding tool that loads `SKILL.md` folders, **Node 16 or newer**
for the generator script, and **git**. Core has no dependencies of its own. Claude
Code, OpenCode and OpenAI Codex are proven.

`<skills-dir>` is the folder your tool loads skills from, `~/.claude/skills/` for
Claude Code. Delete any earlier release's skill folders from it first: unzipping
overwrites, but never deletes.

**From the release zip.** The current release is `0.5.0`. Download
`flowcharge-core-<X.Y.Z>.zip` from the
[Releases page](https://github.com/FlowChargeApp/flowcharge-core/releases) and unzip
it into `<skills-dir>`. The skill folders sit at the top level of the archive, so
this is the whole install.

macOS and Linux:

```bash
unzip flowcharge-core-<X.Y.Z>.zip -d <skills-dir>
```

Windows PowerShell:

```powershell
Expand-Archive flowcharge-core-<X.Y.Z>.zip -DestinationPath <skills-dir>
```

**From a clone.** Link the skill folders, so an edit in the clone takes effect at
once. From the root of the clone:

```bash
for s in skills/*/; do ln -s "$PWD/${s%/}" "<skills-dir>/$(basename "$s")"; done
```

If your tool or filesystem does not follow symbolic links, use
`cp -R skills/*/ <skills-dir>/` instead, and copy again after every pull.

## Use

A workstream is one piece of work the board tracks, and every run belongs to one.
Type `/flowcharge` once to load the orchestrator. For the rest of the session, tell
it what you want in plain English:

```
Create a new workstream, with the tags #button #extra+, to add a sort button to the main list of users

Write up a plan and open tasks

Create a feature branch, execute all tasks, committing after each task
```

`#tag` words set the workstream's tags exactly. A trailing `+`, as in `#extra+`,
keeps your words and lets the orchestrator add tags from the project's pool.

Type `/flowcharge` again only for a new piece of work, not before every request. The
orchestrator runs the generator itself at every stage boundary, so the index and the
board stay fresh.

| Operation        | What it does                                                          | Say something like                                              |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| backlog-add      | Creates workstreams in the backlog column of the board                | "Create a workstream to implement an export feature"            |
| investigate      | Reads the codebase and returns findings; goes no further unless asked | "Investigate the codebase to determine the cause of this bug"   |
| plan-and-tasks   | Writes a staged plan for a feature and writes its task list           | "Write up a plan and open tasks"                                |
| issues-and-tasks | Files findings as an issue list and writes a task list from them      | "Write up an issue list and open tasks"                         |
| execute-tasks    | Runs a task list, one parent task at a time, in order                 | "Execute all tasks"                                             |
| commit           | Commits the completed work                                            | "Commit all changes"                                            |
| list             | Prints a table of what is in flight                                   | "List what is in flight"                                        |

Task lists default to spec mode, which describes each edit in prose and names its
anchor. Diff mode carries a SEARCH/REPLACE block per edit. Ask for it when you want
it.

Add your own instructions to any operation: "execute all tasks, committing after
each one" does exactly that.

Core does only what you asked: "Write up an issue list" stops at the issue list. A
failure halts the pipeline, and the orchestrator reports what ran, what failed and
what did not run. It never improvises a fix.

When your project defines its own test suites, every task list records their
commands in `test_commands` and ends with two tasks: one updates the tests the change
makes wrong, one runs the suites. A failing test-run task starts a fix round rather
than a halt: each failure is filed as an issue and fixed through a new task list.
After two failed rounds the run halts. A project with no suites gets neither task.
Full rules: [`skills/fc-task-list/SKILL.md`](skills/fc-task-list/SKILL.md).

## Settings

An optional `flowcharge/agents.md` in your project sets three standing defaults:

```
task_list_mode: spec | diff        # how task lists are authored
prompts: manual | assist | cruise  # how much the orchestrator decides on its own
validate: on | off                 # whether artifacts are checked against their source
```

`prompts:` decides how much of a run comes back to you. The default is `manual`.

- `manual`: every question comes to you. Execute and commit wait for your yes.
- `assist`: the orchestrator settles a question itself when the stage supplied a
  recommendation and the change carries no real risk. It still asks when the change
  could lose work, when it alters something others cannot opt out of (an interface,
  a stored format, a default, a dependency, the build and release path), or when it
  needs edits outside what you asked for. Execute and commit run without asking.
- `cruise`: the orchestrator adopts every recommendation and records the ones that
  fail those three tests. Execute and commit run without asking.

At every setting, a question with no recommendation comes to you, anything that could
lose work, data or history comes to you, and an aborted task, a failed checklist item
or an incomplete stage halts the run. A failing test-run task halts only at its
two-round cap, described under Use.

Tell the orchestrator "default to diff mode for this project" and it writes the
matching line for you.

`validate` defaults to `on`: after each authoring stage, the orchestrator checks what
that stage wrote against its source material. `off` skips the check and is the more
token-efficient choice.

## Layout in a target project

Core adds one folder, `flowcharge/`, plus three `.gitignore` lines for the two
generated views and the temporary ID-claim markers. Each workstream, the unit of work
the board tracks, gets one folder under `flowcharge/workstreams/`. Dates live in
frontmatter, never in folder names.

```
flowcharge/
  ids.md                          # the global ID registry
  ids/                            # temporary ID-claim markers, git-ignored
  agents.md                       # optional per-project defaults (see above)
  tags.md                         # the tag pool: every workstream tag is defined here
  index.md                        # GENERATED: the index of every artifact and its status
  kanban.md                       # GENERATED: the board FlowCharge displays
  workstreams/<WS-N-SUFFIX>-<slug>/   # workstream.md, plus its plan, issue list, task list
  archive/<WS-N-SUFFIX>-<slug>/       # archived workstreams, same shape
```

`workstream.md` is the workstream record and drives the board card. Its plan, issue
list and task list are optional and sit beside it.

**IDs** are global, permanent and never reused: `WS-N-SUFFIX` workstream,
`PLN-N-SUFFIX` plan, `IL-N-SUFFIX` issue list, `TL-N-SUFFIX` task list,
`ISS-N-SUFFIX` issue. `SUFFIX` is six random lowercase base-36 characters, so two
independent clones never collide on an ID.

**Status** is one enum on every artifact: `backlog | ready | in-progress | done |
dropped`; an issue adds `blocked`. The full data model is
[`skills/flowcharge/CONVENTIONS.md`](skills/flowcharge/CONVENTIONS.md), and it wins
where a skill file disagrees.

## What is in this repo

| Path | What it is |
|---|---|
| `skills/flowcharge/` | The orchestrator: hard rules, operations, the stage files it follows as written, the generator |
| `skills/flowcharge/CONVENTIONS.md` | The canonical data model. Start here |
| `skills/fc-issue-list/` | Issue-list schema: per-issue YAML blocks, severities, cross-linking |
| `skills/fc-task-list/` | Task-list schema: spec and diff modes, `base_commit` guard, test-update and test-run tasks, self-eval |
| `skills/fc-plain-text-kanban/` | Board skill: the generated-view rules and file format |
| `skills/fc-plan-feature/` | Feature planning: approach prompt, required plan structure |
| `skills/fc-validate/` | Checks an authored artifact against its source |
| `skills/fc-git/` | Disciplined git operations: commit, branch, merge, worktrees, recovery |
| `skills/fc-dev-principles/` | Engineering-principles checklist the planning and issue stage files load |

Each skill also runs on its own, for example `/fc-plan-feature` or `/fc-git`, when
you want one artifact rather than a pipeline.

Also here: [`CHANGELOG.md`](CHANGELOG.md) and [`VERSIONING.md`](VERSIONING.md), which
describes the one suite version every `SKILL.md` mirrors.

## The other half

[FlowCharge](https://github.com/FlowChargeApp/flowcharge) is the application. It
installs Core, tracks Core's version, updates Core in one click, and renders every
workstream as a card on a local board with five columns: Backlog, Ready, In Progress,
Done, Dropped. Each works without the other: Core runs with no application installed,
and FlowCharge reads any `flowcharge/` folder, whoever wrote it.

## Contributing

Report a bug or request a feature as a GitHub issue.
[CONTRIBUTING.md](CONTRIBUTING.md) documents the maintainer's own process.

---

FlowCharge Core is released under the [MIT License](LICENSE).
To report a vulnerability, see [SECURITY.md](SECURITY.md).
Copyright (c) 2026 Anthony Koukoullis.
