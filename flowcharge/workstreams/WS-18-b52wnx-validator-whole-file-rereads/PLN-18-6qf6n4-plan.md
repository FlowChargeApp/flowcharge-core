---
id: PLN-18-6qf6n4
type: plan
workstream: WS-18-b52wnx
slug: validator-whole-file-rereads
title: "Scope fc-validate's Accuracy anchor checks to the cited line range"
status: done
created: 2026-09-20
updated: 2026-09-20
author: Anthony Koukoullis
base_commit: 89e5c69
depends_on: []
links: []
---

## Summary

fc-validate's Accuracy class needs only a cited `file:line` and a small margin around
it to check an anchor, but the reviewing subagent observed the validator re-reading
whole files end to end in one benchmark run: "27 Bash calls, about 15 of them full
re-reads," costing 22-32% of Phase A. The workstream record marks the saving as a
hypothesis inferred from that observed pattern, not a measured result. The fix states
one scoping rule in `skills/fc-validate/SKILL.md`'s Accuracy class, names which
Accuracy bullets the rule covers so it does not conflict with the bullet that reads
another artefact whole by design, and has both validation templates
(`skills/flowcharge/templates/validate-plan-and-tasks.md` and
`skills/flowcharge/templates/validate-issues-and-tasks.md`) point at that rule instead
of carrying their own unscoped "reading the file" instruction. A prose pin in
`skills/flowcharge/scripts/test/run-tests.mjs` keeps the rule in place, matching how
that suite already pins `SKILL.md`'s correction-direction rule. Which checks the
Accuracy class runs, and how a defect is corrected, do not change.

## Scope

**In scope:**

1. `skills/fc-validate/SKILL.md`, Accuracy class (section 2): the class states that an
   anchor check reads the cited line range plus a small margin around it, never the
   whole file, and says which of its bullets that rule covers.
2. `skills/flowcharge/templates/validate-plan-and-tasks.md`: comparison 1's
   accuracy-proof sentence keeps "reading the file the plan itself cites" and adds a
   reference to the read scope `SKILL.md`'s Accuracy class sets, instead of restating
   the rule.
3. `skills/flowcharge/templates/validate-issues-and-tasks.md`: the parallel comparison-1
   sentence ("reading the file the issue list itself cites") gets the same reference.
4. `skills/flowcharge/scripts/test/run-tests.mjs`: one new prose pin asserts that the
   Accuracy class still carries the scoping sentence.

Items 1 and 2 are the workstream record's own file list. Items 3 and 4 extend it: item
3 because `validate-issues-and-tasks.md` line 28 carries the same unscoped sentence as
`validate-plan-and-tasks.md` line 28 with only "issue list" for "plan", so the issue
path would otherwise keep the behaviour the plan path loses; item 4 because the suite
already pins `SKILL.md` prose rules and CI runs it, so a rule with no pin can be dropped
silently.

**Out of scope:** Items 2, 4 and 5 from the same review batch, and the `validate: off`
proposal. The workstream record mentions them as cross-cutting context only; none is
planned, tasked, or referenced further in this plan.

**Confirmation that the four files are proper targets**, each read at `base_commit`:

- `SKILL.md` lines 95-111 hold the Accuracy class. Its first bullet, "A cited
  `file:line` that does not hold what the artefact says it holds," names the check but
  not how much of the file to read; nothing in the class limits the read, so a checker
  following it as written has no stated reason to stop short of the whole file. Its
  last bullet, a statement about another artefact, ends "Check it by reading that
  artefact," which is a whole-artefact read by design. The new rule must cover the
  first bullet and leave the last one alone.
- `validate-plan-and-tasks.md` line 28 is explicit but unscoped: "Prove a comparison 1
  accuracy finding by reading the file the plan itself cites." "Reading the file"
  carries no range qualifier.
- `validate-issues-and-tasks.md` line 28 is the same sentence for the issue path:
  "Prove a comparison 1 accuracy finding by reading the file the issue list itself
  cites."
- `run-tests.mjs` lines 4990-5030 hold the correction-direction pin: a section slice
  between two heading strings, an empty-slice assertion, and a whitespace-collapsed
  containment check for one rule sentence. `.github/workflows/ci.yml` line 40 runs the
  suite. The new pin follows the same shape.

**Assumptions:**

- **Deployment and release constraints.** None apply. Three of the four edits are prose
  in instructional documents, and the fourth is one static test case. Nothing is
  deployed, and there is no migration or live-data surface. Rollback is a plain git
  revert.
