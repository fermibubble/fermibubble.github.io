import { readingPaths, glossary } from "../src/reading-paths.mjs";
import { revisions } from "../src/legacy-revisions.mjs";
import { articlePractice } from "../src/article-practice.mjs";
import { enhancePublication } from "./enhance-publication.mjs";
import { evalOverview, evalWriting } from "../src/eval-writing.mjs";
import { qualityOverview, qualityWriting } from "../src/quality-writing.mjs";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ideas, ideaExperiments, notes, projects, site, writing as publishedWriting } from "../src/content.mjs";
import { renderIncident } from "./render-incident.mjs";
import { renderClassifierFigure } from "./render-classifier-figure.mjs";
import { autonomyOverview, principleEssays } from "../src/principle-series.mjs";
import { agencyOverview, agencyWriting } from "../src/agency-writing.mjs";
import { classifierOverview, classifierWriting } from "../src/classifier-writing.mjs";
import { renderCaseStudy, renderContextTable, renderSeriesMap, renderSeriesNavigation } from "./render-series.mjs";
import { autonomyPath, writingPath } from "../src/paths.mjs";
import { analyticsConfig } from "../src/analytics-config.mjs";
import { analyticsReady } from "../src/analytics-policy.js";

const draftPreview = process.argv.includes("--drafts");
if (draftPreview && process.argv.includes("--publish-root")) {
  throw new Error("Draft previews cannot be published. Review and promote individual essays first.");
}
const drafts = draftPreview ? (await import("../src/editorial-drafts.mjs")).editorialDrafts : [];
const writing = [...drafts, ...publishedWriting];
const allChapters = [...evalWriting, ...qualityWriting, ...principleEssays, ...agencyWriting, ...classifierWriting];
const allWriting = [...writing, ...allChapters];
const collections = {
  "how-to-write-and-score-an-agent-eval": { overview: evalOverview, essays: evalWriting, heading: "Three parts, nine chapters" },
  "quality-flywheel": { overview: qualityOverview, essays: qualityWriting, heading: "The chapters" },
  "classifiers-when-labels-become-decisions": { overview: classifierOverview, essays: classifierWriting, heading: "Ten ideas, from labels to decisions" },
  "trustworthy-autonomy": { overview: autonomyOverview, essays: principleEssays, heading: "Nine principles, nine chapters" },
  "how-intelligence-finds-its-way": { overview: agencyOverview, essays: agencyWriting, heading: "Five essays, one exploration" },
};
const seriesFor = (item) => collections[item.collectionSlug || ((item.seriesNumber || item.seriesOverview) ? "trustworthy-autonomy" : "")];
const noteItems = new Set(notes);
const publications = [...writing, ...notes].sort((a, b) => b.date.localeCompare(a.date));
const publicationPath = (item) => noteItems.has(item) ? `/notes/${item.slug}/` : writingPath(item);
const publicationTimestamp = (item) => item.publishedAt ?? `${item.date}T12:00:00Z`;
const publicationFormat = (item) => item.draft ? 'Draft' : noteItems.has(item) ? 'Short note' : item.seriesOverview ? 'Collection' : 'Essay';
const retiredPaths = [
  "writing/judgment-under-uncertainty",
  "writing/rollouts-are-decision-problems",
  "notes/why-agent-verifiers-fail",
  "notes/memory-should-accumulate-judgment",
  "notes/skills-arent-policies",
  "notes/what-does-good-mean-for-an-agent",
  "notes/context-vs-harness-engineering",
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, draftPreview ? "dist-drafts" : "dist");
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
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return text;
};

const indexExampleId = (path) => `example-${path.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`;

function renderIndexExample(source, path, knownPaths) {
  if (!path) throw new Error("An index example needs a file path");
  let title = "";
  const entries = [];
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#\s+(.+)$/);
    const entry = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\):\s*(.*)$/);
    if (heading) title = heading[1];
    else if (entry) entries.push({ title: entry[1], path: entry[2], description: entry[3] });
    else if (/^\s+/.test(raw) && entries.length) entries.at(-1).description += ` ${line}`;
    else throw new Error(`Unsupported index example line in ${path}: ${line}`);
  }
  if (!title || !entries.length) throw new Error(`Incomplete index example: ${path}`);
  const id = indexExampleId(path);
  return `<section class="index-example" id="${id}" aria-labelledby="${id}-title">
    <header><span class="index-file">${escapeHtml(path)}</span><h3 id="${id}-title">${escapeHtml(title)}</h3></header>
    <ul class="index-entries">${entries.map((entry) => {
      const target = join(dirname(path), entry.path);
      const label = knownPaths.has(target)
        ? `<a href="#${indexExampleId(target)}">${escapeHtml(entry.title)}</a>`
        : `<strong>${escapeHtml(entry.title)}</strong>`;
      return `<li><div class="index-entry-head">${label}<span class="index-entry-path">${escapeHtml(entry.path)}</span></div><p>${escapeHtml(entry.description)}</p></li>`;
    }).join("")}</ul>
    <details class="index-source"><summary>View Markdown source</summary><pre class="source-example"><code>${escapeHtml(source)}</code></pre></details>
  </section>`;
}

