# Changelog

All notable changes to the FlowCharge Core suite are recorded here.

The format follows Keep a Changelog, with one deliberate deviation: a release
heading is written as `## X.Y.Z - YYYY-MM-DD`, with no brackets around the
version. `checkSuiteVersion` in `skills/flowcharge/scripts/fc-index.mjs`
matches `^## (\d+\.\d+\.\d+)`, so a bracketed heading would not be read. Do not
add the brackets.

Versions follow Semantic Versioning. There is one FlowCharge Core suite version and every
skill mirrors it. See VERSIONING.md.

## Unreleased

### Changed

- The repository now describes itself as FlowCharge Core; the on-disk format
  keeps the bare `flowcharge` name.
- The bare word `PRX` is gone from the skill files; the two generated artefact
  headings now read `# FlowCharge Tasks` and `# FlowCharge Issue List`, and
  nothing on disk moved.
- Hard rule 10 now carves criterion (a) out of what `open_questions: yolo`
  settles: a recommendation that is catastrophic or irreversible relays
  unsettled under every value of the key, `yolo` included. Everything `auto` or
  `yolo` does settle is reported as one count line, with the per-question detail
  produced on every run and printed on request.
- A plan no longer manufactures an open question from an item the author would
  have asked about. Such an item is now recorded as an explicit assumption in the
  plan's Scope section by default, and becomes an Open question only where a
  wrong answer is not recoverable by a later follow-up change.
- This repository's own `flowcharge/agents.md` now sets `open_questions: yolo`,
  so a recommendation this project's pipeline makes is adopted without stopping
  the user, except where hard rule 10's criterion (a) carve-out applies.
- A validation finding the orchestrator settles as non-risky, and whose
  recommended fix the validator labelled localised, is now applied by the
  validation subagent in a follow-up turn; every other settled finding keeps the
  existing authoring re-spawn. A settled finding that changed an artefact this
  way is still counted and detailed in the decisions-already-taken record,
  naming which of the two paths applied it — the validation-narration exclusion
  never drops a finding that actually changed something.
- A correction `fc-validate` applies on its own authority is now stated,
  in hard rule 10 and in Reporting alike, to never be a settled decision and
  never enter the settled-decisions count — a live run had narrated its own
  mechanical corrections as "decisions settled automatically", conflating the
  two.
- The Reporting section now states that a stray event arriving after the
  consolidated summary — a subagent completion notice, a duplicated message,
  an echo of the answered request — gets one line pointing at the existing
  summary, never a re-print, and never a re-run stage or upkeep. Two live
  runs had re-answered a finished run's summary as if it were a new question.
- The validator-applied path now states that the follow-up message never
  instructs a frontmatter change, and that the orchestrator bumps the edited
  artefact's `updated` itself, inline, under hard rule 8's widened frontmatter
  carve-out — the first live yolo run had improvised a bump instruction to the
  validator, which its contract rightly refused, leaving the bump assigned to
  nobody.
- Correction and settlement detail from `fc-validate` never reaches the end
  user by default, under every `open_questions` mode: the summary line now
  prints one combined "N fixes applied" figure, its withheld split binds every
  turn including the settled-finding follow-up turn, and the orchestrator's
  stage reports and final summary relay that count — with any unrun/unjudged
  clause — and never re-enumerate what was fixed. Settled decisions join a
  per-run record printed on request ("show them"); open findings still always
  print. The eighth live run had printed the validator's per-finding detail in
  the open and re-enumerated the fixes in the final summary, and the user
  directed that this detail is internal, in all modes, always.
- The settled-decisions record's suppression is now a fixed template instead of
  a prohibition: the consolidated summary prints exactly one verbatim line —
  "K decisions were settled automatically; say 'show them' to see them",
  omitted at zero — and never lists the record's entries; the post-summary
  stray-event pointer never restates counts or their breakdown; and rule 10's
  "never silent" now reads "never unrecorded". The ninth live run had printed
  the full record unprompted, twice in one run, immediately after the previous
  suppression fix shipped — the prose gave the user no way to learn the record
  existed, so "show them" was unreachable, and the user directed that fixed
  templates to populate outperform plain-English response descriptions.
- One named section of `fc-orchestrate` — "The prompt policy" — now defines the
  three prompt tiers `manual`, `assist` and `cruise`, and the (a)/(b)/(c) risk
  test, once and in one place. Hard rule 4, hard rule 10 and the "Flagged tasks"
  block defer to it instead of each restating a piece of the same contract.
- The `open_questions` key is retired. A `flowcharge/agents.md` that holds it,
  a `gates:` line, or a `prompts:` value of `ask` or `skip` is migrated in place
  on the next run: the pair resolves through a joint migration table to one
  tier, and the file is rewritten to a single `prompts: <tier>` line with every
  other key untouched. The run's first report states the resolved tier and the
  pair it came from. A file that already holds a new-tier value is left alone.
