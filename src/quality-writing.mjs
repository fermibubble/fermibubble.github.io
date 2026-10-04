import { readFileSync } from "node:fs";
import { withPublicationDate } from "./publication-dates.mjs";
import { renderQualityFlywheel, renderQualityLandscape, renderQualityEvidenceLoop } from "./diagrams.mjs";
const directory = new URL("./essays/2026-10-quality/", import.meta.url);
const read = name => readFileSync(new URL(name, directory), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const collectionSlug = "quality-flywheel";
const render = source => source
  .replace("<!--diagram-flywheel-->", renderQualityFlywheel())
  .replace("<!--diagram-landscape-->", renderQualityLandscape())
  .replace("<!--diagram-evidence-->", renderQualityEvidenceLoop());
export const qualityWriting = manifest.map(item => withPublicationDate({
  ...item, collectionSlug, featured: false, seriesNumber: item.order,
  summary: item.description, bodyHtml: render(read(`${item.slug}.html`))
}));
export const qualityOverview = withPublicationDate({
  slug: collectionSlug, collectionSlug, title: "The Quality Flywheel",
  titleLines: ["The Quality", "Flywheel"], eyebrow: "Learning from experience",
  featured: true, seriesOverview: true, readTime: "1 min",
  description: "How failures become experiments, better decisions, and knowledge that survives the next release.",
  bodyHtml: read("overview.html")
});
