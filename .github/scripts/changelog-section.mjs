#!/usr/bin/env node
// The read-only CHANGELOG.md section reader CI calls. Given one version, it
// prints the body of that version's release section on stdout, without the
// heading line and without the blank lines around it. It writes nothing at all.
// No dependencies; node >= 16.
//
// Module boundary: this file knows CHANGELOG.md, its own repository root and
// the release heading shape. It never calls git, never reads a tag, never
// learns what its output is used for, and never knows an API, a payload shape,
// the SKILL.md frontmatter or the tree of skill folders. The caller passes the
// version it must find, which is what keeps this script testable without a git
// repository.
//
// Everything it prints on stdout is the section text, so a caller may redirect
// stdout straight into a file. A refusal therefore prints nothing at all on
// stdout: one stray line would be carried along with the section.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';

const HELP = `changelog-section.mjs — prints the CHANGELOG.md release section for one given version on stdout.

Usage:
  node .github/scripts/changelog-section.mjs <X.Y.Z>
  node .github/scripts/changelog-section.mjs --help

The one positional argument must be a bare three-part version number: three
groups of digits separated by dots, with no leading "v" and no pre-release
or build suffix (so "0.2.0", never "v0.2.0", "0.2", or "0.2.0-rc.1"). CI
passes the pushed tag with its leading "v" stripped.

The heading line itself is not printed, and the blank lines above and below
the section text are removed. The section ends at the next line that starts
with "## ", whichever version it names, or at the end of the file. An
"## Unreleased" heading is such a line, so a section above one stops there.

Any release section in the file can be read, not only the newest one.

It reads no git tag and makes no git call. It writes nothing, and it prints
nothing on stdout except the section text.

--help  Print this text on stdout and exit 0, before any argument parsing
        that could fail and before any file is read.

Exit codes:
  0  The section was found and printed on stdout.
  1  Invalid argument, a missing CHANGELOG.md, a version no heading names,
     or a section holding no text. Nothing was printed on stdout and one
     named reason was printed on stderr.
`;

// This script's own repository root, derived from its own file location: the
// script sits at .github/scripts/changelog-section.mjs, two directories below
// the repository root. Never from the directory the caller runs in, so a copy
// placed inside a fixture at <fixture>/.github/scripts/ reads that fixture's
// own CHANGELOG.md, and nothing else.
const SELF_ROOT = path.resolve(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..', '..',
);

const CHANGELOG_MD = path.join(SELF_ROOT, 'CHANGELOG.md');

// A bare three-part version: no leading "v", no pre-release or build suffix.
const VERSION_ARG = /^\d+\.\d+\.\d+$/;

// A release heading and the version it names. This is the regex check-release.mjs
// and fc-index.mjs use, without the m flag, because it is applied to one line at
// a time: this reader needs the heading that names the requested version, which
// may be any release in the file, not the first heading in the file.
const CHANGELOG_HEADING = /^## (\d+\.\d+\.\d+)/;

// Where a section ends: the next heading of any kind at this level, so an
// "## Unreleased" heading closes the section above it just as a release
// heading does.
const SECTION_END = /^## /;

function refuse(reason) {
  console.error(`changelog-section: ${reason}`);
  process.exit(1);
}

// The lines after the heading that names version, up to the next "## " line or
// the end of the file, with the blank lines at both ends removed. Returns null
// when no heading names the version.
function readSection(lines, version) {
  const start = lines.findIndex((line) => {
    const heading = line.match(CHANGELOG_HEADING);
    return heading !== null && heading[1] === version;
  });
  if (start === -1) return null;

  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (SECTION_END.test(lines[i])) break;
    body.push(lines[i]);
  }

  while (body.length > 0 && body[0].trim() === '') body.shift();
  while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();
  return body.join('\n');
}

function main() {
  const argv = process.argv.slice(2);

  // --help takes precedence over everything else, including a missing or
  // invalid version argument and a missing CHANGELOG.md, so it always answers.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const version = argv.find((a) => !a.startsWith('--'));
  if (!version || !VERSION_ARG.test(version)) {
    refuse(
      `invalid version argument ${JSON.stringify(version || '')} — expected a bare X.Y.Z, e.g. 0.2.0`,
    );
  }

  if (!fs.existsSync(CHANGELOG_MD)) {
    refuse(`CHANGELOG.md: missing at ${CHANGELOG_MD}, expected a "## ${version}" release heading`);
  }

  const lines = fs.readFileSync(CHANGELOG_MD, 'utf8').split(/\r?\n/);
  const section = readSection(lines, version);
  if (section === null) {
    refuse(`CHANGELOG.md: no "## ${version}" release heading`);
  }
  if (section === '') {
    refuse(`CHANGELOG.md: the "## ${version}" section holds no text`);
  }

  process.stdout.write(`${section}\n`);
  process.exit(0);
}

main();
