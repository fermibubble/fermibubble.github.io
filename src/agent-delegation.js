// Progressive enhancement: all scenarios remain readable without JavaScript.
for (const root of document.querySelectorAll("[data-delegation]")) {
  const buttons = [...root.querySelectorAll("button[data-scenario]")];
  const panels = [...root.querySelectorAll("[data-delegation-panel]")];
  const select = id => {
    if (!panels.some(panel => panel.dataset.delegationPanel === id)) return;
    for (const panel of panels) panel.hidden = panel.dataset.delegationPanel !== id;
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.scenario === id));
  };
  for (const button of buttons) button.addEventListener("click", () => select(button.dataset.scenario));
  select("admitted");
  root.querySelector("[data-delegation-controls]").hidden = false;
}
