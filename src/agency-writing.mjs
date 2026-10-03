import { readFileSync } from "node:fs";

// Published essays, kept as Markdown so the source remains readable and editable.
// Dates are assigned by the shared publication registry in content.mjs.
const directory = new URL("./essays/2026-10-agency/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", directory), "utf8"));

export const agencyWriting = manifest
  .sort((a, b) => a.order - b.order)
  .map((item) => {
    const source = readFileSync(new URL(`${item.slug}.md`, directory), "utf8").trim();
    if (!source.startsWith(`# ${item.title}\n`)) throw new Error(`Essay title mismatch: ${item.slug}`);
    const body = source.replace(/^# [^\n]+\n+\*[^\n]+\*\n+/, "");
    const words = body.split(/\s+/).length;
    return {
      ...item,
      featured: item.slug === "the-world-an-agent-can-read",
      readTime: `${Math.ceil(words / 220)} min`,
      wordCount: words,
      body,
    };
  });
