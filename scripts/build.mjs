import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ideas, notes, projects, site, writing } from "../src/content.mjs";
import { renderIncident } from "./render-incident.mjs";
import { autonomyOverview, principleEssays } from "../src/principle-series.mjs";
import { renderCaseStudy, renderContextTable, renderSeriesMap, renderSeriesNavigation } from "./render-series.mjs";
import { autonomyPath, writingPath } from "../src/paths.mjs";
import { analyticsConfig } from "../src/analytics-config.mjs";
import { analyticsReady } from "../src/analytics-policy.js";

const allWriting = [...writing, ...principleEssays];
const retiredPaths = ["writing/judgment-under-uncertainty", "writing/rollouts-are-decision-problems"];

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
          <p>Agent infrastructure, context, and reproducible evaluation.</p>
        </div>
        <div class="footer-links">
          <a href="/anti-patterns/">Earlier writing</a>
          <a href="/ideas/">Ideas</a>
          <a href="/rss.xml">RSS</a>
          <a href="/about/">About</a>
          <a href="/privacy/">Privacy</a>
          <button type="button" data-analytics-settings hidden>Analytics preferences</button>
        </div>
        <p class="footer-edition">Edition 0.1<br>© 2026</p>
      </div>
    </footer>`;
}

function layout({ title, description, active, content, article = false, incident = false, series = false, path = "/" }) {
  const pageTitle = title ? `${title} — ${site.name}` : site.title;
  const typography = article
    ? path.startsWith('/notes/') ? 'note' : path.startsWith('/writing/trustworthy-autonomy/') ? 'principle' : path.startsWith('/writing/') ? 'essay' : 'archive'
    : ({ '/': 'home', '/writing/': 'writing', '/notes/': 'notes', '/projects/': 'focus', '/ideas/': 'ideas', '/about/': 'about' }[path] || 'utility');
  const serifPage = ['home', 'writing', 'essay', 'principle', 'archive', 'about', 'ideas'].includes(typography);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description || site.description)}">
    <meta name="author" content="${escapeHtml(site.author)}">
    <meta name="theme-color" content="#fbfcfe">
    <meta property="og:type" content="${article ? "article" : "website"}">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(description || site.description)}">
    <meta property="og:url" content="${escapeHtml(absoluteUrl(path))}">
    <link rel="canonical" href="${escapeHtml(absoluteUrl(path))}">
    <link rel="icon" href="/assets/mark.svg" type="image/svg+xml">
    <link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.name)}" href="/rss.xml">
    <link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/assets/styles.css">${incident ? '\n    <link rel="stylesheet" href="/assets/epistemics.css">' : ""}${series ? '\n    <link rel="stylesheet" href="/assets/principles.css">' : ""}
    <link rel="stylesheet" href="/assets/editorial.css">
    <link rel="stylesheet" href="/assets/typography.css?v=20260928">${serifPage ? '\n    <link rel="preload" href="/assets/fonts/newsreader-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>' : ''}
    <script>try{const t=localStorage.getItem('cm-theme');if(t)document.documentElement.dataset.theme=t;else if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}</script>
    <script type="module" src="/assets/site.js"></script>${incident ? '\n    <script type="module" src="/assets/epistemics.js"></script>' : ""}${series ? '\n    <script type="module" src="/assets/principles.js"></script>' : ""}
    <script type="module" src="/assets/analytics.js"></script>
  </head>
  <body data-path="${escapeHtml(path)}" data-typography="${typography}"${article ? ' class="article-page"' : ""}>
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
    <a href="${writingPath(article)}" aria-label="Read ${escapeHtml(article.title)}"></a>
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
        <div class="hero-kicker reveal"><span class="signal-dot"></span> By ${escapeHtml(site.author)} · Systems engineering</div>
        <div class="hero-grid">
          <div class="hero-copy reveal reveal-delay-1">
            <h1>${escapeHtml(site.statement)}</h1>
            <p>${escapeHtml(site.intro)}</p>
            ${arrowLink("Read the writing", "/writing/", "primary-link")}
          </div>
          <aside class="home-directory reveal reveal-delay-2" aria-label="Explore the work">
            <p class="directory-label">AREAS OF WORK</p>
            <a href="/writing/engineering-autonomous-agents/"><span>01</span><div><strong>Agent architecture</strong><small>Execution, memory, and the structure around a model.</small></div></a>
            <a href="/writing/local-context-for-autonomous-agents/"><span>02</span><div><strong>Context systems</strong><small>Data within reach. Evidence worth reasoning with.</small></div></a>
            <a href="/writing/checkpoint-replay-for-agent-evaluation/"><span>03</span><div><strong>Evaluation</strong><small>Repeatable experiments across long tasks.</small></div></a>
          </aside>
        </div>
        <div class="hero-index reveal reveal-delay-3">
          <span>Agent infrastructure</span><span>Local context</span><span>Observability</span><span>Reproducible evaluation</span>
        </div>
      </section>

      <section class="section shell featured-section">
        <div class="section-heading">
          <div><span class="section-index">01</span><h2>Featured writing</h2></div>
          ${arrowLink("All writing", "/writing/")}
        </div>
        <div class="feature-grid">
          ${writing.filter((item) => item.featured).slice(0, 3).map(featureCard).join("")}
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
            <span class="section-index">03 / Connecting the work</span>
            <blockquote>Make evidence queryable, execution reliable, and decisions reproducible.</blockquote>
            ${arrowLink("Explore the focus areas", "/projects/", "primary-link light-link")}
          </div>
          <div class="callout-numbers" aria-hidden="true"><span>${String(projects.length).padStart(2,"0")}</span><small>connected<br>areas of work</small></div>
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
    ${pageIntro("Essays & collections", "Writing", "Architecture and experiments in agent infrastructure, context, and evaluation. Trustworthy Autonomy brings the principles together in one collection.", `${writing.filter(item => !item.seriesOverview).length} essays · 1 collection`)}
    <section class="shell archive-list">
      ${writing
        .map(
          (item, i) => `<article class="archive-item">
            <a class="archive-link" href="${writingPath(item)}" aria-label="Read ${escapeHtml(item.title)}"></a>
            <div class="archive-index">${String(i + 1).padStart(2,"0")}</div>
            <div class="archive-main"><div class="archive-eyebrow">${item.seriesOverview ? "Collection · 9 chapters" : escapeHtml(item.eyebrow)}</div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></div>
            <div class="archive-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.seriesOverview ? "Explore the collection" : item.readTime}</span><span class="circle-arrow">${icon.arrow}</span></div>
          </article>`
        )
        .join("")}
    </section>
  </main>`;
  return layout({ title: "Writing", description: "Technical essays on agent infrastructure, local context, checkpoint replay, and trustworthy autonomy.", active: "writing", content, path: "/writing/" });
}

