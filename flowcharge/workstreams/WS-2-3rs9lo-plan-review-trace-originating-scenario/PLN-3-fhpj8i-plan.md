---
id: PLN-3-fhpj8i
type: plan
workstream: WS-2-3rs9lo
slug: plan-review-trace-originating-scenario
title: "Trace a plan against its originating scenario before authoring tasks from it"
status: ready
created: 2026-09-13
updated: 2026-09-13
depends_on: []
links: []
---

# Trace a plan against its originating scenario before authoring tasks from it

## Summary

`skills/flowcharge/SKILL.md` lets the orchestrator move straight from a returned
plan to the tasks-from-plan stage on the strength of the plan reading as
internally consistent. WS-1-qrec54 showed that check is not the same as
tracing the plan's actual text against the concrete scenario that motivated
it, and that the gap surfaced only in a walkthrough task placed at the very
end of the resulting task list — after five other edits had already landed.
This plan adds one new hard rule, numbered 12, that requires the
orchestrator itself to state, in one line per case, how a plan's design
handles each concrete scenario or failure case its workstream record names,
before it spawns tasks-from-plan for that plan — plus one short echo in the
Operations table's notes, at the `tasks-from-plan` row, pointing back to it.
Both edits land in `skills/flowcharge/SKILL.md` only.

The chosen approach is **a new hard rule plus one coordinated echo in the same
file**, the shape Context's own constraint calls for ("hard-rule voice and
numbering scheme... add or extend one") and the shape WS-3-t2lfk1 used
(canonical rule plus a short pointer at its point of use). No existing hard
rule fits as an extension (see Alternatives), so this adds rule 12 rather than
stretching one of the eleven that already exist.

## Scope

### Acceptance criteria

1. `skills/flowcharge/SKILL.md`'s `## Hard rules` list gains a new rule 12
   that requires stating, in one line per case, how a plan's design handles
   each concrete scenario or failure case its workstream record names, before
   the tasks-from-plan stage is spawned for that plan.
2. Rule 12 states what happens when a named scenario is not visibly handled:
   halt and report instead of spawning tasks-from-plan, with the user able to
   override per-run — the same shape rule 5 already uses for an unmet
   dependency.
3. Rule 12 states what happens when the workstream record names no concrete
   scenario or failure case: say so in one line and proceed.
4. Rule 12 states that this check is the orchestrator's own reading, under
   rule 8's existing carve-out, never a subagent's, and that it supplements
   rather than replaces a walkthrough task a task list may still place against
   the finished file.
5. The Operations table's notes gain one new bullet, for `tasks-from-plan`,
   pointing at rule 12 as the point it applies.
6. No existing hard rule is renumbered, moved, or reworded: the file still
   opens with its present eleven hard rules, unchanged, followed by the new
   twelfth.
7. `git status --short` after the work shows exactly one changed file,
   `skills/flowcharge/SKILL.md`.
8. `node skills/flowcharge/scripts/fc-index.mjs --root <project-root> --check`
   prints no new warning and exits 0.

### Out of scope

- Any change to `CONVENTIONS.md`, `fc-plan-feature`, `fc-task-list`, or any
  other skill's own content — Context's constraint names this explicitly.
- Any change to `skills/flowcharge/templates/` — the templates are the user's
  own text, and this rule governs what the orchestrator does between two
  spawns, not what either spawn's prompt says.
- Extending the same scenario-trace discipline to `tasks-from-issues` (the
  issue-list analogue). Context scopes this workstream to "how flowcharge...
  reviews a **plan** before authoring tasks from it"; issue lists are a
  different artefact with a different source of "the scenario" (individual
  filed issues, not one motivating narrative). See Adjacent opportunities.
- Adding a `flowcharge/agents.md` key or a tier for rule 12. It tightens
  default orchestrator behaviour; it is not a project preference, matching
  how WS-1-qrec54's three modifications were scoped.
- Editing hard rule 8's inline-actions list to name rule 12 explicitly. See
  Design.
- Copying the changed file to the installed skill directories
  (`~/.claude/skills/`, `~/.config/opencode/skills/`) — a separate, later
  act, exactly as PLN-1-kqwu53, the one prior SKILL.md-editing plan in this
  backlog that addressed the sync, scoped it (PLN-2-25o0ic left it unstated).
