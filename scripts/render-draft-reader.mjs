import { readFile, writeFile } from "node:fs/promises";
import { editorialDrafts } from "../src/editorial-drafts.mjs";
import { agencyWriting } from "../src/agency-writing.mjs";
import { writingPath } from "../src/paths.mjs";

const publishedEdition = process.argv.includes("--published");
const readerItems = publishedEdition ? agencyWriting : editorialDrafts;
const edition = publishedEdition ? "Published essays" : "Unpublished drafts";

const root = new URL("../", import.meta.url);
const escape = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const font = (await readFile(new URL("assets/fonts/ibm-plex-sans-latin-400-normal.woff2", root))).toString("base64");
const bold = (await readFile(new URL("assets/fonts/ibm-plex-sans-latin-600-normal.woff2", root))).toString("base64");
const italic = (await readFile(new URL("assets/fonts/ibm-plex-sans-latin-400-italic.woff2", root))).toString("base64");
const outcomes = [
  "Design progressive disclosure with a concrete folder hierarchy and useful indexes.",
  "Find the observation that would change the next action.",
  "Pair cases whose small differences justify different decisions.",
  "Expose a method’s assumptions and the evidence that would invalidate it.",
  "Design an experiment whose effects can be observed and recovered from.",
];
const sections = [];
for (const item of readerItems) {
  const page = await readFile(new URL(`${publishedEdition ? "dist" : "dist-drafts"}${writingPath(item)}index.html`, root), "utf8");
  const articleBody = page.match(/<!--article-prose:start-->([\s\S]*?)<!--article-prose:end-->/)?.[1];
  if (!articleBody) throw new Error(`Missing rendered draft body: ${item.slug}`);
  const body = articleBody.replace(/href="\/writing\/(?:how-intelligence-finds-its-way\/)?([^/]+)\/"/g, (_, slug) => readerItems.some((entry) => entry.slug === slug) ? `href="#${slug}"` : `href="https://oddly.fyi/writing/${slug}/"`);
  sections.push(`<article id="${item.slug}"><header><p class="kicker">${publishedEdition ? "ESSAY" : "DRAFT"} ${String(item.order).padStart(2, "0")} / ${escape(item.eyebrow)}</p><h2>${escape(item.title)}</h2><p class="deck">${escape(item.description)}</p><p class="meta">By Chaitanya · ${item.readTime} read · ${item.wordCount.toLocaleString()} words</p></header><div class="prose">${body}</div><a class="back" href="#proposal">Back to the reading order ↑</a></article>`);
}
const indexStyles = (await readFile(new URL("src/typography.css", root), "utf8")).match(/\.prose \.index-example \{[\s\S]*?\.prose \.index-example :focus-visible \{[^}]+\}/)?.[0] || "";
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Five essays for Oddly — ${edition}</title>
<style>
@font-face{font-family:Plex;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:Plex;src:url(data:font/woff2;base64,${bold}) format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:Plex;src:url(data:font/woff2;base64,${italic}) format('woff2');font-weight:400;font-style:italic;font-display:swap}
:root{color-scheme:light;--ink:#18212d;--muted:#5c6778;--line:#dce2e8;--accent:#4d4d91;--paper:#fbfcfe;--paper-deep:#f0f3f8;--ink-soft:#5c6778;--sans:Plex,Arial,sans-serif;--blue:#4d4d91;--header-height:0px}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#fbfcfe;color:var(--ink);font-family:Plex,Arial,sans-serif;font-size:19px;line-height:1.7}a{color:var(--accent);text-underline-offset:4px}a:focus-visible{outline:3px solid #7976c9;outline-offset:4px}.brand{max-width:1060px;margin:auto;padding:22px 28px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:20px;align-items:center}.brand strong{font-size:23px;letter-spacing:-.7px}.brand span{color:var(--muted);font-size:13px}.shell{max-width:1016px;padding:60px 28px 80px;margin:auto}.kicker{font-size:12px;line-height:1.5;letter-spacing:1.8px;font-weight:600;text-transform:uppercase;color:var(--accent);margin:0 0 18px}h1,h2{font-weight:600;line-height:1.12;letter-spacing:-1.6px;text-wrap:balance;margin:0 0 24px}h1{font-size:clamp(40px,6vw,66px);max-width:800px}h2{font-size:clamp(35px,5vw,54px)}.intro{max-width:740px;font-size:22px;line-height:1.6}.note{color:var(--muted);max-width:740px;font-size:16px}.contents{margin:40px 0 24px;padding:0;list-style:none;border-top:1px solid var(--line)}.contents li{display:grid;grid-template-columns:35px 1fr;gap:18px;padding:23px 0;border-bottom:1px solid var(--line)}.num{font-size:13px;color:var(--muted);padding-top:5px}.contents a{font-weight:600;font-size:22px;line-height:1.3;text-decoration:none;color:var(--ink)}.contents p{margin:6px 0 0;color:var(--muted);font-size:16px;line-height:1.5}article{max-width:740px;margin:0 auto;padding:78px 0;border-top:1px solid var(--line);scroll-margin-top:25px}article .deck{font-size:24px;line-height:1.45;color:var(--muted);margin:0 0 18px}.meta{font-size:14px;color:var(--muted);margin-bottom:40px}.prose p{margin:0 0 24px}.prose h2{font-size:30px;line-height:1.3;letter-spacing:-.7px;margin:44px 0 20px}.prose .heading-anchor{font-size:16px;margin-left:9px;text-decoration:none;color:var(--muted)}.prose strong{font-weight:600}.prose ul{padding-left:1.2em;margin:24px 0}.prose li{margin:8px 0}.prose code{font-family:inherit;font-size:.88em;overflow-wrap:anywhere}.prose .nested-outline{font-size:16px;line-height:1.6;padding-left:1.1em}.prose .nested-outline ul{margin:.35em 0 .6em;padding-left:1.15em;border-left:1px solid var(--line)}.prose .nested-outline code{font-weight:600}.prose pre.source-example{margin:24px 0;padding:18px 20px;border:1px solid var(--line);border-radius:8px;background:#f0f3f8;white-space:pre-wrap;overflow-wrap:anywhere;font:400 15px/1.65 Plex,Arial,sans-serif}.prose pre.source-example code{font:inherit}.prose a{overflow-wrap:anywhere}.back{font-size:15px;display:inline-block;margin-top:16px}footer{font-size:14px;color:var(--muted);border-top:1px solid var(--line);padding-top:24px}@media(max-width:600px){body{font-size:18px}.shell{padding:40px 22px 50px}.brand{padding:17px 22px}.brand span{font-size:11px}.intro{font-size:20px}article{padding:55px 0}article .deck{font-size:21px}.contents a{font-size:21px}}@media print{body{background:white;font-size:11pt}.shell{max-width:none;padding:0}.brand{padding:0 0 10px}.contents li{padding:9px 0}article{break-before:page;max-width:none;padding:20px 0}h1{font-size:32pt}h2{font-size:28pt}.back{display:none}.prose p{orphans:3;widows:3}a{color:inherit}.intro{font-size:13pt}.note,.contents p{font-size:10pt}}
${indexStyles}
</style></head><body><div class="brand"><strong>Oddly</strong><span>${edition} · October 3, 2026</span></div><main class="shell" id="proposal"><p class="kicker">${edition}</p><h1>How intelligence finds its way.</h1><p class="intro">Five connected essays on the environments intelligence can read, the questions it asks, the experience it carries, and the actions it can afford to try.</p><p class="note">Suggested reading order below. Each essay develops one idea through a concrete example and gives the reader a design practice to use. ${publishedEdition ? "Published in Oddly’s Writing section on October 3, 2026." : "Unpublished drafts for Oddly’s Writing section."}</p><ol class="contents">${readerItems.map((item, i) => `<li><span class="num">${String(i + 1).padStart(2, "0")}</span><div><a href="#${item.slug}">${escape(item.title)}</a><p>${escape(item.description)}</p><p>Reader takeaway: ${escape(outcomes[i])}</p></div></li>`).join("")}</ol><p class="note">Begin with the environment essay, then move through inquiry, experience, methods, and action. The pieces stand on their own and can be read separately. Research links are included where they support a specific claim. All scenarios are illustrative.</p>${sections.join("\n")}<footer>Oddly · By Chaitanya · ${edition}</footer></main></body></html>`;
const destination = new URL("drafts/2026-10-agency/reader.html", root);
await writeFile(destination, html);
console.log(`Wrote standalone draft reader: ${destination.pathname}`);
