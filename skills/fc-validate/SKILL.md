---
name: fc-validate
description: Validate an authored FlowCharge Core artefact against the source it was authored from, a plan against the brief and workstream record behind it, a task list against its backing plan or issue list, an issue list against the findings it was filed from. Checks four classes (coverage of the source, content with no source behind it, accuracy of anchors, paths, counts and claims about other artefacts, and form, meaning spelling, formatting and schema conformance) and, for a task list, runs the verify steps it may run at the recorded baseline to catch a task that verifies nothing. Fixes every defect the source or a cited file proves wrong, in place and on its own authority, adding, rewriting or deleting items as the proof requires, and reports only a finding whose fix would be irreversible or whose correct content the source does not determine. Use whenever the user asks to validate, check, cross-check or sanity-check an authored artefact against its source, asks "does this task list cover the plan", "did the plan miss anything from the brief", "check the issues against the findings", "was anything invented here", or takes up the closing offer one of the generating skills prints after writing a new artefact. Also triggers on /fc-validate. Do NOT use to hunt defects in code, and do NOT use for pull-request or code review work, which a separate skill handles. This skill compares an authored document with the source it came from; it never judges the code an executor produced or whether a task's chosen approach is right, but how that approach is expressed — every command, flag, argument, path, anchor and count — is in scope wherever a file the artefact cites disproves it. Part of the FlowCharge Core suite.
metadata:
  version: "0.4.0"
---

# Validate

You check an authored artefact against the source it was authored from, with fresh
context. You did not write the artefact, you never see the account its author gave of
writing it, and that is the whole value you add.

You hold the authority a senior reviewer holds over a draft: fix what the source proves
wrong, and hand back only what you cannot decide.

This file is the single place the validator's baseline gate, runnable command class and
correction rule are defined. The prompt templates that carry a validation reference this
file rather than restating any of them, so each has exactly one wording. Where a template
and this file appear to disagree, this file is right.

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

**The first comparison completes before the second begins, and every fix it applies
lands before the second comparison reads the upstream artefact. The upstream artefact is
never edited to agree with the downstream one. A discrepancy the second comparison finds
is a finding against the task list, whatever its apparent cause. Where the second
comparison shows the upstream artefact itself is wrong against its own source, report
that as a first-comparison finding under the first heading, and never apply it. The
reason: a validator holding both artefacts could align the upstream one to the
downstream one, which launders an error rather than finding it.**

The issue-list source arrives as text rather than as a path, because user-supplied
findings are never written to a file. Treat that text as the source exactly as you would
treat a file, and never go looking for a file behind it.

Where the pairing you are given is not one of these four, or the chain you are given is
not one of these two, say so and stop.

Parts 2, 3 and 4 are unchanged in substance under a sequenced pass; a sequenced pass
changes only how each is read. The four check classes in Part 2 apply to each
comparison against that comparison's own source. Part 3, verify execution, applies to
the second comparison only, because only a task list carries `verify` commands. Part 4's
correction rule applies per comparison, reading "the artefact under validation" as the
upstream artefact in comparison 1 and as the task list in comparison 2. Because
comparison 1's fixes land before comparison 2 reads the upstream artefact, comparison 2
always checks the task list against the corrected upstream artefact. A task that a
comparison 1 fix leaves without a source, and a corrected upstream item that no task yet
realises, are both comparison 2's to fix.

## 2. The four check classes

Read the artefact and its source in full, then check all four classes.

### Coverage

Everything in the source that should be realised downstream is realised downstream.

- A plan stage with no task.
- An acceptance criterion that no task carries.
- A filed issue with no task.
- A briefing decision the plan does not state.

### Invented content

Nothing downstream lacks a source.

- A task implementing something the plan never asked for.
- A plan requirement the brief never carried, including one the brief forbids.
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

### Form

Spelling, formatting and schema.

- A misspelt word, or a malformed Markdown construct.
- Frontmatter that does not parse as YAML, or that breaks the owning skill's schema:
  `fc-task-list` for a task list, `fc-issue-list` for an issue list.
- A task or issue block that departs from the shape the owning skill's schema
  prescribes.

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

Run a `verify` step only when it asserts something specific to the task's own change:
a `grep`, a count, a file-existence check, or an equivalent read-only assertion about
a named file.

Excluded: lint, type-check, test suites, builds, deploys, package installs, database
or network operations, anything that needs a service to be up, and anything that
writes outside a temporary directory.

Lint, type-check and test commands are excluded although they are fast and
side-effect-free. They assert nothing about the task, so they pass at `base_commit`
as readily as after the change, and a tautology finding against one is unactionable:
the correction rule's remedy is a replacement step that fails at `base_commit`,
and no project-wide command can fail on unmodified code. The executor runs them after
the change lands, which is where they catch something.

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
- A task with at least one step that fails at `base_commit` passes this check.
- A task whose every step was unrun is reported as **unjudged**, not as a pass.

You change no file in the working tree while running commands.

## 4. The correction rule

Apply a fix whenever both of these conditions hold.

1. **Proved wrong.** The source, a file the artefact itself cites, or a command you ran
   and whose result you state in the return, shows the artefact is wrong.
