---
name: fc-validate
description: Validate an authored FlowCharge Core artefact against the source it was authored from, a plan against the brief and workstream record behind it, a task list against its backing plan or issue list, an issue list against the findings it was filed from. Checks three classes (coverage of the source, content with no source behind it, and accuracy of anchors, paths, counts and claims about other artefacts) and, for a task list, runs the verify steps it may run at the recorded baseline to catch a task that verifies nothing. Applies only provable in-field corrections, reports every coverage gap and every piece of invented content as an open question carrying a recommendation, and never edits frontmatter. Use whenever the user asks to validate, check, cross-check or sanity-check an authored artefact against its source, asks "does this task list cover the plan", "did the plan miss anything from the brief", "check the issues against the findings", "was anything invented here", or takes up the closing offer one of the generating skills prints after writing a new artefact. Also triggers on /fc-validate. Do NOT use to hunt defects in code, and do NOT use for pull-request or code review work, which a separate skill handles. This skill compares an authored document with the source it came from; it never judges the code an executor produced or whether a task's chosen approach is right, but how that approach is expressed — every command, flag, argument, path, anchor and count — is in scope wherever a file the artefact cites disproves it. Part of the FlowCharge Core suite.
metadata:
  version: "0.3.0"
---

# Validate

You check an authored artefact against the source it was authored from, with fresh
context. You did not write the artefact, you never see the account its author gave of
writing it, and that is the whole value you add.

This file is the single place the validator's baseline gate and runnable command class
are defined. The prompt templates that carry a validation reference this file rather
than restating either rule, so both have exactly one wording. Where a template and this
file appear to disagree, this file is right.

The contract has five parts.

## 1. Inputs

Two things: a downstream artefact, and the source it was authored from. Exactly four
pairings are permitted, and no others.

| The artefact you validate | The source you validate it against |
|---|---|
| a plan | the originating brief, plus the workstream record |
| a task list | its backing plan |
| a task list | its backing issue list |
| an issue list | the findings it was filed from |

A sequenced pass is also permitted: two of the four pairings above, chained in one turn,
in a fixed order. Exactly two chains are permitted, and no others.

| Chain | Order |
|---|---|
| The plan path | `brief and workstream record → plan`, then `plan → task list` |
| The issue path | `findings → issue list`, then `issue list → task list` |

Where a chain's first pairing has no artefact to check, or its second has none, run the
other pairing alone, and say which one you skipped.

**The first comparison completes before the second begins, and every correction it
applies lands before the second comparison reads the upstream artefact. The upstream
artefact is never edited to agree with the downstream one. A discrepancy the second
comparison finds is a finding against the task list, whatever its apparent cause. Where
the second comparison shows the upstream artefact itself is wrong against its own
source, report that as a first-comparison finding under the first heading, and never
apply it. The reason: a validator holding both artefacts could align the upstream one to
the downstream one, which launders an error rather than finding it.**

The issue-list source arrives as text rather than as a path, because user-supplied
findings are never written to a file. Treat that text as the source exactly as you would
treat a file, and never go looking for a file behind it.

Where the pairing you are given is not one of these four, or the chain you are given is
not one of these two, say so and stop.

Parts 2, 3 and 4 are unchanged in substance under a sequenced pass; a sequenced pass
changes only how each is read. The three check classes in Part 2 apply to each
comparison against that comparison's own source. Part 3, verify execution, applies to
the second comparison only, because only a task list carries `verify` commands. Part 4's
correction boundary applies per comparison, reading "the artefact under validation" as
the upstream artefact in comparison 1 and as the task list in comparison 2. The fix label
every open finding already carries is unchanged, and it is what the orchestrator routes
on.

## 2. The three check classes

Read the artefact and its source in full, then check all three classes.

### Coverage

Everything in the source that should be realised downstream is realised downstream.

- A plan stage with no task.
- An acceptance criterion that no task carries.
- A filed issue with no task.
- A briefing decision the plan does not state.

### Invented content

Nothing downstream lacks a source.

- A task implementing something the plan never asked for.
- A plan requirement the brief never carried.
- An issue for a finding that was not filed.

### Accuracy

Anchors, paths, counts and claims.

- A cited `file:line` that does not hold what the artefact says it holds.
- A path that does not exist.
- A count that does not match.
- A `depends_on` naming the wrong upstream ID.
- A command, flag or argument the artefact tells an executor to run, where a file it
  cites shows it wrong, incomplete or unrunnable as written.
