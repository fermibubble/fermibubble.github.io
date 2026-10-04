import { qualityWriting } from "../src/quality-writing.mjs";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { classifierWriting } from "../src/classifier-writing.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const draftPreview = process.argv.includes("--drafts");
const dist = join(root, draftPreview ? "dist-drafts" : "dist");
const failures = [];
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (extname(entry.name) === ".html") htmlFiles.push(full);
  }
}

async function exists(path) {
  try { await access(path); return true; } catch (_) { return false; }
}

await walk(dist);

for (const file of htmlFiles) {
  const body = await readFile(file, "utf8");
  const relative = file.slice(dist.length + 1);
  const legacyPage = await exists(join(root, "legacy", relative));
  if (!/<!doctype html>/i.test(body)) failures.push(`${relative}: missing doctype`);
  if (!/<title>[^<]+<\/title>/.test(body)) failures.push(`${relative}: missing title`);
  if (!legacyPage && !body.includes('id="content"')) failures.push(`${relative}: missing main content target`);
  if (body.includes("undefined") || body.includes("[object Object]")) failures.push(`${relative}: contains invalid rendered value`);

  const links = [...body.matchAll(/(?:href|src)="(\/[^"?#]*)/g)].map((match) => match[1]);
  for (const href of links) {
    if (href === "/") continue;
    const target = href.endsWith("/") ? join(dist, href, "index.html") : join(dist, href);
    const safeTarget = normalize(target);
    if (!safeTarget.startsWith(dist) || !(await exists(safeTarget))) failures.push(`${relative}: broken internal reference ${href}`);
  }
}

const expectedPages = 62 + 1 + classifierWriting.length * 2 + 1 + qualityWriting.length * 2 + qualityWriting.reduce((count, chapter) => count + chapter.aliases.length, 0) + (draftPreview ? (await import("../src/editorial-drafts.mjs")).editorialDrafts.length : 0);
if (htmlFiles.length !== expectedPages) failures.push(`expected ${expectedPages} HTML pages, found ${htmlFiles.length}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages and all internal references.`);
