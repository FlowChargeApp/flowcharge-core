# FlowCharge Core Conventions

The data model for the FlowCharge Core project-management suite. Every FlowCharge Core skill
follows this document; where a skill's own prose and this document disagree, this
document wins.

## Layout: workstream folders, not date buckets

Everything lives under `flowcharge/` at the project root. Nothing else pollutes the
project. One subfolder per workstream under `flowcharge/workstreams/`:

```
flowcharge/
  ids.md                      # ID registry (see IDs)
  agents.md                   # optional; local per-project preference manifest,
                                  # not a tracked artefact (see flowcharge/SKILL.md)
  index.md                    # GENERATED, never hand-edited
  kanban.md                   # GENERATED view of workstream statuses
  workstreams/
    <WS-N-SUFFIX>-<slug>/
      workstream.md           # the workstream record (drives the kanban card)
      <PLN-id>-plan.md        # optional
      <IL-id>-issuelist.md    # optional; extras as <IL-id>-issuelist-<qualifier>.md
      <TL-id>-tasklist.md     # optional; extras as <TL-id>-tasklist-<qualifier>.md
  archive/
    <WS-N-SUFFIX>-<slug>/         # archived workstreams, same shape (see Archiving)
```

**Filename naming contract.** A plan, an issue list and a task list each carry their
own ID as a filename prefix. The contract is three rules and nothing more:

- The prefix is the artefact's own frontmatter `id`, byte for byte, followed by one
  hyphen.
- The prefix ID type must match the artefact type: a `PLN` prefix belongs only on a
  plan, an `IL` prefix only on an issue list, and a `TL` prefix only on a task list.
- The qualifier keeps its position after the plain name, never between the prefix and
  the plain name. `IL-7-k2m9x1-issuelist-second.md` is the correct form.

`workstream.md` keeps its plain name. Its folder already carries the workstream ID,
so a prefix would add nothing, and three independent scanners key on the plain filename
as the workstream-folder marker: the generator's folder-marker test at
`fc-index.mjs:1359`, and two locate-and-skip sites in the FlowCharge application's
repository. Keeping the name plain means none of the three changes.

**The legacy form.** The generator still indexes an artefact carrying the old bare
name (`plan.md`, for example) and WARNs
`<file>: legacy filename: rename to <id>-<basename> to carry its id`, naming the
ID-prefixed name that file should take.

## Allowed variation

Three properties of a `flowcharge/` tree are unconstrained by design. The generator
emits no warning for any of them:

- **An empty `flowcharge/archive/` directory.** A project that has archived nothing may
  keep the directory or leave it out. Neither state is a defect.
- **Non-artefact files at the `flowcharge/` root**, such as a notes file or
  `agents.md`. The generator reads the artefacts named above and ignores every
  other file at that level.
- **Whether `flowcharge/` is tracked by git.** Commit it or ignore it. The choice
  belongs to the project, and FlowCharge Core assumes neither.

Do not add a check for any of the three, and do not change a tree that shows
one.

## Project root: resolved once, shared by every worktree

`<project-root>` (the directory containing `flowcharge/`, referenced throughout this
document, every skill's regenerate command, and every skill's literal
`flowcharge/...` paths) is not simply the current working directory. Resolve it once,
before touching any `flowcharge/` path, whether through the generator script or
directly:

```bash
git rev-parse --path-format=absolute --git-common-dir 2>/dev/null | xargs -I{} dirname {}
```

This prints the same directory for a plain checkout and for every
`git worktree add` checkout of the same repository, so every worktree of a project
shares one `flowcharge/`. If the command fails (not a git repository), `<project-root>`
is the current working directory, unchanged from today. Treat the resolved value as
the base for every `flowcharge/...` reference anywhere in the FlowCharge Core skill suite,
including literal relative paths such as `./flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/...`. They
mean `<project-root>/flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/...`, never `./` from wherever the
shell happens to be.

Date is metadata (`created` in frontmatter), never location. There are no weekly
buckets and no per-file `_done/` moves. Completion is `status: done` in
frontmatter, and files stay in their workstream folder. The one location move in
FlowCharge Core is whole-workstream archiving (below), which keeps `workstreams/` holding
only live work.

## Archiving

Completion is a status; archiving is a later, explicit act of shelving, never
automatic. Rules:

