import { readFileSync } from "node:fs";
import { withPublicationDate } from "./publication-dates.mjs";

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
      featured: false,
      seriesNumber: item.order,
      collectionSlug: "how-intelligence-finds-its-way",
      summary: item.description,
      readTime: `${Math.ceil(words / 220)} min`,
      wordCount: words,
      body,
    };
  }).map(withPublicationDate);

export const agencyOverview = withPublicationDate({
  slug: "how-intelligence-finds-its-way",
  collectionSlug: "how-intelligence-finds-its-way",
  title: "How Intelligence Finds Its Way",
  titleLines: ["How intelligence", "finds its way"],
  eyebrow: "Context, experience & judgment",
  readTime: "2 min",
  featured: true,
  seriesOverview: true,
  description: "Five essays on the worlds intelligence can read, the questions it asks, the experience it carries, and the actions it can afford to try.",
  body: `
An intelligent system still has to find its way through an unfamiliar situation. It needs to encounter useful evidence, recognise which question matters, and decide whether something that worked before belongs here.

The environment shapes those possibilities. Names and indexes make some explanations easy to discover. Examples carry assumptions that can outlive their usefulness. Procedures preserve both sound dependencies and old conveniences. The consequences of an action determine whether a mistaken idea can become another attempt.

These five essays follow that movement from discovery to action. Each begins with a concrete problem and develops a design choice you can examine in your own systems. The opening chapter includes a worked hierarchy and index examples for progressive disclosure.
`,
  afterword: `
## A path through the collection

Begin with the environment an agent can read. Then ask what is worth reading next, where a familiar example stops applying, which parts of a method survive a changed assumption, and what an experiment leaves possible afterward.

The chapters can also be read independently. Their shared question is how to give intelligence enough grounding to exercise judgment when the next problem differs from the last.
`,
});
