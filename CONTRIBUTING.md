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
2. Drain this version's milestone of every issue still open in it — see Release milestones below.
3. Run `node .github/scripts/release.mjs <X.Y.Z>`. The command refuses a wrong
   branch, a dirty tree, a changelog that disagrees, and a tag that already
   exists. It then stamps every `SKILL.md`, commits, and creates the annotated
   tag.
4. Push the branch, then push the tag. The command never pushes. You do this
   step yourself, and it prints the two commands you need.
   This is a direct push to a protected branch, and it works because
   `enforce_admins` is `false` — see Branch protection below.
5. Close this version's milestone — see Release milestones below.

This repository has no `package.json` and takes no dependency, so the release
command is a bare `node` invocation. Do not add an npm script for it.

## Branch protection

`main` is the only permanent branch, and three settings hold on it: squash-merge
is the only merge method, the head branch deletes itself after a merge, and CI
must pass before a pull request can merge. No pull request review is required,
because the maintainer works solo.

Those settings do not live on one endpoint. Merge methods and auto-delete are
repository settings:

```bash
gh repo edit --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false --delete-branch-on-merge
```

`--enable-squash-merge` is passed even though squash is on by default, so the
command states the whole intended end state and is safe to re-run.

The required status check is set separately, as classic branch protection. Its
`context` string is a job's check-run name and not something to guess, so read
it from a real run of `ci.yml` on `main` first:

```bash
RUN_ID=$(gh api "repos/{owner}/{repo}/actions/workflows/ci.yml/runs?branch=main&event=push&status=completed" --jq '.workflow_runs[0].id')
gh api "repos/{owner}/{repo}/actions/runs/$RUN_ID/jobs" --jq '.jobs[] | select(.conclusion != "skipped") | .name'
```

The shorter `gh api repos/{owner}/{repo}/commits/main/check-runs` read is
deliberately not used here: it returns every check run attached to `main`'s
head commit, including a job skipped by its `if:` guard and any run a tag push
started on the same commit, so it prints several names rather than one. The
name the command above prints goes into the protection call verbatim, never
assumed to be `test`.

```bash
gh api --method PUT repos/{owner}/{repo}/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "checks": [ { "context": "test" } ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

The `"test"` string is replaced by whatever the check-run read above printed.
This `PUT` replaces the whole protection object, so re-running it is the way to
change any setting, and no key may be dropped — the four top-level keys are
required even when null. GitHub's schema also lists a deprecated `contexts`
field as required alongside `checks`, but the live endpoint rejects a body that
sends both, even with `contexts` empty; `checks` alone is what it accepts, so
`contexts` is left out entirely.

`enforce_admins` is deliberately `false`. The release procedure above pushes
`main` directly, and enforcing protection on the maintainer would force
releases through a pull request — a squash merge would then rewrite the commit
and leave the annotated release tag on a SHA that never reaches `main`. Do not
"tighten" this setting without reading that procedure first.

Verify with:

```bash
gh repo view --json squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,deleteBranchOnMerge
```

```bash
gh api repos/{owner}/{repo}/branches/main/protection --jq '{checks: [.required_status_checks.checks[].context], strict: .required_status_checks.strict, reviews: .required_pull_request_reviews, admins: .enforce_admins.enabled}'
```

## Release milestones

Each planned release gets one GitHub milestone, which is the public roadmap:
<https://github.com/FlowChargeApp/flowcharge-core/milestones>.

1. **Name.** A milestone's title is exactly the tag that will carry it — `v0.2.0`,
   `v0.3.0`, `v1.0.0`. Nothing else is ever a milestone title.
2. **Existence.** One open milestone represents the next release. It is created
   immediately after the previous release closes, so the roadmap is never blank.
   A second, later milestone is created only when an accepted issue is
   deliberately deferred past the next release.
3. **Membership.** An issue joins a milestone when it carries both `accepted`
   and `enhancement`, and the maintainer has chosen the release it lands in.
   Nothing else joins a milestone.
4. **Draining.** Before a release is cut, every issue still open in that
   milestone moves to a later milestone or leaves every milestone, so a closed
   milestone is an honest record of what that version shipped.
5. **Closing.** The milestone closes after the tag is pushed and the CI release
   job has published the asset — never before the push, and never automatically.

`gh` has no `milestone` subcommand, so create and close go through `gh api`;
assign and drain use the first-class `--milestone` flags `gh issue edit` and
`gh issue list` already carry. `{owner}` and `{repo}` expand from the working
directory's repository.

**Create** the next milestone:

```bash
gh api repos/{owner}/{repo}/milestones \
  -f title='v0.2.0' \
  -f description='One sentence naming what this release is about.'
```

**Assign** an accepted enhancement to it, by milestone title:

```bash
gh issue edit <issue-number> --milestone v0.2.0
```

**Drain** before releasing — list what is still open, then move or unassign each:

```bash
gh issue list --milestone v0.2.0 --state open
gh issue edit <issue-number> --milestone v0.3.0     # or --remove-milestone
```

**Close** after the tag is pushed. The PATCH needs the milestone *number*, not
its title, so the listing comes first:

```bash
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.number) \(.title) \(.state)"'
gh api --method PATCH repos/{owner}/{repo}/milestones/<number> -f state=closed
```

Write any state filter in a listing call as a `?state=` query string, for
example `repos/{owner}/{repo}/milestones?state=all`. Never filter a listing's
state with a bare `-f` flag: any `-f` field switches `gh api` to POST unless `--method` overrides it, and would attempt to create an untitled milestone. The
close call's `-f state=closed` is the deliberate exception: it names `--method PATCH` explicitly.

## Issue labels

`node .github/scripts/setup-labels.mjs` reconciles the repository's issue-triage label
set against the six-entry table in the script itself, printing the difference by
default and performing it under `--apply`; it is safe to re-run.

## Versions in a SKILL.md

The `metadata.version` value in a `SKILL.md` is a derived value. The release
command writes it. Never edit it by hand.
