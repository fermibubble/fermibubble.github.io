import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ideas, notes, principles, projects, site, writing } from "../src/content.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
const siteOrigin = "https://oddly.fyi";
const absoluteUrl = (path) => new URL(path, siteOrigin).href;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const inline = (value) => {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return text;
};

function markdown(source) {
  const lines = source.trim().split("\n");
  const html = [];
  let paragraph = [];
  let list = null;
  let quote = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    html.push(`<${list.type}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };

  const flushQuote = () => {
    if (!quote.length) return;
    html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushAll();
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const id = heading[2]
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      html.push(`<h${level} id="${id}">${inline(heading[2])}<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`);
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      quote.push(line.slice(2));
      continue;
    }

    const unordered = line.match(/^-\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(unordered[1]);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushAll();
  return html.join("\n");
}

const icon = {
  arrow: `<svg aria-hidden="true" viewBox="0 0 16 16"><path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5"/></svg>`,
  search: `<svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="9" cy="9" r="5.75"/><path d="m13.5 13.5 4 4"/></svg>`,
  sun: `<svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.2"/><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M16 4l-1.4 1.4M5.4 14.6 4 16"/></svg>`,
  moon: `<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M16.6 12.9A7.2 7.2 0 0 1 7.1 3.4 7.2 7.2 0 1 0 16.6 12.9Z"/></svg>`,
  copy: `<svg aria-hidden="true" viewBox="0 0 20 20"><rect x="6.5" y="6.5" width="9" height="9" rx="1.5"/><path d="M13.5 6.5V5A1.5 1.5 0 0 0 12 3.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5"/></svg>`
};

const navItems = [
  ["Writing", "/writing/", "writing"],
  ["Notes", "/notes/", "notes"],
  ["Focus", "/projects/", "projects"],
  ["Principles", "/principles/", "principles"],
  ["About", "/about/", "about"]
];

function header(active = "") {
  return `
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="site-header" data-header>
      <div class="header-inner">
        <a class="brand" href="/" aria-label="${escapeHtml(site.name)}, home">
          <img class="brand-mark" src="/assets/mark.svg" alt="" width="31" height="31">
          <span class="brand-name">${escapeHtml(site.name)}</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
          <span></span><span></span><span class="sr-only">Open navigation</span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="Primary" data-nav>
          ${navItems
            .map(
              ([label, href, key]) =>
                `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`
            )
            .join("")}
        </nav>
        <div class="header-actions">
          <button class="icon-button search-button" type="button" aria-label="Search" data-search-open>${icon.search}<span>Search</span><kbd>⌘K</kbd></button>
          <button class="icon-button theme-button" type="button" aria-label="Switch color theme" data-theme-toggle><span class="sun">${icon.sun}</span><span class="moon">${icon.moon}</span></button>
        </div>
      </div>
    </header>`;
}

function searchDialog() {
  return `
    <dialog class="search-dialog" data-search-dialog aria-label="Search the site">
      <div class="search-shell">
        <div class="search-field">
          ${icon.search}
          <input type="search" autocomplete="off" placeholder="Search writing, notes, and ideas…" aria-label="Search" data-search-input>
          <button type="button" data-search-close aria-label="Close search">Esc</button>
        </div>
        <div class="search-results" data-search-results>
          <p class="search-hint">Start typing to search the field notes.</p>
        </div>
        <div class="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></div>
      </div>
    </dialog>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <a class="footer-name" href="/">${escapeHtml(site.name)}</a>
          <p>By <a href="/about/" rel="author">${escapeHtml(site.author)}</a></p>
          <p>Systems should earn the authority we give them.</p>
        </div>
        <div class="footer-links">
          <a href="/anti-patterns/">Earlier writing</a>
          <a href="/ideas/">Ideas</a>
          <a href="/rss.xml">RSS</a>
          <a href="/about/">About</a>
        </div>
        <p class="footer-edition">Edition 0.1<br>© 2026</p>
      </div>
    </footer>`;
}

function layout({ title, description, active, content, article = false, path = "/" }) {
  const pageTitle = title ? `${title} — ${site.name}` : site.title;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description || site.description)}">
    <meta name="author" content="${escapeHtml(site.author)}">
    <meta name="theme-color" content="#f1efe8">
    <meta property="og:type" content="${article ? "article" : "website"}">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(description || site.description)}">
    <meta property="og:url" content="${escapeHtml(absoluteUrl(path))}">
    <link rel="canonical" href="${escapeHtml(absoluteUrl(path))}">
    <link rel="icon" href="/assets/mark.svg" type="image/svg+xml">
    <link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.name)}" href="/rss.xml">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>try{const t=localStorage.getItem('cm-theme');if(t)document.documentElement.dataset.theme=t;else if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}</script>
    <script type="module" src="/assets/site.js"></script>
  </head>
  <body data-path="${escapeHtml(path)}"${article ? ' class="article-page"' : ""}>
    ${article ? '<div class="reading-progress" data-reading-progress></div>' : ""}
    ${header(active)}
    ${content}
    ${footer()}
    ${searchDialog()}
  </body>
