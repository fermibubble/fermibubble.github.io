/*
 * Oddly diagram vocabulary: a solid arrow is a transition, a dashed arrow is
 * an exploratory move, and a blue outline marks evidence worth retaining.
 * Keep meaning in labels and geometry as well as color. All figures inherit
 * the publication's font and theme through diagram.css.
 */

const arrow = id => `<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="diagram-arrowhead" d="M 1 1 L 9 5 L 1 9 Z"/></marker></defs>`;

const figure = (id, title, description, height, content, caption, modifier = "") => `
<figure class="editorial-diagram ${modifier}">
  <div class="diagram-board">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${title}</title>
      <desc id="${id}-desc">${description}</desc>
      ${arrow(id)}
      ${content}
    </svg>
  </div>
  <figcaption>${caption}</figcaption>
</figure>`;

const node = (x, y, width, height, lines, modifier = "") => `<g class="diagram-node ${modifier}">
  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8"/>
  <text x="${x + width / 2}" y="${y + height / 2 - (lines.length - 1) * 13}" dominant-baseline="middle" text-anchor="middle">${lines.map((line, i) => `<tspan x="${x + width / 2}" dy="${i ? 26 : 0}">${line}</tspan>`).join("")}</text>
</g>`;

export function renderQualityFlywheel() {
  const id = "quality-flywheel-diagram";
  return figure(id,
    "Experience becomes useful when the next cycle can reuse it",
    "A clockwise loop connects observe an incident, explain the failure, test a change, and ship and monitor. At its center, retained cases, checks, and evidence carry learning into the next cycle. Running the loop again is not enough: keeping those assets makes later diagnosis and testing cheaper.",
    510,
    `<g class="diagram-flow" marker-end="url(#${id}-arrow)">
      <path d="M 322 80 C 381 94 408 134 408 199"/>
      <path d="M 405 303 C 405 365 374 408 322 429"/>
      <path d="M 158 429 C 99 411 72 365 72 303"/>
      <path d="M 72 199 C 72 137 100 96 158 80"/>
    </g>
    ${node(159, 35, 162, 84, ["Observe an", "incident"])}
    ${node(318, 212, 152, 84, ["Explain", "the failure"])}
    ${node(159, 391, 162, 84, ["Test a", "change"])}
    ${node(10, 212, 152, 84, ["Ship and", "monitor"])}
    <g class="diagram-memory">
      <rect x="176" y="173" width="128" height="162" rx="12"/>
      <text class="diagram-small" x="240" y="203" text-anchor="middle">KEEP</text>
      <text x="240" y="239" text-anchor="middle">Cases</text>
      <text x="240" y="271" text-anchor="middle">Checks</text>
      <text x="240" y="303" text-anchor="middle">Evidence</text>
    </g>`,
    "The useful output of a cycle is more than a fix. A saved case, a reliable check, and a record of what worked make the next cycle easier.",
    "diagram-flywheel");
}

export function renderQualityLandscape() {
  const id = "quality-landscape-diagram";
  return figure(id,
    "A better local edit may never reach a different solution",
    "A conceptual landscape has a lower peak on the left and a higher peak on the right. Small prompt edits climb toward the left peak. A dashed exploratory arrow crosses to another basin, representing a change in the system such as adding a tool or changing the workflow. Height represents measured quality; the shape is illustrative, not observed data.",
    460,
    `<g class="diagram-axis">
      <path d="M 35 65 V 375 H 454"/>
    </g>
    <text class="diagram-small" x="38" y="39">Measured quality</text>
    <path class="diagram-land" d="M 35 363 C 64 362 91 339 111 298 C 127 264 145 235 163 236 C 188 238 198 344 233 348 C 272 353 285 296 307 237 C 327 182 343 150 367 155 C 400 161 412 269 454 348 L 454 375 H 35 Z"/>
    <path class="diagram-ridge" d="M 35 363 C 64 362 91 339 111 298 C 127 264 145 235 163 236 C 188 238 198 344 233 348 C 272 353 285 296 307 237 C 327 182 343 150 367 155 C 400 161 412 269 454 348"/>
    <path class="diagram-flow" marker-end="url(#${id}-arrow)" d="M 78 328 L 96 305 L 110 280 L 127 256 L 145 241"/>
    <circle class="diagram-point" cx="162" cy="236" r="6"/>
    <circle class="diagram-point" cx="366" cy="155" r="6"/>
    <path class="diagram-flow diagram-explore" marker-end="url(#${id}-arrow)" d="M 176 222 C 208 99 278 83 350 145"/>
    <text x="126" y="194" text-anchor="middle"><tspan x="126">Best nearby</tspan><tspan x="126" dy="25">prompt</tspan></text>
    <text x="377" y="108" text-anchor="middle"><tspan x="377">A possible</tspan><tspan x="377" dy="25">gain</tspan></text>
    <text x="250" y="71" text-anchor="middle"><tspan x="250">Change the system</tspan></text>
    <text class="diagram-small" x="92" y="407" text-anchor="middle">Small edits</text>
    <text class="diagram-small" x="352" y="407" text-anchor="middle">A different approach</text>
    <text class="diagram-axis-label" x="240" y="446" text-anchor="middle">System choices →</text>`,
    "A conceptual landscape, not measured results. Small edits search nearby; a different tool, representation, or workflow can open a different part of the search space.",
    "diagram-landscape");
}

export function renderQualityEvidenceLoop() {
  const id = "quality-evidence-diagram";
  return figure(id,
    "A failure becomes evidence through controlled comparison",
    "A closed loop moves from live use to a representative case and trace, a paired replay of incumbent and candidate on the same inputs, an independent held-out check, and a staged release, then returns to live use. The paired comparison holds inputs fixed. Held-out cases remain separate from the cases used to improve the candidate. Monitoring after release supplies the next observation.",
    743,
    `<g class="diagram-flow" marker-end="url(#${id}-arrow)">
      <path d="M 220 105 V 139"/>
      <path d="M 220 232 V 277"/>
      <path d="M 220 407 V 427"/>
      <path d="M 220 560 V 580"/>
      <path d="M 359 670 H 416 Q 447 670 447 639 V 87 Q 447 58 418 58 H 367"/>
    </g>
    ${node(80, 15, 280, 88, ["Live use", "and monitoring"])}
    ${node(80, 149, 280, 84, ["A representative", "case + trace"])}
    <g class="diagram-node diagram-comparison">
      <rect x="32" y="288" width="376" height="120" rx="8"/>
      <text class="diagram-small" x="220" y="316" text-anchor="middle">PAIRED REPLAY · FIXED INPUTS</text>
      <path class="diagram-divider" d="M 220 334 V 390"/>
      <text x="124" y="363" text-anchor="middle">Incumbent</text>
      <text x="314" y="363" text-anchor="middle">Candidate</text>
    </g>
    ${node(80, 480, 280, 82, ["Held-out check", "Independent cases"], "diagram-check")}
    ${node(80, 635, 280, 74, ["Staged release"])}
    <text class="diagram-small" x="220" y="452" text-anchor="middle">Freeze the candidate</text>
    <text class="diagram-small" x="220" y="605" text-anchor="middle">Evidence clears the release bar</text>`,
    "Replay holds the inputs steady. Held-out cases test whether the lesson travels. A staged release tests whether it survives real use.",
    "diagram-evidence");
}
