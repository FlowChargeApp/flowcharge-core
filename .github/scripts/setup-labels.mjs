#!/usr/bin/env node
// Reconciles the public repository's whole issue-triage label set against one
// constant six-entry table, through the gh CLI. A brand-new GitHub repository
// is not empty of labels — it carries nine defaults — so this is a reconcile,
// not a create: some labels are created, some are updated in place, and every
// label outside the table is deleted. No dependencies; node >= 16.
//
// It handles no credential. gh holds the token in its own keychain-backed
// store, and the maintainer runs `gh auth login` themselves; this script
// never runs that command, never reads a token from a file, an environment
// variable or an argument, and never prints one.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import { spawnSync } from 'node:child_process';

const HELP = `setup-labels.mjs — reconciles the public repository's issue-triage labels.

Usage:
  node .github/scripts/setup-labels.mjs            report the difference; write nothing
  node .github/scripts/setup-labels.mjs --apply    perform the difference
  node .github/scripts/setup-labels.mjs --help

With no flags, the command reads the live label set through gh, prints one
line per planned create, update and delete, and makes no mutating gh call.
--apply performs the difference: every create and update runs first, as
\`gh label create <name> --color <hex> --description <text> --force\`, then
every delete runs, as \`gh label delete <name> --yes\`. A label already
matching the table gets no call at all, which is what makes --apply
idempotent — running it twice changes nothing the second time.

The target repository is resolved from the working directory's git remote,
the way every gh subcommand resolves it. There is no --repo flag.

Exit codes:
  0  the report printed, or the apply completed
  1  a refusal, or a gh call failed; on a refusal nothing was written

Refusals, checked in this order, before any label list is read and before any
write: an argument other than --apply; a table description over GitHub's
100-character cap; gh not on PATH; gh auth status exiting non-zero (the
command prints "gh auth login" as the fix and never runs it); gh repo view
failing, or succeeding with a url whose host is not github.com.
`;

// The six labels this repository carries, in the order PLN-51-w6o0l9's
// Design table states them. name is compared case-insensitively against the
// live set, because GitHub will not hold both "Bug" and "bug". Exported so
// the test harness can read it back without spawning gh.
export const LABELS = [
  { name: 'bug', color: 'd73a4a', description: "Something in FlowCharge behaves incorrectly" },
  { name: 'enhancement', color: 'a2eeef', description: 'A request for new or changed behaviour' },
  { name: 'accepted', color: '0e8a16', description: 'The maintainer intends to implement this' },
  { name: 'declined', color: 'b60205', description: 'The maintainer will not implement this' },
  { name: 'needs-info', color: 'fbca04', description: 'Waiting on more detail from the reporter' },
  { name: 'format-change', color: '5319e7', description: 'Changes the on-disk format an existing flowcharge folder depends on' },
];

// GitHub's own cap on a label description. Checked at start-up against every
// table entry, so a bad description is a refusal before any gh call rather
// than a 422 halfway through an apply.
const DESCRIPTION_MAX = 100;

// Pure: takes the desired table and the live label list, returns the
// difference. No gh call inside it, so the test harness exercises it through
// the command's own dry-run output rather than a separate unit case — every
// branch is reachable that way. Exported anyway, for the harness's own use.
//
//   create    — a table entry with no live label of that name.
//   update    — a live label of that name whose colour or description differs.
//   delete    — a live label whose name is in no table entry.
//   unchanged — a live label already matching its table entry exactly.
//
// Names compare case-insensitively; colours and descriptions compare exactly.
export function planLabelChanges(desired, actual) {
  const byLowerName = new Map(actual.map((l) => [l.name.toLowerCase(), l]));
  const create = [];
  const update = [];
  const unchanged = [];
  const claimed = new Set();

  for (const want of desired) {
    const live = byLowerName.get(want.name.toLowerCase());
    if (!live) {
      create.push(want);
      continue;
    }
    claimed.add(live.name.toLowerCase());
    if (live.color !== want.color || live.description !== want.description) {
      update.push(want);
    } else {
      unchanged.push(want);
    }
  }

  const del = actual.filter((l) => !claimed.has(l.name.toLowerCase()));

  return { create, update, delete: del, unchanged };
}