- Adding a machine-checkable regression test for rule 12's prose. No script
  in this repo reads SKILL.md or observes a chat reply (`fc-index.mjs` scans
  `flowcharge/` frontmatter only); see Testing strategy.

### Assumptions

- **A1.** The target repository is `/Users/akoukoullis/Work/AK/flowcharge-core-public`,
  currently on branch `feature/WS-2-3rs9lo-plan-review-trace-originating-scenario`
  with a clean tree (one untracked stale `.lease` file in this workstream's own
  folder, unrelated to this plan and left alone). Unlike the private repo
  WS-1-qrec54 and WS-3-t2lfk1 were authored against, this public repo's
  `.gitignore` does **not** ignore `flowcharge/` itself — only
  `flowcharge/index.md`, `flowcharge/kanban.md`, and `flowcharge/ids/` are
  ignored — so this plan file and the rest of this workstream's folder are
  tracked. Acceptance criterion 7 therefore names the one file this feature
  itself edits, not a claim about what git tracks overall.
- **A2.** There are no deployment or release constraints. This suite has no
  build, no runtime consumer, no live data, and no migration; `SKILL.md` is
  prose an agent reads at the start of a session, so each edit is
  independently valid text. This matches every prior SKILL.md-editing plan in
  this backlog (PLN-1-kqwu53's A2, PLN-2-25o0ic's Assumptions).
- **A3.** "The concrete scenario or failure case that motivated the plan" is
  read from the plan's own workstream record — the record named by the
  plan's frontmatter `workstream:` key — never transitively from a workstream
  it only `links:` to. `links` is defined as non-blocking (CONVENTIONS.md),
  and an unbounded walk of linked records would make rule 12 both expensive
  and undefined in depth. This plan's own workstream, WS-2-3rs9lo, links to
  WS-1-qrec54 for background only; under this rule, rule 12 would trace
  against WS-2-3rs9lo's own body, not WS-1-qrec54's. Widening the source is a
  one-line, easily reversible follow-up if the user wants it later.
- **A4.** Rule 12's trigger is unconditional on when the plan was authored: it
  applies whether create-plan and tasks-from-plan run in the same pipeline
  invocation or the plan was authored in an earlier session entirely (the
  "turn `<plan>` into tasks" canonical chain in "Parsing the request").
  The workstream record it reads persists on disk regardless of run
  boundaries, so no new state needs to be tracked to make this hold.
- **A5.** Rule 12's one-line-per-scenario trace is stated in that stage's
  report, per the file's existing "Reporting" convention that stage updates
  are visible to the user, not merely produced and discarded internally. The
  workstream record's own wording — "the orchestrator states in one line" —
  reads as an output, not an internal-only judgement.
- **A6.** Rule 12 applies forward-only, exactly as CONVENTIONS.md's own
  automatic-tag rule and WS-3-t2lfk1's branch-prefix rule are both scoped: it
  governs a tasks-from-plan spawn that happens after this change lands, and
  does not retroactively re-review a plan already tasked before rule 12
  existed.
- **A7.** An override of rule 12's halt is reported plainly, the same way a
  rule 5 dependency override is, and does not enter the "settled-decisions
  record" hard rule 10 defines — that record is specifically for a question
  rule 10's prompt-policy settling adopts on the user's behalf, and rule 12's
  halt is not routed through that mechanism (see Design).

## Design

### Where the rule lives, and why

Context's constraint is explicit: the new rule must read in "this file's
existing hard-rule voice and numbering scheme," adding or extending one of
the eleven hard rules in `## Hard rules` (lines 30-141), never renumbering
them. That settles the anchor-point question the workstream record itself
left open ("Filling a template" step, or a clause on the `create-plan`
Operations row): the canonical text is a hard rule, not a step inserted into
the six-step "Filling a template" procedure (which is a generic recipe run
for every operation's template, not a natural home for one operation's
pre-spawn gate) and not a clause folded into the `create-plan` row alone
(create-plan's own return does not know whether, or when, tasks-from-plan will
ever be spawned for that plan — it can happen in a wholly separate later run,
per assumption A4 — so the check belongs at the point control actually
reaches tasks-from-plan).

None of the eleven existing rules fits as an extension (see Alternatives), so
this plan adds a twelfth, appended after rule 11 with no renumbering.

### D1 — The new hard rule, exact text

