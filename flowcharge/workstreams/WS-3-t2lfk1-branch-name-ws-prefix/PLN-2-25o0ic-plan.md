---
id: PLN-2-25o0ic
type: plan
workstream: WS-3-t2lfk1
slug: branch-name-ws-prefix
title: "Prefix FlowCharge Core branch names with the workstream code"
status: ready
created: 2026-09-13
updated: 2026-09-13
depends_on: []
links: []
---

# Prefix FlowCharge Core branch names with the workstream code

## Summary

A branch cut for a FlowCharge Core workstream currently carries only a bare
slug (`feature/gate-directness-determinacy-rewrite`), unlike the
`flowcharge/workstreams/WS-N-SUFFIX-<slug>/` folder it belongs to, which
already carries the workstream code. This plan adds that code to the branch
name — `feature/WS-N-SUFFIX-<slug>` — by editing the two places branch names
are decided: `fc-git/SKILL.md`'s Branching section (the convention fc-git
itself follows whenever it is asked to cut a branch) and
`flowcharge/SKILL.md`'s hard rule 11 (the convention the flowcharge
orchestrator follows when it auto-cuts a branch before a run's first
execute-tasks or commit). Both change in the same stage because they must
keep agreeing, exactly as they do today.

## Scope

**Acceptance criteria**

- `fc-git/SKILL.md`'s Branching section states that a branch cut for a
  FlowCharge Core workstream identifiable in context is named
  `feature/<WS-N-SUFFIX>-<description>` (or the matching `fix/`/`chore/`
  form), the ID ahead of the description.
- `fc-git/SKILL.md`'s Branching section still documents today's bare
  `feature/`/`fix/`/`chore/` form as the fallback for branches that are not
  workstream-driven.
- `flowcharge/SKILL.md` hard rule 11 cuts a run's auto-branch as
  `feature/<ws_id>-<slug>` in place of today's `feature/<slug>`.
- The two files' new text agrees on one shape —
  `feature/<WS-N-SUFFIX>-<slug>` — matching the
  `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/` folder convention.
