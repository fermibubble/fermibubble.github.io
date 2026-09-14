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
let activeResult = -1;

async function loadIndex() {
  if (index.length) return index;
  try {
    const response = await fetch("/search-index.json");
    index = await response.json();
  } catch (_) {
    index = [];
  }
  return index;
}

function renderResults(query) {
  const normalized = query.trim().toLowerCase();
  activeResult = -1;
  if (!normalized) {
    searchResults.innerHTML = '<p class="search-hint">Start typing to search the field notes.</p>';
    return;
  }

  const words = normalized.split(/\s+/);
  const matches = index
    .map((entry) => {
      const haystack = `${entry.type} ${entry.title} ${entry.description}`.toLowerCase();
      const score = words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(({ entry }) => entry);

  if (!matches.length) {
    searchResults.innerHTML = '<p class="search-empty">No matching field notes. Try a broader idea.</p>';
    return;
  }

  searchResults.innerHTML = matches
    .map((entry) => `<a class="search-result" href="${entry.url}"><span>${entry.type}</span><div><strong>${entry.title}</strong><small>${entry.description}</small></div></a>`)
    .join("");
}

async function openSearch() {
  if (!searchDialog) return;
  await loadIndex();
  searchDialog.showModal();
  searchInput?.focus();
}

function closeSearch() {
  searchDialog?.close();
  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = '<p class="search-hint">Start typing to search the field notes.</p>';
}

document.querySelector("[data-search-open]")?.addEventListener("click", openSearch);
document.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);

searchDialog?.addEventListener("click", (event) => {
  if (event.target === searchDialog) closeSearch();
});

searchInput?.addEventListener("input", (event) => renderResults(event.target.value));
searchInput?.addEventListener("keydown", (event) => {
  const results = [...searchResults.querySelectorAll(".search-result")];
  if (!results.length) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    activeResult = event.key === "ArrowDown"
      ? (activeResult + 1) % results.length
      : (activeResult - 1 + results.length) % results.length;
    results.forEach((item, i) => item.classList.toggle("is-active", i === activeResult));
    results[activeResult].scrollIntoView({ block: "nearest" });
  }
  if (event.key === "Enter" && activeResult >= 0) {
    event.preventDefault();
    results[activeResult].click();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchDialog?.open ? closeSearch() : openSearch();
  }
  if (event.key === "/" && !searchDialog?.open && document.activeElement?.tagName !== "INPUT") {
    event.preventDefault();
    openSearch();
  }
});

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