function markdown(source = "") {
  const lines = source.trim().split("\n");
  const html = [];
  let paragraph = [];
  let list = null;
  let quote = [];
  let fence = null;
  let code = [];
  const indexPaths = new Set([...source.matchAll(/^```index-example ([^\n]+)$/gm)].map((match) => match[1].trim()));

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const roots = [];
    const stack = [{ indent: -1, children: roots }];
    for (const item of list.items) {
      while (stack.length > 1 && item.indent <= stack.at(-1).indent) stack.pop();
      const node = { ...item, children: [] };
      stack.at(-1).children.push(node);
      stack.push(node);
    }
    const renderItems = (items) => `<${list.type}>${items.map((item) => `<li>${inline(item.text)}${item.children.length ? renderItems(item.children) : ""}</li>`).join("")}</${list.type}>`;
    const rendered = renderItems(roots);
    html.push(roots.some((item) => item.children.length)
      ? rendered.replace(`<${list.type}>`, `<${list.type} class="nested-outline">`)
      : rendered);
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
    if (fence !== null) {
      if (line === "```") {
        html.push(fence.language === "index-example"
          ? renderIndexExample(code.join("\n"), fence.label, indexPaths)
          : fence.language === "classifier-figure"
          ? renderClassifierFigure(code.join("\n"), escapeHtml)
          : `<pre class="source-example"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        fence = null;
        code = [];
      } else {
        code.push(raw);
      }
      continue;
    }
    const openingFence = line.match(/^```([a-z0-9_-]*)(?:\s+(.+))?$/i);
    if (openingFence) {
      flushAll();
      fence = { language: openingFence[1], label: openingFence[2] || "" };
      continue;
    }
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
      list.items.push({ text: unordered[1], indent: raw.length - raw.trimStart().length });
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
      list.items.push({ text: ordered[1], indent: raw.length - raw.trimStart().length });
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  if (fence !== null) throw new Error("Unclosed Markdown code fence");
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
  ["Start here", "/start/", "start"],
  ["Writing", "/writing/", "writing"],
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
          <input type="search" autocomplete="off" placeholder="Search articles, concepts, and examples…" aria-describedby="search-status" aria-label="Search" data-search-input>
          <button type="button" data-search-close aria-label="Close search">Esc</button>
        </div>
        <p id="search-status" class="search-status" role="status" aria-live="polite" data-search-status>Search titles, article text, and concepts.</p>
        <div class="search-results" data-search-results>
          <p class="search-hint">Start typing to search the writing.</p>
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
          <a href="/follow/">Follow via RSS</a>
          <a href="/changes/">Revisions</a>
          <a href="/about/">About</a>
          <a href="/privacy/">Privacy</a>
          <button type="button" data-analytics-settings hidden>Analytics preferences</button>
        </div>
        <p class="footer-edition">Independent writing<br>© 2026</p>
      </div>
    </footer>`;
}

function layout({ title, description, active, content, article = false, incident = false, series = false, path = "/" }) {
  const evalGuide = path.startsWith("/writing/how-to-write-and-score-an-agent-eval/");
  const quality = path.startsWith("/writing/quality-flywheel/");
  const agentArchitecture = path === "/writing/before-you-build-another-agent/";
  const pageTitle = title ? `${title} — ${site.name}` : site.title;
  const typography = article
    ? path.startsWith('/notes/') ? 'note' : path.startsWith('/writing/trustworthy-autonomy/') ? 'principle' : path.startsWith('/writing/') ? 'essay' : 'archive'
    : ({ '/': 'home', '/writing/': 'writing', '/notes/': 'notes', '/projects/': 'focus', '/ideas/': 'ideas', '/about/': 'about' }[path] || 'utility');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description || site.description)}">
    <meta name="author" content="${escapeHtml(site.author)}">${draftPreview ? '\n    <meta name="robots" content="noindex, nofollow">' : ""}
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
    <link rel="stylesheet" href="/assets/diagram.css">${agentArchitecture ? '\n    <link rel="stylesheet" href="/assets/agent-architecture.css">\n    <script type="module" src="/assets/agent-delegation.js"></script>' : ""}
    <link rel="stylesheet" href="/assets/typography.css?v=20261003-collections">${quality ? '\n    <link rel="stylesheet" href="/assets/quality.css?v=20261004-revision">\n    <script type="module" src="/assets/quality.js"></script>' : ""}
    <script>try{const t=localStorage.getItem('cm-theme');if(t)document.documentElement.dataset.theme=t;else if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}</script>
    ${evalGuide ? '<link rel="stylesheet" href="/assets/eval-writing.css">\n    <script type="module" src="/assets/eval-scores.js"></script>\n    ' : ""}<script type="module" src="/assets/site.js"></script>${incident ? '\n    <script type="module" src="/assets/epistemics.js"></script>' : ""}${series ? '\n    <script type="module" src="/assets/principles.js"></script>' : ""}
    ${draftPreview ? "" : '<script type="module" src="/assets/analytics.js"></script>'}
  </head>
  <body data-path="${escapeHtml(path)}" data-typography="${typography}"${article ? ' class="article-page"' : ""}>
    ${article ? '<div class="reading-progress" data-reading-progress></div>' : ""}
    ${header(active)}
    ${content}
    ${footer()}
    ${path === "/search/" ? "" : searchDialog()}
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
    <div class="card-meta"><span>${article.seriesOverview ? `${seriesFor(article).essays.reduce((sum, chapter) => sum + parseInt(chapter.readTime), 0)} min collection` : article.readTime}</span><span class="circle-arrow">${icon.arrow}</span></div>
  </article>`;
}

function homePage() {
  const recentWriting = publications.slice(0, 5);
  const content = `
    <main id="content">
      <section class="hero shell">
        <div class="hero-kicker reveal"><span class="signal-dot"></span> By ${escapeHtml(site.author)} · Systems engineering</div>
        <div class="hero-grid">
          <div class="hero-copy reveal reveal-delay-1">
            <h1>${escapeHtml(site.statement)}</h1>
            <p>${escapeHtml(site.intro)}</p>
            ${arrowLink("Find your starting point", "/start/", "primary-link")}
          </div>
          <aside class="home-directory reveal reveal-delay-2" aria-label="Explore the work">
            <p class="directory-label">WHAT ARE YOU WORKING ON?</p>
            ${readingPaths.map((route, i) => `<a href="/start/#${route.id}"><span>0${i+1}</span><div><strong>${route.title}</strong><small>${route.outcome}</small></div></a>`).join('')}
          </aside>
        </div>
        <div class="hero-index reveal reveal-delay-3">
          <span>Agent infrastructure</span><span>Local context</span><span>Observability</span><span>Reproducible evaluation</span>
        </div>
      </section>

      <section class="section shell featured-section">
        <div class="section-heading">
          <div><span class="section-index">01</span><h2>Start with these</h2></div>
          ${arrowLink("All writing", "/writing/")}
        </div>
        <div class="feature-grid">
          ${["how-to-write-and-score-an-agent-eval", "trustworthy-autonomy", "implementing-progressive-disclosure-for-agent-tools"].map(slug => writing.find(item => item.slug === slug)).map(featureCard).join("")}
        </div>
      </section>

      <section class="section shell notes-section">
        <div class="section-heading">
          <div><span class="section-index">02</span><h2>Recent writing</h2></div>
          ${arrowLink("All writing", "/writing/")}
        </div>
        <div class="notes-table">
          ${recentWriting
            .map(
              (item) => `<a class="note-row" href="${publicationPath(item)}">
                <span class="recent-meta"><time datetime="${item.date}">${item.displayDate.replace(", 2026", "")}</time><span class="publication-kind">${publicationFormat(item)}</span></span>
                <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span>
                <span class="note-time">${item.seriesOverview ? `${seriesFor(item).essays.reduce((sum, chapter) => sum + parseInt(chapter.readTime), 0)} min collection` : item.readTime}</span>
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
  const count = `${writing.filter(item => !item.seriesOverview).length} essays · ${writing.filter(item => item.seriesOverview).length} collections`;
  const content = `<main id="content">
    ${pageIntro("Essays & collections", "Writing", "Architecture, experiments, and useful distinctions from building autonomous agents, context systems, and reproducible evaluation.", count)}
    <div class="shell browse-tools"><a href="/start/">Choose a reading path</a><a href="/start/#glossary">Browse the glossary</a><a href="/search/">Search all articles</a><a href="/toolkit/">Runnable examples</a></div>
    <section class="shell archive-list" aria-label="All writing">
      ${publications
        .map(
          (item, i) => `<article class="archive-item">
            <a class="archive-link" href="${publicationPath(item)}" aria-label="Read ${escapeHtml(item.title)}"></a>
            <div class="archive-index">${String(i + 1).padStart(2,"0")}</div>
            <div class="archive-main"><div class="archive-eyebrow">${item.seriesOverview ? `Collection · ${seriesFor(item).essays.length} ${seriesFor(item).overview.seriesUnit || "chapter"}s` : noteItems.has(item) ? "Short note" : `Essay · ${escapeHtml(item.eyebrow)}`}</div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p></div>
            <div class="archive-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.seriesOverview ? `${seriesFor(item).essays.reduce((sum, chapter) => sum + parseInt(chapter.readTime), 0)} min · complete collection` : item.readTime}</span><span class="circle-arrow">${icon.arrow}</span></div>
          </article>`
        )
        .join("")}
    </section>
  </main>`;
  return layout({ title: "Writing", description: "Essays and collections on autonomous agents, context systems, and evaluation.", active: "writing", content, path: "/writing/" });
}

function notesPage() {
  const content = `<main id="content" class="not-found shell"><h1>Writing</h1><p>Essays and collections.</p>${arrowLink("All writing", "/writing/", "primary-link")}</main>`;
  return layout({ title: "Writing", active: "writing", content, path: "/writing/" })
    .replace("<head>", '<head>\n    <meta http-equiv="refresh" content="0; url=/writing/">');
}

function projectsPage() {
  const content = `<main id="content">
    <div class="shell browse-tools"><a href="/start/">Build, Evaluate, Improve: choose a reading route</a><a href="/toolkit/">Try the examples</a></div>
    ${pageIntro("Areas of work", "Focus", "Three routes through the work: build a bounded system, evaluate its decisions, and improve it through experiments.", `${projects.length} themes`)}
    <section class="shell project-list">
      ${projects
        .map(
          (project) => `<article class="project-item">
            <div class="project-side"><span>${project.index}</span><span class="status"><i></i>${escapeHtml(project.status)}</span></div>
            <div class="project-main"><span class="project-label">${escapeHtml(project.label)}</span><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p>
              <div class="project-questions"><h3>Questions I return to</h3><ul>${project.questions.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul></div>
              ${arrowLink(escapeHtml(project.reading.title), project.reading.href)}<ul class="focus-reading">${project.links.map(([title, href]) => `<li><a href="${href}">${escapeHtml(title)}</a></li>`).join("")}</ul>
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
      ${ideas.map((idea, i) => `<article><span>${String(i + 1).padStart(2, "0")}</span><div class="idea-content"><p>${escapeHtml(idea)}</p><details><summary>Proposed test · not yet measured</summary><p>${escapeHtml(ideaExperiments[i])}</p></details></div><div aria-hidden="true">?</div></article>`).join("")}
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
        <p>I’m drawn to how intelligence takes shape in systems: how they make sense of the world, carry experience forward, and turn understanding into action. My work sits between engineering and philosophy, exploring how context, memory, and judgment come together—and what changes when a system can act on its own.</p>
        <p>Oddly is where I consolidate the architecture and lessons behind that work. The essays examine concrete designs and their tradeoffs. Trustworthy Autonomy develops the principles of evidence, authority, and accountability within that broader systems perspective.</p>
        <p><a href="https://github.com/fermibubble">Find me on GitHub</a>. The <a href="https://github.com/fermibubble/fermibubble.github.io">site source</a> and its <a href="/toolkit/">runnable examples</a> are public. For a correction, <a href="https://github.com/fermibubble/fermibubble.github.io/issues/new">open an issue</a> with the article URL, disputed claim, and supporting evidence.</p>
        <p>Examples are labeled as illustrative when they are constructed. Passing a fixture test establishes that fixture’s behavior; it does not establish a model’s real-world reliability. <a href="/changes/">Substantive revisions</a> remain visible.</p>
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

function articlePage(item) {
  if (!item.seriesOverview && articlePractice[item.slug]) item = { ...item, afterwordHtml: (item.afterwordHtml ?? markdown(item.afterword)) + articlePractice[item.slug] };
  const active = "writing";
  const base = "writing";
  const type = publicationFormat(item);
  const index = publications.findIndex(entry => entry.slug === item.slug);
  const collection = publications;
  const series = !!(item.seriesNumber || item.seriesOverview);
  const seriesData = seriesFor(item);
  const seriesTitle = seriesData?.overview.title;
  const seriesPath = seriesData ? writingPath(seriesData.overview) : null;
  const chapterCount = seriesData?.essays.length;
  const seriesUnit = seriesData?.overview.seriesUnit || "chapter";
  const unitLabel = seriesUnit[0].toUpperCase() + seriesUnit.slice(1);
  const enhanced = series || !!item.interactiveEssay;
  const pathFor = publicationPath;
  const next = item.seriesNumber ? seriesData.essays[item.seriesNumber] : collection[index + 1];
  const previous = item.seriesNumber ? seriesData.essays[item.seriesNumber - 2] : collection[index - 1];
  const content = `<main id="content">
    <article class="article${item.incident ? " article-epistemics" : ""}${enhanced ? " principle-article" : ""}${item.interactiveEssay ? " technical-article" : ""}">
      <header class="article-header shell-narrow">
        <a class="article-back" href="${item.seriesNumber ? seriesPath : `/${base}/`}">${icon.arrow}<span>${item.seriesNumber ? escapeHtml(seriesTitle) : `All ${base}`}</span></a>
        <div class="article-type">${item.seriesNumber ? `${escapeHtml(seriesTitle)} / ${unitLabel} ${String(item.seriesNumber).padStart(2,"0")} of ${String(chapterCount).padStart(2,"0")}` : item.seriesOverview ? `Collection / ${chapterCount} ${seriesUnit}s` : item.interactiveEssay ? escapeHtml(item.eyebrow) : `${escapeHtml(type)}${item.eyebrow ? ` · ${escapeHtml(item.eyebrow)}` : ""}`}</div>
        <h1>${item.titleLines ? `${escapeHtml(item.titleLines[0])}<br><em>${escapeHtml(item.titleLines[1])}</em>` : escapeHtml(item.title)}</h1>
        <p class="article-deck">${escapeHtml(item.description)}</p>
        <p class="article-byline">By <a href="/about/" rel="author">${escapeHtml(site.author)}</a></p>
        <div class="article-meta"><time datetime="${item.date}">${item.displayDate}</time><span>${item.seriesOverview ? `${seriesData.essays.reduce((sum, chapter) => sum + parseInt(chapter.readTime), 0)} min · complete collection` : `${item.readTime} read`}</span><button type="button" data-copy-link>${icon.copy}<span>Copy link</span></button></div>${item.seriesNumber ? `\n        <a class="series-home-link" href="${seriesPath}">Part of ${escapeHtml(seriesTitle)} ↗</a>` : ""}
      </header>
      <div class="article-rule shell"></div>
      ${enhanced ? `<div class="series-body${item.incident ? " epistemics-body" : ""}" data-article-body>${item.seriesNumber ? `\n        ${renderSeriesNavigation(item, seriesData.essays, escapeHtml, seriesUnit)}` : ""}
        <div class="prose${item.incident ? " epistemics-intro" : ""}"><!--article-prose:start-->${item.bodyHtml ?? markdown(item.body)}<!--article-prose:end--></div>${item.contextTable ? `\n        ${renderContextTable(item.contextTable, escapeHtml)}` : ""}
        ${item.incident ? renderIncident(item.incident, escapeHtml) : item.caseStudy ? renderCaseStudy(item.caseStudy, escapeHtml) : item.seriesOverview ? renderSeriesMap(seriesData.essays, escapeHtml, undefined, { title: seriesTitle, heading: seriesData.heading, unit: seriesUnit }) : ""}
        <div class="prose series-afterword${item.incident ? " epistemics-afterword" : ""}">${item.afterwordHtml ?? markdown(item.afterword)}</div>
      </div>` : item.incident ? `<div class="epistemics-body" data-article-body>
        <div class="prose epistemics-intro"><!--article-prose:start-->${item.bodyHtml ?? markdown(item.body)}<!--article-prose:end--></div>
        ${renderIncident(item.incident, escapeHtml)}
        <div class="prose epistemics-afterword">${item.afterwordHtml ?? markdown(item.afterword)}</div>
      </div>` : `<div class="article-layout shell">
        <aside class="article-rail"><span>${noteItems.has(item) ? "Short note" : escapeHtml(item.eyebrow || publicationFormat(item))}</span><div class="rail-line"></div><span>${item.date.slice(0, 4)}</span></aside>
        <div class="prose" data-article-body><!--article-prose:start-->${item.bodyHtml ?? markdown(item.body)}<!--article-prose:end-->${articlePractice[item.slug] || ""}</div>
      </div>`}
    </article>
    <nav class="article-pagination shell" aria-label="More ${base}">
      ${previous ? `<a class="pagination-prev" href="${pathFor(previous)}"><span>Previous${item.seriesNumber ? ` ${seriesUnit}` : ""}</span><strong>${escapeHtml(previous.title)}</strong></a>` : item.seriesNumber ? `<a class="pagination-prev" href="${seriesPath}"><span>Collection overview</span><strong>${escapeHtml(seriesTitle)}</strong></a>` : "<span></span>"}
      ${next ? `<a class="pagination-next" href="${pathFor(next)}"><span>Next${item.seriesNumber ? ` ${seriesUnit}` : ""}</span><strong>${escapeHtml(next.title)}</strong></a>` : item.seriesNumber ? `<a class="pagination-next" href="${seriesPath}"><span>Back to the collection</span><strong>${escapeHtml(seriesTitle)}</strong></a>` : `<a class="pagination-next" href="/${base}/"><span>Continue</span><strong>All writing</strong></a>`}
    </nav>
  </main>`;
  return layout({ title: item.title, description: item.description, active, content, article: true, incident: !!item.incident, series: enhanced, path: pathFor(item) });
}

function utilityPages() {
  const wrap = (title, description, body) => `<main id="content">${pageIntro('Oddly / Field guide', title, description)}<div class="utility-body shell-narrow prose">${body}</div></main>`;
  return [
    { path: '/start/', title: 'Start here', active: 'start', description: 'Three reading paths through agent architecture, evaluation, and improvement.', content: wrap('Start with your problem', 'Read one useful piece now. Follow a path when you need the whole system.', `${readingPaths.map(route => `<section class="reading-route" id="${route.id}"><h2>${route.title}</h2><p>${route.outcome}</p><ol>${route.links.map(([title, href, note]) => `<li><a href="${href}">${title}</a><p>${note}</p></li>`).join('')}</ol></section>`).join('')}<h2 id="glossary">A small working glossary</h2><dl class="glossary">${glossary.map(([term, meaning, href]) => `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(meaning)} <a href="${href}">Read more</a></dd>`).join('')}</dl>`) },
    { path: '/follow/', title: 'Follow Oddly', description: 'New essays in your feed reader, without an account.', content: wrap('Keep the thread', 'New essays and collections, delivered through RSS.', '<p>Add <a href="/rss.xml">https://oddly.fyi/rss.xml</a> to your feed reader. Prefer Atom? Use <a href="/atom.xml">the Atom feed</a>.</p><p>The feed lists new essays and collection releases. Small edits do not republish old entries. For corrections and companion updates, see <a href="/changes/">the revision log</a>.</p><p>No account or email address is required. You can also bookmark <a href="/writing/">the writing index</a> or follow <a href="https://github.com/fermibubble/fermibubble.github.io">the public repository</a>.</p>') },
    { path: '/changes/', title: 'Revisions and corrections', description: 'Substantive changes to Oddly articles and examples.', content: wrap('Revisions & corrections', 'Keep the argument inspectable as the work changes.', '<h2>October 19, 2026</h2><ul><li>Rewrote the eight earlier anti-pattern articles: corrected Java examples, separated polling from spinning, qualified negative caching, removed an unreliable quote attribution, and made authorization and cleanup semantics explicit.</li><li>Added article-specific implementation contracts and failure checks throughout the current writing, with runnable boundary and measurement examples in the <a href="/toolkit/">toolkit</a>.</li><li>Clarified that harness experiments, release examples, and classifier datasets are illustrative. The accompanying fixtures do not measure model reliability.</li><li>Added full-text search, three reading routes, complete collection durations, a glossary, and accessible section navigation.</li><li>Added canonical sitemap, article metadata, sharing images, and visible revision dates while preserving original publication dates.</li></ul><h2>Report a correction</h2><p><a href="https://github.com/fermibubble/fermibubble.github.io/issues/new">Open an issue</a> with the page, claim, and evidence. Source history preserves earlier versions.</p>') },
    { path: '/toolkit/', title: 'Runnable examples', description: 'Small reproducible contracts for agent systems, evaluation, and Java examples.', content: wrap('Try the idea', 'Small examples with explicit boundaries. Download, run, change one assumption.', '<h2>Engineering workbench</h2><p><a href="/assets/downloads/oddly-workbench.zip">Download the workbench</a> · Python 3.10+ standard library; Java examples require JDK 17+.</p><pre><code>python -m unittest -v\npython workbench.py\njava LegacyExamples.java</code></pre><p>Run these commands from the extracted folder. The Python suite tests replay availability, stale ownership, evidence coverage, hierarchical labels, prevalence, and paired uncertainty. The Java program checks the corrected collection, prime-number, queue, cleanup, and authorization examples.</p><p>The report is deterministic for the supplied illustrative data. It includes raw paired outcomes and an adapter experiment that demonstrates why dropping warnings can hide failures. These are engineering fixtures, not a benchmark of any language model.</p><h2>Evaluation authoring</h2><p><a href="/assets/downloads/eval-authoring-companion.zip">Download the eval companion</a> for scoring contracts, example judgments, and validation. Read <a href="/writing/how-to-write-and-score-an-agent-eval/">the guide</a> before changing weights.</p><h2>Progressive disclosure</h2><p><a href="/assets/downloads/progressive-disclosure-fixture.zip">Download the SQL/MCP fixture</a>. It exercises discovery and incomplete coverage with a controlled fixture. It does not implement a production MCP transport or SQL sandbox.</p><h2>Source and limitations</h2><p>Every workbench function is deliberately small enough to inspect. In-memory ownership checks need database transactions in production; replay does not simulate alternate interventions; a synthetic confidence interval says nothing about your deployment until you supply representative paired outcomes. See the included README for commands, expected outputs, and extension points.</p>') },
    { path: '/search/', title: 'Search', description: 'Search the full Oddly archive.', content: `<main id="content">${pageIntro('Find an idea', 'Search the writing', 'Search the full text, including examples and earlier articles.')}<section class="shell-narrow search-page" data-search-page><label for="page-query">Words or concepts</label><input id="page-query" type="search" data-search-input aria-describedby="search-status"><p id="search-status" role="status" aria-live="polite" data-search-status>Loading search…</p><div data-search-results></div><noscript><p>Search needs JavaScript. Browse <a href="/writing/">all writing</a> or the <a href="/start/#glossary">glossary</a>.</p></noscript></section></main>` }
  ];
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
    ...publications.map((item) => ({ type: publicationFormat(item), title: item.title, description: item.description, url: publicationPath(item) })),
    ...allChapters.map((item) => ({ type: seriesFor(item).overview.seriesUnit === "part" ? "Part" : "Chapter", title: item.title, description: `${seriesFor(item).overview.title} · ${item.description}`, url: writingPath(item) })),
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
      return `<item><title>${escapeHtml(item.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(publicationTimestamp(item)).toUTCString()}</pubDate><description>${escapeHtml(item.description)}</description></item>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(site.name)}</title><link>${siteOrigin}/</link><description>${escapeHtml(site.description)}</description>${items}</channel></rss>`;
}

function atom() {
  const articles = [...writing, ...notes].sort((a, b) => b.date.localeCompare(a.date));
  const entries = articles.map((item) => {
    const base = writing.includes(item) ? "writing" : "notes";
    const url = escapeHtml(absoluteUrl(`/${base}/${item.slug}/`));
    return `<entry><title>${escapeHtml(item.title)}</title><id>${url}</id><link href="${url}"/><updated>${publicationTimestamp(item)}</updated><summary>${escapeHtml(item.description)}</summary></entry>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeHtml(site.name)}</title><id>${siteOrigin}/</id><link href="${siteOrigin}/"/><link rel="self" href="${siteOrigin}/atom.xml"/><updated>${publicationTimestamp(articles[0])}</updated><author><name>${escapeHtml(site.author)}</name></author>${entries}</feed>`;
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await Promise.all([
  emit("index.html", homePage()),
  emit("writing/index.html", writingPage()),
  ...utilityPages().map(page => emit(`${page.path.slice(1)}index.html`, layout(page))),
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
  emit("robots.txt", draftPreview ? "User-agent: *\nDisallow: /\n" : "User-agent: *\nAllow: /\n")
]);

await Promise.all(publications.map((item) => emit(`${publicationPath(item).slice(1)}index.html`, articlePage(item))));
await Promise.all(allChapters.map((item) => emit(`${writingPath(item).slice(1)}index.html`, articlePage(item))));
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
    let title = source.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    let body = source.match(/<div class="content container">([\s\S]*)<\/div>\s*<\/body>/)?.[1];
    if (!title || body === undefined) throw new Error(`Cannot preserve archive page: ${rel}`);
    const path = `/${rel.replace(/index\.html$/, "")}`;
    const revision = revisions[path];
    if (revision) { title = revision.title; body = revision.body; }
    if (archiveTopics.some(([, slug]) => path === `/${slug}/`) && path !== '/anti-patterns/') {
      body = `<p>This earlier topic now connects to the agent systems writing. These are useful places to continue:</p><ul>${readingPaths.flatMap(route => route.links).filter((_, i) => [0,2,3,4,5].includes(i)).map(([title, href, description]) => `<li><a href="${href}">${escapeHtml(title)}</a> — ${escapeHtml(description)}</li>`).join('')}</ul>`;
    }
    body = body.replaceAll("Action a a Distance", "Action at a Distance");
    const topicLinks = archiveTopics.map(([label, slug]) => `<a href="/${slug}/"${path === `/${slug}/` ? ' aria-current="page"' : ""}>${label}</a>`).join("");
    const content = `<main id="content"><article class="article"><header class="article-header shell-narrow"><a class="article-back" href="/writing/">${icon.arrow}<span>Current writing</span></a><div class="article-type">Earlier writing / Software engineering</div><h1>${escapeHtml(title)}</h1><p class="article-byline">By <a href="/about/" rel="author">${escapeHtml(site.author)}</a></p></header><nav class="archive-topics shell-narrow" aria-label="Earlier writing topics">${topicLinks}</nav><div class="prose legacy-prose" data-article-body>${revision ? '<p class="revision-note">Revised October 19, 2026. <a href="/changes/">What changed</a></p>' : ""}${body}</div></article></main>`;
    await emit(rel, layout({ title, description: `${title}. Earlier software engineering writing by Chaitanya Meesala.`, path, content, article: true }).replace(/^[ \t]+$/gm, ""));
  }
}
await renderArchive(join(root, "legacy"));
await cp(join(root, "assets"), join(out, "assets"), { recursive: true });
await cp(join(root, "lnr-code.ico"), join(out, "lnr-code.ico"));
await cp(join(root, "lnr-code.ico"), join(out, "favicon.ico"));
await Promise.all([
  cp(join(root, "src", "diagram.css"), join(out, "assets", "diagram.css")),
  cp(join(root, "src", "agent-architecture.css"), join(out, "assets", "agent-architecture.css")),
  cp(join(root, "src", "agent-delegation.js"), join(out, "assets", "agent-delegation.js")),
  cp(join(root, "src", "eval-writing.css"), join(out, "assets", "eval-writing.css")),
  cp(join(root, "src", "eval-scores.js"), join(out, "assets", "eval-scores.js")),
  cp(join(root, "src", "quality.css"), join(out, "assets", "quality.css")),
  cp(join(root, "src", "quality.js"), join(out, "assets", "quality.js")),
  cp(join(root, "src", "styles.css"), join(out, "assets", "styles.css")),
  cp(join(root, "src", "editorial.css"), join(out, "assets", "editorial.css")),
  cp(join(root, "src", "typography.css"), join(out, "assets", "typography.css")),
  cp(join(root, "src", "search.js"), join(out, "assets", "search.js")),
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

await enhancePublication(out, allWriting, collections);

console.log(`Built ${writing.length} writing entries, ${allChapters.length} collection chapters, and ${notes.length} notes; preserved earlier URLs and site pages in ${out}`);

if (process.argv.includes("--publish-root")) {
  for (const retired of retiredPaths) await rm(join(root, retired), { recursive: true, force: true });
  for (const name of await readdir(out)) {
    await cp(join(out, name), join(root, name), { recursive: true });
  }
  console.log("Updated the static files published from the repository root.");
}