function refuse(message) {
  console.error(`setup-labels: ${message}`);
  process.exit(1);
}

// Runs gh and returns { status, stdout, stderr }. Never throws on a non-zero
// exit — every caller decides for itself what a failure means here, because
// "gh repo view failed" and "gh label list failed" are refused differently.
function runGh(args) {
  const res = spawnSync('gh', args, { encoding: 'utf8' });
  if (res.error) {
    refuse(`could not run gh — is it installed and on PATH? (${res.error.message})`);
  }
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function main() {
  const argv = process.argv.slice(2);

  // --help takes precedence over everything else, including an unknown flag
  // and every later refusal, so it always answers and never calls gh.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const apply = argv.includes('--apply');
  const unknown = argv.find((a) => a !== '--apply');
  if (unknown) {
    refuse(`unknown argument ${JSON.stringify(unknown)} — the only flag is --apply`);
  }

  for (const label of LABELS) {
    if (label.description.length > DESCRIPTION_MAX) {
      refuse(`label "${label.name}"'s description is ${label.description.length} characters, over GitHub's ${DESCRIPTION_MAX}-character cap`);
    }
  }

  const version = runGh(['--version']);
  if (version.status !== 0) {
    refuse('gh --version failed — install the gh CLI first');
  }

  const auth = runGh(['auth', 'status']);
  if (auth.status !== 0) {
    refuse('not authenticated — run `gh auth login` yourself, then re-run this command');
  }

  const repo = runGh(['repo', 'view', '--json', 'nameWithOwner,url']);
  if (repo.status !== 0) {
    refuse('gh repo view failed — this working directory\'s git remote is not a host gh knows');
  }
  let repoInfo;
  try {
    repoInfo = JSON.parse(repo.stdout);
  } catch {
    refuse('gh repo view returned output that was not valid JSON');
  }
  let host;
  try {
    host = new URL(repoInfo.url).host;
  } catch {
    refuse(`gh repo view returned a url that could not be parsed: ${JSON.stringify(repoInfo.url)}`);
  }
  if (host !== 'github.com') {
    refuse(`this working directory's repository host is "${host}", not github.com — refusing to touch labels on a repository that is not the public GitHub one`);
  }

  const list = runGh(['label', 'list', '--json', 'name,color,description', '--limit', '200']);
  if (list.status !== 0) {
    refuse(`gh label list failed: ${list.stderr.trim()}`);
  }
  let live;
  try {
    live = JSON.parse(list.stdout);
  } catch {
    refuse('gh label list returned output that was not valid JSON');
  }

  const plan = planLabelChanges(LABELS, live);

  for (const l of plan.create) console.log(`create ${l.name}`);
  for (const l of plan.update) console.log(`update ${l.name}`);
  for (const l of plan.delete) console.log(`delete ${l.name}`);

  if (!apply) {
    console.log(`${plan.create.length} create, ${plan.update.length} update, ${plan.delete.length} delete, ${plan.unchanged.length} unchanged — dry run, nothing written`);
    process.exit(0);
  }

  // Create and update first, delete second: a failure part-way then leaves a
  // repository that already carries the six correct labels and only some
  // stale extras — never a repository with no triage labels at all. An entry
  // in unchanged gets no call at all, which is what makes this idempotent.
  for (const l of [...plan.create, ...plan.update]) {
    const res = runGh(['label', 'create', l.name, '--color', l.color, '--description', l.description, '--force']);
    if (res.status !== 0) {
      refuse(`gh label create ${l.name} failed: ${res.stderr.trim()}`);
    }
  }
  for (const l of plan.delete) {
    const res = runGh(['label', 'delete', l.name, '--yes']);
    if (res.status !== 0) {
      refuse(`gh label delete ${l.name} failed: ${res.stderr.trim()}`);
    }
  }

  console.log(`${plan.create.length} created, ${plan.update.length} updated, ${plan.delete.length} deleted, ${plan.unchanged.length} already correct`);
  process.exit(0);
}

// Guard the entry point so importing this module — the test harness's case
// L6 imports LABELS directly — runs no gh call and does no work.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
