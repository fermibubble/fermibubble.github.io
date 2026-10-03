import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { agencyOverview, agencyWriting } from "../src/agency-writing.mjs";
import { autonomyOverview, principleEssays } from "../src/principle-series.mjs";
import { writingPath } from "../src/paths.mjs";
const read = (path) => readFile(new URL(`../dist${path}`, import.meta.url), "utf8");
const writing = await read("/writing/index.html");
const feed = await read("/rss.xml");
const search = JSON.parse(await read("/search-index.json"));
for (const [overview, chapters] of [[agencyOverview, agencyWriting], [autonomyOverview, principleEssays]]) {
  const collectionPath = writingPath(overview);
  const page = await read(`${collectionPath}index.html`);
  assert(writing.includes(`Collection · ${chapters.length} chapters`));
  assert(feed.includes(`https://oddly.fyi${collectionPath}`));
  assert.equal((page.match(/class="series-map-card"/g) || []).length, chapters.length);
  for (const [index, item] of chapters.entries()) {
    const path = writingPath(item);
    const chapter = await read(`${path}index.html`);
    assert(page.includes(`href="${path}"`), `Overview misses ${item.slug}`);
    assert(chapter.includes(`Part of ${overview.title}`));
    assert(chapter.includes(`Chapter ${String(index + 1).padStart(2, "0")} of ${String(chapters.length).padStart(2, "0")}`));
    assert(chapter.includes(`href="${index ? writingPath(chapters[index - 1]) : collectionPath}"`));
    assert(chapter.includes(`href="${index + 1 < chapters.length ? writingPath(chapters[index + 1]) : collectionPath}"`));
    assert(!writing.includes(`href="${path}"`), `Chapter is ungrouped: ${item.slug}`);
    assert(!feed.includes(`https://oddly.fyi${path}`));
    assert.equal(search.filter((entry) => entry.url === path && entry.type === "Chapter").length, 1);
    assert((await read(`/writing/${item.slug}/index.html`)).includes(`content="0; url=${path}"`));
  }
}
const example = await read(`${writingPath(agencyWriting[0])}index.html`);
assert.equal((example.match(/class="index-example"/g) || []).length, 3);
assert.equal((example.match(/<details class="index-source">/g) || []).length, 3);
const preview = example.replace(/<details class="index-source">[\s\S]*?<\/details>/g, "");
assert(preview.includes('>Knowledge index</h3>'));
assert(!preview.includes('# Knowledge index'));
assert(!preview.includes('[Request path](request-path/INDEX.md)'));
for (const match of preview.matchAll(/href="#(example-[^"]+)"/g)) {
  assert(preview.includes(`id="${match[1]}"`), `Missing example destination: ${match[1]}`);
}
console.log("Validated both collections, chapter navigation, old URLs, and rendered index previews.");