- Only a workstream whose record is `status: done` or `dropped` (and whose
  artefacts are all done/dropped) may be archived.
- Archive by moving the ENTIRE folder: `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/` →
  `flowcharge/archive/<WS-N-SUFFIX>-<slug>/`. Never move individual files, never delete anything,
  and never change IDs. Archived artefacts keep their IDs and stay resolvable as
  `depends_on`/`links` targets.
- Then regenerate. Archived workstreams render in the board's hidden
  `Archive __archived__` column and are listed compactly under the index's
  **Archived** section; they are excluded from the active tables, ready-work, and
  staleness checks. The generator warns if anything not done/dropped sits in
  `archive/`.
- Unarchive by moving the folder back and regenerating.
- Archive on the user's say-so (or a standing instruction from them). A pipeline
  run finishing a workstream sets `done` but does not archive it.

**Slugs.** The folder name is `WS-N-SUFFIX-<slug>`, the workstream's full ID
followed by the slug, while the frontmatter `slug` key itself stays the bare, unprefixed
kebab-case slug describing the *specific* work (`scope-service-bug-fixes`, not
`scope-service`), reading as related to earlier work it extends. Reuse a slug, byte for
byte, only to continue that same workstream. `--new-ws` refuses a slug a live or archived
workstream already carries: pick a distinct one, and never rename or displace another
workstream's folder.

**Creating a workstream.** One command, and no other way:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--tags a,b]
```

It claims the WS id, creates `flowcharge/workstreams/<WS-id>-<slug>/`, writes
`workstream.md` there with every required key present and valid at `status: backlog`,
refuses a taken slug with nothing claimed, and prints two lines: the claimed id, then
the record's path relative to the project root. Use both verbatim. The body is left
empty: the caller appends it (`workstream` body, below) and regenerates. If `flowcharge/`
is missing, run `--init` first; it is a no-op when the tree exists, and its WARN that
`ids.md` is missing needs no action, because `--new-ws` seeds the registry as `--claim`
does.

## IDs

Global, permanent, never renumbered or reused. Every ID has the shape
`TYPE-N-SUFFIX`, where `SUFFIX` is exactly 6 lowercase base-36 characters
(`[0-9a-z]{6}`) drawn at claim time. The suffix is what makes an ID safe across
independently cloned `flowcharge/` trees: two clones can allocate the same `N` and
still never collide.

- `WS-N-SUFFIX`: workstream
- `PLN-N-SUFFIX`: plan
- `IL-N-SUFFIX`: issue list
- `TL-N-SUFFIX`: task list
- `ISS-N-SUFFIX`: issue (globally unique across all issue lists)

Tasks are numbered within their list (`1`, `2`, `1.1`, `2.3`) and addressed globally
as `TL-N-SUFFIX task M` (compact form `TL-4-a3x9k2.2.1` = task 2.1 in
`TL-4-a3x9k2`).

**Ordering.** Because `N` can be allocated in parallel by independent clones, and
`SUFFIX` is random, `--sort id`, the default for `fc-index.mjs --list`, is no
longer a true chronological order. Use `--sort created` when creation order is what
you need.

**Registry.** `flowcharge/ids.md` records the last-issued number per type:

```md
# FlowCharge ID Registry

Last-issued ID per type. To claim IDs, run node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim <TYPE> [<count>] and use the printed id(s) verbatim.

- WS: 0
- PLN: 0
- IL: 0
- TL: 0
- ISS: 0
```

Claims are made by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs
--root <project-root> --claim <TYPE> [<count>]`, which reserves ids using
`fs.mkdirSync` marker directories under `flowcharge/ids/`. Directory creation is
atomic and fails with `EEXIST` if the name is taken, so a losing concurrent
process simply retries the next number. No lock file or daemon is needed. If
the registry is missing, create it with all counters set to the highest ID
found by grepping `flowcharge/` (0 if none); `--claim` itself also seeds a
missing or stale counter safely, via its own three-source (registry, scanned
artefacts, marker directories) maximum.

**Tag pool.** `flowcharge/tags.md` lists the defined workstream tags, one per line
as `- <tag>`, lowercase, letters, digits and hyphens only. A tag is defined once it
is listed there. The index generator (`fc-index.mjs`) WARNs on any workstream tag
not listed, naming the nearest listed spelling when one is within a small edit
distance. A WARN with no suggestion still means the tag is undefined, not that it is
safe to leave.