- The six prompt templates that can return an open question — `create-plan`,
  `tasks-from-plan-spec`, `tasks-from-plan-diff`, `validate-plan`,
  `validate-issues` and `validate-tasks` — now return every open question in one
  fixed block carrying a question field and a recommendation field. Where no
  recommendation is possible, that field holds the sentinel
  `No recommendation possible` and the reason behind it, and a question carrying
  the sentinel never settles. Part 5 of `fc-validate` names the same block as
  the shape its open findings take.
- A file under a skill's `prompts/` directory is now called a prompt template
  throughout, and the bare word "prompt" now names only the interrupt mechanism
  the `prompts:` key governs; the assembled message sent to a subagent is
  spelled out as a subagent prompt. A word-boundary sweep of `skills/` for the
  word "gate" renamed nothing: every surviving occurrence carries a recorded
  non-mechanism sense — `fc-git`'s pre-commit safety gate, `fc-validate`'s
  baseline gate and its gated third correction class, `fc-bug-hunt`'s existence
  and impact gates, `CONVENTIONS.md`'s "never a gate" status remark,
  `fc-task-list`'s "gated on", the deprecated `gates:` alias, and the `#gates+`
  tag-token examples.
- The docs-consistency check in `run-tests.mjs` now holds four further rules,
  and fails the suite on: an unallowlisted "gate" in `skills/**/*.md`, an
  unallowlisted `open_questions`, a `skills/`-rooted path or a
  `prompts/<name>.md` reference that does not exist on disk, and an
  open-question-capable prompt template missing the verbatim return block. The
  first two carry one allowlist entry per live occurrence, each recording the
  sense that earns it, and the stale-entry case now sweeps both, so an
  exception that stops matching anything fails the suite as well.

### Removed

- The suite no longer ships `fc-bug-hunt`. The skill folder is deleted, its
  manifest entry is gone, and the cross-references to it in `fc-validate`,
  `fc-plan-feature` and the README are reworded.
- The orchestrator no longer carries a bug-hunt operation or its prompt
  template: the operation is off the Operations table and out of the canonical
  chains, and `skills/flowcharge/prompts/bug-hunt.md` is deleted.
- `create-issues` now takes user-supplied findings as its only input, in place
  of the findings a preceding bug-hunt stage used to hand it.

### Fixed

- `fc-validate` now applies two provable corrections silently instead of
  routing them into open findings: a factual claim the artefact pins to a named
  file that reading the file disproves, and a correction that touches more than
  one field of the same artefact. Its always-reports carve-out is limited to
  claims about other FlowCharge Core artefacts, so an anchor into project source
  code stays an ordinary accuracy correction. The orchestrator no longer
  narrates a validation finding that `open_questions: auto` already settled.
- The validation-narration exclusion now also fires under `open_questions: yolo`.
  It was scoped to `auto` only, so on a `yolo` project a non-risky validation
  finding was counted and detailed again — the WS-95 exclusion and the WS-97
  `yolo` flip cancelled each other. A risky recommendation `yolo` settles is
  still counted and shown, whatever stage it came from.
- The validation-narration exclusion is now a filter applied before the settled
  count N is computed, in hard rule 10 and in Reporting alike. A live A/B test
  showed the old trailing "One exclusion" wording losing to "settling is never
  silent" when every settled question came from validation: the run printed the
  count line anyway. The rule now names fc-validate's own term — a non-risky
  open finding carrying a recommendation — states that a dropped item appears
  in neither the count line nor the expanded detail, and states that N = 0
  means no count line prints at all.
- The "Standing vs. one-off instructions" default-value example named
  `prompts: ask` as the built-in default to restore on a revert — stale
  residue from before `prompts:` widened to three tiers. It now names
  `prompts: manual`, the actual built-in default.

## 0.1.0 - 2026-09-03

### Added

- `skills/fc-orchestrate/SKILL.md` — the conductor: hard rules, the operations
  table, the prompts and the index upkeep.
- `skills/fc-orchestrate/CONVENTIONS.md` — the canonical data model.
- `skills/fc-orchestrate/prompts/` — the verbatim prompt templates, one per
  operation.
- `skills/fc-orchestrate/scripts/fc-index.mjs` — the index and board generator.
- `skills/fc-bug-hunt/` — read-only bug hunt: categories, verification gates,
  finding format.
- `skills/fc-dev-principles/` — the engineering-principles checklist loaded by
  the planning and tasking prompts.
- `skills/fc-git/` — disciplined git operations: commit, branch, merge, rebase,
  worktrees, stash, tags, remotes, recovery.
- `skills/fc-issue-list/` — issue-list schema: per-issue YAML blocks,
  severities, cross-linking.
- `skills/fc-plain-text-kanban/` — board skill: the generated-view rules and the
  plugin format.
- `skills/fc-plan-feature/` — feature planning: the approach prompt, the
  required plan structure, planning principles.
- `skills/fc-task-list/` — task-list schema: spec and diff modes, the
  `base_commit` guard, self-eval.
