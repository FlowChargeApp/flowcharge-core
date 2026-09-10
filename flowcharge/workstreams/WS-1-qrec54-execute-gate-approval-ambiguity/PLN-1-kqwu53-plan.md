---
id: PLN-1-kqwu53
type: plan
workstream: WS-1-qrec54
slug: execute-gate-approval-ambiguity
title: "Stop a blanket 'go with your recommendations' reply from satisfying the execute-tasks or commit gate"
status: done
created: 2026-08-09
updated: 2026-09-10
author: Anthony Koukoullis
depends_on: []
links: []
---

# Plan — a blanket reply never satisfies a gate, a skipped gate is never a numbered item, and a flagged task gets its own home

## Summary

`skills/flowcharge/SKILL.md` lets a blanket "go with your recommendations" satisfy
the execute-tasks or commit gate. Three rules combine to allow it. Hard rule 4 asks for
"an explicit yes". The "Gates" section says to ask for that yes "as a numbered question
with a recommendation". "Talking to the user" says a numbered question with a
recommendation is always safely answered by "go with your recommendations". A reply meant
for two unrelated per-task confirmations therefore started an execution the user never
asked for.

This plan turns the three modifications the user already agreed into located, verifiable
amendments to that one file:

1. **A reply must be about the stage.** Hard rule 4 gains the test for a reply, not only
   for the original request. A blanket endorsement of a list never satisfies a gate.
2. **A gate the run was not asked to reach is never a numbered item.** "Parsing the
   request" gains the rule that such a stage is offered in prose only, with no
   recommendation, exactly as FlowCharge Core upkeep offers to archive a finished workstream.
3. **A per-task risk flag gets a defined home.** The "Gates" section gains a **Flagged
   tasks** block, listed separately from the gate's own yes-or-no, so approving the gate
   never approves a flagged task.

The chosen approach is **amend the three rules that combine, at the site each one owns,
plus one short echo where each new rule is actually applied**. This repeats the pattern
PLN-19-nnd694 named ("canonical rule plus authoring-point echoes") and PLN-20-cjvukq used (a rule
change plus two consistency sentences elsewhere in the same file).

This is a documentation change to `skills/flowcharge/SKILL.md` only. No code change.
No prompt template change. No `CONVENTIONS.md` change.

## Scope

### Acceptance criteria

**Modification 1 — a blanket reply never satisfies a gate**

1. Hard rule 4 in `skills/flowcharge/SKILL.md` states that the explicit yes it
   demands must itself be direct and determinate about that specific stage.
2. Hard rule 4 states that a blanket endorsement of the orchestrator's recommendations —
   naming "go with your recommendations" as the example — never satisfies a gate on its
   own, even when the gate appeared as one numbered item in the list the reply endorsed.
3. Hard rule 4 states the one case in which a bare "yes" does satisfy a gate: the gate
   question was the only question outstanding when the user replied (Design decision D4).
4. The "Gates" section states what the orchestrator does with a reply that settles other
   items but does not name the gated stage: apply what the reply did settle, say plainly
   that the gate is still open, ask it again on its own, and wait.
5. The "Talking to the user" bullet that promises "go with your recommendations" is
   always a complete, safe reply names the unsatisfied execute-tasks or commit gate as
   the one thing it does not answer, and points at rule 4.
6. Hard rule 4's existing text is otherwise unchanged: the `direct` and `determinate`
   definitions, the "don't ask / no gates / run straight through" waiver, and the
   `gates: skip` sentence all survive verbatim.

**Modification 2 — a gate the run was not asked to reach is offered in prose only**

7. The "Parsing the request" section states that when the requested pipeline stops before
   a gated stage, the orchestrator does not add "shall I proceed to
   execute-tasks / commit?" to the end-of-run numbered list.
8. The same text states that such a stage is mentioned in prose as an available
   follow-up, with no recommendation attached, and cites the FlowCharge Core upkeep archiving
   offer as the pattern it copies.
9. The same text states that when the user then asks for that stage, the request is a
   fresh instruction judged under hard rule 4 like any other.
10. The "Reporting" end-of-run bullet states that a gated stage the run was not asked to
    reach is never an item in its numbered list.

**Modification 3 — a per-task risk flag has a defined home**

11. The "Gates" section carries a **Flagged tasks** block, structurally separate from the
    "Before execute-tasks" bullet and adjacent to it, present in the report only when
    there is something to flag.
12. The Flagged tasks text defines what qualifies as flag-worthy by reference to hard
    rule 10's existing three-part risk test, and adds no second, competing definition.
13. The Flagged tasks text names both sources a flag may arrive from: the authoring
    stage's own return, and the orchestrator's own pre-gate read of the task list, which
    the Operations notes already require.
14. The Flagged tasks text states the per-entry content: the task's number and title, one
    plain sentence of what it changes and why it is flagged, and its own recommendation.