## Frontmatter: every artefact, no exceptions

Every artefact file opens with a YAML frontmatter block. **Flat keys and inline
arrays only** (`depends_on: [TL-3-e2w7n4, ISS-12-f5r0t8]`). The index generator's parser depends
on this; no nested maps, no block lists in frontmatter.

```yaml
---
id: TL-4-a3x9k2
type: tasklist            # workstream | plan | issuelist | tasklist
workstream: WS-2-h4t6m8   # owning workstream's ID (a workstream names itself)
slug: scope-service-bug-fixes
title: "Fix scope service defects"
status: ready             # see Status lifecycle
created: 2026-07-29
updated: 2026-07-29       # bump on EVERY edit to the file
author: Ada Lovelace      # who authored it; see Author attribution
depends_on: []            # IDs that must be done before this may run (a plan or
                          # issue-list dependency counts as met once that
                          # artefact is authored)
links: []                 # related IDs, non-blocking
---
```

Additional keys by type:

- `workstream`: `tags`, chosen from the tag pool at `flowcharge/tags.md`, read first:
  reuse a listed spelling (including a different grammatical form of a listed idea)
  rather than inventing a near-miss; register a new pool entry only when the work's
  subject has no covering tag. A request may put tag words directly in the text as
  `#tag`, the only form a user may use to specify tags directly in a request; when
  present, those words, lowercased, become the workstream's entire `tags` set, replacing rather
  than adding to whatever would otherwise have been derived from the pool. The two
  automatic tags described below are the one exception. A trailing `+` on any such
  word (`#tag+`) switches this to a seed: the resolved words are all
  kept, and the flow may add further tags from the pool's existing spellings that
  match the work's subject: same reuse-first judgment, same bar for registering a new
  entry. Two tags are **automatic**: `issue` and `feature`. `issue` applies once the
  workstream holds an issue list carrying at least one filed issue; `feature` applies
  once the workstream holds a plan. Both may sit on one workstream at the same time,
  because a workstream may hold both a plan and a filed issue list. They are added on
  top of whatever the three tag modes produced: pool-derived, `#tag` and `#tag+`
  alike. In the exact `#tag` mode this means the request's words replace the derived
  set, and the automatic tags are then added on top of that result. The generator
  does not check this rule. It could: both triggers sit on disk, so the
  generator could read a workstream's folder and see `PLN-*-plan.md` or a filed issue
  list for itself. It refuses because the rule is forward-only. Every workstream
  authored before the rule already holds a plan or a filed issue list and carries
  neither tag, so a check would WARN across the whole existing corpus.
  Drives the board card's `#labels`.
  The body below the frontmatter has two jobs. Its **first line is the card
  description**: the generator lifts that one line onto the board, truncated at 200
  characters, and renders nothing after it, so that line must stand alone and stay
  inside 200 characters. **Everything below it is storage, and its length follows
  the originating request**: capture as much detail, reasoning and constraint as the
  request actually gave, in the request's own words, so a plan or task list can later be
  authored from this record alone without the user re-explaining. A one-line ask
  gives a one-line body; a request explained at length keeps that explanation. There
  is no length cap. Do not compress a detailed request to fit the board, because
  nothing past the first line reaches the board. Markdown headings are skipped by the
  generator, so the body may use them freely. What the body is **not** is a running
  log: it records the request as given, while analysis, design decisions and progress
  notes belong in the plan / issue list / task list.
  `blocked`: **optional**, workstream records only, and a single-line double-quoted
  scalar like `title`. Write it immediately after `title`, always before
  `status`. Its value is the reason the work cannot proceed. An absent key means the
  record is not blocked, and there is no boolean form, so a key that is present
  carries a non-empty reason. A record may carry it at any status. It has five
  effects. The record is excluded from ready-to-start work. It raises the staleness
  warning at any status once `updated` falls behind: `blocked but not updated for
  <n> days`, or `in-progress and blocked but not updated for <n> days` when both
  apply. A present-but-empty value WARNs
  `blocked is present but empty: give the reason or remove the key`. The kanban card
  gains a bold `**Blocked:** <reason>` line directly under the title line. And both
  `index.md`'s workstream table and `--list` append ` (blocked)` to the status
  cell. Nothing sets or clears the key automatically: a person writes it, and a person
  removes it.
