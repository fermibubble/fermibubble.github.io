import { writingPath } from "../src/paths.mjs";

export function renderSeriesMap(essays, escape, currentSlug, options = {}) {
  return `<nav class="series-map" aria-label="${escape(options.title || "Trustworthy Autonomy")} chapters">
    <div class="series-map-heading"><span>Inside this collection</span><h2>${escape(options.heading || "Nine principles, nine chapters")}</h2></div>
    <div class="series-map-grid">${essays.map((essay) => `<a class="series-map-card" href="${writingPath(essay)}"${essay.slug === currentSlug ? ' aria-current="page"' : ""}>
      <span class="series-number">${String(essay.seriesNumber).padStart(2,"0")}</span>
      <h3>${escape(essay.title)}</h3><p>${escape(essay.summary)}</p><span class="series-read">${essay.readTime} read <span aria-hidden="true">↗</span></span>
    </a>`).join("")}</div>
  </nav>`;
}

export function renderCaseStudy(study, escape) {
  return `<section class="case-study" data-case-study aria-labelledby="case-title">
    <header class="case-heading"><span class="case-kicker">${escape(study.kicker || "An idea in practice")}</span><h2 id="case-title">${escape(study.title)}</h2><p>${escape(study.caption)}</p></header>
    <nav class="case-choices" data-case-controls hidden aria-label="Explore the example">
      ${study.steps.map((step,i) => `<button type="button" data-case-choice="${i}" aria-controls="case-panel-${i}" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,"0")}</span>${escape(step.label)}</button>`).join("")}
    </nav>
    <div class="case-panels">${study.steps.map((step,i) => `<section class="case-panel" id="case-panel-${i}" data-case-panel="${i}" aria-labelledby="case-heading-${i}">
      <div class="case-snapshot"><span class="case-kicker">${escape(step.label)}</span><dl>${step.facts.map(([label,value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl></div>
      <div class="case-story"><h3 id="case-heading-${i}">${escape(step.headline)}</h3>
        <dl><dt>What happens</dt><dd>${escape(step.observation)}</dd><dt>What it means</dt><dd>${escape(step.implication)}</dd><dt>What the system does</dt><dd>${escape(step.action)}</dd></dl>
        <details><summary>Inspect the example record</summary><pre>${escape(JSON.stringify(step.record,null,2))}</pre></details>
      </div>
    </section>`).join("")}</div>
    <div class="case-footer" data-case-controls hidden><span data-case-position>1 of ${study.steps.length}</span><div><button type="button" data-case-prev disabled>Previous</button><button type="button" data-case-next>Next</button></div></div>
    <p class="sr-only" role="status" data-case-status></p>
  </section>`;
}

export function renderContextTable(table, escape) {
  return `<div class="context-table-wrap"><table class="context-table">
    <caption>${escape(table.caption)}</caption>
    <thead><tr>${table.columns.map(column => `<th scope="col">${escape(column)}</th>`).join("")}</tr></thead>
    <tbody>${table.rows.map(row => `<tr><th scope="row">${escape(row[0])}</th>${row.slice(1).map(cell => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

export function renderSeriesNavigation(item, essays, escape) {
  return `<details class="series-directory"><summary>Chapters in this collection <span>${String(item.seriesNumber).padStart(2,"0")} / ${String(essays.length).padStart(2,"0")}</span></summary>
    <nav aria-label="Collection chapters"><ol>${essays.map((essay) => `<li><a href="${writingPath(essay)}"${essay.slug===item.slug?' aria-current="page"':""}>${escape(essay.title)}</a></li>`).join("")}</ol></nav>
  </details>`;
}