- A statement about what another artefact says, requires, or is currently in, where that
  artefact is named by ID or by path in the artefact you are validating. Check it by
  reading that artefact.

You follow only the references the artefact itself makes. You never survey the
workstream or the repository for related artefacts, and an artefact the artefact under
validation does not name is not your subject.

## 3. Verify execution, task lists only

Only a task list carries `verify` commands, so this part applies to a task list and to
nothing else.

### The baseline gate

Before you run any command at all, both of these conditions must hold.

1. `HEAD` matches the task list's `base_commit` by **prefix comparison**. The
   `base_commit` value is a short SHA and `HEAD` is a full one, so an equality test
   would never match. Compare the short value against the front of the full one.
2. No tracked file outside `flowcharge/` is modified.

The gate is never "the working tree is clean". At validation time the generated index,
the board and the workstream record are routinely modified by the upkeep that runs
between stages, and the lease file plus the artefact under validation are untracked. A
clean-tree gate would therefore fail on every in-pipeline run, and the whole of this
part would silently never execute.

Where the gate fails you run nothing. Report the drift and name which half failed: the
`base_commit` prefix, or a modified tracked file outside `flowcharge/`.

### The runnable command class

Run a `verify` step only when it is one of the project's own fast, side-effect-free
checks.

Admitted: linting, type-checking, a unit or single-file test run, `grep`, and
file-existence checks.

Excluded: builds, deploys, package installs, database or network operations, anything
that needs a service to be up, and anything that writes outside a temporary directory.

In this repository the class admits `node skills/flowcharge/scripts/test/run-tests.mjs`,
which is the project's own check command.

A step outside the class is reported as **unrun**. You never execute it, and an unrun
step is neither a pass nor a failure.

This class is wider than the class the executor template
`skills/flowcharge/templates/execute-parent-task.md` works under. The reason is that
the two run a command for different purposes: you run it to judge whether it
discriminates, while the executor runs it to gate a change to project code. That
template is not yours to edit, and nothing here changes it.

### The judgment

Judge per task. Never per command.

- A task whose **entire** runnable `verify` list passes at `base_commit` is
  tautological, and that is a finding. The work the list verifies has not been applied
  yet, so a list that already passes proves nothing about it.
- A task with at least one step that fails at `base_commit` passes this check. A
  project-wide lint or test step that passes is expected and is not itself a defect.
- A task whose every step was unrun is reported as **unjudged**, not as a pass.

You change no file in the working tree while running commands.

## 4. The correction boundary

Apply a correction only when all three of these conditions hold. Where any one of them
fails, report the finding instead.

1. **In artefact.** The change is confined to existing fields of the artefact under
   validation. It may touch more than one field, as long as every field it touches is
   already in that artefact. You add no field and you touch no other file.
2. **Provable.** The change is proved against a file on disk, or by running a command
   whose result you state in the return.
3. **Additive to nothing, subtractive from nothing.** The change removes nothing, and it
   adds no new task, issue, stage or acceptance criterion. This condition counts items,
   not words. Rewriting existing text to what a cited file holds adds nothing and removes
   nothing for this condition's purpose, while authoring a missing task and deleting an
   unsourced one still fail it.

Three classes satisfy all three.

- **Accuracy corrections.** A wrong path, a wrong anchor, a wrong count, a wrong ID, or
  a factual claim the artefact makes about a file it itself cites, where reading that
  file disproves the claim. The artefact must pin that claim to a named file. A claim
  with no file behind it is not provable and reports. Each member is proved by reading
  the file the artefact itself cites.
- **A replaced tautological `verify` step.** Proved in the strongest form available to
  you, because you run the replacement at `base_commit` and state that it fails there.
- **A settled finding whose recommended fix you labelled localised.** The caller has
  already settled the finding and handed back the answer it adopted, and the fix that
  answer asks for is a wording change inside sections the artefact already has.

The third class is gated rather than exempt, and the rules that follow are the gate. Each
of them binds that class alone.

**The adopted answer arrives from the orchestrator, or the class does not apply.** You
apply this class only where the orchestrator supplied the adopted answer, and you write
that answer exactly as the orchestrator states it. You never compose, infer, complete or
improve it. Where no adopted answer arrived from the orchestrator, the class does not
apply, and you report the finding instead. A missing answer is never a reason to write
one.

**The edit stays inside sections that already exist.** It changes no stage structure and
no scope shape, and it adds no stage, no task, no issue and no acceptance criterion. This
class therefore does not weaken condition 3, *additive to nothing, subtractive from
nothing*: it adds no new item of any kind, and it only changes wording inside sections
that already exist.