- `plan`: `base_commit: <short-SHA>`, **optional**. It is the short SHA of `HEAD` at
  the moment the plan is authored, read with `git rev-parse --short HEAD`, and it dates
  the plan's reading of the codebase. A later stage authoring tasks from the plan diffs
  that SHA against current `HEAD` to learn which of the files the plan names have moved
  since, and reads again only those. A plan carrying no `base_commit` is read as undated,
  and every file it names is read again. **No script checks the key.** It is not required
  and its absence never warns, because the rule is forward-only: every plan already on
  disk was authored without it, so a required key would WARN across the whole existing
  corpus, exactly as the automatic `issue` and `feature` tags above would.
- `tasklist`: `mode: spec | diff`, and `base_commit: <short-SHA>` wherever any
  SEARCH/REPLACE block appears. (These live in frontmatter, not a separate header
  block.) **No script can check** when `base_commit` is required, because the
  condition is in the body, not the frontmatter, so the generator requires `mode`
  and never requires `base_commit`. The author supplies it. Also `runtime:
  "<command>" | none` and `e2e_tooling: [...]`, how the project runs itself and
  what browser/e2e tooling it already has, detected from disk at authoring (see the
  fc-task-list skill, Runtime detection). The generator checks neither, and an
  absent key reads as `none` and `[]`, because the rule is forward-only.

`depends_on` is data, not prose. Ordering constraints between workstreams or
artefacts go here, never only in a card's or file's body text.

Where the constraint is that defects must be fixed before this work starts, record the
fixing task list's ID, not the issue list's. A `tasklist` dependency requires `done`; an
issue-list dependency is met once authored, which is not the wait you mean. **No script can
check this**: whether a given `depends_on` entry expresses that constraint is a fact about the
author's intent, not the file's shape, so documented guidance is its only defence.

