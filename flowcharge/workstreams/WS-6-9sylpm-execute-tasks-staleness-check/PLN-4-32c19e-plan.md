---
id: PLN-4-32c19e
type: plan
workstream: WS-6-9sylpm
slug: execute-tasks-staleness-check
title: "Staleness check before execute-tasks' first subagent spawn"
status: ready
created: 2026-09-13
updated: 2026-09-13
depends_on: []
links: []
author: Anthony Koukoullis
---

## Summary

Before the orchestrator spawns the first parent-task subagent in an execute-tasks
run, it will compare the task list's `base_commit` (or, absent that, its `updated`
date) against the current branch, and state any drift it finds as a recommendation
rather than a block. The change lands entirely in `skills/flowcharge/SKILL.md`: a
new numbered hard rule (rule 13) defines the check, one echo line in the Operations
table's `execute-tasks` note points at it, and one clause added to the "Before
execute-tasks" report bullet in "Prompts" is where the finding actually surfaces to
the user. The shape mirrors hard rule 12 (`skills/flowcharge/SKILL.md:142`), the
sibling workstream's precedent for an orchestrator-run, pre-stage check against a
source artefact.

## Scope

**In scope (acceptance criteria):**

- A task list carrying `base_commit` in its frontmatter, whose `base_commit` no
  longer matches the tip of the current branch, causes the orchestrator to name the
  commits that landed since (via their one-line subjects) and their count, before
  the first parent-task subagent of that run is spawned.
- A task list carrying no `base_commit` (a spec-mode list with no SEARCH/REPLACE
  block), whose `updated` date is not today, causes the orchestrator to compare
  that date to today and to the commits landed on the branch since that date,
  before the first parent-task subagent of that run is spawned.
- Either way, when the comparison finds nothing landed, the orchestrator says so in
  one line and the run proceeds exactly as it does today.
- Either way, when the comparison finds drift, the orchestrator states what changed
  and roughly how much, and recommends a re-validate (`fc-validate`) or a fresh
  diff-mode re-scan of the plan or issue list the task list was authored from,
  before proceeding.
- The recommendation never blocks execution on its own: the run proceeds to
  spawning the first parent task exactly as it would have without this check,
  whether or not the execute-tasks prompt itself asks the user to confirm.
- The check runs once per run, immediately before the first parent-task spawn, and
  is not repeated before later parent tasks in the same run.
- The check is the orchestrator's own reading (rule 8's carve-out for reading
  artefact files when a briefing needs facts), never delegated to a subagent.

**Out of scope:**

- Any change to `fc-validate`, `fc-task-list`, or the task-list frontmatter schema.
  The check only decides whether to recommend running one of those existing tools;
  it never redefines them.
- Any change to the prompt-policy settling table (`skills/flowcharge/SKILL.md:220`
  onward) or to hard rule 10. This finding is orchestrator-generated, not
  subagent-reported, so it does not enter that table; see Design.
- Any staleness check for `create-plan`, `create-issues`, or any stage other than
  `execute-tasks`. The workstream record scopes this to execute-tasks only.
- Any new script, generator check, or test-suite case. See Testing strategy for why
  none is owed here.

**Assumptions:**

- **The check keys off whether `base_commit` is present in the task list's
  frontmatter, not off the literal `mode` value.** `fc-task-list`'s own schema
  (`skills/fc-task-list/SKILL.md:98`) already requires `base_commit` on a spec-mode
  list that contains a SEARCH/REPLACE block, and treats that list under the same
  "Diff-mode staleness guard" as a diff-mode list. Keying the new check the same
  way is more precise than a literal mode split would be, and needs no schema
  change to make it so.
- **"State what changed" for the `base_commit` branch means printing the commit
  subjects `git log --oneline <base_commit>..HEAD` already returns**, not a deeper
  diff of file contents. The workstream record's own example names this exact
  command, and the subject lines are the cheapest available answer to "what
  changed" — no new tool or metric is invented.
- **For the no-`base_commit` branch, "roughly how much" is both the elapsed span
  (today minus `updated`) and the commit count `git log --oneline --since=<updated>`
  returns on the current branch**, not the elapsed span alone. A bare day count
  would satisfy "how much" but say nothing about "what changed"; the `--since` form
  costs nothing extra and is still one existing git command, so no new tool is
  invented either. See Alternatives for the plain-date-only option this rejects.
- **This is a documentation-only change to `skills/flowcharge/SKILL.md`.** The
  "Maintaining this skill" obligation to ship a generator check or an explicit
  "no script can check this" note (`skills/flowcharge/SKILL.md:759`) binds a new
  rule added to `CONVENTIONS.md`, not a new orchestrator hard rule in `SKILL.md`;
  hard rule 12, this feature's own named precedent, carries neither and is the
  proof this reading is already how the suite treats this kind of rule.

## Design

