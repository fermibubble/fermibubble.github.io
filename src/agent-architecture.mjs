import { readFileSync } from "node:fs";

const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const node = (x, y, w, title, lines = [], active = false) => `<g class="agent-node${active ? " agent-node-active" : ""}">
  <rect x="${x}" y="${y}" width="${w}" height="68" rx="8"/>
  <text x="${x + w / 2}" y="${y + 24}" text-anchor="middle">${escape(title)}</text>
  ${lines.map((line, i) => `<text class="agent-node-detail" x="${x + w / 2}" y="${y + 44 + i * 16}" text-anchor="middle">${escape(line)}</text>`).join("")}
</g>`;
const svg = (id, height, title, description, drawing) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>
  <defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path class="diagram-arrowhead" d="M1 1 L9 5 L1 9Z"/></marker></defs>
  ${drawing}
</svg>`;

function generalistDiagram() {
  const id = "generalist-investigation";
  return `<figure class="editorial-diagram agent-diagram">
    <div class="diagram-board">${svg(id, 520, "One coherent investigation",
      "A latency regression reaches the generalist primary agent. It discovers deployment tools, retrieves database knowledge, and inspects network evidence. These sources feed hypothesis evaluation. The investigation either continues with the next diagnostic or produces findings and a next action.",
      `<g class="diagram-flow" marker-end="url(#${id}-arrow)">
        <path d="M180 78 V108"/><path d="M180 178 V202 H60 V228"/><path d="M180 202 V228"/><path d="M180 202 H300 V228"/>
        <path d="M60 298 V322 H180 V348"/><path d="M180 298 V348"/><path d="M300 298 V322 H180"/>
        <path d="M180 418 V448"/>
        <path class="diagram-explore" d="M80 384 H8 V144 H80"/>
      </g>
      ${node(80, 10, 200, "Latency regression", ["After the release"])}
      ${node(80, 110, 200, "Primary agent", ["Generalist", "Durable task state"], true)}
      ${node(10, 230, 100, "Deployment", ["Discover", "tools"])}
      ${node(130, 230, 100, "Database", ["Retrieve", "knowledge"])}
      ${node(250, 230, 100, "Network", ["Inspect", "evidence"])}
      ${node(80, 350, 200, "Evaluate hypotheses", ["Next diagnostic ↺"], true)}
      ${node(80, 450, 200, "Findings", ["And next action"])}`)}</div>
    <figcaption>The investigation crosses domains while the primary agent retains the evidence and responsibility for the answer.</figcaption>
  </figure>`;
}

const scenarios = [
  { id: "admitted", label: "Admitted", accepted: true, detail: "The runtime reserves capacity, creates a temporary execution, and returns evidence for the primary agent to verify." },
  { id: "budget", label: "Budget exhausted", accepted: false, reason: "Budget exhausted", detail: "No capacity can be reserved. No subagent is created; the primary agent must continue within the remaining limits." },
  { id: "access", label: "Access denied", accepted: false, reason: "Tool outside scope", detail: "The requested tool exceeds the parent task’s authority. Delegation cannot expand permissions." },
  { id: "canceled", label: "Parent canceled", accepted: true, detail: "The subagent stops, unused capacity is released, and partial results remain marked incomplete." },
];

function delegationScenarios() {
  return `<section class="agent-delegation" data-delegation aria-label="Runtime admission and subagent lifecycle">
    <div class="agent-scenario-controls" data-delegation-controls hidden role="group" aria-label="Choose a delegation outcome">${scenarios.map(s => `<button type="button" data-scenario="${s.id}" aria-controls="delegation-${s.id}" aria-pressed="${s.id === "admitted"}">${s.label}</button>`).join("")}</div>
    <div aria-live="polite" aria-atomic="true">${scenarios.map(s => {
      const id = `delegation-${s.id}`;
      const canceled = s.id === "canceled";
      return `<figure class="editorial-diagram agent-diagram agent-scenario" data-delegation-panel="${s.id}" id="${id}">
        <h3>${s.label}</h3>
        <div class="diagram-board">${svg(id, 505, s.label, s.detail,
          `<g class="diagram-flow" marker-end="url(#${id}-arrow)">
            <path d="M180 78 V108"/><path d="M180 178 V198 H85 V228"/><path d="M180 198 H275 V228"/>
            <path d="M85 298 V328"/><path d="M275 298 V328"/><path d="M85 398 V428"/>
          </g>
          <text class="agent-branch-label" x="85" y="220" text-anchor="middle">Admit</text>
          <text class="agent-branch-label" x="275" y="220" text-anchor="middle">Deny</text>
          ${node(70, 10, 220, "Primary agent", ["Current-task contract"], true)}
          ${node(70, 110, 220, "Runtime admission", ["Scope, grants and budget"], true)}
          ${node(10, 230, 150, "Create subagent", ["Same harness", "Isolated task state"], s.accepted)}
          ${node(200, 230, 150, "Reject request", [s.reason || "No execution"], !s.accepted)}
          ${node(10, 330, 150, canceled ? "Cancel execution" : "End execution", ["Release reservation", "Retain evidence"], s.accepted)}
          ${node(200, 330, 150, "Primary continues", ["Narrow, proceed", "or escalate"], !s.accepted)}
          ${node(10, 430, 150, canceled ? "Preserve artifacts" : "Primary verifies", canceled ? ["Incomplete output", "No further execution"] : ["Inspect result", "Keep source evidence"], s.accepted)}
          `)}</div>
        <figcaption>${s.detail}</figcaption>
      </figure>`;
    }).join("")}</div>
  </section>`;
}

const source = readFileSync(new URL("./essays/before-you-build-another-agent.html", import.meta.url), "utf8");
export const agentArchitecture = {
  slug: "before-you-build-another-agent",
  title: "Before You Build Another Agent",
  titleLines: ["Before you build", "another agent"],
  eyebrow: "Agent architecture",
  description: "Build a strong generalist. Make expertise discoverable. Delegate only when the task earns it.",
  readTime: "7 min",
  featured: true,
  interactiveEssay: true,
  bodyHtml: source.replace("<!--generalist-diagram-->", generalistDiagram()).replace("<!--delegation-scenarios-->", delegationScenarios()),
};