**Author attribution.** `author` is a plaintext name carried by all six record
kinds: the four artefact kinds above in their frontmatter (`workstream`, `plan`,
`issuelist`, `tasklist`), plus each issue inside an issue list and each adult or
child task inside a task list, in that item's own YAML. Parent tasks keep the
description-only rule and take no `author`; a mini-shape task inherits the file's. Read the value from the generator at
authoring time and write the printed line verbatim:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami
```

The command prints exactly one line and writes nothing. It prints the literal
string `unknown` when `git config user.name` is unset or the call fails, so a
missing local git identity never blocks a claim or an authoring step.

Treat the value as **local attribution, not a verified identity**, sourced from
the machine's own `git config user.name` at authoring time, which is
self-reported, can differ from the account that actually opens a GitHub pull
request, and can be blank or wrong on a misconfigured machine.

**No script can check** the rule, because the value is self-reported and cannot be
verified against anything the tree holds, so no `--check` warning exists for a
missing or empty `author`, by design. The field stays optional and non-blocking,
and the author supplies it.

**Workstream titles name the target, not the FlowCharge Core stage.** A workstream tracks one
real problem or feature in the project FlowCharge Core orchestrates (code, documentation, or
anything else) and its `title`, along with the first line of its body, must say what
that problem or feature is. Neither may name a FlowCharge Core pipeline stage or an
artefact-authoring act. "Fix the tier inheritance defect in the scope service" is a
workstream title; "Create issues for the scope service" is not, because it names
FlowCharge Core work instead of project work. Every plan, issue list and task list produced
while working one target belongs to the one workstream that names that target, however
many artefacts that turns out to be. The rule applies when a workstream is created.
An existing workstream record is never retitled or restructured to comply with it.

**Smell test.** Apply it before the folder is created: read the title and ask what it
promises. If it pairs a FlowCharge Core verb (create, author, file, write, open) with a FlowCharge Core
noun (issue, task, plan, workstream) instead of naming a defect or a feature, the
title is miscast. Rename it to the target it serves, then create the workstream. The
two word lists are examples, not a closed set; what the test turns on is what the
title describes. **No script can check** the test, because it reads meaning, not a
fixed vocabulary, so no generator check enforces it; the author applies it.

## Status lifecycle: one enum for artefacts

`backlog | ready | in-progress | done | dropped`

Applies to every artefact's frontmatter `status`: workstream, plan, issue list and
task list. An issue's own per-item `status` uses a six-state enum: these five values
plus `blocked`, defined in `fc-issue-list/SKILL.md`. Meanings:

- `backlog`: recorded and directly actionable. It is the status a new workstream
  starts at, and a run may author into such a record or execute against it with no
  intermediate step
- `ready`: optional, user-driven staging. A person marks records `ready` to batch the
  several workstreams they mean to work next. It is **never a gate** that work must
  pass through, because `backlog` is already actionable. For artefacts, freshly
  authored counts as ready (workstream records are the one exception: see the
  creation default below)
- `in-progress`: actively being worked
- `done`: complete and verified
- `dropped`: abandoned on purpose (wont-fix); record why in `notes`

**Creation default: a new workstream record starts at `backlog`.** This holds whatever
the workstream already holds at that moment: nothing, a plan only, an issue list only, or
a task list already authored. `backlog` says the work is recorded; `in-progress` says
something is working it, and a record created moments ago is the first, not the second.
The `ready` meaning above therefore carries a workstream exception: "freshly authored
counts as ready" covers plans, issue lists and task lists, not workstream records. A
workstream leaves `backlog` by an explicit status edit: `in-progress` when work starts on
it, per `flowcharge/SKILL.md`'s upkeep steps.

The generator half of this rule is enforced and pinned: `--new-ws` writes `backlog` when
the caller passes no `--status`, and a case in `run-tests.mjs` asserts that such a record
carries the line `status: backlog`. **No script can check** the hand-authored half,
because nothing on disk records that a record is fresh, so no `--check` warning exists for a
workstream created at another status, and no status is refused.

**Reopening a closed workstream.** A run that authors new work in a workstream whose
status is `done` or `dropped`, or executes work in it, sets that record back to
`backlog` and bumps `updated`. `--sync` never reopens anything. It closes a record
whose artefacts are all closed, and it leaves a closed record closed. The reopen rule
is one **no script can check**: the intent to author into a workstream is nowhere on
disk, so no `--check` warning enforces it and the generator changes no status of its
own. What the generator does check is the aftermath. A `done` or `dropped` workstream
that still owns an open artefact raises
`status is "<status>" but <n> of its <total> artefacts are still open. Reopen it?`,
and a person acts on it.

**The item's own frontmatter is the single source of truth.** The board and the
index are derived views; on any conflict, frontmatter wins and the views are
regenerated. Checkbox rule: `[x]` on an issue or task line if and only if its
status is `done` or `dropped`.

Completion semantics: a task list is `done` when every task line is `[x]`; an issue
list is `done` when every issue is `done` or `dropped`; a plan is `done` when every
stage is tasked and executed (or explicitly dropped); a workstream is `done` when
all its artefacts are `done` or `dropped`. **No script can check** the plan
rule, because no file records which stage a task list covers, so
the generator closes task lists, issue lists and workstreams, and leaves plans to
the author.

## The index and the board are generated

Regenerate both after any change to artefact frontmatter or issue/task status:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

The script scans `flowcharge/`, rewrites `index.md` (workstreams, open issues by
severity, task-list progress, ready-to-start work, attention warnings) and
`kanban.md` (thin cards in status columns), and prints warnings: board/frontmatter
divergence, registry drift, duplicate IDs, completed-but-not-closed artefacts, items
left stale by an `in-progress` status or a `blocked` reason, unknown `depends_on`
targets. Never hand-edit either output; to
move a card, change the workstream's `status` and regenerate.

Because both outputs are disposable, and `flowcharge/ids/` holds only ephemeral claim
markers, the script keeps all three out of git for you. Any run that writes (the
plain regenerate above, `--no-board`, `--claim`, `--sync`, `--new-ws`
and `--init`) checks the
project root's `.gitignore` and appends whichever of `flowcharge/index.md`,
`flowcharge/kanban.md` and `flowcharge/ids/` it does not already cover. Existing lines
are left exactly as they are, in their original order. A broader entry that already
covers a path counts, so a bare `flowcharge/` adds nothing. A failed write is reported
as a warning and changes nothing else about the run. The read-only modes,
`--list`, `--check` and `--whoami`, write nothing here either.