</html>`;
}

function arrowLink(label, href, className = "text-link") {
  return `<a class="${className}" href="${href}"><span>${label}</span>${icon.arrow}</a>`;
}

function featureCard(article, index) {
  return `<article class="feature-card feature-${index + 1}">
    <a href="/writing/${article.slug}/" aria-label="Read ${escapeHtml(article.title)}"></a>
    <div class="card-topline"><span>${escapeHtml(article.eyebrow)}</span><span>0${index + 1}</span></div>
    <div class="card-copy">
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.description)}</p>
    </div>
    <div class="card-meta"><span>${article.readTime}</span><span class="circle-arrow">${icon.arrow}</span></div>
  </article>`;
}

function homePage() {
  const recentNotes = notes.slice(0, 5);
  const content = `
    <main id="content">
      <section class="hero shell">
        <div class="hero-kicker reveal"><span class="signal-dot"></span> By ${escapeHtml(site.author)} · Field notes</div>
        <div class="hero-grid">
          <div class="hero-copy reveal reveal-delay-1">
            <h1>${escapeHtml(site.statement)}</h1>
            <p>${escapeHtml(site.intro)}</p>
            ${arrowLink("Read the writing", "/writing/", "primary-link")}
          </div>
          <div class="decision-map reveal reveal-delay-2" aria-label="A decision cycle from evidence to memory">
            <div class="map-label">A dependable decision system</div>
            <div class="map-center"><span>Trust</span><small>is earned</small></div>
            <div class="map-node node-1"><span>01</span><strong>Evidence</strong><small>What do we know?</small></div>
            <div class="map-node node-2"><span>02</span><strong>Judgment</strong><small>What does it mean?</small></div>
            <div class="map-node node-3"><span>03</span><strong>Action</strong><small>What may we do?</small></div>
            <div class="map-node node-4"><span>04</span><strong>Memory</strong><small>What changed?</small></div>
            <svg class="map-lines" viewBox="0 0 500 500" aria-hidden="true"><circle cx="250" cy="250" r="158"/><circle cx="250" cy="250" r="96"/><path d="M250 92a158 158 0 0 1 158 158"/><path d="m398 231 10 19 13-17"/></svg>
          </div>
        </div>
        <div class="hero-index reveal reveal-delay-3">
          <span>Autonomous agents</span><span>Trustworthiness</span><span>Learning &amp; adaptation</span><span>Systems engineering</span>
        </div>
      </section>

      <section class="section shell featured-section">
        <div class="section-heading">
          <div><span class="section-index">01</span><h2>Featured writing</h2></div>
          ${arrowLink("All writing", "/writing/")}
        </div>
        <div class="feature-grid">
          ${writing.filter((item) => item.featured).map(featureCard).join("")}
        </div>
      </section>

      <section class="section shell notes-section">
        <div class="section-heading">
          <div><span class="section-index">02</span><h2>Recent notes</h2></div>
          ${arrowLink("All notes", "/notes/")}
        </div>
        <div class="notes-table">
          ${recentNotes
            .map(
              (note) => `<a class="note-row" href="/notes/${note.slug}/">
                <time datetime="${note.date}">${note.displayDate.replace(", 2026", "")}</time>
                <span><strong>${escapeHtml(note.title)}</strong><small>${escapeHtml(note.description)}</small></span>
                <span class="note-time">${note.readTime}</span>
                <span class="note-arrow">${icon.arrow}</span>
              </a>`
            )
            .join("")}
        </div>
      </section>

      <section class="section principle-callout">
        <div class="shell principle-callout-inner">
          <div class="callout-copy">
            <span class="section-index">03 / A working philosophy</span>
            <blockquote>“Build trust into the system. Give autonomy clear boundaries. Learn from consequences.”</blockquote>
            ${arrowLink("Explore the principles", "/principles/", "primary-link light-link")}
          </div>
          <div class="callout-numbers" aria-hidden="true"><span>08</span><small>principles<br>for autonomy</small></div>
        </div>
      </section>

      <section class="section shell inquiry-section">
        <div class="section-heading">
          <div><span class="section-index">04</span><h2>Currently thinking about</h2></div>
          ${arrowLink("Open notebook", "/ideas/")}
        </div>
        <div class="idea-preview">
          <span class="idea-mark">?</span>
          <p>${escapeHtml(ideas[0])}</p>
          <span class="idea-count">01 / ${String(ideas.length).padStart(2, "0")}</span>
        </div>
      </section>
    </main>`;
  return layout({ content, path: "/" });
}

function pageIntro(kicker, title, description, count) {
  return `<section class="page-intro shell">
    <div class="page-intro-kicker"><span>${escapeHtml(kicker)}</span>${count ? `<span>${escapeHtml(count)}</span>` : ""}</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
  </section>`;
}

function writingPage() {
  const content = `<main id="content">
    ${pageIntro("Essays & perspectives", "Writing", "Ideas on autonomous agents, trustworthiness, and the relationship between intelligence and judgment.", `${writing.length} essays`)}
    <section class="shell archive-list">
      ${writing
        .map(
          (item, i) => `<article class="archive-item">
            <a class="archive-link" href="/writing/${item.slug}/" aria-label="Read ${escapeHtml(item.title)}"></a>
            <div class="archive-index">0${i + 1}</div>
            <div class="archive-main"><div class="archive-eyebrow">${escapeHtml(item.eyebrow)}</div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></div>
            <div class="archive-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.readTime}</span><span class="circle-arrow">${icon.arrow}</span></div>
          </article>`
        )
        .join("")}
    </section>
  </main>`;
  return layout({ title: "Writing", description: "Essays on autonomous agents, trustworthiness, and judgment.", active: "writing", content, path: "/writing/" });
}

function notesPage() {
  const years = [...new Set(notes.map((item) => item.date.slice(0, 4)))];
  const content = `<main id="content">
    ${pageIntro("Short observations", "Notes", "Smaller ideas, distinctions, and questions published before they demand the shape of an essay.", `${notes.length} notes`)}
    <section class="shell notes-archive">
      ${years
        .map(
          (year) => `<div class="notes-year"><h2>${year}</h2><div class="notes-table">${notes
            .filter((item) => item.date.startsWith(year))
            .map(
              (note) => `<a class="note-row" href="/notes/${note.slug}/"><time datetime="${note.date}">${note.displayDate.replace(`, ${year}`, "")}</time><span><strong>${escapeHtml(note.title)}</strong><small>${escapeHtml(note.description)}</small></span><span class="note-time">${note.readTime}</span><span class="note-arrow">${icon.arrow}</span></a>`
            )
            .join("")}</div></div>`
        )
        .join("")}
    </section>
  </main>`;
  return layout({ title: "Notes", description: "Short reflections on intelligence, learning, and dependable systems.", active: "notes", content, path: "/notes/" });
}

function projectsPage() {
  const content = `<main id="content">
    ${pageIntro("Areas of interest", "Focus", "I work on autonomous agents, embedding trustworthiness, and systems that learn from experience.", `${projects.length} themes`)}
    <section class="shell project-list">
      ${projects
        .map(
          (project) => `<article class="project-item">
            <div class="project-side"><span>${project.index}</span><span class="status"><i></i>${escapeHtml(project.status)}</span></div>
            <div class="project-main"><span class="project-label">${escapeHtml(project.label)}</span><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p>
              <div class="project-questions"><h3>Questions I return to</h3><ul>${project.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul></div>
            </div>
          </article>`
        )
        .join("")}
    </section>
  </main>`;
  return layout({ title: "Focus", description: "Engineering autonomous agents, embedding trustworthiness, and learning from experience.", active: "projects", content, path: "/projects/" });
}

function principlesPage() {
  const content = `<main id="content">
    ${pageIntro("A working philosophy", "Principles", "Eight ideas that shape how I think about intelligence, autonomy, and trust.", "v0.1 / evolving")}
    <section class="shell principle-list">
      ${principles
        .map(
          (principle) => `<article class="principle-item"><span>${principle.number}</span><h2>${escapeHtml(principle.title)}</h2><p>${escapeHtml(principle.text)}</p></article>`
        )
        .join("")}
    </section>
    <section class="shell principles-end"><p>These principles are open to revision. Experience, thoughtful questions, and better ideas should help them evolve.</p></section>
  </main>`;
  return layout({ title: "Principles", description: "Eight principles for trustworthy autonomous systems.", active: "principles", content, path: "/principles/" });
}

function ideasPage() {
  const content = `<main id="content">
    ${pageIntro("Open notebook", "Ideas in progress", "Questions I have not resolved yet. Publishing them early makes the edges of the work visible.", `${ideas.length} open questions`)}
    <section class="shell ideas-list">
      ${ideas.map((idea, i) => `<article><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(idea)}</p><div aria-hidden="true">?</div></article>`).join("")}
    </section>
  </main>`;
  return layout({ title: "Ideas", description: "Open questions about autonomy, trust, learning, and human judgment.", content, path: "/ideas/" });
}

function aboutPage() {
  const content = `<main id="content">
    <section class="about-hero shell">
      <div class="about-index">About / 2026</div>
      <div class="about-grid">
        <h1>I am interested in the gap between systems that <em>can act</em> and systems that <em>deserve authority.</em></h1>
        <div class="about-monogram" aria-hidden="true"><span>C</span><span>M</span></div>
      </div>
    </section>
    <section class="about-body shell">
      <div class="about-label">A short introduction</div>
      <div class="about-copy">
        <p>I’m Chaitanya Meesala. I work on engineering autonomous agents and embedding trustworthiness into intelligent systems.</p>
        <p>I’m interested in how these systems reason, act, and learn—and how thoughtful engineering can make them dependable. A recurring question in my work is how growing capability can come with a deeper sense of responsibility.</p>
        <p>Oddly is my space for ideas about autonomy, trust, and systems engineering. The essays, notes, and open questions reflect how my thinking is evolving.</p>
        <blockquote>I want to build systems that earn trust through the way they understand, act, and learn.</blockquote>
      </div>
    </section>
    <section class="about-now shell">
      <div><span>Engineering</span><strong>Autonomous agents</strong></div>
      <div><span>Embedding</span><strong>Trustworthiness</strong></div>
      <div><span>Exploring</span><strong>Learning &amp; judgment</strong></div>
    </section>
  </main>`;
  return layout({ title: "About", description: "About Chaitanya Meesala and this technical notebook.", active: "about", content, path: "/about/" });
}

function articlePage(item, type, index, collection) {
  const active = type === "Writing" ? "writing" : "notes";
  const base = type === "Writing" ? "writing" : "notes";
  const next = collection[index + 1];
  const previous = collection[index - 1];
  const content = `<main id="content">
    <article class="article">
      <header class="article-header shell-narrow">
        <a class="article-back" href="/${base}/">${icon.arrow}<span>All ${base}</span></a>
        <div class="article-type">${escapeHtml(type)} / ${String(index + 1).padStart(2, "0")}</div>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="article-deck">${escapeHtml(item.description)}</p>
        <p class="article-byline">By <a href="/about/" rel="author">${escapeHtml(site.author)}</a></p>
        <div class="article-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.readTime} read</span><button type="button" data-copy-link>${icon.copy}<span>Copy link</span></button></div>
      </header>
      <div class="article-rule shell"></div>
      <div class="article-layout shell">
        <aside class="article-rail"><span>${type === "Writing" ? escapeHtml(item.eyebrow) : "Note"}</span><div class="rail-line"></div><span>${item.date.slice(0, 4)}</span></aside>
        <div class="prose" data-article-body>${markdown(item.body)}</div>
      </div>
    </article>
    <nav class="article-pagination shell" aria-label="More ${base}">
      ${previous ? `<a class="pagination-prev" href="/${base}/${previous.slug}/"><span>Previous</span><strong>${escapeHtml(previous.title)}</strong></a>` : "<span></span>"}
      ${next ? `<a class="pagination-next" href="/${base}/${next.slug}/"><span>Next</span><strong>${escapeHtml(next.title)}</strong></a>` : `<a class="pagination-next" href="/${base}/"><span>Continue</span><strong>All ${type}</strong></a>`}
    </nav>
  </main>`;
  return layout({ title: item.title, description: item.description, active, content, article: true, path: `/${base}/${item.slug}/` });
}

function notFoundPage() {
  const content = `<main id="content" class="not-found shell"><span>404</span><h1>This path does not lead anywhere—yet.</h1><p>The notebook may have moved, or the idea may still be unwritten.</p>${arrowLink("Return home", "/", "primary-link")}</main>`;
  return layout({ title: "Not found", description: "Page not found.", content, path: "/404.html" });
}

function articleRedirect(item) {
  const path = `/writing/${item.slug}/`;
  const content = `<main id="content" class="not-found shell"><h1>${escapeHtml(item.title)}</h1><p>This essay has a new address.</p>${arrowLink("Read the essay", path, "primary-link")}</main>`;
  return layout({ title: item.title, description: item.description, active: "writing", content, path })
    .replace("<head>", `<head>\n    <meta http-equiv="refresh" content="0; url=${path}">`);
}

async function emit(relative, contents) {
  const target = join(out, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
}

function searchIndex() {
  return [
    ...writing.map((item) => ({ type: "Writing", title: item.title, description: item.description, url: `/writing/${item.slug}/` })),
    ...notes.map((item) => ({ type: "Note", title: item.title, description: item.description, url: `/notes/${item.slug}/` })),
    { type: "Page", title: "Focus", description: "Engineering autonomous agents, embedding trustworthiness, and learning from experience.", url: "/projects/" },
    { type: "Page", title: "Principles", description: "Eight principles for trustworthy autonomous systems.", url: "/principles/" },
    { type: "Page", title: "Ideas in progress", description: "Open questions about autonomy, trust, learning, and human judgment.", url: "/ideas/" },
    { type: "Page", title: "About", description: "About Chaitanya and Oddly.", url: "/about/" }
  ];
}

function rss() {
  const items = [...writing, ...notes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => {
      const base = writing.includes(item) ? "writing" : "notes";
      const url = escapeHtml(absoluteUrl(`/${base}/${item.slug}/`));
      return `<item><title>${escapeHtml(item.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${item.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(item.description)}</description></item>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(site.name)}</title><link>${siteOrigin}/</link><description>${escapeHtml(site.description)}</description>${items}</channel></rss>`;
}

function atom() {
  const articles = [...writing, ...notes].sort((a, b) => b.date.localeCompare(a.date));
  const entries = articles.map((item) => {
    const base = writing.includes(item) ? "writing" : "notes";
    const url = escapeHtml(absoluteUrl(`/${base}/${item.slug}/`));
    return `<entry><title>${escapeHtml(item.title)}</title><id>${url}</id><link href="${url}"/><updated>${item.date}T12:00:00Z</updated><summary>${escapeHtml(item.description)}</summary></entry>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHtml(site.name)}</title><id>${siteOrigin}/</id><link href="${siteOrigin}/"/><link rel="self" href="${siteOrigin}/atom.xml"/><updated>${articles[0].date}T12:00:00Z</updated><author><name>${escapeHtml(site.author)}</name></author>${entries}</feed>`;
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await Promise.all([
  emit("index.html", homePage()),
  emit("writing/index.html", writingPage()),
  emit("notes/index.html", notesPage()),
  emit("projects/index.html", projectsPage()),
  emit("principles/index.html", principlesPage()),
  emit("ideas/index.html", ideasPage()),
  emit("about/index.html", aboutPage()),
  emit("404.html", notFoundPage()),
  emit("search-index.json", `${JSON.stringify(searchIndex(), null, 2)}\n`),
  emit("rss.xml", rss()),
  emit("feed.xml", rss()),
  emit("atom.xml", atom()),
  emit(".nojekyll", ""),
  emit("CNAME", `${new URL(siteOrigin).hostname}\n`),
  emit("robots.txt", "User-agent: *\nAllow: /\n")
]);

await Promise.all(
  writing.map((item, index) => emit(`writing/${item.slug}/index.html`, articlePage(item, "Writing", index, writing)))
);
await Promise.all(notes.map((item, index) => emit(`notes/${item.slug}/index.html`, articlePage(item, "Note", index, notes))));
await Promise.all(writing.flatMap((item) => (item.aliases || []).map((alias) => emit(`writing/${alias}/index.html`, articleRedirect(item)))));

await mkdir(join(out, "assets"), { recursive: true });
await cp(join(root, "legacy"), out, { recursive: true });
await cp(join(root, "assets"), join(out, "assets"), { recursive: true });
await cp(join(root, "lnr-code.ico"), join(out, "lnr-code.ico"));
await cp(join(root, "lnr-code.ico"), join(out, "favicon.ico"));
await Promise.all([
  cp(join(root, "src", "styles.css"), join(out, "assets", "styles.css")),
  cp(join(root, "src", "site.js"), join(out, "assets", "site.js")),
  cp(join(root, "src", "mark.svg"), join(out, "assets", "mark.svg"))
]);

console.log(`Built ${writing.length + notes.length + 8} current pages and preserved the earlier site pages in ${out}`);

if (process.argv.includes("--publish-root")) {
  for (const name of await readdir(out)) {
    await cp(join(out, name), join(root, name), { recursive: true });
  }
  console.log("Updated the static files published from the repository root.");
}