**Where the new rule lands.** `skills/flowcharge/SKILL.md` numbers its hard rules
1 through 12, ending at line 160 with rule 12's closing sentence, before the
"## Standing vs. one-off instructions" heading at line 162. The new rule is
inserted as **hard rule 13**, directly after rule 12 and before that heading, so it
sits with the other numbered rules rather than as a stray paragraph.

**The rule's contract** (the task list turns this into the rule's literal prose,
matching rule 12's register and sentence shape):

- **Trigger.** Before the orchestrator spawns the first parent-task subagent of an
  execute-tasks run, for the task list that stage is about to execute — whether
  that list was authored earlier in this same run or an earlier one, exactly as
  rule 12 already says of a plan's trace.
- **Reads.** The task list's frontmatter `base_commit` and `updated` keys, per
  `fc-task-list`'s schema (`skills/fc-task-list/SKILL.md:49`), and the repository's
  current `HEAD`.
- **Branch A — frontmatter carries `base_commit`.** Run
  `git log --oneline <base_commit>..HEAD`. Each returned line is one commit landed
  on the branch since the list was authored; the line count is the "roughly how
  much" figure, and the subjects are the "what changed" statement.
- **Branch B — frontmatter carries no `base_commit`.** Compare the `updated` date
  to today (`date +%F`) for the elapsed span, and run
  `git log --oneline --since=<updated>` on the current branch for the commits
  landed in that span. The elapsed span and the commit count together are "roughly
  how much"; the subjects are "what changed".
