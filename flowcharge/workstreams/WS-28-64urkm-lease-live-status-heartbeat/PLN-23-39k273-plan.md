---
id: PLN-23-39k273
type: plan
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Structured task fields in the workstream lease"
status: done
created: 2026-10-16
updated: 2026-10-16
author: Anthony Koukoullis
base_commit: c1bdfc5
depends_on: []
links: [PLN-22-6khzm8]
---

# Structured task fields in the workstream lease

## Summary

- **Problem:** a dashboard learns which parent task a run is executing only by parsing the free-text `note` line of the workstream `.lease`.
- **For:** a dashboard that reads `.lease`, and anyone running the FlowCharge Core pipeline.
- **Success:** while a parent task runs, the lease carries its number, its title and its start time as three keyed lines, and no finished task shows as current once its stage ends.
- **Approach:** see Design: three keys that every refresh writes, set only by the refresh before a parent-task run, and passed to the refresh command as arguments.
- **Top risk:** a task title that holds a single quote breaks its single-quoted shell argument; Scope, Assumptions, Quoting, fixes the escape.

## Scope

Acceptance criteria:

1. (Must) After any refresh, a `.lease` holds `session`, `acquired`, `heartbeat`, `stage`, `artefact`, `task`, `task_title`, `task_started` and `note`, one `key: value` line each, in that order, with the values Content specification, The lease file, gives.
2. (Must) The refresh before each run of `templates/execute-parent-task.md`, the baseline run of the test-run task included, writes that parent task's number as `task`, its title as `task_title` and the time the run began as `task_started`.
3. (Must) `task_started` is an ISO 8601 UTC time in the format of `acquired` and `heartbeat`, the same value on every refresh within one parent-task run, and a new value when the next parent-task run begins.
4. (Must) The refreshes at Start of run, When execution starts and After every stage write `task`, `task_title` and `task_started` empty, and no refresh runs when a parent task ends.
5. (Must) An empty value is written as the key, a colon and a space, with nothing after them.
6. (Must) The refresh command collapses every whitespace run in `task_title`, line breaks included, to one space, and keeps the temporary-file-and-rename write, the session check and the exits 1 and 2.
7. (Must) A reader finds every value by key name and reads a missing key as no value, so a lease written before this change and a reader that knows only the six earlier keys both keep working; `skills/flowcharge/scripts/fc-index.mjs` stays unchanged.
8. (Must) `node skills/flowcharge/scripts/test/run-tests.mjs` passes, with the `lease()` fixture writing the nine-key form when given a heartbeat age, and one case that runs the SKILL.md refresh command and checks the three task keys (Testing strategy).
9. (Must) Every new or edited `skills/flowcharge/SKILL.md` sentence passes DEVELOPMENT.md's portability questions, and the docs-consistency, single-copy, pointer-resolution and spawn-word cases stay green.

Out of scope: dashboard-side work; the tool-call hook PLN-22-6khzm8 lists under Won't; `skills/flowcharge/scripts/fc-index.mjs`; `skills/flowcharge/CONVENTIONS.md`, `README.md`, `skills/fc-validate/SKILL.md` and `flowcharge/tags.md`; `CHANGELOG.md` and every `metadata.version`, which the release process owns (one release ships these keys with the heartbeat); every installed skill copy; any edit to PLN-22-6khzm8 or TL-26-9sq7bw, which are done (Design, Changes to PLN-22-6khzm8).

Assumptions:

- **Task title source.** The title is the text after `<N>. ` on the parent task's own line in the task list, as that line reads when the parent-task run begins.
- **Start time.** The orchestrator reads `task_started` once, as a parent-task run begins, with the start-time command of Content specification, and keeps it as it keeps the session token. The refresh command never reads it back from the file.
- **Quoting.** Every value reaches the refresh command as one single-quoted shell argument. A single quote inside a value, such as the apostrophe in the full-form test-run task's title, is written with the shell's escape for it, `'\''` in a POSIX shell.
- **Write points unchanged.** The refresh points stay those of PLN-22-6khzm8, one of them per parent-task run. The rule that `task_started` holds within a run also covers a refresh a later change adds inside a parent task.
- **Tests in the test-update task.** The request asks for the fixture update and the new case as test work, so the list's test-update task carries both (fc-task-list skill, Test-update task), and parent task 1 edits `skills/flowcharge/SKILL.md` only.
- **Deployment.** No data and no live service. A `.lease` is session-bound and never committed. Rollback is reverting the commits.

## Design

**Lease file.** Nine keys, in the order and with the values of Content specification, The lease file. The acquire command writes `session` and `acquired`, and nothing changes them afterwards. Every refresh writes the other seven. Only the refresh before a parent-task run (the execute-tasks Operations note, `skills/flowcharge/SKILL.md:404-414`) sets `task`, `task_title` and `task_started`. Every other refresh writes them empty, so a finished task stops showing as current at the next stage change, with no write when a task ends. `note` keeps its role: progress inside a stage.

**Refresh command.** Positional arguments `<lease path> <token> <stage> <artefact> <task> <task_title> <task_started> <note>`, in key order; an omitted argument reads as empty. It collapses whitespace runs in `task_title` and `note`, and writes `task` and `task_started` as given. The read, the session check, the temporary file, the rename and the exits stay those of the current command (`skills/flowcharge/SKILL.md:704-707`).

**Where the text sits.** The lease file bullet (`skills/flowcharge/SKILL.md:693-710`) states the key list, the value rules, which refresh sets the task keys, the empty-value form, the quoting rule, the by-key-name reader rule and the new command. The execute-tasks Operations note states the task values its refresh passes and the start-time command. The Start of run, When execution starts and After every stage bullets stay unchanged: they refresh "see The lease file", and that bullet now says the task keys are empty there.

