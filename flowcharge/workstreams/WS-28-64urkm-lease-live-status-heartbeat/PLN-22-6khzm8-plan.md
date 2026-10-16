---
id: PLN-22-6khzm8
type: plan
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Lease live-status heartbeat"
status: ready
created: 2026-10-16
updated: 2026-10-16
author: Anthony Koukoullis
base_commit: 0967f71
depends_on: []
links: []
---

# Lease live-status heartbeat

## Summary

- **Problem:** an `in-progress` workstream gives no sign whether a run is live, crashed or stopped; lease age runs from `acquired`, so a run longer than 60 minutes can have its own lease reclaimed; a lease left by a crashed run can reach a commit.
- **For:** anyone running the FlowCharge Core pipeline, and a dashboard that reads `flowcharge/`.
- **Success:** a live run's `.lease` carries a recent `heartbeat` plus the stage, artefact and progress note the run is at; lease staleness runs from that heartbeat; the generator-managed `.gitignore` keeps every `.lease` out of git.
- **Approach:** see Design: four new `.lease` keys rewritten atomically at write points the orchestrator already visits, heartbeat-based age in the reclaim rule and in `checkLeases()`, and a fourth generator-managed `.gitignore` line.
- **Top risk:** a refresh that overwrites another session's lease; the refresh checks the `session` line first and the run halts when it is not its own.

## Scope

Acceptance criteria:

1. (Must) After its first refresh, a `.lease` holds `session`, `acquired`, `heartbeat`, `stage`, `artefact` and `note`, one `key: value` line each, in that order, with the values Content specification, The lease file gives.
2. (Must) A run refreshes its lease at each write point Content specification, Write points lists, with the values that table gives.
3. (Must) A refresh replaces the file through a temporary file in the same folder and a rename, keeps `session` and `acquired` byte for byte, and writes nothing when the file is missing or no line of it reads `session: <this run's token>`.
4. (Must) A refresh that exits 1 or 2 halts the run per hard rule 7, and the report says the run no longer holds the workstream's lease.
5. (Must) The Start-of-run reclaim rule measures a lease's age from `heartbeat`, and from `acquired` when the lease carries no `heartbeat`; `LEASE_STALE_MINUTES` stays 60.
6. (Must) Successful end of run and Halt or user stop keep deleting the lease under the unchanged session-match rule, and no step or mode deletes a lease on a timer.
7. (Must) `fc-index.mjs` measures a lease's age from `heartbeat` when it parses as a date, else from `acquired` when that parses, and reports nothing for the lease when neither parses.
8. (Must) A lease whose age passes 60 minutes WARNs with the text Content specification, Generator values gives; a lease acquired more than 60 minutes ago whose `heartbeat` is under 60 minutes old WARNs nothing.
9. (Must) Every writing mode of `fc-index.mjs` appends `flowcharge/workstreams/*/.lease` to the project root's `.gitignore` unless a covering line is present, and the `--help` text and the code comments name that path.
10. (Must) `node skills/flowcharge/scripts/test/run-tests.mjs` passes after each stage, with cases pinning criteria 7, 8 and 9 (Testing strategy).
11. (Must) Every new or edited `skills/flowcharge/SKILL.md` sentence passes DEVELOPMENT.md's portability questions, and the docs-consistency, single-copy, pointer-resolution and spawn-word cases stay green.

Won't: the record's tool-call hook (its PostToolUse hook) that refreshes `heartbeat` on every tool call. It needs an owner-reviewed `.claude/settings.json` entry, so this plan writes none. Optional later install step: one hook entry whose command rewrites the `heartbeat` line of the session's own lease through the same temporary-file-and-rename write, which shrinks the silent window from one stage or parent task to one tool call.