15. The Flagged tasks text states that each flag is an ordinary question a blanket reply
    answers, and that the gate's own "proceed?" is neither one of these entries nor
    numbered among them.
16. The Flagged tasks text states that execution does not begin until every flag raised
    for this task list has an answer, so approving the gate approves running the list and
    never a flagged task (Design decision D7).
17. The "Before commit" bullet is unchanged. The Flagged tasks block is scoped to the
    execute-tasks gate (Open question 2).

**Whole-change checks**

18. `git status --short` after the work shows exactly one changed file,
    `skills/flowcharge/SKILL.md`. WS-1-qrec54's own folder does not appear, because
    `flowcharge/` is ignored by the user's global gitignore (assumption A8).
19. `node skills/flowcharge/scripts/fc-index.mjs --root <project-root> --check`
    prints no new warning and exits 0.
20. No hard rule is renumbered, moved, or deleted. The file still has exactly eleven hard
    rules, in their present order.

### Out of scope

- Any change to a file under `skills/flowcharge/prompts/`. The templates are the
  user's own text, and all three modifications govern the orchestrator's reporting and
  gating, not a subagent's work. See Design decision D6.
- Any change to `skills/flowcharge/CONVENTIONS.md`. See Design decision D9.
- Any change to `skills/flowcharge/scripts/fc-index.mjs`. SKILL.md is prose read by
  an agent; the generator never reads it. See Design decision D10.
- Any change to `fc-git`, `fc-issue-list`, `fc-task-list`, `fc-plain-text-kanban`,
  or `fc-plan-feature`. None of them defines a gate.
- Any change to hard rule 10 and the `open_questions` preference. See Open question 1.
- Any new `agents.md` key. The three modifications tighten default behaviour; none of
  them is a project preference.
- Any change to the `gates: skip` waiver or to the "don't ask / no gates" waiver. A
  project that waived its gates keeps that waiver, unchanged.
- Adding a per-task risk field to the task-list schema. Modification 3 asks for a place in
  the gate **report**, not a new data key. See Design decision D6.
- Copying the changed file to the installed skill directories (`~/.claude/skills/`,
  `~/.config/opencode/skills/`). That sync is a separate, later act, exactly as PLN-19-nnd694 and
  PLN-20-cjvukq scoped it.

### Assumptions

- **A1.** The target repository is `/Users/akoukoullis/Work/AK/FlowCharge Core`, currently on
  branch `master` with a clean tree. The canonical file is
  `skills/flowcharge/SKILL.md`, 471 lines at the time of writing. The copies under
  `~/.claude/skills/` and `~/.config/opencode/skills/` are separate directories, not
  symbolic links, so they stay stale until a later sync.
- **A2.** There are no deployment or release constraints. The suite has no build, no
  runtime consumer, no live data, and no migration. Each stage's edit is independently
  valid prose, so the file stays usable between stages. This matches PLN-19-nnd694's A3 and
  PLN-20-cjvukq's A2, both of which the user confirmed.
- **A3.** The three modifications quoted in `workstream.md` are settled requirements.
  This plan locates and words them. It does not reopen them.
- **A4.** "Talking to the user" is in scope for modification 1. The workstream record
  names it as the third of the three rules that combine to produce the defect, so leaving
  it unamended would leave the file directly self-contradictory. This assumption is what
  puts Stage 3 in scope. It touches no file outside SKILL.md.
- **A5.** A per-task risk flag has a source today, without any template change. The
  tasking templates' Return section already asks for "any item left for you to decide"
  (`prompts/tasks-from-plan-spec.md` line 42, and the same line in its three siblings),
  and the Operations notes already require the orchestrator to read the task list itself
  before the execute-tasks loop. Modification 3 gives what already arrives a place to
  land. This assumption is what keeps the prompts out of scope.
- **A6.** The new text follows SKILL.md's existing voice and structure. No section is
  moved, renamed, or reorganised, and no hard rule number changes.
- **A7.** The two cases modification 1 and modification 2 cover are distinct and both
  real. Modification 1 governs a run that reached a gated stage the user asked for.
  Modification 2 governs a run that stopped before a gated stage the user never asked
  for. The observed failure in the other project was the second case; the first case is
  reachable in any run and is fixed by the same plan.
- **A8.** `flowcharge/` is ignored by the user's global gitignore
  (`git check-ignore -v` resolves it to `~/.gitignore_global` line 48), so this plan file
  and every other FlowCharge Core artefact are untracked. The scope check in acceptance criterion
  18 therefore expects exactly one changed file, not two paths. PLN-19-nnd694 and PLN-20-cjvukq both
  worded that criterion as if the workstream folder were tracked; this plan corrects the
  wording rather than repeating it.

## Design

### D1 — The three current sites, quoted

`skills/flowcharge/SKILL.md`, hard rule 4, lines 46-56. The load-bearing sentence is
line 51:

> Otherwise: report and wait for an explicit yes.

The "Gates" section, lines 349-362. Its opening paragraph, lines 351-353:

> Same report content either way, formatted per "Talking to the user". Gate satisfied
> (rule 4): post it as a statement and continue. Not satisfied: post it, then ask
> "proceed?" as a numbered question with a recommendation, and wait.

The "Talking to the user" section, lines 341-342:

> - **Every question carries a recommendation** with a one-line reason. "Go with your
>   recommendations" must always be a complete, safe reply.

Read together, these three make a blanket reply a correct answer to a gate. The rest of
this Design section closes each leg.

### D2 — The reply is judged, not only the request

Hard rule 4's `direct` and `determinate` test is written for the user's **instruction**
in the original request: is this stage the point of the message, and did the object it
acts on already exist? It is a good test, and the fix is to say plainly that it applies
to the reply at a gate as well, not only to the request that opened the run.

That is the smallest possible change that removes the ambiguity, and it invents no new
vocabulary: `direct` and `determinate` are already defined two sentences earlier.

Insert after "Otherwise: report and wait for an explicit yes." on line 51:

> That yes must itself be direct and determinate about this stage — the same two tests,
> applied to the reply. Direct: this stage is what the reply is about. Determinate: the
> reply names execution or commit, or is the unmistakable answer to a gate question that
> was the only thing outstanding. A blanket endorsement of your recommendations — "go
> with your recommendations", "yes to all", "do what you think best" — never satisfies a
> gate on its own, however many numbered items it resolves, and even when the gate was
> one of them.

The rule's remaining sentences, from "An explicit \"don't ask / no gates / run straight
through\"…" to the end, are untouched.

### D3 — The operational half, in "Gates"

Rule 4 says what a reply means. The "Gates" section says what to do about it. Without the
second half, an orchestrator that correctly judges the reply insufficient has no stated
next move, and the likely improvisation is to ask again inside a fresh mixed list — the
same trap.

Append to the "Gates" section's closing paragraph, after line 362:

> A reply that settles other items but does not name this stage leaves the gate
> unsatisfied (rule 4). Apply whatever else the reply settled, say plainly that the gate
> is still open, then ask it again on its own — the gate question and nothing else — and
> wait.

"On its own" is the operative phrase. Asking again inside a mixed list would reproduce
the ambiguity the run just survived.

### D4 — When a bare "yes" is enough

A rule that only forbids things would push an orchestrator into refusing a plainly
intended approval, which is its own failure. So the rule states the sufficient case as
well as the insufficient one.

A bare "yes", "go", "proceed", or "do it" satisfies the gate when the gate question was
the only question outstanding at the moment the user replied. Then the reply is
determinate by elimination: there is exactly one thing it can be about. When other
numbered questions were outstanding too, a bare "yes" is not determinate, and the reply
must name execution or commit.

This is a design call made here, not an open question. The alternative — always require
the literal words "execute" or "commit" — was rejected because it would reject "yes" in
answer to a question the orchestrator itself just asked alone, which no user would read
as ambiguous. D3's "ask it again on its own" is what makes this case common rather than
rare: after a re-ask, the gate is the only thing outstanding by construction.

### D5 — Modification 2: prose, not a numbered item

The pattern already exists in this file. `skills/flowcharge/SKILL.md` lines 408-411,
in "FlowCharge Core upkeep → Successful end of run":

> Do NOT archive a workstream you just completed — archiving (moving its folder to
> `flowcharge/archive/`) happens only on the user's say-so, per CONVENTIONS.md; you may
> mention it as an available follow-up in your summary.

Archiving is available, is mentioned, and is never a numbered recommendation-bearing
item. A gated stage the run was not asked to reach needs exactly that treatment, and the
new text says so by name so a reader can see the two are deliberately the same shape.

**Home: "Parsing the request", not "Gates".** The rule is about what the run does with a
stage it was never asked to run, and "Parsing the request" already owns that subject in
its first rule of interpretation, lines 263-265:

> - Only what the user asked for: "bug hunt X and file the issues" ends at create-issues
>   — do not continue to tasks because the chain usually does.

That bullet says the run stops. It says nothing about how to talk about the stage it
stopped short of. The new text completes it, at the site that already carries half the
rule. "Gates" was the alternative home and is rejected: the Gates section is about a gate
the run reached, and this rule is about one it did not.

Append to that bullet:

> When the stage the run stopped short of is a gated one — execute-tasks or commit — do
> not put "shall I proceed to it?" into the end-of-run numbered list, and attach no
> recommendation to it. Mention it in prose as an available follow-up, the same way
> FlowCharge Core upkeep offers to archive a finished workstream, so a blanket reply can never
> sweep it up. If the user then asks for it, that request is a fresh instruction, judged
> under rule 4 like any other.

The last sentence matters: without it, an orchestrator could read the follow-up mention
as pre-authorising the stage once the user says anything at all about it.

### D6 — Modification 3: where a per-task risk flag lives

**What the gate report already requires.** `skills/flowcharge/SKILL.md` lines
355-357:

> - **Before execute-tasks**: the task list path and ID, its parent-task count and
>   one-line scope, the dependency check's result (rule 5), anything the authoring stage
>   skipped or left open, and the resolved agent type.

That is one flat, undifferentiated sentence of report contents. A per-task risk flag is
none of the five things it lists. It is not "skipped" and not "left open": the task will
be authored, and it will run. It is a task that will do something the user should
knowingly accept. So it has no home, and the observed failure is exactly what an
orchestrator does with a homeless item — it improvises one, and blends it with the gate.

**The options weighed.**

| Option | What it is | Verdict |
|---|---|---|
| (a) Sixth item in the existing sentence | "…, any risk the authoring stage flagged, and the resolved agent type." | **Rejected.** Cheapest, and wrong. It puts the flag in the same undifferentiated blob as the gate's own content, which is the failure being fixed. Nothing in the rendered report would make the flag's answer distinct from the gate's. |
| (b) A separate, adjacent bullet in "Gates" | A **Flagged tasks** bullet sitting between "Before execute-tasks" and "Before commit". | **Chosen.** |
| (c) A new top-level SKILL.md section | "## Per-task risk flags", with its own rules. | **Rejected.** Over-built for one report block, and it separates the gate report's definition from part of the gate report. A reader of "Gates" would not find it. |
| (d) A new key in the task-list schema | e.g. `risk:` on a task, defined in `fc-task-list/SKILL.md`. | **Rejected.** Out of scope by Context, and wrong in kind: the modification asks for a place in the **report**, not a new field in the data model. It would also touch a second skill and a prompt template to make anything write the key. |

**Why (b).** The separation the modification demands is a separation in the rendered
report. Making the file's own structure carry that separation — a distinct, labelled
bullet rather than a clause inside the gate's bullet — is the cheapest way to make an
orchestrator reproduce it, because the report mirrors the shape of the thing that
specifies it. It also keeps the flag adjacent to the gate it belongs to, which (c) does
not.

**What qualifies as flag-worthy: reuse rule 10's risk test.** Hard rule 10 already
carries a three-part test, landed by PLN-20-cjvukq: (a) possibly catastrophic; (b) a noticeable
and unavoidable effect on the codebase that no later reader or caller can opt out of —
naming a public interface, a stored format, a default value, the dependency set, or the
build, test, or release path; (c) it forces changes the request did not name. The user's
own two examples — a breaking API rename and a logging behaviour change — are (b). Writing
a second definition here would create two tests in one file that must then be kept in
step. The Flagged tasks text therefore cites rule 10's test rather than restating it.

**Where a flag comes from, with no template change.** Two sources, both existing:

- The authoring stage's return. The four tasking templates' Return sections already ask
  for "any item left for you to decide" (`prompts/tasks-from-plan-spec.md` line 42, and
  the same line in `tasks-from-plan-diff.md`, `tasks-from-issues-spec.md`, and
  `tasks-from-issues-diff.md`). That is the channel the observed flags arrived through.
- The orchestrator's own pre-gate read. The Operations note on execute-tasks, line 235,
  already says "first Read the task list yourself and enumerate its parent tasks".
  Noticing a flag-worthy task while doing a read the rule already mandates is reporting,
  not doing a stage's work inline, so it stays inside hard rule 8.

Neither source needs a word added to any prompt file.

### D7 — Keeping the gate's answer and a flag's answer distinct

The requirement is that approving the gate never silently approves a flagged task. Three
properties deliver it.

1. **Different question types.** Each flag is an ordinary question with a recommendation,
   per "Talking to the user" — a blanket "go with your recommendations" answers it, which
   is precisely what the user in the observed failure intended. The gate's "proceed?" is
   not: rule 4, as amended by D2, requires a reply that names the stage. So one reply
   cannot accidentally do both jobs, because the two need different replies.
2. **Different places in the report.** The flags are numbered entries under their own
   **Flagged tasks** label. The gate's "proceed?" is not one of them and is never
   numbered among them.
3. **An ordering rule.** Execution does not begin until every flag raised for this task
   list has an answer. Approving the gate approves running the list; it never approves a
   flagged task.

Property 3 is a derivation, not an addition. Without it, a satisfied gate with an
unanswered flag would run the flagged task on the gate's approval alone — the exact thing
the modification forbids. Its cost in the normal case is zero, because a single blanket
reply answers every flag at once.

The rejected alternative was to start executing and hold only the flagged task until it
is answered. Hard rule 6 makes execution strictly serial, in file order, because later
work assumes earlier edits landed. Skipping a mid-list task and returning to it breaks
that assumption, so the run waits instead.

### D8 — The wording for the Flagged tasks block

Insert into the "Gates" section, between the "Before execute-tasks" bullet and the
"Before commit" bullet:

> - **Flagged tasks (execute-tasks gate only, and only when there is something to
>   flag)**: a separately labelled block, after the gate's own content. One numbered
>   entry per task whose change is risky by rule 10's test — possibly catastrophic, an
>   unavoidable effect no later caller can opt out of, or something significant forced
>   elsewhere. A flag reaches you either in the authoring stage's return or from your own
>   pre-gate read of the task list. Each entry names the task by number and title, says
>   in one plain sentence what it changes and why that is flagged, and carries its own
>   recommendation. These are ordinary questions: a blanket reply answers them. The
>   gate's own "proceed?" is neither one of these entries nor numbered among them, and no
>   reply to them satisfies it (rule 4). Do not begin execution until every flag raised
>   for this task list has an answer — approving the gate approves running the list, never
>   a flagged task.

The task author may adjust wording to fit the file, but must keep acceptance criteria 11
to 17 satisfied.

### D9 — Why CONVENTIONS.md is untouched

`CONVENTIONS.md` is the data model: layout, IDs, frontmatter, status lifecycle, index and
board generation. It defines no gate, mentions neither execute-tasks nor commit as gated
stages, and describes no report format. All three modifications are orchestrator
behaviour, which SKILL.md alone governs. Adding gate rules there would start a second
home for text that must then be kept in step, for no reader's benefit. This matches
PLN-20-cjvukq's D8.

### D10 — Why there is no code change

`fc-index.mjs` scans `flowcharge/` frontmatter. It never reads SKILL.md and never observes a
gate. There is nothing for it to validate and nothing for it to enforce, because SKILL.md
is prose read by an agent, not a parsed configuration. The plan therefore adds no code.
This is a deliberate call, matching PLN-19-nnd694's rejected validator and PLN-20-cjvukq's D9.

### D11 — Sites checked and left alone

- The `README.md` gate summary, lines 128-132 (the "explicit yes" phrase is on line 129):
  "Two stages are always gated — **execute**
  and **commit**. The orchestrator stops, shows you numbered specifics, and waits for an
  explicit yes." This stays true after all three modifications, so it needs no edit. It
  states no rule about what reply counts, so it goes out of step with nothing. Stage 7
  re-checks this by reading, and it is the one site where a later decision to edit would
  be defensible; the plan does not take it.
- The "Reporting" per-stage bullet, line 452, reports what a subagent flagged at each
  stage. It is not the gate report, and modification 3 changes nothing about it.
- `skills/fc-plan-feature/SKILL.md` and the three schema skills define no gate and read
  no reply. They stay untouched.

## Staged task breakdown

Stages 1 to 3 land modification 1. Stages 4 and 5 land modification 2. Stage 6 lands
modification 3. Stages 7 and 8 verify. The stages are ordered so the file is coherent
after each one: the rule lands before the text that points at it.

### Stage 1 — Hard rule 4: the reply is judged too

- **What to build.** Insert the paragraph from Design decision D2 into hard rule 4,
  immediately after the sentence "Otherwise: report and wait for an explicit yes." on
  line 51. Change nothing else in the rule.
- **Files.** `skills/flowcharge/SKILL.md`.
- **Effort.** Small.
- **Depends on.** Nothing.
- **Verify.** `grep -n "never satisfies a gate on its own" skills/flowcharge/SKILL.md`
  returns one line inside hard rule 4.
  `grep -c "don't ask / no gates / run straight through" skills/flowcharge/SKILL.md`
  still returns 1. Read rule 4 and confirm acceptance criteria 1, 2, 3 and 6. Confirm
  rules 3 and 5 are unchanged and that no rule number moved.

### Stage 2 — "Gates": what to do with a non-satisfying reply

- **What to build.** Append the paragraph from Design decision D3 to the "Gates" section,
  after the existing closing paragraph at lines 361-362.
- **Files.** `skills/flowcharge/SKILL.md`.
- **Effort.** Small.
- **Depends on.** Stage 1, so the appended text points at a rule that already says it.
- **Verify.** `grep -n "ask it again on its own" skills/flowcharge/SKILL.md` returns
  one line inside "Gates". Confirm the section's opening paragraph, the "Before
  execute-tasks" bullet, the "Before commit" bullet, and the "A \"no\" or a revision
  request at a gate" sentence are all still present and otherwise unchanged. Confirm
  acceptance criterion 4.

### Stage 3 — "Talking to the user": remove the contradiction

- **What to build.** Amend the "Every question carries a recommendation" bullet at lines
  341-342 so its promise is scoped. The blanket reply stays a complete, safe answer to the
  questions in a numbered list, and the bullet names the unsatisfied execute-tasks or
  commit gate as the one thing it never answers, pointing at rule 4. Do not delete the
  existing promise; it is correct for every other question, and modification 3 depends on
  it staying true.
- **Files.** `skills/flowcharge/SKILL.md`.
- **Effort.** Small.
- **Depends on.** Stage 1. Rests on assumption A4.
- **Verify.** `grep -n "complete, safe reply" skills/flowcharge/SKILL.md` returns one
  line, and the sentence around it now names the gate exception. Confirm the other three
  bullets in "Talking to the user" are unchanged. Confirm acceptance criterion 5.

