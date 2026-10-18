import { readFileSync } from "node:fs";
import { withPublicationDate } from "./publication-dates.mjs";

const directory = new URL("./essays/2026-10-evals/", import.meta.url);
const read = name => readFileSync(new URL(name, directory), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const collectionSlug = "how-to-write-and-score-an-agent-eval";
export const evalWriting = manifest.map(item => withPublicationDate({
  ...item, collectionSlug, featured: false, seriesNumber: item.order,
  summary: item.description,
  bodyHtml: read(`${item.slug}.html`).replace("<!--eval-score-explorer-->", read("score-explorer.html"))
}));
export const evalOverview = withPublicationDate({
  slug: collectionSlug, collectionSlug,
  title: "How to Write and Score an Agent Eval",
  titleLines: ["How to Write and Score", "an Agent Eval"],
  eyebrow: "Evaluation in practice", featured: true, seriesOverview: true,
  seriesUnit: "part", readTime: "1 min",
  description: "From a plausible wrong answer to a defensible release decision: nine chapters on writing tests, calculating scores, and checking whether success repeats.",
  bodyHtml: read("overview.html")
});
