# fc-git: operations

The fc-git skill's sections for init, merge, rebase, worktrees, stashing, tags and pushing. `SKILL.md` in this folder holds the workflow, the risk tiers and the hard rules, which bind every operation here; read both before any of these operations.

## Init (new project)
```bash
git init -b main
# detect the stack from project files, THEN write .gitignore, THEN first commit
git add .gitignore <scaffold paths>
git commit -m "Initial commit"
```
The .gitignore comes before the first commit because committed junk (node_modules,
build output, .env) pollutes history forever even after later removal. Detect the
stack from what's actually in the directory (package.json → node; pyproject.toml →
python; etc.) and write an appropriate .gitignore. Offer remote setup
(`gh repo create` / `git remote add`). Offer, don't assume; not every project wants
a remote on day one.

## Merging & rebasing
**The golden rule: rebase local/private history freely; NEVER rewrite history that
exists on a shared remote.** Rewriting published commits strands everyone who has
them. Check with `git branch -r --contains <sha>` if unsure whether commits are
published.

Before merging: working tree clean (verify, don't assume), target branch current
(`git fetch` + check ahead/behind). Then:

```bash
git switch main && git pull --ff-only
git merge --no-ff feature/x        # default when history shows no other convention
```

Merge style: detect the repo's convention from `git log --graph --oneline` (merge
commits vs squash vs linear) and follow it; when there's no signal, use an explicit
merge commit (`--no-ff`) so feature boundaries stay visible.

On conflicts: resolve file-by-file. For anything non-mechanical, show the user both
sides before choosing. Never resolve a conflict by silently discarding one side's
logic, and never take "ours"/"theirs" wholesale without showing what the discarded
side contained. A conflict means two authors changed the same code. Deleting
one author's work silently causes regressions. After resolving, verify the result
with the project's own build/type-check if one is available, before declaring the
merge done.

Rebase (local-only history, or with confirmation otherwise):
```bash
git rebase main                    # never rebase -i; it's interactive
```
For history editing use non-interactive equivalents (`git commit --amend` for the
tip, `git rebase --onto` for surgery), and only on unpublished commits.

## Worktrees
Prefer worktrees over stash juggling for parallel work on multiple branches. Each
branch gets a real directory, nothing is in limbo.

```bash
git worktree add ../<repo-name>-<branch-suffix> <branch>       # existing branch
git worktree add ../<repo-name>-hotfix -b fix/urgent main      # new branch
git worktree list
git worktree remove <path>         # confirm first; check for dirty state before
```
Create them under a consistent sibling path (`../<repo>-<purpose>`). Periodically
list and offer to clean up stale ones (with confirmation) rather than accumulating
them.

## Stashing
```bash
git stash push -m "WIP: <what and why>"     # never a bare `git stash`
git stash list                              # surface stashes older than a few days
git stash pop                               # or `apply` if the stash should survive
```
A bare stash carries no message, so you cannot tell later what it holds. The stash
is a short-term shelf, not storage. Surface aging stashes when you see them in
`git stash list`. Anything that must survive deserves a WIP commit on a branch
instead: commits are on the reflog, named, and pushable; stashes are none of those.

## Tags & releases
```bash
git tag -a v1.2.0 -m "Release v1.2.0: <what this release contains>"
git push origin v1.2.0             # confirm first, outward-facing
```
Always annotated (`-a`), never lightweight. Annotated tags carry author, date, and
a message stating what the release contains or points to; lightweight tags are bare
pointers with no context.

## Remotes & pushing
Hosting default: GitHub with the `gh` CLI (`gh repo create`, and `gh pr create`
after a push when the user wants a PR. That's in scope).

Before any push, fetch and review divergence:
```bash
git fetch origin
git status                         # ahead/behind
git log --oneline @{u}..HEAD       # exactly what would be pushed
git push -u origin <branch>
```

If a push is rejected, DIAGNOSE. The remote has commits you don't. Fetch, look at
the divergence, then choose to rebase or merge. Never override a rejection with force.
`--force-with-lease` is the only permitted force variant, and only after explicit
confirmation with the reason stated (e.g. "re-pushing a rebased private branch only
I work on"). Plain `--force` is never used: it overwrites without checking whether
the remote moved, which is precisely how teammates' commits vanish.

Protected branches: `main` (and `master` where it's the default). Every push to or
merge into one is confirm-unless-directly-ordered, per the tier list in SKILL.md.
