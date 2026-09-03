```
   ███████╗██╗      ██████╗ ██╗    ██╗ ██████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ███████╗
   ██╔════╝██║     ██╔═══██╗██║    ██║██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝ ██╔════╝
   █████╗  ██║     ██║   ██║██║ █╗ ██║██║     ███████║███████║██████╔╝██║  ███╗█████╗  
   ██╔══╝  ██║     ██║   ██║██║███╗██║██║     ██╔══██║██╔══██║██╔══██╗██║   ██║██╔══╝  
   ██║     ███████╗╚██████╔╝╚███╔███╔╝╚██████╗██║  ██║██║  ██║██║  ██║╚██████╔╝███████╗
   ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**Give your coding agents a project manager.** One plain-English request becomes a
plan or issue list, a task list, working code and a commit — every step written to
markdown files you can read, edit, and diff.

Every plan, issue and task carries the deep, specific context an agent needs —
context is king, and detail in means better code out.

**FlowCharge Core** is the skills half of FlowCharge: drop the skill folders into
your agentic coding tool and it runs. Tested in Claude Code, OpenCode and OpenAI
Codex, with a range of capable models, local models included. The FlowCharge app
installs this suite and displays its board; this repository is the suite itself, and
it works on its own.

---

## The idea

Every artefact is a markdown file that opens with YAML frontmatter. **That frontmatter
is the single source of truth.** Statuses, dependencies, and IDs live there; the index
and the kanban board are *generated views* rewritten from it. You never hand-edit a
view — you change the data and FlowCharge Core regenerates it.

Dependencies are data, not prose. A task list authored from an issue list carries
`depends_on: [IL-3-k9d2s5]`, and the orchestrator refuses to execute it until
IL-3-k9d2s5 is `done`. And the prompt templates the subagents run are reproduced
**verbatim**, with only marked slots filled, so every run is predictable.

---

## Install

You need an agentic coding tool that loads `SKILL.md` folders and can spawn
subagents, **Node >= 16** for the generator script (no dependencies to install), and
**git**.

`<skills-dir>` below is the folder your tool loads skills from — `~/.claude/skills/`
for Claude Code. Delete any older folder of the same name in `<skills-dir>` first.

**From the release zip.** Download `flowcharge-skills-<X.Y.Z>.zip` from the Releases
page and unzip it into `<skills-dir>`. The skill folders sit at the archive's top
level, so this is the whole install:

```bash
unzip flowcharge-skills-<X.Y.Z>.zip -d <skills-dir>
```

```powershell
Expand-Archive flowcharge-skills-<X.Y.Z>.zip -DestinationPath <skills-dir>
```

**From a clone.** Link the skill folders so an edit here takes effect immediately.
Run from the root of your clone:

```bash
for s in skills/*/; do ln -s "$PWD/${s%/}" "<skills-dir>/$(basename "$s")"; done
```

If your tool or filesystem does not follow symbolic links, use
`cp -R skills/*/ <skills-dir>/` instead, and re-copy after every pull.

---

## Use

Type `/flowcharge` once to load the orchestrator. For the rest of the session, just
tell it what you want in plain English:

```
Create a new workstream, with the tags #button #extra+, to add a sort button to the main list of users 

Write up a plan and open tasks