function notesPage() {
  const years = [...new Set(notes.map((item) => item.date.slice(0, 4)))];
  const content = `<main id="content">
    ${pageIntro("Short observations", "Notes", "Concrete distinctions from building agents: what to measure, where to enforce policy, and how to preserve useful state.", `${notes.length} notes`)}
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
  return layout({ title: "Notes", description: "Short technical notes on agent quality, execution, memory, and verification.", active: "notes", content, path: "/notes/" });
}

function projectsPage() {
  const content = `<main id="content">
    ${pageIntro("Areas of work", "Focus", "Three connected engineering problems: executing work, making evidence accessible, and measuring decisions across time.", `${projects.length} themes`)}
    <section class="shell project-list">
      ${projects
        .map(
          (project) => `<article class="project-item">
            <div class="project-side"><span>${project.index}</span><span class="status"><i></i>${escapeHtml(project.status)}</span></div>
            <div class="project-main"><span class="project-label">${escapeHtml(project.label)}</span><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p>
              <div class="project-questions"><h3>Questions I return to</h3><ul>${project.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul></div>
              ${arrowLink(`Read: ${escapeHtml(project.reading.title)}`, project.reading.href)}
            </div>
          </article>`
        )
        .join("")}
    </section>
  </main>`;
  return layout({ title: "Focus", description: "Agent systems, data and context, evaluation and learning.", active: "projects", content, path: "/projects/" });
}

function ideasPage() {
  const content = `<main id="content">
    ${pageIntro("Open notebook", "Ideas in progress", "Questions I have not resolved yet. Publishing them early makes the edges of the work visible.", `${ideas.length} open questions`)}
    <section class="shell ideas-list">
      ${ideas.map((idea, i) => `<article><span>${String(i + 1).padStart(2, "0")}</span><p>${escapeHtml(idea)}</p><div aria-hidden="true">?</div></article>`).join("")}
    </section>
  </main>`;
  return layout({ title: "Ideas", description: "Open questions about agent environments, context, replay, and reusable engineering.", content, path: "/ideas/" });
}

function aboutPage() {
  const content = `<main id="content">
    <section class="about-hero shell">
      <div class="about-index">About / 2026</div>
      <div class="about-grid">
        <h1>I build the infrastructure that lets agents <em>investigate, act, and improve.</em></h1>
        <div class="about-monogram" aria-hidden="true"><span>C</span><span>M</span></div>
      </div>
    </section>
    <section class="about-body shell">
      <div class="about-label">A short introduction</div>
      <div class="about-copy">
        <p>I’m Chaitanya Meesala. I work on autonomous agents and the data, execution, and evaluation systems around them.</p>
        <p>I’m interested in the architecture behind useful agents: how a coding assistant preserves progress, how a research agent keeps evidence traceable, and how a data pipeline turns information into a dependable working context. These questions connect software engineering, experimentation, and the philosophy of knowledge.</p>
        <p>Oddly is where I consolidate the architecture and lessons behind that work. The essays examine concrete designs and their tradeoffs. The notes isolate useful distinctions. Trustworthy Autonomy develops the principles of evidence, authority, and accountability within that broader systems perspective.</p>
        <blockquote>The interesting question is how an idea behaves once it becomes a running system.</blockquote>
      </div>
    </section>
    <section class="about-now shell">
      <div><span>Engineering</span><strong>Autonomous agents</strong></div>
      <div><span>Connecting</span><strong>Data &amp; context</strong></div>
      <div><span>Evaluating</span><strong>Replay &amp; outcomes</strong></div>
    </section>
  </main>`;
  return layout({ title: "About", description: "About Chaitanya Meesala and this technical notebook.", active: "about", content, path: "/about/" });
}

function articlePage(item, type, index, collection) {
  const active = type === "Writing" ? "writing" : "notes";
  const base = type === "Writing" ? "writing" : "notes";
  const series = !!(item.seriesNumber || item.seriesOverview);
  const enhanced = series || !!item.interactiveEssay;
  const pathFor = (article) => base === "writing" ? writingPath(article) : `/notes/${article.slug}/`;
  const next = item.seriesNumber ? principleEssays[item.seriesNumber] : collection[index + 1];
  const previous = item.seriesNumber ? principleEssays[item.seriesNumber - 2] : collection[index - 1];
  const content = `<main id="content">
    <article class="article${item.incident ? " article-epistemics" : ""}${enhanced ? " principle-article" : ""}${item.interactiveEssay ? " technical-article" : ""}">
      <header class="article-header shell-narrow">
        <a class="article-back" href="${item.seriesNumber ? autonomyPath : `/${base}/`}">${icon.arrow}<span>${item.seriesNumber ? "Trustworthy Autonomy" : `All ${base}`}</span></a>
        <div class="article-type">${item.seriesNumber ? `Trustworthy Autonomy / Chapter ${String(item.seriesNumber).padStart(2,"0")} of 09` : item.seriesOverview ? "Collection / Nine chapters" : item.interactiveEssay ? escapeHtml(item.eyebrow) : `${escapeHtml(type)} / ${String(index + 1).padStart(2,"0")}`}</div>
        <h1>${item.titleLines ? `${escapeHtml(item.titleLines[0])}<br><em>${escapeHtml(item.titleLines[1])}</em>` : escapeHtml(item.title)}</h1>
        <p class="article-deck">${escapeHtml(item.description)}</p>
        <p class="article-byline">By <a href="/about/" rel="author">${escapeHtml(site.author)}</a></p>
        <div class="article-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.readTime} read</span><button type="button" data-copy-link>${icon.copy}<span>Copy link</span></button></div>${item.seriesNumber ? '\n        <a class="series-home-link" href="/writing/trustworthy-autonomy/">Part of Trustworthy Autonomy ↗</a>' : ""}
      </header>
      <div class="article-rule shell"></div>
      ${enhanced ? `<div class="series-body${item.incident ? " epistemics-body" : ""}" data-article-body>${item.seriesNumber ? `\n        ${renderSeriesNavigation(item, principleEssays, escapeHtml)}` : ""}
        <div class="prose${item.incident ? " epistemics-intro" : ""}">${markdown(item.body)}</div>${item.contextTable ? `\n        ${renderContextTable(item.contextTable, escapeHtml)}` : ""}
        ${item.incident ? renderIncident(item.incident, escapeHtml) : item.caseStudy ? renderCaseStudy(item.caseStudy, escapeHtml) : renderSeriesMap(principleEssays, escapeHtml)}
        <div class="prose series-afterword${item.incident ? " epistemics-afterword" : ""}">${markdown(item.afterword)}</div>
      </div>` : item.incident ? `<div class="epistemics-body" data-article-body>
        <div class="prose epistemics-intro">${markdown(item.body)}</div>
        ${renderIncident(item.incident, escapeHtml)}
        <div class="prose epistemics-afterword">${markdown(item.afterword)}</div>
      </div>` : `<div class="article-layout shell">
        <aside class="article-rail"><span>${type === "Writing" ? escapeHtml(item.eyebrow) : "Note"}</span><div class="rail-line"></div><span>${item.date.slice(0, 4)}</span></aside>
        <div class="prose" data-article-body>${markdown(item.body)}</div>
      </div>`}
    </article>
    <nav class="article-pagination shell" aria-label="More ${base}">
      ${previous ? `<a class="pagination-prev" href="${pathFor(previous)}"><span>Previous${item.seriesNumber ? " chapter" : ""}</span><strong>${escapeHtml(previous.title)}</strong></a>` : item.seriesNumber ? '<a class="pagination-prev" href="/writing/trustworthy-autonomy/"><span>Collection overview</span><strong>Trustworthy Autonomy</strong></a>' : "<span></span>"}
      ${next ? `<a class="pagination-next" href="${pathFor(next)}"><span>Next${item.seriesNumber ? " chapter" : ""}</span><strong>${escapeHtml(next.title)}</strong></a>` : item.seriesNumber ? '<a class="pagination-next" href="/writing/trustworthy-autonomy/"><span>Back to the collection</span><strong>Trustworthy Autonomy</strong></a>' : `<a class="pagination-next" href="/${base}/"><span>Continue</span><strong>All ${type}</strong></a>`}
    </nav>
  </main>`;
  return layout({ title: item.title, description: item.description, active, content, article: true, incident: !!item.incident, series: enhanced, path: pathFor(item) });
}

function notFoundPage() {
  const content = `<main id="content" class="not-found shell"><span>404</span><h1>This path does not lead anywhere—yet.</h1><p>The notebook may have moved, or the idea may still be unwritten.</p>${arrowLink("Return home", "/", "primary-link")}</main>`;
  return layout({ title: "Not found", description: "Page not found.", content, path: "/404.html" });
}

function privacyPage() {
  const active = analyticsReady(analyticsConfig);
  const copy = active ? `
## Optional analytics

With your permission, Oddly uses PostHog to understand traffic sources, popular pages, clicks, scroll depth, reading time, browser performance, and JavaScript errors. A random browser identifier helps distinguish visits without requiring an account.

PostHog receives your IP address and can derive an approximate country, region, and city. That location is an estimate; it is not GPS or your street address. The analytics dashboard is private.

## Session replay

If you allow analytics, a replay may reconstruct your activity on this website, including navigation, clicks, and scrolling. It does not record your desktop or other tabs. Search, form inputs, and elements marked private are blocked or masked. Network request bodies, headers, and console logging are disabled. Recordings are retained for 30 days.

## Your choice

There is no automatic analytics popup. Analytics and replay load only after you open “Analytics preferences” in the footer and choose “Allow analytics.” You can withdraw permission using the same control. A decline, Global Privacy Control, or Do Not Track keeps collection off. Browser settings, blockers, and consent mean analytics will not represent every visit.

Your preference is remembered for up to 180 days in this browser. Withdrawing stops future collection; it does not erase previously collected events.
` : `
## Your visit

Optional analytics and session replay are currently off. This site does not load PostHog or send visitor events to it.

## Local preferences

Oddly stores your chosen color theme in your browser. Search runs against the site’s own index, without sending your search terms to an analytics service. Fonts are served directly from this website.

## Hosting

GitHub Pages serves this site. Like other web hosts, GitHub may process connection information, including IP addresses, to deliver pages and protect its services. See [GitHub’s privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
`;
  return layout({ title: "Privacy", description: "How Oddly handles local preferences and optional analytics.", path: "/privacy/", content: `<main id="content"><header class="page-intro shell"><div class="page-kicker">ABOUT THIS SITE</div><h1>Privacy</h1><p>Clear choices about your visit.</p></header><div class="privacy-copy prose">${markdown(copy)}</div></main>` });
}

function articleRedirect(item) {
  const path = writingPath(item);
  const content = `<main id="content" class="not-found shell"><h1>${escapeHtml(item.title)}</h1><p>This essay has a new address.</p>${arrowLink("Read the essay", path, "primary-link")}</main>`;
  return layout({ title: item.title, description: item.description, active: "writing", content, path })
    .replace(/[ \t]+$/gm, "")
    .replace("<head>", `<head>\n    <meta http-equiv="refresh" content="0; url=${path}">`);
}

async function emit(relative, contents) {
  const target = join(out, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
}

function searchIndex() {
  return [
    ...writing.map((item) => ({ type: item.seriesOverview ? "Collection" : "Writing", title: item.title, description: item.description, url: writingPath(item) })),
    ...principleEssays.map((item) => ({ type: "Chapter", title: item.title, description: `Trustworthy Autonomy · ${item.description}`, url: writingPath(item) })),
    ...notes.map((item) => ({ type: "Note", title: item.title, description: item.description, url: `/notes/${item.slug}/` })),
    { type: "Page", title: "Focus", description: "Agent systems, data and context, evaluation and learning.", url: "/projects/" },
    { type: "Page", title: "Ideas in progress", description: "Open questions about agent environments, context, replay, and reusable engineering.", url: "/ideas/" },
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
  emit("principles/index.html", articleRedirect(autonomyOverview)),
  emit("ideas/index.html", ideasPage()),
  emit("about/index.html", aboutPage()),
  emit("privacy/index.html", privacyPage()),
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
  writing.map((item, index) => emit(`${writingPath(item).slice(1)}index.html`, articlePage(item, "Writing", index, writing)))
);
await Promise.all(principleEssays.map((item, index) => emit(`${writingPath(item).slice(1)}index.html`, articlePage(item, "Writing", index, principleEssays))));
await Promise.all(notes.map((item, index) => emit(`notes/${item.slug}/index.html`, articlePage(item, "Note", index, notes))));
await Promise.all(allWriting.flatMap((item) => [...(item.aliases || []), ...(item.seriesNumber ? [item.slug] : [])].map((alias) => emit(`writing/${alias}/index.html`, articleRedirect(item)))));

await mkdir(join(out, "assets"), { recursive: true });
// Keep the original archive prose, URLs and code examples inside the current shell.
const archiveTopics = [
  ["Anti-patterns", "anti-patterns"], ["Design patterns", "design-patterns"],
  ["Architecture", "software-architecture"], ["Domain-driven design", "domain-driven-design"],
  ["Event sourcing", "event-sourcing"], ["Testing", "testing"],
  ["Operations", "operations"], ["Security", "security"]
];
async function renderArchive(directory, relative = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const rel = join(relative, entry.name);
    if (entry.isDirectory()) { await renderArchive(join(directory, entry.name), rel); continue; }
    if (!entry.name.endsWith(".html")) { await cp(join(directory, entry.name), join(out, rel)); continue; }
    const source = await readFile(join(directory, entry.name), "utf8");
    const title = source.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    const body = source.match(/<div class="content container">([\s\S]*)<\/div>\s*<\/body>/)?.[1];
    if (!title || body === undefined) throw new Error(`Cannot preserve archive page: ${rel}`);
    const path = `/${rel.replace(/index\.html$/, "")}`;
    const topicLinks = archiveTopics.map(([label, slug]) => `<a href="/${slug}/"${path === `/${slug}/` ? ' aria-current="page"' : ""}>${label}</a>`).join("");
    const content = `<main id="content"><article class="article"><header class="article-header shell-narrow"><a class="article-back" href="/writing/">${icon.arrow}<span>Current writing</span></a><div class="article-type">Earlier writing / Software engineering</div><h1>${escapeHtml(title)}</h1><p class="article-byline">By <a href="/about/" rel="author">${escapeHtml(site.author)}</a></p></header><nav class="archive-topics shell-narrow" aria-label="Earlier writing topics">${topicLinks}</nav><div class="prose legacy-prose" data-article-body>${body}</div></article></main>`;
    await emit(rel, layout({ title, description: `${title}. Earlier software engineering writing by Chaitanya Meesala.`, path, content, article: true }).replace(/^[ \t]+$/gm, ""));
  }
}
await renderArchive(join(root, "legacy"));
await cp(join(root, "assets"), join(out, "assets"), { recursive: true });
await cp(join(root, "lnr-code.ico"), join(out, "lnr-code.ico"));
await cp(join(root, "lnr-code.ico"), join(out, "favicon.ico"));
await Promise.all([
  cp(join(root, "src", "styles.css"), join(out, "assets", "styles.css")),
  cp(join(root, "src", "editorial.css"), join(out, "assets", "editorial.css")),
  cp(join(root, "src", "typography.css"), join(out, "assets", "typography.css")),
  cp(join(root, "src", "site.js"), join(out, "assets", "site.js")),
  cp(join(root, "src", "analytics.js"), join(out, "assets", "analytics.js")),
  cp(join(root, "src", "analytics-policy.js"), join(out, "assets", "analytics-policy.js")),
  cp(join(root, "src", "analytics-config.mjs"), join(out, "assets", "analytics-config.mjs")),
  cp(join(root, "src", "epistemics.js"), join(out, "assets", "epistemics.js")),
  cp(join(root, "src", "epistemics.css"), join(out, "assets", "epistemics.css")),
  cp(join(root, "src", "principles.js"), join(out, "assets", "principles.js")),
  cp(join(root, "src", "principles.css"), join(out, "assets", "principles.css")),
  cp(join(root, "src", "mark.svg"), join(out, "assets", "mark.svg"))
]);

console.log(`Built ${writing.length} writing entries, ${principleEssays.length} collection chapters, and ${notes.length} notes; preserved earlier URLs and site pages in ${out}`);

if (process.argv.includes("--publish-root")) {
  for (const retired of retiredPaths) await rm(join(root, retired), { recursive: true, force: true });
  for (const name of await readdir(out)) {
    await cp(join(out, name), join(root, name), { recursive: true });
  }
  console.log("Updated the static files published from the repository root.");
}
