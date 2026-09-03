#!/usr/bin/env node
// Writes a given release version into every skills/*/SKILL.md's
// metadata.version, at release time. It computes nothing: the maintainer
// chooses the version by hand and passes it as the one argument. No
// dependencies; node >= 16.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';

const HELP = `stamp-skill-versions.mjs — writes a given release version into every skills/*/SKILL.md's metadata.version.

Usage:
  node stamp-skill-versions.mjs <X.Y.Z>
  node stamp-skill-versions.mjs --help

The one positional argument must be a bare three-part version number: three
groups of digits separated by dots, with no leading "v" and no pre-release
or build suffix (so "0.2.0", never "v0.2.0", "0.2", or "0.2.0-rc.1").

It reads no CHANGELOG.md and no git tag. It trusts the version it is given.

It writes nothing at all if the argument fails validation, or if any
skills/*/SKILL.md fails the documented metadata.version shape check — the
run is all-or-nothing, validated in full before any file is touched. A file
whose metadata.version already equals the target is left untouched.

--help  Print this text on stdout and exit 0, before any argument parsing
        that could fail.

Exit codes:
  0  Every valid skills/*/SKILL.md now carries the given version.
  1  Invalid argument, or a SKILL.md that fails the shape check. Nothing
     was written.
`;

// This script's own repository root, derived from its own file location:
// the script sits at .github/scripts/stamp-skill-versions.mjs, two
// directories below the repository root. There is no --root flag —
// this script has exactly one legitimate target, the repository it ships
// from, and accepting an arbitrary root would let it be pointed at some
// other project's skills/ tree by mistake. It lives under .github/ so
// that neither documented install method can copy it onto a user's
// machine, where the old three-parent walk resolved to the whole skills
// directory and would have rewritten unrelated skills.
const SELF_ROOT = path.resolve(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..', '..',
);

function writeAtomic(filePath, content) {
  const tmpPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  try {
    fs.writeFileSync(tmpPath, content);
    fs.renameSync(tmpPath, filePath);
  } catch (e) {
    try { fs.unlinkSync(tmpPath); } catch { /* tmp may not exist yet — ignore */ }
    throw e;
  }
}

// Every immediate child of skills/ that holds a SKILL.md, sorted for a
// deterministic scan and print order. A skills/ entry with no SKILL.md is
// skipped silently — this script polices frontmatter shape, not directory
// layout.
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
// frontmatter block (delimited by the file's opening and closing `---`
// lines), followed somewhere below it, before the closing `---`, by a
// `  version: "..."` line. Regex-based, in the same style fc-index.mjs's
// own parseFrontmatter uses, not a YAML parser. Returns the absolute start
// and end offsets of the `  version: "..."` line within the full file text
// (so a rewrite can splice by index rather than risk a string-replace
// matching an unrelated occurrence elsewhere in the file), plus its current
// value, or null when the file does not carry the shape.
function findVersionLine(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const body = fm[1];
  const metaIdx = body.search(/^metadata:[ \t]*$/m);
  if (metaIdx === -1) return null;
  const afterMeta = body.slice(metaIdx);
  const versionMatch = afterMeta.match(/^([ \t]+)version:[ \t]*"([^"]*)"[ \t]*$/m);
  if (!versionMatch) return null;
  // fm.index marks the start of the opening "---" line; the frontmatter
  // body (group 1) begins right after its trailing newline.
  const bodyStart = fm.index + fm[0].indexOf(fm[1]);
  const lineStartInBody = metaIdx + versionMatch.index;
  const start = bodyStart + lineStartInBody;
  const end = start + versionMatch[0].length;
  return { start, end, indent: versionMatch[1], value: versionMatch[2] };
}

function main() {
  const argv = process.argv.slice(2);

  // --help takes precedence over everything else, including a missing or
  // invalid version argument, so it always answers even when the rest of
  // argv is wrong.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const version = argv.find((a) => !a.startsWith('--'));
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(
      `stamp-skill-versions: invalid version argument ${JSON.stringify(version || '')} — expected a bare X.Y.Z, e.g. 0.2.0`,
    );
    process.exit(1);
  }

  const skillsDir = path.join(SELF_ROOT, 'skills');
  const files = listSkillFiles(skillsDir);

  // Validate every file before writing any of them — the all-or-nothing
  // guarantee that keeps a release from shipping with seven skills stamped
  // and one not.
  const parsed = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const found = findVersionLine(text);
    if (!found) {
      console.error(`stamp-skill-versions: ${path.relative(SELF_ROOT, file)}: no metadata.version found in the documented shape`);
      process.exit(1);
    }
    parsed.push({ file, text, ...found });
  }

  let stamped = 0;
  for (const { file, text, start, end, indent, value } of parsed) {
    if (value === version) continue;
    const newLine = `${indent}version: "${version}"`;
    const newText = text.slice(0, start) + newLine + text.slice(end);
    writeAtomic(file, newText);
    console.log(`${path.relative(SELF_ROOT, file)}: version -> "${version}"`);
    stamped++;
  }

  console.log(`stamped ${stamped} of ${parsed.length} SKILL.md files`);
  process.exit(0);
}

main();