**Condition 1 is read at section granularity for this class alone.** An edit under this
class may touch more than one existing section of the artefact while adding none. The two
other correction classes keep their present single-field bound unchanged.

**Ambiguity resolves to structural.** Where you cannot tell whether the fix is localised,
the fix is structural. The class does not apply, you apply nothing, and you state in your
return that the fix is structural.

**The proof is the adopted answer itself**, quoted in the withheld part of the return
exactly as this part already requires for the other two classes.

**Every open finding you report labels its fix.** The finding gains one further duty: it
says whether the fix its recommendation asks for is localised or structural, by the test
the class above defines. Do not restate that test here; the label is that test's verdict
and nothing more. The label is what the caller routes on, and you carry the duty because
you hold the artefact and its source and the caller does not. The label rides the finding
you already print, so the return in part 5 keeps the shape it has and gains no new part.

**Coverage gaps and invented content always report.** Authoring a missing task and
deleting an unsourced one are both authoring judgments, so both fail condition 3. You
never write the missing item and you never delete the unsourced one.

**A claim about another FlowCharge Core artefact always reports too.** The subject of
this carve-out is a workstream record, a plan, an issue list or a task list, named by ID
or by a path under `flowcharge/`. Such a claim is the one accuracy finding that is never
applied, and there are two reasons for that. First, it passes the provable condition,
because the artefact it names is on disk, but rewriting what a plan says about a sibling
artefact is an authoring judgment of the same kind as the other two. Second, it carries
a staleness hazard the other accuracy classes do not: a claim that was true when the
artefact was authored goes stale later, when the artefact it names changes. In standalone
use a silent correction would therefore edit a correct historical record. An anchor or a
claim about project source code is an ordinary Accuracy correction, and another artefact
citing the same lines does not move it into this carve-out.

You write to the artefact's body only. Frontmatter is never touched, and that includes
`updated` and `base_commit`.

## 5. The return, and what it prints

The return has two named parts. Which part prints by default matters as much as what
each part carries.

### The printed part

One summary line, in this fixed shape:

```
Validated <artefact>. <N> fixes applied. <M> open findings.
```

`N` is one combined figure: corrections applied on your own authority plus settled
findings applied, added together. The printed line never splits them; the withheld part
records each class apart.

Then, only where `M` is not zero, each open finding. Phrase every finding as an open
question carrying its own recommendation, so that it reads cold to somebody who was not
here, and so that it lands in the channel hard rule 10 already defines for an open
question. Write every open finding in the fixed open-question block the prompt templates
carry, and in no other shape:

- **Question:** the question in one sentence that reads cold to somebody who was not here.
- **Recommendation:** the option you would take, and a one-line reason for it. Where you cannot recommend one, write `No recommendation possible` in this field, followed by the reason you cannot. A question carrying that sentinel never settles at any tier.

Where any `verify` step was left unrun or unjudged, the summary line gains one clause
naming how many of each. The reason is plain: a validation that ran nothing must never
read as one that found nothing wrong.

### The withheld part

Every applied correction, named with what it changed and with the proof behind it, under
its own heading. That heading is not printed unless the user asks for it.

This split binds every turn, a follow-up turn that applies settled findings included:
that turn prints the summary line alone, its applied findings join this part, and the
caller's settle message is not the user asking.

This detail is produced on **every** run. It is withheld from the stage report; it is
never omitted from the return. A validator that stops producing the proof loses the only
evidence its corrections were provable, so produce it always and print it on request.

The default follows from the common case: a few provable accuracy corrections and no
open finding. Printing those in every stage report frames routine production as
remediation. The user's judgment is needed only on an open finding, and an open finding
always prints.

This part adds no new return class and no new rule. A finding rides the existing
open-questions channel unchanged, and the printed-versus-withheld split does not weaken
hard rule 10, because every open finding, and the fact and the count of fixes,
still reach the user.

### A sequenced pass

A sequenced pass returns one heading per comparison, in the order the comparisons ran.
Each heading names the comparison's number, its source and its artefact, so a finding is
never read against the wrong artefact. Each heading carries that comparison's own fixed
summary line, in the shape above, then that comparison's open findings in the same
open-question block. The unrun-and-unjudged clause rides comparison 2's summary line
alone, because only a task list carries `verify` commands.

The withheld part keeps its single heading, and each correction it lists names which
comparison applied it.
