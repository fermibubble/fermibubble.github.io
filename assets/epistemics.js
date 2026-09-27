const incidentRoot = document.querySelector("#epistemic-incident");

if (incidentRoot) {
  const select = (query) => incidentRoot.querySelector(query);
  const { steps } = JSON.parse(select("[data-incident-data]").textContent);
  const records = [...incidentRoot.querySelectorAll("[data-record]")];
  const buttons = [...incidentRoot.querySelectorAll("[data-step]")];
  const graph = select("[data-topology]");
  const edgeSvg = select(".ei-edges");
  const edgeGroup = select("[data-edges]");
  const connections = [
    ["gateway", "checkout"], ["gateway", "catalog"],
    ["checkout", "payments"], ["checkout", "inventory"],
    ["catalog", "inventory"], ["inventory", "database"]
  ];
  let selected = 0;

  function drawEdges() {
    const rect = graph.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    edgeSvg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    edgeGroup.replaceChildren();
    for (const [from, to] of connections) {
      const a = select(`[data-service="${from}"]`).getBoundingClientRect();
      const b = select(`[data-service="${to}"]`).getBoundingClientRect();
      const x1 = a.left - rect.left + a.width / 2;
      const y1 = a.bottom - rect.top;
      const x2 = b.left - rect.left + b.width / 2;
      const y2 = b.top - rect.top - 3;
      const middle = (y1 + y2) / 2;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${x1} ${y1} C ${x1} ${middle}, ${x2} ${middle}, ${x2} ${y2}`);
      path.setAttribute("class", "ei-edge");
      path.setAttribute("marker-end", "url(#ei-arrowhead)");
      edgeGroup.appendChild(path);
    }
  }

  function render(index, announce = true) {
    selected = Math.max(0, Math.min(steps.length - 1, index));
    const step = steps[selected];
    records.forEach((record, i) => { record.hidden = i !== selected; });
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === selected)));
    select("[data-metric-scope]").textContent = step.metricScope;
    select("[data-error-rate]").textContent = step.error;
    select("[data-latency]").textContent = step.latency;
    select("[data-previous]").disabled = selected === 0;
    select("[data-next-step]").disabled = selected === steps.length - 1;
    select("[data-revision-note]").textContent = selected === 0
      ? "Initial record · observations and hypotheses stay separate"
      : `Revision ${selected + 1} · earlier records remain available`;
    for (const [service, [label, health]] of Object.entries(step.nodes)) {
      const node = select(`[data-service="${service}"]`);
      node.dataset.health = health;
      node.querySelector("span").textContent = label;
    }
    if (announce) select("[data-incident-status]").textContent =
      `Record ${selected + 1} of ${steps.length}, ${step.time}: ${step.title}. ${step.metricScope}: errors ${step.error}, latency ${step.latency}.`;
    requestAnimationFrame(drawEdges);
  }

  buttons.forEach((button, i) => button.addEventListener("click", () => render(i)));
  select("[data-previous]").addEventListener("click", () => render(selected - 1));
  select("[data-next-step]").addEventListener("click", () => render(selected + 1));
  render(0, false);
  incidentRoot.querySelectorAll("[data-incident-controls]").forEach((control) => { control.hidden = false; });
  if ("ResizeObserver" in window) new ResizeObserver(drawEdges).observe(graph);
  else window.addEventListener("resize", drawEdges);
}
