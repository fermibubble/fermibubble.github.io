// Render the whole record at build time. JavaScript adds checkpoint navigation;
// every checkpoint and its structured record remain readable without it.
export function renderIncident(incident, escape) {
  const first = incident.steps[0];
  const services = {
    gateway: "API gateway", checkout: "Checkout API", catalog: "Catalog API",
    payments: "Payments", inventory: "Inventory", database: "PostgreSQL"
  };
  const json = JSON.stringify(incident).replaceAll("<", "\\u003c");
  return `<section id="epistemic-incident" class="ei-notebook" aria-labelledby="ei-title">
    <div class="ei-notebook-head"><h2 id="ei-title">Follow the evidence</h2><span>INCIDENT ${escape(incident.id)} / ILLUSTRATIVE</span></div>
    <nav class="ei-checkpoints" aria-label="Incident checkpoints" data-incident-controls hidden>
      ${incident.steps.map((step, i) => `<button class="ei-checkpoint" type="button" data-step="${i}" aria-pressed="${i === 0}" aria-controls="ei-records"><time>${step.time}</time><span>${escape(step.label)}</span></button>`).join("")}
    </nav>
    <div class="ei-case-grid">
      <figure class="ei-topology-panel" aria-label="Request topology and observed service state">
        <div class="ei-small-label" data-metric-scope>${escape(first.metricScope)}</div>
        <div class="ei-metrics">
          <div><span class="ei-metric-label">5XX error rate</span><span class="ei-metric-value" data-error-rate>${first.error}</span></div>
          <div><span class="ei-metric-label">p95 latency</span><span class="ei-metric-value" data-latency>${first.latency}</span></div>
        </div>
        <div class="ei-graph" data-topology>
          <svg class="ei-edges" aria-hidden="true"><defs><marker id="ei-arrowhead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path class="ei-arrow" d="M0 0 L8 4 L0 8 Z"/></marker></defs><g data-edges></g></svg>
          ${Object.entries(services).map(([key, name]) => `<div class="ei-node" data-service="${key}" data-health="${first.nodes[key][1]}"><strong>${name}</strong><span>${escape(first.nodes[key][0])}</span></div>`).join("")}
        </div>
        <div class="ei-legend"><span><i class="ei-dot affected"></i>Observed impact</span><span><i class="ei-dot nominal"></i>Measured as normal</span><span><i class="ei-dot"></i>Unchecked</span></div>
        <figcaption class="ei-topology-caption">Arrows follow requests downstream. The gateway calls Checkout and Catalog; both call Inventory. Checkout also calls Payments. Inventory calls PostgreSQL. Colors describe the displayed measurements, not every aspect of service health.</figcaption>
      </figure>
      <div id="ei-records">
        ${incident.steps.map((step, i) => {
          const record = {
            incident: incident.id, revision: i + 1, recorded_at: step.time,
            supersedes: i || null, scope: step.scope, observations: step.observed,
            belief: step.belief, confidence: step.confidence,
            evidence: step.basis, next_action: step.next, revisit_if: step.revisit
          };
          return `<section class="ei-record" data-record="${i}" aria-labelledby="ei-record-${i}">
            <div class="ei-small-label">Record ${String(i + 1).padStart(2, "0")} / 06 · ${step.time}</div>
            <h3 id="ei-record-${i}">${escape(step.title)}</h3>
            <span class="ei-confidence">${escape(step.confidence)}</span>
            <dl>
              <dt>Observed</dt><dd>${escape(step.observed)}</dd>
              <dt>Current belief</dt><dd>${escape(step.belief)}</dd>
              <dt>Next action</dt><dd>${escape(step.next)}</dd>
            </dl>
            <div class="ei-evidence-source">Basis: ${escape(step.basis.join(" · "))}</div>
            <details><summary>Inspect the structured record</summary><pre>${escape(JSON.stringify(record, null, 2))}</pre></details>
          </section>`;
        }).join("")}
      </div>
    </div>
    <div class="ei-notebook-foot" data-incident-controls hidden>
      <span class="ei-note" data-revision-note>Initial record · observations and hypotheses stay separate</span>
      <div class="ei-step-controls"><button type="button" data-previous disabled>Previous</button><button type="button" data-next-step>Next checkpoint</button></div>
    </div>
    <p class="sr-only" role="status" data-incident-status></p>
    <script type="application/json" data-incident-data>${json}</script>
  </section>`;
}