- The two unrelated `feature/x` mentions in `fc-git/SKILL.md` (line 25's
  merge example, line 164's merge-style example) are unchanged.
- `README.md`, `skills/flowcharge/CONVENTIONS.md`, and
  `skills/flowcharge/scripts/test/run-tests.mjs` receive no edits from this
  feature.
- `skills/prx-git/SKILL.md` and `skills/prx-orchestrate/SKILL.md` — the
  Praxis suite's parallel skills — receive no edits from this feature.

**Out of scope.** Renaming any branch that already exists under the bare
convention. Any change to workstream-folder naming (already `WS-N-SUFFIX-<slug>`,
already correct). Any change to the Praxis suite (`prx-git`, `prx-orchestrate`).
Adding a machine-checkable regression test for the new branch-name shape (see
Alternatives). Adding a `CHANGELOG.md` entry for this change (see Adjacent
opportunities).

**Assumptions.**

- This is additive, not corrective: today's two files already agree with each
  other, so this plan is adding a capability neither promised before, not
  resolving a contradiction. It ships as one `CHANGELOG.md` `Added` line at
  release time, under `VERSIONING.md`'s MINOR bump ("a new capability with
  everything existing still working"), and the plan takes no position on when
  that release happens — release timing is the maintainer's call per
  `VERSIONING.md`, not this plan's.
- Adding the `CHANGELOG.md` line itself is left to this repo's normal
  merge-time convention (every merged change adds one, per `VERSIONING.md`)
  rather than named as a stage here, because Context scopes this feature to
  the two skill files only, and the changelog convention applies uniformly to
  every merge regardless of what changed — it is not part of this feature's
  own design.
- No production data or live users are protected by this change: `fc-git/SKILL.md`
  and `flowcharge/SKILL.md` are prose an agent follows during a session, not a
  running service, and nothing here touches `flowcharge/` on-disk schema, so
  there is no migration and no rollback beyond reverting the commit.
- The feature ships whole, in one commit; there is no partial/dark-launch state
  worth protecting, because a text-only prompt change carries no runtime
  behavior to gate behind a flag.
- Branches already cut under the bare convention (e.g. the current session's
  own `feature/unescape-frontmatter-quoted-values`) are left as they are —
  the new convention applies to branches cut after this change lands, not
  retroactively.

## Design

**What changes, file by file.** Both edits are prose replacements inside
existing sections; neither file gains a new section or a new mechanism beyond
the one described below.

**`fc-git/SKILL.md`, Branching section (currently lines 139–151).** The
section keeps its generic default (fc-git is used on any repo, not only
FlowCharge Core-tracked ones) and gains one new bullet, placed where the
existing "Naming" paragraph ends, mirroring the Committing section's existing
`FlowCharge Core artefacts` bullet (lines 124–131) — the same "identifiable in
context" test that bullet already uses for citing IDs in commit messages:

> FlowCharge Core workstreams: when the branch is cut for work that traces to
> a FlowCharge Core workstream identifiable in context (`WS-N-SUFFIX`) — the
> same "in context" test the Committing section's FlowCharge Core artefacts
> rule uses — prefix the chosen name with that workstream's ID ahead of the
> description: `feature/WS-3-t2lfk1-branch-name-ws-prefix`, matching the
> `flowcharge/workstreams/WS-N-SUFFIX-<slug>/` folder convention. Work that
> isn't workstream-driven keeps the bare form above — never invent or hunt
> for an ID.

The example command block (`git switch -c feature/<short-description>`) is
left as the generic placeholder it already is; the new bullet states the
FlowCharge Core-specific case the same way the Committing section's ID-citation
rule sits beside its own generic example rather than replacing it.

**`flowcharge/SKILL.md`, hard rule 11 (currently lines 128–139).** The rule
already resolves the run's own workstream ID earlier in every run (the
`{ws_id}` slot defined under "ID slots", sourced from `--new-ws`'s printed id
or from the resumed workstream's folder name) before it ever reaches branch
creation, so no new resolution mechanism is needed here — only the branch
name and its explanation change:

> cut `feature/<ws_id>-<slug>` from the current HEAD (`git switch -c`; no
> fetch, no pull), switch to it, and say so in that stage's report.
> `<ws_id>` is the run's own workstream ID (see "ID slots"), and `<slug>` is
> the run's workstream slug, bare and unprefixed — together matching the
> `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/` folder convention.

Everything else in the rule (the default-branch check, the "Safe. Execute
directly" tier, the once-per-run check) is unchanged.

**What each edit knows, and must not know.** The `fc-git/SKILL.md` bullet
knows only that a `WS-N-SUFFIX` may already be identifiable in context; it
must not search `flowcharge/workstreams/` for one, must not invent one, and
must not change its behavior for a repo with no `flowcharge/` folder at all —
identical to the discipline the existing commit-citation rule already
follows. The `flowcharge/SKILL.md` rule knows only the `ws_id` and `slug`
values the run already resolved earlier under "Start of run"; it must not
introduce a second, independent way to derive a workstream ID for branch
naming.

## Stages

1. **Prefix the branch name in both skill files together.** Apply the two
   edits above to `fc-git/SKILL.md` and `flowcharge/SKILL.md` in one pass.
   This is the whole feature: a text-only change with no partial-landing
   value, sized for one sitting, and required to land together so the two
   files never disagree at any point a reader might see them (per the
   decision already taken). Observable at the end: both files state the same
   `feature/<WS-N-SUFFIX>-<slug>` shape, grepping `flowcharge/SKILL.md` for the
   old `feature/<slug>` finds nothing, and `fc-git/SKILL.md`'s generic
   `feature/<short-description>` placeholder (line 146) is still present.

## Data & compatibility

No data model, frontmatter schema, or `flowcharge/` on-disk shape changes.
Existing branches keep whatever name they already have — this is forward-only,
not a rename or a migration. Backward compatibility: a repo with no
`flowcharge/` folder, or a branch cut for work with no workstream identifiable
in context, keeps getting the unprefixed `feature/`/`fix/`/`chore/` name
exactly as today. Rollback: revert the one commit; nothing on disk outside
these two files is touched, so reverting fully restores today's behavior.

## Testing strategy

Both changes are prose an agent reads and follows, not code a test harness
executes — no script in this repo creates a git branch or inspects branch-name
shape (`skills/flowcharge/scripts/test/run-tests.mjs` has zero matches for
`feature/`). Verification is a text-level review: confirm both files show the
new `feature/<WS-N-SUFFIX>-<slug>` wording, confirm the two unrelated `feature/x`
mentions in `fc-git/SKILL.md` (lines 25, 164) are untouched, and re-run the
existing suite (`node skills/flowcharge/scripts/test/run-tests.mjs`) as a
regression check — its docs-consistency cases are explicitly non-hermetic
("an edit made anywhere under `skills/` can fail this suite"), so running it
catches an unrelated regression even though it carries no case for this rule.
No new automated test is added; see Alternatives for why.

## Open questions

None. Every point Context left to this plan's judgment — the resolution
mechanism inside `fc-git`, whether to add a regression test, whether to touch
`CHANGELOG.md` — has a well-accepted default recorded above as a decision or
an assumption, and a wrong call on any of them is recoverable by a later
follow-up change.

## Adjacent opportunities

- Add the `CHANGELOG.md` `## Unreleased` → `Added` line this repo's own
  `VERSIONING.md` process calls for on every merged change. Not requested by
  Context, which scopes this feature to the two skill files; build-now is a
  reasonable call at merge time given the near-zero cost, but it is left to
  that step rather than this plan.
- Extend `fc-git/SKILL.md`'s illustrative merge example (line 25) to show a
  workstream-prefixed branch name, for stylistic consistency with the new
  Branching-section example. Not requested, and Context's own investigation
  confirms that line is unrelated placeholder text; skip.

## Alternatives considered and rejected

- Have `fc-git/SKILL.md` search `flowcharge/workstreams/` itself to resolve a
  workstream ID when none is stated — rejected: it would give a
  project-agnostic git skill a new filesystem-scanning capability, break with
  the existing commit-citation rule's "identifiable in context, never hunt or
  invent" discipline, and Context scopes this feature to branch-naming
  text/behavior only.
- Change only `flowcharge/SKILL.md` and leave `fc-git/SKILL.md`'s Branching
  section as-is — rejected: Context's own decision requires both files to
  change together, since fc-git is the convention followed whenever it is
  asked to cut a branch directly, not only when the orchestrator drives it.
- Rewrite `fc-git/SKILL.md`'s example command block to hardcode the
  workstream-prefixed form as the only shown case — rejected: fc-git runs
  against any repo, not only FlowCharge Core-tracked ones, and hardcoding
  would misrepresent the common case against the section's own "follow the
  repo's existing convention" default.
- Add a machine-checkable regression test asserting the new branch-name shape
  in both files' text — rejected for now: nothing in this repo executes or
  checks an actual `git switch -c` call, the existing docs-consistency harness
  targets a fixed, already-closed set of eight on-disk schema rules, and a
  ninth check for an agent-followed instruction with no on-disk artifact is
  disproportionate to a two-paragraph text change.

### Final summary

One approach: edit `fc-git/SKILL.md`'s Branching section and
`flowcharge/SKILL.md`'s hard rule 11 together, in a single stage, so a branch
cut for a FlowCharge Core workstream is named `feature/<WS-N-SUFFIX>-<slug>`
in both places at once. One stage, small enough for one sitting — prose only,
no code, no schema change. Top risk: the two files drifting apart again if
edited separately, which the single-stage design avoids by construction. No
open questions remain; every judgment call Context left open is recorded
above as a decision or an assumption.