### Stage 4 — "Parsing the request": prose, not a numbered item

- **What to build.** Append the paragraph from Design decision D5 to the first rule of
  interpretation, "Only what the user asked for…", at lines 263-265.
- **Files.** `skills/flowcharge/SKILL.md`.
- **Effort.** Small.
- **Depends on.** Nothing. It is independent of Stages 1 to 3 and may run in either order,
  but it is placed after them so the whole of modification 1 lands first.
- **Verify.** `grep -n "available follow-up" skills/flowcharge/SKILL.md` returns two
  lines: the existing archiving offer in "FlowCharge Core upkeep" and the new one in "Parsing the
  request". `grep -n "attach no recommendation" skills/flowcharge/SKILL.md` returns
  one line. Confirm the other three rules of interpretation and the canonical-chain list
  above them are unchanged. Confirm acceptance criteria 7, 8 and 9.

### Stage 5 — "Reporting": echo the exclusion in the end-of-run list

- **What to build.** Add one clause to the end-of-run bullet at lines 455-458, stating
  that a gated stage the run was not asked to reach is never an item in that numbered
  list, and pointing at "Parsing the request". Leave the existing sentence's "1 yes, 2 no"
  and "go with your recommendations" wording intact — after Stage 4 it is true again,
  because the list can no longer contain a gate.
- **Files.** `skills/flowcharge/SKILL.md`.
- **Effort.** Small.
- **Depends on.** Stage 4, so the echo points at the rule.
- **Verify.** `grep -n "never an item in this list" skills/flowcharge/SKILL.md`
  returns one line inside "Reporting". Confirm the second numbered list added by PLN-20-cjvukq,
  for questions settled under `open_questions`, is unchanged. Confirm acceptance
  criterion 10.

### Stage 6 — "Gates": the Flagged tasks block

- **What to build.** Insert the bullet from Design decision D8 into the "Gates" section,
  between the "Before execute-tasks" bullet and the "Before commit" bullet. Do not alter
  either neighbouring bullet.
- **Files.** `skills/flowcharge/SKILL.md`.
- **Effort.** Medium. It is the largest single text block in the plan, and acceptance
  criteria 11 to 17 all land here.
- **Depends on.** Stages 1 and 3, because the block's separation argument rests on rule 4
  rejecting a blanket reply and on "Talking to the user" still accepting one for ordinary
  questions.
- **Verify.** `grep -n "Flagged tasks" skills/flowcharge/SKILL.md` returns one line,
  inside "Gates", between the two existing gate bullets.
  `grep -n "rule 10's test" skills/flowcharge/SKILL.md` returns one line, confirming
  the risk definition is cited and not restated.
  `grep -n "Do not begin execution until every flag" skills/flowcharge/SKILL.md`
  returns one line. Read the "Before commit" bullet and confirm it is byte-identical to
  its pre-change text. Confirm acceptance criteria 11 to 17.

### Stage 7 — Repeat sweep and scope check

- **What to build.** Nothing. This stage proves the six edits are complete and the scope
  limit held.
- **Files.** None modified.
- **Effort.** Small.
- **Depends on.** Stages 1 to 6.
- **Verify.**
  - `grep -rn "go with your recommendations" skills/ README.md` — every hit either carries
    the new gate carve-out or is in a context where no gate can appear.
  - `grep -rn "explicit yes" skills/ README.md` — the `README.md` hit at line 129 is read
    and confirmed still true (Design decision D11); no other file states a conflicting
    rule.
  - `grep -c "^[0-9]\{1,2\}\. \*\*" skills/flowcharge/SKILL.md` — the hard-rule count
    is unchanged at eleven, confirming acceptance criterion 20.
  - `grep -rn "numbered question with a recommendation" skills/` — the "Gates" opening
    paragraph is the only hit, and it no longer contradicts rule 4.
  - `git diff --stat` — one file changed.
  - `git status --short` — `skills/flowcharge/SKILL.md` is the only entry,
    confirming acceptance criterion 18. No file under `skills/flowcharge/prompts/`,
    no `CONVENTIONS.md`, no `fc-index.mjs`, no `README.md`.
  - `node skills/flowcharge/scripts/fc-index.mjs --root <project-root> --check` —
    exits 0 with no new warning, confirming acceptance criterion 19.

### Stage 8 — Behaviour walkthrough

- **What to build.** Nothing. This stage reads the finished SKILL.md and checks the
  behaviour it now describes against seven cases. Each case is answered from the text
  alone, not from a live run.
