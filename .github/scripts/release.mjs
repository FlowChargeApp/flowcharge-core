#!/usr/bin/env node
// The maintainer-only release command. It refuses a bad state, stamps every
// skills/*/SKILL.md with the given version through stamp-skill-versions.mjs,
// commits that stamp, then creates the annotated tag vX.Y.Z. It never pushes:
// pushing is outward-facing and stays a deliberate human act.
//
// It computes nothing. The maintainer chooses the version by hand, writes the
// matching CHANGELOG.md heading first, then passes the same version here. No
// dependencies; node >= 16.
//
// Module boundary: this file knows git, CHANGELOG.md and the stamper's CLI
// contract. It never opens a SKILL.md and never learns the metadata.version
// frontmatter shape — that knowledge lives in the stamper alone. Listing the
// skills/ subdirectories so each SKILL.md can be staged by its own explicit
// path is directory enumeration, not frontmatter parsing, so it stays inside
// the boundary.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HELP = `release.mjs — cuts the local release commit and the annotated tag for one FlowCharge Core version.

Usage:
  node .github/scripts/release.mjs <X.Y.Z>
  node .github/scripts/release.mjs --help

The one positional argument must be a bare three-part version number: three
groups of digits separated by dots, with no leading "v" and no pre-release
or build suffix (so "0.2.0", never "v0.2.0", "0.2", or "0.2.0-rc.1").

Edit CHANGELOG.md first. This command reads the newest "## X.Y.Z" heading
there and refuses to run when it disagrees with the argument.

Before it writes anything it refuses, in this order, when:
  - the argument is not a bare X.Y.Z;
  - the current branch is not main;
  - the tracked working tree is dirty (untracked files are ignored);
  - CHANGELOG.md is missing, holds no "## X.Y.Z" heading, or its newest
    such heading is not the given version;
  - the tag vX.Y.Z already exists.

