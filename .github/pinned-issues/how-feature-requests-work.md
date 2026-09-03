GitHub issues are the single channel for feature requests here. There is no
Discussions category, no Projects board, and no other route in.

## How an issue moves

Every issue gets `bug` or `enhancement` first. From there it gets one of
`accepted`, `declined` or `needs-info`. A sixth label, `format-change`, is
orthogonal to the rest: it marks a change that alters the on-disk format an
existing `flowcharge/` folder depends on — frontmatter keys, the status enum,
ID shapes, or folder layout.

There are no priority labels. These six glosses summarise; the labels' own
descriptions on GitHub are the authority, so a small wording difference
between the two is not a contradiction.

## How to vote

A thumbs-up reaction on an issue's opening comment is the vote. A "+1"
comment is not — it notifies everyone watching the issue and does not move
the count that matters. The reaction count is the priority signal, and the
current ordering is always visible with:

```
is:issue is:open label:enhancement sort:reactions-+1-desc
```

## Who implements this

The maintainer, working solo. Nothing here auto-labels, auto-closes or
auto-replies — if an issue sits quietly, that is a person being busy, not a
bot ignoring you.

## The rules

The full procedure — commit conventions, the release process, and how
release milestones work — lives in
[CONTRIBUTING.md](https://github.com/FlowChargeApp/flowcharge-core/blob/main/CONTRIBUTING.md).
This issue is a summary, not a substitute for it.
