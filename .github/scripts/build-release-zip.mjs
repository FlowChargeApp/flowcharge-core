#!/usr/bin/env node
// Builds the one release asset, dist/flowcharge-skills-<X.Y.Z>.zip. The
// archive's top level is the discovered skill folders themselves, each copied
// whole at every depth, so `unzip <asset> -d <skills-dir>` installs the suite
// in one step. No dependencies; node >= 16.
//
// Module boundary: this file knows the skills/ directory layout, its own
// repository root, and the ZIP container format. It never knows git, never
// reads a tag or a CHANGELOG.md, and never parses a SKILL.md. The version it is
// given names the output file and nothing else.
//
// What goes in is decided by enumerating skills/, never by testing a file's
// name against a list. That is why a repository-root LICENSE stays out while a
// skills/<name>/LICENSE is carried: the rule is about the source directory, not
// about the filename.
//
// The container is written with node:zlib's deflateRawSync plus the ZIP local
// header, central directory and end-of-central-directory records, because the
// runner image is not guaranteed to carry a zip binary and this repository
// takes no dependency.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const HELP = `build-release-zip.mjs: writes dist/flowcharge-skills-<X.Y.Z>.zip, holding every discovered skill folder at the archive's top level.

Usage:
  node .github/scripts/build-release-zip.mjs <X.Y.Z>
  node .github/scripts/build-release-zip.mjs --help

The one positional argument must be a bare three-part version number: three
groups of digits separated by dots, with no leading "v" and no pre-release
or build suffix (so "0.2.0", never "v0.2.0", "0.2", or "0.2.0-rc.1"). The
version names the output file and nothing else: no file is read for a
version and no version is checked against a file.

The contents are found, never listed. Every immediate subdirectory of
skills/ that holds a SKILL.md is copied whole, at every depth, and every
path is rewritten relative to skills/. There is no wrapper directory and no
skills/ prefix, and no repository-root file of any kind is carried.

The archive is written to a temporary path inside dist/ and renamed into
place, so a failed run leaves no half-written archive and no leftover
temporary file.

--help  Print this text on stdout and exit 0, before any argument parsing
        that could fail.

Exit codes:
  0  dist/flowcharge-skills-<X.Y.Z>.zip was written.
  1  Invalid argument, or no skill folder was discovered. Nothing was
     written.