- **Comparison 2 needs no separate template edit.** In both templates only comparison
  1 carries its own "reading the file" sentence. Comparison 2 has none and runs under
  `SKILL.md`'s Accuracy class directly, so fixing `SKILL.md` governs it.
- **The HYPOTHESIS confidence note is not a blocker.** The record says the saving is
  inferred from the observed re-read pattern, not benchmark-confirmed. That is context
  for how this plan frames the change, not a condition to resolve before planning. The
  expected saving is smaller than the record's figure: the rewritten Accuracy class
  also checks commands against cited files and claims about other artefacts, and some
  of the observed reads came from the template's Context block, which this plan does
  not touch. Measure after execution.
- **The suite's state at `base_commit`.** `node skills/flowcharge/scripts/test/run-tests.mjs`
  reports 254/256 at `base_commit`. The two failures are pre-existing and unrelated to
  this workstream: two Rule E allowlist entries for `fc-validate/SKILL.md` that match
  nothing, and the correction-direction pin's section-end string, which names a heading
  the file no longer has. This plan neither fixes nor depends on them; the new pin uses
  its own heading strings, both confirmed present once each.

## Design

`SKILL.md` lines 17-20 set the pattern: "The prompt templates that carry a validation
reference this file rather than restating any of them, so each has exactly one
wording." The rule is therefore written once, in `SKILL.md`, and the two templates
reference it.

**1. `skills/fc-validate/SKILL.md`, Accuracy class (section 2).** The paragraph directly
under the Accuracy bullet list (lines 109-111) currently ends: "...and an artefact the
artefact under validation does not name is not your subject." A new paragraph follows
it, before the `### Form` heading:

> An anchor check reads the cited line range plus a small margin around it, never the
> whole file. The rule covers two of the bullets above: a cited `file:line`, and a
> command, flag or argument checked against the file it cites. It does not cover the
> last bullet: a claim about another artefact is proved by reading that artefact, as
> that bullet says. The path, count and `depends_on` bullets cite no line, so the rule
> does not apply to them.

It sits after the existing paragraph because both narrow how much material an Accuracy
check may draw on: the existing one by which files, the new one by how much of a cited
file. It is a separate paragraph, not a closing sentence of the existing one, because
it names the bullets it governs and needs its own room. It is placed after the bullet
list, not inside it, because it is a reading-method rule, not one more check.

**2. `skills/flowcharge/templates/validate-plan-and-tasks.md`, line 28.** The sentence
"Prove a comparison 1 accuracy finding by reading the file the plan itself cites."
becomes:

> Prove a comparison 1 accuracy finding by reading the file the plan itself cites,
> within the read scope the /fc-validate skill's Accuracy class sets for an anchor
> check.

The template already names "the /fc-validate skill" on lines 7, 17, 37 and 42, and line
37 says "Restate none of them here," so a reference is the form the file already uses.

**3. `skills/flowcharge/templates/validate-issues-and-tasks.md`, line 28.** The parallel
sentence becomes:

> Prove a comparison 1 accuracy finding by reading the file the issue list itself
> cites, within the read scope the /fc-validate skill's Accuracy class sets for an
> anchor check.

**4. `skills/flowcharge/scripts/test/run-tests.mjs`.** One new case, inserted between
the correction-direction case (ending at line 5030) and the `// ---- cases: LICENSE
presence and agreement` comment (line 5032). It slices `SKILL.md` from `### Accuracy`
to `### Form`, asserts the slice is non-empty, and asserts the whitespace-collapsed
slice contains "An anchor check reads the cited line range plus a small margin around
it, never the whole file." Constants are named `ANCHOR_READ_SCOPE_SECTION_OPEN`,
`ANCHOR_READ_SCOPE_SECTION_END` and `ANCHOR_READ_SCOPE_RULE`; the case is named
`fc-validate still scopes an anchor check to the cited line range`. The full text is
in the task list.

No other sentence in any of the four files changes. Nothing alters which checks the
Accuracy class runs, the correction rule, the baseline gate, or any frontmatter or
schema rule.

## Stages

1. **State the anchor-check reading rule in `SKILL.md`.** `SKILL.md` is the single
   source the templates reference, so it is fixed first. When this stage ends, the
   Accuracy class states the rule and names the bullets it covers.
2. **Reference the rule from `validate-plan-and-tasks.md`.** When this stage ends, the
   plan path's comparison-1 sentence points at the skill's read scope instead of
   leaving an unscoped instruction live.
