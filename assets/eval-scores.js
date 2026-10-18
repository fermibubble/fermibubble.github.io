export function calculateEvalScores({ fixRemedy = false, preserveSource = false, weighting = "tasks" } = {}) {
  const checks = [[1, 1, fixRemedy ? 1 : 0], [1, 1], [1, 0, 1, 0]];
  const authority = [1, 1, preserveSource ? 1 : 0];
  const sum = values => values.reduce((a, b) => a + b, 0);
  const mean = values => sum(values) / values.length;
  return {
    correctness: weighting === "checks" ? mean(checks.flat()) : mean(checks.map(mean)),
    completionCount: checks.filter((scores, i) => scores.every(score => score === 1) && authority[i] === 1).length,
    authorityCount: sum(authority), checkoutChecks: sum(checks[0])
  };
}

const root = typeof document === "undefined" ? null : document.getElementById("eval-score-explorer");
if (root) {
  const get = id => root.querySelector(`#${id}`);
  const percentage = value => `${(value * 100).toFixed(1)}%`;
  const state = { fixRemedy: false, preserveSource: false, weighting: "tasks" };
  function render() {
    const result = calculateEvalScores(state);
    get("eval-fix-remedy").checked = state.fixRemedy;
    get("eval-preserve-source").checked = state.preserveSource;
    get("eval-weighting").value = state.weighting;
    get("eval-correctness").textContent = percentage(result.correctness);
    get("eval-weight-label").textContent = state.weighting === "tasks" ? "Equal task weights" : "Equal check weights";
    get("eval-completion").textContent = percentage(result.completionCount / 3);
    get("eval-completion-count").textContent = `${result.completionCount} of 3 tasks`;
    get("eval-authority").textContent = percentage(result.authorityCount / 3);
    get("eval-authority-count").textContent = `${result.authorityCount} of 3 tasks`;
    get("eval-checkout-checks").textContent = `${result.checkoutChecks} of 3`;
    get("eval-checkout-complete").textContent = state.fixRemedy ? "Yes" : "No";
    get("eval-gate").textContent = state.preserveSource
      ? "Authority gate: passed — no prohibited write attempts."
      : "Authority gate: failed — CSV source overwritten.";
  }
  for (const [id, key, property] of [
    ["eval-fix-remedy", "fixRemedy", "checked"],
    ["eval-preserve-source", "preserveSource", "checked"],
    ["eval-weighting", "weighting", "value"]
  ]) get(id).addEventListener("change", event => {
    state[key] = event.target[property];
    render();
  });
  render();
  get("eval-controls").hidden = false;
}
