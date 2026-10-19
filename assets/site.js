import { searchEntries } from "./search.js?v=ed1872af207ee669";
const root = document.documentElement;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");

const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 10);
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("is-open", !open);
  document.body.style.overflow = open ? "" : "hidden";
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
    document.body.style.overflow = "";
  });
});

themeToggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("cm-theme", next); } catch (_) {}
});

let index = [];
let indexError = false;
const status = document.querySelector('[data-search-status]');
async function loadIndex() {
  if (index.length) return index;
  try {
    const response = await fetch('/search-index.json?v=ed1872af207ee669');
    if (!response.ok) throw new Error('Search unavailable');
    index = await response.json(); indexError = false;
  } catch (_) { indexError = true; }
  return index;
}
function renderResults(query) {
  if (!searchResults) return;
  searchResults.replaceChildren();
  const matches = searchEntries(index, query);
  const full = Boolean(document.querySelector('[data-search-page]'));
  const visible = full ? matches : matches.slice(0, 8);
  if (status) status.textContent = indexError ? 'Search could not load. Please retry or browse Writing.' : !query.trim() ? 'Search titles, article text, and concepts.' : `${matches.length} result${matches.length === 1 ? '' : 's'}${matches.length > visible.length ? `; showing ${visible.length}` : ''}.`;
  for (const entry of visible) {
    const link = document.createElement('a'); link.className = 'search-result'; link.href = entry.href;
    const type = document.createElement('span'); type.textContent = entry.type;
    const body = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = entry.title;
    const snippet = document.createElement('small'); snippet.textContent = `${entry.sectionTitle ? `${entry.sectionTitle} · ` : ''}${entry.snippet}`;
    body.append(title, snippet); link.append(type, body); searchResults.append(link);
  }
  if (matches.length > visible.length) {
    const more = document.createElement('a'); more.href = `/search/?q=${encodeURIComponent(query)}`;
    more.className = 'search-more'; more.textContent = `View all ${matches.length} results`; searchResults.append(more);
  }
  if (query.trim() && !matches.length && !indexError) {
    const help = document.createElement('p'); help.className = 'search-hint'; help.textContent = 'Try fewer words, or explore the glossary on Start here.'; searchResults.append(help);
  }
}
async function openSearch() {
  if (!searchDialog) { searchInput?.focus(); return; }
  searchDialog.showModal(); searchInput?.focus();
  if (status) status.textContent = 'Loading search…';
  await loadIndex(); renderResults(searchInput?.value || '');
}
function closeSearch() { searchDialog?.close(); }
document.querySelector('[data-search-open]')?.addEventListener('click', openSearch);
document.querySelector('[data-search-close]')?.addEventListener('click', closeSearch);
searchDialog?.addEventListener('click', event => { if (event.target === searchDialog) closeSearch(); });
searchInput?.addEventListener('input', event => {
  renderResults(event.target.value);
  if (document.querySelector('[data-search-page]')) history.replaceState(null, '', `/search/?q=${encodeURIComponent(event.target.value)}`);
});
// Move actual focus among ordinary links. Screen readers announce each destination;
// Tab and Shift+Tab remain native, and Escape remains the native dialog action.
const searchScope = searchDialog || document.querySelector('[data-search-page]');
searchScope?.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  const links = [...searchResults.querySelectorAll('a')]; if (!links.length) return;
  const current = links.indexOf(document.activeElement);
  event.preventDefault();
  if (event.key === 'ArrowUp' && current === 0) { searchInput.focus(); return; }
  links[event.key === 'ArrowDown' ? (current + 1) % links.length : (current < 0 ? links.length - 1 : (current - 1 + links.length) % links.length)].focus();
});
document.addEventListener('keydown', event => {
  const typing = document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' || event.key === '/' && !typing && !searchDialog?.open) {
    event.preventDefault(); searchDialog?.open ? closeSearch() : openSearch();
  }
});
if (document.querySelector('[data-search-page]')) {
  searchInput.value = new URLSearchParams(location.search).get('q') || '';
  loadIndex().then(() => renderResults(searchInput.value));
}

const copyButton = document.querySelector("[data-copy-link]");
copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    const label = copyButton.querySelector("span");
    if (!label) return;
    const previous = label.textContent;
    label.textContent = "Copied";
    window.setTimeout(() => { label.textContent = previous; }, 1600);
  } catch (_) {}
});

const progress = document.querySelector("[data-reading-progress]");
const articleBody = document.querySelector("[data-article-body]");
if (progress && articleBody) {
  const updateProgress = () => {
    const start = articleBody.offsetTop - window.innerHeight * 0.25;
    const distance = articleBody.offsetHeight - window.innerHeight * 0.5;
    const amount = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
    progress.style.width = `${amount * 100}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

const prevalence = document.getElementById('prevalence');
if (prevalence) prevalence.disabled = false;
prevalence?.addEventListener('input', () => {
  const p = Number(prevalence.value) / 100, tp = 10000 * p * .9, fp = 10000 * (1-p) * .05;
  document.getElementById('prevalence-value').textContent = `${prevalence.value}%`;
  document.getElementById('prevalence-result').textContent = `${tp.toFixed(0)} true positives · ${fp.toFixed(0)} false positives · ${(100*tp/(tp+fp)).toFixed(1)}% precision`;
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') {
    navToggle.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open');
    document.body.style.overflow = ''; navToggle.focus();
  }
});