3. **Reference the rule from `validate-issues-and-tasks.md`.** When this stage ends,
   the issue path's comparison-1 sentence does the same.
4. **Pin the rule in `run-tests.mjs`.** Last, because the pin asserts the text stage 1
   writes. When this stage ends, removing or moving the rule fails the suite.

## Data & compatibility

No data model, schema, or interface changes. The edits narrow a reading method inside
an existing check, add no new check, remove none, and change no artefact's frontmatter
contract. A validation run started before this change and one started after both
perform the same four check classes with the same correction rule, so no compatibility
gap opens between them. The new test case reads only `fc-validate/SKILL.md` and adds
no fixture. Rollback is a plain revert of the four edits.

## Testing strategy

The suite `skills/flowcharge/scripts/test/run-tests.mjs` exists and CI runs it, but a
suite command asserts nothing task-specific, so per the `plan-and-tasks-diff` template
none is added as a `verify` step. Verification is by direct reading of each edited
passage against this Design section, plus greps measured at `base_commit` before being
written down so each discriminates:

- Stage 1: `grep -c "An anchor check reads the cited line range" skills/fc-validate/SKILL.md`
  is 0 at `base_commit`, 1 after. `grep -c "reading that artefact" skills/fc-validate/SKILL.md`
  is 1 at `base_commit`, 2 after.
- Stage 2: `grep -c "read scope the /fc-validate skill" skills/flowcharge/templates/validate-plan-and-tasks.md`
  is 0 at `base_commit`, 1 after. `grep -c "the plan itself cites\.$"` on the same file
  is 1 at `base_commit`, 0 after.
- Stage 3: the same two greps on `skills/flowcharge/templates/validate-issues-and-tasks.md`
  with "the issue list itself cites\.$": 0 then 1, and 1 then 0.
- Stage 4: `grep -c "still scopes an anchor check" skills/flowcharge/scripts/test/run-tests.mjs`
  is 0 at `base_commit`, 1 after.
- After all four stages, running the suite by hand prints
  `ok   fc-validate still scopes an anchor check to the cited line range` and reports
  255/257, the two pre-existing failures unchanged.

## Open questions

None. The wording is fixed by the workstream record ("a small margin around it," with
no numeric size to choose), the bullets the rule covers are read from `SKILL.md`
itself, and all four target files are confirmed above.

## Alternatives considered and rejected

- **Read only the exact cited line, no margin.** Rejected: a bare single line risks a
  false negative whenever the claim depends on a construct spanning a few lines (a
  signature, a short block), and the workstream record's own wording already calls
  for a margin.
- **Place the rule at the top of section 2 ("Read the artefact and its source in
  full...").** Rejected: that sentence governs all four check classes, so narrowing it
  there would also constrain Coverage, Invented content and Form, which the record does
  not ask for and which may need a full read of the source artefact.
- **State the rule without naming the bullets it covers.** Rejected: the Accuracy
  class's last bullet says "Check it by reading that artefact," so an unqualified
  scoping sentence would contradict it and leave the validator to choose.
- **Mirror the rule's wording verbatim into the templates.** Rejected: `SKILL.md` lines
  17-20 say templates reference this file rather than restate it "so each has exactly
  one wording," and both templates' line 37 says "Restate none of them here." A
  verbatim copy creates a second wording to keep in step.
- **Edit only `SKILL.md` and leave both template sentences as they are**, relying on
  "where a template and this file appear to disagree, this file is right." Rejected:
  "reading the file" is the exact unscoped phrasing the observed reads are consistent
  with, so leaving it live keeps a looser instruction in the templates the validator
  actually runs under.
- **Leave `validate-issues-and-tasks.md` out because the record does not list it.**
  Rejected: its line 28 is the same sentence, so the issue path would keep the
  behaviour the plan path loses.
- **Add no test pin.** Rejected: the suite already pins `SKILL.md`'s
  correction-direction rule in exactly this shape, and without a pin the sentence can
  be dropped in a later rewrite with nothing failing.

## Final summary

One scoping rule lands in `SKILL.md`'s Accuracy class, naming the two bullets it covers
and the one it leaves alone. Both validation templates' comparison-1 sentences reference
that rule instead of restating it, and one prose pin in `run-tests.mjs` keeps it in
place. Four stages, each one edit to one file. The saving is a hypothesis to measure
after execution. No open questions.
