import { readFileSync } from "node:fs";

export const progressiveDisclosure = {
  slug: "implementing-progressive-disclosure-for-agent-tools",
  title: "Implementing Progressive Disclosure for Agent Tools",
  titleLines: ["Implementing Progressive Disclosure", "for Agent Tools"],
  eyebrow: "Agent interfaces",
  description: "Build one discoverable CLI for MCP, SQL, and REST, with precise schemas, scoped execution, and honest result receipts.",
  readTime: "12 min",
  featured: true,
  interactiveEssay: true,
  bodyHtml: readFileSync(new URL("./essays/implementing-progressive-disclosure-for-agent-tools.html", import.meta.url), "utf8"),
};
