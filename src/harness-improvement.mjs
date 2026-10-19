import { readFileSync } from "node:fs";

export const harnessImprovement = {
  slug: "building-an-agent-that-improves-its-own-harness",
  title: "Building an Agent That Improves Its Own Harness",
  titleLines: ["Building an Agent", "That Improves Its Own Harness"],
  eyebrow: "Agent architecture",
  description: "Turn repeated failures into tested changes, then use the evidence to improve the next experiment.",
  readTime: "14 min",
  featured: true,
  interactiveEssay: true,
  bodyHtml: readFileSync(new URL("./essays/building-an-agent-that-improves-its-own-harness.html", import.meta.url), "utf8"),
};
