---
name: flowcharge
description: Orchestrate the FlowCharge Core project-management suite from one plain-English request. Chain investigations, plans, issue lists, task lists (diff or spec), task execution, git commits, and board/index upkeep by spawning subagents with pre-authored prompt templates and feeding each stage's output into the next. FlowCharge Core is the frontmatter-and-ID successor to the AK suite; artefacts live in flowcharge/workstreams/WS-N-SUFFIX-<slug>/ workstream folders. Use whenever the user describes a multi-step FlowCharge Core workflow in any phrasing ("file these findings as issues in flowcharge and fix them", "plan Y in flowcharge, create the tasks, execute and commit") and on /flowcharge. Do NOT use when the user invokes exactly one fc- skill for a single artefact with no chaining. Run that skill directly.
metadata:
  version: "0.4.0"
---

# FlowCharge

You are the conductor of the user's FlowCharge Core project-management suite. The user states
outcomes in plain English ("file these findings on the scope service as issues,
author spec tasks, execute them, commit"). You translate that into an ordered pipeline of
operations, run each operation by spawning a subagent with a pre-authored prompt
template filled verbatim, chain each stage's return into the next stage's inputs,
prompt before the two dangerous stages, keep the artefact frontmatter, index, and board
current, and report.

The templates in `templates/` are the user's own prompt templates. Your
job is faithful delivery and sequencing, never rewriting, improving, or doing a
stage's work inline yourself.

**At the start of every run, Read `CONVENTIONS.md` in this skill's directory.** It
is the FlowCharge Core data model: layout, IDs, frontmatter, status lifecycle,
index/board generation. Where anything below is silent, CONVENTIONS.md answers.

**Also Read `flowcharge/agents.md` in the project root at the start of every run,
if it exists.** Its absence is not an error. The skill's built-in defaults apply
in that case.

## Hard rules

1. **Templates are verbatim.** Before every spawn, Read the template file fresh from
   this skill's `templates/` directory and reproduce it exactly: same wording, order,
   fencing, and emphasis. Substitute only the marked slots. Never paraphrase, trim,
   reorder, or add sections. The only sanctioned deviations are listed under
   "Sanctioned deviations", nothing else.
2. **Two slot kinds.** `{name}` slots (e.g. `{artefact}`, `{plan}`, `{issuelist}`,
   `{tasklist}`, `{ws_id}`, `{slug}`, `{ws_dir}`, `{item1}`) take a literal value, a path or
   identifier. `{{...}}` double-braced blocks are briefings you author fresh each
   run; the block's own text states exactly what belongs in it. Be complete on
   those points, no padding, and never leave the placeholder text in the sent
   prompt.
3. **Subagent type.** Spawn each stage with your environment's own subagent-spawning
   capability, requesting no explicit model, effort or role by default, so the
   subagent inherits the calling agent's. If the user names a model, effort or role
   ("use sonnet", "fable medium"), resolve it to the nearest agent type or setting
   your environment offers, and hold that for the whole run, or for just the named
   stage if they scoped it. Never silently downgrade. If `flowcharge/agents.md` sets
   `default_agent` to a non-blank value, that string is the run's default
   subagent_type unless the request names one explicitly, which still wins per the
   override above (see "Standing vs. one-off instructions").
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
6. **Strictly serial.** One operation at a time, one subagent at a time. Never run
   two stages or two parent tasks concurrently. Later work assumes earlier edits
   have landed.
7. **Failure halts the pipeline.** An aborted subtask, a checklist item that stays
   failed, or a subagent reporting it could not complete stops the run. Report what
   completed, what failed and why, and what was not run. Do not improvise a fix, do
   not skip ahead.
8. **You orchestrate; subagents work.** Never perform a stage's work inline. The
   only inline actions are: filling and dispatching subagent prompts, the commit stage (via
   the fc-git skill), cutting the run's feature branch (rule 11), workstream ID
   allocation via `fc-index.mjs --new-ws` for the run's own workstream, as "Start of run" directs, never for a `backlog-add` item, whose workstreams the spawned subagent creates (see "ID slots" below), workstream-record and artefact frontmatter bookkeeping (`status`, `tags`, and `updated` bumps, including the `updated` bump after a validator-applied edit),
   running the index generator, running a read-only artefact listing (see
   "Listing artefacts"), writing `flowcharge/agents.md` when a standing preference
   is recognized (see "Standing vs. one-off instructions"), and reading artefact
   files when a stage's return needs verifying or a briefing needs facts.
9. **Task-list mode defaults to spec.** Use the `-spec` template unless the user
   says diff. If they name neither and the work is plainly diff-shaped (the
   authoring subagent says so in its return), relay that observation. Don't switch
   modes yourself mid-run. If `flowcharge/agents.md` sets `task_list_mode` to
   `diff`, that is the run's default instead of spec, unless the request names a
   mode explicitly, which still wins (see "Standing vs. one-off instructions").
10. **Honour subagent returns.** Open questions, skipped issues, untasked stages,
    and divergences reported by a subagent are carried verbatim into your stage
    report and the final summary. Never settle an open question on the user's
    behalf, and never author downstream work for a stage a subagent left open.
    Exception, opt-in per project: "The prompt policy" decides whether a
    reported open question settles or relays, and that section is the only
    definition of the tiers and of the risk test they apply. Where it settles,
    adopt the recommendation the subagent wrote, as stated, never one you
    compose, treat the question as settled, and continue. Where it relays,
    carry the question as above. An explicit
    instruction in the request still wins for that run, exactly as in rules 3,
    4 and 9 (see "Standing vs. one-off instructions"). A question settled this
    way is no longer "left open" for this rule's last clause, so the work behind
    it may proceed.
    Settling is never unrecorded: record the question, the answer you adopted, and
    the preference that let you adopt it, in the settled-decisions record "Reporting"
    defines, printed on request, its fixes counted always.
    A correction fc-validate applies on its own authority (under its
    correction boundary, mechanical and provable, with no recommendation and
    no settling involved) is never a settled question and never enters this
    rule, however a return or a report phrases it. Only an open finding that
    passed this rule's settle-or-relay test counts as settled. The printed
    count line combines both as "N fixes applied"; the settled-decisions
    record and fc-validate's withheld detail keep them apart.
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
    built from it.** On the merged plan-and-tasks stage's return, read the
    plan it produced and the workstream record it belongs to (its
    frontmatter `workstream:` key), then state, in one line per case, how
    the plan's design handles each concrete scenario or failure case the
    workstream record's body names as the reason the work is needed. There
    is no spawn between the plan and its tasks in a merged run, which is why
    the check reads a return rather than preceding a spawn. In a `tasks-only`
    run the plan already exists, so the check keeps its present position and
    fires before that stage is spawned. This
    is a trace of the plan's actual proposed text against that scenario,
    not a restatement that the plan reads as internally consistent or that
    its acceptance criteria are individually satisfiable, and it runs
    whether the plan was authored earlier in this same run or in an earlier
    one. State the trace in that stage's report. It is the orchestrator's
    own reading, under rule 8's carve-out for reading artefact files when a
    briefing needs facts, never a subagent's. When the workstream record
    names no concrete scenario or failure case, say so in one line and
    proceed. When it names one the plan's stated design does not visibly
    handle, halt and report instead of spawning the next stage; the user
    may override, per-run, exactly as rule 5's dependency check does. Where the record names a
    scenario as a prerequisite defect an earlier stage of this run already fixed, name that fix
    as the answer: the plan's design is not required to handle it, and must not absorb it. This
    check supplements, and never replaces, a walkthrough task a task list
    may still place against the finished file.
13. **A task list is checked for drift against the branch before
    execute-tasks' first spawn.** Before spawning the first parent-task
    subagent of an execute-tasks run, for the task list that stage is
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
    prompt. Run this check once per run, immediately before the first
    parent-task spawn; do not repeat it before later parent tasks in
    the same run. It is the orchestrator's own reading, under rule 8's
    carve-out for reading artefact files when a briefing needs facts,
    never a subagent's.

## Standing vs. one-off instructions

Hard rules 3, 4, 8, 9 and 10, and the validation setting, each read a starting default
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
(e.g. "Noted: default subagent is now sonnet for this project.", "Noted: task-list
mode now defaults to diff for this project.", "Noted: prompts are now set to manual
for this project.", "Noted: prompts are now set to assist for this project.",
"Noted: prompts are now set to cruise for this project.", "Noted: validation is now
off for this project."). No question, no
prompt: writing this file is a local, reversible, non-destructive state change,
the same tier hard rule 8's other inline actions already sit in.

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
| Open question reported by a subagent | always relays | settles when it carries a recommendation and is risky by none of (a), (b), (c); otherwise relays | settles when it carries a recommendation and is not risky by (a); a (b)- and/or (c)-risky recommendation is adopted as written and joins the settled-decisions record, marked risky |
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
  the fixed open-question block the open-question-capable prompt templates carry, so a
  question whose recommendation field holds `No recommendation possible` is ineligible to
  settle at any tier by its shape alone.
- **The exception covers open questions and flagged tasks only.** An aborted subtask, a
  skipped issue, an untasked stage and a divergence still relay unsettled at every
  tier, and hard rule 7 still halts the pipeline on a failure.

An explicit instruction in the request still wins for one run, exactly as hard rules 3,
4 and 9 already provide, and the standing-versus-one-off test decides whether it is
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

Under `on`, one pass runs once per authoring stage, after that stage's return and before the
execute-tasks prompt that follows it. Under `off`, no validator is spawned.

- **Accepted values:** `on`, `off`.
- **Built-in default when the key and the file are both absent:** `on`.

See `## Reporting` for how a run reports a validation that ran, was waived, or is
missing.

**No script can check** whether a run performs the pass or skips it, because no script
reads this prose, so this section carries that note in the way this file's other
unverifiable rules do (see DEVELOPMENT.md's note on unverifiable rules).

## Operations

Each operation names its template, its slots, what it consumes, and what it returns.

| Operation | Template | Slots | Consumes | Returns |
|---|---|---|---|---|
| investigate | `templates/investigate.md` | `{{context docs}}`, `{{investigation}}` | question from the request | findings summary |
| plan-and-tasks | `templates/plan-and-tasks-spec.md` or `-diff.md` | `{stages}`, `{plan}`, `{ws_dir}`, `{ws_id}`, `{slug}`, `{{context docs}}`, `{{briefing}}` | feature description, or investigate findings; a plan path in `{plan}` when `{stages}` is `tasks-only` | plan path, summary, open questions, task list path, stage→task map |
| issues-and-tasks | `templates/issues-and-tasks-spec.md` or `-diff.md` | `{stages}`, `{issuelist}`, `{ws_dir}`, `{ws_id}`, `{slug}`, `{{context docs}}`, `{{briefing}}` | findings the user supplies; an issue list path in `{issuelist}` when `{stages}` is `tasks-only` | issue list path, ISS IDs, task list path, ISS→task map |
| validate | `templates/validate-plan-and-tasks.md` or `-issues-and-tasks.md` | `{stages}`, `{plan}` or `{issuelist}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}`, `{{source material}}` | both artefacts the authoring stage returned, plus the source it authored from | one summary line per comparison, plus any open finding; correction detail withheld |
| execute-tasks | `templates/execute-parent-task.md` (one spawn per parent task) | `{tasklist}`, `{{parent task number}}`, `{{context docs}}`, `{{briefing}}` | task list path, **PROMPTED**, deps checked per rule 5 | per-task applied/aborted status, self_eval |
| commit | inline via the **fc-git** skill | - | completed work, plus the end-of-run upkeep writes that have already landed (issue closures, `--sync` status flips, regenerated index/board, released lease), **PROMPTED** | commit SHA |
| backlog-add | `templates/kanban-add.md` | `{item1}`, `{item2}`, …, `{{context docs}}`, `{{briefing}}` | backlog items from the request | WS IDs, slugs, card text |
| upkeep | inline (see FlowCharge Core upkeep) | - | every stage boundary | fresh index + board |
| list | inline (see Listing artefacts) | - | scope / workstream / sort from the request | Markdown table (in chat) |

Notes:

- **`{{context docs}}`**: the same shared Context-section block in every template.
  It resolves to this project's own structural or reference documentation as a
  list of repo-relative paths, one line per document saying what that document
  covers and when to read it, or to nothing when the project has none. Its own
  text states what to produce and what to delete when it comes out empty.
- **ID slots** (`{ws_id}`, `{ws_dir}`): `{ws_id}` is the only artefact ID you allocate, and it
  comes from the `--new-ws` run that created the workstream folder (see FlowCharge Core
  upkeep). The folder must exist before anything is written into it. Every other
  artefact ID is claimed by the subagent that writes the artefact: it runs
  `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim <TYPE>`
  itself and reports the id it claimed. Never pre-claim a PLN, IL, TL or ISS id:
  a pre-claim the subagent does not use leaves an orphaned marker under
  `flowcharge/ids/`.
  `{ws_dir}` is the workstream's folder path, and you supply it. The subagent never
  self-claims it, because it is not an artefact ID. It has two sources, and both are
  observed rather than composed. For a new workstream, `--new-ws` prints two lines: the
  claimed WS id, then the created record's path
  `flowcharge/workstreams/<WS-id>-<slug>/workstream.md`. Take that second line and remove
  the trailing `/workstream.md`. For a resumed workstream, you have already found the
  folder by listing `flowcharge/workstreams/` and matching by slug suffix (see FlowCharge Core
  upkeep). Take `flowcharge/workstreams/` plus that matched directory name. Read the value
  from what the command printed or from what the listing found. Never compose it from the
  id and the slug. `{ws_id}` keeps its present source and its present meaning. It is still
  needed for each artefact's frontmatter `workstream:` key.
- **plan-and-tasks**: apply hard rule 12 to the plan this stage produced, on the
  stage's return — state in one line per case how the plan's design handles each
  scenario its workstream record names, and halt instead of going on to the next
  stage if one is not visibly handled. In a `tasks-only` run the plan already
  exists before the spawn, so the rule keeps its present position and fires there.
- **execute-tasks**: first Read the task list yourself and enumerate its parent
  tasks. Then loop in file order: fill the template for one parent task, spawn, wait
  for the return, evaluate it, only then spawn the next. If a return reports an
  abort or a checklist item that stays failed, halt per rule 7. Before the first
  spawn, apply hard rule 13 once — compare the task list's `base_commit` or
  `updated` against current `HEAD` and state the finding in that stage's report
  rather than halting.
- **commit**: invoke the fc-git skill in the main session with the user's standing
  instruction: "Commit all created and/or modified files in one commit to the
  current branch. This work traces to <every artefact this run touched, as ID +
  title, e.g. `ISS-N` (title) under `WS-N-SUFFIX` (title), executed via `TL-N`>; cite these
  IDs in the commit body per your committing rules." Adjust "created/modified" to
  what the run actually produced.
- **backlog-add** is for user-requested backlog entries: each becomes a workstream
  record with `status: backlog`, and the board is regenerated from it.
  The subagent chooses each title, slug and tags and runs `--new-ws` itself; the
  orchestrator neither creates the folder nor claims the id.
- **validate**: under `validate: on`, one pass runs once per authoring stage, spawned after
  that stage's return and before the execute-tasks prompt that follows it. The path chooses the
  template: the plan path spawns `validate-plan-and-tasks.md`, the issue path spawns
  `validate-issues-and-tasks.md`. `{stages}` passes through unchanged from the
  authoring stage. The fixed comparison order and the never-align-backwards rule are
  `skills/fc-validate/SKILL.md`'s own; this note points at that skill rather than
  restating either. Under `validate: off`, no validation subagent is spawned at all.
  The validation stage is not prompted, because it neither changes project code nor
  commits. Its stage report carries the validator's summary line and any open finding
  only; the per-correction detail is printed on request and not before.

## Parsing the request

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
- Every run belongs to a workstream: an existing `flowcharge/workstreams/WS-N-SUFFIX-<slug>/` folder, or a new
  one you create (see FlowCharge Core upkeep). The workstream is the unit the board tracks.
  `backlog-add` is the exception: its output is new backlog workstreams that the
  subagent creates, so the run has no workstream of its own.

## Filling a template: the verbatim procedure

1. Read the template file from `templates/`.
2. Copy its full text into the subagent prompt.
3. Replace each `{name}` slot with its literal value. For `{ws_dir}`, take that value
   from the "ID slots" note above.
4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
   the points the placeholder text names. Draw facts from the conversation, the
   chained artefacts (read them if needed), and files under `flowcharge/`, never invent.
   The `{{context docs}}` block is the one exception: its own text names the
   project-root files to check for.
5. Re-scan the result against the template: outside the slots, nothing changed.
6. Spawn the subagent per hard rule 3, applying an override only if that rule
   resolved one, and run it in the foreground: wait for its result before doing
   anything else.

### Sanctioned deviations

These, and nothing else:

- Deleting the Context lead-in sentence (and, where that empties the section, its
  heading) when the `{{context docs}}` placeholder resolves to nothing. The
  placeholder's own text states when and how far; resolve the project's
  documentation once per run, not per stage. Write its one-line notes at that
  same point, then reuse that one resolved block verbatim in every spawn of the
  run.
- Adjusting `{item1}` / `{item2}` bullet count in kanban-add.md to the actual number
  of items.
- In execute-parent-task, the loop mechanics live in this skill, not the template;
  the template is the per-task prompt template only.

## Chaining

- findings the user supplies → issues-and-tasks `{{findings}}`: carry every finding
  with its location, failure scenario, severity and confidence, all of them,
  unfiltered; the issues subagent decides what is Not filed, not you.
- issues-and-tasks path → `{issuelist}`; plan-and-tasks path → `{plan}`; task-list
  path → `{tasklist}`. Use the paths the subagents return; before the next stage,
  verify the file exists, that its frontmatter `id` matches the ID the subagent
  reported claiming, and that its `depends_on` names the upstream artefact ID you
  already know.
- Subagent returns feed the next `{{briefing}}`: the stage→task map, skipped items,
  and divergences are exactly the context the next subagent "cannot discover for
  itself".
- Downstream artefacts record their inputs as data: a task list authored from
  IL-3-k9d2s5 carries `depends_on: [IL-3-k9d2s5]`; one authored from PLN-2-m7v1q4
  carries `depends_on: [PLN-2-m7v1q4]`. The authoring templates instruct this;
  verify it landed. A prerequisite-defect constraint records the fixing task list's ID, never
  the issue list's. Only a `tasklist` dependency waits for the fix to land.
- Open ends terminate chains: an issue skipped as a feature, a plan stage left
  untasked, an aborted subtask. None of these flow downstream. They flow up, to the
  user, in your reports. A question settled under "The prompt policy" (rule 10)
  is not an open end. State the question and the answer you
  adopted in the next stage's `{{briefing}}` as a decision already taken, so
  the stage it was blocking is authored. Where the input artefact already
  carries the question and its recommendation, put it in the briefing before
  the spawn rather than re-running the stage afterwards. Where the question
  first appears in a return, after the stage that needed it already ran,
  re-spawn that one stage once, with the question and the adopted answer in its
  `{{briefing}}`, rather than leaving the stage untasked.
  After a plan-level correction, that re-spawn uses the merged plan template with
  `{stages}: tasks-only` and `{plan}` pointing at the corrected plan, so one
  re-spawn re-derives the task list without re-authoring the plan.
  One re-spawn per stage per run: if the re-spawned stage returns the same
  question again, relay it unsettled.

The validation stage is the one exception to "subagent returns feed the next
`{{briefing}}`", and it runs at most once per authoring stage. Its briefing
carries the artefact and its source only, never the authoring subagent's return, its
rationale, or its self-report, because fresh context is the active ingredient, and
the authoring subagent's account of what it did is exactly the contamination this
stage exists to avoid. The user's findings that feed `validate-issues-and-tasks.md`
are not an exception to this: they are the source, and they reach the validation from
the user, not from issues-and-tasks. On the no-loop carve-out: the policy section's
settling rule may re-spawn one authoring stage once when a validation finding is adopted as a
settled question, and the re-authored artefact is not validated again, because the
re-spawn's `{{briefing}}` already carries the finding and the answer adopted for it.
Where a first-comparison finding is applied to the upstream artefact, by the
validator-applied path or by the re-spawn path, the task list is re-derived with the
merged authoring template at `{stages}: tasks-only` pointed at the corrected upstream
artefact, because the existing task list derives from the uncorrected one. This
re-spawn is the one the existing budget already allows, and the re-derived task list
is not validated again.
The residual gap is that a re-authored artefact may reach execution unvalidated. It is
bounded to one artefact per run, it is named in the stage report, and it is
recoverable with a standalone `/fc-validate`.

Rule 10 settles a validation finding exactly as it does today, its risk test included.
What follows changes only how the settled answer reaches the artefact. Where the
settled finding is non-risky and the validator's label says its recommended fix is
localised, hand the finding and the answer you adopted back to the validation subagent
that reported it, and that subagent applies the edit. Where the finding is risky (at
every tier), where the label says structural, where the finding
carries no label, where the environment
cannot continue a subagent that already ran, or where the validator declines and
reports the fix as structural, take the re-spawn path the settling rule above already
describes.

A settled validation finding therefore reaches its artefact by exactly one of two named
paths (the validator-applied path, or the re-spawn path) and never by briefing-carry
alone. The briefing-carry-only route above, which puts a question the input artefact
already carries into the next briefing before the spawn rather than re-running the
stage afterwards, is the route that sentence excludes. Route on the label the validator
wrote: you never classify the fix yourself, and a finding that carries no label is
structural. You never apply the edit yourself either: rule 8 forbids it, and nothing
here loosens it.

The follow-up message never instructs a frontmatter change, `updated` included: the
validator's contract forbids frontmatter edits, and no coordinator instruction lifts
that. The schema's bump-`updated`-on-every-edit rule is yours to satisfy instead:
once the validator confirms the edit landed, bump the artefact's `updated` inline.
That bump is frontmatter bookkeeping under rule 8's carve-out, not the finding's fix,
so it does not breach the sentence above.

The validator-applied path does not consume the one re-spawn the re-spawn path allows,
so a decline still leaves that re-spawn available. A follow-up turn to the validation
subagent is not a second run of the validation stage, so the validation stage's own
once-per-authoring-stage bound above still holds and is not being widened. Where the
environment cannot continue a subagent that already ran, take the re-spawn path and say
so in the stage report. The pipeline never halts for this.

The validator-applied path names its own residual gap, as the carve-out above names
its: the applied edit is not independently re-checked. That gap is narrower, because
the edit is bounded to sections the artefact already has, and the agent that applied it
had already read the artefact against its source.

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
  execute-tasks or commit prompt: that reply is neither direct nor determinate
  about the stage, so the prompt stays open (rule 4).
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
  stage skipped or left open, the resolved agent type, and the
  staleness check's result (rule 13).
- **Flagged tasks (only when there is something to flag)**: a separately
  labelled block that belongs to the task list, not to the prompt. When the run
  reaches the execute-tasks prompt, post it after that prompt's own content. When
  the run authored a task list it was not asked to execute, post the same
  block, under the same label, in the end-of-run summary instead, exactly as
  it would have read at the prompt. One numbered entry per task whose change is
  risky by the risk test "The prompt policy" defines. That section holds it, and
  this block does not restate it. A
  flag reaches you either in the authoring stage's return or from your own
  pre-prompt read of the task list. Each entry names the task by number and
  title, says in one plain sentence what it changes and why that is flagged,
  and carries its own recommendation. These are ordinary questions: a blanket
  reply answers them. The prompt's own "proceed?" is neither one of these
  entries nor numbered among them, and no reply to them satisfies it (rule 4).
  In a run that never reaches the prompt there is no "proceed?" to offer at all:
  the flags are listed, the prompt is not (see "Parsing the request").
  What a flag then does is the policy section's to say, per tier, and is a
  pointer here rather than a second copy of its table: under `manual` and
  `assist` every flag blocks before execution begins, and under `cruise` a flag
  risky by (b) and/or (c) only is adopted and joins the settled-decisions record
  while a flag risky by (a) blocks.
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
  create each one inside the subagent. A run whose only operation is `backlog-add`
  creates no workstream of its own and takes no lease. For every other operation,
  resolve the workstream. Check `flowcharge/workstreams/` for an
  existing folder matching `WS-*-<slug>` by its slug suffix. If one exists, this run
  resumes it: that resumed folder keeps whatever status its `workstream.md` record
  already holds, and reaches `in-progress` only when execution starts, identically to
  a folder this run creates. One rule applies to a resumed record here: if its status
  is `done` or `dropped`, and this run will author or execute anything in the
  workstream, set it to `backlog`, bump `updated`, regenerate, and state the reopen
  plainly in the stage report. If not, choose the `title` first: it must name the
  problem or feature in the target project, never a FlowCharge Core stage or an
  artefact-authoring act. Apply CONVENTIONS.md's smell test before you create the
  folder. Then run
  `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--tags a,b]`.
  It claims the id, creates the folder as `flowcharge/workstreams/WS-N-SUFFIX-<slug>/`, writes
  its `workstream.md` with every required key present and valid, and prints the
  claimed id and the created path. A folder this run creates is not promoted here: its
  record keeps the status `--new-ws` gave it, and it reaches `in-progress` later, when
  execution starts. Its body is empty. Append the body yourself: first
  line the card description, then as much of the request's own detail as it carried,
  with no length cap (CONVENTIONS.md, `workstream` body).
  For `tags`: read `flowcharge/tags.md` first. If the request contains `#word` tokens,
  lowercase each; for each, check the pool for a spelling that already covers the same
  idea, including a different grammatical form of the same word, and reuse that
  spelling instead of the literal token; a word with no covering pool entry is
  registered as a new line in `flowcharge/tags.md`. Those words, once resolved, become
  the workstream's entire `tags` set. Do not also add tags the pool's subject-matching
  would otherwise have chosen; the two automatic tags noted below are the one
  exception. If any `#word` carries a trailing `+` (e.g. `#gates+`),
  strip the `+` and treat the resolved words as a seed instead of the entire set: keep
  them all, and also choose any further tags from the pool's existing spellings
  matching the work's subject, the same reuse-first judgment, registering a new pool
  entry only if nothing covers it. If the request carries no `#` words, choose `tags`
  from the pool's existing spellings matching the work's subject; register one new pool
  entry only if nothing already covers it.
  Two tags stand outside all three modes: `issue` and `feature` are automatic
  (CONVENTIONS.md, `workstream`: `tags`), added on top of whatever a mode produced,
  the exact `#tag` mode included, once their trigger fires later in the run, not here.
  Never invent a near-miss variant of a spelling already in the pool.
  That first line must name the problem or feature in the target project, never a
  FlowCharge Core stage or an artefact-authoring act, the same rule the title passed before
  the folder was created. If `flowcharge/` itself is missing, run
  `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --init`
  first: it creates `flowcharge/workstreams/` and, transitively, `flowcharge/`, and is
  a no-op when they already exist. `--init` does not create `ids.md`, and its WARN that
  `ids.md` is missing needs no action here: the `--new-ws` run that follows seeds
  `ids.md`, as `--claim` does (CONVENTIONS.md, IDs: Registry). Once the workstream
  folder exists, acquire its lease before any artefact
  inside it is written: attempt an exclusive create of
  `<workstream folder>/.lease`, e.g. `node -e "try{require('fs').writeFileSync('<path>/.lease','session: '+process.env.CLAUDE_CODE_SESSION_ID+'\nacquired: '+new Date().toISOString()+'\n',{flag:'wx'})}catch(e){process.exit(e.code==='EEXIST'?1:2)}"`,
  which fails with `EEXIST` (exit 1) only if a lease already exists. On success,
  proceed. On `EEXIST`, read the existing file's `acquired` timestamp and compute
  its age: if under 60 minutes (`LEASE_STALE_MINUTES = 60`), halt per hard rule 7.
  Report the holding `session` value and the lease's age instead of proceeding, and
  do not wait or retry; the report may also note that the user can delete the
  `.lease` file by hand if they are certain the holding session is dead. If 60
  minutes or older, the lease is stale: delete it and retry the exclusive create
  once, then proceed. Then regenerate.
- **When execution starts**: once the execute prompt is approved, and before the
  execute-tasks subagent is spawned, set the workstream's `workstream.md` status to
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
  still matches this run's own `CLAUDE_CODE_SESSION_ID`. If it does not, another
  run already reclaimed this workstream as stale (see Start of run); skip the
  deletion and note it in this run's report instead of removing the new holder's
  lease. Regenerate. Do NOT archive
  a workstream you just completed: archiving (moving its folder to
  `flowcharge/archive/`) happens only on the user's say-so, per CONVENTIONS.md; you
  may mention it as an available follow-up in your summary.
- **Halt or user stop**: leave statuses as they truly are: `in-progress` stays
  `in-progress`. Release the workstream's lease: delete
  `<workstream folder>/.lease`, but only if its `session` line still matches
  this run's own `CLAUDE_CODE_SESSION_ID`. If it does not, another run already
  reclaimed this workstream as stale (see Start of run); skip the deletion and
  note it in this run's report instead of removing the new holder's lease.
  Regenerate so the board tells the truth.

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
- After each stage: a short update, artefact path and ID, and anything the subagent
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
  The re-spawn carve-out counts as validated once and never fires this check.
  The check reports only and starts no stage, using exactly the two words
  `missing` and `waived`.
  A flagged task is not the prompt. When this run authored a task list that
  carries a flag but was not asked to execute it, that flag is still listed
  here, under the same **Flagged tasks** label the prompt report would have
  used, per "Prompts".
  What fc-validate fixed is never re-enumerated here or in any stage report,
  at every tier: print, per validated artefact, the
  one combined "N fixes applied" figure its summary line returned, with any
  unrun/unjudged clause that line carries, and nothing more. Anything settled
  under "The prompt policy" (rule 10) joins a per-run settled-decisions record
  instead: one entry per question, naming the answer adopted, the stage it
  came from, and which path applied it, the validator or a re-authored
  artefact, with any entry rule 10's risk test called risky marked and listed
  first. Produce that record every run. Of it, the summary prints exactly one
  line, verbatim with K filled in ("K decisions were settled automatically;
  say 'show them' to see them."), omitted when K is 0. The summary never
  lists the record's entries; they print only when the user asks. It is a
  record, not a request, and the user may reverse any
  entry in it. An open finding rule 10 could not settle is not suppressed by
  any of this: it always prints, in the numbered list above, in every mode.
  The consolidated summary ends the run and prints once. A later event carrying
  no new instruction (a subagent completion notice, a duplicated message, an
  echo of the answered request) gets one line pointing at that summary,
  nothing more: no re-printed summary, no re-run stage or upkeep, and no
  restated counts or their breakdown. A new
  instruction starts new work as usual.
