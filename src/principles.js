document.querySelectorAll("[data-case-study]").forEach((study) => {
  const panels = [...study.querySelectorAll("[data-case-panel]")];
  const choices = [...study.querySelectorAll("[data-case-choice]")];
  const previous = study.querySelector("[data-case-prev]");
  const next = study.querySelector("[data-case-next]");
  let selected = 0;

  function select(index, announce = true) {
    selected = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => { panel.hidden = i !== selected; });
    choices.forEach((choice, i) => choice.setAttribute("aria-pressed", String(i === selected)));
    previous.disabled = selected === 0;
    next.disabled = selected === panels.length - 1;
    study.querySelector("[data-case-position]").textContent = `${selected + 1} of ${panels.length}`;
    if (announce) study.querySelector("[data-case-status]").textContent =
      `${selected + 1} of ${panels.length}: ${panels[selected].querySelector("h3").textContent}`;
  }

  choices.forEach((choice,i) => choice.addEventListener("click",() => select(i)));
  previous.addEventListener("click",() => select(selected - 1));
  next.addEventListener("click",() => select(selected + 1));
  select(0,false);
  study.querySelectorAll("[data-case-controls]").forEach((control) => { control.hidden = false; });
});
