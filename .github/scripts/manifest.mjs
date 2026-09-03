#!/usr/bin/env node
// Generates skills/manifest.json: the release version, the day it was
// generated, and one entry per discovered skill folder carrying that folder's
// mirrored metadata.version and a SHA-256 digest of its whole contents. It
// computes no version: the maintainer passes the release version as the one
// argument, and the run refuses when any skill disagrees with it. No
// dependencies; node >= 16.
//
// It carries its own small regex read of metadata.version rather than
// importing the stamper's. stamp-skill-versions.mjs calls main() at module
// scope and exports nothing, so importing it would run a writer as a side
// effect of a read. The duplication is deliberate and is pinned by the
// round-trip case in run-tests.mjs, which stamps a fixture with the real
// stamper and then generates a manifest over the same tree.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const HELP = `manifest.mjs — generates skills/manifest.json for one release version.

Usage:
  node .github/scripts/manifest.mjs <X.Y.Z> [--stdout]
  node .github/scripts/manifest.mjs --help

  <X.Y.Z>   Required, positional. A bare three-part version number: three
            groups of digits separated by dots, with no leading "v" and no
            pre-release or build suffix (so "0.2.0", never "v0.2.0", "0.2",
            or "0.2.0-rc.1"). Every discovered skill must already carry it.
  --stdout  Print the manifest on stdout and write no file. Every WARN line
            and the summary move to stderr, so stdout is parseable JSON and
            nothing else.
  --help    Print this text on stdout and exit 0, before any argument
            parsing that could fail.

The output document holds exactly three top-level keys, in the order
suite_version, generated, skills. Each skills entry holds exactly name,
version and sha256, in that order. It is written with a two-space indent and
a trailing newline, and nothing in it is ever null. generated is the local
calendar day, the value \`date +%F\` prints on this host.

A skill's sha256 covers every regular file in its folder, at every depth.
Symbolic links and any entry whose basename starts with a dot are skipped.
The paths are sorted before hashing, so the digest never depends on the order
the filesystem reports entries in.

A directory under skills/ that holds no SKILL.md is skipped with one WARN
line and does not stop the run. A loose file directly under skills/,
including manifest.json itself, is ignored silently.

Exit codes:
  0  The manifest was produced, even if a WARN line printed.
  1  A refusal: VERSIONING.md is absent from the derived root, the argument
     is not a bare X.Y.Z, skills/ is missing or holds no SKILL.md, a
     SKILL.md fails the documented metadata.version shape check, or a
     SKILL.md disagrees with the given version. Nothing was written.

Scope: this script reads skills/ and writes exactly one path,
skills/manifest.json. It never edits a SKILL.md, never runs a git command,
and never reads a tag. It is a generator, not a gate — check-release.mjs is
the read-only verifier CI calls, and there is no exit 2 here.
`;

// This script's own repository root, derived from its own file location: the
// script sits at .github/scripts/manifest.mjs, two directories below the
// repository root. Never from process.cwd(). There is no --root flag: this
// script writes a file, and a --root flag is precisely the ability to aim a
// writer at an arbitrary tree that the stamper's relocation exists to remove.
// A copy placed inside a fixture at <fixture>/.github/scripts/ therefore
// writes into that fixture's own skills/ tree, and nothing else.
const SELF_ROOT = path.resolve(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..', '..',
);

// The marker that proves the derived root really is the repository root. A
// copy of this script placed at a wrong depth resolves SELF_ROOT somewhere
// else, finds no VERSIONING.md there, and refuses loudly rather than writing
// a manifest into a directory that is not a release tree.
const VERSIONING_MD = path.join(SELF_ROOT, 'VERSIONING.md');

// A bare three-part version: no leading "v", no pre-release or build suffix.
// Character-for-character the rule stamp-skill-versions.mjs applies.
const VERSION_ARG = /^\d+\.\d+\.\d+$/;

// Two-digit zero padding for calendar fields.
const pad2 = (n) => String(n).padStart(2, '0');

// The local calendar day as YYYY-MM-DD: the value `date +%F` prints on this
// host. The same helper fc-index.mjs uses. Never toISOString(), which is UTC
// and would record the wrong day for anyone generating a release near
// midnight.
const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// Every immediate child directory of skills/, sorted for a deterministic scan
// and print order, split into the ones that hold a SKILL.md and the ones that
// do not. The same discovery rule listSkillFiles() uses in
// stamp-skill-versions.mjs: no skill name and no skill count is written here,
// so adding or removing a skill folder changes nothing in this file. Loose
// files directly under skills/, manifest.json included, are not directories
// and so never appear in either list.
function listSkillDirs(skillsDir) {
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return null;
  }
  const skills = [];
  const skipped = [];
  for (const e of entries.filter((x) => x.isDirectory()).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const dir = path.join(skillsDir, e.name);
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) skills.push({ name: e.name, dir });
    else skipped.push(e.name);
  }
  return { skills, skipped };
}