- **Files.** None modified.
- **Effort.** Small.
- **Depends on.** Stages 1 to 6.
- **Verify.**
  - **Case 1 — the observed failure, replayed.** Requested pipeline is
    investigate → issues → spec tasks. Two tasks are flagged. The text must give: the
    gate is not offered as a numbered item at all; execution is mentioned in prose as an
    available follow-up with no recommendation; the two flags are numbered under **Flagged
    tasks**; "go with your recommendations" answers both flags and starts nothing.
  - **Case 2 — the same run, then "yes, execute it".** The text must give: this is a fresh
    instruction, judged under rule 4; it is direct and determinate; the run proceeds.
  - **Case 3 — a run that asked for execution, gate unsatisfied, other questions
    outstanding.** The user replies "go with your recommendations". The text must give:
    the other questions are settled, the gate is stated as still open, and it is asked
    again on its own.
  - **Case 4 — the same run, after the re-ask, user replies "yes".** The gate is now the
    only question outstanding. The text must give: satisfied, per Design decision D4.
  - **Case 5 — a gate satisfied while a flag is unanswered.** The text must give:
    execution does not begin; the flag is asked and answered first.
  - **Case 6 — a run with no flagged tasks.** The text must give: no **Flagged tasks**
    block appears at all, and the gate report is exactly what it is today.
  - **Case 7 — a project with `gates: skip` in `flowcharge/agents.md`.** The text must
    give: both gates stay waived, unchanged by this work. The Flagged tasks block still
    appears when there is something to flag, because a waived gate is not a waived flag.

## Data and compatibility

- No data model change. No frontmatter key is added, removed, or renamed. No status,
  ID type, or file layout changes.
- `fc-index.mjs` output is byte-identical after this work. The generator never reads
  SKILL.md.
- No `agents.md` change. An existing preference file keeps its meaning exactly. A
  project set to `gates: skip` keeps both gates waived, and a project set to
  `open_questions: auto` or `yolo` keeps that behaviour, per Open question 1.
- **Behavioural compatibility, and the one deliberate break.** Modifications 1 and 2
  make the orchestrator ask where it previously might have proceeded. That is the point
  of the change, and the new behaviour is strictly more conservative: the failure mode
  becomes one extra round trip, never an unasked-for execution. No run that was correct
  before becomes incorrect.
- Modification 3 adds report content only when there is something to flag, so a run with
  no flagged tasks produces a report identical to today's.
- Rollback is one `git revert` of the documentation commit. Nothing is irreversible at any
  stage, and no stage leaves the file in an unusable state.
- The installed skill copies keep the old text until the user syncs them. Until then, a
  run driven by an installed copy keeps today's ambiguous behaviour. That gap is accepted
  and the sync is out of scope, exactly as in PLN-19-nnd694 and PLN-20-cjvukq.

## Testing strategy

There is no code, so there are no unit or integration tests to write. This repo has no
lint, type-check, or test tooling; every verify step is a `grep`, a file read, a `git`
inspection, or the generator's own `--check` mode.

- **Stages 1 to 6.** Verification is textual: the grep assertion named in each stage, plus
  a read of the surrounding section to confirm nothing else moved.
- **Stage 7.** Verification is the repeat sweep, the hard-rule count, the
  `git status --short` scope check, and the generator's `--check` run, which writes
  nothing.
- **Stage 8.** Verification is the seven-case walkthrough, read against the finished text.
  It is a review of the rules as written, not a live pipeline run.
- **Regression risk to guard, 1 — a surviving contradiction.** Rule 4 forbidding a blanket
  reply while "Talking to the user" still promises it always works. Stage 3 is the fix and
  Stage 7's first grep is the guard.
- **Regression risk to guard, 2 — over-reading modification 1.** An orchestrator refusing
  a plain "yes" that answers a gate question asked alone. Design decision D4 is the
  wording guard and Stage 8 case 4 is the check.
- **Regression risk to guard, 3 — two competing risk definitions.** A fresh definition of
  "risky" in the Flagged tasks block, diverging from hard rule 10's. Design decision D6 is
  the wording guard and Stage 6's second grep is the check.
- **Regression risk to guard, 4 — the waivers.** `gates: skip` and the "don't ask / no
  gates" waiver must survive untouched. Stage 1's second grep and Stage 8 case 7 are the
  guards.
- **A live pipeline run is not planned.** All three modifications are text in existing
  mechanisms, so the document review in Stage 8 is proportionate. This matches PLN-20-cjvukq's
  reasoning.

## Open questions

1. **Should hard rule 10 be amended to say a per-task risk flag is not an open question?**
   Hard rule 10's `open_questions: auto | yolo` exception settles a subagent's
   recommendation-bearing open question without asking the user. A flagged task is
   recommendation-bearing, so a project on `auto` could arguably settle it.
   **Recommendation: leave rule 10 alone.** A flag is flag-worthy precisely because it
   trips rule 10's own risk test, so under `auto` it already relays unsettled, and under
   `yolo` it is already adopted and marked risky in both reports. The existing machinery
   therefore gives a coherent answer without a word of change, and amending rule 10 would
   be a fourth modification nobody agreed. If the user disagrees, it is one sentence added
   to rule 10's enumeration and it changes no stage in this plan. **This question gates
   nothing.**
