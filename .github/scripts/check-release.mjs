#!/usr/bin/env node
// The read-only release verifier CI calls. Given one version, it confirms that
// every discovered skills/*/SKILL.md carries that version in its
// metadata.version and that the newest CHANGELOG.md release heading names it.
// It writes nothing at all. No dependencies; node >= 16.
//
// Module boundary: this file knows the SKILL.md frontmatter shape, CHANGELOG.md
// and its own repository root. It never calls git and never reads a tag — the
// caller passes the version it must agree with, which is what keeps this script
// testable without a git repository.
//
// It carries its own small regex read of metadata.version rather than importing
// the stamper's. stamp-skill-versions.mjs calls main() at module scope, so
// importing it would execute a writer inside a CI job. The duplication is
// deliberate and is pinned by the round-trip case in run-tests.mjs, which
// stamps a fixture with the real stamper and then verifies it with this file.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';

const HELP = `check-release.mjs — verifies that every stamped skill version and the newest CHANGELOG.md heading agree with one given release version.

Usage:
  node .github/scripts/check-release.mjs <X.Y.Z>
  node .github/scripts/check-release.mjs --help

The one positional argument must be a bare three-part version number: three
groups of digits separated by dots, with no leading "v" and no pre-release
or build suffix (so "0.2.0", never "v0.2.0", "0.2", or "0.2.0-rc.1"). CI
passes the pushed tag with its leading "v" stripped.

It reads no git tag and makes no git call. It writes nothing.

Every disagreement is collected and printed, naming the file, the value it
carries and the value it should carry. The run does not stop at the first
one, so one CI log names the whole problem.

--help  Print this text on stdout and exit 0, before any argument parsing
        that could fail.

Exit codes:
  0  Every discovered skill file and the newest CHANGELOG.md heading carry
     the given version.
  1  Invalid argument, or at least one disagreement. Every disagreement was
     printed.
`;

// This script's own repository root, derived from its own file location: the
// script sits at .github/scripts/check-release.mjs, two directories below the
// repository root. Never from process.cwd(), so a copy placed inside a fixture
// at <fixture>/.github/scripts/ reads that fixture's own skills/ tree and its
// own CHANGELOG.md, and nothing else.
const SELF_ROOT = path.resolve(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..', '..',
);

const CHANGELOG_MD = path.join(SELF_ROOT, 'CHANGELOG.md');

// A bare three-part version: no leading "v", no pre-release or build suffix.
const VERSION_ARG = /^\d+\.\d+\.\d+$/;

// The newest release heading in CHANGELOG.md. This is character-for-character
// the regex checkSuiteVersion uses in fc-index.mjs, so the two readers agree by
// construction. The first match wins and it is not anchored to the top of the
// file, so an "## Unreleased" heading above the release heading is read past.
const CHANGELOG_HEADING = /^## (\d+\.\d+\.\d+)/m;

// Every immediate child of skills/ that holds a SKILL.md, sorted for a
// deterministic report order. The same discovery rule listSkillFiles() uses in
// stamp-skill-versions.mjs: no skill name and no skill count is written here.
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

// The documented shape from VERSIONING.md: a `metadata:` line inside the
// frontmatter block, then an indented `version: "..."` line before the closing
// `---`. The current value only — this reader never rewrites, so it needs no
// splice offsets. Returns null when the file does not carry the shape.
function readVersion(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const body = fm[1];
  const metaIdx = body.search(/^metadata:[ \t]*$/m);
  if (metaIdx === -1) return null;
  const versionMatch = body.slice(metaIdx).match(/^[ \t]+version:[ \t]*"([^"]*)"[ \t]*$/m);
  return versionMatch ? versionMatch[1] : null;
}

function main() {
  const argv = process.argv.slice(2);

  // --help takes precedence over everything else, including a missing or
  // invalid version argument, so it always answers.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const version = argv.find((a) => !a.startsWith('--'));
  if (!version || !VERSION_ARG.test(version)) {
    console.error(
      `check-release: invalid version argument ${JSON.stringify(version || '')} — expected a bare X.Y.Z, e.g. 0.2.0`,
    );
    process.exit(1);
  }

  // Every disagreement is collected first and printed second. A verifier that
  // exited on the first one would report the right exit code and the wrong
  // problem, and a maintainer would need one CI run per stamped file.
  const problems = [];

  const files = listSkillFiles(path.join(SELF_ROOT, 'skills'));
  if (files.length === 0) {
    problems.push(`no skill file was discovered under ${path.join(SELF_ROOT, 'skills')}`);
  }
  for (const file of files) {
    const rel = path.relative(SELF_ROOT, file);
    const found = readVersion(fs.readFileSync(file, 'utf8'));
    if (found === null) {
      problems.push(`${rel}: no metadata.version in the documented shape, expected "${version}"`);
    } else if (found !== version) {
      problems.push(`${rel}: metadata.version is "${found}", expected "${version}"`);
    }
  }

  if (!fs.existsSync(CHANGELOG_MD)) {
    problems.push(`CHANGELOG.md: missing, expected a newest release heading of "${version}"`);
  } else {
    const heading = fs.readFileSync(CHANGELOG_MD, 'utf8').match(CHANGELOG_HEADING);
    if (!heading) {
      problems.push(`CHANGELOG.md: no "## X.Y.Z" release heading at all, expected "${version}"`);
    } else if (heading[1] !== version) {
      problems.push(`CHANGELOG.md: the newest release heading is "${heading[1]}", expected "${version}"`);
    }
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(`check-release: ${problem}`);
    console.error(`check-release: ${problems.length} disagreement(s) with ${version}`);
    process.exit(1);
  }

  console.log(`check-release: ${files.length} skill file(s) and CHANGELOG.md all carry ${version}`);
  process.exit(0);
}

main();