- **Zero commits either way.** State so in one line ("no commits have landed since
  <base_commit|updated>; proceeding") and proceed exactly as today. No
  recommendation is made when there is nothing to recommend against.
- **One or more commits.** State what changed (the commit subjects) and roughly how
  much (the count, plus the elapsed span for Branch B), and recommend re-validating
  (`fc-validate`, per `skills/fc-validate/SKILL.md`) or re-running the diff-mode
  scan that produced the list's own upstream plan or issue list, before proceeding.
- **Never a hard block.** This recommendation is stated content, not a halt and not
  a new prompt: it is folded into the existing, always-printed "Before
  execute-tasks" report content (see below), which already posts regardless of
  whether the execute-tasks prompt itself asks the user to confirm (`skills/
  flowcharge/SKILL.md:519`, "Prompt satisfied: post it as a statement and
  continue"). This is why the recommendation never needs new settling machinery in
  "The prompt policy": it is not gating anything for a tier to settle.
- **Scope of one check per run.** Run once, immediately before the first
  parent-task spawn; do not re-run before each subsequent parent task in the same
  execute-tasks stage. Rule 6's "strictly serial" execution already assumes earlier
  edits have landed once execution starts, so nothing later in the same run needs
  re-checking against a HEAD the run's own commits are still advancing.
- **Whose reading this is.** The orchestrator's own, under rule 8's carve-out for
  reading artefact files when a briefing needs facts — never a subagent's, exactly
  as rule 12 already states of its own trace.

**Why this is not routed through rule 10 / "The prompt policy".** That table
(`skills/flowcharge/SKILL.md:220`-`268`) governs findings a *subagent* reports back
to the orchestrator, and decides whether `assist`/`cruise` may adopt a
recommendation automatically. The staleness finding here is generated by the
orchestrator itself, from its own git comparison, exactly as rule 12's scenario
trace is the orchestrator's own reading rather than a subagent's report. Folding it
into the always-printed report content (below) already satisfies "surfaced
recommendation, never a hard block" without widening the settling table's inputs
to include orchestrator-generated findings, which this workstream's scope
statement does not ask for.

**Operations-table echo.** The `execute-tasks` row's note
(`skills/flowcharge/SKILL.md:326`-`329`) currently reads:

> **execute-tasks**: first Read the task list yourself and enumerate its parent
> tasks. Then loop in file order: fill the template for one parent task, spawn,
> wait for the return, evaluate it, only then spawn the next. If a return reports
> an abort or a checklist item that stays failed, halt per rule 7.

It gains one sentence, in the same one-line-echo shape the `tasks-from-plan` row
already uses for rule 12 (`skills/flowcharge/SKILL.md:322`-`325`): naming rule 13,
and stating that the check runs once, before the first spawn, and states its
finding rather than halting.

**Surfacing the finding.** The "Before execute-tasks" bullet in "Prompts"
(`skills/flowcharge/SKILL.md:523`-`525`) currently lists five things the report
always states: the task list path and ID, its parent-task count and scope, the
dependency check's result (rule 5), anything left open, and the resolved agent
type. It gains a sixth: the staleness check's result (rule 13). This is the one
place the finding actually reaches the user, and it reaches them whether the
execute-tasks prompt is asked as a question (`manual`) or posted as a statement
(`assist`/`cruise`), per the existing "Prompt satisfied: post it as a statement and
continue" rule that bullet already sits under.

## Stages

1. **Define the check as hard rule 13, plus its Operations-table echo.** Add the
   numbered rule after rule 12 and the echo sentence to the `execute-tasks` note,
   per the contract above. This is the riskiest slice: it fixes the exact trigger
   point, the two branch commands, and the non-blocking framing that the rest of
   the change depends on, and it is independently checkable by reading the new
   rule text and re-running the anchors it cites.
2. **Wire the finding into the always-printed pre-execute-tasks report.** Add the
   sixth clause to the "Before execute-tasks" bullet in "Prompts", pointing back at
   rule 13. This slice is small and low-risk once stage 1's contract is fixed: it
   is one clause naming where a value stage 1 already defined gets printed.

Each stage leaves `skills/flowcharge/SKILL.md` internally consistent and is
demonstrable by reading the file: after stage 1, rule 13 and its echo exist and
agree with each other; after stage 2, the "Prompts" bullet cites rule 13 by name,
closing the loop from check to surfaced report.

## Data & compatibility

No data model, schema, or file-format change. `flowcharge/agents.md`'s three keys,
task-list frontmatter, and `fc-index.mjs`'s parsing are all untouched. The change
is additive prose in one skill file; an execute-tasks run that hits it sees one
extra, non-blocking report line it did not see before. Rollback is reverting the
`SKILL.md` edit; nothing else depends on the new rule existing.

## Testing strategy

This is a hard rule added to `skills/flowcharge/SKILL.md`'s orchestrator prose, not
to `CONVENTIONS.md`, so the "ships with a generator check or an explicit no-script
note" obligation in "Maintaining this skill" does not bind it (see Scope,
Assumptions) — hard rule 12, this feature's own precedent, carries neither. There
is no script that reads this file's prose to verify against. Verification is by
inspection: grep for the new rule 13 heading and its two named git commands, and
re-read the modified sections (the new rule, its echo, and the "Prompts" bullet)
end to end to confirm the cross-references resolve and nothing above or below them
shifted meaning. No unit or integration test exists for orchestrator prose
elsewhere in this suite, so none is introduced here.

## Open questions

None. Every choice above is a reversible wording decision inside one file; nothing
here is the kind of choice a later follow-up change could not cheaply correct.

## Adjacent opportunities

- Extending the same base_commit/`updated`-versus-HEAD comparison to the
  `tasks-from-plan` and `tasks-from-issues` stages, against their own source
  artefact's `updated` date, rather than only to execute-tasks. Not requested by
  this workstream. Skip for now; the workstream record scopes this to
  execute-tasks by name.
- Teaching `fc-index.mjs --check` to flag a task list whose `base_commit` predates
  HEAD by more than some threshold, as a generator warning rather than an
  orchestrator-only check. Not requested, and it would need a new metric this
  workstream's own constraint rules out. Skip.

## Alternatives considered and rejected

- **Fold the check directly into the existing `execute-tasks` Operations-table
  note, with no new numbered hard rule.** Rejected: this feature's own precedent,
  hard rule 12, used a full hard rule plus a one-line echo for a comparably scoped
  before-stage check, and giving the check its own citable rule number (as "rule
  13") matches how "rule 5" and "rule 12" are already cited elsewhere in this file.
- **Route the drift finding through rule 10's subagent-open-question settling
  table**, so `assist`/`cruise` could auto-adopt it. Rejected: that table is
  defined for subagent-reported findings; this one is orchestrator-generated, like
  rule 12's own trace, and folding it into the always-printed report content
  already satisfies "surfaced, never a hard block" without widening the settling
  table's inputs, which is outside this workstream's stated scope.
- **For the no-`base_commit` branch, compare only the elapsed span (`updated`
  versus today), with no `git log --since`.** Rejected: it answers "how much" but
  not "what changed", and the `--since` form is still one existing git command, so
  nothing is gained by dropping it.
- **Re-run the check before every parent-task spawn, not only the first.**
  Rejected: the workstream record is explicit that the check runs "before the
  first parent-task subagent", and rule 6's strictly-serial execution already
  assumes earlier edits in the run have landed, so nothing later needs re-checking
  against a HEAD the run's own commits are still advancing.
- **Make the recommendation a hard gate requiring explicit override**, mirroring
  rule 12's own halt-and-report behaviour. Rejected outright by the workstream
  record: "This should not block execution outright... it is a surfaced
  recommendation, not a hard gate."

## Final summary

Add hard rule 13 to `skills/flowcharge/SKILL.md`, checking a task list's
`base_commit` (or, absent that, its `updated` date) against current `HEAD` once,
immediately before execute-tasks' first parent-task spawn, using two already-cheap
git comparisons named in the rule itself. Echo it in the `execute-tasks` Operations
note, and surface its finding as a sixth clause on the always-printed "Before
execute-tasks" report bullet, so it reads as a recommendation rather than a block,
consistent with rule 12's own precedent. One file changes, in two small, ordered
stages. No open questions. Top risks: getting the two git-comparison contracts
precisely stated (stage 1, the riskiest slice) and correctly excluding this finding
from rule 10's settling table so scope does not creep into the prompt-policy
mechanism.