Create a feature branch, execute all tasks, committing after each task
```

You only reach for `/flowcharge` again at a genuinely new decision point, not before
every request. The orchestrator keeps the index and board fresh itself at every stage
boundary; there is no script for you to run.

| Operation | What it does | Say something like |
|---|---|---|
| investigate | Reads the codebase and returns findings; goes no further unless asked | "look into why the export job stalls" |
| create-plan | Writes a staged implementation plan for a feature | "plan the export feature" |
| create-issues | Files findings from the conversation as an issue list | "file these findings as issues" |
| tasks-from-plan | Authors a task list from a plan, in spec or diff mode | "turn that plan into tasks" |
| tasks-from-issues | Authors a task list from an issue list | "turn the issue list into tasks" |
| execute-tasks | Runs a task list, one parent task per subagent — **prompted** | "run the task list" |
| commit | Commits the completed work — **prompted** | "commit it" |
| backlog-add | Adds workstreams to the backlog column of the board | "add 'retry logic' to the backlog" |
| list | Prints a table of what is in flight | "what is in flight?" |

Every authored artefact is checked against its source before the pipeline moves on.
FlowCharge Core only does what you asked: "file these findings as issues" stops at the
issue list. Any failure halts the pipeline rather than improvising around it.

**How often it stops for you.** An optional `flowcharge/agents.md` in your project
sets three standing defaults:

```
default_agent: <subagent type>     # which agent runs each stage
task_list_mode: spec | diff        # how task lists are authored
prompts: manual | assist | cruise  # how much the orchestrator decides on its own
```

A run stops for you in two situations: a subagent raises a question or flags a task
as risky, and the **execute** and **commit** stages ask before they run. `prompts:`
sets how the orchestrator handles both:

- `manual` (the default) — every question comes to you, and execute and commit wait
  for your yes.
- `assist` — the orchestrator answers a question itself when the subagent supplied a
  recommendation and the change is low-risk. It still asks when the change could
  lose work, alters something others cannot opt out of (an interface, a stored
  format, a default, a dependency, the build or release path), or needs edits
  outside what you asked for. Execute and commit run without asking.
- `cruise` — the orchestrator adopts every recommendation and records the risky
  ones. Only a change that could lose work, data or history still stops it. Execute
  and commit run without asking.

Under every tier, a question with no recommendation comes to you, and a failure halts
the run. Tell the orchestrator "default to diff mode for this project" and it writes
the matching line for you.

---

## Layout in a target project

FlowCharge Core adds one folder to your project, `flowcharge/`, plus three lines to
your `.gitignore` for the generated files. One folder per **workstream** — the unit
of work the board tracks — under `flowcharge/workstreams/`. Date is metadata, never
location.

```
flowcharge/
  ids.md                          # global ID registry
  agents.md                       # optional per-project defaults (see above)
  tags.md                         # the tag pool — every workstream tag is defined here
  index.md                        # GENERATED — the query layer
  kanban.md                       # GENERATED — the board the FlowCharge app displays
  workstreams/
    <WS-N-SUFFIX>-<slug>/
      workstream.md               # the workstream record — drives the board card
      <PLN-id>-plan.md            # optional
      <IL-id>-issuelist.md        # optional
      <TL-id>-tasklist.md         # optional
  archive/
    <WS-N-SUFFIX>-<slug>/         # archived workstreams, same shape
```

**IDs** are global, permanent, and never reused: `WS-N-SUFFIX` workstream,
`PLN-N-SUFFIX` plan, `IL-N-SUFFIX` issue list, `TL-N-SUFFIX` task list,
`ISS-N-SUFFIX` issue. `SUFFIX` is 6 random lowercase base-36 characters, so two independent
clones never collide on an ID.

**Status** is one enum on every artefact: `backlog | ready | in-progress | done |
dropped`. An individual issue adds `blocked`. The full data model is
[`skills/flowcharge/CONVENTIONS.md`](skills/flowcharge/CONVENTIONS.md); where any skill
disagrees with it, that document wins.

---

## What's in this repo

| Path | What it is |
|---|---|
| `skills/flowcharge/` | The orchestrator — hard rules, operations, the verbatim prompt templates, the generator |
| `skills/flowcharge/CONVENTIONS.md` | The canonical data model. Start here |
| `skills/fc-issue-list/` | Issue-list schema — per-issue YAML blocks, severities, cross-linking |
| `skills/fc-task-list/` | Task-list schema — spec/diff modes, `base_commit` guard, self-eval |
| `skills/fc-plain-text-kanban/` | Board skill — the generated-view rules and file format |
| `skills/fc-plan-feature/` | Feature planning — approach prompt, required plan structure |
| `skills/fc-validate/` | Checks an authored artefact against its source |
| `skills/fc-git/` | Disciplined git operations — commit, branch, merge, worktrees, recovery |
| `skills/fc-dev-principles/` | Engineering-principles checklist loaded by the planning and tasking prompts |

Every skill also works on its own — `/fc-plan-feature`, `/fc-validate`, `/fc-git` —
when you want a single artefact rather than a pipeline.

Also here: [`CHANGELOG.md`](CHANGELOG.md), [`VERSIONING.md`](VERSIONING.md) (one suite
version, mirrored into every `SKILL.md`), [`CONTRIBUTING.md`](CONTRIBUTING.md), and the
Releases page for the installable zip of each tagged version.

---

## License

FlowCharge Core is released under the [MIT License](LICENSE).

Copyright (c) 2026 Anthony Koukoullis.