It then stamps every discovered skills/*/SKILL.md through
.github/scripts/stamp-skill-versions.mjs, stages those files by explicit
path, commits them as "chore(release): vX.Y.Z", and creates the annotated
tag vX.Y.Z. It also regenerates skills/manifest.json and stages it with
them. A tree that is already stamped and already committed keeps its
commit: nothing is staged, so the commit is skipped and the tag is placed
on HEAD.

It never pushes. It prints the two push commands to run next.

--help  Print this text on stdout and exit 0, before any argument parsing
        that could fail, and before any git call.

Exit codes:
  0  The release commit — or the already-committed HEAD — now carries the
     annotated tag vX.Y.Z.
  1  A refusal, or a stamper failure. No commit was made and no tag was
     created.
`;

// This script's own directory, and the repository root two directories above
// it, both derived from its own file location. Never from process.cwd(): the
// command must behave the same run from a subdirectory as run from the root,
// and a copy placed inside a fixture repository must act on that fixture and
// on nothing else. The root is where CHANGELOG.md is read, where skills/ is
// enumerated, and the cwd of every git call.
const SELF_DIR = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const SELF_ROOT = path.resolve(SELF_DIR, '..', '..');

const STAMPER = path.join(SELF_DIR, 'stamp-skill-versions.mjs');
const MANIFEST = path.join(SELF_DIR, 'manifest.mjs');
const CHANGELOG_MD = path.join(SELF_ROOT, 'CHANGELOG.md');
const MANIFEST_JSON = path.join(SELF_ROOT, 'skills', 'manifest.json');

// The only branch a release is cut from. Hard-coded on purpose: there is no
// flag, because a release from anywhere else is a mistake, not an option.
const RELEASE_BRANCH = 'main';

// A bare three-part version: no leading "v", no pre-release or build suffix.
const VERSION_ARG = /^\d+\.\d+\.\d+$/;

// The newest release heading in CHANGELOG.md. This is character-for-character
// the regex checkSuiteVersion uses at
// skills/flowcharge/scripts/fc-index.mjs:851, so the two readers agree by
// construction. It is not anchored to the top of the file and the first match
// wins, so an "## Unreleased" heading above the release heading is read past.
const CHANGELOG_HEADING = /^## (\d+\.\d+\.\d+)/m;

function fail(message) {
  console.error(`release: ${message}`);
  process.exit(1);
}

// git, always against this script's own repository root. A non-zero exit is a
// hard failure unless the caller is asking a question whose answer is the exit
// code itself.
function git(args, { allowFailure = false } = {}) {
  const res = spawnSync('git', args, { cwd: SELF_ROOT, encoding: 'utf8' });
  if (res.error) fail(`could not run git ${args.join(' ')}: ${res.error.message}`);
  if (!allowFailure && res.status !== 0) {
    fail(`git ${args.join(' ')} failed:\n${(res.stderr || '').trimEnd()}`);
  }
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// Every immediate child of skills/ that holds a SKILL.md, sorted, exactly as
// the stamper discovers them. The number of skills is never fixed and no name
// is ever written here.
function listSkillFiles(skillsDir) {
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(skillsDir, e.name, 'SKILL.md'))
    .filter((p) => fs.existsSync(p))
    .sort();
}

// { missing: true } when there is no CHANGELOG.md at all; otherwise the newest
// release version it names, or null when it names none.
function newestChangelogVersion() {
  if (!fs.existsSync(CHANGELOG_MD)) return { missing: true, version: null };
  const text = fs.readFileSync(CHANGELOG_MD, 'utf8');
  const match = text.match(CHANGELOG_HEADING);
  return { missing: false, version: match ? match[1] : null };
}

function main() {
  const argv = process.argv.slice(2);

  // Step 1. --help takes precedence over everything else, including a missing
  // or invalid version argument, so it always answers — before any argument
  // parsing that could fail, before any git call, and before any write.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  // Step 2. The one positional argument.
  const version = argv.find((a) => !a.startsWith('--'));
  if (!version || !VERSION_ARG.test(version)) {
    fail(`invalid version argument ${JSON.stringify(version || '')} — expected a bare X.Y.Z, e.g. 0.2.0`);
  }
  const tag = `v${version}`;

  // Step 3. The branch.
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  if (branch !== RELEASE_BRANCH) {
    fail(`the current branch is ${JSON.stringify(branch)}, not ${RELEASE_BRANCH} — a release is cut from ${RELEASE_BRANCH} only`);
  }

  // Step 4. The tracked working tree. Untracked files are ignored on purpose:
  // a maintainer's scratch file is not a reason to refuse a release, and
  // nothing untracked can reach the release commit, which stages by path.
  const dirty = git(['status', '--porcelain', '--untracked-files=no']).stdout;
  if (dirty.trim() !== '') {
    fail(`the tracked working tree is dirty — commit or stash it first:\n${dirty.trimEnd()}`);
  }

  // Step 5. The changelog. Its newest release heading is the authored version,
  // and it must be the version being released.
  const changelog = newestChangelogVersion();
  if (changelog.missing) {
    fail(`no CHANGELOG.md at ${SELF_ROOT} — write the ${version} entry first`);
  }
  if (changelog.version === null) {
    fail('CHANGELOG.md holds no "## X.Y.Z" release heading — write the entry first, unbracketed');
  }
  if (changelog.version !== version) {
    fail(`CHANGELOG.md's newest release heading is ${changelog.version}, not ${version} — the changelog and the argument must agree`);
  }

  // Step 6. The tag. This check runs before the stamper, not after it: without
  // it, a re-run of a completed release would commit the stamp and only then
  // fail at the tag step, which breaks the all-or-nothing property.
  const existingTag = git(['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { allowFailure: true });
  if (existingTag.status === 0) {
    fail(`the tag ${tag} already exists — that release is cut; nothing was stamped, committed or tagged`);
  }

  // Step 7. The stamper, as a child process, resolved from this file's own
  // directory. Its contract is all-or-nothing: exit 0 means every discovered
  // SKILL.md carries the version, exit 1 means nothing was written.
  const stamp = spawnSync(process.execPath, [STAMPER, version], { cwd: SELF_ROOT, stdio: 'inherit' });
  if (stamp.error) {
    fail(`could not run ${path.relative(SELF_ROOT, STAMPER)}: ${stamp.error.message}`);
  }
  if (stamp.status !== 0) {
    fail(`${path.relative(SELF_ROOT, STAMPER)} exited ${stamp.status} — nothing was committed and no tag was created`);
  }

  // Step 7b. The manifest generator, also as a child process resolved from
  // this file's own directory, and given the same validated version string the
  // stamper was given — one typed value reaches both steps. It runs after the
  // stamp, so it records the versions this run just wrote rather than the
  // previous release's, and before anything is staged, so one commit carries a
  // self-consistent release. Its refusal means the tree is not releasable: its
  // own message has already reached the operator through the inherited stderr,
  // so the release stops here, with nothing staged, committed or tagged.
  const manifest = spawnSync(process.execPath, [MANIFEST, version], { cwd: SELF_ROOT, stdio: 'inherit' });
  if (manifest.error) {
    fail(`could not run ${path.relative(SELF_ROOT, MANIFEST)}: ${manifest.error.message}`);
  }
  if (manifest.status !== 0) {
    fail(`${path.relative(SELF_ROOT, MANIFEST)} exited ${manifest.status} — nothing was committed and no tag was created`);
  }

  // Step 8. Stage the discovered SKILL.md paths and the manifest step 7b just
  // wrote, each by its own explicit path, so the release commit can hold
  // nothing else whatever the working tree looks like. No whole-tree stage, and
  // no fixed list of skill names.
  const skillFiles = listSkillFiles(path.join(SELF_ROOT, 'skills'))
    .map((p) => path.relative(SELF_ROOT, p));
  const stagePaths = [...skillFiles, path.relative(SELF_ROOT, MANIFEST_JSON)];
  git(['add', '--', ...stagePaths]);

  const nothingStaged = git(['diff', '--cached', '--quiet'], { allowFailure: true }).status === 0;
  let committed = false;
  if (nothingStaged) {
    // The recovery path for a run that stamped and committed but failed before
    // tagging, and the path the first release takes, because every file
    // already carries its version.
    console.log(`release: every SKILL.md already carries ${version} and is already committed — skipping the release commit, tagging HEAD`);
  } else {
    git(['commit', '-q', '-m', `chore(release): ${tag}`]);
    committed = true;
  }

  // Step 9. The annotated tag.
  git(['tag', '-a', tag, '-m', `FlowCharge Core ${tag}`]);

  // Step 10. Report, and hand the two pushes back to the maintainer.
  const sha = git(['rev-parse', 'HEAD']).stdout.trim();
  console.log('');
  console.log(`  commit  ${sha}${committed ? '' : '  (existing HEAD — no release commit was needed)'}`);
  console.log(`  tag     ${tag}  (annotated, "FlowCharge Core ${tag}")`);
  console.log('');
  console.log('Nothing has been pushed. Run these two commands yourself when you are ready:');
  console.log(`  git push origin ${RELEASE_BRANCH}`);
  console.log(`  git push origin ${tag}`);
  process.exit(0);
}

main();
