import { readFileSync } from "node:fs";

// Unpublished manuscripts. These are loaded only by `npm run drafts:build`.
// Publication is a separate edit to the normal writing and date registries.
const directory = new URL("../drafts/2026-10-agency/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", directory), "utf8"));

export const editorialDrafts = manifest.map((item) => {
  const source = readFileSync(new URL(`${item.slug}.md`, directory), "utf8").trim();
  if (!source.startsWith(`# ${item.title}\n`)) throw new Error(`Draft title mismatch: ${item.slug}`);
  const body = source.replace(/^# [^\n]+\n+\*[^\n]+\*\n+/, "");
  const words = body.split(/\s+/).length;
  return {
    ...item,
    draft: true,
    featured: false,
    date: "2026-10-03", // Draft preparation date, not a publication date.
    displayDate: "Unpublished draft",
    readTime: `${Math.ceil(words / 220)} min`,
    wordCount: words,
    body,
  };
});