2. **Should the Flagged tasks block also appear in the commit gate report?** The agreed
   modification names the execute-tasks gate only, and this plan follows it.
   **Recommendation: no.** The commit stage has no per-task granularity — it commits work
   already applied — so a per-task flag has nothing to attach to there, and anything
   worth flagging was already flagged before execution. **This question gates nothing.**
3. **Should `README.md` line 129's one-line gate summary gain the new rule?** It currently
   says the orchestrator "waits for an explicit yes", which stays true but no longer says
   the whole truth. **Recommendation: leave it.** The README is a summary that points at
   the skills for detail, this plan's scope is SKILL.md, and adding the rule there starts
   a second place to keep in step. If the user wants it, it is one clause in a file this
   plan otherwise never opens, and it would need acceptance criterion 18 widened by one
   file. **This question gates nothing.**

Questions the plan would have put to the user, had one been available, and the reading
taken instead:

4. **Does "go with your recommendations" need to fail the gate even when the gate is the
   only numbered item in the list?** Reading taken: no — that case is Design decision D4's
   sufficient case, and treating it as a failure would make the orchestrator refuse an
   approval no user would call ambiguous. Recorded here because the agreed wording of
   modification 1 does not name this case either way.
5. **Are there deployment or release constraints?** Reading taken: none, per assumption
   A2. PLN-19-nnd694 and PLN-20-cjvukq both took this reading and the user confirmed it for PLN-20-cjvukq.

## Alternatives considered and rejected

- **Put modification 1 in "Gates" instead of hard rule 4.** Rejected. The hard rules are
  the file's normative core and are cross-referenced by number throughout. The definition
  of what satisfies a gate belongs where the gate is defined; "Gates" gets the procedure,
  which is Stage 2.
- **Delete the "go with your recommendations" promise from "Talking to the user"
  entirely.** Rejected. The promise is correct and valuable for every ordinary question,
  and modification 3 actively depends on it staying true — a flagged task is meant to be
  answerable by a blanket reply. Scoping it is right; deleting it is not.
- **Stop asking gates as numbered questions altogether, and use a distinct format.**
  Rejected. It would rewrite the "Gates" section's format rule to fix a problem that a
  sentence in rule 4 already fixes, and "Talking to the user" says numbered items are for
  questions, so an unnumbered question would break a different rule.
- **A new hard rule 12 for the reply test.** Rejected, on PLN-20-cjvukq's own reasoning: the
  behaviour is a clarification of rule 4, not a separate obligation, and a reader of rule
  4 would not find it.
- **Suppress the follow-up mention entirely (modification 2's stronger form) — never
  mention a gated stage the run did not reach.** Rejected. The agreed wording says
  "offered only as a follow-up mention in prose", not "never mentioned". Silence would
  also hide a useful next step from a user who does not know the pipeline's shape.
- **Modification 3 as a sixth item in the existing "Before execute-tasks" sentence.**
  Rejected, per Design decision D6 option (a). It reproduces the blending that caused the
  failure.
- **Modification 3 as a new top-level SKILL.md section.** Rejected, per Design decision D6
  option (c). Over-built, and it moves part of the gate report away from the gate.
- **Modification 3 as a `risk:` key in the task-list schema.** Rejected, per Design
  decision D6 option (d). It is a data-model change where a report change was asked for,
  and it would drag `fc-task-list/SKILL.md` and the tasking templates into scope.
- **A fresh definition of "risky" inside the Flagged tasks block.** Rejected. Hard rule 10
  already carries a three-part test the user wrote and approved in WS-27-9kwnun. Two definitions
  in one file would drift.
- **Changing the tasking prompt templates to emit an explicit risk flag.** Rejected. The
  templates are the user's own text and are out of scope by Context. Assumption A5 shows
  a flag already has two channels to reach the orchestrator without any template change.
- **Adding a validator to `fc-index.mjs`.** Rejected, per Design decision D10. The
  generator does not read SKILL.md, and there is nothing about a chat reply it could
  check.

## Final summary

The approach is three amendments at the three rules that combine to cause the defect, each
with one short echo where the new rule is actually applied — all inside
`skills/flowcharge/SKILL.md`.

- Eight stages. Six are text edits, five of them small and one medium; two are
  verification. Total effort is small.
- Only `skills/flowcharge/SKILL.md` is edited. No code, no prompt template, no
  `CONVENTIONS.md`, no `README.md`.
- Top risks: a surviving contradiction in "Talking to the user", guarded by Stage 3 and
  Stage 7's first grep; the new rule being over-read so a plain "yes" is refused, guarded
  by Design decision D4 and Stage 8 case 4; a second definition of "risky" drifting from
  hard rule 10's, guarded by Design decision D6 and Stage 6's second grep; and the
  installed skill copies staying stale until a separate sync.
- Needs the user's answer: Open questions 1, 2 and 3, none of which gates a stage. Each
  carries a recommendation, so a blanket reply is a complete answer to all three.