Append to `## Hard rules`, immediately after rule 11 (which ends at line 141
in the current file, with the sentence "Check once per run: once you are off
the default branch, do not check or cut again for the rest of the run."):

> 12. **A plan is checked against its motivating scenario before tasks are
>     authored from it.** Before spawning the tasks-from-plan stage for any
>     plan, read that plan and the workstream record it belongs to (its
>     frontmatter `workstream:` key), then state, in one line per case, how
>     the plan's design handles each concrete scenario or failure case the
>     workstream record's body names as the reason the work is needed. This is
>     a trace of the plan's actual proposed text against that scenario, not a
>     restatement that the plan reads as internally consistent or that its
>     acceptance criteria are individually satisfiable, and it runs whether
>     the plan was authored earlier in this same run or in an earlier one.
>     State the trace in that stage's report. It is the orchestrator's own
>     reading, under rule 8's carve-out for reading artefact files when a
>     briefing needs facts, never a subagent's. When the workstream record
>     names no concrete scenario or failure case, say so in one line and
>     proceed. When it names one the plan's stated design does not visibly
>     handle, halt and report instead of spawning tasks-from-plan; the user
>     may override, per-run, exactly as rule 5's dependency check does. This
>     check supplements, and never replaces, a walkthrough task a task list
>     may still place against the finished file.

### D2 — The echo, in the Operations table's notes

The Operations table's notes (lines 278-323) already carry one bullet per
operation that needs a pointer beyond its table row: `{{context docs}}`, ID
slots, `execute-tasks`, `commit`, `backlog-add`, `validate`. `create-plan` and
`tasks-from-plan` currently have none. Insert a new bullet after the existing
"ID slots" bullet and before the existing "execute-tasks" bullet — the same
position in the list as the two operations' position in the pipeline:

> - **tasks-from-plan**: before spawning this stage for any plan, apply hard rule 12
>   — state in one line per case how the plan's design handles each scenario its
>   workstream record names, and halt instead of spawning if one is not visibly
>   handled.

This is the "canonical rule plus one short echo where the new rule is
actually applied" pattern PLN-1-kqwu53 used for each of its three
modifications, sized to one bullet because rule 12, unlike PLN-1-kqwu53's
Flagged tasks block, needs no second definition — it only needs a pointer at
its point of use.

### D3 — Why rule 8 is not touched

Rule 8 ("You orchestrate; subagents work") lists sanctioned inline actions,
naming rule 11's branch-cutting explicitly because cutting a branch is a git
action that would otherwise look like "a stage's work" performed inline.
Rule 12's check is different in kind: reading an already-written plan and
workstream record, then reporting a one-line trace, is reading-and-reporting,
already covered by rule 8's existing "reading artefact files when a stage's
return needs verifying or a briefing needs facts" clause without any edit.
Nothing about rule 12 authors an artefact or does a stage's work, so no carve
-out is needed and none is added.

### D4 — Why the halt is not routed through rule 10's settling machinery

Hard rule 10 and "The prompt policy" govern how a **subagent-reported** open
question is settled or relayed. Rule 12's gap is the orchestrator's own
finding, not something a subagent reported, and it is structurally the same
kind of pre-stage gate rule 5 already defines for an unmet dependency: halt,
report, user may override per-run, unaffected by the `prompts:` tier. Rule 5
is not integrated into rule 10's risk-test table either. Keeping rule 12
consistent with rule 5's existing, simpler mechanism avoids stretching a
mechanism (settled-decisions record, risk-test tiers) built for a different
kind of input, and avoids a new interaction the prompt-policy table would
otherwise need a new row to describe.

## Key flows

**Scenario named and handled** — **Actor:** the orchestrator, mid-pipeline
after a create-plan stage returns. **Preconditions:** the plan's workstream
record names at least one concrete scenario or failure case. **Main flow:**
before spawning tasks-from-plan, the orchestrator reads the plan and the
workstream record, states one line per named scenario describing how the
plan's design handles it, and includes that trace in the stage's report.
**Outcome:** tasks-from-plan is spawned as normal. **Edge cases:** a
workstream record naming several scenarios produces several one-line
statements, one per case, not one blended sentence.

**Scenario named, not visibly handled** — **Actor:** the orchestrator.
**Preconditions:** the workstream record names a scenario the plan's stated
design does not address. **Main flow:** the orchestrator states that gap in
place of a "handled" line, halts, and reports it instead of spawning
tasks-from-plan. **Outcome:** the user decides — revise the plan (a fresh
create-plan run) or override and proceed, per-run. **Edge cases:** an
override is reported plainly and does not repeat automatically on a later
run.

**No scenario named** — **Actor:** the orchestrator. **Preconditions:** the
workstream record is a plain feature request with no incident, bug, or
failure case in its body. **Main flow:** the orchestrator states that no
concrete scenario is named and proceeds. **Outcome:** tasks-from-plan is
spawned as normal, with no fabricated scenario invented to satisfy the rule.

**Plan authored in an earlier session** — **Actor:** the orchestrator, in a
fresh run whose only request is "turn `<plan>` into tasks". **Preconditions:**
the plan and its workstream record already exist on disk from an earlier
session. **Main flow:** identical to the first flow — the check reads
whatever is on disk now, regardless of which session authored it.
**Outcome:** tasks-from-plan is spawned as normal, or halts, on the same
terms as a same-run chain.

## Stages

1. **Land both edits to `skills/flowcharge/SKILL.md` together.** Insert hard
   rule 12 (Design D1) and the `tasks-from-plan` Operations-notes bullet
   (Design D2) in one pass. This is the whole feature: a two-location,
   text-only change in one file, sized for one sitting, landed together so
   the rule and its echo are never out of step with each other at any point a
   reader might see the file. Observable at the end: the file has twelve hard
   rules, unchanged except for the new twelfth, and the Operations notes carry
   the new `tasks-from-plan` bullet next to the existing `execute-tasks` one.

## Data and compatibility

- No frontmatter key is added, removed, or renamed. No status, ID type, or
  file layout changes. `fc-index.mjs` output is byte-identical after this
  work, because the generator never reads `SKILL.md`.
- No `flowcharge/agents.md` change and no new key. An existing preference
  file keeps its meaning exactly.
- **Behavioural compatibility, and the one deliberate change.** The
  orchestrator now states one line per motivating scenario before spawning
  tasks-from-plan, and can halt where it previously would have proceeded
  straight to authoring tasks. That is the point of the change, and the new
  behaviour is strictly more conservative: the failure mode becomes one extra
  round trip or one extra line in a report, never a task list authored blind
  to a scenario its plan does not visibly handle. No run that was correct
  before becomes incorrect.
- Rollback is one `git revert` of the commit. Nothing is irreversible, and the
  file stays usable at every point (the two edits are independent text
  insertions, not a multi-file coordinated rename).
- The installed skill copies keep today's text until the user syncs them,
  exactly as PLN-1-kqwu53, the prior SKILL.md-editing plan in this backlog
  that addressed the sync, accepted.

## Testing strategy

There is no code, so there are no unit or integration tests. This repo's only
tooling is `fc-index.mjs --check` and `scripts/test/run-tests.mjs`, neither of
which reads `SKILL.md`'s prose or observes a chat reply.

- **Stage 1.** Verification is textual: `grep -c "^[0-9]\{1,2\}\. \*\*"
  skills/flowcharge/SKILL.md` returns 12 (today: 11). `grep -n "checked
  against its motivating scenario" skills/flowcharge/SKILL.md` returns one
  line, inside `## Hard rules`. `grep -n "apply hard rule 12"
  skills/flowcharge/SKILL.md` returns one line, inside the Operations notes.
  Read rules 1 through 11 and confirm each is byte-identical to its
  pre-change text, confirming acceptance criterion 6.
- **Repo-wide checks.** `git status --short` shows exactly one changed file,
  `skills/flowcharge/SKILL.md`, confirming acceptance criterion 7.
  `node skills/flowcharge/scripts/fc-index.mjs --root <project-root> --check`
  exits 0 with no new warning, confirming acceptance criterion 8.
  `node skills/flowcharge/scripts/test/run-tests.mjs` is re-run as a
  regression check; its docs-consistency cases are explicitly non-hermetic
  ("an edit made anywhere under `skills/` can fail this suite" — noted in
  WS-3-t2lfk1's own testing strategy), so running it catches an unrelated
  regression even though it carries no case naming rule 12 specifically.
- **Regression risk to guard — rule 12 read as delegable.** An orchestrator
  reading rule 12 and spawning a subagent to do the trace, defeating the
  point of the fix. Design D1's own wording ("It is the orchestrator's own
  reading... never a subagent's") is the guard, and it is checked by reading
  the landed text in Stage 1's verification.
- **Regression risk to guard — a second, drifting definition of "the
  scenario."** Design D1 sources it from one place only — the plan's own
  workstream record's body — never from a linked record or an invented one.
  Assumption A3 is the guard.
- **A live pipeline run is not planned.** This is a documentation change to
  prose an agent reads, matching the reasoning every prior SKILL.md-editing
  plan in this backlog gave for the same call (PLN-1-kqwu53, PLN-2-25o0ic).

## Open questions

None. Every point Context left to this plan's own judgment — which of the two
suggested anchors to use, how a found gap is reported and overridden, where
"the scenario" is read from, whether the check repeats across sessions — has
a well-accepted default recorded above as a decision (Design) or an
assumption, and a wrong call on any of them is recoverable by a later,
narrowly-scoped follow-up edit to the same two locations, exactly as
WS-3-t2lfk1's plan reasoned for its own judgment calls.

## Adjacent opportunities

- Extend the same scenario-trace discipline to `tasks-from-issues`, the
  issue-list analogue. Not requested — Context scopes this workstream to
  plans — and an issue list's "motivating scenario" is naturally each filed
  issue's own failure scenario rather than one narrative, so the design would
  differ enough to warrant its own plan. Skip for now.
- Add a case to `skills/flowcharge/scripts/test/run-tests.mjs`'s
  docs-consistency harness for rule 12's presence. Not requested, and that
  harness is explicitly scoped to a fixed set of on-disk schema rules
  ("rules A to H") per `SKILL.md`'s own "Maintaining this skill" section —
  rule 12 is agent-followed prose with nothing on disk to check. Skip.
- Sync the changed `SKILL.md` to the installed skill directories
  (`~/.claude/skills/`, `~/.config/opencode/skills/`). Not requested; a
  separate, later act, exactly as PLN-1-kqwu53, the prior SKILL.md-editing
  plan in this backlog that addressed the sync, deferred it.

## Alternatives considered and rejected

- **A new step inside the "Filling a template" six-step procedure**, gated to
  only run when the template being filled is `tasks-from-plan`. Rejected:
  Context's constraint requires hard-rule voice and numbering, and folding an
  operation-specific gate into a generic six-step recipe run for every
  operation would make that procedure's own steps conditional on which
  operation is being filled, which none of its other five steps are.
- **A clause added only to the `create-plan` Operations row**, with no hard
  rule. Rejected: create-plan's own return has no way to know whether, or
  when, tasks-from-plan will ever run against that plan (assumption A4) — the
  check has to live at the point control actually reaches tasks-from-plan,
  which a create-plan-row clause cannot guarantee.
- **Extend hard rule 5 (dependencies)** to also cover scenario coverage.
  Rejected: rule 5 is a mechanical, frontmatter-`depends_on` check; folding a
  prose-judgment check into it would blur a rule that is otherwise
  machine-describable with one that is not.
- **Extend hard rule 10 (honour subagent returns)**. Rejected: rule 10 is
  reactive — it relays what a subagent already reported. Rule 12 is the
  orchestrator's own affirmative read, performed before any subagent for
  tasks-from-plan is even spawned, not a subagent's report being relayed.
- **Fold the check into the existing `validate-plan` subagent stage**,
  instead of the orchestrator's own reading. Rejected on the workstream
  record's own diagnosis: deferring this exact check to a subagent stage (or
  to a walkthrough task at the end of the resulting task list) is the failure
  mode being fixed, not a variant of the fix. It would also reach into
  `fc-validate`'s own content, which Context's constraint places out of
  scope.

### Final summary

One new hard rule (12) plus one short echo bullet in the Operations table's
notes, both inside `skills/flowcharge/SKILL.md`, land in a single stage. The
rule requires the orchestrator to state, in one line per case, how a plan's
design handles each concrete scenario its workstream record names, before it
spawns tasks-from-plan for that plan — halting instead, with a per-run
override, when a named scenario is not visibly handled. Top risks: rule 12
being read as delegable to a subagent, guarded by its own wording; and "the
scenario" drifting to an invented or transitively-linked source, guarded by
assumption A3. No open questions remain — every judgment call Context left
open is recorded above as a decision or an assumption, each independently
reversible by a later, narrowly-scoped edit to the same two locations.
