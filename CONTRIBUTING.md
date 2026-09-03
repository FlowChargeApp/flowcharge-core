# Contributing

## Commit messages

This repository uses Conventional Commits. Write the subject line as
`type(optional-scope): summary`.

The allowed types are:

- `feat:` — a new capability.
- `fix:` — a defect repair.
- `docs:` — documentation only.
- `chore:` — maintenance, tooling and release commits.
- `refactor:` — a change that keeps behaviour the same.
- `test:` — test cases only.

One worked example:

```
feat(flowcharge): add a release stage to the pipeline
```

The convention is adopted now because it makes `release-please` a drop-in
change later. No tooling enforces it yet. There is no lint step and no commit
hook. The policy is documentation only, so review is the only check.

## Releasing

There is one FlowCharge Core suite version. Every skill mirrors it. See
`VERSIONING.md`.

1. Edit `CHANGELOG.md`. Move the `## Unreleased` items into a new release
   heading, written as `## X.Y.Z - YYYY-MM-DD` with no brackets.
2. Run `node .github/scripts/release.mjs <X.Y.Z>`. The command refuses a wrong
   branch, a dirty tree, a changelog that disagrees, and a tag that already
   exists. It then stamps every `SKILL.md`, commits, and creates the annotated
   tag.
3. Push the branch, then push the tag. The command never pushes. You do this
   step yourself, and it prints the two commands you need.

This repository has no `package.json` and takes no dependency, so the release
command is a bare `node` invocation. Do not add an npm script for it.

## Versions in a SKILL.md

The `metadata.version` value in a `SKILL.md` is a derived value. The release
command writes it. Never edit it by hand.