Out of scope: dashboard-side work (the record's Dashboard contract); `skills/flowcharge/CONVENTIONS.md`, which lists the generator-managed `.gitignore` lines, and `README.md`, which counts them as three, neither of which the record's Target names; `CHANGELOG.md` and every `metadata.version`, which the release process owns; every installed skill copy and `.claude/settings.json`; this repository's own `.gitignore`, which the updated generator appends to on its first writing run here.

Assumptions:

- **Schema home.** The lease format is defined in `skills/flowcharge/SKILL.md`, where the acquire command defines it today. `skills/flowcharge/CONVENTIONS.md` does not mention `.lease` and stays unchanged, because the record's Target names only SKILL.md, `fc-index.mjs` and `run-tests.mjs`.
- **Per-parent-task refresh.** The record's `note` example (`parent task 3 of 7`) and its silent gap of "one long task" require a refresh before each parent-task run. Refreshes at stage boundaries alone leave a whole execute-tasks stage silent.
- **Lost lease halts.** A refresh that finds another token, or no file, means another session reclaimed the workstream or a person removed the lease. Continuing would let two sessions write one workstream, so the run halts.
- **Empty values.** Every refresh writes all four keys. `artefact` and `note` are left empty when there is nothing to name, and a reader treats an empty value as none.
- **Acquire unchanged.** The acquire command keeps its exclusive create and its two keys. The first refresh follows it at once, so a lease carries no `heartbeat` only for that moment, or when an earlier suite version wrote it.
- **Residual window.** One stage, one parent task or one wait for the user's reply that lasts more than 60 minutes still ages the heartbeat past the reclaim threshold. The refresh check then halts the original run instead of letting it write beside the new holder.
- **Note quoting.** The orchestrator composes `note` as plain words with no single quote, because the refresh command passes it as a single-quoted shell argument.
- **Deployment.** No data and no live service. A `.lease` is session-bound and never committed. Rollback is reverting the stage commits.

## Design

**Lease file.** `<workstream folder>/.lease`, one `key: value` line per key, in the order of Content specification, The lease file. The acquire command writes `session` and `acquired`, and nothing changes them afterwards. Every refresh writes `heartbeat`, `stage`, `artefact` and `note`. Times are ISO 8601 UTC strings from `new Date().toISOString()`. A reader parses each key with `^<key>:[ \t]*(.*)$`, as `checkLeases()` already parses `session` and `acquired` (`skills/flowcharge/scripts/fc-index.mjs:898-899`).

**Refresh.** One `node -e` command in SKILL.md (Content specification, Refresh command) takes positional arguments `<lease path> <token> <stage> <artefact> <note>`, so no value is spliced into the script. It reads the file, keeps its `session` and `acquired` lines, exits 1 when no kept line equals `session: <token>`, writes the six lines to `<lease path>.<random UUID>.tmp`, and renames that over the lease. On any error it removes the temporary file and exits 2. It collapses every whitespace run in `note`, line breaks included, to one space. This mirrors `writeAtomic()` (`fc-index.mjs:134-146`) without calling it: SKILL.md runs shell commands, and the generator never writes a lease (`fc-index.mjs:880-885`).

**Write points.** Each refresh instruction sits at the step where it applies: the Start of run bullet, the When execution starts bullet, the execute-tasks Operations note, and the After every stage bullet. A new first bullet in "FlowCharge Core upkeep", **The lease file**, defines the keys, the refresh command, the halt on exit 1 or 2, and a "No script can check" note for the write points. The Successful end of run and Halt or user stop deletion text is unchanged.

**Reclaim.** On `EEXIST`, Start of run reads `heartbeat`, or `acquired` when the lease has no `heartbeat`, and compares that age with `LEASE_STALE_MINUTES`.

**Generator staleness.** `checkLeases(wsDirs)` keeps its signature and its report-only rule. It parses `heartbeat` beside `session` and `acquired`, takes the age from `Date.parse(heartbeat)` when that is a number, else from `Date.parse(acquired)`, skips the lease when both are `NaN`, and emits the WARN text of Content specification, Generator values. The comments on `LEASE_STALE_MINUTES` (`fc-index.mjs:312-313`), on the leases section (`fc-index.mjs:880-885`), inside `checkLeases()` (`fc-index.mjs:901-903`) and at its call site (`fc-index.mjs:1538-1539`) state the heartbeat rule.

**Gitignore.** `GITIGNORE_TARGETS` (`fc-index.mjs:162`) gains `flowcharge/workstreams/*/.lease` as its fourth entry, and `GITIGNORE_COVERS` (`fc-index.mjs:166-170`) gains its covering forms. `ensureGitignore()` is unchanged: it already appends only the missing targets and leaves a compliant file untouched. The comments at `fc-index.mjs:158-160` and `fc-index.mjs:163-165` and the HELP paragraph at `fc-index.mjs:125-131` name the fourth path.

**Tests.** Each stage carries the `run-tests.mjs` edits that pin its own change, so the suite passes at every stage boundary and the test-update task has nothing left to update. The `lease()` fixture builder (`run-tests.mjs:2209-2210`) gains an optional third argument, the heartbeat age in minutes, which adds the four refresh keys.

## Content specification

The lease file:

| Key | Value | Rationale |
|---|---|---|
| `session` | the token the acquire command printed | unchanged |
| `acquired` | ISO 8601 UTC time of the acquire | unchanged |
| `heartbeat` | ISO 8601 UTC time of the latest refresh | the liveness signal and the age source |
| `stage` | the Operations table name of the stage the run begins next; `upkeep` once only the end-of-run bookkeeping remains | a refresh runs between stages, so the next stage is the one now running |
| `artefact` | the ID of the artefact that stage works on; empty until one exists | Assumption: Empty values |
| `note` | one line on progress inside the stage, such as `parent task 3 of 7`; otherwise empty | the record's example |

Write points:

| Write point | `stage` | `artefact` | `note` |
|---|---|---|---|
| Start of run, once the run holds the lease (acquired or reclaimed), before it regenerates | the first stage of the announced pipeline | that stage's input artefact when it already exists (the task list of a "run <task list>" request), else empty | empty |
| When execution starts, before it regenerates | `execute-tasks` | the task list ID | empty |
| Before every run of `templates/execute-parent-task.md` | `execute-tasks` | the task list ID | `parent task <N> of <M>`, with `, baseline run` appended for the baseline run |
| After every stage, before it regenerates | the stage that begins next, or `upkeep` | per The lease file | empty |

Refresh command, written in SKILL.md as the example command, exactly:

```
node -e "const fs=require('fs'),[p,t,s='',a='',n='']=process.argv.slice(1),x=p+'.'+require('crypto').randomUUID()+'.tmp';try{const k=fs.readFileSync(p,'utf8').split('\n').filter(l=>/^(session|acquired):/.test(l));if(k.indexOf('session: '+t)<0)process.exit(1);fs.writeFileSync(x,[...k,'heartbeat: '+new Date().toISOString(),'stage: '+s,'artefact: '+a,'note: '+n.replace(/\s+/g,' ')].join('\n')+'\n');fs.renameSync(x,p)}catch(e){try{fs.unlinkSync(x)}catch{}process.exit(2)}" '<path>/.lease' '<token>' '<stage>' '<artefact>' '<note>'
```

Generator values:

| Element | Exact value | Rationale |
|---|---|---|
| Stale WARN | `` `flowcharge/workstreams/${dir}/.lease: held by session ${session}, silent for ${ageInMinutes(age)}, stale` `` | "silent for" is true for both age sources; one text needs one pin |
| `GITIGNORE_TARGETS`, fourth entry | `'flowcharge/workstreams/*/.lease'` | one segment per workstream folder; an archived folder holds no lease |
| `GITIGNORE_COVERS` entry | `'flowcharge/workstreams/*/.lease': ['flowcharge/workstreams/*/.lease', '.lease', 'flowcharge/workstreams/', 'flowcharge/workstreams', 'flowcharge/', 'flowcharge']` | each listed line already ignores every workstream lease |
| HELP `.gitignore` paragraph | "whichever of flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease it does not already cover" | names the fourth path in the existing sentence |

## Stages

1. **Lease heartbeat in the orchestrator.** `skills/flowcharge/SKILL.md` gains The lease file bullet, a refresh at each write point and the heartbeat-based reclaim. First, because it defines the schema the generator then reads and every run follows it. Observable: criteria 1 to 6 and 11.
2. **Generator staleness from heartbeat.** `checkLeases()`, its comments and the lease cases in `run-tests.mjs`. After stage 1, which defines `heartbeat`. Observable: criteria 7, 8 and 10.
3. **Generator-managed `.gitignore` covers the lease.** The fourth target, its covering forms, the HELP text, the comments and the `.gitignore` cases. Last, because it is independent of stages 1 and 2 and carries the least risk. Observable: criteria 9 and 10.

## Data & compatibility

- A lease written by an earlier suite version has no `heartbeat`. The reclaim rule and `checkLeases()` both fall back to `acquired`, which is the earlier behaviour.
- A run on an earlier suite version reads only `acquired` and can reclaim a live run's lease after 60 minutes. The live run's next refresh then exits 1 and it halts, so two sessions do not keep writing one workstream.
- Every project's `.gitignore` gains one line, plus the managed comment line where it is absent, on the first writing run of the updated generator. A `.lease` that git already tracks stays tracked, because `.gitignore` does not untrack a file.
- Rollback: revert the stage commits. A lease is session-bound, so no file needs migrating in either direction.

## Testing strategy

- Stage 1: no new case. The docs-consistency rules A to H, the single-copy and pointer-resolution cases and the spawn-word case cover the new prose (criterion 11). The lease file bullet carries the "No script can check" note for the write points.
- Stage 2: the existing case "a lease held past sixty minutes warns with its session and its age" becomes the fallback case: a lease with no `heartbeat`, acquired 90.5 minutes ago, WARNs `silent for 90 minutes`. A new case pins the WARN text for a lease acquired 120 minutes ago whose `heartbeat` is 90.5 minutes old (`silent for 90 minutes`, so the age comes from `heartbeat`). A new case proves a lease acquired 120 minutes ago with a `heartbeat` 5 minutes old WARNs nothing. "clean: a lease acquired five minutes ago warns about nothing" and "no mode deletes a lease" stay unchanged.
- Stage 3: the case "--init appends the standard three lines to a project with no .gitignore yet" asserts four lines, the lease pattern included. A new case proves a default-mode run appends exactly `flowcharge/workstreams/*/.lease` to a `.gitignore` that already holds the other three lines, and leaves those lines unchanged.

## Adjacent opportunities

- Not requested: record the `.lease` format in `skills/flowcharge/CONVENTIONS.md`, where DEVELOPMENT.md places schema rules, and update the `.gitignore` line lists in CONVENTIONS.md and `README.md`. Skip here: the record's Target excludes both files; a follow-up workstream fits.

## Alternatives considered and rejected

- A `flowcharge/status/` folder per active workstream: two files for one fact drift apart (the record's Rejected design).
- A generator mode that rewrites the lease through `writeAtomic()`: a new public flag for one rewrite, against the generator's rule that it never writes a lease (`fc-index.mjs:880-885`).
- Refresh at stage boundaries only: a long execute-tasks stage then stays silent past 60 minutes, which is the failure this plan fixes.
- A sweep that deletes stale leases: it destroys the evidence a dashboard shows (the record's design point 4).
- A refresh with no session check: it would overwrite the lease of a session that reclaimed the workstream.