`;

// This script's own repository root, derived from its own file location: the
// script sits at .github/scripts/build-release-zip.mjs, two directories below
// the repository root. Never from process.cwd(), so a copy placed inside a
// fixture at <fixture>/.github/scripts/ reads that fixture's own skills/ tree
// and writes that fixture's own dist/, and touches nothing else.
const SELF_ROOT = path.resolve(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..', '..',
);

const SKILLS_DIR = path.join(SELF_ROOT, 'skills');
const DIST_DIR = path.join(SELF_ROOT, 'dist');

// A bare three-part version: no leading "v", no pre-release or build suffix.
const VERSION_ARG = /^\d+\.\d+\.\d+$/;

function fail(message) {
  console.error(`build-release-zip: ${message}`);
  process.exit(1);
}

// ---- the ZIP container ------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}

// The MS-DOS date and time fields every ZIP record carries. Seconds hold two
// seconds each and the year is an offset from 1980, which is the format, not a
// simplification.
function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (Math.floor(date.getSeconds() / 2)),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

// One entry, already compressed, with everything both records need.
function prepareEntry(archivePath, absPath) {
  const raw = fs.readFileSync(absPath);
  const deflated = deflateRawSync(raw, { level: 9 });
  // Stored beats deflated on tiny or already-compressed files. Both methods are
  // universally supported; picking the smaller one is the whole reason to look.
  const stored = deflated.length >= raw.length;
  const { time, date } = dosDateTime(fs.statSync(absPath).mtime);
  return {
    name: Buffer.from(archivePath, 'utf8'),
    method: stored ? 0 : 8,
    time,
    date,
    crc: crc32(raw),
    compressed: stored ? raw : deflated,
    size: raw.length,
  };
}

function localHeader(entry) {
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0); // local file header signature
  head.writeUInt16LE(20, 4); // version needed to extract (2.0)
  head.writeUInt16LE(0, 6); // general purpose bit flag
  head.writeUInt16LE(entry.method, 8);
  head.writeUInt16LE(entry.time, 10);
  head.writeUInt16LE(entry.date, 12);
  head.writeUInt32LE(entry.crc, 14);
  head.writeUInt32LE(entry.compressed.length, 18);
  head.writeUInt32LE(entry.size, 22);
  head.writeUInt16LE(entry.name.length, 26);
  head.writeUInt16LE(0, 28); // extra field length
  return Buffer.concat([head, entry.name]);
}

function centralRecord(entry, offset) {
  const head = Buffer.alloc(46);
  head.writeUInt32LE(0x02014b50, 0); // central directory header signature
  head.writeUInt16LE(20, 4); // version made by
  head.writeUInt16LE(20, 6); // version needed to extract
  head.writeUInt16LE(0, 8); // general purpose bit flag
  head.writeUInt16LE(entry.method, 10);
  head.writeUInt16LE(entry.time, 12);
  head.writeUInt16LE(entry.date, 14);
  head.writeUInt32LE(entry.crc, 16);
  head.writeUInt32LE(entry.compressed.length, 20);
  head.writeUInt32LE(entry.size, 24);
  head.writeUInt16LE(entry.name.length, 28);
  head.writeUInt16LE(0, 30); // extra field length
  head.writeUInt16LE(0, 32); // file comment length
  head.writeUInt16LE(0, 34); // disk number start
  head.writeUInt16LE(0, 36); // internal file attributes
  head.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attributes: a 0644 regular file
  head.writeUInt32LE(offset, 42); // offset of the local header
  return Buffer.concat([head, entry.name]);
}

function endOfCentralDirectory(count, size, offset) {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  end.writeUInt16LE(0, 4); // this disk
  end.writeUInt16LE(0, 6); // disk holding the central directory
  end.writeUInt16LE(count, 8); // entries on this disk
  end.writeUInt16LE(count, 10); // entries in total
  end.writeUInt32LE(size, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20); // archive comment length
  return end;
}

function zipBuffer(files) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const { archivePath, absPath } of files) {
    const entry = prepareEntry(archivePath, absPath);
    const head = localHeader(entry);
    central.push(centralRecord(entry, offset));
    parts.push(head, entry.compressed);
    offset += head.length + entry.compressed.length;
  }
  const centralBuf = Buffer.concat(central);
  return Buffer.concat([...parts, centralBuf, endOfCentralDirectory(files.length, centralBuf.length, offset)]);
}

// ---- discovery --------------------------------------------------------------

// Every immediate child of skills/ that holds a SKILL.md, sorted for a
// deterministic archive order. The same discovery rule listSkillFiles() uses in
// stamp-skill-versions.mjs: no skill name and no skill count is written here.
function listSkillFolders(skillsDir) {
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, 'SKILL.md')))
    .sort();
}

// Every file below one skill folder, at every depth, paired with the path it
// takes inside the archive: the folder's own name and everything under it,
// with no skills/ prefix above it. Selection is by walking this directory, so
// no filename can be excluded and none can be let in from anywhere else.
function walkFolder(absDir, archiveDir, out) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const abs = path.join(absDir, entry.name);
    const archivePath = `${archiveDir}/${entry.name}`;
    if (entry.isDirectory()) walkFolder(abs, archivePath, out);
    else if (entry.isFile()) out.push({ archivePath, absPath: abs });
  }
  return out;
}

// ---- the run ----------------------------------------------------------------

// Written to a temporary path inside dist/ and renamed into place, the
// all-or-nothing pattern writeAtomic uses in stamp-skill-versions.mjs, so a
// failed write leaves neither a half-written archive nor a leftover file.
function writeAtomic(filePath, content) {
  const tmpPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  try {
    fs.writeFileSync(tmpPath, content);
    fs.renameSync(tmpPath, filePath);
  } catch (e) {
    try { fs.unlinkSync(tmpPath); } catch { /* tmp may not exist yet, ignore */ }
    throw e;
  }
}

function main() {
  const argv = process.argv.slice(2);

  // --help takes precedence over everything else, including a missing or
  // invalid version argument, so it always answers before any write.
  if (argv.includes('--help')) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const version = argv.find((a) => !a.startsWith('--'));
  if (!version || !VERSION_ARG.test(version)) {
    fail(`invalid version argument ${JSON.stringify(version || '')}: expected a bare X.Y.Z, e.g. 0.2.0`);
  }

  const folders = listSkillFolders(SKILLS_DIR);
  if (folders.length === 0) {
    fail(`no skill folder was discovered under ${SKILLS_DIR}. An empty release asset is worse than a failed build`);
  }

  const files = [];
  for (const folder of folders) walkFolder(path.join(SKILLS_DIR, folder), folder, files);

  const outPath = path.join(DIST_DIR, `flowcharge-skills-${version}.zip`);
  fs.mkdirSync(DIST_DIR, { recursive: true });
  writeAtomic(outPath, zipBuffer(files));

  console.log(`${path.relative(SELF_ROOT, outPath)}: ${files.length} file(s) from ${folders.length} skill folder(s)`);
  process.exit(0);
}

main();
