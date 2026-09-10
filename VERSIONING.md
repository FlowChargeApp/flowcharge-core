# Versioning policy

This document states how the FlowCharge Core suite's version works, and how it appears
in every skill's `SKILL.md` frontmatter. It does not implement any tooling.

## Scope

There is one version: the FlowCharge Core suite version. Every skill's
`metadata.version` mirrors it. No skill has its own, independently
incrementing version.

This document does not implement:

- Where the suite version is authored and bumped: `CHANGELOG.md`, the release
  command `node .github/scripts/release.mjs <X.Y.Z>`, and the annotated git tag
  that command creates. See "Cutting a release" below.
- The generated skill manifest. That is WS-69.

## Why every skill file carries the version

The FlowCharge application downloads a release zip and unzips it, so it installs
whole skill folders at a user's chosen location. It does not carry the whole
repo, so a distributed skill folder cannot read `CHANGELOG.md` or a git tag to
learn its own version. Stamping the suite version into every `SKILL.md`'s
`metadata.version` is the only way a standalone skill folder carries that
information. The application reads an installed `SKILL.md`'s `metadata.version`
to decide whether an upgrade is available.

## The rule

Every skill's `metadata.version` always equals the current FlowCharge Core suite
version. At release time, every `SKILL.md` is stamped with the new suite
version, whether or not that particular skill changed in that release. No
skill bumps its version independently, and there is no per-skill
MAJOR/MINOR/PATCH policy.

## Cutting a release

1. Edit `CHANGELOG.md`. Move the `## Unreleased` items under a new
   `## X.Y.Z - YYYY-MM-DD` heading.
2. Run `node .github/scripts/release.mjs <X.Y.Z>`. It refuses a bad state,
   stamps every `SKILL.md` with that version, commits the stamp, then creates
   the annotated tag `vX.Y.Z`. It never pushes.
3. Push the branch, then push the tag.

CI then builds and publishes `flowcharge-skills-<X.Y.Z>.zip` against the pushed
tag.

## How the next version is decided

**The version describes a release, not the work.** A workstream, a branch and a
merge never carry a version. Many merged workstreams make one release, and one
workstream may span two releases. Never bump per branch, and never count
workstreams.

**`CHANGELOG.md` decides the number.** Every merged change adds a line under
`## Unreleased`, in one of four sections: `Added`, `Changed`, `Fixed`,
`Removed`. At release time the contents of `## Unreleased` determine the bump.
The maintainer decides when to release. The changelog decides what number that
release gets.

**The mapping**, judged by the effect on an existing user who updates. The
FlowCharge Core user-facing contract is the skill names and triggers, the
`flowcharge/` on-disk layout, the frontmatter keys and their meanings, the
status enum, the ID shapes, the `fc-index.mjs` flags, and the `agents.md` keys.
MAJOR is a release after which the user's existing `flowcharge/` folder or
install stops working unless they act: a renamed frontmatter key, a changed ID
shape, a removed CLI flag. MINOR is a new capability with everything existing
still working: a new skill, a new optional key, a new `--list` scope. PATCH is a
fix with no contract change: a generator bug, a wrong warning, a prompt wording
fix. Where one release mixes them, the highest applies.

**The `0.x` period, and it is in force today.** Below `1.0.0` there is no
compatibility promise, and MAJOR cannot move below `1`. MINOR and PATCH keep
their ordinary meaning: a new capability bumps MINOR, `0.1.0` to `0.2.0`, and a
fix bumps PATCH, `0.1.0` to `0.1.1`. A breaking change also bumps MINOR, because
it is the only number available to move, and its changelog line says that it
breaks. FlowCharge Core stays on `0.x` deliberately while the frontmatter schema
and the ID shapes are still moving. Reaching `1.0.0` is the point where the
promise starts that no `flowcharge/` folder breaks without a major bump, and
that promise is not made yet.

**How an agent uses this.** An agent asked to recommend a release reads
`## Unreleased`, applies the mapping above, applies the `0.x` note for a
breaking change, and recommends one number with its reason. It never chooses
the number from memory, and it never decides on its own that a release should
happen.

Conventional Commits mechanises this same mapping: `fix:` to PATCH, `feat:` to
MINOR, `!` or `BREAKING CHANGE:` to the breaking bump. That is why
`CONTRIBUTING.md` adopts it.

This section states a suite-level bump rule and nothing else. There is still one
suite version, every skill mirrors it, no skill bumps its version
independently, and there is still no per-skill MAJOR/MINOR/PATCH policy.

## On-disk shape reference

Every skill's `SKILL.md` frontmatter carries its version nested under a
`metadata` map, as shipped by WS-65 (WS-65-gz739f-per-skill-version-frontmatter):

```yaml
---
name: fc-example
description: ...
metadata:
  version: "0.1.0"
---
```

`version` is always nested under `metadata`, always quoted, and always a
three-part string. It is never a bare top-level `version:` key.
