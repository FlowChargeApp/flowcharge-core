# Pinned issues

This is not an issue template directory — GitHub does not treat it specially. It
holds the body of every pinned issue as a markdown file, plus the `gh` commands to
publish and update each one.

Currently one pinned issue exists. A second (a Roadmap issue) may be added to this
same folder and this same README later, once its content is decided.

## How feature requests work here

Backed by `how-feature-requests-work.md`.

**Create**, once:

```bash
gh issue create --title 'How feature requests work here' \
  --body-file .github/pinned-issues/how-feature-requests-work.md
```

**Pin**, right after creating it:

```bash
gh issue pin <number>
```

**Re-publish**, for any correction:

```bash
gh issue edit <number> --body-file .github/pinned-issues/how-feature-requests-work.md
```

**Verify** it is pinned:

```bash
gh issue list --state all --limit 200 --json number,title,isPinned \
  --jq '[.[] | select(.isPinned)] | {count: length, issues: [.[] | .title]}'
```

`--limit 200` is required, not decoration: `gh issue list` defaults to 30 results,
newest first, so once the repository holds more than 30 issues this early-numbered
pinned one would sit outside the default window and the count would under-report.

No `--label` and no `--milestone` flag is ever passed on create — the pinned issue
is deliberately unlabelled and unmilestoned. The issue is never locked: GitHub
disables reactions on a locked conversation for every user, and reactions are this
repository's voting mechanism.

## The update habit

This body is edited in the file, never in GitHub's web editor. A web-editor edit
goes stale the moment someone next runs `gh issue edit --body-file`, which silently
overwrites it with whatever the file holds. The habit: edit the file, commit it,
then run the re-publish command above.
