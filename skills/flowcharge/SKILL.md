---
name: flowcharge
description: Orchestrate the FlowCharge Core project-management suite from one plain-English request. Chain investigations, plans, issue lists, task lists (diff or spec), task execution, git commits, and board/index upkeep by performing each stage in the calling session from pre-authored stage files and feeding each stage's output into the next. FlowCharge Core is the frontmatter-and-ID successor to the AK suite; artefacts live in flowcharge/workstreams/WS-N-SUFFIX-<slug>/ workstream folders. Use whenever the user describes a multi-step FlowCharge Core workflow in any phrasing ("file these findings as issues in flowcharge and fix them", "plan Y in flowcharge, create the tasks, execute and commit") and on /flowcharge. Do NOT use when the user invokes exactly one fc- skill for a single artefact with no chaining. Run that skill directly.
metadata:
  version: "0.4.0"
---

# FlowCharge

You are the conductor of the user's FlowCharge Core project-management suite. The user states
outcomes in plain English ("file these findings on the scope service as issues,
author spec tasks, execute them, commit"). You translate that into an ordered pipeline of
operations, perform each operation yourself, in this session, from a pre-authored
stage file followed as written, chain each stage's result into the next stage's inputs,
prompt before the two dangerous stages, keep the artefact frontmatter, index, and board
current, and report.

The stage files in `templates/` are the user's own stage instructions. Your
job is faithful execution and sequencing, never rewriting, improving, or skipping a
stage file's steps.

**At the start of every run, Read `CONVENTIONS.md` in this skill's directory.** It
is the FlowCharge Core data model: layout, IDs, frontmatter, status lifecycle,
index/board generation. Where anything below is silent, CONVENTIONS.md answers.

**Also Read `flowcharge/agents.md` in the project root at the start of every run,
if it exists.** Its absence is not an error. The skill's built-in defaults apply
in that case.

## Hard rules

1. **Stage files are followed as written.** At the start of every stage, Read its
   stage file fresh from this skill's `templates/` directory and follow it exactly:
   every step, in its order, with its emphasis. Read each marked slot as the value
   this run resolved for it. Never paraphrase, trim, reorder, skip, or add a step.
   The only sanctioned deviations are listed under "Sanctioned deviations", nothing
   else.
2. **One slot kind.** `{name}` slots (e.g. `{artefact}`, `{plan}`, `{issuelist}`,
   `{tasklist}`, `{ws_id}`, `{slug}`, `{ws_dir}`, `{item1}`) take a literal value, a path or
   identifier, which you resolve before the stage begins. A stage file carries no
   briefing: every stage runs in this one session, so the request, the decisions
   already taken and the constraints in play are already yours.
3. **One session.** Every stage runs in the session this skill was loaded into, on
   that session's own model and effort. No stage runs in a separate agent, and no
   stage hands its work to one. If the user names a model, effort or role for a
   stage ("use a smaller model", "medium effort"), ignore it and proceed. `default_agent` in
   `flowcharge/agents.md` is currently unused: it is kept, and still written under
   "Standing vs. one-off instructions", for a possible future mode that runs
   several workstreams in parallel, where it would name the agent type again.
   This rule covers stages, not where a run starts: the user may start the whole
   pipeline as one separate agent instance, running in the background or
   otherwise, which loads this skill and becomes the one session. Pass it the
   request verbatim. It cannot ask the user, so a hard rule 4 prompt neither
   satisfied nor waived stops the run.
4. **Two prompts: execute-tasks and commit.** A prompt is satisfied when the user's
   instruction is both **direct** (that stage is the point of the message, not a
   later link scheduled behind work that does not exist yet) and **determinate**:
   the object acted on (task list, branch, diff) already existed and was
   identifiable when they said it. Satisfied: proceed, reporting per "Prompts".
   Otherwise: report and wait for an explicit yes. That yes must itself be direct
   and determinate about this stage: the same two tests, applied to the reply.
   Direct: this stage is what the reply is about. Determinate: the reply names
   execution or commit, or is the unmistakable answer to a prompt question that was
   the only thing outstanding. A blanket endorsement of your recommendations
   ("go with your recommendations", "yes to all", "do what you think best")
   never satisfies a prompt on its own, however many numbered items it resolves,
   and even when the prompt was one of them. An explicit
   "don't ask / no prompts / run straight through" in the user's own words waives
   outright the prompts it names. Every other stage runs autonomously. Which
   tiers post these two prompts and which skip them is settled by the `prompts:`
   line in `flowcharge/agents.md` and defined in "The prompt policy". A tier
   that skips them counts as that same explicit "run straight through" waiver for
   both prompts, standing until changed (see "Standing vs. one-off
   instructions").
5. **Dependencies block execution.** Before the execute-tasks prompt, regenerate the
   index, then resolve the task list's and its workstream's `depends_on`. Every
   listed ID must be `status: done`, except a `type: plan` or `type: issuelist`
   dependency, satisfied once authored (any status but `backlog`/`dropped`):
   plans are inputs, not executable work, and only reach `done` after their tasks
   execute, so requiring `done` would deadlock every plan-driven run; an issue
   list only reaches `done` once its issues are `done` or `dropped`, and the task
   list carrying the dependency is the artefact whose execution fixes them, so
   requiring `done` would deadlock every issue-list-driven run. On an unmet
   dependency, halt and report instead of presenting the prompt; the user may
   override, per-run.
6. **Strictly serial.** One operation at a time. Never run two stages or two parent
   tasks concurrently. Later work assumes earlier edits have landed.
7. **Failure halts the pipeline.** An aborted subtask, a checklist item that stays
   failed, or a stage that could not complete stops the run. Report what
   completed, what failed and why, and what was not run. Do not improvise a fix, do
   not skip ahead. A failed test-run task is not such a failure: it enters "The
   test-run loop", which halts the run itself at its cap.
8. **Perform each stage yourself, in order.** Every stage's work is yours, done in
   this session from its stage file (rule 1). While a stage runs, its stage file's
   limits bind you (what it may edit, what it must author nothing for, what it must
   not settle), whatever an earlier stage of this run showed you. Alongside the
   stages, these actions are also yours: the commit stage (via
   the fc-git skill), cutting the run's feature branch (rule 11), workstream ID
   allocation via `fc-index.mjs --new-ws` for the run's own workstream, as "Start of run" directs, never for a `backlog-add` item, whose workstreams the backlog-add stage creates in its own steps (see "ID slots" below), workstream-record and artefact frontmatter bookkeeping (`status`, `tags`, and `updated` bumps, including the `updated` bump after a validation stage or an applied settled answer that made one or more fixes),
   running the index generator, running a read-only artefact listing (see
   "Listing artefacts"), writing `flowcharge/agents.md` when a standing preference
   is recognized (see "Standing vs. one-off instructions"), and reading
   files under `flowcharge/` when a stage's result needs verifying.
9. **Task-list mode defaults to spec.** Resolve `{mode}` to `spec` unless the user
   says diff. If they name neither and the work is plainly diff-shaped (the
   authoring stage says so in its report), relay that observation. Don't switch
   modes yourself mid-run. If `flowcharge/agents.md` sets `task_list_mode` to
   `diff`, that is the run's default instead of spec, unless the request names a
   mode explicitly, which still wins (see "Standing vs. one-off instructions").
10. **Honour stage reports.** Open questions, skipped issues, untasked stages,
    and divergences a stage reports are carried verbatim into your stage
    report and the final summary. Never settle an open question on the user's
    behalf, and never author downstream work for a stage left open,
    except where "The prompt policy", the only definition of the tiers and their
    risk test, settles a reported open question: then adopt the recommendation the
    stage recorded, as stated, never one you compose afterwards, record the question, the
    answer and the preference that let you adopt it in the settled-decisions record
    "Reporting" defines, and continue; the stage it blocked may proceed. An explicit
    instruction in the request still wins for that run, exactly as in rules 3, 4
    and 9 (see "Standing vs. one-off instructions"). A fix fc-validate applies on
    its own authority is never a settled question, however a return or a report
    phrases it; only an open finding that passed the settle-or-relay test is, and
    it reaches its artefact by the settled-answer path "Chaining" defines. The printed
    count line reports both as "N fixes applied"; the settled-decisions record and
    fc-validate's withheld detail keep them apart.
11. **Work happens off the default branch.** Before the first execute-tasks or
    commit of a run, read the checked-out branch (`git branch --show-current`). If
    it is the repo's default branch (`main`, or `master` where that is the
    default, the same definition fc-git's protected-branch rule uses), cut
    `feature/<ws_id>-<slug>` from the current HEAD (`git switch -c`; no
    fetch, no pull), switch to it, and say so in that stage's report.
    `<ws_id>` is the run's own workstream ID (see "ID slots"), and `<slug>` is
    the run's workstream slug, bare and unprefixed — together matching the
    `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/` folder convention.
    Creating a branch is in fc-git's "Safe. Execute directly" tier: no
    confirmation, and no new prompt. The execute-tasks and commit prompts stay
    exactly as rule 4 defines them. On any other branch, do nothing and leave it
    alone. Check once per run: once you are off the default branch, do not check
    or cut again for the rest of the run.
12. **A plan is checked against its motivating scenario before anything is
    built from it.** The check reads the plan as validation left it. Under
    `validate: on`, it runs once the validation stage that
    follows the merged plan-and-tasks stage has finished; under `validate: off`, it runs
    once the plan-and-tasks stage itself has finished. Read the plan and the
    workstream record it belongs to (its frontmatter `workstream:` key),
    then state, in one line per case, how the plan's design handles each
    concrete scenario or failure case the workstream record's body names as
    the reason the work is needed. There is no stage boundary between the plan and
    its tasks in a merged run, which is why the check follows a finished stage rather
    than preceding one. In a `tasks-only` run the plan already exists
    and validation does not compare it against its source, so the check
    fires before that stage begins. This
    is a trace of the plan's actual proposed text against that scenario,
    not a restatement that the plan reads as internally consistent or that
    its acceptance criteria are individually satisfiable, and it runs
    whether the plan was authored earlier in this same run or in an earlier
    one. State the trace in the report of the stage it followed. It is a
    reading of its own, made after the authoring and validation stages and apart
    from them. When the workstream record
    names no concrete scenario or failure case, say so in one line and
    proceed. When it names one the plan's stated design does not visibly
    handle, halt and report instead of beginning the next stage; the user
    may override, per-run, exactly as rule 5's dependency check does. Where the record names a
    scenario as a prerequisite defect an earlier stage of this run already fixed, name that fix
    as the answer: the plan's design is not required to handle it, and must not absorb it. This
    check supplements, and never replaces, a walkthrough task a task list
    may still place against the finished file.
13. **A task list is checked for drift against the branch before
    execute-tasks' first parent task.** Before the first parent task
    of an execute-tasks run begins, for the task list that stage is
    about to execute — whether that list was authored earlier in this
    same run or an earlier one — read its frontmatter `base_commit` and
    `updated` keys, per `fc-task-list`'s schema, against the
    repository's current `HEAD`. When the frontmatter carries
    `base_commit`, run `git log --oneline <base_commit>..HEAD`: each
    returned line is one commit landed since the list was authored, the
    line count is roughly how much, and the subjects are what changed.
    When the frontmatter carries no `base_commit`, compare the
    `updated` date to today (`date +%F`) for the elapsed span, and run
    `git log --oneline --since=<updated>` on the current branch: the
    elapsed span and the commit count together are roughly how much,
    and the subjects are what changed. When the check finds no
    commit, state so in one line ("no commits have landed since
    <base_commit|updated>; proceeding") and proceed exactly as today.
    When one or more commits are found, state what changed and roughly
    how much, and recommend re-validating (`fc-validate`) or
    re-running the diff-mode scan that produced the list's own
    upstream plan or issue list, before proceeding. This is a stated
    recommendation, folded into the always-printed "Before
    execute-tasks" report content, never a halt and never a new
    prompt. Run this check once per execute-tasks stage, immediately before that
    stage's first parent task; do not repeat it before later parent tasks in
    the same stage. It is a check made before the stage, not part of it.

## Standing vs. one-off instructions

Hard rules 4, 8, 9 and 10, and the validation setting, each read a starting default
from `flowcharge/agents.md` and may also write it. This section is the one shared test
they use to decide: does
an instruction change only this run, or should it change this project's default from
here on?

An instruction is standing when it satisfies both of two conditions:

- **Project-scoped, not run-scoped.** The user is describing how FlowCharge Core should
  behave in this project from here on, not only how to complete the thing they just
  asked for. Test it by asking: if a later, unrelated run silently reverted to the old
  behavior without the user repeating themselves, would that read as FlowCharge Core forgetting
  something it was told, or as FlowCharge Core correctly treating the earlier remark as spent?
- **Freestanding of the task at hand.** The preference reads as a complete
  instruction on its own, detached from whatever request it rode in on ("default to
  diff mode" stands alone), rather than as a qualifier glued to that request ("do this
  one as a diff" only modifies the one thing being asked).

Surface forms like "always", "from now on", "for this project", or "default to" are
common carriers of a standing instruction, but they are illustrative, not a checklist.
The two conditions above are the test, not the presence of a phrase. Absence of such
wording does not exempt an instruction from being standing, and presence does not
guarantee it.

When the instruction is ambiguous (it reads plausibly either way), treat it as
one-off: apply it to the current run only. A silent standing write is a bigger
surprise than being asked again next time.

When both conditions hold: write or update the matching line in
`flowcharge/agents.md` and report it as one plain statement per "Talking to the user"
(e.g. "Noted: default agent is now <agent type> for this project.", "Noted: task-list
mode now defaults to diff for this project.", "Noted: prompts are now set to manual
for this project.", "Noted: prompts are now set to assist for this project.",
"Noted: prompts are now set to cruise for this project.", "Noted: validation is now
off for this project."). No question, no
prompt: writing this file is a local, reversible, non-destructive state change,
the same tier hard rule 8's other bookkeeping actions already sit in.

The write supports a partial file: it changes only the one line the instruction
concerns, leaving any other existing lines untouched, in this fixed order when
more than one is present:

```
default_agent: <verbatim string>
task_list_mode: spec | diff
prompts: manual | assist | cruise
validate: on | off
```

A key is omitted entirely when never set, never written with a blank value. If the
instruction reverts a field to its built-in default (e.g. "stop skipping the prompts"),
write that default value (`prompts: manual`) rather than deleting the line; behaviorally
identical to omission, and simpler than special-casing removal. If a standing
instruction removes the last remaining line, delete the file, equivalent to it never
having existed, per its own contract.

When either condition fails: the instruction is one-off. Apply it to the current run
only, exactly as today, and write nothing.

## The prompt policy

One key governs every point at which a run stops for the user. `prompts:` in
`flowcharge/agents.md` takes one of three tiers, `manual | assist | cruise`, and this
section is the single definition of what each one means. Hard rule 4, hard rule 10 and
the "Flagged tasks" subsection of "Prompts" defer here, and restate neither the tiers
nor the test below.

**The risk test.** Test a recommendation, or the change a flagged task makes, for risk
before you adopt it. A
recommendation is risky when any one of these holds: (a) adopting it could
be catastrophic: it could lose work, data, or history that this run cannot
undo by reverting its own commits; (b) it has a noticeable and unavoidable
impact on the codebase, positive or negative: it changes a public
interface, an on-disk or stored format, a default value, the dependency
set, or the build, test, or release path, and no later reader or caller can
opt out of that change; (c) it needs something significant changed
elsewhere to accommodate it: adopting it forces edits to files, stages, or
artefacts the run's request did not name. Judge the recommendation as
written, together with the artefact it came from; do not model consequences
you cannot read. Where you cannot tell whether a recommendation is risky, it is risky.

The behaviour contract, per tier and per mechanism:

| Mechanism | `manual` | `assist` | `cruise` |
|---|---|---|---|
| Open question reported by a stage | always relays | settles when it carries a recommendation and is risky by none of (a), (b), (c); otherwise relays | settles when it carries a recommendation and is not risky by (a); a (b)- and/or (c)-risky recommendation is adopted as written and joins the settled-decisions record, marked risky |
| Flagged task | every flag blocks | every flag blocks, because a flag is risky by construction | a flag risky by (b) and/or (c) only is adopted and joins the settled-decisions record; a flag risky by (a) blocks |
| execute-tasks and commit prompts | both prompt | both skipped | both skipped |

Three rules bind every cell of that table:

- **Criterion (a) is never silenced.** A recommendation or a flag that is catastrophic
  or irreversible (it could lose work, data or history this run cannot undo by
  reverting its own commits), relays unsettled at every tier. No value of `prompts:`
  reaches it.
- **No recommendation, no settling.** A question or a flag that states no
  recommendation, states two that conflict, or makes one conditional on something the
  orchestrator cannot check, relays unsettled at every tier. An open question arrives in
  the fixed open-question block `templates/plan-and-tasks.md` and
  `skills/fc-validate/SKILL.md` carry, so a question whose recommendation field holds
  `No recommendation possible` is ineligible to settle at any tier by its shape alone.
- **The exception covers open questions and flagged tasks only.** An aborted subtask, a
  skipped issue, an untasked stage and a divergence still relay unsettled at every
  tier, and hard rule 7 still halts the pipeline on a failure.

The validation stage runs identically at every tier ("The validation setting"); only an
open finding it reports enters the table above.

An explicit instruction in the request still wins for one run, exactly as hard rules 4
and 9 already provide, and the standing-versus-one-off test decides whether it is
written to the file (see "Standing vs. one-off instructions").

### The setting contract

- **Accepted values:** `manual`, `assist`, `cruise`.
- **Built-in default when the key and the file are both absent:** `manual`.

**No script can check** the tiers or the risk test, because no script reads this prose,
so this section carries that note in the way this file's other unverifiable rules do
(see DEVELOPMENT.md's note on unverifiable rules).

## The validation setting

`validate:` in `flowcharge/agents.md` governs whether a run checks its authored
artefacts against the source they were authored from.

Under `on`, one pass runs once per authoring stage, after that stage finishes and before the
execute-tasks prompt that follows it. The pass fixes every defect it can prove wrong in
place, on its own authority, under the correction rule `skills/fc-validate/SKILL.md`
defines, at every `prompts:` tier, and reports only what that rule says to report.
Under `off`, the validation stage does not run.

- **Accepted values:** `on`, `off`.
- **Built-in default when the key and the file are both absent:** `on`.

See `## Reporting` for how a run reports a validation that ran, was waived, or is
missing.

**No script can check** whether a run performs the pass or skips it, because no script
reads this prose, so this section carries that note in the way this file's other
unverifiable rules do (see DEVELOPMENT.md's note on unverifiable rules).

## Operations

Each operation names its stage file, its slots, what it consumes, and what it returns.

| Operation | Stage file | Slots | Consumes | Returns |
|---|---|---|---|---|
| investigate | `templates/investigate.md` | - | question from the request | findings summary |
| plan-and-tasks | `templates/plan-and-tasks.md` | `{stages}`, `{scale}`, `{mode}`, `{plan}`, `{ws_dir}`, `{ws_id}`, `{slug}` | feature description, or investigate findings; a plan path in `{plan}` when `{stages}` is `tasks-only` | plan path, summary, open questions, task list path, stage→task map |
| issues-and-tasks | `templates/issues-and-tasks.md` | `{stages}`, `{mode}`, `{issuelist}`, `{ws_dir}`, `{ws_id}`, `{slug}` | findings the user supplies; an issue list path in `{issuelist}` when `{stages}` is `tasks-only` | issue list path, ISS IDs, task list path, ISS→task map |
| validate | `templates/validate.md` | `{stages}`, `{role}`, `{upstream}`, `{upstream_path}`, `{tasklist}`, `{ws_dir}` | both artefacts the authoring stage produced, plus the source material it authored from | one summary line per comparison, plus any open finding; correction detail withheld |
| execute-tasks | `templates/execute-parent-task.md` (once per parent task) | `{tasklist}`, `{parent_task}` | task list path, **PROMPTED**, deps checked per rule 5 | per-task applied/aborted status, self_eval |
| commit | inline via the **fc-git** skill | - | completed work, plus the end-of-run upkeep writes that have already landed (issue closures, `--sync` status flips, regenerated index/board, released lease), **PROMPTED** | commit SHA |
| backlog-add | `templates/kanban-add.md` | `{item1}`, `{item2}`, … | backlog items from the request | WS IDs, slugs, card text |
| upkeep | inline (see FlowCharge Core upkeep) | - | every stage boundary | fresh index + board |
| list | inline (see Listing artefacts) | - | scope / workstream / sort from the request | Markdown table (in chat) |

Notes:

- **`{mode}`**: `spec` or `diff`, per hard rule 9.
- **`{scale}`**: `small` or `standard`, per "Parsing the request".
- **The context-docs list**: the list every stage file's Context section points at.
  Resolve it once per run, before the first stage, and reuse it for every stage. It
  names this project's own structural or reference documentation as repo-relative
  paths, one line per document saying what its filename and location imply it covers,
  and so when to read it. List the project root (a README, a `docs/` folder, an
  architecture, layers or conventions document) and name only files the listing
  showed. Invent nothing and never carry a path over from another project. Each stage
  reads the documents it needs from the list, not all of them. If the project has no
  such documentation, the list is empty and each stage's Context reading is skipped.
- **Source material** (validate only): the source the upstream artefact was
  authored from, and nothing else. Plan path: the request the plan was authored
  from, with the decisions already taken and the constraints in play, plus the
  workstream record in `{ws_dir}`. Issue path: every finding the issue list was filed
  from, as the user supplied it, because user-supplied findings are never written to a
  file; validation treats that text as the source. Never the authoring stage's own
  report, its rationale, or its self-report, and never the issues-and-tasks stage's
  restatement of the findings: findings reach validation from the user.
- **ID slots** (`{ws_id}`, `{ws_dir}`): `{ws_id}` is the only artefact ID you allocate outside a
  stage, and it comes from the `--new-ws` run that created the workstream folder (see
  FlowCharge Core upkeep). The folder must exist before anything is written into it.
  Every other artefact ID is claimed by the stage that writes the artefact, as its
  stage file directs, by running
  `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim <TYPE>`
  and using the id it prints. Never pre-claim a PLN, IL, TL or ISS id before that stage:
  a pre-claim the stage does not use leaves an orphaned marker under
  `flowcharge/ids/`.
  `{ws_dir}` is the workstream's folder path, and you resolve it before the stage. No
  stage claims it, because it is not an artefact ID. It has two sources, and both are
  observed rather than composed. For a new workstream, `--new-ws` prints two lines: the
  claimed WS id, then the created record's path
  `flowcharge/workstreams/<WS-id>-<slug>/workstream.md`. Take that second line and remove
  the trailing `/workstream.md`. For a resumed workstream, you have already found the
  folder by listing `flowcharge/workstreams/` and matching by slug suffix (see FlowCharge Core
  upkeep). Take `flowcharge/workstreams/` plus that matched directory name. Read the value
  from what the command printed or from what the listing found. Never compose it from the
  id and the slug. `{ws_id}` keeps its present source and its present meaning. It is still
  needed for each artefact's frontmatter `workstream:` key.
- **plan-and-tasks**: hard rule 12 fires on the plan this stage produced, at the
  point its trigger names.
- **execute-tasks**: first Read the task list and enumerate its parent
  tasks. Then loop in file order: run the stage file for one parent task, with
  `{parent_task}` as its number, evaluate its result, and only then begin the next. If a
  result reports an abort or a checklist item that stays failed, halt per rule 7. A NOT
  CHECKED item is no failure: lift every one, with its reason, from each parent task's
  result into the run's final report, at every tier. Apply hard rule 13 once, before the
  first parent task, then the test-run task's baseline run ("The test-run loop").
- **commit**: invoke the fc-git skill in this session with the user's standing
  instruction: "Commit all created and/or modified files in one commit to the
  current branch. This work traces to <every artefact this run touched, as ID +
  title, e.g. `ISS-N` (title) under `WS-N-SUFFIX` (title), executed via `TL-N`>; cite these
  IDs in the commit body per your committing rules." Adjust "created/modified" to
  what the run actually produced. The commit stage runs no suite: the task list's
  test-run task already ran them ("The test-run loop").
- **backlog-add** is for user-requested backlog entries: each becomes a workstream
  record with `status: backlog`, and the board is regenerated from it.
  The stage chooses each title, slug and tags and runs `--new-ws` in its own steps;
  "Start of run" neither creates the folder nor claims the id for it.
- **validate**: under `validate: on`, one pass runs once per authoring stage, after
  that stage finishes and before the execute-tasks prompt that follows it, from
  `templates/validate.md`. `{upstream}` is `plan` on the plan path and `issue list` on
  the issue path, `{upstream_path}` is that artefact's path, `{role}` is `architect` or
  `engineer` respectively, and `{stages}` passes through unchanged from the authoring
  stage. The fixed comparison order and the never-align-backwards rule are
  `skills/fc-validate/SKILL.md`'s own. Under `validate: off`, the validation stage does
  not run at all. The stage is not prompted, because it neither changes project code
  nor commits; "Chaining" states what you owe it afterwards. Its stage report carries
  the validation's summary line and any open finding only; the per-fix detail is printed
  on request and not before. On the plan path, hard rule 12's scenario trace runs once
  this stage finishes.

## Parsing the request

You read the target project yourself, because every stage's work is yours: each
stage file says what that stage reads.

Map the user's English onto an ordered subset of operations. The standard chains:

- "file these findings as issues [then fix them]" (findings come from the
  conversation) → issues-and-tasks → validate →
  [prompt] execute-tasks → [prompt] commit
- "plan X [and build it]" → plan-and-tasks → validate →
  [prompt] execute-tasks → [prompt] commit
- "fix what blocks X, then plan X" → issues-and-tasks → validate → [prompt] execute-tasks →
  [prompt] commit → plan-and-tasks → validate → [prompt] execute-tasks → [prompt] commit. One
  workstream, two authoring stages. Each per-authoring-stage bound applies to each stage.
- "look into X" / "investigate X" → investigate (then stop; feed into plan-and-tasks or
  backlog-add only if asked)
- "turn <issue list / plan> into tasks" → issues-and-tasks / plan-and-tasks with
  `{stages}: tasks-only`
- "run <task list>" → execute-tasks → [prompt] commit if asked
- "add X to the board / backlog" → backlog-add

Rules of interpretation:

- Only what the user asked for: "file these findings as issues" ends at
  issues-and-tasks with `{stages}: issues-only`. Do not continue to tasks
  because the chain usually does. When
  the stage the run stopped short of is a prompted one (execute-tasks or commit),
  do not put "shall I proceed to it?" into the end-of-run numbered list, and
  attach no recommendation to it. Mention it in prose as an available follow-up,
  the same way FlowCharge Core upkeep offers to archive a finished workstream, so a
  blanket reply can never sweep it up. If the user then asks for it, that request
  is a fresh instruction, judged under rule 4 like any other.
- Vague continuations ("…and so on", "the usual", "the full flow") mean the
  standard chain from that point, prompts included. State the pipeline you inferred
  in one line before starting, so a wrong reading dies early. Then proceed without
  waiting.
- If an input artefact is ambiguous (two candidate issue lists, no plan named),
  check `index.md` first: it names every artefact with its status and
  workstream; regenerate it if stale. Ask only if it stays undecidable.
- **Scale, decided once.** From the request's words alone, before the first stage:
  `small` when it names one existing file or element (its test file does not
  count), one value or behaviour to change, and no new file, interface, schema or
  dependency; otherwise, or when unsure, `standard`. Resolve `{scale}` to it and state it in one line before
  starting. Never revisit it: a stage that finds more promotes its own artefact
  (the full plan, the full task shape) and reports it.
- Every run belongs to a workstream: an existing `flowcharge/workstreams/WS-N-SUFFIX-<slug>/` folder, or a new
  one you create (see FlowCharge Core upkeep). The workstream is the unit the board tracks.
  `backlog-add` is the exception: its output is new backlog workstreams that its
  stage creates, so the run has no workstream of its own.

## Running a stage: the procedure

1. Read the stage file from `templates/`.
2. Resolve each `{name}` slot to its literal value. For `{ws_dir}`, take that value
   from the "ID slots" note above.
3. Follow the file's Instructions in order, reading each slot as its resolved value,
   inside the file's own limits (rule 8). Where the file names the request, the
   findings, the decisions already taken or the constraints in play, it means what
   the conversation and the chained artefacts hold; never invent any of them.
4. Finish with what the file's Return section lists. That is the stage's result: it
   feeds your stage report and the stages that follow, and only then does the next
   stage begin.

### Sanctioned deviations

These, and nothing else:

- Skipping a stage file's Context reading when the context-docs list is empty, per
  its Operations note.
- Reading `{item1}` / `{item2}` in kanban-add.md as the actual list of items, however
  many there are.
- In execute-parent-task, the loop mechanics live in this skill, not the stage file;
  the stage file covers one parent task only.

## Chaining

- findings the user supplies → issues-and-tasks: carry every finding
  with its location, failure scenario, severity and confidence, all of them,
  unfiltered; what is Not filed is decided by the issues stage's own add-versus-correct
  test, never before that stage.
- issues-and-tasks path → `{issuelist}`; plan-and-tasks path → `{plan}`; task-list
  path → `{tasklist}`. Use the paths the stages report; before the next stage,
  verify the file exists, that its frontmatter `id` matches the ID the stage
  claimed, and that its `depends_on` names the upstream artefact ID you
  already know.
- A stage's result carries into the stages that follow: the stage→task map, skipped
  items, and divergences bind the next stage.
- Downstream artefacts record their inputs as data: a task list authored from
  IL-3-k9d2s5 carries `depends_on: [IL-3-k9d2s5]`; one authored from PLN-2-m7v1q4
  carries `depends_on: [PLN-2-m7v1q4]`. The authoring stage files instruct this;
  verify it landed. A prerequisite-defect constraint records the fixing task list's ID, never
  the issue list's. Only a `tasklist` dependency waits for the fix to land.
- Open ends terminate chains: an issue skipped as a feature, a plan stage left
  untasked, an aborted subtask. None of these flow downstream. They flow up, to the
  user, in your reports. A question settled under "The prompt policy" (rule 10)
  is not an open end. Carry the question and the answer you
  adopted into the next stage as a decision already taken, so
  the stage it was blocking is authored. Where the input artefact already
  carries the question and its recommendation, settle it before
  the stage begins rather than re-running the stage afterwards. Where the question
  first appears in a stage's report, after the stage that needed it already ran,
  run that one stage again once, with the adopted answer as a decision already
  taken, rather than leaving the stage untasked.
  One re-run per stage per run: if the re-run stage reports the same
  question again, relay it unsettled. A validation finding never takes this
  re-run route; the paragraphs below give it its own.

The validation stage is the one exception to that carry, and it runs at most once per
authoring stage: it works from the source material only, per its Operations note.

A fix the validation stage applies ("The validation setting") needs nothing further
but the `updated` bump below: no settling, no re-run of the authoring stage, and no
re-derivation of the task list, because validation's second comparison already
checks the task list against the upstream artefact as its first comparison left it.
The pipeline continues once the validation stage finishes.

An open finding the validation stage reports is an ordinary open question under rule
10, with one difference in how a settled answer reaches its artefact. Where rule 10
settles it, apply the answer you adopted yourself, exactly as stated, under
fc-validate's correction rule and its "A settled finding handed back" subsection, and
say so in the stage report. This is the only path by which a settled validation
finding reaches its artefact: never a re-run of the authoring stage, and never a carry
into a later stage. Applying a settled answer is not a second run of the validation
stage, so the once-per-authoring-stage bound above holds. Where rule 10 relays the
finding instead, it flows up to the user in your reports as any open question does. A
finding validation reports as irreversible relays at every tier, because criterion (a)
is never silenced.

Applying a settled answer never changes `id`, `status`, `base_commit`, `created` or
`updated`: fc-validate's edit limits keep those keys off limits, and a settled answer
does not lift that. The schema's bump-`updated`-on-every-edit rule is satisfied
separately: after a validation stage or an applied settled answer whose summary line
reports one or more fixes, bump the artefact's `updated`. That bump is frontmatter
bookkeeping under rule 8, not the finding's fix.

The residual gap is that a validation fix is not independently re-checked. It is
bounded to the artefact under validation, it is proved in the withheld part of the
validation's result, and it is recoverable with a standalone `/fc-validate`.

## The test-run loop

A task list's final test-run task is where the project's suites run; the fc-task-list
skill's Test-run task section defines its runs and its record. This section is the
orchestrator's part around it. A list with no test-run task (no suite, or authored
before the rule) takes no baseline, runs no suite and enters no loop.

- **Baseline.** In an execute-tasks stage, after hard rule 13's check and before the
  first parent task, run `templates/execute-parent-task.md` once for the list's
  full-form test-run task (`test_run: full`). That run records the baseline only.
  The task runs again in file order, as the list's last task.
- **Recording, never fixing.** When a test-run task returns any `test_run_failures`
  entry, fix nothing yourself. Run the issues-and-tasks stage for a new issue list in
  the same workstream, with `{stages}` as `issues-and-tasks`, or `issues-only` where
  no entry blocks. Supply one finding per entry: its `command` and `check` as the
  location, its `message` as the failure scenario, severity `high` when it blocks and
  `medium` when not, confidence `confirmed`, and the marker
  `test-run failure: blocking` or `test-run failure: pre-existing`. Supply no
  pre-existing failure this workstream has already filed. These entries are the
  validation source for that issue list.
- **A fix round** is that stage, its validation per "The validation setting", and
  execute-tasks on the fix list it produced, under hard rules 4, 5 and 11 as they
  stand, on the same branch. When the fix list's recheck task passes, run every
  earlier fix list's recheck task still unchecked, then the outer test-run task
  again, each through `templates/execute-parent-task.md`. A recheck or outer run that
  returns a blocking entry starts the next round.
- **Pre-existing failures never block.** Pre-existing means in the recorded
  baseline, nothing else (fc-task-list skill, Test-run task). A test-run task whose
  only entries are pre-existing passes, and the run goes on. Their issues stay open:
  list each in the final summary's numbered list.
- **The cap.** After 2 fix rounds, a recheck or outer run that still returns a
  blocking entry halts the run under hard rule 7. Report every failing check, every
  issue filed and the state of each fix list.

**No script can check** that a run takes the baseline, files every failure or stops at
the cap, because no script reads this prose, so this section carries that note in the
way this file's other unverifiable rules do (see DEVELOPMENT.md's note on unverifiable
rules). `fc-index.mjs --check` checks only the record a `done` task list holds.

## Talking to the user

The user does not author or closely read the artefacts: that is the point of the
suite. Every report and question must read cold, with zero homework:

- **No naked references.** Never cite an artefact, issue, task, stage, or open
  question by bare ID or session-local label ("Q7", "task 7.4", "the circularity
  from last time"). At point of use: ID + title (construct one if missing) + one
  plain-English sentence of what it is. IDs are for the files; the sentence is
  for the user.
- **Every question carries a recommendation** with a one-line reason. "Go with
  your recommendations" must always be a complete, safe reply to the questions
  in a numbered list. The one thing it never answers is an unsatisfied
  execute-tasks or commit prompt (rule 4).
- **Ask outcomes, not constructs.** "Two services would get no protocol test
  file. Skip them?" is answerable; "should stage 7 have four files?" is not.
- **A few paragraphs, not a wall.** Prose first; numbered items only for the
  questions. Judgment calls within delegated scope are decided and recorded in
  the summary, not asked.

## Prompts

Same report content either way, formatted per "Talking to the user". Prompt
satisfied (rule 4): post it as a statement and continue. Not satisfied: post it,
then ask "proceed?" as a numbered question with a recommendation, and wait.

- **Before execute-tasks**: the task list path and ID, its parent-task count and
  one-line scope, the dependency check's result (rule 5), anything the authoring
  stage skipped or left open, and the
  staleness check's result (rule 13).
- **Flagged tasks (only when there is something to flag)**: a separately
  labelled block that belongs to the task list, not to the prompt. When the run
  reaches the execute-tasks prompt, post it after that prompt's own content. When
  the run authored a task list it was not asked to execute, post the same
  block, under the same label, in the end-of-run summary instead, exactly as
  it would have read at the prompt. One numbered entry per task whose change is
  risky by the risk test "The prompt policy" defines. That section holds it, and
  this block does not restate it. A
  flag reaches you either in the authoring stage's report or from your own
  pre-prompt read of the task list. Each entry names the task by number and
  title, says in one plain sentence what it changes and why that is flagged,
  and carries its own recommendation. These are ordinary questions: a blanket
  reply answers them. The prompt's own "proceed?" is neither one of these
  entries nor numbered among them, and no reply to them satisfies it (rule 4).
  In a run that never reaches the prompt there is no "proceed?" to offer at all:
  the flags are listed, the prompt is not (see "Parsing the request").
  What a flag does per tier is "The prompt policy"'s table.
  Where a flag blocks, do not begin execution until it has an
  answer. Approving the prompt approves running the list, never a flagged task.
- **Before commit**: `git status --short` of what would be committed, and the
  branch. The end-of-run bookkeeping has already run by this point (see "FlowCharge Core
  upkeep"), so that status is expected to list FlowCharge Core's own edits (the issue-status
  closures, `--sync`'s task-list, issue-list and workstream status flips, the
  regenerated `index.md` and `kanban.md`, and the released `.lease`)
  alongside the run's authored and executed artefacts. The prompt still checks the
  same two things: that `git status --short` output, and the branch.

A "no" or a revision request at a prompt is a normal outcome, not a failure. Apply
the revision (which may mean re-running an authoring stage) or stop cleanly.

A reply that settles other items but does not name this stage leaves the prompt
unsatisfied (rule 4). Apply whatever else the reply settled, say plainly that
the prompt is still open, then ask it again on its own (the prompt question and
nothing else) and wait.

## FlowCharge Core upkeep (automatic, every pipeline run)

Frontmatter is the source of truth; `index.md` and `kanban.md` are generated
views. All board movement happens by editing `status` and regenerating, never by
hand-editing the board. The regeneration command:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

- **Start of run**: this bullet does not run for a `backlog-add` operation. That
  operation's workstreams are its output, and `templates/kanban-add.md` steps 1 to 4
  create each one inside that stage. A run whose only operation is `backlog-add`
  creates no workstream of its own and takes no lease. For every other operation,
  resolve the workstream. Check `flowcharge/workstreams/` for an
  existing folder matching `WS-*-<slug>` by its slug suffix. If one exists, this run
  resumes it: that resumed folder keeps whatever status its `workstream.md` record
  already holds, and reaches `in-progress` only when execution starts, identically to
  a folder this run creates. One rule applies to a resumed record here: if its status
  is `done` or `dropped`, and this run will author or execute anything in the
  workstream, set it to `backlog`, bump `updated`, regenerate, and state the reopen
  plainly in the stage report. If not, choose the `title` and pass CONVENTIONS.md's
  smell test; resolve `tags` from the request per CONVENTIONS.md's `workstream: tags`
  rule, leaving the two automatic tags to be added later in the run, when their trigger
  fires; create the folder with `--new-ws` (CONVENTIONS.md, Creating a workstream); and
  append the body yourself: first line the card description, then as much of the
  request's own detail as it carried, with no length cap (CONVENTIONS.md, `workstream`
  body). Title and first line name the problem or feature in the target project, never
  a FlowCharge Core stage or an artefact-authoring act. A folder this run creates is not
  promoted here: it reaches `in-progress` when execution starts. Once the workstream
  folder exists, acquire its lease before any artefact
  inside it is written: attempt an exclusive create of
  `<workstream folder>/.lease`, e.g. `node -e "const t=require('crypto').randomUUID();try{require('fs').writeFileSync('<path>/.lease','session: '+t+'\nacquired: '+new Date().toISOString()+'\n',{flag:'wx'});console.log(t)}catch(e){process.exit(e.code==='EEXIST'?1:2)}"`,
  which fails with `EEXIST` (exit 1) only if a lease already exists. On success, it
  prints the random session token it wrote. Keep that token for the rest of the run:
  it is how this run recognizes its own lease, and it depends on no agent or host
  environment. Then proceed. On `EEXIST`, read the existing file's `acquired` timestamp and compute
  its age: if under 60 minutes (`LEASE_STALE_MINUTES = 60`), halt per hard rule 7.
  Report the holding `session` value and the lease's age instead of proceeding, and
  do not wait or retry; the report may also note that the user can delete the
  `.lease` file by hand if they are certain the holding session is dead. If 60
  minutes or older, the lease is stale: delete it and retry the exclusive create
  once, then proceed. Then regenerate.
- **When execution starts**: once the execute prompt is approved, and before the
  execute-tasks stage begins, set the workstream's `workstream.md` status to
  `in-progress`, bump `updated`, and regenerate with the command above. Execution is
  the first stage that changes project code, so this is the point at which the board
  must say the work is running. This step is the one and only place `in-progress` is
  ever set, for a fresh workstream and a resumed one alike.
- **After every stage**: set the status of every artefact the stage produced, which
  for a merged plan-and-tasks stage is both of them (freshly authored =
  `ready`; a task list whose execution just completed = `done`), bump `updated` on
  everything the stage touched, then (after an issues-and-tasks or plan-and-tasks stage
  only) test the produced file for its trigger and, when the trigger fires, append
  the matching automatic tag to the owning workstream's `workstream.md` `tags`
  array: `issue` when any file matching `IL-*-issuelist*.md` in that
  workstream's folder holds at least one line matching
  `^- \[( |x)\] ISS-\d+-[0-9a-z]{6}\.`, and `feature` when a file matching
  `PLN-*-plan.md` exists in that folder (appending to the end of the array without reordering it, never
  writing a tag the array already holds and never duplicating an entry, and doing
  so whichever tag mode produced the workstream's other tags) and regenerate.
  Relay any WARN lines the script prints into your stage report.
- **Successful end of run**: this bookkeeping runs once the run's last work stage
  has finished (execute-tasks, or whichever authoring stage the run ended on) and,
  when the run does go on to commit, it runs before the commit stage. The commit
  stage is therefore the run's last stage, and it captures every write listed below.
  A run that never reaches a commit stage still does this bookkeeping at the same
  point, when its last work stage finishes.
  Re-check the issues the completed work was linked to
  and set each one's status yourself: whether an issue is actually fixed is not
  derivable from any file, so the script does not decide it. Then
  close what is mechanical with one command:
  `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --sync`.
  It sets the completed task lists, the fully closed issue lists and the
  workstreams whose artefacts are all done or dropped to `done`, and regenerates
  in the same run. A `close the plan to close the workstream` WARN from that run
  names the plan you must close by hand: `--sync` never sets a plan's status.
  Release the workstream's
  lease: delete `<workstream folder>/.lease`, but only if its `session` line
  still matches the session token this run's own lease create printed. If it does not, another
  run already reclaimed this workstream as stale (see Start of run); skip the
  deletion and note it in this run's report instead of removing the new holder's
  lease. Regenerate. Do NOT archive a workstream you just completed: archiving is the
  user's call (CONVENTIONS.md, Archiving); you may mention it as an available follow-up
  in your summary.
- **Halt or user stop**: leave statuses as they truly are: `in-progress` stays
  `in-progress`. Release the workstream's lease under the same session-match rule as
  at Successful end of run. Regenerate so the board tells the truth.

## Listing artefacts (inline, read-only)

To answer "what is in flight?" mid-session, run the generator's `--list` mode and
paste its table into the chat. It writes nothing (no index, no board, no file),
so it is safe to run at any point in a run:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> \
  --list [<scope>] [--ws <WS-N-SUFFIX>] [--sort <key>] [--desc] [--archived]
```

- **scope**: `workstreams` (the default when omitted), `plans`, `issuelists`,
  `tasklists`, `issues`, `all`.
- **`--ws WS-N-SUFFIX`**: restrict to one workstream. With `--list all` the workstream
  record itself is included. The `Workstream` column is dropped when `--ws` is
  given, since it would be a constant.
- **`--sort`**: `id` (default), `created`, `updated`, `status`, `title`, plus
  `severity` for `--list issues` only. `status` sorts in lifecycle order. `--desc`
  reverses it; ties always break on `id` ascending.
- **`--archived`**: include archived artefacts, which are excluded by default.
- Invalid input (`--list` with `--check` or `--no-board`, an unknown scope, an
  unknown sort key, a sort key the scope has no data for, or an unknown `--ws` id)
  prints one line on stderr and exits 1 with no table.

Paste the table into the chat **verbatim**. It is the answer, not source material:
do not summarise it, reformat it, drop columns, or fold it into prose.

## Reporting

- One line before the run: the inferred pipeline, naming every stage the run
  will execute, one element per stage, the validation stage included and
  never folded into its authoring stage ("issues → spec tasks → validate →
  execute (prompted) → commit (prompted)"), and the workstream it runs under.
  A validation the setting turned off appears in the line as
  `validate (waived)`.
- After each stage: a short update, artefact path and ID, and anything the stage
  or the index script flagged.
- At the end: a consolidated summary, every artefact created (paths and IDs),
  issues filed, tasks executed with pass/fail, commit SHA, workstream status
  changes, index warnings still standing, and a numbered list of everything needing
  the user's decision (open questions, skipped issues, untasked stages), each
  item self-contained with a recommendation, per "Talking to the user", so the
  user can answer "1 yes, 2 no" or just "go with your recommendations". A
  prompted stage this run was not asked to reach is never an item in this list.
  Mention it in prose only, per "Parsing the request".
  Before the consolidated summary prints, compare the stages that ran
  against the announced pipeline line. Where the validation stage did not
  run because the run's resolved `validate` value is `off`, report it as
  **waived**, in prose, never as a numbered item; the `validate` setting is
  the only cause of a waiver, and there is no spoken one-run skip path.
  Where it did not run for any other reason, report it as **missing**, and
  give each artefact it would have checked one numbered, self-contained
  item (ID, title, one plain sentence, per "Talking to the user")
  recommending a standalone `/fc-validate` on that artefact.
  The check reports only and starts no stage, using exactly the two words
  `missing` and `waived`.
  A flagged task is not the prompt. When this run authored a task list that
  carries a flag but was not asked to execute it, that flag is still listed
  here, under the same **Flagged tasks** label the prompt report would have
  used, per "Prompts".
  What fc-validate fixed is never re-enumerated here or in any stage report,
  at every tier: print, per validated artefact, the
  one "N fixes applied" figure its summary line returned, with any
  unrun/unjudged clause that line carries, and nothing more. Anything settled
  under "The prompt policy" (rule 10) joins a per-run settled-decisions record
  instead: one entry per question, naming the answer adopted and the stage it
  came from, with any entry rule 10's risk test called risky marked and listed
  first. Produce that record every run. Of it, the summary prints exactly one
  line, verbatim with K filled in ("K decisions were settled automatically;
  say 'show them' to see them."), omitted when K is 0. The summary never
  lists the record's entries; they print only when the user asks. It is a
  record, not a request, and the user may reverse any
  entry in it. An open finding rule 10 could not settle is not suppressed by
  any of this: it always prints, in the numbered list above, in every mode.
  The consolidated summary ends the run and prints once. A later event carrying
  no new instruction (a background completion notice, a duplicated message, an
  echo of the answered request) gets one line pointing at that summary,
  nothing more: no re-printed summary, no re-run stage or upkeep, and no
  restated counts or their breakdown. A new
  instruction starts new work as usual.
