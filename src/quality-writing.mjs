import { readFileSync } from "node:fs";
import { withPublicationDate } from "./publication-dates.mjs";
const directory = new URL("./essays/2026-10-quality/", import.meta.url);
const read = name => readFileSync(new URL(name, directory), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const collectionSlug = "quality-flywheel";
// Reviewed publication HTML retains accessible vector diagrams and the scoring lab.
export const qualityWriting = manifest.map(item => withPublicationDate({
  ...item, collectionSlug, featured: false, seriesNumber: item.order,
  summary: item.description, bodyHtml: read(`${item.slug}.html`)
}));
export const qualityOverview = withPublicationDate({
  slug: collectionSlug, collectionSlug, title: "The Quality Flywheel",
  titleLines: ["The Quality", "Flywheel"], eyebrow: "Learning from experience",
  featured: true, seriesOverview: true, readTime: "2 min",
  description: "How AI systems learn from failure—and how improvement compounds. Ten chapters on feedback loops, hill climbing, evaluation, and the research frontier.",
  bodyHtml: read("overview.html"), afterwordHtml: read("afterword.html")
});