**Readers.** `checkLeases()` already finds `session`, `acquired` and `heartbeat` by key name with `^<key>:[ \t]*(.*)$` (`skills/flowcharge/scripts/fc-index.mjs:904-906`), so the generator needs no change.

**Changes to PLN-22-6khzm8.** This plan replaces these lease-format statements of PLN-22-6khzm8: criterion 1's six-key order; Design's statements that every refresh writes four keys, that the refresh takes `<lease path> <token> <stage> <artefact> <note>` and writes six lines, and that the `lease()` fixture's third argument adds the four refresh keys; Content specification's lease file table and refresh command; the Empty values assumption that every refresh writes four keys; and the Note quoting assumption, which the Quoting assumption widens to every value. TL-26-9sq7bw tasks 1 and 1.1 (the six-key lease file and its command) and task 2.2 (the fixture keys) carry out the earlier format and stay as the record of that work.

## Content specification

The lease file:

| Key | Value | Rationale |
|---|---|---|
| `session` | unchanged from PLN-22-6khzm8 | |
| `acquired` | unchanged from PLN-22-6khzm8 | |
| `heartbeat` | unchanged from PLN-22-6khzm8 | |
| `stage` | unchanged from PLN-22-6khzm8 | |
| `artefact` | unchanged from PLN-22-6khzm8 | |
| `task` | the number of the parent task whose run is in progress, such as `3`; empty otherwise | a key, so a reader needs no parsing of `note` |
| `task_title` | that parent task's title, copied from its task-list line with every whitespace run collapsed to one space; empty otherwise | one line, so a reader takes the value whole; Assumption: Task title source |
| `task_started` | ISO 8601 UTC time that parent-task run began, in the format of `acquired`; the same on every refresh within the run; empty otherwise | Assumption: Start time |
| `note` | unchanged from PLN-22-6khzm8 | |

Write points, for the three task keys (`stage`, `artefact` and `note` stay as PLN-22-6khzm8, Content specification, Write points, gives them):

| Write point | `task` | `task_title` | `task_started` |
|---|---|---|---|
| Start of run | empty | empty | empty |
| When execution starts | empty | empty | empty |
| Before every run of `templates/execute-parent-task.md`, the baseline run included | the parent task's number | its title | the start time read for this run |
| After every stage | empty | empty | empty |

Empty value: `<key>: `, the key, a colon and a space, with nothing after them.

Start-time command, exactly:

```
node -e "console.log(new Date().toISOString())"
```

Refresh command, written in SKILL.md as the example command, exactly:

```
node -e "const fs=require('fs'),[p,t,s='',a='',i='',u='',b='',n='']=process.argv.slice(1),x=p+'.'+require('crypto').randomUUID()+'.tmp';try{const k=fs.readFileSync(p,'utf8').split('\n').filter(l=>/^(session|acquired):/.test(l));if(k.indexOf('session: '+t)<0)process.exit(1);fs.writeFileSync(x,[...k,'heartbeat: '+new Date().toISOString(),'stage: '+s,'artefact: '+a,'task: '+i,'task_title: '+u.replace(/\s+/g,' '),'task_started: '+b,'note: '+n.replace(/\s+/g,' ')].join('\n')+'\n');fs.renameSync(x,p)}catch(e){try{fs.unlinkSync(x)}catch{}process.exit(2)}" '<path>/.lease' '<token>' '<stage>' '<artefact>' '<task>' '<task_title>' '<task_started>' '<note>'
```

## Stages

1. **Task fields in the lease file.** `skills/flowcharge/SKILL.md`: the lease file bullet and the execute-tasks Operations note. One stage, because the format and the one write point that sets it land together, so no commit leaves a key without its writer. Observable: criteria 1 to 7 and 9.

## Data & compatibility

- A lease written by the earlier refresh holds six keys. A reader finds no task keys in it, which reads as no task running.
- A reader that knows only the six earlier keys finds them by name in the nine-key file.
- A run on an earlier suite version writes only `session` and `acquired`, and a run on this version reads that lease without error and finds no task running.
- Rollback: revert the commits. A lease is session-bound, so no file needs migrating.

## Testing strategy

- Stage 1: no case of its own. The docs-consistency, single-copy, pointer-resolution and spawn-word cases cover the new prose (criterion 9).
- Test-update task: `lease()` (`skills/flowcharge/scripts/test/run-tests.mjs:2227-2233`), given a heartbeat age, writes the seven refresh keys in Content specification order, with `task: 1`, `task_title: Fixture task` and `task_started` equal to the heartbeat time; the five lease cases keep their expectations.
- Test-update task: one new case in the leases section reads `skills/flowcharge/SKILL.md`, takes the one refresh command from The lease file bullet, and runs it with Node against a fixture lease twice. The first run passes `task` `3`, a title holding a line break, a whitespace run and an apostrophe, and a fixed `task_started`. The second passes the three task values and `note` empty. After each run the case asserts exit 0, the exact nine lines in order with the heartbeat by its ISO 8601 shape, no temporary file left in the folder and no WARN from `--check`; the lines hold the collapsed title and the `task_started` value as passed after the first run, and the empty-value form after the second.

## Alternatives considered and rejected

- The refresh command reads `task_started` back from the lease while `task` is unchanged: the orchestrator already holds the value.
- The refresh command stamps `task_started` itself when the argument is empty: an empty value would then mean both "no task" and "stamp now".
- A refresh when a parent task ends that clears the task keys: an extra write per task, when the next task start or stage change already replaces them.
- A JSON lease: it breaks every `key: value` reader, `checkLeases()` included.
- The tests inside parent task 1, as PLN-22-6khzm8 placed its tests: the request names the test work on its own, and the test-update task is the list's place for tests a request asks for.