2. **Proved right.** The same evidence determines what the correct content is, so the
   fix transcribes the evidence and never guesses.

Where both hold, fix it in place, immediately, on your own authority. You consult
nobody, you wait for no approval, and you never send the finding back for
re-authoring. The fix takes whatever shape the evidence requires: rewriting a field,
adding an item, or deleting one. Adding and deleting are in scope exactly as rewriting
is.

The rule covers, without being limited to:

- a spelling, formatting, YAML or schema defect (Form);
- a wrong path, anchor, count, ID or `depends_on` target, and a command, flag or
  argument a cited file shows wrong (Accuracy);
- a claim about another FlowCharge Core artefact, named by ID or by path, that reading
  that artefact disproves (Accuracy);
- a tautological `verify` list, replaced with a step you ran at `base_commit` and state
  fails there (Part 3);
- a task that does not address the plan stage or issue it is tied to, rewritten so it
  does (Coverage, Invented content);
- a detail in a plan, issue list or task list that the source does not support,
  including one the source forbids, deleted (Invented content);
- a source item nothing downstream realises, authored: a plan stage or acceptance
  criterion with no task, a filed issue with no task, a briefing decision the plan
  omits, a finding no issue carries (Coverage).

### The two stop conditions

A finding reports instead of being fixed only when one of these holds, and there are no
others.

- **Irreversible.** The fix could lose work, data or history that a later edit or a
  revert cannot restore. This is criterion (a) of the risk test in
  `skills/flowcharge/SKILL.md`'s "The prompt policy", applied as written there and not
  restated here. An edit to a Markdown artefact almost never meets it. A report under
  this condition names what would be lost.
- **Undetermined.** The evidence shows something is wrong but does not determine the
  correct content: the source is silent, or two readings of it are both defensible.
  Choosing one would be authoring, not correction.

No other property of a finding causes a report. Its check class, its size, the number
of sections it touches, whether it adds or removes an item, and whether it concerns
another artefact are all irrelevant to whether you fix it.

### Authoring within a fix

When a fix adds or rewrites an item, follow the owning skill's schema: `fc-task-list`
for a task, `fc-issue-list` for an issue, and the plan's own section shape for a plan
stage or acceptance criterion. Keep task numbering contiguous, and keep every
`depends_on` between tasks consistent after an insertion or a deletion. A new issue
needs an ISS ID: claim it with
`node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim ISS`
and use the ID it prints. That claim is the one write outside the artefact a fix may
make. Never claim an ID for an item you then do not write.

### What you may edit

You edit the artefact under validation and nothing else, the ISS claim above excepted.
In the body, everything is yours. In the frontmatter, you may fix YAML validity, schema
conformance and a wrong `depends_on` target; you never change `id`, `status`,
`base_commit`, `created` or `updated`. The orchestrator bumps `updated` after your run.
In a sequenced pass the upstream artefact is edited by comparison 1 only, and only
against its own source, per Part 1.

### A settled finding handed back

Where the caller settles an open finding you reported and hands the adopted answer
back, apply that answer exactly as stated, under the same edit rules as any other fix,
and record it in the withheld part with the answer quoted as its proof. You never
compose, complete or improve a handed-back answer. Where no answer arrives, the finding
stays open.

## 5. The return, and what it prints

The return has two named parts. Which part prints by default matters as much as what
each part carries.

### The printed part

One summary line, in this fixed shape:

```
Validated <artefact>. <N> fixes applied. <M> open findings.
```

`N` counts every fix, whatever its class and however many fields or items it touched.
A handed-back answer you applied counts as one fix.

Then, only where `M` is not zero, each open finding. Phrase every finding as an open
question carrying its own recommendation, so that it reads cold to somebody who was not
here, and so that it lands in the channel hard rule 10 already defines for an open
question. Write every open finding in the fixed open-question block the prompt templates
carry, and in no other shape:

- **Question:** the question in one sentence that reads cold to somebody who was not here.
- **Recommendation:** the option you would take, and a one-line reason for it. Where you cannot recommend one, write `No recommendation possible` in this field, followed by the reason you cannot. A question carrying that sentinel never settles at any tier.

A finding reported under the irreversible condition says so in its question, because
the caller's risk test must see it.

Where any `verify` step was left unrun or unjudged, the summary line gains one clause
naming how many of each. The reason is plain: a validation that ran nothing must never
read as one that found nothing wrong.

### The withheld part

Every applied fix, named with what it changed and with the proof behind it, under its
own heading. That heading is not printed unless the user asks for it.

This split binds every turn, a hand-back turn that applies a settled finding included:
that turn prints the summary line alone, its applied fix joins this part, and the
caller's hand-back message is not the user asking.

This detail is produced on **every** run. It is withheld from the stage report; it is
never omitted from the return. A validator that stops producing the proof loses the only
evidence its fixes were provable, so produce it always and print it on request.

The default follows from the common case: a handful of fixes and no open finding.
Printing those in every stage report frames routine production as remediation. The
user's judgment is needed only on an open finding, and an open finding always prints.

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

The withheld part keeps its single heading, and each fix it lists names which
comparison applied it.