// The documented shape from VERSIONING.md: a `metadata:` line inside the
// frontmatter block, then an indented `version: "..."` line before the
// closing `---`. Accepts exactly what findVersionLine() in
// stamp-skill-versions.mjs accepts, and returns null rather than throwing on
// any other shape. The current value only — this reader never rewrites, so it
// needs no splice offsets.
function readSkillVersion(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const body = fm[1];
  const metaIdx = body.search(/^metadata:[ \t]*$/m);
  if (metaIdx === -1) return null;
  const versionMatch = body.slice(metaIdx).match(/^[ \t]+version:[ \t]*"([^"]*)"[ \t]*$/m);
  return versionMatch ? versionMatch[1] : null;
}

// Every regular file inside dir, at every depth, as a path relative to dir
// with "/" separators. Symbolic links and any entry whose basename starts
// with a dot are skipped at every depth: readdirSync's Dirent reports link
// types without following them, so a link is neither a file nor a directory
// here and is never walked into.
function collectFiles(dir, prefix, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    if (e.isSymbolicLink()) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) collectFiles(path.join(dir, e.name), rel, out);
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

// The digest of a whole skill folder. The relative paths are sorted BEFORE
// anything is fed to the hash, so the result never depends on the order the
// filesystem reports directory entries in. Each file contributes
// `<relative path>\n<byte length>\n<file bytes>\n`, so a rename with
// unchanged bytes moves the digest just as an edit does.
//
// This is a public contract: once a release publishes digests, changing what
// the hash covers or how it is fed invalidates every published digest.
function hashSkill(absSkillDir) {
  const rels = collectFiles(absSkillDir, '', []).sort();
  const hash = crypto.createHash('sha256');
  for (const rel of rels) {
    // Raw bytes, never decoded to a string: the digest must be byte-exact
    // and encoding-agnostic.
    const bytes = fs.readFileSync(path.join(absSkillDir, ...rel.split('/')));
    hash.update(`${rel}\n${bytes.length}\n`);
    hash.update(bytes);
    hash.update('\n');
  }
  return hash.digest('hex');
}

function refuse(message) {
  console.error(`manifest: ${message}`);
  process.exit(1);
}

function main() {
  const argv = process.argv.slice(2);

  // --help takes precedence over everything else, including a missing or
  // invalid version argument and a root holding no skills/, so it always
  // answers and never writes.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const toStdout = argv.includes('--stdout');

  if (!fs.existsSync(VERSIONING_MD)) {
    refuse(`no VERSIONING.md at ${SELF_ROOT} — this script must sit two directories below the repository root`);
  }

  const version = argv.find((a) => !a.startsWith('--'));
  if (!version || !VERSION_ARG.test(version)) {
    refuse(`invalid version argument ${JSON.stringify(version || '')} — expected a bare X.Y.Z, e.g. 0.2.0`);
  }

  const skillsDir = path.join(SELF_ROOT, 'skills');
  const found = listSkillDirs(skillsDir);
  if (found === null) refuse(`no skills directory at ${skillsDir}`);
  const { skills, skipped } = found;
  if (skills.length === 0) {
    refuse(`no SKILL.md was discovered under ${skillsDir} — refusing rather than writing an empty manifest`);
  }

  // Validate every skill before writing anything. The run is all-or-nothing,
  // exactly as stamp-skill-versions.mjs is, so a partial manifest never
  // reaches disk.
  for (const skill of skills) {
    const file = path.join(skill.dir, 'SKILL.md');
    const rel = path.relative(SELF_ROOT, file);
    const carried = readSkillVersion(fs.readFileSync(file, 'utf8'));
    if (carried === null) {
      refuse(`${rel}: no metadata.version found in the documented shape`);
    }
    if (carried !== version) {
      refuse(`${rel}: metadata.version is "${carried}", expected "${version}" — run the stamping script first`);
    }
    skill.version = carried;
  }

  // Only now, past every refusal, is anything printed or written. A refusal
  // therefore emits one stderr line and nothing else, and never a WARN for a
  // run that produced no manifest.
  const out = toStdout ? process.stderr : process.stdout;
  for (const name of skipped) {
    out.write(`WARN skills/${name}: no SKILL.md — skipped\n`);
  }

  const manifest = {
    suite_version: version,
    generated: localDay(),
    skills: skills.map((s) => ({
      name: s.name,
      version: s.version,
      sha256: hashSkill(s.dir),
    })),
  };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;

  if (toStdout) {
    process.stdout.write(json);
    out.write(`manifest: ${skills.length} skills at ${version} — wrote nothing (--stdout)\n`);
  } else {
    fs.writeFileSync(path.join(skillsDir, 'manifest.json'), json);
    out.write(`manifest: ${skills.length} skills at ${version} — wrote skills/manifest.json\n`);
  }
  process.exit(0);
}

main();
