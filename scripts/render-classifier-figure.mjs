// Small, semantic teaching figures embedded at the point of explanation.
export function renderClassifierFigure(source, escape) {
  const figure = JSON.parse(source);
  const e = value => escape(String(value));
  if (!figure.title) throw new Error("Classifier figure needs a title");
  if (figure.type === "table") {
    if (!figure.columns?.length || !figure.rows?.length || figure.rows.some(row => row.length !== figure.columns.length)) {
      throw new Error(`Invalid classifier table: ${figure.title}`);
    }
    return `<figure class="classifier-figure classifier-table-figure"><figcaption>${e(figure.title)}</figcaption>${figure.compact ? "" : '<p class="classifier-scroll-hint">Scroll sideways to compare all columns.</p>'}<div class="classifier-table-scroll" tabindex="0" role="region" aria-label="${e(figure.title)}. Scroll horizontally on small screens."><table class="classifier-table${figure.compact ? " classifier-table-compact" : ""}" aria-label="${e(figure.title)}"><thead><tr>${figure.columns.map(column => `<th scope="col">${e(column)}</th>`).join("")}</tr></thead><tbody>${figure.rows.map(row => `<tr>${row.map((cell, index) => index ? `<td>${e(cell)}</td>` : `<th scope="row">${e(cell)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>${figure.note ? `<p class="classifier-note">${e(figure.note)}</p>` : ""}</figure>`;
  }
  if (figure.type === "steps" || figure.type === "cards") {
    if (!figure.items?.length || figure.items.some(item => !item.title || !item.text)) throw new Error(`Invalid classifier figure: ${figure.title}`);
    return `<figure class="classifier-figure classifier-${figure.type}"><figcaption>${e(figure.title)}</figcaption><ol>${figure.items.map(item => `<li><strong>${e(item.title)}</strong><span>${e(item.text)}</span></li>`).join("")}</ol>${figure.note ? `<p class="classifier-note">${e(figure.note)}</p>` : ""}</figure>`;
  }
  throw new Error(`Unknown classifier figure type: ${figure.type}`);
}
